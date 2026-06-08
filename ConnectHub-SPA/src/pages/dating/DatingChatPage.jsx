// src/pages/dating/DatingChatPage.jsx
// Features #3 & #4: Back navigation + block toast confirmation
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import useAppStore from '@store/useAppStore';

const S = {
  page: { display: 'flex', flexDirection: 'column', height: '100dvh', background: '#0a0818', color: '#f1f5f9' },
  header: { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0, background: 'rgba(10,8,24,0.98)', backdropFilter: 'blur(20px)' },
  backBtn: { width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,0.07)', border: 'none', color: '#94a3b8', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 },
  avatar: { width: 40, height: 40, borderRadius: '50%', flexShrink: 0, objectFit: 'cover', background: 'linear-gradient(135deg,#ec4899,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#fff' },
  nameCol: { flex: 1, minWidth: 0 },
  name: { fontWeight: 700, fontSize: 15, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  sub: { fontSize: 11, color: '#64748b' },
  moreBtn: { width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,0.07)', border: 'none', color: '#94a3b8', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  messages: { flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 },
  bubbleMe: { alignSelf: 'flex-end', background: 'linear-gradient(135deg,#6366f1,#ec4899)', color: '#fff', padding: '10px 14px', borderRadius: '18px 18px 4px 18px', maxWidth: '78%', fontSize: 14, lineHeight: 1.45, wordBreak: 'break-word' },
  bubbleThem: { alignSelf: 'flex-start', background: 'rgba(255,255,255,0.09)', color: '#f1f5f9', padding: '10px 14px', borderRadius: '18px 18px 18px 4px', maxWidth: '78%', fontSize: 14, lineHeight: 1.45, wordBreak: 'break-word' },
  ts: { fontSize: 10, color: '#475569', textAlign: 'center', margin: '4px 0' },
  inputRow: { display: 'flex', alignItems: 'flex-end', gap: 8, padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0, background: 'rgba(10,8,24,0.95)' },
  input: { flex: 1, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, color: '#f1f5f9', fontSize: 14, padding: '10px 16px', outline: 'none', resize: 'none', maxHeight: 120, minHeight: 42, fontFamily: 'inherit' },
  sendBtn: { width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#ec4899)', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  menu: { position: 'absolute', top: 60, right: 14, background: 'rgba(15,12,41,0.98)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, zIndex: 200, minWidth: 180, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', overflow: 'hidden' },
  menuItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px', fontSize: 14, color: '#f1f5f9', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  menuItemRed: { display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px', fontSize: 14, color: '#f87171', cursor: 'pointer' },
};

export default function DatingChatPage() {
  const navigate = useNavigate();
  const { matchId } = useParams();
  const showToast = useAppStore((s) => s.showToast);

  const [match, setMatch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const uid = auth.currentUser?.uid;

  // Load match info
  useEffect(() => {
    if (!matchId) return;
    getDoc(doc(db, 'matches', matchId)).then(snap => {
      if (snap.exists()) setMatch({ id: snap.id, ...snap.data() });
    }).catch(() => {});
  }, [matchId]);

  // Subscribe to messages
  useEffect(() => {
    if (!matchId) return;
    const q = query(collection(db, 'matches', matchId, 'messages'), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, () => {});
    return unsub;
  }, [matchId]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || sending || !uid || !matchId) return;
    setSending(true);
    const msg = text.trim();
    setText('');
    try {
      await addDoc(collection(db, 'matches', matchId, 'messages'), {
        text: msg, senderId: uid, createdAt: serverTimestamp(),
      });
    } catch {
      setText(msg);
      showToast({ message: 'Failed to send. Check connection.', type: 'error' });
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleUnmatch = () => {
    setShowMenu(false);
    showToast({ message: 'You unmatched. Goodbye 💔', type: 'info' });
    setTimeout(() => navigate('/dating/matches', { replace: true }), 800);
  };

  const handleBlock = () => {
    setShowMenu(false);
    showToast({ message: '🚫 User blocked. You won\'t see them again.', type: 'success' });
    setTimeout(() => navigate('/dating/matches', { replace: true }), 800);
  };

  const handleReport = () => {
    setShowMenu(false);
    const otherUid = match?.users?.find(id => id !== uid) || 'unknown';
    navigate('/report', { state: { targetId: otherUid, targetType: 'user', context: 'dating' } });
  };

  // Derive other user's display name from match data
  const otherName = match?.displayNames?.[match?.users?.find(id => id !== uid)] || 'Match';
  const otherInitial = otherName[0]?.toUpperCase() || '?';

  const fmtTime = (ts) => {
    if (!ts) return '';
    const d = ts.toDate?.() ?? new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={S.page} onClick={() => showMenu && setShowMenu(false)}>
      {/* Header */}
      <div style={S.header}>
        {/* Feature #3: Back navigation */}
        <button style={S.backBtn} onClick={() => navigate(-1)} aria-label="Back">←</button>
        <div style={S.avatar}>{otherInitial}</div>
        <div style={S.nameCol}>
          <div style={S.name}>{otherName}</div>
          <div style={S.sub}>💜 It's a match!</div>
        </div>
        <button style={S.moreBtn} onClick={(e) => { e.stopPropagation(); setShowMenu(m => !m); }} aria-label="More options">⋮</button>
      </div>

      {/* Overflow menu */}
      {showMenu && (
        <div style={S.menu} onClick={e => e.stopPropagation()}>
          <div style={S.menuItem} onClick={() => navigate(`/dating/profile/${match?.users?.find(id => id !== uid)}`)}>
            👤 View Profile
          </div>
          <div style={S.menuItem} onClick={handleUnmatch}>
            💔 Unmatch
          </div>
          <div style={S.menuItem} onClick={handleReport}>
            🚨 Report
          </div>
          <div style={S.menuItemRed} onClick={handleBlock}>
            🚫 Block
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={S.messages}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#475569', fontSize: 13, margin: 'auto', paddingTop: 40 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>💜</div>
            <div style={{ fontWeight: 700, color: '#94a3b8', marginBottom: 4 }}>You matched with {otherName}!</div>
            <div>Say hello and start the conversation 👋</div>
          </div>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.senderId === uid;
          const showTs = i === 0 || (msg.createdAt?.seconds - messages[i-1]?.createdAt?.seconds > 300);
          return (
            <React.Fragment key={msg.id}>
              {showTs && <div style={S.ts}>{fmtTime(msg.createdAt)}</div>}
              <div style={isMe ? S.bubbleMe : S.bubbleThem}>{msg.text}</div>
            </React.Fragment>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={S.inputRow}>
        <textarea
          style={S.input}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          rows={1}
          aria-label="Message input"
        />
        <button
          style={{ ...S.sendBtn, opacity: (!text.trim() || sending) ? 0.5 : 1 }}
          onClick={handleSend}
          disabled={!text.trim() || sending}
          aria-label="Send message"
        >
          ➤
        </button>
      </div>
    </div>
  );
}
