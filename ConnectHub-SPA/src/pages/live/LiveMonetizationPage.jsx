// LiveMonetizationPage.jsx
// UX-37: Gift leaderboard persisted to Firestore streams/{id}/gifts
// UX-35: Subscription tier display
// UX-36: Pay-per-view stream toggle

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  collection, addDoc, onSnapshot, query, orderBy,
  doc, getDoc, updateDoc, serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import useAppStore from '@store/useAppStore';

const GIFT_OPTIONS = [
  { id:'rose',      emoji:'🌹', label:'Rose',      coins:10,  usd:0.10 },
  { id:'heart',     emoji:'❤️', label:'Heart',     coins:50,  usd:0.50 },
  { id:'star',      emoji:'⭐', label:'Star',      coins:100, usd:1.00 },
  { id:'diamond',   emoji:'💎', label:'Diamond',   coins:500, usd:5.00 },
  { id:'crown',     emoji:'👑', label:'Crown',     coins:1000,usd:10.00 },
  { id:'rocket',    emoji:'🚀', label:'Rocket',    coins:2000,usd:20.00 },
];

const SUB_TIERS = [
  { id:'tier1', label:'Tier 1', price:'$4.99/mo', perks:['Ad-free viewing','Exclusive badge','Subscriber chat'] },
  { id:'tier2', label:'Tier 2', price:'$9.99/mo', perks:['All Tier 1 perks','Custom emotes','Monthly shoutout'] },
  { id:'tier3', label:'Tier 3', price:'$24.99/mo',perks:['All Tier 2 perks','1:1 Q&A session','Name in credits'] },
];

