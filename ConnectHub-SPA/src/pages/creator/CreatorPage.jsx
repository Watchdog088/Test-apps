// CreatorPage.jsx — Creator Studio hub
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreatorPage() {
  const nav = useNavigate();
  return (
    <div style={{ padding: '24px 20px', color: '#f1f5f9', maxWidth: 480, margin: '0 auto' }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>� Creator Studio</h2>
      <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 24 }}>
        Create content, grow your audience, and monetize your passion.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[
          { icon: '📈', label: 'Analytics', sub: 'Views, reach & engagement', path: '/creator/analytics' },
          { icon: '💰', label: 'Monetization', sub: 'Earnings & payment settings', path: '/creator/monetization' },
          { icon: '🎬', label: 'My Content', sub: 'Manage posts & media', path: '/creator/content' },
          { icon: '💵', label: 'Earnings', sub: 'Revenue & payouts', path: '/creator/earnings' },
          { icon: '📡', label: 'Go Live', sub: 'Start a live stream', path: '/live/setup' },
        ].map(item => (
          <button key={item.path} onClick={() => nav(item.path)}
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16, padding: '16px 18px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left', color: '#f1f5f9'
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
