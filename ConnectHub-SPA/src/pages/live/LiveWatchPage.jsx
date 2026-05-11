// LiveWatchPage.jsx — /live/watch/:streamId
// ============================================================
// ALL ORIGINAL FIXES (Round 1 + Round 2) retained.
// NEW FEATURES (Round 3 — Missing Features Sprint):
//   MISSING-03: "Now Watching" card overlay fades after 3s on entry
//   MISSING-04: Chat message relative timestamps (updated every 30s)
//   MISSING-05: Pinned message banner (from stream.pinnedMessage)
//   MISSING-07: Live polls — viewer voting via Firestore
//   MISSING-08: Accurate viewer count from 'viewers' subcollection (not denormalized field)
//   MISSING-10: Clip creation — rolling 60s MediaRecorder buffer → download
//   MISSING-11: Stream duration badge ("Live 45m") computed from stream.startedAt
//   MISSING-12: Gift leaderboard — top gifters from 'gifts' subcollection
// ============================================================

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  doc, getDoc, onSnapshot, collection, query,
  orderBy, limit, addDoc, setDoc, deleteDoc,
  updateDoc, arrayUnion, arrayRemove, serverTimestamp, where,
} from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '@/firebase/config';
import useAppStore from '@store/useAppStore';

const EMOJI_LIST = ['😂','❤️','🔥','👏','😍','🎉','💪','😮','👑','💎','🚀','🎮','✨','🙌','💯','🥳'];
const QUALITY_OPTIONS = [
  { id:'auto',  label:'Auto' },
  { id:'1080p', label:'1080p' },
  { id:'720p',  label:'720p' },
  { id:'480p',  label:'480p' },
  { id:'360p',  label:'360p' },
];

