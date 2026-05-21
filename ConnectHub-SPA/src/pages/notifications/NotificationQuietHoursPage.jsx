// src/pages/notifications/NotificationQuietHoursPage.jsx — SECTION 7 NEW PAGE (May 2026)
// NEW-N04: Quiet Hours setting — users can mute non-urgent notifications during set hours
// Route: /settings/notifications/quiet-hours

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '@store/useAppStore';

const s = {
  page:     { padding: '0 0 80px 0', background: '#0f172a', minHeight: '100vh' },
  header:   { padding: '16px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '12px' },
  back:     { fontSize: '20px', cursor: 'pointer', color: '#94a3b8' },
  title:    { fontSize: '20px', fontWeight: 700, color: '#f1f5f9' },
  subtitle: { fontSize: '12px', color: '#64748b', marginTop: '2px' },
  section:  { padding: '16px' },
  sectionTitle: { fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '16px 0 8px' },
  card:     { background: '#1e293b', borderRadius: '16px', overflow: 'hidden', marginBottom: '12px', border: '1px solid #334155' },
  row:      { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #0f172a' },
  rowLast:  { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px' },
  rowLeft:  { flex: 1 },
  rowLabel: { fontSize: '14px', color: '#e2e8f0', fontWeight: 500 },
  rowSub:   { fontSize: '12px', color: '#64748b', marginTop: '2px' },
  toggle:   (on) => ({
    width: '44px', height: '24px', borderRadius: '12px', background: on ? '#6366f1' : '#334155',
    position: 'relative', cursor: 'pointer', transition: 'background 0.3s', flexShrink: 0,
    border: 'none',
  }),
  thumb:    (on) => ({
    position: 'absolute', top: '2px', left: on ? '22px' : '2px',
    width: '20px', height: '20px', borderRadius: '50%', background: 'white',
    transition: 'left 0.3s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
  }),
  timeRow:  { display: 'flex', gap: '10px', padding: '12px 16px', borderBottom: '1px solid #0f172a', alignItems: 'center' },
  timeLabel:{ fontSize: '14px', color: '#e2e8f0', flex: 1 },
  timeBtn:  { background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 14px', fontSize: '13px', color: '#94a3b8', cursor: 'pointer', fontWeight: 600 },
  daysRow:  { display: 'flex', gap: '8px', flexWrap: 'wrap', padding: '12px 16px' },
  dayChip:  (on) => ({
    padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
    background: on ? '#6366f1' : '#0f172a',
    color: on ? 'white' : '#64748b',
    border: on ? 'none' : '1px solid #334155',
    transition: 'all 0.2s',
  }),
  saveBtn:  { width: '100%', padding: '14px', background: 'linear-gradient(135deg,#6366f1,#ec4899)', color: 'white', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', marginTop: '8px' },
  info:     { background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px', padding: '12px 14px', marginBottom: '12px', fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' },
};

const HOURS_12 = [
  '12:00 AM','1:00 AM','2:00 AM','3:00 AM','4:00 AM','5:00 AM','6:00 AM','7:00 AM','8:00 AM','9:00 AM','10:00 AM','11:00 AM',
  '12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM','7:00 PM','8:00 PM','9:00 PM','10:00 PM','11:00 PM',
];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const EXCEPTION_TYPES = [
  { id: 'direct_messages', label: 'Direct Messages', sub: 'Always notify even during quiet hours' },
  { id: 'mentions',        label: 'Mentions',         sub: 'Always notify when someone @mentions you' },
  { id: 'urgent',          label: 'Urgent Alerts',    sub: 'Security and account alerts always come through' },
];

export default function NotificationQuietHoursPage() {
  const navigate   = useNavigate();
  const showToast  = useAppStore((s) => s.showToast);

  const [enabled,    setEnabled]    = useState(false);
  const [fromHour,   setFromHour]   = useState('10:00 PM');
  const [toHour,     setToHour]     = useState('8:00 AM');
  const [activeDays, setActiveDays] = useState(['Mon','Tue','Wed','Thu','Fri','Sat','Sun']);
  const [exceptions, setExceptions] = useState({ direct_messages: true, mentions: false, urgent: true });
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker,   setShowToPicker]   = useState(false);

  const toggleDay = (d) => setActiveDays(prev =>
    prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
  );

  const toggleException = (id) => setExceptions(prev => ({ ...prev, [id]: !prev[id] }));

  const handleSave = () => {
    showToast(
      enabled
        ? `🌙 Quiet Hours set: ${fromHour} – ${toHour} on ${activeDays.join(', ')}`
        : '🔔 Quiet Hours disabled — all notifications active',
      'success',
      4000
    );
    navigate(-1);
  };

  return (
    <div style={s.page} onClick={() => { setShowFromPicker(false); setShowToPicker(false); }}>
      {/* Header */}
      <div style={s.header}>
        <span style={s.back} onClick={() => navigate(-1)}>←</span>
        <div>
          <div style={s.title}>Quiet Hours</div>
          <div style={s.subtitle}>Mute non-urgent notifications during set hours</div>
        </div>
      </div>

      <div style={s.section}>
        {/* Info box */}
        <div style={s.info}>
          🌙 During quiet hours, non-urgent notifications will be held and delivered as a summary when your quiet period ends. Exceptions below always come through immediately.
        </div>

        {/* Master toggle */}
        <div style={s.card}>
          <div style={s.row}>
            <div style={s.rowLeft}>
              <div style={s.rowLabel}>Enable Quiet Hours</div>
              <div style={s.rowSub}>Pause notifications during your chosen window</div>
            </div>
            <button style={s.toggle(enabled)} onClick={() => setEnabled(e => !e)}>
              <div style={s.thumb(enabled)} />
            </button>
          </div>
        </div>

        {/* Time range (only shown if enabled) */}
        {enabled && (
          <>
            <div style={s.sectionTitle}>Time Window</div>
            <div style={s.card}>
              {/* From */}
              <div style={s.timeRow} onClick={e => e.stopPropagation()}>
                <span style={s.timeLabel}>From</span>
                <div style={{ position: 'relative' }}>
                  <button style={s.timeBtn} onClick={() => { setShowFromPicker(p => !p); setShowToPicker(false); }}>
                    {fromHour} ▾
                  </button>
                  {showFromPicker && (
                    <div style={{ position: 'absolute', top: '36px', right: 0, background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', maxHeight: '200px', overflowY: 'auto', zIndex: 600, minWidth: '130px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                      {HOURS_12.map(h => (
                        <div key={h} style={{ padding: '8px 14px', fontSize: '13px', color: h === fromHour ? '#6366f1' : '#e2e8f0', cursor: 'pointer', fontWeight: h === fromHour ? 700 : 400 }}
                          onClick={() => { setFromHour(h); setShowFromPicker(false); }}>
                          {h}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {/* To */}
              <div style={{ ...s.timeRow, borderBottom: 'none' }} onClick={e => e.stopPropagation()}>
                <span style={s.timeLabel}>To</span>
                <div style={{ position: 'relative' }}>
                  <button style={s.timeBtn} onClick={() => { setShowToPicker(p => !p); setShowFromPicker(false); }}>
                    {toHour} ▾
                  </button>
                  {showToPicker && (
                    <div style={{ position: 'absolute', top: '36px', right: 0, background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', maxHeight: '200px', overflowY: 'auto', zIndex: 600, minWidth: '130px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                      {HOURS_12.map(h => (
                        <div key={h} style={{ padding: '8px 14px', fontSize: '13px', color: h === toHour ? '#6366f1' : '#e2e8f0', cursor: 'pointer', fontWeight: h === toHour ? 700 : 400 }}
                          onClick={() => { setToHour(h); setShowToPicker(false); }}>
                          {h}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Days */}
            <div style={s.sectionTitle}>Active Days</div>
            <div style={s.card}>
              <div style={s.daysRow}>
                {DAYS.map(d => (
                  <div key={d} style={s.dayChip(activeDays.includes(d))} onClick={() => toggleDay(d)}>
                    {d}
                  </div>
                ))}
              </div>
            </div>

            {/* Exceptions */}
            <div style={s.sectionTitle}>Always Allow</div>
            <div style={s.card}>
              {EXCEPTION_TYPES.map((ex, i) => (
                <div key={ex.id} style={i === EXCEPTION_TYPES.length - 1 ? s.rowLast : s.row}>
                  <div style={s.rowLeft}>
                    <div style={s.rowLabel}>{ex.label}</div>
                    <div style={s.rowSub}>{ex.sub}</div>
                  </div>
                  <button style={s.toggle(exceptions[ex.id])} onClick={() => toggleException(ex.id)}>
                    <div style={s.thumb(exceptions[ex.id])} />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Save button */}
        <button style={s.saveBtn} onClick={handleSave}>
          {enabled ? '💾 Save Quiet Hours' : '✅ Save (Quiet Hours Off)'}
        </button>

        {/* Navigate to full notification preferences */}
        <div
          style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: '#6366f1', cursor: 'pointer' }}
          onClick={() => navigate('/settings/notifications')}
        >
          View all notification preferences →
        </div>
      </div>
    </div>
  );
}
