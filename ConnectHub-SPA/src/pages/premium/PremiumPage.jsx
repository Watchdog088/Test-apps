// PAGE 20 — PREMIUM PROFILE SCREEN (34 buttons per layout reference)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '@store/useAppStore';

const PREMIUM_FEATURES = [
  { icon:'☁️', label:'Cloud Backup', desc:'Unlimited cloud storage for all media' },
  { icon:'🚫', label:'Ad-Free', desc:'Zero ads, ever. Pure experience.' },
  { icon:'🎖️', label:'Verified Badge', desc:'Blue tick on your profile' },
  { icon:'🎨', label:'Custom Themes', desc:'Exclusive colors & dark modes' },
  { icon:'📊', label:'Advanced Analytics', desc:'Full insights & audience data' },
  { icon:'⬇️', label:'Offline Mode', desc:'Download content for offline viewing' },
  { icon:'🔒', label:'Enhanced Privacy', desc:'Full incognito browsing mode' },
  { icon:'⚡', label:'Priority Support', desc:'24/7 VIP support team access' },
];

const PRIVACY_ITEMS = [
  { icon:'👁️', label:'Profile Views', desc:'See everyone who viewed you' },
  { icon:'💾', label:'Data Control', desc:'Export & manage your data' },
  { icon:'📍', label:'Location Privacy', desc:'Hide your location from others' },
  { icon:'🚫', label:'Blocking Tools', desc:'Advanced blocking & filtering' },
  { icon:'🕵️', label:'Incognito Mode', desc:'Browse without leaving a trace' },
];

