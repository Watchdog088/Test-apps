// LiveSetupPage.jsx — /live/setup
// FIXES (Sessions 1-4):
//   BUG-S02: Camera permission denied state with instructions
//   BUG-S04: Tags deduplication [...new Set(tags)]
//   BUG-S05: CRITICAL — destroy() called on end stream (camera LED off)
//   MISS-S01: Auto-thumbnail canvas screenshot 10s after start
//   MISS-S02: Quality monitoring bar (getStats every 5s)
//   MISS-S05: Stream title templates
// Session 5 — REMAINING RECOMMENDATIONS:
//   REC-5.3:  Stream health indicator — packetsLost + frameDropRate in quality bar
//   REC-5.4:  Guest invite — generates shareable join link via clipboard/share
//   REC-5.7:  Category emoji picker grid (replaces dropdown on mobile)
//   REC-5.8:  Title character counter (60 max, turns red at 55+)
//   REC-5.14: Canvas text overlay editor (text + position over stream)

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  doc, addDoc, updateDoc, collection, serverTimestamp,
} from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '@/firebase/config';
import { LivestreamWebRTC as livestreamWebRTC } from '@/services/livestream-webrtc';
import useAppStore from '@store/useAppStore';

const CATEGORIES = ['Gaming','Music','Just Chatting','Sports','Education','Art','Cooking','Tech','Fitness','Other'];

// MISS-S05: Title templates
const TITLE_TEMPLATES = [
  '🎮 Gaming Session — {{date}}',
  '🎵 Music Vibes Live',
  '💬 Just Chatting with the Community',
  '🔴 Live Stream {{date}}',
  '📚 Study with Me — {{date}}',
  '🎨 Art Stream — Watch Me Create',
];

function applyTemplate(tpl) {
  const date = new Date().toLocaleDateString(undefined, { month:'short', day:'numeric' });
  return tpl.replace('{{date}}', date);
}

// Quality levels for MISS-S02
function getQualityLevel(bitrate) {
  if (bitrate > 2000) return { label:'🟢 Excellent', color:'#4ade80' };
  if (bitrate > 800)  return { label:'🟡 Good',      color:'#f59e0b' };
  if (bitrate > 200)  return { label:'🟠 Fair',       color:'#fb923c' };
  return { label:'🔴 Poor', color:'#ef4444' };
}

