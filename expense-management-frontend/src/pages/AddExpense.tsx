import { useState, type FormEvent } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  MenuItem,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { createExpense } from "../services/expense.service";

function AddExpense() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    // Basic form validation
    if (!title.trim() || !category || !date || !amount) {
      setError("Please fill in all fields.");
      return;
    }

    if (Number(amount) <= 0) {
      setError("Amount must be greater than zero.");
      return;
    }

    if (new Date(date) > new Date()) {
      setError("Expense date cannot be in the future.");
      return;
    }

    try {
      setLoading(true);

      await createExpense({
        title: title.trim(),
        amount: Number(amount),
        category,
        date,
      });

      setSuccess("Expense created successfully!");

      // Dashboard par wapas jaana
      setTimeout(() => {
        navigate("/dashboard");
      }, 800);
    } catch (err: unknown) {
      const message =
        typeof err === "object" &&
        err !== null &&
        "response" in err
          ? (err as {
              response?: {
                data?: { message?: string | string[] };
              };
            }).response?.data?.message
          : undefined;

      setError(
        Array.isArray(message)
          ? message.join(", ")
          : message || "Failed to create expense."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", p: 3 }}>
      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
          Add Expense
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

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Expense Title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            fullWidth
            required
            margin="normal"
          />

          <TextField
            label="Amount"
            type="number"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            fullWidth
            required
            margin="normal"
            slotProps={{
              htmlInput: { min: 0.01, step: 0.01 },
            }}
          />

          <TextField
            select
            label="Category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            fullWidth
            required
            margin="normal"
          >
            {["Travel", "Food", "Office Supplies", "Accommodation", "Other"].map(
              (item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              )
            )}
          </TextField>

          <TextField
            label="Expense Date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            fullWidth
            required
            margin="normal"
            slotProps={{
              inputLabel: { shrink: true },
              htmlInput: {
                max: new Date().toLocaleDateString("en-CA"),
              },
            }}
          />

          <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? "Saving..." : "Create Expense"}
            </Button>

            <Button
              variant="outlined"
              onClick={() => navigate("/dashboard")}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default AddExpense;
