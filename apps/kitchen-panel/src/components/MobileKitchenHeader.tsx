import { useState } from 'react'
import { Menu, Bell, BellOff, X, Clock } from 'lucide-react'
import LanguageToggle from './LanguageToggle'
import { useLanguage } from '../i18n/LanguageContext'
import { isKitchenSoundMuted, setKitchenSoundMuted, playKitchenOrderChime } from '../lib/audioChime'

interface MobileKitchenHeaderProps {
  sidebarOpen: boolean
  onToggleSidebar: () => void
  newOrdersCount: number
  staffName: string
  initials: string
}

export default function MobileKitchenHeader({
  sidebarOpen,
  onToggleSidebar,
  newOrdersCount,
  staffName,
  initials
}: MobileKitchenHeaderProps) {
  const { t } = useLanguage()
  const [muted, setMuted] = useState(isKitchenSoundMuted)

  const handleToggleSound = () => {
    const next = !muted
    setMuted(next)
    setKitchenSoundMuted(next)
    if (!next) {
      // Play brief test chime when unmuting
      playKitchenOrderChime()
    }
  }

  return (
    <header className="mobile-kds-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          type="button"
          onClick={onToggleSidebar}
          className="mobile-menu-btn"
          aria-label={sidebarOpen ? 'Close Navigation' : 'Open Navigation'}
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div 
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: '#132511',
            border: '1.5px solid var(--brass-light, #D9BD75)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2px',
            flexShrink: 0
          }}
        >
          <img 
            src="/panache_badge_perfect.png" 
            alt="Panache Logo" 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/panache_logo_transparent.png' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontWeight: 700, fontSize: '18px', color: '#F3EEDB', lineHeight: 1 }}>
              {t('brand_title')}
            </span>
            <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--forest-deep)', background: 'var(--brass-light)', padding: '2px 5px', borderRadius: '4px', letterSpacing: '0.5px' }}>
              KDS
            </span>
          </div>
          <span style={{ fontSize: '9px', color: 'rgba(243,238,219,0.7)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600 }}>
            Shivalaya Resorts · Uttarakhand
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Language Switcher */}
        <LanguageToggle compact={true} />

        {/* Sound Toggle */}
        <button
          type="button"
          onClick={handleToggleSound}
          title={muted ? t('sound_alert_off') : t('sound_alert_on')}
          aria-label="Toggle kitchen alert sound"
          style={{
            background: muted ? 'rgba(255,255,255,0.08)' : 'rgba(217,189,117,0.2)',
            border: `1.5px solid ${muted ? 'rgba(255,255,255,0.15)' : 'rgba(217,189,117,0.5)'}`,
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: muted ? 'rgba(243,238,219,0.5)' : 'var(--brass-light)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            flexShrink: 0
          }}
        >
          {muted ? <BellOff size={15} /> : <Bell size={15} />}
        </button>

        {/* New Orders Count Badge */}
        {newOrdersCount > 0 && (
          <div
            style={{
              background: 'var(--rust)',
              color: '#FFFFFF',
              borderRadius: '100px',
              padding: '2px 8px',
              fontSize: '11px',
              fontWeight: 800,
              fontFamily: 'IBM Plex Mono, monospace',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              boxShadow: '0 2px 8px rgba(154,69,48,0.4)',
              animation: 'pulseGlow 2s infinite'
            }}
          >
            <Clock size={11} />
            <span>{newOrdersCount}</span>
          </div>
        )}

        {/* Staff Initials Pill */}
        <div
          title={staffName}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 30%, var(--brass-light), var(--brass) 60%, #8a6b2c)',
            color: 'var(--forest-deep)',
            fontFamily: 'Fraunces, serif',
            fontWeight: 700,
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1.5px solid rgba(243,238,219,0.3)',
            flexShrink: 0
          }}
        >
          {initials}
        </div>
      </div>
    </header>
  )
}
