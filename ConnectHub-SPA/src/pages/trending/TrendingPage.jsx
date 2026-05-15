/**
 * TrendingPage.jsx
 * ─────────────────────────────────────────────────────────────
 * UPDATED May 15, 2026:
 *  - Twitter/X API REMOVED entirely (was $100+/mo, no key)
 *  - Reddit now uses PUBLIC JSON feed (NO API KEY NEEDED)
 *  - Live trending data from reddit.com/r/popular.json
 *  - YouTube music stations panel added (free, key already have)
 *  - Falls back to static data if Reddit is unreachable
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchRedditTrending, fetchRedditTopics } from '../../services/reddit-service';
import { MUSIC_STATIONS, getYouTubeEmbedUrl } from '../../services/youtube-music-service';

const TABS = ['All', 'Music', 'Videos', 'News', 'Sports', 'Tech'];

const STATIC_CREATORS = [
  { id:1, name:'Jordan M.',  handle:'@jordanmax',  emoji:'🎵', followers:'124K', color:'#ec4899', trending:true },
  { id:2, name:'Alex Chen',  handle:'@alexchen',   emoji:'✈️', followers:'89K',  color:'#6366f1', trending:true },
  { id:3, name:'Riley J.',   handle:'@riley.j',    emoji:'💪', followers:'221K', color:'#10b981', trending:false },
  { id:4, name:'Sam R.',     handle:'@samrivera',  emoji:'🍕', followers:'56K',  color:'#f59e0b', trending:false },
];

export default function TrendingPage() {
  const navigate  = useNavigate();
  const [tab, setTab]               = useState('All');
  const [following, setFollowing]   = useState({});
  const [trending, setTrending]     = useState([]);
  const [topics, setTopics]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [dataSource, setDataSource] = useState('loading');
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);
  const [activeStation, setActiveStation]     = useState(null);
  const iframeRef = useRef(null);

  // ── Fetch live Reddit data on tab change ──────────────────
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    (async () => {
      const [posts, topicList] = await Promise.all([
        fetchRedditTrending(tab, 12),
        tab === 'All' ? fetchRedditTopics(8) : Promise.resolve([]),
      ]);

      if (!cancelled) {
        setTrending(posts);
        if (topicList.length) setTopics(topicList);
        setDataSource(posts[0]?.source === 'fallback' ? 'static' : 'reddit');
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [tab]);

  // ── Open YouTube station ───────────────────────────────────
  const openStation = (station) => {
    setActiveStation(station);
    setShowMusicPlayer(true);
  };

  const closePlayer = () => {
    setShowMusicPlayer(false);
    setActiveStation(null);
  };

  return (
    <div style={{ background:'#0f172a', minHeight:'100vh', paddingBottom:'80px' }}>

      {/* Header */}
      <div style={{ padding:'16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <span style={{ fontSize:'20px', fontWeight:700, color:'#f1f5f9' }}>🔥 Trending</span>
          {dataSource === 'reddit' && (
            <span style={{ background:'rgba(255,69,0,0.15)', color:'#ff4500', fontSize:'10px', fontWeight:700, borderRadius:'6px', padding:'2px 6px' }}>LIVE · Reddit</span>
          )}
          {dataSource === 'static' && (
            <span style={{ background:'rgba(100,116,139,0.2)', color:'#94a3b8', fontSize:'10px', fontWeight:600, borderRadius:'6px', padding:'2px 6px' }}>CACHED</span>
          )}
        </div>
        <div style={{ display:'flex', gap:'12px', alignItems:'center' }}>
          <span style={{ fontSize:'18px', cursor:'pointer' }} title="Music Player" onClick={() => setShowMusicPlayer(p => !p)}>🎵</span>
          <span style={{ fontSize:'18px', cursor:'pointer' }} onClick={() => navigate('/search')}>🔍</span>
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{ display:'flex', borderBottom:'1px solid #1e293b', overflowX:'auto' }}>
        {TABS.map(t => (
          <div key={t} style={{ padding:'10px 16px', fontSize:'13px', fontWeight:tab===t?700:500, color:tab===t?'#6366f1':'#64748b', borderBottom:tab===t?'2px solid #6366f1':'2px solid transparent', cursor:'pointer', whiteSpace:'nowrap' }} onClick={() => setTab(t)}>{t}</div>
        ))}
      </div>

      {/* YouTube Music Stations Panel */}
      {showMusicPlayer && (
        <div style={{ background:'#1e293b', borderBottom:'1px solid #334155', padding:'12px 16px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px' }}>
            <span style={{ color:'#f1f5f9', fontWeight:700, fontSize:'13px' }}>🎵 Music Stations — Free via YouTube</span>
            <span style={{ color:'#64748b', cursor:'pointer', fontSize:'16px' }} onClick={closePlayer}>✕</span>
          </div>

          {/* Active Player */}
          {activeStation && (
            <div style={{ marginBottom:'10px', borderRadius:'12px', overflow:'hidden', background:'#0f172a' }}>
              <iframe
                ref={iframeRef}
                src={getYouTubeEmbedUrl(activeStation.videoId, { autoplay: true })}
                width="100%"
                height="180"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ display:'block', border:'none' }}
                title={activeStation.name}
              />
              <div style={{ padding:'8px 12px', display:'flex', alignItems:'center', gap:'8px' }}>
                <span style={{ fontSize:'18px' }}>{activeStation.emoji}</span>
                <div>
                  <div style={{ color:'#f1f5f9', fontWeight:600, fontSize:'13px' }}>{activeStation.name}</div>
                  <div style={{ color:'#64748b', fontSize:'11px' }}>{activeStation.description}</div>
                </div>
              </div>
            </div>
          )}

          {/* Station Grid */}
          <div style={{ display:'flex', gap:'8px', overflowX:'auto', paddingBottom:'4px' }}>
            {MUSIC_STATIONS.map(s => (
              <div
                key={s.id}
                onClick={() => openStation(s)}
                style={{ background: activeStation?.id === s.id ? s.color : '#0f172a', border:`1px solid ${activeStation?.id === s.id ? s.color : '#334155'}`, borderRadius:'12px', padding:'10px 12px', minWidth:'100px', cursor:'pointer', flexShrink:0, transition:'all 0.2s' }}
              >
                <div style={{ fontSize:'22px', textAlign:'center', marginBottom:'4px' }}>{s.emoji}</div>
                <div style={{ color: activeStation?.id === s.id ? 'white' : '#f1f5f9', fontSize:'11px', fontWeight:600, textAlign:'center' }}>{s.name}</div>
                <div style={{ color: activeStation?.id === s.id ? 'rgba(255,255,255,0.8)' : '#64748b', fontSize:'10px', textAlign:'center' }}>{s.genre}</div>
              </div>
            ))}
          </div>
          <div style={{ color:'#475569', fontSize:'10px', marginTop:'8px', textAlign:'center' }}>
            Powered by YouTube IFrame API · Free · No FeedFM subscription needed
          </div>
        </div>
      )}

      {/* Hot Topics from Reddit */}
      {tab === 'All' && topics.length > 0 && (
        <div style={{ padding:'12px 16px 0' }}>
          <div style={{ fontSize:'12px', color:'#64748b', fontWeight:600, marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.05em' }}>Hot on Reddit right now</div>
          <div style={{ display:'flex', gap:'8px', overflowX:'auto', paddingBottom:'4px' }}>
            {topics.map(t => (
              <div key={t.id} style={{ background:'rgba(30,41,59,0.6)', border:'1px solid #334155', borderRadius:'20px', padding:'5px 12px', fontSize:'12px', color:'#94a3b8', whiteSpace:'nowrap', cursor:'pointer', flexShrink:0 }}
                   onClick={() => window.open(`https://www.reddit.com/r/${t.id}`, '_blank')}>
                {t.emoji} {t.tag}
                {t.hot && <span style={{ marginLeft:'4px', color:'#ef4444' }}>🔥</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trending Posts List */}
      <div style={{ padding:'16px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>
          <div style={{ fontSize:'15px', fontWeight:700, color:'#f1f5f9' }}>Trending Posts</div>
          {dataSource === 'reddit' && (
            <a href="https://www.reddit.com" target="_blank" rel="noopener noreferrer" style={{ color:'#ff4500', fontSize:'11px', textDecoration:'none' }}>via Reddit ↗</a>
          )}
        </div>

        {loading ? (
          // Skeleton loader
          Array.from({length:6}).map((_, i) => (
            <div key={i} style={{ display:'flex', gap:'12px', padding:'12px', marginBottom:'4px', borderRadius:'12px', background:'rgba(30,41,59,0.3)' }}>
              <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:'#1e293b' }}/>
              <div style={{ flex:1 }}>
                <div style={{ height:'12px', background:'#1e293b', borderRadius:'6px', marginBottom:'6px', width:'80%' }}/>
                <div style={{ height:'10px', background:'#1e293b', borderRadius:'6px', width:'50%' }}/>
              </div>
            </div>
          ))
        ) : (
          trending.map((t, i) => (
            <div
              key={t.id}
              style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px', background:i%2===0?'transparent':'rgba(30,41,59,0.3)', borderRadius:'12px', marginBottom:'4px', cursor:'pointer' }}
              onClick={() => t.url ? window.open(t.url, '_blank') : navigate('/search')}
            >
              <span style={{ fontSize:'22px', minWidth:'28px', textAlign:'center' }}>{t.emoji}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap' }}>
                  <span style={{ fontWeight:700, color:'#f1f5f9', fontSize:'14px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'200px' }}>{t.tag}</span>
                  {t.hot && <span style={{ background:'#ef4444', color:'white', fontSize:'10px', fontWeight:700, borderRadius:'8px', padding:'1px 6px', flexShrink:0 }}>HOT</span>}
                </div>
                <span style={{ color:'#64748b', fontSize:'11px' }}>
                  {t.subreddit && <span style={{ color:'#ff4500', marginRight:'4px' }}>{t.subreddit}</span>}
                  {t.posts} upvotes · {t.change}
                </span>
              </div>
              <span style={{ color:'#64748b', fontSize:'16px', fontWeight:700, minWidth:'24px', textAlign:'right', flexShrink:0 }}>#{t.rank}</span>
            </div>
          ))
        )}
      </div>

      {/* Trending Creators */}
      {tab === 'All' && (
        <div style={{ padding:'0 16px 16px' }}>
          <div style={{ fontSize:'15px', fontWeight:700, color:'#f1f5f9', marginBottom:'12px' }}>Trending Creators</div>
          <div style={{ display:'flex', gap:'12px', overflowX:'auto' }}>
            {STATIC_CREATORS.map(c => (
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

      {/* Data Source Footer */}
      <div style={{ padding:'8px 16px 24px', textAlign:'center', color:'#334155', fontSize:'10px' }}>
        {dataSource === 'reddit' ? '✅ Live data from Reddit public JSON — No API key needed · Twitter/X removed' : '📡 Static fallback data · Reddit unreachable'}
      </div>
    </div>
  );
}
