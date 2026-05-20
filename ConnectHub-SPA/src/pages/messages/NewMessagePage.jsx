// src/pages/messages/NewMessagePage.jsx
// User search dashboard to find users and start a new chat thread

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '@store/useAppStore';

const SUGGESTED = [
  { uid: 'u1', name: 'Jordan Maxwell', bio: 'UX Designer', emoji: '🌸', online: true },
  { uid: 'u2', name: 'Alex Chen', bio: 'Software Engineer', emoji: '🔥', online: true },
  { uid: 'u3', name: 'Riley Johnson', bio: 'Fitness Coach', emoji: '💪', online: false },
  { uid: 'u4', name: 'Morgan Taylor', bio: 'Graphic Artist', emoji: '🎨', online: true },
  { uid: 'u5', name: 'Sam Rivera', bio: 'Chef & Blogger', emoji: '🍕', online: false },
  { uid: 'u6', name: 'Casey Lee', bio: 'Yoga Teacher', emoji: '🌙', online: false },
];

export default function NewMessagePage() {
  const navigate = useNavigate();
  const showToast = useAppStore(s => s.showToast);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);

  const filtered = SUGGESTED.filter(u => u.name.toLowerCase().includes(search.toLowerCase()));

  function toggleSelect(user) {
    setSelected(prev =>
      prev.find(u => u.uid === user.uid)
        ? prev.filter(u => u.uid !== user.uid)
        : [...prev, user]
    );
  }

  function startChat() {
    if (selected.length === 0) { showToast('Select at least one person', 'warning'); return; }
    const firstId = selected[0].uid;
    showToast(`Starting chat with ${selected.map(u => u.name).join(', ')}`, 'success');
    navigate(`/messages/${firstId}`);
  }

  return (
    <div style={{ background: '#0a0a18', minHeight: '100vh', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,10,24,0.95)',
        backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)',
        padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 22, cursor: 'pointer', padding: '4px 8px' }}>←</button>
        <span style={{ fontWeight: 700, fontSize: 17, color: '#f1f5f9' }}>✉️ New Message</span>
        {selected.length > 0 && (
          <button onClick={startChat} style={{ marginLeft: 'auto', padding: '8px 18px', borderRadius: 22, background: 'linear-gradient(135deg,#6366f1,#ec4899)', border: 'none', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            Chat ({selected.length})
          </button>
        )}
      </div>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div style={{ padding: '10px 16px', display: 'flex', gap: 8, flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {selected.map(u => (
            <div key={u.uid} onClick={() => toggleSelect(u)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', borderRadius: 20, padding: '5px 10px', cursor: 'pointer' }}>
              <span style={{ fontSize: 14 }}>{u.emoji}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#818cf8' }}>{u.name}</span>
              <span style={{ fontSize: 14, color: '#94a3b8' }}>✕</span>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div style={{ padding: '12px 16px' }}>
        <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#475569', fontSize: 16 }}>🔍</span>
          <input
            autoFocus
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search people…"
            style={{ flex: 1, background: 'none', border: 'none', color: '#f1f5f9', fontSize: 14, outline: 'none' }}
          />
        </div>
      </div>

      {/* User list */}
      <div style={{ padding: '0 16px 8px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', marginBottom: 10 }}>
          {search ? '🔍 Search Results' : '💡 Suggested'}
        </div>
        {filtered.map(u => {
          const isSelected = !!selected.find(s => s.uid === u.uid);
          return (
            <div key={u.uid} onClick={() => toggleSelect(u)} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0',
              borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer',
            }}>
              <div style={{ position: 'relative' }}>
                <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{u.emoji}</div>
                {u.online && <div style={{ position: 'absolute', bottom: 1, right: 1, width: 12, height: 12, borderRadius: '50%', background: '#22c55e', border: '2px solid #0a0a18' }} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9' }}>{u.name}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{u.bio} {u.online ? '· 🟢 Online' : ''}</div>
              </div>
              <div style={{
                width: 26, height: 26, borderRadius: '50%', border: `2px solid ${isSelected ? '#6366f1' : 'rgba(255,255,255,0.2)'}`,
                background: isSelected ? 'linear-gradient(135deg,#6366f1,#ec4899)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
              }}>
                {isSelected && '✓'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Start Chat FAB */}
      {selected.length > 0 && (
        <div style={{ position: 'fixed', bottom: 88, left: '50%', transform: 'translateX(-50%)', zIndex: 200 }}>
          <button onClick={startChat} style={{ padding: '14px 36px', borderRadius: 28, background: 'linear-gradient(135deg,#6366f1,#ec4899)', border: 'none', color: 'white', fontWeight: 800, fontSize: 16, cursor: 'pointer', boxShadow: '0 8px 32px rgba(99,102,241,0.4)' }}>
            💬 Open Chat
          </button>
        </div>
      )}
    </div>
  );
}
