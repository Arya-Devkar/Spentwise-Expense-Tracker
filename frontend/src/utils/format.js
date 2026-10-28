const currencyFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
});

export function formatCurrency(amount) {
    return currencyFormatter.format(amount);
}