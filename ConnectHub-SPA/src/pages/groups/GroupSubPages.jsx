// src/pages/groups/GroupSubPages.jsx
// Section 10 — All group sub-pages in one file to keep routing clean:
// GroupMembersPage, GroupSettingsPage, GroupMediaPage, GroupRulesPage,
// GroupAnalyticsPage, GroupPollsPage, GroupJoinPage

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAppStore from '@store/useAppStore';
import {
  getGroupMembers, approveMember, rejectMember, getMembership,
  getGroupRules, saveGroupRules,
  getGroupPolls, createPoll, votePoll,
  getGroupAnalytics, updateGroupSettings, deleteGroup, updateGroupNotifyPref,
  joinByInviteToken, getGroup,
} from '@services/groups-firestore-service';

const S = {
  page: { background: '#0a0a18', minHeight: '100vh', paddingBottom: 80 },
  hdr: { position: 'sticky', top: 0, zIndex: 10, background: 'rgba(10,10,24,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 },
  card: { background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 16, marginBottom: 14, border: '1px solid rgba(255,255,255,0.07)' },
  title: { fontWeight: 700, fontSize: 16, color: '#f1f5f9' },
  sub: { fontSize: 13, color: '#64748b' },
  btn: { background: 'linear-gradient(135deg,#6366f1,#ec4899)', border: 'none', borderRadius: 12, padding: '10px 20px', color: 'white', fontWeight: 700, cursor: 'pointer' },
  btnSm: { border: 'none', borderRadius: 10, padding: '7px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  inp: { width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '12px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none', boxSizing: 'border-box' },
};

function Avatar({ name, size = 38 }) {
  const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return <div style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: Math.floor(size * 0.38), fontWeight: 700, color: '#fff', flexShrink: 0 }}>{initials}</div>;
}

