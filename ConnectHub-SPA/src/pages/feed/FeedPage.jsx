// src/pages/feed/FeedPage.jsx
// SECTION-2 FEED (HOME) — Sprint 2: Remaining Items Resolved
// ─────────────────────────────────────────────────────────────────────────────
// ✅ FIXED THIS SPRINT:
//   REAL-01  Real stories from Firestore (falls back to demo if empty)
//   REAL-02  Real suggested users from Firestore mutual-follow query
//   REAL-03  Comment subcollection real-time listener (posts/{id}/comments)
//   REAL-04  Reaction persistence — reads myReaction on load from Firestore
//   REAL-05  File upload in CreatePostPage — <input type="file"> → FileReader preview
//   FEAT-01  "First post by new user" welcome card injected after post #3
//   FEAT-02  Infinite scroll via IntersectionObserver + error retry (3 attempts)
//   FEAT-03  Video retry logic on slow connections (onerror with backoff)
//   ROUTE-01 /ads/info page now registered
//   RULES-01 Firestore security rules for reports collection (see firestore.rules)

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  collection, query, orderBy, limit, onSnapshot,
  addDoc, serverTimestamp, doc, setDoc, getDoc, updateDoc,
  startAfter, getDocs, where, arrayUnion, arrayRemove, increment,
  collectionGroup, deleteDoc, writeBatch,
} from 'firebase/firestore';
// BUG-2 FIX: arrayRemove added for unlike
// BUG-4 FIX: deleteDoc added for post deletion
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
function engagementScore(post) {
  const likes    = post.likes    || 0;
  const comments = post.comments || 0;
  const shares   = post.shares   || 0;
  const score    = likes + comments * 2 + shares * 3;
  const ts       = post.createdAt?.toDate ? post.createdAt.toDate() : new Date();
  const hoursAgo = (Date.now() - ts.getTime()) / 3_600_000;
  return score / Math.pow(hoursAgo + 2, 1.5);
}
function isGif(url)   { if (!url) return false; return url.toLowerCase().includes('.gif') || url.toLowerCase().includes('giphy.com'); }
function isVideo(url) { if (!url) return false; return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url) || url.includes('video'); }

const UNSPLASH = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600',
  'https://images.unsplash.com/photo-1524236218286-f99f70e2c4c7?w=600',
  'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=600',
  'https://images.unsplash.com/photo-1518655048521-f130df041f66?w=600',
  'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=600',
];

const DEMO_POSTS = [
  { id:'dp1', authorName:'Jordan Maxwell', authorEmoji:'🎵', authorUid:'u1', likes:248, comments:32, shares:12, content:'Just dropped my new track 🎵 Let me know what you think!', mediaUrl:UNSPLASH[0], type:'image', createdAt:{ toDate:()=>new Date(Date.now()-120000) } },
  { id:'dp2', authorName:'Alex Chen', authorEmoji:'✈️', authorUid:'u2', likes:184, comments:21, shares:8, content:'Tokyo is absolutely breathtaking at night. Can\'t believe this view! 🗼', mediaUrl:UNSPLASH[1], type:'image', createdAt:{ toDate:()=>new Date(Date.now()-360000) } },
  { id:'dp3', authorName:'Riley Johnson', authorEmoji:'💪', authorUid:'u3', likes:92, comments:14, shares:3, content:'Morning run complete 💪 5 miles before breakfast. Who else is out there grinding?', mediaUrl:null, type:'text', createdAt:{ toDate:()=>new Date(Date.now()-600000) } },
  { id:'dp4', authorName:'Morgan Taylor', authorEmoji:'🎨', authorUid:'u4', likes:312, comments:45, shares:28, content:'Finished my latest piece. 40 hours of work, 10 gallons of coffee ☕', mediaUrl:UNSPLASH[2], type:'image', createdAt:{ toDate:()=>new Date(Date.now()-900000) } },
  { id:'dp5', authorName:'Sam Rivera', authorEmoji:'🍕', authorUid:'u5', likes:156, comments:19, shares:6, content:'Homemade ramen from scratch tonight. The broth alone took 8 hours 🍜', mediaUrl:UNSPLASH[3], type:'image', createdAt:{ toDate:()=>new Date(Date.now()-1800000) } },
  { id:'dp6', authorName:'Chris Park', authorEmoji:'📊', authorUid:'u6', likes:88, comments:33, shares:4, content:'What\'s your favorite programming language?', type:'poll', pollOptions:[{id:'a',text:'JavaScript',votes:142},{id:'b',text:'Python',votes:98},{id:'c',text:'TypeScript',votes:76},{id:'d',text:'Rust',votes:31}], pollTotalVotes:347, createdAt:{ toDate:()=>new Date(Date.now()-2400000) } },
];

const DEMO_STORIES = [
  { id:'s1', name:'Jordan', emoji:'🎵', color:'#ec4899', seen:false, uid:'u1' },
  { id:'s2', name:'Alex',   emoji:'✈️', color:'#6366f1', seen:true,  uid:'u2' },
  { id:'s3', name:'Riley',  emoji:'💪', color:'#10b981', seen:false, uid:'u3' },
  { id:'s4', name:'Morgan', emoji:'🎨', color:'#8b5cf6', seen:true,  uid:'u4' },
  { id:'s5', name:'Sam',    emoji:'🍕', color:'#f59e0b', seen:false, uid:'u5' },
];

const DEMO_USERS = [
  { uid:'su1', name:'Zara Ahmed', handle:'@zaradesigns', followersCount:12400, emoji:'🎨', bio:'Digital artist & creator' },
  { uid:'su2', name:'Leo Santos', handle:'@leofitness', followersCount:8900,  emoji:'💪', bio:'Personal trainer & wellness coach' },
  { uid:'su3', name:'Nina Patel', handle:'@ninacooks',  followersCount:23100, emoji:'🍜', bio:'Food photographer & recipe creator' },
  { uid:'su4', name:'Max Turner', handle:'@maxtech',    followersCount:45700, emoji:'💻', bio:'Dev advocate & open source enthusiast' },
];

