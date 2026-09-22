import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mountain, Compass, Wind, Sparkles, SunMedium, Eye } from 'lucide-react'

export default function HimalayanAtmosphere() {
  const [currentTime, setCurrentTime] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Asia/Kolkata'
        })
      )
    }
    updateTime()
    const timer = setInterval(updateTime, 10000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="himalayan-atmosphere-layer" style={{ pointerEvents: 'none', position: 'relative', zIndex: 10 }}>
      {/* ── 1. DRIFTING MIST / MOUNTAIN FOG CANOPY ── */}
      <div 
        className="fog-drift-slow"
        style={{
          position: 'fixed',
          top: 0,
          left: '-50%',
          width: '200%',
          height: '220px',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(255, 255, 255, 0.4) 0%, rgba(245, 238, 220, 0.12) 50%, transparent 80%)',
          filter: 'blur(30px)',
          opacity: 0.65,
          pointerEvents: 'none',
          zIndex: 1
        }} 
      />

      {/* ── 2. MOUNTAIN SANCTUARY TELEMETRY TICKER (MOBILE & DESKTOP TUNED) ── */}
      <div
        style={{
          background: 'linear-gradient(90deg, #1A2E13 0%, #2C4A22 50%, #1A2E13 100%)',
          color: '#EBE0C4',
          fontSize: '11px',
          letterSpacing: '0.03em',
          padding: '6px 12px',
          borderBottom: '1px solid rgba(173, 138, 63, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          overflow: 'hidden',
          pointerEvents: 'auto'
        }}
      >
        {/* Horizontal Ticker with Touch Momentum */}
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            overflowX: 'auto', 
            whiteSpace: 'nowrap', 
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
            flex: 1
          }}
        >
          {/* Sanctuary Location */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
            <Mountain size={13} color="#D9BD75" />
            <span style={{ fontWeight: 600, color: '#fff' }}>Shivalaya</span>
            <span className="hide-on-compact" style={{ opacity: 0.6 }}>· Uttarakhand</span>
          </div>

          <span style={{ opacity: 0.3, flexShrink: 0 }}>|</span>

          {/* Altitude */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            <Compass size={12} color="#D9BD75" />
            <span>Alt. <strong>1,450m</strong><span className="hide-on-compact"> (4,750 ft)</span></span>
          </div>

          <span style={{ opacity: 0.3, flexShrink: 0 }}>|</span>

          {/* Mountain Air */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            <Wind size={12} color="#2ecc71" />
            <span>18°C · Pine Breeze</span>
          </div>

          <span className="hide-on-compact" style={{ opacity: 0.3, flexShrink: 0 }}>|</span>

          {/* Peak Sightlines */}
          <div className="hide-on-compact" style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            <Eye size={12} color="#D9BD75" />
            <span>Trishul View: <strong>Clear</strong></span>
          </div>
        </div>

        {/* Live IST Time */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, paddingLeft: '4px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2ecc71', boxShadow: '0 0 6px #2ecc71' }} />
          <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '11px', color: '#D9BD75', fontWeight: 600 }}>
            {currentTime || 'IST'}
          </span>
        </div>
      </div>
    </div>
  )
}
