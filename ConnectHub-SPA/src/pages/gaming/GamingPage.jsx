import React, { useState } from 'react';
const GAMES = [
  { id:1, title:'Battle Royale', emoji:'🎮', color:'#3b82f6', players:'2.4M', genre:'Action', hot:true },
  { id:2, title:'Racing League', emoji:'🏎️', color:'#f59e0b', players:'890K', genre:'Racing', hot:false },
  { id:3, title:'Puzzle Master', emoji:'🧩', color:'#8b5cf6', players:'1.2M', genre:'Puzzle', hot:true },
  { id:4, title:'Fantasy Quest', emoji:'⚔️', color:'#10b981', players:'3.1M', genre:'RPG', hot:true },
  { id:5, title:'Sports Stars', emoji:'⚽', color:'#ec4899', players:'4.5M', genre:'Sports', hot:false },
  { id:6, title:'Space Defense', emoji:'🚀', color:'#6366f1', players:'670K', genre:'Strategy', hot:false },
];
const FRIENDS_ONLINE = [
  { name:'Jordan', emoji:'🎵', color:'#ec4899', game:'Battle Royale' },
  { name:'Alex', emoji:'✈️', color:'#6366f1', game:'Fantasy Quest' },
  { name:'Riley', emoji:'💪', color:'#10b981', game:'Sports Stars' },
];
export default function GamingPage() {
  const [tab, setTab] = useState('Discover');
  const [playing, setPlaying] = useState({});
  return (
    <div style={{ background:'#0f172a', minHeight:'100vh', paddingBottom:'80px' }}>
      <div style={{ padding:'16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize:'20px', fontWeight:700, color:'#f1f5f9' }}>🎮 Gaming</span>
        <span style={{ fontSize:'18px' }}>🏆</span>
      </div>
      <div style={{ display:'flex', borderBottom:'1px solid #1e293b' }}>
        {['Discover','Friends','Leaderboard'].map(t => (
          <div key={t} style={{ flex:1, padding:'12px', textAlign:'center', fontSize:'14px', fontWeight:tab===t?700:500, color:tab===t?'#3b82f6':'#64748b', borderBottom:tab===t?'2px solid #3b82f6':'2px solid transparent', cursor:'pointer' }} onClick={() => setTab(t)}>{t}</div>
        ))}
      </div>
      <div style={{ padding:'16px' }}>
        {tab === 'Friends' ? (
          <>
            <div style={{ fontSize:'15px', fontWeight:700, color:'#f1f5f9', marginBottom:'12px' }}>Friends Online Now</div>
            {FRIENDS_ONLINE.map(f => (
              <div key={f.name} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px', background:'#1e293b', borderRadius:'16px', marginBottom:'10px' }}>
                <div style={{ width:'44px', height:'44px', borderRadius:'50%', background:f.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', position:'relative' }}>
                  {f.emoji}
                  <div style={{ position:'absolute', bottom:0, right:0, width:'10px', height:'10px', borderRadius:'50%', background:'#10b981', border:'2px solid #1e293b' }} />
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, color:'#f1f5f9' }}>{f.name}</div>
                  <div style={{ color:'#64748b', fontSize:'12px' }}>Playing {f.game}</div>
                </div>
                <button style={{ background:'linear-gradient(135deg,#3b82f6,#6366f1)', color:'white', border:'none', borderRadius:'20px', padding:'6px 14px', fontSize:'12px', fontWeight:600, cursor:'pointer' }}>Join</button>
              </div>
            ))}
          </>
        ) : tab === 'Leaderboard' ? (
          <>
            <div style={{ fontSize:'15px', fontWeight:700, color:'#f1f5f9', marginBottom:'12px' }}>🏆 Top Players</div>
            {['Jordan M. — 48,200 pts','Alex C. — 41,500 pts','Riley J. — 38,800 pts','You — 22,100 pts','Sam R. — 18,900 pts'].map((entry, i) => (
              <div key={entry} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px', background: i===3?'rgba(99,102,241,0.15)':'#1e293b', borderRadius:'14px', marginBottom:'8px', border:i===3?'1px solid #6366f1':'none' }}>
                <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:i<3?['#f59e0b','#94a3b8','#cd7c3b'][i]:'#334155', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, color:'white', fontSize:'14px' }}>{i+1}</div>
                <div style={{ flex:1, color:i===3?'#a5b4fc':'#f1f5f9', fontWeight:i===3?700:500 }}>{entry}</div>
              </div>
            ))}
          </>
        ) : (
          <>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
              {GAMES.map(g => (
                <div key={g.id} style={{ background:'#1e293b', borderRadius:'16px', padding:'16px', cursor:'pointer', position:'relative', overflow:'hidden' }}>
                  {g.hot && <div style={{ position:'absolute', top:'8px', right:'8px', background:'#ef4444', color:'white', fontSize:'9px', fontWeight:700, borderRadius:'6px', padding:'2px 6px' }}>HOT</div>}
                  <div style={{ fontSize:'32px', marginBottom:'8px' }}>{g.emoji}</div>
                  <div style={{ fontWeight:700, color:'#f1f5f9', fontSize:'14px' }}>{g.title}</div>
                  <div style={{ color:'#64748b', fontSize:'11px', marginTop:'4px' }}>{g.players} playing</div>
                  <button onClick={() => setPlaying(p => ({ ...p, [g.id]: !p[g.id] }))} style={{ marginTop:'10px', width:'100%', background:playing[g.id]?'#334155':'linear-gradient(135deg,#3b82f6,#6366f1)', color:'white', border:'none', borderRadius:'12px', padding:'8px', fontSize:'12px', fontWeight:600, cursor:'pointer' }}>
                    {playing[g.id] ? 'Playing ✓' : 'Play Now'}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}