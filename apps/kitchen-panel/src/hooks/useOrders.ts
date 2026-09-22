import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { playBeep, showBrowserNotification } from '../lib/notifications'

export interface Order {
  id: string
  order_number: string
  resort_id: string
  guest_id: string | null
  room_id: string | null
  table_id: string | null
  service_type: string
  guest_name: string
  guest_phone: string
  items: Array<{
    id: string
    name: string
    qty: number
    price: number
    variant_label?: string | null
  }>
  subtotal: number
  status: string
  special_note: string | null
  created_at: string
  updated_at: string
  // Resolved info for display
  room_number?: string
  table_number?: string
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const updateLocalStatus = (orderId: string, newStatus: string) => {
    setOrders((prev) =>
      prev
        .map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        .filter((o) => o.status !== 'served')
    )
  }

  useEffect(() => {
    let active = true

    async function loadInitialOrders() {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .not('status', 'in', '("served","cancelled")')
          .order('created_at', { ascending: false })

        if (error) throw error

        if (active) {
          if (data && data.length > 0) {
            const resolvedOrders = await Promise.all(
              data.map(async (order) => {
                let room_number = ''
                let table_number = ''

                if (order.room_id) {
                  const { data: rm } = await supabase
                    .from('rooms')
                    .select('room_number')
                    .eq('id', order.room_id)
                    .single()
                  if (rm) room_number = rm.room_number
                }

                if (order.table_id) {
                  const { data: tbl } = await supabase
                    .from('restaurant_tables')
                    .select('table_number')
                    .eq('id', order.table_id)
                    .single()
                  if (tbl) table_number = tbl.table_number
                }

                return {
                  ...order,
                  room_number,
                  table_number
                }
              })
            )
            setOrders(resolvedOrders)
          } else {
            setOrders([])
          }
          setError(null)
        }
      } catch (err: any) {
        console.error('Supabase live orders query error:', err)
        if (active) {
          setError(err?.message || 'Error loading live orders')
          setOrders([])
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadInitialOrders()

    const channel = supabase
      .channel('kitchen_orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        async (payload) => {
          const newOrder = payload.new as Order
          
          let room_number = ''
          let table_number = ''
          
          if (newOrder.room_id) {
            const { data: rm } = await supabase
              .from('rooms')
              .select('room_number')
              .eq('id', newOrder.room_id)
              .single()
            if (rm) room_number = rm.room_number
          }
          
          if (newOrder.table_id) {
            const { data: tbl } = await supabase
              .from('restaurant_tables')
              .select('table_number')
              .eq('id', newOrder.table_id)
              .single()
            if (tbl) table_number = tbl.table_number
          }

          const resolvedOrder = { ...newOrder, room_number, table_number }

          setOrders((prev) => [resolvedOrder, ...prev])
          playBeep()
          showBrowserNotification(resolvedOrder)
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        async (payload) => {
          const updatedOrder = payload.new as Order
          
          if (['served', 'cancelled'].includes(updatedOrder.status)) {
            setOrders((prev) => prev.filter((o) => o.id !== updatedOrder.id))
          } else {
            setOrders((prev) =>
              prev.map((o) => {
                if (o.id === updatedOrder.id) {
                  return {
                    ...updatedOrder,
                    room_number: o.room_number,
                    table_number: o.table_number
                  }
                }
                return o
              })
            )
          }
        }
      )
      .subscribe()

    return () => {
      active = false
      supabase.removeChannel(channel)
    }
  }, [])

  return {
    orders,
    setOrders,
    updateLocalStatus,
    newOrders: orders.filter((o) => o.status === 'new' || o.status === 'confirmed'),
    inProgress: orders.filter((o) => o.status === 'preparing'),
    readyOrders: orders.filter((o) => o.status === 'ready'),
    totalToday: orders.length,
    loading,
    error
  }
}
