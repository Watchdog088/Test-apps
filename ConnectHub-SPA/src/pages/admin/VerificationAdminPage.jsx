// src/pages/admin/VerificationAdminPage.jsx
// SECTION-8 NEW: /admin/verification — Admin review of profile verification requests
// Reads verificationRequests collection; approve sets isVerified:true on user doc

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection, query, where, orderBy, getDocs, doc,
  updateDoc, serverTimestamp, limit, startAfter, getCountFromServer
} from 'firebase/firestore';
import { db } from '@fb/config';
import { useAuth } from '@hooks/useAuth';

const STATUS_COLORS = {
  pending:  { bg: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)', color: '#f59e0b' },
  approved: { bg: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', color: '#10b981' },
  rejected: { bg: 'rgba(239,68,68,0.15)',  border: '1px solid rgba(239,68,68,0.4)',  color: '#ef4444' },
};

const CATEGORY_LABELS = {
  public_figure: '⭐ Public Figure',
  creator: '🎬 Creator',
  business: '🏢 Business',
  journalist: '📰 Journalist',
  government: '🏛️ Government',
  other: '🔖 Other',
};

export default function VerificationAdminPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [totalCounts, setTotalCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [processing, setProcessing] = useState(null); // uid being processed
  const [toast, setToast] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  function showToast(msg, dur = 3000) {
    setToast(msg);
    setTimeout(() => setToast(''), dur);
  }

  // ── Load requests ─────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const snap = await getDocs(
          query(collection(db, 'verificationRequests'),
            where('status', '==', filter),
            orderBy('submittedAt', 'desc'),
            limit(50)
          )
        );
        setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));

        // Get counts for each status
        const [pSnap, aSnap, rSnap] = await Promise.all([
          getCountFromServer(query(collection(db, 'verificationRequests'), where('status', '==', 'pending'))),
          getCountFromServer(query(collection(db, 'verificationRequests'), where('status', '==', 'approved'))),
          getCountFromServer(query(collection(db, 'verificationRequests'), where('status', '==', 'rejected'))),
        ]);
        setTotalCounts({ pending: pSnap.data().count, approved: aSnap.data().count, rejected: rSnap.data().count });
      } catch (err) {
        console.error('[VerificationAdmin load]', err);
        // Fallback demo data for dev/preview
        setRequests([
          { id: 'demo1', uid: 'u1', displayName: 'Jordan Maxwell', email: 'jordan@example.com', category: 'creator', legalName: 'Jordan Maxwell', reason: 'Popular content creator with 50K+ followers across platforms.', links: 'https://youtube.com/c/jordanmax', status: 'pending', submittedAt: { toDate: () => new Date() } },
          { id: 'demo2', uid: 'u2', displayName: 'Alex Chen', email: 'alex@example.com', category: 'journalist', legalName: 'Alexander Chen', reason: 'Staff writer at TechCrunch covering AI and social media.', links: 'https://techcrunch.com/author/alex', status: 'pending', submittedAt: { toDate: () => new Date(Date.now() - 86400000) } },
        ]);
      }
      setLoading(false);
    })();
  }, [filter]);

  // ── Approve request ────────────────────────────────────────────────────────
  async function handleApprove(req) {
    if (!user?.uid || processing) return;
    const confirmed = window.confirm(`Approve verification for ${req.displayName}?\n\nThis will add ✅ badge to their profile.`);
    if (!confirmed) return;

    setProcessing(req.id);
    try {
      // Update request status
      await updateDoc(doc(db, 'verificationRequests', req.id), {
        status: 'approved',
        reviewedAt: serverTimestamp(),
        reviewedBy: user.uid,
        reviewNote: '',
      });
      // Set isVerified on user profile
      await updateDoc(doc(db, 'users', req.uid), {
        isVerified: true,
        verifiedAt: serverTimestamp(),
      });
      showToast(`✅ ${req.displayName} is now verified!`);
      setRequests(prev => prev.filter(r => r.id !== req.id));
      setTotalCounts(c => ({ ...c, pending: Math.max(0, c.pending - 1), approved: c.approved + 1 }));
    } catch (err) {
      console.error('[Approve]', err);
      showToast('❌ Failed to approve — check connection');
    }
    setProcessing(null);
  }

  // ── Reject request ─────────────────────────────────────────────────────────
  async function handleReject(req) {
    if (!user?.uid || processing) return;
    const note = window.prompt(`Rejection reason for ${req.displayName} (will be shown to user):`, 'Does not meet verification criteria at this time.');
    if (note === null) return; // cancelled

    setProcessing(req.id);
    try {
      await updateDoc(doc(db, 'verificationRequests', req.id), {
        status: 'rejected',
        reviewedAt: serverTimestamp(),
        reviewedBy: user.uid,
        reviewNote: note || 'Does not meet criteria.',
      });
      showToast(`🚫 ${req.displayName} request rejected.`);
      setRequests(prev => prev.filter(r => r.id !== req.id));
      setTotalCounts(c => ({ ...c, pending: Math.max(0, c.pending - 1), rejected: c.rejected + 1 }));
    } catch (err) {
      console.error('[Reject]', err);
      showToast('❌ Failed to reject — check connection');
    }
    setProcessing(null);
  }

  return (
    <div style={{ background: '#0a0a18', minHeight: '100vh', paddingBottom: 80, fontFamily: 'system-ui,sans-serif', color: '#f1f5f9' }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 60, left: '50%', transform: 'translateX(-50%)', background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, padding: '10px 20px', color: '#f1f5f9', fontSize: 14, fontWeight: 600, zIndex: 9999, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', whiteSpace: 'nowrap' }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'rgba(10,10,24,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)', position: 'sticky', top: 0, zIndex: 50 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 10, padding: '8px 14px', color: '#f1f5f9', fontSize: 18, cursor: 'pointer' }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 17 }}>✅ Verification Requests</div>
          <div style={{ fontSize: 11, color: '#64748b' }}>Admin review dashboard</div>
        </div>
        <div style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)', borderRadius: 10, padding: '4px 12px', color: '#f59e0b', fontSize: 12, fontWeight: 700 }}>
          {totalCounts.pending} pending
        </div>
      </div>

      {/* Status filter tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        {[
          { key: 'pending', label: `Pending (${totalCounts.pending})`, color: '#f59e0b' },
          { key: 'approved', label: `Approved (${totalCounts.approved})`, color: '#10b981' },
          { key: 'rejected', label: `Rejected (${totalCounts.rejected})`, color: '#ef4444' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setFilter(tab.key)}
            style={{ flex: 1, padding: '12px 8px', background: 'none', border: 'none', borderBottom: filter === tab.key ? `2px solid ${tab.color}` : '2px solid transparent', color: filter === tab.key ? tab.color : '#475569', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#6366f1', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : requests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 32px' }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>{filter === 'pending' ? '✅' : filter === 'approved' ? '🎉' : '🚫'}</div>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#64748b' }}>No {filter} requests</div>
        </div>
      ) : (
        <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {requests.map(req => {
            const isExpanded = expandedId === req.id;
            const statusStyle = STATUS_COLORS[req.status] || STATUS_COLORS.pending;
            const date = req.submittedAt?.toDate?.()?.toLocaleDateString() || 'Unknown date';

            return (
              <div key={req.id} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                {/* Request header */}
                <div style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, flexShrink: 0 }}>
                    {(req.displayName || 'U')[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{req.displayName || 'Unknown'}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{req.email} · {date}</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                      <span style={{ fontSize: 11, background: 'rgba(99,102,241,0.15)', borderRadius: 6, padding: '1px 7px', color: '#818cf8' }}>
                        {CATEGORY_LABELS[req.category] || req.category}
                      </span>
                      <span style={{ fontSize: 11, ...statusStyle, borderRadius: 6, padding: '1px 7px' }}>
                        {req.status}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => setExpandedId(isExpanded ? null : req.id)}
                    style={{ background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 8, padding: '6px 10px', color: '#94a3b8', cursor: 'pointer', fontSize: 12 }}>
                    {isExpanded ? '▲' : '▼'}
                  </button>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div style={{ padding: '0 16px 16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ paddingTop: 12 }}>
                      <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase' }}>Legal Name</div>
                      <div style={{ fontSize: 14, color: '#f1f5f9', marginBottom: 12 }}>{req.legalName || '—'}</div>

                      <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase' }}>Reason for Verification</div>
                      <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, marginBottom: 12, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 12 }}>{req.reason || '—'}</div>

                      {req.links && (
                        <>
                          <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase' }}>Supporting Links</div>
                          <div style={{ fontSize: 13, color: '#6366f1', marginBottom: 12 }}>{req.links}</div>
                        </>
                      )}

                      {req.idDocumentUrl && (
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>ID Document</div>
                          {req.idDocumentUrl.endsWith('.pdf') ? (
                            <a href={req.idDocumentUrl} target="_blank" rel="noreferrer"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 10, padding: '8px 14px', color: '#818cf8', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                              📄 View PDF Document
                            </a>
                          ) : (
                            <img src={req.idDocumentUrl} alt="ID Document"
                              style={{ width: '100%', maxWidth: 280, borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', display: 'block' }} />
                          )}
                        </div>
                      )}

                      {/* Actions — only for pending */}
                      {req.status === 'pending' && (
                        <div style={{ display: 'flex', gap: 10 }}>
                          <button onClick={() => handleApprove(req)} disabled={!!processing}
                            style={{ flex: 1, padding: '12px', background: processing === req.id ? 'rgba(16,185,129,0.3)' : 'linear-gradient(135deg,#10b981,#059669)', border: 'none', borderRadius: 12, color: '#fff', fontWeight: 700, fontSize: 14, cursor: processing ? 'not-allowed' : 'pointer' }}>
                            {processing === req.id ? '⏳ Processing…' : '✅ Approve'}
                          </button>
                          <button onClick={() => handleReject(req)} disabled={!!processing}
                            style={{ flex: 1, padding: '12px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 12, color: '#ef4444', fontWeight: 700, fontSize: 14, cursor: processing ? 'not-allowed' : 'pointer' }}>
                            🚫 Reject
                          </button>
                        </div>
                      )}

                      {req.status !== 'pending' && req.reviewNote && (
                        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 12, fontSize: 13, color: '#64748b' }}>
                          <strong style={{ color: '#94a3b8' }}>Review note:</strong> {req.reviewNote}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
