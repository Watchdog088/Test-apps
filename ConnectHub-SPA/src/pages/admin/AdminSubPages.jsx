// src/pages/admin/AdminSubPages.jsx
// NEW dashboards added for beta — AdminUsersPage + AdminAnnouncementsPage
// Route: /admin/users  |  /admin/announcements

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/* ─── Shared styles ─────────────────────────────────────────── */
const S = {
  page:  { minHeight:'100dvh', background:'#0a0a18', color:'#f1f5f9', fontFamily:'system-ui,sans-serif', paddingBottom:80 },
  hdr:   { display:'flex', alignItems:'center', gap:12, padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,0.07)', position:'sticky', top:0, background:'rgba(10,10,24,0.97)', backdropFilter:'blur(20px)', zIndex:10 },
  back:  { background:'rgba(255,255,255,0.08)', border:'none', borderRadius:10, padding:'8px 14px', color:'#f1f5f9', fontSize:18, cursor:'pointer' },
  title: { fontSize:17, fontWeight:700, color:'#f1f5f9' },
  badge: (bg,col) => ({ background:bg, color:col, borderRadius:8, padding:'3px 9px', fontSize:11, fontWeight:700 }),
  card:  { background:'rgba(255,255,255,0.04)', borderRadius:16, padding:14, border:'1px solid rgba(255,255,255,0.07)' },
  inp:   { background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:12, padding:'11px 14px', color:'#f1f5f9', fontSize:14, width:'100%', boxSizing:'border-box', outline:'none' },
  btn:   { background:'linear-gradient(135deg,#6366f1,#ec4899)', border:'none', borderRadius:12, padding:'10px 18px', color:'#fff', fontWeight:700, cursor:'pointer', fontSize:13 },
  btnO:  { background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.14)', borderRadius:12, padding:'9px 16px', color:'#f1f5f9', fontWeight:600, cursor:'pointer', fontSize:13 },
  btnR:  { background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:12, padding:'9px 16px', color:'#ef4444', fontWeight:600, cursor:'pointer', fontSize:13 },
  row:   { display:'flex', alignItems:'center', gap:12, padding:'13px 16px', borderBottom:'1px solid rgba(255,255,255,0.05)' },
  av:    { width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg,#6366f1,#ec4899)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'#fff', flexShrink:0 },
  tab:   (active) => ({ flex:1, padding:'10px', fontSize:13, fontWeight:700, background:'none', border:'none', borderBottom:`2px solid ${active ? '#6366f1' : 'transparent'}`, color:active ? '#818cf8' : '#475569', cursor:'pointer', transition:'all 0.2s' }),
};

/* ─── Dummy user data ──────────────────────────────────────── */
const USERS = [
  { id:'u1', name:'Alex Rivera',   handle:'alexrivera',  email:'alex@example.com',  role:'user',   status:'active',   joined:'May 1, 2026',  posts:142, reports:0   },
  { id:'u2', name:'Jordan Lee',    handle:'jordanlee',   email:'jordan@example.com',role:'creator', status:'active',   joined:'Apr 22, 2026', posts:389, reports:1   },
  { id:'u3', name:'Sam Chen',      handle:'samchen',     email:'sam@example.com',   role:'user',   status:'active',   joined:'May 5, 2026',  posts:67,  reports:0   },
  { id:'u4', name:'Taylor Morgan', handle:'taylormorgan',email:'taylor@example.com',role:'admin',  status:'active',   joined:'Jan 10, 2026', posts:22,  reports:0   },
  { id:'u5', name:'Casey Blake',   handle:'caseyblake',  email:'casey@example.com', role:'user',   status:'suspended',joined:'May 8, 2026',  posts:15,  reports:4   },
  { id:'u6', name:'Morgan Davis',  handle:'morgandavis', email:'morgan@example.com',role:'user',   status:'banned',   joined:'Apr 30, 2026', posts:7,   reports:12  },
  { id:'u7', name:'Riley Patel',   handle:'rileypatel',  email:'riley@example.com', role:'creator', status:'active',  joined:'Mar 14, 2026', posts:501, reports:0   },
  { id:'u8', name:'Drew Kim',      handle:'drewkim',     email:'drew@example.com',  role:'user',   status:'active',   joined:'May 12, 2026', posts:9,   reports:0   },
];

const ROLE_COLORS   = { admin:'rgba(245,158,11,0.2)', creator:'rgba(99,102,241,0.2)', user:'rgba(255,255,255,0.06)' };
const ROLE_TEXT     = { admin:'#f59e0b', creator:'#a5b4fc', user:'#64748b' };
const STATUS_COLORS = { active:'rgba(16,185,129,0.15)', suspended:'rgba(245,158,11,0.15)', banned:'rgba(239,68,68,0.15)' };
const STATUS_TEXT   = { active:'#10b981', suspended:'#f59e0b', banned:'#ef4444' };

/* ══════════════════════════════════════════════════════
   ADMIN USER MANAGEMENT PAGE — /admin/users
══════════════════════════════════════════════════════ */
export function AdminUsersPage() {
  const navigate = useNavigate();
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('all');
  const [selected, setSelected] = useState(null);
  const [users, setUsers]     = useState(USERS);

  const filtered = users.filter(u => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.handle.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || u.status === filter || u.role === filter;
    return matchSearch && matchFilter;
  });

  const changeStatus = (id, newStatus) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));
    setSelected(null);
  };

  const changeRole = (id, newRole) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
    setSelected(null);
  };

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.hdr}>
        <button style={S.back} onClick={() => navigate('/admin')}>←</button>
        <span style={S.title}>👥 User Management</span>
        <span style={{ marginLeft:'auto', ...S.badge('rgba(239,68,68,0.15)','#ef4444') }}>🔴 ADMIN</span>
      </div>

      {/* Stats strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, padding:'12px 16px' }}>
        {[
          { label:'Total', val: users.length, color:'#6366f1' },
          { label:'Active', val: users.filter(u=>u.status==='active').length, color:'#10b981' },
          { label:'Suspended', val: users.filter(u=>u.status==='suspended').length, color:'#f59e0b' },
          { label:'Banned', val: users.filter(u=>u.status==='banned').length, color:'#ef4444' },
        ].map(s => (
          <div key={s.label} style={{ ...S.card, textAlign:'center', padding:'10px 8px', border:`1px solid ${s.color}30` }}>
            <div style={{ fontSize:22, fontWeight:900, color:s.color }}>{s.val}</div>
            <div style={{ fontSize:10, color:'#64748b', marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div style={{ padding:'0 16px 12px', display:'flex', flexDirection:'column', gap:8 }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Search by name, handle, or email..."
          style={S.inp}
        />
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {[['all','All'],['active','Active'],['suspended','Suspended'],['banned','Banned'],['admin','Admins'],['creator','Creators']].map(([val,label]) => (
            <button key={val} onClick={() => setFilter(val)} style={{ padding:'6px 12px', borderRadius:20, fontSize:12, fontWeight:600, cursor:'pointer', background: filter===val ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.05)', border: filter===val ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.1)', color: filter===val ? '#a5b4fc' : '#94a3b8' }}>{label}</button>
          ))}
        </div>
      </div>

      {/* User list */}
      <div style={{ borderTop:'1px solid rgba(255,255,255,0.07)' }}>
        {filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:'40px 20px', color:'#475569' }}>No users found</div>
        )}
        {filtered.map(u => (
          <div key={u.id}>
            <div onClick={() => setSelected(selected?.id === u.id ? null : u)} style={{ ...S.row, cursor:'pointer', background: selected?.id === u.id ? 'rgba(99,102,241,0.07)' : 'transparent' }}>
              <div style={S.av}>{u.name.split(' ').map(n=>n[0]).join('')}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:700, fontSize:14, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.name}</div>
                <div style={{ fontSize:12, color:'#64748b' }}>@{u.handle}</div>
              </div>
              <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                <span style={S.badge(ROLE_COLORS[u.role], ROLE_TEXT[u.role])}>{u.role}</span>
                <span style={S.badge(STATUS_COLORS[u.status], STATUS_TEXT[u.status])}>{u.status}</span>
              </div>
            </div>

            {/* Expanded actions */}
            {selected?.id === u.id && (
              <div style={{ padding:'12px 16px 16px', background:'rgba(99,102,241,0.05)', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ fontSize:12, color:'#64748b', marginBottom:10 }}>
                  📧 {u.email} · 📅 Joined {u.joined} · 📝 {u.posts} posts · ⚠️ {u.reports} reports
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  <button onClick={() => navigate(`/profile/${u.id}`)} style={{ ...S.btnO, padding:'7px 12px', fontSize:12 }}>👁️ View Profile</button>
                  {u.status !== 'active' && (
                    <button onClick={() => changeStatus(u.id, 'active')} style={{ ...S.btn, padding:'7px 12px', fontSize:12, background:'rgba(16,185,129,0.2)', color:'#10b981', border:'1px solid rgba(16,185,129,0.4)' }}>✅ Unsuspend</button>
                  )}
                  {u.status === 'active' && (
                    <button onClick={() => changeStatus(u.id, 'suspended')} style={{ ...S.btnO, padding:'7px 12px', fontSize:12 }}>⏸️ Suspend</button>
                  )}
                  {u.status !== 'banned' && (
                    <button onClick={() => changeStatus(u.id, 'banned')} style={{ ...S.btnR, padding:'7px 12px', fontSize:12 }}>🚫 Ban User</button>
                  )}
                  {u.role !== 'admin' && (
                    <button onClick={() => changeRole(u.id, 'admin')} style={{ ...S.btnO, padding:'7px 12px', fontSize:12 }}>👑 Make Admin</button>
                  )}
                  {u.role === 'admin' && u.id !== 'u4' && (
                    <button onClick={() => changeRole(u.id, 'user')} style={{ ...S.btnR, padding:'7px 12px', fontSize:12 }}>👤 Remove Admin</button>
                  )}
                  {u.role !== 'creator' && (
                    <button onClick={() => changeRole(u.id, 'creator')} style={{ ...S.btn, padding:'7px 12px', fontSize:12 }}>🎬 Grant Creator</button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   ADMIN ANNOUNCEMENTS PAGE — /admin/announcements
══════════════════════════════════════════════════════ */
const ANNOUNCEMENT_TEMPLATES = [
  { label:'🛠 Maintenance', body:'LynkApp will undergo scheduled maintenance on [DATE] from [START] to [END]. Some features may be temporarily unavailable.' },
  { label:'🎉 New Feature', body:'We just launched [FEATURE]! Head to [SECTION] to try it out and let us know what you think.' },
  { label:'⚠️ Policy Update', body:'We have updated our Terms of Service and Privacy Policy. Changes take effect on [DATE]. Please review the updates.' },
  { label:'🏆 Contest', body:'Enter our [CONTEST NAME] for a chance to win [PRIZE]! Submit your entry by [DEADLINE].' },
];

export function AdminAnnouncementsPage() {
  const navigate = useNavigate();
  const [tab, setTab]     = useState('compose');
  const [form, setForm]   = useState({ title:'', body:'', audience:'all', priority:'normal', schedule:'now', scheduleAt:'' });
  const [sent, setSent]   = useState(false);

  const past = [
    { id:'a1', title:'Welcome to Beta!',  audience:'all',    sent:'May 15, 2026', views:8420, priority:'high'   },
    { id:'a2', title:'New Dating Features Released', audience:'all', sent:'May 18, 2026', views:6110, priority:'normal' },
    { id:'a3', title:'Marketplace Now Live',    audience:'all', sent:'May 20, 2026', views:7850, priority:'high'   },
  ];

  const handleSend = () => {
    if (!form.title || !form.body) return;
    setSent(true);
    setTimeout(() => { setSent(false); setForm({ title:'', body:'', audience:'all', priority:'normal', schedule:'now', scheduleAt:'' }); }, 2000);
  };

  return (
    <div style={S.page}>
      <div style={S.hdr}>
        <button style={S.back} onClick={() => navigate('/admin')}>←</button>
        <span style={S.title}>📢 Announcements</span>
        <span style={{ marginLeft:'auto', ...S.badge('rgba(239,68,68,0.15)','#ef4444') }}>🔴 ADMIN</span>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
        {[['compose','✍️ Compose'],['history','📜 History']].map(([t,l]) => (
          <button key={t} onClick={() => setTab(t)} style={S.tab(tab===t)}>{l}</button>
        ))}
      </div>

      {/* Compose tab */}
      {tab === 'compose' && (
        <div style={{ padding:16 }}>
          {sent && (
            <div style={{ ...S.card, background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', textAlign:'center', marginBottom:16 }}>
              <div style={{ fontSize:28 }}>✅</div>
              <div style={{ color:'#10b981', fontWeight:700 }}>Announcement sent!</div>
            </div>
          )}

          {/* Quick templates */}
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>Quick Templates</div>
            <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:4 }}>
              {ANNOUNCEMENT_TEMPLATES.map(t => (
                <button key={t.label} onClick={() => setForm(f => ({ ...f, body: t.body }))} style={{ ...S.btnO, fontSize:12, padding:'7px 12px', flexShrink:0 }}>{t.label}</button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div style={{ marginBottom:12 }}>
            <label style={{ fontSize:11, color:'#64748b', fontWeight:700, display:'block', marginBottom:5, letterSpacing:1 }}>TITLE *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title:e.target.value }))} placeholder="e.g. Welcome to Beta Testing!" style={S.inp} />
          </div>

          {/* Body */}
          <div style={{ marginBottom:12 }}>
            <label style={{ fontSize:11, color:'#64748b', fontWeight:700, display:'block', marginBottom:5, letterSpacing:1 }}>MESSAGE *</label>
            <textarea value={form.body} onChange={e => setForm(f => ({ ...f, body:e.target.value }))} placeholder="Write your announcement message here..." style={{ ...S.inp, minHeight:100, resize:'vertical', fontFamily:'inherit' }} />
            <div style={{ textAlign:'right', fontSize:11, color:'#475569', marginTop:3 }}>{form.body.length} chars</div>
          </div>

          {/* Audience + Priority row */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
            <div>
              <label style={{ fontSize:11, color:'#64748b', fontWeight:700, display:'block', marginBottom:5, letterSpacing:1 }}>AUDIENCE</label>
              <select value={form.audience} onChange={e => setForm(f => ({ ...f, audience:e.target.value }))} style={{ ...S.inp, appearance:'none' }}>
                <option value="all">👥 All Users</option>
                <option value="premium">⭐ Premium Only</option>
                <option value="creators">🎬 Creators Only</option>
                <option value="beta">🧪 Beta Testers</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize:11, color:'#64748b', fontWeight:700, display:'block', marginBottom:5, letterSpacing:1 }}>PRIORITY</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority:e.target.value }))} style={{ ...S.inp, appearance:'none' }}>
                <option value="low">🟢 Low</option>
                <option value="normal">🔵 Normal</option>
                <option value="high">🟡 High</option>
                <option value="urgent">🔴 Urgent</option>
              </select>
            </div>
          </div>

          {/* Schedule */}
          <div style={{ marginBottom:16 }}>
            <label style={{ fontSize:11, color:'#64748b', fontWeight:700, display:'block', marginBottom:8, letterSpacing:1 }}>SCHEDULE</label>
            <div style={{ display:'flex', gap:8 }}>
              {[['now','Send Now'],['scheduled','Schedule']].map(([v,l]) => (
                <button key={v} onClick={() => setForm(f => ({ ...f, schedule:v }))} style={{ flex:1, padding:'9px', borderRadius:12, border: form.schedule===v ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.1)', background: form.schedule===v ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)', color: form.schedule===v ? '#a5b4fc' : '#94a3b8', fontSize:13, fontWeight:600, cursor:'pointer' }}>{l}</button>
              ))}
            </div>
            {form.schedule === 'scheduled' && (
              <input type="datetime-local" value={form.scheduleAt} onChange={e => setForm(f => ({ ...f, scheduleAt:e.target.value }))} style={{ ...S.inp, marginTop:8 }} />
            )}
          </div>

          {/* Preview card */}
          {form.title && (
            <div style={{ ...S.card, background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.3)', marginBottom:16 }}>
              <div style={{ fontSize:10, fontWeight:700, color:'#6366f1', letterSpacing:1, textTransform:'uppercase', marginBottom:6 }}>📱 Preview</div>
              <div style={{ fontWeight:800, fontSize:15, marginBottom:4 }}>{form.title || '—'}</div>
              <div style={{ fontSize:13, color:'#94a3b8', lineHeight:1.5 }}>{form.body || '—'}</div>
              <div style={{ fontSize:11, color:'#475569', marginTop:8 }}>Audience: {form.audience} · Priority: {form.priority}</div>
            </div>
          )}

          <button disabled={!form.title || !form.body} onClick={handleSend} style={{ ...S.btn, width:'100%', padding:13, fontSize:15, opacity: form.title && form.body ? 1 : 0.45 }}>
            {form.schedule === 'now' ? '📢 Send Announcement Now' : '⏰ Schedule Announcement'}
          </button>
        </div>
      )}

      {/* History tab */}
      {tab === 'history' && (
        <div style={{ padding:'12px 0' }}>
          {past.map(a => (
            <div key={a.id} style={{ ...S.card, margin:'8px 16px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                <div style={{ fontWeight:700, fontSize:14 }}>{a.title}</div>
                <span style={S.badge(a.priority==='high' ? 'rgba(245,158,11,0.2)':'rgba(16,185,129,0.15)', a.priority==='high' ? '#f59e0b':'#10b981')}>{a.priority}</span>
              </div>
              <div style={{ fontSize:12, color:'#64748b' }}>📅 {a.sent} · 👥 {a.audience} · 👁️ {a.views.toLocaleString()} views</div>
              <div style={{ display:'flex', gap:8, marginTop:10 }}>
                <button style={{ ...S.btnO, padding:'6px 12px', fontSize:12 }}>📊 Analytics</button>
                <button style={{ ...S.btnO, padding:'6px 12px', fontSize:12 }}>📋 Duplicate</button>
                <button style={{ ...S.btnR, padding:'6px 12px', fontSize:12 }}>🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
