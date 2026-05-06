import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SAVED = [
  { id:1, type:'post', title:'Amazing sunset photography tips 📸', user:'Alex Chen', time:'2h ago', emoji:'🌅', color:'#f59e0b', category:'Photography' },
  { id:2, type:'video', title:'Top 10 Music Production Techniques', user:'Jordan M.', time:'1d ago', emoji:'🎵', color:'#ec4899', category:'Music' },
  { id:3, type:'article', title:'How to Start Your Fitness Journey', user:'Riley J.', time:'3d ago', emoji:'💪', color:'#10b981', category:'Fitness' },
  { id:4, type:'recipe', title:'Best Homemade Pizza Recipe 🍕', user:'Sam Rivera', time:'5d ago', emoji:'🍕', color:'#ef4444', category:'Food' },
  { id:5, type:'post', title:'Travel Guide: Paris on a Budget ✈️', user:'Morgan T.', time:'1w ago', emoji:'✈️', color:'#6366f1', category:'Travel' },
  { id:6, type:'video', title:'AR/VR Trends in 2026 🥽', user:'Tech Weekly', time:'2w ago', emoji:'🥽', color:'#8b5cf6', category:'Tech' },
];

const CATS = ['All','Posts','Videos','Articles','Food','Music'];

export default function SavedPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [saved, setSaved] = useState(SAVED.reduce((a,s) => ({ ...a, [s.id]: true }), {}));

  const filtered = filter === 'All' ? SAVED : SAVED.filter(s => {
    if (filter === 'Posts') return s.type === 'post';
    if (filter === 'Videos') return s.type === 'video';
    if (filter === 'Articles') return s.type === 'article';
    return s.category === filter;
  });

  const unsave = (id) => setSaved(p => ({ ...p, [id]: false }));

  return (
    <div style={{ background:'#0f172a', minHeight:'100vh', paddingBottom:'80px' }}>
      <div style={{ padding:'16px', borderBottom:'1px solid #1e293b' }}>
        <span style={{ fontSize:'20px', fontWeight:700, color:'#f1f5f9' }}>🔖 Saved</span>
      </div>

      <div style={{ display:'flex', gap:'8px', padding:'12px 16px', overflowX:'auto' }}>
        {CATS.map(c => (
          <span key={c} onClick={() => setFilter(c)} style={{ background:filter===c?'#6366f1':'#1e293b', color:filter===c?'white':'#94a3b8', padding:'6px 14px', borderRadius:'20px', fontSize:'13px', fontWeight:filter===c?700:500, cursor:'pointer', whiteSpace:'nowrap' }}>{c}</span>
        ))}
      </div>

      <div style={{ padding:'0 16px' }}>
        {filtered.filter(s => saved[s.id]).map(s => (
          <div key={s.id} style={{ display:'flex', alignItems:'center', gap:'14px', padding:'14px', background:'#1e293b', borderRadius:'16px', marginBottom:'10px', cursor:'pointer' }} onClick={() => navigate('/feed')}>
            <div style={{ width:'56px', height:'56px', borderRadius:'12px', background:s.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'26px', flexShrink:0 }}>{s.emoji}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, color:'#f1f5f9', fontSize:'14px', lineHeight:'1.3' }}>{s.title}</div>
              <div style={{ color:'#64748b', fontSize:'12px', marginTop:'4px' }}>{s.user} · {s.time}</div>
              <span style={{ background:'#0f172a', color:'#6366f1', fontSize:'11px', padding:'2px 8px', borderRadius:'8px', marginTop:'4px', display:'inline-block' }}>{s.category}</span>
            </div>
            <button onClick={e => { e.stopPropagation(); unsave(s.id); }} style={{ background:'none', border:'none', fontSize:'20px', cursor:'pointer', color:'#6366f1', flexShrink:0 }}>🔖</button>
          </div>
        ))}
        {filtered.filter(s => saved[s.id]).length === 0 && (
          <div style={{ textAlign:'center', padding:'60px 0' }}>
            <div style={{ fontSize:'48px' }}>🔖</div>
            <div style={{ color:'#f1f5f9', fontWeight:700, marginTop:'12px' }}>Nothing saved here</div>
            <div style={{ color:'#64748b', fontSize:'14px', marginTop:'8px' }}>Save posts to see them later</div>
          </div>
        )}
      </div>
    </div>
  );
}
