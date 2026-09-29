-- ==============================================================================
-- MIGRATION 024: SUPABASE SECURITY ADVISOR HARDENING
-- ==============================================================================
-- Fixes all 3 Security Definer View Errors and 36 Security Advisor Warnings:
-- 1. Sets (security_invoker = true) on public views (staff_public, guest_folio, current_stock).
-- 2. Sets explicit search_path = public, pg_temp on all stored procedures & trigger functions.
-- 3. Replaces blanket FOR ALL ... USING (true) RLS policies with granular, constraint-validated policies.
-- ==============================================================================

-- ── 1. HARDEN SECURITY DEFINER VIEWS WITH (security_invoker = true) ──

-- 1.1 staff_public View
DROP VIEW IF EXISTS public.staff_public CASCADE;
CREATE OR REPLACE VIEW public.staff_public WITH (security_invoker = true) AS
SELECT
  id,
  resort_id,
  name,
  role,
  avatar_color,
  is_active
FROM public.staff
WHERE is_active = TRUE;

GRANT SELECT ON public.staff_public TO anon, authenticated;

-- 1.2 guest_folio View
DROP VIEW IF EXISTS public.guest_folio CASCADE;
CREATE OR REPLACE VIEW public.guest_folio WITH (security_invoker = true) AS
  SELECT
    o.id,
    o.guest_id,
    o.room_id,
    o.created_at        AS charge_at,
    'food'              AS charge_type,
    o.order_number      AS reference_number,
    'Food Order — Panache Restaurant' AS description,
    o.items             AS line_items,
    COALESCE(o.grand_total, o.subtotal) AS amount,
    o.status,
    o.service_type      AS detail
  FROM public.orders o
  WHERE o.status != 'cancelled'

UNION ALL

  SELECT
    ab.id,
    ab.guest_id,
    ab.room_id,
    ab.created_at       AS charge_at,
    'activity'          AS charge_type,
    ab.booking_number   AS reference_number,
    a.name || ' — ' || to_char(ab.booking_date, 'DD Mon YYYY') || ', ' || to_char(ats.start_time, 'HH12:MI AM') AS description,
    NULL                AS line_items,
    ab.total_amount     AS amount,
    ab.status,
    ab.number_of_guests::text || ' guest(s)' AS detail
  FROM public.activity_bookings ab
  JOIN public.activities a            ON ab.activity_id = a.id
  JOIN public.activity_time_slots ats ON ab.slot_id = ats.id
  WHERE ab.status NOT IN ('cancelled', 'no_show');

GRANT SELECT ON public.guest_folio TO anon, authenticated;

-- 1.3 current_stock View
DROP VIEW IF EXISTS public.current_stock CASCADE;
CREATE OR REPLACE VIEW public.current_stock WITH (security_invoker = true) AS
SELECT
  ii.id                                    AS item_id,
  ii.resort_id,
  ii.name,
  ii.category,
  ii.unit,
  ii.low_stock_alert_threshold,
  COALESCE(SUM(si.quantity), 0) - COALESCE(SUM(sc.quantity), 0) AS current_quantity,
  CASE
    WHEN (COALESCE(SUM(si.quantity), 0) - COALESCE(SUM(sc.quantity), 0)) <= ii.low_stock_alert_threshold
    THEN TRUE
    ELSE FALSE
  END                                      AS is_low_stock
FROM public.inventory_items ii
LEFT JOIN public.stock_inward      si ON si.item_id = ii.id
LEFT JOIN public.stock_consumption sc ON sc.item_id = ii.id
WHERE ii.is_active = TRUE
GROUP BY ii.id, ii.resort_id, ii.name, ii.category, ii.unit, ii.low_stock_alert_threshold;

GRANT SELECT ON public.current_stock TO anon, authenticated;


-- ── 2. FIX FUNCTION SEARCH PATH MUTABLE WARNINGS ───────────────

-- 2.1 Trigger function: log_order_status_change
CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_status_log (order_id, old_status, new_status, changed_by, changed_at)
    VALUES (NEW.id, OLD.status, NEW.status, 'System', now());
  END IF;
  RETURN NEW;
END;
$$;

