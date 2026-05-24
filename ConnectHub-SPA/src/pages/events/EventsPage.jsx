// PAGE 12 — EVENTS SCREEN
// ✅ SECTION 11 FIX — May 2026
//   • "Create" button now navigates to /events/create (was showToast only)
//   • "My Events" filter tab now navigates to /events/mine (was broken)
//   • Event cards navigate to /events/:id on tap
//   • RSVP persisted via events-firestore-service (Firestore)
//   • Real Firestore data with local demo fallback

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '@store/useAppStore';
import { getUpcomingEvents, setRsvp, getMyRsvp } from '@services/events-firestore-service';

// Demo events used if Firestore returns empty (dev/offline mode)
const DEMO_EVENTS = [
  { id:'ev1', title:'Tech Meetup 2026', date:'May 15', time:'7:00 PM', location:'Downtown Hub', status:'upcoming', price:'Free', img:'💻', goingCount:24, maybeCount:8 },
  { id:'ev2', title:'Art Exhibition', date:'May 18', time:'2:00 PM', location:'Gallery District', status:'upcoming', price:'$15', img:'🎨', goingCount:41, maybeCount:12 },
  { id:'ev3', title:'Startup Pitch Night', date:'May 22', time:'6:00 PM', location:'Innovation Center', status:'upcoming', price:'Free', img:'🚀', goingCount:18, maybeCount:6 },
  { id:'ev4', title:'Summer BBQ Blast', date:'Apr 20', time:'12:00 PM', location:'City Park', status:'past', price:'Free', img:'🌞', photos:42 },
  { id:'ev5', title:'Hackathon 2026', date:'Apr 10', time:'9:00 AM', location:'Tech Campus', status:'past', price:'Free', img:'⌨️', photos:128 },
];

const FILTERS = ['All', 'Upcoming', 'Past', 'My Events'];

