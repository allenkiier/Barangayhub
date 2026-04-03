import React, { useEffect, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Grid, Box, CircularProgress,
  Typography, MenuItem, Snackbar, Alert
} from "@mui/material";

const BrgyIDRequest = ({ open, onClose, serviceName }) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [appType, setAppType] = useState("New");

  const [userid, setUserid] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const [formData, setFormData] = useState({
    name: "",
    sex: "",
    birthdate: "",
    birthplace: "",
    house_no: "",
    street: "",
    barangay: "",
    municipality: "",
    province: "",
    weight: "",
    height: "",
    blood_type: "",
    contact_person: "",
    contact_person_no: ""
  });

  // ================= GET USER =================
  useEffect(() => {
    if (open) {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const uid = storedUser?.userid;

      if (!uid) {
        setSnackbar({
          open: true,
          message: "User not logged in",
          severity: "error"
        });
        return;
      }

      setUserid(uid);
      setLoading(true);

      fetch(`http://localhost:3001/api/user/${uid}`)
        .then(res => res.json())
        .then(data => {
          setFormData(prev => ({
            ...prev,
            name: data.user_name,
            sex: data.sex,
            birthdate: data.birthdate,
            birthplace: data.birthplace,
            house_no: data.house_no,
            street: data.street,
            barangay: data.barangay,
            municipality: data.municipality,
            province: data.province
          }));
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
          setSnackbar({
            open: true,
            message: "Failed to load user data",
            severity: "error"
          });
        });
    }
  }, [open]);

  // ================= INPUT =================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    if (!userid) {
      setSnackbar({ open: true, message: "Missing user ID", severity: "error" });
      return;
    }

    if (!appType) {
      setSnackbar({ open: true, message: "Please select application type", severity: "warning" });
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("http://localhost:3001/api/brgyid/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userid,
          app_type: appType,
          weight: formData.weight,
          height: formData.height,
          blood_type: formData.blood_type,
          contact_person: formData.contact_person,
          contact_person_no: formData.contact_person_no
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSnackbar({
        open: true,
        message: `Submitted! Transaction ID: ${data.transaction_id}`,
        severity: "success"
      });

      onClose();

    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: err.message,
        severity: "error"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle>{serviceName || "Barangay ID Request"}</DialogTitle>

        <DialogContent>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={2} sx={{ display: "flex", flexDirection: "column", marginTop: 2 }}>

              <Grid item xs={12}>
                <TextField
                  select
                  sx={{ width: "40%" }}
                  label="Application Type"
                  value={appType}
                  onChange={(e) => setAppType(e.target.value)}
                >
                  <MenuItem value="New">New</MenuItem>
                  <MenuItem value="Renew">Renew</MenuItem>
                  <MenuItem value="Reissuance">Reissuance (lost or damaged)</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField label="Full Name" value={formData.name} InputProps={{ readOnly: true }} />
              </Grid>

              <Grid item xs={12} sx={{ display: "flex", gap: 3 }}>
                <TextField label="Sex" value={formData.sex} InputProps={{ readOnly: true }} />
                <TextField label="Birthdate" value={formData.birthdate} InputProps={{ readOnly: true }} />
                <TextField label="Birthplace" value={formData.birthplace} InputProps={{ readOnly: true }} />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2">Fill-Ups</Typography>
              </Grid>

              <Grid item xs={12} sx={{ display: "flex", gap: 3 }}>
                <TextField name="weight" label="Weight" value={formData.weight} onChange={handleChange} />
                <TextField name="height" label="Height" value={formData.height} onChange={handleChange} />
                <TextField name="blood_type" label="Blood Type" value={formData.blood_type} onChange={handleChange} />
              </Grid>

              <Grid item xs={12} sx={{ display: "flex", gap: 3 }}>
                <TextField name="contact_person" label="Contact Person" value={formData.contact_person} onChange={handleChange} />
                <TextField name="contact_person_no" label="Contact No." value={formData.contact_person_no} onChange={handleChange} />
              </Grid>

            </Grid>
          )}
        </DialogContent>

        <DialogActions sx={{ marginBottom: 2, marginRight: 3 }}>
          <Button onClick={onClose} sx={{ color: "#060745" }}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{ background: "#060745" }}
            disabled={loading || submitting}
          >
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default BrgyIDRequest;