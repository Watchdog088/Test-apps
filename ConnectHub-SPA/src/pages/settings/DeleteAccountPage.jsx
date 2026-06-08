/**
 * DeleteAccountPage — GDPR-required account deletion flow
 * Route: /settings/delete-account
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebase/config';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

const S = {
  page: { minHeight:'100vh', background:'#0a0a0a', color:'#fff', fontFamily:'system-ui,sans-serif', paddingBottom:80 },
  header: { display:'flex', alignItems:'center', gap:12, padding:'16px 20px', borderBottom:'1px solid #1e1e1e', position:'sticky', top:0, background:'#0a0a0a', zIndex:10 },
  backBtn: { background:'none', border:'none', color:'#8b5cf6', fontSize:22, cursor:'pointer' },
  title: { flex:1, margin:0, fontSize:20, fontWeight:700 },
  card: { background:'#111', borderRadius:16, padding:20, margin:'0 16px 16px', border:'1px solid #1e1e1e' },
  warnCard: { background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:16, padding:20, margin:'16px 16px 8px' },
  warnTitle: { color:'#ef4444', fontWeight:700, fontSize:16, marginTop:0, marginBottom:8 },
  warnList: { color:'#fca5a5', fontSize:14, lineHeight:1.8, paddingLeft:20 },
  label: { fontSize:13, color:'#666', marginBottom:6, fontWeight:500 },
  input: { width:'100%', background:'#1a1a2e', border:'1px solid #2a2a3e', borderRadius:12, padding:'12px 16px', color:'#fff', fontSize:14, outline:'none', boxSizing:'border-box' },
  dangerBtn: { background:'linear-gradient(135deg,#dc2626,#ef4444)', border:'none', color:'#fff', padding:'14px 24px', borderRadius:24, fontSize:15, cursor:'pointer', fontWeight:700, width:'100%', marginTop:8 },
  outlineBtn: { background:'transparent', border:'1px solid #333', color:'#aaa', padding:'12px 24px', borderRadius:24, fontSize:14, cursor:'pointer', fontWeight:600, width:'100%' },
  step: (active) => ({ background: active ? 'rgba(239,68,68,0.1)' : '#111', border:`1px solid ${active ? 'rgba(239,68,68,0.3)' : '#1e1e1e'}`, borderRadius:16, padding:20, margin:'0 16px 12px' }),
  stepNum: { background:'#ef4444', color:'#fff', width:28, height:28, borderRadius:'50%', display:'inline-flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:13, marginBottom:10 },
  stepTitle: { fontSize:15, fontWeight:700, margin:'0 0 6px' },
  stepDesc: { fontSize:13, color:'#888', margin:0 },
};

const CONSEQUENCES = [
  'Your profile, posts, and stories will be permanently deleted',
  'All messages and conversations will be lost',
  'Any marketplace orders in progress may be disrupted',
  'Your wallet balance will be forfeited if not withdrawn',
  'Live stream history and clips will be removed',
  'This action cannot be undone',
];

export default function DeleteAccountPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1); // 1=confirm, 2=reason, 3=password, 4=done
  const [reason, setReason] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const REASONS = [
    'I no longer use this app',
    'Privacy concerns',
    'Found a better alternative',
    'Too many notifications',
    'Account was hacked',
    'Other',
  ];

  const handleDeleteRequest = async () => {
    if (confirm !== 'DELETE') {
      setError('Please type DELETE to confirm');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const auth = getAuth();
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(auth.currentUser, credential);
      // Mark account for deletion in Firestore (soft delete for 30 days)
      await updateDoc(doc(db, 'users', user.uid), {
        deletionRequested: true,
        deletionRequestedAt: serverTimestamp(),
        deletionReason: reason,
        status: 'pending_deletion',
      });
      setStep(4);
    } catch (e) {
      setError(e.code === 'auth/wrong-password' ? 'Incorrect password' : e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      <div style={S.header}>
        <button onClick={() => navigate(-1)} style={S.backBtn}>←</button>
        <h1 style={S.title}>🗑️ Delete Account</h1>
      </div>

      {step === 4 ? (
        // Success / Scheduled deletion
        <div style={{ padding:32, textAlign:'center' }}>
          <div style={{ fontSize:64, marginBottom:16 }}>✅</div>
          <h2 style={{ fontSize:22, fontWeight:800, marginBottom:12 }}>Deletion Scheduled</h2>
          <p style={{ color:'#94a3b8', fontSize:14, lineHeight:1.6, maxWidth:300, margin:'0 auto 24px' }}>
            Your account will be permanently deleted in <strong style={{ color:'#fff' }}>30 days</strong>.
            You can cancel this by logging back in.
          </p>
          <button onClick={() => navigate('/feed')} style={{ ...S.outlineBtn, maxWidth:240, margin:'0 auto' }}>
            Return to App
          </button>
        </div>
      ) : (
        <>
          {/* Warning */}
          <div style={S.warnCard}>
            <p style={S.warnTitle}>⚠️ This is permanent and irreversible</p>
            <ul style={S.warnList}>
              {CONSEQUENCES.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </div>

          {/* Step 1 — Confirm intent */}
          <div style={S.step(step === 1)}>
            <div style={S.stepNum}>1</div>
            <p style={S.stepTitle}>Confirm you want to delete</p>
            {step === 1 ? (
              <>
                <p style={{ color:'#aaa', fontSize:13, marginBottom:16 }}>
                  Before we proceed, have you considered these alternatives?
                </p>
                <button onClick={() => navigate('/settings/privacy')} style={{ ...S.outlineBtn, marginBottom:8 }}>
                  🔒 Adjust Privacy Settings Instead
                </button>
                <button onClick={() => navigate('/settings/notifications')} style={{ ...S.outlineBtn, marginBottom:16 }}>
                  🔕 Reduce Notifications Instead
                </button>
                <button onClick={() => setStep(2)} style={S.dangerBtn}>
                  I Still Want to Delete My Account
                </button>
              </>
            ) : (
              <p style={S.stepDesc}>Completed ✓</p>
            )}
          </div>

          {/* Step 2 — Reason */}
          {step >= 2 && (
            <div style={S.step(step === 2)}>
              <div style={S.stepNum}>2</div>
              <p style={S.stepTitle}>Why are you leaving?</p>
              {step === 2 ? (
                <>
                  <p style={{ color:'#aaa', fontSize:13, marginBottom:12 }}>Your feedback helps us improve.</p>
                  {REASONS.map(r => (
                    <button key={r} onClick={() => setReason(r)} style={{
                      ...S.outlineBtn, marginBottom:8, textAlign:'left',
                      background: reason === r ? 'rgba(139,92,246,0.15)' : 'transparent',
                      borderColor: reason === r ? '#8b5cf6' : '#333',
                      color: reason === r ? '#c4b5fd' : '#aaa',
                    }}>
                      {reason === r ? '● ' : '○ '}{r}
                    </button>
                  ))}
                  <button onClick={() => reason && setStep(3)} style={{ ...S.dangerBtn, opacity: reason ? 1 : 0.5 }}>
                    Continue
                  </button>
                </>
              ) : <p style={S.stepDesc}>Reason: {reason} ✓</p>}
            </div>
          )}

          {/* Step 3 — Final confirmation */}
          {step >= 3 && (
            <div style={S.step(step === 3)}>
              <div style={S.stepNum}>3</div>
              <p style={S.stepTitle}>Final confirmation</p>
              {step === 3 ? (
                <>
                  <p style={{ ...S.label, marginTop:8 }}>Type <strong style={{ color:'#ef4444' }}>DELETE</strong> to confirm</p>
                  <input
                    value={confirm}
                    onChange={e => setConfirm(e.target.value.toUpperCase())}
                    placeholder="Type DELETE here"
                    style={{ ...S.input, marginBottom:16, borderColor: confirm === 'DELETE' ? '#ef4444' : '#2a2a3e' }}
                  />
                  <p style={S.label}>Enter your password to verify identity</p>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Your password"
                    style={{ ...S.input, marginBottom:16 }}
                  />
                  {error && <p style={{ color:'#ef4444', fontSize:13, marginBottom:12 }}>{error}</p>}
                  <button
                    onClick={handleDeleteRequest}
                    disabled={loading || confirm !== 'DELETE' || !password}
                    style={{ ...S.dangerBtn, opacity: (confirm === 'DELETE' && password && !loading) ? 1 : 0.5 }}
                  >
                    {loading ? 'Processing…' : '🗑️ Permanently Delete My Account'}
                  </button>
                </>
              ) : null}
            </div>
          )}
        </>
      )}
    </div>
  );
}
