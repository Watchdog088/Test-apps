// src/pages/marketplace/SellerDashboardPage.jsx
// Seller dashboard: listing manager, orders, earnings, analytics, payouts

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '@store/useAppStore';

const LISTINGS = [
  { id: 'l1', title: 'Vintage Leather Camera Bag', price: 89.99, sold: 12, views: 847, status: 'Active', img: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=80' },
  { id: 'l2', title: 'Handmade Ceramic Mug Set', price: 55.00, sold: 8, views: 324, status: 'Active', img: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=80' },
  { id: 'l3', title: 'Vintage Film Camera (Olympus)', price: 185.00, sold: 3, views: 562, status: 'Sold Out', img: 'https://images.unsplash.com/photo-1452780212461-b8d0d8588de0?w=80' },
];

const RECENT_ORDERS = [
  { id: 'o1', buyer: 'Alex Chen', item: 'Camera Bag', amount: 89.99, status: 'Paid', date: 'May 19' },
  { id: 'o2', buyer: 'Riley Johnson', item: 'Mug Set', amount: 55.00, status: 'Shipped', date: 'May 18' },
  { id: 'o3', buyer: 'Morgan Taylor', item: 'Camera Bag', amount: 89.99, status: 'Delivered', date: 'May 15' },
];

const TABS = ['Overview', 'Listings', 'Orders', 'Earnings'];

export default function SellerDashboardPage() {
  const navigate = useNavigate();
  const showToast = useAppStore(s => s.showToast);
  const [activeTab, setActiveTab] = useState('Overview');

  const stats = [
    { label: 'Total Sales', val: '$1,847', icon: '💰', trend: '+12%' },
    { label: 'Active Listings', val: 2, icon: '📦', trend: null },
    { label: 'Orders', val: 23, icon: '🛒', trend: '+5 this month' },
    { label: 'Rating', val: '4.9 ⭐', icon: '⭐', trend: '124 reviews' },
  ];

  return (
    <div style={{ background: '#0a0a18', minHeight: '100vh', paddingBottom: 80 }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,10,24,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 22, cursor: 'pointer', padding: '4px 8px' }}>←</button>
        <span style={{ fontWeight: 700, fontSize: 17, color: '#f1f5f9' }}>🏪 Seller Dashboard</span>
        <button onClick={() => navigate('/marketplace/listing/create')} style={{ marginLeft: 'auto', padding: '8px 14px', borderRadius: 14, background: 'linear-gradient(135deg,#6366f1,#ec4899)', border: 'none', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>+ List Item</button>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '14px 16px' }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: '14px', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#f1f5f9' }}>{s.val}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>{s.label}</div>
            {s.trend && <div style={{ fontSize: 11, color: '#22c55e', marginTop: 2 }}>↑ {s.trend}</div>}
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: '12px 8px', fontSize: 13, fontWeight: 700, background: 'none', border: 'none', borderBottom: activeTab === tab ? '2px solid #6366f1' : '2px solid transparent', color: activeTab === tab ? '#818cf8' : '#475569', cursor: 'pointer' }}>{tab}</button>
        ))}
      </div>

      <div style={{ padding: '16px' }}>
        {activeTab === 'Overview' && (
          <>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#94a3b8', marginBottom: 10 }}>Recent Orders</div>
            {RECENT_ORDERS.map(o => (
              <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#f1f5f9' }}>{o.buyer}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{o.item} · {o.date}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: '#22c55e', fontSize: 14 }}>${o.amount}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{o.status}</div>
                </div>
              </div>
            ))}
            <div style={{ marginTop: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#94a3b8', marginBottom: 10 }}>Quick Actions</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[['📦', 'New Listing', '/marketplace/listing/create'], ['💳', 'Payouts', '/settings/payments'], ['📊', 'Analytics', '/creator/analytics'], ['⭐', 'Reviews', '/marketplace']].map(([icon, label, path]) => (
                  <button key={label} onClick={() => navigate(path)} style={{ padding: '14px', borderRadius: 14, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer', textAlign: 'center' }}>
                    <div style={{ fontSize: 24, marginBottom: 4 }}>{icon}</div>
                    <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>{label}</div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'Listings' && LISTINGS.map(l => (
          <div key={l.id} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <img src={l.img} alt="" style={{ width: 58, height: 58, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#f1f5f9', marginBottom: 2 }}>{l.title}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{l.views} views · {l.sold} sold</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <span style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 14 }}>${l.price}</span>
                <span style={{ fontSize: 11, background: l.status === 'Active' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: l.status === 'Active' ? '#22c55e' : '#ef4444', borderRadius: 8, padding: '2px 8px' }}>{l.status}</span>
              </div>
            </div>
            <button onClick={() => showToast('Edit listing coming soon', 'info')} style={{ alignSelf: 'center', padding: '6px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: 12, cursor: 'pointer' }}>Edit</button>
          </div>
        ))}

        {activeTab === 'Orders' && RECENT_ORDERS.map(o => (
          <div key={o.id} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: '14px', marginBottom: 12, border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontWeight: 700, color: '#f1f5f9' }}>{o.buyer}</span>
              <span style={{ fontWeight: 700, color: '#22c55e' }}>${o.amount}</span>
            </div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>{o.item} · {o.date}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontSize: 12, background: 'rgba(59,130,246,0.15)', color: '#60a5fa', borderRadius: 8, padding: '3px 10px', fontWeight: 600 }}>{o.status}</span>
              <button onClick={() => showToast('Mark as shipped', 'success')} style={{ fontSize: 12, background: 'rgba(99,102,241,0.2)', color: '#818cf8', border: 'none', borderRadius: 8, padding: '3px 12px', cursor: 'pointer', fontWeight: 600 }}>Mark Shipped ›</button>
            </div>
          </div>
        ))}

        {activeTab === 'Earnings' && (
          <div>
            <div style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(236,72,153,0.15))', borderRadius: 20, padding: '24px', border: '1px solid rgba(99,102,241,0.3)', textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Available to Withdraw</div>
              <div style={{ fontSize: 40, fontWeight: 900, color: '#f1f5f9' }}>$1,247.50</div>
              <button onClick={() => showToast('Payout requested! 3-5 business days', 'success')} style={{ marginTop: 14, padding: '12px 28px', borderRadius: 22, background: 'linear-gradient(135deg,#6366f1,#ec4899)', border: 'none', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>💳 Withdraw</button>
            </div>
            {[['May 2026', '$847.50', 9], ['April 2026', '$612.00', 7], ['March 2026', '$388.00', 4]].map(([month, amt, orders]) => (
              <div key={month} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9' }}>{month}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{orders} orders</div>
                </div>
                <span style={{ fontWeight: 700, fontSize: 16, color: '#22c55e' }}>{amt}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
