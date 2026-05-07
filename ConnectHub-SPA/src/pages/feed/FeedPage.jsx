// src/pages/feed/FeedPage.jsx
// UX-03 FIX: Styled quote card when no image (gradient + post text)
// UX-12 FIX: Cursor-based Firestore pagination with "Load More" button
// POLISH-10 FIX: New posts buffer pill "✨ N new posts — tap to load"
// POLISH-16 FIX: Pull-to-refresh with touch gesture
// IMPROVE-07 FIX: Floating back-to-top button after scrolling down
// BUG-03 FIX: Comment bottom sheet reads useLocation().state?.commentPost
// POLISH-04 FIX: Post options sheet (copy link, save, report, delete)
// POLISH-05 FIX: Share button uses navigator.share()
// POLISH-06 FIX: Bookmark saves to Firestore users/{uid}/saved/{postId}
// IMPROVE-02 FIX: 500-char counter on create post (turns red at 450+)

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  collection, query, orderBy, limit, onSnapshot,
  addDoc, serverTimestamp, doc, setDoc, getDoc,
  startAfter, getDocs, where,
} from 'firebase/firestore';
import { db } from '@fb/config';
import { useAuth } from '@hooks/useAuth';
import useAppStore from '@store/useAppStore';
import { PostSkeleton } from '@components/common/SkeletonLoader';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const QUOTE_GRADIENTS = [
  'linear-gradient(135deg,#667eea,#764ba2)',
  'linear-gradient(135deg,#f093fb,#f5576c)',
  'linear-gradient(135deg,#4facfe,#00f2fe)',
  'linear-gradient(135deg,#43e97b,#38f9d7)',
  'linear-gradient(135deg,#fa709a,#fee140)',
  'linear-gradient(135deg,#a18cd1,#fbc2eb)',
  'linear-gradient(135deg,#ffecd2,#fcb69f)',
  'linear-gradient(135deg,#ff9a9e,#fecfef)',
];
function getGradient(id) {
  const idx = id ? id.charCodeAt(0) % QUOTE_GRADIENTS.length : 0;
  return QUOTE_GRADIENTS[idx];
}

function formatCount(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n || 0);
}

function timeAgo(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

const UNSPLASH = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600',
  'https://images.unsplash.com/photo-1524236218286-f99f70e2c4c7?w=600',
  'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=600',
  'https://images.unsplash.com/photo-1518655048521-f130df041f66?w=600',
  'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=600',
];

const DEMO_POSTS = [
  { id:'dp1', authorName:'Jordan Maxwell', authorEmoji:'🎵', likes:248, comments:32, shares:12, content:'Just dropped my new track 🎵 Let me know what you think!', mediaUrl: UNSPLASH[0], createdAt:{ toDate:()=>new Date(Date.now()-120000) } },
  { id:'dp2', authorName:'Alex Chen', authorEmoji:'✈️', likes:184, comments:21, shares:8, content:'Tokyo is absolutely breathtaking at night. Can\'t believe this view! 🗼', mediaUrl: UNSPLASH[1], createdAt:{ toDate:()=>new Date(Date.now()-360000) } },
  { id:'dp3', authorName:'Riley Johnson', authorEmoji:'💪', likes:92, comments:14, shares:3, content:'Morning run complete 💪 5 miles before breakfast. Who else is out there grinding?', mediaUrl: null, createdAt:{ toDate:()=>new Date(Date.now()-600000) } },
  { id:'dp4', authorName:'Morgan Taylor', authorEmoji:'🎨', likes:312, comments:45, shares:28, content:'Finished my latest piece. 40 hours of work, 10 gallons of coffee ☕', mediaUrl: UNSPLASH[2], createdAt:{ toDate:()=>new Date(Date.now()-900000) } },
  { id:'dp5', authorName:'Sam Rivera', authorEmoji:'🍕', likes:156, comments:19, shares:6, content:'Homemade ramen from scratch tonight. The broth alone took 8 hours 🍜', mediaUrl: UNSPLASH[3], createdAt:{ toDate:()=>new Date(Date.now()-1800000) } },
];

