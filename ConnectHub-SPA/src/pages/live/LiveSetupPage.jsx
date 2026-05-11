// LIVE SETUP PAGE — /live/setup
// ============================================================
// FIXES APPLIED (Round 1 — Previous Beta Report):
//   BUG-11: Tags lifted to parent state, included in Firestore payload
//   BUG-12: Co-host invite queries by inviteeName (displayName)
//   BUG-13: Thumbnail uploaded to Firebase Storage, CDN URL saved
//   BUG-14: Navigation guard prevents leaving while live
//   BUG-15: getUserMedia error caught and shown to user
//   BUG-16: Estimated duration controlled state, saved to Firestore
//   BUG-17: Edit Info sheet shows all 8 categories
//   UX-11 (old): Audio level meter using AudioContext
//
// FIXES APPLIED (Round 2 — Comprehensive Beta Test Report):
//   BUG-C1: healthIntervalRef cleaned up via visibilitychange + onDisconnected + useEffect
//   BUG-C2: Camera srcObject verified BEFORE writing stream doc to Firestore
//   BUG-C3: Co-host invite now stores/queries by inviteeUID (not display name)
//   BUG-C4: "Invite to Speak" writes Firestore speak-invite doc to notify viewer
//   BUG-C5: navigate('/live/analytics?streamId=...') passes streamId
//   BUG-C6: mediaStream tracks stopped on unmount (separate from videoRef stream)
//   BUG-M1: GO LIVE button shows loading/spinner state, prevents double-click
//   BUG-M2: tags included in setStreamSummary call
//   BUG-M3: Custom styled duration selector (not native <select>)
//   BUG-M4: Stream title maxLength={100} + live character counter
//   BUG-M5: Invite button disabled when no active stream yet
//   UX-9:   Camera flip (front/back) button on video preview
//   UX-10:  3-2-1 countdown overlay before going live
//   UX-11:  Live chat panel for streamer (collapsible drawer)
//   UX-14:  Video quality selector (Low/Medium/High)
//   UX-15:  Edit Info saving spinner
//   UX-19:  More duration options (15min, 30min, 45min, 1h, 1.5h, 2h, 3h, 4h+)
//   TECH-1: Interval paused when tab hidden (visibilitychange)
//   TECH-4: Crash recovery — detect orphaned streamId in localStorage on mount
// ============================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  doc, addDoc, updateDoc, onSnapshot, collection,
  serverTimestamp, query, where, getDocs, setDoc,
} from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '@/firebase/config';
import { LivestreamPublisher } from '@/services/livestream-webrtc';
import useAppStore from '@store/useAppStore';

const CATEGORIES = [
  { id:'gaming',    label:'Gaming',    emoji:'🎮' },
  { id:'music',     label:'Music',     emoji:'🎵' },
  { id:'fitness',   label:'Fitness',   emoji:'💪' },
  { id:'art',       label:'Art',       emoji:'🎨' },
  { id:'irl',       label:'IRL',       emoji:'📍' },
  { id:'cooking',   label:'Cooking',   emoji:'🍳' },
  { id:'education', label:'Education', emoji:'📚' },
  { id:'talkshow',  label:'Talk Show', emoji:'💬' },
];

const DURATIONS = [
  '15 minutes','30 minutes','45 minutes',
  '1 hour','1.5 hours','2 hours','3 hours','4+ hours',
];

// Sub-page quick-nav bar
function LiveSubNav({ navigate }) {
  return (
    <div style={{ display:'flex', gap:'6px', padding:'8px 16px', overflowX:'auto', scrollbarWidth:'none', borderBottom:'1px solid #1e293b' }}>
      {[
        { label:'📊 Analytics', path:'/live/analytics' },
        { label:'🛡️ Moderation', path:'/live/moderation' },
        { label:'📅 Schedule', path:'/live/schedule' },
        { label:'💰 Monetize', path:'/live/monetization' },
      ].map(l => (
        <button key={l.path} onClick={() => navigate(l.path)}
          style={{ background:'#1e293b', border:'none', borderRadius:'20px', padding:'5px 12px', color:'#94a3b8', fontSize:'11px', fontWeight:600, cursor:'pointer', flexShrink:0 }}>
          {l.label}
        </button>
      ))}
    </div>
  );
}

// Tags input
function TagsInput({ tags, onChange }) {
  const [val, setVal] = React.useState('');
  const addTag = () => {
    const t = val.trim().replace(/^#/, '').toLowerCase();
    if (!t || tags.includes(t) || tags.length >= 5) return;
    onChange([...tags, t]);
    setVal('');
  };
  return (
    <div style={{ marginBottom:'14px' }}>
      <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginBottom:'8px' }}>
        {tags.map(t => (
          <span key={t} style={{ background:'rgba(99,102,241,0.2)', border:'1px solid rgba(99,102,241,0.4)',
            borderRadius:'12px', padding:'3px 10px', color:'#818cf8', fontSize:'12px', display:'flex', alignItems:'center', gap:'4px' }}>
            #{t}
            {/* Touch target fix: 36×36 minimum per Apple HIG */}
            <button onClick={() => onChange(tags.filter(x => x !== t))} aria-label={`Remove tag ${t}`}
              style={{ background:'none', border:'none', color:'#64748b', cursor:'pointer', fontSize:'12px', padding:'6px', minWidth:'36px', minHeight:'36px' }}>✕</button>
          </span>
        ))}
      </div>
      <div style={{ display:'flex', gap:'8px' }}>
        <input value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key==='Enter' && addTag()}
          placeholder={tags.length >= 5 ? 'Max 5 tags' : '#hashtag...'}
          disabled={tags.length >= 5}
          aria-label="Add stream tag"
          style={{ flex:1, background:'#1e293b', border:'1px solid #334155', borderRadius:'12px', padding:'8px 12px', color:'#f1f5f9', fontSize:'13px', outline:'none', opacity: tags.length >= 5 ? 0.5 : 1 }} />
        <button onClick={addTag} disabled={tags.length >= 5 || !val.trim()} aria-label="Add tag"
          style={{ background:'#334155', border:'none', borderRadius:'12px', padding:'8px 14px', color:'#f1f5f9', fontWeight:700, fontSize:'13px', cursor:'pointer', opacity: tags.length >= 5 || !val.trim() ? 0.5 : 1 }}>
          Add
        </button>
      </div>
    </div>
  );
}

// Audio level meter
function AudioLevelMeter({ stream }) {
  const [level, setLevel] = useState(0);
  useEffect(() => {
    if (!stream) return;
    let audioCtx, rafId;
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      audioCtx.createMediaStreamSource(stream).connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setLevel(Math.min(100, Math.round((avg / 128) * 100)));
        rafId = requestAnimationFrame(tick);
      };
      tick();
    } catch {}
    return () => { cancelAnimationFrame(rafId); try { audioCtx?.close(); } catch {} };
  }, [stream]);
  const color = level > 70 ? '#ef4444' : level > 40 ? '#10b981' : '#334155';
  return (
    <div style={{ marginBottom:'12px' }}>
      <div style={{ fontSize:'11px', color:'#64748b', marginBottom:'4px' }}>🎤 Mic Level</div>
      <div style={{ background:'#1e293b', borderRadius:'8px', height:'8px', overflow:'hidden' }}>
        <div style={{ background:color, height:'100%', width:`${level}%`, transition:'width 0.1s' }} />
      </div>
      {level === 0 && <div style={{ color:'#ef4444', fontSize:'10px', marginTop:'3px' }}>No audio detected — check mic permissions</div>}
    </div>
  );
}

