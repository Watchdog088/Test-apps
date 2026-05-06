import React, { useState } from 'react';
const METRICS = [
  { label:'Followers', value:'12.4K', icon:'👥', change:'+8%', up:true },
  { label:'Revenue', value:'$4,280', icon:'💰', change:'+23%', up:true },
  { label:'Reach', value:'89.2K', icon:'📡', change:'+12%', up:true },
  { label:'Engagement', value:'6.8%', icon:'❤️', change:'-2%', up:false },
];
const POSTS = [
  { id:1, title:'New product launch announcement', likes:892, views:'12K', emoji:'🚀' },
  { id:2, title:'Behind the scenes video', likes:1240, views:'24K', emoji:'🎬' },
  { id:3, title:'Customer testimonial spotlight', likes:456, views:'8K', emoji:'⭐' },
];
export default function BusinessPage() {
  const [tab, setTab] = useState('Dashboard');
  return (
    <div style={{ background:'#0f172a', minHeight:'100vh', paddingBottom:'80px' }}>
      <div style={{ padding:'16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize:'20px', fontWeight:700, color:'#f1f5f9' }}>💼 Business</span>
        <button style={{ background:'linear-gradient(135deg,#6366f1,#ec4899)', color:'white', border:'none', borderRadius:'20px', padding:'7px 14px', fontSize:'12px', fontWeight:600, cursor:'pointer' }}>+ Create Ad</button>
      </div>
      <div style={{ display:'flex', borderBottom:'1px solid #1e293b', overflowX:'auto' }}>
        {['Dashboard','Analytics','Posts','Ads'].map(t => (
          <div key={t} style={{ padding:'12px 16px', fontSize:'13px', fontWeight:tab===t?700:500, color:tab===t?'#6366f1':'#64748b', borderBottom:tab===t?'2px solid #6366f1':'2px solid transparent', cursor:'pointer', whiteSpace:'nowrap' }} onClick={() => setTab(t)}>{t}</div>
        ))}
      </div>
      <div style={{ padding:'16px' }}>
        {(tab === 'Dashboard' || tab === 'Analytics') && (
          <>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'16px' }}>
              {METRICS.map(m => (
                <div key={m.label} style={{ background:'#1e293b', borderRadius:'16px', padding:'14px' }}>
                  <div style={{ fontSize:'24px', marginBottom:'6px' }}>{m.icon}</div>
                  <div style={{ fontWeight:800, color:'#f1f5f9', fontSize:'20px' }}>{m.value}</div>
                  <div style={{ color:'#94a3b8', fontSize:'12px' }}>{m.label}</div>
                  <div style={{ color:m.up?'#10b981':'#ef4444', fontSize:'12px', fontWeight:700, marginTop:'4px' }}>{m.change} this week</div>
                </div>
              ))}
            </div>
          </>
        )}
        {(tab === 'Dashboard' || tab === 'Posts') && (
          <>
            <div style={{ fontSize:'15px', fontWeight:700, color:'#f1f5f9', marginBottom:'12px' }}>Top Posts</div>
            {POSTS.map(p => (
              <div key={p.id} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px', background:'#1e293b', borderRadius:'14px', marginBottom:'8px' }}>
                <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:'#0f172a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px' }}>{p.emoji}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, color:'#f1f5f9', fontSize:'13px' }}>{p.title}</div>
                  <div style={{ color:'#64748b', fontSize:'12px' }}>❤️ {p.likes} · 👁 {p.views}</div>
                </div>
              </div>
            ))}
          </>
        )}
        {tab === 'Ads' && (
          <div style={{ textAlign:'center', padding:'40px 24px', background:'#1e293b', borderRadius:'20px' }}>
            <div style={{ fontSize:'48px' }}>📣</div>
            <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'18px', marginTop:'12px' }}>No Active Ads</div>
            <div style={{ color:'#64748b', fontSize:'14px', marginTop:'8px' }}>Create your first ad campaign</div>
            <button style={{ marginTop:'16px', background:'linear-gradient(135deg,#6366f1,#ec4899)', color:'white', border:'none', borderRadius:'20px', padding:'12px 32px', fontWeight:700, cursor:'pointer' }}>Create Campaign</button>
          </div>
        )}
      </div>
    </div>
  );
}