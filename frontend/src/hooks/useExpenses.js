import { useEffect, useState } from "react";
import {
    createExpense,
    deleteExpense as apiDelete,
    getExpenses,
    updateExpense as apiUpdate,
} from "../services/expenseService";

function useExpenses() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Load once when the component mounts
    useEffect(() => {
        let ignore = false; // avoids setting state after unmount
        getExpenses()
            .then((data) => {
                if (!ignore) setExpenses(data);
            })
            .catch((err) => {
                if (!ignore) setError(err.message);
            })
            .finally(() => {
                if (!ignore) setLoading(false);
            });
        return () => {
            ignore = true;
        };
    }, []);

    // Each function waits for the server, THEN updates local state.
    // If the request fails it throws, and the caller shows the message.
    const addExpense = async (expense) => {
        const created = await createExpense(expense);
        setExpenses((prev) => [created, ...prev]);
        return created;
    };

    const deleteExpense = async (id) => {
        await apiDelete(id);
        setExpenses((prev) => prev.filter((e) => e.id !== id));
    };

    const updateExpense = async (id, changes) => {
        const updated = await apiUpdate(id, changes);
        setExpenses((prev) => prev.map((e) => (e.id === id ? updated : e)));
        return updated;
    };

    return { expenses, loading, error, addExpense, deleteExpense, updateExpense };
}

export default useExpenses;