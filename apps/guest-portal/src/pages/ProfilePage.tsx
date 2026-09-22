/**
 * ProfilePage — Guest account view
 *
 * Resort guests: name, room number, check-in badge, quick links
 * Walk-in guests: name entry prompt, phone, order history
 * Not logged in: redirects to /login
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGuestAuth } from '../contexts/GuestAuthContext'
import { User, BedDouble, Phone, Receipt, Compass, LogOut, ChevronRight, ChevronLeft, Edit3, Check, Mail } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { guest, isLoggedIn, isResortGuest, logout, updateName } = useGuestAuth()

  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput]     = useState(guest?.name || '')
  const [savingName, setSavingName]   = useState(false)

  // Redirect if not logged in
  if (!isLoggedIn) {
    navigate('/login', { state: { from: '/profile' } })
    return null
  }

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

  // Container animation
  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  }
  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  }

  return (
    <div className="app-root" style={{ minHeight: '100dvh', background: 'var(--parchment)', display: 'flex', flexDirection: 'column' }}>
      {/* ── STICKY TOP BRAND HEADER ── */}
      <div className="topnav" style={{ position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', background: 'rgba(255, 252, 244, 0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(217,189,117,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <button 
            className="icon-btn" 
            aria-label="Go back" 
            onClick={(e) => { e.stopPropagation(); navigate('/'); }}
            style={{ width: '32px', height: '32px' }}
          >
            <ChevronLeft size={18} />
          </button>
          <img 
            src="https://shivalayaresort.com/wp-content/uploads/2024/11/Shivalaya-Resort-Logo-t.png" 
            alt="Shivalaya Resorts" 
            style={{ width: '34px', height: '34px', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.08))' }} 
          />
          <div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: '17px', fontWeight: 700, color: 'var(--forest-deep)', lineHeight: 1.1 }}>
              SHIVALAYA
            </div>
            <div style={{ fontSize: '9.5px', color: 'var(--brass)', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600 }}>
              Guest Profile
            </div>
          </div>
        </div>
      </div>

      <div className="app-scroll" style={{ flex: 1, paddingBottom: '100px' }}>
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
          {/* Subtle patterns */}
          <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: -50, left: -50, width: 150, height: 150, background: 'radial-gradient(circle, rgba(173,138,63,0.15) 0%, transparent 70%)', borderRadius: '50%' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', position: 'relative', zIndex: 10 }}>
            {/* Avatar */}
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}
            >
              <User size={36} color="var(--parchment)" />
            </motion.div>

            {/* Guest Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {editingName ? (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    autoFocus
                    style={{ flex: 1, minWidth: 0, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontFamily: 'Fraunces, serif', fontSize: '20px', outline: 'none' }}
                  />
                  <button onClick={handleSaveName} disabled={savingName} style={{ background: 'var(--brass)', border: 'none', borderRadius: '8px', padding: '0 12px', color: '#fff', cursor: 'pointer' }}>
                    <Check size={18} />
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <h1 style={{ margin: 0, fontFamily: 'Fraunces, serif', fontSize: '24px', fontWeight: 700, letterSpacing: '0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {guest?.name || 'Guest'}
                  </h1>
                  {!isResortGuest && (
                    <button onClick={() => setEditingName(true)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', padding: '4px' }}>
                      <Edit3 size={16} />
                    </button>
                  )}
                </div>
              )}
              
              {/* Badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {isResortGuest && guest?.roomNumber ? (
                  <span style={{ fontSize: '11px', fontWeight: 700, background: 'rgba(173,138,63,0.9)', color: '#fff', padding: '4px 10px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px', letterSpacing: '0.05em', boxShadow: '0 2px 8px rgba(173,138,63,0.4)' }}>
                    <BedDouble size={12} /> ROOM {guest.roomNumber}
                  </span>
                ) : (
                  <span style={{ fontSize: '11px', fontWeight: 700, background: 'rgba(255,255,255,0.15)', color: '#fff', padding: '4px 10px', borderRadius: '12px' }}>
                    WALK-IN
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Contact Details Grid */}
          <div style={{ marginTop: '28px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'rgba(255,255,255,0.8)', fontSize: '13px' }}>
              <Phone size={16} color="var(--brass-light)" />
              <span style={{ fontFamily: 'IBM Plex Mono, monospace', letterSpacing: '0.05em' }}>+91 {guest?.phone}</span>
            </div>
            {isResortGuest && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'rgba(255,255,255,0.8)', fontSize: '13px' }}>
                <Mail size={16} color="var(--brass-light)" />
                <span style={{ fontFamily: 'IBM Plex Mono, monospace', letterSpacing: '0.05em' }}>{guest?.email || <span style={{ fontStyle: 'italic', opacity: 0.7 }}>Added at check-in</span>}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── WALK-IN NAME PROMPT ── */}
      <AnimatePresence>
        {!isResortGuest && !guest?.name && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ padding: '0 20px', overflow: 'hidden' }}
          >
            <div style={{ background: 'rgba(173,138,63,0.08)', border: '1px solid rgba(173,138,63,0.2)', padding: '16px', borderRadius: '16px', marginBottom: '24px' }}>
              <p style={{ margin: '0 0 12px', fontSize: '13px', color: 'var(--ink)', fontWeight: 600 }}>Please enter your name to assist our kitchen staff.</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input value={nameInput} onChange={e => setNameInput(e.target.value)} placeholder="Your name" style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--line)', background: '#fff', outline: 'none', fontSize: '14px' }} />
                <button onClick={handleSaveName} style={{ background: 'var(--forest)', color: '#fff', border: 'none', borderRadius: '12px', padding: '0 20px', fontWeight: 600, cursor: 'pointer' }}>Save</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── QUICK ACTIONS ── */}
      <motion.div variants={itemVars} style={{ padding: '0 20px' }}>
        <h3 style={{ fontSize: '11px', fontWeight: 800, color: 'var(--sage)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '16px', marginLeft: '4px' }}>Quick Access</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { icon: Receipt, label: 'My Food Orders', sub: 'Past & active dining orders', path: '/orders', tab: 'food' },
            { icon: Compass, label: 'My Experiences', sub: 'Booked adventures & wellness', path: '/orders', tab: 'activity' },
          ].map((item, i) => (
            <motion.div 
              key={i} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => navigate(item.path, { state: { tab: item.tab } })}
              style={{ background: 'var(--card)', border: '1px solid rgba(0,0,0,0.04)', borderRadius: '20px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}
            >
              <div style={{ width: 48, height: 48, borderRadius: '14px', background: 'rgba(44,74,34,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--forest)' }}>
                <item.icon size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: '15px', marginBottom: '2px' }}>{item.label}</div>
                <div style={{ fontSize: '13px', color: 'var(--sage)' }}>{item.sub}</div>
              </div>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--parchment)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronRight size={16} color="var(--forest)" />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── INFO CARD ── */}
      {isResortGuest && (
        <motion.div variants={itemVars} style={{ padding: '24px 20px' }}>
          <div style={{ background: 'rgba(173,138,63,0.05)', border: '1px dashed rgba(173,138,63,0.3)', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', background: 'rgba(173,138,63,0.1)', color: 'var(--brass)', marginBottom: '12px' }}>
              <BedDouble size={16} />
            </div>
            <h4 style={{ margin: '0 0 8px', fontSize: '14px', color: 'var(--forest-deep)' }}>Seamless Room Billing</h4>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink-soft)', lineHeight: 1.5 }}>
              All your orders and bookings are automatically credited to Room {guest?.roomNumber}. No cash required until checkout.
            </p>
          </div>
        </motion.div>
      )}

      {/* ── LOGOUT ── */}
      <motion.div variants={itemVars} style={{ padding: '0 20px', marginTop: 'auto', paddingTop: '40px' }}>
        <button 
          onClick={handleLogout}
          style={{ width: '100%', padding: '16px', background: 'transparent', border: '1px solid rgba(154,69,48,0.3)', borderRadius: '16px', color: 'var(--rust)', fontWeight: 700, fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}
        >
          <LogOut size={18} />
          Sign Out of Device
        </button>
      </motion.div>
    </motion.div>
  </div>
</div>
)
}
