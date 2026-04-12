import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Typography
} from "@mui/material";
import api from "../api";

export default function ResetPass({ open, onClose, token, showAlert }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  // Matching Feature: Check if they match and aren't empty
  const isMismatch = password !== confirmPassword && confirmPassword.length > 0;
  const isInvalid = !password || !confirmPassword || isMismatch;
  const isDisabled = !password || !confirmPassword || isMismatch || loading;

  const handleReset = async () => {
    if (isInvalid) {
      showAlert("Passwords must match and cannot be empty", "error");
      return;
    }

    setLoading(true);
    try {
      // NOTE: Ensure your backend route is: /api/auth/reset-password/:token
      const res = await api.post(
        `${API_URL}/api/auth/reset-password/${token}`,
        { newPassword: password }
      );

      showAlert(res.data.message || "Password updated successfully!", "success");
      
      // Reset fields and close
      setPassword("");
      setConfirmPassword("");
      onClose(); 
    } catch (err) {
      console.error("RESET ERROR:", err.response?.data || err.message);
      const errorMsg = err.response?.data?.error || "Update failed. Link may be expired.";
      showAlert(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: "bold" }}>Set New Password</DialogTitle>
      <DialogContent>
        <Typography variant="caption" color="text.secondary" gutterBottom>
          Resetting for token: {token?.substring(0, 8)}...
        </Typography>
        
        <TextField
          label="New Password"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={isMismatch}
        />
        
        <TextField
          label="Confirm New Password"
          type="password"
          fullWidth
          margin="normal"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={isMismatch}
          helperText={isMismatch ? "Passwords do not match!" : ""}
        />

        {isMismatch && (
          <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
            * Please ensure both fields are identical.
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button
          variant="contained"
          onClick={handleReset}
          disabled={isDisabled}
          fullWidth
        >
          {loading ? <CircularProgress size={24} /> : "Update Password"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}