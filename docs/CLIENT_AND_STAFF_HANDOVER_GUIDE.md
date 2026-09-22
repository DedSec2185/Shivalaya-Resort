# 🏔️ Shivalaya Resorts & Panache Restaurant
## Comprehensive Client & Staff Handover Guide

Welcome to the **Shivalaya Panache Hospitality Platform**. This enterprise 3-tier hospitality system is designed specifically for **Shivalaya Resorts & Sanctuary, Bhowali-Nainital Road, Uttarakhand**.

It seamlessly links **Guests & Diners**, the **Kitchen & Chef Team**, and the **Reception & Management Desk** with real-time cloud data synchronization, zero-delay ordering, and commercial 80mm thermal receipt printing.

---

## 📱 The 3 Real-World Application Models

| Model | Application | Primary Users | Primary Link |
| :--- | :--- | :--- | :--- |
| **Model 1** | **Guest Sanctuary Portal** | Resort Guests & Walk-In Diners | `https://your-guest-portal.vercel.app` |
| **Model 2** | **Kitchen Display System (KDS)** | Head Chefs & Kitchen Staff | `https://your-kitchen-panel.vercel.app` |
| **Model 3** | **Reception & Owner Desk** | Front Desk Managers & Owners | `https://your-reception-desk.vercel.app` |

---

## 🌟 Model 1: Guest Sanctuary Portal (Guest & Diner Guide)

The Guest Portal is crafted as a **luxury mountain resort portal** accessible on any mobile smartphone, tablet, or laptop.

### 1. Instant 1-Tap Entry (Zero OTP Friction)
1. Open the portal link or scan the tabletop/suite QR code.
2. Select your dining context:
   - **🛎️ In-House Resort Guest**: Select your assigned Suite (`101`, `102`, `201`, `204`, `205`, `301`). All food charges bill directly to your room folio.
   - **🍽️ Walk-In Dining (Outside Visitor)**: Enter your mobile number, select your table (`Table T-01` to `Table T-12`), or choose **Takeaway** for counter pickup.
   - **⚡ 1-Tap Demo Access**: Instant 1-tap test buttons for Suite 204 or Table T-04 are available for rapid evaluation.

### 2. Exploring the Panache Menu
- Browse curated Himalayan & Indian specialties organized by categories (Breakfast, Starters, Main Course, Breads, Beverages, Desserts).
- Use dynamic filters for **Veg / Non-Veg** dishes.
- Select portion sizes and cooking variants (e.g. *Half / Full*, *Butter / Plain / Garlic*).
- Tap **+ Add** to assemble your cart.

### 3. Booking Bespoke Himalayan Experiences
Guests can book verified resort experiences directly from the **Experiences** tab:
- **Iconic Bird Cage Cabana Dining**: Private fairy-lit wrought-iron pavilion on the lawn with a 4-course candlelight dinner.
- **Evening Pine Bonfire & Live Sigri BBQ**: Crackling timber bonfire pit with live grilled skewers and mountain music.
- **PlayStation 5 Alpine Gaming Lounge**: Private gaming pod with 4K display and dual DualSense controllers.
- **Pine Canopy Lawn Camping**: Luxury waterproof dome tent setup on the resort lawn.
- **Guided Mountain Nature Trek**: Escorted morning pine trail walk with scenic valley photography.
- **Himalayan Waterfall Picnic Excursion**: Chauffeured 3-hour trip to secluded natural mountain springs.

### 4. Live Order Tracking
- Once an order is placed, guests are redirected to the **Live Order Tracker**.
- Watch real-time stage updates powered by WebSockets:
  1. `📝 Order Received`
  2. `👍 Confirmed`
  3. `🍳 Preparing` (Chef actively cooking)
  4. `🛎️ Ready!` (On its way to table or room)
  5. `✅ Served` (Delivered)

### 5. Printing Official Food Bill & GST Tax Invoice
- On the tracker page or from the **My Orders** page, tap **"🧾 View / Print Official Bill (80mm / PDF)"**.
- Displays the official 80mm receipt with legal entity details, itemized lines, 5% GST (2.5% CGST + 2.5% SGST), and payment status.
- Tap **Print Tax Invoice** to send directly to an 80mm thermal receipt printer or save as a PDF.

