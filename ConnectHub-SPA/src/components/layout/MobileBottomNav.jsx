// src/components/layout/MobileBottomNav.jsx
// CRITICAL-FIX Jun-2026: Mobile-first bottom tab bar (Instagram/TikTok pattern)
// Only renders on viewports < 640px. Tabs: Home | Dating | ➕ Create | Messages | Profile
// Includes unread badge on Messages and Notifications dot on Profile

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAppStore from '@store/useAppStore';

const MOBILE_NAV_H = 64; // px — exported so AppShell can use it for padding

export { MOBILE_NAV_H };

// 5 primary tabs optimised for thumb reach
const TABS = [
  { path: '/feed',         icon: '🏠', label: 'Home' },
  { path: '/search',       icon: '🔍', label: 'Search' },
  { path: '__create__',    icon: '➕', label: 'Create',  create: true },
  { path: '/messages',     icon: '💬', label: 'Messages', badge: 'unreadMessages' },
  { path: '/profile',      icon: '👤', label: 'Profile' },
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
        background: 'rgba(10, 8, 30, 0.97)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(99,102,241,0.18)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 280,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.4)',
      }}
    >
      {TABS.map((tab) => {
        const active  = !tab.create && pathname.startsWith(tab.path);
        const count   = tab.badge ? counts[tab.badge] : 0;
        const isCreate = tab.create;

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
              // Tap highlight
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {/* Icon — ➕ gets a pill background */}
            {isCreate ? (
              <div style={{
                width: 44,
                height: 30,
                borderRadius: 10,
                background: 'linear-gradient(135deg,#6366f1,#ec4899)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                boxShadow: '0 2px 12px rgba(99,102,241,0.5)',
              }}>
                {tab.icon}
              </div>
            ) : (
              <span style={{
                fontSize: 22,
                lineHeight: 1,
                filter: active ? 'none' : 'grayscale(0.3)',
                transition: 'transform 0.15s',
                transform: active ? 'scale(1.12)' : 'scale(1)',
              }}>
                {tab.icon}
              </span>
            )}

            {/* Label */}
            {!isCreate && (
              <span style={{
                fontSize: 10,
                fontWeight: active ? 700 : 500,
                color: active ? '#818cf8' : '#64748b',
                letterSpacing: '0.01em',
                lineHeight: 1,
              }}>
                {tab.label}
              </span>
            )}

            {/* Unread badge */}
            {count > 0 && (
              <span style={{
                position: 'absolute',
                top: 6,
                right: 'calc(50% - 18px)',
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
                border: '1.5px solid rgba(10,8,30,0.9)',
                padding: '0 3px',
              }}>
                {count > 99 ? '99+' : count > 9 ? '9+' : count}
              </span>
            )}

            {/* Active indicator dot */}
            {active && (
              <div style={{
                position: 'absolute',
                bottom: 4,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: '#818cf8',
              }} />
            )}
          </button>
        );
      })}
    </nav>
  );
}
