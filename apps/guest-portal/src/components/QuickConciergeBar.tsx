import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, Sparkles, UtensilsCrossed, Car, CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function QuickConciergeBar() {
  const navigate = useNavigate()
  const [modalMessage, setModalMessage] = useState<string | null>(null)

  const handleAction = (type: string) => {
    if (type === 'dining') {
      navigate('/menu')
    } else if (type === 'reception') {
      window.location.href = 'tel:+917668009400'
    } else if (type === 'housekeeping') {
      setModalMessage('Housekeeping has been notified for your room. A staff member will attend shortly.')
    } else if (type === 'travel') {
      setModalMessage('Travel & Cab Desk connected! For immediate taxi or airport transfers, please call Extension 104 or visit reception.')
    }
  }

  const TILES = [
    { id: 'reception', label: 'Front Desk', sub: 'Ext. 100', icon: Phone, color: 'var(--forest)' },
    { id: 'dining', label: 'Room Dining', sub: 'Panache', icon: UtensilsCrossed, color: 'var(--brass)' },
    { id: 'housekeeping', label: 'Housekeeping', sub: 'Room Care', icon: Sparkles, color: 'var(--forest)' },
    { id: 'travel', label: 'Travel & Cab', sub: 'Desk', icon: Car, color: 'var(--brass)' }
  ]

  return (
    <div style={{ margin: '16px 16px 20px' }}>
      <div style={{
        fontSize: '11px',
        fontWeight: 800,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'var(--brass)',
        marginBottom: '10px',
        paddingLeft: '4px'
      }}>
        Guest Concierge Services
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '8px'
      }}>
        {TILES.map((t) => {
          const Icon = t.icon
          return (
            <motion.button
              key={t.id}
              whileTap={{ scale: 0.92 }}
              whileHover={{ y: -2 }}
              onClick={() => handleAction(t.id)}
              style={{
                background: 'var(--card)',
                border: '1px solid rgba(173, 138, 63, 0.25)',
                borderRadius: '16px',
                padding: '12px 6px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(44, 74, 34, 0.05)',
                WebkitTapHighlightColor: 'transparent'
              }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(44, 74, 34, 0.07)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: t.color
              }}>
                <Icon size={17} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--forest-deep)',
                  lineHeight: 1.1
                }}>
                  {t.label}
                </div>
                <div style={{
                  fontSize: '9.5px',
                  color: 'var(--sage)',
                  fontFamily: 'IBM Plex Mono, monospace',
                  marginTop: '2px'
                }}>
                  {t.sub}
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Confirmation modal */}
      <AnimatePresence>
        {modalMessage && (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            background: 'rgba(18, 22, 16, 0.65)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
          }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                background: 'var(--parchment)',
                padding: '24px',
                borderRadius: '24px',
                maxWidth: '320px',
                textAlign: 'center',
                border: '1px solid rgba(173,138,63,0.3)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.25)'
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(44,74,34,0.1)',
                color: 'var(--forest)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px'
              }}>
                <CheckCircle2 size={26} />
              </div>
              <h4 style={{
                margin: '0 0 8px 0',
                fontFamily: 'Fraunces, serif',
                fontSize: '18px',
                color: 'var(--forest-deep)'
              }}>
                Request Received
              </h4>
              <p style={{
                fontSize: '13px',
                color: 'var(--ink-soft)',
                lineHeight: 1.5,
                margin: '0 0 20px 0'
              }}>
                {modalMessage}
              </p>
              <button
                onClick={() => setModalMessage(null)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'var(--forest-deep)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Okay, Understood
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
