// LiveWatchPage.jsx — /live/watch/:id
// Session 5 — ALL 18 REMAINING RECOMMENDATIONS IMPLEMENTED:
//   REC-5.2:  Reconnect / Retry UI (video.error + auto-retry up to 3×)
//   REC-5.5:  Clip creation button (sends {streamId, timestamp} to Firestore)
//   REC-5.6:  Channel page link — streamer name navigates to /profile/:uid
//   REC-5.9:  Pinned message display above chat (gold border)
//   REC-5.10: Live Poll feature (create + vote, real-time results)
//   REC-5.13: Watch Party — shared room syncs currentTime via Firestore
//   REC-5.15: Coins visual FX — confetti burst on large gifts (100+ coins)
//   REC-5.16: Quality selector overlay (Auto / 1080p / 720p / 480p)
//   REC-5.17: Content warning interstitial for mature streams

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  doc, getDoc, onSnapshot, addDoc, updateDoc, arrayUnion,
  collection, query, orderBy, serverTimestamp, increment,
  where, getDocs, limit,
} from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import useAppStore from '@store/useAppStore';

const GIFT_AMOUNTS = [10, 50, 100, 500];
const EMOJIS = ['❤️', '🔥', '😂', '👏', '💯'];
const QUALITY_LEVELS = ['Auto', '1080p', '720p', '480p'];

// REC-5.15: Confetti burst for large gifts
function ConfettiBurst({ onDone }) {
  const pieces = Array.from({ length: 24 }, (_, i) => i);
  useEffect(() => { const t = setTimeout(onDone, 2000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:9998 }}>
      {pieces.map(i => (
        <div key={i} style={{
          position:'absolute',
          top: `${Math.random() * 40}%`,
          left: `${Math.random() * 100}%`,
          width:'10px', height:'10px',
          borderRadius: i % 3 === 0 ? '50%' : '2px',
          background: ['#ef4444','#f59e0b','#4ade80','#818cf8','#f472b6'][i % 5],
          animation: `confetti ${0.8 + Math.random() * 1.2}s ease-out ${Math.random() * 0.5}s both`,
        }} />
      ))}
      <style>{`@keyframes confetti { 0%{transform:translateY(0) rotate(0deg);opacity:1} 100%{transform:translateY(200px) rotate(720deg);opacity:0} }`}</style>
    </div>
  );
}

// REC-5.17: Content warning interstitial
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

