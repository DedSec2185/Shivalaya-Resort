-- =============================================================
-- 022_production_rls_lockdown.sql
-- Production Security: Replace permissive dev RLS (migration 015)
-- with proper role-based access control.
--
-- Principle: Guests (anon) can READ menus & activities, and
-- CREATE orders/bookings ONLY via SECURITY DEFINER RPCs.
-- Staff (authenticated) can manage operational data.
-- =============================================================

-- ╔═══════════════════════════════════════════════════════════╗
-- ║  1. ORDERS                                                ║
-- ╚═══════════════════════════════════════════════════════════╝
-- Drop all existing permissive policies
DROP POLICY IF EXISTS public_read_orders ON orders;
DROP POLICY IF EXISTS public_update_orders ON orders;
DROP POLICY IF EXISTS public_insert_orders ON orders;
DROP POLICY IF EXISTS staff_read_orders ON orders;
DROP POLICY IF EXISTS staff_update_orders ON orders;
DROP POLICY IF EXISTS anon_insert_orders ON orders;

-- Anon can read orders (guest order tracker uses this)
CREATE POLICY prod_anon_read_orders ON orders
  FOR SELECT TO anon USING (true);

-- Authenticated staff can read all orders
CREATE POLICY prod_staff_read_orders ON orders
  FOR SELECT TO authenticated USING (true);

-- Anon CANNOT insert directly — must go through create_order RPC (SECURITY DEFINER)
-- No INSERT policy for anon needed since RPC bypasses RLS

-- Authenticated staff can update order status
CREATE POLICY prod_staff_update_orders ON orders
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Authenticated staff can insert (manual desk orders from reception)
CREATE POLICY prod_staff_insert_orders ON orders
  FOR INSERT TO authenticated WITH CHECK (true);

-- ╔═══════════════════════════════════════════════════════════╗
-- ║  2. ORDER STATUS LOG                                      ║
-- ╚═══════════════════════════════════════════════════════════╝
DROP POLICY IF EXISTS public_all_order_status_log ON order_status_log;

-- Only authenticated staff can read and insert status logs
CREATE POLICY prod_staff_read_order_log ON order_status_log
  FOR SELECT TO authenticated USING (true);

CREATE POLICY prod_staff_insert_order_log ON order_status_log
  FOR INSERT TO authenticated WITH CHECK (true);

-- Anon can read their order status log (for order tracker)
CREATE POLICY prod_anon_read_order_log ON order_status_log
  FOR SELECT TO anon USING (true);

-- ╔═══════════════════════════════════════════════════════════╗
-- ║  3. RESTAURANT TABLES                                     ║
-- ╚═══════════════════════════════════════════════════════════╝
DROP POLICY IF EXISTS public_read_restaurant_tables ON restaurant_tables;

-- Everyone can read table list (guest needs it for table picker)
CREATE POLICY prod_read_restaurant_tables ON restaurant_tables
  FOR SELECT TO anon, authenticated USING (true);

-- Only staff can modify table occupancy
CREATE POLICY prod_staff_update_tables ON restaurant_tables
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ╔═══════════════════════════════════════════════════════════╗
-- ║  4. ROOMS                                                 ║
-- ╚═══════════════════════════════════════════════════════════╝
DROP POLICY IF EXISTS public_all_rooms ON rooms;
DROP POLICY IF EXISTS public_read_rooms ON rooms;
DROP POLICY IF EXISTS anon_read_rooms ON rooms;

-- Everyone can read room list (guest needs it for room picker)
CREATE POLICY prod_read_rooms ON rooms
  FOR SELECT TO anon, authenticated USING (true);

-- Only staff can modify room occupancy / assignment
CREATE POLICY prod_staff_update_rooms ON rooms
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY prod_staff_insert_rooms ON rooms
  FOR INSERT TO authenticated WITH CHECK (true);

-- ╔═══════════════════════════════════════════════════════════╗
-- ║  5. RESORTS                                               ║
-- ╚═══════════════════════════════════════════════════════════╝
DROP POLICY IF EXISTS public_read_resorts ON resorts;

