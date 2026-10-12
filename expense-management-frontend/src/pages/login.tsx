
import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

import { login } from "../services/auth.service";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const message = location.state?.message;

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Backend login API call
      const data = await login({
        email: email.trim(),
        password,
      });

      // JWT token browser mein save karo
      localStorage.setItem("token", data.access_token);

      // Login successful hone par dashboard par jao
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      const serverMessage = err.response?.data?.message;

      setError(
        Array.isArray(serverMessage)
          ? serverMessage.join(", ")
          : serverMessage || "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={4} sx={{ p: 4, mt: 6, borderRadius: 3 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Welcome Back
        </Typography>

        <Typography color="text.secondary" align="center" sx={{ mb: 3 }}>
          Login to your expense account
        </Typography>

        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleLogin}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            label="Password"
            type="password"
            fullWidth
            required
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{ mt: 3, py: 1.3 }}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </Box>

        <Typography
          component="p"
          align="center"
          sx={{ mt: 3 }}
        >
          Don't have an account?{" "}
          <Link
            to="/signup"
            style={{ textDecoration: "none", color: "#1976d2" }}
          >
            Sign Up
          </Link>
        </Typography>
      </Paper>
    </Container>
  );
}

export default Login;
