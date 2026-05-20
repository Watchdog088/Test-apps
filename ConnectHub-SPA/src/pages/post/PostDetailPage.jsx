// src/pages/post/PostDetailPage.jsx
// Full post detail view with comments thread, likes, share
// Navigated to from: Feed author click, Saved posts, Notifications, Search results

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import useAppStore from '@store/useAppStore';

const DEMO_POST = {
  id: 'dp1',
  authorName: 'Jordan Maxwell',
  authorUid: 'user-001',
  authorEmoji: '🎵',
  content: 'Just dropped my new track 🎵 Let me know what you think! Been working on this for weeks and I\'m so proud of how it turned out. The beat, the lyrics — everything came together perfectly.',
  mediaUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600',
  likes: 248,
  comments: 32,
  shares: 12,
  createdAt: { toDate: () => new Date(Date.now() - 120000) },
};

const DEMO_COMMENTS = [
  { id: 1, author: 'Riley Johnson', authorEmoji: '💪', text: 'This is absolutely fire! 🔥 Been on repeat all day.', time: '2m', likes: 14 },
  { id: 2, author: 'Alex Chen', authorEmoji: '✈️', text: 'Amazing work! The production quality is insane. 🎶', time: '5m', likes: 8 },
  { id: 3, author: 'Morgan Taylor', authorEmoji: '🎨', text: 'Chills every single time. You\'ve outdone yourself!', time: '12m', likes: 22 },
  { id: 4, author: 'Sam Rivera', authorEmoji: '🍕', text: 'This slaps so hard. When\'s the full album dropping?', time: '18m', likes: 5 },
  { id: 5, author: 'Casey Lee', authorEmoji: '🌙', text: 'Saved this track immediately. Masterpiece 💜', time: '25m', likes: 11 },
];

function timeAgo(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

export default function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const showToast = useAppStore(s => s.showToast);

  const [post] = useState(DEMO_POST);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(248);
  const [saved, setSaved] = useState(false);
  const [comments, setComments] = useState(DEMO_COMMENTS);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);

  function handleLike() {
    const next = !liked;
    setLiked(next);
    setLikes(l => l + (next ? 1 : -1));
    if (navigator.vibrate) navigator.vibrate(20);
  }

  function handleSave() {
    setSaved(s => !s);
    showToast(saved ? 'Bookmark removed' : '🔖 Post saved!', 'success');
  }

  async function handleShare() {
    const url = `${window.location.origin}/post/${id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: post.authorName, text: post.content, url });
      } else {
        await navigator.clipboard.writeText(url);
        showToast('🔗 Link copied!', 'success');
      }
    } catch {
      showToast('🔗 Link copied!', 'success');
    }
  }

  function submitComment() {
    if (!commentText.trim()) return;
    const newComment = {
      id: Date.now(),
      author: user?.displayName || 'You',
      authorEmoji: '✨',
      text: commentText.trim(),
      time: 'now',
      likes: 0,
    };
    setComments(prev => [newComment, ...prev]);
    setCommentText('');
    showToast('💬 Comment posted!', 'success');
  }

  return (
    <div style={{ background: '#0a0a18', minHeight: '100vh', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,10,24,0.95)',
        backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)',
        padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 22, cursor: 'pointer', padding: '4px 8px' }}>←</button>
        <span style={{ fontWeight: 700, fontSize: 17, color: '#f1f5f9' }}>Post</span>
      </div>

      {/* Post Content */}
      <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Author */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <button
            onClick={() => navigate(`/profile/${post.authorUid}`)}
            style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, border: 'none', cursor: 'pointer' }}>
            {post.authorEmoji}
          </button>
          <div style={{ flex: 1 }}>
            <button onClick={() => navigate(`/profile/${post.authorUid}`)} style={{ fontWeight: 700, fontSize: 15, color: '#f1f5f9', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              {post.authorName}
            </button>
            <div style={{ fontSize: 12, color: '#475569' }}>{timeAgo(post.createdAt)} · 🌍 Public</div>
          </div>
          <button style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: 'none', color: '#94a3b8', fontSize: 18, cursor: 'pointer' }}>•••</button>
        </div>

        {/* Text */}
        <p style={{ color: '#e2e8f0', fontSize: 16, lineHeight: 1.65, marginBottom: 14 }}>{post.content}</p>

        {/* Media */}
        {post.mediaUrl && (
          <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 14 }}>
            <img src={post.mediaUrl} alt="post" style={{ width: '100%', maxHeight: 340, objectFit: 'cover', display: 'block' }} />
          </div>
        )}

        {/* Stats Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', fontSize: 13, marginBottom: 12 }}>
          <span>{likes} likes</span>
          <span>{comments.length} comments · {post.shares} shares</span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 4, borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '8px 0' }}>
          <button onClick={handleLike} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px', borderRadius: 10, background: liked ? 'rgba(236,72,153,0.12)' : 'transparent', border: 'none', color: liked ? '#ec4899' : '#64748b', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            {liked ? '❤️' : '🤍'} Like
          </button>
          <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px', borderRadius: 10, background: 'transparent', border: 'none', color: '#64748b', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            💬 Comment
          </button>
          <button onClick={handleShare} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px', borderRadius: 10, background: 'transparent', border: 'none', color: '#64748b', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            🔁 Share
          </button>
          <button onClick={handleSave} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px', borderRadius: 10, background: saved ? 'rgba(99,102,241,0.12)' : 'transparent', border: 'none', color: saved ? '#818cf8' : '#64748b', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            🔖 Save
          </button>
        </div>
      </div>

      {/* Comment Input */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
          {user?.displayName?.[0]?.toUpperCase() || '✨'}
        </div>
        <div style={{ flex: 1, display: 'flex', gap: 8 }}>
          <input
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && submitComment()}
            placeholder={`Comment as ${user?.displayName || 'You'}…`}
            style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 22, padding: '9px 16px', color: '#f1f5f9', fontSize: 14, outline: 'none' }}
          />
          <button
            onClick={submitComment}
            disabled={!commentText.trim()}
            style={{ width: 38, height: 38, borderRadius: '50%', background: commentText.trim() ? 'linear-gradient(135deg,#6366f1,#ec4899)' : 'rgba(255,255,255,0.06)', border: 'none', color: 'white', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: commentText.trim() ? 'pointer' : 'default' }}>
            ➤
          </button>
        </div>
      </div>

      {/* Comments List */}
      <div style={{ padding: '8px 16px' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', marginBottom: 12 }}>
          💬 All Comments ({comments.length})
        </div>
        {comments.map(c => (
          <div key={c.id} style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
              {c.authorEmoji || c.author[0]}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: '10px 14px' }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#f1f5f9', marginBottom: 4 }}>{c.author}</div>
                <div style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.5 }}>{c.text}</div>
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 6, paddingLeft: 4 }}>
                <span style={{ fontSize: 11, color: '#475569' }}>{c.time}</span>
                <button style={{ fontSize: 11, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}>👍 {c.likes}</button>
                <button style={{ fontSize: 11, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}>Reply</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
