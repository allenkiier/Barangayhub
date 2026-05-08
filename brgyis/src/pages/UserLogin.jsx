import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, TextField, Button, FormControlLabel,
  Checkbox, Stack, Snackbar, Alert, InputAdornment, IconButton
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

import WalkIns from "../components/WalkIns";
import ForgotPass from "../modals/ForgotPass";
import ResetPass from "../modals/ResetPass"; 

export default function UserLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [severity, setSeverity] = useState("error");
  const [showPassword, setShowPassword] = useState(false);

  // Modal States
  const [openForgot, setOpenForgot] = useState(false);
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

  const handleVerificationSuccess = (token) => {
    setResetToken(token);
    setOpenForgot(false);
    setOpenReset(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      showAlert("Please fill in all fields");
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
        showAlert(data.error || "Login failed");
        return;
      }

      // Successful Login
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
      showAlert("Server error during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#060745" }}>
      
      {/* Logos */}
      <Box sx={{ width: "100%", display: "flex", justifyContent: "flex-end", p: 3 }}>
        <Stack direction="row" spacing={2}>
          <img src="bryimg.png" alt="Logo 1" style={{ height: "60px" }} />
          <img src="bago.png" alt="Logo 2" style={{ height: "60px" }} />
        </Stack>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: "flex", alignItems: "center", px: { xs: 2, md: 8 } }}>
        
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
                sx={inputStyles}
              />

              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variant="standard"
                sx={inputStyles}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} sx={{ color: "white" }}>
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
                label="Login as Admin"
              />

              <Button type="submit" variant="contained" fullWidth sx={buttonStyles} disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>

              <Stack spacing={1} mt={2} alignItems="center">
                <Button 
                    sx={{ color: "rgba(255,255,255,0.7)", textTransform: "none" }} 
                    onClick={() => setOpenForgot(true)}
                >
                  Forgot Password?
                </Button>
                <Button 
                    sx={{ color: "rgba(255,255,255,0.7)", textTransform: "none" }} 
                    onClick={() => navigate("/signup")}
                >
                  Don't have an account? Sign Up
                </Button>
              </Stack>
            </form>
          </Box>
        </Box>
      </Box>

      {/* Modals */}
      <ForgotPass open={openForgot} onClose={() => setOpenForgot(false)} showAlert={showAlert} onVerified={handleVerificationSuccess} />
      <ResetPass open={openReset} onClose={() => setOpenReset(false)} token={resetToken} showAlert={showAlert} />

      {/* Feedback */}
      <Snackbar open={openSnackbar} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={severity} variant="filled">{alertMsg}</Alert>
      </Snackbar>
    </Box>
  );
}

const inputStyles = {
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },
  "& .MuiInputBase-input": { color: "white" }
};

const buttonStyles = {
  mt: 3, 
  py: 1.5, 
  backgroundColor: "white", 
  color: "#060745", 
  fontWeight: "bold", 
  borderRadius: "30px",
  "&:hover": { backgroundColor: "#e0e0e0" }
};