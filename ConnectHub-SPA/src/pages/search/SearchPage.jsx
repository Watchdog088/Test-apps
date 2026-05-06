import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = ['All','People','Posts','Groups','Events','Music','Videos'];

const TRENDING_SEARCHES = ['#LynkApp','#MusicVibes','#TravelGoals','#FoodiLife','#Gaming2026','#ArtOfTheDay'];

const RESULTS = {
  people: [
    { id:1, name:'Jordan Maxwell', handle:'@jordanmax', bio:'Music producer & DJ 🎵', followers:'12.4K', emoji:'🎵', color:'#ec4899' },
    { id:2, name:'Alex Chen', handle:'@alexchen', bio:'Travel photographer ✈️', followers:'8.2K', emoji:'✈️', color:'#6366f1' },
    { id:3, name:'Riley Johnson', handle:'@riley.j', bio:'Fitness coach 💪', followers:'22.1K', emoji:'💪', color:'#10b981' },
    { id:4, name:'Sam Rivera', handle:'@samrivera', bio:'Chef & food blogger 🍕', followers:'5.6K', emoji:'🍕', color:'#f59e0b' },
    { id:5, name:'Morgan Taylor', handle:'@morgantaylor', bio:'Artist & designer 🎨', followers:'18.9K', emoji:'🎨', color:'#8b5cf6' },
  ],
  posts: [
    { id:1, text:'Amazing sunset from the rooftop 🌅 Never gets old!', user:'Jordan M.', time:'2h', likes:'1.2K', emoji:'🌅', color:'#f59e0b' },
    { id:2, text:'New music drop is coming this Friday 🎵🔥 Stay tuned!', user:'Alex C.', time:'4h', likes:'892', emoji:'🎵', color:'#ec4899' },
    { id:3, text:'Morning run complete 💪 5 miles, new personal record!', user:'Riley J.', time:'6h', likes:'456', emoji:'💪', color:'#10b981' },
  ],
};

const DISCOVER = [
  { emoji:'🎵', label:'Music', color:'linear-gradient(135deg,#ec4899,#8b5cf6)', count:'2.4M posts' },
  { emoji:'✈️', label:'Travel', color:'linear-gradient(135deg,#6366f1,#3b82f6)', count:'5.1M posts' },
  { emoji:'🍕', label:'Food', color:'linear-gradient(135deg,#f59e0b,#ef4444)', count:'8.9M posts' },
  { emoji:'💪', label:'Fitness', color:'linear-gradient(135deg,#10b981,#6366f1)', count:'3.7M posts' },
  { emoji:'🎮', label:'Gaming', color:'linear-gradient(135deg,#3b82f6,#8b5cf6)', count:'12M posts' },
  { emoji:'🎨', label:'Art', color:'linear-gradient(135deg,#8b5cf6,#ec4899)', count:'1.8M posts' },
  { emoji:'🐾', label:'Pets', color:'linear-gradient(135deg,#f59e0b,#10b981)', count:'6.2M posts' },
  { emoji:'📸', label:'Photo', color:'linear-gradient(135deg,#14b8a6,#6366f1)', count:'9.4M posts' },
];

