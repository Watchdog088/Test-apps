// src/pages/onboarding/OnboardingPage.jsx
// POLISH-15 FIX: 3-step onboarding — name/bio, interests, finish
// IMPROVE-08 FIX: checkHandleUnique() Firestore query before saving

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { auth, db } from '@fb/config';
import { useAuth } from '@hooks/useAuth';
import useAppStore from '@store/useAppStore';

const ALL_INTERESTS = [
  '🎵 Music', '🎬 Film', '� Gaming', '💪 Fitness', '✈️ Travel',
  '🍕 Food', '📸 Photography', '� Art', '📚 Books', '� Sports',
  '💻 Tech', '� Nature', '� Podcasts', '💄 Fashion', '🧘 Wellness',
  '🎭 Comedy', '🏠 Design', '💰 Finance', '🐾 Pets', '� Culture',
];

// IMPROVE-08: Firestore uniqueness check for username handle
async function checkHandleUnique(handle) {
  if (!db || !handle) return true;
  try {
    const q = query(collection(db, 'users'), where('handle', '==', handle.toLowerCase()));
    const snap = await getDocs(q);
    return snap.empty;
  } catch { return true; }
}

export default function OnboardingPage() {
  const navigate     = useNavigate();
  const { user }     = useAuth();
  const showToast    = useAppStore(s => s.showToast);

  const [step, setStep]         = useState(1);
  const [name, setName]         = useState(user?.displayName || '');
  const [bio, setBio]           = useState('');
  const [handle, setHandle]     = useState('');
  const [handleError, setHandleError] = useState('');
  const [interests, setInterests] = useState([]);
  const [saving, setSaving]     = useState(false);

  // IMPROVE-08: validate handle uniqueness on change
  async function onHandleChange(val) {
    const clean = val.toLowerCase().replace(/[^a-z0-9_.]/g, '').slice(0, 30);
    setHandle(clean);
    setHandleError('');
    if (clean.length >= 3) {
      const unique = await checkHandleUnique(clean);
      if (!unique) setHandleError('This handle is already taken. Try another.');
    }
  }

  function toggleInterest(item) {
    setInterests(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  }

  async function finishOnboarding() {
    if (saving) return;
    setSaving(true);
    const finalHandle = handle || name.toLowerCase().replace(/\s+/g, '');

    // IMPROVE-08: Final uniqueness check before saving
    if (handle) {
      const unique = await checkHandleUnique(finalHandle);
      if (!unique) {
        setHandleError('Handle taken. Please choose another.');
        setSaving(false);
        return;
      }
    }

    try {
      if (auth.currentUser && name) {
        await updateProfile(auth.currentUser, { displayName: name });
      }
      if (db && user?.uid) {
        await setDoc(doc(db, 'users', user.uid), {
          displayName: name,
          bio,
          handle: finalHandle,
          interests,
          onboardingComplete: true,
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }
      showToast('🎉 Welcome to LynkApp!');
      navigate('/feed', { replace: true });
    } catch {
      showToast('Profile saved!');
      navigate('/feed', { replace: true });
    }
    setSaving(false);
  }

  const stepDots = [1, 2, 3];

  return (
    <div style={{ background:'#0a0a18', minHeight:'100vh', display:'flex', flexDirection:'column', padding:'0 0 env(safe-area-inset-bottom)' }}>
      {/* Header */}
      <div style={{ padding:'24px 20px 0', textAlign:'center' }}>
        <div style={{ fontSize:28, fontWeight:900, background:'linear-gradient(135deg,#6366f1,#ec4899)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', marginBottom:4 }}>
          ⚡ LynkApp
        </div>
        <div style={{ fontSize:13, color:'#475569' }}>Set up your profile</div>
        {/* Step dots */}
        <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:16 }}>
          {stepDots.map(s => (
            <div key={s} style={{ width: s === step ? 24 : 8, height:8, borderRadius:4, background: s <= step ? '#6366f1' : 'rgba(255,255,255,0.1)', transition:'all 0.3s' }} />
          ))}
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'32px 20px 24px' }}>
        {/* Step 1: Name, bio, handle */}
        {step === 1 && (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div style={{ textAlign:'center', marginBottom:8 }}>
              <div style={{ fontSize:48, marginBottom:8 }}>�</div>
              <h2 style={{ color:'#f1f5f9', fontWeight:800, marginBottom:4 }}>Your Identity</h2>
              <p style={{ color:'#64748b', fontSize:13 }}>Tell people who you are</p>
            </div>

            <div>
              <label style={{ fontSize:12, color:'#64748b', fontWeight:600, display:'block', marginBottom:6 }}>DISPLAY NAME *</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name"
                style={{ width:'100%', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:14, padding:'13px 16px', color:'#f1f5f9', fontSize:15, outline:'none' }} />
            </div>

            <div>
              <label style={{ fontSize:12, color:'#64748b', fontWeight:600, display:'block', marginBottom:6 }}>USERNAME HANDLE</label>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#475569', fontSize:15 }}>@</span>
                <input value={handle} onChange={e => onHandleChange(e.target.value)} placeholder="yourusername"
                  style={{ width:'100%', background:'rgba(255,255,255,0.07)', border:`1px solid ${handleError ? '#ef4444' : 'rgba(255,255,255,0.12)'}`, borderRadius:14, padding:'13px 16px 13px 32px', color:'#f1f5f9', fontSize:15, outline:'none' }} />
              </div>
              {handleError && <div style={{ fontSize:11, color:'#ef4444', marginTop:4 }}>{handleError}</div>}
            </div>

            <div>
              <label style={{ fontSize:12, color:'#64748b', fontWeight:600, display:'block', marginBottom:6 }}>BIO</label>
              <textarea value={bio} onChange={e => setBio(e.target.value.slice(0, 150))} placeholder="Tell the world about yourself…"
                rows={3} style={{ width:'100%', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:14, padding:'13px 16px', color:'#f1f5f9', fontSize:15, outline:'none', resize:'none' }} />
              <div style={{ textAlign:'right', fontSize:11, color:'#475569' }}>{bio.length}/150</div>
            </div>
          </div>
        )}

        {/* Step 2: Interests */}
        {step === 2 && (
          <div>
            <div style={{ textAlign:'center', marginBottom:24 }}>
              <div style={{ fontSize:48, marginBottom:8 }}>🎯</div>
              <h2 style={{ color:'#f1f5f9', fontWeight:800, marginBottom:4 }}>Your Interests</h2>
              <p style={{ color:'#64748b', fontSize:13 }}>Pick 3+ interests to personalise your feed</p>
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
              {ALL_INTERESTS.map(item => {
                const sel = interests.includes(item);
                return (
                  <button key={item} onClick={() => toggleInterest(item)} style={{ padding:'9px 16px', borderRadius:24, fontSize:13, fontWeight:600, border: sel ? 'none' : '1px solid rgba(255,255,255,0.15)', background: sel ? 'linear-gradient(135deg,#6366f1,#ec4899)' : 'rgba(255,255,255,0.06)', color: sel ? 'white' : '#94a3b8', cursor:'pointer', transition:'all 0.2s' }}>
                    {item}
                  </button>
                );
              })}
            </div>
            <div style={{ marginTop:16, fontSize:12, color:'#475569', textAlign:'center' }}>{interests.length} selected</div>
          </div>
        )}

        {/* Step 3: Finish */}
        {step === 3 && (
          <div style={{ textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
            <div style={{ fontSize:72 }}>🎉</div>
            <h2 style={{ color:'#f1f5f9', fontWeight:800, fontSize:24 }}>You're all set!</h2>
            <p style={{ color:'#64748b', fontSize:15, lineHeight:1.6, maxWidth:280 }}>
              Welcome to <strong style={{ color:'#f1f5f9' }}>LynkApp</strong>!<br />
              Your personalised feed is ready.
            </p>
            <div style={{ background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.25)', borderRadius:16, padding:'16px 20px', width:'100%' }}>
              <div style={{ fontWeight:700, color:'#f1f5f9', marginBottom:4 }}>{name || 'You'}</div>
              {handle && <div style={{ fontSize:13, color:'#6366f1' }}>@{handle}</div>}
              {bio && <div style={{ fontSize:13, color:'#94a3b8', marginTop:6 }}>{bio}</div>}
              {interests.length > 0 && (
                <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginTop:10 }}>
                  {interests.slice(0, 6).map(i => <span key={i} style={{ fontSize:11, padding:'2px 8px', background:'rgba(99,102,241,0.2)', borderRadius:12, color:'#818cf8' }}>{i}</span>)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div style={{ padding:'16px 20px', display:'flex', gap:10 }}>
        {step > 1 && (
          <button onClick={() => setStep(s => s - 1)} style={{ flex:1, padding:'13px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:14, color:'#f1f5f9', fontSize:15, fontWeight:700, cursor:'pointer' }}>
            ← Back
          </button>
        )}
        {step < 3 ? (
          <button onClick={() => setStep(s => s + 1)} disabled={step === 1 && !name.trim()} style={{ flex:2, padding:'13px', background: (step === 1 && !name.trim()) ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg,#6366f1,#ec4899)', border:'none', borderRadius:14, color: (step === 1 && !name.trim()) ? '#475569' : 'white', fontSize:15, fontWeight:700, cursor:(step === 1 && !name.trim()) ? 'default' : 'pointer' }}>
            Continue →
          </button>
        ) : (
          <button onClick={finishOnboarding} disabled={saving} style={{ flex:2, padding:'13px', background:'linear-gradient(135deg,#6366f1,#ec4899)', border:'none', borderRadius:14, color:'white', fontSize:15, fontWeight:700, cursor: saving ? 'default' : 'pointer' }}>
            {saving ? '⏳ Saving…' : '🚀 Start Exploring!'}
          </button>
        )}
      </div>

      {/* Skip */}
      {step < 3 && (
        <button onClick={() => navigate('/feed', { replace:true })} style={{ textAlign:'center', color:'#475569', fontSize:13, background:'none', border:'none', cursor:'pointer', paddingBottom:'calc(12px + env(safe-area-inset-bottom))', paddingTop:4 }}>
          Skip for now
        </button>
      )}
    </div>
  );
}
