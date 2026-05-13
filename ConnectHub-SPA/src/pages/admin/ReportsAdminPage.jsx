// ReportsAdminPage.jsx — Sprint 21: /admin/reports moderation queue
// Protected by AdminGuard (isAdmin: true in Firestore user doc required)
import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, orderBy, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';

const SEVERITY = { spam: '🟡', prohibited: '🔴', misleading: '🟠', counterfeit: '🔴', offensive: '🟠', other: '⚪' };
const STATUS_COLORS = { pending: '#f59e0b', resolved: '#22c55e', dismissed: '#64748b' };

const DEMO_REPORTS = [
  { id: 'r1', listingId: 'l1', listingTitle: 'Fake Nike Air Jordan 1 Retro High', reportType: 'counterfeit', details: 'This is clearly a counterfeit product. The photos show obvious quality issues and the price ($25 for "new" Jordans) is a giveaway.', reportedBy: 'user_abc123', reportedAt: new Date(Date.now() - 3600000 * 2), status: 'pending', listingUrl: '/marketplace' },
  { id: 'r2', listingId: 'l2', listingTitle: 'iPhone 14 Pro Max — NEED GONE TODAY', reportType: 'spam', details: 'This listing has been posted 8 times in the past hour. Obvious spam behavior flooding the Electronics category.', reportedBy: 'user_def456', reportedAt: new Date(Date.now() - 3600000 * 5), status: 'pending', listingUrl: '/marketplace' },
  { id: 'r3', listingId: 'l3', listingTitle: 'Weight Loss Pills — Lose 30 lbs in 7 Days!!', reportType: 'prohibited', details: 'Medical claims without FDA approval. These are prohibited health products under our listing policy section 4.3.', reportedBy: 'user_ghi789', reportedAt: new Date(Date.now() - 3600000 * 12), status: 'pending', listingUrl: '/marketplace' },
  { id: 'r4', listingId: 'l4', listingTitle: 'Gaming Chair (barely used)', reportType: 'misleading', details: 'Seller claims "barely used" but photos show significant wear and the chair is missing one armrest. Price is also misleading.', reportedBy: 'user_jkl012', reportedAt: new Date(Date.now() - 86400000), status: 'resolved', listingUrl: '/marketplace' },
  { id: 'r5', listingId: 'l5', listingTitle: 'Vintage Camera Bundle', reportType: 'other', details: 'Suspicious listing — seller has no reviews and is asking for payment via external app (Venmo only, no in-app purchase).', reportedBy: 'user_mno345', reportedAt: new Date(Date.now() - 86400000 * 2), status: 'dismissed', listingUrl: '/marketplace' },
];

