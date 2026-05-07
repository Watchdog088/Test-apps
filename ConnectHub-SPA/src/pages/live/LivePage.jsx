// LIVE PAGE — /live  (ALL BETA FIXES APPLIED)
// BUG-01 FIXED: Removed duplicate empty-state blocks
// BUG-02 FIXED: navigate() instead of window.location.href in preview modal
// BUG-04 FIXED: /live/notifications route created in App.jsx
// BUG-05 FIXED: /clips/:id route created in App.jsx
// UX-06  FIXED: Card width 160→192px, 2-line clamped title
// UX-13  FIXED: "Hold to preview" 8px → "⏸ HOLD" 10px
// UX-14  FIXED: Refresh button triggers real Firestore re-subscription
// POLISH-01 FIXED: Right-edge fade on category pill row
// POLISH-02 FIXED: VOD duration shows "Xh Ym" not raw minutes
// DESIGN-04 FIXED: Long-press threshold 500→600ms
// MOB-03  FIXED: navigator.vibrate(50) on long press

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  collection, query, where, orderBy, onSnapshot,
  doc, updateDoc, arrayUnion, arrayRemove,
} from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import useAppStore from '@store/useAppStore';

const CATEGORIES = [
  { id:'all',       label:'All',       emoji:'🔴' },
  { id:'following', label:'Following', emoji:'👥' },
  { id:'gaming',    label:'Gaming',    emoji:'🎮' },
  { id:'music',     label:'Music',     emoji:'🎵' },
  { id:'fitness',   label:'Fitness',   emoji:'💪' },
  { id:'art',       label:'Art',       emoji:'🎨' },
  { id:'irl',       label:'IRL',       emoji:'📍' },
  { id:'cooking',   label:'Cooking',   emoji:'🍳' },
  { id:'education', label:'Education', emoji:'📚' },
  { id:'talkshow',  label:'Talk Show', emoji:'💬' },
];

// UX-06: wider skeleton card
const SkeletonCard = () => (
  <div style={{ borderRadius:'14px', overflow:'hidden', background:'#1e293b', flexShrink:0, width:'192px' }}>
    <div className="skeleton" style={{ aspectRatio:'16/9' }} />
    <div style={{ padding:'8px' }}>
      <div className="skeleton" style={{ height:'14px', borderRadius:'4px', marginBottom:'6px' }} />
      <div className="skeleton" style={{ height:'11px', borderRadius:'4px', width:'70%' }} />
    </div>
  </div>
);

