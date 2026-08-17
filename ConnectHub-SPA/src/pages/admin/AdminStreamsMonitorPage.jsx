// AdminStreamsMonitorPage.jsx — Sprint 4: Real-time admin stream monitoring
// NEW file — guarded by AdminRoute in App.jsx at /admin/streams

import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';

export default function AdminStreamsMonitorPage() {
  const [streams, setStreams]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('active'); // 'active' | 'all' | 'ended'
  const [selected, setSelected] = useState(null);
  const [toast, setToast]       = useState('');

  useEffect(() => {
    let q;
    if (filter === 'active') {
      q = query(collection(db, 'streams'), where('status', '==', 'active'), orderBy('startedAt', 'desc'));
    } else if (filter === 'ended') {
      q = query(collection(db, 'streams'), where('status', '==', 'ended'), orderBy('startedAt', 'desc'));
    } else {
      q = query(collection(db, 'streams'), orderBy('startedAt', 'desc'));
    }

    const unsub = onSnapshot(q, snap => {
      setStreams(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, [filter]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const forceEnd = async (stream) => {
    if (!window.confirm(`Force-end stream by ${stream.userName || 'Creator'}?\nThis will immediately stop the broadcast.`)) return;
    try {
      await updateDoc(doc(db, 'streams', stream.id), {
        status: 'ended',
        endedAt: new Date().toISOString(),
        adminForceEnded: true,
        adminEndedAt: new Date().toISOString(),
      });
      showToast(`✅ Stream force-ended`);
      setSelected(null);
    } catch (err) {
      showToast(`❌ Failed: ${err.message}`);
    }
  };

  const s = {
    page:   { minHeight: '100vh', background: '#0f0f0f', color: '#f1f5f9', padding: '20px', paddingBottom: '100px' },
    header: { marginBottom: '24px' },
    title:  { fontSize: '22px', fontWeight: 800 },
    sub:    { color: '#94a3b8', fontSize: '14px' },
    tabs:   { display: 'flex', gap: '8px', marginBottom: '20px' },
    tab:    (a) => ({ padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '13px',
                      background: a ? '#3b82f6' : '#1e293b', color: a ? '#fff' : '#94a3b8', fontWeight: 600 }),
    card:   { background: '#1e293b', borderRadius: '12px', padding: '16px', marginBottom: '12px', cursor: 'pointer' },
    row:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' },
    live:   { background: '#dc2626', color: '#fff', padding: '2px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, animation: 'pulse 1.5s infinite' },
    ended:  { background: '#374151', color: '#9ca3af', padding: '2px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 700 },
    forceBtn: { background: '#dc2626', border: 'none', borderRadius: '8px', color: '#fff', padding: '10px 20px',
                 fontWeight: 700, fontSize: '14px', cursor: 'pointer', marginTop: '12px', width: '100%' },
    preview: { marginTop: '12px', background: '#000', borderRadius: '8px', height: '180px', display: 'flex',
               alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '13px' },
    toast:  { position: 'fixed', bottom: '100px', left: '50%', transform: 'translateX(-50%)',
               background: '#1e293b', color: '#f1f5f9', padding: '12px 24px', borderRadius: '12px',
               fontSize: '14px', zIndex: 9999 },
    empty:  { textAlign: 'center', color: '#64748b', padding: '60px 0' },
  };

  return (
    <div style={s.page}>
      {toast && <div style={s.toast}>{toast}</div>}
      <div style={s.header}>
        <div style={s.title}>🔴 Live Stream Monitor</div>
        <div style={s.sub}>{streams.length} streams — real-time admin view</div>
      </div>

      <div style={s.tabs}>
        {['active', 'all', 'ended'].map(f => (
          <button key={f} style={s.tab(filter === f)} onClick={() => setFilter(f)}>
            {f === 'active' ? '🔴 Live' : f === 'all' ? '📋 All' : '⏹ Ended'}
          </button>
        ))}
      </div>

      {loading && <div style={s.empty}>Loading streams…</div>}

      {!loading && streams.length === 0 && (
        <div style={s.empty}><div style={{ fontSize: '40px', marginBottom: '12px' }}>📡</div><div>No streams found</div></div>
      )}

      {streams.map(stream => (
        <div key={stream.id} style={{ ...s.card, border: selected?.id === stream.id ? '2px solid #3b82f6' : '2px solid transparent' }}
             onClick={() => setSelected(selected?.id === stream.id ? null : stream)}>
          <div style={s.row}>
            <div style={{ fontWeight: 700 }}>{stream.title || 'Untitled Stream'}</div>
            <span style={stream.status === 'active' ? s.live : s.ended}>{stream.status?.toUpperCase()}</span>
          </div>
          <div style={s.row}>
            <span style={{ color: '#94a3b8', fontSize: '13px' }}>👤 {stream.userName || stream.uid?.slice(0, 8)}</span>
            <span style={{ color: '#94a3b8', fontSize: '13px' }}>👁 {stream.viewerCount || 0} viewers</span>
          </div>

          {selected?.id === stream.id && (
            <div>
              <div style={s.preview}>
                {stream.playbackUrl
                  ? <span>🎥 HLS Preview: {stream.playbackUrl.slice(0, 50)}…</span>
                  : <span>No playback URL available</span>}
              </div>
              <div style={{ color: '#64748b', fontSize: '12px', marginTop: '8px', fontFamily: 'monospace' }}>
                ID: {stream.id} | Mux: {stream.muxStreamId || 'N/A'}
              </div>
              {stream.status === 'active' && (
                <button style={s.forceBtn} onClick={() => forceEnd(stream)}>
                  ⛔ Force End Stream
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
