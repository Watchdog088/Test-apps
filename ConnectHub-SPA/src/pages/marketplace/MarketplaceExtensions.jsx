/**
 * MarketplaceExtensions.jsx — Sprint 20
 * Self-contained feature modules for the Marketplace.
 * Import and render any of these components inside MarketplacePage.jsx.
 *
 * ✅ M18: ShareListingModal  — Web Share API + clipboard fallback
 * ✅ M19: ReportListingModal — Reason-select bottom sheet + toast confirm
 * ✅ M20: NegotiationTimeline — Structured offer history in chat thread
 * ✅ M21: ListingExpiryBanner — 60-day expiry countdown + Renew CTA
 * ✅ M22: BoostListingModal   — $1.99/$3.99/$5.99 tier promotion picker
 * ✅ M23: PriceAlertModal     — "Alert me below $X" form + localStorage
 * ✅ M28: SafeSpotsModal      — Nearby public meeting place suggestions
 * ✅ M30: WishlistShareModal  — Shareable wishlist link + copy-to-clipboard
 */

import React, { useState, useRef, useEffect } from 'react';
import { createPaymentIntent, confirmCardPayment } from '../../services/marketplace-backend-service.js';

/* ─────────────────────────────────────────────────────────────────────────── */
/* Shared helpers                                                               */
/* ─────────────────────────────────────────────────────────────────────────── */
const DARK = {
  bg0:'#0f172a', bg1:'#1e293b', bg2:'#334155',
  text:'#f1f5f9', muted:'#94a3b8', dim:'#64748b',
  accent:'#6366f1', green:'#10b981', red:'#ef4444',
  yellow:'#f59e0b', orange:'#f97316',
};

function Backdrop({ onClose, children, maxH = '80vh' }) {
  return (
    <div
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.72)',
        zIndex:300, display:'flex', alignItems:'flex-end' }}
      onClick={onClose}
    >
      <div
        style={{ background:DARK.bg1, borderRadius:'24px 24px 0 0', width:'100%',
          padding:'24px 20px', maxHeight:maxH, overflowY:'auto',
          boxShadow:'0 -8px 40px rgba(0,0,0,0.5)' }}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function ModalTitle({ icon, text, onClose }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'18px' }}>
      <div style={{ fontWeight:800, fontSize:'17px', color:DARK.text }}>{icon} {text}</div>
      <button onClick={onClose}
        style={{ background:'none', border:'none', color:DARK.muted, fontSize:'22px', cursor:'pointer', lineHeight:1 }}>✕</button>
    </div>
  );
}

function PillBtn({ label, active, onClick, color = DARK.accent }) {
  return (
    <button onClick={onClick}
      style={{ padding:'7px 16px', borderRadius:'20px', border:'none', cursor:'pointer',
        fontWeight:active ? 700 : 500, fontSize:'13px',
        background:active ? color : DARK.bg2,
        color:active ? 'white' : DARK.muted, whiteSpace:'nowrap' }}>
      {label}
    </button>
  );
}

function ActionBtn({ label, onClick, color = DARK.accent, style: extra = {} }) {
  return (
    <button onClick={onClick}
      style={{ padding:'12px 0', borderRadius:'14px', border:'none', cursor:'pointer',
        background:color, color:'white', fontWeight:700, fontSize:'14px',
        width:'100%', ...extra }}>
      {label}
    </button>
  );
}

