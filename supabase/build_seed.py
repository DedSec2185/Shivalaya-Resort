import os

resort_id = '00000000-0000-0000-0000-000000000001'

seed_content = f"""-- Shivalaya Resorts — Seed Data
-- Run after migrations. Default PINs: Reception 1234, Owner 9999, Chef 5555

-- 1. Resort
INSERT INTO resorts (id, name, slug, timezone)
VALUES ('{resort_id}', 'Shivalaya Resort', 'shivalaya-resorts', 'Asia/Kolkata')
ON CONFLICT DO NOTHING;

-- 2. Rooms
INSERT INTO rooms (resort_id, room_number, floor, has_balcony, sort_order) VALUES
('{resort_id}', '101', 1, false, 1),
('{resort_id}', '102', 1, false, 2),
('{resort_id}', '103', 1, false, 3),
('{resort_id}', '104', 1, true, 4),
('{resort_id}', '105', 1, true, 5),
('{resort_id}', '201', 2, false, 6),
('{resort_id}', '202', 2, false, 7),
('{resort_id}', '203', 2, false, 8),
('{resort_id}', '204', 2, true, 9),
('{resort_id}', '205', 2, true, 10),
('{resort_id}', '301', 3, false, 11),
('{resort_id}', '302', 3, false, 12),
('{resort_id}', '303', 3, false, 13),
('{resort_id}', '304', 3, true, 14),
('{resort_id}', '305', 3, true, 15)
ON CONFLICT DO NOTHING;

-- 3. Restaurant Tables
INSERT INTO restaurant_tables (resort_id, table_number) VALUES
('{resort_id}', 'T1'),
('{resort_id}', 'T2'),
('{resort_id}', 'T3'),
('{resort_id}', 'T4'),
('{resort_id}', 'T5'),
('{resort_id}', 'T6'),
('{resort_id}', 'T7'),
('{resort_id}', 'T8'),
('{resort_id}', 'T9'),
('{resort_id}', 'T10')
ON CONFLICT DO NOTHING;

-- 4. Staff
INSERT INTO staff (resort_id, name, pin_hash, role) VALUES
('{resort_id}', 'Reception Desk', crypt('1234', gen_salt('bf')), 'receptionist'),
('{resort_id}', 'Resort Owner', crypt('9999', gen_salt('bf')), 'owner'),
('{resort_id}', 'Head Chef', crypt('5555', gen_salt('bf')), 'chef')
ON CONFLICT DO NOTHING;

-- 5. Menu Categories
INSERT INTO menu_categories (id, resort_id, name, sort_order) VALUES
('10000000-0000-0000-0000-000000000001', '{resort_id}', 'Breakfast', 1),
('10000000-0000-0000-0000-000000000002', '{resort_id}', 'Egg to Order', 2),
('10000000-0000-0000-0000-000000000003', '{resort_id}', 'Starters – Veg', 3),
('10000000-0000-0000-0000-000000000004', '{resort_id}', 'Starters – Non-Veg', 4),
('10000000-0000-0000-0000-000000000005', '{resort_id}', 'Soup', 5),
('10000000-0000-0000-0000-000000000006', '{resort_id}', 'Salad', 6),
('10000000-0000-0000-0000-000000000007', '{resort_id}', 'Indian Main – Paneer', 7),
('10000000-0000-0000-0000-000000000008', '{resort_id}', 'Seasonal Vegetable', 8),
('10000000-0000-0000-0000-000000000009', '{resort_id}', 'Indian Main – Chicken', 9),
('10000000-0000-0000-0000-000000000010', '{resort_id}', 'Choice of Mutton', 10),
('10000000-0000-0000-0000-000000000011', '{resort_id}', 'Indian Main – Dal', 11),
('10000000-0000-0000-0000-000000000012', '{resort_id}', 'Choices of Vegetable', 12),
('10000000-0000-0000-0000-000000000013', '{resort_id}', 'Panache Platters', 13),
('10000000-0000-0000-0000-000000000014', '{resort_id}', 'Indian Bread', 14),
('10000000-0000-0000-0000-000000000015', '{resort_id}', 'Rice', 15),
('10000000-0000-0000-0000-000000000016', '{resort_id}', 'Italian', 16),
('10000000-0000-0000-0000-000000000017', '{resort_id}', 'Kumaoni (Pahadi)', 17),
('10000000-0000-0000-0000-000000000018', '{resort_id}', 'Dessert', 18),
('10000000-0000-0000-0000-000000000019', '{resort_id}', 'Sandwich', 19),
('10000000-0000-0000-0000-000000000020', '{resort_id}', 'Sides', 20),
('10000000-0000-0000-0000-000000000021', '{resort_id}', 'Beverages', 21),
('10000000-0000-0000-0000-000000000022', '{resort_id}', 'Mocktail Zone', 22),
('10000000-0000-0000-0000-000000000023', '{resort_id}', 'Momos', 23)
ON CONFLICT DO NOTHING;

-- 6. Menu Items
"""

