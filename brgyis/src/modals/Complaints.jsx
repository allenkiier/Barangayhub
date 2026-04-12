import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Box,
  Typography,
  Snackbar,
  Alert,
  DialogActions
} from "@mui/material";

const Complaints = ({ open, onClose }) => {
  const [sender, setSender] = useState("");
  const [contactNum, setContactNum] = useState("");
  const [narrative, setNarrative] = useState("");
  const [loading, setLoading] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info"
  });

  const showSnackbar = (message, severity = "info") => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleOpenConfirm = () => {
    if (!narrative.trim()) {
      showSnackbar("Please enter your complaint.", "warning");
      return;
    }
    setConfirmOpen(true);
  };

  const handleCloseConfirm = () => {
    setConfirmOpen(false);
  };

  const handleSubmit = async () => {
    setConfirmOpen(false);
    setLoading(true);

    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sender: sender || null,
          contact_num: contactNum || null,
          narrative,
          type: "complaint"
        })
      });

      const data = await res.json();

      if (res.ok) {
        showSnackbar(`Complaint submitted! ID: ${data.id}`, "success");

        setSender("");
        setContactNum("");
        setNarrative("");

        onClose();
      } else {
        showSnackbar(data.error || "Submission failed", "error");
      }
    } catch (error) {
      console.error(error);
      showSnackbar("Server error", "error");
    }

    setLoading(false);
  };

  return (
    <>
      {/* Main Form Dialog */}
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Complaint Form</DialogTitle>

        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            You may file anonymously. Provide contact details if you want follow-up.
          </Typography>

          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Name (Optional)"
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              fullWidth
            />

            <TextField
              label="Contact Number (Optional)"
              value={contactNum}
              onChange={(e) => setContactNum(e.target.value)}
              fullWidth
            />

            <TextField
              label="Complaint Details"
              value={narrative}
              onChange={(e) => setNarrative(e.target.value)}
              fullWidth
              multiline
              rows={4}
              required
            />

            <Button
              variant="contained"
              color="error"
              onClick={handleOpenConfirm}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Complaint"}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={handleCloseConfirm}>
        <DialogTitle>Confirm Submission</DialogTitle>

        <DialogContent>
          <Typography>
            Are you sure you want to submit this complaint?
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseConfirm} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            color="error"
            variant="contained"
            disabled={loading}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
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

export default Complaints;