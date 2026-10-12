import api from "./api";
export type Expense = {
  _id?: string;
  id?: string | number;
  title: string;
  amount: number;
  category: string;
  date: string;
  status: string;
};
// Existing: saare expenses fetch karna
export const getExpenses = async () => {
  const response = await api.get("/expenses");
  return response.data;
};

// Existing: naya expense create karna
export const createExpense = async (data: {
  title: string;
  amount: number;
  category: string;
  date: string;
}) => {
  const response = await api.post("/expenses", data);
  return response.data;
};

// Expense update karna
export const updateExpense = async (
  id: string,
  data: {
    title: string;
    amount: number;
    category: string;
    date: string;
  }
) => {
  const response = await api.patch(`/expenses/${id}`, data);
  return response.data;
};
// Draft expense ko approval ke liye submit karna
export const submitExpense = async (id: string) => {
  const response = await api.post(`/expenses/${id}/submit`);
  return response.data;
};

 // Admin expense approve kare
export const approveExpense = async (id: string) => {
  const response = await api.post(`/expenses/${id}/approve`);
  return response.data;
};

// Admin expense reject kare
export const rejectExpense = async (id: string) => {
  const response = await api.post(`/expenses/${id}/reject`);
  return response.data;
};
// Rejected expense ko dobara approval ke liye bhejna
export const resubmitExpense = async (id: string) => {
  const response = await api.post(`/expenses/${id}/resubmit`);
  return response.data;
};
// Expense ki details fetch karna
export const getExpenseById = async (id: string) => {
  const response = await api.get(`/expenses/${id}`);
  return response.data;
};

// Admin expense delete kare
export const deleteExpense = async (id: string) => {
  const response = await api.delete(`/expenses/${id}`);
  return response.data;
};