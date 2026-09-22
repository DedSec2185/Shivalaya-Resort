CREATE OR REPLACE FUNCTION verify_staff_pin(
  p_staff_id UUID,
  p_pin      TEXT
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_staff staff%ROWTYPE;
BEGIN
  SELECT * INTO v_staff FROM staff WHERE id = p_staff_id;

  IF NOT FOUND OR NOT v_staff.is_active THEN
    RETURN jsonb_build_object('valid', false);
  END IF;

  IF v_staff.pin_hash = crypt(p_pin, v_staff.pin_hash) THEN
    RETURN jsonb_build_object(
      'valid',  true,
      'name',   v_staff.name,
      'role',   v_staff.role,
      'email',  v_staff.email   -- Assuming we use this for the auth login mapping
    );
  ELSE
    RETURN jsonb_build_object('valid', false);
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION check_in_guest(
  p_resort_id        UUID,
  p_room_id          UUID,
  p_guest_name       TEXT,
  p_guest_phone      TEXT,
  p_number_of_adults INTEGER DEFAULT 1,
  p_expected_checkout DATE DEFAULT NULL,
  p_notes            TEXT DEFAULT NULL
)
RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE
  v_guest_id UUID;
BEGIN
  -- Check room is not already occupied
  IF (SELECT is_occupied FROM rooms WHERE id = p_room_id) THEN
    RETURN jsonb_build_object('success',false,'error','ROOM_OCCUPIED');
  END IF;

  -- Create guest record
  INSERT INTO guests(
    resort_id, room_id, guest_name, guest_phone,
    number_of_adults, check_in_date, expected_checkout, notes, status
  ) VALUES(
    p_resort_id, p_room_id, p_guest_name, p_guest_phone,
    p_number_of_adults, CURRENT_DATE, p_expected_checkout, p_notes, 'checked_in'
  ) RETURNING id INTO v_guest_id;

  -- Mark room as occupied and link to guest
  UPDATE rooms
  SET is_occupied = true, current_guest_id = v_guest_id
  WHERE id = p_room_id;

  -- WhatsApp trigger fires automatically via the DB trigger
  -- (on_guest_checkin_whatsapp trigger on guests table)

  RETURN jsonb_build_object('success',true,'guest_id',v_guest_id);
END;
$$;
