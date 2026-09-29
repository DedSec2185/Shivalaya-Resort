# Shivalaya Resorts & Panache Restaurant Management Suite

Integrated luxury guest experience, real-time kitchen display system (KDS), and front-desk property management platform for **Shivalaya Resorts** and **Panache Restaurant** (Bhimtal, Uttarakhand).

Powered by a unified **Supabase** backend with Row-Level Security (RLS) and real-time WebSocket event dispatching.

---

## 📱 Applications Matrix

| Application | Workspace Folder | Dev Port | Production Domain | Purpose |
|---|---|---|---|---|
| **Guest Portal** | [`apps/guest-portal`](file:///c:/Users/abhay/Desktop/Shivalaya%20Panache%20Menu/apps/guest-portal) | `5190` | `order.panache-shivalaya.com` | Guest dining ordering, sanctuary suites showcase, mountain experiences & live order tracking. |
| **Kitchen Panel (KDS)** | [`apps/kitchen-panel`](file:///c:/Users/abhay/Desktop/Shivalaya%20Panache%20Menu/apps/kitchen-panel) | `5181` | `kds.panache-shivalaya.com` | Live kitchen display system, multi-station order routing, 80mm thermal KOT printing, and prep timers. |
| **Resort Reception** | [`apps/resort-reception`](file:///c:/Users/abhay/Desktop/Shivalaya%20Panache%20Menu/apps/resort-reception) | `5183` | `staff.panache-shivalaya.com` | Front desk guest check-in/out, consolidated folios, menu availability (86-ing), and owner revenue analytics. |

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` in each application:
```bash
# In apps/guest-portal, apps/kitchen-panel, and apps/resort-reception
cp .env.example .env.local
```
Fill in your Supabase connection parameters:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_RESORT_ID` (Defaults to `00000000-0000-0000-0000-000000000001`)

### 3. Run Development Servers

Run all three applications simultaneously in parallel:
```bash
pnpm dev
```

Or run any specific application independently:
```bash
pnpm dev:portal      # Guest Portal     → http://localhost:5190
pnpm dev:kitchen     # Kitchen KDS      → http://localhost:5181
pnpm dev:reception   # Front Desk Desk  → http://localhost:5183
```

---

## 🗂️ Monorepo Architecture

```
shivalaya-resort-suite/
├── apps/                               # Web applications
│   ├── guest-portal/                   # Mobile-first guest food ordering & experiences
│   ├── kitchen-panel/                  # Realtime Kitchen Display System (KDS)
│   └── resort-reception/               # Front desk PMS, check-in, guest folios & analytics
├── packages/                           # Shared packages across all apps
│   ├── shared-types/                   # Shared TypeScript/JSDoc types, enums & runtime config
│   └── supabase-schema/                # Database table names, constants & RPC contract keys
├── marketing/                          # Collateral, brochures & templates (see marketing/README.md)
│   ├── brochures/                      # Luxury Pre-Wedding shoot guides & PDF brochure
│   ├── posters/                        # Highway billboards & poster studio
│   └── menu-templates/                 # Complete 150+ item restaurant print menu
├── assets/                             # Global branding assets & photography
│   ├── branding/                       # Official logos, crests, badges & medallions
│   └── photos/                         # Curated resort and dining photography
├── docs/                               # System documentation (see docs/README.md)
│   ├── sprint_implementation_guide.md  # Detailed sprint delivery plan & technical specs
│   ├── architecture_and_flows.md       # Architecture diagrams & state machine transitions
│   ├── CLIENT_AND_STAFF_HANDOVER_GUIDE.md # Staff operations handbook
│   ├── PRODUCTION_DEPLOYMENT_GUIDE.md  # Vercel & DNS launch runbook
│   └── reports/                        # Visual HTML architectural reports
├── scripts/                            # Operational & build scripts (see scripts/README.md)
│   ├── brochures/                      # Brochure HTML & PDF compilers
│   ├── posters/                        # Billboard and poster generator scripts
│   ├── drive/                          # Google Drive asset synchronization
│   └── utilities/                      # Seed data conversion & fixture tools
├── supabase/                           # Database engine
│   ├── migrations/                     # Ordered SQL migrations (001_core to 023_fix)
│   └── seed.sql                        # Default resort rooms, tables, staff PINs & menu
└── tests/                              # Automated test suites
    └── runtime-config.test.mjs         # Safe runtime configuration validation tests
```

---

## 🛠️ Build & Verification Commands

| Command | Action |
|---|---|
| `pnpm check` | Runs all tests and verifies production TypeScript builds across all apps |
| `pnpm test` | Runs the Node.js test runner against `tests/**/*.test.mjs` |
| `pnpm build` | Compiles production bundles for all applications via Vite |
| `pnpm build:portal` | Compiles production bundle for Guest Portal (`apps/guest-portal/dist`) |
| `pnpm build:kitchen` | Compiles production bundle for Kitchen KDS (`apps/kitchen-panel/dist`) |
| `pnpm build:reception` | Compiles production bundle for Resort Reception (`apps/resort-reception/dist`) |

---

## 🔐 Default Staff PIN Credentials

Default PIN credentials configured in `supabase/seed.sql`:

| Role | Default PIN | Access Level |
|---|---|---|
| **Front Desk Reception** | `1234` | Full access to room ledger, order queue, check-in/out, and 86-ing items |
| **Kitchen Chef** | `2024` | Order queue, ticket status advancement, KOT printing, and stock toggles |
| **Resort Owner** | `9999` | Revenue analytics, financial reports, stay records, and system settings |

---

## 📚 Essential Documentation Links

- [Documentation Hub](file:///c:/Users/abhay/Desktop/Shivalaya%20Panache%20Menu/docs/README.md)
- [Sprint Implementation Guide](file:///c:/Users/abhay/Desktop/Shivalaya%20Panache%20Menu/docs/sprint_implementation_guide.md)
- [System Architecture & Flows](file:///c:/Users/abhay/Desktop/Shivalaya%20Panache%20Menu/docs/architecture_and_flows.md)
- [Client & Staff Operations Manual](file:///c:/Users/abhay/Desktop/Shivalaya%20Panache%20Menu/docs/CLIENT_AND_STAFF_HANDOVER_GUIDE.md)
- [Production Deployment Guide](file:///c:/Users/abhay/Desktop/Shivalaya%20Panache%20Menu/docs/PRODUCTION_DEPLOYMENT_GUIDE.md)
- [Interactive System Visualizer](file:///c:/Users/abhay/Desktop/Shivalaya%20Panache%20Menu/docs/SHIVALAYA_SYSTEM_GUIDE.html)
- [Marketing & Brochure Collateral](file:///c:/Users/abhay/Desktop/Shivalaya%20Panache%20Menu/marketing/README.md)
- [Automated Scripts Guide](file:///c:/Users/abhay/Desktop/Shivalaya%20Panache%20Menu/scripts/README.md)
