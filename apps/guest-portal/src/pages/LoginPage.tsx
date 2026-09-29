import { useState, KeyboardEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useGuestAuth } from '../contexts/GuestAuthContext'
import { 
  Key, ChevronLeft, Loader2, Sparkles, 
  Wifi, BedDouble, UtensilsCrossed, ArrowRight, CheckCircle2, User, Phone, MapPin
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const TABLES = Array.from({ length: 12 }, (_, i) => `T-${String(i + 1).padStart(2, '0')}`)
const POPULAR_ROOMS = ['101', '102', '201', '204', '205', '301']

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { directLogin, loginDemo } = useGuestAuth()

  const from = (location.state as { from?: string })?.from || '/'
  const safeFrom = from && from !== '/login' ? from : '/'
  const redirectMessage = (location.state as { message?: string })?.message || ''

  const [guestRole, setGuestRole] = useState<'resident' | 'dining'>('resident')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [roomNumber, setRoomNumber] = useState('204')
  const [tableNumber, setTableNumber] = useState('T-01')
  const [isTakeaway, setIsTakeaway] = useState(false)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // ── Phone Input Handling ─────────────────────────────────
  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 10)
    setPhone(raw)
    setError('')
  }

  function handlePhoneKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && phone.length === 10) {
      handleDirectSubmit()
    }
  }

  // ── Direct Login Action (No OTP blocker) ──────────────────
  async function handleDirectSubmit() {
    setError('')
    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit Indian mobile number.')
      return
    }

    if (guestRole === 'resident' && !roomNumber.trim()) {
      setError('Please provide your assigned resort room number.')
      return
    }

    setLoading(true)
    const isResident = guestRole === 'resident'
    const cleanName = name.trim() || (isResident ? `Resident (${roomNumber})` : 'Walk-In Guest')

    const result = await directLogin({
      phone,
      name: cleanName,
      guestType: isResident ? 'resort_guest' : 'walk_in',
      roomNumber: isResident ? roomNumber.trim() : ''
    })

    setLoading(false)

    if (!result.success) {
      setError(result.error || 'Failed to authenticate. Please check details.')
      return
    }

    // Persist table preference for immediate checkout prefill
    if (!isResident) {
      if (isTakeaway) {
        sessionStorage.setItem('qr_type', 'takeaway')
        sessionStorage.removeItem('qr_table')
      } else {
        sessionStorage.setItem('qr_type', 'dine_in')
        sessionStorage.setItem('qr_table', tableNumber)
      }
    } else {
      sessionStorage.setItem('qr_type', 'room_service')
      sessionStorage.setItem('qr_room', roomNumber.trim())
    }

    navigate(safeFrom, { replace: true })
  }

  // ── 1-Tap Quick Demo Helper ──────────────────────────────
  function handleQuickDemo(isResident: boolean) {
    if (isResident) {
      loginDemo({
        name: 'Abhay Sharma',
        roomNumber: '204',
        guestType: 'resort_guest',
        phone: '9876543210'
      })
      sessionStorage.setItem('qr_type', 'room_service')
      sessionStorage.setItem('qr_room', '204')
    } else {
      loginDemo({
        name: 'Guest Diner',
        roomNumber: '',
        guestType: 'walk_in',
        phone: '9876543211'
      })
      sessionStorage.setItem('qr_type', 'dine_in')
      sessionStorage.setItem('qr_table', 'T-04')
    }
    navigate(safeFrom, { replace: true })
  }

  return (
    <div 
      className="app-root" 
      style={{
        minHeight: '100dvh',
        background: 'linear-gradient(170deg, #0d170b 0%, #162912 50%, #101c0d 100%)',
        color: '#F3EEDB',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflowX: 'hidden'
      }}
    >
      {/* Background radial gold glow */}
      <div style={{ position: 'absolute', top: '-10%', right: '-20%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(217,189,117,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '0%', left: '-20%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(44,74,34,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* ── Sticky Topnav Header ── */}
      <div 
        style={{
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(13, 23, 11, 0.95)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(217, 189, 117, 0.2)'
        }}
      >
        <button
          type="button"
          onClick={() => {
            if (window.history.length > 1 && safeFrom !== '/') {
              navigate(-1)
            } else {
              navigate(safeFrom)
            }
          }}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(217, 189, 117, 0.35)',
            borderRadius: '100px',
            color: 'var(--brass-light)',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}
        >
          <ChevronLeft size={17} />
          <span>Return</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img 
            src="https://shivalayaresort.com/wp-content/uploads/2024/11/Shivalaya-Resort-Logo-t.png" 
            alt="Shivalaya Logo" 
            style={{ width: '22px', height: '22px', objectFit: 'contain', filter: 'brightness(1.2)' }}
          />
          <span style={{ fontSize: '10px', color: 'var(--brass-light)', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 800 }}>
            Fast Access Pass
          </span>
        </div>
      </div>

      {/* ── Main Content Container ── */}
      <div 
        className="app-scroll" 
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '10px 16px 40px',
          width: '100%',
          maxWidth: '440px',
          margin: '0 auto',
          boxSizing: 'border-box',
          position: 'relative',
          zIndex: 10
        }}
      >
        {/* Toast / Redirect Message */}
        <AnimatePresence>
          {redirectMessage && (
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              style={{
                width: '100%',
                marginBottom: '16px',
                padding: '12px 16px',
                background: 'rgba(173,138,63,0.15)',
                border: '1px solid rgba(217,189,117,0.3)',
                borderRadius: '16px',
                color: 'var(--brass-light)',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Sparkles size={16} color="var(--brass-light)" />
              <span>{redirectMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Crest & Royal Title ── */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div 
            style={{
              width: '68px', height: '68px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(217,189,117,0.2) 0%, rgba(26,46,19,0.4) 100%)',
              border: '2px solid rgba(217,189,117,0.4)',
              margin: '0 auto 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
            }}
          >
            <img 
              src="https://shivalayaresort.com/wp-content/uploads/2024/11/Shivalaya-Resort-Logo-t.png" 
              alt="Shivalaya Resorts" 
              style={{ width: '46px', height: '46px', objectFit: 'contain' }}
            />
          </div>

          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '24px', fontWeight: 700, color: '#FFF', margin: '0 0 4px', letterSpacing: '0.02em' }}>
            Guest Identity Pass
          </h1>
          <p style={{ fontSize: '12.5px', color: 'rgba(243,238,219,0.7)', margin: 0 }}>
            Shivalaya Resorts & Panache Restaurant
          </p>
        </div>

        {/* ── Guest Type Selector ── */}
        <div 
          style={{
            width: '100%',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: 'rgba(255,255,255,0.06)',
            padding: '4px',
            borderRadius: '16px',
            border: '1px solid rgba(217, 189, 117, 0.2)',
            marginBottom: '18px'
          }}
        >
          <button
            type="button"
            onClick={() => { setGuestRole('resident'); setError('') }}
            style={{
              padding: '10px 12px',
              borderRadius: '12px',
              border: 'none',
              background: guestRole === 'resident' ? 'linear-gradient(135deg, var(--forest), var(--forest-deep))' : 'transparent',
              color: guestRole === 'resident' ? 'var(--brass-light)' : 'rgba(243,238,219,0.6)',
              fontWeight: 700,
              fontSize: '12.5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: guestRole === 'resident' ? '0 4px 14px rgba(0,0,0,0.3)' : 'none'
            }}
          >
            <BedDouble size={15} />
            <span>Room Resident</span>
          </button>

          <button
            type="button"
            onClick={() => { setGuestRole('dining'); setError('') }}
            style={{
              padding: '10px 12px',
              borderRadius: '12px',
              border: 'none',
              background: guestRole === 'dining' ? 'linear-gradient(135deg, var(--forest), var(--forest-deep))' : 'transparent',
              color: guestRole === 'dining' ? 'var(--brass-light)' : 'rgba(243,238,219,0.6)',
              fontWeight: 700,
              fontSize: '12.5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: guestRole === 'dining' ? '0 4px 14px rgba(0,0,0,0.3)' : 'none'
            }}
          >
            <UtensilsCrossed size={15} />
            <span>Walk-In Diner</span>
          </button>
        </div>

        {/* ── Direct Access Form Container ── */}
        <div 
          style={{
            width: '100%',
            background: 'rgba(255, 252, 244, 0.97)',
            borderRadius: '24px',
            padding: '22px 20px',
            color: 'var(--ink)',
            boxShadow: '0 24px 50px rgba(0,0,0,0.4)',
            border: '1px solid rgba(217, 189, 117, 0.35)',
            marginBottom: '20px'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '15px', fontFamily: 'Fraunces, serif', fontWeight: 700, color: 'var(--forest-deep)' }}>
              {guestRole === 'resident' ? 'Resort In-House Access' : 'Panache Restaurant Dining'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--sage)', marginTop: '2px' }}>
              {guestRole === 'resident' 
                ? 'Charges automatically link to your Room Folio' 
                : 'Direct table dining with instant digital billing (5% GST)'}
            </div>
          </div>

          {/* Name Field */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--forest-deep)', marginBottom: '5px' }}>
              Guest / Party Name {guestRole === 'resident' ? '(Optional)' : '*'}
            </label>
            <div style={{ display: 'flex', alignItems: 'center', background: '#FFF', borderRadius: '12px', border: '1.5px solid rgba(173,138,63,0.3)', padding: '0 12px' }}>
              <User size={15} color="var(--sage)" style={{ flexShrink: 0, marginRight: '8px' }} />
              <input
                type="text"
                placeholder={guestRole === 'resident' ? 'e.g. Abhay Sharma' : 'e.g. Vikram Malhotra'}
                value={name}
                onChange={e => setName(e.target.value)}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  padding: '10px 0',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--forest-deep)',
                  background: 'transparent'
                }}
              />
            </div>
          </div>

          {/* Mobile Number Field */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--forest-deep)', marginBottom: '5px' }}>
              Mobile Number (10 Digits) *
            </label>
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#FFFFFF',
                borderRadius: '12px',
                border: phone.length === 10 ? '2px solid var(--forest)' : '1.5px solid rgba(173,138,63,0.35)',
                padding: '0 12px',
                boxSizing: 'border-box'
              }}
            >
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  paddingRight: '8px',
                  borderRight: '1.5px solid rgba(173,138,63,0.2)',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  color: 'var(--forest-deep)',
                  fontFamily: 'IBM Plex Mono, monospace'
                }}
              >
                <Phone size={13} color="var(--sage)" />
                <span>+91</span>
              </div>

              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={11}
                value={phone.length > 5 ? `${phone.slice(0, 5)} ${phone.slice(5)}` : phone}
                onChange={handlePhoneChange}
                onKeyDown={handlePhoneKeyDown}
                placeholder="98765 43210"
                style={{
                  flex: 1,
                  minWidth: 0,
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: '16px',
                  fontWeight: 700,
                  fontFamily: 'IBM Plex Mono, monospace',
                  letterSpacing: '1px',
                  color: 'var(--forest-deep)',
                  padding: '11px 10px'
                }}
              />

              {phone.length > 0 && (
                <button
                  type="button"
                  onClick={() => { setPhone(''); setError('') }}
                  style={{
                    background: 'rgba(0,0,0,0.06)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '22px',
                    height: '22px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--sage)',
                    fontSize: '11px',
                    flexShrink: 0
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Conditional: Room Selector for Residents */}
          {guestRole === 'resident' ? (
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--forest-deep)' }}>
                  Room Number *
                </label>
                <span style={{ fontSize: '10px', color: 'var(--brass)', fontWeight: 600 }}>Quick Select or Type</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', background: '#FFF', borderRadius: '12px', border: '1.5px solid rgba(173,138,63,0.3)', padding: '0 12px', marginBottom: '8px' }}>
                <BedDouble size={15} color="var(--sage)" style={{ flexShrink: 0, marginRight: '8px' }} />
                <input
                  type="text"
                  placeholder="e.g. 204"
                  value={roomNumber}
                  onChange={e => setRoomNumber(e.target.value)}
                  style={{
                    width: '100%',
                    border: 'none',
                    outline: 'none',
                    padding: '10px 0',
                    fontSize: '15px',
                    fontWeight: 700,
                    fontFamily: 'IBM Plex Mono, monospace',
                    color: 'var(--forest-deep)',
                    background: 'transparent'
                  }}
                />
              </div>

              {/* Quick room pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {POPULAR_ROOMS.map(rm => (
                  <button
                    key={rm}
                    type="button"
                    onClick={() => setRoomNumber(rm)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      fontFamily: 'IBM Plex Mono, monospace',
                      border: roomNumber === rm ? '1.5px solid var(--forest)' : '1px solid rgba(173,138,63,0.25)',
                      background: roomNumber === rm ? 'rgba(44,74,34,0.1)' : '#FFF',
                      color: roomNumber === rm ? 'var(--forest-deep)' : 'var(--sage)',
                      cursor: 'pointer'
                    }}
                  >
                    Rm {rm}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Conditional: Table Selector for Walk-In Diners */
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--forest-deep)' }}>
                  Restaurant Table / Seating *
                </label>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => setIsTakeaway(false)}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '10.5px',
                      fontWeight: 700,
                      border: !isTakeaway ? '1px solid var(--forest)' : '1px solid rgba(0,0,0,0.1)',
                      background: !isTakeaway ? 'rgba(44,74,34,0.1)' : '#FFF',
                      color: !isTakeaway ? 'var(--forest-deep)' : 'var(--sage)',
                      cursor: 'pointer'
                    }}
                  >
                    Dine-In Table
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsTakeaway(true)}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '10.5px',
                      fontWeight: 700,
                      border: isTakeaway ? '1px solid var(--forest)' : '1px solid rgba(0,0,0,0.1)',
                      background: isTakeaway ? 'rgba(44,74,34,0.1)' : '#FFF',
                      color: isTakeaway ? 'var(--forest-deep)' : 'var(--sage)',
                      cursor: 'pointer'
                    }}
                  >
                    Takeaway
                  </button>
                </div>
              </div>

              {!isTakeaway ? (
                <div style={{ display: 'flex', alignItems: 'center', background: '#FFF', borderRadius: '12px', border: '1.5px solid rgba(173,138,63,0.3)', padding: '0 12px' }}>
                  <MapPin size={15} color="var(--sage)" style={{ flexShrink: 0, marginRight: '8px' }} />
                  <select
                    value={tableNumber}
                    onChange={e => setTableNumber(e.target.value)}
                    style={{
                      width: '100%',
                      border: 'none',
                      outline: 'none',
                      padding: '10px 0',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: 'var(--forest-deep)',
                      background: 'transparent',
                      cursor: 'pointer'
                    }}
                  >
                    {TABLES.map(tbl => (
                      <option key={tbl} value={tbl}>
                        Table {tbl} (Indoor / Garden Seating)
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div style={{ padding: '10px 12px', background: 'rgba(173,138,63,0.08)', borderRadius: '10px', fontSize: '12px', color: 'var(--forest-deep)', fontWeight: 600 }}>
                  🛍️ Order will be packed for takeaway counter pickup.
                </div>
              )}
            </div>
          )}

          {error && (
            <div style={{ color: '#D32F2F', fontSize: '12px', textAlign: 'center', marginBottom: '14px', fontWeight: 600 }}>
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleDirectSubmit}
            disabled={loading || phone.length !== 10}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '14px',
              border: 'none',
              background: phone.length === 10 ? 'linear-gradient(135deg, var(--forest-deep), var(--forest))' : 'rgba(44,74,34,0.3)',
              color: '#FFF',
              fontSize: '14.5px',
              fontWeight: 700,
              cursor: phone.length === 10 ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: phone.length === 10 ? '0 8px 20px rgba(26,46,19,0.25)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <CheckCircle2 size={17} color="var(--brass-light)" />
                <span>{guestRole === 'resident' ? 'Enter Sanctuary & Order' : 'Start Dining Order'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>

          {/* Direct Live Access Notice */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '12px', fontSize: '11px', color: 'var(--sage)', fontWeight: 600 }}>
            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#2E7D32' }} />
            <span>Instant Live Entry · Supabase WebSocket Sync Active</span>
          </div>

          {/* ── 1-Tap Instant Demo / Test Mode ── */}
          <div 
            style={{
              marginTop: '16px',
              paddingTop: '14px',
              borderTop: '1px dashed var(--line)',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '10.5px', color: 'var(--sage)', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '8px' }}>
              1-Tap Owner & Staff Demo Access
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleQuickDemo(true)}
                style={{
                  flex: 1,
                  padding: '9px 8px',
                  borderRadius: '10px',
                  border: '1px solid rgba(173,138,63,0.4)',
                  background: 'rgba(173,138,63,0.1)',
                  color: 'var(--forest-deep)',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px'
                }}
              >
                <Key size={13} color="var(--brass)" />
                <span>Demo Room 204</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo(false)}
                style={{
                  flex: 1,
                  padding: '9px 8px',
                  borderRadius: '10px',
                  border: '1px solid rgba(44,74,34,0.3)',
                  background: 'rgba(44,74,34,0.06)',
                  color: 'var(--forest)',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px'
                }}
              >
                <UtensilsCrossed size={13} />
                <span>Demo Table T-04</span>
              </button>
            </div>

            {/* Direct Exit Link */}
            <button
              type="button"
              onClick={() => navigate(safeFrom)}
              style={{
                width: '100%',
                marginTop: '14px',
                padding: '10px',
                background: 'transparent',
                border: 'none',
                color: 'var(--brass)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                textDecoration: 'underline',
                textUnderlineOffset: '3px'
              }}
            >
              <ChevronLeft size={15} />
              <span>Continue Browsing Without Pass</span>
            </button>
          </div>
        </div>

        {/* ── VIP Privileges ── */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { icon: BedDouble, title: 'In-House Room Folio Billing', sub: 'Room charges automatically settle at checkout' },
            { icon: UtensilsCrossed, title: 'Outside Walk-In Dining', sub: 'Instant digital table receipt with 5% GST breakdown' },
            { icon: Wifi, title: 'Live Kitchen WebSocket Tracking', sub: 'Instant real-time status updates from Panache chef team' }
          ].map((item, i) => (
            <div 
              key={i}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(217,189,117,0.18)',
                borderRadius: '14px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(217,189,117,0.12)', color: 'var(--brass-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <item.icon size={16} />
              </div>
              <div>
                <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#FFF' }}>{item.title}</div>
                <div style={{ fontSize: '10.5px', color: 'rgba(243,238,219,0.55)' }}>{item.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Staff Terminals Direct Link ── */}
        <div style={{ textAlign: 'center', marginTop: '14px' }}>
          <span style={{ fontSize: '12px', color: 'rgba(243,238,219,0.55)' }}>Are you resort or kitchen staff? </span>
          <a
            href={import.meta.env.VITE_RECEPTION_PORTAL_URL || 'http://localhost:5183'}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '12px', color: 'var(--brass-light)', fontWeight: 600, textDecoration: 'underline' }}
          >
            Access Staff Consoles ➔
          </a>
        </div>

      </div>
    </div>
  )
}
