import { useId } from "react";
import "./ExpenseFilters.css";

function ExpenseFilters({ filters, categories, onChange, onReset }) {
    const baseId = useId();

    function handleChange(e) {
        const { name, value } = e.target;
        onChange({ ...filters, [name]: value });
    }

    return (
        <div className="filters">
            <div className="filters__field">
                <label htmlFor={`${baseId}-category`}>Category</label>
                <select
                    id={`${baseId}-category`}
                    name="category"
                    value={filters.category}
                    onChange={handleChange}
                >
                    <option value="All">All</option>
                    {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </div>

            <div className="filters__field">
                <label htmlFor={`${baseId}-month`}>Month</label>
                <input
                    id={`${baseId}-month`}
                    name="month"
                    type="month"
                    value={filters.month}
                    onChange={handleChange}
                />
            </div>

            <button type="button" className="filters__reset" onClick={onReset}>
                Reset
            </button>
        </div>
    );
}

export default ExpenseFilters;