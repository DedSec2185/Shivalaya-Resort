import test from 'node:test';
import assert from 'node:assert/strict';
import { getRuntimeEnv, getPortalUrls } from '../packages/shared-types/runtimeConfig.js';

test('getRuntimeEnv should expose a safe production configuration shape', () => {
  const config = getRuntimeEnv({
    VITE_SUPABASE_URL: 'https://example.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'anon-key',
    VITE_APP_DEMO_MODE: 'false',
  });

  assert.equal(config.isDemoMode, false);
  assert.equal(config.isConfigured, true);
  assert.equal(config.supabase.url, 'https://example.supabase.co');
  assert.equal(config.supabase.anonKey, 'anon-key');
  assert.ok(config.portals);
  assert.equal(typeof config.portals.guestPortal, 'string');
  assert.equal(typeof config.portals.kitchenPanel, 'string');
  assert.equal(typeof config.portals.resortReception, 'string');
});

test('getPortalUrls should respect custom environment overrides', () => {
  const urls = getPortalUrls({
    VITE_GUEST_PORTAL_URL: 'https://custom-guest.com',
    VITE_KITCHEN_PORTAL_URL: 'https://custom-kitchen.com',
    VITE_RECEPTION_PORTAL_URL: 'https://custom-staff.com',
  });

  assert.equal(urls.guestPortal, 'https://custom-guest.com');
  assert.equal(urls.kitchenPanel, 'https://custom-kitchen.com');
  assert.equal(urls.resortReception, 'https://custom-staff.com');
});
