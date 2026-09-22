CREATE OR REPLACE FUNCTION get_available_slots(
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

      -- Effective max: slot override wins, else activity default
      COALESCE(ats.max_capacity_override, a.max_capacity_per_slot) AS max_capacity,

      -- Current bookings: SUM of number_of_guests (NOT count of rows!)
      -- Because 1 booking can cover 3 people
      COALESCE(
        (
          SELECT SUM(ab.number_of_guests)
          FROM activity_bookings ab
          WHERE
            ab.slot_id = ats.id
            AND ab.booking_date = p_date
            AND ab.status NOT IN ('cancelled', 'no_show')
        ),
        0
      ) AS booked_count,

      -- Remaining = max - booked
      COALESCE(ats.max_capacity_override, a.max_capacity_per_slot)
        - COALESCE(
            (SELECT SUM(ab.number_of_guests)
             FROM activity_bookings ab
             WHERE ab.slot_id = ats.id
               AND ab.booking_date = p_date
               AND ab.status NOT IN ('cancelled', 'no_show')),
            0
          )
      AS remaining_capacity,

      -- is_available: slot is active AND has remaining capacity
      -- AND the slot day matches the requested date's day of week
      (
        ats.is_active = TRUE
        AND a.is_available = TRUE
        AND EXTRACT(DOW FROM p_date) = ANY(ats.days_available)
        AND (
          COALESCE(ats.max_capacity_override, a.max_capacity_per_slot)
          - COALESCE(
              (SELECT SUM(number_of_guests)
               FROM activity_bookings
               WHERE slot_id = ats.id
                 AND booking_date = p_date
                 AND status NOT IN ('cancelled', 'no_show')),
              0
            )
        ) > 0
        -- Enforce minimum advance booking hours
        AND (
          p_date > CURRENT_DATE
          OR (
            p_date = CURRENT_DATE
            AND (ats.start_time - make_interval(hours => a.min_advance_hours)) > CURRENT_TIME
          )
        )
      ) AS is_available

    FROM activity_time_slots ats
    JOIN activities a ON ats.activity_id = a.id

    WHERE
      ats.activity_id = p_activity_id
      AND EXTRACT(DOW FROM p_date) = ANY(ats.days_available)

    ORDER BY ats.sort_order, ats.start_time;
END;
$$;

CREATE OR REPLACE FUNCTION book_activity_slot(
  p_activity_id     UUID,
  p_slot_id         UUID,
  p_booking_date    DATE,
  p_number_guests   INTEGER,
  p_guest_name      TEXT,
  p_guest_phone     TEXT,
  p_room_number     TEXT,
  p_special_requests TEXT DEFAULT NULL
)
RETURNS JSONB   -- Returns {success, booking_id, booking_number} or {success, error}
LANGUAGE plpgsql AS $$
DECLARE
  v_max_capacity    INTEGER;
  v_booked_count    INTEGER;
  v_remaining       INTEGER;
  v_pricing_type    TEXT;
  v_unit_price      INTEGER;
  v_total_amount    INTEGER;
  v_booking_id      UUID;
  v_booking_number  TEXT;
  v_lock_key        BIGINT;
  v_room_id         UUID;
  v_guest_id        UUID;
BEGIN

  -- ① DERIVE ADVISORY LOCK KEY from slot+date combination
  -- hashtext returns an integer — unique per slot+date pair
  v_lock_key := hashtext(p_slot_id::text || p_booking_date::text);

  -- ② ACQUIRE LOCK — blocks until acquired (auto-released on tx end)
  PERFORM pg_advisory_xact_lock(v_lock_key);

  -- ③ GET ACTIVITY DETAILS (pricing, capacity)
  SELECT
    COALESCE(ats.max_capacity_override, a.max_capacity_per_slot),
    a.pricing_type,
    CASE a.pricing_type
      WHEN 'per_person'  THEN a.price_per_person
      WHEN 'per_setup'   THEN a.price_per_setup
      WHEN 'per_session' THEN a.price_per_session
    END
  INTO v_max_capacity, v_pricing_type, v_unit_price
  FROM activity_time_slots ats
  JOIN activities a ON ats.activity_id = a.id
  WHERE ats.id = p_slot_id;

  -- ④ COUNT EXISTING BOOKINGS (after lock — no race condition possible)
  SELECT COALESCE(SUM(number_of_guests), 0)
  INTO v_booked_count
  FROM activity_bookings
  WHERE
    slot_id = p_slot_id
    AND booking_date = p_booking_date
    AND status NOT IN ('cancelled', 'no_show');

  v_remaining := v_max_capacity - v_booked_count;

  -- ⑤ CAPACITY CHECK
  IF p_number_guests > v_remaining THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'SLOT_FULL',
      'remaining', v_remaining,
      'message', 'This slot is fully booked. Please choose another time.'
    );
  END IF;

  -- ⑥ CALCULATE TOTAL AMOUNT
  v_total_amount := CASE v_pricing_type
    WHEN 'per_person'  THEN v_unit_price * p_number_guests
    WHEN 'per_setup'   THEN v_unit_price  -- always fixed
    WHEN 'per_session' THEN v_unit_price  -- always fixed
  END;

  -- ⑦ RESOLVE room_id from room_number (if provided)
  IF p_room_number IS NOT NULL THEN
    SELECT id, current_guest_id
    INTO v_room_id, v_guest_id
    FROM rooms
    WHERE room_number = p_room_number;
  END IF;

  -- ⑧ GENERATE BOOKING NUMBER
  v_booking_number := 'EXP-' || to_char(
    nextval('booking_number_seq'), 'FM00000'
  );

  -- ⑨ INSERT THE BOOKING (capacity confirmed, lock held)
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
    p_guest_name, p_guest_phone,
    p_number_guests,
    v_pricing_type, v_unit_price, v_total_amount,
    'pending', p_special_requests
  )
  RETURNING id INTO v_booking_id;

  -- Lock auto-released when transaction commits

  RETURN jsonb_build_object(
    'success', true,
    'booking_id', v_booking_id,
    'booking_number', v_booking_number,
    'total_amount', v_total_amount
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', 'SERVER_ERROR',
    'message', SQLERRM
  );
END;
$$;
