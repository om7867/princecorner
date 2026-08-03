# Restaurant QR Ordering & CRM Platform — Comprehensive System Architecture & Design Guide

## 1. System Overview

This repository houses a **full-stack, multi-tenant Restaurant QR Ordering, POS, Inventory, and CRM Platform**. The architecture caters to both single-location dining spaces and multi-branch restaurant organizations (e.g., *Prince Corner*).

The system seamlessly combines a **guest-facing QR ordering journey** (Scan QR → Select Items → Place Order → Track Kitchen Progress → Live Bill → Pay Online / Counter) with a **staff admin control panel** (KDS, Waiter Panel, Billing & Invoices, Menu Management, Inventory & Recipe Deductions, Loyalty & Coupons, Table QR Generator, and Business Analytics).

---

## 2. Technology Stack & Key Libraries

### **Backend (`/backend`)**
- **Language & Framework**: Python 3.11+, FastAPI (`>=0.115`), Uvicorn ASGI server (`>=0.30`).
- **Database & ORM**: PostgreSQL / SQLite, SQLAlchemy 2.0 (Async Engine via `aiosqlite` for local dev and `asyncpg` for production), Alembic migrations (`>=1.13`).
- **Data Validation & Schemas**: Pydantic v2 (`>=2.7`), `pydantic-settings`.
- **Security & Auth**: JWT (HS256 via `python-jose`), password hashing with `passlib[bcrypt]` and `bcrypt`.
- **Realtime**: Native FastAPI WebSockets for live KDS order streaming, bill updates, and payment status sync.
- **Payment Processing**: `razorpay` SDK (`>=1.4`) for Razorpay Checkout order creation, client signature verification, and webhook handling.

### **Frontend (`/frontend`)**
- **Language & Framework**: Next.js 16 (App Router), React 19, TypeScript (`>=5`), Tailwind CSS v4.
- **State Management & Hooks**: Custom React hooks (`useGlobalCart`, `useSiteSettings`, `useLuxuryReveal`).
- **UI & Graphics Libraries**:
  - `recharts` for business analytics charts.
  - `qrcode` for client-side QR code generation.
  - `lucide-react` for modern icon sets.
  - `framer-motion`, `gsap`, `lenis`, `three`, `@react-three/fiber`, `@react-three/drei` for visual presentations and smooth scrolling on marketing pages.
- **Backend-For-Frontend (BFF) Security Pattern**: Next.js API route handlers (`/api/admin/...`) act as a proxy layer, reading `httpOnly` JWT session cookies and communicating securely with the FastAPI backend.

---

## 3. Core Architectural Patterns

```
+-----------------------------------------------------------------------------------+
|                                  BROWSER CLIENT                                   |
|                                                                                   |
|  +---------------------------+   +-----------------------+   +-----------------+  |
|  |  Guest QR Ordering Page   |   |   Marketing / Venue   |   | Admin Dashboard |  |
|  |  (/menu, /cart, /order)   |   |   (/, /bakery, /bar)  |   |  (/admin/...)   |  |
|  +-------------+-------------+   +-----------+-----------+   +--------+--------+  |
+----------------|-----------------------------|------------------------|-----------+
                 |                             |                        |
                 | HTTP (Public)               | HTTP (Public)          | HTTP (BFF Cookie)
                 | WS (Table Code)             |                        v
                 |                             |             +---------------------+
                 |                             |             | Next.js Route       |
                 |                             |             | Handlers / BFF Proxy|
                 |                             |             +----------+----------+
                 |                             |                        | Bearer JWT
                 v                             v                        v
+-----------------------------------------------------------------------------------+
|                                FASTAPI BACKEND                                    |
|                                                                                   |
|  +------------------+   +-------------------+   +------------------------------+  |
|  |  Public Routers  |   |   Admin Routers   |   |      WebSocket Manager       |  |
|  |  (Menu, Orders,  |   |   (KDS, Billing,  |   |  (Staff Broadcast &          |  |
|  |   Reservations)  |   |   Inventory, Org) |   |   Table-Scoped Channels)     |  |
|  +--------+---------+   +---------+---------+   +--------------+---------------+  |
|           |                       |                            |                  |
|           +-----------------------+----------------------------+                  |
|                                   |                                               |
|                                   v                                               |
|                      +------------------------+                                   |
|                      |  SQLAlchemy 2.0 Async   |                                   |
|                      +-----------+------------+                                   |
+----------------------------------|------------------------------------------------+
                                   v
                       +------------------------+
                       | PostgreSQL / SQLite DB |
                       +------------------------+
```

