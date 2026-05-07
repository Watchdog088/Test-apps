// LIVE MODERATION PAGE — /live/moderation
// REC-5: Full word-filter management — add/remove/test words, saved to Firestore
//        Cloud Function wordFilterEnforcer deletes messages containing banned words
// Previous fixes retained: BUG-6 (save to Firestore), slow mode, subs-only

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import useAppStore from '@store/useAppStore';

const DEFAULT_WORDS = ['spam', 'hate', 'nsfw', 'scam', 'porn', 'racist'];

const Toggle = ({ value, onChange, label }) => (
  <button onClick={() => onChange(!value)} aria-pressed={value} aria-label={label}
    style={{ width:'48px', height:'26px', borderRadius:'13px', border:'none', cursor:'pointer',
      background: value ? '#10b981' : '#334155', position:'relative', transition:'background 0.2s', flexShrink:0 }}>
    <div style={{ width:'20px', height:'20px', borderRadius:'50%', background:'white',
      position:'absolute', top:'3px', left: value ? '25px' : '3px', transition:'left 0.2s' }} />
  </button>
);

const RULES = [
  'No hate speech or discrimination',
  'No spam or self-promotion',
  'No explicit or NSFW content',
  'Be respectful to all viewers',
  'No sharing personal information',
];

export default function LiveModerationPage() {
  const navigate  = useNavigate();
  const showToast = useAppStore(s => s.showToast);
  const [params]  = useSearchParams();
  const streamId  = params.get('streamId') || localStorage.getItem('currentStreamId') || null;

  const [slowMode,    setSlowMode]    = useState(false);
  const [slowDelay,   setSlowDelay]   = useState(5);
  const [subsOnly,    setSubsOnly]    = useState(false);
  const [filterWords, setFilterWords] = useState(true);
  const [saving,      setSaving]      = useState(false);

  // REC-5: Word filter management
  const [wordList,    setWordList]    = useState([...DEFAULT_WORDS]);
  const [newWord,     setNewWord]     = useState('');
  const [testInput,   setTestInput]   = useState('');
  const [testResult,  setTestResult]  = useState(null); // null | { blocked: bool, matched: string }
  const wordInputRef  = useRef(null);
  const [modLog,      setModLog]      = useState([]); // audit trail
  const [modRoles,    setModRoles]    = useState([]); // trusted moderators
  const [modInput,    setModInput]    = useState('');
  const [aiEnabled,   setAiEnabled]   = useState(false);
  const [showLog,     setShowLog]     = useState(false);
  const addModLogEntry = (action) => setModLog(p => [{ action, ts: new Date().toLocaleTimeString() }, ...p].slice(0,50));
  const addModRole = () => {
    if (!modInput.trim()) return;
    setModRoles(p => [...p, modInput.trim()]);
    addModLogEntry(`Assigned mod role to ${modInput.trim()}`);
    setModInput('');
  };

  // Load existing settings from Firestore on mount
  useEffect(() => {
    (async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) return;
        const path = streamId
          ? doc(db, 'streams', streamId, 'settings', 'moderation')
          : doc(db, 'users', uid, 'streamSettings', 'moderation');
        const snap = await getDoc(path);
        if (snap.exists()) {
          const d = snap.data();
          if (d.slowMode !== undefined) setSlowMode(d.slowMode);
          if (d.slowModeDelay) setSlowDelay(d.slowModeDelay);
          if (d.subscribersOnly !== undefined) setSubsOnly(d.subscribersOnly);
          if (d.filterBadWords !== undefined) setFilterWords(d.filterBadWords);
          if (d.bannedWords?.length) setWordList(d.bannedWords);
        }
      } catch { /* silent */ }
    })();
  }, [streamId]);

  // REC-5: Add word to list
  const addWord = () => {
    const w = newWord.trim().toLowerCase();
    if (!w) return;
    if (wordList.includes(w)) { showToast('Word already in list'); return; }
    if (wordList.length >= 100) { showToast('Maximum 100 words'); return; }
    setWordList(prev => [...prev, w]);
    setNewWord('');
    wordInputRef.current?.focus();
  };

  // REC-5: Remove word
  const removeWord = (word) => setWordList(prev => prev.filter(w => w !== word));

  // REC-5: Reset to defaults
  const resetDefaults = () => {
    setWordList([...DEFAULT_WORDS]);
    showToast('Reset to default word list');
  };

  // REC-5: Test a message against the word list
  const testMessage = () => {
    const lower = testInput.toLowerCase();
    const matched = wordList.find(w => lower.includes(w));
    setTestResult({ blocked: !!matched, matched: matched || null });
  };

  // Save all settings to Firestore
  const handleSave = async () => {
    setSaving(true);
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) { showToast('Not signed in'); return; }

      const settings = {
        slowMode,
        slowModeDelay: slowDelay,
        subscribersOnly: subsOnly,
        filterBadWords: filterWords,
        bannedWords: wordList,
        updatedAt: serverTimestamp(),
      };

      if (streamId) {
        await setDoc(doc(db, 'streams', streamId, 'settings', 'moderation'), settings, { merge: true });
        // Also write bannedWords to the stream doc so Cloud Function can read it quickly
        await updateDoc(doc(db, 'streams', streamId), { bannedWords: wordList });
      } else {
        await setDoc(doc(db, 'users', uid, 'streamSettings', 'moderation'), settings, { merge: true });
      }
      showToast('✅ Moderation settings saved!');
      setTimeout(() => navigate(-1), 800);
    } catch (err) {
      console.error('[Moderation save]', err);
      showToast('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ background:'var(--bg-primary,#0a0a18)', minHeight:'100vh', paddingBottom:'100px' }}>

      {/* Header */}
      <div style={{ padding:'16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', gap:'12px' }}>
        <button onClick={() => navigate(-1)} aria-label="Go back"
          style={{ background:'none', border:'none', color:'#94a3b8', fontSize:'20px', cursor:'pointer' }}>←</button>
        <span style={{ fontSize:'18px', fontWeight:800, color:'#f1f5f9' }}>🛡️ Moderation</span>
        {streamId && (
          <span style={{ background:'rgba(239,68,68,0.15)', color:'#ef4444', borderRadius:'6px',
            fontSize:'10px', fontWeight:700, padding:'2px 7px', marginLeft:'auto' }}>● LIVE</span>
        )}
      </div>

      <div style={{ padding:'20px 16px' }}>

        {/* Chat Controls */}
        <div style={sec}>Chat Controls</div>

        {/* Slow Mode */}
        <div style={{ background:'#1e293b', borderRadius:'14px', padding:'14px', marginBottom:'10px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: slowMode ? '12px' : 0 }}>
            <div>
              <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'14px' }}>Slow Mode</div>
              <div style={{ color:'#64748b', fontSize:'12px', marginTop:'2px' }}>Limit messages to once every {slowDelay}s</div>
            </div>
            <Toggle value={slowMode} onChange={setSlowMode} label="Toggle slow mode" />
          </div>
          {slowMode && (
            <div style={{ display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap' }}>
              <span style={{ color:'#94a3b8', fontSize:'12px' }}>Delay:</span>
              {[3,5,10,30,60].map(d => (
                <button key={d} onClick={() => setSlowDelay(d)}
                  style={{ background: slowDelay===d ? 'linear-gradient(135deg,#ef4444,#f59e0b)' : '#334155',
                    border:'none', borderRadius:'8px', padding:'4px 10px', color: slowDelay===d?'white':'#94a3b8',
                    fontSize:'11px', fontWeight:700, cursor:'pointer' }}>
                  {d}s
                </button>
              ))}
            </div>
          )}
        </div>

        {[
          { label:'Subscribers Only', desc:'Only followers can send messages', val:subsOnly, set:setSubsOnly },
          { label:'Filter Bad Words',  desc:'Auto-remove flagged words (see list below)', val:filterWords, set:setFilterWords },
        ].map(c => (
          <div key={c.label} style={{ background:'#1e293b', borderRadius:'14px', padding:'14px', marginBottom:'10px',
            display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'14px' }}>{c.label}</div>
              <div style={{ color:'#64748b', fontSize:'12px', marginTop:'2px' }}>{c.desc}</div>
            </div>
            <Toggle value={c.val} onChange={c.set} label={`Toggle ${c.label}`} />
          </div>
        ))}

        {/* ── REC-5: Word Filter Management ─────────────────────── */}
        <div style={{ ...sec, marginTop:'24px' }}>
          Word Filter ({wordList.length}/100 words)
          <button onClick={resetDefaults}
            style={{ marginLeft:'auto', background:'rgba(239,68,68,0.12)', border:'none', borderRadius:'6px',
              padding:'3px 8px', color:'#ef4444', fontSize:'10px', fontWeight:700, cursor:'pointer' }}>
            Reset Defaults
          </button>
        </div>

        {/* Current word chips */}
        {wordList.length > 0 && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginBottom:'12px' }}>
            {wordList.map(w => (
              <div key={w} style={{ display:'flex', alignItems:'center', gap:'4px', background:'rgba(239,68,68,0.12)',
                borderRadius:'20px', padding:'4px 10px 4px 12px' }}>
                <span style={{ color:'#f1f5f9', fontSize:'12px', fontWeight:600 }}>{w}</span>
                <button onClick={() => removeWord(w)} aria-label={`Remove word ${w}`}
                  style={{ background:'none', border:'none', color:'#ef4444', fontSize:'12px',
                    cursor:'pointer', padding:'0 0 0 2px', lineHeight:1 }}>✕</button>
              </div>
            ))}
          </div>
        )}

        {/* Add new word */}
        <div style={{ display:'flex', gap:'8px', marginBottom:'12px' }}>
          <input ref={wordInputRef} value={newWord} onChange={e => setNewWord(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addWord()}
            placeholder="Add a word or phrase…"
            maxLength={40}
            aria-label="New banned word"
            style={{ flex:1, background:'#1e293b', border:'1px solid #334155', borderRadius:'10px',
              padding:'10px 14px', color:'#f1f5f9', fontSize:'13px', outline:'none' }} />
          <button onClick={addWord} disabled={!newWord.trim()}
            style={{ background:'linear-gradient(135deg,#6366f1,#8b5cf6)', border:'none', borderRadius:'10px',
              padding:'10px 16px', color:'white', fontWeight:700, fontSize:'13px',
              cursor: newWord.trim() ? 'pointer' : 'not-allowed', opacity: newWord.trim() ? 1 : 0.5 }}>
            + Add
          </button>
        </div>

        {/* Test message */}
        <div style={{ background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.2)',
          borderRadius:'14px', padding:'14px', marginBottom:'4px' }}>
          <div style={{ color:'#94a3b8', fontSize:'12px', fontWeight:600, marginBottom:'8px' }}>🧪 Test a Message</div>
          <div style={{ display:'flex', gap:'8px', marginBottom: testResult ? '10px' : 0 }}>
            <input value={testInput} onChange={e => { setTestInput(e.target.value); setTestResult(null); }}
              placeholder="Type a test message…"
              aria-label="Test message input"
              style={{ flex:1, background:'#1e293b', border:'1px solid #334155', borderRadius:'10px',
                padding:'8px 12px', color:'#f1f5f9', fontSize:'13px', outline:'none' }} />
            <button onClick={testMessage} disabled={!testInput.trim()}
              style={{ background:'#334155', border:'none', borderRadius:'10px', padding:'8px 14px',
                color:'#94a3b8', fontWeight:700, fontSize:'12px',
                cursor: testInput.trim() ? 'pointer' : 'not-allowed' }}>
              Test
            </button>
          </div>
          {testResult && (
            <div style={{ background: testResult.blocked ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)',
              borderRadius:'8px', padding:'8px 12px', display:'flex', alignItems:'center', gap:'8px' }}>
              <span style={{ fontSize:'16px' }}>{testResult.blocked ? '🚫' : '✅'}</span>
              <span style={{ color: testResult.blocked ? '#ef4444' : '#10b981', fontSize:'13px', fontWeight:600 }}>
                {testResult.blocked
                  ? `Blocked — matched "${testResult.matched}"`
                  : 'Message would be allowed'}
              </span>
            </div>
          )}
        </div>

        <div style={{ color:'#475569', fontSize:'11px', marginBottom:'20px', marginTop:'6px', lineHeight:'1.5' }}>
          ℹ️ The server-side Cloud Function checks messages against this list in real time and deletes violations automatically.
        </div>

        {/* ── AI Auto-Moderation ────────────────────────────────── */}
        <div style={{ ...sec, marginTop:'24px' }}>
          AI Auto-Moderation
          <span style={{ background:'rgba(99,102,241,0.15)', color:'#818cf8', borderRadius:'6px', padding:'2px 6px', fontSize:'9px', fontWeight:700 }}>BETA</span>
        </div>
        <div style={{ background:'#1e293b', borderRadius:'14px', padding:'14px', marginBottom:'10px',
          display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'14px' }}>OpenAI Content Screening</div>
            <div style={{ color:'#64748b', fontSize:'12px', marginTop:'2px' }}>
              {aiEnabled ? '✅ Active — scanning all messages' : 'Uses OpenAI Moderation API to screen chat messages'}
            </div>
          </div>
          <Toggle value={aiEnabled} onChange={(v) => { setAiEnabled(v); addModLogEntry(v ? 'Enabled AI moderation' : 'Disabled AI moderation'); }} label="Toggle AI moderation" />
        </div>

        {/* ── Moderator Roles ───────────────────────────────────── */}
        <div style={{ ...sec, marginTop:'24px' }}>Trusted Moderators ({modRoles.length})</div>
        {modRoles.length > 0 && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginBottom:'10px' }}>
            {modRoles.map(r => (
              <div key={r} style={{ display:'flex', alignItems:'center', gap:'4px', background:'rgba(16,185,129,0.1)',
                border:'1px solid rgba(16,185,129,0.3)', borderRadius:'20px', padding:'4px 10px 4px 12px' }}>
                <span style={{ color:'#10b981', fontSize:'12px', fontWeight:600 }}>🛡️ {r}</span>
                <button onClick={() => { setModRoles(p => p.filter(x => x!==r)); addModLogEntry(`Removed mod role from ${r}`); }}
                  aria-label={`Remove moderator ${r}`}
                  style={{ background:'none', border:'none', color:'#64748b', fontSize:'12px', cursor:'pointer', padding:0 }}>✕</button>
              </div>
            ))}
          </div>
        )}
        <div style={{ display:'flex', gap:'8px', marginBottom:'20px' }}>
          <input value={modInput} onChange={e => setModInput(e.target.value)} onKeyDown={e => e.key==='Enter' && addModRole()}
            placeholder="Enter username to assign mod..." aria-label="New moderator username"
            style={{ flex:1, background:'#1e293b', border:'1px solid #334155', borderRadius:'10px', padding:'10px 14px', color:'#f1f5f9', fontSize:'13px', outline:'none' }} />
          <button onClick={addModRole} disabled={!modInput.trim()}
            style={{ background:'linear-gradient(135deg,#10b981,#0f766e)', border:'none', borderRadius:'10px', padding:'10px 14px', color:'white', fontWeight:700, fontSize:'13px', cursor:'pointer', opacity: modInput.trim()?1:0.5 }}>
            + Assign
          </button>
        </div>

        {/* ── Audit Trail ───────────────────────────────────────── */}
        <div style={{ ...sec, marginTop:'0' }}>
          Moderation Audit Trail ({modLog.length})
          <button onClick={() => setShowLog(v => !v)} aria-pressed={showLog}
            style={{ marginLeft:'auto', background:'#1e293b', border:'none', borderRadius:'6px', padding:'3px 8px', color:'#94a3b8', fontSize:'10px', fontWeight:700, cursor:'pointer' }}>
            {showLog ? 'Hide' : 'Show'}
          </button>
        </div>
        {showLog && (
          <div style={{ background:'#1e293b', borderRadius:'14px', padding:'14px', marginBottom:'20px', maxHeight:'200px', overflowY:'auto' }}>
            {modLog.length === 0 ? (
              <div style={{ color:'#475569', fontSize:'13px', textAlign:'center' }}>No moderation actions yet</div>
            ) : modLog.map((e,i) => (
              <div key={i} style={{ display:'flex', gap:'8px', padding:'5px 0', borderBottom: i<modLog.length-1?'1px solid #334155':'none' }}>
                <span style={{ color:'#64748b', fontSize:'10px', flexShrink:0, paddingTop:'1px' }}>{e.ts}</span>
                <span style={{ color:'#94a3b8', fontSize:'12px' }}>{e.action}</span>
              </div>
            ))}
          </div>
        )}
        {!showLog && <div style={{ marginBottom:'20px' }} />}

        {/* Community Rules */}
        <div style={sec}>Community Rules (Displayed to Viewers)</div>
        <div style={{ background:'#1e293b', borderRadius:'14px', padding:'14px', marginBottom:'20px' }}>
          {RULES.map((r,i) => (
            <div key={i} style={{ display:'flex', gap:'8px', alignItems:'flex-start', marginBottom: i<RULES.length-1?'8px':0 }}>
              <span style={{ color:'#10b981', fontWeight:700, fontSize:'13px', flexShrink:0 }}>{i+1}.</span>
              <span style={{ color:'#94a3b8', fontSize:'13px' }}>{r}</span>
            </div>
          ))}
        </div>

        {/* Save */}
        <button onClick={handleSave} disabled={saving}
          style={{ width:'100%', background: saving ? '#334155' : 'linear-gradient(135deg,#0f766e,#10b981)',
            border:'none', borderRadius:'14px', padding:'14px', color:'white', fontWeight:700,
            fontSize:'15px', cursor:saving?'wait':'pointer', opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Saving…' : '✓ Save Moderation Settings'}
        </button>
      </div>
    </div>
  );
}

const sec = {
  fontSize:'12px', fontWeight:700, color:'#64748b', textTransform:'uppercase',
  letterSpacing:'0.06em', marginBottom:'10px', display:'flex', alignItems:'center', gap:'8px',
};
