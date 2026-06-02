// src/main.jsx — App entry point with Sentry error tracking
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import App from './App';
import './styles/global.css';

// ─── Sentry Error Tracking ────────────────────────────────────────────────────
// Project: lynkapp-frontend
// Dashboard: https://sentry.io/organizations/lynkapp/projects/lynkapp-frontend/
// DSN is stored in .env as VITE_SENTRY_DSN — never hardcode it here
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  sendDefaultPii: true,
  integrations: [
    Sentry.browserTracingIntegration(),
  ],
  // Capture 100% of transactions in development; lower to 0.1 in production
  tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
  // Only enable distributed tracing for your own domains
  tracePropagationTargets: [
    'localhost',
    '127.0.0.1',
    /^https:\/\/lynkapp\.com/,
    /^https:\/\/api\.lynkapp\.com/,
  ],
  environment: import.meta.env.MODE, // 'development' or 'production'
  // Release version — helps correlate errors with deployments
  release: 'lynkapp@1.0.0',
});

// ─── Native JS error fallback (belt-and-suspenders) ──────────────────────────
window.addEventListener('error', (e) => {
  console.error('[GlobalError]', e.message, 'at', e.filename, ':', e.lineno);
  Sentry.captureException(e.error || new Error(e.message));
});
window.addEventListener('unhandledrejection', (e) => {
  console.error('[UnhandledPromise]', e.reason);
  Sentry.captureException(e.reason instanceof Error ? e.reason : new Error(String(e.reason)));
  e.preventDefault();
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Sentry.ErrorBoundary catches any React render errors and reports them */}
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }) => (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', height: '100vh', padding: '20px',
          background: '#0f0f0f', color: '#fff', textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>Something went wrong</h2>
          <p style={{ color: '#999', marginBottom: '24px', maxWidth: '400px' }}>
            The error has been automatically reported to our team. We'll fix it ASAP.
          </p>
          <button
            onClick={resetError}
            style={{
              background: '#7c3aed', color: '#fff', border: 'none',
              borderRadius: '8px', padding: '12px 24px', cursor: 'pointer',
              fontSize: '14px', fontWeight: '600'
            }}
          >
            Try Again
          </button>
          <p style={{ color: '#444', fontSize: '12px', marginTop: '16px' }}>
            Error: {error?.message || 'Unknown error'}
          </p>
        </div>
      )}
      showDialog={false}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Sentry.ErrorBoundary>
  </React.StrictMode>
);
