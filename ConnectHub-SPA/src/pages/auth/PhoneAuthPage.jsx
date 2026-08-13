// PhoneAuthPage.jsx — Sprint 3: Phone number authentication page
// NEW file — route: /auth/phone

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '@/firebase/config';
import { PhoneAuthProvider, RecaptchaVerifier, signInWithCredential } from 'firebase/auth';

export default function PhoneAuthPage() {
  const navigate = useNavigate();
  const recaptchaRef = useRef(null);
  const [step, setStep]         = useState('phone'); // 'phone' | 'code'
  const [phone, setPhone]       = useState('');
  const [code, setCode]         = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const sendCode = async () => {
    if (!phone.trim()) return setError('Enter a phone number');
    setError(''); setLoading(true);
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaRef.current, { size: 'invisible' });
      }
      const provider = new PhoneAuthProvider(auth);
      const vId = await provider.verifyPhoneNumber(phone, window.recaptchaVerifier);
      setVerificationId(vId);
      setStep('code');
    } catch (err) {
      setError(err.message || 'Failed to send code');
    } finally { setLoading(false); }
  };

  const verifyCode = async () => {
    if (!code.trim()) return setError('Enter the verification code');
    setError(''); setLoading(true);
    try {
      const credential = PhoneAuthProvider.credential(verificationId, code);
      await signInWithCredential(auth, credential);
      navigate('/feed');
    } catch (err) {
      setError(err.message || 'Invalid code');
    } finally { setLoading(false); }
  };

  const s = {
    page:  { minHeight: '100vh', background: '#0f0f0f', display: 'flex', flexDirection: 'column',
             alignItems: 'center', justifyContent: 'center', padding: '24px' },
    card:  { width: '100%', maxWidth: '400px', background: '#1e293b', borderRadius: '20px', padding: '32px' },
    title: { fontSize: '24px', fontWeight: 800, color: '#f1f5f9', textAlign: 'center', marginBottom: '8px' },
    sub:   { color: '#94a3b8', fontSize: '14px', textAlign: 'center', marginBottom: '28px' },
    input: { width: '100%', background: '#0f172a', border: '2px solid #334155', borderRadius: '12px',
             padding: '14px', color: '#f1f5f9', fontSize: '16px', boxSizing: 'border-box', marginBottom: '16px' },
    btn:   { width: '100%', padding: '14px', background: loading ? '#334155' : '#3b82f6',
             border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 700, fontSize: '16px', cursor: 'pointer' },
    error: { background: '#7f1d1d', color: '#fca5a5', borderRadius: '8px', padding: '10px', fontSize: '13px', marginBottom: '16px' },
    back:  { color: '#94a3b8', fontSize: '14px', cursor: 'pointer', textAlign: 'center', marginTop: '20px', background: 'none', border: 'none', width: '100%' },
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.title}>📱 Phone Sign In</div>
        <div style={s.sub}>{step === 'phone' ? 'Enter your phone number to receive a verification code' : `Enter the code sent to ${phone}`}</div>
        {error && <div style={s.error}>{error}</div>}
        {step === 'phone' ? (
          <>
            <input style={s.input} type="tel" placeholder="+1 555 000 0000" value={phone} onChange={e => setPhone(e.target.value)} />
            <div ref={recaptchaRef} />
            <button style={s.btn} onClick={sendCode} disabled={loading}>{loading ? 'Sending…' : 'Send Code'}</button>
          </>
        ) : (
          <>
            <input style={s.input} type="text" placeholder="6-digit code" value={code} onChange={e => setCode(e.target.value)} maxLength={6} />
            <button style={s.btn} onClick={verifyCode} disabled={loading}>{loading ? 'Verifying…' : 'Verify Code'}</button>
          </>
        )}
        <button style={s.back} onClick={() => navigate(-1)}>← Back</button>
      </div>
    </div>
  );
}
