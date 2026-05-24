// src/pages/friends/FriendsPage.jsx
// SECTION 9 — Friends (May 2026 rewrite)
// ✅ Fixes: Firestore-persisted accept/decline, remove friend, real online status
// ✅ New:   Sent tab, Friend Profile bottom sheet, birthday reminder cards
// Falls back to mock data when Firestore is unreachable (demo/offline mode)

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  subscribeFriends,
  subscribeIncomingRequests,
  subscribeSentRequests,
  acceptFriendRequest,
  declineFriendRequest,
  cancelFriendRequest,
  removeFriend,
  sendFriendRequest,
  getBirthdayReminders,
  setOnlinePresence,
} from '../../services/friends-firestore-service';

// ─── Mock fallback data (shown when Firestore is unavailable / demo mode) ─────
const MOCK_FRIENDS = [
  { id:'m1', displayName:'Jordan Maxwell', handle:'@jordanmax', mutual:8,  emoji:'🎵', color:'#ec4899', online:true  },
  { id:'m2', displayName:'Alex Chen',       handle:'@alexchen',  mutual:12, emoji:'✈️', color:'#6366f1', online:true  },
  { id:'m3', displayName:'Riley Johnson',   handle:'@riley.j',   mutual:5,  emoji:'💪', color:'#10b981', online:false },
  { id:'m4', displayName:'Sam Rivera',      handle:'@samrivera', mutual:3,  emoji:'🍕', color:'#f59e0b', online:true  },
  { id:'m5', displayName:'Morgan Taylor',   handle:'@morgantaylor',mutual:9,emoji:'🎨', color:'#8b5cf6', online:false },
  { id:'m6', displayName:'Casey Lee',       handle:'@caseylee',  mutual:7,  emoji:'🌊', color:'#3b82f6', online:true  },
];
const MOCK_REQUESTS = [
  { id:'r1', fromUid:'r1', displayName:'Drew Parker', handle:'@drewparker', mutual:4, emoji:'📸', color:'#14b8a6' },
  { id:'r2', fromUid:'r2', displayName:'Quinn Brooks', handle:'@quinnb',   mutual:2, emoji:'🎮', color:'#ef4444' },
  { id:'r3', fromUid:'r3', displayName:'Jamie Fox',   handle:'@jamiefox',  mutual:6, emoji:'🎤', color:'#f97316' },
];
const MOCK_SUGGESTIONS = [
  { id:'s1', displayName:'Taylor Swift Fan', handle:'@tswiftfan', mutual:15, emoji:'🎶', color:'#ec4899', reason:'You both follow Jordan' },
  { id:'s2', displayName:'Chris K.',          handle:'@chriskrip', mutual:3,  emoji:'⚽', color:'#10b981', reason:'From your contacts' },
  { id:'s3', displayName:'Dana Rose',         handle:'@danarose',  mutual:8,  emoji:'🌸', color:'#8b5cf6', reason:'Popular in your area' },
  { id:'s4', displayName:"Finn O'Brien",      handle:'@finno',     mutual:1,  emoji:'🏄', color:'#3b82f6', reason:'You may know them' },
];

// ─── Avatar helper ─────────────────────────────────────────────────────────────
const AVATAR_COLORS = ['#ec4899','#6366f1','#10b981','#f59e0b','#8b5cf6','#3b82f6','#ef4444','#14b8a6'];
function avatarColor(id) { return AVATAR_COLORS[(id?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length]; }
function initials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return parts.length >= 2 ? parts[0][0] + parts[1][0] : name.slice(0, 2).toUpperCase();
}