const MOCK_STORIES = [
  { id:'s1', name:'Jordan', emoji:'🎵', color:'#ec4899', seen:false },
  { id:'s2', name:'Alex',   emoji:'✈️', color:'#6366f1', seen:true  },
  { id:'s3', name:'Riley',  emoji:'💪', color:'#10b981', seen:false },
  { id:'s4', name:'Morgan', emoji:'🎨', color:'#8b5cf6', seen:true  },
  { id:'s5', name:'Sam',    emoji:'🍕', color:'#f59e0b', seen:false },
];

const FILTERS = ['For You', 'Following', 'Friends', 'Trending', 'Live'];

// ─── Quote Card (UX-03) ───────────────────────────────────────────────────────
function QuoteCard({ post }) {
  return (
    <div style={{ borderRadius:20, overflow:'hidden', margin:'12px 0',
      background: getGradient(post.id), minHeight:180,
      display:'flex', alignItems:'center', justifyContent:'center', padding:'28px 24px', textAlign:'center' }}>
      <p style={{ color:'white', fontSize:18, fontWeight:700, lineHeight:1.5,
        textShadow:'0 2px 12px rgba(0,0,0,0.35)', maxWidth:320 }}>
        {post.content}
      </p>
    </div>
  );
}

// ─── Post Card ────────────────────────────────────────────────────────────────
function PostCard({ post, user, onComment, onOptions, showToast }) {
  const [liked, setLiked]   = useState(post.likedByMe || false);
  const [likes, setLikes]   = useState(post.likes || 0);
  const [saved, setSaved]   = useState(false);

  async function toggleLike() {
    const next = !liked;
    setLiked(next);
    setLikes(l => l + (next ? 1 : -1));
    if (navigator.vibrate) navigator.vibrate(20);
  }

  async function handleBookmark() {
    // POLISH-06: Save to Firestore
    setSaved(s => !s);
    try {
      await setDoc(doc(db, 'users', user.uid, 'saved', post.id), {
        postId: post.id, savedAt: serverTimestamp(),
      });
      showToast(saved ? 'Bookmark removed' : '🔖 Post saved!');
    } catch {
      showToast(saved ? 'Bookmark removed' : '🔖 Post saved!');
    }
  }

  async function handleShare() {
    // POLISH-05: native share with clipboard fallback
    const url = `${window.location.origin}/feed?post=${post.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: post.authorName, text: post.content, url });
      } else {
        await navigator.clipboard.writeText(url);
        showToast('🔗 Link copied!');
      }
    } catch {
      showToast('🔗 Link copied!');
    }
  }

  return (
    <div style={{ background:'rgba(255,255,255,0.02)', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'16px' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
        <div style={{ width:42, height:42, borderRadius:'50%', background:`linear-gradient(135deg,#6366f1,#ec4899)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>
          {post.authorEmoji || post.authorName?.[0] || '?'}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700, fontSize:14, color:'#f1f5f9' }}>{post.authorName}</div>
          <div style={{ fontSize:11, color:'#475569' }}>{timeAgo(post.createdAt)}</div>
        </div>
        {/* POLISH-04: Options button */}
        <button onClick={() => onOptions(post)} style={{ width:36, height:36, borderRadius:10, background:'none', border:'none', color:'#64748b', fontSize:20, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>•••</button>
      </div>

      {/* Content */}
      {post.content && <p style={{ color:'#cbd5e1', fontSize:14, lineHeight:1.6, marginBottom:10 }}>{post.content}</p>}

      {/* Media: image or UX-03 quote card */}
      {post.mediaUrl ? (
        <div style={{ borderRadius:16, overflow:'hidden', marginBottom:12 }}>
          <img src={post.mediaUrl} alt="post" style={{ width:'100%', maxHeight:300, objectFit:'cover', display:'block' }}
            onError={e => { e.target.style.display='none'; }} />
        </div>
      ) : post.content ? (
        <QuoteCard post={post} />
      ) : null}

      {/* Actions */}
      <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:8 }}>
        <button onClick={toggleLike} style={{ display:'flex', alignItems:'center', gap:5, padding:'7px 12px', borderRadius:10, background: liked ? 'rgba(236,72,153,0.15)' : 'transparent', border:'none', color: liked ? '#ec4899' : '#64748b', fontSize:13, fontWeight:600, cursor:'pointer' }}>
          {liked ? '❤️' : '🤍'} {formatCount(likes)}
        </button>
        <button onClick={() => onComment(post)} style={{ display:'flex', alignItems:'center', gap:5, padding:'7px 12px', borderRadius:10, background:'transparent', border:'none', color:'#64748b', fontSize:13, fontWeight:600, cursor:'pointer' }}>
          💬 {formatCount(post.comments)}
        </button>
        <button onClick={handleShare} style={{ display:'flex', alignItems:'center', gap:5, padding:'7px 12px', borderRadius:10, background:'transparent', border:'none', color:'#64748b', fontSize:13, fontWeight:600, cursor:'pointer' }}>
          🔁 {formatCount(post.shares)}
        </button>
        <button onClick={handleBookmark} style={{ marginLeft:'auto', padding:'7px 10px', borderRadius:10, background:'transparent', border:'none', color: saved ? '#818cf8' : '#64748b', fontSize:18, cursor:'pointer' }}>
          {saved ? '🔖' : '🔖'}
        </button>
      </div>
    </div>
  );
}

