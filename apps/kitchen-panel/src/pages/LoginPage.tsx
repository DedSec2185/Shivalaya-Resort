import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { requestNotificationPermission } from '../lib/notifications'
import { useAuth } from '../hooks/useAuth'
import { ChefHat, Crown, ConciergeBell, User, Delete } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext'
import LanguageToggle from '../components/LanguageToggle'

interface Staff {
  id: string
  name: string
  role: string
}

const ROLE_ICONS: Record<string, React.ReactNode> = {
  kitchen: <ChefHat size={32} color="var(--brass)" />,
  owner: <Crown size={32} color="var(--forest-deep)" />,
  receptionist: <ConciergeBell size={32} color="var(--sage)" />,
}

const ROLE_COLORS: Record<string, string> = {
  kitchen:      'rgba(201,160,90,0.15)',
  owner:        'rgba(76,175,80,0.12)',
  receptionist: 'rgba(70,130,180,0.12)',
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { loginWithPin } = useAuth()
  const { t } = useLanguage()
  const [staffList, setStaffList]       = useState<Staff[]>([])
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [pin, setPin]                   = useState('')
  const [attempts, setAttempts]         = useState(0)
  const [lockedUntil, setLockedUntil]   = useState<Date | null>(null)
  const [lockoutSecs, setLockoutSecs]   = useState(0)
  const [isShaking, setIsShaking]       = useState(false)
  const [loading, setLoading]           = useState(true)
  const [errorMsg, setErrorMsg]         = useState('')

  useEffect(() => {
    supabase.from('staff').select('id, name, role').eq('is_active', true)
      .then(({ data, error }) => {
        if (error || !data?.length) {
          setStaffList([
            { id: '1', name: 'Kundan Chef', role: 'kitchen' },
            { id: '2', name: 'Deepak', role: 'kitchen' },
            { id: '3', name: 'Neha', role: 'kitchen' },
            { id: '4', name: 'Himanshu', role: 'kitchen' },
            { id: '5', name: 'Sujit (Service)', role: 'kitchen' },
            { id: '6', name: 'Varun (Service)', role: 'kitchen' },
            { id: '7', name: 'Bilam Pandey', role: 'receptionist' },
            { id: '8', name: 'Resort Owner', role: 'owner' },
          ])
        } else {
          setStaffList(data)
        }
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (!lockedUntil) return
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.round((lockedUntil.getTime() - Date.now()) / 1000))
      setLockoutSecs(remaining)
      if (remaining === 0) { setLockedUntil(null); setAttempts(0) }
    }, 1000)
    return () => clearInterval(interval)
  }, [lockedUntil])

  useEffect(() => { if (pin.length === 4) handlePinSubmit(pin) }, [pin])

  function handleKeypadClick(num: string) {
    if (lockedUntil || pin.length >= 4) return
    setPin(prev => prev + num)
  }

  async function handlePinSubmit(currentPin: string) {
    if (!selectedStaff) return
    setErrorMsg('')

    const success = await loginWithPin(currentPin, selectedStaff)
    if (success) {
        await requestNotificationPermission()
        navigate('/')
    } else {
        triggerShake()
        const newAttempts = attempts + 1
        setAttempts(newAttempts)
        if (newAttempts >= 3) { setLockedUntil(new Date(Date.now() + 30000)); setLockoutSecs(30) }
        setPin('')
        setErrorMsg(t('invalid_pin'))
    }
  }

  function triggerShake() {
    setIsShaking(true)
    setTimeout(() => setIsShaking(false), 500)
  }

  /* ─────── RENDER ─────────────────────────────────────── */
  return (
    <div className="login-page">
      {/* Header */}
      <header className="login-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/panache_logo.jpg" alt="Logo" className="login-logo"
            onError={e => { e.currentTarget.style.display = 'none' }}
          />
          <div>
            <div className="login-brand" style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: '20px' }}>
              {t('brand_title')} KDS
            </div>
            <div className="login-subtitle">
              {t('login_subtitle')}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <LanguageToggle compact={true} />
          <div className="login-status-badge">
            <span className="login-status-dot" />
            Online
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="login-body">
        {!selectedStaff ? (
          /* ── Profile Grid ─────────────────────────────── */
          <div className="profile-grid-wrapper">
            <div className="profile-grid-title" style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h1 style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: '26px' }}>{t('select_profile')}</h1>
              <p style={{ fontSize: '13.5px', color: 'var(--sage)' }}>{t('enter_pin')}</p>
            </div>

            {loading ? (
              <div className="login-loading">Loading profiles…</div>
            ) : (
              <div className="profile-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                {staffList.map((staff, i) => (
                  <button
                    key={staff.id}
                    type="button"
                    className="profile-card"
                    onClick={() => setSelectedStaff(staff)}
                    style={{
                      background: ROLE_COLORS[staff.role] || 'var(--surface-2)',
                      animationDelay: `${i * 80}ms`
                    }}
                  >
                    <div className="profile-card-icon">
                      {ROLE_ICONS[staff.role] || <User size={32} color="var(--ink)" />}
                    </div>
                    <div className="profile-card-name">{staff.name}</div>
                    <div className="profile-card-role">
                      {staff.role}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ── PIN Keypad ────────────────────────────────── */
          <div className="pin-wrapper">
            {/* Back + User */}
            <div className="pin-header">
              <button type="button" className="pin-back-btn" onClick={() => { setSelectedStaff(null); setPin(''); setErrorMsg('') }}>
                ← Back
              </button>
              <div className="pin-user">
                <div className="pin-user-icon">{ROLE_ICONS[selectedStaff.role] || <User size={24} />}</div>
                <div className="pin-user-name">{selectedStaff.name}</div>
              </div>
            </div>

            {/* PIN dots */}
            <div className="pin-dots" style={isShaking ? { animation: 'shake 0.4s ease both' } : {}}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={`pin-dot ${pin.length > i ? 'filled' : ''} ${pin.length === i + 1 ? 'active' : ''}`} />
              ))}
            </div>

            {/* Error / Lockout */}
            {errorMsg && !lockedUntil && (
              <div className="pin-error">
                {errorMsg}
              </div>
            )}
            {lockedUntil && (
              <div className="pin-lockout">
                Too many attempts. Locked for <strong>{lockoutSecs}s</strong>
              </div>
            )}

            {/* Keypad */}
            <div className="keypad-grid">
              {['1','2','3','4','5','6','7','8','9'].map(num => (
                <button key={num} type="button" className="keypad-btn"
                  disabled={!!lockedUntil} onClick={() => handleKeypadClick(num)}
                >
                  {num}
                </button>
              ))}
              <button type="button" className="keypad-btn keypad-btn-small" disabled={!!lockedUntil} onClick={() => setPin('')}>
                Clear
              </button>
              <button type="button" className="keypad-btn" disabled={!!lockedUntil} onClick={() => handleKeypadClick('0')}>
                0
              </button>
              <button type="button" className="keypad-btn keypad-btn-icon" disabled={!!lockedUntil} onClick={() => setPin(p => p.slice(0, -1))}>
                <Delete size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="login-footer">
        SHIVALAYA PANACHE KDS · ASVEX TECHNOLOGIES
      </footer>
    </div>
  )
}
