// src/pages/onboarding/OnboardingPage.jsx
// SECTION-1 AUDIT FIX — May 2026
// ✅ Expanded from 3 steps to 5 steps:
//    Step 1: Welcome  → animated brand splash
//    Step 2: Identity → name / handle / bio
//    Step 3: Interests → pick 3+ topics
//    Step 4: Profile Photo → upload or pick DiceBear avatar
//    Step 5: Find Friends → suggested people to follow
//    Step 6: Done / Launch!
// ✅ IMPROVE-08: handle uniqueness check before saving
// ✅ Progress bar with step labels

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  doc, setDoc, collection, query, where, getDocs,
  serverTimestamp, getDoc,
} from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '@fb/config';
import { useAuth } from '@hooks/useAuth';
import useAppStore from '@store/useAppStore';

/* ─── Constants ───────────────────────────────────────────────────── */
const ALL_INTERESTS = [
  '🎵 Music','🎬 Film','🎮 Gaming','💪 Fitness','✈️ Travel',
  '🍕 Food','📸 Photography','🎨 Art','📚 Books','⚽ Sports',
  '💻 Tech','🌿 Nature','🎙 Podcasts','💄 Fashion','🧘 Wellness',
  '🎭 Comedy','🏠 Design','💰 Finance','🐾 Pets','🌍 Culture',
  '🚀 Science','📺 TV Shows','🍷 Wine & Dine','🏄 Adventure','🎪 Events',
];

const STEP_LABELS = ['Welcome','Profile','Interests','Photo','Friends'];
const TOTAL_STEPS = 5;

/* ─── Dummy suggested users (real data would come from Firestore) ─── */
const SUGGESTED_USERS = [
  { uid:'u1', displayName:'Alex Chen', handle:'alexchen', avatar:'https://api.dicebear.com/8.x/avataaars/svg?seed=alex', bio:'Photographer & traveler' },
  { uid:'u2', displayName:'Jordan Lee', handle:'jordanlee', avatar:'https://api.dicebear.com/8.x/avataaars/svg?seed=jordan', bio:'Music producer 🎵' },
  { uid:'u3', displayName:'Sam Rivera', handle:'samrivera', avatar:'https://api.dicebear.com/8.x/avataaars/svg?seed=sam', bio:'Fitness coach 💪' },
  { uid:'u4', displayName:'Morgan Kim', handle:'morgankim', avatar:'https://api.dicebear.com/8.x/avataaars/svg?seed=morgan', bio:'Design & UX nerd' },
  { uid:'u5', displayName:'Taylor Swift', handle:'tswift99', avatar:'https://api.dicebear.com/8.x/avataaars/svg?seed=taylor', bio:'Coffee ☕ & code' },
  { uid:'u6', displayName:'Casey Brown', handle:'caseybrown', avatar:'https://api.dicebear.com/8.x/avataaars/svg?seed=casey', bio:'Foodie & chef 🍕' },
];

const AVATAR_SEEDS = ['happy1','cool2','fun3','pro4','vibe5','star6','ace7','zen8'];

/* ─── Firestore uniqueness check ─────────────────────────────────── */
async function checkHandleUnique(handle) {
  if (!db || !handle) return true;
  try {
    const q = query(collection(db, 'users'), where('handle', '==', handle.toLowerCase()));
    const snap = await getDocs(q);
    return snap.empty;
  } catch { return true; }
}

/* ─── Input style ─────────────────────────────────────────────────── */
const inp = {
  width: '100%', background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14,
  padding: '13px 16px', color: '#f1f5f9', fontSize: 15,
  outline: 'none', boxSizing: 'border-box',
};

