import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TABS = ['All','Music','Videos','News','Sports','Tech'];

const TRENDING = [
  { id:1, rank:1, tag:'#LynkAppLaunch', posts:'245K', change:'+18%', hot:true, category:'All', emoji:'🚀', color:'#6366f1' },
  { id:2, rank:2, tag:'#MusicVibes2026', posts:'189K', change:'+12%', hot:true, category:'Music', emoji:'🎵', color:'#ec4899' },
  { id:3, rank:3, tag:'#TravelGoals', posts:'156K', change:'+9%', hot:false, category:'All', emoji:'✈️', color:'#f59e0b' },
  { id:4, rank:4, tag:'#GamingMoments', posts:'134K', change:'+21%', hot:true, category:'All', emoji:'🎮', color:'#3b82f6' },
  { id:5, rank:5, tag:'#FitnessFriday', posts:'98K', change:'+6%', hot:false, category:'Sports', emoji:'💪', color:'#10b981' },
  { id:6, rank:6, tag:'#TechNews2026', posts:'87K', change:'+14%', hot:true, category:'Tech', emoji:'💻', color:'#8b5cf6' },
  { id:7, rank:7, tag:'#ArtOfTheDay', posts:'72K', change:'+3%', hot:false, category:'All', emoji:'🎨', color:'#14b8a6' },
  { id:8, rank:8, tag:'#FoodieCulture', posts:'68K', change:'+8%', hot:false, category:'All', emoji:'🍕', color:'#ef4444' },
  { id:9, rank:9, tag:'#NewMusicFriday', posts:'61K', change:'+16%', hot:true, category:'Music', emoji:'🎤', color:'#ec4899' },
  { id:10, rank:10, tag:'#SportHighlights', posts:'54K', change:'+5%', hot:false, category:'Sports', emoji:'⚽', color:'#f59e0b' },
];

const CREATORS = [
  { id:1, name:'Jordan M.', handle:'@jordanmax', emoji:'🎵', followers:'124K', color:'#ec4899', trending:true },
  { id:2, name:'Alex Chen', handle:'@alexchen', emoji:'✈️', followers:'89K', color:'#6366f1', trending:true },
  { id:3, name:'Riley J.', handle:'@riley.j', emoji:'💪', followers:'221K', color:'#10b981', trending:false },
  { id:4, name:'Sam R.', handle:'@samrivera', emoji:'🍕', followers:'56K', color:'#f59e0b', trending:false },
];

export default function TrendingPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('All');
  const [following, setFollowing] = useState({});

  const filtered = tab === 'All' ? TRENDING : TRENDING.filter(t => t.category === tab);

  return (
    <div style={{ background:'#0f172a', minHeight:'100vh', paddingBottom:'80px' }}>
      <div style={{ padding:'16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize:'20px', fontWeight:700, color:'#f1f5f9' }}>🔥 Trending</span>
        <span style={{ fontSize:'18px', cursor:'pointer' }} onClick={() => navigate('/search')}>🔍</span>
      </div>

      <div style={{ display:'flex', borderBottom:'1px solid #1e293b', overflowX:'auto' }}>
        {TABS.map(t => (
          <div key={t} style={{ padding:'10px 16px', fontSize:'13px', fontWeight:tab===t?700:500, color:tab===t?'#6366f1':'#64748b', borderBottom:tab===t?'2px solid #6366f1':'2px solid transparent', cursor:'pointer', whiteSpace:'nowrap' }} onClick={() => setTab(t)}>{t}</div>
        ))}
      </div>

      {/* Trending Topics */}
      <div style={{ padding:'16px' }}>
        <div style={{ fontSize:'15px', fontWeight:700, color:'#f1f5f9', marginBottom:'12px' }}>Trending Topics</div>
        {filtered.map((t, i) => (
          <div key={t.id} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px', background:i%2===0?'transparent':'rgba(30,41,59,0.3)', borderRadius:'12px', marginBottom:'4px', cursor:'pointer' }} onClick={() => navigate('/search')}>
            <span style={{ fontSize:'22px', minWidth:'28px', textAlign:'center' }}>{t.emoji}</span>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <span style={{ fontWeight:700, color:'#f1f5f9', fontSize:'15px' }}>{t.tag}</span>
                {t.hot && <span style={{ background:'#ef4444', color:'white', fontSize:'10px', fontWeight:700, borderRadius:'8px', padding:'1px 6px' }}>HOT</span>}
              </div>
              <span style={{ color:'#64748b', fontSize:'12px' }}>{t.posts} posts · {t.change} this hour</span>
            </div>
            <span style={{ color:'#64748b', fontSize:'18px', fontWeight:700, minWidth:'24px', textAlign:'right' }}>#{t.rank}</span>
          </div>
        ))}
      </div>

      {/* Trending Creators */}
      {tab === 'All' && (
        <div style={{ padding:'0 16px 16px' }}>
          <div style={{ fontSize:'15px', fontWeight:700, color:'#f1f5f9', marginBottom:'12px' }}>Trending Creators</div>
          <div style={{ display:'flex', gap:'12px', overflowX:'auto' }}>
            {CREATORS.map(c => (
              <div key={c.id} style={{ background:'#1e293b', borderRadius:'16px', padding:'16px', minWidth:'140px', display:'flex', flexDirection:'column', alignItems:'center', gap:'8px', cursor:'pointer', flexShrink:0 }}>
                <div style={{ position:'relative' }}>
                  <div style={{ width:'56px', height:'56px', borderRadius:'50%', background:c.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'26px' }}>{c.emoji}</div>
                  {c.trending && <div style={{ position:'absolute', top:-4, right:-4, background:'#ef4444', color:'white', fontSize:'9px', fontWeight:700, borderRadius:'8px', padding:'2px 5px' }}>🔥</div>}
                </div>
                <div style={{ fontWeight:700, color:'#f1f5f9', fontSize:'13px', textAlign:'center' }}>{c.name}</div>
                <div style={{ color:'#64748b', fontSize:'11px' }}>{c.followers}</div>
                <button onClick={() => setFollowing(p => ({ ...p, [c.id]: !p[c.id] }))} style={{ background:following[c.id]?'#0f172a':'linear-gradient(135deg,#6366f1,#ec4899)', color:following[c.id]?'#94a3b8':'white', border:following[c.id]?'1px solid #334155':'none', borderRadius:'20px', padding:'5px 14px', fontSize:'11px', fontWeight:600, cursor:'pointer', width:'100%' }}>
                  {following[c.id]?'Following':'Follow'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
