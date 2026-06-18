// src/components/layout/MobileBottomNav.jsx
// DESIGN-UPDATE Jun-2026: Minimalist outline/hollow button style for mobile tabs
// CRITICAL-FIX Jun-2026: Mobile-first bottom tab bar (Instagram/TikTok pattern)
// Only renders on viewports < 640px.
// Tabs: Home | Search | ➕ Create | Messages | ··· More

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAppStore from '@store/useAppStore';

const MOBILE_NAV_H = 64; // px — exported so AppShell can use it for padding

export { MOBILE_NAV_H };

const TABS = [
  { path: '/feed',      icon: '🏠', label: 'Home' },
  { path: '/search',    icon: '🔍', label: 'Search' },
  { path: '__create__', icon: '➕', label: 'Create', create: true },
  { path: '/messages',  icon: '💬', label: 'Messages', badge: 'unreadMessages' },
  { path: '__more__',   icon: '⋯',  label: 'More',    more: true },
];

export default function MobileBottomNav({ onCreatePost }) {
  const navigate    = useNavigate();
  const { pathname } = useLocation();

  const unreadMessages      = useAppStore((s) => s.unreadMessages);
  const unreadNotifications = useAppStore((s) => s.unreadNotifications ?? 0);
  const setMoreDrawerOpen   = useAppStore((s) => s.setMoreDrawerOpen);
  const counts = { unreadMessages, unreadNotifications };

  const handleTab = (tab) => {
    if (tab.create) {
      if (onCreatePost) onCreatePost();
      else navigate('/post/create');
      return;
    }
    if (tab.more) {
      setMoreDrawerOpen(true);
      return;
    }
    navigate(tab.path);
  };

  return (
    <nav
      aria-label="Mobile bottom navigation"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: MOBILE_NAV_H,
        // DESIGN: Deeper dark glass, clean outline top border
        background: 'rgba(8, 6, 24, 0.97)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(99,102,241,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 280,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        boxShadow: '0 -2px 20px rgba(0,0,0,0.35)',
      }}
    >
      {TABS.map((tab) => {
        const active   = !tab.create && !tab.more && pathname.startsWith(tab.path);
        const count    = tab.badge ? counts[tab.badge] : 0;
        const isCreate = tab.create;
        const isMore   = tab.more;

        return (
          <button
            key={tab.path}
            onClick={() => handleTab(tab)}
            aria-label={tab.label}
            aria-current={active ? 'page' : undefined}
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              flex: 1,
              height: '100%',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              padding: '6px 4px',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {/* Create button — DESIGN: Outline pill (not solid fill) */}
            {isCreate ? (
              <div style={{
                width: 44,
                height: 28,
                borderRadius: 9,
                // DESIGN: Outline style — transparent with gradient border
                background: 'transparent',
                border: '1.5px solid rgba(99,102,241,0.60)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                // Subtle inner glow on create
                boxShadow: '0 0 10px rgba(99,102,241,0.20), inset 0 0 8px rgba(99,102,241,0.05)',
              }}>
                {tab.icon}
              </div>
            ) : isMore ? (
              /* More dots — DESIGN: outline capsule */
              <div style={{
                display: 'flex',
                gap: 3,
                alignItems: 'center',
                justifyContent: 'center',
                height: 24,
                padding: '4px 8px',
                borderRadius: 8,
                border: `1px solid ${unreadNotifications > 0 ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.10)'}`,
                background: 'transparent',
              }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background: unreadNotifications > 0 ? '#f87171' : '#64748b',
                  }} />
                ))}
              </div>
            ) : (
              /* Standard tab icon — DESIGN: outline wrapper when active */
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 28,
                borderRadius: 8,
                // Hollow outline only when active
                border: active
                  ? '1px solid rgba(129,140,248,0.45)'
                  : '1px solid transparent',
                background: active
                  ? 'rgba(99,102,241,0.10)'
                  : 'transparent',
                transition: 'all 0.18s ease',
              }}>
                <span style={{
                  fontSize: 20,
                  lineHeight: 1,
                  filter: active ? 'drop-shadow(0 0 5px rgba(129,140,248,0.5))' : 'none',
                  transition: 'filter 0.2s, transform 0.15s',
                  transform: active ? 'scale(1.10)' : 'scale(1)',
                  display: 'block',
                }}>
                  {tab.icon}
                </span>
              </div>
            )}

            {/* Label */}
            {!isCreate && (
              <span style={{
                fontSize: 10,
                fontWeight: active ? 700 : 400,
                color: active ? '#818cf8' : '#475569',
                letterSpacing: '0.01em',
                lineHeight: 1,
                transition: 'color 0.18s',
              }}>
                {tab.label}
              </span>
            )}

            {/* Active indicator — slim bottom line */}
            {active && (
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 24,
                height: 2,
                borderRadius: '2px 2px 0 0',
                background: 'linear-gradient(90deg, #6366f1, #ec4899)',
              }} />
            )}

            {/* More tab notification dot */}
            {isMore && unreadNotifications > 0 && (
              <span style={{
                position: 'absolute',
                top: 6,
                right: 'calc(50% - 20px)',
                background: '#ef4444',
                color: 'white',
                borderRadius: '50%',
                fontSize: 9,
                fontWeight: 800,
                minWidth: 16,
                height: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1.5px solid rgba(8,6,24,0.95)',
                padding: '0 3px',
              }}>
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            )}

            {/* Unread badge */}
            {count > 0 && (
              <span style={{
                position: 'absolute',
                top: 6,
                right: 'calc(50% - 20px)',
                background: '#ef4444',
                color: 'white',
                borderRadius: '50%',
                fontSize: 9,
                fontWeight: 800,
                minWidth: 16,
                height: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1.5px solid rgba(8,6,24,0.95)',
                padding: '0 3px',
              }}>
                {count > 99 ? '99+' : count > 9 ? '9+' : count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
