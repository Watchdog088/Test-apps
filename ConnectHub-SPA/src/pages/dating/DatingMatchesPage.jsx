// src/pages/dating/DatingMatchesPage.jsx
// All mutual matches dashboard — sortable by date / compatibility

import React, { useState } from 'react';
import VerifiedBadge from '../../components/common/VerifiedBadge';
import { useNavigate } from 'react-router-dom';
import useAppStore from '@store/useAppStore';

const MATCHES = [
  { id: 'm1', name: 'Jordan', age: 28, emoji: '🌸', compat: 94, time: '2m ago', distance: '2 mi', online: true, verified: true, starter: 'You both love hiking! 🥾' },
  { id: 'm2', name: 'Alex', age: 26, emoji: '🔥', compat: 87, time: '1h ago', distance: '5 mi', online: false, verified: true, starter: 'Both night owls 🦉' },
  { id: 'm3', name: 'Riley', age: 30, emoji: '💪', compat: 82, time: '3h ago', distance: '8 mi', online: true, verified: false, starter: 'Both love cooking 🍳' },
  { id: 'm4', name: 'Morgan', age: 25, emoji: '🎨', compat: 79, time: '1d ago', distance: '12 mi', online: false, verified: true, starter: 'Both artists! 🎨' },
  { id: 'm5', name: 'Sam', age: 29, emoji: '🍕', compat: 76, time: '2d ago', distance: '3 mi', online: true, verified: false, starter: 'Foodies unite 🍜' },
  { id: 'm6', name: 'Casey', age: 27, emoji: '🌙', compat: 71, time: '3d ago', distance: '15 mi', online: false, verified: true, starter: 'Both love yoga 🧘' },
];

export default function DatingMatchesPage() {
  const navigate = useNavigate();
  const showToast = useAppStore(s => s.showToast);
  const [sort, setSort] = useState('recent'); // recent | compat | distance
  const [filter, setFilter] = useState('all'); // all | online | new

  const sorted = [...MATCHES]
    .filter(m => filter === 'all' ? true : filter === 'online' ? m.online : m.time.includes('m') || m.time.includes('1h'))
    .sort((a, b) => sort === 'compat' ? b.compat - a.compat : sort === 'distance' ? parseInt(a.distance) - parseInt(b.distance) : 0);

  return (
    <div style={{ background: '#0a0a18', minHeight: '100vh', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,10,24,0.95)',
        backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)',
        padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 22, cursor: 'pointer', padding: '4px 8px' }}>←</button>
        <span style={{ fontWeight: 700, fontSize: 17, color: '#f1f5f9' }}>💕 My Matches</span>
        <span style={{ marginLeft: 'auto', fontSize: 13, color: '#94a3b8', background: 'rgba(99,102,241,0.15)', borderRadius: 12, padding: '3px 10px' }}>{MATCHES.length} matches</span>
      </div>

      {/* Stats Banner */}
      <div style={{ display: 'flex', gap: 10, padding: '14px 16px' }}>
        {[
          { label: 'Total Matches', val: 6, icon: '💕' },
          { label: 'Online Now', val: 3, icon: '🟢' },
          { label: 'Unread Chats', val: 2, icon: '💬' },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ fontSize: 22 }}>{s.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#f1f5f9' }}>{s.val}</div>
            <div style={{ fontSize: 10, color: '#64748b' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter + Sort */}
      <div style={{ padding: '0 16px 12px', display: 'flex', gap: 8, overflowX: 'auto' }}>
        {['all', 'online', 'new'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '7px 16px', borderRadius: 22, fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
            background: filter === f ? 'linear-gradient(135deg,#ec4899,#8b5cf6)' : 'rgba(255,255,255,0.07)',
            border: 'none', color: filter === f ? 'white' : '#64748b', textTransform: 'capitalize',
          }}>{f === 'all' ? '✨ All' : f === 'online' ? '🟢 Online' : '🆕 New'}</button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          {['recent', 'compat', 'distance'].map(s => (
            <button key={s} onClick={() => setSort(s)} style={{
              padding: '7px 12px', borderRadius: 12, fontSize: 11, fontWeight: 600, cursor: 'pointer',
              background: sort === s ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.07)',
              border: sort === s ? '1px solid rgba(99,102,241,0.5)' : '1px solid transparent',
              color: sort === s ? '#818cf8' : '#64748b', textTransform: 'capitalize',
            }}>{s === 'recent' ? '🕐' : s === 'compat' ? '💯' : '📍'} {s}</button>
          ))}
        </div>
      </div>

      {/* Match Cards */}
      <div style={{ padding: '0 16px', display: 'grid', gap: 12 }}>
        {sorted.map(m => (
          <div key={m.id} style={{
            background: 'rgba(255,255,255,0.04)', borderRadius: 20, padding: '16px',
            border: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 14, alignItems: 'center',
          }}>
            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg,#ec4899,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
                {m.emoji}
              </div>
              {m.online && <div style={{ position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: '50%', background: '#22c55e', border: '2px solid #0a0a18' }} />}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <span style={{ fontWeight: 700, fontSize: 16, color: '#f1f5f9' }}>{m.name}, {m.age}</span>
                {m.verified && <VerifiedBadge variant="dating" size="sm" style={{ marginLeft: 2 }} />}
                <span style={{ marginLeft: 'auto', fontSize: 11, color: '#64748b' }}>{m.time}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: '#64748b' }}>📍 {m.distance}</span>
                <span style={{ fontSize: 11, background: 'rgba(236,72,153,0.15)', color: '#ec4899', borderRadius: 8, padding: '1px 7px', fontWeight: 700 }}>💯 {m.compat}%</span>
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8', background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '5px 10px' }}>
                💡 {m.starter}
              </div>
            </div>

            {/* Message Button */}
            <button
              onClick={() => navigate(`/messages/${m.id}`)}
              style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg,#ec4899,#8b5cf6)', border: 'none', fontSize: 18, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              💬
            </button>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {sorted.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>💔</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>No matches yet</div>
          <div style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>Keep swiping to find your match!</div>
          <button onClick={() => navigate('/dating')} style={{ padding: '12px 28px', borderRadius: 22, background: 'linear-gradient(135deg,#ec4899,#8b5cf6)', border: 'none', color: 'white', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
            Go to Dating 💕
          </button>
        </div>
      )}
    </div>
  );
}
