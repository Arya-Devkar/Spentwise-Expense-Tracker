import os
import sqlite3
from contextlib import closing
from uuid import uuid4

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

DB_PATH = os.getenv("DB_PATH", "spentwise.db")

app = FastAPI(title="Spentwise API")

# CORS is only needed if the browser calls the API directly (not through the
# Vite / nginx proxy). Harmless to keep.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

DEFAULT_CATEGORIES = [
    "Food", "Transport", "Rent", "Shopping",
    "Bills", "Entertainment", "Health", "Other",
]


# ---------- database helpers ----------
def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with closing(get_conn()) as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS expenses (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                amount REAL NOT NULL,
                category TEXT NOT NULL,
                date TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS subscriptions (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                amount REAL NOT NULL,
                billing_day INTEGER NOT NULL,
                active INTEGER NOT NULL DEFAULT 1
            );
            CREATE TABLE IF NOT EXISTS budget (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                amount REAL NOT NULL
            );
            CREATE TABLE IF NOT EXISTS categories (
                name TEXT PRIMARY KEY COLLATE NOCASE
            );
            """
        )
        # Seed the default categories once
        count = conn.execute("SELECT COUNT(*) FROM categories").fetchone()[0]
        if count == 0:
            conn.executemany(
                "INSERT INTO categories (name) VALUES (?)",
                [(c,) for c in DEFAULT_CATEGORIES],
            )
        conn.commit()


init_db()


# ---------- models (Pydantic validates incoming JSON) ----------
class ExpenseIn(BaseModel):
    title: str = Field(min_length=1, max_length=80)
    amount: float = Field(gt=0)
    category: str = Field(min_length=1, max_length=30)
    date: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")  # YYYY-MM-DD


class Expense(ExpenseIn):
    id: str


class SubscriptionIn(BaseModel):
    name: str = Field(min_length=1, max_length=40)
    amount: float = Field(gt=0)
    billingDay: int = Field(ge=1, le=31)
    active: bool = True


class Subscription(SubscriptionIn):
    id: str


class BudgetIn(BaseModel):
    amount: float = Field(gt=0)


class CategoryIn(BaseModel):
    name: str = Field(min_length=1, max_length=30)


def sub_from_row(row) -> Subscription:
    return Subscription(
        id=row["id"],
        name=row["name"],
        amount=row["amount"],
        billingDay=row["billing_day"],
        active=bool(row["active"]),
    )


# ---------- health ----------
@app.get("/api/health")
def health():
    return {"status": "ok"}


# ---------- expenses ----------
@app.get("/api/expenses", response_model=list[Expense])
def list_expenses():
    with closing(get_conn()) as conn:
        rows = conn.execute("SELECT * FROM expenses ORDER BY date DESC").fetchall()
    return [Expense(**dict(r)) for r in rows]


@app.post("/api/expenses", response_model=Expense, status_code=201)
def create_expense(data: ExpenseIn):
    expense = Expense(id=str(uuid4()), **data.model_dump())
    with closing(get_conn()) as conn:
        conn.execute(
            "INSERT INTO expenses (id, title, amount, category, date) VALUES (?, ?, ?, ?, ?)",
            (expense.id, expense.title, expense.amount, expense.category, expense.date),
        )
        conn.commit()
    return expense


@app.put("/api/expenses/{expense_id}", response_model=Expense)
def update_expense(expense_id: str, data: ExpenseIn):
    with closing(get_conn()) as conn:
        cur = conn.execute(
            "UPDATE expenses SET title=?, amount=?, category=?, date=? WHERE id=?",
            (data.title, data.amount, data.category, data.date, expense_id),
        )
        conn.commit()
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Expense not found")
    return Expense(id=expense_id, **data.model_dump())


@app.delete("/api/expenses/{expense_id}", status_code=204)
def delete_expense(expense_id: str):
    with closing(get_conn()) as conn:
        cur = conn.execute("DELETE FROM expenses WHERE id=?", (expense_id,))
        conn.commit()
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Expense not found")


# ---------- subscriptions ----------
@app.get("/api/subscriptions", response_model=list[Subscription])
def list_subscriptions():
    with closing(get_conn()) as conn:
        rows = conn.execute("SELECT * FROM subscriptions ORDER BY rowid DESC").fetchall()
    return [sub_from_row(r) for r in rows]


@app.post("/api/subscriptions", response_model=Subscription, status_code=201)
def create_subscription(data: SubscriptionIn):
    sub = Subscription(id=str(uuid4()), **data.model_dump())
    with closing(get_conn()) as conn:
        conn.execute(
            "INSERT INTO subscriptions (id, name, amount, billing_day, active) VALUES (?, ?, ?, ?, ?)",
            (sub.id, sub.name, sub.amount, sub.billingDay, int(sub.active)),
        )
        conn.commit()
    return sub


@app.put("/api/subscriptions/{sub_id}", response_model=Subscription)
def update_subscription(sub_id: str, data: SubscriptionIn):
    with closing(get_conn()) as conn:
        cur = conn.execute(
            "UPDATE subscriptions SET name=?, amount=?, billing_day=?, active=? WHERE id=?",
            (data.name, data.amount, data.billingDay, int(data.active), sub_id),
        )
        conn.commit()
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Subscription not found")
    return Subscription(id=sub_id, **data.model_dump())


@app.delete("/api/subscriptions/{sub_id}", status_code=204)
def delete_subscription(sub_id: str):
    with closing(get_conn()) as conn:
        cur = conn.execute("DELETE FROM subscriptions WHERE id=?", (sub_id,))
        conn.commit()
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Subscription not found")


# ---------- budget (a single row) ----------
@app.get("/api/budget")
def get_budget():
    with closing(get_conn()) as conn:
        row = conn.execute("SELECT amount FROM budget WHERE id=1").fetchone()
    return {"amount": row["amount"] if row else 0}


@app.put("/api/budget")
def set_budget(data: BudgetIn):
    with closing(get_conn()) as conn:
        conn.execute(
            "INSERT INTO budget (id, amount) VALUES (1, ?) "
            "ON CONFLICT(id) DO UPDATE SET amount=excluded.amount",
            (data.amount,),
        )
        conn.commit()
    return {"amount": data.amount}


# ---------- categories ----------
@app.get("/api/categories", response_model=list[str])
def list_categories():
    with closing(get_conn()) as conn:
        rows = conn.execute("SELECT name FROM categories ORDER BY rowid").fetchall()
    return [r["name"] for r in rows]


@app.post("/api/categories", status_code=201)
def create_category(data: CategoryIn):
    name = " ".join(data.name.split())  # trim and collapse repeated spaces
    with closing(get_conn()) as conn:
        try:
            conn.execute("INSERT INTO categories (name) VALUES (?)", (name,))
            conn.commit()
        except sqlite3.IntegrityError:
            raise HTTPException(status_code=409, detail=f'"{name}" already exists.')
    return {"name": name}