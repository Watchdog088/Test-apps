// src/components/layout/TopNav.jsx
// POLISH-14 FIX: Brand name is "LynkApp" on Feed page
// POLISH-19 FIX: LynkApp logo shown in top-left on Feed; page title elsewhere
// POLISH-17 FIX: Search icon active state (accent color when on /search)
// UX-14 FIX: Removed duplicate ☰ button from TopNav — it stays in SideNav only
// POLISH-11 FIX: Avatar touch target 44×44px

import React from 'react';
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

export default function TopNav() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user }  = useAuth();
  const { unreadNotifications, setCreatePostOpen } = useAppStore();

  const path = location.pathname;
  const isFeed   = path === '/feed' || path === '/';
  const isSearch = path.startsWith('/search');

  async function handleSignOut() {
    try { await signOut(auth); navigate('/login', { replace: true }); } catch {}
  }

  const pageTitle = PAGE_TITLES[path] || PAGE_TITLES[`/${path.split('/')[1]}`] || 'LynkApp';

  return (
    <header style={{
      position:'fixed', top:0, left:0, right:0, zIndex:200,
      height:'var(--top-nav-h, 56px)',
      background:'rgba(10,10,24,0.92)', backdropFilter:'blur(20px)',
      borderBottom:'1px solid rgba(255,255,255,0.07)',
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'0 16px',
    }}>
      {/* Left: Logo on Feed, page title elsewhere */}
      {/* UX-13 FIX: Personalised greeting on Feed showing user's first name */}
      <div style={{ display:'flex', alignItems:'center', gap:8, minWidth:0 }}>
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
