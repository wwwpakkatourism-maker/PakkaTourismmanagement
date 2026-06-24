import React from 'react';

/**
 * ErrorBoundary — Global React error boundary
 * Catches any unhandled JS errors in the React tree and shows a
 * friendly error screen instead of a blank page.
 *
 * Usage in main.jsx:
 *   <ErrorBoundary>
 *     <App />
 *   </ErrorBoundary>
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // Log full error details to console for debugging
    console.error('═══════════════════════════════════════════');
    console.error('🚨 [ErrorBoundary] Uncaught React Error');
    console.error('   Error:    ', error?.message || error);
    console.error('   Component:', errorInfo?.componentStack?.trim()?.split('\n')?.[1]?.trim() || 'unknown');
    console.error('   Stack:\n', error?.stack);
    console.error('═══════════════════════════════════════════');
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/dashboard';
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const isDev = import.meta.env.DEV;
    const msg   = this.state.error?.message || 'An unexpected error occurred';

    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #0A0E1A, #0F172A)',
        fontFamily: 'Inter, system-ui, sans-serif',
        padding: '24px', textAlign: 'center',
      }}>
        <style>{`
          @keyframes shake {
            0%,100%{transform:rotate(0)} 20%{transform:rotate(-5deg)} 40%{transform:rotate(5deg)}
            60%{transform:rotate(-3deg)} 80%{transform:rotate(3deg)}
          }
          @keyframes fadeUp {
            from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none}
          }
        `}</style>

        {/* Icon */}
        <div style={{ fontSize: 64, marginBottom: 16, animation: 'shake 0.6s ease-out' }}>
          ⚠️
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 24, fontWeight: 800, color: '#F1F5F9',
          marginBottom: 8, animation: 'fadeUp 0.5s 0.1s both',
        }}>
          Something went wrong
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: 14, color: 'rgba(148,163,184,0.8)',
          maxWidth: 400, lineHeight: 1.6, marginBottom: 8,
          animation: 'fadeUp 0.5s 0.2s both',
        }}>
          The application crashed unexpectedly. Please refresh the page or return to the dashboard.
        </p>

        {/* Error message */}
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 10, padding: '10px 16px', marginBottom: 24, maxWidth: 440,
          fontSize: 12, color: '#FCA5A5', fontFamily: 'monospace',
          animation: 'fadeUp 0.5s 0.25s both',
        }}>
          {msg}
        </div>

        {/* Dev: show component stack */}
        {isDev && this.state.errorInfo?.componentStack && (
          <details style={{
            maxWidth: 560, marginBottom: 24, textAlign: 'left',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10, padding: '10px 14px', fontSize: 11,
            color: 'rgba(148,163,184,0.7)', fontFamily: 'monospace', whiteSpace: 'pre-wrap',
            animation: 'fadeUp 0.5s 0.3s both',
          }}>
            <summary style={{ cursor: 'pointer', color: '#93C5FD', marginBottom: 6 }}>
              Component Stack (dev only)
            </summary>
            {this.state.errorInfo.componentStack}
          </details>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', animation: 'fadeUp 0.5s 0.35s both' }}>
          <button
            onClick={this.handleReload}
            style={{
              padding: '12px 24px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
              color: '#fff', fontSize: 14, fontWeight: 700,
              boxShadow: '0 4px 16px rgba(37,99,235,0.4)',
              transition: 'all 0.2s',
            }}
          >
            🏠 Go to Dashboard
          </button>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px', borderRadius: 10, cursor: 'pointer',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 600,
              transition: 'all 0.2s',
            }}
          >
            ↻ Reload Page
          </button>
        </div>

        {/* Brand */}
        <div style={{ marginTop: 40, fontSize: 11, color: 'rgba(100,116,139,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Pakka Tourism Enterprise Suite
        </div>
      </div>
    );
  }
}