function timeAgo(date) {
  const s = Math.floor((Date.now() - date) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function ReportsAdminPage() {
  const [reports, setReports] = useState(DEMO_REPORTS);
  const [filter, setFilter] = useState('pending');
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState(null);
  const [stats, setStats] = useState({ pending: 3, resolved: 1, dismissed: 1, total: 5 });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAction = (id, action) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: action } : r));
    setStats(prev => {
      const report = reports.find(r => r.id === id);
      const oldStatus = report?.status;
      return {
        ...prev,
        [oldStatus]: Math.max(0, prev[oldStatus] - 1),
        [action]: (prev[action] || 0) + 1,
      };
    });
    setSelected(null);
    if (action === 'resolved') showToast('✅ Listing removed and seller notified');
    else showToast('✋ Report dismissed — listing remains active');
  };

  const filtered = reports.filter(r => filter === 'all' ? true : r.status === filter);

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f1f5f9', fontFamily: 'system-ui,sans-serif', padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <span style={{ fontSize: 28 }}>🚩</span>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Report Moderation Queue</h1>
          <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Review flagged marketplace listings</p>
        </div>
        <a href="/marketplace" style={{ marginLeft: 'auto', color: '#6366f1', textDecoration: 'none', fontSize: 14 }}>← Back to Marketplace</a>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Reports', value: stats.total, icon: '📋', color: '#6366f1' },
          { label: 'Pending', value: stats.pending, icon: '⏳', color: '#f59e0b' },
          { label: 'Resolved', value: stats.resolved, icon: '✅', color: '#22c55e' },
          { label: 'Dismissed', value: stats.dismissed, icon: '✋', color: '#64748b' },
        ].map(s => (
          <div key={s.label} style={{ background: '#1e293b', borderRadius: 12, padding: '16px', border: `1px solid ${s.color}22` }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['all', 'pending', 'resolved', 'dismissed'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            style={{ padding: '8px 18px', borderRadius: 20, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13,
              background: filter === f ? '#6366f1' : '#1e293b', color: filter === f ? 'white' : '#94a3b8' }}>
            {f.charAt(0).toUpperCase() + f.slice(1)} {f !== 'all' && `(${stats[f] ?? 0})`}
          </button>
        ))}
      </div>

      {/* Report List */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
          <p style={{ fontSize: 16 }}>No {filter} reports</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(r => (
            <div key={r.id} onClick={() => setSelected(r)}
              style={{ background: '#1e293b', borderRadius: 14, padding: 20, cursor: 'pointer', border: selected?.id === r.id ? '1px solid #6366f1' : '1px solid transparent',
                transition: 'border-color 0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ fontSize: 20 }}>{SEVERITY[r.reportType] || '⚪'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{r.listingTitle}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                      background: `${STATUS_COLORS[r.status]}22`, color: STATUS_COLORS[r.status] }}>
                      {r.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#64748b' }}>
                    <span>🏷️ {r.reportType}</span>
                    <span>👤 {r.reportedBy}</span>
                    <span>🕐 {timeAgo(r.reportedAt)}</span>
                  </div>
                  <p style={{ margin: '8px 0 0', fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>{r.details}</p>
                </div>
                {r.status === 'pending' && (
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button onClick={e => { e.stopPropagation(); handleAction(r.id, 'resolved'); }}
                      aria-label={`Remove listing: ${r.listingTitle}`}
                      style={{ padding: '8px 14px', borderRadius: 10, border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                      🗑️ Remove
                    </button>
                    <button onClick={e => { e.stopPropagation(); handleAction(r.id, 'dismissed'); }}
                      aria-label={`Dismiss report for: ${r.listingTitle}`}
                      style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #334155', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                      ✋ Dismiss
                    </button>
                  </div>
                )}
              </div>

              {/* Expanded Detail */}
              {selected?.id === r.id && (
                <div style={{ marginTop: 16, padding: 16, background: '#0f172a', borderRadius: 10 }}>
                  <h4 style={{ margin: '0 0 8px', fontSize: 13, color: '#64748b' }}>REPORT DETAILS</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
                    <div><span style={{ color: '#64748b' }}>Listing ID: </span><span style={{ color: '#f1f5f9' }}>{r.listingId}</span></div>
                    <div><span style={{ color: '#64748b' }}>Report Type: </span><span style={{ color: '#f1f5f9' }}>{r.reportType}</span></div>
                    <div><span style={{ color: '#64748b' }}>Reported by: </span><span style={{ color: '#f1f5f9' }}>{r.reportedBy}</span></div>
                    <div><span style={{ color: '#64748b' }}>Reported at: </span><span style={{ color: '#f1f5f9' }}>{r.reportedAt.toLocaleString()}</span></div>
                  </div>
                  <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                    <a href={r.listingUrl} target="_blank" rel="noreferrer"
                      style={{ padding: '8px 16px', borderRadius: 10, background: '#6366f1', color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
                      👁️ View Listing
                    </a>
                    {r.status === 'pending' && (
                      <>
                        <button onClick={() => handleAction(r.id, 'resolved')}
                          style={{ padding: '8px 16px', borderRadius: 10, border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                          🗑️ Remove Listing
                        </button>
                        <button onClick={() => handleAction(r.id, 'dismissed')}
                          style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid #334155', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: 13 }}>
                          ✋ Dismiss Report
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)', background: toast.type === 'success' ? '#22c55e' : '#ef4444',
          color: 'white', padding: '12px 24px', borderRadius: 12, fontWeight: 700, fontSize: 14, zIndex: 9999, boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
