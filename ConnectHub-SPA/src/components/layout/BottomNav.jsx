// src/components/layout/BottomNav.jsx
// UNIX-ICONS Jun-2026: Replaced emoji sidebar tabs with unix SVG icon buttons
// DESIGN-UPDATE Jun-2026: Minimalist outline/hollow button style for sidebar tabs
// SIDEBAR-UPDATE Jun-2026: Removed Alerts (notifications) + Live; Added Media Hub
// Sidebar tabs: Home | Dating | Messages | Shop | Media Hub | Search | Profile | More

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAppStore from '@store/useAppStore';
import UnixIconBtn from '@components/common/UnixIconBtn';

const NAV_WIDTH = 72; // px

// ── Sidebar tabs — unix icon key maps to SVG in UnixIconBtn component
const TABS = [
  { path: '/feed',        icon: 'home',        label: 'Home' },
  { path: '/dating',      icon: 'dating',      label: 'Dating' },
  { path: '/messages',    icon: 'messages',    label: 'Messages', badge: 'unreadMessages' },
  { path: '/marketplace', icon: 'marketplace', label: 'Shop' },
  { path: '/media',       icon: 'media',       label: 'Media Hub' },
  { path: '/search',      icon: 'search',      label: 'Search' },
  { path: '/profile',     icon: 'profile',     label: 'Profile' },
  { path: '/menu',        icon: 'more',        label: 'More' },
];

const PRIMARY_PATHS = ['/feed', '/dating', '/messages', '/marketplace', '/media', '/search', '/profile'];

export default function SideNav() {
  const navigate         = useNavigate();
  const { pathname }     = useLocation();
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const [expanded, setExpanded] = useState(!isMobile);

  const unreadMessages      = useAppStore((s) => s.unreadMessages);
  const unreadNotifications = useAppStore((s) => s.unreadNotifications ?? 0);
  const setMoreDrawerOpen   = useAppStore((s) => s.setMoreDrawerOpen);
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
          alignItems: 'center',
          gap: '4px',
          padding: '14px 6px',
          width: `${NAV_WIDTH}px`,
          background: 'rgba(10, 8, 30, 0.80)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(99,102,241,0.18)',
          borderLeft: 'none',
          borderRadius: '0 20px 20px 0',
          boxShadow: '4px 0 32px rgba(0,0,0,0.4)',
        }}
      >
        {TABS.map(({ path, icon, label, badge }) => {
          const isMore = path === '/menu';
          const active = isMore
            ? pathname.startsWith('/menu') || !PRIMARY_PATHS.some(p => pathname.startsWith(p))
            : pathname.startsWith(path);
          const count = badge ? (counts[badge] ?? 0) : 0;

          return (
            <UnixIconBtn
              key={path}
              icon={icon}
              label={label}
              active={active}
              badge={count}
              variant="sidebar"
              size="md"
              onClick={() => isMore ? setMoreDrawerOpen(true) : navigate(path)}
            />
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
