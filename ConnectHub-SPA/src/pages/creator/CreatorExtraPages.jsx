// src/pages/creator/CreatorExtraPages.jsx
// NEW — /creator/earnings  &  /creator/content
// Creator Earnings dashboard + Content Management dashboard

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const S = {
  page:  { minHeight:'100dvh', background:'#0a0a18', color:'#f1f5f9', fontFamily:'system-ui,sans-serif', paddingBottom:80 },
  hdr:   { display:'flex', alignItems:'center', gap:12, padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,0.07)', position:'sticky', top:0, background:'rgba(10,10,24,0.97)', backdropFilter:'blur(20px)', zIndex:10 },
  back:  { background:'rgba(255,255,255,0.08)', border:'none', borderRadius:10, padding:'8px 14px', color:'#f1f5f9', fontSize:18, cursor:'pointer' },
  title: { fontSize:17, fontWeight:700, color:'#f1f5f9' },
  card:  { background:'rgba(255,255,255,0.04)', borderRadius:16, padding:14, border:'1px solid rgba(255,255,255,0.07)' },
  btn:   { background:'linear-gradient(135deg,#6366f1,#ec4899)', border:'none', borderRadius:12, padding:'10px 18px', color:'#fff', fontWeight:700, cursor:'pointer', fontSize:13 },
  btnO:  { background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.14)', borderRadius:12, padding:'9px 16px', color:'#f1f5f9', fontWeight:600, cursor:'pointer', fontSize:13 },
  btnR:  { background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:12, padding:'9px 16px', color:'#ef4444', fontWeight:600, cursor:'pointer', fontSize:13 },
  row:   { display:'flex', alignItems:'center', gap:12, padding:'13px 16px', borderBottom:'1px solid rgba(255,255,255,0.05)' },
  tab:   (a) => ({ flex:1, padding:'10px', fontSize:13, fontWeight:700, background:'none', border:'none', borderBottom:`2px solid ${a?'#6366f1':'transparent'}`, color:a?'#818cf8':'#475569', cursor:'pointer' }),
  stat:  (c) => ({ background:`rgba(${c},0.12)`, color:`rgb(${c})`, borderRadius:8, padding:'3px 9px', fontSize:11, fontWeight:700 }),
};

