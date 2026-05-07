// LIVE MODERATION PAGE — /live/moderation
// FIXED: LIVE-BUG-09
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RULES = [
  'No hate speech or discrimination',
  'No spam or self-promotion',
  'No explicit or NSFW content',
  'Be respectful to all viewers',
  'No sharing personal information',
];

export default function LiveModerationPage() {
  const navigate = useNavigate();
  const [slowMode, setSlowMode] = useState(false);
  const [subsOnly, setSubsOnly] = useState(false);
  const [filterWords, setFilterWords] = useState(true);
  const [bannedWords, setBannedWords] = useState('');

  return (
    <div style={{ background:'var(--bg-primary,#0a0a18)', minHeight:'100vh', paddingBottom:'80px' }}>
      <div style={{ padding:'16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', gap:'12px' }}>
        <button onClick={() => navigate(-1)} style={{ background:'none', border:'none', color:'#94a3b8', fontSize:'20px', cursor:'pointer' }}>←</button>
        <span style={{ fontSize:'18px', fontWeight:800, color:'#f1f5f9' }}>🛡️ Moderation</span>
      </div>

      <div style={{ padding:'20px 16px' }}>

        {/* Chat Controls */}
        <div style={{ fontSize:'12px', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'10px' }}>Chat Controls</div>

        {[
          { label:'Slow Mode', desc:'Limit messages to once every 5 seconds', state: slowMode, set: setSlowMode },
          { label:'Subscribers Only', desc:'Only followers can send messages', state: subsOnly, set: setSubsOnly },
          { label:'Filter Bad Words', desc:'Auto-remove flagged words from chat', state: filterWords, set: setFilterWords },
        ].map(c => (
          <div key={c.label} style={{ background:'#1e293b', borderRadius:'14px', padding:'14px', marginBottom:'10px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'14px' }}>{c.label}</div>
              <div style={{ color:'#64748b', fontSize:'12px', marginTop:'2px' }}>{c.desc}</div>
            </div>
            <button
              onClick={() => c.set(!c.state)}
              style={{
                width:'48px', height:'26px', borderRadius:'13px', border:'none', cursor:'pointer',
                background: c.state ? '#10b981' : '#334155',
                position:'relative', transition:'background 0.2s',
              }}
            >
              <div style={{
                width:'20px', height:'20px', borderRadius:'50%', background:'white',
                position:'absolute', top:'3px',
                left: c.state ? '25px' : '3px',
                transition:'left 0.2s',
              }} />
            </button>
          </div>
        ))}

        {/* Banned Words */}
        <div style={{ fontSize:'12px', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'10px', marginTop:'20px' }}>
          Banned Words / Phrases
        </div>
        <textarea
          value={bannedWords}
          onChange={e => setBannedWords(e.target.value)}
          placeholder="Enter words separated by commas (e.g. spam, hate, ...)"
          rows={3}
          style={{
            width:'100%', background:'#1e293b', border:'1px solid #334155',
            borderRadius:'12px', padding:'12px', color:'#f1f5f9', fontSize:'13px',
            outline:'none', resize:'none', boxSizing:'border-box',
          }}
        />

        {/* Community Rules */}
        <div style={{ fontSize:'12px', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'10px', marginTop:'20px' }}>
          Community Rules (Displayed to Viewers)
        </div>
        <div style={{ background:'#1e293b', borderRadius:'14px', padding:'14px' }}>
          {RULES.map((r, i) => (
            <div key={i} style={{ display:'flex', gap:'8px', alignItems:'flex-start', marginBottom: i < RULES.length - 1 ? '8px' : 0 }}>
              <span style={{ color:'#10b981', fontWeight:700, fontSize:'13px', flexShrink:0 }}>{i + 1}.</span>
              <span style={{ color:'#94a3b8', fontSize:'13px' }}>{r}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate(-1)}
          style={{ width:'100%', background:'linear-gradient(135deg,#0f766e,#10b981)', border:'none', borderRadius:'14px', padding:'14px', color:'white', fontWeight:700, fontSize:'15px', cursor:'pointer', marginTop:'20px' }}
        >
          ✓ Save Moderation Settings
        </button>
      </div>
    </div>
  );
}
