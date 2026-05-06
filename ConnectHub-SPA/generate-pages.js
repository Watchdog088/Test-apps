const fs = require('fs');
const path = require('path');

const pages = {
  'gaming/GamingPage': `import React, { useState } from 'react';
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
}`,

  'marketplace/MarketplacePage': `import React, { useState } from 'react';
const ITEMS = [
  { id:1, title:'Vintage Vinyl Records Collection', price:'$45', seller:'Jordan M.', emoji:'🎵', color:'#ec4899', category:'Music', liked:false },
  { id:2, title:'Pro Camera Lens 50mm', price:'$299', seller:'Alex C.', emoji:'📸', color:'#6366f1', category:'Tech', liked:true },
  { id:3, title:'Fitness Equipment Bundle', price:'$120', seller:'Riley J.', emoji:'💪', color:'#10b981', category:'Fitness', liked:false },
  { id:4, title:'Handmade Ceramic Bowl Set', price:'$68', seller:'Morgan T.', emoji:'🏺', color:'#f59e0b', category:'Art', liked:false },
  { id:5, title:'Gaming Chair RGB', price:'$189', seller:'Casey L.', emoji:'🎮', color:'#3b82f6', category:'Gaming', liked:true },
  { id:6, title:'Cooking Masterclass Book', price:'$25', seller:'Sam R.', emoji:'📚', color:'#8b5cf6', category:'Food', liked:false },
];
const CATS = ['All','Music','Tech','Fitness','Art','Gaming','Food'];
export default function MarketplacePage() {
  const [filter, setFilter] = useState('All');
  const [liked, setLiked] = useState(ITEMS.reduce((a,i) => ({ ...a, [i.id]: i.liked }), {}));
  const filtered = filter === 'All' ? ITEMS : ITEMS.filter(i => i.category === filter);
  return (
    <div style={{ background:'#0f172a', minHeight:'100vh', paddingBottom:'80px' }}>
      <div style={{ padding:'16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize:'20px', fontWeight:700, color:'#f1f5f9' }}>🛒 Marketplace</span>
        <span style={{ fontSize:'20px', cursor:'pointer' }}>🔍</span>
      </div>
      <div style={{ display:'flex', gap:'8px', padding:'12px 16px', overflowX:'auto' }}>
        {CATS.map(c => <span key={c} onClick={() => setFilter(c)} style={{ background:filter===c?'#6366f1':'#1e293b', color:filter===c?'white':'#94a3b8', padding:'6px 14px', borderRadius:'20px', fontSize:'13px', fontWeight:filter===c?700:500, cursor:'pointer', whiteSpace:'nowrap' }}>{c}</span>)}
      </div>
      <div style={{ padding:'0 16px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
        {filtered.map(item => (
          <div key={item.id} style={{ background:'#1e293b', borderRadius:'16px', overflow:'hidden' }}>
            <div style={{ height:'100px', background:item.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'40px', position:'relative' }}>
              {item.emoji}
              <button onClick={() => setLiked(p => ({ ...p, [item.id]: !p[item.id] }))} style={{ position:'absolute', top:'8px', right:'8px', background:'rgba(0,0,0,0.4)', border:'none', borderRadius:'50%', width:'28px', height:'28px', cursor:'pointer', fontSize:'14px' }}>{liked[item.id] ? '❤️' : '🤍'}</button>
            </div>
            <div style={{ padding:'10px' }}>
              <div style={{ fontWeight:700, color:'#f1f5f9', fontSize:'12px', lineHeight:'1.3', marginBottom:'4px' }}>{item.title}</div>
              <div style={{ color:'#64748b', fontSize:'11px' }}>{item.seller}</div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'8px' }}>
                <span style={{ color:'#10b981', fontWeight:800, fontSize:'14px' }}>{item.price}</span>
                <button style={{ background:'linear-gradient(135deg,#6366f1,#ec4899)', color:'white', border:'none', borderRadius:'10px', padding:'5px 10px', fontSize:'11px', fontWeight:600, cursor:'pointer' }}>Buy</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`,

  'music/MusicPage': `import React, { useState } from 'react';
const TRACKS = [
  { id:1, title:'Summer Vibes', artist:'Jordan M.', duration:'3:24', emoji:'🎵', color:'#ec4899', plays:'1.2M' },
  { id:2, title:'Midnight Drive', artist:'Alex Chen', duration:'4:12', emoji:'🌙', color:'#6366f1', plays:'890K' },
  { id:3, title:'Power Up', artist:'Riley J.', duration:'2:58', emoji:'💪', color:'#10b981', plays:'445K' },
  { id:4, title:'Sunset Boulevard', artist:'Sam R.', duration:'5:01', emoji:'🌅', color:'#f59e0b', plays:'2.1M' },
  { id:5, title:'Digital Dreams', artist:'Morgan T.', duration:'3:45', emoji:'💻', color:'#8b5cf6', plays:'670K' },
];
const PLAYLISTS = [
  { name:'Chill Vibes', count:24, emoji:'😌', color:'linear-gradient(135deg,#6366f1,#ec4899)' },
  { name:'Workout Mix', count:18, emoji:'💪', color:'linear-gradient(135deg,#10b981,#3b82f6)' },
  { name:'Party Time', count:32, emoji:'🎉', color:'linear-gradient(135deg,#f59e0b,#ef4444)' },
  { name:'Late Night', count:15, emoji:'🌙', color:'linear-gradient(135deg,#1e293b,#6366f1)' },
];
export default function MusicPage() {
  const [tab, setTab] = useState('Discover');
  const [playing, setPlaying] = useState(null);
  const [liked, setLiked] = useState({});
  return (
    <div style={{ background:'#0f172a', minHeight:'100vh', paddingBottom:'80px' }}>
      <div style={{ padding:'16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize:'20px', fontWeight:700, color:'#f1f5f9' }}>🎵 Music</span>
        <span style={{ fontSize:'20px' }}>🔍</span>
      </div>
      <div style={{ display:'flex', borderBottom:'1px solid #1e293b' }}>
        {['Discover','Playlists','Library'].map(t => (
          <div key={t} style={{ flex:1, padding:'12px', textAlign:'center', fontSize:'14px', fontWeight:tab===t?700:500, color:tab===t?'#ec4899':'#64748b', borderBottom:tab===t?'2px solid #ec4899':'2px solid transparent', cursor:'pointer' }} onClick={() => setTab(t)}>{t}</div>
        ))}
      </div>
      <div style={{ padding:'16px' }}>
        {tab === 'Playlists' ? (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
            {PLAYLISTS.map(pl => (
              <div key={pl.name} style={{ borderRadius:'16px', background:pl.color, padding:'20px 16px', cursor:'pointer' }}>
                <div style={{ fontSize:'32px' }}>{pl.emoji}</div>
                <div style={{ color:'white', fontWeight:700, fontSize:'15px', marginTop:'8px' }}>{pl.name}</div>
                <div style={{ color:'rgba(255,255,255,0.7)', fontSize:'12px' }}>{pl.count} songs</div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div style={{ fontSize:'15px', fontWeight:700, color:'#f1f5f9', marginBottom:'12px' }}>{tab === 'Library' ? 'My Library' : 'Trending Tracks'}</div>
            {TRACKS.map(tr => (
              <div key={tr.id} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px', background: playing===tr.id?'rgba(99,102,241,0.15)':'transparent', borderRadius:'14px', marginBottom:'4px', cursor:'pointer' }} onClick={() => setPlaying(playing===tr.id?null:tr.id)}>
                <div style={{ width:'48px', height:'48px', borderRadius:'12px', background:tr.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', flexShrink:0 }}>{playing===tr.id?'▶️':tr.emoji}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, color:playing===tr.id?'#a5b4fc':'#f1f5f9', fontSize:'14px' }}>{tr.title}</div>
                  <div style={{ color:'#64748b', fontSize:'12px' }}>{tr.artist} · {tr.plays} plays</div>
                </div>
                <span style={{ color:'#64748b', fontSize:'12px' }}>{tr.duration}</span>
                <button onClick={e => { e.stopPropagation(); setLiked(p => ({ ...p, [tr.id]: !p[tr.id] })); }} style={{ background:'none', border:'none', fontSize:'18px', cursor:'pointer' }}>{liked[tr.id]?'❤️':'🤍'}</button>
              </div>
            ))}
            {playing && (
              <div style={{ position:'fixed', bottom:'72px', left:0, right:0, background:'#1e293b', borderTop:'1px solid #334155', padding:'12px 16px', display:'flex', alignItems:'center', gap:'12px' }}>
                <div style={{ width:'40px', height:'40px', borderRadius:'10px', background:TRACKS.find(t=>t.id===playing)?.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px' }}>{TRACKS.find(t=>t.id===playing)?.emoji}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, color:'#f1f5f9', fontSize:'13px' }}>{TRACKS.find(t=>t.id===playing)?.title}</div>
                  <div style={{ color:'#64748b', fontSize:'11px' }}>{TRACKS.find(t=>t.id===playing)?.artist}</div>
                </div>
                <div style={{ display:'flex', gap:'12px' }}>
                  <span style={{ fontSize:'22px', cursor:'pointer' }}>⏮</span>
                  <span style={{ fontSize:'22px', cursor:'pointer' }} onClick={() => setPlaying(null)}>⏸</span>
                  <span style={{ fontSize:'22px', cursor:'pointer' }}>⏭</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}`,

  'live/LivePage': `import React, { useState } from 'react';
const STREAMS = [
  { id:1, title:'🎵 Live DJ Session - House Music Night', host:'Jordan M.', viewers:'4.2K', emoji:'🎵', color:'linear-gradient(135deg,#ec4899,#8b5cf6)', live:true },
  { id:2, title:'🎮 Gaming Tournament - Finals Round!', host:'Casey L.', viewers:'12.8K', emoji:'🎮', color:'linear-gradient(135deg,#3b82f6,#6366f1)', live:true },
  { id:3, title:'🍕 Cooking Show: Italian Night', host:'Sam R.', viewers:'1.9K', emoji:'🍕', color:'linear-gradient(135deg,#f59e0b,#ef4444)', live:true },
  { id:4, title:'💪 Morning Workout LIVE', host:'Riley J.', viewers:'3.1K', emoji:'💪', color:'linear-gradient(135deg,#10b981,#3b82f6)', live:true },
  { id:5, title:'📸 Photography Q&A', host:'Alex C.', viewers:'876', emoji:'📸', color:'linear-gradient(135deg,#6366f1,#14b8a6)', live:false },
];
export default function LivePage() {
  const [following, setFollowing] = useState({});
  const liveStreams = STREAMS.filter(s => s.live);
  return (
    <div style={{ background:'#0f172a', minHeight:'100vh', paddingBottom:'80px' }}>
      <div style={{ padding:'16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize:'20px', fontWeight:700, color:'#f1f5f9' }}>🔴 Live</span>
        <button style={{ background:'#ef4444', color:'white', border:'none', borderRadius:'20px', padding:'8px 16px', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>🔴 Go Live</button>
      </div>
      <div style={{ padding:'16px' }}>
        <div style={{ fontSize:'15px', fontWeight:700, color:'#f1f5f9', marginBottom:'12px' }}>Live Now ({liveStreams.length})</div>
        {STREAMS.map(s => (
          <div key={s.id} style={{ borderRadius:'20px', background:s.color, marginBottom:'14px', overflow:'hidden', cursor:'pointer', position:'relative' }}>
            <div style={{ padding:'20px' }}>
              {s.live && <div style={{ background:'#ef4444', color:'white', fontSize:'11px', fontWeight:700, borderRadius:'8px', padding:'2px 8px', display:'inline-block', marginBottom:'8px' }}>● LIVE</div>}
              <div style={{ fontSize:'28px', marginBottom:'6px' }}>{s.emoji}</div>
              <div style={{ fontWeight:800, color:'white', fontSize:'16px' }}>{s.title}</div>
              <div style={{ color:'rgba(255,255,255,0.7)', fontSize:'13px', marginTop:'4px' }}>by {s.host}</div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'12px' }}>
                <span style={{ color:'rgba(255,255,255,0.85)', fontSize:'13px' }}>👁 {s.viewers} watching</span>
                <button onClick={() => setFollowing(p => ({ ...p, [s.id]: !p[s.id] }))} style={{ background:following[s.id]?'rgba(255,255,255,0.2)':'white', color:following[s.id]?'white':'#6366f1', border:'none', borderRadius:'16px', padding:'7px 16px', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>
                  {following[s.id] ? 'Following' : 'Watch'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`,

  'videocalls/VideoCallsPage': `import React, { useState } from 'react';
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
}`,

  'mediahub/MediaHubPage': `import React, { useState } from 'react';
const MEDIA = [
  { id:1, title:'Stunning City Views', type:'photo', emoji:'🏙️', color:'#6366f1', likes:'2.4K', views:'18K' },
  { id:2, title:'Beach Sunset Timelapse', type:'video', emoji:'🌅', color:'#f59e0b', likes:'5.1K', views:'42K' },
  { id:3, title:'Street Photography Series', type:'photo', emoji:'📸', color:'#ec4899', likes:'1.8K', views:'12K' },
  { id:4, title:'Cooking Tutorial 4K', type:'video', emoji:'🍕', color:'#ef4444', likes:'3.2K', views:'28K' },
  { id:5, title:'Nature Documentary Short', type:'video', emoji:'🌿', color:'#10b981', likes:'7.8K', views:'65K' },
  { id:6, title:'Abstract Digital Art', type:'photo', emoji:'🎨', color:'#8b5cf6', likes:'920', views:'8K' },
];
const CATS = ['All','Photos','Videos','Reels'];
export default function MediaHubPage() {
  const [filter, setFilter] = useState('All');
  const [liked, setLiked] = useState({});
  const filtered = filter === 'All' ? MEDIA : filter === 'Photos' ? MEDIA.filter(m=>m.type==='photo') : MEDIA.filter(m=>m.type==='video');
  return (
    <div style={{ background:'#0f172a', minHeight:'100vh', paddingBottom:'80px' }}>
      <div style={{ padding:'16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize:'20px', fontWeight:700, color:'#f1f5f9' }}>🎬 Media Hub</span>
        <span style={{ fontSize:'20px' }}>⬆️</span>
      </div>
      <div style={{ display:'flex', gap:'8px', padding:'12px 16px', overflowX:'auto' }}>
        {CATS.map(c => <span key={c} onClick={() => setFilter(c)} style={{ background:filter===c?'#6366f1':'#1e293b', color:filter===c?'white':'#94a3b8', padding:'6px 14px', borderRadius:'20px', fontSize:'13px', fontWeight:filter===c?700:500, cursor:'pointer', whiteSpace:'nowrap' }}>{c}</span>)}
      </div>
      <div style={{ padding:'0 16px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
        {filtered.map(m => (
          <div key={m.id} style={{ borderRadius:'16px', overflow:'hidden', cursor:'pointer', position:'relative' }}>
            <div style={{ height:'120px', background:m.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'36px', position:'relative' }}>
              {m.emoji}
              {m.type==='video' && <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.3)' }}><span style={{ fontSize:'28px' }}>▶️</span></div>}
            </div>
            <div style={{ background:'#1e293b', padding:'10px' }}>
              <div style={{ fontWeight:700, color:'#f1f5f9', fontSize:'12px' }}>{m.title}</div>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginTop:'6px' }}>
                <button onClick={() => setLiked(p => ({ ...p, [m.id]: !p[m.id] }))} style={{ background:'none', border:'none', fontSize:'14px', cursor:'pointer' }}>{liked[m.id]?'❤️':'🤍'} {m.likes}</button>
                <span style={{ color:'#64748b', fontSize:'11px' }}>👁 {m.views}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`,

  'arvr/ARVRPage': `import React, { useState } from 'react';
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
}`,

  'business/BusinessPage': `import React, { useState } from 'react';
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
}`,

  'creator/CreatorPage': `import React, { useState } from 'react';
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
}`,

  'help/HelpPage': `import React, { useState } from 'react';
const FAQS = [
  { q:'How do I reset my password?', a:'Go to Settings → Password & Security → Change Password. Enter your current password and new password.' },
  { q:'How do I go Live?', a:'Tap the Live tab → "Go Live" button. Set your title and privacy, then start streaming instantly.' },
  { q:'How does the Dating feature work?', a:'Browse profiles in Dating → Discover. Swipe right to like, left to pass. Matches can message each other.' },
  { q:'How do I earn as a Creator?', a:'Join Creator Studio, post quality content, and earn through tips, subscriptions, and brand deals.' },
  { q:'How do I report a user?', a:'Visit their profile → tap the three dots menu → Report. Our team reviews within 24 hours.' },
];
export default function HelpPage() {
  const [expanded, setExpanded] = useState(null);
  const [tab, setTab] = useState('FAQ');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  return (
    <div style={{ background:'#0f172a', minHeight:'100vh', paddingBottom:'80px' }}>
      <div style={{ padding:'16px', borderBottom:'1px solid #1e293b' }}>
        <span style={{ fontSize:'20px', fontWeight:700, color:'#f1f5f9' }}>❓ Help & Support</span>
      </div>
      <div style={{ display:'flex', borderBottom:'1px solid #1e293b' }}>
        {['FAQ','Contact','Report'].map(t => (
          <div key={t} style={{ flex:1, padding:'12px', textAlign:'center', fontSize:'14px', fontWeight:tab===t?700:500, color:tab===t?'#6366f1':'#64748b', borderBottom:tab===t?'2px solid #6366f1':'2px solid transparent', cursor:'pointer' }} onClick={() => setTab(t)}>{t}</div>
        ))}
      </div>
      <div style={{ padding:'16px' }}>
        {tab === 'FAQ' && (
          <>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', background:'#1e293b', borderRadius:'12px', padding:'10px 14px', marginBottom:'16px' }}>
              <span>🔍</span>
              <input placeholder="Search help articles..." style={{ flex:1, background:'none', border:'none', outline:'none', color:'#f1f5f9', fontSize:'14px' }} />
            </div>
            {FAQS.map((f, i) => (
              <div key={i} style={{ background:'#1e293b', borderRadius:'14px', marginBottom:'8px', overflow:'hidden' }}>
                <div style={{ padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer' }} onClick={() => setExpanded(expanded===i?null:i)}>
                  <span style={{ color:'#f1f5f9', fontWeight:600, fontSize:'14px', flex:1 }}>{f.q}</span>
                  <span style={{ color:'#6366f1', fontSize:'18px', transition:'transform 0.2s', transform: expanded===i?'rotate(180deg)':'none' }}>⌄</span>
                </div>
                {expanded===i && <div style={{ padding:'0 16px 14px', color:'#94a3b8', fontSize:'13px', lineHeight:'1.5' }}>{f.a}</div>}
              </div>
            ))}
          </>
        )}
        {tab === 'Contact' && (
          <div>
            <div style={{ background:'linear-gradient(135deg,#6366f1,#ec4899)', borderRadius:'20px', padding:'24px', textAlign:'center', marginBottom:'20px' }}>
              <div style={{ fontSize:'40px' }}>💬</div>
              <div style={{ color:'white', fontWeight:700, fontSize:'18px', marginTop:'8px' }}>Chat with Support</div>
              <div style={{ color:'rgba(255,255,255,0.7)', fontSize:'13px', marginTop:'4px' }}>Usually responds in &lt; 5 minutes</div>
            </div>
            {sent ? (
              <div style={{ textAlign:'center', padding:'24px', background:'#1e293b', borderRadius:'16px' }}>
                <div style={{ fontSize:'40px' }}>✅</div>
                <div style={{ color:'#f1f5f9', fontWeight:700, marginTop:'8px' }}>Message Sent!</div>
                <div style={{ color:'#64748b', fontSize:'13px' }}>We'll respond within 24 hours</div>
              </div>
            ) : (
              <>
                <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Describe your issue..." style={{ width:'100%', background:'#1e293b', border:'1px solid #334155', borderRadius:'14px', padding:'14px', color:'#f1f5f9', fontSize:'14px', minHeight:'120px', resize:'none', boxSizing:'border-box', outline:'none' }} />
                <button onClick={() => { if(message.trim()) setSent(true); }} style={{ width:'100%', background:'linear-gradient(135deg,#6366f1,#ec4899)', color:'white', border:'none', borderRadius:'14px', padding:'14px', fontSize:'15px', fontWeight:700, cursor:'pointer', marginTop:'12px' }}>Send Message</button>
              </>
            )}
          </div>
        )}
        {tab === 'Report' && (
          <div>
            {['🚨 Report a Bug','🔒 Report Privacy Issue','👤 Report a User','💬 Report Content','📋 Other Issue'].map(item => (
              <div key={item} style={{ display:'flex', alignItems:'center', gap:'14px', padding:'14px 16px', background:'#1e293b', borderRadius:'14px', marginBottom:'8px', cursor:'pointer' }}>
                <div style={{ flex:1, color:'#f1f5f9', fontWeight:600 }}>{item}</div>
                <span style={{ color:'#334155' }}>›</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}`,
};

const base = path.join(__dirname, 'src', 'pages');
let created = 0;

for (const [pagePath, content] of Object.entries(pages)) {
  const dir = path.join(base, path.dirname(pagePath));
  const file = path.join(base, pagePath + '.jsx');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, content, 'utf8');
  created++;
  console.log(`✅ Created: ${pagePath}.jsx`);
}

console.log(`\n🎉 Done! Created ${created} page files.`);
