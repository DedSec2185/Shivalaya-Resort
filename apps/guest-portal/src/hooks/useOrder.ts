import { supabase, RESORT_ID } from '../lib/supabase'
import { useCart } from '../store/useCart'
import { useNavigate } from 'react-router-dom'

const SESSION_KEY = 'panache_guest_session'

export function usePlaceOrder() {
  const cart = useCart()
  const navigate = useNavigate()

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

    // Resolve session token if present
    let sessionToken: string | null = null
    try {
      const cached = sessionStorage.getItem(SESSION_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        sessionToken = parsed.token ?? null
      }
    } catch { /* ignore */ }

    const { data, error } = await supabase.rpc('create_order', {
      p_resort_id:     RESORT_ID,
      p_service_type:  formData.serviceType,
      p_guest_name:    formData.guestName,
      p_guest_phone:   formData.guestPhone,
      p_room_number:   sessionToken ? null : (formData.roomNumber || null),
      p_table_number:  formData.tableNumber || null,
      p_items:         items,
      p_subtotal:      cart.total(),
      p_special_note:  formData.specialNote || null,
      p_session_token: sessionToken,
    })

    if (error || !data?.success) {
      return { success: false, error: error?.message || data?.error || 'Order creation failed' }
    }

    cart.clear()

    // Save guest info for next order pre-fill
    sessionStorage.setItem('guestName', formData.guestName)
    sessionStorage.setItem('guestPhone', formData.guestPhone)
    if (!sessionToken && formData.roomNumber) {
      sessionStorage.setItem('roomNumber', formData.roomNumber)
    }

    navigate(`/order/${data.order_id}`, { state: { orderNumber: data.order_number } })
    return { success: true, orderId: data.order_id }
  }
}