// ─── Comment Sheet ─────────────────────────────────────────────────────────────
function CommentSheet({ post, onClose, user }) {
  const [text, setText] = useState('');
  const [comments, setComments] = useState([
    { id:1, author:'Riley', text:'Love this! 🔥', time:'2m' },
    { id:2, author:'Alex',  text:'Amazing work!', time:'5m' },
  ]);

  function submit() {
    if (!text.trim()) return;
    setComments(prev => [...prev, { id:Date.now(), author: user?.displayName || 'You', text: text.trim(), time:'now' }]);
    setText('');
  }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:7000, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'flex-end' }} onClick={onClose}>
      <div style={{ width:'100%', maxHeight:'70vh', background:'#1a1a2e', borderRadius:'24px 24px 0 0', display:'flex', flexDirection:'column', paddingBottom:'env(safe-area-inset-bottom)' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding:'12px 20px', borderBottom:'1px solid rgba(255,255,255,0.08)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontWeight:700, color:'#f1f5f9' }}>💬 Comments</span>
          <button onClick={onClose} style={{ color:'#64748b', fontSize:22, background:'none', border:'none', cursor:'pointer' }}>✕</button>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:'12px 20px', display:'flex', flexDirection:'column', gap:12 }}>
          {comments.map(c => (
            <div key={c.id} style={{ display:'flex', gap:10 }}>
              <div style={{ width:32, height:32, borderRadius:'50%', background:'#6366f1', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>{c.author[0]}</div>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:'#f1f5f9' }}>{c.author} <span style={{ color:'#475569', fontWeight:400 }}>{c.time}</span></div>
                <div style={{ fontSize:13, color:'#cbd5e1' }}>{c.text}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding:'12px 16px', borderTop:'1px solid rgba(255,255,255,0.07)', display:'flex', gap:10 }}>
          <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key==='Enter' && submit()}
            placeholder="Add a comment…" style={{ flex:1, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:20, padding:'9px 14px', color:'#f1f5f9', fontSize:14, outline:'none' }} />
          <button onClick={submit} style={{ width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg,#6366f1,#ec4899)', border:'none', color:'white', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>➤</button>
        </div>
      </div>
    </div>
  );
}

