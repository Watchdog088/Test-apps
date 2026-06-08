// src/pages/admin/AdminExtraPages.jsx
// NEW Jun 2026: AdminBetaFeedbackPage + AdminContentModerationPage
// Routes: /admin/beta-feedback  |  /admin/content
// AdminUsersPage (Firestore version) is also here — replaces hardcoded dummy data in AdminSubPages

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { db } from '../../firebase/config';
import {
  collection, query, where, orderBy, limit,
  onSnapshot, doc, updateDoc, serverTimestamp,
  getDocs, startAfter, getCountFromServer
} from 'firebase/firestore';

/* ─── Shared styles ─────────────────────────────────────────── */
const S = {
  page:  { minHeight:'100dvh', background:'#0a0a18', color:'#f1f5f9', fontFamily:'system-ui,sans-serif', paddingBottom:80 },
  hdr:   { display:'flex', alignItems:'center', gap:12, padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,0.07)', position:'sticky', top:0, background:'rgba(10,10,24,0.97)', backdropFilter:'blur(20px)', zIndex:10 },
  back:  { background:'rgba(255,255,255,0.08)', border:'none', borderRadius:10, padding:'8px 14px', color:'#f1f5f9', fontSize:18, cursor:'pointer' },
  title: { fontSize:17, fontWeight:700 },
  badge: (bg,col) => ({ background:bg, color:col, borderRadius:8, padding:'3px 9px', fontSize:11, fontWeight:700 }),
  card:  { background:'rgba(255,255,255,0.04)', borderRadius:16, padding:14, border:'1px solid rgba(255,255,255,0.07)' },
  inp:   { background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:12, padding:'11px 14px', color:'#f1f5f9', fontSize:14, width:'100%', boxSizing:'border-box', outline:'none' },
  btn:   (bg,col) => ({ background:bg, border:'none', borderRadius:12, padding:'9px 16px', color:col, fontWeight:700, cursor:'pointer', fontSize:13 }),
  row:   { display:'flex', alignItems:'center', gap:12, padding:'13px 16px', borderBottom:'1px solid rgba(255,255,255,0.05)' },
  av:    { width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg,#6366f1,#ec4899)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'#fff', flexShrink:0 },
  tab:   (active) => ({ flex:1, padding:'10px', fontSize:13, fontWeight:700, background:'none', border:'none', borderBottom:`2px solid ${active ? '#6366f1' : 'transparent'}`, color:active ? '#818cf8' : '#475569', cursor:'pointer' }),
  empty: { textAlign:'center', padding:'60px 20px', color:'#475569' },
};

const ts = (v) => { if (!v) return '—'; const d = v?.toDate ? v.toDate() : new Date(v); const diff = Date.now() - d.getTime(); if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`; if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`; return d.toLocaleDateString(); };

/* ══════════════════════════════════════════════════════════════
   ADMIN BETA FEEDBACK PAGE  —  /admin/beta-feedback
   Reads from: betaFeedback collection (written by BetaFeedbackModal)
   Fields expected: type, message, rating, userId, displayName,
                    createdAt, status ('new'|'reviewed'|'actioned')
══════════════════════════════════════════════════════════════ */
export function AdminBetaFeedbackPage() {
  const navigate  = useNavigate();
  const [tab, setTab]       = useState('new');
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts]   = useState({ new:0, reviewed:0, actioned:0 });

  // Load counts
  useEffect(() => {
    async function loadCounts() {
      try {
        const [n, r, a] = await Promise.all([
          getCountFromServer(query(collection(db,'betaFeedback'), where('status','==','new'))),
          getCountFromServer(query(collection(db,'betaFeedback'), where('status','==','reviewed'))),
          getCountFromServer(query(collection(db,'betaFeedback'), where('status','==','actioned'))),
        ]);
        setCounts({ new: n.data().count, reviewed: r.data().count, actioned: a.data().count });
      } catch (e) { console.warn('[AdminFeedback] counts:', e.message); }
    }
    loadCounts();
  }, [tab]);

  // Live listener for current tab
  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, 'betaFeedback'),
      where('status', '==', tab),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const unsub = onSnapshot(q, snap => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, err => {
      console.warn('[AdminFeedback] listener:', err.message);
      setLoading(false);
    });
    return unsub;
  }, [tab]);

  const markAs = async (id, status) => {
    try {
      await updateDoc(doc(db, 'betaFeedback', id), { status, reviewedAt: serverTimestamp() });
    } catch (e) { console.error(e); }
  };

  const RATING_STARS = (r) => r ? '⭐'.repeat(Math.min(5, r)) : '—';
  const TYPE_COLORS = {
    bug:         ['rgba(239,68,68,0.2)','#ef4444'],
    feature:     ['rgba(99,102,241,0.2)','#a5b4fc'],
    performance: ['rgba(245,158,11,0.2)','#f59e0b'],
    ui:          ['rgba(16,185,129,0.2)','#10b981'],
    other:       ['rgba(100,116,139,0.15)','#94a3b8'],
  };

  return (
    <div style={S.page}>
      <div style={S.hdr}>
        <button style={S.back} onClick={() => navigate('/admin')}>←</button>
        <span style={S.title}>💬 Beta Feedback</span>
        <span style={{ marginLeft:'auto', ...S.badge('rgba(239,68,68,0.15)','#ef4444') }}>🔴 ADMIN</span>
      </div>

      {/* Count pills */}
      <div style={{ display:'flex', gap:8, padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
        {[['new','🆕 New',counts.new,'#6366f1'],['reviewed','👁️ Reviewed',counts.reviewed,'#10b981'],['actioned','✅ Actioned',counts.actioned,'#f59e0b']].map(([t,l,c,col]) => (
          <button key={t} onClick={() => setTab(t)} style={{ flex:1, padding:'8px 6px', borderRadius:12, background: tab===t ? `${col}20` : 'rgba(255,255,255,0.04)', border:`1px solid ${tab===t ? col+'50' : 'rgba(255,255,255,0.07)'}`, cursor:'pointer' }}>
            <div style={{ fontSize:11, color: tab===t ? col : '#64748b', fontWeight:700 }}>{l}</div>
            <div style={{ fontSize:18, fontWeight:900, color: tab===t ? col : '#475569' }}>{c}</div>
          </button>
        ))}
      </div>

      {/* List */}
      <div style={{ padding:'12px 16px' }}>
        {loading ? (
          <div style={{ color:'#475569', fontSize:13, padding:'20px 0' }}>Loading…</div>
        ) : items.length === 0 ? (
          <div style={S.empty}>
            <div style={{ fontSize:48, marginBottom:12 }}>💬</div>
            <div style={{ fontWeight:700 }}>No {tab} feedback</div>
          </div>
        ) : items.map(item => {
          const [tbg, tcol] = TYPE_COLORS[item.type] || TYPE_COLORS.other;
          return (
            <div key={item.id} style={{ ...S.card, marginBottom:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8, gap:8 }}>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  <span style={S.badge(tbg, tcol)}>{item.type || 'other'}</span>
                  {item.rating && <span style={S.badge('rgba(245,158,11,0.15)','#f59e0b')}>{RATING_STARS(item.rating)}</span>}
                </div>
                <span style={{ fontSize:11, color:'#475569', flexShrink:0 }}>{ts(item.createdAt)}</span>
              </div>

              <p style={{ fontSize:14, color:'#cbd5e1', lineHeight:1.6, margin:'0 0 8px' }}>{item.message || item.feedback || '(no message)'}</p>

              {item.displayName && (
                <div style={{ fontSize:12, color:'#64748b', marginBottom:10 }}>
                  👤 {item.displayName} {item.userId ? `· uid: ${item.userId.slice(0,8)}…` : ''}
                </div>
              )}

              {tab === 'new' && (
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  <button onClick={() => markAs(item.id,'reviewed')} style={S.btn('rgba(16,185,129,0.15)','#10b981')}>👁️ Mark Reviewed</button>
                  <button onClick={() => markAs(item.id,'actioned')} style={S.btn('rgba(99,102,241,0.15)','#a5b4fc')}>✅ Mark Actioned</button>
                </div>
              )}
              {tab === 'reviewed' && (
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={() => markAs(item.id,'actioned')} style={S.btn('rgba(99,102,241,0.15)','#a5b4fc')}>✅ Mark Actioned</button>
                  <button onClick={() => markAs(item.id,'new')} style={S.btn('rgba(255,255,255,0.06)','#94a3b8')}>↩️ Reopen</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ADMIN CONTENT MODERATION PAGE  —  /admin/content
   Reads: posts + stories where flagged == true
   Field expected: type (post|story), flagReason, authorName,
                   authorId, content/caption, mediaUrl, createdAt,
                   flaggedAt, flagStatus ('pending'|'removed'|'approved')
══════════════════════════════════════════════════════════════ */
export function AdminContentModerationPage() {
  const navigate  = useNavigate();
  const [contentType, setContentType] = useState('posts');
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const col = contentType === 'posts' ? 'posts' : 'stories';
    const q = query(
      collection(db, col),
      where('flagged', '==', true),
      where('flagStatus', '==', 'pending'),
      orderBy('flaggedAt', 'desc'),
      limit(30)
    );
    const unsub = onSnapshot(q, snap => {
      setItems(snap.docs.map(d => ({ id: d.id, _col: col, ...d.data() })));
      setLoading(false);
    }, err => {
      console.warn('[AdminContent] listener:', err.message);
      setLoading(false);
    });
    return unsub;
  }, [contentType]);

  const moderate = async (item, action) => {
    // action: 'approved' (keep) | 'removed' (delete)
    try {
      await updateDoc(doc(db, item._col, item.id), {
        flagStatus: action,
        moderatedAt: serverTimestamp(),
        ...(action === 'removed' ? { visible: false } : {}),
      });
    } catch (e) { console.error(e); }
  };

  return (
    <div style={S.page}>
      <div style={S.hdr}>
        <button style={S.back} onClick={() => navigate('/admin')}>←</button>
        <span style={S.title}>🛡️ Content Moderation</span>
        <span style={{ marginLeft:'auto', ...S.badge('rgba(239,68,68,0.15)','#ef4444') }}>🔴 ADMIN</span>
      </div>

      {/* Toggle posts vs stories */}
      <div style={{ display:'flex', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
        {[['posts','📝 Posts'],['stories','📖 Stories']].map(([t,l]) => (
          <button key={t} onClick={() => setContentType(t)} style={S.tab(contentType===t)}>{l}</button>
        ))}
      </div>

      <div style={{ padding:'12px 16px' }}>
        {loading ? (
          <div style={{ color:'#475569', fontSize:13, padding:'20px 0' }}>Loading flagged content…</div>
        ) : items.length === 0 ? (
          <div style={S.empty}>
            <div style={{ fontSize:48, marginBottom:12 }}>🛡️</div>
            <div style={{ fontWeight:700 }}>No flagged {contentType}</div>
            <div style={{ fontSize:13, marginTop:4 }}>Queue is clear!</div>
          </div>
        ) : items.map(item => (
          <div key={item.id} style={{ ...S.card, marginBottom:14 }}>
            {/* Author + time */}
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
              <div style={{ fontWeight:700, fontSize:13 }}>
                👤 {item.authorName || item.displayName || item.authorId?.slice(0,8) || 'Unknown'}
              </div>
              <span style={{ fontSize:11, color:'#475569' }}>{ts(item.flaggedAt || item.createdAt)}</span>
            </div>

            {/* Flag reason */}
            {item.flagReason && (
              <div style={{ ...S.badge('rgba(239,68,68,0.15)','#ef4444'), display:'inline-block', marginBottom:8 }}>
                ⚠️ {item.flagReason}
              </div>
            )}

            {/* Content preview */}
            {(item.content || item.caption || item.text) && (
              <div style={{ fontSize:13, color:'#cbd5e1', background:'rgba(255,255,255,0.04)', borderRadius:8, padding:'10px 12px', marginBottom:10, lineHeight:1.5 }}>
                {(item.content || item.caption || item.text).slice(0,300)}
                {(item.content || item.caption || item.text).length > 300 ? '…' : ''}
              </div>
            )}

            {/* Media thumbnail */}
            {item.mediaUrl && (
              <img src={item.mediaUrl} alt="" style={{ width:'100%', maxHeight:200, objectFit:'cover', borderRadius:10, marginBottom:10 }} />
            )}

            {/* Actions */}
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => moderate(item,'approved')} style={S.btn('rgba(16,185,129,0.15)','#10b981')}>✅ Keep Content</button>
              <button onClick={() => moderate(item,'removed')}  style={S.btn('rgba(239,68,68,0.15)','#ef4444')}>🗑️ Remove</button>
              <button onClick={() => navigate(`/profile/${item.authorId}`)} style={S.btn('rgba(255,255,255,0.06)','#94a3b8')}>👤 Profile</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ADMIN USERS PAGE (FIRESTORE VERSION)  —  /admin/users
   Replaces the hardcoded USERS array from AdminSubPages
   Reads from: 'users' collection, paginates 25 at a time
══════════════════════════════════════════════════════════════ */
const ROLE_COLORS   = { admin:'rgba(245,158,11,0.2)', creator:'rgba(99,102,241,0.2)', user:'rgba(255,255,255,0.06)' };
const ROLE_TEXT     = { admin:'#f59e0b', creator:'#a5b4fc', user:'#64748b' };
const STATUS_COLORS = { active:'rgba(16,185,129,0.15)', suspended:'rgba(245,158,11,0.15)', banned:'rgba(239,68,68,0.15)' };
const STATUS_TEXT   = { active:'#10b981', suspended:'#f59e0b', banned:'#ef4444' };

export function AdminUsersFirestorePage() {
  const navigate  = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightUid = searchParams.get('highlight');

  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState('all');
  const [selected, setSelected]   = useState(null);
  const [stats, setStats]         = useState({ total:0, active:0, suspended:0, banned:0 });

  // Load users (live listener, limited to 100 most recent for perf)
  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt','desc'), limit(100));
    const unsub = onSnapshot(q, snap => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setUsers(docs);
      setStats({
        total:     docs.length,
        active:    docs.filter(u => (u.status||'active') === 'active').length,
        suspended: docs.filter(u => u.status === 'suspended').length,
        banned:    docs.filter(u => u.status === 'banned').length,
      });
      setLoading(false);
      // Auto-expand highlighted user from report navigation
      if (highlightUid) {
        const found = docs.find(u => u.id === highlightUid);
        if (found) setSelected(found);
      }
    }, err => {
      console.warn('[AdminUsers] listener:', err.message);
      setLoading(false);
    });
    return unsub;
  }, [highlightUid]);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (u.displayName||'').toLowerCase().includes(q) ||
      (u.username||u.handle||'').toLowerCase().includes(q) ||
      (u.email||'').toLowerCase().includes(q) ||
      u.id.includes(q);
    const status = u.status || 'active';
    const role   = u.role   || 'user';
    const matchFilter = filter === 'all' || status === filter || role === filter;
    return matchSearch && matchFilter;
  });

  const changeStatus = async (u, newStatus) => {
    try {
      await updateDoc(doc(db, 'users', u.id), { status: newStatus, updatedAt: serverTimestamp() });
      setSelected(prev => prev?.id === u.id ? { ...prev, status: newStatus } : prev);
    } catch (e) { console.error(e); }
  };

  const changeRole = async (u, newRole) => {
    try {
      await updateDoc(doc(db, 'users', u.id), { role: newRole, isAdmin: newRole === 'admin', updatedAt: serverTimestamp() });
      setSelected(prev => prev?.id === u.id ? { ...prev, role: newRole } : prev);
    } catch (e) { console.error(e); }
  };

  const initials = (u) => {
    const name = u.displayName || u.username || '?';
    return name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);
  };

  return (
    <div style={S.page}>
      <div style={S.hdr}>
        <button style={S.back} onClick={() => navigate('/admin')}>←</button>
        <span style={S.title}>👥 User Management</span>
        <span style={{ marginLeft:'auto', ...S.badge('rgba(239,68,68,0.15)','#ef4444') }}>🔴 ADMIN</span>
      </div>

      {/* Stats strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, padding:'12px 16px' }}>
        {[
          { label:'Total',     val: stats.total,     color:'#6366f1' },
          { label:'Active',    val: stats.active,    color:'#10b981' },
          { label:'Suspended', val: stats.suspended, color:'#f59e0b' },
          { label:'Banned',    val: stats.banned,    color:'#ef4444' },
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
          placeholder="🔍 Search name, handle, email, UID…"
          style={S.inp}
        />
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {[['all','All'],['active','Active'],['suspended','Suspended'],['banned','Banned'],['admin','Admins'],['creator','Creators']].map(([val,label]) => (
            <button key={val} onClick={() => setFilter(val)} style={{ padding:'6px 12px', borderRadius:20, fontSize:12, fontWeight:600, cursor:'pointer',
              background: filter===val ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.05)',
              border: filter===val ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.1)',
              color: filter===val ? '#a5b4fc' : '#94a3b8'
            }}>{label}</button>
          ))}
        </div>
        {loading && <div style={{ fontSize:12, color:'#475569' }}>Loading users…</div>}
        {!loading && <div style={{ fontSize:12, color:'#475569' }}>Showing {filtered.length} of {users.length} users (last 100)</div>}
      </div>

      {/* User list */}
      <div style={{ borderTop:'1px solid rgba(255,255,255,0.07)' }}>
        {!loading && filtered.length === 0 && (
          <div style={S.empty}>No users found</div>
        )}
        {filtered.map(u => {
          const status = u.status || 'active';
          const role   = u.role   || 'user';
          const isHighlight = u.id === highlightUid;
          return (
            <div key={u.id} style={{ background: isHighlight ? 'rgba(239,68,68,0.06)' : 'transparent', borderLeft: isHighlight ? '3px solid #ef4444' : 'none' }}>
              <div onClick={() => setSelected(selected?.id === u.id ? null : u)} style={{ ...S.row, cursor:'pointer', background: selected?.id === u.id ? 'rgba(99,102,241,0.07)' : 'transparent' }}>
                <div style={S.av}>{initials(u)}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, fontSize:14, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {u.displayName || u.username || u.email || u.id.slice(0,12)}
                  </div>
                  <div style={{ fontSize:12, color:'#64748b' }}>
                    {u.username ? `@${u.username} · ` : ''}{u.email || u.id.slice(0,16)}
                  </div>
                </div>
                <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                  <span style={S.badge(ROLE_COLORS[role]||ROLE_COLORS.user, ROLE_TEXT[role]||ROLE_TEXT.user)}>{role}</span>
                  <span style={S.badge(STATUS_COLORS[status]||STATUS_COLORS.active, STATUS_TEXT[status]||STATUS_TEXT.active)}>{status}</span>
                </div>
              </div>

              {/* Expanded actions */}
              {selected?.id === u.id && (
                <div style={{ padding:'12px 16px 16px', background:'rgba(99,102,241,0.05)', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ fontSize:12, color:'#64748b', marginBottom:10 }}>
                    📧 {u.email || '—'} · 📅 Joined {u.createdAt ? ts(u.createdAt) : '—'} · 🆔 {u.id}
                  </div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                    <button onClick={() => navigate(`/profile/${u.id}`)} style={S.btn('rgba(255,255,255,0.07)','#f1f5f9')}>👁️ View Profile</button>
                    {status !== 'active' && (
                      <button onClick={() => changeStatus(u,'active')} style={S.btn('rgba(16,185,129,0.2)','#10b981')}>✅ Unsuspend</button>
                    )}
                    {status === 'active' && (
                      <button onClick={() => changeStatus(u,'suspended')} style={S.btn('rgba(255,255,255,0.07)','#f1f5f9')}>⏸️ Suspend</button>
                    )}
                    {status !== 'banned' && (
                      <button onClick={() => changeStatus(u,'banned')} style={S.btn('rgba(239,68,68,0.12)','#ef4444')}>🚫 Ban</button>
                    )}
                    {status === 'banned' && (
                      <button onClick={() => changeStatus(u,'active')} style={S.btn('rgba(16,185,129,0.15)','#10b981')}>🔓 Unban</button>
                    )}
                    {role !== 'admin' && (
                      <button onClick={() => changeRole(u,'admin')} style={S.btn('rgba(245,158,11,0.15)','#f59e0b')}>👑 Make Admin</button>
                    )}
                    {role === 'admin' && (
                      <button onClick={() => changeRole(u,'user')} style={S.btn('rgba(239,68,68,0.12)','#ef4444')}>👤 Remove Admin</button>
                    )}
                    {role !== 'creator' && (
                      <button onClick={() => changeRole(u,'creator')} style={S.btn('rgba(99,102,241,0.15)','#a5b4fc')}>🎬 Grant Creator</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
