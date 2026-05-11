// LiveMonetizationPage.jsx — /live/monetization
// FIXES: BUG-M01 (payout balance+withdraw CTA), BUG-M02 (price validation),
//        BUG-M04 (revenue split visible), MISS-M01 (payout history),
//        MISS-M02 (earnings forecast)
// NOTE: BUG-M03 (Stripe Connect) and MISS-M03 (Tax info) require backend
//       Stripe API credentials — marked as NEEDS_BACKEND below.

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  doc, getDoc, setDoc, collection, query, where,
  orderBy, limit, getDocs, serverTimestamp, addDoc,
} from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import useAppStore from '@store/useAppStore';

const PLATFORM_TAKE = 0.30; // 30% platform fee
const CREATOR_SHARE = 1 - PLATFORM_TAKE; // 70%

export default function LiveMonetizationPage() {
  const navigate  = useNavigate();
  const showToast = useAppStore(s => s.showToast);
  const uid       = auth.currentUser?.uid;

  const [settings,     setSettings]     = useState({ giftsEnabled: true, subsEnabled: false, subPrice: 4.99, stickersEnabled: false });
  const [balance,      setBalance]      = useState(0);
  const [totalEarned,  setTotalEarned]  = useState(0);
  const [payoutHistory,setPayoutHistory]= useState([]);
  const [subscribers,  setSubscribers]  = useState(0);
  const [avgGifts,     setAvgGifts]     = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [withdrawing,  setWithdrawing]  = useState(false);
  const [priceErr,     setPriceErr]     = useState('');
  const [showStripe,   setShowStripe]   = useState(false);

  useEffect(() => {
    if (!uid) return;
    (async () => {
      try {
        // Load settings
        const sSnap = await getDoc(doc(db, 'monetizationSettings', uid)).catch(() => null);
        if (sSnap?.exists()) setSettings(prev => ({ ...prev, ...sSnap.data() }));

        // Load gift revenue (BUG-M01: real balance)
        const gQ = query(collection(db, 'gifts'), where('streamerId', '==', uid), limit(500));
        const gSnap = await getDocs(gQ).catch(() => ({ docs:[] }));
        const rawRevenue = gSnap.docs.reduce((s, d) => s + (d.data().coins || 0) * 0.01, 0);
        const creatorRev = rawRevenue * CREATOR_SHARE;
        setTotalEarned(creatorRev);

        // Subtract paid-out amounts
        const pQ = query(
          collection(db, 'payouts', uid, 'history'),
          orderBy('createdAt', 'desc'), limit(20)
        );
        const pSnap = await getDocs(pQ).catch(() => ({ docs:[] }));
        const history = pSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setPayoutHistory(history);
        const paidOut = history.filter(p => p.status === 'completed').reduce((s, p) => s + (p.amount || 0), 0);
        setBalance(Math.max(0, creatorRev - paidOut));

        // Subscriber count
        const subQ = query(collection(db, 'subscriptions'), where('streamerId', '==', uid), where('status', '==', 'active'), limit(500));
        const subSnap = await getDocs(subQ).catch(() => ({ docs:[] }));
        setSubscribers(subSnap.docs.length);

        // Average gifts per stream
        const sessQ = query(collection(db, 'streamHistory', uid, 'sessions'), orderBy('endedAt', 'desc'), limit(10));
        const sessSnap = await getDocs(sessQ).catch(() => ({ docs:[] }));
        const sessions = sessSnap.docs.map(d => d.data());
        if (sessions.length > 0) {
          const avg = sessions.reduce((s, sess) => s + (sess.giftRevenue || 0), 0) / sessions.length * CREATOR_SHARE * 0.01;
          setAvgGifts(avg);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [uid]);

  const saveSettings = useCallback(async () => {
    if (settings.subsEnabled) {
      // BUG-M02: Validate price
      const p = parseFloat(settings.subPrice);
      if (isNaN(p) || p < 0.99) { setPriceErr('Minimum price is $0.99'); return; }
      if (p > 499.99) { setPriceErr('Maximum price is $499.99'); return; }
    }
    setPriceErr('');
    setSaving(true);
    try {
      await setDoc(doc(db, 'monetizationSettings', uid), { ...settings, updatedAt: serverTimestamp() }, { merge: true });
      showToast('✓ Settings saved');
    } catch { showToast('Failed to save'); }
    finally { setSaving(false); }
  }, [settings, uid, showToast]);

  // BUG-M01: Request payout (NEEDS_BACKEND: actual Stripe payout requires server)
  const requestWithdraw = useCallback(async () => {
    if (balance < 10) { showToast('Minimum withdrawal is $10.00'); return; }
    setWithdrawing(true);
    try {
      await addDoc(collection(db, 'payouts', uid, 'history'), {
        amount: balance,
        status: 'pending',
        createdAt: serverTimestamp(),
        note: 'Payout requested — pending Stripe Connect setup',
      });
      showToast('💰 Payout requested! Set up bank account below to receive funds.');
      setPayoutHistory(prev => [{ id: Date.now(), amount: balance, status:'pending', createdAt:{ toDate:()=>new Date() } }, ...prev]);
      setBalance(0);
    } catch { showToast('Failed to request payout'); }
    finally { setWithdrawing(false); }
  }, [balance, uid, showToast]);

  // MISS-M02: Earnings forecast
  const monthlyForecast = (subscribers * settings.subPrice * CREATOR_SHARE) + (avgGifts * 4);

  const fmt$ = n => `$${(n||0).toFixed(2)}`;

  return (
    <div style={{ background:'#0a0a18', minHeight:'100vh', paddingBottom:'80px' }}>
      {/* Header */}
      <div style={{ padding:'12px 16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', gap:'10px' }}>
        <button onClick={() => navigate(-1)} style={{ background:'none', border:'none', color:'#94a3b8', fontSize:'20px', cursor:'pointer' }}>←</button>
        <span style={{ fontSize:'16px', fontWeight:800, color:'#f1f5f9', flex:1 }}>💰 Monetization</span>
      </div>

      {loading ? (
        <div style={{ padding:'32px', textAlign:'center', color:'#64748b' }}>Loading…</div>
      ) : (
        <div style={{ padding:'12px 16px', display:'flex', flexDirection:'column', gap:'14px' }}>

          {/* BUG-M01: Real balance + withdraw CTA */}
          <div style={{ background:'linear-gradient(135deg,rgba(74,222,128,0.1),rgba(245,158,11,0.1))', borderRadius:'16px', padding:'16px', border:'1px solid rgba(74,222,128,0.2)' }}>
            <div style={{ fontSize:'11px', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'4px' }}>Available Balance</div>
            <div style={{ color:'#4ade80', fontWeight:900, fontSize:'32px', marginBottom:'4px' }}>{fmt$(balance)}</div>
            <div style={{ color:'#94a3b8', fontSize:'12px', marginBottom:'12px' }}>
              Total earned: {fmt$(totalEarned)} · Platform fee: {(PLATFORM_TAKE*100).toFixed(0)}%
            </div>
            <div style={{ display:'flex', gap:'8px' }}>
              <button onClick={requestWithdraw} disabled={withdrawing || balance < 10}
                style={{ flex:2, background: balance >= 10 ? 'linear-gradient(135deg,#4ade80,#22d3ee)' : '#334155',
                  border:'none', borderRadius:'10px', padding:'10px', color: balance >= 10 ? '#0f172a' : '#64748b',
                  fontWeight:700, fontSize:'13px', cursor: balance >= 10 ? 'pointer' : 'not-allowed' }}>
                {withdrawing ? '…' : '⬇️ Withdraw'}
              </button>
              {/* BUG-M03 NEEDS_BACKEND: Stripe Connect */}
              <button onClick={() => setShowStripe(v => !v)}
                style={{ flex:1, background:'#1e293b', border:'1px solid #4ade80', borderRadius:'10px',
                  padding:'10px', color:'#4ade80', fontWeight:700, fontSize:'12px', cursor:'pointer' }}>
                🏦 Bank
              </button>
            </div>
            {balance < 10 && <div style={{ color:'#64748b', fontSize:'11px', marginTop:'6px' }}>Minimum withdrawal: $10.00</div>}
          </div>

          {/* Stripe Connect placeholder (BUG-M03 NEEDS_BACKEND) */}
          {showStripe && (
            <div style={{ background:'#1e293b', borderRadius:'14px', padding:'14px', border:'1px solid #334155' }}>
              <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'14px', marginBottom:'6px' }}>🏦 Connect Bank Account</div>
              <div style={{ color:'#94a3b8', fontSize:'12px', marginBottom:'12px' }}>
                Payouts are processed via Stripe Connect. Complete onboarding to receive funds directly to your bank account.
              </div>
              <div style={{ background:'#0f172a', borderRadius:'10px', padding:'10px', border:'1px solid #ef4444', color:'#f87171', fontSize:'12px' }}>
                ⚠️ <strong>Action required:</strong> Stripe Connect onboarding must be completed server-side. Contact support to set up your payout account.
              </div>
              {/* MISS-M03 NEEDS_BACKEND: Tax form */}
              <div style={{ marginTop:'10px', color:'#94a3b8', fontSize:'12px' }}>
                📄 <strong>Tax information (W-9/VAT)</strong> is required before first payout. Contact support to submit your tax details.
              </div>
            </div>
          )}

          {/* BUG-M04: Revenue split visible */}
          <div style={{ background:'#1e293b', borderRadius:'14px', padding:'14px', border:'1px solid #334155' }}>
            <div style={{ fontSize:'11px', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'10px' }}>
              Revenue Split
            </div>
            <div style={{ display:'flex', gap:'8px', marginBottom:'8px' }}>
              <div style={{ flex:7, background:'linear-gradient(135deg,#4ade80,#22d3ee)', borderRadius:'6px', padding:'8px', textAlign:'center' }}>
                <div style={{ color:'#0f172a', fontWeight:800, fontSize:'18px' }}>70%</div>
                <div style={{ color:'#0f172a', fontSize:'11px' }}>Creator</div>
              </div>
              <div style={{ flex:3, background:'#334155', borderRadius:'6px', padding:'8px', textAlign:'center' }}>
                <div style={{ color:'#94a3b8', fontWeight:800, fontSize:'18px' }}>30%</div>
                <div style={{ color:'#94a3b8', fontSize:'11px' }}>Platform</div>
              </div>
            </div>
            <div style={{ color:'#64748b', fontSize:'11px' }}>Applies to gifts, stickers, and subscription revenue.</div>
          </div>

          {/* MISS-M02: Earnings forecast */}
          <div style={{ background:'#1e293b', borderRadius:'14px', padding:'14px', border:'1px solid #334155' }}>
            <div style={{ fontSize:'11px', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'8px' }}>
              📈 Monthly Forecast
            </div>
            <div style={{ color:'#f59e0b', fontWeight:800, fontSize:'24px', marginBottom:'4px' }}>{fmt$(monthlyForecast)}</div>
            <div style={{ color:'#64748b', fontSize:'11px' }}>
              Based on {subscribers} active subscribers × {fmt$(settings.subPrice * CREATOR_SHARE)}/mo + {fmt$(avgGifts * 4)} avg gifts/mo
            </div>
          </div>

          {/* Gift settings */}
          <div style={{ background:'#1e293b', borderRadius:'14px', padding:'14px', border:'1px solid #334155' }}>
            <div style={{ fontSize:'11px', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'12px' }}>Gift Settings</div>
            {[
              { key:'giftsEnabled', label:'🎁 Allow Gifts', desc:'Viewers can send gift coins during live streams' },
              { key:'stickersEnabled', label:'🎨 Paid Sticker Packs', desc:'Premium animated stickers for viewers' },
            ].map(({ key, label, desc }) => (
              <div key={key} style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px' }}>
                <div style={{ flex:1 }}>
                  <div style={{ color:'#f1f5f9', fontWeight:600, fontSize:'13px' }}>{label}</div>
                  <div style={{ color:'#64748b', fontSize:'11px' }}>{desc}</div>
                </div>
                <button onClick={() => setSettings(s => ({ ...s, [key]: !s[key] }))}
                  role="switch" aria-checked={settings[key]}
                  style={{ width:'44px', height:'24px', borderRadius:'12px', border:'none', cursor:'pointer',
                    background: settings[key] ? '#ef4444' : '#334155', position:'relative', flexShrink:0 }}>
                  <div style={{ position:'absolute', top:'3px', left: settings[key] ? '23px' : '3px',
                    width:'18px', height:'18px', borderRadius:'50%', background:'white', transition:'left 0.15s' }} />
                </button>
              </div>
            ))}
          </div>

          {/* Subscription tier */}
          <div style={{ background:'#1e293b', borderRadius:'14px', padding:'14px', border:'1px solid #334155' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px' }}>
              <div style={{ flex:1 }}>
                <div style={{ color:'#f1f5f9', fontWeight:600, fontSize:'13px' }}>🌟 Subscriptions</div>
                <div style={{ color:'#64748b', fontSize:'11px' }}>Monthly paid subscription for your fans</div>
              </div>
              <button onClick={() => setSettings(s => ({ ...s, subsEnabled: !s.subsEnabled }))}
                role="switch" aria-checked={settings.subsEnabled}
                style={{ width:'44px', height:'24px', borderRadius:'12px', border:'none', cursor:'pointer',
                  background: settings.subsEnabled ? '#ef4444' : '#334155', position:'relative', flexShrink:0 }}>
                <div style={{ position:'absolute', top:'3px', left: settings.subsEnabled ? '23px' : '3px',
                  width:'18px', height:'18px', borderRadius:'50%', background:'white', transition:'left 0.15s' }} />
              </button>
            </div>
            {settings.subsEnabled && (
              <div>
                <label style={{ color:'#94a3b8', fontSize:'12px', display:'block', marginBottom:'4px' }}>Monthly Price (USD)</label>
                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <span style={{ color:'#f1f5f9', fontSize:'18px' }}>$</span>
                  {/* BUG-M02: Validated price input */}
                  <input type="number" min="0.99" max="499.99" step="0.01"
                    value={settings.subPrice}
                    onChange={e => { setSettings(s => ({ ...s, subPrice: e.target.value })); setPriceErr(''); }}
                    style={{ flex:1, background:'#0f172a', border:`1px solid ${priceErr ? '#ef4444' : '#334155'}`, borderRadius:'8px',
                      padding:'8px 12px', color:'#f1f5f9', fontSize:'16px', outline:'none' }} />
                </div>
                {priceErr && <div style={{ color:'#f87171', fontSize:'11px', marginTop:'4px' }}>{priceErr}</div>}
                <div style={{ color:'#64748b', fontSize:'11px', marginTop:'4px' }}>
                  You earn {fmt$(settings.subPrice * CREATOR_SHARE)}/subscriber/month
                </div>
              </div>
            )}
          </div>

          <button onClick={saveSettings} disabled={saving}
            style={{ background:'linear-gradient(135deg,#ef4444,#f59e0b)', border:'none', borderRadius:'12px',
              padding:'14px', color:'white', fontWeight:700, fontSize:'14px', cursor:'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving…' : '✓ Save Settings'}
          </button>

          {/* MISS-M01: Payout history */}
          {payoutHistory.length > 0 && (
            <div style={{ background:'#1e293b', borderRadius:'14px', padding:'14px', border:'1px solid #334155' }}>
              <div style={{ fontSize:'11px', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'10px' }}>
                📋 Payout History
              </div>
              {payoutHistory.slice(0, 10).map(p => (
                <div key={p.id} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 0', borderBottom:'1px solid #334155' }}>
                  <div style={{ width:'8px', height:'8px', borderRadius:'50%', flexShrink:0,
                    background: p.status === 'completed' ? '#4ade80' : p.status === 'pending' ? '#f59e0b' : '#f87171' }} />
                  <div style={{ flex:1 }}>
                    <div style={{ color:'#f1f5f9', fontSize:'13px', fontWeight:600 }}>{fmt$(p.amount)}</div>
                    <div style={{ color:'#64748b', fontSize:'11px' }}>
                      {p.createdAt?.toDate ? p.createdAt.toDate().toLocaleDateString() : 'Pending'}
                    </div>
                  </div>
                  <div style={{ color: p.status === 'completed' ? '#4ade80' : p.status === 'pending' ? '#f59e0b' : '#f87171',
                    fontSize:'11px', fontWeight:600, textTransform:'capitalize' }}>
                    {p.status}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
