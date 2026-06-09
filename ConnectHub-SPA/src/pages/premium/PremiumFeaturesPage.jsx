// src/pages/premium/PremiumFeaturesPage.jsx — Premium features comparison + upgrade CTA
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PLANS = [
  {
    id:'free', name:'Free', price:'$0', period:'forever',
    color:'#64748b', badge:'Current',
    features: [
      { label:'Posts & Stories', ok:true },
      { label:'Messages (up to 10/day)', ok:true },
      { label:'Basic Dating (5 swipes/day)', ok:true },
      { label:'Join Events', ok:true },
      { label:'Marketplace (buy only)', ok:true },
      { label:'Ads shown', ok:false },
      { label:'Unlimited Swipes', ok:false },
      { label:'See who liked you', ok:false },
      { label:'Live Streaming', ok:false },
      { label:'Verified Badge', ok:false },
      { label:'Premium AI features', ok:false },
    ]
  },
  {
    id:'plus', name:'LynkApp Plus', price:'$7.99', period:'/month',
    color:'#6366f1', badge:'Most Popular',
    highlight: true,
    features: [
      { label:'Everything in Free', ok:true },
      { label:'Ad-free experience', ok:true },
      { label:'Unlimited Messages', ok:true },
      { label:'Unlimited Swipes', ok:true },
      { label:'See who liked you', ok:true },
      { label:'Live Streaming', ok:true },
      { label:'5 Super Likes/day', ok:true },
      { label:'Profile Boost (1/week)', ok:true },
      { label:'Verified Badge', ok:false },
      { label:'Priority Support', ok:false },
      { label:'Premium AI features', ok:false },
    ]
  },
  {
    id:'gold', name:'LynkApp Gold', price:'$19.99', period:'/month',
    color:'#f59e0b', badge:'Best Value',
    features: [
      { label:'Everything in Plus', ok:true },
      { label:'Verified Badge ✓', ok:true },
      { label:'Priority Support', ok:true },
      { label:'Premium AI features', ok:true },
      { label:'Unlimited Super Likes', ok:true },
      { label:'Daily Profile Boost', ok:true },
      { label:'Exclusive Gold Events', ok:true },
      { label:'Advanced Analytics', ok:true },
      { label:'Creator Monetization', ok:true },
      { label:'Early Feature Access', ok:true },
      { label:'1-on-1 Onboarding Call', ok:true },
    ]
  },
];

const S = {
  page: { minHeight:'100dvh', background:'#0a0a18', paddingBottom:80 },
  header: { background:'rgba(255,255,255,0.03)', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'16px 20px', display:'flex', alignItems:'center', gap:12 },
  back: { background:'none', border:'none', color:'#94a3b8', fontSize:20, cursor:'pointer', padding:4 },
  title: { color:'#f1f5f9', fontSize:18, fontWeight:800, flex:1 },
  hero: { textAlign:'center', padding:'32px 20px 24px' },
  heroTitle: { fontSize:28, fontWeight:900, color:'#f1f5f9', marginBottom:8 },
  heroGrad: { background:'linear-gradient(135deg,#6366f1,#f59e0b)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' },
  heroSub: { color:'#64748b', fontSize:14 },
  grid: { display:'flex', gap:12, overflowX:'auto', padding:'0 20px', scrollSnapType:'x mandatory' },
  card: { minWidth:240, maxWidth:280, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, padding:'20px 16px', scrollSnapAlign:'start', flexShrink:0 },
  cardHighlight: { border:'2px solid #6366f1', background:'rgba(99,102,241,0.08)' },
  planBadge: { fontSize:10, fontWeight:800, letterSpacing:1, padding:'3px 8px', borderRadius:8, marginBottom:12, display:'inline-block' },
  planName: { color:'#f1f5f9', fontSize:18, fontWeight:800, marginBottom:4 },
  price: { fontSize:28, fontWeight:900, marginBottom:2 },
  period: { color:'#64748b', fontSize:12, marginBottom:16 },
  fList: { listStyle:'none', padding:0, margin:'0 0 16px' },
  fItem: { display:'flex', alignItems:'center', gap:8, marginBottom:6, fontSize:13, color:'#94a3b8' },
  fOk: { color:'#10b981' },
  fNo: { color:'rgba(255,255,255,0.2)' },
  fNoText: { color:'rgba(255,255,255,0.25)', textDecoration:'line-through' },
  btn: { width:'100%', border:'none', borderRadius:12, padding:'12px', fontWeight:700, fontSize:14, cursor:'pointer' },
  note: { color:'#64748b', fontSize:12, textAlign:'center', padding:'20px', lineHeight:1.6 },
};

export default function PremiumFeaturesPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState('plus');

  const handleUpgrade = plan => {
    if (plan.id === 'free') return;
    navigate('/premium', { state: { selectedPlan: plan.id } });
  };

  return (
    <div style={S.page}>
      <div style={S.header}>
        <button style={S.back} onClick={() => navigate(-1)}>←</button>
        <div style={S.title}>Premium Plans</div>
      </div>
      <div style={S.hero}>
        <div style={S.heroTitle}>Unlock <span style={S.heroGrad}>LynkApp</span> Premium</div>
        <div style={S.heroSub}>More connections. More features. More you. 🚀</div>
      </div>
      <div style={S.grid}>
        {PLANS.map(plan => (
          <div key={plan.id} style={{ ...S.card, ...(plan.highlight ? S.cardHighlight : {}) }}>
            <div style={{ ...S.planBadge, background: plan.highlight ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.06)', color: plan.color }}>
              {plan.badge}
            </div>
            <div style={S.planName}>{plan.name}</div>
            <div style={{ ...S.price, color: plan.color }}>{plan.price}</div>
            <div style={S.period}>{plan.period}</div>
            <ul style={S.fList}>
              {plan.features.map((f, i) => (
                <li key={i} style={S.fItem}>
                  <span style={f.ok ? S.fOk : S.fNo}>{f.ok ? '✓' : '✗'}</span>
                  <span style={f.ok ? {} : S.fNoText}>{f.label}</span>
                </li>
              ))}
            </ul>
            <button
              style={{ ...S.btn, background: plan.id === 'free' ? 'rgba(255,255,255,0.06)' : `linear-gradient(135deg,${plan.color},${plan.id === 'gold' ? '#ec4899' : '#a855f7'})`, color: plan.id === 'free' ? '#64748b' : 'white' }}
              onClick={() => handleUpgrade(plan)}
              disabled={plan.id === 'free'}
            >
              {plan.id === 'free' ? 'Current Plan' : `Upgrade to ${plan.name}`}
            </button>
          </div>
        ))}
      </div>
      <div style={S.note}>
        Cancel anytime. No hidden fees. Subscriptions auto-renew monthly.<br />
        Beta testers get 30 days of Plus free! 🎁
      </div>
    </div>
  );
}
