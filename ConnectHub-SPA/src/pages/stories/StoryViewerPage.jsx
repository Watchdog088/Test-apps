// src/pages/stories/StoryViewerPage.jsx — Full-screen story viewer
// ITEM-10 FIX (Jun 2026): Added touch swipe gestures (left/right) for mobile navigation
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const DEMO = [
  { id:'1', user:'Alex Rivera', avatar:'AR', text:'Good morning! ☀️', bg:'linear-gradient(135deg,#6366f1,#ec4899)', ts:'2h ago' },
  { id:'2', user:'Sam Chen', avatar:'SC', text:'Just finished my workout 💪', bg:'linear-gradient(135deg,#f59e0b,#ef4444)', ts:'1h ago' },
  { id:'3', user:'Jordan Lee', avatar:'JL', text:'Beautiful day in the city 🌆', bg:'linear-gradient(135deg,#10b981,#3b82f6)', ts:'45m ago' },
];

const S = {
  wrap: { position:'fixed', inset:0, background:'#000', zIndex:9999, display:'flex', flexDirection:'column', userSelect:'none' },
  bar: { display:'flex', gap:4, padding:'12px 16px 0', zIndex:2 },
  seg: { height:3, borderRadius:2, background:'rgba(255,255,255,0.35)', flex:1, overflow:'hidden' },
  fill: { height:'100%', background:'#fff', transition:'width 0.1s linear' },
  head: { display:'flex', alignItems:'center', gap:10, padding:'10px 16px', zIndex:2 },
  av: { width:36, height:36, borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:14 },
  name: { color:'#fff', fontWeight:700, fontSize:14, flex:1 },
  ts: { color:'rgba(255,255,255,0.6)', fontSize:12 },
  close: { background:'none', border:'none', color:'#fff', fontSize:24, cursor:'pointer', padding:4 },
  body: { flex:1, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' },
  content: { width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, color:'#fff', fontWeight:700, padding:32, textAlign:'center' },
  navL: { position:'absolute', left:0, top:0, bottom:0, width:'40%', cursor:'pointer' },
  navR: { position:'absolute', right:0, top:0, bottom:0, width:'40%', cursor:'pointer' },
};

export default function StoryViewerPage() {
  const { uid } = useParams();
  const navigate = useNavigate();
  const [idx, setIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const DURATION = 5000;
  const SWIPE_THRESHOLD = 50; // px — minimum horizontal swipe distance

  const story = DEMO[idx] || DEMO[0];

  useEffect(() => {
    setProgress(0);
    const start = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / DURATION) * 100, 100);
      setProgress(pct);
      if (pct >= 100) { clearInterval(intervalRef.current); advance(); }
    }, 50);
    return () => clearInterval(intervalRef.current);
  }, [idx]);

  const advance = () => {
    if (idx < DEMO.length - 1) setIdx(i => i + 1);
    else navigate(-1);
  };
  const back = () => { if (idx > 0) setIdx(i => i - 1); };

  // ── ITEM-10 FIX: Touch swipe handlers ──────────────────────────────────────
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    // Pause timer while touching
    clearInterval(intervalRef.current);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // Only treat as horizontal swipe if horizontal movement dominates
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > SWIPE_THRESHOLD) {
      if (deltaX < 0) {
        // Swipe left → advance to next story
        advance();
      } else {
        // Swipe right → go back to previous story
        back();
      }
    } else {
      // Tap — split screen in half: left half = back, right half = advance
      const screenMid = window.innerWidth / 2;
      if (touchStartX.current < screenMid) back();
      else advance();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const handleTouchMove = (e) => {
    // Prevent page scroll while swiping stories
    e.preventDefault();
  };

  return (
    <div
      style={{ ...S.wrap, background: story.bg }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
    >
      <div style={S.bar}>
        {DEMO.map((s, i) => (
          <div key={s.id} style={S.seg}>
            <div style={{ ...S.fill, width: i < idx ? '100%' : i === idx ? `${progress}%` : '0%' }} />
          </div>
        ))}
      </div>
      <div style={S.head}>
        <div style={S.av}>{story.avatar}</div>
        <div style={S.name}>{story.user}</div>
        <span style={S.ts}>{story.ts}</span>
        <button style={S.close} onClick={() => navigate(-1)}>✕</button>
      </div>
      <div style={S.body}>
        <div style={S.content}>{story.text}</div>
        {/* Click zones remain for desktop/mouse users */}
        <div style={S.navL} onClick={back} />
        <div style={S.navR} onClick={advance} />
      </div>
    </div>
  );
}
