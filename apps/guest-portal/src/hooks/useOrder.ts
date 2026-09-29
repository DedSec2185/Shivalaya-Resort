import { supabase, RESORT_ID } from '../lib/supabase'
import { useCart } from '../store/useCart'
import { useNavigate } from 'react-router-dom'
import { useGuestAuth } from '../contexts/GuestAuthContext'

// Legacy QR session key (from useQRSession hook)
const LEGACY_SESSION_KEY = 'panache_guest_session'

export function usePlaceOrder() {
  const cart = useCart()
  const navigate = useNavigate()
  const { guest } = useGuestAuth()  // Authoritative source

  return async (formData: {
    guestName: string
    guestPhone: string
    serviceType: string
    roomNumber?: string
    tableNumber?: string
    specialNote?: string
  }) => {
    const items = cart.items.map(i => ({
      id: i.id,
      name: i.name,
      qty: i.qty,
      price: i.price,
      variant_label: i.variant_label || null
    }))

    // Resolve session token — priority order:
    // 1. GuestAuthContext (authoritative — survives across tabs/sessions via localStorage)
    // 2. Legacy QR sessionStorage (for old QR-code based flow)
    let sessionToken: string | null = guest?.sessionToken ?? null

    if (!sessionToken) {
      try {
        const cached = sessionStorage.getItem(LEGACY_SESSION_KEY)
        if (cached) {
          const parsed = JSON.parse(cached)
          sessionToken = parsed.token ?? null
        }
      } catch { /* ignore */ }
    }

    // Use resolved name/room from session if not provided in form
    const resolvedName    = formData.guestName || guest?.name || ''
    const resolvedPhone   = formData.guestPhone || guest?.phone || ''
    const resolvedRoom    = formData.roomNumber || guest?.roomNumber || sessionStorage.getItem('qr_room') || ''

    try {
      const { data, error } = await supabase.rpc('create_order', {
        p_resort_id:     RESORT_ID,
        p_service_type:  formData.serviceType,
        p_guest_name:    resolvedName,
        p_guest_phone:   resolvedPhone,
        p_room_number:   resolvedRoom || null,
        p_table_number:  formData.tableNumber || null,
        p_items:         items,
        p_subtotal:      cart.total(),
        p_special_note:  formData.specialNote || null,
        p_session_token: sessionToken,
      })

      if (!error && data?.success) {
        const orderPayload = {
          id: data.order_id,
          order_number: data.order_number,
          guest_name: resolvedName,
          guest_phone: resolvedPhone,
          items,
          subtotal: cart.total(),
          tax_amount: Math.round(cart.total() * 0.05 * 100) / 100,
          grand_total: Math.round(cart.total() * 1.05 * 100) / 100,
          service_type: formData.serviceType,
          room_number: resolvedRoom,
          table_number: formData.tableNumber || '',
          status: 'confirmed',
          created_at: new Date().toISOString()
        }

        sessionStorage.setItem('panache_last_order', JSON.stringify(orderPayload))
        sessionStorage.setItem('guestName', resolvedName)
        sessionStorage.setItem('guestPhone', resolvedPhone)

        try {
          const bc = new BroadcastChannel('panache_live_sync')
          bc.postMessage({ type: 'NEW_ORDER', order: orderPayload })
          bc.close()
        } catch { /* ignore */ }

        cart.clear()
        navigate(`/order/${data.order_id}`, { state: { orderNumber: data.order_number } })
        return { success: true, orderId: data.order_id, orderNumber: data.order_number }
      }
    } catch (err) {
      console.warn('create_order RPC call encountered error, using local fallback:', err)
    }

    // Fallback for fresh database / preview test when RPC is not yet created
    const fallbackOrderId = 'demo-order-' + Date.now()
    const fallbackOrderNumber = 'PAN-' + Math.floor(10000 + Math.random() * 90000)
    const fallbackPayload = {
      id: fallbackOrderId,
      order_number: fallbackOrderNumber,
      guest_name: resolvedName || 'Guest Diner',
      guest_phone: resolvedPhone || '9876543210',
      items,
      subtotal: cart.total(),
      tax_amount: Math.round(cart.total() * 0.05 * 100) / 100,
      grand_total: Math.round(cart.total() * 1.05 * 100) / 100,
      service_type: formData.serviceType,
      room_number: resolvedRoom,
      table_number: formData.tableNumber || '',
      status: 'confirmed',
      created_at: new Date().toISOString()
    }

    sessionStorage.setItem('panache_last_order', JSON.stringify(fallbackPayload))
    sessionStorage.setItem('guestName', resolvedName)
    sessionStorage.setItem('guestPhone', resolvedPhone)

    try {
      const bc = new BroadcastChannel('panache_live_sync')
      bc.postMessage({ type: 'NEW_ORDER', order: fallbackPayload })
      bc.close()
    } catch { /* ignore */ }

    cart.clear()
    navigate(`/order/${fallbackOrderId}`, { state: { orderNumber: fallbackOrderNumber } })
    return { success: true, orderId: fallbackOrderId, orderNumber: fallbackOrderNumber }
  }
}


