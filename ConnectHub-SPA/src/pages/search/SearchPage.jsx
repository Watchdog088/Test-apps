// src/pages/search/SearchPage.jsx
// Rec #22/#4: Trending merged INTO Search/Explore as a tab (TikTok Discover style)

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const CATEGORIES = ['All','People','Posts','Groups','Events','Music','Videos'];

const TRENDING_HASHTAGS = [
  { tag:'#LynkApp',      posts:'2.4M',  color:'#6366f1' },
  { tag:'#MusicVibes',   posts:'1.8M',  color:'#ec4899' },
  { tag:'#TravelGoals',  posts:'5.1M',  color:'#3b82f6' },
  { tag:'#FoodiLife',    posts:'3.7M',  color:'#f59e0b' },
  { tag:'#Gaming2026',   posts:'12.0M', color:'#8b5cf6' },
  { tag:'#ArtOfTheDay',  posts:'890K',  color:'#14b8a6' },
  { tag:'#FitnessLife',  posts:'6.2M',  color:'#10b981' },
  { tag:'#Throwback',    posts:'4.5M',  color:'#ef4444' },
];

const TRENDING_POSTS = [
  { id:1, user:'Jordan M.',  time:'12m', likes:'24.1K', text:'New single just dropped 🎵🔥 Link in bio!',            emoji:'🎵', color:'#ec4899' },
  { id:2, user:'Alex Chen',  time:'45m', likes:'18.7K', text:'Sunrise in Tokyo — never gets old 🌸🗼',               emoji:'✈️', color:'#6366f1' },
  { id:3, user:'Riley J.',   time:'1h',  likes:'9.2K',  text:'5-mile morning run, new PR! 💪 Keep pushing!',         emoji:'💪', color:'#10b981' },
  { id:4, user:'Sam Rivera', time:'2h',  likes:'31.4K', text:'This homemade ramen hits different on a rainy day 🍜', emoji:'🍕', color:'#f59e0b' },
];

const RESULTS = {
  people: [
    { id:1, name:'Jordan Maxwell', handle:'@jordanmax', bio:'Music producer & DJ 🎵', followers:'12.4K', emoji:'🎵', color:'#ec4899' },
    { id:2, name:'Alex Chen',      handle:'@alexchen',  bio:'Travel photographer ✈️', followers:'8.2K',  emoji:'✈️', color:'#6366f1' },
    { id:3, name:'Riley Johnson',  handle:'@riley.j',   bio:'Fitness coach 💪',       followers:'22.1K', emoji:'💪', color:'#10b981' },
    { id:4, name:'Sam Rivera',     handle:'@samrivera', bio:'Chef & food blogger 🍕', followers:'5.6K',  emoji:'🍕', color:'#f59e0b' },
    { id:5, name:'Morgan Taylor',  handle:'@morgantaylor',bio:'Artist & designer 🎨', followers:'18.9K', emoji:'🎨', color:'#8b5cf6' },
  ],
  posts: [
    { id:1, text:'Amazing sunset from the rooftop 🌅 Never gets old!', user:'Jordan M.', time:'2h', likes:'1.2K', emoji:'🌅', color:'#f59e0b' },
    { id:2, text:'New music drop is coming this Friday 🎵🔥 Stay tuned!', user:'Alex C.', time:'4h', likes:'892', emoji:'🎵', color:'#ec4899' },
    { id:3, text:'Morning run complete 💪 5 miles, new personal record!', user:'Riley J.', time:'6h', likes:'456', emoji:'💪', color:'#10b981' },
  ],
};

const DISCOVER = [
  { emoji:'🎵', label:'Music',   color:'linear-gradient(135deg,#ec4899,#8b5cf6)', count:'2.4M posts' },
  { emoji:'✈️', label:'Travel',  color:'linear-gradient(135deg,#6366f1,#3b82f6)', count:'5.1M posts' },
  { emoji:'🍕', label:'Food',    color:'linear-gradient(135deg,#f59e0b,#ef4444)', count:'8.9M posts' },
  { emoji:'💪', label:'Fitness', color:'linear-gradient(135deg,#10b981,#6366f1)', count:'3.7M posts' },
  { emoji:'🎮', label:'Gaming',  color:'linear-gradient(135deg,#3b82f6,#8b5cf6)', count:'12M posts'  },
  { emoji:'🎨', label:'Art',     color:'linear-gradient(135deg,#8b5cf6,#ec4899)', count:'1.8M posts' },
  { emoji:'🐾', label:'Pets',    color:'linear-gradient(135deg,#f59e0b,#10b981)', count:'6.2M posts' },
  { emoji:'📸', label:'Photo',   color:'linear-gradient(135deg,#14b8a6,#6366f1)', count:'9.4M posts' },
];

