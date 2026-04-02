import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Grid, Box,
  CircularProgress, Typography
} from '@mui/material';

const IndigencyRequest = ({ open, onClose, serviceName, userId }) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

    console.log("✅ FETCHING USER ID:", resolvedUserId);

    setLoading(true);

    fetch(`http://localhost:3001/api/user/${resolvedUserId}/form-indigency`)
      .then(res => res.json())
      .then(data => {
        setFormData(data);
      })
      .catch(err => {
        console.error("Fetch error:", err);
      })
      .finally(() => {
        setLoading(false);
      });

  }, [open, resolvedUserId]);

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    if (!resolvedUserId) {
      alert("User not detected. Please login again.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('http://localhost:3001/api/indigency/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userid: resolvedUserId })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      alert(`✅ Submitted!\nTransaction ID: ${data.transaction_id}`);
      onClose();

    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ================= UI =================
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{serviceName}</DialogTitle>

      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>

            <Grid item xs={12}>
              <TextField fullWidth label="Full Name" value={formData.name || ''} InputProps={{ readOnly: true }} />
            </Grid>

            <Grid item xs={4}>
              <TextField fullWidth label="Age" value={formData.age || ''} InputProps={{ readOnly: true }} />
            </Grid>

            <Grid item xs={4}>
              <TextField fullWidth label="Sex" value={formData.sex || ''} InputProps={{ readOnly: true }} />
            </Grid>

            <Grid item xs={4}>
              <TextField fullWidth label="Civil Status" value={formData.civilStatus || ''} InputProps={{ readOnly: true }} />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2">Address</Typography>
            </Grid>

            <Grid item xs={4}>
              <TextField fullWidth label="House No." value={formData.house_no || ''} InputProps={{ readOnly: true }} />
            </Grid>

            <Grid item xs={8}>
              <TextField fullWidth label="Street" value={formData.street || ''} InputProps={{ readOnly: true }} />
            </Grid>

            <Grid item xs={6}>
              <TextField fullWidth label="Barangay" value={formData.barangay || ''} InputProps={{ readOnly: true }} />
            </Grid>

            <Grid item xs={6}>
              <TextField fullWidth label="Municipality" value={formData.municipality || ''} InputProps={{ readOnly: true }} />
            </Grid>

            <Grid item xs={12}>
              <TextField fullWidth label="Province" value={formData.province || ''} InputProps={{ readOnly: true }} />
            </Grid>

          </Grid>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || submitting}
        >
          {submitting ? "Submitting..." : "Submit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default IndigencyRequest;