export default function PremiumPage() {
  const navigate = useNavigate();
  const showToast = useAppStore((s) => s.showToast);
  const [incognito, setIncognito] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('purple');
  const [activeTab, setActiveTab] = useState('Features');

  const THEMES = [
    { id:'purple', color:'#6366f1', label:'Indigo' },
    { id:'pink', color:'#ec4899', label:'Rose' },
    { id:'blue', color:'#3b82f6', label:'Ocean' },
    { id:'green', color:'#10b981', label:'Emerald' },
    { id:'orange', color:'#f59e0b', label:'Amber' },
    { id:'red', color:'#ef4444', label:'Crimson' },
  ];

  return (
    <div style={{ background:'#0f172a', minHeight:'100vh', paddingBottom:'100px' }}>
      {/* Header */}
      <div style={{ padding:'16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize:'20px', fontWeight:700, color:'#f1f5f9' }}>✨ Premium</span>
        <button onClick={() => showToast('Profile shared!')} style={{ background:'none', border:'none', fontSize:'20px', cursor:'pointer' }}>📤</button>
      </div>

      {/* Hero Upgrade Banner */}
      <div style={{ margin:'16px', background:'linear-gradient(135deg,#f59e0b,#ec4899,#6366f1)', borderRadius:'24px', padding:'28px 20px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ fontSize:'48px', marginBottom:'8px' }}>✨</div>
        <div style={{ fontWeight:900, color:'white', fontSize:'24px' }}>LynkApp Pro</div>
        <div style={{ color:'rgba(255,255,255,0.85)', fontSize:'14px', marginTop:'4px' }}>Unlock 15+ exclusive features</div>
        <div style={{ marginTop:'20px', display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
          <button onClick={() => showToast('Opening upgrade...')} style={{ background:'white', color:'#6366f1', border:'none', borderRadius:'20px', padding:'12px 28px', fontWeight:800, fontSize:'15px', cursor:'pointer' }}>
            ⬆️ Upgrade Now
          </button>
          <button onClick={() => showToast('Sharing profile...')} style={{ background:'rgba(255,255,255,0.2)', color:'white', border:'1px solid rgba(255,255,255,0.4)', borderRadius:'20px', padding:'12px 20px', fontWeight:600, fontSize:'14px', cursor:'pointer' }}>
            📤 Share
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', borderBottom:'1px solid #1e293b', margin:'0 0 4px' }}>
        {['Features','Privacy','Themes','Badges'].map(t => (
          <div key={t} style={{ flex:1, padding:'12px', textAlign:'center', fontSize:'13px', fontWeight:activeTab===t?700:500, color:activeTab===t?'#f59e0b':'#64748b', borderBottom:activeTab===t?'2px solid #f59e0b':'2px solid transparent', cursor:'pointer' }} onClick={() => setActiveTab(t)}>{t}</div>
        ))}
      </div>

      <div style={{ padding:'16px' }}>
        {/* Features Tab */}
        {activeTab === 'Features' && (
          <>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'16px' }}>
              {PREMIUM_FEATURES.map(f => (
                <div key={f.label} onClick={() => showToast(`${f.label} — Premium feature`)} style={{ background:'#1e293b', borderRadius:'16px', padding:'14px', cursor:'pointer' }}>
                  <div style={{ fontSize:'24px', marginBottom:'6px' }}>{f.icon}</div>
                  <div style={{ fontWeight:700, color:'#f1f5f9', fontSize:'13px' }}>{f.label}</div>
                  <div style={{ color:'#64748b', fontSize:'11px', marginTop:'4px', lineHeight:'1.3' }}>{f.desc}</div>
                </div>
              ))}
            </div>
            <button onClick={() => showToast('Viewing all 15 features...')} style={{ width:'100%', background:'#1e293b', color:'#f59e0b', border:'1px solid #f59e0b33', borderRadius:'14px', padding:'13px', fontSize:'14px', fontWeight:700, cursor:'pointer' }}>
              View All 15+ Features →
            </button>

            {/* VIP Support */}
            <div style={{ marginTop:'16px', background:'#1e293b', borderRadius:'16px', padding:'16px' }}>
              <div style={{ fontWeight:700, color:'#f1f5f9', marginBottom:'12px' }}>🎧 VIP Support</div>
              <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                {[
                  { icon:'💬', label:'Live Chat', action:'Opening VIP chat...' },
                  { icon:'📞', label:'Call Us', action:'Calling VIP support...' },
                  { icon:'📧', label:'Email', action:'Opening email...' },
                  { icon:'🎫', label:'New Ticket', action:'Creating ticket...' },
                ].map(s => (
                  <button key={s.label} onClick={() => showToast(s.action)} style={{ background:'#0f172a', color:'#94a3b8', border:'1px solid #334155', borderRadius:'20px', padding:'8px 14px', fontSize:'12px', cursor:'pointer' }}>
                    {s.icon} {s.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Privacy Tab */}
        {activeTab === 'Privacy' && (
          <>
            {PRIVACY_ITEMS.map((item, i) => (
              <div key={item.label} style={{ display:'flex', alignItems:'center', gap:'14px', padding:'14px', background:'#1e293b', borderRadius:'14px', marginBottom:'8px', cursor:'pointer' }} onClick={() => showToast(`${item.label} settings`)}>
                <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:'rgba(99,102,241,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px' }}>{item.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, color:'#f1f5f9', fontSize:'14px' }}>{item.label}</div>
                  <div style={{ color:'#64748b', fontSize:'12px', marginTop:'2px' }}>{item.desc}</div>
                </div>
                {item.icon === '🕵️' ? (
                  <div onClick={e => { e.stopPropagation(); setIncognito(!incognito); }} style={{ width:'44px', height:'24px', borderRadius:'12px', background:incognito?'#6366f1':'#334155', cursor:'pointer', position:'relative', transition:'background 0.2s', flexShrink:0 }}>
                    <div style={{ position:'absolute', top:'3px', left:incognito?'22px':'3px', width:'18px', height:'18px', borderRadius:'50%', background:'white', transition:'left 0.2s' }} />
                  </div>
                ) : (
                  <span style={{ color:'#334155', fontSize:'18px' }}>›</span>
                )}
              </div>
            ))}
          </>
        )}

        {/* Themes Tab */}
        {activeTab === 'Themes' && (
          <>
            <div style={{ fontWeight:700, color:'#f1f5f9', marginBottom:'12px' }}>🎨 Profile Themes</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px', marginBottom:'16px' }}>
              {THEMES.map(t => (
                <div key={t.id} onClick={() => { setSelectedTheme(t.id); showToast(`${t.label} theme applied!`); }} style={{ background: selectedTheme===t.id ? t.color+'33' : '#1e293b', borderRadius:'14px', padding:'16px', display:'flex', flexDirection:'column', alignItems:'center', gap:'8px', cursor:'pointer', border: selectedTheme===t.id ? `2px solid ${t.color}` : '2px solid transparent' }}>
                  <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:t.color }} />
                  <div style={{ color: selectedTheme===t.id ? t.color : '#94a3b8', fontSize:'12px', fontWeight:600 }}>{t.label}</div>
                  {selectedTheme===t.id && <div style={{ fontSize:'14px' }}>✓</div>}
                </div>
              ))}
            </div>
            <div style={{ background:'#1e293b', borderRadius:'14px', padding:'14px', display:'flex', alignItems:'center', gap:'12px', cursor:'pointer' }} onClick={() => showToast('Opening badge collection...')}>
              <div style={{ fontSize:'28px' }}>🎖️</div>
              <div>
                <div style={{ fontWeight:700, color:'#f1f5f9' }}>Badge Collection</div>
                <div style={{ color:'#64748b', fontSize:'12px' }}>12 badges earned · 8 available</div>
              </div>
              <span style={{ marginLeft:'auto', color:'#334155', fontSize:'18px' }}>›</span>
            </div>
          </>
        )}

        {/* Badges Tab */}
        {activeTab === 'Badges' && (
          <>
            <div style={{ fontWeight:700, color:'#f1f5f9', marginBottom:'12px' }}>🎖️ Your Badges</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px' }}>
              {['⭐ Early Bird','🔥 Hot Creator','💎 Diamond','🏆 Top Fan','🚀 Pioneer','🎯 Sharpshooter','🌟 Influencer','🥇 Champion','🎖️ Legend','🤝 Connector','💡 Innovator','🦅 Eagle Eye'].map((b, i) => (
                <div key={b} onClick={() => showToast(`${b} badge details`)} style={{ background:'#1e293b', borderRadius:'14px', padding:'14px', textAlign:'center', cursor:'pointer', opacity: i < 8 ? 1 : 0.4 }}>
                  <div style={{ fontSize:'28px' }}>{b.split(' ')[0]}</div>
                  <div style={{ color:i < 8?'#f1f5f9':'#334155', fontSize:'11px', marginTop:'6px', fontWeight:600 }}>{b.split(' ').slice(1).join(' ')}</div>
                  {i >= 8 && <div style={{ color:'#64748b', fontSize:'10px' }}>Premium</div>}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Quick Tools (always visible) */}
        <div style={{ marginTop:'16px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
          {[
            { icon:'💬', label:'VIP Chat', action:'Opening VIP chat...' },
            { icon:'🎨', label:'Themes', action:() => setActiveTab('Themes') },
            { icon:'🎖️', label:'Badges', action:() => setActiveTab('Badges') },
            { icon:'📊', label:'Analytics', action:'Opening analytics...' },
          ].map(q => (
            <button key={q.label} onClick={() => typeof q.action === 'function' ? q.action() : showToast(q.action)} style={{ background:'#1e293b', color:'#94a3b8', border:'1px solid #334155', borderRadius:'14px', padding:'12px', fontSize:'13px', fontWeight:600, cursor:'pointer' }}>
              {q.icon} {q.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
