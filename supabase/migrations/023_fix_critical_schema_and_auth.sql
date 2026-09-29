-- =============================================================
-- 023_fix_critical_schema_and_auth.sql
-- Production Audit Critical Fixes
--
-- Fixes:
--  1. check_in_guest: correct column names (guest_name, guest_phone,
--     is_occupied, expected_checkout) + add email column to guests
--  2. verify_guest_otp: correct column names (guest_phone, guest_name)
--  3. Restrict staff table SELECT for anon (hide pin_hash via staff_public view)
--  4. Add supabase_email column to staff table
--  5. Performance: Add booking_date index to activity_bookings
--  6. Restrict guest_sessions SELECT to anon by token (prevent table scraping)
--  7. Robust DB PIN verification: verify_staff_pin & verify_staff_pin_any
--  8. Canonical resolve_guest_session (SECURITY DEFINER)
-- =============================================================

-- ─── 1. ADD MISSING COLUMNS TO guests TABLE ──────────────────
-- Ensure email and check_out_date exist on guests
ALTER TABLE guests
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS check_out_date DATE GENERATED ALWAYS AS (expected_checkout) STORED;

-- Add phone indexes for fast OTP & guest lookup
CREATE INDEX IF NOT EXISTS idx_guests_phone ON guests(guest_phone);
CREATE INDEX IF NOT EXISTS idx_guests_phone_status ON guests(guest_phone, status);

-- ─── 2. ADD supabase_email TO staff TABLE ─────────────────────
ALTER TABLE staff
  ADD COLUMN IF NOT EXISTS supabase_email TEXT;

