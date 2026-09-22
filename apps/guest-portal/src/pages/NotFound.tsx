import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center',
      background: '#0F172A',
      color: '#F8FAFC',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ fontSize: '4rem', fontWeight: 800, color: '#38BDF8', marginBottom: '0.5rem' }}>404</div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem', color: '#F1F5F9' }}>
        Page Not Found
      </h2>
      <p style={{ color: '#94A3B8', fontSize: '0.95rem', maxWidth: '360px', marginBottom: '1.5rem' }}>
        The page or resource you are looking for does not exist or has been moved.
      </p>
      <button
        onClick={() => navigate('/')}
        style={{
          padding: '0.75rem 1.5rem',
          background: '#38BDF8',
          color: '#0F172A',
          border: 'none',
          borderRadius: '0.5rem',
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        Go to Homepage
      </button>
    </div>
  )
}
