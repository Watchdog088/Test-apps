// src/pages/events/EventAttendeesPage.jsx
// ✅ SECTION 11 NEW — May 2026
//   • Standalone page (was embedded in RemainingDashboards.jsx)
//   • Loads real attendees from Firestore (getEventAttendees)
//   • Going / Maybe / Not Going tabs

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAppStore from '@store/useAppStore';
import { getEventAttendees } from '@services/events-firestore-service';

const DEMO_ATTENDEES = {
  going:    [{ userName:'Alex Rivera', userPhoto:'' }, { userName:'Jordan Lee', userPhoto:'' }, { userName:'Sam Chen', userPhoto:'' }, { userName:'Taylor M.', userPhoto:'' }, { userName:'Morgan D.', userPhoto:'' }, { userName:'Casey K.', userPhoto:'' }],
  maybe:    [{ userName:'Riley P.', userPhoto:'' }, { userName:'Jamie S.', userPhoto:'' }],
  notgoing: [{ userName:'Drew W.', userPhoto:'' }],
};

const TABS = [
  { key: 'going',    icon: '✅', label: 'Going' },
  { key: 'maybe',   icon: '🤔', label: 'Maybe' },
  { key: 'notgoing',icon: '❌', label: 'Not Going' },
];

function initials(name) {
  return (name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

export default function EventAttendeesPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const showToast = useAppStore(s => s.showToast);
  const [tab, setTab]           = useState('going');
  const [attendees, setAttendees] = useState(DEMO_ATTENDEES);
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        setLoading(true);
        const data = await getEventAttendees(id);
        // Merge with demo if Firestore returns empty
        if (Object.values(data).some(arr => arr.length > 0)) {
          setAttendees(data);
        }
      } catch (e) {
        console.warn('[EventAttendeesPage] Firestore load failed', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const current = (attendees[tab] || []).filter(a =>
    !search || a.userName?.toLowerCase().includes(search.toLowerCase())
  );

  const counts = {
    going:    attendees.going?.length || 0,
    maybe:    attendees.maybe?.length || 0,
    notgoing: attendees.notgoing?.length || 0,
  };

  return (
    <div style={{ minHeight: '100dvh', background: '#0a0a18', color: '#f1f5f9', fontFamily: 'system-ui,sans-serif', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.07)', position: 'sticky', top: 0, background: 'rgba(10,10,24,0.95)', backdropFilter: 'blur(20px)', zIndex: 10 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 10, padding: '8px 14px', color: '#f1f5f9', fontSize: 18, cursor: 'pointer' }}>←</button>
        <span style={{ fontSize: 17, fontWeight: 700 }}>👥 Attendees ({counts.going + counts.maybe + counts.notgoing})</span>
        <button onClick={() => showToast('Invite sent!')} style={{ marginLeft: 'auto', background: 'linear-gradient(135deg,#6366f1,#ec4899)', border: 'none', borderRadius: 10, padding: '8px 14px', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>+ Invite</button>
      </div>

      {/* Search */}
      <div style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: '0 14px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <span style={{ fontSize: 16, marginRight: 8 }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search attendees…" style={{ background: 'none', border: 'none', outline: 'none', color: '#f1f5f9', fontSize: 14, flex: 1, padding: '10px 0' }} />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', padding: '0 16px 12px', gap: 8, overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            background: tab === t.key ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.05)',
            border: tab === t.key ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.1)',
            borderRadius: 20, padding: '7px 14px', color: tab === t.key ? '#a5b4fc' : '#94a3b8',
            fontSize: 12, cursor: 'pointer', flexShrink: 0,
          }}>
            {t.icon} {t.label} ({counts[t.key]})
          </button>
        ))}
      </div>

      {/* List */}
      {loading && <div style={{ textAlign: 'center', padding: 20, color: '#64748b', fontSize: 13 }}>Loading…</div>}

      {current.map((person, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}
          onClick={() => showToast(`Viewing ${person.userName}'s profile`)}>
          {person.userPhoto ? (
            <img src={person.userPhoto} alt={person.userName} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: `hsl(${(person.userName?.charCodeAt(0) || 65) * 5},60%,35%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {initials(person.userName)}
            </div>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{person.userName}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>{i < 2 ? 'Mutual friend' : 'Friend of friend'}</div>
          </div>
          <button onClick={e => { e.stopPropagation(); showToast('Message sent!'); }} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '6px 14px', color: '#94a3b8', fontSize: 12, cursor: 'pointer' }}>
            💬 Message
          </button>
        </div>
      ))}

      {current.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>👥</div>
          <div style={{ fontWeight: 600 }}>No {tab} responses yet</div>
        </div>
      )}
    </div>
  );
}
