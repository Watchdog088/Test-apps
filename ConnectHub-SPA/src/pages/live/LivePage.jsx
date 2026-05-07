// PAGE 5 — LIVE STREAMING SCREEN (Complete Rewrite v2)
// ====================================================
// FIXED: LIVE-BUG-04, LIVE-BUG-05, LIVE-BUG-07, LIVE-BUG-09, LIVE-BUG-10
// FIXED: UX-LIVE-02, UX-LIVE-03, UX-LIVE-04, UX-LIVE-05, UX-LIVE-06
// FIXED: UX-LIVE-07, UX-LIVE-08, UX-LIVE-10
// FIXED: POLISH-LIVE-03, POLISH-LIVE-05, POLISH-LIVE-06, POLISH-LIVE-08
// NEW:   IMPROVE-LIVE-02 (Trending Streams row)
// NEW:   POLISH-LIVE-10 (Recently Ended / VOD section)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '@firebase/config';
import useAppStore from '@store/useAppStore';

const CATEGORIES = [
  { id: 'all',       label: 'All',      emoji: '🔴' },
  { id: 'following', label: 'Following', emoji: '👥' },
  { id: 'gaming',    label: 'Gaming',    emoji: '🎮' },
  { id: 'music',     label: 'Music',     emoji: '🎵' },
  { id: 'fitness',   label: 'Fitness',   emoji: '💪' },
  { id: 'art',       label: 'Art',       emoji: '🎨' },
  { id: 'irl',       label: 'IRL',       emoji: '📍' },
  { id: 'cooking',   label: 'Cooking',   emoji: '🍳' },
];

function getCategoryGradient(cat) {
  const map = {
    gaming:    '#1e3a8a,#3b82f6',
    music:     '#5b21b6,#8b5cf6',
    fitness:   '#064e3b,#10b981',
    art:       '#78350f,#f59e0b',
    irl:       '#831843,#ec4899',
    cooking:   '#7c2d12,#ef4444',
    education: '#1e3a5f,#3b82f6',
    talk:      '#374151,#6b7280',
  };
  return map[cat?.toLowerCase()] || '#1e293b,#334155';
}

function getCategoryEmoji(cat) {
  const map = {
    gaming:'🎮', music:'🎵', fitness:'💪', art:'🎨',
    irl:'📍', cooking:'🍳', education:'📚', talk:'💬',
  };
  return map[cat?.toLowerCase()] || '🔴';
}

function formatViewers(n) {
  if (!n) return '0';
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function formatDuration(seconds) {
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    return `${h}h ${m % 60}m`;
  }
  return `${m}m ${s}s`;
}

