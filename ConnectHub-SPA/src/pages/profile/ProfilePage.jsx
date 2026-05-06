// src/pages/profile/ProfilePage.jsx
// Rec #8 Profile Layout:
//   [Cover Photo — full bleed, 40% screen height]
//     [Avatar — overlapping cover, bottom-left, 72px]
//     [Follow / Message / ••• buttons — bottom-right]
//   [Name | @handle | Bio]
//   [Stats Row: Posts | Followers | Following]
//   [Tab Bar: Posts | Reels | Tagged | Liked]
//   [Content Grid (3-col) or List]

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@fb/config';
import { useAuth } from '@hooks/useAuth';

const PROFILE_TABS = ['Posts', 'Reels', 'Tagged', 'Liked'];

// ── Demo post grid data ──────────────────────────────────────────────────────
const DEMO_GRID = [
  { id:1,  emoji:'🌅', color:'linear-gradient(135deg,#f59e0b,#ef4444)' },
  { id:2,  emoji:'🎵', color:'linear-gradient(135deg,#ec4899,#8b5cf6)' },
  { id:3,  emoji:'💪', color:'linear-gradient(135deg,#10b981,#6366f1)' },
  { id:4,  emoji:'🍕', color:'linear-gradient(135deg,#f59e0b,#10b981)' },
  { id:5,  emoji:'✈️', color:'linear-gradient(135deg,#6366f1,#3b82f6)' },
  { id:6,  emoji:'🎨', color:'linear-gradient(135deg,#8b5cf6,#ec4899)' },
  { id:7,  emoji:'📸', color:'linear-gradient(135deg,#14b8a6,#6366f1)' },
  { id:8,  emoji:'🎮', color:'linear-gradient(135deg,#3b82f6,#8b5cf6)' },
  { id:9,  emoji:'🔥', color:'linear-gradient(135deg,#ef4444,#f59e0b)' },
  { id:10, emoji:'🌸', color:'linear-gradient(135deg,#ec4899,#6366f1)' },
  { id:11, emoji:'⚡', color:'linear-gradient(135deg,#f59e0b,#6366f1)' },
  { id:12, emoji:'💎', color:'linear-gradient(135deg,#6366f1,#14b8a6)' },
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [profile,  setProfile]  = useState(null);
  const [posts,    setPosts]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [activeTab, setActiveTab] = useState('Posts');
  const [followed, setFollowed] = useState(false);

  const isOwn = true; // Always own profile on /profile; use /profile/:id for others

  // Load profile
  useEffect(() => {
    if (!user?.uid) { setLoading(false); return; }
    async function load() {
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) setProfile({ id: snap.id, ...snap.data() });
        else setProfile({ displayName: user.displayName || 'User', email: user.email });
        const qp = query(collection(db, 'posts'), where('authorId', '==', user.uid), orderBy('createdAt', 'desc'));
        const postsSnap = await getDocs(qp);
        setPosts(postsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        setProfile({ displayName: user.displayName || 'User', email: user.email });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const displayName = profile?.displayName || profile?.name || user?.displayName || 'User';
  const handle      = '@' + (displayName.toLowerCase().replace(/\s+/g, '') || 'user');
  const bio         = profile?.bio || '✨ Living life one post at a time. Creator · Explorer · Dreamer.';
  const postCount   = posts.length || DEMO_GRID.length;
  const followers   = profile?.followersCount || '1.4K';
  const following   = profile?.followingCount || '312';

  // ── Cover height = ~40% of viewport ──────────────────────────────────────
  const COVER_H = typeof window !== 'undefined' ? Math.round(window.innerHeight * 0.38) : 240;
  const AVATAR  = 72;  // px per spec

  return (
    <div style={{ background: '#0a0a18', minHeight: '100vh', paddingBottom: 80 }}>

      {/* ── Cover Photo — full bleed, 40% screen height ── */}
      <div style={{ position: 'relative', height: COVER_H, background: 'linear-gradient(135deg,#1e1b4b 0%,#312e81 35%,#ec4899 70%,#f97316 100%)', overflow: 'visible' }}>

        {/* Edit cover button (own profile) */}
        {isOwn && (
          <button style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, padding: '6px 12px', color: 'white', fontSize: 12, fontWeight: 600, backdropFilter: 'blur(8px)' }}>
            ✏️ Edit Cover
          </button>
        )}

        {/* Bottom row: avatar (left) + action buttons (right) */}
        <div style={{ position: 'absolute', bottom: -AVATAR / 2, left: 0, right: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 16px' }}>

          {/* ── Avatar — overlapping cover, bottom-left, 72px ── */}
          <div style={{ position: 'relative' }}>
            <div style={{
              width: AVATAR, height: AVATAR, borderRadius: '50%',
              background: 'linear-gradient(135deg,#6366f1,#ec4899)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 800, color: 'white',
              border: '3px solid #0a0a18',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            }}>
              {displayName[0].toUpperCase()}
            </div>
            {isOwn && (
              <button style={{ position: 'absolute', bottom: 0, right: -2, width: 22, height: 22, borderRadius: '50%', background: '#6366f1', border: '2px solid #0a0a18', color: 'white', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✏️</button>
            )}
          </div>

          {/* ── Action buttons — bottom-right ── */}
          <div style={{ display: 'flex', gap: 8, paddingBottom: 4 }}>
            {isOwn ? (
              <button style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, padding: '7px 18px', color: 'white', fontSize: 13, fontWeight: 600, backdropFilter: 'blur(8px)' }}>
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={() => setFollowed(f => !f)}
                  style={{ background: followed ? 'rgba(255,255,255,0.12)' : 'linear-gradient(135deg,#6366f1,#ec4899)', border: followed ? '1px solid rgba(255,255,255,0.2)' : 'none', borderRadius: 20, padding: '7px 20px', color: 'white', fontSize: 13, fontWeight: 700 }}
                >
                  {followed ? '✓ Following' : '+ Follow'}
                </button>
                <button
                  onClick={() => navigate('/messages')}
                  style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, padding: '7px 18px', color: 'white', fontSize: 13, fontWeight: 600, backdropFilter: 'blur(8px)' }}
                >
                  💬 Message
                </button>
              </>
            )}
            <button style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, padding: '7px 12px', color: 'white', fontSize: 16, backdropFilter: 'blur(8px)' }}>•••</button>
          </div>
        </div>
      </div>

      {/* ── Spacer for avatar overlap ── */}
      <div style={{ height: AVATAR / 2 + 12 }} />

      {/* ── Name | @handle | Bio ── */}
      <div style={{ padding: '0 16px 16px' }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9' }}>{displayName}</div>
        <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{handle}</div>
        <div style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.5, marginTop: 8, maxWidth: 340 }}>{bio}</div>

        {profile?.website && (
          <div style={{ fontSize: 13, color: '#818cf8', marginTop: 6 }}>🔗 {profile.website}</div>
        )}
        {profile?.location && (
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 3 }}>📍 {profile.location}</div>
        )}
      </div>

      {/* ── Stats Row: Posts | Followers | Following ── */}
      <div style={{ display: 'flex', borderTop: '1px solid rgba(255,255,255,0.07)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        {[
          { label: 'Posts',     value: postCount },
          { label: 'Followers', value: followers },
          { label: 'Following', value: following },
        ].map((s, i) => (
          <div key={s.label} style={{ flex: 1, padding: '14px 0', textAlign: 'center', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.07)' : 'none', cursor: i > 0 ? 'pointer' : 'default' }}
            onClick={() => i > 0 && navigate('/friends')}
          >
            <div style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9' }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Tab Bar: Posts | Reels | Tagged | Liked (Rec #8) ── */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        {PROFILE_TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            flex: 1, padding: '12px 4px', fontSize: 13, fontWeight: activeTab === tab ? 700 : 500,
            color: activeTab === tab ? '#818cf8' : '#64748b',
            background: 'none', border: 'none',
            borderBottom: activeTab === tab ? '2.5px solid #6366f1' : '2.5px solid transparent',
            cursor: 'pointer', transition: 'all 0.15s',
          }}>
            {tab === 'Posts'   ? '⊞' : tab === 'Reels' ? '▶' : tab === 'Tagged' ? '🏷' : '❤️'}&nbsp;{tab}
          </button>
        ))}
      </div>

      {/* ── Content Grid (3-col) ── */}
      {activeTab === 'Posts' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 2, padding: 2 }}>
          {(posts.length > 0 ? posts : DEMO_GRID).map((item) => (
            <div key={item.id} style={{
              aspectRatio: '1/1',
              background: item.color || 'linear-gradient(135deg,#6366f1,#ec4899)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, cursor: 'pointer', borderRadius: 4,
              overflow: 'hidden',
            }}>
              {item.mediaUrl
                ? <img src={item.mediaUrl} alt="" style={{ width:'100%',height:'100%',objectFit:'cover' }} />
                : item.emoji || '📸'
              }
            </div>
          ))}
        </div>
      )}

      {activeTab === 'Reels' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 2, padding: 2 }}>
          {DEMO_GRID.slice(0, 6).map(item => (
            <div key={item.id} style={{ aspectRatio: '9/16', background: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, borderRadius: 4, position: 'relative' }}>
              {item.emoji}
              <span style={{ position: 'absolute', bottom: 4, left: 4, fontSize: 16 }}>▶</span>
            </div>
          ))}
        </div>
      )}

      {(activeTab === 'Tagged' || activeTab === 'Liked') && (
        <div style={{ textAlign: 'center', padding: '48px 24px', color: '#475569' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>{activeTab === 'Tagged' ? '🏷️' : '❤️'}</div>
          <div style={{ fontWeight: 600, color: '#64748b' }}>No {activeTab.toLowerCase()} posts yet</div>
        </div>
      )}

    </div>
  );
}
