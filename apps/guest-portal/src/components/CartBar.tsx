import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, ChevronRight } from 'lucide-react'

interface CartBarProps {
  totalItems: number
  total: number
  onCheckout: () => void
}

export default function CartBar({ totalItems, total, onCheckout }: CartBarProps) {
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    if (totalItems > 0) {
      setPulse(true)
      const timer = setTimeout(() => setPulse(false), 300)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [totalItems])

  return (
    <AnimatePresence>
      {totalItems > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          style={{
            position: 'fixed',
            bottom: '80px', // Above the bottom nav
            left: 0,
            right: 0,
            maxWidth: '440px', // slightly smaller than the 480px container
            margin: '0 auto',
            padding: '0 20px',
            zIndex: 90,
          }}
        >
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={onCheckout}
            style={{
              background: 'linear-gradient(135deg, rgba(26,46,19,0.95) 0%, rgba(44,74,34,0.95) 100%)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '24px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            {/* Gloss overlay */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%)', pointerEvents: 'none' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', zIndex: 1 }}>
              <motion.div 
                animate={pulse ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
                style={{
                  width: '44px', height: '44px', borderRadius: '16px',
                  background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative'
                }}
              >
                <ShoppingBag size={20} color="var(--parchment)" />
                <div style={{
                  position: 'absolute', top: '-6px', right: '-6px',
                  background: 'var(--brass)', color: '#fff', fontSize: '11px', fontWeight: 800,
                  width: '20px', height: '20px', borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                }}>
                  {totalItems}
                </div>
              </motion.div>
              
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Subtotal</span>
                <span style={{ fontSize: '18px', color: '#fff', fontWeight: 700, fontFamily: 'Fraunces, serif' }}>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--parchment)', padding: '10px 16px 10px 20px', borderRadius: '16px', zIndex: 1 }}>
              <span style={{ color: 'var(--forest-deep)', fontSize: '14px', fontWeight: 700 }}>View Cart</span>
              <ChevronRight size={18} color="var(--forest-deep)" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
