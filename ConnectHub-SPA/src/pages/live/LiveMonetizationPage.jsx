// LIVE MONETIZATION PAGE — /live/monetization
// FIXES APPLIED:
//   BUG-28: Raw card inputs REMOVED. Stripe.js loaded via CDN, Payment Element used
//           (PCI DSS compliant — card data never touches our code)
//   BUG-29: "Set Up Payout" button now disabled with clear "Coming Soon" state
//           (was showing active toast "coming soon" which broke trust)
//   BUG-30: Gift sending writes to Firestore gifts collection + deducts coins
//           (the entire monetization loop now closes — gifts are real)
//   UX-19:  Platform fee disclosed in Earnings tab (you keep 70%)
//   UX-20:  Gift toast in Overview tab mentions charity if charity mode is on
//   UX-21:  Redundant balance display in Coins tab hero removed (header balance kept)

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  doc, getDoc, updateDoc, collection, query, where,
  orderBy, limit, onSnapshot, addDoc, serverTimestamp, increment,
} from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import useAppStore from '@store/useAppStore';

const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const API_BASE   = import.meta.env.VITE_API_BASE_URL;

const GIFT_TIERS = [
  { id:'rose',     name:'Rose',     emoji:'🌹', coins:10,   usd:0.10 },
  { id:'star',     name:'Star',     emoji:'⭐', coins:50,   usd:0.50 },
  { id:'crown',    name:'Crown',    emoji:'👑', coins:100,  usd:1.00 },
  { id:'diamond',  name:'Diamond',  emoji:'💎', coins:500,  usd:5.00 },
  { id:'rocket',   name:'Rocket',   emoji:'🚀', coins:1000, usd:10.00 },
  { id:'unicorn',  name:'Unicorn',  emoji:'🦄', coins:5000, usd:50.00 },
];

const COIN_PACKAGES = [
  { coins:100,  usd:1.00,  label:'Starter' },
  { coins:500,  usd:4.50,  label:'Popular',  badge:'Save 10%' },
  { coins:1200, usd:10.00, label:'Best Value', badge:'🏆 Best Value' },
  { coins:3000, usd:22.00, label:'Creator Pack', badge:'Save 27%' },
];

const CHARITY_OPTIONS = [
  { id:'redcross', name:'Red Cross',     emoji:'🏥' },
  { id:'wwf',      name:'WWF',           emoji:'🌿' },
  { id:'unicef',   name:'UNICEF',        emoji:'👶' },
  { id:'custom',   name:'Custom Choice', emoji:'💝' },
];

function LiveSubNav({ navigate }) {
  return (
    <div style={{ display:'flex', gap:'6px', padding:'8px 16px', overflowX:'auto', scrollbarWidth:'none', borderBottom:'1px solid #1e293b' }}>
      {[
        { label:'🎥 Setup',     path:'/live/setup' },
        { label:'📊 Analytics', path:'/live/analytics' },
        { label:'🛡️ Moderation',path:'/live/moderation' },
        { label:'📅 Schedule',  path:'/live/schedule' },
      ].map(l => (
        <button key={l.path} onClick={() => navigate(l.path)}
          style={{ background:'#1e293b', border:'none', borderRadius:'20px', padding:'5px 12px', color:'#94a3b8', fontSize:'11px', fontWeight:600, cursor:'pointer', flexShrink:0 }}>
          {l.label}
        </button>
      ))}
    </div>
  );
}

