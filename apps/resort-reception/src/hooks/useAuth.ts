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
    // Session recovery from localStorage as dev fallback
    const savedId = localStorage.getItem('reception_staff_id')
    const savedName = localStorage.getItem('reception_staff_name')
    const savedRole = localStorage.getItem('reception_staff_role') as any
    const savedResortId = localStorage.getItem('reception_staff_resort_id')

    if (savedName && savedRole) {
      setStaff({
        id: savedId || 'dev-staff-id',
        name: savedName,
        role: savedRole,
        supabase_email: savedRole === 'owner' ? 'owner@shivalaya.com' : 'receptionist@shivalaya.com',
        resort_id: savedResortId || '00000000-0000-0000-0000-000000000001'
      })
      setLoading(false)
    } else {
      // Get current auth session from Supabase
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          fetchStaffDetails(session.user.id)
        } else {
          setLoading(false)
        }
      })
    }

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session) {
          await fetchStaffDetails(session.user.id)
        } else {
          // If no localStorage saved name, clear staff
          if (!localStorage.getItem('reception_staff_name')) {
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
        .select('*')
        .eq('supabase_user_id', userId)
        .single()

      if (error) throw error
      if (data) {
        setStaff({
          id: data.id,
          name: data.name,
          role: data.role as any,
          supabase_email: data.supabase_email,
          resort_id: data.resort_id
        })
      }
    } catch (err) {
      console.error('Failed to load authenticated staff details:', err)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, pass: string) => {
    // Local Dev fallback bypass
    if (email === 'owner@shivalaya.com' && pass === 'shivalaya2026') {
      const devOwner: Staff = {
        id: 'owner-dev-id',
        name: 'Resort Owner',
        role: 'owner',
        supabase_email: email,
        resort_id: '00000000-0000-0000-0000-000000000001'
      }
      localStorage.setItem('reception_staff_name', devOwner.name)
      localStorage.setItem('reception_staff_role', devOwner.role)
      localStorage.setItem('reception_staff_resort_id', devOwner.resort_id)
      setStaff(devOwner)
      return { data: { user: { id: 'owner-dev-id' } }, error: null }
    }

    if (email === 'receptionist@shivalaya.com' && pass === 'shivalaya1234') {
      const devReceptionist: Staff = {
        id: 'reception-dev-id',
        name: 'Reception Desk',
        role: 'receptionist',
        supabase_email: email,
        resort_id: '00000000-0000-0000-0000-000000000001'
      }
      localStorage.setItem('reception_staff_name', devReceptionist.name)
      localStorage.setItem('reception_staff_role', devReceptionist.role)
      localStorage.setItem('reception_staff_resort_id', devReceptionist.resort_id)
      setStaff(devReceptionist)
      return { data: { user: { id: 'reception-dev-id' } }, error: null }
    }

    // Call real Supabase Auth
    const res = await supabase.auth.signInWithPassword({ email, password: pass })
    return res
  }

  const loginWithPin = async (pin: string) => {
    // 1. Try PostgreSQL RPC with pgcrypto crypt() hashing
    try {
      const { data, error } = await supabase.rpc('verify_staff_pin_any', { p_pin: pin })
      if (!error && data && data.length > 0) {
        const s = data[0]
        const authenticatedStaff: Staff = {
          id: s.id,
          name: s.name,
          role: (s.role === 'owner' ? 'owner' : 'receptionist'),
          supabase_email: s.role === 'owner' ? 'owner@shivalaya.com' : 'receptionist@shivalaya.com',
          resort_id: s.resort_id || '00000000-0000-0000-0000-000000000001'
        }
        localStorage.setItem('reception_staff_id', authenticatedStaff.id)
        localStorage.setItem('reception_staff_name', authenticatedStaff.name)
        localStorage.setItem('reception_staff_role', authenticatedStaff.role)
        localStorage.setItem('reception_staff_resort_id', authenticatedStaff.resort_id)
        setStaff(authenticatedStaff)
        return { success: true, staff: authenticatedStaff }
      }
    } catch (err) {
      console.warn('RPC verify_staff_pin_any error, fallback checked:', err)
    }

    // 2. Production / Dev official PINs
    if (pin === '1234') {
      const devReceptionist: Staff = {
        id: 'reception-dev-id',
        name: 'Bilam Pandey (Front Desk)',
        role: 'receptionist',
        supabase_email: 'receptionist@shivalaya.com',
        resort_id: '00000000-0000-0000-0000-000000000001'
      }
      localStorage.setItem('reception_staff_id', devReceptionist.id)
      localStorage.setItem('reception_staff_name', devReceptionist.name)
      localStorage.setItem('reception_staff_role', devReceptionist.role)
      localStorage.setItem('reception_staff_resort_id', devReceptionist.resort_id)
      setStaff(devReceptionist)
      return { success: true, staff: devReceptionist }
    }

    if (pin === '9999') {
      const devOwner: Staff = {
        id: 'owner-dev-id',
        name: 'Resort Owner',
        role: 'owner',
        supabase_email: 'owner@shivalaya.com',
        resort_id: '00000000-0000-0000-0000-000000000001'
      }
      localStorage.setItem('reception_staff_id', devOwner.id)
      localStorage.setItem('reception_staff_name', devOwner.name)
      localStorage.setItem('reception_staff_role', devOwner.role)
      localStorage.setItem('reception_staff_resort_id', devOwner.resort_id)
      setStaff(devOwner)
      return { success: true, staff: devOwner }
    }

    return { success: false, error: 'Invalid 4-digit security PIN.' }
  }

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
    isOwner: staff?.role === 'owner',
    loading
  }
}
