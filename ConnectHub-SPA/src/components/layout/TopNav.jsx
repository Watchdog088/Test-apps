// src/components/layout/TopNav.jsx
// DESIGN-UPDATE Jun-2026: Minimalist outline/hollow button style for all header buttons
// DATING-RENAME Jun-2026: Dating section now called "LynkApp Dating"
// POLISH-14 FIX: Brand name is "LynkApp" on Feed page
// POLISH-19 FIX: LynkApp logo shown in top-left on Feed; page title elsewhere
// POLISH-17 FIX: Search icon active state (accent color when on /search)
// UX-14 FIX: Removed duplicate ☰ button from TopNav — it stays in SideNav only
// POLISH-11 FIX: Avatar touch target 44×44px
// BACK-BTN FIX (May 27 2026): Show ← back button on nested sub-routes (depth > 1)
// BETA-FEEDBACK (May 28 2026): Wire BetaFeedbackModal into TopNav via 🧪 Feedback button

import React, { useState, lazy, Suspense } from 'react';
const BetaFeedbackModal = lazy(() => import('@components/common/BetaFeedbackModal'));
import { useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '@fb/config';
import { useAuth } from '@hooks/useAuth';
import useAppStore from '@store/useAppStore';

// POLISH-19: LynkApp logo SVG component
function LynkLogo() {
  return (
    <span style={{
      fontSize:'22px', fontWeight:900, letterSpacing:'-0.5px',
      background:'linear-gradient(135deg,#6366f1,#ec4899)',
      WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
      display:'flex', alignItems:'center', gap:6, userSelect:'none',
    }}>
      ⚡ LynkApp
    </span>
  );
}

const PAGE_TITLES = {
  '/feed':          null,          // uses logo instead
  '/stories':       '📖 Stories',
  '/live':          '🔴 Live',
  '/groups':        '👥 Groups',
  '/messages':      '💬 Messages',
  '/notifications': '🔔 Notifications',
  '/profile':       '👤 Profile',
  '/friends':       '👫 Friends',
  '/dating':        '❤️ LynkApp Dating',  // DATING-RENAME: updated to "LynkApp Dating"
  '/events':        '📅 Events',
  '/gaming':        '🎮 Gaming',
  '/marketplace':   '🛍 Marketplace',
  '/media':         '🎬 Media Hub',
  '/music':         '🎵 Music',
  '/videocalls':    '📹 Video Calls',
  '/arvr':          '🥽 AR/VR',
  '/saved':         '🔖 Saved',
  '/search':        '🔍 Search',
  '/settings':      '⚙️ Settings',
  '/business':      '💼 Business',
  '/creator':       '🎨 Creator Studio',
  '/help':          '❓ Help & Support',
  '/menu':          '☰ Menu',
  '/premium':       '⭐ Premium',
  '/trending':      '🔥 Trending',
};

// Top-level routes that should NOT show a back button (they have bottom-nav tabs)
const TOP_LEVEL_ROUTES = new Set([
  '/feed','/','/stories','/live','/groups','/messages','/notifications',
  '/profile','/friends','/dating','/events','/gaming','/marketplace',
  '/media','/music','/videocalls','/arvr','/saved','/search','/settings',
  '/business','/creator','/help','/menu','/premium','/trending',
]);

// ── Reusable hollow/outline icon button ───────────────────────────────────────
// DESIGN: Transparent background, outline border, fills on hover/active
function IconBtn({ onClick, label, children, active = false, style = {} }) {
  const [hovered, setHovered] = useState(false);

  const base = {
    minWidth: 40,
    minHeight: 40,
    borderRadius: 10,
    padding: '0 8px',
    background: hovered || active ? 'rgba(99,102,241,0.12)' : 'transparent',
    border: hovered || active
      ? '1px solid rgba(99,102,241,0.40)'
      : '1px solid rgba(255,255,255,0.08)',
    color: hovered || active ? '#818cf8' : '#94a3b8',
    fontSize: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.18s ease',
    flexShrink: 0,
    ...style,
  };

  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={base}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </button>
  );
}

