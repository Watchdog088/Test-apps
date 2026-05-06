// src/pages/menu/MenuPage.jsx
// Rec #29/#30: Reorganized into logical sections per spec.
// Sections: DISCOVER | YOU | CREATE & EARN | ENTERTAINMENT | ACCOUNT
// Layout: Full-page version (drawer overlay in AppShell handles slide-in behavior)

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';

// ── Menu sections per spec ──────────────────────────────────────────────────
const SECTIONS = [
  {
    label: 'DISCOVER',
    items: [
      { icon: '🔍', label: 'Search & Explore', path: '/search',    desc: 'Find people, posts & more' },
      { icon: '📈', label: 'Trending',          path: '/search',   state: { tab: 'trending' }, desc: 'What\'s hot right now' },
      { icon: '📅', label: 'Events',            path: '/events',   desc: 'Local & online events' },
      { icon: '👥', label: 'Groups',            path: '/groups',   desc: 'Community groups' },
    ],
  },
  {
    label: 'YOU',
    items: [
      { icon: '👫', label: 'Friends',      path: '/friends',       desc: 'Manage your connections' },
      { icon: '💾', label: 'Saved',        path: '/saved',         desc: 'Bookmarked posts' },
      { icon: '🔔', label: 'Notifications',path: '/notifications', desc: 'All your alerts' },
      { icon: '⭐', label: 'Premium',      path: '/premium',       desc: 'Unlock exclusive features' },
    ],
  },
  {
    label: 'CREATE & EARN',
    items: [
      { icon: '🎨', label: 'Creator Studio',   path: '/creator',   desc: 'Manage your content' },
      { icon: '💼', label: 'Business Tools',   path: '/business',  desc: 'Analytics & monetization' },
      { icon: '🛒', label: 'Marketplace',      path: '/marketplace',desc: 'Buy & sell anything' },
    ],
  },
  {
    label: 'ENTERTAINMENT',
    items: [
      { icon: '🎵', label: 'Music Player',   path: '/music',      desc: 'Stream your playlist' },
      { icon: '🎮', label: 'Gaming Hub',     path: '/gaming',     desc: 'Play & compete' },
      { icon: '🎬', label: 'Media Hub',      path: '/media',      desc: 'Videos & reels' },
      { icon: '📹', label: 'Video Calls',    path: '/videocalls', desc: 'Face-to-face calls' },
      { icon: '🌐', label: 'AR / VR',        path: '/arvr',       desc: 'Augmented reality camera' },
    ],
  },
  {
    label: 'ACCOUNT',
    items: [
      { icon: '⚙️', label: 'Settings',     path: '/settings',  desc: 'App preferences' },
      { icon: '❓', label: 'Help & Support',path: '/help',      desc: 'FAQs & contact support' },
    ],
  },
];

// ── Styles ──────────────────────────────────────────────────────────────────
const S = {
  page:    { background: '#0a0a18', minHeight: '100vh', paddingBottom: 80 },
  header:  { padding: '20px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.07)' },
  title:   { fontSize: 22, fontWeight: 800, color: '#f1f5f9', marginBottom: 2 },
  sub:     { fontSize: 13, color: '#64748b' },
  section: { marginBottom: 4 },
  sectionHdr: {
    fontSize: 10, fontWeight: 800, letterSpacing: '0.10em',
    textTransform: 'uppercase', color: '#475569',
    padding: '18px 16px 8px',
  },
  item:    {
    display: 'flex', alignItems: 'center', gap: 14,
    padding: '12px 16px', cursor: 'pointer',
    transition: 'background 0.15s',
  },
  iconBox: {
    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 20, background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.10)',
  },
  itemLabel: { fontWeight: 600, fontSize: 15, color: '#f1f5f9', lineHeight: 1.3 },
  itemDesc:  { fontSize: 12, color: '#64748b', marginTop: 1 },
  divider:   { height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 16px' },
  signOut:   {
    margin: '8px 16px', padding: '14px 16px', borderRadius: 14,
    display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
    background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.20)',
    transition: 'background 0.15s',
  },
};

function MenuItem({ icon, label, desc, onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      style={{ ...S.item, background: hover ? 'rgba(255,255,255,0.04)' : 'transparent' }}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div style={S.iconBox}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={S.itemLabel}>{label}</div>
        {desc && <div style={S.itemDesc}>{desc}</div>}
      </div>
      <span style={{ color: '#334155', fontSize: 18 }}>›</span>
    </div>
  );
}

export default function MenuPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [hoverSignOut, setHoverSignOut] = React.useState(false);

  async function handleSignOut() {
    try {
      await logout();
      navigate('/login');
    } catch (e) {
      console.error('Logout error:', e);
    }
  }

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <div style={S.title}>More</div>
        <div style={S.sub}>All features & settings</div>
      </div>

      {/* Sections */}
      {SECTIONS.map((section) => (
        <div key={section.label} style={S.section}>
          <div style={S.sectionHdr}>{section.label}</div>
          {section.items.map((item, idx) => (
            <React.Fragment key={item.label}>
              <MenuItem
                icon={item.icon}
                label={item.label}
                desc={item.desc}
                onClick={() => navigate(item.path, item.state ? { state: item.state } : undefined)}
              />
              {idx < section.items.length - 1 && <div style={S.divider} />}
            </React.Fragment>
          ))}
        </div>
      ))}

      {/* Sign Out — separate, danger style */}
      <div
        style={{
          ...S.signOut,
          background: hoverSignOut ? 'rgba(239,68,68,0.18)' : 'rgba(239,68,68,0.10)',
        }}
        onClick={handleSignOut}
        onMouseEnter={() => setHoverSignOut(true)}
        onMouseLeave={() => setHoverSignOut(false)}
      >
        <div style={{ ...S.iconBox, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.25)' }}>
          🚪
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ ...S.itemLabel, color: '#f87171' }}>Sign Out</div>
          <div style={S.itemDesc}>Sign out of your account</div>
        </div>
      </div>
    </div>
  );
}
