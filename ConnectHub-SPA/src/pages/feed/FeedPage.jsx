// src/pages/feed/FeedPage.jsx
// Rec #1 Feed Layout: [Stories Row] [Filter Pills] [Posts] [FAB]
// Stories embedded here (Rec #5/#9). Filter pills (Rec #6). Floating FAB (Rec #7).

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdUnit from '@components/ads/AdUnit';
import {
  collection, query, orderBy, limit,
  onSnapshot, addDoc, updateDoc, doc, serverTimestamp, arrayUnion, arrayRemove, getDoc,
} from 'firebase/firestore';
import { db } from '@fb/config';
import { useAuth } from '@hooks/useAuth';

// ── Mock story data (real data would come from Firestore) ──────────────────
const MOCK_STORIES = [
  { id: 'add',    name: 'Your Story', emoji: '➕', color: '#6366f1', seen: false, isAdd: true },
  { id: '1',     name: 'Jordan',     emoji: '🎵', color: '#ec4899', seen: false },
  { id: '2',     name: 'Alex',       emoji: '✈️', color: '#3b82f6', seen: false },
  { id: '3',     name: 'Riley',      emoji: '💪', color: '#10b981', seen: true  },
  { id: '4',     name: 'Sam',        emoji: '🍕', color: '#f59e0b', seen: false },
  { id: '5',     name: 'Morgan',     emoji: '🎨', color: '#8b5cf6', seen: true  },
  { id: '6',     name: 'Taylor',     emoji: '📸', color: '#14b8a6', seen: false },
];

// ── Filter pill tabs ────────────────────────────────────────────────────────
const FILTER_TABS = ['For You', 'Following', 'Trending', 'Friends'];

