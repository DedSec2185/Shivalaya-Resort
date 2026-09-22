# Shivalaya Resorts & Panache Pavilion — Master Production & Deployment Guide

This guide contains the complete technical runbook for deploying the 3 applications to **Vercel** and **Supabase**, along with the operational checklist for the **Shivalaya Resorts client team**.

---

## 📋 PART 1: DEVELOPER SETUP & VERCEL DEPLOYMENT RUNBOOK

### 1.1 Supabase Production Database Setup
1. **Open Supabase Dashboard**: Go to [https://supabase.com/dashboard](https://supabase.com/dashboard) and select your production project.
2. **Apply Migrations**:
   - Go to **SQL Editor** → **New Query**.
   - If running for the first time, execute migrations `001_core.sql` through `016_guest_otp_auth.sql`.
   - Execute the new production migration:
     👉 [`supabase/migrations/017_production_data.sql`](file:///c:/Users/abhay/Desktop/Shivalaya%20Panache%20Menu/supabase/migrations/017_production_data.sql)
   - This automatically seeds the **28 official rooms**, **12 restaurant tables**, **8 staff profiles with 4-digit PINs**, and sets activity capacity to **50 per slot**.
3. **Create Owner & Reception Auth User**:
   - In Supabase Dashboard → **Authentication** → **Users** → **Add User** → **Create User**.
   - **Email**: `shivalayaresort@gmail.com`
   - **Password**: Set a secure initial password (e.g. `Shivalaya@2026!`) and check "Auto-confirm user".
   - This email is now authorized to log in to the **Resort Reception Dashboard** with full owner analytics access!

---

### 1.2 Deploying the 3 Apps on Vercel

Because this is a monorepo, you will create **3 separate projects** on Vercel from the same Git repository:

```
                  ┌─────────────────────────────────────┐
                  │   GitHub: shivalaya-panache-menu    │
                  └──────────────────┬──────────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         ▼                           ▼                           ▼
 ┌───────────────┐           ┌───────────────┐           ┌───────────────┐
 │ Project 1     │           │ Project 2     │           │ Project 3     │
 │ Guest Portal  │           │ Kitchen Panel │           │ Reception     │
 │ (Guest Phone) │           │ (KDS Tablet)  │           │ (Desk PC)     │
 └───────────────┘           └───────────────┘           └───────────────┘
```

#### Project 1: Guest Portal
- **Project Name**: `shivalaya-guest-portal`
- **Root Directory**: `apps/guest-portal` (Click "Edit" next to Root Directory and select `apps/guest-portal`)
- **Framework Preset**: `Vite`
- **Build Command**: `pnpm build` (or default `vite build`)
- **Output Directory**: `dist`
- **Install Command**: `pnpm install`
- **Environment Variables**:
  - `VITE_SUPABASE_URL`: `https://your-supabase-project.supabase.co`
  - `VITE_SUPABASE_ANON_KEY`: `your-supabase-anon-key`
- **Recommended Custom Domain**: `portal.shivalayaresort.com` (or `guest.shivalayaresort.com`)

#### Project 2: Kitchen Display System (KDS)
- **Project Name**: `shivalaya-kitchen-panel`
- **Root Directory**: `apps/kitchen-panel`
- **Framework Preset**: `Vite`
- **Build Command**: `pnpm build`
- **Output Directory**: `dist`
- **Install Command**: `pnpm install`
- **Environment Variables**:
  - `VITE_SUPABASE_URL`: `https://your-supabase-project.supabase.co`
  - `VITE_SUPABASE_ANON_KEY`: `your-supabase-anon-key`
- **Recommended Custom Domain**: `kitchen.shivalayaresort.com` (or `kds.shivalayaresort.com`)

#### Project 3: Resort Reception & Owner Dashboard
- **Project Name**: `shivalaya-reception`
- **Root Directory**: `apps/resort-reception`
- **Framework Preset**: `Vite`
- **Build Command**: `pnpm build`
- **Output Directory**: `dist`
- **Install Command**: `pnpm install`
- **Environment Variables**:
  - `VITE_SUPABASE_URL`: `https://your-supabase-project.supabase.co`
  - `VITE_SUPABASE_ANON_KEY`: `your-supabase-anon-key`
- **Recommended Custom Domain**: `reception.shivalayaresort.com` (or `desk.shivalayaresort.com`)

---

### 1.3 Generating Room & Table QR Codes

Once the guest portal is deployed (e.g. `https://portal.shivalayaresort.com`), generate the QR codes using these exact URLs:

#### For the 28 Rooms (In-Suite QR Standees):
- Deluxe Room 101: `https://portal.shivalayaresort.com/?room=101`
- Deluxe Room 102: `https://portal.shivalayaresort.com/?room=102`
- Deluxe Room 103: `https://portal.shivalayaresort.com/?room=103`
- Deluxe Room 104: `https://portal.shivalayaresort.com/?room=104`
- Executive Rooms 201 to 213: `https://portal.shivalayaresort.com/?room=201` ... `?room=213`
- Premium Rooms 301 to 304: `https://portal.shivalayaresort.com/?room=301` ... `?room=304`
- Luxury Suites:
  - `https://portal.shivalayaresort.com/?room=Suite+401`
  - `https://portal.shivalayaresort.com/?room=Suite+402`
  - `https://portal.shivalayaresort.com/?room=Suite+403`
- Deodar Family Suite: `https://portal.shivalayaresort.com/?room=Deodar+Suite+501`
- Villa:
  - `https://portal.shivalayaresort.com/?room=Villa+Room+1`
  - `https://portal.shivalayaresort.com/?room=Villa+Room+2`
  - `https://portal.shivalayaresort.com/?room=Villa+Room+3`

#### For the 12 Panache Restaurant Dining Tables (Table Tents):
- Table 1: `https://portal.shivalayaresort.com/?table=T-01`
- Table 2: `https://portal.shivalayaresort.com/?table=T-02`
- ...
- Table 12: `https://portal.shivalayaresort.com/?table=T-12`

---

## 🏨 PART 2: CLIENT OPERATIONAL CHECKLIST & CHEAT-SHEET

### 2.1 Staff PIN Login Cheat-Sheet (Print & Keep at Counter)

| Staff Member | Designation | Login Location | 4-Digit PIN |
|---|---|---|:---:|
| **Kundan Chef** | Head Chef | Kitchen Panel (KDS) | `1101` |
| **Deepak** | Kitchen Staff | Kitchen Panel (KDS) | `1102` |
| **Neha** | Kitchen Staff | Kitchen Panel (KDS) | `1103` |
| **Himanshu** | Kitchen Staff | Kitchen Panel (KDS) | `1104` |
| **Sujit** | Restaurant Service Staff | Kitchen/Order Panel | `1201` |
| **Varun** | Restaurant Service Staff | Kitchen/Order Panel | `1202` |
| **Bilam Pandey** | Reception & Front Desk | Reception Dashboard | `1234` |
| **Resort Owner** | Master Analytics & Admin | Reception Dashboard | `9999` |

*Note: Reception and Owner can also log in via Email (`shivalayaresort@gmail.com`) and password.*

---

### 2.2 HP Smart Tank 500 Printer Configuration

Your printer is an **HP Smart Tank 500** connected via USB/Wi-Fi to the reception computer:
1. Ensure the official HP printer driver is installed on the computer.
2. In the Windows print dialog (which opens automatically when you click **"Download Folio PDF"** or **"Print KOT"**):
   - **Destination**: Select `HP Smart Tank 500 series`.
   - **Paper Size**: Set to `A4` (or `A5` if using half-sheets).
   - **Margins**: Set to `Default` or `Minimum`.
   - **Options**: Ensure **"Background graphics"** is **CHECKED** so that the Shivalaya logo and divider borders print crisply.
3. The invoice automatically calculates and itemizes:
   - Food & Beverage Subtotal
   - **F&B GST (5%)**
   - Experiences & Activities Subtotal
   - **Grand Total Settled**

---

### 2.3 Operating Timings & Rules

1. **Guest Check-in**: Standard check-in starts at **1:00 PM (13:00)**. When reception enters the guest's phone number, the guest receives their WhatsApp pass and portal link.
2. **Guest Check-out**: Standard check-out is by **11:00 AM (11:00)**. When reception clicks "Confirm Checkout", the room status flips to unoccupied, the digital session automatically expires, and a WhatsApp final invoice summary is dispatched.
3. **Kitchen Last Orders**: Room service cutoff is at **10:30 PM (22:30)**. After 10:30 PM, the guest portal dynamically indicates that the kitchen is closed for night orders, directing late inquiries to the reception desk.
4. **Billing Rules**:
   - **Residential Guests**: 100% of food, beverages, and activity charges are posted to their **Room Folio** and settled at check-out.
   - **Walk-in Diners**: Settled **instantly** at Table (`T-01` to `T-12`) via Cash or UPI QR.

---

## 🔍 PART 3: FEATURE-BY-FEATURE VERIFICATION MATRIX

Every button, model, and screen across the 3 applications has been verified:

### Application 1: Guest Portal (`apps/guest-portal`)
- [x] **Hero Banner**: Displays high-res mountain mist visual, 1,370m altitude stamp, and dynamic open/closed status (7:30 AM – 10:30 PM cutoff).
- [x] **Menu Categories & Tabs**: 23 categories with smooth horizontal scrolling. Starts cleanly on `Breakfast` on load.
- [x] **Dish Descriptions**: 170 unique, appetizing culinary descriptions for every dish (no repetitive phrases).
- [x] **Cart Bar & Drawer**: Floating cart summary with live item counter, spring animations, and safe-area inset for iPhone home bars.
- [x] **Checkout Modal**:
  - Auto-fills verified resident room number for checked-in guests.
  - Supports 12 restaurant tables (`T-01` to `T-12`) with validation shake animations.
  - Generates human-readable order IDs (e.g. `PAN-00042`).
- [x] **Activity Bookings**: Supports Guided Trekking, Private Bonfire, Yoga, and Spa with 50-guest slot capacity limits.
- [x] **Order Tracker**: Live status stepper (New → Preparing → Ready → Served) with countdown estimate.
- [x] **Resident Pass / Wi-Fi**: 1-tap clipboard copy for Wi-Fi credentials with toast alert.
- [x] **Desktop vs Mobile Optimization**: Responsive multi-column layout on wide screens (no fake mobile frame), edge-to-edge on mobile phones.

### Application 2: Kitchen Display System (`apps/kitchen-panel`)
- [x] **PIN Keypad**: Smooth tactile touch buttons with 3-attempt lockout security.
- [x] **Staff Selector**: Profiles for Kundan, Deepak, Neha, Himanshu, Sujit, Varun.
- [x] **Kanban Order Board**: 3 live columns (`New Orders`, `Preparing`, `Ready / Served`) with real-time Supabase subscriptions.
- [x] **KOT Printing**: 1-tap KOT ticket printout formatted for the HP Smart Tank 500 printer.
- [x] **Audio Chime**: Sound alert on new incoming orders.
- [x] **Inventory Management**: Real-time stock counters, low-stock amber alerts, and 86-ing (marking dishes out-of-stock).

### Application 3: Resort Reception (`apps/resort-reception`)
- [x] **Login**: Email/Password authentication for `shivalayaresort@gmail.com`.
- [x] **Guests & Stays Tab**:
  - Real-time guest room grid for all 28 rooms.
  - Room type categorization (Deluxe, Executive, Premium, Luxury Suite, Deodar Suite, Villa).
  - Running tab tracker updated live with food and activity charges.
- [x] **Check-in Modal**:
  - Dynamic unoccupied room dropdown showing room types.
  - Expected check-out date picker.
  - Automated WhatsApp welcome trigger checkbox.
- [x] **Checkout & Folio Drawer**:
  - Itemized food and activity charge lines.
  - **Exact 5% GST computation** on F&B charges.
  - **HP Smart Tank 500 Printable Invoice** (`window.print()`).
  - WhatsApp settlement receipt dispatch.
- [x] **Restaurant Orders Tab**:
  - Shows both Room service and Table orders (`Table T-01`, etc.).
  - Manual order entry modal for front-desk phone calls.
- [x] **Activities Management Tab**:
  - Live activity booking approval and capacity management (up to 50 guests per slot).
- [x] **Analytics & Revenue Tab**:
  - Daily revenue, occupancy rate, average room tab, and top-selling Panache dishes.
