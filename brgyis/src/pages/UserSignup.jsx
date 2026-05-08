import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, TextField, Button, FormControlLabel,
  Checkbox, Stack, Snackbar, Alert, InputAdornment, IconButton
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import WalkIns from "../components/WalkIns";

const UserSignup = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const [snackbar, setSnackbar] = useState({ open: false, msg: "", severity: "error" });

  const showMessage = (msg, severity = "error") => {
    setSnackbar({ open: true, msg, severity });
  };

  const isMismatch = password !== confirm && confirm.length > 0;

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirm) {
      showMessage("Please fill in all fields");
      return;
    }

    const passwordRegex = /^[a-zA-Z0-9]{8}$/;
    if (!passwordRegex.test(password)) {
      showMessage("Password must be exactly 8 characters (Letters and Numbers only)");
      return;
    }

    if (password !== confirm) {
      showMessage("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      // Determine endpoint based on checkbox
      const endpoint = isAdmin ? "/api/signup-admin" : "/api/signup-resident";

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_name: name,
          email_ad: email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        showMessage(data.error || "Signup failed");
      } else {
        // Updated message for the staging table strategy
        showMessage(
          isAdmin 
          ? "Admin request submitted! Please wait for approval." 
          : "Registration submitted! An admin will verify your account shortly.", 
          "success"
        );

        // Redirect to login after a delay
        setTimeout(() => navigate("/"), 3000);
      }
    } catch (err) {
      console.error(err);
      showMessage("Server error during signup");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      className="user-page"
      sx={{
        display: "flex", flexDirection: "column", minHeight: "100vh",
        width: "100vw", overflowX: "hidden", backgroundColor: "#060745"
      }}
    >
      {/* LOGOS (Kept your original logic) */}
      <Box sx={{ width: "100%", display: "flex", justifyContent: "flex-end", p: 3 }}>
        <Stack direction="row" spacing={2}>
          <img src="bryimg.png" alt="Logo 1" style={{ height: "60px" }} />
          <img src="bago.png" alt="Logo 2" style={{ height: "60px" }} />
        </Stack>
      </Box>

      <Box sx={{ flex: 1, display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: "center", width: "100%", px: { xs: 2, md: 8 } }}>
        <Box sx={{ flex: 1 }}>
          <WalkIns />
        </Box>

        <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <Box sx={{ width: "100%", maxWidth: 400 }}>
            <Typography variant="h4" fontWeight="bold" color="white" textAlign="center" gutterBottom>
              {isAdmin ? "Admin Application" : "Create Account"}
            </Typography>

            <form onSubmit={handleSignup}>
              <TextField
                label="Full Name"
                fullWidth margin="dense"
                value={name}
                onChange={(e) => setName(e.target.value)}
                variant="standard" sx={inputStyles}
              />

              <TextField
                label="Email Address"
                type="email" fullWidth margin="dense"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                variant="standard" sx={inputStyles}
              />

              <TextField
                label="Password (8 chars, Alphanumeric)"
                type={showPassword ? "text" : "password"}
                fullWidth margin="dense"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variant="standard" sx={inputStyles}
                autoComplete="new-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: "white" }}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <TextField
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                fullWidth margin="dense"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                variant="standard" sx={inputStyles}
                error={isMismatch}
                helperText={isMismatch ? "Passwords do not match!" : ""}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" sx={{ color: "white" }}>
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
                label="Apply for Admin Access"
              />

              <Button
                type="submit" variant="contained" fullWidth
                sx={buttonStyles}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : isAdmin ? "Submit Admin Request" : "Sign Up"}
              </Button>

              <Button
                fullWidth
                sx={{ mt: 2, color: "rgba(255,255,255,0.6)" }}
                onClick={() => navigate("/")}
              >
                Already have an account? Login
              </Button>
            </form>
          </Box>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} variant="filled">{snackbar.msg}</Alert>
      </Snackbar>
    </Box>
  );
};

const inputStyles = {
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },
  "& .MuiInputBase-input": { color: "white" },
  "& .MuiInput-underline:before": { borderBottomColor: "rgba(255,255,255,0.3)" },
  "& .MuiInput-underline:hover:before": { borderBottomColor: "white" },
};

const buttonStyles = {
  mt: 3, py: 1.5, backgroundColor: "white", color: "#060745",
  fontWeight: "bold", borderRadius: "30px", "&:hover": { backgroundColor: "#e0e0e0" }
};

export default UserSignup;