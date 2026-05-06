// StoriesPage — full-screen viewer with multi-segment progress bars
// Tap left half = prev · Tap right half / tap = next · Reply input · ❤️ react
import React, { useState, useEffect, useRef } from 'react';

const STORIES = [
  { id:1, user:'You',    emoji:'😊', color:'#6366f1', hasNew:false, isYou:true  },
  { id:2, user:'Jordan', emoji:'🔥', color:'#ec4899', hasNew:true               },
  { id:3, user:'Alex',   emoji:'🎵', color:'#10b981', hasNew:true               },
  { id:4, user:'Riley',  emoji:'✈️', color:'#f59e0b', hasNew:true               },
  { id:5, user:'Sam',    emoji:'🎮', color:'#3b82f6', hasNew:false              },
  { id:6, user:'Morgan', emoji:'🌊', color:'#8b5cf6', hasNew:true               },
  { id:7, user:'Casey',  emoji:'🍕', color:'#ef4444', hasNew:false              },
  { id:8, user:'Drew',   emoji:'📸', color:'#14b8a6', hasNew:true               },
];

// Each user can have multiple story segments
const USER_STORIES = {
  Jordan: [
    { bg:'linear-gradient(135deg,#6366f1,#ec4899)', emoji:'🌆', caption:'Beautiful evening in the city! 🌆✨' },
    { bg:'linear-gradient(135deg,#ec4899,#f59e0b)', emoji:'🍸', caption:'Rooftop drinks with the crew 🍸🙌' },
  ],
  Alex: [
    { bg:'linear-gradient(135deg,#10b981,#3b82f6)', emoji:'🎵', caption:'New track dropping soon 🎵🔥' },
    { bg:'linear-gradient(135deg,#3b82f6,#8b5cf6)', emoji:'🎧', caption:'Studio sessions all night 🎧💜' },
    { bg:'linear-gradient(135deg,#8b5cf6,#ec4899)', emoji:'🎤', caption:'Live performance this Friday! 🎤🔥' },
  ],
  Riley: [
    { bg:'linear-gradient(135deg,#f59e0b,#ef4444)', emoji:'✈️', caption:'Off to Paris! ✈️🗼' },
    { bg:'linear-gradient(135deg,#ef4444,#ec4899)', emoji:'🥐', caption:'Best croissants in Montmartre 🥐☕' },
  ],
  Morgan: [
    { bg:'linear-gradient(135deg,#8b5cf6,#ec4899)', emoji:'🌊', caption:'Beach vibes all day 🌊☀️' },
  ],
  Sam: [
    { bg:'linear-gradient(135deg,#3b82f6,#10b981)', emoji:'🎮', caption:'New high score! 🎮🏆' },
    { bg:'linear-gradient(135deg,#10b981,#3b82f6)', emoji:'🕹️', caption:'Co-op gaming night 🕹️👾' },
  ],
  Casey: [
    { bg:'linear-gradient(135deg,#ef4444,#f59e0b)', emoji:'🍕', caption:'Homemade deep dish 🍕😍' },
  ],
  Drew: [
    { bg:'linear-gradient(135deg,#14b8a6,#6366f1)', emoji:'📸', caption:'Golden hour photography 📸💛' },
    { bg:'linear-gradient(135deg,#6366f1,#14b8a6)', emoji:'🌅', caption:'Sunrise at the lake 🌅🌿' },
    { bg:'linear-gradient(135deg,#14b8a6,#ec4899)', emoji:'🎞️', caption:'New film roll developed 🎞️✨' },
  ],
};

const SEGMENT_DURATION = 5000; // ms per segment