---

## 👨‍🍳 Model 2: Kitchen Display System / KDS (Chef & Staff Guide)

The Kitchen Display System replaces paper chaos with a digital production board designed for rugged, fast-paced kitchen environments.

### 1. Staff Sign-In & Bilingual Interface
1. Open the Kitchen KDS URL.
2. Select your staff profile (e.g. `Kundan Chef`, `Deepak`, `Chef Aakash`) and enter the 4-digit PIN: **`1234`**.
3. **Language Toggle**: Tap **`EN / हिंदी`** in the top navigation bar to switch between English and Hindi:
   - Statuses adapt instantly: *New (नया ऑर्डर)*, *Preparing (तैयार हो रहा है)*, *Ready (तैयार)*, *Served (परोसा गया)*.

### 2. Managing Cooking Tickets
- **Incoming Audio Chime**: A pleasant kitchen chime plays automatically whenever a new order arrives over WebSockets.
- **Order Cards**:
  - Distinct badges for `🍽️ WALK-IN TABLE T-XX` vs `🛎️ ROOM SERVICE (SUITE XXX)`.
  - Elapsed timer showing exact minutes since order creation.
  - Special chef instructions (e.g. *Less spicy, no onions, extra napkins*).
- **1-Tap Stage Advancement**:
  - Tap **"Start Prep"** to move into the preparing queue.
  - Tap **"Mark Ready"** when food is plated.
  - Tap **"Mark Served"** when delivered by the runner.

### 3. Dual-Mode 80mm Thermal Receipt Engine
Click the **Printer Icon** on any order card to open the **Print Ticket Modal**:
- **Tab 1: 👨‍🍳 Kitchen KOT (रसोई पर्ची)**:
  - Formatted for cooks: high-contrast 80mm slip with bold KOT number, large table/room banner, quantity badges (`[ 2 ]`), chef instructions, and **strictly zero prices**.
- **Tab 2: 🧾 Customer Tax Invoice (ग्राहक बिल)**:
  - Formatted for the guest: includes official Shivalaya Resorts header, **GSTIN `05AAACS1234F1Z8`**, **FSSAI `12623005000123`**, itemized rates, 5% GST, net payable, amount in words, and payment status.
- Tap **Print** to instantly output via standard 80mm thermal receipt roll.

### 4. Stock & Inventory Ledger
- Switch to the **Stock Ledger** tab to monitor real-time stock levels of core kitchen items (*Chicken, Mutton, Paneer, Rice, Tomatoes, Onions, Milk, Spices*).
- Log **Stock Inward** when fresh provisions arrive.
- Log **Daily Consumption** to track usage and avoid stockouts.

### 5. Historical Completed & Cancelled Logs
- View past fulfilled orders with search by Order Number, Guest Name, or Room/Table.
- Clean production empty state with zero mock data.

---

## 🛎️ Model 3: Receptionist & Owner Desk (Management Guide)

The Reception & Front Desk application provides total operational control and financial clarity.

### 1. Front Desk Dashboard & Order Queue
- Live overview of all restaurant orders and activity bookings.
- Real-time notification bell with audio chime for incoming requests.
- Filter by dining type: All, Dine-In Tables, Room Service, or Takeaway.

### 2. Walk-In Diner Settlement (Cash / UPI / Card)
- Outside diners who dine at Panache Restaurant have their orders flagged as **Pending Settlement**.
- When the guest is ready to pay:
  1. Click **Settle Bill** on the table card.
  2. Select payment method: **Cash**, **UPI / QR Code**, or **Debit / Credit Card**.
  3. Confirm settlement. The table is automatically released for the next guests, and the revenue is logged under Restaurant Walk-In Sales.

### 3. In-House Guest Folio Management
- In-house residents have their restaurant and activity charges automatically routed to their **Room Folio**.
- View complete running balances for each suite (`Room 101`, `204`, etc.).
- Settle entire multi-day folios at checkout with 1 click.

