import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'

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
        background: 'linear-gradient(135deg, rgba(26,46,19,0.98) 0%, rgba(44,74,34,0.95) 100%)',
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '38px 36px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxShadow: '0 14px 36px rgba(26,46,19,0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative gradient orb */}
      <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'var(--brass)', filter: 'blur(80px)', opacity: 0.25, pointerEvents: 'none' }} />

      <motion.div 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        style={{ fontSize: '11px', fontWeight: 700, color: 'var(--brass)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '6px' }}
      >
        <span>✦</span> SHIVALAYA RESORTS · BHIMTAL
      </motion.div>
      
      <motion.h1 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        style={{ margin: 0, fontSize: '32px', color: '#ffffff', fontFamily: 'Fraunces, serif', fontWeight: 700, lineHeight: 1.15 }}
      >
        Welcome to Panache
      </motion.h1>
      
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        style={{ margin: 0, fontSize: '14.5px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}
      >
        Order to your room, table, or the counter — at your own pace.
      </motion.p>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        style={{ 
          marginTop: '8px',
          display: 'flex', alignItems: 'center', gap: '10px', 
          background: 'rgba(0,0,0,0.35)', padding: '8px 14px', borderRadius: '100px', width: 'fit-content',
          border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            style={{ 
              width: '7px', height: '7px', borderRadius: '50%', 
              backgroundColor: isKitchenOpen ? '#2ecc71' : '#e74c3c', 
              boxShadow: isKitchenOpen ? '0 0 10px #2ecc71' : '0 0 10px #e74c3c' 
            }} 
          />
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff' }}>
            {isKitchenOpen ? 'Kitchen Open' : 'Kitchen Closed (Late Night)'}
          </span>
        </div>
        <div style={{ width: '1px', height: '12px', backgroundColor: 'rgba(255,255,255,0.25)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Clock size={13} color="rgba(255,255,255,0.8)" />
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
            7:30 AM – 10:30 PM Cutoff
          </span>
        </div>
      </motion.div>
    </motion.div>
  )
}
