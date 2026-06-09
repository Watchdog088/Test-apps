// src/components/common/StoriesStrip.jsx
// GAP #4 — Horizontal Stories strip shown at the top of the Feed (Instagram-style)
// Reads real stories from Firestore; falls back to "Add Story" CTA when empty.
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, limit, onSnapshot, Timestamp } from 'firebase/firestore';
import { db, auth } from '@/firebase/config';

const STORY_BG = [
  'linear-gradient(135deg,#6366f1,#ec4899)',
  'linear-gradient(135deg,#f59e0b,#ef4444)',
  'linear-gradient(135deg,#10b981,#3b82f6)',
  'linear-gradient(135deg,#8b5cf6,#06b6d4)',
  'linear-gradient(135deg,#f43f5e,#fb923c)',
  'linear-gradient(135deg,#0ea5e9,#8b5cf6)',
];

function StoryBubble({ story, onClick, isOwn }) {
  const bg = STORY_BG[story.idx % STORY_BG.length];
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 6, background: 'none', border: 'none', cursor: 'pointer',
        flexShrink: 0, padding: '4px 2px',
      }}
    >
      {/* Ring */}
      <div style={{
        width: 64, height: 64, borderRadius: '50%', padding: 2,
        background: story.seen ? 'rgba(255,255,255,0.15)' : bg,
      }}>
        <div style={{
          width: '100%', height: '100%', borderRadius: '50%',
          background: story.avatarUrl
            ? `url(${story.avatarUrl}) center/cover`
            : bg,
          border: '2px solid #0f0c29',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, color: 'white', fontWeight: 800,
          overflow: 'hidden',
        }}>
          {!story.avatarUrl && (story.displayName?.[0] || '?')}
        </div>
      </div>
      {/* Label */}
      <span style={{
        fontSize: 11, color: '#94a3b8', maxWidth: 64,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        textAlign: 'center', lineHeight: 1.2,
      }}>
        {isOwn ? 'Your Story' : (story.displayName || 'User')}
      </span>
    </button>
  );
}

export default function StoriesStrip() {
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    // Load stories from last 24 h
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const q = query(
      collection(db, 'stories'),
      where('expiresAt', '>', Timestamp.fromDate(cutoff)),
      orderBy('expiresAt', 'desc'),
      limit(20)
    );
    const unsub = onSnapshot(q, (snap) => {
      const seen = JSON.parse(localStorage.getItem('lynk_seen_stories') || '[]');
      const items = snap.docs.map((d, i) => ({
        id: d.id, idx: i,
        ...d.data(),
        seen: seen.includes(d.id),
      }));
      setStories(items);
    }, () => {});
    return unsub;
  }, []);

  const handleView = (story) => {
    // Mark as seen
    const seen = JSON.parse(localStorage.getItem('lynk_seen_stories') || '[]');
    if (!seen.includes(story.id)) {
      localStorage.setItem('lynk_seen_stories', JSON.stringify([...seen, story.id]));
    }
    navigate('/stories');
  };

  const uid = auth.currentUser?.uid;
  // Put the user's own story (or "Add" button) first
  const myStory = stories.find(s => s.userId === uid);
  const others = stories.filter(s => s.userId !== uid);

  return (
    <div
      ref={scrollRef}
      style={{
        display: 'flex', overflowX: 'auto', gap: 8,
        padding: '12px 16px 8px',
        scrollbarWidth: 'none', msOverflowStyle: 'none',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(10,8,30,0.6)',
      }}
    >
      {/* Add / My Story */}
      <button
        onClick={() => navigate(myStory ? '/stories' : '/stories/create')}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 6, background: 'none', border: 'none', cursor: 'pointer',
          flexShrink: 0, padding: '4px 2px',
        }}
      >
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'rgba(99,102,241,0.18)',
          border: '2px dashed rgba(99,102,241,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, color: '#6366f1',
          position: 'relative',
        }}>
          {myStory ? '▶' : '+'}
        </div>
        <span style={{ fontSize: 11, color: '#6366f1', fontWeight: 700 }}>
          {myStory ? 'My Story' : 'Add Story'}
        </span>
      </button>

      {/* Other users' stories */}
      {others.map((s) => (
        <StoryBubble key={s.id} story={s} onClick={() => handleView(s)} isOwn={false} />
      ))}

      {/* If no stories yet — show placeholder avatars */}
      {others.length === 0 && (
        ['👋', '🌟', '🔥', '💫'].map((emoji, i) => (
          <button
            key={i}
            onClick={() => navigate('/friends/find')}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 6, background: 'none', border: 'none', cursor: 'pointer',
              flexShrink: 0, padding: '4px 2px', opacity: 0.4,
            }}
          >
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: STORY_BG[i],
              border: '2px solid #1e1a3a',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24,
            }}>{emoji}</div>
            <span style={{ fontSize: 11, color: '#475569' }}>Follow more</span>
          </button>
        ))
      )}
    </div>
  );
}
