# Shivalaya — Sprint Implementation Guide (Sprints 1 to 5)

## Overview
This document provides the exact implementation details, SQL migrations, components, Zustand stores, RPC functions, and test sequences for all 5 development sprints of the Shivalaya Guest Experience Platform.

---

## Sprint 1 — Supabase Foundation (3 days)
- **Goal**: Project setup, all schema migrations, RLS policies, RPC functions, seed data.
- **Unlocks**: All other sprints.

### Part A — Create Supabase Project
1. Project Name: `shivalaya-resorts-prod`
2. Region: `ap-south-1` (Mumbai / ap-south-1 AWS)
3. Credentials: Save `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.
4. Enable Realtime on `orders` and `activity_bookings`.

### Part B — Extensions & Sequences
```sql
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1 INCREMENT 1 MINVALUE 1 MAXVALUE 99999 CYCLE;
CREATE SEQUENCE IF NOT EXISTS booking_number_seq START 1 INCREMENT 1 MINVALUE 1 MAXVALUE 99999 CYCLE;
```

### Part C — Tables & Views
1. `resorts`, `rooms`, `restaurant_tables`, `staff` (`001_core.sql`)
2. `guests`, `orders`, `order_status_log` (`002_guests_orders.sql`)
3. `menu_categories`, `menu_items`, `menu_item_variants` (`003_menu.sql`)
4. `activities`, `activity_time_slots`, `activity_bookings`, `whatsapp_log` (`004_activities.sql`)
5. `guest_folio` VIEW (`005_folio_view.sql`)
6. Updated_at and order status audit triggers (`006_triggers.sql`)

### Part D — RLS Policies & RPC Functions
- Enable RLS on all tables.
- Public/anon read access for menu items, categories, available activities/slots.
- Staff authenticated policies for full access.
- RPC functions: `create_order`, `verify_staff_pin`, `check_in_guest`, `get_available_slots`, `book_activity_slot` (with `pg_advisory_xact_lock`).

### Part E — Seed Data
- Shivalaya Resorts UUID, standard room grid (101-102, 201-202 with balcony, 301-302 Deluxe/Suite), tables 1-6.
- 150+ Panache menu items with variant groups (Parathas, Dosas) and category time gates (Breakfast 07:00-16:00).
- Experiences: Bird Cage (₹500/person, max 6), Bonfire Setup (₹1,200/setup, balcony required), PS5 Gaming (₹800/session).

---

## Sprint 2 — Guest Portal Food Ordering (4 days)
- **Goal**: Vite + React setup, menu fetching with time-gating, variant picker bottom sheet, Zustand cart, RPC order placement, live tracking page with mobile vibration.

### Key Logic
- **Time Gating**: Client-side filtering of categories by comparing `currentMinutes` against `available_from` and `available_until`.
- **Variant Picker**: Modal opens on items with `has_variants=true`. Disables Add button until required selection is made.
- **Order Placement**: Calls `create_order` RPC. Pre-fills guest info from `sessionStorage`.
- **Live Tracker**: Subscribes to `orders` channel (`id=eq.[orderId]`). Triggers `navigator.vibrate([200, 100, 200])` when `status === 'ready'`.
- **QR Pre-fill**: Reads `?room=302` or `?table=5&type=dine_in` from URL and saves to session.

---

## Sprint 3 — Panache Kitchen Panel (3 days)
- **Goal**: PIN login, real-time order queue, KOT print view, sound alerts, order status management.

### Key Logic
- **Auth**: Staff selects profile → enters 4-digit PIN → `verify_staff_pin` RPC checks bcrypt hash → signs in with linked Supabase Auth user.
- **Queue UI**: 3 columns (New | In Progress | Ready).
- **Order Age Timer**: Displays elapsed time since acceptance; turns amber at 20 min, red at 35 min.
- **Sound Alerts**: Web Audio API sine wave oscillator tone (880 Hz) on new orders + Web Notification API background toast.
- **KOT Print**: `@media print` stylesheet formatted for 80mm thermal receipt printer (no prices shown).

---

## Sprint 4 — Resort Reception Core (4 days)
- **Goal**: Owner/reception login, guest check-in/out, active stays list, order history, 86 menu item availability toggles, owner analytics.

### Key Logic
- **Check-in**: Calls `check_in_guest` RPC to insert guest and update room `is_occupied=true`.
- **Check-out**: Opens guest folio drawer querying `guest_folio` VIEW, confirms checkout, marks room unoccupied.
- **Guest Stays**: Table displaying running tab by aggregating `guest_folio` grouped by `guest_id`.
- **Menu Management**: Fast toggle switch updating `menu_items.is_available`.
- **Analytics**: Queries today's revenue, order count, top 5 items, revenue trends over last 7 days.

---

## Sprint 5 — Activities & Experiences Module (5 days)
- **Goal**: Guest booking flow, slot picker, concurrency-safe RPC, reception confirmation, folio integration, activity management.

### Key Logic
- **Experiences Page**: Displays per_person, per_setup, per_session pricing structures and balcony requirements.
- **Slot Picker**: Date chips + slot chips calling `get_available_slots` RPC (shows "X spots left").
- **Booking RPC**: Calls `book_activity_slot` RPC using `pg_advisory_xact_lock` to guarantee zero overbooking.
- **Reception Activities**: Pending queue with Realtime updates, staff assignment, and calendar schedule view.
- **Unified Folio**: Combined food + activities bill with A4 PDF print stylesheet.
- **Activity Management**: Owner panel to add/edit/disable activities and slots.
