import { motion, useScroll, useSpring } from 'framer-motion'

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    restDelta: 0.001
  })

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        zIndex: 10000,
        pointerEvents: 'none',
        background: 'rgba(26, 46, 19, 0.05)'
      }}
    >
      <motion.div
        style={{
          height: '100%',
          scaleX,
          transformOrigin: '0%',
          background: 'linear-gradient(90deg, #AD8A3F 0%, #D9BD75 50%, #F5EEDC 85%, #D9BD75 100%)',
          boxShadow: '0 0 10px rgba(217, 189, 117, 0.7), 0 0 4px rgba(173, 138, 63, 0.9)'
        }}
      />
    </div>
  )
}
