import { createClient } from '@supabase/supabase-js';
import { getRuntimeEnv } from '@panache/shared-types';

const { isConfigured, isDemoMode, supabase: runtimeSupabase } = getRuntimeEnv(import.meta.env);

if (!isConfigured) {
  console.warn(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example to .env and fill in your Supabase credentials.'
  );
}

export const supabase = createClient(
  runtimeSupabase.url,
  runtimeSupabase.anonKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        'x-app-mode': isDemoMode ? 'demo' : 'production',
      },
    },
  }
);
