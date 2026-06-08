/**
 * ReportPage — unified content/user reporting flow
 * Route: /report/:type/:id
 * type = 'post' | 'user' | 'comment' | 'message' | 'story' | 'listing'
 */
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';

const REPORT_REASONS = {
  post:    ['Spam or misleading','Nudity or sexual content','Hate speech or symbols','Violence or dangerous content','Harassment or bullying','Misinformation','Intellectual property violation','Other'],
  user:    ['Fake or impersonation account','Spam','Harassment or bullying','Hate speech','Underage user','Other'],
  comment: ['Spam','Hate speech','Harassment','Threatening language','Other'],
  story:   ['Spam','Nudity','Violence','Misinformation','Other'],
  listing: ['Counterfeit goods','Prohibited items','Fraud or scam','Wrong description','Other'],
  message: ['Spam','Harassment','Threats','Unwanted contact','Other'],
};

const TYPE_LABELS = {
  post:'Post', user:'User', comment:'Comment', story:'Story', listing:'Listing', message:'Message'
};

const S = {
  page: { minHeight:'100vh', background:'#0a0a0a', color:'#fff', fontFamily:'system-ui,sans-serif', paddingBottom:80 },
  header: { display:'flex', alignItems:'center', gap:12, padding:'16px 20px', borderBottom:'1px solid #1e1e1e', position:'sticky', top:0, background:'#0a0a0a', zIndex:10 },
  backBtn: { background:'none', border:'none', color:'#8b5cf6', fontSize:22, cursor:'pointer' },
  title: { flex:1, margin:0, fontSize:20, fontWeight:700 },
  section: { padding:'20px 16px 0' },
  sectionTitle: { fontSize:13, color:'#666', fontWeight:600, textTransform:'uppercase', letterSpacing:0.5, marginBottom:12 },
  reasonBtn: (sel) => ({
    display:'block', width:'100%', textAlign:'left', padding:'14px 16px', marginBottom:8,
    background: sel ? 'rgba(139,92,246,0.15)' : '#111',
    border:`1px solid ${sel ? '#8b5cf6' : '#1e1e1e'}`,
    color: sel ? '#c4b5fd' : '#fff', borderRadius:12, cursor:'pointer', fontSize:14, fontWeight: sel ? 700 : 400,
  }),
  textarea: { width:'100%', background:'#111', border:'1px solid #1e1e1e', borderRadius:12, padding:'12px 16px', color:'#fff', fontSize:14, outline:'none', resize:'vertical', minHeight:100, fontFamily:'inherit', boxSizing:'border-box' },
  submitBtn: { background:'linear-gradient(135deg,#7c3aed,#8b5cf6)', border:'none', color:'#fff', padding:'14px 24px', borderRadius:24, fontSize:15, cursor:'pointer', fontWeight:700, width:'calc(100% - 32px)', margin:'16px 16px 0', display:'block' },
  successWrap: { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:48, textAlign:'center' },
};

export default function ReportPage() {
  const { type = 'post', id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const reasons = REPORT_REASONS[type] || REPORT_REASONS.post;
  const typeLabel = TYPE_LABELS[type] || 'Content';

  const handleSubmit = async () => {
    if (!reason || !user) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'reports'), {
        reportedBy: user.uid,
        contentType: type,
        contentId: id,
        reason,
        details: details.trim() || null,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (e) {
      console.error('Report error:', e);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={S.page}>
        <div style={S.header}>
          <button onClick={() => navigate(-1)} style={S.backBtn}>←</button>
          <h1 style={S.title}>Report Submitted</h1>
        </div>
        <div style={S.successWrap}>
          <div style={{ fontSize:64, marginBottom:16 }}>✅</div>
          <h2 style={{ fontSize:22, fontWeight:800, marginBottom:12 }}>Thanks for the report</h2>
          <p style={{ color:'#94a3b8', fontSize:14, lineHeight:1.6, maxWidth:280, margin:'0 auto 24px' }}>
            Our moderation team will review this {typeLabel.toLowerCase()} within 24 hours.
            We take all reports seriously.
          </p>
          <button onClick={() => navigate(-2)} style={{ background:'linear-gradient(135deg,#7c3aed,#8b5cf6)', border:'none', color:'#fff', padding:'12px 32px', borderRadius:24, fontSize:14, fontWeight:700, cursor:'pointer' }}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <div style={S.header}>
        <button onClick={() => navigate(-1)} style={S.backBtn}>←</button>
        <h1 style={S.title}>🚩 Report {typeLabel}</h1>
      </div>

      <div style={S.section}>
        <p style={S.sectionTitle}>Why are you reporting this {typeLabel.toLowerCase()}?</p>
        {reasons.map(r => (
          <button key={r} style={S.reasonBtn(reason === r)} onClick={() => setReason(r)}>
            {r}
          </button>
        ))}
      </div>

      {reason && (
        <div style={{ ...S.section, marginTop:20 }}>
          <p style={S.sectionTitle}>Additional details (optional)</p>
          <textarea
            value={details}
            onChange={e => setDetails(e.target.value)}
            placeholder="Add more context to help our team understand the issue…"
            style={S.textarea}
          />
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!reason || loading}
        style={{ ...S.submitBtn, opacity: reason && !loading ? 1 : 0.5 }}
      >
        {loading ? 'Submitting…' : '🚩 Submit Report'}
      </button>

      <p style={{ textAlign:'center', color:'#555', fontSize:12, marginTop:12, padding:'0 32px' }}>
        False reports may result in action against your account. Reports are anonymous.
      </p>
    </div>
  );
}
