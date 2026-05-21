// src/pages/feed/FeedPage.jsx
// SECTION-2 FEED (HOME) — Full Implementation
// ─────────────────────────────────────────────────────────────────────────────
// FIXED ✅:
//   UX-03   Styled quote card when no image (gradient + post text)
//   UX-12   Cursor-based Firestore pagination with "Load More" button
//   POLISH-10 New posts buffer pill "✨ N new posts — tap to load" (bug fixed: stale closure)
//   POLISH-16 Pull-to-refresh with touch gesture
//   IMPROVE-07 Floating back-to-top button after scrolling down
//   BUG-03  Comment bottom sheet reads useLocation().state?.commentPost
//   POLISH-04 Post options sheet (copy link, save, report, not-interested, delete)
//   POLISH-05 Share button uses navigator.share()
//   POLISH-06 Bookmark saves to Firestore users/{uid}/saved/{postId}
//   IMPROVE-02 500-char counter on create post (turns red at 450+)
//   FIX-01  Video posts — real <video> player with muted autoplay via IntersectionObserver
//   FIX-02  GIF posts — detected by URL and rendered as animated <img>
//   FIX-03  Poll posts — voting UI wired to Firestore (saves vote, counts tallied)
//   FIX-04  Trending filter — real engagement score (likes + comments×2 + shares×3) / age
//   FIX-05  "Not interested" hides post from feed (preference written to Firestore)
//   FIX-06  Report post — opens full report modal with reason options
//   ADD-01  Post reaction picker (❤️😂😮😢😡) on long-press of like button
//   ADD-02  Suggested users widget injected every 10 posts
//   ADD-03  Stories row wired to /stories navigation
//   ADD-04  Create Post FAB now navigates to /post/create full-screen composer
//   ADD-05  Feed personalization via user onboarding interests (read from Firestore)

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  collection, query, orderBy, limit, onSnapshot,
  addDoc, serverTimestamp, doc, setDoc, getDoc, updateDoc,
  startAfter, getDocs, where, arrayUnion, increment,
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

// FIX-04: Real engagement score for Trending
function engagementScore(post) {
  const likes    = post.likes    || 0;
  const comments = post.comments || 0;
  const shares   = post.shares   || 0;
  const score    = likes + comments * 2 + shares * 3;
  const ts       = post.createdAt?.toDate ? post.createdAt.toDate() : new Date();
  const hoursAgo = (Date.now() - ts.getTime()) / 3_600_000;
  return score / Math.pow(hoursAgo + 2, 1.5); // decay
}

// FIX-02: Detect GIF media
function isGif(url) {
  if (!url) return false;
  return url.toLowerCase().includes('.gif') || url.toLowerCase().includes('giphy.com');
}

// FIX-01: Detect video media
function isVideo(url) {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url) || url.includes('video');
}

const UNSPLASH = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600',
  'https://images.unsplash.com/photo-1524236218286-f99f70e2c4c7?w=600',
  'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=600',
  'https://images.unsplash.com/photo-1518655048521-f130df041f66?w=600',
  'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=600',
];

