const DEMO_URL = 'https://placeholder.supabase.co';

function toBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === '1' || normalized === 'true' || normalized === 'yes';
  }
  return false;
}

export const PORTAL_DEFAULTS = {
  GUEST_PORTAL: {
    name: 'Guest Experience Portal',
    devPort: 5190,
    devUrl: 'http://localhost:5190',
    prodUrl: 'https://order.panache-shivalaya.com',
  },
  KITCHEN_PANEL: {
    name: 'Kitchen Display System (KDS)',
    devPort: 5181,
    devUrl: 'http://localhost:5181',
    prodUrl: 'https://kds.panache-shivalaya.com',
  },
  RESORT_RECEPTION: {
    name: 'Resort Reception Console',
    devPort: 5183,
    devUrl: 'http://localhost:5183',
    prodUrl: 'https://staff.panache-shivalaya.com',
  },
};

export function getPortalUrls(env = {}) {
  const isDev = typeof window !== 'undefined'
    ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    : false;

  return {
    guestPortal: env.VITE_GUEST_PORTAL_URL || (isDev ? PORTAL_DEFAULTS.GUEST_PORTAL.devUrl : PORTAL_DEFAULTS.GUEST_PORTAL.prodUrl),
    kitchenPanel: env.VITE_KITCHEN_PORTAL_URL || (isDev ? PORTAL_DEFAULTS.KITCHEN_PANEL.devUrl : PORTAL_DEFAULTS.KITCHEN_PANEL.prodUrl),
    resortReception: env.VITE_RECEPTION_PORTAL_URL || (isDev ? PORTAL_DEFAULTS.RESORT_RECEPTION.devUrl : PORTAL_DEFAULTS.RESORT_RECEPTION.prodUrl),
  };
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
    portals: getPortalUrls(env),
  };
}
