-- =============================================================
-- 016_guest_otp_auth.sql
-- Phone-based Guest OTP Authentication
-- Fast2SMS for OTP delivery, room auto-resolved from phone
-- =============================================================

-- Short-lived OTP codes for guest portal login
CREATE TABLE IF NOT EXISTS guest_phone_otp (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  phone       TEXT        NOT NULL,
  otp_hash    TEXT        NOT NULL,          -- pgcrypto bcrypt hash
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '10 minutes'),
  used        BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_guest_otp_phone ON guest_phone_otp(phone, used, expires_at);

-- Anon can insert (requesting OTP) and read their own
ALTER TABLE guest_phone_otp ENABLE ROW LEVEL SECURITY;
CREATE POLICY guest_otp_anon_insert ON guest_phone_otp FOR INSERT WITH CHECK (TRUE);
CREATE POLICY guest_otp_anon_select ON guest_phone_otp FOR SELECT USING (TRUE);
CREATE POLICY guest_otp_anon_update ON guest_phone_otp FOR UPDATE USING (TRUE);

-- ─── RPC: request_guest_otp ─────────────────────────────────
-- Called by Edge Function after Fast2SMS is triggered.
-- Stores hashed OTP so the Edge Function doesn't need DB write rights.
-- Edge Function: generates OTP → calls this RPC → calls Fast2SMS
CREATE OR REPLACE FUNCTION request_guest_otp(
  p_phone    TEXT,
  p_otp_code TEXT        -- plain 6-digit code, we hash it here
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Invalidate any existing unused OTPs for this phone
  UPDATE guest_phone_otp
  SET used = TRUE
  WHERE phone = p_phone AND used = FALSE AND expires_at > now();

  -- Store new hashed OTP
  INSERT INTO guest_phone_otp (phone, otp_hash)
  VALUES (p_phone, crypt(p_otp_code, gen_salt('bf')));

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ─── RPC: verify_guest_otp ──────────────────────────────────
-- Called from browser after user enters OTP.
-- Returns guest session data. Creates walk-in session if phone
-- not found in checked-in guests.
CREATE OR REPLACE FUNCTION verify_guest_otp(
  p_phone    TEXT,
  p_otp_code TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_otp_row       guest_phone_otp%ROWTYPE;
  v_guest         guests%ROWTYPE;
  v_room_number   TEXT;
  v_session_token TEXT;
  v_session_row   guest_sessions%ROWTYPE;
BEGIN
  -- Find a valid, unused OTP for this phone
  SELECT * INTO v_otp_row
  FROM guest_phone_otp
  WHERE phone      = p_phone
    AND used       = FALSE
    AND expires_at > now()
    AND otp_hash   = crypt(p_otp_code, otp_hash)   -- bcrypt verify
  ORDER BY created_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'INVALID_OR_EXPIRED_OTP');
  END IF;

  -- Mark OTP consumed
  UPDATE guest_phone_otp SET used = TRUE WHERE id = v_otp_row.id;

  -- ── Check if this phone belongs to a currently checked-in resort guest ──
  SELECT g.* INTO v_guest
  FROM guests g
  WHERE g.phone = p_phone
    AND g.status = 'checked_in'
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
        expires_at
      )
      SELECT
        v_session_token,
        v_guest.id,
        r.id,
        r.room_number,
        v_guest.name,
        v_guest.phone,
        v_guest.resort_id,
        CASE WHEN v_guest.check_out_date IS NOT NULL
             THEN (v_guest.check_out_date + INTERVAL '23 hours 59 minutes')
             ELSE NULL END
      FROM rooms r
      WHERE r.current_guest_id = v_guest.id
      LIMIT 1;
    ELSE
      v_session_token := v_session_row.token;
      v_room_number   := v_session_row.room_number;
    END IF;

    RETURN jsonb_build_object(
      'success',        true,
      'guest_type',     'resort_guest',
      'session_token',  v_session_token,
      'guest_name',     v_guest.name,
      'guest_phone',    v_guest.phone,
      'room_number',    COALESCE(v_room_number, ''),
      'guest_id',       v_guest.id
    );
  ELSE
    -- ── Walk-in guest — phone not tied to any room ──
    -- Create a lightweight session with no room
    v_session_token := encode(gen_random_bytes(32), 'hex');

    -- Try to get name from previous walk-in sessions
    SELECT gs.guest_name INTO v_guest.name
    FROM guest_sessions gs
    WHERE gs.guest_phone = p_phone
      AND gs.room_number = ''
    ORDER BY gs.created_at DESC
    LIMIT 1;

    INSERT INTO guest_sessions (
      token, guest_id, room_id, room_number,
      guest_name, guest_phone, resort_id, is_active
    ) VALUES (
      v_session_token,
      NULL,              -- no guest record
      NULL,              -- no room
      '',                -- empty room
      COALESCE(v_guest.name, p_phone),
      p_phone,
      (SELECT id FROM resorts LIMIT 1),
      TRUE
    );

    RETURN jsonb_build_object(
      'success',       true,
      'guest_type',    'walk_in',
      'session_token', v_session_token,
      'guest_name',    COALESCE(v_guest.name, ''),
      'guest_phone',   p_phone,
      'room_number',   '',
      'guest_id',      NULL
    );
  END IF;
END;
$$;

-- ─── RPC: update_walkin_name ────────────────────────────────
-- Walk-in guests set their name after OTP verification
CREATE OR REPLACE FUNCTION update_walkin_name(
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
  WHERE token      = p_session_token
    AND room_number = ''        -- only walk-ins have empty room
    AND is_active   = TRUE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'SESSION_NOT_FOUND');
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;
