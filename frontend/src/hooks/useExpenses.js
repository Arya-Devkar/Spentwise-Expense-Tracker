import { useEffect, useState } from "react";
import { getExpenses, saveExpenses } from "../services/expenseService";

// Custom hook: reusable stateful logic. Components don't know about storage.
function useExpenses() {
    const [expenses, setExpenses] = useState(getExpenses); // lazy initializer

    useEffect(() => {
        saveExpenses(expenses); // sync to storage whenever expenses change
    }, [expenses]);

    const addExpense = (expense) => setExpenses((prev) => [expense, ...prev]);

    const deleteExpense = (id) =>
        setExpenses((prev) => prev.filter((e) => e.id !== id));

    const updateExpense = (id, changes) =>
        setExpenses((prev) =>
            prev.map((e) => (e.id === id ? { ...e, ...changes } : e))
        );

    return { expenses, addExpense, deleteExpense, updateExpense };
}

export default useExpenses;