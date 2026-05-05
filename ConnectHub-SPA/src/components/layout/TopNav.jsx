// src/components/layout/TopNav.jsx
// Right-side strip (left → right): Avatar | ✏️ Create | 🔍 Search | 🔔 Alerts | ☰ Menu

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAppStore from '@store/useAppStore';

const TITLES = {
  '/feed':'ConnectHub','/stories':'Stories','/live':'Live','/trending':'Trending',
  '/groups':'Groups','/messages':'Messages','/notifications':'Notifications',
  '/profile':'Profile','/friends':'Friends','/dating':'Dating',
  '/events':'Events','/gaming':'Gaming','/marketplace':'Marketplace',
  '/media':'Media Hub','/music':'Music','/videocalls':'Video Calls',
  '/livestream':'Live Stream','/arvr':'AR / VR','/saved':'Saved',
  '/search':'Search','/settings':'Settings','/business':'Business Tools',
  '/creator':'Creator','/help':'Help & Support','/menu':'Menu','/premium':'Premium',
};

/* ── shared icon-button base style ── */
const iconBtn = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '6px',
  borderRadius: '10px',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid transparent',
  cursor: 'pointer',
  lineHeight: 1,
  fontSize: '19px',
  transition: 'background 0.18s, transform 0.15s',
  flexShrink: 0,
};

export default function TopNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const unreadNotifications = useAppStore((s) => s.unreadNotifications);
  const user = useAppStore((s) => s.user);        // Firebase user object (or null)

  const base  = '/' + pathname.split('/')[1];
  const title = TITLES[base] || 'ConnectHub';

  /* Derive avatar initials / photo from user */
  const displayName = user?.displayName || user?.email || 'You';
  const photoURL    = user?.photoURL || null;
  const initials    = displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <header style={{
      height: 'var(--top-nav-h)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 12px',
      background: 'rgba(15,12,41,0.95)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      flexShrink: 0,
      zIndex: 100,
    }}>

      {/* ── Left: Gradient app title ── */}
      <span
        onClick={() => navigate('/feed')}
        style={{
          fontWeight: 700,
          fontSize: '18px',
          cursor: 'pointer',
          background: 'linear-gradient(135deg,#6366f1,#ec4899)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          flexShrink: 0,
        }}
      >
        {title}
      </span>

      {/* ── Right: Avatar | Create | Search | Notifications | Menu ── */}
      <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>

        {/* 1 ── Profile Avatar */}
        <button
          onClick={() => navigate('/profile')}
          aria-label="My profile"
          style={{
            ...iconBtn,
            padding: 0,
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '2px solid rgba(99,102,241,0.55)',
            background: photoURL ? 'transparent' : 'linear-gradient(135deg,#6366f1,#ec4899)',
            flexShrink: 0,
          }}
        >
          {photoURL ? (
            <img
              src={photoURL}
              alt={displayName}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              referrerPolicy="no-referrer"
            />
          ) : (
            <span style={{
              fontSize: '12px',
              fontWeight: 800,
              color: 'white',
              lineHeight: 1,
              letterSpacing: '-0.5px',
            }}>
              {initials || '😊'}
            </span>
          )}
        </button>

        {/* 2 ── Create Post */}
        <button
          onClick={() => navigate('/feed')}
          aria-label="Create post"
          style={{
            ...iconBtn,
            background: 'rgba(99,102,241,0.15)',
            border: '1px solid rgba(99,102,241,0.28)',
          }}
        >
          ✏️
        </button>

        {/* 3 ── Search */}
        <button
          onClick={() => navigate('/search')}
          aria-label="Search"
          style={iconBtn}
        >
          🔍
        </button>

        {/* 4 ── Notifications with badge */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => navigate('/notifications')}
            aria-label="Notifications"
            style={iconBtn}
          >
            🔔
          </button>
          {unreadNotifications > 0 && (
            <span style={{
              position: 'absolute',
              top: 0,
              right: 2,
              background: '#ef4444',
              color: 'white',
              borderRadius: '50%',
              fontSize: '9px',
              fontWeight: 800,
              width: '15px',
              height: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              border: '1.5px solid rgba(15,12,41,0.8)',
            }}>
              {unreadNotifications > 9 ? '9+' : unreadNotifications}
            </span>
          )}
        </div>

        {/* 5 ── Hamburger → Full Menu (Marketplace, Dating, Gaming, etc.) */}
        <button
          onClick={() => navigate('/menu')}
          aria-label="Menu"
          style={{
            ...iconBtn,
            background: 'rgba(99,102,241,0.18)',
            border: '1px solid rgba(99,102,241,0.38)',
            fontWeight: 700,
          }}
        >
          ☰
        </button>
      </div>
    </header>
  );
}