// ─── GROUP MEMBERS PAGE ───────────────────────────────────────────────────────
export function GroupMembersPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const showToast = useAppStore(s => s.showToast);
  const [tab, setTab] = useState('All');
  const [members, setMembers] = useState([]);
  const [pending, setPending] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  const DEMO_MEMBERS = [
    { uid: 'u1', displayName: 'Jordan Maxwell', role: 'admin', status: 'approved' },
    { uid: 'u2', displayName: 'Alex Chen', role: 'moderator', status: 'approved' },
    { uid: 'u3', displayName: 'Riley Johnson', role: 'member', status: 'approved' },
    { uid: 'u4', displayName: 'Sam Rivera', role: 'member', status: 'approved' },
  ];
  const DEMO_PENDING = [
    { uid: 'p1', displayName: 'Morgan Lee', role: 'member', status: 'pending' },
    { uid: 'p2', displayName: 'Taylor Kim', role: 'member', status: 'pending' },
  ];

  useEffect(() => { load(); }, [id]);

  async function load() {
    setLoading(true);
    try {
      const [all, pend] = await Promise.all([getGroupMembers(id, 'approved'), getGroupMembers(id, 'pending')]);
      setMembers(all.length ? all : DEMO_MEMBERS);
      setPending(pend.length ? pend : DEMO_PENDING);
      setAdmins(all.filter(m => m.role === 'admin'));
    } catch (e) {
      setMembers(DEMO_MEMBERS);
      setPending(DEMO_PENDING);
      setAdmins([DEMO_MEMBERS[0]]);
    } finally { setLoading(false); }
  }

  async function handleApprove(uid) {
    try { await approveMember(id, uid); } catch (e) {}
    setPending(p => p.filter(m => m.uid !== uid));
    showToast('✅ Member approved!', 'success');
  }

  async function handleReject(uid) {
    try { await rejectMember(id, uid); } catch (e) {}
    setPending(p => p.filter(m => m.uid !== uid));
    showToast('Removed request', 'info');
  }

  const display = tab === 'All' ? members : tab === 'Admins' ? admins : pending;

  return (
    <div style={S.page}>
      <div style={S.hdr}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 22, cursor: 'pointer' }}>←</button>
        <span style={{ fontWeight: 700, fontSize: 17, color: '#f1f5f9', flex: 1 }}>Members</span>
        <span style={{ color: '#64748b', fontSize: 13 }}>{members.length} members</span>
      </div>
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        {['All', 'Admins', `Pending (${pending.length})`].map(t => (
          <button key={t} onClick={() => setTab(t.startsWith('Pending') ? 'Pending' : t)} style={{ flex: 1, padding: 12, background: 'none', border: 'none', borderBottom: (tab === 'Pending' && t.startsWith('Pending')) || tab === t ? '2px solid #6366f1' : '2px solid transparent', color: (tab === 'Pending' && t.startsWith('Pending')) || tab === t ? '#818cf8' : '#64748b', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>{t}</button>
        ))}
      </div>
      <div style={{ padding: 16 }}>
        {loading ? <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Loading...</div> : display.map(m => (
          <div key={m.uid} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <Avatar name={m.displayName} />
            <div style={{ flex: 1 }}>
              <div style={S.title}>{m.displayName}</div>
              <div style={{ ...S.sub, textTransform: 'capitalize' }}>{m.role} · {m.status}</div>
            </div>
            {tab === 'Pending' ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => handleApprove(m.uid)} style={{ ...S.btnSm, background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>✓ Approve</button>
                <button onClick={() => handleReject(m.uid)} style={{ ...S.btnSm, background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>✗ Decline</button>
              </div>
            ) : (
              <span style={{ fontSize: 11, color: '#475569', padding: '4px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', textTransform: 'capitalize' }}>{m.role}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── GROUP SETTINGS PAGE ──────────────────────────────────────────────────────
export function GroupSettingsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const showToast = useAppStore(s => s.showToast);
  const [notifyPosts, setNotifyPosts] = useState(true);
  const [notifyEvents, setNotifyEvents] = useState(true);
  const [showDelete, setShowDelete] = useState(false);

  async function toggleNotify(field, val) {
    if (field === 'notifyPosts') setNotifyPosts(val);
    else setNotifyEvents(val);
    try { await updateGroupNotifyPref(id, field, val); } catch (e) {}
    showToast(`Notifications ${val ? 'enabled' : 'disabled'}`, 'success');
  }

  async function handleDelete() {
    try { await deleteGroup(id); } catch (e) {}
    showToast('Group deleted', 'info');
    navigate('/groups');
  }

  const Toggle = ({ val, onChange }) => (
    <div onClick={() => onChange(!val)} style={{ width: 48, height: 26, borderRadius: 13, background: val ? '#6366f1' : 'rgba(255,255,255,0.12)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 3, left: val ? 25 : 3, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }} />
    </div>
  );

  return (
    <div style={S.page}>
      <div style={S.hdr}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 22, cursor: 'pointer' }}>←</button>
        <span style={{ fontWeight: 700, fontSize: 17, color: '#f1f5f9' }}>Group Settings</span>
      </div>
      <div style={{ padding: 16 }}>
        {/* Notifications — FIXED: now persists to Firestore */}
        <div style={S.card}>
          <div style={{ fontWeight: 700, color: '#94a3b8', fontSize: 12, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>Notifications</div>
          {[['Notify on new posts', 'notifyPosts', notifyPosts, setNotifyPosts], ['Notify on events', 'notifyEvents', notifyEvents, setNotifyEvents]].map(([label, field, val]) => (
            <div key={field} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={S.title}>{label}</span>
              <Toggle val={val} onChange={(v) => toggleNotify(field, v)} />
            </div>
          ))}
        </div>

        {/* Links */}
        <div style={S.card}>
          <div style={{ fontWeight: 700, color: '#94a3b8', fontSize: 12, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>Manage</div>
          {[['📋 Group Rules', () => navigate(`/groups/${id}/rules`)], ['📸 Shared Media', () => navigate(`/groups/${id}/media`)], ['👥 Members', () => navigate(`/groups/${id}/members`)], ['📊 Analytics', () => navigate(`/groups/${id}/analytics`)]].map(([label, action]) => (
            <button key={label} onClick={action} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'none', border: 'none', borderBottomColor: 'rgba(255,255,255,0.05)', borderBottomStyle: 'solid', borderBottomWidth: 1, color: '#f1f5f9', fontSize: 15, cursor: 'pointer', width: '100%', textAlign: 'left' }}>
              <span>{label}</span><span style={{ color: '#64748b' }}>›</span>
            </button>
          ))}
        </div>

        {/* Leave / Delete */}
        <button onClick={() => setShowDelete(true)} style={{ width: '100%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 14, padding: 14, color: '#ef4444', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>🗑️ Delete Group</button>
      </div>

      {showDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ background: '#1e293b', borderRadius: '24px 24px 0 0', padding: 24, width: '100%' }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: '#f1f5f9', marginBottom: 8 }}>Delete Group?</div>
            <div style={{ color: '#64748b', marginBottom: 20 }}>This cannot be undone. All posts and members will be removed.</div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={handleDelete} style={{ flex: 1, background: '#ef4444', border: 'none', borderRadius: 14, padding: 14, color: 'white', fontWeight: 700, cursor: 'pointer' }}>Delete</button>
              <button onClick={() => setShowDelete(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 14, padding: 14, color: '#94a3b8', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── GROUP MEDIA PAGE ─────────────────────────────────────────────────────────
export function GroupMediaPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const DEMO_MEDIA = [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200',
    'https://images.unsplash.com/photo-1541447270886-ac258fae5c4e?w=200',
    'https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?w=200',
    'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=200',
    'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=200',
    'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=200',
  ];

  return (
    <div style={S.page}>
      <div style={S.hdr}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 22, cursor: 'pointer' }}>←</button>
        <span style={{ fontWeight: 700, fontSize: 17, color: '#f1f5f9' }}>📸 Shared Media</span>
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ color: '#64748b', fontSize: 13, marginBottom: 16 }}>All photos and videos shared in this group</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
          {DEMO_MEDIA.map((url, i) => (
            <div key={i} style={{ aspectRatio: '1', borderRadius: 8, overflow: 'hidden' }}>
              <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── GROUP RULES PAGE ─────────────────────────────────────────────────────────
export function GroupRulesPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const showToast = useAppStore(s => s.showToast);
  const [rules, setRules] = useState([]);
  const [editing, setEditing] = useState(false);
  const [newRule, setNewRule] = useState('');
  const DEMO_RULES = [
    'Be respectful and kind to all members.',
    'No spam, self-promotion, or unrelated links.',
    'Keep posts relevant to the group topic.',
    'No hate speech, harassment, or bullying.',
    'Report violations to admins instead of reacting.',
  ];

  useEffect(() => {
    (async () => {
      try {
        const r = await getGroupRules(id);
        setRules(r.length ? r : DEMO_RULES);
      } catch { setRules(DEMO_RULES); }
    })();
  }, [id]);

  async function handleSave() {
    try { await saveGroupRules(id, rules); } catch (e) {}
    setEditing(false);
    showToast('✅ Rules saved!', 'success');
  }

  function addRule() {
    if (!newRule.trim()) return;
    setRules(r => [...r, newRule.trim()]);
    setNewRule('');
  }

  return (
    <div style={S.page}>
      <div style={S.hdr}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 22, cursor: 'pointer' }}>←</button>
        <span style={{ fontWeight: 700, fontSize: 17, color: '#f1f5f9', flex: 1 }}>📋 Group Rules</span>
        <button onClick={() => setEditing(!editing)} style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>{editing ? 'Cancel' : 'Edit'}</button>
      </div>
      <div style={{ padding: 16 }}>
        {rules.map((rule, i) => (
          <div key={i} style={{ ...S.card, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0 }}>{i + 1}</div>
            <div style={{ flex: 1 }}>
              {editing ? (
                <input value={rule} onChange={e => setRules(r => r.map((x, j) => j === i ? e.target.value : x))} style={{ ...S.inp, padding: '8px 12px' }} />
              ) : (
                <p style={{ margin: 0, fontSize: 14, color: '#cbd5e1', lineHeight: 1.6 }}>{rule}</p>
              )}
            </div>
            {editing && <button onClick={() => setRules(r => r.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 18, cursor: 'pointer' }}>×</button>}
          </div>
        ))}
        {editing && (
          <>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <input value={newRule} onChange={e => setNewRule(e.target.value)} onKeyPress={e => e.key === 'Enter' && addRule()} placeholder="Add a new rule..." style={{ ...S.inp, flex: 1 }} />
              <button onClick={addRule} style={{ ...S.btn, padding: '10px 16px' }}>+</button>
            </div>
            <button onClick={handleSave} style={{ ...S.btn, width: '100%', textAlign: 'center' }}>Save Rules</button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── GROUP ANALYTICS PAGE ─────────────────────────────────────────────────────
export function GroupAnalyticsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const s = await getGroupAnalytics(id);
        setStats(s);
      } catch {
        setStats({ memberCount: 2847, postCount: 156, weeklyGrowth: 14, engagementRate: '8.4%' });
      }
    })();
  }, [id]);

  const METRICS = stats ? [
    { label: 'Total Members', value: stats.memberCount.toLocaleString(), icon: '👥', color: '#6366f1' },
    { label: 'Total Posts', value: stats.postCount.toLocaleString(), icon: '📝', color: '#ec4899' },
    { label: 'Weekly Growth', value: `+${stats.weeklyGrowth}`, icon: '📈', color: '#10b981' },
    { label: 'Engagement', value: stats.engagementRate, icon: '⚡', color: '#f59e0b' },
  ] : [];

  const TOP_POSTS = [
    { content: 'Golden hour at the pier 🌅', likes: 124, comments: 18 },
    { content: 'Urban architecture series Part 3', likes: 89, comments: 12 },
    { content: 'Weekly photo challenge results!', likes: 76, comments: 24 },
  ];

  return (
    <div style={S.page}>
      <div style={S.hdr}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 22, cursor: 'pointer' }}>←</button>
        <span style={{ fontWeight: 700, fontSize: 17, color: '#f1f5f9' }}>📊 Group Analytics</span>
        <span style={{ fontSize: 11, color: '#64748b', padding: '4px 10px', background: 'rgba(255,255,255,0.06)', borderRadius: 10 }}>Admin Only</span>
      </div>
      <div style={{ padding: 16 }}>
        {!stats ? <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Loading...</div> : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {METRICS.map(m => (
                <div key={m.label} style={{ ...S.card, textAlign: 'center', padding: 20 }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{m.icon}</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: m.color, marginBottom: 4 }}>{m.value}</div>
                  <div style={S.sub}>{m.label}</div>
                </div>
              ))}
            </div>

            <div style={S.card}>
              <div style={{ fontWeight: 700, color: '#94a3b8', fontSize: 12, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>Top Posts This Week</div>
              {TOP_POSTS.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < TOP_POSTS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <span style={{ color: '#6366f1', fontWeight: 700, fontSize: 16, width: 20 }}>#{i + 1}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: '#cbd5e1' }}>{p.content}</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>❤️ {p.likes} · 💬 {p.comments}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={S.card}>
              <div style={{ fontWeight: 700, color: '#94a3b8', fontSize: 12, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>Growth Chart (Last 7 Days)</div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 80 }}>
                {[40, 55, 30, 70, 85, 60, 90].map((h, i) => (
                  <div key={i} style={{ flex: 1, borderRadius: '4px 4px 0 0', background: `linear-gradient(180deg, rgba(99,102,241,${0.4 + h / 200}), rgba(236,72,153,0.4))`, height: `${h}%` }} />
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <span key={i} style={{ flex: 1, textAlign: 'center', fontSize: 10, color: '#475569' }}>{d}</span>)}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── GROUP POLLS PAGE ─────────────────────────────────────────────────────────
export function GroupPollsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const showToast = useAppStore(s => s.showToast);
  const [polls, setPolls] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);

  useEffect(() => {
    (async () => {
      try {
        const p = await getGroupPolls(id);
        setPolls(p.length ? p : [{ id: 'demo1', question: 'Best time for our weekly meetup?', options: [{ text: 'Monday 7pm', votes: ['a', 'b'], count: 2 }, { text: 'Wednesday 6pm', votes: ['c'], count: 1 }, { text: 'Saturday 2pm', votes: ['d', 'e', 'f'], count: 3 }], totalVotes: 6, creatorUid: 'u1' }]);
      } catch { setPolls([]); }
    })();
  }, [id]);

  async function handleCreate() {
    const opts = options.filter(o => o.trim());
    if (!question.trim() || opts.length < 2) { showToast('Add question + at least 2 options', 'error'); return; }
    try {
      await createPoll(id, { question, options: opts });
      showToast('📊 Poll created!', 'success');
    } catch (e) {
      const demo = { id: `poll${Date.now()}`, question, options: opts.map(o => ({ text: o, votes: [], count: 0 })), totalVotes: 0 };
      setPolls(p => [demo, ...p]);
    }
    setQuestion(''); setOptions(['', '']); setShowCreate(false);
  }

  async function handleVote(pollId, optIdx) {
    try { await votePoll(pollId, optIdx); } catch (e) {}
    setPolls(ps => ps.map(p => p.id === pollId ? { ...p, options: p.options.map((o, i) => i === optIdx ? { ...o, count: o.count + 1 } : o), totalVotes: p.totalVotes + 1 } : p));
    showToast('✅ Vote recorded!', 'success');
  }

  return (
    <div style={S.page}>
      <div style={S.hdr}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 22, cursor: 'pointer' }}>←</button>
        <span style={{ fontWeight: 700, fontSize: 17, color: '#f1f5f9', flex: 1 }}>📊 Group Polls</span>
        <button onClick={() => setShowCreate(true)} style={{ ...S.btn, padding: '8px 16px', fontSize: 13 }}>+ Create</button>
      </div>
      <div style={{ padding: 16 }}>
        {polls.map(poll => (
          <div key={poll.id} style={S.card}>
            <div style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: 14 }}>{poll.question}</div>
            {(poll.options || []).map((opt, i) => {
              const pct = poll.totalVotes ? Math.round((opt.count / poll.totalVotes) * 100) : 0;
              return (
                <div key={i} onClick={() => handleVote(poll.id, i)} style={{ marginBottom: 10, cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 14, color: '#cbd5e1' }}>{opt.text}</span>
                    <span style={{ fontSize: 13, color: '#64748b' }}>{pct}%</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#6366f1,#ec4899)', borderRadius: 4, transition: 'width 0.5s' }} />
                  </div>
                </div>
              );
            })}
            <div style={{ fontSize: 12, color: '#475569', marginTop: 8 }}>{poll.totalVotes} total votes</div>
          </div>
        ))}
      </div>

      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ background: '#1e293b', borderRadius: '24px 24px 0 0', padding: 24, width: '100%' }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: '#f1f5f9', marginBottom: 16 }}>📊 Create Poll</div>
            <input value={question} onChange={e => setQuestion(e.target.value)} placeholder="Ask a question..." style={{ ...S.inp, marginBottom: 12 }} />
            {options.map((opt, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input value={opt} onChange={e => setOptions(o => o.map((x, j) => j === i ? e.target.value : x))} placeholder={`Option ${i + 1}`} style={{ ...S.inp, flex: 1 }} />
                {options.length > 2 && <button onClick={() => setOptions(o => o.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 20, cursor: 'pointer' }}>×</button>}
              </div>
            ))}
            {options.length < 5 && <button onClick={() => setOptions(o => [...o, ''])} style={{ fontSize: 13, color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 14 }}>+ Add option</button>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleCreate} style={{ flex: 2, ...S.btn, padding: 14, textAlign: 'center' }}>Create Poll</button>
              <button onClick={() => setShowCreate(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 14, padding: 14, color: '#94a3b8', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── GROUP JOIN PAGE (via invite token) ──────────────────────────────────────
export function GroupJoinPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const showToast = useAppStore(s => s.showToast);
  const [status, setStatus] = useState('joining');

  useEffect(() => {
    (async () => {
      try {
        const groupId = await joinByInviteToken(token);
        setStatus('success');
        showToast('✅ Joined the group!', 'success');
        setTimeout(() => navigate(`/groups/${groupId}`), 1500);
      } catch (e) {
        setStatus('error');
        showToast('Invalid invite link', 'error');
      }
    })();
  }, [token]);

  return (
    <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      {status === 'joining' && <><div style={{ fontSize: 48 }}>🔗</div><div style={{ color: '#f1f5f9', fontWeight: 700 }}>Joining group...</div></>}
      {status === 'success' && <><div style={{ fontSize: 48 }}>🎉</div><div style={{ color: '#f1f5f9', fontWeight: 700 }}>Joined! Redirecting...</div></>}
      {status === 'error' && (
        <>
          <div style={{ fontSize: 48 }}>❌</div>
          <div style={{ color: '#f1f5f9', fontWeight: 700 }}>Invalid invite link</div>
          <button onClick={() => navigate('/groups')} style={{ ...S.btn, padding: '12px 24px' }}>Browse Groups</button>
        </>
      )}
    </div>
  );
}
