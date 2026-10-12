import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from "@mui/material";

import { DataGrid, type GridColDef } from "@mui/x-data-grid";

import {
  getExpenses,
  submitExpense,
  resubmitExpense,
  approveExpense,
  rejectExpense,
  getExpenseById,
  deleteExpense,
  type Expense,
} from "../services/expense.service";

// API se array ya paginated response handle karna
type ExpenseResponse = {
  data?: Expense[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
};

// JWT token se user ka role read karna
function getUserRole(): string {
  try {
    const token = localStorage.getItem("token");

    if (!token) return "";

    const payload = token.split(".")[1];

    if (!payload) return "";

    // Base64URL ko normal Base64 mein convert karna
    const base64 = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const decodedPayload = atob(
      base64.padEnd(
        base64.length + ((4 - (base64.length % 4)) % 4),
        "="
      )
    );

    const user = JSON.parse(decodedPayload);

    return user.role ?? "";
  } catch {
    return "";
  }
}

function Dashboard() {
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(
    null
  );

  // Expense details dialog ke liye state
  const [selectedExpense, setSelectedExpense] =
    useState<Expense | null>(null);
  const [viewOpen, setViewOpen] = useState(false);

  // JWT role ke basis par Admin actions dikhana
  const isAdmin = getUserRole() === "Admin";

  // Backend se expenses load karna
  const loadExpenses = async () => {
    try {
      setError("");

      const response: ExpenseResponse | Expense[] =
        await getExpenses();

      const expenseList = Array.isArray(response)
        ? response
        : response.data ?? [];

      setExpenses(expenseList);
    } catch (err: any) {
      const message = err.response?.data?.message;

      setError(
        Array.isArray(message)
          ? message.join(", ")
          : message || "Failed to load expenses"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  // API errors ko readable message mein convert karna
  const getErrorMessage = (err: any, fallback: string) => {
    const message = err.response?.data?.message;

    return Array.isArray(message)
      ? message.join(", ")
      : message || fallback;
  };

  // Draft expense submit karna
  const handleSubmitExpense = async (id: string) => {
    try {
      setActionLoading(id);
      setActionMessage("");
      setError("");

      await submitExpense(id);

      setActionMessage("Expense submitted successfully!");

      await loadExpenses();
    } catch (err: any) {
      setError(
        getErrorMessage(err, "Failed to submit expense")
      );
    } finally {
      setActionLoading(null);
    }
  };

  // Rejected expense dobara submit karna
  const handleResubmitExpense = async (id: string) => {
    try {
      setActionLoading(id);
      setActionMessage("");
      setError("");

      await resubmitExpense(id);

      setActionMessage("Expense resubmitted successfully!");

      await loadExpenses();
    } catch (err: any) {
      setError(
        getErrorMessage(err, "Failed to resubmit expense")
      );
    } finally {
      setActionLoading(null);
    }
  };

  // Admin expense approve kare
  const handleApprove = async (id: string) => {
    try {
      setActionLoading(id);
      setActionMessage("");
      setError("");

      await approveExpense(id);

      setActionMessage("Expense approved successfully!");

      await loadExpenses();
    } catch (err: any) {
      setError(
        getErrorMessage(err, "Failed to approve expense")
      );
    } finally {
      setActionLoading(null);
    }
  };

  // Admin expense reject kare
  const handleReject = async (id: string) => {
    try {
      setActionLoading(id);
      setActionMessage("");
      setError("");

      await rejectExpense(id);

      setActionMessage("Expense rejected successfully!");

      await loadExpenses();
    } catch (err: any) {
      setError(
        getErrorMessage(err, "Failed to reject expense")
      );
    } finally {
      setActionLoading(null);
    }
  };

  // Admin expense ki details dekhe
  const handleViewExpense = async (id: string) => {
    try {
      setError("");
      setActionMessage("");

      const expense = await getExpenseById(id);

      // API populated object ya wrapped response return kar sakti hai
      const details = expense?.data ?? expense;

      setSelectedExpense(details);
      setViewOpen(true);
    } catch (err: any) {
      setError(
        getErrorMessage(err, "Failed to load expense details")
      );
    }
  };

  // Admin expense delete kare
  const handleDeleteExpense = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this expense?"
    );

    if (!confirmed) return;

    try {
      setActionLoading(id);
      setActionMessage("");
      setError("");

      await deleteExpense(id);

      setActionMessage("Expense deleted successfully!");

      // Deleted expense agar dialog mein khula ho toh close karna
      setViewOpen(false);
      setSelectedExpense(null);

      await loadExpenses();
    } catch (err: any) {
      setError(
        getErrorMessage(err, "Failed to delete expense")
      );
    } finally {
      setActionLoading(null);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Summary cards ke counts
  const totalExpenses = expenses.length;

  const approvedExpenses = expenses.filter(
    (expense) => expense.status === "Approved"
  ).length;

  const pendingExpenses = expenses.filter(
    (expense) => expense.status === "Submitted"
  ).length;

  const rejectedExpenses = expenses.filter(
    (expense) => expense.status === "Rejected"
  ).length;

  // Table columns
  const columns: GridColDef[] = [
    {
      field: "title",
      headerName: "Expense Title",
      flex: 1.3,
      minWidth: 150,
    },
    {
      field: "amount",
      headerName: "Amount (₹)",
      type: "number",
      flex: 0.8,
      minWidth: 120,
    },
    {
      field: "category",
      headerName: "Category",
      flex: 0.9,
      minWidth: 130,
    },
    {
      field: "date",
      headerName: "Date",
      flex: 0.8,
      minWidth: 120,
      valueFormatter: (value) => {
        if (!value) return "";

        const date = new Date(value);

        return Number.isNaN(date.getTime())
          ? String(value)
          : date.toLocaleDateString();
      },
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.8,
      minWidth: 120,
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      filterable: false,
      minWidth: isAdmin ? 420 : 300,
      renderCell: (params) => {
        const status = params.row.status;

        const expenseId = String(
          params.row._id ?? params.row.id
        );

        const isBusy = actionLoading === expenseId;

        return (
          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "center",
              height: "100%",
              flexWrap: "wrap",
            }}
          >
            {/* Admin ke actions */}
            {isAdmin && (
              <>
                <Button
                  size="small"
                  variant="outlined"
                  disabled={isBusy}
                  onClick={() => handleViewExpense(expenseId)}
                >
                  View
                </Button>

                {status === "Submitted" && (
                  <>
                    <Button
                      size="small"
                      color="success"
                      variant="contained"
                      disabled={isBusy}
                      onClick={() => handleApprove(expenseId)}
                    >
                      {isBusy ? "Please wait..." : "Approve"}
                    </Button>

                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      disabled={isBusy}
                      onClick={() => handleReject(expenseId)}
                    >
                      Reject
                    </Button>
                  </>
                )}

                <Button
                  size="small"
                  color="error"
                  variant="outlined"
                  disabled={isBusy}
                  onClick={() => handleDeleteExpense(expenseId)}
                >
                  Delete
                </Button>
              </>
            )}

            {/* Employee ke actions */}
            {!isAdmin && (
              <>
                {/* Draft aur Rejected expenses edit kar sakte hain */}
                <Button
                  size="small"
                  variant="outlined"
                  disabled={
                    (status !== "Draft" &&
                      status !== "Rejected") ||
                    isBusy
                  }
                  onClick={() =>
                    navigate(`/edit-expense/${expenseId}`)
                  }
                >
                  Edit
                </Button>

                {/* Draft expense submit karna */}
                {status === "Draft" && (
                  <Button
                    size="small"
                    variant="contained"
                    disabled={isBusy}
                    onClick={() => handleSubmitExpense(expenseId)}
                  >
                    {isBusy ? "Please wait..." : "Submit"}
                  </Button>
                )}

                {/* Rejected expense dobara submit karna */}
                {status === "Rejected" && (
                  <Button
                    size="small"
                    variant="contained"
                    color="warning"
                    disabled={isBusy}
                    onClick={() => handleResubmitExpense(expenseId)}
                  >
                    {isBusy ? "Please wait..." : "Resubmit"}
                  </Button>
                )}
              </>
            )}
          </Box>
        );
      },
    },
  ];

  // DataGrid ke liye unique row ID
  const rows = expenses.map((expense) => ({
    ...expense,
    id: expense._id ?? expense.id,
  }));

  return (
    <Box sx={{ p: 3 }}>
      {/* Dashboard heading */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          mb: 4,
        }}
      >
        <Typography variant="h4">
          Expense Dashboard
        </Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          {!isAdmin && (
            <Button
              variant="contained"
              onClick={() => navigate("/add-expense")}
            >
              Add Expense
            </Button>
          )}

          <Button
            variant="outlined"
            color="error"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </Box>

      {/* Error message */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button
              color="inherit"
              onClick={loadExpenses}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Success message */}
      {actionMessage && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setActionMessage("")}
        >
          {actionMessage}
        </Alert>
      )}

      {/* Expense summary cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          {
            title: "Total Expenses",
            count: totalExpenses,
          },
          {
            title: "Approved",
            count: approvedExpenses,
          },
          {
            title: "Pending Approval",
            count: pendingExpenses,
          },
          {
            title: "Rejected",
            count: rejectedExpenses,
          },
        ].map((item) => (
          <Grid
            key={item.title}
            size={{ xs: 12, sm: 6, md: 3 }}
          >
            <Card>
              <CardContent sx={{ textAlign: "center" }}>
                <Typography color="text.secondary">
                  {item.title}
                </Typography>

                <Typography variant="h4" sx={{ mt: 1 }}>
                  {item.count}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Expenses table */}
      <Typography
        variant="h5"
        sx={{ mb: 2, textAlign: "center" }}
      >
        {isAdmin ? "Expenses for Approval" : "My Expenses"}
      </Typography>

      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            p: 5,
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row.id}
          autoHeight
          pageSizeOptions={[5, 10, 25]}
          initialState={{
            pagination: {
              paginationModel: {
                page: 0,
                pageSize: 5,
              },
            },
          }}
          disableRowSelectionOnClick
        />
      )}

      {/* Expense details dialog */}
      <Dialog
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Expense Details</DialogTitle>

        <DialogContent dividers>
          {selectedExpense && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography>
                <strong>Title:</strong> {selectedExpense.title}
              </Typography>

              <Divider />

              <Typography>
                <strong>Amount:</strong> ₹{selectedExpense.amount}
              </Typography>

              <Divider />

              <Typography>
                <strong>Category:</strong> {selectedExpense.category}
              </Typography>

              <Divider />

              <Typography>
                <strong>Date:</strong>{" "}
                {selectedExpense.date
                  ? new Date(selectedExpense.date).toLocaleDateString()
                  : "N/A"}
              </Typography>

              <Divider />

              <Typography>
                <strong>Status:</strong> {selectedExpense.status}
              </Typography>

              {/* Backend populate kare toh employee details dikhana */}
              {(selectedExpense as any).employeeId && (
                <>
                  <Divider />

                  <Typography>
                    <strong>Employee:</strong>{" "}
                    {(selectedExpense as any).employeeId.name ??
                      (selectedExpense as any).employeeId.email ??
                      String((selectedExpense as any).employeeId)}
                  </Typography>
                </>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setViewOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Dashboard;
