import { useMemo } from "react";
import { formatCurrency } from "../utils/format";
import { getTodayLocal } from "../utils/date";
import "./Summary.css";

function Summary({ expenses }) {
    // useMemo: only recompute when expenses change (derived data, not state)
    const stats = useMemo(() => {
        const month = getTodayLocal().slice(0, 7); // "YYYY-MM"
        let total = 0;
        let monthTotal = 0;
        const byCategory = {};

        for (const e of expenses) {
            total += e.amount;
            if (e.date.startsWith(month)) monthTotal += e.amount;
            byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
        }

        const breakdown = Object.entries(byCategory)
            .map(([category, amount]) => ({ category, amount }))
            .sort((a, b) => b.amount - a.amount);

        return {
            total,
            monthTotal,
            count: expenses.length,
            breakdown,
            top: breakdown[0]?.category ?? "-",
        };
    }, [expenses]);

    const cards = [
        { label: "This month", value: formatCurrency(stats.monthTotal) },
        { label: "All time", value: formatCurrency(stats.total) },
        { label: "Expenses", value: stats.count },
        { label: "Top category", value: stats.top },
    ];

    return (
        <section className="summary" aria-label="Spending summary">
            <div className="summary__cards">
                {cards.map((card) => (
                    <div key={card.label} className="summary__card">
                        <span className="summary__label">{card.label}</span>
                        <strong className="summary__value">{card.value}</strong>
                    </div>
                ))}
            </div>

            {stats.breakdown.length > 0 && (
                <div className="summary__breakdown">
                    <h2 className="summary__title">Spending by category</h2>
                    <ul className="summary__list">
                        {stats.breakdown.map(({ category, amount }) => {
                            const percent = Math.round((amount / stats.total) * 100);
                            return (
                                <li key={category} className="summary__row">
                                    <div className="summary__row-top">
                                        <span>{category}</span>
                                        <span>
                                            {formatCurrency(amount)} ({percent}%)
                                        </span>
                                    </div>
                                    <div className="summary__bar">
                                        <div
                                            className="summary__fill"
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </section>
    );
}

export default Summary;