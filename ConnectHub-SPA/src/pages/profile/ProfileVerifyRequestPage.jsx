// src/pages/profile/ProfileVerifyRequestPage.jsx
// SECTION-8 NEW: /profile/verify-request — submit ID for profile verification badge
// Saves request to Firestore verificationRequests/{uid}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@fb/config';
import { useAuth } from '@hooks/useAuth';

const CATEGORIES = [
  { id: 'public_figure', label: 'Public Figure / Celebrity', icon: '⭐' },
  { id: 'creator', label: 'Content Creator', icon: '🎬' },
  { id: 'business', label: 'Business / Brand', icon: '🏢' },
  { id: 'journalist', label: 'Journalist / Media', icon: '📰' },
  { id: 'government', label: 'Government / Organization', icon: '🏛️' },
  { id: 'other', label: 'Other Notable Account', icon: '🔖' },
];

export default function ProfileVerifyRequestPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [category, setCategory] = useState('');
  const [legalName, setLegalName] = useState('');
  const [reason, setReason] = useState('');
  const [links, setLinks] = useState('');
  const [idFile, setIdFile] = useState(null);
  const [idPreview, setIdPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState('');

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  function handleIdFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      showToast('❌ Please upload an image or PDF');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast('❌ File must be under 10MB');
      return;
    }
    setIdFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = e => setIdPreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setIdPreview('pdf');
    }
  }

  async function handleSubmit() {
    if (!user?.uid) return;
    if (!category) { showToast('❌ Please select an account category'); return; }
    if (!legalName.trim()) { showToast('❌ Legal name is required'); return; }
    if (!reason.trim()) { showToast('❌ Please explain why you should be verified'); return; }
    if (!idFile) { showToast('❌ Please upload a government-issued ID'); return; }

    setSaving(true);
    try {
      // Check for existing request
      const existing = await getDoc(doc(db, 'verificationRequests', user.uid));
      if (existing.exists() && existing.data().status === 'pending') {
        showToast('⚠️ You already have a pending verification request');
        setSaving(false);
        return;
      }

      // Upload ID document
      setUploading(true);
      const path = `verification/${user.uid}/${Date.now()}_${idFile.name}`;
      const sRef = storageRef(storage, path);
      const task = uploadBytesResumable(sRef, idFile);
      await new Promise((res, rej) => task.on('state_changed', null, rej, res));
      const idUrl = await getDownloadURL(sRef);
      setUploading(false);

      // Save request to Firestore
      await setDoc(doc(db, 'verificationRequests', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        category,
        legalName: legalName.trim(),
        reason: reason.trim(),
        links: links.trim(),
        idDocumentUrl: idUrl,
        status: 'pending',
        submittedAt: serverTimestamp(),
        reviewedAt: null,
        reviewedBy: null,
      });

      setSubmitted(true);
    } catch (err) {
      console.error('[VerifyRequest]', err);
      showToast('❌ Submission failed — please try again');
    }
    setSaving(false);
    setUploading(false);
  }

  return (
    <div style={{ background: '#0a0a18', minHeight: '100vh', paddingBottom: 100, fontFamily: 'system-ui,sans-serif', color: '#f1f5f9' }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 60, left: '50%', transform: 'translateX(-50%)', background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, padding: '10px 20px', color: '#f1f5f9', fontSize: 14, fontWeight: 600, zIndex: 9999, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', whiteSpace: 'nowrap' }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'rgba(10,10,24,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)', position: 'sticky', top: 0, zIndex: 50 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 10, padding: '8px 14px', color: '#f1f5f9', fontSize: 18, cursor: 'pointer' }}>←</button>
        <div>
          <div style={{ fontWeight: 700, fontSize: 17 }}>✅ Request Verification</div>
          <div style={{ fontSize: 11, color: '#64748b' }}>Verified badge on your profile</div>
        </div>
      </div>

      {submitted ? (
        /* Success State */
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: 80, marginBottom: 20 }}>✅</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 12px' }}>Request Submitted!</h2>
          <p style={{ color: '#64748b', marginBottom: 8, lineHeight: 1.6 }}>
            Your verification request has been submitted for review. Our team typically reviews requests within 5–7 business days.
          </p>
          <p style={{ color: '#475569', fontSize: 13, marginBottom: 32 }}>
            You'll receive a notification when a decision has been made.
          </p>
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 16, border: '1px solid rgba(255,255,255,0.07)', width: '100%', maxWidth: 360, textAlign: 'left', marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#94a3b8' }}>What happens next:</div>
            {['Our team reviews your submission', 'We verify your identity document', 'Decision made within 5–7 days', 'Badge added if approved'].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', fontSize: 13, color: '#64748b' }}>
                <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#818cf8', flexShrink: 0 }}>{i + 1}</span>
                {s}
              </div>
            ))}
          </div>
          <button onClick={() => navigate('/profile')} style={{ background: 'linear-gradient(135deg,#6366f1,#ec4899)', border: 'none', borderRadius: 14, padding: '14px 32px', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
            Back to Profile
          </button>
        </div>
      ) : (
        <div style={{ padding: '0 0 16px' }}>
          {/* Info Banner */}
          <div style={{ margin: 16, background: 'rgba(99,102,241,0.1)', borderRadius: 16, padding: 16, border: '1px solid rgba(99,102,241,0.2)' }}>
            <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 15 }}>✅ About Verification</div>
            <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.6, margin: 0 }}>
              The verification badge (✅) confirms that your account represents a notable public figure, brand, or organization. All submissions are reviewed by our Trust & Safety team.
            </p>
          </div>

          {/* Category */}
          <div style={{ padding: '8px 16px 4px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Account Category *</div>
          <div style={{ margin: '4px 16px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setCategory(cat.id)} style={{
                padding: '12px', borderRadius: 14, cursor: 'pointer', textAlign: 'left',
                background: category === cat.id ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                border: category === cat.id ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.07)',
              }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{cat.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: category === cat.id ? '#818cf8' : '#94a3b8', lineHeight: 1.3 }}>{cat.label}</div>
              </button>
            ))}
          </div>

          {/* Form Fields */}
          <div style={{ padding: '8px 16px 4px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Personal Information</div>
          <div style={{ margin: '4px 16px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6, fontWeight: 600 }}>Legal Name *</div>
              <input
                value={legalName}
                onChange={e => setLegalName(e.target.value)}
                placeholder="Your full legal name as on your ID"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, width: '100%', boxSizing: 'border-box', outline: 'none' }}
              />
            </div>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6, fontWeight: 600 }}>Why should your account be verified? *</div>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Describe your public presence, achievements, media coverage, etc."
                maxLength={500}
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, width: '100%', boxSizing: 'border-box', outline: 'none', resize: 'vertical', minHeight: 100, fontFamily: 'inherit' }}
              />
              <div style={{ fontSize: 11, color: '#475569', marginTop: 4, textAlign: 'right' }}>{reason.length}/500</div>
            </div>
            <div style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6, fontWeight: 600 }}>Supporting Links (optional)</div>
              <textarea
                value={links}
                onChange={e => setLinks(e.target.value)}
                placeholder="Links to news articles, Wikipedia, official websites, etc. (one per line)"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, width: '100%', boxSizing: 'border-box', outline: 'none', resize: 'vertical', minHeight: 80, fontFamily: 'inherit' }}
              />
            </div>
          </div>

          {/* ID Upload */}
          <div style={{ padding: '8px 16px 4px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Government-Issued ID *</div>
          <div style={{ margin: '4px 16px 12px' }}>
            {!idFile ? (
              <label style={{ display: 'block', background: 'rgba(255,255,255,0.04)', borderRadius: 16, border: '2px dashed rgba(255,255,255,0.15)', padding: '32px 16px', textAlign: 'center', cursor: 'pointer' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🪪</div>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>Upload ID Document</div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Passport, driver's license, or government ID</div>
                <div style={{ fontSize: 11, color: '#475569' }}>PNG, JPG, or PDF · Max 10MB</div>
                <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={handleIdFile} />
              </label>
            ) : (
              <div style={{ background: 'rgba(16,185,129,0.1)', borderRadius: 16, border: '1px solid rgba(16,185,129,0.3)', padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                {idPreview && idPreview !== 'pdf' ? (
                  <img src={idPreview} alt="ID" style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 8 }} />
                ) : (
                  <div style={{ width: 60, height: 40, background: 'rgba(255,255,255,0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>📄</div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#10b981' }}>✓ {idFile.name}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{(idFile.size / 1024 / 1024).toFixed(1)} MB</div>
                </div>
                <button onClick={() => { setIdFile(null); setIdPreview(''); }} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 20 }}>✕</button>
              </div>
            )}
          </div>

          {/* Privacy Note */}
          <div style={{ margin: '0 16px 16px', padding: 12, background: 'rgba(245,158,11,0.08)', borderRadius: 12, border: '1px solid rgba(245,158,11,0.2)', fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
            🔒 <strong style={{ color: '#f59e0b' }}>Privacy:</strong> Your ID document is encrypted and stored securely. It is only accessible by authorized Trust & Safety reviewers and will be deleted after verification is complete.
          </div>

          {/* Submit */}
          <div style={{ padding: '0 16px' }}>
            <button
              onClick={handleSubmit}
              disabled={saving || uploading}
              style={{ width: '100%', background: saving || uploading ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg,#6366f1,#ec4899)', border: 'none', borderRadius: 16, padding: '16px', color: '#fff', fontWeight: 800, fontSize: 16, cursor: saving || uploading ? 'not-allowed' : 'pointer' }}>
              {uploading ? '⏳ Uploading ID…' : saving ? '⏳ Submitting…' : '📤 Submit Verification Request'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
