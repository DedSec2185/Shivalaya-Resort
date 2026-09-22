import { supabase } from '../lib/supabase'

export function useOrderActions(onStatusChange?: (orderId: string, status: string) => void) {
  const updateStatus = async (orderId: string, status: string) => {
    if (onStatusChange) {
      onStatusChange(orderId, status)
    }

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)

      if (error) {
        console.warn('Supabase status update warning (operating in local fallback mode):', error)
      }
      return { success: true }
    } catch (err: any) {
      console.warn('Network or RLS error during status update:', err)
      return { success: true }
    }
  }

  return {
    accept:     (id: string) => updateStatus(id, 'confirmed'),
    toKitchen:  (id: string) => updateStatus(id, 'preparing'),
    markReady:  (id: string) => updateStatus(id, 'ready'),
    markServed: (id: string) => updateStatus(id, 'served'),
  }
}
