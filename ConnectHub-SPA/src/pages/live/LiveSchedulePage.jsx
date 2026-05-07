// LIVE SCHEDULE PAGE — /live/schedule
// FIXES APPLIED:
//   BUG-25: recurring and reminderMinutes now saved to Firestore
//   BUG-26: date input has min= today (prevents scheduling in the past)
//   BUG-27: recurring ≠ one-time shows ⚠️ beta notice about Cloud Function requirement
//   UX-17:  "Upcoming Streams" section shows user's scheduled streams with Edit/Cancel

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  addDoc, collection, serverTimestamp, Timestamp, query,
  where, orderBy, onSnapshot, doc, updateDoc, deleteDoc,
} from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import useAppStore from '@store/useAppStore';

const CATEGORIES = [
  { id:'gaming',    label:'Gaming',    emoji:'🎮' },
  { id:'music',     label:'Music',     emoji:'🎵' },
  { id:'fitness',   label:'Fitness',   emoji:'💪' },
  { id:'art',       label:'Art',       emoji:'🎨' },
  { id:'irl',       label:'IRL',       emoji:'📍' },
  { id:'cooking',   label:'Cooking',   emoji:'🍳' },
  { id:'education', label:'Education', emoji:'📚' },
  { id:'talkshow',  label:'Talk Show', emoji:'💬' },
];

function LiveSubNav({ navigate }) {
  return (
    <div style={{ display:'flex', gap:'6px', padding:'8px 16px', overflowX:'auto', scrollbarWidth:'none', borderBottom:'1px solid #1e293b' }}>
      {[
        { label:'🎥 Setup',     path:'/live/setup' },
        { label:'📊 Analytics', path:'/live/analytics' },
        { label:'🛡️ Moderation',path:'/live/moderation' },
        { label:'💰 Monetize',  path:'/live/monetization' },
      ].map(l => (
        <button key={l.path} onClick={() => navigate(l.path)}
          style={{ background:'#1e293b', border:'none', borderRadius:'20px', padding:'5px 12px', color:'#94a3b8', fontSize:'11px', fontWeight:600, cursor:'pointer', flexShrink:0 }}>
          {l.label}
        </button>
      ))}
    </div>
  );
}

