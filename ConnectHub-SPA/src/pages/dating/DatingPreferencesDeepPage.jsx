// src/pages/dating/DatingPreferencesDeepPage.jsx
// SECTION 5 — DATING PREFERENCES DEEP-DIVE  (/dating/preferences)
// May 2026 — Extended settings: religion, education, politics, lifestyle

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '@store/useAppStore';

const PAGE_BG = 'linear-gradient(160deg,#0a0a18 0%,#12091e 60%,#0a0a18 100%)';

const OPT = (label, options) => ({ label, options });
const PREFS_CONFIG = [
  OPT('Age Range', null),
  OPT('Distance', null),
  OPT('Relationship Goal', ['Relationship','Casual','Friendship','Open to Anything']),
  OPT('Education', ['High School','Some College','Associate\'s','Bachelor\'s','Master\'s','PhD','Trade School','Any']),
  OPT('Religion', ['Agnostic','Atheist','Buddhist','Christian','Hindu','Jewish','Muslim','Spiritual','Prefer not to say','Any']),
  OPT('Politics', ['Very Liberal','Liberal','Moderate','Conservative','Very Conservative','Non-political','Any']),
  OPT('Diet / Lifestyle', ['Vegan','Vegetarian','Pescatarian','No Restrictions','Any']),
  OPT('Exercise Habit', ['Daily','Often','Sometimes','Rarely','Any']),
  OPT('Smoking', ['Never','Sometimes','Often','Any']),
  OPT('Drinking', ['Never','Socially','Often','Any']),
  OPT('Kids', ['Don\'t have kids','Have kids','Want kids','Don\'t want kids','Open to it','Any']),
];

