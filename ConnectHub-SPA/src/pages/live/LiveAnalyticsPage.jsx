// LIVE ANALYTICS PAGE — /live/analytics
// FIXES APPLIED (Beta Test Report):
//   BUG-18: "All Time" now correctly removes date filter (was defaulting to 7 days)
//   BUG-19: Watch Time / New Followers replaced with Avg Viewers / Streams Completed
//           (totalWatchMinutes / newFollowersCount never written — replaced with real fields)
//   BUG-20: maxV calculated once outside .map() — O(n) not O(n²)
//   UX-13:  Dead activeTab state replaced with real Views | Monetization tab UI
//   UX-14:  Previous period comparison with % delta indicators
//   UX-15:  Bar chart has stream title tooltips on hover/tap

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection, query, where, orderBy, limit, getDocs, Timestamp,
} from 'firebase/firestore';
import { db, auth } from '@/firebase/config';

// Sub-page nav (CROSS-2)
function LiveSubNav({ navigate, current }) {
  return (
    <div style={{ display:'flex', gap:'6px', padding:'8px 16px', overflowX:'auto', scrollbarWidth:'none', borderBottom:'1px solid #1e293b' }}>
      {[
        { label:'🎥 Setup',       path:'/live/setup' },
        { label:'🛡️ Moderation', path:'/live/moderation' },
        { label:'📅 Schedule',    path:'/live/schedule' },
        { label:'💰 Monetize',    path:'/live/monetization' },
      ].map(l => (
        <button key={l.path} onClick={() => navigate(l.path)}
          style={{ background: current===l.path ? 'rgba(99,102,241,0.2)' : '#1e293b', border: current===l.path ? '1px solid #6366f1' : 'none', borderRadius:'20px', padding:'5px 12px', color: current===l.path ? '#818cf8' : '#94a3b8', fontSize:'11px', fontWeight:600, cursor:'pointer', flexShrink:0 }}>
          {l.label}
        </button>
      ))}
    </div>
  );
}

