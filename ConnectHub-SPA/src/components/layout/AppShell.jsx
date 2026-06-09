// src/components/layout/AppShell.jsx
// BUG-01 FIX: MoreDrawer Sign Out now calls Firebase signOut()
// BUG-07 FIX: Create post button opens createPostOpen modal via store
// BUG-08 FIX: ChatThread uses calc height to account for top/bottom chrome
// UX-02 FIX: paddingBottom accounts for mini player + safe area insets
// UX-15 FIX: Added Toast renderer component
// POLISH-08 FIX: Music player progress bar now animates

// VERIFY-FIX (May 27 2026): Redirect unverified email users to /verify-email
import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import TopNav          from './TopNav';
import SideNav         from './BottomNav';
import MobileBottomNav, { MOBILE_NAV_H } from './MobileBottomNav';
import AdUnit          from '@components/ads/AdUnit';
import adService       from '@services/ad-service';
import useAppStore     from '@store/useAppStore';
import { useAuth }     from '@hooks/useAuth';
import BetaFeedbackModal    from '@components/common/BetaFeedbackModal';
import BetaWelcomeTooltip   from '@components/common/BetaWelcomeTooltip';
// BETA FIX (Jun 2026): Cookie consent banner — GDPR/CCPA required
import CookieConsentBanner  from '@components/common/CookieConsentBanner';
import OfflineOverlay        from '@components/common/OfflineOverlay';
import PageErrorBoundary from '@components/common/PageErrorBoundary';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '@/firebase/config';

const CHROME_HIDDEN = ['/login', '/register', '/onboarding', '/splash'];
// Music mini-player only shows when a real track is selected by the user
const DEMO_TRACK = null; // No hardcoded song — populated via Deezer/store

// ── UX-15 FIX: Toast renderer ────────────────────────────────────────────────
// BUG-11 FIX: Moved to top:72px so it never overlaps bottom nav or action buttons
// A-03 FIX: Added role="status" aria-live="polite" for screen reader announcement
// BUG-13 FIX: Reads toast.message + toast.type for styled toasts
function ToastRenderer() {
  const toast = useAppStore((s) => s.toast);
  if (!toast) return null;

  // Support both old string toasts and new { message, type } object toasts
  const message = typeof toast === 'string' ? toast : toast.message;
  const type    = typeof toast === 'string' ? 'info' : (toast.type || 'info');

  const borderColor =
    type === 'success' ? '#22c55e' :
    type === 'warning' ? '#f59e0b' :
    type === 'error'   ? '#ef4444' :
    '#6366f1'; // info / default

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: 'fixed',
        top: 72,             // BUG-11 FIX: top so it never overlaps bottom nav
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(15, 12, 41, 0.97)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        color: '#f1f5f9',
        fontWeight: 600,
        fontSize: 14,
        padding: '10px 20px',
        borderRadius: 24,
        zIndex: 9990,
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        border: `1px solid ${borderColor}`,
        borderLeft: `4px solid ${borderColor}`,
        whiteSpace: 'nowrap',
        maxWidth: '90vw',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        animation: 'fadeIn 0.2s ease',
        pointerEvents: 'none',
      }}>
      {message}
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
      { icon:'📈', label:'Trending',          path:'/trending' },
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

