import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';

const SECTIONS = [
  {
    title: 'Account',
    items: [
      { icon:'👤', label:'Edit Profile', desc:'Update your info & photos' },
      { icon:'🔒', label:'Privacy', desc:'Control who sees your content' },
      { icon:'🔑', label:'Password & Security', desc:'Change password, 2FA' },
      { icon:'📧', label:'Email & Phone', desc:'Update contact info' },
    ]
  },
  {
    title: 'Preferences',
    items: [
      { icon:'🔔', label:'Notifications', desc:'Push, email & in-app alerts' },
      { icon:'🌙', label:'Appearance', desc:'Dark mode, themes, font size' },
      { icon:'🌐', label:'Language & Region', desc:'English (US)' },
      { icon:'♿', label:'Accessibility', desc:'Screen reader, contrast' },
    ]
  },
  {
    title: 'Content & Activity',
    items: [
      { icon:'📋', label:'Activity Status', desc:'Show when you\'re online' },
      { icon:'🚫', label:'Blocked Users', desc:'Manage blocked accounts' },
      { icon:'🏷️', label:'Tags & Mentions', desc:'Who can tag or mention you' },
      { icon:'💾', label:'Data & Storage', desc:'Clear cache, download data' },
    ]
  },
  {
    title: 'Subscription & Payments',
    items: [
      { icon:'⭐', label:'Premium Plan', desc:'LynkApp Pro — Upgrade now', highlight: true },
      { icon:'💳', label:'Payment Methods', desc:'Cards, PayPal, Apple Pay' },
      { icon:'📜', label:'Purchase History', desc:'View past transactions' },
    ]
  },
  {
    title: 'Support',
    items: [
      { icon:'❓', label:'Help Center', desc:'FAQs and guides' },
      { icon:'📞', label:'Contact Support', desc:'Chat with our team' },
      { icon:'⚠️', label:'Report a Problem', desc:'Submit a bug report' },
      { icon:'📄', label:'Terms & Privacy', desc:'Legal information' },
    ]
  },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;
  const [notifications, setNotifications] = useState({ push: true, email: false, sms: true });

  const handleLogout = async () => {
    try { await signOut(auth); navigate('/login'); } catch(e) { console.error(e); }
  };

  return (
    <div style={{ background:'#0f172a', minHeight:'100vh', paddingBottom:'100px' }}>
      <div style={{ padding:'16px', borderBottom:'1px solid #1e293b' }}>
        <span style={{ fontSize:'20px', fontWeight:700, color:'#f1f5f9' }}>Settings</span>
      </div>

      {/* Profile Card */}
      <div style={{ margin:'16px', background:'linear-gradient(135deg,#6366f1,#ec4899)', borderRadius:'20px', padding:'20px', display:'flex', alignItems:'center', gap:'16px', cursor:'pointer' }} onClick={() => navigate('/profile')}>
        <div style={{ width:'60px', height:'60px', borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px', border:'3px solid rgba(255,255,255,0.4)' }}>😊</div>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:800, color:'white', fontSize:'18px' }}>{user?.displayName || 'Your Name'}</div>
          <div style={{ color:'rgba(255,255,255,0.7)', fontSize:'13px' }}>{user?.email || 'your@email.com'}</div>
          <div style={{ color:'rgba(255,255,255,0.9)', fontSize:'12px', marginTop:'4px', background:'rgba(255,255,255,0.2)', borderRadius:'10px', padding:'2px 10px', display:'inline-block' }}>Free Plan</div>
        </div>
        <span style={{ color:'rgba(255,255,255,0.7)', fontSize:'20px' }}>›</span>
      </div>

      {/* Settings Sections */}
      {SECTIONS.map(sec => (
        <div key={sec.title} style={{ margin:'0 16px 16px' }}>
          <div style={{ fontSize:'12px', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'8px', paddingLeft:'4px' }}>{sec.title}</div>
          <div style={{ background:'#1e293b', borderRadius:'16px', overflow:'hidden' }}>
            {sec.items.map((item, idx) => (
              <div key={item.label} style={{ display:'flex', alignItems:'center', gap:'14px', padding:'14px 16px', borderBottom:idx < sec.items.length-1?'1px solid rgba(255,255,255,0.05)':'none', cursor:'pointer' }}
                onClick={() => {}}>
                <div style={{ width:'38px', height:'38px', borderRadius:'12px', background: item.highlight ? 'linear-gradient(135deg,#f59e0b,#ef4444)' : '#0f172a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px' }}>{item.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ color: item.highlight ? '#f59e0b' : '#f1f5f9', fontWeight: item.highlight ? 700 : 600, fontSize:'14px' }}>{item.label}</div>
                  <div style={{ color:'#64748b', fontSize:'12px', marginTop:'2px' }}>{item.desc}</div>
                </div>
                <span style={{ color:'#334155', fontSize:'18px' }}>›</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Notification Toggles */}
      <div style={{ margin:'0 16px 16px' }}>
        <div style={{ fontSize:'12px', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'8px', paddingLeft:'4px' }}>Quick Toggles</div>
        <div style={{ background:'#1e293b', borderRadius:'16px', overflow:'hidden' }}>
          {Object.entries(notifications).map(([key, val], idx) => (
            <div key={key} style={{ display:'flex', alignItems:'center', gap:'14px', padding:'14px 16px', borderBottom:idx < 2?'1px solid rgba(255,255,255,0.05)':'none' }}>
              <div style={{ flex:1, color:'#f1f5f9', fontSize:'14px', fontWeight:600, textTransform:'capitalize' }}>{key === 'push' ? '📱 Push Notifications' : key === 'email' ? '📧 Email Alerts' : '💬 SMS Alerts'}</div>
              <div onClick={() => setNotifications(p => ({ ...p, [key]: !p[key] }))} style={{ width:'44px', height:'24px', borderRadius:'12px', background:val?'#6366f1':'#334155', cursor:'pointer', position:'relative', transition:'background 0.2s' }}>
                <div style={{ position:'absolute', top:'3px', left:val?'22px':'3px', width:'18px', height:'18px', borderRadius:'50%', background:'white', transition:'left 0.2s' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Logout */}
      <div style={{ margin:'0 16px' }}>
        <button onClick={handleLogout} style={{ width:'100%', background:'rgba(239,68,68,0.1)', color:'#ef4444', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'16px', padding:'14px', fontSize:'15px', fontWeight:700, cursor:'pointer' }}>
          🚪 Sign Out
        </button>
      </div>
      <div style={{ textAlign:'center', padding:'20px', color:'#334155', fontSize:'12px' }}>LynkApp v1.0.0 · Made with ❤️</div>
    </div>
  );
}
