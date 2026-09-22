import React from 'react'
import { motion } from 'framer-motion'

interface PageTransitionProps {
  children: React.ReactNode
}

export default function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.995 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.995 }}
      transition={{
        duration: 0.38,
        ease: [0.22, 1, 0.36, 1] // Apple-style fluid cubic bezier
      }}
      style={{ width: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {children}
    </motion.div>
  )
}
