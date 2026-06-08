// src/components/common/BetaWelcomeTooltip.jsx
// One-time "Welcome, Beta Tester!" tooltip shown after first login.
// Points users to the Feedback button in the top nav.
// Dismissed state persisted in localStorage — shows only once per device.

import React, { useState, useEffect } from 'react';
import { useAuth } from '@hooks/useAuth';

const LS_KEY = 'lynkapp_beta_tooltip_dismissed';

export default function BetaWelcomeTooltip() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (user && !localStorage.getItem(LS_KEY)) {
      const t = setTimeout(() => setVisible(true), 1800);
      return () => clearTimeout(t);
    }
  }, [user]);

  function dismiss() {
    localStorage.setItem(LS_KEY, '1');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <>
      {/* Semi-transparent backdrop — tap anywhere to close */}
      <div
        onClick={dismiss}
        style={{
          position: 'fixed', inset: 0, zIndex: 9990,
          background: 'rgba(0,0,0,0.42)',
          backdropFilter: 'blur(2px)',
        }}
        aria-hidden="true"
      />

      {/* Arrow pointing UP toward the top-right feedback button */}
      <div style={{
        position: 'fixed', top: 52, right: 44,
        zIndex: 9992, width: 0, height: 0,
        borderLeft: '9px solid transparent',
        borderRight: '9px solid transparent',
        borderBottom: '9px solid rgba(99,102,241,0.6)',
      }} />

      {/* Tooltip card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="beta-tip-title"
        style={{
          position: 'fixed', top: 60, right: 10,
          zIndex: 9991, width: 270,
          background: 'rgba(15,12,41,0.97)',
          border: '1.5px solid rgba(99,102,241,0.45)',
          borderRadius: 18,
          padding: '20px 18px 16px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.55)',
          animation: 'fadeIn 0.28s ease both',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 12, flexShrink: 0,
            background: 'linear-gradient(135deg,#6366f1,#ec4899)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>🧪</div>
          <div>
            <div id="beta-tip-title" style={{ fontWeight: 800, fontSize: 14, color: '#f1f5f9' }}>
              Welcome, Beta Tester! 🎉
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>
              LynkApp — private beta
            </div>
          </div>
        </div>

        {/* Body */}
        <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
          Found a bug or have feedback? Tap the{' '}
          <span style={{ color: '#818cf8', fontWeight: 700 }}>💬 Feedback</span> button
          at the top-right of any screen — it takes less than 30 seconds and helps
          us ship fixes faster.
        </p>

        {/* Steps */}
        <div style={{ margin: '12px 0 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { n: '1', text: 'Explore the app normally' },
            { n: '2', text: 'Notice anything odd? Tap 💬' },
            { n: '3', text: 'Rate + describe + submit' },
          ].map(({ n, text }) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                background: 'rgba(99,102,241,0.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 800, color: '#818cf8',
              }}>{n}</div>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>{text}</span>
            </div>
          ))}
        </div>

        {/* Dismiss */}
        <button
          onClick={dismiss}
          className="btn-outline-neutral"
          style={{ marginTop: 14, width: '100%' }}
        >
          Got it — let me explore 🚀
        </button>
      </div>
    </>
  );
}
