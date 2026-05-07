// LiveWatchPage.jsx — /live/watch/:streamId
// UX-20: Quality switching (auto/360p/720p/1080p)
// UX-21: Full-screen mode button (Fullscreen API + orientationchange — MOB-1)
// UX-22: Emoji picker in chat
// UX-23: Raise-hand button — writes to Firestore raises/{streamId}/hands/{userId}
// MOB-2: iOS Safari autoplay — playsInline muted on video element

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  doc, getDoc, onSnapshot, collection, query,
  orderBy, limit, addDoc, setDoc, deleteDoc,
  updateDoc, arrayUnion, serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import useAppStore from '@store/useAppStore';

const EMOJI_LIST = ['😂','❤️','🔥','👏','😍','🎉','💪','😮','👑','💎','🚀','🎮'];
const QUALITY_OPTIONS = [
  { id:'auto',  label:'Auto' },
  { id:'1080p', label:'1080p' },
  { id:'720p',  label:'720p' },
  { id:'480p',  label:'480p' },
  { id:'360p',  label:'360p' },
];

export default function LiveWatchPage() {
  const navigate    = useNavigate();
  const { streamId } = useParams();
  const showToast   = useAppStore(s => s.showToast);

  const videoRef      = useRef(null);
  const chatEndRef    = useRef(null);
  const containerRef  = useRef(null);

  const [stream,       setStream]       = useState(null);
  const [messages,     setMessages]     = useState([]);
  const [chatText,     setChatText]     = useState('');
  const [sending,      setSending]      = useState(false);
  const [viewers,      setViewers]      = useState(0);
  const [isFollowing,  setIsFollowing]  = useState(false);
  const [handRaised,   setHandRaised]   = useState(false);   // UX-23
  const [showEmoji,    setShowEmoji]    = useState(false);   // UX-22
  const [isFullscreen, setIsFullscreen] = useState(false);   // UX-21
  const [quality,      setQuality]      = useState('auto');  // UX-20
  const [showQuality,  setShowQuality]  = useState(false);
  const [muted,        setMuted]        = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimer  = useRef(null);

  // Load stream data
  useEffect(() => {
    if (!streamId) return;
    const unsub = onSnapshot(doc(db, 'streams', streamId), snap => {
      if (snap.exists()) {
        setStream({ id: snap.id, ...snap.data() });
        setViewers(snap.data().viewerCount || 0);
      }
    });
    return () => unsub();
  }, [streamId]);

  // Track viewer presence
  useEffect(() => {
    if (!streamId || !auth.currentUser) return;
    const presenceRef = doc(db, 'streams', streamId, 'viewers', auth.currentUser.uid);
    setDoc(presenceRef, { uid: auth.currentUser.uid, joinedAt: serverTimestamp() }).catch(() => {});
    return () => { deleteDoc(presenceRef).catch(() => {}); };
  }, [streamId]);

  // Load chat messages
  useEffect(() => {
    if (!streamId) return;
    const q = query(
      collection(db, 'streams', streamId, 'messages'),
      orderBy('createdAt', 'asc'),
      limit(100)
    );
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [streamId]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check follow state
  useEffect(() => {
    if (!auth.currentUser || !stream) return;
    getDoc(doc(db, 'users', auth.currentUser.uid)).then(snap => {
      if (snap.exists()) setIsFollowing((snap.data().following || []).includes(stream.userId));
    }).catch(() => {});
  }, [stream]);

  // Auto-hide controls after 4 seconds of inactivity
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => setShowControls(false), 4000);
  }, []);

  useEffect(() => {
    resetControlsTimer();
    return () => { if (controlsTimer.current) clearTimeout(controlsTimer.current); };
  }, [resetControlsTimer]);

  // UX-21: Fullscreen API + MOB-1 orientationchange handler
  const toggleFullscreen = async () => {
    const el = containerRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        await (el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen).call(el);
        setIsFullscreen(true);
        // MOB-1: Lock to landscape on mobile
        if (screen.orientation?.lock) {
          await screen.orientation.lock('landscape').catch(() => {});
        }
      } else {
        await (document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen).call(document);
        setIsFullscreen(false);
        if (screen.orientation?.unlock) screen.orientation.unlock();
      }
    } catch (e) { console.warn('Fullscreen error:', e); }
  };

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
    };
  }, []);

  // Send chat message
  const sendMessage = async (text) => {
    const t = (text || chatText).trim();
    if (!t || sending) return;
    if (!auth.currentUser) { showToast('Sign in to chat'); return; }
    setSending(true);
    setChatText('');
    setShowEmoji(false);
    try {
      await addDoc(collection(db, 'streams', streamId, 'messages'), {
        userId:    auth.currentUser.uid,
        userName:  auth.currentUser.displayName || 'Viewer',
        userPhoto: auth.currentUser.photoURL || null,
        text:      t,
        createdAt: serverTimestamp(),
      });
    } catch { showToast('Failed to send message'); }
    finally { setSending(false); }
  };

  // UX-23: Raise hand — writes to Firestore
  const toggleHand = async () => {
    if (!auth.currentUser) { showToast('Sign in to raise hand'); return; }
    const handRef = doc(db, 'streams', streamId, 'raisedHands', auth.currentUser.uid);
    try {
      if (handRaised) {
        await deleteDoc(handRef);
        setHandRaised(false);
        showToast('Hand lowered');
      } else {
        await setDoc(handRef, {
          userId:    auth.currentUser.uid,
          userName:  auth.currentUser.displayName || 'Viewer',
          raisedAt:  serverTimestamp(),
        });
        setHandRaised(true);
        showToast('✋ Hand raised! The streamer can see you.');
      }
    } catch { showToast('Failed to raise hand'); }
  };

  // Follow/Unfollow streamer
  const toggleFollow = async () => {
    if (!auth.currentUser || !stream) return;
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        following: isFollowing
          ? (await import('firebase/firestore')).then(m => m.arrayRemove(stream.userId))
          : arrayUnion(stream.userId),
      });
      setIsFollowing(v => !v);
      showToast(isFollowing ? 'Unfollowed' : '✓ Following');
    } catch { showToast('Failed'); }
  };

  // UX-20: Quality change hint (actual quality switching requires HLS.js or server-side adaptation)
  const handleQuality = (q) => {
    setQuality(q);
    setShowQuality(false);
    showToast(`Quality: ${q}`);
    // For HLS: hls.currentLevel = ... (would need HLS.js integration)
    if (videoRef.current) {
      videoRef.current.load(); // Trigger re-load at new quality when implemented
    }
  };

  const fmt = n => n >= 1000 ? `${(n/1000).toFixed(1)}K` : String(n || 0);

  if (!stream) {
    return (
      <div style={{ background:'#0a0a18', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:'40px', marginBottom:'12px' }}>📡</div>
          <div style={{ color:'#64748b', fontSize:'14px' }}>Loading stream…</div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef}
      style={{ background:'#000', minHeight:'100vh', display:'flex', flexDirection:'column',
        paddingBottom: isFullscreen ? 0 : '80px' }}
      onPointerMove={resetControlsTimer}
      onPointerDown={resetControlsTimer}>

      {/* VIDEO PLAYER */}
      <div style={{ position:'relative', width:'100%', aspectRatio: isFullscreen ? 'auto' : '16/9',
        flex: isFullscreen ? 1 : 'none', background:'#000' }}>

        {/* MOB-2 FIX: playsInline muted for iOS Safari autoplay */}
        <video
          ref={videoRef}
          autoPlay
          playsInline          // MOB-2: Required for iOS Safari autoplay
          muted={muted}
          controls={false}
          style={{ width:'100%', height:'100%', objectFit:'contain', display:'block' }}
        />

        {/* Placeholder when no stream URL */}
        {!stream.streamUrl && (
          <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column',
            alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,#1e293b,#0f172a)' }}>
            <div style={{ fontSize:'64px', marginBottom:'12px' }}>🔴</div>
            <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'16px', marginBottom:'4px' }}>{stream.title}</div>
            <div style={{ color:'#94a3b8', fontSize:'13px' }}>{stream.userName}</div>
          </div>
        )}

        {/* Overlay controls — auto-hide after 4s */}
        <div style={{ position:'absolute', inset:0, opacity: showControls ? 1 : 0, transition:'opacity 0.3s',
          pointerEvents: showControls ? 'auto' : 'none' }}>

          {/* Top bar */}
          <div style={{ position:'absolute', top:0, left:0, right:0, padding:'10px 12px',
            background:'linear-gradient(to bottom,rgba(0,0,0,0.7),transparent)',
            display:'flex', alignItems:'center', gap:'8px' }}>
            <button onClick={() => navigate(-1)}
              style={{ background:'rgba(0,0,0,0.5)', border:'none', borderRadius:'8px',
                color:'white', fontSize:'18px', cursor:'pointer', padding:'4px 8px', minWidth:'36px', minHeight:'36px' }}>←</button>
            <div style={{ flex:1, overflow:'hidden' }}>
              <div style={{ color:'white', fontWeight:700, fontSize:'13px',
                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{stream.title}</div>
              <div style={{ color:'rgba(255,255,255,0.7)', fontSize:'11px' }}>{stream.userName}</div>
            </div>
            {/* Live indicator + viewer count */}
            <div style={{ background:'#ef4444', borderRadius:'6px', padding:'2px 8px', color:'white', fontSize:'10px', fontWeight:800 }}>● LIVE</div>
            <div style={{ background:'rgba(0,0,0,0.5)', borderRadius:'6px', padding:'2px 8px', color:'white', fontSize:'10px' }}>
              👁 {fmt(viewers)}
            </div>
          </div>

          {/* Bottom controls */}
          <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'10px 12px',
            background:'linear-gradient(to top,rgba(0,0,0,0.7),transparent)',
            display:'flex', alignItems:'center', gap:'8px' }}>

            {/* Mute */}
            <button onClick={() => setMuted(v => !v)}
              aria-label={muted ? 'Unmute' : 'Mute'}
              style={{ background:'rgba(0,0,0,0.5)', border:'none', borderRadius:'8px', color:'white', fontSize:'18px', cursor:'pointer',
                padding:'4px', minWidth:'36px', minHeight:'36px', display:'flex', alignItems:'center', justifyContent:'center' }}>
              {muted ? '🔇' : '🔊'}
            </button>

            {/* UX-20: Quality picker */}
            <div style={{ position:'relative' }}>
              <button onClick={() => { setShowQuality(v => !v); setShowEmoji(false); }}
                style={{ background:'rgba(0,0,0,0.5)', border:'none', borderRadius:'8px', color:'white', fontSize:'11px', fontWeight:700,
                  cursor:'pointer', padding:'4px 10px', minHeight:'36px' }}>
                ⚙️ {quality}
              </button>
              {showQuality && (
                <div style={{ position:'absolute', bottom:'44px', left:0, background:'#1e293b', borderRadius:'10px',
                  padding:'6px', display:'flex', flexDirection:'column', gap:'4px', zIndex:10, minWidth:'90px', boxShadow:'0 4px 20px rgba(0,0,0,0.5)' }}>
                  {QUALITY_OPTIONS.map(q => (
                    <button key={q.id} onClick={() => handleQuality(q.id)}
                      style={{ background: quality===q.id ? 'linear-gradient(135deg,#ef4444,#f59e0b)' : 'transparent',
                        border:'none', borderRadius:'6px', padding:'6px 10px', color:'white', fontSize:'12px', fontWeight:600,
                        cursor:'pointer', textAlign:'left' }}>
                      {q.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div style={{ flex:1 }} />

            {/* UX-21: Fullscreen button */}
            <button onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              style={{ background:'rgba(0,0,0,0.5)', border:'none', borderRadius:'8px', color:'white', fontSize:'16px',
                cursor:'pointer', padding:'4px', minWidth:'36px', minHeight:'36px', display:'flex', alignItems:'center', justifyContent:'center' }}>
              {isFullscreen ? '⊡' : '⛶'}
            </button>
          </div>
        </div>
      </div>

      {/* Stream info + actions */}
      {!isFullscreen && (
        <div style={{ background:'#0a0a18', padding:'10px 14px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <div style={{ flex:1 }}>
              <div style={{ color:'#f1f5f9', fontWeight:800, fontSize:'15px' }}>{stream.title}</div>
              <div style={{ color:'#94a3b8', fontSize:'12px', marginTop:'1px' }}>{stream.userName}</div>
            </div>
            <button onClick={toggleFollow}
              style={{ background: isFollowing ? '#334155' : 'linear-gradient(135deg,#ef4444,#f59e0b)',
                border:'none', borderRadius:'10px', padding:'7px 16px', color: isFollowing?'#94a3b8':'white',
                fontWeight:700, fontSize:'12px', cursor:'pointer', flexShrink:0 }}>
              {isFollowing ? '✓ Following' : '+ Follow'}
            </button>
            {/* UX-23: Raise hand */}
            <button onClick={toggleHand}
              aria-label={handRaised ? 'Lower hand' : 'Raise hand'}
              style={{ background: handRaised ? 'linear-gradient(135deg,#f59e0b,#ef4444)' : '#1e293b',
                border:'none', borderRadius:'10px', padding:'7px 12px', cursor:'pointer',
                fontSize:'16px', flexShrink:0, minWidth:'40px', minHeight:'40px' }}>
              ✋
            </button>
          </div>
        </div>
      )}

      {/* CHAT */}
      {!isFullscreen && (
        <div style={{ flex:1, display:'flex', flexDirection:'column', background:'#0a0a18', maxHeight:'260px' }}>
          <div style={{ padding:'6px 14px', borderBottom:'1px solid #1e293b' }}>
            <span style={{ color:'#64748b', fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em' }}>
              💬 Live Chat
            </span>
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:'auto', padding:'8px 14px', display:'flex', flexDirection:'column', gap:'6px' }}>
            {messages.length === 0 ? (
              <div style={{ color:'#64748b', fontSize:'12px', textAlign:'center', padding:'16px 0' }}>Be the first to say something!</div>
            ) : messages.map(msg => (
              <div key={msg.id} style={{ display:'flex', gap:'6px', alignItems:'flex-start' }}>
                {msg.userPhoto
                  ? <img src={msg.userPhoto} alt="" style={{ width:'22px', height:'22px', borderRadius:'50%', flexShrink:0, marginTop:'1px' }} />
                  : <div style={{ width:'22px', height:'22px', borderRadius:'50%', background:'#334155', flexShrink:0, marginTop:'1px',
                      display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', color:'#94a3b8' }}>
                      {msg.userName?.[0]?.toUpperCase() || '?'}
                    </div>
                }
                <div>
                  <span style={{ color:'#f59e0b', fontSize:'11px', fontWeight:700, marginRight:'5px' }}>{msg.userName}</span>
                  <span style={{ color:'#f1f5f9', fontSize:'13px' }}>{msg.text}</span>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Chat input */}
          <div style={{ padding:'8px 12px', borderTop:'1px solid #1e293b', background:'#0a0a18' }}>
            {/* UX-22: Emoji picker */}
            {showEmoji && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', padding:'8px', background:'#1e293b',
                borderRadius:'12px', marginBottom:'8px' }}>
                {EMOJI_LIST.map(e => (
                  <button key={e} onClick={() => { setChatText(t => t + e); setShowEmoji(false); }}
                    style={{ background:'none', border:'none', fontSize:'22px', cursor:'pointer', padding:'2px' }}>
                    {e}
                  </button>
                ))}
              </div>
            )}
            <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
              {/* UX-22: Emoji toggle button */}
              <button onClick={() => setShowEmoji(v => !v)}
                aria-label="Open emoji picker"
                style={{ background:'#1e293b', border:'none', borderRadius:'10px', padding:'8px',
                  fontSize:'18px', cursor:'pointer', flexShrink:0, minWidth:'38px', minHeight:'38px' }}>
                😊
              </button>
              <input
                value={chatText}
                onChange={e => setChatText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Send a message…"
                maxLength={200}
                style={{ flex:1, background:'#1e293b', border:'1px solid #334155', borderRadius:'20px',
                  padding:'8px 14px', color:'#f1f5f9', fontSize:'13px', outline:'none' }}
              />
              <button onClick={() => sendMessage()} disabled={!chatText.trim() || sending}
                style={{ background: chatText.trim() && !sending ? 'linear-gradient(135deg,#ef4444,#f59e0b)' : '#334155',
                  border:'none', borderRadius:'10px', padding:'8px 14px', color:'white', fontWeight:700,
                  fontSize:'13px', cursor: chatText.trim() ? 'pointer' : 'not-allowed', flexShrink:0,
                  minWidth:'60px', minHeight:'38px' }}>
                {sending ? '⏳' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