// MISSING-04: Relative time formatter
function relTime(ts) {
  if (!ts) return '';
  const ms = ts?.toMillis ? ts.toMillis() : (typeof ts === 'number' ? ts : Date.now());
  const diff = Math.floor((Date.now() - ms) / 1000);
  if (diff < 10)  return 'just now';
  if (diff < 60)  return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff/60)}m`;
  return `${Math.floor(diff/3600)}h`;
}

// MISSING-11: Duration from startedAt
function streamAge(startedAt) {
  if (!startedAt) return null;
  const ms = startedAt?.toMillis ? startedAt.toMillis() : (typeof startedAt === 'number' ? startedAt : null);
  if (!ms) return null;
  const s = Math.floor((Date.now() - ms) / 1000);
  if (s < 60) return 'just started';
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function LiveWatchPage() {
  const navigate     = useNavigate();
  const { streamId } = useParams();
  const showToast    = useAppStore(s => s.showToast);

  const videoRef      = useRef(null);
  const chatEndRef    = useRef(null);
  const containerRef  = useRef(null);
  const clipBufRef    = useRef([]);       // MISSING-10: clip buffer chunks
  const clipRecRef    = useRef(null);     // MISSING-10: MediaRecorder instance

  const [stream,        setStream]        = useState(null);
  const [messages,      setMessages]      = useState([]);
  const [chatText,      setChatText]      = useState('');
  const [sending,       setSending]       = useState(false);
  const [viewers,       setViewers]       = useState(0);   // MISSING-08: from subcollection
  const [isFollowing,   setIsFollowing]   = useState(false);
  const [handRaised,    setHandRaised]    = useState(false);
  const [showEmoji,     setShowEmoji]     = useState(false);
  const [isFullscreen,  setIsFullscreen]  = useState(false);
  const [quality,       setQuality]       = useState('auto');
  const [showQuality,   setShowQuality]   = useState(false);
  const [muted,         setMuted]         = useState(true);
  const [showUnmute,    setShowUnmute]    = useState(true);
  const [showControls,  setShowControls]  = useState(true);
  const [buffering,     setBuffering]     = useState(false);
  const [reconnecting,  setReconnecting]  = useState(false);
  const [reconnAttempts,setReconnAttempts]= useState(0);

  // MISSING-03: Now Watching overlay
  const [showNowWatching, setShowNowWatching] = useState(true);
  // MISSING-07: Poll state
  const [activePoll,    setActivePoll]    = useState(null);
  const [pollVoted,     setPollVoted]     = useState(null); // option index voted
  // GAP-04: Slow mode
  const [chatCooldown,  setChatCooldown]  = useState(false);
  const [cooldownSecs,  setCooldownSecs]  = useState(0);
  // GAP-16: PiP state
  const [isPiP,         setIsPiP]         = useState(false);
  // MISSING-10: Clip state
  const [clipping,      setClipping]      = useState(false);
  // MISSING-11: Duration tick
  const [nowTs,         setNowTs]         = useState(Date.now());
  // MISSING-12: Gift leaderboard
  const [topGifters,    setTopGifters]    = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  // MISSING-D: Gift picker
  const [showGiftPicker,  setShowGiftPicker]  = useState(false);
  const [giftSending,     setGiftSending]     = useState(false);
  // MISSING-G: Chat scroll-lock
  const [scrollLocked,    setScrollLocked]    = useState(false);
  const [newMsgCount,     setNewMsgCount]     = useState(0);
  const chatContainerRef = useRef(null);
  // MISSING-H/I: Floating event notifications
  const [floatNotif,      setFloatNotif]      = useState(null); // { icon, text }
  // MISSING-J: Floating emoji reactions
  const [floatEmojis,     setFloatEmojis]     = useState([]); // [{ id, emoji, x }]
  // MISSING-P: Report modal
  const [showReport,      setShowReport]      = useState(false);
  const [reportReason,    setReportReason]    = useState('');
  const [reportSending,   setReportSending]   = useState(false);
  // MISSING-N: VOD state
  const [vodSpeed,        setVodSpeed]        = useState(1);
  // Relative timestamp tick
  const [_tick,         setTick]          = useState(0);

  const reconTimerRef  = useRef(null);
  const controlsTimer  = useRef(null);
  const publisherRef   = useRef(null);

  // ── Load stream data ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!streamId) return;
    const unsub = onSnapshot(doc(db, 'streams', streamId), snap => {
      if (snap.exists()) setStream({ id: snap.id, ...snap.data() });
    });
    return () => unsub();
  }, [streamId]);

  // MISSING-03: Auto-hide "Now Watching" card after 3 seconds
  useEffect(() => {
    const t = setTimeout(() => setShowNowWatching(false), 3000);
    return () => clearTimeout(t);
  }, []);

  // MISSING-08: Accurate viewer count from subcollection (not denormalized field)
  useEffect(() => {
    if (!streamId) return;
    const unsub = onSnapshot(collection(db, 'streams', streamId, 'viewers'), snap => {
      setViewers(snap.size);
    }, () => {});
    return () => unsub();
  }, [streamId]);

  // Track viewer presence
  useEffect(() => {
    if (!streamId || !auth.currentUser) return;
    const presenceRef = doc(db, 'streams', streamId, 'viewers', auth.currentUser.uid);
    setDoc(presenceRef, {
      uid:       auth.currentUser.uid,
      userName:  auth.currentUser.displayName || 'Viewer',
      avatar:    auth.currentUser.photoURL || null,
      joinedAt:  serverTimestamp(),
    }).catch(() => {});
    return () => { deleteDoc(presenceRef).catch(() => {}); };
  }, [streamId]);

  // GAP-02 FIX: Chat sliding window — latest 100 msgs (desc order, then reversed for display)
  useEffect(() => {
    if (!streamId) return;
    const q = query(
      collection(db, 'streams', streamId, 'messages'),
      orderBy('createdAt', 'desc'),
      limit(100)
    );
    const unsub = onSnapshot(q, snap => {
      // Reverse to display oldest-first; keep capped at 100
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() })).reverse();
      setMessages(msgs);
    });
    return () => unsub();
  }, [streamId]);

  // Auto-scroll chat
  useEffect(() => {
    if (!scrollLocked) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
      setNewMsgCount(n => n + 1); // MISSING-G: count new msgs while locked
    }
  }, [messages]); // eslint-disable-line

  // MISSING-G: Chat container scroll listener
  useEffect(() => {
    const el = chatContainerRef.current;
    if (!el) return;
    const handler = () => {
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
      if (atBottom) { setScrollLocked(false); setNewMsgCount(0); }
      else setScrollLocked(true);
    };
    el.addEventListener('scroll', handler, { passive: true });
    return () => el.removeEventListener('scroll', handler);
  }, []);

  // MISSING-H: Gift notification listener (latest gift)
  // GAP-FIX: Removed broken require-check pattern — imports are at top of file
  useEffect(() => {
    if (!streamId) return;
    const unsub = onSnapshot(
      query(collection(db, 'streams', streamId, 'gifts'), orderBy('createdAt', 'desc'), limit(1)),
      (snap) => {
        if (snap.empty) return;
        const g = snap.docs[0].data();
        const age = Date.now() - ((g.createdAt?.seconds || 0) * 1000);
        if (age < 5000) { // only show if gift is fresh (< 5s old)
          setFloatNotif({ icon: g.emoji || '🎁', text: `${g.userName} gifted ${g.name}!` });
          setTimeout(() => setFloatNotif(null), 4000);
        }
      }
    );
    return () => unsub();
  }, [streamId]); // eslint-disable-line

  // MISSING-J: Floating emoji trigger when single-emoji message arrives
  useEffect(() => {
    if (!messages.length) return;
    const last = messages[messages.length - 1];
    const singleEmoji = /^(\p{Emoji_Presentation}|\p{Extended_Pictographic}){1,3}$/u.test(last?.text || '');
    if (singleEmoji && last?.type !== 'system') {
      const id = Date.now();
      const x = 55 + Math.random() * 25;
      setFloatEmojis(prev => [...prev.slice(-6), { id, emoji: last.text, x }]);
      setTimeout(() => setFloatEmojis(prev => prev.filter(e => e.id !== id)), 3500);
    }
  }, [messages]);

  // Follow state
  useEffect(() => {
    if (!auth.currentUser || !stream) return;
    getDoc(doc(db, 'users', auth.currentUser.uid)).then(snap => {
      if (snap.exists()) setIsFollowing((snap.data().following || []).includes(stream.userId));
    }).catch(() => {});
  }, [stream]);

  // MISSING-07: Active poll listener
  useEffect(() => {
    if (!streamId) return;
    const q = query(
      collection(db, 'streams', streamId, 'polls'),
      where('status', '==', 'active'),
      limit(1)
    );
    const unsub = onSnapshot(q, snap => {
      setActivePoll(snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() });
    }, () => {});
    return () => unsub();
  }, [streamId]);

  // MISSING-12: Gift leaderboard
  useEffect(() => {
    if (!streamId) return;
    const q = query(
      collection(db, 'streams', streamId, 'gifts'),
      orderBy('totalAmount', 'desc'),
      limit(5)
    );
    const unsub = onSnapshot(q, snap => {
      const grouped = {};
      snap.docs.forEach(d => {
        const g = d.data();
        const uid = g.userId;
        if (!grouped[uid]) grouped[uid] = { userId: uid, userName: g.userName, totalAmount: 0, count: 0 };
        grouped[uid].totalAmount += g.amount || 0;
        grouped[uid].count += 1;
      });
      const sorted = Object.values(grouped).sort((a,b) => b.totalAmount - a.totalAmount).slice(0,5);
      setTopGifters(sorted);
    }, () => {});
    return () => unsub();
  }, [streamId]);

  // MISSING-11: Tick every 30s for duration badge + MISSING-04: relative time ticks
  useEffect(() => {
    const t = setInterval(() => { setNowTs(Date.now()); setTick(v => v + 1); }, 30000);
    return () => clearInterval(t);
  }, []);

  // Buffering/reconnect handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let reconCount = 0;
    const onWaiting = () => setBuffering(true);
    const onStalled = () => {
      setBuffering(true);
      if (reconCount < 3) {
        reconTimerRef.current = setTimeout(() => {
          reconCount++;
          setReconnAttempts(reconCount);
          setReconnecting(true);
          if (video.src) { video.load(); video.play().catch(() => {}); }
          reconTimerRef.current = setTimeout(() => setReconnecting(false), 4000);
        }, 5000 * (reconCount + 1)); // exponential backoff: 5s, 10s, 15s
      }
    };
    const onPlaying = () => {
      setBuffering(false);
      setReconnecting(false);
      setReconnAttempts(0);
      if (reconTimerRef.current) { clearTimeout(reconTimerRef.current); reconTimerRef.current = null; }
    };
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('stalled', onStalled);
    video.addEventListener('playing', onPlaying);
    return () => {
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('stalled', onStalled);
      video.removeEventListener('playing', onPlaying);
      if (reconTimerRef.current) clearTimeout(reconTimerRef.current);
    };
  }, []);

  // MISSING-10: Set up rolling MediaRecorder buffer on video element
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const trySetupRecorder = () => {
      try {
        if (!video.srcObject && !video.captureStream) return;
        const mediaStream = video.srcObject || (video.captureStream?.() ?? null);
        if (!mediaStream) return;
        const rec = new MediaRecorder(mediaStream, { mimeType: 'video/webm;codecs=vp8,opus' });
        rec.ondataavailable = (e) => {
          if (e.data?.size > 0) {
            clipBufRef.current.push({ chunk: e.data, ts: Date.now() });
            // Keep only last 70s of data
            const cutoff = Date.now() - 70000;
            clipBufRef.current = clipBufRef.current.filter(c => c.ts >= cutoff);
          }
        };
        rec.start(1000); // 1-second chunks
        clipRecRef.current = rec;
      } catch {}
    };
    const timer = setTimeout(trySetupRecorder, 2000);
    return () => {
      clearTimeout(timer);
      if (clipRecRef.current?.state === 'recording') {
        try { clipRecRef.current.stop(); } catch {}
      }
    };
  }, []);

  // Keyboard controls
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => setShowControls(false), 4000);
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (!videoRef.current) return;
    switch (e.key) {
      case ' ': case 'k':
        e.preventDefault();
        videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause();
        resetControlsTimer(); break;
      case 'm': case 'M':
        setMuted(v => !v); setShowUnmute(false); resetControlsTimer(); break;
      case 'f': case 'F':
        toggleFullscreen(); break;
      default: break;
    }
  }, [resetControlsTimer]); // eslint-disable-line

  useEffect(() => {
    resetControlsTimer();
    return () => { if (controlsTimer.current) clearTimeout(controlsTimer.current); };
  }, [resetControlsTimer]);

  // Fullscreen
  const toggleFullscreen = async () => {
    const el = containerRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        await (el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen).call(el);
        setIsFullscreen(true);
        if (screen.orientation?.lock) await screen.orientation.lock('landscape').catch(() => {});
      } else {
        await (document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen).call(document);
        setIsFullscreen(false);
        if (screen.orientation?.unlock) screen.orientation.unlock();
      }
    } catch {}
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

  const handleUnmute = () => { setMuted(false); setShowUnmute(false); resetControlsTimer(); };

  const shareStream = () => {
    const url = window.location.href;
    const title = stream?.title || 'Watch this live stream';
    if (navigator.share) { navigator.share({ title, url }).catch(() => {}); }
    else { navigator.clipboard?.writeText(url); showToast('🔗 Stream link copied!'); }
  };

  // GAP-04: Slow-mode cooldown ticker
  useEffect(() => {
    if (!chatCooldown) return;
    let s = 3;
    setCooldownSecs(s);
    const t = setInterval(() => {
      s--;
      setCooldownSecs(s);
      if (s <= 0) { clearInterval(t); setChatCooldown(false); setCooldownSecs(0); }
    }, 1000);
    return () => clearInterval(t);
  }, [chatCooldown]);

  // GAP-16: Picture-in-Picture
  const enterPiP = async () => {
    if (!videoRef.current || !document.pictureInPictureEnabled) return;
    try {
      await videoRef.current.requestPictureInPicture();
      setIsPiP(true);
    } catch {}
  };
  useEffect(() => {
    const onLeavePiP = () => setIsPiP(false);
    document.addEventListener('leavepictureinpicture', onLeavePiP);
    return () => document.removeEventListener('leavepictureinpicture', onLeavePiP);
  }, []);

  const sendMessage = async (text) => {
    const t = (text || chatText).trim();
    if (!t || sending || chatCooldown) return; // GAP-04: block during cooldown
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
      // GAP-04: activate slow-mode cooldown after send
      setChatCooldown(true);
    } catch { showToast('Failed to send message'); }
    finally { setSending(false); }
  };

  const toggleHand = async () => {
    if (!auth.currentUser) { showToast('Sign in to raise hand'); return; }
    const handRef = doc(db, 'streams', streamId, 'raisedHands', auth.currentUser.uid);
    try {
      if (handRaised) {
        await deleteDoc(handRef);
        setHandRaised(false);
        showToast('Hand lowered');
      } else {
        await setDoc(handRef, { userId: auth.currentUser.uid, userName: auth.currentUser.displayName || 'Viewer', raisedAt: serverTimestamp() });
        setHandRaised(true);
        showToast('✋ Hand raised! The streamer can see you.');
      }
    } catch { showToast('Failed to raise hand'); }
  };

  const toggleFollow = async () => {
    if (!auth.currentUser || !stream) return;
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        following: isFollowing ? arrayRemove(stream.userId) : arrayUnion(stream.userId),
      });
      setIsFollowing(v => !v);
      showToast(isFollowing ? 'Unfollowed' : '✓ Following');
    } catch { showToast('Failed'); }
  };

  const handleQuality = (q) => {
    setQuality(q); setShowQuality(false); showToast(`Quality: ${q}`);
    if (videoRef.current) videoRef.current.load();
  };

  // MISSING-07: Vote on poll
  const votePoll = async (optionIdx) => {
    if (!auth.currentUser || !activePoll || pollVoted !== null) return;
    try {
      const voteRef = doc(db, 'streams', streamId, 'polls', activePoll.id, 'votes', auth.currentUser.uid);
      await setDoc(voteRef, { optionIndex: optionIdx, userId: auth.currentUser.uid, votedAt: serverTimestamp() });
      // Update vote count on poll doc
      const options = [...(activePoll.options || [])];
      options[optionIdx] = { ...options[optionIdx], votes: (options[optionIdx].votes || 0) + 1 };
      await updateDoc(doc(db, 'streams', streamId, 'polls', activePoll.id), { options });
      setPollVoted(optionIdx);
      showToast('✅ Vote recorded!');
    } catch { showToast('Failed to vote'); }
  };

  // MISSING-10: Create clip from buffer
  const createClip = async () => {
    if (clipBufRef.current.length === 0) { showToast('No clip data available yet'); return; }
    setClipping(true);
    try {
      const chunks = clipBufRef.current.map(c => c.chunk);
      const blob   = new Blob(chunks, { type: 'video/webm' });
      // Download locally first
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `clip-${streamId.slice(0,8)}-${Date.now()}.webm`; a.click();
      URL.revokeObjectURL(url);
      showToast('📎 Clip saved!');
      // Also write clip doc to Firestore for sharing
      if (auth.currentUser) {
        await addDoc(collection(db, 'clips'), {
          streamId,
          streamTitle: stream?.title || 'Live Stream',
          streamerName: stream?.userName || 'Streamer',
          clippedBy:    auth.currentUser.uid,
          clippedByName: auth.currentUser.displayName || 'Viewer',
          status:       'ready',
          viewCount:    0,
          createdAt:    serverTimestamp(),
        });
      }
    } catch { showToast('Clip failed — try again'); }
    finally { setClipping(false); }
  };

  const fmt = n => n >= 1000 ? `${(n/1000).toFixed(1)}K` : String(n || 0);

  // MISSING-11: duration string from stream.startedAt
  const liveDuration = useMemo(() => streamAge(stream?.startedAt), [stream?.startedAt, nowTs]); // eslint-disable-line

  // MISSING-07: Compute poll total votes
  const pollTotal = useMemo(() => {
    if (!activePoll?.options) return 1;
    return Math.max(1, activePoll.options.reduce((s, o) => s + (o.votes || 0), 0));
  }, [activePoll]);

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
        paddingBottom: isFullscreen ? 0 : '80px',
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
      onPointerMove={resetControlsTimer}
      onPointerDown={resetControlsTimer}
      onTouchStart={resetControlsTimer}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="application"
      aria-label="Live stream viewer">

      {/* MISSING-03: "Now Watching" overlay fades out after 3s */}
      {showNowWatching && (
        <div style={{ position:'fixed', top:'60px', left:'50%', transform:'translateX(-50%)',
          background:'rgba(0,0,0,0.85)', borderRadius:'16px', padding:'10px 16px', zIndex:200,
          display:'flex', alignItems:'center', gap:'10px', backdropFilter:'blur(8px)',
          border:'1px solid rgba(255,255,255,0.1)', animation:'fadeIn 0.3s ease',
          maxWidth:'90vw', pointerEvents:'none' }}>
          {stream.thumbnailUrl && (
            <img src={stream.thumbnailUrl} alt="" style={{ width:'40px', height:'24px', objectFit:'cover', borderRadius:'6px', flexShrink:0 }} />
          )}
          <div>
            <div style={{ color:'white', fontWeight:700, fontSize:'12px', lineHeight:'1.3',
              overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis', maxWidth:'200px' }}>
              {stream.title}
            </div>
            <div style={{ color:'#94a3b8', fontSize:'10px' }}>📺 Now Watching · {stream.userName}</div>
          </div>
          <div style={{ background:'#ef4444', borderRadius:'4px', padding:'2px 6px', color:'white', fontSize:'9px', fontWeight:800, flexShrink:0 }}>● LIVE</div>
        </div>
      )}

      {/* VIDEO PLAYER */}
      <div style={{ position:'relative', width:'100%', aspectRatio: isFullscreen ? 'auto' : '16/9',
        flex: isFullscreen ? 1 : 'none', background:'#000' }}>

        <video
          ref={videoRef}
          autoPlay playsInline muted={muted} controls={false}
          style={{ width:'100%', height:'100%', objectFit:'contain', display:'block' }}
        />

        {/* Buffering / Reconnecting overlay */}
        {(buffering || reconnecting) && (
          <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column',
            alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.55)', zIndex:5 }}>
            <div style={{ width:'40px', height:'40px', borderRadius:'50%',
              border:'4px solid rgba(255,255,255,0.2)', borderTopColor:'#ef4444',
              animation:'spin 0.8s linear infinite', marginBottom:'10px' }} />
            <div style={{ color:'white', fontSize:'13px', fontWeight:600 }}>
              {reconnAttempts >= 3
                ? '😔 Stream disconnected'
                : reconnecting ? `🔄 Reconnecting… (${reconnAttempts}/3)` : 'Buffering…'}
            </div>
          </div>
        )}

        {/* Tap to unmute */}
        {showUnmute && (
          <button onClick={handleUnmute} aria-label="Tap to unmute"
            style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
              background:'rgba(0,0,0,0.7)', border:'2px solid rgba(255,255,255,0.4)', borderRadius:'16px',
              padding:'12px 20px', color:'white', fontSize:'14px', fontWeight:700, cursor:'pointer',
              display:'flex', alignItems:'center', gap:'8px', zIndex:6 }}>
            🔇 Tap to unmute
          </button>
        )}

        {/* No video placeholder */}
        {!stream.streamUrl && (
          <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column',
            alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,#1e293b,#0f172a)' }}>
            <div style={{ fontSize:'64px', marginBottom:'12px' }}>🔴</div>
            <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'16px', marginBottom:'4px' }}>{stream.title}</div>
            <div style={{ color:'#94a3b8', fontSize:'13px' }}>{stream.userName}</div>
          </div>
        )}

        {/* Overlay controls */}
        <div style={{ position:'absolute', inset:0, opacity: showControls ? 1 : 0, transition:'opacity 0.3s',
          pointerEvents: showControls ? 'auto' : 'none' }}>

          {/* Top bar */}
          <div style={{ position:'absolute', top:0, left:0, right:0, padding:'10px 12px',
            background:'linear-gradient(to bottom,rgba(0,0,0,0.7),transparent)',
            display:'flex', alignItems:'center', gap:'8px' }}>
            <button onClick={() => navigate(-1)} aria-label="Back"
              style={{ background:'rgba(0,0,0,0.5)', border:'none', borderRadius:'8px',
                color:'white', fontSize:'18px', cursor:'pointer', padding:'4px 8px', minWidth:'36px', minHeight:'36px' }}>←</button>
            <div style={{ flex:1, overflow:'hidden' }}>
              <div style={{ color:'white', fontWeight:700, fontSize:'13px',
                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{stream.title}</div>
              <div style={{ color:'rgba(255,255,255,0.7)', fontSize:'11px', display:'flex', alignItems:'center', gap:'6px' }}>
                {stream.userName}
                {/* MISSING-11: duration badge */}
                {liveDuration && (
                  <span style={{ background:'rgba(239,68,68,0.3)', borderRadius:'4px', padding:'1px 5px', color:'#fca5a5', fontSize:'9px', fontWeight:700 }}>
                    🕐 {liveDuration}
                  </span>
                )}
              </div>
            </div>
            <div style={{ background:'#ef4444', borderRadius:'6px', padding:'2px 8px', color:'white', fontSize:'10px', fontWeight:800 }}
              role="status" aria-label="Live stream">● LIVE</div>
            {/* MISSING-08: real viewer count from subcollection */}
            <div style={{ background:'rgba(0,0,0,0.5)', borderRadius:'6px', padding:'2px 8px', color:'white', fontSize:'10px' }}>
              👁 {fmt(viewers)}
            </div>
            {/* MISSING-P: Report "..." menu */}
            <button onClick={() => setShowReport(true)} aria-label="Report stream"
              style={{ background:'rgba(0,0,0,0.5)', border:'none', borderRadius:'8px', color:'#94a3b8',
                fontSize:'14px', cursor:'pointer', padding:'4px 8px', minWidth:'36px', minHeight:'36px' }}>
              ···
            </button>
            <button onClick={shareStream} aria-label="Share stream"
              style={{ background:'rgba(0,0,0,0.5)', border:'none', borderRadius:'8px', color:'white',
                fontSize:'16px', cursor:'pointer', padding:'4px', minWidth:'36px', minHeight:'36px',
                display:'flex', alignItems:'center', justifyContent:'center' }}>
              🔗
            </button>
          </div>

          {/* Bottom controls */}
          <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'10px 12px',
            background:'linear-gradient(to top,rgba(0,0,0,0.7),transparent)',
            display:'flex', alignItems:'center', gap:'8px' }}>
            <button onClick={() => setMuted(v => !v)} aria-label={muted ? 'Unmute' : 'Mute'}
              style={{ background:'rgba(0,0,0,0.5)', border:'none', borderRadius:'8px', color:'white', fontSize:'18px', cursor:'pointer',
                padding:'4px', minWidth:'36px', minHeight:'36px', display:'flex', alignItems:'center', justifyContent:'center' }}>
              {muted ? '🔇' : '🔊'}
            </button>

            {/* Quality */}
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

            {/* MISSING-10: Clip button */}
            <button onClick={createClip} disabled={clipping} aria-label="Create clip"
              style={{ background:'rgba(0,0,0,0.5)', border:'none', borderRadius:'8px', color: clipping ? '#64748b' : '#a5f3fc',
                fontSize:'11px', fontWeight:700, cursor: clipping ? 'wait' : 'pointer', padding:'4px 10px', minHeight:'36px' }}>
              {clipping ? '⏳' : '📎'} Clip
            </button>

            {/* MISSING-12: Gift leaderboard toggle */}
            {topGifters.length > 0 && (
              <button onClick={() => setShowLeaderboard(v => !v)} aria-label="Top gifters"
                style={{ background: showLeaderboard ? 'rgba(245,158,11,0.3)' : 'rgba(0,0,0,0.5)', border:'none', borderRadius:'8px',
                  color:'#fbbf24', fontSize:'11px', fontWeight:700, cursor:'pointer', padding:'4px 8px', minHeight:'36px' }}>
                🏆 Top
              </button>
            )}

            <div style={{ flex:1 }} />

            {/* GAP-16: PiP button */}
            {document.pictureInPictureEnabled && !isPiP && (
              <button onClick={enterPiP} aria-label="Picture in picture"
                style={{ background:'rgba(0,0,0,0.5)', border:'none', borderRadius:'8px', color:'white', fontSize:'14px',
                  cursor:'pointer', padding:'4px 8px', minWidth:'36px', minHeight:'36px', display:'flex', alignItems:'center', justifyContent:'center' }}>
                ⧉
              </button>
            )}
            <button onClick={toggleFullscreen} aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
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
              <div style={{ color:'#94a3b8', fontSize:'12px', marginTop:'1px', display:'flex', alignItems:'center', gap:'6px' }}>
                {stream.userName}
                {/* Show category badge */}
                {stream.category && (
                  <span style={{ background:'rgba(99,102,241,0.15)', borderRadius:'6px', padding:'1px 6px', color:'#818cf8', fontSize:'10px', fontWeight:600 }}>
                    {stream.category}
                  </span>
                )}
              </div>
              {/* MISSING-09: Tags */}
              {stream.tags?.length > 0 && (
                <div style={{ display:'flex', flexWrap:'wrap', gap:'4px', marginTop:'4px' }}>
                  {stream.tags.slice(0,3).map(tag => (
                    <span key={tag} style={{ background:'rgba(99,102,241,0.1)', borderRadius:'10px', padding:'1px 7px', color:'#818cf8', fontSize:'10px' }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {/* MISSING-D: Gift button */}
            <button onClick={() => setShowGiftPicker(true)} aria-label="Send a gift"
              style={{ background:'linear-gradient(135deg,#f59e0b,#ef4444)', border:'none', borderRadius:'10px',
                padding:'7px 12px', color:'white', fontWeight:700, fontSize:'12px', cursor:'pointer', flexShrink:0 }}>
              🎁 Gift
            </button>
            <button onClick={toggleFollow} aria-label={isFollowing ? 'Unfollow' : 'Follow'}
              style={{ background: isFollowing ? '#334155' : 'linear-gradient(135deg,#ef4444,#f59e0b)',
                border:'none', borderRadius:'10px', padding:'7px 16px', color: isFollowing?'#94a3b8':'white',
                fontWeight:700, fontSize:'12px', cursor:'pointer', flexShrink:0 }}>
              {isFollowing ? '✓ Following' : '+ Follow'}
            </button>
            <button onClick={toggleHand} aria-label={handRaised ? 'Lower hand' : 'Raise hand'}
              style={{ background: handRaised ? 'linear-gradient(135deg,#f59e0b,#ef4444)' : '#1e293b',
                border:'none', borderRadius:'10px', padding:'7px 12px', cursor:'pointer',
                fontSize:'16px', flexShrink:0, minWidth:'40px', minHeight:'40px' }}>
              ✋
            </button>
          </div>
        </div>
      )}

      {/* MISSING-12: Gift leaderboard panel */}
      {showLeaderboard && topGifters.length > 0 && !isFullscreen && (
        <div style={{ background:'#0f172a', borderTop:'1px solid #1e293b', padding:'10px 14px' }}>
          <div style={{ color:'#fbbf24', fontWeight:700, fontSize:'12px', marginBottom:'8px' }}>🏆 Top Gifters</div>
          <div style={{ display:'flex', gap:'10px', overflowX:'auto' }}>
            {topGifters.map((g, i) => (
              <div key={g.userId} style={{ flexShrink:0, textAlign:'center', minWidth:'56px' }}>
                <div style={{ width:'36px', height:'36px', borderRadius:'50%', margin:'0 auto 4px',
                  background: i===0 ? 'linear-gradient(135deg,#f59e0b,#ef4444)' : i===1 ? 'linear-gradient(135deg,#94a3b8,#64748b)' : 'linear-gradient(135deg,#92400e,#78350f)',
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:800, color:'white' }}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                </div>
                <div style={{ color:'#f1f5f9', fontSize:'9px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'56px' }}>{g.userName}</div>
                <div style={{ color:'#fbbf24', fontSize:'10px', fontWeight:700 }}>{g.totalAmount}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MISSING-07: Active Poll */}
      {activePoll && !isFullscreen && (
        <div style={{ background:'rgba(99,102,241,0.08)', borderTop:'1px solid rgba(99,102,241,0.2)', padding:'10px 14px' }}>
          <div style={{ color:'#818cf8', fontWeight:700, fontSize:'12px', marginBottom:'8px' }}>
            📊 Poll: {activePoll.question}
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
            {(activePoll.options || []).map((opt, idx) => {
              const pct = Math.round(((opt.votes || 0) / pollTotal) * 100);
              const voted = pollVoted === idx;
              return (
                <button key={idx} onClick={() => votePoll(idx)} disabled={pollVoted !== null} aria-label={`Vote: ${opt.label}`}
                  style={{ position:'relative', background:'#1e293b', border: voted ? '1px solid #6366f1' : '1px solid #334155',
                    borderRadius:'10px', padding:'8px 12px', cursor: pollVoted === null ? 'pointer' : 'default',
                    overflow:'hidden', textAlign:'left' }}>
                  {/* Vote fill bar */}
                  {pollVoted !== null && (
                    <div style={{ position:'absolute', inset:0, background:'rgba(99,102,241,0.15)',
                      width:`${pct}%`, transition:'width 0.5s', borderRadius:'10px 0 0 10px', pointerEvents:'none' }} />
                  )}
                  <div style={{ position:'relative', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ color: voted ? '#818cf8' : '#f1f5f9', fontSize:'12px', fontWeight: voted ? 700 : 500 }}>
                      {voted ? '✅ ' : ''}{opt.label}
                    </span>
                    {pollVoted !== null && (
                      <span style={{ color:'#64748b', fontSize:'11px', fontWeight:600 }}>{pct}%</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          {pollVoted !== null && (
            <div style={{ color:'#64748b', fontSize:'10px', marginTop:'6px', textAlign:'right' }}>
              {pollTotal} total votes
            </div>
          )}
        </div>
      )}

      {/* CHAT */}
      {!isFullscreen && (
        <div style={{ flex:1, display:'flex', flexDirection:'column', background:'#0a0a18', maxHeight:'280px' }}>
          <div style={{ padding:'6px 14px', borderBottom:'1px solid #1e293b' }}>
            <span style={{ color:'#64748b', fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em' }}>
              💬 Live Chat
            </span>
          </div>

          {/* MISSING-G: Scroll-lock "new messages" pill */}
          {scrollLocked && newMsgCount > 0 && (
            <div style={{ display:'flex', justifyContent:'center', padding:'4px 0', background:'#0a0a18' }}>
              <button onClick={() => { setScrollLocked(false); setNewMsgCount(0); chatEndRef.current?.scrollIntoView({ behavior:'smooth' }); }}
                style={{ background:'linear-gradient(135deg,#6366f1,#8b5cf6)', border:'none', borderRadius:'20px',
                  padding:'5px 14px', color:'white', fontSize:'11px', fontWeight:700, cursor:'pointer' }}>
                ⬇ {newMsgCount} new message{newMsgCount > 1 ? 's' : ''}
              </button>
            </div>
          )}
          {/* MISSING-05: Pinned message banner */}
          {stream.pinnedMessage && (
            <div style={{ background:'rgba(99,102,241,0.1)', borderBottom:'1px solid rgba(99,102,241,0.2)',
              padding:'6px 14px', display:'flex', alignItems:'flex-start', gap:'8px' }}>
              <span style={{ fontSize:'14px', flexShrink:0 }}>📌</span>
              <div>
                <div style={{ color:'#818cf8', fontSize:'10px', fontWeight:700, marginBottom:'2px' }}>Pinned by streamer</div>
                <div style={{ color:'#f1f5f9', fontSize:'12px' }}>{stream.pinnedMessage}</div>
              </div>
            </div>
          )}

          {/* MISSING-N: VOD controls (stream ended) */}
          {stream.status === 'ended' && (
            <div style={{ background:'#1e293b', padding:'6px 12px', display:'flex', alignItems:'center', gap:'8px', borderBottom:'1px solid #334155' }}>
              <span style={{ color:'#94a3b8', fontSize:'11px', fontWeight:600 }}>▶ VOD Replay</span>
              <div style={{ flex:1 }}>
                <input type="range" min="0" max="100" defaultValue="0" aria-label="Seek video position"
                  onChange={e => { if (videoRef.current) videoRef.current.currentTime = (videoRef.current.duration || 0) * (e.target.value / 100); }}
                  style={{ width:'100%', accentColor:'#ef4444' }} />
              </div>
              {[0.5, 1, 1.5, 2].map(s => (
                <button key={s} onClick={() => { setVodSpeed(s); if (videoRef.current) videoRef.current.playbackRate = s; }}
                  aria-pressed={vodSpeed === s}
                  style={{ background: vodSpeed===s ? '#ef4444' : '#334155', border:'none', borderRadius:'6px',
                    padding:'2px 6px', color:'white', fontSize:'10px', fontWeight:700, cursor:'pointer' }}>
                  {s}×
                </button>
              ))}
            </div>
          )}
          {/* Messages */}
          <div ref={chatContainerRef} style={{ flex:1, overflowY:'auto', padding:'8px 14px', display:'flex', flexDirection:'column', gap:'6px' }}>
            {messages.length === 0 ? (
              <div style={{ color:'#64748b', fontSize:'12px', textAlign:'center', padding:'16px 0' }}>Be the first to say something!</div>
            ) : messages.map(msg => (
              <div key={msg.id} style={{ display:'flex', gap:'6px', alignItems:'flex-start' }}>
                {msg.userPhoto
                  ? <img src={msg.userPhoto} alt="" loading="lazy"
                      style={{ width:'22px', height:'22px', borderRadius:'50%', flexShrink:0, marginTop:'1px', objectFit:'cover' }} />
                  : <div style={{ width:'22px', height:'22px', borderRadius:'50%', background:'#334155', flexShrink:0, marginTop:'1px',
                      display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', color:'#94a3b8' }}>
                      {msg.userName?.[0]?.toUpperCase() || '?'}
                    </div>
                }
                <div style={{ flex:1 }}>
                  <span style={{ color:'#f59e0b', fontSize:'11px', fontWeight:700, marginRight:'5px' }}>{msg.userName}</span>
                  <span style={{ color:'#f1f5f9', fontSize:'13px' }}>{msg.text}</span>
                  {/* MISSING-04: Relative timestamp */}
                  {msg.createdAt && (
                    <span style={{ color:'#475569', fontSize:'10px', marginLeft:'6px' }}>{relTime(msg.createdAt)}</span>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Chat input */}
          <div style={{
            padding:'8px 12px',
            paddingBottom:'calc(8px + env(keyboard-inset-height, env(safe-area-inset-bottom, 0px)))',
            borderTop:'1px solid #1e293b',
            background:'#0a0a18',
          }}>
            {/* Emoji picker */}
            {showEmoji && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:'4px', padding:'8px', background:'#1e293b',
                borderRadius:'12px', marginBottom:'8px' }}>
                {EMOJI_LIST.map(e => (
                  <button key={e} onClick={() => { setChatText(t => t + e); }}
                    style={{ background:'none', border:'none', fontSize:'20px', cursor:'pointer', padding:'2px', minWidth:'28px', minHeight:'28px' }}>
                    {e}
                  </button>
                ))}
                <button onClick={() => setShowEmoji(false)} aria-label="Close emoji picker"
                  style={{ background:'#334155', border:'none', borderRadius:'8px', padding:'4px 8px',
                    color:'#94a3b8', fontSize:'11px', cursor:'pointer', marginLeft:'auto' }}>✕ Close</button>
              </div>
            )}
            <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
              <button onClick={() => setShowEmoji(v => !v)} aria-label="Open emoji picker"
                style={{ background:'#1e293b', border:'none', borderRadius:'10px', padding:'8px',
                  fontSize:'18px', cursor:'pointer', flexShrink:0, minWidth:'38px', minHeight:'38px' }}>
                😊
              </button>
              {/* MISSING-O: Character counter (shows when under 50 chars remaining) */}
              {200 - chatText.length <= 50 && (
                <span style={{ color: 200 - chatText.length <= 20 ? '#ef4444' : '#64748b', fontSize:'10px', alignSelf:'center', flexShrink:0 }}>
                  {200 - chatText.length}
                </span>
              )}
              <input
                value={chatText}
                onChange={e => setChatText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Send a message…"
                maxLength={200}
                aria-label="Chat message"
                style={{ flex:1, background:'#1e293b', border:'1px solid #334155', borderRadius:'20px',
                  padding:'8px 14px', color:'#f1f5f9', fontSize:'13px', outline:'none' }}
              />
              {/* GAP-04: Slow-mode send button with countdown ring */}
              <button onClick={() => sendMessage()} disabled={!chatText.trim() || sending || chatCooldown}
                aria-label={chatCooldown ? `Slow mode: wait ${cooldownSecs}s` : 'Send message'}
                title={chatCooldown ? `Slow mode — ${cooldownSecs}s` : ''}
                style={{ background: (chatText.trim() && !sending && !chatCooldown) ? 'linear-gradient(135deg,#ef4444,#f59e0b)' : '#334155',
                  border:'none', borderRadius:'10px', padding:'8px 14px', color: chatCooldown ? '#64748b' : 'white', fontWeight:700,
                  fontSize:'13px', cursor: (chatText.trim() && !chatCooldown) ? 'pointer' : 'not-allowed', flexShrink:0,
                  minWidth:'60px', minHeight:'38px', position:'relative', overflow:'hidden' }}>
                {chatCooldown ? `${cooldownSecs}s` : sending ? '⏳' : 'Send'}
                {chatCooldown && (
                  <div style={{ position:'absolute', bottom:0, left:0, height:'2px', background:'#6366f1',
                    width:`${(cooldownSecs / 3) * 100}%`, transition:'width 1s linear' }} />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MISSING-H/I: Floating gift/follow notification */}
      {floatNotif && (
        <div style={{ position:'fixed', top:'70px', left:'50%', transform:'translateX(-50%)',
          background:'rgba(245,158,11,0.95)', borderRadius:'20px', padding:'8px 16px', zIndex:300,
          display:'flex', alignItems:'center', gap:'8px', animation:'slideDown 0.3s ease', pointerEvents:'none',
          maxWidth:'90vw', boxShadow:'0 4px 20px rgba(0,0,0,0.4)' }}>
          <span style={{ fontSize:'20px' }}>{floatNotif.icon}</span>
          <span style={{ color:'#000', fontWeight:700, fontSize:'13px' }}>{floatNotif.text}</span>
        </div>
      )}

      {/* MISSING-J: Floating emoji reactions */}
      <div style={{ position:'fixed', bottom:'200px', right:'14px', width:'40px', pointerEvents:'none', zIndex:250 }}>
        {floatEmojis.map(fe => (
          <div key={fe.id} style={{ position:'absolute', bottom:0, left:0, fontSize:'24px',
            animation:'floatUp 3.5s ease-out forwards' }}>
            {fe.emoji}
          </div>
        ))}
      </div>

      {/* MISSING-D: Gift picker bottom sheet */}
      {showGiftPicker && (
        <div style={{ position:'fixed', inset:0, zIndex:400 }}>
          <div onClick={() => setShowGiftPicker(false)} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.6)' }} />
          <div style={{ position:'absolute', bottom:0, left:0, right:0, background:'#0f172a', borderRadius:'20px 20px 0 0',
            padding:'16px', paddingBottom:'calc(16px + env(safe-area-inset-bottom,0px))' }}>
            <div style={{ color:'#f1f5f9', fontWeight:800, fontSize:'15px', marginBottom:'14px' }}>🎁 Send a Gift</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px', marginBottom:'14px' }}>
              {[
                { name:'Rose',    emoji:'🌹', amount:10,  color:'#ef4444' },
                { name:'Star',    emoji:'⭐', amount:50,  color:'#f59e0b' },
                { name:'Crown',   emoji:'👑', amount:100, color:'#8b5cf6' },
                { name:'Diamond', emoji:'💎', amount:500, color:'#06b6d4' },
                { name:'Party',   emoji:'🎉', amount:200, color:'#10b981' },
                { name:'Fire',    emoji:'🔥', amount:150, color:'#f97316' },
              ].map(g => (
                <button key={g.name} disabled={giftSending} onClick={async () => {
                  if (!auth.currentUser) { setShowGiftPicker(false); showToast('Sign in to send gifts'); return; }
                  setGiftSending(true);
                  try {
                    await addDoc(collection(db, 'streams', streamId, 'gifts'), {
                      userId:    auth.currentUser.uid,
                      userName:  auth.currentUser.displayName || 'Viewer',
                      name:      g.name, emoji: g.emoji, amount: g.amount,
                      createdAt: serverTimestamp(),
                    });
                    setShowGiftPicker(false);
                    showToast(`${g.emoji} Gift sent!`);
                    setFloatNotif({ icon: g.emoji, text: `You gifted ${g.name}!` });
                    setTimeout(() => setFloatNotif(null), 3000);
                  } catch { showToast('Gift failed'); }
                  finally { setGiftSending(false); }
                }}
                  style={{ background:'#1e293b', border:`1px solid ${g.color}30`, borderRadius:'12px', padding:'12px 4px',
                    cursor: giftSending ? 'wait' : 'pointer', textAlign:'center', opacity: giftSending ? 0.6 : 1 }}>
                  <div style={{ fontSize:'24px', marginBottom:'4px' }}>{g.emoji}</div>
                  <div style={{ color:'#f1f5f9', fontSize:'11px', fontWeight:700 }}>{g.name}</div>
                  <div style={{ color: g.color, fontSize:'10px', fontWeight:600 }}>{g.amount} pts</div>
                </button>
              ))}
            </div>
            <button onClick={() => setShowGiftPicker(false)}
              style={{ width:'100%', background:'#334155', border:'none', borderRadius:'12px', padding:'12px', color:'#94a3b8', fontWeight:700, cursor:'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* MISSING-P: Report stream modal */}
      {showReport && (
        <div style={{ position:'fixed', inset:0, zIndex:400, display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
          <div onClick={() => setShowReport(false)} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.7)' }} />
          <div style={{ position:'relative', background:'#0f172a', borderRadius:'20px', padding:'20px', maxWidth:'320px', width:'100%', border:'1px solid #334155' }}>
            <div style={{ color:'#f1f5f9', fontWeight:800, fontSize:'15px', marginBottom:'12px' }}>🚩 Report Stream</div>
            <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'14px' }}>
              {['Inappropriate content','Spam / fake stream','Harassment','Misleading title','Other'].map(r => (
                <button key={r} onClick={() => setReportReason(r)}
                  style={{ background: reportReason===r ? 'rgba(239,68,68,0.15)' : '#1e293b',
                    border: reportReason===r ? '1px solid #ef4444' : '1px solid #334155',
                    borderRadius:'10px', padding:'10px 12px', color: reportReason===r ? '#fca5a5' : '#f1f5f9',
                    fontSize:'13px', cursor:'pointer', textAlign:'left' }}>
                  {r}
                </button>
              ))}
            </div>
            <div style={{ display:'flex', gap:'10px' }}>
              <button onClick={() => setShowReport(false)} style={{ flex:1, background:'#334155', border:'none', borderRadius:'12px', padding:'12px', color:'#94a3b8', fontWeight:700, cursor:'pointer' }}>Cancel</button>
              <button disabled={!reportReason || reportSending} onClick={async () => {
                if (!reportReason) return;
                setReportSending(true);
                try {
                  await addDoc(collection(db, 'reports'), {
                    streamId, reason: reportReason,
                    reportedBy: auth.currentUser?.uid || 'anon',
                    streamTitle: stream?.title, createdAt: serverTimestamp(),
                  });
                  setShowReport(false); setReportReason('');
                  showToast('🚩 Report submitted — thank you!');
                } catch { showToast('Report failed'); }
                finally { setReportSending(false); }
              }}
                style={{ flex:1, background: reportReason && !reportSending ? '#ef4444' : '#334155', border:'none', borderRadius:'12px',
                  padding:'12px', color:'white', fontWeight:700, cursor: reportReason ? 'pointer' : 'not-allowed' }}>
                {reportSending ? '⏳' : '🚩 Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rec 6: Full disconnect state after 3 failed reconnects */}
      {reconnAttempts >= 3 && !buffering && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:350, display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center', padding:'24px', textAlign:'center' }}>
          <div style={{ fontSize:'56px', marginBottom:'12px' }}>😔</div>
          <div style={{ color:'#f1f5f9', fontWeight:800, fontSize:'18px', marginBottom:'8px' }}>Stream Disconnected</div>
          <div style={{ color:'#94a3b8', fontSize:'13px', marginBottom:'24px' }}>We couldn't reconnect after 3 attempts</div>
          <div style={{ display:'flex', flexDirection:'column', gap:'10px', width:'100%', maxWidth:'280px' }}>
            <button onClick={() => { setReconnAttempts(0); setBuffering(true); if (videoRef.current) { videoRef.current.load(); videoRef.current.play().catch(() => {}); } }}
              style={{ background:'linear-gradient(135deg,#ef4444,#f59e0b)', border:'none', borderRadius:'14px', padding:'14px', color:'white', fontWeight:700, cursor:'pointer' }}>
              🔄 Retry Now
            </button>
            <button onClick={() => navigate('/live')}
              style={{ background:'#1e293b', border:'none', borderRadius:'14px', padding:'14px', color:'#94a3b8', fontWeight:700, cursor:'pointer' }}>
              ← Back to Live
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity:0; transform: translateX(-50%) translateY(-12px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }
        @keyframes floatUp { 0% { opacity:1; transform:translateY(0) scale(1); } 80% { opacity:0.8; } 100% { opacity:0; transform:translateY(-120px) scale(1.4); } }
      `}</style>
    </div>
  );
}
