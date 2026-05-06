import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TABS = ['Friends','Requests','Suggestions','Following'];

const FRIENDS = [
  { id:1, name:'Jordan Maxwell', handle:'@jordanmax', mutual:8, emoji:'🎵', color:'#ec4899', online:true },
  { id:2, name:'Alex Chen', handle:'@alexchen', mutual:12, emoji:'✈️', color:'#6366f1', online:true },
  { id:3, name:'Riley Johnson', handle:'@riley.j', mutual:5, emoji:'💪', color:'#10b981', online:false },
  { id:4, name:'Sam Rivera', handle:'@samrivera', mutual:3, emoji:'🍕', color:'#f59e0b', online:true },
  { id:5, name:'Morgan Taylor', handle:'@morgantaylor', mutual:9, emoji:'🎨', color:'#8b5cf6', online:false },
  { id:6, name:'Casey Lee', handle:'@caseylee', mutual:7, emoji:'🌊', color:'#3b82f6', online:true },
];

const REQUESTS = [
  { id:7, name:'Drew Parker', handle:'@drewparker', mutual:4, emoji:'📸', color:'#14b8a6' },
  { id:8, name:'Quinn Brooks', handle:'@quinnb', mutual:2, emoji:'🎮', color:'#ef4444' },
  { id:9, name:'Jamie Fox', handle:'@jamiefox', mutual:6, emoji:'🎤', color:'#f97316' },
];

const SUGGESTIONS = [
  { id:10, name:'Taylor Swift Fan', handle:'@tswiftfan', mutual:15, emoji:'🎶', color:'#ec4899', reason:'You both follow Jordan' },
  { id:11, name:'Chris K.', handle:'@chriskrip', mutual:3, emoji:'⚽', color:'#10b981', reason:'From your contacts' },
  { id:12, name:'Dana Rose', handle:'@danarose', mutual:8, emoji:'🌸', color:'#8b5cf6', reason:'Popular in your area' },
  { id:13, name:'Finn O\'Brien', handle:'@finno', mutual:1, emoji:'🏄', color:'#3b82f6', reason:'You may know them' },
];

