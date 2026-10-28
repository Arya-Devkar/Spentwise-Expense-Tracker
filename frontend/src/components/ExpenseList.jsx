import { useId, useState } from "react";
import { formatCurrency } from "../utils/format";
import { formatDisplayDate } from "../utils/date";
import "./RecentExpenses.css";

function ExpenseList({ expenses, hasAnyExpenses, onDeleteExpense, onEditExpense }) {
    const headingId = useId();
    const [confirmingId, setConfirmingId] = useState(null);

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    function handleConfirmRemove(id) {
        onDeleteExpense(id);
        setConfirmingId(null);
    }

    return (
        <section className="recent" aria-labelledby={headingId}>
            <div className="recent__header">
                <h2 id={headingId} className="recent__title">Expenses</h2>
                <p className="recent__total">
                    Total: <strong>{formatCurrency(total)}</strong>
                </p>
            </div>

            {expenses.length === 0 ? (
                <p className="recent__empty">
                    {hasAnyExpenses
                        ? "No expenses match these filters."
                        : "No expenses yet. Add your first one above."}
                </p>
            ) : (
                <ul className="recent__list">
                    {expenses.map((expense) => (
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
                                    <>
                                        <button
                                            type="button"
                                            className="recent__btn"
                                            onClick={() => onEditExpense(expense)}
                                            aria-label={`Edit ${expense.title}`}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            className="recent__btn recent__btn--remove"
                                            onClick={() => setConfirmingId(expense.id)}
                                            aria-label={`Remove ${expense.title}`}
                                        >
                                            X
                                        </button>
                                    </>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

export default ExpenseList;