### 1. **BFF (Backend-For-Frontend) Security Layer**
- The Next.js frontend employs a server-side authentication pattern located in `src/server/auth.ts` and `src/server/backend-proxy.ts`.
- When an admin logs in, a JWT is generated by FastAPI and stored in an HTTP-only `session` cookie by Next.js.
- Admin client components issue requests to Next.js API proxy endpoints (`/api/admin/...`), which attach the JWT token to the backend request header (`Authorization: Bearer <token>`). This guarantees that authentication tokens are never exposed to the client-side JavaScript bundle.

### 2. **Multi-Tenancy & Branch Resolution**
- Every entity in the database (`RestaurantTable`, `Order`, `Invoice`, `InventoryItem`, `User`) belongs to an `organization_id` and/or a `restaurant_id` (branch).
- Branch resolution is handled by `backend/app/core/tenant.py`:
  - **Staff Context (`get_current_restaurant_for_staff`)**: Resolves branch based on `selected_branch_id` cookie set by the admin branch-switcher UI, user assignment, or falls back to default.
  - **Guest Context (`get_current_restaurant_public`)**: Resolves branch based on the `restaurant` slug passed in query parameters (encoded into QR codes).

### 3. **Real-Time WebSocket Bus (`ConnectionManager`)**
- Located in `backend/app/realtime/manager.py`.
- Maintains two distinct connection pools:
  - `staff`: Broadcaster set for kitchen staff, waiters, and cashiers to receive real-time order notifications, table updates, and payment confirmations.
  - `tables`: Dictionary mapping `table_code` to a set of WebSocket connections, allowing individual dining tables to receive instant status updates on their orders and invoices.
- **WS Auth Tickets**: Because standard WebSocket handshakes in web browsers do not support custom authorization headers, staff authenticate WebSocket connections using short-lived one-time tickets generated via `/api/ws-ticket`.

---

## 4. Primary Data Models & Database Schemas

All models reside in `backend/app/models/`:

1. **Organization & Restaurant (`organization.py`, `restaurant.py`)**:
   - `Organization`: Multi-branch corporate entity, plan level (`basic`, `pro`, `enterprise`), status.
   - `Restaurant`: Individual branch location with name, slug, address, tax configuration, currency, contact info.

2. **User & RBAC (`user.py`)**:
   - `User`: Staff identity linked to `organization_id` and optional `restaurant_id`.
   - `RoleEnum`: `platform_owner`, `super_admin`, `org_admin`, `owner`, `manager`, `kitchen`, `cashier`, `waiter`.

3. **Tables & QR (`table.py`)**:
   - `RestaurantTable`: Table code, floor location, capacity, seating area, QR code link.

4. **Menu System (`menu.py`)**:
   - `MenuCategory`: Category naming, sort order, display status.
   - `MenuItem`: Name, description, price, image URL, category, dietary badges (veg/non-veg/spicy/gluten-free), availability flags.
   - `MenuItemVariant`: Size or style variants (e.g., Small, Large, Pitcher).
   - `MenuItemAddon`: Customizations / extra options (e.g., Extra Cheese, Dip).
   - `GlobalMenuItem`: Organization-wide master catalog items that can be synced across branches.

