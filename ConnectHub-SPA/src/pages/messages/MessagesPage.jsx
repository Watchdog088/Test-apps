// src/pages/messages/MessagesPage.jsx
// BUG-08 FIX: ChatThread uses height:100% not 100vh
// POLISH-20 FIX: Typing indicator in chat thread
// UX-05 FIX: Opens match conversation from Dating page state

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ONLINE_FRIENDS = [
  { id:1, name:'Jordan',  emoji:'🎵', color:'#ec4899', online:true  },
  { id:2, name:'Alex',    emoji:'✈️', color:'#6366f1', online:true  },
  { id:3, name:'Riley',   emoji:'💪', color:'#10b981', online:true  },
  { id:4, name:'Sam',     emoji:'🍕', color:'#f59e0b', online:false },
  { id:5, name:'Morgan',  emoji:'🎨', color:'#8b5cf6', online:true  },
  { id:6, name:'Taylor',  emoji:'📸', color:'#14b8a6', online:false },
  { id:7, name:'Casey',   emoji:'🎮', color:'#3b82f6', online:true  },
];

const PINNED = [
  { id:'p1', name:'Jordan Maxwell', last:'🎵 Check out my new track!', time:'2m',  unread:3, emoji:'🎵', color:'#ec4899', online:true,  pinned:true },
  { id:'p2', name:'Alex Chen',      last:'Photo from Tokyo 🗼',         time:'5m',  unread:1, emoji:'✈️', color:'#6366f1', online:true,  pinned:true },
];

const CONVERSATIONS = [
  { id:'c1', name:'Riley Johnson',  last:'Morning run done 💪 You in?', time:'12m', unread:0, emoji:'💪', color:'#10b981', online:true  },
  { id:'c2', name:'Sam Rivera',     last:'Ramen recipe incoming 🍜',    time:'1h',  unread:0, emoji:'🍕', color:'#f59e0b', online:false },
  { id:'c3', name:'Morgan Taylor',  last:'New piece dropped! 🎨',       time:'2h',  unread:0, emoji:'🎨', color:'#8b5cf6', online:true  },
  { id:'c4', name:'Taylor Brooks',  last:'Gaming tonight?',              time:'3h',  unread:2, emoji:'📸', color:'#14b8a6', online:false },
  { id:'c5', name:'Casey Lane',     last:'Watching the match 🏆',        time:'5h',  unread:0, emoji:'🎮', color:'#3b82f6', online:false },
];

// POLISH-20: Typing indicator dots animation
function TypingIndicator() {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:4, padding:'10px 14px', background:'rgba(255,255,255,0.09)', borderRadius:'16px 16px 16px 4px', width:'fit-content' }}>
      {[0,1,2].map(i => (
        <span key={i} style={{
          width:8, height:8, borderRadius:'50%', background:'#64748b',
          animation:'typingBounce 1.2s ease-in-out infinite',
          animationDelay:`${i * 0.2}s`,
          display:'block',
        }} />
      ))}
      <style>{`
        @keyframes typingBounce {
          0%,60%,100% { transform: translateY(0); opacity:0.4; }
          30% { transform: translateY(-6px); opacity:1; }
        }
      `}</style>
    </div>
  );
}