export default function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [following, setFollowing] = useState({});

  const hasQuery = query.trim().length > 0;

  const toggleFollow = (id) => setFollowing(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div style={{ background:'#0f172a', minHeight:'100vh', paddingBottom:'80px' }}>
      {/* Search Bar */}
      <div style={{ padding:'16px', borderBottom:'1px solid #1e293b' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', background:'#1e293b', borderRadius:'12px', padding:'10px 14px' }}>
          <span style={{ fontSize:'18px' }}>🔍</span>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search people, posts, groups..."
            style={{ flex:1, background:'none', border:'none', outline:'none', color:'#f1f5f9', fontSize:'15px' }}
            autoFocus
          />
          {hasQuery && <span style={{ color:'#64748b', cursor:'pointer', fontSize:'18px' }} onClick={() => setQuery('')}>✕</span>}
        </div>
      </div>

      {/* Filter Tabs */}
      {hasQuery && (
        <div style={{ display:'flex', borderBottom:'1px solid #1e293b', overflowX:'auto' }}>
          {CATEGORIES.map(c => (
            <div key={c} style={{ padding:'10px 16px', fontSize:'13px', fontWeight: activeTab===c?700:500, color: activeTab===c?'#6366f1':'#64748b', borderBottom: activeTab===c?'2px solid #6366f1':'2px solid transparent', cursor:'pointer', whiteSpace:'nowrap' }}
              onClick={() => setActiveTab(c)}>{c}</div>
          ))}
        </div>
      )}

      {!hasQuery ? (
        <>
          {/* Trending Searches */}
          <div style={{ padding:'16px' }}>
            <div style={{ fontSize:'15px', fontWeight:700, color:'#f1f5f9', marginBottom:'10px' }}>🔥 Trending</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
              {TRENDING_SEARCHES.map(t => (
                <span key={t} style={{ background:'#1e293b', color:'#6366f1', padding:'6px 14px', borderRadius:'20px', fontSize:'13px', fontWeight:600, cursor:'pointer' }} onClick={() => setQuery(t)}>{t}</span>
              ))}
            </div>
          </div>

          {/* Discover Categories */}
          <div style={{ padding:'0 16px' }}>
            <div style={{ fontSize:'15px', fontWeight:700, color:'#f1f5f9', marginBottom:'10px' }}>Discover</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
              {DISCOVER.map(d => (
                <div key={d.label} style={{ borderRadius:'16px', background:d.color, padding:'20px 16px', cursor:'pointer', display:'flex', flexDirection:'column', gap:'6px' }} onClick={() => setQuery(d.label)}>
                  <span style={{ fontSize:'28px' }}>{d.emoji}</span>
                  <span style={{ color:'white', fontWeight:700, fontSize:'16px' }}>{d.label}</span>
                  <span style={{ color:'rgba(255,255,255,0.7)', fontSize:'12px' }}>{d.count}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div style={{ padding:'16px' }}>
          {/* People Results */}
          {(activeTab === 'All' || activeTab === 'People') && (
            <>
              <div style={{ fontSize:'13px', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'10px' }}>People</div>
              {RESULTS.people.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.handle.includes(query.toLowerCase())).map(p => (
                <div key={p.id} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'10px 0', borderBottom:'1px solid #1e293b' }}>
                  <div style={{ width:'44px', height:'44px', borderRadius:'50%', background:p.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', flexShrink:0 }}>{p.emoji}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, color:'#f1f5f9', fontSize:'14px' }}>{p.name}</div>
                    <div style={{ color:'#64748b', fontSize:'12px' }}>{p.handle} · {p.followers} followers</div>
                  </div>
                  <button onClick={() => toggleFollow(p.id)} style={{ background: following[p.id]?'#1e293b':'linear-gradient(135deg,#6366f1,#ec4899)', color: following[p.id]?'#94a3b8':'white', border: following[p.id]?'1px solid #334155':'none', borderRadius:'20px', padding:'6px 14px', fontSize:'12px', fontWeight:600, cursor:'pointer' }}>
                    {following[p.id]?'Following':'Follow'}
                  </button>
                </div>
              ))}
            </>
          )}

          {/* Posts Results */}
          {(activeTab === 'All' || activeTab === 'Posts') && (
            <>
              <div style={{ fontSize:'13px', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.05em', margin:'16px 0 10px' }}>Posts</div>
              {RESULTS.posts.map(p => (
                <div key={p.id} style={{ background:'#1e293b', borderRadius:'16px', padding:'14px', marginBottom:'10px', cursor:'pointer' }} onClick={() => navigate('/feed')}>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px' }}>
                    <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:p.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px' }}>{p.emoji}</div>
                    <span style={{ fontWeight:700, color:'#e2e8f0', fontSize:'13px' }}>{p.user}</span>
                    <span style={{ color:'#64748b', fontSize:'12px', marginLeft:'auto' }}>{p.time}</span>
                  </div>
                  <div style={{ color:'#cbd5e1', fontSize:'14px', lineHeight:'1.4' }}>{p.text}</div>
                  <div style={{ color:'#64748b', fontSize:'12px', marginTop:'8px' }}>❤️ {p.likes} likes</div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