5. **Order Pipeline (`order.py`)**:
   - `Order`: Order number, `restaurant_id`, `table_id`, `status` (`pending`, `in_kitchen`, `ready`, `served`, `cancelled`, `completed`), notes, order source.
   - `OrderItem`: Reference to `MenuItem`, quantity, unit price, status.
   - `OrderItemAddon`: Applied modifier options for order item line.

6. **Billing & Payments (`billing.py`)**:
   - `Invoice`: Billing document linking multiple orders from a single table session. Computes subtotal, coupon discounts, loyalty discounts, tax, and final amount. Status (`unpaid`, `partially_paid`, `paid`, `voided`).
   - `InvoiceOrder`: Many-to-many junction between `Invoice` and `Order`.
   - `Payment`: Financial transaction record. Supports `PaymentMethodEnum` (`cash`, `card`, `upi`, `razorpay`) and `PaymentStatusEnum` (`pending`, `completed`, `failed`, `refunded`). Includes Razorpay transaction ID & payment signature.

7. **Inventory & Recipes (`inventory.py`)**:
   - `Ingredient`: Stock ingredient name, unit (kg, grams, liters, pcs), current stock level, minimum threshold, cost per unit, supplier ID.
   - `MenuItemIngredient`: Recipe mapping connecting a `MenuItem` (or variant) to raw `Ingredient` requirements for auto-stock deduction upon order placement.
   - `Supplier`: Vendor details, contact info, lead time.
   - `InventoryTransferRequest`: Inter-branch stock transfer requests and audit trail.

8. **Promotions & Loyalty (`promotions.py`)**:
   - `Coupon`: Flat amount, percentage discount, or BOGO rules with validity limits and usage counters.
   - `LoyaltyAccount`: Customer identity keyed by phone number, points balance, total spent, tier.

9. **Reservations & Site Settings (`reservation.py`, `site_settings.py`)**:
   - `Reservation`: Table reservation bookings (guest name, phone, party size, date/time, status).
   - `SiteSettings`: Dynamic configuration for tax rates, currency symbol, loyalty earn/redeem rates, Razorpay toggle status.

---

## 5. Main Application Workflows

### **A. Guest QR Code Ordering & Payment Flow**
1. **QR Scan**: Guest scans a table QR code encoding URL: `https://<domain>/menu?table=T-04&restaurant=prince-corner-isanpur`.
2. **Menu Selection**: Client fetches active categories and menu items from `GET /api/menu`. `useGlobalCart` manages selected items, variants, and addons in local storage/state.
3. **Order Placement**: Guest submits order to `POST /api/orders`.
   - System verifies item availability.
   - Automatically deducts inventory stock based on `MenuItemIngredient` recipes.
   - Emits a real-time `order_created` event over WebSocket to all staff connections (Kitchen/KDS display).
4. **Order Tracking**: Guest monitors status via `GET /api/orders/track` or connected table WebSocket (`ws://backend/ws/table/T-04`).
5. **Kitchen Processing**: Kitchen staff updates order status (`pending` → `in_kitchen` → `ready` → `served`). Status updates are broadcast live to the table.
6. **Billing & Invoicing**: Cashier consolidates table orders into an invoice (`POST /api/admin/billing/invoices`).
7. **Payment**:
   - **Offline**: Cashier records Cash/Card/UPI payment at counter (`POST /api/admin/billing/invoices/{id}/payments`).
   - **Online**: Guest pays directly on phone using Razorpay Checkout integration (`POST /api/billing/invoices/{id}/razorpay-order` → Client completes Razorpay modal → `POST /api/billing/invoices/{id}/razorpay-verify`).
8. **Real-time Settlement**: Upon payment verification, invoice flips to `paid`, orders are marked `completed`, and notification is broadcast to staff and table.

### **B. Inventory Auto-Deduction Engine**
When an order is created, `backend/app/services/inventory.py` iterates over every ordered menu item and variant, computes required ingredient quantities using `MenuItemIngredient` recipes, and decrements stock levels in `Ingredient`. If stock drops below `min_stock_level`, the item is flagged as low stock on the admin inventory dashboard.

