// ARVRPage.jsx — AR/VR Experience hub
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ARVRPage() {
  const nav = useNavigate();
  return (
    <div style={{ padding: '24px 20px', color: '#f1f5f9', maxWidth: 480, margin: '0 auto' }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>🥽 AR / VR</h2>
      <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 24 }}>
        Immersive augmented and virtual reality experiences.
      </p>

      <div style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(236,72,153,0.1))',
        border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20, padding: 24,
        textAlign: 'center', marginBottom: 20
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🚀</div>
        <h3 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 8px' }}>
          AR Features Coming Soon
        </h3>
        <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>
          Face filters, virtual try-on, and immersive VR worlds are on the roadmap.
          Stay tuned for updates!
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[
          { icon: '🎭', label: 'AR Filters', sub: 'Camera effects for stories & live', path: '/arvr/filter/demo' },
          { icon: '🌐', label: 'VR Viewer', sub: 'Explore 360° virtual spaces', path: '/arvr/vr/demo' },
        ].map(item => (
          <button key={item.path} onClick={() => nav(item.path)}
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16, padding: '16px 18px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left', color: '#f1f5f9',
              opacity: 0.7
            }}>
            <span style={{ fontSize: 28 }}>{item.icon}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{item.label}</div>
              <div style={{ color: '#64748b', fontSize: 13 }}>{item.sub}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
