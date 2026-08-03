# Restaurant QR Ordering Platform

A full-stack restaurant ordering platform: a Next.js marketing site + admin
dashboard + guest QR-ordering flow (`frontend/`), backed by a FastAPI service
with real RBAC auth, a SQL database, and WebSocket-based realtime ordering
(`backend/`).

```
frontend/   Next.js 16 app — public site, admin dashboard, guest order flow
backend/    FastAPI service — auth, menu, tables, orders, reservations, WS
```

## Prerequisites

- Node.js (for `frontend/`)
- Python 3.11+ (for `backend/`)

Postgres or Docker are **not required** for local dev — the backend defaults
to a local SQLite file. The schema is Postgres-compatible, so pointing
`DATABASE_URL` at a real Postgres instance instead (e.g.
`postgresql+asyncpg://user:pass@host:5432/dbname`) is a one-line change in
`backend/.env` — this repo's own dev environment currently runs against a
local Postgres server this way.

## One-time setup

```bash
# Backend
cd backend
python -m venv .venv
./.venv/Scripts/pip install -r requirements.txt   # Windows
# source .venv/bin/activate && pip install -r requirements.txt   # macOS/Linux
cp .env.example .env
./.venv/Scripts/python -m app.seed   # one command: creates the DB (Postgres),
                                     # runs all migrations, seeds demo data

# Frontend
cd ../frontend
npm install
cp .env.local.example .env.local
```

`app.seed` is fully idempotent — run it again any time; it only applies
missing migrations and skips seeding if data already exists. On Postgres it
even creates the database itself if it doesn't exist yet (SQLite needs
nothing). So on a brand-new PC: install deps, set `.env`, run the seed —
done.

The seed script prints a dev-only Owner login:

> ⚠ **Dev-only credentials — change immediately before any real deployment.**
> `owner@example.com` / `ChangeMe123!`

## Running both servers

**Backend** (from `backend/`, with the venv active):

```bash
uvicorn app.main:app --reload --port 8000
```

**Frontend** (from `frontend/`):

```bash
npm run dev
```

Then visit:

- **Website:** http://localhost:3000
- **Admin dashboard:** http://localhost:3000/admin/login
- **API docs (Swagger):** http://localhost:8000/docs

Or use the convenience scripts, which start both from the repo root:

```bash
# Windows (PowerShell)
./scripts/dev.ps1

# macOS/Linux
./scripts/dev.sh
```

## What's in this phase

**Phase 1** built the core loop: de-branding, RBAC auth, menu management,
table/QR codes, the live order pipeline, and reservations.

**Phase 2** (this pass) added the rest of the guest journey — **scan → menu →
order → bill → pay** — plus the tools to run promotions and watch the
numbers:

- **Payments**: a cashier bills a table's served orders into an invoice
  (covers multiple orders per sitting), records cash/card/UPI payments, or
  the guest pays online via **Razorpay Checkout** right from their phone —
  the bill appears on the guest's ordering page the instant it's generated,
  over the same WebSocket channel orders use, and flips to "paid" live too.
  Razorpay only activates once `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` are
  set in `backend/.env` — without them, cash/card/UPI-at-counter still work
  fully; `/settings` reports `razorpay_enabled` so the frontend hides the
  online-pay button until it's configured.
- **Coupons & loyalty**: flat/percentage/BOGO coupon codes applied at billing
  time; a phone-number-based loyalty account (there's no guest login system,
  so phone is the identity) earns points on paid bills and can redeem them
  as a discount on a future one. Configurable tax rate and loyalty
  earn/redeem rates live in Admin → Site & Offers.
- **Inventory**: ingredients + suppliers, recipes attached per menu item
  (in Menu Editor), and stock auto-deducts the moment an order is placed.
  Low-stock items are flagged in Admin → Inventory and counted on the
  Analytics dashboard.
- **Analytics**: a real dashboard — today's revenue/orders/average order
  value, a revenue-over-time chart, best-sellers, an orders-by-hour
  histogram, and a CSV export — all computed from real order data.

**Still out of scope** (future work): WhatsApp/SMS/email notifications, the
drag-and-drop live-preview website builder, AI features,
multi-branch/multi-tenant switching UI, waiter floor plans and table
transfer/merge, real guest accounts (loyalty currently keys off phone number
only).

## Architecture notes

- **Database:** SQLAlchemy 2.0 (async) + Alembic migrations, SQLite locally,
  Postgres-ready. See `backend/app/models/`.
- **Auth:** JWT (HS256) issued by FastAPI, stored in an httpOnly cookie set by
  a Next.js route handler (BFF pattern) — the browser never talks to the
  backend directly for authenticated admin requests. Guest-facing requests
  (menu, ordering, reservations) call the backend directly since there's no
  secret to protect.
- **Realtime:** native FastAPI WebSockets. Staff connections authenticate via
  a short-lived one-time ticket (browsers can't send custom headers on a
  cross-origin WS handshake); guest connections are scoped to a table code.
  See `backend/app/realtime/`.
- **Multi-tenant readiness:** every table has a `restaurant_id` foreign key,
  but Phase 1 runs a single seeded restaurant. A future phase can add a real
  tenant resolver in `backend/app/core/tenant.py` without touching models or
  routers.
- **Payments:** cash/card/UPI are recorded manually by staff (no external
  dependency). Online payment goes through Razorpay Checkout — get test keys
  from the [Razorpay dashboard](https://dashboard.razorpay.com/) and set
  `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` in `backend/.env` to enable it;
  `RAZORPAY_WEBHOOK_SECRET` is optional and only needed if you wire up the
  `/webhooks/razorpay` endpoint for production reliability (the
  client-confirm path works without it for local dev).
