import { create } from 'zustand'

export interface CartItem {
  id: string
  name: string
  price: number
  qty: number
  variant_label?: string
}

interface CartStore {
  items: CartItem[]
  add: (item: CartItem) => void
  remove: (id: string, variantLabel?: string) => void
  clear: () => void
  total: () => number
  count: () => number
  getQty: (id: string) => number
}

export const useCart = create<CartStore>((set, get) => ({
  items: [],

  add: (newItem) => set(state => {
    const existing = state.items.find(
      i => i.id === newItem.id && i.variant_label === newItem.variant_label
    )
    if (existing) {
      return {
        items: state.items.map(i =>
          i.id === newItem.id && i.variant_label === newItem.variant_label
            ? { ...i, qty: i.qty + 1 }
            : i
        )
      }
    }
    return { items: [...state.items, { ...newItem, qty: 1 }] }
  }),

  remove: (id, variantLabel) => set(state => ({
    items: state.items
      .map(i => i.id === id && i.variant_label === variantLabel
        ? { ...i, qty: i.qty - 1 } : i)
      .filter(i => i.qty > 0)
  })),

  clear: () => set({ items: [] }),
  total: () => get().items.reduce((s, i) => s + i.price * i.qty, 0),
  count: () => get().items.reduce((s, i) => s + i.qty, 0),
  getQty: (id) => get().items.filter(i => i.id === id).reduce((s, i) => s + i.qty, 0),
}))
