// src/pages/profile/ProfilePage.jsx
// REC-7: Clips tab — reads clips/{uid}/items, shows duration + thumbnail grid
// BUG-05 FIX: useParams() reads :uid; isOwn computed correctly
// UX-11 FIX: Follower counts default to 0, formatted with formatCount()
// POLISH-03 FIX: Edit Profile navigates to /settings
// POLISH-07 FIX: Profile grid items navigate to /feed?post=id
// POLISH-09 FIX: TabSkeleton shown on tab switch with 300ms delay
// IMPROVE-10 FIX: ProfileSkeleton while loading

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@fb/config';
import { useAuth } from '@hooks/useAuth';
import { ProfileSkeleton, TabSkeleton } from '@components/common/SkeletonLoader';

function formatCount(n) {
  if (!n && n !== 0) return '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
}

const DEMO_GRID = [
  { id:'g1', emoji:'🎵', color:'linear-gradient(135deg,#667eea,#764ba2)' },
  { id:'g2', emoji:'✈️', color:'linear-gradient(135deg,#f093fb,#f5576c)' },
  { id:'g3', emoji:'💪', color:'linear-gradient(135deg,#4facfe,#00f2fe)' },
  { id:'g4', emoji:'🎨', color:'linear-gradient(135deg,#43e97b,#38f9d7)' },
  { id:'g5', emoji:'🍕', color:'linear-gradient(135deg,#fa709a,#fee140)' },
  { id:'g6', emoji:'📸', color:'linear-gradient(135deg,#a18cd1,#fbc2eb)' },
  { id:'g7', emoji:'🎮', color:'linear-gradient(135deg,#ffecd2,#fcb69f)' },
  { id:'g8', emoji:'🎤', color:'linear-gradient(135deg,#ff9a9e,#fecfef)' },
  { id:'g9', emoji:'🌍', color:'linear-gradient(135deg,#a1c4fd,#c2e9fb)' },
];

// REC-7: Added Clips tab
const TABS = ['Posts', 'Reels', 'Tagged', 'Liked', 'Clips'];

