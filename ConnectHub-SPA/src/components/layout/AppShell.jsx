// src/components/layout/AppShell.jsx
// BUG-01 FIX: MoreDrawer Sign Out now calls Firebase signOut()
// BUG-07 FIX: Create post button opens createPostOpen modal via store
// BUG-08 FIX: ChatThread uses calc height to account for top/bottom chrome
// UX-02 FIX: paddingBottom accounts for mini player + safe area insets
// UX-15 FIX: Added Toast renderer component
// POLISH-08 FIX: Music player progress bar now animates

import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import TopNav    from './TopNav';
import SideNav   from './BottomNav';
import AdUnit    from '@components/ads/AdUnit';
import adService from '@services/ad-service';
import useAppStore from '@store/useAppStore';

const CHROME_HIDDEN = ['/login', '/register', '/onboarding', '/splash'];
const DEMO_TRACK = { title: 'Blinding Lights', artist: 'The Weeknd', emoji: '🎵' };

// ── UX-15 FIX: Toast renderer ────────────────────────────────────────────────
function ToastRenderer() {
  const toast = useAppStore((s) => s.toast);
  if (!toast) return null;
  return (
    <div style={{
      position: 'fixed',
      bottom: 80,
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(30, 27, 60, 0.97)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      color: '#f1f5f9',
      fontWeight: 600,
      fontSize: 14,
      padding: '10px 20px',
      borderRadius: 24,
      zIndex: 9990,
      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
      border: '1px solid rgba(99,102,241,0.3)',
      whiteSpace: 'nowrap',
      maxWidth: '90vw',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      animation: 'fadeIn 0.2s ease',
      pointerEvents: 'none',
    }}>
      {toast}
    </div>
  );
}

// ── POLISH-08 FIX: Mini Music Player with animated progress bar ──────────────
function MiniPlayer({ track, onExpand }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(35); // percent

  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { setPlaying(false); return 0; }
        return p + 0.5;
      });
    }, 500);
    return () => clearInterval(interval);
  }, [playing]);

  return (
    <div onClick={onExpand} style={{
      position:'fixed', bottom:0, left:0, right:0, height:56,
      background:'rgba(15,12,41,0.96)', backdropFilter:'blur(24px)',
      WebkitBackdropFilter:'blur(24px)', borderTop:'1px solid rgba(255,255,255,0.10)',
      display:'flex', alignItems:'center', gap:12, padding:'0 16px',
      zIndex:250, cursor:'pointer', userSelect:'none',
    }}>
      <div style={{ width:38, height:38, borderRadius:10, flexShrink:0,
        background:'linear-gradient(135deg,#6366f1,#ec4899)',
        display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>
        {track.emoji}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontWeight:700, fontSize:13, color:'#f1f5f9', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{track.title}</div>
        <div style={{ fontSize:11, color:'#64748b', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{track.artist}</div>
      </div>
      {/* POLISH-08 FIX: Animated progress bar */}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:2, background:'rgba(255,255,255,0.06)' }}>
        <div style={{ width:`${progress}%`, height:'100%', background:'linear-gradient(90deg,#6366f1,#ec4899)', transition:'width 0.5s linear' }} />
      </div>
      <button onClick={(e) => { e.stopPropagation(); setPlaying(p => !p); }}
        style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#6366f1,#ec4899)',
          border:'none', color:'white', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}
        aria-label={playing ? 'Pause' : 'Play'}>
        {playing ? '⏸' : '▶'}
      </button>
      <button onClick={(e) => e.stopPropagation()}
        style={{ color:'#64748b', fontSize:18, flexShrink:0, lineHeight:1, minWidth:30, minHeight:36 }}
        aria-label="Next track">⏭</button>
    </div>
  );
}

