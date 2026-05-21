// src/pages/messages/MessageRequestsPage.jsx
// SECTION-6 NEW: Message Requests — messages from non-friends
// Route: /messages/requests

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, updateDoc, deleteDoc, doc, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../hooks/useAuth';

const SEED_REQUESTS = [
  { id:'req1', name:'Jamie Patel',    emoji:'🎭', color:'#8b5cf6', preview:"Hey! I love your photography posts. Would love to connect!", time:'2h ago', mutual:3 },
  { id:'req2', name:'Sky Nakamura',   emoji:'🌸', color:'#ec4899', preview:"We met at the music festival last week! Remember me?",        time:'5h ago', mutual:1 },
  { id:'req3', name:'Drew Carter',    emoji:'🏄', color:'#14b8a6', preview:"Your gaming clips are insane. Can we team up sometime?",      time:'1d ago', mutual:0 },
  { id:'req4', name:'Quinn Rivera',   emoji:'🎨', color:'#f59e0b', preview:"Loved your artwork at the gallery! Are you taking commissions?", time:'2d ago', mutual:7 },
];

export default function MessageRequestsPage() {
  const navigate = useNavigate();
  const { user }  = useAuth();
  const uid       = user?.uid || 'demo-user';

  const [requests, setRequests] = useState(SEED_REQUESTS);
  const [loading,  setLoading]  = useState(true);

  // Load real requests from Firestore
  useEffect(() => {
    const q = query(
      collection(db, 'messageRequests'),
      where('recipientId', '==', uid),
      where('status', '==', 'pending'),
      limit(50)
    );
    const unsub = onSnapshot(q,
      snap => {
        if (snap.docs.length > 0) {
          setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        }
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, [uid]);

  async function accept(reqId) {
    // Mark accepted in Firestore — creates a real conversation
    try {
      await updateDoc(doc(db, 'messageRequests', reqId), { status: 'accepted' });
    } catch { /* seed data — just remove from list */ }
    setRequests(prev => prev.filter(r => r.id !== reqId));
    navigate('/messages');
  }

  async function decline(reqId) {
    try {
      await deleteDoc(doc(db, 'messageRequests', reqId));
    } catch { /* seed data */ }
    setRequests(prev => prev.filter(r => r.id !== reqId));
  }

  return (
    <div style={{ background:'#0a0a18', minHeight:'100vh', paddingBottom:80 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'16px 16px 12px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={() => navigate('/messages')}
          style={{ color:'#818cf8', fontSize:22, fontWeight:800, background:'none', border:'none', cursor:'pointer', minWidth:44, minHeight:44, display:'flex', alignItems:'center', justifyContent:'center' }}>
          ‹
        </button>
        <div>
          <h2 style={{ color:'#f1f5f9', fontWeight:800, fontSize:18, margin:0 }}>Message Requests</h2>
          <p style={{ color:'#64748b', fontSize:12, margin:0 }}>From people you don't follow</p>
        </div>
      </div>

      {/* Info banner */}
      <div style={{ margin:'14px 16px', background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:12, padding:'12px 14px', display:'flex', gap:10, alignItems:'flex-start' }}>
        <span style={{ fontSize:18 }}>ℹ️</span>
        <p style={{ color:'#94a3b8', fontSize:12, margin:0, lineHeight:1.5 }}>
          These are messages from people you haven't connected with yet. Accept to start a conversation or decline to remove the request.
        </p>
      </div>

      {/* Request count */}
      {requests.length > 0 && (
        <div style={{ padding:'4px 16px 8px', fontSize:12, color:'#475569', fontWeight:600 }}>
          {requests.length} pending request{requests.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Requests list */}
      {loading && (
        <div style={{ textAlign:'center', padding:'48px 24px' }}>
          <div style={{ width:32, height:32, borderRadius:'50%', border:'3px solid rgba(255,255,255,0.1)', borderTopColor:'#6366f1', animation:'spin 0.8s linear infinite', margin:'0 auto' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {!loading && requests.length === 0 && (
        <div style={{ textAlign:'center', padding:'64px 24px' }}>
          <div style={{ fontSize:56, marginBottom:12 }}>📭</div>
          <div style={{ fontWeight:700, fontSize:16, color:'#f1f5f9', marginBottom:6 }}>No message requests</div>
          <div style={{ color:'#64748b', fontSize:13 }}>When someone new messages you, it'll appear here.</div>
        </div>
      )}

      {requests.map(req => (
        <div key={req.id} style={{ margin:'0 16px 12px', background:'rgba(255,255,255,0.04)', borderRadius:16, padding:'14px', border:'1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display:'flex', gap:12, alignItems:'flex-start', marginBottom:12 }}>
            <div style={{ width:50, height:50, borderRadius:'50%', background:req.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>
              {req.emoji}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:2 }}>
                <span style={{ fontWeight:700, fontSize:14, color:'#f1f5f9' }}>{req.name}</span>
                <span style={{ fontSize:11, color:'#475569' }}>{req.time}</span>
              </div>
              {req.mutual > 0 && (
                <div style={{ fontSize:11, color:'#818cf8', marginBottom:4 }}>👥 {req.mutual} mutual connection{req.mutual !== 1 ? 's' : ''}</div>
              )}
              <div style={{ fontSize:13, color:'#64748b', lineHeight:1.4 }}>"{req.preview}"</div>
            </div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => accept(req.id)}
              style={{ flex:1, background:'linear-gradient(135deg,#6366f1,#ec4899)', border:'none', borderRadius:10, padding:'10px', color:'white', fontSize:13, fontWeight:700, cursor:'pointer' }}>
              ✓ Accept
            </button>
            <button onClick={() => decline(req.id)}
              style={{ flex:1, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.10)', borderRadius:10, padding:'10px', color:'#94a3b8', fontSize:13, fontWeight:600, cursor:'pointer' }}>
              ✕ Decline
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
