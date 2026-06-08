/**
 * DatingChatPage — in-app messaging between matched users
 * Route: /dating/chat/:matchId
 * Critical beta dashboard: allows matched users to message each other
 * directly from the dating section without leaving to the main inbox.
 */
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase/config';
import {
  collection, addDoc, query, orderBy, onSnapshot,
  doc, getDoc, serverTimestamp, updateDoc
} from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';

const S = {
  page: { display:'flex', flexDirection:'column', height:'100dvh', background:'#0a0a0a', color:'#fff', fontFamily:'system-ui,sans-serif' },
  header: { display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderBottom:'1px solid #1a1a1a', background:'#0a0a0a', position:'sticky', top:0, zIndex:10 },
  backBtn: { background:'none', border:'none', color:'#ec4899', fontSize:22, cursor:'pointer', padding:4 },
  avatar: { width:40, height:40, borderRadius:'50%', objectFit:'cover', background:'linear-gradient(135deg,#7c3aed,#ec4899)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 },
  nameBlock: { flex:1 },
  name: { fontWeight:700, fontSize:16, margin:0 },
  status: { fontSize:12, color:'#ec4899', margin:0 },
  safetyBtn: { background:'none', border:'none', color:'#64748b', fontSize:20, cursor:'pointer' },
  messages: { flex:1, overflowY:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:10 },
  msgWrap: (mine) => ({ display:'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }),
  bubble: (mine) => ({
    maxWidth:'72%', padding:'10px 14px', borderRadius: mine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
    background: mine ? 'linear-gradient(135deg,#7c3aed,#ec4899)' : '#1e1e2e',
    color:'#fff', fontSize:14, lineHeight:1.5,
    boxShadow:'0 2px 8px rgba(0,0,0,0.3)'
  }),
  timeStamp: { fontSize:10, color:'#555', marginTop:3, textAlign:'right' },
  inputRow: { display:'flex', alignItems:'center', gap:8, padding:'12px 16px', borderTop:'1px solid #1a1a1a', background:'#0a0a0a' },
  input: { flex:1, background:'#1e1e2e', border:'1px solid #2a2a3e', borderRadius:24, padding:'10px 16px', color:'#fff', fontSize:14, outline:'none', resize:'none', fontFamily:'inherit' },
  sendBtn: { background:'linear-gradient(135deg,#7c3aed,#ec4899)', border:'none', borderRadius:'50%', width:44, height:44, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:18, flexShrink:0 },
  iceBreakers: { display:'flex', gap:8, padding:'8px 16px', overflowX:'auto', borderTop:'1px solid #111' },
  iceBtn: { background:'#1e1e2e', border:'1px solid #2a2a3e', borderRadius:20, padding:'6px 14px', color:'#c4b5fd', fontSize:12, cursor:'pointer', whiteSpace:'nowrap', flexShrink:0 },
  matchBanner: { background:'linear-gradient(135deg,rgba(124,58,237,0.15),rgba(236,72,153,0.15))', border:'1px solid rgba(236,72,153,0.2)', borderRadius:16, margin:'16px', padding:20, textAlign:'center' },
  matchEmoji: { fontSize:48, display:'block', marginBottom:8 },
  matchText: { fontSize:14, color:'#c4b5fd', margin:0 },
};

const ICE_BREAKERS = [
  "What are you most passionate about? 🔥",
  "Coffee or tea person? ☕",
  "What's your ideal weekend? 🌅",
  "Hidden talent? 🎯",
  "Best travel memory? ✈️",
];

export default function DatingChatPage() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [match, setMatch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Load match profile
  useEffect(() => {
    if (!matchId || !user) return;
    getDoc(doc(db, 'matches', matchId)).then(d => {
      if (d.exists()) {
        const data = d.data();
        // Get the other user's uid
        const otherUid = data.users?.find(uid => uid !== user.uid);
        if (otherUid) {
          getDoc(doc(db, 'users', otherUid)).then(ud => {
            setMatch({ uid: otherUid, ...ud.data() });
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });
  }, [matchId, user]);

  // Listen to messages
  useEffect(() => {
    if (!matchId) return;
    const q = query(
      collection(db, 'matches', matchId, 'messages'),
      orderBy('createdAt', 'asc')
    );
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [matchId]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (content = text.trim()) => {
    if (!content || !user || !matchId) return;
    setText('');
    try {
      await addDoc(collection(db, 'matches', matchId, 'messages'), {
        text: content,
        senderId: user.uid,
        createdAt: serverTimestamp(),
        read: false,
      });
      // Update match lastMessage
      await updateDoc(doc(db, 'matches', matchId), {
        lastMessage: content,
        lastMessageAt: serverTimestamp(),
        lastMessageBy: user.uid,
      });
    } catch (e) {
      console.error('Send error:', e);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
  };

  if (loading) {
    return (
      <div style={{ ...S.page, alignItems:'center', justifyContent:'center' }}>
        <div style={{ fontSize:40, marginBottom:16 }}>💘</div>
        <p style={{ color:'#64748b' }}>Loading conversation…</p>
      </div>
    );
  }

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <button onClick={() => navigate(-1)} style={S.backBtn}>←</button>
        <div style={{ ...S.avatar, fontSize:22, width:42, height:42, borderRadius:'50%', overflow:'hidden' }}>
          {match?.photoURL
            ? <img src={match.photoURL} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            : (match?.displayName?.[0] || '?')}
        </div>
        <div style={S.nameBlock}>
          <p style={S.name}>{match?.displayName || 'Match'}</p>
          <p style={S.status}>💞 It's a match!</p>
        </div>
        <button onClick={() => navigate('/dating/safety')} style={S.safetyBtn} title="Safety Center">🛡️</button>
        <button
          onClick={() => navigate(`/profile/${match?.uid}`)}
          style={{ ...S.safetyBtn, fontSize:20 }}
          title="View Profile"
        >👤</button>
      </div>

      {/* Messages */}
      <div style={S.messages}>
        {/* Match banner shown on first message */}
        {messages.length === 0 && (
          <div style={S.matchBanner}>
            <span style={S.matchEmoji}>🎉</span>
            <p style={{ fontSize:18, fontWeight:700, color:'#fff', margin:'0 0 6px' }}>
              You matched with {match?.displayName || 'someone'}!
            </p>
            <p style={S.matchText}>Start the conversation — you both liked each other 💜</p>
          </div>
        )}
        {messages.map(msg => {
          const mine = msg.senderId === user?.uid;
          return (
            <div key={msg.id} style={S.msgWrap(mine)}>
              <div>
                <div style={S.bubble(mine)}>{msg.text}</div>
                <p style={S.timeStamp}>{formatTime(msg.createdAt)}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Ice Breakers (shown when no messages) */}
      {messages.length === 0 && (
        <div style={S.iceBreakers}>
          {ICE_BREAKERS.map((q, i) => (
            <button key={i} style={S.iceBtn} onClick={() => sendMessage(q)}>
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={S.inputRow}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder={`Message ${match?.displayName || 'your match'}…`}
          rows={1}
          style={S.input}
        />
        <button onClick={() => sendMessage()} style={S.sendBtn} disabled={!text.trim()}>
          💌
        </button>
      </div>
    </div>
  );
}