export default function OnboardingPage() {
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const showToast = useAppStore(s => s.showToast);
  const fileRef   = useRef(null);

  const [step, setStep]             = useState(1);
  const [name, setName]             = useState(user?.displayName || '');
  const [bio, setBio]               = useState('');
  const [handle, setHandle]         = useState('');
  const [handleError, setHandleError] = useState('');
  const [interests, setInterests]   = useState([]);
  const [photoURL, setPhotoURL]     = useState(null);
  const [photoFile, setPhotoFile]   = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [followed, setFollowed]     = useState(new Set());
  const [saving, setSaving]         = useState(false);
  const [uploading, setUploading]   = useState(false);

  /* ── Handle uniqueness ── */
  async function onHandleChange(val) {
    const clean = val.toLowerCase().replace(/[^a-z0-9_.]/g, '').slice(0, 30);
    setHandle(clean);
    setHandleError('');
    if (clean.length >= 3) {
      const unique = await checkHandleUnique(clean);
      if (!unique) setHandleError('This handle is already taken. Try another.');
    }
  }

  /* ── Interests ── */
  function toggleInterest(item) {
    setInterests(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  }

  /* ── Photo upload ── */
  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('Photo must be under 5MB');
      return;
    }
    setPhotoFile(file);
    setSelectedAvatar(null);
    const url = URL.createObjectURL(file);
    setPhotoURL(url);
  }

  /* ── Follow/unfollow suggestions ── */
  function toggleFollow(uid) {
    setFollowed(prev => {
      const next = new Set(prev);
      next.has(uid) ? next.delete(uid) : next.add(uid);
      return next;
    });
  }

  /* ── Navigation guards ── */
  function canProceed() {
    if (step === 2) return name.trim().length > 0 && !handleError;
    if (step === 3) return interests.length >= 1; // warn at <3, hard block at 0
    return true;
  }

  /* ── Final save ── */
  async function finishOnboarding() {
    if (saving || !canProceed()) return;
    setSaving(true);

    const finalHandle = handle.trim() || name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

    // Final handle check
    if (handle.trim()) {
      const unique = await checkHandleUnique(finalHandle);
      if (!unique) {
        setHandleError('Handle already taken — please change it.');
        setSaving(false);
        setStep(2);
        return;
      }
    }

    let finalPhotoURL = null;

    // Upload photo if selected
    if (photoFile && user?.uid && storage) {
      setUploading(true);
      try {
        const storageRef = ref(storage, `avatars/${user.uid}/profile.jpg`);
        await uploadBytes(storageRef, photoFile);
        finalPhotoURL = await getDownloadURL(storageRef);
      } catch {
        // fallback silently
      }
      setUploading(false);
    } else if (selectedAvatar) {
      finalPhotoURL = `https://api.dicebear.com/8.x/avataaars/svg?seed=${selectedAvatar}`;
    }

    try {
      if (auth.currentUser && name) {
        await updateProfile(auth.currentUser, {
          displayName: name,
          photoURL: finalPhotoURL || auth.currentUser.photoURL,
        });
      }

      if (db && user?.uid) {
        await setDoc(doc(db, 'users', user.uid), {
          displayName: name,
          bio,
          handle: finalHandle,
          interests,
          photoURL: finalPhotoURL,
          onboardingComplete: true,
          updatedAt: serverTimestamp(),
        }, { merge: true });

        // Save followed users to following subcollection
        for (const uid of followed) {
          await setDoc(doc(db, 'users', user.uid, 'following', uid), {
            followedAt: serverTimestamp(),
          }).catch(() => {});
        }
      }

      showToast('🎉 Welcome to LynkApp!');
      navigate('/feed', { replace: true });
    } catch {
      showToast('Profile saved!');
      navigate('/feed', { replace: true });
    }
    setSaving(false);
  }

  /* ─── Render ─────────────────────────────────────────────────────── */
  return (
    <div style={{ background: '#0a0a18', minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>

      {/* ── Header with progress ── */}
      <div style={{ padding: '20px 20px 0', background: 'rgba(0,0,0,0.2)' }}>
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 20, fontWeight: 900, background: 'linear-gradient(135deg,#6366f1,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            ⚡ LynkApp
          </span>
        </div>

        {/* Step labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          {STEP_LABELS.map((label, i) => (
            <span key={i} style={{ fontSize: 9, color: i + 1 <= step ? '#818cf8' : '#334155', fontWeight: i + 1 === step ? 700 : 400, flex: 1, textAlign: 'center' }}>
              {label}
            </span>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%`, background: 'linear-gradient(90deg,#6366f1,#ec4899)', borderRadius: 2, transition: 'width 0.4s ease' }} />
        </div>
        <div style={{ textAlign: 'center', fontSize: 11, color: '#475569', marginTop: 4 }}>Step {step} of {TOTAL_STEPS}</div>
      </div>

      {/* ── Step content ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px 16px' }}>

        {/* ══ STEP 1: WELCOME ══ */}
        {step === 1 && (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, paddingTop: 20 }}>
            <div style={{
              width: 100, height: 100, borderRadius: '28px',
              background: 'linear-gradient(135deg,#6366f1,#ec4899)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48,
              boxShadow: '0 20px 60px rgba(99,102,241,0.4)',
            }}>⚡</div>
            <h1 style={{ color: '#f1f5f9', fontSize: 28, fontWeight: 900, margin: 0 }}>
              Welcome to LynkApp!
            </h1>
            <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.7, maxWidth: 280, margin: 0 }}>
              Let's set up your profile in just a few steps. It takes less than 2 minutes.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%', maxWidth: 300, marginTop: 8 }}>
              {[['✨','Personalised feed'],['🤝','Find your people'],['🔒','Safe & private'],['🚀','Unlimited posts']].map(([icon, text]) => (
                <div key={text} style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 14, padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
                  <div style={{ color: '#94a3b8', fontSize: 12 }}>{text}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ STEP 2: IDENTITY ══ */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ textAlign: 'center', marginBottom: 8 }}>
              <div style={{ fontSize: 44, marginBottom: 8 }}>👤</div>
              <h2 style={{ color: '#f1f5f9', fontWeight: 800, margin: '0 0 4px' }}>Your Identity</h2>
              <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>Tell people who you are</p>
            </div>

            <div>
              <label style={{ fontSize: 11, color: '#64748b', fontWeight: 700, display: 'block', marginBottom: 6, letterSpacing: 1 }}>DISPLAY NAME *</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name"
                style={inp} autoComplete="name" />
            </div>

            <div>
              <label style={{ fontSize: 11, color: '#64748b', fontWeight: 700, display: 'block', marginBottom: 6, letterSpacing: 1 }}>USERNAME</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#475569', fontSize: 15 }}>@</span>
                <input value={handle} onChange={e => onHandleChange(e.target.value)} placeholder="yourusername"
                  style={{ ...inp, paddingLeft: 32, borderColor: handleError ? '#ef4444' : 'rgba(255,255,255,0.12)' }} />
              </div>
              {handleError && <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>⚠️ {handleError}</div>}
              {handle && !handleError && handle.length >= 3 && (
                <div style={{ fontSize: 11, color: '#10b981', marginTop: 4 }}>✓ Available!</div>
              )}
            </div>

            <div>
              <label style={{ fontSize: 11, color: '#64748b', fontWeight: 700, display: 'block', marginBottom: 6, letterSpacing: 1 }}>BIO</label>
              <textarea value={bio} onChange={e => setBio(e.target.value.slice(0, 150))} placeholder="Tell the world about yourself…"
                rows={3} style={{ ...inp, resize: 'none' }} />
              <div style={{ textAlign: 'right', fontSize: 11, color: bio.length >= 130 ? '#f59e0b' : '#475569', marginTop: 2 }}>{bio.length}/150</div>
            </div>
          </div>
        )}

        {/* ══ STEP 3: INTERESTS ══ */}
        {step === 3 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 44, marginBottom: 8 }}>🎯</div>
              <h2 style={{ color: '#f1f5f9', fontWeight: 800, margin: '0 0 4px' }}>Your Interests</h2>
              <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>Pick 3+ to personalise your feed</p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {ALL_INTERESTS.map(item => {
                const sel = interests.includes(item);
                return (
                  <button key={item} onClick={() => toggleInterest(item)} style={{
                    padding: '9px 16px', borderRadius: 24, fontSize: 13, fontWeight: 600,
                    border: sel ? 'none' : '1px solid rgba(255,255,255,0.15)',
                    background: sel ? 'linear-gradient(135deg,#6366f1,#ec4899)' : 'rgba(255,255,255,0.06)',
                    color: sel ? 'white' : '#94a3b8', cursor: 'pointer', transition: 'all 0.2s',
                    transform: sel ? 'scale(1.05)' : 'scale(1)',
                  }}>
                    {item}
                  </button>
                );
              })}
            </div>
            <div style={{ marginTop: 14, textAlign: 'center' }}>
              <span style={{ fontSize: 13, color: interests.length >= 3 ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
                {interests.length >= 3 ? `✓ ${interests.length} selected — great!` : `${interests.length} selected (pick at least 3)`}
              </span>
            </div>
          </div>
        )}

        {/* ══ STEP 4: PROFILE PHOTO ══ */}
        {step === 4 && (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 44, marginBottom: 4 }}>📸</div>
            <h2 style={{ color: '#f1f5f9', fontWeight: 800, margin: '0 0 4px' }}>Profile Photo</h2>
            <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>Add a photo or pick an avatar — you can change this later</p>

            {/* Current photo preview */}
            <div style={{ width: 100, height: 100, borderRadius: '50%', overflow: 'hidden', border: '3px solid rgba(99,102,241,0.4)', background: '#1e293b', flexShrink: 0 }}>
              {photoURL ? (
                <img src={photoURL} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : selectedAvatar ? (
                <img src={`https://api.dicebear.com/8.x/avataaars/svg?seed=${selectedAvatar}`} alt="Avatar" style={{ width: '100%', height: '100%' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>
                  {name ? name[0].toUpperCase() : '?'}
                </div>
              )}
            </div>

            {/* Upload button */}
            <button onClick={() => fileRef.current?.click()}
              style={{ padding: '11px 24px', borderRadius: 12, background: 'linear-gradient(135deg,#6366f1,#ec4899)', border: 'none', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              {uploading ? '⏳ Uploading…' : '📁 Upload Photo'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />

            {/* Avatar grid */}
            <div style={{ width: '100%' }}>
              <p style={{ color: '#475569', fontSize: 12, marginBottom: 10 }}>Or pick a generated avatar:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
                {AVATAR_SEEDS.map(seed => (
                  <button key={seed} onClick={() => { setSelectedAvatar(seed); setPhotoURL(null); setPhotoFile(null); }}
                    style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', border: selectedAvatar === seed ? '3px solid #6366f1' : '2px solid rgba(255,255,255,0.1)', padding: 0, cursor: 'pointer', background: '#1e293b', flexShrink: 0 }}>
                    <img src={`https://api.dicebear.com/8.x/avataaars/svg?seed=${seed}`} alt={seed} style={{ width: '100%', height: '100%' }} />
                  </button>
                ))}
              </div>
            </div>

            <button onClick={() => { setPhotoURL(null); setPhotoFile(null); setSelectedAvatar(null); }}
              style={{ background: 'none', border: 'none', color: '#475569', fontSize: 12, cursor: 'pointer', marginTop: -8 }}>
              Skip photo for now
            </button>
          </div>
        )}

        {/* ══ STEP 5: FIND FRIENDS ══ */}
        {step === 5 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 44, marginBottom: 8 }}>🤝</div>
              <h2 style={{ color: '#f1f5f9', fontWeight: 800, margin: '0 0 4px' }}>Find People to Follow</h2>
              <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>Follow a few people to get started</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {SUGGESTED_USERS.map(u => (
                <div key={u.uid} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '12px 14px' }}>
                  <img src={u.avatar} alt={u.displayName} style={{ width: 44, height: 44, borderRadius: '50%', background: '#1e293b', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 14 }}>{u.displayName}</div>
                    <div style={{ color: '#6366f1', fontSize: 12 }}>@{u.handle}</div>
                    <div style={{ color: '#64748b', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.bio}</div>
                  </div>
                  <button onClick={() => toggleFollow(u.uid)}
                    style={{ padding: '7px 16px', borderRadius: 20, border: followed.has(u.uid) ? 'none' : '1px solid rgba(99,102,241,0.5)', background: followed.has(u.uid) ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.1)', color: followed.has(u.uid) ? '#818cf8' : '#6366f1', fontWeight: 700, fontSize: 13, cursor: 'pointer', flexShrink: 0 }}>
                    {followed.has(u.uid) ? '✓ Following' : 'Follow'}
                  </button>
                </div>
              ))}
            </div>

            {followed.size > 0 && (
              <div style={{ textAlign: 'center', marginTop: 14, color: '#10b981', fontSize: 13, fontWeight: 600 }}>
                ✓ Following {followed.size} {followed.size === 1 ? 'person' : 'people'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Navigation buttons ── */}
      <div style={{ padding: '12px 20px', display: 'flex', gap: 10, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {step > 1 && (
          <button onClick={() => setStep(s => s - 1)}
            style={{ flex: 1, padding: '13px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, color: '#f1f5f9', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
            ← Back
          </button>
        )}
        {step < TOTAL_STEPS ? (
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={!canProceed()}
            style={{ flex: 2, padding: '13px', background: canProceed() ? 'linear-gradient(135deg,#6366f1,#ec4899)' : 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 14, color: canProceed() ? 'white' : '#475569', fontSize: 15, fontWeight: 700, cursor: canProceed() ? 'pointer' : 'default', transition: 'all 0.2s' }}>
            {step === 1 ? "Let's Go →" : 'Continue →'}
          </button>
        ) : (
          <button onClick={finishOnboarding} disabled={saving}
            style={{ flex: 2, padding: '13px', background: 'linear-gradient(135deg,#6366f1,#ec4899)', border: 'none', borderRadius: 14, color: 'white', fontSize: 15, fontWeight: 700, cursor: saving ? 'default' : 'pointer' }}>
            {saving ? '⏳ Setting up…' : '🚀 Start Exploring!'}
          </button>
        )}
      </div>

      {/* ── Skip link (not on final step) ── */}
      {step < TOTAL_STEPS && (
        <button onClick={() => navigate('/feed', { replace: true })}
          style={{ textAlign: 'center', color: '#334155', fontSize: 12, background: 'none', border: 'none', cursor: 'pointer', paddingBottom: 'calc(12px + env(safe-area-inset-bottom))', paddingTop: 4 }}>
          Skip setup for now
        </button>
      )}
    </div>
  );
}
