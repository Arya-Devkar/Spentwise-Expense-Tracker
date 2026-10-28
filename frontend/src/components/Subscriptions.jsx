import { useId, useState } from "react";
import { formatCurrency } from "../utils/format";
import "./Panels.css";

const EMPTY = { name: "", amount: "", billingDay: "1" };

function Subscriptions({ subscriptions, onAdd, onDelete, onToggle }) {
    const baseId = useId();
    const [form, setForm] = useState(EMPTY);
    const [error, setError] = useState("");

    // Derived: only active subscriptions count toward monthly cost
    const monthlyCost = subscriptions
        .filter((s) => s.active)
        .reduce((sum, s) => sum + s.amount, 0);

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setError("");
    }

    function handleSubmit(e) {
        e.preventDefault();
        const name = form.name.trim();
        const amount = Number(form.amount);
        const billingDay = Number(form.billingDay);

        if (!name) return setError("Enter a name.");
        if (!Number.isFinite(amount) || amount <= 0)
            return setError("Amount must be greater than 0.");
        if (!Number.isInteger(billingDay) || billingDay < 1 || billingDay > 31)
            return setError("Billing day must be 1 to 31.");

        onAdd({ id: crypto.randomUUID(), name, amount, billingDay, active: true });
        setForm(EMPTY);
    }

    return (
        <section className="panel" aria-label="Subscriptions">
            <div className="panel__header">
                <h2 className="panel__title">Subscriptions</h2>
                <p className="panel__meta">
                    Monthly: <strong>{formatCurrency(monthlyCost)}</strong>
                </p>
            </div>

            <form className="panel__form" onSubmit={handleSubmit} noValidate>
                <div className="panel__field">
                    <label htmlFor={`${baseId}-name`}>Name</label>
                    <input
                        id={`${baseId}-name`}
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="e.g. Spotify"
                        maxLength={40}
                    />
                </div>
                <div className="panel__field">
                    <label htmlFor={`${baseId}-amount`}>Amount / month</label>
                    <input
                        id={`${baseId}-amount`}
                        name="amount"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={form.amount}
                        onChange={handleChange}
                    />
                </div>
                <div className="panel__field">
                    <label htmlFor={`${baseId}-day`}>Billing day</label>
                    <input
                        id={`${baseId}-day`}
                        name="billingDay"
                        type="number"
                        min="1"
                        max="31"
                        value={form.billingDay}
                        onChange={handleChange}
                    />
                </div>
                <button type="submit" className="panel__btn panel__btn--primary">
                    Add
                </button>
            </form>

            {error && (
                <p className="panel__error" role="alert">
                    {error}
                </p>
            )}

            {subscriptions.length === 0 ? (
                <p className="panel__empty">No subscriptions yet.</p>
            ) : (
                <ul className="panel__list">
                    {subscriptions.map((s) => (
                        <li
                            key={s.id}
                            className={`panel__item ${s.active ? "" : "panel__item--paused"}`}
                        >
                            <div>
                                <strong>{s.name}</strong>
                                <div className="panel__sub">
                                    Bills on day {s.billingDay} {s.active ? "" : "(paused)"}
                                </div>
                            </div>
                            <div className="panel__actions">
                                <span className="panel__amount">
                                    {formatCurrency(s.amount)}
                                </span>
                                <button
                                    type="button"
                                    className="panel__btn"
                                    onClick={() => onToggle(s.id)}
                                >
                                    {s.active ? "Pause" : "Resume"}
                                </button>
                                <button
                                    type="button"
                                    className="panel__btn panel__btn--danger"
                                    onClick={() => onDelete(s.id)}
                                    aria-label={`Delete ${s.name}`}
                                >
                                    X
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

export default Subscriptions;