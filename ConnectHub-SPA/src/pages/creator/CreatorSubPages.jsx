// src/pages/creator/CreatorSubPages.jsx
// Creator analytics + monetization dashboards
// Routes: /creator/analytics, /creator/monetization

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '@store/useAppStore';

function PageHeader({ title, emoji }) {
  const navigate = useNavigate();
  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,10,24,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 22, cursor: 'pointer', padding: '4px 8px' }}>←</button>
      <span style={{ fontWeight: 700, fontSize: 17, color: '#f1f5f9' }}>{emoji} {title}</span>
    </div>
  );
}

// ─── CREATOR ANALYTICS ───────────────────────────────────
export function CreatorAnalyticsPage() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('7d');

  const stats = [
    { label: 'Total Views', val: '124.8K', icon: '👁️', change: '+18%' },
    { label: 'New Followers', val: '2,847', icon: '👥', change: '+24%' },
    { label: 'Reach', val: '89.2K', icon: '📡', change: '+11%' },
    { label: 'Engagement', val: '8.4%', icon: '💬', change: '+2.1%' },
  ];

  const TOP_POSTS = [
    { id: 1, title: 'Golden Hour Photography Tips 🌅', views: '34.2K', likes: 2847, comments: 312 },
    { id: 2, title: 'My Photography Gear Setup 📷', views: '28.5K', likes: 2103, comments: 218 },
    { id: 3, title: 'Urban Street Photography Guide', views: '19.8K', likes: 1598, comments: 187 },
  ];

  const AUDIENCE = [
    { country: '🇺🇸 United States', pct: 42 },
    { country: '🇬🇧 United Kingdom', pct: 14 },
    { country: '🇨🇦 Canada', pct: 11 },
    { country: '🇦🇺 Australia', pct: 9 },
    { country: '🌍 Other', pct: 24 },
  ];

  return (
    <div style={{ background: '#0a0a18', minHeight: '100vh', paddingBottom: 80 }}>
      <PageHeader title="Creator Analytics" emoji="📊" />

      {/* Period Selector */}
      <div style={{ display: 'flex', gap: 8, padding: '12px 16px' }}>
        {['7d', '30d', '90d', '1y'].map(p => (
          <button key={p} onClick={() => setPeriod(p)} style={{ padding: '7px 16px', borderRadius: 22, fontSize: 13, fontWeight: 700, cursor: 'pointer', background: period === p ? 'linear-gradient(135deg,#6366f1,#ec4899)' : 'rgba(255,255,255,0.07)', border: 'none', color: period === p ? 'white' : '#64748b' }}>{p === '7d' ? '7 days' : p === '30d' ? '30 days' : p === '90d' ? '90 days' : '1 year'}</button>
        ))}
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          {stats.map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: '14px', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#f1f5f9' }}>{s.val}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{s.label}</div>
              <div style={{ fontSize: 11, color: '#22c55e', marginTop: 2 }}>↑ {s.change}</div>
            </div>
          ))}
        </div>

        {/* Chart placeholder */}
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: '16px', border: '1px solid rgba(255,255,255,0.07)', marginBottom: 20, height: 140, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 90 }}>
            {[40, 60, 45, 80, 65, 90, 75].map((h, i) => (
              <div key={i} style={{ flex: 1, borderRadius: '4px 4px 0 0', background: `linear-gradient(to top, #6366f1, #ec4899)`, height: `${h}%`, opacity: 0.7 + (i * 0.04) }} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <span key={d} style={{ fontSize: 10, color: '#475569' }}>{d}</span>)}
          </div>
        </div>

        {/* Top Posts */}
        <div style={{ fontWeight: 700, fontSize: 14, color: '#94a3b8', marginBottom: 12 }}>🔥 Top Performing Posts</div>
        {TOP_POSTS.map((p, i) => (
          <div key={p.id} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, color: 'white', flexShrink: 0 }}>#{i + 1}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', marginBottom: 3 }}>{p.title}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>👁️ {p.views} · ❤️ {p.likes.toLocaleString()} · 💬 {p.comments}</div>
            </div>
          </div>
        ))}

        {/* Audience */}
        <div style={{ fontWeight: 700, fontSize: 14, color: '#94a3b8', marginTop: 20, marginBottom: 12 }}>🌍 Audience by Country</div>
        {AUDIENCE.map(a => (
          <div key={a.country} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 13, color: '#f1f5f9' }}>{a.country}</span>
              <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 700 }}>{a.pct}%</span>
            </div>
            <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)' }}>
              <div style={{ width: `${a.pct}%`, height: '100%', borderRadius: 2, background: 'linear-gradient(135deg,#6366f1,#ec4899)' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CREATOR MONETIZATION ────────────────────────────────
export function CreatorMonetizationPage() {
  const navigate = useNavigate();
  const showToast = useAppStore(s => s.showToast);

  const earnings = [
    { source: 'Ad Revenue', amount: '$284.50', icon: '📢', change: '+12%' },
    { source: 'Subscriptions', amount: '$847.00', icon: '⭐', change: '+28%' },
    { source: 'Tips & Gifts', amount: '$182.25', icon: '🎁', change: '+5%' },
    { source: 'Live Donations', amount: '$124.00', icon: '📡', change: '+31%' },
  ];

  const total = '$1,437.75';

  return (
    <div style={{ background: '#0a0a18', minHeight: '100vh', paddingBottom: 80 }}>
      <PageHeader title="Monetization" emoji="💰" />
      <div style={{ padding: '16px' }}>

        {/* Total Balance Card */}
        <div style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.25),rgba(236,72,153,0.2))', borderRadius: 20, padding: '24px', border: '1px solid rgba(99,102,241,0.4)', textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>Total Earnings This Month</div>
          <div style={{ fontSize: 44, fontWeight: 900, color: '#f1f5f9', marginBottom: 16 }}>{total}</div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button onClick={() => showToast('💳 Payout requested! 3-5 business days', 'success')} style={{ padding: '10px 22px', borderRadius: 22, background: 'linear-gradient(135deg,#6366f1,#ec4899)', border: 'none', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>💳 Withdraw</button>
            <button onClick={() => navigate('/creator/analytics')} style={{ padding: '10px 22px', borderRadius: 22, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: '#94a3b8', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>📊 Analytics</button>
          </div>
        </div>

        {/* Earnings Breakdown */}
        <div style={{ fontWeight: 700, fontSize: 14, color: '#94a3b8', marginBottom: 12 }}>Revenue Sources</div>
        {earnings.map(e => (
          <div key={e.source} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{e.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9' }}>{e.source}</div>
              <div style={{ fontSize: 11, color: '#22c55e' }}>↑ {e.change} vs last month</div>
            </div>
            <span style={{ fontWeight: 800, fontSize: 16, color: '#f1f5f9' }}>{e.amount}</span>
          </div>
        ))}

        {/* Monetization Features */}
        <div style={{ fontWeight: 700, fontSize: 14, color: '#94a3b8', marginTop: 20, marginBottom: 12 }}>Monetization Tools</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { icon: '⭐', label: 'Subscriptions', desc: '847 subscribers', active: true },
            { icon: '🎁', label: 'Tips', desc: 'Enable fan tips', active: true },
            { icon: '📢', label: 'Ad Revenue', desc: 'Auto-ads enabled', active: true },
            { icon: '🛍️', label: 'Merch', desc: 'Set up your store', active: false },
          ].map(tool => (
            <div key={tool.label} onClick={() => !tool.active && showToast(`${tool.label} setup coming soon!`, 'info')} style={{
              background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: '14px', border: `1px solid ${tool.active ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.07)'}`, cursor: 'pointer',
            }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{tool.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#f1f5f9', marginBottom: 2 }}>{tool.label}</div>
              <div style={{ fontSize: 11, color: tool.active ? '#22c55e' : '#64748b' }}>{tool.active ? '✅ ' : ''}{tool.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
