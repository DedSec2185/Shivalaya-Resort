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
            // If DB is empty, provide initial realistic orders for seamless demo testing
            setOrders(DEMO_INITIAL_ORDERS)
          }
          setError(null)
        }
      } catch (err: any) {
        console.warn('Supabase live orders query warning (using initial demo board):', err?.message)
        if (active) {
          setError(null)
          setOrders(DEMO_INITIAL_ORDERS)
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadInitialOrders()

    // ── Local Cross-Tab Sync via BroadcastChannel ──
    let bc: BroadcastChannel | null = null
    try {
      bc = new BroadcastChannel('panache_live_sync')
      bc.onmessage = (e) => {
        if (e.data?.type === 'NEW_ORDER' && e.data?.order) {
          const incoming = e.data.order as Order
          setOrders((prev) => {
            if (prev.some(o => o.id === incoming.id)) return prev
            return [incoming, ...prev]
          })
          playBeep()
          showBrowserNotification(incoming)
        } else if (e.data?.type === 'ORDER_STATUS_CHANGED') {
          const { orderId, status } = e.data
          if (['served', 'cancelled'].includes(status)) {
            setOrders((prev) => prev.filter((o) => o.id !== orderId))
          } else {
            setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)))
          }
        }
      }
    } catch { /* ignore */ }

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

          setOrders((prev) => {
            if (prev.some(o => o.id === resolvedOrder.id)) return prev
            return [resolvedOrder, ...prev]
          })
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
      try { bc?.close() } catch { /* ignore */ }
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

const DEMO_INITIAL_ORDERS: Order[] = [
  {
    id: 'demo-ord-101',
    order_number: 'PAN-00104',
    resort_id: '00000000-0000-0000-0000-000000000001',
    guest_id: null,
    room_id: null,
    table_id: null,
    service_type: 'dine_in',
    guest_name: 'Karan Malhotra (Walk-In)',
    guest_phone: '9876543211',
    room_number: '',
    table_number: 'T-03',
    items: [
      { id: 'item-chk-tandoori', name: 'Panache Signature Tandoori Chicken', qty: 1, price: 480 },
      { id: 'item-butter-garlic-naan', name: 'Butter Garlic Naan', qty: 2, price: 90 },
      { id: 'item-buransh-squash', name: 'Organic Rhododendron Nectar', qty: 2, price: 160 }
    ],
    subtotal: 970,
    status: 'new',
    special_note: 'Medium spice level, serve piping hot',
    created_at: new Date(Date.now() - 4 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 60000).toISOString(),
  },
  {
    id: 'demo-ord-102',
    order_number: 'PAN-00098',
    resort_id: '00000000-0000-0000-0000-000000000001',
    guest_id: null,
    room_id: null,
    table_id: null,
    service_type: 'room_service',
    guest_name: 'Abhay Sharma (Room 204)',
    guest_phone: '9876543210',
    room_number: '204',
    table_number: '',
    items: [
      { id: 'item-kumaoni-murgh', name: 'Kumaoni Handi Murgh', qty: 1, price: 540 },
      { id: 'item-dal-tadka', name: 'Pahadi Dal Tadka', qty: 1, price: 320 },
      { id: 'item-tandoori-roti', name: 'Tandoori Butter Roti', qty: 4, price: 40 }
    ],
    subtotal: 1020,
    status: 'preparing',
    special_note: 'Deliver with extra mint chutney and sliced spiced onions',
    created_at: new Date(Date.now() - 14 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 60000).toISOString(),
  }
]

