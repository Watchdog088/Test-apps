import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const STORIES = [
  { id: 1, user: 'You', emoji: '😊', color: '#6366f1', hasNew: false, isYou: true },
  { id: 2, user: 'Jordan', emoji: '🔥', color: '#ec4899', hasNew: true },
  { id: 3, user: 'Alex', emoji: '🎵', color: '#10b981', hasNew: true },
  { id: 4, user: 'Riley', emoji: '✈️', color: '#f59e0b', hasNew: true },
  { id: 5, user: 'Sam', emoji: '🎮', color: '#3b82f6', hasNew: false },
  { id: 6, user: 'Morgan', emoji: '🌊', color: '#8b5cf6', hasNew: true },
  { id: 7, user: 'Casey', emoji: '🍕', color: '#ef4444', hasNew: false },
  { id: 8, user: 'Drew', emoji: '📸', color: '#14b8a6', hasNew: true },
];

const STORY_CONTENT = [
  { bg: 'linear-gradient(135deg,#6366f1,#ec4899)', emoji: '🌆', caption: 'Beautiful evening in the city! 🌆✨', user: 'Jordan' },
  { bg: 'linear-gradient(135deg,#10b981,#3b82f6)', emoji: '🎵', caption: 'New track dropping soon 🎵🔥', user: 'Alex' },
  { bg: 'linear-gradient(135deg,#f59e0b,#ef4444)', emoji: '✈️', caption: 'Off to Paris! ✈️🗼', user: 'Riley' },
  { bg: 'linear-gradient(135deg,#8b5cf6,#ec4899)', emoji: '🌊', caption: 'Beach vibes all day 🌊☀️', user: 'Morgan' },
  { bg: 'linear-gradient(135deg,#14b8a6,#6366f1)', emoji: '📸', caption: 'Golden hour photography 📸💛', user: 'Drew' },
];

export default function StoriesPage() {
  const navigate = useNavigate();
  const [viewing, setViewing] = useState(null);
  const [progress, setProgress] = useState(0);
  const [storyIdx, setStoryIdx] = useState(0);

  const openStory = (story) => {
    if (story.isYou) return;
    const idx = STORY_CONTENT.findIndex(s => s.user === story.user) ?? 0;
    setStoryIdx(Math.max(0, idx));
    setViewing(story);
    setProgress(0);
    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(timer); setViewing(null); return 0; }
        return p + 2;
      });
    }, 60);
  };

  const closeViewer = () => { setViewing(null); setProgress(0); };
  const nextStory = () => {
    const next = Math.min(storyIdx + 1, STORY_CONTENT.length - 1);
    setStoryIdx(next); setProgress(0);
    if (next >= STORY_CONTENT.length - 1) closeViewer();
  };

  const currentContent = STORY_CONTENT[storyIdx] || STORY_CONTENT[0];

  return (
    <div style={{ background: '#0f172a', minHeight: '100vh', paddingBottom: '80px' }}>
      {/* Story Viewer Overlay */}
      {viewing && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: '#000' }}>
          <div style={{ height: '3px', background: '#333', position: 'absolute', top: 0, left: 0, right: 0 }}>
            <div style={{ height: '100%', background: 'white', width: `${progress}%`, transition: 'width 0.1s linear' }} />
          </div>
          <div style={{ position: 'absolute', top: '16px', left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', border: '2px solid white' }}>{viewing.emoji}</div>
              <span style={{ color: 'white', fontWeight: 700, fontSize: '15px' }}>{viewing.user}</span>
            </div>
            <button onClick={closeViewer} style={{ background: 'none', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer' }}>✕</button>
          </div>
          <div style={{ width: '100%', height: '100%', background: currentContent.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }} onClick={nextStory}>
            <div style={{ fontSize: '80px' }}>{currentContent.emoji}</div>
            <div style={{ color: 'white', fontSize: '20px', fontWeight: 700, textAlign: 'center', padding: '0 32px' }}>{currentContent.caption}</div>
          </div>
          <div style={{ position: 'absolute', bottom: '32px', left: 0, right: 0, display: 'flex', gap: '12px', padding: '0 16px' }}>
            <input placeholder="Reply to story..." style={{ flex: 1, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '24px', padding: '10px 16px', color: 'white', fontSize: '14px', outline: 'none' }} onClick={e => e.stopPropagation()} />
            <button style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }} onClick={e => e.stopPropagation()}>❤️</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ padding: '16px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '20px', fontWeight: 700, color: '#f1f5f9' }}>Stories</span>
        <button style={{ background: 'linear-gradient(135deg,#6366f1,#ec4899)', color: 'white', border: 'none', borderRadius: '20px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>+ Create</button>
      </div>

      {/* Story Bubbles Row */}
      <div style={{ display: 'flex', gap: '12px', padding: '16px', overflowX: 'auto' }}>
        {STORIES.map(story => (
          <div key={story.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer', flexShrink: 0 }} onClick={() => openStory(story)}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', padding: '2px', background: story.hasNew ? 'linear-gradient(135deg,#6366f1,#ec4899)' : '#334155' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: story.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', border: '2px solid #0f172a' }}>
                {story.isYou ? <span style={{ fontSize: '22px', color: 'white', fontWeight: 700 }}>+</span> : story.emoji}
              </div>
            </div>
            <span style={{ fontSize: '11px', color: '#94a3b8', maxWidth: '64px', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{story.user}</span>
          </div>
        ))}
      </div>

      {/* Recent Stories Grid */}
      <div style={{ padding: '0 16px' }}>
        <div style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9', marginBottom: '12px' }}>Recent Stories</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {STORY_CONTENT.map((s, i) => (
            <div key={i} style={{ borderRadius: '16px', overflow: 'hidden', background: s.bg, aspectRatio: '9/16', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '12px', cursor: 'pointer', position: 'relative' }} onClick={() => openStory(STORIES.find(st => st.user === s.user) || STORIES[1])}>
              <div style={{ fontSize: '32px', textAlign: 'center', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-60%)' }}>{s.emoji}</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'white' }}>{s.user}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', marginTop: '2px' }}>{s.caption.substring(0, 30)}...</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
