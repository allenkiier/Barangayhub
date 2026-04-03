import React, { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent,
  TextField, Button, Box,
  FormControl, InputLabel, Select, MenuItem,
  Snackbar, Alert
} from "@mui/material";

const BusinessClearanceRequest = ({ open, onClose, userid }) => {
  const [tradeName, setTradeName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [appType, setAppType] = useState("");
  const [loading, setLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const handleSubmit = async () => {
    if (!userid) {
      setSnackbar({
        open: true,
        message: "User ID is required",
        severity: "error"
      });
      return;
    }

    if (!tradeName || !businessAddress || !appType) {
      setSnackbar({
        open: true,
        message: "All fields are required",
        severity: "warning"
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:3001/api/business-clearance/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userid: userid,
          trade_name: tradeName,
          business_address: businessAddress,
          app_type: appType
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setSnackbar({
        open: true,
        message: "Business Clearance submitted successfully!",
        severity: "success"
      });

      onClose();

      setTradeName("");
      setBusinessAddress("");
      setAppType("");

    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: err.message,
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Business Clearance Request</DialogTitle>

        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>

            <FormControl fullWidth>
              <InputLabel id="app-type-label">Application Type</InputLabel>
              <Select
                labelId="app-type-label"
                value={appType}
                label="Application Type"
                onChange={(e) => setAppType(e.target.value)}
              >
                <MenuItem value="New">New</MenuItem>
                <MenuItem value="Renewal">Renewal</MenuItem>
                <MenuItem value="Reissuance">Reissuance (lost or damaged)</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Trade Name"
              value={tradeName}
              onChange={(e) => setTradeName(e.target.value)}
              fullWidth
            />

            <TextField
              label="Business Address"
              value={businessAddress}
              onChange={(e) => setBusinessAddress(e.target.value)}
              fullWidth
              multiline
              rows={2}
            />

            <Button
              variant="contained"
              sx={{ background: "#060745" }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Request"}
            </Button>

          </Box>
        </DialogContent>
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

export default BusinessClearanceRequest;