import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface SectionTabsProps {
  sections: string[]
  activeSection: string
  onSelect: (section: string) => void
}

export default function SectionTabs({ sections, activeSection, onSelect }: SectionTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current
      const tab = activeRef.current
      // If first section (Breakfast), ensure it is at left 0
      if (activeSection === sections[0]) {
        container.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        const left = tab.offsetLeft - container.offsetWidth / 2 + tab.offsetWidth / 2
        container.scrollTo({ left, behavior: 'smooth' })
      }
    }
  }, [activeSection, sections])

  return (
    <div style={{
      position: 'sticky',
      top: '64px',
      zIndex: 40,
      background: 'rgba(247, 244, 238, 0.95)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(173, 138, 63, 0.15)',
      padding: '12px 0'
    }}>
      <div 
        ref={scrollRef}
        style={{
          display: 'flex',
          overflowX: 'auto',
          gap: '10px',
          padding: '0 20px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
        className="hide-scrollbar"
      >
        {sections.map((section) => {
          const isActive = activeSection === section
          return (
            <button
              key={section}
              ref={isActive ? activeRef : null}
              onClick={() => onSelect(section)}
              style={{
                position: 'relative',
                padding: '10px 22px',
                borderRadius: '100px',
                border: 'none',
                background: 'transparent',
                color: isActive ? 'var(--forest-deep)' : 'var(--sage)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '15px',
                letterSpacing: '0.02em',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap'
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(44, 74, 34, 0.08)',
                    borderRadius: '100px',
                    border: '1px solid rgba(44, 74, 34, 0.1)'
                  }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              {section}
            </button>
          )
        })}
      </div>
    </div>
  )
}
