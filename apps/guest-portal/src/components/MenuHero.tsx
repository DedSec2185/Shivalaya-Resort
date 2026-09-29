import { motion } from 'framer-motion'
import { Clock, Flame, Mountain, Sparkles } from 'lucide-react'

export default function MenuHero() {
  // Official Resort Hours: 7:30 AM (450m) to 10:30 PM (1350m)
  const now = new Date()
  const totalMins = now.getHours() * 60 + now.getMinutes()
  const isKitchenOpen = totalMins >= 450 && totalMins <= 1350

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="menu-hero-banner"
      style={{
        margin: '20px 0 28px',
        borderRadius: '28px',
        background: 'linear-gradient(135deg, #132511 0%, #1A2E13 50%, #2A4A22 100%)',
        border: '1.5px solid rgba(217, 189, 117, 0.3)',
        padding: 'clamp(24px, 5vw, 36px)',
        boxShadow: '0 16px 40px rgba(19, 37, 17, 0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative gradient aura */}
      <div 
        style={{ 
          position: 'absolute', 
          top: '-60px', 
          right: '-40px', 
          width: '260px', 
          height: '260px', 
          background: 'radial-gradient(circle, rgba(217, 189, 117, 0.22) 0%, transparent 70%)', 
          filter: 'blur(40px)', 
          pointerEvents: 'none' 
        }} 
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px', position: 'relative', zIndex: 2 }}>
        {/* Left Column: Headings & Badges */}
        <div style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ 
              fontSize: '11px', 
              fontWeight: 800, 
              color: 'var(--brass-light, #D9BD75)', 
              textTransform: 'uppercase', 
              letterSpacing: '0.14em', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px' 
            }}>
              <Sparkles size={12} color="var(--brass-light, #D9BD75)" />
              SHIVALAYA RESORTS · BHIMTAL
            </span>

            <span style={{ 
              fontSize: '10.5px', 
              color: 'rgba(255,255,255,0.7)', 
              background: 'rgba(255,255,255,0.08)', 
              padding: '2px 8px', 
              borderRadius: '100px',
              border: '1px solid rgba(255,255,255,0.15)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Mountain size={11} color="var(--brass-light, #D9BD75)" />
              Alt. 1,450m
            </span>
          </div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{ 
              margin: 0, 
              fontSize: 'clamp(28px, 6vw, 40px)', 
              color: '#FFFFFF', 
              fontFamily: 'Fraunces, serif', 
              fontWeight: 700, 
              lineHeight: 1.15,
              textShadow: '0 2px 10px rgba(0,0,0,0.3)'
            }}
          >
            Panache Restaurant
          </motion.h1>
          
          <p style={{ margin: 0, fontSize: 'clamp(13.5px, 3.8vw, 15px)', color: 'rgba(243, 238, 219, 0.88)', lineHeight: 1.6, maxWidth: '520px' }}>
            Slow-simmered Kumaoni delicacies, clay sigri tandoor, and artisanal comfort dining. Direct service to your suite balcony, garden lawn, or restaurant table.
          </p>

          {/* Operational Status Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '6px' }}>
            <div 
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '8px', 
                background: 'rgba(0,0,0,0.4)', 
                padding: '6px 14px', 
                borderRadius: '100px', 
                border: '1px solid rgba(217, 189, 117, 0.3)', 
                backdropFilter: 'blur(10px)'
              }}
            >
              <motion.div 
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  backgroundColor: isKitchenOpen ? '#2ecc71' : '#e74c3c', 
                  boxShadow: isKitchenOpen ? '0 0 10px #2ecc71' : '0 0 10px #e74c3c' 
                }} 
              />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#FFFFFF' }}>
                {isKitchenOpen ? 'Live Kitchen Active' : 'Kitchen Closed (Late Night)'}
              </span>
            </div>

            <div 
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '6px', 
                background: 'rgba(255,255,255,0.06)', 
                padding: '6px 12px', 
                borderRadius: '100px', 
                border: '1px solid rgba(255,255,255,0.12)' 
              }}
            >
              <Clock size={13} color="var(--brass-light, #D9BD75)" />
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
                7:30 AM – 10:30 PM Cutoff
              </span>
            </div>

            <div 
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '6px', 
                background: 'rgba(217,189,117,0.12)', 
                padding: '6px 12px', 
                borderRadius: '100px', 
                border: '1px solid rgba(217,189,117,0.25)' 
              }}
            >
              <Flame size={13} color="var(--brass-light, #D9BD75)" />
              <span style={{ fontSize: '11.5px', color: 'var(--brass-light, #D9BD75)', fontWeight: 700 }}>
                Charcoal Sigri & Tandoor
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Authentic Panache Crest Showcase */}
        <motion.div 
          whileHover={{ scale: 1.05, rotate: 2 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '8px',
            flexShrink: 0,
            cursor: 'pointer'
          }}
        >
          <div 
            style={{ 
              width: 'clamp(90px, 18vw, 116px)', 
              height: 'clamp(90px, 18vw, 116px)', 
              borderRadius: '50%', 
              background: 'radial-gradient(circle at 35% 30%, #1A2E13, #0D170C)', 
              border: '2.5px solid var(--brass, #BCA374)', 
              boxShadow: '0 8px 24px rgba(0,0,0,0.4), 0 0 20px rgba(217,189,117,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              position: 'relative'
            }}
          >
            <img 
              src="/panache_badge_perfect.png" 
              alt="Panache Restaurant Crest" 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'contain',
                filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))'
              }}
              onError={(e) => {
                // Fallback if transparent png is preferred
                (e.currentTarget as HTMLImageElement).src = '/panache_logo_transparent.png'
              }}
            />
          </div>
          <span style={{ 
            fontFamily: 'Fraunces, serif', 
            fontSize: '11px', 
            letterSpacing: '0.18em', 
            textTransform: 'uppercase', 
            color: 'var(--brass-light, #D9BD75)', 
            fontWeight: 700 
          }}>
            Panache Monogram
          </span>
        </motion.div>
      </div>
    </motion.div>
  )
}
