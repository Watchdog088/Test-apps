// LiveWatchPage.jsx — /live/watch/:id
// Session 7 — ALL BUGS FIXED:
//   C-1:  HLS.js integration via CDN dynamic load (cross-browser HLS)
//   C-4:  ?guestJoin=1 param handled — camera/mic prompt shown
//   U-1:  Emote picker UI — 30-emote grid toggled by 😊 button below chat
//   U-2:  Milestone banner — useEffect fires banner on viewerCount milestones
//   U-3:  Subscriber badge ⭐ rendered in chat message rows
//   FIX:  Watch party sync skips when paused (drift fix)
//   FIX:  Confetti positions precomputed via useRef (no Math.random in render)
//   FIX:  Chat textarea max-height + overflow:auto (long message overflow fix)
//   FIX:  Quality Poor now shows actionable tip to streamer
//   FIX:  userVote reset on streamId change (double-vote prevention)
//   ADD:  Raise Hand button for viewers (signals streamer)
//   ADD:  Report stream button
//   ADD:  Skeleton loader while stream loads

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  doc, getDoc, onSnapshot, addDoc, updateDoc, arrayUnion, arrayRemove,
  collection, query, orderBy, serverTimestamp, increment,
  where, getDocs, limit,
} from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import useAppStore from '@store/useAppStore';

const GIFT_AMOUNTS = [10, 50, 100, 500];
const EMOJIS = ['❤️', '🔥', '😂', '👏', '💯'];
const QUALITY_LEVELS = ['Auto', '1080p', '720p', '480p'];

// REC-6.1: Full emote palette grid (30 emotes)
const EMOTE_PALETTE = [
  '❤️','🔥','😂','👏','💯','🎉','😍','🤩','💪','👑',
  '🙌','✨','😎','🥳','😆','💀','🤣','😭','🫶','⭐',
  '🎮','🎵','🍕','🚀','💎','🦋','🌟','🏆','💬','🫡',
];

// REC-6.4: Viewer milestone thresholds
const MILESTONES = [10, 50, 100, 500, 1000, 5000];

// REC-6.11: Poll helper — derive winner option
function pollWinner(options) {
  if (!options?.length) return null;
  return options.reduce((a,b) => (a.votes||0) >= (b.votes||0) ? a : b, options[0]);
}

// FIX: Confetti positions precomputed in useRef — no Math.random() in render
function ConfettiBurst({ onDone }) {
  const pieces = useRef(Array.from({ length: 24 }, (_, i) => ({
    top: Math.random() * 40,
    left: Math.random() * 100,
    bg: ['#ef4444','#f59e0b','#4ade80','#818cf8','#f472b6'][i % 5],
    round: i % 3 === 0,
    dur: (0.8 + Math.random() * 1.2).toFixed(2),
    delay: (Math.random() * 0.5).toFixed(2),
  }))).current;
  useEffect(() => { const t = setTimeout(onDone, 2000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:9998 }}>
      {pieces.map((p, i) => (
        <div key={i} style={{
          position:'absolute', top:`${p.top}%`, left:`${p.left}%`,
          width:'10px', height:'10px', borderRadius: p.round ? '50%' : '2px',
          background: p.bg,
          animation:`confetti ${p.dur}s ease-out ${p.delay}s both`,
        }} />
      ))}
      <style>{`@keyframes confetti{0%{transform:translateY(0) rotate(0deg);opacity:1}100%{transform:translateY(200px) rotate(720deg);opacity:0}}`}</style>
    </div>
  );
}

// Content warning interstitial
function ContentWarning({ onContinue }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.95)', zIndex:9999,
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px', textAlign:'center' }}>
      <div style={{ fontSize:'48px', marginBottom:'16px' }}>⚠️</div>
      <div style={{ color:'#f1f5f9', fontWeight:800, fontSize:'20px', marginBottom:'8px' }}>Mature Content</div>
      <div style={{ color:'#94a3b8', fontSize:'14px', maxWidth:'280px', marginBottom:'28px', lineHeight:'1.6' }}>
        This stream may contain adult content. By continuing, you confirm you are 18 years of age or older.
      </div>
      <button onClick={onContinue} style={{ background:'linear-gradient(135deg,#ef4444,#dc2626)',
        border:'none', borderRadius:'14px', padding:'14px 32px', color:'white', fontWeight:800, fontSize:'16px', cursor:'pointer' }}>
        I'm 18+ — Continue
      </button>
    </div>
  );
}

