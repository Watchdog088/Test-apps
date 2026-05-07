// LiveModerationPage.jsx
// UX-29: Slow mode duration slider (3s/5s/10s/30s)
// UX-30: Banned word list import/export
// UX-31: AI auto-moderation toggle (OpenAI)

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, query, where, orderBy, onSnapshot, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import useAppStore from '@store/useAppStore';

const SLOW_OPTIONS = [
  { label: 'Off',  value: 0 },
  { label: '3s',   value: 3 },
  { label: '5s',   value: 5 },
  { label: '10s',  value: 10 },
  { label: '30s',  value: 30 },
];

export default function LiveModerationPage() {
  const navigate   = useNavigate();
  const [searchParams] = useSearchParams();
  const streamId   = searchParams.get('streamId');
  const showToast  = useAppStore(s => s.showToast);

  // Moderation settings state
  const [slowMode,       setSlowMode]       = useState(0);
  const [subOnly,        setSubOnly]        = useState(false);
  const [followOnly,     setFollowOnly]     = useState(false);
  const [aiMod,          setAiMod]          = useState(false);   // UX-31
  const [bannedWords,    setBannedWords]    = useState([]);      // UX-30
  const [newWord,        setNewWord]        = useState('');
  const [bannedUsers,    setBannedUsers]    = useState([]);
  const [chatMessages,   setChatMessages]   = useState([]);
  const [saving,         setSaving]         = useState(false);
  const [importRef]      = [useRef(null)];

  // Load stream moderation settings
  useEffect(() => {
    if (!streamId) return;
    getDoc(doc(db, 'streams', streamId)).then(snap => {
      if (!snap.exists()) return;
      const d = snap.data();
      setSlowMode(d.slowMode || 0);
      setSubOnly(d.subOnly || false);
      setFollowOnly(d.followOnly || false);
      setAiMod(d.aiModeration || false);
      setBannedWords(d.bannedWords || []);
      setBannedUsers(d.bannedUsers || []);
    }).catch(() => {});
  }, [streamId]);

  // Live chat feed for moderation
  useEffect(() => {
    if (!streamId) return;
    const q = query(collection(db, 'streams', streamId, 'messages'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setChatMessages(snap.docs.slice(0, 50).map(d => ({ id: d.id, ...d.data() })));
    }, () => {});
    return () => unsub();
  }, [streamId]);

  const saveSettings = async (patch) => {
    if (!streamId) { showToast('No active stream'); return; }
    setSaving(true);
    try {
      await updateDoc(doc(db, 'streams', streamId), patch);
      showToast('✓ Settings saved');
    } catch { showToast('Failed to save'); }
    finally { setSaving(false); }
  };

  // UX-29: Slow mode change
  const handleSlowMode = async (val) => {
    setSlowMode(val);
    await saveSettings({ slowMode: val });
  };

  // Toggle helpers
  const toggleSub = async () => { const v = !subOnly; setSubOnly(v); await saveSettings({ subOnly: v }); };
  const toggleFollow = async () => { const v = !followOnly; setFollowOnly(v); await saveSettings({ followOnly: v }); };

  // UX-31: AI moderation toggle
  const toggleAI = async () => {
    const v = !aiMod;
    setAiMod(v);
    await saveSettings({ aiModeration: v });
    showToast(v ? '🤖 AI moderation ON' : '🤖 AI moderation OFF');
  };

  // Add banned word
  const addWord = async () => {
    const w = newWord.trim().toLowerCase();
    if (!w || bannedWords.includes(w)) { setNewWord(''); return; }
    const updated = [...bannedWords, w];
    setBannedWords(updated);
    setNewWord('');
    await saveSettings({ bannedWords: updated });
  };

  const removeWord = async (w) => {
    const updated = bannedWords.filter(x => x !== w);
    setBannedWords(updated);
    await saveSettings({ bannedWords: updated });
  };

  // UX-30: Export banned words
  const exportWords = () => {
    const txt = bannedWords.join('\n');
    const blob = new Blob([txt], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'banned-words.txt'; a.click();
    URL.revokeObjectURL(url);
  };

  // UX-30: Import banned words
  const importWords = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const lines = ev.target.result.split(/[\n,;]+/).map(w => w.trim().toLowerCase()).filter(Boolean);
      const merged = Array.from(new Set([...bannedWords, ...lines]));
      setBannedWords(merged);
      await saveSettings({ bannedWords: merged });
      showToast(`✓ Imported ${lines.length} words`);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Delete a chat message
  const deleteMsg = async (msgId) => {
    if (!streamId) return;
    try {
      await deleteDoc(doc(db, 'streams', streamId, 'messages', msgId));
      showToast('Message deleted');
    } catch { showToast('Delete failed'); }
  };

  // Ban a user
  const banUser = async (userId, userName) => {
    if (!streamId) return;
    const updated = [...bannedUsers, userId];
    setBannedUsers(updated);
    await saveSettings({ bannedUsers: updated });
    showToast(`🚫 ${userName} banned`);
  };

  const Toggle = ({ on, onToggle, label, sub }) => (
    <div style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px 0', borderBottom:'1px solid #1e293b' }}>
      <div style={{ flex:1 }}>
        <div style={{ color:'#f1f5f9', fontSize:'14px', fontWeight:600 }}>{label}</div>
        {sub && <div style={{ color:'#64748b', fontSize:'12px', marginTop:'2px' }}>{sub}</div>}
      </div>
      <button onClick={onToggle} aria-label={`Toggle ${label}`}
        style={{ width:'48px', height:'26px', borderRadius:'13px', border:'none', cursor:'pointer', flexShrink:0, position:'relative',
          background: on ? 'linear-gradient(135deg,#ef4444,#f59e0b)' : '#334155', transition:'background 0.2s' }}>
        <span style={{ position:'absolute', top:'3px', left: on ? '25px' : '3px', width:'20px', height:'20px',
          borderRadius:'50%', background:'white', transition:'left 0.2s', display:'block' }} />
      </button>
    </div>
  );

  return (
    <div style={{ background:'#0a0a18', minHeight:'100vh', paddingBottom:'80px' }}>
      {/* Header */}
      <div style={{ padding:'12px 16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', gap:'10px' }}>
        <button onClick={() => navigate(-1)} style={{ background:'none', border:'none', color:'#94a3b8', fontSize:'20px', cursor:'pointer' }}>←</button>
        <span style={{ fontSize:'16px', fontWeight:800, color:'#f1f5f9', flex:1 }}>🛡️ Chat Moderation</span>
        {saving && <span style={{ color:'#64748b', fontSize:'12px' }}>Saving…</span>}
      </div>

      <div style={{ padding:'12px 16px' }}>

        {/* UX-29: Slow Mode slider */}
        <div style={{ background:'#1e293b', borderRadius:'14px', padding:'14px', marginBottom:'12px' }}>
          <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'14px', marginBottom:'6px' }}>
            🐢 Slow Mode: {slowMode === 0 ? 'Off' : `${slowMode}s between messages`}
          </div>
          <div style={{ color:'#64748b', fontSize:'12px', marginBottom:'12px' }}>Limit how often viewers can send messages</div>
          <div style={{ display:'flex', gap:'8px' }}>
            {SLOW_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => handleSlowMode(opt.value)}
                style={{ flex:1, padding:'8px 4px', borderRadius:'10px', border:'none', cursor:'pointer', fontSize:'12px', fontWeight:700,
                  background: slowMode === opt.value ? 'linear-gradient(135deg,#ef4444,#f59e0b)' : '#334155',
                  color: slowMode === opt.value ? 'white' : '#94a3b8' }}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* UX-31: AI Auto-moderation */}
        <div style={{ background:'#1e293b', borderRadius:'14px', padding:'14px', marginBottom:'12px' }}>
          <Toggle on={aiMod} onToggle={toggleAI}
            label="🤖 AI Auto-Moderation"
            sub="Automatically remove toxic messages using OpenAI" />
          <Toggle on={subOnly} onToggle={toggleSub}
            label="⭐ Subscribers Only Chat"
            sub="Only subscribers can send messages" />
          <Toggle on={followOnly} onToggle={toggleFollow}
            label="👥 Followers Only Chat"
            sub="Only followers can send messages" />
        </div>

        {/* UX-30: Banned Words */}
        <div style={{ background:'#1e293b', borderRadius:'14px', padding:'14px', marginBottom:'12px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px' }}>
            <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'14px', flex:1 }}>🚫 Banned Words ({bannedWords.length})</div>
            {/* UX-30: Export/Import */}
            <button onClick={exportWords}
              style={{ background:'#334155', border:'none', borderRadius:'8px', padding:'4px 10px', color:'#94a3b8', fontSize:'11px', cursor:'pointer' }}>
              📥 Export
            </button>
            <label style={{ background:'#334155', borderRadius:'8px', padding:'4px 10px', color:'#94a3b8', fontSize:'11px', cursor:'pointer' }}>
              📤 Import
              <input ref={importRef} type="file" accept=".txt,.csv" onChange={importWords} style={{ display:'none' }} />
            </label>
          </div>
          <div style={{ display:'flex', gap:'8px', marginBottom:'10px' }}>
            <input value={newWord} onChange={e => setNewWord(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addWord()}
              placeholder="Add banned word…"
              style={{ flex:1, background:'#0a0a18', border:'1px solid #334155', borderRadius:'10px',
                padding:'8px 12px', color:'#f1f5f9', fontSize:'13px', outline:'none' }} />
            <button onClick={addWord}
              style={{ background:'#ef4444', border:'none', borderRadius:'10px', padding:'8px 14px', color:'white', fontWeight:700, fontSize:'13px', cursor:'pointer' }}>
              Add
            </button>
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
            {bannedWords.map(w => (
              <span key={w} style={{ background:'#334155', borderRadius:'20px', padding:'4px 10px', color:'#f1f5f9', fontSize:'12px', display:'flex', alignItems:'center', gap:'6px' }}>
                {w}
                <button onClick={() => removeWord(w)}
                  style={{ background:'none', border:'none', color:'#ef4444', cursor:'pointer', fontSize:'14px', padding:0, lineHeight:1 }}>×</button>
              </span>
            ))}
            {bannedWords.length === 0 && <span style={{ color:'#64748b', fontSize:'12px' }}>No banned words yet</span>}
          </div>
        </div>

        {/* Live Chat Moderation */}
        {streamId && (
          <div style={{ background:'#1e293b', borderRadius:'14px', padding:'14px' }}>
            <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'14px', marginBottom:'10px' }}>
              💬 Recent Messages ({chatMessages.length})
            </div>
            {chatMessages.length === 0 ? (
              <div style={{ color:'#64748b', fontSize:'13px', textAlign:'center', padding:'16px' }}>No messages yet</div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'8px', maxHeight:'300px', overflowY:'auto' }}>
                {chatMessages.map(msg => (
                  <div key={msg.id} style={{ display:'flex', gap:'8px', alignItems:'flex-start' }}>
                    <div style={{ flex:1 }}>
                      <span style={{ color:'#f59e0b', fontSize:'12px', fontWeight:700 }}>{msg.userName}: </span>
                      <span style={{ color:'#f1f5f9', fontSize:'13px' }}>{msg.text}</span>
                    </div>
                    <div style={{ display:'flex', gap:'4px', flexShrink:0 }}>
                      <button onClick={() => deleteMsg(msg.id)}
                        style={{ background:'#334155', border:'none', borderRadius:'6px', padding:'3px 8px', color:'#ef4444', fontSize:'11px', cursor:'pointer' }}>
                        🗑️
                      </button>
                      {!bannedUsers.includes(msg.userId) && (
                        <button onClick={() => banUser(msg.userId, msg.userName)}
                          style={{ background:'#334155', border:'none', borderRadius:'6px', padding:'3px 8px', color:'#f59e0b', fontSize:'11px', cursor:'pointer' }}>
                          🚫
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
