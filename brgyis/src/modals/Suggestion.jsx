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

const Suggestion = ({ open, onClose }) => {
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
      showSnackbar("Please enter your suggestion.", "warning");
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
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sender,
          contact_num: contactNum,
          narrative,
          type: "suggestion"
        })
      });

      const data = await res.json();

      if (res.ok) {
        showSnackbar("Suggestion submitted successfully!", "success");

        // reset fields
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
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Suggestions</DialogTitle>

        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            You may leave this anonymous. Provide contact details only if you want a response.
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
              label="Your Suggestion / Concern"
              value={narrative}
              onChange={(e) => setNarrative(e.target.value)}
              fullWidth
              multiline
              rows={4}
              required
            />

            <Button
              variant="contained"
              onClick={handleOpenConfirm}
              disabled={loading}
              sx={{ background: "#060745" }}
            >
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={handleCloseConfirm}>
        <DialogTitle>Confirm Submission</DialogTitle>

        <DialogContent>
          <Typography>
            Are you sure you want to submit this suggestion?
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseConfirm} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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

export default Suggestion;