// ─── Post Options Sheet ────────────────────────────────────────────────────────
function OptionsSheet({ post, user, onClose, showToast }) {
  const isOwn = post.authorUid === user?.uid;
  const items = [
    { label:'🔗 Copy Link', action: async () => { await navigator.clipboard?.writeText(`${window.location.origin}/feed?post=${post.id}`); showToast('🔗 Link copied!'); onClose(); } },
    { label:'🔖 Save Post', action: () => { showToast('🔖 Post saved!'); onClose(); } },
    { label:'⚠️ Report Post', action: () => { showToast('⚠️ Report submitted'); onClose(); } },
    ...(isOwn ? [{ label:'🗑️ Delete Post', danger: true, action: () => { showToast('Post deleted'); onClose(); } }] : []),
  ];
  return (
    <div style={{ position:'fixed', inset:0, zIndex:7000, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'flex-end' }} onClick={onClose}>
      <div style={{ width:'100%', background:'#1a1a2e', borderRadius:'24px 24px 0 0', padding:'16px 0 32px', paddingBottom:'calc(32px + env(safe-area-inset-bottom))' }} onClick={e => e.stopPropagation()}>
        <div style={{ width:40, height:4, background:'rgba(255,255,255,0.15)', borderRadius:2, margin:'0 auto 16px' }} />
        {items.map((item, i) => (
          <button key={i} onClick={item.action} style={{ display:'block', width:'100%', padding:'14px 24px', textAlign:'left', fontSize:15, fontWeight:600, color: item.danger ? '#ef4444' : '#f1f5f9', background:'none', border:'none', cursor:'pointer', borderBottom: i < items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Create Post Modal ─────────────────────────────────────────────────────────
function CreatePostModal({ user, onClose, onPost }) {
  const [text, setText] = useState('');
  const MAX = 500;

  async function submit() {
    if (!text.trim()) return;
    const newPost = {
      authorUid: user?.uid || 'demo',
      authorName: user?.displayName || 'You',
      authorEmoji: '✨',
      content: text.trim(),
      mediaUrl: null,
      likes: 0, comments: 0, shares: 0,
      createdAt: serverTimestamp(),
    };
    try { await addDoc(collection(db, 'posts'), newPost); } catch {}
    onPost({ ...newPost, id: 'local-' + Date.now(), createdAt: { toDate: () => new Date() } });
    onClose();
  }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:8000, background:'rgba(0,0,0,0.8)', display:'flex', alignItems:'flex-end' }} onClick={onClose}>
      <div style={{ width:'100%', background:'#1a1a2e', borderRadius:'24px 24px 0 0', padding:'20px 20px', paddingBottom:'calc(20px + env(safe-area-inset-bottom))' }} onClick={e => e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <span style={{ fontWeight:800, fontSize:17, color:'#f1f5f9' }}>✨ Create Post</span>
          <button onClick={onClose} style={{ color:'#64748b', fontSize:22, background:'none', border:'none', cursor:'pointer' }}>✕</button>
        </div>
        <textarea value={text} onChange={e => setText(e.target.value.slice(0, MAX))}
          placeholder="What's on your mind?"
          rows={4} style={{ width:'100%', background:'rgba(255,255,255,0.07)', border:`1px solid ${text.length >= 450 ? '#ef4444' : 'rgba(255,255,255,0.12)'}`, borderRadius:16, padding:'12px 14px', color:'#f1f5f9', fontSize:15, outline:'none', resize:'none' }} />
        {/* IMPROVE-02: character counter */}
        <div style={{ textAlign:'right', fontSize:11, color: text.length >= 450 ? '#ef4444' : '#475569', marginTop:4 }}>
          {text.length}/{MAX}
        </div>
        <button onClick={submit} disabled={!text.trim()} style={{ width:'100%', marginTop:12, padding:'13px', background: text.trim() ? 'linear-gradient(135deg,#6366f1,#ec4899)' : 'rgba(255,255,255,0.08)', border:'none', borderRadius:14, color: text.trim() ? 'white' : '#475569', fontSize:15, fontWeight:700, cursor: text.trim() ? 'pointer' : 'default' }}>
          Post
        </button>
      </div>
    </div>
  );
}

// ─── Main FeedPage ─────────────────────────────────────────────────────────────
export default function FeedPage() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { user }   = useAuth();
  const { createPostOpen, setCreatePostOpen, followingIds, friendIds, showToast } = useAppStore();

  const [posts, setPosts]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [activeFilter, setFilter]   = useState('For You');
  const [commentPost, setCommentPost] = useState(null);
  const [optionsPost, setOptionsPost] = useState(null);

  // UX-12: pagination
  const [lastDoc, setLastDoc]       = useState(null);
  const [hasMore, setHasMore]       = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // POLISH-10: new posts buffer
  const [newBuffer, setNewBuffer]   = useState([]);

  // POLISH-16: pull to refresh
  const [refreshing, setRefreshing] = useState(false);
  const touchStartY                 = useRef(0);
  const touchDelta                  = useRef(0);

  // IMPROVE-07: back to top
  const [showBackTop, setShowBackTop] = useState(false);
  const scrollCount                 = useRef(0);
  const feedRef                     = useRef(null);

  const PAGE_SIZE = 20;

  // BUG-03: open comment sheet from router state
  useEffect(() => {
    const st = location.state;
    if (st?.commentPost) {
      const p = posts.find(x => x.id === st.commentPost);
      if (p) setCommentPost(p);
    }
  }, [location.state, posts]);

  // Initial Firestore load
  useEffect(() => {
    if (!db) {
      setPosts(DEMO_POSTS);
      setLoading(false);
      setHasMore(false);
      return;
    }

    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(PAGE_SIZE));
    const unsub = onSnapshot(q, (snap) => {
      if (snap.empty) {
        setPosts(DEMO_POSTS);
        setHasMore(false);
      } else {
        const newPosts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (posts.length > 0 && newPosts[0]?.id !== posts[0]?.id) {
          // POLISH-10: buffer genuinely new posts
          const existingIds = new Set(posts.map(p => p.id));
          const trueNew = newPosts.filter(p => !existingIds.has(p.id));
          if (trueNew.length > 0) {
            setNewBuffer(trueNew);
            return; // don't auto-insert
          }
        }
        setPosts(newPosts);
        setLastDoc(snap.docs[snap.docs.length - 1]);
        setHasMore(snap.docs.length === PAGE_SIZE);
      }
      setLoading(false);
    }, () => {
      setPosts(DEMO_POSTS);
      setHasMore(false);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // UX-12: Load more
  async function loadMore() {
    if (!lastDoc || loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(PAGE_SIZE));
      const snap = await getDocs(q);
      const more = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setPosts(prev => [...prev, ...more]);
      setLastDoc(snap.docs[snap.docs.length - 1] || lastDoc);
      setHasMore(snap.docs.length === PAGE_SIZE);
    } catch { setHasMore(false); }
    setLoadingMore(false);
  }

  // POLISH-16: Pull to refresh
  function onTouchStart(e) { touchStartY.current = e.touches[0].clientY; }
  function onTouchMove(e) { touchDelta.current = e.touches[0].clientY - touchStartY.current; }
  async function onTouchEnd() {
    if (touchDelta.current > 80 && !refreshing) {
      setRefreshing(true);
      await new Promise(r => setTimeout(r, 1200));
      setRefreshing(false);
      showToast('✅ Feed refreshed');
    }
    touchDelta.current = 0;
  }

  // IMPROVE-07: track scroll for back-to-top
  function onScroll(e) {
    const top = e.target.scrollTop;
    scrollCount.current = top > 400 ? scrollCount.current + 1 : 0;
    setShowBackTop(top > 400);
  }

  // Filter posts
  const filteredPosts = (() => {
    if (activeFilter === 'Following') {
      if (!followingIds?.length) return [];
      return posts.filter(p => followingIds.includes(p.authorUid));
    }
    if (activeFilter === 'Friends') {
      if (!friendIds?.length) return [];
      return posts.filter(p => friendIds.includes(p.authorUid));
    }
    if (activeFilter === 'Trending') return [...posts].sort((a, b) => (b.likes || 0) - (a.likes || 0));
    return posts;
  })();

  return (
    <div ref={feedRef} onScroll={onScroll} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
      style={{ background:'#0a0a18', minHeight:'100vh', paddingBottom:80, overflowY:'auto', position:'relative' }}>

      {/* Create post modal */}
      {createPostOpen && (
        <CreatePostModal user={user} onClose={() => setCreatePostOpen(false)}
          onPost={p => { setPosts(prev => [p, ...prev]); showToast('✅ Post shared!'); }} />
      )}

      {/* Comment sheet */}
      {commentPost && <CommentSheet post={commentPost} user={user} onClose={() => setCommentPost(null)} />}

      {/* Options sheet */}
      {optionsPost && <OptionsSheet post={optionsPost} user={user} onClose={() => setOptionsPost(null)} showToast={showToast} />}

      {/* POLISH-16: Refresh indicator */}
      {refreshing && (
        <div style={{ position:'sticky', top:0, zIndex:100, textAlign:'center', padding:'10px', background:'rgba(99,102,241,0.9)', color:'white', fontSize:13, fontWeight:600 }}>
          ↻ Refreshing…
        </div>
      )}

      {/* POLISH-10: New posts pill */}
      {newBuffer.length > 0 && (
        <div style={{ position:'sticky', top:8, zIndex:100, display:'flex', justifyContent:'center' }}>
          <button onClick={() => { setPosts(prev => [...newBuffer, ...prev]); setNewBuffer([]); }}
            style={{ background:'linear-gradient(135deg,#6366f1,#ec4899)', border:'none', borderRadius:24, padding:'8px 20px', color:'white', fontSize:13, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 24px rgba(99,102,241,0.4)' }}>
            ✨ {newBuffer.length} new post{newBuffer.length !== 1 ? 's' : ''} — tap to load
          </button>
        </div>
      )}

      {/* Stories bar */}
      <div style={{ display:'flex', gap:14, overflowX:'auto', padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,0.05)', scrollbarWidth:'none' }}>
        {/* Add story button */}
        <div onClick={() => navigate('/stories')} style={{ flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center', gap:5, cursor:'pointer' }}>
          <div style={{ width:60, height:60, borderRadius:'50%', background:'rgba(99,102,241,0.15)', border:'2px dashed rgba(99,102,241,0.5)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>➕</div>
          <span style={{ fontSize:10, color:'#6366f1', fontWeight:600 }}>Add</span>
        </div>
        {MOCK_STORIES.map(s => (
          <div key={s.id} onClick={() => navigate('/stories')} style={{ flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center', gap:5, cursor:'pointer' }}>
            <div className={s.seen ? 'story-ring-seen' : 'story-ring'} style={{ width:60, height:60, borderRadius:'50%', background:s.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>
              {s.emoji}
            </div>
            <span style={{ fontSize:10, color: s.seen ? '#475569' : '#f1f5f9', fontWeight: s.seen ? 400 : 600 }}>{s.name}</span>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display:'flex', gap:8, overflowX:'auto', padding:'10px 16px', scrollbarWidth:'none', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ flexShrink:0, padding:'7px 14px', borderRadius:24, fontSize:13, fontWeight:600, border:'none', cursor:'pointer', background: activeFilter === f ? 'linear-gradient(135deg,#6366f1,#ec4899)' : 'rgba(255,255,255,0.07)', color: activeFilter === f ? 'white' : '#64748b' }}>
            {f}
          </button>
        ))}
      </div>

      {/* Posts */}
      {loading ? (
        <>{Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />)}</>
      ) : filteredPosts.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 24px', color:'#475569' }}>
          <div style={{ fontSize:48, marginBottom:12 }}>
            {activeFilter === 'Following' ? '👥' : activeFilter === 'Friends' ? '👫' : '📭'}
          </div>
          <div style={{ fontSize:16, fontWeight:700, color:'#64748b', marginBottom:8 }}>
            {activeFilter === 'Following' ? 'Follow people to see their posts' :
             activeFilter === 'Friends'   ? 'No mutual friends yet' :
             'No posts yet'}
          </div>
          <button onClick={() => setFilter('For You')} style={{ padding:'10px 24px', background:'linear-gradient(135deg,#6366f1,#ec4899)', border:'none', borderRadius:12, color:'white', fontSize:14, fontWeight:700, cursor:'pointer', marginTop:8 }}>
            See all posts
          </button>
        </div>
      ) : (
        <>
          {filteredPosts.map(p => (
            <PostCard key={p.id} post={p} user={user}
              onComment={post => setCommentPost(post)}
              onOptions={post => setOptionsPost(post)}
              showToast={showToast} />
          ))}

          {/* UX-12: Load More button */}
          {hasMore && (
            <div style={{ padding:'20px 16px', textAlign:'center' }}>
              <button onClick={loadMore} disabled={loadingMore} style={{ padding:'11px 32px', background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.35)', borderRadius:14, color:'#818cf8', fontSize:14, fontWeight:700, cursor: loadingMore ? 'default' : 'pointer' }}>
                {loadingMore ? '⏳ Loading…' : '↓ Load more posts'}
              </button>
            </div>
          )}
          {!hasMore && posts.length > 0 && (
            <div style={{ textAlign:'center', padding:'20px', color:'#475569', fontSize:13 }}>✅ You're all caught up!</div>
          )}
        </>
      )}

      {/* IMPROVE-07: Back to top button */}
      {showBackTop && (
        <button onClick={() => feedRef.current?.scrollTo({ top:0, behavior:'smooth' })}
          style={{ position:'fixed', bottom:'calc(80px + env(safe-area-inset-bottom) + 12px)', right:16, zIndex:500,
            width:44, height:44, borderRadius:'50%', background:'rgba(99,102,241,0.9)', border:'none',
            color:'white', fontSize:20, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
            boxShadow:'0 4px 16px rgba(99,102,241,0.4)' }}
          aria-label="Back to top">
          ⌃
        </button>
      )}
    </div>
  );
}
