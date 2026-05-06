// PAGE 5 — LIVE STREAMING SCREEN (14 buttons per layout reference)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '@store/useAppStore';

export default function LivePage() {
  const navigate = useNavigate();
  const showToast = useAppStore((s) => s.showToast);
  const [streaming, setStreaming] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(false);

  const LIVE_FEEDS = [
    { id:1, user:'Alex Johnson', title:'Morning Workout 🏋️', viewers:1234, emoji:'😊', live:true },
    { id:2, user:'Sarah Chen', title:'Cooking with Sarah 🍳', viewers:892, emoji:'🎨', live:true },
    { id:3, user:'Mike Davis', title:'Gaming Night 🎮', viewers:2341, emoji:'🚀', live:true },
  ];

  return (
    <div style={{ background:'#0f172a', minHeight:'100vh', paddingBottom:'100px' }}>
      {/* Header */}
      <div style={{ padding:'16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize:'20px', fontWeight:700, color:'#f1f5f9' }}>🔴 Live Streaming</span>
        <button onClick={() => showToast('Stream settings opening...')} style={{ background:'none', border:'none', color:'#94a3b8', fontSize:'20px', cursor:'pointer' }}>⚙️</button>
      </div>

      {/* Start Stream Hero Card */}
      <div style={{ margin:'16px', background:'linear-gradient(135deg,#ef4444,#f59e0b)', borderRadius:'24px', padding:'24px 20px', textAlign:'center' }}>
        <div style={{ fontSize:'40px', marginBottom:'8px' }}>🔴</div>
        <div style={{ fontWeight:900, color:'white', fontSize:'20px' }}>Go Live Now</div>
        <div style={{ color:'rgba(255,255,255,0.85)', fontSize:'13px', marginTop:'4px', marginBottom:'20px' }}>Broadcast to your followers instantly</div>
        <button onClick={() => showToast('Opening stream setup...')} style={{ background:'white', color:'#ef4444', border:'none', borderRadius:'20px', padding:'12px 32px', fontWeight:800, fontSize:'15px', cursor:'pointer' }}>
          🎥 Start New Stream
        </button>
      </div>

      {/* Stream Controls */}
      <div style={{ padding:'0 16px', marginBottom:'16px' }}>
        <div style={{ fontSize:'12px', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'10px' }}>Stream Setup</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'10px' }}>
          {/* Camera Access */}
          <button onClick={() => { setCameraOn(!cameraOn); showToast(cameraOn ? 'Camera off' : 'Camera on'); }} style={{ background: cameraOn ? 'rgba(16,185,129,0.15)' : '#1e293b', border: `1px solid ${cameraOn ? '#10b981' : '#334155'}`, borderRadius:'14px', padding:'14px', display:'flex', alignItems:'center', gap:'10px', cursor:'pointer', color: cameraOn ? '#10b981' : '#94a3b8', fontWeight:600, fontSize:'13px' }}>
            <span style={{ fontSize:'20px' }}>📷</span> Camera {cameraOn ? 'On' : 'Access'}
          </button>
          {/* Microphone Access */}
          <button onClick={() => { setMicOn(!micOn); showToast(micOn ? 'Mic off' : 'Mic on'); }} style={{ background: micOn ? 'rgba(99,102,241,0.15)' : '#1e293b', border: `1px solid ${micOn ? '#6366f1' : '#334155'}`, borderRadius:'14px', padding:'14px', display:'flex', alignItems:'center', gap:'10px', cursor:'pointer', color: micOn ? '#6366f1' : '#94a3b8', fontWeight:600, fontSize:'13px' }}>
            <span style={{ fontSize:'20px' }}>🎤</span> Mic {micOn ? 'On' : 'Access'}
          </button>
          {/* Preview Stream */}
          <button onClick={() => showToast('Loading stream preview...')} style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:'14px', padding:'14px', display:'flex', alignItems:'center', gap:'10px', cursor:'pointer', color:'#94a3b8', fontWeight:600, fontSize:'13px' }}>
            <span style={{ fontSize:'20px' }}>👁️</span> Preview Stream
          </button>
          {/* Quality */}
          <button onClick={() => showToast('Quality settings: 1080p, 720p, 480p')} style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:'14px', padding:'14px', display:'flex', alignItems:'center', gap:'10px', cursor:'pointer', color:'#94a3b8', fontWeight:600, fontSize:'13px' }}>
            <span style={{ fontSize:'20px' }}>⚙️</span> Quality
          </button>
        </div>

        {/* Toggle Stream On/Off */}
        <button onClick={() => { setStreaming(!streaming); showToast(streaming ? '⏹️ Stream stopped' : '🔴 Stream is LIVE!'); }} style={{ width:'100%', background: streaming ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.9)', border:`1px solid ${streaming ? '#ef4444' : 'transparent'}`, borderRadius:'14px', padding:'14px', fontSize:'15px', fontWeight:800, cursor:'pointer', color: streaming ? '#ef4444' : 'white', marginBottom:'10px' }}>
          {streaming ? '⏹️ Stop Stream' : '🔴 Toggle Stream On/Off'}
        </button>

        {/* Additional controls row */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px' }}>
          {[
            { icon:'💰', label:'Monetization', msg:'Monetization dashboard' },
            { icon:'🛡️', label:'Moderation', msg:'Moderation tools' },
            { icon:'📅', label:'Schedule', msg:'Schedule stream' },
          ].map(c => (
            <button key={c.label} onClick={() => showToast(c.msg)} style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:'12px', padding:'12px 8px', display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', cursor:'pointer', color:'#94a3b8', fontSize:'11px', fontWeight:600 }}>
              <span style={{ fontSize:'18px' }}>{c.icon}</span>{c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Analytics + Multi-Platform row */}
      <div style={{ padding:'0 16px', marginBottom:'16px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
          <button onClick={() => showToast('Stream analytics loading...')} style={{ background:'linear-gradient(135deg,#6366f1,#8b5cf6)', border:'none', borderRadius:'14px', padding:'14px', display:'flex', alignItems:'center', gap:'10px', cursor:'pointer', color:'white', fontWeight:700, fontSize:'13px' }}>
            <span style={{ fontSize:'20px' }}>📊</span> View Analytics
          </button>
          <button onClick={() => showToast('Multi-platform streaming: YouTube, Twitch, FB')} style={{ background:'linear-gradient(135deg,#10b981,#3b82f6)', border:'none', borderRadius:'14px', padding:'14px', display:'flex', alignItems:'center', gap:'10px', cursor:'pointer', color:'white', fontWeight:700, fontSize:'13px' }}>
            <span style={{ fontSize:'20px' }}>🌐</span> Multi-Platform
          </button>
        </div>
      </div>

      {/* Live Now section */}
      <div style={{ padding:'0 16px' }}>
        <div style={{ fontSize:'12px', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'10px' }}>🔴 Live Now</div>
        {LIVE_FEEDS.map(feed => (
          <div key={feed.id} onClick={() => showToast(`Joining ${feed.user}'s stream`)} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px', background:'#1e293b', borderRadius:'14px', marginBottom:'8px', cursor:'pointer' }}>
            <div style={{ width:'48px', height:'48px', borderRadius:'12px', background:'linear-gradient(135deg,#ef4444,#f59e0b)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', flexShrink:0, position:'relative' }}>
              {feed.emoji}
              <div style={{ position:'absolute', top:'-4px', right:'-4px', background:'#ef4444', borderRadius:'4px', fontSize:'8px', fontWeight:700, color:'white', padding:'1px 4px' }}>LIVE</div>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, color:'#f1f5f9', fontSize:'13px' }}>{feed.user}</div>
              <div style={{ color:'#64748b', fontSize:'11px', marginTop:'2px' }}>{feed.title}</div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ color:'#ef4444', fontSize:'12px', fontWeight:700 }}>👁️ {feed.viewers.toLocaleString()}</div>
              <div style={{ color:'#64748b', fontSize:'10px' }}>viewers</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