export default function EventsPage() {
  const navigate = useNavigate();
  const showToast = useAppStore((s) => s.showToast);
  const [filter, setFilter]   = useState('All');
  const [search, setSearch]   = useState('');
  const [events, setEvents]   = useState(DEMO_EVENTS);
  const [rsvpMap, setRsvpMap] = useState({});   // { eventId: 'going' | 'maybe' | null }
  const [loading, setLoading] = useState(false);

  // Load events from Firestore
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getUpcomingEvents(20);
        if (data.length) {
          setEvents([...data, ...DEMO_EVENTS.filter(d => d.status === 'past')]);
        }
      } catch (e) {
        console.warn('[EventsPage] Firestore load failed — using demo data', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Handle My Events tab → navigate instead of filtering
  function handleFilterClick(f) {
    if (f === 'My Events') {
      navigate('/events/mine');
    } else {
      setFilter(f);
    }
  }

  const filtered = events.filter(e => {
    if (filter === 'Upcoming') return e.status === 'upcoming';
    if (filter === 'Past')     return e.status === 'past';
    if (search) return e.title.toLowerCase().includes(search.toLowerCase());
    return true;
  });

  // RSVP toggle — persists to Firestore
  async function handleRsvp(eventId, status) {
    try {
      const current = rsvpMap[eventId] || null;
      const next    = current === status ? null : status;
      setRsvpMap(prev => ({ ...prev, [eventId]: next }));
      await setRsvp(eventId, next);
      showToast(next ? `${next.charAt(0).toUpperCase() + next.slice(1)} RSVP saved!` : 'RSVP removed');
    } catch (e) {
      console.warn('[EventsPage] RSVP error', e);
      showToast('RSVP saved locally');
    }
  }

  const rsvpColor = { going: '#10b981', maybe: '#f59e0b', interested: '#f59e0b' };

  return (
    <div style={{ background:'#0f172a', minHeight:'100vh', paddingBottom:'100px' }}>
      {/* Header */}
      <div style={{ padding:'16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize:'20px', fontWeight:700, color:'#f1f5f9' }}>📅 Events</span>
        <div style={{ display:'flex', gap:'8px' }}>
          {/* Calendar View */}
          <button onClick={() => showToast('Calendar view — coming soon')} style={{ background:'#1e293b', border:'none', borderRadius:'10px', padding:'8px 12px', color:'#94a3b8', fontSize:'16px', cursor:'pointer' }}>📅</button>
          {/* Create Event — FIXED: now navigates to /events/create */}
          <button onClick={() => navigate('/events/create')} style={{ background:'#6366f1', border:'none', borderRadius:'10px', padding:'8px 14px', color:'white', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>+ Create</button>
        </div>
      </div>

      {/* Search */}
      <div style={{ padding:'12px 16px' }}>
        <div style={{ display:'flex', alignItems:'center', background:'#1e293b', borderRadius:'12px', padding:'0 14px', border:'1px solid #334155' }}>
          <span style={{ fontSize:'16px', marginRight:'8px', flexShrink:0 }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search Events..." style={{ background:'none', border:'none', outline:'none', color:'#f1f5f9', fontSize:'14px', flex:1, padding:'12px 0' }} />
        </div>
      </div>

      {/* Filter Tabs — "My Events" navigates away */}
      <div style={{ display:'flex', gap:'8px', padding:'0 16px', marginBottom:'12px', overflowX:'auto' }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => handleFilterClick(f)} style={{ background: filter===f ? '#6366f1' : '#1e293b', color: filter===f ? 'white' : '#94a3b8', border:'none', borderRadius:'20px', padding:'7px 16px', fontSize:'12px', fontWeight:600, cursor:'pointer', flexShrink:0 }}>
            {f}
          </button>
        ))}
      </div>

      {/* Loading indicator */}
      {loading && <div style={{ textAlign:'center', padding:'20px', color:'#64748b', fontSize:'13px' }}>Loading events…</div>}

      {/* Events List */}
      <div style={{ padding:'0 16px' }}>
        {filtered.map(event => (
          <div key={event.id} style={{ background:'#1e293b', borderRadius:'20px', overflow:'hidden', marginBottom:'12px' }}>
            {/* Card Header — clicking navigates to event detail */}
            <div onClick={() => navigate(`/events/${event.id}`)} style={{ padding:'16px', display:'flex', gap:'14px', alignItems:'flex-start', cursor:'pointer' }}>
              <div style={{ width:'56px', height:'56px', borderRadius:'14px', background:'linear-gradient(135deg,#6366f1,#ec4899)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'26px', flexShrink:0 }}>{event.img}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:800, color:'#f1f5f9', fontSize:'15px', lineHeight:'1.2' }}>{event.title}</div>
                <div style={{ color:'#64748b', fontSize:'12px', marginTop:'4px' }}>📅 {event.date} · ⏰ {event.time}</div>
                <div style={{ color:'#64748b', fontSize:'12px', marginTop:'2px' }}>📍 {event.location}</div>
                <div style={{ display:'flex', gap:'8px', marginTop:'6px', alignItems:'center' }}>
                  <span style={{ background: event.price==='Free'?'rgba(16,185,129,0.15)':'rgba(245,158,11,0.15)', color:event.price==='Free'?'#10b981':'#f59e0b', fontSize:'11px', fontWeight:700, borderRadius:'8px', padding:'2px 8px' }}>{event.price}</span>
                  {event.status === 'upcoming' && <span style={{ background:'rgba(99,102,241,0.15)', color:'#6366f1', fontSize:'11px', fontWeight:700, borderRadius:'8px', padding:'2px 8px' }}>Upcoming</span>}
                  {event.status === 'past' && <span style={{ background:'rgba(100,116,139,0.15)', color:'#64748b', fontSize:'11px', fontWeight:700, borderRadius:'8px', padding:'2px 8px' }}>Past</span>}
                  {(event.goingCount > 0) && <span style={{ color:'#64748b', fontSize:'11px' }}>👥 {event.goingCount} going</span>}
                </div>
              </div>
            </div>

            {/* Upcoming event RSVP buttons */}
            {event.status === 'upcoming' && (
              <div style={{ borderTop:'1px solid #0f172a', padding:'10px 14px', display:'flex', gap:'8px', flexWrap:'wrap' }}>
                {/* Going */}
                <button onClick={() => handleRsvp(event.id, 'going')} style={{ flex:1, background: rsvpMap[event.id]==='going'?'rgba(16,185,129,0.2)':'transparent', color: rsvpMap[event.id]==='going'?'#10b981':'#94a3b8', border:`1px solid ${rsvpMap[event.id]==='going'?'#10b981':'#334155'}`, borderRadius:'10px', padding:'8px', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>
                  ✓ Going
                </button>
                {/* Maybe */}
                <button onClick={() => handleRsvp(event.id, 'maybe')} style={{ flex:1, background: rsvpMap[event.id]==='maybe'?'rgba(245,158,11,0.2)':'transparent', color: rsvpMap[event.id]==='maybe'?'#f59e0b':'#94a3b8', border:`1px solid ${rsvpMap[event.id]==='maybe'?'#f59e0b':'#334155'}`, borderRadius:'10px', padding:'8px', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>
                  ⭐ Interested
                </button>
                {/* Share */}
                <button onClick={() => { navigator.clipboard?.writeText(`${window.location.origin}/events/${event.id}`); showToast('Link copied!'); }} style={{ background:'transparent', color:'#94a3b8', border:'1px solid #334155', borderRadius:'10px', padding:'8px 12px', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>
                  🔗
                </button>
              </div>
            )}

            {/* Going-state extra actions */}
            {event.status === 'upcoming' && rsvpMap[event.id] === 'going' && (
              <div style={{ borderTop:'1px solid #0f172a', padding:'10px 14px', display:'flex', gap:'8px', flexWrap:'wrap' }}>
                <button onClick={() => navigate(`/events/${event.id}/attendees`)} style={{ flex:1, background:'#0f172a', color:'#6366f1', border:'1px solid #1e293b', borderRadius:'10px', padding:'7px', fontSize:'11px', fontWeight:600, cursor:'pointer' }}>👥 Guests</button>
                <button onClick={() => showToast('Event chat — coming soon')} style={{ flex:1, background:'#0f172a', color:'#6366f1', border:'1px solid #1e293b', borderRadius:'10px', padding:'7px', fontSize:'11px', fontWeight:600, cursor:'pointer' }}>💬 Chat</button>
                <button onClick={() => navigate(`/events/${event.id}/tickets`)} style={{ flex:1, background:'rgba(99,102,241,0.15)', color:'#6366f1', border:'1px solid #6366f1', borderRadius:'10px', padding:'7px', fontSize:'11px', fontWeight:700, cursor:'pointer' }}>🎟️ Tickets</button>
              </div>
            )}

            {/* Past event buttons */}
            {event.status === 'past' && (
              <div style={{ borderTop:'1px solid #0f172a', padding:'10px 14px', display:'flex', gap:'8px' }}>
                <button onClick={() => navigate(`/events/${event.id}/recap`)} style={{ flex:1, background:'#0f172a', color:'#94a3b8', border:'1px solid #334155', borderRadius:'10px', padding:'8px', fontSize:'12px', fontWeight:600, cursor:'pointer' }}>
                  📷 Photos {event.photos ? `(${event.photos})` : ''}
                </button>
                <button onClick={() => showToast('Memories loading…')} style={{ flex:1, background:'#0f172a', color:'#94a3b8', border:'1px solid #334155', borderRadius:'10px', padding:'8px', fontSize:'12px', fontWeight:600, cursor:'pointer' }}>
                  💭 Memories
                </button>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && !loading && (
          <div style={{ textAlign:'center', padding:'40px', color:'#64748b' }}>
            <div style={{ fontSize:'36px', marginBottom:'12px' }}>📅</div>
            <div style={{ fontSize:'15px', fontWeight:600 }}>No events found</div>
            <div style={{ fontSize:'13px', marginTop:'6px' }}>Try a different filter or create one!</div>
            <button onClick={() => navigate('/events/create')} style={{ marginTop:'16px', background:'#6366f1', border:'none', borderRadius:'12px', padding:'10px 24px', color:'white', fontSize:'14px', fontWeight:700, cursor:'pointer' }}>+ Create Event</button>
          </div>
        )}
      </div>
    </div>
  );
}