export default function ProfilePage() {
  const { uid: paramUid } = useParams();        // BUG-05: read URL param
  const navigate          = useNavigate();
  const { user }          = useAuth();

  // BUG-05: isOwn computed, not hardcoded
  const isOwn = !paramUid || paramUid === user?.uid;
  const targetUid = paramUid || user?.uid;

  const [profile,   setProfile]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState('Posts');
  const [tabLoading,setTabLoading]= useState(false);
  // REC-7: clips state
  const [clips,     setClips]     = useState([]);
  const [clipsLoaded, setClipsLoaded] = useState(false);

  useEffect(() => {
    if (!targetUid) { setLoading(false); return; }
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'users', targetUid));
        if (snap.exists()) setProfile(snap.data());
        else setProfile(null);
      } catch {
        setProfile(null);
      }
      setLoading(false);
    })();
  }, [targetUid]);

  // REC-7: lazy-load clips when tab is first opened
  useEffect(() => {
    if (activeTab !== 'Clips' || clipsLoaded || !targetUid) return;
    (async () => {
      try {
        const snap = await getDocs(
          query(collection(db, 'clips'), where('userId', '==', targetUid), orderBy('createdAt', 'desc'))
        );
        setClips(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch { setClips([]); }
      setClipsLoaded(true);
    })();
  }, [activeTab, clipsLoaded, targetUid]);

  // POLISH-09: brief skeleton on tab switch
  function handleTabChange(tab) {
    if (tab === activeTab) return;
    setTabLoading(true);
    setActiveTab(tab);
    setTimeout(() => setTabLoading(false), 300);
  }

  const displayName   = profile?.displayName || user?.displayName || 'User';
  const handle        = '@' + displayName.toLowerCase().replace(/\s+/g, '');
  const bio           = profile?.bio || (isOwn ? 'Tap Edit Profile to add a bio' : 'No bio yet');
  const postsCount    = formatCount(profile?.postsCount || 0);
  // UX-11 FIX: default 0 not hardcoded '1.4K'
  const followersCount = formatCount(profile?.followersCount || 0);
  const followingCount = formatCount(profile?.followingCount || 0);
  const photoURL      = profile?.photoURL || user?.photoURL || null;

  if (loading) return <div style={{ background:'#0a0a18', minHeight:'100vh' }}><ProfileSkeleton /></div>;

  return (
    <div style={{ background:'#0a0a18', minHeight:'100vh', paddingBottom:80 }}>
      {/* Cover */}
      <div style={{ height:140, background:'linear-gradient(135deg,#0f0c29,#302b63,#24243e)', position:'relative' }}>
        {profile?.coverUrl && <img src={profile.coverUrl} alt="cover" style={{ width:'100%', height:'100%', objectFit:'cover' }} />}
      </div>

      {/* Avatar + stats */}
      <div style={{ padding:'0 16px' }}>
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginTop:-44, marginBottom:14 }}>
          <div style={{ width:88, height:88, borderRadius:'50%', border:'4px solid #0a0a18', overflow:'hidden', background:'linear-gradient(135deg,#6366f1,#ec4899)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, flexShrink:0 }}>
            {photoURL
              ? <img src={photoURL} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              : displayName[0]?.toUpperCase()}
          </div>
          <div style={{ display:'flex', gap:28, paddingBottom:8 }}>
            {[{ label:'Posts', value:postsCount }, { label:'Followers', value:followersCount }, { label:'Following', value:followingCount }].map(s => (
              <div key={s.label} style={{ textAlign:'center' }}>
                <div style={{ fontSize:18, fontWeight:800, color:'#f1f5f9' }}>{s.value}</div>
                <div style={{ fontSize:11, color:'#64748b' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Name + bio */}
        <div style={{ fontWeight:800, fontSize:17, color:'#f1f5f9', marginBottom:2 }}>{displayName}</div>
        <div style={{ fontSize:13, color:'#6366f1', marginBottom:8 }}>{handle}</div>
        <div style={{ fontSize:13, color:'#94a3b8', lineHeight:1.6, marginBottom:14 }}>{bio}</div>

        {/* Interests */}
        {profile?.interests?.length > 0 && (
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:14 }}>
            {profile.interests.map(int => (
              <span key={int} style={{ padding:'4px 10px', background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.25)', borderRadius:20, fontSize:11, color:'#818cf8' }}>{int}</span>
            ))}
          </div>
        )}

        {/* Action buttons */}
        {isOwn ? (
          <div style={{ display:'flex', gap:10, marginBottom:18 }}>
            {/* POLISH-03 FIX: navigates to /settings */}
            <button onClick={() => navigate('/settings')} style={{ flex:1, padding:'10px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:14, color:'#f1f5f9', fontSize:14, fontWeight:700, cursor:'pointer' }}>
              ✏️ Edit Profile
            </button>
            <button onClick={() => navigate('/settings')} style={{ width:44, height:44, borderRadius:14, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', color:'#f1f5f9', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>⚙️</button>
          </div>
        ) : (
          <div style={{ display:'flex', gap:10, marginBottom:18 }}>
            <button style={{ flex:1, padding:'10px', background:'linear-gradient(135deg,#6366f1,#ec4899)', border:'none', borderRadius:14, color:'white', fontSize:14, fontWeight:700, cursor:'pointer' }}>
              ➕ Follow
            </button>
            <button onClick={() => navigate('/messages', { state:{ matchId: paramUid, matchName: displayName } })} style={{ flex:1, padding:'10px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:14, color:'#f1f5f9', fontSize:14, fontWeight:700, cursor:'pointer' }}>
              💬 Message
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', borderTop:'1px solid rgba(255,255,255,0.08)', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => handleTabChange(tab)} style={{ flex:1, padding:'12px 0', background:'none', border:'none', color: activeTab === tab ? '#f1f5f9' : '#475569', fontSize:13, fontWeight: activeTab === tab ? 700 : 500, cursor:'pointer', borderBottom: activeTab === tab ? '2px solid #6366f1' : '2px solid transparent', transition:'all 0.2s' }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content — POLISH-09: skeleton on switch */}
      {tabLoading ? (
        <TabSkeleton rows={4} />
      ) : activeTab === 'Posts' ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:2 }}>
          {DEMO_GRID.map(item => (
            // POLISH-07 FIX: navigates to /feed?post=id
            <div key={item.id} onClick={() => navigate(`/feed?post=${item.id}`)}
              style={{ aspectRatio:'1', background:item.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, cursor:'pointer', transition:'opacity 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              {item.emoji}
            </div>
          ))}
        </div>
      ) : activeTab === 'Reels' ? (
        <div style={{ textAlign:'center', padding:'48px 24px', color:'#475569' }}>
          <div style={{ fontSize:48, marginBottom:12 }}>🎬</div>
          <div style={{ color:'#64748b', fontWeight:600 }}>No reels yet</div>
          <div style={{ fontSize:13, color:'#475569', marginTop:6 }}>Create your first reel</div>
        </div>
      ) : activeTab === 'Tagged' ? (
        <div style={{ textAlign:'center', padding:'48px 24px', color:'#475569' }}>
          <div style={{ fontSize:48, marginBottom:12 }}>🏷️</div>
          <div style={{ color:'#64748b', fontWeight:600 }}>No tagged posts</div>
          <div style={{ fontSize:13, color:'#475569', marginTop:6 }}>Posts you're tagged in will appear here</div>
        </div>
      ) : activeTab === 'Liked' ? (
        <div style={{ textAlign:'center', padding:'48px 24px', color:'#475569' }}>
          <div style={{ fontSize:48, marginBottom:12 }}>❤️</div>
          <div style={{ color:'#64748b', fontWeight:600 }}>No liked posts</div>
          <div style={{ fontSize:13, color:'#475569', marginTop:6 }}>Start engaging with posts to see them here</div>
        </div>

      ) : activeTab === 'Clips' ? (
        /* REC-7: Clips gallery — shows stream clips from Firestore */
        clips.length === 0 && clipsLoaded ? (
          <div style={{ textAlign:'center', padding:'48px 24px' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>✂️</div>
            <div style={{ color:'#64748b', fontWeight:600 }}>No clips yet</div>
            <div style={{ fontSize:13, color:'#475569', marginTop:6 }}>Clips are saved highlights from your live streams</div>
            {isOwn && (
              <button onClick={() => navigate('/live/setup')}
                style={{ marginTop:16, background:'linear-gradient(135deg,#ef4444,#f59e0b)', border:'none',
                  borderRadius:12, padding:'10px 20px', color:'white', fontWeight:700, fontSize:'13px', cursor:'pointer' }}>
                🔴 Start a Live Stream
              </button>
            )}
          </div>
        ) : !clipsLoaded ? (
          <TabSkeleton rows={3} />
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:2, padding:'2px' }}>
            {clips.map(clip => (
              <div key={clip.id}
                onClick={() => navigate(`/live/watch/${clip.streamId}?t=${clip.startTime}`)}
                style={{ position:'relative', aspectRatio:'16/9', background:'#1e293b',
                  overflow:'hidden', cursor:'pointer' }}>
                {clip.thumbnailUrl
                  ? <img src={clip.thumbnailUrl} alt={clip.title} loading="lazy"
                      style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  : <div style={{ width:'100%', height:'100%', display:'flex',
                      alignItems:'center', justifyContent:'center',
                      background:'linear-gradient(135deg,#1e293b,#334155)', fontSize:'28px' }}>✂️</div>
                }
                {/* Duration badge */}
                {clip.durationSeconds && (
                  <div style={{ position:'absolute', bottom:'4px', right:'4px',
                    background:'rgba(0,0,0,0.8)', borderRadius:'4px', padding:'1px 5px',
                    color:'white', fontSize:'10px', fontWeight:600 }}>
                    {Math.floor(clip.durationSeconds / 60)}:{String(clip.durationSeconds % 60).padStart(2,'0')}
                  </div>
                )}
                {/* View count */}
                {clip.viewCount > 0 && (
                  <div style={{ position:'absolute', bottom:'4px', left:'4px',
                    background:'rgba(0,0,0,0.7)', borderRadius:'4px', padding:'1px 5px',
                    color:'#94a3b8', fontSize:'9px' }}>
                    👁 {clip.viewCount >= 1000 ? `${(clip.viewCount/1000).toFixed(1)}K` : clip.viewCount}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      ) : null}
    </div>
  );
}
