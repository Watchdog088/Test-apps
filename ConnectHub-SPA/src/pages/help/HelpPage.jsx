import React, { useState } from 'react';
const FAQS = [
  { q:'How do I reset my password?', a:'Go to Settings → Password & Security → Change Password. Enter your current password and new password.' },
  { q:'How do I go Live?', a:'Tap the Live tab → "Go Live" button. Set your title and privacy, then start streaming instantly.' },
  { q:'How does the Dating feature work?', a:'Browse profiles in Dating → Discover. Swipe right to like, left to pass. Matches can message each other.' },
  { q:'How do I earn as a Creator?', a:'Join Creator Studio, post quality content, and earn through tips, subscriptions, and brand deals.' },
  { q:'How do I report a user?', a:'Visit their profile → tap the three dots menu → Report. Our team reviews within 24 hours.' },
];
export default function HelpPage() {
  const [expanded, setExpanded] = useState(null);
  const [tab, setTab] = useState('FAQ');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  return (
    <div style={{ background:'#0f172a', minHeight:'100vh', paddingBottom:'80px' }}>
      <div style={{ padding:'16px', borderBottom:'1px solid #1e293b' }}>
        <span style={{ fontSize:'20px', fontWeight:700, color:'#f1f5f9' }}>❓ Help & Support</span>
      </div>
      <div style={{ display:'flex', borderBottom:'1px solid #1e293b' }}>
        {['FAQ','Contact','Report'].map(t => (
          <div key={t} style={{ flex:1, padding:'12px', textAlign:'center', fontSize:'14px', fontWeight:tab===t?700:500, color:tab===t?'#6366f1':'#64748b', borderBottom:tab===t?'2px solid #6366f1':'2px solid transparent', cursor:'pointer' }} onClick={() => setTab(t)}>{t}</div>
        ))}
      </div>
      <div style={{ padding:'16px' }}>
        {tab === 'FAQ' && (
          <>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', background:'#1e293b', borderRadius:'12px', padding:'10px 14px', marginBottom:'16px' }}>
              <span>🔍</span>
              <input placeholder="Search help articles..." style={{ flex:1, background:'none', border:'none', outline:'none', color:'#f1f5f9', fontSize:'14px' }} />
            </div>
            {FAQS.map((f, i) => (
              <div key={i} style={{ background:'#1e293b', borderRadius:'14px', marginBottom:'8px', overflow:'hidden' }}>
                <div style={{ padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer' }} onClick={() => setExpanded(expanded===i?null:i)}>
                  <span style={{ color:'#f1f5f9', fontWeight:600, fontSize:'14px', flex:1 }}>{f.q}</span>
                  <span style={{ color:'#6366f1', fontSize:'18px', transition:'transform 0.2s', transform: expanded===i?'rotate(180deg)':'none' }}>⌄</span>
                </div>
                {expanded===i && <div style={{ padding:'0 16px 14px', color:'#94a3b8', fontSize:'13px', lineHeight:'1.5' }}>{f.a}</div>}
              </div>
            ))}
          </>
        )}
        {tab === 'Contact' && (
          <div>
            <div style={{ background:'linear-gradient(135deg,#6366f1,#ec4899)', borderRadius:'20px', padding:'24px', textAlign:'center', marginBottom:'20px' }}>
              <div style={{ fontSize:'40px' }}>💬</div>
              <div style={{ color:'white', fontWeight:700, fontSize:'18px', marginTop:'8px' }}>Chat with Support</div>
              <div style={{ color:'rgba(255,255,255,0.7)', fontSize:'13px', marginTop:'4px' }}>Usually responds in &lt; 5 minutes</div>
            </div>
            {sent ? (
              <div style={{ textAlign:'center', padding:'24px', background:'#1e293b', borderRadius:'16px' }}>
                <div style={{ fontSize:'40px' }}>✅</div>
                <div style={{ color:'#f1f5f9', fontWeight:700, marginTop:'8px' }}>Message Sent!</div>
                <div style={{ color:'#64748b', fontSize:'13px' }}>We'll respond within 24 hours</div>
              </div>
            ) : (
              <>
                <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Describe your issue..." style={{ width:'100%', background:'#1e293b', border:'1px solid #334155', borderRadius:'14px', padding:'14px', color:'#f1f5f9', fontSize:'14px', minHeight:'120px', resize:'none', boxSizing:'border-box', outline:'none' }} />
                <button onClick={() => { if(message.trim()) setSent(true); }} style={{ width:'100%', background:'linear-gradient(135deg,#6366f1,#ec4899)', color:'white', border:'none', borderRadius:'14px', padding:'14px', fontSize:'15px', fontWeight:700, cursor:'pointer', marginTop:'12px' }}>Send Message</button>
              </>
            )}
          </div>
        )}
        {tab === 'Report' && (
          <div>
            {['🚨 Report a Bug','🔒 Report Privacy Issue','👤 Report a User','💬 Report Content','📋 Other Issue'].map(item => (
              <div key={item} style={{ display:'flex', alignItems:'center', gap:'14px', padding:'14px 16px', background:'#1e293b', borderRadius:'14px', marginBottom:'8px', cursor:'pointer' }}>
                <div style={{ flex:1, color:'#f1f5f9', fontWeight:600 }}>{item}</div>
                <span style={{ color:'#334155' }}>›</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}