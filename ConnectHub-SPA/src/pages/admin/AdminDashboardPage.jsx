// src/pages/admin/AdminDashboardPage.jsx
// Admin home dashboard — platform metrics, moderation queue, KYC queue

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const METRICS = [
  { label: 'Total Users', val: '12,847', icon: '👥', change: '+284 today', color: '#6366f1' },
  { label: 'DAU', val: '4,218', icon: '📊', change: '+12% vs last week', color: '#ec4899' },
  { label: 'Revenue Today', val: '$1,247', icon: '💰', change: '+$183 vs yesterday', color: '#22c55e' },
  { label: 'Reports Pending', val: 14, icon: '⚠️', change: '3 high priority', color: '#f59e0b' },
  { label: 'KYC Queue', val: 8, icon: '🪪', change: '2 awaiting review', color: '#3b82f6' },
  { label: 'Active Streams', val: 6, icon: '📡', change: 'Live right now', color: '#ef4444' },
];

const RECENT_REPORTS = [
  { id: 'r1', type: 'Spam', reporter: 'Alex Chen', content: 'Post by @user123 — "Buy crypto now!!!"', priority: 'High', time: '5m ago' },
  { id: 'r2', type: 'Harassment', reporter: 'Riley Johnson', content: 'Comment by @badactor — threatening language', priority: 'High', time: '12m ago' },
  { id: 'r3', type: 'Fake Profile', reporter: 'Morgan Taylor', content: 'Profile @celebrimpersonator — impersonating celebrity', priority: 'Medium', time: '28m ago' },
];

const KYC_QUEUE = [
  { id: 'k1', name: 'Sam Rivera', submitDate: 'May 20, 2026', docType: 'Driver\'s License', status: 'Pending' },
  { id: 'k2', name: 'Casey Lee', submitDate: 'May 19, 2026', docType: 'Passport', status: 'Pending' },
];

const TABS = ['Overview', 'Reports', 'KYC', 'Users', 'More'];

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <div style={{ background: '#0a0a18', minHeight: '100vh', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,10,24,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 22, cursor: 'pointer', padding: '4px 8px' }}>←</button>
        <span style={{ fontWeight: 700, fontSize: 17, color: '#f1f5f9' }}>⚙️ Admin Dashboard</span>
        <div style={{ marginLeft: 'auto', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '4px 10px', fontSize: 11, color: '#ef4444', fontWeight: 700 }}>
          🔴 ADMIN ACCESS
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: '12px', fontSize: 13, fontWeight: 700, background: 'none', border: 'none', borderBottom: activeTab === tab ? '2px solid #6366f1' : '2px solid transparent', color: activeTab === tab ? '#818cf8' : '#475569', cursor: 'pointer' }}>{tab}</button>
        ))}
      </div>

      <div style={{ padding: '16px' }}>
        {activeTab === 'Overview' && (
          <>
            {/* Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              {METRICS.map(m => (
                <div key={m.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: '14px', border: `1px solid ${m.color}30` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 20 }}>{m.icon}</span>
                    <span style={{ fontSize: 11, color: m.color, fontWeight: 700 }}>{m.label}</span>
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: '#f1f5f9' }}>{m.val}</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{m.change}</div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div style={{ fontWeight: 700, fontSize: 14, color: '#94a3b8', marginBottom: 10 }}>Quick Actions</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              {[
                ['⚠️', 'Review Reports', () => setActiveTab('Reports')],
                ['🪪', 'KYC Queue', () => setActiveTab('KYC')],
                ['📊', 'Analytics', () => navigate('/creator/analytics')],
                ['📢', 'Announcements', () => navigate('/admin/announcements')],
              ].map(([icon, label, action]) => (
                <button key={label} onClick={action} style={{ padding: '14px', borderRadius: 14, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer', textAlign: 'center' }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>{icon}</div>
                  <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>{label}</div>
                </button>
              ))}
            </div>

            {/* Recent Activity */}
            <div style={{ fontWeight: 700, fontSize: 14, color: '#94a3b8', marginBottom: 10 }}>Recent Reports</div>
            {RECENT_REPORTS.slice(0, 2).map(r => (
              <div key={r.id} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: '12px', marginBottom: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, background: r.priority === 'High' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)', color: r.priority === 'High' ? '#ef4444' : '#f59e0b', borderRadius: 8, padding: '2px 8px', fontWeight: 700 }}>{r.priority}</span>
                  <span style={{ fontSize: 11, color: '#475569' }}>{r.time}</span>
                </div>
                <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 700, marginBottom: 4 }}>{r.type}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{r.content}</div>
              </div>
            ))}
          </>
        )}

        {activeTab === 'Reports' && RECENT_REPORTS.map(r => (
          <div key={r.id} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: '14px', marginBottom: 14, border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9' }}>{r.type}</span>
              <span style={{ fontSize: 11, background: r.priority === 'High' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)', color: r.priority === 'High' ? '#ef4444' : '#f59e0b', borderRadius: 8, padding: '2px 8px', fontWeight: 700 }}>{r.priority}</span>
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Reported by: {r.reporter} · {r.time}</div>
            <div style={{ fontSize: 13, color: '#cbd5e1', background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>{r.content}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ flex: 1, padding: '9px', borderRadius: 12, background: 'rgba(34,197,94,0.15)', border: 'none', color: '#22c55e', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>✅ Dismiss</button>
              <button style={{ flex: 1, padding: '9px', borderRadius: 12, background: 'rgba(239,68,68,0.15)', border: 'none', color: '#ef4444', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>🚫 Remove Content</button>
              <button style={{ flex: 1, padding: '9px', borderRadius: 12, background: 'rgba(245,158,11,0.15)', border: 'none', color: '#f59e0b', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>⛔ Ban User</button>
            </div>
          </div>
        ))}

        {activeTab === 'KYC' && KYC_QUEUE.map(k => (
          <div key={k.id} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: '16px', marginBottom: 14, border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#f1f5f9', marginBottom: 4 }}>{k.name}</div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 2 }}>Document: {k.docType}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 14 }}>Submitted: {k.submitDate}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ flex: 1, padding: '10px', borderRadius: 12, background: 'rgba(34,197,94,0.15)', border: 'none', color: '#22c55e', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>✅ Approve</button>
              <button style={{ flex: 1, padding: '10px', borderRadius: 12, background: 'rgba(239,68,68,0.15)', border: 'none', color: '#ef4444', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>❌ Reject</button>
            </div>
          </div>
        ))}

        {activeTab === 'Users' && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>User Management</div>
            <div style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>Search, ban, verify, and manage all 12,847 users</div>
            <button onClick={() => navigate('/admin/users')} style={{ background: 'linear-gradient(135deg,#6366f1,#ec4899)', border: 'none', borderRadius: 14, padding: '14px 32px', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>👥 Open User Management</button>
          </div>
        )}

        {activeTab === 'More' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              ['👥', 'User Management', '/admin/users'],
              ['📢', 'Announcements', '/admin/announcements'],
              ['✅', 'Verifications', '/admin/verification'],
              ['🏷️', 'KYC Review', '/admin/kyc'],
              ['🚩', 'Reports Queue', '/admin/reports'],
              ['📊', 'Creator Analytics', '/creator/analytics'],
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
