import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

export default function UserLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false); // Admin checkbox
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!email || !password) {
    alert("Please fill in all fields");
    return;
  }

  setIsLoading(true);

  try {
    const response = await fetch("http://localhost:3001/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_ad: email,
        password,
        isAdmin,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Login failed");
      return;
    }

    // ✅ Store session data
    localStorage.setItem("token", data.token);
    localStorage.setItem("userid", data.userid);
    localStorage.setItem("isAdmin", data.isAdmin);

    // ✅ Redirect based on role (BACKEND decides truth)
    if (data.isAdmin) {
      navigate("/admin-dash");
    } else {
      navigate("/user-dash");
    }
  } catch (err) {
    console.error(err);
    alert("Server error during login");
  } finally {
    setIsLoading(false);
  }
};

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        width="450px"
      >
        <Card sx={{ width: "100%" }}>
          <CardHeader
            title={<Typography variant="h5">User Login</Typography>}
            sx={{ textAlign: "center", pb: 0 }}
          />
          <CardContent sx={{ pt: 2 }}>
            <form onSubmit={handleSubmit}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isAdmin}
                    onChange={(e) => setIsAdmin(e.target.checked)}
                  />
                }
                label="Logging in as Admin?"
                sx={{ mt: 1 }}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2 }}
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
              <Button
                type="button"
                variant="outlined"
                fullWidth
                sx={{ mt: 1 }}
                onClick={() => navigate("/signup")}
              >
                Sign Up
              </Button>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}