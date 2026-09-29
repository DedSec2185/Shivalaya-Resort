import { Component, ErrorInfo, ReactNode } from 'react'
import { Mountain, RotateCcw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Guest Portal:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
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
            color: '#1E2721',
            fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
          }}
        >
          <div 
            style={{
              maxWidth: '460px',
              width: '100%',
              background: 'rgba(255, 252, 244, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1.5px solid rgba(173, 138, 63, 0.3)',
              borderRadius: '28px',
              padding: '40px 28px',
              boxShadow: '0 20px 50px rgba(26, 46, 19, 0.1)'
            }}
          >
            {/* Mountain Crest Icon */}
            <div 
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: 'rgba(44, 74, 34, 0.1)',
                border: '1.5px solid #AD8A3F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: '#1A3B1E'
              }}
            >
              <Mountain size={32} />
            </div>

            <div 
              style={{
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: '#AD8A3F',
                marginBottom: '6px'
              }}
            >
              Shivalaya Sanctuary
            </div>

            <h2 
              style={{
                fontFamily: 'Fraunces, serif',
                fontSize: '24px',
                fontWeight: 700,
                color: '#1A3B1E',
                margin: '0 0 10px',
                lineHeight: 1.25
              }}
            >
              A Gentle Pause in the Hills
            </h2>

            <p 
              style={{
                color: '#6B7C5E',
                fontSize: '14px',
                lineHeight: 1.6,
                margin: '0 0 26px'
              }}
            >
              We encountered an unexpected breeze while loading this sanctuary page. Refreshing will clear the mist and restore your view.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => window.location.reload()}
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
                <RotateCcw size={16} color="#D9BD75" />
                <span>Reload Page</span>
              </button>

              <button
                onClick={() => window.location.href = '/'}
                style={{
                  padding: '12px 20px',
                  background: 'rgba(44, 74, 34, 0.08)',
                  color: '#1A3B1E',
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
                <span>Return to Homepage</span>
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