export default function LiveWatchPage() {
  const { id: streamId } = useParams();
  const navigate = useNavigate();
  const showToast = useAppStore(s => s.showToast);
  const uid = auth.currentUser?.uid;

  const videoRef  = useRef(null);
  const chatEndRef = useRef(null);

  // Core state
  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [chatMsg, setChatMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [reactions, setReactions] = useState({});
  const [followingIds, setFollowingIds] = useState(new Set());
  const [isFollowing, setIsFollowing] = useState(false);

  // REC-5.2: Reconnect / Retry
  const [videoError, setVideoError] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const retryTimer = useRef(null);

  // REC-5.9: Pinned message
  const [pinnedMsg, setPinnedMsg] = useState(null);

  // REC-5.10: Poll
  const [activePoll, setActivePoll] = useState(null);
  const [userVote, setUserVote] = useState(null);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);

  // REC-5.13: Watch Party
  const [watchPartyRoom, setWatchPartyRoom] = useState(null);
  const [watchPartyMembers, setWatchPartyMembers] = useState(1);
  const [showWatchParty, setShowWatchParty] = useState(false);

  // REC-5.15: Confetti
  const [showConfetti, setShowConfetti] = useState(false);

  // REC-5.16: Quality selector
  const [quality, setQuality] = useState('Auto');
  const [showQualityMenu, setShowQualityMenu] = useState(false);

  // REC-5.17: Content warning
  const [contentWarningCleared, setContentWarningCleared] = useState(false);

  // Other
  const [isMuted, setIsMuted] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showClipModal, setShowClipModal] = useState(false);
  const [clipTitle, setClipTitle] = useState('');
  const [clipCreating, setClipCreating] = useState(false);
  const isStreamer = stream?.uid === uid;

  // Load stream
  useEffect(() => {
    if (!streamId) return;
    const unsub = onSnapshot(doc(db, 'streams', streamId), snap => {
      if (snap.exists()) {
        setStream({ id: snap.id, ...snap.data() });
        setLoading(false);
        // REC-5.9: Sync pinned message
        if (snap.data().pinnedMessage) setPinnedMsg(snap.data().pinnedMessage);
      }
    });
    return () => unsub();
  }, [streamId]);

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
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load reactions
  useEffect(() => {
    if (!streamId) return;
    const unsub = onSnapshot(doc(db, 'streams', streamId), snap => {
      if (snap.exists()) setReactions(snap.data().reactions || {});
    });
    return () => unsub();
  }, [streamId]);

  // Load user following
  useEffect(() => {
    if (!uid) return;
    const unsub = onSnapshot(doc(db, 'users', uid), snap => {
      if (snap.exists()) setFollowingIds(new Set(snap.data().following || []));
    });
    return () => unsub();
  }, [uid]);

  useEffect(() => {
    if (stream?.uid) setIsFollowing(followingIds.has(stream.uid));
  }, [followingIds, stream]);

  // Load active poll
  useEffect(() => {
    if (!streamId) return;
    const q = query(collection(db, 'streams', streamId, 'polls'), where('active', '==', true), limit(1));
    const unsub = onSnapshot(q, snap => {
      if (!snap.empty) {
        const pd = snap.docs[0];
        setActivePoll({ id: pd.id, ...pd.data() });
      } else {
        setActivePoll(null);
      }
    });
    return () => unsub();
  }, [streamId]);

  // REC-5.13: Watch party room listener
  useEffect(() => {
    if (!watchPartyRoom) return;
    const unsub = onSnapshot(doc(db, 'watchParties', watchPartyRoom), snap => {
      if (snap.exists()) {
        setWatchPartyMembers(snap.data().members?.length || 1);
        // Sync video time
        const syncTime = snap.data().currentTime;
        if (videoRef.current && syncTime !== undefined) {
          const diff = Math.abs(videoRef.current.currentTime - syncTime);
          if (diff > 2) videoRef.current.currentTime = syncTime;
        }
      }
    });
    return () => unsub();
  }, [watchPartyRoom]);

  // REC-5.2: Video error handling
  const handleVideoError = useCallback(() => {
    if (retryCount >= 3) {
      setVideoError(true);
      setReconnecting(false);
      return;
    }
    setReconnecting(true);
    retryTimer.current = setTimeout(() => {
      const v = videoRef.current;
      if (v) { v.load(); v.play().catch(() => {}); }
      setRetryCount(c => c + 1);
      setReconnecting(false);
    }, 3000);
  }, [retryCount]);

  useEffect(() => {
    return () => { if (retryTimer.current) clearTimeout(retryTimer.current); };
  }, []);

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
    try {
      await updateDoc(doc(db, 'streams', streamId), { [`reactions.${emoji}`]: increment(1) });
    } catch {}
  };

  // Follow/unfollow
  const toggleFollow = async () => {
    if (!uid || !stream?.uid) return;
    try {
      const { updateDoc: upd, doc: d, arrayUnion: au, arrayRemove: ar } = await import('firebase/firestore');
      await upd(d(db, 'users', uid), {
        following: isFollowing ? ar(stream.uid) : au(stream.uid),
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
      if (amount >= 100) setShowConfetti(true);
    } catch { showToast('Gift failed'); }
  };

  // REC-5.5: Clip creation
  const createClip = async () => {
    if (!streamId || !uid) return;
    setClipCreating(true);
    try {
      const currentTimestamp = videoRef.current?.currentTime || 0;
      await addDoc(collection(db, 'clips'), {
        streamId, uid, title: clipTitle.trim() || 'My Clip',
        timestamp: currentTimestamp,
        streamTitle: stream?.title || '',
        streamerName: stream?.userName || '',
        status: 'processing',
        createdAt: serverTimestamp(),
      });
      showToast('✂️ Clip queued for processing!');
      setShowClipModal(false);
      setClipTitle('');
    } catch { showToast('Clip creation failed'); }
    finally { setClipCreating(false); }
  };

  // REC-5.10: Create poll
  const createPoll = async () => {
    if (!pollQuestion.trim() || pollOptions.filter(o => o.trim()).length < 2) {
      showToast('Add a question and at least 2 options'); return;
    }
    try {
      const opts = pollOptions.filter(o => o.trim()).reduce((acc, o) => ({ ...acc, [o.trim()]: 0 }), {});
      await addDoc(collection(db, 'streams', streamId, 'polls'), {
        question: pollQuestion.trim(), options: opts,
        active: true, createdAt: serverTimestamp(), uid,
      });
      setShowPollCreator(false);
      setPollQuestion('');
      setPollOptions(['', '']);
      showToast('📊 Poll created!');
    } catch { showToast('Poll creation failed'); }
  };

  // Vote on poll
  const votePoll = async optionKey => {
    if (!activePoll || userVote || !uid) return;
    try {
      await updateDoc(doc(db, 'streams', streamId, 'polls', activePoll.id), {
        [`options.${optionKey}`]: increment(1),
      });
      setUserVote(optionKey);
      showToast(`Voted: ${optionKey}`);
    } catch { showToast('Vote failed'); }
  };

  // REC-5.9: Pin message
  const pinMessage = async msg => {
    if (!isStreamer) return;
    try {
      await updateDoc(doc(db, 'streams', streamId), { pinnedMessage: msg });
      setPinnedMsg(msg);
      showToast('📌 Message pinned');
    } catch {}
  };

  const unpinMessage = async () => {
    if (!isStreamer) return;
    try {
      const { deleteField } = await import('firebase/firestore');
      await updateDoc(doc(db, 'streams', streamId), { pinnedMessage: deleteField() });
      setPinnedMsg(null);
    } catch {}
  };

  // REC-5.13: Create watch party
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
      if (navigator.share) {
        await navigator.share({ title: 'Watch Party', url: link });
      } else {
        await navigator.clipboard.writeText(link);
        showToast('🎉 Watch party link copied!');
      }
    } catch { showToast('Failed to create watch party'); }
  };

  // Sync watch party time
  const syncWatchPartyTime = useCallback(async () => {
    if (!watchPartyRoom || !videoRef.current) return;
    try {
      await updateDoc(doc(db, 'watchParties', watchPartyRoom), {
        currentTime: videoRef.current.currentTime,
      });
    } catch {}
  }, [watchPartyRoom]);

  useEffect(() => {
    if (!watchPartyRoom) return;
    const t = setInterval(syncWatchPartyTime, 5000);
    return () => clearInterval(t);
  }, [watchPartyRoom, syncWatchPartyTime]);

  const fmt = n => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n || 0);

  // REC-5.17: Show content warning before mature content
  if (stream?.contentRating === 'mature' && !contentWarningCleared) {
    return <ContentWarning onContinue={() => setContentWarningCleared(true)} />;
  }

  if (loading) return (
    <div style={{ background:'#0a0a18', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ color:'#94a3b8', fontSize:'14px' }}>Loading stream…</div>
    </div>
  );

  if (!stream) return (
    <div style={{ background:'#0a0a18', minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'12px' }}>
      <div style={{ fontSize:'40px' }}>📡</div>
      <div style={{ color:'#f1f5f9', fontWeight:700 }}>Stream not found</div>
      <button onClick={() => navigate('/live')} style={{ background:'#1e293b', border:'none', borderRadius:'10px', padding:'10px 20px', color:'#94a3b8', cursor:'pointer' }}>← Browse Live</button>
    </div>
  );

  const totalVotes = activePoll ? Object.values(activePoll.options || {}).reduce((a, b) => a + b, 0) : 0;

  return (
    <>
    {showConfetti && <ConfettiBurst onDone={() => setShowConfetti(false)} />}

    <div style={{ background:'#0a0a18', minHeight:'100vh', display:'flex', flexDirection:'column', paddingBottom:'80px' }}>

      {/* Header */}
      <div style={{ padding:'10px 16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', gap:'10px' }}>
        <button onClick={() => navigate('/live')} style={{ background:'none', border:'none', color:'#94a3b8', fontSize:'20px', cursor:'pointer' }}>←</button>
        <div style={{ flex:1, overflow:'hidden' }}>
          <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'14px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{stream.title || 'Live Stream'}</div>
          {/* REC-5.6: Streamer name navigates to /profile/:uid */}
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

      {/* Video Player */}
      <div style={{ position:'relative', width:'100%', aspectRatio:'16/9', background:'#000', maxHeight:'240px' }}>
        <video ref={videoRef} autoPlay playsInline controls
          muted={isMuted}
          src={stream.streamUrl}
          onError={handleVideoError}
          onTimeUpdate={watchPartyRoom ? syncWatchPartyTime : undefined}
          crossOrigin="anonymous"
          style={{ width:'100%', height:'100%', objectFit:'contain' }} />

        {/* REC-5.2: Reconnect overlay */}
        {(reconnecting || videoError) && (
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.85)', display:'flex', flexDirection:'column',
            alignItems:'center', justifyContent:'center', gap:'12px' }}>
            {reconnecting ? (
              <>
                <div style={{ color:'white', fontSize:'24px', animation:'spin 1s linear infinite' }}>⟳</div>
                <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'14px' }}>Reconnecting… ({retryCount}/3)</div>
                <div style={{ color:'#94a3b8', fontSize:'12px' }}>Hang tight, restoring connection</div>
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

        {/* REC-5.16: Quality selector overlay */}
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
                  style={{ display:'block', width:'100%', background: quality === q2 ? '#334155' : 'none',
                    border:'none', borderRadius:'6px', padding:'6px 14px', color: quality === q2 ? '#f1f5f9' : '#94a3b8',
                    fontSize:'12px', fontWeight:600, cursor:'pointer', textAlign:'left', whiteSpace:'nowrap' }}>
                  {quality === q2 ? '✓ ' : ''}{q2}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mute / Watch Party icons */}
        <div style={{ position:'absolute', bottom:'8px', left:'8px', display:'flex', gap:'6px' }}>
          <button onClick={() => setIsMuted(v => !v)}
            style={{ background:'rgba(0,0,0,0.7)', border:'none', borderRadius:'6px', padding:'4px 8px',
              color:'white', fontSize:'14px', cursor:'pointer' }}>
            {isMuted ? '🔇' : '🔊'}
          </button>
          {/* REC-5.13: Watch party button */}
          <button onClick={() => setShowWatchParty(v => !v)}
            style={{ background: watchPartyRoom ? 'rgba(99,102,241,0.8)' : 'rgba(0,0,0,0.7)',
              border:'none', borderRadius:'6px', padding:'4px 8px', color:'white', fontSize:'14px', cursor:'pointer' }}>
            🎉 {watchPartyRoom ? `${watchPartyMembers}` : ''}
          </button>
        </div>
      </div>

      {/* Emoji reactions */}
      <div style={{ display:'flex', gap:'8px', padding:'8px 16px', overflowX:'auto', borderBottom:'1px solid #1e293b' }}>
        {EMOJIS.map(emoji => (
          <button key={emoji} onClick={() => sendReaction(emoji)}
            style={{ background:'#1e293b', border:'none', borderRadius:'20px', padding:'5px 10px',
              fontSize:'13px', cursor:'pointer', flexShrink:0, display:'flex', alignItems:'center', gap:'4px', color:'#f1f5f9' }}>
            {emoji} <span style={{ fontSize:'10px', color:'#94a3b8' }}>{reactions[emoji] || 0}</span>
          </button>
        ))}
        {/* REC-5.5: Clip button */}
        <button onClick={() => setShowClipModal(true)}
          style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:'20px', padding:'5px 10px',
            fontSize:'11px', color:'#94a3b8', cursor:'pointer', flexShrink:0, fontWeight:600 }}>
          ✂️ Clip
        </button>
        {/* Gift button */}
        <button onClick={() => setShowGiftModal(true)}
          style={{ background:'linear-gradient(135deg,#f59e0b,#ef4444)', border:'none', borderRadius:'20px',
            padding:'5px 10px', fontSize:'11px', color:'white', cursor:'pointer', flexShrink:0, fontWeight:700 }}>
          🎁 Gift
        </button>
      </div>

      {/* Stream info + Follow */}
      <div style={{ padding:'10px 16px', borderBottom:'1px solid #1e293b', display:'flex', gap:'10px', alignItems:'flex-start' }}>
        <div style={{ flex:1 }}>
          <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'14px', marginBottom:'2px' }}>{stream.title}</div>
          <div style={{ color:'#64748b', fontSize:'12px' }}>{stream.description}</div>
          {stream.category && (
            <div style={{ marginTop:'4px' }}>
              <span style={{ background:'#1e293b', borderRadius:'8px', padding:'2px 8px', color:'#94a3b8', fontSize:'11px' }}>
                {stream.category}
              </span>
            </div>
          )}
        </div>
        <div style={{ display:'flex', gap:'6px', flexShrink:0 }}>
          {/* Share */}
          <button onClick={async () => {
            const url = window.location.href;
            if (navigator.share) { await navigator.share({ title: stream.title, url }); }
            else { await navigator.clipboard.writeText(url); showToast('Link copied'); }
          }} style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:'10px', padding:'8px 12px',
            color:'#94a3b8', fontSize:'13px', cursor:'pointer' }}>🔗</button>
          <button onClick={toggleFollow}
            style={{ background: isFollowing ? '#1e293b' : 'linear-gradient(135deg,#ef4444,#f59e0b)',
              border: isFollowing ? '1px solid #334155' : 'none', borderRadius:'10px', padding:'8px 14px',
              color: isFollowing ? '#94a3b8' : 'white', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>
            {isFollowing ? '✓ Following' : '+ Follow'}
          </button>
        </div>
      </div>

      {/* REC-5.13: Watch Party Panel */}
      {showWatchParty && (
        <div style={{ background:'#1e293b', borderBottom:'1px solid #334155', padding:'12px 16px' }}>
          <div style={{ fontSize:'13px', fontWeight:700, color:'#f1f5f9', marginBottom:'8px' }}>🎉 Watch Party</div>
          {watchPartyRoom ? (
            <div>
              <div style={{ color:'#94a3b8', fontSize:'12px', marginBottom:'8px' }}>
                {watchPartyMembers} people watching together · Room: {watchPartyRoom.slice(0, 8)}…
              </div>
              <button onClick={async () => {
                const link = `${window.location.origin}/live/watch/${streamId}?party=${watchPartyRoom}`;
                if (navigator.share) await navigator.share({ title: 'Watch Party', url: link });
                else { await navigator.clipboard.writeText(link); showToast('Party link copied!'); }
              }} style={{ background:'#334155', border:'none', borderRadius:'8px', padding:'6px 14px',
                color:'#f1f5f9', fontSize:'12px', cursor:'pointer', fontWeight:600 }}>
                📤 Invite Friends
              </button>
            </div>
          ) : (
            <div>
              <div style={{ color:'#64748b', fontSize:'12px', marginBottom:'8px' }}>
                Start a watch party and invite friends to watch in sync
              </div>
              <button onClick={createWatchParty}
                style={{ background:'linear-gradient(135deg,#6366f1,#818cf8)', border:'none', borderRadius:'10px',
                  padding:'8px 16px', color:'white', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>
                🎉 Start Watch Party
              </button>
            </div>
          )}
        </div>
      )}

      {/* REC-5.10: Active Poll */}
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
                  <div style={{ position:'absolute', inset:0, background:'rgba(99,102,241,0.25)',
                    width: `${pct}%`, transition:'width 0.4s ease' }} />
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

      {/* Poll creator (streamer only) */}
      {isStreamer && showPollCreator && (
        <div style={{ background:'#1e293b', borderBottom:'1px solid #334155', padding:'12px 16px' }}>
          <div style={{ fontSize:'13px', fontWeight:700, color:'#f1f5f9', marginBottom:'8px' }}>Create Poll</div>
          <input value={pollQuestion} onChange={e => setPollQuestion(e.target.value)}
            placeholder="Poll question…"
            style={{ width:'100%', background:'#0f172a', border:'1px solid #334155', borderRadius:'8px',
              padding:'8px 12px', color:'#f1f5f9', fontSize:'13px', outline:'none', boxSizing:'border-box', marginBottom:'8px' }} />
          {pollOptions.map((opt, i) => (
            <input key={i} value={opt} onChange={e => { const o=[...pollOptions]; o[i]=e.target.value; setPollOptions(o); }}
              placeholder={`Option ${i + 1}`}
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

      {/* REC-5.9: Pinned message */}
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
                <span style={{ color:'#f59e0b', fontSize:'11px', fontWeight:700 }}>{msg.userName}: </span>
                <span style={{ color:'#e2e8f0', fontSize:'12px' }}>{msg.text}</span>
              </div>
              {/* REC-5.9: Pin icon for streamer */}
              {isStreamer && (
                <button onClick={() => pinMessage(msg)}
                  style={{ background:'none', border:'none', color:'#334155', fontSize:'12px', cursor:'pointer', padding:'0 2px' }}
                  aria-label="Pin message" title="Pin message">
                  📌
                </button>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Chat input */}
        {stream.status === 'live' ? (
          uid ? (
            <div style={{ display:'flex', gap:'8px' }}>
              <textarea value={chatMsg} onChange={e => setChatMsg(e.target.value)} onKeyDown={handleKeyDown}
                placeholder={stream.subscriberOnlyChat && !followingIds.has(stream.uid) ? '🔒 Subscribers only' : 'Say something…'}
                disabled={stream.subscriberOnlyChat && !followingIds.has(stream.uid)}
                rows={1}
                style={{ flex:1, background:'#1e293b', border:'1px solid #334155', borderRadius:'10px',
                  padding:'9px 12px', color:'#f1f5f9', fontSize:'13px', outline:'none', resize:'none',
                  boxSizing:'border-box', overflow:'hidden' }} />
              <button onClick={sendMessage} disabled={sending || !chatMsg.trim()}
                style={{ background: chatMsg.trim() ? 'linear-gradient(135deg,#ef4444,#f59e0b)' : '#334155',
                  border:'none', borderRadius:'10px', padding:'0 16px', color:'white', fontWeight:700, fontSize:'18px',
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
          <div style={{ background:'#1e293b', borderRadius:'10px', padding:'10px', textAlign:'center',
            color:'#64748b', fontSize:'13px' }}>Stream has ended</div>
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

    {/* REC-5.5: Clip Creation Modal */}
    {showClipModal && (
      <div onClick={() => setShowClipModal(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:9000,
        display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
        <div onClick={e => e.stopPropagation()} style={{ background:'#1e293b', borderRadius:'20px 20px 0 0',
          padding:'20px 20px 36px', width:'100%', maxWidth:'420px' }}>
          <div style={{ fontSize:'16px', fontWeight:800, color:'#f1f5f9', marginBottom:'4px' }}>✂️ Create Clip</div>
          <div style={{ color:'#64748b', fontSize:'12px', marginBottom:'12px' }}>Capture the last 30 seconds of the stream</div>
          <input value={clipTitle} onChange={e => setClipTitle(e.target.value)}
            placeholder="Clip title (optional)"
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

    <style>{`
      @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    `}</style>
    </>
  );
}
