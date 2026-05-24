// src/pages/friends/FriendBirthdaysPage.jsx
// SECTION 9 — Friend Birthdays page (/friends/birthdays)
// Shows upcoming birthdays of friends this week/month; pulls from Firestore with demo fallback

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBirthdayReminders } from '../../services/friends-firestore-service';

const AVATAR_COLORS = ['#ec4899','#6366f1','#10b981','#f59e0b','#8b5cf6','#3b82f6','#ef4444','#14b8a6'];
const avatarColor = (id) => AVATAR_COLORS[(id?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];
const initials = (n) => {
  if (!n) return '?';
  const p = n.trim().split(' ');
  return p.length >= 2 ? p[0][0] + p[1][0] : n.slice(0, 2).toUpperCase();
};

// Demo fallback birthdays
const DEMO_BIRTHDAYS = [
  { id:'bd1', displayName:'Jordan Maxwell', emoji:'🎵', color:'#ec4899', daysUntil:0,  birthday:'05-21', mutual:8  },
  { id:'bd2', displayName:'Alex Chen',       emoji:'✈️', color:'#6366f1', daysUntil:2,  birthday:'05-23', mutual:12 },
  { id:'bd3', displayName:'Riley Johnson',   emoji:'💪', color:'#10b981', daysUntil:5,  birthday:'05-26', mutual:5  },
  { id:'bd4', displayName:'Sam Rivera',      emoji:'🍕', color:'#f59e0b', daysUntil:12, birthday:'06-02', mutual:3  },
  { id:'bd5', displayName:'Morgan Taylor',   emoji:'🎨', color:'#8b5cf6', daysUntil:18, birthday:'06-08', mutual:9  },
  { id:'bd6', displayName:'Casey Lee',       emoji:'🌊', color:'#3b82f6', daysUntil:25, birthday:'06-15', mutual:7  },
];

const WISH_MESSAGES = [
  '🎉 Happy Birthday! Hope your day is amazing! 🎂',
  '🥳 Wishing you the best birthday ever!',
  '🎈 Happy Birthday! Sending you lots of love today!',
  '🎊 Have an incredible birthday! You deserve it!',
  '🎂 Happy Birthday! Hope this year brings you joy!',
];

const daysLabel = (d) => {
  if (d === 0) return { label: '🎂 Today!',      color: '#ec4899', bg: 'rgba(236,72,153,0.15)' };
  if (d === 1) return { label: '🎂 Tomorrow',    color: '#f97316', bg: 'rgba(249,115,22,0.15)' };
  if (d <= 7)  return { label: `🎂 In ${d} days`, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' };
  return        { label: `📅 In ${d} days`,      color: '#6366f1', bg: 'rgba(99,102,241,0.15)' };
};

export default function FriendBirthdaysPage() {
  const navigate = useNavigate();
  const [birthdays, setBirthdays] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [wished, setWished]       = useState({});
  const [toast, setToast]         = useState('');
  const [filter, setFilter]       = useState('all'); // 'today' | 'week' | 'month' | 'all'

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  useEffect(() => {
    getBirthdayReminders()
      .then(data => {
        if (data.length > 0) setBirthdays(data);
        else setBirthdays(DEMO_BIRTHDAYS);
      })
      .catch(() => setBirthdays(DEMO_BIRTHDAYS))
      .finally(() => setLoading(false));
  }, []);

  const handleWish = (friend) => {
    const msg = WISH_MESSAGES[Math.floor(Math.random() * WISH_MESSAGES.length)];
    setWished(p => ({ ...p, [friend.id]: true }));
    showToast(`Wish sent to ${friend.displayName || friend.name}! 🎉`);
    // In production: navigate to messages with pre-filled message
    // navigate(`/messages/new?uid=${friend.id}&msg=${encodeURIComponent(msg)}`);
  };

  const filtered = birthdays.filter(b => {
    if (filter === 'today') return b.daysUntil === 0;
    if (filter === 'week')  return b.daysUntil <= 7;
    if (filter === 'month') return b.daysUntil <= 30;
    return true;
  });

  const todayCount  = birthdays.filter(b => b.daysUntil === 0).length;
  const weekCount   = birthdays.filter(b => b.daysUntil <= 7).length;

  return (
    <div style={{ background:'#0f172a', minHeight:'100vh', paddingBottom:80, color:'#f1f5f9' }}>
      {/* Header */}
      <div style={{ padding:'16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', gap:12 }}>
        <button onClick={() => navigate('/friends')}
          style={{ background:'none', border:'none', color:'#6366f1', fontSize:22, cursor:'pointer', padding:0 }}>←</button>
        <span style={{ fontSize:18, fontWeight:700 }}>🎂 Birthdays</span>
        {todayCount > 0 && (
          <span style={{ background:'#ec4899', color:'white', borderRadius:10, padding:'2px 8px', fontSize:12, fontWeight:700 }}>
            {todayCount} today!
          </span>
        )}
      </div>

      {/* Banner */}
      {todayCount > 0 && (
        <div style={{ background:'linear-gradient(135deg,#7c3aed,#ec4899)', padding:'14px 20px',
                      display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:32 }}>🎉</span>
          <div>
            <div style={{ fontWeight:800, fontSize:16, color:'white' }}>
              {todayCount === 1 ? 'Someone has a birthday today!' : `${todayCount} friends have birthdays today!`}
            </div>
            <div style={{ color:'rgba(255,255,255,0.8)', fontSize:13 }}>Don't forget to wish them!</div>
          </div>
        </div>
      )}

      <div style={{ padding:'16px' }}>
        {/* Filter chips */}
        <div style={{ display:'flex', gap:8, marginBottom:16, overflowX:'auto' }}>
          {[
            { key:'all',   label:`All (${birthdays.length})` },
            { key:'today', label:`Today${todayCount > 0 ? ` (${todayCount})` : ''}` },
            { key:'week',  label:`This week (${weekCount})` },
            { key:'month', label:'This month' },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              style={{ background: filter === f.key ? 'linear-gradient(135deg,#6366f1,#ec4899)' : '#1e293b',
                       border: filter === f.key ? 'none' : '1px solid #334155',
                       borderRadius:20, padding:'6px 14px', color: filter === f.key ? 'white' : '#94a3b8',
                       fontSize:12, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap', flexShrink:0 }}>
              {f.label}
            </button>
          ))}
        </div>

        {loading && (
          <div style={{ textAlign:'center', padding:'40px 0', color:'#64748b' }}>Loading birthdays…</div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:'40px 0', color:'#64748b' }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🎂</div>
            <div>No birthdays in this period</div>
          </div>
        )}

        {!loading && filtered.map(friend => {
          const { label, color, bg } = daysLabel(friend.daysUntil);
          const col = friend.color || avatarColor(friend.id);
          const name = friend.displayName || friend.name || 'Unknown';
          return (
            <div key={friend.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px',
                                          background:'#1e293b', borderRadius:18, marginBottom:12 }}>
              {/* Avatar */}
              <div style={{ position:'relative', flexShrink:0 }}>
                <div style={{ width:56, height:56, borderRadius:'50%', background:col, display:'flex',
                              alignItems:'center', justifyContent:'center', fontSize:26,
                              boxShadow: friend.daysUntil === 0 ? '0 0 0 3px #ec4899' : 'none' }}>
                  {friend.emoji || initials(name)}
                </div>
                {friend.daysUntil === 0 && (
                  <div style={{ position:'absolute', top:-6, right:-6, fontSize:16 }}>🎉</div>
                )}
              </div>
              {/* Info */}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:700, color:'#f1f5f9', fontSize:15, overflow:'hidden',
                              textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{name}</div>
                <div style={{ display:'inline-block', background:bg, borderRadius:10,
                              padding:'2px 10px', fontSize:12, color, fontWeight:600, marginTop:4 }}>
                  {label}
                </div>
                {friend.birthday && (
                  <div style={{ color:'#64748b', fontSize:11, marginTop:3 }}>
                    🗓 {new Date(`2000-${friend.birthday}`).toLocaleDateString('en-US',{month:'long',day:'numeric'})}
                  </div>
                )}
              </div>
              {/* Wish button */}
              <button onClick={() => !wished[friend.id] && handleWish(friend)}
                style={{ background: wished[friend.id] ? '#334155' : friend.daysUntil === 0 ? 'linear-gradient(135deg,#ec4899,#f97316)' : 'linear-gradient(135deg,#6366f1,#ec4899)',
                         border: wished[friend.id] ? '1px solid #334155' : 'none',
                         borderRadius:14, padding:'9px 16px', color: wished[friend.id] ? '#94a3b8' : 'white',
                         fontSize:13, fontWeight:700, cursor: wished[friend.id] ? 'default' : 'pointer',
                         flexShrink:0, whiteSpace:'nowrap' }}>
                {wished[friend.id] ? '✓ Wished!' : friend.daysUntil === 0 ? '🎉 Wish Now' : '🎂 Wish'}
              </button>
            </div>
          );
        })}

        {/* Add birthday reminder tip */}
        {!loading && (
          <div style={{ background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.2)',
                        borderRadius:16, padding:'14px 16px', marginTop:8, display:'flex', gap:12 }}>
            <span style={{ fontSize:22 }}>💡</span>
            <div>
              <div style={{ fontWeight:700, color:'#f1f5f9', fontSize:13 }}>Add your birthday</div>
              <div style={{ color:'#64748b', fontSize:12, marginTop:3 }}>
                Let friends wish you too — add your birthday in{' '}
                <span style={{ color:'#6366f1', cursor:'pointer' }} onClick={() => navigate('/profile/edit')}>
                  Profile Settings
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {toast && (
        <div style={{ position:'fixed', bottom:100, left:'50%', transform:'translateX(-50%)',
                      background:'#1e293b', border:'1px solid #ec4899', borderRadius:12, padding:'10px 20px',
                      color:'#f1f5f9', fontSize:14, fontWeight:600, zIndex:9999, whiteSpace:'nowrap' }}>
          {toast}
        </div>
      )}
    </div>
  );
}
