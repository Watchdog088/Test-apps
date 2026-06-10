// src/components/layout/TopNav.jsx
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
  '/dating':        '💕 Dating',
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
  // e.g. /settings/privacy, /live/setup, /groups/abc123, /post/123/comments
  const segments = path.split('/').filter(Boolean); // ['settings','privacy']
  const isNested = segments.length > 1 && !TOP_LEVEL_ROUTES.has(path);

  async function handleSignOut() {
    try { await signOut(auth); navigate('/login', { replace: true }); } catch {}
  }

  const pageTitle = PAGE_TITLES[path] || PAGE_TITLES[`/${segments[0]}`] || '← Back';

  return (
    <header style={{
      position:'fixed', top:0, left:0, right:0, zIndex:200,
      height:'var(--top-nav-h, 56px)',
      background:'rgba(10,10,24,0.92)', backdropFilter:'blur(20px)',
      borderBottom:'1px solid rgba(255,255,255,0.07)',
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'0 16px',
    }}>
      {/* Left: Back button on nested pages, Logo on Feed, title elsewhere */}
      <div style={{ display:'flex', alignItems:'center', gap:8, minWidth:0 }}>
        {/* BACK-BTN FIX: ← back button on sub-pages */}
        {isNested && (
          <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            style={{
              minWidth:44, minHeight:44, borderRadius:12, padding:'0 8px',
              background:'transparent', border:'none',
              color:'#94a3b8', fontSize:22, fontWeight:700,
              display:'flex', alignItems:'center', justifyContent:'center',
              cursor:'pointer', flexShrink:0, marginLeft:-8,
            }}
          >←</button>
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

      {/* Right icons */}
      <div style={{ display:'flex', alignItems:'center', gap:4 }}>
        {/* ✏️ Create Post — BUG-07 FIX */}
        <button
          onClick={() => setCreatePostOpen(true)}
          aria-label="Create post"
          style={{
            minWidth:44, minHeight:44, borderRadius:12, padding:'0 8px',
            background:'transparent', border:'none', color:'#94a3b8', fontSize:20,
            display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
          }}>
          ✏️
        </button>

        {/* 🔍 Search — POLISH-17 FIX: active state */}
        <button
          onClick={() => navigate('/search')}
          aria-label="Search"
          style={{
            minWidth:44, minHeight:44, borderRadius:12, padding:'0 8px',
            background: isSearch ? 'rgba(99,102,241,0.18)' : 'transparent',
            border:'none',
            color: isSearch ? '#818cf8' : '#94a3b8',
            fontSize:20,
            display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
          }}>
          🔍
        </button>

        {/* 🔔 Notifications badge */}
        <button
          onClick={() => navigate('/notifications')}
          aria-label={`Notifications${unreadNotifications > 0 ? ` (${unreadNotifications} unread)` : ''}`}
          style={{
            position:'relative', minWidth:44, minHeight:44, borderRadius:12, padding:'0 8px',
            background:'transparent', border:'none', color:'#94a3b8', fontSize:20,
            display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
          }}>
          🔔
          {unreadNotifications > 0 && (
            <span style={{
              position:'absolute', top:6, right:4, minWidth:17, height:17, borderRadius:'50%',
              background:'linear-gradient(135deg,#ef4444,#dc2626)', border:'2px solid #0a0a18',
              color:'white', fontSize:9, fontWeight:800,
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              {unreadNotifications > 9 ? '9+' : unreadNotifications}
            </span>
          )}
        </button>

        {/* 🧪 Beta Feedback — BETA-FEEDBACK (May 28 2026) */}
        <button
          onClick={() => setFeedbackOpen(true)}
          aria-label="Send beta feedback"
          style={{
            minWidth:44, minHeight:44, borderRadius:12, padding:'0 8px',
            background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.3)',
            color:'#10b981', fontSize:14, fontWeight:700,
            display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
          }}>
          🧪 Feedback
        </button>
        {feedbackOpen && (
          <Suspense fallback={null}>
            <BetaFeedbackModal onClose={() => setFeedbackOpen(false)} />
          </Suspense>
        )}

        {/* 🛡️ Admin Panel — only visible to CEO/admin account (isAdmin === true) */}
        {isAdmin && (
          <button
            onClick={() => navigate('/admin')}
            aria-label="Admin Panel"
            title="Switch to Admin Panel"
            style={{
              minWidth:44, minHeight:44, borderRadius:12, padding:'0 8px',
              background: location.pathname.startsWith('/admin')
                ? 'rgba(239,68,68,0.25)'
                : 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.35)',
              color:'#f87171', fontSize:14, fontWeight:700,
              display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
            }}>
            🛡️
          </button>
        )}

        {/* Avatar — POLISH-11 FIX: 44×44px */}
        <button
          onClick={() => navigate('/profile')}
          aria-label="Profile"
          style={{
            width:44, height:44, borderRadius:'50%', overflow:'hidden',
            background:'linear-gradient(135deg,#6366f1,#ec4899)',
            border:'2px solid rgba(99,102,241,0.4)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:16, fontWeight:800, color:'white', cursor:'pointer',
            flexShrink:0,
          }}>
          {user?.photoURL
            ? <img src={user.photoURL} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            : (user?.displayName?.[0]?.toUpperCase() || '?')}
        </button>
      </div>
    </header>
  );
}
