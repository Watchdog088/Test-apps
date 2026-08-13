// TwoFactorSetupModal.jsx — Sprint 3: 2FA enrollment modal (TOTP + SMS)
// NEW component — imported by AccountSecurityPages.jsx

import React, { useState } from 'react';
import { enrollTOTP, finalizeTOTPEnrollment } from '@/services/mfa-service';

export default function TwoFactorSetupModal({ onClose, onSuccess }) {
  const [step, setStep]     = useState('choose'); // 'choose' | 'totp-scan' | 'totp-verify' | 'success'
  const [qrUrl, setQrUrl]   = useState('');
  const [secret, setSecret] = useState(null);
  const [code, setCode]     = useState('');
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const startTOTP = async () => {
    setLoading(true); setError('');
    try {
      const { totpSecret, qrCodeUrl } = await enrollTOTP();
      setSecret(totpSecret);
      setQrUrl(qrCodeUrl);
      setStep('totp-scan');
    } catch (err) {
      setError(err.message || 'Failed to start 2FA setup');
    } finally { setLoading(false); }
  };

  const verifyTOTP = async () => {
    if (!code.trim()) return setError('Enter the 6-digit code from your authenticator app');
    setLoading(true); setError('');
    try {
      await finalizeTOTPEnrollment(secret, code);
      setStep('success');
      onSuccess?.();
    } catch (err) {
      setError(err.message || 'Invalid code — try again');
    } finally { setLoading(false); }
  };

  const s = {
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex',
               alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' },
    card:    { background: '#1e293b', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '420px' },
    title:   { fontSize: '20px', fontWeight: 800, color: '#f1f5f9', marginBottom: '8px' },
    sub:     { color: '#94a3b8', fontSize: '14px', marginBottom: '24px', lineHeight: 1.5 },
    btn:     (primary) => ({
      width: '100%', padding: '14px', border: 'none', borderRadius: '12px',
      background: primary ? '#3b82f6' : '#334155', color: '#fff', fontWeight: 700, fontSize: '15px',
      cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '10px',
    }),
    input:   { width: '100%', background: '#0f172a', border: '2px solid #334155', borderRadius: '12px',
               padding: '14px', color: '#f1f5f9', fontSize: '18px', textAlign: 'center',
               letterSpacing: '0.3em', boxSizing: 'border-box', marginBottom: '16px' },
    error:   { background: '#7f1d1d', color: '#fca5a5', borderRadius: '8px', padding: '10px', fontSize: '13px', marginBottom: '16px' },
    qr:      { width: '200px', height: '200px', margin: '0 auto 20px', display: 'block', borderRadius: '12px', background: '#fff', padding: '8px' },
  };

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.card}>
        {step === 'choose' && <>
          <div style={s.title}>🔐 Enable Two-Factor Auth</div>
          <div style={s.sub}>Choose your second factor. Authenticator apps are most secure.</div>
          {error && <div style={s.error}>{error}</div>}
          <button style={s.btn(true)} onClick={startTOTP} disabled={loading}>
            📱 {loading ? 'Setting up…' : 'Use Authenticator App (TOTP)'}
          </button>
          <button style={s.btn(false)} onClick={onClose}>Cancel</button>
        </>}

        {step === 'totp-scan' && <>
          <div style={s.title}>📸 Scan QR Code</div>
          <div style={s.sub}>Open your authenticator app (Google Authenticator, Authy, etc.) and scan the QR code below.</div>
          {qrUrl && <img src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrUrl)}&size=200x200`} alt="QR Code" style={s.qr} />}
          <button style={s.btn(true)} onClick={() => setStep('totp-verify')}>I scanned it →</button>
          <button style={s.btn(false)} onClick={onClose}>Cancel</button>
        </>}

        {step === 'totp-verify' && <>
          <div style={s.title}>✅ Verify Setup</div>
          <div style={s.sub}>Enter the 6-digit code from your authenticator app to confirm.</div>
          {error && <div style={s.error}>{error}</div>}
          <input style={s.input} type="text" maxLength={6} placeholder="000000" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))} />
          <button style={s.btn(true)} onClick={verifyTOTP} disabled={loading}>{loading ? 'Verifying…' : 'Confirm'}</button>
          <button style={s.btn(false)} onClick={onClose}>Cancel</button>
        </>}

        {step === 'success' && <>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
            <div style={s.title}>2FA Enabled!</div>
            <div style={s.sub}>Your account is now protected with two-factor authentication.</div>
            <button style={s.btn(true)} onClick={onClose}>Done</button>
          </div>
        </>}
      </div>
    </div>
  );
}
