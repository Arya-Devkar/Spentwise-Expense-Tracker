import { useEffect, useId, useRef, useState } from "react";
import {
    ADD_CATEGORY_OPTION,
    MAX_CATEGORY_LENGTH,
} from "../constants/categories";
import { getTodayLocal } from "../utils/date";
import "./ExpenseForm.css";

// Blank values for a new expense, or the expense's values when editing.
function getInitialValues(categories, expense) {
    if (expense) {
        return {
            title: expense.title,
            amount: String(expense.amount),
            category: expense.category,
            date: expense.date,
        };
    }
    return {
        title: "",
        amount: "", // kept as a string while typing; converted on submit
        category: categories[0],
        date: getTodayLocal(),
    };
}

function ExpenseForm({
    categories,
    onAddExpense,
    onAddCategory,
    editingExpense,
    onUpdateExpense,
    onCancelEdit,
}) {
    const [formData, setFormData] = useState(() =>
        getInitialValues(categories, editingExpense)
    );
    const [error, setError] = useState("");
    // true while a request to the server is in flight (prevents double submit)
    const [saving, setSaving] = useState(false);

    // "+ Add new category…" flow
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategory, setNewCategory] = useState("");
    const [categoryError, setCategoryError] = useState("");

    const baseId = useId();
    const selectRef = useRef(null);
    const newCategoryRef = useRef(null);

    // Move focus to the new-category field when it appears
    useEffect(() => {
        if (isAddingCategory) newCategoryRef.current?.focus();
    }, [isAddingCategory]);

    // Guard against a stale selection (e.g. the saved category no longer exists)
    const selectedCategory = categories.includes(formData.category)
        ? formData.category
        : categories[0];

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (error) setError("");
    }

    function closeAddCategory() {
        setIsAddingCategory(false);
        setNewCategory("");
        setCategoryError("");
        selectRef.current?.focus(); // give focus back to the dropdown
    }

    function handleCategoryChange(e) {
        const { value } = e.target;

        if (value === ADD_CATEGORY_OPTION) {
            // Open the add field. Do NOT store the sentinel in formData.
            setIsAddingCategory(true);
            return;
        }

        // A real category was picked: close the add field if it was open
        if (isAddingCategory) {
            setIsAddingCategory(false);
            setNewCategory("");
            setCategoryError("");
        }
        handleChange(e);
    }

    // async: the parent now saves the category on the server and returns a Promise
    async function handleAddCategory() {
        const result = await onAddCategory(newCategory);

        if (!result.ok) {
            setCategoryError(result.message);
            return;
        }

        setFormData((prev) => ({ ...prev, category: result.name }));
        closeAddCategory();
    }

    function handleNewCategoryKeyDown(e) {
        if (e.key === "Enter") {
            e.preventDefault(); // Enter adds the category, not the whole expense
            handleAddCategory();
        } else if (e.key === "Escape") {
            e.preventDefault();
            closeAddCategory();
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (saving) return;

        if (isAddingCategory) {
            setError("Finish adding the new category, or cancel it, first.");
            return;
        }

        const title = formData.title.trim();
        const amount = Number(formData.amount);

        if (!title) {
            setError("Please enter a title.");
            return;
        }
        if (!Number.isFinite(amount) || amount <= 0) {
            setError("Amount must be a number greater than 0.");
            return;
        }
        if (!formData.date) {
            setError("Please choose a date.");
            return;
        }

        const values = {
            title,
            amount,
            category: selectedCategory,
            date: formData.date,
        };

        setSaving(true);
        try {
            if (editingExpense) {
                // Dashboard leaves edit mode itself when the update succeeds
                await onUpdateExpense(editingExpense.id, values);
                return;
            }

            // The server generates the real id; this one is ignored by the API
            const ok = await onAddExpense({ id: crypto.randomUUID(), ...values });

            // Clear the form only if the server accepted it. On failure the
            // user keeps what they typed and sees the error notification.
            if (ok) {
                setFormData(getInitialValues(categories));
                setError("");
            }
        } finally {
            setSaving(false);
        }
    }

    return (
        <form className="expense-form" onSubmit={handleSubmit} noValidate>
            <h2 className="expense-form__title">
                {editingExpense ? "Edit expense" : "Expense"}
            </h2>

            <div className="expense-form__grid">
                <div className="expense-form__field expense-form__field--wide">
                    <label htmlFor={`${baseId}-title`}>Title</label>
                    <input
                        id={`${baseId}-title`}
                        name="title"
                        type="text"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g. Lunch at cafe"
                        maxLength={80}
                        required
                    />
                </div>

                <div className="expense-form__field">
                    <label htmlFor={`${baseId}-amount`}>Amount</label>
                    <input
                        id={`${baseId}-amount`}
                        name="amount"
                        type="number"
                        inputMode="decimal"
                        min="0.01"
                        step="0.01"
                        value={formData.amount}
                        onChange={handleChange}
                        placeholder="0.00"
                        required
                    />
                </div>

                <div className="expense-form__field">
                    <label htmlFor={`${baseId}-category`}>Category</label>
                    <select
                        id={`${baseId}-category`}
                        name="category"
                        ref={selectRef}
                        value={isAddingCategory ? ADD_CATEGORY_OPTION : selectedCategory}
                        onChange={handleCategoryChange}
                    >
                        {categories.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                        <option value={ADD_CATEGORY_OPTION}>+ Add new category…</option>
                    </select>
                </div>

                <div className="expense-form__field">
                    <label htmlFor={`${baseId}-date`}>Date</label>
                    <input
                        id={`${baseId}-date`}
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                    />
                </div>

                {isAddingCategory && (
                    <div className="expense-form__field expense-form__field--wide">
                        <label htmlFor={`${baseId}-new-category`}>New category name</label>
                        <div className="expense-form__add-row">
                            <input
                                id={`${baseId}-new-category`}
                                ref={newCategoryRef}
                                type="text"
                                value={newCategory}
                                onChange={(e) => {
                                    setNewCategory(e.target.value);
                                    if (categoryError) setCategoryError("");
                                }}
                                onKeyDown={handleNewCategoryKeyDown}
                                placeholder="e.g. Groceries"
                                maxLength={MAX_CATEGORY_LENGTH}
                                aria-describedby={
                                    categoryError ? `${baseId}-category-error` : undefined
                                }
                                aria-invalid={categoryError ? "true" : "false"}
                            />
                            <button
                                type="button"
                                className="expense-form__add-btn"
                                onClick={handleAddCategory}
                            >
                                Add
                            </button>
                            <button
                                type="button"
                                className="expense-form__cancel-btn"
                                onClick={closeAddCategory}
                            >
                                Cancel
                            </button>
                        </div>
                        {categoryError && (
                            <p
                                id={`${baseId}-category-error`}
                                className="expense-form__error expense-form__error--inline"
                                role="alert"
                            >
                                {categoryError}
                            </p>
                        )}
                    </div>
                )}
            </div>

            {error && (
                <p className="expense-form__error" role="alert">
                    {error}
                </p>
            )}

            <div className="expense-form__actions">
                <button
                    type="submit"
                    className="expense-form__submit"
                    disabled={saving}
                >
                    {saving
                        ? "Saving..."
                        : editingExpense
                            ? "Save changes"
                            : "Add expense"}
                </button>
                {editingExpense && (
                    <button
                        type="button"
                        className="expense-form__cancel-btn"
                        onClick={onCancelEdit}
                    >
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
}

export default ExpenseForm;