// src/components/common/ComingSoonGate.jsx
// SECTION 3 FIX (Sep 2026): Reusable "Coming Soon" gate component.
// Wrap any placeholder feature section to clearly communicate status
// and prevent users from encountering a broken/empty experience.

import React from 'react';

/**
 * ComingSoonGate
 * @param {string}  feature    — Feature name displayed in heading
 * @param {string}  eta        — Optional estimated arrival (e.g. "Q1 2027")
 * @param {string}  description — One-line description of what's coming
 * @param {Array}   preview    — Array of { icon, label } items for bullet preview
 * @param {boolean} fullPage   — If true, takes full viewport height
 */
export default function ComingSoonGate({
  feature = 'This Feature',
  eta = 'Coming Soon',
  description = 'We\'re working hard to bring this to you.',
  preview = [],
  fullPage = false,
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: fullPage ? '80vh' : 320,
        padding: '40px 24px',
        textAlign: 'center',
        background: 'rgba(10, 8, 30, 0.0)',
      }}
    >
      {/* Animated icon */}
      <div
        style={{
          width: 96,
          height: 96,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 42,
          marginBottom: 24,
          boxShadow: '0 0 40px rgba(99, 102, 241, 0.4)',
          animation: 'pulse 2.5s ease-in-out infinite',
        }}
      >
        🚧
      </div>

      {/* ETA badge */}
      <div
        style={{
          display: 'inline-block',
          background: 'rgba(99, 102, 241, 0.15)',
          border: '1px solid rgba(99, 102, 241, 0.4)',
          borderRadius: 20,
          padding: '4px 14px',
          fontSize: 12,
          fontWeight: 700,
          color: '#a5b4fc',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: 16,
        }}
      >
        {eta}
      </div>

      {/* Heading */}
      <h2
        style={{
          fontSize: 26,
          fontWeight: 800,
          color: '#f1f5f9',
          margin: '0 0 12px',
          lineHeight: 1.2,
        }}
      >
        {feature} Is Coming
      </h2>

      {/* Description */}
      <p
        style={{
          fontSize: 15,
          color: '#94a3b8',
          lineHeight: 1.6,
          maxWidth: 320,
          margin: '0 0 28px',
        }}
      >
        {description}
      </p>

      {/* Preview bullets */}
      {preview.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
            justifyContent: 'center',
            maxWidth: 360,
            marginBottom: 28,
          }}
        >
          {preview.map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: 10,
                padding: '8px 12px',
                fontSize: 13,
                color: '#cbd5e1',
              }}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>
      )}

      {/* Notify CTA */}
      <button
        style={{
          padding: '12px 28px',
          borderRadius: 14,
          background: 'linear-gradient(135deg, #6366f1, #ec4899)',
          border: 'none',
          color: 'white',
          fontWeight: 700,
          fontSize: 14,
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
        }}
        onClick={() => {
          // Save interest flag so we can notify via push when it launches
          localStorage.setItem(`lynk_interest_${feature.toLowerCase().replace(/\s+/g, '_')}`, '1');
          // Show quick confirmation via toast if available
          try {
            const { useAppStore } = require('@store/useAppStore');
            useAppStore.getState().setToast({ message: `We'll notify you when ${feature} launches! 🔔`, type: 'success' });
          } catch {}
          alert(`We'll notify you when ${feature} launches! 🔔`);
        }}
      >
        🔔 Notify Me When It's Ready
      </button>
    </div>
  );
}
