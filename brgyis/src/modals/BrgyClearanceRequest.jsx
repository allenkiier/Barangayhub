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
  MenuItem,
  Snackbar,
  Alert,
  Typography
} from "@mui/material";

const BrgyClearanceRequest = ({ open, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [userid, setUserid] = useState(null);
  const [purpose, setPurpose] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);

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

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

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

      fetch(`http://localhost:3001/api/user/${uid}`)
        .then((res) => res.json())
        .then((data) => {
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
        .catch((err) => {
          console.error(err);
          showSnackbar("Failed to fetch user data", "error");
          setLoading(false);
        });
    }
  }, [open]);

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    if (!userid) {
      showSnackbar("Missing user ID", "error");
      return;
    }

    if (!purpose) {
      showSnackbar("Please select a purpose", "warning");
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

      if (!res.ok) {
        throw new Error(data.error || "Submission failed");
      }

      showSnackbar("Request submitted successfully!", "success");

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
    if (!purpose) {
      showSnackbar("Please select a purpose", "warning");
      return;
    }
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

              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Name" value={formData.name} InputProps={{ readOnly: true }} />
              </Grid>

              <Grid item xs={12} sm={6} sx={{ display: "flex", gap: 3 }}>
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
            Are you sure you want to submit this Barangay Clearance request?
          </Typography>

          <Typography variant="body2" sx={{ mt: 1 }}>
            Purpose: <strong>{purpose || "Not selected"}</strong>
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

      {/* SNACKBAR */}
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

export default BrgyClearanceRequest;