# Shivalaya Resorts & Panache Restaurant — Live Demo & Deployment Guide

This guide walks you through deploying the live demo links for **Supabase** and **Vercel** so resort owners, kitchen staff, and guests can immediately place real orders, track live preparation over WebSockets, settle bills, and view owner analytics.

---

## 🏛️ Architecture Overview

The system consists of three distinct web applications connected to a single Supabase backend:

| Application | Directory | Purpose / Audience |
| :--- | :--- | :--- |
| **Guest Sanctuary Portal** | `apps/guest-portal` | Customer ordering for both **In-House Room Residents** and **Outside Walk-In Diners** at Panache Restaurant. Includes instant 1-tap entry (zero OTP delays), live order tracker, and itemized 5% GST tax bill. |
| **Kitchen KDS Kanban** | `apps/kitchen-panel` | Live kitchen display system for the chef team. Real-time audio-visual alerts on incoming orders, color-coded badges for `🍽️ WALK-IN TABLE T-XX` vs `🛎️ ROOM SERVICE`, and 1-tap prep status progression. |
| **Receptionist & Owner Desk** | `apps/resort-reception` | Front-desk ledger, running folio management, walk-in bill settlement modal (Cash / UPI / Card), and dedicated Owner Analytics separating Walk-In customers from In-House room folios. |

---

## ⚡ Part 1: Supabase Setup (Database & Realtime)

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project (e.g. `shivalaya-panache-prod`).
2. Note your **Project URL** and **anon public key** from `Settings` -> `API`.

### 2. Run Database Migrations
Open the **SQL Editor** in your Supabase dashboard and run the migrations located in `supabase/migrations/`:
- If starting fresh, run migrations `001` through `020`.
- If your database already has the base tables, execute:
  `supabase/migrations/020_walkin_and_realtime_enhancements.sql`

This migration provisions:
- `tax_amount`, `grand_total`, `payment_status`, `payment_method`, `settled_at`, and `settled_by` columns on `orders`.
- 12 restaurant tables (`T-01` through `T-12`) in `restaurant_tables`.
- The `direct_guest_login` RPC for frictionless 1-tap guest authentication without SMS OTP blockers.
- The canonical `create_order` RPC calculating 5% Restaurant GST (2.5% CGST + 2.5% SGST) and setting payment status (`'folio'` for rooms, `'pending'` for walk-ins).
- The `settle_walkin_bill` RPC for recording payment mode (UPI, Cash, Card).

### 3. Enable Realtime Publications
1. In the Supabase Dashboard, go to **Database** -> **Replication** (or **Publications**).
2. Ensure `orders` and `restaurant_tables` are selected in the `supabase_realtime` publication.
3. Verify that `orders` has `REPLICA IDENTITY FULL`:
   ```sql
   ALTER TABLE public.orders REPLICA IDENTITY FULL;
   ```

---

## 🚀 Part 2: Vercel Deployment (3 Live Demo URLs)

To provide distinct URLs for guests, kitchen staff, and reception/owners, create **3 separate Vercel projects** linked to your Git repository:

### Project 1: Guest Portal (`panache-guest.vercel.app`)
- **Root Directory**: `apps/guest-portal`
- **Framework Preset**: `Vite`
- **Build Command**: `pnpm build` (or `npm run build`)
- **Output Directory**: `dist`
- **Environment Variables**:
  - `VITE_SUPABASE_URL` = `https://your-project.supabase.co`
  - `VITE_SUPABASE_ANON_KEY` = `your-anon-key`
  - `VITE_RESORT_ID` = `00000000-0000-0000-0000-000000000001`

### Project 2: Kitchen Display System (`panache-kitchen.vercel.app`)
- **Root Directory**: `apps/kitchen-panel`
- **Framework Preset**: `Vite`
- **Build Command**: `pnpm build` (or `npm run build`)
- **Output Directory**: `dist`
- **Environment Variables**:
  - `VITE_SUPABASE_URL` = `https://your-project.supabase.co`
  - `VITE_SUPABASE_ANON_KEY` = `your-anon-key`
  - `VITE_RESORT_ID` = `00000000-0000-0000-0000-000000000001`

