-- Enable RLS on all tables
ALTER TABLE resorts             ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms               ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_tables   ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff               ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests              ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders              ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories     ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items          ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities          ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_bookings   ENABLE ROW LEVEL SECURITY;

-- ── MENU: guests (anon) can read available items and categories
CREATE POLICY anon_read_menu_categories ON menu_categories
  FOR SELECT TO anon USING(is_available = true);

CREATE POLICY anon_read_menu_items ON menu_items
  FOR SELECT TO anon USING(is_available = true);

CREATE POLICY anon_read_variants ON menu_item_variants
  FOR SELECT TO anon USING(true);

-- ── ORDERS: anon can insert; read own via RPC (RPC uses service role)
CREATE POLICY anon_insert_orders ON orders
  FOR INSERT TO anon WITH CHECK(true);

-- Authenticated staff: read all orders for their resort
CREATE POLICY staff_read_orders ON orders
  FOR SELECT TO authenticated
  USING(resort_id = (SELECT resort_id FROM staff
                      WHERE supabase_user_id = auth.uid()));

CREATE POLICY staff_update_orders ON orders
  FOR UPDATE TO authenticated
  USING(resort_id = (SELECT resort_id FROM staff
                      WHERE supabase_user_id = auth.uid()));

-- ── ACTIVITIES: anon can read available; authenticated can manage
CREATE POLICY anon_read_activities ON activities
  FOR SELECT TO anon USING(is_available = true);

CREATE POLICY anon_read_slots ON activity_time_slots
  FOR SELECT TO anon USING(is_active = true);

-- Anon can insert bookings (book_activity_slot RPC validates)
CREATE POLICY anon_insert_bookings ON activity_bookings
  FOR INSERT TO anon WITH CHECK(true);

-- Staff can read + update bookings
CREATE POLICY staff_manage_bookings ON activity_bookings
  FOR ALL TO authenticated USING(true);

-- ── ROOMS: anon can read (for room picker dropdown)
CREATE POLICY anon_read_rooms ON rooms
  FOR SELECT TO anon USING(true);
