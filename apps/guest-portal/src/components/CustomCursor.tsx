import { useEffect, useState } from 'react'
import { motion, useSpring, useMotionValue } from 'framer-motion'

export default function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isClicking, setIsClicking] = useState(false)
  const [hoverText, setHoverText] = useState('')

  // Raw mouse coordinates
  const mouseX = useMotionValue(-100)
  const mouseY = useMotionValue(-100)

  // Spring physics for trailing aura ring
  const springConfig = { damping: 24, stiffness: 260, mass: 0.5 }
  const auraX = useSpring(mouseX, springConfig)
  const auraY = useSpring(mouseY, springConfig)

  useEffect(() => {
    // Only enable on desktop pointer devices
    const isPointerFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    if (!isPointerFine) return

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
      if (!isVisible) setIsVisible(true)
    }

    const handleMouseDown = () => setIsClicking(true)
    const handleMouseUp = () => setIsClicking(false)
    const handleMouseLeave = () => setIsVisible(false)
    const handleMouseEnter = () => setIsVisible(true)

    // Detect hover over interactive elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      if (!target) return

      const interactive = target.closest(
        'button, a, input, select, textarea, [role="button"], .interactive-hover, .card-3d-wrap, .room-card, .menu-item-card'
      )

      if (interactive) {
        setIsHovered(true)
        const customText = interactive.getAttribute('data-cursor-text')
        if (customText) setHoverText(customText)
      } else {
        setIsHovered(false)
        setHoverText('')
      }
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mouseenter', handleMouseEnter)
    document.addEventListener('mouseover', handleMouseOver, { passive: true })

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseenter', handleMouseEnter)
      document.removeEventListener('mouseover', handleMouseOver)
    }
  }, [mouseX, mouseY, isVisible])

  // Don't render on touch/mobile devices
  if (typeof window !== 'undefined' && !window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    return null
  }

  return (
    <div 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        pointerEvents: 'none', 
        zIndex: 99999,
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.25s ease'
      }}
    >
      {/* 1. Sharp Golden Center Ember Dot */}
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          x: mouseX,
          y: mouseY,
          translateX: '-50%',
          translateY: '-50%',
          width: isHovered ? '8px' : '5px',
          height: isHovered ? '8px' : '5px',
          borderRadius: '50%',
          background: isHovered ? '#FFFFFF' : '#D9BD75',
          boxShadow: isHovered 
            ? '0 0 10px rgba(217, 189, 117, 0.9), 0 0 20px rgba(217, 189, 117, 0.5)' 
            : '0 0 6px rgba(173, 138, 63, 0.6)',
          transition: 'width 0.2s, height 0.2s, background 0.2s',
          pointerEvents: 'none'
        }}
      />

      {/* 2. Trailing Brass Aura Ring */}
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          x: auraX,
          y: auraY,
          translateX: '-50%',
          translateY: '-50%',
          width: isHovered ? (hoverText ? '76px' : '52px') : (isClicking ? '26px' : '34px'),
          height: isHovered ? (hoverText ? '76px' : '52px') : (isClicking ? '26px' : '34px'),
          borderRadius: '50%',
          border: isHovered 
            ? '1.5px solid rgba(217, 189, 117, 0.85)' 
            : '1px solid rgba(173, 138, 63, 0.45)',
          background: isHovered 
            ? 'radial-gradient(circle, rgba(173, 138, 63, 0.18) 0%, rgba(44, 74, 34, 0.08) 70%, transparent 100%)' 
            : 'transparent',
          backdropFilter: isHovered ? 'blur(1px)' : 'none',
          boxShadow: isHovered ? '0 0 18px rgba(173, 138, 63, 0.25)' : 'none',
          transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1), height 0.25s cubic-bezier(0.16, 1, 0.3, 1), border 0.2s, background 0.25s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}
      >
        {hoverText && (
          <span 
            style={{ 
              fontSize: '10px', 
              fontWeight: 800, 
              letterSpacing: '0.08em', 
              textTransform: 'uppercase', 
              color: '#FFF',
              textShadow: '0 1px 3px rgba(0,0,0,0.8)'
            }}
          >
            {hoverText}
          </span>
        )}
      </motion.div>
    </div>
  )
}
