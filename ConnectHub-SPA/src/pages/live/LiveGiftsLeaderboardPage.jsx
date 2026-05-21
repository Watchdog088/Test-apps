// /live/gifts/:streamId — Gifts Leaderboard for a live stream
// FIX: Real-time Firestore listener on streams/{streamId}/gifts subcollection
// Aggregates gifts by sender and shows ranked leaderboard

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  collection, onSnapshot, doc, getDoc,
  query, orderBy,
} from 'firebase/firestore';
import { db } from '@/firebase/config';

const GIFT_EMOJI = { 5:'🪙', 10:'🎁', 25:'⭐', 50:'🌟', 100:'💎', 500:'👑', 1000:'🔱' };
const giftEmoji = (amt) => {
  const keys = Object.keys(GIFT_EMOJI).map(Number).sort((a,b)=>b-a);
  for (const k of keys) if (amt >= k) return GIFT_EMOJI[k];
  return '🎁';
};

function formatCoins(n) {
  if (n >= 1000) return `${(n/1000).toFixed(1)}K`;
  return String(n);
}

function getMedalColor(rank) {
  if (rank === 1) return { bg:'rgba(251,191,36,0.15)', border:'rgba(251,191,36,0.4)', medal:'🥇', color:'#fbbf24' };
  if (rank === 2) return { bg:'rgba(156,163,175,0.15)', border:'rgba(156,163,175,0.4)', medal:'🥈', color:'#9ca3af' };
  if (rank === 3) return { bg:'rgba(180,83,9,0.15)', border:'rgba(180,83,9,0.4)', medal:'🥉', color:'#b45309' };
  return { bg:'#1e293b', border:'#334155', medal:`#${rank}`, color:'#94a3b8' };
}

