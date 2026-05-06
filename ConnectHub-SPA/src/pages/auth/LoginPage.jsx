import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '@fb/config';
import useAppStore from '@store/useAppStore';

// Demo user — no Firebase required
const DEMO_USER = {
  uid: 'demo-user-001',
  email: 'demo@connecthub.app',
  displayName: 'Demo User',
  photoURL: null,
  emailVerified: true,
};
const DEMO_PROFILE = {
  uid: 'demo-user-001',
  displayName: 'Demo User',
  email: 'demo@connecthub.app',
  photoURL: null,
  bio: '👋 Exploring ConnectHub — demo account',
  postsCount: 12,
  followersCount: 348,
  followingCount: 215,
  isVerified: false,
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUser, setUserProfile, setDemoMode } = useAppStore();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) return setError('Please fill in all fields.');
    setError(''); setLoading(true);
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate('/feed', { replace: true });
    } catch (err) {
      setError(err.message.replace('Firebase: ', '').replace(/ \(auth.*\)./, ''));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(''); setLoading(true);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      navigate('/feed', { replace: true });
    } catch (err) {
      setError(err.message);
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
      minHeight:'100dvh',display:'flex',flexDirection:'column',alignItems:'center',
      justifyContent:'center',padding:'24px',
      background:'linear-gradient(135deg,#0f0c29,#302b63,#24243e)',
    }}>
      <div style={{
        width:'100%',maxWidth:'380px',background:'rgba(255,255,255,0.06)',
        backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.12)',
        borderRadius:'24px',padding:'32px 24px',
      }}>
        <div style={{textAlign:'center',marginBottom:'32px'}}>
          <div style={{
            width:'56px',height:'56px',borderRadius:'14px',margin:'0 auto 12px',
            background:'linear-gradient(135deg,#6366f1,#ec4899)',
            display:'flex',alignItems:'center',justifyContent:'center',fontSize:'24px',
          }}>⚡</div>
          <h1 style={{
            fontSize:'24px',fontWeight:800,
            background:'linear-gradient(135deg,#6366f1,#ec4899)',
            WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',
          }}>ConnectHub</h1>
          <p style={{color:'#94a3b8',marginTop:'4px',fontSize:'14px'}}>
            {mode==='login' ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'12px'}}>
          <input className="input" type="email" placeholder="Email address"
            value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" />
          <input className="input" type="password" placeholder="Password"
            value={password} onChange={e=>setPassword(e.target.value)} autoComplete={mode==='login'?'current-password':'new-password'} />
          {error && <p style={{color:'#ef4444',fontSize:'13px',textAlign:'center'}}>{error}</p>}
          <button className="btn-primary" type="submit" disabled={loading} style={{marginTop:'4px'}}>
            {loading ? 'Please wait…' : (mode==='login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div style={{display:'flex',alignItems:'center',gap:'12px',margin:'16px 0'}}>
          <div style={{flex:1,height:'1px',background:'rgba(255,255,255,0.1)'}}/>
          <span style={{color:'#64748b',fontSize:'12px'}}>OR</span>
          <div style={{flex:1,height:'1px',background:'rgba(255,255,255,0.1)'}}/>
        </div>

        <button className="btn-secondary" onClick={handleGoogle} disabled={loading}
          style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
          <span>🌐</span> Continue with Google
        </button>

        {/* ── Demo Login (testing only) ── */}
        <button onClick={handleDemoLogin} disabled={loading}
          style={{
            width:'100%',marginTop:'12px',padding:'12px',borderRadius:'12px',border:'1px dashed rgba(99,102,241,0.5)',
            background:'rgba(99,102,241,0.08)',color:'#a5b4fc',fontSize:'14px',fontWeight:600,cursor:'pointer',
            display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',
          }}>
          <span>🚀</span> Demo Login (No account needed)
        </button>

        <p style={{textAlign:'center',marginTop:'20px',fontSize:'14px',color:'#94a3b8'}}>
          {mode==='login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={()=>{setMode(mode==='login'?'signup':'login');setError('');}}
            style={{color:'#6366f1',fontWeight:600}}>
            {mode==='login' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}
