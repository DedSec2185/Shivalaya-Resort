# Shivalaya — System Architecture & Flow Reference (v2.0)

## Overview
Comprehensive system architecture, PostgreSQL database schema, Supabase Realtime channel mappings, core operational flows, time-slot concurrency algorithms, and deployment details.

---

## 1. The Three Applications

### App 1: Shivalaya Guest Portal (`order.shivalayaresorts.com`)
- **Target User**: Resort guests via room or table QR code scan.
- **Tech Stack**: Vite + React + TypeScript + Zustand + Tailwind CSS.
- **Domain**: Landing page, full food ordering, variant picker, real-time order tracker (`/order/:id`), and activities booking (`/experiences`).
- **Writes**: `orders`, `activity_bookings`.
- **Reads**: `menu_categories`, `menu_items`, `menu_item_variants`, `activities`, `activity_time_slots`, `orders`, `activity_bookings`.
- **WebSocket Subscriptions**: Filtered `orders` and `activity_bookings` channels for status tracking.

### App 2: Panache Kitchen Panel (`kitchen.shivalayaresorts.com`)
- **Target User**: Kitchen chefs, counter staff, waiters.
- **Tech Stack**: Vite + React + TypeScript + Web Audio API + Web Notifications API.
- **Domain**: PIN-based login, 3-column order queue (New, In Progress, Ready), order age indicators (amber at 20 min, red at 35 min), status transitions, KOT print view.
- **Writes**: `orders.status`, `order_status_log`.
- **Reads**: `orders`, `staff`.
- **WebSocket Subscriptions**: Unfiltered `orders` channel (`INSERT` & `UPDATE`).

### App 3: Shivalaya Resort Reception (`reception.shivalayaresorts.com`)
- **Target User**: Front desk receptionists, resort owner.
- **Tech Stack**: Vite + React + TypeScript + Recharts / Chart.js.
- **Domain**: Owner login, guest check-in/checkout, room occupancy status, active guest list with running bill tab, order history search, 86 menu item availability toggles, activities queue & confirmation, staff assignment, calendar view, guest folio export, and analytics.
- **Writes**: `guests`, `rooms`, `activity_bookings`, `orders` (manual desk orders), `activities`, `activity_time_slots`.
- **Reads**: Full database access.
- **WebSocket Subscriptions**: `activity_bookings` channel, `orders` overview channel.

---

## 2. Complete Database Schema (15 Tables + 1 View)

### Core Infrastructure
- **`resorts`**: `id` (uuid PK), `name` (text), `slug` (text UNIQUE), `timezone` (text), `created_at` (timestamptz).
- **`rooms`**: `id` (uuid PK), `resort_id` (uuid FK), `room_number` (text), `room_type` (text), `floor` (int), `has_balcony` (bool), `is_occupied` (bool), `current_guest_id` (uuid FK), `sort_order` (int).
- **`restaurant_tables`**: `id` (uuid PK), `resort_id` (uuid FK), `table_number` (text), `capacity` (int), `is_occupied` (bool).
- **`staff`**: `id` (uuid PK), `resort_id` (uuid FK), `supabase_user_id` (uuid FK auth.users), `name` (text), `role` (`owner`|`receptionist`|`kitchen`), `pin_hash` (text bcrypt), `avatar_color` (text), `is_active` (bool).

### Guest Stays & Orders
- **`guests`**: `id` (uuid PK), `resort_id` (uuid FK), `room_id` (uuid FK), `guest_name` (text), `guest_phone` (text), `number_of_adults` (int), `check_in_date` (date), `expected_checkout` (date), `actual_checkout` (timestamptz), `status` (`checked_in`|`checked_out`), `notes` (text), `checked_in_by` (uuid FK staff).
- **`orders`**: `id` (uuid PK), `order_number` (text UNIQUE `PAN-XXXXX`), `resort_id` (uuid FK), `guest_id` (uuid FK), `room_id` (uuid FK), `table_id` (uuid FK), `service_type` (`room_service`|`dine_in`|`pickup`|`walk_in`), `guest_name` (text), `guest_phone` (text), `items` (jsonb array), `subtotal` (int rupees), `status` (`new`|`confirmed`|`preparing`|`ready`|`served`|`cancelled`), `special_note` (text), `created_at` (timestamptz), `updated_at` (timestamptz).
- **`order_status_log`**: `id` (uuid PK), `order_id` (uuid FK), `old_status` (text), `new_status` (text), `changed_by` (uuid FK staff), `changed_at` (timestamptz).

