// LiveAnalyticsPage.jsx — /live/analytics
// UX-25: Real Firestore stream history query
// UX-26: Date range picker
// UX-27: CSV export
// UX-28: Average comparison indicator

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db, auth } from '@/firebase/config';

const RANGES = [
  { id: '7d',  label: 'Last 7 days',  days: 7 },
  { id: '30d', label: 'Last 30 days', days: 30 },
  { id: '90d', label: 'Last 90 days', days: 90 },
  { id: 'all', label: 'All time',     days: null },
];

function StatCard({ emoji, label, value, avg, unit = '' }) {
  const above = avg != null && value > avg;
  const below = avg != null && value < avg;
  return (
    <div style={{ background:'#1e293b', borderRadius:'14px', padding:'14px 16px', flex:'1 1 140px' }}>
      <div style={{ fontSize:'22px', marginBottom:'4px' }}>{emoji}</div>
      <div style={{ color:'#94a3b8', fontSize:'11px', marginBottom:'2px' }}>{label}</div>
      <div style={{ color:'#f1f5f9', fontWeight:800, fontSize:'20px' }}>{value.toLocaleString()}{unit}</div>
      {/* UX-28: vs average */}
      {avg != null && (
        <div style={{ fontSize:'10px', marginTop:'3px', color: above ? '#22c55e' : below ? '#ef4444' : '#64748b' }}>
          {above ? '▲' : below ? '▼' : '—'} vs avg {avg.toLocaleString()}{unit}
        </div>
      )}
    </div>
  );
}

