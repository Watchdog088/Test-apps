// src/pages/events/EventDetailPage.jsx
// Full event detail dashboard

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAppStore from '@store/useAppStore';

const DEMO_EVENT = {
  id: 'ev1', title: 'Photography Walk: Downtown at Golden Hour',
  cover: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  category: '📷 Photography', date: 'Sat, June 7, 2026', time: '6:00 PM – 8:30 PM',
  location: 'Riverwalk Plaza, Downtown', lat: 40.7128, lng: -74.0060,
  organizer: 'Jordan Maxwell', organizerEmoji: '🌸', organizerUid: 'u1',
  description: 'Join us for a relaxed photography walk through downtown as the golden hour light hits the city. All skill levels welcome! Bring any camera — phone or DSLR. We\'ll share tips, explore different angles, and finish with a coffee meetup at The Corner Café.',
  going: 42, maybe: 18, notGoing: 5, interested: 124,
  price: 'Free', maxAttendees: 50,
  tags: ['Photography', 'Outdoor', 'Creative', 'Networking'],
  rsvp: 'none', // none | going | maybe
};

const ATTENDEES = [
  { name: 'Alex Chen', emoji: '🔥' },
  { name: 'Riley J.', emoji: '💪' },
  { name: 'Morgan T.', emoji: '🎨' },
  { name: 'Sam R.', emoji: '🍕' },
  { name: '+38 more', emoji: '👥' },
];

const COMMENTS = [
  { id: 1, author: 'Alex Chen', emoji: '🔥', text: 'So excited for this! The lighting at that location at golden hour is incredible 🌅', time: '2h' },
  { id: 2, author: 'Riley Johnson', emoji: '💪', text: 'First photography event I\'m attending! Any tips for beginners?', time: '4h' },
];

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const showToast = useAppStore(s => s.showToast);
  const [rsvp, setRsvp] = useState(DEMO_EVENT.rsvp);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(COMMENTS);

  function handleRsvp(status) {
    setRsvp(status);
    const msgs = { going: '✅ You\'re going!', maybe: '🤔 Marked as Maybe', notgoing: '❌ RSVP cancelled' };
    showToast(msgs[status], 'success');
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
      if (navigator.share) { await navigator.share({ title: DEMO_EVENT.title, url }); }
      else { await navigator.clipboard.writeText(url); showToast('🔗 Link copied!', 'success'); }
    } catch { showToast('🔗 Link copied!', 'success'); }
  }

  return (
    <div style={{ background: '#0a0a18', minHeight: '100vh', paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,10,24,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 22, cursor: 'pointer', padding: '4px 8px' }}>←</button>
        <span style={{ fontWeight: 700, fontSize: 17, color: '#f1f5f9' }}>Event Details</span>
        <button onClick={shareEvent} style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 12, padding: '8px 14px', color: '#94a3b8', fontSize: 13, cursor: 'pointer' }}>🔗 Share</button>
      </div>

      {/* Cover Image */}
      <div style={{ height: 200, overflow: 'hidden', position: 'relative' }}>
        <img src={DEMO_EVENT.cover} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(10,10,24,1) 0%,transparent 50%)' }} />
        <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.6)', borderRadius: 10, padding: '5px 10px', fontSize: 12, color: 'white' }}>{DEMO_EVENT.category}</div>
      </div>

      {/* Event Info */}
      <div style={{ padding: '16px' }}>
        <div style={{ fontWeight: 900, fontSize: 20, color: '#f1f5f9', marginBottom: 12, lineHeight: 1.3 }}>{DEMO_EVENT.title}</div>

        {[
          { icon: '📅', text: `${DEMO_EVENT.date} · ${DEMO_EVENT.time}` },
          { icon: '📍', text: DEMO_EVENT.location },
          { icon: '🎟️', text: `${DEMO_EVENT.price} · ${DEMO_EVENT.going}/${DEMO_EVENT.maxAttendees} spots filled` },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 18, width: 28 }}>{item.icon}</span>
            <span style={{ fontSize: 14, color: '#94a3b8' }}>{item.text}</span>
          </div>
        ))}

        {/* Organizer */}
        <div onClick={() => navigate(`/profile/${DEMO_EVENT.organizerUid}`)} style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, padding: '10px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: 14, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{DEMO_EVENT.organizerEmoji}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: '#64748b' }}>Organized by</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9' }}>{DEMO_EVENT.organizer}</div>
          </div>
          <span style={{ color: '#6366f1', fontSize: 18 }}>›</span>
        </div>
      </div>

      {/* RSVP Buttons */}
      <div style={{ padding: '0 16px 16px', display: 'flex', gap: 10 }}>
        {[{ key: 'going', label: '✅ Going', count: DEMO_EVENT.going }, { key: 'maybe', label: '🤔 Maybe', count: DEMO_EVENT.maybe }].map(btn => (
          <button key={btn.key} onClick={() => handleRsvp(btn.key)} style={{
            flex: 1, padding: '12px', borderRadius: 16, fontSize: 14, fontWeight: 700, cursor: 'pointer',
            background: rsvp === btn.key ? 'linear-gradient(135deg,#6366f1,#ec4899)' : 'rgba(255,255,255,0.07)',
            border: rsvp === btn.key ? 'none' : '1px solid rgba(255,255,255,0.1)',
            color: rsvp === btn.key ? 'white' : '#64748b',
          }}>{btn.label} ({btn.count})</button>
        ))}
        <button onClick={shareEvent} style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 20, cursor: 'pointer' }}>📤</button>
      </div>

      {/* Attendees */}
      <div style={{ padding: '0 16px 16px' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', marginBottom: 10 }}>👥 {DEMO_EVENT.going} Going · {DEMO_EVENT.maybe} Maybe</div>
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
        <div style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.7 }}>{DEMO_EVENT.description}</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
          {DEMO_EVENT.tags.map(tag => (
            <span key={tag} onClick={() => navigate(`/hashtag/${tag}`)} style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', borderRadius: 10, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>#{tag}</span>
          ))}
        </div>
      </div>

      {/* Map Placeholder */}
      <div style={{ margin: '0 16px 16px', height: 140, borderRadius: 16, background: 'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(236,72,153,0.1))', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <span style={{ fontSize: 32 }}>🗺️</span>
        <div style={{ fontSize: 14, color: '#94a3b8' }}>{DEMO_EVENT.location}</div>
        <button style={{ fontSize: 12, color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Open in Maps →</button>
      </div>

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
    </div>
  );
}
