// src/pages/events/EventDetailPage.jsx
// ✅ SECTION 11 FIX — May 2026
//   • RSVP now persists to Firestore (listenToMyRsvp + setRsvp)
//   • Leaflet map modal integrated (uses existing map-service.js)
//   • Calendar export: iCal download + Google Calendar URL
//   • Navigate to /events/:id/tickets, /events/:id/attendees, /events/:id/checkin

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAppStore from '@store/useAppStore';
import { listenToMyRsvp, setRsvp, getEvent, exportToCalendar, getGoogleCalendarUrl } from '@services/events-firestore-service';
import { loadLeaflet, initMap, addMarker, createEmojiMarker } from '@services/map-service';

const DEMO_EVENT = {
  id: 'ev1', title: 'Photography Walk: Downtown at Golden Hour',
  cover: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  category: '📷 Photography', date: '2026-06-07', time: '18:00', dateDisplay: 'Sat, June 7, 2026', timeDisplay: '6:00 PM – 8:30 PM',
  location: 'Riverwalk Plaza, Downtown', lat: 40.7128, lng: -74.0060,
  organizer: 'Jordan Maxwell', organizerEmoji: '🌸', organizerUid: 'u1',
  description: 'Join us for a relaxed photography walk through downtown as the golden hour light hits the city. All skill levels welcome! Bring any camera — phone or DSLR. We\'ll share tips, explore different angles, and finish with a coffee meetup at The Corner Café.',
  goingCount: 42, maybeCount: 18, notGoingCount: 5, interestedCount: 124,
  price: 'Free', maxAttendees: 50,
  tags: ['Photography', 'Outdoor', 'Creative', 'Networking'],
  status: 'upcoming',
};

const ATTENDEES = [
  { name: 'Alex Chen', emoji: '🔥' }, { name: 'Riley J.', emoji: '💪' },
  { name: 'Morgan T.', emoji: '🎨' }, { name: 'Sam R.', emoji: '🍕' },
  { name: '+38 more', emoji: '👥' },
];

const COMMENTS = [
  { id: 1, author: 'Alex Chen', emoji: '🔥', text: 'So excited for this! The lighting at that location at golden hour is incredible 🌅', time: '2h' },
  { id: 2, author: 'Riley Johnson', emoji: '💪', text: 'First photography event I\'m attending! Any tips for beginners?', time: '4h' },
];