// ── Top tab bar (Search | Trending | Discover) ──────────────────────────────
const TOP_TABS = ['Search', 'Trending', 'Discover'];

export default function SearchPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Allow /menu → Trending navigation to auto-select tab
  const defaultTab = location.state?.tab === 'trending' ? 'Trending' : 'Search';

  const [topTab,    setTopTab]    = useState(defaultTab);
  const [query,     setQuery]     = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [following, setFollowing] = useState({});

  const hasQuery  = query.trim().length > 0;
  const toggleFollow = (id) => setFollowing(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div style={{ background:'#0a0a18', minHeight:'100vh', paddingBottom:80 }}>

      {/* ── Top tab bar: Search | Trending | Discover ── */}
      <div style={{ display:'flex', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
        {TOP_TABS.map(t => (
          <button key={t} onClick={() => setTopTab(t)} style={{
            flex:1, padding:'13px 4px', fontSize:14, fontWeight: topTab===t ? 700 : 500,
            color: topTab===t ? '#818cf8' : '#64748b',
            borderBottom: topTab===t ? '2.5px solid #6366f1' : '2.5px solid transparent',
            background:'none', border:'none', borderBottom: topTab===t ? '2.5px solid #6366f1' : '2.5px solid transparent',
            cursor:'pointer', transition:'all 0.15s',
          }}>{t}</button>
        ))}
      </div>

      {/* ══════════ SEARCH tab ══════════ */}
      {topTab === 'Search' && (
        <>
          {/* Search Bar */}
          <div style={{ padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, background:'rgba(255,255,255,0.07)', borderRadius:14, padding:'10px 14px', border:'1px solid rgba(255,255,255,0.10)' }}>
              <span style={{ fontSize:18 }}>🔍</span>
              <input value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Search people, posts, groups…"
                style={{ flex:1, background:'none', border:'none', outline:'none', color:'#f1f5f9', fontSize:15 }}
                autoFocus />
              {hasQuery && <span style={{ color:'#64748b', cursor:'pointer', fontSize:18 }} onClick={() => setQuery('')}>✕</span>}
            </div>
          </div>

          {/* Filter Tabs (only when typing) */}
          {hasQuery && (
            <div style={{ display:'flex', borderBottom:'1px solid rgba(255,255,255,0.06)', overflowX:'auto' }}>
              {CATEGORIES.map(c => (
                <div key={c} onClick={() => setActiveTab(c)} style={{ padding:'10px 16px', fontSize:13, fontWeight: activeTab===c?700:500, color: activeTab===c?'#6366f1':'#64748b', borderBottom: activeTab===c?'2px solid #6366f1':'2px solid transparent', cursor:'pointer', whiteSpace:'nowrap' }}>{c}</div>
              ))}
            </div>
          )}

          {!hasQuery ? (
            <div style={{ padding:'16px' }}>
              <div style={{ fontSize:13, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>Quick trending</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:20 }}>
                {TRENDING_HASHTAGS.slice(0,6).map(t => (
                  <span key={t.tag} onClick={() => setQuery(t.tag)} style={{ background:`${t.color}22`, color:t.color, border:`1px solid ${t.color}44`, padding:'6px 14px', borderRadius:20, fontSize:13, fontWeight:600, cursor:'pointer' }}>{t.tag}</span>
                ))}
              </div>
              <div style={{ fontSize:13, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>Discover</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {DISCOVER.map(d => (
                  <div key={d.label} onClick={() => setQuery(d.label)} style={{ borderRadius:16, background:d.color, padding:'18px 14px', cursor:'pointer' }}>
                    <div style={{ fontSize:26 }}>{d.emoji}</div>
                    <div style={{ color:'white', fontWeight:700, fontSize:15, marginTop:4 }}>{d.label}</div>
                    <div style={{ color:'rgba(255,255,255,0.6)', fontSize:11, marginTop:2 }}>{d.count}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ padding:'16px' }}>
              {(activeTab==='All'||activeTab==='People') && (
                <>
                  <div style={{ fontSize:12, fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>People</div>
                  {RESULTS.people.filter(p => p.name.toLowerCase().includes(query.toLowerCase())||p.handle.includes(query.toLowerCase())).map(p => (
                    <div key={p.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ width:44, height:44, borderRadius:'50%', background:p.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{p.emoji}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:700, color:'#f1f5f9', fontSize:14 }}>{p.name}</div>
                        <div style={{ color:'#64748b', fontSize:12 }}>{p.handle} · {p.followers} followers</div>
                      </div>
                      <button onClick={() => toggleFollow(p.id)} style={{ background: following[p.id]?'rgba(255,255,255,0.07)':'linear-gradient(135deg,#6366f1,#ec4899)', color: following[p.id]?'#94a3b8':'white', border: following[p.id]?'1px solid rgba(255,255,255,0.12)':'none', borderRadius:20, padding:'6px 14px', fontSize:12, fontWeight:600 }}>
                        {following[p.id]?'Following':'Follow'}
                      </button>
                    </div>
                  ))}
                </>
              )}
              {(activeTab==='All'||activeTab==='Posts') && (
                <>
                  <div style={{ fontSize:12, fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'0.06em', margin:'16px 0 10px' }}>Posts</div>
                  {RESULTS.posts.map(p => (
                    <div key={p.id} onClick={() => navigate('/feed')} style={{ background:'rgba(255,255,255,0.05)', borderRadius:14, padding:14, marginBottom:10, cursor:'pointer', border:'1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                        <div style={{ width:32, height:32, borderRadius:'50%', background:p.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>{p.emoji}</div>
                        <span style={{ fontWeight:700, color:'#e2e8f0', fontSize:13 }}>{p.user}</span>
                        <span style={{ color:'#64748b', fontSize:12, marginLeft:'auto' }}>{p.time}</span>
                      </div>
                      <div style={{ color:'#cbd5e1', fontSize:14, lineHeight:1.4 }}>{p.text}</div>
                      <div style={{ color:'#64748b', fontSize:12, marginTop:8 }}>❤️ {p.likes} likes</div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </>
      )}

      {/* ══════════ TRENDING tab (Rec #4 — merged from /trending) ══════════ */}
      {topTab === 'Trending' && (
        <div style={{ padding:'16px' }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>Trending Hashtags</div>
          {TRENDING_HASHTAGS.map((t, i) => (
            <div key={t.tag} onClick={() => { setTopTab('Search'); setQuery(t.tag); }} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 0', borderBottom:'1px solid rgba(255,255,255,0.05)', cursor:'pointer' }}>
              <div style={{ width:38, height:38, borderRadius:10, background:`${t.color}22`, border:`1px solid ${t.color}44`, display:'flex', alignItems:'center', justifyContent:'center', color:t.color, fontWeight:800, fontSize:13 }}>#{i+1}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:14, color:'#f1f5f9' }}>{t.tag}</div>
                <div style={{ fontSize:12, color:'#64748b' }}>{t.posts} posts</div>
              </div>
              <span style={{ color:'#334155', fontSize:18 }}>›</span>
            </div>
          ))}

          <div style={{ fontSize:13, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em', marginTop:24, marginBottom:12 }}>Trending Posts</div>
          {TRENDING_POSTS.map(p => (
            <div key={p.id} onClick={() => navigate('/feed')} style={{ background:'rgba(255,255,255,0.05)', borderRadius:14, padding:14, marginBottom:10, cursor:'pointer', border:'1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                <div style={{ width:36, height:36, borderRadius:'50%', background:p.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>{p.emoji}</div>
                <span style={{ fontWeight:700, color:'#e2e8f0', fontSize:13 }}>{p.user}</span>
                <span style={{ color:'#64748b', fontSize:11, marginLeft:'auto' }}>{p.time} · 🔥 trending</span>
              </div>
              <div style={{ color:'#cbd5e1', fontSize:14, lineHeight:1.4 }}>{p.text}</div>
              <div style={{ color:'#64748b', fontSize:12, marginTop:8 }}>❤️ {p.likes} likes</div>
            </div>
          ))}
        </div>
      )}

      {/* ══════════ DISCOVER tab ══════════ */}
      {topTab === 'Discover' && (
        <div style={{ padding:'16px' }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>Browse by Category</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {DISCOVER.map(d => (
              <div key={d.label} onClick={() => { setTopTab('Search'); setQuery(d.label); }} style={{ borderRadius:18, background:d.color, padding:'22px 16px', cursor:'pointer' }}>
                <div style={{ fontSize:30 }}>{d.emoji}</div>
                <div style={{ color:'white', fontWeight:700, fontSize:16, marginTop:6 }}>{d.label}</div>
                <div style={{ color:'rgba(255,255,255,0.65)', fontSize:12, marginTop:3 }}>{d.count}</div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
