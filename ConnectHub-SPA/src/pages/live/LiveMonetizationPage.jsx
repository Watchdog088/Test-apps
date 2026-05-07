// LIVE MONETIZATION PAGE — /live/monetization
// FIXED: LIVE-BUG-09 (monetization navigates to real dashboard)
import React from 'react';
import { useNavigate } from 'react-router-dom';

const FEATURES = [
  { icon:'🎁', title:'Gifts & Tips',     desc:'Viewers send virtual gifts that convert to real earnings',    status:'coming-soon' },
  { icon:'💎', title:'Super Chats',      desc:'Highlighted messages viewers pay to pin in the chat',          status:'coming-soon' },
  { icon:'📣', title:'Sponsorships',     desc:'Accept brand deals and display sponsor banners on your stream', status:'coming-soon' },
  { icon:'🔔', title:'Paid Subscriptions', desc:'Monthly subscriber tier with exclusive content & badges',    status:'coming-soon' },
  { icon:'💰', title:'Ad Revenue',       desc:'Earn from pre-roll and mid-roll ads shown to your viewers',    status:'coming-soon' },
  { icon:'🏪', title:'Merch Integration', desc:'Show your merch shelf during live streams',                   status:'coming-soon' },
];

export default function LiveMonetizationPage() {
  const navigate = useNavigate();
  return (
    <div style={{ background:'var(--bg-primary,#0a0a18)', minHeight:'100vh', paddingBottom:'80px' }}>
      <div style={{ padding:'16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', gap:'12px' }}>
        <button onClick={() => navigate(-1)} style={{ background:'none', border:'none', color:'#94a3b8', fontSize:'20px', cursor:'pointer' }}>←</button>
        <span style={{ fontSize:'18px', fontWeight:800, color:'#f1f5f9' }}>💰 Monetization</span>
      </div>

      <div style={{ padding:'20px 16px' }}>
        <div style={{ background:'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius:'20px', padding:'20px', marginBottom:'24px', textAlign:'center' }}>
          <div style={{ fontSize:'32px', marginBottom:'8px' }}>💰</div>
          <div style={{ color:'white', fontWeight:800, fontSize:'18px', marginBottom:'4px' }}>Start Earning from Your Streams</div>
          <div style={{ color:'rgba(255,255,255,0.8)', fontSize:'13px' }}>Monetization features are in development and coming soon.</div>
        </div>

        <div style={{ fontSize:'12px', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'12px' }}>
          Upcoming Features
        </div>

        {FEATURES.map(f => (
          <div key={f.title} style={{ background:'#1e293b', borderRadius:'14px', padding:'14px', marginBottom:'10px', display:'flex', gap:'12px', alignItems:'flex-start' }}>
            <span style={{ fontSize:'24px' }}>{f.icon}</span>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'3px' }}>
                <span style={{ color:'#f1f5f9', fontWeight:700, fontSize:'14px' }}>{f.title}</span>
                <span style={{ background:'rgba(245,158,11,0.15)', color:'#f59e0b', borderRadius:'6px', fontSize:'9px', fontWeight:700, padding:'2px 6px' }}>SOON</span>
              </div>
              <div style={{ color:'#64748b', fontSize:'12px' }}>{f.desc}</div>
            </div>
          </div>
        ))}

        <button
          onClick={() => navigate('/live/setup')}
          style={{ width:'100%', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', border:'none', borderRadius:'14px', padding:'14px', color:'white', fontWeight:700, fontSize:'15px', cursor:'pointer', marginTop:'12px' }}
        >
          ← Back to Stream Setup
        </button>
      </div>
    </div>
  );
}
