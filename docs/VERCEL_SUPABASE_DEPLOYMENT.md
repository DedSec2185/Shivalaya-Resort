# Shivalaya Resorts & Panache Restaurant — Complete Deployment & Client Presentation Guide

This guide provides a foolproof roadmap for deploying the entire Shivalaya Resort & Panache Restaurant suite to **Vercel** with a fresh **Supabase** backend, guaranteeing a smooth, non-crashing presentation for your client.

---

## 🌟 Highlights of This Setup

1. **Zero External SMS / OTP Blockers**:
   - Guests log in with 1 tap using their Room Number (e.g. `204`) or Dining Table (e.g. `T-03`), or via the instant **"Quick Demo Resident"** button.
   - No SMS gateway contracts, Twilio credits, or DLT registration required.
2. **Zero Automated WhatsApp API Blockers**:
   - Automated check-in/check-out WhatsApp notifications are simulated in real time with high-fidelity toasts showing exact message content and recipient numbers.
   - Concierge and direct room inquiries open native WhatsApp web/app links (`https://api.whatsapp.com/send`) without requiring server-side Meta Graph API tokens.
3. **Resilient Dual-Layer Realtime Sync**:
   - Real-time order cards, preparation stages, and bill settlements sync via **Supabase PostgreSQL Realtime WebSockets** (`orders`, `restaurant_tables`, `activity_bookings`).
   - If running locally across tabs or during temporary network drops, the system falls back to a zero-latency `BroadcastChannel('panache_live_sync')` so orders never get lost.
4. **White-Screen Immunity (WSOD Safe)**:
   - Missing or unconfigured environment variables fall back to safe demo states with preloaded menus and orders instead of crashing the app.

---

## 🏛️ System Architecture

The monorepo contains three independent client applications sharing a single Supabase backend:

| Application | Directory | Default Port | Audience / Role |
| :--- | :--- | :--- | :--- |
| **Guest Sanctuary Portal** | `apps/guest-portal` | `5190` | In-house room guests & walk-in restaurant diners. Digital menus, room service, bespoke experiences, bill previews. |
| **Kitchen KDS Kanban** | `apps/kitchen-panel` | `5181` | Kitchen chefs & line cooks. Live audio-visual order cards, prep status management, inventory tracker. |
| **Resort Reception & Owner Desk** | `apps/resort-reception` | `5183` | Front desk staff & owners. Guest check-in/out, room keys, walk-in billing, and analytics. |

---

## ⚡ Step 1: Provision the Supabase Database (60 Seconds)

