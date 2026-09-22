-- =============================================================
-- 013_sprint5_updates.sql
-- Guest Session Locking + Kitchen Inventory & Stock Management
-- =============================================================

-- ─── EXTENSIONS ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ═══════════════════════════════════════════════════════════════
-- PART A: GUEST SESSIONS
-- Each active guest gets a cryptographically random URL token
-- that locks their identity (guest_id + room_id) until checkout.
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS guest_sessions (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  token           TEXT        UNIQUE NOT NULL,          -- 64-char hex, unguessable
  guest_id        UUID        REFERENCES guests(id) ON DELETE CASCADE,
  room_id         UUID        REFERENCES rooms(id)  ON DELETE CASCADE,
  room_number     TEXT        NOT NULL,
  guest_name      TEXT        NOT NULL,
  guest_phone     TEXT,
  resort_id       UUID        REFERENCES resorts(id) ON DELETE CASCADE,
  is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at      TIMESTAMPTZ,                          -- set to check_out expected date
  deactivated_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_guest_sessions_token     ON guest_sessions(token)   WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_guest_sessions_guest_id  ON guest_sessions(guest_id);

-- RLS
ALTER TABLE guest_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY guest_sessions_anon_read ON guest_sessions FOR SELECT USING (TRUE); -- token is already unguessable
CREATE POLICY guest_sessions_staff_all ON guest_sessions FOR ALL USING (auth.role() IN ('authenticated'));

-- ─── RESOLVE SESSION RPC ────────────────────────────────────────
-- Called by Guest Portal on page load to validate a token.
CREATE OR REPLACE FUNCTION resolve_guest_session(p_token TEXT)
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
    'valid',       true,
    'guest_id',    v_session.guest_id,
    'room_id',     v_session.room_id,
    'room_number', v_session.room_number,
    'guest_name',  v_session.guest_name,
    'guest_phone', v_session.guest_phone,
    'resort_id',   v_session.resort_id
  );
END;
$$;

-- ─── UPGRADE check_in_guest → generate session token ─────────────
CREATE OR REPLACE FUNCTION check_in_guest(
  p_room_number   TEXT,
  p_guest_name    TEXT,
  p_guest_phone   TEXT,
  p_guest_email   TEXT   DEFAULT NULL,
  p_check_in_date DATE   DEFAULT CURRENT_DATE,
  p_check_out_date DATE  DEFAULT NULL,
  p_resort_id     UUID   DEFAULT NULL
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
  v_session_token TEXT;
BEGIN
  -- Resolve resort
  v_resort_id := COALESCE(p_resort_id, (SELECT id FROM resorts LIMIT 1));

  -- Validate & lock room
  SELECT id INTO v_room_id
  FROM rooms
  WHERE room_number = p_room_number
    AND resort_id   = v_resort_id
    AND status      = 'available'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'ROOM_UNAVAILABLE', 'message', 'Room not found or already occupied.');
  END IF;

  -- Create guest record
  INSERT INTO guests (resort_id, name, phone, email, check_in_date, check_out_date, status)
  VALUES (v_resort_id, p_guest_name, p_guest_phone, p_guest_email, p_check_in_date, p_check_out_date, 'checked_in')
  RETURNING id INTO v_guest_id;

  -- Mark room occupied
  UPDATE rooms
  SET status           = 'occupied',
      current_guest_id = v_guest_id
  WHERE id = v_room_id;

  -- Generate unguessable session token
  v_session_token := encode(gen_random_bytes(32), 'hex');

  INSERT INTO guest_sessions (token, guest_id, room_id, room_number, guest_name, guest_phone, resort_id, expires_at)
  VALUES (
    v_session_token,
    v_guest_id,
    v_room_id,
    p_room_number,
    p_guest_name,
    p_guest_phone,
    v_resort_id,
    CASE WHEN p_check_out_date IS NOT NULL THEN (p_check_out_date + INTERVAL '23 hours 59 minutes') ELSE NULL END
  );

  RETURN jsonb_build_object(
    'success',       true,
    'guest_id',      v_guest_id,
    'room_id',       v_room_id,
    'session_token', v_session_token
  );
END;
$$;