-- ─── 3. CANONICAL check_in_guest ──────────────────────────────
-- Fixes: uses correct column names (guest_name, guest_phone,
-- is_occupied, expected_checkout) and correct rooms query.
-- Drop previous signatures to eliminate ambiguity
DROP FUNCTION IF EXISTS public.check_in_guest(uuid, uuid, text, text, integer, date, text);
DROP FUNCTION IF EXISTS public.check_in_guest(text, text, text, text, date, date, uuid);
DROP FUNCTION IF EXISTS public.check_in_guest(uuid, uuid, text, text, integer, date, text, text);

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
AS 
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

  -- Resolve resort
  v_resort_id := COALESCE(p_resort_id, (SELECT id FROM resorts LIMIT 1));

  -- Resolve room by either room_id or room_number (checking is_occupied = FALSE)
  IF p_room_id IS NOT NULL THEN
    SELECT id, room_number INTO v_room_id, v_room_number
    FROM rooms
    WHERE id = p_room_id
      AND resort_id = v_resort_id
      AND is_occupied = FALSE;
  ELSIF p_room_number IS NOT NULL THEN
    SELECT id, room_number INTO v_room_id, v_room_number
    FROM rooms
    WHERE room_number = p_room_number
      AND resort_id   = v_resort_id
      AND is_occupied = FALSE;
  END IF;

  IF v_room_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error',   'ROOM_UNAVAILABLE',
      'message', 'Room not found or already occupied.'
    );
  END IF;

  -- Deactivate any existing active sessions for this room (safety)
  UPDATE guest_sessions
  SET is_active = FALSE, deactivated_at = now()
  WHERE room_id = v_room_id AND is_active = TRUE;

  -- Create guest record using CORRECT column names:
  -- guest_name, guest_phone, email, number_of_adults, check_in_date, expected_checkout
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

  -- Mark room occupied using is_occupied = TRUE
  UPDATE rooms
  SET is_occupied = TRUE, current_guest_id = v_guest_id
  WHERE id = v_room_id;

  -- Generate unguessable session token
  v_session_token := encode(gen_random_bytes(32), 'hex');

  INSERT INTO guest_sessions (
    token, guest_id, room_id, room_number,
    guest_name, guest_phone, resort_id,
    is_active, expires_at
  ) VALUES (
    v_session_token,
    v_guest_id,
    v_room_id,
    v_room_number,
    p_guest_name,
    p_guest_phone,
    v_resort_id,
    TRUE,
    CASE
      WHEN p_expected_checkout IS NOT NULL
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
  RETURN jsonb_build_object(
    'success', false,
    'error',   'SERVER_ERROR',
    'message', SQLERRM
  );
END;
;

GRANT EXECUTE ON FUNCTION public.check_in_guest(UUID, UUID, TEXT, TEXT, TEXT, TEXT, INTEGER, DATE, TEXT) TO authenticated;


-- ─── 4. CANONICAL verify_guest_otp ──────────────────────────────
-- Fixes: uses correct column names:
--   guest_phone (not phone)
--   guest_name  (not name)
DROP FUNCTION IF EXISTS public.verify_guest_otp(text, text);

CREATE OR REPLACE FUNCTION public.verify_guest_otp(
  p_phone    TEXT,
  p_otp_code TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS 
DECLARE
  v_otp_row       guest_phone_otp%ROWTYPE;
  v_guest         guests%ROWTYPE;
  v_room_number   TEXT;
  v_session_token TEXT;
  v_session_row   guest_sessions%ROWTYPE;
  v_guest_name    TEXT;
BEGIN
  -- Find a valid, unused OTP for this phone
  SELECT * INTO v_otp_row
  FROM guest_phone_otp
  WHERE phone      = p_phone
    AND used       = FALSE
    AND expires_at > now()
    AND otp_hash   = crypt(p_otp_code, otp_hash)
  ORDER BY created_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error',   'INVALID_OR_EXPIRED_OTP'
    );
  END IF;

  -- Mark OTP consumed
  UPDATE guest_phone_otp SET used = TRUE WHERE id = v_otp_row.id;

  -- Check if this phone belongs to a currently checked-in resort guest
  -- FIXED: use correct column name guest_phone (not phone)
  SELECT * INTO v_guest
  FROM guests g
  WHERE g.guest_phone = p_phone
    AND g.status      = 'checked_in'
  ORDER BY g.check_in_date DESC
  LIMIT 1;

  IF FOUND THEN
    -- Get their room number
    SELECT r.room_number INTO v_room_number
    FROM rooms r
    WHERE r.current_guest_id = v_guest.id
    LIMIT 1;

    -- Re-use or create their guest_session
    SELECT * INTO v_session_row
    FROM guest_sessions
    WHERE guest_id = v_guest.id
      AND is_active = TRUE
      AND (expires_at IS NULL OR expires_at > now())
    ORDER BY created_at DESC
    LIMIT 1;

    IF NOT FOUND THEN
      -- Create a fresh session
      v_session_token := encode(gen_random_bytes(32), 'hex');
      INSERT INTO guest_sessions (
        token, guest_id, room_id, room_number,
        guest_name, guest_phone, resort_id,
        is_active, expires_at
      )
      SELECT
        v_session_token,
        v_guest.id,
        r.id,
        r.room_number,
        v_guest.guest_name,  -- FIXED: was v_guest.name
        v_guest.guest_phone, -- FIXED: was v_guest.phone
        v_guest.resort_id,
        TRUE,
        CASE WHEN v_guest.expected_checkout IS NOT NULL
             THEN (v_guest.expected_checkout + INTERVAL '23 hours 59 minutes')
             ELSE NULL END
      FROM rooms r
      WHERE r.current_guest_id = v_guest.id
      LIMIT 1;
    ELSE
      v_session_token := v_session_row.token;
      v_room_number   := v_session_row.room_number;
    END IF;

    RETURN jsonb_build_object(
      'success',       true,
      'guest_type',    'resort_guest',
      'session_token', v_session_token,
      'guest_name',    v_guest.guest_name,  -- FIXED: was v_guest.name
      'guest_phone',   v_guest.guest_phone, -- FIXED: was v_guest.phone
      'room_number',   COALESCE(v_room_number, ''),
      'guest_id',      v_guest.id,
      'guest_email',   v_guest.email
    );
  ELSE
    -- Walk-in guest - phone not tied to any checked-in room
    v_session_token := encode(gen_random_bytes(32), 'hex');

    -- Try to get name from previous walk-in sessions for this phone
    SELECT gs.guest_name INTO v_guest_name
    FROM guest_sessions gs
    WHERE gs.guest_phone = p_phone
      AND gs.room_number = ''
    ORDER BY gs.created_at DESC
    LIMIT 1;

    INSERT INTO guest_sessions (
      token, guest_id, room_id, room_number,
      guest_name, guest_phone, resort_id, is_active,
      expires_at
    ) VALUES (
      v_session_token,
      NULL,
      NULL,
      '',
      COALESCE(v_guest_name, p_phone),
      p_phone,
      (SELECT id FROM resorts LIMIT 1),
      TRUE,
      now() + INTERVAL '24 hours'
    );

    RETURN jsonb_build_object(
      'success',       true,
      'guest_type',    'walk_in',
      'session_token', v_session_token,
      'guest_name',    COALESCE(v_guest_name, ''),
      'guest_phone',   p_phone,
      'room_number',   '',
      'guest_id',      NULL,
      'guest_email',   NULL
    );
  END IF;

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error',   'SERVER_ERROR',
    'message', SQLERRM
  );
END;
;

