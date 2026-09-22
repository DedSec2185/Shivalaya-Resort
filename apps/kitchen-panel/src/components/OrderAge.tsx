import { useEffect, useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'

export function OrderAge({ createdAt }: { createdAt: string }) {
  const { t } = useLanguage()
  const [minutes, setMinutes] = useState(0)

  useEffect(() => {
    const calc = () => {
      const mins = Math.floor(
        (Date.now() - new Date(createdAt).getTime()) / 60000
      )
      setMinutes(Math.max(0, mins))
    }
    calc()
    const tInterval = setInterval(calc, 30000)
    return () => clearInterval(tInterval)
  }, [createdAt])

  const isUrgent = minutes >= 25
  const isWarning = minutes >= 15

  const color = isUrgent ? 'var(--rust)'
              : isWarning ? '#B8860B'
              : 'var(--sage)'

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color, fontWeight: 700 }}>
      <span>
        {minutes === 0 ? t('timer_just_now') : `${minutes} ${t('timer_min_ago')}`}
      </span>
      {isUrgent && (
        <span style={{
          background: 'rgba(154, 69, 48, 0.15)',
          color: 'var(--rust)',
          fontSize: '10px',
          fontWeight: 800,
          padding: '1px 5px',
          borderRadius: '4px',
          border: '1px solid rgba(154, 69, 48, 0.3)',
          letterSpacing: '0.4px',
          textTransform: 'uppercase'
        }}>
          ⚠️ {t('timer_delayed')}
        </span>
      )}
    </span>
  )
}
