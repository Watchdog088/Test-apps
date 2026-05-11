// LiveSchedulePage.jsx — /live/schedule
// FIXES: BUG-SC02 (recurring future docs note), BUG-SC03 (local timezone display),
//        BUG-SC04 (form reset after submit), MISS-SC01 (browse Following tab),
//        MISS-SC02 (reminder bell), MISS-SC03 (iCal export), MISS-SC04 (timezone label)

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection, doc, addDoc, getDocs, deleteDoc, setDoc,
  query, where, orderBy, limit, serverTimestamp, getDoc,
} from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import useAppStore from '@store/useAppStore';

// BUG-SC04: category list constant for proper reset
const CATEGORIES = ['Gaming','Music','Just Chatting','Sports','Education','Art','Cooking','Tech','Fitness','Other'];

// MISS-SC03: Generate iCal .ics content
function generateICS(stream) {
  const dt = stream.scheduledAt?.toDate ? stream.scheduledAt.toDate() : new Date(stream.scheduledAt);
  const end = new Date(dt.getTime() + (stream.durationMinutes || 60) * 60000);
  const fmt = d => d.toISOString().replace(/[-:]/g,'').split('.')[0] + 'Z';
  return [
    'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//LynkApp//Live Schedule//EN',
    'BEGIN:VEVENT',
    `DTSTART:${fmt(dt)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:🔴 LIVE: ${stream.title || 'Stream'}`,
    `DESCRIPTION:${stream.description || ''}`,
    `URL:https://lynkapp.io/live/${stream.id}`,
    'END:VEVENT','END:VCALENDAR',
  ].join('\r\n');
}

