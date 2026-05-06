// DatingPage — full Tinder-style layout per spec
// Filter bar · Card stack (depth) · Compatibility % · ✗ ⭐ ❤️ actions · Matches row
import React, { useState } from 'react';
import useAppStore from '@store/useAppStore';

const PROFILES = [
  { id:1, name:'Emma Wilson',  age:26, dist:'2 mi', emoji:'😊', compat:94, bio:'Coffee lover · Traveler · Dog mom',      tags:['Music','Travel','Yoga'],    color:'#6366f1,#ec4899' },
  { id:2, name:'Sofia Garcia', age:24, dist:'5 mi', emoji:'🎨', compat:88, bio:'Artist · Foodie · Adventure seeker',    tags:['Art','Food','Hiking'],       color:'#f59e0b,#ef4444' },
  { id:3, name:'Mia Johnson',  age:28, dist:'1 mi', emoji:'🚀', compat:76, bio:'Startup founder · Book reader',          tags:['Tech','Books','Fitness'],    color:'#10b981,#3b82f6' },
  { id:4, name:'Zoe Chen',     age:25, dist:'3 mi', emoji:'🌸', compat:91, bio:'Photographer · Nature lover · Yogi',    tags:['Photography','Nature','Zen'],color:'#8b5cf6,#ec4899' },
  { id:5, name:'Ava Martinez', age:27, dist:'7 mi', emoji:'🎭', compat:82, bio:'Theater nerd · Cook · Cat person',       tags:['Theater','Cooking','Cats'],  color:'#14b8a6,#6366f1' },
];

const MATCHES = [
  { name:'Jordan', emoji:'🔥', color:'#ec4899' },
  { name:'Alex',   emoji:'🎵', color:'#10b981' },
  { name:'Riley',  emoji:'✈️', color:'#f59e0b' },
  { name:'Sam',    emoji:'🎮', color:'#3b82f6' },
  { name:'Morgan', emoji:'🌊', color:'#8b5cf6' },
];

const FILTERS = ['Nearby','Age 20–30','Interests','Verified','Online'];