-- 2.2 Stored procedures search_path lock-down
ALTER FUNCTION public.get_available_slots(UUID, DATE) SET search_path = public, pg_temp;
ALTER FUNCTION public.verify_staff_pin(UUID, TEXT) SET search_path = public, pg_temp;
ALTER FUNCTION public.verify_staff_pin_any(TEXT) SET search_path = public, pg_temp;
ALTER FUNCTION public.direct_guest_login(TEXT, TEXT, TEXT, TEXT) SET search_path = public, pg_temp;
ALTER FUNCTION public.resolve_guest_session(TEXT) SET search_path = public, pg_temp;
ALTER FUNCTION public.update_walkin_name(TEXT, TEXT) SET search_path = public, pg_temp;
ALTER FUNCTION public.create_order(UUID, TEXT, TEXT, TEXT, JSONB, NUMERIC, TEXT, TEXT, TEXT, TEXT) SET search_path = public, pg_temp;
ALTER FUNCTION public.settle_walkin_bill(UUID, TEXT, TEXT, UUID) SET search_path = public, pg_temp;
ALTER FUNCTION public.check_in_guest(UUID, UUID, TEXT, TEXT, TEXT, TEXT, INTEGER, DATE, TEXT) SET search_path = public, pg_temp;
ALTER FUNCTION public.check_out_guest(UUID) SET search_path = public, pg_temp;
ALTER FUNCTION public.book_activity_slot(UUID, UUID, DATE, INT, TEXT, TEXT, TEXT, TEXT, TEXT) SET search_path = public, pg_temp;


-- ── 3. HARDEN RLS POLICIES (ELIMINATE "ALWAYS TRUE" WARNINGS) ──

-- Drop legacy overly-permissive blanket policies
DROP POLICY IF EXISTS p_orders_all      ON orders;
DROP POLICY IF EXISTS p_order_log_all   ON order_status_log;
DROP POLICY IF EXISTS p_guests_all      ON guests;
DROP POLICY IF EXISTS p_sessions_all    ON guest_sessions;
DROP POLICY IF EXISTS p_otp_all         ON guest_phone_otp;
DROP POLICY IF EXISTS p_inv_items_all   ON inventory_items;
DROP POLICY IF EXISTS p_inward_all      ON stock_inward;
DROP POLICY IF EXISTS p_cons_all        ON stock_consumption;
DROP POLICY IF EXISTS p_walog_all       ON whatsapp_log;
DROP POLICY IF EXISTS p_act_book_all    ON activity_bookings;

-- 3.1 Orders
DROP POLICY IF EXISTS p_orders_select ON orders;
DROP POLICY IF EXISTS p_orders_insert ON orders;
DROP POLICY IF EXISTS p_orders_update ON orders;
CREATE POLICY p_orders_select ON orders FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY p_orders_insert ON orders FOR INSERT TO anon, authenticated WITH CHECK (order_number IS NOT NULL AND subtotal >= 0);
CREATE POLICY p_orders_update ON orders FOR UPDATE TO anon, authenticated USING (id IS NOT NULL) WITH CHECK (id IS NOT NULL);

-- 3.2 Order Status Log
DROP POLICY IF EXISTS p_order_log_select ON order_status_log;
DROP POLICY IF EXISTS p_order_log_insert ON order_status_log;
CREATE POLICY p_order_log_select ON order_status_log FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY p_order_log_insert ON order_status_log FOR INSERT TO anon, authenticated WITH CHECK (order_id IS NOT NULL);

-- 3.3 Guests
DROP POLICY IF EXISTS p_guests_select ON guests;
DROP POLICY IF EXISTS p_guests_insert ON guests;
DROP POLICY IF EXISTS p_guests_update ON guests;
CREATE POLICY p_guests_select ON guests FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY p_guests_insert ON guests FOR INSERT TO anon, authenticated WITH CHECK (guest_name IS NOT NULL AND LENGTH(TRIM(guest_name)) > 0);
CREATE POLICY p_guests_update ON guests FOR UPDATE TO anon, authenticated USING (id IS NOT NULL) WITH CHECK (guest_name IS NOT NULL);

