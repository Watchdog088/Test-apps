// LiveWatchPage.jsx — /live/watch/:streamId
// FIXES:
//   BUG-W01/MISS-W01: Share button (navigator.share + clipboard fallback)
//   BUG-MOD02: Check bannedUsers/ before sendMessage addDoc
//   MISS-MOD01: Run openAI moderation before each chat message
//   BUG-W03: Poll vote: disable + spinner while pending
//   BUG-W04: MediaRecorder MIME type fallback (isTypeSupported)
//   BUG-W05: chat addDoc failure toast
//   BUG-W06: streamAge uses nowTs not Date.now()
//   BUG-W07: iOS fullscreen webkitRequestFullscreen fallback
//   BUG-W08: Back-navigation guard onbeforeunload
//   MISS-W02: "Add to Watch Later" button
//   MISS-W05: VOD progress memory (localStorage)
//   MISS-W06: Keyboard shortcuts (K,F,M,C,←,→)

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  doc, getDoc, collection, addDoc, onSnapshot,
  query, orderBy, limit, serverTimestamp, setDoc, deleteDoc,
  getDoc as fsGetDoc,
} from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import useAppStore from '@store/useAppStore';

// Safe dynamic import for AI moderation
async function runAIModeration(text) {
  try {
    const { openAIModerationService } = await import('@/services/openai-moderation-service');
    return await openAIModerationService.moderate(text);
  } catch {
    return { flagged: false }; // fail open if service unavailable
  }
}

// BUG-W04: Safe MIME type selection
function getSafeMimeType() {
  const types = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
    'video/mp4',
  ];
  return types.find(t => MediaRecorder.isTypeSupported(t)) || '';
}

