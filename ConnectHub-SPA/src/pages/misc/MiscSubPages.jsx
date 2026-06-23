// src/pages/misc/MiscSubPages.jsx
// Business Analytics, Gaming Library, Gaming Leaderboard, Music Artist,
// Music Album, Media Video Player, Saved Collections — all in one file
// Fixed: Added onError image fallbacks to prevent blank areas on broken external images (Jun 2026)

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAppStore from '@store/useAppStore';

function PageHeader({ title, emoji, actions }) {
  const navigate = useNavigate();
  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,10,24,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 22, cursor: 'pointer', padding: '4px 8px' }}>←</button>
      <span style={{ fontWeight: 700, fontSize: 17, color: '#f1f5f9' }}>{emoji} {title}</span>
      {actions}
    </div>
  );
}

// ─── BUSINESS ANALYTICS ──────────────────────────────────
export function BusinessAnalyticsPage() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('30d');
  const stats = [
    { label: 'Profile Views', val: '8,412', icon: '👁️', up: true },
    { label: 'Website Clicks', val: '1,284', icon: '🔗', up: true },
    { label: 'Messages', val: 47, icon: '💬', up: false },
    { label: 'Followers', val: '12.4K', icon: '👥', up: true },
  ];
  return (
    <div style={{ background: '#0a0a18', minHeight: '100vh', paddingBottom: 80 }}>
      <PageHeader title="Business Analytics" emoji="📊" />
      <div style={{ display: 'flex', gap: 8, padding: '12px 16px' }}>
        {['7d', '30d', '90d'].map(p => (
          <button key={p} onClick={() => setPeriod(p)} style={{ padding: '7px 16px', borderRadius: 22, fontSize: 12, fontWeight: 700, cursor: 'pointer', background: period === p ? 'linear-gradient(135deg,#6366f1,#ec4899)' : 'rgba(255,255,255,0.07)', border: 'none', color: period === p ? 'white' : '#64748b' }}>{p}</button>
        ))}
      </div>
      <div style={{ padding: '0 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          {stats.map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: '14px', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#f1f5f9' }}>{s.val}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{s.label}</div>
              <div style={{ fontSize: 11, color: s.up ? '#22c55e' : '#ef4444', marginTop: 2 }}>{s.up ? '↑' : '↓'} vs last period</div>
            </div>
          ))}
        </div>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#94a3b8', marginBottom: 12 }}>📈 Engagement Breakdown</div>
        {[['Post Reach', '8,412', 85], ['Story Views', '3,284', 60], ['Video Plays', '12,847', 100], ['Profile Visits', '1,847', 40]].map(([label, val, pct]) => (
          <div key={label} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: '#f1f5f9' }}>{label}</span>
              <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 700 }}>{val}</span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)' }}>
              <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: 'linear-gradient(135deg,#6366f1,#ec4899)' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── GAMING LIBRARY ──────────────────────────────────────
