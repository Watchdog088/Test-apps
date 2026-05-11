// ClipViewerPage.jsx — REC-6.3: Clip Editor (trim tool), REC-6.14: Chat Replay on VOD
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, collection, query, orderBy, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import useAppStore from '@store/useAppStore';

// REC-6.3: Trim Tool — drag start/end handles on timeline
function ClipTrimTool({ duration, trimStart, trimEnd, onChangeTrim }) {
  const barRef = useRef(null);
  const dragging = useRef(null);

  const handlePointerDown = (handle, e) => {
    e.preventDefault();
    dragging.current = handle;
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  };

  const handlePointerMove = e => {
    if (!dragging.current || !barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const pct = x / rect.width;
    const t = Math.round(pct * duration * 10) / 10;
    if (dragging.current === 'start') onChangeTrim(Math.min(t, trimEnd - 1), trimEnd);
    else onChangeTrim(trimStart, Math.max(t, trimStart + 1));
  };

  const handlePointerUp = () => {
    dragging.current = null;
    document.removeEventListener('pointermove', handlePointerMove);
    document.removeEventListener('pointerup', handlePointerUp);
  };

  const startPct = duration > 0 ? (trimStart / duration) * 100 : 0;
  const endPct = duration > 0 ? (trimEnd / duration) * 100 : 100;
  const fmtT = s => `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;

  return (
    <div style={{ padding:'0 0 8px' }}>
      <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'12px', marginBottom:'8px' }}>✂️ Trim Clip</div>
      <div style={{ position:'relative', height:'36px', margin:'0 8px' }} ref={barRef}>
        {/* Timeline track */}
        <div style={{ position:'absolute', top:'50%', left:0, right:0, height:'6px',
          transform:'translateY(-50%)', background:'#334155', borderRadius:'3px' }} />
        {/* Selected range */}
        <div style={{ position:'absolute', top:'50%', height:'6px',
          transform:'translateY(-50%)', background:'#ef4444', borderRadius:'3px',
          left:`${startPct}%`, width:`${endPct - startPct}%` }} />
        {/* Start handle */}
        <div onPointerDown={e => handlePointerDown('start', e)}
          style={{ position:'absolute', top:'50%', transform:'translate(-50%,-50%)',
            left:`${startPct}%`, width:'18px', height:'28px', background:'#ef4444',
            borderRadius:'4px', cursor:'ew-resize', zIndex:2, border:'2px solid white',
            display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ width:'2px', height:'12px', background:'white', borderRadius:'1px' }} />
        </div>
        {/* End handle */}
        <div onPointerDown={e => handlePointerDown('end', e)}
          style={{ position:'absolute', top:'50%', transform:'translate(-50%,-50%)',
            left:`${endPct}%`, width:'18px', height:'28px', background:'#ef4444',
            borderRadius:'4px', cursor:'ew-resize', zIndex:2, border:'2px solid white',
            display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ width:'2px', height:'12px', background:'white', borderRadius:'1px' }} />
        </div>
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', marginTop:'4px', padding:'0 4px' }}>
        <span style={{ color:'#94a3b8', fontSize:'10px' }}>{fmtT(trimStart)}</span>
        <span style={{ color:'#64748b', fontSize:'10px' }}>{fmtT(duration)}</span>
        <span style={{ color:'#94a3b8', fontSize:'10px' }}>{fmtT(trimEnd)}</span>
      </div>
    </div>
  );
}

export default function ClipViewerPage() {
  const { id: clipId } = useParams();
  const navigate = useNavigate();
  const showToast = useAppStore(s => s.showToast);
  const uid = auth.currentUser?.uid;

  const videoRef = useRef(null);
  const [clip, setClip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);

  // REC-6.3: Trim state
  const [showTrimTool, setShowTrimTool] = useState(false);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(30);
  const [trimSaving, setTrimSaving] = useState(false);

  // REC-6.14: Chat replay messages from parent stream
  const [chatReplay, setChatReplay] = useState([]);
  const [visibleChat, setVisibleChat] = useState([]);
  const [showChatReplay, setShowChatReplay] = useState(false);

  // Load clip doc
  useEffect(() => {
    if (!clipId) return;
    const unsub = onSnapshot(doc(db, 'clips', clipId), snap => {
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() };
        setClip(data);
        if (data.trimEnd) setTrimEnd(data.trimEnd);
        if (data.trimStart != null) setTrimStart(data.trimStart);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [clipId]);

  // REC-6.14: Load chat messages from the parent stream for replay
  useEffect(() => {
    if (!clip?.streamId) return;
    const q = query(
      collection(db, 'streams', clip.streamId, 'messages'),
      orderBy('timestamp', 'asc')
    );
    const unsub = onSnapshot(q, snap => {
      setChatReplay(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [clip?.streamId]);

  // REC-6.14: Sync visible chat messages to video current time + clip offset
  useEffect(() => {
    if (!showChatReplay || chatReplay.length === 0 || !clip?.timestamp) return;
    const clipOffset = clip.timestamp; // stream time when clip starts
    const now = currentTime + clipOffset;
    // Only show messages timestamped before the current playback position
    const visible = chatReplay.filter(msg => {
      const t = msg.timestamp?.seconds || 0;
      const streamStart = clip.streamStartTime?.seconds || 0;
      const relTime = t - streamStart;
      return relTime <= now + 5; // 5s buffer
    });
    setVisibleChat(visible.slice(-20)); // show last 20
  }, [currentTime, chatReplay, clip, showChatReplay]);

  const handleVideoLoaded = () => {
    const v = videoRef.current;
    if (v) {
      const d = v.duration || 30;
      setDuration(d);
      setTrimEnd(clip?.trimEnd || d);
      setTrimStart(clip?.trimStart || 0);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const t = videoRef.current.currentTime;
      setCurrentTime(t);
      // Enforce trim end boundary
      if (t >= trimEnd) {
        videoRef.current.pause();
        setPlaying(false);
      }
    }
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (playing) { v.pause(); setPlaying(false); }
    else {
      if (v.currentTime < trimStart || v.currentTime >= trimEnd) v.currentTime = trimStart;
      v.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  // REC-6.3: Save trim to Firestore
  const saveTrim = async () => {
    if (!clipId) return;
    setTrimSaving(true);
    try {
      await updateDoc(doc(db, 'clips', clipId), {
        trimStart, trimEnd,
        trimmedDuration: trimEnd - trimStart,
        updatedAt: serverTimestamp(),
      });
      showToast('✂️ Trim saved!');
      setShowTrimTool(false);
    } catch { showToast('Save failed'); }
    finally { setTrimSaving(false); }
  };

  const shareClip = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: clip?.title || 'Clip', url });
      else { await navigator.clipboard.writeText(url); showToast('Link copied!'); }
    } catch {}
  };

  const fmtT = s => `${Math.floor((s||0)/60)}:${String(Math.floor((s||0)%60)).padStart(2,'0')}`;

  if (loading) return (
    <div style={{ background:'#0a0a18', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ color:'#94a3b8' }}>Loading clip…</div>
    </div>
  );

  if (!clip) return (
    <div style={{ background:'#0a0a18', minHeight:'100vh', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', gap:'12px' }}>
      <div style={{ fontSize:'40px' }}>✂️</div>
      <div style={{ color:'#f1f5f9', fontWeight:700 }}>Clip not found</div>
      <button onClick={() => navigate('/live')}
        style={{ background:'#1e293b', border:'none', borderRadius:'10px', padding:'10px 20px', color:'#94a3b8', cursor:'pointer' }}>
        ← Browse Live
      </button>
    </div>
  );

  const isOwner = clip.uid === uid;

  return (
    <div style={{ background:'#0a0a18', minHeight:'100vh', paddingBottom:'80px' }}>
      {/* Header */}
      <div style={{ padding:'10px 16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', gap:'10px' }}>
        <button onClick={() => navigate(-1)} style={{ background:'none', border:'none', color:'#94a3b8', fontSize:'20px', cursor:'pointer' }}>←</button>
        <div style={{ flex:1 }}>
          <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'14px' }}>{clip.title || 'Clip'}</div>
          <div style={{ color:'#64748b', fontSize:'11px' }}>{clip.streamerName}</div>
        </div>
        <button onClick={shareClip}
          style={{ background:'#1e293b', border:'none', borderRadius:'8px', padding:'6px 12px', color:'#94a3b8', fontSize:'12px', cursor:'pointer' }}>
          📤 Share
        </button>
      </div>

      {/* Video Player */}
      <div style={{ position:'relative', width:'100%', aspectRatio:'16/9', background:'#000', maxHeight:'260px' }}>
        <video ref={videoRef}
          src={clip.videoUrl || clip.hlsUrl}
          onLoadedMetadata={handleVideoLoaded}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setPlaying(false)}
          playsInline
          style={{ width:'100%', height:'100%', objectFit:'contain' }} />

        {/* Play/pause overlay */}
        <div onClick={togglePlay} style={{ position:'absolute', inset:0, display:'flex',
          alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
          {!playing && (
            <div style={{ width:'56px', height:'56px', borderRadius:'50%', background:'rgba(0,0,0,0.7)',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px' }}>▶</div>
          )}
        </div>

        {/* REC-6.14: Chat replay overlay */}
        {showChatReplay && visibleChat.length > 0 && (
          <div style={{ position:'absolute', bottom:'8px', left:'8px', right:'8px', maxHeight:'120px',
            overflowY:'auto', display:'flex', flexDirection:'column', gap:'2px', pointerEvents:'none' }}>
            {visibleChat.slice(-8).map(msg => (
              <div key={msg.id} style={{ background:'rgba(0,0,0,0.75)', borderRadius:'6px',
                padding:'3px 8px', display:'inline-flex', gap:'4px', alignSelf:'flex-start' }}>
                <span style={{ color:'#f59e0b', fontSize:'10px', fontWeight:700 }}>{msg.userName}:</span>
                <span style={{ color:'#f1f5f9', fontSize:'10px' }}>{msg.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Time display */}
        <div style={{ position:'absolute', top:'8px', right:'8px', background:'rgba(0,0,0,0.7)',
          borderRadius:'4px', padding:'2px 6px', color:'white', fontSize:'10px', fontWeight:700 }}>
          {fmtT(currentTime)} / {fmtT(trimEnd - trimStart)}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height:'3px', background:'#1e293b', position:'relative' }}>
        <div style={{ position:'absolute', top:0, left:0, height:'100%', background:'#ef4444',
          width:`${duration > 0 ? ((currentTime - trimStart) / (trimEnd - trimStart)) * 100 : 0}%`,
          transition:'width 0.2s linear' }} />
      </div>

      {/* Controls row */}
      <div style={{ display:'flex', gap:'8px', padding:'10px 16px', borderBottom:'1px solid #1e293b' }}>
        <button onClick={togglePlay}
          style={{ background:'linear-gradient(135deg,#ef4444,#dc2626)', border:'none', borderRadius:'10px',
            padding:'8px 16px', color:'white', fontWeight:800, fontSize:'14px', cursor:'pointer' }}>
          {playing ? '⏸' : '▶'}
        </button>

        {/* REC-6.3: Trim button — owner only */}
        {isOwner && (
          <button onClick={() => setShowTrimTool(v => !v)}
            style={{ background: showTrimTool ? '#334155' : '#1e293b', border:'1px solid #334155',
              borderRadius:'10px', padding:'8px 14px', color: showTrimTool ? '#f1f5f9' : '#94a3b8',
              fontSize:'12px', fontWeight:700, cursor:'pointer' }}>
            ✂️ Trim
          </button>
        )}

        {/* REC-6.14: Chat replay toggle */}
        <button onClick={() => setShowChatReplay(v => !v)}
          style={{ background: showChatReplay ? '#334155' : '#1e293b', border:'1px solid #334155',
            borderRadius:'10px', padding:'8px 14px', color: showChatReplay ? '#f1f5f9' : '#94a3b8',
            fontSize:'12px', fontWeight:700, cursor:'pointer' }}>
          💬 {showChatReplay ? 'Hide Chat' : 'Chat Replay'}
        </button>

        <button onClick={shareClip}
          style={{ marginLeft:'auto', background:'#1e293b', border:'1px solid #334155', borderRadius:'10px',
            padding:'8px 14px', color:'#94a3b8', fontSize:'12px', cursor:'pointer' }}>
          📤
        </button>
      </div>

      {/* REC-6.3: Trim tool panel */}
      {showTrimTool && isOwner && (
        <div style={{ background:'#1e293b', borderBottom:'1px solid #334155', padding:'14px 16px' }}>
          <ClipTrimTool
            duration={duration}
            trimStart={trimStart}
            trimEnd={trimEnd}
            onChangeTrim={(s, e) => {
              setTrimStart(s);
              setTrimEnd(e);
              if (videoRef.current) videoRef.current.currentTime = s;
            }}
          />
          <div style={{ display:'flex', gap:'8px', marginTop:'10px' }}>
            <button onClick={saveTrim} disabled={trimSaving}
              style={{ background:'linear-gradient(135deg,#22c55e,#16a34a)', border:'none', borderRadius:'8px',
                padding:'8px 18px', color:'white', fontWeight:700, fontSize:'13px', cursor:'pointer' }}>
              {trimSaving ? '⏳ Saving…' : '💾 Save Trim'}
            </button>
            <button onClick={() => { setTrimStart(0); setTrimEnd(duration); }}
              style={{ background:'none', border:'1px solid #334155', borderRadius:'8px', padding:'8px 14px',
                color:'#64748b', fontSize:'12px', cursor:'pointer' }}>
              Reset
            </button>
          </div>
          <div style={{ color:'#64748b', fontSize:'11px', marginTop:'6px' }}>
            Clip length: {fmtT(trimEnd - trimStart)} (was {fmtT(duration)})
          </div>
        </div>
      )}

      {/* Clip info */}
      <div style={{ padding:'14px 16px' }}>
        <div style={{ color:'#f1f5f9', fontWeight:800, fontSize:'15px', marginBottom:'4px' }}>{clip.title}</div>
        <div style={{ color:'#64748b', fontSize:'12px', marginBottom:'10px' }}>
          From: {clip.streamTitle || 'Live Stream'} · {fmtT(clip.timestamp)} timestamp
        </div>

        {/* REC-6.14: Chat replay info */}
        <div style={{ background:'#1e293b', borderRadius:'10px', padding:'10px 12px' }}>
          <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'12px', marginBottom:'4px' }}>💬 Chat Replay</div>
          <div style={{ color:'#64748b', fontSize:'11px', marginBottom:'8px' }}>
            {chatReplay.length > 0
              ? `${chatReplay.length} messages from the original stream. Enable Chat Replay to see messages as they appeared.`
              : 'No chat history available for this stream.'}
          </div>
          {!showChatReplay && chatReplay.length > 0 && (
            <button onClick={() => { setShowChatReplay(true); showToast('Chat replay enabled!'); }}
              style={{ background:'linear-gradient(135deg,#6366f1,#818cf8)', border:'none', borderRadius:'8px',
                padding:'7px 14px', color:'white', fontWeight:700, fontSize:'12px', cursor:'pointer' }}>
              Enable Chat Replay
            </button>
          )}
          {showChatReplay && (
            <div style={{ maxHeight:'180px', overflowY:'auto', display:'flex', flexDirection:'column', gap:'4px' }}>
              {visibleChat.map(msg => (
                <div key={msg.id} style={{ display:'flex', gap:'6px' }}>
                  <span style={{ color:'#f59e0b', fontSize:'11px', fontWeight:700, flexShrink:0 }}>{msg.userName}:</span>
                  <span style={{ color:'#e2e8f0', fontSize:'12px' }}>{msg.text}</span>
                </div>
              ))}
              {visibleChat.length === 0 && <div style={{ color:'#334155', fontSize:'12px' }}>Play the clip to see chat</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
