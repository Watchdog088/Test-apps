// src/pages/settings/DeleteAccountPage.jsx
// Features #3 & #4: Back navigation + deletion toast + typed-confirmation guard
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import useAppStore from '@store/useAppStore';

const CONFIRM_PHRASE = 'DELETE MY ACCOUNT';

const S = {
  page: { minHeight: '100vh', background: '#0a0818', color: '#f1f5f9', paddingBottom: 40 },
  header: { display: 'flex', alignItems: 'center', gap: 12, padding: '16px 16px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)' },
  back: { width: 38, height: 38, borderRadius: 12, background: 'transparent', border: '1.5px solid rgba(255,255,255,0.18)', color: '#94a3b8', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 },
  title: { fontWeight: 800, fontSize: 19, color: '#f87171' },
  body: { padding: '20px 16px' },
  warningBox: { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 16, padding: '16px', marginBottom: 20 },
  warningTitle: { fontWeight: 800, color: '#f87171', fontSize: 15, marginBottom: 8 },
  bullets: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 },
  bullet: { display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#94a3b8' },
  label: { fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 6 },
  input: { width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, color: '#f1f5f9', fontSize: 14, padding: '12px 14px', outline: 'none', fontFamily: 'inherit', marginBottom: 16 },
  inputError: { borderColor: 'rgba(239,68,68,0.5)' },
  deleteBtn: (active) => ({
    width: '100%', padding: '14px', borderRadius: 16, border: 'none',
    background: active ? 'linear-gradient(135deg,#ef4444,#b91c1c)' : 'rgba(255,255,255,0.06)',
    color: active ? '#fff' : '#475569', fontWeight: 800, fontSize: 15,
    cursor: active ? 'pointer' : 'not-allowed', marginBottom: 12, transition: 'all 0.2s',
  }),
  /* cancelBtn is now handled by className="btn-outline-neutral" */
};

export default function DeleteAccountPage() {
  const navigate = useNavigate();
  const showToast = useAppStore((s) => s.showToast);
  const setUser   = useAppStore((s) => s.setUser);

  const [phrase,    setPhrase]    = useState('');
  const [password,  setPassword]  = useState('');
  const [step,      setStep]      = useState(1); // 1 = confirm phrase, 2 = re-auth
  const [deleting,  setDeleting]  = useState(false);
  const [deleted,   setDeleted]   = useState(false);

  const phraseMatch = phrase === CONFIRM_PHRASE;

  const handleProceed = () => {
    if (!phraseMatch) return;
    // Check if user signed in with email+password (needs re-auth)
    const hasEmailProvider = auth.currentUser?.providerData?.some(p => p.providerId === 'password');
    if (hasEmailProvider) {
      setStep(2);
    } else {
      handleDelete();
    }
  };

  const handleDelete = async () => {
    if (!auth.currentUser || deleting) return;
    setDeleting(true);
    try {
      // Re-auth if password step
      if (step === 2 && password) {
        const cred = EmailAuthProvider.credential(auth.currentUser.email, password);
        await reauthenticateWithCredential(auth.currentUser, cred);
      }

      // Soft-delete: mark account as deleted in Firestore (for data-retention compliance)
      try {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          deleted: true,
          deletedAt: serverTimestamp(),
          displayName: '[Deleted User]',
          photoURL: null,
          bio: null,
        });
      } catch { /* non-blocking */ }

      // Hard delete the Firebase Auth account
      await deleteUser(auth.currentUser);

      setDeleted(true);
      setUser(null);
      showToast({ message: '✅ Account deleted. We\'re sorry to see you go.', type: 'info' });

      setTimeout(() => navigate('/login', { replace: true }), 1800);
    } catch (err) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        showToast({ message: '❌ Wrong password. Please try again.', type: 'error' });
      } else if (err.code === 'auth/requires-recent-login') {
        showToast({ message: 'Please log out and log back in before deleting.', type: 'warning' });
      } else {
        showToast({ message: 'Deletion failed. Try again or contact support.', type: 'error' });
      }
    } finally {
      setDeleting(false);
    }
  };

  if (deleted) {
    return (
      <div style={{ ...S.page, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 32 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>👋</div>
        <div style={{ fontWeight: 800, fontSize: 22, color: '#f1f5f9', marginBottom: 8 }}>Account Deleted</div>
        <div style={{ color: '#64748b', fontSize: 14 }}>Redirecting you to the login screen…</div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <div style={S.header}>
        <button style={S.back} onClick={() => navigate(-1)} aria-label="Back">←</button>
        <span style={S.title}>Delete Account</span>
      </div>

      <div style={S.body}>
        {/* Warning */}
        <div style={S.warningBox}>
          <div style={S.warningTitle}>⚠️ This action is permanent</div>
          <ul style={S.bullets}>
            {[
              'Your profile and posts will be permanently removed',
              'Your matches, messages, and conversations will be deleted',
              'Any active Premium or Creator subscriptions will be cancelled',
              'You will lose all earned coins and rewards',
              'This cannot be undone',
            ].map(t => (
              <li key={t} style={S.bullet}><span>•</span><span>{t}</span></li>
            ))}
          </ul>
        </div>

        {step === 1 && (
          <>
            <div style={{ marginBottom: 20 }}>
              <div style={S.label}>Type <strong style={{ color: '#f87171' }}>{CONFIRM_PHRASE}</strong> to continue</div>
              <input
                style={{ ...S.input, ...(phrase && !phraseMatch ? S.inputError : {}) }}
                value={phrase}
                onChange={e => setPhrase(e.target.value.toUpperCase())}
                placeholder={CONFIRM_PHRASE}
                autoComplete="off"
                spellCheck="false"
                aria-label="Confirmation phrase"
              />
              {phrase && !phraseMatch && (
                <div style={{ fontSize: 11, color: '#ef4444', marginTop: -12, marginBottom: 12 }}>
                  Phrase doesn't match. Type exactly: {CONFIRM_PHRASE}
                </div>
              )}
            </div>
            <button style={S.deleteBtn(phraseMatch && !deleting)} onClick={handleProceed} disabled={!phraseMatch || deleting}>
              {deleting ? 'Deleting…' : '🗑 Permanently Delete Account'}
            </button>
            <button className="btn-outline-neutral" onClick={() => navigate(-1)}>Cancel — Keep My Account</button>
          </>
        )}

        {step === 2 && (
          <>
            <div style={{ marginBottom: 20 }}>
              <div style={S.label}>Enter your password to confirm</div>
              <input
                style={S.input}
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Your current password"
                autoComplete="current-password"
                aria-label="Password confirmation"
              />
            </div>
            <button style={S.deleteBtn(!!password && !deleting)} onClick={handleDelete} disabled={!password || deleting}>
              {deleting ? 'Deleting…' : '🗑 Confirm Delete Account'}
            </button>
            <button className="btn-outline-neutral" onClick={() => navigate(-1)}>Cancel</button>
          </>
        )}

        <div style={{ marginTop: 16, fontSize: 12, color: '#334155', textAlign: 'center' }}>
          Changed your mind? <button onClick={() => navigate('/settings')} style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: 12, cursor: 'pointer', fontWeight: 700 }}>Go to Settings</button>
        </div>
      </div>
    </div>
  );
}
