// src/pages/auth/SignupPage.jsx — LynkApp Sign-Up page
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from 'firebase/auth';

const S = {
  wrap: { minHeight:'100dvh', background:'linear-gradient(135deg,#0a0a18 0%,#1a0a2e 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' },
  card: { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:24, padding:'40px 32px', width:'100%', maxWidth:420 },
  logo: { textAlign:'center', marginBottom:32 },
  logoText: { fontSize:32, fontWeight:900, background:'linear-gradient(135deg,#6366f1,#ec4899)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' },
  title: { color:'#f1f5f9', fontSize:22, fontWeight:800, textAlign:'center', marginBottom:8 },
  sub: { color:'#64748b', fontSize:14, textAlign:'center', marginBottom:32 },
  label: { color:'#94a3b8', fontSize:13, fontWeight:600, marginBottom:6, display:'block' },
  input: { width:'100%', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:'12px 16px', color:'#f1f5f9', fontSize:15, outline:'none', boxSizing:'border-box', marginBottom:16 },
  btn: { width:'100%', background:'linear-gradient(135deg,#6366f1,#ec4899)', border:'none', borderRadius:14, padding:'14px', color:'white', fontSize:16, fontWeight:700, cursor:'pointer', marginTop:8 },
  err: { color:'#ef4444', fontSize:13, textAlign:'center', marginBottom:12, background:'rgba(239,68,68,0.1)', borderRadius:8, padding:'8px 12px' },
  row: { display:'flex', gap:12 },
  link: { color:'#6366f1', textDecoration:'none', fontWeight:600 },
  footer: { color:'#64748b', fontSize:13, textAlign:'center', marginTop:24 },
  divider: { display:'flex', alignItems:'center', gap:12, margin:'20px 0' },
  divLine: { flex:1, height:1, background:'rgba(255,255,255,0.08)' },
  divText: { color:'#64748b', fontSize:12 },
};

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', password:'', confirm:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!form.firstName.trim()) return setError('First name is required');
    if (!form.email.trim()) return setError('Email is required');
    if (form.password.length < 8) return setError('Password must be at least 8 characters');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    setLoading(true);
    try {
      const auth = getAuth();
      const { user } = await createUserWithEmailAndPassword(auth, form.email.trim(), form.password);
      await updateProfile(user, { displayName: `${form.firstName.trim()} ${form.lastName.trim()}`.trim() });
      await sendEmailVerification(user);
      navigate('/verify-email');
    } catch (err) {
      const msg = {
        'auth/email-already-in-use': 'An account with this email already exists. Try logging in.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/weak-password': 'Password is too weak. Use at least 8 characters.',
        'auth/network-request-failed': 'Network error. Please check your connection.',
      }[err.code] || err.message;
      setError(msg);
    } finally { setLoading(false); }
  };

  return (
    <div style={S.wrap}>
      <div style={S.card}>
        <div style={S.logo}>
          <div style={S.logoText}>LynkApp</div>
          <div style={{ color:'#6366f1', fontSize:12, marginTop:4, fontWeight:600 }}>BETA</div>
        </div>
        <div style={S.title}>Create your account</div>
        <div style={S.sub}>Join LynkApp — connect, share, and grow</div>
        {error && <div style={S.err}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={S.row}>
            <div style={{ flex:1 }}>
              <label style={S.label}>First Name</label>
              <input style={S.input} name="firstName" value={form.firstName} onChange={handleChange} placeholder="Alex" autoComplete="given-name" required />
            </div>
            <div style={{ flex:1 }}>
              <label style={S.label}>Last Name</label>
              <input style={S.input} name="lastName" value={form.lastName} onChange={handleChange} placeholder="Smith" autoComplete="family-name" />
            </div>
          </div>
          <label style={S.label}>Email Address</label>
          <input style={S.input} name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" autoComplete="email" required />
          <label style={S.label}>Password</label>
          <input style={S.input} name="password" type="password" value={form.password} onChange={handleChange} placeholder="At least 8 characters" autoComplete="new-password" required />
          <label style={S.label}>Confirm Password</label>
          <input style={S.input} name="confirm" type="password" value={form.confirm} onChange={handleChange} placeholder="Repeat your password" autoComplete="new-password" required />
          <button style={{ ...S.btn, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
            {loading ? 'Creating account…' : '🚀 Create Account'}
          </button>
        </form>
        <div style={S.divider}><div style={S.divLine}/><span style={S.divText}>Already have an account?</span><div style={S.divLine}/></div>
        <div style={{ textAlign:'center' }}>
          <Link to="/login" style={S.link}>Sign in to LynkApp</Link>
        </div>
        <div style={S.footer}>
          By creating an account you agree to our{' '}
          <Link to="/terms" style={S.link}>Terms</Link> and{' '}
          <Link to="/privacy" style={S.link}>Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
}
