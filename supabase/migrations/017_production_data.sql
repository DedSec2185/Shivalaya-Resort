-- Migration 017: Shivalaya Resorts Official Production Inventory & Staff Setup
-- Configured from official client questionnaire responses:
-- • 28 Total Rooms (Deluxe 4, Executive 13, Premium 4, Luxury Suite 3, Deodar Family Suite 1, Villa 3)
-- • 12 Restaurant Tables (T-01 to T-12)
-- • Real Staff: Kundan Chef, Deepak, Neha, Himanshu, Sujit, Varun, Bilam Pandey, Owner
-- • Activity Capacity: 50 per slot

-- 1. Ensure resort exists
INSERT INTO resorts (id, name, slug, timezone)
VALUES ('00000000-0000-0000-0000-000000000001', 'Shivalaya Resort', 'shivalaya-resorts', 'Asia/Kolkata')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, timezone = EXCLUDED.timezone;

-- 2. Upsert Official 28 Rooms
INSERT INTO rooms (resort_id, room_number, room_type, floor, has_balcony, sort_order) VALUES
-- Deluxe Rooms (4)
('00000000-0000-0000-0000-000000000001', '101', 'Deluxe Room', 1, true, 1),
('00000000-0000-0000-0000-000000000001', '102', 'Deluxe Room', 1, true, 2),
('00000000-0000-0000-0000-000000000001', '103', 'Deluxe Room', 1, true, 3),
('00000000-0000-0000-0000-000000000001', '104', 'Deluxe Room', 1, true, 4),

-- Executive Rooms (13)
('00000000-0000-0000-0000-000000000001', '201', 'Executive Room', 2, true, 5),
('00000000-0000-0000-0000-000000000001', '202', 'Executive Room', 2, true, 6),
('00000000-0000-0000-0000-000000000001', '203', 'Executive Room', 2, true, 7),
('00000000-0000-0000-0000-000000000001', '204', 'Executive Room', 2, true, 8),
('00000000-0000-0000-0000-000000000001', '205', 'Executive Room', 2, true, 9),
('00000000-0000-0000-0000-000000000001', '206', 'Executive Room', 2, true, 10),
('00000000-0000-0000-0000-000000000001', '207', 'Executive Room', 2, true, 11),
('00000000-0000-0000-0000-000000000001', '208', 'Executive Room', 2, true, 12),
('00000000-0000-0000-0000-000000000001', '209', 'Executive Room', 2, true, 13),
('00000000-0000-0000-0000-000000000001', '210', 'Executive Room', 2, true, 14),
('00000000-0000-0000-0000-000000000001', '211', 'Executive Room', 2, true, 15),
('00000000-0000-0000-0000-000000000001', '212', 'Executive Room', 2, true, 16),
('00000000-0000-0000-0000-000000000001', '213', 'Executive Room', 2, true, 17),

-- Premium Rooms (4)
('00000000-0000-0000-0000-000000000001', '301', 'Premium Room', 3, true, 18),
('00000000-0000-0000-0000-000000000001', '302', 'Premium Room', 3, true, 19),
('00000000-0000-0000-0000-000000000001', '303', 'Premium Room', 3, true, 20),
('00000000-0000-0000-0000-000000000001', '304', 'Premium Room', 3, true, 21),

-- Luxury Suites (3)
('00000000-0000-0000-0000-000000000001', 'Suite 401', 'Luxury Suite', 4, true, 22),
('00000000-0000-0000-0000-000000000001', 'Suite 402', 'Luxury Suite', 4, true, 23),
('00000000-0000-0000-0000-000000000001', 'Suite 403', 'Luxury Suite', 4, true, 24),

-- Deodar Family Suite (1)
('00000000-0000-0000-0000-000000000001', 'Deodar Suite 501', 'Deodar Family Suite', 5, true, 25),

-- Villa 3 Rooms (3)
('00000000-0000-0000-0000-000000000001', 'Villa Room 1', 'Villa Room', 1, true, 26),
('00000000-0000-0000-0000-000000000001', 'Villa Room 2', 'Villa Room', 1, true, 27),
('00000000-0000-0000-0000-000000000001', 'Villa Room 3', 'Villa Room', 1, true, 28)
ON CONFLICT (resort_id, room_number) DO UPDATE SET 
  room_type = EXCLUDED.room_type,
  floor = EXCLUDED.floor,
  has_balcony = EXCLUDED.has_balcony,
  sort_order = EXCLUDED.sort_order;

-- 3. Upsert Official 12 Restaurant Tables
INSERT INTO restaurant_tables (resort_id, table_number, capacity) VALUES
('00000000-0000-0000-0000-000000000001', 'T-01', 4),
('00000000-0000-0000-0000-000000000001', 'T-02', 4),
('00000000-0000-0000-0000-000000000001', 'T-03', 4),
('00000000-0000-0000-0000-000000000001', 'T-04', 4),
('00000000-0000-0000-0000-000000000001', 'T-05', 4),
('00000000-0000-0000-0000-000000000001', 'T-06', 4),
('00000000-0000-0000-0000-000000000001', 'T-07', 4),
('00000000-0000-0000-0000-000000000001', 'T-08', 4),
('00000000-0000-0000-0000-000000000001', 'T-09', 4),
('00000000-0000-0000-0000-000000000001', 'T-10', 4),
('00000000-0000-0000-0000-000000000001', 'T-11', 4),
('00000000-0000-0000-0000-000000000001', 'T-12', 4)
ON CONFLICT (resort_id, table_number) DO UPDATE SET capacity = EXCLUDED.capacity;

-- 4. Upsert Official Staff with 4-Digit PINs
-- Kitchen & Service Staff
INSERT INTO staff (resort_id, name, pin_hash, role, avatar_color) VALUES
('00000000-0000-0000-0000-000000000001', 'Kundan Chef', crypt('1101', gen_salt('bf')), 'kitchen', '#AD8A3F'),
('00000000-0000-0000-0000-000000000001', 'Deepak', crypt('1102', gen_salt('bf')), 'kitchen', '#2C4A22'),
('00000000-0000-0000-0000-000000000001', 'Neha', crypt('1103', gen_salt('bf')), 'kitchen', '#4A2010'),
('00000000-0000-0000-0000-000000000001', 'Himanshu', crypt('1104', gen_salt('bf')), 'kitchen', '#1A3B1A'),
('00000000-0000-0000-0000-000000000001', 'Sujit', crypt('1201', gen_salt('bf')), 'kitchen', '#0C3B5E'),
('00000000-0000-0000-0000-000000000001', 'Varun', crypt('1202', gen_salt('bf')), 'kitchen', '#3A1A4A'),
-- Reception & Front Desk
('00000000-0000-0000-0000-000000000001', 'Bilam Pandey', crypt('1234', gen_salt('bf')), 'receptionist', '#2C6E3B'),
-- Management / Owner
('00000000-0000-0000-0000-000000000001', 'Resort Owner', crypt('9999', gen_salt('bf')), 'owner', '#142510')
ON CONFLICT DO NOTHING;

-- 5. Update Activity Capacity to 50 per Slot
UPDATE activities SET max_capacity_per_slot = 50;
UPDATE activity_time_slots SET max_capacity_override = 50;

-- 6. RPC Function for PIN Verification (Direct PIN Entry)
CREATE OR REPLACE FUNCTION verify_staff_pin_any(p_pin TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  role TEXT,
  resort_id UUID
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT s.id, s.name, s.role, s.resort_id
  FROM staff s
  WHERE s.is_active = TRUE
    AND s.pin_hash = crypt(p_pin, s.pin_hash);
END;
$$;