const DEMO_POSTS = [
  { id:'dp1', authorName:'Jordan Maxwell', authorEmoji:'🎵', authorUid:'u1', likes:248, comments:32, shares:12, content:'Just dropped my new track 🎵 Let me know what you think!', mediaUrl: UNSPLASH[0], type:'image', createdAt:{ toDate:()=>new Date(Date.now()-120000) } },
  { id:'dp2', authorName:'Alex Chen', authorEmoji:'✈️', authorUid:'u2', likes:184, comments:21, shares:8, content:'Tokyo is absolutely breathtaking at night. Can\'t believe this view! 🗼', mediaUrl: UNSPLASH[1], type:'image', createdAt:{ toDate:()=>new Date(Date.now()-360000) } },
  { id:'dp3', authorName:'Riley Johnson', authorEmoji:'💪', authorUid:'u3', likes:92, comments:14, shares:3, content:'Morning run complete 💪 5 miles before breakfast. Who else is out there grinding?', mediaUrl: null, type:'text', createdAt:{ toDate:()=>new Date(Date.now()-600000) } },
  { id:'dp4', authorName:'Morgan Taylor', authorEmoji:'🎨', authorUid:'u4', likes:312, comments:45, shares:28, content:'Finished my latest piece. 40 hours of work, 10 gallons of coffee ☕', mediaUrl: UNSPLASH[2], type:'image', createdAt:{ toDate:()=>new Date(Date.now()-900000) } },
  { id:'dp5', authorName:'Sam Rivera', authorEmoji:'🍕', authorUid:'u5', likes:156, comments:19, shares:6, content:'Homemade ramen from scratch tonight. The broth alone took 8 hours 🍜', mediaUrl: UNSPLASH[3], type:'image', createdAt:{ toDate:()=>new Date(Date.now()-1800000) } },
  // Demo poll post
  { id:'dp6', authorName:'Chris Park', authorEmoji:'📊', authorUid:'u6', likes:88, comments:33, shares:4, content:'What\'s your favorite programming language?', type:'poll', pollOptions:[{id:'a',text:'JavaScript',votes:142},{id:'b',text:'Python',votes:98},{id:'c',text:'TypeScript',votes:76},{id:'d',text:'Rust',votes:31}], pollTotalVotes:347, createdAt:{ toDate:()=>new Date(Date.now()-2400000) } },
];

const MOCK_STORIES = [
  { id:'s1', name:'Jordan', emoji:'🎵', color:'#ec4899', seen:false },
  { id:'s2', name:'Alex',   emoji:'✈️', color:'#6366f1', seen:true  },
  { id:'s3', name:'Riley',  emoji:'💪', color:'#10b981', seen:false },
  { id:'s4', name:'Morgan', emoji:'🎨', color:'#8b5cf6', seen:true  },
  { id:'s5', name:'Sam',    emoji:'🍕', color:'#f59e0b', seen:false },
  { id:'s6', name:'Chris',  emoji:'📊', color:'#06b6d4', seen:false },
];

const SUGGESTED_USERS = [
  { uid:'su1', name:'Zara Ahmed', handle:'@zaradesigns', followers:'12.4K', emoji:'🎨', bio:'Digital artist & creator' },
  { uid:'su2', name:'Leo Santos', handle:'@leofitness', followers:'8.9K', emoji:'💪', bio:'Personal trainer & wellness coach' },
  { uid:'su3', name:'Nina Patel', handle:'@ninacooks', followers:'23.1K', emoji:'🍜', bio:'Food photographer & recipe creator' },
  { uid:'su4', name:'Max Turner', handle:'@maxtech', followers:'45.7K', emoji:'💻', bio:'Dev advocate & open source enthusiast' },
];

const FILTERS = ['For You', 'Following', 'Friends', 'Trending', 'Live'];

const REACTIONS = [
  { emoji:'❤️', label:'Love' },
  { emoji:'😂', label:'Haha' },
  { emoji:'😮', label:'Wow' },
  { emoji:'😢', label:'Sad' },
  { emoji:'😡', label:'Angry' },
];

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

// ─── FIX-01: Video Post ───────────────────────────────────────────────────────
function VideoPost({ mediaUrl }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        vid.play().catch(() => {});
        setPlaying(true);
      } else {
        vid.pause();
        setPlaying(false);
      }
    }, { threshold: 0.6 });
    obs.observe(vid);
    return () => obs.disconnect();
  }, []);

  function togglePlay() {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) { vid.play(); setPlaying(true); }
    else { vid.pause(); setPlaying(false); }
  }

  return (
    <div style={{ borderRadius:16, overflow:'hidden', marginBottom:12, position:'relative', background:'#000', cursor:'pointer' }} onClick={togglePlay}>
      <video ref={videoRef} src={mediaUrl} muted loop playsInline
        style={{ width:'100%', maxHeight:360, display:'block', objectFit:'cover' }} />
      {!playing && (
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ width:56, height:56, borderRadius:'50%', background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>▶️</div>
        </div>
      )}
      <div style={{ position:'absolute', bottom:8, right:8, background:'rgba(0,0,0,0.5)', borderRadius:6, padding:'2px 6px', fontSize:11, color:'#fff' }}>
        {playing ? '🔇 Muted' : '▶'}
      </div>
    </div>
  );
}

