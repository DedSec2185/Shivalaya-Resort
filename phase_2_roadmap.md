# Phase 2 & 3 Architecture & Master Blueprint

This document serves as the technical master plan for Phase 2 (Backend Integration) and Phase 3 (Production Go-Live) of the Shivalaya Panache Restaurant Management Suite. It records all strategic decisions, deployment pipelines, database structures, and operational workflows.

## 1. Single Database Architecture (Supabase)
We use **one single Supabase Postgres database** — not three separate databases. All three apps are just different "windows" into the same tables.
- **Customer App**: Writes orders.
- **Front Desk App**: Reads orders and updates status.
- **Owner Dashboard**: Reads everything (reports, menus, folios) and edits menu items.

### Core Tables:
- `restaurants`
- `rooms` / `tables`
- `menu_items`
- `staff` (multi-profile)
- `orders`

*Why this avoids sync errors:* There's no "app A tells app B" logic. Every app talks directly to Supabase. Supabase's Realtime engine watches the `orders` table and pushes changes to whoever is subscribed. There's only one source of truth.

## 2. Real-Time Connection Mechanism
This uses **Supabase Realtime**, which is Postgres's native replication stream exposed over WebSockets.
- **Flow:** Customer places order → `INSERT` into `orders` table (via Supabase client SDK) → Postgres commits the row → Supabase Realtime detects the change → Pushes instantly (< 200ms) to Front Desk, Customer tracking page, and Owner Dashboard.
- Every app opens one WebSocket connection on load and just listens (push-based, no polling).

## 3. Domain, Subdomains, and Hosting
Since the resort already has a domain (e.g., `shivalayaresorts.com`), we just add subdomains that point to our Vercel-hosted apps:
1. **`order.shivalayaresorts.com`** → Customer Menu App (Mobile-first, QR Code linked)
2. **`staff.shivalayaresorts.com`** → Front Desk App (Desktop-first)
3. **`owner.shivalayaresorts.com`** → Owner Dashboard (Mobile-first, desktop-friendly)

**Remote Setup Process:**
- Deploy apps to Vercel (xxxx.vercel.app URLs).
- Ask the client to add 3 CNAME records in their domain registrar (GoDaddy/Namecheap) pointing to Vercel.
- Vercel auto-issues free SSL (https) once verified. No server management required.
- Supabase **CORS** settings must explicitly whitelist these three subdomains.

## 4. Remote Handover & Support
Because everything is cloud-hosted (Vercel + Supabase), the remote deployment and support burden is practically zero.
- **Receptionist Desktop Setup:** Open Chrome on the reception PC, go to `staff.shivalayaresorts.com`, log in with PIN. Optionally "Install as App" (PWA) so it opens like a native app. No local repository, files, or Node.js installation needed.
- **Onboarding:** One 20-30 min screen-share call (Zoom/Meet) to explain logins and workflows.
- **Ongoing Support:** Bugs are fixed via Vercel deployments (Frontend) or Supabase (Backend) directly from your laptop. Changes go live instantly for the client on refresh.

## 5. Staff Multi-Profile System
A single `staff` table manages both receptionists and owners.
```sql
staff (
  id UUID, restaurant_id UUID, 
  name TEXT, phone TEXT, email TEXT, 
  pin_hash TEXT, role TEXT, active BOOLEAN, created_at TIMESTAMP
)
```
- Profiles like "Reception 1" and "Owner - Mr. Sharma" are created with default PINs.
- Staff sees a profile picker (like Netflix), taps their name, and enters their PIN.
- Provides accountability: Every order status change logs `changed_by = staff.name`.

## 6. Room-Based Order History & Checkout (Guest Folio)
Room/Table numbers are **mandatory dropdowns** (not free text), populated from a `rooms` table.
```sql
orders (
  id, restaurant_id, room_number, -- MANDATORY
  service_type, -- room_service | dine_in | pickup
  guest_name, guest_phone, items JSONB, subtotal, total, status, created_at
)
```
- **Checkout Flow:** Owner/Reception searches by Room Number (e.g., '302'). The system runs a query `SELECT * FROM orders WHERE room_number = '302'` and calculates the grand total of all food ordered during their stay.
- **PMS Integration Options:** We can provide this exact total to their Property Management System via API endpoints, Direct DB views, or Manual CSV export.

## 7. Customer Order Tracking
- After placing an order, customers are redirected to `/order/{order_id}`.
- This is bookmarked in `localStorage` so they can return to it.
- This page opens a Supabase subscription scoped to that specific `order_id`.
- When the receptionist clicks "Confirm", the `UPDATE` is instantly pushed via WebSocket to the customer's phone, updating the visual timeline (Received → Confirmed → Preparing → Served).

## 8. Menu Management & Availability
- **Owner Edits:** CRUD operations on `menu_items` via Owner Dashboard Menu Manager. Changes reflect instantly on the customer app without a refresh.
- **Manual Toggles:** A boolean `is_available` column allows instant "Out of Stock" marking.
- **Time-Based Availability:** Database columns `available_from_time` and `available_until_time` determine when categories (e.g., Breakfast) appear on the Customer Menu.

## 9. Automated Owner Email Reports
- We use a transactional email service (Resend or SendGrid) wired into Supabase Edge Functions.
- Owner clicks "Email Me This Report", the Edge Function generates a PDF/HTML summary, and emails it to the owner's saved email address.
- Can be automated via a daily `pg_cron` job (e.g., daily summary at 11 PM).

## 10. Step-by-Step Production Go-Live (Phase 3)
1. **Supabase (30 min):** Create project, run SQL migrations (tables, indexes, RLS), seed 150 menu items, create staff profiles.
2. **Vercel (20 min):** Push code to GitHub, connect to Vercel, add `.env` variables, get 3 live URLs.
3. **Domain & DNS (15 min + propagation):** Client adds CNAME records, Vercel verifies SSL.
4. **Email Service (15 min):** Verify sending domain (e.g. `reports@youragency.com`) in Resend, wire Edge Function.
5. **Final Testing (1-2 hr):** Place test orders across live URLs, verify WebSocket real-time connections, test on mobile devices.
6. **Go Live:** Print QR codes for tables/rooms pointing to `order.shivalayaresorts.com`, staff logs in, owner gets access.