// ── GAP-03: In-app "went live" banner ────────────────────────────────────────
function LiveNowBanner({ stream, onClose, onClick }) {
  return (
    <div style={{ position:'fixed', top:'60px', left:'50%', transform:'translateX(-50%)',
      background:'rgba(10,10,24,0.97)', border:'1px solid rgba(239,68,68,0.5)',
      borderRadius:'16px', padding:'10px 14px', zIndex:9992, display:'flex',
      alignItems:'center', gap:'10px', cursor:'pointer', animation:'slideDown 0.35s ease',
      maxWidth:'92vw', boxShadow:'0 8px 32px rgba(0,0,0,0.5)' }}
      onClick={onClick}>
      <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#ef4444',
        flexShrink:0, animation:'livePulse 1.4s ease infinite' }} />
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ color:'#f1f5f9', fontWeight:800, fontSize:'13px',
          overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {stream.userName} is live!
        </div>
        <div style={{ color:'#94a3b8', fontSize:'11px' }}>{stream.title}</div>
      </div>
      <button onClick={e => { e.stopPropagation(); onClose(); }} aria-label="Dismiss live notification"
        style={{ background:'rgba(255,255,255,0.1)', border:'none', borderRadius:'8px',
          color:'#94a3b8', fontSize:'13px', padding:'4px 8px', cursor:'pointer', flexShrink:0 }}>✕</button>
    </div>
  );
}

