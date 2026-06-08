import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';

/**
 * ROUTE MAP — every row navigates to an existing page.
 * Routes that didn't exist were created in MissingDashboards.jsx
 * or SettingsSubPages.jsx.
 */
const SECTIONS = [
  {
    title: 'Account',
    items: [
      { icon:'👤', label:'Edit Profile',         desc:'Update your info & photos',      route:'/profile/edit' },
      { icon:'🔒', label:'Privacy',              desc:'Control who sees your content',  route:'/settings/privacy' },
      { icon:'🔑', label:'Password & Security',  desc:'Change password, 2FA',           route:'/settings/security' },
      { icon:'📧', label:'Email & Phone',         desc:'Update contact info',            route:'/settings/contact' },
    ]
  },
  {
    title: 'Preferences',
    items: [
      { icon:'🔔', label:'Notifications',        desc:'Push, email & in-app alerts',    route:'/notifications/preferences' },
      { icon:'🌙', label:'Appearance',           desc:'Dark mode, themes, font size',   route:'/settings/appearance' },
      { icon:'🌐', label:'Language & Region',    desc:'English (US)',                   route:'/settings/locale' },
      { icon:'♿', label:'Accessibility',        desc:'Screen reader, contrast',        route:'/settings/accessibility' },
    ]
  },
  {
    title: 'Content & Activity',
    items: [
      { icon:'📋', label:'Activity Status',      desc:"Show when you're online",        route:'/settings/activity' },
      { icon:'🚫', label:'Blocked Accounts',     desc:'Manage blocked accounts',        route:'/settings/blocked-users' },
      { icon:'🏷️', label:'Tags & Mentions',     desc:'Who can tag or mention you',     route:'/settings/privacy' },
      { icon:'🗑️', label:'Data & Privacy',       desc:'Download data, delete account',  route:'/settings/data-privacy' },
    ]
  },
  {
    title: 'Subscription & Payments',
    items: [
      { icon:'⭐', label:'Premium Plan',         desc:'LynkApp Pro — Upgrade now',      route:'/premium',             highlight: true },
      { icon:'💰', label:'Wallet & Earnings',    desc:'Balance, payouts, history',      route:'/wallet' },
      { icon:'💳', label:'Payment Methods',      desc:'Cards, PayPal, Apple Pay',       route:'/settings/payments' },
      { icon:'📜', label:'Purchase History',     desc:'View past transactions',         route:'/marketplace/orders' },
    ]
  },
  {
    title: 'Account Health',
    items: [
      { icon:'🛡️', label:'Account Status',      desc:'Verification, trust score',      route:'/settings/account-status' },
      { icon:'📊', label:'Creator Dashboard',    desc:'Analytics & earnings overview',  route:'/creator/analytics-overview' },
      { icon:'✅', label:'Get Verified',         desc:'Apply for verification badge',   route:'/profile/verify-request' },
    ]
  },
  {
    title: 'Support',
    items: [
      { icon:'❓', label:'Help Center',          desc:'FAQs and guides',                route:'/help' },
      { icon:'📞', label:'Contact Support',      desc:'Chat with our team',             route:'/help/ticket' },
      { icon:'⚠️', label:'Report a Problem',    desc:'Submit a bug report',            route:'/help/ticket' },
      { icon:'📄', label:'Terms & Privacy',      desc:'Legal information',              route:'/terms' },
    ]
  },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;
  const [notifications, setNotifications] = useState({ push: true, email: false, sms: true });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    try { await signOut(auth); navigate('/login'); }
    catch(e) { console.error(e); }
  };

  const handleRowClick = (route) => {
    if (route) navigate(route);
  };

  return (
    <div style={{ background:'#0f172a', minHeight:'100vh', paddingBottom:'100px' }}>
      {/* Header */}
      <div style={{ padding:'16px 20px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize:'20px', fontWeight:700, color:'#f1f5f9' }}>⚙️ Settings</span>
        <span style={{ fontSize:'12px', color:'#64748b' }}>LynkApp v1.0</span>
      </div>

      {/* Profile Card — tappable */}
      <div
        style={{ margin:'16px', background:'linear-gradient(135deg,#6366f1,#ec4899)', borderRadius:'20px', padding:'20px', display:'flex', alignItems:'center', gap:'16px', cursor:'pointer' }}
        onClick={() => navigate('/profile')}
      >
        <div style={{ width:'60px', height:'60px', borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px', border:'3px solid rgba(255,255,255,0.4)' }}>
          {user?.photoURL ? <img src={user.photoURL} alt="avatar" style={{ width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover' }} /> : '😊'}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:800, color:'white', fontSize:'18px' }}>{user?.displayName || 'Your Name'}</div>
          <div style={{ color:'rgba(255,255,255,0.7)', fontSize:'13px' }}>{user?.email || 'your@email.com'}</div>
          <div style={{ color:'rgba(255,255,255,0.9)', fontSize:'12px', marginTop:'4px', background:'rgba(255,255,255,0.2)', borderRadius:'10px', padding:'2px 10px', display:'inline-block' }}>Free Plan</div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ color:'rgba(255,255,255,0.7)', fontSize:'20px' }}>›</div>
          <div style={{ color:'rgba(255,255,255,0.6)', fontSize:'11px', marginTop:'2px' }}>View Profile</div>
        </div>
      </div>

      {/* Settings Sections */}
      {SECTIONS.map(sec => (
        <div key={sec.title} style={{ margin:'0 16px 16px' }}>
          <div style={{ fontSize:'12px', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'8px', paddingLeft:'4px' }}>
            {sec.title}
          </div>
          <div style={{ background:'#1e293b', borderRadius:'16px', overflow:'hidden' }}>
            {sec.items.map((item, idx) => (
              <div
                key={item.label}
                style={{
                  display:'flex', alignItems:'center', gap:'14px',
                  padding:'14px 16px',
                  borderBottom: idx < sec.items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  cursor:'pointer',
                  transition:'background 0.15s',
                }}
                onClick={() => handleRowClick(item.route)}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  width:'38px', height:'38px', borderRadius:'12px',
                  background: item.highlight ? 'linear-gradient(135deg,#f59e0b,#ef4444)' : '#0f172a',
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px',
                  flexShrink: 0,
                }}>
                  {item.icon}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ color: item.highlight ? '#f59e0b' : '#f1f5f9', fontWeight: item.highlight ? 700 : 600, fontSize:'14px' }}>
                    {item.label}
                  </div>
                  <div style={{ color:'#64748b', fontSize:'12px', marginTop:'2px' }}>{item.desc}</div>
                </div>
                <span style={{ color:'#475569', fontSize:'18px', flexShrink:0 }}>›</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Quick Notification Toggles */}
      <div style={{ margin:'0 16px 16px' }}>
        <div style={{ fontSize:'12px', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'8px', paddingLeft:'4px' }}>
          Quick Toggles
        </div>
        <div style={{ background:'#1e293b', borderRadius:'16px', overflow:'hidden' }}>
          {Object.entries(notifications).map(([key, val], idx) => (
            <div key={key} style={{ display:'flex', alignItems:'center', gap:'14px', padding:'14px 16px', borderBottom: idx < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <div style={{ flex:1, color:'#f1f5f9', fontSize:'14px', fontWeight:600 }}>
                {key === 'push' ? '📱 Push Notifications' : key === 'email' ? '📧 Email Alerts' : '💬 SMS Alerts'}
              </div>
              <button
                onClick={() => setNotifications(p => ({ ...p, [key]: !p[key] }))}
                style={{ width:'44px', height:'24px', borderRadius:'12px', background: val ? '#6366f1' : '#334155', border:'none', cursor:'pointer', position:'relative', transition:'background 0.2s', flexShrink:0 }}
                aria-label={`Toggle ${key}`}
              >
                <div style={{ position:'absolute', top:'3px', left: val ? '22px' : '3px', width:'18px', height:'18px', borderRadius:'50%', background:'white', transition:'left 0.2s' }} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* More Quick Actions */}
      <div style={{ margin:'0 16px 16px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
        <button
          onClick={() => navigate('/profile/insights')}
          style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:'14px', padding:'14px', cursor:'pointer', textAlign:'left' }}
        >
          <div style={{ fontSize:'22px', marginBottom:'4px' }}>📊</div>
          <div style={{ color:'#f1f5f9', fontSize:'13px', fontWeight:600 }}>My Insights</div>
          <div style={{ color:'#64748b', fontSize:'11px' }}>Profile stats</div>
        </button>
        <button
          onClick={() => navigate('/wallet')}
          style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:'14px', padding:'14px', cursor:'pointer', textAlign:'left' }}
        >
          <div style={{ fontSize:'22px', marginBottom:'4px' }}>💰</div>
          <div style={{ color:'#f1f5f9', fontSize:'13px', fontWeight:600 }}>Wallet</div>
          <div style={{ color:'#64748b', fontSize:'11px' }}>Balance & payouts</div>
        </button>
        <button
          onClick={() => navigate('/settings/blocked-users')}
          style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:'14px', padding:'14px', cursor:'pointer', textAlign:'left' }}
        >
          <div style={{ fontSize:'22px', marginBottom:'4px' }}>🚫</div>
          <div style={{ color:'#f1f5f9', fontSize:'13px', fontWeight:600 }}>Blocked</div>
          <div style={{ color:'#64748b', fontSize:'11px' }}>Manage blocks</div>
        </button>
        <button
          onClick={() => navigate('/settings/data-privacy')}
          style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:'14px', padding:'14px', cursor:'pointer', textAlign:'left' }}
        >
          <div style={{ fontSize:'22px', marginBottom:'4px' }}>🔐</div>
          <div style={{ color:'#f1f5f9', fontSize:'13px', fontWeight:600 }}>Privacy</div>
          <div style={{ color:'#64748b', fontSize:'11px' }}>Data & GDPR</div>
        </button>
      </div>

      {/* Sign Out */}
      <div style={{ margin:'0 16px 8px' }}>
        {!showLogoutConfirm ? (
          <button
            onClick={() => setShowLogoutConfirm(true)}
            style={{ width:'100%', background:'rgba(239,68,68,0.1)', color:'#ef4444', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'16px', padding:'14px', fontSize:'15px', fontWeight:700, cursor:'pointer' }}
          >
            🚪 Sign Out
          </button>
        ) : (
          <div style={{ background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.4)', borderRadius:'16px', padding:'16px', textAlign:'center' }}>
            <div style={{ color:'#f1f5f9', fontWeight:600, marginBottom:'12px' }}>Are you sure you want to sign out?</div>
            <div style={{ display:'flex', gap:'10px' }}>
              <button onClick={() => setShowLogoutConfirm(false)} style={{ flex:1, background:'#1e293b', color:'#94a3b8', border:'1px solid #334155', borderRadius:'12px', padding:'10px', cursor:'pointer', fontWeight:600 }}>Cancel</button>
              <button onClick={handleLogout} style={{ flex:1, background:'#ef4444', color:'white', border:'none', borderRadius:'12px', padding:'10px', cursor:'pointer', fontWeight:700 }}>Sign Out</button>
            </div>
          </div>
        )}
      </div>

      <div style={{ textAlign:'center', padding:'20px', color:'#334155', fontSize:'12px' }}>
        LynkApp v1.0.0 · Made with ❤️
      </div>
    </div>
  );
}
