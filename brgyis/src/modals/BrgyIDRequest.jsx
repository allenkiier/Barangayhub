import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  CircularProgress,
  Typography,
  MenuItem,
  Snackbar,
  Alert
} from "@mui/material";

const BrgyIDRequest = ({ open, onClose, serviceName }) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [appType, setAppType] = useState("New");
  const [userid, setUserid] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

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
        showSnackbar("User not logged in", "error");
        return;
      }

      setUserid(uid);
      setLoading(true);

      fetch(`${API_URL}/api/user/${uid}`)
        .then((res) => res.json())
        .then((data) => {
          setFormData((prev) => ({
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
        .catch((err) => {
          console.error(err);
          setLoading(false);
          showSnackbar("Failed to load user data", "error");
        });
    }
  }, [open]);

  // ================= INPUT =================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    if (!userid) {
      showSnackbar("Missing user ID", "error");
      return;
    }

    if (!appType) {
      showSnackbar("Please select application type", "warning");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/api/brgyid/submit`, {
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

      if (!res.ok) {
        throw new Error(data.error || "Submission failed");
      }

      showSnackbar(
        `Submitted successfully! Transaction ID: ${data.transaction_id}`,
        "success"
      );

      onClose();
    } catch (err) {
      console.error(err);
      showSnackbar(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ================= CONFIRM HANDLERS =================
  const handleOpenConfirm = () => {
    setConfirmOpen(true);
  };

  const handleConfirmSubmit = () => {
    setConfirmOpen(false);
    handleSubmit();
  };

  const handleCancelConfirm = () => {
    setConfirmOpen(false);
  };

  // ================= UI =================
  return (
    <>
      {/* MAIN DIALOG */}
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
          <Button onClick={onClose} sx={{ color: "#060745" }}>
            Cancel
          </Button>

          <Button
            onClick={handleOpenConfirm}
            variant="contained"
            sx={{ background: "#060745" }}
            disabled={loading || submitting}
          >
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* CONFIRMATION DIALOG */}
      <Dialog open={confirmOpen} onClose={handleCancelConfirm}>
        <DialogTitle>Confirm Submission</DialogTitle>

        <DialogContent>
          <Typography>
            Are you sure you want to submit this Barangay ID request?
          </Typography>

          <Typography variant="body2" sx={{ mt: 1 }}>
            Application Type: <strong>{appType}</strong>
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCancelConfirm} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmSubmit}
            variant="contained"
            sx={{ background: "#060745" }}
            disabled={submitting}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR (success + error alerts) */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default BrgyIDRequest;