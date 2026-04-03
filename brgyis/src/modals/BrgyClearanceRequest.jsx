import React, { useEffect, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Grid, Box, CircularProgress, MenuItem,
  Snackbar, Alert
} from "@mui/material";

const BrgyClearanceRequest = ({ open, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [userid, setUserid] = useState(null);
  const [purpose, setPurpose] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    sex: "",
    birthdate: "",
    birthplace: "",
    house_no: "",
    street: "",
    barangay: "",
    municipality: "",
    province: ""
  });

  // ✅ Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
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
          setFormData({
            name: data.user_name,
            sex: data.sex,
            birthdate: data.birthdate,
            birthplace: data.birthplace,
            house_no: data.house_no,
            street: data.street,
            barangay: data.barangay,
            municipality: data.municipality,
            province: data.province
          });
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setSnackbar({
            open: true,
            message: "Failed to fetch user data",
            severity: "error"
          });
          setLoading(false);
        });
    }
  }, [open]);

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    if (!userid) {
      setSnackbar({
        open: true,
        message: "Missing user ID",
        severity: "error"
      });
      return;
    }

    if (!purpose) {
      setSnackbar({
        open: true,
        message: "Please select a purpose",
        severity: "warning"
      });
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("http://localhost:3001/api/brgy-clearance/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userid,
          purpose
        })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setSnackbar({
        open: true,
        message: "Request submitted successfully!",
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

  // ================= UI =================
  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle>Barangay Clearance Request</DialogTitle>

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
                  sx={{ width: "25%" }}
                  label="Application Type"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                >
                  <MenuItem value="New">New</MenuItem>
                  <MenuItem value="Renew">Renew</MenuItem>
                  <MenuItem value="Reissuance">Reissuance (lost or damaged)</MenuItem>
                </TextField>
              </Grid>

              {/* READ ONLY USER INFO */}
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Name" value={formData.name} InputProps={{ readOnly: true }} />
              </Grid>

              <Grid item xs={12} sm={6} sx={{ display: "flex", flexDirection: "row", justifyContent: "start", gap: 3 }}>
                <TextField sx={{ width: "30%" }} label="Sex" value={formData.sex} InputProps={{ readOnly: true }} />
                <TextField sx={{ width: "30%" }} label="Birthdate" value={formData.birthdate} InputProps={{ readOnly: true }} />
                <TextField sx={{ width: "30%" }} label="Birthplace" value={formData.birthplace} InputProps={{ readOnly: true }} />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  value={`${formData.house_no} ${formData.street}, ${formData.barangay}, ${formData.municipality}, ${formData.province}`}
                  InputProps={{ readOnly: true }}
                />
              </Grid>

            </Grid>
          )}
        </DialogContent>

        <DialogActions sx={{ marginBottom: 2, marginRight: 3 }}>
          <Button onClick={onClose} sx={{ color: "#060745" }}>
            Cancel
          </Button>
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

      {/* ✅ SNACKBAR */}
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

export default BrgyClearanceRequest;