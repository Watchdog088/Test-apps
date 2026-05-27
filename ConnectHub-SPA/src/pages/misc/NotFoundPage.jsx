// src/pages/misc/NotFoundPage.jsx — Beta-ready 404 page
// Replaces the wildcard Navigate-to-feed redirect with a proper error page
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '100vh', padding: '32px 20px',
      background: 'linear-gradient(135deg,#0f0f1a 0%,#1a0f2e 100%)',
      color: '#fff', textAlign: 'center', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
    }}>
      {/* Big emoji icon */}
      <div style={{ fontSize: '80px', marginBottom: '16px', lineHeight: 1 }}>🔍</div>

      {/* Error code */}
      <div style={{
        fontSize: '14px', fontWeight: 700, letterSpacing: '0.15em',
        color: '#7c3aed', textTransform: 'uppercase', marginBottom: '12px',
      }}>
        404 — Page Not Found
      </div>

      {/* Headline */}
      <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 12px', lineHeight: 1.2 }}>
        Looks like you're lost!
      </h1>

      {/* Subtext */}
      <p style={{ color: '#94a3b8', fontSize: '15px', maxWidth: '340px', margin: '0 0 32px', lineHeight: 1.6 }}>
        The page you're looking for doesn't exist or has been moved.
        Let's get you back on track.
      </p>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'rgba(255,255,255,0.08)', color: '#e2e8f0',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '12px', padding: '12px 24px',
            fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.14)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
        >
          ← Go Back
        </button>
        <button
          onClick={() => navigate('/feed', { replace: true })}
          style={{
            background: 'linear-gradient(135deg,#7c3aed,#ec4899)',
            color: '#fff', border: 'none',
            borderRadius: '12px', padding: '12px 28px',
            fontSize: '14px', fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          🏠 Go to Feed
        </button>
      </div>

      {/* Support link */}
      <p style={{ color: '#475569', fontSize: '12px', marginTop: '40px' }}>
        Still having trouble?{' '}
        <span
          onClick={() => navigate('/help')}
          style={{ color: '#7c3aed', cursor: 'pointer', textDecoration: 'underline' }}
        >
          Contact Support
        </span>
      </p>
    </div>
  );
}
