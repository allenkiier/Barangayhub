import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Typography,
  InputAdornment,
  IconButton
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import api from "../api";

export default function ResetPass({ open, onClose, token, showAlert }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // Validation
  const isMismatch = password !== confirmPassword && confirmPassword.length > 0;
  const isInvalid = !password || !confirmPassword || isMismatch;
  const isDisabled = isInvalid || loading;

  const handleReset = async () => {
    if (isInvalid) {
      showAlert("Passwords must match and cannot be empty", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post(
        `${API_URL}/api/auth/reset-password/${token}`,
        { newPassword: password }
      );

      showAlert(
        res.data.message || "Password updated successfully!",
        "success"
      );

      // Reset fields
      setPassword("");
      setConfirmPassword("");
      setShowPassword(false);
      setShowConfirmPassword(false);

      onClose();
    } catch (err) {
      console.error("RESET ERROR:", err.response?.data || err.message);
      const errorMsg =
        err.response?.data?.error ||
        "Update failed. Link may be expired.";
      showAlert(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: "bold" }}>
        Set New Password
      </DialogTitle>

      <DialogContent>
        <Typography
          variant="caption"
          color="text.secondary"
          gutterBottom
        >
          Resetting for token: {token?.substring(0, 8)}...
        </Typography>

        {/* New Password */}
        <TextField
          label="New Password"
          type={showPassword ? "text" : "password"}
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  onMouseDown={(e) => e.preventDefault()}
                  edge="end"
                >
                  {showPassword ? (
                    <VisibilityOff />
                  ) : (
                    <Visibility />
                  )}
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        {/* Confirm Password */}
        <TextField
          label="Confirm New Password"
          type={showConfirmPassword ? "text" : "password"}
          fullWidth
          margin="normal"
          value={confirmPassword}
          onChange={(e) =>
            setConfirmPassword(e.target.value)
          }
          autoComplete="new-password"
          error={isMismatch}
          helperText={
            isMismatch ? "Passwords do not match!" : ""
          }
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() =>
                    setShowConfirmPassword((prev) => !prev)
                  }
                  onMouseDown={(e) => e.preventDefault()}
                  edge="end"
                >
                  {showConfirmPassword ? (
                    <VisibilityOff />
                  ) : (
                    <Visibility />
                  )}
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        {isMismatch && (
          <Typography
            variant="caption"
            color="error"
            sx={{ mt: 1, display: "block" }}
          >
            * Please ensure both fields are identical.
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleReset}
          disabled={isDisabled}
          fullWidth
        >
          {loading ? (
            <CircularProgress size={24} />
          ) : (
            "Update Password"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}