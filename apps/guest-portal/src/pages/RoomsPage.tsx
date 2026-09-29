import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft, Maximize, Users, Mountain, Phone, MessageSquare 
} from 'lucide-react'
import TiltCard from '../components/TiltCard'

const ROOMS_DATA = [
  {
    id: 'executive',
    category: 'rooms',
    name: 'Executive Mountain View Room',
    badge: 'Popular Choice',
    price: 4500,
    image: '/resort/shivalaya-stone-cottage.jpg',
    objectPosition: '50% 45%',
    tagline: 'Wake up to Himalayan birdsong and sunlit valley vistas.',
    description: 'A thoughtfully appointed mountain sanctuary featuring handcrafted wooden furnishings, an artisan King bed, and an expansive private balcony opening directly to the whispering pine forests of Mehragaon.',
    amenities: ['Artisan King Bed', 'Private Mountain Balcony', 'High-Speed Wi-Fi', 'En-Suite Rain Shower', 'Tea & Coffee Maker', 'Room Service'],
    size: '320 sq ft',
    maxGuests: 2,
    view: 'Panoramic Pine Valley'
  },
  {
    id: 'deluxe',
    category: 'suites',
    name: 'Deluxe Valley Suite',
    badge: 'Signature Suite',
    price: 6500,
    image: '/resort/shivalaya-shiva-mural-villa.jpg',
    objectPosition: '50% 50%',
    tagline: 'Expansive luxury with a private panoramic lounge parlor.',
    description: 'Generously proportioned with a dedicated sitting parlor and floor-to-ceiling French windows. Watch morning mists drift across Bhimtal ridge while relaxing with artisanal Himalayan herbal infusions.',
    amenities: ['King Bed + Sofa Bed', 'Separate Sitting Lounge', 'Valley Sunset View', 'Smart 4K TV', 'Mini Bar & Snacks', 'Plush Bathrobes'],
    size: '480 sq ft',
    maxGuests: 3,
    view: 'Valley & Ridge Vista'
  },
  {
    id: 'honeymoon',
    category: 'suites',
    name: 'Luxury Honeymoon Suite',
    badge: 'Romantic Retreat',
    price: 8500,
    image: '/resort/shivalaya-entrance-gate.jpg',
    objectPosition: '50% 35%',
    tagline: 'An intimate couples escape where luxury meets pristine wilderness.',
    description: 'Crafted for romance with an exclusive private sky deck, luxury Jacuzzi bath, arrival champagne ritual, and private candlelit dinner service under the celestial Uttarakhand canopy.',
    amenities: ['Romantic Jacuzzi Tub', 'Private Sky Deck', 'Arrival Champagne', 'Candlelit Dining Setup', 'Breakfast in Bed', 'Dedicated Butler'],
    size: '560 sq ft',
    maxGuests: 2,
    view: 'Private Himalayan Peak'
  },
  {
    id: 'villa',
    category: 'villas',
    name: 'Deodar Heritage Family Villa',
    badge: 'Family & Groups',
    price: 11500,
    image: '/resort/shivalaya-luxury-villa-terrace.jpg',
    objectPosition: '50% 40%',
    tagline: 'Sprawling private mountain villa with campfire lawn hearth.',
    description: 'The pinnacle of resort living. A multi-room standalone mountain villa with handcrafted Deodar cedar ceilings, private manicured lawn, evening campfire hearth, and panoramic 360-degree Kumaon vistas.',
    amenities: ['2 Master Bedrooms', 'Private Lawn & Campfire', 'Full Living & Dining Area', 'Fireplace Hearth', 'Dedicated Chef Service', 'Up to 5 Guests'],
    size: '780 sq ft',
    maxGuests: 5,
    view: '360° Mountain & Forest'
  }
]

