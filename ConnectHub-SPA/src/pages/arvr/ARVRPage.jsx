// src/pages/arvr/ARVRPage.jsx
// SECTION 3 FIX (Sep 2026): AR/VR section — DeepAR SDK is mocked.
// Per checklist item 3.2: "Do not ship a broken feature — label as Coming Soon."
// The UI shell is kept so users understand what's coming.
// Real DeepAR integration will be added in a future sprint.

import React from 'react';
import ComingSoonGate from '@components/common/ComingSoonGate';

const AR_FEATURES = [
  { icon: '🎭', label: 'Face Filters & Masks' },
  { icon: '🌟', label: 'Live AR Effects' },
  { icon: '🌐', label: 'Virtual Backgrounds' },
  { icon: '🕹️', label: 'AR Games & Challenges' },
  { icon: '🛍️', label: 'Virtual Try-On' },
  { icon: '🎬', label: 'Cinematic VR Stories' },
];

export default function ARVRPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0818 0%, #0f0a28 100%)',
      paddingBottom: 80,
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 16px 0',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        paddingBottom: 16,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 14,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22,
        }}>🌐</div>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#f1f5f9' }}>
            AR / VR Studio
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
            Augmented &amp; Virtual Reality experiences
          </p>
        </div>
      </div>

      {/* Coming Soon Gate */}
      <ComingSoonGate
        feature="AR / VR Studio"
        eta="Q2 2027"
        description="Immersive augmented and virtual reality filters, games, and experiences powered by DeepAR. Face tracking, live effects, and virtual try-on — coming to LynkApp."
        preview={AR_FEATURES}
        fullPage
      />

      {/* Teaser cards — static, no broken SDK calls */}
      <div style={{ padding: '0 16px 32px' }}>
        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '0.10em',
          textTransform: 'uppercase', color: '#475569',
          marginBottom: 12,
        }}>
          PLANNED FEATURES
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 10,
        }}>
          {AR_FEATURES.map((f, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14,
              padding: '14px 12px',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 22 }}>{f.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
