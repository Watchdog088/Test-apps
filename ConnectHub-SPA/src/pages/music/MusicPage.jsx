import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [tab, setTab] = useState('Discover');
  const [playing, setPlaying] = useState(null);
  const [liked, setLiked] = useState({});
  return (
    <div style={{ background:'#0f172a', minHeight:'100vh', paddingBottom:'80px' }}>
      <div style={{ padding:'16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize:'20px', fontWeight:700, color:'#f1f5f9' }}>🎵 Music</span>
        <span style={{ fontSize:'20px', cursor:'pointer' }} onClick={() => navigate('/search')} title="Search music">🔍</span>
      </div>

      {/* ── Podcasts banner ── */}
      <div
        onClick={() => navigate('/music/podcasts')}
        style={{
          margin:'12px 16px 0',
          borderRadius:16,
          background:'linear-gradient(135deg,#6366f1 0%,#ec4899 100%)',
          padding:'14px 16px',
          display:'flex', alignItems:'center', gap:14, cursor:'pointer',
          boxShadow:'0 4px 24px rgba(99,102,241,0.35)',
        }}
      >
        <div style={{ fontSize:32, lineHeight:1, flexShrink:0 }}>🎙️</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontWeight:800, fontSize:16, color:'white', letterSpacing:'-0.3px' }}>Podcasts</div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,0.8)', marginTop:2 }}>
            4M+ shows · Free · No sign-up needed
          </div>
        </div>
        <div style={{ color:'rgba(255,255,255,0.7)', fontSize:20 }}>›</div>
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
              <div key={pl.name} onClick={() => navigate('/music/playlist/' + pl.name.toLowerCase().replace(/\s+/g, '-'))} style={{ borderRadius:'16px', background:pl.color, padding:'20px 16px', cursor:'pointer' }}>
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
                  <span style={{ fontSize:'22px', cursor:'pointer' }} onClick={() => setPlaying(p => { const i = TRACKS.findIndex(t=>t.id===p); return TRACKS[(i-1+TRACKS.length)%TRACKS.length].id; })}>⏮</span>
                  <span style={{ fontSize:'22px', cursor:'pointer' }} onClick={() => setPlaying(null)}>⏸</span>
                  <span style={{ fontSize:'22px', cursor:'pointer' }} onClick={() => setPlaying(p => { const i = TRACKS.findIndex(t=>t.id===p); return TRACKS[(i+1)%TRACKS.length].id; })}>⏭</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}