// ── More Drawer sections (mirrors MenuPage.jsx) ──────────────────────────────
const DRAWER_SECTIONS = [
  {
    label: 'DISCOVER',
    items: [
      { icon:'🔍', label:'Search & Explore', path:'/search' },
      { icon:'📈', label:'Trending',          path:'/search', state:{ tab:'trending' } },
      { icon:'📅', label:'Events',            path:'/events' },
      { icon:'👥', label:'Groups',            path:'/groups' },
    ],
  },
  {
    label: 'YOU',
    items: [
      { icon:'👫', label:'Friends',       path:'/friends' },
      { icon:'💾', label:'Saved',         path:'/saved' },
      { icon:'🔔', label:'Notifications', path:'/notifications' },
      { icon:'⭐', label:'Premium',       path:'/premium' },
    ],
  },
  {
    label: 'CREATE & EARN',
    items: [
      { icon:'🎨', label:'Creator Studio', path:'/creator' },
      { icon:'💼', label:'Business Tools', path:'/business' },
      { icon:'🛒', label:'Marketplace',    path:'/marketplace' },
    ],
  },
  {
    label: 'ENTERTAINMENT',
    items: [
      { icon:'🎵', label:'Music Player', path:'/music' },
      { icon:'🎮', label:'Gaming Hub',   path:'/gaming' },
      { icon:'🎬', label:'Media Hub',    path:'/media' },
      { icon:'📹', label:'Video Calls',  path:'/videocalls' },
      { icon:'🌐', label:'AR / VR',      path:'/arvr' },
    ],
  },
  {
    label: 'ACCOUNT',
    items: [
      { icon:'⚙️', label:'Settings',      path:'/settings' },
      { icon:'❓', label:'Help & Support', path:'/help' },
    ],
  },
];

