// src/pages/beta/BetaDashboardPage.jsx
// MISSING #4 — Beta Tester Personal Dashboard
// Shows tester's own submissions, explore checklist, and feedback status

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '@/firebase/config';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

const EXPLORE_CHECKLIST = [
  { key: 'feed',        icon: '🏠', label: 'Browse the Feed',          path: '/feed' },
  { key: 'stories',     icon: '📸', label: 'View or create a Story',   path: '/stories' },
  { key: 'dating',      icon: '❤️', label: 'Try the Dating swipe',     path: '/dating' },
  { key: 'live',        icon: '🔴', label: 'Watch a Live stream',      path: '/live' },
  { key: 'messages',    icon: '💬', label: 'Send a message',           path: '/messages' },
  { key: 'marketplace', icon: '🛒', label: 'Browse the Marketplace',   path: '/marketplace' },
  { key: 'groups',      icon: '👥', label: 'Join a Group',             path: '/groups' },
  { key: 'events',      icon: '📅', label: 'Check upcoming Events',    path: '/events' },
  { key: 'whats-new',   icon: '🆕', label: "Read What's New",          path: '/whats-new' },
  { key: 'profile',     icon: '👤', label: 'Complete your profile',    path: '/profile/setup' },
];

const STATUS_COLOR = { open: '#f59e0b', in_review: '#6366f1', resolved: '#22c55e', closed: '#475569' };
const STATUS_LABEL = { open: '🟡 Open', in_review: '🔵 In Review', resolved: '✅ Resolved', closed: '⬜ Closed' };

export default function BetaDashboardPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [explored, setExplored] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('lynk_beta_explored') || '{}');
    setExplored(saved);

    const fetchReports = async () => {
      if (!auth.currentUser) { setLoading(false); return; }
      try {
        const q = query(
          collection(db, 'betaFeedback'),
          where('userId', '==', auth.currentUser.uid),
          orderBy('createdAt', 'desc'),
          limit(20)
        );
        const snap = await getDocs(q);
        setReports(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch { setReports([]); }
      setLoading(false);
    };
    fetchReports();
  }, []);

  const markExplored = (key, path) => {
    const next = { ...explored, [key]: true };
    setExplored(next);
    localStorage.setItem('lynk_beta_explored', JSON.stringify(next));
    navigate(path);
  };

  const exploredCount = Object.values(explored).filter(Boolean).length;
  const exploredPct = Math.round((exploredCount / EXPLORE_CHECKLIST.length) * 100);

  const S = {
    page: { minHeight: '100vh', background: 'linear-gradient(135deg,#0f0c29,#1a1a3e)', padding: '20px 16px 100px', color: '#f1f5f9' },
    header: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 },
    back: { width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: 'none', color: '#94a3b8', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    card: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 20, padding: 20, marginBottom: 16 },
    bar: { height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.10)', overflow: 'hidden', margin: '10px 0' },
    fill: (pct) => ({ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#6366f1,#22c55e)', transition: 'width 0.5s' }),
    row: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' },
    chip: (color) => ({ display: 'inline-block', padding: '3px 10px', borderRadius: 10, background: `${color}22`, border: `1px solid ${color}55`, color, fontSize: 11, fontWeight: 700 }),
  };

  return (
    <div style={S.page}>
      <div style={S.header}>
        <button style={S.back} onClick={() => navigate(-1)}>←</button>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>🧪 Beta Dashboard</div>
          <div style={{ fontSize: 13, color: '#64748b' }}>Your personal beta tester hub</div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
        {[
          { label: 'Reports Sent', value: reports.length, icon: '📋' },
          { label: 'Resolved', value: reports.filter(r => r.status === 'resolved').length, icon: '✅' },
          { label: 'Explored', value: `${exploredCount}/${EXPLORE_CHECKLIST.length}`, icon: '🗺️' },
        ].map(s => (
          <div key={s.label} style={{ ...S.card, textAlign: 'center', padding: '14px 10px', marginBottom: 0 }}>
            <div style={{ fontSize: 22 }}>{s.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#f1f5f9', marginTop: 4 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Explore checklist */}
      <div style={S.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Explore Checklist</div>
          <div style={{ fontWeight: 800, color: '#22c55e', fontSize: 14 }}>{exploredPct}%</div>
        </div>
        <div style={S.bar}><div style={S.fill(exploredPct)} /></div>
        {EXPLORE_CHECKLIST.map((item, i) => {
          const done = !!explored[item.key];
          return (
            <div key={item.key} onClick={() => markExplored(item.key, item.path)}
              style={{ ...S.row, borderBottom: i < EXPLORE_CHECKLIST.length - 1 ? S.row.borderBottom : 'none', opacity: done ? 0.5 : 1 }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: done ? '#64748b' : '#f1f5f9', textDecoration: done ? 'line-through' : 'none' }}>{item.label}</div>
              <span style={{ fontSize: 12, color: done ? '#22c55e' : '#6366f1' }}>{done ? '✓' : '→'}</span>
            </div>
          );
        })}
      </div>

      {/* My feedback submissions */}
      <div style={S.card}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>My Feedback Reports</div>
        {loading ? (
          <div style={{ color: '#64748b', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>Loading...</div>
        ) : reports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
            <div style={{ color: '#64748b', fontSize: 14 }}>No reports yet. Use the 💬 button to send feedback!</div>
          </div>
        ) : (
          reports.map((r, i) => (
            <div key={r.id} style={{ padding: '12px 0', borderBottom: i < reports.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>{r.category || 'Feedback'}</div>
                <div style={S.chip(STATUS_COLOR[r.status] || '#475569')}>{STATUS_LABEL[r.status] || '🟡 Open'}</div>
              </div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 4, lineHeight: 1.5 }}>{r.message?.slice(0, 120)}{r.message?.length > 120 ? '...' : ''}</div>
              <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>{r.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently submitted'}</div>
            </div>
          ))
        )}
      </div>

      {/* Thank you card */}
      <div style={{ ...S.card, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', textAlign: 'center' }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>🙏</div>
        <div style={{ fontWeight: 700, color: '#818cf8', marginBottom: 4 }}>Thank you for beta testing!</div>
        <div style={{ fontSize: 13, color: '#64748b' }}>Every bug report and suggestion makes LynkApp better for everyone.</div>
      </div>
    </div>
  );
}
