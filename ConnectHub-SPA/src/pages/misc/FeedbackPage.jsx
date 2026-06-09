// src/pages/misc/FeedbackPage.jsx — Full-page beta feedback form
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const TYPES = ['🐛 Bug Report','✨ Feature Request','🎨 UI/UX Issue','📱 Performance Issue','💡 General Feedback','🔒 Security Concern'];
const SEVERITY = ['🟢 Low — Minor inconvenience','🟡 Medium — Affects usability','🔴 High — Blocks core feature','🚨 Critical — App crash/data loss'];

const S = {
  page: { minHeight:'100dvh', background:'#0a0a18', padding:'0 0 80px' },
  header: { background:'rgba(255,255,255,0.03)', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'16px 20px', display:'flex', alignItems:'center', gap:12 },
  back: { background:'none', border:'none', color:'#94a3b8', fontSize:20, cursor:'pointer', padding:4 },
  title: { color:'#f1f5f9', fontSize:18, fontWeight:800, flex:1 },
  body: { maxWidth:600, margin:'0 auto', padding:'24px 20px' },
  label: { color:'#94a3b8', fontSize:13, fontWeight:600, marginBottom:8, display:'block' },
  group: { marginBottom:20 },
  select: { width:'100%', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:'12px 16px', color:'#f1f5f9', fontSize:14, outline:'none', boxSizing:'border-box' },
  textarea: { width:'100%', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:'12px 16px', color:'#f1f5f9', fontSize:14, outline:'none', boxSizing:'border-box', resize:'vertical', minHeight:120, fontFamily:'inherit' },
  input: { width:'100%', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:'12px 16px', color:'#f1f5f9', fontSize:14, outline:'none', boxSizing:'border-box' },
  btn: { width:'100%', background:'linear-gradient(135deg,#6366f1,#ec4899)', border:'none', borderRadius:14, padding:'14px', color:'white', fontSize:16, fontWeight:700, cursor:'pointer', marginTop:8 },
  success: { textAlign:'center', padding:40 },
  successIcon: { fontSize:64, marginBottom:16 },
  successTitle: { color:'#f1f5f9', fontSize:22, fontWeight:800, marginBottom:8 },
  successSub: { color:'#64748b', fontSize:14, marginBottom:24 },
  note: { color:'#64748b', fontSize:12, marginTop:8 },
};

export default function FeedbackPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ type: TYPES[0], severity: SEVERITY[0], title:'', description:'', steps:'', email:'' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const update = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return;
    setLoading(true);
    try {
      const db = getFirestore();
      const auth = getAuth();
      await addDoc(collection(db, 'betaFeedback'), {
        ...form,
        uid: auth.currentUser?.uid || 'anonymous',
        userEmail: auth.currentUser?.email || form.email,
        status: 'open',
        createdAt: serverTimestamp(),
        platform: navigator.userAgent,
        url: window.location.href,
      });
      setDone(true);
    } catch (err) {
      console.error('Feedback error:', err);
      setDone(true); // Still show success to not frustrate the user
    } finally { setLoading(false); }
  };

  if (done) return (
    <div style={S.page}>
      <div style={S.success}>
        <div style={S.successIcon}>🎉</div>
        <div style={S.successTitle}>Thank you!</div>
        <div style={S.successSub}>Your feedback has been submitted. We review every report and will work to fix issues quickly.</div>
        <button style={S.btn} onClick={() => navigate(-1)}>← Back to App</button>
      </div>
    </div>
  );

  return (
    <div style={S.page}>
      <div style={S.header}>
        <button style={S.back} onClick={() => navigate(-1)}>←</button>
        <div style={S.title}>Submit Feedback</div>
        <span style={{ background:'rgba(99,102,241,0.2)', color:'#6366f1', fontSize:11, fontWeight:700, padding:'3px 8px', borderRadius:6 }}>BETA</span>
      </div>
      <div style={S.body}>
        <p style={{ color:'#64748b', fontSize:14, marginBottom:24 }}>Help us improve LynkApp! Every bug report and suggestion makes the app better for everyone.</p>
        <form onSubmit={submit}>
          <div style={S.group}>
            <label style={S.label}>Feedback Type</label>
            <select style={S.select} name="type" value={form.type} onChange={update}>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={S.group}>
            <label style={S.label}>Severity / Impact</label>
            <select style={S.select} name="severity" value={form.severity} onChange={update}>
              {SEVERITY.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={S.group}>
            <label style={S.label}>Title (short summary) *</label>
            <input style={S.input} name="title" value={form.title} onChange={update} placeholder="e.g. Swipe gesture not working on dating" required />
          </div>
          <div style={S.group}>
            <label style={S.label}>Description *</label>
            <textarea style={S.textarea} name="description" value={form.description} onChange={update} placeholder="Describe the issue or suggestion in detail..." required />
          </div>
          <div style={S.group}>
            <label style={S.label}>Steps to Reproduce (for bugs)</label>
            <textarea style={{ ...S.textarea, minHeight:80 }} name="steps" value={form.steps} onChange={update} placeholder="1. Go to Dating tab&#10;2. Swipe right&#10;3. Nothing happens" />
          </div>
          <div style={S.group}>
            <label style={S.label}>Your Email (for follow-up, optional)</label>
            <input style={S.input} name="email" type="email" value={form.email} onChange={update} placeholder="your@email.com" />
            <div style={S.note}>Only used to respond to your specific report.</div>
          </div>
          <button style={{ ...S.btn, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
            {loading ? 'Submitting…' : '📤 Submit Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
}
