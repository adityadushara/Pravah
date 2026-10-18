# Pravah — Predictive Logistics & Forward Supply Chain

A high-performance predictive supply-chain management platform prototype built for the Smart India Hackathon.

Pravah helps authorized logistics personnel monitor forward depot inventories, demand forecasts, supply movements, stockout risks, and immutable audit logs through a refined, modern, light-themed enterprise interface.

---

## 1. System Architecture

- **Frontend (`frontend/`)**: React 18 + TypeScript + Vite with custom enterprise light-themed CSS tokens, accessible data tables, interactive stock mutation dialogs, and 9 dedicated views:
  1. **Overview**: Key metrics (tracked locations, inventory items, critical stock alerts, readiness percentage), stock distribution, demand preview, and risk signals.
  2. **Inventory**: Search, category/location/status filtering, sortable columns, pagination, and transactional stock operations (Receipt, Issue, Adjust, Transfer).
  3. **Demand Forecasts**: Verifiable 7-day moving-average baseline demand projection with historical observation charts and explicit model transparency.
  4. **Supply Locations**: Operational depots, forward bases, and reserve storage facilities with stock volume statistics.
  5. **Transportation**: Prototype shipment tracking with manifest references, origin/destination routes, and cargo dispatch details.
  6. **Alerts**: Active threshold-based stock warnings with severity indicators and acknowledgement workflow.
  7. **Audit Logs**: Immutable, append-only transaction ledger detailing all operational modifications.
  8. **User Management**: Prototype role definitions and server-enforced RBAC capability matrix.
  9. **Settings**: Platform diagnostics, PostgreSQL/Supabase pooler connection status, and configuration reference.

- **Backend (`backend/`)**: FastAPI application providing request validation, security enforcement, business logic, and transactional database connectivity via `psycopg` to PostgreSQL/Supabase.

- **Database (`supabase/`)**: PostgreSQL schema with Row-Level Security (RLS) active across 10 tables, automated profile triggers, and an atomic PostgreSQL RPC function (`perform_inventory_transaction`) for safe concurrency and balance integrity.

---

## 2. Requirements

- **Python**: 3.10+ (tested on Python 3.13)
- **Node.js**: 20+ recommended
- **npm**: 10+
- **Supabase / PostgreSQL instance**: Transaction Pooler URL or direct connection

---

## 3. Environment Variables Configuration

Copy the template files to create local environment configurations (these are ignored by Git):

### Root Template: `.env.example`
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
DATABASE_URL=postgresql://postgres.your-ref:your-password@aws-0-region.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Backend: `backend/.env`
```env
DATABASE_URL=postgresql://postgres.zqcbkxzlzrhbjafqvnww:x4o9tkhxXzxJp77H@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://zqcbkxzlzrhbjafqvnww.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Frontend: `frontend/.env.local`
```env
VITE_SUPABASE_URL=https://zqcbkxzlzrhbjafqvnww.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_URL=http://127.0.0.1:8000
```

---

## 4. Windows PowerShell Setup & Execution

### Step A: Apply Database Migrations & Seeds
From the project root:
```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python scripts/migrate.py
```
*Applies `supabase/migrations/20261018000001_initial_schema.sql` and `supabase/seed.sql` to your Supabase PostgreSQL database.*

### Step B: Start the FastAPI Backend (Terminal 1)
```powershell
cd backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```
- API Base: `http://127.0.0.1:8000`
- Interactive Swagger Docs: `http://127.0.0.1:8000/docs`

### Step C: Start the React Frontend (Terminal 2)
```powershell
cd frontend
npm install
npm run dev
```
- Open the printed URL (typically `http://localhost:5173`) in your browser.

---

## 5. Running Tests

### Backend Unit & Integration Tests (15 Tests)
From `backend/` with the virtual environment activated:
```powershell
pytest -v
```

Tests include:
- Health and status endpoint verification.
- Inventory item derived calculations (status, days remaining).
- Input validation (rejects negative quantities, requires justification for adjustments).
- Stock receipts increase balances accurately.
- Stock issues decrease balances and prevent negative stock / overdraft.
- Inter-depot transfers update source and destination balances atomically.
- Alert generation and acknowledgement actions.
- Transparent baseline moving-average forecasts.
- Shipments and immutable audit logs query verification.

### Frontend Production Build
From `frontend/`:
```powershell
npm run build
```
Validates TypeScript typings, module bundling, and CSS asset compilation.

---

## 6. Security & Operational Disclaimers

1. **Fictional Data Only**: All locations, stock quantities, and daily usage figures are synthetic demo data created for the Smart India Hackathon. No classified military installations or live feeds are accessed.
2. **Deterministic Baseline Forecasting**: Demand estimates utilize an authenticated 7-day trailing moving average from seeded observation history. No black-box machine-learning model is claimed to be trained.
3. **Database RLS Policies**: PostgreSQL Row-Level Security is active on all 10 tables. `audit_logs` and `inventory_transactions` are append-only.
4. **Role Switcher**: The UI role selector is a demonstration tool for evaluating user experience across officer roles. Operational security must enforce authorization on the server.