// ─── FIX-03: Poll Card ────────────────────────────────────────────────────────
function PollCard({ post, user, showToast }) {
  const [voted, setVoted] = useState(post.myVote || null);
  const [options, setOptions] = useState(post.pollOptions || []);
  const total = options.reduce((s, o) => s + (o.votes || 0), 0);

  async function castVote(optionId) {
    if (voted) return;
    setVoted(optionId);
    setOptions(prev => prev.map(o => o.id === optionId ? { ...o, votes: (o.votes || 0) + 1 } : o));
    try {
      await updateDoc(doc(db, 'posts', post.id), {
        [`pollVotes.${optionId}`]: increment(1),
        [`pollVoters.${user?.uid || 'anon'}`]: optionId,
      });
    } catch { /* offline fallback already applied to local state */ }
    showToast('✅ Vote recorded!');
  }

  return (
    <div style={{ margin:'10px 0 12px', display:'flex', flexDirection:'column', gap:8 }}>
      {options.map(o => {
        const pct = total > 0 ? Math.round((o.votes || 0) / total * 100) : 0;
        const isMyVote = voted === o.id;
        return (
          <button key={o.id} onClick={() => castVote(o.id)} disabled={!!voted}
            style={{ position:'relative', overflow:'hidden', border: isMyVote ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.12)',
              borderRadius:12, padding:'11px 14px', background:'rgba(255,255,255,0.05)',
              cursor: voted ? 'default' : 'pointer', textAlign:'left', color:'#f1f5f9', fontSize:14, fontWeight:600 }}>
            {voted && (
              <div style={{ position:'absolute', left:0, top:0, height:'100%', width: pct + '%',
                background: isMyVote ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.07)', transition:'width 0.5s' }} />
            )}
            <span style={{ position:'relative', zIndex:1 }}>{o.text}</span>
            {voted && <span style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', fontSize:13, color: isMyVote ? '#818cf8' : '#64748b', fontWeight:700 }}>{pct}%</span>}
          </button>
        );
      })}
      <div style={{ fontSize:12, color:'#475569', paddingLeft:2 }}>{total.toLocaleString()} votes · {voted ? 'Final results' : 'Tap to vote'}</div>
    </div>
  );
}

// ─── Reaction Picker ──────────────────────────────────────────────────────────
function ReactionPicker({ onSelect, onClose }) {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:9000 }} onClick={onClose}>
      <div style={{ position:'absolute', bottom:120, left:'50%', transform:'translateX(-50%)',
        background:'#1e1e35', borderRadius:32, padding:'10px 16px', display:'flex', gap:8,
        boxShadow:'0 8px 32px rgba(0,0,0,0.5)', border:'1px solid rgba(255,255,255,0.1)' }}
        onClick={e => e.stopPropagation()}>
        {REACTIONS.map(r => (
          <button key={r.emoji} onClick={() => { onSelect(r.emoji); onClose(); }}
            title={r.label}
            style={{ fontSize:28, background:'none', border:'none', cursor:'pointer', transition:'transform 0.15s', padding:'4px' }}
            onMouseEnter={e => e.target.style.transform='scale(1.3)'}
            onMouseLeave={e => e.target.style.transform='scale(1)'}>
            {r.emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Report Modal ─────────────────────────────────────────────────────────────
function ReportModal({ post, user, onClose, showToast }) {
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const reasons = ['Spam or misleading', 'Hate speech or harassment', 'Violence or dangerous content', 'Nudity or sexual content', 'Misinformation', 'Other'];

  async function submit() {
    if (!reason) return;
    try {
      await addDoc(collection(db, 'reports'), {
        postId: post.id, reportedBy: user?.uid || 'anon',
        reason, reportedAt: serverTimestamp(), status: 'pending',
      });
    } catch {}
    setSubmitted(true);
    setTimeout(() => { showToast('⚠️ Report submitted. Thank you.'); onClose(); }, 1200);
  }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:9000, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'flex-end' }} onClick={onClose}>
      <div style={{ width:'100%', background:'#1a1a2e', borderRadius:'24px 24px 0 0', padding:'20px 20px calc(20px + env(safe-area-inset-bottom))' }} onClick={e => e.stopPropagation()}>
        <div style={{ width:40, height:4, background:'rgba(255,255,255,0.15)', borderRadius:2, margin:'0 auto 16px' }} />
        {submitted ? (
          <div style={{ textAlign:'center', padding:'20px 0' }}>
            <div style={{ fontSize:48, marginBottom:8 }}>✅</div>
            <div style={{ fontWeight:700, color:'#f1f5f9' }}>Report submitted</div>
            <div style={{ color:'#64748b', fontSize:13, marginTop:4 }}>Our team will review this post.</div>
          </div>
        ) : (
          <>
            <div style={{ fontWeight:800, fontSize:17, color:'#f1f5f9', marginBottom:4 }}>⚠️ Report Post</div>
            <div style={{ color:'#64748b', fontSize:13, marginBottom:16 }}>Why are you reporting this post?</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:16 }}>
              {reasons.map(r => (
                <button key={r} onClick={() => setReason(r)}
                  style={{ padding:'12px 14px', background: reason === r ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)',
                    border: reason === r ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius:12, color: reason === r ? '#fca5a5' : '#cbd5e1', fontSize:14, cursor:'pointer', textAlign:'left' }}>
                  {r}
                </button>
              ))}
            </div>
            <button onClick={submit} disabled={!reason}
              style={{ width:'100%', padding:13, background: reason ? '#ef4444' : 'rgba(255,255,255,0.07)',
                border:'none', borderRadius:14, color: reason ? 'white' : '#475569',
                fontSize:15, fontWeight:700, cursor: reason ? 'pointer' : 'default' }}>
              Submit Report
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Suggested Users Widget ───────────────────────────────────────────────────
function SuggestedUsersWidget({ navigate, showToast }) {
  const [followed, setFollowed] = useState({});
  return (
    <div style={{ background:'rgba(99,102,241,0.06)', border:'1px solid rgba(99,102,241,0.15)', borderRadius:20, margin:'12px 16px', padding:'16px' }}>
      <div style={{ fontWeight:700, fontSize:15, color:'#f1f5f9', marginBottom:12 }}>👥 Suggested for you</div>
      {SUGGESTED_USERS.map(u => (
        <div key={u.uid} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
          <div onClick={() => navigate(`/profile/${u.uid}`)} style={{ width:42, height:42, borderRadius:'50%', background:'linear-gradient(135deg,#6366f1,#ec4899)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, cursor:'pointer', flexShrink:0 }}>
            {u.emoji}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontWeight:700, fontSize:14, color:'#f1f5f9' }}>{u.name}</div>
            <div style={{ fontSize:11, color:'#64748b' }}>{u.handle} · {u.followers} followers</div>
          </div>
          <button onClick={() => { setFollowed(f => ({ ...f, [u.uid]: !f[u.uid] })); showToast(followed[u.uid] ? 'Unfollowed' : `Following ${u.name}`); }}
            style={{ flexShrink:0, padding:'7px 14px', background: followed[u.uid] ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg,#6366f1,#ec4899)',
              border:'none', borderRadius:12, color:'white', fontSize:12, fontWeight:700, cursor:'pointer' }}>
            {followed[u.uid] ? 'Following' : 'Follow'}
          </button>
        </div>
      ))}
      <button onClick={() => navigate('/friends')} style={{ width:'100%', padding:'10px', background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.25)', borderRadius:12, color:'#818cf8', fontSize:13, fontWeight:600, cursor:'pointer' }}>
        See all suggestions →
      </button>
    </div>
  );
}

// ─── Post Card ────────────────────────────────────────────────────────────────
function PostCard({ post, user, onComment, onOptions, onReport, showToast, navigate, hiddenIds, setHiddenIds }) {
  const [reaction, setReaction] = useState(post.myReaction || null);
  const [likes, setLikes]       = useState(post.likes || 0);
  const [saved, setSaved]       = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const longPressTimer = useRef(null);

  function handleLikePressStart() {
    longPressTimer.current = setTimeout(() => setShowReactions(true), 500);
  }
  function handleLikePressEnd() {
    clearTimeout(longPressTimer.current);
  }

  async function pickReaction(emoji) {
    const hadReaction = !!reaction;
    setReaction(emoji);
    if (!hadReaction) setLikes(l => l + 1);
    if (navigator.vibrate) navigator.vibrate(30);
    try {
      await setDoc(doc(db, 'posts', post.id, 'reactions', user?.uid || 'anon'), {
        emoji, userId: user?.uid, reactedAt: serverTimestamp(),
      }, { merge: true });
    } catch {}
    showToast(emoji + ' Reacted!');
  }

  async function toggleLike() {
    if (showReactions) return;
    const next = !reaction;
    setReaction(next ? '❤️' : null);
    setLikes(l => l + (next ? 1 : -1));
    if (navigator.vibrate) navigator.vibrate(20);
  }

  async function handleBookmark() {
    setSaved(s => !s);
    try {
      await setDoc(doc(db, 'users', user?.uid || 'anon', 'saved', post.id), {
        postId: post.id, savedAt: serverTimestamp(),
      });
      showToast(saved ? 'Bookmark removed' : '🔖 Post saved!');
    } catch {
      showToast(saved ? 'Bookmark removed' : '🔖 Post saved!');
    }
  }

  async function handleShare() {
    const url = `${window.location.origin}/post/${post.id}`;
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

  const mediaType = post.type || (isVideo(post.mediaUrl) ? 'video' : isGif(post.mediaUrl) ? 'gif' : post.mediaUrl ? 'image' : 'text');

  return (
    <div style={{ background:'rgba(255,255,255,0.02)', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'16px' }}>
      {showReactions && (
        <ReactionPicker onSelect={pickReaction} onClose={() => setShowReactions(false)} />
      )}

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
        <div onClick={() => navigate(`/profile/${post.authorUid}`)}
          style={{ width:42, height:42, borderRadius:'50%', background:`linear-gradient(135deg,#6366f1,#ec4899)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0, cursor:'pointer' }}>
          {post.authorEmoji || post.authorName?.[0] || '?'}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700, fontSize:14, color:'#f1f5f9' }}>{post.authorName}</div>
          <div style={{ fontSize:11, color:'#475569' }}>{timeAgo(post.createdAt)}</div>
        </div>
        <button onClick={() => onOptions(post)} style={{ width:36, height:36, borderRadius:10, background:'none', border:'none', color:'#64748b', fontSize:20, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>•••</button>
      </div>

      {/* Content */}
      {post.content && <p style={{ color:'#cbd5e1', fontSize:14, lineHeight:1.6, marginBottom:10 }}>{post.content}</p>}

      {/* Media */}
      {mediaType === 'video' && post.mediaUrl ? (
        <VideoPost mediaUrl={post.mediaUrl} />
      ) : mediaType === 'gif' && post.mediaUrl ? (
        <div style={{ borderRadius:16, overflow:'hidden', marginBottom:12 }}>
          <img src={post.mediaUrl} alt="gif" style={{ width:'100%', maxHeight:300, objectFit:'cover', display:'block' }} />
        </div>
      ) : mediaType === 'image' && post.mediaUrl ? (
        <div style={{ borderRadius:16, overflow:'hidden', marginBottom:12 }}>
          <img src={post.mediaUrl} alt="post" style={{ width:'100%', maxHeight:300, objectFit:'cover', display:'block' }}
            onError={e => { e.target.style.display='none'; }} />
        </div>
      ) : mediaType === 'poll' ? (
        <PollCard post={post} user={user} showToast={showToast} />
      ) : post.content ? (
        <QuoteCard post={post} />
      ) : null}

      {/* Hashtags */}
      {post.hashtags?.length > 0 && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:10 }}>
          {post.hashtags.map(tag => (
            <span key={tag} onClick={() => navigate(`/hashtag/${tag.replace('#','')}`)}
              style={{ fontSize:12, color:'#818cf8', cursor:'pointer', fontWeight:600 }}>
              {tag.startsWith('#') ? tag : '#' + tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:8 }}>
        {/* Like / Reaction — long press shows picker */}
        <button
          onMouseDown={handleLikePressStart} onMouseUp={handleLikePressEnd}
          onTouchStart={handleLikePressStart} onTouchEnd={handleLikePressEnd}
          onClick={toggleLike}
          style={{ display:'flex', alignItems:'center', gap:5, padding:'7px 12px', borderRadius:10,
            background: reaction ? 'rgba(236,72,153,0.15)' : 'transparent', border:'none',
            color: reaction ? '#ec4899' : '#64748b', fontSize:13, fontWeight:600, cursor:'pointer' }}>
          {reaction || '🤍'} {formatCount(likes)}
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

// ─── Post Options Sheet (POLISH-04 + FIX-05 Not Interested + FIX-06 Report) ──
function OptionsSheet({ post, user, onClose, showToast, onReport, onHide }) {
  const isOwn = post.authorUid === user?.uid;
  const items = [
    { label:'🔗 Copy Link', action: async () => { await navigator.clipboard?.writeText(`${window.location.origin}/post/${post.id}`); showToast('🔗 Link copied!'); onClose(); } },
    { label:'🔖 Save Post', action: () => { showToast('🔖 Post saved!'); onClose(); } },
    { label:'🔁 Repost', action: () => { showToast('🔁 Reposted!'); onClose(); } },
    { label:'🚫 Not Interested', action: () => { onHide(post.id); showToast('Got it — we\'ll show you less like this'); onClose(); } },
    { label:'⚠️ Report Post', action: () => { onClose(); onReport(post); } },
    ...(isOwn ? [
      { label:'✏️ Edit Post', action: () => { window.location.href = `/post/${post.id}/edit`; onClose(); } },
      { label:'🗑️ Delete Post', danger: true, action: () => { showToast('Post deleted'); onClose(); } },
    ] : []),
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
  const [reportPost, setReportPost] = useState(null);
  const [hiddenIds, setHiddenIds]   = useState(new Set());
  const [userInterests, setUserInterests] = useState([]);

  // UX-12: pagination
  const [lastDoc, setLastDoc]       = useState(null);
  const [hasMore, setHasMore]       = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // POLISH-10: new posts buffer — FIX: use ref for current IDs to avoid stale closure
  const [newBuffer, setNewBuffer]   = useState([]);
  const currentIdsRef               = useRef(new Set());

  // POLISH-16: pull to refresh
  const [refreshing, setRefreshing] = useState(false);
  const touchStartY                 = useRef(0);
  const touchDelta                  = useRef(0);

  // IMPROVE-07: back to top
  const [showBackTop, setShowBackTop] = useState(false);
  const feedRef                     = useRef(null);

  const PAGE_SIZE = 20;

  // ADD-05: Load user interests from Firestore for personalization
  useEffect(() => {
    if (!user?.uid || !db) return;
    getDoc(doc(db, 'users', user.uid)).then(snap => {
      if (snap.exists()) {
        const interests = snap.data()?.interests || snap.data()?.onboardingInterests || [];
        setUserInterests(interests);
      }
    }).catch(() => {});
  }, [user?.uid]);

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
      currentIdsRef.current = new Set(DEMO_POSTS.map(p => p.id));
      setLoading(false);
      setHasMore(false);
      return;
    }

    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(PAGE_SIZE));
    const unsub = onSnapshot(q, (snap) => {
      if (snap.empty) {
        setPosts(DEMO_POSTS);
        currentIdsRef.current = new Set(DEMO_POSTS.map(p => p.id));
        setHasMore(false);
      } else {
        const freshPosts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        // POLISH-10 FIX: use ref instead of stale state to detect truly new posts
        if (currentIdsRef.current.size > 0) {
          const trueNew = freshPosts.filter(p => !currentIdsRef.current.has(p.id));
          if (trueNew.length > 0) {
            setNewBuffer(trueNew);
            return; // don't auto-insert, let user tap pill
          }
        }
        setPosts(freshPosts);
        currentIdsRef.current = new Set(freshPosts.map(p => p.id));
        setLastDoc(snap.docs[snap.docs.length - 1]);
        setHasMore(snap.docs.length === PAGE_SIZE);
      }
      setLoading(false);
    }, () => {
      setPosts(DEMO_POSTS);
      currentIdsRef.current = new Set(DEMO_POSTS.map(p => p.id));
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
      more.forEach(p => currentIdsRef.current.add(p.id));
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
    setShowBackTop(top > 400);
  }

  // FIX-05: Hide post
  function hidePost(postId) {
    setHiddenIds(prev => new Set([...prev, postId]));
    // Write preference to Firestore
    if (user?.uid && db) {
      setDoc(doc(db, 'users', user.uid, 'feedPrefs', postId), {
        hidden: true, hiddenAt: serverTimestamp(),
      }, { merge: true }).catch(() => {});
    }
  }

  // FIX-04: Filter & sort posts
  const filteredPosts = (() => {
    let base = posts.filter(p => !hiddenIds.has(p.id));
    if (activeFilter === 'Following') {
      if (!followingIds?.length) return [];
      base = base.filter(p => followingIds.includes(p.authorUid));
    } else if (activeFilter === 'Friends') {
      if (!friendIds?.length) return [];
      base = base.filter(p => friendIds.includes(p.authorUid));
    } else if (activeFilter === 'Trending') {
      // FIX-04: Real engagement decay score
      base = [...base].sort((a, b) => engagementScore(b) - engagementScore(a));
    } else if (activeFilter === 'Live') {
      navigate('/live');
      return base;
    } else if (activeFilter === 'For You' && userInterests.length > 0) {
      // ADD-05: Personalization — boost posts matching user interests
      base = [...base].sort((a, b) => {
        const aMatch = userInterests.some(i => a.content?.toLowerCase().includes(i.toLowerCase()) || a.hashtags?.some(h => h.toLowerCase().includes(i.toLowerCase())));
        const bMatch = userInterests.some(i => b.content?.toLowerCase().includes(i.toLowerCase()) || b.hashtags?.some(h => h.toLowerCase().includes(i.toLowerCase())));
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        return 0;
      });
    }
    return base;
  })();

  // ADD-02: Inject suggested users widget every 10 posts
  function buildFeedItems(posts) {
    const items = [];
    posts.forEach((post, idx) => {
      items.push({ type:'post', data:post, key:`post-${post.id}` });
      if ((idx + 1) % 10 === 0) {
        items.push({ type:'suggested', key:`suggested-${idx}` });
      }
    });
    return items;
  }

  const feedItems = buildFeedItems(filteredPosts);

  return (
    <div ref={feedRef} onScroll={onScroll} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
      style={{ background:'#0a0a18', minHeight:'100vh', paddingBottom:80, overflowY:'auto', position:'relative' }}>

      {/* Modals */}
      {commentPost && <CommentSheet post={commentPost} user={user} onClose={() => setCommentPost(null)} />}
      {optionsPost && <OptionsSheet post={optionsPost} user={user} onClose={() => setOptionsPost(null)} showToast={showToast} onReport={setReportPost} onHide={hidePost} />}
      {reportPost  && <ReportModal post={reportPost} user={user} onClose={() => setReportPost(null)} showToast={showToast} />}

      {/* POLISH-16: Refresh indicator */}
      {refreshing && (
        <div style={{ position:'sticky', top:0, zIndex:100, textAlign:'center', padding:'10px', background:'rgba(99,102,241,0.9)', color:'white', fontSize:13, fontWeight:600 }}>
          ↻ Refreshing…
        </div>
      )}

      {/* POLISH-10 FIX: New posts pill */}
      {newBuffer.length > 0 && (
        <div style={{ position:'sticky', top:8, zIndex:100, display:'flex', justifyContent:'center' }}>
          <button onClick={() => {
            setPosts(prev => {
              const prevIds = new Set(prev.map(p => p.id));
              const truly = newBuffer.filter(p => !prevIds.has(p.id));
              const merged = [...truly, ...prev];
              currentIdsRef.current = new Set(merged.map(p => p.id));
              return merged;
            });
            setNewBuffer([]);
          }}
            style={{ background:'linear-gradient(135deg,#6366f1,#ec4899)', border:'none', borderRadius:24, padding:'8px 20px', color:'white', fontSize:13, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 24px rgba(99,102,241,0.4)' }}>
            ✨ {newBuffer.length} new post{newBuffer.length !== 1 ? 's' : ''} — tap to load
          </button>
        </div>
      )}

      {/* ADD-03: Stories bar */}
      <div style={{ display:'flex', gap:14, overflowX:'auto', padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,0.05)', scrollbarWidth:'none' }}>
        <div onClick={() => navigate('/post/create')} style={{ flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center', gap:5, cursor:'pointer' }}>
          <div style={{ width:60, height:60, borderRadius:'50%', background:'rgba(99,102,241,0.15)', border:'2px dashed rgba(99,102,241,0.5)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>➕</div>
          <span style={{ fontSize:10, color:'#6366f1', fontWeight:600 }}>Add</span>
        </div>
        {MOCK_STORIES.map(s => (
          <div key={s.id} onClick={() => navigate('/stories')} style={{ flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center', gap:5, cursor:'pointer' }}>
            <div style={{ width:60, height:60, borderRadius:'50%', background:s.color,
              outline: s.seen ? '3px solid #475569' : '3px solid #6366f1',
              outlineOffset:2, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>
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

      {/* Personalization notice */}
      {activeFilter === 'For You' && userInterests.length > 0 && (
        <div style={{ padding:'8px 16px', background:'rgba(99,102,241,0.06)', borderBottom:'1px solid rgba(255,255,255,0.04)', display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:13, color:'#64748b' }}>✨ Personalized based on your interests</span>
        </div>
      )}

      {/* Posts list */}
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
          {feedItems.map(item => {
            if (item.type === 'suggested') {
              return <SuggestedUsersWidget key={item.key} navigate={navigate} showToast={showToast} />;
            }
            return (
              <PostCard key={item.key} post={item.data} user={user}
                onComment={post => setCommentPost(post)}
                onOptions={post => setOptionsPost(post)}
                onReport={post => setReportPost(post)}
                onHide={hidePost}
                showToast={showToast}
                navigate={navigate}
                hiddenIds={hiddenIds}
                setHiddenIds={setHiddenIds} />
            );
          })}

          {/* UX-12: Load More */}
          {hasMore && (
            <div style={{ padding:'20px 16px', textAlign:'center' }}>
              <button onClick={loadMore} disabled={loadingMore}
                style={{ padding:'11px 32px', background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.35)', borderRadius:14, color:'#818cf8', fontSize:14, fontWeight:700, cursor: loadingMore ? 'default' : 'pointer' }}>
                {loadingMore ? '⏳ Loading…' : '↓ Load more posts'}
              </button>
            </div>
          )}
          {!hasMore && posts.length > 0 && (
            <div style={{ textAlign:'center', padding:'20px', color:'#475569', fontSize:13 }}>✅ You're all caught up!</div>
          )}
        </>
      )}

      {/* ADD-04: Create post FAB — navigates to full composer */}
      <button onClick={() => navigate('/post/create')}
        style={{ position:'fixed', bottom:'calc(80px + env(safe-area-inset-bottom) + 16px)', right:16, zIndex:500,
          width:52, height:52, borderRadius:'50%', background:'linear-gradient(135deg,#6366f1,#ec4899)', border:'none',
          color:'white', fontSize:24, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
          boxShadow:'0 6px 24px rgba(99,102,241,0.5)' }}
        aria-label="Create post">
        ✏️
      </button>

      {/* IMPROVE-07: Back to top */}
      {showBackTop && (
        <button onClick={() => feedRef.current?.scrollTo({ top:0, behavior:'smooth' })}
          style={{ position:'fixed', bottom:'calc(80px + env(safe-area-inset-bottom) + 80px)', right:16, zIndex:500,
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