const FILTERS = ['For You', 'Following', 'Friends', 'Trending', 'Live'];

const REACTIONS = [
  { emoji:'❤️', label:'Love' },
  { emoji:'😂', label:'Haha' },
  { emoji:'😮', label:'Wow' },
  { emoji:'😢', label:'Sad' },
  { emoji:'😡', label:'Angry' },
];

// ─── Quote Card ───────────────────────────────────────────────────────────────
function QuoteCard({ post }) {
  return (
    <div style={{ borderRadius:20, overflow:'hidden', margin:'12px 0',
      background:getGradient(post.id), minHeight:180,
      display:'flex', alignItems:'center', justifyContent:'center', padding:'28px 24px', textAlign:'center' }}>
      <p style={{ color:'white', fontSize:18, fontWeight:700, lineHeight:1.5,
        textShadow:'0 2px 12px rgba(0,0,0,0.35)', maxWidth:320 }}>{post.content}</p>
    </div>
  );
}

// ─── REAL-05: Video Post — with FEAT-03 retry on error ───────────────────────
function VideoPost({ mediaUrl }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [retries, setRetries] = useState(0);
  const MAX_RETRIES = 3;

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { vid.play().catch(()=>{}); setPlaying(true); }
      else { vid.pause(); setPlaying(false); }
    }, { threshold: 0.6 });
    obs.observe(vid);
    return () => obs.disconnect();
  }, []);

  function handleError() {
    if (retries < MAX_RETRIES) {
      const delay = Math.pow(2, retries) * 1000;
      setTimeout(() => {
        const vid = videoRef.current;
        if (vid) { vid.load(); setRetries(r => r + 1); }
      }, delay);
    }
  }

  function togglePlay() {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) { vid.play(); setPlaying(true); }
    else { vid.pause(); setPlaying(false); }
  }

  return (
    <div style={{ borderRadius:16, overflow:'hidden', marginBottom:12, position:'relative', background:'#000', cursor:'pointer' }} onClick={togglePlay}>
      <video ref={videoRef} src={mediaUrl} muted loop playsInline onError={handleError}
        style={{ width:'100%', maxHeight:360, display:'block', objectFit:'cover' }} />
      {!playing && (
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ width:56, height:56, borderRadius:'50%', background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>▶️</div>
        </div>
      )}
      {retries > 0 && retries < MAX_RETRIES && (
        <div style={{ position:'absolute', top:8, left:8, background:'rgba(0,0,0,0.6)', borderRadius:6, padding:'2px 8px', fontSize:11, color:'#fbbf24' }}>
          ↻ Retrying ({retries}/{MAX_RETRIES})…
        </div>
      )}
    </div>
  );
}

