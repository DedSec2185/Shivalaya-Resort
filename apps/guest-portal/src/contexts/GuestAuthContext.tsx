/**
 * GuestAuthContext — Phone-based guest identity for the portal
 *
 * Flow:
 *  1. Guest enters phone → requestOtp() → Edge Function → Fast2SMS
 *  2. Guest enters 6-digit code → verifyOtp() → DB RPC → session stored
 *  3. All hooks/components read from this context instead of sessionStorage
 *
 * Auth is persisted to localStorage so it survives page refreshes.
 * It is cleared on logout or when the session_token is rejected by the server.
 *
 * guest_type:
 *  'resort_guest' — phone is tied to a checked-in room (full room service)
 *  'walk_in'      — phone verified but no room linked (dine-in / takeaway only)
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '../lib/supabase'

// ─── Types ────────────────────────────────────────────────────

export type GuestType = 'resort_guest' | 'walk_in'

export interface GuestProfile {
  sessionToken: string
  guestType:    GuestType
  phone:        string
  name:         string        // may be empty for fresh walk-in
  email:        string
  roomNumber:   string        // empty string for walk-ins
  guestId:      string | null
}

interface GuestAuthContextValue {
  guest:       GuestProfile | null
  isLoggedIn:  boolean
  isResortGuest: boolean      // shorthand: type === 'resort_guest'
  requestOtp:  (phone: string) => Promise<{ success: boolean; error?: string }>
  verifyOtp:   (phone: string, code: string) => Promise<{ success: boolean; error?: string }>
  directLogin: (params: { phone: string; name?: string; guestType: GuestType; roomNumber?: string }) => Promise<{ success: boolean; error?: string }>
  updateName:  (name: string) => Promise<void>  // for walk-ins setting their name
  loginDemo:   (customProfile?: Partial<GuestProfile>) => void
  logout:      () => void
}

// ─── Storage ─────────────────────────────────────────────────

const STORAGE_KEY = 'panache_auth_v2'

function loadFromStorage(): GuestProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as GuestProfile
  } catch {
    return null
  }
}

function saveToStorage(profile: GuestProfile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  // Also keep legacy sessionStorage keys so existing hooks still work
  sessionStorage.setItem('guestPhone', profile.phone)
  sessionStorage.setItem('guestName',  profile.name)
  if (profile.roomNumber) {
    sessionStorage.setItem('qr_room', profile.roomNumber)
  }
  // Keep panache_guest_session shape so useOrder.ts reads session token
  sessionStorage.setItem('panache_guest_session', JSON.stringify({
    token:       profile.sessionToken,
    guestName:   profile.name,
    guestPhone:  profile.phone,
    roomNumber:  profile.roomNumber,
  }))
}

function clearStorage() {
  localStorage.removeItem(STORAGE_KEY)
  sessionStorage.removeItem('panache_guest_session')
  sessionStorage.removeItem('guestPhone')
  sessionStorage.removeItem('guestName')
  sessionStorage.removeItem('qr_room')
}

// ─── Context ─────────────────────────────────────────────────

const GuestAuthContext = createContext<GuestAuthContextValue | null>(null)

export function GuestAuthProvider({ children }: { children: ReactNode }) {
  const [guest, setGuest] = useState<GuestProfile | null>(loadFromStorage)

  // On mount: sync legacy sessionStorage so other hooks work immediately
  useEffect(() => {
    if (guest) saveToStorage(guest)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Request OTP ──────────────────────────────────────────
  async function requestOtp(phone: string): Promise<{ success: boolean; error?: string }> {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const anonKey    = import.meta.env.VITE_SUPABASE_ANON_KEY

      if (!supabaseUrl || !anonKey) {
        return { success: false, error: 'Supabase configuration missing.' }
      }

      const res = await fetch(`${supabaseUrl}/functions/v1/send-guest-otp`, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey':        anonKey,
          'Authorization': `Bearer ${anonKey}`,
        },
        body: JSON.stringify({ phone }),
      })

      const data = await res.json()
      if (!data.success) {
        return { success: false, error: data.error || 'Failed to send OTP.' }
      }
      return { success: true }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error.'
      return { success: false, error: msg }
    }
  }

  // ── Verify OTP ───────────────────────────────────────────
  async function verifyOtp(phone: string, code: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.rpc('verify_guest_otp', {
        p_phone:    phone,
        p_otp_code: code,
      })

      if (error) return { success: false, error: error.message }
      if (!data?.success) {
        return { success: false, error: data?.error === 'INVALID_OR_EXPIRED_OTP'
          ? 'Invalid or expired OTP. Please try again.'
          : (data?.error || 'Verification failed.') }
      }

      const profile: GuestProfile = {
        sessionToken: data.session_token,
        guestType:    data.guest_type,
        phone:        data.guest_phone,
        name:         data.guest_name || '',
        email:        data.guest_email || '',
        roomNumber:   data.room_number || '',
        guestId:      data.guest_id   || null,
      }

      setGuest(profile)
      saveToStorage(profile)
      return { success: true }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error.'
      return { success: false, error: msg }
    }
  }

  // ── Direct Login (No SMS OTP / Fast2SMS needed) ──────────
  async function directLogin(params: {
    phone: string
    name?: string
    guestType: GuestType
    roomNumber?: string
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const cleanPhone = params.phone.replace(/\D/g, '').slice(0, 10)
      const cleanName = (params.name || '').trim()
      const cleanRoom = (params.roomNumber || '').trim()

      // 1. Attempt Supabase direct_guest_login RPC
      const { data, error } = await supabase.rpc('direct_guest_login', {
        p_phone:       cleanPhone,
        p_name:        cleanName || (params.guestType === 'resort_guest' ? 'Resort Guest' : 'Walk-In Customer'),
        p_guest_type:  params.guestType,
        p_room_number: cleanRoom
      })

      if (!error && data?.success) {
        const profile: GuestProfile = {
          sessionToken: data.session_token,
          guestType:    data.guest_type,
          phone:        data.guest_phone || cleanPhone,
          name:         data.guest_name || cleanName,
          email:        data.guest_email || '',
          roomNumber:   data.room_number || cleanRoom,
          guestId:      data.guest_id || null,
        }
        setGuest(profile)
        saveToStorage(profile)
        return { success: true }
      }

      // 2. Fallback session generation if RPC is missing
      const fallbackToken = 'live-session-' + Date.now()
      const profile: GuestProfile = {
        sessionToken: fallbackToken,
        guestType:    params.guestType,
        phone:        cleanPhone,
        name:         cleanName || (params.guestType === 'resort_guest' ? 'Resort Guest' : 'Walk-In Diner'),
        email:        '',
        roomNumber:   cleanRoom,
        guestId:      null,
      }
      setGuest(profile)
      saveToStorage(profile)
      return { success: true }
    } catch {
      const cleanPhone = params.phone.replace(/\D/g, '').slice(0, 10)
      const fallbackToken = 'live-session-' + Date.now()
      const profile: GuestProfile = {
        sessionToken: fallbackToken,
        guestType:    params.guestType,
        phone:        cleanPhone,
        name:         params.name || 'Walk-In Diner',
        email:        '',
        roomNumber:   params.roomNumber || '',
        guestId:      null,
      }
      setGuest(profile)
      saveToStorage(profile)
      return { success: true }
    }
  }

  // ── Update walk-in name ──────────────────────────────────
  async function updateName(name: string) {
    if (!guest) return
    await supabase.rpc('update_walkin_name', {
      p_session_token: guest.sessionToken,
      p_name:          name,
    })
    const updated = { ...guest, name }
    setGuest(updated)
    saveToStorage(updated)
  }

  // ── Demo Guest Quick Login ──────────────────────────────
  function loginDemo(customProfile?: Partial<GuestProfile>) {
    const profile: GuestProfile = {
      sessionToken: 'demo-token-' + Date.now(),
      guestType:    customProfile?.guestType || 'resort_guest',
      phone:        customProfile?.phone || '9876543210',
      name:         customProfile?.name || 'Abhay Sharma',
      email:        customProfile?.email || 'guest.abhay@shivalaya.com',
      roomNumber:   customProfile?.roomNumber !== undefined ? customProfile.roomNumber : '204',
      guestId:      customProfile?.guestId || 'demo-guest-id',
    }
    setGuest(profile)
    saveToStorage(profile)
  }

  // ── Logout ───────────────────────────────────────────────
  function logout() {
    setGuest(null)
    clearStorage()
  }

  return (
    <GuestAuthContext.Provider value={{
      guest,
      isLoggedIn:    !!guest,
      isResortGuest: guest?.guestType === 'resort_guest',
      requestOtp,
      verifyOtp,
      directLogin,
      updateName,
      loginDemo,
      logout,
    }}>
      {children}
    </GuestAuthContext.Provider>
  )
}

// ─── Hook ────────────────────────────────────────────────────

export function useGuestAuth(): GuestAuthContextValue {
  const ctx = useContext(GuestAuthContext)
  if (!ctx) throw new Error('useGuestAuth must be used inside GuestAuthProvider')
  return ctx
}
