-- ==============================================================================
-- SHIVALAYA RESORTS & PANACHE RESTAURANT — ALL-IN-ONE DATABASE SETUP
-- ==============================================================================
-- Idempotent, single-run SQL script to initialize a brand new Supabase project.
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql).
-- 
-- Includes:
--   1. Extensions & Sequences
--   2. Core Tables (Resorts, Rooms, Tables, Staff, Guests, Sessions, Orders, etc.)
--   3. Views (staff_public, guest_folio, current_stock)
--   4. Stored Procedures / RPCs (create_order, direct_guest_login, check_in_guest, etc.)
--   5. Row-Level Security (RLS) policies configured for smooth client operation
--   6. Realtime WebSocket publications (orders, restaurant_tables, activity_bookings)
--   7. Full Seeds: 28 Rooms, 12 Tables, Staff PINs, 23 Categories, 150+ Menu Items,
--      Bespoke Experiences, Inventory, and an Active Guest in Room 204.
-- ==============================================================================

-- ── 1. EXTENSIONS & SEQUENCES ──────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SEQUENCE IF NOT EXISTS order_number_seq
  START 1 INCREMENT 1 MINVALUE 1 MAXVALUE 99999 CYCLE;

CREATE SEQUENCE IF NOT EXISTS booking_number_seq
  START 1 INCREMENT 1 MINVALUE 1 MAXVALUE 99999 CYCLE;


-- ── 2. CORE TABLES ─────────────────────────────────────────────

-- 2.1 RESORTS
CREATE TABLE IF NOT EXISTS resorts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  timezone    TEXT DEFAULT 'Asia/Kolkata',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 2.2 ROOMS (Circular reference with guests handled via ALTER TABLE below)
CREATE TABLE IF NOT EXISTS rooms (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resort_id         UUID NOT NULL REFERENCES resorts(id) ON DELETE CASCADE,
  room_number       TEXT NOT NULL,
  room_type         TEXT,
  floor             INTEGER,
  has_balcony       BOOLEAN DEFAULT FALSE,
  is_occupied       BOOLEAN DEFAULT FALSE,
  current_guest_id  UUID,
  sort_order        INTEGER DEFAULT 0,
  UNIQUE(resort_id, room_number)
);

-- 2.3 RESTAURANT DINING TABLES
CREATE TABLE IF NOT EXISTS restaurant_tables (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resort_id    UUID NOT NULL REFERENCES resorts(id) ON DELETE CASCADE,
  table_number TEXT NOT NULL,
  capacity     INTEGER DEFAULT 4,
  is_occupied  BOOLEAN DEFAULT FALSE,
  UNIQUE(resort_id, table_number)
);

-- 2.4 STAFF
CREATE TABLE IF NOT EXISTS staff (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resort_id        UUID NOT NULL REFERENCES resorts(id) ON DELETE CASCADE,
  supabase_user_id UUID,
  supabase_email   TEXT,
  name             TEXT NOT NULL,
  role             TEXT NOT NULL CHECK (role IN ('owner', 'receptionist', 'kitchen', 'chef')),
  pin_hash         TEXT,
  avatar_color     TEXT DEFAULT '#2C4A22',
  is_active        BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- 2.5 GUESTS
CREATE TABLE IF NOT EXISTS guests (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resort_id           UUID NOT NULL REFERENCES resorts(id),
  room_id             UUID REFERENCES rooms(id),
  guest_name          TEXT NOT NULL,
  guest_phone         TEXT NOT NULL,
  email               TEXT,
  number_of_adults    INTEGER DEFAULT 1,
  check_in_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_checkout   DATE,
  actual_checkout     TIMESTAMPTZ,
  status              TEXT DEFAULT 'checked_in' CHECK (status IN ('checked_in', 'checked_out')),
  notes               TEXT,
  checked_in_by       UUID REFERENCES staff(id),
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- Link rooms.current_guest_id FK safely
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_rooms_current_guest'
  ) THEN
    ALTER TABLE rooms
      ADD CONSTRAINT fk_rooms_current_guest
      FOREIGN KEY (current_guest_id) REFERENCES guests(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- 2.6 GUEST SESSIONS (URL & App session token locking)
CREATE TABLE IF NOT EXISTS guest_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token           TEXT UNIQUE NOT NULL,
  guest_id        UUID REFERENCES guests(id) ON DELETE CASCADE,
  room_id         UUID REFERENCES rooms(id) ON DELETE CASCADE,
  room_number     TEXT NOT NULL,
  guest_name      TEXT NOT NULL,
  guest_phone     TEXT,
  resort_id       UUID REFERENCES resorts(id) ON DELETE CASCADE,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at      TIMESTAMPTZ,
  deactivated_at  TIMESTAMPTZ
);

-- 2.7 OTP TABLE (Optional fallback for verification)
CREATE TABLE IF NOT EXISTS guest_phone_otp (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone       TEXT NOT NULL,
  otp_hash    TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  used        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.8 MENU CATEGORIES
CREATE TABLE IF NOT EXISTS menu_categories (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resort_id       UUID NOT NULL REFERENCES resorts(id),
  name            TEXT NOT NULL,
  emoji           TEXT DEFAULT '🍽️',
  available_from  TIME,
  available_until TIME,
  is_available    BOOLEAN DEFAULT TRUE,
  sort_order      INTEGER DEFAULT 0
);

-- 2.9 MENU ITEMS
CREATE TABLE IF NOT EXISTS menu_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resort_id    UUID NOT NULL REFERENCES resorts(id),
  category_id  UUID NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  description  TEXT,
  price        INTEGER NOT NULL,
  item_type    TEXT DEFAULT 'veg' CHECK (item_type IN ('veg', 'nonveg', 'egg')),
  is_available BOOLEAN DEFAULT TRUE,
  is_special   BOOLEAN DEFAULT FALSE,
  has_variants BOOLEAN DEFAULT FALSE,
  sort_order   INTEGER DEFAULT 0
);

-- 2.10 MENU ITEM VARIANTS
CREATE TABLE IF NOT EXISTS menu_item_variants (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id     UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  group_label TEXT NOT NULL,
  option_name TEXT NOT NULL,
  price_delta INTEGER DEFAULT 0,
  sort_order  INTEGER DEFAULT 0
);

-- 2.11 ACTIVITIES
CREATE TABLE IF NOT EXISTS activities (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resort_id             UUID NOT NULL REFERENCES resorts(id),
  name                  TEXT NOT NULL,
  description           TEXT,
  short_description     TEXT,
  pricing_type          TEXT NOT NULL CHECK (pricing_type IN ('per_person', 'per_setup', 'per_session')),
  price_per_person      INTEGER,
  price_per_setup       INTEGER,
  price_per_session     INTEGER,
  duration_minutes      INTEGER,
  max_capacity_per_slot INTEGER NOT NULL DEFAULT 50,
  requires_balcony      BOOLEAN DEFAULT FALSE,
  min_advance_hours     INTEGER DEFAULT 0,
  what_is_included      TEXT[],
  notes_for_guest       TEXT,
  notes_for_staff       TEXT,
  image_url             TEXT,
  is_available          BOOLEAN DEFAULT TRUE,
  sort_order            INTEGER DEFAULT 0,
  category              TEXT DEFAULT 'outdoor'
);

-- 2.12 ACTIVITY TIME SLOTS
CREATE TABLE IF NOT EXISTS activity_time_slots (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id           UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  label                 TEXT NOT NULL,
  start_time            TIME NOT NULL,
  end_time              TIME NOT NULL,
  days_available        INTEGER[] NOT NULL DEFAULT '{0,1,2,3,4,5,6}',
  max_capacity_override INTEGER,
  is_active             BOOLEAN DEFAULT TRUE,
  sort_order            INTEGER DEFAULT 0
);

-- 2.13 ACTIVITY BOOKINGS
CREATE TABLE IF NOT EXISTS activity_bookings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number        TEXT UNIQUE,
  activity_id           UUID NOT NULL REFERENCES activities(id),
  slot_id               UUID NOT NULL REFERENCES activity_time_slots(id),
  booking_date          DATE NOT NULL,
  guest_id              UUID REFERENCES guests(id) ON DELETE SET NULL,
  room_id               UUID REFERENCES rooms(id) ON DELETE SET NULL,
  guest_name            TEXT NOT NULL,
  guest_phone           TEXT,
  number_of_guests      INTEGER NOT NULL DEFAULT 1,
  pricing_type_snapshot TEXT NOT NULL,
  unit_price_snapshot   INTEGER NOT NULL,
  total_amount          INTEGER NOT NULL,
  status                TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  special_requests      TEXT,
  assigned_staff_name   TEXT,
  staff_instructions    TEXT,
  confirmed_by          UUID REFERENCES staff(id),
  cancellation_reason   TEXT,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

-- 2.14 ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number   TEXT UNIQUE,
  resort_id      UUID NOT NULL REFERENCES resorts(id),
  guest_id       UUID REFERENCES guests(id) ON DELETE SET NULL,
  room_id        UUID REFERENCES rooms(id) ON DELETE SET NULL,
  table_id       UUID REFERENCES restaurant_tables(id) ON DELETE SET NULL,
  service_type   TEXT NOT NULL CHECK (service_type IN ('room_service', 'dine_in', 'pickup', 'walk_in', 'takeaway')),
  guest_name     TEXT NOT NULL,
  guest_phone    TEXT,
  room_number    TEXT,
  table_number   TEXT,
  items          JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal       NUMERIC NOT NULL DEFAULT 0,
  tax_amount     NUMERIC DEFAULT 0,
  grand_total    NUMERIC DEFAULT 0,
  total_amount   NUMERIC DEFAULT 0,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'folio', 'refunded')),
  payment_method TEXT CHECK (payment_method IN ('cash', 'upi', 'card', 'folio', 'other')),
  settled_at     TIMESTAMPTZ,
  settled_by     TEXT,
  status         TEXT DEFAULT 'new' CHECK (status IN ('new', 'confirmed', 'preparing', 'ready', 'served', 'cancelled')),
  special_note   TEXT,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