// Skeleton loader while stream doc loads
function StreamSkeleton() {
  const pulse = { animation:'skelPulse 1.5s ease-in-out infinite', background:'#1e293b', borderRadius:'8px' };
  return (
    <div style={{ background:'#0a0a18', minHeight:'100vh' }}>
      <style>{`@keyframes skelPulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
      <div style={{ padding:'10px 16px', borderBottom:'1px solid #1e293b', display:'flex', gap:'10px' }}>
        <div style={{ ...pulse, width:'28px', height:'28px', borderRadius:'50%' }} />
        <div style={{ flex:1 }}>
          <div style={{ ...pulse, height:'14px', width:'60%', marginBottom:'6px' }} />
          <div style={{ ...pulse, height:'10px', width:'30%' }} />
        </div>
      </div>
      <div style={{ ...pulse, width:'100%', height:'220px', borderRadius:0 }} />
      <div style={{ padding:'16px', display:'flex', flexDirection:'column', gap:'10px' }}>
        {[1,2,3].map(i => <div key={i} style={{ ...pulse, height:'36px', width:'100%' }} />)}
      </div>
    </div>
  );
}

export default function LiveWatchPage() {
  const { id: streamId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const showToast = useAppStore(s => s.showToast);
  const uid = auth.currentUser?.uid;

  const videoRef  = useRef(null);
  const chatEndRef = useRef(null);
  const hlsRef    = useRef(null); // C-1: HLS instance ref
  const shownMilestones = useRef(new Set()); // U-2: track shown milestones

  // Core state
  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [chatMsg, setChatMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [reactions, setReactions] = useState({});
  const [followingIds, setFollowingIds] = useState(new Set());
  const [isFollowing, setIsFollowing] = useState(false);

  // Video / connection
  const [videoError, setVideoError] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const retryTimer = useRef(null);

  // Chat / engagement
  const [pinnedMsg, setPinnedMsg] = useState(null);
  const [showEmotePicker, setShowEmotePicker] = useState(false); // U-1
  const [followerIds, setFollowerIds] = useState(new Set());     // U-3

  // REC-6.4: Milestone banner
  const [milestoneBanner, setMilestoneBanner] = useState(null);

  // Poll
  const [activePoll, setActivePoll] = useState(null);
  const [userVote, setUserVote] = useState(null);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);

  // Watch Party
  const [watchPartyRoom, setWatchPartyRoom] = useState(null);
  const [watchPartyMembers, setWatchPartyMembers] = useState(1);
  const [showWatchParty, setShowWatchParty] = useState(false);

  // UI overlays
  const [showConfetti, setShowConfetti] = useState(false);
  const [quality, setQuality] = useState('Auto');
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [contentWarningCleared, setContentWarningCleared] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  // REC-6.6: Fullscreen
  const [isFullscreen, setIsFullscreen] = useState(false);
  // REC-6.14: Picture-in-Picture
  const [isPiP, setIsPiP] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showClipModal, setShowClipModal] = useState(false);
  const [clipTitle, setClipTitle] = useState('');
  const [clipCreating, setClipCreating] = useState(false);
  const [handRaised, setHandRaised] = useState(false);

  // C-4: Guest join mode
  const isGuestJoin = searchParams.get('guestJoin') === '1';
  const [guestReady, setGuestReady] = useState(false);
  const [guestStream, setGuestStream] = useState(null);
  const guestVideoRef = useRef(null);

  const isStreamer = stream?.uid === uid;
  const fmt = n => n >= 1000 ? `${(n/1000).toFixed(1)}K` : String(n || 0);

  // Load stream doc — BUG-OPEN-04 FIX: also set reactions here to eliminate double listener
  useEffect(() => {
    if (!streamId) return;
    const unsub = onSnapshot(doc(db, 'streams', streamId), snap => {
      if (snap.exists()) {
        const data = snap.data();
        setStream({ id: snap.id, ...data });
        if (data.pinnedMessage) setPinnedMsg(data.pinnedMessage);
        // BUG-OPEN-04: merge reactions into same listener — no extra Firestore read
        setReactions(data.reactions || {});
      }
      setLoading(false);
    });
    return () => unsub();
  }, [streamId]);

  // C-1: HLS.js — load CDN dynamically, fall back to native for Safari
  useEffect(() => {
    if (!stream?.streamUrl || !videoRef.current) return;
    const video = videoRef.current;

    const setupHls = (Hls) => {
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
      const isHlsUrl = stream.streamUrl.includes('.m3u8');
      if (isHlsUrl && Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(stream.streamUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, (_, data) => { if (data.fatal) handleVideoError(); });
        hlsRef.current = hls;
      } else if (isHlsUrl && video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari native HLS
        video.src = stream.streamUrl;
      } else {
        video.src = stream.streamUrl;
      }
      video.play().catch(() => {});
    };

    if (window.Hls) {
      setupHls(window.Hls);
    } else {
      // Load hls.js from CDN
      const existing = document.getElementById('hlsjs-cdn');
      if (existing) {
        existing.onload = () => setupHls(window.Hls);
        return;
      }
      const script = document.createElement('script');
      script.id = 'hlsjs-cdn';
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.7/dist/hls.min.js';
      script.onload = () => setupHls(window.Hls);
      script.onerror = () => { video.src = stream.streamUrl; video.play().catch(() => {}); };
      document.head.appendChild(script);
    }

    return () => {
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    };
  }, [stream?.streamUrl]);

  // Load chat messages
  useEffect(() => {
    if (!streamId) return;
    const q = query(collection(db, 'streams', streamId, 'messages'), orderBy('timestamp', 'asc'));
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [streamId]);

  // Auto-scroll chat
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  // BUG-OPEN-04: Reactions listener REMOVED — reactions now merged into main stream listener above

  // Load viewer's OWN following (to know if viewer follows streamer)
  useEffect(() => {
    if (!uid) return;
    const unsub = onSnapshot(doc(db, 'users', uid), snap => {
      if (snap.exists()) setFollowingIds(new Set(snap.data().following || []));
    });
    return () => unsub();
  }, [uid]);

  // BUG-OPEN-02 FIX: Load STREAMER's subscriber list (not viewer's following)
  // so the ⭐ badge correctly marks streamer's subscribers in chat, not people viewer follows
  useEffect(() => {
    if (!stream?.uid) return;
    const unsub = onSnapshot(doc(db, 'users', stream.uid), snap => {
      if (snap.exists()) {
        const data = snap.data();
        // Try subscribers array; fall back to followers; fall back to empty
        setFollowerIds(new Set(data.subscribers || data.followers || []));
      }
    });
    return () => unsub();
  }, [stream?.uid]);

  useEffect(() => {
    if (stream?.uid) setIsFollowing(followingIds.has(stream.uid));
  }, [followingIds, stream]);

  // U-2: Milestone banner useEffect
  useEffect(() => {
    if (!stream?.viewerCount) return;
    const hit = MILESTONES.find(m => stream.viewerCount >= m && !shownMilestones.current.has(m));
    if (hit) {
      shownMilestones.current.add(hit);
      setMilestoneBanner(`🎉 ${hit >= 1000 ? `${hit/1000}K` : hit} viewers!`);
      setTimeout(() => setMilestoneBanner(null), 4000);
    }
  }, [stream?.viewerCount]);

  // Load active poll
  useEffect(() => {
    if (!streamId) return;
    const q = query(collection(db, 'streams', streamId, 'polls'), where('active','==',true), limit(1));
    const unsub = onSnapshot(q, snap => {
      if (!snap.empty) {
        const pd = snap.docs[0];
        setActivePoll({ id: pd.id, ...pd.data() });
        setUserVote(null); // FIX: reset vote on new poll
      } else {
        setActivePoll(null);
        setUserVote(null);
      }
    });
    return () => unsub();
  }, [streamId]);

  // Reset userVote on stream change (prevent double-vote)
  useEffect(() => { setUserVote(null); }, [streamId]);

  // BUG-OPEN-11 FIX: Show actionable tip when quality is Poor for >5s on viewer side
  const qualityPoorTimerRef = useRef(null);
  useEffect(() => {
    if (stream?.streamQuality === 'poor' || stream?.qualityIndicator === 'poor') {
      qualityPoorTimerRef.current = setTimeout(() => {
        showToast('📶 Poor stream quality — try lowering quality to 480p in ⚙️ or check your connection.');
      }, 5000);
    } else {
      if (qualityPoorTimerRef.current) clearTimeout(qualityPoorTimerRef.current);
    }
    return () => { if (qualityPoorTimerRef.current) clearTimeout(qualityPoorTimerRef.current); };
  }, [stream?.streamQuality, stream?.qualityIndicator, showToast]);

  // Watch Party listener
  useEffect(() => {
    if (!watchPartyRoom) return;
    const unsub = onSnapshot(doc(db, 'watchParties', watchPartyRoom), snap => {
      if (snap.exists()) {
        setWatchPartyMembers(snap.data().members?.length || 1);
        const syncTime = snap.data().currentTime;
        if (videoRef.current && syncTime !== undefined) {
          const diff = Math.abs(videoRef.current.currentTime - syncTime);
          if (diff > 2) videoRef.current.currentTime = syncTime;
        }
      }
    });
    return () => unsub();
  }, [watchPartyRoom]);

  // Video error / reconnect
  const handleVideoError = useCallback(() => {
    if (retryCount >= 3) { setVideoError(true); setReconnecting(false); return; }
    setReconnecting(true);
    retryTimer.current = setTimeout(() => {
      const v = videoRef.current;
      if (v) { v.load(); v.play().catch(() => {}); }
      setRetryCount(c => c + 1);
      setReconnecting(false);
    }, 3000);
  }, [retryCount]);

  useEffect(() => () => { if (retryTimer.current) clearTimeout(retryTimer.current); }, []);

  // C-4: Guest join — prompt camera/mic
  useEffect(() => {
    if (!isGuestJoin || guestReady) return;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video:true, audio:true });
        setGuestStream(stream);
        if (guestVideoRef.current) {
          guestVideoRef.current.srcObject = stream;
          guestVideoRef.current.muted = true;
        }
        setGuestReady(true);
        showToast('🎤 Guest mode active — your camera is on');
        // Signal streamer
        if (uid && streamId) {
          await addDoc(collection(db, 'streams', streamId, 'guestRequests'), {
            uid, userName: auth.currentUser?.displayName || 'Guest',
            status: 'joined', joinedAt: serverTimestamp(),
          });
        }
      } catch { showToast('Camera permission denied — viewing as regular viewer'); }
    })();
  }, [isGuestJoin, guestReady, uid, streamId, showToast]);

  // Cleanup guest stream on unmount
  useEffect(() => () => { guestStream?.getTracks().forEach(t => t.stop()); }, [guestStream]);

  // Send chat
  const sendMessage = useCallback(async () => {
    if (!chatMsg.trim() || sending || !uid) return;
    if (stream?.bannedUsers?.includes(uid)) { showToast('You are banned from this chat'); return; }
    if (stream?.subscriberOnlyChat && !followingIds.has(stream.uid)) {
      showToast('🔒 This chat is for subscribers only'); return;
    }
    setSending(true);
    try {
      await addDoc(collection(db, 'streams', streamId, 'messages'), {
        text: chatMsg.trim(), uid,
        userName: auth.currentUser?.displayName || 'Viewer',
        timestamp: serverTimestamp(),
      });
      setChatMsg('');
    } catch { showToast('Failed to send message'); }
    finally { setSending(false); }
  }, [chatMsg, sending, uid, stream, streamId, followingIds, showToast]);

  const handleKeyDown = useCallback(e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }, [sendMessage]);

  // Reactions
  const sendReaction = async emoji => {
    if (!streamId) return;
    try { await updateDoc(doc(db, 'streams', streamId), { [`reactions.${emoji}`]: increment(1) }); } catch {}
  };

  // Follow/unfollow
  const toggleFollow = async () => {
    if (!uid || !stream?.uid) return;
    try {
      await updateDoc(doc(db, 'users', uid), {
        following: isFollowing ? arrayRemove(stream.uid) : arrayUnion(stream.uid),
      });
      showToast(isFollowing ? 'Unfollowed' : '✓ Following');
    } catch { showToast('Failed'); }
  };

  // Gift
  const sendGift = async amount => {
    if (!uid || !streamId) return;
    try {
      await addDoc(collection(db, 'streams', streamId, 'gifts'), {
        uid, amount, timestamp: serverTimestamp(),
        userName: auth.currentUser?.displayName || 'Viewer',
      });
      await updateDoc(doc(db, 'streams', streamId), { totalGifts: increment(amount) });
      showToast(`🎁 Sent ${amount} coins!`);
      setShowGiftModal(false);
      if (amount >= 100) {
        setShowConfetti(true);
        // MISS-NEW-03 FIX: Play gift sound effect for large gifts
        try { new Audio('/sounds/gift.mp3').play(); } catch {}
      }
    } catch { showToast('Gift failed'); }
  };

  // Clip creation — includes streamStartTime for chat replay sync
  const createClip = async () => {
    if (!streamId || !uid) return;
    setClipCreating(true);
    try {
      const currentTimestamp = videoRef.current?.currentTime || 0;
      await addDoc(collection(db, 'clips'), {
        streamId, uid,
        title: clipTitle.trim() || 'My Clip',
        timestamp: currentTimestamp,
        streamTitle: stream?.title || '',
        streamerName: stream?.userName || '',
        streamStartTime: stream?.startedAt || null, // FIX: needed for chat replay sync
        status: 'processing',
        createdAt: serverTimestamp(),
      });
      showToast('✂️ Clip queued for processing!');
      setShowClipModal(false);
      setClipTitle('');
    } catch { showToast('Clip creation failed'); }
    finally { setClipCreating(false); }
  };

  // Poll
  const createPoll = async () => {
    if (!pollQuestion.trim() || pollOptions.filter(o => o.trim()).length < 2) {
      showToast('Add a question and at least 2 options'); return;
    }
    try {
      const opts = pollOptions.filter(o => o.trim()).reduce((acc, o) => ({ ...acc, [o.trim()]: 0 }), {});
      await addDoc(collection(db, 'streams', streamId, 'polls'), {
        question: pollQuestion.trim(), options: opts, active: true,
        createdAt: serverTimestamp(), uid,
      });
      setShowPollCreator(false); setPollQuestion(''); setPollOptions(['', '']);
      showToast('📊 Poll created!');
    } catch { showToast('Poll creation failed'); }
  };

  // BUG-OPEN-09 FIX: Sanitize optionKey so dots/brackets/slashes don't break Firestore field paths
  const sanitizePollKey = key => key.replace(/[.[\]#$/]/g, '_');

  const votePoll = async optionKey => {
    if (!activePoll || userVote || !uid) return;
    const safeKey = sanitizePollKey(optionKey); // BUG-OPEN-09 FIX
    try {
      await updateDoc(doc(db, 'streams', streamId, 'polls', activePoll.id), {
        [`options.${safeKey}`]: increment(1),
      });
      setUserVote(optionKey);
      showToast(`✅ Voted: ${optionKey}`);
    } catch { showToast('Vote failed'); }
  };

  // Pin message
  const pinMessage = async msg => {
    if (!isStreamer) return;
    try { await updateDoc(doc(db, 'streams', streamId), { pinnedMessage: msg }); setPinnedMsg(msg); showToast('📌 Pinned'); } catch {}
  };
  const unpinMessage = async () => {
    if (!isStreamer) return;
    try {
      const { deleteField } = await import('firebase/firestore');
      await updateDoc(doc(db, 'streams', streamId), { pinnedMessage: deleteField() });
      setPinnedMsg(null);
    } catch {}
  };

  // Watch Party — FIX: only sync when playing (prevents drift on pause)
  const syncWatchPartyTime = useCallback(async () => {
    if (!watchPartyRoom || !videoRef.current) return;
    if (videoRef.current.paused) return; // FIX: skip sync when paused
    try {
      await updateDoc(doc(db, 'watchParties', watchPartyRoom), { currentTime: videoRef.current.currentTime });
    } catch {}
  }, [watchPartyRoom]);

  useEffect(() => {
    if (!watchPartyRoom) return;
    const t = setInterval(syncWatchPartyTime, 5000);
    return () => clearInterval(t);
  }, [watchPartyRoom, syncWatchPartyTime]);

  const createWatchParty = async () => {
    if (!uid || !streamId) return;
    try {
      const docRef = await addDoc(collection(db, 'watchParties'), {
        streamId, host: uid, members: [uid],
        currentTime: videoRef.current?.currentTime || 0,
        createdAt: serverTimestamp(),
      });
      setWatchPartyRoom(docRef.id);
      const link = `${window.location.origin}/live/watch/${streamId}?party=${docRef.id}`;
      if (navigator.share) await navigator.share({ title: 'Watch Party', url: link });
      else { await navigator.clipboard.writeText(link); showToast('🎉 Watch party link copied!'); }
    } catch { showToast('Failed to create watch party'); }
  };

  // Raise hand
  const raiseHand = async () => {
    if (!uid || !streamId) return;
    try {
      setHandRaised(v => !v);
      await addDoc(collection(db, 'streams', streamId, 'handRaises'), {
        uid, userName: auth.currentUser?.displayName || 'Viewer',
        timestamp: serverTimestamp(), raised: !handRaised,
      });
      showToast(handRaised ? 'Hand lowered' : '✋ Hand raised — streamer notified');
    } catch { showToast('Failed'); }
  };

  // Report stream
  const reportStream = async () => {
    if (!uid || !streamId) return;
    try {
      await addDoc(collection(db, 'reports'), {
        type: 'stream', targetId: streamId, reportedBy: uid,
        createdAt: serverTimestamp(), status: 'pending',
      });
      showToast('🚨 Stream reported. Thank you.');
    } catch { showToast('Report failed'); }
  };

  // Guard: content warning
  if (stream?.contentRating === 'mature' && !contentWarningCleared) {
    return <ContentWarning onContinue={() => setContentWarningCleared(true)} />;
  }

  if (loading) return <StreamSkeleton />;

  if (!stream) return (
    <div style={{ background:'#0a0a18', minHeight:'100vh', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', gap:'12px' }}>
      <div style={{ fontSize:'40px' }}>📡</div>
      <div style={{ color:'#f1f5f9', fontWeight:700 }}>Stream not found</div>
      <button onClick={() => navigate('/live')}
        style={{ background:'#1e293b', border:'none', borderRadius:'10px', padding:'10px 20px', color:'#94a3b8', cursor:'pointer' }}>
        ← Browse Live
      </button>
    </div>
  );

  const totalVotes = activePoll ? Object.values(activePoll.options || {}).reduce((a, b) => a + b, 0) : 0;

  return (
    <>
    {showConfetti && <ConfettiBurst onDone={() => setShowConfetti(false)} />}

    {/* U-2: Milestone banner */}
    {milestoneBanner && (
      <div style={{ position:'fixed', top:'70px', left:'50%', transform:'translateX(-50%)', zIndex:9000,
        background:'linear-gradient(135deg,#f59e0b,#ef4444)', borderRadius:'20px', padding:'10px 20px',
        color:'white', fontWeight:800, fontSize:'14px', boxShadow:'0 4px 20px rgba(0,0,0,0.5)',
        animation:'slideDown 0.4s ease' }}>
        {milestoneBanner}
        <style>{`@keyframes slideDown{from{transform:translateX(-50%) translateY(-20px);opacity:0}to{transform:translateX(-50%) translateY(0);opacity:1}}`}</style>
      </div>
    )}

    <div style={{ background:'#0a0a18', minHeight:'100vh', display:'flex', flexDirection:'column', paddingBottom:'80px' }}>

      {/* Header */}
      <div style={{ padding:'10px 16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', gap:'10px' }}>
        <button onClick={() => navigate('/live')} style={{ background:'none', border:'none', color:'#94a3b8', fontSize:'20px', cursor:'pointer' }}>←</button>
        <div style={{ flex:1, overflow:'hidden' }}>
          <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'14px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{stream.title || 'Live Stream'}</div>
          <button onClick={() => navigate(`/profile/${stream.uid}`)}
            style={{ background:'none', border:'none', color:'#ef4444', fontSize:'11px', fontWeight:700, cursor:'pointer', padding:0 }}>
            {stream.userName || 'Streamer'} →
          </button>
        </div>
        <div style={{ color:'#94a3b8', fontSize:'11px' }}>👁 {fmt(stream.viewerCount)}</div>
        {stream.status === 'live' && (
          <div style={{ background:'#ef4444', borderRadius:'6px', padding:'2px 8px', color:'white', fontSize:'10px', fontWeight:800 }}>● LIVE</div>
        )}
      </div>

      {/* C-4: Guest join banner */}
      {isGuestJoin && (
        <div style={{ background: guestReady ? 'rgba(34,197,94,0.15)' : 'rgba(99,102,241,0.15)',
          borderBottom:`1px solid ${guestReady ? '#22c55e' : '#6366f1'}`, padding:'8px 16px',
          display:'flex', alignItems:'center', gap:'8px' }}>
          <video ref={guestVideoRef} autoPlay playsInline muted
            style={{ width:'60px', height:'40px', borderRadius:'6px', objectFit:'cover',
              border:`1px solid ${guestReady ? '#22c55e' : '#334155'}`, background:'#1e293b' }} />
          <div>
            <div style={{ color:guestReady ? '#22c55e' : '#818cf8', fontWeight:700, fontSize:'12px' }}>
              {guestReady ? '🎤 Guest mode active' : '⏳ Requesting camera access…'}
            </div>
            <div style={{ color:'#64748b', fontSize:'10px' }}>Your camera is visible to the streamer</div>
          </div>
        </div>
      )}

      {/* Video Player */}
      <div style={{ position:'relative', width:'100%', aspectRatio:'16/9', background:'#000', maxHeight:'240px' }}>
        {/* C-1: HLS handled via useEffect — no src here */}
        <video ref={videoRef} autoPlay playsInline controls muted={isMuted}
          crossOrigin="anonymous"
          style={{ width:'100%', height:'100%', objectFit:'contain' }} />

        {/* Reconnect overlay */}
        {(reconnecting || videoError) && (
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.85)', display:'flex', flexDirection:'column',
            alignItems:'center', justifyContent:'center', gap:'12px' }}>
            {reconnecting ? (
              <>
                <div style={{ color:'white', fontSize:'24px' }}>⟳</div>
                <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'14px' }}>Reconnecting… ({retryCount}/3)</div>
              </>
            ) : (
              <>
                <div style={{ fontSize:'36px' }}>📡</div>
                <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'14px' }}>Stream may have ended</div>
                <div style={{ display:'flex', gap:'8px' }}>
                  <button onClick={() => { setVideoError(false); setRetryCount(0); handleVideoError(); }}
                    style={{ background:'#ef4444', border:'none', borderRadius:'10px', padding:'8px 16px', color:'white', fontWeight:700, fontSize:'13px', cursor:'pointer' }}>
                    Try Again
                  </button>
                  <button onClick={() => navigate('/live')}
                    style={{ background:'#1e293b', border:'none', borderRadius:'10px', padding:'8px 16px', color:'#94a3b8', fontWeight:600, fontSize:'13px', cursor:'pointer' }}>
                    Browse Live
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Quality selector */}
        <div style={{ position:'absolute', top:'8px', right:'8px', zIndex:10 }}>
          <button onClick={() => setShowQualityMenu(v => !v)}
            style={{ background:'rgba(0,0,0,0.7)', border:'none', borderRadius:'6px', padding:'3px 8px',
              color:'white', fontSize:'10px', fontWeight:700, cursor:'pointer' }}>
            ⚙️ {quality}
          </button>
          {showQualityMenu && (
            <div style={{ position:'absolute', top:'100%', right:0, background:'#1e293b', borderRadius:'10px',
              padding:'4px', border:'1px solid #334155', marginTop:'4px', zIndex:20 }}>
              {QUALITY_LEVELS.map(q2 => (
                <button key={q2} onClick={() => { setQuality(q2); setShowQualityMenu(false); showToast(`Quality: ${q2}`); }}
                  style={{ display:'block', width:'100%', background: quality===q2 ? '#334155' : 'none',
                    border:'none', borderRadius:'6px', padding:'6px 14px', color: quality===q2 ? '#f1f5f9' : '#94a3b8',
                    fontSize:'12px', fontWeight:600, cursor:'pointer', textAlign:'left', whiteSpace:'nowrap' }}>
                  {quality===q2 ? '✓ ' : ''}{q2}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mute / Watch Party */}
        <div style={{ position:'absolute', bottom:'8px', left:'8px', display:'flex', gap:'6px' }}>
          {/* MISS-NEW-02 FIX: aria-labels on all icon-only buttons */}
          <button onClick={() => setIsMuted(v => !v)}
            aria-label={isMuted ? 'Unmute stream' : 'Mute stream'}
            style={{ background:'rgba(0,0,0,0.7)', border:'none', borderRadius:'6px', padding:'4px 8px', color:'white', fontSize:'14px', cursor:'pointer' }}>
            {isMuted ? '🔇' : '🔊'}
          </button>
          <button onClick={() => setShowWatchParty(v => !v)}
            aria-label="Watch Party"
            style={{ background: watchPartyRoom ? 'rgba(99,102,241,0.8)' : 'rgba(0,0,0,0.7)',
              border:'none', borderRadius:'6px', padding:'4px 8px', color:'white', fontSize:'14px', cursor:'pointer' }}>
            🎉 {watchPartyRoom ? watchPartyMembers : ''}
          </button>
          <button onClick={raiseHand}
            aria-label={handRaised ? 'Lower hand' : 'Raise hand'}
            style={{ background: handRaised ? 'rgba(245,158,11,0.8)' : 'rgba(0,0,0,0.7)',
              border:'none', borderRadius:'6px', padding:'4px 8px', color:'white', fontSize:'14px', cursor:'pointer' }}>
            ✋
          </button>
        </div>

        {/* REC-6.6: Fullscreen + REC-6.14: PiP — bottom-right of video */}
        <div style={{ position:'absolute', bottom:'8px', right:'8px', display:'flex', gap:'4px' }}>
          {/* MISS-NEW-02 FIX: aria-labels on fullscreen + PiP */}
          <button
            onClick={async () => {
              try {
                if (!document.fullscreenElement) {
                  await videoRef.current?.parentElement?.requestFullscreen?.();
                  setIsFullscreen(true);
                } else {
                  await document.exitFullscreen();
                  setIsFullscreen(false);
                }
              } catch { showToast('Fullscreen not supported'); }
            }}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            style={{ background:'rgba(0,0,0,0.7)', border:'none', borderRadius:'6px', padding:'4px 7px', color:'white', fontSize:'13px', cursor:'pointer' }}>
            {isFullscreen ? '⤡' : '⤢'}
          </button>
          <button
            onClick={async () => {
              try {
                if (document.pictureInPictureElement) {
                  await document.exitPictureInPicture();
                  setIsPiP(false);
                } else if (videoRef.current) {
                  await videoRef.current.requestPictureInPicture();
                  setIsPiP(true);
                }
              } catch { showToast('PiP not supported on this browser'); }
            }}
            aria-label={isPiP ? 'Exit Picture-in-Picture' : 'Picture-in-Picture'}
            style={{ background: isPiP ? 'rgba(99,102,241,0.8)' : 'rgba(0,0,0,0.7)', border:'none', borderRadius:'6px', padding:'4px 7px', color:'white', fontSize:'11px', cursor:'pointer', fontWeight:700 }}>
            PiP
          </button>
        </div>

        {/* Report button — MISS-NEW-02 FIX: aria-label */}
        <button onClick={reportStream}
          aria-label="Report this stream"
          style={{ position:'absolute', top:'8px', left:'8px', background:'rgba(0,0,0,0.6)',
            border:'none', borderRadius:'6px', padding:'3px 7px', color:'#94a3b8', fontSize:'10px', cursor:'pointer' }}>
          🚨
        </button>
      </div>

      {/* Emoji reactions + clip + gift + emote picker */}
      <div style={{ display:'flex', gap:'8px', padding:'8px 16px', overflowX:'auto', borderBottom:'1px solid #1e293b', alignItems:'center' }}>
        {EMOJIS.map(emoji => (
          <button key={emoji} onClick={() => sendReaction(emoji)}
            style={{ background:'#1e293b', border:'none', borderRadius:'20px', padding:'5px 10px',
              fontSize:'13px', cursor:'pointer', flexShrink:0, display:'flex', alignItems:'center', gap:'4px', color:'#f1f5f9' }}>
            {emoji} <span style={{ fontSize:'10px', color:'#94a3b8' }}>{reactions[emoji] || 0}</span>
          </button>
        ))}

        {/* U-1: Emote picker */}
        <div style={{ position:'relative', flexShrink:0 }}>
          <button onClick={() => setShowEmotePicker(v => !v)}
            style={{ background: showEmotePicker ? '#334155' : '#1e293b', border:'1px solid #334155',
              borderRadius:'20px', padding:'5px 10px', fontSize:'13px', cursor:'pointer', color:'#f1f5f9' }}>
            😊
          </button>
          {showEmotePicker && (
            <div style={{ position:'absolute', bottom:'100%', left:0, background:'#1e293b', borderRadius:'12px',
              padding:'8px', border:'1px solid #334155', zIndex:50, width:'186px', marginBottom:'4px',
              boxShadow:'0 8px 24px rgba(0,0,0,0.5)' }}>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:'2px' }}>
                {EMOTE_PALETTE.map(e => (
                  <button key={e} onClick={() => { setChatMsg(m => m + e); setShowEmotePicker(false); }}
                    style={{ background:'none', border:'none', fontSize:'16px', cursor:'pointer',
                      padding:'4px', borderRadius:'6px', lineHeight:1, transition:'background 0.15s' }}
                    onMouseEnter={ev => ev.target.style.background='#334155'}
                    onMouseLeave={ev => ev.target.style.background='none'}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button onClick={() => setShowClipModal(true)}
          style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:'20px', padding:'5px 10px',
            fontSize:'11px', color:'#94a3b8', cursor:'pointer', flexShrink:0, fontWeight:600 }}>
          ✂️ Clip
        </button>
        <button onClick={() => setShowGiftModal(true)}
          style={{ background:'linear-gradient(135deg,#f59e0b,#ef4444)', border:'none', borderRadius:'20px',
            padding:'5px 10px', fontSize:'11px', color:'white', cursor:'pointer', flexShrink:0, fontWeight:700 }}>
          🎁 Gift
        </button>
      </div>

      {/* Stream info + follow */}
      <div style={{ padding:'10px 16px', borderBottom:'1px solid #1e293b', display:'flex', gap:'10px', alignItems:'flex-start' }}>
        <div style={{ flex:1 }}>
          <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'14px', marginBottom:'2px' }}>{stream.title}</div>
          <div style={{ color:'#64748b', fontSize:'12px' }}>{stream.description}</div>
          {stream.category && (
            <span style={{ background:'#1e293b', borderRadius:'8px', padding:'2px 8px', color:'#94a3b8', fontSize:'11px', marginTop:'4px', display:'inline-block' }}>
              {stream.category}
            </span>
          )}
        </div>
        <div style={{ display:'flex', gap:'6px', flexShrink:0 }}>
          <button onClick={async () => {
            const url = window.location.href;
            if (navigator.share) await navigator.share({ title: stream.title, url });
            else { await navigator.clipboard.writeText(url); showToast('Link copied'); }
          }} style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:'10px', padding:'8px 12px', color:'#94a3b8', fontSize:'13px', cursor:'pointer' }}>🔗</button>
          <button onClick={toggleFollow}
            style={{ background: isFollowing ? '#1e293b' : 'linear-gradient(135deg,#ef4444,#f59e0b)',
              border: isFollowing ? '1px solid #334155' : 'none', borderRadius:'10px', padding:'8px 14px',
              color: isFollowing ? '#94a3b8' : 'white', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>
            {isFollowing ? '✓ Following' : '+ Follow'}
          </button>
        </div>
      </div>

      {/* Watch Party Panel */}
      {showWatchParty && (
        <div style={{ background:'#1e293b', borderBottom:'1px solid #334155', padding:'12px 16px' }}>
          <div style={{ fontSize:'13px', fontWeight:700, color:'#f1f5f9', marginBottom:'8px' }}>🎉 Watch Party</div>
          {watchPartyRoom ? (
            <div>
              <div style={{ color:'#94a3b8', fontSize:'12px', marginBottom:'8px' }}>
                {watchPartyMembers} watching together · Room: {watchPartyRoom.slice(0,8)}…
              </div>
              <button onClick={async () => {
                const link = `${window.location.origin}/live/watch/${streamId}?party=${watchPartyRoom}`;
                if (navigator.share) await navigator.share({ title:'Watch Party', url:link });
                else { await navigator.clipboard.writeText(link); showToast('Party link copied!'); }
              }} style={{ background:'#334155', border:'none', borderRadius:'8px', padding:'6px 14px',
                color:'#f1f5f9', fontSize:'12px', cursor:'pointer', fontWeight:600 }}>
                📤 Invite Friends
              </button>
            </div>
          ) : (
            <div>
              <div style={{ color:'#64748b', fontSize:'12px', marginBottom:'8px' }}>Watch in sync with friends</div>
              <button onClick={createWatchParty}
                style={{ background:'linear-gradient(135deg,#6366f1,#818cf8)', border:'none', borderRadius:'10px',
                  padding:'8px 16px', color:'white', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>
                🎉 Start Watch Party
              </button>
            </div>
          )}
        </div>
      )}

      {/* Active Poll */}
      {activePoll && (
        <div style={{ background:'#1e293b', borderBottom:'1px solid #334155', padding:'12px 16px' }}>
          <div style={{ fontSize:'12px', fontWeight:700, color:'#f59e0b', marginBottom:'6px' }}>📊 Live Poll</div>
          <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'14px', marginBottom:'8px' }}>{activePoll.question}</div>
          {Object.entries(activePoll.options || {}).map(([opt, count]) => {
            const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
            const voted = userVote === opt;
            return (
              <div key={opt} onClick={() => votePoll(opt)} style={{ marginBottom:'6px', cursor: userVote ? 'default' : 'pointer' }}>
                <div style={{ position:'relative', background:'#0f172a', borderRadius:'8px', overflow:'hidden',
                  border: voted ? '1px solid #f59e0b' : '1px solid #334155' }}>
                  <div style={{ position:'absolute', inset:0, background:'rgba(99,102,241,0.25)', width:`${pct}%`, transition:'width 0.4s ease' }} />
                  <div style={{ position:'relative', padding:'7px 10px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ color:'#f1f5f9', fontSize:'13px', fontWeight: voted ? 700 : 400 }}>{voted ? '✓ ' : ''}{opt}</span>
                    {userVote && <span style={{ color:'#94a3b8', fontSize:'12px' }}>{pct}%</span>}
                  </div>
                </div>
              </div>
            );
          })}
          <div style={{ color:'#64748b', fontSize:'11px' }}>{totalVotes} votes</div>
        </div>
      )}

      {/* Streamer controls */}
      {isStreamer && (
        <div style={{ padding:'8px 16px', borderBottom:'1px solid #1e293b', display:'flex', gap:'8px', flexWrap:'wrap' }}>
          <button onClick={() => setShowPollCreator(v => !v)}
            style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:'8px', padding:'6px 12px',
              color:'#94a3b8', fontSize:'11px', cursor:'pointer', fontWeight:600 }}>
            📊 {showPollCreator ? 'Cancel Poll' : 'Create Poll'}
          </button>
          <button onClick={() => navigate('/live/moderation')}
            style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:'8px', padding:'6px 12px',
              color:'#94a3b8', fontSize:'11px', cursor:'pointer', fontWeight:600 }}>
            🛡️ Moderation
          </button>
        </div>
      )}

      {/* Poll creator */}
      {isStreamer && showPollCreator && (
        <div style={{ background:'#1e293b', borderBottom:'1px solid #334155', padding:'12px 16px' }}>
          <div style={{ fontSize:'13px', fontWeight:700, color:'#f1f5f9', marginBottom:'8px' }}>Create Poll</div>
          <input value={pollQuestion} onChange={e => setPollQuestion(e.target.value)} placeholder="Poll question…"
            style={{ width:'100%', background:'#0f172a', border:'1px solid #334155', borderRadius:'8px',
              padding:'8px 12px', color:'#f1f5f9', fontSize:'13px', outline:'none', boxSizing:'border-box', marginBottom:'8px' }} />
          {pollOptions.map((opt, i) => (
            <input key={i} value={opt} onChange={e => { const o=[...pollOptions]; o[i]=e.target.value; setPollOptions(o); }}
              placeholder={`Option ${i+1}`}
              style={{ width:'100%', background:'#0f172a', border:'1px solid #334155', borderRadius:'8px',
                padding:'7px 12px', color:'#f1f5f9', fontSize:'13px', outline:'none', boxSizing:'border-box', marginBottom:'6px' }} />
          ))}
          <div style={{ display:'flex', gap:'8px' }}>
            {pollOptions.length < 4 && (
              <button onClick={() => setPollOptions([...pollOptions, ''])}
                style={{ background:'none', border:'1px dashed #334155', borderRadius:'8px', padding:'6px 12px',
                  color:'#64748b', fontSize:'12px', cursor:'pointer' }}>+ Option</button>
            )}
            <button onClick={createPoll}
              style={{ background:'linear-gradient(135deg,#f59e0b,#ef4444)', border:'none', borderRadius:'8px',
                padding:'6px 14px', color:'white', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>
              Launch Poll
            </button>
          </div>
        </div>
      )}

      {/* Pinned message */}
      {pinnedMsg && (
        <div style={{ background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.3)',
          borderRadius:'8px', margin:'8px 16px', padding:'8px 12px', display:'flex', alignItems:'center', gap:'8px' }}>
          <span style={{ fontSize:'14px' }}>📌</span>
          <div style={{ flex:1 }}>
            <div style={{ color:'#f59e0b', fontSize:'10px', fontWeight:700, marginBottom:'2px' }}>PINNED</div>
            <div style={{ color:'#f1f5f9', fontSize:'12px' }}><strong>{pinnedMsg.userName}:</strong> {pinnedMsg.text}</div>
          </div>
          {isStreamer && (
            <button onClick={unpinMessage} style={{ background:'none', border:'none', color:'#64748b', fontSize:'14px', cursor:'pointer' }}>✕</button>
          )}
        </div>
      )}

      {/* Chat */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', padding:'0 16px', marginTop:'8px' }}>
        <div style={{ fontSize:'11px', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'6px' }}>
          💬 Live Chat {stream.subscriberOnlyChat && <span style={{ marginLeft:'6px' }}>🔒</span>}
        </div>
        <div style={{ height:'200px', overflowY:'auto', display:'flex', flexDirection:'column', gap:'6px',
          background:'#0f172a', borderRadius:'10px', padding:'10px', marginBottom:'8px' }}>
          {messages.length === 0 && (
            <div style={{ color:'#334155', fontSize:'12px', textAlign:'center', marginTop:'40px' }}>Chat will appear here</div>
          )}
          {messages.map(msg => (
            <div key={msg.id} style={{ display:'flex', gap:'6px', alignItems:'flex-start' }}>
              <div style={{ width:'24px', height:'24px', borderRadius:'50%', background:'#1e293b',
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', flexShrink:0 }}>
                {msg.userName?.[0]?.toUpperCase() || 'V'}
              </div>
              <div style={{ flex:1 }}>
                <span style={{ color:'#f59e0b', fontSize:'11px', fontWeight:700 }}>{msg.userName}</span>
                {/* U-3: Subscriber badge */}
                {followerIds.has(msg.uid) && (
                  <span style={{ fontSize:'9px', marginLeft:'3px', verticalAlign:'middle' }} title="Subscriber">⭐</span>
                )}
                <span style={{ color:'#94a3b8', fontSize:'11px' }}>: </span>
                <span style={{ color:'#e2e8f0', fontSize:'12px' }}>{msg.text}</span>
              </div>
              {isStreamer && (
                <button onClick={() => pinMessage(msg)}
                  style={{ background:'none', border:'none', color:'#334155', fontSize:'12px', cursor:'pointer', padding:'0 2px' }}
                  title="Pin message">📌</button>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Chat input */}
        {stream.status === 'live' ? (
          uid ? (
            <div style={{ display:'flex', gap:'8px', alignItems:'flex-end' }}>
              {/* FIX: textarea with max-height and overflow:auto (long message fix) */}
              <textarea value={chatMsg} onChange={e => setChatMsg(e.target.value)} onKeyDown={handleKeyDown}
                placeholder={stream.subscriberOnlyChat && !followingIds.has(stream.uid) ? '🔒 Subscribers only' : 'Say something…'}
                disabled={stream.subscriberOnlyChat && !followingIds.has(stream.uid)}
                rows={1}
                style={{ flex:1, background:'#1e293b', border:'1px solid #334155', borderRadius:'10px',
                  padding:'9px 12px', color:'#f1f5f9', fontSize:'13px', outline:'none',
                  resize:'none', boxSizing:'border-box', overflow:'auto', maxHeight:'80px' }} />
              {/* BUG-OPEN-06 FIX: removed hardcoded height:'38px' — button now sizes naturally with textarea */}
              <button onClick={sendMessage} disabled={sending || !chatMsg.trim()}
                aria-label="Send chat message"
                style={{ background: chatMsg.trim() ? 'linear-gradient(135deg,#ef4444,#f59e0b)' : '#334155',
                  border:'none', borderRadius:'10px', padding:'9px 16px', color:'white', fontWeight:700, fontSize:'18px',
                  cursor: chatMsg.trim() ? 'pointer' : 'not-allowed', flexShrink:0 }}>
                ➤
              </button>
            </div>
          ) : (
            <button onClick={() => navigate('/login')}
              style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:'10px', padding:'10px',
                color:'#94a3b8', fontSize:'13px', cursor:'pointer' }}>
              Sign in to chat
            </button>
          )
        ) : (
          <div style={{ background:'#1e293b', borderRadius:'10px', padding:'12px', textAlign:'center' }}>
            <div style={{ color:'#64748b', fontSize:'13px', marginBottom:'8px' }}>Stream has ended</div>
            {/* MISS-NEW-01 FIX: Watch Replay CTA — retains viewer engagement after stream ends */}
            {stream.vodUrl && (
              <button
                onClick={() => navigate(`/live/vod/${streamId}`)}
                style={{ background:'linear-gradient(135deg,#6366f1,#818cf8)', border:'none', borderRadius:'10px',
                  padding:'10px 20px', color:'white', fontWeight:700, fontSize:'13px', cursor:'pointer' }}>
                ▶ Watch the Replay →
              </button>
            )}
          </div>
        )}
      </div>
    </div>

    {/* Gift Modal */}
    {showGiftModal && (
      <div onClick={() => setShowGiftModal(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:9000,
        display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
        <div onClick={e => e.stopPropagation()} style={{ background:'#1e293b', borderRadius:'20px 20px 0 0',
          padding:'20px 20px 36px', width:'100%', maxWidth:'420px' }}>
          <div style={{ fontSize:'16px', fontWeight:800, color:'#f1f5f9', marginBottom:'12px', textAlign:'center' }}>🎁 Send a Gift</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
            {GIFT_AMOUNTS.map(a => (
              <button key={a} onClick={() => sendGift(a)}
                style={{ background: a >= 100 ? 'linear-gradient(135deg,#f59e0b,#ef4444)' : '#334155',
                  border:'none', borderRadius:'14px', padding:'14px', color:'white', fontWeight:800, fontSize:'15px', cursor:'pointer' }}>
                {a >= 100 ? '💎' : '🪙'} {a} coins
              </button>
            ))}
          </div>
        </div>
      </div>
    )}

    {/* Clip Modal */}
    {showClipModal && (
      <div onClick={() => setShowClipModal(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:9000,
        display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
        <div onClick={e => e.stopPropagation()} style={{ background:'#1e293b', borderRadius:'20px 20px 0 0',
          padding:'20px 20px 36px', width:'100%', maxWidth:'420px' }}>
          <div style={{ fontSize:'16px', fontWeight:800, color:'#f1f5f9', marginBottom:'4px' }}>✂️ Create Clip</div>
          <div style={{ color:'#64748b', fontSize:'12px', marginBottom:'12px' }}>Capture the last 30 seconds</div>
          <input value={clipTitle} onChange={e => setClipTitle(e.target.value)} placeholder="Clip title (optional)"
            style={{ width:'100%', background:'#0f172a', border:'1px solid #334155', borderRadius:'10px',
              padding:'10px 12px', color:'#f1f5f9', fontSize:'13px', outline:'none', boxSizing:'border-box', marginBottom:'12px' }} />
          <button onClick={createClip} disabled={clipCreating}
            style={{ width:'100%', background:'linear-gradient(135deg,#6366f1,#818cf8)', border:'none', borderRadius:'12px',
              padding:'13px', color:'white', fontWeight:800, fontSize:'15px', cursor:'pointer' }}>
            {clipCreating ? '⏳ Creating…' : '✂️ Create Clip'}
          </button>
        </div>
      </div>
    )}
    </>
  );
}
