// src/pages/dating/DatingMatchCelebrationPage.jsx — 🎉 It's a Match! celebration screen
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

const S = {
  page: { position:'fixed', inset:0, background:'linear-gradient(135deg,#1a0a2e 0%,#0a0a18 50%,#1e0a1e 100%)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', zIndex:9000, overflow:'hidden' },
  hearts: { position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden' },
  heart: { position:'absolute', fontSize:24, animation:'floatUp 3s ease-out forwards' },
  badge: { fontSize:20, fontWeight:900, background:'linear-gradient(135deg,#6366f1,#ec4899)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', marginBottom:8, letterSpacing:2 },
  title: { fontSize:42, fontWeight:900, color:'#fff', marginBottom:8, textAlign:'center', textShadow:'0 0 40px rgba(236,72,153,0.5)' },
  sub: { color:'rgba(255,255,255,0.6)', fontSize:16, marginBottom:40, textAlign:'center' },
  avatars: { display:'flex', alignItems:'center', gap:16, marginBottom:40 },
  av: { width:96, height:96, borderRadius:'50%', background:'linear-gradient(135deg,#6366f1,#ec4899)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, fontWeight:800, color:'white', border:'3px solid rgba(255,255,255,0.3)', boxShadow:'0 0 30px rgba(99,102,241,0.5)' },
  heart2: { fontSize:32 },
  actions: { display:'flex', flexDirection:'column', gap:12, width:'100%', maxWidth:320, padding:'0 20px' },
  btnPrimary: { background:'linear-gradient(135deg,#6366f1,#ec4899)', border:'none', borderRadius:14, padding:'16px', color:'white', fontSize:16, fontWeight:700, cursor:'pointer', width:'100%' },
  btnSecondary: { background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:14, padding:'14px', color:'#f1f5f9', fontSize:15, fontWeight:600, cursor:'pointer', width:'100%' },
};

const CONFETTI = ['💕','❤️','✨','🌟','💫','🎉','💖','🩷','💝','⭐'];

export default function DatingMatchCelebrationPage() {
  const navigate = useNavigate();
  const { matchId } = useParams();
  const location = useLocation();
  const matchedUser = location.state?.matchedUser || { displayName:'Your Match', initials:'??' };
  const myInitials = location.state?.myInitials || 'ME';
  const [hearts, setHearts] = useState([]);

  useEffect(() => {
    const items = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      emoji: CONFETTI[i % CONFETTI.length],
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 1.5}s`,
      size: `${16 + Math.random() * 20}px`,
    }));
    setHearts(items);
  }, []);

  const goToChat = () => navigate(`/dating/chat/${matchId || 'new'}`, {
    state: { matchedUser }
  });

  return (
    <div style={S.page}>
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(100vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-20vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
      <div style={S.hearts}>
        {hearts.map(h => (
          <span key={h.id} style={{ ...S.heart, left: h.left, bottom: '-10%', animationDelay: h.delay, fontSize: h.size }}>
            {h.emoji}
          </span>
        ))}
      </div>
      <div style={S.badge}>✨ IT'S A MATCH! ✨</div>
      <div style={S.title}>You both liked each other!</div>
      <div style={S.sub}>Start a conversation — don't let this moment slip away 💬</div>
      <div style={S.avatars}>
        <div style={S.av}>{myInitials}</div>
        <div style={S.heart2}>💕</div>
        <div style={{ ...S.av, background:'linear-gradient(135deg,#ec4899,#f59e0b)' }}>
          {matchedUser.initials || matchedUser.displayName?.charAt(0) || '?'}
        </div>
      </div>
      <div style={S.actions}>
        <button style={S.btnPrimary} onClick={goToChat}>
          💬 Send a Message
        </button>
        <button style={S.btnSecondary} onClick={() => navigate('/dating')}>
          Keep Swiping
        </button>
      </div>
    </div>
  );
}
