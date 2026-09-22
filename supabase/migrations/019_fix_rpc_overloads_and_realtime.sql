-- Migration 019: Resolve RPC Overload Collisions and Enable Supabase Realtime
-- 1. Drops duplicate/overloaded function signatures that cause PostgREST PGRST203 errors.
-- 2. Aligns create_order and book_activity_slot with the actual DB table schemas.
-- 3. Fixes verify_staff_pin missing column error.
-- 4. Registers core tables in publication supabase_realtime with REPLICA IDENTITY FULL.

-- ── 1. CANONICAL create_order ──────────────────────────────────
DROP FUNCTION IF EXISTS public.create_order(uuid, text, text, text, text, text, jsonb, integer, text);
DROP FUNCTION IF EXISTS public.create_order(uuid, text, text, text, jsonb, numeric, text, text, text, text);

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
  v_order_id     UUID;
  v_order_number TEXT;
  v_guest_id     UUID;
  v_room_id      UUID;
  v_table_id     UUID;
  v_room_number  TEXT := p_room_number;
  v_guest_name   TEXT := p_guest_name;
  v_guest_phone  TEXT := p_guest_phone;
  v_session      JSONB;
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
      v_room_number := COALESCE(v_session->>'room_number', v_room_number);
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
  IF p_table_number IS NOT NULL AND p_table_number != '' THEN
    SELECT id INTO v_table_id
    FROM restaurant_tables
    WHERE resort_id = p_resort_id AND table_number = p_table_number;
  END IF;

  -- Generate order number
  v_order_number := 'PAN-' || to_char(nextval('order_number_seq'), 'FM00000');

  -- Insert order into actual orders table
  INSERT INTO orders (
    order_number, resort_id, guest_id, room_id, table_id,
    service_type, guest_name, guest_phone,
    items, subtotal, status, special_note
  ) VALUES (
    v_order_number, p_resort_id, v_guest_id, v_room_id, v_table_id,
    p_service_type, v_guest_name, v_guest_phone,
    p_items, ROUND(p_subtotal)::integer, 'new', p_special_note
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


-- ── 2. CANONICAL book_activity_slot ────────────────────────────
DROP FUNCTION IF EXISTS public.book_activity_slot(uuid, uuid, date, integer, text, text, text, text);
DROP FUNCTION IF EXISTS public.book_activity_slot(uuid, uuid, date, integer, text, text, text, text, text);

CREATE OR REPLACE FUNCTION public.book_activity_slot(
  p_activity_id      UUID,
  p_slot_id          UUID,
  p_booking_date     DATE,
  p_number_guests    INTEGER,
  p_guest_name       TEXT,
  p_guest_phone      TEXT,
  p_room_number      TEXT DEFAULT NULL,
  p_special_requests TEXT DEFAULT NULL,
  p_session_token    TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_booking_id       UUID;
  v_booking_number   TEXT;
  v_lock_key         BIGINT;
  v_booked_count     INTEGER;
  v_effective_max    INTEGER;
  v_activity         activities%ROWTYPE;
  v_slot             activity_time_slots%ROWTYPE;
  v_pricing_type     TEXT;
  v_unit_price       INTEGER;
  v_total_amount     INTEGER;
  v_room_id          UUID;
  v_guest_id         UUID;
  v_guest_name       TEXT := p_guest_name;
  v_guest_phone      TEXT := p_guest_phone;
  v_room_number      TEXT := p_room_number;
  v_session          JSONB;
BEGIN
  -- Advisory transaction-level lock to prevent double booking
  v_lock_key := hashtext(p_slot_id::text || p_booking_date::text);
  PERFORM pg_advisory_xact_lock(v_lock_key);

  -- Fetch activity and slot
  SELECT * INTO v_activity FROM activities WHERE id = p_activity_id;
  IF NOT FOUND OR NOT v_activity.is_available THEN
    RETURN jsonb_build_object('success', false, 'error', 'ACTIVITY_UNAVAILABLE');
  END IF;

  SELECT * INTO v_slot FROM activity_time_slots WHERE id = p_slot_id AND activity_id = p_activity_id;
  IF NOT FOUND OR NOT v_slot.is_active THEN
    RETURN jsonb_build_object('success', false, 'error', 'SLOT_UNAVAILABLE');
  END IF;

  -- Effective max capacity
  v_effective_max := COALESCE(v_slot.max_capacity_override, v_activity.max_capacity_per_slot, 50);

  -- Current booked count: sum of number_of_guests
  SELECT COALESCE(SUM(number_of_guests), 0) INTO v_booked_count
  FROM activity_bookings
  WHERE slot_id = p_slot_id AND booking_date = p_booking_date AND status NOT IN ('cancelled', 'no_show');

  IF (v_booked_count + p_number_guests) > v_effective_max THEN
    RETURN jsonb_build_object('success', false, 'error', 'SLOT_FULL', 'message', 'No spots available for this slot.');
  END IF;

  -- Resolve session token if present
  IF p_session_token IS NOT NULL AND p_session_token != '' THEN
    SELECT row_to_json(gs)::jsonb INTO v_session
    FROM guest_sessions gs
    WHERE gs.token = p_session_token AND gs.is_active = TRUE
      AND (gs.expires_at IS NULL OR gs.expires_at > now());

    IF v_session IS NOT NULL THEN
      v_guest_id    := (v_session->>'guest_id')::UUID;
      v_room_id     := (v_session->>'room_id')::UUID;
      v_room_number := COALESCE(v_session->>'room_number', v_room_number);
      v_guest_name  := COALESCE(v_session->>'guest_name', v_guest_name);
      v_guest_phone := COALESCE(v_session->>'guest_phone', v_guest_phone);
    END IF;
  END IF;

  -- Resolve room_id and current_guest_id if room_number provided
  IF v_room_id IS NULL AND v_room_number IS NOT NULL AND v_room_number != '' THEN
    SELECT id, current_guest_id INTO v_room_id, v_guest_id
    FROM rooms
    WHERE room_number = v_room_number;
  END IF;

  -- Pricing
  v_pricing_type := v_activity.pricing_type;
  IF v_pricing_type = 'per_person' THEN
    v_unit_price := v_activity.price_per_person;
    v_total_amount := v_unit_price * p_number_guests;
  ELSIF v_pricing_type = 'per_setup' THEN
    v_unit_price := v_activity.price_per_setup;
    v_total_amount := v_unit_price;
  ELSE
    v_unit_price := v_activity.price_per_session;
    v_total_amount := v_unit_price;
  END IF;

  -- Generate booking number
  v_booking_number := 'EXP-' || to_char(nextval('booking_number_seq'), 'FM00000');

  INSERT INTO activity_bookings (
    booking_number, activity_id, slot_id, booking_date,
    guest_id, room_id, guest_name, guest_phone,
    number_of_guests, pricing_type_snapshot, unit_price_snapshot, total_amount,
    status, special_requests
  ) VALUES (
    v_booking_number, p_activity_id, p_slot_id, p_booking_date,
    v_guest_id, v_room_id, v_guest_name, v_guest_phone,
    p_number_guests, v_pricing_type, v_unit_price, v_total_amount,
    'pending', p_special_requests
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


-- ── 3. CANONICAL check_out_guest ───────────────────────────────
DROP FUNCTION IF EXISTS public.check_out_guest(uuid);
DROP FUNCTION IF EXISTS public.check_out_guest(uuid, uuid);

CREATE OR REPLACE FUNCTION public.check_out_guest(
  p_guest_id   UUID,
  p_resort_id  UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_guest guests%ROWTYPE;
BEGIN
  SELECT * INTO v_guest FROM guests WHERE id = p_guest_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'GUEST_NOT_FOUND');
  END IF;

  -- Mark guest checked_out
  UPDATE guests
  SET status = 'checked_out', actual_checkout = now()
  WHERE id = p_guest_id;

  -- Free room
  IF v_guest.room_id IS NOT NULL THEN
    UPDATE rooms
    SET is_occupied = false, current_guest_id = NULL
    WHERE id = v_guest.room_id;
  END IF;

  -- Expire guest sessions
  UPDATE guest_sessions
  SET is_active = false
  WHERE guest_id = p_guest_id;

  RETURN jsonb_build_object('success', true);
END;
$$;


-- ── 4. CANONICAL verify_staff_pin ──────────────────────────────
DROP FUNCTION IF EXISTS public.verify_staff_pin(uuid, text);

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

  IF v_staff.pin_hash = crypt(p_pin, v_staff.pin_hash) THEN
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


-- ── 5. SUPABASE REALTIME PUBLICATION SETUP ─────────────────────
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE orders;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE order_status_log;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE activity_bookings;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE guests;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE inventory_items;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

ALTER TABLE orders REPLICA IDENTITY FULL;
ALTER TABLE order_status_log REPLICA IDENTITY FULL;
ALTER TABLE activity_bookings REPLICA IDENTITY FULL;
ALTER TABLE guests REPLICA IDENTITY FULL;
ALTER TABLE menu_items REPLICA IDENTITY FULL;
ALTER TABLE inventory_items REPLICA IDENTITY FULL;
