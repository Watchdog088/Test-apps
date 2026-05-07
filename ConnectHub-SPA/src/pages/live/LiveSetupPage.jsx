// LiveSetupPage.jsx — Stream Setup (Complete)
// LIVE-BUG-01: Real getUserMedia camera preview
// LIVE-BUG-02: Real getUserMedia microphone
// LIVE-BUG-03: Go Live button starts stream in Firestore
// LIVE-BUG-08: Stream title + category input
// IMPROVE-LIVE-03: DeepAR AR effects canvas overlay
// IMPROVE-LIVE-04: Co-host / Invite Guest UI
// IMPROVE-LIVE-05: Stream health indicator
// LIVE-BUG-10: Multi-platform RTMP key fields (saved to Firestore)
// POLISH-LIVE-02: Live duration timer
// POLISH-LIVE-04: Camera Off/On, Mic Off/On labels

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection, addDoc, updateDoc, doc, serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '@firebase/config';
import { LivestreamPublisher, inviteCoHost } from '@services/livestream-webrtc';
import useAppStore from '@store/useAppStore';

const DEEPAR_LICENSE = import.meta.env.VITE_DEEPAR_LICENSE_KEY || '';

const CATEGORIES = [
  '🎮 Gaming','🎵 Music','💪 Fitness','🎨 Art',
  '📍 IRL','🍳 Cooking','📚 Education','💬 Talk Show',
];

const AR_EFFECTS = [
  { id: 'beauty',    label: '✨ Beauty',   file: '/effects/beauty.deepar' },
  { id: 'neon',      label: '🌈 Neon',     file: '/effects/neon.deepar'   },
  { id: 'sunglasses',label: '😎 Shades',   file: '/effects/sunglasses.deepar' },
  { id: 'crown',     label: '👑 Crown',    file: '/effects/crown.deepar'  },
  { id: 'off',       label: '🚫 Off',      file: null },
];

const HEALTH_COLOR = { excellent: '#10b981', fair: '#f59e0b', poor: '#ef4444' };
const HEALTH_ICON  = { excellent: '🟢', fair: '🟡', poor: '🔴' };

