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
      background: '#0D1F17',
      color: '#F8FAFC',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ fontSize: '4rem', fontWeight: 800, color: '#AD8A3F', marginBottom: '0.5rem' }}>404</div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem', color: '#E2E8F0' }}>
        Reception Page Not Found
      </h2>
      <p style={{ color: '#94A3B8', fontSize: '0.95rem', maxWidth: '360px', marginBottom: '1.5rem' }}>
        The requested page does not exist on the reception desk portal.
      </p>
      <button
        onClick={() => navigate('/')}
        style={{
          padding: '0.75rem 1.5rem',
          background: '#AD8A3F',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '0.5rem',
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        Back to Reception Desk
      </button>
    </div>
  )
}