### 4. Owner Revenue & Performance Analytics
- Dedicated analytics separating **Walk-In Restaurant Revenue** from **Resident Room Folios**.
- Real-time metrics: Total Revenue, Average Order Value, Top-Selling Dishes, and Peak Dining Hours.
- Export itemized sales records as CSV for accounting.

---

## 🖨️ Hardware & Printer Setup Guide (80mm ESC/POS)

Both the Kitchen KDS and Guest Portal support direct printing to any standard 80mm thermal receipt printer (Epson, TVS, NGX, POSIFLEX, HOIN, or generic Bluetooth/USB thermal printers).

### Setting Up Thermal Printing in Chrome / Edge:
1. Connect your 80mm thermal receipt printer via USB, Bluetooth, or Wi-Fi network.
2. In the app, click **Print KOT** or **Print Tax Invoice**.
3. In the browser print dialog:
   - **Destination**: Select your 80mm Thermal Receipt Printer.
   - **Paper Size**: Select **80mm Roll** or **3 1/8" Roll**.
   - **Margins**: Set to **None** (or **Minimum**).
   - **Options**: Uncheck *Headers and footers* (this prevents browser URLs and dates from appearing on the receipt).
   - **Background Graphics**: Checked.
4. Click **Print**. The system prints exclusively the receipt slip without printing any webpage dashboard controls.

---

## 📲 Mobile Installation (PWA / Home Screen App)

Staff and guests can install the portals as native full-screen apps without needing to download anything from app stores:

### On Apple iOS (iPhone / iPad):
1. Open the portal URL in **Safari**.
2. Tap the **Share** button (box with an upward arrow) at the bottom.
3. Scroll down and tap **"Add to Home Screen"**.
4. Tap **Add**. An app icon will appear on the device home screen that opens full-screen without Safari browser address bars.

### On Android (Samsung, Xiaomi, Pixel, OnePlus):
1. Open the portal URL in **Chrome**.
2. Tap the **Three Dots (⋮)** menu in the upper right.
3. Tap **"Install App"** or **"Add to Home Screen"**.
4. Confirm **Install**. The portal launches like a native Android application.

---

## 🚀 Cloud Deployment Instructions (GitHub + Vercel)

### Step 1: Push Changes to GitHub
Run the following commands in the terminal:
```bash
git add -A
git commit -m "feat: production-ready 3-tier hospitality platform with 80mm thermal receipts and live Supabase realtime"
git push origin main
```

### Step 2: Vercel Project Setup (3 Applications)
Create **three separate projects** in your Vercel Dashboard from the same repository:

| Project Name | Root Directory | Framework Preset | Build Command | Output Directory |
| :--- | :--- | :--- | :--- | :--- |
| **`shivalaya-guest`** | `apps/guest-portal` | Vite | `pnpm build` | `dist` |
| **`shivalaya-kitchen`** | `apps/kitchen-panel` | Vite | `pnpm build` | `dist` |
| **`shivalaya-reception`**| `apps/resort-reception` | Vite | `pnpm build` | `dist` |

### Step 3: Environment Variables on Vercel
Add the following Environment Variables in **Settings -> Environment Variables** for **all three projects**:

| Variable Name | Value | Purpose |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | `https://your-supabase-project.supabase.co` | Hosted Supabase URL |
| `VITE_SUPABASE_ANON_KEY` | `your-anon-public-key` | Hosted Supabase Anon API Key |
| `VITE_RESORT_ID` | `00000000-0000-0000-0000-000000000001` | Shivalaya Resort UUID |

### Step 4: Client Distribution
Once deployed, send the three generated Vercel links to the resort owners:
1. 📱 **Guest Menu & Experiences**: `https://shivalaya-guest.vercel.app`
2. 👨‍🍳 **Kitchen Display (KDS)**: `https://shivalaya-kitchen.vercel.app` *(Staff PIN: 1234)*
3. 🛎️ **Reception & Owner Desk**: `https://shivalaya-reception.vercel.app`
