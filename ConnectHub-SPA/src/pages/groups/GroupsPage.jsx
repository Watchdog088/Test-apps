import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MY_GROUPS = [
  { id:1, name:'Music Producers Hub', members:1240, emoji:'🎵', color:'#ec4899', unread:3, category:'Music' },
  { id:2, name:'Travel Photography', members:856, emoji:'📸', color:'#6366f1', unread:0, category:'Travel' },
  { id:3, name:'Gaming Squad', members:432, emoji:'🎮', color:'#3b82f6', unread:12, category:'Gaming' },
  { id:4, name:'Fitness & Wellness', members:2100, emoji:'💪', color:'#10b981', unread:0, category:'Health' },
];

const SUGGESTED = [
  { id:5, name:'Tech Entrepreneurs', members:5600, emoji:'💻', color:'#8b5cf6', category:'Tech', joined:false },
  { id:6, name:'Food & Recipes', members:8200, emoji:'🍕', color:'#f59e0b', category:'Food', joined:false },
  { id:7, name:'Art & Design', members:3100, emoji:'🎨', color:'#14b8a6', category:'Art', joined:false },
  { id:8, name:'Local Events NYC', members:9400, emoji:'🗽', color:'#ef4444', category:'Local', joined:false },
];

export default function GroupsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('My Groups');
  const [joined, setJoined] = useState({});

  return (
    <div style={{ background:'#0f172a', minHeight:'100vh', paddingBottom:'80px' }}>
      <div style={{ padding:'16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize:'20px', fontWeight:700, color:'#f1f5f9' }}>Groups</span>
        <button style={{ background:'linear-gradient(135deg,#6366f1,#ec4899)', color:'white', border:'none', borderRadius:'20px', padding:'8px 16px', fontSize:'13px', fontWeight:600, cursor:'pointer' }}>+ Create</button>
      </div>

      <div style={{ display:'flex', borderBottom:'1px solid #1e293b' }}>
        {['My Groups','Discover'].map(t => (
          <div key={t} style={{ flex:1, padding:'12px', textAlign:'center', fontSize:'14px', fontWeight:tab===t?700:500, color:tab===t?'#6366f1':'#64748b', borderBottom:tab===t?'2px solid #6366f1':'2px solid transparent', cursor:'pointer' }} onClick={() => setTab(t)}>{t}</div>
        ))}
      </div>

      <div style={{ padding:'16px' }}>
        {tab === 'My Groups' ? (
          <>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', background:'#1e293b', borderRadius:'12px', padding:'10px 14px', marginBottom:'16px' }}>
              <span>🔍</span>
              <input placeholder="Search your groups..." style={{ flex:1, background:'none', border:'none', outline:'none', color:'#f1f5f9', fontSize:'14px' }} />
            </div>
            {MY_GROUPS.map(g => (
              <div key={g.id} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'14px', background:'#1e293b', borderRadius:'16px', marginBottom:'10px', cursor:'pointer' }} onClick={() => navigate('/messages')}>
                <div style={{ width:'52px', height:'52px', borderRadius:'16px', background:g.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'26px', flexShrink:0 }}>{g.emoji}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, color:'#f1f5f9', fontSize:'15px' }}>{g.name}</div>
                  <div style={{ color:'#64748b', fontSize:'12px' }}>{g.members.toLocaleString()} members · {g.category}</div>
                </div>
                {g.unread > 0 && <div style={{ background:'#6366f1', color:'white', borderRadius:'12px', padding:'2px 8px', fontSize:'12px', fontWeight:700 }}>{g.unread}</div>}
              </div>
            ))}
          </>
        ) : (
          <>
            <div style={{ display:'flex', gap:'8px', marginBottom:'16px', overflowX:'auto' }}>
              {['All','Tech','Music','Food','Art','Local','Gaming'].map(c => (
                <span key={c} style={{ background:'#1e293b', color:'#94a3b8', padding:'6px 14px', borderRadius:'20px', fontSize:'13px', cursor:'pointer', whiteSpace:'nowrap' }}>{c}</span>
              ))}
            </div>
            {SUGGESTED.map(g => (
              <div key={g.id} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'14px', background:'#1e293b', borderRadius:'16px', marginBottom:'10px' }}>
                <div style={{ width:'52px', height:'52px', borderRadius:'16px', background:g.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'26px', flexShrink:0 }}>{g.emoji}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, color:'#f1f5f9', fontSize:'15px' }}>{g.name}</div>
                  <div style={{ color:'#64748b', fontSize:'12px' }}>{g.members.toLocaleString()} members</div>
                </div>
                <button onClick={() => setJoined(p => ({ ...p, [g.id]: !p[g.id] }))} style={{ background:joined[g.id]?'#0f172a':'linear-gradient(135deg,#6366f1,#ec4899)', color:joined[g.id]?'#94a3b8':'white', border:joined[g.id]?'1px solid #334155':'none', borderRadius:'20px', padding:'7px 14px', fontSize:'12px', fontWeight:600, cursor:'pointer' }}>
                  {joined[g.id]?'Joined':'Join'}
                </button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
