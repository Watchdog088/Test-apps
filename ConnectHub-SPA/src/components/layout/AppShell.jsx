// src/components/layout/AppShell.jsx
// Main layout wrapper: TopNav | Page content | SideNav | Mini Music Player (Rec #15)

import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import TopNav    from './TopNav';
import SideNav   from './BottomNav';   // renamed to SideNav internally
import AdUnit    from '@components/ads/AdUnit';
import adService from '@services/ad-service';

// Routes that hide the chrome (TopNav + SideNav + MiniPlayer)
const CHROME_HIDDEN = ['/login', '/register', '/onboarding', '/splash'];

// ── Mini Music Player (Rec #15) ─────────────────────────────────────────────
// Persistent bar above the nav chrome. Tap to open full player.
const DEMO_TRACK = { title: 'Blinding Lights', artist: 'The Weeknd', emoji: '🎵' };

function MiniPlayer({ track, onExpand }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div
      onClick={onExpand}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 56,
        background: 'rgba(15,12,41,0.96)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(255,255,255,0.10)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '0 16px',
        zIndex: 250,
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      {/* Album art placeholder */}
      <div style={{
        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
        background: 'linear-gradient(135deg,#6366f1,#ec4899)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
      }}>
        {track.emoji}
      </div>

      {/* Track info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{track.title}</div>
        <div style={{ fontSize: 11, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{track.artist}</div>
      </div>

      {/* Progress bar (thin) */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'rgba(255,255,255,0.06)' }}>
        <div style={{ width: '35%', height: '100%', background: 'linear-gradient(90deg,#6366f1,#ec4899)' }} />
      </div>

      {/* Play / Pause */}
      <button
        onClick={(e) => { e.stopPropagation(); setPlaying(p => !p); }}
        style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'linear-gradient(135deg,#6366f1,#ec4899)',
          border: 'none', color: 'white', fontSize: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}
        aria-label={playing ? 'Pause' : 'Play'}
      >
        {playing ? '⏸' : '▶'}
      </button>

      {/* Skip forward */}
      <button
        onClick={(e) => { e.stopPropagation(); }}
        style={{ color: '#64748b', fontSize: 18, flexShrink: 0, lineHeight: 1, minWidth: 30, minHeight: 36 }}
        aria-label="Next track"
      >
        ⏭
      </button>
    </div>
  );
}

// ── AppShell ────────────────────────────────────────────────────────────────
export default function AppShell() {
  const { pathname }    = useLocation();
  const navigate        = useNavigate();
  const [showMiniPlayer,   setShowMiniPlayer]   = useState(true);
  const [showFullPlayer,   setShowFullPlayer]   = useState(false);
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [showRewarded,     setShowRewarded]     = useState(false);
  const [coinToast,        setCoinToast]        = useState(null);
  const prevPath = useRef(pathname);

  const hideChrome = CHROME_HIDDEN.some(p => pathname.startsWith(p));

  // ── Initialise ad service once ─────────────────────────────
  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent') !== 'false';
    adService.init(consent);
  }, []);

  // ── Interstitial on route change (3-min cooldown) ──────────
  useEffect(() => {
    if (pathname === prevPath.current) return;
    prevPath.current = pathname;
    if (!hideChrome && adService.canShowInterstitial()) {
      // Small delay so page renders first
      const t = setTimeout(() => setShowInterstitial(true), 800);
      return () => clearTimeout(t);
    }
  }, [pathname, hideChrome]);

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── Interstitial Ad Overlay ── */}
      {showInterstitial && (
        <AdUnit type="interstitial" onClose={() => setShowInterstitial(false)} />
      )}

      {/* ── Rewarded Ad Overlay ── */}
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

      {/* ── Coin toast notification ── */}
      {coinToast && (
        <div style={{
          position: 'fixed', top: 72, left: '50%', transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg,#f59e0b,#ef4444)',
          color: 'white', fontWeight: 800, fontSize: 14,
          padding: '10px 22px', borderRadius: 24, zIndex: 9990,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          animation: 'fadeIn 0.2s ease',
        }}>
          {coinToast}
        </div>
      )}

      {/* ── Top Navigation Bar ── */}
      {!hideChrome && <TopNav onWatchAd={() => setShowRewarded(true)} />}

      {/* ── Main scrollable content ── */}
      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          // Push left to make room for the side nav (72px) + mini player at bottom (56px)
          paddingLeft: hideChrome ? 0 : 72,
          paddingBottom: hideChrome ? 0 : 56,
        }}
      >
        <Outlet />
      </main>

      {/* ── Side Navigation ── */}
      {!hideChrome && <SideNav />}

      {/* ── Persistent Mini Music Player (Rec #15) ── */}
      {!hideChrome && showMiniPlayer && (
        <MiniPlayer
          track={DEMO_TRACK}
          onExpand={() => setShowFullPlayer(true)}
        />
      )}

      {/* ── Full Music Player Modal ── */}
      {showFullPlayer && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 600, display: 'flex', alignItems: 'flex-end', backdropFilter: 'blur(6px)' }}
          onClick={() => setShowFullPlayer(false)}
        >
          <div
            style={{ background: '#1a1a2e', borderRadius: '24px 24px 0 0', padding: '28px 20px 48px', width: '100%', maxWidth: 480, margin: '0 auto' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.18)', margin: '0 auto 24px' }} />

            {/* Art */}
            <div style={{ width: 180, height: 180, borderRadius: 20, background: 'linear-gradient(135deg,#6366f1,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72, margin: '0 auto 24px', boxShadow: '0 20px 60px rgba(99,102,241,0.4)' }}>
              {DEMO_TRACK.emoji}
            </div>

            {/* Info */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontWeight: 800, fontSize: 20, color: '#f1f5f9' }}>{DEMO_TRACK.title}</div>
              <div style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>{DEMO_TRACK.artist}</div>
            </div>

            {/* Progress bar */}
            <div style={{ height: 4, background: 'rgba(255,255,255,0.09)', borderRadius: 2, marginBottom: 8 }}>
              <div style={{ width: '35%', height: '100%', borderRadius: 2, background: 'linear-gradient(90deg,#6366f1,#ec4899)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#475569', marginBottom: 28 }}>
              <span>1:24</span><span>3:32</span>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32 }}>
              <button style={{ fontSize: 26, color: '#64748b' }}>⏮</button>
              <button style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#ec4899)', border: 'none', color: 'white', fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>▶</button>
              <button style={{ fontSize: 26, color: '#64748b' }}>⏭</button>
            </div>

            {/* Close */}
            <button onClick={() => setShowFullPlayer(false)} style={{ display: 'block', margin: '24px auto 0', color: '#64748b', fontSize: 14 }}>Close player ↓</button>
          </div>
        </div>
      )}
    </div>
  );
}
