import React, { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Grid, Alert,
  FormControl, InputLabel, Select, MenuItem
} from "@mui/material";
import axios from "axios";

const IncidentReportRequest = ({ open, onClose, userid }) => {
  const [formData, setFormData] = useState({
    incident_date: "",
    incident_time: "",
    incident_address: "",
    narrative: ""
  });

  const [appType, setAppType] = useState(""); // ✅ added
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");

    if (!userid) {
      setError("User ID is required");
      return;
    }

    if (
      !formData.incident_date ||
      !formData.incident_time ||
      !formData.incident_address ||
      !formData.narrative ||
      !appType
    ) {
      setError("All fields including application type are required");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:3001/api/incident-report/submit",
        {
          userid,
          incident_date: formData.incident_date,
          incident_time: formData.incident_time,
          incident_address: formData.incident_address,
          narrative: formData.narrative,
          app_type: appType // ✅ included
        }
      );

      alert("Report Submitted!");
      onClose();

      // reset
      setFormData({
        incident_date: "",
        incident_time: "",
        incident_address: "",
        narrative: ""
      });
      setAppType("");

    } catch (err) {
      console.error("Submission error details:", err.response);
      setError(err.response?.data?.error || "Submission failed.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>New Incident Report</DialogTitle>

      <DialogContent dividers>
        {error && <Alert severity="error">{error}</Alert>}

        <Grid container spacing={2}  sx={{display: "flex", flexDirection:"column", marginTop: 2}}>
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
                <MenuItem value="new">New</MenuItem>
                <MenuItem value="follow-up">Follow-up</MenuItem>
                <MenuItem value="amendment">Amendment</MenuItem>
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

          {/* ✅ APPLICATION TYPE SELECT */}
          
        </Grid>
      </DialogContent>

      <DialogActions sx={{marginBottom: 2, marginRight: 3}}>
        <Button onClick={onClose} sx={{color: "#060745"}}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}  sx={{background: "#060745"}}> 
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default IncidentReportRequest;