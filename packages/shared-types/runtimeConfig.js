const DEMO_URL = 'https://placeholder.supabase.co';

function toBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === '1' || normalized === 'true' || normalized === 'yes';
  }
  return false;
}

export function getRuntimeEnv(env = {}) {
  const url = String(env.VITE_SUPABASE_URL || '').trim();
  const anonKey = String(env.VITE_SUPABASE_ANON_KEY || '').trim();
  const explicitDemoMode = toBoolean(env.VITE_APP_DEMO_MODE);

  const isConfigured = Boolean(url && anonKey && url !== DEMO_URL);
  const isDemoMode = explicitDemoMode || !isConfigured;

  return {
    isConfigured,
    isDemoMode,
    mode: isConfigured ? 'configured' : 'demo',
    supabase: {
      url: url || DEMO_URL,
      anonKey: anonKey || 'placeholder-key',
    },
  };
}
