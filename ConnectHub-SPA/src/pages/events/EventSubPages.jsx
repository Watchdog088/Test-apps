// src/pages/events/EventSubPages.jsx
// ✅ SECTION 11 NEW — May 2026
//   Contains: MyEventsPage, EventTicketsPage, EventCheckInPage, EventRecapPage

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAppStore from '@store/useAppStore';
import { getMyCreatedEvents, getMyAttendingEvents, exportToCalendar } from '@services/events-firestore-service';

const S = {
  page:  { minHeight:'100dvh', background:'#0a0a18', color:'#f1f5f9', fontFamily:'system-ui,sans-serif', paddingBottom:80 },
  hdr:   { display:'flex', alignItems:'center', gap:12, padding:'16px', borderBottom:'1px solid rgba(255,255,255,0.07)', position:'sticky', top:0, background:'rgba(10,10,24,0.95)', backdropFilter:'blur(20px)', zIndex:10 },
  back:  { background:'rgba(255,255,255,0.08)', border:'none', borderRadius:10, padding:'8px 14px', color:'#f1f5f9', fontSize:18, cursor:'pointer' },
  title: { fontSize:17, fontWeight:700, color:'#f1f5f9' },
  btn:   { background:'linear-gradient(135deg,#6366f1,#ec4899)', border:'none', borderRadius:12, padding:'10px 20px', color:'#fff', fontWeight:700, cursor:'pointer', fontSize:14 },
  btnO:  { background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:12, padding:'10px 20px', color:'#f1f5f9', fontWeight:600, cursor:'pointer', fontSize:14 },
  card:  { background:'rgba(255,255,255,0.04)', borderRadius:16, padding:16, margin:'10px 16px', border:'1px solid rgba(255,255,255,0.07)' },
  tab:   (active) => ({ background:active?'rgba(99,102,241,0.25)':'rgba(255,255,255,0.05)', border:active?'1px solid #6366f1':'1px solid rgba(255,255,255,0.1)', borderRadius:20, padding:'7px 16px', color:active?'#a5b4fc':'#94a3b8', fontSize:13, cursor:'pointer', flexShrink:0 }),
};

const DEMO_ATTENDING = [
  { id:'ev1', title:'Tech Meetup 2026', date:'June 15', time:'6:00 PM', location:'DC Tech Hub', status:'upcoming', img:'💻' },
  { id:'ev2', title:'Rooftop Mixer', date:'June 22', time:'7:00 PM', location:'Rooftop Bar DC', status:'upcoming', img:'🥂' },
];
const DEMO_CREATED = [
  { id:'ev3', title:'Dev Hangout', date:'June 10', time:'5:00 PM', location:'Virtual · Zoom', status:'upcoming', img:'⌨️', goingCount:8 },
];
const DEMO_PAST = [
  { id:'ev4', title:'Spring Social', date:'Apr 12', time:'6:00 PM', location:'City Park', status:'past', img:'🌸', goingCount:32 },
];

