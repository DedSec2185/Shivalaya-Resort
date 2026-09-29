import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { KeyRound, ShieldCheck, User, Lock, ArrowRight, Delete } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, loginWithPin } = useAuth()

  // Mode: 'account' | 'pin'
  const [authMode, setAuthMode] = useState<'account' | 'pin'>('account')

  // Account mode state
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)

  // PIN mode state
  const [pin, setPin]           = useState('')

  // Shared state
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading]   = useState(false)

  // ── Account Login Handler ──────────────────────────────────
  async function handleAccountSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault()
    if (!email || !password) {
      setErrorMsg('Please enter both email address and password.')
      return
    }
    setLoading(true)
    setErrorMsg('')
    try {
      const res = await login(email, password)
      if (res.error) {
        setErrorMsg(res.error.message || 'Invalid email or password.')
      } else {
        navigate('/')
      }
    } catch {
      setErrorMsg('An unexpected error occurred during login.')
    } finally {
      setLoading(false)
    }
  }

  // ── PIN Login Handler ──────────────────────────────────────
  async function handlePinSubmit(pinToVerify: string) {
    if (pinToVerify.length !== 4) return
    setLoading(true)
    setErrorMsg('')
    try {
      const res = await loginWithPin(pinToVerify)
      if (res.success) {
        navigate('/')
      } else {
        setErrorMsg(res.error || 'Invalid 4-digit security PIN.')
        setPin('')
      }
    } catch {
      setErrorMsg('PIN verification failed. Please try again.')
      setPin('')
    } finally {
      setLoading(false)
    }
  }

  function handleKeypadClick(digit: string) {
    if (pin.length >= 4 || loading) return
    const nextPin = pin + digit
    setPin(nextPin)
    setErrorMsg('')
    if (nextPin.length === 4) {
      handlePinSubmit(nextPin)
    }
  }

  function handleKeypadBackspace() {
    if (pin.length > 0 && !loading) {
      setPin(prev => prev.slice(0, -1))
      setErrorMsg('')
    }
  }

  // ── Quick Demo Autofill Helper ─────────────────────────────
  function handleQuickDemo(type: 'reception_email' | 'owner_email' | 'bilam_pin' | 'owner_pin') {
    setErrorMsg('')
    if (type === 'reception_email') {
      setAuthMode('account')
      setEmail('receptionist@shivalaya.com')
      setPassword('shivalaya1234')
    } else if (type === 'owner_email') {
      setAuthMode('account')
      setEmail('owner@shivalaya.com')
      setPassword('shivalaya2026')
    } else if (type === 'bilam_pin') {
      setAuthMode('pin')
      setPin('1234')
    } else if (type === 'owner_pin') {
      setAuthMode('pin')
      setPin('9999')
    }
  }

  return (
    <div className="login-layout">
      
      {/* Left panel — luxury branding */}
      <aside className="login-brand-panel">
        <div className="login-brand-stripes" />
        <div className="login-brand-glow" />

        {/* Brand identity */}
        <div className="login-brand-content">
          <div className="login-brand-logo">
            <img 
              src="/panache_logo.jpg" 
              alt="Logo" 
              onError={e => { e.currentTarget.style.display = 'none' }} 
            />
          </div>
          <h1 className="login-brand-name">
            Shivalaya<br />
            <span>Panache</span>
          </h1>
          <p className="login-brand-tagline">
            Reception & Resort Operations Desk
          </p>
        </div>

        {/* Middle decorative luxury seal */}
        <div className="login-brand-middle">
          <div className="login-brand-circle">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '36px', marginBottom: '4px' }}>🏔️</div>
              <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono, monospace', color: 'var(--brass-light)' }}>
                Bhimtal · Uttarakhand
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="login-brand-footer">
          SHIVALAYA HOSPITALITY SYSTEMS · ASVEX TECH
        </div>
      </aside>

      {/* Right panel — login authentication form */}
      <main className="login-form-panel">
        <div className="login-form-container">

          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h2 className="login-form-title">
              Staff Portal Access
            </h2>
            <p className="login-form-subtitle">
              Sign in to manage guest stays, room folios, and operations
            </p>
          </div>

          {/* Authentication Mode Switcher */}
          <div className="login-tabs">
            <button
              type="button"
              className={`login-tab-btn ${authMode === 'account' ? 'active' : ''}`}
              onClick={() => { setAuthMode('account'); setErrorMsg('') }}
            >
              <User size={14} />
              <span>Staff Account</span>
            </button>
            <button
              type="button"
              className={`login-tab-btn ${authMode === 'pin' ? 'active' : ''}`}
              onClick={() => { setAuthMode('pin'); setErrorMsg('') }}
            >
              <KeyRound size={14} />
              <span>Desk PIN Login</span>
            </button>
          </div>

          {errorMsg && (
            <div className="login-form-error">
              {errorMsg}
            </div>
          )}

          {/* MODE 1: Email & Password Account Form */}
          {authMode === 'account' && (
            <form onSubmit={handleAccountSubmit} className="login-form-fields">
              <div>
                <label className="rcp-label">Work Email Address</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    className="rcp-input"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="receptionist@shivalaya.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="rcp-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="rcp-input"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    style={{ paddingRight: '44px' }}
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPass(s => !s)}
                    style={{ 
                      position: 'absolute', 
                      right: '12px', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      background: 'none', 
                      border: 'none', 
                      cursor: 'pointer', 
                      color: 'var(--sage)', 
                      fontSize: '16px', 
                      padding: '2px' 
                    }}
                  >
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button
                type="submit" 
                disabled={loading}
                className="login-form-submit"
              >
                {loading ? (
                  <>
                    <span className="spinner" />
                    <span>Signing In…</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Desk</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* MODE 2: Quick Front Desk PIN Keypad (Hashed DB Verification) */}
          {authMode === 'pin' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                <div style={{ fontSize: '13px', color: 'var(--ink-soft)', fontWeight: 600 }}>
                  Enter your 4-digit security PIN
                </div>
                <div style={{ fontSize: '11px', color: 'var(--sage)', marginTop: '2px' }}>
                  Verified via secure database bcrypt hashing
                </div>
              </div>

              {/* PIN Dot Indicators */}
              <div className="pin-dots-container">
                {[0, 1, 2, 3].map(idx => (
                  <div 
                    key={idx} 
                    className={`pin-dot ${pin.length > idx ? 'filled' : ''}`} 
                  />
                ))}
              </div>

              {/* Numeric Keypad */}
              <div className="pin-keypad">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(digit => (
                  <button
                    key={digit}
                    type="button"
                    className="pin-btn"
                    disabled={loading}
                    onClick={() => handleKeypadClick(digit)}
                  >
                    {digit}
                  </button>
                ))}
                <button
                  type="button"
                  className="pin-btn pin-btn-small"
                  disabled={loading}
                  onClick={() => { setPin(''); setErrorMsg('') }}
                >
                  Clear
                </button>
                <button
                  type="button"
                  className="pin-btn"
                  disabled={loading}
                  onClick={() => handleKeypadClick('0')}
                >
                  0
                </button>
                <button
                  type="button"
                  className="pin-btn"
                  disabled={loading}
                  onClick={handleKeypadBackspace}
                >
                  <Delete size={20} />
                </button>
              </div>

              {loading && (
                <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--sage)', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <span className="spinner" />
                  <span>Verifying PIN credentials…</span>
                </div>
              )}
            </div>
          )}

          {/* 1-Tap Quick Demo Logins */}
          <div className="login-demo-box">
            <div className="login-demo-title">
              1-Tap Quick Test Access
            </div>
            
            <div className="login-demo-rows">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                <span style={{ fontWeight: 600 }}>Front Desk:</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button 
                    type="button"
                    onClick={() => handleQuickDemo('reception_email')}
                    className="demo-pill"
                    title="Sign in with Email"
                  >
                    <User size={10} />
                    <span>receptionist@...</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleQuickDemo('bilam_pin')}
                    className="demo-pill"
                    title="Sign in with PIN 1234"
                  >
                    <KeyRound size={10} />
                    <span>PIN 1234</span>
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                <span style={{ fontWeight: 600 }}>Management:</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button 
                    type="button"
                    onClick={() => handleQuickDemo('owner_email')}
                    className="demo-pill"
                    title="Sign in with Owner Email"
                  >
                    <ShieldCheck size={10} />
                    <span>owner@...</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleQuickDemo('owner_pin')}
                    className="demo-pill"
                    title="Sign in with Owner PIN 9999"
                  >
                    <Lock size={10} />
                    <span>PIN 9999</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Switch to Other Portals */}
            <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '12px' }}>
              <a
                href={import.meta.env.VITE_KITCHEN_PORTAL_URL || 'http://localhost:5181'}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--brass-light, #D9BD75)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <span>👨‍🍳 Kitchen KDS</span>
              </a>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
              <a
                href={import.meta.env.VITE_GUEST_PORTAL_URL || 'http://localhost:5190'}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--brass-light, #D9BD75)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <span>🍽️ Guest Menu</span>
              </a>
            </div>
          </div>

        </div>
      </main>

    </div>
  )
}