### Food Menu
- **`menu_categories`**: `id` (uuid PK), `resort_id` (uuid FK), `name` (text), `emoji` (text), `available_from` (time), `available_until` (time), `is_available` (bool), `sort_order` (int).
- **`menu_items`**: `id` (uuid PK), `resort_id` (uuid FK), `category_id` (uuid FK), `name` (text), `description` (text), `price` (int), `item_type` (`veg`|`nonveg`|`egg`), `is_available` (bool), `is_special` (bool), `has_variants` (bool), `sort_order` (int).
- **`menu_item_variants`**: `id` (uuid PK), `item_id` (uuid FK), `group_label` (text), `option_name` (text), `price_delta` (int), `sort_order` (int).

### Activities & Experiences
- **`activities`**: `id` (uuid PK), `resort_id` (uuid FK), `name` (text), `description` (text), `short_description` (text), `pricing_type` (`per_person`|`per_setup`|`per_session`), `price_per_person` (int), `price_per_setup` (int), `price_per_session` (int), `duration_minutes` (int), `max_capacity_per_slot` (int), `requires_balcony` (bool), `min_advance_hours` (int), `what_is_included` (text[]), `notes_for_guest` (text), `notes_for_staff` (text), `image_url` (text), `is_available` (bool), `sort_order` (int), `category` (text).
- **`activity_time_slots`**: `id` (uuid PK), `activity_id` (uuid FK), `label` (text), `start_time` (time), `end_time` (time), `days_available` (int[] `{0,1,2,3,4,5,6}`), `max_capacity_override` (int), `is_active` (bool), `sort_order` (int).
- **`activity_bookings`**: `id` (uuid PK), `booking_number` (text UNIQUE `EXP-XXXXX`), `activity_id` (uuid FK), `slot_id` (uuid FK), `booking_date` (date), `guest_id` (uuid FK), `room_id` (uuid FK), `guest_name` (text), `guest_phone` (text), `number_of_guests` (int), `pricing_type_snapshot` (text), `unit_price_snapshot` (int), `total_amount` (int), `status` (`pending`|`confirmed`|`completed`|`cancelled`|`no_show`), `special_requests` (text), `assigned_staff_name` (text), `staff_instructions` (text), `confirmed_by` (uuid FK staff), `cancellation_reason` (text), `created_at` (timestamptz), `updated_at` (timestamptz).

### Automation & Billing
- **`whatsapp_log`**: `id` (uuid PK), `guest_id` (uuid FK), `phone_number` (text), `message_type` (`checkin`|`checkout`), `template_name` (text), `status` (`sent`|`failed`), `provider_message_id` (text), `sent_at` (timestamptz), `error_message` (text).
- **`guest_folio` (SQL VIEW)**: Combines non-cancelled `orders` and non-cancelled `activity_bookings` into a unified timeline of room charges with descriptions, line items, subtotals, and timestamps.

---

## 3. Concurrency-Safe Time Slot Booking System

### Concept
Slots are defined as recurring templates in `activity_time_slots`. Availability for a given date is computed dynamically by summing `number_of_guests` across active bookings for that `slot_id` + `booking_date`.

### Concurrency Lock Implementation
To guarantee zero double-bookings when multiple guests book simultaneously:
1. `book_activity_slot` RPC computes a 64-bit integer hash: `v_lock_key := hashtext(p_slot_id::text || p_booking_date::text)`.
2. Calls `PERFORM pg_advisory_xact_lock(v_lock_key)` to hold an exclusive transaction-level lock on that slot+date pair.
3. Re-counts existing booked capacity (`SUM(number_of_guests)`) *after* lock acquisition.
4. Validates `p_number_guests <= (max_capacity - booked_count)`. If full, returns `SLOT_FULL`.
5. Inserts the booking and commits, releasing the advisory lock.

---

## 4. WhatsApp Automation & Edge Functions Flow
1. **Trigger**: Reception checks in a guest → RPC `check_in_guest` inserts into `guests`.
2. **Postgres Trigger**: `AFTER INSERT ON guests` fires `pg_net.http_post()` sending guest name, phone, room number to Edge Function.
3. **Edge Function**: Invokes AiSensy API endpoint using template `guest_checkin_v1` with parameters `[guest_name, room_number, portal_url]`.
4. **Log**: Edge Function logs payload and provider ID to `whatsapp_log`.
