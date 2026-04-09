import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Typography
} from "@mui/material";

const BusinessClearanceRequest = ({ open, onClose, userid }) => {
  const [tradeName, setTradeName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [appType, setAppType] = useState("");
  const [loading, setLoading] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);

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

  // ================= CONFIRM HANDLERS =================
  const handleOpenConfirm = () => {
    if (!userid) {
      showSnackbar("User ID is required", "error");
      return;
    }

    if (!tradeName || !businessAddress || !appType) {
      showSnackbar("All fields are required", "warning");
      return;
    }

    setConfirmOpen(true);
  };

  const handleCancelConfirm = () => {
    setConfirmOpen(false);
  };

  const handleConfirmSubmit = async () => {
    setConfirmOpen(false);
    setLoading(true);

    try {
      const res = await fetch(
        "http://localhost:5000/api/business-clearance/submit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            userid: userid,
            trade_name: tradeName,
            business_address: businessAddress,
            app_type: appType
          })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Submission failed");
      }

      showSnackbar("Business Clearance submitted successfully!", "success");

      // Reset fields
      setTradeName("");
      setBusinessAddress("");
      setAppType("");

      onClose();
    } catch (err) {
      console.error(err);
      showSnackbar(err.message, "error");
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
                <MenuItem value="Reissuance">
                  Reissuance (lost or damaged)
                </MenuItem>
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
              onClick={handleOpenConfirm}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Request"}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* CONFIRMATION DIALOG */}
      <Dialog open={confirmOpen} onClose={handleCancelConfirm}>
        <DialogTitle>Confirm Submission</DialogTitle>

        <DialogContent>
          <Typography>
            Are you sure you want to submit this Business Clearance request?
          </Typography>

          <Typography variant="body2" sx={{ mt: 1 }}>
            Application Type: <strong>{appType || "Not selected"}</strong>
          </Typography>

          <Typography variant="body2">
            Trade Name: <strong>{tradeName || "N/A"}</strong>
          </Typography>

          <Typography variant="body2">
            Business Address: <strong>{businessAddress || "N/A"}</strong>
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
            disabled={loading}
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

export default BusinessClearanceRequest;