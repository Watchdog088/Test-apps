// src/pages/misc/ReportPage.jsx
// Features #3 & #4: Back navigation + submit confirmation toast
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import useAppStore from '@store/useAppStore';

const REASONS = [
  { value: 'spam',       label: '🗑 Spam or fake account' },
  { value: 'hate',       label: '🚫 Hate speech or harassment' },
  { value: 'nudity',     label: '🔞 Nudity or sexual content' },
  { value: 'violence',   label: '⚠️ Violence or threats' },
  { value: 'scam',       label: '💰 Scam or fraud' },
  { value: 'privacy',    label: '🔏 Privacy violation' },
  { value: 'ip',         label: '©️ Intellectual property' },
  { value: 'other',      label: '📝 Other' },
];

const S = {
  page: { minHeight: '100vh', background: '#0a0818', color: '#f1f5f9', paddingBottom: 40 },
  header: { display: 'flex', alignItems: 'center', gap: 12, padding: '16px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.07)' },
  back: { width: 38, height: 38, borderRadius: 12, background: 'transparent', border: '1.5px solid rgba(255,255,255,0.18)', color: '#94a3b8', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 },
  title: { fontWeight: 800, fontSize: 19, color: '#f1f5f9' },
  section: { padding: '16px 16px 8px', fontSize: 12, fontWeight: 700, color: '#475569', letterSpacing: '0.08em', textTransform: 'uppercase' },
  reasonBtn: (selected) => ({
    display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
    background: selected ? 'rgba(99,102,241,0.12)' : 'transparent',
    border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)',
    color: selected ? '#a5b4fc' : '#cbd5e1', fontSize: 14, cursor: 'pointer',
    width: '100%', textAlign: 'left', transition: 'background 0.15s',
  }),
  radio: (selected) => ({
    width: 18, height: 18, borderRadius: '50%', border: `2px solid ${selected ? '#6366f1' : '#475569'}`,
    background: selected ? '#6366f1' : 'transparent', flexShrink: 0, transition: 'all 0.15s',
  }),
  textarea: { width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, color: '#f1f5f9', fontSize: 14, padding: '12px 14px', outline: 'none', resize: 'vertical', minHeight: 90, fontFamily: 'inherit', margin: '4px 0 0' },
  submitBtn: (active) => ({
    display: 'block', width: 'calc(100% - 32px)', margin: '20px 16px 0',
    padding: '14px', borderRadius: 16, border: 'none',
    background: active ? 'linear-gradient(135deg,#6366f1,#ec4899)' : 'rgba(255,255,255,0.08)',
    color: active ? '#fff' : '#475569', fontWeight: 800, fontSize: 15,
    cursor: active ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
  }),
  successBox: { margin: '40px 16px', padding: '28px 20px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 20, textAlign: 'center' },
};

export default function ReportPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const showToast = useAppStore((s) => s.showToast);

  const targetId   = state?.targetId   || null;
  const targetType = state?.targetType || 'user';
  const context    = state?.context    || 'general';

  const [reason,    setReason]    = useState('');
  const [details,   setDetails]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);

  const handleSubmit = async () => {
    if (!reason || submitting) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'reports'), {
        reportedById: auth.currentUser?.uid || null,
        targetId, targetType, context, reason,
        details: details.trim() || null,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
      showToast({ message: '✅ Report submitted. Our team will review it.', type: 'success' });
    } catch {
      showToast({ message: 'Failed to submit. Please try again.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={S.page}>
      {/* Header with back button */}
      <div style={S.header}>
        <button style={S.back} onClick={() => navigate(-1)} aria-label="Back">←</button>
        <span style={S.title}>Report</span>
      </div>

      {submitted ? (
        <div style={S.successBox}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>✅</div>
          <div style={{ fontWeight: 800, fontSize: 18, color: '#4ade80', marginBottom: 8 }}>Report Submitted</div>
          <div style={{ color: '#64748b', fontSize: 14, marginBottom: 20 }}>
            Thanks for keeping LynkApp safe. Our moderation team will review your report within 24 hours.
          </div>
          <button className="btn-outline-neutral" onClick={() => navigate(-2)}>Go Back</button>
        </div>
      ) : (
        <>
          <div style={{ padding: '14px 16px 4px', color: '#64748b', fontSize: 13 }}>
            Help us understand what's happening. Select a reason below.
          </div>

          {/* Target info */}
          {targetId && (
            <div style={{ margin: '0 16px 4px', padding: '10px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: 12, fontSize: 12, color: '#475569' }}>
              Reporting {targetType}: <span style={{ color: '#94a3b8', fontWeight: 600 }}>{targetId.substring(0, 12)}…</span>
            </div>
          )}

          {/* Reason list */}
          <div style={S.section}>Select reason</div>
          <div>
            {REASONS.map(({ value, label }) => (
              <button key={value} style={S.reasonBtn(reason === value)} onClick={() => setReason(value)}>
                <div style={S.radio(reason === value)} />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Additional details */}
          <div style={{ padding: '16px 16px 0' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Additional details (optional)</div>
            <textarea
              style={S.textarea}
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder="Describe what happened…"
              maxLength={500}
            />
            <div style={{ fontSize: 11, color: '#334155', textAlign: 'right', marginTop: 4 }}>{details.length}/500</div>
          </div>

          {/* Submit */}
          <button
            style={S.submitBtn(!!reason && !submitting)}
            onClick={handleSubmit}
            disabled={!reason || submitting}
          >
            {submitting ? 'Submitting…' : '🚨 Submit Report'}
          </button>

          <div style={{ padding: '12px 16px 0', fontSize: 11, color: '#334155', textAlign: 'center' }}>
            False reports may result in account restrictions. All reports are reviewed by our team.
          </div>
        </>
      )}
    </div>
  );
}