export default function LiveSchedulePage() {
  const navigate  = useNavigate();
  const showToast = useAppStore(s => s.showToast);

  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [date,        setDate]        = useState('');
  const [time,        setTime]        = useState('');
  const [category,    setCategory]    = useState('gaming');
  // BUG-25 FIX: recurring + reminder now in controlled state → saved to Firestore
  const [recurring,   setRecurring]   = useState('once');
  const [reminder,    setReminder]    = useState('30');
  const [saving,      setSaving]      = useState(false);
  const [savedDoc,    setSavedDoc]    = useState(null);
  // UX-17 FIX: upcoming scheduled streams
  const [upcoming,    setUpcoming]    = useState([]);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);
  const [editingId,   setEditingId]   = useState(null);

  // BUG-26 FIX: minimum date = today
  const todayStr = new Date().toISOString().split('T')[0];
  // Detect timezone
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // UX-17 FIX: Load user's scheduled streams
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) { setLoadingUpcoming(false); return; }
    const now = Timestamp.fromMillis(Date.now());
    const q   = query(
      collection(db, 'streams'),
      where('userId', '==', uid),
      where('status', '==', 'scheduled'),
      where('scheduledAt', '>=', now),
      orderBy('scheduledAt', 'asc')
    );
    const unsub = onSnapshot(q, snap => {
      setUpcoming(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoadingUpcoming(false);
    }, () => setLoadingUpcoming(false));
    return () => unsub();
  }, []);

  const handleSave = async () => {
    if (!title.trim() || !date || !time) { showToast('Please fill in title, date, and time'); return; }
    if (!auth.currentUser) { showToast('Sign in to schedule a stream'); return; }
    setSaving(true);
    try {
      const scheduledAt = Timestamp.fromDate(new Date(`${date}T${time}`));
      // BUG-25 FIX: include recurring and reminderMinutes in Firestore doc
      const docRef = await addDoc(collection(db, 'streams'), {
        title:           title.trim(),
        description:     description.trim(),
        category,
        status:          'scheduled',
        recurring,                        // BUG-25 FIX ✓
        reminderMinutes: parseInt(reminder, 10) || 30, // BUG-25 FIX ✓
        userId:          auth.currentUser.uid,
        userName:        auth.currentUser.displayName || 'Streamer',
        userAvatar:      auth.currentUser.photoURL    || null,
        viewerCount:     0,
        scheduledAt,
        createdAt:       serverTimestamp(),
      });

      // BUG-27 FIX: If recurring is not 'once', trigger Cloud Function (if available)
      if (recurring !== 'once') {
        try {
          await fetch(`${import.meta.env.VITE_API_BASE_URL}/streams/schedule-recurring`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ streamId: docRef.id, recurring, scheduledAt: scheduledAt.toMillis() }),
          });
        } catch {
          // Cloud Function not available — user is warned in UI
        }
      }

      setSavedDoc({ id: docRef.id, scheduledAt });
      showToast('📅 Stream scheduled!');
    } catch (err) {
      console.error('[Schedule]', err);
      showToast('Failed to schedule stream');
    } finally {
      setSaving(false);
    }
  };

  // UX-17: Cancel a scheduled stream
  const cancelStream = async (streamId) => {
    try {
      await updateDoc(doc(db, 'streams', streamId), { status: 'cancelled' });
      showToast('Stream cancelled');
    } catch { showToast('Could not cancel stream'); }
  };

  // UX-17: Edit a scheduled stream (inline)
  const startEdit = (s) => {
    const dt = s.scheduledAt?.toDate ? s.scheduledAt.toDate() : new Date(s.scheduledAt);
    setTitle(s.title || '');
    setDescription(s.description || '');
    setCategory(s.category || 'gaming');
    setDate(dt.toISOString().split('T')[0]);
    setTime(dt.toTimeString().slice(0,5));
    setRecurring(s.recurring || 'once');
    setReminder(String(s.reminderMinutes || 30));
    setEditingId(s.id);
    setSavedDoc(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdate = async () => {
    if (!editingId || !title.trim() || !date || !time) return;
    setSaving(true);
    try {
      const scheduledAt = Timestamp.fromDate(new Date(`${date}T${time}`));
      await updateDoc(doc(db, 'streams', editingId), {
        title:           title.trim(),
        description:     description.trim(),
        category,
        recurring,
        reminderMinutes: parseInt(reminder, 10) || 30,
        scheduledAt,
      });
      showToast('✅ Stream updated!');
      setEditingId(null);
      setTitle(''); setDescription(''); setDate(''); setTime('');
      setRecurring('once'); setReminder('30'); setCategory('gaming');
    } catch { showToast('Update failed'); }
    finally { setSaving(false); }
  };

  // ICS calendar file generator
  const downloadICS = () => {
    if (!savedDoc) return;
    const dt  = savedDoc.scheduledAt.toDate();
    const end = new Date(dt.getTime() + 60 * 60 * 1000);
    const fmt = (d) => d.toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';
    const url = `${window.location.origin}/live/watch/${savedDoc.id}`;
    const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${title}\nDESCRIPTION:${description}\\n\\nWatch at: ${url}\nDTSTART:${fmt(dt)}\nDTEND:${fmt(end)}\nURL:${url}\nEND:VEVENT\nEND:VCALENDAR`;
    const blob = new Blob([ics], { type:'text/calendar' });
    const a    = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'stream.ics'; a.click();
    URL.revokeObjectURL(a.href);
  };

  const fmtScheduled = (ts) => {
    if (!ts) return '';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleString(undefined, { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });
  };

  if (savedDoc && !editingId) {
    return (
      <div style={{ background:'#0a0a18', minHeight:'100vh', padding:'24px 16px', textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
        <div style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed)', borderRadius:'24px', padding:'24px', maxWidth:'340px', width:'100%', marginBottom:'20px' }}>
          <div style={{ fontSize:'48px', marginBottom:'10px' }}>📅</div>
          <div style={{ color:'white', fontWeight:800, fontSize:'20px', marginBottom:'4px' }}>Stream Scheduled!</div>
          <div style={{ color:'rgba(255,255,255,0.8)', fontSize:'14px' }}>{title}</div>
          <div style={{ color:'rgba(255,255,255,0.6)', fontSize:'12px', marginTop:'6px' }}>
            {fmtScheduled(savedDoc.scheduledAt)} • {timezone}
          </div>
          {recurring !== 'once' && (
            <div style={{ background:'rgba(255,255,255,0.1)', borderRadius:'8px', padding:'6px 10px', marginTop:'10px', fontSize:'11px', color:'rgba(255,255,255,0.8)' }}>
              🔄 Recurring: {recurring}
            </div>
          )}
        </div>
        <div style={{ display:'flex', gap:'10px', maxWidth:'340px', width:'100%', marginBottom:'12px' }}>
          <button onClick={() => { window.open(`https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(title)}&dates=${savedDoc.scheduledAt.toDate().toISOString().replace(/[-:]/g,'').split('.')[0]}Z&details=${encodeURIComponent(description)}&location=${encodeURIComponent(window.location.origin+'/live/watch/'+savedDoc.id)}`,'_blank'); }}
            style={{ flex:1, background:'#1e293b', border:'none', borderRadius:'12px', padding:'12px', color:'#f1f5f9', fontWeight:700, fontSize:'12px', cursor:'pointer' }}>
            📅 Google Calendar
          </button>
          <button onClick={downloadICS}
            style={{ flex:1, background:'#1e293b', border:'none', borderRadius:'12px', padding:'12px', color:'#f1f5f9', fontWeight:700, fontSize:'12px', cursor:'pointer' }}>
            ⬇️ .ICS File
          </button>
        </div>
        <button onClick={() => { const url = `${window.location.origin}/live/watch/${savedDoc.id}`; navigator.clipboard?.writeText(url); showToast('🔗 Link copied!'); }}
          style={{ width:'100%', maxWidth:'340px', background:'#1e293b', border:'none', borderRadius:'12px', padding:'12px', color:'#f1f5f9', fontWeight:700, fontSize:'13px', cursor:'pointer', marginBottom:'10px' }}>
          🔗 Share Stream Link
        </button>
        <button onClick={() => { setSavedDoc(null); setTitle(''); setDescription(''); setDate(''); setTime(''); }}
          style={{ background:'none', border:'none', color:'#64748b', fontWeight:600, cursor:'pointer', fontSize:'13px' }}>
          + Schedule Another Stream
        </button>
      </div>
    );
  }

  return (
    <div style={{ background:'var(--bg-primary,#0a0a18)', minHeight:'100vh', paddingBottom:'80px' }}>
      <div style={{ padding:'16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', gap:'12px' }}>
        <button onClick={() => navigate(-1)} style={{ background:'none', border:'none', color:'#94a3b8', fontSize:'20px', cursor:'pointer' }}>←</button>
        <span style={{ color:'#475569', fontSize:'12px' }}>Live →</span>
        <span style={{ fontSize:'18px', fontWeight:800, color:'#f1f5f9' }}>{editingId ? '✏️ Edit Stream' : '📅 Schedule Stream'}</span>
      </div>
      <LiveSubNav navigate={navigate} />
      <div style={{ padding:'16px' }}>

        {/* Form */}
        <div style={{ background:'#1e293b', borderRadius:'14px', padding:'16px', marginBottom:'16px' }}>
          <label style={{ display:'block', fontSize:'11px', fontWeight:700, color:'#94a3b8', marginBottom:'5px' }} htmlFor="sched-title">Stream Title *</label>
          <input id="sched-title" type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="What are you streaming?"
            style={{ width:'100%', background:'#0f172a', border:'1px solid #334155', borderRadius:'10px', padding:'10px 12px', color:'#f1f5f9', fontSize:'13px', outline:'none', boxSizing:'border-box', marginBottom:'12px' }} />

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'12px' }}>
            <div>
              <label style={{ display:'block', fontSize:'11px', fontWeight:700, color:'#94a3b8', marginBottom:'5px' }} htmlFor="sched-date">Date *</label>
              {/* BUG-26 FIX: min= prevents scheduling in the past */}
              <input id="sched-date" type="date" value={date} onChange={e => setDate(e.target.value)} min={todayStr}
                style={{ width:'100%', background:'#0f172a', border:'1px solid #334155', borderRadius:'10px', padding:'10px 12px', color:'#f1f5f9', fontSize:'13px', outline:'none', boxSizing:'border-box' }} />
            </div>
            <div>
              <label style={{ display:'block', fontSize:'11px', fontWeight:700, color:'#94a3b8', marginBottom:'5px' }} htmlFor="sched-time">Time *</label>
              <input id="sched-time" type="time" value={time} onChange={e => setTime(e.target.value)}
                style={{ width:'100%', background:'#0f172a', border:'1px solid #334155', borderRadius:'10px', padding:'10px 12px', color:'#f1f5f9', fontSize:'13px', outline:'none', boxSizing:'border-box' }} />
            </div>
          </div>

          {date && time && (
            <div style={{ background:'rgba(99,102,241,0.08)', borderRadius:'8px', padding:'7px 10px', marginBottom:'12px', fontSize:'11px', color:'#818cf8' }}>
              🕒 {new Date(`${date}T${time}`).toLocaleString()} • {timezone}
            </div>
          )}

          <div style={{ fontSize:'11px', fontWeight:700, color:'#94a3b8', marginBottom:'6px' }}>Category</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginBottom:'12px' }}>
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => setCategory(c.id)} aria-pressed={category===c.id}
                style={{ padding:'5px 10px', borderRadius:'12px', border:'none', fontSize:'11px', fontWeight:600, cursor:'pointer',
                  background: category===c.id ? 'linear-gradient(135deg,#ef4444,#f59e0b)' : '#334155',
                  color: category===c.id ? 'white' : '#94a3b8' }}>
                {c.emoji} {c.label}
              </button>
            ))}
          </div>

          <label style={{ display:'block', fontSize:'11px', fontWeight:700, color:'#94a3b8', marginBottom:'5px' }} htmlFor="sched-desc">Description (Optional)</label>
          <textarea id="sched-desc" value={description} onChange={e => setDescription(e.target.value)} placeholder="What will you be doing?" rows={3}
            style={{ width:'100%', background:'#0f172a', border:'1px solid #334155', borderRadius:'10px', padding:'10px 12px', color:'#f1f5f9', fontSize:'13px', outline:'none', boxSizing:'border-box', resize:'vertical', marginBottom:'12px' }} />

          {/* BUG-25 FIX: recurring + reminder — saved to Firestore */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'12px' }}>
            <div>
              <label style={{ display:'block', fontSize:'11px', fontWeight:700, color:'#94a3b8', marginBottom:'5px' }} htmlFor="sched-recurring">Recurring</label>
              <select id="sched-recurring" value={recurring} onChange={e => setRecurring(e.target.value)}
                style={{ width:'100%', background:'#0f172a', border:'1px solid #334155', borderRadius:'10px', padding:'9px 12px', color:'#f1f5f9', fontSize:'12px', outline:'none', appearance:'none' }}>
                <option value="once">One-time</option>
                <option value="weekly">Weekly</option>
                <option value="daily">Daily</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label style={{ display:'block', fontSize:'11px', fontWeight:700, color:'#94a3b8', marginBottom:'5px' }} htmlFor="sched-reminder">Remind Me</label>
              <select id="sched-reminder" value={reminder} onChange={e => setReminder(e.target.value)}
                style={{ width:'100%', background:'#0f172a', border:'1px solid #334155', borderRadius:'10px', padding:'9px 12px', color:'#f1f5f9', fontSize:'12px', outline:'none', appearance:'none' }}>
                <option value="15">15 min before</option>
                <option value="30">30 min before</option>
                <option value="60">1 hour before</option>
                <option value="1440">1 day before</option>
              </select>
            </div>
          </div>

          {/* BUG-27 FIX: Show beta warning for recurring streams */}
          {recurring !== 'once' && (
            <div style={{ background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:'10px', padding:'10px 12px', marginBottom:'12px', fontSize:'11px' }}>
              <span style={{ color:'#f59e0b', fontWeight:700 }}>⚠️ Recurring Streams — Beta</span>
              <div style={{ color:'#94a3b8', marginTop:'3px' }}>
                Recurring scheduling is in beta. A Cloud Function will automatically create future instances. If the function is unavailable, you may need to manually re-schedule after each stream ends.
              </div>
            </div>
          )}
        </div>

        <button onClick={editingId ? handleUpdate : handleSave} disabled={saving || !title.trim() || !date || !time}
          style={{ width:'100%', background: title.trim()&&date&&time ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : '#334155', border:'none', borderRadius:'14px', padding:'14px', color:'white', fontWeight:700, fontSize:'15px', cursor: title.trim()&&date&&time?'pointer':'default', opacity: title.trim()&&date&&time?1:0.5, marginBottom:'20px' }}>
          {saving ? '⏳ Saving…' : editingId ? '✓ Update Stream' : '📅 Schedule Stream'}
        </button>
        {editingId && (
          <button onClick={() => { setEditingId(null); setTitle(''); setDescription(''); setDate(''); setTime(''); }}
            style={{ width:'100%', background:'none', border:'1px solid #334155', borderRadius:'14px', padding:'12px', color:'#94a3b8', fontWeight:600, fontSize:'13px', cursor:'pointer', marginBottom:'20px' }}>
            ✕ Cancel Edit
          </button>
        )}

        {/* UX-17 FIX: Upcoming scheduled streams list */}
        <div style={{ background:'#1e293b', borderRadius:'14px', padding:'16px' }}>
          <div style={{ fontSize:'13px', fontWeight:800, color:'#f1f5f9', marginBottom:'12px' }}>📅 Your Upcoming Streams</div>
          {loadingUpcoming && <div style={{ color:'#64748b', fontSize:'12px' }}>Loading…</div>}
          {!loadingUpcoming && upcoming.length === 0 && (
            <div style={{ color:'#475569', fontSize:'12px', textAlign:'center', padding:'12px' }}>No scheduled streams yet.</div>
          )}
          {upcoming.map(s => (
            <div key={s.id} style={{ background:'#0f172a', borderRadius:'12px', padding:'12px', marginBottom:'8px' }}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:'10px' }}>
                <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:'linear-gradient(135deg,#4f46e5,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', flexShrink:0 }}>
                  {CATEGORIES.find(c=>c.id===s.category)?.emoji || '📅'}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'13px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.title}</div>
                  <div style={{ color:'#64748b', fontSize:'11px', marginTop:'2px' }}>{fmtScheduled(s.scheduledAt)}</div>
                  {s.recurring && s.recurring !== 'once' && <div style={{ color:'#818cf8', fontSize:'10px' }}>🔄 {s.recurring}</div>}
                </div>
              </div>
              <div style={{ display:'flex', gap:'8px', marginTop:'10px' }}>
                <button onClick={() => startEdit(s)}
                  style={{ flex:1, background:'rgba(99,102,241,0.15)', border:'none', borderRadius:'8px', padding:'6px', color:'#818cf8', fontSize:'11px', fontWeight:700, cursor:'pointer' }}>
                  ✏️ Edit
                </button>
                <button onClick={() => { const url = `${window.location.origin}/live/watch/${s.id}`; navigator.clipboard?.writeText(url); showToast('🔗 Link copied!'); }}
                  style={{ flex:1, background:'rgba(16,185,129,0.15)', border:'none', borderRadius:'8px', padding:'6px', color:'#10b981', fontSize:'11px', fontWeight:700, cursor:'pointer' }}>
                  🔗 Share
                </button>
                <button onClick={() => cancelStream(s.id)}
                  style={{ flex:1, background:'rgba(239,68,68,0.15)', border:'none', borderRadius:'8px', padding:'6px', color:'#ef4444', fontSize:'11px', fontWeight:700, cursor:'pointer' }}>
                  ✕ Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
