// LiveSchedulePage.jsx — /live/schedule
// Session 5 — REC-5.12: Recurring stream option (daily/weekly cadence, saves to Firestore)
// Previously implemented: date/time picker, notification, reminder

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection, addDoc, onSnapshot, query, orderBy,
  serverTimestamp, deleteDoc, doc, updateDoc,
} from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import useAppStore from '@store/useAppStore';

const CATEGORIES = ['Gaming','Music','Just Chatting','Sports','Education','Art','Cooking','Tech','Fitness','Other'];
const RECURRENCE_OPTIONS = [
  { value: 'none',    label: 'One-time' },
  { value: 'daily',   label: '📅 Daily' },
  { value: 'weekly',  label: '📆 Weekly' },
  { value: 'biweekly',label: '🗓 Every 2 weeks' },
];

export default function LiveSchedulePage() {
  const navigate = useNavigate();
  const showToast = useAppStore(s => s.showToast);
  const uid = auth.currentUser?.uid;

  const [title, setTitle]           = useState('');
  const [description, setDesc]      = useState('');
  const [category, setCategory]     = useState('Gaming');
  const [scheduledAt, setScheduled] = useState('');
  const [sendNotif, setSendNotif]   = useState(true);
  const [saving, setSaving]         = useState(false);
  const [scheduled, setScheduled2]  = useState([]);
  const [loading, setLoading]       = useState(true);

  // REC-5.12: Recurring stream state
  const [recurrence, setRecurrence]     = useState('none');
  const [recurrenceEnd, setRecurrenceEnd] = useState('');

  // Load user's scheduled streams
  useEffect(() => {
    if (!uid) return;
    const q = query(
      collection(db, 'users', uid, 'scheduledStreams'),
      orderBy('scheduledAt', 'asc')
    );
    const unsub = onSnapshot(q, snap => {
      setScheduled2(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, [uid]);

  const scheduleStream = async () => {
    if (!title.trim() || !scheduledAt) {
      showToast('Add a title and date/time'); return;
    }
    const scheduled = new Date(scheduledAt);
    if (scheduled < new Date()) {
      showToast('Please pick a future date'); return;
    }
    setSaving(true);
    try {
      const data = {
        title: title.trim(),
        description: description.trim(),
        category,
        scheduledAt: scheduled,
        sendNotification: sendNotif,
        // REC-5.12: Recurring fields
        recurrence,
        recurrenceEnd: recurrenceEnd ? new Date(recurrenceEnd) : null,
        uid,
        status: 'scheduled',
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, 'users', uid, 'scheduledStreams'), data);
      // Also add to global scheduled collection for push notifications
      if (sendNotif) {
        await addDoc(collection(db, 'scheduledStreams'), { ...data, streamerUid: uid });
      }
      showToast(recurrence !== 'none' ? `📅 Recurring stream scheduled (${recurrence})!` : '✅ Stream scheduled!');
      setTitle(''); setDesc(''); setScheduled(''); setRecurrence('none'); setRecurrenceEnd('');
    } catch (e) {
      console.error(e);
      showToast('Scheduling failed');
    } finally {
      setSaving(false);
    }
  };

  const cancelScheduled = async (id) => {
    try {
      await deleteDoc(doc(db, 'users', uid, 'scheduledStreams', id));
      showToast('Scheduled stream cancelled');
    } catch { showToast('Failed to cancel'); }
  };

  const fmtDate = (d) => {
    try {
      const date = d?.toDate ? d.toDate() : new Date(d);
      return date.toLocaleDateString(undefined, { weekday:'short', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });
    } catch { return 'Unknown date'; }
  };

  const minDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    return now.toISOString().slice(0, 16);
  };

  return (
    <div style={{ background:'#0a0a18', minHeight:'100vh', paddingBottom:'80px' }}>
      {/* Header */}
      <div style={{ padding:'12px 16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', gap:'10px' }}>
        <button onClick={() => navigate(-1)} style={{ background:'none', border:'none', color:'#94a3b8', fontSize:'20px', cursor:'pointer' }}>←</button>
        <span style={{ fontSize:'16px', fontWeight:800, color:'#f1f5f9', flex:1 }}>📅 Schedule a Stream</span>
      </div>

      <div style={{ padding:'14px 16px', display:'flex', flexDirection:'column', gap:'12px' }}>

        {/* Form */}
        <div style={{ background:'#1e293b', borderRadius:'14px', padding:'14px', border:'1px solid #334155' }}>
          <div style={{ color:'#f59e0b', fontSize:'13px', fontWeight:700, marginBottom:'12px' }}>🗓 New Scheduled Stream</div>

          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            <div>
              <label style={{ color:'#94a3b8', fontSize:'11px', display:'block', marginBottom:'4px' }}>Stream Title *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Friday Night Gaming"
                style={{ width:'100%', background:'#0f172a', border:'1px solid #334155', borderRadius:'8px',
                  padding:'9px 12px', color:'#f1f5f9', fontSize:'13px', outline:'none', boxSizing:'border-box' }} />
            </div>

            <div>
              <label style={{ color:'#94a3b8', fontSize:'11px', display:'block', marginBottom:'4px' }}>Description</label>
              <textarea value={description} onChange={e => setDesc(e.target.value)}
                placeholder="Tell viewers what to expect…" rows={2}
                style={{ width:'100%', background:'#0f172a', border:'1px solid #334155', borderRadius:'8px',
                  padding:'9px 12px', color:'#f1f5f9', fontSize:'13px', outline:'none', resize:'vertical', boxSizing:'border-box' }} />
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
              <div>
                <label style={{ color:'#94a3b8', fontSize:'11px', display:'block', marginBottom:'4px' }}>Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)}
                  style={{ width:'100%', background:'#0f172a', border:'1px solid #334155', borderRadius:'8px',
                    padding:'9px 12px', color:'#f1f5f9', fontSize:'13px', outline:'none' }}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ color:'#94a3b8', fontSize:'11px', display:'block', marginBottom:'4px' }}>Date & Time *</label>
                <input type="datetime-local" value={scheduledAt} onChange={e => setScheduled(e.target.value)}
                  min={minDateTime()}
                  style={{ width:'100%', background:'#0f172a', border:'1px solid #334155', borderRadius:'8px',
                    padding:'9px 12px', color:'#f1f5f9', fontSize:'13px', outline:'none', boxSizing:'border-box' }} />
              </div>
            </div>

            {/* REC-5.12: Recurring stream option */}
            <div>
              <label style={{ color:'#94a3b8', fontSize:'11px', display:'block', marginBottom:'4px' }}>🔁 Recurrence</label>
              <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
                {RECURRENCE_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => setRecurrence(opt.value)}
                    style={{ background: recurrence === opt.value ? 'rgba(245,158,11,0.2)' : '#0f172a',
                      border: `1px solid ${recurrence === opt.value ? '#f59e0b' : '#334155'}`,
                      borderRadius:'8px', padding:'6px 12px', color: recurrence === opt.value ? '#f59e0b' : '#94a3b8',
                      fontSize:'12px', fontWeight: recurrence === opt.value ? 700 : 400, cursor:'pointer' }}>
                    {opt.label}
                  </button>
                ))}
              </div>
              {recurrence !== 'none' && (
                <div style={{ marginTop:'8px' }}>
                  <label style={{ color:'#94a3b8', fontSize:'11px', display:'block', marginBottom:'4px' }}>Recurrence ends on (optional)</label>
                  <input type="date" value={recurrenceEnd} onChange={e => setRecurrenceEnd(e.target.value)}
                    min={new Date().toISOString().slice(0, 10)}
                    style={{ width:'100%', background:'#0f172a', border:'1px solid #334155', borderRadius:'8px',
                      padding:'9px 12px', color:'#f1f5f9', fontSize:'13px', outline:'none', boxSizing:'border-box' }} />
                  <div style={{ color:'#64748b', fontSize:'11px', marginTop:'4px' }}>
                    {recurrence === 'daily' && '⚡ A stream will be scheduled every day at the same time'}
                    {recurrence === 'weekly' && '⚡ A stream will be scheduled every week on the same day'}
                    {recurrence === 'biweekly' && '⚡ A stream will be scheduled every 2 weeks on the same day'}
                  </div>
                </div>
              )}
            </div>

            {/* Notification toggle */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0', borderTop:'1px solid #334155' }}>
              <div>
                <div style={{ color:'#f1f5f9', fontSize:'13px', fontWeight:600 }}>🔔 Notify my followers</div>
                <div style={{ color:'#64748b', fontSize:'11px' }}>Send a push notification when you go live</div>
              </div>
              <button onClick={() => setSendNotif(v => !v)}
                style={{ width:'44px', height:'24px', borderRadius:'12px', border:'none', cursor:'pointer',
                  background: sendNotif ? '#ef4444' : '#334155', position:'relative' }}>
                <div style={{ position:'absolute', top:'2px', left: sendNotif ? '22px' : '2px',
                  width:'20px', height:'20px', borderRadius:'50%', background:'white', transition:'left 0.2s' }} />
              </button>
            </div>

            <button onClick={scheduleStream} disabled={saving}
              style={{ background: title.trim() && scheduledAt ? 'linear-gradient(135deg,#f59e0b,#ef4444)' : '#334155',
                border:'none', borderRadius:'12px', padding:'13px', color:'white', fontWeight:800,
                fontSize:'14px', cursor: title.trim() && scheduledAt ? 'pointer' : 'not-allowed' }}>
              {saving ? '⏳ Scheduling…' : '📅 Schedule Stream'}
            </button>
          </div>
        </div>

        {/* Upcoming scheduled streams */}
        <div>
          <div style={{ color:'#94a3b8', fontSize:'12px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'10px' }}>
            Upcoming Streams ({scheduled.length})
          </div>
          {loading && <div style={{ color:'#334155', fontSize:'13px' }}>Loading…</div>}
          {!loading && scheduled.length === 0 && (
            <div style={{ background:'#1e293b', borderRadius:'12px', padding:'20px', textAlign:'center', border:'1px solid #334155' }}>
              <div style={{ fontSize:'32px', marginBottom:'8px' }}>📅</div>
              <div style={{ color:'#64748b', fontSize:'13px' }}>No upcoming streams scheduled</div>
            </div>
          )}
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {scheduled.map(s => (
              <div key={s.id} style={{ background:'#1e293b', borderRadius:'14px', padding:'14px', border:'1px solid #334155' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'8px' }}>
                  <div style={{ flex:1 }}>
                    <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'14px', marginBottom:'2px' }}>{s.title}</div>
                    <div style={{ color:'#f59e0b', fontSize:'12px', fontWeight:600 }}>{fmtDate(s.scheduledAt)}</div>
                    <div style={{ display:'flex', gap:'6px', marginTop:'4px', flexWrap:'wrap' }}>
                      <span style={{ background:'#0f172a', borderRadius:'6px', padding:'2px 8px', color:'#64748b', fontSize:'11px' }}>
                        {s.category}
                      </span>
                      {s.recurrence && s.recurrence !== 'none' && (
                        <span style={{ background:'rgba(245,158,11,0.1)', borderRadius:'6px', padding:'2px 8px', color:'#f59e0b', fontSize:'11px' }}>
                          🔁 {s.recurrence}
                        </span>
                      )}
                      {s.sendNotification && (
                        <span style={{ background:'rgba(99,102,241,0.1)', borderRadius:'6px', padding:'2px 8px', color:'#818cf8', fontSize:'11px' }}>
                          🔔 notifying
                        </span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => cancelScheduled(s.id)}
                    style={{ background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'8px',
                      padding:'6px 12px', color:'#f87171', fontSize:'12px', cursor:'pointer', flexShrink:0 }}>
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
