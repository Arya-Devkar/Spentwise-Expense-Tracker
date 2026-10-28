// All helpers use LOCAL time. toISOString() gives the UTC date, which is
// wrong for the first hours after midnight in IST.

function toDateInputValue(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

// Today as YYYY-MM-DD (the format <input type="date"> uses)
export function getTodayLocal() {
    return toDateInputValue(new Date());
}

// The date N days ago as YYYY-MM-DD
export function getDaysAgoLocal(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return toDateInputValue(date);
}

// "2026-10-27" -> "Tue, 27 Oct". Built from parts so it stays in local time
// (new Date("2026-10-27") would be parsed as UTC).
export function formatDisplayDate(dateString) {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
    });
}