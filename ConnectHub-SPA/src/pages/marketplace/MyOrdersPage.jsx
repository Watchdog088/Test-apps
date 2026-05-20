// src/pages/marketplace/MyOrdersPage.jsx
// Buyer orders dashboard with status, tracking, dispute resolution

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '@store/useAppStore';

const ORDERS = [
  { id: 'ord-1001', title: 'Vintage Leather Camera Bag', seller: 'Jordan Maxwell', price: 89.99, status: 'Delivered', statusColor: '#22c55e', date: 'May 17, 2026', img: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=100' },
  { id: 'ord-1002', title: 'Wireless Noise-Cancelling Headphones', seller: 'Alex Chen', price: 149.00, status: 'In Transit', statusColor: '#3b82f6', date: 'May 19, 2026', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100', tracking: 'USPS 9400111899223382892748' },
  { id: 'ord-1003', title: 'Handmade Ceramic Mug Set (4 pcs)', seller: 'Morgan Taylor', price: 55.00, status: 'Processing', statusColor: '#f59e0b', date: 'May 20, 2026', img: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=100' },
  { id: 'ord-1004', title: 'Yoga Mat — Non-slip Premium', seller: 'Casey Lee', price: 42.50, status: 'Cancelled', statusColor: '#ef4444', date: 'May 10, 2026', img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=100' },
];

const STATUS_ICONS = { Delivered: '✅', 'In Transit': '🚚', Processing: '⏳', Cancelled: '❌' };

export default function MyOrdersPage() {
  const navigate = useNavigate();
  const showToast = useAppStore(s => s.showToast);
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Processing', 'In Transit', 'Delivered', 'Cancelled'];
  const filtered = activeFilter === 'All' ? ORDERS : ORDERS.filter(o => o.status === activeFilter);

  return (
    <div style={{ background: '#0a0a18', minHeight: '100vh', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,10,24,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 22, cursor: 'pointer', padding: '4px 8px' }}>←</button>
        <span style={{ fontWeight: 700, fontSize: 17, color: '#f1f5f9' }}>📦 My Orders</span>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 10, padding: '14px 16px' }}>
        {[{ label: 'Total Orders', val: 4, icon: '📦' }, { label: 'In Transit', val: 1, icon: '🚚' }, { label: 'Delivered', val: 2, icon: '✅' }].map(s => (
          <div key={s.label} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ fontSize: 22 }}>{s.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#f1f5f9' }}>{s.val}</div>
            <div style={{ fontSize: 10, color: '#64748b' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, padding: '0 16px 14px', overflowX: 'auto' }}>
        {filters.map(f => (
          <button key={f} onClick={() => setActiveFilter(f)} style={{
            padding: '7px 14px', borderRadius: 22, fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
            background: activeFilter === f ? 'linear-gradient(135deg,#6366f1,#ec4899)' : 'rgba(255,255,255,0.07)',
            border: 'none', color: activeFilter === f ? 'white' : '#64748b',
          }}>{f}</button>
        ))}
      </div>

      {/* Orders List */}
      <div style={{ padding: '0 16px' }}>
        {filtered.map(order => (
          <div key={order.id} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 18, padding: '14px', marginBottom: 14, border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <img src={order.img} alt="" style={{ width: 64, height: 64, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9', marginBottom: 4, lineHeight: 1.3 }}>{order.title}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Seller: {order.seller}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9' }}>${order.price}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 14 }}>{STATUS_ICONS[order.status]}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: order.statusColor }}>{order.status}</span>
              </div>
              <span style={{ fontSize: 11, color: '#475569' }}>Ordered {order.date}</span>
            </div>
            {order.tracking && (
              <div style={{ fontSize: 11, color: '#64748b', background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '6px 10px', marginBottom: 10, fontFamily: 'monospace' }}>
                🔍 {order.tracking}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => navigate(`/post/${order.id}`)} style={{ flex: 1, padding: '8px', borderRadius: 12, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>View Details</button>
              {order.status === 'Delivered' && (
                <button onClick={() => showToast('Review form coming soon!', 'info')} style={{ flex: 1, padding: '8px', borderRadius: 12, background: 'rgba(99,102,241,0.2)', border: 'none', color: '#818cf8', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>⭐ Review</button>
              )}
              {(order.status === 'Processing' || order.status === 'In Transit') && (
                <button onClick={() => showToast('Dispute filed — our team will review', 'info')} style={{ flex: 1, padding: '8px', borderRadius: 12, background: 'rgba(239,68,68,0.15)', border: 'none', color: '#ef4444', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>⚠️ Dispute</button>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#64748b' }}>No orders in this category</div>
          </div>
        )}
      </div>
    </div>
  );
}
