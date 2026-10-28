import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/spentwise-logo.jpg";
import Budget from "../components/Budget";
import ExpenseFilters from "../components/ExpenseFilters";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseList from "../components/ExpenseList";
import Notification from "../components/Notification";
import Subscriptions from "../components/Subscriptions";
import Summary from "../components/Summary";
import {
    ADD_CATEGORY_OPTION,
    DEFAULT_CATEGORIES,
    MAX_CATEGORY_LENGTH,
} from "../constants/categories";
import useAuth from "../hooks/useAuth";
import useExpenses from "../hooks/useExpenses";
import useSubscriptions from "../hooks/useSubscriptions";
import { getBudget, saveBudget } from "../services/budgetService";
import { createCategory, getCategories } from "../services/categoryService";
import { formatCurrency } from "../utils/format";
import "./Dashboard.css";

const DEFAULT_FILTERS = { category: "All", month: "" };

function Dashboard() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const {
        expenses,
        loading,
        error: loadError,
        addExpense,
        deleteExpense,
        updateExpense,
    } = useExpenses();
    const {
        subscriptions,
        addSubscription,
        deleteSubscription,
        toggleSubscription,
    } = useSubscriptions();

    const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
    const [budget, setBudget] = useState(0);
    const [notification, setNotification] = useState(null);
    const [editingExpense, setEditingExpense] = useState(null);
    const [filters, setFilters] = useState(DEFAULT_FILTERS);

    // Load categories and budget from the server once
    useEffect(() => {
        let ignore = false;
        getCategories()
            .then((list) => {
                if (!ignore && list.length > 0) setCategories(list);
            })
            .catch(() => { });
        getBudget()
            .then((value) => {
                if (!ignore) setBudget(value);
            })
            .catch(() => { });
        return () => {
            ignore = true;
        };
    }, []);

    function showNotification(message, type = "success") {
        setNotification({ id: crypto.randomUUID(), message, type });
    }

    const dismissNotification = useCallback(() => setNotification(null), []);

    // Derived data (never stored in state)
    const subscriptionCost = subscriptions
        .filter((s) => s.active)
        .reduce((sum, s) => sum + s.amount, 0);

    const filteredExpenses = useMemo(
        () =>
            expenses
                .filter(
                    (e) =>
                        (filters.category === "All" || e.category === filters.category) &&
                        (!filters.month || e.date.startsWith(filters.month))
                )
                .sort((a, b) => b.date.localeCompare(a.date)),
        [expenses, filters]
    );

    // ----- expenses -----
    // Returns true on success, false on failure, so the form knows
    // whether it may clear itself.
    async function handleAddExpense(expense) {
        try {
            const created = await addExpense(expense);
            showNotification(
                `"${created.title}" added (${formatCurrency(created.amount)})`
            );
            return true;
        } catch (err) {
            showNotification(err.message, "error");
            return false;
        }
    }

    async function handleUpdateExpense(id, changes) {
        try {
            await updateExpense(id, changes);
            setEditingExpense(null);
            showNotification(`"${changes.title}" updated`);
            return true;
        } catch (err) {
            showNotification(err.message, "error");
            return false;
        }
    }

    async function handleDeleteExpense(id) {
        const removed = expenses.find((e) => e.id === id);
        if (!removed) return;
        try {
            await deleteExpense(id);
            if (editingExpense?.id === id) setEditingExpense(null);
            showNotification(
                `"${removed.title}" removed (${formatCurrency(removed.amount)})`,
                "warning"
            );
        } catch (err) {
            showNotification(err.message, "error");
        }
    }

    function startEdit(expense) {
        setEditingExpense(expense);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // ----- subscriptions -----
    async function handleAddSubscription(sub) {
        try {
            const created = await addSubscription(sub);
            showNotification(`Subscription "${created.name}" added`);
        } catch (err) {
            showNotification(err.message, "error");
        }
    }

    async function handleToggleSubscription(id) {
        try {
            await toggleSubscription(id);
        } catch (err) {
            showNotification(err.message, "error");
        }
    }

    async function handleDeleteSubscription(id) {
        const removed = subscriptions.find((s) => s.id === id);
        if (!removed) return;
        try {
            await deleteSubscription(id);
            showNotification(`Subscription "${removed.name}" removed`, "warning");
        } catch (err) {
            showNotification(err.message, "error");
        }
    }

    // ----- budget -----
    async function handleSetBudget(value) {
        try {
            await saveBudget(value);
            setBudget(value);
            showNotification(`Monthly budget set to ${formatCurrency(value)}`);
        } catch (err) {
            showNotification(err.message, "error");
        }
    }

    // ----- categories (returns { ok, ... } so the form can show errors) -----
    async function addCategory(rawName) {
        const name = rawName.trim().replace(/\s+/g, " ");

        if (!name) return { ok: false, message: "Enter a category name." };
        if (name.length > MAX_CATEGORY_LENGTH) {
            return {
                ok: false,
                message: `Category name must be ${MAX_CATEGORY_LENGTH} characters or fewer.`,
            };
        }
        if (name === ADD_CATEGORY_OPTION) {
            return { ok: false, message: "That name is reserved." };
        }
        if (categories.some((c) => c.toLowerCase() === name.toLowerCase())) {
            return { ok: false, message: `"${name}" already exists.` };
        }

        try {
            const created = await createCategory(name);
            setCategories((prev) => [...prev, created.name]);
            showNotification(`Category "${created.name}" added`);
            return { ok: true, name: created.name };
        } catch (err) {
            return { ok: false, message: err.message };
        }
    }

    function handleLogout() {
        logout();
        navigate("/login");
    }

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <div className="dashboard-brand">
                    <img src={logo} alt="Spentwise logo" className="dashboard-logo" />
                    <span className="dashboard-brand-name">Spentwise</span>
                </div>
                <div className="dashboard-actions">
                    {user?.email && <span className="dashboard-user">{user.email}</span>}
                    <button type="button" className="dashboard-logout" onClick={handleLogout}>
                        Log out
                    </button>
                </div>
            </header>

            <main className="dashboard-main">
                {loadError && (
                    <p className="dashboard-error" role="alert">
                        {loadError}
                    </p>
                )}

                {loading ? (
                    <p className="dashboard-status">Loading your data...</p>
                ) : (
                    <>
                        <Summary expenses={expenses} />

                        <Budget
                            expenses={expenses}
                            subscriptionCost={subscriptionCost}
                            budget={budget}
                            onSetBudget={handleSetBudget}
                        />

                        <Subscriptions
                            subscriptions={subscriptions}
                            onAdd={handleAddSubscription}
                            onDelete={handleDeleteSubscription}
                            onToggle={handleToggleSubscription}
                        />

                        <ExpenseForm
                            key={editingExpense?.id ?? "new"}
                            categories={categories}
                            editingExpense={editingExpense}
                            onAddExpense={handleAddExpense}
                            onUpdateExpense={handleUpdateExpense}
                            onCancelEdit={() => setEditingExpense(null)}
                            onAddCategory={addCategory}
                        />

                        <ExpenseFilters
                            filters={filters}
                            categories={categories}
                            onChange={setFilters}
                            onReset={() => setFilters(DEFAULT_FILTERS)}
                        />

                        <ExpenseList
                            expenses={filteredExpenses}
                            hasAnyExpenses={expenses.length > 0}
                            onDeleteExpense={handleDeleteExpense}
                            onEditExpense={startEdit}
                        />
                    </>
                )}
            </main>

            <Notification
                notification={notification}
                onClose={dismissNotification}
            />
        </div>
    );
}

export default Dashboard;