// BUG-08 FIX: ChatThread uses height:100% not 100vh
function ChatThread({ conv, onBack, onVideoCall }) {
  const [msg, setMsg]         = useState('');
  const [isTyping, setIsTyping] = useState(false); // POLISH-20
  const [messages, setMessages] = useState([
    { id:1, me:false, text:`Hey! ${conv.last}`,   time:'10:30 AM' },
    { id:2, me:true,  text:'That sounds great!',  time:'10:31 AM' },
    { id:3, me:false, text:'Can we talk more?',   time:'10:32 AM' },
  ]);
  const bottomRef = useRef(null);

  // POLISH-20: simulate other person typing when user types
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => {
      setIsTyping(true);
      const clear = setTimeout(() => setIsTyping(false), 2000);
      return () => clearTimeout(clear);
    }, 800);
    return () => clearTimeout(t);
  }, [msg]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' });
  }, [messages, isTyping]);

  function send() {
    if (!msg.trim()) return;
    setMessages(prev => [...prev, { id:Date.now(), me:true, text:msg.trim(), time:'Now' }]);
    setMsg('');
    setIsTyping(false);
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', minHeight:0, background:'#0a0a18' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px', background:'rgba(15,12,41,0.95)', borderBottom:'1px solid rgba(255,255,255,0.08)', backdropFilter:'blur(20px)', flexShrink:0 }}>
        <button onClick={onBack} style={{ color:'#818cf8', fontSize:22, fontWeight:800, lineHeight:1, minWidth:44, minHeight:44, display:'flex', alignItems:'center', justifyContent:'center', background:'none', border:'none', cursor:'pointer' }}>‹</button>
        <div style={{ width:40, height:40, borderRadius:'50%', background:conv.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, position:'relative' }}>
          {conv.emoji}
          {conv.online && <span style={{ position:'absolute', bottom:1, right:1, width:10, height:10, background:'#10b981', borderRadius:'50%', border:'1.5px solid #0a0a18' }} />}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700, fontSize:15, color:'#f1f5f9' }}>{conv.name}</div>
          {/* POLISH-20: Show "typing..." when isTyping */}
          <div style={{ fontSize:11, color: isTyping ? '#10b981' : (conv.online ? '#10b981' : '#64748b') }}>
            {isTyping ? '✏️ typing…' : (conv.online ? 'Online now' : 'Offline')}
          </div>
        </div>
        <button onClick={onVideoCall} style={{ padding:'8px 12px', background:'rgba(99,102,241,0.18)', border:'1px solid rgba(99,102,241,0.35)', borderRadius:10, color:'#818cf8', fontSize:18, minWidth:44, minHeight:44, display:'flex', alignItems:'center', justifyContent:'center' }} title="Video call">📹</button>
        <button style={{ padding:'8px', color:'#64748b', fontSize:18, minWidth:44, minHeight:44, display:'flex', alignItems:'center', justifyContent:'center', background:'none', border:'none', cursor:'pointer' }}>•••</button>
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:10 }}>
        {messages.map(m => (
          <div key={m.id} style={{ display:'flex', justifyContent: m.me ? 'flex-end' : 'flex-start' }}>
            <div style={{ maxWidth:'72%', background: m.me ? 'linear-gradient(135deg,#6366f1,#ec4899)' : 'rgba(255,255,255,0.09)', borderRadius: m.me ? '16px 16px 4px 16px' : '16px 16px 16px 4px', padding:'10px 14px', fontSize:14, color:'#f1f5f9', lineHeight:1.4 }}>
              {m.text}
              <div style={{ fontSize:10, color: m.me ? 'rgba(255,255,255,0.55)' : '#475569', marginTop:4, textAlign: m.me ? 'right' : 'left' }}>{m.time}</div>
            </div>
          </div>
        ))}
        {/* POLISH-20: Typing indicator */}
        {isTyping && (
          <div style={{ display:'flex', justifyContent:'flex-start' }}>
            <TypingIndicator />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding:'12px 16px', borderTop:'1px solid rgba(255,255,255,0.07)', display:'flex', gap:10, alignItems:'center', background:'rgba(15,12,41,0.95)', backdropFilter:'blur(20px)', flexShrink:0 }}>
        <input value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()}
          placeholder="Message…"
          style={{ flex:1, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:24, padding:'10px 16px', color:'#f1f5f9', fontSize:15, outline:'none' }} />
        <button onClick={send} style={{ width:44, height:44, borderRadius:'50%', background:'linear-gradient(135deg,#6366f1,#ec4899)', border:'none', color:'white', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, cursor:'pointer' }}>➤</button>
      </div>
    </div>
  );
}

