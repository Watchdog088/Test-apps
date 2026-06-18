// src/components/layout/BottomNav.jsx
// DESIGN-UPDATE Jun-2026: Minimalist outline/hollow button style for sidebar tabs
// SIDEBAR-UPDATE Jun-2026: Removed Alerts (notifications) + Live; Added Media Hub
// Sidebar tabs: Home | Dating | Messages | Shop | Media Hub | Search | Profile | More

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAppStore from '@store/useAppStore';

const NAV_WIDTH = 72; // px

// ── Sidebar tabs — Home | Dating | Messages | Shop | Media Hub | Search | Profile | More
// CHANGED: Removed Live & Alerts; Added Media Hub
const TABS = [
  { path: '/feed',        icon: '🏠', label: 'Home' },
  { path: '/dating',      icon: '❤️', label: 'Dating' },
  { path: '/messages',    icon: '💬', label: 'Messages', badge: 'unreadMessages' },
  { path: '/marketplace', icon: '🛒', label: 'Shop' },
  { path: '/media',       icon: '🎬', label: 'Media Hub' },
  { path: '/search',      icon: '🔍', label: 'Search' },
  { path: '/profile',     icon: '👤', label: 'Profile' },
  { path: '/menu',        icon: '☰',  label: 'More' },
];

const PRIMARY_PATHS = ['/feed', '/dating', '/messages', '/marketplace', '/media', '/search', '/profile'];

export default function SideNav() {
  const navigate          = useNavigate();
  const { pathname }      = useLocation();
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const [expanded, setExpanded] = useState(!isMobile);

  const unreadMessages       = useAppStore((s) => s.unreadMessages);
  const unreadNotifications  = useAppStore((s) => s.unreadNotifications ?? 0);
  const setMoreDrawerOpen    = useAppStore((s) => s.setMoreDrawerOpen);
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
          transform: `translateY(-50%) translateX(${expanded ? '0' : `-${NAV_WIDTH}px`})`,
          transition,
          zIndex: 300,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          gap: '4px',
          padding: '14px 6px',
          width: `${NAV_WIDTH}px`,
          background: 'rgba(10, 8, 30, 0.75)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(99,102,241,0.18)',
          borderLeft: 'none',
          borderRadius: '0 20px 20px 0',
          boxShadow: '4px 0 32px rgba(0,0,0,0.4)',
        }}
      >
        {TABS.map(({ path, icon, label, badge }) => {
          const isMore  = path === '/menu';
          const active  = isMore
            ? pathname.startsWith('/menu') || !PRIMARY_PATHS.some(p => pathname.startsWith(p))
            : pathname.startsWith(path);
          const count   = badge ? counts[badge] : 0;

          // DESIGN: Outline/hollow button — transparent bg with colored border when active
          const activeColor = '#818cf8'; // indigo accent
          const borderStyle = active
            ? `1px solid ${activeColor}`
            : '1px solid rgba(255,255,255,0.10)';
          const bgStyle = active
            ? 'rgba(99,102,241,0.12)'
            : 'transparent';

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
                minHeight: '44px',
                padding: '10px 4px',
                borderRadius: '12px',
                background: bgStyle,
                border: borderStyle,
                opacity: active ? 1 : 0.65,
                transform: active ? 'scale(1.04)' : 'scale(1)',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                // Hollow/outline look — no fill, just border + icon
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.background = 'rgba(99,102,241,0.08)';
                  e.currentTarget.style.border = '1px solid rgba(99,102,241,0.30)';
                  e.currentTarget.style.opacity = '1';
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.border = '1px solid rgba(255,255,255,0.10)';
                  e.currentTarget.style.opacity = '0.65';
                }
              }}
            >
              {/* Icon */}
              <span style={{
                fontSize: isMore ? '16px' : '19px',
                lineHeight: 1,
                fontWeight: isMore ? 800 : 400,
                // Active icons get a subtle glow via drop-shadow
                filter: active ? 'drop-shadow(0 0 6px rgba(129,140,248,0.6))' : 'none',
                transition: 'filter 0.2s',
              }}>
                {icon}
              </span>

              {/* Label */}
              <span style={{
                fontSize: '9px',
                fontWeight: active ? 700 : 500,
                color: active ? activeColor : '#64748b',
                letterSpacing: '0.02em',
                whiteSpace: 'nowrap',
              }}>
                {label}
              </span>

              {/* Active indicator — slim left-side accent bar */}
              {active && (
                <span style={{
                  position: 'absolute',
                  left: -6,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 3,
                  height: 24,
                  borderRadius: '0 3px 3px 0',
                  background: 'linear-gradient(180deg, #6366f1, #ec4899)',
                }} />
              )}

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
                  border: '1.5px solid rgba(10,8,30,0.8)',
                }}>
                  {count > 9 ? '9+' : count}
                </span>
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
          // DESIGN: Outline hollow toggle tab
          background: 'rgba(10,8,30,0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(99,102,241,0.40)',
          borderLeft: 'none',
          borderRadius: '0 10px 10px 0',
          boxShadow: '3px 0 12px rgba(99,102,241,0.2)',
          color: '#818cf8',
          fontSize: '15px',
          fontWeight: 900,
          lineHeight: 1,
          padding: '12px 5px',
          cursor: 'pointer',
          userSelect: 'none',
          letterSpacing: '-1px',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(99,102,241,0.15)';
          e.currentTarget.style.borderColor = 'rgba(99,102,241,0.6)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(10,8,30,0.85)';
          e.currentTarget.style.borderColor = 'rgba(99,102,241,0.40)';
        }}
      >
        {expanded ? '‹' : '›'}
      </button>
    </>
  );
}