export default function LiveMonetizationPage() {
  const navigate  = useNavigate();
  const [searchParams] = useSearchParams();
  const streamId  = searchParams.get('streamId');
  const showToast = useAppStore(s => s.showToast);

  const [leaderboard,  setLeaderboard]  = useState([]);   // UX-37
  const [totalEarned,  setTotalEarned]  = useState(0);
  const [totalGifts,   setTotalGifts]   = useState(0);
  const [ppv,          setPpv]          = useState(false); // UX-36
  const [ppvPrice,     setPpvPrice]     = useState('2.99');
  const [activeTab,    setActiveTab]    = useState('gifts'); // gifts | subs | ppv
  const [sending,      setSending]      = useState(null);

  // UX-37: Load gift leaderboard from Firestore (persistent)
  useEffect(() => {
    if (!streamId) return;
    const q = query(
      collection(db, 'streams', streamId, 'gifts'),
      orderBy('totalCoins', 'desc')
    );
    const unsub = onSnapshot(q, snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setLeaderboard(data);
      setTotalGifts(data.reduce((a,g) => a + (g.totalGifts || 1), 0));
      setTotalEarned(data.reduce((a,g) => a + (g.totalCoins || 0), 0) * 0.01);
    }, () => {});
    return () => unsub();
  }, [streamId]);

  // Load PPV setting
  useEffect(() => {
    if (!streamId) return;
    getDoc(doc(db, 'streams', streamId)).then(snap => {
      if (snap.exists()) {
        setPpv(snap.data().ppv || false);
        setPpvPrice(snap.data().ppvPrice || '2.99');
      }
    }).catch(() => {});
  }, [streamId]);

  // Send a gift (writes to Firestore for persistence)
  const sendGift = async (gift) => {
    if (!auth.currentUser) { showToast('Sign in to send gifts'); return; }
    if (!streamId) { showToast('No active stream'); return; }
    setSending(gift.id);
    try {
      // Write individual gift event
      await addDoc(collection(db, 'streams', streamId, 'giftEvents'), {
        userId:    auth.currentUser.uid,
        userName:  auth.currentUser.displayName || 'Viewer',
        giftId:    gift.id,
        giftEmoji: gift.emoji,
        giftLabel: gift.label,
        coins:     gift.coins,
        usd:       gift.usd,
        sentAt:    serverTimestamp(),
      });

      // Upsert leaderboard entry (using userId as doc id)
      const lbRef = doc(db, 'streams', streamId, 'gifts', auth.currentUser.uid);
      const lbSnap = await getDoc(lbRef);
      if (lbSnap.exists()) {
        await updateDoc(lbRef, {
          totalCoins: (lbSnap.data().totalCoins || 0) + gift.coins,
          totalGifts: (lbSnap.data().totalGifts || 0) + 1,
          lastGiftAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, 'streams', streamId, 'gifts'), {
          userId:    auth.currentUser.uid,
          userName:  auth.currentUser.displayName || 'Viewer',
          totalCoins: gift.coins,
          totalGifts: 1,
          lastGiftAt: serverTimestamp(),
        });
      }
      showToast(`${gift.emoji} ${gift.label} sent! +${gift.coins} coins`);
    } catch (e) {
      console.error(e);
      showToast('Gift failed');
    } finally {
      setSending(null);
    }
  };

  // UX-36: Toggle PPV
  const savePpv = async () => {
    if (!streamId) return;
    try {
      await updateDoc(doc(db, 'streams', streamId), { ppv, ppvPrice });
      showToast(ppv ? `✅ PPV set at $${ppvPrice}` : '✅ PPV disabled');
    } catch { showToast('Failed to save'); }
  };

  const medal = i => ['🥇','🥈','🥉'][i] || `${i+1}.`;

  return (
    <div style={{ background:'#0a0a18', minHeight:'100vh', paddingBottom:'80px' }}>
      {/* Header */}
      <div style={{ padding:'12px 16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', gap:'10px' }}>
        <button onClick={() => navigate(-1)} style={{ background:'none', border:'none', color:'#94a3b8', fontSize:'20px', cursor:'pointer' }}>←</button>
        <span style={{ fontSize:'16px', fontWeight:800, color:'#f1f5f9', flex:1 }}>💰 Monetization</span>
        {totalEarned > 0 && (
          <span style={{ background:'rgba(34,197,94,0.15)', borderRadius:'10px', padding:'4px 10px', color:'#22c55e', fontSize:'13px', fontWeight:700 }}>
            ${totalEarned.toFixed(2)} earned
          </span>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', borderBottom:'1px solid #1e293b' }}>
        {[['gifts','🎁 Gifts'],['subs','⭐ Subscriptions'],['ppv','🔒 Pay-per-View']].map(([id,label]) => (
          <button key={id} onClick={() => setActiveTab(id)}
            style={{ flex:1, padding:'11px 4px', border:'none', background:'none', fontWeight:700, fontSize:'12px', cursor:'pointer',
              color: activeTab===id ? '#f1f5f9' : '#64748b',
              borderBottom: activeTab===id ? '2px solid #ef4444' : '2px solid transparent' }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ padding:'12px 16px' }}>

        {/* GIFTS TAB */}
        {activeTab === 'gifts' && (
          <>
            {/* Stats bar */}
            <div style={{ display:'flex', gap:'10px', marginBottom:'16px' }}>
              {[
                { label:'Total Gifts', value: totalGifts },
                { label:'Earned',      value: `$${totalEarned.toFixed(2)}` },
                { label:'Top Gifter',  value: leaderboard[0]?.userName?.split(' ')[0] || '—' },
              ].map(s => (
                <div key={s.label} style={{ flex:1, background:'#1e293b', borderRadius:'12px', padding:'10px', textAlign:'center' }}>
                  <div style={{ color:'#f1f5f9', fontWeight:800, fontSize:'16px' }}>{s.value}</div>
                  <div style={{ color:'#64748b', fontSize:'10px', marginTop:'2px' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Gift buttons */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px', marginBottom:'20px' }}>
              {GIFT_OPTIONS.map(g => (
                <button key={g.id} onClick={() => sendGift(g)} disabled={!!sending}
                  style={{ background: sending===g.id ? '#334155' : '#1e293b', border:'1px solid #334155',
                    borderRadius:'12px', padding:'12px 8px', cursor: sending ? 'wait' : 'pointer',
                    display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', opacity: sending && sending!==g.id ? 0.6 : 1 }}>
                  <span style={{ fontSize:'24px' }}>{g.emoji}</span>
                  <span style={{ color:'#f1f5f9', fontSize:'11px', fontWeight:700 }}>{g.label}</span>
                  <span style={{ color:'#f59e0b', fontSize:'10px' }}>{g.coins} coins</span>
                </button>
              ))}
            </div>

            {/* UX-37: Persistent leaderboard */}
            <div style={{ color:'#64748b', fontSize:'12px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'8px' }}>
              🏆 Gift Leaderboard
            </div>
            {leaderboard.length === 0 ? (
              <div style={{ textAlign:'center', padding:'24px', background:'#1e293b', borderRadius:'14px' }}>
                <div style={{ fontSize:'28px', marginBottom:'6px' }}>🎁</div>
                <div style={{ color:'#64748b', fontSize:'13px' }}>No gifts yet — be the first!</div>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                {leaderboard.slice(0,10).map((g,i) => (
                  <div key={g.id} style={{ background:'#1e293b', borderRadius:'12px', padding:'10px 14px', display:'flex', alignItems:'center', gap:'12px' }}>
                    <span style={{ fontSize:'16px', width:'24px', textAlign:'center' }}>{medal(i)}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'13px' }}>{g.userName}</div>
                      <div style={{ color:'#64748b', fontSize:'11px' }}>{g.totalGifts} gift{g.totalGifts !== 1 ? 's' : ''}</div>
                    </div>
                    <div style={{ color:'#f59e0b', fontWeight:800, fontSize:'14px' }}>
                      {g.totalCoins?.toLocaleString()} 💰
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* SUBSCRIPTIONS TAB */}
        {activeTab === 'subs' && (
          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            <div style={{ color:'#64748b', fontSize:'13px', marginBottom:'4px' }}>
              Set up subscription tiers for your channel. Subscribers get exclusive perks and chat badges.
            </div>
            {SUB_TIERS.map(tier => (
              <div key={tier.id} style={{ background:'#1e293b', borderRadius:'14px', padding:'14px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
                  <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'14px' }}>{tier.label}</div>
                  <div style={{ color:'#f59e0b', fontWeight:800, fontSize:'14px' }}>{tier.price}</div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
                  {tier.perks.map(p => (
                    <div key={p} style={{ color:'#94a3b8', fontSize:'12px', display:'flex', gap:'6px', alignItems:'center' }}>
                      <span style={{ color:'#22c55e' }}>✓</span> {p}
                    </div>
                  ))}
                </div>
                <button style={{ marginTop:'10px', width:'100%', background:'linear-gradient(135deg,#ef4444,#f59e0b)',
                  border:'none', borderRadius:'10px', padding:'9px', color:'white', fontWeight:700, fontSize:'13px', cursor:'pointer' }}>
                  ⭐ Enable {tier.label}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* PAY-PER-VIEW TAB */}
        {activeTab === 'ppv' && (
          <div>
            <div style={{ background:'#1e293b', borderRadius:'14px', padding:'14px', marginBottom:'12px' }}>
              <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'14px', marginBottom:'6px' }}>🔒 Pay-per-View Access</div>
              <div style={{ color:'#64748b', fontSize:'12px', marginBottom:'14px' }}>
                Require viewers to pay a one-time fee to access this stream.
              </div>

              {/* Toggle */}
              <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'14px' }}>
                <span style={{ color:'#f1f5f9', fontSize:'14px', flex:1 }}>Enable PPV</span>
                <button onClick={() => setPpv(v => !v)}
                  style={{ width:'48px', height:'26px', borderRadius:'13px', border:'none', cursor:'pointer', position:'relative',
                    background: ppv ? 'linear-gradient(135deg,#ef4444,#f59e0b)' : '#334155' }}>
                  <span style={{ position:'absolute', top:'3px', left: ppv ? '25px' : '3px', width:'20px', height:'20px',
                    borderRadius:'50%', background:'white', transition:'left 0.2s', display:'block' }} />
                </button>
              </div>

              {ppv && (
                <div style={{ marginBottom:'14px' }}>
                  <div style={{ color:'#94a3b8', fontSize:'12px', marginBottom:'6px' }}>Price (USD)</div>
                  <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                    <span style={{ color:'#f1f5f9', fontSize:'18px', fontWeight:700 }}>$</span>
                    <input type="number" value={ppvPrice} onChange={e => setPpvPrice(e.target.value)}
                      min="0.99" max="99.99" step="0.50"
                      style={{ flex:1, background:'#0a0a18', border:'1px solid #334155', borderRadius:'10px',
                        padding:'10px 12px', color:'#f1f5f9', fontSize:'16px', fontWeight:700, outline:'none' }} />
                  </div>
                  <div style={{ color:'#64748b', fontSize:'11px', marginTop:'4px' }}>
                    You receive ~70% after platform fees
                  </div>
                </div>
              )}

              <button onClick={savePpv}
                style={{ width:'100%', background:'linear-gradient(135deg,#ef4444,#f59e0b)',
                  border:'none', borderRadius:'12px', padding:'11px', color:'white', fontWeight:800, fontSize:'14px', cursor:'pointer' }}>
                💾 Save Settings
              </button>
            </div>

            {/* Info card */}
            <div style={{ background:'rgba(239,68,68,0.08)', borderRadius:'12px', padding:'12px', border:'1px solid rgba(239,68,68,0.2)' }}>
              <div style={{ color:'#fca5a5', fontSize:'12px', fontWeight:700, marginBottom:'4px' }}>How it works</div>
              <div style={{ color:'#94a3b8', fontSize:'12px' }}>
                Viewers pay once to unlock the stream. You earn 70% of every purchase. 
                Subscribers bypass the paywall automatically.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
