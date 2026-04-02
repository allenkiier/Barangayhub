import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Grid, Alert } from "@mui/material";
import axios from "axios";

const IncidentReportRequest = ({ open, onClose, userid }) => {
  const [formData, setFormData] = useState({
    incident_date: "",
    incident_time: "",
    incident_address: "",
    narrative: ""
  });
  const [error, setError] = useState("");

  const handleSubmit = async () => {
  setError(""); // Clear previous errors
  console.log("Attempting to submit to: http://localhost:3001/api/incident-report/submit");

  try {
    const res = await axios.post("http://localhost:3001/api/incident-report/submit", {
      userid, // Ensure this is the ID number, e.g., 1
      incident_date: formData.incident_date,
      incident_time: formData.incident_time,
      incident_address: formData.incident_address,
      narrative: formData.narrative
    });

    alert("Report Submitted!");
    onClose();
  } catch (err) {
    console.error("Submission error details:", err.response);
    setError(err.response?.data?.error || "404: Route not found on server.");
  }
};

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>New Incident Report</DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error">{error}</Alert>}
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={6}>
            <TextField label="Date" type="date" fullWidth InputLabelProps={{ shrink: true }} 
              onChange={(e) => setFormData({...formData, incident_date: e.target.value})} />
          </Grid>
          <Grid item xs={6}>
            <TextField label="Time" type="time" fullWidth InputLabelProps={{ shrink: true }} 
              onChange={(e) => setFormData({...formData, incident_time: e.target.value})} />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Location" fullWidth 
              onChange={(e) => setFormData({...formData, incident_address: e.target.value})} />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Narrative" multiline rows={4} fullWidth 
              onChange={(e) => setFormData({...formData, narrative: e.target.value})} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>Submit</Button>
      </DialogActions>
    </Dialog>
  );
};

export default IncidentReportRequest;