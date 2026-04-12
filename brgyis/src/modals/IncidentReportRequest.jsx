import React, { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Grid, FormControl,
  InputLabel, Select, MenuItem,
  Snackbar, Alert, Typography
} from "@mui/material";
import api from "../api";

const IncidentReportRequest = ({ open, onClose, userid }) => {
  const [formData, setFormData] = useState({
    incident_date: "",
    incident_time: "",
    incident_address: "",
    narrative: ""
  });
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const [appType, setAppType] = useState("");
  const [loading, setLoading] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    if (!userid) {
      setSnackbar({
        open: true,
        message: "User ID is required",
        severity: "error"
      });
      return;
    }

    if (
      !formData.incident_date ||
      !formData.incident_time ||
      !formData.incident_address ||
      !formData.narrative ||
      !appType
    ) {
      setSnackbar({
        open: true,
        message: "All fields including application type are required",
        severity: "warning"
      });
      return;
    }

    setLoading(true);

    try {
      await api.post(`${API_URL}/api/incident-report/submit`, {
        userid,
        incident_date: formData.incident_date,
        incident_time: formData.incident_time,
        incident_address: formData.incident_address,
        narrative: formData.narrative,
        app_type: appType
      });

      setSnackbar({
        open: true,
        message: "Report submitted successfully!",
        severity: "success"
      });

      onClose();

      // reset form
      setFormData({
        incident_date: "",
        incident_time: "",
        incident_address: "",
        narrative: ""
      });
      setAppType("");

    } catch (err) {
      console.error("Submission error details:", err.response);

      setSnackbar({
        open: true,
        message: err.response?.data?.error || "Submission failed.",
        severity: "error"
      });

    } finally {
      setLoading(false);
    }
  };

  // ================= CONFIRM HANDLERS =================
  const handleOpenConfirm = () => {
    // Optional: validate before opening confirm
    if (!formData.incident_date ||
        !formData.incident_time ||
        !formData.incident_address ||
        !formData.narrative ||
        !appType) {
      setSnackbar({
        open: true,
        message: "Please complete all fields before confirming",
        severity: "warning"
      });
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
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>New Incident Report</DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={2} sx={{ display: "flex", flexDirection: "column", marginTop: 2 }}>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="incident-app-type-label">
                  Application Type
                </InputLabel>
                <Select
                  labelId="incident-app-type-label"
                  value={appType}
                  label="Application Type"
                  onChange={(e) => setAppType(e.target.value)}
                >
                  <MenuItem value="New">New</MenuItem>
                  <MenuItem value="Follow-Up">Follow-up</MenuItem>
                  <MenuItem value="Amendment">Amendment</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                onChange={(e) =>
                  setFormData({ ...formData, incident_date: e.target.value })
                }
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="Time"
                type="time"
                fullWidth
                InputLabelProps={{ shrink: true }}
                onChange={(e) =>
                  setFormData({ ...formData, incident_time: e.target.value })
                }
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Location"
                fullWidth
                onChange={(e) =>
                  setFormData({ ...formData, incident_address: e.target.value })
                }
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Narrative"
                multiline
                rows={4}
                fullWidth
                onChange={(e) =>
                  setFormData({ ...formData, narrative: e.target.value })
                }
              />
            </Grid>

          </Grid>
        </DialogContent>

        <DialogActions sx={{ marginBottom: 2, marginRight: 3 }}>
          <Button onClick={onClose} sx={{ color: "#060745" }}>
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleOpenConfirm}
            sx={{ background: "#060745" }}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* CONFIRMATION DIALOG */}
      <Dialog open={confirmOpen} onClose={handleCancelConfirm}>
        <DialogTitle>Confirm Submission</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to submit this Incident Report?
          </Typography>

          <Typography variant="body2" sx={{ mt: 1 }}>
            Application Type: <strong>{appType || "Not selected"}</strong>
          </Typography>

          <Typography variant="body2">
            Date: <strong>{formData.incident_date || "N/A"}</strong>
          </Typography>

          <Typography variant="body2">
            Time: <strong>{formData.incident_time || "N/A"}</strong>
          </Typography>

        </DialogContent>

        <DialogActions>
          <Button onClick={handleCancelConfirm} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleConfirmSubmit} variant="contained" sx={{ background: "#060745" }}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR */}
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

export default IncidentReportRequest;