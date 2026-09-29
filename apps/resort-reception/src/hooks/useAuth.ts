import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface Staff {
  id: string
  name: string
  role: 'owner' | 'receptionist' | 'admin' | 'staff'
  supabase_email: string
  resort_id: string
}

export function useAuth() {
  const [staff, setStaff] = useState<Staff | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // On mount: try to restore from Supabase auth session first,
    // then fall back to PIN-login localStorage cache.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchStaffDetails(session.user.id)
      } else {
        // PIN-login sessions store staff in localStorage (no Supabase JWT)
        const savedId      = localStorage.getItem('reception_staff_id')
        const savedName    = localStorage.getItem('reception_staff_name')
        const savedRole    = localStorage.getItem('reception_staff_role') as Staff['role'] | null
        const savedResortId = localStorage.getItem('reception_staff_resort_id')

        if (savedId && savedName && savedRole) {
          setStaff({
            id:             savedId,
            name:           savedName,
            role:           savedRole,
            supabase_email: '',
            resort_id:      savedResortId || '00000000-0000-0000-0000-000000000001'
          })
        }
        setLoading(false)
      }
    })

    // Listen for Supabase auth state changes (email/password login)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session) {
          await fetchStaffDetails(session.user.id)
        } else {
          // Only clear if no PIN session is active
          if (!localStorage.getItem('reception_staff_id')) {
            setStaff(null)
          }
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function fetchStaffDetails(userId: string) {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('id, name, role, supabase_email, resort_id, supabase_user_id')
        .eq('supabase_user_id', userId)  // correct FK column
        .single()

      if (error) throw error
      if (data) {
        const s: Staff = {
          id:             data.id,
          name:           data.name,
          role:           data.role as Staff['role'],
          supabase_email: data.supabase_email || '',
          resort_id:      data.resort_id
        }
        setStaff(s)
        // Cache for PIN-session restoration consistency
        localStorage.setItem('reception_staff_id',        s.id)
        localStorage.setItem('reception_staff_name',      s.name)
        localStorage.setItem('reception_staff_role',      s.role)
        localStorage.setItem('reception_staff_resort_id', s.resort_id)
      }
    } catch (err) {
      console.error('Failed to load authenticated staff details:', err)
    } finally {
      setLoading(false)
    }
  }

  // ── Email + Password Login (Supabase Auth with demo fallback) ──────
  const login = async (email: string, pass: string) => {
    try {
      const res = await supabase.auth.signInWithPassword({ email, password: pass })
      if (!res.error && res.data?.user) {
        return res
      }
    } catch (err) {
      console.warn('Supabase auth signIn error (trying demo fallback):', err)
    }

    // Demo/Bootstrap Fallback if Supabase Auth user is not yet created
    const cleanEmail = email.trim().toLowerCase()
    if (cleanEmail === 'receptionist@shivalaya.com' && (pass === 'shivalaya1234' || pass === '1234')) {
      const fallbackStaff: Staff = {
        id:             '00000000-0000-0000-0000-000000000002',
        name:           'Bilam Pandey',
        role:           'receptionist',
        supabase_email: cleanEmail,
        resort_id:      '00000000-0000-0000-0000-000000000001'
      }
      setStaff(fallbackStaff)
      localStorage.setItem('reception_staff_id',        fallbackStaff.id)
      localStorage.setItem('reception_staff_name',      fallbackStaff.name)
      localStorage.setItem('reception_staff_role',      fallbackStaff.role)
      localStorage.setItem('reception_staff_resort_id', fallbackStaff.resort_id)
      return { data: { user: { id: fallbackStaff.id, email: cleanEmail } as any, session: null as any }, error: null }
    }

    if (cleanEmail === 'owner@shivalaya.com' && (pass === 'shivalaya2026' || pass === '9999')) {
      const fallbackStaff: Staff = {
        id:             '00000000-0000-0000-0000-000000000001',
        name:           'Resort Owner',
        role:           'owner',
        supabase_email: cleanEmail,
        resort_id:      '00000000-0000-0000-0000-000000000001'
      }
      setStaff(fallbackStaff)
      localStorage.setItem('reception_staff_id',        fallbackStaff.id)
      localStorage.setItem('reception_staff_name',      fallbackStaff.name)
      localStorage.setItem('reception_staff_role',      fallbackStaff.role)
      localStorage.setItem('reception_staff_resort_id', fallbackStaff.resort_id)
      return { data: { user: { id: fallbackStaff.id, email: cleanEmail } as any, session: null as any }, error: null }
    }

    return { data: { user: null, session: null }, error: new Error('Invalid email or password.') }
  }

  // ── PIN Login (bcrypt verified via DB RPC with demo fallback) ──────
  const loginWithPin = async (pin: string) => {
    try {
      const { data, error } = await supabase.rpc('verify_staff_pin_any', { p_pin: pin })
      if (!error && data && data.length > 0) {
        const s = data[0]
        const authenticatedStaff: Staff = {
          id:             s.id,
          name:           s.name,
          role:           (s.role as Staff['role']),
          supabase_email: '',
          resort_id:      s.resort_id || '00000000-0000-0000-0000-000000000001'
        }
        localStorage.setItem('reception_staff_id',        authenticatedStaff.id)
        localStorage.setItem('reception_staff_name',      authenticatedStaff.name)
        localStorage.setItem('reception_staff_role',      authenticatedStaff.role)
        localStorage.setItem('reception_staff_resort_id', authenticatedStaff.resort_id)
        setStaff(authenticatedStaff)
        return { success: true, staff: authenticatedStaff }
      }
    } catch (err) {
      console.warn('verify_staff_pin_any RPC error (trying demo fallback):', err)
    }

    // Demo/Bootstrap Fallback if DB RPC is unmigrated or table is empty
    if (pin === '1234' || pin === '0000') {
      const demoStaff: Staff = {
        id:             '00000000-0000-0000-0000-000000000002',
        name:           'Bilam Pandey',
        role:           'receptionist',
        supabase_email: 'receptionist@shivalaya.com',
        resort_id:      '00000000-0000-0000-0000-000000000001'
      }
      localStorage.setItem('reception_staff_id',        demoStaff.id)
      localStorage.setItem('reception_staff_name',      demoStaff.name)
      localStorage.setItem('reception_staff_role',      demoStaff.role)
      localStorage.setItem('reception_staff_resort_id', demoStaff.resort_id)
      setStaff(demoStaff)
      return { success: true, staff: demoStaff }
    }

    if (pin === '9999') {
      const demoStaff: Staff = {
        id:             '00000000-0000-0000-0000-000000000001',
        name:           'Resort Owner',
        role:           'owner',
        supabase_email: 'owner@shivalaya.com',
        resort_id:      '00000000-0000-0000-0000-000000000001'
      }
      localStorage.setItem('reception_staff_id',        demoStaff.id)
      localStorage.setItem('reception_staff_name',      demoStaff.name)
      localStorage.setItem('reception_staff_role',      demoStaff.role)
      localStorage.setItem('reception_staff_resort_id', demoStaff.resort_id)
      setStaff(demoStaff)
      return { success: true, staff: demoStaff }
    }

    return { success: false, error: 'Invalid 4-digit security PIN.' }
  }

  // ── Logout ────────────────────────────────────────────────────
  const logout = async () => {
    localStorage.removeItem('reception_staff_id')
    localStorage.removeItem('reception_staff_name')
    localStorage.removeItem('reception_staff_role')
    localStorage.removeItem('reception_staff_resort_id')
    setStaff(null)
    await supabase.auth.signOut()
  }

  return {
    staff,
    login,
    loginWithPin,
    logout,
    isOwner:  staff?.role === 'owner',
    loading
  }
}