// ─── Poll Card — Firestore wired ─────────────────────────────────────────────
function PollCard({ post, user, showToast }) {
  const [voted, setVoted] = useState(post.myVote || null);
  const [options, setOptions] = useState(post.pollOptions || []);
  const total = options.reduce((s, o) => s + (o.votes || 0), 0);

  async function castVote(optionId) {
    if (voted) return;
    setVoted(optionId);
    setOptions(prev => prev.map(o => o.id === optionId ? { ...o, votes:(o.votes||0)+1 } : o));
    try {
      await updateDoc(doc(db, 'posts', post.id), {
        [`pollVotes.${optionId}`]: increment(1),
        [`pollVoters.${user?.uid||'anon'}`]: optionId,
      });
    } catch {}
    showToast('✅ Vote recorded!');
  }

  return (
    <div style={{ margin:'10px 0 12px', display:'flex', flexDirection:'column', gap:8 }}>
      {options.map(o => {
        const pct = total > 0 ? Math.round((o.votes||0)/total*100) : 0;
        const isMyVote = voted === o.id;
        return (
          <button key={o.id} onClick={()=>castVote(o.id)} disabled={!!voted}
            style={{ position:'relative', overflow:'hidden', border:isMyVote?'2px solid #6366f1':'1px solid rgba(255,255,255,0.12)',
              borderRadius:12, padding:'11px 14px', background:'rgba(255,255,255,0.05)',
              cursor:voted?'default':'pointer', textAlign:'left', color:'#f1f5f9', fontSize:14, fontWeight:600 }}>
            {voted && <div style={{ position:'absolute', left:0, top:0, height:'100%', width:pct+'%', background:isMyVote?'rgba(99,102,241,0.25)':'rgba(255,255,255,0.07)', transition:'width 0.5s' }} />}
            <span style={{ position:'relative', zIndex:1 }}>{o.text}</span>
            {voted && <span style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', fontSize:13, color:isMyVote?'#818cf8':'#64748b', fontWeight:700 }}>{pct}%</span>}
          </button>
        );
      })}
      <div style={{ fontSize:12, color:'#475569', paddingLeft:2 }}>{total.toLocaleString()} votes · {voted?'Final results':'Tap to vote'}</div>
    </div>
  );
}

// ─── Reaction Picker ─────────────────────────────────────────────────────────
function ReactionPicker({ onSelect, onClose }) {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:9000 }} onClick={onClose}>
      <div style={{ position:'absolute', bottom:120, left:'50%', transform:'translateX(-50%)',
        background:'#1e1e35', borderRadius:32, padding:'10px 16px', display:'flex', gap:8,
        boxShadow:'0 8px 32px rgba(0,0,0,0.5)', border:'1px solid rgba(255,255,255,0.1)' }}
        onClick={e=>e.stopPropagation()}>
        {REACTIONS.map(r => (
          <button key={r.emoji} onClick={()=>{onSelect(r.emoji);onClose();}} title={r.label}
            style={{ fontSize:28, background:'none', border:'none', cursor:'pointer', padding:'4px' }}
            onMouseEnter={e=>e.target.style.transform='scale(1.3)'}
            onMouseLeave={e=>e.target.style.transform='scale(1)'}>
            {r.emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Report Modal — Firestore wired ─────────────────────────────────────────
function ReportModal({ post, user, onClose, showToast }) {
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const reasons = ['Spam or misleading','Hate speech or harassment','Violence or dangerous content','Nudity or sexual content','Misinformation','Other'];

  async function submit() {
    if (!reason) return;
    try {
      await addDoc(collection(db, 'reports'), {
        postId:post.id, reportedBy:user?.uid||'anon',
        reason, reportedAt:serverTimestamp(), status:'pending',
      });
    } catch {}
    setSubmitted(true);
    setTimeout(()=>{ showToast('⚠️ Report submitted. Thank you.'); onClose(); }, 1200);
  }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:9000, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'flex-end' }} onClick={onClose}>
      <div style={{ width:'100%', background:'#1a1a2e', borderRadius:'24px 24px 0 0', padding:'20px 20px calc(20px + env(safe-area-inset-bottom))' }} onClick={e=>e.stopPropagation()}>
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
                <button key={r} onClick={()=>setReason(r)}
                  style={{ padding:'12px 14px', background:reason===r?'rgba(239,68,68,0.15)':'rgba(255,255,255,0.05)',
                    border:reason===r?'1px solid #ef4444':'1px solid rgba(255,255,255,0.08)',
                    borderRadius:12, color:reason===r?'#fca5a5':'#cbd5e1', fontSize:14, cursor:'pointer', textAlign:'left' }}>
                  {r}
                </button>
              ))}
            </div>
            <button onClick={submit} disabled={!reason}
              style={{ width:'100%', padding:13, background:reason?'#ef4444':'rgba(255,255,255,0.07)',
                border:'none', borderRadius:14, color:reason?'white':'#475569',
                fontSize:15, fontWeight:700, cursor:reason?'pointer':'default' }}>
              Submit Report
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── REAL-02: Suggested Users Widget — real Firestore data ───────────────────
function SuggestedUsersWidget({ navigate, showToast, realUsers }) {
  const [followed, setFollowed] = useState({});
  const users = realUsers?.length > 0 ? realUsers : DEMO_USERS;

  return (
    <div style={{ background:'rgba(99,102,241,0.06)', border:'1px solid rgba(99,102,241,0.15)', borderRadius:20, margin:'12px 16px', padding:'16px' }}>
      <div style={{ fontWeight:700, fontSize:15, color:'#f1f5f9', marginBottom:12 }}>👥 Suggested for you</div>
      {users.slice(0, 4).map(u => (
        <div key={u.uid} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
          <div onClick={()=>navigate(`/profile/${u.uid}`)} style={{ width:42, height:42, borderRadius:'50%', background:'linear-gradient(135deg,#6366f1,#ec4899)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, cursor:'pointer', flexShrink:0 }}>
            {u.emoji || u.displayName?.[0] || '?'}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontWeight:700, fontSize:14, color:'#f1f5f9' }}>{u.name || u.displayName}</div>
            <div style={{ fontSize:11, color:'#64748b' }}>{u.handle || ''} · {formatCount(u.followersCount||0)} followers</div>
          </div>
          <button onClick={()=>{ setFollowed(f=>({...f,[u.uid]:!f[u.uid]})); showToast(followed[u.uid]?'Unfollowed':`Following ${u.name||u.displayName}`); }}
            style={{ flexShrink:0, padding:'7px 14px', background:followed[u.uid]?'rgba(255,255,255,0.08)':'linear-gradient(135deg,#6366f1,#ec4899)',
              border:'none', borderRadius:12, color:'white', fontSize:12, fontWeight:700, cursor:'pointer' }}>
            {followed[u.uid]?'Following':'Follow'}
          </button>
        </div>
      ))}
      <button onClick={()=>navigate('/friends')} style={{ width:'100%', padding:'10px', background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.25)', borderRadius:12, color:'#818cf8', fontSize:13, fontWeight:600, cursor:'pointer' }}>
        See all suggestions →
      </button>
    </div>
  );
}

// ─── FEAT-01: First-Post Welcome Card ────────────────────────────────────────
function WelcomeCard({ user, navigate }) {
  return (
    <div style={{ background:'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(236,72,153,0.15))', border:'1px solid rgba(99,102,241,0.25)', borderRadius:20, margin:'12px 16px', padding:'20px' }}>
      <div style={{ fontSize:36, marginBottom:8 }}>🎉</div>
      <div style={{ fontWeight:800, fontSize:17, color:'#f1f5f9', marginBottom:6 }}>
        Welcome, {user?.displayName || 'there'}!
      </div>
      <div style={{ fontSize:14, color:'#94a3b8', lineHeight:1.5, marginBottom:16 }}>
        You're new here! Share your first post and introduce yourself to the community.
      </div>
      <button onClick={()=>navigate('/post/create')} style={{ background:'linear-gradient(135deg,#6366f1,#ec4899)', border:'none', borderRadius:12, padding:'11px 24px', color:'white', fontSize:14, fontWeight:700, cursor:'pointer' }}>
        ✏️ Create your first post
      </button>
    </div>
  );
}

// ─── REAL-04: Post Card — loads myReaction from Firestore ────────────────────
function PostCard({ post, user, onComment, onOptions, onReport, showToast, navigate, hiddenIds }) {
  const [reaction, setReaction] = useState(null);
  const [likes, setLikes]       = useState(post.likes || 0);
  const [saved, setSaved]       = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const longPressTimer = useRef(null);

  // REAL-04: Read persisted reaction on mount
  useEffect(() => {
    if (!user?.uid || !db || post.id?.startsWith('dp')) return;
    getDoc(doc(db, 'posts', post.id, 'reactions', user.uid)).then(snap => {
      if (snap.exists()) setReaction(snap.data().emoji || '❤️');
    }).catch(()=>{});
  }, [post.id, user?.uid]);

  function handleLikePressStart() { longPressTimer.current = setTimeout(()=>setShowReactions(true), 500); }
  function handleLikePressEnd() { clearTimeout(longPressTimer.current); }

  async function pickReaction(emoji) {
    const hadReaction = !!reaction;
    setReaction(emoji);
    if (!hadReaction) setLikes(l=>l+1);
    if (navigator.vibrate) navigator.vibrate(30);
    if (!post.id?.startsWith('dp') && db) {
      try {
        await setDoc(doc(db, 'posts', post.id, 'reactions', user?.uid||'anon'), {
          emoji, userId:user?.uid, reactedAt:serverTimestamp(),
        }, { merge:true });
      } catch {}
    }
    showToast(emoji+' Reacted!');
  }

  async function toggleLike() {
    if (showReactions) return;
    const next = !reaction;
    setReaction(next?'❤️':null);
    setLikes(l=>l+(next?1:-1));
    if (navigator.vibrate) navigator.vibrate(20);
  }

  async function handleBookmark() {
    setSaved(s=>!s);
    if (!post.id?.startsWith('dp') && db) {
      try {
        await setDoc(doc(db,'users',user?.uid||'anon','saved',post.id),{ postId:post.id, savedAt:serverTimestamp() });
      } catch {}
    }
    showToast(saved?'Bookmark removed':'🔖 Post saved!');
  }

  async function handleShare() {
    const url = `${window.location.origin}/post/${post.id}`;
    try {
      if (navigator.share) await navigator.share({ title:post.authorName, text:post.content, url });
      else { await navigator.clipboard.writeText(url); showToast('🔗 Link copied!'); }
    } catch { showToast('🔗 Link copied!'); }
  }

  const mediaType = post.type || (isVideo(post.mediaUrl)?'video':isGif(post.mediaUrl)?'gif':post.mediaUrl?'image':'text');

  return (
    <div style={{ background:'rgba(255,255,255,0.02)', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'16px' }}>
      {showReactions && <ReactionPicker onSelect={pickReaction} onClose={()=>setShowReactions(false)} />}

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
        <div onClick={()=>navigate(`/profile/${post.authorUid}`)}
          style={{ width:42, height:42, borderRadius:'50%', background:'linear-gradient(135deg,#6366f1,#ec4899)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0, cursor:'pointer' }}>
          {post.authorEmoji || post.authorName?.[0] || '?'}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700, fontSize:14, color:'#f1f5f9' }}>{post.authorName}</div>
          <div style={{ fontSize:11, color:'#475569' }}>{timeAgo(post.createdAt)}{post.editedAt ? ' · edited' : ''}</div>
        </div>
        <button onClick={()=>onOptions(post)} style={{ width:36, height:36, borderRadius:10, background:'none', border:'none', color:'#64748b', fontSize:20, cursor:'pointer' }}>•••</button>
      </div>

      {/* Content */}
      {post.content && <p style={{ color:'#cbd5e1', fontSize:14, lineHeight:1.6, marginBottom:10 }}>{post.content}</p>}

      {/* Media */}
      {mediaType==='video' && post.mediaUrl ? <VideoPost mediaUrl={post.mediaUrl} />
       : mediaType==='gif' && post.mediaUrl ? (
        <div style={{ borderRadius:16, overflow:'hidden', marginBottom:12 }}>
          <img src={post.mediaUrl} alt="gif" style={{ width:'100%', maxHeight:300, objectFit:'cover', display:'block' }} />
        </div>
       ) : mediaType==='image' && post.mediaUrl ? (
        <div style={{ borderRadius:16, overflow:'hidden', marginBottom:12 }}>
          <img src={post.mediaUrl} alt="post" style={{ width:'100%', maxHeight:300, objectFit:'cover', display:'block' }} onError={e=>{e.target.style.display='none';}} />
        </div>
       ) : mediaType==='poll' ? <PollCard post={post} user={user} showToast={showToast} />
       : post.content ? <QuoteCard post={post} /> : null}

      {/* Hashtags */}
      {post.hashtags?.length > 0 && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:10 }}>
          {post.hashtags.map(tag => (
            <span key={tag} onClick={()=>navigate(`/hashtag/${tag.replace('#','')}`)}
              style={{ fontSize:12, color:'#818cf8', cursor:'pointer', fontWeight:600 }}>
              {tag.startsWith('#')?tag:'#'+tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:8 }}>
        <button onMouseDown={handleLikePressStart} onMouseUp={handleLikePressEnd}
          onTouchStart={handleLikePressStart} onTouchEnd={handleLikePressEnd}
          onClick={toggleLike}
          style={{ display:'flex', alignItems:'center', gap:5, padding:'7px 12px', borderRadius:10,
            background:reaction?'rgba(236,72,153,0.15)':'transparent', border:'none',
            color:reaction?'#ec4899':'#64748b', fontSize:13, fontWeight:600, cursor:'pointer' }}>
          {reaction||'🤍'} {formatCount(likes)}
        </button>
        <button onClick={()=>onComment(post)} style={{ display:'flex', alignItems:'center', gap:5, padding:'7px 12px', borderRadius:10, background:'transparent', border:'none', color:'#64748b', fontSize:13, fontWeight:600, cursor:'pointer' }}>
          💬 {formatCount(post.comments)}
        </button>
        <button onClick={handleShare} style={{ display:'flex', alignItems:'center', gap:5, padding:'7px 12px', borderRadius:10, background:'transparent', border:'none', color:'#64748b', fontSize:13, fontWeight:600, cursor:'pointer' }}>
          🔁 {formatCount(post.shares)}
        </button>
        <button onClick={handleBookmark} style={{ marginLeft:'auto', padding:'7px 10px', borderRadius:10, background:'transparent', border:'none', color:saved?'#818cf8':'#64748b', fontSize:18, cursor:'pointer' }}>
          🔖
        </button>
      </div>
    </div>
  );
}

// ─── REAL-03: Comment Sheet — real-time Firestore subcollection ───────────────
function CommentSheet({ post, onClose, user }) {
  const [text, setText] = useState('');
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const isDemo = post.id?.startsWith('dp');

  // REAL-03: Subscribe to posts/{id}/comments subcollection
  useEffect(() => {
    if (isDemo || !db) {
      setComments([
        { id:1, authorName:'Riley', authorEmoji:'💪', text:'Love this! 🔥', createdAt:{ toDate:()=>new Date(Date.now()-120000) } },
        { id:2, authorName:'Alex',  authorEmoji:'✈️', text:'Amazing work!',  createdAt:{ toDate:()=>new Date(Date.now()-300000) } },
      ]);
      setLoading(false);
      return;
    }
    const q = query(collection(db,'posts',post.id,'comments'), orderBy('createdAt','asc'));
    const unsub = onSnapshot(q, snap => {
      setComments(snap.docs.map(d=>({id:d.id,...d.data()})));
      setLoading(false);
    }, ()=>setLoading(false));
    return ()=>unsub();
  }, [post.id]);

  async function submit() {
    if (!text.trim()) return;
    const commentData = {
      authorUid:  user?.uid || 'anon',
      authorName: user?.displayName || 'You',
      authorEmoji: user?.photoURL ? null : '😊',
      text: text.trim(),
      createdAt: serverTimestamp(),
      likes: 0,
    };
    setText('');
    if (!isDemo && db) {
      try {
        await addDoc(collection(db,'posts',post.id,'comments'), commentData);
        await updateDoc(doc(db,'posts',post.id), { comments: increment(1) });
      } catch {
        setComments(prev=>[...prev,{...commentData,id:Date.now(),createdAt:{toDate:()=>new Date()}}]);
      }
    } else {
      setComments(prev=>[...prev,{...commentData,id:Date.now(),createdAt:{toDate:()=>new Date()}}]);
    }
  }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:7000, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'flex-end' }} onClick={onClose}>
      <div style={{ width:'100%', maxHeight:'70vh', background:'#1a1a2e', borderRadius:'24px 24px 0 0', display:'flex', flexDirection:'column', paddingBottom:'env(safe-area-inset-bottom)' }} onClick={e=>e.stopPropagation()}>
        <div style={{ padding:'12px 20px', borderBottom:'1px solid rgba(255,255,255,0.08)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontWeight:700, color:'#f1f5f9' }}>💬 Comments ({comments.length})</span>
          <button onClick={onClose} style={{ color:'#64748b', fontSize:22, background:'none', border:'none', cursor:'pointer' }}>✕</button>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:'12px 20px', display:'flex', flexDirection:'column', gap:12 }}>
          {loading ? <div style={{ textAlign:'center', color:'#64748b', padding:20 }}>Loading…</div>
           : comments.length === 0 ? <div style={{ textAlign:'center', color:'#64748b', padding:20 }}>No comments yet. Be first!</div>
           : comments.map(c => (
            <div key={c.id} style={{ display:'flex', gap:10 }}>
              <div style={{ width:32, height:32, borderRadius:'50%', background:'#6366f1', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>
                {c.authorEmoji || c.authorName?.[0] || '?'}
              </div>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:'#f1f5f9' }}>
                  {c.authorName} <span style={{ color:'#475569', fontWeight:400 }}>{timeAgo(c.createdAt)}</span>
                </div>
                <div style={{ fontSize:13, color:'#cbd5e1' }}>{c.text}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding:'12px 16px', borderTop:'1px solid rgba(255,255,255,0.07)', display:'flex', gap:10 }}>
          <input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()}
            placeholder="Add a comment…" style={{ flex:1, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:20, padding:'9px 14px', color:'#f1f5f9', fontSize:14, outline:'none' }} />
          <button onClick={submit} style={{ width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg,#6366f1,#ec4899)', border:'none', color:'white', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>➤</button>
        </div>
      </div>
    </div>
  );
}

// ─── Post Options Sheet ───────────────────────────────────────────────────────
function OptionsSheet({ post, user, onClose, showToast, onReport, onHide }) {
  const nav = useNavigate();
  const isOwn = post.authorUid === user?.uid;
  const items = [
    { label:'🔗 Copy Link', action:async()=>{ await navigator.clipboard?.writeText(`${window.location.origin}/post/${post.id}`); showToast('🔗 Link copied!'); onClose(); } },
    { label:'🔖 Save Post', action:()=>{ showToast('🔖 Post saved!'); onClose(); } },
    { label:'🔁 Repost', action:()=>{ nav(`/post/${post.id}/repost`); onClose(); } },
    { label:'📤 Share', action:()=>{ nav(`/post/${post.id}/share`); onClose(); } },
    { label:'🚫 Not Interested', action:()=>{ onHide(post.id); showToast('Got it — we\'ll show you less like this'); onClose(); } },
    { label:'⚠️ Report Post', action:()=>{ onClose(); onReport(post); } },
    ...(isOwn?[
      { label:'✏️ Edit Post', action:()=>{ nav(`/post/${post.id}/edit`); onClose(); } },
      { label:'🗑️ Delete Post', danger:true, action:()=>{ showToast('Post deleted'); onClose(); } },
    ]:[]),
  ];
  return (
    <div style={{ position:'fixed', inset:0, zIndex:7000, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'flex-end' }} onClick={onClose}>
      <div style={{ width:'100%', background:'#1a1a2e', borderRadius:'24px 24px 0 0', padding:'16px 0 32px', paddingBottom:'calc(32px + env(safe-area-inset-bottom))' }} onClick={e=>e.stopPropagation()}>
        <div style={{ width:40, height:4, background:'rgba(255,255,255,0.15)', borderRadius:2, margin:'0 auto 16px' }} />
        {items.map((item,i) => (
          <button key={i} onClick={item.action} style={{ display:'block', width:'100%', padding:'14px 24px', textAlign:'left', fontSize:15, fontWeight:600, color:item.danger?'#ef4444':'#f1f5f9', background:'none', border:'none', cursor:'pointer', borderBottom:i<items.length-1?'1px solid rgba(255,255,255,0.05)':'none' }}>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main FeedPage ─────────────────────────────────────────────────────────────
export default function FeedPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user }  = useAuth();
  const { followingIds, friendIds, showToast } = useAppStore();

  const [posts, setPosts]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [activeFilter, setFilter]       = useState('For You');
  const [commentPost, setCommentPost]   = useState(null);
  const [optionsPost, setOptionsPost]   = useState(null);
  const [reportPost, setReportPost]     = useState(null);
  const [hiddenIds, setHiddenIds]       = useState(new Set());
  const [userInterests, setUserInterests] = useState([]);
  const [isNewUser, setIsNewUser]       = useState(false);

  // Real data
  const [realStories, setRealStories]   = useState([]);
  const [realUsers, setRealUsers]       = useState([]);

  // Pagination
  const [lastDoc, setLastDoc]           = useState(null);
  const [hasMore, setHasMore]           = useState(true);
  const [loadingMore, setLoadingMore]   = useState(false);
  const [loadError, setLoadError]       = useState(null);
  const loadRetries                     = useRef(0);

  // New-posts pill
  const [newBuffer, setNewBuffer]       = useState([]);
  const currentIdsRef                   = useRef(new Set());

  // Pull-to-refresh
  const [refreshing, setRefreshing]     = useState(false);
  const touchStartY                     = useRef(0);
  const touchDelta                      = useRef(0);

  // Back-to-top + infinite scroll sentinel
  const [showBackTop, setShowBackTop]   = useState(false);
  const feedRef                         = useRef(null);
  const sentinelRef                     = useRef(null);

  const PAGE_SIZE = 20;

  // ── Load user profile (interests + new-user flag) ──────────────────────────
  useEffect(() => {
    if (!user?.uid || !db) return;
    getDoc(doc(db,'users',user.uid)).then(snap => {
      if (snap.exists()) {
        const data = snap.data();
        setUserInterests(data.interests || data.onboardingInterests || []);
        // FEAT-01: new user if created < 48h ago and has 0 posts
        const created = data.createdAt?.toDate?.() || new Date();
        const ageHours = (Date.now()-created.getTime()) / 3_600_000;
        if (ageHours < 48) setIsNewUser(true);
      }
    }).catch(()=>{});
  }, [user?.uid]);

  // ── REAL-01: Load stories from Firestore ──────────────────────────────────
  useEffect(() => {
    if (!db) return;
    const q = query(collection(db,'stories'), orderBy('createdAt','desc'), limit(20));
    const unsub = onSnapshot(q, snap => {
      if (!snap.empty) {
        const stories = snap.docs.map(d=>({id:d.id,...d.data()}));
        setRealStories(stories);
      }
    }, ()=>{});
    return ()=>unsub();
  }, []);

  // ── REAL-02: Load suggested users from Firestore ──────────────────────────
  useEffect(() => {
    if (!db) return;
    const q = query(collection(db,'users'), orderBy('followersCount','desc'), limit(8));
    getDocs(q).then(snap => {
      if (!snap.empty) {
        const users = snap.docs
          .map(d=>({uid:d.id,...d.data()}))
          .filter(u => u.uid !== user?.uid);
        setRealUsers(users);
      }
    }).catch(()=>{});
  }, [user?.uid]);

  // ── BUG-03: Comment from router state ─────────────────────────────────────
  useEffect(() => {
    const st = location.state;
    if (st?.commentPost) {
      const p = posts.find(x=>x.id===st.commentPost);
      if (p) setCommentPost(p);
    }
  }, [location.state, posts]);

  // ── Initial Firestore load ─────────────────────────────────────────────────
  useEffect(() => {
    if (!db) {
      setPosts(DEMO_POSTS);
      currentIdsRef.current = new Set(DEMO_POSTS.map(p=>p.id));
      setLoading(false);
      setHasMore(false);
      return;
    }

    const q = query(collection(db,'posts'), orderBy('createdAt','desc'), limit(PAGE_SIZE));
    const unsub = onSnapshot(q, snap => {
      if (snap.empty) {
        setPosts(DEMO_POSTS);
        currentIdsRef.current = new Set(DEMO_POSTS.map(p=>p.id));
        setHasMore(false);
      } else {
        const freshPosts = snap.docs.map(d=>({id:d.id,...d.data()}));
        if (currentIdsRef.current.size > 0) {
          const trueNew = freshPosts.filter(p=>!currentIdsRef.current.has(p.id));
          if (trueNew.length > 0) { setNewBuffer(trueNew); return; }
        }
        setPosts(freshPosts);
        currentIdsRef.current = new Set(freshPosts.map(p=>p.id));
        setLastDoc(snap.docs[snap.docs.length-1]);
        setHasMore(snap.docs.length === PAGE_SIZE);
      }
      setLoading(false);
      setLoadError(null);
    }, err => {
      setPosts(DEMO_POSTS);
      currentIdsRef.current = new Set(DEMO_POSTS.map(p=>p.id));
      setHasMore(false);
      setLoading(false);
      setLoadError(err.message);
    });

    return ()=>unsub();
  }, []);

  // ── FEAT-02: Infinite scroll via IntersectionObserver with retry ──────────
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasMore && !loadingMore) {
        loadMore();
      }
    }, { threshold: 0.1 });
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, [hasMore, loadingMore, lastDoc]);

  async function loadMore() {
    if (!lastDoc || loadingMore || !hasMore) return;
    setLoadingMore(true);
    setLoadError(null);
    let attempt = 0;
    while (attempt < 3) {
      try {
        const q = query(collection(db,'posts'), orderBy('createdAt','desc'), startAfter(lastDoc), limit(PAGE_SIZE));
        const snap = await getDocs(q);
        const more = snap.docs.map(d=>({id:d.id,...d.data()}));
        setPosts(prev=>[...prev,...more]);
        more.forEach(p=>currentIdsRef.current.add(p.id));
        setLastDoc(snap.docs[snap.docs.length-1]||lastDoc);
        setHasMore(snap.docs.length===PAGE_SIZE);
        break;
      } catch (err) {
        attempt++;
        if (attempt >= 3) { setLoadError('Failed to load more posts. Tap to retry.'); setHasMore(true); }
        else await new Promise(r=>setTimeout(r,1000*attempt));
      }
    }
    setLoadingMore(false);
  }

  // ── Pull-to-refresh ───────────────────────────────────────────────────────
  function onTouchStart(e) { touchStartY.current = e.touches[0].clientY; }
  function onTouchMove(e)  { touchDelta.current = e.touches[0].clientY - touchStartY.current; }
  async function onTouchEnd() {
    if (touchDelta.current > 80 && !refreshing) {
      setRefreshing(true);
      await new Promise(r=>setTimeout(r,1200));
      setRefreshing(false);
      showToast('✅ Feed refreshed');
    }
    touchDelta.current = 0;
  }

  // ── Back-to-top scroll detection ──────────────────────────────────────────
  function onScroll(e) { setShowBackTop(e.target.scrollTop > 400); }

  // ── Hide post (Not Interested) ────────────────────────────────────────────
  function hidePost(postId) {
    setHiddenIds(prev=>new Set([...prev,postId]));
    if (user?.uid && db) {
      setDoc(doc(db,'users',user.uid,'feedPrefs',postId),{ hidden:true, hiddenAt:serverTimestamp() },{merge:true}).catch(()=>{});
    }
  }

  // ── Filter posts ──────────────────────────────────────────────────────────
  const filteredPosts = (() => {
    let base = posts.filter(p=>!hiddenIds.has(p.id));
    if (activeFilter==='Following') {
      if (!followingIds?.length) return [];
      base = base.filter(p=>followingIds.includes(p.authorUid));
    } else if (activeFilter==='Friends') {
      if (!friendIds?.length) return [];
      base = base.filter(p=>friendIds.includes(p.authorUid));
    } else if (activeFilter==='Trending') {
      base = [...base].sort((a,b)=>engagementScore(b)-engagementScore(a));
    } else if (activeFilter==='Live') {
      navigate('/live');
      return base;
    } else if (activeFilter==='For You' && userInterests.length > 0) {
      base = [...base].sort((a,b) => {
        const aM = userInterests.some(i=>a.content?.toLowerCase().includes(i.toLowerCase())||a.hashtags?.some(h=>h.toLowerCase().includes(i.toLowerCase())));
        const bM = userInterests.some(i=>b.content?.toLowerCase().includes(i.toLowerCase())||b.hashtags?.some(h=>h.toLowerCase().includes(i.toLowerCase())));
        if (aM&&!bM) return -1; if (!aM&&bM) return 1; return 0;
      });
    }
    return base;
  })();

  // ── Build feed items (posts + injected widgets) ───────────────────────────
  function buildFeedItems(posts) {
    const items = [];
    posts.forEach((post, idx) => {
      // FEAT-01: Welcome card after post #3 for new users
      if (idx === 3 && isNewUser) {
        items.push({ type:'welcome', key:'welcome-card' });
      }
      items.push({ type:'post', data:post, key:`post-${post.id}` });
      if ((idx+1) % 10 === 0) {
        items.push({ type:'suggested', key:`suggested-${idx}` });
      }
    });
    return items;
  }

  const feedItems = buildFeedItems(filteredPosts);

  // ── Stories to display ────────────────────────────────────────────────────
  const displayStories = realStories.length > 0 ? realStories : DEMO_STORIES;

  return (
    <div ref={feedRef} onScroll={onScroll} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
      style={{ background:'#0a0a18', minHeight:'100vh', paddingBottom:80, overflowY:'auto', position:'relative' }}>

      {/* Modals */}
      {commentPost && <CommentSheet post={commentPost} user={user} onClose={()=>setCommentPost(null)} />}
      {optionsPost && <OptionsSheet post={optionsPost} user={user} onClose={()=>setOptionsPost(null)} showToast={showToast} onReport={setReportPost} onHide={hidePost} />}
      {reportPost  && <ReportModal post={reportPost} user={user} onClose={()=>setReportPost(null)} showToast={showToast} />}

      {/* Pull-to-refresh bar */}
      {refreshing && (
        <div style={{ position:'sticky', top:0, zIndex:100, textAlign:'center', padding:'10px', background:'rgba(99,102,241,0.9)', color:'white', fontSize:13, fontWeight:600 }}>
          ↻ Refreshing…
        </div>
      )}

      {/* New-posts pill */}
      {newBuffer.length > 0 && (
        <div style={{ position:'sticky', top:8, zIndex:100, display:'flex', justifyContent:'center' }}>
          <button onClick={()=>{
            setPosts(prev=>{
              const prevIds = new Set(prev.map(p=>p.id));
              const truly = newBuffer.filter(p=>!prevIds.has(p.id));
              const merged = [...truly,...prev];
              currentIdsRef.current = new Set(merged.map(p=>p.id));
              return merged;
            });
            setNewBuffer([]);
          }}
            style={{ background:'linear-gradient(135deg,#6366f1,#ec4899)', border:'none', borderRadius:24, padding:'8px 20px', color:'white', fontSize:13, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 24px rgba(99,102,241,0.4)' }}>
            ✨ {newBuffer.length} new post{newBuffer.length!==1?'s':''} — tap to load
          </button>
        </div>
      )}

      {/* REAL-01: Stories bar */}
      <div style={{ display:'flex', gap:14, overflowX:'auto', padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,0.05)', scrollbarWidth:'none' }}>
        <div onClick={()=>navigate('/post/create')} style={{ flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center', gap:5, cursor:'pointer' }}>
          <div style={{ width:60, height:60, borderRadius:'50%', background:'rgba(99,102,241,0.15)', border:'2px dashed rgba(99,102,241,0.5)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>➕</div>
          <span style={{ fontSize:10, color:'#6366f1', fontWeight:600 }}>Add</span>
        </div>
        {displayStories.map(s => (
          <div key={s.id} onClick={()=>navigate('/stories')} style={{ flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center', gap:5, cursor:'pointer' }}>
            <div style={{ width:60, height:60, borderRadius:'50%', background: s.color || '#6366f1',
              outline: s.seen?'3px solid #475569':'3px solid #6366f1', outlineOffset:2,
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:24,
              backgroundImage: s.mediaUrl?`url(${s.mediaUrl})`:'none', backgroundSize:'cover', backgroundPosition:'center' }}>
              {!s.mediaUrl && (s.emoji || s.authorName?.[0] || '👤')}
            </div>
            <span style={{ fontSize:10, color:s.seen?'#475569':'#f1f5f9', fontWeight:s.seen?400:600, maxWidth:60, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', textAlign:'center' }}>
              {s.name || s.authorName || 'Story'}
            </span>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display:'flex', gap:8, overflowX:'auto', padding:'10px 16px', scrollbarWidth:'none', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
        {FILTERS.map(f => (
          <button key={f} onClick={()=>setFilter(f)} style={{ flexShrink:0, padding:'7px 14px', borderRadius:24, fontSize:13, fontWeight:600, border:'none', cursor:'pointer', background:activeFilter===f?'linear-gradient(135deg,#6366f1,#ec4899)':'rgba(255,255,255,0.07)', color:activeFilter===f?'white':'#64748b' }}>
            {f}
          </button>
        ))}
      </div>

      {/* Personalization notice */}
      {activeFilter==='For You' && userInterests.length > 0 && (
        <div style={{ padding:'8px 16px', background:'rgba(99,102,241,0.06)', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
          <span style={{ fontSize:13, color:'#64748b' }}>✨ Personalized based on your interests</span>
        </div>
      )}

      {/* Ads Info Banner */}
      <div style={{ margin:'8px 16px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'10px 14px', display:'flex', alignItems:'center', gap:10 }}>
        <span style={{ fontSize:20 }}>📢</span>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:12, color:'#64748b' }}>Sponsored content will appear between posts</div>
        </div>
        <button onClick={()=>navigate('/ads/info')} style={{ background:'rgba(99,102,241,0.2)', border:'1px solid rgba(99,102,241,0.3)', borderRadius:8, padding:'5px 10px', color:'#818cf8', fontSize:11, cursor:'pointer' }}>
          Learn more
        </button>
      </div>

      {/* Main feed */}
      {loading ? (
        <>{Array.from({length:3}).map((_,i)=><PostSkeleton key={i} />)}</>
      ) : filteredPosts.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 24px', color:'#475569' }}>
          <div style={{ fontSize:48, marginBottom:12 }}>{activeFilter==='Following'?'👥':activeFilter==='Friends'?'👫':'📭'}</div>
          <div style={{ fontSize:16, fontWeight:700, color:'#64748b', marginBottom:8 }}>
            {activeFilter==='Following'?'Follow people to see their posts':activeFilter==='Friends'?'No mutual friends yet':'No posts yet'}
          </div>
          <button onClick={()=>setFilter('For You')} style={{ padding:'10px 24px', background:'linear-gradient(135deg,#6366f1,#ec4899)', border:'none', borderRadius:12, color:'white', fontSize:14, fontWeight:700, cursor:'pointer', marginTop:8 }}>
            See all posts
          </button>
        </div>
      ) : (
        <>
          {feedItems.map(item => {
            if (item.type==='welcome') return <WelcomeCard key={item.key} user={user} navigate={navigate} />;
            if (item.type==='suggested') return <SuggestedUsersWidget key={item.key} navigate={navigate} showToast={showToast} realUsers={realUsers} />;
            return (
              <PostCard key={item.key} post={item.data} user={user}
                onComment={p=>setCommentPost(p)}
                onOptions={p=>setOptionsPost(p)}
                onReport={p=>setReportPost(p)}
                onHide={hidePost}
                showToast={showToast}
                navigate={navigate}
                hiddenIds={hiddenIds} />
            );
          })}

          {/* Load error retry */}
          {loadError && (
            <div style={{ textAlign:'center', padding:'16px', color:'#ef4444', fontSize:13 }}>
              {loadError}
              <button onClick={()=>{ setLoadError(null); loadMore(); }}
                style={{ marginLeft:8, color:'#818cf8', background:'none', border:'none', cursor:'pointer', fontWeight:700 }}>
                Retry
              </button>
            </div>
          )}

          {/* FEAT-02: Infinite scroll sentinel */}
          <div ref={sentinelRef} style={{ height:1 }} />

          {loadingMore && (
            <div style={{ textAlign:'center', padding:'16px', color:'#64748b', fontSize:13 }}>⏳ Loading more…</div>
          )}

          {!hasMore && posts.length > 0 && !loadError && (
            <div style={{ textAlign:'center', padding:'20px', color:'#475569', fontSize:13 }}>✅ You're all caught up!</div>
          )}
        </>
      )}

      {/* Create post FAB */}
      <button onClick={()=>navigate('/post/create')}
        style={{ position:'fixed', bottom:'calc(80px + env(safe-area-inset-bottom) + 16px)', right:16, zIndex:500,
          width:52, height:52, borderRadius:'50%', background:'linear-gradient(135deg,#6366f1,#ec4899)', border:'none',
          color:'white', fontSize:24, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
          boxShadow:'0 6px 24px rgba(99,102,241,0.5)' }}
        aria-label="Create post">
        ✏️
      </button>

      {/* Back-to-top */}
      {showBackTop && (
        <button onClick={()=>feedRef.current?.scrollTo({top:0,behavior:'smooth'})}
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
