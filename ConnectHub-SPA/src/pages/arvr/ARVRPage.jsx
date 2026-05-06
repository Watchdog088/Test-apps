import React, { useState } from 'react';
const AR_FILTERS = [
  { id:1, name:'Neon Glow', emoji:'✨', color:'#ec4899', popular:true },
  { id:2, name:'Space Helmet', emoji:'🚀', color:'#6366f1', popular:true },
  { id:3, name:'Nature Crown', emoji:'🌿', color:'#10b981', popular:false },
  { id:4, name:'Retro Vibes', emoji:'🕶️', color:'#f59e0b', popular:false },
  { id:5, name:'Digital World', emoji:'💻', color:'#3b82f6', popular:true },
  { id:6, name:'Fire Mode', emoji:'🔥', color:'#ef4444', popular:false },
];
const VR_WORLDS = [
  { id:1, name:'Virtual Concert', emoji:'🎵', color:'linear-gradient(135deg,#ec4899,#8b5cf6)', users:'8.2K' },
  { id:2, name:'Space Station', emoji:'🚀', color:'linear-gradient(135deg,#1e293b,#6366f1)', users:'3.1K' },
  { id:3, name:'Beach Paradise', emoji:'🏖️', color:'linear-gradient(135deg,#f59e0b,#10b981)', users:'5.6K' },
];
export default function ARVRPage() {
  const [tab, setTab] = useState('AR Filters');
  const [active, setActive] = useState(null);
  return (
    <div style={{ background:'#0f172a', minHeight:'100vh', paddingBottom:'80px' }}>
      <div style={{ padding:'16px', borderBottom:'1px solid #1e293b' }}>
        <span style={{ fontSize:'20px', fontWeight:700, color:'#f1f5f9' }}>🥽 AR / VR</span>
      </div>
      <div style={{ display:'flex', borderBottom:'1px solid #1e293b' }}>
        {['AR Filters','VR Worlds'].map(t => (
          <div key={t} style={{ flex:1, padding:'12px', textAlign:'center', fontSize:'14px', fontWeight:tab===t?700:500, color:tab===t?'#8b5cf6':'#64748b', borderBottom:tab===t?'2px solid #8b5cf6':'2px solid transparent', cursor:'pointer' }} onClick={() => setTab(t)}>{t}</div>
        ))}
      </div>
      <div style={{ padding:'16px' }}>
        {tab === 'AR Filters' ? (
          <>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px' }}>
              {AR_FILTERS.map(f => (
                <div key={f.id} onClick={() => setActive(active===f.id?null:f.id)} style={{ background:active===f.id?f.color:'#1e293b', borderRadius:'16px', padding:'16px 12px', display:'flex', flexDirection:'column', alignItems:'center', gap:'8px', cursor:'pointer', border:active===f.id?'2px solid white':'2px solid transparent', transition:'all 0.2s' }}>
                  <div style={{ fontSize:'32px' }}>{f.emoji}</div>
                  <div style={{ color:'white', fontWeight:600, fontSize:'12px', textAlign:'center' }}>{f.name}</div>
                  {f.popular && <div style={{ background:'#ef4444', color:'white', fontSize:'9px', fontWeight:700, borderRadius:'6px', padding:'1px 6px' }}>POPULAR</div>}
                </div>
              ))}
            </div>
            {active && <div style={{ marginTop:'16px', padding:'16px', background:'linear-gradient(135deg,#1e293b,#334155)', borderRadius:'16px', textAlign:'center' }}>
              <div style={{ fontSize:'48px' }}>{AR_FILTERS.find(f=>f.id===active)?.emoji}</div>
              <div style={{ color:'#f1f5f9', fontWeight:700, marginTop:'8px' }}>{AR_FILTERS.find(f=>f.id===active)?.name} Active!</div>
              <button style={{ marginTop:'12px', background:'linear-gradient(135deg,#8b5cf6,#6366f1)', color:'white', border:'none', borderRadius:'20px', padding:'10px 24px', fontWeight:600, cursor:'pointer' }}>Apply Filter</button>
            </div>}
          </>
        ) : (
          <>
            {VR_WORLDS.map(w => (
              <div key={w.id} style={{ borderRadius:'20px', background:w.color, padding:'24px', marginBottom:'14px', cursor:'pointer' }}>
                <div style={{ fontSize:'40px' }}>{w.emoji}</div>
                <div style={{ fontWeight:800, color:'white', fontSize:'20px', marginTop:'8px' }}>{w.name}</div>
                <div style={{ color:'rgba(255,255,255,0.7)', fontSize:'13px', marginTop:'4px' }}>👥 {w.users} users inside</div>
                <button style={{ marginTop:'16px', background:'white', color:'#6366f1', border:'none', borderRadius:'20px', padding:'10px 24px', fontWeight:700, cursor:'pointer' }}>Enter World</button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}