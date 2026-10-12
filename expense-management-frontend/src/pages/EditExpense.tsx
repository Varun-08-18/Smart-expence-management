
import { useEffect, useState, type FormEvent } from "react";
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  MenuItem,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { getExpenses, updateExpense } from "../services/expense.service";

function EditExpense() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadExpense = async () => {
      try {
        const response = await getExpenses();
        const expenses = Array.isArray(response)
          ? response
          : response?.data ?? [];

        const expense = expenses.find(
          (item: { _id?: string; id?: string }) =>
            (item._id ?? item.id) === id
        );

        if (!expense) {
          setError("Expense not found.");
          return;
        }

        if (expense.status === "Approved") {
          setError("Approved expenses cannot be edited.");
          return;
        }

        if (expense.status !== "Rejected") {
          setError("Only rejected expenses can be edited.");
          return;
        }

        setTitle(expense.title ?? "");
        setAmount(String(expense.amount ?? ""));
        setCategory(expense.category ?? "");
        setDate(
          expense.date ? new Date(expense.date).toISOString().slice(0, 10) : ""
        );
      } catch {
        setError("Failed to load expense.");
      } finally {
        setLoading(false);
      }
    };

    loadExpense();
  }, [id]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!id || !title.trim() || !amount || !category || !date) {
      setError("Please fill in all fields.");
      return;
    }

    if (Number(amount) <= 0) {
      setError("Amount must be greater than zero.");
      return;
    }

    if (new Date(`${date}T00:00:00`) > new Date()) {
      setError("Expense date cannot be in the future.");
      return;
    }

    try {
      setSaving(true);

      await updateExpense(id, {
        title: title.trim(),
        amount: Number(amount),
        category,
        date,
      });

      navigate("/dashboard");
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
          : message || "Failed to update expense."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", p: 3 }}>
      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
          Edit Expense
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!error && (
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
              slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }}
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
              {[
                "Travel",
                "Food",
                "Office Supplies",
                "Accommodation",
                "Other",
              ].map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
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
              <Button type="submit" variant="contained" disabled={saving}>
                {saving ? "Saving..." : "Update Expense"}
              </Button>

              <Button
                variant="outlined"
                onClick={() => navigate("/dashboard")}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default EditExpense;
