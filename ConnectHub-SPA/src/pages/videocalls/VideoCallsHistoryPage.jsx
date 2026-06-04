// src/pages/videocalls/VideoCallsHistoryPage.jsx
// NEW — /videocalls/history  (Call History Log)

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const S = {
  page:  { minHeight:'100dvh', background:'#0a0a18', color:'#f1f5f9', fontFamily:'system-ui,sans-serif', paddingBottom:80 },
  hdr:   { display:'flex', alignItems:'center', gap:12, padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,0.07)', position:'sticky', top:0, background:'rgba(10,10,24,0.97)', backdropFilter:'blur(20px)', zIndex:10 },
  back:  { background:'rgba(255,255,255,0.08)', border:'none', borderRadius:10, padding:'8px 14px', color:'#f1f5f9', fontSize:18, cursor:'pointer' },
  title: { fontSize:17, fontWeight:700, color:'#f1f5f9' },
  card:  { background:'rgba(255,255,255,0.04)', borderRadius:16, padding:14, border:'1px solid rgba(255,255,255,0.07)' },
  btn:   { background:'linear-gradient(135deg,#6366f1,#ec4899)', border:'none', borderRadius:12, padding:'10px 18px', color:'#fff', fontWeight:700, cursor:'pointer', fontSize:13 },
  btnO:  { background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.14)', borderRadius:12, padding:'9px 16px', color:'#f1f5f9', fontWeight:600, cursor:'pointer', fontSize:13 },
  av:    { width:44, height:44, borderRadius:'50%', background:'linear-gradient(135deg,#6366f1,#ec4899)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:700, color:'#fff', flexShrink:0 },
  row:   { display:'flex', alignItems:'center', gap:12, padding:'13px 16px', borderBottom:'1px solid rgba(255,255,255,0.05)' },
  tab:   (a) => ({ flex:1, padding:'10px', fontSize:13, fontWeight:700, background:'none', border:'none', borderBottom:`2px solid ${a?'#6366f1':'transparent'}`, color:a?'#818cf8':'#475569', cursor:'pointer' }),
};

const CALLS = [
  { id:'c1',  name:'Alex Rivera',   av:'AR', type:'video', dir:'incoming', dur:'12:34', date:'Today, 2:41 PM',   status:'answered', group:false },
  { id:'c2',  name:'Jordan Lee',    av:'JL', type:'audio', dir:'outgoing', dur:'03:22', date:'Today, 11:15 AM',  status:'answered', group:false },
  { id:'c3',  name:'Sam Chen',      av:'SC', type:'video', dir:'incoming', dur:'—',     date:'Today, 9:07 AM',   status:'missed',   group:false },
  { id:'c4',  name:'Dev Team',      av:'👥', type:'video', dir:'outgoing', dur:'47:08', date:'Yesterday, 4:00 PM',status:'answered', group:true  },
  { id:'c5',  name:'Morgan Davis',  av:'MD', type:'audio', dir:'incoming', dur:'—',     date:'Yesterday, 1:22 PM',status:'declined', group:false },
  { id:'c6',  name:'Taylor Morgan', av:'TM', type:'video', dir:'outgoing', dur:'8:51',  date:'Jun 2, 7:30 PM',   status:'answered', group:false },
  { id:'c7',  name:'Riley Patel',   av:'RP', type:'audio', dir:'incoming', dur:'—',     date:'Jun 2, 3:45 PM',   status:'missed',   group:false },
  { id:'c8',  name:'Study Group',   av:'📚', type:'video', dir:'incoming', dur:'1:14:22',date:'Jun 1, 8:00 PM', status:'answered', group:true  },
  { id:'c9',  name:'Casey Blake',   av:'CB', type:'video', dir:'outgoing', dur:'—',     date:'Jun 1, 2:10 PM',   status:'no-answer',group:false },
  { id:'c10', name:'Alex Rivera',   av:'AR', type:'video', dir:'incoming', dur:'5:00',  date:'May 31, 6:00 PM',  status:'answered', group:false },
];

const TYPE_ICON = { video:'📹', audio:'📞' };
const DIR_ICON  = { incoming:'↙️', outgoing:'↗️' };
const STATUS_COLOR = { answered:'#10b981', missed:'#ef4444', declined:'#f59e0b', 'no-answer':'#64748b' };
const STATUS_LABEL = { answered:'Answered', missed:'Missed', declined:'Declined', 'no-answer':'No Answer' };

export default function VideoCallsHistoryPage() {
  const navigate = useNavigate();
  const [tab, setTab]   = useState('all');
  const [search, setSrch] = useState('');

  const filtered = CALLS.filter(c => {
    const matchTab = tab === 'all' || (tab === 'missed' && c.status === 'missed') || (tab === 'video' && c.type === 'video') || (tab === 'group' && c.group);
    const matchSrch = !search || c.name.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSrch;
  });

  const stats = {
    total:    CALLS.length,
    answered: CALLS.filter(c => c.status === 'answered').length,
    missed:   CALLS.filter(c => c.status === 'missed').length,
  };

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.hdr}>
        <button style={S.back} onClick={() => navigate('/videocalls')}>←</button>
        <span style={S.title}>📞 Call History</span>
        <button onClick={() => navigate('/videocalls/new')} style={{ ...S.btn, marginLeft:'auto', padding:'8px 14px', fontSize:12 }}>+ New Call</button>
      </div>

      {/* Stats strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, padding:'12px 16px 8px' }}>
        {[
          { label:'Total Calls',  val:stats.total,    color:'#6366f1' },
          { label:'Answered',     val:stats.answered, color:'#10b981' },
          { label:'Missed',       val:stats.missed,   color:'#ef4444' },
        ].map(s => (
          <div key={s.label} style={{ ...S.card, textAlign:'center', padding:'10px 8px', border:`1px solid ${s.color}30` }}>
            <div style={{ fontSize:22, fontWeight:900, color:s.color }}>{s.val}</div>
            <div style={{ fontSize:10, color:'#64748b', marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ padding:'0 16px 8px' }}>
        <input
          value={search} onChange={e => setSrch(e.target.value)}
          placeholder="🔍 Search call history..."
          style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:12, padding:'10px 14px', color:'#f1f5f9', fontSize:14, width:'100%', boxSizing:'border-box', outline:'none' }}
        />
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
        {[['all','All'],['missed','Missed'],['video','Video'],['group','Group']].map(([t,l]) => (
          <button key={t} onClick={() => setTab(t)} style={S.tab(tab===t)}>{l}</button>
        ))}
      </div>

      {/* Call list */}
      {filtered.length === 0 && (
        <div style={{ textAlign:'center', padding:'48px 20px', color:'#475569' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>📵</div>
          <div style={{ fontWeight:700 }}>No calls found</div>
        </div>
      )}

      {filtered.map(call => (
        <div key={call.id} style={S.row}>
          {/* Avatar */}
          <div style={{ ...S.av, background: call.group ? 'rgba(99,102,241,0.25)' : 'linear-gradient(135deg,#6366f1,#ec4899)', fontSize: call.group ? 20 : 15 }}>
            {call.av}
          </div>

          {/* Info */}
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontWeight:700, fontSize:14 }}>{call.name} {call.group && <span style={{ fontSize:10, background:'rgba(99,102,241,0.2)', color:'#a5b4fc', borderRadius:6, padding:'2px 6px', marginLeft:4 }}>GROUP</span>}</div>
            <div style={{ fontSize:12, color:'#64748b', marginTop:2 }}>
              {DIR_ICON[call.dir]} {TYPE_ICON[call.type]} {call.date}
            </div>
            <div style={{ fontSize:11, marginTop:1, color: STATUS_COLOR[call.status] }}>
              {STATUS_LABEL[call.status]}{call.dur !== '—' ? ` · ${call.dur}` : ''}
            </div>
          </div>

          {/* Quick call-back button */}
          <button
            onClick={() => navigate('/videocalls/new')}
            style={{ width:38, height:38, borderRadius:12, background:'rgba(99,102,241,0.15)', border:'none', fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}
          >
            {call.type === 'video' ? '📹' : '📞'}
          </button>
        </div>
      ))}

      {/* Clear history button */}
      {filtered.length > 0 && (
        <div style={{ padding:'16px' }}>
          <button style={{ ...S.btnO, width:'100%', color:'#ef4444', border:'1px solid rgba(239,68,68,0.3)' }}>🗑️ Clear Call History</button>
        </div>
      )}
    </div>
  );
}
