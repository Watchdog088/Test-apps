// LiveSchedulePage.jsx
// UX-32: Calendar date/time picker
// UX-33: Recurring stream option
// UX-34: Scheduled streams trigger follower notifications (writes to scheduledStreamNotifications)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection, addDoc, getDocs, query, where, orderBy,
  deleteDoc, doc, serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import useAppStore from '@store/useAppStore';

const CATEGORIES = ['Gaming','Music','Fitness','Art','IRL','Cooking','Education','Talk Show','Other'];
const RECUR_OPTIONS = [
  { id: 'none',    label: 'One-time' },
  { id: 'daily',   label: 'Daily' },
  { id: 'weekly',  label: 'Weekly' },
  { id: 'biweekly',label: 'Every 2 weeks' },
];

function minFromNow(mins) {
  const d = new Date(Date.now() + mins * 60000);
  // Return as local datetime-local string
  const pad = n => String(n).padStart(2,'0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function LiveSchedulePage() {
  const navigate  = useNavigate();
  const showToast = useAppStore(s => s.showToast);

  const [title,       setTitle]       = useState('');
  const [description, setDesc]        = useState('');
  const [category,    setCategory]    = useState('Gaming');
  const [scheduledAt, setScheduledAt] = useState(minFromNow(30)); // UX-32
  const [recur,       setRecur]       = useState('none');          // UX-33
  const [saving,      setSaving]      = useState(false);
  const [scheduled,   setScheduled]   = useState([]);
  const [loading,     setLoading]     = useState(true);

  // Load existing scheduled streams
  useEffect(() => {
    if (!auth.currentUser) return;
    const load = async () => {
      try {
        const q = query(
          collection(db, 'scheduledStreams'),
          where('userId', '==', auth.currentUser.uid),
          orderBy('scheduledAt', 'asc')
        );
        const snap = await getDocs(q);
        setScheduled(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleSchedule = async () => {
    if (!title.trim()) { showToast('Enter a stream title'); return; }
    if (!auth.currentUser) { showToast('Sign in required'); return; }
    const dt = new Date(scheduledAt);
    if (isNaN(dt.getTime()) || dt <= new Date()) { showToast('Pick a future date and time'); return; }

    setSaving(true);
    try {
      // Write scheduled stream doc
      const docRef = await addDoc(collection(db, 'scheduledStreams'), {
        userId:      auth.currentUser.uid,
        userName:    auth.currentUser.displayName || 'Streamer',
        title:       title.trim(),
        description: description.trim(),
        category,
        scheduledAt: dt,
        recur,
        status:      'scheduled',
        createdAt:   serverTimestamp(),
      });

      // UX-34: Write notification trigger for Cloud Function
      await addDoc(collection(db, 'scheduledStreamNotifications'), {
        streamId:    docRef.id,
        userId:      auth.currentUser.uid,
        userName:    auth.currentUser.displayName || 'Streamer',
        title:       title.trim(),
        scheduledAt: dt,
        notifyAt:    new Date(dt.getTime() - 30 * 60000), // 30 min before
        sent:        false,
        createdAt:   serverTimestamp(),
      });

      showToast('✅ Stream scheduled! Followers will be notified 30 min before.');
      setScheduled(prev => [...prev, {
        id: docRef.id, userId: auth.currentUser.uid,
        title: title.trim(), category, scheduledAt: dt, recur, status:'scheduled'
      }].sort((a,b) => new Date(a.scheduledAt) - new Date(b.scheduledAt)));

      setTitle(''); setDesc(''); setScheduledAt(minFromNow(30)); setRecur('none');
    } catch (e) {
      console.error(e);
      showToast('Failed to schedule stream');
    } finally {
      setSaving(false);
    }
  };

  const cancelStream = async (id) => {
    try {
      await deleteDoc(doc(db, 'scheduledStreams', id));
      setScheduled(prev => prev.filter(s => s.id !== id));
      showToast('Stream cancelled');
    } catch { showToast('Failed to cancel'); }
  };

  // POLISH-06: Download .ics calendar file for a scheduled stream
  const downloadIcs = (s) => {
    const dt = s.scheduledAt?.toDate ? s.scheduledAt.toDate() : new Date(s.scheduledAt);
    const endDt = new Date(dt.getTime() + 60 * 60 * 1000); // +1 hour default
    const pad = n => String(n).padStart(2,'0');
    const fmtIcs = d =>
      `${d.getUTCFullYear()}${pad(d.getUTCMonth()+1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
    const ics = [
      'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//LynkApp//Live//EN',
      'BEGIN:VEVENT',
      `UID:${s.id}@lynkapp`,
      `DTSTART:${fmtIcs(dt)}`,
      `DTEND:${fmtIcs(endDt)}`,
      `SUMMARY:📺 ${s.title}`,
      `DESCRIPTION:Live stream by ${s.userName || 'Streamer'}. Category: ${s.category}.`,
      `URL:${window.location.origin}/live`,
      'END:VEVENT','END:VCALENDAR'
    ].join('\r\n');
    const blob = new Blob([ics], { type:'text/calendar' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `stream-${s.id.slice(0,8)}.ics`; a.click();
    URL.revokeObjectURL(url);
  };

  // POLISH-06: Copy share link for a scheduled stream
  const shareScheduled = (s) => {
    const url = `${window.location.origin}/live`;
    if (navigator.share) {
      navigator.share({ title: `📺 ${s.title}`, text: `I'm going live soon! ${s.title}`, url }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(url);
      showToast('🔗 Share link copied!');
    }
  };

  const fmtDate = (dt) => {
    const d = dt?.toDate ? dt.toDate() : new Date(dt);
    return d.toLocaleString([], { weekday:'short', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });
  };

  const catEmoji = { Gaming:'🎮', Music:'🎵', Fitness:'💪', Art:'🎨', IRL:'📍', Cooking:'🍳', Education:'📚', 'Talk Show':'💬', Other:'📺' };

  return (
    <div style={{ background:'#0a0a18', minHeight:'100vh', paddingBottom:'80px' }}>
      <div style={{ padding:'12px 16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', gap:'10px' }}>
        <button onClick={() => navigate(-1)} style={{ background:'none', border:'none', color:'#94a3b8', fontSize:'20px', cursor:'pointer' }}>←</button>
        <span style={{ fontSize:'16px', fontWeight:800, color:'#f1f5f9', flex:1 }}>📅 Schedule a Stream</span>
      </div>

      <div style={{ padding:'12px 16px' }}>
        {/* Schedule form */}
        <div style={{ background:'#1e293b', borderRadius:'14px', padding:'14px', marginBottom:'16px' }}>
          <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'14px', marginBottom:'12px' }}>New Stream</div>

          {/* Title */}
          <input value={title} onChange={e => setTitle(e.target.value)} maxLength={100}
            placeholder="Stream title *"
            style={{ width:'100%', background:'#0a0a18', border:'1px solid #334155', borderRadius:'10px', padding:'10px 12px', color:'#f1f5f9', fontSize:'14px', outline:'none', boxSizing:'border-box', marginBottom:'10px' }} />

          {/* Description */}
          <textarea value={description} onChange={e => setDesc(e.target.value)} maxLength={300} rows={2}
            placeholder="What are you streaming? (optional)"
            style={{ width:'100%', background:'#0a0a18', border:'1px solid #334155', borderRadius:'10px', padding:'10px 12px', color:'#f1f5f9', fontSize:'13px', outline:'none', boxSizing:'border-box', resize:'none', marginBottom:'10px' }} />

          {/* Category */}
          <div style={{ marginBottom:'10px' }}>
            <div style={{ color:'#94a3b8', fontSize:'12px', marginBottom:'6px' }}>Category</div>
            <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCategory(c)}
                  style={{ padding:'5px 12px', borderRadius:'20px', border:'none', fontSize:'12px', fontWeight:600, cursor:'pointer',
                    background: category === c ? 'linear-gradient(135deg,#ef4444,#f59e0b)' : '#334155',
                    color: category === c ? 'white' : '#94a3b8' }}>
                  {catEmoji[c] || '📺'} {c}
                </button>
              ))}
            </div>
          </div>

          {/* UX-32: Date/Time picker */}
          <div style={{ marginBottom:'10px' }}>
            <div style={{ color:'#94a3b8', fontSize:'12px', marginBottom:'6px' }}>📅 Date & Time *</div>
            <input type="datetime-local" value={scheduledAt}
              min={minFromNow(5)}
              onChange={e => setScheduledAt(e.target.value)}
              style={{ width:'100%', background:'#0a0a18', border:'1px solid #334155', borderRadius:'10px', padding:'10px 12px', color:'#f1f5f9', fontSize:'14px', outline:'none', boxSizing:'border-box', colorScheme:'dark' }} />
          </div>

          {/* UX-33: Recurring option */}
          <div style={{ marginBottom:'14px' }}>
            <div style={{ color:'#94a3b8', fontSize:'12px', marginBottom:'6px' }}>🔁 Recurring</div>
            <div style={{ display:'flex', gap:'6px' }}>
              {RECUR_OPTIONS.map(r => (
                <button key={r.id} onClick={() => setRecur(r.id)}
                  style={{ flex:1, padding:'7px 4px', borderRadius:'10px', border:'none', fontSize:'11px', fontWeight:700, cursor:'pointer',
                    background: recur === r.id ? 'linear-gradient(135deg,#ef4444,#f59e0b)' : '#334155',
                    color: recur === r.id ? 'white' : '#94a3b8' }}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* UX-34 indicator */}
          <div style={{ background:'rgba(34,197,94,0.1)', borderRadius:'10px', padding:'8px 12px', marginBottom:'12px', display:'flex', gap:'8px', alignItems:'flex-start' }}>
            <span style={{ fontSize:'14px' }}>🔔</span>
            <span style={{ color:'#86efac', fontSize:'12px' }}>Your followers will be notified 30 minutes before this stream starts.</span>
          </div>

          <button onClick={handleSchedule} disabled={saving || !title.trim()}
            style={{ width:'100%', background: saving || !title.trim() ? '#334155' : 'linear-gradient(135deg,#ef4444,#f59e0b)',
              border:'none', borderRadius:'12px', padding:'12px', color:'white', fontWeight:800, fontSize:'14px', cursor: saving || !title.trim() ? 'not-allowed' : 'pointer' }}>
            {saving ? '⏳ Scheduling…' : '📅 Schedule Stream'}
          </button>
        </div>

        {/* Scheduled streams list */}
        <div style={{ color:'#64748b', fontSize:'12px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'10px' }}>
          Upcoming Streams ({scheduled.length})
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:'24px', color:'#64748b' }}>Loading…</div>
        ) : scheduled.length === 0 ? (
          <div style={{ textAlign:'center', padding:'32px 16px', background:'#1e293b', borderRadius:'16px' }}>
            <div style={{ fontSize:'32px', marginBottom:'8px' }}>📅</div>
            <div style={{ color:'#64748b', fontSize:'13px' }}>No upcoming streams scheduled</div>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {scheduled.map(s => (
              <div key={s.id} style={{ background:'#1e293b', borderRadius:'14px', padding:'12px 14px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'6px' }}>
                  <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'14px', flex:1 }}>{s.title}</div>
                  <button onClick={() => cancelStream(s.id)}
                    style={{ background:'none', border:'none', color:'#ef4444', cursor:'pointer', fontSize:'12px', flexShrink:0 }}>Cancel</button>
                </div>
                <div style={{ display:'flex', gap:'10px', flexWrap:'wrap', alignItems:'center', marginBottom:'8px' }}>
                  <span style={{ color:'#94a3b8', fontSize:'12px' }}>
                    {catEmoji[s.category] || '📺'} {s.category}
                  </span>
                  <span style={{ color:'#f59e0b', fontSize:'12px', fontWeight:600 }}>
                    📅 {fmtDate(s.scheduledAt)}
                  </span>
                  {s.recur && s.recur !== 'none' && (
                    <span style={{ background:'rgba(239,68,68,0.15)', borderRadius:'8px', padding:'2px 8px', color:'#ef4444', fontSize:'11px', fontWeight:600 }}>
                      🔁 {RECUR_OPTIONS.find(r => r.id === s.recur)?.label}
                    </span>
                  )}
                </div>
                {/* POLISH-06: Calendar download + share */}
                <div style={{ display:'flex', gap:'8px' }}>
                  <button onClick={() => downloadIcs(s)}
                    title="Add to calendar (.ics)"
                    style={{ flex:1, background:'#334155', border:'none', borderRadius:'8px', padding:'6px', color:'#94a3b8', fontSize:'11px', fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'4px' }}>
                    📅 Add to Calendar
                  </button>
                  <button onClick={() => shareScheduled(s)}
                    title="Share stream"
                    style={{ background:'#334155', border:'none', borderRadius:'8px', padding:'6px 12px', color:'#94a3b8', fontSize:'11px', fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'4px' }}>
                    🔗 Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
