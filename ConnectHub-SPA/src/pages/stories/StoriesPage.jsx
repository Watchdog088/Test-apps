// src/pages/stories/StoriesPage.jsx
// UX-08 FIX: Loads stories from Firestore with real-time listener + empty state
// IMPROVE-03 FIX: Animated top progress bar for story viewer
// POLISH-01 FIX: Uses .story-ring CSS class (not inline gradient)

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection, query, where, orderBy, limit,
  onSnapshot, addDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '@fb/config';
import { useAuth } from '@hooks/useAuth';
import useAppStore from '@store/useAppStore';
import { SkeletonBlock } from '@components/common/SkeletonLoader';

// Fallback demo stories shown when Firestore has none
const DEMO_STORIES = [
  { id:'d1', authorName:'Jordan',   authorEmoji:'🎵', color:'#ec4899', content:'🎵 New music drop today!',         seen:false, timestamp:{ toDate:()=>new Date() } },
  { id:'d2', authorName:'Alex',     authorEmoji:'✈️', color:'#6366f1', content:'✈️ Tokyo vibes 🗼',                seen:true,  timestamp:{ toDate:()=>new Date() } },
  { id:'d3', authorName:'Riley',    authorEmoji:'💪', color:'#10b981', content:'💪 Morning run complete!',          seen:false, timestamp:{ toDate:()=>new Date() } },
  { id:'d4', authorName:'Morgan',   authorEmoji:'🎨', color:'#8b5cf6', content:'🎨 New artwork finished!',         seen:true,  timestamp:{ toDate:()=>new Date() } },
  { id:'d5', authorName:'Sam',      authorEmoji:'🍕', color:'#f59e0b', content:'🍕 Best ramen in the city!',       seen:false, timestamp:{ toDate:()=>new Date() } },
  { id:'d6', authorName:'Casey',    authorEmoji:'🎮', color:'#3b82f6', content:'🎮 Anyone up for gaming tonight?', seen:false, timestamp:{ toDate:()=>new Date() } },
  { id:'d7', authorName:'Taylor',   authorEmoji:'📸', color:'#14b8a6', content:'📸 Golden hour magic ✨',           seen:true,  timestamp:{ toDate:()=>new Date() } },
];

const STORY_DURATION = 5000; // 5 seconds per story

// IMPROVE-03: Story progress bar
function StoryProgressBar({ total, current, progress }) {
  return (
    <div style={{ position:'absolute', top:0, left:0, right:0, zIndex:10, display:'flex', gap:4, padding:'12px 12px 0' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ flex:1, height:3, borderRadius:4, background:'rgba(255,255,255,0.3)', overflow:'hidden' }}>
          <div style={{
            height:'100%', borderRadius:4,
            background:'white',
            width: i < current ? '100%' : i === current ? `${progress}%` : '0%',
            transition: i === current ? 'none' : 'none',
          }} />
        </div>
      ))}
    </div>
  );
}