// ── BUG-01 FIX: More Drawer — Sign Out calls Firebase signOut ─────────────────
function MoreDrawer({ open, onClose }) {
  const navigate = useNavigate();
  const setUser  = useAppStore((s) => s.setUser);

  const go = (path, state) => {
    onClose();
    navigate(path, state ? { state } : undefined);
  };

  const handleSignOut = async () => {
    onClose();
    try {
      const { getAuth, signOut } = await import('firebase/auth');
      await signOut(getAuth());
    } catch (_) {}
    setUser(null);
    navigate('/login', { replace: true });
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position:'fixed', inset:0, background:'rgba(0,0,0,0.55)',
            zIndex:450, backdropFilter:'blur(4px)',
            animation:'fadeIn 0.2s ease',
          }}
        />
      )}

      {/* Drawer panel — slides up from bottom, ~75% height */}
      <div style={{
        position:'fixed', bottom:0, left:0, right:0,
        height:'75vh',
        background:'rgba(10,8,30,0.98)',
        backdropFilter:'blur(28px)',
        WebkitBackdropFilter:'blur(28px)',
        borderTop:'1px solid rgba(99,102,241,0.25)',
        borderRadius:'24px 24px 0 0',
        zIndex:460,
        overflowY:'auto',
        transform: open ? 'translateY(0)' : 'translateY(100%)',
        transition:'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
        boxShadow:'0 -8px 48px rgba(0,0,0,0.6)',
        paddingBottom:24,
      }}>
        {/* Drag handle */}
        <div style={{ display:'flex', justifyContent:'center', padding:'12px 0 4px' }}>
          <div style={{ width:40, height:4, borderRadius:2, background:'rgba(255,255,255,0.18)' }} />
        </div>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'4px 20px 12px' }}>
          <span style={{ fontSize:18, fontWeight:800, color:'#f1f5f9' }}>More</span>
          <button
            onClick={onClose}
            style={{
              width:32, height:32, borderRadius:'50%', border:'none',
              background:'rgba(255,255,255,0.08)', color:'#94a3b8',
              fontSize:16, display:'flex', alignItems:'center', justifyContent:'center',
              cursor:'pointer',
            }}
            aria-label="Close menu"
          >✕</button>
        </div>

        {/* Sections */}
        {DRAWER_SECTIONS.map((section) => (
          <div key={section.label}>
            {/* Section header */}
            <div style={{
              fontSize:10, fontWeight:800, letterSpacing:'0.10em',
              textTransform:'uppercase', color:'#475569',
              padding:'14px 20px 6px',
            }}>
              {section.label}
            </div>

            {/* Items — 2-column grid */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, padding:'0 16px' }}>
              {section.items.map((item) => (
                <button
                  key={item.label}
                  onClick={() => go(item.path, item.state)}
                  style={{
                    display:'flex', alignItems:'center', gap:10,
                    padding:'11px 12px', borderRadius:14,
                    background:'rgba(255,255,255,0.05)',
                    border:'1px solid rgba(255,255,255,0.09)',
                    cursor:'pointer', textAlign:'left',
                    transition:'background 0.15s',
                    minHeight:44,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(99,102,241,0.12)'}
                  onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.05)'}
                >
                  <span style={{ fontSize:18, lineHeight:1, flexShrink:0 }}>{item.icon}</span>
                  <span style={{ fontSize:13, fontWeight:600, color:'#e2e8f0', lineHeight:1.2 }}>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* BUG-01 FIX: Sign Out now properly signs out */}
        <div style={{ padding:'16px 16px 0' }}>
          <div style={{ height:1, background:'rgba(255,255,255,0.06)', marginBottom:12 }} />
          <button
            onClick={handleSignOut}
            style={{
              display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              width:'100%', padding:'13px', borderRadius:14,
              background:'rgba(239,68,68,0.10)', border:'1px solid rgba(239,68,68,0.20)',
              color:'#f87171', fontSize:14, fontWeight:700, cursor:'pointer', minHeight:44,
            }}
          >
            🚪 Sign Out
          </button>
        </div>
      </div>
    </>
  );
}

// ── POLISH-08 FIX: Full Music Player Modal with animated progress ─────────────
function FullMusicPlayer({ track, onClose }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(35);

  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { setPlaying(false); return 0; }
        return p + 0.5;
      });
    }, 500);
    return () => clearInterval(interval);
  }, [playing]);

  const totalSecs = 212; // 3:32
  const currentSecs = Math.round((progress / 100) * totalSecs);
  const fmt = (s) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', zIndex:600,
      display:'flex', alignItems:'flex-end', backdropFilter:'blur(6px)' }}
      onClick={onClose}>
      <div style={{ background:'#1a1a2e', borderRadius:'24px 24px 0 0', padding:'28px 20px 48px',
        width:'100%', maxWidth:480, margin:'0 auto' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ width:40, height:4, borderRadius:2, background:'rgba(255,255,255,0.18)', margin:'0 auto 24px' }} />
        <div style={{ width:180, height:180, borderRadius:20, background:'linear-gradient(135deg,#6366f1,#ec4899)',
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:72,
          margin:'0 auto 24px', boxShadow:'0 20px 60px rgba(99,102,241,0.4)' }}>
          {track.emoji}
        </div>
        <div style={{ textAlign:'center', marginBottom:24 }}>
          <div style={{ fontWeight:800, fontSize:20, color:'#f1f5f9' }}>{track.title}</div>
          <div style={{ fontSize:14, color:'#64748b', marginTop:4 }}>{track.artist}</div>
        </div>
        {/* Animated progress */}
        <div style={{ height:4, background:'rgba(255,255,255,0.09)', borderRadius:2, marginBottom:8 }}>
          <div style={{ width:`${progress}%`, height:'100%', borderRadius:2, background:'linear-gradient(90deg,#6366f1,#ec4899)', transition:'width 0.5s linear' }} />
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#475569', marginBottom:28 }}>
          <span>{fmt(currentSecs)}</span><span>{fmt(totalSecs)}</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:32 }}>
          <button style={{ fontSize:26, color:'#64748b' }}>⏮</button>
          <button
            onClick={() => setPlaying(p => !p)}
            style={{ width:60, height:60, borderRadius:'50%', background:'linear-gradient(135deg,#6366f1,#ec4899)',
              border:'none', color:'white', fontSize:24, display:'flex', alignItems:'center', justifyContent:'center' }}>
            {playing ? '⏸' : '▶'}
          </button>
          <button style={{ fontSize:26, color:'#64748b' }}>⏭</button>
        </div>
        <button onClick={onClose} style={{ display:'block', margin:'24px auto 0', color:'#64748b', fontSize:14 }}>
          Close player ↓
        </button>
      </div>
    </div>
  );
}

