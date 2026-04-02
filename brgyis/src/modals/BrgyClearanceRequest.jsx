import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  MenuItem,
  Grid,
  Box
} from "@mui/material";

const BrgyClearanceRequest = ({ open, onClose, userId }) => {
  const [user, setUser] = useState(null);
  const [purpose, setPurpose] = useState("");

  useEffect(() => {
    if (open && userId) {
      fetch(`http://localhost:3001/api/user/${userId}`)
        .then(res => res.json())
        .then(data => setUser(data))
        .catch(err => console.error(err));
    }
  }, [open, userId]);

  const handleSubmit = async () => {
    if (!purpose) {
      alert("Please select a purpose");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/api/brgy-clearance/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userid: userId,
          purpose
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Submission failed");
      }

      alert("Request submitted successfully!");
      setPurpose("");
      onClose();

    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  if (!user) return null;

  const address = `${user.house_no || ""} ${user.street || ""}, ${user.barangay || ""}, ${user.municipality || ""}, ${user.province || ""}`;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Barangay Clearance Request</DialogTitle>

      <DialogContent dividers>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6">User Information</Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Name" value={user.user_name || ""} InputProps={{ readOnly: true }} />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Sex" value={user.sex || ""} InputProps={{ readOnly: true }} />
          </Grid>

          <Grid item xs={12}>
            <TextField fullWidth label="Address" value={address} InputProps={{ readOnly: true }} />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Birthdate" value={user.birthdate || ""} InputProps={{ readOnly: true }} />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Birthplace" value={user.birthplace || ""} InputProps={{ readOnly: true }} />
          </Grid>

          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              label="Purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            >
              <MenuItem value="Employment">Employment</MenuItem>
              <MenuItem value="Business Operation">Business Operation</MenuItem>
              <MenuItem value="Government Documents and Services">Government Documents and Services</MenuItem>
              <MenuItem value="Financial Service">Financial Service</MenuItem>
              <MenuItem value="Legal Transaction">Legal Transaction</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Submit Request
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BrgyClearanceRequest;