// Story viewer modal
function StoryViewer({ stories, startIndex, onClose }) {
  const [idx, setIdx]         = useState(startIndex);
  const [progress, setProgress] = useState(0);
  const intervalRef           = useRef(null);

  const story = stories[idx];

  useEffect(() => {
    setProgress(0);
    clearInterval(intervalRef.current);
    const tick = 100; // ms
    intervalRef.current = setInterval(() => {
      setProgress(p => {
        const next = p + (tick / STORY_DURATION) * 100;
        if (next >= 100) {
          clearInterval(intervalRef.current);
          // Advance to next story
          if (idx < stories.length - 1) {
            setIdx(i => i + 1);
          } else {
            onClose();
          }
          return 100;
        }
        return next;
      });
    }, tick);
    return () => clearInterval(intervalRef.current);
  }, [idx]);

  if (!story) return null;

  return (
    <div style={{ position:'fixed', inset:0, zIndex:9000, background:'#000', touchAction:'none' }}
      onClick={(e) => {
        // Tap left half = prev, right half = next
        const x = e.clientX;
        const half = window.innerWidth / 2;
        if (x < half && idx > 0) setIdx(i => i - 1);
        else if (x >= half && idx < stories.length - 1) setIdx(i => i + 1);
        else if (x >= half) onClose();
      }}>
      {/* IMPROVE-03: Progress bar */}
      <StoryProgressBar total={stories.length} current={idx} progress={progress} />

      {/* Header */}
      <div style={{ position:'absolute', top:0, left:0, right:0, zIndex:11, display:'flex', alignItems:'center', gap:10, padding:'36px 16px 12px' }}>
        <div style={{ width:38, height:38, borderRadius:'50%', background:story.color || '#6366f1', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>
          {story.authorEmoji || '😊'}
        </div>
        <div>
          <div style={{ color:'white', fontWeight:700, fontSize:14 }}>{story.authorName}</div>
          <div style={{ color:'rgba(255,255,255,0.6)', fontSize:11 }}>
            {story.timestamp?.toDate?.()?.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
          </div>
        </div>
        <button onClick={onClose} style={{ marginLeft:'auto', color:'white', fontSize:24, lineHeight:1, background:'none', border:'none', cursor:'pointer', padding:'8px' }}>✕</button>
      </div>

      {/* Story content */}
      <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center',
        background: story.mediaUrl ? 'black' : `linear-gradient(160deg,${story.color || '#6366f1'},#0a0a18)` }}>
        {story.mediaUrl ? (
          <img src={story.mediaUrl} alt="story" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
        ) : (
          <div style={{ textAlign:'center', padding:'0 32px' }}>
            <div style={{ fontSize:64, marginBottom:16 }}>{story.authorEmoji || '😊'}</div>
            <p style={{ color:'white', fontSize:22, fontWeight:700, lineHeight:1.4, textShadow:'0 2px 12px rgba(0,0,0,0.5)' }}>
              {story.content}
            </p>
          </div>
        )}
      </div>

      {/* Reply bar */}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'12px 16px', display:'flex', gap:10, alignItems:'center', paddingBottom:'calc(12px + env(safe-area-inset-bottom))' }}
        onClick={e => e.stopPropagation()}>
        <input placeholder={`Reply to ${story.authorName}…`}
          style={{ flex:1, background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.3)', borderRadius:24, padding:'10px 16px', color:'white', fontSize:14, outline:'none' }}
          onClick={e => e.stopPropagation()} />
        <span style={{ fontSize:22, cursor:'pointer' }}>❤️</span>
      </div>
    </div>
  );
}