// ══════════════════════════════════════════════════════════════
//  MY EVENTS PAGE — /events/mine
// ══════════════════════════════════════════════════════════════
export function MyEventsPage() {
  const navigate  = useNavigate();
  const showToast = useAppStore(s => s.showToast);
  const [tab, setTab]           = useState('attending');
  const [attending, setAttending] = useState(DEMO_ATTENDING);
  const [created, setCreated]   = useState(DEMO_CREATED);
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [att, cre] = await Promise.all([getMyAttendingEvents(), getMyCreatedEvents()]);
        if (att.length) setAttending(att);
        if (cre.length) setCreated(cre);
      } catch (e) { /* demo fallback */ }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const list = tab === 'attending' ? attending : tab === 'created' ? created : DEMO_PAST;

  return (
    <div style={S.page}>
      <div style={S.hdr}>
        <button style={S.back} onClick={() => navigate(-1)}>←</button>
        <span style={S.title}>📅 My Events</span>
        <button onClick={() => navigate('/events/create')} style={{ ...S.btn, marginLeft:'auto', padding:'8px 14px', fontSize:13 }}>+ Create</button>
      </div>

      {/* Stats row */}
      <div style={{ display:'flex', gap:8, padding:'12px 16px' }}>
        {[['📅', attending.length, 'Going'], ['🎤', created.length, 'Hosting'], ['⏪', DEMO_PAST.length, 'Past']].map(([icon, n, label]) => (
          <div key={label} style={{ flex:1, background:'rgba(255,255,255,0.04)', borderRadius:14, padding:'12px 8px', textAlign:'center', border:'1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ fontSize:20 }}>{icon}</div>
            <div style={{ fontSize:18, fontWeight:800, color:'#f1f5f9' }}>{n}</div>
            <div style={{ fontSize:11, color:'#64748b' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', padding:'0 16px 12px', gap:8, overflowX:'auto' }}>
        {[['attending','Going'],['created','Hosting'],['past','Past']].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)} style={S.tab(tab===k)}>{l}</button>
        ))}
      </div>

      {loading && <div style={{ textAlign:'center', padding:20, color:'#64748b', fontSize:13 }}>Loading…</div>}

      {list.map(ev => (
        <div key={ev.id} style={{ ...S.card, cursor:'pointer' }} onClick={() => navigate(`/events/${ev.id}`)}>
          <div style={{ display:'flex', gap:12, alignItems:'center' }}>
            <div style={{ width:50, height:50, borderRadius:12, background:'linear-gradient(135deg,#6366f1,#ec4899)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>{ev.img}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:800, fontSize:15, color:'#f1f5f9' }}>{ev.title}</div>
              <div style={{ fontSize:12, color:'#64748b', marginTop:2 }}>📅 {ev.date} · ⏰ {ev.time}</div>
              <div style={{ fontSize:12, color:'#64748b' }}>📍 {ev.location}</div>
            </div>
          </div>
          <div style={{ display:'flex', gap:8, marginTop:12 }}>
            <button onClick={e => { e.stopPropagation(); navigate(`/events/${ev.id}`); }} style={{ ...S.btn, flex:1, padding:'8px', fontSize:12 }}>View</button>
            {tab === 'created' && <button onClick={e => { e.stopPropagation(); showToast('Edit mode — coming soon'); }} style={{ ...S.btnO, flex:1, padding:'8px', fontSize:12 }}>✏️ Edit</button>}
            {tab === 'attending' && <button onClick={e => { e.stopPropagation(); exportToCalendar(ev); }} style={{ ...S.btnO, flex:1, padding:'8px', fontSize:12 }}>📅 Cal</button>}
            {tab === 'past' && <button onClick={e => { e.stopPropagation(); navigate(`/events/${ev.id}/recap`); }} style={{ ...S.btnO, flex:1, padding:'8px', fontSize:12 }}>📷 Recap</button>}
          </div>
        </div>
      ))}

      {list.length === 0 && !loading && (
        <div style={{ textAlign:'center', padding:'40px 20px', color:'#64748b' }}>
          <div style={{ fontSize:36, marginBottom:12 }}>📅</div>
          <div style={{ fontWeight:600, fontSize:15 }}>No events here yet</div>
          {tab === 'attending' && <div style={{ fontSize:13, marginTop:6 }}>RSVP to events to see them here</div>}
          {tab === 'created' && <button onClick={() => navigate('/events/create')} style={{ ...S.btn, marginTop:16 }}>+ Create Event</button>}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  EVENT TICKETS PAGE — /events/:id/tickets
// ══════════════════════════════════════════════════════════════
export function EventTicketsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const showToast = useAppStore(s => s.showToast);
  const [selected, setSelected] = useState(null);
  const [qty, setQty] = useState(1);

  const tiers = [
    { id:'free', name:'General Admission', price:'Free', desc:'Standard entry · Limited availability', color:'#10b981', available:23, icon:'🎟️' },
    { id:'vip',  name:'VIP Experience',    price:'$25',  desc:'Priority entry · Welcome drink · Meet organizer', color:'#f59e0b', available:8, icon:'⭐', popular:true },
    { id:'premium', name:'Premium Table',  price:'$75',  desc:'Reserved table · 4 tickets · Bottle service', color:'#6366f1', available:2, icon:'💎' },
  ];

  function handleCheckout() {
    if (!selected) { showToast('Please select a ticket tier'); return; }
    const tier = tiers.find(t => t.id === selected);
    showToast(`🎟️ ${qty}x ${tier.name} — proceeding to checkout`);
    // TODO: Integrate Stripe payment
    navigate(`/events/${id}`);
  }

  const tier = tiers.find(t => t.id === selected);
  const totalPrice = selected && tier?.price !== 'Free'
    ? `$${(parseFloat(tier.price.replace('$','')) * qty).toFixed(2)}`
    : tier ? 'Free' : '—';

  return (
    <div style={S.page}>
      <div style={S.hdr}>
        <button style={S.back} onClick={() => navigate(-1)}>←</button>
        <span style={S.title}>🎟️ Get Tickets</span>
      </div>

      <div style={{ padding:16 }}>
        <div style={{ fontSize:12, color:'#64748b', marginBottom:16, textAlign:'center' }}>Select a ticket type for this event</div>

        {tiers.map(t => (
          <div key={t.id} onClick={() => setSelected(t.id)} style={{ ...S.card, cursor:'pointer', border:selected===t.id?`2px solid ${t.color}`:'1px solid rgba(255,255,255,0.07)', position:'relative', marginBottom:12 }}>
            {t.popular && <span style={{ position:'absolute', top:-10, right:14, background:t.color, color:'#fff', borderRadius:20, padding:'2px 10px', fontSize:10, fontWeight:700 }}>POPULAR</span>}
            {t.available <= 5 && <span style={{ position:'absolute', top:-10, left:14, background:'rgba(239,68,68,0.9)', color:'#fff', borderRadius:20, padding:'2px 10px', fontSize:10, fontWeight:700 }}>ONLY {t.available} LEFT</span>}
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ fontSize:28 }}>{t.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:15 }}>{t.name}</div>
                <div style={{ fontSize:12, color:'#64748b', marginTop:2 }}>{t.desc}</div>
                <div style={{ fontSize:12, color:'#64748b', marginTop:2 }}>👥 {t.available} available</div>
              </div>
              <div style={{ fontWeight:900, fontSize:20, color:t.color }}>{t.price}</div>
            </div>
            {selected === t.id && (
              <div style={{ marginTop:12, display:'flex', alignItems:'center', gap:12, borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:12 }}>
                <span style={{ fontSize:13, color:'#94a3b8' }}>Quantity:</span>
                <button onClick={e => { e.stopPropagation(); setQty(q => Math.max(1,q-1)); }} style={{ ...S.btnO, padding:'4px 12px' }}>−</button>
                <span style={{ fontWeight:700, fontSize:16, minWidth:24, textAlign:'center' }}>{qty}</span>
                <button onClick={e => { e.stopPropagation(); setQty(q => Math.min(t.available,q+1)); }} style={{ ...S.btnO, padding:'4px 12px' }}>+</button>
              </div>
            )}
          </div>
        ))}

        {/* Order summary */}
        {selected && (
          <div style={{ ...S.card, background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.3)', marginBottom:16 }}>
            <div style={{ fontWeight:700, marginBottom:8 }}>Order Summary</div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:14 }}>
              <span style={{ color:'#94a3b8' }}>{qty}× {tier?.name}</span>
              <span style={{ fontWeight:700, color:'#10b981' }}>{totalPrice}</span>
            </div>
            {tier?.price !== 'Free' && (
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#64748b', marginTop:4 }}>
                <span>Service fee</span><span>$0.00</span>
              </div>
            )}
          </div>
        )}

        <button onClick={handleCheckout} style={{ ...S.btn, width:'100%', fontSize:16, padding:'14px', opacity: selected ? 1 : 0.5 }}>
          {selected && tier?.price !== 'Free' ? `💳 Checkout · ${totalPrice}` : '🎟️ Get Free Tickets'}
        </button>
        <p style={{ textAlign:'center', fontSize:12, color:'#475569', marginTop:10 }}>Tickets sent to your email · Transferable · No-refund policy</p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  EVENT CHECK-IN PAGE — /events/:id/checkin
// ══════════════════════════════════════════════════════════════
export function EventCheckInPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const showToast = useAppStore(s => s.showToast);
  const [checkedIn, setCheckedIn] = useState(false);
  const qrData = `LYNKAPP-EVENT-${id}-CHECKIN-${Date.now()}`;

  function handleSelfCheckIn() {
    setCheckedIn(true);
    showToast('✅ Check-in successful! Enjoy the event!', 'success');
  }

  return (
    <div style={S.page}>
      <div style={S.hdr}>
        <button style={S.back} onClick={() => navigate(-1)}>←</button>
        <span style={S.title}>📲 Event Check-In</span>
      </div>

      <div style={{ padding:16, textAlign:'center' }}>
        {checkedIn ? (
          <>
            <div style={{ fontSize:80, marginBottom:16 }}>✅</div>
            <h2 style={{ margin:'0 0 8px', color:'#10b981' }}>Checked In!</h2>
            <p style={{ color:'#64748b' }}>You've been checked in. Enjoy the event! 🎉</p>
            <div style={{ ...S.card, background:'rgba(16,185,129,0.1)', border:'1px solid #10b981', textAlign:'left', marginTop:20 }}>
              <div style={{ fontWeight:700, color:'#10b981', marginBottom:8 }}>✓ Check-in Details</div>
              {[['Event', 'Photography Walk: Downtown'], ['Time', new Date().toLocaleTimeString()], ['Status', 'Verified ✓']].map(([l,v]) => (
                <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'4px 0', fontSize:13 }}>
                  <span style={{ color:'#64748b' }}>{l}</span><span style={{ fontWeight:600 }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:10, marginTop:20 }}>
              <button onClick={() => navigate(`/events/${id}`)} style={{ ...S.btn, flex:1 }}>View Event</button>
              <button onClick={() => navigate(`/events/${id}/attendees`)} style={{ ...S.btnO, flex:1 }}>👥 See Who's Here</button>
            </div>
          </>
        ) : (
          <>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:18, fontWeight:700, marginBottom:4 }}>Your Check-In QR Code</div>
              <div style={{ fontSize:13, color:'#64748b' }}>Show this to the event organizer or scan the venue QR</div>
            </div>

            {/* QR Code placeholder (visual representation) */}
            <div style={{ width:200, height:200, margin:'0 auto 20px', background:'white', borderRadius:16, padding:12, boxSizing:'border-box', display:'grid', gridTemplateColumns:'repeat(10,1fr)', gap:1 }}>
              {Array.from({length:100}).map((_,i) => {
                const isCorner = (i<11 && i%10<2) || (i<11 && i%10>7) || (i>88 && i%10<2);
                const isData = (Math.sin(i*1.3)*Math.cos(i*0.7)+1) > 0.8;
                return <div key={i} style={{ background:isCorner||isData?'#0a0a18':'transparent', borderRadius:1 }} />;
              })}
            </div>

            <div style={{ ...S.card, background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.3)', textAlign:'left', marginBottom:16 }}>
              <div style={{ fontSize:12, color:'#f59e0b', fontWeight:700, marginBottom:4 }}>🎟️ Ticket Info</div>
              <div style={{ fontSize:13, color:'#94a3b8' }}>General Admission · 1 person</div>
              <div style={{ fontSize:11, color:'#64748b', marginTop:4, fontFamily:'monospace' }}>ID: {qrData.slice(0,28)}…</div>
            </div>

            <div style={{ display:'flex', gap:10 }}>
              <button onClick={handleSelfCheckIn} style={{ ...S.btn, flex:1 }}>📲 Self Check-In</button>
              <button onClick={() => showToast('NFC check-in tap your phone to the reader')} style={{ ...S.btnO, flex:1 }}>📡 NFC Tap</button>
            </div>
            <div style={{ fontSize:11, color:'#475569', marginTop:10 }}>Self check-in opens when you arrive · Organizer scan also accepted</div>
          </>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  EVENT RECAP PAGE — /events/:id/recap
// ══════════════════════════════════════════════════════════════
export function EventRecapPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const showToast = useAppStore(s => s.showToast);
  const [activeTab, setActiveTab] = useState('photos');

  const photos = [
    { emoji:'🌅', caption:'Opening views' }, { emoji:'🎉', caption:'Crowd vibes' },
    { emoji:'🎤', caption:'Main speaker' }, { emoji:'🍕', caption:'Food corner' },
    { emoji:'🤝', caption:'Networking' }, { emoji:'🎊', caption:'Group photo' },
    { emoji:'🌃', caption:'Night shots' }, { emoji:'🎭', caption:'Live demo' },
    { emoji:'👏', caption:'Awards' }, { emoji:'🚀', caption:'Closing' },
    { emoji:'🔥', caption:'Best moment' }, { emoji:'💫', caption:'Highlights' },
  ];

  const highlights = [
    { icon:'👥', label:'Attendees', value:'42' },
    { icon:'📷', label:'Photos Taken', value:'128' },
    { icon:'⭐', label:'Avg Rating', value:'4.9' },
    { icon:'💬', label:'Comments', value:'34' },
  ];

  return (
    <div style={S.page}>
      <div style={S.hdr}>
        <button style={S.back} onClick={() => navigate(-1)}>←</button>
        <span style={S.title}>📷 Event Recap</span>
        <button onClick={() => showToast('Album shared!')} style={{ ...S.btnO, marginLeft:'auto', padding:'7px 14px', fontSize:13 }}>📤 Share</button>
      </div>

      {/* Hero banner */}
      <div style={{ height:160, background:'linear-gradient(135deg,rgba(99,102,241,0.4),rgba(236,72,153,0.3))', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:8 }}>
        <div style={{ fontSize:48 }}>📷</div>
        <div style={{ fontWeight:800, fontSize:18, color:'#f1f5f9' }}>Photography Walk Recap</div>
        <div style={{ fontSize:13, color:'#94a3b8' }}>June 7, 2026 · Downtown · 42 attendees</div>
      </div>

      {/* Stat cards */}
      <div style={{ display:'flex', gap:8, padding:'12px 16px' }}>
        {highlights.map(h => (
          <div key={h.label} style={{ flex:1, background:'rgba(255,255,255,0.04)', borderRadius:12, padding:'12px 8px', textAlign:'center', border:'1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ fontSize:18 }}>{h.icon}</div>
            <div style={{ fontSize:16, fontWeight:800, color:'#f1f5f9' }}>{h.value}</div>
            <div style={{ fontSize:10, color:'#64748b' }}>{h.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', padding:'0 16px 12px', gap:8 }}>
        {[['photos','📷 Photos'],['videos','🎬 Videos'],['comments','💬 Reviews']].map(([k,l]) => (
          <button key={k} onClick={() => setActiveTab(k)} style={S.tab(activeTab===k)}>{l}</button>
        ))}
      </div>

      {/* Photos grid */}
      {activeTab === 'photos' && (
        <div style={{ padding:'0 16px' }}>
          <div style={{ fontSize:13, color:'#64748b', marginBottom:10 }}>128 photos · tap to view full size</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:4 }}>
            {photos.map((p,i) => (
              <div key={i} onClick={() => showToast(`📷 ${p.caption}`)} style={{ aspectRatio:'1', background:`hsl(${i*25},40%,18%)`, borderRadius:10, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:28, gap:4 }}>
                {p.emoji}
                <span style={{ fontSize:9, color:'#64748b' }}>{p.caption}</span>
              </div>
            ))}
          </div>
          <button onClick={() => showToast('All 128 photos loading…')} style={{ ...S.btnO, width:'100%', marginTop:16 }}>Load All Photos (128)</button>
        </div>
      )}

      {activeTab === 'videos' && (
        <div style={{ padding:'0 16px' }}>
          {[{title:'Event Highlights Reel', dur:'2:34', views:'1.2K'},
            {title:'Keynote Talk Recording', dur:'18:42', views:'456'},
            {title:'Community Q&A Session', dur:'12:15', views:'234'}].map((v,i) => (
            <div key={i} onClick={() => showToast('Video player — coming soon')} style={{ ...S.card, cursor:'pointer', display:'flex', gap:12, alignItems:'center' }}>
              <div style={{ width:72, height:48, borderRadius:10, background:`hsl(${i*40},50%,20%)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>
                ▶️
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:14 }}>{v.title}</div>
                <div style={{ fontSize:12, color:'#64748b' }}>⏱️ {v.dur} · 👁️ {v.views} views</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'comments' && (
        <div style={{ padding:'0 16px' }}>
          {[
            {name:'Alex C.', emoji:'🔥', rating:5, text:'Amazing event! The golden hour photos came out incredible. Already registered for the next one! 🌅'},
            {name:'Riley J.', emoji:'💪', rating:5, text:'Perfect for beginners. The tips shared were so practical. Made 3 new friends!'},
            {name:'Morgan T.', emoji:'🎨', rating:4, text:'Great vibes, great crowd. Would love longer walking time next time.'},
          ].map((r,i) => (
            <div key={i} style={S.card}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#6366f1,#ec4899)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>{r.emoji}</div>
                <div>
                  <div style={{ fontWeight:700, fontSize:14 }}>{r.name}</div>
                  <div style={{ fontSize:13, color:'#f59e0b' }}>{'⭐'.repeat(r.rating)}</div>
                </div>
              </div>
              <div style={{ fontSize:13, color:'#cbd5e1', lineHeight:1.6 }}>{r.text}</div>
            </div>
          ))}
          <div style={{ ...S.card, textAlign:'center' }}>
            <div style={{ fontWeight:700, marginBottom:8 }}>Rate this event</div>
            <div style={{ fontSize:32, marginBottom:8 }}>{'⭐'.repeat(5)}</div>
            <button onClick={() => showToast('Review submitted!')} style={{ ...S.btn, width:'100%' }}>Submit Review</button>
          </div>
        </div>
      )}
    </div>
  );
}
