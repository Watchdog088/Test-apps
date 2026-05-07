// LiveWatchPage.jsx — Full Viewer Experience
// LIVE-BUG-04: Real WebRTC video player via LivestreamViewer + HLS fallback
// UX-LIVE-01: Firestore real-time chat overlay
// POLISH-LIVE-01: Real-time viewer count
// POLISH-LIVE-06: Follow button
// UX-LIVE-10: Share button

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  doc, collection, addDoc, onSnapshot,
  updateDoc, increment, serverTimestamp, query, orderBy, limit,
} from 'firebase/firestore';
import { db, auth } from '@firebase/config';
import { LivestreamViewer, attachHlsPlayer } from '@services/livestream-webrtc';
import useAppStore from '@store/useAppStore';

const REACTIONS = ['❤️','🔥','😂','👏','🎉','😍'];

export default function LiveWatchPage() {
  const { streamId }    = useParams();
  const [params]        = useSearchParams();
  const isVod           = params.get('vod') === 'true';
  const navigate        = useNavigate();
  const showToast       = useAppStore(s => s.showToast);

  const videoRef        = useRef(null);
  const chatEndRef      = useRef(null);
  const viewerRef       = useRef(null);
  const hlsRef          = useRef(null);

  const [stream, setStream]           = useState(null);
  const [messages, setMessages]       = useState([]);
  const [chatInput, setChatInput]     = useState('');
  const [following, setFollowing]     = useState(false);
  const [connected, setConnected]     = useState(false);
  const [floatingEmojis, setFloat]    = useState([]);
  const [connectionState, setConnState] = useState('connecting'); // 'connecting' | 'live' | 'ended' | 'error'

  // ── Subscribe to stream doc ───────────────────────────────────────────────
  useEffect(() => {
    if (!streamId) return;
    const unsub = onSnapshot(doc(db, 'streams', streamId), snap => {
      if (!snap.exists()) { setStream(null); return; }
      const data = { id: snap.id, ...snap.data() };
      setStream(data);

      if (data.status === 'ended' && !isVod) setConnState('ended');
    });
    return unsub;
  }, [streamId, isVod]);

  // ── Increment viewer count on join, decrement on leave ───────────────────
  useEffect(() => {
    if (!streamId) return;
    const ref = doc(db, 'streams', streamId);
    updateDoc(ref, { viewerCount: increment(1) }).catch(() => {});
    return () => { updateDoc(ref, { viewerCount: increment(-1) }).catch(() => {}); };
  }, [streamId]);

  // ── Live chat subscription ────────────────────────────────────────────────
  useEffect(() => {
    if (!streamId) return;
    const q = query(
      collection(db, 'streams', streamId, 'messages'),
      orderBy('createdAt', 'asc'),
      limit(100)
    );
    const unsub = onSnapshot(q, snap => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setMessages(msgs);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    });
    return unsub;
  }, [streamId]);

  // ── WebRTC viewer connection — LIVE-BUG-04 ───────────────────────────────
  useEffect(() => {
    if (!streamId || !videoRef.current || isVod) return;

    const viewer = new LivestreamViewer({
      streamId,
      videoElement: videoRef.current,
      onConnected:    () => { setConnected(true); setConnState('live'); },
      onDisconnected: () => { setConnected(false); setConnState('ended'); },
      onError:        (err) => {
        console.warn('[LiveWatchPage] WebRTC error, trying HLS fallback:', err.message);
        // HLS fallback — if stream has an HLS URL in Firestore
        if (stream?.hlsUrl && videoRef.current) {
          hlsRef.current = attachHlsPlayer(videoRef.current, stream.hlsUrl);
          setConnState('live');
        } else {
          setConnState('error');
        }
      },
    });

    viewer.connect();
    viewerRef.current = viewer;

    return () => {
      viewer.disconnect();
      if (hlsRef.current?.destroy) hlsRef.current.destroy();
    };
  }, [streamId, isVod]);

  // ── VOD playback — POLISH-LIVE-10 ────────────────────────────────────────
  useEffect(() => {
    if (!isVod || !stream?.vodUrl || !videoRef.current) return;
    hlsRef.current = attachHlsPlayer(videoRef.current, stream.vodUrl);
    setConnState('live');
  }, [isVod, stream?.vodUrl]);

  // ── Send chat message ─────────────────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    const text = chatInput.trim();
    if (!text || !auth.currentUser) return;
    setChatInput('');
    try {
      await addDoc(collection(db, 'streams', streamId, 'messages'), {
        text,
        userId:   auth.currentUser.uid,
        userName: auth.currentUser.displayName || 'Viewer',
        avatar:   auth.currentUser.photoURL || null,
        createdAt: serverTimestamp(),
      });
    } catch (e) { console.error(e); }
  }, [chatInput, streamId]);

  // ── Send reaction ─────────────────────────────────────────────────────────
  const sendReaction = useCallback(async (emoji) => {
    const id = Date.now();
    setFloat(prev => [...prev, { id, emoji }]);
    setTimeout(() => setFloat(prev => prev.filter(e => e.id !== id)), 2000);

    if (!auth.currentUser) return;
    await addDoc(collection(db, 'streams', streamId, 'messages'), {
      text:     emoji,
      type:     'reaction',
      userId:   auth.currentUser.uid,
      userName: auth.currentUser.displayName || 'Viewer',
      createdAt: serverTimestamp(),
    }).catch(() => {});
  }, [streamId]);

  // ── Share ─────────────────────────────────────────────────────────────────
  const handleShare = () => {
    const url = `${window.location.origin}/live/watch/${streamId}`;
    if (navigator.share) {
      navigator.share({ title: stream?.title || 'Live Stream', url }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(url);
      showToast('🔗 Link copied!');
    }
  };

  const formatViewers = n => {
    if (!n) return '0';
    if (n >= 1000) return `${(n/1000).toFixed(1)}K`;
    return String(n);
  };

  return (
    <div style={{ background:'#000', minHeight:'100vh', display:'flex', flexDirection:'column', position:'relative' }}>

      {/* ── Video Player — LIVE-BUG-04 ── */}
      <div style={{ position:'relative', width:'100%', paddingTop:'56.25%', background:'#0a0a18' }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={false}
          controls={isVod}
          style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', objectFit:'cover' }}
        />

        {/* Overlay header */}
        <div style={{
          position:'absolute', top:0, left:0, right:0,
          padding:'12px 16px',
          background:'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)',
          display:'flex', alignItems:'center', gap:'10px',
        }}>
          <button onClick={() => navigate('/live')} style={{ background:'none', border:'none', color:'white', fontSize:'20px', cursor:'pointer' }}>←</button>
          <div style={{
            width:'32px', height:'32px', borderRadius:'50%',
            background:'linear-gradient(135deg,#6366f1,#ec4899)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'14px', overflow:'hidden', border:'2px solid #ef4444', flexShrink:0,
          }}>
            {stream?.userAvatar
              ? <img src={stream.userAvatar} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              : (stream?.userName?.[0] || '?').toUpperCase()
            }
          </div>
          <span style={{ color:'white', fontWeight:700, fontSize:'13px', flex:1 }}>
            {stream?.userName || 'Live Stream'}
          </span>
          {connectionState === 'live' && (
            <div style={{
              background:'#ef4444', borderRadius:'5px', fontSize:'9px',
              fontWeight:800, color:'white', padding:'2px 7px',
            }}>
              {isVod ? '▶ VOD' : '● LIVE'}
            </div>
          )}
          {connectionState === 'connecting' && (
            <div style={{ color:'#94a3b8', fontSize:'11px' }}>Connecting…</div>
          )}
          {connectionState === 'ended' && (
            <div style={{ color:'#f59e0b', fontSize:'11px' }}>Stream ended</div>
          )}
          {connectionState === 'error' && !stream?.hlsUrl && !stream?.vodUrl && (
            <div style={{ color:'#ef4444', fontSize:'11px' }}>Connection failed</div>
          )}
        </div>

        {/* Viewer count overlay */}
        <div style={{
          position:'absolute', top:'12px', right:'16px',
          background:'rgba(0,0,0,0.6)', borderRadius:'10px',
          padding:'3px 10px', fontSize:'11px', color:'white', fontWeight:700,
        }}>
          👁️ {formatViewers(stream?.viewerCount)}
        </div>

        {/* Floating emoji reactions */}
        {floatingEmojis.map(({ id, emoji }) => (
          <div key={id} style={{
            position:'absolute', bottom:'20px', right:'20px',
            fontSize:'28px', animation:'floatUp 2s ease-out forwards', pointerEvents:'none',
          }}>
            {emoji}
          </div>
        ))}
      </div>

      {/* ── Stream Info Bar ── */}
      <div style={{
        padding:'10px 16px',
        background:'#0f172a',
        display:'flex', alignItems:'center', gap:'12px',
        borderBottom:'1px solid #1e293b',
      }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'13px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {stream?.title || 'Live Stream'}
          </div>
          {stream?.category && (
            <div style={{ color:'#818cf8', fontSize:'10px', marginTop:'2px' }}>{stream.category}</div>
          )}
        </div>
        <button
          onClick={() => setFollowing(f => !f)}
          style={{
            background: following ? 'rgba(99,102,241,0.3)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            border:'none', borderRadius:'12px', padding:'7px 16px',
            color:'white', fontWeight:700, fontSize:'12px', cursor:'pointer', flexShrink:0,
          }}
        >
          {following ? '✓ Following' : '+ Follow'}
        </button>
        <button
          onClick={handleShare}
          style={{ background:'rgba(16,185,129,0.15)', border:'none', borderRadius:'12px', padding:'7px 12px', color:'#10b981', fontSize:'16px', cursor:'pointer' }}
        >
          ↗️
        </button>
      </div>

      {/* ── Live Chat — UX-LIVE-01 ── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', background:'#0a0a18', maxHeight:'200px', overflowY:'auto', padding:'10px 16px' }}>
        {messages.filter(m => m.type !== 'reaction').map(msg => (
          <div key={msg.id} style={{ display:'flex', gap:'8px', marginBottom:'6px', alignItems:'flex-start' }}>
            <div style={{
              width:'22px', height:'22px', borderRadius:'50%', flexShrink:0,
              background:'linear-gradient(135deg,#6366f1,#ec4899)',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:'9px', color:'white',
            }}>
              {msg.userName?.[0] || '?'}
            </div>
            <div>
              <span style={{ color:'#818cf8', fontSize:'11px', fontWeight:700 }}>{msg.userName} </span>
              <span style={{ color:'#cbd5e1', fontSize:'11px' }}>{msg.text}</span>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* ── Reaction Bar ── */}
      <div style={{
        display:'flex', gap:'10px', padding:'8px 16px',
        background:'#0f172a', borderTop:'1px solid #1e293b', overflowX:'auto', scrollbarWidth:'none',
      }}>
        {REACTIONS.map(emoji => (
          <button
            key={emoji}
            onClick={() => sendReaction(emoji)}
            style={{ background:'none', border:'none', fontSize:'22px', cursor:'pointer', flexShrink:0 }}
          >
            {emoji}
          </button>
        ))}
        <div style={{ flex:1 }} />
        <button onClick={handleShare} style={{ background:'none', border:'none', color:'#10b981', fontSize:'13px', cursor:'pointer', fontWeight:700, flexShrink:0 }}>
          🎁 Gift
        </button>
      </div>

      {/* ── Chat Input ── */}
      <div style={{
        display:'flex', gap:'10px', padding:'10px 16px 24px',
        background:'#0f172a', borderTop:'1px solid #1e293b',
      }}>
        <input
          value={chatInput}
          onChange={e => setChatInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Say something…"
          maxLength={300}
          style={{
            flex:1, background:'#1e293b', border:'1px solid #334155', borderRadius:'20px',
            padding:'10px 16px', color:'#f1f5f9', fontSize:'13px', outline:'none',
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            background:'linear-gradient(135deg,#6366f1,#8b5cf6)',
            border:'none', borderRadius:'20px', padding:'10px 18px',
            color:'white', fontWeight:700, fontSize:'13px', cursor:'pointer',
          }}
        >
          Send
        </button>
      </div>

      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-80px) scale(1.4); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
