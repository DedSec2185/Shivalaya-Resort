# Phase 2 Architecture & Roadmap Blueprint

This document serves as the technical master plan for Phase 2 of the Shivalaya Panache Restaurant Management Suite. It records all strategic decisions, deployment pipelines, and integration strategies discussed.

## 1. Production Deployment (Vercel + GitHub)
- **CI/CD Pipeline:** GitHub `main` branch is connected to Vercel. Running `git push` automatically triggers a production build.
- **Environment Variables:** Supabase credentials (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`) must be manually added to Vercel Settings > Environment Variables for all three apps to prevent "white screen" build failures.
- **Strict Linting:** Vercel builds will fail if there are unused variables or missing dependencies in `package.json`. Code must be clean before pushing.

## 2. Domain & Subdomain Strategy
The resort's primary domain (e.g., `shivalayapanache.com`) will be routed using subdomains for the 3 apps:
1. **`menu.shivalayapanache.com`** → Customer Menu (Used for QR codes on tables/rooms)
2. **`desk.shivalayapanache.com`** → Front Desk Dashboard (Receptionists)
3. **`admin.shivalayapanache.com`** → Owner's Ledger (Management)

*Security Note:* Supabase **CORS (Cross-Origin Resource Sharing)** settings must be updated to explicitly whitelist these three exact subdomains, otherwise database access will be blocked in production.

## 3. Database & Real-Time Sync (Supabase)
- **Real-Time WebSockets:** Supabase Realtime will be used to instantly push new orders from the Customer Menu to the Front Desk Kanban board without refreshing.
- **Menu Availability Toggles:** 
  - A boolean column `is_available` in the `menu_items` table.
  - Toggling it in the Owner Dashboard instantly pushes a WebSocket update to all active Customer Menu sessions to mark items as "Out of Stock".
- **Time-Based Menu Availability:**
  - Database columns `available_from_time` and `available_until_time` will dictate when categories (like Breakfast) appear.
  - The frontend hides the UI, and the backend explicitly rejects orders placed outside these hours to prevent stale-session ordering.

## 4. Property Management System (PMS) Integration
For checking out guests and calculating total hotel room bills, the Guest Folio (Room-wise food billing) will integrate with the resort's PMS via one of three methods:
1. **API Integration (Preferred):** Create a secure endpoint via Supabase Edge Functions. The resort's PMS pings our API for "Room 101" during checkout, and we return the total unpaid food balance.
2. **Direct DB View:** Create a secure, read-only PostgreSQL view for the custom PMS developers to query the food balance directly.
3. **Manual Export:** A CSV/Excel export button on the Owner's Ledger that generates a daily room billing report for manual import into legacy PMS software.