/* ══════════════════════════════════════════════════════
   CREATOR EARNINGS PAGE — /creator/earnings
══════════════════════════════════════════════════════ */
export function CreatorEarningsPage() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('30d');
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState('');

  const balance = { available: 284.50, pending: 62.30, lifetime: 3842.75 };

  const transactions = [
    { id:'t1', type:'Tips',         amount:'+$12.00', date:'Jun 3',  icon:'💰', color:'16,185,129' },
    { id:'t2', type:'Live Gifts',   amount:'+$38.50', date:'Jun 2',  icon:'🎁', color:'99,102,241' },
    { id:'t3', type:'Premium Sub',  amount:'+$9.99',  date:'Jun 1',  icon:'⭐', color:'245,158,11' },
    { id:'t4', type:'Withdrawal',   amount:'-$100.00',date:'May 31', icon:'🏦', color:'239,68,68'  },
    { id:'t5', type:'Tips',         amount:'+$5.00',  date:'May 30', icon:'💰', color:'16,185,129' },
    { id:'t6', type:'Live Gifts',   amount:'+$22.00', date:'May 29', icon:'🎁', color:'99,102,241' },
    { id:'t7', type:'Marketplace',  amount:'+$47.99', date:'May 28', icon:'🛍️', color:'236,72,153' },
    { id:'t8', type:'Subscription', amount:'+$9.99',  date:'May 27', icon:'💳', color:'245,158,11' },
  ];

  const monthly = [
    { month:'Jan', amount:210 }, { month:'Feb', amount:285 }, { month:'Mar', amount:318 },
    { month:'Apr', amount:402 }, { month:'May', amount:487 }, { month:'Jun', amount:284 },
  ];
  const maxBar = Math.max(...monthly.map(m => m.amount));

  const sources = [
    { label:'Live Gifts',    pct:38, color:'#6366f1', icon:'🎁' },
    { label:'Tips',          pct:28, color:'#10b981', icon:'💰' },
    { label:'Subscriptions', pct:20, color:'#f59e0b', icon:'⭐' },
    { label:'Marketplace',   pct:14, color:'#ec4899', icon:'🛍️' },
  ];

  return (
    <div style={S.page}>
      <div style={S.hdr}>
        <button style={S.back} onClick={() => navigate('/creator')}>←</button>
        <span style={S.title}>💸 Creator Earnings</span>
      </div>

      {/* Balance cards */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, padding:'16px 16px 0' }}>
        <div style={{ ...S.card, gridColumn:'1/-1', background:'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(236,72,153,0.15))', border:'1px solid rgba(99,102,241,0.3)', textAlign:'center' }}>
          <div style={{ fontSize:11, color:'#94a3b8', fontWeight:700, textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>Available to Withdraw</div>
          <div style={{ fontSize:42, fontWeight:900, color:'#10b981' }}>${balance.available.toFixed(2)}</div>
          <button onClick={() => setShowWithdraw(true)} style={{ ...S.btn, marginTop:12, padding:'10px 32px' }}>🏦 Withdraw Funds</button>
        </div>
        <div style={{ ...S.card, textAlign:'center', border:'1px solid rgba(245,158,11,0.2)' }}>
          <div style={{ fontSize:11, color:'#64748b', marginBottom:4 }}>Pending</div>
          <div style={{ fontSize:24, fontWeight:800, color:'#f59e0b' }}>${balance.pending.toFixed(2)}</div>
          <div style={{ fontSize:10, color:'#475569', marginTop:2 }}>clears in 3 days</div>
        </div>
        <div style={{ ...S.card, textAlign:'center', border:'1px solid rgba(99,102,241,0.2)' }}>
          <div style={{ fontSize:11, color:'#64748b', marginBottom:4 }}>Lifetime</div>
          <div style={{ fontSize:24, fontWeight:800, color:'#a5b4fc' }}>${balance.lifetime.toFixed(2)}</div>
        </div>
      </div>

      {/* Period selector */}
      <div style={{ display:'flex', gap:8, padding:'14px 16px 8px' }}>
        {[['7d','7 Days'],['30d','30 Days'],['90d','3 Months'],['1y','1 Year']].map(([v,l]) => (
          <button key={v} onClick={() => setPeriod(v)} style={{ flex:1, padding:'7px 4px', borderRadius:10, fontSize:12, fontWeight:600, cursor:'pointer', background: period===v ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.05)', border: period===v ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.1)', color: period===v ? '#a5b4fc' : '#94a3b8' }}>{l}</button>
        ))}
      </div>

      {/* Bar chart */}
      <div style={{ ...S.card, margin:'0 16px 12px' }}>
        <div style={{ fontWeight:700, fontSize:13, marginBottom:12 }}>📊 Monthly Revenue</div>
        <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:80 }}>
          {monthly.map(m => (
            <div key={m.month} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
              <div style={{ width:'100%', height: `${(m.amount/maxBar)*68}px`, background:'linear-gradient(to top,#6366f1,#ec4899)', borderRadius:'4px 4px 0 0', minHeight:4 }} />
              <div style={{ fontSize:9, color:'#64748b' }}>{m.month}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue sources */}
      <div style={{ ...S.card, margin:'0 16px 12px' }}>
        <div style={{ fontWeight:700, fontSize:13, marginBottom:12 }}>💡 Revenue Sources</div>
        {sources.map(s => (
          <div key={s.label} style={{ marginBottom:10 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
              <span style={{ fontSize:13 }}>{s.icon} {s.label}</span>
              <span style={{ fontWeight:700, fontSize:13 }}>{s.pct}%</span>
            </div>
            <div style={{ height:6, background:'rgba(255,255,255,0.07)', borderRadius:3, overflow:'hidden' }}>
              <div style={{ width:`${s.pct}%`, height:'100%', background:s.color, borderRadius:3 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Transactions */}
      <div style={{ padding:'4px 16px 8px', fontSize:12, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:1 }}>Recent Transactions</div>
      {transactions.map(t => (
        <div key={t.id} style={S.row}>
          <div style={{ width:38, height:38, borderRadius:12, background:`rgba(${t.color},0.15)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>{t.icon}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:600, fontSize:14 }}>{t.type}</div>
            <div style={{ fontSize:12, color:'#64748b' }}>{t.date}</div>
          </div>
          <div style={{ fontWeight:800, fontSize:15, color: t.amount.startsWith('+') ? '#10b981' : '#ef4444' }}>{t.amount}</div>
        </div>
      ))}

      {/* Withdraw modal */}
      {showWithdraw && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:9999, display:'flex', alignItems:'flex-end', justifyContent:'center' }} onClick={() => setShowWithdraw(false)}>
          <div style={{ background:'rgba(10,8,30,0.99)', borderRadius:'24px 24px 0 0', padding:'24px 20px 40px', width:'100%', maxWidth:480 }} onClick={e => e.stopPropagation()}>
            <div style={{ width:40, height:4, borderRadius:2, background:'rgba(255,255,255,0.18)', margin:'0 auto 20px' }} />
            <h3 style={{ color:'#f1f5f9', fontWeight:800, fontSize:18, margin:'0 0 4px' }}>🏦 Withdraw Funds</h3>
            <p style={{ color:'#64748b', fontSize:13, margin:'0 0 20px' }}>Available: <strong style={{ color:'#10b981' }}>${balance.available.toFixed(2)}</strong></p>
            <div style={{ marginBottom:12 }}>
              <label style={{ fontSize:11, color:'#64748b', fontWeight:700, display:'block', marginBottom:6 }}>AMOUNT (USD)</label>
              <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" type="number" style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:12, padding:'12px 14px', color:'#f1f5f9', fontSize:18, fontWeight:700, width:'100%', boxSizing:'border-box', outline:'none' }} />
            </div>
            <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
              {[25,50,100,284.50].map(v => <button key={v} onClick={() => setAmount(String(v))} style={{ ...S.btnO, padding:'6px 14px', fontSize:12 }}>${v}</button>)}
            </div>
            <div style={{ marginBottom:16, fontSize:12, color:'#64748b' }}>💳 PayPal · Bank Transfer · Stripe · Available in 2-3 business days</div>
            <button onClick={() => setShowWithdraw(false)} style={{ ...S.btn, width:'100%', padding:13, fontSize:15 }}>💸 Request Withdrawal</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   CREATOR CONTENT PAGE — /creator/content
══════════════════════════════════════════════════════ */
export function CreatorContentPage() {
  const navigate = useNavigate();
  const [tab, setTab]     = useState('posts');
  const [selected, setSel]= useState(null);

  const content = {
    posts: [
      { id:'p1', title:'My dev setup 2026 🖥️',      type:'Post',  views:'12.4K', likes:847, date:'Jun 2', status:'published' },
      { id:'p2', title:'React 20 first look',          type:'Post',  views:'8.1K',  likes:534, date:'Jun 1', status:'published' },
      { id:'p3', title:'Behind the scenes vlog',       type:'Video', views:'21.8K', likes:1203,date:'May 31',status:'published' },
      { id:'p4', title:'Upcoming product launch draft', type:'Post', views:'—',     likes:0,   date:'—',    status:'draft'     },
    ],
    videos: [
      { id:'v1', title:'How I built LynkApp in 30 days',type:'Video',views:'45.2K',likes:2100,date:'May 28',status:'published' },
      { id:'v2', title:'Code review live session',       type:'Video',views:'9.7K', likes:412, date:'May 25',status:'published' },
    ],
    stories: [
      { id:'s1', title:'Office day', type:'Story', views:'3.2K', likes:180, date:'Jun 3', status:'expired'   },
      { id:'s2', title:'Product sneak peek', type:'Story', views:'5.6K', likes:290, date:'Jun 2', status:'expired' },
    ],
  };

  const STATUS_COLOR = { published:'#10b981', draft:'#f59e0b', expired:'#64748b', scheduled:'#6366f1' };

  const current = content[tab] || [];

  return (
    <div style={S.page}>
      <div style={S.hdr}>
        <button style={S.back} onClick={() => navigate('/creator')}>←</button>
        <span style={S.title}>🎬 Content Manager</span>
        <button onClick={() => navigate('/feed/create')} style={{ ...S.btn, marginLeft:'auto', padding:'8px 14px', fontSize:12 }}>+ Create</button>
      </div>

      {/* Stats strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, padding:'12px 16px 8px' }}>
        {[['📝','Posts',4],['🎬','Videos',2],['📖','Stories',2],['🌐','Total Reach','82K']].map(([icon,l,v]) => (
          <div key={l} style={{ ...S.card, textAlign:'center', padding:'10px 6px' }}>
            <div style={{ fontSize:18, marginBottom:2 }}>{icon}</div>
            <div style={{ fontSize:16, fontWeight:900, color:'#f1f5f9' }}>{v}</div>
            <div style={{ fontSize:9, color:'#64748b' }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
        {[['posts','📝 Posts'],['videos','🎬 Videos'],['stories','📖 Stories']].map(([t,l]) => (
          <button key={t} onClick={() => setTab(t)} style={S.tab(tab===t)}>{l}</button>
        ))}
      </div>

      {/* Content list */}
      <div>
        {current.map(item => (
          <div key={item.id}>
            <div onClick={() => setSel(selected===item.id ? null : item.id)} style={{ ...S.row, cursor:'pointer', background: selected===item.id ? 'rgba(99,102,241,0.06)' : 'transparent' }}>
              <div style={{ width:44, height:44, borderRadius:10, background:'rgba(99,102,241,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>
                {item.type==='Video' ? '🎬' : item.type==='Story' ? '📖' : '📝'}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:700, fontSize:13, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.title}</div>
                <div style={{ fontSize:11, color:'#64748b' }}>{item.date} · 👁️ {item.views} · ❤️ {item.likes.toLocaleString()}</div>
              </div>
              <span style={{ fontSize:11, fontWeight:700, color: STATUS_COLOR[item.status] || '#64748b', flexShrink:0 }}>{item.status}</span>
            </div>

            {/* Expanded actions */}
            {selected === item.id && (
              <div style={{ padding:'10px 16px 14px', background:'rgba(99,102,241,0.04)', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  <button style={{ ...S.btnO, padding:'6px 12px', fontSize:12 }}>✏️ Edit</button>
                  <button style={{ ...S.btnO, padding:'6px 12px', fontSize:12 }}>📊 Insights</button>
                  <button style={{ ...S.btnO, padding:'6px 12px', fontSize:12 }}>📤 Share</button>
                  {item.status === 'draft' && <button style={{ ...S.btn, padding:'6px 12px', fontSize:12 }}>🚀 Publish</button>}
                  <button style={{ ...S.btnR, padding:'6px 12px', fontSize:12 }}>🗑️ Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
        {current.length === 0 && (
          <div style={{ textAlign:'center', padding:'48px 20px', color:'#475569' }}>
            <div style={{ fontSize:40, marginBottom:12 }}>✨</div>
            <div style={{ fontWeight:700, marginBottom:6 }}>No {tab} yet</div>
            <button onClick={() => navigate('/feed/create')} style={{ ...S.btn, marginTop:8 }}>Create your first {tab.slice(0,-1)}</button>
          </div>
        )}
      </div>
    </div>
  );
}
