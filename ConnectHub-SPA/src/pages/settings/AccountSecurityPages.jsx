// src/pages/settings/AccountSecurityPages.jsx — Password + Email change pages
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, updatePassword, updateEmail, EmailAuthProvider, reauthenticateWithCredential, sendEmailVerification } from 'firebase/auth';

const S = {
  page: { minHeight:'100dvh', background:'#0a0a18', paddingBottom:80 },
  header: { background:'rgba(255,255,255,0.03)', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'16px 20px', display:'flex', alignItems:'center', gap:12 },
  back: { background:'none', border:'none', color:'#94a3b8', fontSize:20, cursor:'pointer', padding:4 },
  title: { color:'#f1f5f9', fontSize:18, fontWeight:800 },
  body: { maxWidth:480, margin:'0 auto', padding:'28px 20px' },
  label: { color:'#94a3b8', fontSize:13, fontWeight:600, marginBottom:6, display:'block' },
  input: { width:'100%', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:'12px 16px', color:'#f1f5f9', fontSize:15, outline:'none', boxSizing:'border-box', marginBottom:16 },
  btn: { width:'100%', background:'linear-gradient(135deg,#6366f1,#ec4899)', border:'none', borderRadius:14, padding:'14px', color:'white', fontSize:16, fontWeight:700, cursor:'pointer', marginTop:4 },
  err: { color:'#ef4444', fontSize:13, background:'rgba(239,68,68,0.1)', borderRadius:8, padding:'8px 12px', marginBottom:12 },
  ok: { color:'#10b981', fontSize:13, background:'rgba(16,185,129,0.1)', borderRadius:8, padding:'8px 12px', marginBottom:12 },
  note: { color:'#64748b', fontSize:12, marginTop:8, lineHeight:1.5 },
};

export function ChangePasswordPage() {
  const navigate = useNavigate();
  const [f, setF] = useState({ current:'', newPw:'', confirm:'' });
  const [status, setStatus] = useState({ err:'', ok:'' });
  const [loading, setLoading] = useState(false);
  const ch = e => setF(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setStatus({ err:'', ok:'' });
    if (f.newPw.length < 8) return setStatus({ err:'New password must be at least 8 characters', ok:'' });
    if (f.newPw !== f.confirm) return setStatus({ err:'Passwords do not match', ok:'' });
    setLoading(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const cred = EmailAuthProvider.credential(user.email, f.current);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, f.newPw);
      setStatus({ err:'', ok:'✅ Password updated successfully!' });
      setF({ current:'', newPw:'', confirm:'' });
    } catch (err) {
      const msg = err.code === 'auth/wrong-password' ? 'Current password is incorrect.' : err.message;
      setStatus({ err: msg, ok:'' });
    } finally { setLoading(false); }
  };

  return (
    <div style={S.page}>
      <div style={S.header}>
        <button style={S.back} onClick={() => navigate(-1)}>←</button>
        <div style={S.title}>Change Password</div>
      </div>
      <div style={S.body}>
        {status.err && <div style={S.err}>{status.err}</div>}
        {status.ok && <div style={S.ok}>{status.ok}</div>}
        <form onSubmit={submit}>
          <label style={S.label}>Current Password</label>
          <input style={S.input} name="current" type="password" value={f.current} onChange={ch} placeholder="Your current password" required autoComplete="current-password" />
          <label style={S.label}>New Password</label>
          <input style={S.input} name="newPw" type="password" value={f.newPw} onChange={ch} placeholder="At least 8 characters" required autoComplete="new-password" />
          <label style={S.label}>Confirm New Password</label>
          <input style={S.input} name="confirm" type="password" value={f.confirm} onChange={ch} placeholder="Repeat new password" required autoComplete="new-password" />
          <div style={S.note}>Use a strong password with letters, numbers, and symbols. Never reuse passwords from other sites.</div>
          <button style={{ ...S.btn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
            {loading ? 'Updating…' : '🔐 Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

export function ChangeEmailPage() {
  const navigate = useNavigate();
  const [f, setF] = useState({ newEmail:'', password:'' });
  const [status, setStatus] = useState({ err:'', ok:'' });
  const [loading, setLoading] = useState(false);
  const ch = e => setF(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setStatus({ err:'', ok:'' });
    if (!f.newEmail.includes('@')) return setStatus({ err:'Please enter a valid email address', ok:'' });
    setLoading(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const cred = EmailAuthProvider.credential(user.email, f.password);
      await reauthenticateWithCredential(user, cred);
      await updateEmail(user, f.newEmail.trim());
      await sendEmailVerification(user);
      setStatus({ err:'', ok:'✅ Email updated! Check your new inbox to verify.' });
      setF({ newEmail:'', password:'' });
    } catch (err) {
      const msgs = {
        'auth/wrong-password': 'Password is incorrect.',
        'auth/email-already-in-use': 'This email is already in use.',
        'auth/invalid-email': 'Please enter a valid email address.',
      };
      setStatus({ err: msgs[err.code] || err.message, ok:'' });
    } finally { setLoading(false); }
  };

  return (
    <div style={S.page}>
      <div style={S.header}>
        <button style={S.back} onClick={() => navigate(-1)}>←</button>
        <div style={S.title}>Change Email</div>
      </div>
      <div style={S.body}>
        {status.err && <div style={S.err}>{status.err}</div>}
        {status.ok && <div style={S.ok}>{status.ok}</div>}
        <form onSubmit={submit}>
          <label style={S.label}>New Email Address</label>
          <input style={S.input} name="newEmail" type="email" value={f.newEmail} onChange={ch} placeholder="your-new@email.com" required autoComplete="email" />
          <label style={S.label}>Current Password (to confirm)</label>
          <input style={S.input} name="password" type="password" value={f.password} onChange={ch} placeholder="Your password" required autoComplete="current-password" />
          <div style={S.note}>A verification email will be sent to your new address. Your email won't change until you verify it.</div>
          <button style={{ ...S.btn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
            {loading ? 'Updating…' : '📧 Update Email'}
          </button>
        </form>
      </div>
    </div>
  );
}
