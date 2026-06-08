// src/pages/wallet/WalletPage.jsx
// GAP-05 FIX (Jun 2026): Full Wallet & Earnings dashboard
// Covers: balance, pending, transaction history, withdraw button
// For creators, live streamers, and marketplace sellers

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db, auth } from '@/firebase/config';

const wrap = {
  minHeight: '100dvh',
  background: 'linear-gradient(135deg,#0f0c29,#302b63,#24243e)',
  padding: '20px 16px 100px',
};

const card = (extra = {}) => ({
  background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 20,
  padding: '20px',
  marginBottom: 16,
  ...extra,
});

const pill = (color) => ({
  display: 'inline-block',
  padding: '3px 10px',
  borderRadius: 20,
  fontSize: 11,
  fontWeight: 700,
  background: color === 'green'  ? 'rgba(16,185,129,0.15)' :
              color === 'yellow' ? 'rgba(245,158,11,0.15)'  :
              color === 'red'    ? 'rgba(239,68,68,0.15)'   :
              'rgba(99,102,241,0.15)',
  color: color === 'green'  ? '#10b981' :
         color === 'yellow' ? '#f59e0b' :
         color === 'red'    ? '#ef4444' :
         '#818cf8',
});

// Mock transactions — replaced by real Firestore data once payments go live
const MOCK_TXS = [
  { id: 't1', type: 'earning',   source: 'Live Gift — Alex T.',    amount: +12.50, date: '2026-06-07', status: 'completed' },
  { id: 't2', type: 'earning',   source: 'Marketplace Sale — Hoodie', amount: +45.00, date: '2026-06-06', status: 'completed' },
  { id: 't3', type: 'payout',    source: 'Bank Transfer',           amount: -50.00, date: '2026-06-05', status: 'completed' },
  { id: 't4', type: 'earning',   source: 'Creator Tip — @jayrock', amount: +5.00,  date: '2026-06-04', status: 'pending'   },
  { id: 't5', type: 'earning',   source: 'Marketplace Sale — Cap',  amount: +22.00, date: '2026-06-03', status: 'completed' },
  { id: 't6', type: 'fee',       source: 'Platform fee (5%)',       amount: -2.25,  date: '2026-06-03', status: 'completed' },
  { id: 't7', type: 'earning',   source: 'Live Subscription',       amount: +9.99,  date: '2026-06-02', status: 'completed' },
];

