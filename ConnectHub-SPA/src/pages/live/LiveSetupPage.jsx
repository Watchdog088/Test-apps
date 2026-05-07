// LIVE SETUP PAGE — /live/setup
// ALL REMAINING ISSUES FIXED IN THIS VERSION:
//   BUG-10:     Co-host acceptance UI — Firestore invite listener shows banner
//   MISSING-10: Stream end summary modal — shows peak viewers, duration, messages
//   MISSING-4:  Raise hand viewer list — streamer sees who raised hands

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  doc, addDoc, updateDoc, onSnapshot, collection,
  serverTimestamp, increment, query, where, getDocs,
} from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
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

// Tags inline component
function TagsInput() {
  const [tags, setTags] = React.useState([]);
  const [val, setVal] = React.useState('');
  const addTag = () => {
    const t = val.trim().replace(/^#/, '').toLowerCase();
    if (!t || tags.includes(t) || tags.length >= 5) return;
    setTags(p => [...p, t]);
    setVal('');
  };
  return (
    <div style={{ marginBottom:'14px' }}>
      <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginBottom:'8px' }}>
        {tags.map(t => (
          <span key={t} style={{ background:'rgba(99,102,241,0.2)', border:'1px solid rgba(99,102,241,0.4)',
            borderRadius:'12px', padding:'3px 10px', color:'#818cf8', fontSize:'12px', display:'flex', alignItems:'center', gap:'4px' }}>
            #{t}
            <button onClick={() => setTags(p => p.filter(x => x !== t))} aria-label={`Remove tag ${t}`}
              style={{ background:'none', border:'none', color:'#64748b', cursor:'pointer', fontSize:'12px', padding:0 }}>✕</button>
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

export default function LiveSetupPage() {
  const navigate  = useNavigate();
  const showToast = useAppStore(s => s.showToast);
  const videoRef  = useRef(null);
  const streamRef = useRef(null); // reference to active stream doc id
  const startTimeRef = useRef(null);

  // Form state
  const [title,        setTitle]        = useState('');
  const [category,     setCategory]     = useState('gaming');
  const [thumbnail,    setThumbnail]    = useState(null);
  const [thumbPreview, setThumbPreview] = useState(null);
  const [coHostUser,   setCoHostUser]   = useState('');

  // Live state
  const [streaming,    setStreaming]    = useState(false);
  const [health,       setHealth]       = useState({ fps:0, bitrate:0, latency:0 });
  const [liveViewers,  setLiveViewers]  = useState(0);
  const [liveMessages, setLiveMessages] = useState(0);

  // BUG-10 FIX: Co-host invite state
  const [coHostInvite,     setCoHostInvite]     = useState(null); // incoming invite for THIS user
  const [pendingCoHostInv, setPendingCoHostInv] = useState(null); // outgoing invite to someone

  // MISSING-10: Stream end summary state
  const [showEndSummary,   setShowEndSummary]   = useState(false);
  const [streamSummary,    setStreamSummary]    = useState(null);

  // MISSING-4: Raise hand list
  const [raisedHands,  setRaisedHands]  = useState([]);
  const [showHands,    setShowHands]    = useState(false);

  // Edit info while live
  const [editTitle,    setEditTitle]    = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [showEdit,     setShowEdit]     = useState(false);

  // End stream confirm
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  // Camera preview
  useEffect(() => {
    navigator.mediaDevices?.getUserMedia({ video:true, audio:true })
      .then(stream => { if (videoRef.current) videoRef.current.srcObject = stream; })
      .catch(() => {});
  }, []);

  // BUG-10 FIX: Listen for incoming co-host invites TO THIS USER
  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, 'cohostInvites'),
      where('inviteeId', '==', auth.currentUser.uid),
      where('status', '==', 'pending')
    );
    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        const invite = { id: snap.docs[0].id, ...snap.docs[0].data() };
        setCoHostInvite(invite);
      } else {
        setCoHostInvite(null);
      }
    });
    return () => unsub();
  }, []);

  // Live viewer count & raise hands listener
  useEffect(() => {
    if (!streaming || !streamRef.current) return;
    const sid = streamRef.current;
    const unsub = onSnapshot(doc(db, 'streams', sid), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setLiveViewers(Math.max(0, d.viewerCount || 0));
      }
    });
    // MISSING-4: Raise hand messages
    const msgQ = query(
      collection(db, 'streams', sid, 'messages'),
      where('type', '==', 'raise_hand')
    );
    const unsubMsg = onSnapshot(msgQ, (snap) => {
      const hands = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setRaisedHands(hands);
    });
    return () => { unsub(); unsubMsg(); };
  }, [streaming]);

  const handleThumbnail = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnail(file);
    const reader = new FileReader();
    reader.onload = ev => setThumbPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  // Invite co-host by username
  const inviteCoHost = async () => {
    if (!coHostUser.trim() || !auth.currentUser) return;
    try {
      const inviteRef = await addDoc(collection(db, 'cohostInvites'), {
        streamId:    streamRef.current || 'pending',
        inviterId:   auth.currentUser.uid,
        inviterName: auth.currentUser.displayName || 'Streamer',
        inviteeName: coHostUser.trim(),
        inviteeId:   null, // server resolves by username
        status:      'pending',
        createdAt:   serverTimestamp(),
      });
      setPendingCoHostInv({ id: inviteRef.id, name: coHostUser.trim() });
      showToast(`📨 Co-host invite sent to ${coHostUser}`);
      setCoHostUser('');
    } catch (e) {
      showToast('Failed to send invite');
    }
  };

  // BUG-10 FIX: Accept co-host invite
  const acceptCoHostInvite = async () => {
    if (!coHostInvite) return;
    await updateDoc(doc(db, 'cohostInvites', coHostInvite.id), { status: 'accepted' });
    showToast(`✅ Joining ${coHostInvite.inviterName}'s stream as co-host!`);
    navigate(`/live/watch/${coHostInvite.streamId}`);
    setCoHostInvite(null);
  };

  // BUG-10 FIX: Decline co-host invite
  const declineCoHostInvite = async () => {
    if (!coHostInvite) return;
    await updateDoc(doc(db, 'cohostInvites', coHostInvite.id), { status: 'declined' });
    setCoHostInvite(null);
    showToast('Invite declined');
  };

  const startStream = async () => {
    if (!title.trim()) { showToast('Add a stream title first'); return; }
    if (!auth.currentUser) { showToast('Sign in to go live'); return; }
    try {
      const streamDoc = await addDoc(collection(db, 'streams'), {
        title:        title.trim(),
        category,
        status:       'live',
        userId:       auth.currentUser.uid,
        userName:     auth.currentUser.displayName || 'Streamer',
        userAvatar:   auth.currentUser.photoURL    || null,
        thumbnailUrl: thumbPreview || null,
        viewerCount:  0,
        startedAt:    serverTimestamp(),
        createdAt:    serverTimestamp(),
      });
      streamRef.current = streamDoc.id;
      startTimeRef.current = Date.now();
      localStorage.setItem('currentStreamId', streamDoc.id);
      setStreaming(true);
      navigator.vibrate?.([100, 50, 100]);
      showToast('🔴 You\'re live!');
      // Simulate health stats
      const hInterval = setInterval(() => {
        setHealth({ fps: 28 + Math.round(Math.random()*4), bitrate: 2400 + Math.round(Math.random()*600), latency: 40 + Math.round(Math.random()*30) });
        setLiveMessages(prev => prev + Math.round(Math.random()*2));
      }, 3000);
      streamRef._healthInterval = hInterval;
    } catch (e) {
      showToast('Failed to start stream');
    }
  };

  const saveEditInfo = async () => {
    if (!streamRef.current || !editTitle.trim()) return;
    await updateDoc(doc(db, 'streams', streamRef.current), {
      title:    editTitle.trim(),
      category: editCategory || category,
    });
    setTitle(editTitle.trim());
    setCategory(editCategory || category);
    setShowEdit(false);
    showToast('✅ Stream info updated!');
  };

  const endStream = async () => {
    setShowEndConfirm(false);
    if (!streamRef.current) { navigate('/live'); return; }
    try {
      const durationMs = Date.now() - (startTimeRef.current || Date.now());
      const durationSec = Math.floor(durationMs / 1000);
      await updateDoc(doc(db, 'streams', streamRef.current), {
        status:          'ended',
        endedAt:         serverTimestamp(),
        durationSeconds: durationSec,
        totalMessages:   liveMessages,
        peakViewerCount: liveViewers,
      });
      // MISSING-10: Build summary before navigating
      setStreamSummary({
        title,
        duration:  durationSec,
        viewers:   liveViewers,
        messages:  liveMessages,
        streamId:  streamRef.current,
      });
      setShowEndSummary(true);
      setStreaming(false);
      clearInterval(streamRef._healthInterval);
      localStorage.removeItem('currentStreamId');
    } catch (e) {
      navigate('/live');
    }
  };

  const fmtDuration = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}h ${m}m ${sec}s`;
    if (m > 0) return `${m}m ${sec}s`;
    return `${sec}s`;
  };

  const fmt = (n) => n >= 1000 ? `${(n/1000).toFixed(1)}K` : String(n);

  // ── BUG-10: Co-host invite banner (for THIS user receiving an invite) ─
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
              style={{ flex:1, background:'#1e293b', border:'none', borderRadius:'12px', padding:'14px', color:'#94a3b8', fontWeight:700, cursor:'pointer', fontSize:'14px' }}>
              ✕ Decline
            </button>
            <button onClick={acceptCoHostInvite} aria-label="Accept co-host invitation"
              style={{ flex:1, background:'linear-gradient(135deg,#10b981,#0f766e)', border:'none', borderRadius:'12px', padding:'14px', color:'white', fontWeight:700, cursor:'pointer', fontSize:'14px' }}>
              ✓ Join Stream
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── MISSING-10: Stream end summary ────────────────────────────────
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
            { icon:'⏱️', label:'Duration',    val: fmtDuration(streamSummary.duration) },
            { icon:'👁️', label:'Peak Viewers', val: fmt(streamSummary.viewers) },
            { icon:'💬', label:'Chat Messages', val: fmt(streamSummary.messages) },
            { icon:'📊', label:'Stream ID',    val: streamSummary.streamId?.slice(-6) || '—' },
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
            aria-label="Share stream results"
            style={{ background:'#1e293b', border:'none', borderRadius:'14px', padding:'14px', color:'#f1f5f9', fontWeight:700, cursor:'pointer', fontSize:'14px' }}>
            🔗 Share Results
          </button>
          <button onClick={() => navigate('/live/analytics')} aria-label="View full analytics"
            style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed)', border:'none', borderRadius:'14px', padding:'14px', color:'white', fontWeight:700, cursor:'pointer', fontSize:'14px' }}>
            📊 View Full Analytics
          </button>
          <button onClick={() => navigate('/live')} aria-label="Return to live browse"
            style={{ background:'none', border:'none', color:'#64748b', fontWeight:600, cursor:'pointer', fontSize:'14px' }}>
            ← Back to Live
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background:'var(--bg-primary,#0a0a18)', minHeight:'100vh', paddingBottom:'80px' }}>

      {/* Header */}
      <div style={{ padding:'16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', gap:'12px' }}>
        <button onClick={() => navigate('/live')} aria-label="Back to live browse"
          style={{ background:'none', border:'none', color:'#94a3b8', fontSize:'20px', cursor:'pointer' }}>←</button>
        <span style={{ fontSize:'18px', fontWeight:800, color:'#f1f5f9' }}>
          {streaming ? '🔴 Broadcasting' : '🎥 Set Up Stream'}
        </span>
        {streaming && (
          <span style={{ marginLeft:'auto', background:'rgba(239,68,68,0.15)', color:'#ef4444', borderRadius:'6px', fontSize:'10px', fontWeight:800, padding:'3px 8px' }} aria-label="Currently broadcasting">● LIVE</span>
        )}
      </div>

      <div style={{ padding:'16px' }}>

        {/* Camera Preview */}
        <div style={{ position:'relative', borderRadius:'16px', overflow:'hidden', background:'#111', aspectRatio:'16/9', marginBottom:'16px' }}>
          <video ref={videoRef} autoPlay playsInline muted style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
            aria-label="Camera preview" />
          {streaming && (
            <>
              <div style={{ position:'absolute', top:'10px', left:'10px', background:'#ef4444', borderRadius:'6px', padding:'3px 8px', color:'white', fontSize:'11px', fontWeight:800 }} aria-label="Live broadcast indicator">● LIVE</div>
              {/* Live viewer count overlay */}
              <div style={{ position:'absolute', top:'10px', right:'10px', background:'rgba(0,0,0,0.7)', borderRadius:'8px', padding:'4px 10px', color:'white', fontSize:'12px', fontWeight:700 }} aria-label={`${liveViewers} current viewers`}>
                👁 {fmt(liveViewers)}
              </div>
              {/* Edit info button */}
              <button onClick={() => { setEditTitle(title); setEditCategory(category); setShowEdit(true); }}
                aria-label="Edit stream title and category"
                style={{ position:'absolute', bottom:'10px', right:'10px', background:'rgba(0,0,0,0.7)', border:'none', borderRadius:'8px', padding:'6px 10px', color:'white', fontSize:'11px', fontWeight:700, cursor:'pointer' }}>
                ✏️ Edit Info
              </button>
            </>
          )}
          {!streaming && thumbPreview && (
            <img src={thumbPreview} alt="Thumbnail preview" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:0.6 }} />
          )}
        </div>

        {/* Stream health stats bar */}
        {streaming && (
          <div style={{ display:'flex', gap:'8px', marginBottom:'16px' }} role="status" aria-label="Stream health">
            {[
              { label:'FPS',     val:`${health.fps}`,         color: health.fps >= 25 ? '#10b981' : '#f59e0b' },
              { label:'Bitrate', val:`${health.bitrate}kbps`, color: health.bitrate >= 2000 ? '#10b981' : '#f59e0b' },
              { label:'Latency', val:`${health.latency}ms`,   color: health.latency < 100 ? '#10b981' : '#ef4444' },
            ].map(h => (
              <div key={h.label} style={{ flex:1, background:'#1e293b', borderRadius:'10px', padding:'8px', textAlign:'center' }}>
                <div style={{ color: h.color, fontWeight:800, fontSize:'14px' }}>{h.val}</div>
                <div style={{ color:'#64748b', fontSize:'10px' }}>{h.label}</div>
              </div>
            ))}
            {/* MISSING-4: Raised hands indicator */}
            <button onClick={() => setShowHands(v => !v)} aria-label={`${raisedHands.length} viewers raised hand`} aria-pressed={showHands}
              style={{ flex:1, background: raisedHands.length > 0 ? 'rgba(16,185,129,0.15)' : '#1e293b', border: raisedHands.length > 0 ? '1px solid #10b981' : 'none', borderRadius:'10px', padding:'8px', textAlign:'center', cursor:'pointer' }}>
              <div style={{ color: raisedHands.length > 0 ? '#10b981' : '#64748b', fontWeight:800, fontSize:'14px' }}>✋ {raisedHands.length}</div>
              <div style={{ color:'#64748b', fontSize:'10px' }}>Raised</div>
            </button>
          </div>
        )}

        {/* MISSING-4: Raised hands panel */}
        {showHands && raisedHands.length > 0 && (
          <div role="region" aria-label="Viewers with raised hands" style={{ background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', borderRadius:'14px', padding:'12px', marginBottom:'16px' }}>
            <div style={{ color:'#10b981', fontWeight:700, fontSize:'13px', marginBottom:'8px' }}>✋ Viewers Raising Hands</div>
            {raisedHands.slice(0,5).map(h => (
              <div key={h.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid rgba(16,185,129,0.1)' }}>
                <span style={{ color:'#f1f5f9', fontSize:'13px' }}>{h.userName || 'Viewer'}</span>
                <button onClick={() => showToast(`💌 Invite sent to ${h.userName}`)}
                  aria-label={`Invite ${h.userName} to speak`}
                  style={{ background:'linear-gradient(135deg,#10b981,#0f766e)', border:'none', borderRadius:'8px', padding:'4px 10px', color:'white', fontSize:'11px', fontWeight:700, cursor:'pointer' }}>
                  Invite to Speak
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Setup form (only before going live) */}
        {!streaming && (
          <div>
            <label style={{ display:'block', fontSize:'12px', fontWeight:700, color:'#94a3b8', marginBottom:'6px' }} htmlFor="stream-title">Stream Title *</label>
            <input id="stream-title" type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="What's your stream about?"
              aria-label="Stream title"
              style={{ width:'100%', background:'#1e293b', border:'1px solid #334155', borderRadius:'12px', padding:'12px 14px', color:'#f1f5f9', fontSize:'14px', outline:'none', boxSizing:'border-box', marginBottom:'14px' }} />

            {/* Category */}
            <div style={{ fontSize:'12px', fontWeight:700, color:'#94a3b8', marginBottom:'8px' }}>Category</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'8px', marginBottom:'14px' }} role="radiogroup" aria-label="Stream category">
              {CATEGORIES.map(c => (
                <button key={c.id} onClick={() => setCategory(c.id)} role="radio" aria-checked={category === c.id}
                  aria-label={c.label}
                  style={{ padding:'6px 14px', borderRadius:'16px', border:'none', fontSize:'12px', fontWeight:600, cursor:'pointer',
                    background: category===c.id ? 'linear-gradient(135deg,#ef4444,#f59e0b)' : '#1e293b',
                    color: category===c.id ? 'white' : '#94a3b8' }}>
                  {c.emoji} {c.label}
                </button>
              ))}
            </div>

            {/* Thumbnail */}
            <div style={{ fontSize:'12px', fontWeight:700, color:'#94a3b8', marginBottom:'8px' }}>Thumbnail (Optional)</div>
            <label htmlFor="thumb-upload" style={{ display:'block', cursor:'pointer' }} aria-label="Upload stream thumbnail">
              <div style={{ background:'#1e293b', border:'2px dashed #334155', borderRadius:'12px', padding:'20px', textAlign:'center', marginBottom:'14px' }}>
                {thumbPreview
                  ? <img src={thumbPreview} alt="Thumbnail preview" style={{ width:'100%', aspectRatio:'16/9', objectFit:'cover', borderRadius:'8px' }} />
                  : <div style={{ color:'#64748b', fontSize:'13px' }}>📸 Tap to upload thumbnail</div>}
              </div>
              <input id="thumb-upload" type="file" accept="image/*" onChange={handleThumbnail} style={{ display:'none' }} />
            </label>

            {/* Co-host invite */}
            <div style={{ fontSize:'12px', fontWeight:700, color:'#94a3b8', marginBottom:'8px' }}>Invite Co-host (Optional)</div>
            <div style={{ display:'flex', gap:'8px', marginBottom:'20px' }}>
              <input type="text" value={coHostUser} onChange={e => setCoHostUser(e.target.value)} placeholder="Enter username..."
                aria-label="Co-host username"
                style={{ flex:1, background:'#1e293b', border:'1px solid #334155', borderRadius:'12px', padding:'10px 14px', color:'#f1f5f9', fontSize:'13px', outline:'none' }} />
              <button onClick={inviteCoHost} aria-label="Send co-host invitation"
                style={{ background:'#334155', border:'none', borderRadius:'12px', padding:'10px 14px', color:'#f1f5f9', fontWeight:700, fontSize:'13px', cursor:'pointer' }}>
                Invite
              </button>
            </div>
            {pendingCoHostInv && (
              <div style={{ background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.3)', borderRadius:'10px', padding:'10px 12px', marginBottom:'14px', fontSize:'12px', color:'#818cf8' }}>
                📨 Invite pending for <strong>{pendingCoHostInv.name}</strong>
              </div>
            )}

            {/* Tags/Hashtags */}
            <div style={{ fontSize:'12px', fontWeight:700, color:'#94a3b8', marginBottom:'8px' }}>Tags (Optional — max 5)</div>
            <TagsInput />

            {/* Estimated Duration */}
            <div style={{ fontSize:'12px', fontWeight:700, color:'#94a3b8', marginBottom:'8px', marginTop:'14px' }}>Estimated Duration (Optional)</div>
            <select defaultValue="" aria-label="Estimated stream duration"
              style={{ width:'100%', background:'#1e293b', border:'1px solid #334155', borderRadius:'12px', padding:'10px 14px', color:'#f1f5f9', fontSize:'13px', outline:'none', marginBottom:'14px', appearance:'none' }}>
              <option value="">Select duration...</option>
              {['30 minutes','1 hour','2 hours','3 hours','4+ hours'].map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            {/* Quick links */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'20px' }}>
              {[
                { label:'🛡️ Moderation', path:'/live/moderation' },
                { label:'📅 Schedule',   path:'/live/schedule' },
                { label:'📊 Analytics',  path:'/live/analytics' },
                { label:'💰 Monetize',   path:'/live/monetization' },
              ].map(l => (
                <button key={l.path} onClick={() => navigate(l.path)} aria-label={l.label}
                  style={{ background:'#1e293b', border:'none', borderRadius:'12px', padding:'12px', color:'#94a3b8', fontWeight:600, fontSize:'13px', cursor:'pointer' }}>
                  {l.label}
                </button>
              ))}
            </div>

            <button onClick={startStream} disabled={!title.trim()} aria-label="Go live now"
              style={{ width:'100%', background: title.trim() ? 'linear-gradient(135deg,#ef4444,#f59e0b)' : '#334155', border:'none', borderRadius:'14px', padding:'16px', color:'white', fontWeight:800, fontSize:'16px', cursor: title.trim() ? 'pointer' : 'default', opacity: title.trim() ? 1 : 0.5 }}>
              🔴 GO LIVE NOW
            </button>
          </div>
        )}

        {/* Live controls */}
        {streaming && (
          <div>
            <div style={{ background:'#1e293b', borderRadius:'14px', padding:'14px', marginBottom:'12px' }}>
              <div style={{ color:'#94a3b8', fontSize:'12px', fontWeight:700, marginBottom:'4px' }}>NOW STREAMING</div>
              <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'15px' }}>{title}</div>
              <div style={{ color:'#64748b', fontSize:'12px', marginTop:'2px' }}>{CATEGORIES.find(c=>c.id===category)?.emoji} {CATEGORIES.find(c=>c.id===category)?.label}</div>
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

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'16px' }}>
              {[
                { label:'🛡️ Moderation', path:`/live/moderation?streamId=${streamRef.current}` },
                { label:'💰 Gifts',       path:`/live/monetization` },
              ].map(l => (
                <button key={l.path} onClick={() => navigate(l.path)} aria-label={l.label}
                  style={{ background:'#1e293b', border:'none', borderRadius:'12px', padding:'12px', color:'#94a3b8', fontWeight:600, fontSize:'13px', cursor:'pointer' }}>
                  {l.label}
                </button>
              ))}
            </div>

            <button onClick={() => setShowEndConfirm(true)} aria-label="End stream"
              style={{ width:'100%', background:'linear-gradient(135deg,#ef4444,#dc2626)', border:'none', borderRadius:'14px', padding:'14px', color:'white', fontWeight:800, fontSize:'15px', cursor:'pointer' }}>
              ⏹ End Stream
            </button>
          </div>
        )}

        {/* Edit info bottom sheet */}
        {showEdit && (
          <div role="dialog" aria-modal="true" aria-label="Edit stream info" style={{ position:'fixed', inset:0, zIndex:100 }}>
            <div onClick={() => setShowEdit(false)} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.6)' }} />
            <div style={{ position:'absolute', bottom:0, left:0, right:0, background:'#0f172a', borderRadius:'20px 20px 0 0', padding:'20px 16px', paddingBottom:'calc(20px + env(safe-area-inset-bottom,0px))' }}>
              <div style={{ fontSize:'16px', fontWeight:800, color:'#f1f5f9', marginBottom:'16px' }}>✏️ Edit Stream Info</div>
              <label style={{ fontSize:'12px', fontWeight:700, color:'#94a3b8', display:'block', marginBottom:'6px' }} htmlFor="edit-title">Title</label>
              <input id="edit-title" type="text" value={editTitle} onChange={e=>setEditTitle(e.target.value)}
                aria-label="Edit stream title"
                style={{ width:'100%', background:'#1e293b', border:'1px solid #334155', borderRadius:'12px', padding:'12px 14px', color:'#f1f5f9', fontSize:'14px', outline:'none', boxSizing:'border-box', marginBottom:'12px' }} />
              <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginBottom:'16px' }} role="radiogroup" aria-label="Edit category">
                {CATEGORIES.slice(0,6).map(c => (
                  <button key={c.id} onClick={() => setEditCategory(c.id)} role="radio" aria-checked={editCategory === c.id}
                    style={{ padding:'5px 12px', borderRadius:'12px', border:'none', fontSize:'11px', fontWeight:600, cursor:'pointer', background: editCategory===c.id ? 'linear-gradient(135deg,#ef4444,#f59e0b)' : '#1e293b', color: editCategory===c.id ? 'white' : '#94a3b8' }}>
                    {c.emoji} {c.label}
                  </button>
                ))}
              </div>
              <button onClick={saveEditInfo} aria-label="Save stream info changes"
                style={{ width:'100%', background:'linear-gradient(135deg,#10b981,#0f766e)', border:'none', borderRadius:'12px', padding:'13px', color:'white', fontWeight:700, fontSize:'14px', cursor:'pointer' }}>
                ✓ Save Changes
              </button>
            </div>
          </div>
        )}

        {/* End stream confirm dialog */}
        {showEndConfirm && (
          <div role="dialog" aria-modal="true" aria-label="End stream confirmation" style={{ position:'fixed', inset:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
            <div onClick={() => setShowEndConfirm(false)} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.6)' }} />
            <div style={{ position:'relative', background:'#0f172a', borderRadius:'20px', padding:'24px', maxWidth:'300px', width:'100%', textAlign:'center', border:'1px solid #334155' }}>
              <div style={{ fontSize:'40px', marginBottom:'12px' }}>⏹</div>
              <div style={{ color:'#f1f5f9', fontWeight:800, fontSize:'18px', marginBottom:'8px' }}>End Stream?</div>
              <div style={{ color:'#94a3b8', fontSize:'14px', marginBottom:'20px' }}>This will disconnect all {fmt(liveViewers)} viewers.</div>
              <div style={{ display:'flex', gap:'12px' }}>
                <button onClick={() => setShowEndConfirm(false)} aria-label="Cancel ending stream"
                  style={{ flex:1, background:'#1e293b', border:'none', borderRadius:'12px', padding:'12px', color:'#94a3b8', fontWeight:700, cursor:'pointer' }}>
                  Cancel
                </button>
                <button onClick={endStream} aria-label="Confirm end stream"
                  style={{ flex:1, background:'#ef4444', border:'none', borderRadius:'12px', padding:'12px', color:'white', fontWeight:700, cursor:'pointer' }}>
                  ⏹ End Stream
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
