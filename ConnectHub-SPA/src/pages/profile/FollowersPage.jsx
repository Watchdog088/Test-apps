// src/pages/profile/FollowersPage.jsx
// Followers / Following list dashboard

import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

const DEMO_USERS = [
  { uid: 'u1', name: 'Jordan Maxwell', bio: 'UX Designer · 2.1K followers', emoji: '🌸', mutual: true, following: false },
  { uid: 'u2', name: 'Alex Chen', bio: 'Software Engineer · 891 followers', emoji: '🔥', mutual: true, following: true },
  { uid: 'u3', name: 'Riley Johnson', bio: 'Fitness Coach · 4.2K followers', emoji: '💪', mutual: false, following: false },
  { uid: 'u4', name: 'Morgan Taylor', bio: 'Graphic Artist · 12.8K followers', emoji: '🎨', mutual: false, following: true },
  { uid: 'u5', name: 'Sam Rivera', bio: 'Chef & Food Blogger · 5.6K followers', emoji: '🍕', mutual: true, following: false },
  { uid: 'u6', name: 'Casey Lee', bio: 'Yoga Teacher · 3.3K followers', emoji: '🌙', mutual: false, following: false },
  { uid: 'u7', name: 'Blake Kim', bio: 'Photographer · 7.1K followers', emoji: '📷', mutual: true, following: false },
  { uid: 'u8', name: 'Quinn Davis', bio: 'Music Producer · 18.9K followers', emoji: '🎵', mutual: false, following: true },
];

export default function FollowersPage() {
  const { uid } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isFollowing = location.pathname.endsWith('/following');

  const [users, setUsers] = useState(DEMO_USERS);
  const [search, setSearch] = useState('');

  const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()));

  function toggleFollow(userId) {
    setUsers(prev => prev.map(u => u.uid === userId ? { ...u, following: !u.following } : u));
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
        <span style={{ fontWeight: 700, fontSize: 17, color: '#f1f5f9' }}>
          {isFollowing ? '👤 Following' : '👥 Followers'}
        </span>
      </div>

      {/* Tab Toggle */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <button
          onClick={() => navigate(`/profile/${uid}/followers`)}
          style={{ flex: 1, padding: '14px', fontSize: 14, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', borderBottom: !isFollowing ? '2px solid #6366f1' : '2px solid transparent', color: !isFollowing ? '#818cf8' : '#475569' }}>
          Followers
        </button>
        <button
          onClick={() => navigate(`/profile/${uid}/following`)}
          style={{ flex: 1, padding: '14px', fontSize: 14, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', borderBottom: isFollowing ? '2px solid #6366f1' : '2px solid transparent', color: isFollowing ? '#818cf8' : '#475569' }}>
          Following
        </button>
      </div>

      {/* Search */}
      <div style={{ padding: '12px 16px' }}>
        <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#475569', fontSize: 16 }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search users…"
            style={{ flex: 1, background: 'none', border: 'none', color: '#f1f5f9', fontSize: 14, outline: 'none' }}
          />
        </div>
      </div>

      {/* User List */}
      <div>
        {filtered.map(u => (
          <div key={u.uid} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <button onClick={() => navigate(`/profile/${u.uid}`)} style={{ width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, border: 'none', cursor: 'pointer' }}>
              {u.emoji}
            </button>
            <div style={{ flex: 1, minWidth: 0 }} onClick={() => navigate(`/profile/${u.uid}`)}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 6 }}>
                {u.name}
                {u.mutual && <span style={{ fontSize: 10, background: 'rgba(99,102,241,0.2)', color: '#818cf8', borderRadius: 8, padding: '1px 6px' }}>Mutual</span>}
              </div>
              <div style={{ fontSize: 12, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.bio}</div>
            </div>
            <button
              onClick={() => toggleFollow(u.uid)}
              style={{
                padding: '8px 16px', borderRadius: 22, fontSize: 13, fontWeight: 700, cursor: 'pointer', flexShrink: 0,
                background: u.following ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg,#6366f1,#ec4899)',
                border: u.following ? '1px solid rgba(255,255,255,0.15)' : 'none',
                color: u.following ? '#94a3b8' : 'white',
              }}>
              {u.following ? 'Following' : 'Follow'}
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: '#475569' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#64748b' }}>No users found</div>
          </div>
        )}
      </div>
    </div>
  );
}