// ── AppShell ──────────────────────────────────────────────────────────────────
export default function AppShell() {
  const { pathname }    = useLocation();
  const navigate        = useNavigate();

  // VERIFY-FIX: Gate — unverified email users must verify before accessing the app
  // isAnonymous guard prevents guest/social sign-ins from being blocked
  const { user: firebaseUser } = useAuth();
  if (firebaseUser && !firebaseUser.emailVerified && !firebaseUser.isAnonymous) {
    return <Navigate to="/verify-email" replace />;
  }

  const [showMiniPlayer,   setShowMiniPlayer]   = useState(true);
  const [showFullPlayer,   setShowFullPlayer]   = useState(false);
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [showRewarded,     setShowRewarded]     = useState(false);
  const [coinToast,        setCoinToast]        = useState(null);
  const [liveNotif,        setLiveNotif]        = useState(null); // GAP-03
  const [isOffline,        setIsOffline]        = useState(!navigator.onLine);
  const [isMobile,         setIsMobile]         = useState(window.innerWidth < 640);
  // Feature #6: BetaFeedbackModal — shake or long-press
  const [showBetaFeedback, setShowBetaFeedback] = useState(false);
  // Feature #8: PWA install banner
  const [pwaPrompt,        setPwaPrompt]        = useState(null);
  const [showPwaBanner,    setShowPwaBanner]    = useState(false);
  const prevPath = useRef(pathname);
  const seenStreamsRef = useRef(new Set());
  const longPressTimer = useRef(null);

  // ── Global More Drawer state from store ────────────────────
  const moreDrawerOpen    = useAppStore((s) => s.moreDrawerOpen);
  const setMoreDrawerOpen = useAppStore((s) => s.setMoreDrawerOpen);

  const hideChrome = CHROME_HIDDEN.some(p => pathname.startsWith(p));

  // BUG-1 FIX: Listen for window resize to update isMobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // GAP-03: Subscribe to live streams from followed creators
  useEffect(() => {
    if (!auth.currentUser) return;
    let followingIds = [];
    const loadFollowing = async () => {
      try {
        const { getDoc, doc: fsDoc } = await import('firebase/firestore');
        const snap = await getDoc(fsDoc(db, 'users', auth.currentUser.uid));
        if (snap.exists()) followingIds = snap.data().following || [];
      } catch { return; }
      if (!followingIds.length) return;
      const q = query(
        collection(db, 'streams'),
        where('status', '==', 'live'),
        orderBy('startedAt', 'desc'),
        limit(10)
      );
      const unsub = onSnapshot(q, snap => {
        snap.docChanges().forEach(change => {
          if (change.type !== 'added') return;
          const s = { id: change.doc.id, ...change.doc.data() };
          if (!followingIds.includes(s.userId)) return;
          if (seenStreamsRef.current.has(s.id)) return;
          if (s.userId === auth.currentUser?.uid) return;
          seenStreamsRef.current.add(s.id);
          setLiveNotif(s);
          setTimeout(() => setLiveNotif(n => n?.id === s.id ? null : n), 8000);
        });
      }, () => {});
      return unsub;
    };
    loadFollowing();
  }, []);

  // Mobile: offline/online banner
  useEffect(() => {
    const onOnline  = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);
    window.addEventListener('online',  onOnline);
    window.addEventListener('offline', onOffline);
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
  }, []);

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

  // ── Feature #6: Shake detection → open BetaFeedbackModal ──────────────────
  useEffect(() => {
    if (!window.DeviceMotionEvent) return;
    let lastShake = 0;
    const threshold = 18;
    const handleMotion = (e) => {
      const a = e.accelerationIncludingGravity;
      if (!a) return;
      const total = Math.abs(a.x || 0) + Math.abs(a.y || 0) + Math.abs(a.z || 0);
      if (total > threshold) {
        const now = Date.now();
        if (now - lastShake > 2000) {
          lastShake = now;
          setShowBetaFeedback(true);
        }
      }
    };
    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, []);

  // ── Feature #6: Long-press (2 s) anywhere → open BetaFeedbackModal ─────────
  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => setShowBetaFeedback(true), 2000);
  };
  const handleTouchEnd = () => {
    clearTimeout(longPressTimer.current);
  };

  // ── Feature #8: PWA install prompt — show after 3+ visits ──────────────────
  useEffect(() => {
    // Track visit count
    const visits = parseInt(localStorage.getItem('lynk_visits') || '0', 10) + 1;
    localStorage.setItem('lynk_visits', String(visits));

    // Capture the beforeinstallprompt event
    const handler = (e) => {
      e.preventDefault();
      setPwaPrompt(e);
      // Only show banner after 3rd visit
      if (visits >= 3 && !localStorage.getItem('lynk_pwa_dismissed')) {
        setShowPwaBanner(true);
      }
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallPWA = async () => {
    if (!pwaPrompt) return;
    pwaPrompt.prompt();
    const { outcome } = await pwaPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPwaBanner(false);
      setPwaPrompt(null);
    }
  };

  // UX-02 FIX: paddingBottom accounts for chrome height (mobile nav or mini player)
  // On mobile (< 640px): MobileBottomNav = 64px; MiniPlayer floats above it at bottom:64px
  // On desktop (>= 640px): side nav has no bottom footprint; MiniPlayer = 56px if showing
  const mobileNavH = isMobile ? MOBILE_NAV_H : 0;
  const miniPlayerH = (!isMobile && showMiniPlayer && DEMO_TRACK) ? 56 : 0;
  const mainPaddingBottom = hideChrome
    ? 0
    : `calc(${mobileNavH + miniPlayerH}px + env(safe-area-inset-bottom, 0px))`;

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
      <main
        style={{
          flex:1, overflowY:'auto', WebkitOverflowScrolling:'touch',
          paddingTop: hideChrome ? 0 : 'var(--top-nav-h, 56px)',
          paddingLeft: hideChrome ? 0 : (isMobile ? 0 : 72),
          paddingBottom: mainPaddingBottom,
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchEnd}
      >
        {/* Feature #7: PageErrorBoundary — page-level so one crash doesn't kill the whole app */}
        <PageErrorBoundary>
          <Outlet />
        </PageErrorBoundary>
      </main>

      {/* ── Desktop Side Navigation — hidden on mobile (isMobile hides via CSS) ── */}
      {!hideChrome && !isMobile && <SideNav />}

      {/* ── Mobile Bottom Tab Bar — only on mobile viewports < 640px ── */}
      {!hideChrome && isMobile && (
        <MobileBottomNav
          onCreatePost={() => {
            const setCreatePostOpen = useAppStore.getState().setCreatePostOpen;
            if (setCreatePostOpen) setCreatePostOpen(true);
          }}
        />
      )}

      {/* ── Persistent Mini Music Player — only shown when a real track is playing ── */}
      {!hideChrome && showMiniPlayer && DEMO_TRACK && (
        <MiniPlayer track={DEMO_TRACK} onExpand={() => setShowFullPlayer(true)} />
      )}

      {/* ── Full Music Player Modal ── */}
      {showFullPlayer && DEMO_TRACK && (
        <FullMusicPlayer track={DEMO_TRACK} onClose={() => setShowFullPlayer(false)} />
      )}

      {/* ── More Drawer (Fix #1: slide-in instead of full page, Rec spec) ── */}
      <MoreDrawer open={moreDrawerOpen} onClose={() => setMoreDrawerOpen(false)} />

      {/* ── GAP-03: "Went live" notification banner ── */}
      {liveNotif && (
        <LiveNowBanner
          stream={liveNotif}
          onClose={() => setLiveNotif(null)}
          onClick={() => { setLiveNotif(null); navigate(`/live/watch/${liveNotif.id}`); }}
        />
      )}

      {/* ── Mobile offline banner ── */}
      {isOffline && (
        <div className="offline-banner">
          📡 No connection — reconnecting…
        </div>
      )}

      {/* ── UX-15 FIX: Toast Renderer ── */}
      <ToastRenderer />

      {/* ── BETA Jun-2026: Persistent floating feedback FAB — visible on all authenticated pages ── */}
      {!showBetaFeedback && (
        <button
          onClick={() => setShowBetaFeedback(true)}
          aria-label="Open beta feedback"
          title="Send feedback"
          style={{
            position: 'fixed',
            bottom: 88,
            right: 16,
            zIndex: 280,
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'linear-gradient(135deg,#6366f1,#ec4899)',
            border: 'none',
            boxShadow: '0 4px 18px rgba(99,102,241,0.55)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.12)'; e.currentTarget.style.boxShadow = '0 6px 22px rgba(99,102,241,0.7)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(99,102,241,0.55)'; }}
        >
          💬
        </button>
      )}

      {/* ── Feature #6: BetaFeedbackModal — shake or long-press trigger ── */}
      {showBetaFeedback && (
        <BetaFeedbackModal onClose={() => setShowBetaFeedback(false)} />
      )}

      {/* ── Beta Welcome Tooltip — shown once to every new beta tester ── */}
      <BetaWelcomeTooltip />

      {/* ── BETA FIX (Jun 2026): Cookie Consent Banner — GDPR/CCPA required ── */}
      <CookieConsentBanner />

      {/* ── Missing #5: Global offline overlay — shows when navigator.onLine = false ── */}
      <OfflineOverlay />

      {/* ── Feature #8: PWA Install Banner — shown after 3+ visits ── */}
      {showPwaBanner && (
        <div style={{
          position:'fixed', bottom: hideChrome ? 0 : 120, left:12, right:12,
          background:'rgba(15,12,41,0.97)', backdropFilter:'blur(20px)',
          border:'1px solid rgba(99,102,241,0.35)', borderRadius:18,
          padding:'14px 16px', zIndex:9000,
          boxShadow:'0 8px 32px rgba(0,0,0,0.5)',
          display:'flex', alignItems:'center', gap:12,
          animation:'slideUp 0.3s ease',
        }}>
          <div style={{ fontSize:28, flexShrink:0 }}>📲</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontWeight:800, fontSize:14, color:'#f1f5f9' }}>Add LynkApp to Home Screen</div>
            <div style={{ fontSize:12, color:'#64748b', marginTop:2 }}>Get the full app experience — works offline too!</div>
          </div>
          <button onClick={handleInstallPWA}
            style={{ padding:'8px 14px', borderRadius:12, background:'linear-gradient(135deg,#6366f1,#ec4899)',
              border:'none', color:'white', fontWeight:700, fontSize:13, cursor:'pointer', flexShrink:0 }}>
            Install
          </button>
          <button onClick={() => { setShowPwaBanner(false); localStorage.setItem('lynk_pwa_dismissed','1'); }}
            style={{ color:'#475569', fontSize:18, flexShrink:0, lineHeight:1, padding:'4px 6px' }}
            aria-label="Dismiss install banner">✕</button>
        </div>
      )}
    </div>
  );
}
