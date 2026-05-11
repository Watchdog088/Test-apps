// ClipViewerPage.jsx — /clips/:id
// FIXES APPLIED (Beta Test Round):
//   BUG-C01 / MISS-C01: Share button (navigator.share + clipboard fallback)
//   BUG-C02:            Download button (anchor click)
//   BUG-C03:            Related clips rail (queries top 10 clips excluding current)
//   BUG-C04 / MISS-C03: Comment section + emoji reactions bar
//   MISS-C02:           Video looping toggle
//   UX:                 View count increment on mount, like toggle, back nav

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  doc, getDoc, collection, query, orderBy, limit, getDocs,
  updateDoc, arrayUnion, arrayRemove, addDoc, serverTimestamp, where,
} from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import useAppStore from '@store/useAppStore';

const REACTIONS = ['🔥','❤️','😂','😮','👏','🎉'];

export default function ClipViewerPage() {
  const navigate    = useNavigate();
  const { clipId }  = useParams();
  const showToast   = useAppStore(s => s.showToast);
  const videoRef    = useRef(null);

  const [clip,         setClip]         = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [related,      setRelated]      = useState([]);
  const [comments,     setComments]     = useState([]);
  const [commentText,  setCommentText]  = useState('');
  const [sendingCmt,   setSendingCmt]   = useState(false);
  const [liked,        setLiked]        = useState(false);
  const [looping,      setLooping]      = useState(true);
  const [sharing,      setSharing]      = useState(false);
  const [myReaction,   setMyReaction]   = useState(null);
  const [reactions,    setReactions]    = useState({ '🔥':0,'❤️':0,'😂':0,'😮':0,'👏':0,'🎉':0 });

  // Load clip + increment view count
  useEffect(() => {
    if (!clipId) return;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'clips', clipId));
        if (!snap.exists()) { setLoading(false); return; }
        const data = { id: snap.id, ...snap.data() };
        setClip(data);
        setLiked(data.likes?.includes(auth.currentUser?.uid));
        setReactions(prev => ({ ...prev, ...(data.reactions || {}) }));
        // Increment view count
        await updateDoc(doc(db, 'clips', clipId), {
          viewCount: (data.viewCount || 0) + 1,
        }).catch(() => {});
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [clipId]);

  // Load related clips
  useEffect(() => {
    if (!clip) return;
    (async () => {
      try {
        const q = query(
          collection(db, 'clips'),
          where('status', '==', 'ready'),
          orderBy('viewCount', 'desc'),
          limit(11)
        );
        const snap = await getDocs(q);
        setRelated(snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(c => c.id !== clipId)
          .slice(0, 10));
      } catch (e) { console.error(e); }
    })();
  }, [clip, clipId]);

  // Load comments
  useEffect(() => {
    if (!clipId) return;
    (async () => {
      try {
        const q = query(
          collection(db, 'clips', clipId, 'comments'),
          orderBy('createdAt', 'desc'),
          limit(50)
        );
        const snap = await getDocs(q);
        setComments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { console.error(e); }
    })();
  }, [clipId]);

  // MISS-C01 / BUG-C01: Share
  const handleShare = useCallback(async () => {
    setSharing(true);
    const url = window.location.href;
    const title = clip?.streamTitle || 'Check out this clip!';
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        await navigator.clipboard.writeText(url);
        showToast('🔗 Link copied!');
      }
    } catch (e) {
      if (e.name !== 'AbortError') {
        try { await navigator.clipboard.writeText(url); showToast('🔗 Link copied!'); }
        catch { showToast('Share not supported on this device'); }
      }
    } finally { setSharing(false); }
  }, [clip, showToast]);

  // BUG-C02: Download
  const handleDownload = useCallback(() => {
    if (!clip?.clipUrl) { showToast('Clip URL not available'); return; }
    const a = document.createElement('a');
    a.href = clip.clipUrl;
    a.download = `clip-${clip.streamTitle || clipId}.webm`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('⬇️ Downloading clip…');
  }, [clip, clipId, showToast]);

  // Like toggle
  const toggleLike = useCallback(async () => {
    if (!auth.currentUser) { showToast('Sign in to like'); return; }
    const uid = auth.currentUser.uid;
    const next = !liked;
    setLiked(next);
    try {
      await updateDoc(doc(db, 'clips', clipId), {
        likes: next ? arrayUnion(uid) : arrayRemove(uid),
      });
    } catch { setLiked(!next); }
  }, [liked, clipId, showToast]);

  // MISS-C03: Reaction
  const handleReaction = useCallback(async (emoji) => {
    if (!auth.currentUser) { showToast('Sign in to react'); return; }
    const prev = myReaction;
    setMyReaction(emoji === prev ? null : emoji);
    setReactions(r => {
      const next = { ...r };
      if (prev) next[prev] = Math.max(0, (next[prev] || 0) - 1);
      if (emoji !== prev) next[emoji] = (next[emoji] || 0) + 1;
      return next;
    });
    try {
      const update = {};
      if (prev) update[`reactions.${prev}`] = Math.max(0, (reactions[prev] || 0) - 1);
      if (emoji !== prev) update[`reactions.${emoji}`] = (reactions[emoji] || 0) + 1;
      await updateDoc(doc(db, 'clips', clipId), update);
    } catch { /* revert silently */ }
  }, [myReaction, reactions, clipId, showToast]);

  // BUG-C04: Send comment
  const sendComment = useCallback(async () => {
    if (!commentText.trim() || sendingCmt) return;
    if (!auth.currentUser) { showToast('Sign in to comment'); return; }
    setSendingCmt(true);
    try {
      const ref = await addDoc(collection(db, 'clips', clipId, 'comments'), {
        text: commentText.trim(),
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || 'Viewer',
        avatar: auth.currentUser.photoURL || null,
        createdAt: serverTimestamp(),
      });
      setComments(prev => [{
        id: ref.id,
        text: commentText.trim(),
        userName: auth.currentUser.displayName || 'Viewer',
        avatar: auth.currentUser.photoURL || null,
        createdAt: { toMillis: () => Date.now() },
      }, ...prev]);
      setCommentText('');
    } catch { showToast('Failed to post comment'); }
    finally { setSendingCmt(false); }
  }, [commentText, sendingCmt, clipId, showToast]);

  const fmt = n => n >= 1000 ? `${(n/1000).toFixed(1)}K` : String(n || 0);

  if (loading) return (
    <div style={{ background:'#0a0a18', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ color:'#64748b', fontSize:'14px' }}>Loading clip…</div>
    </div>
  );

  if (!clip) return (
    <div style={{ background:'#0a0a18', minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'12px' }}>
      <div style={{ fontSize:'36px' }}>🎬</div>
      <div style={{ color:'#f1f5f9', fontWeight:700 }}>Clip not found</div>
      <button onClick={() => navigate('/live')} style={{ background:'#ef4444', border:'none', borderRadius:'10px', padding:'10px 20px', color:'white', fontWeight:700, cursor:'pointer' }}>
        Back to Live
      </button>
    </div>
  );

  return (
    <div style={{ background:'#0a0a18', minHeight:'100vh', paddingBottom:'80px' }}>
      {/* Header */}
      <div style={{ padding:'12px 16px', display:'flex', alignItems:'center', gap:'10px', borderBottom:'1px solid #1e293b' }}>
        <button onClick={() => navigate(-1)} style={{ background:'none', border:'none', color:'#94a3b8', fontSize:'20px', cursor:'pointer', padding:'4px' }}>←</button>
        <span style={{ fontSize:'16px', fontWeight:800, color:'#f1f5f9', flex:1 }}>✂️ Clip</span>
        {/* BUG-C01 / MISS-C01: Share button */}
        <button onClick={handleShare} disabled={sharing} aria-label="Share clip"
          style={{ background:'#1e293b', border:'none', borderRadius:'8px', padding:'6px 12px',
            color:'#f1f5f9', fontSize:'13px', fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:'6px' }}>
          🔗 Share
        </button>
      </div>

      {/* Video player */}
      <div style={{ position:'relative', background:'#000', aspectRatio:'9/16', maxHeight:'55vh', overflow:'hidden' }}>
        <video ref={videoRef} src={clip.clipUrl} autoPlay muted={false}
          loop={looping} playsInline controls
          style={{ width:'100%', height:'100%', objectFit:'contain', display:'block' }}
        />
        {/* MISS-C02: Loop toggle */}
        <button onClick={() => setLooping(v => !v)} aria-label={looping ? 'Disable loop' : 'Enable loop'}
          style={{ position:'absolute', top:'8px', right:'8px', background: looping ? 'rgba(239,68,68,0.85)' : 'rgba(0,0,0,0.6)',
            border:'none', borderRadius:'8px', padding:'4px 8px', color:'white', fontSize:'11px', fontWeight:700, cursor:'pointer' }}>
          {looping ? '🔁 Loop' : '🔁 Once'}
        </button>
      </div>

      {/* Clip info */}
      <div style={{ padding:'12px 16px', borderBottom:'1px solid #1e293b' }}>
        <div style={{ fontWeight:800, fontSize:'16px', color:'#f1f5f9', marginBottom:'4px' }}>
          {clip.streamTitle || 'Stream Clip'}
        </div>
        <div style={{ color:'#94a3b8', fontSize:'12px', marginBottom:'10px' }}>
          by {clip.streamerName || 'Creator'} · {fmt(clip.viewCount)} views
        </div>

        {/* Action row */}
        <div style={{ display:'flex', gap:'8px', marginBottom:'12px' }}>
          <button onClick={toggleLike} aria-label={liked ? 'Unlike' : 'Like'}
            style={{ flex:1, background: liked ? 'rgba(239,68,68,0.15)' : '#1e293b', border: liked ? '1px solid #ef4444' : '1px solid #334155',
              borderRadius:'10px', padding:'8px', color: liked ? '#ef4444' : '#94a3b8', fontSize:'13px', fontWeight:600, cursor:'pointer' }}>
            {liked ? '❤️ Liked' : '🤍 Like'} {clip.likes?.length > 0 ? `(${fmt(clip.likes.length)})` : ''}
          </button>
          {/* BUG-C02: Download */}
          <button onClick={handleDownload} aria-label="Download clip"
            style={{ flex:1, background:'#1e293b', border:'1px solid #334155', borderRadius:'10px',
              padding:'8px', color:'#94a3b8', fontSize:'13px', fontWeight:600, cursor:'pointer' }}>
            ⬇️ Download
          </button>
          <button onClick={() => clip.streamId && navigate(`/live/watch/${clip.streamId}`)}
            style={{ flex:1, background:'linear-gradient(135deg,#ef4444,#f59e0b)', border:'none',
              borderRadius:'10px', padding:'8px', color:'white', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>
            📺 Watch Stream
          </button>
        </div>

        {/* MISS-C03: Emoji reactions bar */}
        <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
          {REACTIONS.map(emoji => (
            <button key={emoji} onClick={() => handleReaction(emoji)}
              aria-label={`React with ${emoji}`} aria-pressed={myReaction === emoji}
              style={{ background: myReaction === emoji ? 'rgba(99,102,241,0.2)' : '#1e293b',
                border: myReaction === emoji ? '1px solid #818cf8' : '1px solid #334155',
                borderRadius:'20px', padding:'4px 10px', cursor:'pointer',
                fontSize:'13px', color:'#f1f5f9', display:'flex', alignItems:'center', gap:'4px' }}>
              {emoji} {reactions[emoji] > 0 && <span style={{ fontSize:'11px', color:'#94a3b8' }}>{reactions[emoji]}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* BUG-C04: Comment section */}
      <div style={{ padding:'12px 16px', borderBottom:'1px solid #1e293b' }}>
        <div style={{ fontSize:'12px', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'10px' }}>
          💬 Comments ({comments.length})
        </div>
        {auth.currentUser && (
          <div style={{ display:'flex', gap:'8px', marginBottom:'12px' }}>
            <input value={commentText} onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendComment()}
              placeholder="Add a comment…" aria-label="Add comment"
              style={{ flex:1, background:'#1e293b', border:'1px solid #334155', borderRadius:'10px',
                padding:'8px 12px', color:'#f1f5f9', fontSize:'13px', outline:'none' }} />
            <button onClick={sendComment} disabled={sendingCmt || !commentText.trim()}
              style={{ background:'linear-gradient(135deg,#ef4444,#f59e0b)', border:'none', borderRadius:'10px',
                padding:'8px 14px', color:'white', fontWeight:700, fontSize:'13px', cursor:'pointer',
                opacity: (sendingCmt || !commentText.trim()) ? 0.5 : 1 }}>
              {sendingCmt ? '…' : 'Post'}
            </button>
          </div>
        )}
        {!auth.currentUser && (
          <div style={{ textAlign:'center', padding:'16px', color:'#64748b', fontSize:'13px' }}>
            <button onClick={() => navigate('/login')} style={{ color:'#ef4444', background:'none', border:'none', cursor:'pointer', fontWeight:700 }}>Sign in</button> to comment
          </div>
        )}
        {comments.slice(0, 20).map(c => (
          <div key={c.id} style={{ display:'flex', gap:'8px', marginBottom:'10px' }}>
            <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:'#1e293b',
              flexShrink:0, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px' }}>
              {c.avatar ? <img src={c.avatar} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : '👤'}
            </div>
            <div style={{ flex:1 }}>
              <span style={{ color:'#f1f5f9', fontWeight:700, fontSize:'12px', marginRight:'6px' }}>{c.userName}</span>
              <span style={{ color:'#94a3b8', fontSize:'12px' }}>{c.text}</span>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <div style={{ textAlign:'center', color:'#64748b', fontSize:'13px', padding:'16px' }}>No comments yet. Be the first!</div>
        )}
      </div>

      {/* BUG-C03: Related clips rail */}
      {related.length > 0 && (
        <div style={{ padding:'12px 16px' }}>
          <div style={{ fontSize:'12px', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'10px' }}>
            🔥 More Clips
          </div>
          <div style={{ display:'flex', gap:'10px', overflowX:'auto', paddingBottom:'8px' }} role="list">
            {related.map(r => (
              <div key={r.id} role="listitem"
                onClick={() => navigate(`/clips/${r.id}`)}
                aria-label={`Watch clip: ${r.streamTitle}`}
                style={{ flexShrink:0, width:'130px', borderRadius:'12px', overflow:'hidden',
                  background:'#1e293b', cursor:'pointer', border:'1px solid #334155' }}>
                <div style={{ position:'relative', aspectRatio:'9/16', background:'linear-gradient(135deg,#1e293b,#334155)' }}>
                  {r.thumbnailUrl
                    ? <img src={r.thumbnailUrl} alt={r.streamTitle} loading="lazy"
                        style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                    : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px' }}>✂️</div>
                  }
                  <div style={{ position:'absolute', bottom:'4px', right:'4px', background:'rgba(0,0,0,0.8)',
                    borderRadius:'4px', padding:'1px 5px', color:'white', fontSize:'9px' }}>
                    👁 {r.viewCount >= 1000 ? `${(r.viewCount/1000).toFixed(1)}K` : r.viewCount || 0}
                  </div>
                </div>
                <div style={{ padding:'6px 8px' }}>
                  <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'11px',
                    overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {r.streamTitle || 'Clip'}
                  </div>
                  <div style={{ color:'#64748b', fontSize:'10px', marginTop:'2px' }}>{r.streamerName || 'Creator'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
