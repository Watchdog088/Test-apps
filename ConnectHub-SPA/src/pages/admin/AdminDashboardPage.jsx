// src/pages/admin/AdminDashboardPage.jsx
// Admin home dashboard — live Firestore metrics, moderation queue, KYC queue
// UPDATED Jun 2026: All data pulled from Firestore instead of hardcoded

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase/config';
import {
  collection, query, where, orderBy, limit,
  onSnapshot, getDocs, getCountFromServer
} from 'firebase/firestore';

const S = {
  page: { background: '#0a0a18', minHeight: '100dvh', paddingBottom: 80, fontFamily: 'system-ui,sans-serif', color: '#f1f5f9' },
  hdr:  { position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,10,24,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 },
  card: { background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 14, border: '1px solid rgba(255,255,255,0.07)' },
  tab:  (a) => ({ flex: 1, padding: '12px', fontSize: 13, fontWeight: 700, background: 'none', border: 'none', borderBottom: `2px solid ${a ? '#6366f1' : 'transparent'}`, color: a ? '#818cf8' : '#475569', cursor: 'pointer' }),
  btn:  (bg, col) => ({ flex: 1, padding: '9px', borderRadius: 12, background: bg, border: 'none', color: col, fontSize: 13, fontWeight: 700, cursor: 'pointer' }),
  badge: (bg, col) => ({ background: bg, color: col, borderRadius: 8, padding: '2px 8px', fontSize: 11, fontWeight: 700 }),
};

const PRIORITY_COLORS = { High: ['rgba(239,68,68,0.2)', '#ef4444'], Medium: ['rgba(245,158,11,0.2)', '#f59e0b'], Low: ['rgba(16,185,129,0.15)', '#10b981'] };

const TABS = ['Overview', 'Reports', 'KYC', 'Users', 'More'];

