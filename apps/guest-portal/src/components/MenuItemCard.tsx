import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus, ChefHat, Flame } from 'lucide-react'
import { getDishDescription } from '../data/dishDescriptions'

interface MenuItemCardProps {
  item: {
    id: string
    name: string
    base_price: number
    description: string | null
    is_vegetarian: boolean
    is_special: boolean
    is_available: boolean
    has_variants: boolean
  }
  qty: number
  onAdd: () => void
  onRemove: () => void
  rowIndex?: number
}

function getMountainTag(name: string, isVeg: boolean): string | null {
  const n = name.toLowerCase()
  if (n.includes('tikka') || n.includes('kebab') || n.includes('tandoori')) return 'Woodfire Sigri Charred'
  if (n.includes('biryani') || n.includes('rice') || n.includes('pulao')) return 'Cast Iron Dum Cooked'
  if (n.includes('soup') || n.includes('tea') || n.includes('chai') || n.includes('kahwa')) return 'Himalayan Herbal Infusion'
  if (n.includes('mutton') || n.includes('chicken') || n.includes('pahadi')) return 'Kumaoni Jakhiya Spiced'
  if (n.includes('paneer') || n.includes('dal') || n.includes('curry')) return 'Stone Sil-Batta Ground'
  if (n.includes('bread') || n.includes('roti') || n.includes('naan')) return 'Clay Oven Baked'
  return isVeg ? 'Mountain Valley Farm-Grown' : 'Artisanal Mountain Feast'
}

export default function MenuItemCard({ item, qty, onAdd, onRemove, rowIndex = 0 }: MenuItemCardProps) {
  const isUnavailable = item.is_available === false
  const mountainTag = getMountainTag(item.name, item.is_vegetarian)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="card-3d-wrap" style={{ marginBottom: '16px' }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: Math.min(rowIndex * 0.04, 0.3) }}
        whileHover={{
          y: -4,
          rotateX: 1.5,
          scale: 1.006,
          transition: { duration: 0.25, ease: 'easeOut' }
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="menu-item-card card-3d-interactive"
        style={{
          background: isHovered ? 'rgba(255, 255, 255, 0.98)' : 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: isHovered 
            ? '1.5px solid rgba(173, 138, 63, 0.5)' 
            : '1.5px solid rgba(26, 46, 19, 0.09)',
          borderRadius: '20px',
          padding: '20px',
          display: 'flex',
          gap: '16px',
          alignItems: 'flex-start',
          opacity: isUnavailable ? 0.5 : 1,
          pointerEvents: isUnavailable ? 'none' : 'auto',
          boxShadow: isHovered 
            ? '0 16px 36px rgba(26, 46, 19, 0.1), 0 0 16px rgba(173, 138, 63, 0.15)' 
            : '0 4px 18px rgba(0,0,0,0.03)',
          transition: 'border-color 0.25s ease, box-shadow 0.25s ease'
        }}
      >
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Veg/NonVeg Indicator */}
            <div style={{
              width: '16px', height: '16px', borderRadius: '4px', border: `1.5px solid ${item.is_vegetarian ? '#2ecc71' : '#e74c3c'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.is_vegetarian ? '#2ecc71' : '#e74c3c' }} />
            </div>

            <span className="menu-item-title" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--forest-deep)', fontFamily: 'Fraunces, serif', lineHeight: 1.25 }}>
              {item.name}
            </span>

            {item.is_special && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', padding: '2px 8px', borderRadius: '6px' }}>
                <ChefHat size={12} color="var(--brass)" />
                <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--brass)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Chef's Special</span>
              </div>
            )}
          </div>

          {/* Himalayan Culinary Note */}
          {mountainTag && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', alignSelf: 'flex-start' }}>
              <Flame size={12} color="var(--brass)" />
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--brass)', letterSpacing: '0.02em' }}>
                {mountainTag}
              </span>
            </div>
          )}

          <p className="menu-item-desc" style={{ fontSize: '13px', color: '#4A4536', lineHeight: 1.5, margin: '2px 0 6px' }}>
            {getDishDescription(item.name, item.description)}
          </p>

          <span className="menu-item-price" style={{ fontSize: '17px', fontWeight: 700, color: 'var(--brass)', fontFamily: 'IBM Plex Mono, monospace' }}>
            ₹{(item.base_price ?? 0).toLocaleString('en-IN')}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', alignSelf: 'center' }}>
          {isUnavailable ? (
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', padding: '8px' }}>Sold Out</span>
          ) : qty === 0 ? (
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={onAdd}
              className="btn-gold-sweep"
              style={{
                background: 'linear-gradient(135deg, #1A2E13 0%, #2C4A22 100%)',
                border: '1px solid rgba(173, 138, 63, 0.4)',
                borderRadius: '12px',
                padding: '9px 22px',
                color: '#fff',
                fontWeight: 700,
                fontSize: '14px',
                display: 'flex', alignItems: 'center', gap: '4px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(44, 74, 34, 0.25)'
              }}
            >
              Add {item.has_variants && <Plus size={14} />}
            </motion.button>
          ) : (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              background: 'var(--parchment)', borderRadius: '12px', padding: '4px',
              border: '1px solid rgba(173, 138, 63, 0.2)'
            }}>
              <motion.button whileTap={{ scale: 0.8 }} onClick={onRemove} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: 'rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Minus size={16} color="var(--forest-deep)" />
              </motion.button>
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={qty}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  style={{ width: '20px', textAlign: 'center', fontSize: '16px', fontWeight: 700, color: 'var(--forest-deep)' }}
                >
                  {qty}
                </motion.span>
              </AnimatePresence>
              <motion.button whileTap={{ scale: 0.8 }} onClick={onAdd} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: 'var(--forest-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Plus size={16} color="var(--parchment)" />
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

