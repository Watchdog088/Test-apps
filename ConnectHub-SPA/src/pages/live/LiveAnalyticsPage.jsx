// LIVE ANALYTICS PAGE — /live/analytics
// FIXED: LIVE-BUG-10 (analytics navigates to real dashboard)
import React from 'react';
import { useNavigate } from 'react-router-dom';

const STATS = [
  { icon:'👁️', label:'Total Views',    val:'—',  sub:'Lifetime' },
  { icon:'⏱️', label:'Watch Time',     val:'—',  sub:'Avg minutes' },
  { icon:'👥', label:'New Followers',  val:'—',  sub:'From streams' },
  { icon:'💬', label:'Chat Messages',  val:'—',  sub:'Total' },
];

export default function LiveAnalyticsPage() {
  const navigate = useNavigate();
  return (
    <div style={{ background:'var(--bg-primary,#0a0a18)', minHeight:'100vh', paddingBottom:'80px' }}>
      <div style={{ padding:'16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', gap:'12px' }}>
        <button onClick={() => navigate(-1)} style={{ background:'none', border:'none', color:'#94a3b8', fontSize:'20px', cursor:'pointer' }}>←</button>
        <span style={{ fontSize:'18px', fontWeight:800, color:'#f1f5f9' }}>📊 Stream Analytics</span>
      </div>

      <div style={{ padding:'20px 16px' }}>
        <div style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed)', borderRadius:'18px', padding:'16px', marginBottom:'24px', textAlign:'center' }}>
          <div style={{ fontSize:'28px', marginBottom:'6px' }}>📊</div>
          <div style={{ color:'white', fontWeight:700, fontSize:'15px' }}>Analytics Dashboard</div>
          <div style={{ color:'rgba(255,255,255,0.75)', fontSize:'12px', marginTop:'4px' }}>
            Data populates after your first live stream. Go live to see real stats!
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'24px' }}>
          {STATS.map(s => (
            <div key={s.label} style={{ background:'#1e293b', borderRadius:'14px', padding:'16px', textAlign:'center' }}>
              <div style={{ fontSize:'24px', marginBottom:'4px' }}>{s.icon}</div>
              <div style={{ color:'#f1f5f9', fontWeight:800, fontSize:'20px', marginBottom:'2px' }}>{s.val}</div>
              <div style={{ color:'#f1f5f9', fontWeight:600, fontSize:'12px' }}>{s.label}</div>
              <div style={{ color:'#475569', fontSize:'10px' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Placeholder chart */}
        <div style={{ background:'#1e293b', borderRadius:'14px', padding:'16px', marginBottom:'16px' }}>
          <div style={{ fontSize:'12px', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'12px' }}>
            📈 Viewer Count Over Time
          </div>
          <div style={{ height:'100px', display:'flex', alignItems:'flex-end', gap:'4px', justifyContent:'space-between' }}>
            {[20, 40, 35, 60, 80, 55, 90, 70, 85, 100, 75, 60].map((h, i) => (
              <div
                key={i}
                style={{ flex:1, background:`linear-gradient(to top, #6366f1, #8b5cf6)`, borderRadius:'4px 4px 0 0', height:`${h}%`, opacity:0.6 }}
              />
            ))}
          </div>
          <div style={{ color:'#475569', fontSize:'10px', textAlign:'center', marginTop:'8px' }}>
            (Placeholder — real chart data shown after first stream)
          </div>
        </div>

        {/* Top streams */}
        <div style={{ background:'#1e293b', borderRadius:'14px', padding:'16px', marginBottom:'16px' }}>
          <div style={{ fontSize:'12px', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'10px' }}>
            🏆 Your Top Streams
          </div>
          <div style={{ color:'#475569', fontSize:'13px', textAlign:'center', padding:'16px' }}>
            No streams yet — go live to build your history!
          </div>
        </div>

        <button
          onClick={() => navigate('/live/setup')}
          style={{ width:'100%', background:'linear-gradient(135deg,#4f46e5,#7c3aed)', border:'none', borderRadius:'14px', padding:'14px', color:'white', fontWeight:700, fontSize:'15px', cursor:'pointer' }}
        >
          🔴 Start Streaming Now
        </button>
      </div>
    </div>
  );
}