export default function DatingPage() {
  const showToast = useAppStore((s) => s.showToast);
  const [cardIdx, setCardIdx]       = useState(0);
  const [activeFilter, setFilter]   = useState('Nearby');
  const [dragging, setDragging]     = useState(false);
  const [dragX, setDragX]           = useState(0);

  const total   = PROFILES.length;
  const current = PROFILES[cardIdx % total];
  const next1   = PROFILES[(cardIdx + 1) % total];
  const next2   = PROFILES[(cardIdx + 2) % total];

  const advance = (action) => {
    const msgs = { pass:`Passed on ${current.name}`, like:`💚 Liked ${current.name}!`, super:`⭐ Super Liked ${current.name}!` };
    showToast(msgs[action]);
    setCardIdx(i => i + 1);
    setDragX(0);
  };

  /* drag-to-swipe (touch/mouse) */
  const onMouseDown = (e) => { setDragging(true); setDragX(0); };
  const onMouseMove = (e) => { if (dragging) setDragX(prev => prev + e.movementX); };
  const onMouseUp   = () => {
    if      (dragX >  80) advance('like');
    else if (dragX < -80) advance('pass');
    setDragging(false); setDragX(0);
  };

  const compatColor = (c) => c >= 90 ? '#10b981' : c >= 75 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ background:'#0a0f1e', minHeight:'100vh', paddingBottom:'90px', userSelect:'none' }}>

      {/* ── Header ── */}
      <div style={{ padding:'14px 16px 10px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize:'22px', fontWeight:800, background:'linear-gradient(135deg,#ec4899,#6366f1)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
          💕 Dating
        </span>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => showToast('Preferences')} style={{ background:'rgba(255,255,255,0.07)', border:'1px solid #334155', borderRadius:10, padding:'6px 12px', color:'#94a3b8', fontSize:13, cursor:'pointer', fontWeight:600 }}>⚙️ Prefs</button>
          <button onClick={() => showToast('Edit profile')} style={{ background:'rgba(236,72,153,0.15)', border:'1px solid rgba(236,72,153,0.3)', borderRadius:10, padding:'6px 12px', color:'#ec4899', fontSize:13, cursor:'pointer', fontWeight:600 }}>✏️ Edit</button>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div style={{ display:'flex', gap:6, padding:'0 16px 12px', overflowX:'auto' }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            flexShrink:0, padding:'6px 14px', borderRadius:20, fontSize:12, fontWeight:700,
            background: activeFilter===f ? 'linear-gradient(135deg,#ec4899,#6366f1)' : 'rgba(255,255,255,0.06)',
            color: activeFilter===f ? 'white' : '#64748b',
            border: activeFilter===f ? 'none' : '1px solid #1e293b', cursor:'pointer',
          }}>{f}</button>
        ))}
      </div>

      {/* ── Card Stack ── */}
      <div style={{ position:'relative', height:'440px', margin:'0 16px 16px' }}>

        {/* Card 3 (back — barely visible) */}
        <div style={{ position:'absolute', inset:0, transform:'scale(0.88) translateY(28px)', zIndex:1,
          background:`linear-gradient(160deg,#${next2.color.split(',')[0].replace('#','')},#${next2.color.split(',')[1].replace('#','')})`,
          borderRadius:28, opacity:0.35 }} />

        {/* Card 2 (middle) */}
        <div style={{ position:'absolute', inset:0, transform:'scale(0.94) translateY(14px)', zIndex:2,
          background:`linear-gradient(160deg,${next1.color.split(',')[0]},${next1.color.split(',')[1]})`,
          borderRadius:28, opacity:0.6 }} />

        {/* Card 1 — TOP (draggable) */}
        <div
          style={{
            position:'absolute', inset:0, zIndex:3, borderRadius:28, overflow:'hidden',
            background:`linear-gradient(160deg,${current.color.split(',')[0]},${current.color.split(',')[1]})`,
            cursor: dragging ? 'grabbing' : 'grab',
            transform:`translateX(${dragX}px) rotate(${dragX * 0.04}deg)`,
            transition: dragging ? 'none' : 'transform 0.3s ease',
            boxShadow:'0 20px 60px rgba(0,0,0,0.5)',
          }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchStart={(e) => { setDragging(true); }}
          onTouchEnd={() => onMouseUp()}
        >
          {/* Swipe hint overlays */}
          {dragX >  30 && <div style={{ position:'absolute', inset:0, background:'rgba(16,185,129,0.25)', borderRadius:28, display:'flex', alignItems:'center', justifyContent:'center', fontSize:72, zIndex:10 }}>💚</div>}
          {dragX < -30 && <div style={{ position:'absolute', inset:0, background:'rgba(239,68,68,0.25)', borderRadius:28, display:'flex', alignItems:'center', justifyContent:'center', fontSize:72, zIndex:10 }}>✕</div>}

          {/* Photo area */}
          <div style={{ height:'72%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:90, position:'relative' }}>
            {current.emoji}
            {/* Card counter */}
            <div style={{ position:'absolute', top:14, right:14, background:'rgba(0,0,0,0.4)', borderRadius:20, padding:'3px 10px', color:'white', fontSize:11, fontWeight:700 }}>
              {(cardIdx % total) + 1} / {total}
            </div>
            {/* Compatibility badge */}
            <div style={{ position:'absolute', top:14, left:14, background:'rgba(0,0,0,0.45)', borderRadius:20, padding:'4px 10px', display:'flex', alignItems:'center', gap:5 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:compatColor(current.compat) }} />
              <span style={{ color:'white', fontSize:12, fontWeight:800 }}>{current.compat}% match</span>
            </div>
          </div>

          {/* Profile info */}
          <div style={{ padding:'14px 18px', background:'rgba(0,0,0,0.45)' }}>
            <div style={{ display:'flex', alignItems:'baseline', gap:10, marginBottom:4 }}>
              <span style={{ fontWeight:900, color:'white', fontSize:22 }}>{current.name}</span>
              <span style={{ color:'rgba(255,255,255,0.75)', fontSize:16 }}>{current.age}</span>
              <span style={{ color:'rgba(255,255,255,0.55)', fontSize:13, marginLeft:'auto' }}>📍 {current.dist}</span>
            </div>
            <p style={{ color:'rgba(255,255,255,0.8)', fontSize:13, margin:'0 0 8px', lineHeight:1.4 }}>{current.bio}</p>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {current.tags.map(t => (
                <span key={t} style={{ background:'rgba(255,255,255,0.18)', color:'white', fontSize:11, fontWeight:700, borderRadius:20, padding:'3px 10px' }}>#{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Action Row ── */}
      <div style={{ display:'flex', gap:20, justifyContent:'center', alignItems:'center', padding:'0 32px', marginBottom:20 }}>
        <button onClick={() => advance('pass')} style={{ width:64, height:64, borderRadius:'50%', background:'rgba(239,68,68,0.15)', border:'2.5px solid #ef4444', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, cursor:'pointer' }}>✕</button>
        <button onClick={() => advance('super')} style={{ width:52, height:52, borderRadius:'50%', background:'rgba(245,158,11,0.15)', border:'2px solid #f59e0b', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, cursor:'pointer' }}>⭐</button>
        <button onClick={() => advance('like')} style={{ width:64, height:64, borderRadius:'50%', background:'rgba(16,185,129,0.15)', border:'2.5px solid #10b981', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, cursor:'pointer' }}>❤️</button>
      </div>
      <p style={{ textAlign:'center', color:'#334155', fontSize:11, marginBottom:16 }}>← Swipe or tap · ✕ Pass · ⭐ Super Like · ❤️ Like</p>

      {/* ── Matches Bottom Sheet ── */}
      <div style={{ background:'rgba(255,255,255,0.04)', borderTop:'1px solid #1e293b', padding:'14px 16px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
          <span style={{ fontSize:15, fontWeight:700, color:'#f1f5f9' }}>💌 Your Matches</span>
          <span style={{ fontSize:12, color:'#6366f1', fontWeight:600, cursor:'pointer' }} onClick={() => showToast('All matches')}>See all →</span>
        </div>
        <div style={{ display:'flex', gap:12, overflowX:'auto', paddingBottom:4 }}>
          {MATCHES.map(m => (
            <div key={m.name} style={{ flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center', gap:6, cursor:'pointer' }} onClick={() => showToast(`Chat with ${m.name}`)}>
              <div style={{ width:56, height:56, borderRadius:'50%', background:m.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, border:'2px solid rgba(99,102,241,0.5)' }}>{m.emoji}</div>
              <span style={{ fontSize:11, color:'#94a3b8', fontWeight:600 }}>{m.name}</span>
            </div>
          ))}
          <div style={{ flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center', gap:6, cursor:'pointer' }} onClick={() => showToast('View all matches')}>
            <div style={{ width:56, height:56, borderRadius:'50%', background:'rgba(99,102,241,0.15)', border:'2px dashed #6366f1', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>+</div>
            <span style={{ fontSize:11, color:'#6366f1', fontWeight:600 }}>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
