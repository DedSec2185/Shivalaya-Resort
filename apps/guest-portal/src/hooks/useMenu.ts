import { useEffect, useState } from 'react'
import { supabase, RESORT_ID } from '../lib/supabase'

export interface MenuCategory {
  id: string
  resort_id: string
  name: string
  available_from: string | null
  available_until: string | null
  is_available: boolean
  sort_order: number
}

export interface MenuItem {
  id: string
  resort_id: string
  category_id: string
  name: string
  description: string | null
  base_price: number
  is_vegetarian: boolean
  is_available: boolean
  sort_order: number
  has_variants: boolean
  is_special: boolean
}

export function useMenu() {
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [items, setItems]           = useState<MenuItem[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadMenu() {
      try {
        setLoading(true)
        setError(null)

        // Fetch categories
        const { data: cats, error: catsError } = await supabase
          .from('menu_categories')
          .select('*')
          .eq('resort_id', RESORT_ID)
          .eq('is_available', true)
          .order('sort_order')

        if (catsError) throw catsError

        // Fetch all items
        const { data: menuItems, error: itemsError } = await supabase
          .from('menu_items')
          .select('*')
          .eq('resort_id', RESORT_ID)
          .eq('is_available', true)
          .order('sort_order')

        if (itemsError) throw itemsError

        if (!active) return

        // Time-gate: filter categories by current time
        const now = new Date()
        const currentMinutes = now.getHours() * 60 + now.getMinutes()

        const toMinutes = (t: string | null) => {
          if (!t) return null
          const [h, m] = t.split(':').map(Number)
          return h * 60 + m
        }

        const activeCats = (cats ?? []).filter(cat => {
          const from  = toMinutes(cat.available_from)
          const until = toMinutes(cat.available_until)
          // No time restriction = always available
          if (from === null || until === null) return true
          return currentMinutes >= from && currentMinutes < until
        })

        setCategories(activeCats)

        // Map raw DB columns to expected interface
        const mappedItems: MenuItem[] = (menuItems ?? []).map((raw: any) => ({
          id: raw.id,
          resort_id: raw.resort_id,
          category_id: raw.category_id,
          name: raw.name,
          description: raw.description ?? null,
          base_price: raw.price ?? raw.base_price ?? 0,
          is_vegetarian: raw.item_type ? raw.item_type === 'veg' : (raw.is_vegetarian ?? true),
          is_available: raw.is_available ?? true,
          sort_order: raw.sort_order ?? 0,
          has_variants: raw.has_variants ?? false,
          is_special: raw.is_special ?? false,
        }))

        setItems(mappedItems)
      } catch (err: any) {
        if (active) {
          setError(err.message || 'Failed to load menu')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadMenu()

    return () => {
      active = false
    }
  }, [])

  // Re-check time-gate every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      // Trigger a re-render to re-apply time-gate
      setCategories(prev => [...prev])
    }, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return { categories, items, loading, error }
}