1. Create a new project on [supabase.com](https://supabase.com) (e.g., `shivalaya-resorts-demo`).
2. Go to **Settings** -> **API** and copy:
   - **Project URL** (`https://xxxxxxxxxxxx.supabase.co`)
   - **Anon Public API Key** (`eyJh......`)
3. Open the **SQL Editor** tab in your Supabase dashboard.
4. Open the file [supabase/ALL_IN_ONE_SETUP.sql](file:///c:/Users/abhay/Desktop/Shivalaya%20Panache%20Menu/supabase/ALL_IN_ONE_SETUP.sql), copy its entire contents, paste it into the SQL Editor, and click **Run**.

### What This Single Script Provisions:
- **Core Tables**: `resorts`, `rooms` (28 keys), `restaurant_tables` (12 tables), `staff`, `guests`, `guest_sessions`, `orders`, `order_status_log`, `activities`, `activity_time_slots`, `activity_bookings`, `inventory_items`, `stock_inward`, `stock_consumption`.
- **Views**:
  - `staff_public`: Masked staff view for PIN pickers (hides password/PIN hashes from client).
  - `guest_folio`: Unified billing combining restaurant charges and activity bookings.
  - `current_stock`: Live computed stock balances with automatic low-stock alerts.
- **Secure Stored Procedures (RPCs)**:
  - `verify_staff_pin` & `verify_staff_pin_any`: Bcrypt-hashed 4-digit PIN verification.
  - `direct_guest_login`: Instant guest login bypassing OTP.
  - `create_order`: Canonical order placement with 5% Restaurant GST calculation.
  - `settle_walkin_bill`: Instant walk-in invoice settlement (Cash, UPI, Card).
  - `check_in_guest` & `check_out_guest`: Room management and guest session issuance.
  - `get_available_slots` & `book_activity_slot`: Experience bookings with capacity locking.
- **Realtime Publications**: Auto-subscribes `orders`, `restaurant_tables`, and `activity_bookings` to Supabase Realtime with full replica identity.
- **Pre-Seeded Data**:
  - 28 Official Rooms across 6 categories.
  - 12 Restaurant Tables (`T-01` to `T-12`).
  - 8 Staff Accounts with PINs.
  - 23 Menu Categories and 150+ authentic dishes with prices.
  - 6 Signature Himalayan Experiences with live time slots.
  - Active resident guest in Room `204` (*Abhay Sharma*) with a live sample order in preparation so the screen is never blank!

---

## 🚀 Step 2: Push to Git & Deploy to Vercel

### 1. Push Your Code to a New Git Repository
```bash
git remote add origin https://github.com/YOUR_USERNAME/shivalaya-panache-menu.git
git branch -M main
git push -u origin main
```

### 2. Deploy 3 Distinct Projects on Vercel
In your [Vercel Dashboard](https://vercel.com/dashboard), click **"Add New..."** -> **"Project"** and import your repository **3 separate times**:

#### Project 1: Guest Portal
- **Project Name**: `shivalaya-guest` (or `panache-guest`)
- **Root Directory**: Click *Edit* and select `apps/guest-portal`
- **Framework Preset**: `Vite`
- **Build Command**: `pnpm build` (default)
- **Output Directory**: `dist` (default)
- **Environment Variables**:
  ```env
  VITE_SUPABASE_URL=https://your-project.supabase.co
  VITE_SUPABASE_ANON_KEY=your-anon-public-key
  VITE_RESORT_ID=00000000-0000-0000-0000-000000000001
  VITE_APP_DEMO_MODE=false
  ```

#### Project 2: Kitchen Display System (KDS)
- **Project Name**: `shivalaya-kitchen` (or `panache-kitchen`)
- **Root Directory**: Click *Edit* and select `apps/kitchen-panel`
- **Framework Preset**: `Vite`
- **Build Command**: `pnpm build` (default)
- **Output Directory**: `dist` (default)
- **Environment Variables**:
  ```env
  VITE_SUPABASE_URL=https://your-project.supabase.co
  VITE_SUPABASE_ANON_KEY=your-anon-public-key
  VITE_RESORT_ID=00000000-0000-0000-0000-000000000001
  VITE_APP_DEMO_MODE=false
  ```

#### Project 3: Resort Reception & Front Desk
- **Project Name**: `shivalaya-reception` (or `panache-desk`)
- **Root Directory**: Click *Edit* and select `apps/resort-reception`
- **Framework Preset**: `Vite`
- **Build Command**: `pnpm build` (default)
- **Output Directory**: `dist` (default)
- **Environment Variables**:
  ```env
  VITE_SUPABASE_URL=https://your-project.supabase.co
  VITE_SUPABASE_ANON_KEY=your-anon-public-key
  VITE_RESORT_ID=00000000-0000-0000-0000-000000000001
  VITE_APP_DEMO_MODE=false
  VITE_GUEST_PORTAL_URL=https://shivalaya-guest.vercel.app
  ```

*(SPA routing is handled automatically by the preconfigured `vercel.json` in each folder).*

---

## 🔑 Login & Authorization Cheat-Sheet

| Portal | User / Role | Login Method | Credentials |
| :--- | :--- | :--- | :--- |
| **Guest Portal** | Resident Room Guest | Room Number | Room: `204`, Mobile: `9876543210` |
| **Guest Portal** | Walk-in Restaurant Diner | Table Number | Table: `T-03` (or `T-01` to `T-12`), Mobile: any 10 digits |
| **Guest Portal** | Quick Demo Mode | 1-Tap Button | Click **"Quick Demo Resident"** on `/login` |
| **Kitchen Panel** | Head Chef Kundan | 4-Digit PIN | PIN: `1101` (or Quick PIN `1234`) |
| **Kitchen Panel** | Line Cook Deepak | 4-Digit PIN | PIN: `1102` |
| **Reception Desk** | Bilam Pandey (Receptionist) | 4-Digit PIN | PIN: `1234` |
| **Reception Desk** | Resort Owner | 4-Digit PIN | PIN: `9999` |
| **Reception Desk** | Staff Email Fallback | Email & Password | `receptionist@shivalaya.com` / `shivalaya1234` |
| **Reception Desk** | Owner Email Fallback | Email & Password | `owner@shivalaya.com` / `shivalaya2026` |

---

## 🎬 Client Presentation Walkthrough (Showcase Flow)

For the client demo, open **3 browser tabs or 3 windows side-by-side**:
- **Tab 1**: Guest Portal (`panache-guest.vercel.app`)
- **Tab 2**: Kitchen Panel (`panache-kitchen.vercel.app`)
- **Tab 3**: Reception Desk (`panache-desk.vercel.app`)

### 1. Show Instant Guest Login & Dining Order
1. In **Tab 1** (Guest Portal), go to `/login` and click **"Quick Demo Resident"** (or choose Walk-In Table `T-03`).
2. Add dishes to cart (e.g. *Kadahi Paneer*, *Garlic Naan*, *Virgin Mojito*).
3. Open Cart, view the 5% Restaurant GST calculation, and tap **"Place Order"**.
4. The screen transitions instantly to the live **Order Tracking** screen (`/order/PAN-XXXXX`).

### 2. Show Live Real-Time Kitchen Reception
1. Switch to **Tab 2** (Kitchen Panel, logged in with PIN `1101` or `1234`).
2. Notice the order appears **immediately without refreshing the page**:
   - Tagged with `🛎️ Room 204 — Abhay Sharma` or `🍽️ Table T-03 (Walk-In)`.
   - Audio notification chime triggers.
3. Tap **"Accept Order"** -> status updates to `Confirmed`.
4. Tap **"Start Prep"** -> card moves to `Preparing`.
5. Switch to **Tab 1** (Guest Portal) — notice the status stepper in the guest's phone has updated to **"Preparing" in real-time**!
6. In **Tab 2**, tap **"Mark Ready"**.

### 3. Show Reception Desk & Walk-In Bill Settlement
1. Switch to **Tab 3** (Reception Desk, logged in with PIN `1234`).
2. Open the **Orders** tab:
   - View the active orders.
   - For walk-in orders, click **"🧾 Settle Bill"** -> select **"📱 UPI"** or **"💵 Cash"** -> confirm payment.
   - Click **"🖨️ Print Tax Invoice"** to preview a thermal-ready receipt.
3. Open the **Folio / Rooms** tab:
   - Notice Room `204` displays running room charges with both the food orders and room rate neatly aggregated.
4. Open the **Analytics** tab:
   - View the live revenue split between Room Folios and Walk-in Diners, Average Order Value (AOV), and total F&B gross revenue.

---

## 🛠️ Local Development & Offline Mode

If running completely offline or without internet access:
```bash
# Run all 3 portals concurrently in dev mode
pnpm dev
```
- Guest Portal: `http://localhost:5190`
- Kitchen Panel: `http://localhost:5181`
- Reception Desk: `http://localhost:5183`

The built-in `BroadcastChannel` will keep state synced between all three browser tabs locally with zero lag!