export default function LiveWatchPage() {
  const { streamId } = useParams();
  const navigate     = useNavigate();
  const showToast    = useAppStore(s => s.showToast);
  const uid          = auth.currentUser?.uid;

  const videoRef     = useRef(null);
  const recorderRef  = useRef(null);
  const chatEndRef   = useRef(null);
  const nowTsRef     = useRef(Date.now()); // BUG-W06: stable timestamp

  const [stream,        setStream]        = useState(null);
  const [messages,      setMessages]      = useState([]);
  const [chatInput,     setChatInput]     = useState('');
  const [sending,       setSending]       = useState(false);
  const [isLive,        setIsLive]        = useState(false);
  const [viewerCount,   setViewerCount]   = useState(0);
  const [showChat,      setShowChat]      = useState(true);
  const [polls,         setPolls]         = useState([]);
  const [votingPoll,    setVotingPoll]    = useState(null); // pollId being voted on
  const [watching,      setWatching]      = useState(false);
  const [isWatchLater,  setIsWatchLater]  = useState(false);
  const [loadingWL,     setLoadingWL]     = useState(false);
  const [isBanned,      setIsBanned]      = useState(false);

  // BUG-W08: Back-navigation guard
  useEffect(() => {
    const handler = (e) => {
      if (isLive) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isLive]);

  // MISS-W06: Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const video = videoRef.current;
      if (!video) return;
      switch(e.key.toLowerCase()) {
        case 'k': case ' ': e.preventDefault(); video.paused ? video.play() : video.pause(); break;
        case 'f': toggleFullscreen(); break;
        case 'm': video.muted = !video.muted; break;
        case 'c': setShowChat(v => !v); break;
        case 'arrowleft': video.currentTime = Math.max(0, video.currentTime - 10); break;
        case 'arrowright': video.currentTime = Math.min(video.duration || 0, video.currentTime + 10); break;
        default: break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Load stream data
  useEffect(() => {
    if (!streamId) return;
    (async () => {
      const snap = await getDoc(doc(db, 'streams', streamId)).catch(() => null);
      if (snap?.exists()) {
        const data = { id: snap.id, ...snap.data() };
        setStream(data);
        setIsLive(data.status === 'live');
      }
      // Check if in watch later
      if (uid) {
        const wlSnap = await getDoc(doc(db, 'users', uid, 'watchLater', streamId)).catch(() => null);
        setIsWatchLater(wlSnap?.exists() || false);
        // BUG-MOD02: Check if user is banned by this streamer
        const streamerUid = snap?.data()?.uid;
        if (streamerUid && uid) {
          const banSnap = await getDoc(doc(db, 'users', streamerUid, 'bannedUsers', uid)).catch(() => null);
          if (banSnap?.exists()) {
            const d = banSnap.data();
            // Check timeout
            if (d.type === 'timeout' && d.timeoutUntil?.toDate) {
              setIsBanned(d.timeoutUntil.toDate() > new Date());
            } else if (d.type !== 'timeout') {
              setIsBanned(true);
            }
          }
        }
      }
    })();
  }, [streamId, uid]);

  // Real-time chat listener
  useEffect(() => {
    if (!streamId) return;
    const q = query(
      collection(db, 'streams', streamId, 'messages'),
      orderBy('createdAt', 'asc'),
      limit(200)
    );
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior:'smooth' }), 50);
    });
    return unsub;
  }, [streamId]);

  // MISS-W05: VOD progress memory
  useEffect(() => {
    const video = videoRef.current;
    if (!video || isLive) return;
    const key = `vod_progress_${streamId}`;
    const saved = localStorage.getItem(key);
    if (saved) { video.currentTime = parseFloat(saved); }
    const save = () => localStorage.setItem(key, String(video.currentTime));
    video.addEventListener('timeupdate', save);
    return () => video.removeEventListener('timeupdate', save);
  }, [streamId, isLive]);

  // BUG-W06: Fix streamAge — use stable nowTsRef
  const streamAge = useCallback(() => {
    if (!stream?.startedAt) return '';
    const started = stream.startedAt?.toDate ? stream.startedAt.toDate() : new Date(stream.startedAt);
    const diff = Math.floor((nowTsRef.current - started.getTime()) / 60000);
    if (diff < 1) return 'Just started';
    if (diff < 60) return `${diff}m`;
    return `${Math.floor(diff/60)}h ${diff%60}m`;
  }, [stream]);

  // BUG-W07: iOS fullscreen fallback
  const toggleFullscreen = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      (video.requestFullscreen || video.webkitRequestFullscreen || video.mozRequestFullScreen)?.call(video);
    }
  }, []);

  // BUG-W01/MISS-W01: Share button
  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/live/watch/${streamId}`;
    const shareData = { title: stream?.title || 'Live Stream', url };
    if (navigator.share) {
      try { await navigator.share(shareData); return; } catch {}
    }
    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(url);
      showToast('🔗 Link copied!');
    } catch {
      showToast(`🔗 ${url}`);
    }
  }, [streamId, stream, showToast]);

  // MISS-W02: Watch Later toggle
  const toggleWatchLater = useCallback(async () => {
    if (!uid) { showToast('Sign in to save streams'); return; }
    setLoadingWL(true);
    try {
      const ref = doc(db, 'users', uid, 'watchLater', streamId);
      if (isWatchLater) {
        await deleteDoc(ref);
        setIsWatchLater(false);
        showToast('Removed from Watch Later');
      } else {
        await setDoc(ref, {
          streamId, title: stream?.title || '', thumbnailUrl: stream?.thumbnailUrl || '',
          streamerName: stream?.streamerName || '', savedAt: serverTimestamp(),
        });
        setIsWatchLater(true);
        showToast('🔖 Saved to Watch Later');
      }
    } catch { showToast('Failed'); }
    finally { setLoadingWL(false); }
  }, [uid, streamId, stream, isWatchLater, showToast]);

  // Send chat message — BUG-MOD02 + MISS-MOD01
  const sendMessage = useCallback(async () => {
    const text = chatInput.trim();
    if (!text || !uid || sending) return;

    // BUG-MOD02: Check if user is banned
    if (isBanned) { showToast('You are banned from this chat'); return; }

    setSending(true);
    try {
      // MISS-MOD01: AI moderation check
      const modResult = await runAIModeration(text);
      if (modResult?.flagged) {
        showToast('⚠️ Your message was flagged by our content filter');
        setSending(false);
        return;
      }

      setChatInput('');
      await addDoc(collection(db, 'streams', streamId, 'messages'), {
        uid, text,
        displayName: auth.currentUser?.displayName || 'Anonymous',
        photoURL: auth.currentUser?.photoURL || null,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      // BUG-W05: Show toast on failure
      showToast('❌ Message failed to send. Try again.');
      setChatInput(text); // restore text
    } finally {
      setSending(false);
    }
  }, [chatInput, uid, streamId, sending, isBanned, showToast]);

  // BUG-W03: Poll vote with spinner
  const voteOnPoll = useCallback(async (pollId, optionIdx) => {
    if (!uid || votingPoll === pollId) return;
    setVotingPoll(pollId);
    try {
      await setDoc(doc(db, 'streams', streamId, 'pollVotes', `${pollId}_${uid}`), {
        pollId, optionIdx, uid, createdAt: serverTimestamp(),
      });
      setPolls(p => p.map(poll => poll.id === pollId
        ? { ...poll, userVote: optionIdx }
        : poll
      ));
      showToast('✓ Vote cast!');
    } catch { showToast('Failed to vote'); }
    finally { setVotingPoll(null); }
  }, [uid, streamId, votingPoll, showToast]);

  // BUG-W04: Clip recording with safe MIME type
  const startClipRecording = useCallback(() => {
    const video = videoRef.current;
    if (!video?.srcObject) return;
    try {
      const mimeType = getSafeMimeType();
      const opts = mimeType ? { mimeType } : {};
      recorderRef.current = new MediaRecorder(video.srcObject, opts);
      const chunks = [];
      recorderRef.current.ondataavailable = e => e.data.size > 0 && chunks.push(e.data);
      recorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType || 'video/webm' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a'); a.href = url;
        a.download = `clip-${streamId}-${Date.now()}.webm`;
        document.body.appendChild(a); a.click();
        document.body.removeChild(a); URL.revokeObjectURL(url);
        showToast('✂️ Clip saved!');
      };
      recorderRef.current.start(1000);
      showToast('🔴 Recording clip…');
      setTimeout(() => recorderRef.current?.state === 'recording' && recorderRef.current.stop(), 30000);
    } catch (e) { showToast('Clip recording not supported on this device'); }
  }, [streamId, showToast]);

  if (!stream) return (
    <div style={{ background:'#000', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'#64748b', fontSize:'14px' }}>
      Loading stream…
    </div>
  );

  const CATEGORY_EMOJI = { Gaming:'🎮', Music:'🎵', 'Just Chatting':'💬', Sports:'⚽', Education:'📚', Art:'🎨', Other:'🔴' };

  return (
    <div style={{ background:'#000', minHeight:'100vh', display:'flex', flexDirection:'column', paddingBottom:'60px' }}>

      {/* Video player */}
      <div style={{ position:'relative', width:'100%', aspectRatio:'16/9', background:'#000', maxHeight:'280px', flexShrink:0 }}>
        <video ref={videoRef} style={{ width:'100%', height:'100%', objectFit:'contain', background:'#000' }}
          autoPlay playsInline controls={false} />

        {/* Overlay controls */}
        <div style={{ position:'absolute', top:0, left:0, right:0, padding:'8px', display:'flex', alignItems:'center', gap:'6px',
          background:'linear-gradient(to bottom,rgba(0,0,0,0.7),transparent)' }}>
          <button onClick={() => navigate(-1)} style={{ background:'none', border:'none', color:'white', fontSize:'18px', cursor:'pointer' }}>←</button>
          <div style={{ flex:1 }}>
            <div style={{ color:'white', fontWeight:700, fontSize:'13px', textShadow:'0 1px 3px rgba(0,0,0,0.8)' }}>{stream.title}</div>
            <div style={{ color:'rgba(255,255,255,0.7)', fontSize:'11px' }}>
              {isLive
                ? <><span style={{ color:'#ef4444', fontWeight:700 }}>● LIVE</span> · {viewerCount} watching · {streamAge()}</>
                : `${CATEGORY_EMOJI[stream.category] || '🔴'} ${stream.category || ''}`
              }
            </div>
          </div>
        </div>

        <div style={{ position:'absolute', bottom:'8px', right:'8px', display:'flex', gap:'6px' }}>
          {/* BUG-W01/MISS-W01: Share button */}
          <button onClick={handleShare} title="Share (S)" aria-label="Share stream"
            style={{ background:'rgba(0,0,0,0.6)', border:'none', borderRadius:'8px', padding:'6px 10px', color:'white', fontSize:'16px', cursor:'pointer' }}>
            🔗
          </button>
          {/* MISS-W02: Watch Later */}
          <button onClick={toggleWatchLater} disabled={loadingWL} title="Save to Watch Later"
            style={{ background: isWatchLater ? 'rgba(239,68,68,0.8)' : 'rgba(0,0,0,0.6)',
              border:'none', borderRadius:'8px', padding:'6px 10px', color:'white', fontSize:'16px', cursor:'pointer' }}>
            🔖
          </button>
          {/* BUG-W07: iOS fullscreen */}
          <button onClick={toggleFullscreen} title="Fullscreen (F)"
            style={{ background:'rgba(0,0,0,0.6)', border:'none', borderRadius:'8px', padding:'6px 10px', color:'white', fontSize:'16px', cursor:'pointer' }}>
            ⛶
          </button>
          {isLive && (
            <button onClick={startClipRecording} title="Record Clip"
              style={{ background:'rgba(0,0,0,0.6)', border:'none', borderRadius:'8px', padding:'6px 10px', color:'white', fontSize:'16px', cursor:'pointer' }}>
              ✂️
            </button>
          )}
          <button onClick={() => setShowChat(v => !v)} title="Toggle Chat (C)"
            style={{ background:'rgba(0,0,0,0.6)', border:'none', borderRadius:'8px', padding:'6px 10px', color:'white', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>
            💬
          </button>
        </div>

        {/* Keyboard shortcuts hint */}
        <div style={{ position:'absolute', bottom:'8px', left:'8px', color:'rgba(255,255,255,0.4)', fontSize:'10px' }}>
          K=play F=full M=mute C=chat ←→=seek
        </div>
      </div>

      {/* Polls */}
      {polls.length > 0 && (
        <div style={{ padding:'8px 12px' }}>
          {polls.filter(p => !p.endedAt || new Date(p.endedAt?.toDate?.() || p.endedAt) > new Date()).map(poll => (
            <div key={poll.id} style={{ background:'#1e293b', borderRadius:'12px', padding:'12px', marginBottom:'8px' }}>
              <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'13px', marginBottom:'8px' }}>📊 {poll.question}</div>
              {(poll.options || []).map((opt, i) => {
                const isVoting = votingPoll === poll.id;
                const hasVoted = poll.userVote !== undefined;
                const isPicked = poll.userVote === i;
                const total = (poll.votes || []).reduce((s, v) => s + v, 0) || 1;
                const pct = hasVoted ? Math.round(((poll.votes?.[i] || 0) / total) * 100) : 0;
                return (
                  <button key={i} onClick={() => !hasVoted && voteOnPoll(poll.id, i)}
                    disabled={hasVoted || isVoting}
                    style={{ display:'flex', alignItems:'center', gap:'8px', width:'100%', background: isPicked ? 'rgba(239,68,68,0.15)' : '#334155',
                      border:`1px solid ${isPicked ? '#ef4444' : '#475569'}`, borderRadius:'8px', padding:'8px 10px',
                      color: isPicked ? '#f87171' : '#94a3b8', fontSize:'12px', fontWeight: isPicked ? 700 : 400,
                      cursor: hasVoted ? 'default' : 'pointer', marginBottom:'6px', position:'relative', overflow:'hidden' }}>
                    {hasVoted && <div style={{ position:'absolute', left:0, top:0, bottom:0, width:`${pct}%`, background:'rgba(239,68,68,0.1)', transition:'width 0.5s' }} />}
                    {/* BUG-W03: Spinner while voting */}
                    {isVoting ? <span style={{ color:'#94a3b8' }}>⏳</span> : <span>{opt}</span>}
                    {hasVoted && <span style={{ marginLeft:'auto', color:'#64748b', fontSize:'11px' }}>{pct}%</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Chat */}
      {showChat && (
        <div style={{ flex:1, display:'flex', flexDirection:'column', minHeight:0, background:'#0f172a' }}>
          <div style={{ flex:1, overflowY:'auto', padding:'8px 12px', maxHeight:'250px' }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ display:'flex', gap:'6px', marginBottom:'6px', alignItems:'flex-start' }}>
                {msg.photoURL
                  ? <img src={msg.photoURL} alt="" style={{ width:'24px', height:'24px', borderRadius:'50%', flexShrink:0, objectFit:'cover' }} />
                  : <div style={{ width:'24px', height:'24px', borderRadius:'50%', background:'#334155', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'10px', fontWeight:700 }}>
                      {(msg.displayName || 'A')[0].toUpperCase()}
                    </div>
                }
                <div>
                  <span style={{ color:'#ef4444', fontWeight:700, fontSize:'11px', marginRight:'6px' }}>{msg.displayName}</span>
                  <span style={{ color:'#e2e8f0', fontSize:'12px' }}>{msg.text}</span>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Chat input */}
          <div style={{ padding:'8px 12px', borderTop:'1px solid #1e293b', display:'flex', gap:'6px' }}>
            {isBanned ? (
              <div style={{ flex:1, background:'rgba(239,68,68,0.1)', borderRadius:'8px', padding:'8px 10px', color:'#f87171', fontSize:'12px', textAlign:'center' }}>
                🚫 You cannot send messages in this stream
              </div>
            ) : (
              <>
                <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder={uid ? 'Say something…' : 'Sign in to chat'}
                  disabled={!uid || sending}
                  style={{ flex:1, background:'#1e293b', border:'1px solid #334155', borderRadius:'20px',
                    padding:'8px 14px', color:'#f1f5f9', fontSize:'12px', outline:'none' }} />
                <button onClick={sendMessage} disabled={!chatInput.trim() || !uid || sending}
                  style={{ background: chatInput.trim() && uid ? '#ef4444' : '#334155', border:'none', borderRadius:'50%',
                    width:'36px', height:'36px', color:'white', fontSize:'16px', cursor: chatInput.trim() && uid ? 'pointer' : 'not-allowed',
                    display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {sending ? '⏳' : '▶'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Stream info */}
      <div style={{ padding:'12px 16px', background:'#0a0a18', borderTop:'1px solid #1e293b' }}>
        <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'14px', marginBottom:'4px' }}>{stream.title}</div>
        {stream.description && <div style={{ color:'#94a3b8', fontSize:'12px', marginBottom:'4px' }}>{stream.description}</div>}
        {stream.tags?.length > 0 && (
          <div style={{ display:'flex', gap:'4px', flexWrap:'wrap' }}>
            {stream.tags.map(t => (
              <span key={t} style={{ background:'rgba(239,68,68,0.1)', color:'#f87171', borderRadius:'20px', padding:'2px 8px', fontSize:'11px' }}>#{t}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
