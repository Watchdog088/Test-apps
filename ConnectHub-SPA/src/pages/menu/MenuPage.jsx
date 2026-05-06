// PAGE 25 — SLIDE-OUT MENU SCREEN (14 buttons per layout reference)
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';

const MENU_ITEMS = [
  { icon:'👤', label:'Profile',         path:'/profile',      color:'#6366f1' },
  { icon:'🔔', label:'Notifications',   path:'/notifications', color:'#ec4899' },
  { icon:'📹', label:'Video Calls',     path:'/videocalls',   color:'#3b82f6' },
  { icon:'🔴', label:'Live Streaming',  path:'/live',         color:'#ef4444' },
  { icon:'🎮', label:'Gaming',          path:'/gaming',       color:'#10b981' },
  { icon:'📅', label:'Events',          path:'/events',       color:'#f59e0b' },
  { icon:'🔖', label:'Saved',           path:'/saved',        color:'#8b5cf6' },
  { icon:'⚙️', label:'Settings',        path:'/settings',     color:'#64748b' },
  { icon:'🛒', label:'Marketplace',     path:'/marketplace',  color:'#ec4899' },
  { icon:'✨', label:'Premium',         path:'/premium',      color:'#f59e0b' },
  { icon:'🏢', label:'Business Tools',  path:'/business',     color:'#6366f1' },
  { icon:'💡', label:'Creator Profile', path:'/creator',      color:'#10b981' },
  { icon:'❓', label:'Help & Support',  path:'/help',         color:'#3b82f6' },
];

export default function MenuPage() {
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;

  const handleLogout = async () => {
    try { await signOut(auth); navigate('/login'); } catch(e) { console.error(e); }
  };

  return (
    <div style={{ background:'#0f172a', minHeight:'100vh', paddingBottom:'100px' }}>
      {/* Header */}
      <div style={{ padding:'16px', borderBottom:'1px solid #1e293b' }}>
        <span style={{ fontSize:'20px', fontWeight:700, color:'#f1f5f9' }}>☰ Menu</span>
      </div>

      {/* User Profile Card */}
      <div onClick={() => navigate('/profile')} style={{ margin:'16px', background:'linear-gradient(135deg,#6366f1,#ec4899)', borderRadius:'20px', padding:'20px', display:'flex', alignItems:'center', gap:'14px', cursor:'pointer' }}>
        <div style={{ width:'56px', height:'56px', borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'26px', border:'3px solid rgba(255,255,255,0.4)', flexShrink:0 }}>
          {user?.photoURL ? <img src={user.photoURL} alt="" style={{ width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover' }} /> : '😊'}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:800, color:'white', fontSize:'17px' }}>{user?.displayName || 'Your Name'}</div>
          <div style={{ color:'rgba(255,255,255,0.7)', fontSize:'13px' }}>{user?.email || 'your@email.com'}</div>
          <div style={{ marginTop:'4px' }}>
            <span style={{ background:'rgba(255,255,255,0.2)', color:'white', fontSize:'11px', fontWeight:600, borderRadius:'10px', padding:'2px 10px' }}>View Profile →</span>
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <div style={{ padding:'0 16px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'16px' }}>
          {MENU_ITEMS.map(item => (
            <div
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{ background:'#1e293b', borderRadius:'16px', padding:'16px', display:'flex', alignItems:'center', gap:'12px', cursor:'pointer', transition:'all 0.2s' }}
            >
              <div style={{ width:'40px', height:'40px', borderRadius:'12px', background:item.color + '22', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', flexShrink:0 }}>{item.icon}</div>
              <span style={{ color:'#f1f5f9', fontWeight:600, fontSize:'13px' }}>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ background:'#1e293b', borderRadius:'16px', padding:'16px', marginBottom:'16px' }}>
          <div style={{ fontSize:'12px', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'12px' }}>Quick Access</div>
          <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
            {[
              { label:'📷 AR Camera', path:'/arvr' },
              { label:'🔴 Go Live', path:'/live' },
              { label:'🎵 Music', path:'/music' },
              { label:'🎬 Media Hub', path:'/media' },
              { label:'🔍 Search', path:'/search' },
              { label:'👥 Friends', path:'/friends' },
              { label:'💕 Dating', path:'/dating' },
              { label:'👥 Groups', path:'/groups' },
            ].map(q => (
              <button key={q.path} onClick={() => navigate(q.path)} style={{ background:'#0f172a', color:'#94a3b8', border:'1px solid #334155', borderRadius:'20px', padding:'7px 14px', fontSize:'12px', fontWeight:500, cursor:'pointer' }}>
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {/* Logout */}
        <button onClick={handleLogout} style={{ width:'100%', background:'rgba(239,68,68,0.1)', color:'#ef4444', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'16px', padding:'14px', fontSize:'15px', fontWeight:700, cursor:'pointer' }}>
          🚪 Logout
        </button>
      </div>
    </div>
  );
}
