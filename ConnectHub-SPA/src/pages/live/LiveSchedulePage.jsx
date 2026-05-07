// LIVE SCHEDULE PAGE — /live/schedule
// FIXED: LIVE-BUG-09
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LiveSchedulePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [date,  setDate]  = useState('');
  const [time,  setTime]  = useState('');
  const [desc,  setDesc]  = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!title || !date || !time) return;
    setSaved(true);
    setTimeout(() => { setSaved(false); navigate('/live'); }, 1500);
  };

  return (
    <div style={{ background:'var(--bg-primary,#0a0a18)', minHeight:'100vh', paddingBottom:'80px' }}>
      <div style={{ padding:'16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', gap:'12px' }}>
        <button onClick={() => navigate(-1)} style={{ background:'none', border:'none', color:'#94a3b8', fontSize:'20px', cursor:'pointer' }}>←</button>
        <span style={{ fontSize:'18px', fontWeight:800, color:'#f1f5f9' }}>📅 Schedule a Stream</span>
      </div>

      <div style={{ padding:'20px 16px' }}>
        <div style={{ background:'linear-gradient(135deg,#1e40af,#3b82f6)', borderRadius:'18px', padding:'16px', marginBottom:'24px', textAlign:'center' }}>
          <div style={{ fontSize:'28px', marginBottom:'6px' }}>📅</div>
          <div style={{ color:'white', fontWeight:700, fontSize:'15px' }}>Plan your next stream in advance</div>
          <div style={{ color:'rgba(255,255,255,0.75)', fontSize:'12px', marginTop:'4px' }}>Followers will be notified when your stream starts.</div>
        </div>

        {[
          { label:'Stream Title *', value:title, set:setTitle, placeholder:'e.g. Morning Workout Live', type:'text' },
          { label:'Date *',         value:date,  set:setDate,  placeholder:'',                         type:'date' },
          { label:'Time *',         value:time,  set:setTime,  placeholder:'',                         type:'time' },
        ].map(f => (
          <div key={f.label} style={{ marginBottom:'14px' }}>
            <label style={{ display:'block', fontSize:'12px', fontWeight:700, color:'#94a3b8', marginBottom:'6px' }}>{f.label}</label>
            <input
              type={f.type}
              value={f.value}
              onChange={e => f.set(e.target.value)}
              placeholder={f.placeholder}
              style={{ width:'100%', background:'#1e293b', border:'1px solid #334155', borderRadius:'12px', padding:'12px 14px', color:'#f1f5f9', fontSize:'14px', outline:'none', boxSizing:'border-box' }}
            />
          </div>
        ))}

        <div style={{ marginBottom:'20px' }}>
          <label style={{ display:'block', fontSize:'12px', fontWeight:700, color:'#94a3b8', marginBottom:'6px' }}>Description (Optional)</label>
          <textarea
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder="Tell viewers what to expect..."
            rows={3}
            style={{ width:'100%', background:'#1e293b', border:'1px solid #334155', borderRadius:'12px', padding:'12px', color:'#f1f5f9', fontSize:'13px', outline:'none', resize:'none', boxSizing:'border-box' }}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={!title || !date || !time}
          style={{
            width:'100%', border:'none', borderRadius:'14px', padding:'14px', fontWeight:800, fontSize:'15px', cursor: (!title || !date || !time) ? 'default' : 'pointer',
            background: saved ? '#10b981' : (!title || !date || !time) ? '#334155' : 'linear-gradient(135deg,#1e40af,#3b82f6)',
            color:'white',
          }}
        >
          {saved ? '✓ Stream Scheduled!' : '📅 Schedule Stream'}
        </button>
      </div>
    </div>
  );
}
