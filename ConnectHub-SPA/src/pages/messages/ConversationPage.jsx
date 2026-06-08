import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase/config';
import {
  collection, doc, getDoc, addDoc, onSnapshot,
  query, orderBy, serverTimestamp, updateDoc
} from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';

export default function ConversationPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  // Load other participant info
  useEffect(() => {
    if (!conversationId || !user) return;
    const loadConvo = async () => {
      try {
        const convoDoc = await getDoc(doc(db, 'conversations', conversationId));
        if (convoDoc.exists()) {
          const data = convoDoc.data();
          const otherId = data.participants?.find(id => id !== user.uid);
          if (otherId) {
            const otherDoc = await getDoc(doc(db, 'users', otherId));
            if (otherDoc.exists()) setOtherUser({ uid: otherId, ...otherDoc.data() });
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadConvo();
  }, [conversationId, user]);

  // Real-time message subscription
  useEffect(() => {
    if (!conversationId) return;
    const q = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('createdAt', 'asc')
    );
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    return unsub;
  }, [conversationId]);

  const sendMessage = async () => {
    if (!newMsg.trim() || !user) return;
    const text = newMsg.trim();
    setNewMsg('');
    try {
      await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
        text,
        senderId: user.uid,
        senderName: user.displayName || 'You',
        senderAvatar: user.photoURL || '',
        createdAt: serverTimestamp(),
        type: 'text',
      });
      await updateDoc(doc(db, 'conversations', conversationId), {
        lastMessage: text,
        lastMessageAt: serverTimestamp(),
        lastSenderId: user.uid,
      });
    } catch (e) {
      console.error('Send failed:', e);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  if (loading) return (
    <div style={styles.page}>
      <div style={styles.loadingWrap}><div style={styles.spinner} /></div>
    </div>
  );

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => navigate('/messages')} style={styles.backBtn}>
          <span style={{ fontSize: 20 }}>←</span>
        </button>
        <div style={styles.avatarWrap}>
          {otherUser?.photoURL
            ? <img src={otherUser.photoURL} alt="" style={styles.avatar} />
            : <div style={styles.avatarPlaceholder}>{(otherUser?.displayName || '?')[0]}</div>
          }
          <div style={styles.onlineDot} />
        </div>
        <div>
          <div style={styles.userName}>{otherUser?.displayName || 'Unknown User'}</div>
          <div style={styles.userStatus}>Active now</div>
        </div>
        <div style={styles.headerActions}>
          <button style={styles.iconBtn} onClick={() => navigate(`/video-call/new?with=${otherUser?.uid}`)} title="Video call">📹</button>
          <button style={styles.iconBtn} title="Voice call">📞</button>
          <button style={styles.iconBtn} title="Info">ℹ️</button>
        </div>
      </div>

      {/* Messages */}
      <div style={styles.messageList}>
        {messages.length === 0 && (
          <div style={styles.emptyState}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
            <div style={styles.emptyTitle}>Start the conversation!</div>
            <div style={styles.emptySubtitle}>Say hi to {otherUser?.displayName || 'your contact'}</div>
          </div>
        )}
        {messages.map(msg => {
          const isMine = msg.senderId === user?.uid;
          return (
            <div key={msg.id} style={{ ...styles.msgRow, justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
              {!isMine && (
                <div style={styles.msgAvatar}>
                  {msg.senderAvatar
                    ? <img src={msg.senderAvatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                    : <span>{(msg.senderName || '?')[0]}</span>
                  }
                </div>
              )}
              <div style={{ ...styles.bubble, ...(isMine ? styles.bubbleMine : styles.bubbleTheirs) }}>
                <div style={styles.bubbleText}>{msg.text}</div>
                <div style={styles.bubbleTime}>
                  {msg.createdAt?.toDate?.()
                    ? new Date(msg.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '...'}
                  {isMine && <span style={{ marginLeft: 4 }}>✓✓</span>}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={styles.inputRow}>
        <button style={styles.inputIcon}>📎</button>
        <button style={styles.inputIcon}>📷</button>
        <textarea
          style={styles.input}
          value={newMsg}
          onChange={e => setNewMsg(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Type a message..."
          rows={1}
        />
        <button style={styles.inputIcon}>😊</button>
        <button
          style={{ ...styles.sendBtn, opacity: newMsg.trim() ? 1 : 0.5 }}
          onClick={sendMessage}
          disabled={!newMsg.trim()}
        >➤</button>
      </div>
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', height: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'system-ui, sans-serif' },
  loadingWrap: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  spinner: { width: 32, height: 32, border: '3px solid #333', borderTop: '3px solid #8b5cf6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  header: { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#111', borderBottom: '1px solid #222', flexShrink: 0 },
  backBtn: { background: 'none', border: 'none', color: '#8b5cf6', cursor: 'pointer', padding: '4px 8px', borderRadius: 8 },
  avatarWrap: { position: 'relative', width: 40, height: 40 },
  avatar: { width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' },
  avatarPlaceholder: { width: 40, height: 40, borderRadius: '50%', background: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16 },
  onlineDot: { position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: '50%', background: '#22c55e', border: '2px solid #111' },
  userName: { fontWeight: 700, fontSize: 15 },
  userStatus: { fontSize: 11, color: '#22c55e' },
  headerActions: { marginLeft: 'auto', display: 'flex', gap: 4 },
  iconBtn: { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', padding: '6px 8px', borderRadius: 8 },
  messageList: { flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 8 },
  emptyState: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: 700, marginBottom: 6 },
  emptySubtitle: { color: '#666', fontSize: 14 },
  msgRow: { display: 'flex', alignItems: 'flex-end', gap: 8 },
  msgAvatar: { width: 28, height: 28, borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0, overflow: 'hidden' },
  bubble: { maxWidth: '70%', padding: '10px 14px', borderRadius: 18, fontSize: 14, lineHeight: 1.5 },
  bubbleMine: { background: 'linear-gradient(135deg,#7c3aed,#8b5cf6)', color: '#fff', borderBottomRightRadius: 4 },
  bubbleTheirs: { background: '#1e1e1e', color: '#f1f1f1', borderBottomLeftRadius: 4, border: '1px solid #2a2a2a' },
  bubbleText: { wordBreak: 'break-word' },
  bubbleTime: { fontSize: 10, opacity: 0.6, marginTop: 4, textAlign: 'right' },
  inputRow: { display: 'flex', alignItems: 'center', gap: 6, padding: '10px 12px', background: '#111', borderTop: '1px solid #222', flexShrink: 0 },
  inputIcon: { background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#8b5cf6', padding: 4 },
  input: { flex: 1, background: '#1e1e1e', border: '1px solid #333', borderRadius: 20, padding: '10px 14px', color: '#fff', fontSize: 14, resize: 'none', outline: 'none', fontFamily: 'inherit', lineHeight: 1.4 },
  sendBtn: { background: 'linear-gradient(135deg,#7c3aed,#8b5cf6)', border: 'none', color: '#fff', width: 38, height: 38, borderRadius: '50%', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
};
