import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft, Clock, Users, Compass, CheckCircle2, Loader2, 
  Sparkles, Image as ImageIcon, User, Key, Mountain, Wind, 
  ChevronDown, ChevronUp, MapPin, Check, Backpack, AlertCircle, ArrowRight
} from 'lucide-react'
import { useActivities, Activity } from '../hooks/useActivities'
import { useGuestAuth } from '../contexts/GuestAuthContext'
import BookingModal from '../components/BookingModal'
import { HIMALAYAN_EXPEDITIONS, HimalayanExpedition } from '../data/himalayanExperiences'

export default function ExperiencesPage() {
  const navigate = useNavigate()
  const { activities, loading } = useActivities()
  const { isResortGuest, guest } = useGuestAuth()
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedExpForBooking, setSelectedExpForBooking] = useState<any | null>(null)
  const [expandedItineraryId, setExpandedItineraryId] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState('')

  const categories = [
    { id: 'all', label: 'All Experiences' },
    { id: 'birdcage', label: 'Bird Cage Dining' },
    { id: 'bonfire', label: 'Bonfire & BBQ' },
    { id: 'gaming', label: 'PS5 Gaming Lounge' },
    { id: 'camping', label: 'Lawn Camping' },
    { id: 'trek', label: 'Pine Forest Treks' },
    { id: 'excursion', label: 'Kasar Devi & Waterfall' }
  ]

  // Merge database activities with rich curated offline Himalayan expeditions
  const combinedExpeditions = useMemo(() => {
    // Start with our rich curated expeditions
    const list: (HimalayanExpedition & { dbActivity?: Activity })[] = [...HIMALAYAN_EXPEDITIONS]

    // If database returned custom activities, integrate or append them
    if (activities && activities.length > 0) {
      activities.forEach(dbAct => {
        const matchingIndex = list.findIndex(e => e.name.toLowerCase() === dbAct.name.toLowerCase())
        if (matchingIndex >= 0) {
          list[matchingIndex].dbActivity = dbAct
          list[matchingIndex].id = dbAct.id // Use database UUID if available for slot bookings
        }
      })
    }

    if (selectedCategory === 'all') return list
    return list.filter(e => e.category === selectedCategory)
  }, [activities, selectedCategory])

  const handleBookingSuccess = (bookingId: string) => {
    setSelectedExpForBooking(null)
    setSuccessMessage(`Experience confirmed! Reservation Reference: ${bookingId}`)
    setTimeout(() => setSuccessMessage(''), 6000)
  }

  const toggleItinerary = (id: string) => {
    setExpandedItineraryId(prev => (prev === id ? null : id))
  }

  return (
    <div className="app-root" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--parchment)' }}>
      
      {/* ── TOP NAVIGATION ── */}
      <nav 
        style={{ 
          position: 'sticky', top: 0, zIndex: 100,
          background: 'rgba(245, 238, 220, 0.95)', backdropFilter: 'blur(20px)', 
          borderBottom: '1px solid rgba(173, 138, 63, 0.22)', padding: '14px 0' 
        }}
      >
        <div className="desktop-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="brand-mini" onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img 
              src="https://shivalayaresort.com/wp-content/uploads/2024/11/Shivalaya-Resort-Logo-t.png" 
              alt="Shivalaya Logo" 
              style={{ width: '38px', height: '38px', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} 
            />
            <div>
              <div style={{ fontSize: '19px', lineHeight: 1.1, color: 'var(--forest-deep)', fontFamily: 'Fraunces, serif', fontWeight: 700 }}>
                SHIVALAYA
              </div>
              <div style={{ fontSize: '9px', color: 'var(--brass)', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                Resort Experiences
              </div>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="desktop-nav-links" style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
            <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', fontSize: '15px', fontWeight: 500, color: 'var(--sage)', cursor: 'pointer' }}>Home</button>
            <button onClick={() => navigate('/menu')} style={{ background: 'none', border: 'none', fontSize: '15px', fontWeight: 500, color: 'var(--sage)', cursor: 'pointer' }}>Panache Menu</button>
            <button onClick={() => navigate('/experiences')} style={{ background: 'none', border: 'none', fontSize: '15px', fontWeight: 700, color: 'var(--forest-deep)', cursor: 'pointer', borderBottom: '2px solid var(--brass)', paddingBottom: '2px' }}>Experiences</button>
            <button onClick={() => navigate('/orders')} style={{ background: 'none', border: 'none', fontSize: '15px', fontWeight: 500, color: 'var(--sage)', cursor: 'pointer' }}>My Orders</button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={() => navigate(isResortGuest ? '/profile' : '/login')}
              style={{
                padding: '8px 18px',
                borderRadius: '100px',
                background: isResortGuest ? 'rgba(44, 74, 34, 0.08)' : 'linear-gradient(135deg, var(--forest-deep), var(--forest))',
                border: isResortGuest ? '1.5px solid var(--forest-deep)' : 'none',
                color: isResortGuest ? 'var(--forest-deep)' : '#FFF',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              {isResortGuest ? (
                <>
                  <User size={14} />
                  <span>{guest?.roomNumber ? `Suite ${guest.roomNumber}` : 'Resident Pass'}</span>
                </>
              ) : (
                <>
                  <Key size={14} color="var(--brass-light)" />
                  <span>Resident Access</span>
                </>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* ── SCROLLABLE CONTAINER ── */}
      <div className="app-scroll" style={{ flex: 1, paddingBottom: '100px' }}>
        <div className="desktop-container">

          {/* ── HERO BANNER ── */}
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ 
              margin: '16px 0 22px',
              borderRadius: '26px',
              background: 'linear-gradient(135deg, #1A2E13 0%, #2C4A22 100%)',
              padding: 'clamp(26px, 5vw, 36px) clamp(18px, 4vw, 30px)',
              color: '#fff',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 16px 40px rgba(26, 46, 19, 0.2)'
            }}
          >
            <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '220px', height: '220px', background: 'var(--brass)', filter: 'blur(90px)', opacity: 0.25 }} />
            
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(212, 175, 55, 0.2)', border: '1px solid rgba(212, 175, 55, 0.35)', borderRadius: '100px', padding: '4px 12px', marginBottom: '12px' }}>
              <Compass size={13} color="var(--brass-light)" />
              <span style={{ fontSize: '10.5px', fontWeight: 800, color: 'var(--brass-light)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
                Signature Shivalaya Experiences
              </span>
            </div>

            <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(26px, 7vw, 36px)', fontWeight: 700, margin: '0 0 10px 0', lineHeight: 1.18, color: '#F3EEDB' }}>
              Curated Mountain Living<br/>At Shivalaya Resorts
            </h1>

            <p style={{ margin: 0, fontSize: 'clamp(13px, 3.8vw, 15px)', color: 'rgba(243,238,219,0.88)', lineHeight: 1.6, maxWidth: '620px' }}>
              From candlelight dining inside our iconic fairy-lit Bird Cage and crackling lawn bonfires to PlayStation 5 gaming battles, starlit lawn camping, and peaceful pine forest nature walks.
            </p>
          </motion.div>

          {/* ── CATEGORY FILTER PILLS ── */}
          <div style={{ marginBottom: '22px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
            <div style={{ display: 'flex', gap: '8px', paddingRight: '12px' }}>
              {categories.map(cat => {
                const isActive = selectedCategory === cat.id
                return (
                  <motion.button
                    key={cat.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategory(cat.id)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '100px',
                      border: isActive ? '1.5px solid var(--forest-deep)' : '1px solid rgba(173, 138, 63, 0.25)',
                      background: isActive ? 'var(--forest-deep)' : '#FFFFFF',
                      color: isActive ? 'var(--parchment)' : 'var(--forest-deep)',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '13px',
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                      boxShadow: isActive ? '0 4px 14px rgba(26, 46, 19, 0.2)' : '0 2px 6px rgba(0,0,0,0.02)',
                      transition: 'all 0.2s ease',
                      flexShrink: 0
                    }}
                  >
                    {cat.label}
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* ── SUCCESS MESSAGE ── */}
          <AnimatePresence mode="wait">
            {successMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ 
                  padding: '14px 18px', 
                  background: '#2ecc71', 
                  color: '#fff', 
                  borderRadius: '16px', 
                  marginBottom: '22px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px', 
                  boxShadow: '0 8px 24px rgba(46,204,113,0.25)' 
                }}
              >
                <CheckCircle2 size={20} />
                <span style={{ fontSize: '13.5px', fontWeight: 600 }}>{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── EXPEDITIONS CARDS GRID ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '22px' }}>
            {combinedExpeditions.map((exp, idx) => {
              const price = exp.price_per_setup || exp.price_per_person
              const priceLabel = exp.pricing_type === 'per_setup' ? 'per setup' : 'per person'
              const isItineraryOpen = expandedItineraryId === exp.id

              return (
                <div key={exp.id} className="card-3d-wrap">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.08 }}
                    className="card-3d-interactive"
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '26px',
                      overflow: 'hidden',
                      boxShadow: '0 16px 40px rgba(26, 46, 19, 0.08)',
                      border: '1.5px solid rgba(173, 138, 63, 0.22)',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    {/* Header Image */}
                    <div style={{ position: 'relative', width: '100%', height: '240px', overflow: 'hidden' }}>
                      <img 
                        src={exp.image_url} 
                        alt={exp.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />

                      {/* Top Badge */}
                      <div 
                        style={{ 
                          position: 'absolute', 
                          top: '16px', 
                          left: '16px', 
                          background: 'rgba(26, 46, 19, 0.88)', 
                          backdropFilter: 'blur(8px)', 
                          padding: '5px 12px', 
                          borderRadius: '100px', 
                          color: 'var(--brass-light)', 
                          fontSize: '11px', 
                          fontWeight: 700, 
                          textTransform: 'uppercase', 
                          letterSpacing: '0.06em' 
                        }}
                      >
                        {exp.badge}
                      </div>

                      {/* Elevation & Difficulty Pills */}
                      <div 
                        style={{ 
                          position: 'absolute', 
                          bottom: '14px', 
                          left: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <div 
                          style={{ 
                            background: 'rgba(0,0,0,0.65)', 
                            backdropFilter: 'blur(8px)', 
                            padding: '4px 10px', 
                            borderRadius: '8px', 
                            color: '#FFF', 
                            fontSize: '11px', 
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Compass size={12} color="var(--brass-light)" />
                          <span>{exp.elevation}</span>
                        </div>

                        <div 
                          style={{ 
                            background: 'rgba(0,0,0,0.65)', 
                            backdropFilter: 'blur(8px)', 
                            padding: '4px 10px', 
                            borderRadius: '8px', 
                            color: '#FFF', 
                            fontSize: '11px', 
                            fontWeight: 600
                          }}
                        >
                          {exp.difficulty} Trail
                        </div>
                      </div>
                    </div>

                    {/* Body */}
                    <div style={{ padding: '26px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.14em', color: 'var(--brass)', textTransform: 'uppercase', marginBottom: '6px' }}>
                        {exp.categoryLabel}
                      </div>

                      <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '22px', fontWeight: 700, color: 'var(--forest-deep)', margin: '0 0 10px', lineHeight: 1.25 }}>
                        {exp.name}
                      </h2>

                      <p style={{ fontSize: '14px', color: 'var(--ink-soft)', lineHeight: 1.6, margin: '0 0 18px' }}>
                        {exp.tagline}
                      </p>

                      {/* Sensory Note Callout */}
                      <div 
                        style={{ 
                          background: 'rgba(245, 238, 220, 0.65)', 
                          borderRadius: '14px', 
                          padding: '12px 16px', 
                          marginBottom: '20px',
                          borderLeft: '3px solid var(--brass)'
                        }}
                      >
                        <div style={{ fontSize: '10.5px', fontWeight: 800, color: 'var(--brass)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px' }}>
                          Sensory Experience
                        </div>
                        <div style={{ fontSize: '12.5px', color: 'var(--forest-deep)', fontStyle: 'italic', lineHeight: 1.5 }}>
                          "{exp.sensoryNote}"
                        </div>
                      </div>

                      {/* Details Bar: Duration & Group */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid rgba(0,0,0,0.06)', borderBottom: '1px solid rgba(0,0,0,0.06)', marginBottom: '18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Clock size={16} color="var(--forest)" />
                          <div>
                            <div style={{ fontSize: '10px', color: 'var(--sage)', textTransform: 'uppercase', fontWeight: 700 }}>Duration</div>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--forest-deep)' }}>{exp.duration}</div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Users size={16} color="var(--forest)" />
                          <div>
                            <div style={{ fontSize: '10px', color: 'var(--sage)', textTransform: 'uppercase', fontWeight: 700 }}>Party Size</div>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--forest-deep)' }}>{exp.groupSize}</div>
                          </div>
                        </div>
                      </div>

                      {/* Itinerary Accordion Button */}
                      <button
                        type="button"
                        onClick={() => toggleItinerary(exp.id)}
                        style={{
                          background: 'none',
                          border: '1px dashed rgba(173, 138, 63, 0.4)',
                          borderRadius: '12px',
                          padding: '10px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          color: 'var(--forest-deep)',
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          marginBottom: '20px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Sparkles size={14} color="var(--brass)" />
                          <span>{isItineraryOpen ? 'Hide Expedition Itinerary' : 'View Full Expedition Itinerary'}</span>
                        </div>
                        {isItineraryOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>

                      {/* Expandable Itinerary Content */}
                      <AnimatePresence>
                        {isItineraryOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{ overflow: 'hidden', marginBottom: '20px' }}
                          >
                            <div style={{ background: '#FAF7F0', borderRadius: '16px', padding: '18px', border: '1px solid rgba(173, 138, 63, 0.2)' }}>
                              <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--brass)', letterSpacing: '0.1em', marginBottom: '12px' }}>
                                Day-by-Day Timeline
                              </div>

                              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative', paddingLeft: '14px', borderLeft: '2px solid rgba(173, 138, 63, 0.3)' }}>
                                {exp.itinerary.map((step, sIdx) => (
                                  <div key={sIdx} style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '-20px', top: '4px', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--brass)' }} />
                                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--sage)' }}>{step.time}</div>
                                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--forest-deep)', marginTop: '2px' }}>{step.title}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--ink-soft)', lineHeight: 1.45, marginTop: '2px' }}>{step.desc}</div>
                                  </div>
                                ))}
                              </div>

                              {/* Inclusions */}
                              <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                                <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--brass)', letterSpacing: '0.1em', marginBottom: '8px' }}>
                                  What Is Included
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                  {exp.inclusions.map((inc, iIdx) => (
                                    <div key={iIdx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--ink-soft)' }}>
                                      <Check size={14} color="#2ecc71" />
                                      <span>{inc}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Pricing & Booking Action */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                        <div>
                          <div style={{ fontSize: '10.5px', color: 'var(--sage)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                            Investment
                          </div>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                            <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--forest-deep)', fontFamily: 'IBM Plex Mono, monospace' }}>
                              ₹{price.toLocaleString('en-IN')}
                            </span>
                            <span style={{ fontSize: '12px', color: 'var(--sage)', fontWeight: 500 }}>
                              / {priceLabel}
                            </span>
                          </div>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            if (!isResortGuest) {
                              navigate('/login', { 
                                state: { 
                                  from: '/experiences', 
                                  message: 'Please sign in with your room or phone number to reserve an expedition.' 
                                } 
                              })
                            } else {
                              // Pass activity payload to BookingModal
                              setSelectedExpForBooking({
                                id: exp.dbActivity?.id || exp.id,
                                name: exp.name,
                                description: exp.tagline,
                                pricing_type: exp.pricing_type,
                                price_per_person: exp.price_per_person,
                                price_per_setup: exp.price_per_setup,
                                price_per_session: exp.price_per_session,
                                duration_minutes: exp.duration_minutes
                              })
                            }
                          }}
                          className="btn-gold-sweep"
                          style={{
                            background: 'linear-gradient(135deg, #1A2E13 0%, #2C4A22 100%)',
                            color: '#FFF',
                            border: '1px solid rgba(173, 138, 63, 0.4)',
                            padding: '12px 24px',
                            borderRadius: '14px',
                            fontSize: '14px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 6px 18px rgba(26, 46, 19, 0.25)'
                          }}
                        >
                          <span>Reserve Expedition</span>
                          <ArrowRight size={15} />
                        </motion.button>
                      </div>

                    </div>
                  </motion.div>
                </div>
              )
            })}
          </div>

        </div>
      </div>

      {/* ── BOOKING MODAL ── */}
      <AnimatePresence>
        {selectedExpForBooking && (
          <BookingModal 
            activity={selectedExpForBooking} 
            onClose={() => setSelectedExpForBooking(null)} 
            onSuccess={handleBookingSuccess} 
          />
        )}
      </AnimatePresence>

    </div>
  )
}
