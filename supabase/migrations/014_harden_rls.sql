-- =============================================================
-- 014_harden_rls.sql
-- Security Hardening: Revoke Direct Anonymous Table Inserts
-- Enforce SECURITY DEFINER RPC execution for orders & bookings
-- =============================================================

-- Drop permissive direct insert policy on orders (orders MUST go through create_order RPC)
DROP POLICY IF EXISTS anon_insert_orders ON orders;

-- Drop permissive direct insert policy on activity_bookings (bookings MUST go through book_activity_slot RPC)
DROP POLICY IF EXISTS anon_insert_bookings ON activity_bookings;

-- Ensure public anon role cannot directly insert into orders or activity_bookings
-- (RPCs create_order and book_activity_slot run as SECURITY DEFINER so they bypass RLS securely)
