/**
 * ProfilePage — Guest account view
 *
 * Logged in: name, room/table number, contact, quick order links, logout
 * Not logged in: Displays clean guest access card with 1-tap Sign In and Back to Menu
 * NEVER crashes or renders blank.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGuestAuth } from '../contexts/GuestAuthContext'
import { User, BedDouble, Phone, Receipt, Compass, LogOut, ChevronRight, ChevronLeft, Edit3, Check, Key, UtensilsCrossed, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { guest, isLoggedIn, isResortGuest, logout, updateName } = useGuestAuth()

  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput]     = useState(guest?.name || '')
  const [savingName, setSavingName]   = useState(false)

  async function handleSaveName() {
    if (!nameInput.trim()) return
    setSavingName(true)
    await updateName(nameInput.trim())
    setSavingName(false)
    setEditingName(false)
  }

  function handleLogout() {
    logout()
    navigate('/')
  }

  // Animation variants
  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  }
  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  }

  return (
    <div className="app-root" style={{ minHeight: '100dvh', background: 'var(--parchment)', display: 'flex', flexDirection: 'column' }}>
      {/* ── STICKY TOP BRAND HEADER ── */}
      <div 
        className="topnav" 
        style={{ 
          position: 'sticky', 
          top: 0, 
          zIndex: 100, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '12px 18px', 
          background: 'rgba(255, 252, 244, 0.95)', 
          backdropFilter: 'blur(20px)', 
          borderBottom: '1px solid rgba(217,189,117,0.2)' 
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            className="icon-btn" 
            aria-label="Go back" 
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1)
              } else {
                navigate('/')
              }
            }}
            style={{ width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <ChevronLeft size={20} />
          </button>
          <div 
            onClick={() => navigate('/')} 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
          >
            <img 
              src="https://shivalayaresort.com/wp-content/uploads/2024/11/Shivalaya-Resort-Logo-t.png" 
              alt="Shivalaya Resorts" 
              style={{ width: '32px', height: '32px', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.08))' }} 
            />
            <div>
              <div style={{ fontFamily: 'Fraunces, serif', fontSize: '16px', fontWeight: 700, color: 'var(--forest-deep)', lineHeight: 1.1 }}>
                SHIVALAYA
              </div>
              <div style={{ fontSize: '9px', color: 'var(--brass)', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700 }}>
                Guest Identity
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/menu')}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--forest-deep)',
            cursor: 'pointer',
            padding: '4px 8px'
          }}
        >
          Menu
        </button>
      </div>

      <div className="app-scroll" style={{ flex: 1, paddingBottom: '120px' }}>
        {!isLoggedIn ? (
          /* ── NOT LOGGED IN STATE (CLEAN, BEAUTIFUL, NEVER BLANK) ── */
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ padding: '24px 20px', maxWidth: '480px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '18px' }}
          >
            <div style={{
              background: 'linear-gradient(135deg, var(--forest-deep) 0%, var(--forest) 100%)',
              borderRadius: '24px', padding: '32px 24px',
              boxShadow: '0 20px 40px rgba(26,46,19,0.18)',
              color: '#fff', textAlign: 'center', position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: '2px solid rgba(217,189,117,0.3)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brass-light)' }}>
                <Key size={32} />
              </div>
              <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '24px', fontWeight: 700, margin: '0 0 8px', color: '#F3EEDB' }}>
                Guest Sanctuary Pass
              </h2>
              <p style={{ fontSize: '13.5px', color: 'rgba(243,238,219,0.8)', margin: '0 0 24px', lineHeight: 1.5 }}>
                Sign in with your mobile number or suite room number to access room folio billing, track active orders, and reserve mountain experiences.
              </p>

              <button
                type="button"
                onClick={() => navigate('/login', { state: { from: '/profile' } })}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '14px',
                  border: 'none',
                  background: 'linear-gradient(135deg, var(--brass), var(--brass-light))',
                  color: 'var(--forest-deep)',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.25)'
                }}
              >
                <span>Enter Mobile Pass / Suite Sign In</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Quick Navigation Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '6px' }}>
              <div 
                onClick={() => navigate('/menu')}
                style={{
                  background: 'var(--card)',
                  border: '1px solid rgba(0,0,0,0.06)',
                  borderRadius: '16px',
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(44,74,34,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--forest)' }}>
                    <UtensilsCrossed size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--forest-deep)' }}>Panache Restaurant Menu</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--sage)' }}>Order food directly to your table or suite</div>
                  </div>
                </div>
                <ChevronRight size={16} color="var(--sage)" />
              </div>

              <div 
                onClick={() => navigate('/orders')}
                style={{
                  background: 'var(--card)',
                  border: '1px solid rgba(0,0,0,0.06)',
                  borderRadius: '16px',
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(173,138,63,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brass)' }}>
                    <Receipt size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--forest-deep)' }}>View Orders & Tax Invoices</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--sage)' }}>Access 80mm GST food bills and tracking</div>
                  </div>
                </div>
                <ChevronRight size={16} color="var(--sage)" />
              </div>

              <button
                type="button"
                onClick={() => navigate('/')}
                style={{
                  padding: '12px',
                  background: 'transparent',
                  border: '1.5px solid var(--parchment-deep)',
                  borderRadius: '12px',
                  color: 'var(--forest-deep)',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginTop: '8px'
                }}
              >
                ← Return to Sanctuary Home
              </button>
            </div>
          </motion.div>
        ) : (
          /* ── LOGGED IN GUEST PROFILE ── */
          <motion.div 
            initial="hidden" animate="show" variants={containerVars}
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            {/* ── PREMIUM HEADER & CARD ── */}
            <motion.div variants={itemVars} style={{ padding: '24px 20px', position: 'relative' }}>
              <div style={{
                background: 'linear-gradient(135deg, var(--forest-deep) 0%, var(--forest) 100%)',
                borderRadius: '24px', padding: '32px 24px',
                boxShadow: '0 20px 40px rgba(26,46,19,0.15)',
                position: 'relative', overflow: 'hidden', color: '#fff'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', position: 'relative', zIndex: 10 }}>
                  {/* Avatar */}
                  <motion.div 
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}
                  >
                    <User size={34} color="var(--parchment)" />
                  </motion.div>

                  {/* Guest Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {editingName ? (
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <input
                          value={nameInput}
                          onChange={e => setNameInput(e.target.value)}
                          autoFocus
                          style={{ flex: 1, minWidth: 0, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontFamily: 'Fraunces, serif', fontSize: '18px', outline: 'none' }}
                        />
                        <button onClick={handleSaveName} disabled={savingName} style={{ background: 'var(--brass)', border: 'none', borderRadius: '8px', padding: '0 12px', color: '#fff', cursor: 'pointer' }}>
                          <Check size={16} />
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <h1 style={{ margin: 0, fontFamily: 'Fraunces, serif', fontSize: '22px', fontWeight: 700, letterSpacing: '0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {guest?.name || 'Guest'}
                        </h1>
                        {!isResortGuest && (
                          <button onClick={() => setEditingName(true)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', padding: '4px' }}>
                            <Edit3 size={15} />
                          </button>
                        )}
                      </div>
                    )}
                    
                    {/* Badges */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {isResortGuest && guest?.roomNumber ? (
                        <span style={{ fontSize: '11px', fontWeight: 700, background: 'rgba(173,138,63,0.9)', color: '#fff', padding: '4px 10px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px', letterSpacing: '0.05em' }}>
                          <BedDouble size={12} /> SUITE {guest.roomNumber}
                        </span>
                      ) : (
                        <span style={{ fontSize: '11px', fontWeight: 700, background: 'rgba(255,255,255,0.15)', color: '#fff', padding: '4px 10px', borderRadius: '12px' }}>
                          WALK-IN DINER
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Details */}
                <div style={{ marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,255,255,0.85)', fontSize: '13px' }}>
                    <Phone size={15} color="var(--brass-light)" />
                    <span style={{ fontFamily: 'IBM Plex Mono, monospace' }}>+91 {guest?.phone}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ── QUICK ACTIONS ── */}
            <motion.div variants={itemVars} style={{ padding: '0 20px' }}>
              <h3 style={{ fontSize: '11px', fontWeight: 800, color: 'var(--sage)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '14px', marginLeft: '4px' }}>Quick Access</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { icon: Receipt, label: 'My Food Orders & Bills', sub: 'Track and print 80mm GST food bills', path: '/orders', tab: 'food' },
                  { icon: Compass, label: 'My Himalayan Experiences', sub: 'Bird cage, bonfire & adventure bookings', path: '/orders', tab: 'activity' },
                ].map((item, i) => (
                  <motion.div 
                    key={i} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(item.path, { state: { tab: item.tab } })}
                    style={{ background: 'var(--card)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}
                  >
                    <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(44,74,34,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--forest)' }}>
                      <item.icon size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: '14.5px', marginBottom: '2px' }}>{item.label}</div>
                      <div style={{ fontSize: '12px', color: 'var(--sage)' }}>{item.sub}</div>
                    </div>
                    <ChevronRight size={16} color="var(--sage)" />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* ── LOGOUT & RETURN BUTTONS ── */}
            <motion.div variants={itemVars} style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                onClick={() => navigate('/menu')}
                style={{ width: '100%', padding: '14px', background: 'rgba(44,74,34,0.08)', border: '1px solid rgba(44,74,34,0.2)', borderRadius: '14px', color: 'var(--forest-deep)', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
              >
                ← Back to Panache Menu
              </button>

              <button 
                onClick={handleLogout}
                style={{ width: '100%', padding: '14px', background: 'transparent', border: '1px solid rgba(154,69,48,0.25)', borderRadius: '14px', color: 'var(--rust)', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}
              >
                <LogOut size={16} />
                Sign Out of Pass
              </button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
