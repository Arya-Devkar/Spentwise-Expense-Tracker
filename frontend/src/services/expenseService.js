import { api } from "./api";

export const getExpenses = () => api.get("/expenses");
export const createExpense = (expense) => api.post("/expenses", expense);
export const updateExpense = (id, values) => api.put(`/expenses/${id}`, values);
export const deleteExpense = (id) => api.del(`/expenses/${id}`);