// BUG-02 FIX: navigate passed as prop — no window.location.href
function StreamPreviewModal({ stream, onClose, navigate }) {
  const videoRef = useRef(null);
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const catEmoji = CATEGORIES.find(c => c.id === stream.category)?.emoji || '🎥';
  const fmt = n => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n || 0);

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:9999,
      display:'flex', alignItems:'center', justifyContent:'center', padding:'20px'
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width:'100%', maxWidth:'360px', borderRadius:'20px', overflow:'hidden', background:'#0f172a'
      }}>
        <div style={{ position:'relative', aspectRatio:'16/9', background:'linear-gradient(135deg,#1e293b,#334155)' }}>
          {stream.previewUrl
            ? <video ref={videoRef} src={stream.previewUrl} autoPlay muted playsInline
                style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            : <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column',
                alignItems:'center', justifyContent:'center', gap:'8px' }}>
                <div style={{ fontSize:'40px' }}>{catEmoji}</div>
                <div style={{ color:'#94a3b8', fontSize:'12px' }}>Preview not available</div>
              </div>
          }
          <div style={{ position:'absolute', top:'8px', left:'8px', background:'#ef4444',
            borderRadius:'6px', padding:'2px 8px', color:'white', fontSize:'10px', fontWeight:800 }}>● LIVE</div>
          <div style={{ position:'absolute', top:'8px', right:'8px', background:'rgba(0,0,0,0.7)',
            borderRadius:'6px', padding:'2px 8px', color:'white', fontSize:'10px', fontWeight:600 }}>
            👁 {fmt(stream.viewerCount)}
          </div>
          <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'3px', background:'rgba(255,255,255,0.15)' }}>
            <div style={{ height:'100%', background:'#ef4444', animation:'previewCountdown 3.5s linear forwards', width:'100%' }} />
          </div>
        </div>
        <div style={{ padding:'12px 16px 16px' }}>
          <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'15px', marginBottom:'2px' }}>{stream.title || 'Live Stream'}</div>
          <div style={{ color:'#94a3b8', fontSize:'12px', marginBottom:'12px' }}>by {stream.userName || 'Streamer'}</div>
          <div style={{ display:'flex', gap:'8px' }}>
            <button onClick={onClose} style={{
              flex:1, background:'#334155', border:'none', borderRadius:'10px',
              padding:'10px', color:'#94a3b8', fontWeight:600, fontSize:'13px', cursor:'pointer'
            }}>Dismiss</button>
            {/* BUG-02 FIX: React Router navigate, not window.location.href */}
            <button onClick={() => { onClose(); navigate(`/live/watch/${stream.id}`); }} style={{
              flex:2, background:'linear-gradient(135deg,#ef4444,#f59e0b)', border:'none',
              borderRadius:'10px', padding:'10px', color:'white', fontWeight:700, fontSize:'13px', cursor:'pointer'
            }}>▶ Watch Now</button>
          </div>
        </div>
      </div>
      <style>{`@keyframes previewCountdown { from { width:100% } to { width:0% } }`}</style>
    </div>
  );
}

