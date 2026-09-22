CREATE OR REPLACE VIEW guest_folio AS
  SELECT
    o.id, o.guest_id, o.room_id,
    o.created_at        AS charge_at,
    'food'              AS charge_type,
    o.order_number      AS reference_number,
    'Food Order — Panache Restaurant' AS description,
    o.items             AS line_items,
    o.subtotal          AS amount,
    o.status,
    o.service_type      AS detail
  FROM orders o
  WHERE o.status != 'cancelled'

UNION ALL

  SELECT
    ab.id, ab.guest_id, ab.room_id,
    ab.created_at       AS charge_at,
    'activity'          AS charge_type,
    ab.booking_number   AS reference_number,
    a.name || ' — ' ||
      to_char(ab.booking_date, 'DD Mon YYYY') ||
      ', ' || to_char(ats.start_time, 'HH12:MI AM') AS description,
    NULL                AS line_items,
    ab.total_amount     AS amount,
    ab.status,
    ab.number_of_guests::text || ' guest(s)' AS detail
  FROM activity_bookings ab
  JOIN activities a        ON ab.activity_id = a.id
  JOIN activity_time_slots ats ON ab.slot_id = ats.id
  WHERE ab.status != 'cancelled'

ORDER BY charge_at;
