import { api } from "./api";

export const getSubscriptions = () => api.get("/subscriptions");
export const createSubscription = (sub) => api.post("/subscriptions", sub);
export const updateSubscription = (id, values) => api.put(`/subscriptions/${id}`, values);
export const deleteSubscription = (id) => api.del(`/subscriptions/${id}`);