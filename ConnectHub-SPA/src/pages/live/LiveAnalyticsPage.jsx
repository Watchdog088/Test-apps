// LIVE ANALYTICS PAGE — /live/analytics
// FIXES APPLIED:
//   UX-5: Real analytics data loaded from Firestore (user's own past streams)
//         Shows actual totals instead of '—' placeholders

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection, query, where, orderBy, limit, getDocs,
} from 'firebase/firestore';
import { db, auth } from '@/firebase/config';

export default function LiveAnalyticsPage() {
  const navigate = useNavigate();
  const [streams,   setStreams]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [totals,    setTotals]    = useState({ views:0, watchTime:0, followers:0, messages:0 });

  // UX-5 FIX: Load real data from Firestore
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) { setLoading(false); return; }

    const fetchStreams = async () => {
      try {
        const q = query(
          collection(db, 'streams'),
          where('userId', '==', uid),
          orderBy('startedAt', 'desc'),
          limit(20)
        );
        const snap = await getDocs(q);
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setStreams(docs);

        // Aggregate totals
        const agg = docs.reduce((acc, s) => ({
          views:    acc.views    + (s.peakViewerCount || s.viewerCount || 0),
          watchTime:acc.watchTime+ (s.totalWatchMinutes || 0),
          followers:acc.followers+ (s.newFollowersCount || 0),
          messages: acc.messages + (s.totalMessages || 0),
        }), { views:0, watchTime:0, followers:0, messages:0 });
        setTotals(agg);
      } catch(err) {
        console.error('[Analytics]', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStreams();
  }, []);

  const fmt = n => n >= 1000 ? `${(n/1000).toFixed(1)}K` : String(n);
  const fmtTime = m => m >= 60 ? `${Math.floor(m/60)}h ${m%60}m` : `${m}m`;
  const timeAgo = ts => {
    if (!ts) return '';
    const sec = Math.floor((Date.now() - (ts.toMillis ? ts.toMillis() : ts))/1000);
    if (sec < 3600) return `${Math.floor(sec/60)}m ago`;
    if (sec < 86400) return `${Math.floor(sec/3600)}h ago`;
    return `${Math.floor(sec/86400)}d ago`;
  };
  const fmtDuration = s => {
    if (!s) return '—';
    const m = Math.floor(s/60);
    return m >= 60 ? `${Math.floor(m/60)}h ${m%60}m` : `${m}m`;
  };

  // UX-5 FIX: real stats array
  const STATS = [
    { icon:'👁️', label:'Total Views',    val: loading ? '…' : fmt(totals.views),    sub:'Across all streams' },
    { icon:'⏱️', label:'Watch Time',     val: loading ? '…' : fmtTime(totals.watchTime), sub:'Total viewer minutes' },
    { icon:'👥', label:'New Followers',  val: loading ? '…' : fmt(totals.followers), sub:'Gained from streams' },
    { icon:'💬', label:'Chat Messages',  val: loading ? '…' : fmt(totals.messages),  sub:'Across all streams' },
  ];

  return (
    <div style={{ background:'var(--bg-primary,#0a0a18)', minHeight:'100vh', paddingBottom:'80px' }}>
      <div style={{ padding:'16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', gap:'12px' }}>
        <button onClick={() => navigate(-1)} style={{ background:'none', border:'none', color:'#94a3b8', fontSize:'20px', cursor:'pointer' }}>←</button>
        <span style={{ fontSize:'18px', fontWeight:800, color:'#f1f5f9' }}>📊 Stream Analytics</span>
      </div>

      <div style={{ padding:'20px 16px' }}>

        {/* Header */}
        <div style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed)', borderRadius:'18px', padding:'16px', marginBottom:'24px', textAlign:'center' }}>
          <div style={{ fontSize:'28px', marginBottom:'6px' }}>📊</div>
          <div style={{ color:'white', fontWeight:700, fontSize:'15px' }}>
            {loading ? 'Loading analytics…' : streams.length > 0 ? `${streams.length} streams analyzed` : 'No streams yet'}
          </div>
          <div style={{ color:'rgba(255,255,255,0.75)', fontSize:'12px', marginTop:'4px' }}>
            {streams.length > 0 ? 'Real data from your Firestore stream history' : 'Go live to start collecting analytics'}
          </div>
        </div>

        {/* Stats grid — UX-5 FIX: real values */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'24px' }}>
          {STATS.map(s => (
            <div key={s.label} style={{ background:'#1e293b', borderRadius:'14px', padding:'16px', textAlign:'center' }}>
              <div style={{ fontSize:'24px', marginBottom:'4px' }}>{s.icon}</div>
              <div style={{ color:'#f1f5f9', fontWeight:800, fontSize:'22px', marginBottom:'2px' }}>{s.val}</div>
              <div style={{ color:'#f1f5f9', fontWeight:600, fontSize:'12px' }}>{s.label}</div>
              <div style={{ color:'#475569', fontSize:'10px' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Viewer trend chart (bar) */}
        {streams.length > 0 && (
          <div style={{ background:'#1e293b', borderRadius:'14px', padding:'16px', marginBottom:'16px' }}>
            <div style={{ fontSize:'12px', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'12px' }}>
              📈 Peak Viewers Per Stream (Last {streams.length})
            </div>
            <div style={{ height:'80px', display:'flex', alignItems:'flex-end', gap:'4px' }}>
              {streams.slice(0,12).map((s,i) => {
                const maxV = Math.max(...streams.map(x => x.peakViewerCount || x.viewerCount || 1));
                const pct  = Math.max(5, Math.round(((s.peakViewerCount||s.viewerCount||0)/maxV)*100));
                return (
                  <div key={s.id} title={`${s.title}: ${s.peakViewerCount||s.viewerCount||0} viewers`}
                    style={{ flex:1, background:`linear-gradient(to top,#6366f1,#8b5cf6)`, borderRadius:'4px 4px 0 0', height:`${pct}%` }} />
                );
              })}
            </div>
            <div style={{ color:'#475569', fontSize:'10px', textAlign:'center', marginTop:'6px' }}>
              Peak viewers • newest on right
            </div>
          </div>
        )}

        {/* Top streams — UX-5 FIX: real Firestore data */}
        <div style={{ background:'#1e293b', borderRadius:'14px', padding:'16px', marginBottom:'16px' }}>
          <div style={{ fontSize:'12px', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'10px' }}>
            🏆 Your Recent Streams
          </div>
          {loading && <div style={{ color:'#64748b', fontSize:'13px', textAlign:'center', padding:'16px' }}>Loading…</div>}
          {!loading && streams.length === 0 && (
            <div style={{ color:'#475569', fontSize:'13px', textAlign:'center', padding:'16px' }}>No streams yet — go live to build your history!</div>
          )}
          {streams.slice(0,5).map(s => (
            <div key={s.id} style={{ display:'flex', alignItems:'center', gap:'10px', paddingBottom:'10px', marginBottom:'10px', borderBottom:'1px solid #334155' }}>
              <div style={{ width:'40px', height:'40px', borderRadius:'10px', background:'linear-gradient(135deg,#4f46e5,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', flexShrink:0 }}>
                {s.status==='live'?'🔴':'📼'}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ color:'#f1f5f9', fontWeight:600, fontSize:'13px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.title||'Untitled'}</div>
                <div style={{ color:'#64748b', fontSize:'11px' }}>
                  {s.status==='live'?'🔴 Live now':timeAgo(s.startedAt)} • {fmtDuration(s.durationSeconds)}
                </div>
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'13px' }}>👁️ {fmt(s.peakViewerCount||s.viewerCount||0)}</div>
                <div style={{ color:'#64748b', fontSize:'10px' }}>peak</div>
              </div>
            </div>
          ))}
        </div>

        <button onClick={() => navigate('/live/setup')}
          style={{ width:'100%', background:'linear-gradient(135deg,#4f46e5,#7c3aed)', border:'none', borderRadius:'14px', padding:'14px', color:'white', fontWeight:700, fontSize:'15px', cursor:'pointer' }}>
          🔴 Start Streaming Now
        </button>
      </div>
    </div>
  );
}
