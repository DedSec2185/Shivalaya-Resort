import test from 'node:test';
import assert from 'node:assert/strict';
import { getRuntimeEnv } from '../packages/shared-types/runtimeConfig.js';

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
});
