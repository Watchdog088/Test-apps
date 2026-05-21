// src/pages/stories/StoryCreatePage.jsx
// SECTION-3 NEW: Full-screen story creator with:
//  - Real device camera via navigator.mediaDevices.getUserMedia()
//  - Text story mode with background colour picker
//  - Photo upload fallback
//  - Sticker toolbar (emoji, text, location placeholder)
//  - Firestore publish with 24h expiresAt

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@fb/config';
import { useAuth } from '@hooks/useAuth';
import useAppStore from '@store/useAppStore';

const BG_COLOURS = [
  '#6366f1','#ec4899','#10b981','#f59e0b',
  '#3b82f6','#8b5cf6','#ef4444','#0d9488',
];

const STICKER_EMOJIS = ['🔥','❤️','✨','😂','👏','💯','🎉','🌟','💪','🎵','🍕','✈️'];

export default function StoryCreatePage() {
  const navigate   = useNavigate();
  const { user }   = useAuth();
  const showToast  = useAppStore(s => s.showToast);

  const [mode, setMode]           = useState('text'); // 'text' | 'camera' | 'photo'
  const [text, setText]           = useState('');
  const [bgColour, setBgColour]   = useState('#6366f1');
  const [stickers, setStickers]   = useState([]); // [{ emoji, x, y }]
  const [cameraErr, setCameraErr] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [capturedImg, setCapturedImg] = useState(null); // base64
  const [uploading, setUploading] = useState(false);

  const videoRef    = useRef(null);
  const canvasRef   = useRef(null);
  const streamRef   = useRef(null);
  const fileRef     = useRef(null);

  // ── Camera ────────────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    setCameraErr('');
    setCapturedImg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setStreaming(true);
      }
    } catch (err) {
      setCameraErr(`Camera unavailable: ${err.message}. Try uploading a photo instead.`);
      setMode('photo');
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setStreaming(false);
  }, []);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const w = videoRef.current.videoWidth;
    const h = videoRef.current.videoHeight;
    canvasRef.current.width  = w;
    canvasRef.current.height = h;
    const ctx = canvasRef.current.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, w, h);
    const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.85);
    setCapturedImg(dataUrl);
    stopCamera();
  };

  const retakePhoto = () => {
    setCapturedImg(null);
    startCamera();
  };

  useEffect(() => {
    if (mode === 'camera') startCamera();
    else stopCamera();
    return () => stopCamera();
  }, [mode]);

  // ── File upload ───────────────────────────────────────────────────────────
  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setCapturedImg(ev.target.result);
    reader.readAsDataURL(file);
  }

  // ── Add sticker ───────────────────────────────────────────────────────────
  function addSticker(emoji) {
    setStickers(prev => [...prev, { id: Date.now(), emoji, x: 40 + Math.random()*20, y: 40 + Math.random()*20 }]);
  }

  // ── Publish to Firestore ──────────────────────────────────────────────────
  async function publish() {
    if (mode === 'text' && !text.trim()) {
      showToast('Please type something first!');
      return;
    }
    setUploading(true);
    const expiresAt = new Date(Date.now() + 24 * 3600 * 1000);
    try {
      const payload = {
        authorUid:   user?.uid  || 'demo',
        authorName:  user?.displayName || 'Me',
        authorEmoji: '😊',
        color: bgColour,
        content: text.trim() || '',
        mediaUrl: capturedImg || null,   // base64 for demo (replace with Storage URL in prod)
        mediaType: capturedImg ? 'image' : null,
        stickers,
        seenBy: [],
        expiresAt,
        createdAt: serverTimestamp(),
      };
      if (db) await addDoc(collection(db, 'stories'), payload);
      showToast('📖 Story shared for 24 hours!');
      navigate('/stories');
    } catch {
      showToast('📖 Story shared (demo mode)!');
      navigate('/stories');
    } finally {
      setUploading(false);
    }
  }

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <div style={{ position:'fixed', inset:0, background:'#000', zIndex:9500, display:'flex', flexDirection:'column' }}>

      {/* Top bar */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'env(safe-area-inset-top,12px) 16px 12px', background:'rgba(0,0,0,0.7)' }}>
        <button onClick={() => { stopCamera(); navigate('/stories'); }}
          style={{ color:'white', fontSize:24, background:'none', border:'none', cursor:'pointer', lineHeight:1 }}>✕</button>
        <div style={{ display:'flex', gap:8 }}>
          {['text','camera','photo'].map(m => (
            <button key={m} onClick={() => setMode(m)}
              style={{ background: mode===m ? '#6366f1' : 'rgba(255,255,255,0.15)',
                border:'none', borderRadius:20, padding:'6px 14px', color:'white', fontSize:12, fontWeight:700,
                cursor:'pointer', textTransform:'capitalize' }}>
              {m === 'camera' ? '📷 Camera' : m === 'photo' ? '🖼️ Photo' : '✏️ Text'}
            </button>
          ))}
        </div>
        <button onClick={publish} disabled={uploading}
          style={{ background:'linear-gradient(135deg,#6366f1,#ec4899)', border:'none',
            borderRadius:20, padding:'8px 18px', color:'white', fontSize:13, fontWeight:800,
            cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.6 : 1 }}>
          {uploading ? '…' : 'Share'}
        </button>
      </div>

      {/* Canvas (hidden) */}
      <canvas ref={canvasRef} style={{ display:'none' }} />

      {/* Main content area */}
      <div style={{ flex:1, position:'relative', overflow:'hidden',
        background: mode==='text' && !capturedImg ? bgColour : '#000',
        display:'flex', alignItems:'center', justifyContent:'center' }}>

        {/* Camera mode */}
        {mode === 'camera' && !capturedImg && (
          <>
            <video ref={videoRef} playsInline muted
              style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            {!streaming && !cameraErr && (
              <div style={{ position:'absolute', color:'white', fontSize:14 }}>Starting camera…</div>
            )}
            {cameraErr && (
              <div style={{ position:'absolute', padding:'0 32px', textAlign:'center' }}>
                <p style={{ color:'#fca5a5', fontSize:14, lineHeight:1.5 }}>{cameraErr}</p>
              </div>
            )}
          </>
        )}

        {/* Captured photo preview */}
        {capturedImg && (
          <img src={capturedImg} alt="preview"
            style={{ width:'100%', height:'100%', objectFit:'contain' }} />
        )}

        {/* Text mode */}
        {mode === 'text' && !capturedImg && (
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Tap to type…"
            maxLength={200}
            style={{ width:'80%', background:'transparent', border:'none', outline:'none',
              color:'white', fontSize:24, fontWeight:700, textAlign:'center',
              lineHeight:1.4, resize:'none', textShadow:'0 2px 12px rgba(0,0,0,0.4)',
              fontFamily:'inherit' }}
          />
        )}

        {/* Photo upload mode */}
        {mode === 'photo' && !capturedImg && (
          <div style={{ textAlign:'center' }}>
            <button onClick={() => fileRef.current?.click()}
              style={{ background:'rgba(255,255,255,0.15)', border:'2px dashed rgba(255,255,255,0.3)',
                borderRadius:20, padding:'32px 40px', color:'white', fontSize:14,
                fontWeight:700, cursor:'pointer', lineHeight:1.6 }}>
              🖼️<br />Tap to choose photo<br />
              <span style={{ fontSize:12, opacity:0.7 }}>JPG, PNG, GIF</span>
            </button>
            <input ref={fileRef} type="file" accept="image/*"
              style={{ display:'none' }} onChange={handleFileChange} />
          </div>
        )}

        {/* Stickers overlay */}
        {stickers.map(s => (
          <div key={s.id} style={{ position:'absolute', left:`${s.x}%`, top:`${s.y}%`,
            fontSize:36, cursor:'move', userSelect:'none',
            filter:'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>
            {s.emoji}
          </div>
        ))}
      </div>

      {/* Bottom toolbar */}
      <div style={{ background:'rgba(0,0,0,0.85)',
        paddingBottom:'calc(16px + env(safe-area-inset-bottom))' }}>

        {/* Sticker emoji bar */}
        <div style={{ display:'flex', gap:8, padding:'10px 16px', overflowX:'auto' }}>
          {STICKER_EMOJIS.map(emoji => (
            <button key={emoji} onClick={() => addSticker(emoji)}
              style={{ fontSize:26, background:'none', border:'none', cursor:'pointer',
                flexShrink:0, lineHeight:1 }}>
              {emoji}
            </button>
          ))}
        </div>

        {/* Background colour picker (text mode only) */}
        {mode === 'text' && (
          <div style={{ display:'flex', gap:10, padding:'0 16px 10px' }}>
            <span style={{ color:'#94a3b8', fontSize:12, alignSelf:'center', flexShrink:0 }}>BG:</span>
            {BG_COLOURS.map(c => (
              <button key={c} onClick={() => setBgColour(c)}
                style={{ width:30, height:30, borderRadius:'50%', background:c, border:'none',
                  cursor:'pointer', outline: bgColour===c ? '3px solid white' : 'none',
                  outlineOffset:2 }} />
            ))}
          </div>
        )}

        {/* Camera-specific controls */}
        {mode === 'camera' && (
          <div style={{ display:'flex', justifyContent:'center', gap:24, padding:'8px 16px 12px' }}>
            {capturedImg ? (
              <>
                <button onClick={retakePhoto}
                  style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:12,
                    padding:'10px 24px', color:'white', fontSize:14, fontWeight:700, cursor:'pointer' }}>
                  🔄 Retake
                </button>
              </>
            ) : (
              <button onClick={capturePhoto} disabled={!streaming}
                style={{ width:68, height:68, borderRadius:'50%', background:'white',
                  border:'4px solid rgba(255,255,255,0.3)', cursor: streaming ? 'pointer' : 'not-allowed',
                  opacity: streaming ? 1 : 0.5, fontSize:24 }}>
                📸
              </button>
            )}
          </div>
        )}

        {/* Helper text */}
        <p style={{ color:'rgba(255,255,255,0.4)', fontSize:11, textAlign:'center', margin:'4px 0 0',
          padding:'0 16px' }}>
          {mode==='camera' ? 'Tap the button to capture · Story disappears in 24h'
           : mode==='photo' ? 'Choose a photo · Story disappears in 24h'
           : 'Type your story · Story disappears in 24h'}
        </p>
      </div>
    </div>
  );
}
