import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Stack,
  Snackbar,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Paper
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

import WalkIns from "../components/WalkIns";
import ForgotPass from "../modals/ForgotPass";
import ResetPass from "../modals/ResetPass";

export default function UserLogin() {
  const navigate = useNavigate();

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Modal & Snackbar State
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [severity, setSeverity] = useState("error");
  const [openForgot, setOpenForgot] = useState(false);
  const [openReset, setOpenReset] = useState(false);
  const [resetToken, setResetToken] = useState("");

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setOpenSnackbar(false);
  };

  const showAlert = (msg, type = "error") => {
    setAlertMsg(msg);
    setSeverity(type);
    setOpenSnackbar(true);
  };

  const handleVerificationSuccess = (token) => {
    setResetToken(token);
    setOpenForgot(false);
    setOpenReset(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      showAlert("Please fill in all fields", "error");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email_ad: email,
          password,
          isAdmin,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Specifically catch the pending approval error to show as "info" or "warning"
        if (response.status === 403) {
          showAlert(data.error, "warning");
        } else {
          showAlert(data.error || "Login failed", "error");
        }
        return;
      }

      // Success Logic
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("userid", data.userid);

      showAlert("Login successful! Redirecting...", "success");

      setTimeout(() => {
        navigate(data.isAdmin ? "/admin-dash" : "/user-dash");
      }, 800);

    } catch (err) {
      console.error(err);
      showAlert("Server connection error", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box 
      className="user-page" 
      sx={{ 
        display: "flex", 
        flexDirection: "column", 
        minHeight: "100vh", 
        width: "100vw",
        background: "linear-gradient(to bottom, #1a237e, #0d47a1)" // Fallback if CSS class fails
      }}
    >
      {/* Top Header Logos */}
      <Box sx={{ width: "95%", display: "flex", justifyContent: "flex-end", p: 2 }}>
        <Stack direction="row" spacing={2}>
          <img src="bryimg.png" alt="Barangay Logo" style={{ height: "60px" }} />
          <img src="bago.png" alt="City Logo" style={{ height: "60px" }} />
        </Stack>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: "center", px: { xs: 2, md: 10 } }}>
        
        {/* Left Side: Information/Announcements */}
        <Box sx={{ flex: 1, display: { xs: "none", md: "block" } }}>
          <WalkIns />
        </Box>

        {/* Right Side: Login Form */}
        <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <Paper 
            elevation={6} 
            sx={{ 
              p: 4, 
              width: "100%", 
              maxWidth: 400, 
              bgcolor: "rgba(255, 255, 255, 0.1)", 
              backdropFilter: "blur(10px)",
              borderRadius: 3,
              border: "1px solid rgba(255, 255, 255, 0.2)"
            }}
          >
            <Typography variant="h4" fontWeight="bold" color="white" textAlign="center" gutterBottom>
              User Login
            </Typography>

            {/* Persistence Warning for Pending Accounts */}
            {severity === "warning" && openSnackbar && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {alertMsg}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                label="Email Address"
                fullWidth
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                variant="outlined"
                sx={{
                  input: { color: "white" },
                  label: { color: "rgba(255,255,255,0.7)" },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                    "&:hover fieldset": { borderColor: "white" },
                  }
                }}
              />

              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variant="outlined"
                sx={{
                  input: { color: "white" },
                  label: { color: "rgba(255,255,255,0.7)" },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                    "&:hover fieldset": { borderColor: "white" },
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((prev) => !prev)}
                        onMouseDown={(e) => e.preventDefault()}
                        sx={{ color: "white" }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <FormControlLabel
                sx={{ color: "white", mt: 1 }}
                control={
                  <Checkbox
                    checked={isAdmin}
                    onChange={(e) => setIsAdmin(e.target.checked)}
                    sx={{ color: "white" }}
                  />
                }
                label="Login as Administrator"
              />

              <Button 
                type="submit" 
                variant="contained" 
                fullWidth 
                sx={{ 
                  mt: 3, 
                  py: 1.5, 
                  fontWeight: "bold",
                  backgroundColor: "#1976d2",
                  "&:hover": { backgroundColor: "#1565c0" }
                }} 
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : "Login"}
              </Button>

              <Stack spacing={1} sx={{ mt: 2 }}>
                <Button
                  variant="text"
                  sx={{ color: "rgba(255,255,255,0.8)", textTransform: "none" }}
                  onClick={() => setOpenForgot(true)}
                >
                  Forgot Password?
                </Button>

                <Button
                  variant="text"
                  sx={{ color: "rgba(255,255,255,0.8)", textTransform: "none" }}
                  onClick={() => navigate("/signup")}
                >
                  Don't have an account? Sign Up
                </Button>
              </Stack>
            </form>
          </Paper>
        </Box>
      </Box>

      {/* Modals */}
      <ForgotPass
        open={openForgot}
        onClose={() => setOpenForgot(false)}
        showAlert={showAlert}
        onVerified={handleVerificationSuccess} 
      />

      <ResetPass
        open={openReset}
        onClose={() => setOpenReset(false)}
        token={resetToken}
        showAlert={showAlert}
      />

      {/* Snackbar for Notifications */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={severity} variant="filled" sx={{ width: '100%' }}>
          {alertMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}