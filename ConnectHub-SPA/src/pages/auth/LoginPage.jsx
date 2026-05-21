// src/pages/auth/LoginPage.jsx
// SECTION-1 AUDIT FIX — May 2026
// ✅ FIX-01: Google OAuth with graceful error handling (popup + mobile redirect)
// ✅ FIX-02: Apple Sign-In stub with clear "not yet configured" message
// ✅ FIX-03: Forgot Password inline modal (no page navigation needed)
// ✅ FIX-04: "Remember Me" checkbox with Firebase setPersistence
// ✅ FIX-05: Phone number login tab
// ✅ FIX-06: Biometric login stub (Face ID / Touch ID)
// ✅ FIX-07: Password strength indicator on signup
// ✅ FIX-08: Send email verification after signup
// ✅ FIX-09: Demo login persists across refresh via sessionStorage

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  sendPasswordResetEmail,
  sendEmailVerification,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@fb/config';
import useAppStore from '@store/useAppStore';

/* ─── Demo user data ─────────────────────────────────────────────── */
const DEMO_USER = {
  uid: 'demo-user-001',
  email: 'demo@lynkapp.com',
  displayName: 'Demo User',
  photoURL: null,
  emailVerified: true,
};
const DEMO_PROFILE = {
  uid: 'demo-user-001',
  displayName: 'Demo User',
  email: 'demo@lynkapp.com',
  photoURL: null,
  bio: '👋 Exploring LynkApp — demo account',
  postsCount: 12,
  followersCount: 248,
  followingCount: 64,
  isVerified: false,
};

/* ─── Password strength helper ────────────────────────────────────── */
function getPasswordStrength(pw) {
  if (!pw) return { score: 0, label: '', color: '#334155' };
  let score = 0;
  if (pw.length >= 8)  score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { label: '', color: '#334155' },
    { label: 'Weak', color: '#ef4444' },
    { label: 'Fair', color: '#f59e0b' },
    { label: 'Good', color: '#3b82f6' },
    { label: 'Strong', color: '#10b981' },
  ];
  return { score, ...map[score] };
}

