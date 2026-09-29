import { useNavigate } from 'react-router-dom'
import { ConciergeBell, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div 
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        textAlign: 'center',
        background: '#0D1F17',
        color: '#F8FAFC',
        fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
      }}
    >
      <div 
        style={{
          maxWidth: '460px',
          width: '100%',
          background: '#14291F',
          borderRadius: '24px',
          border: '1.5px solid rgba(173, 138, 63, 0.35)',
          padding: '44px 32px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <div 
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'rgba(173, 138, 63, 0.15)',
            border: '2px solid #AD8A3F',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#D9BD75',
            marginBottom: '18px'
          }}
        >
          <ConciergeBell size={36} />
        </div>

        <div 
          style={{
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#D9BD75',
            marginBottom: '6px'
          }}
        >
          Shivalaya Front Desk Ledger
        </div>

        <h1 
          style={{
            fontFamily: 'Fraunces, serif',
            fontSize: '26px',
            fontWeight: 700,
            color: '#FFFFFF',
            margin: '0 0 12px'
          }}
        >
          Reception Page Not Found
        </h1>

        <p 
          style={{
            color: '#94A3B8',
            fontSize: '14px',
            lineHeight: 1.6,
            margin: '0 0 28px'
          }}
        >
          The requested ledger tab or management view does not exist. Click below to return to the active front desk console.
        </p>

        <button
          onClick={() => navigate('/')}
          style={{
            width: '100%',
            minHeight: '48px',
            padding: '13px 24px',
            background: 'linear-gradient(135deg, #D9BD75 0%, #AD8A3F 100%)',
            color: '#0D1F17',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '14.5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 6px 20px rgba(173,138,63,0.3)'
          }}
        >
          <ArrowLeft size={17} />
          <span>Return to Front Desk</span>
        </button>
      </div>
    </div>
  )
}
