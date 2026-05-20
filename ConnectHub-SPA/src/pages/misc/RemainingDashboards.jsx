// RemainingDashboards.jsx — All remaining dashboard pages from "NEEDS DASHBOARD WHEN CLICKED"
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const S = {
  page: { minHeight: '100dvh', background: '#0a0a18', color: '#f1f5f9', fontFamily: 'system-ui,sans-serif', paddingBottom: 80 },
  hdr: { display: 'flex', alignItems: 'center', gap: 12, padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.07)', position: 'sticky', top: 0, background: 'rgba(10,10,24,0.95)', backdropFilter: 'blur(20px)', zIndex: 10 },
  back: { background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 10, padding: '8px 14px', color: '#f1f5f9', fontSize: 18, cursor: 'pointer' },
  title: { fontSize: 17, fontWeight: 700, color: '#f1f5f9' },
  card: { background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 16, margin: '10px 16px', border: '1px solid rgba(255,255,255,0.07)' },
  av: { width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#fff', flexShrink: 0 },
  btn: { background: 'linear-gradient(135deg,#6366f1,#ec4899)', border: 'none', borderRadius: 12, padding: '10px 20px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14 },
  btnO: { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, padding: '10px 20px', color: '#f1f5f9', fontWeight: 600, cursor: 'pointer', fontSize: 14 },
  inp: { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '12px 14px', color: '#f1f5f9', fontSize: 14, width: '100%', boxSizing: 'border-box', outline: 'none' },
  stat: (c) => ({ background: `rgba(${c},0.15)`, color: `rgb(${c})`, borderRadius: 8, padding: '4px 10px', fontSize: 13, fontWeight: 700 }),
  sec: { padding: '12px 16px 4px', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 },
  row: { display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' },
  tag: (bg, col) => ({ background: bg, color: col, borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 700 }),
};

// ==================== DATING SUBPAGES ====================
export function DatingBoostPage() {
  const nav = useNavigate();
  const [active, setActive] = useState(false);
  const tiers = [{ label: '30 min', icon: '⚡', price: '$1.99', reach: '2x more views', color: '#f59e0b' }, { label: '3 hours', icon: '🚀', price: '$4.99', reach: '5x more views', color: '#6366f1', popular: true }, { label: '24 hours', icon: '🌟', price: '$9.99', reach: '10x more views', color: '#ec4899' }];
  return (
    <div style={S.page}>
      <div style={S.hdr}><button style={S.back} onClick={() => nav(-1)}>←</button><span style={S.title}>⚡ Boost Profile</span></div>
      <div style={{ padding: 16, textAlign: 'center' }}>
        <div style={{ fontSize: 64, margin: '20px 0 8px' }}>🚀</div>
        <h2 style={{ margin: '0 0 8px', fontSize: 22 }}>Get 10x More Matches</h2>
        <p style={{ color: '#94a3b8', margin: '0 0 24px' }}>Boost puts your profile at the top of the stack in your area</p>
        {active && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981', borderRadius: 16, padding: 16, marginBottom: 20 }}><div style={{ fontSize: 24 }}>✅</div><div style={{ color: '#10b981', fontWeight: 700 }}>BOOST ACTIVE</div><div style={{ color: '#64748b', fontSize: 13 }}>Ends in 2:47:33 · Profile views: <strong style={{ color: '#f1f5f9' }}>128</strong></div></div>}
        {tiers.map(t => (
          <div key={t.label} onClick={() => setActive(true)} style={{ ...S.card, cursor: 'pointer', border: t.popular ? `2px solid ${t.color}` : '1px solid rgba(255,255,255,0.07)', position: 'relative', marginBottom: 12 }}>
            {t.popular && <span style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: t.color, color: '#fff', borderRadius: 20, padding: '2px 12px', fontSize: 11, fontWeight: 700 }}>MOST POPULAR</span>}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 28 }}>{t.icon}</span>
              <div style={{ flex: 1, textAlign: 'left' }}><div style={{ fontWeight: 700 }}>{t.label} Boost</div><div style={{ fontSize: 13, color: '#64748b' }}>{t.reach}</div></div>
              <div style={{ textAlign: 'right' }}><div style={{ fontWeight: 800, fontSize: 18, color: t.color }}>{t.price}</div></div>
            </div>
          </div>
        ))}
        <div style={{ marginTop: 20, padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: 16, textAlign: 'left' }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>📊 Boost Analytics</div>
          {[['Profile Views', '128', '↑ 847%'], ['Right Swipes', '34', '↑ 623%'], ['New Matches', '12', '↑ 500%']].map(([l, v, c]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: '#94a3b8', fontSize: 13 }}>{l}</span>
              <span style={{ fontWeight: 700 }}>{v} <span style={{ color: '#10b981', fontSize: 12 }}>{c}</span></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DatingCompatPage() {
  const nav = useNavigate();
  const { uid } = useParams();
  const cats = [{ label: 'Personality', score: 94, icon: '🧠' }, { label: 'Values', score: 87, icon: '💎' }, { label: 'Lifestyle', score: 79, icon: '🌿' }, { label: 'Interests', score: 91, icon: '🎯' }, { label: 'Communication', score: 83, icon: '💬' }, { label: 'Goals', score: 76, icon: '🎯' }];
  return (
    <div style={S.page}>
      <div style={S.hdr}><button style={S.back} onClick={() => nav(-1)}>←</button><span style={S.title}>💜 Compatibility Report</span></div>
      <div style={{ padding: 16, textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, margin: '20px 0' }}>
          <div style={{ ...S.av, width: 64, height: 64, fontSize: 24 }}>ME</div>
          <div style={{ fontSize: 32 }}>💜</div>
          <div style={{ ...S.av, width: 64, height: 64, fontSize: 24, background: 'linear-gradient(135deg,#ec4899,#f59e0b)' }}>JL</div>
        </div>
        <div style={{ fontSize: 64, fontWeight: 900, background: 'linear-gradient(135deg,#6366f1,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>87%</div>
        <p style={{ color: '#94a3b8', marginBottom: 24 }}>Overall Compatibility · Excellent Match</p>
        {cats.map(c => (
          <div key={c.label} style={{ ...S.card, margin: '8px 0', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontWeight: 600 }}>{c.icon} {c.label}</span>
              <span style={{ fontWeight: 800, color: c.score > 85 ? '#10b981' : c.score > 70 ? '#f59e0b' : '#ef4444' }}>{c.score}%</span>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${c.score}%`, height: '100%', background: c.score > 85 ? '#10b981' : c.score > 70 ? '#f59e0b' : '#ef4444', borderRadius: 3, transition: 'width 0.6s ease' }} />
            </div>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          <button style={{ ...S.btn, flex: 1 }}>💬 Start Chat</button>
          <button style={{ ...S.btnO, flex: 1 }}>❤️ Like Profile</button>
        </div>
      </div>
    </div>
  );
}

export function DatingSettingsPage() {
  const nav = useNavigate();
  const [prefs, setPrefs] = useState({ ageMin: 22, ageMax: 35, distance: 25, showMe: 'Everyone', intent: 'Relationship', verified: true, notifications: true });
  return (
    <div style={S.page}>
      <div style={S.hdr}><button style={S.back} onClick={() => nav(-1)}>←</button><span style={S.title}>💑 Dating Settings</span></div>
      <div style={{ padding: 16 }}>
        {[['👁️ Show Me', prefs.showMe, ['Women', 'Men', 'Everyone']], ['💕 Looking For', prefs.intent, ['Relationship', 'Casual', 'Friendship', 'Marriage']]].map(([l, v, opts]) => (
          <div key={l} style={S.card}>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>{l}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {opts.map(o => <button key={o} onClick={() => setPrefs(p => ({ ...p, [l.includes('Show') ? 'showMe' : 'intent']: o }))} style={{ ...S.tag(v === o ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.06)', v === o ? '#a5b4fc' : '#94a3b8'), border: v === o ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', padding: '8px 16px' }}>{o}</button>)}
            </div>
          </div>
        ))}
        <div style={S.card}>
          <div style={{ fontWeight: 700, marginBottom: 12 }}>📍 Distance: {prefs.distance} miles</div>
          <input type="range" min={1} max={100} value={prefs.distance} onChange={e => setPrefs(p => ({ ...p, distance: +e.target.value }))} style={{ width: '100%', accentColor: '#6366f1' }} />
        </div>
        <div style={S.card}>
          <div style={{ fontWeight: 700, marginBottom: 12 }}>🎂 Age Range: {prefs.ageMin}–{prefs.ageMax}</div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}><label style={{ fontSize: 12, color: '#64748b' }}>Min</label><input type="number" value={prefs.ageMin} onChange={e => setPrefs(p => ({ ...p, ageMin: +e.target.value }))} style={{ ...S.inp, marginTop: 4 }} /></div>
            <div style={{ flex: 1 }}><label style={{ fontSize: 12, color: '#64748b' }}>Max</label><input type="number" value={prefs.ageMax} onChange={e => setPrefs(p => ({ ...p, ageMax: +e.target.value }))} style={{ ...S.inp, marginTop: 4 }} /></div>
          </div>
        </div>
        {[['✅ Verified profiles only', 'verified'], ['🔔 Dating notifications', 'notifications']].map(([l, k]) => (
          <div key={k} onClick={() => setPrefs(p => ({ ...p, [k]: !p[k] }))} style={{ ...S.row, background: 'rgba(255,255,255,0.03)', borderRadius: 12, margin: '8px 16px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ flex: 1, fontWeight: 600 }}>{l}</span>
            <div style={{ width: 44, height: 24, borderRadius: 12, background: prefs[k] ? '#6366f1' : 'rgba(255,255,255,0.15)', position: 'relative', transition: '0.2s' }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: prefs[k] ? 23 : 3, transition: '0.2s' }} />
            </div>
          </div>
        ))}
        <div style={{ padding: '0 16px', marginTop: 16 }}><button style={{ ...S.btn, width: '100%' }}>Save Settings</button></div>
      </div>
    </div>
  );
}

// ==================== GROUP SUBPAGES ====================
export function GroupCreatePage() {
  const nav = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', desc: '', privacy: 'Public', category: '' });
  const cats = ['💻 Tech', '🎮 Gaming', '🎨 Art', '🏋️ Fitness', '🍕 Food', '🎵 Music', '📚 Education', '💼 Business'];
  return (
    <div style={S.page}>
      <div style={S.hdr}><button style={S.back} onClick={() => nav(-1)}>←</button><span style={S.title}>Create Group · Step {step}/3</span></div>
      <div style={{ display: 'flex', padding: '12px 16px', gap: 4 }}>
        {[1, 2, 3].map(i => <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? '#6366f1' : 'rgba(255,255,255,0.1)' }} />)}
      </div>
      <div style={{ padding: 16 }}>
        {step === 1 && <>
          <h3 style={{ margin: '0 0 16px' }}>Basic Info</h3>
          <div style={{ marginBottom: 12 }}><label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>Group Name *</label><input placeholder="e.g. React Developers" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} style={S.inp} /></div>
          <div style={{ marginBottom: 16 }}><label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>Description</label><textarea placeholder="What's this group about?" value={form.desc} onChange={e => setForm(p => ({ ...p, desc: e.target.value }))} style={{ ...S.inp, minHeight: 80, resize: 'none' }} /></div>
          <button disabled={!form.name} onClick={() => setStep(2)} style={{ ...S.btn, width: '100%', opacity: form.name ? 1 : 0.5 }}>Next →</button>
        </>}
        {step === 2 && <>
          <h3 style={{ margin: '0 0 16px' }}>Category & Privacy</h3>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>Category</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {cats.map(c => <button key={c} onClick={() => setForm(p => ({ ...p, category: c }))} style={{ ...S.tag(form.category === c ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.06)', form.category === c ? '#a5b4fc' : '#94a3b8'), border: form.category === c ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', padding: '8px 14px', fontSize: 13 }}>{c}</button>)}
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>Privacy</div>
            {[['🌍 Public', 'Anyone can join and see posts'], ['🔒 Private', 'Members only, request to join'], ['🔐 Secret', 'Invite only, hidden from search']].map(([l, d]) => (
              <div key={l} onClick={() => setForm(p => ({ ...p, privacy: l.split(' ')[1] }))} style={{ ...S.card, cursor: 'pointer', border: form.privacy === l.split(' ')[1] ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.07)', marginBottom: 8 }}>
                <div style={{ fontWeight: 700 }}>{l}</div><div style={{ fontSize: 12, color: '#64748b' }}>{d}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}><button onClick={() => setStep(1)} style={{ ...S.btnO, flex: 1 }}>← Back</button><button onClick={() => setStep(3)} style={{ ...S.btn, flex: 1 }}>Next →</button></div>
        </>}
        {step === 3 && <>
          <h3 style={{ margin: '0 0 16px' }}>Cover Photo</h3>
          <div onClick={() => {}} style={{ height: 160, background: 'rgba(255,255,255,0.04)', borderRadius: 16, border: '2px dashed rgba(255,255,255,0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: 16 }}>
            <div style={{ fontSize: 36 }}>📷</div><div style={{ color: '#64748b', fontSize: 14, marginTop: 8 }}>Tap to upload cover photo</div>
          </div>
          <div style={{ ...S.card, marginBottom: 16 }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{form.name || 'My Group'}</div>
            <div style={{ fontSize: 13, color: '#64748b' }}>{form.category} · {form.privacy} · 0 members</div>
            <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 6 }}>{form.desc || 'No description yet'}</div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}><button onClick={() => setStep(2)} style={{ ...S.btnO, flex: 1 }}>← Back</button><button onClick={() => nav('/groups')} style={{ ...S.btn, flex: 1 }}>🚀 Create Group</button></div>
        </>}
      </div>
    </div>
  );
}

export function GroupMembersPage() {
  const nav = useNavigate();
  const { id } = useParams();
  const [tab, setTab] = useState('all');
  const members = [
    { name: 'Alex Rivera', role: 'Admin', av: 'AR', joined: '6 months ago' },
    { name: 'Jordan Lee', role: 'Moderator', av: 'JL', joined: '4 months ago' },
    { name: 'Sam Chen', role: 'Member', av: 'SC', joined: '3 months ago' },
    { name: 'Taylor M.', role: 'Member', av: 'TM', joined: '2 months ago' },
    { name: 'Morgan D.', role: 'Pending', av: 'MD', joined: 'Requested 2 days ago' },
  ];
  const filtered = tab === 'all' ? members.filter(m => m.role !== 'Pending') : tab === 'admins' ? members.filter(m => ['Admin', 'Moderator'].includes(m.role)) : members.filter(m => m.role === 'Pending');
  return (
    <div style={S.page}>
      <div style={S.hdr}><button style={S.back} onClick={() => nav(-1)}>←</button><span style={S.title}>👥 Members (342)</span></div>
      <div style={{ display: 'flex', padding: '8px 16px', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        {['all', 'admins', 'pending'].map(t => <button key={t} onClick={() => setTab(t)} style={{ background: tab === t ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.05)', border: tab === t ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '7px 14px', color: tab === t ? '#a5b4fc' : '#94a3b8', fontSize: 13, cursor: 'pointer', textTransform: 'capitalize' }}>{t === 'all' ? 'All (342)' : t === 'admins' ? 'Admins (4)' : 'Pending (3)'}</button>)}
      </div>
      {filtered.map(m => (
        <div key={m.name} style={S.row}>
          <div style={S.av}>{m.av}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700 }}>{m.name}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>{m.joined}</div>
          </div>
          <span style={S.tag(m.role === 'Admin' ? 'rgba(245,158,11,0.2)' : m.role === 'Moderator' ? 'rgba(99,102,241,0.2)' : m.role === 'Pending' ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)', m.role === 'Admin' ? '#f59e0b' : m.role === 'Moderator' ? '#a5b4fc' : m.role === 'Pending' ? '#ef4444' : '#64748b')}>{m.role}</span>
          {m.role === 'Pending' && <div style={{ display: 'flex', gap: 8 }}><button style={{ ...S.btn, padding: '6px 12px', fontSize: 12 }}>✓</button><button style={{ ...S.btnO, padding: '6px 12px', fontSize: 12 }}>✗</button></div>}
        </div>
      ))}
    </div>
  );
}

export function GroupSettingsPage() {
  const nav = useNavigate();
  const { id } = useParams();
  const settings = [['📝 Group Name', 'React Developers'], ['📋 Description', 'Edit group bio'], ['🖼️ Cover Photo', 'Change photo'], ['🔒 Privacy', 'Public → Private'], ['📌 Category', '💻 Tech'], ['🚫 Banned Words', 'Manage filter list'], ['👋 Welcome Message', 'Set auto-message for new members'], ['🗑️ Delete Group', 'Permanently delete']];
  return (
    <div style={S.page}>
      <div style={S.hdr}><button style={S.back} onClick={() => nav(-1)}>←</button><span style={S.title}>⚙️ Group Settings</span></div>
      <div style={{ padding: '8px 0' }}>
        {settings.map(([label, sub]) => (
          <div key={label} style={{ ...S.row, background: label === '🗑️ Delete Group' ? 'rgba(239,68,68,0.05)' : 'transparent' }}>
            <div style={{ flex: 1 }}><div style={{ fontWeight: 600, color: label === '🗑️ Delete Group' ? '#ef4444' : '#f1f5f9' }}>{label}</div><div style={{ fontSize: 12, color: '#64748b' }}>{sub}</div></div>
            <span style={{ color: '#64748b', fontSize: 16 }}>›</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== EVENT SUBPAGES ====================
export function EventCreatePage() {
  const nav = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ title: '', type: 'In-Person', date: '', time: '', location: '', desc: '' });
  return (
    <div style={S.page}>
      <div style={S.hdr}><button style={S.back} onClick={() => nav(-1)}>←</button><span style={S.title}>Create Event · Step {step}/3</span></div>
      <div style={{ display: 'flex', padding: '12px 16px', gap: 4 }}>
        {[1, 2, 3].map(i => <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? '#6366f1' : 'rgba(255,255,255,0.1)' }} />)}
      </div>
      <div style={{ padding: 16 }}>
        {step === 1 && <>
          <h3 style={{ margin: '0 0 16px' }}>Event Basics</h3>
          <div style={{ marginBottom: 12 }}><label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>Event Title *</label><input placeholder="e.g. Tech Meetup 2026" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} style={S.inp} /></div>
          <div style={{ marginBottom: 12 }}><label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>Event Type</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['In-Person', 'Virtual', 'Hybrid'].map(t => <button key={t} onClick={() => setForm(p => ({ ...p, type: t }))} style={{ flex: 1, ...S.tag(form.type === t ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.06)', form.type === t ? '#a5b4fc' : '#94a3b8'), border: form.type === t ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', padding: '10px 8px', fontSize: 13, borderRadius: 12 }}>{t}</button>)}
            </div>
          </div>
          <button disabled={!form.title} onClick={() => setStep(2)} style={{ ...S.btn, width: '100%', opacity: form.title ? 1 : 0.5 }}>Next →</button>
        </>}
        {step === 2 && <>
          <h3 style={{ margin: '0 0 16px' }}>Date, Time & Location</h3>
          <div style={{ marginBottom: 12 }}><label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>Date</label><input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} style={S.inp} /></div>
          <div style={{ marginBottom: 12 }}><label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>Time</label><input type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} style={S.inp} /></div>
          {form.type !== 'Virtual' && <div style={{ marginBottom: 16 }}><label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>Location</label><input placeholder="123 Main St, City, State" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} style={S.inp} /></div>}
          <div style={{ display: 'flex', gap: 10 }}><button onClick={() => setStep(1)} style={{ ...S.btnO, flex: 1 }}>← Back</button><button onClick={() => setStep(3)} style={{ ...S.btn, flex: 1 }}>Next →</button></div>
        </>}
        {step === 3 && <>
          <h3 style={{ margin: '0 0 16px' }}>Description & Cover</h3>
          <div style={{ marginBottom: 12 }}><label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>Description</label><textarea placeholder="Tell people what to expect..." value={form.desc} onChange={e => setForm(p => ({ ...p, desc: e.target.value }))} style={{ ...S.inp, minHeight: 100, resize: 'none' }} /></div>
          <div onClick={() => {}} style={{ height: 120, background: 'rgba(255,255,255,0.04)', borderRadius: 16, border: '2px dashed rgba(255,255,255,0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: 16 }}>
            <div style={{ fontSize: 28 }}>📷</div><div style={{ color: '#64748b', fontSize: 13, marginTop: 6 }}>Upload cover photo</div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}><button onClick={() => setStep(2)} style={{ ...S.btnO, flex: 1 }}>← Back</button><button onClick={() => nav('/events')} style={{ ...S.btn, flex: 1 }}>🚀 Create Event</button></div>
        </>}
      </div>
    </div>
  );
}

export function EventAttendeesPage() {
  const nav = useNavigate();
  const { id } = useParams();
  const [tab, setTab] = useState('going');
  const people = { going: ['Alex Rivera', 'Jordan Lee', 'Sam Chen', 'Taylor M.', 'Morgan D.', 'Casey K.'], maybe: ['Riley P.', 'Jamie S.'], notgoing: ['Drew W.'] };
  const icons = { going: '✅', maybe: '🤔', notgoing: '❌' };
  return (
    <div style={S.page}>
      <div style={S.hdr}><button style={S.back} onClick={() => nav(-1)}>←</button><span style={S.title}>👥 Attendees</span></div>
      <div style={{ display: 'flex', padding: '8px 16px', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        {[['going', 6], ['maybe', 2], ['notgoing', 1]].map(([t, cnt]) => (
          <button key={t} onClick={() => setTab(t)} style={{ background: tab === t ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.05)', border: tab === t ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '7px 14px', color: tab === t ? '#a5b4fc' : '#94a3b8', fontSize: 12, cursor: 'pointer' }}>{icons[t]} {t === 'going' ? 'Going' : t === 'maybe' ? 'Maybe' : 'Not Going'} ({cnt})</button>
        ))}
      </div>
      {people[tab].map((name, i) => (
        <div key={name} style={S.row}>
          <div style={S.av}>{name.split(' ').map(n => n[0]).join('')}</div>
          <div style={{ flex: 1 }}><div style={{ fontWeight: 700 }}>{name}</div><div style={{ fontSize: 12, color: '#64748b' }}>{i < 2 ? 'Mutual friend' : 'Friend of friend'}</div></div>
          <button style={{ ...S.btnO, padding: '6px 14px', fontSize: 12 }}>Profile</button>
        </div>
      ))}
    </div>
  );
}

export function MyEventsPage() {
  const nav = useNavigate();
  const [tab, setTab] = useState('attending');
  const events = { attending: [{ title: 'Tech Meetup 2026', date: 'June 15 · 6pm', loc: 'DC Tech Hub' }, { title: 'Rooftop Mixer', date: 'June 22 · 7pm', loc: 'Rooftop Bar DC' }], created: [{ title: 'Dev Hangout', date: 'June 10 · 5pm', loc: 'Virtual · Zoom' }] };
  return (
    <div style={S.page}>
      <div style={S.hdr}><button style={S.back} onClick={() => nav(-1)}>←</button><span style={S.title}>📅 My Events</span></div>
      <div style={{ display: 'flex', padding: '8px 16px', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        {[['attending', 'Going (2)'], ['created', 'Hosting (1)']].map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)} style={{ background: tab === t ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.05)', border: tab === t ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '7px 16px', color: tab === t ? '#a5b4fc' : '#94a3b8', fontSize: 13, cursor: 'pointer' }}>{l}</button>
        ))}
      </div>
      {events[tab].map(e => (
        <div key={e.title} onClick={() => nav('/events/1')} style={S.card} style={{ ...S.card, cursor: 'pointer', margin: '10px 16px' }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{e.title}</div>
          <div style={{ fontSize: 13, color: '#64748b' }}>📅 {e.date}</div>
          <div style={{ fontSize: 13, color: '#64748b' }}>📍 {e.loc}</div>
          <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
            <button style={{ ...S.btn, padding: '6px 14px', fontSize: 12 }}>View Event</button>
            {tab === 'created' && <button style={{ ...S.btnO, padding: '6px 14px', fontSize: 12 }}>Edit</button>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ==================== PROFILE SUBPAGES ====================
export function ProfileEditPage() {
  const nav = useNavigate();
  const [form, setForm] = useState({ name: 'Alex Rivera', bio: 'Developer & creator 🚀', username: 'alexrivera', website: '', location: 'Washington, DC' });
  return (
    <div style={S.page}>
      <div style={S.hdr}><button style={S.back} onClick={() => nav(-1)}>←</button><span style={S.title}>✏️ Edit Profile</span><button style={{ ...S.btn, marginLeft: 'auto', padding: '8px 16px', fontSize: 13 }}>Save</button></div>
      <div style={{ padding: 16 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ ...S.av, width: 80, height: 80, fontSize: 28, margin: '0 auto 10px', cursor: 'pointer', border: '3px solid #6366f1', position: 'relative' }}>AR<div style={{ position: 'absolute', bottom: 0, right: 0, background: '#6366f1', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>📷</div></div>
          <button style={{ ...S.btnO, padding: '6px 16px', fontSize: 13 }}>Change Photo</button>
        </div>
        {[['Full Name', 'name'], ['Username', 'username'], ['Bio', 'bio'], ['Website', 'website'], ['Location', 'location']].map(([l, k]) => (
          <div key={k} style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>{l}</label>
            {k === 'bio' ? <textarea value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} style={{ ...S.inp, minHeight: 72, resize: 'none' }} /> : <input value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} style={S.inp} placeholder={l} />}
          </div>
        ))}
        <div style={{ ...S.card, marginTop: 8 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>🔗 Social Links</div>
          {['Twitter / X', 'Instagram', 'LinkedIn', 'TikTok'].map(s => <input key={s} placeholder={s} style={{ ...S.inp, marginBottom: 8 }} />)}
        </div>
      </div>
    </div>
  );
}

// ==================== MUSIC SUBPAGES ====================
export function AlbumDetailPage() {
  const nav = useNavigate();
  const { id } = useParams();
  const tracks = [['Midnight Drive', '3:42'], ['Ocean Eyes', '4:15'], ['Stellar', '3:58'], ['Neon Lights', '4:33'], ['Fade Away', '3:21'], ['Golden Hour', '5:02']];
  return (
    <div style={S.page}>
      <div style={S.hdr}><button style={S.back} onClick={() => nav(-1)}>←</button><span style={S.title}>💿 Album</span></div>
      <div style={{ padding: 16, textAlign: 'center' }}>
        <div style={{ width: 160, height: 160, borderRadius: 20, background: 'linear-gradient(135deg,#6366f1,#ec4899)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, boxShadow: '0 20px 60px rgba(99,102,241,0.4)' }}>🎵</div>
        <h2 style={{ margin: '0 0 4px' }}>Midnight Waves</h2>
        <p style={{ color: '#64748b', margin: '0 0 4px' }}>Luna Echo · 2026 · {tracks.length} songs</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16, marginBottom: 20 }}>
          <button style={{ ...S.btn, flex: 1, maxWidth: 160 }}>▶ Play All</button>
          <button style={{ ...S.btnO, padding: '10px 16px' }}>🔀</button>
          <button style={{ ...S.btnO, padding: '10px 16px' }}>❤️</button>
          <button style={{ ...S.btnO, padding: '10px 16px' }}>⋯</button>
        </div>
      </div>
      {tracks.map(([title, dur], i) => (
        <div key={title} style={{ ...S.row }}>
          <span style={{ width: 24, textAlign: 'center', color: '#64748b', fontSize: 13 }}>{i + 1}</span>
          <div style={{ flex: 1, marginLeft: 8 }}><div style={{ fontWeight: 600 }}>{title}</div><div style={{ fontSize: 12, color: '#64748b' }}>Luna Echo</div></div>
          <span style={{ color: '#64748b', fontSize: 13 }}>{dur}</span>
          <button style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 16, marginLeft: 8 }}>⋯</button>
        </div>
      ))}
    </div>
  );
}

export function PlaylistPage() {
  const nav = useNavigate();
  const { id } = useParams();
  const tracks = [['Blinding Lights', 'The Weeknd', '3:20'], ['Levitating', 'Dua Lipa', '3:23'], ['Stay', 'The Kid LAROI', '2:21'], ['Peaches', 'Justin Bieber', '3:18'], ['Good 4 U', 'Olivia Rodrigo', '2:58']];
  return (
    <div style={S.page}>
      <div style={S.hdr}><button style={S.back} onClick={() => nav(-1)}>←</button><span style={S.title}>🎵 Playlist</span></div>
      <div style={{ padding: 16, textAlign: 'center' }}>
        <div style={{ width: 140, height: 140, borderRadius: 16, background: 'linear-gradient(135deg,#10b981,#6366f1)', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56 }}>🎵</div>
        <h2 style={{ margin: '0 0 4px' }}>Chill Vibes 2026</h2>
        <p style={{ color: '#64748b', margin: '0 0 4px' }}>Created by You · {tracks.length} songs · 15 min</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', margin: '16px 0' }}>
          <button style={{ ...S.btn, flex: 1, maxWidth: 140 }}>▶ Play</button>
          <button style={{ ...S.btnO, padding: '10px 16px' }}>🔀 Shuffle</button>
          <button style={{ ...S.btnO, padding: '10px 16px' }}>⋯</button>
        </div>
      </div>
      {tracks.map(([title, artist, dur], i) => (
        <div key={title} style={S.row}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: `hsl(${i * 50},60%,40%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🎵</div>
          <div style={{ flex: 1, marginLeft: 10 }}><div style={{ fontWeight: 600, fontSize: 14 }}>{title}</div><div style={{ fontSize: 12, color: '#64748b' }}>{artist}</div></div>
          <span style={{ color: '#64748b', fontSize: 13 }}>{dur}</span>
          <button style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 16, marginLeft: 8 }}>⋯</button>
        </div>
      ))}
    </div>
  );
}

export function PlaylistCreatePage() {
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [privacy, setPrivacy] = useState('Public');
  return (
    <div style={S.page}>
      <div style={S.hdr}><button style={S.back} onClick={() => nav(-1)}>←</button><span style={S.title}>➕ New Playlist</span></div>
      <div style={{ padding: 16, textAlign: 'center' }}>
        <div onClick={() => {}} style={{ width: 120, height: 120, borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '2px dashed rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, cursor: 'pointer', margin: '20px auto' }}>📷</div>
        <div style={{ marginBottom: 12 }}><input placeholder="Playlist name" value={name} onChange={e => setName(e.target.value)} style={{ ...S.inp, textAlign: 'center', fontSize: 18, fontWeight: 700 }} /></div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
          {['Public', 'Private', 'Collaborative'].map(p => <button key={p} onClick={() => setPrivacy(p)} style={{ ...S.tag(privacy === p ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.06)', privacy === p ? '#a5b4fc' : '#94a3b8'), border: privacy === p ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', padding: '8px 14px', fontSize: 13 }}>{p}</button>)}
        </div>
        <button disabled={!name} onClick={() => nav('/music')} style={{ ...S.btn, width: '100%', opacity: name ? 1 : 0.5 }}>Create Playlist</button>
      </div>
    </div>
  );
}

// ==================== MEDIA SUBPAGES ====================
export function PhotoGalleryPage() {
  const nav = useNavigate();
  const [view, setView] = useState('grid');
  const photos = Array.from({ length: 12 }, (_, i) => ({ id: i, emoji: ['🌅', '🏙️', '🌊', '🦋', '🌺', '🏔️', '🌈', '🦁', '🎨', '🌙', '⚡', '🎭'][i] }));
  return (
    <div style={S.page}>
      <div style={S.hdr}><button style={S.back} onClick={() => nav(-1)}>←</button><span style={S.title}>🖼️ Photo Gallery</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          {['▤', '☰'].map((icon, i) => <button key={i} onClick={() => setView(i === 0 ? 'grid' : 'list')} style={{ ...S.btnO, padding: '6px 10px', fontSize: 14 }}>{icon}</button>)}
        </div>
      </div>
      <div style={{ padding: '12px 16px' }}>
        <p style={{ color: '#64748b', fontSize: 13, margin: '0 0 12px' }}>12 photos · 1.4 GB used</p>
        {view === 'grid' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 3 }}>
            {photos.map(p => <div key={p.id} style={{ aspectRatio: '1', background: `hsl(${p.id * 30},50%,20%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, cursor: 'pointer', borderRadius: 4 }}>{p.emoji}</div>)}
          </div>
        ) : (
          photos.map(p => <div key={p.id} style={S.row}><div style={{ width: 48, height: 48, borderRadius: 8, background: `hsl(${p.id * 30},50%,20%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{p.emoji}</div><div style={{ flex: 1, marginLeft: 10 }}><div style={{ fontWeight: 600 }}>Photo {p.id + 1}</div><div style={{ fontSize: 12, color: '#64748b' }}>Taken May 2026</div></div><button style={{ ...S.btnO, padding: '6px 12px', fontSize: 12 }}>⋯</button></div>)
        )}
      </div>
    </div>
  );
}

export function MediaUploadPage() {
  const nav = useNavigate();
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState([]);
  return (
    <div style={S.page}>
      <div style={S.hdr}><button style={S.back} onClick={() => nav(-1)}>←</button><span style={S.title}>📤 Upload Media</span></div>
      <div style={{ padding: 16 }}>
        <div onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={e => { e.preventDefault(); setDragging(false); }} style={{ border: `2px dashed ${dragging ? '#6366f1' : 'rgba(255,255,255,0.15)'}`, borderRadius: 20, padding: 40, textAlign: 'center', cursor: 'pointer', background: dragging ? 'rgba(99,102,241,0.05)' : 'rgba(255,255,255,0.02)', transition: '0.2s', marginBottom: 20 }}>
          <div style={{ fontSize: 48 }}>☁️</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginTop: 12, marginBottom: 6 }}>Drag & drop files here</div>
          <div style={{ color: '#64748b', fontSize: 13 }}>or tap to browse · Photos, Videos, Audio</div>
          <div style={{ color: '#475569', fontSize: 12, marginTop: 8 }}>Max 2GB per file · JPG, PNG, MP4, MOV, MP3</div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <button style={{ ...S.btn, flex: 1 }}>📷 From Camera</button>
          <button style={{ ...S.btnO, flex: 1 }}>📁 Browse Files</button>
        </div>
        <div style={S.card}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Upload Settings</div>
          {[['📝 Title / Caption', 'input'], ['📂 Add to Collection', 'select'], ['🔒 Visibility', 'select']].map(([l]) => (
            <div key={l} style={{ marginBottom: 10 }}><label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>{l}</label><input style={S.inp} /></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MediaLibraryPage() {
  const nav = useNavigate();
  const [tab, setTab] = useState('all');
  const items = [{ type: 'photo', emoji: '🌅', name: 'Sunset Beach' }, { type: 'video', emoji: '🎬', name: 'Vlog #42' }, { type: 'photo', emoji: '🏙️', name: 'City Nights' }, { type: 'audio', emoji: '🎵', name: 'Podcast Ep 5' }, { type: 'video', emoji: '🎭', name: 'Event Coverage' }];
  const filtered = tab === 'all' ? items : items.filter(i => i.type === tab);
  return (
    <div style={S.page}>
      <div style={S.hdr}><button style={S.back} onClick={() => nav(-1)}>←</button><span style={S.title}>📚 My Media Library</span><button style={{ ...S.btn, marginLeft: 'auto', padding: '8px 14px', fontSize: 13 }}>+ Upload</button></div>
      <div style={{ display: 'flex', padding: '8px 16px', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        {[['all', 'All'], ['photo', 'Photos'], ['video', 'Videos'], ['audio', 'Audio']].map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)} style={{ background: tab === t ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.05)', border: tab === t ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '7px 14px', color: tab === t ? '#a5b4fc' : '#94a3b8', fontSize: 13, cursor: 'pointer' }}>{l}</button>
        ))}
      </div>
      {filtered.map((item, i) => (
        <div key={i} style={S.row}>
          <div style={{ width: 52, height: 52, borderRadius: 10, background: item.type === 'video' ? 'rgba(239,68,68,0.2)' : item.type === 'audio' ? 'rgba(99,102,241,0.2)' : 'rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{item.emoji}</div>
          <div style={{ flex: 1, marginLeft: 10 }}><div style={{ fontWeight: 600 }}>{item.name}</div><div style={{ fontSize: 12, color: '#64748b', textTransform: 'capitalize' }}>{item.type} · May 2026</div></div>
          <button style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 18 }}>⋯</button>
        </div>
      ))}
    </div>
  );
}

// ==================== GAMING SUBPAGES ====================
export function GameDetailPage() {
  const nav = useNavigate();
  const { id } = useParams();
  return (
    <div style={S.page}>
      <div style={S.hdr}><button style={S.back} onClick={() => nav(-1)}>←</button><span style={S.title}>🎮 Game Details</span></div>
      <div style={{ background: 'linear-gradient(to bottom,rgba(99,102,241,0.3),transparent)', padding: '24px 16px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: 72 }}>🎮</div>
        <h2 style={{ margin: '12px 0 4px' }}>Cyber Warriors 2046</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
          {['Action', 'Multiplayer', 'RPG'].map(t => <span key={t} style={S.tag('rgba(99,102,241,0.2)', '#a5b4fc')}>{t}</span>)}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, color: '#94a3b8', fontSize: 13 }}>
          <span>⭐ 4.8</span><span>👥 2.4M players</span><span>🆓 Free to Play</span>
        </div>
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <button style={{ ...S.btn, flex: 1 }}>🎮 Play Now</button>
          <button style={{ ...S.btnO, padding: '10px 16px' }}>📌 Save</button>
          <button style={{ ...S.btnO, padding: '10px 16px' }}>📤 Share</button>
        </div>
        <div style={S.card}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>About</div>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: 14, lineHeight: 1.6 }}>An immersive cyberpunk RPG set in 2046. Build your character, form alliances, and battle in stunning neon-lit arenas. 100+ hours of content with regular updates.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          {['📊 Leaderboard', '🏆 Achievements', '👥 Friends Playing', '📹 Clips'].map(l => (
            <button key={l} style={{ ...S.card, margin: 0, flex: 1, textAlign: 'center', fontSize: 12, cursor: 'pointer', padding: '12px 8px' }}>{l}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TournamentPage() {
  const nav = useNavigate();
  const [tab, setTab] = useState('active');
  const tournaments = {
    active: [{ name: 'Summer Championship', game: '🎮 Cyber Warriors', prize: '$5,000', entries: '128/256', ends: '2 days' }, { name: 'FPS Masters Cup', game: '🔫 Combat Zone', prize: '$1,000', entries: '64/64', ends: '12 hours' }],
    upcoming: [{ name: 'Fall League Season 3', game: '⚔️ Arena Legends', prize: '$10,000', entries: '0/512', ends: 'Starts June 30' }],
    past: [{ name: 'Spring Open', game: '🏆 All Games', prize: '$2,500', entries: '256/256', ends: 'Ended' }]
  };
  return (
    <div style={S.page}>
      <div style={S.hdr}><button style={S.back} onClick={() => nav(-1)}>←</button><span style={S.title}>🏆 Tournaments</span></div>
      <div style={{ display: 'flex', padding: '8px 16px', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        {[['active', 'Active'], ['upcoming', 'Upcoming'], ['past', 'Past']].map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)} style={{ background: tab === t ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.05)', border: tab === t ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '7px 14px', color: tab === t ? '#a5b4fc' : '#94a3b8', fontSize: 13, cursor: 'pointer' }}>{l}</button>
        ))}
      </div>
      <div style={{ padding: 16 }}>
        {tournaments[tab].map(t => (
          <div key={t.name} style={{ ...S.card, marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{t.name}</div>
              <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', borderRadius: 8, padding: '3px 8px', fontSize: 12, fontWeight: 700 }}>{t.prize}</span>
            </div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>{t.game}</div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>👥 {t.entries} · ⏱️ {t.ends}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ ...S.btn, flex: 1, padding: '8px' }}>View Bracket</button>
              {tab === 'active' && <button style={{ ...S.btnO, flex: 1, padding: '8px' }}>Register</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== VIDEO CALL SUBPAGES ====================
export function CallSetupPage() {
  const nav = useNavigate();
  const [search, setSearch] = useState('');
  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const contacts = ['Alex Rivera', 'Jordan Lee', 'Sam Chen', 'Taylor M.', 'Morgan D.', 'Casey K.'];
  const filtered = contacts.filter(c => c.toLowerCase().includes(search.toLowerCase()));
  return (
    <div style={S.page}>
      <div style={S.hdr}><button style={S.back} onClick={() => nav(-1)}>←</button><span style={S.title}>📞 New Call</span></div>
      <div style={{ padding: 16 }}>
        <div style={{ ...S.card, textAlign: 'center', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', marginBottom: 16 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>📹</div>
          <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 12 }}>Camera preview will appear when call starts</div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button onClick={() => setCamOn(!camOn)} style={{ ...S.btnO, padding: '10px 16px' }}>{camOn ? '📹' : '📷'} Camera {camOn ? 'On' : 'Off'}</button>
            <button onClick={() => setMicOn(!micOn)} style={{ ...S.btnO, padding: '10px 16px' }}>{micOn ? '🎙️' : '🔇'} Mic {micOn ? 'On' : 'Off'}</button>
          </div>
        </div>
        <div style={{ marginBottom: 16 }}><label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>🔍 Search contacts</label><input placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)} style={S.inp} /></div>
        <div>
          {filtered.map(name => (
            <div key={name} style={S.row}>
              <div style={S.av}>{name.split(' ').map(n => n[0]).join('')}</div>
              <span style={{ flex: 1, fontWeight: 600, marginLeft: 4 }}>{name}</span>
              <button onClick={() => nav('/videocalls/call/1')} style={{ ...S.btn, padding: '8px 16px', fontSize: 13 }}>📹 Video</button>
              <button onClick={() => nav('/videocalls/call/1')} style={{ ...S.btnO, padding: '8px 14px', fontSize: 13, marginLeft: 6 }}>📞 Audio</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ActiveCallPage() {
  const nav = useNavigate();
  const { id } = useParams();
  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [screenOn, setScreenOn] = useState(false);
  const [time, setTime] = useState('00:00');
  React.useEffect(() => {
    let s = 0;
    const t = setInterval(() => { s++; const m = Math.floor(s / 60).toString().padStart(2, '0'); const sc = (s % 60).toString().padStart(2, '0'); setTime(`${m}:${sc}`); }, 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ ...S.page, display: 'flex', flexDirection: 'column', height: '100dvh', background: '#000' }}>
      <div style={{ flex: 1, position: 'relative', background: 'linear-gradient(135deg,#1e1b4b,#0a0a18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 80 }}>👤</div>
        <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: 18 }}>Alex Rivera</div>
          <div style={{ color: '#10b981', fontSize: 14 }}>🔴 {time}</div>
        </div>
        {camOn && <div style={{ position: 'absolute', bottom: 80, right: 16, width: 90, height: 120, borderRadius: 12, background: 'rgba(99,102,241,0.3)', border: '2px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🤳</div>}
      </div>
      <div style={{ padding: '16px 24px', background: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
        {[
          { icon: micOn ? '🎙️' : '🔇', label: micOn ? 'Mute' : 'Unmute', action: () => setMicOn(!micOn), on: micOn },
          { icon: camOn ? '📹' : '📷', label: camOn ? 'Stop Video' : 'Start Video', action: () => setCamOn(!camOn), on: camOn },
          { icon: '🖥️', label: screenOn ? 'Stop Share' : 'Share Screen', action: () => setScreenOn(!screenOn), on: screenOn },
          { icon: '📝', label: 'Chat', action: () => {}, on: true },
          { icon: '📌', label: 'Pin', action: () => {}, on: true },
        ].map(ctrl => (
          <button key={ctrl.label} onClick={ctrl.action} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: ctrl.on ? 'rgba(255,255,255,0.12)' : 'rgba(239,68,68,0.3)', border: 'none', borderRadius: 16, padding: '10px 14px', cursor: 'pointer' }}>
            <span style={{ fontSize: 24 }}>{ctrl.icon}</span>
            <span style={{ fontSize: 10, color: '#94a3b8' }}>{ctrl.label}</span>
          </button>
        ))}
        <button onClick={() => nav(-1)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: '#ef4444', border: 'none', borderRadius: 16, padding: '10px 20px', cursor: 'pointer' }}>
          <span style={{ fontSize: 24 }}>📵</span>
          <span style={{ fontSize: 10, color: '#fff' }}>End</span>
        </button>
      </div>
    </div>
  );
}

// ==================== AR/VR SUBPAGES ====================
export function ARFilterPreviewPage() {
  const nav = useNavigate();
  const { id } = useParams();
  const filters = ['🌸 Cherry Blossom', '🔥 Fire Crown', '🌈 Rainbow Halo', '⭐ Star Field', '🎭 Comedy Mask', '💫 Galaxy Swirl'];
  const [active, setActive] = useState(0);
  return (
    <div style={S.page}>
      <div style={S.hdr}><button style={S.back} onClick={() => nav(-1)}>←</button><span style={S.title}>✨ AR Filter</span></div>
      <div style={{ background: '#1a1a2e', minHeight: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', position: 'relative' }}>
        <div style={{ fontSize: 80, filter: 'drop-shadow(0 0 20px rgba(99,102,241,0.8))' }}>🤳</div>
        <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', background: 'rgba(99,102,241,0.3)', borderRadius: 20, padding: '6px 16px', fontSize: 13, fontWeight: 700 }}>{filters[active]}</div>
        <div style={{ position: 'absolute', bottom: 16, right: 16, display: 'flex', gap: 8 }}>
          <button style={{ ...S.btn, padding: '8px 14px', fontSize: 13 }}>📸 Snap</button>
          <button style={{ ...S.btnO, padding: '8px 14px', fontSize: 13 }}>🎬 Record</button>
        </div>
      </div>
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', overflowX: 'auto', gap: 10, paddingBottom: 4 }}>
          {filters.map((f, i) => (
            <button key={f} onClick={() => setActive(i)} style={{ background: active === i ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.06)', border: active === i ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '10px 14px', color: active === i ? '#a5b4fc' : '#94a3b8', fontSize: 13, cursor: 'pointer', flexShrink: 0, textAlign: 'center' }}>{f}</button>
          ))}
        </div>
        <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
          <button style={{ ...S.btn, flex: 1 }}>💾 Save Filter</button>
          <button style={{ ...S.btnO, flex: 1 }}>📤 Share</button>
        </div>
      </div>
    </div>
  );
}

export function VRViewerPage() {
  const nav = useNavigate();
  const { id } = useParams();
  const experiences = [{ name: 'Virtual Tokyo', emoji: '🗼', viewers: '1.2K', desc: 'Walk through the streets of Tokyo in 360°' }, { name: 'Underwater World', emoji: '🌊', viewers: '856', desc: 'Dive into the Great Barrier Reef' }, { name: 'Space Station', emoji: '🚀', viewers: '2.1K', desc: 'Float through the ISS in zero gravity' }];
  return (
    <div style={S.page}>
      <div style={S.hdr}><button style={S.back} onClick={() => nav(-1)}>←</button><span style={S.title}>🥽 VR Experience</span></div>
      <div style={{ background: 'linear-gradient(135deg,#0f0c29,#302b63)', padding: 16, textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 12 }}>🥽</div>
        <h2 style={{ margin: '0 0 8px' }}>Virtual Tokyo</h2>
        <p style={{ color: '#94a3b8', margin: '0 0 16px' }}>360° immersive experience · 1.2K viewers now</p>
        <button style={{ ...S.btn, width: '100%', maxWidth: 280, fontSize: 16, padding: '14px' }}>🚀 Enter VR Experience</button>
        <p style={{ color: '#475569', fontSize: 12, marginTop: 8 }}>Works best with VR headset · Also available in 360° mode</p>
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 12 }}>🌍 More Experiences</div>
        {experiences.map(e => (
          <div key={e.name} style={{ ...S.card, display: 'flex', gap: 12, cursor: 'pointer', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontSize: 36 }}>{e.emoji}</div>
            <div style={{ flex: 1 }}><div style={{ fontWeight: 700 }}>{e.name}</div><div style={{ fontSize: 12, color: '#64748b' }}>{e.desc}</div><div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>👥 {e.viewers} viewers</div></div>
            <button style={{ ...S.btnO, padding: '8px 12px', fontSize: 12 }}>Enter</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== PREMIUM SUBPAGES ====================
export function PremiumCheckoutPage() {
  const nav = useNavigate();
  const [plan, setPlan] = useState('monthly');
  const plans = { monthly: { price: '$9.99', save: '' }, yearly: { price: '$7.99', save: 'Save 20%' }, lifetime: { price: '$99.99', save: 'Best Value' } };
  return (
    <div style={S.page}>
      <div style={S.hdr}><button style={S.back} onClick={() => nav(-1)}>←</button><span style={S.title}>⭐ Upgrade to Premium</span></div>
      <div style={{ padding: 16 }}>
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: 56, marginBottom: 8 }}>⭐</div>
          <h2 style={{ margin: '0 0 8px', background: 'linear-gradient(135deg,#f59e0b,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: 26 }}>LynkApp Premium</h2>
          <p style={{ color: '#94a3b8', margin: 0 }}>Unlock all features and remove ads</p>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {Object.entries(plans).map(([k, v]) => (
            <button key={k} onClick={() => setPlan(k)} style={{ flex: 1, background: plan === k ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)', border: plan === k ? '2px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '12px 6px', cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ fontWeight: 700, textTransform: 'capitalize', fontSize: 13, color: plan === k ? '#f59e0b' : '#f1f5f9' }}>{k}</div>
              <div style={{ fontWeight: 800, fontSize: 16, color: plan === k ? '#f59e0b' : '#f1f5f9' }}>{v.price}</div>
              {v.save && <div style={{ fontSize: 10, color: '#10b981', fontWeight: 700 }}>{v.save}</div>}
            </button>
          ))}
        </div>
        <div style={{ ...S.card, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>✨ Premium Benefits</div>
          {['No ads ever', 'Unlimited story views', '10x more matches in Dating', 'Exclusive profile badge', 'Advanced analytics', 'Priority customer support', 'Early access to new features', 'Larger media uploads (5GB)'].map(b => (
            <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ color: '#10b981', fontWeight: 700 }}>✓</span>
              <span style={{ fontSize: 14, color: '#cbd5e1' }}>{b}</span>
            </div>
          ))}
        </div>
        <button onClick={() => nav('/premium')} style={{ ...S.btn, width: '100%', fontSize: 16, padding: '14px', background: 'linear-gradient(135deg,#f59e0b,#ec4899)' }}>🚀 Start Premium — {plans[plan].price}/{plan === 'lifetime' ? 'once' : plan.slice(0, 5)}</button>
        <p style={{ color: '#475569', fontSize: 12, textAlign: 'center', marginTop: 10 }}>Cancel anytime · Secure payment · 7-day free trial</p>
      </div>
    </div>
  );
}

export function SubscriptionManagePage() {
  const nav = useNavigate();
  const [plan] = useState({ name: 'Premium Monthly', price: '$9.99/month', nextBilling: 'June 20, 2026', status: 'Active', method: 'Visa •••• 4242' });
  return (
    <div style={S.page}>
      <div style={S.hdr}><button style={S.back} onClick={() => nav(-1)}>←</button><span style={S.title}>⭐ Manage Subscription</span></div>
      <div style={{ padding: 16 }}>
        <div style={{ ...S.card, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>⭐</div>
          <div style={{ fontWeight: 800, fontSize: 18, color: '#f59e0b' }}>{plan.name}</div>
          <div style={{ fontSize: 14, color: '#94a3b8', marginTop: 4 }}>{plan.price}</div>
          <span style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 700 }}>ACTIVE</span>
        </div>
        {[['📅 Next Billing', plan.nextBilling], ['💳 Payment Method', plan.method], ['📧 Receipt Email', 'user@email.com']].map(([l, v]) => (
          <div key={l} style={S.row}><span style={{ flex: 1, color: '#94a3b8', fontSize: 14 }}>{l}</span><span style={{ fontWeight: 600 }}>{v}</span></div>
        ))}
        <div style={{ marginTop: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>📋 Billing History</div>
          {[['May 20, 2026', '$9.99', 'Paid'], ['Apr 20, 2026', '$9.99', 'Paid'], ['Mar 20, 2026', '$9.99', 'Paid']].map(([d, amt, s]) => (
            <div key={d} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 14 }}>
              <span style={{ color: '#94a3b8' }}>{d}</span><span>{amt}</span><span style={{ color: '#10b981' }}>{s}</span><button style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: 12 }}>Receipt</button>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
          <button style={{ ...S.btnO, flex: 1 }}>Change Plan</button>
          <button style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '10px 20px', color: '#ef4444', fontWeight: 600, cursor: 'pointer', flex: 1 }}>Cancel Subscription</button>
        </div>
      </div>
    </div>
  );
}

// ==================== HELP/SUPPORT SUBPAGES ====================
export function SupportTicketPage() {
  const nav = useNavigate();
  const [step, setStep] = useState('new');
  const [form, setForm] = useState({ category: '', subject: '', desc: '', priority: 'Medium' });
  const cats = ['🐛 Bug Report', '💳 Billing Issue', '🔒 Account Access', '🚫 Content/Safety', '📱 App Performance', '💡 Feature Request', '❓ General Question'];
  const myTickets = [{ id: '#4821', subject: 'Payment not processing', status: 'Open', date: 'May 19', priority: 'High' }, { id: '#4756', subject: 'Profile photo not uploading', status: 'Resolved', date: 'May 15', priority: 'Medium' }];
  return (
    <div style={S.page}>
      <div style={S.hdr}><button style={S.back} onClick={() => nav(-1)}>←</button><span style={S.title}>🎫 Support Tickets</span></div>
      <div style={{ display: 'flex', padding: '8px 16px', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        {[['new', '+ New Ticket'], ['history', 'My Tickets (2)']].map(([t, l]) => (
          <button key={t} onClick={() => setStep(t)} style={{ background: step === t ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.05)', border: step === t ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '7px 14px', color: step === t ? '#a5b4fc' : '#94a3b8', fontSize: 13, cursor: 'pointer' }}>{l}</button>
        ))}
      </div>
      {step === 'new' ? (
        <div style={{ padding: 16 }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>Category *</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {cats.map(c => <button key={c} onClick={() => setForm(p => ({ ...p, category: c }))} style={{ ...S.tag(form.category === c ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.06)', form.category === c ? '#a5b4fc' : '#94a3b8'), border: form.category === c ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', padding: '7px 12px', fontSize: 12 }}>{c}</button>)}
            </div>
          </div>
          <div style={{ marginBottom: 10 }}><label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>Subject *</label><input placeholder="Briefly describe your issue" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} style={S.inp} /></div>
          <div style={{ marginBottom: 10 }}><label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>Description *</label><textarea placeholder="Please provide as much detail as possible..." value={form.desc} onChange={e => setForm(p => ({ ...p, desc: e.target.value }))} style={{ ...S.inp, minHeight: 100, resize: 'none' }} /></div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>Priority</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['Low', 'Medium', 'High', 'Urgent'].map(p => <button key={p} onClick={() => setForm(f => ({ ...f, priority: p }))} style={{ flex: 1, padding: '8px', borderRadius: 10, border: form.priority === p ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.1)', background: form.priority === p ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)', color: form.priority === p ? '#a5b4fc' : '#94a3b8', cursor: 'pointer', fontSize: 12 }}>{p}</button>)}
            </div>
          </div>
          <button disabled={!form.subject || !form.desc} onClick={() => setStep('history')} style={{ ...S.btn, width: '100%', opacity: form.subject && form.desc ? 1 : 0.5 }}>Submit Ticket</button>
        </div>
      ) : (
        <div>
          {myTickets.map(t => (
            <div key={t.id} style={{ ...S.card, margin: '10px 16px', cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontWeight: 700 }}>{t.id}</span>
                <span style={S.tag(t.status === 'Open' ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)', t.status === 'Open' ? '#f59e0b' : '#10b981')}>{t.status}</span>
              </div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{t.subject}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{t.date} · Priority: {t.priority}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== SAVED SUBPAGES ====================
export function CollectionPage() {
  const nav = useNavigate();
  const { id } = useParams();
  const items = [{ emoji: '🌅', title: 'Sunset Photography Guide' }, { emoji: '💻', title: 'Top 10 Coding Tips' }, { emoji: '🍕', title: 'Best Pizza Recipes' }, { emoji: '🎮', title: 'Gaming Setup Tour' }];
  return (
    <div style={S.page}>
      <div style={S.hdr}><button style={S.back} onClick={() => nav(-1)}>←</button><span style={S.title}>📁 Tech Tips Collection</span><button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 18, marginLeft: 'auto' }}>⋯</button></div>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <p style={{ margin: 0, color: '#64748b', fontSize: 13 }}>{items.length} saved items · Updated today</p>
      </div>
      {items.map((item, i) => (
        <div key={i} style={{ ...S.row }} onClick={() => nav(`/post/${i + 1}`)}>
          <div style={{ width: 52, height: 52, borderRadius: 10, background: `hsl(${i * 50},50%,20%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{item.emoji}</div>
          <div style={{ flex: 1, marginLeft: 10 }}><div style={{ fontWeight: 600 }}>{item.title}</div><div style={{ fontSize: 12, color: '#64748b' }}>Saved May 2026</div></div>
          <button style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 18 }}>⋯</button>
        </div>
      ))}
    </div>
  );
}

export function CollectionCreatePage() {
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [privacy, setPrivacy] = useState('Private');
  return (
    <div style={S.page}>
      <div style={S.hdr}><button style={S.back} onClick={() => nav(-1)}>←</button><span style={S.title}>➕ New Collection</span></div>
      <div style={{ padding: 16 }}>
        <div style={{ marginBottom: 16 }}><label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>Collection Name *</label><input placeholder="e.g. Travel Inspiration" value={name} onChange={e => setName(e.target.value)} style={S.inp} /></div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Privacy</div>
          {[['🔒 Private', 'Only you can see this'], ['👥 Friends', 'Friends can see this'], ['🌍 Public', 'Anyone can see this']].map(([l, d]) => (
            <div key={l} onClick={() => setPrivacy(l.split(' ')[1])} style={{ ...S.card, cursor: 'pointer', border: privacy === l.split(' ')[1] ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.07)', marginBottom: 8 }}>
              <div style={{ fontWeight: 600 }}>{l}</div><div style={{ fontSize: 12, color: '#64748b' }}>{d}</div>
            </div>
          ))}
        </div>
        <button disabled={!name} onClick={() => nav('/saved')} style={{ ...S.btn, width: '100%', opacity: name ? 1 : 0.5 }}>Create Collection</button>
      </div>
    </div>
  );
}

// ==================== MARKETPLACE EXTRAS ====================
export function CartPage() {
  const nav = useNavigate();
  const [items, setItems] = useState([
    { id: 1, name: 'Wireless Headphones Pro', price: 89.99, qty: 1, emoji: '🎧' },
    { id: 2, name: 'Phone Stand Deluxe', price: 24.99, qty: 2, emoji: '📱' },
    { id: 3, name: 'USB-C Hub 7-in-1', price: 49.99, qty: 1, emoji: '🔌' },
  ]);
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const update = (id, delta) => setItems(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  const remove = (id) => setItems(prev => prev.filter(i => i.id !== id));
  return (
    <div style={S.page}>
      <div style={S.hdr}><button style={S.back} onClick={() => nav(-1)}>←</button><span style={S.title}>🛒 Cart ({items.length})</span></div>
      <div style={{ padding: 16 }}>
        {items.map(item => (
          <div key={item.id} style={{ ...S.card, display: 'flex', gap: 12, marginBottom: 10 }}>
            <div style={{ width: 56, height: 56, borderRadius: 12, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>{item.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{item.name}</div>
              <div style={{ fontWeight: 800, color: '#10b981', marginBottom: 8 }}>${(item.price * item.qty).toFixed(2)}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={() => update(item.id, -1)} style={{ ...S.btnO, padding: '4px 10px', fontSize: 16 }}>−</button>
                <span style={{ fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{item.qty}</span>
                <button onClick={() => update(item.id, 1)} style={{ ...S.btnO, padding: '4px 10px', fontSize: 16 }}>+</button>
                <button onClick={() => remove(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 13, marginLeft: 'auto' }}>🗑️ Remove</button>
              </div>
            </div>
          </div>
        ))}
        <div style={{ ...S.card, background: 'rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span style={{ color: '#94a3b8' }}>Subtotal</span><span>${total.toFixed(2)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span style={{ color: '#94a3b8' }}>Shipping</span><span style={{ color: '#10b981' }}>FREE</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 16, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 10, marginTop: 6 }}><span>Total</span><span style={{ color: '#10b981' }}>${total.toFixed(2)}</span></div>
        </div>
        <button style={{ ...S.btn, width: '100%', marginTop: 16, fontSize: 16, padding: '14px', background: 'linear-gradient(135deg,#10b981,#6366f1)' }}>✅ Checkout (${total.toFixed(2)})</button>
      </div>
    </div>
  );
}

export function ListingBoostPage() {
  const nav = useNavigate();
  const { id } = useParams();
  const [tier, setTier] = useState(1);
  const tiers = [{ days: 1, price: '$2.99', views: '~500 extra views', reach: '2x' }, { days: 7, price: '$9.99', views: '~3,500 extra views', reach: '5x', popular: true }, { days: 30, price: '$24.99', views: '~15,000 extra views', reach: '10x' }];
  return (
    <div style={S.page}>
      <div style={S.hdr}><button style={S.back} onClick={() => nav(-1)}>←</button><span style={S.title}>🚀 Boost Listing</span></div>
      <div style={{ padding: 16 }}>
        <div style={{ ...S.card, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.3)', marginBottom: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Wireless Headphones Pro</div>
          <div style={{ fontSize: 14, color: '#64748b' }}>Current views: 47 · This week: 12 views</div>
        </div>
        {tiers.map((t, i) => (
          <div key={i} onClick={() => setTier(i)} style={{ ...S.card, cursor: 'pointer', border: tier === i ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.07)', position: 'relative', marginBottom: 12 }}>
            {t.popular && <span style={{ position: 'absolute', top: -10, right: 16, background: '#6366f1', color: '#fff', borderRadius: 20, padding: '2px 10px', fontSize: 10, fontWeight: 700 }}>BEST VALUE</span>}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><div style={{ fontWeight: 700 }}>{t.days} Day{t.days > 1 ? 's' : ''} Boost</div><div style={{ fontSize: 13, color: '#64748b' }}>{t.views} · {t.reach} more exposure</div></div>
              <div style={{ fontWeight: 800, fontSize: 18, color: '#6366f1' }}>{t.price}</div>
            </div>
          </div>
        ))}
        <button onClick={() => nav(-1)} style={{ ...S.btn, width: '100%', marginTop: 8 }}>Boost Now — {tiers[tier].price}</button>
      </div>
    </div>
  );
}

// ==================== FRIENDS EXTRAS ====================
export function ContactImportPage() {
  const nav = useNavigate();
  const [tab, setTab] = useState('suggested');
  const suggested = [{ name: 'Jamie Wilson', mutual: 5 }, { name: 'Riley Parks', mutual: 3 }, { name: 'Casey Thompson', mutual: 8 }, { name: 'Drew Mitchell', mutual: 2 }];
  const [added, setAdded] = useState({});
  return (
    <div style={S.page}>
      <div style={S.hdr}><button style={S.back} onClick={() => nav(-1)}>←</button><span style={S.title}>👥 Find Friends</span></div>
      <div style={{ display: 'flex', padding: '8px 16px', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        {[['suggested', 'Suggested'], ['contacts', 'Contacts'], ['search', 'Search']].map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)} style={{ background: tab === t ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.05)', border: tab === t ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '7px 14px', color: tab === t ? '#a5b4fc' : '#94a3b8', fontSize: 13, cursor: 'pointer' }}>{l}</button>
        ))}
      </div>
      {tab === 'contacts' && (
        <div style={{ padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📱</div>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Sync Your Contacts</div>
          <p style={{ color: '#64748b', marginBottom: 20 }}>Find people you know by syncing your phone contacts</p>
          <button style={{ ...S.btn, width: '100%' }}>📇 Sync Contacts</button>
        </div>
      )}
      {tab === 'suggested' && suggested.map(p => (
        <div key={p.name} style={S.row}>
          <div style={S.av}>{p.name.split(' ').map(n => n[0]).join('')}</div>
          <div style={{ flex: 1, marginLeft: 4 }}><div style={{ fontWeight: 700 }}>{p.name}</div><div style={{ fontSize: 12, color: '#64748b' }}>{p.mutual} mutual friends</div></div>
          <button onClick={() => setAdded(a => ({ ...a, [p.name]: true }))} style={{ ...(added[p.name] ? S.btnO : S.btn), padding: '7px 14px', fontSize: 13 }}>{added[p.name] ? '✓ Sent' : '+ Add'}</button>
        </div>
      ))}
      {tab === 'search' && (
        <div style={{ padding: 16 }}>
          <input placeholder="🔍 Search by name or username" style={S.inp} />
          <p style={{ color: '#64748b', textAlign: 'center', marginTop: 20 }}>Type to search for people</p>
        </div>
      )}
    </div>
  );
}