-- ─── UPGRADE check_out_guest → deactivate session ─────────────────
CREATE OR REPLACE FUNCTION check_out_guest(
  p_guest_id    UUID,
  p_resort_id   UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_room_id UUID;
BEGIN
  -- Get room
  SELECT id INTO v_room_id FROM rooms WHERE current_guest_id = p_guest_id LIMIT 1;

  -- Mark guest checked out
  UPDATE guests
  SET status         = 'checked_out',
      check_out_date = CURRENT_DATE
  WHERE id = p_guest_id;

  -- Free the room
  IF FOUND THEN
    UPDATE rooms
    SET status           = 'available',
        current_guest_id = NULL
    WHERE id = v_room_id;
  END IF;

  -- Deactivate all sessions for this guest
  UPDATE guest_sessions
  SET is_active      = FALSE,
      deactivated_at = now()
  WHERE guest_id = p_guest_id
    AND is_active = TRUE;

  RETURN jsonb_build_object('success', true, 'guest_id', p_guest_id);
END;
$$;

-- ─── UPGRADE create_order → accept optional session token ──────────
-- If p_session_token provided, resolve room/guest internally.
-- If NULL, fall back to p_room_number (reception desk manual order).
CREATE OR REPLACE FUNCTION create_order(
  p_resort_id      UUID,
  p_service_type   TEXT,
  p_guest_name     TEXT,
  p_guest_phone    TEXT,
  p_items          JSONB,
  p_subtotal       NUMERIC,
  p_room_number    TEXT   DEFAULT NULL,
  p_table_number   TEXT   DEFAULT NULL,
  p_special_note   TEXT   DEFAULT NULL,
  p_session_token  TEXT   DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id     UUID;
  v_order_number TEXT;
  v_guest_id     UUID;
  v_room_id      UUID;
  v_room_number  TEXT := p_room_number;
  v_guest_name   TEXT := p_guest_name;
  v_guest_phone  TEXT := p_guest_phone;
  v_session      JSONB;
BEGIN
  -- Resolve session if token provided
  IF p_session_token IS NOT NULL THEN
    v_session := resolve_guest_session(p_session_token);
    IF NOT (v_session->>'valid')::BOOLEAN THEN
      RETURN jsonb_build_object('success', false, 'error', 'SESSION_EXPIRED', 'message', 'Guest session has expired. Please ask reception to re-scan.');
    END IF;
    v_guest_id    := (v_session->>'guest_id')::UUID;
    v_room_id     := (v_session->>'room_id')::UUID;
    v_room_number := v_session->>'room_number';
    v_guest_name  := v_session->>'guest_name';
    v_guest_phone := v_session->>'guest_phone';
  ELSIF v_room_number IS NOT NULL THEN
    SELECT id, current_guest_id INTO v_room_id, v_guest_id
    FROM rooms WHERE room_number = v_room_number AND resort_id = p_resort_id;
  END IF;

  -- Generate order number
  v_order_number := 'ORD-' || to_char(nextval('order_number_seq'), 'FM00000');

  -- Insert order
  INSERT INTO orders (
    resort_id, order_number, service_type,
    guest_id, room_id, room_number, table_number,
    guest_name, guest_phone,
    items, subtotal, total_amount,
    special_note, status
  ) VALUES (
    p_resort_id, v_order_number, p_service_type,
    v_guest_id, v_room_id, v_room_number, p_table_number,
    v_guest_name, v_guest_phone,
    p_items, p_subtotal, p_subtotal,
    p_special_note, 'new'
  )
  RETURNING id INTO v_order_id;

  RETURN jsonb_build_object(
    'success',      true,
    'order_id',     v_order_id,
    'order_number', v_order_number
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', 'SERVER_ERROR', 'message', SQLERRM);
END;
$$;

-- ─── UPGRADE book_activity_slot → accept optional session token ────
CREATE OR REPLACE FUNCTION book_activity_slot(
  p_activity_id    UUID,
  p_slot_id        UUID,
  p_booking_date   DATE,
  p_number_guests  INT,
  p_guest_name     TEXT,
  p_guest_phone    TEXT,
  p_room_number    TEXT   DEFAULT NULL,
  p_special_requests TEXT DEFAULT NULL,
  p_session_token  TEXT   DEFAULT NULL
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
  -- Advisory lock to prevent double-booking
  v_lock_key := hashtext(p_slot_id::text || p_booking_date::text);
  PERFORM pg_advisory_xact_lock(v_lock_key);

  -- Resolve session if token provided
  IF p_session_token IS NOT NULL THEN
    v_session := resolve_guest_session(p_session_token);
    IF NOT (v_session->>'valid')::BOOLEAN THEN
      RETURN jsonb_build_object('success', false, 'error', 'SESSION_EXPIRED', 'message', 'Guest session has expired. Please ask reception to re-scan.');
    END IF;
    v_guest_id    := (v_session->>'guest_id')::UUID;
    v_room_id     := (v_session->>'room_id')::UUID;
    v_room_number := v_session->>'room_number';
    v_guest_name  := v_session->>'guest_name';
    v_guest_phone := v_session->>'guest_phone';
  ELSIF v_room_number IS NOT NULL THEN
    SELECT id, current_guest_id INTO v_room_id, v_guest_id
    FROM rooms WHERE room_number = v_room_number;
  END IF;

  -- Check capacity
  SELECT capacity INTO v_capacity FROM activity_time_slots WHERE id = p_slot_id;
  SELECT COUNT(*) INTO v_booked_count
  FROM activity_bookings
  WHERE slot_id = p_slot_id AND booking_date = p_booking_date AND status NOT IN ('cancelled');

  IF (v_booked_count + p_number_guests) > v_capacity THEN
    RETURN jsonb_build_object('success', false, 'error', 'SLOT_FULL', 'message', 'No spots available for this slot.');
  END IF;

  -- Pricing snapshot
  SELECT pricing_type, price_per_person INTO v_pricing_type, v_unit_price
  FROM activities WHERE id = p_activity_id;

  IF v_pricing_type = 'per_person' THEN
    v_total_amount := v_unit_price * p_number_guests;
  ELSE
    v_total_amount := v_unit_price;
  END IF;

  -- Generate booking number
  v_booking_number := 'EXP-' || to_char(nextval('booking_number_seq'), 'FM00000');

  -- Insert booking
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
    v_pricing_type, v_unit_price, v_total_amount,
    'pending', p_special_requests
  )
  RETURNING id INTO v_booking_id;

  RETURN jsonb_build_object(
    'success', true,
    'booking_id', v_booking_id,
    'booking_number', v_booking_number,
    'total_amount', v_total_amount
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', 'SERVER_ERROR', 'message', SQLERRM);
END;
$$;


-- ═══════════════════════════════════════════════════════════════
-- PART B: KITCHEN INVENTORY & STOCK MANAGEMENT
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS inventory_items (
  id                       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  resort_id                UUID        REFERENCES resorts(id) ON DELETE CASCADE,
  name                     TEXT        NOT NULL,
  category                 TEXT        NOT NULL,   -- 'dairy','vegetables','grains','beverages','utensils','cleaning','other'
  unit                     TEXT        NOT NULL,   -- 'kg','litre','piece','dozen','packet'
  low_stock_alert_threshold NUMERIC    NOT NULL DEFAULT 0,
  notes                    TEXT,
  is_active                BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stock_inward (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  resort_id      UUID        REFERENCES resorts(id) ON DELETE CASCADE,
  item_id        UUID        REFERENCES inventory_items(id) ON DELETE CASCADE,
  quantity       NUMERIC     NOT NULL CHECK (quantity > 0),
  unit_cost      NUMERIC,                               -- owner-only field, kitchen staff cannot see
  invoice_number TEXT,
  supplier_name  TEXT,
  notes          TEXT,
  logged_by      UUID        REFERENCES staff(id),
  logged_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stock_consumption (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  resort_id      UUID        REFERENCES resorts(id) ON DELETE CASCADE,
  item_id        UUID        REFERENCES inventory_items(id) ON DELETE CASCADE,
  quantity       NUMERIC     NOT NULL,                 -- negative allowed for corrections
  reason         TEXT        NOT NULL DEFAULT 'daily_use',  -- 'daily_use','wastage','breakage','correction','event'
  notes          TEXT,
  logged_by      UUID        REFERENCES staff(id),
  logged_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Computed view: current stock per item
CREATE OR REPLACE VIEW current_stock AS
SELECT
  ii.id              AS item_id,
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
  END                AS is_low_stock
FROM inventory_items ii
LEFT JOIN stock_inward      si ON si.item_id = ii.id
LEFT JOIN stock_consumption sc ON sc.item_id = ii.id
WHERE ii.is_active = TRUE
GROUP BY ii.id, ii.resort_id, ii.name, ii.category, ii.unit, ii.low_stock_alert_threshold;

-- RLS
ALTER TABLE inventory_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_inward     ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_consumption ENABLE ROW LEVEL SECURITY;

-- Kitchen can read all, write inward+consumption, cannot delete
CREATE POLICY inv_items_read        ON inventory_items  FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY inv_items_owner_write ON inventory_items  FOR ALL    TO authenticated USING (TRUE);

CREATE POLICY stock_inward_read     ON stock_inward     FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY stock_inward_insert   ON stock_inward     FOR INSERT TO authenticated WITH CHECK (TRUE);

CREATE POLICY stock_cons_read       ON stock_consumption FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY stock_cons_insert     ON stock_consumption FOR INSERT TO authenticated WITH CHECK (TRUE);

-- ─── SEED SAMPLE INVENTORY ITEMS ────────────────────────────────
-- (Safe to run multiple times — uses ON CONFLICT DO NOTHING)
INSERT INTO inventory_items (resort_id, name, category, unit, low_stock_alert_threshold)
SELECT r.id, v.name, v.category, v.unit, v.threshold
FROM resorts r,
(VALUES
  ('Full Cream Milk',   'dairy',      'litre',  10),
  ('Paneer',            'dairy',      'kg',     2),
  ('Butter',            'dairy',      'kg',     1),
  ('Tomatoes',          'vegetables', 'kg',     5),
  ('Onions',            'vegetables', 'kg',     10),
  ('Potatoes',          'vegetables', 'kg',     10),
  ('Basmati Rice',      'grains',     'kg',     20),
  ('Atta (Wheat Flour)','grains',     'kg',     15),
  ('Cooking Oil',       'grains',     'litre',  5),
  ('Tea Bags',          'beverages',  'packet', 3),
  ('Coffee Powder',     'beverages',  'kg',     1),
  ('Mineral Water',     'beverages',  'piece',  50),
  ('Dinner Plates',     'utensils',   'piece',  5),
  ('Tea Cups',          'utensils',   'piece',  5),
  ('Glasses',           'utensils',   'piece',  5)
) AS v(name, category, unit, threshold)
ON CONFLICT DO NOTHING;
