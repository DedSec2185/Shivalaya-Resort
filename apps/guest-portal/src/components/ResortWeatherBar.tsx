import { motion } from 'framer-motion'
import { Mountain, Sun } from 'lucide-react'

export default function ResortWeatherBar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      style={{
        margin: '12px 16px 8px',
        padding: '10px 16px',
        borderRadius: '16px',
        background: 'rgba(26, 46, 19, 0.04)',
        border: '1px solid rgba(173, 138, 63, 0.2)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '11.5px',
        color: 'var(--forest-deep)',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Mountain & Location */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          width: '24px', height: '24px', borderRadius: '50%',
          background: 'rgba(173, 138, 63, 0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--brass)'
        }}>
          <Mountain size={13} />
        </div>
        <div>
          <span style={{ fontWeight: 700, letterSpacing: '0.03em' }}>Bhimtal, UK</span>
          <span style={{ color: 'var(--sage)', marginLeft: '6px', fontSize: '10.5px' }}>1,370m Alt</span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: '1px', height: '18px', background: 'rgba(173, 138, 63, 0.25)' }} />

      {/* Weather & Vibe */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
        >
          <Sun size={13} color="var(--brass)" />
        </motion.div>
        <span style={{ fontWeight: 600 }}>21°C</span>
        <span style={{ color: 'var(--sage)', fontSize: '10.5px' }}>· Pine Breeze</span>
      </div>
    </motion.div>
  )
}
