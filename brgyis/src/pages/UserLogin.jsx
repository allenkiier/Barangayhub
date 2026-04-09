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
  Alert
} from "@mui/material";

import WalkIns from "../components/WalkIns";
import ForgotPass from "../modals/ForgotPass";
import ResetPass from "../modals/ResetPass"; // Added ResetPass import

export default function UserLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Snackbar
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [severity, setSeverity] = useState("error");

  // Forgot Password Modal State
  const [openForgot, setOpenForgot] = useState(false);

  // Reset Password Modal State (The "Switching" state)
  const [openReset, setOpenReset] = useState(false);
  const [resetToken, setResetToken] = useState("");

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setOpenSnackbar(false);
  };

  const showAlert = (msg, type = "error") => {
    setAlertMsg(msg);
    setSeverity(type);
    setOpenSnackbar(true);
  };

  // Logic to handle the transition from Forgot Modal to Reset Modal
  const handleVerificationSuccess = (token) => {
    setResetToken(token); // Store the token from the approved request
    setOpenForgot(false); // Close the status check modal
    setOpenReset(true);   // Trigger the actual Reset Password modal
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      showAlert("Please fill in all fields", "error");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/login", {
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
        showAlert(data.error || "Login failed", "error");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("userid", data.userid);

      showAlert("Login successful", "success");

      setTimeout(() => {
        if (data.isAdmin) {
          navigate("/admin-dash");
        } else {
          navigate("/user-dash");
        }
      }, 800);

    } catch (err) {
      console.error(err);
      showAlert("Server error during login", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className="user-page" sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", width: "100vw" }}>

      {/* Logos */}
      <Box sx={{ width: "95%", display: "flex", justifyContent: "flex-end", p: 2 }}>
        <Stack direction="row" spacing={2}>
          <img src="bryimg.png" alt="Logo 1" style={{ height: "60px" }} />
          <img src="bago.png" alt="Logo 2" style={{ height: "60px" }} />
        </Stack>
      </Box>

      {/* Content */}
      <Box sx={{ ml: 30, flex: 1, display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: "center" }}>

        <Box sx={{ flex: 1 }}>
          <WalkIns />
        </Box>

        <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <Box sx={{ width: "100%", maxWidth: 400 }}>

            <Typography variant="h4" fontWeight="bold" color="white" textAlign="center" gutterBottom>
              User Login
            </Typography>

            <form onSubmit={handleSubmit}>
              <TextField
                label="Email"
                fullWidth
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                variant="standard"
                sx={{ input: { color: "white" }, label: { color: "rgba(255,255,255,0.7)" } }}
              />

              <TextField
                label="Password"
                type="password"
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variant="standard"
                sx={{ input: { color: "white" }, label: { color: "rgba(255,255,255,0.7)" } }}
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
                label="Login as Admin"
              />

              <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }} disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>

              {/* Forgot Password Button */}
              <Button
                fullWidth
                sx={{ mt: 1, color: "rgba(255,255,255,0.7)" }}
                onClick={() => setOpenForgot(true)}
              >
                Forgot Password?
              </Button>

              <Button
                fullWidth
                sx={{ mt: 1, color: "rgba(255,255,255,0.7)" }}
                onClick={() => navigate("/signup")}
              >
                Don't have an account? Sign Up
              </Button>
            </form>

          </Box>
        </Box>
      </Box>

      {/* Forgot Password Modal - Handles Request and Status Check */}
      <ForgotPass
        open={openForgot}
        onClose={() => setOpenForgot(false)}
        showAlert={showAlert}
        onVerified={handleVerificationSuccess} 
      />

      {/* Reset Password Modal - The second modal triggered after approval */}
      <ResetPass
        open={openReset}
        onClose={() => setOpenReset(false)}
        token={resetToken}
        showAlert={showAlert}
      />

      {/* Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={severity} variant="filled">
          {alertMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}