GRANT EXECUTE ON FUNCTION public.verify_guest_otp(TEXT, TEXT) TO anon, authenticated;


-- ─── 5. HARDEN staff TABLE - Restrict SELECT for anon (Hide pin_hash) ───
-- 1. Drop permissive policies that allowed anon to SELECT from staff table
DROP POLICY IF EXISTS prod_read_staff ON staff;
DROP POLICY IF EXISTS public_read_staff ON staff;
DROP POLICY IF EXISTS public_all_staff ON staff;

-- 2. Restrict direct SELECT on staff to authenticated users only
CREATE POLICY prod_staff_read_staff ON staff
  FOR SELECT TO authenticated
  USING (true);

-- 3. Revoke direct SELECT on staff table from anon
REVOKE SELECT ON staff FROM anon;

-- 4. Create safe public view for KDS profile picker (no pin_hash, no email)
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

-- Grant anon and authenticated access to the safe view only
GRANT SELECT ON staff_public TO anon, authenticated;


-- ─── 6. PERFORMANCE: Indexes on activity_bookings & orders ─────────
-- Fast filtering by booking date (resolves Task 10)
CREATE INDEX IF NOT EXISTS idx_act_bookings_date
  ON activity_bookings(booking_date);

-- Composite index for slot availability and capacity checks
CREATE INDEX IF NOT EXISTS idx_act_bookings_slot_date
  ON activity_bookings(slot_id, booking_date)
  WHERE status NOT IN ('cancelled', 'no_show');

CREATE INDEX IF NOT EXISTS idx_act_bookings_guest
  ON activity_bookings(guest_id)
  WHERE guest_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_table_id
  ON orders(table_id)
  WHERE table_id IS NOT NULL;


-- ─── 7. GUEST SESSIONS - Restrict anon read by token ─────────────────
-- Drop overly permissive read policies that allowed full table scraping
DROP POLICY IF EXISTS prod_read_guest_sessions ON guest_sessions;
DROP POLICY IF EXISTS prod_anon_guest_sessions ON guest_sessions;
DROP POLICY IF EXISTS public_all_guest_sessions ON guest_sessions;

-- Authenticated staff can read all guest sessions
CREATE POLICY prod_staff_read_guest_sessions ON guest_sessions
  FOR SELECT TO authenticated
  USING (true);

-- Authenticated staff can write/manage guest sessions
CREATE POLICY prod_staff_write_guest_sessions ON guest_sessions
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Anon CANNOT dump or list all guest sessions.
-- Direct table queries by anon are restricted to only matching their own token:
CREATE POLICY prod_anon_guest_sessions ON guest_sessions
  FOR SELECT TO anon
  USING (
    token = COALESCE(
      current_setting('request.headers', true)::json->>'x-guest-token',
      current_setting('request.headers', true)::json->>'x-session-token',
      NULL
    )
  );


-- ─── 8. CANONICAL resolve_guest_session (SECURITY DEFINER) ───────────
-- Safe RPC for guest portal session token lookup by token
CREATE OR REPLACE FUNCTION public.resolve_guest_session(p_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS 
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
;

GRANT EXECUTE ON FUNCTION public.resolve_guest_session(TEXT) TO anon, authenticated;


-- ─── 9. ROBUST DB PIN VERIFICATION FUNCTIONS ─────────────────────────
-- Individual staff member PIN check
CREATE OR REPLACE FUNCTION public.verify_staff_pin(
  p_staff_id UUID,
  p_pin      TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS 
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
;

-- Global / Quick PIN check across all active staff
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
AS 
BEGIN
  RETURN QUERY
  SELECT s.id, s.name, s.role, s.resort_id
  FROM staff s
  WHERE s.is_active = TRUE
    AND s.pin_hash IS NOT NULL
    AND s.pin_hash = crypt(p_pin, s.pin_hash);
END;
;

GRANT EXECUTE ON FUNCTION public.verify_staff_pin(UUID, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_staff_pin_any(TEXT) TO anon, authenticated;


-- ─── SUMMARY ─────────────────────────────────────────────────
-- ✅ check_in_guest: fixed column names (guest_name, guest_phone, is_occupied, expected_checkout)
-- ✅ verify_guest_otp: fixed column names (guest_phone, guest_name)
-- ✅ staff table: restricted SELECT to authenticated, created staff_public view hiding pin_hash
-- ✅ Activity bookings: added booking_date index and composite slot/date index
-- ✅ Guest sessions: restricted anon SELECT by token (no bulk scraping)
-- ✅ Staff PIN: secure verify_staff_pin and verify_staff_pin_any via pgcrypto bcrypt
-- ✅ resolve_guest_session: secure token resolution for guest portal
