// /live/qa/:streamId — Q&A Session page for a live stream
// FIX: Q&A questions now saved to Firestore streams/{streamId}/qa subcollection
// Viewers submit questions; streamer can mark answered; real-time onSnapshot

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  collection, addDoc, onSnapshot, doc, updateDoc,
  serverTimestamp, orderBy, query, getDoc,
} from 'firebase/firestore';
import { db, auth } from '@/firebase/config';

export default function LiveQAPage() {
  const { streamId } = useParams();
  const navigate = useNavigate();
  const user = auth.currentUser;

  const [stream, setStream] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  const isStreamer = stream && user && stream.userId === user.uid;

  // Stream meta
  useEffect(() => {
    if (!streamId) return;
    getDoc(doc(db, 'streams', streamId))
      .then(snap => { if (snap.exists()) setStream({ id: snap.id, ...snap.data() }); })
      .finally(() => setLoading(false));
  }, [streamId]);

  // Real-time Q&A listener
  useEffect(() => {
    if (!streamId) return;
    const q = query(
      collection(db, 'streams', streamId, 'qa'),
      orderBy('createdAt', 'asc'),
    );
    return onSnapshot(q, snap => {
      setQuestions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
  }, [streamId]);

  async function submitQuestion() {
    if (!input.trim() || !user || sending) return;
    setSending(true);
    try {
      await addDoc(collection(db, 'streams', streamId, 'qa'), {
        text: input.trim(),
        authorId: user.uid,
        authorName: user.displayName || 'Viewer',
        authorPhoto: user.photoURL || null,
        answered: false,
        createdAt: serverTimestamp(),
      });
      setInput('');
    } catch (e) { console.error(e); }
    finally { setSending(false); }
  }

  async function markAnswered(qid) {
    try {
      await updateDoc(doc(db, 'streams', streamId, 'qa', qid), { answered: true });
    } catch (e) { console.error(e); }
  }

  if (loading) return (
    <div style={{ minHeight:'100dvh', background:'#0a0a18', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ color:'#94a3b8', fontSize:'14px' }}>Loading Q&A…</div>
    </div>
  );

  return (
    <div style={{ minHeight:'100dvh', background:'#0a0a18', display:'flex', flexDirection:'column' }}>
      {/* Header */}
      <div style={{ background:'#111827', padding:'12px 16px', display:'flex', alignItems:'center', gap:'12px',
        borderBottom:'1px solid #1e293b', position:'sticky', top:0, zIndex:10 }}>
        <button onClick={() => navigate(-1)} style={{ background:'none', border:'none', color:'#94a3b8', fontSize:'20px', cursor:'pointer' }}>←</button>
        <div style={{ flex:1 }}>
          <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'15px' }}>🙋 Q&A Session</div>
          {stream && <div style={{ color:'#64748b', fontSize:'12px' }}>{stream.title || 'Live Stream'}</div>}
        </div>
        <button onClick={() => navigate(`/live/watch/${streamId}`)}
          style={{ background:'#ef4444', border:'none', borderRadius:'8px', padding:'6px 12px',
            color:'white', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>
          ● LIVE
        </button>
      </div>

      {/* Info banner for streamer */}
      {isStreamer && (
        <div style={{ background:'rgba(99,102,241,0.12)', borderBottom:'1px solid rgba(99,102,241,0.2)', padding:'10px 16px' }}>
          <div style={{ color:'#818cf8', fontSize:'12px', fontWeight:600 }}>
            🎙 You're the streamer — tap ✅ to mark questions as answered
          </div>
        </div>
      )}

      {/* Q&A List */}
      <div style={{ flex:1, overflowY:'auto', padding:'12px 16px' }}>
        {questions.length === 0 && (
          <div style={{ textAlign:'center', paddingTop:'60px' }}>
            <div style={{ fontSize:'48px', marginBottom:'12px' }}>🙋</div>
            <div style={{ color:'#94a3b8', fontSize:'15px', fontWeight:600, marginBottom:'6px' }}>No questions yet</div>
            <div style={{ color:'#475569', fontSize:'13px' }}>Be the first to ask something!</div>
          </div>
        )}

        {questions.map(q => (
          <div key={q.id} style={{
            background: q.answered ? 'rgba(16,185,129,0.08)' : '#1e293b',
            border: `1px solid ${q.answered ? 'rgba(16,185,129,0.2)' : '#334155'}`,
            borderRadius:'12px', padding:'12px', marginBottom:'10px',
          }}>
            <div style={{ display:'flex', alignItems:'flex-start', gap:'10px' }}>
              {/* Avatar */}
              <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'linear-gradient(135deg,#6366f1,#ec4899)',
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', fontWeight:700, color:'white', flexShrink:0 }}>
                {(q.authorName || '?')[0].toUpperCase()}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px' }}>
                  <span style={{ color:'#94a3b8', fontSize:'12px', fontWeight:600 }}>{q.authorName}</span>
                  {q.answered && <span style={{ background:'rgba(16,185,129,0.2)', color:'#34d399', fontSize:'10px', fontWeight:700, padding:'1px 6px', borderRadius:'10px' }}>✅ Answered</span>}
                  {q.authorId === user?.uid && <span style={{ background:'rgba(99,102,241,0.2)', color:'#818cf8', fontSize:'10px', padding:'1px 6px', borderRadius:'10px' }}>You</span>}
                </div>
                <div style={{ color:'#f1f5f9', fontSize:'14px', lineHeight:'1.5' }}>{q.text}</div>
              </div>
              {/* Mark answered — streamer only */}
              {isStreamer && !q.answered && (
                <button onClick={() => markAnswered(q.id)}
                  style={{ background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.3)', borderRadius:'8px',
                    padding:'4px 10px', color:'#34d399', fontSize:'12px', fontWeight:600, cursor:'pointer', flexShrink:0 }}>
                  ✅
                </button>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {user ? (
        <div style={{ padding:'12px 16px', background:'#111827', borderTop:'1px solid #1e293b',
          display:'flex', gap:'10px', alignItems:'flex-end' }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitQuestion(); } }}
            placeholder="Ask a question…"
            rows={2}
            style={{ flex:1, background:'#1e293b', border:'1px solid #334155', borderRadius:'10px',
              padding:'10px 12px', color:'#f1f5f9', fontSize:'13px', outline:'none', resize:'none', boxSizing:'border-box' }}
          />
          <button onClick={submitQuestion} disabled={sending || !input.trim()}
            style={{ background: input.trim() ? 'linear-gradient(135deg,#6366f1,#818cf8)' : '#334155',
              border:'none', borderRadius:'10px', padding:'10px 16px', color:'white',
              fontWeight:700, fontSize:'18px', cursor: input.trim() ? 'pointer' : 'not-allowed', flexShrink:0 }}>
            ➤
          </button>
        </div>
      ) : (
        <div style={{ padding:'12px 16px', background:'#111827', borderTop:'1px solid #1e293b', textAlign:'center' }}>
          <button onClick={() => navigate('/login')}
            style={{ background:'linear-gradient(135deg,#6366f1,#ec4899)', border:'none', borderRadius:'10px',
              padding:'10px 24px', color:'white', fontWeight:700, fontSize:'13px', cursor:'pointer' }}>
            Sign in to ask questions
          </button>
        </div>
      )}
    </div>
  );
}
