CREATE OR REPLACE FUNCTION create_order(
  p_resort_id    UUID,
  p_service_type TEXT,
  p_guest_name   TEXT,
  p_guest_phone  TEXT,
  p_room_number  TEXT DEFAULT NULL,
  p_table_number TEXT DEFAULT NULL,
  p_items        JSONB DEFAULT '[]',
  p_subtotal     INTEGER DEFAULT 0,
  p_special_note TEXT DEFAULT NULL
)
RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE
  v_order_id     UUID;
  v_order_number TEXT;
  v_room_id      UUID;
  v_table_id     UUID;
  v_guest_id     UUID;
BEGIN
  -- Resolve room and guest from room number
  IF p_room_number IS NOT NULL THEN
    SELECT r.id, r.current_guest_id
    INTO v_room_id, v_guest_id
    FROM rooms r
    WHERE r.resort_id = p_resort_id
      AND r.room_number = p_room_number;
  END IF;

  IF p_table_number IS NOT NULL THEN
    SELECT id INTO v_table_id
    FROM restaurant_tables
    WHERE resort_id = p_resort_id AND table_number = p_table_number;
  END IF;

  -- Generate human-readable order number
  v_order_number := 'PAN-' || to_char(nextval('order_number_seq'), 'FM00000');

  INSERT INTO orders(
    order_number, resort_id, guest_id, room_id, table_id,
    service_type, guest_name, guest_phone, items, subtotal, special_note
  ) VALUES(
    v_order_number, p_resort_id, v_guest_id, v_room_id, v_table_id,
    p_service_type, p_guest_name, p_guest_phone, p_items, p_subtotal, p_special_note
  ) RETURNING id INTO v_order_id;

  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'order_number', v_order_number
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success',false,'error',SQLERRM);
END;
$$;
