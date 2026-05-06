import React, { useState } from 'react';
const CONTACTS = [
  { id:1, name:'Jordan Maxwell', handle:'@jordanmax', emoji:'🎵', color:'#ec4899', online:true },
  { id:2, name:'Alex Chen', handle:'@alexchen', emoji:'✈️', color:'#6366f1', online:true },
  { id:3, name:'Riley Johnson', handle:'@riley.j', emoji:'💪', color:'#10b981', online:false },
  { id:4, name:'Sam Rivera', handle:'@samrivera', emoji:'🍕', color:'#f59e0b', online:true },
  { id:5, name:'Morgan Taylor', handle:'@morgantaylor', emoji:'🎨', color:'#8b5cf6', online:false },
];
export default function VideoCallsPage() {
  const [calling, setCalling] = useState(null);
  const [tab, setTab] = useState('Contacts');
  if (calling) return (
    <div style={{ background:'#0f172a', minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'20px' }}>
      <div style={{ width:'100px', height:'100px', borderRadius:'50%', background:CONTACTS.find(c=>c.id===calling)?.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'48px' }}>{CONTACTS.find(c=>c.id===calling)?.emoji}</div>
      <div style={{ fontSize:'24px', fontWeight:800, color:'#f1f5f9' }}>{CONTACTS.find(c=>c.id===calling)?.name}</div>
      <div style={{ color:'#64748b' }}>Calling...</div>
      <div style={{ display:'flex', gap:'24px', marginTop:'20px' }}>
        <button style={{ width:'64px', height:'64px', borderRadius:'50%', background:'#1e293b', border:'none', fontSize:'24px', cursor:'pointer' }}>🔇</button>
        <button onClick={() => setCalling(null)} style={{ width:'72px', height:'72px', borderRadius:'50%', background:'#ef4444', border:'none', fontSize:'24px', cursor:'pointer' }}>📵</button>
        <button style={{ width:'64px', height:'64px', borderRadius:'50%', background:'#1e293b', border:'none', fontSize:'24px', cursor:'pointer' }}>📷</button>
      </div>
    </div>
  );
  return (
    <div style={{ background:'#0f172a', minHeight:'100vh', paddingBottom:'80px' }}>
      <div style={{ padding:'16px', borderBottom:'1px solid #1e293b' }}>
        <span style={{ fontSize:'20px', fontWeight:700, color:'#f1f5f9' }}>📹 Video Calls</span>
      </div>
      <div style={{ display:'flex', borderBottom:'1px solid #1e293b' }}>
        {['Contacts','Recent','Groups'].map(t => (
          <div key={t} style={{ flex:1, padding:'12px', textAlign:'center', fontSize:'14px', fontWeight:tab===t?700:500, color:tab===t?'#6366f1':'#64748b', borderBottom:tab===t?'2px solid #6366f1':'2px solid transparent', cursor:'pointer' }} onClick={() => setTab(t)}>{t}</div>
        ))}
      </div>
      <div style={{ padding:'16px' }}>
        {CONTACTS.map(c => (
          <div key={c.id} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px', background:'#1e293b', borderRadius:'16px', marginBottom:'10px' }}>
            <div style={{ position:'relative' }}>
              <div style={{ width:'48px', height:'48px', borderRadius:'50%', background:c.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px' }}>{c.emoji}</div>
              {c.online && <div style={{ position:'absolute', bottom:1, right:1, width:'11px', height:'11px', borderRadius:'50%', background:'#10b981', border:'2px solid #1e293b' }} />}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, color:'#f1f5f9', fontSize:'14px' }}>{c.name}</div>
              <div style={{ color:'#64748b', fontSize:'12px' }}>{c.online ? '🟢 Online' : 'Offline'}</div>
            </div>
            <div style={{ display:'flex', gap:'8px' }}>
              <button style={{ background:'#0f172a', border:'1px solid #334155', borderRadius:'50%', width:'40px', height:'40px', fontSize:'18px', cursor:'pointer' }}>📞</button>
              <button onClick={() => setCalling(c.id)} style={{ background:'linear-gradient(135deg,#6366f1,#3b82f6)', border:'none', borderRadius:'50%', width:'40px', height:'40px', fontSize:'18px', cursor:'pointer' }}>📹</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}