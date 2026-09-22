import { useState } from 'react'
import { supabase } from '../lib/supabase'

const SESSION_KEY = 'panache_guest_session'

export interface BookParams {
  activityId: string
  slotId: string
  date: string
  numberOfGuests: number
  guestName: string
  guestPhone: string
  roomNumber: string
  specialRequests?: string | null
}

export function useBookActivity() {
  const [status, setStatus] = useState<null | 'loading' | 'success' | 'slot_full' | 'error'>(null)
  const [booking, setBooking] = useState<any | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  const book = async (params: BookParams) => {
    setStatus('loading')
    setErrorMessage('')

    // Resolve session token if present
    let sessionToken: string | null = null
    try {
      const cached = sessionStorage.getItem(SESSION_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        sessionToken = parsed.token ?? null
      }
    } catch { /* ignore */ }

    try {
      if (params.slotId.startsWith('mock-')) {
        await new Promise(r => setTimeout(r, 800))
        const mockData = { booking_id: 'mock-booking-' + Date.now(), success: true }
        setBooking(mockData)
        setStatus('success')
        return
      }

      const { data, error } = await supabase.rpc('book_activity_slot', {
        p_activity_id:    params.activityId,
        p_slot_id:        params.slotId,
        p_booking_date:   params.date,
        p_number_guests:  params.numberOfGuests,
        p_guest_name:     params.guestName,
        p_guest_phone:    params.guestPhone,
        p_room_number:    sessionToken ? null : params.roomNumber,
        p_special_requests: params.specialRequests ?? null,
        p_session_token:  sessionToken,
      })

      if (error) {
        setStatus('error')
        setErrorMessage(error.message)
        return
      }

      if (!data) {
        setStatus('error')
        setErrorMessage('No response received from booking server.')
        return
      }

      if (data.success === false) {
        if (data.error === 'SLOT_FULL') {
          setStatus('slot_full')
        } else {
          setStatus('error')
          setErrorMessage(data.message || 'An error occurred during booking.')
        }
        return
      }

      setBooking(data)
      setStatus('success')

      const existing = JSON.parse(sessionStorage.getItem('myBookings') || '[]')
      sessionStorage.setItem('myBookings', JSON.stringify([...existing, data.booking_id]))
    } catch (err: any) {
      console.error('Booking submission failed:', err)
      setStatus('error')
      setErrorMessage(err.message || 'An unexpected error occurred.')
    }
  }

  return { book, status, booking, errorMessage }
}
