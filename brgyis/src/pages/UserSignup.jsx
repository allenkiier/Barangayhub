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

const UserSignup = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isAdmin, setIsAdmin] = useState(false); // true if checkbox checked
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    // Validation
    if (!name || !email || !password || !confirm) {
      alert("Please fill all fields");
      return;
    }

    if (password !== confirm) {
      alert("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3001/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_name: name,
          email_ad: email,
          password,
          isAdmin: isAdmin === true, // explicitly send true/false
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Signup failed");
      } else {
        alert("Account created successfully");
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      alert("Server error during signup");
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
      >
        <Card sx={{ width: "100%" }}>
          <CardHeader
            title={<Typography variant="h5">Create Account</Typography>}
            subheader={
              <Typography variant="body2">
                Sign up with your email to use the portal
              </Typography>
            }
            sx={{ textAlign: "center", pb: 0 }}
          />
          <CardContent sx={{ pt: 2 }}>
            <form onSubmit={handleSignup}>
              <TextField
                label="Full Name"
                fullWidth
                margin="normal"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <TextField
                label="Email Address"
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
              <TextField
                label="Confirm Password"
                type="password"
                fullWidth
                margin="normal"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={isAdmin}
                    onChange={(e) => setIsAdmin(e.target.checked)}
                  />
                }
                label="Admin"
                sx={{ mt: 1 }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{ mt: 2 }}
                disabled={isLoading}
              >
                {isLoading
                  ? "Submitting..."
                  : isAdmin
                  ? "Submit Request Authenticator"
                  : "Sign Up"}
              </Button>

              <Button
                type="button"
                variant="outlined"
                fullWidth
                sx={{ mt: 1 }}
                onClick={() => navigate("/")}
              >
                Back to Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default UserSignup;