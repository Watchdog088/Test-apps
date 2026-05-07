// LIVE SCHEDULE PAGE — /live/schedule
// FIXES APPLIED:
//   BUG-7:    Schedule saves to Firestore streams collection with status:'scheduled'
//   MISSING-8: "Add to Calendar" button (Google Calendar + ICS download)

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import useAppStore from '@store/useAppStore';

const CATEGORIES = [
  '🎮 Gaming','🎵 Music','💪 Fitness','🎨 Art',
  '📍 IRL','🍳 Cooking','📚 Education','💬 Talk Show',
];

export default function LiveSchedulePage() {
  const navigate  = useNavigate();
  const showToast = useAppStore(s => s.showToast);

  const [title,     setTitle]     = useState('');
  const [date,      setDate]      = useState('');
  const [time,      setTime]      = useState('');
  const [desc,      setDesc]      = useState('');
  const [category,  setCategory]  = useState('');
  const [saving,    setSaving]    = useState(false);
  const [savedDoc,  setSavedDoc]  = useState(null); // BUG-7 FIX: store saved doc for calendar

  // BUG-7 FIX: Save to Firestore
  const handleSave = async () => {
    if (!title || !date || !time) return;
    if (!auth.currentUser) { showToast('Sign in to schedule a stream'); return; }
    setSaving(true);
    try {
      const scheduledDateTime = new Date(`${date}T${time}`);
      const docRef = await addDoc(collection(db, 'streams'), {
        title:        title.trim(),
        description:  desc.trim(),
        category:     category.replace(/[^a-zA-Z]/g,'').toLowerCase() || 'general',
        status:       'scheduled',
        userId:       auth.currentUser.uid,
        userName:     auth.currentUser.displayName || 'Streamer',
        userAvatar:   auth.currentUser.photoURL    || null,
        viewerCount:  0,
        scheduledAt:  Timestamp.fromDate(scheduledDateTime),
        createdAt:    serverTimestamp(),
      });
      setSavedDoc({ id: docRef.id, title, date, time, desc, scheduledDateTime });
      showToast('📅 Stream scheduled!');
    } catch (err) {
      console.error('[ScheduleSave]', err);
      showToast('Failed to schedule stream');
    } finally {
      setSaving(false);
    }
  };

  // MISSING-8 FIX: Add to Google Calendar
  const addToGoogleCalendar = () => {
    if (!savedDoc) return;
    const start = savedDoc.scheduledDateTime;
    const end   = new Date(start.getTime() + 60 * 60 * 1000); // +1 hour
    const fmt   = d => d.toISOString().replace(/[-:]/g,'').replace('.000','');
    const url   = `https://calendar.google.com/calendar/render?action=TEMPLATE` +
      `&text=${encodeURIComponent(`🔴 LIVE: ${savedDoc.title}`)}` +
      `&dates=${fmt(start)}/${fmt(end)}` +
      `&details=${encodeURIComponent(savedDoc.desc || 'Live stream on ConnectHub')}` +
      `&sf=true&output=xml`;
    window.open(url, '_blank');
  };

  // MISSING-8 FIX: Download ICS file
  const downloadICS = () => {
    if (!savedDoc) return;
    const start = savedDoc.scheduledDateTime;
    const end   = new Date(start.getTime() + 60 * 60 * 1000);
    const fmt   = d => d.toISOString().replace(/[-:]/g,'').split('.')[0] + 'Z';
    const ics   = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART:${fmt(start)}`,
      `DTEND:${fmt(end)}`,
      `SUMMARY:🔴 LIVE: ${savedDoc.title}`,
      `DESCRIPTION:${savedDoc.desc || 'Live stream on ConnectHub'}`,
      `URL:${window.location.origin}/live/watch/${savedDoc.id}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
    const blob = new Blob([ics], { type: 'text/calendar' });
    const a    = document.createElement('a');
    a.href     = URL.createObjectURL(blob);
    a.download = `stream-${savedDoc.id}.ics`;
    a.click();
    showToast('📅 Calendar file downloaded!');
  };

  const isValid = title && date && time;

  return (
    <div style={{ background:'var(--bg-primary,#0a0a18)', minHeight:'100vh', paddingBottom:'80px' }}>
      <div style={{ padding:'16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', gap:'12px' }}>
        <button onClick={() => navigate(-1)} style={{ background:'none', border:'none', color:'#94a3b8', fontSize:'20px', cursor:'pointer' }}>←</button>
        <span style={{ fontSize:'18px', fontWeight:800, color:'#f1f5f9' }}>📅 Schedule a Stream</span>
      </div>

      <div style={{ padding:'20px 16px' }}>

        {/* Header card */}
        <div style={{ background:'linear-gradient(135deg,#1e40af,#3b82f6)', borderRadius:'18px', padding:'16px', marginBottom:'24px', textAlign:'center' }}>
          <div style={{ fontSize:'28px', marginBottom:'6px' }}>📅</div>
          <div style={{ color:'white', fontWeight:700, fontSize:'15px' }}>Plan your next stream in advance</div>
          <div style={{ color:'rgba(255,255,255,0.75)', fontSize:'12px', marginTop:'4px' }}>Followers will be notified when your stream goes live.</div>
        </div>

        {/* If saved, show calendar options */}
        {savedDoc ? (
          <div>
            <div style={{ background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', borderRadius:'16px', padding:'20px', textAlign:'center', marginBottom:'20px' }}>
              <div style={{ fontSize:'40px', marginBottom:'10px' }}>✅</div>
              <div style={{ color:'#10b981', fontWeight:800, fontSize:'18px', marginBottom:'4px' }}>Stream Scheduled!</div>
              <div style={{ color:'#f1f5f9', fontWeight:600, fontSize:'14px' }}>{savedDoc.title}</div>
              <div style={{ color:'#94a3b8', fontSize:'12px', marginTop:'4px' }}>
                {new Date(`${savedDoc.date}T${savedDoc.time}`).toLocaleString('en-US', { weekday:'long', month:'long', day:'numeric', hour:'numeric', minute:'2-digit' })}
              </div>
            </div>

            {/* MISSING-8 FIX: Calendar buttons */}
            <div style={{ marginBottom:'20px' }}>
              <div style={{ fontSize:'12px', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'10px' }}>📅 Add to Calendar</div>
              <div style={{ display:'flex', gap:'10px' }}>
                <button onClick={addToGoogleCalendar}
                  style={{ flex:1, background:'linear-gradient(135deg,#4285f4,#34a853)', border:'none', borderRadius:'12px', padding:'12px', color:'white', fontWeight:700, fontSize:'13px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px' }}>
                  📆 Google Calendar
                </button>
                <button onClick={downloadICS}
                  style={{ flex:1, background:'#1e293b', border:'1px solid #334155', borderRadius:'12px', padding:'12px', color:'#f1f5f9', fontWeight:700, fontSize:'13px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px' }}>
                  📥 Download .ics
                </button>
              </div>
            </div>

            <div style={{ display:'flex', gap:'10px' }}>
              <button onClick={() => setSavedDoc(null)} style={{ flex:1, background:'#1e293b', border:'none', borderRadius:'12px', padding:'12px', color:'#94a3b8', fontWeight:700, cursor:'pointer' }}>
                + Schedule Another
              </button>
              <button onClick={() => navigate('/live')} style={{ flex:1, background:'linear-gradient(135deg,#ef4444,#f59e0b)', border:'none', borderRadius:'12px', padding:'12px', color:'white', fontWeight:700, cursor:'pointer' }}>
                ← Back to Live
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Form fields */}
            {[
              { label:'Stream Title *', value:title, set:setTitle, placeholder:'e.g. Morning Workout Live', type:'text' },
              { label:'Date *',          value:date,  set:setDate,  placeholder:'',                         type:'date' },
              { label:'Time *',          value:time,  set:setTime,  placeholder:'',                         type:'time' },
            ].map(f => (
              <div key={f.label} style={{ marginBottom:'14px' }}>
                <label style={{ display:'block', fontSize:'12px', fontWeight:700, color:'#94a3b8', marginBottom:'6px' }}>{f.label}</label>
                <input type={f.type} value={f.value} onChange={e=>f.set(e.target.value)} placeholder={f.placeholder}
                  style={{ width:'100%', background:'#1e293b', border:'1px solid #334155', borderRadius:'12px', padding:'12px 14px', color:'#f1f5f9', fontSize:'14px', outline:'none', boxSizing:'border-box' }} />
              </div>
            ))}

            {/* Category */}
            <div style={{ marginBottom:'14px' }}>
              <label style={{ display:'block', fontSize:'12px', fontWeight:700, color:'#94a3b8', marginBottom:'6px' }}>Category</label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                {CATEGORIES.map(cat => {
                  const cid = cat.replace(/[^a-zA-Z]/g,'').toLowerCase();
                  return (
                    <button key={cid} onClick={() => setCategory(cid)}
                      style={{ padding:'6px 14px', borderRadius:'16px', border:'none', fontSize:'12px', fontWeight:600, cursor:'pointer',
                        background: category===cid ? 'linear-gradient(135deg,#ef4444,#f59e0b)' : '#1e293b',
                        color: category===cid ? 'white' : '#94a3b8' }}>
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom:'20px' }}>
              <label style={{ display:'block', fontSize:'12px', fontWeight:700, color:'#94a3b8', marginBottom:'6px' }}>Description (Optional)</label>
              <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Tell viewers what to expect..." rows={3}
                style={{ width:'100%', background:'#1e293b', border:'1px solid #334155', borderRadius:'12px', padding:'12px', color:'#f1f5f9', fontSize:'13px', outline:'none', resize:'none', boxSizing:'border-box' }} />
            </div>

            {/* BUG-7 FIX: Save to Firestore */}
            <button onClick={handleSave} disabled={!isValid || saving}
              style={{ width:'100%', border:'none', borderRadius:'14px', padding:'14px', fontWeight:800, fontSize:'15px',
                cursor: (!isValid||saving) ? 'default' : 'pointer',
                background: saving ? '#334155' : !isValid ? '#334155' : 'linear-gradient(135deg,#1e40af,#3b82f6)',
                color:'white', opacity: (!isValid||saving) ? 0.6 : 1 }}>
              {saving ? 'Saving…' : '📅 Schedule Stream'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
