const KEY = "spentwise_subscriptions";

export function getSubscriptions() {
    try {
        const parsed = JSON.parse(localStorage.getItem(KEY));
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function saveSubscriptions(list) {
    try {
        localStorage.setItem(KEY, JSON.stringify(list));
    } catch {
        // storage full or blocked: ignore
    }
}