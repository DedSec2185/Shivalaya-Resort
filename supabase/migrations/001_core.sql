-- HTTP calls from within PostgreSQL triggers (needed for WhatsApp automation)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Better UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Scheduled jobs (daily reports in Sprint 6)
-- CREATE EXTENSION IF NOT EXISTS pg_cron; -- Requires pro plan

-- Food order sequence: generates 00001, 00002, etc.
CREATE SEQUENCE IF NOT EXISTS order_number_seq
  START 1 INCREMENT 1 MINVALUE 1 MAXVALUE 99999 CYCLE;

-- Activity booking sequence
CREATE SEQUENCE IF NOT EXISTS booking_number_seq
  START 1 INCREMENT 1 MINVALUE 1 MAXVALUE 99999 CYCLE;

-- ── RESORTS (top-level entity — future-proofs for multiple clients)
CREATE TABLE resorts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,   -- 'shivalaya-resorts'
  timezone    TEXT DEFAULT 'Asia/Kolkata',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── ROOMS
CREATE TABLE rooms (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resort_id         UUID NOT NULL REFERENCES resorts(id) ON DELETE CASCADE,
  room_number       TEXT NOT NULL,
  room_type         TEXT,                    -- 'Deluxe', 'Suite', 'Cottage'
  floor             INTEGER,
  has_balcony       BOOLEAN DEFAULT FALSE,   -- Bonfire/BBQ eligibility
  is_occupied       BOOLEAN DEFAULT FALSE,
  current_guest_id  UUID,                    -- FK added after guests table
  sort_order        INTEGER DEFAULT 0,
  UNIQUE(resort_id, room_number)
);

-- ── RESTAURANT TABLES
CREATE TABLE restaurant_tables (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resort_id   UUID NOT NULL REFERENCES resorts(id) ON DELETE CASCADE,
  table_number TEXT NOT NULL,
  capacity    INTEGER DEFAULT 4,
  is_occupied BOOLEAN DEFAULT FALSE,
  UNIQUE(resort_id, table_number)
);

-- ── STAFF
CREATE TABLE staff (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resort_id        UUID NOT NULL REFERENCES resorts(id) ON DELETE CASCADE,
  supabase_user_id UUID REFERENCES auth.users(id),
  name             TEXT NOT NULL,
  role             TEXT NOT NULL CHECK (role IN ('owner','receptionist','kitchen')),
  pin_hash         TEXT,   -- bcrypt hash of 4-digit PIN
  avatar_color     TEXT DEFAULT '#2C4A22',
  is_active        BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT now()
);
