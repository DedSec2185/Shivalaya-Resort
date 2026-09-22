-- =============================================================
-- Migration 020: Walk-In Customer Support, Direct Login & Realtime
-- 1. Adds tax, grand_total, and payment settlement tracking to orders
-- 2. Seeds standard restaurant dining tables (T-01 to T-12)
-- 3. Provides direct_guest_login RPC (frictionless auth bypassing SMS OTP)
-- 4. Updates create_order with 5% GST calculation and walk-in payment status
-- 5. Adds settle_walkin_bill RPC for instant restaurant billing
-- 6. Ensures supabase_realtime publication includes orders
-- =============================================================

-- ── 1. ORDERS TABLE COLUMNS ────────────────────────────────────
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS tax_amount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS grand_total NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'folio', 'refunded')),
  ADD COLUMN IF NOT EXISTS payment_method TEXT
    CHECK (payment_method IN ('cash', 'upi', 'card', 'folio', 'other')),
  ADD COLUMN IF NOT EXISTS settled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS settled_by UUID REFERENCES staff(id);

CREATE INDEX IF NOT EXISTS idx_orders_service_type ON orders(service_type);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- ── 2. SEED RESTAURANT TABLES ──────────────────────────────────
INSERT INTO restaurant_tables (resort_id, table_number, capacity, is_occupied)
SELECT 
  '00000000-0000-0000-0000-000000000001'::UUID,
  'T-' || LPAD(i::text, 2, '0'),
  CASE WHEN i IN (1,2,3,4) THEN 2 WHEN i IN (5,6,7,8) THEN 4 ELSE 6 END,
  FALSE
FROM generate_series(1, 12) AS i
ON CONFLICT (resort_id, table_number) DO NOTHING;

-- ── 3. DIRECT GUEST LOGIN RPC (NO SMS OTP REQUIRED) ────────────
CREATE OR REPLACE FUNCTION public.direct_guest_login(
  p_phone        TEXT,
  p_name         TEXT DEFAULT NULL,
  p_guest_type   TEXT DEFAULT 'walk_in',  -- 'walk_in' or 'resort_guest'
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
  v_resort_id     UUID := '00000000-0000-0000-0000-000000000001'::UUID;
BEGIN
  v_session_token := 'live-' || encode(gen_random_bytes(24), 'hex');

  -- If resident room guest, attempt to resolve room and checked-in guest
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
    -- Walk-in customer (dining at restaurant or takeaway)
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

-- ── 4. CANONICAL create_order WITH 5% GST & WALK-IN STATUS ──────
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
BEGIN
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

  -- Resolve room and current guest if room_number provided
  IF v_room_id IS NULL AND v_room_number IS NOT NULL AND v_room_number != '' THEN
    SELECT id, current_guest_id INTO v_room_id, v_guest_id
    FROM rooms
    WHERE resort_id = p_resort_id AND room_number = v_room_number;
  END IF;

  -- Resolve table_id from table_number
  IF v_table_number IS NOT NULL AND v_table_number != '' THEN
    SELECT id INTO v_table_id
    FROM restaurant_tables
    WHERE resort_id = p_resort_id AND table_number = v_table_number;
    
    -- Ensure service_type reflects table dining if not specified
    IF v_service_type IS NULL OR v_service_type = 'room_service' THEN
      v_service_type := 'dine_in';
    END IF;
  END IF;

  -- If no room and no table, default service type to walk_in or takeaway
  IF v_room_id IS NULL AND v_table_id IS NULL AND (v_service_type IS NULL OR v_service_type = 'room_service') THEN
    v_service_type := 'walk_in';
  END IF;

  -- Calculate 5% Restaurant GST (2.5% CGST + 2.5% SGST)
  v_tax_amount := ROUND(COALESCE(p_subtotal, 0) * 0.05, 2);
  v_grand_total := ROUND(COALESCE(p_subtotal, 0) + v_tax_amount, 2);

  -- Payment status: If attached to an active room, marks as 'folio' (charges to room bill).
  -- If walk-in or table dine-in without room, marks as 'pending' for direct settlement.
  IF v_room_id IS NOT NULL THEN
    v_payment_status := 'folio';
  ELSE
    v_payment_status := 'pending';
  END IF;

  -- Generate human-readable order number (e.g. PAN-00042)
  v_order_number := 'PAN-' || to_char(nextval('order_number_seq'), 'FM00000');

  -- Insert order into orders table
  INSERT INTO orders (
    order_number, resort_id, guest_id, room_id, table_id,
    service_type, guest_name, guest_phone,
    items, subtotal, tax_amount, grand_total, payment_status,
    status, special_note
  ) VALUES (
    v_order_number, p_resort_id, v_guest_id, v_room_id, v_table_id,
    v_service_type, v_guest_name, v_guest_phone,
    p_items, ROUND(p_subtotal)::integer, v_tax_amount, v_grand_total, v_payment_status,
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

-- ── 5. SETTLE WALKIN BILL RPC ──────────────────────────────────
CREATE OR REPLACE FUNCTION public.settle_walkin_bill(
  p_order_id        UUID,
  p_payment_method  TEXT DEFAULT 'cash',
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
      settled_by     = p_staff_id,
      updated_at     = now()
  WHERE id = p_order_id;

  RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', 'SETTLE_ERROR', 'message', SQLERRM);
END;
$$;

-- ── 6. REALTIME REGISTRATION ───────────────────────────────────
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
END $$;

ALTER TABLE orders REPLICA IDENTITY FULL;
ALTER TABLE restaurant_tables REPLICA IDENTITY FULL;
