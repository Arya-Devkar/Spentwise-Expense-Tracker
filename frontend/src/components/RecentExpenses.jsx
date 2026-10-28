import { useId, useState } from "react";
import { formatCurrency } from "../utils/format";
import { formatDisplayDate, getDaysAgoLocal } from "../utils/date";
import "./RecentExpenses.css";

function RecentExpenses({ expenses, onDeleteExpense }) {
    const headingId = useId();
    // Which expense is waiting for "Yes, remove?" (null = none).
    // Local UI state: only this component cares about it.
    const [confirmingId, setConfirmingId] = useState(null);

    // Derived state: computed from props on every render, never stored.
    // Today + the 6 days before it = the last 7 days.
    const cutoff = getDaysAgoLocal(6);

    const recent = expenses
        .filter((expense) => expense.date >= cutoff) // filter() returns a NEW array,
        .sort((a, b) => b.date.localeCompare(a.date)); // so sorting it is safe

    const total = recent.reduce((sum, expense) => sum + expense.amount, 0);

    function handleConfirmRemove(id) {
        onDeleteExpense(id); // the parent owns the data, so the parent deletes
        setConfirmingId(null);
    }

    return (
        <section className="recent" aria-labelledby={headingId}>
            <div className="recent__header">
                <h2 id={headingId} className="recent__title">
                    Last 7 days
                </h2>
                <p className="recent__total">
                    Total: <strong>{formatCurrency(total)}</strong>
                </p>
            </div>

            {recent.length === 0 ? (
                <p className="recent__empty">No expenses in the last 7 days.</p>
            ) : (
                <ul className="recent__list">
                    {recent.map((expense) => (
                        <li key={expense.id} className="recent__item">
                            <div className="recent__info">
                                <span className="recent__name">{expense.title}</span>
                                <span className="recent__meta">
                                    <span className="recent__badge">{expense.category}</span>
                                    <time dateTime={expense.date}>
                                        {formatDisplayDate(expense.date)}
                                    </time>
                                </span>
                            </div>

                            <div className="recent__actions">
                                <span className="recent__amount">
                                    {formatCurrency(expense.amount)}
                                </span>

                                {confirmingId === expense.id ? (
                                    <div
                                        className="recent__confirm"
                                        role="group"
                                        aria-label={`Confirm removing ${expense.title}`}
                                    >
                                        <span className="recent__confirm-text">Remove this?</span>
                                        <button
                                            type="button"
                                            className="recent__btn recent__btn--danger"
                                            onClick={() => handleConfirmRemove(expense.id)}
                                        >
                                            Yes, remove
                                        </button>
                                        <button
                                            type="button"
                                            className="recent__btn"
                                            onClick={() => setConfirmingId(null)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        className="recent__btn recent__btn--remove"
                                        onClick={() => setConfirmingId(expense.id)}
                                        aria-label={`Remove ${expense.title}`}
                                    >
                                        X
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

export default RecentExpenses;