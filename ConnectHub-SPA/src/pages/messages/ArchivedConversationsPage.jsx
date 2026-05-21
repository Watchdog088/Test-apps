// src/pages/messages/ArchivedConversationsPage.jsx
// SECTION-6 NEW: Archived Conversations — swiped-away chats
// Route: /messages/archived

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, updateDoc, deleteDoc, doc, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../hooks/useAuth';

const SEED_ARCHIVED = [
  { id:'arc1', name:'Old Coworker Mike', emoji:'💼', color:'#475569', last:"See you at the reunion?",           time:'2 weeks ago', unread:0 },
  { id:'arc2', name:'Study Group 2024',  emoji:'📚', color:'#6366f1', last:"Final exam scores are in!",         time:'3 weeks ago', unread:0, isGroup:true },
  { id:'arc3', name:'Travel Buddy Lisa', emoji:'🌍', color:'#10b981', last:"That trip was unforgettable 🌅",    time:'1 month ago', unread:0 },
  { id:'arc4', name:'Hackathon Team',    emoji:'💻', color:'#f59e0b', last:"We shipped it! 🚀 Congrats team",  time:'2 months ago', unread:0, isGroup:true },
];

export default function ArchivedConversationsPage() {
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const uid       = user?.uid || 'demo-user';

  const [archived, setArchived] = useState(SEED_ARCHIVED);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');

  // Load archived conversations from Firestore
  useEffect(() => {
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', uid),
      where('archived', '==', true),
      limit(50)
    );
    const unsub = onSnapshot(q,
      snap => {
        if (snap.docs.length > 0) {
          setArchived(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        }
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, [uid]);

  async function unarchive(convId) {
    try {
      await updateDoc(doc(db, 'conversations', convId), { archived: false });
    } catch { /* seed data */ }
    setArchived(prev => prev.filter(c => c.id !== convId));
  }

  async function deleteConv(convId) {
    if (!window.confirm('Delete this conversation permanently?')) return;
    try {
      await deleteDoc(doc(db, 'conversations', convId));
    } catch { /* seed data */ }
    setArchived(prev => prev.filter(c => c.id !== convId));
  }

  const filtered = search.trim()
    ? archived.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    : archived;

  return (
    <div style={{ background:'#0a0a18', minHeight:'100vh', paddingBottom:80 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'16px 16px 12px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={() => navigate('/messages')}
          style={{ color:'#818cf8', fontSize:22, fontWeight:800, background:'none', border:'none', cursor:'pointer', minWidth:44, minHeight:44, display:'flex', alignItems:'center', justifyContent:'center' }}>
          ‹
        </button>
        <div>
          <h2 style={{ color:'#f1f5f9', fontWeight:800, fontSize:18, margin:0 }}>Archived</h2>
          <p style={{ color:'#64748b', fontSize:12, margin:0 }}>{archived.length} conversation{archived.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Search */}
      <div style={{ padding:'12px 16px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, background:'rgba(255,255,255,0.06)', borderRadius:12, padding:'9px 14px', border:'1px solid rgba(255,255,255,0.09)' }}>
          <span>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search archived…"
            style={{ flex:1, background:'none', border:'none', outline:'none', color:'#f1f5f9', fontSize:14 }} />
        </div>
      </div>

      {loading && (
        <div style={{ textAlign:'center', padding:'48px 24px' }}>
          <div style={{ width:32, height:32, borderRadius:'50%', border:'3px solid rgba(255,255,255,0.1)', borderTopColor:'#6366f1', animation:'spin 0.8s linear infinite', margin:'0 auto' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div style={{ textAlign:'center', padding:'64px 24px' }}>
          <div style={{ fontSize:56, marginBottom:12 }}>📦</div>
          <div style={{ fontWeight:700, fontSize:16, color:'#f1f5f9', marginBottom:6 }}>
            {search ? 'No matches found' : 'No archived conversations'}
          </div>
          <div style={{ color:'#64748b', fontSize:13 }}>
            {search ? 'Try a different search term.' : 'Swipe left on a conversation to archive it.'}
          </div>
        </div>
      )}

      {/* Archived list */}
      <div style={{ padding:'0 16px' }}>
        {filtered.map(conv => (
          <div key={conv.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
            {/* Avatar */}
            <div style={{ position:'relative', flexShrink:0 }}>
              <div style={{ width:48, height:48, borderRadius:'50%', background:conv.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, opacity:0.7 }}>
                {conv.emoji}
              </div>
              {conv.isGroup && (
                <span style={{ position:'absolute', bottom:0, right:0, width:16, height:16, background:'#6366f1', borderRadius:'50%', border:'2px solid #0a0a18', display:'flex', alignItems:'center', justifyContent:'center', fontSize:8 }}>G</span>
              )}
            </div>
            {/* Info */}
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontWeight:600, fontSize:14, color:'#94a3b8' }}>{conv.name}</span>
                <span style={{ fontSize:11, color:'#334155' }}>{conv.time}</span>
              </div>
              <div style={{ fontSize:12, color:'#475569', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{conv.last}</div>
            </div>
            {/* Actions */}
            <div style={{ display:'flex', gap:6, flexShrink:0 }}>
              <button onClick={() => unarchive(conv.id)} title="Unarchive"
                style={{ background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.25)', borderRadius:8, padding:'6px 10px', color:'#818cf8', fontSize:12, cursor:'pointer', fontWeight:600 }}>
                📤
              </button>
              <button onClick={() => deleteConv(conv.id)} title="Delete"
                style={{ background:'rgba(239,68,68,0.10)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:8, padding:'6px 10px', color:'#ef4444', fontSize:12, cursor:'pointer' }}>
                🗑
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer tip */}
      {archived.length > 0 && (
        <div style={{ textAlign:'center', padding:'24px 16px', color:'#334155', fontSize:12 }}>
          Tap 📤 to restore a conversation to your inbox
        </div>
      )}
    </div>
  );
}