// ── Styles ──────────────────────────────────────────────────────────────────
const S = {
  page:       { background: '#0a0a18', minHeight: '100vh', paddingBottom: 100 },
  // Stories row
  storiesRow: { display: 'flex', gap: 12, overflowX: 'auto', padding: '14px 16px', scrollbarWidth: 'none', borderBottom: '1px solid rgba(255,255,255,0.06)' },
  storyItem:  { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, cursor: 'pointer', flexShrink: 0 },
  storyAvatar:(seen) => ({
    width: 56, height: 56, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 22,
    border: seen ? '2.5px solid rgba(255,255,255,0.18)' : '2.5px solid transparent',
    background: seen
      ? 'rgba(255,255,255,0.08)'
      : 'linear-gradient(#0a0a18, #0a0a18) padding-box, linear-gradient(135deg, #6366f1, #ec4899) border-box',
  }),
  storyName:  { fontSize: 10, color: '#94a3b8', fontWeight: 500, maxWidth: 56, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  // Filter pills row
  pillsRow:   { display: 'flex', gap: 8, overflowX: 'auto', padding: '10px 16px', scrollbarWidth: 'none' },
  // Posts
  post:       { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 16, margin: '0 12px 12px', overflow: 'hidden' },
  postHead:   { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px' },
  avatar:     (color) => ({ width: 40, height: 40, borderRadius: '50%', background: color || 'linear-gradient(135deg,#6366f1,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 700, color: '#fff', flexShrink: 0 }),
  postName:   { fontWeight: 700, fontSize: 14, color: '#f1f5f9' },
  postTime:   { fontSize: 11, color: '#64748b' },
  postText:   { padding: '0 14px 12px', fontSize: 15, color: '#e2e8f0', lineHeight: 1.5 },
  postImg:    { width: '100%', background: 'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(236,72,153,0.15))', height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 },
  actions:    { display: 'flex', alignItems: 'center', gap: 4, padding: '8px 10px', borderTop: '1px solid rgba(255,255,255,0.06)' },
  actBtn:     (active) => ({ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 10px', borderRadius: 10, background: active ? 'rgba(99,102,241,0.15)' : 'transparent', border: 'none', color: active ? '#818cf8' : '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }),
  skeleton:   { background: 'linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.09) 50%,rgba(255,255,255,0.04) 75%)', backgroundSize: '400% 100%', animation: 'shimmer 1.5s infinite', borderRadius: 12, margin: '0 12px 12px' },
};

// ── Skeleton post ────────────────────────────────────────────────────────────
function SkeletonPost() {
  return (
    <div style={{ ...S.skeleton, padding: 14 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ height: 11, width: '35%', borderRadius: 6, background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ height: 9,  width: '20%', borderRadius: 6, background: 'rgba(255,255,255,0.05)' }} />
        </div>
      </div>
      <div style={{ height: 10, width: '90%', borderRadius: 6, background: 'rgba(255,255,255,0.06)', marginBottom: 6 }} />
      <div style={{ height: 10, width: '70%', borderRadius: 6, background: 'rgba(255,255,255,0.06)', marginBottom: 10 }} />
      <div style={{ height: 140, borderRadius: 10, background: 'rgba(255,255,255,0.05)' }} />
    </div>
  );
}

// ── Stories carousel ─────────────────────────────────────────────────────────
function StoriesRow({ onStoryClick, onAddStory }) {
  return (
    <div style={S.storiesRow}>
      {MOCK_STORIES.map((story) => (
        <div
          key={story.id}
          style={S.storyItem}
          onClick={() => story.isAdd ? onAddStory() : onStoryClick(story)}
        >
          <div style={S.storyAvatar(story.seen && !story.isAdd)}>
            <span>{story.emoji}</span>
          </div>
          <span style={S.storyName}>{story.name}</span>
        </div>
      ))}
    </div>
  );
}

// ── Filter Pills ─────────────────────────────────────────────────────────────
function FilterPills({ active, onChange }) {
  return (
    <div style={S.pillsRow}>
      {FILTER_TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          style={{
            padding: '6px 16px',
            borderRadius: 9999,
            fontSize: 13, fontWeight: 600,
            cursor: 'pointer', border: '1px solid transparent',
            whiteSpace: 'nowrap', flexShrink: 0,
            background: active === tab ? 'linear-gradient(135deg,#6366f1,#ec4899)' : 'rgba(255,255,255,0.06)',
            color: active === tab ? '#fff' : '#94a3b8',
            borderColor: active === tab ? 'transparent' : 'rgba(255,255,255,0.12)',
            transition: 'all 0.18s',
          }}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

// ── Post Card ─────────────────────────────────────────────────────────────────
function PostCard({ post, uid, onLike, onComment }) {
  const liked = post.likes?.includes(uid);
  const EMOJIS = ['🌅','🎵','💪','🍕','🎨','✈️','📸','🎮','💡','🔥'];
  const emoji  = EMOJIS[post.id?.charCodeAt(0) % EMOJIS.length] || '📝';
  const color  = ['#ec4899','#6366f1','#10b981','#f59e0b','#3b82f6','#8b5cf6'][post.id?.charCodeAt(1) % 6] || '#6366f1';

  return (
    <div style={S.post}>
      <div style={S.postHead}>
        <div style={S.avatar(color)}>{(post.authorName || 'U')[0]}</div>
        <div style={{ flex: 1 }}>
          <div style={S.postName}>{post.authorName || 'User'}</div>
          <div style={S.postTime}>{post.createdAt ? new Date(post.createdAt?.toDate?.() || post.createdAt).toLocaleDateString() : 'Just now'}</div>
        </div>
        <span style={{ color: '#475569', fontSize: 18, cursor: 'pointer' }}>•••</span>
      </div>
      {post.content && <div style={S.postText}>{post.content}</div>}
      {post.mediaUrl ? (
        <img src={post.mediaUrl} alt="" style={{ width: '100%', maxHeight: 280, objectFit: 'cover' }} />
      ) : (
        <div style={S.postImg}><span>{emoji}</span></div>
      )}
      <div style={S.actions}>
        <button style={S.actBtn(liked)} onClick={() => onLike(post.id, liked)}>
          {liked ? '❤️' : '🤍'} {post.likes?.length || 0}
        </button>
        <button style={S.actBtn(false)} onClick={() => onComment(post)}>
          💬 {post.commentCount || 0}
        </button>
        <button style={S.actBtn(false)}>🔁 Share</button>
        <button style={{ ...S.actBtn(false), marginLeft: 'auto' }}>🔖</button>
      </div>
    </div>
  );
}

// ── Main FeedPage ─────────────────────────────────────────────────────────────
export default function FeedPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const uid = user?.uid;

  const [posts, setPosts]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeFilter, setActiveFilter] = useState('For You');
  const [showCreate, setShowCreate]   = useState(false);
  const [newPostText, setNewPostText] = useState('');
  const [posting, setPosting]         = useState(false);

  // Real-time feed listener
  useEffect(() => {
    const q = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    const unsub = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  const handleLike = useCallback(async (postId, alreadyLiked) => {
    if (!uid) return;
    const ref = doc(db, 'posts', postId);
    await updateDoc(ref, {
      likes: alreadyLiked ? arrayRemove(uid) : arrayUnion(uid),
    }).catch(() => {});
  }, [uid]);

  async function handleCreatePost() {
    if (!newPostText.trim() || !uid || posting) return;
    setPosting(true);
    try {
      await addDoc(collection(db, 'posts'), {
        content: newPostText.trim(),
        authorId: uid,
        authorName: user?.displayName || user?.email?.split('@')[0] || 'User',
        createdAt: serverTimestamp(),
        likes: [],
        commentCount: 0,
      });
      setNewPostText('');
      setShowCreate(false);
    } catch (e) {
      console.error('Post error:', e);
    } finally {
      setPosting(false);
    }
  }

  // Filter posts by tab
  const filteredPosts = posts; // In production: filter by Following graph, etc.

  return (
    <div style={S.page}>
      {/* ── Stories carousel row (Rec #5/#9) ─────────────────── */}
      <StoriesRow
        onStoryClick={(story) => navigate('/stories', { state: { storyId: story.id } })}
        onAddStory={() => navigate('/stories')}
      />

      {/* ── Filter pills: For You | Following | Trending | Friends (Rec #6) ─── */}
      <FilterPills active={activeFilter} onChange={setActiveFilter} />

      {/* ── Skeleton loaders ─────────────────────────────────── */}
      {loading && [1,2,3].map(i => <SkeletonPost key={i} />)}

      {/* ── Empty state ───────────────────────────────────────── */}
      {!loading && filteredPosts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 24px', color: '#475569' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <div style={{ fontWeight: 700, color: '#94a3b8', fontSize: 16 }}>
            {activeFilter === 'Following' ? 'Follow people to see their posts' : 'No posts yet'}
          </div>
          <div style={{ fontSize: 13, marginTop: 6 }}>Be the first to share something ✏️</div>
        </div>
      )}

      {/* ── Post cards (with AdUnit every 4th post) ───────────── */}
      {!loading && filteredPosts.map((post, idx) => (
        <React.Fragment key={post.id}>
          <PostCard
            post={post}
            uid={uid}
            onLike={handleLike}
            onComment={(p) => navigate('/feed', { state: { commentPost: p.id } })}
          />
          {/* Insert banner ad after every 4th post (0-indexed: positions 3,7,11…) */}
          {(idx + 1) % 4 === 0 && (
            <AdUnit type="banner" placement={`feed-after-post-${idx + 1}`} />
          )}
        </React.Fragment>
      ))}

      {/* ── Create Post Modal ─────────────────────────────────── */}
      {showCreate && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 500, display: 'flex', alignItems: 'flex-end', backdropFilter: 'blur(4px)' }}
          onClick={(e) => e.target === e.currentTarget && setShowCreate(false)}
        >
          <div style={{ background: '#1a1a2e', borderRadius: '24px 24px 0 0', padding: '24px 16px', width: '100%', maxWidth: 480, margin: '0 auto' }}>
            <div style={{ fontWeight: 700, fontSize: 17, color: '#f1f5f9', marginBottom: 14 }}>Create Post</div>
            <textarea
              autoFocus
              value={newPostText}
              onChange={e => setNewPostText(e.target.value)}
              placeholder="What's on your mind?"
              rows={4}
              style={{ width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: '12px', color: '#f1f5f9', fontSize: 15, outline: 'none', resize: 'none', fontFamily: 'inherit' }}
            />
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <button onClick={() => setShowCreate(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '11px', color: '#94a3b8', fontWeight: 600, fontSize: 14 }}>
                Cancel
              </button>
              <button
                onClick={handleCreatePost}
                disabled={!newPostText.trim() || posting}
                style={{ flex: 2, background: newPostText.trim() ? 'linear-gradient(135deg,#6366f1,#ec4899)' : 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 12, padding: '11px', color: newPostText.trim() ? '#fff' : '#475569', fontWeight: 700, fontSize: 14 }}
              >
                {posting ? 'Posting…' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Floating FAB ✏️ bottom-right (Rec #7) ─────────────── */}
      <button
        className="fab"
        onClick={() => setShowCreate(true)}
        aria-label="Create post"
        title="Create post"
      >
        ✏️
      </button>
    </div>
  );
}