export default function TopNav() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user }  = useAuth();
  const { unreadNotifications, setCreatePostOpen, userProfile } = useAppStore();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const isAdmin = userProfile?.isAdmin === true;

  const path = location.pathname;
  const isFeed    = path === '/feed' || path === '/';
  const isSearch  = path.startsWith('/search');

  // BACK-BTN FIX: Show back button on any route deeper than 1 segment
  const segments = path.split('/').filter(Boolean);
  const isNested = segments.length > 1 && !TOP_LEVEL_ROUTES.has(path);

  async function handleSignOut() {
    try { await signOut(auth); navigate('/login', { replace: true }); } catch {}
  }

  const pageTitle = PAGE_TITLES[path] || PAGE_TITLES[`/${segments[0]}`] || '← Back';

  return (
    <header style={{
      position:'fixed', top:0, left:0, right:0, zIndex:200,
      height:'var(--top-nav-h, 56px)',
      // DESIGN: Deeper, cleaner dark glass effect
      background:'rgba(8,6,24,0.94)', backdropFilter:'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderBottom:'1px solid rgba(99,102,241,0.12)',
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'0 14px',
    }}>
      {/* Left: Back button on nested pages, Logo on Feed, title elsewhere */}
      <div style={{ display:'flex', alignItems:'center', gap:6, minWidth:0 }}>
        {/* BACK-BTN FIX: ← back button on sub-pages — outline style */}
        {isNested && (
          <IconBtn
            onClick={() => navigate(-1)}
            label="Go back"
            style={{ fontSize:20, fontWeight:700, marginLeft:-4 }}
          >
            ←
          </IconBtn>
        )}
        {isFeed ? (
          <div style={{ display:'flex', flexDirection:'column', gap:1 }}>
            <LynkLogo />
            {user?.displayName && (
              <span style={{ fontSize:11, color:'#64748b', fontWeight:500, paddingLeft:2 }}>
                Hi, {user.displayName.split(' ')[0]} 👋
              </span>
            )}
          </div>
        ) : (
          <span style={{
            fontSize:'17px', fontWeight:800, color:'#f1f5f9',
            overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
          }}>
            {pageTitle}
          </span>
        )}
      </div>

      {/* Right icons — all outline/hollow style */}
      <div style={{ display:'flex', alignItems:'center', gap:3 }}>

        {/* ✏️ Create Post — outline icon btn */}
        <IconBtn
          onClick={() => setCreatePostOpen(true)}
          label="Create post"
        >
          ✏️
        </IconBtn>

        {/* 🔍 Search — POLISH-17 FIX: active state */}
        <IconBtn
          onClick={() => navigate('/search')}
          label="Search"
          active={isSearch}
        >
          🔍
        </IconBtn>

        {/* 🔔 Notifications badge — outline icon btn */}
        <div style={{ position:'relative' }}>
          <IconBtn
            onClick={() => navigate('/notifications')}
            label={`Notifications${unreadNotifications > 0 ? ` (${unreadNotifications} unread)` : ''}`}
          >
            🔔
          </IconBtn>
          {unreadNotifications > 0 && (
            <span style={{
              position:'absolute', top:4, right:2,
              minWidth:17, height:17, borderRadius:'50%',
              background:'#ef4444', border:'2px solid #08061a',
              color:'white', fontSize:9, fontWeight:800,
              display:'flex', alignItems:'center', justifyContent:'center',
              pointerEvents:'none',
            }}>
              {unreadNotifications > 9 ? '9+' : unreadNotifications}
            </span>
          )}
        </div>

        {/* 🧪 Beta Feedback — outline style, desktop only */}
        <button
          onClick={() => setFeedbackOpen(true)}
          aria-label="Send beta feedback"
          className="feedback-btn-desktop"
          style={{
            minWidth: 40, minHeight: 40, borderRadius: 10, padding: '0 10px',
            background: 'transparent',
            border: '1px solid rgba(16,185,129,0.35)',
            color: '#10b981', fontSize: 13, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', gap: 4, transition: 'all 0.18s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(16,185,129,0.10)';
            e.currentTarget.style.borderColor = 'rgba(16,185,129,0.55)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'rgba(16,185,129,0.35)';
          }}
        >
          🧪 Feedback
        </button>
        {feedbackOpen && (
          <Suspense fallback={null}>
            <BetaFeedbackModal onClose={() => setFeedbackOpen(false)} />
          </Suspense>
        )}

        {/* 🛡️ Admin Panel — outline style, admin only */}
        {isAdmin && (
          <IconBtn
            onClick={() => navigate('/admin')}
            label="Admin Panel"
            active={location.pathname.startsWith('/admin')}
            style={{
              border: '1px solid rgba(239,68,68,0.35)',
              color: '#f87171',
            }}
          >
            🛡️
          </IconBtn>
        )}

        {/* Avatar — POLISH-11 FIX: 44×44px — outline ring style */}
        <button
          onClick={() => navigate('/profile')}
          aria-label="Profile"
          style={{
            width: 40, height: 40, borderRadius: '50%', overflow: 'hidden',
            background: 'rgba(99,102,241,0.15)',
            // DESIGN: Hollow outline ring — no solid fill
            border: '1.5px solid rgba(99,102,241,0.50)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, fontWeight: 800, color: '#818cf8', cursor: 'pointer',
            flexShrink: 0, transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(99,102,241,0.85)';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(99,102,241,0.50)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {user?.photoURL
            ? <img src={user.photoURL} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            : (user?.displayName?.[0]?.toUpperCase() || '?')}
        </button>
      </div>
    </header>
  );
}
