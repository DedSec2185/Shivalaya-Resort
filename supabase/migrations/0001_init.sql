-- Panache Ordering System — Initial Schema

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enums
CREATE TYPE service_type AS ENUM ('room_service', 'dine_in', 'pickup');
CREATE TYPE order_status AS ENUM ('new', 'confirmed', 'preparing', 'ready', 'served', 'cancelled');
CREATE TYPE staff_role AS ENUM ('receptionist', 'owner');

-- Restaurants
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Menu items
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  section TEXT NOT NULL,
  name TEXT NOT NULL,
  price INTEGER NOT NULL CHECK (price >= 0),
  veg BOOLEAN NOT NULL DEFAULT true,
  available BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_menu_items_restaurant ON menu_items(restaurant_id);
CREATE INDEX idx_menu_items_section ON menu_items(restaurant_id, section, sort_order);

-- Staff
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  pin_hash TEXT NOT NULL,
  role staff_role NOT NULL DEFAULT 'receptionist',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_staff_restaurant ON staff(restaurant_id);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  service_type service_type NOT NULL,
  room_number TEXT,
  guest_name TEXT NOT NULL,
  guest_phone TEXT NOT NULL,
  note TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total INTEGER NOT NULL CHECK (total >= 0),
  status order_status NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX idx_orders_status ON orders(restaurant_id, status);
CREATE INDEX idx_orders_created ON orders(restaurant_id, created_at DESC);

-- Order status audit log
CREATE TABLE order_status_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  changed_by TEXT NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_status_log_order ON order_status_log(order_id);

-- Auto-update updated_at on orders
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_orders_updated_at();

-- Log status changes automatically
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_status_log (order_id, status, changed_by)
    VALUES (NEW.id, NEW.status::text, COALESCE(current_setting('app.staff_name', true), 'system'));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_status_log
  AFTER UPDATE OF status ON orders
  FOR EACH ROW
  EXECUTE FUNCTION log_order_status_change();

-- PIN verification RPC (returns staff row without pin_hash)
CREATE OR REPLACE FUNCTION verify_staff_pin(
  p_pin TEXT,
  p_restaurant_slug TEXT DEFAULT 'panache-shivalaya',
  p_required_role staff_role DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  restaurant_id UUID,
  name TEXT,
  role staff_role,
  active BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT s.id, s.restaurant_id, s.name, s.role, s.active
  FROM staff s
  JOIN restaurants r ON r.id = s.restaurant_id
  WHERE r.slug = p_restaurant_slug
    AND s.active = true
    AND s.pin_hash = crypt(p_pin, s.pin_hash)
    AND (p_required_role IS NULL OR s.role = p_required_role);
END;
$$;

-- Row Level Security
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_log ENABLE ROW LEVEL SECURITY;

-- Public read for restaurants
CREATE POLICY "Public read restaurants" ON restaurants
  FOR SELECT USING (true);

-- Public read available menu items
CREATE POLICY "Public read available menu" ON menu_items
  FOR SELECT USING (available = true);

-- Guests can place orders (anon insert)
CREATE POLICY "Anyone can create orders" ON orders
  FOR INSERT WITH CHECK (true);

-- Staff apps use anon key — allow read/update orders (PIN auth is app-layer for MVP)
CREATE POLICY "Public read orders" ON orders
  FOR SELECT USING (true);

CREATE POLICY "Public update orders" ON orders
  FOR UPDATE USING (true);

-- Status log readable
CREATE POLICY "Public read status log" ON order_status_log
  FOR SELECT USING (true);

CREATE POLICY "Public insert status log" ON order_status_log
  FOR INSERT WITH CHECK (true);

-- Staff table: no direct access (use RPC)
CREATE POLICY "No direct staff access" ON staff
  FOR ALL USING (false);

-- Helper to set staff name for audit trail
CREATE OR REPLACE FUNCTION set_staff_context(p_name TEXT)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM set_config('app.staff_name', p_name, true);
END;
$$;

-- Update order with staff context
CREATE OR REPLACE FUNCTION update_order_status(
  p_order_id UUID,
  p_status order_status,
  p_staff_name TEXT
)
RETURNS orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result orders;
BEGIN
  PERFORM set_config('app.staff_name', p_staff_name, true);
  UPDATE orders SET status = p_status WHERE id = p_order_id RETURNING * INTO result;
  RETURN result;
END;
$$;
