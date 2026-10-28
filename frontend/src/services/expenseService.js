const KEY = "spentwise_expenses";

export function getExpenses() {
    try {
        const parsed = JSON.parse(localStorage.getItem(KEY));
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function saveExpenses(expenses) {
    try {
        localStorage.setItem(KEY, JSON.stringify(expenses));
    } catch {
        // storage full or blocked: ignore
    }
}