import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { signup } from "../services/auth.service";

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Dono passwords match hone chahiye
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      // Backend registration API call
      await signup({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      setSuccess("Account created successfully!");

      // Registration ke baad Login page par jao
      navigate("/login", {
        state: { message: "Signup successful. Please login." },
      });
    } catch (err: any) {
      // Backend se aayi error message show karo
      const message = err.response?.data?.message;

      setError(
        Array.isArray(message)
          ? message.join(", ")
          : message || "Signup failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={4} sx={{ p: 4, mt: 6, borderRadius: 3 }}>
        <Typography sx={{ variant: "h4", textAlign: "center" }} gutterBottom>
          Create Account
        </Typography>

        <Typography
          
          sx={{ mb: 3 ,color:"text.secondary",
          textAlign:"center"}}
        >
          Smart Expense Management System
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSignup}>
          <TextField
            label="Full Name"
            fullWidth
            required
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

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

          <TextField
            label="Confirm Password"
            type="password"
            fullWidth
            required
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <TextField
            label="Role"
            value="Employee"
            fullWidth
            margin="normal"
            slotProps={{ input: { readOnly: true } }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{ mt: 3, py: 1.3 }}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </Button>
        </Box>

        <Typography sx={{ mt: 3 ,textAlign:"center" }}>
          Already have an account?{" "}
          <Link to="/login">Login</Link>
        </Typography>
      </Paper>
    </Container>
  );
}

export default Signup;