export default function StoriesPage() {
  const [viewing, setViewing]     = useState(null);   // STORIES entry
  const [segIdx, setSegIdx]       = useState(0);       // current segment within the user's stories
  const [progress, setProgress]   = useState(0);       // 0–100
  const [paused, setPaused]       = useState(false);
  const [reply, setReply]         = useState('');
  const timerRef                  = useRef(null);

  const segments = viewing ? (USER_STORIES[viewing.user] || [{ bg:'linear-gradient(135deg,#334155,#0f172a)', emoji:viewing.emoji, caption:`${viewing.user}'s story` }]) : [];
  const currentSeg = segments[segIdx] || segments[0];

  // Auto-advance timer
  useEffect(() => {
    if (!viewing || paused) return;
    timerRef.current = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          // go to next segment or close
          setSegIdx(si => {
            if (si + 1 < segments.length) { setProgress(0); return si + 1; }
            else { closeViewer(); return 0; }
          });
          return 0;
        }
        return p + (100 / (SEGMENT_DURATION / 100));
      });
    }, 100);
    return () => clearInterval(timerRef.current);
  }, [viewing, segIdx, paused]);

  const openStory = (story) => {
    if (story.isYou) return;
    setViewing(story); setSegIdx(0); setProgress(0); setPaused(false);
  };

  const closeViewer = () => {
    clearInterval(timerRef.current);
    setViewing(null); setSegIdx(0); setProgress(0);
  };

  const goNext = () => {
    clearInterval(timerRef.current);
    if (segIdx + 1 < segments.length) { setSegIdx(segIdx + 1); setProgress(0); }
    else closeViewer();
  };

  const goPrev = () => {
    clearInterval(timerRef.current);
    if (segIdx > 0) { setSegIdx(segIdx - 1); setProgress(0); }
    else setProgress(0); // restart current
  };

  const handleTap = (e) => {
    const x = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    if (x < window.innerWidth / 2) goPrev();
    else goNext();
  };

  return (
    <div style={{ background:'#0f172a', minHeight:'100vh', paddingBottom:'80px' }}>

      {/* ── Full-Screen Story Viewer ── */}
      {viewing && (
        <div style={{ position:'fixed', inset:0, zIndex:1000, background:'#000', touchAction:'none' }}>

          {/* Multi-segment progress bars */}
          <div style={{ position:'absolute', top:0, left:0, right:0, zIndex:20, display:'flex', gap:3, padding:'10px 10px 0' }}>
            {segments.map((_, i) => (
              <div key={i} style={{ flex:1, height:3, background:'rgba(255,255,255,0.3)', borderRadius:2, overflow:'hidden' }}>
                <div style={{
                  height:'100%',
                  background:'white',
                  borderRadius:2,
                  width: i < segIdx ? '100%' : i === segIdx ? `${progress}%` : '0%',
                  transition: i === segIdx ? 'width 0.1s linear' : 'none',
                }} />
              </div>
            ))}
          </div>

          {/* Story header */}
          <div style={{ position:'absolute', top:20, left:0, right:0, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 14px', zIndex:20 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:38, height:38, borderRadius:'50%', background:viewing.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, border:'2px solid white' }}>
                {viewing.emoji}
              </div>
              <div>
                <div style={{ color:'white', fontWeight:700, fontSize:14, lineHeight:1.2 }}>{viewing.user}</div>
                <div style={{ color:'rgba(255,255,255,0.65)', fontSize:11 }}>
                  {segIdx + 1} of {segments.length} · Just now
                </div>
              </div>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => setPaused(p => !p)} style={{ background:'none', border:'none', color:'white', fontSize:18, cursor:'pointer' }}>
                {paused ? '▶' : '⏸'}
              </button>
              <button onClick={closeViewer} style={{ background:'none', border:'none', color:'white', fontSize:22, cursor:'pointer', lineHeight:1 }}>✕</button>
            </div>
          </div>

          {/* Story content — tap left/right to navigate */}
          <div style={{ width:'100%', height:'100%', background:currentSeg.bg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20, position:'relative' }}
            onClick={handleTap}>
            {/* Tap zones (visual only on desktop) */}
            <div style={{ position:'absolute', left:0, top:0, width:'40%', height:'100%', cursor:'w-resize' }} />
            <div style={{ position:'absolute', right:0, top:0, width:'40%', height:'100%', cursor:'e-resize' }} />
            <div style={{ fontSize:88, pointerEvents:'none' }}>{currentSeg.emoji}</div>
            <div style={{ color:'white', fontSize:19, fontWeight:700, textAlign:'center', padding:'0 36px', pointerEvents:'none', textShadow:'0 2px 8px rgba(0,0,0,0.5)' }}>
              {currentSeg.caption}
            </div>
          </div>

          {/* Reply bar */}
          <div style={{ position:'absolute', bottom:28, left:0, right:0, display:'flex', gap:10, padding:'0 14px', zIndex:20 }}
            onClick={e => e.stopPropagation()}>
            <input
              value={reply}
              onChange={e => setReply(e.target.value)}
              onFocus={() => setPaused(true)}
              onBlur={() => setPaused(false)}
              placeholder={`Reply to ${viewing.user}…`}
              style={{ flex:1, background:'rgba(255,255,255,0.18)', border:'1px solid rgba(255,255,255,0.35)', borderRadius:24, padding:'10px 16px', color:'white', fontSize:14, outline:'none' }}
            />
            <button style={{ background:'none', border:'none', fontSize:26, cursor:'pointer' }}>❤️</button>
            <button style={{ background:'none', border:'none', fontSize:22, cursor:'pointer', color:'white' }}>📤</button>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ padding:'16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize:'20px', fontWeight:700, color:'#f1f5f9' }}>📖 Stories</span>
        <button style={{ background:'linear-gradient(135deg,#6366f1,#ec4899)', color:'white', border:'none', borderRadius:'20px', padding:'8px 16px', fontSize:'13px', fontWeight:600, cursor:'pointer' }}>
          + Create
        </button>
      </div>

      {/* ── Story Bubbles Row ── */}
      <div style={{ display:'flex', gap:12, padding:'16px', overflowX:'auto' }}>
        {STORIES.map(story => (
          <div key={story.id} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, cursor:'pointer', flexShrink:0 }}
            onClick={() => openStory(story)}>
            <div style={{ width:68, height:68, borderRadius:'50%', padding:'2.5px', background: story.hasNew ? 'linear-gradient(135deg,#6366f1,#ec4899)' : '#334155' }}>
              <div style={{ width:63, height:63, borderRadius:'50%', background:story.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, border:'2.5px solid #0f172a' }}>
                {story.isYou ? <span style={{ fontSize:24, color:'white', fontWeight:700 }}>+</span> : story.emoji}
              </div>
            </div>
            <span style={{ fontSize:11, color: story.hasNew ? '#f1f5f9' : '#64748b', fontWeight: story.hasNew ? 700 : 400, maxWidth:68, textAlign:'center', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {story.user}
            </span>
          </div>
        ))}
      </div>

      {/* ── Recent Stories Grid ── */}
      <div style={{ padding:'0 16px' }}>
        <div style={{ fontSize:'16px', fontWeight:700, color:'#f1f5f9', marginBottom:'12px' }}>Recent Stories</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
          {Object.entries(USER_STORIES).map(([user, segs]) => {
            const story = STORIES.find(s => s.user === user);
            if (!story) return null;
            const first = segs[0];
            return (
              <div key={user} style={{ borderRadius:'16px', overflow:'hidden', background:first.bg, aspectRatio:'9/16', display:'flex', flexDirection:'column', justifyContent:'flex-end', padding:'12px', cursor:'pointer', position:'relative' }}
                onClick={() => openStory(story)}>
                <div style={{ fontSize:'36px', textAlign:'center', position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-60%)' }}>
                  {first.emoji}
                </div>
                {segs.length > 1 && (
                  <div style={{ position:'absolute', top:8, right:8, background:'rgba(0,0,0,0.5)', borderRadius:10, padding:'2px 7px', color:'white', fontSize:10, fontWeight:700 }}>
                    {segs.length} ▶
                  </div>
                )}
                <div style={{ fontSize:'13px', fontWeight:700, color:'white' }}>{user}</div>
                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.75)', marginTop:'2px' }}>{first.caption.substring(0,32)}…</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
