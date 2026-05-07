// CLIP VIEWER PAGE — /clips/:clipId
// BUG-05 FIX: Route was missing, causing 404 when clicking clips on LivePage.

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, increment, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import useAppStore from '@store/useAppStore';

export default function ClipViewerPage() {
  const { clipId }  = useParams();
  const navigate    = useNavigate();
  const showToast   = useAppStore(s => s.showToast);
  const videoRef    = useRef(null);
  const [clip,      setClip]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [liked,     setLiked]     = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [muted,     setMuted]     = useState(false);
  const [playing,   setPlaying]   = useState(true);

  useEffect(() => {
    if (!clipId) return;
    getDoc(doc(db, 'clips', clipId)).then(snap => {
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() };
        setClip(data);
        setLikeCount(data.likeCount || 0);
        setLiked((data.likedBy || []).includes(auth.currentUser?.uid));
        // Increment view count
        updateDoc(doc(db, 'clips', clipId), { viewCount: increment(1) }).catch(() => {});
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [clipId]);

  const toggleLike = async () => {
    if (!auth.currentUser) { showToast('Sign in to like'); return; }
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount(c => newLiked ? c + 1 : c - 1);
    try {
      await updateDoc(doc(db, 'clips', clipId), {
        likedBy:   newLiked ? arrayUnion(auth.currentUser.uid)  : arrayRemove(auth.currentUser.uid),
        likeCount: increment(newLiked ? 1 : -1),
      });
    } catch { setLiked(!newLiked); setLikeCount(c => newLiked ? c - 1 : c + 1); }
  };

  const share = async () => {
    const url = `${window.location.origin}/clips/${clipId}`;
    if (navigator.share) {
      await navigator.share({ title: clip?.streamTitle || 'Check out this clip!', url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url).catch(() => {});
      showToast('✓ Link copied!');
    }
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) { videoRef.current.play(); setPlaying(true); }
    else { videoRef.current.pause(); setPlaying(false); }
  };

  if (loading) return (
    <div style={{ background:'#000', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:'40px', height:'40px', borderRadius:'50%', border:'3px solid rgba(255,255,255,0.1)',
        borderTopColor:'#ef4444', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!clip) return (
    <div style={{ background:'#0a0a18', minHeight:'100vh', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', padding:'32px', textAlign:'center' }}>
      <div style={{ fontSize:'48px', marginBottom:'12px' }}>✂️</div>
      <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'16px', marginBottom:'8px' }}>Clip not found</div>
      <div style={{ color:'#64748b', fontSize:'13px', marginBottom:'20px' }}>This clip may have been removed.</div>
      <button onClick={() => navigate('/live')} style={{ background:'linear-gradient(135deg,#ef4444,#f59e0b)',
        border:'none', borderRadius:'12px', padding:'10px 22px', color:'white', fontWeight:700, fontSize:'13px', cursor:'pointer' }}>
        Browse Live
      </button>
    </div>
  );

  return (
    <div style={{ background:'#000', minHeight:'100vh', position:'relative' }}>

      {/* Video */}
      <div style={{ position:'relative', width:'100%', maxHeight:'100dvh', aspectRatio:'9/16',
        margin:'0 auto', background:'#000', overflow:'hidden', cursor:'pointer' }}
        onClick={togglePlayPause}>
        {clip.videoUrl
          ? <video ref={videoRef} src={clip.videoUrl} autoPlay loop playsInline muted={muted}
              style={{ width:'100%', height:'100%', objectFit:'cover' }}
              onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
          : <div style={{ width:'100%', height:'100%', minHeight:'400px', background:'linear-gradient(135deg,#1e293b,#334155)',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:'48px' }}>✂️</div>
        }

        {/* Play/Pause indicator */}
        {!playing && (
          <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
            width:'64px', height:'64px', borderRadius:'50%', background:'rgba(0,0,0,0.6)',
            display:'flex', alignItems:'center', justifyContent:'center', pointerEvents:'none' }}>
            <span style={{ color:'white', fontSize:'28px', marginLeft:'4px' }}>▶</span>
          </div>
        )}

        {/* Back button */}
        <button onClick={e => { e.stopPropagation(); navigate(-1); }}
          style={{ position:'absolute', top:'16px', left:'16px', background:'rgba(0,0,0,0.5)',
            border:'none', borderRadius:'50%', width:'36px', height:'36px', color:'white',
            fontSize:'18px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>←</button>

        {/* Mute button */}
        <button onClick={e => { e.stopPropagation(); setMuted(m => !m); if (videoRef.current) videoRef.current.muted = !muted; }}
          style={{ position:'absolute', top:'16px', right:'16px', background:'rgba(0,0,0,0.5)',
            border:'none', borderRadius:'50%', width:'36px', height:'36px', color:'white',
            fontSize:'16px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
          {muted ? '🔇' : '🔊'}
        </button>

        {/* Clip badge */}
        <div style={{ position:'absolute', top:'16px', left:'50%', transform:'translateX(-50%)',
          background:'rgba(0,0,0,0.7)', borderRadius:'8px', padding:'3px 10px',
          color:'white', fontSize:'11px', fontWeight:700 }}>✂️ CLIP</div>

        {/* Info overlay */}
        <div style={{ position:'absolute', bottom:0, left:0, right:0,
          background:'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
          padding:'80px 16px 20px' }}>
          <div style={{ color:'white', fontWeight:800, fontSize:'15px', marginBottom:'4px' }}>
            {clip.streamTitle || 'Stream Clip'}
          </div>
          <div style={{ color:'rgba(255,255,255,0.7)', fontSize:'12px', marginBottom:'4px' }}>
            by {clip.streamerName || 'Creator'}
          </div>
          {clip.streamId && (
            <button onClick={e => { e.stopPropagation(); navigate(`/live/watch/${clip.streamId}`); }}
              style={{ background:'rgba(239,68,68,0.9)', border:'none', borderRadius:'8px',
                padding:'6px 14px', color:'white', fontWeight:700, fontSize:'12px', cursor:'pointer', marginTop:'4px' }}>
              🔴 Watch Full Stream
            </button>
          )}
        </div>

        {/* Right-side action rail */}
        <div style={{ position:'absolute', right:'12px', bottom:'100px', display:'flex', flexDirection:'column', gap:'20px', alignItems:'center' }}>
          <button onClick={e => { e.stopPropagation(); toggleLike(); }}
            style={{ background:'none', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'2px' }}>
            <span style={{ fontSize:'28px' }}>{liked ? '❤️' : '🤍'}</span>
            <span style={{ color:'white', fontSize:'11px', fontWeight:700 }}>{likeCount >= 1000 ? `${(likeCount/1000).toFixed(1)}K` : likeCount}</span>
          </button>
          <button onClick={e => { e.stopPropagation(); share(); }}
            style={{ background:'none', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'2px' }}>
            <span style={{ fontSize:'28px' }}>🔗</span>
            <span style={{ color:'white', fontSize:'11px', fontWeight:700 }}>Share</span>
          </button>
          <button onClick={e => { e.stopPropagation(); navigate(`/profile/${clip.streamerId}`); }}
            style={{ background:'none', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'2px' }}>
            <div style={{ width:'40px', height:'40px', borderRadius:'50%', background:'#334155', overflow:'hidden',
              border:'2px solid white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px' }}>
              {clip.streamerAvatarUrl
                ? <img src={clip.streamerAvatarUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                : '👤'}
            </div>
            <span style={{ color:'white', fontSize:'10px', fontWeight:700 }}>Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
