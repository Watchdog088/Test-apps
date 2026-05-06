// PAGE 14 — MEDIA HUB SCREEN (10 buttons per layout reference)
// Hub: routes to Music, Live, Video Calls, AR/VR + 4 quick-launch buttons
import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '@store/useAppStore';

const HUB_SECTIONS = [
  { icon:'🎵', label:'Music Player',    sub:'Stream & discover music',  path:'/music',      color:'#ec4899', bg:'linear-gradient(135deg,#ec4899,#8b5cf6)' },
  { icon:'🔴', label:'Live Streaming',  sub:'Broadcast to the world',   path:'/live',       color:'#ef4444', bg:'linear-gradient(135deg,#ef4444,#f59e0b)' },
  { icon:'📹', label:'Video Calls',     sub:'HD video & voice calls',   path:'/videocalls', color:'#3b82f6', bg:'linear-gradient(135deg,#3b82f6,#06b6d4)' },
  { icon:'🥽', label:'AR / VR',         sub:'Immersive experiences',    path:'/arvr',       color:'#10b981', bg:'linear-gradient(135deg,#10b981,#6366f1)' },
];

const QUICK_ACTIONS = [
  { icon:'📷', label:'AR Camera',     path:'/arvr' },
  { icon:'🔴', label:'Go Live',       path:'/live' },
  { icon:'🎵', label:'Music Library', path:'/music' },
  { icon:'📹', label:'Video Call',    path:'/videocalls' },
];

export default function MediaHubPage() {
  const navigate = useNavigate();
  const showToast = useAppStore((s) => s.showToast);

  return (
    <div style={{ background:'#0f172a', minHeight:'100vh', paddingBottom:'100px' }}>
      {/* Header */}
      <div style={{ padding:'16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize:'20px', fontWeight:700, color:'#f1f5f9' }}>🎬 Media Hub</span>
        <button onClick={() => showToast('Settings opening...')} style={{ background:'none', border:'none', color:'#94a3b8', fontSize:'20px', cursor:'pointer' }}>⚙️</button>
      </div>

      {/* Hero Banner */}
      <div style={{ margin:'16px', background:'linear-gradient(135deg,#6366f1,#ec4899,#10b981)', borderRadius:'24px', padding:'24px 20px', textAlign:'center' }}>
        <div style={{ fontSize:'40px', marginBottom:'8px' }}>🎬</div>
        <div style={{ fontWeight:900, color:'white', fontSize:'20px' }}>Your Media Center</div>
        <div style={{ color:'rgba(255,255,255,0.8)', fontSize:'13px', marginTop:'4px' }}>Music · Live · Video Calls · AR/VR</div>
      </div>

      {/* Main Hub Cards (4 navigation buttons) */}
      <div style={{ padding:'0 16px', marginBottom:'16px' }}>
        <div style={{ fontSize:'12px', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'10px' }}>Sections</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
          {HUB_SECTIONS.map(s => (
            <div key={s.path} onClick={() => navigate(s.path)} style={{ background:s.bg, borderRadius:'20px', padding:'20px 16px', cursor:'pointer', position:'relative', overflow:'hidden' }}>
              <div style={{ fontSize:'32px', marginBottom:'8px' }}>{s.icon}</div>
              <div style={{ fontWeight:800, color:'white', fontSize:'15px' }}>{s.label}</div>
              <div style={{ color:'rgba(255,255,255,0.8)', fontSize:'11px', marginTop:'4px' }}>{s.sub}</div>
              <div style={{ position:'absolute', right:'12px', bottom:'12px', color:'rgba(255,255,255,0.6)', fontSize:'18px' }}>›</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Launch Buttons (4 buttons from reference) */}
      <div style={{ padding:'0 16px' }}>
        <div style={{ fontSize:'12px', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'10px' }}>Quick Launch</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
          {QUICK_ACTIONS.map(q => (
            <button key={q.label} onClick={() => navigate(q.path)} style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:'14px', padding:'14px', display:'flex', alignItems:'center', gap:'10px', cursor:'pointer', color:'#f1f5f9', fontSize:'14px', fontWeight:600 }}>
              <span style={{ fontSize:'22px' }}>{q.icon}</span> {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ padding:'16px' }}>
        <div style={{ fontSize:'12px', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'10px' }}>Recently Used</div>
        {[
          { icon:'🎵', label:'Now Playing — Midnight Drive', sub:'Music Player · 2 min ago', path:'/music' },
          { icon:'📹', label:'Video call with Alex', sub:'Video Calls · 1 hour ago', path:'/videocalls' },
          { icon:'🔴', label:'Live Stream #42', sub:'Live · Yesterday', path:'/live' },
        ].map(r => (
          <div key={r.label} onClick={() => navigate(r.path)} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px', background:'#1e293b', borderRadius:'12px', marginBottom:'8px', cursor:'pointer' }}>
            <div style={{ width:'40px', height:'40px', borderRadius:'10px', background:'#0f172a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', flexShrink:0 }}>{r.icon}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:600, color:'#f1f5f9', fontSize:'13px' }}>{r.label}</div>
              <div style={{ color:'#64748b', fontSize:'11px', marginTop:'2px' }}>{r.sub}</div>
            </div>
            <span style={{ color:'#334155', fontSize:'16px' }}>›</span>
          </div>
        ))}
      </div>
    </div>
  );
}
