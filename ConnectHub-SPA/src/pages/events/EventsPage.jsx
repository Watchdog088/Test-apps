// PAGE 12 — EVENTS SCREEN (26 buttons per layout reference)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '@store/useAppStore';

const EVENTS = [
  { id:1, title:'Tech Meetup 2026', date:'May 15', time:'7:00 PM', location:'Downtown Hub', type:'upcoming', price:'Free', img:'💻', rsvp:'Going' },
  { id:2, title:'Art Exhibition', date:'May 18', time:'2:00 PM', location:'Gallery District', type:'upcoming', price:'$15', img:'🎨', rsvp:null },
  { id:3, title:'Startup Pitch Night', date:'May 22', time:'6:00 PM', location:'Innovation Center', type:'upcoming', price:'Free', img:'🚀', rsvp:'Interested' },
  { id:4, title:'Summer BBQ Blast', date:'Apr 20', time:'12:00 PM', location:'City Park', type:'past', price:'Free', img:'🌞', photos:42 },
  { id:5, title:'Hackathon 2026', date:'Apr 10', time:'9:00 AM', location:'Tech Campus', type:'past', price:'Free', img:'⌨️', photos:128 },
];

const FILTERS = ['All', 'Upcoming', 'Past', 'My Events'];

export default function EventsPage() {
  const navigate = useNavigate();
  const showToast = useAppStore((s) => s.showToast);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [rsvpState, setRsvpState] = useState({ 1:'Going', 3:'Interested' });

  const filtered = EVENTS.filter(e => {
    if (filter === 'Upcoming') return e.type === 'upcoming';
    if (filter === 'Past') return e.type === 'past';
    if (search) return e.title.toLowerCase().includes(search.toLowerCase());
    return true;
  });

  const handleRsvp = (id, status) => {
    setRsvpState(prev => ({ ...prev, [id]: prev[id] === status ? null : status }));
    showToast(`${status === rsvpState[id] ? 'Removed' : status} RSVP`);
  };

  return (
    <div style={{ background:'#0f172a', minHeight:'100vh', paddingBottom:'100px' }}>
      {/* Header */}
      <div style={{ padding:'16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize:'20px', fontWeight:700, color:'#f1f5f9' }}>📅 Events</span>
        <div style={{ display:'flex', gap:'8px' }}>
          {/* Calendar View button */}
          <button onClick={() => showToast('Calendar view opening...')} style={{ background:'#1e293b', border:'none', borderRadius:'10px', padding:'8px 12px', color:'#94a3b8', fontSize:'16px', cursor:'pointer' }}>📅</button>
          {/* Create Event button */}
          <button onClick={() => showToast('Create Event modal opening...')} style={{ background:'#6366f1', border:'none', borderRadius:'10px', padding:'8px 14px', color:'white', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>+ Create</button>
        </div>
      </div>

      {/* Search Events */}
      <div style={{ padding:'12px 16px' }}>
        <div style={{ display:'flex', alignItems:'center', background:'#1e293b', borderRadius:'12px', padding:'0 14px', border:'1px solid #334155' }}>
          <span style={{ fontSize:'16px', marginRight:'8px', flexShrink:0 }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search Events..." style={{ background:'none', border:'none', outline:'none', color:'#f1f5f9', fontSize:'14px', flex:1, padding:'12px 0' }} />
        </div>
      </div>

      {/* Filter Tabs (5 upcoming / 2 past / All) */}
      <div style={{ display:'flex', gap:'8px', padding:'0 16px', marginBottom:'12px', overflowX:'auto' }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ background: filter===f ? '#6366f1' : '#1e293b', color: filter===f ? 'white' : '#94a3b8', border:'none', borderRadius:'20px', padding:'7px 16px', fontSize:'12px', fontWeight:600, cursor:'pointer', flexShrink:0 }}>
            {f} {f==='Upcoming'?'(5)':f==='Past'?'(2)':''}
          </button>
        ))}
      </div>

      {/* Events List */}
      <div style={{ padding:'0 16px' }}>
        {filtered.map(event => (
          <div key={event.id} style={{ background:'#1e293b', borderRadius:'20px', overflow:'hidden', marginBottom:'12px' }}>
            {/* Event Card Header */}
            <div style={{ padding:'16px', display:'flex', gap:'14px', alignItems:'flex-start' }}>
              <div style={{ width:'56px', height:'56px', borderRadius:'14px', background:'linear-gradient(135deg,#6366f1,#ec4899)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'26px', flexShrink:0 }}>{event.img}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:800, color:'#f1f5f9', fontSize:'15px', lineHeight:'1.2' }}>{event.title}</div>
                <div style={{ color:'#64748b', fontSize:'12px', marginTop:'4px' }}>📅 {event.date} · ⏰ {event.time}</div>
                <div style={{ color:'#64748b', fontSize:'12px', marginTop:'2px' }}>📍 {event.location}</div>
                <div style={{ display:'flex', gap:'8px', marginTop:'6px', alignItems:'center' }}>
                  <span style={{ background: event.price==='Free'?'rgba(16,185,129,0.15)':'rgba(245,158,11,0.15)', color:event.price==='Free'?'#10b981':'#f59e0b', fontSize:'11px', fontWeight:700, borderRadius:'8px', padding:'2px 8px' }}>{event.price}</span>
                  {event.type === 'upcoming' && <span style={{ background:'rgba(99,102,241,0.15)', color:'#6366f1', fontSize:'11px', fontWeight:700, borderRadius:'8px', padding:'2px 8px' }}>Upcoming</span>}
                  {event.type === 'past' && <span style={{ background:'rgba(100,116,139,0.15)', color:'#64748b', fontSize:'11px', fontWeight:700, borderRadius:'8px', padding:'2px 8px' }}>Past</span>}
                </div>
              </div>
            </div>

            {/* Upcoming event action buttons */}
            {event.type === 'upcoming' && (
              <div style={{ borderTop:'1px solid #0f172a', padding:'10px 14px', display:'flex', gap:'8px', flexWrap:'wrap' }}>
                {/* ✓ Going */}
                <button onClick={() => handleRsvp(event.id, 'Going')} style={{ flex:1, background: rsvpState[event.id]==='Going'?'rgba(16,185,129,0.2)':'transparent', color: rsvpState[event.id]==='Going'?'#10b981':'#94a3b8', border:`1px solid ${rsvpState[event.id]==='Going'?'#10b981':'#334155'}`, borderRadius:'10px', padding:'8px', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>
                  ✓ Going
                </button>
                {/* ⭐ Interested */}
                <button onClick={() => handleRsvp(event.id, 'Interested')} style={{ flex:1, background: rsvpState[event.id]==='Interested'?'rgba(245,158,11,0.2)':'transparent', color: rsvpState[event.id]==='Interested'?'#f59e0b':'#94a3b8', border:`1px solid ${rsvpState[event.id]==='Interested'?'#f59e0b':'#334155'}`, borderRadius:'10px', padding:'8px', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>
                  ⭐ Interested
                </button>
                {/* 🔗 Share */}
                <button onClick={() => showToast('Event shared!')} style={{ background:'transparent', color:'#94a3b8', border:'1px solid #334155', borderRadius:'10px', padding:'8px 12px', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>
                  🔗
                </button>
              </div>
            )}

            {/* Hosted event management (if going) */}
            {event.type === 'upcoming' && rsvpState[event.id] === 'Going' && (
              <div style={{ borderTop:'1px solid #0f172a', padding:'10px 14px', display:'flex', gap:'8px', flexWrap:'wrap' }}>
                <button onClick={() => showToast('Guest list opening...')} style={{ flex:1, background:'#0f172a', color:'#6366f1', border:'1px solid #1e293b', borderRadius:'10px', padding:'7px', fontSize:'11px', fontWeight:600, cursor:'pointer' }}>👥 Guests</button>
                <button onClick={() => showToast('Event chat opening...')} style={{ flex:1, background:'#0f172a', color:'#6366f1', border:'1px solid #1e293b', borderRadius:'10px', padding:'7px', fontSize:'11px', fontWeight:600, cursor:'pointer' }}>💬 Chat</button>
                <button onClick={() => showToast('Event analytics loading...')} style={{ flex:1, background:'#0f172a', color:'#6366f1', border:'1px solid #1e293b', borderRadius:'10px', padding:'7px', fontSize:'11px', fontWeight:600, cursor:'pointer' }}>📊 Stats</button>
                {event.price !== 'Free' && (
                  <button onClick={() => showToast('Ticket purchase flow...')} style={{ flex:1, background:'rgba(99,102,241,0.15)', color:'#6366f1', border:'1px solid #6366f1', borderRadius:'10px', padding:'7px', fontSize:'11px', fontWeight:700, cursor:'pointer' }}>💳 Buy Ticket</button>
                )}
              </div>
            )}

            {/* Past event buttons */}
            {event.type === 'past' && (
              <div style={{ borderTop:'1px solid #0f172a', padding:'10px 14px', display:'flex', gap:'8px' }}>
                <button onClick={() => showToast('Event album opening...')} style={{ flex:1, background:'#0f172a', color:'#94a3b8', border:'1px solid #334155', borderRadius:'10px', padding:'8px', fontSize:'12px', fontWeight:600, cursor:'pointer' }}>
                  � Photos ({event.photos})
                </button>
                <button onClick={() => showToast('Memories loading...')} style={{ flex:1, background:'#0f172a', color:'#94a3b8', border:'1px solid #334155', borderRadius:'10px', padding:'8px', fontSize:'12px', fontWeight:600, cursor:'pointer' }}>
                  💭 Memories
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
