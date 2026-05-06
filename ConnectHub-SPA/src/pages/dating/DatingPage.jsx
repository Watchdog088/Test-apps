// PAGE 9 — DATING SCREEN (14 buttons per layout reference)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '@store/useAppStore';

const PROFILES = [
  { id:1, name:'Emma Wilson', age:26, dist:'2 mi', emoji:'😊', bio:'Coffee lover · Traveler · Dog mom', tags:['Music','Travel','Yoga'] },
  { id:2, name:'Sofia Garcia', age:24, dist:'5 mi', emoji:'🎨', bio:'Artist · Foodie · Adventure seeker', tags:['Art','Food','Hiking'] },
  { id:3, name:'Mia Johnson', age:28, dist:'1 mi', emoji:'🚀', bio:'Startup founder · Book reader', tags:['Tech','Books','Fitness'] },
];

const STATS = [
  { label:'Matches', value:'12', color:'#ec4899' },
  { label:'Likes',   value:'45', color:'#6366f1' },
  { label:'Super',   value:'3',  color:'#f59e0b' },
  { label:'Views',   value:'23', color:'#10b981' },
];

export default function DatingPage() {
  const navigate = useNavigate();
  const showToast = useAppStore((s) => s.showToast);
  const [cardIndex, setCardIndex] = useState(0);

  const currentProfile = PROFILES[cardIndex % PROFILES.length];

  const handlePass = () => { showToast(`Passed on ${currentProfile.name}`); setCardIndex(i => i + 1); };
  const handleLike = () => { showToast(`💚 Liked ${currentProfile.name}!`); setCardIndex(i => i + 1); };
  const handleSuperLike = () => { showToast(`⭐ Super Liked ${currentProfile.name}!`); setCardIndex(i => i + 1); };

  return (
    <div style={{ background:'#0f172a', minHeight:'100vh', paddingBottom:'100px' }}>
      {/* Header */}
      <div style={{ padding:'16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize:'20px', fontWeight:700, color:'#f1f5f9' }}>💕 Dating</span>
        <button onClick={() => showToast('Dating settings opening...')} style={{ background:'none', border:'none', color:'#94a3b8', fontSize:'20px', cursor:'pointer' }}>⚙️</button>
      </div>

      {/* Edit Profile + Quick Actions */}
      <div style={{ display:'flex', gap:'8px', padding:'12px 16px' }}>
        <button onClick={() => showToast('Editing dating profile...')} style={{ flex:1, background:'#1e293b', color:'#94a3b8', border:'1px solid #334155', borderRadius:'12px', padding:'10px', fontSize:'13px', fontWeight:600, cursor:'pointer' }}>✏️ Edit Profile</button>
        <button onClick={() => showToast('Preferences opening...')} style={{ flex:1, background:'#1e293b', color:'#94a3b8', border:'1px solid #334155', borderRadius:'12px', padding:'10px', fontSize:'13px', fontWeight:600, cursor:'pointer' }}>⚙️ Preferences</button>
      </div>

      {/* Quick Settings Row */}
      <div style={{ display:'flex', gap:'8px', padding:'0 16px', marginBottom:'12px' }}>
        {[
          { icon:'🎯', label:'Goals' },
          { icon:'🎨', label:'Interests' },
          { icon:'📸', label:'Verify' },
        ].map(q => (
          <button key={q.label} onClick={() => showToast(`${q.label} settings opening...`)} style={{ flex:1, background:'#1e293b', color:'#94a3b8', border:'1px solid #334155', borderRadius:'12px', padding:'10px 8px', fontSize:'12px', fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px' }}>
            {q.icon} {q.label}
          </button>
        ))}
      </div>

      {/* Stats Row (12 / 45 / 3 / 23) */}
      <div style={{ display:'flex', gap:'8px', padding:'0 16px', marginBottom:'16px' }}>
        {STATS.map(s => (
          <button key={s.label} onClick={() => showToast(`${s.label}: ${s.value}`)} style={{ flex:1, background:'#1e293b', border:'none', borderRadius:'12px', padding:'10px 6px', cursor:'pointer', textAlign:'center' }}>
            <div style={{ fontWeight:900, color:s.color, fontSize:'18px' }}>{s.value}</div>
            <div style={{ color:'#64748b', fontSize:'10px', fontWeight:600 }}>{s.label}</div>
          </button>
        ))}
      </div>

      {/* Swipe Card */}
      <div style={{ padding:'0 16px', marginBottom:'16px' }}>
        <div style={{ background:'linear-gradient(160deg,#1e293b,#0f172a)', borderRadius:'28px', overflow:'hidden', position:'relative', minHeight:'360px', border:'1px solid #334155' }}>
          {/* Profile Image Area */}
          <div style={{ height:'240px', background:`linear-gradient(135deg,#6366f1,#ec4899)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'80px', position:'relative' }}>
            {currentProfile.emoji}
            <div style={{ position:'absolute', top:'14px', right:'14px', background:'rgba(0,0,0,0.5)', borderRadius:'20px', padding:'4px 12px', color:'white', fontSize:'12px', fontWeight:700 }}>
              👤 {cardIndex + 1}/{PROFILES.length}
            </div>
          </div>

          {/* Profile Info */}
          <div style={{ padding:'16px' }}>
            <div style={{ display:'flex', alignItems:'baseline', gap:'10px', marginBottom:'4px' }}>
              <span style={{ fontWeight:900, color:'#f1f5f9', fontSize:'20px' }}>{currentProfile.name}</span>
              <span style={{ color:'#64748b', fontSize:'15px' }}>{currentProfile.age}</span>
              <span style={{ color:'#64748b', fontSize:'13px', marginLeft:'auto' }}>📍 {currentProfile.dist}</span>
            </div>
            <div style={{ color:'#94a3b8', fontSize:'13px', marginBottom:'10px' }}>{currentProfile.bio}</div>
            <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
              {currentProfile.tags.map(t => (
                <span key={t} style={{ background:'rgba(99,102,241,0.15)', color:'#6366f1', fontSize:'11px', fontWeight:600, borderRadius:'20px', padding:'3px 10px' }}>#{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Swipe Action Buttons (✕ Pass / ⭐ Super Like / 💚 Like) */}
      <div style={{ display:'flex', gap:'16px', justifyContent:'center', padding:'0 32px', marginBottom:'16px', alignItems:'center' }}>
        {/* ✕ Pass */}
        <button onClick={handlePass} style={{ width:'64px', height:'64px', borderRadius:'50%', background:'rgba(239,68,68,0.15)', border:'2px solid #ef4444', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px', cursor:'pointer', flexShrink:0 }}>
          ✕
        </button>
        {/* ⭐ Super Like */}
        <button onClick={handleSuperLike} style={{ width:'56px', height:'56px', borderRadius:'50%', background:'rgba(245,158,11,0.15)', border:'2px solid #f59e0b', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', cursor:'pointer', flexShrink:0 }}>
          ⭐
        </button>
        {/* 💚 Like */}
        <button onClick={handleLike} style={{ width:'64px', height:'64px', borderRadius:'50%', background:'rgba(16,185,129,0.15)', border:'2px solid #10b981', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px', cursor:'pointer', flexShrink:0 }}>
          💚
        </button>
      </div>

      {/* Swipe instructions */}
      <div style={{ textAlign:'center', color:'#334155', fontSize:'12px', paddingBottom:'8px' }}>
        ✕ Pass · ⭐ Super Like · 💚 Like
      </div>
    </div>
  );
}
