import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ChefHat } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function ActiveOrderBanner() {
  const navigate = useNavigate()
  const [activeOrder, setActiveOrder] = useState<{ id: string; order_number: string; status: string } | null>(null)

  useEffect(() => {
    const lastOrderId = localStorage.getItem('panache_last_order_id')
    if (!lastOrderId) return

    let isMounted = true

    async function checkOrderStatus() {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('id, order_number, status, created_at')
          .eq('id', lastOrderId)
          .single()

        if (!error && data && isMounted) {
          if (data.status !== 'delivered' && data.status !== 'cancelled' && data.status !== 'completed') {
            setActiveOrder({
              id: data.id,
              order_number: data.order_number || 'PAN-XXXXX',
              status: data.status
            })
          } else {
            setActiveOrder(null)
          }
        }
      } catch { /* ignore */ }
    }

    checkOrderStatus()

    const channel = supabase
      .channel(`banner_order_${lastOrderId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${lastOrderId}` }, (payload) => {
        const newStatus = payload.new.status
        if (newStatus !== 'delivered' && newStatus !== 'cancelled' && newStatus !== 'completed') {
          setActiveOrder({
            id: payload.new.id,
            order_number: payload.new.order_number || 'PAN-XXXXX',
            status: newStatus
          })
        } else {
          setActiveOrder(null)
        }
      })
      .subscribe()

    return () => {
      isMounted = false
      supabase.removeChannel(channel)
    }
  }, [])

  if (!activeOrder) return null

  const statusText = activeOrder.status === 'received' ? 'Order Received'
    : activeOrder.status === 'preparing' ? 'Preparing in Kitchen'
    : activeOrder.status === 'ready' ? 'Out for Delivery / Ready'
    : 'Order In Progress'

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 80, opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={() => navigate(`/order/${activeOrder.id}`)}
        style={{
          position: 'fixed',
          bottom: '84px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)',
          maxWidth: '440px',
          zIndex: 90,
          background: 'linear-gradient(135deg, var(--forest-deep) 0%, var(--forest) 100%)',
          color: '#ffffff',
          padding: '12px 18px',
          borderRadius: '20px',
          boxShadow: '0 12px 32px rgba(26, 46, 19, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          backdropFilter: 'blur(16px)',
          WebkitTapHighlightColor: 'transparent'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '12px',
            background: 'rgba(255,255,255,0.15)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', color: 'var(--brass)'
          }}>
            <ChefHat size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--brass)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2ecc71', display: 'inline-block' }} />
              Live Order #{activeOrder.order_number}
            </div>
            <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#ffffff', marginTop: '2px' }}>
              {statusText}
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          background: 'rgba(255, 255, 255, 0.15)', padding: '8px 14px',
          borderRadius: '100px', fontSize: '12.5px', fontWeight: 700,
          color: '#ffffff', border: '1px solid rgba(255,255,255,0.2)'
        }}>
          Track <ArrowRight size={14} />
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
