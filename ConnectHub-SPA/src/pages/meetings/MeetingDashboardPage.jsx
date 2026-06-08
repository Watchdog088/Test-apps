/**
 * MeetingDashboardPage — /meetings
 * Hub: create instant meeting, join by code, schedule, view history
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  createMeeting, scheduleMeeting, getMeetingHistory, getMeeting, generateRoomCode
} from '../../services/meetings-firestore-service';

const S = {
  page: { minHeight:'100vh', background:'#0a0a0a', color:'#fff', fontFamily:'system-ui,sans-serif', paddingBottom:80 },
  header: { padding:'20px 20px 12px', borderBottom:'1px solid #1a1a1a' },
  title: { fontSize:24, fontWeight:800, margin:0, background:'linear-gradient(135deg,#7c3aed,#06b6d4)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' },
  subtitle: { fontSize:13, color:'#555', marginTop:4 },
  card: { background:'#111', border:'1px solid #1e1e1e', borderRadius:18, padding:20, margin:'0 16px 14px' },
  btn: { background:'linear-gradient(135deg,#7c3aed,#8b5cf6)', border:'none', color:'#fff', padding:'14px 24px', borderRadius:28, fontSize:15, fontWeight:700, cursor:'pointer', width:'100%' },
  outlineBtn: { background:'transparent', border:'1px solid #333', color:'#ccc', padding:'12px 20px', borderRadius:20, fontSize:14, cursor:'pointer', fontWeight:600 },
  input: { width:'100%', background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:12, padding:'12px 14px', color:'#fff', fontSize:15, outline:'none', boxSizing:'border-box' },
  sectionTitle: { padding:'20px 20px 8px', fontSize:12, color:'#555', fontWeight:700, textTransform:'uppercase', letterSpacing:1 },
  row: { display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom:'1px solid #151515' },
  badge: (color) => ({ background: color+'22', color, borderRadius:8, padding:'2px 8px', fontSize:11, fontWeight:700 }),
};

export default function MeetingDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState('new'); // new | join | schedule | history
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  // New meeting form
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingType, setMeetingType] = useState('friends');
  const [requireApproval, setRequireApproval] = useState(false);
  const [muteOnJoin, setMuteOnJoin] = useState(false);

  // Join form
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');

  // Schedule form
  const [schedTitle, setSchedTitle] = useState('');
  const [schedDate, setSchedDate] = useState('');
  const [schedTime, setSchedTime] = useState('');
  const [schedType, setSchedType] = useState('team');

  useEffect(() => {
    if (tab === 'history' && !historyLoaded && user) {
      getMeetingHistory(user.uid).then(h => {
        setHistory(h);
        setHistoryLoaded(true);
      });
    }
  }, [tab, user, historyLoaded]);

  const handleCreate = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const meeting = await createMeeting({
        hostId: user.uid,
        hostName: user.displayName || 'Host',
        hostAvatar: user.photoURL || '',
        title: meetingTitle || `${user.displayName || 'My'}'s Meeting`,
        type: meetingType,
        settings: { requireApproval, muteOnJoin },
      });
      navigate(`/meeting/${meeting.roomId}/waiting?host=true&title=${encodeURIComponent(meeting.title)}`);
    } catch (e) {
      alert('Failed to create meeting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    const code = joinCode.trim().toLowerCase().replace(/\s/g, '');
    if (!code) { setJoinError('Please enter a room code.'); return; }
    setLoading(true);
    setJoinError('');
    try {
      const meeting = await getMeeting(code);
      if (!meeting) { setJoinError('Room not found. Check the code and try again.'); return; }
      if (meeting.status === 'ended') { setJoinError('This meeting has ended.'); return; }
      navigate(`/meeting/${code}/waiting?title=${encodeURIComponent(meeting.title||'Meeting')}`);
    } catch {
      setJoinError('Error looking up room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async () => {
    if (!user || !schedTitle || !schedDate || !schedTime) {
      alert('Please fill in all fields.'); return;
    }
    setLoading(true);
    try {
      const scheduledAt = new Date(`${schedDate}T${schedTime}`).toISOString();
      const meeting = await scheduleMeeting({
        hostId: user.uid,
        hostName: user.displayName || 'Host',
        hostAvatar: user.photoURL || '',
        title: schedTitle,
        scheduledAt,
        type: schedType,
      });
      alert(`✅ Meeting scheduled!\nRoom code: ${meeting.roomId}\nShare this code with participants.`);
      setSchedTitle(''); setSchedDate(''); setSchedTime('');
    } catch {
      alert('Failed to schedule meeting.');
    } finally {
      setLoading(false);
    }
  };

  const toggle = (val, set) => <button style={{ width:44, height:24, borderRadius:12, background: val?'#8b5cf6':'#333', border:'none', cursor:'pointer', position:'relative', flexShrink:0, transition:'background 0.2s' }} onClick={() => set(!val)}>
    <div style={{ position:'absolute', top:2, left:val?20:2, width:20, height:20, borderRadius:'50%', background:'#fff', transition:'left 0.2s' }} />
  </button>;

  const tabs = [
    { id:'new', label:'🎬 New', title:'New Meeting' },
    { id:'join', label:'🔗 Join', title:'Join a Room' },
    { id:'schedule', label:'📅 Schedule', title:'Schedule' },
    { id:'history', label:'🕘 History', title:'Past Meetings' },
  ];

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <h1 style={S.title}>Meetings</h1>
        <p style={S.subtitle}>Friend hangouts & team collaboration</p>
      </div>

      {/* Tab bar */}
      <div style={{ display:'flex', gap:8, padding:'12px 16px', overflowX:'auto', borderBottom:'1px solid #111' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding:'8px 16px', borderRadius:20, border:'none', cursor:'pointer', fontSize:13, fontWeight:600, whiteSpace:'nowrap',
            background: tab===t.id ? '#8b5cf6' : '#1a1a1a', color: tab===t.id ? '#fff' : '#888',
          }}>{t.label} {tabs.find(x=>x.id===t.id)?.title}</button>
        ))}
      </div>

      {/* ── NEW MEETING ── */}
      {tab === 'new' && (
        <div style={{ paddingTop:8 }}>
          <div style={S.sectionTitle}>Meeting Details</div>
          <div style={S.card}>
            <label style={{ fontSize:13, color:'#777', display:'block', marginBottom:6 }}>Meeting Title (optional)</label>
            <input style={S.input} placeholder="e.g. Weekly Team Sync" value={meetingTitle} onChange={e=>setMeetingTitle(e.target.value)} />

            <div style={{ marginTop:16, marginBottom:8, fontSize:13, color:'#777' }}>Meeting Type</div>
            <div style={{ display:'flex', gap:10 }}>
              {[['friends','👫 Friends','Casual hangout up to 12'],['team','🏢 Team','Work or group up to 50']].map(([val,label,desc])=>(
                <button key={val} onClick={()=>setMeetingType(val)} style={{
                  flex:1, padding:'14px 10px', borderRadius:14, border:`2px solid ${meetingType===val?'#8b5cf6':'#2a2a2a'}`,
                  background: meetingType===val ? '#2d1b69' : '#1a1a1a', color:'#fff', cursor:'pointer', textAlign:'center',
                }}>
                  <div style={{ fontSize:20 }}>{label.split(' ')[0]}</div>
                  <div style={{ fontSize:14, fontWeight:700, marginTop:4 }}>{label.split(' ').slice(1).join(' ')}</div>
                  <div style={{ fontSize:11, color:'#888', marginTop:2 }}>{desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={S.sectionTitle}>Room Settings</div>
          <div style={S.card}>
            {[
              ['Waiting Room Approval', 'Anyone must be admitted by host', requireApproval, setRequireApproval],
              ['Mute Participants on Join', 'Everyone joins muted', muteOnJoin, setMuteOnJoin],
            ].map(([label,desc,val,set])=>(
              <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid #151515' }}>
                <div>
                  <div style={{ fontSize:15, fontWeight:600 }}>{label}</div>
                  <div style={{ fontSize:12, color:'#555' }}>{desc}</div>
                </div>
                {toggle(val, set)}
              </div>
            ))}
          </div>

          <div style={{ padding:'0 16px' }}>
            <button style={S.btn} onClick={handleCreate} disabled={loading}>
              {loading ? '⏳ Creating...' : '🎬 Start Meeting Now'}
            </button>
          </div>
        </div>
      )}

      {/* ── JOIN ── */}
      {tab === 'join' && (
        <div style={{ paddingTop:8 }}>
          <div style={S.sectionTitle}>Enter Room Code</div>
          <div style={S.card}>
            <div style={{ fontSize:13, color:'#777', marginBottom:8 }}>Ask the host for their room code (e.g. abc-def-123)</div>
            <input style={{ ...S.input, fontSize:20, letterSpacing:3, textAlign:'center', textTransform:'lowercase' }}
              placeholder="abc-def-123"
              value={joinCode}
              onChange={e=>setJoinCode(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&handleJoin()}
            />
            {joinError && <div style={{ color:'#ef4444', fontSize:13, marginTop:8 }}>⚠️ {joinError}</div>}
          </div>
          <div style={{ padding:'0 16px' }}>
            <button style={S.btn} onClick={handleJoin} disabled={loading}>
              {loading ? '⏳ Looking up...' : '🔗 Join Meeting'}
            </button>
          </div>

          {/* Quick tips */}
          <div style={S.sectionTitle}>Tips</div>
          <div style={S.card}>
            {[
              ['💡','Room codes are 9 characters like abc-def-123'],
              ['🔒','You may be placed in a waiting room'],
              ['🎤','Test your audio & camera in the waiting room'],
              ['📱','Works on any device with a camera'],
            ].map(([icon, tip])=>(
              <div key={tip} style={S.row}>
                <span style={{ fontSize:22, flexShrink:0 }}>{icon}</span>
                <span style={{ fontSize:14, color:'#aaa' }}>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SCHEDULE ── */}
      {tab === 'schedule' && (
        <div style={{ paddingTop:8 }}>
          <div style={S.sectionTitle}>Schedule a Meeting</div>
          <div style={S.card}>
            <label style={{ fontSize:13, color:'#777', display:'block', marginBottom:6 }}>Title *</label>
            <input style={S.input} placeholder="e.g. Project Kickoff" value={schedTitle} onChange={e=>setSchedTitle(e.target.value)} />

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:14 }}>
              <div>
                <label style={{ fontSize:13, color:'#777', display:'block', marginBottom:6 }}>Date *</label>
                <input type="date" style={{ ...S.input, colorScheme:'dark' }} value={schedDate} onChange={e=>setSchedDate(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize:13, color:'#777', display:'block', marginBottom:6 }}>Time *</label>
                <input type="time" style={{ ...S.input, colorScheme:'dark' }} value={schedTime} onChange={e=>setSchedTime(e.target.value)} />
              </div>
            </div>

            <div style={{ marginTop:14, marginBottom:8, fontSize:13, color:'#777' }}>Type</div>
            <div style={{ display:'flex', gap:10 }}>
              {[['friends','Friends'],['team','Team']].map(([val,label])=>(
                <button key={val} onClick={()=>setSchedType(val)} style={{
                  flex:1, padding:'10px', borderRadius:12, border:`2px solid ${schedType===val?'#8b5cf6':'#2a2a2a'}`,
                  background: schedType===val ? '#2d1b69' : '#1a1a1a', color:'#fff', cursor:'pointer', fontWeight:600, fontSize:14,
                }}>{label}</button>
              ))}
            </div>
          </div>
          <div style={{ padding:'0 16px' }}>
            <button style={S.btn} onClick={handleSchedule} disabled={loading}>
              {loading ? '⏳ Scheduling...' : '📅 Schedule Meeting'}
            </button>
          </div>
        </div>
      )}

      {/* ── HISTORY ── */}
      {tab === 'history' && (
        <div style={{ paddingTop:8 }}>
          <div style={S.sectionTitle}>Your Meetings</div>
          {!historyLoaded && <div style={{ textAlign:'center', padding:40, color:'#444' }}>Loading...</div>}
          {historyLoaded && history.length === 0 && (
            <div style={{ textAlign:'center', padding:'60px 20px', color:'#444' }}>
              <div style={{ fontSize:48 }}>📹</div>
              <div style={{ marginTop:12 }}>No meetings yet</div>
              <div style={{ fontSize:13, color:'#333', marginTop:4 }}>Start or join a meeting to see history here</div>
            </div>
          )}
          <div style={{ padding:'0 16px' }}>
            {history.map((m, i) => (
              <div key={i} style={{ ...S.card, margin:'0 0 10px', display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:44, height:44, borderRadius:12, background:'linear-gradient(135deg,#7c3aed,#06b6d4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>
                  {m.type === 'team' ? '🏢' : '👫'}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:15 }}>{m.title || 'Meeting'}</div>
                  <div style={{ fontSize:12, color:'#555', marginTop:2 }}>
                    Host: {m.hostName} • {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : ''}
                  </div>
                </div>
                <button onClick={() => navigate(`/meeting/${m.roomId}/waiting`)} style={{ ...S.outlineBtn, padding:'8px 14px', fontSize:12 }}>Rejoin</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