function ConvRow({ conv, pinned, onClick }) {
  return (
    <div onClick={onClick} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', cursor:'pointer', borderBottom:'1px solid rgba(255,255,255,0.04)', transition:'background 0.15s' }}
      onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.04)'}
      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
      <div style={{ position:'relative', flexShrink:0 }}>
        <div style={{ width:50, height:50, borderRadius:'50%', background:conv.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>{conv.emoji}</div>
        {conv.online && <span style={{ position:'absolute', bottom:2, right:2, width:12, height:12, background:'#10b981', borderRadius:'50%', border:'2px solid #0a0a18' }} />}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:2 }}>
          <span style={{ fontWeight: conv.unread>0 ? 700 : 600, fontSize:14, color:'#f1f5f9', display:'flex', alignItems:'center', gap:5 }}>
            {conv.name}
            {pinned && <span style={{ fontSize:9, color:'#818cf8', background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.3)', borderRadius:4, padding:'1px 4px' }}>PIN</span>}
          </span>
          <span style={{ fontSize:11, color:'#475569' }}>{conv.time}</span>
        </div>
        <div style={{ fontSize:13, color:'#64748b', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{conv.last}</div>
      </div>
      {conv.unread > 0 && (
        <div style={{ width:20, height:20, borderRadius:'50%', background:'#6366f1', color:'white', fontSize:10, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{conv.unread}</div>
      )}
    </div>
  );
}

export default function MessagesPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [search, setSearch] = useState('');
  const [active, setActive] = useState(null);

  // UX-05 FIX: Auto-open conversation if navigated from Dating match
  useEffect(() => {
    const state = location.state;
    if (state?.matchName) {
      setActive({
        id: state.matchId || 'new',
        name: state.matchName,
        last: `You matched! Say hi 👋`,
        time: 'now',
        unread: 0,
        emoji: state.matchEmoji || '💕',
        color: '#ec4899',
        online: true,
      });
    }
  }, [location.state]);

  if (active) {
    return (
      <ChatThread
        conv={active}
        onBack={() => setActive(null)}
        onVideoCall={() => navigate('/videocalls', { state:{ peerId:active.id, peerName:active.name } })}
      />
    );
  }

  const allConvs = [...PINNED, ...CONVERSATIONS];
  const filtered = search.trim() ? allConvs.filter(c => c.name.toLowerCase().includes(search.toLowerCase())) : null;

  return (
    <div style={{ background:'#0a0a18', minHeight:'100vh', paddingBottom:80 }}>
      {/* Search */}
      <div style={{ padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, background:'rgba(255,255,255,0.07)', borderRadius:14, padding:'10px 14px', border:'1px solid rgba(255,255,255,0.10)' }}>
          <span style={{ fontSize:17 }}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search conversations…" style={{ flex:1, background:'none', border:'none', outline:'none', color:'#f1f5f9', fontSize:14 }} />
          {search && <span onClick={()=>setSearch('')} style={{ color:'#64748b', cursor:'pointer', fontSize:16 }}>✕</span>}
        </div>
      </div>

      {/* Online Friends */}
      {!search && (
        <div style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize:11, fontWeight:700, color:'#475569', letterSpacing:'0.06em', textTransform:'uppercase', padding:'12px 16px 6px' }}>Online Now</div>
          <div style={{ display:'flex', gap:14, overflowX:'auto', padding:'0 16px 14px', scrollbarWidth:'none' }}>
            {ONLINE_FRIENDS.filter(f=>f.online).map(f => (
              <div key={f.id} onClick={()=>setActive({ id:f.id, name:f.name, last:'Say hi!', time:'now', unread:0, emoji:f.emoji, color:f.color, online:true })}
                style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5, cursor:'pointer', flexShrink:0 }}>
                <div style={{ position:'relative' }}>
                  <div style={{ width:50, height:50, borderRadius:'50%', background:f.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, border:'2.5px solid transparent', outline:`2.5px solid ${f.color}55`, outlineOffset:2 }}>{f.emoji}</div>
                  <span style={{ position:'absolute', bottom:1, right:1, width:12, height:12, background:'#10b981', borderRadius:'50%', border:'2px solid #0a0a18' }} />
                </div>
                <span style={{ fontSize:10, color:'#94a3b8', maxWidth:52, textAlign:'center', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {filtered && filtered.length > 0 && <div>{filtered.map(c=><ConvRow key={c.id} conv={c} onClick={()=>setActive(c)} />)}</div>}
      {filtered && filtered.length === 0 && (
        <div style={{ textAlign:'center', padding:'48px 24px', color:'#475569' }}>
          <div style={{ fontSize:40, marginBottom:10 }}>💬</div>
          <div style={{ fontWeight:600, color:'#64748b' }}>No conversations found</div>
        </div>
      )}

      {!search && (
        <>
          <div style={{ fontSize:11, fontWeight:700, color:'#475569', letterSpacing:'0.06em', textTransform:'uppercase', padding:'14px 16px 6px' }}>📌 Pinned</div>
          {PINNED.map(c=><ConvRow key={c.id} conv={c} pinned onClick={()=>setActive(c)} />)}
          <div style={{ fontSize:11, fontWeight:700, color:'#475569', letterSpacing:'0.06em', textTransform:'uppercase', padding:'14px 16px 6px' }}>Recent</div>
          {CONVERSATIONS.map(c=><ConvRow key={c.id} conv={c} onClick={()=>setActive(c)} />)}
        </>
      )}
    </div>
  );
}