export default function LiveMonetizationPage() {
  const navigate   = useNavigate();
  const showToast  = useAppStore(s => s.showToast);

  const [tab,          setTab]          = useState('overview');
  const [coinBalance,  setCoinBalance]  = useState(0);
  const [gifts,        setGifts]        = useState([]);
  const [charityMode,  setCharityMode]  = useState(false);
  const [charityOrg,   setCharityOrg]   = useState('redcross');
  const [charityPct,   setCharityPct]   = useState(10);
  const [recentTxns,   setRecentTxns]   = useState([]);

  // BUG-28 FIX: Stripe state — no raw card inputs
  const [showPurchase, setShowPurchase] = useState(false);
  const [selectedPkg,  setSelectedPkg]  = useState(null);
  const [stripeLoaded, setStripeLoaded] = useState(false);
  const [stripeInst,   setStripeInst]   = useState(null);
  const [elements,     setElements]     = useState(null);
  const [paymentEl,    setPaymentEl]    = useState(null);
  const [purchasing,   setPurchasing]   = useState(false);
  const stripeFormRef  = useRef(null);

  // Load Stripe.js via CDN (BUG-28 FIX)
  useEffect(() => {
    if (window.Stripe) { setStripeLoaded(true); return; }
    const s = document.createElement('script');
    s.src = 'https://js.stripe.com/v3/';
    s.onload = () => setStripeLoaded(true);
    document.head.appendChild(s);
  }, []);

  // Real-time coin balance
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const unsub = onSnapshot(doc(db, 'users', uid), snap => {
      if (snap.exists()) setCoinBalance(snap.data().coinBalance || 0);
    });
    return () => unsub();
  }, []);

  // Real-time gifts received (for earnings tab)
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const q = query(
      collection(db, 'gifts'),
      where('streamerId', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(30)
    );
    const unsub = onSnapshot(q, snap => setGifts(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, []);

  // Load recent transactions
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    const unsub = onSnapshot(q, snap => setRecentTxns(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, []);

  // BUG-28 FIX: Open Stripe Payment Element when purchase modal opens
  useEffect(() => {
    if (!showPurchase || !stripeLoaded || !selectedPkg || !STRIPE_KEY) return;
    if (stripeInst) return; // already initialized
    let stripe, els;
    const init = async () => {
      try {
        stripe = window.Stripe(STRIPE_KEY);
        // Create a PaymentIntent on the backend
        const res  = await fetch(`${API_BASE}/payments/create-intent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await auth.currentUser.getIdToken()}` },
          body: JSON.stringify({ coins: selectedPkg.coins, usd: selectedPkg.usd }),
        });
        const data = await res.json();
        // Mount Stripe Payment Element (PCI compliant — no raw card fields)
        els = stripe.elements({ clientSecret: data.clientSecret, appearance: {
          theme: 'night',
          variables: { colorPrimary:'#6366f1', colorBackground:'#1e293b', colorText:'#f1f5f9', colorDanger:'#ef4444', fontFamily:'inherit', borderRadius:'12px' }
        }});
        const pe = els.create('payment');
        pe.mount(stripeFormRef.current);
        setStripeInst(stripe);
        setElements(els);
        setPaymentEl(pe);
      } catch (err) {
        console.error('[Stripe init]', err);
        showToast('Could not load payment form. Please try again.');
      }
    };
    init();
    return () => { try { paymentEl?.destroy(); } catch {} };
  }, [showPurchase, stripeLoaded, selectedPkg]);

  // BUG-28 FIX: Confirm payment using Stripe.js (not raw card data)
  const confirmPayment = async () => {
    if (!stripeInst || !elements || !selectedPkg) return;
    setPurchasing(true);
    try {
      const { error } = await stripeInst.confirmPayment({
        elements,
        confirmParams: { return_url: window.location.href },
        redirect: 'if_required',
      });
      if (error) {
        showToast(`Payment failed: ${error.message}`);
      } else {
        // Credit coins to user balance
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          coinBalance: increment(selectedPkg.coins),
        });
        await addDoc(collection(db, 'transactions'), {
          userId:    auth.currentUser.uid,
          type:      'coin_purchase',
          coins:     selectedPkg.coins,
          usd:       selectedPkg.usd,
          createdAt: serverTimestamp(),
        });
        showToast(`✅ ${selectedPkg.coins} coins added to your balance!`);
        setShowPurchase(false);
        setSelectedPkg(null);
        setStripeInst(null);
        setElements(null);
        setPaymentEl(null);
      }
    } catch (err) {
      showToast('Payment error. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  // BUG-30 FIX: sendGift writes to Firestore gifts collection + deducts coins
  const sendGift = async (gift, streamId, streamerId) => {
    const uid = auth.currentUser?.uid;
    if (!uid) { showToast('Sign in to send gifts'); return; }
    if (coinBalance < gift.coins) { showToast('Not enough coins! Purchase more below.'); return; }
    try {
      // Deduct from sender's balance
      await updateDoc(doc(db, 'users', uid), { coinBalance: increment(-gift.coins) });
      // Write to gifts collection (closes monetization loop)
      await addDoc(collection(db, 'gifts'), {
        streamId,
        streamerId,
        senderId:   uid,
        senderName: auth.currentUser.displayName || 'Viewer',
        giftId:     gift.id,
        giftName:   gift.name,
        giftEmoji:  gift.emoji,
        coins:      gift.coins,
        charityMode,
        charityOrg:   charityMode ? charityOrg : null,
        charityPct:   charityMode ? charityPct  : 0,
        createdAt:  serverTimestamp(),
      });
      // UX-20 FIX: mention charity in toast if charity mode is on
      const charityName = CHARITY_OPTIONS.find(o => o.id === charityOrg)?.name;
      if (charityMode) {
        showToast(`${gift.emoji} ${gift.name} sent! ❤️ ${charityPct}% goes to ${charityName}`);
      } else {
        showToast(`${gift.emoji} ${gift.name} sent! (${gift.coins} coins)`);
      }
    } catch (err) {
      console.error('[sendGift]', err);
      showToast('Gift failed. Please try again.');
    }
  };

  const fmt     = n => n >= 1000 ? `${(n/1000).toFixed(1)}K` : String(n);
  const totalCoinsEarned = gifts.reduce((s, g) => s + (g.coins || 0), 0);
  const totalEarningsUsd = (totalCoinsEarned / 100 * 0.70).toFixed(2); // UX-19: 70% share shown

  const timeAgo = ts => {
    if (!ts) return '';
    const sec = Math.floor((Date.now() - (ts.toMillis ? ts.toMillis() : Date.now())) / 1000);
    if (sec < 60) return 'just now';
    if (sec < 3600) return `${Math.floor(sec/60)}m ago`;
    return `${Math.floor(sec/3600)}h ago`;
  };

  return (
    <div style={{ background:'var(--bg-primary,#0a0a18)', minHeight:'100vh', paddingBottom:'80px' }}>

      {/* Header */}
      <div style={{ padding:'16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', gap:'12px' }}>
        <button onClick={() => navigate(-1)} style={{ background:'none', border:'none', color:'#94a3b8', fontSize:'20px', cursor:'pointer' }}>←</button>
        <span style={{ color:'#475569', fontSize:'12px' }}>Live →</span>
        <span style={{ fontSize:'18px', fontWeight:800, color:'#f1f5f9', flex:1 }}>💰 Monetization</span>
        {/* Coin balance always visible in header */}
        <div style={{ background:'rgba(245,158,11,0.15)', border:'1px solid rgba(245,158,11,0.3)', borderRadius:'10px', padding:'5px 10px', display:'flex', alignItems:'center', gap:'5px' }}>
          <span style={{ fontSize:'14px' }}>🪙</span>
          <span style={{ color:'#f59e0b', fontWeight:800, fontSize:'13px' }}>{fmt(coinBalance)}</span>
        </div>
      </div>

      <LiveSubNav navigate={navigate} />

      {/* Tab bar */}
      <div style={{ display:'flex', borderBottom:'1px solid #1e293b', overflowX:'auto' }}>
        {[
          {id:'overview',  label:'📋 Overview'},
          {id:'gifts',     label:'🎁 Gifts'},
          {id:'coins',     label:'🪙 Coins'},
          {id:'earnings',  label:'💵 Earnings'},
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ flex:'0 0 auto', padding:'10px 16px', border:'none', background:'none', cursor:'pointer', fontWeight:600, fontSize:'12px', whiteSpace:'nowrap',
              color: tab===t.id ? '#f1f5f9' : '#64748b',
              borderBottom: tab===t.id ? '2px solid #f59e0b' : '2px solid transparent' }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding:'16px' }}>

        {/* ── OVERVIEW TAB ── */}
        {tab === 'overview' && (
          <>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'16px' }}>
              {[
                { icon:'🪙', label:'Coin Balance',   val: fmt(coinBalance),         color:'#f59e0b' },
                { icon:'🎁', label:'Gifts Received', val: fmt(gifts.length),        color:'#ec4899' },
                { icon:'💵', label:'Est. Earnings',  val: `$${totalEarningsUsd}`,   color:'#10b981' },
                { icon:'💎', label:'Coins Received', val: fmt(totalCoinsEarned),    color:'#6366f1' },
              ].map(s => (
                <div key={s.label} style={{ background:'#1e293b', borderRadius:'14px', padding:'14px', textAlign:'center' }}>
                  <div style={{ fontSize:'22px', marginBottom:'4px' }}>{s.icon}</div>
                  <div style={{ color:s.color, fontWeight:800, fontSize:'18px' }}>{s.val}</div>
                  <div style={{ color:'#64748b', fontSize:'11px' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* BUG-30 FIX: Test gift sending with real Firestore writes */}
            <div style={{ background:'#1e293b', borderRadius:'14px', padding:'14px', marginBottom:'16px' }}>
              <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'13px', marginBottom:'10px' }}>🎁 Send a Test Gift</div>
              <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                {GIFT_TIERS.slice(0,3).map(g => (
                  <button key={g.id} onClick={() => sendGift(g, 'test-stream', auth.currentUser?.uid)}
                    style={{ background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.3)', borderRadius:'10px', padding:'8px 12px', cursor:'pointer', textAlign:'center' }}>
                    <div style={{ fontSize:'20px' }}>{g.emoji}</div>
                    <div style={{ color:'#f1f5f9', fontSize:'11px', fontWeight:700 }}>{g.name}</div>
                    <div style={{ color:'#64748b', fontSize:'10px' }}>{g.coins} coins</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Charity mode */}
            <div style={{ background:'#1e293b', borderRadius:'14px', padding:'14px', marginBottom:'16px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px' }}>
                <div>
                  <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'13px' }}>❤️ Gift Charity Mode</div>
                  <div style={{ color:'#64748b', fontSize:'11px', marginTop:'2px' }}>Donate % of gift earnings to charity</div>
                </div>
                <button onClick={() => setCharityMode(p => !p)} aria-pressed={charityMode}
                  style={{ width:'44px', height:'24px', borderRadius:'12px', background: charityMode?'#10b981':'#334155', border:'none', cursor:'pointer', position:'relative', flexShrink:0 }}>
                  <div style={{ position:'absolute', top:'3px', left: charityMode?'23px':'3px', width:'18px', height:'18px', borderRadius:'50%', background:'white', transition:'left 0.2s' }} />
                </button>
              </div>
              {charityMode && (
                <>
                  <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'10px' }}>
                    {CHARITY_OPTIONS.map(o => (
                      <button key={o.id} onClick={() => setCharityOrg(o.id)} aria-pressed={charityOrg===o.id}
                        style={{ padding:'5px 10px', borderRadius:'10px', border:'none', fontSize:'11px', fontWeight:600, cursor:'pointer',
                          background: charityOrg===o.id ? 'rgba(16,185,129,0.2)' : '#334155',
                          color: charityOrg===o.id ? '#10b981' : '#94a3b8' }}>
                        {o.emoji} {o.name}
                      </button>
                    ))}
                  </div>
                  <div>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                      <span style={{ color:'#64748b', fontSize:'11px' }}>Charity %</span>
                      <span style={{ color:'#10b981', fontWeight:700, fontSize:'12px' }}>{charityPct}%</span>
                    </div>
                    <input type="range" min="5" max="50" step="5" value={charityPct} onChange={e => setCharityPct(parseInt(e.target.value))}
                      style={{ width:'100%', accentColor:'#10b981' }} aria-label="Charity percentage" />
                  </div>
                </>
              )}
            </div>

            {/* BUG-29 FIX: Payout button is now correctly disabled with clear label */}
            <div style={{ background:'#1e293b', borderRadius:'14px', padding:'14px' }}>
              <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'13px', marginBottom:'6px' }}>💳 Payout Settings</div>
              <div style={{ color:'#64748b', fontSize:'12px', marginBottom:'10px' }}>
                Estimated balance: <strong style={{ color:'#10b981' }}>${totalEarningsUsd}</strong>
                <span style={{ color:'#475569' }}> • You keep 70% after platform fees</span>
              </div>
              {/* BUG-29 FIX: clearly disabled until Stripe Connect is wired */}
              <button disabled aria-disabled="true"
                style={{ width:'100%', background:'#334155', border:'2px dashed #475569', borderRadius:'12px', padding:'12px', color:'#64748b', fontWeight:700, fontSize:'13px', cursor:'not-allowed' }}>
                💳 Set Up Payouts — Coming Soon
              </button>
              <div style={{ color:'#475569', fontSize:'10px', marginTop:'6px', textAlign:'center' }}>
                Stripe Connect payouts will be available in the next update. Your earnings are tracked and will be paid retroactively.
              </div>
            </div>
          </>
        )}

        {/* ── GIFTS TAB ── */}
        {tab === 'gifts' && (
          <>
            <div style={{ marginBottom:'16px' }}>
              <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'13px', marginBottom:'10px' }}>🎁 Gift Catalog</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                {GIFT_TIERS.map(g => (
                  <div key={g.id} style={{ background:'#1e293b', borderRadius:'12px', padding:'12px', textAlign:'center' }}>
                    <div style={{ fontSize:'28px', marginBottom:'4px' }}>{g.emoji}</div>
                    <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'13px' }}>{g.name}</div>
                    <div style={{ color:'#f59e0b', fontSize:'12px', fontWeight:700, marginTop:'2px' }}>🪙 {g.coins}</div>
                    <div style={{ color:'#64748b', fontSize:'11px' }}>${g.usd.toFixed(2)} USD</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background:'#1e293b', borderRadius:'14px', padding:'14px' }}>
              <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'13px', marginBottom:'10px' }}>📬 Recent Gifts Received</div>
              {gifts.length === 0 && <div style={{ color:'#475569', fontSize:'12px', textAlign:'center', padding:'12px' }}>No gifts yet — go live and let viewers send you gifts!</div>}
              {gifts.slice(0,10).map(g => (
                <div key={g.id} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'8px 0', borderBottom:'1px solid #334155' }}>
                  <span style={{ fontSize:'20px', flexShrink:0 }}>{g.giftEmoji || '🎁'}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ color:'#f1f5f9', fontSize:'12px', fontWeight:600 }}>{g.senderName} sent {g.giftName}</div>
                    <div style={{ color:'#64748b', fontSize:'10px' }}>{timeAgo(g.createdAt)}</div>
                  </div>
                  <div style={{ color:'#f59e0b', fontWeight:700, fontSize:'12px' }}>+🪙{g.coins}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── COINS TAB — UX-21 FIX: removed redundant balance hero card ── */}
        {tab === 'coins' && (
          <>
            {/* UX-21 FIX: Balance is shown in header, NOT repeated here in a large hero */}
            <div style={{ marginBottom:'16px' }}>
              <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'13px', marginBottom:'10px' }}>📦 Coin Packages</div>
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {COIN_PACKAGES.map(pkg => (
                  <button key={pkg.coins} onClick={() => { setSelectedPkg(pkg); setShowPurchase(true); setStripeInst(null); setElements(null); setPaymentEl(null); }}
                    style={{ background:'#1e293b', border: pkg.badge?.includes('Best')? '2px solid #f59e0b':'1px solid #334155', borderRadius:'14px', padding:'14px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between', textAlign:'left' }}>
                    <div>
                      <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'2px' }}>
                        <span style={{ color:'#f1f5f9', fontWeight:800, fontSize:'16px' }}>🪙 {pkg.coins}</span>
                        {pkg.badge && <span style={{ background: pkg.badge.includes('🏆') ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'rgba(99,102,241,0.2)', color: pkg.badge.includes('🏆') ? 'white' : '#818cf8', borderRadius:'6px', padding:'1px 6px', fontSize:'10px', fontWeight:700 }}>{pkg.badge}</span>}
                      </div>
                      <div style={{ color:'#64748b', fontSize:'11px' }}>{pkg.label}</div>
                    </div>
                    <div style={{ color:'#10b981', fontWeight:800, fontSize:'16px' }}>${pkg.usd.toFixed(2)}</div>
                  </button>
                ))}
              </div>
            </div>
            {/* Recent transactions */}
            {recentTxns.length > 0 && (
              <div style={{ background:'#1e293b', borderRadius:'14px', padding:'14px' }}>
                <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'12px', marginBottom:'8px' }}>🧾 Recent Transactions</div>
                {recentTxns.map(t => (
                  <div key={t.id} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid #334155', fontSize:'12px' }}>
                    <span style={{ color:'#94a3b8' }}>{t.type === 'coin_purchase' ? '🛒 Purchased' : '🎁 Gift sent'}</span>
                    <span style={{ color: t.type==='coin_purchase'?'#10b981':'#f59e0b', fontWeight:700 }}>
                      {t.type==='coin_purchase' ? `+🪙${t.coins}` : `-🪙${t.coins}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── EARNINGS TAB — UX-19 FIX: platform fee disclosed ── */}
        {tab === 'earnings' && (
          <>
            {/* UX-19 FIX: Revenue share clearly stated */}
            <div style={{ background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:'14px', padding:'14px', marginBottom:'16px' }}>
              <div style={{ color:'#f59e0b', fontWeight:700, fontSize:'13px', marginBottom:'6px' }}>💡 Revenue Share</div>
              <div style={{ color:'#94a3b8', fontSize:'12px', lineHeight:'1.6' }}>
                <strong style={{ color:'#f1f5f9' }}>You keep 70%</strong> of all gift coins received.<br/>
                Platform fee: <strong style={{ color:'#f1f5f9' }}>30%</strong> (covers servers, payment processing, and fraud protection).<br/>
                Earnings are paid monthly via Stripe Connect once payouts are enabled.
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'16px' }}>
              {[
                { icon:'🪙', label:'Total Coins',    val: fmt(totalCoinsEarned), color:'#f59e0b' },
                { icon:'💵', label:'Your 70%',       val:`$${totalEarningsUsd}`, color:'#10b981' },
                { icon:'🎁', label:'Total Gifts',    val: fmt(gifts.length),     color:'#ec4899' },
                { icon:'📊', label:'Platform (30%)', val:`$${(totalCoinsEarned/100*0.30).toFixed(2)}`, color:'#64748b' },
              ].map(s => (
                <div key={s.label} style={{ background:'#1e293b', borderRadius:'14px', padding:'14px', textAlign:'center' }}>
                  <div style={{ fontSize:'22px', marginBottom:'4px' }}>{s.icon}</div>
                  <div style={{ color:s.color, fontWeight:800, fontSize:'18px' }}>{s.val}</div>
                  <div style={{ color:'#64748b', fontSize:'11px' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Revenue breakdown by gift type */}
            {gifts.length > 0 && (
              <div style={{ background:'#1e293b', borderRadius:'14px', padding:'14px', marginBottom:'16px' }}>
                <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'12px', marginBottom:'10px' }}>📊 By Gift Type</div>
                {GIFT_TIERS.map(g => {
                  const count = gifts.filter(x => x.giftId === g.id).length;
                  const coins = count * g.coins;
                  const pct   = totalCoinsEarned > 0 ? Math.round((coins / totalCoinsEarned) * 100) : 0;
                  if (!count) return null;
                  return (
                    <div key={g.id} style={{ marginBottom:'8px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'3px' }}>
                        <span style={{ color:'#94a3b8', fontSize:'12px' }}>{g.emoji} {g.name} ×{count}</span>
                        <span style={{ color:'#f59e0b', fontWeight:700, fontSize:'12px' }}>🪙{fmt(coins)}</span>
                      </div>
                      <div style={{ background:'#334155', borderRadius:'4px', height:'6px' }}>
                        <div style={{ background:'linear-gradient(90deg,#f59e0b,#d97706)', height:'100%', borderRadius:'4px', width:`${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* BUG-29 FIX: Payout — clearly disabled */}
            <div style={{ background:'#1e293b', borderRadius:'14px', padding:'14px' }}>
              <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'13px', marginBottom:'6px' }}>🏦 Withdraw Earnings</div>
              <div style={{ color:'#64748b', fontSize:'12px', marginBottom:'10px' }}>Available for withdrawal: <strong style={{ color:'#10b981' }}>${totalEarningsUsd}</strong></div>
              <button disabled aria-disabled="true"
                style={{ width:'100%', background:'#334155', border:'2px dashed #475569', borderRadius:'12px', padding:'12px', color:'#64748b', fontWeight:700, fontSize:'13px', cursor:'not-allowed' }}>
                🏦 Set Up Bank Account — Coming Soon
              </button>
              <div style={{ color:'#475569', fontSize:'10px', marginTop:'6px', textAlign:'center' }}>
                Stripe Connect bank payouts are in development. Your {fmt(totalCoinsEarned)} coins (${totalEarningsUsd}) are securely tracked.
              </div>
            </div>
          </>
        )}

      </div>

      {/* BUG-28 FIX: Stripe Payment Element modal — PCI compliant, no raw card inputs */}
      {showPurchase && selectedPkg && (
        <div role="dialog" aria-modal="true" aria-label="Purchase coins" style={{ position:'fixed', inset:0, zIndex:200 }}>
          <div onClick={() => { setShowPurchase(false); setSelectedPkg(null); setStripeInst(null); setElements(null); setPaymentEl(null); }} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.7)' }} />
          <div style={{ position:'absolute', bottom:0, left:0, right:0, background:'#0f172a', borderRadius:'20px 20px 0 0', padding:'20px 16px', paddingBottom:'calc(20px + env(safe-area-inset-bottom,0px))' }}>
            <div style={{ color:'#f1f5f9', fontWeight:800, fontSize:'16px', marginBottom:'4px' }}>
              🪙 Purchase {selectedPkg.coins} Coins
            </div>
            <div style={{ color:'#64748b', fontSize:'13px', marginBottom:'16px' }}>
              ${selectedPkg.usd.toFixed(2)} USD • {selectedPkg.label}
            </div>
            {/* BUG-28 FIX: Stripe Payment Element mounts here — no custom card inputs */}
            <div ref={stripeFormRef} style={{ marginBottom:'16px', minHeight:'80px' }} />
            {!stripeInst && (
              <div style={{ color:'#64748b', fontSize:'12px', textAlign:'center', marginBottom:'12px' }}>
                {stripeLoaded ? '⏳ Loading secure payment form…' : '⏳ Loading Stripe.js…'}
              </div>
            )}
            <div style={{ color:'#475569', fontSize:'10px', marginBottom:'12px', textAlign:'center' }}>
              🔒 Payments secured by Stripe. Card data never touches ConnectHub servers.
            </div>
            <div style={{ display:'flex', gap:'10px' }}>
              <button onClick={() => { setShowPurchase(false); setSelectedPkg(null); setStripeInst(null); setElements(null); setPaymentEl(null); }}
                style={{ flex:1, background:'#1e293b', border:'none', borderRadius:'12px', padding:'13px', color:'#94a3b8', fontWeight:700, cursor:'pointer' }}>Cancel</button>
              <button onClick={confirmPayment} disabled={!stripeInst || purchasing}
                style={{ flex:2, background: stripeInst && !purchasing ? 'linear-gradient(135deg,#10b981,#0f766e)' : '#334155', border:'none', borderRadius:'12px', padding:'13px', color:'white', fontWeight:700, fontSize:'14px', cursor: stripeInst && !purchasing ? 'pointer' : 'default', opacity: stripeInst && !purchasing ? 1 : 0.6 }}>
                {purchasing ? '⏳ Processing…' : `✓ Pay $${selectedPkg.usd.toFixed(2)}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
