// src/pages/groups/GroupDetailPage.jsx
// Full group dashboard with feed, members, events, media, settings

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAppStore from '@store/useAppStore';

const DEMO_GROUP = {
  id: 'g1', name: 'Photography Enthusiasts', emoji: '📷', category: 'Photography',
  members: 2847, posts: 156, cover: 'https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?w=800',
  description: 'A community for photography lovers to share work, tips, and inspiration. All skill levels welcome!',
  privacy: 'Public', founded: 'March 2024', isAdmin: false, joined: true,
};

const GROUP_POSTS = [
  { id: 1, author: 'Jordan M.', emoji: '🌸', content: 'Golden hour at the pier tonight 🌅 Shot this with my 85mm prime.', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', likes: 124, comments: 18, time: '2h' },
  { id: 2, author: 'Alex C.', emoji: '🔥', content: 'Urban architecture series — Part 3. The shadows make this one special.', img: 'https://images.unsplash.com/photo-1541447270886-ac258fae5c4e?w=400', likes: 89, comments: 12, time: '5h' },
];

const MEMBERS = [
  { uid: 'u1', name: 'Jordan Maxwell', role: 'Admin', emoji: '🌸' },
  { uid: 'u2', name: 'Alex Chen', role: 'Moderator', emoji: '🔥' },
  { uid: 'u3', name: 'Riley Johnson', role: 'Member', emoji: '💪' },
  { uid: 'u4', name: 'Morgan Taylor', role: 'Member', emoji: '🎨' },
];

const TABS = ['Feed', 'Members', 'Events', 'Media', 'About'];

export default function GroupDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const showToast = useAppStore(s => s.showToast);
  const [activeTab, setActiveTab] = useState('Feed');
  const [joined, setJoined] = useState(DEMO_GROUP.joined);

  function toggleJoin() {
    setJoined(j => !j);
    showToast(joined ? 'Left the group' : '✅ Joined the group!', joined ? 'info' : 'success');
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
        <span style={{ fontWeight: 700, fontSize: 16, color: '#f1f5f9' }}>{DEMO_GROUP.name}</span>
        {DEMO_GROUP.isAdmin && <button onClick={() => showToast('Group settings coming soon', 'info')} style={{ marginLeft: 'auto', background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>⚙️</button>}
      </div>

      {/* Cover */}
      <div style={{ position: 'relative', height: 180 }}>
        <img src={DEMO_GROUP.cover} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,24,1) 0%, transparent 60%)' }} />
        <div style={{ position: 'absolute', bottom: 14, left: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg,#6366f1,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, border: '3px solid rgba(255,255,255,0.2)' }}>
            {DEMO_GROUP.emoji}
          </div>
        </div>
      </div>

      {/* Group Info */}
      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 20, color: '#f1f5f9' }}>{DEMO_GROUP.name}</div>
            <div style={{ fontSize: 13, color: '#64748b' }}>{DEMO_GROUP.category} · {DEMO_GROUP.privacy} Group</div>
          </div>
          <button onClick={toggleJoin} style={{
            padding: '9px 18px', borderRadius: 22, fontSize: 13, fontWeight: 700, cursor: 'pointer',
            background: joined ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg,#6366f1,#ec4899)',
            border: joined ? '1px solid rgba(255,255,255,0.15)' : 'none',
            color: joined ? '#94a3b8' : 'white',
          }}>
            {joined ? '✓ Joined' : '+ Join'}
          </button>
        </div>
        <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
          <span style={{ fontSize: 13, color: '#94a3b8' }}>👥 {DEMO_GROUP.members.toLocaleString()} members</span>
          <span style={{ fontSize: 13, color: '#94a3b8' }}>📝 {DEMO_GROUP.posts} posts/week</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)', overflowX: 'auto' }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            flex: 1, padding: '12px 8px', fontSize: 13, fontWeight: 700, background: 'none', border: 'none',
            borderBottom: activeTab === tab ? '2px solid #6366f1' : '2px solid transparent',
            color: activeTab === tab ? '#818cf8' : '#475569', cursor: 'pointer', whiteSpace: 'nowrap', minWidth: 60,
          }}>{tab}</button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ padding: '16px' }}>
        {activeTab === 'Feed' && GROUP_POSTS.map(p => (
          <div key={p.id} onClick={() => navigate(`/post/${p.id}`)} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 14, marginBottom: 14, border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{p.emoji}</div>
              <div><div style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9' }}>{p.author}</div><div style={{ fontSize: 11, color: '#475569' }}>{p.time}</div></div>
            </div>
            <p style={{ fontSize: 14, color: '#cbd5e1', marginBottom: p.img ? 10 : 0 }}>{p.content}</p>
            {p.img && <img src={p.img} alt="" style={{ width: '100%', borderRadius: 12, maxHeight: 180, objectFit: 'cover' }} />}
            <div style={{ display: 'flex', gap: 16, marginTop: 10, color: '#64748b', fontSize: 13 }}>
              <span>❤️ {p.likes}</span><span>💬 {p.comments}</span>
            </div>
          </div>
        ))}

        {activeTab === 'Members' && (
          <div>
            <div style={{ fontSize: 14, color: '#64748b', marginBottom: 12 }}>👥 {DEMO_GROUP.members.toLocaleString()} members</div>
            {MEMBERS.map(m => (
              <div key={m.uid} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{m.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9' }}>{m.name}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{m.role}</div>
                </div>
                <button onClick={() => navigate(`/messages/${m.uid}`)} style={{ padding: '6px 14px', borderRadius: 16, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: 12, cursor: 'pointer' }}>Message</button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Events' && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: 48 }}>📅</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', margin: '12px 0 8px' }}>No upcoming events</div>
            <div style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>Be the first to create an event for this group</div>
            <button onClick={() => navigate('/events')} style={{ padding: '10px 24px', borderRadius: 22, background: 'linear-gradient(135deg,#6366f1,#ec4899)', border: 'none', color: 'white', fontWeight: 700, cursor: 'pointer' }}>+ Create Event</button>
          </div>
        )}

        {activeTab === 'Media' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 3 }}>
            {GROUP_POSTS.filter(p => p.img).map(p => (
              <div key={p.id} style={{ aspectRatio: '1', overflow: 'hidden', borderRadius: 8, cursor: 'pointer' }}>
                <img src={p.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
            <div style={{ aspectRatio: '1', background: 'rgba(255,255,255,0.04)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: 28 }}>+</div>
          </div>
        )}

        {activeTab === 'About' && (
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 16, border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.7, marginBottom: 16 }}>{DEMO_GROUP.description}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[['Privacy', DEMO_GROUP.privacy], ['Category', DEMO_GROUP.category], ['Founded', DEMO_GROUP.founded], ['Members', DEMO_GROUP.members.toLocaleString()]].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: '#64748b' }}>{k}</span>
                  <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
