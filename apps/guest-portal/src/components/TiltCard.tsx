import React, { useRef, useState } from 'react'
import { motion, useSpring, useMotionValue } from 'framer-motion'

interface TiltCardProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
  maxTilt?: number
}

export default function TiltCard({
  children,
  className = '',
  style = {},
  onClick,
  maxTilt = 6
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 })
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 })

  const [sheenPosition, setSheenPosition] = useState({ x: 50, y: 50 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()

    const width = rect.width
    const height = rect.height

    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5

    x.set(xPct * maxTilt)
    y.set(-yPct * maxTilt)

    setSheenPosition({
      x: (mouseX / width) * 100,
      y: (mouseY / height) * 100
    })
  }

  const handleMouseEnter = () => setIsHovered(true)

  const handleMouseLeave = () => {
    setIsHovered(false)
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transformStyle: 'preserve-3d',
        rotateX: mouseYSpring,
        rotateY: mouseXSpring,
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        ...style
      }}
      className={`tilt-card-container ${className}`}
    >
      {/* Specular dynamic reflection sheen */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          background: isHovered 
            ? `radial-gradient(circle at ${sheenPosition.x}% ${sheenPosition.y}%, rgba(255,255,255,0.18) 0%, transparent 60%)` 
            : 'transparent',
          pointerEvents: 'none',
          zIndex: 5,
          transition: 'opacity 0.2s ease',
          opacity: isHovered ? 1 : 0
        }}
      />
      {children}
    </motion.div>
  )
}
