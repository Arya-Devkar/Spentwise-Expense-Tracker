import { DEFAULT_CATEGORIES } from "../constants/categories";

const STORAGE_KEY = "spentwise:categories";

// Only this file knows categories live in localStorage.
// When the backend arrives, only this file changes.
export function getCategories() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const isValid =
        Array.isArray(parsed) &&
        parsed.length > 0 &&
        parsed.every((item) => typeof item === "string");
      if (isValid) return parsed;
    }
  } catch {
    // Corrupt or unavailable storage: fall through to defaults
  }
  return [...DEFAULT_CATEGORIES];
}

export function saveCategories(categories) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  } catch {
    // Storage full or blocked (private mode): the app still works for this session
  }
}