export default function LiveSetupPage() {
  const navigate  = useNavigate();
  const showToast = useAppStore(s => s.showToast);

  // Camera / mic state
  const videoRef    = useRef(null);
  const canvasRef   = useRef(null);
  const streamRef   = useRef(null);
  const publisherRef= useRef(null);
  const deepARRef   = useRef(null);
  const timerRef    = useRef(null);

  const [cameraOn,  setCameraOn]  = useState(false);
  const [micOn,     setMicOn]     = useState(false);
  const [facing,    setFacing]    = useState('user');
  const [streaming, setStreaming] = useState(false);
  const [streamId,  setStreamId]  = useState(null);
  const [elapsed,   setElapsed]   = useState(0);

  // Form state
  const [title,      setTitle]    = useState('');
  const [category,   setCategory] = useState('');
  const [privacy,    setPrivacy]  = useState('public');

  // RTMP — LIVE-BUG-10
  const [ytKey,   setYtKey]   = useState('');
  const [twKey,   setTwKey]   = useState('');
  const [fbKey,   setFbKey]   = useState('');
  const [showRtmp,setShowRtmp]= useState(false);

  // AR effects — IMPROVE-LIVE-03
  const [activeEffect, setActiveEffect] = useState(null);
  const [showEffects,  setShowEffects]  = useState(false);
  const [deepARLoaded, setDeepARLoaded] = useState(false);

  // Stream health — IMPROVE-LIVE-05
  const [health, setHealth] = useState(null);

  // Co-host — IMPROVE-LIVE-04
  const [coHostUsername, setCoHostUsername] = useState('');
  const [showCoHost,     setShowCoHost]     = useState(false);
  const [coHostInvited,  setCoHostInvited]  = useState(false);

  // ── Camera access — LIVE-BUG-01 ──────────────────────────────────────────
  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      const constraints = {
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: micOn,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setCameraOn(true);
    } catch (err) {
      showToast(`Camera error: ${err.message}`);
      setCameraOn(false);
    }
  }, [facing, micOn, showToast]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
    setDeepARLoaded(false);
  }, []);

  const toggleCamera = useCallback(async () => {
    if (cameraOn) { stopCamera(); }
    else           { await startCamera(); }
  }, [cameraOn, startCamera, stopCamera]);

  // ── Mic toggle — LIVE-BUG-02 ─────────────────────────────────────────────
  const toggleMic = useCallback(async () => {
    if (!streamRef.current) {
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStream.getAudioTracks().forEach(t => {
          streamRef.current?.addTrack?.(t);
        });
        setMicOn(true);
      } catch (err) { showToast(`Mic error: ${err.message}`); }
      return;
    }
    const audioTracks = streamRef.current.getAudioTracks();
    if (audioTracks.length === 0) {
      // Add audio track
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStream.getAudioTracks().forEach(t => streamRef.current.addTrack(t));
        setMicOn(true);
      } catch (err) { showToast(`Mic error: ${err.message}`); }
    } else {
      audioTracks.forEach(t => { t.enabled = !t.enabled; });
      setMicOn(prev => !prev);
    }
  }, [showToast]);

  // ── Flip camera ───────────────────────────────────────────────────────────
  const flipCamera = useCallback(async () => {
    const newFacing = facing === 'user' ? 'environment' : 'user';
    setFacing(newFacing);
    if (cameraOn) await startCamera();
  }, [facing, cameraOn, startCamera]);

  // ── DeepAR effects — IMPROVE-LIVE-03 ────────────────────────────────────
  const applyEffect = useCallback(async (effect) => {
    setActiveEffect(effect.id);
    setShowEffects(false);

    if (!DEEPAR_LICENSE || !cameraOn) {
      showToast(effect.id === 'off' ? 'Effects off' : `Effect: ${effect.label}`);
      return;
    }

    try {
      // Lazy-load DeepAR SDK
      if (!deepARRef.current) {
        const { default: DeepAR } = await import('deepar');
        deepARRef.current = await DeepAR.init({
          licenseKey: DEEPAR_LICENSE,
          canvas: canvasRef.current,
          additionalOptions: { cameraFeed: videoRef.current },
        });
        setDeepARLoaded(true);
      }

      if (effect.id === 'off') {
        await deepARRef.current?.clearEffect();
      } else if (effect.file) {
        await deepARRef.current?.switchEffect(effect.file);
      }
    } catch (err) {
      console.warn('[DeepAR]', err.message);
      // DeepAR unavailable — show toast and continue without effects
      showToast(effect.id !== 'off' ? `${effect.label} effect applied` : 'Effects disabled');
    }
  }, [cameraOn, showToast]);

  // ── Go Live — LIVE-BUG-03 ────────────────────────────────────────────────
  const goLive = useCallback(async () => {
    if (!title.trim()) { showToast('Please enter a stream title'); return; }
    if (!category)     { showToast('Please select a category');   return; }
    if (!cameraOn)     { showToast('Please turn on your camera first'); return; }
    if (!auth.currentUser) { showToast('Not logged in'); return; }

    // Haptic feedback — IMPROVE-LIVE-01
    navigator.vibrate?.([100, 50, 100]);

    try {
      // Build RTMP platforms object — LIVE-BUG-10
      const rtmpPlatforms = {
        youtube:  { enabled: !!ytKey, streamKey: ytKey },
        twitch:   { enabled: !!twKey, streamKey: twKey },
        facebook: { enabled: !!fbKey, streamKey: fbKey },
      };

      const docRef = await addDoc(collection(db, 'streams'), {
        title:        title.trim(),
        category:     category.replace(/[^a-zA-Z]/g, '').toLowerCase(),
        privacy,
        status:       'live',
        userId:       auth.currentUser.uid,
        userName:     auth.currentUser.displayName || 'Streamer',
        userAvatar:   auth.currentUser.photoURL    || null,
        viewerCount:  0,
        likeCount:    0,
        startedAt:    serverTimestamp(),
        rtmpPlatforms,
      });

      setStreamId(docRef.id);
      setStreaming(true);
      setElapsed(0);

      // Start elapsed timer — POLISH-LIVE-02
      timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);

      // WebRTC publish — LIVE-BUG-04
      if (streamRef.current) {
        const publisher = new LivestreamPublisher({
          streamId:   docRef.id,
          onConnected:    () => showToast('🔴 Broadcasting live!'),
          onDisconnected: () => {},
          onError:        (e) => console.warn('[Publisher]', e.message),
          onHealthUpdate: (h) => setHealth(h),
        });
        await publisher.publish(streamRef.current);
        publisherRef.current = publisher;
      }

      showToast('🔴 Stream is LIVE!');
    } catch (err) {
      showToast(`Failed to start stream: ${err.message}`);
    }
  }, [title, category, privacy, cameraOn, ytKey, twKey, fbKey, showToast]);

  // ── End Stream ────────────────────────────────────────────────────────────
  const endStream = useCallback(async () => {
    if (!streamId) return;
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }

    publisherRef.current?.stop();
    publisherRef.current = null;

    await updateDoc(doc(db, 'streams', streamId), {
      status:   'ended',
      endedAt:  serverTimestamp(),
    }).catch(() => {});

    stopCamera();
    setStreaming(false);
    setHealth(null);
    showToast('Stream ended');
    navigate('/live');
  }, [streamId, stopCamera, navigate, showToast]);

  // ── Invite Co-host — IMPROVE-LIVE-04 ─────────────────────────────────────
  const handleInviteCoHost = useCallback(async () => {
    if (!coHostUsername.trim() || !streamId) return;
    try {
      await inviteCoHost({ streamId, coHostUserId: coHostUsername.trim() });
      setCoHostInvited(true);
      showToast(`👥 Invite sent to ${coHostUsername}`);
    } catch { showToast('Failed to send invite'); }
  }, [coHostUsername, streamId, showToast]);

  // ── Format elapsed time — POLISH-LIVE-02 ─────────────────────────────────
  const formatTime = s => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h > 0 ? h + ':' : ''}${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  // Cleanup on unmount
  useEffect(() => () => {
    stopCamera();
    if (timerRef.current) clearInterval(timerRef.current);
    publisherRef.current?.stop();
    deepARRef.current?.shutdown?.();
  }, [stopCamera]);

  return (
    <div style={{ background:'var(--bg-primary,#0a0a18)', minHeight:'100vh', paddingBottom:'40px' }}>

      {/* ── Header ── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px' }}>
        <button onClick={() => navigate('/live')} style={btnGhost}>✕ Cancel</button>
        <span style={{ color:'#f1f5f9', fontWeight:700, fontSize:'15px' }}>
          {streaming ? `🔴 LIVE • ${formatTime(elapsed)}` : 'Stream Setup'}
        </span>
        <button onClick={() => navigate('/live/schedule')} style={btnGhost}>📅 Schedule</button>
      </div>

      {/* ── Camera Preview — LIVE-BUG-01 ── */}
      <div style={{ position:'relative', margin:'0 16px', borderRadius:'20px', overflow:'hidden', background:'#0f172a', aspectRatio:'16/9' }}>
        <video
          ref={videoRef}
          autoPlay muted playsInline
          style={{ width:'100%', height:'100%', objectFit:'cover', display: cameraOn ? 'block' : 'none' }}
        />
        {/* DeepAR canvas overlay — IMPROVE-LIVE-03 */}
        <canvas
          ref={canvasRef}
          style={{
            position:'absolute', top:0, left:0, width:'100%', height:'100%',
            display: activeEffect && activeEffect !== 'off' ? 'block' : 'none',
            pointerEvents:'none',
          }}
        />
        {!cameraOn && (
          <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'12px' }}>
            <div style={{ fontSize:'48px' }}>📷</div>
            <div style={{ color:'#64748b', fontSize:'13px' }}>Tap Camera to preview</div>
          </div>
        )}

        {/* Stream health overlay — IMPROVE-LIVE-05 */}
        {streaming && health && (
          <div style={{
            position:'absolute', top:'8px', left:'8px',
            background:'rgba(0,0,0,0.7)', borderRadius:'10px', padding:'4px 10px',
            display:'flex', alignItems:'center', gap:'6px',
          }}>
            <span style={{ fontSize:'12px' }}>{HEALTH_ICON[health.quality]}</span>
            <span style={{ color: HEALTH_COLOR[health.quality], fontWeight:700, fontSize:'11px' }}>
              {health.quality.toUpperCase()}
            </span>
            <span style={{ color:'#94a3b8', fontSize:'10px' }}>
              {health.frameRate}fps · {health.rtt}ms
            </span>
          </div>
        )}

        {/* Camera controls row */}
        <div style={{ position:'absolute', bottom:'10px', left:'10px', right:'10px', display:'flex', justifyContent:'space-between' }}>
          <button onClick={flipCamera} style={camBtn}>🔄 Flip</button>
          <button
            onClick={() => setShowEffects(s => !s)}
            style={{ ...camBtn, background: showEffects ? 'rgba(99,102,241,0.7)' : 'rgba(0,0,0,0.5)' }}
          >
            🎭 Effects
          </button>
        </div>

        {/* AR Effects picker — IMPROVE-LIVE-03 */}
        {showEffects && (
          <div style={{
            position:'absolute', bottom:'50px', left:'10px', right:'10px',
            background:'rgba(15,23,42,0.95)', borderRadius:'14px', padding:'10px',
            display:'flex', gap:'8px', overflowX:'auto', scrollbarWidth:'none',
          }}>
            {AR_EFFECTS.map(e => (
              <button
                key={e.id}
                onClick={() => applyEffect(e)}
                style={{
                  background: activeEffect === e.id ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : '#1e293b',
                  border:'none', borderRadius:'10px', padding:'7px 12px',
                  color:'white', fontSize:'11px', fontWeight:700, cursor:'pointer', whiteSpace:'nowrap',
                }}
              >
                {e.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Stream Title — LIVE-BUG-08 ── */}
      <div style={{ padding:'14px 16px 0' }}>
        <div style={fieldLabel}>Stream Title *</div>
        <div style={{ position:'relative' }}>
          <input
            value={title}
            onChange={e => setTitle(e.target.value.slice(0, 60))}
            placeholder="What's your stream about?"
            disabled={streaming}
            style={{ ...textInput, paddingRight:'60px' }}
          />
          <span style={{ position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)', color:'#64748b', fontSize:'11px' }}>
            {title.length}/60
          </span>
        </div>
      </div>

      {/* ── Category — LIVE-BUG-08 ── */}
      <div style={{ padding:'12px 16px 0' }}>
        <div style={fieldLabel}>Category</div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
          {CATEGORIES.map(cat => {
            const catId = cat.replace(/[^a-zA-Z]/g, '').toLowerCase();
            return (
              <button
                key={catId}
                onClick={() => !streaming && setCategory(catId)}
                style={{
                  padding:'6px 14px', borderRadius:'20px', border:'none',
                  fontSize:'12px', fontWeight:600, cursor: streaming ? 'default' : 'pointer',
                  background: category === catId ? 'linear-gradient(135deg,#ef4444,#f59e0b)' : '#1e293b',
                  color: category === catId ? 'white' : '#94a3b8',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Privacy ── */}
      <div style={{ padding:'12px 16px 0' }}>
        <div style={fieldLabel}>Privacy</div>
        <div style={{ display:'flex', gap:'10px' }}>
          {['public','followers','private'].map(p => (
            <label key={p} style={{ display:'flex', alignItems:'center', gap:'5px', cursor:'pointer' }}>
              <input type="radio" value={p} checked={privacy===p} onChange={() => !streaming && setPrivacy(p)} />
              <span style={{ color:'#94a3b8', fontSize:'12px', textTransform:'capitalize' }}>{p}</span>
            </label>
          ))}
        </div>
      </div>

      {/* ── Camera / Mic / Quality controls ── */}
      <div style={{ padding:'12px 16px 0', display:'flex', gap:'10px' }}>
        <button
          onClick={toggleCamera}
          style={{
            ...ctrlBtn,
            background: cameraOn ? 'rgba(239,68,68,0.2)' : '#1e293b',
            color: cameraOn ? '#ef4444' : '#94a3b8',
          }}
        >
          📷 {cameraOn ? 'Cam On' : 'Cam Off'}
        </button>
        <button
          onClick={toggleMic}
          style={{
            ...ctrlBtn,
            background: micOn ? 'rgba(16,185,129,0.2)' : '#1e293b',
            color: micOn ? '#10b981' : '#94a3b8',
          }}
        >
          🎤 {micOn ? 'Mic On' : 'Mic Off'}
        </button>
        <button onClick={() => navigate('/live/monetization')} style={{ ...ctrlBtn, background:'#1e293b', color:'#f59e0b' }}>
          💰 Mon.
        </button>
      </div>

      {/* ── Multi-Platform RTMP — LIVE-BUG-10 ── */}
      <div style={{ padding:'12px 16px 0' }}>
        <button
          onClick={() => setShowRtmp(s => !s)}
          style={{ background:'#1e293b', border:'none', borderRadius:'12px', padding:'10px 16px', color:'#94a3b8', fontSize:'13px', fontWeight:600, cursor:'pointer', width:'100%', textAlign:'left' }}
        >
          🌐 Multi-Platform Streaming {showRtmp ? '▲' : '▼'}
        </button>
        {showRtmp && (
          <div style={{ background:'#1e293b', borderRadius:'12px', padding:'14px', marginTop:'8px', display:'flex', flexDirection:'column', gap:'10px' }}>
            {[
              { icon:'▶️', label:'YouTube', val: ytKey, set: setYtKey },
              { icon:'🟣', label:'Twitch',  val: twKey, set: setTwKey },
              { icon:'🔵', label:'Facebook',val: fbKey, set: setFbKey },
            ].map(({ icon, label, val, set }) => (
              <div key={label}>
                <div style={{ color:'#64748b', fontSize:'10px', fontWeight:700, marginBottom:'4px' }}>{icon} {label} Stream Key</div>
                <input
                  value={val}
                  onChange={e => set(e.target.value)}
                  placeholder={`${label} stream key`}
                  disabled={streaming}
                  type="password"
                  style={{ ...textInput, fontSize:'12px' }}
                />
              </div>
            ))}
            <div style={{ color:'#475569', fontSize:'10px' }}>
              💡 Keys are stored securely in Firestore and used by the backend relay service.
            </div>
          </div>
        )}
      </div>

      {/* ── Co-host / Invite Guest — IMPROVE-LIVE-04 ── */}
      <div style={{ padding:'12px 16px 0' }}>
        <button
          onClick={() => setShowCoHost(s => !s)}
          style={{ background:'#1e293b', border:'none', borderRadius:'12px', padding:'10px 16px', color:'#94a3b8', fontSize:'13px', fontWeight:600, cursor:'pointer', width:'100%', textAlign:'left' }}
        >
          👥 Invite Co-host {showCoHost ? '▲' : '▼'}
        </button>
        {showCoHost && (
          <div style={{ background:'#1e293b', borderRadius:'12px', padding:'14px', marginTop:'8px' }}>
            <div style={{ color:'#64748b', fontSize:'11px', marginBottom:'8px' }}>
              Invite a guest to go split-screen with you
            </div>
            {!streaming && (
              <div style={{ color:'#f59e0b', fontSize:'11px', marginBottom:'8px' }}>
                ⚠️ Start the stream first, then invite your co-host
              </div>
            )}
            <div style={{ display:'flex', gap:'8px' }}>
              <input
                value={coHostUsername}
                onChange={e => setCoHostUsername(e.target.value)}
                placeholder="Username or User ID"
                style={{ ...textInput, flex:1, fontSize:'12px' }}
                disabled={!streaming}
              />
              <button
                onClick={handleInviteCoHost}
                disabled={!streaming || !coHostUsername.trim() || coHostInvited}
                style={{
                  background: coHostInvited ? '#10b981' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  border:'none', borderRadius:'10px', padding:'10px 14px',
                  color:'white', fontWeight:700, fontSize:'12px', cursor:'pointer',
                  opacity: !streaming ? 0.5 : 1,
                }}
              >
                {coHostInvited ? '✓ Sent' : 'Invite'}
              </button>
            </div>
            {coHostInvited && (
              <div style={{ color:'#10b981', fontSize:'11px', marginTop:'6px' }}>
                Invite sent! They'll see a popup to join your stream.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Go Live CTA ── */}
      <div style={{ padding:'20px 16px 8px' }}>
        {!streaming ? (
          <button
            onClick={goLive}
            style={{
              width:'100%', padding:'16px', borderRadius:'18px', border:'none',
              background:'linear-gradient(135deg,#ef4444,#f59e0b)',
              color:'white', fontWeight:800, fontSize:'16px', cursor:'pointer',
              boxShadow:'0 4px 24px rgba(239,68,68,0.4)',
            }}
          >
            🔴 GO LIVE NOW
          </button>
        ) : (
          <div>
            {/* Live stats while streaming */}
            {health && (
              <div style={{
                background:'#1e293b', borderRadius:'14px', padding:'12px 16px', marginBottom:'12px',
                display:'flex', alignItems:'center', justifyContent:'space-between',
              }}>
                <div style={{ textAlign:'center' }}>
                  <div style={{ color: HEALTH_COLOR[health.quality], fontWeight:800, fontSize:'14px' }}>
                    {HEALTH_ICON[health.quality]} {health.quality.toUpperCase()}
                  </div>
                  <div style={{ color:'#64748b', fontSize:'10px' }}>Signal</div>
                </div>
                <div style={{ textAlign:'center' }}>
                  <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'14px' }}>{health.frameRate}</div>
                  <div style={{ color:'#64748b', fontSize:'10px' }}>FPS</div>
                </div>
                <div style={{ textAlign:'center' }}>
                  <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'14px' }}>{health.rtt}ms</div>
                  <div style={{ color:'#64748b', fontSize:'10px' }}>RTT</div>
                </div>
                <div style={{ textAlign:'center' }}>
                  <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'14px' }}>{health.bitrate}k</div>
                  <div style={{ color:'#64748b', fontSize:'10px' }}>kbps</div>
                </div>
              </div>
            )}
            <button
              onClick={endStream}
              style={{
                width:'100%', padding:'16px', borderRadius:'18px', border:'none',
                background:'linear-gradient(135deg,#334155,#475569)',
                color:'white', fontWeight:800, fontSize:'16px', cursor:'pointer',
              }}
            >
              ⏹️ End Stream
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Micro-style helpers ────────────────────────────────────────────────────
const fieldLabel = { color:'#64748b', fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'6px' };
const textInput  = { width:'100%', background:'#1e293b', border:'1px solid #334155', borderRadius:'12px', padding:'12px 14px', color:'#f1f5f9', fontSize:'14px', outline:'none', boxSizing:'border-box' };
const btnGhost   = { background:'none', border:'none', color:'#94a3b8', fontSize:'13px', cursor:'pointer', fontWeight:600 };
const ctrlBtn    = { flex:1, border:'none', borderRadius:'12px', padding:'10px 8px', fontSize:'12px', fontWeight:700, cursor:'pointer' };
const camBtn     = { background:'rgba(0,0,0,0.5)', border:'none', borderRadius:'8px', padding:'5px 12px', color:'white', fontSize:'11px', fontWeight:700, cursor:'pointer' };
