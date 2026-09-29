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
  const [categories, setCategories] = useState<MenuCategory[]>(FALLBACK_CATEGORIES)
  const [items, setItems]           = useState<MenuItem[]>(FALLBACK_ITEMS)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadMenu() {
      try {
        setError(null)

        // Enforce a 2.5s strict timeout so local offline docker / unreachable host never hangs the app
        const fetchWithTimeout = async () => {
          const timeoutPromise = new Promise<{ data: null; error: Error }>((_, reject) =>
            setTimeout(() => reject(new Error('Network timeout: Supabase unreachable')), 2500)
          )

          const fetchCategories = supabase
            .from('menu_categories')
            .select('*')
            .eq('resort_id', RESORT_ID)
            .eq('is_available', true)
            .order('sort_order')

          const fetchItems = supabase
            .from('menu_items')
            .select('*')
            .eq('resort_id', RESORT_ID)
            .eq('is_available', true)
            .order('sort_order')

          const [catsResult, itemsResult] = await Promise.race([
            Promise.all([fetchCategories, fetchItems]),
            timeoutPromise
          ]) as any

          return { catsResult, itemsResult }
        }

        const { catsResult, itemsResult } = await fetchWithTimeout()

        if (catsResult.error) throw catsResult.error
        if (itemsResult.error) throw itemsResult.error

        const cats = catsResult.data
        const menuItems = itemsResult.data

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
          if (from === null || until === null) return true
          return currentMinutes >= from && currentMinutes < until
        })

        if (activeCats.length > 0 && menuItems && menuItems.length > 0) {
          setCategories(activeCats)

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
        } else {
          // If Supabase table is empty or outside scheduled window, fallback to curated Panache menu
          setCategories(FALLBACK_CATEGORIES)
          setItems(FALLBACK_ITEMS)
        }
      } catch (err: any) {
        if (active) {
          console.warn('Using curated Panache menu fallback:', err?.message)
          // Keep FALLBACK_CATEGORIES and FALLBACK_ITEMS active
          setCategories(FALLBACK_CATEGORIES)
          setItems(FALLBACK_ITEMS)
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

const FALLBACK_CATEGORIES: MenuCategory[] = [
  { id: 'cat-starters', resort_id: RESORT_ID, name: 'Clay Oven Starters', available_from: null, available_until: null, is_available: true, sort_order: 1 },
  { id: 'cat-mains', resort_id: RESORT_ID, name: 'Royal Curries & Mains', available_from: null, available_until: null, is_available: true, sort_order: 2 },
  { id: 'cat-breads', resort_id: RESORT_ID, name: 'Breads & Himalayan Rice', available_from: null, available_until: null, is_available: true, sort_order: 3 },
  { id: 'cat-beverages', resort_id: RESORT_ID, name: 'Beverages & Desserts', available_from: null, available_until: null, is_available: true, sort_order: 4 },
]

const FALLBACK_ITEMS: MenuItem[] = [
  // Starters
  {
    id: 'item-chk-tandoori',
    resort_id: RESORT_ID,
    category_id: 'cat-starters',
    name: 'Panache Signature Tandoori Chicken',
    description: 'Tender chicken marinated in crushed mustard, Kashmiri chilies and hung curd, slow-roasted in charcoal clay oven.',
    base_price: 480,
    is_vegetarian: false,
    is_available: true,
    sort_order: 1,
    has_variants: false,
    is_special: true,
  },
  {
    id: 'item-pnr-tikka',
    resort_id: RESORT_ID,
    category_id: 'cat-starters',
    name: 'Bhatti Ka Malai Paneer Tikka',
    description: 'Succulent malai cottage cheese cubes infused with green cardamom, mace, and crushed black pepper.',
    base_price: 380,
    is_vegetarian: true,
    is_available: true,
    sort_order: 2,
    has_variants: false,
    is_special: true,
  },
  {
    id: 'item-aloo-gutke',
    resort_id: RESORT_ID,
    category_id: 'cat-starters',
    name: 'Kumaoni Aloo Ke Gutke',
    description: 'Mountain baby potatoes flash-fried in pure mustard oil, tempered with wild Himalayan herbs and roasted coriander.',
    base_price: 260,
    is_vegetarian: true,
    is_available: true,
    sort_order: 3,
    has_variants: false,
    is_special: false,
  },
  {
    id: 'item-corn-salt-pepper',
    resort_id: RESORT_ID,
    category_id: 'cat-starters',
    name: 'Crisp Sweet Corn Salt & Pepper',
    description: 'Golden fried sweet corn kernels tossed with crunchy spring onions, crushed garlic, and freshly cracked black pepper.',
    base_price: 280,
    is_vegetarian: true,
    is_available: true,
    sort_order: 4,
    has_variants: false,
    is_special: false,
  },
  // Mains
  {
    id: 'item-kumaoni-murgh',
    resort_id: RESORT_ID,
    category_id: 'cat-mains',
    name: 'Kumaoni Handi Murgh',
    description: 'Village-style country chicken simmered slowly in an earthen pot with coarse whole spices and roasted onion gravy.',
    base_price: 540,
    is_vegetarian: false,
    is_available: true,
    sort_order: 1,
    has_variants: false,
    is_special: true,
  },
  {
    id: 'item-dal-tadka',
    resort_id: RESORT_ID,
    category_id: 'cat-mains',
    name: 'Pahadi Dal Tadka (Gahat / Arhar)',
    description: 'High-altitude yellow lentils double-tempered in desi ghee with smoked dry red chilies, garlic, and wild cumin.',
    base_price: 320,
    is_vegetarian: true,
    is_available: true,
    sort_order: 2,
    has_variants: false,
    is_special: false,
  },
  {
    id: 'item-pnr-lababdar',
    resort_id: RESORT_ID,
    category_id: 'cat-mains',
    name: 'Paneer Lababdar',
    description: 'Cottage cheese simmered in a luscious tomato-cashew satin gravy with grated paneer and kasuri methi.',
    base_price: 420,
    is_vegetarian: true,
    is_available: true,
    sort_order: 3,
    has_variants: false,
    is_special: true,
  },
  {
    id: 'item-mutton-rara',
    resort_id: RESORT_ID,
    category_id: 'cat-mains',
    name: 'Shivalaya Mutton Rara',
    description: 'Tender baby lamb cuts cooked in rich minced mutton gravy infused with cloves, black cardamom, and saffron.',
    base_price: 640,
    is_vegetarian: false,
    is_available: true,
    sort_order: 4,
    has_variants: false,
    is_special: true,
  },
  // Breads & Rice
  {
    id: 'item-butter-garlic-naan',
    resort_id: RESORT_ID,
    category_id: 'cat-breads',
    name: 'Butter Garlic Naan',
    description: 'Clay-oven baked leavened flatbread brushed with garlic butter and fresh coriander.',
    base_price: 90,
    is_vegetarian: true,
    is_available: true,
    sort_order: 1,
    has_variants: false,
    is_special: false,
  },
  {
    id: 'item-tandoori-roti',
    resort_id: RESORT_ID,
    category_id: 'cat-breads',
    name: 'Tandoori Butter Roti',
    description: 'Whole wheat bread crisp-baked on the walls of clay tandoor, topped with farm butter.',
    base_price: 40,
    is_vegetarian: true,
    is_available: true,
    sort_order: 2,
    has_variants: false,
    is_special: false,
  },
  {
    id: 'item-chk-biryani',
    resort_id: RESORT_ID,
    category_id: 'cat-breads',
    name: 'Dum Pukht Chicken Biryani',
    description: 'Aromatic long-grain basmati layered with marinated chicken, saffron milk, and caramelized onions with mint raita.',
    base_price: 490,
    is_vegetarian: false,
    is_available: true,
    sort_order: 3,
    has_variants: false,
    is_special: true,
  },
  // Beverages & Desserts
  {
    id: 'item-himalayan-kahwa',
    resort_id: RESORT_ID,
    category_id: 'cat-beverages',
    name: 'Himalayan Green Tea Kahwa',
    description: 'Steaming green tea brewed with Kashmiri saffron strands, green cardamom, cinnamon quill, and slivered almonds.',
    base_price: 140,
    is_vegetarian: true,
    is_available: true,
    sort_order: 1,
    has_variants: false,
    is_special: true,
  },
  {
    id: 'item-buransh-squash',
    resort_id: RESORT_ID,
    category_id: 'cat-beverages',
    name: 'Organic Rhododendron (Buransh) Nectar',
    description: 'Hand-pressed juice of wild Himalayan rhododendron flowers mixed with spring water and sweet basil seeds.',
    base_price: 160,
    is_vegetarian: true,
    is_available: true,
    sort_order: 2,
    has_variants: false,
    is_special: true,
  },
  {
    id: 'item-walnut-brownie',
    resort_id: RESORT_ID,
    category_id: 'cat-beverages',
    name: 'Sizzling Mountain Walnut Brownie',
    description: 'Warm dark chocolate fudge brownie studded with toasted Almora walnuts, served with a scoop of vanilla ice cream.',
    base_price: 220,
    is_vegetarian: true,
    is_available: true,
    sort_order: 3,
    has_variants: false,
    is_special: true,
  },
]

