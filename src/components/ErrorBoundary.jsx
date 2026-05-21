import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Route failure or client crash captured:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          width: '100vw',
          backgroundColor: '#070712',
          backgroundImage: 'radial-gradient(circle at 50% 50%, #12102e 0%, #070712 100%)',
          color: '#c7d2fe',
          fontFamily: '"Outfit", "Inter", sans-serif',
          flexDirection: 'column',
          gap: '24px',
          textAlign: 'center',
          padding: '20px',
          boxSizing: 'border-box'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '40px',
            borderRadius: '24px',
            maxWidth: '500px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              fontSize: '3rem',
              lineHeight: '1',
              animation: 'bounce 2s infinite'
            }}>⚠️</div>
            <style>{`
              @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
              }
            `}</style>
            <h2 style={{
              margin: '10px 0 0 0',
              fontSize: '1.5rem',
              fontWeight: 600,
              letterSpacing: '1px',
              textShadow: '0 0 10px rgba(244, 63, 94, 0.3)',
              color: '#fda4af'
            }}>
              Something Went Wrong
            </h2>
            <p style={{
              fontSize: '0.95rem',
              opacity: 0.75,
              lineHeight: '1.6',
              margin: '0'
            }}>
              Xenon encountered a connection interruption or client-side runtime failure. This usually occurs when assets fail to load or internet connection drops.
            </p>
            <button
              onClick={this.handleReload}
              style={{
                marginTop: '12px',
                padding: '12px 28px',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#ffffff',
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                letterSpacing: '1px',
                textTransform: 'uppercase'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.4)';
              }}
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
