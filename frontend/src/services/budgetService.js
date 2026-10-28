const KEY = "spentwise_budget";

export function getBudget() {
    try {
        const value = Number(localStorage.getItem(KEY));
        return Number.isFinite(value) && value > 0 ? value : 0;
    } catch {
        return 0;
    }
}

export function saveBudget(value) {
    try {
        localStorage.setItem(KEY, String(value));
    } catch {
        // ignore
    }
}