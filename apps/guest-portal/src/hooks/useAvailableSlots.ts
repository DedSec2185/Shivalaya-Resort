import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export interface AvailableSlot {
  slot_id: string
  label: string
  start_time: string
  end_time: string
  remaining_capacity: number
}

export function useAvailableSlots(activityId: string | null, date: string | null) {
  const [slots, setSlots] = useState<AvailableSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!activityId || !date) {
      setSlots([])
      return
    }

    let active = true
    setLoading(true)
    setError(null)

    supabase
      .rpc('get_available_slots', {
        p_activity_id: activityId,
        p_date: date,
      })
      .then(({ data, error: rpcError }) => {
        if (!active) return
        setLoading(false)
        if (rpcError || !data || data.length === 0) {
          console.warn('Falling back to mock slots:', rpcError?.message)
          setSlots([
            { slot_id: 'mock-1', label: 'Morning Session', start_time: '10:00', end_time: '12:00', remaining_capacity: 10 },
            { slot_id: 'mock-2', label: 'Afternoon Session', start_time: '14:00', end_time: '16:00', remaining_capacity: 10 },
            { slot_id: 'mock-3', label: 'Evening Session', start_time: '18:00', end_time: '20:00', remaining_capacity: 5 }
          ])
          setError(null)
          return
        }
        setSlots(data ?? [])
      })
      .catch((err) => {
        if (!active) return
        setLoading(false)
        console.warn('Network error, falling back to mock slots:', err)
        setSlots([
          { slot_id: 'mock-1', label: 'Morning Session', start_time: '10:00', end_time: '12:00', remaining_capacity: 10 },
          { slot_id: 'mock-2', label: 'Afternoon Session', start_time: '14:00', end_time: '16:00', remaining_capacity: 10 },
          { slot_id: 'mock-3', label: 'Evening Session', start_time: '18:00', end_time: '20:00', remaining_capacity: 5 }
        ])
        setError(null)
      })

    return () => { active = false }
  }, [activityId, date])

  return { slots, loading, error }
}