export default function LiveAnalyticsPage() {
  const navigate   = useNavigate();
  const [searchParams] = useSearchParams();
  const streamId = searchParams.get('streamId');

  const [streams,  setStreams]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [range,    setRange]    = useState('30d');
  const [selected, setSelected] = useState(null); // selected single stream

  // UX-25: Real Firestore query
  useEffect(() => {
    if (!auth.currentUser) return;
    const load = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'streams'),
          where('userId',  '==', auth.currentUser.uid),
          where('status',  '==', 'ended'),
          orderBy('endedAt', 'desc'),
          limit(50)
        );
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setStreams(data);
        if (streamId) setSelected(data.find(s => s.id === streamId) || null);
      } catch (e) {
        console.error('Analytics load error:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [streamId]);

  // UX-26: date range filter
  const filtered = useMemo(() => {
    const cfg = RANGES.find(r => r.id === range);
    if (!cfg || !cfg.days) return streams;
    const cutoff = Date.now() - cfg.days * 86400000;
    return streams.filter(s => {
      const t = s.endedAt?.toMillis ? s.endedAt.toMillis() : (s.endedAt || 0);
      return t >= cutoff;
    });
  }, [streams, range]);

  const totals = useMemo(() => {
    const list = selected ? [selected] : filtered;
    const peakViews  = list.reduce((a,s) => a + (s.peakViewerCount || s.viewerCount || 0), 0);
    const totalMins  = list.reduce((a,s) => a + Math.round((s.durationSeconds || 0) / 60), 0);
    const totalGifts = list.reduce((a,s) => a + (s.totalGifts || 0), 0);
    const totalMsgs  = list.reduce((a,s) => a + (s.chatMessages || 0), 0);
    const totalEarn  = list.reduce((a,s) => a + (s.earnings || 0), 0);
    return { peakViews, totalMins, totalGifts, totalMsgs, totalEarn, count: list.length };
  }, [filtered, selected]);

  const avgs = useMemo(() => {
    if (filtered.length === 0) return null;
    const n = filtered.length;
    return {
      peakViews:  Math.round(filtered.reduce((a,s) => a + (s.peakViewerCount || s.viewerCount || 0), 0) / n),
      totalMins:  Math.round(filtered.reduce((a,s) => a + Math.round((s.durationSeconds || 0) / 60), 0) / n),
      totalGifts: Math.round(filtered.reduce((a,s) => a + (s.totalGifts || 0), 0) / n),
      totalMsgs:  Math.round(filtered.reduce((a,s) => a + (s.chatMessages || 0), 0) / n),
      totalEarn:  parseFloat((filtered.reduce((a,s) => a + (s.earnings || 0), 0) / n).toFixed(2)),
    };
  }, [filtered]);

  // UX-27: CSV export
  const exportCSV = () => {
    const cols = ['Date', 'Title', 'Duration(min)', 'PeakViewers', 'ChatMessages', 'Gifts', 'Earnings($)'];
    const rows = filtered.map(s => {
      const date = s.endedAt?.toDate ? s.endedAt.toDate().toLocaleDateString() : 'N/A';
      return [
        date,
        `"${(s.title || '').replace(/"/g,'""')}"`,
        Math.round((s.durationSeconds || 0) / 60),
        s.peakViewerCount || s.viewerCount || 0,
        s.chatMessages || 0,
        s.totalGifts || 0,
        (s.earnings || 0).toFixed(2),
      ].join(',');
    });
    const csv = [cols.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `stream-analytics-${range}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const fmt = n => n >= 1000 ? `${(n/1000).toFixed(1)}K` : String(n || 0);

  return (
    <div style={{ background:'#0a0a18', minHeight:'100vh', paddingBottom:'80px' }}>
      {/* Header */}
      <div style={{ padding:'12px 16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', gap:'10px' }}>
        <button onClick={() => navigate(-1)} style={{ background:'none', border:'none', color:'#94a3b8', fontSize:'20px', cursor:'pointer', padding:'4px' }}>←</button>
        <span style={{ fontSize:'16px', fontWeight:800, color:'#f1f5f9', flex:1 }}>📊 Stream Analytics</span>
        {/* UX-27: Export CSV */}
        <button onClick={exportCSV}
          style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:'10px', padding:'6px 12px', color:'#94a3b8', fontSize:'12px', fontWeight:600, cursor:'pointer' }}>
          📥 Export CSV
        </button>
      </div>

      <div style={{ padding:'12px 16px' }}>
        {/* UX-26: Date range pills */}
        <div style={{ display:'flex', gap:'8px', marginBottom:'16px', overflowX:'auto' }}>
          {RANGES.map(r => (
            <button key={r.id} onClick={() => { setRange(r.id); setSelected(null); }}
              style={{ padding:'6px 14px', borderRadius:'20px', border:'none', fontSize:'12px', fontWeight:600, cursor:'pointer', flexShrink:0,
                background: range === r.id ? 'linear-gradient(135deg,#ef4444,#f59e0b)' : '#1e293b',
                color: range === r.id ? 'white' : '#94a3b8' }}>
              {r.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:'40px', color:'#64748b' }}>Loading analytics…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'40px 16px', background:'#1e293b', borderRadius:'16px' }}>
            <div style={{ fontSize:'36px', marginBottom:'8px' }}>📊</div>
            <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'15px', marginBottom:'6px' }}>No streams in this period</div>
            <div style={{ color:'#64748b', fontSize:'13px' }}>Go live to start building your analytics</div>
          </div>
        ) : (
          <>
            {/* Summary title */}
            <div style={{ color:'#64748b', fontSize:'12px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'10px' }}>
              {selected ? `📺 ${selected.title || 'Single Stream'}` : `📊 ${filtered.length} stream${filtered.length !== 1 ? 's' : ''}`}
            </div>

            {/* UX-28: Stat cards with average comparison */}
            <div style={{ display:'flex', gap:'10px', flexWrap:'wrap', marginBottom:'20px' }}>
              <StatCard emoji="👁" label="Peak Viewers"  value={totals.peakViews}  avg={selected ? avgs?.peakViews  : null} />
              <StatCard emoji="⏱" label="Minutes Live"  value={totals.totalMins}  avg={selected ? avgs?.totalMins  : null} unit="m" />
              <StatCard emoji="💬" label="Chat Messages" value={totals.totalMsgs}  avg={selected ? avgs?.totalMsgs  : null} />
              <StatCard emoji="🎁" label="Gifts Received" value={totals.totalGifts} avg={selected ? avgs?.totalGifts : null} />
              <StatCard emoji="💰" label="Earnings"      value={parseFloat(totals.totalEarn.toFixed(2))} avg={selected ? avgs?.totalEarn : null} unit="$" />
            </div>

            {/* Stream list */}
            <div style={{ fontSize:'12px', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'10px' }}>
              {selected ? '← All streams' : 'Stream History'}
            </div>

            {selected ? (
              <button onClick={() => setSelected(null)}
                style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:'10px', padding:'8px 16px', color:'#94a3b8', fontSize:'13px', cursor:'pointer', marginBottom:'12px' }}>
                ← Back to all streams
              </button>
            ) : null}

            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {filtered.map(s => {
                const date = s.endedAt?.toDate ? s.endedAt.toDate().toLocaleDateString() : '';
                const mins = Math.round((s.durationSeconds || 0) / 60);
                const isSelected = selected?.id === s.id;
                return (
                  <div key={s.id} onClick={() => setSelected(isSelected ? null : s)}
                    style={{ background: isSelected ? '#1e3a5f' : '#1e293b', borderRadius:'14px', padding:'12px 14px', cursor:'pointer',
                      border: isSelected ? '1px solid #3b82f6' : '1px solid transparent' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'8px' }}>
                      <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'14px', flex:1, marginRight:'8px' }}>
                        {s.title || 'Untitled Stream'}
                      </div>
                      <div style={{ color:'#64748b', fontSize:'11px', flexShrink:0 }}>{date}</div>
                    </div>
                    <div style={{ display:'flex', gap:'16px', flexWrap:'wrap' }}>
                      <span style={{ color:'#94a3b8', fontSize:'12px' }}>👁 {fmt(s.peakViewerCount || s.viewerCount)}</span>
                      <span style={{ color:'#94a3b8', fontSize:'12px' }}>⏱ {mins}m</span>
                      <span style={{ color:'#94a3b8', fontSize:'12px' }}>💬 {fmt(s.chatMessages)}</span>
                      <span style={{ color:'#94a3b8', fontSize:'12px' }}>🎁 {s.totalGifts || 0}</span>
                      {s.earnings > 0 && <span style={{ color:'#22c55e', fontSize:'12px' }}>💰 ${s.earnings?.toFixed(2)}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