/* ─── Shared input style ──────────────────────────────────────────── */
const inputStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '12px',
  padding: '13px 16px',
  color: '#f1f5f9',
  fontSize: '15px',
  outline: 'none',
  boxSizing: 'border-box',
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUser, setUserProfile, setDemoMode } = useAppStore();

  /* tabs: 'login' | 'signup' | 'forgot' | 'phone' */
  const [mode, setMode]             = useState('login');
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [displayName, setDisplayName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPass, setShowPass]     = useState(false);
  const [phone, setPhone]           = useState('');
  const [otp, setOtp]               = useState('');
  const [otpSent, setOtpSent]       = useState(false);
  const [confirmResult, setConfirmResult] = useState(null);
  const [error, setError]           = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading]       = useState(false);

  const pwStrength = mode === 'signup' ? getPasswordStrength(password) : null;

  /* ── FIX-09: Restore demo session across refresh ─────────────────── */
  useEffect(() => {
    const stored = sessionStorage.getItem('lynk_demo_mode');
    if (stored === '1') {
      setDemoMode(true);
      setUser(DEMO_USER);
      setUserProfile(DEMO_PROFILE);
      navigate('/feed', { replace: true });
    }
  }, []);

  /* ── FIX-04: apply Firebase persistence based on Remember Me ────── */
  async function applyPersistence() {
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
    } catch { /* fallback silently */ }
  }

  /* ── Email / Password submit ─────────────────────────────────────── */
  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) return setError('Please fill in all fields.');
    if (mode === 'signup' && !displayName.trim()) return setError('Please enter your name.');
    setError(''); setSuccessMsg(''); setLoading(true);

    try {
      await applyPersistence();

      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/feed', { replace: true });
      } else {
        /* ── Signup ── */
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const chosenName = displayName.trim() || email.split('@')[0];
        await updateProfile(cred.user, { displayName: chosenName });

        /* ── FIX-08: Send email verification ── */
        try { await sendEmailVerification(cred.user); } catch {}

        /* ── Create Firestore profile ── */
        await setDoc(doc(db, 'users', cred.user.uid), {
          uid: cred.user.uid,
          displayName: chosenName,
          email: cred.user.email,
          photoURL: null,
          bio: '',
          postsCount: 0,
          followersCount: 0,
          followingCount: 0,
          following: [],
          followers: [],
          interests: [],
          isVerified: false,
          emailVerified: false,
          onboardingComplete: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }).catch(() => {});

        navigate('/verify-email', { replace: true });
      }
    } catch (err) {
      setError(err.message.replace('Firebase: ', '').replace(/ \(auth.*?\)\.?/, ''));
    } finally {
      setLoading(false);
    }
  }

  /* ── FIX-01: Google OAuth with graceful error handling ─────────── */
  async function handleGoogle() {
    setError(''); setLoading(true);
    try {
      await applyPersistence();
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        await signInWithRedirect(auth, provider);
        // redirect will reload the page; useAuth handles getRedirectResult
      } else {
        const result = await signInWithPopup(auth, provider);
        /* create profile if new user */
        if (result._tokenResponse?.isNewUser) {
          await setDoc(doc(db, 'users', result.user.uid), {
            uid: result.user.uid,
            displayName: result.user.displayName || '',
            email: result.user.email || '',
            photoURL: result.user.photoURL || null,
            bio: '', postsCount: 0, followersCount: 0, followingCount: 0,
            following: [], followers: [], interests: [],
            isVerified: false, onboardingComplete: false,
            createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
          }, { merge: true }).catch(() => {});
          navigate('/onboarding', { replace: true });
        } else {
          navigate('/feed', { replace: true });
        }
      }
    } catch (err) {
      /* ── FIX-01: graceful error — show friendly message ── */
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Google sign-in was cancelled. Try again.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Popup was blocked. Please allow popups for this site and try again.');
      } else if (err.code?.includes('unauthorized-domain')) {
        setError('Google login not yet configured for this domain. Use email or Demo Login.');
      } else {
        setError(err.message.replace('Firebase: ', '').replace(/ \(auth.*?\)\.?/, '') || 'Google login failed. Try email instead.');
      }
      setLoading(false);
    }
  }

  /* ── FIX-02: Apple Sign-In stub ─────────────────────────────────── */
  async function handleApple() {
    setError(''); setLoading(true);
    try {
      await applyPersistence();
      const provider = new OAuthProvider('apple.com');
      provider.addScope('email');
      provider.addScope('name');
      const result = await signInWithPopup(auth, provider);
      if (result._tokenResponse?.isNewUser) {
        navigate('/onboarding', { replace: true });
      } else {
        navigate('/feed', { replace: true });
      }
    } catch (err) {
      if (err.code?.includes('unauthorized-domain') || err.code === 'auth/operation-not-allowed') {
        setError('Apple login requires additional setup in Firebase Console. Use email or Google for now.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Apple sign-in was cancelled.');
      } else {
        setError('Apple login unavailable right now. Use email or Google instead.');
      }
      setLoading(false);
    }
  }

  /* ── FIX-03: Forgot password (inline, already implemented) ─────── */
  async function handleForgotPassword(e) {
    e.preventDefault();
    if (!email) return setError('Enter your email address first.');
    setError(''); setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMsg(`✅ Reset email sent to ${email}. Check your inbox (and spam folder).`);
      setMode('login');
    } catch (err) {
      setError(err.message.replace('Firebase: ', '').replace(/ \(auth.*?\)\.?/, ''));
    } finally {
      setLoading(false);
    }
  }

  /* ── FIX-05: Phone number OTP ───────────────────────────────────── */
  async function handleSendOtp() {
    if (!phone || phone.length < 10) return setError('Enter a valid phone number with country code (e.g. +1 555…)');
    setError(''); setLoading(true);
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
      }
      const result = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
      setConfirmResult(result);
      setOtpSent(true);
      setSuccessMsg('OTP sent! Check your messages.');
    } catch (err) {
      setError(err.message.replace('Firebase: ', '').replace(/ \(auth.*?\)\.?/, '') || 'Could not send OTP. Make sure phone auth is enabled in Firebase.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    if (!otp || !confirmResult) return setError('Enter the OTP code.');
    setError(''); setLoading(true);
    try {
      await confirmResult.confirm(otp);
      navigate('/feed', { replace: true });
    } catch (err) {
      setError('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  /* ── FIX-09: Demo login ─────────────────────────────────────────── */
  function handleDemoLogin() {
    sessionStorage.setItem('lynk_demo_mode', '1');
    setDemoMode(true);
    setUser(DEMO_USER);
    setUserProfile(DEMO_PROFILE);
    navigate('/feed', { replace: true });
  }

  /* ── Biometric stub ─────────────────────────────────────────────── */
  function handleBiometric() {
    setError('');
    if (window.PublicKeyCredential) {
      setError('Biometric login (Face ID / Touch ID) will be available in the native app. Use email or Google for now.');
    } else {
      setError('Biometric login is not supported on this browser.');
    }
  }

  /* ─── Shared styles ──────────────────────────────────────────────── */
  const s = {
    wrap: {
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '24px',
      background: 'linear-gradient(135deg,#0f0c29,#302b63,#24243e)',
    },
    card: {
      width: '100%', maxWidth: '400px',
      background: 'rgba(255,255,255,0.06)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: '24px', padding: '32px 24px',
    },
    tab: (active) => ({
      flex: 1, padding: '8px', borderRadius: '8px', border: 'none',
      background: active ? 'rgba(99,102,241,0.25)' : 'none',
      color: active ? '#a5b4fc' : '#64748b',
      fontWeight: active ? 700 : 500, fontSize: '13px', cursor: 'pointer',
    }),
    divider: { display: 'flex', alignItems: 'center', gap: '12px', margin: '16px 0' },
    socialBtn: {
      width: '100%', padding: '11px', borderRadius: '12px',
      border: '1px solid rgba(255,255,255,0.12)',
      background: 'rgba(255,255,255,0.06)', color: '#f1f5f9',
      fontSize: '14px', fontWeight: 600, cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
      marginBottom: '8px',
    },
  };

  return (
    <div style={s.wrap}>
      <div style={s.card}>

        {/* ── Brand ─────────────────────────────── */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '14px',
            margin: '0 auto 12px',
            background: 'linear-gradient(135deg,#6366f1,#ec4899)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px',
          }}>⚡</div>
          <h1 style={{
            fontSize: '24px', fontWeight: 800, margin: 0,
            background: 'linear-gradient(135deg,#6366f1,#ec4899)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>LynkApp</h1>
          <p style={{ color: '#94a3b8', marginTop: '4px', fontSize: '14px' }}>
            {mode === 'login'  ? 'Sign in to your account'  :
             mode === 'signup' ? 'Create your account'      :
             mode === 'forgot' ? 'Reset your password'      : 'Sign in with phone'}
          </p>
        </div>

        {/* ── Mode tabs (login / signup / phone) ─ */}
        {mode !== 'forgot' && (
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '4px', marginBottom: '20px', gap: '4px' }}>
            <button style={s.tab(mode === 'login')}  onClick={() => { setMode('login');  setError(''); setSuccessMsg(''); }}>Email Login</button>
            <button style={s.tab(mode === 'signup')} onClick={() => { setMode('signup'); setError(''); setSuccessMsg(''); }}>Sign Up</button>
            <button style={s.tab(mode === 'phone')}  onClick={() => { setMode('phone');  setError(''); setSuccessMsg(''); }}>📱 Phone</button>
          </div>
        )}

        {/* ── Success message ────────────────────── */}
        {successMsg && (
          <div style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 12, padding: '10px 14px', color: '#10b981', fontSize: 13, marginBottom: 16, textAlign: 'center' }}>
            {successMsg}
          </div>
        )}

        {/* ── Error message ──────────────────────── */}
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '10px 14px', color: '#ef4444', fontSize: 13, marginBottom: 16, textAlign: 'center' }}>
            ⚠️ {error}
          </div>
        )}

        {/* ════════════════════════════════════════
            EMAIL / PASSWORD FORMS
        ════════════════════════════════════════ */}
        {(mode === 'login' || mode === 'signup') && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {mode === 'signup' && (
              <input
                style={inputStyle} type="text" placeholder="Your full name"
                value={displayName} onChange={e => setDisplayName(e.target.value)}
                autoComplete="name" aria-label="Full name"
              />
            )}
            <input
              style={inputStyle} type="email" placeholder="Email address"
              value={email} onChange={e => setEmail(e.target.value)}
              autoComplete="email" aria-label="Email address"
            />
            <div style={{ position: 'relative' }}>
              <input
                style={{ ...inputStyle, paddingRight: '48px' }}
                type={showPass ? 'text' : 'password'} placeholder="Password"
                value={password} onChange={e => setPassword(e.target.value)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                aria-label="Password"
              />
              <button type="button" onClick={() => setShowPass(p => !p)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 16 }}
                aria-label={showPass ? 'Hide password' : 'Show password'}>
                {showPass ? '🙈' : '👁'}
              </button>
            </div>

            {/* ── FIX-07: Password strength bar (signup only) ── */}
            {mode === 'signup' && password && (
              <div>
                <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= pwStrength.score ? pwStrength.color : 'rgba(255,255,255,0.08)', transition: 'background 0.3s' }} />
                  ))}
                </div>
                <div style={{ fontSize: 11, color: pwStrength.color, textAlign: 'right' }}>{pwStrength.label}</div>
              </div>
            )}

            {/* ── FIX-04: Remember Me checkbox ── */}
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#94a3b8', fontSize: 13 }}>
              <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}
                style={{ accentColor: '#6366f1', width: 16, height: 16 }} />
              Remember me on this device
            </label>

            <button className="btn-primary" type="submit" disabled={loading}
              style={{ padding: '13px', borderRadius: 12, background: 'linear-gradient(135deg,#6366f1,#ec4899)', border: 'none', color: 'white', fontWeight: 700, fontSize: 15, cursor: loading ? 'default' : 'pointer' }}>
              {loading ? '⏳ Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>

            {mode === 'login' && (
              <button type="button" onClick={() => { setMode('forgot'); setError(''); setSuccessMsg(''); }}
                style={{ color: '#818cf8', fontSize: 13, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center' }}>
                Forgot your password?
              </button>
            )}
          </form>
        )}

        {/* ════════════════════════════════════════
            FORGOT PASSWORD FORM
        ════════════════════════════════════════ */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', marginBottom: 4 }}>
              Enter your email and we'll send you a reset link.
            </p>
            <input style={inputStyle} type="email" placeholder="Email address"
              value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
            <button className="btn-primary" type="submit" disabled={loading}
              style={{ padding: '13px', borderRadius: 12, background: 'linear-gradient(135deg,#6366f1,#ec4899)', border: 'none', color: 'white', fontWeight: 700, fontSize: 15, cursor: loading ? 'default' : 'pointer' }}>
              {loading ? 'Sending…' : 'Send Reset Email'}
            </button>
            <button type="button" onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
              style={{ color: '#818cf8', fontSize: 13, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center' }}>
              ← Back to Sign In
            </button>
            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <Link to="/account-recovery" style={{ color: '#64748b', fontSize: 12 }}>
                Need account recovery instead?
              </Link>
            </div>
          </form>
        )}

        {/* ════════════════════════════════════════
            PHONE / OTP FORM
        ════════════════════════════════════════ */}
        {mode === 'phone' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div id="recaptcha-container" />
            {!otpSent ? (
              <>
                <input style={inputStyle} type="tel" placeholder="+1 555 000 0000"
                  value={phone} onChange={e => setPhone(e.target.value)} autoComplete="tel" />
                <p style={{ color: '#64748b', fontSize: 12, textAlign: 'center' }}>
                  Enter your number with country code. Standard SMS rates may apply.
                </p>
                <button onClick={handleSendOtp} disabled={loading}
                  style={{ padding: '13px', borderRadius: 12, background: 'linear-gradient(135deg,#6366f1,#ec4899)', border: 'none', color: 'white', fontWeight: 700, fontSize: 15, cursor: loading ? 'default' : 'pointer' }}>
                  {loading ? 'Sending OTP…' : 'Send OTP'}
                </button>
              </>
            ) : (
              <>
                <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center' }}>
                  Enter the 6-digit code sent to {phone}
                </p>
                <input style={{ ...inputStyle, textAlign: 'center', letterSpacing: 8, fontSize: 22 }}
                  type="text" inputMode="numeric" maxLength={6} placeholder="––––––"
                  value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} />
                <button onClick={handleVerifyOtp} disabled={loading}
                  style={{ padding: '13px', borderRadius: 12, background: 'linear-gradient(135deg,#6366f1,#ec4899)', border: 'none', color: 'white', fontWeight: 700, fontSize: 15, cursor: loading ? 'default' : 'pointer' }}>
                  {loading ? 'Verifying…' : 'Verify OTP'}
                </button>
                <button type="button" onClick={() => { setOtpSent(false); setOtp(''); setError(''); }}
                  style={{ color: '#818cf8', fontSize: 13, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center' }}>
                  ← Change number
                </button>
              </>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════
            SOCIAL + DEMO BUTTONS (not on forgot)
        ════════════════════════════════════════ */}
        {mode !== 'forgot' && (
          <>
            <div style={s.divider}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
              <span style={{ color: '#64748b', fontSize: '12px' }}>OR</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
            </div>

            {/* ── FIX-01: Google ── */}
            <button onClick={handleGoogle} disabled={loading} style={s.socialBtn} aria-label="Continue with Google">
              <span>🌐</span> Continue with Google
            </button>

            {/* ── FIX-02: Apple ── */}
            <button onClick={handleApple} disabled={loading} style={{ ...s.socialBtn, marginBottom: '8px' }} aria-label="Continue with Apple">
              <span>🍎</span> Continue with Apple
            </button>

            {/* ── FIX-06: Biometric stub ── */}
            <button onClick={handleBiometric} disabled={loading}
              style={{ ...s.socialBtn, marginBottom: '12px', border: '1px dashed rgba(255,255,255,0.15)', color: '#64748b' }}
              aria-label="Sign in with Face ID or Touch ID">
              <span>🔒</span> Face ID / Touch ID
            </button>

            {/* ── Demo Login ── */}
            <button onClick={handleDemoLogin} disabled={loading}
              style={{ width: '100%', padding: '12px', borderRadius: '12px',
                border: '1px dashed rgba(99,102,241,0.5)', background: 'rgba(99,102,241,0.08)',
                color: '#a5b4fc', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span>🚀</span> Demo Login (No account needed)
            </button>
          </>
        )}
      </div>

      {/* ── Footer links ─────────────────────────── */}
      <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#475569' }}>
        <Link to="/account-recovery" style={{ color: '#475569', marginRight: 16 }}>Account Recovery</Link>
        <span style={{ color: '#1e293b' }}>|</span>
        <a href="#privacy" style={{ color: '#475569', marginLeft: 16 }}>Privacy Policy</a>
      </div>
    </div>
  );
}
