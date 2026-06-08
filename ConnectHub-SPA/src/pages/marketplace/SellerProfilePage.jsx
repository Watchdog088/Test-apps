// SellerProfilePage.jsx — M8: Full Seller Profile Page
// Route: /marketplace/seller/:name
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import VerifiedBadge from '../../components/common/VerifiedBadge';

// ─── Seed seller data (mirrors MarketplacePage seed) ──────────────────────────
const SELLER_DATA = {
  'Alex Thompson': {
    avatar: '🧑',
    rating: 4.9, reviews: 127, sales: 312,
    memberSince: 'March 2022', responseTime: '~1 hour',
    bio: 'Electronics enthusiast & certified reseller. All items tested before listing. Fast shipping, returns accepted within 14 days.',
    location: 'Washington, DC',
    verified: true,
    badges: ['⚡ Fast Shipper', '✅ Verified', '🔥 Top Seller'],
  },
  'Sarah Miller': {
    avatar: '👩',
    rating: 4.7, reviews: 84, sales: 156,
    memberSince: 'June 2023', responseTime: '~2 hours',
    bio: 'Yoga teacher & wellness advocate. Selling quality fitness gear at fair prices. Bundle deals available — just ask!',
    location: 'Arlington, VA',
    verified: true,
    badges: ['✅ Verified', '💬 Responsive'],
  },
  'Mike Chen': {
    avatar: '👨',
    rating: 4.8, reviews: 203, sales: 445,
    memberSince: 'January 2021', responseTime: '~30 min',
    bio: 'Professional photographer offloading studio equipment. Gear is carefully maintained and tested. Price negotiable for bulk buys.',
    location: 'Bethesda, MD',
    verified: true,
    badges: ['⚡ Fast Shipper', '✅ Verified', '🔥 Top Seller', '📦 Ships Free'],
  },
  'Emma Davis': {
    avatar: '🧑‍🦰',
    rating: 4.6, reviews: 51, sales: 98,
    memberSince: 'October 2023', responseTime: '~3 hours',
    bio: 'Indie artist & designer. I create original pieces and sell quality art supplies. Every purchase supports local art!',
    location: 'Silver Spring, MD',
    verified: false,
    badges: ['🎨 Artist'],
  },
  'Jake Wilson': {
    avatar: '👦',
    rating: 4.9, reviews: 176, sales: 389,
    memberSince: 'August 2020', responseTime: '~45 min',
    bio: 'Gaming collector with 6+ years of reselling. All consoles and accessories tested. Competitive prices, authentic items only.',
    location: 'Rockville, MD',
    verified: true,
    badges: ['⚡ Fast Shipper', '✅ Verified', '🔥 Top Seller'],
  },
};

const SEED_PRODUCTS = [
  { id:1,  seller:'Alex Thompson', title:'Smart Watch (Fitbit Versa 3)', price:89,  condition:'Good',      category:'Electronics', emoji:'⌚', views:247, saves:18 },
  { id:2,  seller:'Sarah Miller',  title:'Yoga Mat Premium',             price:35,  condition:'Like New',  category:'Fitness',     emoji:'🧘', views:134, saves:9  },
  { id:3,  seller:'Mike Chen',     title:'Canon Camera EOS M50',         price:320, condition:'Good',      category:'Electronics', emoji:'📷', views:389, saves:31 },
  { id:4,  seller:'Emma Davis',    title:'Gaming Chair Pro',             price:150, condition:'Like New',  category:'Gaming',      emoji:'🎮', views:278, saves:22 },
  { id:5,  seller:'Jake Wilson',   title:'Vintage Vinyl Records (10)',   price:45,  condition:'Good',      category:'Music',       emoji:'🎵', views:165, saves:14 },
  { id:6,  seller:'Alex Thompson', title:'Mechanical Keyboard RGB',      price:75,  condition:'Like New',  category:'Electronics', emoji:'⌨️', views:198, saves:16 },
  { id:7,  seller:'Sarah Miller',  title:'Resistance Bands Set',         price:22,  condition:'New',       category:'Fitness',     emoji:'💪', views:88,  saves:7  },
  { id:8,  seller:'Mike Chen',     title:'Sigma 50mm f/1.4 Lens',        price:480, condition:'Good',      category:'Electronics', emoji:'🔭', views:412, saves:38 },
  { id:9,  seller:'Emma Davis',    title:'Acrylic Paint Set 72 Colors',  price:38,  condition:'New',       category:'Art',         emoji:'🎨', views:92,  saves:11 },
  { id:10, seller:'Jake Wilson',   title:'Nintendo Switch OLED',         price:299, condition:'Like New',  category:'Gaming',      emoji:'🕹️', views:521, saves:47 },
  { id:11, seller:'Alex Thompson', title:'Wireless Earbuds ANC',         price:55,  condition:'Good',      category:'Electronics', emoji:'🎧', views:183, saves:13 },
  { id:12, seller:'Mike Chen',     title:'Tripod Professional Carbon',   price:145, condition:'Like New',  category:'Electronics', emoji:'📸', views:231, saves:20 },
  { id:13, seller:'Jake Wilson',   title:'PS5 DualSense Controller',     price:65,  condition:'Like New',  category:'Gaming',      emoji:'🎮', views:302, saves:28 },
  { id:14, seller:'Emma Davis',    title:'Watercolor Paper 200 Sheets',  price:26,  condition:'New',       category:'Art',         emoji:'🖼️', views:61,  saves:5  },
  { id:15, seller:'Sarah Miller',  title:'Jump Rope Speed Cable',        price:18,  condition:'New',       category:'Fitness',     emoji:'🏋️', views:77,  saves:6  },
  { id:16, seller:'Alex Thompson', title:'Smart LED Desk Lamp',          price:42,  condition:'Like New',  category:'Electronics', emoji:'💡', views:156, saves:12 },
];