// ── Fallback skeleton line
function Skel() {
  return <span style={{ display: 'inline-block', width: 60, height: 14, background: 'rgba(255,255,255,0.08)', borderRadius: 6, animation: 'pulse 1.5s infinite' }} />;
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');

  // ── Live metrics state
  const [metrics, setMetrics] = useState({
    totalUsers: null, newToday: null, dau: null,
    reportsPending: null, reportsHigh: null,
    kycPending: null, activeStreams: null,
  });

  // ── Recent data state
  const [recentReports, setRecentReports] = useState([]);
  const [kycQueue, setKycQueue]           = useState([]);
  const [allReports, setAllReports]       = useState([]);
  const [reportsLoading, setReportsLoading] = useState(true);

  // ── Load aggregate counts from Firestore
  useEffect(() => {
    async function loadCounts() {
      try {
        // Total users
        const usersSnap = await getCountFromServer(collection(db, 'users'));
        const total = usersSnap.data().count;

        // New users today
        const today = new Date(); today.setHours(0,0,0,0);
        const newTodaySnap = await getCountFromServer(
          query(collection(db, 'users'), where('createdAt', '>=', today))
        );

        // Reports pending
        const repPendingSnap = await getCountFromServer(
          query(collection(db, 'reports'), where('status', '==', 'pending'))
        );
        const repHighSnap = await getCountFromServer(
          query(collection(db, 'reports'), where('status', '==', 'pending'), where('priority', '==', 'High'))
        );

        // KYC pending
        const kycSnap = await getCountFromServer(
          query(collection(db, 'kycSubmissions'), where('status', '==', 'pending'))
        );

        // Active live streams
        const streamsSnap = await getCountFromServer(
          query(collection(db, 'livestreams'), where('status', '==', 'live'))
        );

        setMetrics({
          totalUsers:    total,
          newToday:      newTodaySnap.data().count,
          dau:           Math.round(total * 0.33), // estimated DAU ~33% of total
          reportsPending: repPendingSnap.data().count,
          reportsHigh:    repHighSnap.data().count,
          kycPending:    kycSnap.data().count,
          activeStreams:  streamsSnap.data().count,
        });
      } catch (err) {
        console.warn('[Admin] count error:', err.message);
        // Graceful fallback — show 0 instead of crash
        setMetrics({ totalUsers: 0, newToday: 0, dau: 0, reportsPending: 0, reportsHigh: 0, kycPending: 0, activeStreams: 0 });
      }
    }
    loadCounts();
  }, []);

  // ── Live listener: recent reports
  useEffect(() => {
    const q = query(collection(db, 'reports'), where('status', '==', 'pending'), orderBy('createdAt', 'desc'), limit(20));
    const unsub = onSnapshot(q, snap => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setAllReports(docs);
      setRecentReports(docs.slice(0, 3));
      setReportsLoading(false);
    }, err => {
      console.warn('[Admin] reports listener:', err.message);
      setReportsLoading(false);
    });
    return unsub;
  }, []);

  // ── Live listener: KYC queue
  useEffect(() => {
    const q = query(collection(db, 'kycSubmissions'), where('status', '==', 'pending'), orderBy('createdAt', 'asc'), limit(15));
    const unsub = onSnapshot(q, snap => {
      setKycQueue(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, err => console.warn('[Admin] kyc listener:', err.message));
    return unsub;
  }, []);

  // ── Actions
  const updateReport = async (id, status) => {
    try {
      const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
      await updateDoc(doc(db, 'reports', id), { status, resolvedAt: serverTimestamp() });
    } catch (e) { console.error(e); }
  };

  const updateKYC = async (id, status) => {
    try {
      const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
      await updateDoc(doc(db, 'kycSubmissions', id), { status, reviewedAt: serverTimestamp() });
    } catch (e) { console.error(e); }
  };

  const fmt = (n) => n === null ? <Skel /> : Number(n).toLocaleString();
  const ts  = (v) => { if (!v) return 'Just now'; const d = v?.toDate ? v.toDate() : new Date(v); const diff = Date.now() - d.getTime(); if (diff < 60000) return 'Just now'; if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`; if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`; return d.toLocaleDateString(); };

  const METRIC_CARDS = [
    { label: 'Total Users',      val: fmt(metrics.totalUsers),    icon: '👥', change: metrics.newToday !== null ? `+${metrics.newToday} today` : '…',    color: '#6366f1' },
    { label: 'Est. DAU',         val: fmt(metrics.dau),           icon: '📊', change: '~33% of total',                                                    color: '#ec4899' },
    { label: 'Reports Pending',  val: fmt(metrics.reportsPending),icon: '⚠️', change: metrics.reportsHigh !== null ? `${metrics.reportsHigh} high priority` : '…', color: '#f59e0b' },
    { label: 'KYC Queue',        val: fmt(metrics.kycPending),    icon: '🪪', change: 'Awaiting review',                                                  color: '#3b82f6' },
    { label: 'Active Streams',   val: fmt(metrics.activeStreams), icon: '📡', change: 'Live right now',                                                    color: '#ef4444' },
    { label: 'Beta Feedback',    val: '—',                        icon: '💬', change: 'View responses',                                                   color: '#22c55e' },
  ];

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.hdr}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 22, cursor: 'pointer', padding: '4px 8px' }}>←</button>
        <span style={{ fontWeight: 700, fontSize: 17 }}>⚙️ Admin Dashboard</span>
        {/* ← User View button — lets CEO@lynkapp.net switch back to the app */}
        <button
          onClick={() => navigate('/feed')}
          style={{
            marginLeft: 'auto', padding: '6px 14px', borderRadius: 10,
            background: 'rgba(99,102,241,0.18)', border: '1px solid rgba(99,102,241,0.35)',
            color: '#a5b4fc', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          ← User View
        </button>
        <div style={{ ...S.badge('rgba(239,68,68,0.15)', '#ef4444') }}>🔴 ADMIN ACCESS</div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        {TABS.map(t => <button key={t} onClick={() => setActiveTab(t)} style={S.tab(activeTab === t)}>{t}</button>)}
      </div>

      <div style={{ padding: 16 }}>
        {/* ══ OVERVIEW TAB ══ */}
        {activeTab === 'Overview' && (
          <>
            {/* Live metrics grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              {METRIC_CARDS.map(m => (
                <div key={m.label} style={{ ...S.card, border: `1px solid ${m.color}30` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 20 }}>{m.icon}</span>
                    <span style={{ fontSize: 11, color: m.color, fontWeight: 700 }}>{m.label}</span>
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 900 }}>{m.val}</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{m.change}</div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div style={{ fontWeight: 700, fontSize: 14, color: '#94a3b8', marginBottom: 10 }}>Quick Actions</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              {[
                ['⚠️', 'Review Reports',    () => setActiveTab('Reports')],
                ['🪪', 'KYC Queue',         () => setActiveTab('KYC')],
                ['📊', 'Analytics',         () => navigate('/admin/analytics')],
                ['📢', 'Announcements',     () => navigate('/admin/announcements')],
                ['💬', 'Beta Feedback',     () => navigate('/admin/beta-feedback')],
                ['🛡️', 'Content Moderation',() => navigate('/admin/content')],
              ].map(([icon, label, action]) => (
                <button key={label} onClick={action} style={{ padding: '14px', borderRadius: 14, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer', textAlign: 'center' }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>{icon}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{label}</div>
                </button>
              ))}
            </div>

            {/* Recent Reports preview */}
            <div style={{ fontWeight: 700, fontSize: 14, color: '#94a3b8', marginBottom: 10 }}>Recent Reports</div>
            {reportsLoading ? (
              <div style={{ color: '#475569', fontSize: 13, padding: '10px 0' }}>Loading…</div>
            ) : recentReports.length === 0 ? (
              <div style={{ ...S.card, textAlign: 'center', color: '#64748b', padding: '20px' }}>✅ No pending reports</div>
            ) : recentReports.map(r => {
              const [bg, col] = PRIORITY_COLORS[r.priority] || PRIORITY_COLORS.Low;
              return (
                <div key={r.id} style={{ ...S.card, marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={S.badge(bg, col)}>{r.priority || 'Low'}</span>
                    <span style={{ fontSize: 11, color: '#475569' }}>{ts(r.createdAt)}</span>
                  </div>
                  <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 700, marginBottom: 4 }}>{r.type || 'Report'}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{r.reason || r.content || 'No details'}</div>
                </div>
              );
            })}
          </>
        )}

        {/* ══ REPORTS TAB ══ */}
        {activeTab === 'Reports' && (
          reportsLoading ? <div style={{ color: '#475569', fontSize: 13 }}>Loading reports…</div> :
          allReports.length === 0 ? (
            <div style={{ ...S.card, textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
              <div style={{ fontWeight: 700, color: '#f1f5f9' }}>No pending reports</div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>All caught up!</div>
            </div>
          ) : allReports.map(r => {
            const [bg, col] = PRIORITY_COLORS[r.priority] || PRIORITY_COLORS.Low;
            return (
              <div key={r.id} style={{ ...S.card, marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{r.type || 'Report'}</span>
                  <span style={S.badge(bg, col)}>{r.priority || 'Low'}</span>
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>
                  Reported by: {r.reporterName || r.reporterId || 'Anonymous'} · {ts(r.createdAt)}
                </div>
                <div style={{ fontSize: 13, color: '#cbd5e1', background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>
                  {r.reason || r.content || r.description || 'No details provided'}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => updateReport(r.id, 'dismissed')} style={S.btn('rgba(34,197,94,0.15)', '#22c55e')}>✅ Dismiss</button>
                  <button onClick={() => updateReport(r.id, 'actioned')}  style={S.btn('rgba(239,68,68,0.15)', '#ef4444')}>🚫 Remove</button>
                  <button onClick={() => navigate(`/admin/users?highlight=${r.reportedUserId}`)} style={S.btn('rgba(245,158,11,0.15)', '#f59e0b')}>⛔ Ban User</button>
                </div>
              </div>
            );
          })
        )}

        {/* ══ KYC TAB ══ */}
        {activeTab === 'KYC' && (
          kycQueue.length === 0 ? (
            <div style={{ ...S.card, textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🪪</div>
              <div style={{ fontWeight: 700, color: '#f1f5f9' }}>KYC Queue Empty</div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>No pending submissions</div>
            </div>
          ) : kycQueue.map(k => (
            <div key={k.id} style={{ ...S.card, marginBottom: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{k.displayName || k.userName || k.userId}</div>
              <div style={{ fontSize: 13, color: '#64748b', marginBottom: 2 }}>Document: {k.docType || 'ID Document'}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 14 }}>Submitted: {ts(k.createdAt)}</div>
              {k.docUrl && (
                <a href={k.docUrl} target="_blank" rel="noreferrer" style={{ display: 'block', fontSize: 13, color: '#818cf8', marginBottom: 12, textDecoration: 'none' }}>
                  📎 View Document
                </a>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => updateKYC(k.id, 'approved')} style={S.btn('rgba(34,197,94,0.15)', '#22c55e')}>✅ Approve</button>
                <button onClick={() => updateKYC(k.id, 'rejected')} style={S.btn('rgba(239,68,68,0.15)', '#ef4444')}>❌ Reject</button>
              </div>
            </div>
          ))
        )}

        {/* ══ USERS TAB ══ */}
        {activeTab === 'Users' && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>User Management</div>
            <div style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>
              {metrics.totalUsers !== null ? `Manage all ${Number(metrics.totalUsers).toLocaleString()} users` : 'Search, ban, verify, and manage users'}
            </div>
            <button onClick={() => navigate('/admin/users')} style={{ background: 'linear-gradient(135deg,#6366f1,#ec4899)', border: 'none', borderRadius: 14, padding: '14px 32px', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>👥 Open User Management</button>
          </div>
        )}

        {/* ══ MORE TAB ══ */}
        {activeTab === 'More' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              ['👥', 'User Management',     '/admin/users'],
              ['📢', 'Announcements',        '/admin/announcements'],
              ['✅', 'Verifications',        '/admin/verification'],
              ['🏷️', 'KYC Review',          '/admin/kyc'],
              ['🚩', 'Reports Queue',        '/admin/reports'],
              ['📊', 'Analytics',            '/admin/analytics'],
              ['💬', 'Beta Feedback',        '/admin/beta-feedback'],
              ['🛡️', 'Content Moderation',  '/admin/content'],
            ].map(([icon, label, path]) => (
              <button key={label} onClick={() => navigate(path)} style={{ padding: '16px 10px', borderRadius: 14, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', textAlign: 'center' }}>
                <div style={{ fontSize: 26, marginBottom: 6 }}>{icon}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{label}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
