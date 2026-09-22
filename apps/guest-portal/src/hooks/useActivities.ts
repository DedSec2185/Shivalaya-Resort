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
        setLoading(true)
        const { data, error } = await supabase
          .from('activities')
          .select('*')
          .eq('resort_id', RESORT_ID)
          .eq('is_available', true)
          .order('sort_order')

        if (error) throw error

        if (active && data) {
          setActivities(data)
        }
      } catch (error) {
        console.error('Failed to load activities', error)
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