export default function DatingPreferencesDeepPage() {
  const navigate  = useNavigate();
  const showToast = useAppStore(s => s.showToast);

  const [ageMin, setAgeMin]   = useState(22);
  const [ageMax, setAgeMax]   = useState(35);
  const [distance, setDist]   = useState(25);
  const [verified, setVerif]  = useState(false);
  const [activeOnly, setAct]  = useState(false);
  const [prefs, setPrefs]     = useState({});
  const [saving, setSaving]   = useState(false);

  const setP = (k, v) => setPrefs(p => ({ ...p, [k]: v }));

  const handleSave = () => {
    setSaving(true);
    const data = { ageMin, ageMax, distance, verified, activeOnly, ...prefs, updatedAt: new Date().toISOString() };
    localStorage.setItem('datingPreferences', JSON.stringify(data));
    setTimeout(() => {
      setSaving(false);
      showToast('✅ Preferences saved!', 'success');
      navigate('/dating');
    }, 800);
  };

  const ChipRow = ({ field, options }) => (
    <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:8 }}>
      {options.map(opt => (
        <button key={opt} onClick={() => setP(field, opt)}
          style={{ padding:'7px 14px', borderRadius:20, fontSize:12, fontWeight:600, cursor:'pointer',
            background: prefs[field] === opt ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
            border: prefs[field] === opt ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.08)',
            color: prefs[field] === opt ? '#a5b4fc' : '#94a3b8', minHeight:36 }}>
          {opt}
        </button>
      ))}
    </div>
  );

  const Section = ({ title, children }) => (
    <div style={{ marginBottom:24 }}>
      <div style={{ fontSize:13, fontWeight:700, color:'#64748b', letterSpacing:1, marginBottom:12 }}>{title}</div>
      {children}
    </div>
  );

  const Toggle = ({ label, desc, value, onChange }) => (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'14px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
      <div>
        <div style={{ fontSize:14, fontWeight:600, color:'#f1f5f9' }}>{label}</div>
        {desc && <div style={{ fontSize:11, color:'#64748b', marginTop:2 }}>{desc}</div>}
      </div>
      <button onClick={() => onChange(!value)}
        style={{ width:44, height:24, borderRadius:12, border:'none', cursor:'pointer', position:'relative',
          background: value ? '#6366f1' : 'rgba(255,255,255,0.12)', transition:'background 0.2s' }}>
        <div style={{ position:'absolute', top:2, width:20, height:20, borderRadius:'50%',
          background:'white', transition:'left 0.2s', left: value ? 22 : 2 }} />
      </button>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:PAGE_BG, paddingBottom:120,
      fontFamily:'system-ui,sans-serif', color:'#f1f5f9' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'16px 16px 8px' }}>
        <button onClick={() => navigate(-1)}
          style={{ width:36, height:36, borderRadius:'50%', background:'rgba(255,255,255,0.07)',
            border:'1px solid rgba(255,255,255,0.1)', color:'#94a3b8', fontSize:16,
            cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
          ←
        </button>
        <div>
          <div style={{ fontSize:18, fontWeight:800 }}>🎛️ Match Preferences</div>
          <div style={{ fontSize:12, color:'#64748b' }}>Tell us who you want to meet</div>
        </div>
      </div>

      <div style={{ padding:'16px 16px 0' }}>

        {/* Age range */}
        <Section title="AGE RANGE">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <span style={{ fontSize:14, color:'#f1f5f9', fontWeight:700 }}>{ageMin} – {ageMax} years</span>
          </div>
          <div style={{ marginBottom:10 }}>
            <div style={{ fontSize:12, color:'#64748b', marginBottom:6 }}>Minimum age: {ageMin}</div>
            <input type="range" min={18} max={ageMax - 1} value={ageMin}
              onChange={e => setAgeMin(Number(e.target.value))}
              style={{ width:'100%', accentColor:'#6366f1' }} />
          </div>
          <div>
            <div style={{ fontSize:12, color:'#64748b', marginBottom:6 }}>Maximum age: {ageMax}</div>
            <input type="range" min={ageMin + 1} max={80} value={ageMax}
              onChange={e => setAgeMax(Number(e.target.value))}
              style={{ width:'100%', accentColor:'#6366f1' }} />
          </div>
        </Section>

        {/* Distance */}
        <Section title="MAXIMUM DISTANCE">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
            <span style={{ fontSize:14, color:'#f1f5f9', fontWeight:700 }}>
              {distance >= 100 ? 'Anywhere' : `${distance} miles`}
            </span>
          </div>
          <input type="range" min={1} max={100} value={distance}
            onChange={e => setDist(Number(e.target.value))}
            style={{ width:'100%', accentColor:'#6366f1' }} />
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#475569', marginTop:4 }}>
            <span>1 mi</span><span>25 mi</span><span>50 mi</span><span>Anywhere</span>
          </div>
        </Section>

        {/* Toggles */}
        <Section title="FILTERS">
          <Toggle label="Verified profiles only" desc="Only show verified users" value={verified} onChange={setVerif} />
          <Toggle label="Recently active" desc="Active within 72 hours" value={activeOnly} onChange={setAct} />
        </Section>

        {/* Relationship goal */}
        <Section title="RELATIONSHIP GOAL">
          <ChipRow field="goal" options={['Relationship','Casual','Friendship','Open to Anything']} />
        </Section>

        {/* Education */}
        <Section title="EDUCATION">
          <ChipRow field="education" options={["High School","Some College","Bachelor's","Master's","PhD","Any"]} />
        </Section>

        {/* Religion */}
        <Section title="RELIGION">
          <ChipRow field="religion" options={['Agnostic','Atheist','Christian','Jewish','Muslim','Hindu','Spiritual','Any']} />
        </Section>

        {/* Politics */}
        <Section title="POLITICS">
          <ChipRow field="politics" options={['Liberal','Moderate','Conservative','Non-political','Any']} />
        </Section>

        {/* Lifestyle */}
        <Section title="DIET / LIFESTYLE">
          <ChipRow field="lifestyle" options={['Vegan','Vegetarian','Pescatarian','No Restrictions','Any']} />
        </Section>

        {/* Smoking */}
        <Section title="SMOKING">
          <ChipRow field="smoking" options={['Never','Sometimes','Often','Any']} />
        </Section>

        {/* Drinking */}
        <Section title="DRINKING">
          <ChipRow field="drinking" options={['Never','Socially','Often','Any']} />
        </Section>

        {/* Kids */}
        <Section title="KIDS">
          <ChipRow field="kids" options={["Don't have kids","Have kids","Want kids","Don't want kids","Open to it","Any"]} />
        </Section>

        {/* Exercise */}
        <Section title="EXERCISE HABIT">
          <ChipRow field="exercise" options={['Daily','Often','Sometimes','Rarely','Any']} />
        </Section>

        {/* Note */}
        <div style={{ padding:'12px 14px', borderRadius:14, background:'rgba(99,102,241,0.06)',
          border:'1px solid rgba(99,102,241,0.12)', marginBottom:24 }}>
          <div style={{ fontSize:12, color:'#64748b', lineHeight:1.6 }}>
            💡 <strong style={{ color:'#a5b4fc' }}>Tip:</strong> More specific filters = fewer but better matches. 
            Select "Any" to keep a preference open.
          </div>
        </div>
      </div>

      {/* Fixed footer */}
      <div style={{ position:'fixed', bottom:0, left:0, right:0,
        background:'rgba(10,10,24,0.97)', borderTop:'1px solid rgba(255,255,255,0.08)',
        padding:'12px 16px 28px', backdropFilter:'blur(10px)', display:'flex', gap:10 }}>
        <button onClick={() => { setPrefs({}); setAgeMin(22); setAgeMax(35); setDist(25); setVerif(false); setAct(false); }}
          style={{ flex:1, padding:'14px', borderRadius:16, cursor:'pointer',
            background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)',
            color:'#94a3b8', fontWeight:700, fontSize:14, minHeight:44 }}>
          🔄 Reset
        </button>
        <button onClick={handleSave} disabled={saving}
          style={{ flex:2, padding:'14px', borderRadius:16, border:'none',
            cursor: saving ? 'wait' : 'pointer', minHeight:44,
            background: saving ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            color: saving ? '#475569' : 'white', fontWeight:800, fontSize:14 }}>
          {saving ? '⏳ Saving…' : '✅ Save Preferences'}
        </button>
      </div>
    </div>
  );
}