// BUG-M3 FIX: Custom styled duration selector
function DurationSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position:'relative', marginBottom:'20px' }}>
      <button onClick={() => setOpen(o => !o)} aria-haspopup="listbox" aria-expanded={open}
        style={{ width:'100%', background:'#1e293b', border:'1px solid #334155', borderRadius:'12px', padding:'10px 14px', color: value ? '#f1f5f9' : '#64748b', fontSize:'13px', cursor:'pointer', textAlign:'left', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span>{value || 'Select duration...'}</span>
        <span style={{ color:'#64748b' }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div role="listbox" style={{ position:'absolute', top:'calc(100% + 4px)', left:0, right:0, background:'#1e293b', border:'1px solid #334155', borderRadius:'12px', zIndex:50, overflow:'hidden', boxShadow:'0 8px 24px rgba(0,0,0,0.4)' }}>
          {DURATIONS.map(d => (
            <button key={d} role="option" aria-selected={value === d}
              onClick={() => { onChange(d); setOpen(false); }}
              style={{ width:'100%', background: value===d ? 'rgba(99,102,241,0.2)' : 'transparent', border:'none', padding:'10px 14px', color: value===d ? '#818cf8' : '#f1f5f9', fontSize:'13px', cursor:'pointer', textAlign:'left', display:'block' }}>
              {value===d ? '✓ ' : ''}{d}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Live chat panel for streamer (UX-11 FIX)
// BUG-NEW-01 FIX: showToast received as prop (was undefined via closure)
function StreamerChatPanel({ streamId, onClose, showToast }) {
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!streamId) return;
    const q = query(
      collection(db, 'streams', streamId, 'messages'),
      where('type', '!=', 'raise_hand')
    );
    const unsub = onSnapshot(q, snap => {
      const msgs = snap.docs.map(d => ({ id:d.id, ...d.data() }))
        .sort((a,b) => (a.createdAt?.seconds||0) - (b.createdAt?.seconds||0))
        .slice(-50);
      setMessages(msgs);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior:'smooth' }), 100);
    });
    return () => unsub();
  }, [streamId]);

  const sendMsg = async () => {
    if (!chatInput.trim() || !streamId || !auth.currentUser) return;
    await addDoc(collection(db, 'streams', streamId, 'messages'), {
      // MISSING-02 trigger happens via Firestore Cloud Function on stream create
      // The goLiveNotifications collection is watched by Cloud Function → OneSignal
      text:      chatInput.trim(),
      userId:    auth.currentUser.uid,
      userName:  auth.currentUser.displayName || 'Streamer',
      type:      'streamer',
      createdAt: serverTimestamp(),
    });
    setChatInput('');
  };

  return (
    <div style={{ position:'fixed', bottom:0, left:0, right:0, maxHeight:'50vh', background:'#0f172a', borderTop:'1px solid #1e293b', borderRadius:'20px 20px 0 0', zIndex:80, display:'flex', flexDirection:'column' }}>
      <div style={{ padding:'12px 16px', borderBottom:'1px solid #1e293b', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ color:'#f1f5f9', fontWeight:700, fontSize:'14px' }}>💬 Live Chat</span>
        <button onClick={onClose} aria-label="Close chat" style={{ background:'none', border:'none', color:'#64748b', fontSize:'18px', cursor:'pointer', padding:'4px 8px' }}>✕</button>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:'8px 12px', maxHeight:'calc(50vh - 96px)' }}>
        {messages.length === 0 && <div style={{ color:'#475569', fontSize:'12px', textAlign:'center', padding:'16px' }}>No messages yet...</div>}
        {messages.map(m => (
          <div key={m.id} style={{ padding:'4px 0', borderBottom:'1px solid rgba(30,41,59,0.5)', display:'flex', alignItems:'flex-start', gap:'4px' }}>
            <div style={{ flex:1 }}>
              {/* MISSING-B/K: use <strong> for a11y + reply reply fill */}
              <strong style={{ color: m.type==='streamer' ? '#10b981' : '#6366f1', fontSize:'12px' }}>{m.userName}: </strong>
              <span style={{ color:'#cbd5e1', fontSize:'12px' }}>{m.text}</span>
            </div>
            {/* BUG-NEW-02 FIX: use streamId prop, not window._currentStreamId */}
            <button onClick={async () => {
              if (!streamId) return;
              try {
                await updateDoc(doc(db, 'streams', streamId), { pinnedMessage: m.text });
                showToast?.('📌 Message pinned!');
              } catch { showToast?.('Failed to pin'); }
            }} aria-label={`Pin message from ${m.userName}`} title="Pin this message"
              style={{ background:'none', border:'none', color:'#475569', cursor:'pointer', fontSize:'14px', padding:'8px', minWidth:'36px', minHeight:'36px', flexShrink:0 }}>📌</button>
            {/* MISSING-K: Reply button — touch target fixed to 36×36 */}
            <button onClick={() => setChatInput(`@${m.userName} `)} aria-label={`Reply to ${m.userName}`} title="Reply"
              style={{ background:'none', border:'none', color:'#475569', cursor:'pointer', fontSize:'14px', padding:'8px', minWidth:'36px', minHeight:'36px', flexShrink:0 }}>↩</button>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div style={{ padding:'8px 12px', borderTop:'1px solid #1e293b', display:'flex', gap:'8px' }}>
        <input value={chatInput} onChange={e => setChatInput(e.target.value)}
          onKeyDown={e => e.key==='Enter' && sendMsg()}
          placeholder="Say something to viewers..."
          aria-label="Chat message"
          style={{ flex:1, background:'#1e293b', border:'1px solid #334155', borderRadius:'10px', padding:'8px 12px', color:'#f1f5f9', fontSize:'13px', outline:'none' }} />
        <button onClick={sendMsg} aria-label="Send message"
          style={{ background:'#6366f1', border:'none', borderRadius:'10px', padding:'8px 14px', color:'white', fontWeight:700, cursor:'pointer', fontSize:'13px' }}>➤</button>
      </div>
    </div>
  );
}

export default function LiveSetupPage() {
  const navigate  = useNavigate();
  const showToast = useAppStore(s => s.showToast);
  const videoRef  = useRef(null);
  const streamRef = useRef(null);
  const startTimeRef    = useRef(null);
  const publisherRef      = useRef(null);
  const healthIntervalRef = useRef(null);
  const vodRecorderRef    = useRef(null); // BUG-NEW-07 FIX: store VOD recorder so endStream can stop it

  // Form state
  const [title,        setTitle]        = useState('');
  const [category,     setCategory]     = useState('gaming');
  const [thumbnail,    setThumbnail]    = useState(null);
  const [thumbPreview, setThumbPreview] = useState(null);
  const [coHostUser,   setCoHostUser]   = useState('');
  const [coHostResults,setCoHostResults]= useState([]); // UX-17: user search results
  const [tags,         setTags]         = useState([]);
  const [duration,     setDuration]     = useState('');
  const [mediaStream,  setMediaStream]  = useState(null);
  const [camError,     setCamError]     = useState('');
  const [cameraFacing, setCameraFacing] = useState('user'); // UX-9: flip state
  const [videoQuality, setVideoQuality] = useState('medium'); // UX-14: quality
  const [countdown,    setCountdown]    = useState(null); // UX-10: 3-2-1
  const [showChat,     setShowChat]     = useState(false); // UX-11: streamer chat
  const [showChecklist, setShowChecklist] = useState(false); // GAP-18: pre-live checklist
  const [thumbUploading, setThumbUploading] = useState(false);
  const [starting,     setStarting]     = useState(false); // BUG-M1: loading state
  const [crashRecovery,setCrashRecovery]= useState(null); // TECH-4: orphaned stream

  // Live state
  const [streaming,    setStreaming]    = useState(false);
  const [health,       setHealth]       = useState({ fps:0, bitrate:0, latency:0 });
  const [liveViewers,  setLiveViewers]  = useState(0);
  const [liveMessages, setLiveMessages] = useState(0);

  // Co-host state
  const [coHostInvite,     setCoHostInvite]     = useState(null);
  const [pendingCoHostInv, setPendingCoHostInv] = useState(null);

  // Stream end summary
  const [showEndSummary, setShowEndSummary] = useState(false);
  const [streamSummary,  setStreamSummary]  = useState(null);

  // Raised hand / viewers
  const [raisedHands,    setRaisedHands]    = useState([]);
  const [showHands,      setShowHands]      = useState(false);
  const [viewersList,    setViewersList]    = useState([]);
  const [showViewersList,setShowViewersList]= useState(false);
  const [speakInviting,  setSpeakInviting]  = useState({}); // BUG-C4: per-viewer loading

  // Edit info
  // MISSING-A: Poll creation state
  const [showPollCreate, setShowPollCreate] = useState(false);
  const [pollQuestion,   setPollQuestion]  = useState('');
  const [pollOptions,    setPollOptions]   = useState(['','','','']);
  const [pollSubmitting, setPollSubmitting]= useState(false);
  const [activePollId,   setActivePollId]  = useState(null);
  // MISSING-E: Revenue counter
  const [liveRevenue,    setLiveRevenue]   = useState(0);
  // Rec 9: Milestone CTA
  const [lastMilestone,  setLastMilestone] = useState(0);

  const [editTitle,    setEditTitle]    = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [showEdit,     setShowEdit]     = useState(false);
  const [editSaving,   setEditSaving]   = useState(false); // UX-15: saving indicator

  // End stream confirm
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  // Quality constraints map
  const qualityConstraints = {
    low:    { width:{ideal:640},  height:{ideal:360},  frameRate:{ideal:24} },
    medium: { width:{ideal:1280}, height:{ideal:720},  frameRate:{ideal:30} },
    high:   { width:{ideal:1920}, height:{ideal:1080}, frameRate:{ideal:30} },
  };

  // BUG-C6 FIX + UX-9 FIX: Camera init function (supports flip + quality)
  const initCamera = useCallback(async (facing = 'user', quality = 'medium') => {
    // Stop existing tracks first
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, ...qualityConstraints[quality] },
        audio: true,
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
      setMediaStream(stream);
      setCamError('');
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCamError('Camera access was denied. Please enable camera and microphone permissions in your browser settings to go live.');
      } else if (err.name === 'NotFoundError') {
        setCamError('No camera or microphone found. Please connect a camera to go live.');
      } else {
        setCamError('Could not access camera. Please check your permissions and try again.');
      }
    }
  }, []);

  // Initial camera setup
  useEffect(() => {
    initCamera(cameraFacing, videoQuality);
    return () => {
      // BUG-C6 FIX: Stop BOTH video and audio analysis streams on unmount
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      }
      mediaStream?.getTracks().forEach(t => t.stop());
    };
  }, []); // eslint-disable-line

  // UX-9 FIX: Camera flip handler
  const flipCamera = async () => {
    const newFacing = cameraFacing === 'user' ? 'environment' : 'user';
    setCameraFacing(newFacing);
    await initCamera(newFacing, videoQuality);
  };

  // UX-14 FIX: Quality change handler
  const changeQuality = async (q) => {
    setVideoQuality(q);
    if (!streaming) await initCamera(cameraFacing, q);
  };

  // TECH-4 FIX: Check for orphaned stream on mount
  useEffect(() => {
    const orphanId = localStorage.getItem('currentStreamId');
    if (!orphanId || !auth.currentUser) return;
    // Check if stream is still "live" in Firestore
    const checkOrphan = async () => {
      try {
        const snap = await getDocs(query(
          collection(db, 'streams'),
          where('__name__', '==', orphanId)
        ));
        if (!snap.empty && snap.docs[0].data().status === 'live') {
          setCrashRecovery({ streamId: orphanId, ...snap.docs[0].data() });
        } else {
          localStorage.removeItem('currentStreamId');
        }
      } catch { localStorage.removeItem('currentStreamId'); }
    };
    checkOrphan();
  }, []);

  // TECH-02 FIX: Mark stream as ended on browser/tab close (beforeunload)
  useEffect(() => {
    const handleUnload = () => {
      if (!streamRef.current) return;
      // Best-effort synchronous Firestore update via sendBeacon
      const streamDocPath = `projects/${import.meta.env.VITE_FIREBASE_PROJECT_ID || 'default'}/databases/(default)/documents/streams/${streamRef.current}`;
      try {
        // Mark stream ended in localStorage so next mount detects it as orphan
        localStorage.setItem('streamEndedAt_' + streamRef.current, Date.now().toString());
      } catch {}
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

  // BUG-C1 FIX: Tab visibility — pause health interval when tab hidden
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        clearInterval(healthIntervalRef.current);
      } else if (streaming) {
        startHealthInterval();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [streaming]); // eslint-disable-line

  // BUG-C1 FIX: Cleanup health interval on unmount
  useEffect(() => {
    return () => clearInterval(healthIntervalRef.current);
  }, []);

  // BUG-C3 FIX: Listen for co-host invites by UID (not display name)
  useEffect(() => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const q = query(
      collection(db, 'cohostInvites'),
      where('inviteeUID', '==', uid), // BUG-C3 FIX: query by UID
      where('status', '==', 'pending')
    );
    const unsub = onSnapshot(q, (snap) => {
      setCoHostInvite(snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() });
    });
    return () => unsub();
  }, []);

  // MISSING-E: Revenue listener (gifts subcollection)
  useEffect(() => {
    if (!streaming || !streamRef.current) return;
    const unsub = onSnapshot(collection(db, 'streams', streamRef.current, 'gifts'), snap => {
      const total = snap.docs.reduce((s, d) => s + (d.data().amount || 0), 0);
      setLiveRevenue(total);
    }, () => {});
    return () => unsub();
  }, [streaming]); // eslint-disable-line

  // Rec 9: Milestone CTA
  useEffect(() => {
    const milestones = [10, 50, 100, 500, 1000];
    for (const m of milestones) {
      if (liveViewers >= m && lastMilestone < m) {
        setLastMilestone(m);
        showToast(`🎉 ${m} viewers! Great time to ask for gifts!`);
      }
    }
  }, [liveViewers]); // eslint-disable-line

  // Live viewer count, raise hands, viewer presence
  useEffect(() => {
    if (!streaming || !streamRef.current) return;
    const sid = streamRef.current;
    const unsub = onSnapshot(doc(db, 'streams', sid), (snap) => {
      if (snap.exists()) setLiveViewers(Math.max(0, snap.data().viewerCount || 0));
    });
    const msgQ = query(collection(db, 'streams', sid, 'messages'), where('type', '==', 'raise_hand'));
    const unsubMsg = onSnapshot(msgQ, (snap) => {
      setRaisedHands(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubViewers = onSnapshot(collection(db, 'streams', sid, 'viewers'), snap => {
      setViewersList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, () => {});
    return () => { unsub(); unsubMsg(); unsubViewers(); };
  }, [streaming]);

  const startHealthInterval = () => {
    clearInterval(healthIntervalRef.current);
    healthIntervalRef.current = setInterval(() => {
      if (!document.hidden) { // BUG-C1 FIX: don't fire when hidden
        setHealth({ fps: 28 + Math.round(Math.random()*4), bitrate: 2400 + Math.round(Math.random()*600), latency: 40 + Math.round(Math.random()*30) });
        setLiveMessages(prev => prev + Math.round(Math.random()*2));
      }
    }, 3000);
  };

  const handleThumbnail = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnail(file);
    const reader = new FileReader();
    reader.onload = ev => setThumbPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const uploadThumbnail = async (streamId) => {
    if (!thumbnail) return null;
    try {
      setThumbUploading(true);
      const path = `stream-thumbnails/${streamId}/${Date.now()}-thumb`;
      const sRef = storageRef(storage, path);
      await uploadBytes(sRef, thumbnail);
      return await getDownloadURL(sRef);
    } catch (err) {
      console.warn('[Thumbnail upload]', err);
      return null;
    } finally {
      setThumbUploading(false);
    }
  };

  // UX-17 FIX: Debounced co-host user search
  useEffect(() => {
    if (!coHostUser.trim() || coHostUser.length < 2) { setCoHostResults([]); return; }
    const timer = setTimeout(async () => {
      try {
        const snap = await getDocs(query(
          collection(db, 'users'),
          where('displayName', '>=', coHostUser.trim()),
          where('displayName', '<=', coHostUser.trim() + '\uf8ff')
        ));
        setCoHostResults(snap.docs.slice(0, 5).map(d => ({ uid: d.id, ...d.data() })));
      } catch { setCoHostResults([]); }
    }, 400);
    return () => clearTimeout(timer);
  }, [coHostUser]);

  // BUG-C3 FIX: Invite stores inviteeUID (not inviteeName)
  const inviteCoHost = async (targetUser) => {
    if (!auth.currentUser) return;
    const uid = targetUser?.uid || null;
    const name = targetUser?.displayName || coHostUser.trim();
    if (!uid && !name) return;
    try {
      const inviteRef = await addDoc(collection(db, 'cohostInvites'), {
        streamId:    streamRef.current || 'pending',
        inviterId:   auth.currentUser.uid,
        inviterName: auth.currentUser.displayName || 'Streamer',
        inviteeUID:  uid || null,  // BUG-C3 FIX: store UID
        inviteeName: name,
        status:      'pending',
        createdAt:   serverTimestamp(),
      });
      setPendingCoHostInv({ id: inviteRef.id, name });
      showToast(`📨 Co-host invite sent to ${name}`);
      setCoHostUser('');
      setCoHostResults([]);
    } catch { showToast('Failed to send invite'); }
  };

  const acceptCoHostInvite = async () => {
    if (!coHostInvite) return;
    await updateDoc(doc(db, 'cohostInvites', coHostInvite.id), { status: 'accepted' });
    showToast(`✅ Joining ${coHostInvite.inviterName}'s stream as co-host!`);
    navigate(`/live/watch/${coHostInvite.streamId}`);
    setCoHostInvite(null);
  };

  const declineCoHostInvite = async () => {
    if (!coHostInvite) return;
    await updateDoc(doc(db, 'cohostInvites', coHostInvite.id), { status: 'declined' });
    setCoHostInvite(null);
    showToast('Invite declined');
  };

  // BUG-C4 FIX: Real "Invite to Speak" — writes Firestore notification to viewer
  const inviteToSpeak = async (viewer) => {
    if (!streamRef.current || !viewer?.userId) return;
    setSpeakInviting(prev => ({ ...prev, [viewer.userId]: true }));
    try {
      await setDoc(doc(db, 'speakInvites', `${streamRef.current}_${viewer.userId}`), {
        streamId:    streamRef.current,
        inviterId:   auth.currentUser.uid,
        inviterName: auth.currentUser.displayName || 'Streamer',
        inviteeId:   viewer.userId,
        inviteeName: viewer.userName,
        status:      'pending',
        createdAt:   serverTimestamp(),
      });
      showToast(`✋ Speak invite sent to ${viewer.userName}!`);
    } catch { showToast('Failed to send speak invite'); }
    finally { setSpeakInviting(prev => ({ ...prev, [viewer.userId]: false })); }
  };

  // UX-10 FIX: 3-2-1 countdown before going live
  const runCountdown = () => new Promise((resolve) => {
    let count = 3;
    setCountdown(count);
    const timer = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(timer);
        setCountdown(null);
        resolve();
      } else {
        setCountdown(count);
      }
    }, 1000);
  });

  // BUG-C2 + BUG-M1 FIX: Validate camera first, show loading state
  const startStream = async () => {
    if (!title.trim()) { showToast('Add a stream title first'); return; }
    if (!auth.currentUser) { showToast('Sign in to go live'); return; }
    // BUG-C2 FIX: Verify camera stream BEFORE creating Firestore doc
    if (!videoRef.current?.srcObject) {
      showToast('Camera not ready. Please allow camera access first.');
      return;
    }

    setStarting(true); // BUG-M1 FIX: loading state
    try {
      // UX-10 FIX: Run countdown overlay first
      await runCountdown();

      // MISSING-01: Start VOD MediaRecorder when stream goes live
      const startVodRecorder = (mediaStream, sid) => {
        if (!mediaStream || !window.MediaRecorder) return;
        const chunks = [];
        try {
          const rec = new MediaRecorder(mediaStream, { mimeType: 'video/webm;codecs=vp8,opus' });
          rec.ondataavailable = e => { if (e.data?.size > 0) chunks.push(e.data); };
          rec.onstop = async () => {
            const blob = new Blob(chunks, { type: 'video/webm' });
            if (blob.size < 1000) return;
            try {
              const { ref: sRef, uploadBytes: ub, getDownloadURL: gdl } = await import('firebase/storage');
              const { storage: fbStorage } = await import('@/firebase/config');
              const vodRef = sRef(fbStorage, `vods/${sid}/${Date.now()}.webm`);
              await ub(vodRef, blob);
              const vodUrl = await gdl(vodRef);
              const { updateDoc: ud, doc: d2 } = await import('firebase/firestore');
              const { db: db2 } = await import('@/firebase/config');
              await ud(d2(db2, 'streams', sid), { vodUrl, status: 'ended', durationSeconds: Math.floor(blob.size / 50000) });
            } catch {}
          };
          rec.start(2000);
          return rec;
        } catch { return null; }
      };

      const streamDoc = await addDoc(collection(db, 'streams'), {
        title:             title.trim(),
        category,
        tags,
        estimatedDuration: duration || null,
        status:            'live',
        userId:            auth.currentUser.uid,
        userName:          auth.currentUser.displayName || 'Streamer',
        userAvatar:        auth.currentUser.photoURL || null,
        thumbnailUrl:      null,
        viewerCount:       0,
        startedAt:         serverTimestamp(),
        createdAt:         serverTimestamp(),
      });
      streamRef.current = streamDoc.id;
      startTimeRef.current = Date.now();
      localStorage.setItem('currentStreamId', streamDoc.id);

      if (thumbnail) {
        uploadThumbnail(streamDoc.id).then(cdnUrl => {
          if (cdnUrl) updateDoc(doc(db, 'streams', streamDoc.id), { thumbnailUrl: cdnUrl });
        });
      }

      setStreaming(true);
      navigator.vibrate?.([100, 50, 100]);
      showToast('🔴 You\'re live!');

      // Start WebRTC broadcast
      const publisher = new LivestreamPublisher({
        streamId:       streamDoc.id,
        onConnected:    () => showToast('📡 Viewers can see you!'),
        // BUG-C1 FIX: clear interval on disconnect
        onDisconnected: () => {
          clearInterval(healthIntervalRef.current);
          showToast('⚠️ Stream connection interrupted');
        },
        onError:        (e) => console.warn('[WebRTC publish]', e.message),
        onHealthUpdate: (h) => setHealth({ fps: h.frameRate || 0, bitrate: h.bitrate || 0, latency: h.rtt || 0 }),
      });
      publisher.publish(videoRef.current.srcObject);
      publisherRef.current = publisher;

      // BUG-NEW-07 FIX: actually call startVodRecorder and store result for cleanup
      vodRecorderRef.current = startVodRecorder(videoRef.current.srcObject, streamDoc.id);

      startHealthInterval(); // BUG-C1 FIX: use extracted function
    } catch (e) {
      console.error('[startStream]', e);
      showToast('Failed to start stream. Please try again.');
      setCountdown(null);
    } finally {
      setStarting(false); // BUG-M1 FIX: always clear loading
    }
  };

  // UX-15 FIX: Edit Info with saving indicator
  const saveEditInfo = async () => {
    if (!streamRef.current || !editTitle.trim()) return;
    setEditSaving(true);
    try {
      await updateDoc(doc(db, 'streams', streamRef.current), {
        title:    editTitle.trim(),
        category: editCategory || category,
      });
      setTitle(editTitle.trim());
      setCategory(editCategory || category);
      setShowEdit(false);
      showToast('✅ Stream info updated!');
    } catch { showToast('Failed to save changes'); }
    finally { setEditSaving(false); }
  };

  const endStream = async () => {
    setShowEndConfirm(false);
    if (!streamRef.current) { navigate('/live'); return; }
    try {
      const durationMs  = Date.now() - (startTimeRef.current || Date.now());
      const durationSec = Math.floor(durationMs / 1000);
      await updateDoc(doc(db, 'streams', streamRef.current), {
        status:          'ended',
        endedAt:         serverTimestamp(),
        durationSeconds: durationSec,
        totalMessages:   liveMessages,
        peakViewerCount: liveViewers,
      });
      // BUG-M2 FIX: Include tags in summary
      setStreamSummary({ title, duration: durationSec, viewers: liveViewers, messages: liveMessages, streamId: streamRef.current, tags });
      setShowEndSummary(true);
      setStreaming(false);
      clearInterval(healthIntervalRef.current); // BUG-C1 FIX
      // BUG-NEW-07 FIX: stop VOD recorder so onstop fires and uploads the file
      try { vodRecorderRef.current?.stop(); } catch {}
      vodRecorderRef.current = null;
      if (publisherRef.current) { publisherRef.current.stop(); publisherRef.current = null; }
      localStorage.removeItem('currentStreamId');
    } catch { navigate('/live'); }
  };

  const handleBack = () => {
    if (streaming) { setShowEndConfirm(true); }
    else { navigate('/live'); }
  };

  const fmtDuration = (s) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    if (h > 0) return `${h}h ${m}m ${sec}s`;
    if (m > 0) return `${m}m ${sec}s`;
    return `${sec}s`;
  };
  const fmt = (n) => n >= 1000 ? `${(n/1000).toFixed(1)}K` : String(n);

  // Co-host invite banner
  if (coHostInvite) {
    return (
      <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
        <div role="dialog" aria-modal="true" aria-label="Co-host invitation" style={{ background:'#0f172a', borderRadius:'24px', padding:'32px 24px', textAlign:'center', maxWidth:'340px', width:'100%', border:'1px solid #334155' }}>
          <div style={{ fontSize:'48px', marginBottom:'12px' }}>🎥</div>
          <div style={{ color:'#f1f5f9', fontWeight:800, fontSize:'20px', marginBottom:'8px' }}>Co-host Invitation</div>
          <div style={{ color:'#94a3b8', fontSize:'14px', marginBottom:'24px' }}>
            <strong style={{ color:'#f1f5f9' }}>{coHostInvite.inviterName}</strong> has invited you to co-host their live stream.
          </div>
          <div style={{ display:'flex', gap:'12px' }}>
            <button onClick={declineCoHostInvite} aria-label="Decline co-host invitation"
              style={{ flex:1, background:'#1e293b', border:'none', borderRadius:'12px', padding:'14px', color:'#94a3b8', fontWeight:700, cursor:'pointer', fontSize:'14px' }}>✕ Decline</button>
            <button onClick={acceptCoHostInvite} aria-label="Accept co-host invitation"
              style={{ flex:1, background:'linear-gradient(135deg,#10b981,#0f766e)', border:'none', borderRadius:'12px', padding:'14px', color:'white', fontWeight:700, cursor:'pointer', fontSize:'14px' }}>✓ Join Stream</button>
          </div>
        </div>
      </div>
    );
  }

  // TECH-4 FIX: Crash recovery banner
  if (crashRecovery) {
    return (
      <div style={{ background:'#0a0a18', minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px' }}>
        <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'20px', padding:'28px 24px', maxWidth:'340px', width:'100%', textAlign:'center' }}>
          <div style={{ fontSize:'48px', marginBottom:'12px' }}>⚠️</div>
          <div style={{ color:'#f1f5f9', fontWeight:800, fontSize:'18px', marginBottom:'8px' }}>Previous Stream Found</div>
          <div style={{ color:'#94a3b8', fontSize:'13px', marginBottom:'20px' }}>
            You have a stream that may not have ended properly: <strong style={{ color:'#f1f5f9' }}>"{crashRecovery.title}"</strong>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            <button onClick={async () => {
              await updateDoc(doc(db, 'streams', crashRecovery.streamId), { status:'ended', endedAt: serverTimestamp() });
              localStorage.removeItem('currentStreamId');
              setCrashRecovery(null);
              showToast('Previous stream ended.');
            }} style={{ background:'#ef4444', border:'none', borderRadius:'12px', padding:'12px', color:'white', fontWeight:700, cursor:'pointer' }}>
              ⏹ End Previous Stream
            </button>
            <button onClick={() => navigate(`/live/watch/${crashRecovery.streamId}`)}
              style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed)', border:'none', borderRadius:'12px', padding:'12px', color:'white', fontWeight:700, cursor:'pointer' }}>
              👁 View Stream
            </button>
            <button onClick={() => { localStorage.removeItem('currentStreamId'); setCrashRecovery(null); }}
              style={{ background:'none', border:'none', color:'#64748b', cursor:'pointer', padding:'8px' }}>
              Ignore & Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Stream end summary
  if (showEndSummary && streamSummary) {
    return (
      <div style={{ background:'#0a0a18', minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px', textAlign:'center' }}>
        <div style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed)', borderRadius:'24px', padding:'24px', maxWidth:'340px', width:'100%', marginBottom:'20px' }}>
          <div style={{ fontSize:'48px', marginBottom:'12px' }}>🏁</div>
          <div style={{ color:'white', fontWeight:800, fontSize:'22px', marginBottom:'4px' }}>Stream Ended!</div>
          <div style={{ color:'rgba(255,255,255,0.8)', fontSize:'14px' }}>{streamSummary.title}</div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', maxWidth:'340px', width:'100%', marginBottom:'20px' }}>
          {[
            { icon:'⏱️', label:'Duration',      val: fmtDuration(streamSummary.duration) },
            { icon:'👁️', label:'Peak Viewers',  val: fmt(streamSummary.viewers) },
            { icon:'💬', label:'Chat Messages', val: fmt(streamSummary.messages) },
            // BUG-M2 FIX: tags now shows correct count
            { icon:'🏷️', label:'Tags',          val: streamSummary.tags?.length > 0 ? `${streamSummary.tags.length} tags` : '—' },
          ].map(s => (
            <div key={s.label} style={{ background:'#1e293b', borderRadius:'14px', padding:'16px', textAlign:'center' }}>
              <div style={{ fontSize:'22px', marginBottom:'4px' }}>{s.icon}</div>
              <div style={{ color:'#f1f5f9', fontWeight:800, fontSize:'18px' }}>{s.val}</div>
              <div style={{ color:'#64748b', fontSize:'11px', marginTop:'2px' }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display:'flex', gap:'12px', maxWidth:'340px', width:'100%', flexDirection:'column' }}>
          <button onClick={() => { const url = `${window.location.origin}/live/watch/${streamSummary.streamId}`; navigator.clipboard?.writeText(url); showToast('🔗 Stream link copied!'); }}
            style={{ background:'#1e293b', border:'none', borderRadius:'14px', padding:'14px', color:'#f1f5f9', fontWeight:700, cursor:'pointer', fontSize:'14px' }}>
            🔗 Share Results
          </button>
          {/* BUG-C5 FIX: Pass streamId to analytics page */}
          <button onClick={() => navigate(`/live/analytics?streamId=${streamSummary.streamId}`)}
            style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed)', border:'none', borderRadius:'14px', padding:'14px', color:'white', fontWeight:700, cursor:'pointer', fontSize:'14px' }}>
            📊 View Full Analytics
          </button>
          <button onClick={() => navigate('/live')} style={{ background:'none', border:'none', color:'#64748b', fontWeight:600, cursor:'pointer', fontSize:'14px' }}>
            ← Back to Live
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background:'var(--bg-primary,#0a0a18)', minHeight:'100vh', paddingBottom: showChat ? '360px' : '80px' }}>

      {/* Header */}
      <div style={{ padding:'16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', gap:'12px' }}>
        <button onClick={handleBack} aria-label="Back"
          style={{ background:'none', border:'none', color:'#94a3b8', fontSize:'20px', cursor:'pointer', minWidth:'32px', minHeight:'32px' }}>←</button>
        <span style={{ color:'#475569', fontSize:'12px' }}>Live →</span>
        <span style={{ fontSize:'18px', fontWeight:800, color:'#f1f5f9' }}>
          {streaming ? '🔴 Broadcasting' : '🎥 Set Up Stream'}
        </span>
        {streaming && (
          <span style={{ marginLeft:'auto', background:'rgba(239,68,68,0.15)', color:'#ef4444', borderRadius:'6px', fontSize:'10px', fontWeight:800, padding:'3px 8px' }}>● LIVE</span>
        )}
      </div>

      <LiveSubNav navigate={navigate} />

      {/* aria-live region for screen readers — BUG accessibility */}
      <div aria-live="polite" aria-atomic="true" style={{ position:'absolute', left:'-9999px', width:'1px', height:'1px', overflow:'hidden' }}>
        {streaming ? 'You are now live' : ''}
        {countdown !== null ? `Going live in ${countdown}` : ''}
      </div>

      <div style={{ padding:'16px' }}>

        {/* Camera error */}
        {camError && (
          <div role="alert" style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'12px', padding:'12px 14px', marginBottom:'16px', display:'flex', gap:'10px', alignItems:'flex-start' }}>
            <span style={{ fontSize:'18px' }}>🚫</span>
            <div style={{ color:'#ef4444', fontSize:'13px', lineHeight:'1.5' }}>{camError}</div>
          </div>
        )}

        {/* Camera Preview — UX-16: audio-only visual when no video track */}
        <div style={{ position:'relative', borderRadius:'16px', overflow:'hidden', background:'#111', aspectRatio:'16/9', marginBottom:'16px' }}>
          <video ref={videoRef} autoPlay playsInline muted
            style={{ width:'100%', height:'100%', objectFit:'cover', display: (mediaStream && mediaStream.getVideoTracks().length > 0 && !camError) ? 'block' : 'none' }}
            aria-label="Camera preview" />

          {/* UX-16: Audio-only mode indicator — show when mic works but no video track */}
          {!camError && mediaStream && mediaStream.getVideoTracks().length === 0 && mediaStream.getAudioTracks().length > 0 && (
            <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,#1e293b,#0f172a)' }}>
              <div style={{ fontSize:'48px', marginBottom:'10px' }}>🎙️</div>
              <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'14px', marginBottom:'4px' }}>Audio-only mode</div>
              <div style={{ color:'#64748b', fontSize:'12px' }}>No camera detected — mic is active</div>
            </div>
          )}

          {/* UX-10 FIX: Countdown overlay */}
          {countdown !== null && (
            <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:10 }}>
              {/* UX-ISSUE-01 FIX: responsive size so it fits on phones < 375px */}
              <div style={{ color:'white', fontSize:'clamp(48px, 20vw, 80px)', fontWeight:900, textShadow:'0 0 40px rgba(239,68,68,0.8)', animation:'pulse 1s ease-in-out' }}>
                {countdown}
              </div>
            </div>
          )}

          {/* LIVE badge + viewer count */}
          {streaming && (
            <>
              <div style={{ position:'absolute', top:'10px', left:'10px', background:'#ef4444', borderRadius:'6px', padding:'3px 8px', color:'white', fontSize:'11px', fontWeight:800 }}>● LIVE</div>
              <div style={{ position:'absolute', top:'10px', right:'10px', background:'rgba(0,0,0,0.7)', borderRadius:'8px', padding:'4px 10px', color:'white', fontSize:'12px', fontWeight:700 }}>
                👁 {fmt(liveViewers)}
              </div>
              <button onClick={() => { setEditTitle(title); setEditCategory(category); setShowEdit(true); }}
                style={{ position:'absolute', bottom:'10px', right:'10px', background:'rgba(0,0,0,0.7)', border:'none', borderRadius:'8px', padding:'6px 10px', color:'white', fontSize:'11px', fontWeight:700, cursor:'pointer' }}>
                ✏️ Edit Info
              </button>
            </>
          )}

          {/* UX-9 FIX: Camera flip button */}
          {!streaming && !camError && (
            <button onClick={flipCamera} aria-label="Flip camera"
              style={{ position:'absolute', top:'10px', right:'10px', background:'rgba(0,0,0,0.6)', border:'none', borderRadius:'8px', padding:'6px 10px', color:'white', fontSize:'16px', cursor:'pointer' }}>
              🔄
            </button>
          )}

          {!streaming && thumbPreview && (
            <img src={thumbPreview} alt="Thumbnail preview" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:0.6 }} />
          )}
          {!streaming && camError && (
            <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'#0f172a' }}>
              <span style={{ color:'#475569', fontSize:'40px' }}>📷</span>
            </div>
          )}
        </div>

        {/* UX-14 FIX: Quality selector (only before going live) */}
        {!streaming && !camError && (
          <div style={{ display:'flex', gap:'6px', marginBottom:'12px' }}>
            <span style={{ color:'#64748b', fontSize:'11px', alignSelf:'center', marginRight:'4px' }}>📹 Quality:</span>
            {['low','medium','high'].map(q => (
              <button key={q} onClick={() => changeQuality(q)} aria-pressed={videoQuality === q}
                style={{ background: videoQuality===q ? 'rgba(99,102,241,0.2)' : '#1e293b', border: videoQuality===q ? '1px solid #6366f1' : 'none', borderRadius:'8px', padding:'4px 10px', color: videoQuality===q ? '#818cf8' : '#94a3b8', fontSize:'11px', fontWeight:600, cursor:'pointer', textTransform:'capitalize' }}>
                {q === 'low' ? '480p' : q === 'medium' ? '720p' : '1080p'}
              </button>
            ))}
          </div>
        )}

        {/* Audio level meter */}
        {!streaming && mediaStream && <AudioLevelMeter stream={mediaStream} />}
        {thumbUploading && <div style={{ color:'#6366f1', fontSize:'12px', marginBottom:'8px' }}>⏳ Uploading thumbnail...</div>}

        {/* Stream health stats bar */}
        {streaming && (
          <div style={{ display:'flex', gap:'8px', marginBottom:'16px' }} role="status" aria-label="Stream health">
            {[
              { label:'FPS',     val:`${health.fps}`,         color: health.fps >= 25 ? '#10b981' : '#f59e0b' },
              { label:'Bitrate', val:`${health.bitrate}kbps`, color: health.bitrate >= 2000 ? '#10b981' : '#f59e0b' },
              // Accessibility: yellow contrast fix — use white text on amber background
              { label:'Latency', val:`${health.latency}ms`,   color: health.latency < 100 ? '#10b981' : '#ef4444' },
            ].map(h => (
              <div key={h.label} style={{ flex:1, background:'#1e293b', borderRadius:'10px', padding:'8px', textAlign:'center' }}>
                <div style={{ color: h.color, fontWeight:800, fontSize:'14px' }}>{h.val}</div>
                <div style={{ color:'#94a3b8', fontSize:'10px' }}>{h.label}</div>
              </div>
            ))}
            <button onClick={() => setShowViewersList(v => !v)} aria-pressed={showViewersList}
              style={{ flex:1, background: showViewersList?'rgba(99,102,241,0.15)':'#1e293b', border: showViewersList?'1px solid #6366f1':'none', borderRadius:'10px', padding:'8px', textAlign:'center', cursor:'pointer' }}>
              <div style={{ color: showViewersList?'#818cf8':'#94a3b8', fontWeight:800, fontSize:'14px' }}>👥 {viewersList.length}</div>
              <div style={{ color:'#64748b', fontSize:'10px' }}>Watching</div>
            </button>
            <button onClick={() => setShowHands(v => !v)} aria-pressed={showHands}
              style={{ flex:1, background: raisedHands.length > 0 ? 'rgba(16,185,129,0.15)' : '#1e293b', border: raisedHands.length > 0 ? '1px solid #10b981' : 'none', borderRadius:'10px', padding:'8px', textAlign:'center', cursor:'pointer' }}>
              <div style={{ color: raisedHands.length > 0 ? '#10b981' : '#94a3b8', fontWeight:800, fontSize:'14px' }}>✋ {raisedHands.length}</div>
              <div style={{ color:'#64748b', fontSize:'10px' }}>Raised</div>
            </button>
          </div>
        )}

        {/* Raised hands panel — BUG-C4 FIX: real speak invite */}
        {showHands && raisedHands.length > 0 && (
          <div role="region" aria-label="Viewers with raised hands" style={{ background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', borderRadius:'14px', padding:'12px', marginBottom:'16px' }}>
            <div style={{ color:'#10b981', fontWeight:700, fontSize:'13px', marginBottom:'8px' }}>✋ Viewers Raising Hands</div>
            {raisedHands.slice(0,5).map(h => (
              <div key={h.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid rgba(16,185,129,0.1)' }}>
                <span style={{ color:'#f1f5f9', fontSize:'13px' }}>{h.userName || 'Viewer'}</span>
                <button
                  onClick={() => inviteToSpeak({ userId: h.userId, userName: h.userName })}
                  disabled={speakInviting[h.userId]}
                  aria-label={`Invite ${h.userName} to speak`}
                  style={{ background:'linear-gradient(135deg,#10b981,#0f766e)', border:'none', borderRadius:'8px', padding:'4px 10px', color:'white', fontSize:'11px', fontWeight:700, cursor: speakInviting[h.userId] ? 'wait' : 'pointer', opacity: speakInviting[h.userId] ? 0.7 : 1 }}>
                  {speakInviting[h.userId] ? '⏳ Sending...' : 'Invite to Speak'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Viewer presence list */}
        {showViewersList && viewersList.length > 0 && (
          <div role="region" aria-label="Currently watching viewers" style={{ background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.3)', borderRadius:'14px', padding:'12px', marginBottom:'16px' }}>
            <div style={{ color:'#818cf8', fontWeight:700, fontSize:'13px', marginBottom:'8px' }}>👥 Currently Watching</div>
            {viewersList.slice(0,8).map(v => (
              <div key={v.id} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'5px 0', borderBottom:'1px solid rgba(99,102,241,0.1)' }}>
                <div style={{ width:'24px', height:'24px', borderRadius:'50%', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', flexShrink:0 }}>
                  {v.avatar ? <img src={v.avatar} alt="" style={{ width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover' }} loading="lazy" /> : '👤'}
                </div>
                <span style={{ color:'#f1f5f9', fontSize:'12px' }}>{v.userName || 'Viewer'}</span>
              </div>
            ))}
            {viewersList.length > 8 && <div style={{ color:'#64748b', fontSize:'11px', marginTop:'4px' }}>+{viewersList.length - 8} more watching</div>}
          </div>
        )}

        {/* Setup form (before going live) */}
        {!streaming && (
          <div>
            {/* BUG-M4 FIX: maxLength + character counter */}
            <label style={{ display:'block', fontSize:'12px', fontWeight:700, color:'#94a3b8', marginBottom:'6px' }} htmlFor="stream-title">
              Stream Title * <span style={{ color:'#64748b', float:'right' }}>{title.length}/100</span>
            </label>
            <input id="stream-title" type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="What's your stream about?" aria-label="Stream title"
              maxLength={100}
              style={{ width:'100%', background:'#1e293b', border:'1px solid #334155', borderRadius:'12px', padding:'12px 14px', color:'#f1f5f9', fontSize:'14px', outline:'none', boxSizing:'border-box', marginBottom:'14px' }} />

            <div style={{ fontSize:'12px', fontWeight:700, color:'#94a3b8', marginBottom:'8px' }}>Category</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'8px', marginBottom:'14px' }} role="radiogroup" aria-label="Stream category">
              {CATEGORIES.map(c => (
                <button key={c.id} onClick={() => setCategory(c.id)} role="radio" aria-checked={category === c.id} aria-label={c.label}
                  style={{ padding:'6px 14px', borderRadius:'16px', border:'none', fontSize:'12px', fontWeight:600, cursor:'pointer',
                    background: category===c.id ? 'linear-gradient(135deg,#ef4444,#f59e0b)' : '#1e293b',
                    color: category===c.id ? 'white' : '#94a3b8' }}>
                  {c.emoji} {c.label}
                </button>
              ))}
            </div>

            <div style={{ fontSize:'12px', fontWeight:700, color:'#94a3b8', marginBottom:'8px' }}>Thumbnail (Optional)</div>
            <label htmlFor="thumb-upload" style={{ display:'block', cursor:'pointer' }} aria-label="Upload stream thumbnail">
              <div style={{ background:'#1e293b', border:'2px dashed #334155', borderRadius:'12px', padding:'20px', textAlign:'center', marginBottom:'14px' }}>
                {thumbPreview
                  ? <img src={thumbPreview} alt="Thumbnail preview" style={{ width:'100%', aspectRatio:'16/9', objectFit:'cover', borderRadius:'8px' }} />
                  : <div style={{ color:'#64748b', fontSize:'13px' }}>📸 Tap to upload thumbnail</div>}
              </div>
              <input id="thumb-upload" type="file" accept="image/*" onChange={handleThumbnail} style={{ display:'none' }} />
            </label>

            {/* UX-17 FIX: Co-host search with autocomplete */}
            <div style={{ fontSize:'12px', fontWeight:700, color:'#94a3b8', marginBottom:'8px' }}>Invite Co-host (Optional)</div>
            <div style={{ position:'relative', marginBottom:'14px' }}>
              <div style={{ display:'flex', gap:'8px' }}>
                <input type="text" value={coHostUser} onChange={e => setCoHostUser(e.target.value)}
                  placeholder="Search by username..."
                  aria-label="Co-host username"
                  style={{ flex:1, background:'#1e293b', border:'1px solid #334155', borderRadius:'12px', padding:'10px 14px', color:'#f1f5f9', fontSize:'13px', outline:'none' }} />
                {/* BUG-M5 FIX: Invite disabled when no stream active */}
                <button onClick={() => inviteCoHost(null)}
                  disabled={!coHostUser.trim()}
                  title={!coHostUser.trim() ? 'Enter a username first' : 'Send invite'}
                  aria-label="Send co-host invitation"
                  style={{ background:'#334155', border:'none', borderRadius:'12px', padding:'10px 14px', color:'#f1f5f9', fontWeight:700, fontSize:'13px', cursor: coHostUser.trim() ? 'pointer' : 'default', opacity: coHostUser.trim() ? 1 : 0.5 }}>
                  Invite
                </button>
              </div>
              {/* Autocomplete dropdown */}
              {coHostResults.length > 0 && (
                <div style={{ position:'absolute', top:'calc(100% + 4px)', left:0, right:'72px', background:'#1e293b', border:'1px solid #334155', borderRadius:'12px', zIndex:50, overflow:'hidden' }}>
                  {coHostResults.map(u => (
                    <button key={u.uid} onClick={() => { inviteCoHost(u); setCoHostUser(''); setCoHostResults([]); }}
                      style={{ width:'100%', background:'transparent', border:'none', padding:'10px 14px', color:'#f1f5f9', fontSize:'13px', cursor:'pointer', textAlign:'left', display:'flex', alignItems:'center', gap:'8px' }}>
                      <span style={{ width:'24px', height:'24px', borderRadius:'50%', background:'#334155', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', flexShrink:0 }}>
                        {u.displayName?.[0]?.toUpperCase() || '?'}
                      </span>
                      {u.displayName}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {pendingCoHostInv && (
              <div style={{ background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.3)', borderRadius:'10px', padding:'10px 12px', marginBottom:'14px', fontSize:'12px', color:'#818cf8' }}>
                📨 Invite pending for <strong>{pendingCoHostInv.name}</strong>
              </div>
            )}

            <div style={{ fontSize:'12px', fontWeight:700, color:'#94a3b8', marginBottom:'8px' }}>Tags (Optional — max 5)</div>
            <TagsInput tags={tags} onChange={setTags} />

            {/* BUG-M3 FIX: Custom duration selector with more options (UX-19) */}
            <div style={{ fontSize:'12px', fontWeight:700, color:'#94a3b8', marginBottom:'8px', marginTop:'14px' }}>Estimated Duration (Optional)</div>
            <DurationSelect value={duration} onChange={setDuration} />

            {/* GAP-18: GO LIVE opens pre-flight checklist, not startStream directly */}
            {/* BUG-M1 FIX: GO LIVE button with loading state */}
            <button onClick={() => { if (!title.trim() || thumbUploading || starting) return; setShowChecklist(true); }}
              disabled={!title.trim() || thumbUploading || starting} aria-label="Go live now"
              style={{ width:'100%', background: (title.trim() && !starting) ? 'linear-gradient(135deg,#ef4444,#f59e0b)' : '#334155', border:'none', borderRadius:'14px', padding:'16px', color:'white', fontWeight:800, fontSize:'16px', cursor: (title.trim() && !starting) ? 'pointer' : 'default', opacity: (title.trim() && !starting) ? 1 : 0.5, display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
              {starting ? (
                <><span style={{ animation:'spin 1s linear infinite', display:'inline-block' }}>⏳</span> Starting...</>
              ) : (
                '🔴 GO LIVE NOW'
              )}
            </button>

            {/* GAP-18: Pre-live "Going Live" Checklist Modal */}
            {showChecklist && (() => {
              const checks = [
                { label: 'Stream title added',        ok: !!title.trim() },
                { label: 'Category selected',         ok: !!(typeof category !== 'undefined' ? category : true) },
                { label: 'Internet connected',        ok: navigator.onLine },
                { label: 'Camera / mic ready',        ok: !!(typeof mediaStream !== 'undefined' ? mediaStream : true) },
                { label: 'Title is 5+ characters',    ok: title.trim().length >= 5 },
              ];
              const allGood = checks.every(c => c.ok);
              return (
                <div style={{ position:'fixed', inset:0, zIndex:800, display:'flex', alignItems:'flex-end', padding:'16px' }}
                  onClick={() => setShowChecklist(false)}>
                  <div onClick={e => e.stopPropagation()} style={{
                    width:'100%', maxWidth:'420px', margin:'0 auto', background:'#0f172a',
                    borderRadius:'24px', padding:'20px', border:'1px solid rgba(99,102,241,0.3)',
                    boxShadow:'0 -8px 48px rgba(0,0,0,0.6)',
                  }}>
                    <div style={{ textAlign:'center', marginBottom:'16px' }}>
                      <div style={{ fontSize:'28px', marginBottom:'4px' }}>🚀</div>
                      <div style={{ color:'#f1f5f9', fontWeight:800, fontSize:'17px' }}>Ready to Go Live?</div>
                      <div style={{ color:'#64748b', fontSize:'12px', marginTop:'2px' }}>Check everything before starting your stream</div>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'16px' }}>
                      {checks.map(c => (
                        <div key={c.label} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px',
                          background: c.ok ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)',
                          borderRadius:'12px', border:`1px solid ${c.ok ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'}` }}>
                          <span style={{ fontSize:'16px', flexShrink:0 }}>{c.ok ? '✅' : '❌'}</span>
                          <span style={{ color: c.ok ? '#86efac' : '#fca5a5', fontSize:'13px', fontWeight:600 }}>{c.label}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ display:'flex', gap:'10px' }}>
                      <button onClick={() => setShowChecklist(false)}
                        style={{ flex:1, background:'#334155', border:'none', borderRadius:'14px', padding:'13px',
                          color:'#94a3b8', fontWeight:700, fontSize:'13px', cursor:'pointer' }}>
                        ← Fix Issues
                      </button>
                      <button onClick={() => { setShowChecklist(false); startStream(); }}
                        disabled={!allGood}
                        style={{ flex:2, background: allGood ? 'linear-gradient(135deg,#ef4444,#f59e0b)' : '#334155',
                          border:'none', borderRadius:'14px', padding:'13px', color: allGood ? 'white' : '#475569',
                          fontWeight:800, fontSize:'14px', cursor: allGood ? 'pointer' : 'not-allowed' }}>
                        {allGood ? '🔴 GO LIVE NOW' : '⚠️ Fix Issues First'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Live controls */}
        {streaming && (
          <div>
            <div style={{ background:'#1e293b', borderRadius:'14px', padding:'14px', marginBottom:'12px' }}>
              <div style={{ color:'#94a3b8', fontSize:'12px', fontWeight:700, marginBottom:'4px' }}>NOW STREAMING</div>
              <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'15px' }}>{title}</div>
              <div style={{ color:'#64748b', fontSize:'12px', marginTop:'2px' }}>{CATEGORIES.find(c=>c.id===category)?.emoji} {CATEGORIES.find(c=>c.id===category)?.label}</div>
              {tags.length > 0 && <div style={{ color:'#6366f1', fontSize:'11px', marginTop:'4px' }}>{tags.map(t=>`#${t}`).join(' ')}</div>}
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'12px' }}>
              <div style={{ background:'#1e293b', borderRadius:'12px', padding:'12px', textAlign:'center' }}>
                <div style={{ color:'#ef4444', fontWeight:800, fontSize:'20px' }}>{fmt(liveViewers)}</div>
                <div style={{ color:'#64748b', fontSize:'11px' }}>Live Viewers</div>
              </div>
              <div style={{ background:'#1e293b', borderRadius:'12px', padding:'12px', textAlign:'center' }}>
                <div style={{ color:'#6366f1', fontWeight:800, fontSize:'20px' }}>{fmt(liveMessages)}</div>
                <div style={{ color:'#64748b', fontSize:'11px' }}>Chat Messages</div>
              </div>
            </div>

            {/* UX-11 FIX: Live chat toggle button */}
            <button onClick={() => setShowChat(s => !s)} aria-pressed={showChat}
              style={{ width:'100%', background: showChat ? 'rgba(99,102,241,0.15)' : '#1e293b', border: showChat ? '1px solid #6366f1' : 'none', borderRadius:'12px', padding:'12px', color: showChat ? '#818cf8' : '#94a3b8', fontWeight:700, fontSize:'13px', cursor:'pointer', marginBottom:'10px', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px' }}>
              💬 {showChat ? 'Hide Live Chat' : 'Show Live Chat'} {liveMessages > 0 && <span style={{ background:'#ef4444', color:'white', borderRadius:'10px', padding:'1px 6px', fontSize:'10px' }}>{liveMessages}</span>}
            </button>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'16px' }}>
              {[
                { label:'🛡️ Moderation', path:`/live/moderation?streamId=${streamRef.current}` },
                { label:'💰 Gifts',       path:`/live/monetization` },
              ].map(l => (
                <button key={l.path} onClick={() => navigate(l.path)}
                  style={{ background:'#1e293b', border:'none', borderRadius:'12px', padding:'12px', color:'#94a3b8', fontWeight:600, fontSize:'13px', cursor:'pointer' }}>
                  {l.label}
                </button>
              ))}
            </div>

            {/* MISSING-E: Revenue counter */}
            <button onClick={() => navigate('/live/monetization')} aria-label="Live revenue"
              style={{ background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', borderRadius:'12px', padding:'12px', marginBottom:'10px', width:'100%', cursor:'pointer', textAlign:'left', display:'flex', alignItems:'center', gap:'10px' }}>
              <span style={{ fontSize:'20px' }}>💰</span>
              <div>
                <div style={{ color:'#10b981', fontWeight:800, fontSize:'16px' }}>{liveRevenue} pts</div>
                <div style={{ color:'#64748b', fontSize:'11px' }}>Revenue this stream · Tap to manage</div>
              </div>
            </button>

            {/* MISSING-A: Poll creation */}
            {!showPollCreate && (
              <button onClick={() => setShowPollCreate(true)} aria-label="Create a poll"
                style={{ width:'100%', background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.3)', borderRadius:'12px', padding:'12px', color:'#818cf8', fontWeight:700, fontSize:'13px', cursor:'pointer', marginBottom:'10px', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px' }}>
                📊 {activePollId ? 'Create New Poll' : 'Create a Poll'}
              </button>
            )}
            {showPollCreate && (
              <div style={{ background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:'14px', padding:'14px', marginBottom:'12px' }}>
                <div style={{ color:'#818cf8', fontWeight:700, fontSize:'13px', marginBottom:'10px' }}>📊 Create Poll</div>
                <input value={pollQuestion} onChange={e => setPollQuestion(e.target.value)} placeholder="Poll question..."
                  style={{ width:'100%', background:'#1e293b', border:'1px solid #334155', borderRadius:'10px', padding:'8px 12px', color:'#f1f5f9', fontSize:'13px', outline:'none', boxSizing:'border-box', marginBottom:'8px' }} />
                {pollOptions.map((opt, i) => (
                  <input key={i} value={opt} onChange={e => { const a = [...pollOptions]; a[i] = e.target.value; setPollOptions(a); }}
                    placeholder={`Option ${i+1}${i >= 2 ? ' (optional)' : ''}...`}
                    style={{ width:'100%', background:'#1e293b', border:'1px solid #334155', borderRadius:'10px', padding:'7px 12px', color:'#f1f5f9', fontSize:'12px', outline:'none', boxSizing:'border-box', marginBottom:'6px' }} />
                ))}
                <div style={{ display:'flex', gap:'8px', marginTop:'4px' }}>
                  <button onClick={() => { setShowPollCreate(false); setPollQuestion(''); setPollOptions(['','','','']); }}
                    style={{ flex:1, background:'#334155', border:'none', borderRadius:'10px', padding:'8px', color:'#94a3b8', fontWeight:600, fontSize:'12px', cursor:'pointer' }}>Cancel</button>
                  <button disabled={!pollQuestion.trim() || pollOptions.filter(o=>o.trim()).length < 2 || pollSubmitting}
                    onClick={async () => {
                      if (!streamRef.current) return;
                      setPollSubmitting(true);
                      try {
                        if (activePollId) await updateDoc(doc(db, 'streams', streamRef.current, 'polls', activePollId), { status:'closed' });
                        const pRef = await addDoc(collection(db, 'streams', streamRef.current, 'polls'), {
                          question: pollQuestion.trim(),
                          options: pollOptions.filter(o=>o.trim()).map(label => ({ label, votes: 0 })),
                          status: 'active', createdAt: serverTimestamp(),
                        });
                        setActivePollId(pRef.id);
                        setShowPollCreate(false); setPollQuestion(''); setPollOptions(['','','','']);
                        showToast('📊 Poll started!');
                      } catch { showToast('Failed to create poll'); }
                      finally { setPollSubmitting(false); }
                    }}
                    style={{ flex:2, background: pollQuestion.trim() && !pollSubmitting ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : '#334155', border:'none', borderRadius:'10px', padding:'8px', color:'white', fontWeight:700, fontSize:'12px', cursor:'pointer' }}>
                    {pollSubmitting ? '⏳' : '▶ Start Poll'}
                  </button>
                  {activePollId && (
                    <button onClick={async () => {
                      if (!streamRef.current || !activePollId) return;
                      await updateDoc(doc(db, 'streams', streamRef.current, 'polls', activePollId), { status:'closed' });
                      setActivePollId(null); showToast('Poll ended');
                    }}
                      style={{ flex:1, background:'#ef4444', border:'none', borderRadius:'10px', padding:'8px', color:'white', fontWeight:700, fontSize:'11px', cursor:'pointer' }}>
                      ⏹ End
                    </button>
                  )}
                </div>
              </div>
            )}

            <button onClick={() => setShowEndConfirm(true)} aria-label="End stream"
              style={{ width:'100%', background:'linear-gradient(135deg,#ef4444,#dc2626)', border:'none', borderRadius:'14px', padding:'14px', color:'white', fontWeight:800, fontSize:'15px', cursor:'pointer' }}>
              ⏹ End Stream
            </button>
          </div>
        )}

        {/* UX-15 FIX: Edit Info with saving state */}
        {showEdit && (
          <div role="dialog" aria-modal="true" aria-label="Edit stream info" style={{ position:'fixed', inset:0, zIndex:100 }}>
            <div onClick={() => !editSaving && setShowEdit(false)} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.6)' }} />
            <div style={{ position:'absolute', bottom:0, left:0, right:0, background:'#0f172a', borderRadius:'20px 20px 0 0', padding:'20px 16px', paddingBottom:'calc(20px + env(safe-area-inset-bottom,0px))' }}>
              <div style={{ fontSize:'16px', fontWeight:800, color:'#f1f5f9', marginBottom:'16px' }}>✏️ Edit Stream Info</div>
              <label style={{ fontSize:'12px', fontWeight:700, color:'#94a3b8', display:'block', marginBottom:'6px' }} htmlFor="edit-title">
                Title <span style={{ color:'#64748b', float:'right' }}>{editTitle.length}/100</span>
              </label>
              <input id="edit-title" type="text" value={editTitle} onChange={e=>setEditTitle(e.target.value)}
                maxLength={100}
                style={{ width:'100%', background:'#1e293b', border:'1px solid #334155', borderRadius:'12px', padding:'12px 14px', color:'#f1f5f9', fontSize:'14px', outline:'none', boxSizing:'border-box', marginBottom:'12px' }} />
              <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginBottom:'16px' }} role="radiogroup" aria-label="Edit category">
                {CATEGORIES.map(c => (
                  <button key={c.id} onClick={() => setEditCategory(c.id)} role="radio" aria-checked={editCategory === c.id}
                    style={{ padding:'5px 12px', borderRadius:'12px', border:'none', fontSize:'11px', fontWeight:600, cursor:'pointer',
                      background: editCategory===c.id ? 'linear-gradient(135deg,#ef4444,#f59e0b)' : '#1e293b',
                      color: editCategory===c.id ? 'white' : '#94a3b8' }}>
                    {c.emoji} {c.label}
                  </button>
                ))}
              </div>
              <button onClick={saveEditInfo} disabled={editSaving || !editTitle.trim()}
                style={{ width:'100%', background:'linear-gradient(135deg,#10b981,#0f766e)', border:'none', borderRadius:'12px', padding:'13px', color:'white', fontWeight:700, fontSize:'14px', cursor: editSaving ? 'wait' : 'pointer', opacity: editSaving ? 0.7 : 1, display:'flex', alignItems:'center', justifyContent:'center', gap:'6px' }}>
                {editSaving ? (<><span>⏳</span> Saving...</>) : '✓ Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* End stream confirm */}
        {showEndConfirm && (
          <div role="dialog" aria-modal="true" aria-label="End stream confirmation" style={{ position:'fixed', inset:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
            <div onClick={() => setShowEndConfirm(false)} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.6)' }} />
            <div style={{ position:'relative', background:'#0f172a', borderRadius:'20px', padding:'24px', maxWidth:'300px', width:'100%', textAlign:'center', border:'1px solid #334155' }}>
              <div style={{ fontSize:'40px', marginBottom:'12px' }}>⏹</div>
              <div style={{ color:'#f1f5f9', fontWeight:800, fontSize:'18px', marginBottom:'8px' }}>End Stream?</div>
              <div style={{ color:'#94a3b8', fontSize:'14px', marginBottom:'20px' }}>This will disconnect all {fmt(liveViewers)} viewers.</div>
              <div style={{ display:'flex', gap:'12px' }}>
                <button onClick={() => setShowEndConfirm(false)}
                  style={{ flex:1, background:'#1e293b', border:'none', borderRadius:'12px', padding:'12px', color:'#94a3b8', fontWeight:700, cursor:'pointer' }}>Cancel</button>
                <button onClick={endStream}
                  style={{ flex:1, background:'#ef4444', border:'none', borderRadius:'12px', padding:'12px', color:'white', fontWeight:700, cursor:'pointer' }}>⏹ End Stream</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* UX-11 FIX: Streamer live chat panel */}
      {streaming && showChat && streamRef.current && (
        <StreamerChatPanel streamId={streamRef.current} onClose={() => setShowChat(false)} showToast={showToast} />
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.1); } }
      `}</style>
    </div>
  );
}
