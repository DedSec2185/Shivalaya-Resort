-- ── GUESTS
CREATE TABLE guests (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resort_id           UUID NOT NULL REFERENCES resorts(id),
  room_id             UUID REFERENCES rooms(id),
  guest_name          TEXT NOT NULL,
  guest_phone         TEXT NOT NULL,
  number_of_adults    INTEGER DEFAULT 1,
  check_in_date       DATE NOT NULL,
  expected_checkout   DATE,
  actual_checkout     TIMESTAMPTZ,
  status              TEXT DEFAULT 'checked_in'
                      CHECK (status IN ('checked_in','checked_out')),
  notes               TEXT,
  checked_in_by       UUID REFERENCES staff(id),
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- Now add the FK from rooms to guests (circular FK, added after both tables exist)
ALTER TABLE rooms
  ADD CONSTRAINT fk_rooms_current_guest
  FOREIGN KEY (current_guest_id) REFERENCES guests(id)
  ON DELETE SET NULL;

-- ── ORDERS
CREATE TABLE orders (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE,
  resort_id    UUID NOT NULL REFERENCES resorts(id),
  guest_id     UUID REFERENCES guests(id) ON DELETE SET NULL,
  room_id      UUID REFERENCES rooms(id) ON DELETE SET NULL,
  table_id     UUID REFERENCES restaurant_tables(id) ON DELETE SET NULL,
  service_type TEXT NOT NULL CHECK (service_type IN
               ('room_service','dine_in','pickup','walk_in')),
  guest_name   TEXT NOT NULL,
  guest_phone  TEXT,
  items        JSONB NOT NULL DEFAULT '[]',
  -- items structure: [{id, name, qty, price, variant_label}]
  subtotal     INTEGER NOT NULL DEFAULT 0,   -- in rupees
  status       TEXT DEFAULT 'new'
               CHECK (status IN
               ('new','confirmed','preparing','ready','served','cancelled')),
  special_note TEXT,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- ── ORDER STATUS LOG
CREATE TABLE order_status_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  old_status  TEXT,
  new_status  TEXT NOT NULL,
  changed_by  UUID REFERENCES staff(id),
  changed_at  TIMESTAMPTZ DEFAULT now()
);

-- ── INDEXES (performance on common queries)
CREATE INDEX idx_orders_resort_status ON orders(resort_id, status);
CREATE INDEX idx_orders_guest_id      ON orders(guest_id);
CREATE INDEX idx_orders_created_at    ON orders(created_at DESC);
CREATE INDEX idx_orders_room_id       ON orders(room_id);
