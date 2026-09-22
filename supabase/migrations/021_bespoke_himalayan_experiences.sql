-- ==============================================================================
-- 021_bespoke_himalayan_experiences.sql
-- Seed & update real active experiences at Shivalaya Resorts:
-- Bird Cage Dining, Evening Bonfire & BBQ, PS5 Gaming, Lawn Camping, Pine Trek, Kasar Devi & Waterfall
-- ==============================================================================

DO $$
DECLARE
  v_resort_id UUID;
BEGIN
  SELECT id INTO v_resort_id FROM resorts LIMIT 1;
  IF v_resort_id IS NULL THEN
    v_resort_id := 'a0000000-0000-0000-0000-000000000001'::UUID;
  END IF;

  -- 1. The Iconic Bird Cage Dining Experience
  INSERT INTO activities (
    resort_id, name, description, short_description,
    pricing_type, price_per_person, price_per_setup, price_per_session,
    duration_minutes, category, image_url, is_available, sort_order
  ) VALUES (
    v_resort_id,
    'The Iconic Bird Cage Dining Experience',
    'Private fairy-lit wrought-iron Bird Cage cabana on the lawn with panoramic mountain views, candlelight table setting, and 4-course bespoke Panache dining.',
    'Private fairy-lit bird cage cabana dining with personal butler service & mountain views.',
    'per_setup', 0, 2500, 2500,
    150, 'dining',
    'https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200&auto=format&fit=crop&q=80',
    true, 1
  ) ON CONFLICT DO NOTHING;

  -- 2. Evening Pine Bonfire & Live Barbecue
  INSERT INTO activities (
    resort_id, name, description, short_description,
    pricing_type, price_per_person, price_per_setup, price_per_session,
    duration_minutes, category, image_url, is_available, sort_order
  ) VALUES (
    v_resort_id,
    'Evening Pine Bonfire & Live Barbecue',
    'Crackling pine wood bonfire on the resort lawn with comfortable lounge seating, live sigri tandoor skewers, marshmallows, warm blankets & private music.',
    'Cozy mountain lawn bonfire with live barbecue skewers, marshmallows & music.',
    'per_setup', 0, 1500, 1500,
    120, 'outdoor',
    'https://images.unsplash.com/photo-1470246973918-29a93221c455?w=1200&auto=format&fit=crop&q=80',
    true, 2
  ) ON CONFLICT DO NOTHING;

  -- 3. PlayStation 5 (PS5) 4K Ultra Gaming Lounge
  INSERT INTO activities (
    resort_id, name, description, short_description,
    pricing_type, price_per_person, price_per_setup, price_per_session,
    duration_minutes, category, image_url, is_available, sort_order
  ) VALUES (
    v_resort_id,
    'PlayStation 5 (PS5) 4K Ultra Gaming Lounge',
    'Exclusive 1-hour session in the resort gaming lounge on a 65" 4K HDR display with Sony PS5, FIFA, Gran Turismo, Spider-Man, oversized beanbags & snacks.',
    'PS5 4K gaming lounge with FIFA, racing, controllers & Panache finger food.',
    'per_session', 0, 0, 600,
    60, 'indoor',
    'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=1200&auto=format&fit=crop&q=80',
    true, 3
  ) ON CONFLICT DO NOTHING;

  -- 4. Resort Lawn Starlit Camping
  INSERT INTO activities (
    resort_id, name, description, short_description,
    pricing_type, price_per_person, price_per_setup, price_per_session,
    duration_minutes, category, image_url, is_available, sort_order
  ) VALUES (
    v_resort_id,
    'Resort Lawn Starlit Camping',
    'Overnight alpine dome tent pitched on the resort green lawn under the Himalayan stars. Plush mattress, warm quilts, sleeping bags, lanterns & morning tea.',
    'Overnight luxury canvas camping tent on the lawn with down quilts & stargazing.',
    'per_setup', 0, 3500, 3500,
    720, 'outdoor',
    'https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=1200&auto=format&fit=crop&q=80',
    true, 4
  ) ON CONFLICT DO NOTHING;

  -- 5. Gethia Pine Forest Nature Walk & Trek
  INSERT INTO activities (
    resort_id, name, description, short_description,
    pricing_type, price_per_person, price_per_setup, price_per_session,
    duration_minutes, category, image_url, is_available, sort_order
  ) VALUES (
    v_resort_id,
    'Gethia Pine Forest Nature Walk & Trek',
    'Guided 2-hour morning forest walk along soft deodar needle trails with a local naturalist. Birdwatching, crisp mountain air & panoramic Bhimtal valley view.',
    'Gentle guided morning pine forest walk & birdwatching with herbal tea finish.',
    'per_person', 500, 0, 500,
    120, 'outdoor',
    'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&auto=format&fit=crop&q=80',
    true, 5
  ) ON CONFLICT DO NOTHING;

  -- 6. Kasar Devi & Secret Waterfall Excursion
  INSERT INTO activities (
    resort_id, name, description, short_description,
    pricing_type, price_per_person, price_per_setup, price_per_session,
    duration_minutes, category, image_url, is_available, sort_order
  ) VALUES (
    v_resort_id,
    'Kasar Devi & Secret Waterfall Excursion',
    'Half-day chauffeured resort trip to the sacred Kasar Devi geomagnetic ridge and a hidden cold-water mountain waterfall spring plunge with picnic hamper.',
    'Chauffeured trip to Kasar Devi temple ridge & hidden mountain waterfall spring.',
    'per_setup', 0, 3200, 3200,
    270, 'outdoor',
    'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1200&auto=format&fit=crop&q=80',
    true, 6
  ) ON CONFLICT DO NOTHING;

END $$;
