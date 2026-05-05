// src/components/layout/BottomNav.jsx
// Left-side vertical sidebar — transparent glass, retractable with a pull-tab toggle
// position: fixed so it floats over content without disturbing the layout flow

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAppStore from '@store/useAppStore';

const TABS = [
  { path: '/feed',          icon: '🏠', label: 'Home' },
  { path: '/search',        icon: '🔍', label: 'Search' },
  { path: '/messages',      icon: '💬', label: 'Messages',  badge: 'unreadMessages' },
  { path: '/notifications', icon: '🔔', label: 'Alerts',    badge: 'unreadNotifications' },
  { path: '/menu',          icon: '☰',  label: 'More' },
];

const NAV_WIDTH = 72; // px — width of the sidebar panel

export default function SideNav() {
  const navigate   = useNavigate();
  const { pathname } = useLocation();
  const [expanded, setExpanded] = useState(true);

  const unreadMessages      = useAppStore((s) => s.unreadMessages);
  const unreadNotifications = useAppStore((s) => s.unreadNotifications);
  const counts = { unreadMessages, unreadNotifications };

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
          // slides fully off-screen when retracted; translateY keeps it centred
          transform: `translateY(-50%) translateX(${expanded ? '0' : `-${NAV_WIDTH}px`})`,
          transition,
          zIndex: 300,

          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          gap: '4px',
          padding: '14px 6px',
          width: `${NAV_WIDTH}px`,

          // glass look
          background: 'rgba(15, 12, 41, 0.42)',
          backdropFilter: 'blur(22px)',
          WebkitBackdropFilter: 'blur(22px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderLeft: 'none',
          borderRadius: '0 20px 20px 0',
          boxShadow: '4px 0 24px rgba(0,0,0,0.35)',
        }}
      >
        {TABS.map(({ path, icon, label, badge }) => {
          const primaryPaths = ['/feed', '/search', '/messages', '/notifications'];
          const isMore  = path === '/menu';
          const active  = isMore
            ? pathname.startsWith('/menu') || !primaryPaths.some(p => pathname.startsWith(p))
            : pathname.startsWith(path);
          const count   = badge ? counts[badge] : 0;

          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3px',
                padding: '9px 4px',
                borderRadius: '14px',
                background: active
                  ? 'rgba(99,102,241,0.22)'
                  : 'transparent',
                border: active
                  ? '1px solid rgba(99,102,241,0.35)'
                  : '1px solid transparent',
                opacity: active ? 1 : 0.55,
                transform: active ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.2s',
                cursor: 'pointer',
              }}
            >
              {/* Icon */}
              <span style={{
                fontSize: isMore ? '17px' : '19px',
                lineHeight: 1,
                fontWeight: isMore ? 800 : 400,
              }}>
                {icon}
              </span>

              {/* Label */}
              <span style={{
                fontSize: '9px',
                fontWeight: active ? 700 : 500,
                color: active ? '#818cf8' : '#94a3b8',
                letterSpacing: '0.02em',
                whiteSpace: 'nowrap',
              }}>
                {label}
              </span>

              {/* Unread badge */}
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
            </button>
          );
        })}
      </nav>

      {/* ── Pull-tab toggle ── always anchored to the right edge of the panel ── */}
      <button
        onClick={() => setExpanded(prev => !prev)}
        aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
        style={{
          position: 'fixed',
          top: '50%',
          left: 0,
          // moves with the panel: when expanded → right edge of panel; when retracted → screen edge
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
