// src/components/layout/BottomNav.jsx
// Left-side vertical sidebar — Home | Live | Dating | Messages | Marketplace | Search | Notifications | Profile
// UX-01 FIX: Sidebar defaults to collapsed (false) on mobile viewports < 640px
// BUG-06 FIX: Removed fake timer for live badge; only shows when real data says so
// CRITICAL-FIX Jun-2026: Added Search, Notifications (with unread badge), and Profile tabs

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAppStore from '@store/useAppStore';

const NAV_WIDTH = 72; // px

// ── Sidebar tabs — Home | Live | Dating | Messages | Shop | Search | Alerts | Profile | More
const TABS = [
  { path: '/feed',          icon: '🏠', label: 'Home' },
  { path: '/live',          icon: '🔴', label: 'Live',     live: true },
  { path: '/dating',        icon: '❤️', label: 'Dating' },
  { path: '/messages',      icon: '💬', label: 'Messages', badge: 'unreadMessages' },
  { path: '/marketplace',   icon: '🛒', label: 'Shop' },
  { path: '/search',        icon: '🔍', label: 'Search' },
  { path: '/notifications', icon: '🔔', label: 'Alerts',   badge: 'unreadNotifications' },
  { path: '/profile',       icon: '👤', label: 'Profile' },
  { path: '/menu',          icon: '☰',  label: 'More' },
];

const PRIMARY_PATHS = ['/feed', '/live', '/dating', '/messages', '/marketplace', '/search', '/notifications', '/profile'];

export default function SideNav() {
  const navigate          = useNavigate();
  const { pathname }      = useLocation();

  // UX-01 FIX: Default to collapsed on mobile (< 640px), expanded on desktop
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const [expanded, setExpanded] = useState(!isMobile);

  // BUG-06 FIX: friendsLive defaults false; would be set by a real Firestore query
  // For now we leave it false — no fake timer, no misleading badge
  const [friendsLive, setFriendsLive] = useState(false);

  const unreadMessages       = useAppStore((s) => s.unreadMessages);
  const unreadNotifications  = useAppStore((s) => s.unreadNotifications ?? 0);
  const setMoreDrawerOpen    = useAppStore((s) => s.setMoreDrawerOpen);
  const counts = { unreadMessages, unreadNotifications };

  // BUG-06 FIX: In production, replace this with a real Firestore listener:
  // e.g. query(collection(db,'streams'), where('isLive','==',true), where('userId','in', followingIds))
  // For now we leave friendsLive=false to avoid fake "live" badges
  useEffect(() => {
    // Real implementation would be something like:
    // const q = query(collection(db,'streams'), where('isLive','==',true));
    // const unsub = onSnapshot(q, snap => setFriendsLive(snap.size > 0));
    // return unsub;
  }, []);

  const transition = 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)';

  return (
    <>
      {/* ── Sidebar panel ── */}
      <nav
        aria-label="Side navigation"
        style={{
          position: 'fixed',
          left: 0,
          top: '50%',
          transform: `translateY(-50%) translateX(${expanded ? '0' : `-${NAV_WIDTH}px`})`,
          transition,
          zIndex: 300,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          gap: '4px',
          padding: '14px 6px',
          width: `${NAV_WIDTH}px`,
          background: 'rgba(15, 12, 41, 0.42)',
          backdropFilter: 'blur(22px)',
          WebkitBackdropFilter: 'blur(22px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderLeft: 'none',
          borderRadius: '0 20px 20px 0',
          boxShadow: '4px 0 24px rgba(0,0,0,0.35)',
        }}
      >
        {TABS.map(({ path, icon, label, badge, live }) => {
          const isMore  = path === '/menu';
          const active  = isMore
            ? pathname.startsWith('/menu') || !PRIMARY_PATHS.some(p => pathname.startsWith(p))
            : pathname.startsWith(path);
          const count   = badge ? counts[badge] : 0;
          const showLiveBadge = live && friendsLive;

          return (
            <button
              key={path}
              onClick={() => isMore ? setMoreDrawerOpen(true) : navigate(path)}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3px',
                // Touch target: minimum 44px height
                minHeight: '44px',
                padding: '10px 4px',
                borderRadius: '14px',
                background: active
                  ? live
                    ? 'rgba(239,68,68,0.20)'
                    : 'rgba(99,102,241,0.22)'
                  : 'transparent',
                border: active
                  ? live
                    ? '1px solid rgba(239,68,68,0.40)'
                    : '1px solid rgba(99,102,241,0.35)'
                  : '1px solid transparent',
                opacity: active ? 1 : 0.55,
                transform: active ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.2s',
                cursor: 'pointer',
              }}
            >
              {/* Icon */}
              <span style={{
                fontSize: isMore ? '17px' : '20px',
                lineHeight: 1,
                fontWeight: isMore ? 800 : 400,
              }}>
                {icon}
              </span>

              {/* Label */}
              <span style={{
                fontSize: '9px',
                fontWeight: active ? 700 : 500,
                color: active
                  ? live ? '#f87171' : '#818cf8'
                  : '#94a3b8',
                letterSpacing: '0.02em',
                whiteSpace: 'nowrap',
              }}>
                {label}
              </span>

              {/* Unread messages badge */}
              {count > 0 && (
                <span style={{
                  position: 'absolute',
                  top: 5, right: 5,
                  background: '#ef4444',
                  color: 'white',
                  borderRadius: '50%',
                  fontSize: '8px',
                  fontWeight: 800,
                  width: '14px',
                  height: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1.5px solid rgba(15,12,41,0.7)',
                }}>
                  {count > 9 ? '9+' : count}
                </span>
              )}

              {/* 🔴 Live pulsing badge — only shows when real streams exist */}
              {showLiveBadge && (
                <span style={{
                  position: 'absolute',
                  top: 4, right: 4,
                  background: '#ef4444',
                  borderRadius: '50%',
                  width: '8px',
                  height: '8px',
                  border: '1.5px solid rgba(15,12,41,0.7)',
                  animation: 'livePulse 1.4s ease-in-out infinite',
                }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Pull-tab toggle ── */}
      <button
        onClick={() => setExpanded(prev => !prev)}
        aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
        style={{
          position: 'fixed',
          top: '50%',
          left: 0,
          transform: `translateY(-50%) translateX(${expanded ? `${NAV_WIDTH}px` : '0'})`,
          transition,
          zIndex: 301,
          background: 'rgba(99,102,241,0.70)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(99,102,241,0.55)',
          borderLeft: 'none',
          borderRadius: '0 10px 10px 0',
          boxShadow: '3px 0 12px rgba(99,102,241,0.4)',
          color: 'white',
          fontSize: '16px',
          fontWeight: 900,
          lineHeight: 1,
          padding: '12px 5px',
          cursor: 'pointer',
          userSelect: 'none',
          letterSpacing: '-1px',
        }}
      >
        {expanded ? '‹' : '›'}
      </button>
    </>
  );
}