// ── Stream Card (16:9, avatar, category, follow, share) ─────────────────────
function StreamCard({ feed, onWatch, onShare }) {
  const showToast = useAppStore(s => s.showToast);

  return (
    <div
      onClick={onWatch}
      style={{
        borderRadius: '16px',
        overflow: 'hidden',
        background: '#1e293b',
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      {/* 16:9 Thumbnail */}
      <div style={{ position: 'relative', paddingTop: '56.25%', overflow: 'hidden' }}>
        {feed.thumbnailUrl ? (
          <img
            src={feed.thumbnailUrl}
            alt={feed.title}
            style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', objectFit:'cover' }}
          />
        ) : (
          <div style={{
            position:'absolute', top:0, left:0, width:'100%', height:'100%',
            background: `linear-gradient(135deg, ${getCategoryGradient(feed.category)})`,
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:'36px',
          }}>
            {getCategoryEmoji(feed.category)}
          </div>
        )}

        {/* LIVE badge */}
        <div style={{
          position:'absolute', top:'6px', left:'6px',
          background:'#ef4444', borderRadius:'5px',
          fontSize:'8px', fontWeight:800, color:'white', padding:'2px 6px', letterSpacing:'0.05em',
        }}>
          ● LIVE
        </div>

        {/* Viewer count */}
        <div style={{
          position:'absolute', bottom:'6px', right:'6px',
          background:'rgba(0,0,0,0.72)', borderRadius:'8px',
          fontSize:'10px', fontWeight:700, color:'white', padding:'2px 7px',
        }}>
          👁️ {formatViewers(feed.viewerCount)}
        </div>

        {/* Streamer avatar */}
        <div style={{
          position:'absolute', bottom:'4px', left:'6px',
          width:'28px', height:'28px', borderRadius:'50%',
          border:'2px solid #ef4444',
          background:'linear-gradient(135deg,#6366f1,#ec4899)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:'12px', overflow:'hidden', flexShrink:0,
        }}>
          {feed.userAvatar
            ? <img src={feed.userAvatar} alt={feed.userName} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            : (feed.userName?.[0] || '?').toUpperCase()
          }
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding:'8px 10px 10px' }}>
        <div style={{ fontWeight:700, color:'#f1f5f9', fontSize:'12px', marginBottom:'2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {feed.title || 'Untitled Stream'}
        </div>
        <div style={{ color:'#64748b', fontSize:'10px', marginBottom:'5px' }}>{feed.userName}</div>

        {/* Category pill */}
        {feed.category && (
          <div style={{
            display:'inline-block',
            background:'rgba(99,102,241,0.15)', color:'#818cf8',
            borderRadius:'7px', fontSize:'9px', fontWeight:700, padding:'2px 7px', marginBottom:'6px',
          }}>
            {getCategoryEmoji(feed.category)} {feed.category}
          </div>
        )}

        {/* Actions — Follow + Share */}
        <div style={{ display:'flex', gap:'6px' }}>
          <button
            onClick={e => { e.stopPropagation(); showToast(`Following ${feed.userName}`); }}
            style={{
              flex:1, background:'rgba(99,102,241,0.15)', border:'none',
              borderRadius:'8px', padding:'5px', color:'#818cf8',
              fontSize:'10px', fontWeight:700, cursor:'pointer',
            }}
          >
            + Follow
          </button>
          <button
            onClick={e => { e.stopPropagation(); onShare(); }}
            style={{
              background:'rgba(16,185,129,0.15)', border:'none',
              borderRadius:'8px', padding:'5px 9px',
              color:'#10b981', fontSize:'13px', cursor:'pointer',
            }}
          >
            ↗️
          </button>
        </div>
      </div>
    </div>
  );
}

// ── VOD Card (Recently Ended) — POLISH-LIVE-10 ───────────────────────────────
function VODCard({ vod, onWatch }) {
  return (
    <div
      onClick={onWatch}
      style={{
        minWidth:'200px', borderRadius:'14px', overflow:'hidden',
        background:'#1e293b', cursor:'pointer', flexShrink:0,
      }}
    >
      {/* 16:9 thumbnail */}
      <div style={{ position:'relative', paddingTop:'56.25%' }}>
        {vod.thumbnailUrl ? (
          <img
            src={vod.thumbnailUrl}
            alt={vod.title}
            style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', objectFit:'cover' }}
          />
        ) : (
          <div style={{
            position:'absolute', top:0, left:0, width:'100%', height:'100%',
            background:`linear-gradient(135deg, ${getCategoryGradient(vod.category)})`,
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px',
          }}>
            {getCategoryEmoji(vod.category)}
          </div>
        )}
        {/* VOD badge */}
        <div style={{
          position:'absolute', top:'6px', left:'6px',
          background:'rgba(0,0,0,0.7)', borderRadius:'5px',
          fontSize:'8px', fontWeight:800, color:'#94a3b8', padding:'2px 6px',
        }}>
          ▶ VOD
        </div>
        {/* Duration */}
        {vod.durationSeconds > 0 && (
          <div style={{
            position:'absolute', bottom:'6px', right:'6px',
            background:'rgba(0,0,0,0.72)', borderRadius:'6px',
            fontSize:'9px', fontWeight:700, color:'white', padding:'2px 6px',
          }}>
            {formatDuration(vod.durationSeconds)}
          </div>
        )}
      </div>

      <div style={{ padding:'8px 10px' }}>
        <div style={{ fontWeight:600, color:'#f1f5f9', fontSize:'11px', marginBottom:'2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {vod.title || 'Untitled'}
        </div>
        <div style={{ color:'#64748b', fontSize:'10px' }}>
          {vod.userName} • {formatViewers(vod.peakViewerCount || vod.viewerCount)} peak viewers
        </div>
      </div>
    </div>
  );
}

// ── Trending Stream Card (compact horizontal) — IMPROVE-LIVE-02 ──────────────
function TrendingCard({ feed, rank, onWatch }) {
  return (
    <div
      onClick={onWatch}
      style={{
        display:'flex', alignItems:'center', gap:'12px',
        background:'#1e293b', borderRadius:'14px', padding:'10px 12px',
        cursor:'pointer',
      }}
    >
      {/* Rank */}
      <div style={{
        width:'24px', height:'24px', borderRadius:'50%', flexShrink:0,
        background: rank === 1 ? 'linear-gradient(135deg,#f59e0b,#ef4444)'
                  : rank === 2 ? 'linear-gradient(135deg,#6366f1,#8b5cf6)'
                  : rank === 3 ? 'linear-gradient(135deg,#10b981,#3b82f6)'
                  : '#334155',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:'11px', fontWeight:800, color:'white',
      }}>
        {rank}
      </div>

      {/* Thumbnail mini */}
      <div style={{
        width:'52px', height:'36px', borderRadius:'8px', flexShrink:0, overflow:'hidden',
        background:`linear-gradient(135deg, ${getCategoryGradient(feed.category)})`,
        display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px',
      }}>
        {feed.thumbnailUrl
          ? <img src={feed.thumbnailUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          : getCategoryEmoji(feed.category)
        }
      </div>

      {/* Info */}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontWeight:700, color:'#f1f5f9', fontSize:'12px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {feed.title || 'Untitled Stream'}
        </div>
        <div style={{ color:'#64748b', fontSize:'10px' }}>{feed.userName}</div>
      </div>

      {/* Viewers */}
      <div style={{ textAlign:'right', flexShrink:0 }}>
        <div style={{ color:'#ef4444', fontWeight:700, fontSize:'11px' }}>🔴 {formatViewers(feed.viewerCount)}</div>
        <div style={{ color:'#64748b', fontSize:'9px' }}>viewers</div>
      </div>
    </div>
  );
}

// ── Main LivePage ────────────────────────────────────────────────────────────
export default function LivePage() {
  const navigate    = useNavigate();
  const showToast   = useAppStore(s => s.showToast);

  const [activeCategory, setActiveCategory] = useState('all');
  const [liveFeeds, setLiveFeeds]           = useState([]);
  const [friendsLive, setFriendsLive]       = useState([]);
  const [recentVODs, setRecentVODs]         = useState([]);
  const [loading, setLoading]               = useState(true);
  const [vodLoading, setVodLoading]         = useState(true);

  // ── Firestore real-time query — live streams ──────────────────────────────
  useEffect(() => {
    let q;
    try {
      q = query(
        collection(db, 'streams'),
        where('status', '==', 'live'),
        orderBy('viewerCount', 'desc'),
        limit(20)
      );
    } catch {
      setLoading(false);
      return;
    }

    const unsub = onSnapshot(
      q,
      snap => {
        const streams = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setLiveFeeds(streams);
        setFriendsLive(streams.slice(0, 4));
        setLoading(false);
      },
      err => {
        console.error('[LivePage] Firestore error:', err);
        setLoading(false);
      }
    );

    return unsub;
  }, []);

  // ── Firestore query — recently ended (VOD) — POLISH-LIVE-10 ─────────────
  useEffect(() => {
    let q;
    try {
      q = query(
        collection(db, 'streams'),
        where('status', '==', 'ended'),
        orderBy('endedAt', 'desc'),
        limit(10)
      );
    } catch {
      setVodLoading(false);
      return;
    }

    const unsub = onSnapshot(
      q,
      snap => {
        const vods = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setRecentVODs(vods);
        setVodLoading(false);
      },
      err => {
        console.error('[LivePage VOD] Firestore error:', err);
        setVodLoading(false);
      }
    );

    return unsub;
  }, []);

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filteredFeeds =
    activeCategory === 'all' || activeCategory === 'following'
      ? liveFeeds
      : liveFeeds.filter(f => f.category?.toLowerCase() === activeCategory);

  // ── Top 5 by viewerCount for trending row — IMPROVE-LIVE-02 ──────────────
  const trendingFeeds = [...liveFeeds]
    .sort((a, b) => (b.viewerCount || 0) - (a.viewerCount || 0))
    .slice(0, 5);

  // ── Share handler ─────────────────────────────────────────────────────────
  const handleShare = feed => {
    const url = `${window.location.origin}/live/watch/${feed.id}`;
    if (navigator.share) {
      navigator.share({ title: `${feed.userName} is LIVE: ${feed.title}`, url }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(url);
      showToast('🔗 Link copied!');
    }
  };

  return (
    <div style={{ background:'var(--bg-primary, #0a0a18)', minHeight:'100vh', paddingBottom:'110px' }}>

      {/* ── Header ── */}
      <div style={{
        padding:'16px', borderBottom:'1px solid #1e293b',
        display:'flex', alignItems:'center', justifyContent:'space-between',
      }}>
        <span style={{ fontSize:'20px', fontWeight:700, color:'#f1f5f9' }}>🔴 Live</span>
        <div style={{ display:'flex', gap:'8px' }}>
          <button onClick={() => navigate('/search')}       style={iconBtn}>🔍</button>
          <button onClick={() => navigate('/notifications')} style={iconBtn}>🔔</button>
          <button onClick={() => navigate('/settings')}     style={iconBtn}>⚙️</button>
        </div>
      </div>

      {/* ── Tab Switcher ── */}
      <div style={{ display:'flex', padding:'12px 16px', gap:'10px', borderBottom:'1px solid #1e293b' }}>
        <button
          style={{
            flex:1, padding:'10px', borderRadius:'12px', fontWeight:700, fontSize:'14px',
            cursor:'pointer', border:'none',
            background:'linear-gradient(135deg,#ef4444,#f59e0b)', color:'white',
          }}
        >
          📺 Watch
        </button>
        <button
          onClick={() => navigate('/live/setup')}
          style={{
            flex:1, padding:'10px', borderRadius:'12px', fontWeight:700, fontSize:'14px',
            cursor:'pointer', border:'none',
            background:'#1e293b', color:'#94a3b8',
          }}
        >
          🔴 Go Live +
        </button>
      </div>

      {/* ── Friends Live ── */}
      {friendsLive.length > 0 && (
        <div style={{ padding:'14px 16px 0' }}>
          <div style={sectionLabel}>👥 Friends Live</div>
          <div style={{ display:'flex', gap:'14px', overflowX:'auto', paddingBottom:'12px', scrollbarWidth:'none' }}>
            {friendsLive.map(feed => (
              <div
                key={feed.id}
                onClick={() => navigate(`/live/watch/${feed.id}`)}
                style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'5px', cursor:'pointer', minWidth:'60px' }}
              >
                <div style={{ position:'relative' }}>
                  <div style={{
                    width:'58px', height:'58px', borderRadius:'50%',
                    background:'linear-gradient(135deg,#ef4444,#f59e0b)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:'22px', overflow:'hidden',
                    border:'3px solid #ef4444',
                    animation:'livePulse 2s ease-in-out infinite',
                  }}>
                    {feed.userAvatar
                      ? <img src={feed.userAvatar} alt={feed.userName} style={{ width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover' }} />
                      : (feed.userName?.[0] || '?').toUpperCase()
                    }
                  </div>
                  <div style={{
                    position:'absolute', bottom:'-3px', left:'50%', transform:'translateX(-50%)',
                    background:'#ef4444', borderRadius:'4px',
                    fontSize:'7px', fontWeight:800, color:'white', padding:'1px 5px',
                  }}>
                    LIVE
                  </div>
                </div>
                <span style={{ fontSize:'10px', color:'#94a3b8', textAlign:'center', maxWidth:'60px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {feed.userName?.split(' ')[0] || 'User'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Category Filter Tabs ── */}
      <div style={{
        display:'flex', gap:'8px', overflowX:'auto',
        padding:'12px 16px', scrollbarWidth:'none', borderBottom:'1px solid #1e293b',
      }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            style={{
              padding:'6px 14px', borderRadius:'20px', border:'none',
              cursor:'pointer', whiteSpace:'nowrap', fontWeight:600, fontSize:'12px',
              background: activeCategory === cat.id ? 'linear-gradient(135deg,#ef4444,#f59e0b)' : '#1e293b',
              color:      activeCategory === cat.id ? 'white' : '#94a3b8',
              flexShrink: 0,
            }}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* ── 🔥 Trending Streams Row — IMPROVE-LIVE-02 ── */}
      {trendingFeeds.length > 0 && (
        <div style={{ padding:'16px 16px 0' }}>
          <div style={sectionLabel}>🔥 Trending Now</div>
          <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'4px' }}>
            {trendingFeeds.map((feed, i) => (
              <TrendingCard
                key={feed.id}
                feed={feed}
                rank={i + 1}
                onWatch={() => navigate(`/live/watch/${feed.id}`)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Live Feed Grid ── */}
      <div style={{ padding:'16px' }}>
        <div style={sectionLabel}>
          🔴 Live Now{filteredFeeds.length > 0 && ` (${filteredFeeds.length})`}
        </div>

        {loading && (
          <div style={{ textAlign:'center', padding:'40px', color:'#64748b' }}>
            Loading live streams…
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredFeeds.length === 0 && (
          <div style={{
            textAlign:'center', padding:'48px 16px',
            background:'#1e293b', borderRadius:'20px',
          }}>
            <div style={{ fontSize:'48px', marginBottom:'12px' }}>🔴</div>
            <div style={{ fontWeight:700, color:'#f1f5f9', fontSize:'16px', marginBottom:'8px' }}>
              No streams live right now
            </div>
            <div style={{ color:'#64748b', fontSize:'13px', marginBottom:'20px' }}>
              Be the first to go live!
            </div>
            <button
              onClick={() => navigate('/live/setup')}
              style={{
                background:'linear-gradient(135deg,#ef4444,#f59e0b)',
                border:'none', borderRadius:'16px', padding:'12px 28px',
                color:'white', fontWeight:800, fontSize:'14px', cursor:'pointer',
              }}
            >
              🔴 Go Live Now →
            </button>
          </div>
        )}

        {/* 2-column stream card grid */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
          {filteredFeeds.map(feed => (
            <StreamCard
              key={feed.id}
              feed={feed}
              onWatch={() => navigate(`/live/watch/${feed.id}`)}
              onShare={() => handleShare(feed)}
            />
          ))}
        </div>
      </div>

      {/* ── Recently Ended / VOD Section — POLISH-LIVE-10 ── */}
      {!vodLoading && recentVODs.length > 0 && (
        <div style={{ padding:'0 16px 16px' }}>
          <div style={sectionLabel}>📼 Recently Ended — Watch Replay</div>
          <div style={{ display:'flex', gap:'12px', overflowX:'auto', paddingBottom:'8px', scrollbarWidth:'none' }}>
            {recentVODs.map(vod => (
              <VODCard
                key={vod.id}
                vod={vod}
                onWatch={() => {
                  if (vod.vodUrl) {
                    navigate(`/live/watch/${vod.id}?vod=true`);
                  } else {
                    showToast('Replay not available for this stream yet');
                  }
                }}
              />
            ))}
          </div>

          {/* Empty VOD hint */}
          {recentVODs.every(v => !v.vodUrl) && (
            <div style={{ color:'#475569', fontSize:'11px', marginTop:'4px', fontStyle:'italic' }}>
              💡 VOD recordings are saved automatically when streams end. Connect cloud DVR (AWS IVS / Mux) to enable playback.
            </div>
          )}
        </div>
      )}

      {/* ── Floating "Go Live" FAB ── */}
      <button
        onClick={() => navigate('/live/setup')}
        style={{
          position:'fixed', bottom:'88px', right:'18px', zIndex:100,
          background:'linear-gradient(135deg,#ef4444,#f59e0b)',
          border:'none', borderRadius:'28px', padding:'13px 20px',
          color:'white', fontWeight:800, fontSize:'14px', cursor:'pointer',
          boxShadow:'0 4px 24px rgba(239,68,68,0.45)',
          display:'flex', alignItems:'center', gap:'8px',
        }}
      >
        🔴 Go Live
      </button>

      <style>{`
        @keyframes livePulse {
          0%,100% { box-shadow:0 0 0 2px rgba(239,68,68,0.35); }
          50%      { box-shadow:0 0 0 8px rgba(239,68,68,0.1);  }
        }
      `}</style>
    </div>
  );
}

// ── Shared micro-style helpers ────────────────────────────────────────────────
const iconBtn = {
  background:'none', border:'none',
  color:'#94a3b8', fontSize:'20px', cursor:'pointer',
};
const sectionLabel = {
  fontSize:'12px', fontWeight:700, color:'#64748b',
  textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'10px',
};
