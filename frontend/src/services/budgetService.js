import { api } from "./api";

export async function getBudget() {
    const data = await api.get("/budget");
    return data.amount;
}

export const saveBudget = (amount) => api.put("/budget", { amount });