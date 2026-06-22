// src/components/layout/MobileBottomNav.jsx
// WIREFRAME-BUTTONS Jun-2026: Replaced emoji tabs with new minimalist SVG UnixIconBtn buttons
// CRITICAL-FIX Jun-2026: Mobile-first bottom tab bar (Instagram/TikTok pattern)
// Only renders on viewports < 640px.
// Tabs: Home | Search | ➕ Create | Messages | ··· More

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAppStore from '@store/useAppStore';
import UnixIconBtn from '@components/common/UnixIconBtn';

const MOBILE_NAV_H = 64; // px — exported so AppShell can use it for padding

export { MOBILE_NAV_H };

const TABS = [
  { path: '/feed',      icon: 'home',     label: 'Home' },
  { path: '/search',    icon: 'search',   label: 'Search' },
  { path: '__create__', icon: 'compose',  label: 'Create', create: true },
  { path: '/messages',  icon: 'messages', label: 'Messages', badge: 'unreadMessages' },
  { path: '__more__',   icon: 'more',     label: 'More',    more: true },
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
        const count    = tab.badge ? (counts[tab.badge] ?? 0) : 0;

        // Create button — slightly larger, indigo outline pill style
        if (tab.create) {
          return (
            <button
              key={tab.path}
              onClick={() => handleTab(tab)}
              aria-label={tab.label}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                height: '100%',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                padding: '6px 4px',
                WebkitTapHighlightColor: 'transparent',
                gap: 3,
              }}
            >
              {/* Compose SVG icon in an indigo outline pill */}
              <div style={{
                width: 44,
                height: 30,
                borderRadius: 10,
                background: 'transparent',
                border: '1.5px solid rgba(99,102,241,0.60)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 10px rgba(99,102,241,0.20), inset 0 0 8px rgba(99,102,241,0.05)',
              }}>
                {/* Inline compose SVG */}
                <svg viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                  <path d="M12 20h9"/>
                  <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z"/>
                </svg>
              </div>
            </button>
          );
        }

        // More tab
        if (tab.more) {
          return (
            <button
              key={tab.path}
              onClick={() => handleTab(tab)}
              aria-label={tab.label}
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
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 28,
                borderRadius: 8,
                border: `1px solid ${unreadNotifications > 0 ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.10)'}`,
                background: 'transparent',
              }}>
                {/* More / hamburger SVG */}
                <svg viewBox="0 0 24 24" fill="none" stroke={unreadNotifications > 0 ? '#f87171' : '#7c8fa3'} strokeWidth="1.7" strokeLinecap="round" style={{ width: 16, height: 16 }}>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </div>
              <span style={{
                fontSize: 10,
                fontWeight: 400,
                color: '#475569',
                letterSpacing: '0.01em',
                lineHeight: 1,
              }}>
                More
              </span>
              {/* Notification dot on More */}
              {unreadNotifications > 0 && (
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
            </button>
          );
        }

        // Standard tab — use UnixIconBtn
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
            {/* UnixIconBtn wrapper div */}
            <UnixIconBtn
              icon={tab.icon}
              label={tab.label}
              active={active}
              badge={count}
              size="sm"
              variant="header"
              onClick={() => {}} /* click handled by parent button */
              style={{ pointerEvents: 'none' }}
            />

            {/* Label */}
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
          </button>
        );
      })}
    </nav>
  );
}
