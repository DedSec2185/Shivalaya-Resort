-- ── MENU CATEGORIES (sections like Breakfast, Starters)
CREATE TABLE menu_categories (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resort_id      UUID NOT NULL REFERENCES resorts(id),
  name           TEXT NOT NULL,
  emoji          TEXT DEFAULT '🍽️',
  available_from TIME,              -- NULL = available all day
  available_until TIME,             -- e.g. '16:00:00' for Breakfast cutoff
  is_available   BOOLEAN DEFAULT TRUE,
  sort_order     INTEGER DEFAULT 0
);

-- ── MENU ITEMS
CREATE TABLE menu_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resort_id    UUID NOT NULL REFERENCES resorts(id),
  category_id  UUID NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  description  TEXT,
  price        INTEGER NOT NULL,  -- rupees only, no paise
  item_type    TEXT DEFAULT 'veg'
               CHECK (item_type IN ('veg','nonveg','egg')),
  is_available BOOLEAN DEFAULT TRUE,
  is_special   BOOLEAN DEFAULT FALSE,  -- Chef's special tag
  has_variants BOOLEAN DEFAULT FALSE,  -- True if item needs a choice
  sort_order   INTEGER DEFAULT 0
);

-- ── MENU ITEM VARIANTS (e.g. Paratha stuffing choice)
CREATE TABLE menu_item_variants (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id     UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  group_label TEXT NOT NULL,    -- 'Choose Stuffing', 'Choose Dosa'
  option_name TEXT NOT NULL,    -- 'Aloo', 'Paneer', 'Plain'
  price_delta INTEGER DEFAULT 0,-- Additional cost (0 for Panache's menu)
  sort_order  INTEGER DEFAULT 0
);

CREATE INDEX idx_menu_items_category ON menu_items(category_id);
CREATE INDEX idx_menu_items_available ON menu_items(is_available);
