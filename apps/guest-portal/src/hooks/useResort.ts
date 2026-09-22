import { useState, useEffect } from 'react'
import { supabase, RESORT_ID } from '../lib/supabase'

export interface Resort {
  id: string
  name: string
  location_text?: string
  logo_url?: string
}

export function useResort() {
  const [resort, setResort] = useState<Resort | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadResort() {
      try {
        const { data, error } = await supabase
          .from('resorts')
          .select('*')
          .eq('id', RESORT_ID)
          .single()

        if (error) throw error
        setResort(data)
      } catch (err) {
        console.error('Failed to load resort', err)
      } finally {
        setLoading(false)
      }
    }
    loadResort()
  }, [])

  return { resort, loading }
}