const COND_COLOR = { New:'#10b981','Like New':'#6366f1',Good:'#f59e0b',Fair:'#ef4444',Poor:'#64748b' };

export default function SellerProfilePage() {
  const { name } = useParams();
  const navigate = useNavigate();
  const sellerName = decodeURIComponent(name || '');
  const seller = SELLER_DATA[sellerName];
  const listings = SEED_PRODUCTS.filter(p => p.seller === sellerName);

  const [messageOpen, setMessageOpen] = useState(false);
  const [msgText, setMsgText] = useState('');
  const [msgSent, setMsgSent] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const [reportReason, setReportReason] = useState('');

  const S = {
    page: { minHeight:'100dvh', background:'#0a0a18', color:'#f1f5f9', overflowY:'auto' },
    hdr: { position:'sticky', top:0, zIndex:50, background:'rgba(10,10,24,0.95)', backdropFilter:'blur(16px)', padding:'14px 20px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', gap:'12px' },
    back: { background:'none', border:'none', color:'#6366f1', fontSize:'20px', cursor:'pointer', padding:'4px' },
    card: { background:'#1e293b', borderRadius:'16px', padding:'20px', margin:'16px', border:'1px solid #334155' },
    row: { display:'flex', alignItems:'center', gap:'12px' },
    btn: (c='#6366f1') => ({ background:`rgba(${c==='#6366f1'?'99,102,241':'16,185,129'},0.15)`, border:`1px solid ${c}`, borderRadius:'12px', padding:'10px 18px', color:c, fontWeight:700, fontSize:'13px', cursor:'pointer' }),
    modal: { position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:200, display:'flex', alignItems:'flex-end', justifyContent:'center' },
    box: { background:'#1e293b', borderRadius:'20px 20px 0 0', padding:'24px', width:'100%', maxWidth:'480px', maxHeight:'70vh', overflowY:'auto' },
    input: { width:'100%', background:'#0f172a', border:'1px solid #334155', borderRadius:'12px', padding:'12px 14px', color:'#f1f5f9', fontSize:'14px', outline:'none', boxSizing:'border-box', marginTop:'8px', resize:'vertical' },
    listCard: { background:'#0f172a', borderRadius:'14px', padding:'14px', marginBottom:'10px', display:'flex', alignItems:'center', gap:'14px', cursor:'pointer', border:'1px solid #1e293b' },
  };

  if (!seller) {
    return (
      <div style={S.page}>
        <div style={S.hdr}>
          <button style={S.back} onClick={() => navigate(-1)}>←</button>
          <span style={{ fontWeight:700, fontSize:'16px' }}>Seller Profile</span>
        </div>
        <div style={{ textAlign:'center', padding:'60px 24px' }}>
          <div style={{ fontSize:'48px', marginBottom:'16px' }}>🔍</div>
          <div style={{ fontWeight:700, fontSize:'18px', color:'#f1f5f9', marginBottom:'8px' }}>Seller not found</div>
          <div style={{ color:'#64748b', fontSize:'14px', marginBottom:'24px' }}>This seller profile doesn't exist or has been removed.</div>
          <button style={{ ...S.btn(), padding:'12px 24px' }} onClick={() => navigate('/marketplace')}>← Back to Marketplace</button>
        </div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.hdr}>
        <button style={S.back} onClick={() => navigate(-1)}>←</button>
        <span style={{ fontWeight:700, fontSize:'16px' }}>Seller Profile</span>
      </div>

      {/* Hero card */}
      <div style={S.card}>
        <div style={S.row}>
          <div style={{ width:'72px', height:'72px', borderRadius:'50%', background:'linear-gradient(135deg,#6366f1,#ec4899)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'36px', flexShrink:0 }}>
            {seller.avatar}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap' }}>
              <span style={{ fontWeight:800, fontSize:'18px', color:'#f1f5f9' }}>{sellerName}</span>
              {seller.verified && <VerifiedBadge variant="marketplace" size="sm" style={{ marginLeft: 2 }} />}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'4px', marginTop:'4px' }}>
              {'⭐'.repeat(5).split('').map((s,i) => <span key={i} style={{ color: i < Math.round(seller.rating) ? '#fbbf24' : '#334155', fontSize:'13px' }}>{s}</span>)}
              <span style={{ color:'#94a3b8', fontSize:'13px', marginLeft:'4px' }}>{seller.rating} ({seller.reviews} reviews)</span>
            </div>
            <div style={{ color:'#64748b', fontSize:'12px', marginTop:'4px' }}>📍 {seller.location} · Member since {seller.memberSince}</div>
          </div>
        </div>

        {/* Badges */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginTop:'14px' }}>
          {seller.badges.map((b,i) => {
            // Replace the plain text '✅ Verified' badge with the branded purple SVG badge
            if (b === '✅ Verified') {
              return (
                <span key={i} style={{ background:'rgba(168,85,247,0.12)', border:'1px solid rgba(168,85,247,0.35)', borderRadius:'10px', padding:'4px 10px', fontSize:'11px', color:'#d8b4fe', fontWeight:700, display:'inline-flex', alignItems:'center', gap:4 }}>
                  <VerifiedBadge variant="marketplace" size="xs" /> Verified Seller
                </span>
              );
            }
            return (
              <span key={i} style={{ background:'#0f172a', border:'1px solid #334155', borderRadius:'10px', padding:'4px 10px', fontSize:'11px', color:'#94a3b8', fontWeight:600 }}>{b}</span>
            );
          })}
        </div>

        {/* Bio */}
        <p style={{ color:'#94a3b8', fontSize:'13px', lineHeight:'1.6', margin:'14px 0 0' }}>{seller.bio}</p>

        {/* Stats row */}
        <div style={{ display:'flex', gap:'8px', marginTop:'16px' }}>
          {[
            { label:'Sales', val:seller.sales },
            { label:'Rating', val:`${seller.rating}/5` },
            { label:'Reviews', val:seller.reviews },
            { label:'Response', val:seller.responseTime },
          ].map((s,i) => (
            <div key={i} style={{ flex:1, background:'#0f172a', borderRadius:'10px', padding:'10px 6px', textAlign:'center', border:'1px solid #1e293b' }}>
              <div style={{ fontWeight:800, fontSize:'15px', color:'#f1f5f9' }}>{s.val}</div>
              <div style={{ fontSize:'10px', color:'#64748b', marginTop:'2px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display:'flex', gap:'10px', marginTop:'16px' }}>
          <button style={{ ...S.btn('#6366f1'), flex:1 }} onClick={() => setMessageOpen(true)}>💬 Message</button>
          <button style={{ background:'rgba(239,68,68,0.1)', border:'1px solid #ef4444', borderRadius:'12px', padding:'10px 16px', color:'#fca5a5', fontWeight:700, fontSize:'13px', cursor:'pointer' }} onClick={() => setReportOpen(true)}>🚩 Report</button>
        </div>
      </div>

      {/* Listings */}
      <div style={{ padding:'0 16px' }}>
        <div style={{ fontWeight:800, fontSize:'16px', color:'#f1f5f9', marginBottom:'14px' }}>
          🛍️ Listings ({listings.length})
        </div>
        {listings.length === 0 ? (
          <div style={{ textAlign:'center', padding:'40px', background:'#1e293b', borderRadius:'16px', border:'1px solid #334155' }}>
            <div style={{ fontSize:'40px', marginBottom:'12px' }}>📦</div>
            <div style={{ color:'#64748b', fontSize:'14px' }}>No active listings from this seller.</div>
          </div>
        ) : listings.map(item => (
          <div key={item.id} style={S.listCard} onClick={() => navigate('/marketplace')}>
            <div style={{ width:'56px', height:'56px', borderRadius:'12px', background:'linear-gradient(135deg,#1e293b,#334155)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px', flexShrink:0 }}>
              {item.emoji}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:700, fontSize:'14px', color:'#f1f5f9', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.title}</div>
              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginTop:'4px' }}>
                <span style={{ color:'#10b981', fontWeight:800, fontSize:'16px' }}>${item.price}</span>
                <span style={{ background:`${COND_COLOR[item.condition]}22`, border:`1px solid ${COND_COLOR[item.condition]}44`, borderRadius:'6px', padding:'1px 7px', fontSize:'10px', color:COND_COLOR[item.condition], fontWeight:700 }}>{item.condition}</span>
              </div>
              <div style={{ fontSize:'11px', color:'#475569', marginTop:'3px' }}>👁 {item.views} views · ❤️ {item.saves} saves</div>
            </div>
            <div style={{ color:'#6366f1', fontSize:'18px' }}>›</div>
          </div>
        ))}
      </div>

      <div style={{ height:'32px' }} />

      {/* Message Modal */}
      {messageOpen && (
        <div style={S.modal} onClick={() => { setMessageOpen(false); setMsgText(''); setMsgSent(false); }}>
          <div style={S.box} onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
              <span style={{ fontWeight:700, fontSize:'16px' }}>💬 Message {sellerName}</span>
              <button style={{ background:'none', border:'none', color:'#94a3b8', fontSize:'20px', cursor:'pointer' }} onClick={() => { setMessageOpen(false); setMsgText(''); setMsgSent(false); }}>✕</button>
            </div>
            {msgSent ? (
              <div style={{ textAlign:'center', padding:'24px' }}>
                <div style={{ fontSize:'40px', marginBottom:'12px' }}>✅</div>
                <div style={{ fontWeight:700, color:'#f1f5f9', marginBottom:'6px' }}>Message sent!</div>
                <div style={{ fontSize:'13px', color:'#64748b' }}>Check your Inbox for the reply.</div>
              </div>
            ) : (
              <>
                <textarea placeholder={`Hi ${sellerName.split(' ')[0]}, I'm interested in...`} value={msgText} onChange={e => setMsgText(e.target.value)} rows={4} style={S.input} />
                <button style={{ ...S.btn(), width:'100%', marginTop:'14px', padding:'14px' }} onClick={() => { if (msgText.trim()) setMsgSent(true); }}>
                  Send Message
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportOpen && (
        <div style={S.modal} onClick={() => { setReportOpen(false); setReportSent(false); setReportReason(''); }}>
          <div style={S.box} onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
              <span style={{ fontWeight:700, fontSize:'16px' }}>🚩 Report Seller</span>
              <button style={{ background:'none', border:'none', color:'#94a3b8', fontSize:'20px', cursor:'pointer' }} onClick={() => { setReportOpen(false); setReportSent(false); setReportReason(''); }}>✕</button>
            </div>
            {reportSent ? (
              <div style={{ textAlign:'center', padding:'24px' }}>
                <div style={{ fontSize:'40px', marginBottom:'12px' }}>✅</div>
                <div style={{ fontWeight:700, color:'#f1f5f9', marginBottom:'6px' }}>Report submitted</div>
                <div style={{ fontSize:'13px', color:'#64748b' }}>Our team will review this seller within 24 hours.</div>
              </div>
            ) : (
              <>
                <div style={{ color:'#94a3b8', fontSize:'13px', marginBottom:'14px' }}>Select a reason for reporting this seller:</div>
                {['Fraudulent listings','Counterfeit items','Harassment / threats','Spam / fake account','Price gouging','Other'].map(r => (
                  <div key={r} onClick={() => setReportReason(r)} style={{ padding:'12px 16px', borderRadius:'10px', marginBottom:'8px', cursor:'pointer', display:'flex', alignItems:'center', gap:'10px', background:reportReason===r?'rgba(99,102,241,0.15)':'#0f172a', border:`1px solid ${reportReason===r?'#6366f1':'#1e293b'}` }}>
                    <div style={{ width:'18px', height:'18px', borderRadius:'50%', border:`2px solid ${reportReason===r?'#6366f1':'#475569'}`, background:reportReason===r?'#6366f1':'transparent', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {reportReason===r && <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'white' }} />}
                    </div>
                    <span style={{ color:'#f1f5f9', fontSize:'14px' }}>{r}</span>
                  </div>
                ))}
                <button style={{ background:'rgba(239,68,68,0.15)', border:'1px solid #ef4444', borderRadius:'12px', padding:'14px', width:'100%', color:'#fca5a5', fontWeight:700, fontSize:'14px', cursor:'pointer', marginTop:'8px', opacity:reportReason?1:0.5 }}
                  onClick={() => { if (reportReason) setReportSent(true); }}>
                  Submit Report
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
