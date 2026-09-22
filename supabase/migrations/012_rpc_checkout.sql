CREATE OR REPLACE FUNCTION check_out_guest(
  p_guest_id UUID
)
RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE
  v_room_id UUID;
BEGIN
  -- Get room_id for this guest
  SELECT room_id INTO v_room_id FROM guests WHERE id = p_guest_id AND status = 'checked_in';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'GUEST_NOT_CHECKED_IN');
  END IF;

  -- Update guest status
  UPDATE guests
  SET status = 'checked_out', check_out_date = CURRENT_DATE
  WHERE id = p_guest_id;

  -- Free the room
  UPDATE rooms
  SET is_occupied = false, current_guest_id = NULL
  WHERE id = v_room_id;

  RETURN jsonb_build_object('success', true);
END;
$$;