export default function RoomsPage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<'all' | 'rooms' | 'suites' | 'villas'>('all')

  const filteredRooms = filter === 'all' 
    ? ROOMS_DATA 
    : ROOMS_DATA.filter(r => r.category === filter)

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="app-root" style={{ background: '#F5EEDC', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* ── TOP NAVIGATION ── */}
      <nav 
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(245, 238, 220, 0.96)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(173, 138, 63, 0.25)',
          padding: '12px 0'
        }}
      >
        <div className="desktop-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              className="icon-btn"
              aria-label="Back"
              onClick={handleBack}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(44, 74, 34, 0.08)',
                border: '1px solid rgba(44, 74, 34, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--forest-deep)'
              }}
            >
              <ChevronLeft size={20} />
            </button>

            <div 
              onClick={() => navigate('/')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            >
              <img 
                src="https://shivalayaresort.com/wp-content/uploads/2024/11/Shivalaya-Resort-Logo-t.png" 
                alt="Shivalaya Logo" 
                style={{ width: '36px', height: '36px', objectFit: 'contain' }} 
              />
              <div>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: '18px', fontWeight: 700, color: 'var(--forest-deep)', lineHeight: 1.1 }}>
                  SHIVALAYA
                </div>
                <div style={{ fontSize: '9px', letterSpacing: '0.18em', color: 'var(--brass)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Sanctuary Suites
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="desktop-nav-links" style={{ display: 'flex', alignItems: 'center', gap: '26px' }}>
            <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', fontSize: '14.5px', fontWeight: 500, color: 'var(--sage)', cursor: 'pointer' }}>Home</button>
            <button onClick={() => navigate('/menu')} style={{ background: 'none', border: 'none', fontSize: '14.5px', fontWeight: 500, color: 'var(--sage)', cursor: 'pointer' }}>Panache Menu</button>
            <button onClick={() => navigate('/experiences')} style={{ background: 'none', border: 'none', fontSize: '14.5px', fontWeight: 500, color: 'var(--sage)', cursor: 'pointer' }}>Experiences</button>
            <button onClick={() => navigate('/rooms')} style={{ background: 'none', border: 'none', fontSize: '14.5px', fontWeight: 700, color: 'var(--forest-deep)', cursor: 'pointer', borderBottom: '2px solid var(--brass)', paddingBottom: '2px' }}>Sanctuary Rooms</button>
            <button onClick={() => navigate('/orders')} style={{ background: 'none', border: 'none', fontSize: '14.5px', fontWeight: 500, color: 'var(--sage)', cursor: 'pointer' }}>My Orders</button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <a 
              href="tel:+917668009400"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '100px',
                background: 'rgba(44,74,34,0.08)',
                color: 'var(--forest-deep)',
                fontSize: '12.5px',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              <Phone size={13} />
              <span className="hide-on-compact">+91 7668-009-400</span>
            </a>
          </div>

        </div>
      </nav>

      {/* ── HERO BANNER ── */}
      <header style={{ padding: '24px 0 16px' }}>
        <div className="desktop-container">
          <div 
            style={{
              position: 'relative',
              borderRadius: '24px',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #132511 0%, #1A3B1E 60%, #2A5A30 100%)',
              color: '#FFF',
              padding: 'clamp(28px, 6vw, 48px) clamp(20px, 5vw, 36px)',
              boxShadow: '0 20px 50px rgba(26, 46, 19, 0.15)',
              border: '1px solid rgba(197, 155, 39, 0.3)'
            }}
          >
            <div 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(197, 155, 39, 0.2)',
                border: '1px solid var(--brass)',
                borderRadius: '100px',
                padding: '4px 12px',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--brass-light)',
                marginBottom: '14px'
              }}
            >
              <Mountain size={13} />
              <span>28 Sanctuary Suites · Alt. 1,450m</span>
            </div>

            <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(28px, 6vw, 42px)', fontWeight: 700, lineHeight: 1.2, margin: '0 0 12px' }}>
              Your Mountain Sanctuary
            </h1>
            <p style={{ color: '#D3E0D5', fontSize: 'clamp(14px, 3.5vw, 16px)', maxWidth: '680px', lineHeight: 1.6, margin: '0 0 20px' }}>
              Where silence is your morning companion and the majestic Trishul peak rises on the horizon. Each room is custom designed with natural cedar wood, panoramic balconies, and five-star hospitality.
            </p>

            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
              {[
                { id: 'all', label: 'All Sanctuaries' },
                { id: 'rooms', label: 'Executive Rooms' },
                { id: 'suites', label: 'Valley & Honeymoon Suites' },
                { id: 'villas', label: 'Heritage Villas' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as any)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '100px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: filter === tab.id ? '1px solid var(--brass-light)' : '1px solid rgba(255,255,255,0.2)',
                    background: filter === tab.id ? 'var(--brass)' : 'rgba(255,255,255,0.08)',
                    color: filter === tab.id ? '#1A2E13' : '#FFF'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ── ROOMS CATALOG GRID ── */}
      <main style={{ flex: 1, padding: '24px 0 60px' }}>
        <div className="desktop-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '26px' }}>
            <AnimatePresence mode="popLayout">
              {filteredRooms.map((room, idx) => (
                <TiltCard key={room.id} maxTilt={4}>
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.35, delay: idx * 0.06 }}
                    data-cursor-text="SANCTUARY"
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '24px',
                      overflow: 'hidden',
                      border: '1.5px solid rgba(173, 138, 63, 0.22)',
                      boxShadow: '0 12px 36px rgba(26, 46, 19, 0.08)',
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%'
                    }}
                  >
                  {/* Photo with Badge */}
                  <div style={{ position: 'relative', width: '100%', height: '230px', overflow: 'hidden' }}>
                    <img 
                      src={room.image} 
                      alt={room.name} 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover', 
                        objectPosition: (room as any).objectPosition || '50% 50%',
                        transition: 'transform 0.5s ease' 
                      }} 
                    />
                    <div 
                      style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        background: 'rgba(26, 46, 19, 0.9)',
                        backdropFilter: 'blur(8px)',
                        padding: '4px 10px',
                        borderRadius: '100px',
                        color: 'var(--brass-light)',
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em'
                      }}
                    >
                      {room.badge}
                    </div>

                    <div 
                      style={{
                        position: 'absolute',
                        bottom: '10px',
                        right: '10px',
                        background: 'rgba(0,0,0,0.65)',
                        backdropFilter: 'blur(6px)',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        color: '#FFF',
                        fontSize: '11px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Mountain size={12} color="var(--brass-light)" />
                      <span>{room.view}</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: '22px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '20px', fontWeight: 700, color: 'var(--forest-deep)', margin: 0, lineHeight: 1.25 }}>
                            {room.name}
                          </h3>
                          <div style={{ fontSize: '13px', color: 'var(--brass-dark)', fontStyle: 'italic', marginTop: '3px' }}>
                            {room.tagline}
                          </div>
                        </div>
                      </div>

                      <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', lineHeight: 1.55, margin: '12px 0 16px' }}>
                        {room.description}
                      </p>

                      {/* Specs */}
                      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', padding: '10px 14px', background: 'rgba(44, 74, 34, 0.05)', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: 'var(--forest-deep)', fontWeight: 600 }}>
                          <Maximize size={15} color="var(--brass)" />
                          <span>{room.size}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: 'var(--forest-deep)', fontWeight: 600 }}>
                          <Users size={15} color="var(--brass)" />
                          <span>Up to {room.maxGuests} Guests</span>
                        </div>
                      </div>

                      {/* Amenities Pills */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                        {room.amenities.map(item => (
                          <span 
                            key={item}
                            style={{
                              fontSize: '11.5px',
                              padding: '3px 9px',
                              borderRadius: '6px',
                              background: '#FAF7EE',
                              border: '1px solid rgba(173,138,63,0.25)',
                              color: 'var(--forest-deep)'
                            }}
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Pricing & WhatsApp Reservation CTA */}
                    <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                      <div>
                        <div style={{ fontSize: '10px', color: 'var(--sage)', textTransform: 'uppercase', fontWeight: 700 }}>
                          Starting From
                        </div>
                        <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '20px', fontWeight: 700, color: 'var(--forest-deep)' }}>
                          ₹{room.price.toLocaleString('en-IN')}
                          <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--sage)' }}> / night</span>
                        </div>
                      </div>

                      <a
                        href={`https://api.whatsapp.com/send?phone=917838223010&text=Hello%20Shivalaya%20Resorts,%20I%20would%20like%20to%20reserve%20the%20${encodeURIComponent(room.name)}%20(₹${room.price}/night).`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          background: 'linear-gradient(135deg, #1A3B1E 0%, #2A5A30 100%)',
                          color: '#FFF',
                          padding: '11px 18px',
                          borderRadius: '12px',
                          textDecoration: 'none',
                          fontSize: '13px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 4px 14px rgba(26, 46, 19, 0.25)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <MessageSquare size={14} color="var(--brass-light)" />
                        <span>Reserve</span>
                      </a>
                    </div>
                  </div>
                </motion.div>
              </TiltCard>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* ── FOOTER CONCIERGE CALLOUT ── */}
      <footer style={{ background: '#132511', color: '#FFF', padding: '48px 24px', borderTop: '2px solid var(--brass)' }}>
        <div className="desktop-container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '26px', color: '#F3EEDB', margin: '0 0 10px' }}>
            Plan Your Mountain Escape
          </h2>
          <p style={{ color: '#A8B8AA', fontSize: '14.5px', maxWidth: '580px', margin: '0 auto 24px' }}>
            Direct reservations enjoy complimentary arrival high tea, campfire access, and priority Panache restaurant seating.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <a 
              href="https://api.whatsapp.com/send?phone=917838223010&text=Hello%20Shivalaya%20Resorts,%20I%20would%20like%20to%20inquire%20about%20room%20availability."
              target="_blank" 
              rel="noopener noreferrer" 
              style={{
                background: 'var(--brass)',
                color: '#132511',
                padding: '12px 24px',
                borderRadius: '100px',
                fontWeight: 700,
                fontSize: '14px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <MessageSquare size={16} />
              <span>WhatsApp Reservation Desk</span>
            </a>

            <a 
              href="tel:+917668009400"
              style={{
                background: 'transparent',
                color: '#FFF',
                border: '1.5px solid rgba(255,255,255,0.3)',
                padding: '12px 24px',
                borderRadius: '100px',
                fontWeight: 600,
                fontSize: '14px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Phone size={15} />
              <span>Call +91 7668-009-400</span>
            </a>
          </div>

          <div style={{ marginTop: '28px', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
            Shivalaya Resorts · Village Gethia, Near Bhimtal, Nainital, Uttarakhand 263136
          </div>
        </div>
      </footer>

    </div>
  )
}
