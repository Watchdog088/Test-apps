// src/components/common/PageErrorBoundary.jsx
// Feature #7: Page-level ErrorBoundary so one broken page doesn't crash the whole app

import React from 'react';

export default class PageErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // Log to Sentry if available
    if (window.__sentryCapture) {
      window.__sentryCapture(error, { extra: errorInfo });
    }
    console.error('[PageErrorBoundary] Page crashed:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        textAlign: 'center',
        background: '#080810',
      }}>
        {/* Error illustration */}
        <div style={{
          width: 96,
          height: 96,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(239,68,68,0.18) 0%, rgba(239,68,68,0.05) 70%)',
          border: '1.5px solid rgba(239,68,68,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 44,
          marginBottom: 20,
        }}>
          😵
        </div>

        <h2 style={{ color: '#f1f5f9', fontWeight: 800, fontSize: 20, margin: '0 0 10px' }}>
          Something went wrong
        </h2>
        <p style={{ color: '#64748b', fontSize: 14, maxWidth: 280, margin: '0 0 28px', lineHeight: 1.6 }}>
          This page ran into an error. Your other pages are unaffected.
        </p>

        {/* Error detail (dev only) */}
        {import.meta.env.DEV && this.state.error && (
          <details style={{ marginBottom: 20, textAlign: 'left', maxWidth: 360, width: '100%' }}>
            <summary style={{ color: '#94a3b8', fontSize: 12, cursor: 'pointer', marginBottom: 8 }}>
              Error details
            </summary>
            <pre style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10,
              padding: '10px 14px',
              fontSize: 11,
              color: '#f87171',
              overflow: 'auto',
              maxHeight: 160,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}>
              {this.state.error.toString()}
              {this.state.errorInfo?.componentStack}
            </pre>
          </details>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={this.handleReset}
            style={{
              padding: '11px 24px',
              borderRadius: 14,
              border: 'none',
              background: 'linear-gradient(135deg,#6366f1,#ec4899)',
              color: 'white',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              minHeight: 44,
            }}
          >
            ↺ Try Again
          </button>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              padding: '11px 24px',
              borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.10)',
              background: 'rgba(255,255,255,0.04)',
              color: '#94a3b8',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              minHeight: 44,
            }}
          >
            🏠 Go Home
          </button>
        </div>
      </div>
    );
  }
}
