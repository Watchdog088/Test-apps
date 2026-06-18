// VideoCallsPage.jsx — Video Calls hub
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function VideoCallsPage() {
  const nav = useNavigate();
  return (
    <div style={{ padding: '24px 20px', color: '#f1f5f9', maxWidth: 480, margin: '0 auto' }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>📹 Video Calls</h2>
      <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 24 }}>
        Start or join a video call with friends and groups.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[
          { icon: '📞', label: 'New Call', sub: 'Start a 1-on-1 video call', path: '/videocalls/new' },
          { icon: '📋', label: 'Call History', sub: 'View past calls', path: '/videocalls/history' },
          { icon: '🤝', label: 'Meetings', sub: 'Schedule or join a meeting', path: '/meetings' },
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
