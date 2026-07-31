# Architecture

## Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Customer Menu  │     │   Front Desk    │     │ Owner Dashboard │
│  (no auth)      │     │  (PIN login)    │     │  (PIN login)    │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │    Supabase JS SDK    │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │      Supabase           │
                    │  Postgres + Realtime    │
                    │                         │
                    │  restaurants            │
                    │  menu_items             │
                    │  orders  ◄── Realtime   │
                    │  staff (PIN via RPC)    │
                    │  order_status_log       │
                    └─────────────────────────┘
```

## Key Design Decisions

### Single source of truth

All three apps read/write the same `orders` table. No app-to-app communication. The owner dashboard has zero coupling to the other apps — if you rebuild the customer menu, analytics still works.

### Realtime, not polling

Front desk subscribes to Postgres changes via Supabase Realtime. New orders push instantly with a browser beep.

### PIN auth via RPC

Staff never stored client-side. `verify_staff_pin()` RPC checks bcrypt hash server-side. Session persisted in localStorage (staff name + role only).

### Service types

| Type | Use case |
|------|----------|
| `room_service` | Guest in hotel room — requires room number |
| `dine_in` | Guest at restaurant table — waiter calls name |
| `pickup` | Guest en route — food ready on arrival |

### Order status flow

```
new → confirmed → preparing → ready → served
                              ↘ cancelled (any active stage)
```

Each transition logged in `order_status_log` with staff name.

## Database Tables

See `supabase/migrations/0001_init.sql` for full schema.

## Security Notes (MVP)

Current RLS allows public read/write on orders for simplicity with anon key. Before production:

- Tighten RLS policies
- Add rate limiting on order inserts
- Rotate default PINs
- Consider Supabase Edge Functions for order validation

## Domains (planned)

| Subdomain | App |
|-----------|-----|
| order.* | customer-menu |
| staff.* | front-desk |
| owner.* | owner-dashboard |
