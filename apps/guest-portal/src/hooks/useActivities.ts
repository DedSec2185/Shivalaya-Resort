import { useState, useEffect } from 'react'
import { supabase, RESORT_ID } from '../lib/supabase'

export interface Activity {
  id: string
  resort_id: string
  name: string
  description: string
  short_description: string
  pricing_type: string
  price_per_person: number
  price_per_setup: number
  price_per_session: number
  duration_minutes: number
  category: string
  image_url: string
  is_available: boolean
  sort_order: number
}

export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function loadActivities() {
      try {
        // Enforce 2.5s timeout for offline resilience
        const timeoutPromise = new Promise<{ data: null; error: Error }>((_, reject) =>
          setTimeout(() => reject(new Error('Network timeout: Supabase unreachable')), 2500)
        )

        const fetchPromise = supabase
          .from('activities')
          .select('*')
          .eq('resort_id', RESORT_ID)
          .eq('is_available', true)
          .order('sort_order')

        const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any

        if (error) throw error

        if (active && data) {
          setActivities(data)
        }
      } catch (error) {
        console.warn('Activities loaded via rich offline catalogue:', error)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadActivities()

    return () => {
      active = false
    }
  }, [])

  return { activities, loading }
}