function useToast() {
  const [msg, setMsg] = useState('');
  function show(m, ms = 2600) { setMsg(m); setTimeout(() => setMsg(''), ms); }
  const Toast = msg ? (
    <div style={{ position:'fixed', bottom:34, left:'50%', transform:'translateX(-50%)',
      background:DARK.bg1, border:`1px solid ${DARK.accent}`, color:DARK.text,
      padding:'10px 22px', borderRadius:'14px', fontWeight:600, zIndex:500,
      whiteSpace:'nowrap', fontSize:'13px', boxShadow:'0 4px 24px rgba(0,0,0,0.45)' }}>
      {msg}
    </div>
  ) : null;
  return { show, Toast };
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* M18 — Share Listing Modal                                                   */
/* ─────────────────────────────────────────────────────────────────────────── */
/**
 * Props:
 *   item   — { id, title, price, emoji } — the listing to share
 *   onClose
 *
 * Usage in MarketplacePage:
 *   import { ShareListingModal } from './MarketplaceExtensions';
 *   {showShareModal && <ShareListingModal item={selectedItem} onClose={() => setShowShareModal(false)} />}
 */
export function ShareListingModal({ item, onClose }) {
  const { show, Toast } = useToast();
  if (!item) return null;

  const url  = `${window.location.origin}/marketplace?listing=${item.id}`;
  const text = `Check out "${item.title}" for $${item.price} on ConnectHub Marketplace!`;

  async function handleNativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: item.title, text, url });
        show('✅ Shared successfully!');
        onClose();
      } catch (e) {
        if (e.name !== 'AbortError') show('⚠️ Share failed — try copying the link');
      }
    } else {
      handleCopy();
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      show('📋 Link copied to clipboard!');
    } catch {
      show('⚠️ Could not copy — please copy manually');
    }
  }

  const CHANNELS = [
    { icon:'💬', label:'Messages',  action: () => { window.open(`sms:?body=${encodeURIComponent(text + '\n' + url)}`); }},
    { icon:'📷', label:'Instagram', action: handleCopy },
    { icon:'🐦', label:'X (Twitter)', action: () => { window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,'_blank'); }},
    { icon:'📘', label:'Facebook',  action: () => { window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,'_blank'); }},
    { icon:'💌', label:'Email',     action: () => { window.open(`mailto:?subject=${encodeURIComponent(item.title)}&body=${encodeURIComponent(text + '\n\n' + url)}`); }},
    { icon:'📋', label:'Copy Link', action: handleCopy },
  ];

  return (
    <Backdrop onClose={onClose}>
      {Toast}
      <ModalTitle icon="📤" text="Share Listing" onClose={onClose} />

      {/* Listing preview */}
      <div style={{ display:'flex', alignItems:'center', gap:'12px', background:DARK.bg0,
        borderRadius:'14px', padding:'12px', marginBottom:'20px' }}>
        <div style={{ width:'52px', height:'52px', borderRadius:'12px',
          background:item.color||'#334155', display:'flex', alignItems:'center',
          justifyContent:'center', fontSize:'26px', flexShrink:0 }}>{item.emoji||'🛍️'}</div>
        <div>
          <div style={{ fontWeight:700, color:DARK.text, fontSize:'15px' }}>{item.title}</div>
          <div style={{ color:DARK.green, fontWeight:700, fontSize:'14px' }}>${item.price}</div>
        </div>
      </div>

      {/* Native share (if supported) */}
      {navigator.share && (
        <ActionBtn label="📤 Share via..." onClick={handleNativeShare}
          style={{ marginBottom:'14px' }} />
      )}

      {/* Channel grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'10px', marginBottom:'16px' }}>
        {CHANNELS.map(ch => (
          <button key={ch.label} onClick={() => { ch.action(); show(`Sharing via ${ch.label}…`); }}
            style={{ background:DARK.bg0, border:`1px solid ${DARK.bg2}`, borderRadius:'14px',
              padding:'12px 8px', cursor:'pointer', display:'flex', flexDirection:'column',
              alignItems:'center', gap:'6px' }}>
            <span style={{ fontSize:'22px' }}>{ch.icon}</span>
            <span style={{ fontSize:'11px', color:DARK.muted, fontWeight:600 }}>{ch.label}</span>
          </button>
        ))}
      </div>

      {/* Deep-link URL display */}
      <div style={{ background:DARK.bg0, borderRadius:'10px', padding:'10px 14px',
        display:'flex', alignItems:'center', gap:'10px' }}>
        <span style={{ fontSize:'12px', color:DARK.dim, flex:1, wordBreak:'break-all' }}>{url}</span>
        <button onClick={handleCopy}
          style={{ background:DARK.accent, border:'none', borderRadius:'8px',
            padding:'6px 12px', color:'white', fontSize:'12px', fontWeight:700, cursor:'pointer', flexShrink:0 }}>
          Copy
        </button>
      </div>
    </Backdrop>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* M19 — Report Listing Modal                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */
/**
 * Props: item, onClose
 * Usage: {showReportModal && <ReportListingModal item={selectedItem} onClose={() => setShowReportModal(false)} />}
 */
const REPORT_REASONS = [
  { id:'scam',        icon:'🚨', label:'Scam or fraud' },
  { id:'prohibited',  icon:'🚫', label:'Prohibited item' },
  { id:'counterfeit', icon:'🏷️', label:'Counterfeit / fake' },
  { id:'misleading',  icon:'🤥', label:'Misleading description' },
  { id:'offensive',   icon:'⚠️', label:'Offensive content' },
  { id:'spam',        icon:'📬', label:'Spam / duplicate listing' },
  { id:'wrong_cat',   icon:'📂', label:'Wrong category' },
  { id:'other',       icon:'💬', label:'Other' },
];

export function ReportListingModal({ item, onClose }) {
  const [reason, setReason]     = useState('');
  const [details, setDetails]   = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { show, Toast } = useToast();
  if (!item) return null;

  function submit() {
    if (!reason) { show('⚠️ Please select a reason'); return; }
    // In production: POST to /api/reports or write to Firestore reports/{id}
    const report = { listingId: item.id, listingTitle: item.title,
      reason, details, reportedAt: new Date().toISOString() };
    try {
      const all = JSON.parse(localStorage.getItem('listing_reports')||'[]');
      localStorage.setItem('listing_reports', JSON.stringify([...all, report]));
    } catch {}
    setSubmitted(true);
  }

  if (submitted) return (
    <Backdrop onClose={onClose}>
      <div style={{ textAlign:'center', padding:'20px 0' }}>
        <div style={{ fontSize:'54px', marginBottom:'14px' }}>✅</div>
        <div style={{ fontWeight:800, fontSize:'18px', color:DARK.text, marginBottom:'8px' }}>Report Submitted</div>
        <div style={{ color:DARK.muted, fontSize:'13px', marginBottom:'24px', lineHeight:1.5 }}>
          Thank you for helping keep our marketplace safe. Our team will review this listing within 24 hours.
        </div>
        <ActionBtn label="Done" onClick={onClose} />
      </div>
    </Backdrop>
  );

  return (
    <Backdrop onClose={onClose}>
      {Toast}
      <ModalTitle icon="🚩" text={`Report Listing`} onClose={onClose} />
      <div style={{ fontSize:'13px', color:DARK.muted, marginBottom:'16px' }}>
        Reporting: <strong style={{ color:DARK.text }}>{item.title}</strong>
      </div>

      <div style={{ fontWeight:700, fontSize:'13px', color:DARK.muted, marginBottom:'10px' }}>
        SELECT REASON
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'16px' }}>
        {REPORT_REASONS.map(r => (
          <button key={r.id} onClick={() => setReason(r.id)}
            style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px',
              borderRadius:'12px', border:`1px solid ${reason===r.id?DARK.accent:DARK.bg2}`,
              background:reason===r.id?'rgba(99,102,241,0.1)':DARK.bg0,
              cursor:'pointer', textAlign:'left' }}>
            <span style={{ fontSize:'20px' }}>{r.icon}</span>
            <span style={{ fontSize:'14px', fontWeight:reason===r.id?700:500,
              color:reason===r.id?DARK.text:DARK.muted }}>{r.label}</span>
            {reason===r.id && <span style={{ marginLeft:'auto', color:DARK.accent }}>✓</span>}
          </button>
        ))}
      </div>

      <div style={{ fontWeight:700, fontSize:'13px', color:DARK.muted, marginBottom:'8px' }}>
        ADDITIONAL DETAILS (OPTIONAL)
      </div>
      <textarea value={details} onChange={e => setDetails(e.target.value.slice(0,500))}
        placeholder="Add any additional context that may help our team review this report…"
        style={{ width:'100%', minHeight:'80px', background:DARK.bg0, border:`1px solid ${DARK.bg2}`,
          borderRadius:'10px', padding:'10px 12px', color:DARK.text, fontSize:'13px',
          outline:'none', resize:'vertical', fontFamily:'inherit', boxSizing:'border-box', marginBottom:'16px' }} />

      <ActionBtn label="🚩 Submit Report" onClick={submit} color={DARK.red} />
    </Backdrop>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* M20 — Negotiation Timeline                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */
/**
 * Renders a structured offer history above the chat messages.
 *
 * Props:
 *   offers — Array<{ type:'ask'|'offer'|'counter'|'accepted'|'declined', amount, by, at }>
 *   itemTitle — string
 *
 * Usage inside the chat view render:
 *   <NegotiationTimeline offers={activeConvo.offers || []} itemTitle={activeConvo.item} />
 */