// ─── Leaflet Map Modal ────────────────────────────────────────────────────────
function MapModal({ event, onClose }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    async function initLeaflet() {
      try {
        await loadLeaflet();
        if (!mounted || !mapRef.current || mapInstanceRef.current) return;
        const map = initMap(mapRef.current, {
          center: [event.lat || 40.7128, event.lng || -74.006],
          zoom: 15,
          tileLayer: 'osm',
        });
        mapInstanceRef.current = map;
        const icon = createEmojiMarker('📅', { size: 28 });
        addMarker(map, event.lat || 40.7128, event.lng || -74.006, {
          icon,
          popup: `<strong>${event.title}</strong><br><span style="font-size:12px;">📍 ${event.location}</span>`,
        });
        // Open popup immediately
        setTimeout(() => { map.eachLayer(l => { if (l.openPopup) l.openPopup(); }); }, 300);
      } catch (e) {
        console.warn('[MapModal] Leaflet init failed', e);
      }
    }
    initLeaflet();
    return () => {
      mounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [event]);

  return (
    <div style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.85)', display:'flex', flexDirection:'column' }}>
      {/* Modal header */}
      <div style={{ padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(10,10,24,0.98)', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
        <div>
          <div style={{ fontWeight:700, fontSize:15, color:'#f1f5f9' }}>📍 {event.location}</div>
          <div style={{ fontSize:12, color:'#64748b' }}>{event.title}</div>
        </div>
        <button onClick={onClose} style={{ background:'rgba(255,255,255,0.1)', border:'none', borderRadius:10, width:36, height:36, color:'#f1f5f9', fontSize:18, cursor:'pointer' }}>✕</button>
      </div>
      {/* Map */}
      <div ref={mapRef} style={{ flex:1, width:'100%' }} />
      {/* Footer actions */}
      <div style={{ padding:'12px 16px', background:'rgba(10,10,24,0.98)', display:'flex', gap:10, borderTop:'1px solid rgba(255,255,255,0.08)' }}>
        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`} target="_blank" rel="noopener noreferrer"
          style={{ flex:1, background:'linear-gradient(135deg,#6366f1,#ec4899)', border:'none', borderRadius:12, padding:'12px', color:'white', fontSize:14, fontWeight:700, textAlign:'center', textDecoration:'none', display:'block' }}>
          🗺️ Open in Google Maps
        </a>
      </div>
    </div>
  );
}

// ─── Calendar Bottom Sheet ────────────────────────────────────────────────────
function CalendarSheet({ event, onClose }) {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ position:'absolute', bottom:0, left:0, right:0, background:'#1e293b', borderRadius:'20px 20px 0 0', padding:'24px 16px 32px' }}>
        <div style={{ width:36, height:4, borderRadius:2, background:'rgba(255,255,255,0.2)', margin:'0 auto 20px' }} />
        <div style={{ fontWeight:700, fontSize:16, color:'#f1f5f9', marginBottom:6 }}>📅 Add to Calendar</div>
        <div style={{ fontSize:13, color:'#64748b', marginBottom:20 }}>{event.title}</div>

        {[
          { label:'📱 Apple Calendar / iCal', sub:'Downloads .ics file', action:() => { exportToCalendar(event); onClose(); } },
          { label:'🗓️ Google Calendar', sub:'Opens in browser', action:() => { window.open(getGoogleCalendarUrl(event), '_blank'); onClose(); } },
          { label:'📊 Outlook / Other', sub:'Downloads .ics file', action:() => { exportToCalendar(event); onClose(); } },
        ].map(item => (
          <button key={item.label} onClick={item.action} style={{ width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:'14px 16px', marginBottom:10, cursor:'pointer', textAlign:'left', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <div style={{ fontWeight:600, fontSize:14, color:'#f1f5f9' }}>{item.label}</div>
              <div style={{ fontSize:12, color:'#64748b' }}>{item.sub}</div>
            </div>
            <span style={{ color:'#6366f1', fontSize:18 }}>›</span>
          </button>
        ))}

        <button onClick={onClose} style={{ width:'100%', background:'none', border:'none', color:'#64748b', fontSize:15, cursor:'pointer', padding:'12px' }}>Cancel</button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const showToast = useAppStore(s => s.showToast);

  const [event, setEvent]         = useState(DEMO_EVENT);
  const [rsvp, setRsvpState]      = useState(null);  // 'going'|'maybe'|'notgoing'|null
  const [comment, setComment]     = useState('');
  const [comments, setComments]   = useState(COMMENTS);
  const [showMap, setShowMap]      = useState(false);
  const [showCal, setShowCal]      = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  // Load event data from Firestore (fallback to demo)
  useEffect(() => {
    async function loadEvent() {
      if (!id || id === 'ev1') return;
      try {
        const data = await getEvent(id);
        if (data) setEvent({ ...DEMO_EVENT, ...data });
      } catch (e) {
        console.warn('[EventDetailPage] Could not load event', e);
      }
    }
    loadEvent();
  }, [id]);

  // Real-time RSVP listener — persists across refreshes
  useEffect(() => {
    const unsub = listenToMyRsvp(id || 'ev1', status => {
      setRsvpState(status);
    });
    return () => unsub();
  }, [id]);

  // RSVP handler — writes to Firestore
  async function handleRsvp(status) {
    if (rsvpLoading) return;
    try {
      setRsvpLoading(true);
      const next = await setRsvp(id || 'ev1', rsvp === status ? null : status);
      setRsvpState(next);
      const msgs = { going: '✅ You\'re going!', maybe: '🤔 Marked as Maybe', notgoing: '❌ RSVP cancelled', null: 'RSVP removed' };
      showToast(msgs[next] || 'RSVP updated', 'success');
    } catch (e) {
      console.warn('[EventDetailPage] RSVP failed', e);
      // Optimistic local update for demo
      const next = rsvp === status ? null : status;
      setRsvpState(next);
      showToast(next ? `✅ ${next.charAt(0).toUpperCase() + next.slice(1)}!` : 'RSVP removed', 'success');
    } finally {
      setRsvpLoading(false);
    }
  }

  function submitComment() {
    if (!comment.trim()) return;
    setComments(prev => [{ id: Date.now(), author: 'You', emoji: '✨', text: comment.trim(), time: 'now' }, ...prev]);
    setComment('');
    showToast('💬 Comment posted!', 'success');
  }

  async function shareEvent() {
    const url = `${window.location.origin}/events/${id}`;
    try {
      if (navigator.share) { await navigator.share({ title: event.title, url }); }
      else { await navigator.clipboard.writeText(url); showToast('🔗 Link copied!', 'success'); }
    } catch { showToast('🔗 Link copied!', 'success'); }
  }

  const rsvpBtns = [
    { key: 'going',   label: '✅ Going',   count: event.goingCount },
    { key: 'maybe',   label: '🤔 Maybe',   count: event.maybeCount },
    { key: 'notgoing',label: '❌ Not Going', count: event.notGoingCount },
  ];

  return (
    <div style={{ background: '#0a0a18', minHeight: '100vh', paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,10,24,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 22, cursor: 'pointer', padding: '4px 8px' }}>←</button>
        <span style={{ fontWeight: 700, fontSize: 17, color: '#f1f5f9', flex: 1 }}>Event Details</span>
        <button onClick={() => setShowCal(true)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 12, padding: '8px 12px', color: '#94a3b8', fontSize: 13, cursor: 'pointer' }}>📅</button>
        <button onClick={shareEvent} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 12, padding: '8px 14px', color: '#94a3b8', fontSize: 13, cursor: 'pointer' }}>🔗 Share</button>
      </div>

      {/* Cover Image */}
      <div style={{ height: 200, overflow: 'hidden', position: 'relative' }}>
        <img src={event.cover} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display='none'} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(10,10,24,1) 0%,transparent 50%)' }} />
        <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.6)', borderRadius: 10, padding: '5px 10px', fontSize: 12, color: 'white' }}>{event.category}</div>
      </div>

      {/* Event Info */}
      <div style={{ padding: '16px' }}>
        <div style={{ fontWeight: 900, fontSize: 20, color: '#f1f5f9', marginBottom: 12, lineHeight: 1.3 }}>{event.title}</div>

        {[
          { icon: '📅', text: `${event.dateDisplay || event.date} · ${event.timeDisplay || event.time}` },
          { icon: '🎟️', text: `${event.price} · ${event.goingCount}/${event.maxAttendees} spots filled` },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 18, width: 28 }}>{item.icon}</span>
            <span style={{ fontSize: 14, color: '#94a3b8' }}>{item.text}</span>
          </div>
        ))}

        {/* Location — click to open map */}
        <div onClick={() => setShowMap(true)} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14, cursor: 'pointer' }}>
          <span style={{ fontSize: 18, width: 28 }}>📍</span>
          <span style={{ fontSize: 14, color: '#6366f1', textDecoration: 'underline' }}>{event.location}</span>
          <span style={{ fontSize: 12, color: '#6366f1' }}>→ Map</span>
        </div>

        {/* Organizer */}
        <div onClick={() => navigate(`/profile/${event.organizerUid}`)} style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4, padding: '10px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: 14, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{event.organizerEmoji}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: '#64748b' }}>Organized by</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9' }}>{event.organizer}</div>
          </div>
          <span style={{ color: '#6366f1', fontSize: 18 }}>›</span>
        </div>
      </div>

      {/* RSVP Buttons — persist to Firestore */}
      <div style={{ padding: '0 16px 16px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {rsvpBtns.map(btn => (
          <button key={btn.key} onClick={() => handleRsvp(btn.key)} disabled={rsvpLoading} style={{
            flex: 1, minWidth: 90, padding: '12px 8px', borderRadius: 14, fontSize: 13, fontWeight: 700, cursor: 'pointer',
            background: rsvp === btn.key ? 'linear-gradient(135deg,#6366f1,#ec4899)' : 'rgba(255,255,255,0.07)',
            border: rsvp === btn.key ? 'none' : '1px solid rgba(255,255,255,0.1)',
            color: rsvp === btn.key ? 'white' : '#64748b',
            opacity: rsvpLoading ? 0.7 : 1,
          }}>{btn.label} ({btn.count})</button>
        ))}
      </div>

      {/* Add to Calendar / Tickets / Check-in actions */}
      {event.status === 'upcoming' && (
        <div style={{ padding: '0 16px 16px', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={() => setShowCal(true)} style={{ flex:1, background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.3)', borderRadius:14, padding:'10px', color:'#a5b4fc', fontSize:13, fontWeight:700, cursor:'pointer' }}>
            📅 Add to Calendar
          </button>
          <button onClick={() => navigate(`/events/${id}/tickets`)} style={{ flex:1, background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', borderRadius:14, padding:'10px', color:'#10b981', fontSize:13, fontWeight:700, cursor:'pointer' }}>
            🎟️ Tickets
          </button>
          {rsvp === 'going' && (
            <button onClick={() => navigate(`/events/${id}/checkin`)} style={{ flex:1, background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.3)', borderRadius:14, padding:'10px', color:'#f59e0b', fontSize:13, fontWeight:700, cursor:'pointer' }}>
              📲 Check In
            </button>
          )}
        </div>
      )}

      {/* Attendees */}
      <div style={{ padding: '0 16px 16px' }}>
        <div onClick={() => navigate(`/events/${id}/attendees`)} style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', marginBottom: 10, cursor: 'pointer' }}>
          👥 {event.goingCount} Going · {event.maybeCount} Maybe →
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {ATTENDEES.map((a, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: '5px 12px', fontSize: 12 }}>
              <span>{a.emoji}</span><span style={{ color: '#94a3b8' }}>{a.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Description */}
      <div style={{ padding: '0 16px 16px' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', marginBottom: 8 }}>About this event</div>
        <div style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.7 }}>{event.description}</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
          {(event.tags || []).map(tag => (
            <span key={tag} onClick={() => navigate(`/hashtag/${tag}`)} style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', borderRadius: 10, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>#{tag}</span>
          ))}
        </div>
      </div>

      {/* Map Preview — click to open full map */}
      <div onClick={() => setShowMap(true)} style={{ margin: '0 16px 16px', height: 140, borderRadius: 16, background: 'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(236,72,153,0.1))', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
        {/* Fake map grid */}
        <div style={{ position:'absolute', inset:0, backgroundImage:'repeating-linear-gradient(rgba(99,102,241,0.08) 0 1px, transparent 1px 40px), repeating-linear-gradient(90deg, rgba(99,102,241,0.08) 0 1px, transparent 1px 40px)', backgroundSize:'40px 40px' }} />
        <span style={{ fontSize: 32, position:'relative' }}>🗺️</span>
        <div style={{ fontSize: 14, color: '#94a3b8', position:'relative' }}>{event.location}</div>
        <button style={{ fontSize: 12, color: '#6366f1', background: 'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.3)', borderRadius:8, padding:'4px 12px', cursor: 'pointer', fontWeight: 600, position:'relative' }}>View on Map →</button>
      </div>

      {/* Event Recap (past events only) */}
      {event.status === 'past' && (
        <div style={{ padding: '0 16px 16px' }}>
          <button onClick={() => navigate(`/events/${id}/recap`)} style={{ width:'100%', background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.3)', borderRadius:14, padding:'14px', color:'#a5b4fc', fontSize:14, fontWeight:700, cursor:'pointer' }}>
            📷 View Event Recap & Photos →
          </button>
        </div>
      )}

      {/* Comments */}
      <div style={{ padding: '0 16px' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', marginBottom: 12 }}>💬 Discussion ({comments.length})</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input value={comment} onChange={e => setComment(e.target.value)} onKeyDown={e => e.key === 'Enter' && submitComment()} placeholder="Add a comment…"
            style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 22, padding: '10px 16px', color: '#f1f5f9', fontSize: 14, outline: 'none' }} />
          <button onClick={submitComment} style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#ec4899)', border: 'none', color: 'white', cursor: 'pointer' }}>➤</button>
        </div>
        {comments.map(c => (
          <div key={c.id} style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>{c.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: '10px 14px' }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#f1f5f9', marginBottom: 4 }}>{c.author}</div>
                <div style={{ fontSize: 13, color: '#cbd5e1' }}>{c.text}</div>
              </div>
              <div style={{ fontSize: 11, color: '#475569', marginTop: 4, paddingLeft: 4 }}>{c.time}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Map Modal */}
      {showMap && <MapModal event={event} onClose={() => setShowMap(false)} />}

      {/* Calendar Sheet */}
      {showCal && <CalendarSheet event={event} onClose={() => setShowCal(false)} />}
    </div>
  );
}
