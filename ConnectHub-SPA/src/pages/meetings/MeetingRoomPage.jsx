/**
 * MeetingRoomPage — /meeting/:roomId/room
 * Full multi-participant meeting: video grid, controls, chat panel, participants panel
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  getMeeting, leaveRoom, endRoom, updateParticipantState,
  listenParticipants, listenWaitingRoom, resolveWaitingParticipant,
  listenChat, sendChatMessage
} from '../../services/meetings-firestore-service';

/* ── tiny emoji avatar ───────────────────────────────────── */
function Avatar({ name, url, size = 48, speaking = false }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: url ? `url(${url}) center/cover` : 'linear-gradient(135deg,#7c3aed,#06b6d4)',
      border: speaking ? '3px solid #22c55e' : '3px solid transparent',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.4, color: '#fff', flexShrink: 0, transition: 'border 0.2s',
    }}>{!url && (name?.[0]?.toUpperCase() || '?')}</div>
  );
}

/* ── single participant tile ─────────────────────────────── */
function ParticipantTile({ p, isMe, localVideoRef, tileCount }) {
  const tileH = tileCount <= 2 ? 240 : tileCount <= 4 ? 180 : 140;
  return (
    <div style={{
      background: '#111', borderRadius: 16, overflow: 'hidden', position: 'relative',
      border: p.isSpeaking ? '2px solid #22c55e' : '2px solid #1e1e1e',
      height: tileH, display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'border 0.2s',
    }}>
      {isMe && p.camOn
        ? <video ref={localVideoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : p.camOn
          ? <div style={{ width: '100%', height: '100%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Avatar name={p.name} url={p.avatar} size={60} speaking={p.isSpeaking} />
            </div>
          : <div style={{ width: '100%', height: '100%', background: '#0d0d0d', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Avatar name={p.name} url={p.avatar} size={60} speaking={p.isSpeaking} />
              <span style={{ fontSize: 11, color: '#555' }}>Camera off</span>
            </div>
      }
      {/* Name + status overlay */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '6px 10px', background: 'linear-gradient(transparent,rgba(0,0,0,0.8))', display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 600, flex: 1 }}>{isMe ? `${p.name} (You)` : p.name}</span>
        {!p.micOn && <span style={{ fontSize: 14 }}>🔇</span>}
        {p.handRaised && <span style={{ fontSize: 14 }}>✋</span>}
        {p.screenSharing && <span style={{ fontSize: 14 }}>🖥️</span>}
        {p.isHost && <span style={{ fontSize: 10, background: '#8b5cf6', borderRadius: 6, padding: '1px 5px', color: '#fff' }}>HOST</span>}
      </div>
    </div>
  );
}

/* ── control button ──────────────────────────────────────── */
function Ctrl({ icon, label, active = true, danger = false, onClick, badge }) {
  return (
    <button onClick={onClick} style={{
      background: danger ? '#ef4444' : active ? 'rgba(255,255,255,0.12)' : '#ef4444',
      border: 'none', color: '#fff', borderRadius: 16, width: 56, height: 56,
      fontSize: 22, cursor: 'pointer', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 2, position: 'relative', flexShrink: 0,
    }}>
      {icon}
      <span style={{ fontSize: 9, color: '#ccc' }}>{label}</span>
      {badge > 0 && <span style={{ position: 'absolute', top: 4, right: 4, background: '#ef4444', borderRadius: '50%', width: 16, height: 16, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{badge}</span>}
    </button>
  );
}

export default function MeetingRoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [meeting, setMeeting]           = useState(null);
  const [participants, setParticipants] = useState([]);
  const [waiting, setWaiting]           = useState([]);
  const [chatMsgs, setChatMsgs]         = useState([]);
  const [panel, setPanel]               = useState(null); // null | 'chat' | 'people'
  const [micOn, setMicOn]               = useState(true);
  const [camOn, setCamOn]               = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [handRaised, setHandRaised]     = useState(false);
  const [duration, setDuration]         = useState(0);
  const [chatInput, setChatInput]       = useState('');
  const [unreadChat, setUnreadChat]     = useState(0);
  const [ended, setEnded]               = useState(false);

  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const chatBottomRef = useRef(null);
  const timerRef = useRef(null);

  const me = participants.find(p => p.id === user?.uid);
  const isHost = meeting?.hostId === user?.uid;

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  // Init
  useEffect(() => {
    getMeeting(roomId).then(m => { if (!m || m.status === 'ended') { setEnded(true); } else setMeeting(m); });
    timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);

    // Camera
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    }).catch(() => {});

    // Listeners
    const u1 = listenParticipants(roomId, setParticipants);
    const u2 = listenWaitingRoom(roomId, setWaiting);
    const u3 = listenChat(roomId, msgs => {
      setChatMsgs(msgs);
      if (panel !== 'chat') setUnreadChat(c => c + 1);
    });

    return () => {
      clearInterval(timerRef.current);
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      screenStreamRef.current?.getTracks().forEach(t => t.stop());
      u1(); u2(); u3();
    };
  }, [roomId]);

  useEffect(() => { chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMsgs]);
  useEffect(() => { if (panel === 'chat') setUnreadChat(0); }, [panel]);

  const toggleMic = useCallback(() => {
    setMicOn(p => {
      const next = !p;
      localStreamRef.current?.getAudioTracks().forEach(t => t.enabled = next);
      updateParticipantState(roomId, user.uid, { micOn: next });
      return next;
    });
  }, [roomId, user]);

  const toggleCam = useCallback(() => {
    setCamOn(p => {
      const next = !p;
      localStreamRef.current?.getVideoTracks().forEach(t => t.enabled = next);
      updateParticipantState(roomId, user.uid, { camOn: next });
      return next;
    });
  }, [roomId, user]);

  const toggleScreenShare = useCallback(async () => {
    if (!screenSharing) {
      try {
        const screen = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = screen;
        if (localVideoRef.current) localVideoRef.current.srcObject = screen;
        setScreenSharing(true);
        updateParticipantState(roomId, user.uid, { screenSharing: true });
        screen.getVideoTracks()[0].onended = () => {
          if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
          setScreenSharing(false);
          updateParticipantState(roomId, user.uid, { screenSharing: false });
        };
      } catch {}
    } else {
      screenStreamRef.current?.getTracks().forEach(t => t.stop());
      if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
      setScreenSharing(false);
      updateParticipantState(roomId, user.uid, { screenSharing: false });
    }
  }, [screenSharing, roomId, user]);

  const toggleHand = useCallback(() => {
    setHandRaised(p => {
      updateParticipantState(roomId, user.uid, { handRaised: !p });
      return !p;
    });
  }, [roomId, user]);

  const handleLeave = useCallback(async () => {
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    await leaveRoom(roomId, user.uid);
    setEnded(true);
  }, [roomId, user]);

  const handleEndForAll = useCallback(async () => {
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    await endRoom(roomId);
    setEnded(true);
  }, [roomId]);

  const handleSendChat = async () => {
    const text = chatInput.trim();
    if (!text) return;
    setChatInput('');
    await sendChatMessage(roomId, { uid: user.uid, name: user.displayName || 'You', avatar: user.photoURL || '', text });
  };

  if (ended) return (
    <div style={{ minHeight:'100vh', background:'#000', color:'#fff', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontFamily:'system-ui,sans-serif' }}>
      <div style={{ fontSize:64 }}>📵</div>
      <h2 style={{ fontWeight:800, marginTop:16 }}>Meeting Ended</h2>
      <p style={{ color:'#555' }}>Duration: {fmt(duration)}</p>
      <button onClick={() => navigate('/meetings')} style={{ background:'#8b5cf6', border:'none', color:'#fff', padding:'12px 28px', borderRadius:24, fontSize:15, cursor:'pointer', fontWeight:700, marginTop:16 }}>Back to Meetings</button>
    </div>
  );

  return (
    <div style={{ position:'fixed', inset:0, background:'#000', color:'#fff', fontFamily:'system-ui,sans-serif', display:'flex', flexDirection:'column', overflow:'hidden' }}>

      {/* ── Top bar ── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px', background:'rgba(0,0,0,0.7)', backdropFilter:'blur(8px)', zIndex:30, flexShrink:0 }}>
        <div>
          <div style={{ fontSize:14, fontWeight:700 }}>{meeting?.title || 'Meeting'}</div>
          <div style={{ fontSize:11, color:'#22c55e' }}>🟢 {fmt(duration)} • {participants.length} participant{participants.length !== 1 ? 's' : ''}</div>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <div style={{ background:'#1a1a1a', borderRadius:10, padding:'4px 10px', fontSize:11, color:'#888', letterSpacing:1 }}>{roomId}</div>
          {waiting.length > 0 && isHost && <div style={{ background:'#f59e0b', borderRadius:10, padding:'4px 10px', fontSize:11, fontWeight:700 }}>⏳ {waiting.length} waiting</div>}
        </div>
      </div>

      {/* ── Main content ── */}
      <div style={{ flex:1, display:'flex', overflow:'hidden' }}>

        {/* ── Video grid ── */}
        <div style={{ flex:1, padding:12, overflowY:'auto', display:'grid', gridTemplateColumns: participants.length <= 2 ? '1fr' : participants.length <= 4 ? '1fr 1fr' : '1fr 1fr 1fr', gap:10, alignContent:'start' }}>
          {participants.map(p => (
            <ParticipantTile key={p.id} p={p} isMe={p.id === user?.uid} localVideoRef={p.id === user?.uid ? localVideoRef : null} tileCount={participants.length} />
          ))}
          {participants.length === 0 && (
            <div style={{ gridColumn:'1/-1', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:200, color:'#333' }}>
              <div style={{ fontSize:48 }}>👥</div>
              <div style={{ marginTop:8 }}>Waiting for others to join…</div>
            </div>
          )}
        </div>

        {/* ── Side panel ── */}
        {panel && (
          <div style={{ width:280, background:'#0d0d0d', borderLeft:'1px solid #1a1a1a', display:'flex', flexDirection:'column', flexShrink:0, overflowY:'hidden' }}>
            <div style={{ display:'flex', borderBottom:'1px solid #1a1a1a', flexShrink:0 }}>
              {['chat','people'].map(p => (
                <button key={p} onClick={() => setPanel(p)} style={{ flex:1, padding:'12px 0', background:'none', border:'none', color: panel===p?'#8b5cf6':'#555', fontSize:13, fontWeight:700, cursor:'pointer', borderBottom: panel===p?'2px solid #8b5cf6':'none', textTransform:'capitalize' }}>{p==='chat'?'💬 Chat':'👥 People'}</button>
              ))}
              <button onClick={() => setPanel(null)} style={{ background:'none', border:'none', color:'#555', cursor:'pointer', padding:'0 12px', fontSize:16 }}>✕</button>
            </div>

            {/* Chat panel */}
            {panel === 'chat' && (
              <>
                <div style={{ flex:1, overflowY:'auto', padding:12, display:'flex', flexDirection:'column', gap:10 }}>
                  {chatMsgs.length === 0 && <div style={{ textAlign:'center', color:'#333', marginTop:40 }}>No messages yet</div>}
                  {chatMsgs.map(m => (
                    <div key={m.id} style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
                      <Avatar name={m.name} url={m.avatar} size={28} />
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:11, color:'#555', marginBottom:2 }}>{m.name}</div>
                        <div style={{ background:'#1a1a1a', borderRadius:12, padding:'8px 12px', fontSize:13 }}>{m.text}</div>
                      </div>
                    </div>
                  ))}
                  <div ref={chatBottomRef} />
                </div>
                <div style={{ padding:'10px 12px', borderTop:'1px solid #1a1a1a', display:'flex', gap:8, flexShrink:0 }}>
                  <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key==='Enter' && handleSendChat()} placeholder="Send a message…" style={{ flex:1, background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:20, padding:'8px 14px', color:'#fff', fontSize:13, outline:'none' }} />
                  <button onClick={handleSendChat} style={{ background:'#8b5cf6', border:'none', color:'#fff', borderRadius:'50%', width:36, height:36, cursor:'pointer', fontSize:16 }}>➤</button>
                </div>
              </>
            )}

            {/* People panel */}
            {panel === 'people' && (
              <div style={{ flex:1, overflowY:'auto', padding:12 }}>
                <div style={{ fontSize:11, color:'#555', fontWeight:700, marginBottom:8 }}>IN CALL ({participants.length})</div>
                {participants.map(p => (
                  <div key={p.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid #111' }}>
                    <Avatar name={p.name} url={p.avatar} size={36} />
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:600 }}>{p.name}{p.id===user?.uid?' (You)':''}</div>
                      <div style={{ fontSize:11, color:'#555' }}>{p.isHost?'Host':'Participant'}</div>
                    </div>
                    <div style={{ display:'flex', gap:4 }}>
                      {!p.micOn && <span style={{ fontSize:14 }}>🔇</span>}
                      {p.handRaised && <span style={{ fontSize:14 }}>✋</span>}
                      {p.screenSharing && <span style={{ fontSize:14 }}>🖥️</span>}
                    </div>
                  </div>
                ))}

                {isHost && waiting.length > 0 && (
                  <>
                    <div style={{ fontSize:11, color:'#f59e0b', fontWeight:700, margin:'16px 0 8px' }}>WAITING ({waiting.length})</div>
                    {waiting.map(w => (
                      <div key={w.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 0', borderBottom:'1px solid #111' }}>
                        <Avatar name={w.name} url={w.avatar} size={32} />
                        <span style={{ flex:1, fontSize:13 }}>{w.name}</span>
                        <button onClick={() => resolveWaitingParticipant(roomId, w.uid, true)} style={{ background:'#22c55e', border:'none', color:'#fff', padding:'4px 10px', borderRadius:8, cursor:'pointer', fontSize:11, fontWeight:700 }}>Admit</button>
                        <button onClick={() => resolveWaitingParticipant(roomId, w.uid, false)} style={{ background:'#ef4444', border:'none', color:'#fff', padding:'4px 8px', borderRadius:8, cursor:'pointer', fontSize:11 }}>✕</button>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Bottom controls ── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-around', padding:'12px 8px 28px', background:'linear-gradient(to top,rgba(0,0,0,0.95),transparent)', flexShrink:0, zIndex:30 }}>
        <Ctrl icon={micOn?'🎤':'🔇'} label={micOn?'Mute':'Unmute'} active={micOn} onClick={toggleMic} />
        <Ctrl icon={camOn?'📹':'🚫'} label="Camera" active={camOn} onClick={toggleCam} />
        <Ctrl icon="🖥️" label="Share" active={!screenSharing} onClick={toggleScreenShare} />
        <Ctrl icon={handRaised?'✋':'🖐️'} label={handRaised?'Lower':'Raise'} active={!handRaised} onClick={toggleHand} />
        <Ctrl icon="💬" label="Chat" onClick={() => setPanel(p => p==='chat'?null:'chat')} badge={panel!=='chat'?unreadChat:0} />
        <Ctrl icon="👥" label="People" onClick={() => setPanel(p => p==='people'?null:'people')} />
        {isHost
          ? <Ctrl icon="📵" label="End All" danger onClick={handleEndForAll} />
          : <Ctrl icon="📵" label="Leave" danger onClick={handleLeave} />
        }
      </div>
    </div>
  );
}