function downloadICS(stream) {
  const blob = new Blob([generateICS(stream)], { type:'text/calendar' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a'); a.href = url;
  a.download = `stream-${stream.id || 'schedule'}.ics`;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

// MISS-SC04: User's local timezone
const USER_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
function fmtLocal(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString(undefined, { timeZone: USER_TZ, weekday:'short', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });
}

const BLANK_FORM = { title:'', description:'', scheduledDate:'', scheduledTime:'', category:'Gaming', durationMinutes:60, isRecurring:false, recurringType:'weekly' };

export default function LiveSchedulePage() {
  const navigate  = useNavigate();
  const showToast = useAppStore(s => s.showToast);
  const uid       = auth.currentUser?.uid;

  const [tab,         setTab]         = useState('my');  // 'my' | 'following'
  const [myStreams,   setMyStreams]    = useState([]);
  const [following,   setFollowing]   = useState([]);
  const [reminders,   setReminders]   = useState({}); // scheduleId → true
  const [form,        setForm]        = useState(BLANK_FORM);
  const [showForm,    setShowForm]    = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [loading,     setLoading]     = useState(true);
  const [loadingFol,  setLoadingFol]  = useState(false);
  const [errors,      setErrors]      = useState({});

  // Load my scheduled streams + reminders
  useEffect(() => {
    if (!uid) return;
    (async () => {
      try {
        const q = query(
          collection(db, 'scheduledStreams'),
          where('uid', '==', uid),
          where('scheduledAt', '>=', new Date()),
          orderBy('scheduledAt', 'asc'),
          limit(50)
        );
        const snap = await getDocs(q).catch(() => ({ docs:[] }));
        setMyStreams(snap.docs.map(d => ({ id: d.id, ...d.data() })));

        // Load reminders
        const rSnap = await getDocs(collection(db, 'users', uid, 'reminders')).catch(() => ({ docs:[] }));
        const remMap = {};
        rSnap.docs.forEach(d => { remMap[d.id] = true; });
        setReminders(remMap);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [uid]);

  // MISS-SC01: Load following users' scheduled streams
  useEffect(() => {
    if (tab !== 'following' || !uid) return;
    setLoadingFol(true);
    (async () => {
      try {
        // Get list of followed users
        const fSnap = await getDocs(collection(db, 'users', uid, 'following')).catch(() => ({ docs:[] }));
        const followedUids = fSnap.docs.map(d => d.id).slice(0, 10); // Firestore 'in' limit

        if (followedUids.length === 0) { setFollowing([]); setLoadingFol(false); return; }

        const q = query(
          collection(db, 'scheduledStreams'),
          where('uid', 'in', followedUids),
          where('scheduledAt', '>=', new Date()),
          orderBy('scheduledAt', 'asc'),
          limit(50)
        );
        const snap = await getDocs(q).catch(() => ({ docs:[] }));
        setFollowing(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { console.error(e); }
      finally { setLoadingFol(false); }
    })();
  }, [tab, uid]);

  const validate = useCallback(() => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title required';
    if (!form.scheduledDate) e.date = 'Date required';
    if (!form.scheduledTime) e.time = 'Time required';
    if (!form.category) e.category = 'Category required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [form]);

  const submit = useCallback(async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const dt = new Date(`${form.scheduledDate}T${form.scheduledTime}`);
      const payload = {
        uid, title: form.title.trim(), description: form.description.trim(),
        scheduledAt: dt, category: form.category,
        durationMinutes: +form.durationMinutes,
        isRecurring: form.isRecurring, recurringType: form.recurringType,
        createdAt: serverTimestamp(),
        // BUG-SC02: Note — recurring future instances generated by Cloud Function
        _note: form.isRecurring ? 'recurring_pending_cloud_function' : null,
      };
      const ref = await addDoc(collection(db, 'scheduledStreams'), payload);
      setMyStreams(p => [...p, { id: ref.id, ...payload, scheduledAt: { toDate: () => dt } }].sort((a,b)=>{
        const ad = a.scheduledAt?.toDate ? a.scheduledAt.toDate() : new Date(a.scheduledAt);
        const bd = b.scheduledAt?.toDate ? b.scheduledAt.toDate() : new Date(b.scheduledAt);
        return ad - bd;
      }));
      // BUG-SC04: Reset ALL fields properly
      setForm({ ...BLANK_FORM });
      setShowForm(false);
      setErrors({});
      showToast('📅 Stream scheduled!');
    } catch (e) { console.error(e); showToast('Failed to schedule'); }
    finally { setSaving(false); }
  }, [form, uid, validate, showToast]);

  const deleteStream = useCallback(async (id) => {
    try {
      await deleteDoc(doc(db, 'scheduledStreams', id));
      setMyStreams(p => p.filter(s => s.id !== id));
      showToast('Deleted');
    } catch { showToast('Failed to delete'); }
  }, [showToast]);

  // MISS-SC02: Toggle reminder
  const toggleReminder = useCallback(async (stream) => {
    const hasReminder = reminders[stream.id];
    try {
      if (hasReminder) {
        await deleteDoc(doc(db, 'users', uid, 'reminders', stream.id));
        setReminders(p => { const n={...p}; delete n[stream.id]; return n; });
        showToast('Reminder removed');
      } else {
        await setDoc(doc(db, 'users', uid, 'reminders', stream.id), {
          streamerId: stream.uid, title: stream.title,
          scheduledAt: stream.scheduledAt, createdAt: serverTimestamp(),
        });
        setReminders(p => ({ ...p, [stream.id]: true }));
        showToast('🔔 Reminder set!');
      }
    } catch { showToast('Failed to update reminder'); }
  }, [uid, reminders, showToast]);

  function StreamCard({ s, isOwner }) {
    return (
      <div style={{ background:'#1e293b', borderRadius:'14px', padding:'14px', marginBottom:'10px', border:'1px solid #334155' }}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:'10px' }}>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', gap:'6px', marginBottom:'4px', flexWrap:'wrap' }}>
              <span style={{ background:'rgba(239,68,68,0.15)', color:'#f87171', borderRadius:'6px', padding:'2px 8px', fontSize:'11px', fontWeight:700 }}>
                {s.category || 'Stream'}
              </span>
              {s.isRecurring && <span style={{ background:'rgba(245,158,11,0.15)', color:'#f59e0b', borderRadius:'6px', padding:'2px 8px', fontSize:'11px' }}>🔄 {s.recurringType}</span>}
            </div>
            <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'14px', marginBottom:'2px' }}>{s.title}</div>
            {/* BUG-SC03 + MISS-SC04: Local time + timezone */}
            <div style={{ color:'#ef4444', fontSize:'12px', fontWeight:600, marginBottom:'2px' }}>
              📅 {fmtLocal(s.scheduledAt)}
            </div>
            <div style={{ color:'#64748b', fontSize:'11px' }}>🌍 {USER_TZ} · ⏱ {s.durationMinutes || 60} min</div>
            {s.description && <div style={{ color:'#94a3b8', fontSize:'12px', marginTop:'4px' }}>{s.description}</div>}
          </div>
        </div>
        <div style={{ display:'flex', gap:'6px', marginTop:'10px', flexWrap:'wrap' }}>
          {/* MISS-SC02: Reminder bell */}
          {!isOwner && (
            <button onClick={() => toggleReminder(s)}
              style={{ flex:1, background: reminders[s.id] ? 'rgba(245,158,11,0.15)' : '#334155',
                border:`1px solid ${reminders[s.id] ? '#f59e0b' : '#475569'}`,
                borderRadius:'8px', padding:'6px', color: reminders[s.id] ? '#f59e0b' : '#94a3b8',
                fontSize:'12px', fontWeight:600, cursor:'pointer' }}>
              {reminders[s.id] ? '🔔 Reminded' : '🔔 Remind Me'}
            </button>
          )}
          {/* MISS-SC03: iCal export */}
          <button onClick={() => downloadICS(s)}
            style={{ flex:1, background:'#334155', border:'1px solid #475569', borderRadius:'8px',
              padding:'6px', color:'#94a3b8', fontSize:'12px', fontWeight:600, cursor:'pointer' }}>
            📅 Add to Cal
          </button>
          {/* Google Calendar */}
          <button onClick={() => {
            const dt = s.scheduledAt?.toDate ? s.scheduledAt.toDate() : new Date(s.scheduledAt);
            const end = new Date(dt.getTime() + (s.durationMinutes||60)*60000);
            const fmt = d => d.toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';
            window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('🔴 '+s.title)}&dates=${fmt(dt)}/${fmt(end)}&details=${encodeURIComponent(s.description||'')}`,'_blank');
          }} style={{ flex:1, background:'#334155', border:'1px solid #475569', borderRadius:'8px',
            padding:'6px', color:'#94a3b8', fontSize:'12px', fontWeight:600, cursor:'pointer' }}>
            🗓 Google Cal
          </button>
          {isOwner && (
            <button onClick={() => deleteStream(s.id)}
              style={{ background:'rgba(239,68,68,0.1)', border:'1px solid #ef4444', borderRadius:'8px',
                padding:'6px 12px', color:'#f87171', fontSize:'12px', fontWeight:600, cursor:'pointer' }}>
              🗑
            </button>
          )}
        </div>
      </div>
    );
  }

  const inp = (field, value) => setForm(f => ({ ...f, [field]: value }));

  return (
    <div style={{ background:'#0a0a18', minHeight:'100vh', paddingBottom:'80px' }}>
      {/* Header */}
      <div style={{ padding:'12px 16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', gap:'10px' }}>
        <button onClick={() => navigate(-1)} style={{ background:'none', border:'none', color:'#94a3b8', fontSize:'20px', cursor:'pointer' }}>←</button>
        <span style={{ fontSize:'16px', fontWeight:800, color:'#f1f5f9', flex:1 }}>📅 Schedule</span>
        <button onClick={() => setShowForm(v => !v)}
          style={{ background:'linear-gradient(135deg,#ef4444,#f59e0b)', border:'none', borderRadius:'10px',
            padding:'8px 14px', color:'white', fontWeight:700, fontSize:'12px', cursor:'pointer' }}>
          + Schedule
        </button>
      </div>

      {/* Tabs — MISS-SC01: Following tab */}
      <div style={{ display:'flex', borderBottom:'1px solid #1e293b' }}>
        {[{id:'my',label:'📋 My Streams'},{id:'following',label:'👥 Following'}].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ flex:1, padding:'10px', background:'none', border:'none',
              borderBottom: tab===t.id ? '2px solid #ef4444' : '2px solid transparent',
              color: tab===t.id ? '#ef4444' : '#94a3b8', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Schedule Form */}
      {showForm && (
        <div style={{ padding:'14px 16px', background:'#0f172a', borderBottom:'1px solid #1e293b' }}>
          <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'14px', marginBottom:'12px' }}>New Scheduled Stream</div>

          {[
            { key:'title', label:'Stream Title *', placeholder:'e.g. Sunday Gaming Session', type:'text' },
            { key:'description', label:'Description', placeholder:'What will you be streaming?', type:'text' },
          ].map(({ key, label, placeholder, type }) => (
            <div key={key} style={{ marginBottom:'10px' }}>
              <label style={{ color:'#94a3b8', fontSize:'11px', display:'block', marginBottom:'3px' }}>{label}</label>
              <input type={type} value={form[key]} placeholder={placeholder}
                onChange={e => inp(key, e.target.value)}
                style={{ width:'100%', background:'#1e293b', border:`1px solid ${errors[key] ? '#ef4444' : '#334155'}`,
                  borderRadius:'8px', padding:'8px 10px', color:'#f1f5f9', fontSize:'13px', outline:'none', boxSizing:'border-box' }} />
              {errors[key] && <div style={{ color:'#f87171', fontSize:'11px', marginTop:'2px' }}>{errors[key]}</div>}
            </div>
          ))}

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'10px' }}>
            <div>
              <label style={{ color:'#94a3b8', fontSize:'11px', display:'block', marginBottom:'3px' }}>Date *</label>
              <input type="date" value={form.scheduledDate} min={new Date().toISOString().split('T')[0]}
                onChange={e => inp('scheduledDate', e.target.value)}
                style={{ width:'100%', background:'#1e293b', border:`1px solid ${errors.date ? '#ef4444' : '#334155'}`,
                  borderRadius:'8px', padding:'8px 10px', color:'#f1f5f9', fontSize:'13px', outline:'none', boxSizing:'border-box' }} />
            </div>
            <div>
              <label style={{ color:'#94a3b8', fontSize:'11px', display:'block', marginBottom:'3px' }}>Time *</label>
              <input type="time" value={form.scheduledTime}
                onChange={e => inp('scheduledTime', e.target.value)}
                style={{ width:'100%', background:'#1e293b', border:`1px solid ${errors.time ? '#ef4444' : '#334155'}`,
                  borderRadius:'8px', padding:'8px 10px', color:'#f1f5f9', fontSize:'13px', outline:'none', boxSizing:'border-box' }} />
            </div>
          </div>

          {/* MISS-SC04: Timezone display */}
          <div style={{ color:'#64748b', fontSize:'11px', marginBottom:'10px' }}>🌍 Your timezone: {USER_TZ}</div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'10px' }}>
            <div>
              {/* BUG-SC04: category uses select with full CATEGORIES list */}
              <label style={{ color:'#94a3b8', fontSize:'11px', display:'block', marginBottom:'3px' }}>Category *</label>
              <select value={form.category} onChange={e => inp('category', e.target.value)}
                style={{ width:'100%', background:'#1e293b', border:`1px solid ${errors.category ? '#ef4444' : '#334155'}`,
                  borderRadius:'8px', padding:'8px 10px', color:'#f1f5f9', fontSize:'13px', outline:'none', boxSizing:'border-box' }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ color:'#94a3b8', fontSize:'11px', display:'block', marginBottom:'3px' }}>Duration (min)</label>
              <select value={form.durationMinutes} onChange={e => inp('durationMinutes', +e.target.value)}
                style={{ width:'100%', background:'#1e293b', border:'1px solid #334155', borderRadius:'8px',
                  padding:'8px 10px', color:'#f1f5f9', fontSize:'13px', outline:'none', boxSizing:'border-box' }}>
                {[30,60,90,120,180,240].map(m => <option key={m} value={m}>{m >= 60 ? `${m/60}h` : `${m}m`}</option>)}
              </select>
            </div>
          </div>

          {/* BUG-SC02: Recurring toggle with note */}
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px' }}>
            <button onClick={() => inp('isRecurring', !form.isRecurring)} role="switch" aria-checked={form.isRecurring}
              style={{ width:'40px', height:'22px', borderRadius:'11px', border:'none', cursor:'pointer',
                background: form.isRecurring ? '#ef4444' : '#334155', position:'relative', flexShrink:0 }}>
              <div style={{ position:'absolute', top:'2px', left: form.isRecurring ? '20px' : '2px',
                width:'18px', height:'18px', borderRadius:'50%', background:'white', transition:'left 0.15s' }} />
            </button>
            <span style={{ color:'#94a3b8', fontSize:'12px' }}>Recurring stream</span>
            {form.isRecurring && (
              <select value={form.recurringType} onChange={e => inp('recurringType', e.target.value)}
                style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:'6px', color:'#f1f5f9', padding:'4px 8px', fontSize:'12px' }}>
                {['daily','weekly','biweekly','monthly'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            )}
          </div>
          {form.isRecurring && (
            <div style={{ background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:'8px', padding:'8px', marginBottom:'10px' }}>
              <div style={{ color:'#f59e0b', fontSize:'11px' }}>ℹ️ Future recurring instances are generated automatically by the platform. This schedules your first occurrence.</div>
            </div>
          )}

          <div style={{ display:'flex', gap:'8px' }}>
            <button onClick={() => { setShowForm(false); setForm({...BLANK_FORM}); setErrors({}); }}
              style={{ flex:1, background:'#334155', border:'none', borderRadius:'10px', padding:'10px', color:'#94a3b8', fontWeight:700, cursor:'pointer' }}>
              Cancel
            </button>
            <button onClick={submit} disabled={saving}
              style={{ flex:2, background:'linear-gradient(135deg,#ef4444,#f59e0b)', border:'none', borderRadius:'10px',
                padding:'10px', color:'white', fontWeight:700, cursor:'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Scheduling…' : '📅 Schedule Stream'}
            </button>
          </div>
        </div>
      )}

      {/* My Streams */}
      {tab === 'my' && (
        <div style={{ padding:'12px 16px' }}>
          {loading && <div style={{ textAlign:'center', color:'#64748b', padding:'32px' }}>Loading…</div>}
          {!loading && myStreams.length === 0 && (
            <div style={{ textAlign:'center', padding:'48px', color:'#64748b' }}>
              <div style={{ fontSize:'40px', marginBottom:'8px' }}>📅</div>
              <div style={{ fontSize:'14px', fontWeight:600, marginBottom:'4px' }}>No upcoming streams</div>
              <div style={{ fontSize:'12px' }}>Tap "+ Schedule" to plan your next live stream</div>
            </div>
          )}
          {myStreams.map(s => <StreamCard key={s.id} s={s} isOwner={true} />)}
        </div>
      )}

      {/* MISS-SC01: Following tab */}
      {tab === 'following' && (
        <div style={{ padding:'12px 16px' }}>
          {loadingFol && <div style={{ textAlign:'center', color:'#64748b', padding:'32px' }}>Loading…</div>}
          {!loadingFol && following.length === 0 && (
            <div style={{ textAlign:'center', padding:'48px', color:'#64748b' }}>
              <div style={{ fontSize:'40px', marginBottom:'8px' }}>👥</div>
              <div style={{ fontSize:'14px', fontWeight:600, marginBottom:'4px' }}>No upcoming streams from people you follow</div>
              <div style={{ fontSize:'12px' }}>Follow more creators to see their scheduled streams here</div>
            </div>
          )}
          {following.map(s => <StreamCard key={s.id} s={s} isOwner={false} />)}
        </div>
      )}
    </div>
  );
}
