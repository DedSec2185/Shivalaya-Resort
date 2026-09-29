import { Component, type ErrorInfo, type ReactNode } from 'react'
import { ChefHat, RotateCcw } from 'lucide-react'

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
    console.error('Uncaught error in Kitchen Panel:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
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
                width: '68px',
                height: '68px',
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
              <ChefHat size={34} />
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
              Panache Kitchen Station
            </div>

            <h2 
              style={{
                fontFamily: 'Fraunces, serif',
                fontSize: '24px',
                fontWeight: 700,
                color: '#FFF',
                margin: '0 0 10px'
              }}
            >
              Kitchen Display Paused
            </h2>

            <p 
              style={{
                color: '#A8B8AA',
                fontSize: '14px',
                lineHeight: 1.55,
                margin: '0 0 26px'
              }}
            >
              An unexpected runtime interruption occurred. Tap below to reload the line and reconnect to the live order channel.
            </p>

            <button
              onClick={() => window.location.reload()}
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
              <RotateCcw size={18} />
              <span>Reload Kitchen Display</span>
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
