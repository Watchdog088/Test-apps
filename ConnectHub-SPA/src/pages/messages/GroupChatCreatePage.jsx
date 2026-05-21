// src/pages/messages/GroupChatCreatePage.jsx
// SECTION-6 NEW: Create Group Chat — select members, set name/photo
// Route: /messages/group/create

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../hooks/useAuth';

const CONTACTS = [
  { id:'of1', name:'Jordan Maxwell', emoji:'🎵', color:'#ec4899', online:true  },
  { id:'of2', name:'Alex Chen',      emoji:'✈️', color:'#6366f1', online:true  },
  { id:'of3', name:'Riley Johnson',  emoji:'💪', color:'#10b981', online:true  },
  { id:'of4', name:'Sam Rivera',     emoji:'🍕', color:'#f59e0b', online:false },
  { id:'of5', name:'Morgan Taylor',  emoji:'🎨', color:'#8b5cf6', online:true  },
  { id:'of6', name:'Taylor Brooks',  emoji:'📸', color:'#14b8a6', online:false },
  { id:'of7', name:'Casey Lane',     emoji:'🎮', color:'#3b82f6', online:true  },
  { id:'of8', name:'Drew Carter',    emoji:'🏄', color:'#f97316', online:false },
  { id:'of9', name:'Quinn Rivera',   emoji:'🎭', color:'#a855f7', online:true  },
];

const GROUP_EMOJIS = ['👥','🎯','🔥','💫','🎉','⚡','🌟','🎵','🏆','💎','🚀','🌈'];