-- 2.15 ORDER STATUS LOG
CREATE TABLE IF NOT EXISTS order_status_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  old_status  TEXT,
  new_status  TEXT NOT NULL,
  changed_by  TEXT,
  changed_at  TIMESTAMPTZ DEFAULT now()
);

-- 2.16 INVENTORY & STOCK
CREATE TABLE IF NOT EXISTS inventory_items (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resort_id                 UUID REFERENCES resorts(id) ON DELETE CASCADE,
  name                      TEXT NOT NULL,
  category                  TEXT NOT NULL,
  unit                      TEXT NOT NULL,
  low_stock_alert_threshold NUMERIC NOT NULL DEFAULT 0,
  notes                     TEXT,
  is_active                 BOOLEAN NOT NULL DEFAULT TRUE,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stock_inward (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resort_id      UUID REFERENCES resorts(id) ON DELETE CASCADE,
  item_id        UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
  quantity       NUMERIC NOT NULL CHECK (quantity > 0),
  unit_cost      NUMERIC,
  invoice_number TEXT,
  supplier_name  TEXT,
  notes          TEXT,
  logged_by      UUID REFERENCES staff(id),
  logged_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stock_consumption (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resort_id      UUID REFERENCES resorts(id) ON DELETE CASCADE,
  item_id        UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
  quantity       NUMERIC NOT NULL,
  reason         TEXT NOT NULL DEFAULT 'daily_use',
  notes          TEXT,
  logged_by      UUID REFERENCES staff(id),
  logged_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS whatsapp_log (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id            UUID REFERENCES guests(id) ON DELETE SET NULL,
  phone_number        TEXT NOT NULL,
  message_type        TEXT NOT NULL,
  template_name       TEXT,
  status              TEXT DEFAULT 'sent',
  provider_message_id TEXT,
  sent_at             TIMESTAMPTZ DEFAULT now(),
  error_message       TEXT
);

-- Fast Indexes
CREATE INDEX IF NOT EXISTS idx_orders_resort_status ON orders(resort_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_guest_id      ON orders(guest_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at    ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_room_id       ON orders(room_id);
CREATE INDEX IF NOT EXISTS idx_orders_table_id      ON orders(table_id);
CREATE INDEX IF NOT EXISTS idx_guests_phone         ON guests(guest_phone);
CREATE INDEX IF NOT EXISTS idx_guests_status        ON guests(status);
CREATE INDEX IF NOT EXISTS idx_guest_sessions_token ON guest_sessions(token);
CREATE INDEX IF NOT EXISTS idx_act_bookings_date    ON activity_bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_act_bookings_slot    ON activity_bookings(slot_id, booking_date);


-- ── 3. VIEWS ───────────────────────────────────────────────────

-- 3.1 staff_public (masks pin_hash and supabase_email from anon)
CREATE OR REPLACE VIEW staff_public AS
SELECT
  id,
  resort_id,
  name,
  role,
  avatar_color,
  is_active
FROM staff
WHERE is_active = TRUE;

-- 3.2 guest_folio (unifies restaurant orders and booked activities)
CREATE OR REPLACE VIEW guest_folio AS
  SELECT
    o.id,
    o.guest_id,
    o.room_id,
    o.created_at        AS charge_at,
    'food'              AS charge_type,
    o.order_number      AS reference_number,
    'Food Order — Panache Restaurant' AS description,
    o.items             AS line_items,
    COALESCE(o.grand_total, o.subtotal) AS amount,
    o.status,
    o.service_type      AS detail
  FROM orders o
  WHERE o.status != 'cancelled'

UNION ALL

  SELECT
    ab.id,
    ab.guest_id,
    ab.room_id,
    ab.created_at       AS charge_at,
    'activity'          AS charge_type,
    ab.booking_number   AS reference_number,
    a.name || ' — ' || to_char(ab.booking_date, 'DD Mon YYYY') || ', ' || to_char(ats.start_time, 'HH12:MI AM') AS description,
    NULL                AS line_items,
    ab.total_amount     AS amount,
    ab.status,
    ab.number_of_guests::text || ' guest(s)' AS detail
  FROM activity_bookings ab
  JOIN activities a            ON ab.activity_id = a.id
  JOIN activity_time_slots ats ON ab.slot_id = ats.id
  WHERE ab.status != 'cancelled'
ORDER BY charge_at;

-- 3.3 current_stock (computed inventory balances)
CREATE OR REPLACE VIEW current_stock AS
SELECT
  ii.id                          AS item_id,
  ii.resort_id,
  ii.name,
  ii.category,
  ii.unit,
  ii.low_stock_alert_threshold,
  COALESCE(SUM(si.quantity), 0)                         AS total_inward,
  COALESCE(SUM(sc.quantity), 0)                         AS total_consumed,
  COALESCE(SUM(si.quantity), 0) - COALESCE(SUM(sc.quantity), 0) AS current_quantity,
  CASE
    WHEN (COALESCE(SUM(si.quantity), 0) - COALESCE(SUM(sc.quantity), 0)) <= ii.low_stock_alert_threshold
    THEN TRUE ELSE FALSE
  END                            AS is_low_stock
FROM inventory_items ii
LEFT JOIN stock_inward      si ON si.item_id = ii.id
LEFT JOIN stock_consumption sc ON sc.item_id = ii.id
WHERE ii.is_active = TRUE
GROUP BY ii.id, ii.resort_id, ii.name, ii.category, ii.unit, ii.low_stock_alert_threshold;


-- ── 4. STORED PROCEDURES / RPCS ────────────────────────────────

-- 4.1 verify_staff_pin (Individual Staff PIN)
CREATE OR REPLACE FUNCTION public.verify_staff_pin(
  p_staff_id UUID,
  p_pin      TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_staff staff%ROWTYPE;
BEGIN
  SELECT * INTO v_staff FROM staff WHERE id = p_staff_id;

  IF NOT FOUND OR NOT v_staff.is_active THEN
    RETURN jsonb_build_object('valid', false);
  END IF;

  IF v_staff.pin_hash IS NOT NULL AND v_staff.pin_hash = crypt(p_pin, v_staff.pin_hash) THEN
    RETURN jsonb_build_object(
      'valid',     true,
      'staff_id',  v_staff.id,
      'name',      v_staff.name,
      'role',      v_staff.role,
      'resort_id', v_staff.resort_id
    );
  ELSE
    RETURN jsonb_build_object('valid', false);
  END IF;
END;
$$;

-- 4.2 verify_staff_pin_any (Global PIN Check)
CREATE OR REPLACE FUNCTION public.verify_staff_pin_any(p_pin TEXT)
RETURNS TABLE (
  id        UUID,
  name      TEXT,
  role      TEXT,
  resort_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN QUERY
  SELECT s.id, s.name, s.role, s.resort_id
  FROM staff s
  WHERE s.is_active = TRUE
    AND s.pin_hash IS NOT NULL
    AND s.pin_hash = crypt(p_pin, s.pin_hash);
END;
$$;

-- 4.3 direct_guest_login (Frictionless login without SMS OTP)
CREATE OR REPLACE FUNCTION public.direct_guest_login(
  p_phone        TEXT,
  p_name         TEXT DEFAULT NULL,
  p_guest_type   TEXT DEFAULT 'walk_in',
  p_room_number  TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session_token TEXT;
  v_guest_id      UUID;
  v_room_id       UUID;
  v_room_number   TEXT := NULLIF(TRIM(p_room_number), '');
  v_clean_phone   TEXT := TRIM(p_phone);
  v_guest_name    TEXT := COALESCE(NULLIF(TRIM(p_name), ''), 'Guest');
  v_resort_id     UUID;
BEGIN
  SELECT id INTO v_resort_id FROM resorts LIMIT 1;
  IF v_resort_id IS NULL THEN
    v_resort_id := '00000000-0000-0000-0000-000000000001'::UUID;
  END IF;

  v_session_token := 'live-' || encode(gen_random_bytes(24), 'hex');

  -- Resident Room Guest
  IF p_guest_type = 'resort_guest' AND v_room_number IS NOT NULL THEN
    SELECT r.id, r.current_guest_id INTO v_room_id, v_guest_id
    FROM rooms r
    WHERE r.resort_id = v_resort_id AND r.room_number = v_room_number;

    IF v_guest_id IS NOT NULL THEN
      SELECT g.guest_name INTO v_guest_name
      FROM guests g
      WHERE g.id = v_guest_id;
    END IF;

    INSERT INTO guest_sessions (
      token, guest_id, room_id, room_number,
      guest_name, guest_phone, resort_id, is_active,
      expires_at
    ) VALUES (
      v_session_token, v_guest_id, v_room_id, v_room_number,
      v_guest_name, v_clean_phone, v_resort_id, TRUE,
      now() + INTERVAL '7 days'
    );

    RETURN jsonb_build_object(
      'success',        true,
      'guest_type',     'resort_guest',
      'session_token',  v_session_token,
      'guest_name',     v_guest_name,
      'guest_phone',    v_clean_phone,
      'room_number',    v_room_number,
      'guest_id',       v_guest_id
    );
  ELSE
    -- Walk-In Customer
    INSERT INTO guest_sessions (
      token, guest_id, room_id, room_number,
      guest_name, guest_phone, resort_id, is_active,
      expires_at
    ) VALUES (
      v_session_token, NULL, NULL, '',
      v_guest_name, v_clean_phone, v_resort_id, TRUE,
      now() + INTERVAL '24 hours'
    );

    RETURN jsonb_build_object(
      'success',        true,
      'guest_type',     'walk_in',
      'session_token',  v_session_token,
      'guest_name',     v_guest_name,
      'guest_phone',    v_clean_phone,
      'room_number',    '',
      'guest_id',       NULL
    );
  END IF;

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', 'LOGIN_ERROR', 'message', SQLERRM);
END;
$$;

-- 4.4 resolve_guest_session
CREATE OR REPLACE FUNCTION public.resolve_guest_session(p_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session guest_sessions%ROWTYPE;
BEGIN
  SELECT * INTO v_session
  FROM guest_sessions
  WHERE token = p_token
    AND is_active = TRUE
    AND (expires_at IS NULL OR expires_at > now());

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'SESSION_NOT_FOUND_OR_EXPIRED');
  END IF;

  RETURN jsonb_build_object(
    'valid',        true,
    'guest_id',     v_session.guest_id,
    'room_id',      v_session.room_id,
    'room_number',  v_session.room_number,
    'guest_name',   v_session.guest_name,
    'guest_phone',  v_session.guest_phone,
    'resort_id',    v_session.resort_id
  );
END;
$$;

-- 4.5 update_walkin_name
CREATE OR REPLACE FUNCTION public.update_walkin_name(
  p_session_token TEXT,
  p_name          TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE guest_sessions
  SET guest_name = p_name
  WHERE token = p_session_token AND is_active = TRUE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'SESSION_NOT_FOUND');
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- 4.6 create_order (Canonical order creator supporting Room, Table, Walk-in, GST)
CREATE OR REPLACE FUNCTION public.create_order(
  p_resort_id      UUID,
  p_service_type   TEXT,
  p_guest_name     TEXT,
  p_guest_phone    TEXT,
  p_items          JSONB DEFAULT '[]'::jsonb,
  p_subtotal       NUMERIC DEFAULT 0,
  p_room_number    TEXT DEFAULT NULL,
  p_table_number   TEXT DEFAULT NULL,
  p_special_note   TEXT DEFAULT NULL,
  p_session_token  TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id       UUID;
  v_order_number   TEXT;
  v_guest_id       UUID;
  v_room_id        UUID;
  v_table_id       UUID;
  v_room_number    TEXT := NULLIF(TRIM(p_room_number), '');
  v_table_number   TEXT := NULLIF(TRIM(p_table_number), '');
  v_guest_name     TEXT := p_guest_name;
  v_guest_phone    TEXT := p_guest_phone;
  v_service_type   TEXT := p_service_type;
  v_session        JSONB;
  v_tax_amount     NUMERIC;
  v_grand_total    NUMERIC;
  v_payment_status TEXT;
  v_resort_id      UUID := p_resort_id;
BEGIN
  IF v_resort_id IS NULL THEN
    SELECT id INTO v_resort_id FROM resorts LIMIT 1;
  END IF;

  -- Resolve session token if provided
  IF p_session_token IS NOT NULL AND p_session_token != '' THEN
    SELECT row_to_json(gs)::jsonb INTO v_session
    FROM guest_sessions gs
    WHERE gs.token = p_session_token AND gs.is_active = TRUE
      AND (gs.expires_at IS NULL OR gs.expires_at > now());

    IF v_session IS NOT NULL THEN
      v_guest_id    := (v_session->>'guest_id')::UUID;
      v_room_id     := (v_session->>'room_id')::UUID;
      v_room_number := COALESCE(NULLIF(v_session->>'room_number', ''), v_room_number);
      v_guest_name  := COALESCE(v_session->>'guest_name', v_guest_name);
      v_guest_phone := COALESCE(v_session->>'guest_phone', v_guest_phone);
    END IF;
  END IF;

  -- Resolve room and current guest
  IF v_room_id IS NULL AND v_room_number IS NOT NULL AND v_room_number != '' THEN
    SELECT id, current_guest_id INTO v_room_id, v_guest_id
    FROM rooms
    WHERE resort_id = v_resort_id AND room_number = v_room_number;
  END IF;

  -- Resolve table
  IF v_table_number IS NOT NULL AND v_table_number != '' THEN
    SELECT id INTO v_table_id
    FROM restaurant_tables
    WHERE resort_id = v_resort_id AND table_number = v_table_number;
    
    IF v_service_type IS NULL OR v_service_type = 'room_service' THEN
      v_service_type := 'dine_in';
    END IF;
  END IF;

  IF v_room_id IS NULL AND v_table_id IS NULL AND (v_service_type IS NULL OR v_service_type = 'room_service') THEN
    v_service_type := 'walk_in';
  END IF;

  -- 5% Restaurant GST
  v_tax_amount  := ROUND(COALESCE(p_subtotal, 0) * 0.05, 2);
  v_grand_total := ROUND(COALESCE(p_subtotal, 0) + v_tax_amount, 2);

  IF v_room_id IS NOT NULL THEN
    v_payment_status := 'folio';
  ELSE
    v_payment_status := 'pending';
  END IF;

  v_order_number := 'PAN-' || to_char(nextval('order_number_seq'), 'FM00000');

  INSERT INTO orders (
    order_number, resort_id, guest_id, room_id, table_id,
    service_type, guest_name, guest_phone, room_number, table_number,
    items, subtotal, tax_amount, grand_total, total_amount, payment_status,
    status, special_note
  ) VALUES (
    v_order_number, v_resort_id, v_guest_id, v_room_id, v_table_id,
    v_service_type, v_guest_name, v_guest_phone, v_room_number, v_table_number,
    p_items, ROUND(p_subtotal), v_tax_amount, v_grand_total, v_grand_total, v_payment_status,
    'new', p_special_note
  )
  RETURNING id INTO v_order_id;

  RETURN jsonb_build_object(
    'success',        true,
    'order_id',       v_order_id,
    'order_number',   v_order_number,
    'subtotal',       p_subtotal,
    'tax_amount',     v_tax_amount,
    'grand_total',    v_grand_total,
    'payment_status', v_payment_status,
    'service_type',   v_service_type
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', 'SERVER_ERROR', 'message', SQLERRM);
END;
$$;

-- 4.7 settle_walkin_bill
CREATE OR REPLACE FUNCTION public.settle_walkin_bill(
  p_order_id        UUID,
  p_payment_method  TEXT DEFAULT 'cash',
  p_settled_by      TEXT DEFAULT 'Reception Desk',
  p_staff_id        UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE orders
  SET payment_status = 'paid',
      payment_method = p_payment_method,
      settled_at     = now(),
      settled_by     = COALESCE(p_settled_by, p_staff_id::text, 'Reception Desk'),
      updated_at     = now()
  WHERE id = p_order_id;

  RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', 'SETTLE_ERROR', 'message', SQLERRM);
END;
$$;

-- 4.8 check_in_guest
CREATE OR REPLACE FUNCTION public.check_in_guest(
  p_resort_id        UUID    DEFAULT NULL,
  p_room_id          UUID    DEFAULT NULL,
  p_room_number      TEXT    DEFAULT NULL,
  p_guest_name       TEXT    DEFAULT NULL,
  p_guest_phone      TEXT    DEFAULT NULL,
  p_guest_email      TEXT    DEFAULT NULL,
  p_number_of_adults INTEGER DEFAULT 1,
  p_expected_checkout DATE   DEFAULT NULL,
  p_notes            TEXT    DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_room_id       UUID;
  v_guest_id      UUID;
  v_resort_id     UUID;
  v_room_number   TEXT;
  v_session_token TEXT;
BEGIN
  IF p_guest_name IS NULL OR TRIM(p_guest_name) = '' OR p_guest_phone IS NULL OR TRIM(p_guest_phone) = '' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error',   'INVALID_ARGUMENTS',
      'message', 'Guest name and phone number are required.'
    );
  END IF;

  v_resort_id := COALESCE(p_resort_id, (SELECT id FROM resorts LIMIT 1));

  IF p_room_id IS NOT NULL THEN
    SELECT id, room_number INTO v_room_id, v_room_number
    FROM rooms
    WHERE id = p_room_id AND resort_id = v_resort_id AND is_occupied = FALSE;
  ELSIF p_room_number IS NOT NULL THEN
    SELECT id, room_number INTO v_room_id, v_room_number
    FROM rooms
    WHERE room_number = p_room_number AND resort_id = v_resort_id AND is_occupied = FALSE;
  END IF;

  IF v_room_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error',   'ROOM_UNAVAILABLE',
      'message', 'Room not found or already occupied.'
    );
  END IF;

  -- Deactivate previous sessions for this room
  UPDATE guest_sessions
  SET is_active = FALSE, deactivated_at = now()
  WHERE room_id = v_room_id AND is_active = TRUE;

  INSERT INTO guests (
    resort_id, room_id,
    guest_name, guest_phone, email,
    number_of_adults,
    check_in_date, expected_checkout,
    notes, status
  ) VALUES (
    v_resort_id, v_room_id,
    p_guest_name, p_guest_phone, p_guest_email,
    COALESCE(p_number_of_adults, 1),
    CURRENT_DATE, p_expected_checkout,
    p_notes, 'checked_in'
  ) RETURNING id INTO v_guest_id;

  UPDATE rooms
  SET is_occupied = TRUE, current_guest_id = v_guest_id
  WHERE id = v_room_id;

  v_session_token := encode(gen_random_bytes(32), 'hex');

  INSERT INTO guest_sessions (
    token, guest_id, room_id, room_number,
    guest_name, guest_phone, resort_id,
    is_active, expires_at
  ) VALUES (
    v_session_token, v_guest_id, v_room_id, v_room_number,
    p_guest_name, p_guest_phone, v_resort_id,
    TRUE,
    CASE WHEN p_expected_checkout IS NOT NULL
      THEN (p_expected_checkout + INTERVAL '23 hours 59 minutes')
      ELSE NULL
    END
  );

  RETURN jsonb_build_object(
    'success',       true,
    'guest_id',      v_guest_id,
    'room_id',       v_room_id,
    'room_number',   v_room_number,
    'session_token', v_session_token
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', 'SERVER_ERROR', 'message', SQLERRM);
END;
$$;

-- 4.9 check_out_guest
CREATE OR REPLACE FUNCTION public.check_out_guest(p_guest_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_room_id UUID;
BEGIN
  SELECT id INTO v_room_id FROM rooms WHERE current_guest_id = p_guest_id LIMIT 1;

  UPDATE guests
  SET status          = 'checked_out',
      actual_checkout = now()
  WHERE id = p_guest_id;

  IF v_room_id IS NOT NULL THEN
    UPDATE rooms
    SET is_occupied      = FALSE,
        current_guest_id = NULL
    WHERE id = v_room_id;
  END IF;

  UPDATE guest_sessions
  SET is_active      = FALSE,
      deactivated_at = now()
  WHERE guest_id = p_guest_id AND is_active = TRUE;

  RETURN jsonb_build_object('success', true, 'guest_id', p_guest_id);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', 'CHECKOUT_ERROR', 'message', SQLERRM);
END;
$$;

-- 4.10 get_available_slots
CREATE OR REPLACE FUNCTION public.get_available_slots(
  p_activity_id  UUID,
  p_date         DATE
)
RETURNS TABLE (
  slot_id              UUID,
  label                TEXT,
  start_time           TIME,
  end_time             TIME,
  max_capacity         INTEGER,
  booked_count         INTEGER,
  remaining_capacity   INTEGER,
  is_available         BOOLEAN
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
    SELECT
      ats.id                        AS slot_id,
      ats.label,
      ats.start_time,
      ats.end_time,
      COALESCE(ats.max_capacity_override, a.max_capacity_per_slot) AS max_capacity,
      COALESCE(
        (SELECT SUM(ab.number_of_guests)
         FROM activity_bookings ab
         WHERE ab.slot_id = ats.id
           AND ab.booking_date = p_date
           AND ab.status NOT IN ('cancelled', 'no_show')),
        0
      )::INTEGER AS booked_count,
      (
        COALESCE(ats.max_capacity_override, a.max_capacity_per_slot)
        - COALESCE(
            (SELECT SUM(ab.number_of_guests)
             FROM activity_bookings ab
             WHERE ab.slot_id = ats.id
               AND ab.booking_date = p_date
               AND ab.status NOT IN ('cancelled', 'no_show')),
            0
          )
      )::INTEGER AS remaining_capacity,
      (
        ats.is_active = TRUE
        AND a.is_available = TRUE
        AND EXTRACT(DOW FROM p_date) = ANY(ats.days_available)
        AND (
          COALESCE(ats.max_capacity_override, a.max_capacity_per_slot)
          - COALESCE(
              (SELECT SUM(ab.number_of_guests)
               FROM activity_bookings ab
               WHERE ab.slot_id = ats.id
                 AND ab.booking_date = p_date
                 AND ab.status NOT IN ('cancelled', 'no_show')),
              0
            )
        ) > 0
      ) AS is_available
    FROM activity_time_slots ats
    JOIN activities a ON ats.activity_id = a.id
    WHERE ats.activity_id = p_activity_id
      AND ats.is_active = TRUE
    ORDER BY ats.start_time;
END;
$$;

-- 4.11 book_activity_slot
CREATE OR REPLACE FUNCTION public.book_activity_slot(
  p_activity_id      UUID,
  p_slot_id          UUID,
  p_booking_date     DATE,
  p_number_guests    INT,
  p_guest_name       TEXT,
  p_guest_phone      TEXT,
  p_room_number      TEXT   DEFAULT NULL,
  p_special_requests TEXT   DEFAULT NULL,
  p_session_token    TEXT   DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_booking_id     UUID;
  v_booking_number TEXT;
  v_lock_key       BIGINT;
  v_booked_count   INT;
  v_capacity       INT;
  v_pricing_type   TEXT;
  v_unit_price     NUMERIC;
  v_total_amount   NUMERIC;
  v_room_id        UUID;
  v_guest_id       UUID;
  v_guest_name     TEXT := p_guest_name;
  v_guest_phone    TEXT := p_guest_phone;
  v_room_number    TEXT := p_room_number;
  v_session        JSONB;
BEGIN
  v_lock_key := hashtext(p_slot_id::text || p_booking_date::text);
  PERFORM pg_advisory_xact_lock(v_lock_key);

  IF p_session_token IS NOT NULL AND p_session_token != '' THEN
    v_session := resolve_guest_session(p_session_token);
    IF (v_session->>'valid')::BOOLEAN THEN
      v_guest_id    := (v_session->>'guest_id')::UUID;
      v_room_id     := (v_session->>'room_id')::UUID;
      v_room_number := v_session->>'room_number';
      v_guest_name  := v_session->>'guest_name';
      v_guest_phone := v_session->>'guest_phone';
    END IF;
  ELSIF v_room_number IS NOT NULL AND v_room_number != '' THEN
    SELECT id, current_guest_id INTO v_room_id, v_guest_id
    FROM rooms WHERE room_number = v_room_number;
  END IF;

  SELECT COALESCE(max_capacity_override, 50) INTO v_capacity FROM activity_time_slots WHERE id = p_slot_id;
  SELECT COALESCE(SUM(number_of_guests), 0) INTO v_booked_count
  FROM activity_bookings
  WHERE slot_id = p_slot_id AND booking_date = p_booking_date AND status NOT IN ('cancelled', 'no_show');

  IF (v_booked_count + p_number_guests) > v_capacity THEN
    RETURN jsonb_build_object('success', false, 'error', 'SLOT_FULL', 'message', 'No spots available for this time slot.');
  END IF;

  SELECT pricing_type, COALESCE(price_per_person, price_per_setup, price_per_session, 0)
  INTO v_pricing_type, v_unit_price
  FROM activities WHERE id = p_activity_id;

  IF v_pricing_type = 'per_person' THEN
    v_total_amount := v_unit_price * p_number_guests;
  ELSE
    v_total_amount := v_unit_price;
  END IF;

  v_booking_number := 'EXP-' || to_char(nextval('booking_number_seq'), 'FM00000');

  INSERT INTO activity_bookings (
    booking_number, activity_id, slot_id, booking_date,
    guest_id, room_id,
    guest_name, guest_phone,
    number_of_guests,
    pricing_type_snapshot, unit_price_snapshot, total_amount,
    status, special_requests
  ) VALUES (
    v_booking_number, p_activity_id, p_slot_id, p_booking_date,
    v_guest_id, v_room_id,
    v_guest_name, v_guest_phone,
    p_number_guests,
    v_pricing_type, v_unit_price::integer, v_total_amount::integer,
    'confirmed', p_special_requests
  )
  RETURNING id INTO v_booking_id;

  RETURN jsonb_build_object(
    'success',        true,
    'booking_id',     v_booking_id,
    'booking_number', v_booking_number,
    'total_amount',   v_total_amount
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', 'SERVER_ERROR', 'message', SQLERRM);
END;
$$;


-- ── 5. TRIGGERS ────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_status_log (order_id, old_status, new_status, changed_by, changed_at)
    VALUES (NEW.id, OLD.status, NEW.status, 'System', now());
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_order_status_change ON orders;
CREATE TRIGGER trg_order_status_change
  AFTER UPDATE OF status ON orders
  FOR EACH ROW
  EXECUTE FUNCTION public.log_order_status_change();


-- ── 6. ROW-LEVEL SECURITY (RLS) POLICIES ───────────────────────
ALTER TABLE resorts             ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms               ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_tables   ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff               ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests              ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_sessions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_phone_otp     ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories     ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items          ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_variants  ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities          ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_bookings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders              ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_log    ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_inward        ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_consumption   ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_log        ENABLE ROW LEVEL SECURITY;

-- Drop prior policies to ensure clean re-run
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- Public read for resort info, rooms, tables, menu, activities
CREATE POLICY p_resorts_read   ON resorts           FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY p_rooms_read     ON rooms             FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY p_rooms_update   ON rooms             FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY p_rooms_insert   ON rooms             FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY p_tables_read    ON restaurant_tables FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY p_tables_update  ON restaurant_tables FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY p_cats_read      ON menu_categories   FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY p_items_read     ON menu_items        FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY p_vars_read      ON menu_item_variants FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY p_acts_read      ON activities        FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY p_slots_read     ON activity_time_slots FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY p_act_books_all  ON activity_bookings FOR ALL    TO anon, authenticated USING (true) WITH CHECK (true);

-- Orders & Status Log (Permissive for local/live multi-portal synchronization)
CREATE POLICY p_orders_read    ON orders            FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY p_orders_insert  ON orders            FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY p_orders_update  ON orders            FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY p_order_log_all  ON order_status_log  FOR ALL    TO anon, authenticated USING (true) WITH CHECK (true);

-- Guests & Sessions
CREATE POLICY p_guests_all     ON guests            FOR ALL    TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY p_sessions_all   ON guest_sessions    FOR ALL    TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY p_otp_all        ON guest_phone_otp   FOR ALL    TO anon, authenticated USING (true) WITH CHECK (true);

-- Inventory
CREATE POLICY p_inv_items_all  ON inventory_items   FOR ALL    TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY p_inward_all     ON stock_inward      FOR ALL    TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY p_cons_all       ON stock_consumption FOR ALL    TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY p_walog_all      ON whatsapp_log      FOR ALL    TO anon, authenticated USING (true) WITH CHECK (true);

-- Staff Table Security: direct SELECT restricted to authenticated users.
-- Anon clients query staff_public view or call verify_staff_pin RPC.
CREATE POLICY p_staff_auth_read ON staff FOR SELECT TO authenticated USING (true);
REVOKE SELECT ON staff FROM anon;

-- Grant permissions to views & RPCs
GRANT SELECT ON staff_public TO anon, authenticated;
GRANT SELECT ON guest_folio  TO anon, authenticated;
GRANT SELECT ON current_stock TO anon, authenticated;

GRANT EXECUTE ON FUNCTION public.verify_staff_pin(UUID, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_staff_pin_any(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.direct_guest_login(TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_guest_session(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_walkin_name(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_order(UUID, TEXT, TEXT, TEXT, JSONB, NUMERIC, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.settle_walkin_bill(UUID, TEXT, TEXT, UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_in_guest(UUID, UUID, TEXT, TEXT, TEXT, TEXT, INTEGER, DATE, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_out_guest(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_available_slots(UUID, DATE) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.book_activity_slot(UUID, UUID, DATE, INT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;


-- ── 7. SUPABASE REALTIME WEBSOCKET REGISTRATION ────────────────
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE orders;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE restaurant_tables;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE activity_bookings;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

ALTER TABLE orders REPLICA IDENTITY FULL;
ALTER TABLE restaurant_tables REPLICA IDENTITY FULL;
ALTER TABLE activity_bookings REPLICA IDENTITY FULL;


-- ── 8. COMPLETE PRODUCTION SEEDS ───────────────────────────────

-- 8.1 Resort Entity
INSERT INTO resorts (id, name, slug, timezone)
VALUES ('00000000-0000-0000-0000-000000000001', 'Shivalaya Resort', 'shivalaya-resorts', 'Asia/Kolkata')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

-- 8.2 Official 28 Rooms
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
-- Villa Rooms (3)
('00000000-0000-0000-0000-000000000001', 'Villa Room 1', 'Villa Room', 1, true, 26),
('00000000-0000-0000-0000-000000000001', 'Villa Room 2', 'Villa Room', 1, true, 27),
('00000000-0000-0000-0000-000000000001', 'Villa Room 3', 'Villa Room', 1, true, 28)
ON CONFLICT (resort_id, room_number) DO NOTHING;

-- 8.3 Official 12 Dining Tables
INSERT INTO restaurant_tables (resort_id, table_number, capacity) VALUES
('00000000-0000-0000-0000-000000000001', 'T-01', 2),
('00000000-0000-0000-0000-000000000001', 'T-02', 2),
('00000000-0000-0000-0000-000000000001', 'T-03', 4),
('00000000-0000-0000-0000-000000000001', 'T-04', 4),
('00000000-0000-0000-0000-000000000001', 'T-05', 4),
('00000000-0000-0000-0000-000000000001', 'T-06', 4),
('00000000-0000-0000-0000-000000000001', 'T-07', 4),
('00000000-0000-0000-0000-000000000001', 'T-08', 4),
('00000000-0000-0000-0000-000000000001', 'T-09', 6),
('00000000-0000-0000-0000-000000000001', 'T-10', 6),
('00000000-0000-0000-0000-000000000001', 'T-11', 8),
('00000000-0000-0000-0000-000000000001', 'T-12', 8)
ON CONFLICT (resort_id, table_number) DO NOTHING;

-- 8.4 Staff Accounts with 4-Digit PINs
-- Reception: 1234 | Owner: 9999 | Kitchen: 1101, 1102, 1103, 1104, 1201, 1202
INSERT INTO staff (resort_id, name, pin_hash, role, avatar_color) VALUES
('00000000-0000-0000-0000-000000000001', 'Bilam Pandey', crypt('1234', gen_salt('bf')), 'receptionist', '#2C6E3B'),
('00000000-0000-0000-0000-000000000001', 'Resort Owner', crypt('9999', gen_salt('bf')), 'owner', '#142510'),
('00000000-0000-0000-0000-000000000001', 'Kundan Chef', crypt('1101', gen_salt('bf')), 'kitchen', '#AD8A3F'),
('00000000-0000-0000-0000-000000000001', 'Deepak', crypt('1102', gen_salt('bf')), 'kitchen', '#2C4A22'),
('00000000-0000-0000-0000-000000000001', 'Neha', crypt('1103', gen_salt('bf')), 'kitchen', '#4A2010'),
('00000000-0000-0000-0000-000000000001', 'Himanshu', crypt('1104', gen_salt('bf')), 'kitchen', '#1A3B1A'),
('00000000-0000-0000-0000-000000000001', 'Sujit', crypt('1201', gen_salt('bf')), 'kitchen', '#0C3B5E'),
('00000000-0000-0000-0000-000000000001', 'Varun', crypt('1202', gen_salt('bf')), 'kitchen', '#3A1A4A')
ON CONFLICT DO NOTHING;

-- 8.5 Menu Categories (23)
INSERT INTO menu_categories (id, resort_id, name, sort_order) VALUES
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Breakfast', 1),
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Egg to Order', 2),
('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Starters – Veg', 3),
('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Starters – Non-Veg', 4),
('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Soup', 5),
('10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'Salad', 6),
('10000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'Indian Main – Paneer', 7),
('10000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'Seasonal Vegetable', 8),
('10000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001', 'Indian Main – Chicken', 9),
('10000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'Choice of Mutton', 10),
('10000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Indian Main – Dal', 11),
('10000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'Choices of Vegetable', 12),
('10000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', 'Panache Platters', 13),
('10000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000001', 'Indian Bread', 14),
('10000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000001', 'Rice', 15),
('10000000-0000-0000-0000-000000000016', '00000000-0000-0000-0000-000000000001', 'Italian', 16),
('10000000-0000-0000-0000-000000000017', '00000000-0000-0000-0000-000000000001', 'Kumaoni (Pahadi)', 17),
('10000000-0000-0000-0000-000000000018', '00000000-0000-0000-0000-000000000001', 'Dessert', 18),
('10000000-0000-0000-0000-000000000019', '00000000-0000-0000-0000-000000000001', 'Sandwich', 19),
('10000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000001', 'Sides', 20),
('10000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000001', 'Beverages', 21),
('10000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000001', 'Mocktail Zone', 22),
('10000000-0000-0000-0000-000000000023', '00000000-0000-0000-0000-000000000001', 'Momos', 23)
ON CONFLICT (id) DO NOTHING;

-- 8.6 Menu Items (150+ items)
INSERT INTO menu_items (resort_id, category_id, name, price, item_type, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Cereals with Milk', 160, 'veg', 1),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Canned Juice', 120, 'veg', 2),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Pancake', 250, 'veg', 3),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Puri Bhaji', 250, 'veg', 4),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Tawa Paratha with Stuffing of Choice (2 pcs)', 300, 'veg', 5),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Tandoori Paratha with Stuffing of Choice (2 pcs)', 350, 'veg', 6),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Chole Bhature', 300, 'veg', 7),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Poha / Vermicelli Upma / Rawa Choice', 250, 'veg', 8),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Cutlet / Aloo Bonda / Bread Pakora / Bread Roll (2 pcs)', 150, 'veg', 9),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Plain Dosa', 250, 'veg', 10),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Onion / Masala Dosa', 300, 'veg', 11),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Paneer / Cheese Dosa', 400, 'veg', 12),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Utthapam / Idli / Medu Vada', 250, 'veg', 13),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Cheese Omelette', 250, 'egg', 1),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Bread Omelette', 200, 'egg', 2),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Boiled Egg (2 pcs)', 100, 'egg', 3),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Egg Bhurji', 180, 'egg', 4),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Sunny Side Up / Half Fry / Egg Poach (2 pcs)', 150, 'egg', 5),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Scrambled Egg (2 pcs)', 180, 'egg', 6),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'Chilli Paneer', 400, 'veg', 1),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'Honey Chilli Potato', 300, 'veg', 2),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'Cheese Balls', 300, 'veg', 3),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'Crispy Corn', 400, 'veg', 4),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'Veg Spring Roll', 350, 'veg', 5),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'Veg Kathi Roll', 350, 'veg', 6),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'Mushroom Tikka', 500, 'veg', 7),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'Paneer Tikka', 600, 'veg', 8),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'Soya Chaap / Soya Malai Chaap', 300, 'veg', 9),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 'Non-Veg Spring Roll', 500, 'nonveg', 1),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 'Non-Veg Kathi Roll', 500, 'nonveg', 2),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 'Chilli Chicken / Chicken 65', 600, 'nonveg', 3),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 'Chicken Seekh Kabab', 650, 'nonveg', 4),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 'Chicken Malai Tikka', 650, 'nonveg', 5),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 'Chicken Tikka', 600, 'nonveg', 6),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 'Bhatti Murg', 800, 'nonveg', 7),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 'Chicken Haryali Tikka', 650, 'nonveg', 8),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005', 'Cream of Tomato', 300, 'veg', 1),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005', 'Manchow Soup', 250, 'veg', 2),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005', 'Dhaniya Shorba', 250, 'veg', 3),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005', 'Sweet Corn', 250, 'veg', 4),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005', 'Minestrone', 350, 'veg', 5),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005', 'Chicken Clear Soup', 250, 'nonveg', 6),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005', 'Chicken Coriander Soup', 250, 'nonveg', 7),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000006', 'Green Salad', 150, 'veg', 1),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000006', 'Russian / Kimchi / Finger Salad', 250, 'veg', 2),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000006', 'Protein Salad', 250, 'veg', 3),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000007', 'Kadahi Paneer', 550, 'veg', 1),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000007', 'Shahi Paneer', 550, 'veg', 2),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000007', 'Paneer Do Pyaza', 550, 'veg', 3),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000007', 'Makhani Paneer', 550, 'veg', 4),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000007', 'Paneer Butter Masala', 550, 'veg', 5),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000007', 'Methi Malai Paneer', 550, 'veg', 6),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000007', 'Paneer Lababdar', 550, 'veg', 7),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000007', 'Palak Paneer', 550, 'veg', 8),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000007', 'Paneer Pasanda', 550, 'veg', 9),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000007', 'Paneer Kofta', 550, 'veg', 10),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000007', 'Paneer Bhurji', 550, 'veg', 11),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000007', 'Paneer Tikka Masala', 650, 'veg', 12),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000008', 'Bhindi Do Pyaza', 350, 'veg', 1),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000008', 'Aloo Jeera', 300, 'veg', 2),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000008', 'Aloo Gobhi Adrakhi', 350, 'veg', 3),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000008', 'Heeng Aloo Beans', 350, 'veg', 4),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000008', 'Achari Baigan', 350, 'veg', 5),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000008', 'Dum Aloo', 400, 'veg', 6),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000008', 'Matar Mushroom', 550, 'veg', 7),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000008', 'Mushroom Butter Masala', 550, 'veg', 8),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000008', 'Mushroom Do Pyaza', 550, 'veg', 9),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000008', 'Mushroom Masala', 550, 'veg', 10),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000008', 'Vegetable in Sweet and Sour Gravy', 350, 'veg', 11),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000008', 'Manchurian Gravy', 400, 'veg', 12),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000009', 'Kadahi Chicken', 650, 'nonveg', 1),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000009', 'Chicken Curry', 650, 'nonveg', 2),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000009', 'Chicken Masala', 650, 'nonveg', 3),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000009', 'Kali Mirch Chicken', 700, 'nonveg', 4),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000009', 'Chicken Masala Tikka', 650, 'nonveg', 5),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000009', 'Mughlai Chicken', 700, 'nonveg', 6),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000009', 'Afghani Chicken', 700, 'nonveg', 7),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000009', 'Butter Chicken', 700, 'nonveg', 8),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000009', 'Handi Chicken', 650, 'nonveg', 9),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000009', 'Rogan Josh Chicken', 650, 'nonveg', 10),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000009', 'Haryali Chicken', 650, 'nonveg', 11),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000009', 'Panache Chicken (Chef Special)', 750, 'nonveg', 12),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000010', 'Panache Mutton (Chef Special)', 1000, 'nonveg', 1),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000010', 'Handi Mutton', 1000, 'nonveg', 2),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000010', 'Korma Mutton', 1000, 'nonveg', 3),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000010', 'Rogan Josh Mutton', 1000, 'nonveg', 4),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000010', 'Haryali Mutton', 1000, 'nonveg', 5),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000011', 'Dal Tadka / Dal Fry', 400, 'veg', 1),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000011', 'Dal Makhani', 500, 'veg', 2),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000011', 'Dal Sultani', 400, 'veg', 3),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000011', 'Dal Panchmeel', 400, 'veg', 4),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000011', 'Rajma Rasila', 400, 'veg', 5),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000012', 'Mix Veg / Sabz Miloni', 450, 'veg', 1),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000012', 'Veg Jaipuri', 450, 'veg', 2),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000013', 'Veg Platter', 900, 'veg', 1),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000013', 'Non Veg Platter', 1200, 'nonveg', 2),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000014', 'Tawa Roti', 25, 'veg', 1),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000014', 'Butter Tawa Roti', 30, 'veg', 2),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000014', 'Tandoori Roti', 40, 'veg', 3),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000014', 'Butter Tandoori Roti', 50, 'veg', 4),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000014', 'Missi Roti', 60, 'veg', 5),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000014', 'Butter Missi Roti', 70, 'veg', 6),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000014', 'Plain Naan', 60, 'veg', 7),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000014', 'Butter Plain Naan', 70, 'veg', 8),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000014', 'Garlic Naan', 80, 'veg', 9),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000014', 'Butter Garlic Naan', 90, 'veg', 10),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000014', 'Laccha Paratha', 90, 'veg', 11),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000014', 'Butter Chiplets', 50, 'veg', 12),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000015', 'Steamed / Jeera Rice', 250, 'veg', 1),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000015', 'Veg Fried Rice', 350, 'veg', 2),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000015', 'Butter Onion Rice', 350, 'veg', 3),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000015', 'Peas Pulao', 350, 'veg', 4),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000015', 'Veg Pulao', 350, 'veg', 5),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000015', 'Veg Briyani', 500, 'veg', 6),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000015', 'Chicken Biryani', 750, 'nonveg', 7),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000015', 'Mutton Biryani', 1200, 'nonveg', 8),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000015', 'Chicken Fried Rice', 550, 'nonveg', 9),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000015', 'Egg Fried Rice', 450, 'egg', 10),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000015', 'Chilli Garlic Fried Rice', 450, 'veg', 11),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000015', 'Schezwan Chicken Fried Rice', 650, 'nonveg', 12),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000016', 'Alfredo Sauce Pasta', 550, 'veg', 1),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000016', 'Arrabita Sauce Pasta', 550, 'veg', 2),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000016', 'Mixed Sauce Pasta', 550, 'veg', 3),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000016', 'Mushroom Pizza', 450, 'veg', 4),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000016', 'Corn Pizza', 350, 'veg', 5),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000016', 'Plain Pizza', 550, 'veg', 6),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000016', 'Paneer Peppery', 550, 'veg', 7),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000016', 'Pizza with Topping of Choice', 550, 'veg', 8),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000016', 'Margherita Pizza', 550, 'veg', 9),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000017', 'Bhat Ki Chudkani / Gahot Ki Dal', 550, 'veg', 1),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000017', 'Mooli Thechuani / Aloo Gutke / Bhat Ke Dupke / Palak Kafa', 350, 'veg', 2),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000017', 'Mandua Ki Roti', 60, 'veg', 3),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000017', 'Boondi Raita', 150, 'veg', 4),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000017', 'Kukumber Raita', 150, 'veg', 5),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000017', 'Kumaoni Raita', 150, 'veg', 6),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000017', 'Jhungar Ki Kheer', 200, 'veg', 7),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000017', 'Kumaoni Badi Ki Sabzi', 350, 'veg', 8),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000017', 'Kumaoni Chicken', 700, 'nonveg', 9),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000017', 'Kumaoni Mutton', 1200, 'nonveg', 10),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000017', 'Plain Khichdi', 150, 'veg', 11),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000017', 'Moong Dal Khichdi', 150, 'veg', 12),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000018', 'Kesari Kheer / Phirni', 150, 'veg', 1),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000018', 'Ice Cream', 150, 'veg', 2),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000018', 'Gulab Jamun (2 pcs)', 150, 'veg', 3),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000018', 'Rasmalai', 200, 'veg', 4),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000018', 'Fruit Custard', 150, 'veg', 5),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000018', 'Malpua with Rabri / Shahi Tukda', 200, 'veg', 6),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000019', 'Veg Plain Sandwich', 150, 'veg', 1),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000019', 'Chicken Plain Sandwich', 200, 'nonveg', 2),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000019', 'Grill / Club Sandwich', 250, 'veg', 3),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000019', 'Chicken Grill Sandwich', 350, 'nonveg', 4),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000019', 'Chocolate Sandwich', 300, 'veg', 5),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000019', 'Rainbow Sandwich', 250, 'veg', 6),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000020', 'French Fries', 200, 'veg', 1),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000020', 'Chilli Cheese Toast', 250, 'veg', 2),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000020', 'Paneer Pakoda', 350, 'veg', 3),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000020', 'Chicken Pakoda', 450, 'nonveg', 4),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000020', 'Fish Pakoda', 350, 'nonveg', 5),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000020', 'Masala Maggi', 150, 'veg', 6),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000020', 'Mix Veg Pakora', 250, 'veg', 7),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000020', 'Egg Maggi', 200, 'egg', 8),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000020', 'Peanut Masala', 150, 'veg', 9),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000020', 'Masala Papad', 120, 'veg', 10),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000020', 'Aloo Chat', 150, 'veg', 11),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000020', 'Veg Hakka Noodles', 300, 'veg', 12),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000020', 'Crispy Chidwa', 200, 'veg', 13),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000020', 'Butter Pav Bhaji', 250, 'veg', 14),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000020', 'Veg Burger', 200, 'veg', 15),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000020', 'Chicken Burger', 250, 'nonveg', 16),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000020', 'Paneer / Cheese Burger', 250, 'veg', 17),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000021', 'Tea', 80, 'veg', 1),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000021', 'Coffee', 120, 'veg', 2),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000021', 'Cold Coffee', 200, 'veg', 3),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000021', 'Hot Chocolate', 150, 'veg', 4),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000021', 'Lassi Sweet / Salt', 150, 'veg', 5),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000021', 'Butter Milk', 150, 'veg', 6),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000021', 'Aerated Drinks (200 ml)', 50, 'veg', 7),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000021', 'Soda', 50, 'veg', 8),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000022', 'Electric Blue', 150, 'veg', 1),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000022', 'Virgin Mojito', 200, 'veg', 2),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000022', 'Cardamom Cooler', 200, 'veg', 3),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000022', 'Homemade Lemonade', 150, 'veg', 4),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000022', 'Mint Julep', 200, 'veg', 5),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000022', 'Ice Tea', 200, 'veg', 6),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000022', 'Orange Lime Relaxer', 150, 'veg', 7),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000022', 'Atomic Cat', 200, 'veg', 8),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000022', 'Fruit Punch', 200, 'veg', 9),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000022', 'Shirley Temple', 200, 'veg', 10),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000022', 'Buransh Juice', 150, 'veg', 11),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000022', 'Litchi Juice', 150, 'veg', 12),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000022', 'Oreo Shake', 200, 'veg', 13),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000022', 'Elaichi Milk Shake', 200, 'veg', 14),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000022', 'Kesar Milk', 200, 'veg', 15),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000022', 'Plain Milk', 80, 'veg', 16),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000022', 'Coldrinks (750 ml)', 80, 'veg', 17),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000023', 'Veg Momo', 300, 'veg', 1),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000023', 'Mushroom Momo', 400, 'veg', 2),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000023', 'Paneer Momo', 400, 'veg', 3),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000023', 'Chicken Momo', 400, 'nonveg', 4)
ON CONFLICT (id) DO NOTHING;

