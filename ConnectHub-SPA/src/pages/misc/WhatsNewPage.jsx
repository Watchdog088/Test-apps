// src/pages/misc/WhatsNewPage.jsx
// MISSING #2 — What's New / Changelog Dashboard
// Beta testers can see what features are in each release

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RELEASES = [
  {
    version: 'v1.0.0-beta.3',
    date: 'June 9, 2026',
    tag: 'LATEST',
    tagColor: '#22c55e',
    highlights: ['Push Notification Permission Dashboard', 'Profile Completion tracker', 'Beta Tester Personal Dashboard', 'Offline / Network Error UI', "What's New page (this page!)"],
    sections: [
      { label: '🆕 New Features', items: ['Push notification permission flow with granular controls', 'Profile completion progress card on Feed', 'Beta tester dashboard at /beta', 'Offline overlay with retry + connection-restored toast', "What's New changelog page"] },
      { label: '🐛 Bug Fixes', items: ['Feed empty state now shows for new users', 'Create Post FAB added to feed', 'Stories row added to top of feed', 'Mobile bottom nav confirmed on all viewports < 640px'] },
      { label: '⚡ Improvements', items: ['Persistent feedback FAB on all authenticated pages', 'Logout button surfaced on Profile and Settings', 'Invite Friends card added to Friends page'] },
    ],
  },
  {
    version: 'v1.0.0-beta.2',
    date: 'May 27, 2026',
    tag: 'PREVIOUS',
    tagColor: '#6366f1',
    highlights: ['Meetings system', 'Video call room', 'Music + Podcasts', 'Admin analytics'],
    sections: [
      { label: '🆕 New Features', items: ['Meeting dashboard, waiting room & meeting room', 'Video call room with WebRTC P2P', 'Music page + Podcast + Podcast Studio', 'Admin analytics dashboard', 'Wallet page', 'Followers / Following pages'] },
      { label: '🐛 Bug Fixes', items: ['Email verification gate fixed', 'Dark mode persistence across sessions', 'Story viewer swipe direction corrected'] },
    ],
  },
  {
    version: 'v1.0.0-beta.1',
    date: 'May 14, 2026',
    tag: 'INITIAL BETA',
    tagColor: '#ec4899',
    highlights: ['120+ page React SPA launched', 'Firebase auth + Firestore', 'Dating swipe system', 'Marketplace with Stripe'],
    sections: [
      { label: '🚀 Initial Beta Launch', items: ['Full React SPA with 120+ routed pages', 'Firebase Authentication (email, Google, Apple)', 'Firestore real-time database', 'Dating swipe, matches, chat', 'Marketplace with KYC, checkout, seller dashboard', 'Live streaming hub with 15 sub-pages', 'Groups, Events, Friends system', 'Admin panel with role-gating', 'GDPR: Terms, Privacy, Cookie Consent'] },
    ],
  },
];

const S = {
  page: { minHeight: '100vh', background: 'linear-gradient(135deg,#0f0c29,#1a1a3e)', padding: '20px 16px 100px', color: '#f1f5f9' },
  header: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 },
  back: { width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: 'none', color: '#94a3b8', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  card: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 20, padding: 20, marginBottom: 16 },
  version: { fontSize: 18, fontWeight: 800, color: '#f1f5f9' },
  date: { fontSize: 12, color: '#64748b', marginTop: 2 },
  tag: (color) => ({ display: 'inline-block', padding: '3px 10px', borderRadius: 10, background: `${color}22`, border: `1px solid ${color}55`, color, fontWeight: 700, fontSize: 11, marginLeft: 8 }),
  highlight: { display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12, marginBottom: 4 },
  chip: { background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20, padding: '4px 12px', fontSize: 12, color: '#818cf8', fontWeight: 600 },
  sectionLabel: { fontSize: 13, fontWeight: 700, color: '#94a3b8', marginTop: 14, marginBottom: 6, letterSpacing: '0.04em' },
  item: { display: 'flex', gap: 8, alignItems: 'flex-start', padding: '5px 0', fontSize: 14, color: '#e2e8f0', lineHeight: 1.5 },
  dot: { width: 6, height: 6, borderRadius: '50%', background: '#6366f1', flexShrink: 0, marginTop: 6 },
};

export default function WhatsNewPage() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState({ 0: true });

  React.useEffect(() => {
    localStorage.setItem('lynk_last_seen_changelog', new Date().toISOString());
  }, []);

  return (
    <div style={S.page}>
      <div style={S.header}>
        <button style={S.back} onClick={() => navigate(-1)} aria-label="Go back">←</button>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>What's New</div>
          <div style={{ fontSize: 13, color: '#64748b' }}>LynkApp beta release notes</div>
        </div>
      </div>

      {/* Beta badge */}
      <div style={{ ...S.card, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 28 }}>🧪</span>
          <div>
            <div style={{ fontWeight: 700, color: '#818cf8' }}>Beta Program Active</div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Your feedback shapes the app. Use the 💬 button to report anything!</div>
          </div>
        </div>
      </div>

      {RELEASES.map((rel, i) => (
        <div key={rel.version} style={S.card}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={S.version}>
                {rel.version}
                <span style={S.tag(rel.tagColor)}>{rel.tag}</span>
              </div>
              <div style={S.date}>Released {rel.date}</div>
            </div>
            <button
              onClick={() => setExpanded(e => ({ ...e, [i]: !e[i] }))}
              style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 20, cursor: 'pointer', padding: '0 4px' }}
            >
              {expanded[i] ? '▲' : '▼'}
            </button>
          </div>

          {/* Highlight chips */}
          <div style={S.highlight}>
            {rel.highlights.map(h => <span key={h} style={S.chip}>{h}</span>)}
          </div>

          {/* Expanded detail */}
          {expanded[i] && rel.sections.map(sec => (
            <div key={sec.label}>
              <div style={S.sectionLabel}>{sec.label}</div>
              {sec.items.map(item => (
                <div key={item} style={S.item}>
                  <div style={S.dot} />
                  {item}
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}

      <div style={{ textAlign: 'center', fontSize: 13, color: '#475569', marginTop: 8 }}>
        LynkApp Beta — All feedback is reviewed within 24 hours 🙏
      </div>
    </div>
  );
}
