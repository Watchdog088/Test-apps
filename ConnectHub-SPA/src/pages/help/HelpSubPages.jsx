// src/pages/help/HelpSubPages.jsx — FAQ + Article viewer
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const FAQS = [
  { id:'1', cat:'Getting Started', q:'How do I create an account?', a:'Tap "Sign Up" on the login screen. Enter your name, email, and a strong password (8+ characters). You will receive a verification email — click the link to activate your account.' },
  { id:'2', cat:'Getting Started', q:'How do I complete my profile?', a:'Go to Profile → Edit Profile. Add a photo, bio, location, and interests. A complete profile gets 3x more connections. The Profile Setup wizard guides you through each step.' },
  { id:'3', cat:'Dating', q:'How does the matching algorithm work?', a:'LynkApp matches you based on your interests, location range, age preferences, and activity patterns. The more you interact (likes, super-likes, messages), the better the suggestions become.' },
  { id:'4', cat:'Dating', q:'How do I report someone on Dating?', a:'Tap the three dots (⋮) on their profile or in the chat. Select "Report." Choose a reason and add details. Our Safety team reviews all reports within 24 hours.' },
  { id:'5', cat:'Marketplace', q:'How do I sell items on the Marketplace?', a:'Go to Marketplace → tap the + button → Create Listing. Add photos, a title, description, and price. Complete KYC verification to receive payments. Listings go live immediately after review.' },
  { id:'6', cat:'Marketplace', q:'How are payments processed?', a:'Payments are processed securely through Stripe. Funds are held in escrow until the buyer confirms delivery. Payouts are released to your linked bank account within 3-5 business days.' },
  { id:'7', cat:'Privacy', q:'Who can see my profile?', a:'By default, your profile is visible to friends and connections. Go to Settings → Privacy to control who sees each part of your profile, stories, and posts.' },
  { id:'8', cat:'Privacy', q:'How do I delete my account?', a:'Go to Settings → Security → Delete Account. You will be asked to confirm. Account deletion is permanent — all data is removed within 30 days per our Privacy Policy.' },
  { id:'9', cat:'Technical', q:'Why is the app running slowly?', a:'Try: 1) Clearing cache in Settings → App → Clear Cache. 2) Checking your internet connection. 3) Closing and reopening the app. 4) Ensuring you have the latest version.' },
  { id:'10', cat:'Technical', q:'How do I reset my password?', a:'On the login screen, tap "Forgot Password." Enter your email address. You will receive a reset link within 2 minutes. The link expires after 1 hour for security.' },
];

const CATS = ['All', ...new Set(FAQS.map(f => f.cat))];

const S = {
  page: { minHeight:'100dvh', background:'#0a0a18', paddingBottom:80 },
  header: { background:'rgba(255,255,255,0.03)', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'16px 20px', display:'flex', alignItems:'center', gap:12 },
  back: { background:'none', border:'none', color:'#94a3b8', fontSize:20, cursor:'pointer', padding:4 },
  title: { color:'#f1f5f9', fontSize:18, fontWeight:800 },
  body: { maxWidth:680, margin:'0 auto', padding:'20px' },
  search: { width:'100%', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:'12px 16px', color:'#f1f5f9', fontSize:14, outline:'none', boxSizing:'border-box', marginBottom:16 },
  cats: { display:'flex', gap:8, flexWrap:'wrap', marginBottom:20 },
  cat: { padding:'6px 14px', borderRadius:20, fontSize:13, fontWeight:600, cursor:'pointer', border:'1px solid rgba(255,255,255,0.1)', background:'transparent', color:'#94a3b8' },
  catActive: { background:'rgba(99,102,241,0.2)', color:'#6366f1', border:'1px solid rgba(99,102,241,0.4)' },
  item: { background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, marginBottom:8, overflow:'hidden' },
  qrow: { padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer' },
  q: { color:'#f1f5f9', fontSize:14, fontWeight:600, flex:1, paddingRight:8 },
  catBadge: { fontSize:11, color:'#6366f1', background:'rgba(99,102,241,0.1)', borderRadius:6, padding:'2px 6px', marginRight:8, whiteSpace:'nowrap' },
  chevron: { color:'#64748b', fontSize:16 },
  answer: { padding:'0 16px 14px', color:'#94a3b8', fontSize:14, lineHeight:1.6 },
};

export function HelpFAQPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const [open, setOpen] = useState(null);

  const filtered = FAQS.filter(f =>
    (cat === 'All' || f.cat === cat) &&
    (q === '' || f.q.toLowerCase().includes(q.toLowerCase()) || f.a.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div style={S.page}>
      <div style={S.header}>
        <button style={S.back} onClick={() => navigate(-1)}>←</button>
        <div style={S.title}>Frequently Asked Questions</div>
      </div>
      <div style={S.body}>
        <input style={S.search} placeholder="🔍 Search FAQs…" value={q} onChange={e => setQ(e.target.value)} />
        <div style={S.cats}>
          {CATS.map(c => (
            <button key={c} style={{ ...S.cat, ...(cat === c ? S.catActive : {}) }} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
        {filtered.length === 0 && <div style={{ color:'#64748b', textAlign:'center', padding:40 }}>No results found. Try a different search term.</div>}
        {filtered.map(f => (
          <div key={f.id} style={S.item}>
            <div style={S.qrow} onClick={() => setOpen(open === f.id ? null : f.id)}>
              <span style={S.catBadge}>{f.cat}</span>
              <span style={S.q}>{f.q}</span>
              <span style={S.chevron}>{open === f.id ? '▲' : '▼'}</span>
            </div>
            {open === f.id && <div style={S.answer}>{f.a}</div>}
          </div>
        ))}
        <div style={{ textAlign:'center', marginTop:32 }}>
          <p style={{ color:'#64748b', fontSize:14, marginBottom:12 }}>Still need help?</p>
          <button style={{ background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.3)', borderRadius:12, padding:'10px 24px', color:'#6366f1', fontWeight:700, cursor:'pointer', fontSize:14 }} onClick={() => navigate('/help')}>
            📧 Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}
