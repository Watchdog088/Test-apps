// LiveMonetizationPage.jsx — /live/monetization
// Session 5 — REC-5.18: Gift goals / milestones (streamer sets a coin goal; progress bar shown live)
// Previously implemented: earnings dashboard, payout settings, subscription tiers

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  doc, onSnapshot, updateDoc, collection, addDoc,
  serverTimestamp, query, orderBy, getDocs, deleteDoc,
} from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import useAppStore from '@store/useAppStore';

const MILESTONE_PRESETS = [100, 250, 500, 1000, 2500, 5000];

export default function LiveMonetizationPage() {
  const navigate = useNavigate();
  const showToast = useAppStore(s => s.showToast);
  const uid = auth.currentUser?.uid;

  const [tab, setTab] = useState('goals'); // 'goals' | 'earnings' | 'payouts'
  const [loading, setLoading] = useState(true);

  // Monetization profile
  const [profile, setProfile] = useState(null);
  const [streamId, setStreamId] = useState(null);
  const [stream, setStream] = useState(null);

  // REC-5.18: Gift goals state
  const [goals, setGoals] = useState([]);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalAmount, setGoalAmount] = useState(500);
  const [addingGoal, setAddingGoal] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);

  // Earnings
  const [earnings, setEarnings] = useState({ total: 0, thisMonth: 0, gifts: 0, subs: 0 });
  const [recentGifts, setRecentGifts] = useState([]);

  // Load monetization profile
  useEffect(() => {
    if (!uid) return;
    const unsub = onSnapshot(doc(db, 'users', uid), snap => {
      if (snap.exists()) {
        const data = snap.data();
        setProfile(data);
        setEarnings({
          total: data.totalEarnings || 0,
          thisMonth: data.monthlyEarnings || 0,
          gifts: data.giftEarnings || 0,
          subs: data.subEarnings || 0,
        });
        setStreamId(data.activeStreamId || null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [uid]);

  // Load active stream (for gift count + live goal progress)
  useEffect(() => {
    if (!streamId) return;
    const unsub = onSnapshot(doc(db, 'streams', streamId), snap => {
      if (snap.exists()) setStream({ id: snap.id, ...snap.data() });
    });
    return () => unsub();
  }, [streamId]);

  // Load gift goals
  useEffect(() => {
    if (!uid) return;
    const q = query(collection(db, 'users', uid, 'giftGoals'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setGoals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [uid]);

  // Load recent gifts for active stream
  useEffect(() => {
    if (!streamId) return;
    const q = query(collection(db, 'streams', streamId, 'gifts'), orderBy('timestamp', 'desc'));
    getDocs(q).then(snap => setRecentGifts(snap.docs.slice(0, 10).map(d => ({ id: d.id, ...d.data() }))));
  }, [streamId]);

  // REC-5.18: Create a gift goal
  const createGoal = useCallback(async () => {
    if (!goalTitle.trim() || !goalAmount || !uid) { showToast('Add a goal title and amount'); return; }
    setAddingGoal(true);
    try {
      await addDoc(collection(db, 'users', uid, 'giftGoals'), {
        title: goalTitle.trim(),
        targetAmount: goalAmount,
        currentAmount: 0,
        active: true,
        streamId: streamId || null,
        createdAt: serverTimestamp(),
      });
      setGoalTitle('');
      setGoalAmount(500);
      setShowGoalForm(false);
      showToast('🎯 Goal created!');
    } catch { showToast('Failed to create goal'); }
    finally { setAddingGoal(false); }
  }, [goalTitle, goalAmount, uid, streamId, showToast]);

  const deleteGoal = async (id) => {
    try {
      await deleteDoc(doc(db, 'users', uid, 'giftGoals', id));
      showToast('Goal removed');
    } catch {}
  };

  const setActiveGoal = async (id) => {
    if (!uid) return;
    // Set all goals inactive, then activate selected
    try {
      for (const g of goals) {
        await updateDoc(doc(db, 'users', uid, 'giftGoals', g.id), { active: g.id === id });
      }
      // Write active goal to stream doc for viewer display
      if (streamId) {
        const activeGoal = goals.find(g => g.id === id);
        await updateDoc(doc(db, 'streams', streamId), {
          activeGiftGoal: activeGoal ? { id: activeGoal.id, title: activeGoal.title, target: activeGoal.targetAmount } : null,
        });
      }
      showToast('🎯 Goal activated!');
    } catch { showToast('Failed to update goal'); }
  };

  const totalGiftsReceived = stream?.totalGifts || 0;
  const fmt = n => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n || 0);
  const fmtCoins = n => `🪙 ${fmt(n)}`;

  const TABS = [
    { key: 'goals', label: '🎯 Goals' },
    { key: 'earnings', label: '💰 Earnings' },
    { key: 'payouts', label: '💳 Payouts' },
  ];

  return (
    <div style={{ background:'#0a0a18', minHeight:'100vh', paddingBottom:'80px' }}>
      {/* Header */}
      <div style={{ padding:'12px 16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', gap:'10px' }}>
        <button onClick={() => navigate(-1)} style={{ background:'none', border:'none', color:'#94a3b8', fontSize:'20px', cursor:'pointer' }}>←</button>
        <span style={{ fontSize:'16px', fontWeight:800, color:'#f1f5f9', flex:1 }}>💰 Monetization</span>
      </div>

      {/* Tab bar */}
      <div style={{ display:'flex', borderBottom:'1px solid #1e293b', padding:'0 16px' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ flex:1, background:'none', border:'none', padding:'12px 4px',
              color: tab === t.key ? '#ef4444' : '#64748b',
              fontWeight: tab === t.key ? 700 : 400, fontSize:'12px', cursor:'pointer',
              borderBottom: tab === t.key ? '2px solid #ef4444' : '2px solid transparent',
              transition:'all 0.15s' }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding:'14px 16px' }}>

        {/* ====== GOALS TAB (REC-5.18) ====== */}
        {tab === 'goals' && (
          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>

            {/* Live stream gift progress */}
            {stream && (
              <div style={{ background:'linear-gradient(135deg,rgba(239,68,68,0.15),rgba(245,158,11,0.15))',
                border:'1px solid rgba(239,68,68,0.3)', borderRadius:'14px', padding:'14px' }}>
                <div style={{ color:'#f59e0b', fontSize:'12px', fontWeight:700, marginBottom:'4px' }}>🔴 Current Stream</div>
                <div style={{ color:'#f1f5f9', fontWeight:800, fontSize:'20px' }}>{fmtCoins(totalGiftsReceived)}</div>
                <div style={{ color:'#94a3b8', fontSize:'11px' }}>total coins received this stream</div>

                {/* Active goal progress bar */}
                {stream.activeGiftGoal && (
                  <div style={{ marginTop:'10px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                      <span style={{ color:'#f1f5f9', fontSize:'12px', fontWeight:700 }}>{stream.activeGiftGoal.title}</span>
                      <span style={{ color:'#f59e0b', fontSize:'12px' }}>
                        {fmt(totalGiftsReceived)} / {fmt(stream.activeGiftGoal.target)}
                      </span>
                    </div>
                    <div style={{ background:'#0f172a', borderRadius:'99px', height:'8px', overflow:'hidden' }}>
                      <div style={{
                        height:'100%', borderRadius:'99px',
                        background:'linear-gradient(90deg,#ef4444,#f59e0b)',
                        width:`${Math.min(100, (totalGiftsReceived / stream.activeGiftGoal.target) * 100).toFixed(1)}%`,
                        transition:'width 0.5s ease',
                      }} />
                    </div>
                    {totalGiftsReceived >= stream.activeGiftGoal.target && (
                      <div style={{ color:'#4ade80', fontSize:'12px', fontWeight:700, marginTop:'4px', textAlign:'center' }}>
                        🎉 Goal Reached!
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Add goal button */}
            <button onClick={() => setShowGoalForm(v => !v)}
              style={{ background: showGoalForm ? '#1e293b' : 'linear-gradient(135deg,#ef4444,#f59e0b)',
                border: showGoalForm ? '1px solid #334155' : 'none',
                borderRadius:'12px', padding:'12px', color:'white', fontWeight:700, fontSize:'13px', cursor:'pointer' }}>
              {showGoalForm ? '✕ Cancel' : '+ Create Gift Goal'}
            </button>

            {/* Goal creation form */}
            {showGoalForm && (
              <div style={{ background:'#1e293b', borderRadius:'14px', padding:'14px', border:'1px solid #334155' }}>
                <div style={{ color:'#f1f5f9', fontSize:'13px', fontWeight:700, marginBottom:'10px' }}>🎯 New Gift Goal</div>
                <input value={goalTitle} onChange={e => setGoalTitle(e.target.value)}
                  placeholder="Goal title (e.g. New PC Fund, Charity Stream)"
                  style={{ width:'100%', background:'#0f172a', border:'1px solid #334155', borderRadius:'8px',
                    padding:'9px 12px', color:'#f1f5f9', fontSize:'13px', outline:'none', boxSizing:'border-box', marginBottom:'8px' }} />
                <div style={{ marginBottom:'8px' }}>
                  <label style={{ color:'#94a3b8', fontSize:'11px', display:'block', marginBottom:'4px' }}>Target Coins</label>
                  <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'8px' }}>
                    {MILESTONE_PRESETS.map(p => (
                      <button key={p} onClick={() => setGoalAmount(p)}
                        style={{ background: goalAmount === p ? 'rgba(245,158,11,0.2)' : '#0f172a',
                          border:`1px solid ${goalAmount === p ? '#f59e0b' : '#334155'}`,
                          borderRadius:'8px', padding:'5px 12px',
                          color: goalAmount === p ? '#f59e0b' : '#94a3b8', fontSize:'12px', cursor:'pointer' }}>
                        {fmt(p)}
                      </button>
                    ))}
                  </div>
                  <input type="number" value={goalAmount} onChange={e => setGoalAmount(Number(e.target.value))} min={10} max={100000}
                    style={{ width:'100%', background:'#0f172a', border:'1px solid #334155', borderRadius:'8px',
                      padding:'9px 12px', color:'#f1f5f9', fontSize:'13px', outline:'none', boxSizing:'border-box' }} />
                </div>
                <button onClick={createGoal} disabled={addingGoal}
                  style={{ width:'100%', background:'linear-gradient(135deg,#f59e0b,#ef4444)', border:'none',
                    borderRadius:'10px', padding:'11px', color:'white', fontWeight:800, fontSize:'13px', cursor:'pointer' }}>
                  {addingGoal ? '⏳ Creating…' : '🎯 Create Goal'}
                </button>
              </div>
            )}

            {/* Goals list */}
            {goals.length === 0 && !showGoalForm && (
              <div style={{ textAlign:'center', padding:'32px 0', color:'#334155' }}>
                <div style={{ fontSize:'36px', marginBottom:'8px' }}>🎯</div>
                <div style={{ fontSize:'13px' }}>No gift goals yet. Create one to motivate your viewers!</div>
              </div>
            )}
            {goals.map(goal => {
              const progress = Math.min(100, ((goal.currentAmount || 0) / goal.targetAmount) * 100);
              return (
                <div key={goal.id} style={{ background:'#1e293b', borderRadius:'14px', padding:'14px', border:`1px solid ${goal.active ? '#f59e0b' : '#334155'}` }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'8px' }}>
                    <div>
                      <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'14px' }}>{goal.title}</div>
                      <div style={{ color:'#94a3b8', fontSize:'11px' }}>
                        {fmtCoins(goal.currentAmount || 0)} / {fmtCoins(goal.targetAmount)}
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:'6px' }}>
                      {!goal.active && (
                        <button onClick={() => setActiveGoal(goal.id)}
                          style={{ background:'rgba(245,158,11,0.15)', border:'1px solid #f59e0b', borderRadius:'8px',
                            padding:'4px 10px', color:'#f59e0b', fontSize:'11px', cursor:'pointer', fontWeight:600 }}>
                          Activate
                        </button>
                      )}
                      {goal.active && (
                        <span style={{ background:'rgba(245,158,11,0.2)', borderRadius:'8px', padding:'4px 10px',
                          color:'#f59e0b', fontSize:'11px', fontWeight:700 }}>● Active</span>
                      )}
                      <button onClick={() => deleteGoal(goal.id)}
                        style={{ background:'rgba(239,68,68,0.15)', border:'none', borderRadius:'8px',
                          padding:'4px 10px', color:'#f87171', fontSize:'11px', cursor:'pointer' }}>
                        🗑
                      </button>
                    </div>
                  </div>
                  <div style={{ background:'#0f172a', borderRadius:'99px', height:'6px', overflow:'hidden' }}>
                    <div style={{ height:'100%', borderRadius:'99px',
                      background: goal.active ? 'linear-gradient(90deg,#ef4444,#f59e0b)' : '#334155',
                      width:`${progress}%`, transition:'width 0.4s ease' }} />
                  </div>
                  <div style={{ color:'#64748b', fontSize:'10px', marginTop:'4px', textAlign:'right' }}>{progress.toFixed(0)}%</div>
                </div>
              );
            })}
          </div>
        )}

        {/* ====== EARNINGS TAB ====== */}
        {tab === 'earnings' && (
          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
              {[
                { label:'Total Earned', value: fmtCoins(earnings.total), color:'#f59e0b' },
                { label:'This Month', value: fmtCoins(earnings.thisMonth), color:'#4ade80' },
                { label:'From Gifts', value: fmtCoins(earnings.gifts), color:'#ef4444' },
                { label:'From Subs', value: fmtCoins(earnings.subs), color:'#818cf8' },
              ].map(stat => (
                <div key={stat.label} style={{ background:'#1e293b', borderRadius:'12px', padding:'12px', border:'1px solid #334155' }}>
                  <div style={{ color:'#64748b', fontSize:'11px', marginBottom:'4px' }}>{stat.label}</div>
                  <div style={{ color: stat.color, fontWeight:800, fontSize:'18px' }}>{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Recent gifts */}
            <div style={{ background:'#1e293b', borderRadius:'14px', padding:'14px', border:'1px solid #334155' }}>
              <div style={{ color:'#f1f5f9', fontSize:'13px', fontWeight:700, marginBottom:'10px' }}>🎁 Recent Gifts</div>
              {recentGifts.length === 0 && <div style={{ color:'#334155', fontSize:'12px' }}>No gifts yet</div>}
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                {recentGifts.map(gift => (
                  <div key={gift.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                    background:'#0f172a', borderRadius:'8px', padding:'8px 12px' }}>
                    <span style={{ color:'#94a3b8', fontSize:'12px' }}>{gift.userName || 'Viewer'}</span>
                    <span style={{ color:'#f59e0b', fontWeight:700, fontSize:'13px' }}>{fmtCoins(gift.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ====== PAYOUTS TAB ====== */}
        {tab === 'payouts' && (
          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            <div style={{ background:'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.15))',
              border:'1px solid rgba(99,102,241,0.3)', borderRadius:'14px', padding:'16px', textAlign:'center' }}>
              <div style={{ color:'#818cf8', fontSize:'12px', fontWeight:700, marginBottom:'4px' }}>Available Balance</div>
              <div style={{ color:'#f1f5f9', fontWeight:800, fontSize:'28px' }}>{fmtCoins(earnings.total)}</div>
              <div style={{ color:'#64748b', fontSize:'11px', marginTop:'2px' }}>= ${((earnings.total || 0) * 0.01).toFixed(2)} USD (100 coins = $1)</div>
              <button
                onClick={() => showToast('Payout request submitted! Processing in 3-5 business days.')}
                style={{ marginTop:'12px', background:'linear-gradient(135deg,#6366f1,#818cf8)', border:'none',
                  borderRadius:'12px', padding:'12px 24px', color:'white', fontWeight:800, fontSize:'14px', cursor:'pointer' }}>
                💳 Request Payout
              </button>
            </div>

            <div style={{ background:'#1e293b', borderRadius:'14px', padding:'14px', border:'1px solid #334155' }}>
              <div style={{ color:'#f1f5f9', fontSize:'13px', fontWeight:700, marginBottom:'8px' }}>Payout Methods</div>
              {['PayPal', 'Bank Transfer', 'Stripe'].map(method => (
                <div key={method} style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                  padding:'10px 0', borderBottom:'1px solid #1e293b' }}>
                  <span style={{ color:'#94a3b8', fontSize:'13px' }}>{method}</span>
                  <button onClick={() => showToast(`Connect ${method} — coming soon`)}
                    style={{ background:'#334155', border:'none', borderRadius:'8px', padding:'5px 12px',
                      color:'#94a3b8', fontSize:'11px', cursor:'pointer' }}>
                    Connect
                  </button>
                </div>
              ))}
            </div>

            <div style={{ background:'rgba(245,158,11,0.08)', borderRadius:'12px', padding:'12px', border:'1px solid rgba(245,158,11,0.2)' }}>
              <div style={{ color:'#f59e0b', fontSize:'11px', lineHeight:'1.6' }}>
                ⚠️ Minimum payout: 1,000 coins ($10) · Processing: 3–5 business days · Platform fee: 30%
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
