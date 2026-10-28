import { useId, useMemo, useState } from "react";
import { getTodayLocal } from "../utils/date";
import { formatCurrency } from "../utils/format";
import "./Panels.css";

function Budget({ expenses, subscriptionCost, budget, onSetBudget }) {
    const inputId = useId();
    const [draft, setDraft] = useState("");

    // Spent this month = this month's expenses + active subscriptions
    const spent = useMemo(() => {
        const month = getTodayLocal().slice(0, 7); // "YYYY-MM"
        const fromExpenses = expenses
            .filter((e) => e.date.startsWith(month))
            .reduce((sum, e) => sum + e.amount, 0);
        return fromExpenses + subscriptionCost;
    }, [expenses, subscriptionCost]);

    const percent =
        budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
    const over = budget > 0 && spent > budget;
    const remaining = budget - spent;

    function handleSubmit(e) {
        e.preventDefault();
        const value = Number(draft);
        if (!Number.isFinite(value) || value <= 0) return;
        onSetBudget(value);
        setDraft("");
    }

    return (
        <section className="panel" aria-label="Monthly budget">
            <div className="panel__header">
                <h2 className="panel__title">Monthly budget</h2>
                <p className="panel__meta">
                    {budget > 0 ? (
                        <>
                            Budget: <strong>{formatCurrency(budget)}</strong>
                        </>
                    ) : (
                        "Not set"
                    )}
                </p>
            </div>

            <form
                className="panel__form panel__form--inline"
                onSubmit={handleSubmit}
            >
                <div className="panel__field">
                    <label htmlFor={inputId}>Set budget</label>
                    <input
                        id={inputId}
                        type="number"
                        min="1"
                        step="1"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="e.g. 20000"
                    />
                </div>
                <button type="submit" className="panel__btn panel__btn--primary">
                    Save
                </button>
            </form>

            {budget > 0 && (
                <>
                    <div
                        className="panel__bar"
                        role="progressbar"
                        aria-valuenow={percent}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label="Budget used"
                    >
                        <div
                            className={`panel__fill ${over ? "panel__fill--over" : ""}`}
                            style={{ width: `${percent}%` }}
                        />
                    </div>
                    <p className={over ? "panel__error" : "panel__sub"}>
                        Spent {formatCurrency(spent)} ({percent}%).{" "}
                        {over
                            ? `Over budget by ${formatCurrency(-remaining)}.`
                            : `${formatCurrency(remaining)} left.`}
                    </p>
                </>
            )}
        </section>
    );
}

export default Budget;