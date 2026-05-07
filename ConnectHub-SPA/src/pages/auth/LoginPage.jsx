// src/pages/auth/LoginPage.jsx
// UX-10 FIX: Sets displayName via updateProfile after createUserWithEmailAndPassword
// POLISH-14 FIX: Brand is "LynkApp"
// UX-06 FIX: Forgot Password flow
// UX-07 FIX: Mobile uses signInWithRedirect, desktop uses signInWithPopup

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@fb/config';
import useAppStore from '@store/useAppStore';

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
  followersCount: 0,
  followingCount: 0,
  isVerified: false,
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUser, setUserProfile, setDemoMode } = useAppStore();
  const [mode, setMode]           = useState('login'); // 'login' | 'signup' | 'forgot'
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError]         = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading]     = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) return setError('Please fill in all fields.');
    if (mode === 'signup' && !displayName.trim()) return setError('Please enter your name.');
    setError(''); setSuccessMsg(''); setLoading(true);
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // UX-10 FIX: Set displayName on new account
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const chosenName = displayName.trim() || email.split('@')[0];
        await updateProfile(cred.user, { displayName: chosenName });
        // Create Firestore profile doc
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
          isVerified: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }).catch(() => {}); // non-blocking — profile page will create it too
        navigate('/onboarding', { replace: true });
        return;
      }
      navigate('/feed', { replace: true });
    } catch (err) {
      setError(err.message.replace('Firebase: ', '').replace(/ \(auth.*\)./, ''));
    } finally {
      setLoading(false);
    }
  }

  // UX-07 FIX: signInWithRedirect on mobile
  async function handleGoogle() {
    setError(''); setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      if (window.innerWidth < 768) {
        await signInWithRedirect(auth, provider);
      } else {
        await signInWithPopup(auth, provider);
        navigate('/feed', { replace: true });
      }
    } catch (err) {
      setError(err.message.replace('Firebase: ', '').replace(/ \(auth.*\)./, ''));
      setLoading(false);
    }
  }

  // UX-06 FIX: Forgot password
  async function handleForgotPassword(e) {
    e.preventDefault();
    if (!email) return setError('Enter your email address above first.');
    setError(''); setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMsg(`Password reset email sent to ${email}. Check your inbox.`);
      setMode('login');
    } catch (err) {
      setError(err.message.replace('Firebase: ', '').replace(/ \(auth.*\)./, ''));
    } finally {
      setLoading(false);
    }
  }

  function handleDemoLogin() {
    setDemoMode(true);
    setUser(DEMO_USER);
    setUserProfile(DEMO_PROFILE);
    navigate('/feed', { replace: true });
  }

  return (
    <div style={{
      minHeight:'100dvh', display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', padding:'24px',
      background:'linear-gradient(135deg,#0f0c29,#302b63,#24243e)',
    }}>
      <div style={{
        width:'100%', maxWidth:'380px', background:'rgba(255,255,255,0.06)',
        backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.12)',
        borderRadius:'24px', padding:'32px 24px',
      }}>
        {/* POLISH-14: LynkApp branding */}
        <div style={{ textAlign:'center', marginBottom:'32px' }}>
          <div style={{ width:'56px', height:'56px', borderRadius:'14px', margin:'0 auto 12px',
            background:'linear-gradient(135deg,#6366f1,#ec4899)',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px' }}>⚡</div>
          <h1 style={{ fontSize:'24px', fontWeight:800,
            background:'linear-gradient(135deg,#6366f1,#ec4899)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
            LynkApp
          </h1>
          <p style={{ color:'#94a3b8', marginTop:'4px', fontSize:'14px' }}>
            {mode==='login'  ? 'Sign in to your account' :
             mode==='signup' ? 'Create your account'     : 'Reset your password'}
          </p>
        </div>

        {successMsg && (
          <div style={{ background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.3)',
            borderRadius:12, padding:'10px 14px', color:'#10b981', fontSize:13, marginBottom:16, textAlign:'center' }}>
            ✅ {successMsg}
          </div>
        )}

        {mode !== 'forgot' ? (
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            {/* UX-10: Name field on signup */}
            {mode === 'signup' && (
              <input className="input" type="text" placeholder="Your name"
                value={displayName} onChange={e => setDisplayName(e.target.value)} autoComplete="name" />
            )}
            <input className="input" type="email" placeholder="Email address"
              value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
            <input className="input" type="password" placeholder="Password"
              value={password} onChange={e => setPassword(e.target.value)}
              autoComplete={mode==='login' ? 'current-password' : 'new-password'} />
            {error && <p style={{ color:'#ef4444', fontSize:'13px', textAlign:'center' }}>{error}</p>}
            <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop:'4px' }}>
              {loading ? 'Please wait…' : (mode==='login' ? 'Sign In' : 'Create Account')}
            </button>
            {mode === 'login' && (
              <button type="button" onClick={() => { setMode('forgot'); setError(''); }}
                style={{ color:'#818cf8', fontSize:13, fontWeight:600, background:'none', border:'none', cursor:'pointer', textAlign:'center' }}>
                Forgot your password?
              </button>
            )}
          </form>
        ) : (
          <form onSubmit={handleForgotPassword} style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            <p style={{ color:'#94a3b8', fontSize:13, textAlign:'center', marginBottom:4 }}>
              Enter your email and we'll send you a reset link.
            </p>
            <input className="input" type="email" placeholder="Email address"
              value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
            {error && <p style={{ color:'#ef4444', fontSize:'13px', textAlign:'center' }}>{error}</p>}
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'Sending…' : 'Send Reset Email'}
            </button>
            <button type="button" onClick={() => { setMode('login'); setError(''); }}
              style={{ color:'#818cf8', fontSize:13, fontWeight:600, background:'none', border:'none', cursor:'pointer', textAlign:'center' }}>
              ← Back to Sign In
            </button>
          </form>
        )}

        {mode !== 'forgot' && (
          <>
            <div style={{ display:'flex', alignItems:'center', gap:'12px', margin:'16px 0' }}>
              <div style={{ flex:1, height:'1px', background:'rgba(255,255,255,0.1)' }}/>
              <span style={{ color:'#64748b', fontSize:'12px' }}>OR</span>
              <div style={{ flex:1, height:'1px', background:'rgba(255,255,255,0.1)' }}/>
            </div>
            <button className="btn-secondary" onClick={handleGoogle} disabled={loading}
              style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
              <span>🌐</span> Continue with Google
            </button>
            <button onClick={handleDemoLogin} disabled={loading}
              style={{ width:'100%', marginTop:'12px', padding:'12px', borderRadius:'12px',
                border:'1px dashed rgba(99,102,241,0.5)', background:'rgba(99,102,241,0.08)',
                color:'#a5b4fc', fontSize:'14px', fontWeight:600, cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
              <span>🚀</span> Demo Login (No account needed)
            </button>
            <p style={{ textAlign:'center', marginTop:'20px', fontSize:'14px', color:'#94a3b8' }}>
              {mode==='login' ? "Don't have an account? " : 'Already have an account? '}
              <button onClick={() => { setMode(mode==='login'?'signup':'login'); setError(''); setSuccessMsg(''); setDisplayName(''); }}
                style={{ color:'#6366f1', fontWeight:600 }}>
                {mode==='login' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
