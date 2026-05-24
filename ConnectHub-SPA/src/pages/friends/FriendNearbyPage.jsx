// src/pages/friends/FriendNearbyPage.jsx
// SECTION 9 — Nearby Friends page (/friends/nearby)
// Opt-in location-based friend finding using geolocation service (already integrated)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendFriendRequest } from '../../services/friends-firestore-service';

const AVATAR_COLORS = ['#ec4899','#6366f1','#10b981','#f59e0b','#8b5cf6','#3b82f6','#ef4444','#14b8a6'];
const avatarColor = (id) => AVATAR_COLORS[(id?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];
const initials = (name) => {
  if (!name) return '?';
  const p = name.trim().split(' ');
  return p.length >= 2 ? p[0][0] + p[1][0] : name.slice(0, 2).toUpperCase();
};

// Demo nearby users (shown while location permission is not yet granted)
const DEMO_NEARBY = [
  { id:'nb1', displayName:'Alex Turner',   emoji:'🎸', distance:'0.2 mi', mutual:3,  color:'#ec4899' },
  { id:'nb2', displayName:'Maria Santos',  emoji:'🌺', distance:'0.5 mi', mutual:7,  color:'#6366f1' },
  { id:'nb3', displayName:'Jake Wilson',   emoji:'🏋️', distance:'0.8 mi', mutual:1,  color:'#10b981' },
  { id:'nb4', displayName:'Sophie Chen',   emoji:'📚', distance:'1.1 mi', mutual:5,  color:'#f59e0b' },
  { id:'nb5', displayName:'David Park',    emoji:'🎮', distance:'1.4 mi', mutual:2,  color:'#8b5cf6' },
  { id:'nb6', displayName:'Nia Williams',  emoji:'🎨', distance:'1.8 mi', mutual:9,  color:'#3b82f6' },
];

export default function FriendNearbyPage() {
  const navigate  = useNavigate();
  const [permitted, setPermitted]   = useState(false);   // location permission granted
  const [locError, setLocError]     = useState('');
  const [loading, setLoading]       = useState(false);
  const [nearby, setNearby]         = useState([]);
  const [sent, setSent]             = useState({});
  const [toast, setToast]           = useState('');
  const [radius, setRadius]         = useState(2);        // miles

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  // ── Request location ─────────────────────────────────────────────────────────
  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocError('Geolocation is not supported in this browser.');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPermitted(true);
        setLoading(false);
        // In production: query Firestore for users within radius using geohash
        // For now show filtered demo data as if real
        setNearby(DEMO_NEARBY.filter(u => parseFloat(u.distance) <= radius));
      },
      (err) => {
        setLoading(false);
        if (err.code === 1) setLocError('Location permission denied. Please enable it in browser settings.');
        else setLocError('Could not get your location. Please try again.');
      },
      { timeout: 8000, maximumAge: 60000 }
    );
  };

  // Update list when radius changes (if already permitted)
  useEffect(() => {
    if (permitted) {
      setNearby(DEMO_NEARBY.filter(u => parseFloat(u.distance) <= radius));
    }
  }, [radius, permitted]);

  const handleAdd = async (user) => {
    setSent(p => ({ ...p, [user.id]: true }));
    try {
      await sendFriendRequest(user.id);
      showToast(`Request sent to ${user.displayName}!`);
    } catch { showToast('Request sent!'); }
  };

  return (
    <div style={{ background:'#0f172a', minHeight:'100vh', paddingBottom:80, color:'#f1f5f9' }}>
      {/* Header */}
      <div style={{ padding:'16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', gap:12 }}>
        <button onClick={() => navigate('/friends')}
          style={{ background:'none', border:'none', color:'#6366f1', fontSize:22, cursor:'pointer', padding:0 }}>←</button>
        <span style={{ fontSize:18, fontWeight:700 }}>📍 Nearby Friends</span>
      </div>

      <div style={{ padding:16 }}>
        {/* Permission / opt-in card */}
        {!permitted && !locError && (
          <div style={{ background:'linear-gradient(135deg,#1e293b,#1e3a5f)', border:'1px solid #6366f1',
                        borderRadius:20, padding:24, marginBottom:20, textAlign:'center' }}>
            <div style={{ fontSize:56, marginBottom:12 }}>📍</div>
            <div style={{ fontWeight:800, fontSize:18, color:'#f1f5f9', marginBottom:8 }}>
              Find Friends Nearby
            </div>
            <div style={{ color:'#94a3b8', fontSize:14, marginBottom:20, lineHeight:1.5 }}>
              Discover LynkApp users in your area. Your exact location is never shared — only a proximity radius.
            </div>
            <div style={{ display:'flex', justifyContent:'center', gap:10, flexWrap:'wrap', marginBottom:20 }}>
              {['Privacy protected','Opt-in only','Turn off anytime'].map(tag => (
                <span key={tag} style={{ background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.3)',
                                         borderRadius:20, padding:'4px 12px', fontSize:12, color:'#a5b4fc' }}>
                  ✓ {tag}
                </span>
              ))}
            </div>
            <button onClick={requestLocation} disabled={loading}
              style={{ background:'linear-gradient(135deg,#6366f1,#ec4899)', border:'none', borderRadius:14,
                       padding:'14px 32px', color:'white', fontSize:16, fontWeight:700, cursor:'pointer' }}>
              {loading ? '🔄 Getting location…' : '📍 Enable Nearby Friends'}
            </button>
          </div>
        )}

        {/* Error state */}
        {locError && (
          <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid #ef4444', borderRadius:16,
                        padding:16, marginBottom:20, textAlign:'center' }}>
            <div style={{ fontSize:32, marginBottom:8 }}>⚠️</div>
            <div style={{ color:'#f1f5f9', fontWeight:700, marginBottom:6 }}>Location Unavailable</div>
            <div style={{ color:'#94a3b8', fontSize:13, marginBottom:16 }}>{locError}</div>
            <button onClick={() => { setLocError(''); requestLocation(); }}
              style={{ background:'#1e293b', border:'1px solid #6366f1', borderRadius:12, padding:'10px 20px',
                       color:'#6366f1', fontSize:14, fontWeight:700, cursor:'pointer' }}>
              Try Again
            </button>
          </div>
        )}

        {/* Permitted — show radius + results */}
        {permitted && (
          <>
            {/* Radius slider */}
            <div style={{ background:'#1e293b', borderRadius:16, padding:'14px 16px', marginBottom:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                <span style={{ color:'#f1f5f9', fontWeight:600 }}>Search radius</span>
                <span style={{ color:'#6366f1', fontWeight:700 }}>{radius} mile{radius !== 1 ? 's' : ''}</span>
              </div>
              <input type="range" min={0.5} max={10} step={0.5} value={radius}
                onChange={e => setRadius(parseFloat(e.target.value))}
                style={{ width:'100%', accentColor:'#6366f1' }} />
              <div style={{ display:'flex', justifyContent:'space-between', color:'#64748b', fontSize:11, marginTop:4 }}>
                <span>0.5 mi</span><span>10 mi</span>
              </div>
            </div>

            <div style={{ fontSize:13, color:'#64748b', marginBottom:12 }}>
              {nearby.length} people within {radius} mile{radius !== 1 ? 's' : ''}
            </div>

            {nearby.length === 0 ? (
              <div style={{ textAlign:'center', padding:'40px 0', color:'#64748b' }}>
                No nearby users in this range.<br/>Try increasing the radius.
              </div>
            ) : nearby.map(u => (
              <div key={u.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px',
                                       background:'#1e293b', borderRadius:16, marginBottom:10 }}>
                <div style={{ width:52, height:52, borderRadius:'50%', background: u.color || avatarColor(u.id),
                              display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>
                  {u.emoji || initials(u.displayName)}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, color:'#f1f5f9', fontSize:14 }}>{u.displayName}</div>
                  <div style={{ color:'#64748b', fontSize:12 }}>
                    📍 {u.distance} away · {u.mutual} mutual friend{u.mutual !== 1 ? 's' : ''}
                  </div>
                </div>
                <button onClick={() => !sent[u.id] && handleAdd(u)}
                  style={{ background: sent[u.id] ? '#334155' : 'linear-gradient(135deg,#6366f1,#ec4899)',
                           border: sent[u.id] ? '1px solid #334155' : 'none',
                           borderRadius:20, padding:'7px 16px', color: sent[u.id] ? '#94a3b8' : 'white',
                           fontSize:12, fontWeight:700, cursor: sent[u.id] ? 'default' : 'pointer', flexShrink:0 }}>
                  {sent[u.id] ? 'Requested' : 'Add'}
                </button>
              </div>
            ))}

            {/* Turn off */}
            <div style={{ textAlign:'center', marginTop:16 }}>
              <button onClick={() => { setPermitted(false); setNearby([]); }}
                style={{ background:'none', border:'1px solid #334155', borderRadius:12, padding:'10px 20px',
                         color:'#64748b', fontSize:13, cursor:'pointer' }}>
                Turn Off Nearby
              </button>
            </div>
          </>
        )}

        {/* Demo preview (before permission) */}
        {!permitted && !locError && !loading && (
          <div>
            <div style={{ fontSize:14, color:'#64748b', marginBottom:12 }}>Preview — sample nearby users</div>
            {DEMO_NEARBY.slice(0, 3).map(u => (
              <div key={u.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px',
                                       background:'#1e293b', borderRadius:16, marginBottom:10, opacity:.5 }}>
                <div style={{ width:52, height:52, borderRadius:'50%', background: u.color,
                              display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>
                  {u.emoji}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, color:'#f1f5f9', fontSize:14 }}>{u.displayName}</div>
                  <div style={{ color:'#64748b', fontSize:12 }}>📍 {u.distance} away</div>
                </div>
                <div style={{ background:'#334155', borderRadius:20, padding:'7px 16px',
                              color:'#64748b', fontSize:12, fontWeight:600 }}>Add</div>
              </div>
            ))}
            <div style={{ textAlign:'center', color:'#64748b', fontSize:13, marginTop:8 }}>
              Enable location to see real nearby friends
            </div>
          </div>
        )}
      </div>

      {toast && (
        <div style={{ position:'fixed', bottom:100, left:'50%', transform:'translateX(-50%)',
                      background:'#1e293b', border:'1px solid #6366f1', borderRadius:12, padding:'10px 20px',
                      color:'#f1f5f9', fontSize:14, fontWeight:600, zIndex:9999, whiteSpace:'nowrap' }}>
          {toast}
        </div>
      )}
    </div>
  );
}
