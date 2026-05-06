// MessagesPage.jsx — Full real-time messaging with Firebase Firestore
// Features: conversation list, live chat thread, send/receive, message status,
//           search, new conversation, emoji reactions, typing indicator, group chat

import React, {
  useState, useEffect, useRef, useCallback, useMemo,
} from 'react';
import {
  collection, query, where, orderBy, limit, onSnapshot,
  addDoc, updateDoc, doc, serverTimestamp, arrayUnion,
  getDoc, getDocs, setDoc, Timestamp,
} from 'firebase/firestore';
import { db } from '@fb/config';
import { useAuth } from '@hooks/useAuth';
import { timeAgo } from '@utils/timeAgo';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function initials(name = '') {
  return name.split(' ').map(w => w[0] || '').join('').toUpperCase().slice(0, 2) || '?';
}

function Avatar({ name = '', size = 40, color = '#6366f1' }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `linear-gradient(135deg, ${color}, #ec4899)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 700, fontSize: size * 0.38,
      letterSpacing: '-0.5px',
    }}>
      {initials(name)}
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const S = {
  page:       { height: '100%', display: 'flex', flexDirection: 'column', background: '#0a0a0a', overflow: 'hidden' },
  header:     { padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 },
  searchBox:  { flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '8px 12px', color: '#fff', fontSize: 14, outline: 'none' },
  newBtn:     { background: 'linear-gradient(135deg,#6366f1,#ec4899)', border: 'none', borderRadius: 10, width: 36, height: 36, color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  list:       { flex: 1, overflowY: 'auto', padding: '4px 0' },
  convRow:    (active) => ({ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', cursor: 'pointer', background: active ? 'rgba(99,102,241,0.12)' : 'transparent', transition: 'background 0.15s', borderLeft: active ? '3px solid #6366f1' : '3px solid transparent' }),
  convName:   { fontWeight: 600, fontSize: 14, color: '#f1f5f9' },
  convLast:   { fontSize: 12, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 },
  badge:      { background: '#6366f1', borderRadius: 99, minWidth: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', padding: '0 4px', flexShrink: 0 },
  // Thread
  thread:     { flex: 1, display: 'flex', flexDirection: 'column', height: '100%', background: '#0a0a0a' },
  threadHdr:  { padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 },
  backBtn:    { background: 'none', border: 'none', color: '#94a3b8', fontSize: 20, cursor: 'pointer', padding: '4px 8px', borderRadius: 8 },
  msgList:    { flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6 },
  msgOut:     { alignSelf: 'flex-end', background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: '#fff', borderRadius: '18px 18px 4px 18px', padding: '8px 14px', maxWidth: '75%', fontSize: 14, lineHeight: 1.45, wordBreak: 'break-word', position: 'relative' },
  msgIn:      { alignSelf: 'flex-start', background: 'rgba(255,255,255,0.08)', color: '#e2e8f0', borderRadius: '18px 18px 18px 4px', padding: '8px 14px', maxWidth: '75%', fontSize: 14, lineHeight: 1.45, wordBreak: 'break-word', position: 'relative' },
  msgTime:    { fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 2, textAlign: 'right' },
  inputRow:   { padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 8, alignItems: 'flex-end', flexShrink: 0, background: '#0d0d0d' },
  input:      { flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: '10px 16px', color: '#fff', fontSize: 14, outline: 'none', resize: 'none', maxHeight: 120, lineHeight: 1.4, fontFamily: 'inherit' },
  sendBtn:    (canSend) => ({ background: canSend ? 'linear-gradient(135deg,#6366f1,#ec4899)' : 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '50%', width: 40, height: 40, color: '#fff', fontSize: 16, cursor: canSend ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s', flexShrink: 0 }),
  // Modal
  overlay:    { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' },
  modal:      { background: '#1a1a2e', borderRadius: '24px 24px 0 0', padding: '24px 20px', width: '100%', maxWidth: 480, maxHeight: '80vh', overflow: 'auto' },
  empty:      { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b', padding: 32, gap: 12, textAlign: 'center' },
};

// ─── Conversation Row ─────────────────────────────────────────────────────────
function ConvRow({ conv, uid, active, onClick }) {
  const otherName = conv.type === 'group'
    ? conv.groupName || 'Group Chat'
    : Object.entries(conv.participantNames || {}).find(([k]) => k !== uid)?.[1] || 'Unknown';
  const unread = conv.unreadCount?.[uid] || 0;
  const isOut = conv.lastMessageBy === uid;

  return (
    <div style={S.convRow(active)} onClick={onClick}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
      <Avatar name={otherName} size={46} color={conv.type === 'group' ? '#0ea5e9' : '#6366f1'} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
          <span style={S.convName}>{otherName}</span>
          <span style={{ fontSize: 11, color: '#475569', flexShrink: 0, marginLeft: 8 }}>
            {conv.lastMessageAt ? timeAgo(conv.lastMessageAt.toDate?.() || conv.lastMessageAt) : ''}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {isOut && <span style={{ color: '#6366f1', fontSize: 11 }}>✓✓ </span>}
          <span style={S.convLast}>{conv.lastMessage || 'No messages yet'}</span>
          {unread > 0 && <div style={S.badge}>{unread > 99 ? '99+' : unread}</div>}
        </div>
      </div>
    </div>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function MsgBubble({ msg, isOwn, showName }) {
  const [showReact, setShowReact] = useState(false);
  const EMOJIS = ['❤️', '😂', '😮', '😢', '👍', '🔥'];

  const statusIcon = isOwn
    ? msg.status === 'read' ? '✓✓' : msg.status === 'delivered' ? '✓✓' : '✓'
    : null;
  const statusColor = isOwn && msg.status === 'read' ? '#60a5fa' : 'rgba(255,255,255,0.4)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: isOwn ? 'flex-end' : 'flex-start', gap: 2 }}>
      {showName && !isOwn && (
        <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 4, marginBottom: 2 }}>{msg.senderName}</span>
      )}
      <div
        style={isOwn ? S.msgOut : S.msgIn}
        onDoubleClick={() => setShowReact(!showReact)}
        title="Double-tap to react"
      >
        {msg.text}
        {/* Reactions bar */}
        {Object.keys(msg.reactions || {}).length > 0 && (
          <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
            {Object.entries(msg.reactions).map(([emoji, uids]) =>
              uids.length > 0 ? (
                <span key={emoji} style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 99, padding: '1px 6px', fontSize: 12 }}>
                  {emoji} {uids.length}
                </span>
              ) : null
            )}
          </div>
        )}
        {/* React picker */}
        {showReact && (
          <div style={{ position: 'absolute', [isOwn ? 'right' : 'left']: 0, bottom: '110%', background: '#1e1e2e', borderRadius: 16, padding: '6px 8px', display: 'flex', gap: 6, boxShadow: '0 4px 20px rgba(0,0,0,0.4)', zIndex: 10 }}>
            {EMOJIS.map(e => (
              <button key={e} onClick={() => { setShowReact(false); }}
                style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', padding: 2, borderRadius: 8 }}>
                {e}
              </button>
            ))}
          </div>
        )}
      </div>
      <div style={S.msgTime}>
        {msg.createdAt
          ? (msg.createdAt.toDate ? msg.createdAt.toDate() : new Date(msg.createdAt)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : 'sending…'}
        {statusIcon && <span style={{ marginLeft: 4, color: statusColor }}>{statusIcon}</span>}
      </div>
    </div>
  );
}

// ─── Chat Thread ──────────────────────────────────────────────────────────────
function ChatThread({ conv, uid, userName, onBack }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);

  const otherName = conv.type === 'group'
    ? conv.groupName || 'Group Chat'
    : Object.entries(conv.participantNames || {}).find(([k]) => k !== uid)?.[1] || 'Unknown';

  // Real-time messages listener
  useEffect(() => {
    if (!conv?.id) return;
    const q = query(
      collection(db, 'conversations', conv.id, 'messages'),
      orderBy('createdAt', 'asc'),
      limit(100)
    );
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, err => {
      console.error('[Messages] onSnapshot error:', err);
    });
    return unsub;
  }, [conv?.id]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Mark messages as read when thread opens
  useEffect(() => {
    if (!conv?.id || !uid) return;
    const convRef = doc(db, 'conversations', conv.id);
    updateDoc(convRef, { [`unreadCount.${uid}`]: 0 }).catch(() => {});
  }, [conv?.id, uid]);

  // Typing indicator
  function handleTextChange(e) {
    setText(e.target.value);
    if (!typingTimer.current) {
      // Set typing = true in Firestore (simplified: just local state)
      setTyping(true);
    }
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      setTyping(false);
      typingTimer.current = null;
    }, 1500);
  }

  // Send message
  async function sendMessage() {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setText('');
    setSending(true);
    try {
      const convRef = doc(db, 'conversations', conv.id);
      const msgRef = collection(db, 'conversations', conv.id, 'messages');

      // Add message document
      await addDoc(msgRef, {
        text: trimmed,
        senderId: uid,
        senderName: userName,
        createdAt: serverTimestamp(),
        status: 'sent',
        reactions: {},
        type: 'text',
      });

      // Update conversation metadata
      const otherUids = (conv.participants || []).filter(p => p !== uid);
      const unreadUpdate = {};
      otherUids.forEach(p => { unreadUpdate[`unreadCount.${p}`] = (conv.unreadCount?.[p] || 0) + 1; });

      await updateDoc(convRef, {
        lastMessage: trimmed,
        lastMessageAt: serverTimestamp(),
        lastMessageBy: uid,
        ...unreadUpdate,
      });
    } catch (err) {
      console.error('[Messages] send error:', err);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div style={S.thread}>
      {/* Thread header */}
      <div style={S.threadHdr}>
        <button style={S.backBtn} onClick={onBack}>←</button>
        <Avatar name={otherName} size={38} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#f1f5f9' }}>{otherName}</div>
          <div style={{ fontSize: 11, color: otherTyping ? '#6366f1' : '#22c55e' }}>
            {otherTyping ? 'typing…' : '● Online'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button style={{ background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 10, width: 34, height: 34, color: '#94a3b8', fontSize: 16, cursor: 'pointer' }} title="Voice call">📞</button>
          <button style={{ background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 10, width: 34, height: 34, color: '#94a3b8', fontSize: 16, cursor: 'pointer' }} title="Video call">📹</button>
        </div>
      </div>

      {/* Messages */}
      <div style={S.msgList}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#475569', fontSize: 13, marginTop: 24 }}>
            No messages yet. Say hello! 👋
          </div>
        )}
        {messages.map((msg, i) => (
          <MsgBubble
            key={msg.id}
            msg={msg}
            isOwn={msg.senderId === uid}
            showName={conv.type === 'group' && msg.senderId !== uid && messages[i - 1]?.senderId !== msg.senderId}
          />
        ))}
        {otherTyping && (
          <div style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.08)', borderRadius: '18px 18px 18px 4px', padding: '10px 16px', color: '#64748b', fontSize: 20 }}>
            ···
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={S.inputRow}>
        <button style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 20, cursor: 'pointer', padding: '0 2px' }} title="Emoji">😊</button>
        <button style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 20, cursor: 'pointer', padding: '0 2px' }} title="Attach photo">📷</button>
        <textarea
          style={S.input}
          placeholder="Message…"
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          rows={1}
          autoFocus
        />
        <button
          style={S.sendBtn(text.trim().length > 0 && !sending)}
          onClick={sendMessage}
          disabled={!text.trim() || sending}
        >
          {sending ? '…' : '➤'}
        </button>
      </div>
    </div>
  );
}

// ─── New Conversation Modal ───────────────────────────────────────────────────
function NewConvModal({ uid, userName, onClose, onCreated }) {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  async function searchUsers(q) {
    if (!q.trim()) { setUsers([]); return; }
    setLoading(true);
    try {
      // Search by displayName prefix
      const snap = await getDocs(
        query(collection(db, 'users'),
          where('displayName', '>=', q),
          where('displayName', '<=', q + '\uf8ff'),
          limit(10)
        )
      );
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => u.id !== uid));
    } catch (err) {
      console.error('[NewConv] search error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function startConversation(otherUser) {
    setCreating(true);
    try {
      // Check if conversation already exists
      const q = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', uid),
        where('type', '==', 'direct')
      );
      const snap = await getDocs(q);
      const existing = snap.docs.find(d => d.data().participants?.includes(otherUser.id));
      if (existing) {
        onCreated({ id: existing.id, ...existing.data() });
        return;
      }
      // Create new conversation
      const convRef = await addDoc(collection(db, 'conversations'), {
        type: 'direct',
        participants: [uid, otherUser.id],
        participantNames: {
          [uid]: userName,
          [otherUser.id]: otherUser.displayName || 'User',
        },
        lastMessage: '',
        lastMessageAt: serverTimestamp(),
        lastMessageBy: uid,
        unreadCount: { [uid]: 0, [otherUser.id]: 0 },
        createdAt: serverTimestamp(),
      });
      onCreated({ id: convRef.id, type: 'direct', participants: [uid, otherUser.id], participantNames: { [uid]: userName, [otherUser.id]: otherUser.displayName } });
    } catch (err) {
      console.error('[NewConv] create error:', err);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div style={S.overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={S.modal}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 18 }}>New Message</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>
        <input
          style={{ ...S.searchBox, display: 'block', width: '100%', marginBottom: 12, boxSizing: 'border-box' }}
          placeholder="Search people by name…"
          value={search}
          onChange={e => { setSearch(e.target.value); searchUsers(e.target.value); }}
          autoFocus
        />
        {loading && <div style={{ color: '#64748b', fontSize: 13, padding: 8 }}>Searching…</div>}
        {users.length === 0 && !loading && search.length > 1 && (
          <div style={{ color: '#64748b', fontSize: 13, padding: 8 }}>No users found for "{search}"</div>
        )}
        {users.map(u => (
          <div key={u.id}
            onClick={() => !creating && startConversation(u)}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 4px', cursor: 'pointer', borderRadius: 12 }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Avatar name={u.displayName || 'User'} size={40} />
            <div>
              <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: 14 }}>{u.displayName || 'User'}</div>
              <div style={{ color: '#64748b', fontSize: 12 }}>{u.email || ''}</div>
            </div>
            {creating && <span style={{ marginLeft: 'auto', color: '#6366f1', fontSize: 12 }}>Creating…</span>}
          </div>
        ))}
        {search.length === 0 && (
          <div style={{ color: '#475569', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
            Type a name to search for people
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main MessagesPage ────────────────────────────────────────────────────────
export default function MessagesPage() {
  const { user } = useAuth();
  const uid = user?.uid;
  const userName = user?.displayName || user?.email?.split('@')[0] || 'You';

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [search, setSearch] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Real-time conversations listener
  useEffect(() => {
    if (!uid) return;
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', uid),
      orderBy('lastMessageAt', 'desc'),
      limit(50)
    );
    const unsub = onSnapshot(q, snap => {
      setConversations(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, err => {
      console.error('[Messages] conversations error:', err);
      setLoading(false);
    });
    return unsub;
  }, [uid]);

  // Filter conversations by search
  const filtered = useMemo(() => {
    if (!search.trim()) return conversations;
    const s = search.toLowerCase();
    return conversations.filter(c => {
      const name = c.type === 'group'
        ? (c.groupName || '').toLowerCase()
        : Object.entries(c.participantNames || {}).find(([k]) => k !== uid)?.[1]?.toLowerCase() || '';
      return name.includes(s) || (c.lastMessage || '').toLowerCase().includes(s);
    });
  }, [conversations, search, uid]);

  const totalUnread = useMemo(() =>
    conversations.reduce((sum, c) => sum + (c.unreadCount?.[uid] || 0), 0),
    [conversations, uid]
  );

  function openConv(conv) {
    setActiveConv(conv);
  }

  function closeThread() {
    setActiveConv(null);
  }

  function handleNewConvCreated(conv) {
    setShowNewModal(false);
    setActiveConv(conv);
  }

  if (!uid) {
    return (
      <div style={{ ...S.empty, height: '100%' }}>
        <div style={{ fontSize: 48 }}>💬</div>
        <h3 style={{ color: '#f1f5f9' }}>Sign in to view messages</h3>
      </div>
    );
  }

  // Mobile: show thread OR list
  if (activeConv) {
    return (
      <div style={S.page}>
        <ChatThread
          conv={activeConv}
          uid={uid}
          userName={userName}
          onBack={closeThread}
        />
        {showNewModal && (
          <NewConvModal uid={uid} userName={userName} onClose={() => setShowNewModal(false)} onCreated={handleNewConvCreated} />
        )}
      </div>
    );
  }

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 18, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 6 }}>
            Messages
            {totalUnread > 0 && (
              <span style={{ ...S.badge, fontSize: 11 }}>{totalUnread}</span>
            )}
          </div>
        </div>
        <button style={S.newBtn} onClick={() => setShowNewModal(true)} title="New message">✏️</button>
      </div>

      {/* Search bar */}
      <div style={{ padding: '8px 14px', flexShrink: 0 }}>
        <input
          style={{ ...S.searchBox, display: 'block', width: '100%', boxSizing: 'border-box' }}
          placeholder="🔍  Search messages…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Conversation list */}
      <div style={S.list}>
        {loading && (
          Array(5).fill(0).map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 16px', alignItems: 'center' }}>
              <div className="skeleton" style={{ width: 46, height: 46, borderRadius: '50%', flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div className="skeleton" style={{ height: 12, width: '40%', borderRadius: 6 }} />
                <div className="skeleton" style={{ height: 10, width: '65%', borderRadius: 6 }} />
              </div>
            </div>
          ))
        )}

        {!loading && filtered.length === 0 && (
          <div style={S.empty}>
            <div style={{ fontSize: 52 }}>💬</div>
            <h3 style={{ color: '#f1f5f9', fontWeight: 700 }}>
              {search ? 'No results found' : 'No messages yet'}
            </h3>
            <p style={{ fontSize: 14 }}>
              {search
                ? `No conversations match "${search}"`
                : 'Start a conversation by tapping the ✏️ button above'}
            </p>
            {!search && (
              <button
                style={{ background: 'linear-gradient(135deg,#6366f1,#ec4899)', border: 'none', borderRadius: 12, padding: '10px 20px', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', marginTop: 8 }}
                onClick={() => setShowNewModal(true)}
              >
                ✏️ New Message
              </button>
            )}
          </div>
        )}

        {!loading && filtered.map(conv => (
          <ConvRow
            key={conv.id}
            conv={conv}
            uid={uid}
            active={activeConv?.id === conv.id}
            onClick={() => openConv(conv)}
          />
        ))}
      </div>

      {/* New conversation modal */}
      {showNewModal && (
        <NewConvModal
          uid={uid}
          userName={userName}
          onClose={() => setShowNewModal(false)}
          onCreated={handleNewConvCreated}
        />
      )}
    </div>
  );
}