export default function WalletPage() {
  const navigate = useNavigate();
  const [tab,         setTab]         = useState('overview');  // overview | history | payout
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmt,  setWithdrawAmt]  = useState('');
  const [withdrawMsg,  setWithdrawMsg]  = useState('');
  const [txns,         setTxns]         = useState(MOCK_TXS);
  const [loading,      setLoading]      = useState(false);

  // Totals
  const available = txns
    .filter(t => t.status === 'completed')
    .reduce((s, t) => s + t.amount, 0);
  const pending = txns
    .filter(t => t.status === 'pending' && t.amount > 0)
    .reduce((s, t) => s + t.amount, 0);
  const totalEarned = txns
    .filter(t => t.type === 'earning' && t.status === 'completed')
    .reduce((s, t) => s + t.amount, 0);

  async function handleWithdraw(e) {
    e.preventDefault();
    const amt = parseFloat(withdrawAmt);
    if (!amt || amt <= 0)       return setWithdrawMsg('Enter a valid amount.');
    if (amt > available)        return setWithdrawMsg(`Max available: $${available.toFixed(2)}`);
    if (amt < 10)               return setWithdrawMsg('Minimum payout is $10.00.');
    setLoading(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1200));
    setTxns(prev => [
      { id: `t${Date.now()}`, type: 'payout', source: 'Bank Transfer (pending)', amount: -amt, date: new Date().toISOString().slice(0,10), status: 'pending' },
      ...prev,
    ]);
    setWithdrawMsg(`✅ Withdrawal of $${amt.toFixed(2)} requested! Processing in 2–5 business days.`);
    setWithdrawAmt('');
    setLoading(false);
    setShowWithdraw(false);
  }

  const h2 = { fontSize: 18, fontWeight: 800, color: '#f1f5f9', margin: '0 0 4px' };
  const sub = { fontSize: 12, color: '#64748b', margin: 0 };

  return (
    <div style={wrap}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate(-1)}
          style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 12,
            color: '#94a3b8', fontSize: 18, width: 40, height: 40, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          ←
        </button>
        <div>
          <h1 style={{ ...h2, fontSize: 22 }}>💰 My Wallet</h1>
          <p style={sub}>Earnings, payouts &amp; transaction history</p>
        </div>
      </div>

      {/* ── Balance Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div style={card({ background: 'linear-gradient(135deg,rgba(99,102,241,0.3),rgba(236,72,153,0.2))', border: '1px solid rgba(99,102,241,0.4)' })}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Available</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#f1f5f9' }}>${available.toFixed(2)}</div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Ready to withdraw</div>
        </div>
        <div style={card()}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Pending</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#f1f5f9' }}>${pending.toFixed(2)}</div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Clearing soon</div>
        </div>
      </div>

      {/* Total Lifetime Earning */}
      <div style={card({ display: 'flex', alignItems: 'center', justifyContent: 'space-between' })}>
        <div>
          <div style={{ fontSize: 12, color: '#64748b' }}>Total Lifetime Earnings</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#10b981' }}>${totalEarned.toFixed(2)}</div>
        </div>
        <div style={{ fontSize: 36 }}>📈</div>
      </div>

      {/* ── Withdraw Button ── */}
      <button
        onClick={() => { setShowWithdraw(true); setWithdrawMsg(''); }}
        style={{
          width: '100%', padding: '14px', borderRadius: 16, marginBottom: 24,
          background: available >= 10
            ? 'linear-gradient(135deg,#6366f1,#ec4899)'
            : 'rgba(255,255,255,0.06)',
          border: 'none', color: available >= 10 ? 'white' : '#64748b',
          fontSize: 16, fontWeight: 700, cursor: available >= 10 ? 'pointer' : 'default',
        }}
        disabled={available < 10}
      >
        {available >= 10 ? '🏦 Withdraw Funds' : `🔒 Minimum $10.00 to withdraw`}
      </button>

      {/* ── Withdraw Modal ── */}
      {showWithdraw && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 900,
          display: 'flex', alignItems: 'flex-end', backdropFilter: 'blur(6px)',
        }} onClick={() => setShowWithdraw(false)}>
          <div style={{
            background: '#1a1a2e', borderRadius: '24px 24px 0 0', padding: '28px 20px 48px',
            width: '100%', maxWidth: 480, margin: '0 auto',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.18)', margin: '0 auto 20px' }} />
            <h2 style={{ ...h2, textAlign: 'center', marginBottom: 4 }}>Withdraw Funds</h2>
            <p style={{ ...sub, textAlign: 'center', marginBottom: 20 }}>Available: ${available.toFixed(2)} · Min $10.00</p>
            {withdrawMsg && (
              <div style={{ background: withdrawMsg.startsWith('✅') ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', border: `1px solid ${withdrawMsg.startsWith('✅') ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: 12, padding: '10px 14px', marginBottom: 14, color: withdrawMsg.startsWith('✅') ? '#10b981' : '#ef4444', fontSize: 13, textAlign: 'center' }}>
                {withdrawMsg}
              </div>
            )}
            <form onSubmit={handleWithdraw} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: 16, fontWeight: 700 }}>$</span>
                <input
                  type="number" min="10" max={available} step="0.01"
                  value={withdrawAmt} onChange={e => setWithdrawAmt(e.target.value)}
                  placeholder="0.00"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '13px 16px 13px 32px', color: '#f1f5f9', fontSize: 18, fontWeight: 700, boxSizing: 'border-box', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {[10, 25, 50].map(a => (
                  <button key={a} type="button" onClick={() => setWithdrawAmt(String(Math.min(a, available).toFixed(2)))}
                    style={{ padding: '10px', borderRadius: 10, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                    ${a}
                  </button>
                ))}
              </div>
              <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', fontSize: 12, color: '#64748b' }}>
                🏦 Funds sent to your linked bank account via Stripe. Processing takes 2–5 business days.
              </div>
              <button type="submit" disabled={loading}
                style={{ padding: '14px', borderRadius: 14, background: 'linear-gradient(135deg,#6366f1,#ec4899)', border: 'none', color: 'white', fontWeight: 700, fontSize: 15, cursor: loading ? 'default' : 'pointer' }}>
                {loading ? '⏳ Processing…' : 'Confirm Withdrawal'}
              </button>
              <Link to="/settings/payment" style={{ textAlign: 'center', fontSize: 13, color: '#64748b' }}>
                Manage bank account →
              </Link>
            </form>
          </div>
        </div>
      )}

      {/* ── Tab Bar ── */}
      <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 4, gap: 4, marginBottom: 16 }}>
        {['overview', 'history', 'payout'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ flex: 1, padding: '8px 4px', borderRadius: 9, border: 'none', fontSize: 13, fontWeight: tab === t ? 700 : 500, cursor: 'pointer', background: tab === t ? 'rgba(99,102,241,0.25)' : 'none', color: tab === t ? '#a5b4fc' : '#64748b' }}>
            {t === 'overview' ? '📊 Overview' : t === 'history' ? '🧾 History' : '🏦 Payouts'}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {tab === 'overview' && (
        <div>
          <div style={card()}>
            <h3 style={{ ...h2, fontSize: 15, marginBottom: 12 }}>💡 Earning Sources</h3>
            {[
              { icon: '🎁', label: 'Live Gifts & Tips',      desc: 'Fans send you coins during live streams' },
              { icon: '🛒', label: 'Marketplace Sales',      desc: 'Revenue from items you sell in the shop' },
              { icon: '⭐', label: 'Creator Subscriptions',  desc: 'Monthly recurring from premium fans' },
              { icon: '📹', label: 'Content Monetization',   desc: 'Ad revenue share from your videos' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: 22, width: 36, textAlign: 'center', flexShrink: 0 }}>{s.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#e2e8f0' }}>{s.label}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={card()}>
            <h3 style={{ ...h2, fontSize: 15, marginBottom: 8 }}>⚡ Quick Links</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { icon: '🎨', label: 'Creator Studio',  path: '/creator' },
                { icon: '🛒', label: 'Seller Dashboard', path: '/marketplace/seller-dashboard' },
                { icon: '🔴', label: 'Go Live',          path: '/live/setup' },
                { icon: '⚙️', label: 'Payment Settings', path: '/settings/payment' },
              ].map(l => (
                <Link key={l.label} to={l.path}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', textDecoration: 'none' }}>
                  <span style={{ fontSize: 18 }}>{l.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{l.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Transaction History ── */}
      {tab === 'history' && (
        <div style={card({ padding: 0, overflow: 'hidden' })}>
          {txns.map((tx, i) => (
            <div key={tx.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 16px',
              borderBottom: i < txns.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            }}>
              <div style={{ fontSize: 22, width: 36, textAlign: 'center', flexShrink: 0 }}>
                {tx.type === 'earning' ? '💚' : tx.type === 'payout' ? '🏦' : '📋'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.source}</div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{tx.date} &nbsp;<span style={pill(tx.status === 'completed' ? 'green' : tx.status === 'pending' ? 'yellow' : 'purple')}>{tx.status}</span></div>
              </div>
              <div style={{ fontWeight: 800, fontSize: 15, color: tx.amount > 0 ? '#10b981' : '#f87171', flexShrink: 0 }}>
                {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
              </div>
            </div>
          ))}
          {txns.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>💳</div>
              <div style={{ fontWeight: 600 }}>No transactions yet</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>Start earning by going Live or selling in the Marketplace</div>
            </div>
          )}
        </div>
      )}

      {/* ── Payout Settings ── */}
      {tab === 'payout' && (
        <div>
          <div style={card()}>
            <h3 style={{ ...h2, fontSize: 15, marginBottom: 12 }}>🏦 Payout Method</h3>
            <div style={{ padding: '14px', borderRadius: 12, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', marginBottom: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#a5b4fc', marginBottom: 2 }}>Stripe Connect</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>Connect your bank account or debit card to receive payouts via Stripe.</div>
            </div>
            <Link to="/settings/payment"
              style={{ display: 'block', textAlign: 'center', padding: '12px', borderRadius: 14, background: 'linear-gradient(135deg,#6366f1,#ec4899)', color: 'white', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              ⚙️ Manage Payout Method
            </Link>
          </div>
          <div style={card()}>
            <h3 style={{ ...h2, fontSize: 15, marginBottom: 8 }}>ℹ️ Payout Schedule</h3>
            {[
              ['Minimum payout', '$10.00'],
              ['Processing time', '2–5 business days'],
              ['Platform fee', '5% of earnings'],
              ['Currency', 'USD (others coming soon)'],
              ['Tax forms', 'Available in Settings → Tax'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: 13, color: '#94a3b8' }}>{k}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
