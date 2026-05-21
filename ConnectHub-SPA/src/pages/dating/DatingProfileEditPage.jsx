// src/pages/dating/DatingProfileEditPage.jsx
// ════════════════════════════════════════════════════════════════════════════
// SECTION 5 — DATING PROFILE CREATE/EDIT  (/dating/profile/edit)
// May 2026 — New page added per Section 5 requirements
// ════════════════════════════════════════════════════════════════════════════
// Features:
//  • Multi-step form: Photos → Bio → Prompts → Details → Preview
//  • Photo upload with drag-reorder UI (up to 6 photos)
//  • Bio (500 char limit, live counter)
//  • Relationship goals: Relationship / Casual / Friendship / Open
//  • Prompts: 3 of 10 selectable Q&A prompts
//  • Extended details: height, education, religion, politics, lifestyle
//  • Video intro CTA (links to camera capture — browser API)
//  • Preview mode before save
//  • Saves to localStorage (Firestore TODO key for production wiring)
// ════════════════════════════════════════════════════════════════════════════

import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '@store/useAppStore';

const STEPS = ['Photos', 'Bio', 'Prompts', 'Details', 'Preview'];

const GOAL_OPTIONS = [
  { key: 'relationship', label: 'Relationship 💍', desc: 'Looking for something serious' },
  { key: 'casual',       label: 'Casual Dating ☕', desc: 'Keeping it low-key for now' },
  { key: 'friendship',   label: 'Friendship 🤝', desc: 'Friends first, see what happens' },
  { key: 'open',         label: 'Open to Anything ✨', desc: 'No labels, just vibes' },
];

const PROMPTS = [
  { id: 'p1', q: "I'm looking for someone who…" },
  { id: 'p2', q: "My perfect Sunday looks like…" },
  { id: 'p3', q: "We'll get along if…" },
  { id: 'p4', q: "My most controversial opinion is…" },
  { id: 'p5', q: "Two truths and a lie about me…" },
  { id: 'p6', q: "My love language is…" },
  { id: 'p7', q: "I'm embarrassingly obsessed with…" },
  { id: 'p8', q: "My simple pleasures in life…" },
  { id: 'p9', q: "Green flag in a partner…" },
  { id: 'p10', q: "I go to bed thinking about…" },
];

const HEIGHTS = ['Under 5\'0"', '5\'0"', '5\'1"', '5\'2"', '5\'3"', '5\'4"', '5\'5"', '5\'6"', '5\'7"', '5\'8"', '5\'9"', '5\'10"', '5\'11"', '6\'0"', '6\'1"', '6\'2"', '6\'3"', '6\'4"+'];
const EDUCATIONS = ['High School', 'Some College', 'Associate\'s', 'Bachelor\'s', 'Master\'s', 'PhD / Doctorate', 'Trade School', 'Other'];
const RELIGIONS  = ['Prefer not to say', 'Agnostic', 'Atheist', 'Buddhist', 'Christian', 'Hindu', 'Jewish', 'Muslim', 'Spiritual', 'Other'];
const POLITICS   = ['Prefer not to say', 'Very Liberal', 'Liberal', 'Moderate', 'Conservative', 'Very Conservative', 'Non-political'];
const LIFESTYLES = ['Vegan', 'Vegetarian', 'Pescatarian', 'No restrictions'];
const EXERCISES  = ['Daily', 'Often', 'Sometimes', 'Rarely'];
const SMOKING    = ['Never', 'Sometimes', 'Often', 'Always'];
const DRINKING   = ['Never', 'Socially', 'Often'];
const KIDS       = ['Don\'t have kids', 'Have kids', 'Want kids', 'Don\'t want kids', 'Open to it'];

// Placeholder avatar emojis for photos not yet uploaded
const EMOJI_PLACEHOLDER = ['🌸','📷','✨','🌟','💫','🎯'];

