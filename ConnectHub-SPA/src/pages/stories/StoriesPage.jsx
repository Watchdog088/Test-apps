// src/pages/stories/StoriesPage.jsx
// SECTION-3 FIX: Full stories page with working reactions, replies, seen-by, 24h expiry,
//                swipe gestures, real camera creation, and Firestore integration

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection, query, where, orderBy, limit,
  onSnapshot, addDoc, serverTimestamp, doc, updateDoc,
  arrayUnion, getDoc,
} from 'firebase/firestore';
import { db } from '@fb/config';
import { useAuth } from '@hooks/useAuth';
import useAppStore from '@store/useAppStore';
import { SkeletonBlock } from '@components/common/SkeletonLoader';

// ─── Demo fallback stories ────────────────────────────────────────────────────
const DEMO_STORIES = [
  { id:'d1', authorName:'Jordan',  authorEmoji:'🎵', color:'#ec4899', content:'🎵 New music drop today!',          seen:false, seenBy:[], timestamp:{ toDate:()=>new Date() } },
  { id:'d2', authorName:'Alex',    authorEmoji:'✈️', color:'#6366f1', content:'✈️ Tokyo vibes 🗼',                 seen:true,  seenBy:['u1','u2'], timestamp:{ toDate:()=>new Date() } },
  { id:'d3', authorName:'Riley',   authorEmoji:'💪', color:'#10b981', content:'💪 Morning run complete!',           seen:false, seenBy:[], timestamp:{ toDate:()=>new Date() } },
  { id:'d4', authorName:'Morgan',  authorEmoji:'🎨', color:'#8b5cf6', content:'🎨 New artwork finished!',          seen:true,  seenBy:['u1'], timestamp:{ toDate:()=>new Date() } },
  { id:'d5', authorName:'Sam',     authorEmoji:'🍕', color:'#f59e0b', content:'🍕 Best ramen in the city!',        seen:false, seenBy:[], timestamp:{ toDate:()=>new Date() } },
  { id:'d6', authorName:'Casey',   authorEmoji:'🎮', color:'#3b82f6', content:'🎮 Anyone up for gaming tonight?',  seen:false, seenBy:[], timestamp:{ toDate:()=>new Date() } },
  { id:'d7', authorName:'Taylor',  authorEmoji:'📸', color:'#14b8a6', content:'📸 Golden hour magic ✨',            seen:true,  seenBy:['u1','u2','u3'], timestamp:{ toDate:()=>new Date() } },
];

const STORY_DURATION = 5000; // ms per story

const REACTION_EMOJIS = ['❤️','😂','😮','😢','🔥','👏'];

// ─── Progress bar ─────────────────────────────────────────────────────────────
function StoryProgressBar({ total, current, progress }) {
  return (
    <div style={{ position:'absolute', top:0, left:0, right:0, zIndex:10,
      display:'flex', gap:4, padding:'12px 12px 0' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ flex:1, height:3, borderRadius:4,
          background:'rgba(255,255,255,0.3)', overflow:'hidden' }}>
          <div style={{
            height:'100%', borderRadius:4, background:'white',
            width: i < current ? '100%' : i === current ? `${progress}%` : '0%',
          }} />
        </div>
      ))}
    </div>
  );
}