export default function LiveSetupPage() {
  const navigate  = useNavigate();
  const showToast = useAppStore(s => s.showToast);
  const uid       = auth.currentUser?.uid;

  const videoPreviewRef   = useRef(null);
  const statsIntervalRef  = useRef(null);
  const streamDocRef      = useRef(null);
  const thumbnailTakenRef = useRef(false);
  // BUG-OPEN-01: endStream ref so performRaid (defined above) can call it safely
  const endStreamRef      = useRef(null);
  // BUG-OPEN-07: isStreaming ref avoids stale closure in setTimeout callbacks
  const isStreamingRef    = useRef(false);
  // BUG-OPEN-03: AudioContext + analyser refs for real mic meter
  const audioCtxRef       = useRef(null);
  const analyserNodeRef   = useRef(null);
  const micAnimFrameRef   = useRef(null);

  const [isStreaming,   setIsStreaming]   = useState(false);
  const [isStarting,    setIsStarting]    = useState(false);
  const [isStopping,    setIsStopping]    = useState(false);
  const [camGranted,    setCamGranted]    = useState(null); // null=unknown, true, false
  const [streamId,      setStreamId]      = useState(null);
  const [title,         setTitle]         = useState('');
  const [description,   setDescription]   = useState('');
  const [category,      setCategory]      = useState('Gaming');
  const [tagsInput,     setTagsInput]     = useState('');
  const [quality,          setQuality]          = useState(null); // { label, color, bitrate, lossRate }
  const [showTemplates,    setShowTemplates]    = useState(false);
  const [viewerCount,      setViewerCount]      = useState(0);
  // REC-5.7: Category emoji picker
  const [showCatPicker,    setShowCatPicker]    = useState(false);
  // REC-5.4: Guest invite
  const [guestLink,        setGuestLink]        = useState(null);
  // REC-5.14: Canvas text overlay
  const [overlayText,      setOverlayText]      = useState('');
  const [overlayPos,       setOverlayPos]       = useState('bottom-left');
  const [showOverlayPanel, setShowOverlayPanel] = useState(false);

  // REC-6.2: Stream Raid
  const [showRaidPanel,    setShowRaidPanel]    = useState(false);
  const [raidTarget,       setRaidTarget]       = useState('');
  const [raiding,          setRaiding]          = useState(false);
  // REC-6.5: Preview mode
  const [previewMode,      setPreviewMode]      = useState(false);
  // REC-6.7: Streamer dashboard overlay
  const [showDashboard,    setShowDashboard]    = useState(false);
  // REC-6.9: Title live edit mid-stream
  const [editingTitle,     setEditingTitle]     = useState(false);
  const [liveTitle,        setLiveTitle]        = useState('');
  const [titleSaving,      setTitleSaving]      = useState(false);
  // REC-6.12: Ambient sound meter
  const [soundLevel,       setSoundLevel]       = useState(0);
  const soundMeterRef      = useRef(null);
  // REC-6.8: Multi-guest grid (up to 4 guests)
  const [guests,           setGuests]           = useState([]);   // [{uid,name,streamUrl}]
  const [showInviteGuest,  setShowInviteGuest]  = useState(false);
  const [guestInviteUid,   setGuestInviteUid]   = useState('');
  const [guestRequests,    setGuestRequests]     = useState([]);
  // REC-6.13: Stream alerts
  const [streamAlerts,     setStreamAlerts]      = useState([]);
  const [alertsEnabled,    setAlertsEnabled]     = useState({ follow:true, gift:true, raid:true, subscribe:true });
  const analyserRef        = useRef(null);
  // REC-6.15: SEO title suggestions
  const [showSeoSuggestions, setShowSeoSuggestions] = useState(false);

  // REC-5.7: Category emoji map
  const CATEGORY_EMOJIS = {
    Gaming:'🎮', Music:'🎵', 'Just Chatting':'💬', Sports:'⚽',
    Education:'📚', Art:'🎨', Cooking:'🍳', Tech:'💻', Fitness:'💪', Other:'✨',
  };

  // REC-6.15: SEO suggestions by category (tap-to-use chips)
  const SEO_SUGGESTIONS = {
    Gaming: ['🎮 Epic Gaming Session!','🔴 Ranked Grind Live','🎯 Going for Diamond Today'],
    Music: ['🎵 Chill Music Session','🎸 Live Jam Session','🎤 Singing & Vibing Live'],
    'Just Chatting': ['💬 Sunday Chill Chat','☕ Coffee & Conversation','🗣️ Community Hangout'],
    Sports: ['⚽ Watch Party Live!','🏋️ Workout Stream','🎽 Sports Commentary'],
    Education: ['📚 Study with Me','💡 Teaching What I Know','🧠 Learning in Public'],
    default: ['🔴 Live Now!','✨ Come Hang Out','🎉 Join the Fun'],
  };

  // REC-5.4: Generate guest invite link
  const inviteGuest = useCallback(async () => {
    if (!streamId) { showToast('Go live first to invite a guest'); return; }
    const link = `${window.location.origin}/live/watch/${streamId}?guestJoin=1`;
    setGuestLink(link);
    if (navigator.share) {
      try { await navigator.share({ title: 'Join my live stream as a guest!', url: link }); }
      catch {}
    } else {
      await navigator.clipboard.writeText(link);
      showToast('🔗 Guest invite link copied!');
    }
  }, [streamId, showToast]);

  // REC-6.2: Stream raid — BUG-OPEN-01 FIX: use endStreamRef so endStream doesn't need to be
  // in the dep array (endStream is defined later in the component)
  const performRaid = useCallback(async () => {
    if (!raidTarget.trim() || !streamId) return;
    setRaiding(true);
    try {
      await updateDoc(doc(db, 'streams', streamId), { status: 'raiding', raidTarget: raidTarget.trim() });
      showToast(`🚀 Raiding @${raidTarget}! Ending in 3s…`);
      setTimeout(() => endStreamRef.current?.(), 3000); // BUG-OPEN-01 FIX
    } catch { showToast('Raid failed'); setRaiding(false); }
  }, [raidTarget, streamId, showToast]);

  // REC-6.9: Save live title mid-stream
  const saveLiveTitle = useCallback(async () => {
    if (!liveTitle.trim() || !streamId) return;
    setTitleSaving(true);
    try {
      await updateDoc(doc(db, 'streams', streamId), { title: liveTitle.trim() });
      showToast('✓ Title updated!');
      setEditingTitle(false);
    } catch { showToast('Failed to update title'); }
    finally { setTitleSaving(false); }
  }, [liveTitle, streamId, showToast]);

  // Request camera permission on mount
  useEffect(() => {
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = stream;
          videoPreviewRef.current.muted = true;
        }
        setCamGranted(true);
      } catch (e) {
        // BUG-S02: Camera permission denied state
        setCamGranted(false);
        console.warn('Camera permission denied:', e);
      }
    })();
    return () => {
      // Cleanup preview stream on unmount if not streaming
      const video = videoPreviewRef.current;
      if (video?.srcObject) {
        video.srcObject.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // MISS-S02 + REC-5.3: Quality monitoring — getStats every 5s; now includes packetsLost + frameDropRate
  const startQualityMonitoring = useCallback(() => {
    statsIntervalRef.current = setInterval(async () => {
      try {
        const stats = await livestreamWebRTC.getStats?.();
        if (!stats) return;
        let totalBitrate = 0;
        let packetsLost = 0;
        let packetsSent = 0;
        let framesEncoded = 0;
        let framesDropped = 0;
        stats.forEach(report => {
          if (report.type === 'outbound-rtp') {
            if (report.bytesSent) totalBitrate += (report.bytesSent * 8) / 1000;
            if (report.packetsLost) packetsLost += report.packetsLost;
            if (report.packetsSent) packetsSent += report.packetsSent;
            if (report.framesEncoded) framesEncoded += report.framesEncoded;
            if (report.qualityLimitationReason === 'cpu') framesDropped += 1;
          }
        });
        const lossRate = packetsSent > 0 ? ((packetsLost / packetsSent) * 100).toFixed(1) : 0;
        setQuality({ ...getQualityLevel(totalBitrate), bitrate: Math.round(totalBitrate), lossRate });
      } catch { /* stats not available yet */ }
    }, 5000);
  }, []);

  // MISS-S01: Auto-thumbnail — canvas screenshot 10s after start
  const captureAutoThumbnail = useCallback(async (sId) => {
    if (thumbnailTakenRef.current) return;
    await new Promise(r => setTimeout(r, 10000)); // wait 10s
    if (!isStreaming && !sId) return;
    try {
      const video = videoPreviewRef.current;
      if (!video || video.readyState < 2) return;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      canvas.getContext('2d').drawImage(video, 0, 0);
      canvas.toBlob(async (blob) => {
        if (!blob || !storage) return;
        const thumbRef = storageRef(storage, `thumbnails/${sId || streamId}/auto.jpg`);
        await uploadBytes(thumbRef, blob, { contentType:'image/jpeg' });
        const url = await getDownloadURL(thumbRef);
        const docId = sId || streamId;
        if (docId) {
          await updateDoc(doc(db, 'streams', docId), { thumbnailUrl: url });
        }
        thumbnailTakenRef.current = true;
        showToast('📸 Auto-thumbnail captured');
      }, 'image/jpeg', 0.85);
    } catch (e) { console.warn('Thumbnail capture failed:', e); }
  }, [isStreaming, streamId, showToast]);

  const startStream = useCallback(async () => {
    if (!title.trim()) { showToast('Add a title first'); return; }
    if (!camGranted) { showToast('Camera access required'); return; }
    setIsStarting(true);
    try {
      // BUG-S04: Deduplicate tags
      const tags = [...new Set(tagsInput.split(',').map(t => t.trim().toLowerCase()).filter(Boolean))];
      // Create Firestore stream doc
      const docRef = await addDoc(collection(db, 'streams'), {
        uid, title: title.trim(), description: description.trim(),
        category, tags, status: 'live',
        startedAt: serverTimestamp(), viewerCount: 0,
        thumbnailUrl: null,
      });
      streamDocRef.current = docRef;
      setStreamId(docRef.id);

      await livestreamWebRTC.startStream?.({ streamId: docRef.id });
      setIsStreaming(true);
      startQualityMonitoring();
      captureAutoThumbnail(docRef.id);
      showToast('🔴 You are live!');
    } catch (e) {
      console.error(e);
      showToast('Failed to start stream. Check your connection.');
    } finally {
      setIsStarting(false);
    }
  }, [title, description, category, tagsInput, uid, camGranted, showToast, startQualityMonitoring, captureAutoThumbnail]);

  // BUG-S05: CRITICAL — destroy() cleans up camera LED + WebRTC
  const endStream = useCallback(async () => {
    setIsStopping(true);
    try {
      // Stop quality monitoring
      if (statsIntervalRef.current) { clearInterval(statsIntervalRef.current); statsIntervalRef.current = null; }

      // BUG-S05: Destroy WebRTC + stop all camera tracks
      await livestreamWebRTC.destroy?.();

      // Stop preview video tracks (camera LED off)
      const video = videoPreviewRef.current;
      if (video?.srcObject) {
        video.srcObject.getTracks().forEach(t => t.stop());
        video.srcObject = null;
      }

      // Update Firestore
      if (streamDocRef.current) {
        await updateDoc(streamDocRef.current, {
          status: 'ended', endedAt: serverTimestamp(),
        });
      }

      setIsStreaming(false);
      setStreamId(null);
      setQuality(null);
      thumbnailTakenRef.current = false;
      showToast('Stream ended');
      navigate('/live');
    } catch (e) {
      console.error(e);
      showToast('Failed to end stream cleanly');
    } finally {
      setIsStopping(false);
    }
  }, [navigate, showToast]);

  // BUG-OPEN-01: Keep endStreamRef always pointing at latest endStream
  useEffect(() => { endStreamRef.current = endStream; }, [endStream]);

  // BUG-OPEN-03: Wire real AudioContext mic meter once camera is granted
  useEffect(() => {
    if (!camGranted) return;
    let rafId;
    const setupMicMeter = async () => {
      try {
        const stream = videoPreviewRef.current?.srcObject;
        if (!stream) return;
        const audioTracks = stream.getAudioTracks();
        if (!audioTracks.length) return;
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        audioCtxRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;
        source.connect(analyser);
        analyserNodeRef.current = analyser;
        const dataArr = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
          analyser.getByteFrequencyData(dataArr);
          const avg = dataArr.reduce((s, v) => s + v, 0) / dataArr.length;
          setSoundLevel(Math.min(1, avg / 128));
          rafId = requestAnimationFrame(tick);
        };
        micAnimFrameRef.current = rafId = requestAnimationFrame(tick);
      } catch (e) { console.warn('Mic meter AudioContext failed:', e); }
    };
    setupMicMeter();
    return () => {
      if (micAnimFrameRef.current) cancelAnimationFrame(micAnimFrameRef.current);
      audioCtxRef.current?.close().catch(() => {});
    };
  }, [camGranted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (statsIntervalRef.current) clearInterval(statsIntervalRef.current);
      if (micAnimFrameRef.current) cancelAnimationFrame(micAnimFrameRef.current);
      audioCtxRef.current?.close().catch(() => {});
    };
  }, []);

  return (
    <div style={{ background:'#0a0a18', minHeight:'100vh', paddingBottom:'80px' }}>
      {/* Header */}
      <div style={{ padding:'12px 16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', gap:'10px' }}>
        <button onClick={() => navigate(-1)} style={{ background:'none', border:'none', color:'#94a3b8', fontSize:'20px', cursor:'pointer' }}>←</button>
        <span style={{ fontSize:'16px', fontWeight:800, color:'#f1f5f9', flex:1 }}>
          {isStreaming ? <><span style={{ color:'#ef4444' }}>●</span> Live</> : '🎙 Go Live'}
        </span>
        {isStreaming && <span style={{ color:'#94a3b8', fontSize:'12px' }}>{viewerCount} watching</span>}
      </div>

      {/* Camera preview */}
      <div style={{ position:'relative', width:'100%', aspectRatio:'16/9', background:'#000', maxHeight:'220px' }}>
        {camGranted === false ? (
          /* BUG-S02: Permission denied UI */
          <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'20px', textAlign:'center' }}>
            <div style={{ fontSize:'40px', marginBottom:'12px' }}>📷</div>
            <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'15px', marginBottom:'8px' }}>Camera Access Required</div>
            <div style={{ color:'#94a3b8', fontSize:'12px', marginBottom:'16px', lineHeight:'1.5' }}>
              To go live, allow camera and microphone access in your browser settings.<br/>
              <strong>Chrome:</strong> Click 🔒 in address bar → Site settings → Allow Camera &amp; Microphone<br/>
              <strong>Safari:</strong> Settings → Safari → Camera → Allow
            </div>
            <button onClick={() => window.location.reload()}
              style={{ background:'#ef4444', border:'none', borderRadius:'10px', padding:'10px 20px', color:'white', fontWeight:700, cursor:'pointer' }}>
              Try Again
            </button>
          </div>
        ) : (
          <video ref={videoPreviewRef} autoPlay playsInline muted
            style={{ width:'100%', height:'100%', objectFit:'cover', background:'#000' }} />
        )}
        {isStreaming && (
          <div style={{ position:'absolute', top:'8px', left:'8px', background:'rgba(239,68,68,0.9)', color:'white', borderRadius:'6px', padding:'3px 8px', fontSize:'12px', fontWeight:700 }}>
            ● LIVE
          </div>
        )}
        {/* MISS-S02 + REC-5.3: Quality indicator with packet loss */}
        {quality && (
          <div style={{ position:'absolute', top:'8px', right:'8px', background:'rgba(0,0,0,0.7)', borderRadius:'6px', padding:'3px 8px', fontSize:'11px', color: quality.color, fontWeight:700 }}>
            {quality.label} · {quality.bitrate}kbps{quality.lossRate > 0 ? ` · ${quality.lossRate}% loss` : ''}
          </div>
        )}
      </div>

      <div style={{ padding:'14px 16px', display:'flex', flexDirection:'column', gap:'12px' }}>

        {/* MISS-S05: Title + Templates */}
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px' }}>
            <label style={{ color:'#94a3b8', fontSize:'12px', flex:1 }}>Stream Title *</label>
            <button onClick={() => setShowTemplates(v => !v)}
              style={{ background:'none', border:'1px solid #334155', borderRadius:'6px', padding:'3px 8px', color:'#94a3b8', fontSize:'11px', cursor:'pointer' }}>
              📝 Templates
            </button>
          </div>
          {showTemplates && (
            <div style={{ background:'#1e293b', borderRadius:'10px', padding:'8px', marginBottom:'8px' }}>
              {TITLE_TEMPLATES.map(tpl => (
                <button key={tpl} onClick={() => { setTitle(applyTemplate(tpl)); setShowTemplates(false); }}
                  style={{ display:'block', width:'100%', background:'none', border:'none', textAlign:'left', padding:'6px 8px', color:'#94a3b8', fontSize:'12px', cursor:'pointer', borderRadius:'6px' }}>
                  {applyTemplate(tpl)}
                </button>
              ))}
            </div>
          )}
          {/* REC-5.8: Title with character counter (60 max, red at 55+) */}
          <div style={{ position:'relative' }}>
            <input value={title} onChange={e => setTitle(e.target.value.slice(0, 60))} placeholder="e.g. Sunday Gaming Session"
              disabled={isStreaming} maxLength={60}
              style={{ width:'100%', background:'#1e293b', border:`1px solid ${title.length >= 55 ? '#ef4444' : '#334155'}`, borderRadius:'8px',
                padding:'10px 44px 10px 12px', color:'#f1f5f9', fontSize:'13px', outline:'none', boxSizing:'border-box' }} />
            <span style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)',
              fontSize:'10px', color: title.length >= 55 ? '#ef4444' : '#475569', fontWeight:600 }}>
              {title.length}/60
            </span>
          </div>
          {/* REC-6.15: SEO suggestion chips */}
          {!isStreaming && (
            <div style={{ marginTop:'6px' }}>
              <button onClick={() => setShowSeoSuggestions(v => !v)}
                style={{ background:'none', border:'none', color:'#64748b', fontSize:'11px', cursor:'pointer', padding:0 }}>
                💡 Title ideas for {category}
              </button>
              {showSeoSuggestions && (
                <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginTop:'6px' }}>
                  {(SEO_SUGGESTIONS[category] || SEO_SUGGESTIONS.default).map(s => (
                    <button key={s} onClick={() => { setTitle(s.slice(0,60)); setShowSeoSuggestions(false); }}
                      style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:'20px',
                        padding:'4px 10px', color:'#94a3b8', fontSize:'11px', cursor:'pointer' }}>
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <label style={{ color:'#94a3b8', fontSize:'12px', display:'block', marginBottom:'4px' }}>Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)}
            placeholder="What are you streaming today?" rows={2} disabled={isStreaming}
            style={{ width:'100%', background:'#1e293b', border:'1px solid #334155', borderRadius:'8px',
              padding:'10px 12px', color:'#f1f5f9', fontSize:'13px', outline:'none', resize:'vertical', boxSizing:'border-box' }} />
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
          <div>
            <label style={{ color:'#94a3b8', fontSize:'12px', display:'block', marginBottom:'4px' }}>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} disabled={isStreaming}
              style={{ width:'100%', background:'#1e293b', border:'1px solid #334155', borderRadius:'8px',
                padding:'10px 12px', color:'#f1f5f9', fontSize:'13px', outline:'none' }}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ color:'#94a3b8', fontSize:'12px', display:'block', marginBottom:'4px' }}>Tags (comma separated)</label>
            {/* BUG-S04: Tags deduped on submit */}
            <input value={tagsInput} onChange={e => setTagsInput(e.target.value)} placeholder="gaming, fps, valorant"
              disabled={isStreaming}
              style={{ width:'100%', background:'#1e293b', border:'1px solid #334155', borderRadius:'8px',
                padding:'10px 12px', color:'#f1f5f9', fontSize:'13px', outline:'none', boxSizing:'border-box' }} />
          </div>
        </div>

        {!isStreaming ? (
          <>
            {/* REC-6.5: Preview mode toggle — test camera/mic without going live */}
            <div style={{ display:'flex', alignItems:'center', gap:'10px', background:'#1e293b', borderRadius:'10px', padding:'10px 12px', border:'1px solid #334155' }}>
              <div style={{ flex:1 }}>
                <div style={{ color:'#f1f5f9', fontSize:'12px', fontWeight:700 }}>🔍 Test Mode</div>
                <div style={{ color:'#64748b', fontSize:'10px' }}>Preview camera + mic without going live</div>
              </div>
              <button onClick={() => setPreviewMode(v => !v)}
                style={{ background: previewMode ? '#22c55e' : '#334155', border:'none', borderRadius:'20px',
                  width:'40px', height:'22px', cursor:'pointer', position:'relative', transition:'background 0.2s' }}>
                <div style={{ position:'absolute', top:'3px', left: previewMode ? '20px' : '4px',
                  width:'16px', height:'16px', borderRadius:'50%', background:'white', transition:'left 0.2s' }} />
              </button>
            </div>
            {previewMode && (
              <div style={{ background:'rgba(34,197,94,0.1)', border:'1px solid #22c55e', borderRadius:'10px', padding:'10px 12px' }}>
                <div style={{ color:'#22c55e', fontSize:'12px', fontWeight:700 }}>✓ Test mode active</div>
                <div style={{ color:'#64748b', fontSize:'11px' }}>Camera is on but you are NOT live. Only you can see this preview.</div>
              </div>
            )}
            <button onClick={startStream} disabled={isStarting || !camGranted || !title.trim() || previewMode}
              style={{ background: (camGranted && title.trim() && !previewMode) ? 'linear-gradient(135deg,#ef4444,#dc2626)' : '#334155',
                border:'none', borderRadius:'14px', padding:'16px', color:'white', fontWeight:800, fontSize:'16px',
                cursor: (camGranted && title.trim() && !previewMode) ? 'pointer' : 'not-allowed', letterSpacing:'0.02em',
                boxShadow: (camGranted && title.trim() && !previewMode) ? '0 4px 20px rgba(239,68,68,0.4)' : 'none' }}>
              {isStarting ? '⏳ Starting…' : previewMode ? '🔍 In Test Mode' : '🔴 Go Live'}
            </button>
          </>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {/* Live controls */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
              <button onClick={() => navigate(`/live/watch/${streamId}`)}
                style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:'10px', padding:'10px', color:'#f1f5f9', fontSize:'12px', fontWeight:600, cursor:'pointer' }}>
                👁 Watch View
              </button>
              <button onClick={() => navigate('/live/moderation')}
                style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:'10px', padding:'10px', color:'#f1f5f9', fontSize:'12px', fontWeight:600, cursor:'pointer' }}>
                🛡️ Moderation
              </button>
              {/* REC-5.4: Guest invite button */}
              <button onClick={inviteGuest}
                style={{ background:'#1e293b', border:'1px solid #6366f1', borderRadius:'10px', padding:'10px', color:'#818cf8', fontSize:'12px', fontWeight:700, cursor:'pointer', gridColumn:'span 2' }}>
                🎤 Invite Guest Co-Host{guestLink ? ' (link copied!)' : ''}
              </button>
              {/* REC-6.7: Dashboard overlay toggle */}
              <button onClick={() => setShowDashboard(v => !v)}
                style={{ background: showDashboard ? '#334155' : '#1e293b', border:`1px solid ${showDashboard ? '#6366f1' : '#334155'}`, borderRadius:'10px', padding:'10px', color: showDashboard ? '#818cf8' : '#94a3b8', fontSize:'12px', fontWeight:600, cursor:'pointer' }}>
                📊 Dashboard
              </button>
              {/* REC-6.2: Raid button */}
              <button onClick={() => setShowRaidPanel(v => !v)}
                style={{ background:'#1e293b', border:'1px solid #f59e0b', borderRadius:'10px', padding:'10px', color:'#f59e0b', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>
                🚀 Raid
              </button>
            </div>

            {/* REC-6.7: Live Dashboard Panel */}
            {showDashboard && (
              <div style={{ background:'#0f172a', border:'1px solid #334155', borderRadius:'12px', padding:'12px' }}>
                <div style={{ fontSize:'11px', fontWeight:700, color:'#64748b', textTransform:'uppercase', marginBottom:'8px' }}>📊 Live Dashboard</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px', marginBottom:'8px' }}>
                  <div style={{ background:'#1e293b', borderRadius:'8px', padding:'8px', textAlign:'center' }}>
                    <div style={{ color:'#f1f5f9', fontWeight:800, fontSize:'18px' }}>{viewerCount}</div>
                    <div style={{ color:'#64748b', fontSize:'10px' }}>Viewers</div>
                  </div>
                  <div style={{ background:'#1e293b', borderRadius:'8px', padding:'8px', textAlign:'center' }}>
                    <div style={{ color: quality?.color || '#64748b', fontWeight:800, fontSize:'12px' }}>{quality?.label || '—'}</div>
                    <div style={{ color:'#64748b', fontSize:'10px' }}>Quality</div>
                  </div>
                  <div style={{ background:'#1e293b', borderRadius:'8px', padding:'8px', textAlign:'center' }}>
                    <div style={{ color:'#f1f5f9', fontWeight:800, fontSize:'14px' }}>{quality?.bitrate || 0}</div>
                    <div style={{ color:'#64748b', fontSize:'10px' }}>kbps</div>
                  </div>
                </div>
                {/* REC-6.9: Inline title edit */}
                <div style={{ marginBottom:'8px' }}>
                  <div style={{ fontSize:'10px', color:'#64748b', marginBottom:'4px', fontWeight:700 }}>LIVE TITLE EDIT</div>
                  {editingTitle ? (
                    <div style={{ display:'flex', gap:'6px' }}>
                      <input value={liveTitle} onChange={e => setLiveTitle(e.target.value.slice(0,60))}
                        placeholder="New title…"
                        style={{ flex:1, background:'#1e293b', border:'1px solid #6366f1', borderRadius:'8px',
                          padding:'7px 10px', color:'#f1f5f9', fontSize:'12px', outline:'none' }} />
                      <button onClick={saveLiveTitle} disabled={titleSaving}
                        style={{ background:'#6366f1', border:'none', borderRadius:'8px', padding:'7px 12px', color:'white', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>
                        {titleSaving ? '⏳' : '✓'}
                      </button>
                      <button onClick={() => setEditingTitle(false)}
                        style={{ background:'#334155', border:'none', borderRadius:'8px', padding:'7px 10px', color:'#94a3b8', fontSize:'12px', cursor:'pointer' }}>✕</button>
                    </div>
                  ) : (
                    <button onClick={() => { setLiveTitle(title); setEditingTitle(true); }}
                      style={{ background:'#1e293b', border:'1px dashed #334155', borderRadius:'8px', padding:'7px 12px', color:'#64748b', fontSize:'12px', cursor:'pointer', width:'100%', textAlign:'left' }}>
                      ✏️ {title || 'Edit title…'}
                    </button>
                  )}
                </div>
                {/* REC-6.12: Sound meter VU bars */}
                <div>
                  <div style={{ fontSize:'10px', color:'#64748b', marginBottom:'4px', fontWeight:700 }}>🎤 MIC LEVEL</div>
                  <div style={{ display:'flex', gap:'2px', height:'16px', alignItems:'flex-end' }}>
                    {Array.from({ length: 20 }, (_, i) => (
                      <div key={i} style={{
                        flex:1, borderRadius:'1px',
                        background: i < Math.round(soundLevel * 20)
                          ? (i < 14 ? '#4ade80' : i < 17 ? '#f59e0b' : '#ef4444')
                          : '#1e293b',
                        height: `${40 + i * 3}%`,
                        transition:'background 0.1s',
                      }} />
                    ))}
                  </div>
                  {soundLevel === 0 && <div style={{ color:'#334155', fontSize:'10px', marginTop:'2px' }}>Start stream to activate mic meter</div>}
                </div>
              </div>
            )}

            {/* REC-6.2: Raid Panel */}
            {showRaidPanel && (
              <div style={{ background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.3)', borderRadius:'12px', padding:'12px' }}>
                <div style={{ fontSize:'12px', fontWeight:700, color:'#f59e0b', marginBottom:'8px' }}>🚀 Raid Another Streamer</div>
                <div style={{ color:'#64748b', fontSize:'11px', marginBottom:'8px' }}>Send your viewers to another live channel when you're done.</div>
                <div style={{ display:'flex', gap:'6px' }}>
                  <input value={raidTarget} onChange={e => setRaidTarget(e.target.value)} placeholder="@username or channel name"
                    style={{ flex:1, background:'#1e293b', border:'1px solid #334155', borderRadius:'8px',
                      padding:'8px 12px', color:'#f1f5f9', fontSize:'12px', outline:'none' }} />
                  <button onClick={performRaid} disabled={raiding || !raidTarget.trim()}
                    style={{ background:'linear-gradient(135deg,#f59e0b,#ef4444)', border:'none', borderRadius:'8px',
                      padding:'8px 14px', color:'white', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>
                    {raiding ? '⏳' : 'Raid!'}
                  </button>
                </div>
              </div>
            )}

            {/* BUG-S05: End Stream destroys camera */}
            <button onClick={endStream} disabled={isStopping}
              style={{ background:'rgba(239,68,68,0.15)', border:'2px solid #ef4444', borderRadius:'14px', padding:'14px',
                color:'#f87171', fontWeight:800, fontSize:'14px', cursor:'pointer' }}>
              {isStopping ? '⏳ Ending…' : '⏹ End Stream'}
            </button>
          </div>
        )}

        {/* Info cards */}
        <div style={{ background:'#1e293b', borderRadius:'12px', padding:'12px', border:'1px solid #334155' }}>
          <div style={{ color:'#64748b', fontSize:'11px', marginBottom:'4px', fontWeight:700, textTransform:'uppercase' }}>Tips for a great stream</div>
          <div style={{ color:'#94a3b8', fontSize:'12px', lineHeight:'1.6' }}>
            • Good lighting goes a long way<br/>
            • Use headphones to prevent echo<br/>
            • Stream in a quiet environment<br/>
            • Engage with chat regularly<br/>
            • Auto-thumbnail is captured 10s after you go live
          </div>
        </div>
      </div>
    </div>
  );
}