with open('c:/Users/abhay/Desktop/Shivalaya Panache Menu/supabase/gen_menu.sql', 'r', encoding='utf-8') as f:
    menu_items_sql = f.read()

seed_content += menu_items_sql + "\n"

seed_content += f"""
-- 7. Activities
INSERT INTO activities (id, resort_id, name, description, pricing_type, price_per_person, price_per_setup, price_per_session) VALUES
('20000000-0000-0000-0000-000000000001', '{resort_id}', 'Spa Massage', 'Relaxing spa massage', 'per_person', 2500, NULL, NULL),
('20000000-0000-0000-0000-000000000002', '{resort_id}', 'Private Bonfire', 'Cozy private bonfire setup', 'per_setup', NULL, 1500, NULL),
('20000000-0000-0000-0000-000000000003', '{resort_id}', 'Yoga Session', 'Morning yoga session', 'per_session', NULL, NULL, 500),
('20000000-0000-0000-0000-000000000004', '{resort_id}', 'Guided Mountain Trek', 'Guided trek through the mountains', 'per_person', 1200, NULL, NULL)
ON CONFLICT DO NOTHING;

-- 8. Activity Time Slots
INSERT INTO activity_time_slots (activity_id, label, start_time, end_time) VALUES
('20000000-0000-0000-0000-000000000001', 'Morning Slot 1', '09:00:00', '10:00:00'),
('20000000-0000-0000-0000-000000000001', 'Morning Slot 2', '10:00:00', '11:00:00'),
('20000000-0000-0000-0000-000000000002', 'Evening Slot', '18:00:00', '22:00:00'),
('20000000-0000-0000-0000-000000000003', 'Morning Yoga', '06:00:00', '07:30:00'),
('20000000-0000-0000-0000-000000000004', 'Early Trek', '06:30:00', '10:30:00')
ON CONFLICT DO NOTHING;

-- 9. Inventory Items
INSERT INTO inventory_items (resort_id, name, category, unit, low_stock_alert_threshold) VALUES
('{resort_id}', 'Rice', 'Grains', 'kg', 10),
('{resort_id}', 'Oil', 'Pantry', 'liters', 5),
('{resort_id}', 'Paneer', 'Dairy', 'kg', 2),
('{resort_id}', 'Chicken', 'Meat', 'kg', 5),
('{resort_id}', 'Mutton', 'Meat', 'kg', 3),
('{resort_id}', 'Onions', 'Vegetables', 'kg', 10),
('{resort_id}', 'Tomatoes', 'Vegetables', 'kg', 10),
('{resort_id}', 'Potatoes', 'Vegetables', 'kg', 10),
('{resort_id}', 'Spices', 'Pantry', 'kg', 1),
('{resort_id}', 'Flour', 'Grains', 'kg', 10),
('{resort_id}', 'Butter', 'Dairy', 'kg', 2),
('{resort_id}', 'Milk', 'Dairy', 'liters', 5),
('{resort_id}', 'Eggs', 'Dairy', 'pcs', 30),
('{resort_id}', 'Vegetables', 'Vegetables', 'kg', 5),
('{resort_id}', 'Sugar', 'Pantry', 'kg', 5),
('{resort_id}', 'Salt', 'Pantry', 'kg', 5)
ON CONFLICT DO NOTHING;
"""

with open('c:/Users/abhay/Desktop/Shivalaya Panache Menu/supabase/seed.sql', 'w', encoding='utf-8') as f:
    f.write(seed_content)

print("Seed file updated.")
