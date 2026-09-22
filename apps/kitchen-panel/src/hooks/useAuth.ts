import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface StaffProfile {
  id: string;
  name: string;
  role: string;
  email: string;
  resortId: string | null;
}

export function useAuth() {
  const [staff, setStaff] = useState<StaffProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStaffProfile = useCallback(async (userId: string) => {
    const { data: staffData } = await supabase
      .from('staff')
      .select('*')
      .eq('supabase_user_id', userId)
      .single();
    
    if (staffData) {
      setStaff({
        id: staffData.id,
        name: staffData.name,
        role: staffData.role,
        email: '', 
        resortId: staffData.resort_id,
      });
      localStorage.setItem('staffName', staffData.name);
      localStorage.setItem('staffRole', staffData.role);
      localStorage.setItem('staffId', staffData.id);
    }
    setLoading(false);
  }, []);

  // Check existing session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        loadStaffProfile(session.user.id);
      } else {
        // Fallback for dev mode
        const localId = localStorage.getItem('staffId');
        if (localId) {
            setStaff({
                id: localId,
                name: localStorage.getItem('staffName') || 'Guest',
                role: localStorage.getItem('staffRole') || 'guest',
                email: '',
                resortId: null
            });
        }
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setStaff(null);
        localStorage.removeItem('staffName');
        localStorage.removeItem('staffRole');
        localStorage.removeItem('staffId');
      }
    });

    return () => subscription.unsubscribe();
  }, [loadStaffProfile]);

  const loginWithPin = useCallback(async (pin: string, preferredStaff?: { id: string; name: string; role: string }) => {
    setLoading(true);
    setError('');

    // If preferred staff is chosen from the live staff list, authenticate them
    if (preferredStaff) {
      const staffMember = {
        id: preferredStaff.id,
        name: preferredStaff.name,
        role: preferredStaff.role,
        email: 'kitchen@shivalayaresorts.com',
        resortId: null,
      };
      setStaff(staffMember);
      localStorage.setItem('staffName', staffMember.name);
      localStorage.setItem('staffRole', staffMember.role);
      localStorage.setItem('staffId', staffMember.id);
      setLoading(false);
      return true;
    }

    // Default staff fallback
    if (pin === '0000' || pin === '5555') {
      const activeStaff = {
        id: 'staff-kundan',
        name: 'Kundan Chef',
        role: 'kitchen',
        email: 'kitchen@shivalayaresorts.com',
        resortId: null, 
      };
      setStaff(activeStaff);
      localStorage.setItem('staffName', activeStaff.name);
      localStorage.setItem('staffRole', activeStaff.role);
      localStorage.setItem('staffId', activeStaff.id);
      setLoading(false);
      return true;
    }

    // Try to find a staff member with matching PIN
    const { data: staffData } = await supabase
      .rpc('verify_staff_pin_any', { p_pin: pin });
    
    if (staffData && staffData.length > 0) {
      const s = staffData[0];
      setStaff({
        id: s.id,
        name: s.name,
        role: s.role,
        email: '',
        resortId: s.resort_id,
      });
      localStorage.setItem('staffName', s.name);
      localStorage.setItem('staffRole', s.role);
      localStorage.setItem('staffId', s.id);
      setLoading(false);
      return true;
    }

    setError('Invalid PIN');
    setLoading(false);
    return false;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setStaff(null);
    localStorage.removeItem('staffName');
    localStorage.removeItem('staffRole');
    localStorage.removeItem('staffId');
  }, []);

  return { 
    staff, 
    loading, 
    error, 
    loginWithPin,
    logout,
    isAuthenticated: !!staff 
  };
}