export default function LiveGiftsLeaderboardPage() {
  const { streamId } = useParams();
  const navigate = useNavigate();

  const [stream, setStream] = useState(null);
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCoins, setTotalCoins] = useState(0);

  // Load stream meta
  useEffect(() => {
    if (!streamId) return;
    getDoc(doc(db, 'streams', streamId))
      .then(snap => { if (snap.exists()) setStream({ id: snap.id, ...snap.data() }); })
      .finally(() => setLoading(false));
  }, [streamId]);

  // Real-time gifts listener — aggregate by sender
  useEffect(() => {
    if (!streamId) return;
    const q = query(
      collection(db, 'streams', streamId, 'gifts'),
      orderBy('sentAt', 'desc'),
    );
    return onSnapshot(q, snap => {
      const raw = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Aggregate by senderId
      const agg = {};
      let total = 0;
      raw.forEach(g => {
        const key = g.senderId;
        if (!agg[key]) {
          agg[key] = { senderId: key, senderName: g.senderName || 'Anonymous', totalCoins: 0, giftCount: 0, lastEmoji: '🎁' };
        }
        agg[key].totalCoins += (g.amount || 0);
        agg[key].giftCount += 1;
        agg[key].lastEmoji = giftEmoji(g.amount || 0);
        total += (g.amount || 0);
      });

      const ranked = Object.values(agg).sort((a,b) => b.totalCoins - a.totalCoins);
      setGifts(ranked);
      setTotalCoins(total);
    });
  }, [streamId]);

  if (loading) return (
    <div style={{ minHeight:'100dvh', background:'#0a0a18', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ color:'#94a3b8', fontSize:'14px' }}>Loading leaderboard…</div>
    </div>
  );

  return (
    <div style={{ minHeight:'100dvh', background:'#0a0a18', display:'flex', flexDirection:'column' }}>
      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#1e293b,#111827)', padding:'12px 16px',
        display:'flex', alignItems:'center', gap:'12px', borderBottom:'1px solid #1e293b',
        position:'sticky', top:0, zIndex:10 }}>
        <button onClick={() => navigate(-1)} style={{ background:'none', border:'none', color:'#94a3b8', fontSize:'20px', cursor:'pointer' }}>←</button>
        <div style={{ flex:1 }}>
          <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'15px' }}>🏆 Gifts Leaderboard</div>
          {stream && <div style={{ color:'#64748b', fontSize:'12px' }}>{stream.title || 'Live Stream'}</div>}
        </div>
        <button onClick={() => navigate(`/live/watch/${streamId}`)}
          style={{ background:'#ef4444', border:'none', borderRadius:'8px', padding:'6px 12px',
            color:'white', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>
          ● LIVE
        </button>
      </div>

      {/* Total gifts banner */}
      <div style={{ background:'linear-gradient(135deg,rgba(251,191,36,0.12),rgba(245,158,11,0.06))',
        borderBottom:'1px solid rgba(251,191,36,0.15)', padding:'14px 16px',
        display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <div style={{ color:'#94a3b8', fontSize:'11px', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>Total Gifts Sent</div>
          <div style={{ color:'#fbbf24', fontSize:'22px', fontWeight:800 }}>{formatCoins(totalCoins)} 💰</div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ color:'#94a3b8', fontSize:'11px', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>Top Gifters</div>
          <div style={{ color:'#f1f5f9', fontSize:'22px', fontWeight:800 }}>{gifts.length}</div>
        </div>
      </div>

      {/* Leaderboard */}
      <div style={{ flex:1, overflowY:'auto', padding:'12px 16px' }}>
        {gifts.length === 0 ? (
          <div style={{ textAlign:'center', paddingTop:'60px' }}>
            <div style={{ fontSize:'52px', marginBottom:'12px' }}>🎁</div>
            <div style={{ color:'#94a3b8', fontSize:'15px', fontWeight:600, marginBottom:'6px' }}>No gifts yet</div>
            <div style={{ color:'#475569', fontSize:'13px', marginBottom:'20px' }}>Be the first to send a gift!</div>
            <button onClick={() => navigate(`/live/watch/${streamId}`)}
              style={{ background:'linear-gradient(135deg,#f59e0b,#ef4444)', border:'none', borderRadius:'12px',
                padding:'12px 24px', color:'white', fontWeight:700, fontSize:'14px', cursor:'pointer' }}>
              🎁 Send a Gift
            </button>
          </div>
        ) : (
          gifts.map((gifter, idx) => {
            const rank = idx + 1;
            const medal = getMedalColor(rank);
            return (
              <div key={gifter.senderId} style={{
                background: medal.bg,
                border: `1px solid ${medal.border}`,
                borderRadius:'14px', padding:'14px', marginBottom:'10px',
                display:'flex', alignItems:'center', gap:'12px',
              }}>
                {/* Rank / Medal */}
                <div style={{ fontSize: rank <= 3 ? '22px' : '14px', fontWeight:800, color: medal.color,
                  minWidth:'32px', textAlign:'center' }}>
                  {medal.medal}
                </div>

                {/* Avatar */}
                <div style={{ width:'40px', height:'40px', borderRadius:'50%',
                  background:'linear-gradient(135deg,#f59e0b,#ef4444)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'16px', fontWeight:800, color:'white', flexShrink:0 }}>
                  {(gifter.senderName || '?')[0].toUpperCase()}
                </div>

                {/* Name + stats */}
                <div style={{ flex:1 }}>
                  <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'14px', marginBottom:'3px' }}>
                    {gifter.senderName}
                  </div>
                  <div style={{ color:'#64748b', fontSize:'12px' }}>
                    {gifter.giftCount} {gifter.giftCount === 1 ? 'gift' : 'gifts'} sent · {gifter.lastEmoji}
                  </div>
                </div>

                {/* Total */}
                <div style={{ textAlign:'right' }}>
                  <div style={{ color:'#fbbf24', fontWeight:800, fontSize:'16px' }}>
                    {formatCoins(gifter.totalCoins)}
                  </div>
                  <div style={{ color:'#64748b', fontSize:'11px' }}>coins</div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CTA bar */}
      <div style={{ padding:'12px 16px', background:'#111827', borderTop:'1px solid #1e293b' }}>
        <button onClick={() => navigate(`/live/watch/${streamId}`)}
          style={{ width:'100%', background:'linear-gradient(135deg,#f59e0b,#ef4444)', border:'none',
            borderRadius:'14px', padding:'14px', color:'white', fontWeight:800, fontSize:'15px', cursor:'pointer' }}>
          🎁 Send a Gift to this Stream
        </button>
      </div>
    </div>
  );
}
