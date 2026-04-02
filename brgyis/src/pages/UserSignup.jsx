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

const UserSignup = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Snackbar State
  const [snackbar, setSnackbar] = useState({ open: false, msg: "", severity: "error" });

  const showMessage = (msg, severity = "error") => {
    setSnackbar({ open: true, msg, severity });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    // 1. Basic Empty Check
    if (!name || !email || !password || !confirm) {
      showMessage("Please fill in all fields");
      return;
    }

    // 2. Password Complexity: Exactly 8 characters, Alphanumeric only
    // Regex: ^[a-zA-Z0-9]{8}$ means start to end, only letters/numbers, length 8
    const passwordRegex = /^[a-zA-Z0-9]{8}$/;
    if (!passwordRegex.test(password)) {
      showMessage("Password must be exactly 8 characters (Letters and Numbers only)");
      return;
    }

    // 3. Match Check
    if (password !== confirm) {
      showMessage("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:3001/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_name: name,
          email_ad: email,
          password,
          isAdmin: isAdmin,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showMessage(data.error || "Signup failed");
      } else {
        showMessage("Account created successfully!", "success");
        setTimeout(() => navigate("/"), 2000); // Redirect after success
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
        display: "flex", 
        flexDirection: "column", 
        minHeight: "100vh", 
        width: "100vw",
        overflowX: "hidden",
        backgroundColor: "#060745" // Matching your login theme
      }}
    >
      {/* SECTION 1: LOGOS */}
      <Box sx={{ width: "100%", display: "flex", justifyContent: "flex-end", p: 3, boxSizing: "border-box" }}>
        <Stack direction="row" spacing={2}>
          <img src="bryimg.png" alt="Logo 1" style={{ height: "60px", width: "auto" }} />
          <img src="bago.png" alt="Logo 2" style={{ height: "60px", width: "auto" }} />
        </Stack>
      </Box>

      {/* SECTION 2: MAIN CONTENT */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: "center", width: "100%", px: { xs: 2, md: 8 }, boxSizing: "border-box", gap: { xs: 4, md: 0 } }}>
        
        {/* LEFT side for WalkIns */}
        <Box sx={{ flex: 1, display: "flex", justifyContent: { xs: "center", md: "flex-start" }, width: "100%" }}>
          <WalkIns />
        </Box>

        {/* RIGHT side for Signup Form */}
        <Box sx={{ flex: 1, display: "flex", justifyContent: { xs: "center", md: "flex-end" }, width: "100%" }}>
          <Box sx={{ width: "100%", maxWidth: 400 }}>
            <Typography variant="h4" fontWeight="bold" color="white" textAlign="center" gutterBottom sx={{ mb: 2 }}>
              Create Account
            </Typography>

            <form onSubmit={handleSignup}>
              <TextField
                label="Full Name"
                fullWidth
                margin="dense"
                value={name}
                onChange={(e) => setName(e.target.value)}
                variant="standard"
                sx={inputStyles}
              />
              <TextField
                label="Email Address"
                type="email"
                fullWidth
                margin="dense"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                variant="standard"
                sx={inputStyles}
              />
              <TextField
                label="Password (8 chars, Alphanumeric)"
                type="password"
                fullWidth
                margin="dense"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variant="standard"
                sx={inputStyles}
              />
              <TextField
                label="Confirm Password"
                type="password"
                fullWidth
                margin="dense"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                variant="standard"
                sx={inputStyles}
              />

              <FormControlLabel
                sx={{ color: "white", mt: 1, "& .MuiCheckbox-root": { color: "rgba(255, 255, 255, 0.7)" } }}
                control={<Checkbox checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} sx={{ color: "white", "&.Mui-checked": { color: "white" } }} />}
                label="Register as Admin"
              />

              <Button type="submit" variant="contained" fullWidth sx={buttonStyles} disabled={isLoading}>
                {isLoading ? "Processing..." : (isAdmin ? "Request Admin Access" : "Sign Up")}
              </Button>

              <Button variant="text" fullWidth sx={{ mt: 2, color: "rgba(255, 255, 255, 0.6)", textTransform: "none", "&:hover": { color: "white", background: "transparent" } }} onClick={() => navigate("/")}>
                Already have an account? <span style={{ marginLeft: "5px", textDecoration: "underline" }}>Login</span>
              </Button>
            </form>
          </Box>
        </Box>
      </Box>

      {/* SNACKBAR */}
      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Reusable Styles to keep the code clean
const inputStyles = {
  "& .MuiInputLabel-root": { color: "rgba(255, 255, 255, 0.7)" },
  "& .MuiInputBase-input": { color: "white" },
  "& .MuiInput-underline:before": { borderBottomColor: "rgba(255, 255, 255, 0.4)" },
  "& .MuiInput-underline:hover:before": { borderBottomColor: "white !important" },
  "& .MuiInput-underline:after": { borderBottomColor: "white" },
};

const buttonStyles = {
  mt: 3, 
  py: 1.5, 
  backgroundColor: "white", 
  color: "#060745", 
  fontWeight: "bold", 
  borderRadius: "30px", 
  "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.9)" }
};

export default UserSignup;