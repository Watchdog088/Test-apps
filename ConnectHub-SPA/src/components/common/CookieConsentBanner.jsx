// src/components/common/CookieConsentBanner.jsx
// BETA FIX (Jun 2026): Cookie consent banner — GDPR/CCPA legal requirement
// Shown once to first-time visitors. Stores preference in localStorage.

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CONSENT_KEY = 'lynkapp_cookie_consent';

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show if user hasn't made a choice yet
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) {
      // Small delay so it doesn't flash immediately on load
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setVisible(false);
    // Enable analytics if needed
    window.dispatchEvent(new CustomEvent('cookieConsent', { detail: 'accepted' }));
  };

  const decline = () => {
    localStorage.setItem(CONSENT_KEY, 'declined');
    setVisible(false);
    // Disable analytics / ads
    window.dispatchEvent(new CustomEvent('cookieConsent', { detail: 'declined' }));
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        background: 'rgba(15, 12, 41, 0.97)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.12)',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        flexWrap: 'wrap',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.5)',
        animation: 'slideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      {/* Cookie icon */}
      <span style={{ fontSize: 28, flexShrink: 0 }}>🍪</span>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 240 }}>
        <p style={{
          margin: 0,
          color: '#e2e8f0',
          fontSize: 14,
          lineHeight: 1.6,
          fontFamily: 'Inter, system-ui, sans-serif',
        }}>
          <strong>We use cookies</strong> to keep you logged in, improve your experience,
          and show relevant ads.{' '}
          <Link
            to="/cookie-policy"
            style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: 600 }}
          >
            Cookie Policy
          </Link>
          {' '}|{' '}
          <Link
            to="/privacy"
            style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: 600 }}
          >
            Privacy Policy
          </Link>
        </p>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
        <button
          onClick={decline}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.25)',
            color: 'rgba(255,255,255,0.7)',
            borderRadius: 50,
            padding: '9px 20px',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          Decline
        </button>
        <button
          onClick={accept}
          style={{
            background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
            border: 'none',
            color: 'white',
            borderRadius: 50,
            padding: '9px 24px',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'Inter, system-ui, sans-serif',
            boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
          }}
        >
          Accept All
        </button>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// Utility: check if user has accepted cookies
export function hasCookieConsent() {
  return localStorage.getItem(CONSENT_KEY) === 'accepted';
}

// Utility: check if user has declined cookies
export function hasCookieDecline() {
  return localStorage.getItem(CONSENT_KEY) === 'declined';
}
