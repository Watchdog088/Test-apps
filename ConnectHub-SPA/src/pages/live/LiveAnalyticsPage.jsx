// LiveAnalyticsPage.jsx — REC-6.10: VOD Replay list, REC-6.11: Heat Map Analytics
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db, auth } from '@/firebase/config';

function HeatMapBar({ label, value, max }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  const color = pct > 70 ? '#22c55e' : pct > 40 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px' }}>
      <div style={{ width:'32px', color:'#64748b', fontSize:'10px', textAlign:'right', flexShrink:0 }}>{label}</div>
      <div style={{ flex:1, height:'16px', background:'#1e293b', borderRadius:'4px', overflow:'hidden' }}>
        <div style={{ width:`${pct}%`, height:'100%', background:color, borderRadius:'4px', transition:'width 0.6s ease' }} />
      </div>
      <div style={{ width:'32px', color:'#94a3b8', fontSize:'10px', flexShrink:0 }}>{value}</div>
    </div>
  );
}

export default function LiveAnalyticsPage() {
  const navigate = useNavigate();
  const uid = auth.currentUser?.uid;
  const [streams, setStreams] = useState([]);
  const [vods, setVods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!uid) return;
    const q = query(collection(db, 'streams'), where('uid', '==', uid), orderBy('createdAt', 'desc'), limit(20));
    const unsub = onSnapshot(q, snap => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setStreams(docs);
      // REC-6.10: VODs are streams with status='ended' and a vodUrl or recordingUrl
      setVods(docs.filter(s => s.status === 'ended'));
      setLoading(false);
    });
    return () => unsub();
  }, [uid]);

  const fmt = n => n >= 1000 ? `${(n/1000).toFixed(1)}K` : String(n || 0);
  const fmtDur = s => { const m=Math.floor((s||0)/60); return `${m}m ${(s||0)%60}s`; };

  const totalViews = streams.reduce((a,s) => a+(s.peakViewers||0),0);
  const totalDur = streams.reduce((a,s) => a+(s.duration||0),0);
  const totalGifts = streams.reduce((a,s) => a+(s.totalGifts||0),0);
  const avgWatch = streams.length ? Math.round(streams.reduce((a,s)=>a+(s.avgWatchTime||0),0)/streams.length) : 0;

  // REC-6.11: Build heatmap from viewerData arrays
  const heatData = selected?.viewerData || [];
  const maxHeat = Math.max(...heatData.map(d=>d.viewers||0), 1);

  return (
    <div style={{ background:'#0a0a18', minHeight:'100vh', paddingBottom:'80px' }}>
      {/* Header */}
      <div style={{ padding:'16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', gap:'12px' }}>
        <button onClick={() => navigate('/live')} style={{ background:'none', border:'none', color:'#94a3b8', fontSize:'20px', cursor:'pointer' }}>←</button>
        <div style={{ fontSize:'16px', fontWeight:800, color:'#f1f5f9' }}>📊 Analytics</div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:'4px', padding:'12px 16px', borderBottom:'1px solid #1e293b' }}>
        {['analytics','vods'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            style={{ flex:1, background: activeTab===t ? '#ef4444' : '#1e293b', border:'none',
              borderRadius:'10px', padding:'8px', color: activeTab===t ? 'white' : '#94a3b8',
              fontWeight:700, fontSize:'13px', cursor:'pointer', textTransform:'capitalize' }}>
            {t === 'vods' ? '🎬 VOD Replays' : '📊 Analytics'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding:'40px', textAlign:'center', color:'#64748b' }}>Loading…</div>
      ) : activeTab === 'analytics' ? (
        <div style={{ padding:'16px' }}>
          {/* Summary cards */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'16px' }}>
            {[
              { label:'Total Peak Viewers', value:fmt(totalViews), icon:'👁' },
              { label:'Total Streams', value:streams.length, icon:'📡' },
              { label:'Total Gifts', value:`${fmt(totalGifts)} 🪙`, icon:'🎁' },
              { label:'Avg Watch Time', value:fmtDur(avgWatch), icon:'⏱' },
            ].map(c => (
              <div key={c.label} style={{ background:'#1e293b', borderRadius:'12px', padding:'14px' }}>
                <div style={{ fontSize:'20px', marginBottom:'4px' }}>{c.icon}</div>
                <div style={{ color:'#f1f5f9', fontWeight:800, fontSize:'18px' }}>{c.value}</div>
                <div style={{ color:'#64748b', fontSize:'11px' }}>{c.label}</div>
              </div>
            ))}
          </div>

          {/* REC-6.11: Heatmap — select a stream to see retention */}
          <div style={{ background:'#1e293b', borderRadius:'12px', padding:'14px', marginBottom:'16px' }}>
            <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'13px', marginBottom:'8px' }}>🔥 Viewer Retention Heatmap</div>
            {selected ? (
              <>
                <div style={{ color:'#64748b', fontSize:'11px', marginBottom:'10px' }}>{selected.title}</div>
                {heatData.length > 0 ? (
                  heatData.map((d, i) => (
                    <HeatMapBar key={i} label={`${Math.floor(i*30/60)}m`} value={d.viewers||0} max={maxHeat} />
                  ))
                ) : (
                  <div style={{ color:'#334155', fontSize:'12px' }}>No retention data for this stream yet.</div>
                )}
                <button onClick={() => setSelected(null)}
                  style={{ marginTop:'8px', background:'none', border:'none', color:'#64748b', fontSize:'12px', cursor:'pointer' }}>
                  ← Back to list
                </button>
              </>
            ) : (
              <>
                <div style={{ color:'#64748b', fontSize:'12px', marginBottom:'10px' }}>Tap a stream below to see its retention graph.</div>
                <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                  {streams.slice(0,5).map(s => (
                    <button key={s.id} onClick={() => setSelected(s)}
                      style={{ background:'#0f172a', border:'1px solid #334155', borderRadius:'8px', padding:'8px 12px',
                        color:'#f1f5f9', fontSize:'12px', cursor:'pointer', textAlign:'left', display:'flex', justifyContent:'space-between' }}>
                      <span>{s.title || 'Untitled Stream'}</span>
                      <span style={{ color:'#94a3b8' }}>👁 {fmt(s.peakViewers)}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Stream history */}
          <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'13px', marginBottom:'8px' }}>Past Streams</div>
          {streams.length === 0 ? (
            <div style={{ color:'#64748b', fontSize:'13px', textAlign:'center', padding:'20px' }}>No streams yet</div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              {streams.map(s => (
                <div key={s.id} style={{ background:'#1e293b', borderRadius:'12px', padding:'12px 14px', display:'flex', gap:'10px', alignItems:'center' }}>
                  <div style={{ flex:1 }}>
                    <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'13px' }}>{s.title || 'Untitled'}</div>
                    <div style={{ color:'#64748b', fontSize:'11px', marginTop:'2px' }}>
                      {s.category} · {fmtDur(s.duration)} · 👁 {fmt(s.peakViewers)}
                    </div>
                  </div>
                  <div style={{ background: s.status==='live' ? '#ef4444' : '#334155', borderRadius:'6px',
                    padding:'2px 8px', color:'white', fontSize:'10px', fontWeight:700 }}>
                    {s.status==='live' ? '● LIVE' : 'Ended'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* REC-6.10: VOD Replays tab */
        <div style={{ padding:'16px' }}>
          <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'13px', marginBottom:'4px' }}>🎬 VOD Replays</div>
          <div style={{ color:'#64748b', fontSize:'12px', marginBottom:'12px' }}>Your past streams available for replay</div>
          {vods.length === 0 ? (
            <div style={{ background:'#1e293b', borderRadius:'12px', padding:'24px', textAlign:'center' }}>
              <div style={{ fontSize:'32px', marginBottom:'8px' }}>🎬</div>
              <div style={{ color:'#f1f5f9', fontWeight:700, marginBottom:'4px' }}>No VODs yet</div>
              <div style={{ color:'#64748b', fontSize:'12px' }}>Streams are saved as VODs after they end</div>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {vods.map(v => (
                <div key={v.id} style={{ background:'#1e293b', borderRadius:'12px', overflow:'hidden' }}>
                  <div style={{ background:'linear-gradient(135deg,#1e293b,#0f172a)', height:'120px', display:'flex',
                    alignItems:'center', justifyContent:'center', position:'relative' }}>
                    {v.thumbnail ? (
                      <img src={v.thumbnail} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', opacity:0.7 }} />
                    ) : (
                      <div style={{ fontSize:'40px' }}>🎬</div>
                    )}
                    <div style={{ position:'absolute', bottom:'6px', right:'8px', background:'rgba(0,0,0,0.8)',
                      borderRadius:'4px', padding:'1px 6px', color:'white', fontSize:'10px', fontWeight:700 }}>
                      {fmtDur(v.duration)}
                    </div>
                  </div>
                  <div style={{ padding:'10px 12px', display:'flex', gap:'10px', alignItems:'center' }}>
                    <div style={{ flex:1 }}>
                      <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'13px' }}>{v.title || 'Past Stream'}</div>
                      <div style={{ color:'#64748b', fontSize:'11px' }}>👁 {fmt(v.peakViewers)} peak · {v.category}</div>
                    </div>
                    <button onClick={() => navigate(`/live/watch/${v.id}`)}
                      style={{ background:'linear-gradient(135deg,#ef4444,#dc2626)', border:'none', borderRadius:'8px',
                        padding:'7px 14px', color:'white', fontWeight:700, fontSize:'12px', cursor:'pointer' }}>
                      ▶ Watch
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
