// src/components/common/BetaFeedbackModal.jsx
// Beta Feedback System — May 2026
// Captures: category, description, current page, user ID, device info, timestamp
// Writes to Firestore /betaFeedback/ collection

import React, { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@fb/config';
import useAppStore from '@store/useAppStore';

const CATEGORIES = [
  { id: 'bug',     label: '🐛 Bug / Broken',     color: '#ef4444' },
  { id: 'ux',      label: '😵 Confusing UX',      color: '#f59e0b' },
  { id: 'missing', label: '🔧 Missing Feature',   color: '#6366f1' },
  { id: 'praise',  label: '🌟 Works Great!',       color: '#10b981' },
  { id: 'other',   label: '💬 Other',              color: '#64748b' },
];

export default function BetaFeedbackModal({ onClose }) {
  const [category, setCategory] = useState('bug');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const setToast = useAppStore((s) => s.setToast);

  const handleSubmit = async () => {
    if (!description.trim()) {
      setToast({ message: 'Please describe the issue first.', type: 'warning' });
      return;
    }
    setSubmitting(true);
    try {
      const user = auth.currentUser;
      await addDoc(collection(db, 'betaFeedback'), {
        userId:      user?.uid || 'anonymous',
        userEmail:   user?.email || 'unknown',
        category,
        description: description.trim(),
        pageUrl:     window.location.pathname,
        appVersion:  import.meta.env.VITE_APP_VERSION || '1.0.0-beta.1',
        device:      navigator.userAgent,
        screenSize:  `${window.screen.width}x${window.screen.height}`,
        createdAt:   serverTimestamp(),
      });
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setToast({ message: '✅ Feedback sent! Thank you!', type: 'success' });
      }, 1800);
    } catch (err) {
      console.error('[BetaFeedback] submit error:', err);
      setToast({ message: 'Failed to send feedback. Try again.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'rgba(10,8,30,0.99)', border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: '24px 24px 0 0', padding: '24px 20px 40px',
          width: '100%', maxWidth: 480, boxShadow: '0 -8px 48px rgba(0,0,0,0.6)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.18)', margin: '0 auto 20px' }} />

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: 64, marginBottom: 12 }}>🎉</div>
            <h3 style={{ color: '#f1f5f9', fontWeight: 800, fontSize: 20, marginBottom: 8 }}>Feedback Sent!</h3>
            <p style={{ color: '#64748b', fontSize: 14 }}>Thank you for helping make LynkApp better.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h3 style={{ color: '#f1f5f9', fontWeight: 800, fontSize: 18, margin: 0 }}>🧪 Beta Feedback</h3>
                <p style={{ color: '#64748b', fontSize: 12, margin: '4px 0 0' }}>
                  Page: <span style={{ color: '#818cf8' }}>{window.location.pathname}</span>
                </p>
              </div>
              <button onClick={onClose} aria-label="Close feedback"
                style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.08)', color: '#94a3b8', fontSize: 16, cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            {/* Category selector */}
            <div style={{ marginBottom: 16 }}>
              <p style={{ color: '#94a3b8', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Category</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    style={{
                      padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      border: `1.5px solid ${category === cat.id ? cat.color : 'rgba(255,255,255,0.1)'}`,
                      background: category === cat.id ? `${cat.color}22` : 'rgba(255,255,255,0.04)',
                      color: category === cat.id ? cat.color : '#94a3b8',
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ color: '#94a3b8', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Description</p>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what happened, what you expected, or what was confusing..."
                rows={4}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 14, padding: '12px 14px', color: '#f1f5f9', fontSize: 14, resize: 'none',
                  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={submitting || !description.trim()}
              style={{
                width: '100%', padding: '14px', borderRadius: 14, border: 'none',
                background: submitting || !description.trim()
                  ? 'rgba(99,102,241,0.3)'
                  : 'linear-gradient(135deg,#6366f1,#ec4899)',
                color: 'white', fontSize: 15, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {submitting ? (
                <>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.8s linear infinite' }} />
                  Sending...
                </>
              ) : '🚀 Send Feedback'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