const PAGE_BG = 'linear-gradient(160deg,#0a0a18 0%,#12091e 60%,#0a0a18 100%)';
const CARD_BG = 'rgba(255,255,255,0.04)';
const BORDER  = '1px solid rgba(255,255,255,0.08)';

function ProgressBar({ step, total }) {
  return (
    <div style={{ display:'flex', gap:4, padding:'0 16px', marginBottom:20 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          flex:1, height:4, borderRadius:2,
          background: i <= step ? 'linear-gradient(90deg,#6366f1,#22c55e)' : 'rgba(255,255,255,0.1)',
          transition:'background 0.3s ease',
        }} />
      ))}
    </div>
  );
}

// ── STEP 0: PHOTOS ────────────────────────────────────────────────────────────
function PhotosStep({ photos, setPhotos, showToast }) {
  const fileRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (photos.length + files.length > 6) {
      showToast('⚠️ Max 6 photos allowed', 'warning');
      return;
    }
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPhotos(p => [...p, { id: Date.now() + Math.random(), url: ev.target.result, file }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removePhoto = (id) => setPhotos(p => p.filter(ph => ph.id !== id));

  return (
    <div>
      <div style={{ fontSize:16, fontWeight:800, color:'#f1f5f9', marginBottom:6 }}>Your Photos</div>
      <div style={{ fontSize:13, color:'#64748b', marginBottom:16 }}>
        Add up to 6 photos. Drag to reorder (coming soon). First photo is your main photo.
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:20 }}>
        {Array.from({ length: 6 }).map((_, i) => {
          const photo = photos[i];
          return (
            <div key={i} style={{
              aspectRatio:'3/4', borderRadius:14, overflow:'hidden',
              background: photo ? 'transparent' : 'rgba(99,102,241,0.06)',
              border: photo ? 'none' : '2px dashed rgba(99,102,241,0.25)',
              display:'flex', alignItems:'center', justifyContent:'center',
              position:'relative', cursor: photo ? 'default' : 'pointer',
            }}
            onClick={() => !photo && fileRef.current?.click()}>
              {photo ? (
                <>
                  <img src={photo.url} alt={`Photo ${i+1}`}
                    style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  <button onClick={(e) => { e.stopPropagation(); removePhoto(photo.id); }}
                    style={{ position:'absolute', top:6, right:6, width:24, height:24,
                      borderRadius:'50%', background:'rgba(0,0,0,0.65)', border:'none',
                      color:'white', fontSize:12, cursor:'pointer', display:'flex',
                      alignItems:'center', justifyContent:'center' }}>✕</button>
                  {i === 0 && (
                    <div style={{ position:'absolute', bottom:6, left:6, background:'rgba(0,0,0,0.65)',
                      borderRadius:8, padding:'2px 8px', fontSize:10, color:'#22c55e', fontWeight:700 }}>
                      Main
                    </div>
                  )}
                </>
              ) : (
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:i === 0 ? 28 : 20, marginBottom:4 }}>{i === 0 ? '📷' : '+'}</div>
                  <div style={{ fontSize:10, color:'#475569' }}>
                    {i === 0 ? 'Add main photo' : `Photo ${i + 1}`}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <input ref={fileRef} type="file" accept="image/*" multiple
        style={{ display:'none' }} onChange={handleFileChange} />

      <button onClick={() => fileRef.current?.click()}
        style={{ width:'100%', padding:'14px', borderRadius:16, border:'none', cursor:'pointer',
          background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'white',
          fontWeight:700, fontSize:14, minHeight:44 }}>
        📷 Add Photos
      </button>

      <div style={{ marginTop:16, padding:'12px 14px', borderRadius:14,
        background:'rgba(99,102,241,0.06)', border:'1px solid rgba(99,102,241,0.15)' }}>
        <div style={{ fontSize:12, color:'#94a3b8', fontWeight:600, marginBottom:6 }}>📸 Photo Tips</div>
        <ul style={{ margin:0, paddingLeft:16, fontSize:11, color:'#64748b', lineHeight:1.6 }}>
          <li>Use recent photos (within the last 2 years)</li>
          <li>Include at least one clear face photo</li>
          <li>Show your personality — hobbies, travel, smiling</li>
          <li>Avoid heavy filters</li>
        </ul>
      </div>
    </div>
  );
}

// ── STEP 1: BIO ────────────────────────────────────────────────────────────────
function BioStep({ bio, setBio, goal, setGoal }) {
  const maxLen = 500;
  return (
    <div>
      <div style={{ fontSize:16, fontWeight:800, color:'#f1f5f9', marginBottom:6 }}>About You</div>
      <div style={{ fontSize:13, color:'#64748b', marginBottom:16 }}>
        Write a bio and pick your relationship goal.
      </div>

      {/* Bio textarea */}
      <div style={{ marginBottom:20 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
          <label style={{ fontSize:13, fontWeight:700, color:'#94a3b8' }}>Bio</label>
          <span style={{ fontSize:11, color: bio.length > maxLen * 0.9 ? '#ef4444' : '#475569' }}>
            {bio.length}/{maxLen}
          </span>
        </div>
        <textarea
          value={bio}
          onChange={e => setBio(e.target.value.slice(0, maxLen))}
          placeholder="Tell people who you really are. What makes you laugh? What are you passionate about? Keep it genuine ✨"
          style={{
            width:'100%', minHeight:120, borderRadius:14, padding:'12px',
            background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
            color:'#f1f5f9', fontSize:14, lineHeight:1.6, resize:'vertical',
            fontFamily:'inherit', boxSizing:'border-box',
          }}
        />
      </div>

      {/* Relationship goal */}
      <div>
        <div style={{ fontSize:13, fontWeight:700, color:'#94a3b8', marginBottom:10 }}>
          Relationship Goal
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {GOAL_OPTIONS.map(opt => (
            <button key={opt.key} onClick={() => setGoal(opt.key)}
              style={{
                display:'flex', alignItems:'center', gap:12, padding:'14px 16px',
                borderRadius:16, cursor:'pointer', textAlign:'left', minHeight:56,
                background: goal === opt.key ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
                border: goal === opt.key ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.08)',
              }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:700, color: goal === opt.key ? '#a5b4fc' : '#f1f5f9' }}>
                  {opt.label}
                </div>
                <div style={{ fontSize:11, color:'#64748b', marginTop:2 }}>{opt.desc}</div>
              </div>
              {goal === opt.key && <span style={{ fontSize:16, color:'#22c55e' }}>✓</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── STEP 2: PROMPTS ────────────────────────────────────────────────────────────
function PromptsStep({ selectedPrompts, setSelectedPrompts }) {
  const MAX = 3;

  const toggle = (prompt) => {
    setSelectedPrompts(prev => {
      const exists = prev.find(p => p.id === prompt.id);
      if (exists) return prev.filter(p => p.id !== prompt.id);
      if (prev.length >= MAX) return prev;
      return [...prev, { ...prompt, answer: '' }];
    });
  };

  const setAnswer = (id, answer) => {
    setSelectedPrompts(prev => prev.map(p => p.id === id ? { ...p, answer } : p));
  };

  const selected = selectedPrompts;

  return (
    <div>
      <div style={{ fontSize:16, fontWeight:800, color:'#f1f5f9', marginBottom:6 }}>
        Your Prompts ({selected.length}/{MAX})
      </div>
      <div style={{ fontSize:13, color:'#64748b', marginBottom:16 }}>
        Pick up to 3 conversation starters. These appear on your profile card.
      </div>

      {/* Selected prompts with answer inputs */}
      {selected.length > 0 && (
        <div style={{ marginBottom:16 }}>
          {selected.map(p => (
            <div key={p.id} style={{
              background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.2)',
              borderRadius:16, padding:'12px 14px', marginBottom:10,
            }}>
              <div style={{ fontSize:13, fontWeight:700, color:'#a5b4fc', marginBottom:8 }}>
                {p.q}
              </div>
              <textarea
                value={p.answer}
                onChange={e => setAnswer(p.id, e.target.value.slice(0, 200))}
                placeholder="Your answer…"
                style={{ width:'100%', minHeight:72, borderRadius:10, padding:'8px 10px',
                  background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)',
                  color:'#f1f5f9', fontSize:13, resize:'vertical', fontFamily:'inherit', boxSizing:'border-box' }}
              />
              <div style={{ textAlign:'right', fontSize:10, color:'#475569', marginTop:2 }}>
                {p.answer.length}/200
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Prompt picker */}
      <div style={{ fontSize:12, fontWeight:700, color:'#475569', marginBottom:10 }}>
        CHOOSE PROMPTS:
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {PROMPTS.map(prompt => {
          const isSelected = !!selected.find(p => p.id === prompt.id);
          const disabled = selected.length >= MAX && !isSelected;
          return (
            <button key={prompt.id}
              onClick={() => !disabled && toggle(prompt)}
              style={{
                display:'flex', alignItems:'center', gap:10, padding:'12px 14px',
                borderRadius:14, cursor: disabled ? 'not-allowed' : 'pointer', textAlign:'left', minHeight:44,
                background: isSelected ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.03)',
                border: isSelected ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.06)',
                opacity: disabled ? 0.4 : 1,
              }}>
              <span style={{ fontSize:16, color: isSelected ? '#6366f1' : '#475569' }}>
                {isSelected ? '✓' : '+'}
              </span>
              <span style={{ fontSize:13, color: isSelected ? '#a5b4fc' : '#94a3b8' }}>{prompt.q}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── STEP 3: DETAILS ────────────────────────────────────────────────────────────
function DetailsStep({ details, setDetails }) {
  const up = (k, v) => setDetails(d => ({ ...d, [k]: v }));
  const Row = ({ label, field, options }) => (
    <div style={{ marginBottom:16 }}>
      <div style={{ fontSize:13, fontWeight:700, color:'#94a3b8', marginBottom:8 }}>{label}</div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
        {options.map(opt => (
          <button key={opt} onClick={() => up(field, opt)}
            style={{
              padding:'8px 14px', borderRadius:20, fontSize:12, fontWeight:600,
              cursor:'pointer', minHeight:36,
              background: details[field] === opt ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
              border: details[field] === opt ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.08)',
              color: details[field] === opt ? '#a5b4fc' : '#94a3b8',
            }}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ fontSize:16, fontWeight:800, color:'#f1f5f9', marginBottom:6 }}>
        More About You
      </div>
      <div style={{ fontSize:13, color:'#64748b', marginBottom:16 }}>
        These details help us match you better. All optional.
      </div>

      <Row label="Height" field="height" options={HEIGHTS} />
      <Row label="Education" field="education" options={EDUCATIONS} />
      <Row label="Religion" field="religion" options={RELIGIONS} />
      <Row label="Politics" field="politics" options={POLITICS} />
      <Row label="Diet / Lifestyle" field="lifestyle" options={LIFESTYLES} />
      <Row label="Exercise" field="exercise" options={EXERCISES} />
      <Row label="Smoking" field="smoking" options={SMOKING} />
      <Row label="Drinking" field="drinking" options={DRINKING} />
      <Row label="Kids" field="kids" options={KIDS} />
    </div>
  );
}

// ── STEP 4: PREVIEW ────────────────────────────────────────────────────────────
function PreviewStep({ photos, bio, goal, prompts, details }) {
  const goalLabel = GOAL_OPTIONS.find(o => o.key === goal)?.label || '';
  return (
    <div>
      <div style={{ fontSize:16, fontWeight:800, color:'#f1f5f9', marginBottom:6 }}>
        Profile Preview
      </div>
      <div style={{ fontSize:13, color:'#64748b', marginBottom:16 }}>
        This is how your dating profile will look.
      </div>

      {/* Card mock */}
      <div style={{ borderRadius:24, overflow:'hidden', border:'1px solid rgba(255,255,255,0.1)',
        boxShadow:'0 8px 32px rgba(0,0,0,0.5)', marginBottom:20 }}>
        {/* Photo */}
        <div style={{ height:280, background:'linear-gradient(135deg,#6366f1,#0a0a2e)',
          display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
          {photos[0] ? (
            <img src={photos[0].url} alt="main" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          ) : (
            <div style={{ fontSize:80 }}>📷</div>
          )}
          {/* Bottom overlay */}
          <div style={{ position:'absolute', bottom:0, left:0, right:0,
            background:'linear-gradient(to top,rgba(0,0,0,0.9),transparent)',
            padding:'40px 16px 16px' }}>
            <div style={{ fontWeight:900, fontSize:22, color:'#f1f5f9' }}>Your Profile</div>
            {goalLabel && (
              <div style={{ fontSize:12, color:'#a855f7', marginTop:2, fontWeight:600 }}>{goalLabel}</div>
            )}
          </div>
        </div>

        {/* Info */}
        <div style={{ padding:'16px', background:'#0f0c29' }}>
          {bio && <p style={{ fontSize:14, color:'#cbd5e1', lineHeight:1.6, marginBottom:12 }}>{bio}</p>}

          {/* Prompts */}
          {prompts.filter(p => p.answer).map(p => (
            <div key={p.id} style={{ background:'rgba(99,102,241,0.08)',
              borderRadius:14, padding:'10px 14px', marginBottom:8 }}>
              <div style={{ fontSize:11, color:'#6366f1', fontWeight:700, marginBottom:4 }}>{p.q}</div>
              <div style={{ fontSize:13, color:'#e2e8f0' }}>{p.answer}</div>
            </div>
          ))}

          {/* Details pills */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:8 }}>
            {Object.entries(details).filter(([, v]) => v).map(([k, v]) => (
              <span key={k} style={{ background:'rgba(255,255,255,0.07)',
                border:'1px solid rgba(255,255,255,0.1)', borderRadius:20,
                padding:'4px 10px', fontSize:11, color:'#94a3b8' }}>
                {v}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Photos row */}
      {photos.length > 1 && (
        <div style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:8 }}>
          {photos.map((p, i) => (
            <div key={p.id} style={{ flexShrink:0, width:80, height:80, borderRadius:12, overflow:'hidden' }}>
              <img src={p.url} alt={`Photo ${i+1}`} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────────
export default function DatingProfileEditPage() {
  const navigate  = useNavigate();
  const showToast = useAppStore(s => s.showToast);

  const [step,     setStep]     = useState(0);
  const [photos,   setPhotos]   = useState([]);
  const [bio,      setBio]      = useState('');
  const [goal,     setGoal]     = useState('');
  const [prompts,  setPrompts]  = useState([]);
  const [details,  setDetails]  = useState({
    height:'', education:'', religion:'', politics:'',
    lifestyle:'', exercise:'', smoking:'', drinking:'', kids:'',
  });
  const [saving, setSaving] = useState(false);

  const canNext = () => {
    if (step === 0) return photos.length >= 1;
    if (step === 1) return bio.length >= 10 && !!goal;
    if (step === 2) return prompts.length >= 1;
    return true;
  };

  const handleNext = () => {
    if (!canNext()) {
      const hints = ['Please add at least 1 photo', 'Add a bio (10+ chars) and pick your goal', 'Pick at least 1 prompt'];
      showToast(hints[step] || 'Please fill in the required fields', 'warning');
      return;
    }
    if (step < STEPS.length - 1) setStep(s => s + 1);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO (Firestore wire-up): Replace localStorage with Firestore write
      // await setDoc(doc(db, 'users', uid, 'datingProfile', 'data'), profileData);
      const profileData = {
        photos: photos.map(p => p.url),
        bio, goal, prompts,
        details,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem('datingProfile', JSON.stringify(profileData));
      showToast('✅ Dating profile saved!', 'success');
      setTimeout(() => navigate('/dating'), 1200);
    } catch (err) {
      showToast('❌ Save failed — please try again', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight:'100vh', background:PAGE_BG, paddingBottom:120,
      fontFamily:'system-ui,sans-serif', color:'#f1f5f9' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', padding:'16px 16px 8px', gap:12 }}>
        <button onClick={() => step > 0 ? setStep(s => s - 1) : navigate(-1)}
          style={{ width:36, height:36, borderRadius:'50%', background:'rgba(255,255,255,0.07)',
            border:'1px solid rgba(255,255,255,0.1)', color:'#94a3b8', fontSize:16,
            cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
          ←
        </button>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:16, fontWeight:800, color:'#f1f5f9' }}>
            {step < STEPS.length - 1 ? 'Edit Dating Profile' : 'Preview Profile'}
          </div>
          <div style={{ fontSize:12, color:'#64748b' }}>Step {step + 1} of {STEPS.length}: {STEPS[step]}</div>
        </div>
        {/* Step label pills */}
        <div style={{ display:'flex', gap:4 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ width:6, height:6, borderRadius:'50%',
              background: i === step ? '#6366f1' : i < step ? '#22c55e' : 'rgba(255,255,255,0.15)' }} />
          ))}
        </div>
      </div>

      <ProgressBar step={step} total={STEPS.length} />

      {/* Content */}
      <div style={{ padding:'0 16px' }}>
        {step === 0 && <PhotosStep photos={photos} setPhotos={setPhotos} showToast={showToast} />}
        {step === 1 && <BioStep bio={bio} setBio={setBio} goal={goal} setGoal={setGoal} />}
        {step === 2 && <PromptsStep selectedPrompts={prompts} setSelectedPrompts={setPrompts} />}
        {step === 3 && <DetailsStep details={details} setDetails={setDetails} />}
        {step === 4 && <PreviewStep photos={photos} bio={bio} goal={goal} prompts={prompts} details={details} />}
      </div>

      {/* Footer nav */}
      <div style={{ position:'fixed', bottom:0, left:0, right:0, background:'rgba(10,10,24,0.97)',
        borderTop:'1px solid rgba(255,255,255,0.08)', padding:'12px 16px 28px',
        display:'flex', gap:10, backdropFilter:'blur(10px)' }}>
        {step < STEPS.length - 1 ? (
          <>
            <button onClick={() => step > 0 && setStep(s => s - 1)}
              style={{ flex:1, padding:'14px', borderRadius:16, cursor: step===0?'not-allowed':'pointer',
                background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)',
                color: step===0 ? '#334155' : '#94a3b8', fontWeight:700, fontSize:14, minHeight:44,
                opacity: step===0 ? 0.4 : 1 }}>
              Back
            </button>
            <button onClick={handleNext}
              style={{ flex:2, padding:'14px', borderRadius:16, border:'none', cursor:'pointer',
                background: canNext() ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(255,255,255,0.06)',
                color: canNext() ? 'white' : '#475569', fontWeight:800, fontSize:14, minHeight:44 }}>
              {step === STEPS.length - 2 ? 'Preview →' : 'Next →'}
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setStep(s => s - 1)}
              style={{ flex:1, padding:'14px', borderRadius:16, cursor:'pointer',
                background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)',
                color:'#94a3b8', fontWeight:700, fontSize:14, minHeight:44 }}>
              ← Edit
            </button>
            <button onClick={handleSave} disabled={saving}
              style={{ flex:2, padding:'14px', borderRadius:16, border:'none',
                cursor: saving ? 'wait' : 'pointer', minHeight:44,
                background: saving ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg,#22c55e,#16a34a)',
                color: saving ? '#475569' : 'white', fontWeight:800, fontSize:14 }}>
              {saving ? '⏳ Saving…' : '✅ Save Profile'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
