# Panache Ordering System Deployment Plan

## Objective
Deploy the three Vite apps as production-ready static frontends backed by a shared Supabase project.

## Required runtime configuration
Each app must have:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Deployment target
Recommended: separate Vercel projects per app.

## Build commands
- Customer menu: `pnpm build:menu`
- Front desk: `pnpm build:desk`
- Owner dashboard: `pnpm build:owner`

## Production guardrails
- No placeholder Supabase URL or anon key in production.
- Use demo mode only for local development and demos.
- Keep the `verify_staff_pin()` RPC in Supabase for staff PIN validation.
- Set `VITE_APP_DEMO_MODE=false` in production if using an explicit override.

## Post-deploy validation
1. Confirm the customer menu loads.
2. Submit a test order.
3. Confirm the order appears in the front desk queue.
4. Advance statuses and confirm log auditing.
5. Verify owner analytics totals and CSV export.