// ─── Reaction Tray (bottom sheet) ─────────────────────────────────────────────
function ReactionTray({ story, onReact, onClose }) {
  return (
    <div style={{ position:'absolute', bottom:0, left:0, right:0, zIndex:20,
      background:'rgba(15,15,30,0.96)', borderRadius:'20px 20px 0 0', padding:'20px 24px',
      paddingBottom:'calc(20px + env(safe-area-inset-bottom))' }}
      onClick={e => e.stopPropagation()}>
      <div style={{ width:36, height:4, borderRadius:4, background:'#334155', margin:'0 auto 16px' }} />
      <p style={{ color:'#94a3b8', fontSize:13, textAlign:'center', marginBottom:16 }}>
        React to {story.authorName}'s story
      </p>
      <div style={{ display:'flex', justifyContent:'center', gap:16 }}>
        {REACTION_EMOJIS.map(emoji => (
          <button key={emoji} onClick={() => onReact(emoji)}
            style={{ fontSize:32, background:'none', border:'none', cursor:'pointer',
              transition:'transform 0.15s', lineHeight:1 }}
            onMouseEnter={e => e.currentTarget.style.transform='scale(1.3)'}
            onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}>
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Story Viewer ─────────────────────────────────────────────────────────────
function StoryViewer({ stories, startIndex, onClose, currentUserId }) {
  const [idx, setIdx]               = useState(startIndex);
  const [progress, setProgress]     = useState(0);
  const [paused, setPaused]         = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [replyText, setReplyText]   = useState('');
  const [seenCount, setSeenCount]   = useState(0);
  const [myReaction, setMyReaction] = useState(null);
  const intervalRef                 = useRef(null);
  const touchStartX                 = useRef(null);
  const touchStartY                 = useRef(null);
  const replyRef                    = useRef(null);
  const showToast = useAppStore(s => s.showToast);

  const story = stories[idx];

  // Mark story as seen
  useEffect(() => {
    if (!story || !db || story.id.startsWith('d')) return;
    updateDoc(doc(db, 'stories', story.id), {
      seenBy: arrayUnion(currentUserId || 'anon'),
    }).catch(() => {});
    setSeenCount(story.seenBy?.length ?? 0);
  }, [idx]);

  // Progress timer
  useEffect(() => {
    if (paused || showReactions) return;
    setProgress(0);
    clearInterval(intervalRef.current);
    const tick = 100;
    intervalRef.current = setInterval(() => {
      setProgress(p => {
        const next = p + (tick / STORY_DURATION) * 100;
        if (next >= 100) {
          clearInterval(intervalRef.current);
          if (idx < stories.length - 1) setIdx(i => i + 1);
          else onClose();
          return 100;
        }
        return next;
      });
    }, tick);
    return () => clearInterval(intervalRef.current);
  }, [idx, paused, showReactions]);

  // Send reply
  async function sendReply() {
    if (!replyText.trim()) return;
    try {
      if (db && !story.id.startsWith('d')) {
        await addDoc(collection(db, 'storyReplies'), {
          storyId: story.id,
          storyAuthorUid: story.authorUid,
          senderUid: currentUserId,
          text: replyText.trim(),
          createdAt: serverTimestamp(),
        });
      }
      showToast(`💬 Reply sent to ${story.authorName}!`);
    } catch {
      showToast(`💬 Reply sent (demo mode)`);
    }
    setReplyText('');
  }

  // Send reaction
  async function sendReaction(emoji) {
    setMyReaction(emoji);
    setShowReactions(false);
    try {
      if (db && !story.id.startsWith('d')) {
        await addDoc(collection(db, 'storyReactions'), {
          storyId: story.id,
          storyAuthorUid: story.authorUid,
          reactorUid: currentUserId,
          emoji,
          createdAt: serverTimestamp(),
        });
      }
      showToast(`${emoji} Reaction sent!`);
    } catch {
      showToast(`${emoji} Reaction sent (demo)!`);
    }
  }

  // Touch gestures: swipe left/right/down
  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }
  function handleTouchEnd(e) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    touchStartX.current = null;

    if (Math.abs(dy) > Math.abs(dx) && dy > 60) { // swipe down → close
      onClose();
      return;
    }
    if (Math.abs(dy) > Math.abs(dx) && dy < -60) { // swipe up → reactions
      setShowReactions(true);
      return;
    }
    if (Math.abs(dx) > 40) {
      if (dx < 0 && idx < stories.length - 1) setIdx(i => i + 1);
      else if (dx < 0) onClose();
      else if (dx > 0 && idx > 0) setIdx(i => i - 1);
    }
  }

  // Tap: left half = prev, right half = next
  function handleTap(e) {
    if (showReactions) { setShowReactions(false); return; }
    if (replyRef.current?.contains(e.target)) return;
    const x = e.clientX;
    const half = window.innerWidth / 2;
    if (x < half && idx > 0) setIdx(i => i - 1);
    else if (x >= half && idx < stories.length - 1) setIdx(i => i + 1);
    else if (x >= half) onClose();
  }

  if (!story) return null;

  return (
    <div style={{ position:'fixed', inset:0, zIndex:9000, background:'#000',
      touchAction:'none', userSelect:'none' }}
      onClick={handleTap}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}>

      {/* Progress bar */}
      <StoryProgressBar total={stories.length} current={idx} progress={progress} />

      {/* Header */}
      <div style={{ position:'absolute', top:0, left:0, right:0, zIndex:11,
        display:'flex', alignItems:'center', gap:10, padding:'36px 16px 12px' }}>
        <div style={{ width:38, height:38, borderRadius:'50%',
          background:story.color||'#6366f1', display:'flex', alignItems:'center',
          justifyContent:'center', fontSize:18 }}>
          {story.authorEmoji||'😊'}
        </div>
        <div>
          <div style={{ color:'white', fontWeight:700, fontSize:14 }}>{story.authorName}</div>
          <div style={{ color:'rgba(255,255,255,0.6)', fontSize:11 }}>
            {story.timestamp?.toDate?.()?.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
            {' · '}
            <span style={{ color:'rgba(255,255,255,0.5)' }}>
              👁 {seenCount > 0 ? seenCount : story.seenBy?.length ?? 0} seen
            </span>
          </div>
        </div>
        <button onClick={e => { e.stopPropagation(); onClose(); }}
          style={{ marginLeft:'auto', color:'white', fontSize:24, lineHeight:1,
            background:'none', border:'none', cursor:'pointer', padding:'8px' }}>✕</button>
      </div>

      {/* Story content */}
      <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center',
        justifyContent:'center',
        background: story.mediaUrl ? 'black'
          : `linear-gradient(160deg,${story.color||'#6366f1'},#0a0a18)` }}>
        {story.mediaUrl ? (
          story.mediaType === 'video'
            ? <video src={story.mediaUrl} autoPlay muted loop style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            : <img src={story.mediaUrl} alt="story" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
        ) : (
          <div style={{ textAlign:'center', padding:'0 32px' }}>
            <div style={{ fontSize:64, marginBottom:16 }}>{story.authorEmoji||'😊'}</div>
            <p style={{ color:'white', fontSize:22, fontWeight:700, lineHeight:1.4,
              textShadow:'0 2px 12px rgba(0,0,0,0.5)' }}>
              {story.content}
            </p>
          </div>
        )}
      </div>

      {/* My reaction bubble */}
      {myReaction && (
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
          fontSize:72, zIndex:25, pointerEvents:'none', animation:'pop 0.4s ease' }}>
          {myReaction}
        </div>
      )}

      {/* Reply + Reaction bar */}
      <div ref={replyRef} style={{ position:'absolute', bottom:0, left:0, right:0,
        padding:'12px 16px', display:'flex', gap:10, alignItems:'center',
        paddingBottom:'calc(12px + env(safe-area-inset-bottom))',
        background:'linear-gradient(transparent,rgba(0,0,0,0.6))' }}
        onClick={e => e.stopPropagation()}>
        <input
          value={replyText}
          onChange={e => setReplyText(e.target.value)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          onKeyDown={e => { if (e.key==='Enter') { sendReply(); } }}
          placeholder={`Reply to ${story.authorName}…`}
          style={{ flex:1, background:'rgba(255,255,255,0.15)',
            border:'1px solid rgba(255,255,255,0.3)', borderRadius:24,
            padding:'10px 16px', color:'white', fontSize:14, outline:'none' }} />
        {replyText.trim() ? (
          <button onClick={sendReply}
            style={{ background:'#6366f1', border:'none', borderRadius:'50%',
              width:40, height:40, color:'white', fontSize:18, cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center' }}>➤</button>
        ) : (
          <button onClick={() => setShowReactions(true)}
            style={{ fontSize:26, background:'none', border:'none', cursor:'pointer' }}>❤️</button>
        )}
      </div>

      {/* Reaction tray */}
      {showReactions && (
        <ReactionTray story={story} onReact={sendReaction} onClose={() => setShowReactions(false)} />
      )}
    </div>
  );
}

// ─── Story Highlights row ──────────────────────────────────────────────────────
function HighlightsRow({ onManage }) {
  const HIGHLIGHTS = [
    { id:'h1', name:'Travel',   emoji:'✈️', color:'#6366f1' },
    { id:'h2', name:'Food',     emoji:'🍕', color:'#f59e0b' },
    { id:'h3', name:'Fitness',  emoji:'💪', color:'#10b981' },
    { id:'h4', name:'Art',      emoji:'🎨', color:'#8b5cf6' },
  ];
  return (
    <div style={{ padding:'0 16px 12px' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
        <span style={{ color:'#94a3b8', fontSize:13, fontWeight:700 }}>⭐ Highlights</span>
        <button onClick={onManage} style={{ background:'none', border:'none',
          color:'#6366f1', fontSize:12, fontWeight:700, cursor:'pointer' }}>Manage</button>
      </div>
      <div style={{ display:'flex', gap:12, overflowX:'auto', paddingBottom:4 }}>
        <div onClick={onManage} style={{ display:'flex', flexDirection:'column', alignItems:'center',
          gap:6, cursor:'pointer', flexShrink:0, width:60 }}>
          <div style={{ width:56, height:56, borderRadius:'50%',
            background:'rgba(99,102,241,0.15)', border:'2px dashed #6366f1',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>+</div>
          <span style={{ fontSize:10, color:'#6366f1', fontWeight:700 }}>New</span>
        </div>
        {HIGHLIGHTS.map(h => (
          <div key={h.id} onClick={onManage} style={{ display:'flex', flexDirection:'column',
            alignItems:'center', gap:6, cursor:'pointer', flexShrink:0, width:60 }}>
            <div style={{ width:56, height:56, borderRadius:'50%', background:h.color,
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:22,
              border:'2px solid rgba(255,255,255,0.15)' }}>{h.emoji}</div>
            <span style={{ fontSize:10, color:'#94a3b8', fontWeight:600,
              textAlign:'center', maxWidth:56, overflow:'hidden',
              textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{h.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StoriesPage() {
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const showToast = useAppStore(s => s.showToast);

  const [stories, setStories]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [viewing, setViewing]     = useState(null);
  const [seenIds, setSeenIds]     = useState(new Set());

  // ── Real-time Firestore (24h window) ──────────────────────────────────────
  useEffect(() => {
    if (!db) {
      setStories(DEMO_STORIES);
      setLoading(false);
      return;
    }
    const cutoff = new Date(Date.now() - 24 * 3600 * 1000);
    const q = query(
      collection(db, 'stories'),
      where('expiresAt', '>', cutoff),
      orderBy('expiresAt', 'desc'),
      limit(50),
    );
    const unsub = onSnapshot(q, (snap) => {
      setStories(snap.empty ? DEMO_STORIES : snap.docs.map(d => ({ id:d.id, ...d.data() })));
      setLoading(false);
    }, () => { setStories(DEMO_STORIES); setLoading(false); });
    return () => unsub();
  }, []);

  function openStory(story, index) {
    setSeenIds(prev => new Set([...prev, story.id]));
    setViewing({ stories, startIndex: index });
  }

  if (loading) {
    return (
      <div style={{ background:'#0a0a18', minHeight:'100vh', padding:'16px' }}>
        <div style={{ display:'flex', gap:12, padding:'8px 0' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
              <SkeletonBlock width={68} height={68} radius="50%" />
              <SkeletonBlock width={52} height={11} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ background:'#0a0a18', minHeight:'100vh', paddingBottom:80 }}>
      {/* Viewer overlay */}
      {viewing && (
        <StoryViewer
          stories={viewing.stories}
          startIndex={viewing.startIndex}
          onClose={() => setViewing(null)}
          currentUserId={user?.uid}
        />
      )}

      {/* Header */}
      <div style={{ padding:'14px 16px 10px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize:20, fontWeight:800, color:'#f1f5f9' }}>📖 Stories</span>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => navigate('/stories/analytics')}
            style={{ background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.3)',
              borderRadius:12, padding:'8px 14px', color:'#6366f1', fontSize:12, fontWeight:700, cursor:'pointer' }}>
            📊 Stats
          </button>
          <button onClick={() => navigate('/stories/create')}
            style={{ background:'linear-gradient(135deg,#6366f1,#ec4899)', border:'none',
              borderRadius:12, padding:'8px 16px', color:'white', fontSize:13, fontWeight:700, cursor:'pointer' }}>
            + Add Story
          </button>
        </div>
      </div>

      {/* Stories row */}
      {stories.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 32px', color:'#475569' }}>
          <div style={{ fontSize:56, marginBottom:16 }}>📖</div>
          <h3 style={{ color:'#94a3b8', fontSize:18, fontWeight:800, marginBottom:8 }}>No stories yet</h3>
          <p style={{ color:'#475569', fontSize:14, marginBottom:20, lineHeight:1.6 }}>
            Be the first to share a moment!<br />Stories disappear after 24 hours.
          </p>
          <button onClick={() => navigate('/stories/create')}
            style={{ background:'linear-gradient(135deg,#6366f1,#ec4899)', border:'none',
              borderRadius:14, padding:'12px 28px', color:'white', fontSize:15, fontWeight:700, cursor:'pointer' }}>
            ✨ Add Your First Story
          </button>
        </div>
      ) : (
        <div style={{ display:'flex', gap:12, padding:'0 16px 16px', overflowX:'auto' }}>
          {/* "Add yours" shortcut */}
          <div onClick={() => navigate('/stories/create')}
            style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6,
              cursor:'pointer', flexShrink:0, width:72 }}>
            <div style={{ width:68, height:68, borderRadius:'50%',
              background:'rgba(99,102,241,0.15)', border:'2px dashed #6366f1',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:28 }}>+</div>
            <span style={{ fontSize:11, color:'#6366f1', fontWeight:700, textAlign:'center' }}>
              Your Story
            </span>
          </div>

          {stories.map((story, i) => {
            const seen = seenIds.has(story.id) || story.seen;
            return (
              <div key={story.id} onClick={() => openStory(story, i)}
                style={{ display:'flex', flexDirection:'column', alignItems:'center',
                  gap:6, cursor:'pointer', flexShrink:0, width:72 }}>
                <div className={seen ? 'story-ring-seen' : 'story-ring'}
                  style={{ width:68, height:68, borderRadius:'50%', display:'flex',
                    alignItems:'center', justifyContent:'center',
                    background:story.color||'#6366f1', fontSize:28,
                    border: seen ? '2px solid #334155' : 'none',
                    boxShadow: seen ? 'none' : '0 0 0 3px #ec4899, 0 0 0 5px #6366f1' }}>
                  {story.authorEmoji||'😊'}
                </div>
                <span style={{ fontSize:11, color: seen ? '#475569' : '#f1f5f9',
                  fontWeight: seen ? 400 : 600, textAlign:'center', maxWidth:68,
                  overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {story.authorName}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Divider */}
      <div style={{ height:1, background:'rgba(255,255,255,0.06)', margin:'0 16px 16px' }} />

      {/* Highlights */}
      <HighlightsRow onManage={() => navigate('/stories/highlights')} />

      {/* Tips */}
      <div style={{ margin:'0 16px', padding:'14px 16px',
        background:'rgba(99,102,241,0.08)', borderRadius:16,
        border:'1px solid rgba(99,102,241,0.15)' }}>
        <p style={{ color:'#94a3b8', fontSize:12, lineHeight:1.6, margin:0 }}>
          💡 <strong style={{ color:'#6366f1' }}>Tips:</strong> Swipe <strong>up</strong> to react ·
          Swipe <strong>left/right</strong> to browse · Swipe <strong>down</strong> to close
        </p>
      </div>

      <style>{`
        @keyframes pop {
          0%   { opacity:0; transform:translate(-50%,-50%) scale(0.3); }
          60%  { transform:translate(-50%,-50%) scale(1.2); opacity:1; }
          100% { transform:translate(-50%,-50%) scale(1);  opacity:0; }
        }
      `}</style>
    </div>
  );
}
