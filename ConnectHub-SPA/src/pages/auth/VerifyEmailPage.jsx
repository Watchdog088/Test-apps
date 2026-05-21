// src/pages/auth/VerifyEmailPage.jsx
// SECTION-1 FIX: Email verification gate shown after signup
// User must verify their email before proceeding to onboarding

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendEmailVerification, signOut, reload } from 'firebase/auth';
import { auth } from '@fb/config';

export default function VerifyEmailPage() {
  const navigate   = useNavigate();
  const [loading, setLoading]   = useState(false);
  const [checking, setChecking] = useState(false);
  const [msg, setMsg]           = useState('');
  const [error, setError]       = useState('');
  const [countdown, setCountdown] = useState(0);

  const user = auth.currentUser;

  /* Poll every 4 seconds to check if email got verified */
  useEffect(() => {
    if (!user) { navigate('/login', { replace: true }); return; }
    const interval = setInterval(async () => {
      try {
        await reload(user);
        if (auth.currentUser?.emailVerified) {
          clearInterval(interval);
          navigate('/onboarding', { replace: true });
        }
      } catch {}
    }, 4000);
    return () => clearInterval(interval);
  }, [user]);

  /* Countdown timer for resend cooldown */
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  async function handleResend() {
    if (!user || countdown > 0) return;
    setLoading(true); setMsg(''); setError('');
    try {
      await sendEmailVerification(user);
      setMsg('✅ Verification email re-sent! Check your inbox and spam folder.');
      setCountdown(60);
    } catch (err) {
      setError('Could not resend email. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckNow() {
    if (!user) return;
    setChecking(true); setMsg(''); setError('');
    try {
      await reload(user);
      if (auth.currentUser?.emailVerified) {
        navigate('/onboarding', { replace: true });
      } else {
        setError('Email not yet verified. Please click the link in your email.');
      }
    } catch {
      setError('Could not check status. Please try again.');
    } finally {
      setChecking(false);
    }
  }

  async function handleSignOut() {
    await signOut(auth).catch(() => {});
    navigate('/login', { replace: true });
  }

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '24px',
      background: 'linear-gradient(135deg,#0f0c29,#302b63,#24243e)',
    }}>
      <div style={{
        width: '100%', maxWidth: '400px',
        background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.12)', borderRadius: '24px', padding: '40px 28px',
        textAlign: 'center',
      }}>
        {/* Icon */}
        <div style={{ fontSize: 64, marginBottom: 16 }}>📧</div>

        <h1 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
          Verify Your Email
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.6, marginBottom: 8 }}>
          We sent a verification link to
        </p>
        <p style={{
          color: '#a5b4fc', fontSize: 15, fontWeight: 700,
          background: 'rgba(99,102,241,0.1)', borderRadius: 10, padding: '8px 16px',
          marginBottom: 24, wordBreak: 'break-all',
        }}>
          {user?.email || 'your email address'}
        </p>
        <p style={{ color: '#64748b', fontSize: 13, marginBottom: 28, lineHeight: 1.6 }}>
          Click the link in the email to verify your account. This page will automatically advance once verified.
        </p>

        {/* Animated pulse to show checking */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: '#6366f1',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
          <span style={{ color: '#64748b', fontSize: 12 }}>Waiting for verification…</span>
        </div>

        {msg && (
          <div style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 12, padding: '10px 14px', color: '#10b981', fontSize: 13, marginBottom: 16 }}>
            {msg}
          </div>
        )}
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '10px 14px', color: '#ef4444', fontSize: 13, marginBottom: 16 }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={handleCheckNow} disabled={checking}
            style={{ padding: '13px', borderRadius: 12, background: 'linear-gradient(135deg,#6366f1,#ec4899)', border: 'none', color: 'white', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
            {checking ? '⏳ Checking…' : '✓ I verified — Continue'}
          </button>

          <button onClick={handleResend} disabled={loading || countdown > 0}
            style={{ padding: '12px', borderRadius: 12, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: countdown > 0 ? '#475569' : '#f1f5f9', fontWeight: 600, fontSize: 14, cursor: countdown > 0 ? 'default' : 'pointer' }}>
            {countdown > 0 ? `Resend in ${countdown}s` : loading ? 'Sending…' : '📨 Resend Verification Email'}
          </button>

          <button onClick={handleSignOut}
            style={{ padding: '11px', borderRadius: 12, background: 'none', border: 'none', color: '#64748b', fontWeight: 500, fontSize: 13, cursor: 'pointer' }}>
            ← Use a different email / Sign out
          </button>
        </div>

        <p style={{ color: '#334155', fontSize: 11, marginTop: 24 }}>
          Didn't get the email? Check your spam folder or try a different email address.
        </p>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.4)} }`}</style>
    </div>
  );
}
