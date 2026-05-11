// LiveModerationPage.jsx — /live/moderation
// Session 5 — REC-5.11: Subscriber-only chat toggle (persists to Firestore)
// Previously implemented: ban/timeout/word-filter/slow-mode

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  doc, onSnapshot, updateDoc, collection, query,
  orderBy, getDocs, addDoc, serverTimestamp, deleteDoc,
} from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import useAppStore from '@store/useAppStore';

export default function LiveModerationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const showToast = useAppStore(s => s.showToast);
  const uid = auth.currentUser?.uid;

  // streamId comes from query param or latest active stream
  const [streamId, setStreamId] = useState(searchParams.get('stream') || null);
  const [stream, setStream] = useState(null);
  const [messages, setMessages] = useState([]);
  const [bannedUsers, setBannedUsers] = useState([]);
  const [blockedWords, setBlockedWords] = useState([]);
  const [newWord, setNewWord] = useState('');
  const [slowMode, setSlowMode] = useState(0); // seconds
  const [loading, setLoading] = useState(true);

  // REC-5.11: Subscriber-only chat toggle
  const [subscriberOnly, setSubscriberOnly] = useState(false);
  const [togglingSubscriber, setTogglingSubscriber] = useState(false);

  // Load stream
  useEffect(() => {
    if (!streamId) { setLoading(false); return; }
    const unsub = onSnapshot(doc(db, 'streams', streamId), snap => {
      if (snap.exists()) {
        const data = snap.data();
        setStream({ id: snap.id, ...data });
        setBannedUsers(data.bannedUsers || []);
        setBlockedWords(data.blockedWords || []);
        setSlowMode(data.slowMode || 0);
        // REC-5.11: Sync subscriber-only state
        setSubscriberOnly(data.subscriberOnlyChat || false);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [streamId]);

  // Load recent messages
  useEffect(() => {
    if (!streamId) return;
    const q = query(collection(db, 'streams', streamId, 'messages'), orderBy('timestamp', 'desc'));
    getDocs(q).then(snap => setMessages(snap.docs.slice(0, 50).map(d => ({ id: d.id, ...d.data() }))));
  }, [streamId]);

  const isStreamer = stream?.uid === uid;

  // REC-5.11: Toggle subscriber-only chat
  const toggleSubscriberOnly = useCallback(async () => {
    if (!streamId || !isStreamer) return;
    setTogglingSubscriber(true);
    const next = !subscriberOnly;
    try {
      await updateDoc(doc(db, 'streams', streamId), { subscriberOnlyChat: next });
      setSubscriberOnly(next);
      showToast(next ? '🔒 Chat restricted to subscribers' : '🔓 Chat open to all');
    } catch { showToast('Failed to update chat mode'); }
    finally { setTogglingSubscriber(false); }
  }, [streamId, isStreamer, subscriberOnly, showToast]);

  const banUser = async (msgUid, userName) => {
    if (!streamId || !isStreamer) return;
    try {
      const updated = [...new Set([...bannedUsers, msgUid])];
      await updateDoc(doc(db, 'streams', streamId), { bannedUsers: updated });
      setBannedUsers(updated);
      showToast(`🚫 ${userName} banned`);
    } catch { showToast('Ban failed'); }
  };

  const unbanUser = async (msgUid) => {
    if (!streamId || !isStreamer) return;
    try {
      const updated = bannedUsers.filter(id => id !== msgUid);
      await updateDoc(doc(db, 'streams', streamId), { bannedUsers: updated });
      setBannedUsers(updated);
      showToast('✓ User unbanned');
    } catch {}
  };

  const deleteMessage = async (msgId) => {
    if (!streamId || !isStreamer) return;
    try {
      await deleteDoc(doc(db, 'streams', streamId, 'messages', msgId));
      setMessages(msgs => msgs.filter(m => m.id !== msgId));
      showToast('🗑 Message deleted');
    } catch { showToast('Delete failed'); }
  };

  const addBlockedWord = async () => {
    const word = newWord.trim().toLowerCase();
    if (!word || !streamId || !isStreamer) return;
    const updated = [...new Set([...blockedWords, word])];
    try {
      await updateDoc(doc(db, 'streams', streamId), { blockedWords: updated });
      setBlockedWords(updated);
      setNewWord('');
      showToast(`Word "${word}" blocked`);
    } catch {}
  };

  const removeBlockedWord = async (word) => {
    const updated = blockedWords.filter(w => w !== word);
    try {
      await updateDoc(doc(db, 'streams', streamId), { blockedWords: updated });
      setBlockedWords(updated);
    } catch {}
  };

  const setSlowModeValue = async (seconds) => {
    if (!streamId || !isStreamer) return;
    try {
      await updateDoc(doc(db, 'streams', streamId), { slowMode: seconds });
      setSlowMode(seconds);
      showToast(seconds > 0 ? `⏱ Slow mode: ${seconds}s` : 'Slow mode off');
    } catch {}
  };

  if (loading) return (
    <div style={{ background:'#0a0a18', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ color:'#94a3b8', fontSize:'14px' }}>Loading…</div>
    </div>
  );

  if (!streamId || !stream) return (
    <div style={{ background:'#0a0a18', minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'12px', padding:'24px' }}>
      <div style={{ fontSize:'40px' }}>🛡️</div>
      <div style={{ color:'#f1f5f9', fontWeight:700 }}>No active stream</div>
      <div style={{ color:'#64748b', fontSize:'13px', textAlign:'center' }}>Go live first, then open moderation from the setup page</div>
      <button onClick={() => navigate('/live/setup')}
        style={{ background:'#ef4444', border:'none', borderRadius:'12px', padding:'10px 24px', color:'white', fontWeight:700, cursor:'pointer' }}>
        Go Live
      </button>
    </div>
  );

  return (
    <div style={{ background:'#0a0a18', minHeight:'100vh', paddingBottom:'80px' }}>
      {/* Header */}
      <div style={{ padding:'12px 16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', gap:'10px' }}>
        <button onClick={() => navigate(-1)} style={{ background:'none', border:'none', color:'#94a3b8', fontSize:'20px', cursor:'pointer' }}>←</button>
        <span style={{ fontSize:'16px', fontWeight:800, color:'#f1f5f9', flex:1 }}>🛡️ Moderation</span>
        <span style={{ color:'#ef4444', fontSize:'11px', fontWeight:700 }}>● LIVE</span>
      </div>

      <div style={{ padding:'14px 16px', display:'flex', flexDirection:'column', gap:'14px' }}>

        {/* REC-5.11: Subscriber-only chat toggle */}
        <div style={{ background:'#1e293b', borderRadius:'14px', padding:'14px', border:'1px solid #334155' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            <div style={{ flex:1 }}>
              <div style={{ color:'#f1f5f9', fontSize:'14px', fontWeight:700 }}>🔒 Subscriber-Only Chat</div>
              <div style={{ color:'#64748b', fontSize:'11px', marginTop:'2px' }}>
                {subscriberOnly ? 'Only your followers can chat' : 'Everyone can chat'}
              </div>
            </div>
            <button
              onClick={toggleSubscriberOnly}
              disabled={togglingSubscriber || !isStreamer}
              style={{
                width:'48px', height:'26px', borderRadius:'13px', border:'none', cursor: isStreamer ? 'pointer' : 'not-allowed',
                background: subscriberOnly ? '#ef4444' : '#334155',
                position:'relative', transition:'background 0.2s',
              }}>
              <div style={{
                position:'absolute', top:'3px', left: subscriberOnly ? '25px' : '3px',
                width:'20px', height:'20px', borderRadius:'50%', background:'white',
                transition:'left 0.2s',
              }} />
            </button>
          </div>
          {subscriberOnly && (
            <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'8px',
              padding:'8px 10px', marginTop:'10px', color:'#fca5a5', fontSize:'12px' }}>
              ⚠️ Non-followers cannot type in chat. Their messages will be rejected.
            </div>
          )}
        </div>

        {/* Slow mode */}
        <div style={{ background:'#1e293b', borderRadius:'14px', padding:'14px', border:'1px solid #334155' }}>
          <div style={{ color:'#f1f5f9', fontSize:'14px', fontWeight:700, marginBottom:'8px' }}>⏱ Slow Mode</div>
          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
            {[0, 3, 5, 10, 30].map(s => (
              <button key={s} onClick={() => setSlowModeValue(s)}
                style={{ background: slowMode === s ? '#ef4444' : '#334155', border:'none', borderRadius:'8px',
                  padding:'6px 14px', color: slowMode === s ? 'white' : '#94a3b8', fontSize:'12px', fontWeight:600, cursor:'pointer' }}>
                {s === 0 ? 'Off' : `${s}s`}
              </button>
            ))}
          </div>
        </div>

        {/* Blocked words */}
        <div style={{ background:'#1e293b', borderRadius:'14px', padding:'14px', border:'1px solid #334155' }}>
          <div style={{ color:'#f1f5f9', fontSize:'14px', fontWeight:700, marginBottom:'8px' }}>🚫 Blocked Words</div>
          <div style={{ display:'flex', gap:'8px', marginBottom:'8px' }}>
            <input value={newWord} onChange={e => setNewWord(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addBlockedWord()}
              placeholder="Add a word or phrase…"
              style={{ flex:1, background:'#0f172a', border:'1px solid #334155', borderRadius:'8px',
                padding:'8px 12px', color:'#f1f5f9', fontSize:'13px', outline:'none' }} />
            <button onClick={addBlockedWord}
              style={{ background:'#ef4444', border:'none', borderRadius:'8px', padding:'8px 14px', color:'white', fontWeight:700, cursor:'pointer', fontSize:'13px' }}>
              Add
            </button>
          </div>
          {blockedWords.length === 0 && (
            <div style={{ color:'#334155', fontSize:'12px' }}>No blocked words</div>
          )}
          <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
            {blockedWords.map(word => (
              <div key={word} style={{ background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)',
                borderRadius:'20px', padding:'3px 10px', display:'flex', alignItems:'center', gap:'6px' }}>
                <span style={{ color:'#fca5a5', fontSize:'12px' }}>{word}</span>
                <button onClick={() => removeBlockedWord(word)} style={{ background:'none', border:'none', color:'#ef4444', cursor:'pointer', fontSize:'12px', padding:0 }}>✕</button>
              </div>
            ))}
          </div>
        </div>

        {/* Banned users */}
        {bannedUsers.length > 0 && (
          <div style={{ background:'#1e293b', borderRadius:'14px', padding:'14px', border:'1px solid #334155' }}>
            <div style={{ color:'#f1f5f9', fontSize:'14px', fontWeight:700, marginBottom:'8px' }}>🚷 Banned Users ({bannedUsers.length})</div>
            <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
              {bannedUsers.map(uid2 => (
                <div key={uid2} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:'#0f172a', borderRadius:'8px', padding:'8px 12px' }}>
                  <span style={{ color:'#94a3b8', fontSize:'12px', fontFamily:'monospace' }}>{uid2.slice(0, 12)}…</span>
                  <button onClick={() => unbanUser(uid2)}
                    style={{ background:'#334155', border:'none', borderRadius:'6px', padding:'4px 10px', color:'#94a3b8', fontSize:'11px', cursor:'pointer' }}>
                    Unban
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent messages — delete / ban */}
        <div style={{ background:'#1e293b', borderRadius:'14px', padding:'14px', border:'1px solid #334155' }}>
          <div style={{ color:'#f1f5f9', fontSize:'14px', fontWeight:700, marginBottom:'8px' }}>💬 Recent Messages</div>
          {messages.length === 0 && <div style={{ color:'#334155', fontSize:'12px' }}>No messages yet</div>}
          <div style={{ display:'flex', flexDirection:'column', gap:'8px', maxHeight:'300px', overflowY:'auto' }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ display:'flex', gap:'8px', alignItems:'flex-start', background:'#0f172a', borderRadius:'8px', padding:'8px 10px' }}>
                <div style={{ flex:1 }}>
                  <span style={{ color:'#f59e0b', fontSize:'11px', fontWeight:700 }}>{msg.userName}: </span>
                  <span style={{ color:'#e2e8f0', fontSize:'12px' }}>{msg.text}</span>
                </div>
                <div style={{ display:'flex', gap:'4px', flexShrink:0 }}>
                  <button onClick={() => deleteMessage(msg.id)}
                    style={{ background:'rgba(239,68,68,0.2)', border:'none', borderRadius:'6px', padding:'3px 8px', color:'#f87171', fontSize:'11px', cursor:'pointer' }}>
                    🗑
                  </button>
                  {!bannedUsers.includes(msg.uid) && (
                    <button onClick={() => banUser(msg.uid, msg.userName)}
                      style={{ background:'rgba(239,68,68,0.2)', border:'none', borderRadius:'6px', padding:'3px 8px', color:'#f87171', fontSize:'11px', cursor:'pointer' }}>
                      🚫
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
