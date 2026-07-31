import { useState, useCallback } from 'react';
import { DEMO_OWNER } from '../utils/demoData';

const SESSION_KEY = 'panache_owner_session';

export function useOwnerAuth() {
  const [owner, setOwner] = useState(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const login = useCallback(async (pin) => {
    setLoading(true);
    setError('');

    await new Promise(r => setTimeout(r, 400)); // simulate network

    // In demo mode: accept 0000 or owner's pin
    const validPin = DEMO_OWNER.pin;
    if (pin === validPin || pin === '0000') {
      const session = { ...DEMO_OWNER };
      setOwner(session);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      setLoading(false);
      return true;
    }

    setError('Invalid PIN. Try 0000 for the demo.');
    setLoading(false);
    return false;
  }, []);

  const logout = useCallback(() => {
    setOwner(null);
    sessionStorage.removeItem(SESSION_KEY);
  }, []);

  const updateProfile = useCallback((fields) => {
    setOwner(prev => {
      const updated = { ...prev, ...fields };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updatePin = useCallback((current, next) => {
    if (owner?.pin && owner.pin !== current) return { ok: false, msg: 'Current PIN is incorrect' };
    if (!/^\d{4}$/.test(next)) return { ok: false, msg: 'PIN must be exactly 4 digits' };
    updateProfile({ pin: next });
    return { ok: true, msg: 'PIN updated!' };
  }, [owner, updateProfile]);

  return { owner, loading, error, login, logout, updateProfile, updatePin, isAuthenticated: !!owner };
}
