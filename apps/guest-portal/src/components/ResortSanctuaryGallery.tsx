import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft, ChevronRight, Maximize2, X, 
  Sparkles, Mountain, Flame, UtensilsCrossed, BedDouble, Compass
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export interface SanctuaryPhoto {
  id: string
  title: string
  subtitle: string
  badge: string
  tag: string
  image: string
  objectPosition: string
  description: string
  actionLabel?: string
  actionRoute?: string
  actionIcon?: 'dining' | 'bonfire' | 'suites' | 'experiences'
}

export const RESORT_PHOTOS: SanctuaryPhoto[] = [
  {
    id: 'archway-gate',
    title: 'The Himalayan Welcome Arch',
    subtitle: 'Gateway to peace & tranquility',
    badge: 'Main Entrance',
    tag: 'Alt. 1,450m',
    image: '/resort/shivalaya-entrance-gate.jpg',
    objectPosition: '50% 32%',
    description: 'Our iconic wrought-iron archway welcoming you into the secluded deodar pine sanctuary of Shivalaya Resorts.',
    actionLabel: 'Explore Experiences',
    actionRoute: '/experiences',
    actionIcon: 'experiences'
  },
  {
    id: 'shiva-mural-villa',
    title: 'The Sacred Shiva Courtyard',
    subtitle: 'Handcrafted spiritual stone mural',
    badge: 'Art & Heritage',
    tag: 'Courtyard Sanctuary',
    image: '/resort/shivalaya-shiva-mural-villa.jpg',
    objectPosition: '50% 48%',
    description: 'A meditative monumental stone mural of Lord Shiva adorning the villa courtyard beneath glass-railed mountain balconies.',
    actionLabel: 'Sanctuary Suites',
    actionRoute: '/rooms',
    actionIcon: 'suites'
  },
  {
    id: 'luxury-villa-terrace',
    title: 'Panoramic Terrace Villa',
    subtitle: 'Curved sky deck & stone pillars',
    badge: 'Signature Living',
    tag: 'Ridge Panorama',
    image: '/resort/shivalaya-luxury-villa-terrace.jpg',
    objectPosition: '50% 40%',
    description: 'Contemporary mountain architecture with an expansive cantilevered observation deck framing rolling Kumaon mists.',
    actionLabel: 'View Villa Details',
    actionRoute: '/rooms',
    actionIcon: 'suites'
  },
  {
    id: 'panache-stone-cottage',
    title: 'Panache Dining Stone Cottage',
    subtitle: 'Woodfire cooking & alpine warmth',
    badge: 'Gastronomy',
    tag: 'Clay Sigri & Tandoor',
    image: '/resort/shivalaya-stone-cottage.jpg',
    objectPosition: '50% 45%',
    description: 'Two-story slate-stone cottage with red carved eaves and flower-lined stone steps housing our artisanal Panache Restaurant.',
    actionLabel: 'Order Panache Dining',
    actionRoute: '/menu',
    actionIcon: 'dining'
  },
  {
    id: 'starlight-bonfire',
    title: 'Starlight Pine Bonfire Ritual',
    subtitle: 'Evening warmth under starry skies',
    badge: 'Night Ritual',
    tag: 'Guest Favorite',
    image: '/resort/shivalaya-starlight-bonfire.jpg',
    objectPosition: '50% 55%',
    description: 'Gather around crackling pine logs on our open lawns with warm throws, grilled sigri appetizers, and cold mountain air.',
    actionLabel: 'Reserve Bonfire',
    actionRoute: '/experiences',
    actionIcon: 'bonfire'
  }
]

