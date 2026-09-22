import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowRight, Phone, Key, Wifi, Copy, 
  MessageSquare, User, Sparkles, ChevronRight,
  UtensilsCrossed, Compass, ClipboardList, MapPin, Clock,
  Mountain, Wind, Eye, Flame, ShieldCheck, HeartHandshake, CheckCircle2
} from 'lucide-react'
import { useQRSession } from '../hooks/useQRSession'
import { useGuestAuth } from '../contexts/GuestAuthContext'
import { HIMALAYAN_EXPEDITIONS } from '../data/himalayanExperiences'

const RESORT_CONTACT = {
  address: 'Village Gethia, Mehragaon, Near Bhimtal, Nainital, Uttarakhand 263136',
  phone: '+91 7668-009-400',
  email: 'reservations@shivalayaresort.com',
  website: 'https://shivalayaresort.com',
  coordinates: '29.35° N, 79.52° E · Alt. 1,450m (4,750 ft)'
}

const IMAGES = {
  logo: 'https://shivalayaresort.com/wp-content/uploads/2024/11/Shivalaya-Resort-Logo-t.png',
  nature: 'https://shivalayaresort.com/wp-content/uploads/2026/02/Shivalaya-Resort-Nature.jpg',
  garden: 'https://shivalayaresort.com/wp-content/uploads/2026/03/IMG_20260221_175556-1-scaled.jpg',
  dining: 'https://shivalayaresort.com/wp-content/uploads/2026/02/IMG_20260130_170524__01-scaled.jpg',
  pool: 'https://shivalayaresort.com/wp-content/uploads/2026/02/IMG_1869.jpg',
  valleyNight: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&auto=format&fit=crop&q=80',
  mistyHills: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&auto=format&fit=crop&q=80'
}