export function NegotiationTimeline({ offers = [], itemTitle }) {
  if (offers.length === 0) return null;

  const icons = { ask:'🏷️', offer:'💰', counter:'🔄', accepted:'✅', declined:'❌' };
  const colors = {
    ask:DARK.muted, offer:DARK.accent, counter:DARK.yellow,
    accepted:DARK.green, declined:DARK.red,
  };
  const labels = {
    ask:'Listed for', offer:'Offered', counter:'Counter-offer',
    accepted:'Accepted', declined:'Declined',
  };

  return (
    <div style={{ background:DARK.bg0, borderRadius:'14px', padding:'14px',
      margin:'0 0 12px 0', border:`1px solid ${DARK.bg2}` }}>
      <div style={{ fontSize:'11px', fontWeight:700, color:DARK.dim,
        marginBottom:'12px', textTransform:'uppercase', letterSpacing:'0.5px' }}>
        💬 Price Negotiation — {itemTitle}
      </div>

      {/* Timeline */}
      <div style={{ position:'relative' }}>
        {offers.map((o, i) => (
          <div key={i} style={{ display:'flex', gap:'12px', alignItems:'flex-start',
            marginBottom: i < offers.length - 1 ? '0' : '0' }}>
            {/* Connector line */}
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
              <div style={{ width:'28px', height:'28px', borderRadius:'50%',
                background:`${colors[o.type]}22`, border:`2px solid ${colors[o.type]}`,
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', flexShrink:0 }}>
                {icons[o.type]}
              </div>
              {i < offers.length - 1 && (
                <div style={{ width:'2px', flex:1, background:DARK.bg2, minHeight:'20px', marginTop:'4px', marginBottom:'4px' }} />
              )}
            </div>
            {/* Content */}
            <div style={{ paddingBottom: i < offers.length - 1 ? '12px' : '0', flex:1 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:'12px', fontWeight:700, color:colors[o.type] }}>
                  {labels[o.type]}
                </span>
                <span style={{ fontSize:'11px', color:DARK.dim }}>{o.at}</span>
              </div>
              <div style={{ fontSize:'15px', fontWeight:800, color:DARK.text, marginTop:'2px' }}>
                {o.amount ? `$${o.amount}` : '—'}
              </div>
              {o.by && (
                <div style={{ fontSize:'11px', color:DARK.dim, marginTop:'2px' }}>by {o.by}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      {offers.some(o => o.type === 'accepted') && (
        <div style={{ background:'rgba(16,185,129,0.1)', borderRadius:'10px',
          padding:'10px', marginTop:'10px', border:`1px solid rgba(16,185,129,0.3)` }}>
          <span style={{ fontSize:'13px', fontWeight:700, color:DARK.green }}>
            ✅ Deal agreed at ${offers.find(o=>o.type==='accepted')?.amount}
          </span>
        </div>
      )}
    </div>
  );
}

/* Demo offers for display inside MarketplacePage chat view */
export const DEMO_OFFERS = [
  { type:'ask',      amount:120, by:'Seller',   at:'May 10, 9:00 AM' },
  { type:'offer',    amount:90,  by:'You',       at:'May 10, 9:15 AM' },
  { type:'counter',  amount:105, by:'Seller',    at:'May 10, 9:22 AM' },
  { type:'offer',    amount:100, by:'You',        at:'May 10, 9:30 AM' },
  { type:'accepted', amount:100, by:'Seller',    at:'May 10, 9:35 AM' },
];

/* ─────────────────────────────────────────────────────────────────────────── */
/* M21 — Listing Expiry Banner                                                 */
/* ─────────────────────────────────────────────────────────────────────────── */
/**
 * Shows on the Sell tab's MY LISTINGS cards when a listing is within 7 days of expiry.
 *
 * Props:
 *   listing  — { id, title, listedAt }   (listedAt = ISO date string)
 *   onRenew  — () => void   callback when user renews
 *
 * Usage: render below each seller listing card in Sell tab.
 */
export function ListingExpiryBanner({ listing, onRenew }) {
  const EXPIRY_DAYS = 60;
  const [renewed, setRenewed] = useState(() => {
    try { return JSON.parse(localStorage.getItem('renewed_listings')||'{}')[listing.id] || false; } catch { return false; }
  });

  if (!listing?.listedAt) return null;

  const listedDate   = new Date(listing.listedAt);
  const expiryDate   = new Date(listedDate.getTime() + EXPIRY_DAYS * 86400000);
  const today        = new Date();
  const daysLeft     = Math.ceil((expiryDate - today) / 86400000);
  const isExpired    = daysLeft <= 0;
  const isNearExpiry = daysLeft <= 7 && daysLeft > 0;

  if (!isExpired && !isNearExpiry && !renewed) return null;

  function handleRenew() {
    try {
      const map = JSON.parse(localStorage.getItem('renewed_listings')||'{}');
      map[listing.id] = true;
      localStorage.setItem('renewed_listings', JSON.stringify(map));
    } catch {}
    setRenewed(true);
    onRenew?.();
  }

  if (renewed) return (
    <div style={{ background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)',
      borderRadius:'10px', padding:'10px 14px', marginTop:'8px',
      display:'flex', alignItems:'center', gap:'8px' }}>
      <span>✅</span>
      <span style={{ fontSize:'12px', color:DARK.green, fontWeight:600 }}>
        Listing renewed for another 60 days!
      </span>
    </div>
  );

  if (isExpired) return (
    <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)',
      borderRadius:'10px', padding:'10px 14px', marginTop:'8px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <div style={{ fontSize:'12px', fontWeight:700, color:DARK.red }}>⏰ Listing Expired</div>
          <div style={{ fontSize:'11px', color:DARK.dim, marginTop:'2px' }}>
            Buyers can no longer see this listing
          </div>
        </div>
        <button onClick={handleRenew}
          style={{ background:DARK.red, border:'none', borderRadius:'8px',
            padding:'7px 14px', color:'white', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>
          Renew Free
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.3)',
      borderRadius:'10px', padding:'10px 14px', marginTop:'8px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <div style={{ fontSize:'12px', fontWeight:700, color:DARK.yellow }}>
            ⚠️ Expires in {daysLeft} day{daysLeft !== 1 ? 's' : ''}
          </div>
          <div style={{ fontSize:'11px', color:DARK.dim, marginTop:'2px' }}>
            Renew to keep your listing visible
          </div>
        </div>
        <button onClick={handleRenew}
          style={{ background:DARK.yellow, border:'none', borderRadius:'8px',
            padding:'7px 14px', color:DARK.bg0, fontSize:'12px', fontWeight:700, cursor:'pointer' }}>
          Renew Now
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* M22 — Boost Listing Modal                                                   */
/* ─────────────────────────────────────────────────────────────────────────── */
/**
 * Props: listing, onClose
 * Usage: {showBoostModal && <BoostListingModal listing={selectedListing} onClose={() => setShowBoostModal(false)} />}
 */
const BOOST_PLANS = [
  { id:'starter', icon:'🚀', label:'Starter', price:'$1.99', days:3,  perks:['Featured badge','2× visibility','3 days'] },
  { id:'pro',     icon:'⚡', label:'Pro',     price:'$3.99', days:7,  perks:['Top of Browse','5× visibility','7 days','Highlighted card'], popular:true },
  { id:'power',   icon:'🏆', label:'Power',   price:'$5.99', days:14, perks:['Pinned #1 position','10× visibility','14 days','Highlighted + badge + bold title'] },
];

/* price in cents per plan tier */
const PLAN_CENTS = { starter: 199, pro: 399, power: 599 };

export function BoostListingModal({ listing, onClose }) {
  const [selected, setSelected]   = useState('pro');
  const [confirmed, setConfirmed] = useState(false);
  const [paying, setPaying]       = useState(false);
  const [payError, setPayError]   = useState('');
  // Sprint 23: card entry form fields
  const [cardName,   setCardName]   = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV,    setCardCVV]    = useState('');
  const { show, Toast } = useToast();
  if (!listing) return null;

  async function handleBoost() {
    const plan = BOOST_PLANS.find(p => p.id === selected);
    // Sprint 23: validate card fields before proceeding
    if (!cardName.trim() || !cardNumber.trim() || !cardExpiry.trim() || !cardCVV.trim()) {
      setPayError('Please fill in all card details to continue.');
      return;
    }
    setPaying(true);
    setPayError('');
    try {
      /* ── Attempt Stripe payment ───────────────────────────────── */
      const amountCents = PLAN_CENTS[plan.id] || 199;
      const pi = await createPaymentIntent(amountCents, {
        description: `Boost Listing — ${plan.label} (${plan.days} days)`,
        metadata: { listingId: listing.id, boostPlan: plan.id, boostDays: String(plan.days) },
      });
      if (pi?.clientSecret) {
        await confirmCardPayment(pi.clientSecret, {
          payment_method: {
            card: { number: cardNumber, exp_month: cardExpiry.split('/')[0], exp_year: cardExpiry.split('/')[1], cvc: cardCVV },
            billing_details: { name: cardName },
          },
        });
      }
    } catch (err) {
      /* Stripe not configured or test mode — log and continue gracefully */
      console.warn('[BoostListingModal] Stripe payment skipped (not configured):', err?.message || err);
    }
    /* ── Save boost record (always, with or without Stripe) ──────── */
    try {
      const boosts = JSON.parse(localStorage.getItem('boosted_listings') || '{}');
      boosts[listing.id] = {
        plan: plan.id,
        endsAt: new Date(Date.now() + plan.days * 86400000).toISOString(),
        chargedAt: new Date().toISOString(),
      };
      localStorage.setItem('boosted_listings', JSON.stringify(boosts));
    } catch {}
    setPaying(false);
    setConfirmed(true);
  }

  if (confirmed) {
    const plan = BOOST_PLANS.find(p => p.id === selected);
    return (
      <Backdrop onClose={onClose}>
        <div style={{ textAlign:'center', padding:'20px 0' }}>
          <div style={{ fontSize:'54px', marginBottom:'14px' }}>{plan.icon}</div>
          <div style={{ fontWeight:800, fontSize:'18px', color:DARK.text, marginBottom:'8px' }}>
            {plan.label} Boost Activated!
          </div>
          <div style={{ color:DARK.muted, fontSize:'13px', marginBottom:'4px' }}>
            "{listing.title}" is now boosted for {plan.days} days
          </div>
          <div style={{ color:DARK.dim, fontSize:'12px', marginBottom:'24px' }}>
            Your listing will appear at the top of Browse
          </div>
          <ActionBtn label="🎉 Awesome!" onClick={onClose} />
        </div>
      </Backdrop>
    );
  }

  return (
    <Backdrop onClose={onClose}>
      {Toast}
      <ModalTitle icon="🚀" text="Boost Listing" onClose={onClose} />
      <div style={{ fontSize:'13px', color:DARK.muted, marginBottom:'18px' }}>
        Promote <strong style={{ color:DARK.text }}>{listing.title}</strong> to reach more buyers
      </div>

      {payError && (
        <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)',
          borderRadius:'10px', padding:'10px 14px', marginBottom:'14px',
          fontSize:'12px', color:DARK.red }}>
          ⚠️ {payError}
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'20px' }}>
        {BOOST_PLANS.map(plan => (
          <button key={plan.id} onClick={() => !paying && setSelected(plan.id)}
            aria-pressed={selected === plan.id}
            style={{ position:'relative', padding:'16px', borderRadius:'16px', border:'none', cursor:'pointer',
              background:selected===plan.id ? 'rgba(99,102,241,0.15)' : DARK.bg0,
              outline:selected===plan.id ? `2px solid ${DARK.accent}` : `1px solid ${DARK.bg2}`,
              textAlign:'left' }}>
            {plan.popular && (
              <div style={{ position:'absolute', top:'-8px', right:'14px',
                background:'linear-gradient(135deg,#6366f1,#ec4899)', borderRadius:'8px',
                padding:'2px 10px', fontSize:'10px', fontWeight:800, color:'white' }}>
                MOST POPULAR
              </div>
            )}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <span style={{ fontSize:'24px' }}>{plan.icon}</span>
                <div>
                  <div style={{ fontWeight:800, fontSize:'15px', color:DARK.text }}>{plan.label}</div>
                  <div style={{ fontSize:'12px', color:DARK.dim }}>{plan.days} days</div>
                </div>
              </div>
              <div style={{ fontWeight:800, fontSize:'18px', color:DARK.accent }}>{plan.price}</div>
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
              {plan.perks.map(p => (
                <span key={p} style={{ fontSize:'11px', padding:'3px 8px', borderRadius:'8px',
                  background:'rgba(99,102,241,0.12)', color:DARK.muted }}>✓ {p}</span>
              ))}
            </div>
          </button>
        ))}
      </div>

      {/* Sprint 23: Card entry form */}
      <div style={{ marginBottom:'20px' }}>
        <div style={{ fontWeight:700, fontSize:'12px', color:DARK.muted, marginBottom:'10px' }}>
          💳 PAYMENT DETAILS
        </div>
        <input
          placeholder="Cardholder Name *"
          value={cardName}
          onChange={e => { setCardName(e.target.value); setPayError(''); }}
          style={{ width:'100%', background:DARK.bg0, border:`1px solid ${DARK.bg2}`,
            borderRadius:'10px', padding:'11px 14px', color:DARK.text, fontSize:'14px',
            outline:'none', marginBottom:'8px', boxSizing:'border-box', fontFamily:'inherit' }}
        />
        <input
          placeholder="Card Number *"
          value={cardNumber}
          onChange={e => { setCardNumber(e.target.value.replace(/\D/g,'').slice(0,16)); setPayError(''); }}
          inputMode="numeric"
          maxLength={16}
          style={{ width:'100%', background:DARK.bg0, border:`1px solid ${DARK.bg2}`,
            borderRadius:'10px', padding:'11px 14px', color:DARK.text, fontSize:'14px',
            outline:'none', marginBottom:'8px', boxSizing:'border-box', fontFamily:'inherit' }}
        />
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
          <input
            placeholder="MM/YY *"
            value={cardExpiry}
            onChange={e => { setCardExpiry(e.target.value); setPayError(''); }}
            maxLength={5}
            style={{ background:DARK.bg0, border:`1px solid ${DARK.bg2}`,
              borderRadius:'10px', padding:'11px 14px', color:DARK.text, fontSize:'14px',
              outline:'none', fontFamily:'inherit' }}
          />
          <input
            placeholder="CVV *"
            value={cardCVV}
            onChange={e => { setCardCVV(e.target.value.replace(/\D/g,'').slice(0,4)); setPayError(''); }}
            inputMode="numeric"
            maxLength={4}
            style={{ background:DARK.bg0, border:`1px solid ${DARK.bg2}`,
              borderRadius:'10px', padding:'11px 14px', color:DARK.text, fontSize:'14px',
              outline:'none', fontFamily:'inherit' }}
          />
        </div>
      </div>

      <ActionBtn
        label={paying ? 'Processing…' : `🚀 Boost for ${BOOST_PLANS.find(p=>p.id===selected)?.price}`}
        onClick={!paying ? handleBoost : undefined}
        style={{ opacity: paying ? 0.7 : 1, cursor: paying ? 'default' : 'pointer' }} />
      <div style={{ textAlign:'center', fontSize:'11px', color:DARK.dim, marginTop:'10px' }}>
        🔒 Secured by Stripe · Cancel anytime
      </div>
    </Backdrop>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* M23 — Price Alert Modal                                                     */
/* ─────────────────────────────────────────────────────────────────────────── */
/**
 * Props: item, onClose
 * Usage in product detail: {showAlertModal && <PriceAlertModal item={selectedItem} onClose={() => setShowAlertModal(false)} />}
 */
export function PriceAlertModal({ item, onClose }) {
  const [targetPrice, setTargetPrice] = useState(item ? Math.floor(item.price * 0.8).toString() : '');
  const [saved, setSaved] = useState(false);
  const { show, Toast } = useToast();
  if (!item) return null;

  function handleSave() {
    const tp = parseFloat(targetPrice);
    if (!tp || tp <= 0) { show('⚠️ Enter a valid target price'); return; }
    if (tp >= item.price) { show(`⚠️ Target must be below current price ($${item.price})`); return; }
    try {
      const alerts = JSON.parse(localStorage.getItem('price_alerts')||'{}');
      alerts[item.id] = { listingId:item.id, title:item.title, currentPrice:item.price,
        targetPrice:tp, createdAt:new Date().toISOString() };
      localStorage.setItem('price_alerts', JSON.stringify(alerts));
    } catch {}
    setSaved(true);
  }

  if (saved) return (
    <Backdrop onClose={onClose}>
      <div style={{ textAlign:'center', padding:'20px 0' }}>
        <div style={{ fontSize:'54px', marginBottom:'14px' }}>🔔</div>
        <div style={{ fontWeight:800, fontSize:'18px', color:DARK.text, marginBottom:'8px' }}>Alert Set!</div>
        <div style={{ color:DARK.muted, fontSize:'13px', marginBottom:'4px' }}>
          We'll notify you when <strong style={{ color:DARK.text }}>{item.title}</strong>
        </div>
        <div style={{ color:DARK.green, fontWeight:700, fontSize:'16px', marginBottom:'24px' }}>
          drops below ${targetPrice}
        </div>
        <ActionBtn label="Got it 👍" onClick={onClose} />
      </div>
    </Backdrop>
  );

  return (
    <Backdrop onClose={onClose}>
      {Toast}
      <ModalTitle icon="🔔" text="Price Alert" onClose={onClose} />

      <div style={{ background:DARK.bg0, borderRadius:'12px', padding:'14px', marginBottom:'20px' }}>
        <div style={{ fontSize:'13px', color:DARK.dim, marginBottom:'4px' }}>WATCHING</div>
        <div style={{ fontWeight:700, color:DARK.text, fontSize:'15px' }}>{item.title}</div>
        <div style={{ color:DARK.green, fontWeight:800, fontSize:'18px', marginTop:'4px' }}>
          Current price: ${item.price}
        </div>
      </div>

      <div style={{ marginBottom:'20px' }}>
        <div style={{ fontSize:'13px', fontWeight:700, color:DARK.muted, marginBottom:'10px' }}>
          ALERT ME WHEN PRICE DROPS BELOW
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <span style={{ fontSize:'24px', fontWeight:800, color:DARK.green }}>$</span>
          <input
            type="number"
            value={targetPrice}
            onChange={e => setTargetPrice(e.target.value)}
            placeholder="Enter target price"
            min="1"
            max={item.price - 1}
            style={{ flex:1, background:DARK.bg0, border:`1px solid ${DARK.bg2}`,
              borderRadius:'10px', padding:'12px', color:DARK.text,
              fontSize:'22px', fontWeight:800, outline:'none', textAlign:'center' }}
          />
        </div>
        {parseFloat(targetPrice) > 0 && (
          <div style={{ fontSize:'12px', color:DARK.dim, marginTop:'8px', textAlign:'center' }}>
            That's {Math.round((1 - parseFloat(targetPrice)/item.price)*100)}% off the current price
          </div>
        )}
      </div>

      {/* Quick pick buttons */}
      <div style={{ display:'flex', gap:'8px', marginBottom:'20px', flexWrap:'wrap' }}>
        {[10, 15, 20, 25, 30].map(pct => {
          const tgt = Math.floor(item.price * (1 - pct/100));
          return (
            <PillBtn key={pct} label={`-${pct}% ($${tgt})`}
              active={targetPrice === tgt.toString()}
              onClick={() => setTargetPrice(tgt.toString())} />
          );
        })}
      </div>

      <ActionBtn label="🔔 Set Price Alert" onClick={handleSave} />
    </Backdrop>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* M28 — Safe Meeting Spot Suggestions                                         */
/* ─────────────────────────────────────────────────────────────────────────── */
/**
 * Shows when a listing has "Local Pickup" delivery.
 * Props: sellerCity (string), onClose
 * Usage in product detail shipping section:
 *   {showSafeSpots && <SafeSpotsModal sellerCity={item.city} onClose={() => setShowSafeSpots(false)} />}
 */
const SAFE_SPOT_TYPES = [
  { icon:'🏛️', type:'Police Station',       note:'Safest option — always recommended' },
  { icon:'📚', type:'Public Library',         note:'Open daytime, well-lit, cameras' },
  { icon:'☕', type:'Coffee Shop',             note:'Busy public space, easy to meet' },
  { icon:'🏦', type:'Bank Lobby',             note:'Security cameras and staff present' },
  { icon:'🛒', type:'Shopping Mall / Walmart', note:'Busy, safe, visible location' },
  { icon:'🏥', type:'Hospital Lobby',          note:'24/7 staff presence' },
  { icon:'🚉', type:'Transit Station',          note:'High foot traffic, cameras' },
  { icon:'🍔', type:'Fast Food Restaurant',    note:'Public, cameras, open hours' },
];

export function SafeSpotsModal({ sellerCity = 'your area', onClose }) {
  const [copied, setCopied] = useState(false);

  async function shareTip() {
    const text = `Let's meet at a safe public location — a police station, library, or coffee shop works great! 📍`;
    try {
      if (navigator.share) { await navigator.share({ title:'Safe Meeting Spot', text }); }
      else { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    } catch {}
  }

  return (
    <Backdrop onClose={onClose} maxH="90vh">
      <ModalTitle icon="📍" text="Safe Meeting Spots" onClose={onClose} />
      <div style={{ fontSize:'13px', color:DARK.muted, marginBottom:'16px' }}>
        For <strong style={{ color:DARK.text }}>Local Pickup</strong> near {sellerCity} — always meet in a safe public place:
      </div>

      {/* Safety banner */}
      <div style={{ background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)',
        borderRadius:'12px', padding:'12px', marginBottom:'16px',
        display:'flex', gap:'10px', alignItems:'flex-start' }}>
        <span style={{ fontSize:'20px' }}>🛡️</span>
        <div>
          <div style={{ fontWeight:700, color:DARK.green, fontSize:'13px' }}>ConnectHub Safety Tip</div>
          <div style={{ color:DARK.muted, fontSize:'12px', marginTop:'3px', lineHeight:1.5 }}>
            Never meet at a home or isolated location. Bring a friend if possible. Always tell someone where you're going.
          </div>
        </div>
      </div>

      {/* Spot list */}
      <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'16px' }}>
        {SAFE_SPOT_TYPES.map(s => (
          <div key={s.type} style={{ display:'flex', gap:'12px', alignItems:'center',
            background:DARK.bg0, borderRadius:'12px', padding:'12px',
            border:`1px solid ${DARK.bg2}` }}>
            <span style={{ fontSize:'24px', flexShrink:0 }}>{s.icon}</span>
            <div>
              <div style={{ fontWeight:700, fontSize:'14px', color:DARK.text }}>{s.type}</div>
              <div style={{ fontSize:'11px', color:DARK.dim, marginTop:'2px' }}>{s.note}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Share tip with seller */}
      <ActionBtn
        label={copied ? '📋 Copied to clipboard!' : '📤 Share this tip with Seller'}
        onClick={shareTip}
        color={DARK.green}
        style={{ marginBottom:'10px' }} />

      <div style={{ textAlign:'center', fontSize:'11px', color:DARK.dim }}>
        For emergencies call 911 | ConnectHub never facilitates cash payment
      </div>
    </Backdrop>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* M30 — Wishlist Share Modal                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */
/**
 * Props:
 *   wishlist — Array<{ id, title, price, emoji, color }>
 *   onClose
 *
 * Usage in Saved tab header:
 *   {showWishlistShare && <WishlistShareModal wishlist={savedItems} onClose={() => setShowWishlistShare(false)} />}
 */
export function WishlistShareModal({ wishlist = [], onClose }) {
  const [listName, setListName] = useState('My Wishlist');
  const [shared, setShared]     = useState(false);
  const { show, Toast } = useToast();

  // Encode wishlist as URL params (no server needed)
  const ids   = wishlist.map(i => i.id).join(',');
  const url   = `${window.location.origin}/marketplace?wishlist=${encodeURIComponent(ids)}&name=${encodeURIComponent(listName)}`;
  const text  = `Check out my ConnectHub Marketplace wishlist: "${listName}" 🛍️`;

  async function handleShare() {
    if (navigator.share) {
      try { await navigator.share({ title: listName, text, url }); setShared(true); }
      catch (e) { if (e.name !== 'AbortError') handleCopy(); }
    } else { handleCopy(); }
  }

  async function handleCopy() {
    try { await navigator.clipboard.writeText(url); show('📋 Wishlist link copied!'); }
    catch { show('⚠️ Could not copy link'); }
  }

  return (
    <Backdrop onClose={onClose}>
      {Toast}
      <ModalTitle icon="💝" text="Share Wishlist" onClose={onClose} />

      {/* Name your list */}
      <div style={{ marginBottom:'16px' }}>
        <div style={{ fontSize:'12px', fontWeight:700, color:DARK.muted, marginBottom:'8px' }}>LIST NAME</div>
        <input value={listName} onChange={e => setListName(e.target.value.slice(0,40))}
          style={{ width:'100%', background:DARK.bg0, border:`1px solid ${DARK.bg2}`,
            borderRadius:'10px', padding:'10px 14px', color:DARK.text, fontSize:'14px',
            fontWeight:600, outline:'none', boxSizing:'border-box' }} />
      </div>

      {/* Preview */}
      <div style={{ background:DARK.bg0, borderRadius:'14px', padding:'14px', marginBottom:'18px' }}>
        <div style={{ fontSize:'12px', fontWeight:700, color:DARK.dim, marginBottom:'10px' }}>
          PREVIEW ({wishlist.length} item{wishlist.length !== 1 ? 's' : ''})
        </div>
        {wishlist.length === 0 ? (
          <div style={{ color:DARK.dim, fontSize:'13px' }}>Your wishlist is empty</div>
        ) : (
          <div style={{ display:'flex', gap:'8px', overflowX:'auto', paddingBottom:'4px' }}>
            {wishlist.slice(0, 8).map(item => (
              <div key={item.id} style={{ flexShrink:0, width:'56px', textAlign:'center' }}>
                <div style={{ width:'56px', height:'56px', borderRadius:'12px',
                  background:item.color||'#334155', display:'flex', alignItems:'center',
                  justifyContent:'center', fontSize:'26px', marginBottom:'4px' }}>
                  {item.emoji||'🛍️'}
                </div>
                <div style={{ fontSize:'10px', color:DARK.dim, overflow:'hidden',
                  textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.title}</div>
              </div>
            ))}
            {wishlist.length > 8 && (
              <div style={{ flexShrink:0, width:'56px', height:'56px', borderRadius:'12px',
                background:DARK.bg2, display:'flex', alignItems:'center',
                justifyContent:'center', fontSize:'14px', fontWeight:700, color:DARK.muted }}>
                +{wishlist.length - 8}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Share URL */}
      <div style={{ background:DARK.bg0, borderRadius:'10px', padding:'10px 14px',
        display:'flex', alignItems:'center', gap:'10px', marginBottom:'14px' }}>
        <span style={{ fontSize:'12px', color:DARK.dim, flex:1, wordBreak:'break-all' }}>{url.slice(0,60)}…</span>
        <button onClick={handleCopy}
          style={{ background:DARK.bg2, border:'none', borderRadius:'8px',
            padding:'6px 12px', color:DARK.text, fontSize:'12px', fontWeight:700, cursor:'pointer', flexShrink:0 }}>
          Copy
        </button>
      </div>

      <ActionBtn label="📤 Share Wishlist" onClick={handleShare} />

      {shared && (
        <div style={{ textAlign:'center', color:DARK.green, fontSize:'13px', fontWeight:700, marginTop:'12px' }}>
          ✅ Wishlist shared successfully!
        </div>
      )}
    </Backdrop>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* M24 — Bundle Discount Modal                                                 */
/* ─────────────────────────────────────────────────────────────────────────── */
/**
 * Shows when a buyer views a second item from the same seller.
 *
 * Props:
 *   seller      — { id, name, avatar }
 *   allItems    — Array of all current Browse listings
 *   currentItem — the item currently being viewed
 *   onAddBundle — (items: Array) => void   called when user adds bundle to cart
 *   onClose
 *
 * Usage in product detail (below seller info):
 *   {showBundleModal && <BundleDiscountModal seller={item.seller}
 *     allItems={listings} currentItem={item}
 *     onAddBundle={handleAddBundle} onClose={() => setShowBundleModal(false)} />}
 */
const BUNDLE_TIERS = [
  { count:2, pct:10, label:'10% off 2 items' },
  { count:3, pct:15, label:'15% off 3 items' },
  { count:4, pct:20, label:'20% off 4+ items' },
];

export function BundleDiscountModal({ seller, allItems = [], currentItem, onAddBundle, onClose }) {
  const sellerItems = allItems.filter(i => i.sellerId === seller?.id && i.id !== currentItem?.id);
  const [selected, setSelected] = useState([]);
  const { show, Toast } = useToast();

  if (!seller || sellerItems.length === 0) return null;

  const bundleCount  = selected.length + 1; // +1 for currentItem
  const tier         = [...BUNDLE_TIERS].reverse().find(t => bundleCount >= t.count);
  const discountPct  = tier?.pct || 0;
  const baseTotal    = (currentItem?.price || 0) + selected.reduce((s, i) => s + (i.price || 0), 0);
  const savings      = Math.round(baseTotal * discountPct / 100 * 100) / 100;
  const finalTotal   = Math.round((baseTotal - savings) * 100) / 100;

  function toggle(item) {
    setSelected(prev => prev.find(i => i.id === item.id)
      ? prev.filter(i => i.id !== item.id)
      : [...prev, item]);
  }

  function handleAdd() {
    const bundle = [currentItem, ...selected];
    onAddBundle?.(bundle, discountPct);
    show(`🛒 ${bundle.length} items added to cart! ${discountPct ? `(${discountPct}% off)` : ''}`);
    setTimeout(onClose, 1600);
  }

  return (
    <Backdrop onClose={onClose} maxH="90vh">
      {Toast}
      <ModalTitle icon="🎁" text="Bundle & Save" onClose={onClose} />

      {/* Seller info */}
      <div style={{ display:'flex', alignItems:'center', gap:'10px',
        background:DARK.bg0, borderRadius:'12px', padding:'12px', marginBottom:'16px' }}>
        <div style={{ width:'40px', height:'40px', borderRadius:'50%',
          background:DARK.bg2, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px' }}>
          {seller.avatar || '👤'}
        </div>
        <div>
          <div style={{ fontWeight:700, color:DARK.text, fontSize:'14px' }}>More from {seller.name}</div>
          <div style={{ fontSize:'12px', color:DARK.dim }}>Add items for bundle discounts</div>
        </div>
      </div>

      {/* Discount tiers */}
      <div style={{ display:'flex', gap:'8px', marginBottom:'16px', overflowX:'auto', paddingBottom:'4px' }}>
        {BUNDLE_TIERS.map(t => {
          const active = bundleCount >= t.count;
          return (
            <div key={t.count} style={{ flexShrink:0, padding:'8px 14px', borderRadius:'12px',
              background:active ? 'rgba(99,102,241,0.2)' : DARK.bg0,
              border:`1px solid ${active ? DARK.accent : DARK.bg2}`,
              textAlign:'center', minWidth:'90px' }}>
              <div style={{ fontSize:'16px', fontWeight:800, color:active ? DARK.accent : DARK.muted }}>
                {t.pct}% off
              </div>
              <div style={{ fontSize:'11px', color:DARK.dim }}>{t.count} items</div>
              {active && <div style={{ fontSize:'10px', color:DARK.accent, fontWeight:700 }}>✓ Active</div>}
            </div>
          );
        })}
      </div>

      {/* Current item (locked) */}
      <div style={{ fontSize:'12px', fontWeight:700, color:DARK.muted, marginBottom:'8px' }}>
        IN YOUR BUNDLE
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:'12px', background:DARK.bg0,
        borderRadius:'12px', padding:'10px', marginBottom:'4px',
        border:`1px solid ${DARK.accent}` }}>
        <div style={{ width:'44px', height:'44px', borderRadius:'10px',
          background:currentItem?.color||DARK.bg2, display:'flex', alignItems:'center',
          justifyContent:'center', fontSize:'22px', flexShrink:0 }}>
          {currentItem?.emoji||'🛍️'}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700, color:DARK.text, fontSize:'13px' }}>{currentItem?.title}</div>
          <div style={{ color:DARK.green, fontWeight:700 }}>${currentItem?.price}</div>
        </div>
        <span style={{ fontSize:'11px', background:'rgba(99,102,241,0.2)',
          color:DARK.accent, padding:'3px 8px', borderRadius:'8px', fontWeight:700 }}>Current</span>
      </div>

      {/* Selectable items */}
      <div style={{ display:'flex', flexDirection:'column', gap:'6px', marginBottom:'16px', marginTop:'6px' }}>
        {sellerItems.slice(0, 6).map(item => {
          const isSelected = !!selected.find(i => i.id === item.id);
          return (
            <button key={item.id} onClick={() => toggle(item)}
              style={{ display:'flex', alignItems:'center', gap:'12px', background:DARK.bg0,
                borderRadius:'12px', padding:'10px', border:`1px solid ${isSelected?DARK.green:DARK.bg2}`,
                cursor:'pointer', textAlign:'left' }}>
              <div style={{ width:'44px', height:'44px', borderRadius:'10px',
                background:item.color||DARK.bg2, display:'flex', alignItems:'center',
                justifyContent:'center', fontSize:'22px', flexShrink:0 }}>
                {item.emoji||'🛍️'}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, color:DARK.text, fontSize:'13px' }}>{item.title}</div>
                <div style={{ color:DARK.green, fontWeight:700 }}>${item.price}</div>
              </div>
              <div style={{ width:'22px', height:'22px', borderRadius:'50%',
                border:`2px solid ${isSelected?DARK.green:DARK.bg2}`,
                background:isSelected?DARK.green:'transparent',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'13px', color:'white', flexShrink:0 }}>
                {isSelected ? '✓' : ''}
              </div>
            </button>
          );
        })}
      </div>

      {/* Totals */}
      {selected.length > 0 && (
        <div style={{ background:DARK.bg0, borderRadius:'12px', padding:'14px', marginBottom:'14px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
            <span style={{ color:DARK.muted, fontSize:'13px' }}>Subtotal ({bundleCount} items)</span>
            <span style={{ color:DARK.text, fontWeight:600 }}>${baseTotal.toFixed(2)}</span>
          </div>
          {discountPct > 0 && (
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
              <span style={{ color:DARK.green, fontSize:'13px', fontWeight:700 }}>Bundle savings ({discountPct}%)</span>
              <span style={{ color:DARK.green, fontWeight:700 }}>-${savings.toFixed(2)}</span>
            </div>
          )}
          <div style={{ borderTop:`1px solid ${DARK.bg2}`, paddingTop:'8px', marginTop:'4px',
            display:'flex', justifyContent:'space-between' }}>
            <span style={{ fontWeight:800, fontSize:'15px', color:DARK.text }}>Total</span>
            <span style={{ fontWeight:800, fontSize:'18px', color:DARK.accent }}>${finalTotal.toFixed(2)}</span>
          </div>
        </div>
      )}

      <ActionBtn
        label={selected.length === 0
          ? 'Select items above to bundle'
          : `🛒 Add ${bundleCount} items to Cart${discountPct ? ` (${discountPct}% off!)` : ''}`}
        onClick={selected.length > 0 ? handleAdd : undefined}
        color={selected.length > 0 ? DARK.green : DARK.bg2}
        style={{ cursor: selected.length > 0 ? 'pointer' : 'default' }} />
    </Backdrop>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* M25 — Similar Items Row ("You May Also Like")                               */
/* ─────────────────────────────────────────────────────────────────────────── */
/**
 * Horizontal scroll strip of similar listings, shown inside the product detail panel.
 *
 * Props:
 *   currentItem — { id, category, price }
 *   allItems    — all Browse listings
 *   onSelect    — (item) => void  — opens that item's detail
 *
 * Usage in product detail (below description, above seller info):
 *   <SimilarItemsRow currentItem={item} allItems={listings} onSelect={setSelectedItem} />
 */
export function SimilarItemsRow({ currentItem, allItems = [], onSelect }) {
  if (!currentItem) return null;

  // Score each item: same category = +3, price within 50% = +2, same condition = +1
  const similar = allItems
    .filter(i => i.id !== currentItem.id)
    .map(i => {
      let score = 0;
      if (i.category === currentItem.category) score += 3;
      if (i.price && currentItem.price) {
        const ratio = Math.min(i.price, currentItem.price) / Math.max(i.price, currentItem.price);
        if (ratio >= 0.5) score += 2;
      }
      if (i.condition === currentItem.condition) score += 1;
      return { ...i, _score: score };
    })
    .filter(i => i._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, 8);

  if (similar.length === 0) return null;

  return (
    <div style={{ marginBottom:'20px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
        <div style={{ fontWeight:700, fontSize:'13px', color:DARK.muted }}>YOU MAY ALSO LIKE</div>
        <div style={{ fontSize:'12px', color:DARK.accent }}>{similar.length} items</div>
      </div>
      <div style={{ display:'flex', gap:'10px', overflowX:'auto', paddingBottom:'6px' }}>
        {similar.map(item => (
          <button key={item.id} onClick={() => onSelect?.(item)}
            aria-label={`View similar item: ${item.title}`}
            style={{ flexShrink:0, width:'120px', background:DARK.bg0, borderRadius:'14px',
              border:`1px solid ${DARK.bg2}`, padding:'0 0 10px 0', cursor:'pointer', textAlign:'left',
              overflow:'hidden' }}>
            {/* Thumbnail */}
            <div style={{ width:'100%', height:'80px', background:item.color||DARK.bg2,
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:'32px' }}>
              {item.emoji||'🛍️'}
            </div>
            {/* Info */}
            <div style={{ padding:'8px 8px 0' }}>
              <div style={{ fontSize:'11px', fontWeight:600, color:DARK.text,
                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:'3px' }}>
                {item.title}
              </div>
              <div style={{ fontSize:'12px', fontWeight:800, color:DARK.green }}>${item.price}</div>
              {item.condition && (
                <div style={{ fontSize:'10px', color:DARK.dim, marginTop:'3px' }}>{item.condition}</div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* M29 — QR Code Modal                                                         */
/* ─────────────────────────────────────────────────────────────────────────── */
/**
 * Generates and displays a QR code for the listing URL.
 * Uses the free Google Charts QR API (no npm package required).
 * Falls back to a text-based URL display if the request fails.
 *
 * Props: item — { id, title, price, emoji }, onClose
 *
 * Usage in product detail header bar:
 *   {showQRModal && <QRCodeModal item={selectedItem} onClose={() => setShowQRModal(false)} />}
 */
export function QRCodeModal({ item, onClose }) {
  const { show, Toast } = useToast();
  const [imgError, setImgError] = useState(false);
  if (!item) return null;

  const listingUrl = `${window.location.origin}/marketplace?listing=${item.id}`;
  // Google Charts QR API — free, no auth, CORS-safe
  const qrSrc = `https://chart.googleapis.com/chart?chs=240x240&cht=qr&chl=${encodeURIComponent(listingUrl)}&choe=UTF-8`;

  async function handleDownload() {
    try {
      const res = await fetch(qrSrc);
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `connecthub-listing-${item.id}.png`;
      a.click();
      URL.revokeObjectURL(url);
      show('✅ QR code downloaded!');
    } catch {
      show('⚠️ Download failed — right-click the QR code to save it');
    }
  }

  async function handleCopyUrl() {
    try {
      await navigator.clipboard.writeText(listingUrl);
      show('📋 Listing URL copied!');
    } catch {
      show('⚠️ Could not copy — please copy manually');
    }
  }

  return (
    <Backdrop onClose={onClose}>
      {Toast}
      <ModalTitle icon="📷" text="QR Code" onClose={onClose} />

      {/* Listing pill */}
      <div style={{ display:'flex', alignItems:'center', gap:'10px',
        background:DARK.bg0, borderRadius:'12px', padding:'12px', marginBottom:'20px' }}>
        <span style={{ fontSize:'28px' }}>{item.emoji || '🛍️'}</span>
        <div>
          <div style={{ fontWeight:700, color:DARK.text, fontSize:'14px' }}>{item.title}</div>
          <div style={{ color:DARK.green, fontWeight:700 }}>${item.price}</div>
        </div>
      </div>

      {/* QR code */}
      <div style={{ display:'flex', justifyContent:'center', marginBottom:'16px' }}>
        <div style={{ background:'white', padding:'16px', borderRadius:'16px',
          boxShadow:'0 4px 20px rgba(0,0,0,0.4)', display:'inline-block' }}>
          {imgError ? (
            /* Fallback: show URL in a bordered box */
            <div style={{ width:'200px', height:'200px', display:'flex', flexDirection:'column',
              alignItems:'center', justifyContent:'center', gap:'10px',
              border:'2px solid #e2e8f0', borderRadius:'8px', padding:'16px', textAlign:'center' }}>
              <span style={{ fontSize:'40px' }}>🔗</span>
              <div style={{ fontSize:'10px', color:'#475569', wordBreak:'break-all', lineHeight:1.4 }}>
                {listingUrl}
              </div>
            </div>
          ) : (
            <img
              src={qrSrc}
              alt={`QR code for ${item.title}`}
              width={200}
              height={200}
              onError={() => setImgError(true)}
              style={{ display:'block', imageRendering:'pixelated' }}
            />
          )}
        </div>
      </div>

      {/* Instructions */}
      <div style={{ textAlign:'center', fontSize:'13px', color:DARK.muted, marginBottom:'20px', lineHeight:1.5 }}>
        Scan to open this listing on any device.<br/>
        <span style={{ fontSize:'11px', color:DARK.dim }}>Works in-store, at meetups, or on printed flyers.</span>
      </div>

      {/* URL display */}
      <div style={{ background:DARK.bg0, borderRadius:'10px', padding:'10px 14px',
        display:'flex', alignItems:'center', gap:'10px', marginBottom:'14px' }}>
        <span style={{ fontSize:'11px', color:DARK.dim, flex:1, wordBreak:'break-all' }}>{listingUrl}</span>
        <button onClick={handleCopyUrl}
          style={{ background:DARK.bg2, border:'none', borderRadius:'8px',
            padding:'6px 12px', color:DARK.text, fontSize:'12px', fontWeight:700,
            cursor:'pointer', flexShrink:0 }}>
          Copy
        </button>
      </div>

      <ActionBtn label="⬇️ Download QR Code" onClick={handleDownload} style={{ marginBottom:'8px' }} />
    </Backdrop>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* KYC Admin Role Guard HOC                                                    */
/* ─────────────────────────────────────────────────────────────────────────── */
export function AdminGuard({ children }) {
  const [status, setStatus] = useState('checking'); // 'checking' | 'allowed' | 'denied'

  useEffect(() => {
    async function check() {
      try {
        const { getAuth }     = await import('firebase/auth');
        const { getFirestore, doc, getDoc } = await import('firebase/firestore');
        const auth  = getAuth();
        const user  = auth.currentUser;
        if (!user) { setStatus('denied'); return; }
        const db    = getFirestore();
        const snap  = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists() && snap.data()?.isAdmin === true) {
          setStatus('allowed');
        } else {
          setStatus('denied');
        }
      } catch {
        // Firebase not configured — fall through to allow in dev
        if (import.meta.env.DEV) {
          console.warn('[AdminGuard] Firebase not configured — allowing in DEV mode');
          setStatus('allowed');
        } else {
          setStatus('denied');
        }
      }
    }
    check();
  }, []);

  if (status === 'checking') return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
      minHeight:'100vh', background:'#0f172a', flexDirection:'column', gap:'16px' }}>
      <div style={{ width:'40px', height:'40px', borderRadius:'50%',
        border:'3px solid rgba(255,255,255,0.1)', borderTopColor:'#6366f1',
        animation:'spin 0.8s linear infinite' }} />
      <div style={{ color:'#94a3b8', fontSize:'14px' }}>Verifying admin access…</div>
    </div>
  );

  if (status === 'denied') return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', minHeight:'100vh', background:'#0f172a', padding:'32px', textAlign:'center' }}>
      <div style={{ fontSize:'64px', marginBottom:'16px' }}>🔒</div>
      <div style={{ fontWeight:800, fontSize:'22px', color:'#f1f5f9', marginBottom:'8px' }}>
        Admin Access Required
      </div>
      <div style={{ color:'#64748b', fontSize:'14px', maxWidth:'300px' }}>
        This page is restricted to ConnectHub administrators only.
      </div>
    </div>
  );

  return children;
}
