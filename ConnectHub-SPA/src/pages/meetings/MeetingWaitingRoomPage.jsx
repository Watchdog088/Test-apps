/**
 * MeetingWaitingRoomPage — /meeting/:roomId/waiting
 * Camera/mic preview before joining + knock-to-enter queue
 */
import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  getMeeting, joinRoom, requestToJoin, getWaitingStatus,
  listenWaitingRoom, resolveWaitingParticipant, listenParticipants,
  saveMeetingToHistory
} from '../../services/meetings-firestore-service';

export default function MeetingWaitingRoomPage() {
  const { roomId } = useParams();
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isHost = sp.get('host') === 'true';
  const titleParam = sp.get('title') || 'Meeting';

  const [meeting, setMeeting] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [waitingList, setWaitingList] = useState([]);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [phase, setPhase] = useState('preview'); // preview | knocking | admitted | denied
  const [devices, setDevices] = useState({ mics:[], cams:[] });
  const [selMic, setSelMic] = useState('');
  const [selCam, setSelCam] = useState('');
  const [joining, setJoining] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const pollRef = useRef(null);

  // Load meeting info
  useEffect(() => {
    getMeeting(roomId).then(m => {
      if (!m) { alert('Room not found'); navigate('/meetings'); return; }
      setMeeting(m);
    });
  }, [roomId]);

  // Start camera preview
  useEffect(() => {
    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        // Enumerate devices
        const devs = await navigator.mediaDevices.enumerateDevices();
        setDevices({
          mics: devs.filter(d => d.kind === 'audioinput'),
          cams: devs.filter(d => d.kind === 'videoinput'),
        });
      } catch { /* no camera - still allow join */ }
    };
    start();
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()); clearInterval(pollRef.current); };
  }, []);

  // Live participants (who's already in)
  useEffect(() => {
    const unsub = listenParticipants(roomId, setParticipants);
    return unsub;
  }, [roomId]);

  // Host: watch waiting room
  useEffect(() => {
    if (!isHost) return;
    const unsub = listenWaitingRoom(roomId, setWaitingList);
    return unsub;
  }, [roomId, isHost]);

  const toggleMic = () => {
    setMicOn(p => { streamRef.current?.getAudioTracks().forEach(t => t.enabled = !p); return !p; });
  };
  const toggleCam = () => {
    setCamOn(p => { streamRef.current?.getVideoTracks().forEach(t => t.enabled = !p); return !p; });
  };

  const handleJoin = async () => {
    if (!user) return;
    setJoining(true);
    try {
      if (meeting?.settings?.requireApproval && !isHost) {
        // Knock
        await requestToJoin(roomId, { uid: user.uid, displayName: user.displayName, photoURL: user.photoURL });
        setPhase('knocking');
        // Poll for approval
        pollRef.current = setInterval(async () => {
          const status = await getWaitingStatus(roomId, user.uid);
          if (status === 'approved') { clearInterval(pollRef.current); admitSelf(); }
          if (status === 'denied')   { clearInterval(pollRef.current); setPhase('denied'); }
        }, 2500);
      } else {
        await admitSelf();
      }
    } finally {
      setJoining(false);
    }
  };

  const admitSelf = async () => {
    await joinRoom(roomId, { uid: user.uid, displayName: user.displayName, photoURL: user.photoURL });
    await saveMeetingToHistory(user.uid, { roomId, title: meeting?.title, type: meeting?.type, hostName: meeting?.hostName });
    navigate(`/meeting/${roomId}/room`);
  };

  const handleAdmit = (uid) => resolveWaitingParticipant(roomId, uid, true);
  const handleDeny  = (uid) => resolveWaitingParticipant(roomId, uid, false);

  const S = {
    page: { minHeight:'100vh', background:'#0d0d0d', color:'#fff', fontFamily:'system-ui,sans-serif', display:'flex', flexDirection:'column', alignItems:'center', padding:'24px 16px 40px' },
    preview: { width:'100%', maxWidth:360, aspectRatio:'4/3', background:'#111', borderRadius:20, overflow:'hidden', position:'relative', border:'2px solid #2a2a2a' },
    ctrl: (active, danger) => ({ width:56, height:56, borderRadius:'50%', border:'none', background: danger?'#ef4444': active?'#1e1e1e':'#ef4444', color:'#fff', fontSize:22, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }),
    btn: { background:'linear-gradient(135deg,#7c3aed,#06b6d4)', border:'none', color:'#fff', padding:'14px 32px', borderRadius:28, fontSize:16, fontWeight:700, cursor:'pointer', marginTop:8 },
    card: { background:'#111', border:'1px solid #1e1e1e', borderRadius:16, padding:16, width:'100%', maxWidth:360, marginTop:14 },
    person: { display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid #151515' },
    avatar: (url) => ({ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#7c3aed,#06b6d4)', backgroundImage: url?`url(${url})`:'', backgroundSize:'cover', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, flexShrink:0 }),
  };

  if (phase === 'knocking') return (
    <div style={{ ...S.page, justifyContent:'center' }}>
      <div style={{ fontSize:56 }}>🚪</div>
      <h2 style={{ fontWeight:800, marginTop:16 }}>Waiting to be admitted</h2>
      <p style={{ color:'#555', textAlign:'center' }}>The host will let you in shortly…</p>
      <div style={{ display:'flex', gap:8, marginTop:12 }}>
        {[0,1,2].map(i=><div key={i} style={{ width:10,height:10,borderRadius:'50%',background:'#8b5cf6',animation:`pulse ${0.8+i*0.2}s ease-in-out infinite alternate` }}/>)}
      </div>
      <button onClick={() => { clearInterval(pollRef.current); navigate('/meetings'); }} style={{ marginTop:32, background:'#333', border:'none', color:'#aaa', padding:'12px 24px', borderRadius:20, cursor:'pointer' }}>Cancel</button>
    </div>
  );

  if (phase === 'denied') return (
    <div style={{ ...S.page, justifyContent:'center' }}>
      <div style={{ fontSize:56 }}>🚫</div>
      <h2>Entry Declined</h2>
      <p style={{ color:'#555' }}>The host declined your request to join.</p>
      <button onClick={() => navigate('/meetings')} style={S.btn}>Back to Meetings</button>
    </div>
  );

  return (
    <div style={S.page}>
      <h2 style={{ fontWeight:800, fontSize:22, marginBottom:4 }}>{titleParam}</h2>
      <p style={{ color:'#555', fontSize:13, marginBottom:16 }}>Code: <span style={{ color:'#8b5cf6', letterSpacing:2, fontWeight:700 }}>{roomId}</span></p>

      {/* Camera preview */}
      <div style={S.preview}>
        {camOn
          ? <video ref={videoRef} autoPlay playsInline muted style={{ width:'100%',height:'100%',objectFit:'cover' }}/>
          : <div style={{ width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',background:'#1a1a1a',flexDirection:'column',gap:8 }}>
              <div style={{ width:64,height:64,borderRadius:'50%',background:'linear-gradient(135deg,#7c3aed,#06b6d4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28 }}>{user?.displayName?.[0]||'?'}</div>
              <span style={{ color:'#666',fontSize:13 }}>{user?.displayName||'You'}</span>
            </div>
        }
        {/* Mic indicator */}
        <div style={{ position:'absolute',bottom:10,left:10,background:'rgba(0,0,0,0.6)',borderRadius:20,padding:'4px 10px',fontSize:12 }}>
          {micOn ? '🎤 Mic on' : '🔇 Muted'}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display:'flex', gap:16, marginTop:16 }}>
        <button style={S.ctrl(micOn)} onClick={toggleMic} title={micOn?'Mute':'Unmute'}>{micOn?'🎤':'🔇'}</button>
        <button style={S.ctrl(camOn)} onClick={toggleCam} title={camOn?'Stop cam':'Start cam'}>{camOn?'📹':'🚫'}</button>
      </div>

      {/* Device selectors */}
      {(devices.mics.length > 1 || devices.cams.length > 1) && (
        <div style={{ ...S.card, display:'flex', flexDirection:'column', gap:10 }}>
          {devices.mics.length > 1 && (
            <select value={selMic} onChange={e=>setSelMic(e.target.value)} style={{ background:'#1a1a1a',border:'1px solid #2a2a2a',color:'#fff',borderRadius:10,padding:'8px 12px',fontSize:13 }}>
              {devices.mics.map(d=><option key={d.deviceId} value={d.deviceId}>{d.label||'Microphone'}</option>)}
            </select>
          )}
          {devices.cams.length > 1 && (
            <select value={selCam} onChange={e=>setSelCam(e.target.value)} style={{ background:'#1a1a1a',border:'1px solid #2a2a2a',color:'#fff',borderRadius:10,padding:'8px 12px',fontSize:13 }}>
              {devices.cams.map(d=><option key={d.deviceId} value={d.deviceId}>{d.label||'Camera'}</option>)}
            </select>
          )}
        </div>
      )}

      {/* Who's in the room */}
      {participants.length > 0 && (
        <div style={S.card}>
          <div style={{ fontSize:12,color:'#555',fontWeight:700,marginBottom:8 }}>IN THE ROOM ({participants.length})</div>
          {participants.slice(0,5).map(p=>(
            <div key={p.id} style={S.person}>
              <div style={S.avatar(p.avatar)}>{!p.avatar && (p.name?.[0]||'?')}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14,fontWeight:600 }}>{p.name}</div>
                <div style={{ fontSize:11,color:'#555' }}>{p.isHost?'Host':'Participant'}{!p.micOn?' • 🔇':''}</div>
              </div>
            </div>
          ))}
          {participants.length > 5 && <div style={{ fontSize:12,color:'#555',paddingTop:4 }}>+{participants.length-5} more</div>}
        </div>
      )}

      {/* Host: waiting room queue */}
      {isHost && waitingList.length > 0 && (
        <div style={S.card}>
          <div style={{ fontSize:12,color:'#f59e0b',fontWeight:700,marginBottom:8 }}>🔔 WAITING TO JOIN ({waitingList.length})</div>
          {waitingList.map(w=>(
            <div key={w.id} style={{ ...S.person, justifyContent:'space-between' }}>
              <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                <div style={S.avatar(w.avatar)}>{!w.avatar&&(w.name?.[0]||'?')}</div>
                <span style={{ fontSize:14,fontWeight:600 }}>{w.name}</span>
              </div>
              <div style={{ display:'flex',gap:6 }}>
                <button onClick={()=>handleAdmit(w.uid)} style={{ background:'#22c55e',border:'none',color:'#fff',padding:'6px 12px',borderRadius:10,cursor:'pointer',fontSize:12,fontWeight:700 }}>Admit</button>
                <button onClick={()=>handleDeny(w.uid)}  style={{ background:'#ef4444',border:'none',color:'#fff',padding:'6px 12px',borderRadius:10,cursor:'pointer',fontSize:12,fontWeight:700 }}>Deny</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button style={S.btn} onClick={handleJoin} disabled={joining}>
        {joining ? '⏳ Joining…' : isHost ? '🚀 Start Meeting' : '🚪 Join Now'}
      </button>

      <button onClick={() => navigate('/meetings')} style={{ background:'none',border:'none',color:'#444',marginTop:12,cursor:'pointer',fontSize:13 }}>← Back to Meetings</button>
    </div>
  );
}
