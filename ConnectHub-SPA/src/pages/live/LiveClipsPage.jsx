// LiveClipsPage.jsx — /live/clips
// SECTION-4 NEW: Clips Manager — view, share, delete your recorded clips
// Queries the top-level 'clips' collection filtered by uid.
// Cloud Function processClip (functions/index.js) handles server-side processing status.

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection, query, where, orderBy, onSnapshot,
  deleteDoc, doc, serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import useAppStore from '@store/useAppStore';

const STATUS_COLOR = { processing: '#f59e0b', ready: '#22c55e', failed: '#ef4444' };
const STATUS_ICON  = { processing: '⏳', ready: '✅', failed: '❌' };

export default function LiveClipsPage() {
  const navigate = useNavigate();
  const showToast = useAppStore(s => s.showToast);
  const uid = auth.currentUser?.uid;

  const [clips, setClips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  // Real-time listener on clips collection for this user
  useEffect(() => {
    if (!uid) { setLoading(false); return; }
    const q = query(
      collection(db, 'clips'),
      where('uid', '==', uid),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, snap => {
      setClips(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, [uid]);

  const deleteClip = async (clipId) => {
    if (deleting) return;
    if (!window.confirm('Delete this clip?')) return;
    setDeleting(clipId);
    try {
      await deleteDoc(doc(db, 'clips', clipId));
      showToast('Clip deleted');
    } catch { showToast('Delete failed'); }
    finally { setDeleting(null); }
  };

  const shareClip = async (clip) => {
    const url = clip.clipUrl || `${window.location.origin}/clips/${clip.id}`;
    if (navigator.share) {
      await navigator.share({ title: clip.title || 'My Clip', url });
    } else {
      await navigator.clipboard.writeText(url);
      showToast('📋 Clip link copied!');
    }
  };

  const formatDuration = (secs) => {
    if (!secs) return '—';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const S = { background: '#0a0a18', minHeight: '100vh', paddingBottom: '80px', color: '#f1f5f9' };
  const card = {
    background: '#1e293b', borderRadius: '14px', overflow: 'hidden', marginBottom: '12px',
    border: '1px solid #334155',
  };

  return (
    <div style={S}>
      {/* Header */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button onClick={() => navigate('/live')} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer' }}>←</button>
        <div>
          <div style={{ fontWeight: 800, fontSize: '16px' }}>✂️ My Clips</div>
          <div style={{ color: '#64748b', fontSize: '11px' }}>{clips.length} clip{clips.length !== 1 ? 's' : ''}</div>
        </div>
        <button onClick={() => navigate('/live')}
          style={{ marginLeft: 'auto', background: 'linear-gradient(135deg,#ef4444,#f59e0b)', border: 'none',
            borderRadius: '10px', padding: '7px 14px', color: 'white', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>
          🔴 Go Live
        </button>
      </div>

      <div style={{ padding: '16px' }}>
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ background: '#1e293b', borderRadius: '14px', height: '100px',
                animation: 'pulse 1.5s ease-in-out infinite', opacity: 0.6 }} />
            ))}
            <style>{`@keyframes pulse{0%,100%{opacity:0.6}50%{opacity:0.3}}`}</style>
          </div>
        )}

        {!loading && clips.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✂️</div>
            <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>No clips yet</div>
            <div style={{ color: '#64748b', fontSize: '13px', marginBottom: '24px', lineHeight: '1.6' }}>
              While watching a live stream, tap the ✂️ Clip button to save highlights.
            </div>
            <button onClick={() => navigate('/live')}
              style={{ background: 'linear-gradient(135deg,#ef4444,#f59e0b)', border: 'none',
                borderRadius: '12px', padding: '12px 24px', color: 'white', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
              Browse Live Streams
            </button>
          </div>
        )}

        {!loading && clips.map(clip => (
          <div key={clip.id} style={card}>
            {/* Thumbnail or placeholder */}
            <div style={{ width: '100%', height: '120px', background: '#0f172a', display: 'flex',
              alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              {clip.thumbnailUrl ? (
                <img src={clip.thumbnailUrl} alt={clip.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px' }}>{STATUS_ICON[clip.status] || '🎬'}</div>
                  <div style={{ color: STATUS_COLOR[clip.status] || '#94a3b8', fontSize: '11px', marginTop: '4px', fontWeight: 700 }}>
                    {clip.status === 'processing' ? 'Processing…' : clip.status === 'failed' ? 'Processing failed' : 'Ready to view'}
                  </div>
                </div>
              )}
              {/* Duration badge */}
              {clip.duration && (
                <div style={{ position: 'absolute', bottom: '6px', right: '6px', background: 'rgba(0,0,0,0.8)',
                  borderRadius: '4px', padding: '2px 6px', color: 'white', fontSize: '10px', fontWeight: 700 }}>
                  {formatDuration(clip.duration)}
                </div>
              )}
              {/* Status badge */}
              <div style={{ position: 'absolute', top: '6px', left: '6px', background: STATUS_COLOR[clip.status] || '#334155',
                borderRadius: '6px', padding: '2px 8px', color: 'white', fontSize: '10px', fontWeight: 700 }}>
                {STATUS_ICON[clip.status]} {clip.status}
              </div>
            </div>

            {/* Info */}
            <div style={{ padding: '10px 12px' }}>
              <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '2px', overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {clip.title || 'Untitled Clip'}
              </div>
              <div style={{ color: '#64748b', fontSize: '11px', marginBottom: '8px' }}>
                From: {clip.streamerName || 'Unknown stream'} · {clip.streamTitle?.slice(0, 30) || ''}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {clip.status === 'ready' && (
                  <button onClick={() => navigate(`/clips/${clip.id}`)}
                    style={{ background: 'linear-gradient(135deg,#6366f1,#818cf8)', border: 'none',
                      borderRadius: '8px', padding: '6px 14px', color: 'white', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                    ▶ Watch
                  </button>
                )}
                <button onClick={() => shareClip(clip)}
                  style={{ background: '#334155', border: 'none', borderRadius: '8px',
                    padding: '6px 14px', color: '#94a3b8', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                  📤 Share
                </button>
                <button onClick={() => deleteClip(clip.id)} disabled={deleting === clip.id}
                  style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: '8px', padding: '6px 14px', color: '#ef4444',
                    fontSize: '12px', fontWeight: 600, cursor: 'pointer', marginLeft: 'auto',
                    opacity: deleting === clip.id ? 0.5 : 1 }}>
                  🗑
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Info box */}
        {!loading && clips.length > 0 && (
          <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: '12px', padding: '12px 14px', marginTop: '8px' }}>
            <div style={{ color: '#818cf8', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>ℹ️ About Clips</div>
            <div style={{ color: '#64748b', fontSize: '11px', lineHeight: '1.6' }}>
              Clips are processed server-side. Processing takes up to 60 seconds.
              Ready clips are stored for 30 days. Share a clip to extend its life.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
