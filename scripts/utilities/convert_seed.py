import re
import os

from pathlib import Path

def get_workspace_root():
    p = Path(__file__).resolve().parent
    while p != p.parent:
        if (p / 'package.json').exists():
            return p
        p = p.parent
    return Path.cwd()

WORKSPACE = get_workspace_root()
input_file = WORKSPACE / "supabase" / "seed.sql"
output_file = WORKSPACE / "supabase" / "seed_new.sql"

# Read the old seed file
with open(input_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Extract all menu item inserts using regex
# Format: ((SELECT id FROM restaurants WHERE slug = 'panache-shivalaya'), 'Category', 'Name', Price, veg, sort_order)
pattern = r"\(\(SELECT id FROM restaurants WHERE slug = 'panache-shivalaya'\),\s*'([^']+)',\s*'([^']+)',\s*(\d+),\s*(true|false),\s*(\d+)\)"
matches = re.findall(pattern, content)

categories = {}
for match in matches:
    cat, name, price, veg, sort_order = match
    if cat not in categories:
        categories[cat] = []
    categories[cat].append({
        'name': name.replace("'", "''"),
        'price': price,
        'veg': veg,
        'sort_order': sort_order
    })

sql = """-- Supabase Seed Data (V2)

-- 1. Resort
INSERT INTO resorts (id, name, location, contact_email, contact_phone)
VALUES ('00000000-0000-0000-0000-000000000001', 'Shivalaya Resort', 'Uttarakhand', 'info@shivalaya.com', '+910000000000')
ON CONFLICT DO NOTHING;

-- 2. Rooms
INSERT INTO rooms (resort_id, room_number, floor) VALUES
"""
rooms = []
for floor in [1, 2, 3]:
    for r in range(1, 6):
        rooms.append(f"  ('00000000-0000-0000-0000-000000000001', '{floor}0{r}', {floor})")
sql += ",\n".join(rooms) + "\nON CONFLICT DO NOTHING;\n\n"

sql += "-- 3. Restaurant Tables\nINSERT INTO restaurant_tables (resort_id, table_number, capacity) VALUES\n"
tables = []
for t in range(1, 11):
    tables.append(f"  ('00000000-0000-0000-0000-000000000001', 'T{t}', 4)")
sql += ",\n".join(tables) + "\nON CONFLICT DO NOTHING;\n\n"

sql += "-- 4. Staff (Default PINs)\n"
sql += "INSERT INTO staff (resort_id, supabase_user_id, name, role, pin_hash, is_active) VALUES\n"
sql += "  ('00000000-0000-0000-0000-000000000001', gen_random_uuid(), 'Reception Desk', 'admin', crypt('1234', gen_salt('bf')), true),\n"
sql += "  ('00000000-0000-0000-0000-000000000001', gen_random_uuid(), 'Resort Owner', 'admin', crypt('9999', gen_salt('bf')), true)\n"
sql += "ON CONFLICT DO NOTHING;\n\n"

sql += "-- 5. Menu Categories & Items\n"

cat_id = 1
for cat, items in categories.items():
    cat_uuid = f"10000000-0000-0000-0000-0000000000{cat_id:02x}"
    sql += f"INSERT INTO menu_categories (id, resort_id, name, sort_order) VALUES ('{cat_uuid}', '00000000-0000-0000-0000-000000000001', '{cat}', {cat_id}) ON CONFLICT DO NOTHING;\n"
    
    sql += f"INSERT INTO menu_items (resort_id, category_id, name, base_price, is_vegetarian, sort_order) VALUES\n"
    item_sqls = []
    for i, item in enumerate(items):
        item_sqls.append(f"  ('00000000-0000-0000-0000-000000000001', '{cat_uuid}', '{item['name']}', {item['price']}, {item['veg']}, {item['sort_order']})")
    
    sql += ",\n".join(item_sqls) + "\nON CONFLICT DO NOTHING;\n\n"
    cat_id += 1

sql += """-- 6. Activities & Time Slots
INSERT INTO activities (id, resort_id, name, description, pricing_type, price_per_person, price_per_setup, price_per_session, max_capacity_per_slot) VALUES
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Spa Massage', 'Relaxing full body massage', 'per_person', 2500, NULL, NULL, 2),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Private Bonfire', 'Cozy private bonfire setup with snacks', 'per_setup', NULL, 1500, NULL, 10),
  ('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Yoga Session', 'Morning guided yoga session', 'per_session', NULL, NULL, 500, 20)
ON CONFLICT DO NOTHING;

INSERT INTO activity_time_slots (activity_id, label, start_time, end_time) VALUES
  -- Spa (10 AM to 6 PM every 2 hours)
  ('20000000-0000-0000-0000-000000000001', '10:00 AM Slot', '10:00:00', '11:30:00'),
  ('20000000-0000-0000-0000-000000000001', '12:00 PM Slot', '12:00:00', '13:30:00'),
  ('20000000-0000-0000-0000-000000000001', '02:00 PM Slot', '14:00:00', '15:30:00'),
  ('20000000-0000-0000-0000-000000000001', '04:00 PM Slot', '16:00:00', '17:30:00'),
  ('20000000-0000-0000-0000-000000000001', '06:00 PM Slot', '18:00:00', '19:30:00'),

  -- Private Bonfire (7 PM and 9 PM)
  ('20000000-0000-0000-0000-000000000002', '7:00 PM Bonfire', '19:00:00', '21:00:00'),
  ('20000000-0000-0000-0000-000000000002', '9:00 PM Bonfire', '21:00:00', '23:00:00'),

  -- Yoga Session (7 AM)
  ('20000000-0000-0000-0000-000000000003', 'Morning Yoga', '07:00:00', '08:00:00')
ON CONFLICT DO NOTHING;
"""

with open(output_file, 'w', encoding='utf-8') as f:
    f.write(sql)
print("Generated seed_new.sql successfully.")
