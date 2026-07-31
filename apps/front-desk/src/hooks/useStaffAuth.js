import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { RPC } from '@panache/supabase-schema';
import { getRuntimeEnv } from '@panache/shared-types';

const SESSION_KEY = 'panache_staff_session';

const DEFAULT_STAFF = {
  id: 'REC-101',
  name: 'Demo Receptionist',
  role: 'receptionist',
  phone: '+91 98765 43210',
  email: 'reception@shivalayaresort.com',
  dutyStatus: 'On Duty',
  joinedDate: '15 Jan 2025',
  pin: '1234',
};

export function useStaffAuth() {
  const [staff, setStaff] = useState(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      return saved ? { ...DEFAULT_STAFF, ...JSON.parse(saved) } : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = useCallback(async (pin) => {
    setLoading(true);
    setError('');

    const { isDemoMode } = getRuntimeEnv(import.meta.env);

    if (isDemoMode) {
      // In demo mode, check stored staff pin or default 1234
      const activePin = staff?.pin || '1234';
      if (pin === activePin || pin === '1234') {
        const member = staff || DEFAULT_STAFF;
        setStaff(member);
        localStorage.setItem(SESSION_KEY, JSON.stringify(member));
        setLoading(false);
        return true;
      } else {
        setError(`Invalid PIN (Try ${activePin})`);
        setLoading(false);
        return false;
      }
    }

    const { data, error: rpcError } = await supabase.rpc(RPC.VERIFY_STAFF_PIN, {
      p_pin: pin,
      p_required_role: 'receptionist',
    });

    if (rpcError || !data?.length) {
      setError('Invalid PIN. Please try again.');
      setLoading(false);
      return false;
    }

    const member = { ...DEFAULT_STAFF, ...data[0] };
    setStaff(member);
    localStorage.setItem(SESSION_KEY, JSON.stringify(member));
    setLoading(false);
    return true;
  }, [staff]);

  const updateProfile = useCallback((updatedFields) => {
    setStaff(prev => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updatePin = useCallback((currentPin, newPin) => {
    if (staff?.pin && staff.pin !== currentPin) {
      return { success: false, message: 'Current PIN is incorrect' };
    }
    if (!/^\d{4}$/.test(newPin)) {
      return { success: false, message: 'New PIN must be exactly 4 digits' };
    }

    setStaff(prev => {
      const updated = { ...prev, pin: newPin };
      localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
      return updated;
    });
    return { success: true, message: 'PIN updated successfully!' };
  }, [staff]);

  const logout = useCallback(() => {
    setStaff(null);
    localStorage.removeItem(SESSION_KEY);
  }, []);

  return { staff, loading, error, login, logout, updateProfile, updatePin, isAuthenticated: !!staff };
}