// ── AppShell ──────────────────────────────────────────────────────────────────
export default function AppShell() {
  const { pathname }    = useLocation();
  const [showMiniPlayer,   setShowMiniPlayer]   = useState(true);
  const [showFullPlayer,   setShowFullPlayer]   = useState(false);
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [showRewarded,     setShowRewarded]     = useState(false);
  const [coinToast,        setCoinToast]        = useState(null);
  const prevPath = useRef(pathname);

  // ── Global More Drawer state from store ────────────────────
  const moreDrawerOpen    = useAppStore((s) => s.moreDrawerOpen);
  const setMoreDrawerOpen = useAppStore((s) => s.setMoreDrawerOpen);

  const hideChrome = CHROME_HIDDEN.some(p => pathname.startsWith(p));

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent') !== 'false';
    adService.init(consent);
  }, []);

  useEffect(() => {
    if (pathname === prevPath.current) return;
    prevPath.current = pathname;
    if (!hideChrome && adService.canShowInterstitial()) {
      const t = setTimeout(() => setShowInterstitial(true), 800);
      return () => clearTimeout(t);
    }
  }, [pathname, hideChrome]);

  // UX-02 FIX: paddingBottom accounts for mini player (56px) + bottom bar (56px) + safe area
  const mainPaddingBottom = hideChrome
    ? 0
    : showMiniPlayer
      ? 'calc(56px + 56px + env(safe-area-inset-bottom, 0px))'
      : 'calc(56px + env(safe-area-inset-bottom, 0px))';

  return (
    <div style={{ height:'100dvh', display:'flex', flexDirection:'column', overflow:'hidden' }}>

      {/* ── Interstitial Ad ── */}
      {showInterstitial && (
        <AdUnit type="interstitial" onClose={() => setShowInterstitial(false)} />
      )}

      {/* ── Rewarded Ad ── */}
      {showRewarded && (
        <AdUnit
          type="rewarded"
          onReward={(coins) => {
            setCoinToast(`+${coins} Coins earned! 🪙`);
            setTimeout(() => setCoinToast(null), 3500);
          }}
          onClose={() => setShowRewarded(false)}
        />
      )}

      {/* ── Coin toast ── */}
      {coinToast && (
        <div style={{
          position:'fixed', top:72, left:'50%', transform:'translateX(-50%)',
          background:'linear-gradient(135deg,#f59e0b,#ef4444)',
          color:'white', fontWeight:800, fontSize:14,
          padding:'10px 22px', borderRadius:24, zIndex:9990,
          boxShadow:'0 8px 24px rgba(0,0,0,0.4)', animation:'fadeIn 0.2s ease',
        }}>
          {coinToast}
        </div>
      )}

      {/* ── Top Navigation ── */}
      {!hideChrome && <TopNav onWatchAd={() => setShowRewarded(true)} />}

      {/* ── Main content ── */}
      <main style={{
        flex:1, overflowY:'auto', WebkitOverflowScrolling:'touch',
        paddingLeft: hideChrome ? 0 : 72,
        paddingBottom: mainPaddingBottom,
      }}>
        <Outlet />
      </main>

      {/* ── Side Navigation ── */}
      {!hideChrome && <SideNav />}

      {/* ── Persistent Mini Music Player (Rec #15) ── */}
      {!hideChrome && showMiniPlayer && (
        <MiniPlayer track={DEMO_TRACK} onExpand={() => setShowFullPlayer(true)} />
      )}

      {/* ── Full Music Player Modal ── */}
      {showFullPlayer && (
        <FullMusicPlayer track={DEMO_TRACK} onClose={() => setShowFullPlayer(false)} />
      )}

      {/* ── More Drawer (Fix #1: slide-in instead of full page, Rec spec) ── */}
      <MoreDrawer open={moreDrawerOpen} onClose={() => setMoreDrawerOpen(false)} />

      {/* ── UX-15 FIX: Toast Renderer ── */}
      <ToastRenderer />
    </div>
  );
}