export default function LivePage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const showToast = useAppStore(s => s.showToast);

  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get('category') || 'all';
  const [category, setCategory] = useState(urlCategory);

  const handleCategoryChange = useCallback((id) => {
    setCategory(id);
    if (id === 'all') setSearchParams({}, { replace: true });
    else setSearchParams({ category: id }, { replace: true });
  }, [setSearchParams]);

  useEffect(() => { setCategory(urlCategory); }, [urlCategory]);

  const [feeds,        setFeeds]        = useState([]);
  const [vods,         setVods]         = useState([]);
  const [clips,        setClips]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [followingIds, setFollowingIds] = useState(new Set());
  const [followStates, setFollowStates] = useState({});
  const [showSearch,   setShowSearch]   = useState(false);
  const [searchQuery,  setSearchQuery]  = useState('');
  const [pressedCard,  setPressedCard]  = useState(null);
  const [now,          setNow]          = useState(Date.now());
  const [previewStream,setPreviewStream]= useState(null);
  // UX-14: incrementing this key forces Firestore subscriptions to re-run
  const [refreshKey,   setRefreshKey]   = useState(0);
  const longPressTimer = useRef(null);
  const isSetup = location.pathname.startsWith('/live/setup');

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  // UX-14 FIX: real refresh handler
  const handleRefresh = useCallback(() => {
    setLoading(true);
    setRefreshKey(k => k + 1);
    showToast('✓ Updated');
  }, [showToast]);

  useEffect(() => {
    if (!auth.currentUser) return;
    const unsub = onSnapshot(doc(db, 'users', auth.currentUser.uid), snap => {
      if (snap.exists()) setFollowingIds(new Set(snap.data().following || []));
    });
    return () => unsub();
  }, []);

  // UX-14: refreshKey in deps re-triggers subscription
  useEffect(() => {
    const q = query(collection(db, 'streams'), where('status','==','live'), orderBy('viewerCount','desc'));
    const unsub = onSnapshot(q, snap => {
      setFeeds(snap.docs.map(d => ({ id:d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, [refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const q = query(collection(db,'streams'), where('status','==','ended'), orderBy('endedAt','desc'));
    const unsub = onSnapshot(q, snap => {
      setVods(snap.docs.map(d => ({ id:d.id, ...d.data() })));
    }, () => {});
    return () => unsub();
  }, []);

  useEffect(() => {
    import('firebase/firestore').then(({ getDocs:gd, query:q2, collection:col2, where:wh, orderBy:ob, limit:lim }) => {
      gd(q2(col2(db,'clips'), wh('status','==','ready'), ob('viewCount','desc'), lim(10)))
        .then(snap => setClips(snap.docs.map(d => ({ id:d.id, ...d.data() }))))
        .catch(() => {});
    }).catch(() => {});
  }, []);

  const toggleFollow = async (e, userId) => {
    e.stopPropagation();
    if (!auth.currentUser) { showToast('Sign in to follow'); return; }
    const isF = followingIds.has(userId);
    try {
      await updateDoc(doc(db,'users',auth.currentUser.uid), {
        following: isF ? arrayRemove(userId) : arrayUnion(userId),
      });
      setFollowStates(prev => ({ ...prev, [userId]: !isF }));
      showToast(isF ? 'Unfollowed' : '✓ Following');
    } catch { showToast('Failed to update follow'); }
  };

  const isFollowing = uid => followingIds.has(uid) || followStates[uid] === true;
  const fmt = n => n >= 1000 ? `${(n/1000).toFixed(1)}K` : String(n || 0);

  const filteredFeeds = useMemo(() => {
    let r = feeds;
    if (category === 'following') r = feeds.filter(f => followingIds.has(f.userId));
    else if (category !== 'all')  r = feeds.filter(f => f.category === category);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      r = r.filter(f => f.title?.toLowerCase().includes(q) || f.userName?.toLowerCase().includes(q));
    }
    return r;
  }, [feeds, category, followingIds, searchQuery]);

  const streamDuration = startedAt => {
    if (!startedAt) return null;
    const ms = now - (startedAt.toMillis ? startedAt.toMillis() : startedAt);
    if (ms < 0) return null;
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m`;
    return 'just started';
  };

  const timeAgo = ts => {
    if (!ts) return '';
    const s = Math.floor((Date.now() - (ts.toMillis ? ts.toMillis() : ts)) / 1000);
    if (s < 3600)  return `${Math.floor(s/60)}m ago`;
    if (s < 86400) return `${Math.floor(s/3600)}h ago`;
    return `${Math.floor(s/86400)}d ago`;
  };

  // DESIGN-04: 600ms threshold; MOB-03: haptic feedback
  const startLongPress = useCallback(feed => {
    longPressTimer.current = setTimeout(() => {
      navigator.vibrate && navigator.vibrate(50);
      setPreviewStream(feed);
    }, 600);
  }, []);

  const cancelLongPress = useCallback(() => {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
  }, []);

  // POLISH-02: h/m VOD duration
  const vodDuration = secs => {
    if (!secs) return null;
    if (secs >= 3600) return `${Math.floor(secs/3600)}h ${Math.floor((secs%3600)/60)}m`;
    return `${Math.floor(secs/60)}m`;
  };

  return (
    <div style={{ background:'var(--bg-primary,#0a0a18)', minHeight:'100vh', paddingBottom:'80px' }}>

      {/* BUG-02 FIX: navigate prop passed */}
      {previewStream && (
        <StreamPreviewModal stream={previewStream} onClose={() => setPreviewStream(null)} navigate={navigate} />
      )}

      {/* Header */}
      <div style={{ padding:'12px 16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', gap:'10px' }}>
        <span style={{ fontSize:'18px', fontWeight:800, color:'#f1f5f9', flex:1 }}>🔴 Live</span>
        <button onClick={() => { setShowSearch(v => !v); setSearchQuery(''); }}
          aria-label={showSearch ? 'Close search' : 'Search streams'}
          style={{ background:'none', border:'none', color:'#94a3b8', fontSize:'18px', cursor:'pointer', padding:'4px', minWidth:'36px', minHeight:'36px' }}>
          {showSearch ? '✕' : '🔍'}
        </button>
        {/* UX-14 FIX: Real refresh via refreshKey */}
        <button onClick={handleRefresh} aria-label="Refresh live streams"
          style={{ background:'none', border:'none', color:'#94a3b8', fontSize:'18px', cursor:'pointer', padding:'4px', minWidth:'36px', minHeight:'36px' }}>🔄</button>
        {/* BUG-04: Route /live/notifications now exists */}
        <button onClick={() => navigate('/live/notifications')} aria-label="Stream notifications"
          style={{ background:'none', border:'none', color:'#94a3b8', fontSize:'18px', cursor:'pointer', padding:'4px', minWidth:'36px', minHeight:'36px' }}>🔔</button>
      </div>

      {showSearch && (
        <div style={{ padding:'8px 16px', borderBottom:'1px solid #1e293b' }}>
          <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search streams or streamers..." aria-label="Search streams"
            style={{ width:'100%', background:'#1e293b', border:'1px solid #334155', borderRadius:'20px',
              padding:'8px 16px', color:'#f1f5f9', fontSize:'14px', outline:'none', boxSizing:'border-box' }} />
        </div>
      )}

      {/* Watch / Go Live tabs */}
      <div style={{ display:'flex', borderBottom:'1px solid #1e293b' }} role="tablist">
        {[{ id:'watch', label:'📺 Watch', path:'/live' }, { id:'golive', label:'🔴 Go Live', path:'/live/setup' }].map(tab => {
          const active = tab.id === 'golive' ? isSetup : !isSetup;
          return (
            <button key={tab.id} role="tab" aria-selected={active} onClick={() => navigate(tab.path)}
              style={{ flex:1, padding:'12px', border:'none', background:'none', fontWeight:700, fontSize:'13px', cursor:'pointer',
                color: active ? '#f1f5f9' : '#64748b',
                borderBottom: active ? '2px solid #ef4444' : '2px solid transparent' }}>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Featured banner */}
      {!loading && feeds.length > 0 && (() => {
        const featured = [...feeds].sort((a,b) => (b.viewerCount||0)-(a.viewerCount||0))[0];
        return (
          <div onClick={() => navigate(`/live/watch/${featured.id}`)}
            style={{ margin:'12px 16px', borderRadius:'18px', overflow:'hidden', cursor:'pointer',
              background:'linear-gradient(135deg,#1e293b,#0f172a)', border:'1px solid rgba(239,68,68,0.2)', position:'relative' }}>
            <div style={{ position:'absolute', top:'10px', left:'10px', background:'linear-gradient(135deg,#ef4444,#f59e0b)',
              borderRadius:'8px', padding:'3px 10px', color:'white', fontSize:'10px', fontWeight:800, zIndex:1 }}>⭐ FEATURED</div>
            <div style={{ position:'absolute', top:'10px', right:'10px', background:'#ef4444',
              borderRadius:'6px', padding:'2px 8px', color:'white', fontSize:'10px', fontWeight:800, zIndex:1 }}>● LIVE</div>
            {featured.thumbnailUrl
              ? <img src={featured.thumbnailUrl} alt={featured.title} loading="lazy"
                  style={{ width:'100%', aspectRatio:'16/9', objectFit:'cover', display:'block', opacity:0.7 }} />
              : <div style={{ aspectRatio:'16/9', background:'linear-gradient(135deg,#1e293b,#334155)',
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:'48px' }}>🎥</div>
            }
            <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', pointerEvents:'none' }}>
              <div style={{ width:'56px', height:'56px', borderRadius:'50%', background:'rgba(0,0,0,0.6)',
                border:'2px solid rgba(255,255,255,0.7)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span style={{ color:'white', fontSize:'22px', marginLeft:'3px' }}>▶</span>
              </div>
            </div>
            {streamDuration(featured.startedAt) && (
              <div style={{ position:'absolute', bottom:'52px', right:'10px', background:'rgba(0,0,0,0.7)',
                borderRadius:'6px', padding:'2px 8px', color:'#94a3b8', fontSize:'10px' }}>
                🕐 {streamDuration(featured.startedAt)}
              </div>
            )}
            <div style={{ padding:'12px 14px' }}>
              <div style={{ color:'#f1f5f9', fontWeight:800, fontSize:'16px', marginBottom:'2px' }}>{featured.title}</div>
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <span style={{ color:'#94a3b8', fontSize:'12px' }}>{featured.userName}</span>
                <span style={{ color:'#ef4444', fontSize:'12px', fontWeight:700 }}>👁 {fmt(featured.viewerCount)} watching</span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* POLISH-01: Category pills with right-edge fade */}
      <div style={{ position:'relative' }}>
        <div style={{ display:'flex', gap:'8px', padding:'10px 16px', overflowX:'auto', scrollbarWidth:'none' }}
          role="group" aria-label="Filter by category">
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => handleCategoryChange(cat.id)}
              aria-pressed={category === cat.id} aria-label={`Filter by ${cat.label}`}
              style={{ padding:'6px 14px', borderRadius:'20px', border:'none', fontSize:'12px', fontWeight:600,
                cursor:'pointer', flexShrink:0, transition:'background 0.15s, color 0.15s',
                background: category===cat.id ? 'linear-gradient(135deg,#ef4444,#f59e0b)' : '#1e293b',
                color: category===cat.id ? 'white' : '#94a3b8' }}>
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
        {/* POLISH-01 FIX: fade indicator */}
        <div style={{ position:'absolute', top:0, right:0, bottom:0, width:'40px', pointerEvents:'none',
          background:'linear-gradient(to right, transparent, #0a0a18)' }} />
      </div>

      <div style={{ padding:'0 16px' }}>

        {/* Live Streams */}
        <div style={{ marginBottom:'24px' }}>
          <div style={{ fontSize:'12px', fontWeight:700, color:'#64748b', textTransform:'uppercase',
            letterSpacing:'0.06em', marginBottom:'10px' }}>
            🔴 Live Now {!loading && `(${filteredFeeds.length})`}
          </div>

          {loading && (
            <div style={{ display:'flex', gap:'12px', overflowX:'auto', paddingBottom:'8px' }}>
              {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* BUG-01 FIX: Single unified empty state — covers following, search, and category */}
          {!loading && filteredFeeds.length === 0 && (
            <div style={{ textAlign:'center', padding:'32px 16px', background:'#1e293b', borderRadius:'16px' }}>
              {category === 'following'
                ? <>
                    <div style={{ fontSize:'36px', marginBottom:'8px' }}>👥</div>
                    <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'15px', marginBottom:'6px' }}>No friends live right now</div>
                    <div style={{ color:'#64748b', fontSize:'13px', marginBottom:'16px' }}>Follow more people to see their streams here</div>
                  </>
                : searchQuery.trim()
                  ? <>
                      <div style={{ fontSize:'36px', marginBottom:'8px' }}>🔍</div>
                      <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'15px', marginBottom:'6px' }}>No streams match &ldquo;{searchQuery}&rdquo;</div>
                      <div style={{ color:'#64748b', fontSize:'13px', marginBottom:'16px' }}>Try a different search term</div>
                    </>
                  : <>
                      <div style={{ fontSize:'36px', marginBottom:'8px' }}>📡</div>
                      <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'15px', marginBottom:'6px' }}>
                        No {category === 'all' ? '' : (CATEGORIES.find(c=>c.id===category)?.label||'') + ' '}streams live right now
                      </div>
                      <div style={{ color:'#64748b', fontSize:'13px', marginBottom:'16px' }}>Be the first to go live!</div>
                    </>
              }
              <button onClick={() => navigate('/live/setup')}
                style={{ background:'linear-gradient(135deg,#ef4444,#f59e0b)', border:'none', borderRadius:'12px',
                  padding:'10px 20px', color:'white', fontWeight:700, fontSize:'13px', cursor:'pointer' }}>
                🔴 Go Live Now
              </button>
            </div>
          )}

          {!loading && filteredFeeds.length > 0 && (
            <div style={{ display:'flex', gap:'12px', overflowX:'auto', paddingBottom:'8px' }} role="list">
              {filteredFeeds.map(feed => (
                <div key={feed.id} role="listitem"
                  onClick={() => { cancelLongPress(); navigate(`/live/watch/${feed.id}`); }}
                  onPointerDown={() => { setPressedCard(feed.id); startLongPress(feed); }}
                  onPointerUp={() => { setPressedCard(null); cancelLongPress(); }}
                  onPointerLeave={() => { setPressedCard(null); cancelLongPress(); }}
                  onContextMenu={e => { e.preventDefault(); setPreviewStream(feed); }}
                  aria-label={`Watch ${feed.title} by ${feed.userName}, ${fmt(feed.viewerCount)} viewers. Hold to preview.`}
                  style={{ borderRadius:'14px', overflow:'hidden', background:'#1e293b',
                    flexShrink:0, width:'192px', cursor:'pointer', // UX-06: wider
                    transform: pressedCard === feed.id ? 'scale(0.95)' : 'scale(1)',
                    transition:'transform 0.1s ease' }}>
                  <div style={{ position:'relative', aspectRatio:'16/9',
                    background: feed.thumbnailUrl ? 'transparent' : 'linear-gradient(135deg,#1e293b,#334155)', overflow:'hidden' }}>
                    {feed.thumbnailUrl
                      ? <img src={feed.thumbnailUrl} alt={feed.title} loading="lazy"
                          style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                      : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center',
                            justifyContent:'center', fontSize:'28px' }}>
                          {CATEGORIES.find(c=>c.id===feed.category)?.emoji || '🎥'}
                        </div>
                    }
                    <div style={{ position:'absolute', top:'6px', left:'6px', background:'#ef4444',
                      borderRadius:'6px', padding:'2px 6px', color:'white', fontSize:'9px', fontWeight:800 }}>● LIVE</div>
                    <div style={{ position:'absolute', top:'6px', right:'6px', background:'rgba(0,0,0,0.7)',
                      borderRadius:'6px', padding:'2px 6px', color:'white', fontSize:'9px', fontWeight:600 }}>
                      👁 {fmt(feed.viewerCount)}
                    </div>
                    {/* UX-13 FIX: Was 8px unreadable — now "⏸ HOLD" at 10px */}
                    <div style={{ position:'absolute', bottom:'4px', left:'6px', background:'rgba(0,0,0,0.65)',
                      borderRadius:'4px', padding:'2px 6px', color:'rgba(255,255,255,0.75)', fontSize:'10px', fontWeight:600 }}>
                      ⏸ HOLD
                    </div>
                  </div>
                  <div style={{ padding:'8px' }}>
                    {/* UX-06 FIX: 2-line clamped title */}
                    <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'13px', marginBottom:'3px',
                      overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2,
                      WebkitBoxOrient:'vertical', lineHeight:'1.3', maxHeight:'34px' }}>
                      {feed.title || 'Live Stream'}
                    </div>
                    <div style={{ color:'#94a3b8', fontSize:'12px',
                      overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:'6px' }}>
                      {feed.userName || 'Streamer'}
                    </div>
                    <button onClick={e => toggleFollow(e, feed.userId)}
                      aria-label={isFollowing(feed.userId) ? `Unfollow ${feed.userName}` : `Follow ${feed.userName}`}
                      style={{ width:'100%', background: isFollowing(feed.userId) ? '#334155' : 'linear-gradient(135deg,#ef4444,#f59e0b)',
                        border:'none', borderRadius:'8px', padding:'4px',
                        color: isFollowing(feed.userId) ? '#94a3b8' : 'white',
                        fontSize:'11px', fontWeight:700, cursor:'pointer' }}>
                      {isFollowing(feed.userId) ? '✓ Following' : '+ Follow'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Trending Clips — BUG-05: /clips/:id route now exists */}
        {clips.length > 0 && (
          <div style={{ marginBottom:'24px' }}>
            <div style={{ fontSize:'12px', fontWeight:700, color:'#64748b', textTransform:'uppercase',
              letterSpacing:'0.06em', marginBottom:'10px' }}>🔥 Trending Clips</div>
            <div style={{ display:'flex', gap:'12px', overflowX:'auto', paddingBottom:'8px' }} role="list">
              {clips.map(clip => (
                <div key={clip.id} role="listitem"
                  onClick={() => navigate(`/clips/${clip.id}`)}
                  aria-label={`Watch clip: ${clip.streamTitle}`}
                  style={{ borderRadius:'14px', overflow:'hidden', background:'#1e293b',
                    flexShrink:0, width:'140px', cursor:'pointer' }}>
                  <div style={{ position:'relative', aspectRatio:'9/16', background:'linear-gradient(135deg,#1e293b,#334155)', overflow:'hidden' }}>
                    {clip.thumbnailUrl
                      ? <img src={clip.thumbnailUrl} alt={clip.streamTitle} loading="lazy"
                          style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                      : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center',
                            justifyContent:'center', fontSize:'28px' }}>✂️</div>
                    }
                    <div style={{ position:'absolute', bottom:'4px', left:'4px', background:'rgba(0,0,0,0.8)',
                      borderRadius:'4px', padding:'2px 6px', color:'white', fontSize:'9px', fontWeight:700 }}>✂️ CLIP</div>
                    {clip.viewCount > 0 && (
                      <div style={{ position:'absolute', top:'4px', right:'4px', background:'rgba(0,0,0,0.7)',
                        borderRadius:'4px', padding:'1px 5px', color:'white', fontSize:'9px' }}>
                        👁 {clip.viewCount >= 1000 ? `${(clip.viewCount/1000).toFixed(1)}K` : clip.viewCount}
                      </div>
                    )}
                  </div>
                  <div style={{ padding:'6px 8px' }}>
                    <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'12px',
                      overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {clip.streamTitle || 'Stream Clip'}
                    </div>
                    <div style={{ color:'#64748b', fontSize:'10px', marginTop:'1px' }}>{clip.streamerName || 'Creator'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Portrait cards for IRL / Talk Show */}
        {(() => {
          const portraitFeeds = filteredFeeds.filter(f => f.category === 'irl' || f.category === 'talkshow');
          if (portraitFeeds.length === 0) return null;
          return (
            <div style={{ marginBottom:'24px' }}>
              <div style={{ fontSize:'12px', fontWeight:700, color:'#64748b', textTransform:'uppercase',
                letterSpacing:'0.06em', marginBottom:'10px' }}>📍 IRL &amp; Talk Shows</div>
              <div style={{ display:'flex', gap:'10px', overflowX:'auto', paddingBottom:'8px' }} role="list">
                {portraitFeeds.map(feed => (
                  <div key={feed.id + '-portrait'} role="listitem"
                    onClick={() => { cancelLongPress(); navigate(`/live/watch/${feed.id}`); }}
                    aria-label={`Watch ${feed.title} — ${fmt(feed.viewerCount)} viewers`}
                    style={{ borderRadius:'14px', overflow:'hidden', background:'#1e293b', flexShrink:0, width:'100px', cursor:'pointer' }}>
                    <div style={{ position:'relative', aspectRatio:'9/16', background:'linear-gradient(135deg,#1e293b,#334155)', overflow:'hidden' }}>
                      {feed.thumbnailUrl
                        ? <img src={feed.thumbnailUrl} alt={feed.title} loading="lazy"
                            style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                        : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center',
                              justifyContent:'center', fontSize:'22px' }}>
                            {feed.category === 'irl' ? '📍' : '💬'}
                          </div>
                      }
                      <div style={{ position:'absolute', top:'5px', left:'5px', background:'#ef4444',
                        borderRadius:'4px', padding:'1px 5px', color:'white', fontSize:'8px', fontWeight:800 }}>● LIVE</div>
                      <div style={{ position:'absolute', bottom:'4px', left:0, right:0, padding:'0 5px',
                        background:'linear-gradient(to top,rgba(0,0,0,0.7),transparent)' }}>
                        <div style={{ color:'white', fontSize:'9px', fontWeight:700,
                          overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{feed.title}</div>
                        <div style={{ color:'rgba(255,255,255,0.7)', fontSize:'8px' }}>👁 {fmt(feed.viewerCount)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* VOD Replays — POLISH-02: h/m duration */}
        {vods.length > 0 && (
          <div>
            <div style={{ fontSize:'12px', fontWeight:700, color:'#64748b', textTransform:'uppercase',
              letterSpacing:'0.06em', marginBottom:'10px' }}>📼 Recent Replays</div>
            <div style={{ display:'flex', gap:'12px', overflowX:'auto', paddingBottom:'8px' }} role="list">
              {vods.slice(0,10).map(vod => (
                <div key={vod.id} role="listitem"
                  onClick={() => { cancelLongPress(); navigate(`/live/watch/${vod.id}`); }}
                  onPointerDown={() => { setPressedCard(vod.id); startLongPress(vod); }}
                  onPointerUp={() => { setPressedCard(null); cancelLongPress(); }}
                  onPointerLeave={() => { setPressedCard(null); cancelLongPress(); }}
                  aria-label={`Watch replay: ${vod.title} by ${vod.userName}`}
                  style={{ borderRadius:'14px', overflow:'hidden', background:'#1e293b', flexShrink:0, width:'192px', cursor:'pointer',
                    transform: pressedCard===vod.id ? 'scale(0.95)' : 'scale(1)', transition:'transform 0.1s ease' }}>
                  <div style={{ position:'relative', aspectRatio:'16/9',
                    background: vod.thumbnailUrl ? 'transparent' : 'linear-gradient(135deg,#1e293b,#334155)', overflow:'hidden' }}>
                    {vod.thumbnailUrl
                      ? <img src={vod.thumbnailUrl} alt={vod.title} loading="lazy"
                          style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                      : <div style={{ width:'100%', height:'100%', display:'flex',
                            alignItems:'center', justifyContent:'center', fontSize:'28px' }}>📼</div>
                    }
                    <div style={{ position:'absolute', top:'6px', right:'6px', background:'rgba(0,0,0,0.8)',
                      borderRadius:'6px', padding:'2px 6px', color:'#94a3b8', fontSize:'9px', fontWeight:600 }}>
                      {timeAgo(vod.endedAt)}
                    </div>
                    {/* POLISH-02 FIX: h/m format */}
                    {vod.durationSeconds && (
                      <div style={{ position:'absolute', bottom:'4px', right:'4px', background:'rgba(0,0,0,0.8)',
                        borderRadius:'4px', padding:'1px 5px', color:'white', fontSize:'9px', fontWeight:600 }}>
                        {vodDuration(vod.durationSeconds)}
                      </div>
                    )}
                  </div>
                  <div style={{ padding:'8px' }}>
                    <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'14px',
                      overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:'3px' }}>
                      {vod.title || 'Stream Replay'}
                    </div>
                    <div style={{ color:'#94a3b8', fontSize:'12px' }}>{vod.userName || 'Streamer'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
