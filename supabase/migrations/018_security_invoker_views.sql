-- Migration 018: Enforce security_invoker on public views
-- Fixes Supabase Security Advisor warnings regarding SECURITY DEFINER views.
-- In PostgreSQL 15+, views default to owner permissions unless security_invoker = true is set.

ALTER VIEW IF EXISTS public.guest_folio SET (security_invoker = true);
ALTER VIEW IF EXISTS public.current_stock SET (security_invoker = true);
