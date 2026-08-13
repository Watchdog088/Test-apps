// StripeConnectReturnPage.jsx — Sprint 2: Return page after Stripe Connect onboarding
// NEW file — reached after /wallet/connect/return redirect from Stripe

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/firebase/config';

export default function StripeConnectReturnPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) { navigate('/auth/login'); return; }

    // Stripe redirects back here after onboarding. Mark user as having started Connect.
    const saveConnectStatus = async () => {
      try {
        await updateDoc(doc(db, 'users', uid), {
          stripeConnectStarted: true,
          stripeConnectReturnAt: new Date().toISOString(),
        });
        setStatus('success');
        // Auto-redirect to wallet after 3s
        setTimeout(() => navigate('/wallet'), 3000);
      } catch {
        setStatus('error');
      }
    };

    saveConnectStatus();
  }, []);

  const s = {
    page:  { minHeight: '100vh', background: '#0f0f0f', display: 'flex', flexDirection: 'column',
             alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' },
    icon:  { fontSize: '64px', marginBottom: '24px' },
    title: { fontSize: '24px', fontWeight: 800, color: '#f1f5f9', marginBottom: '12px' },
    body:  { fontSize: '15px', color: '#94a3b8', marginBottom: '32px', lineHeight: '1.6' },
    btn:   { padding: '14px 32px', background: '#3b82f6', border: 'none', borderRadius: '12px',
             color: '#fff', fontWeight: 700, fontSize: '16px', cursor: 'pointer' },
  };

  if (status === 'verifying') return (
    <div style={s.page}>
      <div style={s.icon}>⏳</div>
      <div style={s.title}>Verifying your account…</div>
      <div style={s.body}>Please wait while we confirm your Stripe Connect setup.</div>
    </div>
  );

  if (status === 'success') return (
    <div style={s.page}>
      <div style={s.icon}>✅</div>
      <div style={s.title}>Bank Account Connected!</div>
      <div style={s.body}>
        Your payout account is set up. You'll be redirected to your wallet in a moment.
      </div>
      <button style={s.btn} onClick={() => navigate('/wallet')}>Go to Wallet</button>
    </div>
  );

  return (
    <div style={s.page}>
      <div style={s.icon}>❌</div>
      <div style={s.title}>Something went wrong</div>
      <div style={s.body}>We couldn't verify your Connect account. Please try again from your wallet.</div>
      <button style={s.btn} onClick={() => navigate('/wallet')}>Back to Wallet</button>
    </div>
  );
}
