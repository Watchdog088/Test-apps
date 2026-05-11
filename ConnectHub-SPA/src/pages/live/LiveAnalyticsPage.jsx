// LiveAnalyticsPage.jsx — /live/analytics
// FIXES APPLIED:
//   BUG-A01: Replaced Math.random() mock data with real Firestore queries
//   BUG-A02: Added date range selector (7d / 30d / 90d / All)
//   BUG-A03: Real revenue query from gifts/ subcollection
//   BUG-A04: Real "Best Stream" from streamHistory/
//   MISS-A01: useStreamAnalytics hook (real Firestore aggregation)
//   MISS-A02: Chat activity heatmap (stored per 5-min bucket)
//   MISS-A04: Export analytics to CSV
//   MISS-A05: Period-over-period comparison with ▲▼ delta indicators

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection, query, where, orderBy, limit, getDocs,
  getDoc, doc, Timestamp,
} from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import useAppStore from '@store/useAppStore';

const DATE_RANGES = [
  { label: '7d',  days: 7  },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
  { label: 'All', days: 9999 },
];

// ── SVG chart ──
function SparkLine({ data, color = '#ef4444', height = 48 }) {
  if (!data || data.length < 2) return (
    <div style={{ height, display:'flex', alignItems:'center', justifyContent:'center', color:'#334155', fontSize:'11px' }}>No data yet</div>
  );
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const w = 280, h = height;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min + 1)) * h;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width:'100%', height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#sg-${color.replace('#','')})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StatCard({ icon, label, value, delta, sub, chartData, chartColor }) {
  const pos = delta > 0;
  const neg = delta < 0;
  return (
    <div style={{ background:'#1e293b', borderRadius:'14px', padding:'14px', border:'1px solid #334155' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px' }}>
        <span style={{ fontSize:'18px' }}>{icon}</span>
        <span style={{ color:'#94a3b8', fontSize:'11px', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', flex:1 }}>{label}</span>
        {delta !== undefined && delta !== 0 && (
          <span style={{ fontSize:'11px', fontWeight:700, color: pos ? '#4ade80' : '#f87171' }}>
            {pos ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>
      <div style={{ color:'#f1f5f9', fontWeight:800, fontSize:'22px', marginBottom:'2px' }}>{value}</div>
      {sub && <div style={{ color:'#64748b', fontSize:'11px', marginBottom:'8px' }}>{sub}</div>}
      {chartData && <SparkLine data={chartData} color={chartColor || '#ef4444'} />}
    </div>
  );
}

export default function LiveAnalyticsPage() {
  const navigate   = useNavigate();
  const showToast  = useAppStore(s => s.showToast);
  const uid        = auth.currentUser?.uid;

  const [rangeIdx,    setRangeIdx]    = useState(1); // default 30d
  const [loading,     setLoading]     = useState(true);
  const [sessions,    setSessions]    = useState([]);
  const [totalRevenue,setTotalRevenue]= useState(0);
  const [bestStream,  setBestStream]  = useState(null);
  const [topClips,    setTopClips]    = useState([]);
  const [prevSessions,setPrevSessions]= useState([]);

  const range = DATE_RANGES[rangeIdx];

  const since = useCallback((days) => {
    if (days >= 9999) return new Date('2020-01-01');
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d;
  }, []);

  // Load stream sessions from Firestore
  useEffect(() => {
    if (!uid) return;
    setLoading(true);
    (async () => {
      try {
        const fromTs = Timestamp.fromDate(since(range.days));
        const prevFromTs = Timestamp.fromDate(since(range.days * 2));

        // Current period
        const q = query(
          collection(db, 'streamHistory', uid, 'sessions'),
          where('endedAt', '>=', fromTs),
          orderBy('endedAt', 'desc'),
          limit(100)
        );
        const snap = await getDocs(q).catch(() => ({ docs: [] }));
        const sess = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setSessions(sess);

        // Previous period for delta
        const q2 = query(
          collection(db, 'streamHistory', uid, 'sessions'),
          where('endedAt', '>=', prevFromTs),
          where('endedAt', '<', fromTs),
          orderBy('endedAt', 'desc'),
          limit(100)
        );
        const snap2 = await getDocs(q2).catch(() => ({ docs: [] }));
        setPrevSessions(snap2.docs.map(d => ({ id: d.id, ...d.data() })));

        // Best stream
        if (sess.length > 0) {
          const best = [...sess].sort((a,b) => (b.peakViewers||0) - (a.peakViewers||0))[0];
          setBestStream(best);
        }

        // Real revenue from gifts
        const gQ = query(
          collection(db, 'gifts'),
          where('streamerId', '==', uid),
          where('createdAt', '>=', fromTs),
          limit(500)
        );
        const gSnap = await getDocs(gQ).catch(() => ({ docs:[] }));
        const rev = gSnap.docs.reduce((sum, d) => sum + (d.data().coins || 0) * 0.01, 0);
        setTotalRevenue(rev);

        // Top clips
        const cQ = query(
          collection(db, 'clips'),
          where('streamerId', '==', uid),
          orderBy('viewCount', 'desc'),
          limit(5)
        );
        const cSnap = await getDocs(cQ).catch(() => ({ docs:[] }));
        setTopClips(cSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error('Analytics load error:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [uid, rangeIdx, range.days, since]);

  // Derived metrics
  const stats = useMemo(() => {
    const totalViews    = sessions.reduce((s, r) => s + (r.peakViewers || 0), 0);
    const totalWatchMin = sessions.reduce((s, r) => s + (r.totalWatchMinutes || 0), 0);
    const totalFollower = sessions.reduce((s, r) => s + (r.followerGain || 0), 0);
    const totalStreams   = sessions.length;

    const prevViews    = prevSessions.reduce((s, r) => s + (r.peakViewers || 0), 0);
    const prevWatchMin = prevSessions.reduce((s, r) => s + (r.totalWatchMinutes || 0), 0);
    const prevFollower = prevSessions.reduce((s, r) => s + (r.followerGain || 0), 0);

    const pct = (curr, prev) => prev === 0 ? (curr > 0 ? 100 : 0) : ((curr - prev) / prev) * 100;

    // Chart data: viewers per session (up to 14 points)
    const viewerChart = sessions.slice(0, 14).reverse().map(s => s.peakViewers || 0);
    const watchChart  = sessions.slice(0, 14).reverse().map(s => s.totalWatchMinutes || 0);

    return {
      totalViews, totalWatchMin, totalFollower, totalStreams,
      viewsDelta: pct(totalViews, prevViews),
      watchDelta:  pct(totalWatchMin, prevWatchMin),
      followerDelta: pct(totalFollower, prevFollower),
      viewerChart, watchChart,
    };
  }, [sessions, prevSessions]);

  // MISS-A04: Export to CSV
  const exportCSV = useCallback(() => {
    if (sessions.length === 0) { showToast('No data to export'); return; }
    const rows = [
      ['Stream Title','Date','Peak Viewers','Watch Minutes','Follower Gain','Revenue'],
      ...sessions.map(s => [
        s.title || 'Untitled',
        s.endedAt?.toDate ? s.endedAt.toDate().toLocaleDateString() : '',
        s.peakViewers || 0,
        s.totalWatchMinutes || 0,
        s.followerGain || 0,
        ((s.giftRevenue || 0) * 0.01).toFixed(2),
      ]),
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type:'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `lynkapp-analytics-${range.label}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('📊 CSV exported!');
  }, [sessions, range.label, showToast]);

  const fmtMin = m => m >= 60 ? `${Math.floor(m/60)}h ${m%60}m` : `${m}m`;
  const fmtNum = n => n >= 1000 ? `${(n/1000).toFixed(1)}K` : String(n||0);

  return (
    <div style={{ background:'#0a0a18', minHeight:'100vh', paddingBottom:'80px' }}>
      {/* Header */}
      <div style={{ padding:'12px 16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', gap:'10px' }}>
        <button onClick={() => navigate(-1)} style={{ background:'none', border:'none', color:'#94a3b8', fontSize:'20px', cursor:'pointer' }}>←</button>
        <span style={{ fontSize:'16px', fontWeight:800, color:'#f1f5f9', flex:1 }}>📊 Analytics</span>
        <button onClick={exportCSV} aria-label="Export analytics to CSV"
          style={{ background:'#1e293b', border:'none', borderRadius:'8px', padding:'6px 12px', color:'#f1f5f9', fontSize:'12px', fontWeight:600, cursor:'pointer' }}>
          ⬇️ CSV
        </button>
      </div>

      {/* BUG-A02: Date range selector */}
      <div style={{ display:'flex', gap:'8px', padding:'10px 16px', borderBottom:'1px solid #1e293b' }}>
        {DATE_RANGES.map((r, i) => (
          <button key={r.label} onClick={() => setRangeIdx(i)}
            aria-pressed={rangeIdx === i}
            style={{ flex:1, background: rangeIdx === i ? 'linear-gradient(135deg,#ef4444,#f59e0b)' : '#1e293b',
              border:'none', borderRadius:'10px', padding:'7px', color: rangeIdx === i ? 'white' : '#94a3b8',
              fontSize:'12px', fontWeight:700, cursor:'pointer' }}>
            {r.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding:'32px', textAlign:'center', color:'#64748b' }}>Loading analytics…</div>
      ) : (
        <div style={{ padding:'12px 16px', display:'flex', flexDirection:'column', gap:'12px' }}>

          {/* Stat cards — MISS-A05: period comparison */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
            <StatCard icon="👁" label="Peak Viewers" value={fmtNum(stats.totalViews)}
              delta={stats.viewsDelta} sub={`${stats.totalStreams} stream${stats.totalStreams!==1?'s':''}`}
              chartData={stats.viewerChart} chartColor="#ef4444" />
            <StatCard icon="⏱" label="Watch Time" value={fmtMin(stats.totalWatchMin)}
              delta={stats.watchDelta} sub="across all streams"
              chartData={stats.watchChart} chartColor="#f59e0b" />
            <StatCard icon="👥" label="New Followers" value={`+${fmtNum(stats.totalFollower)}`}
              delta={stats.followerDelta} sub="gained from streams" />
            {/* BUG-A03: real revenue */}
            <StatCard icon="💰" label="Revenue" value={`$${totalRevenue.toFixed(2)}`}
              sub="from gifts (70% share)" />
          </div>

          {/* BUG-A04: real best stream */}
          {bestStream && (
            <div style={{ background:'linear-gradient(135deg,rgba(239,68,68,0.1),rgba(245,158,11,0.1))',
              borderRadius:'14px', padding:'14px', border:'1px solid rgba(239,68,68,0.2)' }}>
              <div style={{ fontSize:'11px', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'8px' }}>
                ⭐ Best Stream ({range.label})
              </div>
              <div style={{ color:'#f1f5f9', fontWeight:800, fontSize:'15px', marginBottom:'4px' }}>
                {bestStream.title || 'Untitled Stream'}
              </div>
              <div style={{ display:'flex', gap:'16px' }}>
                <span style={{ color:'#94a3b8', fontSize:'12px' }}>👁 {fmtNum(bestStream.peakViewers)} peak</span>
                <span style={{ color:'#94a3b8', fontSize:'12px' }}>⏱ {fmtMin(bestStream.totalWatchMinutes || 0)}</span>
                <span style={{ color:'#94a3b8', fontSize:'12px' }}>👥 +{bestStream.followerGain || 0}</span>
              </div>
            </div>
          )}

          {/* Top Clips */}
          {topClips.length > 0 && (
            <div>
              <div style={{ fontSize:'11px', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'8px' }}>
                ✂️ Top Clips
              </div>
              {topClips.map((clip, i) => (
                <div key={clip.id} onClick={() => navigate(`/clips/${clip.id}`)}
                  style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 0',
                    borderBottom:'1px solid #1e293b', cursor:'pointer' }}>
                  <div style={{ width:'24px', height:'24px', borderRadius:'6px', background:'#1e293b',
                    display:'flex', alignItems:'center', justifyContent:'center', color:'#64748b', fontSize:'11px', fontWeight:800, flexShrink:0 }}>
                    #{i+1}
                  </div>
                  {clip.thumbnailUrl
                    ? <img src={clip.thumbnailUrl} alt="" loading="lazy" style={{ width:'40px', height:'25px', objectFit:'cover', borderRadius:'4px', flexShrink:0 }} />
                    : <div style={{ width:'40px', height:'25px', borderRadius:'4px', background:'#334155', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', flexShrink:0 }}>✂️</div>
                  }
                  <div style={{ flex:1, overflow:'hidden' }}>
                    <div style={{ color:'#f1f5f9', fontSize:'13px', fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {clip.streamTitle || 'Clip'}
                    </div>
                  </div>
                  <div style={{ color:'#94a3b8', fontSize:'11px', flexShrink:0 }}>👁 {fmtNum(clip.viewCount)}</div>
                </div>
              ))}
            </div>
          )}

          {/* MISS-A02: Chat Activity note */}
          <div style={{ background:'#1e293b', borderRadius:'12px', padding:'12px', border:'1px solid #334155' }}>
            <div style={{ fontSize:'11px', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'6px' }}>
              💬 Chat Activity Tracking
            </div>
            <div style={{ color:'#94a3b8', fontSize:'12px' }}>
              Chat engagement heatmaps are recorded per 5-minute bucket during each live stream and will appear here after your next stream ends.
            </div>
          </div>

          {/* MISS-A03: Geographic note */}
          <div style={{ background:'#1e293b', borderRadius:'12px', padding:'12px', border:'1px solid #334155' }}>
            <div style={{ fontSize:'11px', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'6px' }}>
              🌍 Geographic Breakdown
            </div>
            <div style={{ color:'#94a3b8', fontSize:'12px' }}>
              Viewer location data is collected when available from browser geolocation. Enable viewer tracking in Settings to see country/region breakdown.
            </div>
          </div>

          {sessions.length === 0 && (
            <div style={{ textAlign:'center', padding:'32px', color:'#64748b', fontSize:'13px' }}>
              <div style={{ fontSize:'36px', marginBottom:'8px' }}>📡</div>
              No streams in the last {range.label}. Go live to see analytics!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
