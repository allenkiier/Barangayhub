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
  Snackbar, // Added
  Alert     // Added
} from "@mui/material";
import WalkIns from "../components/WalkIns";

export default function UserLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // --- Snackbar State ---
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [severity, setSeverity] = useState("error"); // can be 'error', 'success', 'info', 'warning'

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpenSnackbar(false);
  };

  const showError = (msg) => {
    setAlertMsg(msg);
    setSeverity("error");
    setOpenSnackbar(true);
  };
  // ----------------------

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:3001/api/login", {
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
        showError(data.error || "Login failed");
        return;
      }

      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("userid", data.userid);

      if (data.isAdmin) {
        navigate("/admin-dash");
      } else {
        navigate("/user-dash");
      }
    } catch (err) {
      console.error(err);
      showError("Server error during login");
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
        overflowX: "hidden" 
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
        <Box sx={{ flex: 1, display: "flex", justifyContent: { xs: "center", md: "flex-start" }, width: "100%" }}>
          <WalkIns />
        </Box>

        <Box sx={{ flex: 1, display: "flex", justifyContent: { xs: "center", md: "flex-end" }, width: "100%" }}>
          <Box sx={{ width: "100%", maxWidth: 400 }}>
            <Typography variant="h4" fontWeight="bold" color="white" textAlign="center" gutterBottom sx={{ mb: 4 }}>
              User Login
            </Typography>

            <form onSubmit={handleSubmit}>
              <TextField
                label="Email"
                fullWidth
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                variant="standard"
                sx={{
                  "& .MuiInputLabel-root": { color: "rgba(255, 255, 255, 0.7)" },
                  "& .MuiInputBase-input": { color: "white" },
                  "& .MuiInput-underline:before": { borderBottomColor: "rgba(255, 255, 255, 0.4)" },
                  "& .MuiInput-underline:hover:before": { borderBottomColor: "white !important" },
                  "& .MuiInput-underline:after": { borderBottomColor: "white" },
                }}
              />

              <TextField
                label="Password"
                type="password"
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                variant="standard"
                sx={{
                  "& .MuiInputLabel-root": { color: "rgba(255, 255, 255, 0.7)" },
                  "& .MuiInputBase-input": { color: "white" },
                  "& .MuiInput-underline:before": { borderBottomColor: "rgba(255, 255, 255, 0.4)" },
                  "& .MuiInput-underline:hover:before": { borderBottomColor: "white !important" },
                  "& .MuiInput-underline:after": { borderBottomColor: "white" },
                }}
              />

              <FormControlLabel
                sx={{ color: "white", mt: 1, "& .MuiCheckbox-root": { color: "rgba(255, 255, 255, 0.7)" } }}
                control={<Checkbox checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} sx={{ color: "white", "&.Mui-checked": { color: "white" } }} />}
                label="Login as Admin"
              />

              <Button type="submit" variant="contained" fullWidth sx={{ mt: 4, py: 1.5, backgroundColor: "white", color: "#060745", fontWeight: "bold", borderRadius: "30px", "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.9)" } }} disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>

              <Button variant="text" fullWidth sx={{ mt: 2, color: "rgba(255, 255, 255, 0.6)", textTransform: "none", "&:hover": { color: "white", background: "transparent" } }} onClick={() => navigate("/signup")}>
                Don't have an account? <span style={{ marginLeft: "5px", textDecoration: "underline" }}>Sign Up</span>
              </Button>
            </form>
          </Box>
        </Box>
      </Box>

      {/* --- SNACKBAR COMPONENT --- */}
      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={severity} variant="filled" sx={{ width: '100%' }}>
          {alertMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}