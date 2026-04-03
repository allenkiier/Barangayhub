import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Grid, Box,
  CircularProgress, Typography, MenuItem,
  Snackbar, Alert
} from '@mui/material';

const IndigencyRequest = ({ open, onClose, serviceName, userId }) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [appType, setAppType] = useState('indigency');

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    sex: '',
    civilStatus: '',
    house_no: '',
    street: '',
    barangay: '',
    municipality: '',
    province: ''
  });

  // ✅ ALWAYS GET REAL USER ID
  const resolvedUserId = userId || localStorage.getItem("userid");

  // ================= AUTO FILL =================
  useEffect(() => {
    if (!open || !resolvedUserId) return;

    setLoading(true);

    fetch(`http://localhost:3001/api/user/${resolvedUserId}/form-indigency`)
      .then(res => res.json())
      .then(data => {
        setFormData(data);
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setSnackbar({
          open: true,
          message: "Failed to load user data",
          severity: "error"
        });
      })
      .finally(() => {
        setLoading(false);
      });

  }, [open, resolvedUserId]);

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    if (!resolvedUserId) {
      setSnackbar({
        open: true,
        message: "User not detected. Please login again.",
        severity: "error"
      });
      return;
    }

    if (!appType) {
      setSnackbar({
        open: true,
        message: "Please select application type",
        severity: "warning"
      });
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('http://localhost:3001/api/indigency/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userid: resolvedUserId,
          app_type: appType
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

  // ================= UI =================
  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>{serviceName || "Certificate of Indigency"}</DialogTitle>

        <DialogContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={2} py={3}>
              <Grid sx={{ display: "flex", flexDirection: "column" }}>

                {/* APPLICATION TYPE */}
                <Grid item xs={12} marginBottom={3}>
                  <TextField
                    select
                    fullWidth
                    label="Application Type"
                    value={appType}
                    onChange={(e) => setAppType(e.target.value)}
                  >
                    <MenuItem value="New">New</MenuItem>
                    <MenuItem value="Renew">Renew</MenuItem>
                    <MenuItem value="Reissuance">Reissuance (lost or damaged)</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} marginBottom={3}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={formData.name || ''}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>

                <Grid item xs={4} sx={{ display: "flex", flexDirection: 'row' }} gap={2}>
                  <TextField sx={{ width: "100px" }} label="Age" value={formData.age || ''} InputProps={{ readOnly: true }} />
                  <TextField label="Sex" value={formData.sex || ''} InputProps={{ readOnly: true }} />
                  <TextField label="Civil Status" value={formData.civilStatus || ''} InputProps={{ readOnly: true }} />
                </Grid>

                <Grid item xs={12} my={2}>
                  <Typography variant="subtitle2">Address</Typography>
                </Grid>

                <Grid item xs={12} sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                  <TextField sx={{ width: "100px" }} label="House No." value={formData.house_no || ''} InputProps={{ readOnly: true }} />
                  <TextField sx={{ width: "200px" }} label="Street" value={formData.street || ''} InputProps={{ readOnly: true }} />
                  <TextField sx={{ width: "200px" }} label="Barangay" value={formData.barangay || ''} InputProps={{ readOnly: true }} />
                </Grid>

                <Grid item xs={12} sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 2 }}>
                  <TextField sx={{ width: "200px" }} label="Municipality" value={formData.municipality || ''} InputProps={{ readOnly: true }} />
                  <TextField sx={{ width: "200px" }} label="Province" value={formData.province || ''} InputProps={{ readOnly: true }} />
                </Grid>

              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions sx={{ marginBottom: 2, marginRight: 3 }}>
          <Button onClick={onClose} sx={{ color: "#060745" }}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            sx={{ background: "#060745" }}
            variant="contained"
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

export default IndigencyRequest;