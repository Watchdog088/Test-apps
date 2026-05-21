// src/pages/dating/SpeedDatingPage.jsx
// SECTION 5 — SPEED DATING ROOM  (/dating/speed)
// May 2026 — Timed video dates with multiple people

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '@store/useAppStore';

const PAGE_BG = 'linear-gradient(160deg,#0a0a18 0%,#12091e 60%,#0a0a18 100%)';
const ROUND_DURATION = 180; // 3 minutes per round
const LOBBY_PARTICIPANTS = [
  { id:1, name:'Jordan',  emoji:'🌸', color:'#7c3aed', age:26, city:'Brooklyn' },
  { id:2, name:'Alex',    emoji:'🔥', color:'#db2777', age:28, city:'Manhattan' },
  { id:3, name:'Sam',     emoji:'⚡', color:'#0891b2', age:24, city:'Queens' },
  { id:4, name:'Riley',   emoji:'💫', color:'#d97706', age:30, city:'Hoboken' },
  { id:5, name:'Casey',   emoji:'🌙', color:'#16a34a', age:27, city:'Jersey City' },
  { id:6, name:'Morgan',  emoji:'💜', color:'#9333ea', age:25, city:'Brooklyn' },
];

const ICE_BREAKERS = [
  "What's your go-to order at a coffee shop?",
  "If you could live anywhere in the world, where would it be?",
  "What's the last show you binge-watched?",
  "Describe your perfect weekend in 3 words.",
  "What's one thing you're really proud of this year?",
  "Beach, mountains, or city?",
  "What skill do you wish you had?",
];

