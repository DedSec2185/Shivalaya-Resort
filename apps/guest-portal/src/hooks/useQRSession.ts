/**
 * useQRSession — Guest Portal session token resolution
 *
 * On mount, reads `token` from URL search params and resolves it via RPC.
 * Also handles legacy QR params (room/table/type) for backwards compat.
 * Stores resolved guest details in sessionStorage for the browser session.
 *
 * Usage:
 *   const { session, loading, expired } = useQRSession()
 */

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export interface GuestSession {
  token: string
  guestId: string | null
  roomId: string | null
  roomNumber: string
  guestName: string
  guestPhone: string
  resortId: string | null
}

const SESSION_KEY = 'panache_guest_session'

export function useQRSession() {
  const [session, setSession] = useState<GuestSession | null>(null)
  const [loading, setLoading] = useState(false)
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    // ── Legacy QR params (room/table/type) — keep for desk QR codes ──
    const room  = params.get('room')
    const table = params.get('table')
    const type  = params.get('type')
    if (room)  sessionStorage.setItem('qr_room',  room)
    if (table) sessionStorage.setItem('qr_table', table)
    if (type)  sessionStorage.setItem('qr_type',  type)

    // ── New secure session token ──────────────────────────────────────
    const token = params.get('token')
    if (!token) return

    // Use cached resolution if already done this browser session
    const cached = sessionStorage.getItem(SESSION_KEY)
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as GuestSession
        if (parsed.token === token) {
          setSession(parsed)
          return
        }
      } catch {
        sessionStorage.removeItem(SESSION_KEY)
      }
    }

    setLoading(true)
    supabase
      .rpc('resolve_guest_session', { p_token: token })
      .then(({ data, error }) => {
        setLoading(false)
        if (error || !data || !data.valid) {
          setExpired(true)
          return
        }
        const resolved: GuestSession = {
          token,
          guestId: data.guest_id ?? null,
          roomId: data.room_id ?? null,
          roomNumber: data.room_number ?? '',
          guestName: data.guest_name ?? '',
          guestPhone: data.guest_phone ?? '',
          resortId: data.resort_id ?? null,
        }
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(resolved))
        // Also populate legacy keys so checkout form picks them up
        sessionStorage.setItem('qr_room', resolved.roomNumber)
        sessionStorage.setItem('guestName', resolved.guestName)
        sessionStorage.setItem('guestPhone', resolved.guestPhone)
        setSession(resolved)
      })
  }, [])

  function clearSession() {
    sessionStorage.removeItem(SESSION_KEY)
    setSession(null)
    setExpired(false)
  }

  return { session, loading, expired, clearSession }
}
