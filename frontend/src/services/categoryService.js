import { api } from "./api";

export const getCategories = () => api.get("/categories");
export const createCategory = (name) => api.post("/categories", { name });