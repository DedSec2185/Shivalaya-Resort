import { useLanguage } from '../i18n/LanguageContext'
import { Globe } from 'lucide-react'

interface LanguageToggleProps {
  compact?: boolean
  className?: string
}

export default function LanguageToggle({ compact = false, className = '' }: LanguageToggleProps) {
  const { lang, setLang } = useLanguage()

  return (
    <div
      className={`lang-toggle-container ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: 'rgba(26, 46, 19, 0.45)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1.5px solid rgba(217, 189, 117, 0.3)',
        borderRadius: '100px',
        padding: '3px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
        userSelect: 'none'
      }}
    >
      {!compact && (
        <div style={{ padding: '0 6px 0 8px', display: 'flex', alignItems: 'center' }}>
          <Globe size={14} color="var(--brass-light)" />
        </div>
      )}

      <button
        type="button"
        onClick={() => setLang('en')}
        style={{
          background: lang === 'en' 
            ? 'linear-gradient(135deg, var(--brass) 0%, #8A6B2C 100%)' 
            : 'transparent',
          color: lang === 'en' ? '#FFFFFF' : 'rgba(243, 238, 219, 0.7)',
          border: 'none',
          borderRadius: '100px',
          padding: compact ? '4px 9px' : '5px 12px',
          fontSize: compact ? '11px' : '12px',
          fontWeight: 700,
          fontFamily: 'Inter, sans-serif',
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.2, 0.9, 0.25, 1.1)',
          boxShadow: lang === 'en' ? '0 2px 8px rgba(0,0,0,0.25)' : 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        <span>EN</span>
      </button>

      <button
        type="button"
        onClick={() => setLang('hi')}
        style={{
          background: lang === 'hi' 
            ? 'linear-gradient(135deg, var(--brass) 0%, #8A6B2C 100%)' 
            : 'transparent',
          color: lang === 'hi' ? '#FFFFFF' : 'rgba(243, 238, 219, 0.7)',
          border: 'none',
          borderRadius: '100px',
          padding: compact ? '4px 9px' : '5px 12px',
          fontSize: compact ? '11px' : '12.5px',
          fontWeight: 700,
          fontFamily: 'Inter, "Noto Sans Devanagari", sans-serif',
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.2, 0.9, 0.25, 1.1)',
          boxShadow: lang === 'hi' ? '0 2px 8px rgba(0,0,0,0.25)' : 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        <span>हिन्दी</span>
      </button>
    </div>
  )
}