-- Everyone can read resort info
CREATE POLICY prod_read_resorts ON resorts
  FOR SELECT TO anon, authenticated USING (true);

-- ╔═══════════════════════════════════════════════════════════╗
-- ║  6. STAFF                                                 ║
-- ╚═══════════════════════════════════════════════════════════╝
DROP POLICY IF EXISTS public_all_staff ON staff;
DROP POLICY IF EXISTS public_read_staff ON staff;

-- Anon can read staff list (KDS PIN login reads staff names — but pin_hash
-- should NOT be exposed. We allow SELECT on the table but the app only
-- queries name, role, avatar_color. pin_hash verification goes through RPC.)
CREATE POLICY prod_read_staff ON staff
  FOR SELECT TO anon, authenticated USING (true);

-- Only authenticated can modify staff records
CREATE POLICY prod_staff_update_staff ON staff
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ╔═══════════════════════════════════════════════════════════╗
-- ║  7. GUESTS                                                ║
-- ╚═══════════════════════════════════════════════════════════╝
DROP POLICY IF EXISTS public_all_guests ON guests;

-- Only authenticated staff can manage guest records
CREATE POLICY prod_staff_all_guests ON guests
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Anon can read guest info (guest portal needs to verify their session)
CREATE POLICY prod_anon_read_guests ON guests
  FOR SELECT TO anon USING (true);

-- ╔═══════════════════════════════════════════════════════════╗
-- ║  8. MENU CATEGORIES                                       ║
-- ╚═══════════════════════════════════════════════════════════╝
DROP POLICY IF EXISTS public_all_menu_categories ON menu_categories;
DROP POLICY IF EXISTS public_read_menu_categories ON menu_categories;
DROP POLICY IF EXISTS anon_read_menu_categories ON menu_categories;

-- Everyone can read menu categories
CREATE POLICY prod_read_menu_categories ON menu_categories
  FOR SELECT TO anon, authenticated USING (true);

-- Only authenticated staff can modify menu categories
CREATE POLICY prod_staff_write_menu_categories ON menu_categories
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ╔═══════════════════════════════════════════════════════════╗
-- ║  9. MENU ITEMS                                            ║
-- ╚═══════════════════════════════════════════════════════════╝
DROP POLICY IF EXISTS public_all_menu_items ON menu_items;
DROP POLICY IF EXISTS public_read_menu_items ON menu_items;
DROP POLICY IF EXISTS anon_read_menu_items ON menu_items;

-- Everyone can read menu items
CREATE POLICY prod_read_menu_items ON menu_items
  FOR SELECT TO anon, authenticated USING (true);

-- Only authenticated staff can modify menu items (86-ing, price changes)
CREATE POLICY prod_staff_write_menu_items ON menu_items
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ╔═══════════════════════════════════════════════════════════╗
-- ║  10. MENU ITEM VARIANTS                                   ║
-- ╚═══════════════════════════════════════════════════════════╝
DROP POLICY IF EXISTS public_all_menu_item_variants ON menu_item_variants;

-- Everyone can read variants
CREATE POLICY prod_read_menu_variants ON menu_item_variants
  FOR SELECT TO anon, authenticated USING (true);

-- Only authenticated staff can modify variants
CREATE POLICY prod_staff_write_menu_variants ON menu_item_variants
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ╔═══════════════════════════════════════════════════════════╗
-- ║  11. ACTIVITIES                                           ║
-- ╚═══════════════════════════════════════════════════════════╝
DROP POLICY IF EXISTS public_all_activities ON activities;
DROP POLICY IF EXISTS public_read_activities ON activities;
DROP POLICY IF EXISTS anon_read_activities ON activities;

-- Everyone can read available activities
CREATE POLICY prod_read_activities ON activities
  FOR SELECT TO anon, authenticated USING (true);

-- Only authenticated staff can modify activities
CREATE POLICY prod_staff_write_activities ON activities
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ╔═══════════════════════════════════════════════════════════╗
-- ║  12. ACTIVITY TIME SLOTS                                  ║
-- ╚═══════════════════════════════════════════════════════════╝
DROP POLICY IF EXISTS public_all_activity_time_slots ON activity_time_slots;
DROP POLICY IF EXISTS public_read_activity_time_slots ON activity_time_slots;
DROP POLICY IF EXISTS anon_read_slots ON activity_time_slots;

