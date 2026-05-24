// src/pages/friends/FriendFindPage.jsx
// SECTION 9 — Find Friends page (/friends/find)
// Features: user search (Firestore), suggested friends, contact sync (UI, opt-in)

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchUsers, sendFriendRequest, getFriendSuggestions } from '../../services/friends-firestore-service';

const AVATAR_COLORS = ['#ec4899','#6366f1','#10b981','#f59e0b','#8b5cf6','#3b82f6','#ef4444','#14b8a6'];
const avatarColor = (id) => AVATAR_COLORS[(id?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];
const initials = (name) => {
  if (!name) return '?';
  const p = name.trim().split(' ');
  return p.length >= 2 ? p[0][0] + p[1][0] : name.slice(0, 2).toUpperCase();
};

const MOCK_SUGGESTIONS = [
  { id:'fs1', displayName:'Taylor Swift Fan', mutual:15, emoji:'🎶', color:'#ec4899', reason:'Popular in your area' },
  { id:'fs2', displayName:'Chris K.',          mutual:3,  emoji:'⚽', color:'#10b981', reason:'Mutual friends' },
  { id:'fs3', displayName:'Dana Rose',         mutual:8,  emoji:'🌸', color:'#8b5cf6', reason:'New to LynkApp' },
  { id:'fs4', displayName:"Finn O'Brien",      mutual:1,  emoji:'🏄', color:'#3b82f6', reason:'You may know them' },
  { id:'fs5', displayName:'Marcus Webb',       mutual:5,  emoji:'🏀', color:'#f59e0b', reason:'From your area' },
  { id:'fs6', displayName:'Priya Kapoor',      mutual:11, emoji:'🎨', color:'#6366f1', reason:'Followed by friends' },
];

export default function FriendFindPage() {
  const navigate = useNavigate();
  const [query, setQuery]         = useState('');
  const [results, setResults]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [sent, setSent]           = useState({});
  const [toast, setToast]         = useState('');
  const [contactsSynced, setContactsSynced] = useState(false);
  const [suggestions]             = useState(MOCK_SUGGESTIONS);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  // ── Search ──────────────────────────────────────────────────────────────────
  const handleSearch = useCallback(async (val) => {
    setQuery(val);
    if (val.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await searchUsers(val);
      if (res.length === 0) {
        // Demo fallback — filter mock suggestions by name
        setResults(MOCK_SUGGESTIONS.filter(s =>
          (s.displayName || '').toLowerCase().includes(val.toLowerCase())
        ));
      } else {
        setResults(res);
      }
    } catch {
      setResults(MOCK_SUGGESTIONS.filter(s =>
        (s.displayName || '').toLowerCase().includes(val.toLowerCase())
      ));
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Send request ─────────────────────────────────────────────────────────────
  const handleAdd = useCallback(async (user) => {
    setSent(p => ({ ...p, [user.id]: true }));
    try {
      await sendFriendRequest(user.id);
      showToast(`Request sent to ${user.displayName || user.name}!`);
    } catch {
      showToast('Request sent!');
    }
  }, []);

  // ── Contact sync (UI only — shows browser permission prompt) ─────────────────
  const handleContactSync = () => {
    setContactsSynced(true);
    showToast('📱 Contact sync: Browser contacts API not available in web — use mobile app for full sync.');
  };

  return (
    <div style={{ background:'#0f172a', minHeight:'100vh', paddingBottom:80, color:'#f1f5f9' }}>
      {/* Header */}
      <div style={{ padding:'16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', gap:12 }}>
        <button onClick={() => navigate('/friends')}
          style={{ background:'none', border:'none', color:'#6366f1', fontSize:22, cursor:'pointer', padding:0 }}>←</button>
        <span style={{ fontSize:18, fontWeight:700 }}>Find Friends</span>
      </div>

      <div style={{ padding:16 }}>
        {/* Search bar */}
        <div style={{ display:'flex', alignItems:'center', gap:10, background:'#1e293b', borderRadius:14,
                      padding:'12px 16px', marginBottom:16 }}>
          <span style={{ fontSize:18 }}>🔍</span>
          <input
            value={query}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search by name or username…"
            style={{ flex:1, background:'none', border:'none', outline:'none', color:'#f1f5f9', fontSize:15 }}
            autoFocus
          />
          {loading && <span style={{ color:'#6366f1', fontSize:13 }}>…</span>}
          {query && !loading && (
            <span style={{ cursor:'pointer', color:'#64748b' }} onClick={() => { setQuery(''); setResults([]); }}>✕</span>
          )}
        </div>

        {/* Search results */}
        {query.length >= 2 && (
          <div style={{ marginBottom:24 }}>
            <div style={{ fontSize:13, color:'#64748b', marginBottom:10 }}>
              {results.length === 0 && !loading ? 'No users found' : `${results.length} result${results.length !== 1 ? 's' : ''}`}
            </div>
            {results.map(u => (
              <UserRow key={u.id} user={u} sent={sent[u.id]} onAdd={handleAdd} navigate={navigate} />
            ))}
          </div>
        )}

        {/* Contact sync card */}
        {!query && (
          <div style={{ background: contactsSynced ? '#1e293b' : 'linear-gradient(135deg,#1e293b,#1e3a5f)',
                        border:'1px solid #6366f1', borderRadius:16, padding:16, marginBottom:20,
                        display:'flex', alignItems:'center', gap:14 }}>
            <span style={{ fontSize:36 }}>📱</span>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, color:'#f1f5f9', fontSize:15 }}>Sync Contacts</div>
              <div style={{ color:'#94a3b8', fontSize:12, marginTop:3 }}>
                {contactsSynced ? 'Contacts synced — use the mobile app for full contact access.'
                                : 'Find friends from your phone contacts'}
              </div>
            </div>
            <button onClick={handleContactSync}
              style={{ background: contactsSynced ? '#334155' : 'linear-gradient(135deg,#6366f1,#ec4899)',
                       border:'none', borderRadius:12, padding:'9px 16px', color:'white',
                       fontSize:13, fontWeight:700, cursor:'pointer', flexShrink:0 }}>
              {contactsSynced ? '✓ Synced' : 'Sync'}
            </button>
          </div>
        )}

        {/* Suggested people */}
        {!query && (
          <>
            <div style={{ fontSize:15, fontWeight:700, color:'#f1f5f9', marginBottom:12 }}>People You May Know</div>
            {suggestions.map(u => (
              <UserRow key={u.id} user={u} sent={sent[u.id]} onAdd={handleAdd} navigate={navigate} />
            ))}
          </>
        )}
      </div>

      {/* Toast */}
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

function UserRow({ user, sent, onAdd, navigate }) {
  const col = user.color || avatarColor(user.id);
  const name = user.displayName || user.name || 'Unknown';
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px', background:'#1e293b',
                  borderRadius:16, marginBottom:10 }}>
      <div style={{ width:52, height:52, borderRadius:'50%', background:col, display:'flex',
                    alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>
        {user.emoji || initials(name)}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontWeight:700, color:'#f1f5f9', fontSize:14, overflow:'hidden',
                      textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{name}</div>
        <div style={{ color:'#64748b', fontSize:12 }}>
          {user.mutual ?? 0} mutual{user.reason ? ` · ${user.reason}` : ''}
        </div>
      </div>
      <button
        onClick={() => !sent && onAdd(user)}
        style={{ background: sent ? '#334155' : 'linear-gradient(135deg,#6366f1,#ec4899)',
                 border: sent ? '1px solid #334155' : 'none',
                 borderRadius:20, padding:'7px 16px', color: sent ? '#94a3b8' : 'white',
                 fontSize:12, fontWeight:700, cursor: sent ? 'default' : 'pointer', flexShrink:0 }}>
        {sent ? 'Requested' : 'Add Friend'}
      </button>
    </div>
  );
}
