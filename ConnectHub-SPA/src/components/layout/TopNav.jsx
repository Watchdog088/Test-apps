// src/components/layout/TopNav.jsx
// Avatar click → dropdown: Profile | Notifications | Settings | Help | Sign Out

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAppStore from '@store/useAppStore';

const TITLES = {
  '/feed':'ConnectHub','/stories':'Stories','/live':'Live','/trending':'Trending',
  '/groups':'Groups','/messages':'Messages','/notifications':'Notifications',
  '/profile':'Profile','/friends':'Friends','/dating':'Dating',
  '/events':'Events','/gaming':'Gaming','/marketplace':'Marketplace',
  '/media':'Media Hub','/music':'Music','/videocalls':'Video Calls',
  '/livestream':'Live Stream','/arvr':'AR / VR','/saved':'Saved',
  '/search':'Search','/settings':'Settings','/business':'Business Tools',
  '/creator':'Creator','/help':'Help & Support','/menu':'Menu','/premium':'Premium',
};

const iconBtn = {
  display:'flex', alignItems:'center', justifyContent:'center',
  padding:'6px', borderRadius:'10px',
  background:'rgba(255,255,255,0.06)', border:'1px solid transparent',
  cursor:'pointer', lineHeight:1, fontSize:'19px',
  transition:'background 0.18s, transform 0.15s', flexShrink:0,
};

const DROPDOWN_ITEMS = [
  { icon:'👤', label:'My Profile',    path:'/profile'       },
  { icon:'🔔', label:'Notifications', path:'/notifications' },
  { icon:'⭐', label:'Premium',       path:'/premium'       },
  { icon:'⚙️', label:'Settings',      path:'/settings'      },
  { icon:'❓', label:'Help & Support',path:'/help'          },
  { icon:'🚪', label:'Sign Out',      path:null, signOut:true },
];

export default function TopNav() {
  const { pathname }            = useLocation();
  const navigate                = useNavigate();
  const unreadNotifications     = useAppStore((s) => s.unreadNotifications);
  const user                    = useAppStore((s) => s.user);
  const setUser                 = useAppStore((s) => s.setUser);
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef                 = useRef(null);

  const base  = '/' + pathname.split('/')[1];
  const title = TITLES[base] || 'ConnectHub';

  const displayName = user?.displayName || user?.email || 'You';
  const photoURL    = user?.photoURL || null;
  const initials    = displayName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleDropItem = (item) => {
    setDropOpen(false);
    if (item.signOut) {
      // Firebase sign-out if available
      try { import('firebase/auth').then(m => m.getAuth && m.signOut(m.getAuth())); } catch(_) {}
      setUser(null);
      navigate('/login');
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <header style={{
      height:'var(--top-nav-h)', display:'flex', alignItems:'center',
      justifyContent:'space-between', padding:'0 12px',
      background:'rgba(15,12,41,0.95)', backdropFilter:'blur(20px)',
      WebkitBackdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.1)',
      flexShrink:0, zIndex:100, position:'relative',
    }}>

      {/* ── Left: title ── */}
      <span onClick={() => navigate('/feed')} style={{
        fontWeight:700, fontSize:'18px', cursor:'pointer',
        background:'linear-gradient(135deg,#6366f1,#ec4899)',
        WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
        backgroundClip:'text', flexShrink:0,
      }}>
        {title}
      </span>

      {/* ── Right icons ── */}
      <div style={{ display:'flex', gap:'5px', alignItems:'center' }}>

        {/* 1 ── Profile Avatar (with dropdown) */}
        <div ref={dropRef} style={{ position:'relative' }}>
          <button
            onClick={() => setDropOpen(o => !o)}
            aria-label="Account menu"
            style={{
              ...iconBtn, padding:0, width:'34px', height:'34px',
              borderRadius:'50%', overflow:'hidden',
              border: dropOpen ? '2px solid #6366f1' : '2px solid rgba(99,102,241,0.55)',
              background: photoURL ? 'transparent' : 'linear-gradient(135deg,#6366f1,#ec4899)',
              flexShrink:0,
            }}
          >
            {photoURL ? (
              <img src={photoURL} alt={displayName} style={{ width:'100%', height:'100%', objectFit:'cover' }} referrerPolicy="no-referrer" />
            ) : (
              <span style={{ fontSize:'12px', fontWeight:800, color:'white', lineHeight:1, letterSpacing:'-0.5px' }}>
                {initials || '😊'}
              </span>
            )}
          </button>

          {/* ── Dropdown ── */}
          {dropOpen && (
            <div style={{
              position:'absolute', top:'calc(100% + 8px)', right:0,
              background:'rgba(15,12,41,0.97)', border:'1px solid rgba(99,102,241,0.3)',
              borderRadius:16, padding:'6px', minWidth:200,
              boxShadow:'0 16px 48px rgba(0,0,0,0.7)', zIndex:500,
              backdropFilter:'blur(20px)',
            }}>
              {/* User info header */}
              <div style={{ padding:'10px 12px 8px', borderBottom:'1px solid rgba(255,255,255,0.08)', marginBottom:4 }}>
                <div style={{ fontWeight:700, color:'#f1f5f9', fontSize:14 }}>{displayName}</div>
                {user?.email && <div style={{ color:'#64748b', fontSize:11, marginTop:2 }}>{user.email}</div>}
              </div>

              {DROPDOWN_ITEMS.map(item => (
                <button
                  key={item.label}
                  onClick={() => handleDropItem(item)}
                  style={{
                    display:'flex', alignItems:'center', gap:10, width:'100%',
                    padding:'9px 12px', borderRadius:10, border:'none',
                    background:'none', color: item.signOut ? '#ef4444' : '#cbd5e1',
                    fontSize:13, fontWeight:600, cursor:'pointer', textAlign:'left',
                    transition:'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.12)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <span style={{ fontSize:16 }}>{item.icon}</span>
                  {item.label}
                  {item.path === '/notifications' && unreadNotifications > 0 && (
                    <span style={{ marginLeft:'auto', background:'#ef4444', color:'white', borderRadius:10, fontSize:10, fontWeight:800, padding:'1px 6px' }}>
                      {unreadNotifications}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2 ── Create Post */}
        <button onClick={() => navigate('/feed')} aria-label="Create post" style={{ ...iconBtn, background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.28)' }}>
          ✏️
        </button>

        {/* 3 ── Search */}
        <button onClick={() => navigate('/search')} aria-label="Search" style={iconBtn}>🔍</button>

        {/* 4 ── Notifications with badge */}
        <div style={{ position:'relative' }}>
          <button onClick={() => navigate('/notifications')} aria-label="Notifications" style={iconBtn}>🔔</button>
          {unreadNotifications > 0 && (
            <span style={{
              position:'absolute', top:0, right:2,
              background:'#ef4444', color:'white', borderRadius:'50%',
              fontSize:'9px', fontWeight:800, width:'15px', height:'15px',
              display:'flex', alignItems:'center', justifyContent:'center',
              pointerEvents:'none', border:'1.5px solid rgba(15,12,41,0.8)',
            }}>
              {unreadNotifications > 9 ? '9+' : unreadNotifications}
            </span>
          )}
        </div>

        {/* 5 ── Hamburger → Full Menu */}
        <button onClick={() => navigate('/menu')} aria-label="Menu" style={{ ...iconBtn, background:'rgba(99,102,241,0.18)', border:'1px solid rgba(99,102,241,0.38)', fontWeight:700 }}>
          ☰
        </button>
      </div>
    </header>
  );
}
