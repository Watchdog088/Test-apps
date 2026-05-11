// LiveModerationPage.jsx — /live/moderation
// FIXES: BUG-MOD01 (escalate to admin), BUG-MOD02 NOTE (see LiveWatchPage),
//        BUG-MOD03 (per-account word list), BUG-MOD04 (audit log),
//        BUG-MOD05 (report context), MISS-MOD01 (AI moderation toggle),
//        MISS-MOD02 (timeout ban), MISS-MOD03 (viewer report history),
//        MISS-MOD04 (keyword alerts)

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection, doc, getDoc, setDoc, getDocs, addDoc, deleteDoc,
  query, where, orderBy, limit, serverTimestamp, updateDoc,
} from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import useAppStore from '@store/useAppStore';

const TIMEOUT_OPTIONS = [
  { label: '5 min',  ms: 5  * 60 * 1000 },
  { label: '10 min', ms: 10 * 60 * 1000 },
  { label: '30 min', ms: 30 * 60 * 1000 },
  { label: '1 hour', ms: 60 * 60 * 1000 },
];

export default function LiveModerationPage() {
  const navigate  = useNavigate();
  const showToast = useAppStore(s => s.showToast);
  const uid       = auth.currentUser?.uid;

  const [tab,           setTab]           = useState('banned'); // 'banned' | 'reports' | 'words' | 'log'
  const [bannedUsers,   setBannedUsers]   = useState([]);
  const [reports,       setReports]       = useState([]);
  const [auditLog,      setAuditLog]      = useState([]);
  const [bannedWords,   setBannedWords]   = useState([]);
  const [watchWords,    setWatchWords]    = useState([]);
  const [newWord,       setNewWord]       = useState('');
  const [newWatch,      setNewWatch]      = useState('');
  const [slowMode,      setSlowMode]      = useState(0);
  const [aiModEnabled,  setAiModEnabled]  = useState(false);
  const [loading,       setLoading]       = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [timeoutDlg,    setTimeoutDlg]    = useState(null); // { uid, name }
  const [selectedTimeout, setSelectedTimeout] = useState(0);

  // BUG-MOD03: Load from per-account moderationSettings (not per-stream)
  useEffect(() => {
    if (!uid) return;
    (async () => {
      try {
        // Per-account moderation settings
        const settSnap = await getDoc(doc(db, 'users', uid, 'moderationSettings', 'config')).catch(() => null);
        if (settSnap?.exists()) {
          const d = settSnap.data();
          setBannedWords(d.bannedWords || []);
          setWatchWords(d.watchWords || []);
          setSlowMode(d.slowModeSeconds || 0);
          setAiModEnabled(d.aiModerationEnabled || false);
        }

        // Banned users
        const bSnap = await getDocs(collection(db, 'users', uid, 'bannedUsers')).catch(() => ({ docs:[] }));
        setBannedUsers(bSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        // Pending reports
        const rQ = query(collection(db, 'reports'), where('streamerId', '==', uid), where('status', '==', 'pending'), orderBy('createdAt', 'desc'), limit(50));
        const rSnap = await getDocs(rQ).catch(() => ({ docs:[] }));
        setReports(rSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        // BUG-MOD04: Audit log
        const aQ = query(collection(db, 'users', uid, 'moderationAuditLog'), orderBy('at', 'desc'), limit(50));
        const aSnap = await getDocs(aQ).catch(() => ({ docs:[] }));
        setAuditLog(aSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [uid]);

  // BUG-MOD03: Save per-account settings
  const saveSettings = useCallback(async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'users', uid, 'moderationSettings', 'config'), {
        bannedWords, watchWords, slowModeSeconds: slowMode,
        aiModerationEnabled: aiModEnabled, updatedAt: serverTimestamp(),
      }, { merge: true });
      showToast('✓ Moderation settings saved');
    } catch { showToast('Failed to save'); }
    finally { setSaving(false); }
  }, [uid, bannedWords, watchWords, slowMode, aiModEnabled, showToast]);

  const addBannedWord = useCallback(() => {
    const w = newWord.trim().toLowerCase();
    if (!w || bannedWords.includes(w)) { setNewWord(''); return; }
    setBannedWords(p => [...p, w]);
    setNewWord('');
  }, [newWord, bannedWords]);

  const addWatchWord = useCallback(() => {
    const w = newWatch.trim().toLowerCase();
    if (!w || watchWords.includes(w)) { setNewWatch(''); return; }
    setWatchWords(p => [...p, w]);
    setNewWatch('');
  }, [newWatch, watchWords]);

  // Unban user
  const unbanUser = useCallback(async (bannedUid) => {
    try {
      await deleteDoc(doc(db, 'users', uid, 'bannedUsers', bannedUid));
      setBannedUsers(p => p.filter(u => u.id !== bannedUid));
      // BUG-MOD04: Audit log
      await addDoc(collection(db, 'users', uid, 'moderationAuditLog'), {
        action: 'unban', targetUid: bannedUid, at: serverTimestamp(), by: uid,
      });
      setAuditLog(p => [{ id: Date.now(), action:'unban', targetUid: bannedUid, at:{ toDate:()=>new Date() } }, ...p]);
      showToast('✓ User unbanned');
    } catch { showToast('Failed to unban'); }
  }, [uid, showToast]);

  // MISS-MOD02: Timeout ban
  const applyTimeout = useCallback(async () => {
    if (!timeoutDlg) return;
    const ms = TIMEOUT_OPTIONS[selectedTimeout].ms;
    const timeoutUntil = new Date(Date.now() + ms);
    try {
      await setDoc(doc(db, 'users', uid, 'bannedUsers', timeoutDlg.uid), {
        displayName: timeoutDlg.name,
        timeoutUntil: serverTimestamp(),
        timeoutMs: ms,
        bannedAt: serverTimestamp(),
        type: 'timeout',
      });
      // BUG-MOD04: Audit log
      await addDoc(collection(db, 'users', uid, 'moderationAuditLog'), {
        action: 'timeout', targetUid: timeoutDlg.uid, targetName: timeoutDlg.name,
        durationMs: ms, at: serverTimestamp(), by: uid,
      });
      setBannedUsers(p => [...p, { id: timeoutDlg.uid, displayName: timeoutDlg.name, type:'timeout', timeoutUntil }]);
      setAuditLog(p => [{ id: Date.now(), action:'timeout', targetName: timeoutDlg.name, at:{ toDate:()=>new Date() } }, ...p]);
      setTimeoutDlg(null);
      showToast(`⏱ ${timeoutDlg.name} timed out for ${TIMEOUT_OPTIONS[selectedTimeout].label}`);
    } catch { showToast('Failed to apply timeout'); }
  }, [timeoutDlg, selectedTimeout, uid, showToast]);

  // Dismiss report
  const dismissReport = useCallback(async (reportId) => {
    try {
      await updateDoc(doc(db, 'reports', reportId), { status: 'dismissed' });
      setReports(p => p.filter(r => r.id !== reportId));
      showToast('Report dismissed');
    } catch { showToast('Failed'); }
  }, [showToast]);

  // BUG-MOD01: Escalate to platform admin
  const escalateReport = useCallback(async (report) => {
    try {
      await addDoc(collection(db, 'adminReports'), {
        ...report, escalatedAt: serverTimestamp(), escalatedBy: uid, status: 'escalated',
      });
      await updateDoc(doc(db, 'reports', report.id), { status: 'escalated' });
      setReports(p => p.filter(r => r.id !== report.id));
      // BUG-MOD04: Audit log
      await addDoc(collection(db, 'users', uid, 'moderationAuditLog'), {
        action: 'escalate', reportId: report.id, at: serverTimestamp(), by: uid,
      });
      showToast('🚨 Report escalated to platform admin');
    } catch { showToast('Failed to escalate'); }
  }, [uid, showToast]);

  const tabs = [
    { id:'banned', label:'🚫 Banned' },
    { id:'reports', label:`📋 Reports${reports.length > 0 ? ` (${reports.length})` : ''}` },
    { id:'words', label:'🔤 Words' },
    { id:'log', label:'📜 Log' },
  ];

  return (
    <div style={{ background:'#0a0a18', minHeight:'100vh', paddingBottom:'80px' }}>
      {/* Header */}
      <div style={{ padding:'12px 16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', gap:'10px' }}>
        <button onClick={() => navigate(-1)} style={{ background:'none', border:'none', color:'#94a3b8', fontSize:'20px', cursor:'pointer' }}>←</button>
        <span style={{ fontSize:'16px', fontWeight:800, color:'#f1f5f9', flex:1 }}>🛡️ Moderation</span>
      </div>

      {/* Quick controls */}
      <div style={{ padding:'10px 16px', background:'#0f172a', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px', flex:1 }}>
          <span style={{ color:'#94a3b8', fontSize:'12px' }}>Slow Mode:</span>
          <select value={slowMode} onChange={e => setSlowMode(+e.target.value)}
            style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:'6px', color:'#f1f5f9', padding:'4px 8px', fontSize:'12px' }}>
            {[0,3,5,10,30,60].map(s => <option key={s} value={s}>{s === 0 ? 'Off' : `${s}s`}</option>)}
          </select>
        </div>
        {/* MISS-MOD01: AI Moderation toggle */}
        <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
          <span style={{ color:'#94a3b8', fontSize:'12px' }}>AI Mod:</span>
          <button onClick={() => setAiModEnabled(v => !v)} role="switch" aria-checked={aiModEnabled}
            style={{ width:'40px', height:'22px', borderRadius:'11px', border:'none', cursor:'pointer',
              background: aiModEnabled ? '#ef4444' : '#334155', position:'relative' }}>
            <div style={{ position:'absolute', top:'2px', left: aiModEnabled ? '20px' : '2px',
              width:'18px', height:'18px', borderRadius:'50%', background:'white', transition:'left 0.15s' }} />
          </button>
        </div>
        <button onClick={saveSettings} disabled={saving}
          style={{ background:'linear-gradient(135deg,#ef4444,#f59e0b)', border:'none', borderRadius:'8px',
            padding:'6px 14px', color:'white', fontWeight:700, fontSize:'12px', cursor:'pointer' }}>
          {saving ? '…' : '✓ Save'}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', borderBottom:'1px solid #1e293b' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ flex:1, padding:'10px 4px', background:'none', border:'none', borderBottom: tab===t.id ? '2px solid #ef4444' : '2px solid transparent',
              color: tab===t.id ? '#ef4444' : '#94a3b8', fontSize:'11px', fontWeight:700, cursor:'pointer' }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding:'32px', textAlign:'center', color:'#64748b' }}>Loading…</div>
      ) : (
        <div style={{ padding:'12px 16px' }}>

          {/* Banned Users */}
          {tab === 'banned' && (
            <div>
              {bannedUsers.length === 0 && <div style={{ textAlign:'center', color:'#64748b', padding:'32px', fontSize:'13px' }}>No banned users.</div>}
              {bannedUsers.map(u => (
                <div key={u.id} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 0', borderBottom:'1px solid #1e293b' }}>
                  <div style={{ flex:1 }}>
                    <div style={{ color:'#f1f5f9', fontWeight:600, fontSize:'13px' }}>{u.displayName || u.id}</div>
                    <div style={{ color:'#64748b', fontSize:'11px' }}>
                      {u.type === 'timeout' ? `⏱ Timeout${u.timeoutUntil ? ` until ${new Date(u.timeoutUntil.toDate?.() || u.timeoutUntil).toLocaleTimeString()}` : ''}` : '🚫 Permanent ban'}
                    </div>
                  </div>
                  <button onClick={() => setTimeoutDlg({ uid: u.id, name: u.displayName || u.id })}
                    style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:'6px', padding:'4px 10px', color:'#f59e0b', fontSize:'11px', fontWeight:600, cursor:'pointer', marginRight:'4px' }}>
                    ⏱
                  </button>
                  <button onClick={() => unbanUser(u.id)}
                    style={{ background:'rgba(74,222,128,0.1)', border:'1px solid #4ade80', borderRadius:'6px', padding:'4px 10px', color:'#4ade80', fontSize:'11px', fontWeight:600, cursor:'pointer' }}>
                    Unban
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Reports — BUG-MOD01 escalate + BUG-MOD05 context */}
          {tab === 'reports' && (
            <div>
              {reports.length === 0 && <div style={{ textAlign:'center', color:'#64748b', padding:'32px', fontSize:'13px' }}>No pending reports. ✅</div>}
              {reports.map(r => (
                <div key={r.id} style={{ background:'#1e293b', borderRadius:'12px', padding:'12px', marginBottom:'10px', border:'1px solid #334155' }}>
                  <div style={{ display:'flex', gap:'6px', marginBottom:'8px' }}>
                    <span style={{ background:'rgba(239,68,68,0.2)', color:'#f87171', borderRadius:'6px', padding:'2px 8px', fontSize:'11px', fontWeight:600 }}>
                      {r.reason || 'Reported'}
                    </span>
                    <span style={{ color:'#64748b', fontSize:'11px', alignSelf:'center' }}>
                      {r.reportedUserName || r.reportedUserId}
                    </span>
                  </div>
                  {/* BUG-MOD05: Show message + context */}
                  {r.messageText && (
                    <div style={{ background:'#0f172a', borderRadius:'8px', padding:'8px', marginBottom:'8px' }}>
                      <div style={{ color:'#94a3b8', fontSize:'10px', marginBottom:'2px' }}>Reported message:</div>
                      <div style={{ color:'#f1f5f9', fontSize:'12px' }}>"{r.messageText}"</div>
                    </div>
                  )}
                  {r.context && (
                    <div style={{ background:'#0f172a', borderRadius:'8px', padding:'8px', marginBottom:'8px' }}>
                      <div style={{ color:'#94a3b8', fontSize:'10px', marginBottom:'2px' }}>Context (prior messages):</div>
                      {r.context.map((msg, i) => <div key={i} style={{ color:'#64748b', fontSize:'11px' }}>{msg}</div>)}
                    </div>
                  )}
                  {/* MISS-MOD03: Link to user's report history */}
                  <div style={{ display:'flex', gap:'6px' }}>
                    <button onClick={() => dismissReport(r.id)}
                      style={{ flex:1, background:'#334155', border:'none', borderRadius:'8px', padding:'6px', color:'#94a3b8', fontSize:'12px', fontWeight:600, cursor:'pointer' }}>
                      Dismiss
                    </button>
                    <button onClick={() => navigate(`/admin/reports?userId=${r.reportedUserId}`)}
                      style={{ flex:1, background:'#334155', border:'none', borderRadius:'8px', padding:'6px', color:'#f59e0b', fontSize:'12px', fontWeight:600, cursor:'pointer' }}>
                      History
                    </button>
                    {/* BUG-MOD01: Escalate */}
                    <button onClick={() => escalateReport(r)}
                      style={{ flex:1, background:'rgba(239,68,68,0.15)', border:'1px solid #ef4444', borderRadius:'8px', padding:'6px', color:'#f87171', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>
                      🚨 Escalate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Word filters — BUG-MOD03 per-account + MISS-MOD04 keyword alerts */}
          {tab === 'words' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              {/* Banned words */}
              <div style={{ background:'#1e293b', borderRadius:'14px', padding:'14px', border:'1px solid #334155' }}>
                <div style={{ fontSize:'12px', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'10px' }}>
                  🚫 Blocked Words (auto-filtered from chat)
                </div>
                <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'10px' }}>
                  {bannedWords.map(w => (
                    <span key={w} style={{ background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'20px', padding:'3px 10px', color:'#f87171', fontSize:'12px', display:'flex', alignItems:'center', gap:'4px' }}>
                      {w}
                      <button onClick={() => setBannedWords(p => p.filter(x => x !== w))} style={{ background:'none', border:'none', color:'#f87171', cursor:'pointer', fontSize:'14px', lineHeight:1 }}>×</button>
                    </span>
                  ))}
                </div>
                <div style={{ display:'flex', gap:'6px' }}>
                  <input value={newWord} onChange={e => setNewWord(e.target.value)} onKeyDown={e => e.key==='Enter' && addBannedWord()}
                    placeholder="Add blocked word…"
                    style={{ flex:1, background:'#0f172a', border:'1px solid #334155', borderRadius:'8px', padding:'8px 10px', color:'#f1f5f9', fontSize:'12px', outline:'none' }} />
                  <button onClick={addBannedWord} style={{ background:'#ef4444', border:'none', borderRadius:'8px', padding:'8px 14px', color:'white', fontWeight:700, fontSize:'12px', cursor:'pointer' }}>+</button>
                </div>
              </div>

              {/* MISS-MOD04: Watch words / keyword alerts */}
              <div style={{ background:'#1e293b', borderRadius:'14px', padding:'14px', border:'1px solid #334155' }}>
                <div style={{ fontSize:'12px', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'6px' }}>
                  🔔 Keyword Alerts (highlight in chat, no block)
                </div>
                <div style={{ color:'#64748b', fontSize:'11px', marginBottom:'10px' }}>Messages containing these words will be highlighted in yellow in the chat.</div>
                <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'10px' }}>
                  {watchWords.map(w => (
                    <span key={w} style={{ background:'rgba(245,158,11,0.15)', border:'1px solid rgba(245,158,11,0.3)', borderRadius:'20px', padding:'3px 10px', color:'#f59e0b', fontSize:'12px', display:'flex', alignItems:'center', gap:'4px' }}>
                      {w}
                      <button onClick={() => setWatchWords(p => p.filter(x => x !== w))} style={{ background:'none', border:'none', color:'#f59e0b', cursor:'pointer', fontSize:'14px', lineHeight:1 }}>×</button>
                    </span>
                  ))}
                </div>
                <div style={{ display:'flex', gap:'6px' }}>
                  <input value={newWatch} onChange={e => setNewWatch(e.target.value)} onKeyDown={e => e.key==='Enter' && addWatchWord()}
                    placeholder="Add watch word…"
                    style={{ flex:1, background:'#0f172a', border:'1px solid #334155', borderRadius:'8px', padding:'8px 10px', color:'#f1f5f9', fontSize:'12px', outline:'none' }} />
                  <button onClick={addWatchWord} style={{ background:'#f59e0b', border:'none', borderRadius:'8px', padding:'8px 14px', color:'#0f172a', fontWeight:700, fontSize:'12px', cursor:'pointer' }}>+</button>
                </div>
              </div>

              <button onClick={saveSettings} disabled={saving}
                style={{ background:'linear-gradient(135deg,#ef4444,#f59e0b)', border:'none', borderRadius:'12px', padding:'12px', color:'white', fontWeight:700, fontSize:'14px', cursor:'pointer' }}>
                {saving ? 'Saving…' : '✓ Save Word Lists'}
              </button>
            </div>
          )}

          {/* BUG-MOD04: Audit log */}
          {tab === 'log' && (
            <div>
              {auditLog.length === 0 && <div style={{ textAlign:'center', color:'#64748b', padding:'32px', fontSize:'13px' }}>No moderation actions recorded yet.</div>}
              {auditLog.map(e => (
                <div key={e.id} style={{ display:'flex', gap:'10px', padding:'8px 0', borderBottom:'1px solid #1e293b', alignItems:'center' }}>
                  <div style={{ fontSize:'16px' }}>
                    {e.action === 'ban' ? '🚫' : e.action === 'unban' ? '✅' : e.action === 'timeout' ? '⏱' : e.action === 'escalate' ? '🚨' : '📋'}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ color:'#f1f5f9', fontSize:'13px', fontWeight:600, textTransform:'capitalize' }}>
                      {e.action} {e.targetName || e.targetUid || e.reportId || ''}
                      {e.durationMs && ` (${TIMEOUT_OPTIONS.find(o => o.ms === e.durationMs)?.label || 'custom'})`}
                    </div>
                    <div style={{ color:'#64748b', fontSize:'11px' }}>
                      {e.at?.toDate ? e.at.toDate().toLocaleString() : 'Just now'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MISS-MOD02: Timeout dialog */}
      {timeoutDlg && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999, padding:'20px' }}>
          <div style={{ background:'#1e293b', borderRadius:'16px', padding:'20px', width:'100%', maxWidth:'320px' }}>
            <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'15px', marginBottom:'4px' }}>⏱ Timeout User</div>
            <div style={{ color:'#94a3b8', fontSize:'12px', marginBottom:'16px' }}>How long to timeout {timeoutDlg.name}?</div>
            <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'16px' }}>
              {TIMEOUT_OPTIONS.map((o, i) => (
                <button key={i} onClick={() => setSelectedTimeout(i)}
                  style={{ background: selectedTimeout===i ? 'rgba(239,68,68,0.15)' : '#334155',
                    border: selectedTimeout===i ? '1px solid #ef4444' : '1px solid #475569',
                    borderRadius:'8px', padding:'10px', color: selectedTimeout===i ? '#f87171' : '#94a3b8',
                    fontWeight: selectedTimeout===i ? 700 : 400, fontSize:'13px', cursor:'pointer' }}>
                  {o.label}
                </button>
              ))}
            </div>
            <div style={{ display:'flex', gap:'8px' }}>
              <button onClick={() => setTimeoutDlg(null)}
                style={{ flex:1, background:'#334155', border:'none', borderRadius:'10px', padding:'10px', color:'#94a3b8', fontWeight:700, cursor:'pointer' }}>
                Cancel
              </button>
              <button onClick={applyTimeout}
                style={{ flex:1, background:'#ef4444', border:'none', borderRadius:'10px', padding:'10px', color:'white', fontWeight:700, cursor:'pointer' }}>
                Timeout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