export default function SpeedDatingPage() {
  const navigate  = useNavigate();
  const showToast = useAppStore(s => s.showToast);
  const [phase, setPhase]         = useState('lobby'); // 'lobby' | 'round' | 'break' | 'results'
  const [timeLeft, setTimeLeft]   = useState(ROUND_DURATION);
  const [round, setRound]         = useState(0);
  const [liked, setLiked]         = useState([]);
  const [passed, setPassed]       = useState([]);
  const [matches, setMatches]     = useState([]);
  const [iceBreaker, setIceBreaker] = useState(ICE_BREAKERS[0]);
  const [cameraOn, setCameraOn]   = useState(false);
  const [micOn, setMicOn]         = useState(false);
  const [joined, setJoined]       = useState(false);
  const videoRef = useRef(null);

  const currentPartner = LOBBY_PARTICIPANTS[round % LOBBY_PARTICIPANTS.length];
  const totalRounds    = Math.min(LOBBY_PARTICIPANTS.length, 5);

  // Timer countdown
  useEffect(() => {
    if (phase !== 'round') return;
    if (timeLeft <= 0) {
      // Round ended — go to break
      setPhase('break');
      setTimeout(() => {
        if (round + 1 >= totalRounds) {
          // Compute matches
          const newMatches = liked.filter(id =>
            LOBBY_PARTICIPANTS.find(p => p.id === id)
          );
          setMatches(newMatches);
          setPhase('results');
        } else {
          setRound(r => r + 1);
          setTimeLeft(ROUND_DURATION);
          setIceBreaker(ICE_BREAKERS[Math.floor(Math.random() * ICE_BREAKERS.length)]);
          setPhase('round');
        }
      }, 4000);
      return;
    }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, timeLeft, round, liked, totalRounds]);

  const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const handleJoin = async () => {
    // Request camera+mic access
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraOn(true); setMicOn(true);
    } catch {
      showToast('📷 Camera access denied — joining with audio only', 'warning');
    }
    setJoined(true);
  };

  const handleStart = () => {
    setPhase('round');
    setTimeLeft(ROUND_DURATION);
    setIceBreaker(ICE_BREAKERS[0]);
    showToast('🚀 Speed Dating started! 3 minutes per round.', 'success');
  };

  const handleLike = () => {
    setLiked(prev => [...prev, currentPartner.id]);
    showToast(`💚 You liked ${currentPartner.name}!`, 'success');
  };

  const handlePass = () => {
    setPassed(prev => [...prev, currentPartner.id]);
    showToast(`👋 Passed on ${currentPartner.name}`, 'info');
  };

  const matchedProfiles = LOBBY_PARTICIPANTS.filter(p => matches.includes(p.id));

  return (
    <div style={{ minHeight:'100vh', background:PAGE_BG, paddingBottom:32,
      fontFamily:'system-ui,sans-serif', color:'#f1f5f9' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'16px 16px 8px' }}>
        <button onClick={() => navigate(-1)}
          style={{ width:36, height:36, borderRadius:'50%', background:'rgba(255,255,255,0.07)',
            border:'1px solid rgba(255,255,255,0.1)', color:'#94a3b8', fontSize:16,
            cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
          ←
        </button>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:18, fontWeight:800 }}>⚡ Speed Dating</div>
          <div style={{ fontSize:12, color:'#64748b' }}>3 minutes per date • {totalRounds} rounds</div>
        </div>
        {phase === 'round' && (
          <div style={{ background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)',
            borderRadius:20, padding:'6px 14px', fontSize:14, fontWeight:800, color:'#f87171' }}>
            ⏱ {fmtTime(timeLeft)}
          </div>
        )}
      </div>

      {/* LOBBY PHASE */}
      {phase === 'lobby' && (
        <div style={{ padding:'0 16px' }}>
          {/* Participants */}
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:13, fontWeight:700, color:'#64748b', marginBottom:12, letterSpacing:1 }}>
              {LOBBY_PARTICIPANTS.length} PEOPLE IN LOBBY
            </div>
            <div style={{ display:'flex', gap:10, overflowX:'auto', paddingBottom:8 }}>
              {LOBBY_PARTICIPANTS.map(p => (
                <div key={p.id} style={{ flexShrink:0, textAlign:'center' }}>
                  <div style={{ width:56, height:56, borderRadius:'50%', fontSize:24,
                    background:`linear-gradient(135deg,${p.color},#0a0a2e)`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    border:'2px solid rgba(99,102,241,0.3)', marginBottom:4 }}>
                    {p.emoji}
                  </div>
                  <div style={{ fontSize:11, color:'#94a3b8' }}>{p.name}</div>
                  <div style={{ fontSize:10, color:'#475569' }}>{p.age}</div>
                </div>
              ))}
            </div>
          </div>

          {/* How it works */}
          <div style={{ background:'rgba(99,102,241,0.07)', border:'1px solid rgba(99,102,241,0.15)',
            borderRadius:16, padding:'16px', marginBottom:20 }}>
            <div style={{ fontSize:14, fontWeight:800, color:'#a5b4fc', marginBottom:12 }}>⚡ How Speed Dating Works</div>
            {['You will have 3 minutes with each person','After the timer, you\'ll be matched with the next person',
              'At the end, see your mutual matches','Start a conversation with anyone you matched with!'].map((s,i) => (
              <div key={i} style={{ display:'flex', gap:10, marginBottom:8, alignItems:'flex-start' }}>
                <span style={{ background:'rgba(99,102,241,0.2)', borderRadius:'50%', width:20, height:20,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:11, fontWeight:800, color:'#a5b4fc', flexShrink:0 }}>{i+1}</span>
                <span style={{ fontSize:13, color:'#94a3b8', lineHeight:1.5 }}>{s}</span>
              </div>
            ))}
          </div>

          {/* Camera preview + controls */}
          <div style={{ background:'rgba(0,0,0,0.4)', borderRadius:20, overflow:'hidden', marginBottom:16 }}>
            <div style={{ height:200, display:'flex', alignItems:'center', justifyContent:'center',
              position:'relative', background:'#0a0a18' }}>
              {cameraOn ? (
                <video ref={videoRef} autoPlay muted playsInline
                  style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              ) : (
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:48, marginBottom:8 }}>📷</div>
                  <div style={{ fontSize:13, color:'#64748b' }}>Camera preview</div>
                </div>
              )}
            </div>
            <div style={{ display:'flex', gap:8, padding:'12px' }}>
              <button onClick={() => setCameraOn(c => !c)}
                style={{ flex:1, padding:'10px', borderRadius:14, cursor:'pointer', fontSize:12, fontWeight:700,
                  background: cameraOn ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                  border: cameraOn ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(239,68,68,0.3)',
                  color: cameraOn ? '#22c55e' : '#f87171', minHeight:44 }}>
                {cameraOn ? '📷 On' : '📷 Off'}
              </button>
              <button onClick={() => setMicOn(m => !m)}
                style={{ flex:1, padding:'10px', borderRadius:14, cursor:'pointer', fontSize:12, fontWeight:700,
                  background: micOn ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                  border: micOn ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(239,68,68,0.3)',
                  color: micOn ? '#22c55e' : '#f87171', minHeight:44 }}>
                {micOn ? '🎤 On' : '🎤 Off'}
              </button>
            </div>
          </div>

          {!joined ? (
            <button onClick={handleJoin}
              style={{ width:'100%', padding:'16px', borderRadius:16, border:'none', cursor:'pointer',
                background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'white',
                fontWeight:800, fontSize:15, minHeight:44 }}>
              📷 Join Lobby
            </button>
          ) : (
            <button onClick={handleStart}
              style={{ width:'100%', padding:'16px', borderRadius:16, border:'none', cursor:'pointer',
                background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'white',
                fontWeight:800, fontSize:15, minHeight:44 }}>
              ⚡ Start Speed Dating!
            </button>
          )}
        </div>
      )}

      {/* ROUND PHASE */}
      {phase === 'round' && (
        <div style={{ padding:'0 16px' }}>
          {/* Round indicator */}
          <div style={{ display:'flex', gap:4, marginBottom:16 }}>
            {Array.from({ length: totalRounds }).map((_, i) => (
              <div key={i} style={{ flex:1, height:4, borderRadius:2,
                background: i < round ? '#22c55e' : i === round ? '#6366f1' : 'rgba(255,255,255,0.1)' }} />
            ))}
          </div>
          <div style={{ textAlign:'center', fontSize:12, color:'#64748b', marginBottom:16 }}>
            Round {round + 1} of {totalRounds} — Dating {currentPartner.name}
          </div>

          {/* Video area */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:16 }}>
            {/* Partner video */}
            <div style={{ aspectRatio:'3/4', borderRadius:16, overflow:'hidden', position:'relative',
              background:`linear-gradient(135deg,${currentPartner.color},#0a0a2e)` }}>
              <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column',
                alignItems:'center', justifyContent:'center', gap:8 }}>
                <div style={{ fontSize:56 }}>{currentPartner.emoji}</div>
                <div style={{ fontSize:13, fontWeight:700 }}>{currentPartner.name}</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.6)' }}>{currentPartner.city}</div>
              </div>
              {/* Online indicator */}
              <div style={{ position:'absolute', top:8, left:8, background:'rgba(34,197,94,0.2)',
                border:'1px solid #22c55e', borderRadius:20, padding:'2px 8px', fontSize:10, color:'#22c55e' }}>
                🟢 Live
              </div>
            </div>
            {/* Self video */}
            <div style={{ aspectRatio:'3/4', borderRadius:16, overflow:'hidden', position:'relative',
              background:'rgba(0,0,0,0.5)', border:'1px solid rgba(255,255,255,0.1)' }}>
              {cameraOn ? (
                <video ref={videoRef} autoPlay muted playsInline
                  style={{ width:'100%', height:'100%', objectFit:'cover', transform:'scaleX(-1)' }} />
              ) : (
                <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ fontSize:40 }}>🙂</span>
                </div>
              )}
              <div style={{ position:'absolute', bottom:8, left:0, right:0, textAlign:'center',
                fontSize:11, color:'rgba(255,255,255,0.7)', fontWeight:700 }}>You</div>
            </div>
          </div>

          {/* Ice breaker */}
          <div style={{ background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.2)',
            borderRadius:16, padding:'12px 16px', marginBottom:16 }}>
            <div style={{ fontSize:11, color:'#6366f1', fontWeight:700, marginBottom:4 }}>💡 ICE BREAKER</div>
            <div style={{ fontSize:14, color:'#f1f5f9', lineHeight:1.5 }}>{iceBreaker}</div>
          </div>

          {/* Actions */}
          <div style={{ display:'flex', gap:12 }}>
            <button onClick={handlePass}
              style={{ flex:1, padding:'14px', borderRadius:16, cursor:'pointer',
                background:'transparent', border:'2px solid #ef4444', color:'#ef4444',
                fontWeight:800, fontSize:15, minHeight:44 }}>
              ✕ Pass
            </button>
            <button onClick={handleLike}
              disabled={liked.includes(currentPartner.id)}
              style={{ flex:1, padding:'14px', borderRadius:16, border:'none', cursor:'pointer',
                background: liked.includes(currentPartner.id) ? 'rgba(34,197,94,0.3)' : 'linear-gradient(135deg,#22c55e,#16a34a)',
                color:'white', fontWeight:800, fontSize:15, minHeight:44 }}>
              {liked.includes(currentPartner.id) ? '💚 Liked!' : '💚 Like'}
            </button>
          </div>
        </div>
      )}

      {/* BREAK PHASE */}
      {phase === 'break' && (
        <div style={{ padding:'0 16px', textAlign:'center', paddingTop:60 }}>
          <div style={{ fontSize:64, marginBottom:16 }}>⏸️</div>
          <div style={{ fontSize:20, fontWeight:800, marginBottom:8 }}>
            {round + 1 < totalRounds ? 'Round complete!' : 'Last round done!'}
          </div>
          <div style={{ fontSize:14, color:'#64748b' }}>
            {round + 1 < totalRounds
              ? `Next up: ${LOBBY_PARTICIPANTS[(round + 1) % LOBBY_PARTICIPANTS.length].name}…`
              : 'Calculating your matches…'}
          </div>
        </div>
      )}

      {/* RESULTS PHASE */}
      {phase === 'results' && (
        <div style={{ padding:'0 16px' }}>
          <div style={{ textAlign:'center', marginBottom:24 }}>
            <div style={{ fontSize:64, marginBottom:12 }}>🎉</div>
            <div style={{ fontSize:22, fontWeight:900, marginBottom:8 }}>Speed Dating Complete!</div>
            <div style={{ fontSize:14, color:'#64748b' }}>
              You liked {liked.length} people • {matchedProfiles.length} mutual matches
            </div>
          </div>

          {matchedProfiles.length > 0 ? (
            <>
              <div style={{ fontSize:13, fontWeight:700, color:'#22c55e', marginBottom:12 }}>
                💚 YOUR MATCHES ({matchedProfiles.length})
              </div>
              {matchedProfiles.map(p => (
                <div key={p.id} style={{ display:'flex', alignItems:'center', gap:14,
                  padding:'14px 16px', borderRadius:16, marginBottom:8,
                  background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.2)' }}>
                  <div style={{ width:48, height:48, borderRadius:'50%', fontSize:22,
                    background:`linear-gradient(135deg,${p.color},#0a0a2e)`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    border:'2px solid #22c55e', flexShrink:0 }}>
                    {p.emoji}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, color:'#f1f5f9' }}>{p.name}, {p.age}</div>
                    <div style={{ fontSize:12, color:'#64748b' }}>{p.city}</div>
                  </div>
                  <button onClick={() => navigate('/messages')}
                    style={{ padding:'8px 16px', borderRadius:14, border:'none', cursor:'pointer',
                      background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'white',
                      fontWeight:700, fontSize:12, minHeight:36 }}>
                    💬 Message
                  </button>
                </div>
              ))}
            </>
          ) : (
            <div style={{ textAlign:'center', padding:'32px 20px',
              background:'rgba(255,255,255,0.04)', borderRadius:20,
              border:'1px solid rgba(255,255,255,0.07)', marginBottom:20 }}>
              <div style={{ fontSize:36, marginBottom:12 }}>😊</div>
              <div style={{ fontSize:16, fontWeight:700, marginBottom:8 }}>No mutual matches this round</div>
              <div style={{ fontSize:13, color:'#64748b' }}>Keep trying — the next speed dating session might be the one!</div>
            </div>
          )}

          <button onClick={() => { setPhase('lobby'); setRound(0); setLiked([]); setPassed([]); setMatches([]); }}
            style={{ width:'100%', padding:'14px', borderRadius:16, border:'none', cursor:'pointer', marginTop:12,
              background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'white', fontWeight:800, fontSize:14, minHeight:44 }}>
            ⚡ Play Again
          </button>
          <button onClick={() => navigate('/dating')}
            style={{ width:'100%', padding:'12px', borderRadius:16, marginTop:8, cursor:'pointer',
              background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)',
              color:'#94a3b8', fontWeight:700, fontSize:14, minHeight:44 }}>
            ← Back to Dating
          </button>
        </div>
      )}
    </div>
  );
}