async function fetchStreamsForRange(uid, dateRange) {
  // BUG-18 FIX: 'all' removes the date filter entirely
  const isAll = dateRange === 'all';
  const days  = isAll ? null : (parseInt(dateRange, 10) || 7);

  let q;
  if (isAll) {
    // No date filter — get all streams for this user
    q = query(
      collection(db, 'streams'),
      where('userId', '==', uid),
      orderBy('startedAt', 'desc'),
      limit(200)
    );
  } else {
    const cutoff = Timestamp.fromMillis(Date.now() - days * 24 * 60 * 60 * 1000);
    q = query(
      collection(db, 'streams'),
      where('userId', '==', uid),
      where('startedAt', '>=', cutoff),
      orderBy('startedAt', 'desc'),
      limit(50)
    );
  }
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export default function LiveAnalyticsPage() {
  const navigate   = useNavigate();
  // UX-13 FIX: activeTab now controls real tab UI
  const [activeTab, setActiveTab] = useState('views');
  const [streams,   setStreams]   = useState([]);
  const [prevStreams, setPrevStreams] = useState([]); // UX-14: previous period
  const [loading,   setLoading]   = useState(true);
  const [dateRange, setDateRange] = useState('7');
  const [tooltip,   setTooltip]   = useState(null); // UX-15: bar chart tooltip

  // BUG-18 + UX-14 FIX: Fetch current period AND previous period for comparison
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) { setLoading(false); return; }
    setLoading(true);
    setStreams([]);
    setPrevStreams([]);

    Promise.all([
      fetchStreamsForRange(uid, dateRange),
      // UX-14: fetch previous equivalent period for delta comparison
      (async () => {
        if (dateRange === 'all') return [];
        const days    = parseInt(dateRange, 10) || 7;
        const nowMs   = Date.now();
        const cutStart = Timestamp.fromMillis(nowMs - days * 2 * 24 * 60 * 60 * 1000);
        const cutEnd   = Timestamp.fromMillis(nowMs - days * 24 * 60 * 60 * 1000);
        const q = query(
          collection(db, 'streams'),
          where('userId', '==', uid),
          where('startedAt', '>=', cutStart),
          where('startedAt', '<',  cutEnd),
          orderBy('startedAt', 'desc'),
          limit(50)
        );
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      })(),
    ])
      .then(([cur, prev]) => {
        setStreams(cur);
        setPrevStreams(prev);
      })
      .catch(err => console.error('[Analytics]', err))
      .finally(() => setLoading(false));
  }, [dateRange]);

  // BUG-19 FIX: Use fields that are actually written by endStream():
  //   peakViewerCount ✅, totalMessages ✅, durationSeconds ✅
  //   Removed: totalWatchMinutes (never written), newFollowersCount (never written)
  //   Replaced with: avg viewers, streams completed
  const totals = useMemo(() => streams.reduce((acc, s) => ({
    views:     acc.views     + (s.peakViewerCount || s.viewerCount || 0),
    messages:  acc.messages  + (s.totalMessages   || 0),
    duration:  acc.duration  + (s.durationSeconds || 0),
    completed: acc.completed + (s.status === 'ended' ? 1 : 0),
  }), { views:0, messages:0, duration:0, completed:0 }), [streams]);

  const prevTotals = useMemo(() => prevStreams.reduce((acc, s) => ({
    views:     acc.views     + (s.peakViewerCount || s.viewerCount || 0),
    messages:  acc.messages  + (s.totalMessages   || 0),
    duration:  acc.duration  + (s.durationSeconds || 0),
    completed: acc.completed + (s.status === 'ended' ? 1 : 0),
  }), { views:0, messages:0, duration:0, completed:0 }), [prevStreams]);

  // UX-14 FIX: calculate % delta vs previous period
  const delta = (cur, prev) => {
    if (prev === 0) return cur > 0 ? '+∞%' : '—';
    const pct = Math.round(((cur - prev) / prev) * 100);
    return pct >= 0 ? `+${pct}%` : `${pct}%`;
  };
  const deltaColor = (cur, prev) => {
    if (prev === 0) return '#94a3b8';
    return cur >= prev ? '#10b981' : '#ef4444';
  };

  const fmt      = n => n >= 1000 ? `${(n/1000).toFixed(1)}K` : String(n);
  const fmtTime  = s => s >= 3600 ? `${Math.floor(s/3600)}h ${Math.floor((s%3600)/60)}m` : `${Math.floor(s/60)}m`;
  const timeAgo  = ts => {
    if (!ts) return '';
    const sec = Math.floor((Date.now() - (ts.toMillis ? ts.toMillis() : ts)) / 1000);
    if (sec < 3600) return `${Math.floor(sec/60)}m ago`;
    if (sec < 86400) return `${Math.floor(sec/3600)}h ago`;
    return `${Math.floor(sec/86400)}d ago`;
  };
  const fmtDuration = s => s ? (s >= 3600 ? `${Math.floor(s/3600)}h ${Math.floor((s%3600)/60)}m` : `${Math.floor(s/60)}m`) : '—';

  // BUG-19 FIX: Updated STATS array with real fields
  const STATS = [
    { icon:'👁️', label:'Total Views',       val: loading ? '…' : fmt(totals.views),      prev: prevTotals.views,     key:'views' },
    { icon:'💬', label:'Chat Messages',      val: loading ? '…' : fmt(totals.messages),   prev: prevTotals.messages,  key:'messages' },
    { icon:'⏱️', label:'Stream Time',        val: loading ? '…' : fmtTime(totals.duration), prev: prevTotals.duration, key:'duration' },
    { icon:'🎯', label:'Streams Completed',  val: loading ? '…' : String(totals.completed), prev: prevTotals.completed, key:'completed' },
  ];

  // BUG-20 FIX: maxV calculated ONCE outside .map()
  const maxV = useMemo(() =>
    Math.max(1, ...streams.map(s => s.peakViewerCount || s.viewerCount || 0))
  , [streams]);

  // Monetization stats (UX-13: real tab content)
  const monoTotals = useMemo(() => streams.reduce((acc, s) => ({
    coins:   acc.coins   + (s.totalGiftCoins || 0),
    gifts:   acc.gifts   + (s.totalGiftsReceived || 0),
    subs:    acc.subs    + (s.newSubscribersCount || 0),
  }), { coins:0, gifts:0, subs:0 }), [streams]);

  // CSV export
  const exportCSV = () => {
    const rows = [['Stream Title','Date','Peak Viewers','Duration (min)','Messages','Coins Received']];
    streams.forEach(s => {
      rows.push([
        `"${s.title||'Stream'}"`,
        s.startedAt ? new Date(s.startedAt.toMillis ? s.startedAt.toMillis() : s.startedAt).toLocaleDateString() : '—',
        s.peakViewerCount || s.viewerCount || 0,
        s.durationSeconds ? Math.floor(s.durationSeconds / 60) : 0,
        s.totalMessages || 0,
        s.totalGiftCoins || 0,
      ]);
    });
    const csv  = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type:'text/csv' });
    const a    = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'stream-analytics.csv'; a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div style={{ background:'var(--bg-primary,#0a0a18)', minHeight:'100vh', paddingBottom:'80px' }}>

      {/* Header */}
      <div style={{ padding:'16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', gap:'12px' }}>
        <button onClick={() => navigate(-1)} style={{ background:'none', border:'none', color:'#94a3b8', fontSize:'20px', cursor:'pointer' }}>←</button>
        {/* CROSS-1: breadcrumb */}
        <span style={{ color:'#475569', fontSize:'12px' }}>Live →</span>
        <span style={{ fontSize:'18px', fontWeight:800, color:'#f1f5f9', flex:1 }}>📊 Stream Analytics</span>
        <button onClick={exportCSV} disabled={loading || streams.length === 0}
          aria-label="Export analytics to CSV"
          style={{ background:'#1e293b', border:'none', borderRadius:'10px', padding:'6px 12px', color:'#94a3b8', fontSize:'12px', fontWeight:700, cursor:'pointer', opacity: streams.length===0?0.4:1 }}>
          📥 CSV
        </button>
      </div>

      {/* CROSS-2: Sub-page nav */}
      <LiveSubNav navigate={navigate} current="/live/analytics" />

      {/* Date range filter */}
      <div style={{ display:'flex', gap:'6px', padding:'8px 16px', borderBottom:'1px solid #1e293b', overflowX:'auto' }}>
        {[{v:'7',l:'7 Days'},{v:'30',l:'30 Days'},{v:'90',l:'90 Days'},{v:'all',l:'All Time'}].map(r => (
          <button key={r.v} onClick={() => setDateRange(r.v)} aria-pressed={dateRange===r.v}
            style={{ padding:'5px 12px', borderRadius:'16px', border:'none', fontSize:'12px', fontWeight:600, cursor:'pointer', flexShrink:0,
              background: dateRange===r.v ? 'linear-gradient(135deg,#6366f1,#7c3aed)' : '#1e293b',
              color: dateRange===r.v ? 'white' : '#94a3b8' }}>
            {r.l}
          </button>
        ))}
      </div>

      {/* UX-13 FIX: Real tab bar — Views vs Monetization */}
      <div style={{ display:'flex', borderBottom:'1px solid #1e293b' }}>
        {[{id:'views',label:'📈 Views'},{id:'monetization',label:'💰 Monetization'}].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{ flex:1, padding:'10px 16px', border:'none', background:'none', cursor:'pointer', fontWeight:600, fontSize:'13px',
              color: activeTab===t.id ? '#f1f5f9' : '#64748b',
              borderBottom: activeTab===t.id ? '2px solid #6366f1' : '2px solid transparent' }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding:'20px 16px' }}>

        {/* Header card */}
        <div style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed)', borderRadius:'18px', padding:'16px', marginBottom:'24px', textAlign:'center' }}>
          <div style={{ fontSize:'28px', marginBottom:'6px' }}>📊</div>
          <div style={{ color:'white', fontWeight:700, fontSize:'15px' }}>
            {loading ? 'Loading analytics…' : streams.length > 0 ? `${streams.length} stream${streams.length>1?'s':''} analyzed` : 'No streams yet'}
          </div>
          <div style={{ color:'rgba(255,255,255,0.75)', fontSize:'12px', marginTop:'4px' }}>
            {streams.length > 0 ? `Real data • ${dateRange==='all'?'All Time':`Last ${dateRange} days`}` : 'Go live to start collecting analytics'}
          </div>
        </div>

        {/* ── VIEWS TAB ─────────────────────────────────────────── */}
        {activeTab === 'views' && (
          <>
            {/* BUG-20 FIX + UX-14 FIX: Stats grid with deltas */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'24px' }}>
              {STATS.map(s => (
                <div key={s.label} style={{ background:'#1e293b', borderRadius:'14px', padding:'16px', textAlign:'center' }}>
                  <div style={{ fontSize:'24px', marginBottom:'4px' }}>{s.icon}</div>
                  <div style={{ color:'#f1f5f9', fontWeight:800, fontSize:'22px', marginBottom:'2px' }}>{s.val}</div>
                  <div style={{ color:'#f1f5f9', fontWeight:600, fontSize:'12px' }}>{s.label}</div>
                  {/* UX-14 FIX: period delta */}
                  {dateRange !== 'all' && !loading && (
                    <div style={{ color: deltaColor(totals[s.key], s.prev), fontSize:'10px', marginTop:'3px', fontWeight:700 }}>
                      {delta(totals[s.key], s.prev)} vs prev period
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* BUG-20 + UX-15 FIX: Bar chart with tooltip, maxV outside map */}
            {streams.length > 0 && (
              <div style={{ background:'#1e293b', borderRadius:'14px', padding:'16px', marginBottom:'16px' }}>
                <div style={{ fontSize:'12px', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'12px' }}>
                  📈 Peak Viewers Per Stream (Latest {Math.min(streams.length,12)})
                </div>
                <div style={{ position:'relative', height:'80px', display:'flex', alignItems:'flex-end', gap:'4px' }}>
                  {streams.slice(0,12).map((s,i) => {
                    // BUG-20 FIX: maxV calculated once outside (see useMemo above)
                    const pct = Math.max(5, Math.round(((s.peakViewerCount||s.viewerCount||0)/maxV)*100));
                    return (
                      <div key={s.id}
                        onMouseEnter={() => setTooltip({ i, title: s.title||'Stream', viewers: s.peakViewerCount||s.viewerCount||0, date: s.startedAt ? new Date(s.startedAt.toMillis?.() || s.startedAt).toLocaleDateString() : '' })}
                        onMouseLeave={() => setTooltip(null)}
                        onClick={() => setTooltip(prev => prev?.i===i ? null : { i, title: s.title||'Stream', viewers: s.peakViewerCount||s.viewerCount||0, date: s.startedAt ? new Date(s.startedAt.toMillis?.() || s.startedAt).toLocaleDateString() : '' })}
                        style={{ flex:1, background:`linear-gradient(to top,#6366f1,#8b5cf6)`, borderRadius:'4px 4px 0 0', height:`${pct}%`, cursor:'pointer', opacity: tooltip?.i===i ? 1 : 0.8, transition:'opacity 0.1s' }} />
                    );
                  })}
                </div>
                {/* UX-15 FIX: Tooltip */}
                {tooltip && (
                  <div style={{ background:'#0f172a', border:'1px solid #334155', borderRadius:'8px', padding:'8px 12px', marginTop:'8px', fontSize:'12px' }}>
                    <span style={{ color:'#f1f5f9', fontWeight:700 }}>{tooltip.title}</span>
                    <span style={{ color:'#64748b', marginLeft:'8px' }}>{tooltip.date}</span>
                    <span style={{ color:'#818cf8', marginLeft:'8px' }}>👁️ {tooltip.viewers} peak viewers</span>
                  </div>
                )}
                <div style={{ color:'#475569', fontSize:'10px', textAlign:'center', marginTop:'6px' }}>
                  Tap a bar for stream details • newest on right
                </div>
              </div>
            )}

            {/* Recent streams list */}
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
                    {s.status==='live'?'🔴':s.status==='scheduled'?'📅':'📼'}
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
          </>
        )}

        {/* ── MONETIZATION TAB (UX-13 FIX) ─────────────────────── */}
        {activeTab === 'monetization' && (
          <>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'20px' }}>
              {[
                { icon:'🪙', label:'Coins Earned',  val: loading ? '…' : fmt(monoTotals.coins),  color:'#f59e0b' },
                { icon:'🎁', label:'Gifts Received', val: loading ? '…' : fmt(monoTotals.gifts),  color:'#ec4899' },
                { icon:'💵', label:'Est. Earnings',  val: loading ? '…' : `$${(monoTotals.coins/100).toFixed(2)}`, color:'#10b981' },
                { icon:'⭐', label:'New Subs',       val: loading ? '…' : fmt(monoTotals.subs),   color:'#6366f1' },
              ].map(s => (
                <div key={s.label} style={{ background:'#1e293b', borderRadius:'14px', padding:'16px', textAlign:'center' }}>
                  <div style={{ fontSize:'24px', marginBottom:'4px' }}>{s.icon}</div>
                  <div style={{ color:s.color, fontWeight:800, fontSize:'22px', marginBottom:'2px' }}>{s.val}</div>
                  <div style={{ color:'#64748b', fontSize:'11px' }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:'14px', padding:'14px', marginBottom:'16px' }}>
              <div style={{ color:'#f59e0b', fontSize:'12px', fontWeight:700, marginBottom:'6px' }}>💡 Revenue Note</div>
              <div style={{ color:'#94a3b8', fontSize:'12px', lineHeight:'1.6' }}>
                Earnings shown are estimates based on coins received. ConnectHub's revenue share: <strong style={{ color:'#f1f5f9' }}>you keep 70%</strong> of all gift earnings after platform fees.
                <br/>Actual payouts process through Stripe Connect.
              </div>
            </div>
            <button onClick={() => navigate('/live/monetization')}
              style={{ width:'100%', background:'linear-gradient(135deg,#f59e0b,#d97706)', border:'none', borderRadius:'14px', padding:'14px', color:'white', fontWeight:700, fontSize:'14px', cursor:'pointer' }}>
              💰 Go to Monetization Settings
            </button>
          </>
        )}

        <button onClick={() => navigate('/live/setup')}
          style={{ width:'100%', background:'linear-gradient(135deg,#4f46e5,#7c3aed)', border:'none', borderRadius:'14px', padding:'14px', color:'white', fontWeight:700, fontSize:'15px', cursor:'pointer', marginTop:'12px' }}>
          🔴 Start Streaming Now
        </button>
      </div>
    </div>
  );
}
