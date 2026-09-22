import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ChefHat, X } from 'lucide-react'
import { supabase } from '../lib/supabase'

const FINAL_STATUSES = ['delivered', 'cancelled', 'completed', 'served']

export default function ActiveOrderBanner() {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeOrder, setActiveOrder] = useState<{ id: string; order_number: string; status: string } | null>(null)
  const [dismissed, setDismissed] = useState(false)

  // Do not show on login, profile, or active order tracking screen
  const isExcludedPage = 
    location.pathname === '/login' || 
    location.pathname === '/profile' || 
    location.pathname.startsWith('/order/')

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
          if (!FINAL_STATUSES.includes(data.status)) {
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
        if (!FINAL_STATUSES.includes(newStatus)) {
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

  if (isExcludedPage || dismissed || !activeOrder) return null

  const statusText = activeOrder.status === 'received' || activeOrder.status === 'new' ? 'Order Received'
    : activeOrder.status === 'confirmed' ? 'Order Confirmed'
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
          padding: '10px 14px',
          borderRadius: '20px',
          boxShadow: '0 12px 32px rgba(26, 46, 19, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backdropFilter: 'blur(16px)',
          WebkitTapHighlightColor: 'transparent'
        }}
      >
        <div 
          onClick={() => navigate(`/order/${activeOrder.id}`)}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: 1, overflow: 'hidden' }}
        >
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'rgba(255,255,255,0.15)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', color: 'var(--brass)', flexShrink: 0
          }}>
            <ChefHat size={18} />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--brass-light)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2ecc71', display: 'inline-block' }} />
              Live #{activeOrder.order_number}
            </div>
            <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#ffffff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {statusText}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => navigate(`/order/${activeOrder.id}`)}
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              background: 'rgba(255, 255, 255, 0.18)', padding: '6px 12px',
              borderRadius: '100px', fontSize: '12px', fontWeight: 700,
              color: '#ffffff', border: '1px solid rgba(255,255,255,0.25)', cursor: 'pointer'
            }}
          >
            Track <ArrowRight size={13} />
          </button>
          <button
            type="button"
            aria-label="Dismiss active order bar"
            onClick={(e) => {
              e.stopPropagation()
              setDismissed(true)
            }}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '26px',
              height: '26px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255,255,255,0.7)',
              cursor: 'pointer'
            }}
          >
            <X size={14} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
