# Panache Ordering System

Interactive online ordering for **Panache** restaurant at Shivalaya The Resort.

Three apps, one Supabase database — guests order, reception manages the queue, owners view analytics.

## Apps

| App | Port | URL (production) | Purpose |
|-----|------|------------------|---------|
| `customer-menu` | 5173 | order.panache-shivalaya.com | Guest ordering (no login) |
| `front-desk` | 5174 | staff.panache-shivalaya.com | Reception order queue |
| `owner-dashboard` | 5175 | owner.panache-shivalaya.com | Reports & analytics |

## Quick Start

### 1. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** and run migrations in order:
   - `supabase/migrations/0001_init.sql`
   - `supabase/migrations/0002_realtime.sql`
3. Run `supabase/seed.sql` to load the full menu (~150 items) and default staff accounts
4. Copy your **Project URL** and **anon public key** from Settings → API

### 2. Configure environment

Copy `.env.example` to `.env` in each app folder and fill in Supabase credentials:

```bash
# In apps/customer-menu, apps/front-desk, apps/owner-dashboard
cp .env.example .env
```

### 3. Install & run

```bash
pnpm install          # or: npm install
pnpm dev:menu         # Guest menu → http://localhost:5173
pnpm dev:desk         # Front desk → http://localhost:5174
pnpm dev:owner        # Owner dashboard → http://localhost:5175
```

## Default PINs (change after setup)

| Role | PIN |
|------|-----|
| Reception | `1234` |
| Owner | `9999` |

## Guest Order Flow

1. Guest opens the menu URL (or scans QR on table)
2. Browses 23 menu sections, adds items to cart
3. At checkout selects **Room Service**, **Dine In**, or **Pick Up**
4. Enters name, phone, room number (if room service)
5. Order appears instantly on the front desk dashboard

## Staff Flow

1. Reception logs in with 4-digit PIN
2. New orders trigger a browser beep + badge
3. Confirm → Send to Kitchen → Mark Ready → Mark Served
4. Print kitchen ticket (items + order #) or guest bill (full itemized)

## Owner Dashboard

- Revenue, order count, average order value
- Top selling items chart
- Filterable order history
- End-of-day report with CSV export

## Project Structure

```
panache-ordering-system/
├── apps/
│   ├── customer-menu/      Guest-facing menu & checkout
│   ├── front-desk/         Reception order management
│   └── owner-dashboard/    Analytics & reports
├── packages/
│   ├── shared-types/       Shared constants & JSDoc types
│   └── supabase-schema/    Table names & RPC constants
├── supabase/
│   ├── migrations/         Database schema
│   └── seed.sql            Full Panache menu + staff
└── docs/
    └── architecture.md
```

## Deployment (Vercel)

Deploy each app as a separate Vercel project pointing to:
- Root: repo root
- Build command: `pnpm build:menu` (or desk/owner)
- Output: `apps/customer-menu/dist`

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in each project's environment variables.

## Phase 3 (Future)

- Menu management (add/edit/86 items from owner dashboard)
- Staff PIN management
- Room number validation against resort room list
- Custom print formats (receipt vs full page)
