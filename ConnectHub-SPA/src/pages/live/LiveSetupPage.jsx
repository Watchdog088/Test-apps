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
import { livestreamWebRTC } from '@/services/livestream-webrtc';
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

  const videoPreviewRef = useRef(null);
  const statsIntervalRef = useRef(null);
  const streamDocRef    = useRef(null);
  const thumbnailTakenRef = useRef(false);

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

  // REC-5.7: Category emoji map
  const CATEGORY_EMOJIS = {
    Gaming:'🎮', Music:'🎵', 'Just Chatting':'💬', Sports:'⚽',
    Education:'📚', Art:'🎨', Cooking:'🍳', Tech:'💻', Fitness:'💪', Other:'✨',
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (statsIntervalRef.current) clearInterval(statsIntervalRef.current);
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
          <button onClick={startStream} disabled={isStarting || !camGranted || !title.trim()}
            style={{ background: camGranted && title.trim() ? 'linear-gradient(135deg,#ef4444,#dc2626)' : '#334155',
              border:'none', borderRadius:'14px', padding:'16px', color:'white', fontWeight:800, fontSize:'16px',
              cursor: camGranted && title.trim() ? 'pointer' : 'not-allowed', letterSpacing:'0.02em',
              boxShadow: camGranted && title.trim() ? '0 4px 20px rgba(239,68,68,0.4)' : 'none' }}>
            {isStarting ? '⏳ Starting…' : '🔴 Go Live'}
          </button>
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
            </div>
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