-- 8.7 Signature Resort Experiences & Activities
INSERT INTO activities (
  id, resort_id, name, description, short_description,
  pricing_type, price_per_person, price_per_setup, price_per_session,
  duration_minutes, category, image_url, is_available, sort_order
) VALUES
(
  '20000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'The Iconic Bird Cage Dining Experience',
  'Private fairy-lit wrought-iron Bird Cage cabana on the mountain lawn, candlelight table setting, panoramic valley views, and 4-course bespoke Panache dining.',
  'Private fairy-lit bird cage cabana dining with butler service & panoramic mountain views.',
  'per_setup', 0, 2500, 2500,
  150, 'dining',
  'https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200&auto=format&fit=crop&q=80',
  true, 1
),
(
  '20000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'Evening Pine Bonfire & Live Barbecue',
  'Crackling pine wood bonfire on the resort lawn with comfortable lounge seating, live sigri tandoor skewers, marshmallows, warm blankets & private acoustic music.',
  'Cozy mountain lawn bonfire with live barbecue skewers, marshmallows & acoustic vibes.',
  'per_setup', 0, 1500, 1500,
  120, 'outdoor',
  'https://images.unsplash.com/photo-1470246973918-29a93221c455?w=1200&auto=format&fit=crop&q=80',
  true, 2
),
(
  '20000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000001',
  'PlayStation 5 (PS5) 4K Ultra Gaming Lounge',
  'Exclusive 1-hour session in the resort gaming lounge on a 65" 4K HDR display with Sony PS5, FIFA 24, Gran Turismo 7, Spider-Man, oversized beanbags & Panache finger food.',
  'PS5 4K gaming lounge with FIFA, racing wheels, wireless controllers & snacks.',
  'per_session', 0, 0, 600,
  60, 'indoor',
  'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=1200&auto=format&fit=crop&q=80',
  true, 3
),
(
  '20000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000001',
  'Guided Kasar Devi & Pine Forest Ridge Trek',
  '2.5-hour nature trek through ancient deodar and pine ridges, visiting mystical Kasar Devi temple, hidden viewpoints, and Himalayan flora with our local resident naturalist.',
  'Morning deodar ridge walk with resident naturalist, tea stop & panoramic views.',
  'per_person', 600, 0, 0,
  150, 'outdoor',
  'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&auto=format&fit=crop&q=80',
  true, 4
),
(
  '20000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000001',
  'Himalayan Ayurvedic Spa Therapy',
  'Signature 60-minute rejuvenating full-body massage using warm organic Himalayan cedarwood, almond & apricot oils, followed by steam and herbal tea.',
  'Relaxing cedarwood oil body massage and herbal steam therapy.',
  'per_person', 2500, 0, 0,
  60, 'wellness',
  'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&auto=format&fit=crop&q=80',
  true, 5
),
(
  '20000000-0000-0000-0000-000000000006',
  '00000000-0000-0000-0000-000000000001',
  'Sunrise Mountain Meditation & Yoga',
  'Guided morning pranayama, Surya Namaskar, and deep restorative meditation on the scenic sunrise deck overlooking Trishul & Nanda Devi peaks.',
  'Morning sunrise deck yoga, guided breathwork and meditation with mountain views.',
  'per_person', 500, 0, 0,
  75, 'wellness',
  'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&auto=format&fit=crop&q=80',
  true, 6
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  short_description = EXCLUDED.short_description,
  pricing_type = EXCLUDED.pricing_type,
  price_per_person = EXCLUDED.price_per_person,
  price_per_setup = EXCLUDED.price_per_setup,
  price_per_session = EXCLUDED.price_per_session,
  category = EXCLUDED.category,
  image_url = EXCLUDED.image_url;

-- 8.8 Activity Time Slots
INSERT INTO activity_time_slots (activity_id, label, start_time, end_time, max_capacity_override) VALUES
('20000000-0000-0000-0000-000000000001', 'Sunset Dinner Slot', '18:30:00', '21:00:00', 4),
('20000000-0000-0000-0000-000000000001', 'Starlight Night Slot', '21:15:00', '23:45:00', 4),
('20000000-0000-0000-0000-000000000002', 'Dusk Bonfire Session', '18:00:00', '20:00:00', 12),
('20000000-0000-0000-0000-000000000002', 'Late Night Bonfire Session', '20:30:00', '22:30:00', 12),
('20000000-0000-0000-0000-000000000003', 'Afternoon Gaming (15:00 - 16:00)', '15:00:00', '16:00:00', 4),
('20000000-0000-0000-0000-000000000003', 'Evening Gaming (17:00 - 18:00)', '17:00:00', '18:00:00', 4),
('20000000-0000-0000-0000-000000000004', 'Morning Trek (07:00 - 09:30)', '07:00:00', '09:30:00', 20),
('20000000-0000-0000-0000-000000000005', 'Morning Spa (10:00 - 11:00)', '10:00:00', '11:00:00', 2),
('20000000-0000-0000-0000-000000000005', 'Afternoon Spa (16:00 - 17:00)', '16:00:00', '17:00:00', 2),
('20000000-0000-0000-0000-000000000006', 'Sunrise Yoga (06:30 - 07:45)', '06:30:00', '07:45:00', 25)
ON CONFLICT DO NOTHING;

-- 8.9 Inventory Items
INSERT INTO inventory_items (resort_id, name, category, unit, low_stock_alert_threshold) VALUES
('00000000-0000-0000-0000-000000000001', 'Basmati Rice', 'grains', 'kg', 20),
('00000000-0000-0000-0000-000000000001', 'Atta (Wheat Flour)', 'grains', 'kg', 15),
('00000000-0000-0000-0000-000000000001', 'Fresh Paneer', 'dairy', 'kg', 5),
('00000000-0000-0000-0000-000000000001', 'Full Cream Milk', 'dairy', 'litre', 15),
('00000000-0000-0000-0000-000000000001', 'Butter', 'dairy', 'kg', 4),
('00000000-0000-0000-0000-000000000001', 'Farm Eggs', 'dairy', 'piece', 60),
('00000000-0000-0000-0000-000000000001', 'Fresh Chicken', 'meat', 'kg', 10),
('00000000-0000-0000-0000-000000000001', 'Mutton', 'meat', 'kg', 6),
('00000000-0000-0000-0000-000000000001', 'Onions', 'vegetables', 'kg', 20),
('00000000-0000-0000-0000-000000000001', 'Tomatoes', 'vegetables', 'kg', 15),
('00000000-0000-0000-0000-000000000001', 'Potatoes', 'vegetables', 'kg', 25),
('00000000-0000-0000-0000-000000000001', 'Refined Cooking Oil', 'grains', 'litre', 10),
('00000000-0000-0000-0000-000000000001', 'Himalayan Black Tea', 'beverages', 'packet', 5),
('00000000-0000-0000-0000-000000000001', 'Coffee Beans / Powder', 'beverages', 'kg', 3),
('00000000-0000-0000-0000-000000000001', 'Mineral Water (1L)', 'beverages', 'piece', 100)
ON CONFLICT DO NOTHING;

-- Initial Inward Stock
INSERT INTO stock_inward (resort_id, item_id, quantity, supplier_name, notes)
SELECT
  ii.resort_id,
  ii.id,
  CASE
    WHEN ii.name = 'Basmati Rice' THEN 50
    WHEN ii.name = 'Atta (Wheat Flour)' THEN 40
    WHEN ii.name = 'Fresh Paneer' THEN 12
    WHEN ii.name = 'Full Cream Milk' THEN 30
    WHEN ii.name = 'Butter' THEN 10
    WHEN ii.name = 'Farm Eggs' THEN 120
    WHEN ii.name = 'Fresh Chicken' THEN 25
    WHEN ii.name = 'Mutton' THEN 15
    WHEN ii.name = 'Onions' THEN 50
    WHEN ii.name = 'Tomatoes' THEN 35
    WHEN ii.name = 'Potatoes' THEN 60
    WHEN ii.name = 'Refined Cooking Oil' THEN 30
    WHEN ii.name = 'Mineral Water (1L)' THEN 200
    ELSE 10
  END,
  'Almora Local Mandi & Dairy Supplier',
  'Initial kitchen provisions'
FROM inventory_items ii
ON CONFLICT DO NOTHING;


-- ── 8.10 INITIAL ACTIVE GUEST & SAMPLE LIVE ORDER (ROOM 204) ────
DO $$
DECLARE
  v_resort_id UUID := '00000000-0000-0000-0000-000000000001'::UUID;
  v_room_id   UUID;
  v_guest_id  UUID;
  v_order_id  UUID;
BEGIN
  -- Find Room 204
  SELECT id INTO v_room_id FROM rooms WHERE room_number = '204' AND resort_id = v_resort_id;

  IF v_room_id IS NOT NULL THEN
    -- Insert active resident guest
    INSERT INTO guests (
      id, resort_id, room_id, guest_name, guest_phone, email,
      number_of_adults, check_in_date, expected_checkout, status, notes
    ) VALUES (
      '30000000-0000-0000-0000-000000000001'::UUID,
      v_resort_id,
      v_room_id,
      'Abhay Sharma',
      '9876543210',
      'abhay.guest@shivalaya.com',
      2,
      CURRENT_DATE,
      CURRENT_DATE + INTERVAL '3 days',
      'checked_in',
      'VIP guest - Mountain valley view room requested'
    ) ON CONFLICT (id) DO UPDATE SET status = 'checked_in';

    -- Mark room occupied
    UPDATE rooms
    SET is_occupied = TRUE, current_guest_id = '30000000-0000-0000-0000-000000000001'::UUID
    WHERE id = v_room_id;

    -- Create persistent guest session
    INSERT INTO guest_sessions (
      token, guest_id, room_id, room_number,
      guest_name, guest_phone, resort_id, is_active, expires_at
    ) VALUES (
      'live-shivalaya-resort-guest-204',
      '30000000-0000-0000-0000-000000000001'::UUID,
      v_room_id,
      '204',
      'Abhay Sharma',
      '9876543210',
      v_resort_id,
      TRUE,
      now() + INTERVAL '7 days'
    ) ON CONFLICT (token) DO UPDATE SET is_active = TRUE;

    -- Create 1 live order so Kitchen Panel and Reception immediately display data
    INSERT INTO orders (
      id, order_number, resort_id, guest_id, room_id, room_number,
      service_type, guest_name, guest_phone, items,
      subtotal, tax_amount, grand_total, total_amount, payment_status,
      status, special_note, created_at
    ) VALUES (
      '40000000-0000-0000-0000-000000000001'::UUID,
      'PAN-00101',
      v_resort_id,
      '30000000-0000-0000-0000-000000000001'::UUID,
      v_room_id,
      '204',
      'room_service',
      'Abhay Sharma',
      '9876543210',
      '[
        {"id": "item-kadahi-paneer", "name": "Kadahi Paneer", "price": 550, "qty": 1, "item_type": "veg"},
        {"id": "item-dal-makhani", "name": "Dal Makhani", "price": 500, "qty": 1, "item_type": "veg"},
        {"id": "item-butter-naan", "name": "Butter Plain Naan", "price": 70, "qty": 3, "item_type": "veg"}
      ]'::jsonb,
      1260,
      63,
      1323,
      1323,
      'folio',
      'preparing',
      'Medium spicy, deliver hot with extra green chillies and mint chutney',
      now() - INTERVAL '15 minutes'
    ) ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- ==============================================================================
-- SETUP COMPLETE
-- All tables, sequences, views, RPCs, RLS policies, Realtime publications,
-- and seed records are active.
-- ==============================================================================