### Project 3: Receptionist & Owner Dashboard (`panache-desk.vercel.app`)
- **Root Directory**: `apps/resort-reception`
- **Framework Preset**: `Vite`
- **Build Command**: `pnpm build` (or `npm run build`)
- **Output Directory**: `dist`
- **Environment Variables**:
  - `VITE_SUPABASE_URL` = `https://your-project.supabase.co`
  - `VITE_SUPABASE_ANON_KEY` = `your-anon-key`
  - `VITE_RESORT_ID` = `00000000-0000-0000-0000-000000000001`

> **Note on Client-Side Routing**: Each application already includes a `vercel.json` file configuring SPA rewrites:
> ```json
> {
>   "rewrites": [
>     { "source": "/(.*)", "destination": "/index.html" }
>   ]
> }
> ```
> This ensures that refreshing deep URLs (e.g. `/order/12345` or `/menu`) works without 404 errors.

---

## 🧪 Part 3: End-to-End Live Verification Test

Follow this 6-step walkthrough to demonstrate the full system to the resort owners:

### Step 1: Open the Three Dashboards in Separate Windows
- Window A: Guest Portal (`http://localhost:5173` or Vercel URL)
- Window B: Kitchen Panel (`http://localhost:5174` or Vercel URL)
- Window C: Reception Dashboard (`http://localhost:5175` or Vercel URL)

### Step 2: Outside Walk-In Customer Ordering
1. In Window A (Guest Portal), go to `/login`.
2. Select **"Walk-In Diner"**.
3. Enter:
   - Name: `Karan Malhotra`
   - Mobile: `9876543211`
   - Table: `Table T-03`
4. Tap **"Start Dining Order"** (instant entry, no SMS OTP required).
5. Add items to cart (e.g. *Panache Chicken* + *Garlic Naan*).
6. Tap **"Cart"** -> **"Proceed to Details & Seating"**.
7. Note the transparent 5% GST breakdown:
   - Subtotal: ₹510
   - Restaurant GST (5%): ₹25.50
   - Grand Total: ₹535.50
8. Tap **"Place Order"**.

### Step 3: Realtime Kitchen Alert (Zero Page Refresh)
1. Observe Window B (Kitchen Panel):
   - A chime plays and a new order card appears instantly at the top of the **New Orders** column.
   - The card displays a prominent gold badge: `🍽️ Walk-In Table T-03` alongside `Karan Malhotra (Walk-In)`.
2. Kitchen staff taps **"Accept Order"** -> card transitions to **In Preparation**.
3. Kitchen staff taps **"Start Prep"** -> **"Mark Ready"**.

### Step 4: Realtime Order Tracking for Guest
1. Observe Window A (Guest Portal):
   - The status stepper progresses automatically from *Order Received* -> *Confirmed* -> *Preparing* -> *Ready!* via Supabase WebSocket broadcast.
   - Guest sees the itemized tax receipt with payment status badge: `PAY AT TABLE / COUNTER`.

### Step 5: Receptionist Walk-In Bill Settlement
1. Observe Window C (Receptionist Dashboard -> **Orders** tab):
   - Order appears live with customer badge `Walk-In Diner`, table `🍽️ Table T-03`, and status `⏳ PENDING BILL`.
2. Receptionist clicks **"🧾 Settle Bill"**:
   - Itemized Tax Invoice modal opens showing subtotal, CGST 2.5%, SGST 2.5%, and Grand Total.
   - Receptionist selects **"📱 UPI / QR"** or **"💵 Cash"** and taps **"Confirm Payment"**.
   - Order instantly updates to `✓ Paid (UPI)`.
   - Receptionist can tap **"🖨️ Print Tax Invoice"** for a physical thermal printout.

### Step 6: Owner Analytics Dashboard
1. In Window C, switch to the **Analytics** tab:
   - The Owner sees dedicated metrics:
     - **Walk-In Outside Diners**: Order count, Direct cash/UPI revenue, Average Order Value (AOV).
     - **In-House Room Residents**: Room order count, Room folio billed revenue, Resident AOV.
     - **Revenue Origin Split Bar**: Visual percentage split between outside diners vs hotel guests.
     - **Total F&B Revenue**: Combined restaurant sales including 5% GST.
