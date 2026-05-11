// LiveVODPage.jsx — /live/vod/:id
// REC-6.10: Stream VOD replay — full playback UI with Firestore-connected stream data
// Features:
//   - Video playback of recorded stream (vodUrl / recordingUrl / hlsUrl)
//   - Stream metadata: title, streamer, category, duration, peak viewers
//   - Related VODs from same streamer (Firestore query)
//   - Playback speed control (0.5×, 1×, 1.25×, 1.5×, 2×)
//   - Skip +10s / −10s buttons
//   - Picture-in-Picture support
//   - Share VOD button (Web Share API → clipboard)
//   - Follow streamer from VOD page
//   - Clip from VOD (writes to /clips subcollection)

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  doc, getDoc, onSnapshot, collection, query,
  where, orderBy, limit, addDoc, updateDoc,
  arrayUnion, serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import useAppStore from '@store/useAppStore';

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

function fmtDur(s) {
  if (!s) return '—';
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  return `${m}:${String(sec).padStart(2,'0')}`;
}

function fmt(n) { return n >= 1000 ? `${(n/1000).toFixed(1)}K` : String(n||0); }

export default function LiveVODPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const showToast = useAppStore(s => s.showToast);
  const uid = auth.currentUser?.uid;

  const videoRef = useRef(null);

  const [stream, setStream]     = useState(null);
  const [related, setRelated]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Playback state
  const [playing,  setPlaying]  = useState(false);
  const [speed,    setSpeed]    = useState(1);
  const [showSpeed,setShowSpeed]= useState(false);
  const [pip,      setPip]      = useState(false);
  const [followed, setFollowed] = useState(false);
  const [clipping, setClipping] = useState(false);

  // Load VOD stream doc
  useEffect(() => {
    if (!id) return;
    (async () => {
      const snap = await getDoc(doc(db, 'streams', id));
      if (!snap.exists()) { setNotFound(true); setLoading(false); return; }
      const data = { id: snap.id, ...snap.data() };
      setStream(data);
      setLoading(false);

      // Load related VODs from same streamer
      if (data.uid) {
        const q = query(
          collection(db, 'streams'),
          where('uid', '==', data.uid),
          where('status', '==', 'ended'),
          orderBy('startedAt', 'desc'),
          limit(6),
        );
        const relSnap = await getDoc; // Firestore getDocs
        const { getDocs } = await import('firebase/firestore');
        const relDocs = await getDocs(q);
        setRelated(relDocs.docs.map(d => ({ id: d.id, ...d.data() })).filter(d => d.id !== id));
      }
    })();
  }, [id]);

  // Sync playback speed to video element
  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = speed;
  }, [speed]);

  // Skip ±10s
  const skip = useCallback((sec) => {
    if (videoRef.current) videoRef.current.currentTime += sec;
  }, []);

  // PiP toggle
  const togglePiP = useCallback(async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setPip(false);
      } else if (videoRef.current) {
        await videoRef.current.requestPictureInPicture();
        setPip(true);
      }
    } catch (e) { showToast('PiP not supported on this browser'); }
  }, [showToast]);

  // Share VOD
  const shareVOD = useCallback(async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: stream?.title || 'Live Replay', url }); return; } catch {}
    }
    await navigator.clipboard.writeText(url);
    showToast('🔗 VOD link copied!');
  }, [stream, showToast]);

  // Follow streamer
  const followStreamer = useCallback(async () => {
    if (!uid || !stream?.uid) return;
    try {
      await updateDoc(doc(db, 'users', stream.uid), { followers: arrayUnion(uid) });
      setFollowed(true);
      showToast('✓ Following!');
    } catch { showToast('Could not follow'); }
  }, [uid, stream, showToast]);

  // Clip from VOD
  const requestClip = useCallback(async () => {
    if (!uid || !id || clipping) return;
    setClipping(true);
    try {
      const currentTime = videoRef.current?.currentTime || 0;
      await addDoc(collection(db, 'streams', id, 'clips'), {
        requestedBy: uid,
        startTime: Math.max(0, currentTime - 30),
        endTime: currentTime,
        status: 'pending',
        createdAt: serverTimestamp(),
        isVOD: true,
      });
      showToast('✂️ Clip request submitted!');
    } catch { showToast('Clip request failed'); }
    finally { setClipping(false); }
  }, [uid, id, clipping, showToast]);

  if (loading) {
    return (
      <div style={{ background:'#0a0a18', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ width:'40px', height:'40px', borderRadius:'50%', border:'3px solid #1e293b', borderTopColor:'#6366f1', animation:'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (notFound) {
    return (
      <div style={{ background:'#0a0a18', minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px', textAlign:'center' }}>
        <div style={{ fontSize:'48px', marginBottom:'16px' }}>📺</div>
        <div style={{ color:'#f1f5f9', fontWeight:800, fontSize:'20px', marginBottom:'8px' }}>VOD Not Found</div>
        <div style={{ color:'#64748b', fontSize:'14px', marginBottom:'24px' }}>This replay may have been deleted or expired.</div>
        <button onClick={() => navigate('/live')} style={{ background:'#6366f1', border:'none', borderRadius:'12px', padding:'12px 24px', color:'white', fontWeight:700, cursor:'pointer' }}>
          Browse Live Streams
        </button>
      </div>
    );
  }

  const vodUrl = stream?.vodUrl || stream?.recordingUrl || stream?.hlsUrl || null;

  return (
    <div style={{ background:'#0a0a18', minHeight:'100vh', paddingBottom:'80px' }}>
      {/* Header */}
      <div style={{ padding:'12px 16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', gap:'10px' }}>
        <button onClick={() => navigate(-1)} style={{ background:'none', border:'none', color:'#94a3b8', fontSize:'20px', cursor:'pointer' }}>←</button>
        <span style={{ fontSize:'15px', fontWeight:800, color:'#f1f5f9', flex:1 }} className="truncate">📹 Replay</span>
        <button onClick={shareVOD} style={{ background:'none', border:'1px solid #334155', borderRadius:'8px', padding:'5px 10px', color:'#94a3b8', fontSize:'12px', cursor:'pointer' }}>
          Share
        </button>
      </div>

      {/* Video Player */}
      <div style={{ position:'relative', width:'100%', aspectRatio:'16/9', background:'#000', maxHeight:'260px' }}>
        {vodUrl ? (
          <video
            ref={videoRef}
            src={vodUrl}
            style={{ width:'100%', height:'100%', objectFit:'cover' }}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            controls
            playsInline
          />
        ) : (
          <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
            <div style={{ fontSize:'40px', marginBottom:'12px' }}>🎬</div>
            <div style={{ color:'#64748b', fontSize:'13px' }}>Recording processing…</div>
            <div style={{ color:'#475569', fontSize:'11px', marginTop:'4px' }}>Replay will be available shortly after stream ends</div>
          </div>
        )}
        {/* VOD badge */}
        <div style={{ position:'absolute', top:'8px', left:'8px', background:'rgba(99,102,241,0.9)', color:'white', borderRadius:'6px', padding:'3px 8px', fontSize:'11px', fontWeight:700 }}>
          VOD
        </div>
      </div>

      {/* Playback Controls Row */}
      {vodUrl && (
        <div style={{ padding:'10px 16px', display:'flex', alignItems:'center', gap:'8px', borderBottom:'1px solid #1e293b' }}>
          <button onClick={() => skip(-10)}
            style={{ background:'#1e293b', border:'none', borderRadius:'8px', padding:'8px 12px', color:'#94a3b8', fontSize:'13px', cursor:'pointer' }}>
            ⏪ 10s
          </button>
          <button onClick={() => skip(10)}
            style={{ background:'#1e293b', border:'none', borderRadius:'8px', padding:'8px 12px', color:'#94a3b8', fontSize:'13px', cursor:'pointer' }}>
            10s ⏩
          </button>
          {/* Speed picker */}
          <div style={{ position:'relative' }}>
            <button onClick={() => setShowSpeed(v => !v)}
              style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:'8px', padding:'8px 12px', color:'#818cf8', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>
              {speed}×
            </button>
            {showSpeed && (
              <div style={{ position:'absolute', bottom:'calc(100% + 6px)', left:0, background:'#1e293b', border:'1px solid #334155', borderRadius:'10px', overflow:'hidden', zIndex:10 }}>
                {SPEEDS.map(s => (
                  <button key={s} onClick={() => { setSpeed(s); setShowSpeed(false); }}
                    style={{ display:'block', width:'60px', padding:'8px', background: s === speed ? '#334155' : 'none', border:'none', color: s === speed ? '#818cf8' : '#94a3b8', fontSize:'12px', fontWeight: s === speed ? 700 : 400, cursor:'pointer', textAlign:'center' }}>
                    {s}×
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* PiP */}
          <button onClick={togglePiP}
            style={{ background: pip ? '#334155' : '#1e293b', border:`1px solid ${pip ? '#6366f1' : '#334155'}`, borderRadius:'8px', padding:'8px 10px', color: pip ? '#818cf8' : '#64748b', fontSize:'12px', cursor:'pointer' }}>
            {pip ? '⊡ Exit PiP' : '⊟ PiP'}
          </button>
          {/* Clip from VOD */}
          <button onClick={requestClip} disabled={clipping}
            style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:'8px', padding:'8px 10px', color:'#94a3b8', fontSize:'12px', cursor:'pointer', marginLeft:'auto' }}>
            {clipping ? '⏳' : '✂️ Clip'}
          </button>
        </div>
      )}

      <div style={{ padding:'14px 16px', display:'flex', flexDirection:'column', gap:'12px' }}>
        {/* Stream Info */}
        <div>
          <div style={{ color:'#f1f5f9', fontWeight:800, fontSize:'16px', lineHeight:'1.3', marginBottom:'6px' }}>
            {stream?.title || 'Untitled Stream'}
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'8px', alignItems:'center' }}>
            <span style={{ background:'rgba(99,102,241,0.15)', color:'#818cf8', borderRadius:'6px', padding:'3px 8px', fontSize:'11px', fontWeight:700 }}>
              {stream?.category || 'General'}
            </span>
            {stream?.peakViewers > 0 && (
              <span style={{ color:'#64748b', fontSize:'12px' }}>👁 {fmt(stream.peakViewers)} peak viewers</span>
            )}
            {stream?.duration > 0 && (
              <span style={{ color:'#64748b', fontSize:'12px' }}>⏱ {fmtDur(stream.duration)}</span>
            )}
            {stream?.startedAt && (
              <span style={{ color:'#64748b', fontSize:'12px' }}>
                {new Date(stream.startedAt.toDate?.() || stream.startedAt).toLocaleDateString(undefined, { month:'short', day:'numeric', year:'numeric' })}
              </span>
            )}
          </div>
        </div>

        {/* Streamer Card */}
        {stream?.uid && (
          <div style={{ background:'#1e293b', borderRadius:'12px', padding:'12px', display:'flex', alignItems:'center', gap:'12px', border:'1px solid #334155' }}>
            <div style={{ width:'40px', height:'40px', borderRadius:'50%', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', flexShrink:0 }}>
              🎙
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'14px' }}>{stream?.streamerName || 'Streamer'}</div>
              <div style={{ color:'#64748b', fontSize:'11px' }}>{stream?.followerCount ? `${fmt(stream.followerCount)} followers` : 'Creator'}</div>
            </div>
            <button onClick={followStreamer} disabled={followed}
              style={{ background: followed ? '#334155' : 'linear-gradient(135deg,#6366f1,#8b5cf6)', border:'none', borderRadius:'10px', padding:'8px 14px', color:'white', fontSize:'12px', fontWeight:700, cursor: followed ? 'default' : 'pointer', flexShrink:0 }}>
              {followed ? '✓ Following' : '+ Follow'}
            </button>
          </div>
        )}

        {/* Tags */}
        {stream?.tags?.length > 0 && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
            {stream.tags.map(t => (
              <span key={t} style={{ background:'#0f172a', border:'1px solid #334155', borderRadius:'20px', padding:'3px 10px', color:'#64748b', fontSize:'11px' }}>
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        {stream?.description && (
          <div style={{ background:'#1e293b', borderRadius:'10px', padding:'10px 12px', color:'#94a3b8', fontSize:'13px', lineHeight:'1.6', border:'1px solid #334155' }}>
            {stream.description}
          </div>
        )}

        {/* Related VODs */}
        {related.length > 0 && (
          <div>
            <div style={{ fontSize:'13px', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'10px' }}>
              More from this streamer
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              {related.map(vod => (
                <button key={vod.id} onClick={() => navigate(`/live/vod/${vod.id}`)}
                  style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:'10px', padding:'10px 12px', display:'flex', alignItems:'center', gap:'10px', cursor:'pointer', textAlign:'left', width:'100%' }}>
                  <div style={{ width:'48px', height:'36px', borderRadius:'6px', background:'#0f172a', overflow:'hidden', flexShrink:0 }}>
                    {vod.thumbnailUrl ? (
                      <img src={vod.thumbnailUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    ) : (
                      <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px' }}>🎬</div>
                    )}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ color:'#f1f5f9', fontSize:'13px', fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{vod.title || 'Untitled'}</div>
                    <div style={{ color:'#64748b', fontSize:'11px' }}>{fmtDur(vod.duration)} · {fmt(vod.peakViewers||0)} viewers</div>
                  </div>
                  <div style={{ color:'#334155', fontSize:'16px', flexShrink:0 }}>›</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