### **C. Loyalty & Discounts System**
- Guests provide a phone number at billing time.
- `LoyaltyAccount` tracks accumulated points based on configurable ratio (`earned_points = paid_amount * earn_rate`).
- Points can be redeemed as monetary discounts on subsequent invoices during billing settlement.

---

## 6. Directory Structure & Key Files

```
princecorner/
├── backend/                         # FastAPI Backend Application
│   ├── alembic/                     # Database migration scripts
│   ├── app/
│   │   ├── core/                    # Core configuration, JWT security, tenant resolution
│   │   │   ├── config.py            # Pydantic environment settings
│   │   │   ├── deps.py              # FastAPI auth & DB dependency injection
│   │   │   ├── security.py          # Password hashing & JWT generation
│   │   │   └── tenant.py            # Staff and public branch context resolution
│   │   ├── db/
│   │   │   └── session.py           # Async SQLAlchemy engine & session maker
│   │   ├── models/                  # SQLAlchemy ORM models (User, Order, Invoice, etc.)
│   │   ├── realtime/                # Realtime WebSocket event manager & ticket issuer
│   │   ├── routers/                 # API Endpoints (Admin, Public, Billing, Menu, etc.)
│   │   ├── schemas/                 # Pydantic input/output schemas
│   │   ├── services/                # Business logic & DB transaction operations
│   │   ├── seed.py                  # Database auto-creator, migration runner & seeder
│   │   └── main.py                  # FastAPI app initializations & middleware
│   ├── requirements.txt             # Python dependencies list
│   └── alembic.ini                  # Migration configuration
│
├── frontend/                        # Next.js 16 Web Application
│   ├── src/
│   │   ├── app/                     # App Router Pages & API Routes
│   │   │   ├── (public)/            # Marketing pages (Bakery, Bar, Cafe, Outlets)
│   │   │   ├── menu/                # Guest digital menu page
│   │   │   ├── cart/                # Guest order review & placement page
│   │   │   ├── track/               # Guest realtime order & bill status tracker
│   │   │   ├── reserve/             # Table reservation booking page
│   │   │   ├── admin/
│   │   │   │   ├── login/           # Staff authentication page
│   │   │   │   └── (panel)/         # Admin Dashboard routes (Orders, Menu, Billing, etc.)
│   │   │   └── api/                 # BFF Next.js route handlers proxying backend requests
│   │   ├── components/              # UI components (Admin tables, Cart modals, KDS grids)
│   │   ├── hooks/                   # Custom hooks (useGlobalCart, useSiteSettings)
│   │   ├── lib/                     # Client helpers, env configs, type definitions
│   │   └── server/                  # Server-side auth, JWT parsing, backend HTTP proxy
│   ├── package.json                 # Node.js dependencies list
│   └── tailwind.config.mjs          # Tailwind CSS styling configuration
│
└── scripts/                         # Multi-platform development runners
    ├── dev.ps1                      # Windows PowerShell dual-server launcher script
    └── dev.sh                       # Linux/macOS Bash dual-server launcher script
```

---

## 7. Setup & Development Execution

### **1. Backend Initialization**
```bash
cd backend
python -m venv .venv

# Windows PowerShell:
./.venv/Scripts/pip install -r requirements.txt
cp .env.example .env
./.venv/Scripts/python -m app.seed    # Creates DB, runs migrations, seeds demo data

# Linux/macOS:
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python -m app.seed
```

### **2. Frontend Initialization**
```bash
cd frontend
npm install
cp .env.local.example .env.local
```

### **3. Running Development Servers**
You can launch both Uvicorn (`port 8000`) and Next.js (`port 3000`) simultaneously from the project root using:
- **Windows**: `./scripts/dev.ps1`
- **Linux/macOS**: `./scripts/dev.sh`

Access points:
- **Guest Web App**: `http://localhost:3000`
- **Admin Panel**: `http://localhost:3000/admin/login`
- **FastAPI OpenAPI Documentation**: `http://localhost:8000/docs`
