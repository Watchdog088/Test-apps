import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function VideoCallRoomPage() {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [callState, setCallState] = useState('connecting'); // connecting | active | ended
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [remoteVideoActive, setRemoteVideoActive] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const timerRef = useRef(null);

  // Start local camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        setTimeout(() => { setCallState('active'); setRemoteVideoActive(true); }, 2000);
      } catch (err) {
        console.warn('Camera/mic access denied:', err);
        setCallState('active');
      }
    };
    startCamera();
    return () => {
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      clearInterval(timerRef.current);
    };
  }, []);

  // Duration timer
  useEffect(() => {
    if (callState === 'active') {
      timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [callState]);

  const formatDuration = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  };

  const toggleMic = () => {
    setMicOn(prev => {
      localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = !prev; });
      return !prev;
    });
  };

  const toggleCam = () => {
    setCamOn(prev => {
      localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = !prev; });
      return !prev;
    });
  };

  const toggleScreenShare = async () => {
    if (!screenSharing) {
      try {
        const screen = await navigator.mediaDevices.getDisplayMedia({ video: true });
        if (localVideoRef.current) localVideoRef.current.srcObject = screen;
        setScreenSharing(true);
        screen.getVideoTracks()[0].onended = () => {
          if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
          setScreenSharing(false);
        };
      } catch { setScreenSharing(false); }
    } else {
      if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
      setScreenSharing(false);
    }
  };

  const endCall = () => {
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    setCallState('ended');
    setTimeout(() => navigate(-1), 2000);
  };

  if (callState === 'ended') return (
    <div style={styles.page}>
      <div style={styles.endedScreen}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>📵</div>
        <div style={{ fontSize: 22, fontWeight: 700 }}>Call Ended</div>
        <div style={{ color: '#666', marginTop: 8 }}>Duration: {formatDuration(callDuration)}</div>
        <button onClick={() => navigate(-1)} style={styles.returnBtn}>Return to Messages</button>
      </div>
    </div>
  );

  return (
    <div style={styles.page}>
      {/* Remote video (full screen) */}
      <div style={styles.remoteVideo}>
        {remoteVideoActive
          ? <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : (
            <div style={styles.remoteWaiting}>
              <div style={{ fontSize: 64 }}>👤</div>
              <div style={{ fontSize: 16, color: '#aaa', marginTop: 12 }}>
                {callState === 'connecting' ? 'Connecting...' : 'Waiting for other person...'}
              </div>
              {callState === 'connecting' && <div style={styles.connectingDots}><span>●</span><span>●</span><span>●</span></div>}
            </div>
          )
        }
      </div>

      {/* Local video (PiP) */}
      <div style={styles.localVideo}>
        {camOn
          ? <video ref={localVideoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} />
          : <div style={styles.camOff}><span style={{ fontSize: 28 }}>📷</span><span style={{ fontSize: 11, marginTop: 4 }}>Cam Off</span></div>
        }
      </div>

      {/* Top bar */}
      <div style={styles.topBar}>
        <div style={styles.callInfo}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>
            {callState === 'connecting' ? 'Calling...' : `Video Call • ${formatDuration(callDuration)}`}
          </div>
          <div style={{ fontSize: 12, color: '#22c55e' }}>
            {callState === 'active' ? '🟢 Connected' : '🟡 Connecting'}
          </div>
        </div>
        <button style={styles.iconBtn} title="Switch camera">🔄</button>
      </div>

      {/* Bottom controls */}
      <div style={styles.controls}>
        <button onClick={toggleMic} style={{ ...styles.ctrlBtn, background: micOn ? 'rgba(255,255,255,0.15)' : '#ef4444' }} title={micOn ? 'Mute' : 'Unmute'}>
          {micOn ? '🎤' : '🔇'}
          <span style={styles.ctrlLabel}>{micOn ? 'Mute' : 'Unmute'}</span>
        </button>
        <button onClick={toggleCam} style={{ ...styles.ctrlBtn, background: camOn ? 'rgba(255,255,255,0.15)' : '#ef4444' }} title={camOn ? 'Stop Video' : 'Start Video'}>
          {camOn ? '📹' : '🚫'}
          <span style={styles.ctrlLabel}>Video</span>
        </button>
        <button onClick={endCall} style={{ ...styles.ctrlBtn, background: '#ef4444', transform: 'scale(1.2)' }} title="End Call">
          📵
          <span style={styles.ctrlLabel}>End</span>
        </button>
        <button onClick={toggleScreenShare} style={{ ...styles.ctrlBtn, background: screenSharing ? '#8b5cf6' : 'rgba(255,255,255,0.15)' }} title="Share Screen">
          🖥️
          <span style={styles.ctrlLabel}>Share</span>
        </button>
        <button style={{ ...styles.ctrlBtn, background: 'rgba(255,255,255,0.15)' }} title="Chat">
          💬
          <span style={styles.ctrlLabel}>Chat</span>
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: { position: 'fixed', inset: 0, background: '#000', color: '#fff', fontFamily: 'system-ui, sans-serif', overflow: 'hidden' },
  remoteVideo: { position: 'absolute', inset: 0, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  remoteWaiting: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  connectingDots: { display: 'flex', gap: 8, marginTop: 12, fontSize: 20, animation: 'pulse 1.2s infinite' },
  localVideo: { position: 'absolute', top: 80, right: 16, width: 120, height: 160, borderRadius: 12, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.3)', background: '#222', zIndex: 10 },
  camOff: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#1a1a1a', color: '#666' },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)', zIndex: 20 },
  callInfo: {},
  iconBtn: { background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: '50%', width: 40, height: 40, fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  controls: { position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '20px 16px 40px', background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)', zIndex: 20 },
  ctrlBtn: { border: 'none', color: '#fff', borderRadius: 16, width: 56, height: 56, fontSize: 24, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, transition: 'transform 0.1s' },
  ctrlLabel: { fontSize: 10, color: '#ddd' },
  endedScreen: { height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 },
  returnBtn: { marginTop: 20, background: '#8b5cf6', border: 'none', color: '#fff', padding: '12px 24px', borderRadius: 24, fontSize: 15, cursor: 'pointer', fontWeight: 600 },
};
