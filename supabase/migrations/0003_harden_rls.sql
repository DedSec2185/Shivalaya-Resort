-- Harden the MVP RLS model for a production-ready flow

-- Keep the restaurant and menu read policies public for the guest-facing menu.
-- Orders: guests can insert valid orders, but direct public UPDATE is removed.
-- Status transitions must happen through the security-definer RPC.

DROP POLICY IF EXISTS "Public update orders" ON orders;
DROP POLICY IF EXISTS "Public read orders" ON orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Public read status log" ON order_status_log;
DROP POLICY IF EXISTS "Public insert status log" ON order_status_log;

-- Recreate a tighter public read policy scoped to the restaurant slug used by this app.
CREATE POLICY "Public read orders for configured restaurant"
ON orders
FOR SELECT
USING (
  restaurant_id = (
    SELECT id
    FROM restaurants
    WHERE slug = 'panache-shivalaya'
  )
);

-- Only allow valid guest order submissions for the restaurant.
CREATE POLICY "Guests can create valid orders"
ON orders
FOR INSERT
WITH CHECK (
  restaurant_id = (
    SELECT id
    FROM restaurants
    WHERE slug = 'panache-shivalaya'
  )
  AND service_type IN ('room_service', 'dine_in', 'pickup')
  AND guest_name IS NOT NULL
  AND btrim(guest_name) <> ''
  AND guest_phone IS NOT NULL
  AND guest_phone ~ '^[0-9]{10}$'
  AND jsonb_typeof(items) = 'array'
  AND jsonb_array_length(items) > 0
  AND total >= 0
  AND status = 'new'
);

-- Status log reads are restricted to the same restaurant's orders only.
CREATE POLICY "Read status log for configured restaurant"
ON order_status_log
FOR SELECT
USING (
  order_id IN (
    SELECT id
    FROM orders
    WHERE restaurant_id = (
      SELECT id
      FROM restaurants
      WHERE slug = 'panache-shivalaya'
    )
  )
);

-- The trigger-driven audit log should be owned by the database layer, not client-side public writes.
-- No public INSERT policy is kept for the audit table.

-- Strengthen the status transition function so it enforces the order lifecycle.
CREATE OR REPLACE FUNCTION update_order_status(
  p_order_id UUID,
  p_status order_status,
  p_staff_name TEXT
)
RETURNS orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_status order_status;
  result orders;
BEGIN
  IF p_staff_name IS NULL OR btrim(p_staff_name) = '' THEN
    RAISE EXCEPTION 'Staff name is required';
  END IF;

  SELECT status INTO current_status
  FROM orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  -- Allowed transitions
  IF p_status = 'cancelled' AND current_status IN ('new', 'confirmed', 'preparing', 'ready') THEN
    NULL;
  ELSIF p_status = 'confirmed' AND current_status = 'new' THEN
    NULL;
  ELSIF p_status = 'preparing' AND current_status = 'confirmed' THEN
    NULL;
  ELSIF p_status = 'ready' AND current_status = 'preparing' THEN
    NULL;
  ELSIF p_status = 'served' AND current_status = 'ready' THEN
    NULL;
  ELSE
    RAISE EXCEPTION 'Invalid status transition from % to %', current_status, p_status;
  END IF;

  PERFORM set_config('app.staff_name', p_staff_name, true);

  UPDATE orders
  SET status = p_status,
      updated_at = now()
  WHERE id = p_order_id
  RETURNING * INTO result;

  RETURN result;
END;
$$;

-- Add a stricter order status constraint for well-formed status changes.
ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN ('new', 'confirmed', 'preparing', 'ready', 'served', 'cancelled'));

-- Ensure only a single restaurant slug is used in the public contract for this MVP.
ALTER TABLE restaurants
  ADD CONSTRAINT restaurants_slug_format_check
  CHECK (slug ~ '^[a-z0-9-]+$');