export default function LandingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { session } = useQRSession()
  const { isLoggedIn, guest, isResortGuest } = useGuestAuth()

  const [showWifiModal, setShowWifiModal] = useState(false)
  const [copiedWifi, setCopiedWifi] = useState(false)
  const [activeExpIndex, setActiveExpIndex] = useState(0)

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Panache Menu', path: '/menu' },
    { label: 'Resort Experiences', path: '/experiences' },
    { label: 'My Orders', path: '/orders' }
  ]

  const copyWifi = () => {
    navigator.clipboard.writeText('Shivalaya@2026')
    setCopiedWifi(true)
    setTimeout(() => setCopiedWifi(false), 2000)
  }

  return (
    <div className="app-root" style={{ background: '#F5EEDC', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* ── 1. REGAL RESPONSIVE TOPNAV ── */}
      <nav 
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(245, 238, 220, 0.94)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(173, 138, 63, 0.22)',
          padding: '14px 0'
        }}
      >
        <div className="desktop-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Brand Logo & Title */}
          <div 
            onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
          >
            <img 
              src={IMAGES.logo} 
              alt="Shivalaya Logo" 
              style={{ width: '40px', height: '40px', objectFit: 'contain', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.08))' }} 
            />
            <div>
              <div style={{ fontFamily: 'Fraunces, serif', fontSize: '21px', fontWeight: 700, color: 'var(--forest-deep)', letterSpacing: '0.04em', lineHeight: 1 }}>
                SHIVALAYA
              </div>
              <div style={{ fontSize: '9.5px', letterSpacing: '0.22em', color: 'var(--brass)', fontWeight: 700, textTransform: 'uppercase', marginTop: '3px' }}>
                Resorts · Uttarakhand
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links (Hidden on Mobile) */}
          <div className="desktop-nav-links" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            {navLinks.map((item) => {
              const active = location.pathname === item.path
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => navigate(item.path)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '15px',
                    fontWeight: active ? 700 : 500,
                    color: active ? 'var(--forest-deep)' : 'var(--sage)',
                    cursor: 'pointer',
                    position: 'relative',
                    padding: '4px 0'
                  }}
                >
                  {item.label}
                  {active && (
                    <motion.div
                      layoutId="activeNavUnderline"
                      style={{
                        position: 'absolute',
                        bottom: -4,
                        left: 0,
                        right: 0,
                        height: '2px',
                        background: 'var(--brass)',
                        borderRadius: '2px'
                      }}
                    />
                  )}
                </button>
              )
            })}
          </div>

          {/* Header Actions: Sign In / Profile & Resident Access */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isLoggedIn ? (
              <button
                type="button"
                onClick={() => navigate('/profile')}
                style={{
                  padding: '8px 20px',
                  borderRadius: '100px',
                  background: 'rgba(44, 74, 34, 0.08)',
                  border: '1.5px solid var(--forest-deep)',
                  color: 'var(--forest-deep)',
                  fontSize: '14px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <User size={15} color="var(--forest-deep)" />
                <span>{guest?.roomNumber ? `Suite ${guest.roomNumber}` : (guest?.name ? guest.name.split(' ')[0] : 'Resident Guest')}</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="hide-on-compact"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--forest-deep)',
                    fontSize: '14.5px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    padding: '8px 12px'
                  }}
                >
                  <User size={16} />
                  <span>Resident Log In</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="btn-gold-sweep"
                  style={{
                    padding: '8px 18px',
                    borderRadius: '100px',
                    background: 'linear-gradient(135deg, var(--forest-deep), var(--forest))',
                    border: '1px solid rgba(173, 138, 63, 0.4)',
                    color: '#FFF',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(26, 46, 19, 0.2)'
                  }}
                >
                  <Key size={14} color="var(--brass-light)" />
                  <span>Suite Keycard</span>
                </button>
              </>
            )}
          </div>

        </div>
      </nav>

      {/* ── 2. SCROLLABLE BODY ── */}
      <div className="landing-body-scroll" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* ── HERO BANNER: 3D HIMALAYAN SANCTUARY ── */}
        <div style={{ paddingTop: '24px' }}>
          <div className="desktop-container">
            <motion.div 
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="landing-hero-banner card-3d-wrap"
              style={{
                position: 'relative',
                borderRadius: '28px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                minHeight: 'clamp(360px, 48vh, 480px)',
                padding: 'clamp(24px, 5vw, 36px) clamp(16px, 4vw, 32px)',
                boxShadow: '0 24px 60px rgba(26, 46, 19, 0.16)'
              }}
            >
              {/* Mountain Vista Background */}
              <img 
                src={IMAGES.nature} 
                alt="Shivalaya Mountain Sanctuary"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />

              {/* Ambient Mist & Twilight Layer */}
              <div 
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, rgba(26, 46, 19, 0.2) 0%, rgba(26, 46, 19, 0.6) 45%, rgba(18, 32, 14, 0.95) 100%)'
                }} 
              />

              {/* Floating Mountain Telemetry Pill */}
              <div 
                style={{ 
                  position: 'relative', 
                  zIndex: 10, 
                  alignSelf: 'flex-start',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(26, 46, 19, 0.75)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(212, 175, 55, 0.4)',
                  borderRadius: '100px',
                  padding: '5px 12px',
                  marginBottom: '14px',
                  maxWidth: '100%'
                }}
              >
                <Mountain size={13} color="var(--brass-light)" />
                <span style={{ fontSize: '10.5px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--brass-light)', whiteSpace: 'nowrap' }}>
                  Alt. 1,450m
                </span>
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#2ecc71', flexShrink: 0 }} />
                <span style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.85)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  Trishul View: Clear
                </span>
              </div>

              {/* Hero Main Copy */}
              <div className="landing-hero-content" style={{ position: 'relative', zIndex: 10, color: '#F3EEDB' }}>
                <h1 className="landing-hero-title" style={{ 
                  fontFamily: 'Fraunces, serif', 
                  fontWeight: 600, 
                  fontSize: 'clamp(28px, 7.5vw, 44px)',
                  lineHeight: 1.15, 
                  margin: '0 0 12px',
                  color: '#FFF' 
                }}>
                  Where the mountains<br />whisper peace.
                </h1>

                <p className="landing-hero-sub" style={{ 
                  color: 'rgba(243, 238, 219, 0.92)', 
                  fontSize: 'clamp(13px, 3.8vw, 15.5px)',
                  maxWidth: '640px',
                  lineHeight: 1.6, 
                  margin: '0 0 20px'
                }}>
                  Perched high above the clouds in the tranquil pine woods of Uttarakhand, Shivalaya Resorts is a secluded mountain retreat with slow-simmered Panache gastronomy, Bird Cage dining, and lawn campfires.
                </p>

                {/* Hero CTAs - Stacks nicely on mobile with full width & 48px touch target */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => navigate('/menu')}
                    className="btn-gold-sweep"
                    style={{
                      background: 'linear-gradient(135deg, #D9BD75 0%, #AD8A3F 100%)',
                      color: '#1A2E13',
                      border: 'none',
                      borderRadius: '14px',
                      padding: '13px 22px',
                      fontSize: '14.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 8px 24px rgba(173, 138, 63, 0.35)',
                      flex: '1 1 180px',
                      minHeight: '48px'
                    }}
                  >
                    <UtensilsCrossed size={17} />
                    <span>Order Panache Dining</span>
                    <ArrowRight size={16} />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => navigate('/experiences')}
                    style={{
                      background: 'rgba(255, 255, 255, 0.14)',
                      backdropFilter: 'blur(10px)',
                      color: '#FFF',
                      border: '1.5px solid rgba(255, 255, 255, 0.35)',
                      borderRadius: '14px',
                      padding: '13px 20px',
                      fontSize: '14.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      flex: '1 1 150px',
                      minHeight: '48px'
                    }}
                  >
                    <Compass size={17} color="var(--brass-light)" />
                    <span>Resort Experiences</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── 3. RESIDENT SUITE PASS & CONCIERGE ACCESS ── */}
        <div style={{ paddingTop: '28px' }}>
          <div className="desktop-container">
            {isLoggedIn && guest?.roomNumber ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '24px',
                  padding: 'clamp(18px, 4vw, 24px)',
                  border: '1.5px solid rgba(173, 138, 63, 0.3)',
                  boxShadow: '0 8px 24px rgba(26, 46, 19, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '14px'
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--sage)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>
                    Active Sanctuary Resident
                  </div>
                  <div style={{ fontFamily: 'Fraunces, serif', fontSize: '20px', fontWeight: 700, color: 'var(--forest-deep)', marginTop: '2px' }}>
                    {guest.name || 'Resident Guest'}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--brass)', fontWeight: 600, marginTop: '2px' }}>
                    Suite {guest.roomNumber} · Verified Keycard Pass
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', width: '100%', maxWidth: '340px' }}>
                  <button
                    type="button"
                    onClick={() => setShowWifiModal(true)}
                    style={{
                      background: 'rgba(44, 74, 34, 0.06)',
                      border: '1.5px solid rgba(44, 74, 34, 0.18)',
                      borderRadius: '14px',
                      padding: '10px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      color: 'var(--forest-deep)',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      flex: '1 1 140px',
                      minHeight: '44px'
                    }}
                  >
                    <Wifi size={15} color="var(--brass)" />
                    <span>Wi-Fi Pass</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/orders')}
                    style={{
                      background: 'var(--forest-deep)',
                      border: 'none',
                      borderRadius: '14px',
                      padding: '10px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      color: '#FFF',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      flex: '1 1 140px',
                      minHeight: '44px'
                    }}
                  >
                    <ClipboardList size={15} color="var(--brass-light)" />
                    <span>Suite Orders</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              <div
                onClick={() => navigate('/login')}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '24px',
                  padding: 'clamp(18px, 4vw, 24px)',
                  border: '1.5px solid rgba(173, 138, 63, 0.25)',
                  boxShadow: '0 8px 24px rgba(26, 46, 19, 0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '14px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 240px' }}>
                  <div style={{ 
                    width: '46px', height: '46px', borderRadius: '50%', 
                    background: 'rgba(44, 74, 34, 0.08)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--forest-deep)',
                    flexShrink: 0
                  }}>
                    <Key size={20} color="var(--brass)" />
                  </div>
                  <div>
                    <div className="resident-card-title" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--forest-deep)', fontFamily: 'Fraunces, serif' }}>
                      Staying with us at Shivalaya Resorts?
                    </div>
                    <div className="resident-card-sub" style={{ fontSize: '13px', color: 'var(--sage)', marginTop: '2px' }}>
                      Sign in with your room or phone to charge to your folio
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--brass)', fontWeight: 700, fontSize: '13.5px' }}>
                  <span>Verify Suite</span>
                  <ChevronRight size={18} color="var(--brass)" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── 4. SIGNATURE RESORT EXPERIENCES: BIRD CAGE, BONFIRE, PS5 GAMING, CAMPING & TREKS ── */}
        <div style={{ paddingTop: '48px' }}>
          <div className="desktop-container">
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <div style={{ fontSize: '11.5px', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--brass)' }}>
                  Signature Resort Activities
                </div>
                <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(26px, 6vw, 34px)', fontWeight: 700, color: 'var(--forest-deep)', margin: '4px 0 0' }}>
                  Unique Experiences At Shivalaya
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--sage)', margin: '6px 0 0', maxWidth: '640px', lineHeight: 1.5 }}>
                  Not your everyday resort. Enjoy private candlelight dining in our iconic fairy-lit Bird Cage, crackling pine wood bonfires, PS5 gaming battles, starlit lawn camping, and gentle pine forest walks.
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate('/experiences')}
                style={{
                  background: 'none',
                  border: '1.5px solid var(--forest-deep)',
                  borderRadius: '100px',
                  padding: '9px 20px',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  color: 'var(--forest-deep)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>Explore All Experiences</span>
                <ArrowRight size={15} />
              </motion.button>
            </div>

            {/* Expeditions Grid (Top 4 Signature Showcase) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '20px' }}>
              {HIMALAYAN_EXPEDITIONS.slice(0, 4).map((exp, idx) => (
                <div key={exp.id} className="card-3d-wrap">
                  <motion.div
                    whileHover={{ y: -5, rotateX: 1.2, scale: 1.008 }}
                    transition={{ duration: 0.25 }}
                    onClick={() => navigate('/experiences')}
                    className="card-3d-interactive"
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '24px',
                      overflow: 'hidden',
                      boxShadow: '0 12px 32px rgba(26, 46, 19, 0.07)',
                      border: '1.5px solid rgba(173, 138, 63, 0.22)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%'
                    }}
                  >
                    <div style={{ position: 'relative', width: '100%', height: 'clamp(180px, 28vh, 220px)', overflow: 'hidden' }}>
                      <img 
                        src={exp.image_url} 
                        alt={exp.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                      <div 
                        style={{ 
                          position: 'absolute', 
                          top: '12px', 
                          left: '12px', 
                          background: 'rgba(26, 46, 19, 0.88)', 
                          backdropFilter: 'blur(8px)', 
                          padding: '4px 10px', 
                          borderRadius: '100px', 
                          color: 'var(--brass-light)', 
                          fontSize: '10.5px', 
                          fontWeight: 700, 
                          textTransform: 'uppercase', 
                          letterSpacing: '0.06em' 
                        }}
                      >
                        {exp.badge}
                      </div>

                      <div 
                        style={{ 
                          position: 'absolute', 
                          bottom: '10px', 
                          right: '10px', 
                          background: 'rgba(0,0,0,0.65)', 
                          backdropFilter: 'blur(6px)', 
                          padding: '3px 8px', 
                          borderRadius: '6px', 
                          color: '#FFF', 
                          fontSize: '10.5px', 
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Compass size={11} color="var(--brass-light)" />
                        <span>{exp.elevation}</span>
                      </div>
                    </div>

                    <div style={{ padding: 'clamp(18px, 4vw, 22px)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: '10.5px', fontWeight: 800, letterSpacing: '0.12em', color: 'var(--brass)', textTransform: 'uppercase', marginBottom: '4px' }}>
                          {exp.categoryLabel} · {exp.duration}
                        </div>
                        <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '19px', fontWeight: 700, color: 'var(--forest-deep)', margin: '0 0 8px', lineHeight: 1.25 }}>
                          {exp.name}
                        </h3>
                        <p style={{ fontSize: '13px', color: 'var(--ink-soft)', lineHeight: 1.55, margin: '0 0 14px' }}>
                          {exp.tagline}
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '12px' }}>
                        <div>
                          <div style={{ fontSize: '9.5px', color: 'var(--sage)', textTransform: 'uppercase', fontWeight: 700 }}>
                            {exp.pricing_type === 'per_setup' ? 'Per Setup' : exp.pricing_type === 'per_session' ? 'Per Session' : 'Per Person'}
                          </div>
                          <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '17px', fontWeight: 700, color: 'var(--forest-deep)' }}>
                            ₹{(exp.price_per_setup || exp.price_per_session || exp.price_per_person).toLocaleString('en-IN')}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--brass)', fontSize: '13px', fontWeight: 700 }}>
                          <span>Details</span>
                          <ChevronRight size={15} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 5. PANACHE RESTAURANT MOUNTAIN DINING RITUALS ── */}
        <div style={{ paddingTop: '52px' }}>
          <div className="desktop-container">
            <div 
              style={{
                background: 'linear-gradient(135deg, #1A2E13 0%, #2C4A22 100%)',
                borderRadius: '28px',
                padding: 'clamp(26px, 5vw, 40px) clamp(18px, 4vw, 32px)',
                color: '#FFF',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 20px 50px rgba(26, 46, 19, 0.2)'
              }}
            >
              {/* Background ambient glow */}
              <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(217, 189, 117, 0.15) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />

              <div style={{ maxWidth: '720px', position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(212, 175, 55, 0.2)', border: '1px solid rgba(212, 175, 55, 0.4)', borderRadius: '100px', padding: '4px 12px', marginBottom: '14px' }}>
                  <Flame size={13} color="var(--brass-light)" />
                  <span style={{ fontSize: '10.5px', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--brass-light)' }}>
                    Woodfire & Mountain Spices
                  </span>
                </div>

                <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(24px, 6vw, 34px)', fontWeight: 700, margin: '0 0 14px', lineHeight: 1.2 }}>
                  Panache Restaurant:<br />High-Altitude Artisanal Gastronomy
                </h2>

                <p style={{ fontSize: 'clamp(13.5px, 3.8vw, 15px)', color: 'rgba(255,255,255,0.85)', lineHeight: 1.65, margin: '0 0 24px' }}>
                  Slow food, crafted with reverence for the Kumaon terroir. We cook with mountain river spring water, grind wild jakhiya and timur on ancient granite sil-battas, and slow-smoke meats and hand-churned paneer in traditional clay sigris.
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => navigate('/menu')}
                    className="btn-gold-sweep"
                    style={{
                      background: 'linear-gradient(135deg, #D9BD75 0%, #AD8A3F 100%)',
                      color: '#1A2E13',
                      border: 'none',
                      borderRadius: '14px',
                      padding: '13px 22px',
                      fontSize: '14.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 8px 24px rgba(173, 138, 63, 0.4)',
                      flex: '1 1 200px',
                      minHeight: '48px'
                    }}
                  >
                    <UtensilsCrossed size={17} />
                    <span>Explore Digital Menu</span>
                    <ArrowRight size={16} />
                  </motion.button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--brass-light)', fontSize: '13px', fontWeight: 600 }}>
                    <Clock size={15} />
                    <span>Kitchen Active: 7 AM – 11 PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 6. SANCTUARY LIVING: MOUNTAINS, MIST & TWINKLING VALLEY LIGHTS ── */}
        <div style={{ paddingTop: '64px', paddingBottom: '60px' }}>
          <div className="desktop-container">
            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--brass)' }}>
                The Shivalaya Lifestyle
              </div>
              <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '34px', fontWeight: 700, color: 'var(--forest-deep)', margin: '6px 0 0' }}>
                Sanctuary Living High in Uttarakhand
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              {/* Feature 1 */}
              <div style={{ background: '#FFFFFF', borderRadius: '24px', padding: '30px', border: '1px solid rgba(173, 138, 63, 0.18)', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(44, 74, 34, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
                  <Wind size={24} color="var(--forest-deep)" />
                </div>
                <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '20px', fontWeight: 700, color: 'var(--forest-deep)', margin: '0 0 8px' }}>
                  Crisp Alpine Fog & Pine Needles
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--ink-soft)', lineHeight: 1.6, margin: 0 }}>
                  Wake to heavy morning mists curling through towering deodars. Breathe in air rich with natural pine ozone and birdsong at 1,450 meters elevation.
                </p>
              </div>

              {/* Feature 2 */}
              <div style={{ background: '#FFFFFF', borderRadius: '24px', padding: '30px', border: '1px solid rgba(173, 138, 63, 0.18)', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(44, 74, 34, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
                  <Sparkles size={24} color="var(--brass)" />
                </div>
                <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '20px', fontWeight: 700, color: 'var(--forest-deep)', margin: '0 0 8px' }}>
                  Twinkling Valley Lights at Dusk
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--ink-soft)', lineHeight: 1.6, margin: 0 }}>
                  As dusk blankets the Himalayan peaks, look out from your terrace to watch the towns of Bhimtal and Kathgodam sparkle like a carpet of fallen stars below.
                </p>
              </div>

              {/* Feature 3 */}
              <div style={{ background: '#FFFFFF', borderRadius: '24px', padding: '30px', border: '1px solid rgba(173, 138, 63, 0.18)', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(44, 74, 34, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
                  <HeartHandshake size={24} color="var(--forest-deep)" />
                </div>
                <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '20px', fontWeight: 700, color: 'var(--forest-deep)', margin: '0 0 8px' }}>
                  Devoted Kumaoni Hospitality
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--ink-soft)', lineHeight: 1.6, margin: 0 }}>
                  Authentic, unhurried warmth. From personal sherpas guiding your ridge treks to evening braziers lit on your private stone balcony.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── 7. FOOTER ── */}
        <footer style={{ background: '#1A2E13', color: '#EBE0C4', padding: '48px 0 100px', borderTop: '1px solid rgba(173, 138, 63, 0.3)' }}>
          <div className="desktop-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '32px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <img src={IMAGES.logo} alt="Shivalaya Logo" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
                  <span style={{ fontFamily: 'Fraunces, serif', fontSize: '22px', fontWeight: 700, color: '#FFF' }}>SHIVALAYA RESORTS</span>
                </div>
                <p style={{ fontSize: '13.5px', color: 'rgba(235, 224, 196, 0.75)', maxWidth: '380px', lineHeight: 1.6, margin: 0 }}>
                  A luxury Himalayan mountain retreat & home of Panache Restaurant. Village Gethia, Mehragaon, Bhimtal, Uttarakhand.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--brass)', fontWeight: 700 }}>Concierge Desk</span>
                <a href={`tel:${RESORT_CONTACT.phone}`} style={{ color: '#FFF', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>{RESORT_CONTACT.phone}</a>
                <span style={{ fontSize: '13px', color: 'rgba(235, 224, 196, 0.75)' }}>reservations@shivalayaresort.com</span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '36px', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: 'rgba(235, 224, 196, 0.6)' }}>
              <span>© {new Date().getFullYear()} Shivalaya Resorts & Panache Restaurant. All rights reserved.</span>
              <span>29.35° N, 79.52° E · Alt. 1,450m Kumaon Himalayas</span>
            </div>
          </div>
        </footer>

      </div>

      {/* ── WI-FI ACCESS MODAL ── */}
      <AnimatePresence>
        {showWifiModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowWifiModal(false)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              style={{ position: 'relative', zIndex: 10, background: '#FFF', borderRadius: '24px', padding: '32px', maxWidth: '380px', width: '100%', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', textAlign: 'center' }}
            >
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(44, 74, 34, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Wifi size={28} color="var(--forest-deep)" />
              </div>
              <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '22px', fontWeight: 700, color: 'var(--forest-deep)', margin: '0 0 6px' }}>
                Resort High-Speed Wi-Fi
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--sage)', margin: '0 0 20px' }}>
                High-altitude fiber optic network coverage throughout all suites, dining terraces & garden lawns.
              </p>

              <div style={{ background: 'var(--parchment)', borderRadius: '16px', padding: '16px', marginBottom: '20px', textAlign: 'left' }}>
                <div style={{ fontSize: '11px', color: 'var(--sage)', textTransform: 'uppercase', fontWeight: 700 }}>Network Name (SSID)</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--forest-deep)', marginBottom: '10px' }}>Shivalaya_Sanctuary_5G</div>

                <div style={{ fontSize: '11px', color: 'var(--sage)', textTransform: 'uppercase', fontWeight: 700 }}>Password</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '16px', fontWeight: 700, color: 'var(--brass)' }}>Shivalaya@2026</span>
                  <button 
                    type="button" 
                    onClick={copyWifi} 
                    style={{ background: 'none', border: 'none', color: 'var(--forest-deep)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600 }}
                  >
                    {copiedWifi ? <CheckCircle2 size={16} color="#2ecc71" /> : <Copy size={16} />}
                    <span>{copiedWifi ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <button 
                type="button" 
                onClick={() => setShowWifiModal(false)}
                style={{ width: '100%', background: 'var(--forest-deep)', color: '#FFF', border: 'none', borderRadius: '14px', padding: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