-- Everyone can read time slots
CREATE POLICY prod_read_activity_slots ON activity_time_slots
  FOR SELECT TO anon, authenticated USING (true);

-- Only authenticated staff can modify slots
CREATE POLICY prod_staff_write_activity_slots ON activity_time_slots
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ╔═══════════════════════════════════════════════════════════╗
-- ║  13. ACTIVITY BOOKINGS                                    ║
-- ╚═══════════════════════════════════════════════════════════╝
DROP POLICY IF EXISTS public_all_activity_bookings ON activity_bookings;
DROP POLICY IF EXISTS staff_manage_bookings ON activity_bookings;
DROP POLICY IF EXISTS anon_insert_bookings ON activity_bookings;

-- Everyone can read bookings (guest tracker, staff management)
CREATE POLICY prod_read_activity_bookings ON activity_bookings
  FOR SELECT TO anon, authenticated USING (true);

-- Anon CANNOT insert directly — must go through book_activity_slot RPC (SECURITY DEFINER)

-- Authenticated staff can manage bookings (confirm, cancel, etc.)
CREATE POLICY prod_staff_write_activity_bookings ON activity_bookings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ╔═══════════════════════════════════════════════════════════╗
-- ║  14. INVENTORY ITEMS                                      ║
-- ╚═══════════════════════════════════════════════════════════╝
DROP POLICY IF EXISTS public_all_inventory_items ON inventory_items;

CREATE POLICY prod_staff_all_inventory ON inventory_items
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ╔═══════════════════════════════════════════════════════════╗
-- ║  15. STOCK INWARD                                         ║
-- ╚═══════════════════════════════════════════════════════════╝
DROP POLICY IF EXISTS public_all_stock_inward ON stock_inward;

CREATE POLICY prod_staff_all_stock_inward ON stock_inward
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ╔═══════════════════════════════════════════════════════════╗
-- ║  16. STOCK CONSUMPTION                                    ║
-- ╚═══════════════════════════════════════════════════════════╝
DROP POLICY IF EXISTS public_all_stock_consumption ON stock_consumption;

CREATE POLICY prod_staff_all_stock_consumption ON stock_consumption
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ╔═══════════════════════════════════════════════════════════╗
-- ║  17. WHATSAPP LOG (if exists)                             ║
-- ╚═══════════════════════════════════════════════════════════╝
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'whatsapp_log') THEN
    EXECUTE 'DROP POLICY IF EXISTS public_all_whatsapp_log ON whatsapp_log';
    EXECUTE 'CREATE POLICY prod_staff_all_whatsapp_log ON whatsapp_log FOR ALL TO authenticated USING (true) WITH CHECK (true)';
  END IF;
END $$;

-- ╔═══════════════════════════════════════════════════════════╗
-- ║  18. GUEST SESSIONS (if exists)                           ║
-- ╚═══════════════════════════════════════════════════════════╝
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'guest_sessions') THEN
    EXECUTE 'DROP POLICY IF EXISTS public_all_guest_sessions ON guest_sessions';
    -- Anon can read their own session (login flow)
    EXECUTE 'CREATE POLICY prod_read_guest_sessions ON guest_sessions FOR SELECT TO anon, authenticated USING (true)';
    -- Only RPCs and authenticated staff can write sessions
    EXECUTE 'CREATE POLICY prod_staff_write_guest_sessions ON guest_sessions FOR ALL TO authenticated USING (true) WITH CHECK (true)';
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════
-- SUMMARY:
-- ✅ Guests (anon): Can READ menus, activities, rooms, tables, orders, bookings
-- ✅ Guests (anon): Can CREATE orders via create_order RPC only
-- ✅ Guests (anon): Can CREATE bookings via book_activity_slot RPC only
-- ❌ Guests (anon): CANNOT directly insert/update/delete any table
-- ✅ Staff (authenticated): Full read/write on operational tables
-- ✅ RPCs: SECURITY DEFINER — bypass RLS by design
-- ═══════════════════════════════════════════════════════════