export function GamingLibraryPage() {
  const navigate = useNavigate();
  const showToast = useAppStore(s => s.showToast);
  const games = [
    { id: 'g1', title: 'Fortnite', genre: 'Battle Royale', hours: 284, lastPlayed: '2h ago', img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=80', rating: 4.2 },
    { id: 'g2', title: 'Minecraft', genre: 'Sandbox', hours: 1847, lastPlayed: '3d ago', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80', rating: 4.8 },
    { id: 'g3', title: 'Apex Legends', genre: 'Battle Royale', hours: 124, lastPlayed: '1w ago', img: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=80', rating: 4.0 },
    { id: 'g4', title: 'Call of Duty', genre: 'FPS', hours: 389, lastPlayed: '1d ago', img: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=80', rating: 4.1 },
  ];
  return (
    <div style={{ background: '#0a0a18', minHeight: '100vh', paddingBottom: 80 }}>
      <PageHeader title="Game Library" emoji="🎮" />
      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          {[{ label: 'Games', val: 4, icon: '🎮' }, { label: 'Hours', val: '2,644', icon: '⏱️' }, { label: 'Achievements', val: 87, icon: '🏆' }].map(s => (
            <div key={s.label} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ fontSize: 20 }}>{s.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#f1f5f9' }}>{s.val}</div>
              <div style={{ fontSize: 10, color: '#64748b' }}>{s.label}</div>
            </div>
          ))}
        </div>
        {games.map(g => (
          <div key={g.id} onClick={() => showToast(`Opening ${g.title}...`, 'info')} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer' }}>
            <div style={{ width: 58, height: 58, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
              <img
                src={g.img}
                alt={g.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = '<span style="font-size:28px;display:flex;align-items:center;justify-content:center;height:100%">🎮</span>'; }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9', marginBottom: 2 }}>{g.title}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 2 }}>{g.genre} · {g.hours}h played</div>
              <div style={{ fontSize: 11, color: '#475569' }}>Last played {g.lastPlayed}</div>
            </div>
            <button onClick={e => { e.stopPropagation(); showToast(`Launching ${g.title}...`, 'success'); }} style={{ alignSelf: 'center', padding: '7px 14px', borderRadius: 14, background: 'linear-gradient(135deg,#6366f1,#ec4899)', border: 'none', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Play</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── GAMING LEADERBOARD ──────────────────────────────────
export function GamingLeaderboardPage() {
  const navigate = useNavigate();
  const [game, setGame] = useState('Fortnite');
  const players = [
    { rank: 1, name: 'ProGamer99', score: 48200, wins: 284, emoji: '🔥', crown: true },
    { rank: 2, name: 'PixelKnight', score: 43100, wins: 241, emoji: '⚔️', crown: false },
    { rank: 3, name: 'StarPlayer', score: 38900, wins: 198, emoji: '⭐', crown: false },
    { rank: 4, name: 'NightOwl', score: 34200, wins: 172, emoji: '🦉', crown: false },
    { rank: 5, name: 'You', score: 28400, wins: 124, emoji: '✨', crown: false, isMe: true },
  ];
  return (
    <div style={{ background: '#0a0a18', minHeight: '100vh', paddingBottom: 80 }}>
      <PageHeader title="Leaderboard" emoji="🏆" />
      <div style={{ display: 'flex', gap: 8, padding: '12px 16px', overflowX: 'auto' }}>
        {['Fortnite', 'Apex Legends', 'Minecraft', 'Call of Duty'].map(g => (
          <button key={g} onClick={() => setGame(g)} style={{ padding: '7px 14px', borderRadius: 22, fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', background: game === g ? 'linear-gradient(135deg,#6366f1,#ec4899)' : 'rgba(255,255,255,0.07)', border: 'none', color: game === g ? 'white' : '#64748b' }}>{g}</button>
        ))}
      </div>
      {/* Top 3 Podium */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 12, padding: '16px', marginBottom: 4 }}>
        {[players[1], players[0], players[2]].map((p, i) => (
          <div key={p.rank} style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>{p.emoji}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>{p.name}</div>
            <div style={{
              borderRadius: '8px 8px 0 0', padding: '12px 8px', textAlign: 'center',
              background: i === 1 ? 'linear-gradient(180deg,rgba(251,191,36,0.4),rgba(251,191,36,0.15))' : 'rgba(255,255,255,0.06)',
              height: i === 1 ? 80 : i === 0 ? 60 : 40,
              border: i === 1 ? '1px solid rgba(251,191,36,0.5)' : '1px solid rgba(255,255,255,0.07)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ fontWeight: 900, fontSize: 18, color: i === 1 ? '#fbbf24' : '#94a3b8' }}>#{p.rank}</div>
            </div>
          </div>
        ))}
      </div>
      {/* Full List */}
      <div style={{ padding: '0 16px' }}>
        {players.map(p => (
          <div key={p.rank} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 14, marginBottom: 8,
            background: p.isMe ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
            border: p.isMe ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: p.rank <= 3 ? 'linear-gradient(135deg,#fbbf24,#f59e0b)' : 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 13, color: p.rank <= 3 ? 'white' : '#94a3b8' }}>
              {p.rank <= 3 ? ['🥇', '🥈', '🥉'][p.rank - 1] : `#${p.rank}`}
            </div>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{p.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9' }}>{p.name} {p.isMe && '(You)'}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{p.wins} wins</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9' }}>{p.score.toLocaleString()}</div>
              <div style={{ fontSize: 10, color: '#475569' }}>points</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MUSIC ARTIST PAGE ───────────────────────────────────
export function MusicArtistPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const showToast = useAppStore(s => s.showToast);
  const [following, setFollowing] = useState(false);

  const ARTIST = { name: 'Jordan Maxwell', genre: 'Electronic / Lo-fi', followers: '124K', monthly: '847K', emoji: '🎵', verified: true };
  const TRACKS = [
    { id: 1, title: 'Golden Hour Vibes', plays: '2.1M', duration: '3:24' },
    { id: 2, title: 'Late Night Drive', plays: '1.8M', duration: '4:12' },
    { id: 3, title: 'City Lights (feat. Alex C.)', plays: '987K', duration: '3:56' },
    { id: 4, title: 'Dawn Chorus', plays: '654K', duration: '5:02' },
  ];

  return (
    <div style={{ background: '#0a0a18', minHeight: '100vh', paddingBottom: 80 }}>
      <PageHeader title="Artist" emoji="🎵" />
      <div style={{ padding: '20px 16px 16px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, margin: '0 auto 12px', border: '3px solid rgba(255,255,255,0.15)' }}>{ARTIST.emoji}</div>
        <div style={{ fontWeight: 900, fontSize: 22, color: '#f1f5f9', marginBottom: 4 }}>{ARTIST.name} {ARTIST.verified && '✅'}</div>
        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>{ARTIST.genre}</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 16 }}>
          {[['Followers', ARTIST.followers], ['Monthly Listeners', ARTIST.monthly]].map(([l, v]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 900, fontSize: 18, color: '#f1f5f9' }}>{v}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button onClick={() => { setFollowing(f => !f); showToast(following ? 'Unfollowed' : '✅ Following!', 'success'); }} style={{ padding: '10px 22px', borderRadius: 22, background: following ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg,#6366f1,#ec4899)', border: following ? '1px solid rgba(255,255,255,0.15)' : 'none', color: following ? '#94a3b8' : 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            {following ? '✓ Following' : '+ Follow'}
          </button>
          <button onClick={() => showToast('🎵 Shuffle play!', 'success')} style={{ padding: '10px 22px', borderRadius: 22, background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>▶ Play</button>
        </div>
      </div>
      <div style={{ padding: '16px' }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#94a3b8', marginBottom: 12 }}>🔥 Popular Tracks</div>
        {TRACKS.map((t, i) => (
          <div key={t.id} onClick={() => showToast(`▶ Playing: ${t.title}`, 'success')} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer' }}>
            <span style={{ width: 22, fontSize: 13, color: '#475569', textAlign: 'center' }}>{i + 1}</span>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🎵</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9' }}>{t.title}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{t.plays} plays</div>
            </div>
            <span style={{ fontSize: 12, color: '#475569' }}>{t.duration}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SAVED COLLECTIONS ───────────────────────────────────
export function SavedCollectionsPage() {
  const navigate = useNavigate();
  const showToast = useAppStore(s => s.showToast);
  const [activeTab, setActiveTab] = useState('Posts');
  const TABS = ['Posts', 'Videos', 'Products', 'Events', 'Places'];

  const SAVED_POSTS = [
    { id: 1, author: 'Jordan Maxwell', emoji: '🌸', content: 'Photography tips for golden hour 🌅', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200', time: '2h ago' },
    { id: 2, author: 'Alex Chen', emoji: '🔥', content: 'My travel diary from Tokyo 🇯🇵', img: 'https://images.unsplash.com/photo-1524236218286-f99f70e2c4c7?w=200', time: '1d ago' },
    { id: 3, author: 'Morgan Taylor', emoji: '🎨', content: 'Digital art tutorial — Procreate beginner guide', img: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=200', time: '3d ago' },
  ];

  return (
    <div style={{ background: '#0a0a18', minHeight: '100vh', paddingBottom: 80 }}>
      <PageHeader title="Saved" emoji="🔖"
        actions={<button onClick={() => showToast('Collections coming soon!', 'info')} style={{ marginLeft: 'auto', fontSize: 22, background: 'none', border: 'none', cursor: 'pointer' }}>📁</button>}
      />
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)', overflowX: 'auto' }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: '12px 8px', fontSize: 13, fontWeight: 700, background: 'none', border: 'none', borderBottom: activeTab === tab ? '2px solid #6366f1' : '2px solid transparent', color: activeTab === tab ? '#818cf8' : '#475569', cursor: 'pointer', whiteSpace: 'nowrap', minWidth: 60 }}>{tab}</button>
        ))}
      </div>

      {activeTab === 'Posts' && (
        <div style={{ padding: '14px 16px' }}>
          {SAVED_POSTS.map(p => (
            <div key={p.id} onClick={() => navigate(`/post/${p.id}`)} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer' }}>
              <img
                src={p.img}
                alt=""
                style={{ width: 70, height: 70, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }}
                onError={e => { e.target.onerror = null; e.target.src = 'data:image/svg+xml,%3Csvg xmlns%3D%22http%3A//www.w3.org/2000/svg%22 width%3D%2270%22 height%3D%2270%22%3E%3Crect width%3D%22100%25%22 height%3D%22100%25%22 fill%3D%22%23374151%22/%3E%3Ctext x%3D%2250%25%22 y%3D%2255%25%22 dominant-baseline%3D%22middle%22 text-anchor%3D%22middle%22 font-size%3D%2228%22%3E🖼%3C/text%3E%3C/svg%3E'; }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>{p.emoji}</div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>{p.author}</span>
                </div>
                <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.4 }}>{p.content}</div>
                <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>{p.time}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab !== 'Posts' && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔖</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>No saved {activeTab.toLowerCase()} yet</div>
          <div style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>Items you save will appear here</div>
          <button onClick={() => navigate('/')} style={{ padding: '12px 28px', borderRadius: 22, background: 'linear-gradient(135deg,#6366f1,#ec4899)', border: 'none', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Explore →</button>
        </div>
      )}
    </div>
  );
}

// ─── MEDIA VIDEO PLAYER ──────────────────────────────────
export function VideoPlayerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const showToast = useAppStore(s => s.showToast);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  const VIDEO = {
    title: 'Golden Hour Photography Walk — NYC Downtown',
    author: 'Jordan Maxwell', authorEmoji: '🌸', authorUid: 'u1',
    views: '124K', likes: 8420, duration: '12:34',
    description: 'Join me on a golden hour photography walk through downtown NYC. I\'ll share my settings, composition tips, and favourite spots.',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    tags: ['Photography', 'NYC', 'Golden Hour', 'Tutorial'],
  };

  return (
    <div style={{ background: '#0a0a18', minHeight: '100vh', paddingBottom: 80 }}>
      <PageHeader title="Video" emoji="▶️" />

      {/* Video player area */}
      <div style={{ position: 'relative', background: '#000', height: 220 }}>
        <img
          src={VIDEO.thumbnail}
          alt="video"
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }}
          onError={e => { e.target.onerror = null; e.target.style.opacity = '0'; e.target.parentNode.style.background = '#1e293b'; }}
        />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button onClick={() => showToast('▶ Playing video...', 'info')} style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', fontSize: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>▶</button>
        </div>
        <div style={{ position: 'absolute', bottom: 10, right: 12, background: 'rgba(0,0,0,0.7)', borderRadius: 6, padding: '2px 8px', fontSize: 12, color: 'white', fontWeight: 700 }}>{VIDEO.duration}</div>
        {/* Progress bar */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'rgba(255,255,255,0.2)' }}>
          <div style={{ width: '35%', height: '100%', background: 'linear-gradient(135deg,#6366f1,#ec4899)' }} />
        </div>
      </div>

      {/* Video Info */}
      <div style={{ padding: '14px 16px' }}>
        <div style={{ fontWeight: 800, fontSize: 17, color: '#f1f5f9', lineHeight: 1.3, marginBottom: 8 }}>{VIDEO.title}</div>
        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 14 }}>👁️ {VIDEO.views} views · 🕐 Published 2 days ago</div>

        {/* Action Row */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button onClick={() => { setLiked(l => !l); showToast(liked ? 'Like removed' : '❤️ Liked!', 'success'); }} style={{ flex: 1, padding: '10px', borderRadius: 12, background: liked ? 'rgba(236,72,153,0.15)' : 'rgba(255,255,255,0.07)', border: liked ? '1px solid rgba(236,72,153,0.4)' : '1px solid transparent', color: liked ? '#ec4899' : '#64748b', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            {liked ? '❤️' : '🤍'} {(VIDEO.likes + (liked ? 1 : 0)).toLocaleString()}
          </button>
          <button onClick={() => { setSaved(s => !s); showToast(saved ? 'Removed' : '🔖 Saved!', 'success'); }} style={{ flex: 1, padding: '10px', borderRadius: 12, background: saved ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.07)', border: 'none', color: saved ? '#818cf8' : '#64748b', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            🔖 Save
          </button>
          <button onClick={() => showToast('🔗 Link copied!', 'success')} style={{ flex: 1, padding: '10px', borderRadius: 12, background: 'rgba(255,255,255,0.07)', border: 'none', color: '#64748b', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>📤 Share</button>
        </div>

        {/* Author */}
        <div onClick={() => navigate(`/profile/${VIDEO.authorUid}`)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: 14, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.07)', marginBottom: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{VIDEO.authorEmoji}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9' }}>{VIDEO.author}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>124K followers</div>
          </div>
          <button style={{ padding: '7px 14px', borderRadius: 14, background: 'linear-gradient(135deg,#6366f1,#ec4899)', border: 'none', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Follow</button>
        </div>

        {/* Description */}
        <div style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.7, marginBottom: 14 }}>{VIDEO.description}</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {VIDEO.tags.map(tag => (
            <span key={tag} onClick={() => navigate(`/hashtag/${tag}`)} style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', borderRadius: 10, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>#{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
