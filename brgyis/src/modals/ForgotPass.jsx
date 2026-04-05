import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  CircularProgress
} from "@mui/material";
import axios from "axios";

export default function ForgotPass({ open, onClose, showAlert, onVerified }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // REQUEST RESET - Fills the password-resets table for Admin to see
  const handleRequest = async () => {
    if (!email) {
      showAlert("Please enter your email", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:3001/api/auth/forgot-password",
        { email }
      );
      showAlert(res.data.message, "success");
    } catch (err) {
      console.error(err);
      showAlert(
        err.response?.data?.error || "Failed to request reset",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // CHECK STATUS & TRIGGER CHAIN
  // This is where the user checks if the Admin gave the "Hand Signal" (Approval)
  const handleCheckStatus = async () => {
    if (!email) {
      showAlert("Please enter your email", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:3001/api/auth/check-reset-status",
        { email }
      );

      // Backend returns status (pending/approved/rejected) and the token
      const { status, token } = res.data;
      
      // Handle null/undefined status safely
      const lowerStatus = status ? status.toLowerCase() : "";

      if (lowerStatus === "approved") {
        showAlert("Request approved! Opening reset form...", "success");
        
        // This sends the token back to UserLogin.jsx which swaps the modals
        if (typeof onVerified === "function") {
          onVerified(token); 
        } else {
          console.error("onVerified prop is missing from parent!");
        }
      } else if (lowerStatus === "pending") {
        showAlert("Your request is still pending admin approval.", "info");
      } else if (lowerStatus === "rejected") {
        showAlert("Your request was rejected. Please contact admin.", "error");
      } else {
        showAlert("No active reset request found for this email.", "warning");
      }

    } catch (err) {
      console.error(err);
      showAlert(
        err.response?.data?.error || "Failed to check status",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: "bold" }}>Forgot Password</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
          Enter your email to request a reset. Once the admin approves your request, 
          click "Check Status" to proceed with changing your password.
        </Typography>
        <TextField
          label="Email Address"
          fullWidth
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mt: 1, mb: 1 }}
        />
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          variant="outlined"
          onClick={handleRequest}
          disabled={loading}
          sx={{ minWidth: "130px" }}
        >
          {loading ? <CircularProgress size={20} /> : "Request Reset"}
        </Button>
        <Button
          variant="contained"
          onClick={handleCheckStatus}
          disabled={loading}
          sx={{ minWidth: "130px" }}
        >
          {loading ? <CircularProgress size={20} /> : "Check Status"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}