export default function FriendsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('Friends');
  const [friendStatus, setFriendStatus] = useState({});
  const [accepted, setAccepted] = useState({});
  const [declined, setDeclined] = useState({});

  const accept = (id) => setAccepted(p => ({ ...p, [id]: true }));
  const decline = (id) => setDeclined(p => ({ ...p, [id]: true }));
  const toggleFollow = (id) => setFriendStatus(p => ({ ...p, [id]: !p[id] }));

  const btn = (bg, color, text, onClick, border) => (
    <button onClick={onClick} style={{ background: bg, color, border: border || 'none', borderRadius:'20px', padding:'7px 14px', fontSize:'12px', fontWeight:600, cursor:'pointer' }}>{text}</button>
  );

  return (
    <div style={{ background:'#0f172a', minHeight:'100vh', paddingBottom:'80px' }}>
      <div style={{ padding:'16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize:'20px', fontWeight:700, color:'#f1f5f9' }}>Friends</span>
        <span style={{ fontSize:'18px', cursor:'pointer' }} onClick={() => navigate('/search')}>🔍</span>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', borderBottom:'1px solid #1e293b', overflowX:'auto' }}>
        {TABS.map(t => (
          <div key={t} style={{ padding:'12px 16px', fontSize:'14px', fontWeight:tab===t?700:500, color:tab===t?'#6366f1':'#64748b', borderBottom:tab===t?'2px solid #6366f1':'2px solid transparent', cursor:'pointer', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:'6px' }}
            onClick={() => setTab(t)}>
            {t} {t==='Requests' && REQUESTS.filter(r => !accepted[r.id] && !declined[r.id]).length > 0 && (
              <span style={{ background:'#ec4899', color:'white', borderRadius:'10px', padding:'1px 6px', fontSize:'11px' }}>{REQUESTS.filter(r => !accepted[r.id] && !declined[r.id]).length}</span>
            )}
          </div>
        ))}
      </div>

      <div style={{ padding:'16px' }}>
        {/* FRIENDS TAB */}
        {tab === 'Friends' && (
          <>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', background:'#1e293b', borderRadius:'12px', padding:'10px 14px', marginBottom:'16px' }}>
              <span>🔍</span>
              <input placeholder="Search friends..." style={{ flex:1, background:'none', border:'none', outline:'none', color:'#f1f5f9', fontSize:'14px' }} />
            </div>
            <div style={{ fontSize:'13px', color:'#64748b', marginBottom:'12px' }}>{FRIENDS.length} friends</div>
            {FRIENDS.map(f => (
              <div key={f.id} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'10px 0', borderBottom:'1px solid #1e293b' }}>
                <div style={{ position:'relative' }}>
                  <div style={{ width:'48px', height:'48px', borderRadius:'50%', background:f.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px' }}>{f.emoji}</div>
                  {f.online && <div style={{ position:'absolute', bottom:'2px', right:'2px', width:'11px', height:'11px', borderRadius:'50%', background:'#10b981', border:'2px solid #0f172a' }} />}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, color:'#f1f5f9', fontSize:'14px' }}>{f.name}</div>
                  <div style={{ color:'#64748b', fontSize:'12px' }}>{f.mutual} mutual friends{f.online ? ' · Online' : ''}</div>
                </div>
                <div style={{ display:'flex', gap:'8px' }}>
                  {btn('#1e293b','#94a3b8','Message', () => navigate('/messages'), '1px solid #334155')}
                </div>
              </div>
            ))}
          </>
        )}

        {/* REQUESTS TAB */}
        {tab === 'Requests' && (
          <>
            <div style={{ fontSize:'15px', fontWeight:700, color:'#f1f5f9', marginBottom:'12px' }}>Friend Requests</div>
            {REQUESTS.filter(r => !declined[r.id]).map(r => (
              <div key={r.id} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px', background:'#1e293b', borderRadius:'16px', marginBottom:'10px' }}>
                <div style={{ width:'52px', height:'52px', borderRadius:'50%', background:r.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', flexShrink:0 }}>{r.emoji}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, color:'#f1f5f9', fontSize:'14px' }}>{r.name}</div>
                  <div style={{ color:'#64748b', fontSize:'12px' }}>{r.handle} · {r.mutual} mutual friends</div>
                </div>
                {accepted[r.id] ? (
                  <span style={{ color:'#10b981', fontSize:'13px', fontWeight:600 }}>✓ Friends</span>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                    {btn('linear-gradient(135deg,#6366f1,#ec4899)','white','Accept', () => accept(r.id))}
                    {btn('#0f172a','#94a3b8','Decline', () => decline(r.id), '1px solid #334155')}
                  </div>
                )}
              </div>
            ))}
            {REQUESTS.filter(r => !declined[r.id]).length === 0 && (
              <div style={{ textAlign:'center', padding:'40px 0', color:'#64748b' }}>No pending requests</div>
            )}
          </>
        )}

        {/* SUGGESTIONS TAB */}
        {tab === 'Suggestions' && (
          <>
            <div style={{ fontSize:'15px', fontWeight:700, color:'#f1f5f9', marginBottom:'12px' }}>People You May Know</div>
            {SUGGESTIONS.map(s => (
              <div key={s.id} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px', background:'#1e293b', borderRadius:'16px', marginBottom:'10px' }}>
                <div style={{ width:'52px', height:'52px', borderRadius:'50%', background:s.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', flexShrink:0 }}>{s.emoji}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, color:'#f1f5f9', fontSize:'14px' }}>{s.name}</div>
                  <div style={{ color:'#64748b', fontSize:'12px' }}>{s.mutual} mutual · {s.reason}</div>
                </div>
                {btn(friendStatus[s.id]?'#1e293b':'linear-gradient(135deg,#6366f1,#ec4899)', friendStatus[s.id]?'#94a3b8':'white', friendStatus[s.id]?'Requested':'Add Friend', () => toggleFollow(s.id), friendStatus[s.id]?'1px solid #334155':undefined)}
              </div>
            ))}
          </>
        )}

        {/* FOLLOWING TAB */}
        {tab === 'Following' && (
          <>
            <div style={{ fontSize:'15px', fontWeight:700, color:'#f1f5f9', marginBottom:'12px' }}>Following</div>
            {[...FRIENDS, ...SUGGESTIONS.slice(0,2)].map(f => (
              <div key={f.id} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'10px 0', borderBottom:'1px solid #1e293b' }}>
                <div style={{ width:'44px', height:'44px', borderRadius:'50%', background:f.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px' }}>{f.emoji}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, color:'#f1f5f9', fontSize:'14px' }}>{f.name}</div>
                  <div style={{ color:'#64748b', fontSize:'12px' }}>{f.handle}</div>
                </div>
                {btn('#1e293b','#94a3b8','Following', () => {}, '1px solid #334155')}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