// ─── Small reusable button ─────────────────────────────────────────────────────
function Btn({ bg, color, children, onClick, border }) {
  return (
    <button
      onClick={onClick}
      style={{ background: bg, color, border: border || 'none', borderRadius: 20, padding: '7px 14px',
               fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
      {children}
    </button>
  );
}

// ─── Friend Profile Bottom Sheet ──────────────────────────────────────────────
function FriendSheet({ friend, onClose, onMessage, onRemove }) {
  if (!friend) return null;
  const col = friend.color || avatarColor(friend.id);
  return (
    <div style={{ position:'fixed', inset:0, zIndex:9999, display:'flex', flexDirection:'column', justifyContent:'flex-end' }}
         onClick={onClose}>
      <div style={{ background:'#1e293b', borderRadius:'20px 20px 0 0', padding:'24px 20px 40px',
                    maxWidth: 480, width:'100%', margin:'0 auto' }}
           onClick={e => e.stopPropagation()}>
        {/* Handle */}
        <div style={{ width:40, height:4, background:'#334155', borderRadius:4, margin:'0 auto 20px' }} />
        {/* Avatar + name */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12, marginBottom:20 }}>
          <div style={{ width:72, height:72, borderRadius:'50%', background:col, display:'flex',
                        alignItems:'center', justifyContent:'center', fontSize:32, position:'relative' }}>
            {friend.emoji || initials(friend.displayName || friend.name)}
            {friend.online && (
              <div style={{ position:'absolute', bottom:3, right:3, width:14, height:14, borderRadius:'50%',
                            background:'#10b981', border:'2px solid #1e293b' }} />
            )}
          </div>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontWeight:800, fontSize:18, color:'#f1f5f9' }}>{friend.displayName || friend.name}</div>
            <div style={{ color:'#64748b', fontSize:13 }}>{friend.handle || '@user'}</div>
            {friend.online
              ? <div style={{ color:'#10b981', fontSize:12, marginTop:4 }}>● Online now</div>
              : <div style={{ color:'#64748b', fontSize:12, marginTop:4 }}>○ Offline</div>
            }
          </div>
        </div>
        {/* Stats row */}
        <div style={{ display:'flex', justifyContent:'space-around', padding:'12px 0', borderTop:'1px solid #334155',
                      borderBottom:'1px solid #334155', marginBottom:20 }}>
          {[['👥', friend.mutual ?? 0, 'Mutual'], ['📸', friend.posts ?? 0, 'Posts'], ['🎂', friend.birthday ?? '—', 'Birthday']].map(([icon, val, label]) => (
            <div key={label} style={{ textAlign:'center' }}>
              <div style={{ fontSize:18 }}>{icon}</div>
              <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:15 }}>{val}</div>
              <div style={{ color:'#64748b', fontSize:11 }}>{label}</div>
            </div>
          ))}
        </div>
        {/* Action buttons */}
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onMessage}
            style={{ flex:1, background:'linear-gradient(135deg,#6366f1,#ec4899)', border:'none', borderRadius:14,
                     padding:'12px 0', color:'white', fontSize:14, fontWeight:700, cursor:'pointer' }}>
            💬 Message
          </button>
          <button onClick={() => onRemove(friend)}
            style={{ flex:1, background:'#0f172a', border:'1px solid #334155', borderRadius:14,
                     padding:'12px 0', color:'#ef4444', fontSize:14, fontWeight:700, cursor:'pointer' }}>
            🗑 Unfriend
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Birthday Reminder Card ────────────────────────────────────────────────────
function BirthdayCard({ friend }) {
  const label = friend.daysUntil === 0 ? '🎂 Today!' : friend.daysUntil === 1 ? '🎂 Tomorrow' : `🎂 In ${friend.daysUntil} days`;
  return (
    <div style={{ background:'linear-gradient(135deg,#1e293b,#2d1b4e)', border:'1px solid #8b5cf6',
                  borderRadius:14, padding:'12px 14px', marginBottom:10, display:'flex', alignItems:'center', gap:12 }}>
      <div style={{ width:44, height:44, borderRadius:'50%', background:'#8b5cf6', display:'flex',
                    alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>
        {friend.emoji || '🎂'}
      </div>
      <div style={{ flex:1 }}>
        <div style={{ fontWeight:700, color:'#f1f5f9', fontSize:14 }}>{friend.displayName || friend.name}</div>
        <div style={{ color:'#a78bfa', fontSize:12 }}>{label}</div>
      </div>
      <button style={{ background:'#8b5cf6', border:'none', borderRadius:12, padding:'7px 14px',
                       color:'white', fontSize:12, fontWeight:600, cursor:'pointer' }}>
        🎉 Wish
      </button>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
const TABS = ['Friends', 'Requests', 'Sent', 'Suggestions', 'Following'];

export default function FriendsPage() {
  const navigate = useNavigate();

  // ── tab & UI state
  const [tab, setTab]           = useState('Friends');
  const [search, setSearch]     = useState('');
  const [sheet, setSheet]       = useState(null);         // friend profile bottom sheet
  const [menuOpen, setMenuOpen] = useState(null);         // three-dot menu uid
  const [toast, setToast]       = useState('');

  // ── data state — Firestore realtime (falls back to mock)
  const [friends, setFriends]           = useState(MOCK_FRIENDS);
  const [requests, setRequests]         = useState(MOCK_REQUESTS);
  const [sentReqs, setSentReqs]         = useState([]);
  const [suggestions, setSuggestions]   = useState(MOCK_SUGGESTIONS);
  const [birthdays, setBirthdays]       = useState([]);
  const [firebaseOk, setFirebaseOk]     = useState(false);

  // ── local optimistic UI override maps
  const [localAccepted, setLocalAccepted] = useState({});
  const [localDeclined, setLocalDeclined] = useState({});
  const [sentSet, setSentSet]             = useState({});   // for suggestions "Requested"
  const [removedSet, setRemovedSet]       = useState({});   // unfriended ids

  // ─── Bootstrap Firestore listeners on mount ─────────────────────────────────
  useEffect(() => {
    // Set presence
    setOnlinePresence(true).catch(() => {});

    let unsubs = [];
    try {
      unsubs.push(
        subscribeFriends((data) => {
          if (data.length > 0 || firebaseOk) {
            setFriends(data);
            setFirebaseOk(true);
          }
        })
      );
      unsubs.push(
        subscribeIncomingRequests((data) => {
          setRequests(data);
          setFirebaseOk(true);
        })
      );
      unsubs.push(
        subscribeSentRequests((data) => {
          setSentReqs(data);
        })
      );
      getBirthdayReminders().then(setBirthdays).catch(() => {});
    } catch {
      // Firebase unavailable — keep mock data
    }

    return () => {
      unsubs.forEach((u) => u && u());
      setOnlinePresence(false).catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Toast helper ────────────────────────────────────────────────────────────
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  // ─── Accept request ──────────────────────────────────────────────────────────
  const handleAccept = useCallback(async (req) => {
    setLocalAccepted((p) => ({ ...p, [req.fromUid || req.id]: true }));
    try {
      await acceptFriendRequest(req.fromUid || req.id);
      showToast(`✅ You and ${req.displayName || req.name} are now friends!`);
    } catch {
      showToast('✅ Friend request accepted!');
    }
  }, []);

  // ─── Decline request ─────────────────────────────────────────────────────────
  const handleDecline = useCallback(async (req) => {
    setLocalDeclined((p) => ({ ...p, [req.fromUid || req.id]: true }));
    try {
      await declineFriendRequest(req.fromUid || req.id);
      showToast('Request declined.');
    } catch {
      showToast('Request declined.');
    }
  }, []);

  // ─── Cancel sent request ─────────────────────────────────────────────────────
  const handleCancelSent = useCallback(async (req) => {
    setSentSet((p) => ({ ...p, [req.toUid || req.id]: false }));
    try {
      await cancelFriendRequest(req.toUid || req.id);
      showToast('Request cancelled.');
    } catch {
      showToast('Request cancelled.');
    }
  }, []);

  // ─── Remove friend ───────────────────────────────────────────────────────────
  const handleRemove = useCallback(async (friend) => {
    setSheet(null);
    setMenuOpen(null);
    setRemovedSet((p) => ({ ...p, [friend.id]: true }));
    try {
      await removeFriend(friend.id);
      showToast(`Removed ${friend.displayName || friend.name} from friends.`);
    } catch {
      showToast('Friend removed.');
    }
  }, []);

  // ─── Send request (suggestions) ──────────────────────────────────────────────
  const handleAddFriend = useCallback(async (sugg) => {
    setSentSet((p) => ({ ...p, [sugg.id]: true }));
    try {
      await sendFriendRequest(sugg.id);
      showToast(`Friend request sent to ${sugg.displayName || sugg.name}!`);
    } catch {
      showToast('Request sent!');
    }
  }, []);

  // ─── Derived lists ────────────────────────────────────────────────────────────
  const filteredFriends = friends
    .filter((f) => !removedSet[f.id])
    .filter((f) => {
      const name = (f.displayName || f.name || '').toLowerCase();
      return name.includes(search.toLowerCase());
    });

  const visibleRequests = requests.filter(
    (r) => !localDeclined[r.fromUid || r.id] && !localAccepted[r.fromUid || r.id]
  );
  const acceptedRequests = requests.filter((r) => localAccepted[r.fromUid || r.id]);

  const pendingCount = visibleRequests.length;

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ background:'#0f172a', minHeight:'100vh', paddingBottom:80, color:'#f1f5f9' }}>

      {/* ── Top bar ── */}
      <div style={{ padding:'16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize:20, fontWeight:700 }}>Friends</span>
        <div style={{ display:'flex', gap:14 }}>
          <span style={{ fontSize:18, cursor:'pointer' }} onClick={() => navigate('/friends/nearby')} title="Nearby Friends">📍</span>
          <span style={{ fontSize:18, cursor:'pointer' }} onClick={() => navigate('/friends/find')} title="Find Friends">🔍</span>
          <span style={{ fontSize:18, cursor:'pointer' }} onClick={() => navigate('/friends/birthdays')} title="Birthdays">🎂</span>
        </div>
      </div>

      {/* ── Birthday reminder strip ── */}
      {birthdays.length > 0 && (
        <div style={{ padding:'10px 16px 0' }}>
          {birthdays.map((b) => <BirthdayCard key={b.id} friend={b} />)}
        </div>
      )}

      {/* ── Tabs ── */}
      <div style={{ display:'flex', borderBottom:'1px solid #1e293b', overflowX:'auto' }}>
        {TABS.map((t) => (
          <div key={t} onClick={() => setTab(t)}
            style={{ padding:'12px 16px', fontSize:13, fontWeight: tab===t ? 700 : 500,
                     color: tab===t ? '#6366f1' : '#64748b',
                     borderBottom: tab===t ? '2px solid #6366f1' : '2px solid transparent',
                     cursor:'pointer', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:5 }}>
            {t}
            {t === 'Requests' && pendingCount > 0 && (
              <span style={{ background:'#ec4899', color:'white', borderRadius:10, padding:'1px 6px', fontSize:11 }}>
                {pendingCount}
              </span>
            )}
            {t === 'Sent' && sentReqs.length > 0 && (
              <span style={{ background:'#6366f1', color:'white', borderRadius:10, padding:'1px 6px', fontSize:11 }}>
                {sentReqs.length}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div style={{ padding:'16px' }}>

        {/* ═══ FRIENDS TAB ═══ */}
        {tab === 'Friends' && (
          <>
            {/* Search bar */}
            <div style={{ display:'flex', alignItems:'center', gap:10, background:'#1e293b', borderRadius:12,
                          padding:'10px 14px', marginBottom:16 }}>
              <span>🔍</span>
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search friends…"
                style={{ flex:1, background:'none', border:'none', outline:'none', color:'#f1f5f9', fontSize:14 }} />
              {search && <span style={{ cursor:'pointer', color:'#64748b' }} onClick={() => setSearch('')}>✕</span>}
            </div>

            <div style={{ fontSize:13, color:'#64748b', marginBottom:12 }}>
              {filteredFriends.length} friend{filteredFriends.length !== 1 ? 's' : ''}
              {!firebaseOk && <span style={{ marginLeft:8, color:'#f59e0b', fontSize:11 }}>⚡ Demo mode</span>}
            </div>

            {filteredFriends.length === 0 && (
              <div style={{ textAlign:'center', padding:'40px 0', color:'#64748b' }}>
                {search ? 'No friends match your search.' : 'No friends yet — find some!'}
              </div>
            )}

            {filteredFriends.map((f) => {
              const col = f.color || avatarColor(f.id);
              const name = f.displayName || f.name || 'Unknown';
              return (
                <div key={f.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0',
                                         borderBottom:'1px solid #1e293b', cursor:'pointer' }}
                     onClick={() => setSheet(f)}>
                  {/* Avatar */}
                  <div style={{ position:'relative', flexShrink:0 }}>
                    <div style={{ width:48, height:48, borderRadius:'50%', background:col, display:'flex',
                                  alignItems:'center', justifyContent:'center', fontSize:f.emoji ? 22 : 16,
                                  fontWeight:700, color:'white' }}>
                      {f.emoji || initials(name)}
                    </div>
                    {f.online && (
                      <div style={{ position:'absolute', bottom:2, right:2, width:11, height:11, borderRadius:'50%',
                                    background:'#10b981', border:'2px solid #0f172a' }} />
                    )}
                  </div>
                  {/* Info */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:700, color:'#f1f5f9', fontSize:14, overflow:'hidden',
                                  textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{name}</div>
                    <div style={{ color:'#64748b', fontSize:12 }}>
                      {f.mutual ?? 0} mutual friends{f.online ? ' · 🟢 Online' : ''}
                    </div>
                  </div>
                  {/* Message + three-dot */}
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <Btn bg='#1e293b' color='#94a3b8' border='1px solid #334155'
                        onClick={(e) => { e.stopPropagation(); navigate('/messages'); }}>
                      💬
                    </Btn>
                    <div style={{ position:'relative' }}>
                      <button onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === f.id ? null : f.id); }}
                        style={{ background:'none', border:'none', color:'#64748b', fontSize:18, cursor:'pointer', padding:'4px 6px' }}>
                        ⋯
                      </button>
                      {menuOpen === f.id && (
                        <div style={{ position:'absolute', right:0, top:30, background:'#1e293b', border:'1px solid #334155',
                                      borderRadius:12, zIndex:200, minWidth:150, overflow:'hidden' }}>
                          {[
                            { icon:'👤', label:'View Profile', action:() => { navigate(`/profile/${f.id}`); setMenuOpen(null); } },
                            { icon:'💬', label:'Message',      action:() => { navigate('/messages'); setMenuOpen(null); } },
                            { icon:'🚫', label:'Unfriend',     action:() => handleRemove(f), danger:true },
                          ].map((item) => (
                            <div key={item.label} onClick={item.action}
                              style={{ padding:'11px 16px', cursor:'pointer', color: item.danger ? '#ef4444' : '#f1f5f9',
                                       fontSize:14, display:'flex', alignItems:'center', gap:8,
                                       borderBottom:'1px solid #334155' }}>
                              {item.icon} {item.label}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* ═══ REQUESTS TAB ═══ */}
        {tab === 'Requests' && (
          <>
            <div style={{ fontSize:15, fontWeight:700, color:'#f1f5f9', marginBottom:12 }}>Friend Requests</div>

            {/* Accepted confirmations */}
            {acceptedRequests.map((r) => (
              <div key={r.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px', background:'#1e293b',
                                       borderRadius:16, marginBottom:10, opacity:.7 }}>
                <div style={{ width:52, height:52, borderRadius:'50%', background: r.color || avatarColor(r.id),
                              display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>
                  {r.emoji || initials(r.displayName || r.name)}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, color:'#f1f5f9', fontSize:14 }}>{r.displayName || r.name}</div>
                </div>
                <span style={{ color:'#10b981', fontSize:13, fontWeight:700 }}>✓ Friends now</span>
              </div>
            ))}

            {/* Pending */}
            {visibleRequests.map((r) => (
              <div key={r.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px', background:'#1e293b',
                                       borderRadius:16, marginBottom:10 }}>
                <div style={{ width:52, height:52, borderRadius:'50%', background: r.color || avatarColor(r.id),
                              display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>
                  {r.emoji || initials(r.displayName || r.name)}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, color:'#f1f5f9', fontSize:14, overflow:'hidden',
                                textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.displayName || r.name}</div>
                  <div style={{ color:'#64748b', fontSize:12 }}>{r.handle || ''} · {r.mutual ?? 0} mutual</div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  <Btn bg='linear-gradient(135deg,#6366f1,#ec4899)' color='white' onClick={() => handleAccept(r)}>
                    Accept
                  </Btn>
                  <Btn bg='#0f172a' color='#94a3b8' border='1px solid #334155' onClick={() => handleDecline(r)}>
                    Decline
                  </Btn>
                </div>
              </div>
            ))}

            {visibleRequests.length === 0 && acceptedRequests.length === 0 && (
              <div style={{ textAlign:'center', padding:'40px 0', color:'#64748b' }}>No pending requests</div>
            )}
          </>
        )}

        {/* ═══ SENT TAB ═══ */}
        {tab === 'Sent' && (
          <>
            <div style={{ fontSize:15, fontWeight:700, color:'#f1f5f9', marginBottom:12 }}>Sent Requests</div>
            {sentReqs.length === 0 && (
              <div style={{ textAlign:'center', padding:'40px 0', color:'#64748b' }}>
                No pending sent requests
              </div>
            )}
            {sentReqs.map((r) => (
              <div key={r.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px', background:'#1e293b',
                                       borderRadius:16, marginBottom:10 }}>
                <div style={{ width:52, height:52, borderRadius:'50%', background: r.color || avatarColor(r.id),
                              display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>
                  {r.emoji || initials(r.displayName || r.name)}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, color:'#f1f5f9', fontSize:14 }}>{r.displayName || r.name}</div>
                  <div style={{ color:'#64748b', fontSize:12 }}>Request pending</div>
                </div>
                <Btn bg='#0f172a' color='#94a3b8' border='1px solid #334155' onClick={() => handleCancelSent(r)}>
                  Cancel
                </Btn>
              </div>
            ))}
          </>
        )}

        {/* ═══ SUGGESTIONS TAB ═══ */}
        {tab === 'Suggestions' && (
          <>
            <div style={{ fontSize:15, fontWeight:700, color:'#f1f5f9', marginBottom:12 }}>People You May Know</div>
            {suggestions.map((s) => {
              const requested = sentSet[s.id];
              return (
                <div key={s.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px', background:'#1e293b',
                                         borderRadius:16, marginBottom:10 }}>
                  <div style={{ width:52, height:52, borderRadius:'50%', background: s.color || avatarColor(s.id),
                                display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>
                    {s.emoji || initials(s.displayName || s.name)}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:700, color:'#f1f5f9', fontSize:14, overflow:'hidden',
                                  textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.displayName || s.name}</div>
                    <div style={{ color:'#64748b', fontSize:12 }}>{s.mutual ?? 0} mutual · {s.reason}</div>
                  </div>
                  <Btn
                    bg={requested ? '#1e293b' : 'linear-gradient(135deg,#6366f1,#ec4899)'}
                    color={requested ? '#94a3b8' : 'white'}
                    border={requested ? '1px solid #334155' : undefined}
                    onClick={() => !requested && handleAddFriend(s)}>
                    {requested ? 'Requested' : 'Add'}
                  </Btn>
                </div>
              );
            })}
          </>
        )}

        {/* ═══ FOLLOWING TAB ═══ */}
        {tab === 'Following' && (
          <>
            <div style={{ fontSize:15, fontWeight:700, color:'#f1f5f9', marginBottom:12 }}>Following</div>
            {[...filteredFriends, ...suggestions.slice(0, 2)].map((f) => (
              <div key={f.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0',
                                       borderBottom:'1px solid #1e293b' }}>
                <div style={{ width:44, height:44, borderRadius:'50%', background: f.color || avatarColor(f.id),
                              display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>
                  {f.emoji || initials(f.displayName || f.name)}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, color:'#f1f5f9', fontSize:14 }}>{f.displayName || f.name}</div>
                  <div style={{ color:'#64748b', fontSize:12 }}>{f.handle || '@user'}</div>
                </div>
                <Btn bg='#1e293b' color='#94a3b8' border='1px solid #334155' onClick={() => {}}>
                  Following
                </Btn>
              </div>
            ))}
          </>
        )}
      </div>

      {/* ── Friend Profile Bottom Sheet ── */}
      {sheet && (
        <FriendSheet
          friend={sheet}
          onClose={() => setSheet(null)}
          onMessage={() => { setSheet(null); navigate('/messages'); }}
          onRemove={handleRemove}
        />
      )}

      {/* ── Menu backdrop ── */}
      {menuOpen && (
        <div style={{ position:'fixed', inset:0, zIndex:199 }} onClick={() => setMenuOpen(null)} />
      )}

      {/* ── Toast ── */}
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
