-- =============================================================
-- 015_open_kds_reception_rls.sql
-- Permissive RLS for local dev: all operational tables open
-- to anon + authenticated for owner-dashboard, kitchen-panel,
-- guest-portal, and reception apps.
-- =============================================================

-- ── 1. ORDERS ─────────────────────────────────────────────────
DROP POLICY IF EXISTS staff_read_orders ON orders;
DROP POLICY IF EXISTS staff_update_orders ON orders;
DROP POLICY IF EXISTS anon_insert_orders ON orders;
DROP POLICY IF EXISTS public_read_orders ON orders;
DROP POLICY IF EXISTS public_update_orders ON orders;
DROP POLICY IF EXISTS public_insert_orders ON orders;

CREATE POLICY public_read_orders ON orders
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY public_update_orders ON orders
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY public_insert_orders ON orders
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- ── 2. ORDER STATUS LOG ───────────────────────────────────────
ALTER TABLE IF EXISTS order_status_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS public_all_order_status_log ON order_status_log;
CREATE POLICY public_all_order_status_log ON order_status_log
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ── 3. RESTAURANT TABLES ─────────────────────────────────────
DROP POLICY IF EXISTS public_read_restaurant_tables ON restaurant_tables;
CREATE POLICY public_read_restaurant_tables ON restaurant_tables
  FOR SELECT TO anon, authenticated USING (true);

-- ── 4. ROOMS ──────────────────────────────────────────────────
DROP POLICY IF EXISTS anon_read_rooms ON rooms;
DROP POLICY IF EXISTS public_read_rooms ON rooms;
DROP POLICY IF EXISTS public_all_rooms ON rooms;
CREATE POLICY public_all_rooms ON rooms
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ── 5. RESORTS ────────────────────────────────────────────────
DROP POLICY IF EXISTS public_read_resorts ON resorts;
CREATE POLICY public_read_resorts ON resorts
  FOR SELECT TO anon, authenticated USING (true);

-- ── 6. STAFF ──────────────────────────────────────────────────
DROP POLICY IF EXISTS public_read_staff ON staff;
DROP POLICY IF EXISTS public_all_staff ON staff;
CREATE POLICY public_all_staff ON staff
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ── 7. GUESTS ─────────────────────────────────────────────────
DROP POLICY IF EXISTS public_all_guests ON guests;
CREATE POLICY public_all_guests ON guests
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ── 8. INVENTORY & STOCK ──────────────────────────────────────
DROP POLICY IF EXISTS inv_items_read ON inventory_items;
DROP POLICY IF EXISTS inv_items_owner_write ON inventory_items;
DROP POLICY IF EXISTS public_all_inventory_items ON inventory_items;
CREATE POLICY public_all_inventory_items ON inventory_items
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS inv_inward_read ON stock_inward;
DROP POLICY IF EXISTS inv_inward_write ON stock_inward;
DROP POLICY IF EXISTS public_all_stock_inward ON stock_inward;
CREATE POLICY public_all_stock_inward ON stock_inward
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS inv_consumption_read ON stock_consumption;
DROP POLICY IF EXISTS inv_consumption_write ON stock_consumption;
DROP POLICY IF EXISTS public_all_stock_consumption ON stock_consumption;
CREATE POLICY public_all_stock_consumption ON stock_consumption
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ── 9. ACTIVITIES & TIME SLOTS ────────────────────────────────
DROP POLICY IF EXISTS public_read_activities ON activities;
DROP POLICY IF EXISTS public_all_activities ON activities;
CREATE POLICY public_all_activities ON activities
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS public_read_activity_time_slots ON activity_time_slots;
DROP POLICY IF EXISTS public_all_activity_time_slots ON activity_time_slots;
CREATE POLICY public_all_activity_time_slots ON activity_time_slots
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS public_all_activity_bookings ON activity_bookings;
CREATE POLICY public_all_activity_bookings ON activity_bookings
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ── 10. MENU ──────────────────────────────────────────────────
DROP POLICY IF EXISTS anon_read_menu_categories ON menu_categories;
DROP POLICY IF EXISTS public_read_menu_categories ON menu_categories;
DROP POLICY IF EXISTS public_all_menu_categories ON menu_categories;
CREATE POLICY public_all_menu_categories ON menu_categories
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS anon_read_menu_items ON menu_items;
DROP POLICY IF EXISTS public_read_menu_items ON menu_items;
DROP POLICY IF EXISTS public_all_menu_items ON menu_items;
CREATE POLICY public_all_menu_items ON menu_items
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS public_all_menu_item_variants ON menu_item_variants;
ALTER TABLE IF EXISTS menu_item_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY public_all_menu_item_variants ON menu_item_variants
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ── 11. WHATSAPP LOG ──────────────────────────────────────────
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'whatsapp_log') THEN
    EXECUTE 'ALTER TABLE whatsapp_log ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS public_all_whatsapp_log ON whatsapp_log';
    EXECUTE 'CREATE POLICY public_all_whatsapp_log ON whatsapp_log FOR ALL TO anon, authenticated USING (true) WITH CHECK (true)';
  END IF;
END $$;

-- ── 12. GUEST SESSIONS ────────────────────────────────────────
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'guest_sessions') THEN
    EXECUTE 'DROP POLICY IF EXISTS public_all_guest_sessions ON guest_sessions';
    EXECUTE 'CREATE POLICY public_all_guest_sessions ON guest_sessions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true)';
  END IF;
END $$;
