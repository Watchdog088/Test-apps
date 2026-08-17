// AdminPayoutsPage.jsx — Sprint 2: Admin payout management dashboard
// NEW file — guarded by AdminRoute in App.jsx

import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';

export default function AdminPayoutsPage() {
  const [payouts, setPayouts]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all'); // 'all' | 'pending' | 'paid' | 'failed'

  useEffect(() => {
    const q = query(
      collection(db, 'payouts'),
      orderBy('createdAt', 'desc'),
      limit(100),
    );
    const unsub = onSnapshot(q, snap => {
      setPayouts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  const filtered = filter === 'all' ? payouts : payouts.filter(p => p.status === filter);

  const statusColor = {
    pending: '#f59e0b',
    paid:    '#22c55e',
    failed:  '#ef4444',
    processing: '#3b82f6',
  };

  const s = {
    page:    { minHeight: '100vh', background: '#0f0f0f', color: '#f1f5f9', padding: '20px', paddingBottom: '100px' },
    header:  { marginBottom: '24px' },
    title:   { fontSize: '22px', fontWeight: 800, marginBottom: '4px' },
    sub:     { color: '#94a3b8', fontSize: '14px' },
    tabs:    { display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' },
    tab:     (active) => ({
      padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '13px',
      background: active ? '#3b82f6' : '#1e293b', color: active ? '#fff' : '#94a3b8', fontWeight: 600,
    }),
    card:    { background: '#1e293b', borderRadius: '12px', padding: '16px', marginBottom: '12px' },
    row:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' },
    name:    { fontWeight: 700, fontSize: '15px' },
    amt:     { fontWeight: 700, fontSize: '16px', color: '#22c55e' },
    badge:   (status) => ({
      padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
      background: statusColor[status] + '22', color: statusColor[status] || '#94a3b8',
    }),
    empty:   { textAlign: 'center', color: '#64748b', padding: '60px 0' },
    loading: { textAlign: 'center', color: '#64748b', padding: '60px 0' },
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.title}>💰 Payout Management</div>
        <div style={s.sub}>{filtered.length} payouts — admin view</div>
      </div>

      <div style={s.tabs}>
        {['all', 'pending', 'paid', 'failed', 'processing'].map(f => (
          <button key={f} style={s.tab(filter === f)} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading && <div style={s.loading}>Loading payouts…</div>}

      {!loading && filtered.length === 0 && (
        <div style={s.empty}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>💳</div>
          <div>No payouts found</div>
        </div>
      )}

      {filtered.map(payout => (
        <div key={payout.id} style={s.card}>
          <div style={s.row}>
            <div style={s.name}>{payout.creatorName || payout.userId || 'Creator'}</div>
            <div style={s.amt}>${(payout.amount || 0).toFixed(2)}</div>
          </div>
          <div style={s.row}>
            <span style={{ color: '#94a3b8', fontSize: '13px' }}>
              {payout.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
            </span>
            <span style={s.badge(payout.status)}>{payout.status || 'unknown'}</span>
          </div>
          {payout.stripePayoutId && (
            <div style={{ color: '#64748b', fontSize: '11px', fontFamily: 'monospace' }}>
              {payout.stripePayoutId}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