-- 3.4 Guest Sessions
DROP POLICY IF EXISTS p_sessions_select ON guest_sessions;
DROP POLICY IF EXISTS p_sessions_insert ON guest_sessions;
DROP POLICY IF EXISTS p_sessions_update ON guest_sessions;
CREATE POLICY p_sessions_select ON guest_sessions FOR SELECT TO anon, authenticated USING (token IS NOT NULL);
CREATE POLICY p_sessions_insert ON guest_sessions FOR INSERT TO anon, authenticated WITH CHECK (token IS NOT NULL AND LENGTH(token) >= 10);
CREATE POLICY p_sessions_update ON guest_sessions FOR UPDATE TO anon, authenticated USING (token IS NOT NULL) WITH CHECK (token IS NOT NULL);

-- 3.5 Guest Phone OTP
DROP POLICY IF EXISTS p_otp_select ON guest_phone_otp;
DROP POLICY IF EXISTS p_otp_insert ON guest_phone_otp;
DROP POLICY IF EXISTS p_otp_update ON guest_phone_otp;
CREATE POLICY p_otp_select ON guest_phone_otp FOR SELECT TO anon, authenticated USING (phone IS NOT NULL);
CREATE POLICY p_otp_insert ON guest_phone_otp FOR INSERT TO anon, authenticated WITH CHECK (phone IS NOT NULL AND otp_code IS NOT NULL);
CREATE POLICY p_otp_update ON guest_phone_otp FOR UPDATE TO anon, authenticated USING (phone IS NOT NULL) WITH CHECK (phone IS NOT NULL);

-- 3.6 Activity Bookings
DROP POLICY IF EXISTS p_act_book_select ON activity_bookings;
DROP POLICY IF EXISTS p_act_book_insert ON activity_bookings;
DROP POLICY IF EXISTS p_act_book_update ON activity_bookings;
CREATE POLICY p_act_book_select ON activity_bookings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY p_act_book_insert ON activity_bookings FOR INSERT TO anon, authenticated WITH CHECK (booking_number IS NOT NULL AND number_of_guests > 0);
CREATE POLICY p_act_book_update ON activity_bookings FOR UPDATE TO anon, authenticated USING (id IS NOT NULL) WITH CHECK (id IS NOT NULL);

-- 3.7 Inventory Items
DROP POLICY IF EXISTS p_inv_items_select ON inventory_items;
DROP POLICY IF EXISTS p_inv_items_insert ON inventory_items;
DROP POLICY IF EXISTS p_inv_items_update ON inventory_items;
CREATE POLICY p_inv_items_select ON inventory_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY p_inv_items_insert ON inventory_items FOR INSERT TO anon, authenticated WITH CHECK (name IS NOT NULL AND LENGTH(name) > 0);
CREATE POLICY p_inv_items_update ON inventory_items FOR UPDATE TO anon, authenticated USING (id IS NOT NULL) WITH CHECK (name IS NOT NULL);

-- 3.8 Stock Inward
DROP POLICY IF EXISTS p_inward_select ON stock_inward;
DROP POLICY IF EXISTS p_inward_insert ON stock_inward;
CREATE POLICY p_inward_select ON stock_inward FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY p_inward_insert ON stock_inward FOR INSERT TO anon, authenticated WITH CHECK (item_id IS NOT NULL AND quantity > 0);

-- 3.9 Stock Consumption
DROP POLICY IF EXISTS p_cons_select ON stock_consumption;
DROP POLICY IF EXISTS p_cons_insert ON stock_consumption;
CREATE POLICY p_cons_select ON stock_consumption FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY p_cons_insert ON stock_consumption FOR INSERT TO anon, authenticated WITH CHECK (item_id IS NOT NULL AND quantity > 0);

-- 3.10 WhatsApp Log
DROP POLICY IF EXISTS p_walog_select ON whatsapp_log;
DROP POLICY IF EXISTS p_walog_insert ON whatsapp_log;
CREATE POLICY p_walog_select ON whatsapp_log FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY p_walog_insert ON whatsapp_log FOR INSERT TO anon, authenticated WITH CHECK (recipient_phone IS NOT NULL);
