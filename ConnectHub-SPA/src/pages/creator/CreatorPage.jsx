import React, { useState } from 'react';
const STATS = [
  { label:'Subscribers', value:'48.2K', icon:'👥', color:'#6366f1' },
  { label:'Total Views', value:'2.1M', icon:'👁', color:'#ec4899' },
  { label:'Revenue', value:'$12,400', icon:'💰', color:'#10b981' },
  { label:'Watch Time', value:'94K hrs', icon:'⏱️', color:'#f59e0b' },
];
const CONTENT = [
  { id:1, title:'How I made $10K on LynkApp', views:'124K', likes:'8.2K', emoji:'💰' },
  { id:2, title:'My Creator Journey Story', views:'89K', likes:'5.6K', emoji:'🎬' },
  { id:3, title:'Top Tools for Content Creators', views:'67K', likes:'4.1K', emoji:'🛠️' },
];
export default function CreatorPage() {
  const [tab, setTab] = useState('Studio');
  return (
    <div style={{ background:'#0f172a', minHeight:'100vh', paddingBottom:'80px' }}>
      <div style={{ padding:'16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize:'20px', fontWeight:700, color:'#f1f5f9' }}>🎬 Creator Studio</span>
        <button style={{ background:'linear-gradient(135deg,#6366f1,#ec4899)', color:'white', border:'none', borderRadius:'20px', padding:'8px 16px', fontSize:'13px', fontWeight:600, cursor:'pointer' }}>+ Create</button>
      </div>
      <div style={{ display:'flex', borderBottom:'1px solid #1e293b' }}>
        {['Studio','Content','Earnings'].map(t => (
          <div key={t} style={{ flex:1, padding:'12px', textAlign:'center', fontSize:'14px', fontWeight:tab===t?700:500, color:tab===t?'#ec4899':'#64748b', borderBottom:tab===t?'2px solid #ec4899':'2px solid transparent', cursor:'pointer' }} onClick={() => setTab(t)}>{t}</div>
        ))}
      </div>
      <div style={{ padding:'16px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'16px' }}>
          {STATS.map(s => (
            <div key={s.label} style={{ background:'#1e293b', borderRadius:'16px', padding:'14px' }}>
              <div style={{ fontSize:'22px' }}>{s.icon}</div>
              <div style={{ fontWeight:800, color:s.color, fontSize:'20px', marginTop:'4px' }}>{s.value}</div>
              <div style={{ color:'#94a3b8', fontSize:'12px' }}>{s.label}</div>
            </div>
          ))}
        </div>
        {tab !== 'Earnings' && (
          <>
            <div style={{ fontSize:'15px', fontWeight:700, color:'#f1f5f9', marginBottom:'12px' }}>Top Content</div>
            {CONTENT.map(c => (
              <div key={c.id} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px', background:'#1e293b', borderRadius:'14px', marginBottom:'8px', cursor:'pointer' }}>
                <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:'#0f172a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px' }}>{c.emoji}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, color:'#f1f5f9', fontSize:'13px' }}>{c.title}</div>
                  <div style={{ color:'#64748b', fontSize:'12px' }}>👁 {c.views} · ❤️ {c.likes}</div>
                </div>
              </div>
            ))}
          </>
        )}
        {tab === 'Earnings' && (
          <div style={{ background:'linear-gradient(135deg,#10b981,#6366f1)', borderRadius:'20px', padding:'32px', textAlign:'center' }}>
            <div style={{ fontSize:'48px' }}>💰</div>
            <div style={{ color:'white', fontWeight:800, fontSize:'32px', marginTop:'8px' }}>$12,400</div>
            <div style={{ color:'rgba(255,255,255,0.7)', fontSize:'14px' }}>Total Earnings (May 2026)</div>
            <button style={{ marginTop:'20px', background:'white', color:'#10b981', border:'none', borderRadius:'20px', padding:'12px 32px', fontWeight:700, cursor:'pointer' }}>Withdraw</button>
          </div>
        )}
      </div>
    </div>
  );
}