import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mountain, UtensilsCrossed, Home, MessageSquare } from 'lucide-react'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div 
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        textAlign: 'center',
        background: '#F5EEDC',
        color: 'var(--ink, #1E2721)',
        fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative ambient mist circle */}
      <div 
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(173,138,63,0.12) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          maxWidth: '460px',
          width: '100%',
          background: 'rgba(255, 252, 244, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1.5px solid rgba(173, 138, 63, 0.3)',
          borderRadius: '28px',
          padding: '40px 28px',
          boxShadow: '0 20px 50px rgba(26, 46, 19, 0.1)',
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* Mountain Emblem */}
        <div 
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(44,74,34,0.12), rgba(173,138,63,0.18))',
            border: '1.5px solid var(--brass, #AD8A3F)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 18px',
            color: 'var(--forest-deep, #1A3B1E)'
          }}
        >
          <Mountain size={36} />
        </div>

        {/* 404 Badge */}
        <div 
          style={{
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--brass, #AD8A3F)',
            marginBottom: '6px'
          }}
        >
          Mountain Trail 404
        </div>

        <h1 
          style={{
            fontFamily: 'Fraunces, serif',
            fontSize: '28px',
            fontWeight: 700,
            color: 'var(--forest-deep, #1A3B1E)',
            lineHeight: 1.2,
            margin: '0 0 10px'
          }}
        >
          Lost in the Mist
        </h1>

        <p 
          style={{
            color: 'var(--sage, #6B7C5E)',
            fontSize: '14px',
            lineHeight: 1.6,
            margin: '0 0 28px'
          }}
        >
          The page or mountain trail you are seeking has vanished into the morning clouds of Gethia. Allow us to guide you back to warmth and comfort.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={() => navigate('/menu')}
            style={{
              padding: '13px 20px',
              background: 'linear-gradient(135deg, #1A3B1E 0%, #2C4A22 100%)',
              color: '#FFF',
              border: 'none',
              borderRadius: '14px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 6px 18px rgba(26,46,19,0.2)'
            }}
          >
            <UtensilsCrossed size={16} color="var(--brass-light, #D9BD75)" />
            <span>Explore Panache Menu</span>
          </button>

          <button
            onClick={() => navigate('/')}
            style={{
              padding: '12px 20px',
              background: 'rgba(44, 74, 34, 0.08)',
              color: 'var(--forest-deep, #1A3B1E)',
              border: '1px solid rgba(44, 74, 34, 0.2)',
              borderRadius: '14px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Home size={16} />
            <span>Return to Sanctuary Home</span>
          </button>
        </div>

        {/* WhatsApp Help */}
        <div style={{ marginTop: '22px', paddingTop: '18px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <a
            href="https://api.whatsapp.com/send?phone=917838223010&text=Hello%20Shivalaya%20Resorts,%20I%20need%20assistance%20on%20the%20guest%20portal."
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '12.5px',
              color: 'var(--brass, #AD8A3F)',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <MessageSquare size={13} />
            <span>Need Help? WhatsApp Front Desk</span>
          </a>
        </div>
      </motion.div>
    </div>
  )
}
