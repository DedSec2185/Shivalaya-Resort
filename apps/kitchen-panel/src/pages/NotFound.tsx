import { useNavigate } from 'react-router-dom'
import { ChefHat, ArrowLeft } from 'lucide-react'

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
        background: '#111A12',
        color: '#F3EEDB',
        fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
      }}
    >
      <div 
        style={{
          maxWidth: '440px',
          width: '100%',
          background: '#1A241C',
          borderRadius: '24px',
          border: '1.5px solid rgba(217, 189, 117, 0.3)',
          padding: '40px 28px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <div 
          style={{
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            background: 'rgba(217, 189, 117, 0.15)',
            border: '2px solid #D9BD75',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#D9BD75',
            marginBottom: '16px'
          }}
        >
          <ChefHat size={36} />
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
          Panache Kitchen KDS
        </div>

        <h1 
          style={{
            fontFamily: 'Fraunces, serif',
            fontSize: '26px',
            fontWeight: 700,
            color: '#FFF',
            margin: '0 0 10px'
          }}
        >
          Kitchen View Not Found
        </h1>

        <p 
          style={{
            color: '#A8B8AA',
            fontSize: '14px',
            lineHeight: 1.55,
            margin: '0 0 26px'
          }}
        >
          The requested station screen or order ticket view does not exist. Tap below to return to the active live order queue.
        </p>

        <button
          onClick={() => navigate('/')}
          style={{
            width: '100%',
            minHeight: '52px',
            padding: '14px 24px',
            background: 'linear-gradient(135deg, #D9BD75 0%, #AD8A3F 100%)',
            color: '#132015',
            border: 'none',
            borderRadius: '14px',
            fontWeight: 800,
            fontSize: '15px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 6px 20px rgba(173,138,63,0.35)'
          }}
        >
          <ArrowLeft size={18} />
          <span>Return to Live Orders</span>
        </button>
      </div>
    </div>
  )
}
