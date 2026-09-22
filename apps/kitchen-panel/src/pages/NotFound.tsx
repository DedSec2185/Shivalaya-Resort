import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center',
      background: '#12161A',
      color: '#F8FAFC',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ fontSize: '4rem', fontWeight: 800, color: '#E2A03F', marginBottom: '0.5rem' }}>404</div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem', color: '#E2E8F0' }}>
        Kitchen View Not Found
      </h2>
      <p style={{ color: '#94A3B8', fontSize: '0.95rem', maxWidth: '360px', marginBottom: '1.5rem' }}>
        The requested screen does not exist.
      </p>
      <button
        onClick={() => navigate('/')}
        style={{
          padding: '0.75rem 1.5rem',
          background: '#E2A03F',
          color: '#12161A',
          border: 'none',
          borderRadius: '0.5rem',
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        Go to Main Dashboard
      </button>
    </div>
  )
}
