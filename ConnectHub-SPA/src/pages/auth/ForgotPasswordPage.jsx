// src/pages/auth/ForgotPasswordPage.jsx
// SECTION-1 FIX: Dedicated /forgot-password page (for direct navigation)
// Also linked from account-recovery and email templates

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@fb/config';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [sent, setSent]         = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) return setError('Please enter your email address.');
    setError(''); setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email, {
        url: window.location.origin + '/login',
        handleCodeInApp: false,
      });
      setSent(true);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        // For security, show success even if user not found
        setSent(true);
      } else {
        setError(err.message.replace('Firebase: ', '').replace(/ \(auth.*?\)\.?/, ''));
      }
    } finally {
      setLoading(false);
    }
  }

  const bg = {
    minHeight: '100dvh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', padding: '24px',
    background: 'linear-gradient(135deg,#0f0c29,#302b63,#24243e)',
  };
  const card = {
    width: '100%', maxWidth: '400px',
    background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.12)', borderRadius: '24px',
    padding: '40px 28px', textAlign: 'center',
  };
  const inp = {
    width: '100%', background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px',
    padding: '13px 16px', color: '#f1f5f9', fontSize: '15px',
    outline: 'none', boxSizing: 'border-box', textAlign: 'left',
  };

  if (sent) {
    return (
      <div style={bg}>
        <div style={card}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>✉️</div>
          <h1 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 800, marginBottom: 12 }}>Check Your Email</h1>
          <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.7, marginBottom: 8 }}>
            If an account exists for
          </p>
          <p style={{ color: '#a5b4fc', fontWeight: 700, fontSize: 15, background: 'rgba(99,102,241,0.1)', borderRadius: 10, padding: '8px 16px', marginBottom: 20, wordBreak: 'break-all' }}>
            {email}
          </p>
          <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
            you'll receive a password reset link shortly. The link expires in 1 hour.
          </p>
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '16px', marginBottom: 24, textAlign: 'left' }}>
            <p style={{ color: '#64748b', fontSize: 12, margin: 0 }}>💡 <strong style={{ color: '#94a3b8' }}>Didn't get it?</strong></p>
            <ul style={{ color: '#64748b', fontSize: 12, paddingLeft: 16, marginTop: 8, lineHeight: 1.8 }}>
              <li>Check your spam / junk folder</li>
              <li>Make sure you used the right email</li>
              <li>Allow 2–3 minutes for delivery</li>
            </ul>
          </div>
          <button onClick={() => { setSent(false); setEmail(''); }}
            style={{ width: '100%', padding: '12px', borderRadius: 12, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#f1f5f9', fontWeight: 600, fontSize: 14, cursor: 'pointer', marginBottom: 12 }}>
            Try a different email
          </button>
          <Link to="/login" style={{ color: '#818cf8', fontSize: 14, fontWeight: 600, display: 'block' }}>
            ← Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={bg}>
      <div style={card}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🔑</div>
        <h1 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Forgot Password?</h1>
        <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
          No worries! Enter your email and we'll send you a reset link.
        </p>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '10px 14px', color: '#ef4444', fontSize: 13, marginBottom: 16 }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input style={inp} type="email" placeholder="your@email.com"
            value={email} onChange={e => setEmail(e.target.value)}
            autoComplete="email" autoFocus />
          <button type="submit" disabled={loading}
            style={{ padding: '13px', borderRadius: 12, background: 'linear-gradient(135deg,#6366f1,#ec4899)', border: 'none', color: 'white', fontWeight: 700, fontSize: 15, cursor: loading ? 'default' : 'pointer' }}>
            {loading ? '⏳ Sending…' : 'Send Reset Link'}
          </button>
        </form>

        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Link to="/login" style={{ color: '#818cf8', fontSize: 14, fontWeight: 600 }}>
            ← Back to Sign In
          </Link>
          <Link to="/account-recovery" style={{ color: '#64748b', fontSize: 13 }}>
            Need account recovery instead?
          </Link>
        </div>
      </div>
    </div>
  );
}