export default function ResortSanctuaryGallery() {
  const navigate = useNavigate()
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxPhoto, setLightboxPhoto] = useState<SanctuaryPhoto | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const activePhoto = RESORT_PHOTOS[activeIndex]

  // Auto-scroll the pill selector into view smoothly
  useEffect(() => {
    if (scrollRef.current) {
      const activeEl = scrollRef.current.children[activeIndex] as HTMLElement
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
      }
    }
  }, [activeIndex])

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % RESORT_PHOTOS.length)
  }

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + RESORT_PHOTOS.length) % RESORT_PHOTOS.length)
  }

  const renderActionIcon = (type?: string) => {
    switch (type) {
      case 'dining':
        return <UtensilsCrossed size={14} />
      case 'bonfire':
        return <Flame size={14} color="var(--brass-light)" />
      case 'suites':
        return <BedDouble size={14} />
      default:
        return <Compass size={14} />
    }
  }

  return (
    <section 
      style={{ 
        width: '100%', 
        maxWidth: '100%', 
        overflow: 'hidden', 
        paddingTop: 'clamp(28px, 5vw, 44px)',
        boxSizing: 'border-box' 
      }}
    >
      <div className="desktop-container" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
        
        {/* Header Header & Badges */}
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'flex-end', 
            justifyContent: 'space-between', 
            marginBottom: '16px', 
            flexWrap: 'wrap', 
            gap: '12px' 
          }}
        >
          <div>
            <div 
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '6px', 
                fontSize: '11px', 
                fontWeight: 800, 
                letterSpacing: '0.18em', 
                textTransform: 'uppercase', 
                color: 'var(--brass)' 
              }}
            >
              <Sparkles size={13} color="var(--brass)" />
              <span>Real Resort Moments</span>
            </div>
            <h2 
              style={{ 
                fontFamily: 'Fraunces, serif', 
                fontSize: 'clamp(22px, 5.5vw, 32px)', 
                fontWeight: 700, 
                color: 'var(--forest-deep)', 
                margin: '4px 0 0',
                lineHeight: 1.2
              }}
            >
              Glimpses of Shivalaya Sanctuary
            </h2>
            <p 
              style={{ 
                fontSize: 'clamp(12.5px, 3.5vw, 14px)', 
                color: 'var(--sage)', 
                margin: '4px 0 0', 
                maxWidth: '560px',
                lineHeight: 1.5 
              }}
            >
              Authentic architecture, spiritual courtyards, and starlit lawn fires nestled high at 1,450m elevation.
            </p>
          </div>

          {/* Quick Counter & Nav Buttons (Desktop / Tablet) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span 
              style={{ 
                fontFamily: 'IBM Plex Mono, monospace', 
                fontSize: '13px', 
                fontWeight: 700, 
                color: 'var(--forest)',
                background: 'rgba(44, 74, 34, 0.08)',
                padding: '4px 10px',
                borderRadius: '100px'
              }}
            >
              {activeIndex + 1} / {RESORT_PHOTOS.length}
            </span>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous photo"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#FFFFFF',
                border: '1px solid rgba(173, 138, 63, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--forest-deep)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next photo"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#FFFFFF',
                border: '1px solid rgba(173, 138, 63, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--forest-deep)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* ── MOBILE-FIRST FEATURED HERO CARD ── */}
        <div 
          style={{ 
            position: 'relative', 
            width: '100%', 
            borderRadius: '24px', 
            overflow: 'hidden', 
            background: '#1A2E13',
            boxShadow: '0 16px 40px rgba(26, 46, 19, 0.14)',
            border: '1.5px solid rgba(173, 138, 63, 0.28)'
          }}
        >
          {/* Main Photo Container with Responsive Aspect Ratio */}
          <div 
            style={{ 
              position: 'relative', 
              width: '100%', 
              height: 'clamp(260px, 46vh, 440px)',
              overflow: 'hidden'
            }}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={activePhoto.id}
                src={activePhoto.image}
                alt={activePhoto.title}
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: activePhoto.objectPosition,
                  display: 'block'
                }}
              />
            </AnimatePresence>

            {/* Gradient Mask for Perfect Mobile Text Readability */}
            <div 
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(26, 46, 19, 0.25) 0%, rgba(26, 46, 19, 0.1) 40%, rgba(18, 32, 14, 0.94) 100%)',
                pointerEvents: 'none'
              }}
            />

            {/* Top Badges & Lightbox Button */}
            <div 
              style={{ 
                position: 'absolute', 
                top: '14px', 
                left: '14px', 
                right: '14px',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                zIndex: 5
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span 
                  style={{
                    background: 'rgba(26, 46, 19, 0.85)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(217, 189, 117, 0.5)',
                    color: 'var(--brass-light)',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    padding: '4px 10px',
                    borderRadius: '100px'
                  }}
                >
                  {activePhoto.badge}
                </span>

                <span 
                  style={{
                    background: 'rgba(0, 0, 0, 0.65)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#FFF',
                    fontSize: '10.5px',
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: '100px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Mountain size={11} color="var(--brass-light)" />
                  <span>{activePhoto.tag}</span>
                </span>
              </div>

              {/* Fullscreen Zoom Lightbox Button */}
              <button
                type="button"
                onClick={() => setLightboxPhoto(activePhoto)}
                aria-label="View full resolution"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(26, 46, 19, 0.8)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#FFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}
              >
                <Maximize2 size={16} />
              </button>
            </div>

            {/* Bottom Content Overlay - Never clips or overlaps */}
            <div 
              style={{ 
                position: 'absolute', 
                bottom: 0, 
                left: 0, 
                right: 0, 
                padding: 'clamp(14px, 3.5vw, 24px)',
                color: '#FFF',
                zIndex: 5
              }}
            >
              <div style={{ maxWidth: '640px' }}>
                <h3 
                  style={{ 
                    fontFamily: 'Fraunces, serif', 
                    fontSize: 'clamp(18px, 4.5vw, 24px)', 
                    fontWeight: 700, 
                    margin: '0 0 4px',
                    lineHeight: 1.25,
                    color: '#FFF'
                  }}
                >
                  {activePhoto.title}
                </h3>
                <p 
                  style={{ 
                    fontSize: 'clamp(12px, 3.2vw, 13.5px)', 
                    color: 'rgba(243, 238, 219, 0.92)', 
                    margin: '0 0 14px',
                    lineHeight: 1.55,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {activePhoto.description}
                </p>

                {/* Direct Action Links on Mobile */}
                {activePhoto.actionRoute && activePhoto.actionLabel && (
                  <button
                    type="button"
                    onClick={() => navigate(activePhoto.actionRoute!)}
                    style={{
                      background: 'linear-gradient(135deg, #D9BD75 0%, #AD8A3F 100%)',
                      color: '#1A2E13',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '8px 16px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 14px rgba(173, 138, 63, 0.4)',
                      minHeight: '38px'
                    }}
                  >
                    {renderActionIcon(activePhoto.actionIcon)}
                    <span>{activePhoto.actionLabel}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── THUMBNAIL SELECTOR STRIP (Mobile Scrollable) ── */}
          <div 
            ref={scrollRef}
            style={{ 
              display: 'flex', 
              gap: '8px', 
              padding: '10px 12px', 
              background: 'rgba(18, 32, 14, 0.98)',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              WebkitOverflowScrolling: 'touch',
              borderTop: '1px solid rgba(173, 138, 63, 0.2)'
            }}
          >
            {RESORT_PHOTOS.map((photo, index) => {
              const isSelected = index === activeIndex
              return (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  style={{
                    position: 'relative',
                    flex: '0 0 auto',
                    width: 'clamp(64px, 18vw, 86px)',
                    height: 'clamp(44px, 12vw, 56px)',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    border: isSelected ? '2px solid var(--brass-light)' : '1px solid rgba(255,255,255,0.15)',
                    opacity: isSelected ? 1 : 0.65,
                    cursor: 'pointer',
                    padding: 0,
                    background: '#000',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? '0 0 10px rgba(217, 189, 117, 0.4)' : 'none'
                  }}
                >
                  <img
                    src={photo.image}
                    alt={photo.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: photo.objectPosition,
                      display: 'block'
                    }}
                  />
                  {isSelected && (
                    <div 
                      style={{
                        position: 'absolute',
                        inset: 0,
                        border: '2px solid #D9BD75',
                        borderRadius: '8px',
                        pointerEvents: 'none'
                      }}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>

      </div>

      {/* ── HIGH DEFINITION LIGHTBOX MODAL ── */}
      <AnimatePresence>
        {lightboxPhoto && (
          <div 
            style={{ 
              position: 'fixed', 
              inset: 0, 
              zIndex: 300, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '16px' 
            }}
          >
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setLightboxPhoto(null)}
              style={{ 
                position: 'absolute', 
                inset: 0, 
                background: 'rgba(0, 0, 0, 0.88)', 
                backdropFilter: 'blur(10px)' 
              }}
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{
                position: 'relative',
                zIndex: 10,
                width: '100%',
                maxWidth: '680px',
                maxHeight: '90vh',
                background: '#1A2E13',
                borderRadius: '24px',
                overflow: 'hidden',
                border: '1.5px solid rgba(173, 138, 63, 0.4)',
                boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setLightboxPhoto(null)}
                aria-label="Close modal"
                style={{
                  position: 'absolute',
                  top: '14px',
                  right: '14px',
                  zIndex: 20,
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'rgba(0, 0, 0, 0.65)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#FFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>

              {/* Full Image Container */}
              <div 
                style={{ 
                  width: '100%', 
                  maxHeight: '60vh', 
                  overflow: 'hidden', 
                  background: '#0D1709',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <img
                  src={lightboxPhoto.image}
                  alt={lightboxPhoto.title}
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: '60vh',
                    objectFit: 'contain',
                    display: 'block'
                  }}
                />
              </div>

              {/* Lightbox Details */}
              <div style={{ padding: 'clamp(16px, 4vw, 24px)', color: '#FFF' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span 
                    style={{ 
                      fontSize: '11px', 
                      color: 'var(--brass-light)', 
                      fontWeight: 800, 
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase'
                    }}
                  >
                    {lightboxPhoto.badge}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>·</span>
                  <span style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.7)' }}>{lightboxPhoto.tag}</span>
                </div>

                <h3 
                  style={{ 
                    fontFamily: 'Fraunces, serif', 
                    fontSize: 'clamp(19px, 4.5vw, 22px)', 
                    fontWeight: 700, 
                    margin: '0 0 6px',
                    color: '#FFF'
                  }}
                >
                  {lightboxPhoto.title}
                </h3>
                <p 
                  style={{ 
                    fontSize: '13.5px', 
                    color: 'rgba(243, 238, 219, 0.88)', 
                    lineHeight: 1.55, 
                    margin: '0 0 16px' 
                  }}
                >
                  {lightboxPhoto.description}
                </p>

                {lightboxPhoto.actionRoute && lightboxPhoto.actionLabel && (
                  <button
                    type="button"
                    onClick={() => {
                      setLightboxPhoto(null)
                      navigate(lightboxPhoto.actionRoute!)
                    }}
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #D9BD75 0%, #AD8A3F 100%)',
                      color: '#1A2E13',
                      border: 'none',
                      borderRadius: '14px',
                      padding: '12px',
                      fontSize: '13.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      minHeight: '44px'
                    }}
                  >
                    {renderActionIcon(lightboxPhoto.actionIcon)}
                    <span>{lightboxPhoto.actionLabel}</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  )
}
