// LIVE MODERATION PAGE — /live/moderation
// FIXES APPLIED:
//   BUG-21: modRoles included in Firestore save + loaded back on mount
//   BUG-22: aiEnabled included in Firestore save + loaded back on mount
//   BUG-23: sec style constant moved to top of file (before component)
//   BUG-24: "Subscribers Only" renamed to "Followers Only" (matches description)
//   UX-16:  Live Chat Monitor section added — last 20 messages with Warn/Timeout/Ban buttons

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  doc, getDoc, setDoc, updateDoc, collection, query,
  where, orderBy, limit, onSnapshot, addDoc, serverTimestamp, deleteDoc,
} from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import useAppStore from '@store/useAppStore';

const DEFAULT_BAD_WORDS = ['spam','hate','abuse','slur'];

// BUG-23 FIX: sec constant moved to TOP of file, before component
const sec = {
  title:    { color:'#f1f5f9', fontWeight:800, fontSize:'14px', marginBottom:'4px' },
  desc:     { color:'#64748b', fontSize:'12px' },
  card:     { background:'#1e293b', borderRadius:'14px', padding:'16px', marginBottom:'12px' },
  row:      { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' },
  toggle:   (on) => ({ width:'44px', height:'24px', borderRadius:'12px', background: on?'#6366f1':'#334155', border:'none', cursor:'pointer', position:'relative', transition:'background 0.2s', flexShrink:0 }),
  toggleDot:(on) => ({ position:'absolute', top:'3px', left: on?'23px':'3px', width:'18px', height:'18px', borderRadius:'50%', background:'white', transition:'left 0.2s' }),
};

function LiveSubNav({ navigate, current }) {
  return (
    <div style={{ display:'flex', gap:'6px', padding:'8px 16px', overflowX:'auto', scrollbarWidth:'none', borderBottom:'1px solid #1e293b' }}>
      {[
        { label:'🎥 Setup',    path:'/live/setup' },
        { label:'📊 Analytics', path:'/live/analytics' },
        { label:'📅 Schedule', path:'/live/schedule' },
        { label:'💰 Monetize', path:'/live/monetization' },
      ].map(l => (
        <button key={l.path} onClick={() => navigate(l.path)}
          style={{ background: current===l.path?'rgba(99,102,241,0.2)':'#1e293b', border: current===l.path?'1px solid #6366f1':'none', borderRadius:'20px', padding:'5px 12px', color: current===l.path?'#818cf8':'#94a3b8', fontSize:'11px', fontWeight:600, cursor:'pointer', flexShrink:0 }}>
          {l.label}
        </button>
      ))}
    </div>
  );
}

export default function LiveModerationPage() {
  const navigate   = useNavigate();
  const [params]   = useSearchParams();
  const streamId   = params.get('streamId') || null;
  const showToast  = useAppStore(s => s.showToast);

  const [slowMode,      setSlowMode]      = useState(false);
  const [slowModeDelay, setSlowModeDelay] = useState(5);
  // BUG-24 FIX: renamed from subscribersOnly → followersOnly
  const [followersOnly, setFollowersOnly] = useState(false);
  const [filterBadWords,setFilterBadWords]= useState(true);
  const [bannedWords,   setBannedWords]   = useState([...DEFAULT_BAD_WORDS]);
  const [newWord,       setNewWord]       = useState('');
  const [testMsg,       setTestMsg]       = useState('');
  const [testResult,    setTestResult]    = useState(null);
  // BUG-22 FIX: aiEnabled now in state (was in state but not saved)
  const [aiEnabled,     setAiEnabled]     = useState(false);
  // BUG-21 FIX: modRoles now in state (was in state but not saved)
  const [modRoles,      setModRoles]      = useState([]);
  const [modInput,      setModInput]      = useState('');
  const [auditLog,      setAuditLog]      = useState([]);
  const [saving,        setSaving]        = useState(false);
  // UX-16: live chat monitor state
  const [liveChat,      setLiveChat]      = useState([]);
  const [chatLoaded,    setChatLoaded]    = useState(false);

  // Load settings from Firestore on mount
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const docPath = streamId
      ? doc(db, 'streams', streamId, 'modSettings', 'config')
      : doc(db, 'users', uid, 'modSettings', 'default');

    getDoc(docPath).then(snap => {
      if (!snap.exists()) return;
      const d = snap.data();
      setSlowMode      (d.slowMode       ?? false);
      setSlowModeDelay (d.slowModeDelay  ?? 5);
      setFollowersOnly (d.followersOnly  ?? false); // BUG-24 FIX: was subscribersOnly
      setFilterBadWords(d.filterBadWords ?? true);
      setBannedWords   (d.bannedWords    ?? [...DEFAULT_BAD_WORDS]);
      setAiEnabled     (d.aiEnabled      ?? false); // BUG-22 FIX: loaded from Firestore
      setModRoles      (d.modRoles       ?? []);    // BUG-21 FIX: loaded from Firestore
    }).catch(err => console.warn('[ModSettings load]', err));
  }, [streamId]);

  // UX-16 FIX: Live chat monitor — listen to stream messages if we have a streamId
  useEffect(() => {
    if (!streamId) { setChatLoaded(true); return; }
    const q = query(
      collection(db, 'streams', streamId, 'messages'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    const unsub = onSnapshot(q, snap => {
      setLiveChat(snap.docs.map(d => ({ id: d.id, ...d.data() })).reverse());
      setChatLoaded(true);
    }, () => setChatLoaded(true));
    return () => unsub();
  }, [streamId]);

  const handleSave = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    setSaving(true);
    try {
      const settings = {
        slowMode,
        slowModeDelay,
        followersOnly,  // BUG-24 FIX: renamed field
        filterBadWords,
        bannedWords,
        aiEnabled,      // BUG-22 FIX: now saved
        modRoles,       // BUG-21 FIX: now saved
        updatedAt: serverTimestamp(),
      };
      const docPath = streamId
        ? doc(db, 'streams', streamId, 'modSettings', 'config')
        : doc(db, 'users', uid, 'modSettings', 'default');
      await setDoc(docPath, settings, { merge: true });
      addAuditEntry('Settings saved successfully');
      showToast('✅ Moderation settings saved!');
    } catch (err) {
      console.error('[ModSettings save]', err);
      showToast('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const addBannedWord = () => {
    const w = newWord.trim().toLowerCase();
    if (!w || bannedWords.includes(w)) return;
    setBannedWords(prev => [...prev, w]);
    setNewWord('');
    addAuditEntry(`Added banned word: "${w}"`);
  };

  const removeBannedWord = (w) => {
    setBannedWords(prev => prev.filter(x => x !== w));
    addAuditEntry(`Removed banned word: "${w}"`);
  };

  const resetBannedWords = () => {
    setBannedWords([...DEFAULT_BAD_WORDS]);
    addAuditEntry('Banned word list reset to defaults');
  };

  const testMessage = () => {
    if (!testMsg.trim()) return;
    const lower = testMsg.toLowerCase();
    const blocked = filterBadWords && bannedWords.some(w => lower.includes(w));
    setTestResult({ blocked, msg: testMsg });
    addAuditEntry(`Tested message: "${testMsg}" → ${blocked ? 'BLOCKED' : 'ALLOWED'}`);
  };

  const addModerator = () => {
    const name = modInput.trim();
    if (!name || modRoles.find(m => m.name === name)) return;
    // BUG-21 FIX: modRoles is now proper state, will be saved by handleSave()
    setModRoles(prev => [...prev, { name, role:'moderator', addedAt: new Date().toISOString() }]);
    setModInput('');
    addAuditEntry(`Added moderator: ${name}`);
    showToast(`✅ ${name} added as moderator (save to persist)`);
  };

  const removeModerator = (name) => {
    setModRoles(prev => prev.filter(m => m.name !== name));
    addAuditEntry(`Removed moderator: ${name}`);
  };

  const addAuditEntry = (action) => {
    setAuditLog(prev => [{
      action,
      by: auth.currentUser?.displayName || 'You',
      time: new Date().toLocaleTimeString(),
    }, ...prev.slice(0,19)]);
  };

  // UX-16: Moderation actions on live chat
  const handleChatAction = async (msg, action) => {
    if (!streamId) return;
    try {
      if (action === 'delete') {
        await deleteDoc(doc(db, 'streams', streamId, 'messages', msg.id));
        addAuditEntry(`Deleted message from ${msg.userName}`);
        showToast(`🗑️ Message deleted`);
      } else if (action === 'ban') {
        await addDoc(collection(db, 'streams', streamId, 'banned'), {
          userId: msg.userId, userName: msg.userName, bannedAt: serverTimestamp(),
          bannedBy: auth.currentUser?.uid,
        });
        await deleteDoc(doc(db, 'streams', streamId, 'messages', msg.id));
        addAuditEntry(`Banned ${msg.userName} from stream`);
        showToast(`🚫 ${msg.userName} banned from this stream`);
      } else if (action === 'timeout') {
        await addDoc(collection(db, 'streams', streamId, 'timeouts'), {
          userId: msg.userId, userName: msg.userName,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
          timedOutBy: auth.currentUser?.uid,
        });
        addAuditEntry(`Timed out ${msg.userName} for 5 minutes`);
        showToast(`⏱️ ${msg.userName} timed out (5 min)`);
      } else if (action === 'warn') {
        await addDoc(collection(db, 'streams', streamId, 'messages'), {
          type: 'system',
          text: `⚠️ ${msg.userName} has been warned by a moderator.`,
          createdAt: serverTimestamp(),
        });
        addAuditEntry(`Warned ${msg.userName}`);
        showToast(`⚠️ Warning sent to ${msg.userName}`);
      }
    } catch (err) {
      console.error('[ChatAction]', err);
      showToast('Action failed');
    }
  };

  return (
    <div style={{ background:'var(--bg-primary,#0a0a18)', minHeight:'100vh', paddingBottom:'80px' }}>
      <div style={{ padding:'16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', gap:'12px' }}>
        <button onClick={() => navigate(-1)} style={{ background:'none', border:'none', color:'#94a3b8', fontSize:'20px', cursor:'pointer' }}>←</button>
        <span style={{ color:'#475569', fontSize:'12px' }}>Live →</span>
        <span style={{ fontSize:'18px', fontWeight:800, color:'#f1f5f9', flex:1 }}>🛡️ Chat Moderation</span>
        <button onClick={handleSave} disabled={saving} aria-label="Save moderation settings"
          style={{ background:'linear-gradient(135deg,#10b981,#0f766e)', border:'none', borderRadius:'10px', padding:'6px 14px', color:'white', fontWeight:700, fontSize:'12px', cursor:'pointer', opacity: saving?0.6:1 }}>
          {saving ? 'Saving…' : '✓ Save'}
        </button>
      </div>
      <LiveSubNav navigate={navigate} current="/live/moderation" />

      <div style={{ padding:'16px' }}>

        {/* UX-16 FIX: Live Chat Monitor */}
        {streamId && (
          <div style={sec.card}>
            <div style={{ ...sec.row, marginBottom:'10px' }}>
              <div>
                <div style={sec.title}>📡 Live Chat Monitor</div>
                <div style={sec.desc}>{chatLoaded ? `${liveChat.length} recent messages` : 'Loading chat…'}</div>
              </div>
            </div>
            {!chatLoaded && <div style={{ color:'#64748b', fontSize:'12px' }}>Connecting to live chat…</div>}
            {chatLoaded && liveChat.length === 0 && <div style={{ color:'#475569', fontSize:'12px', textAlign:'center', padding:'12px' }}>No messages yet in this stream.</div>}
            <div style={{ maxHeight:'240px', overflowY:'auto', display:'flex', flexDirection:'column', gap:'6px' }}>
              {liveChat.map(msg => (
                <div key={msg.id} style={{ background:'#0f172a', borderRadius:'10px', padding:'8px 10px', display:'flex', alignItems:'flex-start', gap:'8px' }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <span style={{ color:'#818cf8', fontSize:'11px', fontWeight:700 }}>{msg.userName || 'User'} </span>
                    <span style={{ color:'#f1f5f9', fontSize:'12px' }}>{msg.text}</span>
                  </div>
                  <div style={{ display:'flex', gap:'4px', flexShrink:0 }}>
                    <button onClick={() => handleChatAction(msg,'warn')} title="Warn user"
                      style={{ background:'rgba(245,158,11,0.15)', border:'none', borderRadius:'6px', padding:'3px 6px', color:'#f59e0b', fontSize:'10px', cursor:'pointer', fontWeight:700 }}>⚠️</button>
                    <button onClick={() => handleChatAction(msg,'timeout')} title="Timeout 5 min"
                      style={{ background:'rgba(99,102,241,0.15)', border:'none', borderRadius:'6px', padding:'3px 6px', color:'#818cf8', fontSize:'10px', cursor:'pointer', fontWeight:700 }}>⏱️</button>
                    <button onClick={() => handleChatAction(msg,'delete')} title="Delete message"
                      style={{ background:'rgba(239,68,68,0.15)', border:'none', borderRadius:'6px', padding:'3px 6px', color:'#ef4444', fontSize:'10px', cursor:'pointer', fontWeight:700 }}>🗑️</button>
                    <button onClick={() => handleChatAction(msg,'ban')} title="Ban from stream"
                      style={{ background:'rgba(239,68,68,0.2)', border:'none', borderRadius:'6px', padding:'3px 6px', color:'#ef4444', fontSize:'10px', cursor:'pointer', fontWeight:700 }}>🚫</button>
                  </div>
                </div>
              ))}
            </div>
            {!streamId && <div style={{ color:'#475569', fontSize:'11px', marginTop:'8px', textAlign:'center' }}>Start a stream to see live chat here.</div>}
          </div>
        )}
        {!streamId && (
          <div style={{ background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:'12px', padding:'12px 14px', marginBottom:'12px', fontSize:'12px', color:'#818cf8' }}>
            💡 Start a stream and navigate here via the Setup page to see the Live Chat Monitor with moderation actions.
          </div>
        )}

        {/* Slow Mode */}
        <div style={sec.card}>
          <div style={sec.row}>
            <div>
              <div style={sec.title}>🐢 Slow Mode</div>
              <div style={sec.desc}>Limit how often viewers can send messages</div>
            </div>
            <button onClick={() => setSlowMode(p => !p)} aria-label={`Slow mode ${slowMode?'on':'off'}`} aria-pressed={slowMode} style={sec.toggle(slowMode)}>
              <div style={sec.toggleDot(slowMode)} />
            </button>
          </div>
          {slowMode && (
            <div>
              <div style={{ fontSize:'11px', color:'#64748b', marginBottom:'6px' }}>Delay between messages:</div>
              <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
                {[3,5,10,30,60].map(d => (
                  <button key={d} onClick={() => setSlowModeDelay(d)} aria-pressed={slowModeDelay===d}
                    style={{ padding:'4px 10px', borderRadius:'10px', border:'none', fontSize:'11px', fontWeight:600, cursor:'pointer',
                      background: slowModeDelay===d ? '#6366f1' : '#334155', color: slowModeDelay===d ? 'white' : '#94a3b8' }}>
                    {d}s
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* BUG-24 FIX: "Subscribers Only" → "Followers Only" */}
        <div style={sec.card}>
          <div style={sec.row}>
            <div>
              <div style={sec.title}>👥 Followers Only</div>
              <div style={sec.desc}>Only followers can send messages</div>
            </div>
            <button onClick={() => setFollowersOnly(p => !p)} aria-label={`Followers only ${followersOnly?'on':'off'}`} aria-pressed={followersOnly} style={sec.toggle(followersOnly)}>
              <div style={sec.toggleDot(followersOnly)} />
            </button>
          </div>
        </div>

        {/* Bad Words Filter */}
        <div style={sec.card}>
          <div style={sec.row}>
            <div>
              <div style={sec.title}>🚫 Filter Bad Words</div>
              <div style={sec.desc}>Auto-remove messages with blocked words</div>
            </div>
            <button onClick={() => setFilterBadWords(p => !p)} aria-label={`Word filter ${filterBadWords?'on':'off'}`} aria-pressed={filterBadWords} style={sec.toggle(filterBadWords)}>
              <div style={sec.toggleDot(filterBadWords)} />
            </button>
          </div>
          {filterBadWords && (
            <div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginBottom:'10px' }}>
                {bannedWords.map(w => (
                  <span key={w} style={{ background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'10px', padding:'3px 8px', color:'#ef4444', fontSize:'11px', display:'flex', alignItems:'center', gap:'4px' }}>
                    {w}
                    <button onClick={() => removeBannedWord(w)} aria-label={`Remove banned word ${w}`} style={{ background:'none', border:'none', color:'#94a3b8', cursor:'pointer', fontSize:'11px', padding:0 }}>✕</button>
                  </span>
                ))}
              </div>
              <div style={{ display:'flex', gap:'8px', marginBottom:'8px' }}>
                <input value={newWord} onChange={e => setNewWord(e.target.value)} onKeyDown={e => e.key==='Enter' && addBannedWord()} placeholder="Add word..." aria-label="Add banned word"
                  style={{ flex:1, background:'#0f172a', border:'1px solid #334155', borderRadius:'10px', padding:'7px 10px', color:'#f1f5f9', fontSize:'12px', outline:'none' }} />
                <button onClick={addBannedWord} aria-label="Add word to ban list"
                  style={{ background:'#334155', border:'none', borderRadius:'10px', padding:'7px 12px', color:'#f1f5f9', fontWeight:700, fontSize:'12px', cursor:'pointer' }}>Add</button>
                <button onClick={resetBannedWords} aria-label="Reset word list to defaults"
                  style={{ background:'rgba(239,68,68,0.15)', border:'none', borderRadius:'10px', padding:'7px 10px', color:'#ef4444', fontSize:'11px', cursor:'pointer' }}>Reset</button>
              </div>
            </div>
          )}
        </div>

        {/* Test Message Panel */}
        <div style={sec.card}>
          <div style={{ ...sec.title, marginBottom:'8px' }}>🧪 Test a Message</div>
          <div style={{ display:'flex', gap:'8px', marginBottom:'8px' }}>
            <input value={testMsg} onChange={e => setTestMsg(e.target.value)} placeholder="Type a test message..." aria-label="Test message"
              style={{ flex:1, background:'#0f172a', border:'1px solid #334155', borderRadius:'10px', padding:'8px 10px', color:'#f1f5f9', fontSize:'12px', outline:'none' }} />
            <button onClick={testMessage} aria-label="Test message against filter"
              style={{ background:'#334155', border:'none', borderRadius:'10px', padding:'8px 12px', color:'#f1f5f9', fontWeight:700, fontSize:'12px', cursor:'pointer' }}>Test</button>
          </div>
          {testResult && (
            <div style={{ background: testResult.blocked?'rgba(239,68,68,0.1)':'rgba(16,185,129,0.1)', border:`1px solid ${testResult.blocked?'rgba(239,68,68,0.3)':'rgba(16,185,129,0.3)'}`, borderRadius:'8px', padding:'8px 12px', fontSize:'12px', color: testResult.blocked?'#ef4444':'#10b981' }}>
              {testResult.blocked ? '🚫 BLOCKED — contains banned word' : '✅ ALLOWED — message would go through'}
            </div>
          )}
        </div>

        {/* BUG-22 FIX: AI Moderation — now saved to Firestore */}
        <div style={sec.card}>
          <div style={sec.row}>
            <div>
              <div style={sec.title}>🤖 AI Moderation <span style={{ background:'rgba(99,102,241,0.2)', color:'#818cf8', borderRadius:'6px', padding:'1px 6px', fontSize:'10px', marginLeft:'6px' }}>BETA</span></div>
              <div style={sec.desc}>Use AI to detect toxic messages in real time</div>
            </div>
            <button onClick={() => setAiEnabled(p => !p)} aria-label={`AI moderation ${aiEnabled?'on':'off'}`} aria-pressed={aiEnabled} style={sec.toggle(aiEnabled)}>
              <div style={sec.toggleDot(aiEnabled)} />
            </button>
          </div>
          {aiEnabled && (
            <div style={{ background:'rgba(99,102,241,0.08)', borderRadius:'8px', padding:'8px 10px', fontSize:'11px', color:'#818cf8' }}>
              ✓ AI moderation active — powered by OpenAI. Suspicious messages are held for review.
            </div>
          )}
        </div>

        {/* BUG-21 FIX: Mod Roles — now saved to Firestore via handleSave */}
        <div style={sec.card}>
          <div style={{ ...sec.title, marginBottom:'8px' }}>👮 Moderators</div>
          <div style={{ display:'flex', gap:'8px', marginBottom:'10px' }}>
            <input value={modInput} onChange={e => setModInput(e.target.value)} onKeyDown={e => e.key==='Enter' && addModerator()} placeholder="Enter username..." aria-label="Add moderator by username"
              style={{ flex:1, background:'#0f172a', border:'1px solid #334155', borderRadius:'10px', padding:'8px 10px', color:'#f1f5f9', fontSize:'12px', outline:'none' }} />
            <button onClick={addModerator} aria-label="Add moderator"
              style={{ background:'#334155', border:'none', borderRadius:'10px', padding:'8px 12px', color:'#f1f5f9', fontWeight:700, fontSize:'12px', cursor:'pointer' }}>Add</button>
          </div>
          {modRoles.length === 0 && <div style={{ color:'#475569', fontSize:'12px' }}>No moderators assigned yet.</div>}
          {modRoles.map(m => (
            <div key={m.name} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid #334155' }}>
              <div>
                <span style={{ color:'#f1f5f9', fontSize:'12px', fontWeight:600 }}>{m.name}</span>
                <span style={{ color:'#64748b', fontSize:'11px', marginLeft:'6px' }}>Moderator</span>
              </div>
              <button onClick={() => removeModerator(m.name)} aria-label={`Remove moderator ${m.name}`}
                style={{ background:'none', border:'none', color:'#ef4444', cursor:'pointer', fontSize:'12px', fontWeight:700 }}>Remove</button>
            </div>
          ))}
          <div style={{ color:'#475569', fontSize:'10px', marginTop:'6px' }}>⚠️ Save settings to persist moderators between sessions.</div>
        </div>

        {/* Community Rules */}
        <div style={sec.card}>
          <div style={{ ...sec.title, marginBottom:'8px' }}>📋 Community Rules</div>
          {['Be respectful to everyone','No spam or self-promotion','No hate speech or harassment','Keep chat relevant to the stream','Follow ConnectHub Terms of Service'].map((r,i) => (
            <div key={i} style={{ display:'flex', gap:'8px', padding:'5px 0', borderBottom: i<4?'1px solid #334155':'' }}>
              <span style={{ color:'#6366f1', fontWeight:800, fontSize:'12px', flexShrink:0 }}>{i+1}.</span>
              <span style={{ color:'#94a3b8', fontSize:'12px' }}>{r}</span>
            </div>
          ))}
        </div>

        {/* Audit Trail */}
        {auditLog.length > 0 && (
          <div style={sec.card}>
            <div style={{ ...sec.title, marginBottom:'8px' }}>📝 Session Audit Log</div>
            {auditLog.map((e,i) => (
              <div key={i} style={{ display:'flex', gap:'8px', padding:'4px 0', borderBottom:'1px solid #1e293b' }}>
                <span style={{ color:'#475569', fontSize:'10px', flexShrink:0 }}>{e.time}</span>
                <span style={{ color:'#94a3b8', fontSize:'11px' }}>{e.action}</span>
              </div>
            ))}
          </div>
        )}

        <button onClick={handleSave} disabled={saving} style={{ width:'100%', background:'linear-gradient(135deg,#10b981,#0f766e)', border:'none', borderRadius:'14px', padding:'14px', color:'white', fontWeight:700, fontSize:'14px', cursor:'pointer', opacity:saving?0.6:1 }}>
          {saving ? '⏳ Saving…' : '✓ Save All Settings'}
        </button>
      </div>
    </div>
  );
}
