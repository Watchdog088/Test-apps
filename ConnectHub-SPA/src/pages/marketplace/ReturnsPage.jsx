/**
 * ReturnsPage.jsx — Section 12 Marketplace (Sprint 25 — May 2026)
 *
 * FIXES:
 * ✅ FIX-21: Returns/Refunds flow — was completely missing, no flow existed
 * ✅ FIX-22: Loads completed orders from localStorage so user can select what to return
 * ✅ FIX-23: Return reason selector + description + photo evidence upload
 * ✅ FIX-24: Refund method selection (Original payment / Store credit)
 * ✅ FIX-25: Saves return request to Firestore (graceful localStorage fallback)
 * ✅ FIX-26: Return request confirmation with case number
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { uploadPhotos } from '../../services/marketplace-backend-service.js';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const app = getApps().length ? getApps()[0] : initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'connecthub-demo',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
});
const db = getFirestore(app);

const RETURN_REASONS = [
  'Item not as described',
  'Item arrived damaged',
  'Wrong item received',
  'Item never arrived',
  'Changed my mind',
  'Quality not as expected',
  'Duplicate purchase',
  'Better price found elsewhere',
];

const S = {
  page:    { minHeight: '100dvh', background: '#0a0a18', color: '#f1f5f9', fontFamily: 'system-ui,sans-serif', paddingBottom: 100 },
  hdr:     { display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', position: 'sticky', top: 0, background: 'rgba(10,10,24,0.95)', backdropFilter: 'blur(20px)', zIndex: 10 },
  back:    { background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 10, padding: '8px 14px', color: '#f1f5f9', fontSize: 18, cursor: 'pointer' },
  title:   { fontSize: 18, fontWeight: 800, color: '#f1f5f9' },
  section: { margin: '16px 16px 0', background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 16, border: '1px solid rgba(255,255,255,0.07)' },
  secTitle:{ fontSize: 13, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  input:   { width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '12px 14px', color: '#f1f5f9', fontSize: 14, boxSizing: 'border-box', outline: 'none', marginBottom: 10, resize: 'none' },
  btn:     { width: '100%', padding: 16, borderRadius: 14, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 16, color: 'white', background: 'linear-gradient(135deg,#6366f1,#ec4899)', marginTop: 8 },
  btnAlt:  { width: '100%', padding: 14, borderRadius: 14, border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', fontWeight: 700, fontSize: 15, color: '#f1f5f9', background: 'rgba(255,255,255,0.06)', marginTop: 8 },
  reasonOpt:(s) => ({ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, border: s ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', marginBottom: 8, background: s ? 'rgba(99,102,241,0.08)' : 'transparent' }),
  refundOpt:(s) => ({ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, border: s ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', marginBottom: 8, background: s ? 'rgba(16,185,129,0.08)' : 'transparent' }),
  uploadBox:{ border: '2px dashed rgba(99,102,241,0.4)', borderRadius: 12, padding: 20, textAlign: 'center', cursor: 'pointer', background: 'rgba(99,102,241,0.04)', marginBottom: 10 },
  orderCard:(s) => ({ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, border: s ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', marginBottom: 8, background: s ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.02)' }),
  toast:   { position: 'fixed', bottom: 30, left: '50%', transform: 'translateX(-50%)', background: '#1e293b', color: '#f1f5f9', padding: '12px 24px', borderRadius: 14, fontWeight: 600, fontSize: 14, zIndex: 300, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', whiteSpace: 'nowrap' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 24 },
  modal:   { background: '#1e293b', borderRadius: 24, padding: 28, textAlign: 'center', maxWidth: 360, width: '100%' },
};

export default function ReturnsPage() {
  const navigate = useNavigate();
  const { orderId: prefilledOrderId } = useParams();
  const photoRef = useRef(null);
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(prefilledOrderId || '');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [refundMethod, setRefundMethod] = useState('original');
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [caseNumber, setCaseNumber] = useState('');
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2800); };

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('mkt_orders') || '[]');
      setOrders(stored);
    } catch {}
  }, []);

  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  async function handlePhotoSelect(e) {
    const files = Array.from(e.target.files || []).slice(0, 3 - photos.length);
    if (!files.length) return;
    setUploading(true);
    const previews = files.map(f => URL.createObjectURL(f));
    setPhotos(prev => [...prev, ...previews]);
    try {
      const urls = await uploadPhotos(files);
      if (urls?.length) setPhotos(prev => {
        const n = [...prev];
        previews.forEach((p, i) => { const idx = n.indexOf(p); if (idx !== -1) n[idx] = urls[i] || p; });
        return n;
      });
    } catch {}
    setUploading(false);
  }

  async function handleSubmit() {
    if (!selectedOrderId) { showToast('❌ Please select an order'); return; }
    if (!reason) { showToast('❌ Please select a return reason'); return; }
    if (!description.trim()) { showToast('❌ Please describe the issue'); return; }
    setSubmitting(true);

    const caseNum = 'RET-' + Math.floor(Math.random() * 900000 + 100000);
    const returnReq = {
      caseNumber: caseNum,
      orderId: selectedOrderId,
      orderItems: selectedOrder?.items || [],
      orderTotal: selectedOrder?.total || 0,
      reason,
      description: description.trim(),
      refundMethod,
      photos,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    try {
      await addDoc(collection(db, 'returnRequests'), { ...returnReq, submittedAt: serverTimestamp() });
    } catch {
      try {
        const stored = JSON.parse(localStorage.getItem('mkt_returns') || '[]');
        localStorage.setItem('mkt_returns', JSON.stringify([returnReq, ...stored]));
      } catch {}
    }

    // Update order status
    try {
      const stored = JSON.parse(localStorage.getItem('mkt_orders') || '[]');
      localStorage.setItem('mkt_orders', JSON.stringify(stored.map(o => o.id === selectedOrderId ? { ...o, returnStatus: 'pending', returnCase: caseNum } : o)));
    } catch {}

    setSubmitting(false);
    setCaseNumber(caseNum);
  }

  if (caseNumber) {
    return (
      <div style={S.page}>
        <div style={S.hdr}><button style={S.back} onClick={() => navigate('/marketplace/orders')}>←</button><span style={S.title}>↩️ Return Request</span></div>
        <div style={{ padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>✅</div>
          <h2 style={{ color: '#f1f5f9', margin: '0 0 8px' }}>Return Request Submitted</h2>
          <p style={{ color: '#64748b', marginBottom: 24, maxWidth: 300, margin: '0 auto 20px' }}>We've received your return request and will review it within 2 business days.</p>
          <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 16, padding: 16, marginBottom: 24, maxWidth: 320, margin: '0 auto 24px' }}>
            {[['📋 Case Number', caseNumber], ['📦 Order', selectedOrderId.slice(-10)], ['🔄 Reason', reason], ['💰 Refund To', refundMethod === 'original' ? 'Original Payment' : 'Store Credit'], ['📊 Status', '🔄 Under Review'], ['⏱️ Resolution', '2-5 business days']].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 13 }}>
                <span style={{ color: '#94a3b8' }}>{l}</span>
                <span style={{ fontWeight: 600, textAlign: 'right', maxWidth: '55%' }}>{v}</span>
              </div>
            ))}
          </div>
          <button style={{ ...S.btn, maxWidth: 320 }} onClick={() => navigate('/marketplace/orders')}>Track Return Status</button>
          <button style={{ ...S.btnAlt, maxWidth: 320 }} onClick={() => navigate('/marketplace')}>Continue Shopping</button>
        </div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <div style={S.hdr}><button style={S.back} onClick={() => navigate(-1)}>←</button><span style={S.title}>↩️ Request a Return</span></div>

      {/* Select Order */}
      {!prefilledOrderId && (
        <div style={S.section}>
          <div style={S.secTitle}>📦 Select Order to Return</div>
          {orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 24, color: '#64748b' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>📭</div>
              <div>No orders found. Complete a purchase to request a return.</div>
              <button style={{ ...S.btn, marginTop: 16 }} onClick={() => navigate('/marketplace')}>Browse Marketplace</button>
            </div>
          ) : orders.map(order => (
            <div key={order.id} style={S.orderCard(selectedOrderId === order.id)} onClick={() => setSelectedOrderId(order.id)}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📦</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{order.items?.[0]?.title?.slice(0, 26) || 'Order'}…</div>
                <div style={{ color: '#64748b', fontSize: 11 }}>#{order.id.slice(-8)} · ${order.total?.toFixed(2)}</div>
              </div>
              {selectedOrderId === order.id && <span style={{ color: '#6366f1', fontWeight: 700 }}>✓</span>}
            </div>
          ))}
        </div>
      )}

      {/* Selected Order Info */}
      {selectedOrder && (
        <div style={S.section}>
          <div style={S.secTitle}>📋 Order Details</div>
          {selectedOrder.items?.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 14, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: '#94a3b8' }}>{item.title?.slice(0, 30)}</span>
              <span style={{ fontWeight: 600 }}>${(item.price * item.qty).toFixed(2)}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginTop: 8 }}>
            <span>Total</span><span>${selectedOrder.total?.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Return Reason */}
      <div style={S.section}>
        <div style={S.secTitle}>❓ Return Reason</div>
        {RETURN_REASONS.map(r => (
          <div key={r} style={S.reasonOpt(reason === r)} onClick={() => setReason(r)}>
            <div style={{ width: 16, height: 16, borderRadius: '50%', border: reason === r ? '2px solid #6366f1' : '2px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {reason === r && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1' }} />}
            </div>
            <span style={{ fontSize: 14, fontWeight: reason === r ? 600 : 400 }}>{r}</span>
          </div>
        ))}
      </div>

      {/* Description */}
      <div style={S.section}>
        <div style={S.secTitle}>📝 Describe the Issue</div>
        <textarea
          style={{ ...S.input, height: 100, lineHeight: 1.5 }}
          placeholder="Please describe the problem in detail. What did you receive vs. what you expected?"
          value={description}
          onChange={e => setDescription(e.target.value)}
          maxLength={500}
        />
        <div style={{ textAlign: 'right', fontSize: 12, color: '#64748b' }}>{description.length}/500</div>
      </div>

      {/* Photo Evidence */}
      <div style={S.section}>
        <div style={S.secTitle}>📸 Photo Evidence (optional but helpful)</div>
        {photos.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
            {photos.map((url, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <img src={url} alt="Evidence" style={{ width: 76, height: 76, objectFit: 'cover', borderRadius: 8 }} />
                <button onClick={() => setPhotos(p => p.filter((_, j) => j !== i))} style={{ position: 'absolute', top: -6, right: -6, background: '#ef4444', border: 'none', borderRadius: '50%', width: 20, height: 20, color: '#fff', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
              </div>
            ))}
          </div>
        )}
        {photos.length < 3 && (
          <div style={S.uploadBox} onClick={() => photoRef.current?.click()}>
            {uploading ? <div>⏳ Uploading…</div> : (
              <>
                <div style={{ fontSize: 28, marginBottom: 4 }}>📸</div>
                <div style={{ color: '#94a3b8', fontSize: 13 }}>Add photos showing the issue</div>
              </>
            )}
          </div>
        )}
        <input ref={photoRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handlePhotoSelect} />
      </div>

      {/* Refund Method */}
      <div style={S.section}>
        <div style={S.secTitle}>💰 Refund Method</div>
        <div style={S.refundOpt(refundMethod === 'original')} onClick={() => setRefundMethod('original')}>
          <div style={{ width: 16, height: 16, borderRadius: '50%', border: refundMethod === 'original' ? '2px solid #10b981' : '2px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {refundMethod === 'original' && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>💳 Original Payment Method</div>
            <div style={{ color: '#64748b', fontSize: 12 }}>Refund to original card/PayPal (3-5 business days)</div>
          </div>
        </div>
        <div style={S.refundOpt(refundMethod === 'credit')} onClick={() => setRefundMethod('credit')}>
          <div style={{ width: 16, height: 16, borderRadius: '50%', border: refundMethod === 'credit' ? '2px solid #10b981' : '2px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {refundMethod === 'credit' && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>🎁 Store Credit</div>
            <div style={{ color: '#64748b', fontSize: 12 }}>Instant credit added to your account (+5% bonus)</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 16px 0' }}>
        <button style={{ ...S.btn, opacity: submitting ? 0.7 : 1 }} onClick={handleSubmit} disabled={submitting}>
          {submitting ? '⏳ Submitting…' : '↩️ Submit Return Request'}
        </button>
        <div style={{ textAlign: 'center', fontSize: 12, color: '#64748b', marginTop: 10 }}>
          Returns accepted within 30 days of delivery · Subject to seller review
        </div>
      </div>

      {toast && <div style={S.toast}>{toast}</div>}
    </div>
  );
}