export default function GroupChatCreatePage() {
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const uid       = user?.uid || 'demo-user';

  const [step,      setStep]      = useState(1); // 1=select members, 2=name group
  const [selected,  setSelected]  = useState([]);
  const [groupName, setGroupName] = useState('');
  const [groupEmoji, setGroupEmoji] = useState('👥');
  const [search,    setSearch]    = useState('');
  const [creating,  setCreating]  = useState(false);

  const filtered = search.trim()
    ? CONTACTS.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    : CONTACTS;

  function toggleMember(contact) {
    setSelected(prev =>
      prev.find(m => m.id === contact.id)
        ? prev.filter(m => m.id !== contact.id)
        : [...prev, contact]
    );
  }

  async function createGroup() {
    if (!groupName.trim() || selected.length < 2) return;
    setCreating(true);
    try {
      const groupRef = await addDoc(collection(db, 'conversations'), {
        type: 'group',
        name: groupName.trim(),
        emoji: groupEmoji,
        participants: [uid, ...selected.map(m => m.id)],
        admins: [uid],
        createdBy: uid,
        createdAt: serverTimestamp(),
        lastMessage: `Group created by you`,
        lastMessageTime: serverTimestamp(),
        archived: false,
        unread: {},
      });
      navigate('/messages', { replace: true });
    } catch (err) {
      console.warn('[GroupCreate] Firestore error (offline?):', err);
      navigate('/messages', { replace: true });
    }
    setCreating(false);
  }

  return (
    <div style={{ background:'#0a0a18', minHeight:'100vh', display:'flex', flexDirection:'column' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'16px 16px 12px', borderBottom:'1px solid rgba(255,255,255,0.06)', flexShrink:0 }}>
        <button onClick={() => step === 1 ? navigate('/messages') : setStep(1)}
          style={{ color:'#818cf8', fontSize:22, fontWeight:800, background:'none', border:'none', cursor:'pointer', minWidth:44, minHeight:44, display:'flex', alignItems:'center', justifyContent:'center' }}>
          ‹
        </button>
        <div style={{ flex:1 }}>
          <h2 style={{ color:'#f1f5f9', fontWeight:800, fontSize:18, margin:0 }}>
            {step === 1 ? 'New Group Chat' : 'Name Your Group'}
          </h2>
          <p style={{ color:'#64748b', fontSize:12, margin:0 }}>
            {step === 1 ? `${selected.length} of ${CONTACTS.length} selected` : 'Almost done!'}
          </p>
        </div>
        {step === 1 && selected.length >= 2 && (
          <button onClick={() => setStep(2)}
            style={{ background:'linear-gradient(135deg,#6366f1,#ec4899)', border:'none', borderRadius:10, padding:'8px 16px', color:'white', fontSize:13, fontWeight:700, cursor:'pointer' }}>
            Next →
          </button>
        )}
      </div>

      {/* Step progress */}
      <div style={{ display:'flex', gap:4, padding:'10px 16px', flexShrink:0 }}>
        {[1,2].map(s => (
          <div key={s} style={{ flex:1, height:3, borderRadius:2, background: step >= s ? 'linear-gradient(135deg,#6366f1,#ec4899)' : 'rgba(255,255,255,0.1)', transition:'background 0.3s' }} />
        ))}
      </div>

      {/* ─── STEP 1: Select Members ─── */}
      {step === 1 && (
        <>
          {/* Selected chips */}
          {selected.length > 0 && (
            <div style={{ display:'flex', gap:8, overflowX:'auto', padding:'8px 16px', scrollbarWidth:'none', flexShrink:0 }}>
              {selected.map(m => (
                <div key={m.id} onClick={() => toggleMember(m)}
                  style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(99,102,241,0.18)', border:'1px solid rgba(99,102,241,0.35)', borderRadius:20, padding:'5px 10px 5px 6px', cursor:'pointer', flexShrink:0 }}>
                  <div style={{ width:24, height:24, borderRadius:'50%', background:m.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12 }}>{m.emoji}</div>
                  <span style={{ fontSize:12, color:'#818cf8', fontWeight:600, whiteSpace:'nowrap' }}>{m.name.split(' ')[0]}</span>
                  <span style={{ fontSize:10, color:'#6366f1' }}>✕</span>
                </div>
              ))}
            </div>
          )}

          {/* Search */}
          <div style={{ padding:'8px 16px', flexShrink:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, background:'rgba(255,255,255,0.06)', borderRadius:12, padding:'9px 14px', border:'1px solid rgba(255,255,255,0.09)' }}>
              <span>🔍</span>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search contacts…"
                style={{ flex:1, background:'none', border:'none', outline:'none', color:'#f1f5f9', fontSize:14 }} />
            </div>
          </div>

          {/* Min members tip */}
          {selected.length < 2 && (
            <div style={{ padding:'4px 16px 8px', fontSize:12, color:'#475569' }}>Select at least 2 people to create a group</div>
          )}

          {/* Contact list */}
          <div style={{ flex:1, overflowY:'auto' }}>
            {filtered.map(contact => {
              const isSelected = !!selected.find(m => m.id === contact.id);
              return (
                <div key={contact.id} onClick={() => toggleMember(contact)}
                  style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', cursor:'pointer', borderBottom:'1px solid rgba(255,255,255,0.04)', background: isSelected ? 'rgba(99,102,241,0.07)' : 'transparent', transition:'background 0.15s' }}>
                  <div style={{ position:'relative' }}>
                    <div style={{ width:46, height:46, borderRadius:'50%', background:contact.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, border: isSelected ? '2px solid #6366f1' : '2px solid transparent' }}>
                      {contact.emoji}
                    </div>
                    {contact.online && <span style={{ position:'absolute', bottom:1, right:1, width:10, height:10, background:'#10b981', borderRadius:'50%', border:'2px solid #0a0a18' }} />}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:14, color:'#f1f5f9' }}>{contact.name}</div>
                    <div style={{ fontSize:11, color: contact.online ? '#10b981' : '#475569' }}>{contact.online ? 'Online' : 'Offline'}</div>
                  </div>
                  {/* Checkbox */}
                  <div style={{ width:22, height:22, borderRadius:'50%', background: isSelected ? 'linear-gradient(135deg,#6366f1,#ec4899)' : 'rgba(255,255,255,0.08)', border: isSelected ? 'none' : '1px solid rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, color:'white', flexShrink:0 }}>
                    {isSelected ? '✓' : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ─── STEP 2: Name the Group ─── */}
      {step === 2 && (
        <div style={{ flex:1, padding:'24px 16px' }}>
          {/* Group emoji picker */}
          <div style={{ marginBottom:24 }}>
            <div style={{ fontSize:12, color:'#475569', fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:10 }}>Group Icon</div>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              {GROUP_EMOJIS.map(e => (
                <button key={e} onClick={() => setGroupEmoji(e)}
                  style={{ width:44, height:44, borderRadius:12, background: groupEmoji === e ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.06)', border: groupEmoji === e ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.10)', fontSize:22, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Group name input */}
          <div style={{ marginBottom:24 }}>
            <div style={{ fontSize:12, color:'#475569', fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:10 }}>Group Name</div>
            <div style={{ display:'flex', alignItems:'center', gap:12, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:14, padding:'12px 16px' }}>
              <span style={{ fontSize:24 }}>{groupEmoji}</span>
              <input value={groupName} onChange={e=>setGroupName(e.target.value)} placeholder="Enter group name…" maxLength={50}
                style={{ flex:1, background:'none', border:'none', outline:'none', color:'#f1f5f9', fontSize:16, fontWeight:600 }} />
            </div>
            <div style={{ fontSize:11, color:'#334155', marginTop:6, textAlign:'right' }}>{groupName.length}/50</div>
          </div>

          {/* Members preview */}
          <div style={{ marginBottom:32 }}>
            <div style={{ fontSize:12, color:'#475569', fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:10 }}>Members ({selected.length + 1})</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {/* Me */}
              <div style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(99,102,241,0.12)', borderRadius:20, padding:'5px 10px 5px 6px' }}>
                <div style={{ width:24, height:24, borderRadius:'50%', background:'linear-gradient(135deg,#6366f1,#ec4899)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, color:'white', fontWeight:700 }}>
                  {(user?.displayName?.[0] || 'Y').toUpperCase()}
                </div>
                <span style={{ fontSize:12, color:'#818cf8', fontWeight:600 }}>You</span>
                <span style={{ fontSize:9, color:'#6366f1', background:'rgba(99,102,241,0.2)', borderRadius:4, padding:'1px 4px' }}>ADMIN</span>
              </div>
              {selected.map(m => (
                <div key={m.id} style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.06)', borderRadius:20, padding:'5px 10px 5px 6px' }}>
                  <div style={{ width:24, height:24, borderRadius:'50%', background:m.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12 }}>{m.emoji}</div>
                  <span style={{ fontSize:12, color:'#94a3b8' }}>{m.name.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Create button */}
          <button
            onClick={createGroup}
            disabled={!groupName.trim() || creating}
            style={{ width:'100%', background: groupName.trim() ? 'linear-gradient(135deg,#6366f1,#ec4899)' : 'rgba(99,102,241,0.2)', border:'none', borderRadius:16, padding:'15px', color:'white', fontSize:16, fontWeight:700, cursor: groupName.trim() ? 'pointer' : 'default', display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'background 0.2s' }}>
            {creating ? (
              <>
                <div style={{ width:18, height:18, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', animation:'spin 0.8s linear infinite' }} />
                Creating…
              </>
            ) : (
              `👥 Create Group Chat`
            )}
          </button>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}
    </div>
  );
}
