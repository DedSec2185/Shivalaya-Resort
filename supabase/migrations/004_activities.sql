-- ── ACTIVITIES
CREATE TABLE activities (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resort_id            UUID NOT NULL REFERENCES resorts(id),
  name                 TEXT NOT NULL,
  description          TEXT,
  short_description    TEXT,
  pricing_type         TEXT NOT NULL
                       CHECK (pricing_type IN ('per_person','per_setup','per_session')),
  price_per_person     INTEGER,
  price_per_setup      INTEGER,
  price_per_session    INTEGER,
  duration_minutes     INTEGER,
  max_capacity_per_slot INTEGER NOT NULL DEFAULT 6,
  requires_balcony     BOOLEAN DEFAULT FALSE,
  min_advance_hours    INTEGER DEFAULT 0,
  what_is_included     TEXT[],
  notes_for_guest      TEXT,
  notes_for_staff      TEXT,
  image_url            TEXT,
  is_available         BOOLEAN DEFAULT TRUE,
  sort_order           INTEGER DEFAULT 0,
  category             TEXT DEFAULT 'outdoor'
);

-- ── ACTIVITY TIME SLOTS
CREATE TABLE activity_time_slots (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id           UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  label                 TEXT NOT NULL,
  start_time            TIME NOT NULL,
  end_time              TIME NOT NULL,
  days_available        INTEGER[] NOT NULL DEFAULT '{0,1,2,3,4,5,6}',
  max_capacity_override INTEGER,  -- overrides activity default if set
  is_active             BOOLEAN DEFAULT TRUE,
  sort_order            INTEGER DEFAULT 0
);

-- ── ACTIVITY BOOKINGS
CREATE TABLE activity_bookings (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number         TEXT UNIQUE,
  activity_id            UUID NOT NULL REFERENCES activities(id),
  slot_id                UUID NOT NULL REFERENCES activity_time_slots(id),
  booking_date           DATE NOT NULL,
  guest_id               UUID REFERENCES guests(id) ON DELETE SET NULL,
  room_id                UUID REFERENCES rooms(id) ON DELETE SET NULL,
  guest_name             TEXT NOT NULL,
  guest_phone            TEXT,
  number_of_guests       INTEGER NOT NULL DEFAULT 1,
  pricing_type_snapshot  TEXT NOT NULL,
  unit_price_snapshot    INTEGER NOT NULL,
  total_amount           INTEGER NOT NULL,
  status                 TEXT DEFAULT 'pending'
                         CHECK (status IN
                         ('pending','confirmed','completed','cancelled','no_show')),
  special_requests       TEXT,
  assigned_staff_name    TEXT,
  staff_instructions     TEXT,
  confirmed_by           UUID REFERENCES staff(id),
  cancellation_reason    TEXT,
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now()
);

-- ── WHATSAPP LOG
CREATE TABLE whatsapp_log (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id            UUID REFERENCES guests(id) ON DELETE SET NULL,
  phone_number        TEXT NOT NULL,
  message_type        TEXT NOT NULL,   -- 'checkin' | 'checkout'
  template_name       TEXT,
  status              TEXT DEFAULT 'sent',
  provider_message_id TEXT,
  sent_at             TIMESTAMPTZ DEFAULT now(),
  error_message       TEXT
);

CREATE INDEX idx_activity_bookings_date_slot ON activity_bookings(slot_id, booking_date);
CREATE INDEX idx_activity_bookings_guest     ON activity_bookings(guest_id);
CREATE INDEX idx_activity_bookings_status    ON activity_bookings(status);