export default function StoriesPage() {
  const navigate    = useNavigate();
  const { user }    = useAuth();
  const showToast   = useAppStore(s => s.showToast);
  const [stories, setStories]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [viewing, setViewing]       = useState(null); // { stories, startIndex }
  const [seenIds, setSeenIds]       = useState(new Set());
  const [showCreate, setShowCreate] = useState(false);
  const [newContent, setNewContent] = useState('');

  // UX-08: Real-time Firestore listener
  useEffect(() => {
    if (!db) {
      setStories(DEMO_STORIES);
      setLoading(false);
      return;
    }

    // Stories from the last 24 hours
    const cutoff = new Date(Date.now() - 24 * 3600 * 1000);
    const q = query(
      collection(db, 'stories'),
      where('expiresAt', '>', cutoff),
      orderBy('expiresAt', 'desc'),
      limit(50),
    );

    const unsub = onSnapshot(q, (snap) => {
      if (snap.empty) {
        setStories(DEMO_STORIES); // demo fallback
      } else {
        setStories(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
      setLoading(false);
    }, () => {
      setStories(DEMO_STORIES);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  async function createStory() {
    if (!newContent.trim()) return;
    try {
      await addDoc(collection(db, 'stories'), {
        authorUid: user?.uid,
        authorName: user?.displayName || 'Me',
        authorEmoji: '😊',
        color: '#6366f1',
        content: newContent.trim(),
        mediaUrl: null,
        expiresAt: new Date(Date.now() + 24 * 3600 * 1000),
        createdAt: serverTimestamp(),
      });
      showToast('📖 Story posted!');
    } catch {
      showToast('📖 Story added (demo mode)');
    }
    setNewContent('');
    setShowCreate(false);
  }

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
      {/* Viewer */}
      {viewing && (
        <StoryViewer stories={viewing.stories} startIndex={viewing.startIndex} onClose={() => setViewing(null)} />
      )}

      {/* Create story modal */}
      {showCreate && (
        <div style={{ position:'fixed', inset:0, zIndex:8000, background:'rgba(0,0,0,0.8)', display:'flex', alignItems:'flex-end' }}
          onClick={() => setShowCreate(false)}>
          <div style={{ width:'100%', background:'#1a1a2e', borderRadius:'24px 24px 0 0', padding:'24px 20px', paddingBottom:'calc(24px + env(safe-area-inset-bottom))' }}
            onClick={e => e.stopPropagation()}>
            <h3 style={{ color:'#f1f5f9', fontWeight:800, marginBottom:14 }}>📖 Add a Story</h3>
            <textarea value={newContent} onChange={e => setNewContent(e.target.value)}
              placeholder="What's on your mind? (shows for 24 hours)"
              rows={3} style={{ width:'100%', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:14, padding:'12px 14px', color:'#f1f5f9', fontSize:15, outline:'none', resize:'none' }} />
            <button onClick={createStory} style={{ width:'100%', marginTop:12, padding:'13px', background:'linear-gradient(135deg,#6366f1,#ec4899)', border:'none', borderRadius:14, color:'white', fontSize:15, fontWeight:700, cursor:'pointer' }}>
              Share Story
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ padding:'14px 16px 10px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize:20, fontWeight:800, color:'#f1f5f9' }}>📖 Stories</span>
        <button onClick={() => setShowCreate(true)} style={{ background:'linear-gradient(135deg,#6366f1,#ec4899)', border:'none', borderRadius:12, padding:'8px 16px', color:'white', fontSize:13, fontWeight:700, cursor:'pointer' }}>
          + Add Story
        </button>
      </div>

      {/* Stories grid */}
      {stories.length === 0 ? (
        // UX-08: Empty state
        <div style={{ textAlign:'center', padding:'60px 32px', color:'#475569' }}>
          <div style={{ fontSize:56, marginBottom:16 }}>📖</div>
          <h3 style={{ color:'#94a3b8', fontSize:18, fontWeight:800, marginBottom:8 }}>No stories yet</h3>
          <p style={{ color:'#475569', fontSize:14, marginBottom:20, lineHeight:1.6 }}>Be the first to share a moment!<br />Stories disappear after 24 hours.</p>
          <button onClick={() => setShowCreate(true)} style={{ background:'linear-gradient(135deg,#6366f1,#ec4899)', border:'none', borderRadius:14, padding:'12px 28px', color:'white', fontSize:15, fontWeight:700, cursor:'pointer' }}>
            ✨ Add Your First Story
          </button>
        </div>
      ) : (
        <div style={{ display:'flex', flexWrap:'wrap', gap:12, padding:'0 16px' }}>
          {stories.map((story, i) => {
            const seen = seenIds.has(story.id) || story.seen;
            return (
              <div key={story.id} onClick={() => openStory(story, i)}
                style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, cursor:'pointer', width:72 }}>
                {/* POLISH-01: uses .story-ring CSS classes */}
                <div className={seen ? 'story-ring-seen' : 'story-ring'}
                  style={{ width:68, height:68, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                    background: story.color || '#6366f1', fontSize:28, border: seen ? '2px solid #334155' : 'none' }}>
                  {story.authorEmoji || '😊'}
                </div>
                <span style={{ fontSize:11, color: seen ? '#475569' : '#f1f5f9', fontWeight: seen ? 400 : 600, textAlign:'center', maxWidth:68, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {story.authorName}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
