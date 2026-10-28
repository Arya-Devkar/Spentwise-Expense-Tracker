// Starting categories. Users can add more at runtime (stored via categoryService).
export const DEFAULT_CATEGORIES = [
    "Food",
    "Transport",
    "Rent",
    "Shopping",
    "Bills",
    "Entertainment",
    "Health",
    "Other",
];

export const MAX_CATEGORY_LENGTH = 30;

// Reserved <option> value for "+ Add new category…".
// It is never saved as a real category (Dashboard rejects it as a name).
export const ADD_CATEGORY_OPTION = "__add_new_category__";