/**
 * SettingsExtraPages.jsx
 * Four additional Settings sub-pages wired from SettingsPage:
 *  - ContactInfoPage    → /settings/contact
 *  - AppearancePage     → /settings/appearance
 *  - AccessibilityPage  → /settings/accessibility
 *  - ActivityStatusPage → /settings/activity
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const S = {
  page: { background:'#0f172a', minHeight:'100vh', color:'#f1f5f9', fontFamily:'system-ui,sans-serif', paddingBottom:90 },
  header: { display:'flex', alignItems:'center', gap:12, padding:'16px 20px', borderBottom:'1px solid #1e293b', position:'sticky', top:0, background:'#0f172a', zIndex:10 },
  backBtn: { background:'none', border:'none', color:'#6366f1', fontSize:22, cursor:'pointer', lineHeight:1 },
  title: { flex:1, margin:0, fontSize:18, fontWeight:700 },
  card: { background:'#1e293b', borderRadius:16, margin:'16px', overflow:'hidden' },
  row: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,0.05)' },
  rowLast: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px' },
  label: { color:'#f1f5f9', fontSize:14, fontWeight:600 },
  sub: { color:'#64748b', fontSize:12, marginTop:2 },
  input: { background:'#0f172a', border:'1px solid #334155', borderRadius:10, padding:'10px 14px', color:'#f1f5f9', fontSize:14, width:'100%', boxSizing:'border-box', outline:'none' },
  saveBtn: { background:'linear-gradient(135deg,#6366f1,#8b5cf6)', border:'none', color:'#fff', padding:'13px', borderRadius:14, fontSize:14, cursor:'pointer', fontWeight:700, width:'calc(100% - 32px)', margin:'0 16px' },
  sectionTitle: { padding:'20px 20px 8px', fontSize:12, color:'#64748b', fontWeight:700, textTransform:'uppercase', letterSpacing:0.5 },
  toggle: (on) => ({ width:44, height:24, borderRadius:12, background:on?'#6366f1':'#334155', border:'none', cursor:'pointer', position:'relative', transition:'background 0.2s', flexShrink:0 }),
  dot: (on) => ({ position:'absolute', top:3, left:on?22:2, width:18, height:18, borderRadius:'50%', background:'#fff', transition:'left 0.2s' }),
};

// ──────────────────────────────────────────────────────────
// 1. CONTACT INFO PAGE  →  /settings/contact
// ──────────────────────────────────────────────────────────
export function ContactInfoPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email:'', phone:'' });
  const [saved, setSaved] = useState(false);

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div style={S.page}>
      <div style={S.header}>
        <button style={S.backBtn} onClick={() => navigate(-1)}>←</button>
        <h1 style={S.title}>📧 Email & Phone</h1>
      </div>

      <div style={S.sectionTitle}>Contact Information</div>
      <div style={S.card}>
        <div style={{ padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ ...S.label, marginBottom:8 }}>Email Address</div>
          <input style={S.input} type="email" placeholder="your@email.com" value={form.email}
            onChange={e => setForm(p => ({ ...p, email:e.target.value }))} />
          <div style={{ ...S.sub, marginTop:6 }}>Used for login and notifications</div>
        </div>
        <div style={{ padding:'14px 18px' }}>
          <div style={{ ...S.label, marginBottom:8 }}>Phone Number</div>
          <input style={S.input} type="tel" placeholder="+1 (555) 000-0000" value={form.phone}
            onChange={e => setForm(p => ({ ...p, phone:e.target.value }))} />
          <div style={{ ...S.sub, marginTop:6 }}>Used for SMS alerts and 2FA</div>
        </div>
      </div>

      <div style={S.sectionTitle}>Verification Status</div>
      <div style={S.card}>
        <div style={S.row}>
          <div><div style={S.label}>Email Verified</div><div style={S.sub}>your@email.com</div></div>
          <span style={{ color:'#22c55e', fontWeight:700, fontSize:13 }}>✓ Verified</span>
        </div>
        <div style={S.rowLast}>
          <div><div style={S.label}>Phone Verified</div><div style={S.sub}>Not added yet</div></div>
          <button style={{ background:'#334155', border:'none', color:'#a78bfa', padding:'6px 14px', borderRadius:20, fontSize:12, cursor:'pointer', fontWeight:600 }}
            onClick={() => {}}>Add Phone</button>
        </div>
      </div>

      <button style={S.saveBtn} onClick={save}>
        {saved ? '✅ Saved!' : 'Save Changes'}
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// 2. APPEARANCE PAGE  →  /settings/appearance
// ──────────────────────────────────────────────────────────
const THEMES = [
  { id:'dark', label:'Dark', bg:'#0f172a', accent:'#6366f1', emoji:'🌙' },
  { id:'light', label:'Light', bg:'#f8fafc', accent:'#6366f1', emoji:'☀️' },
  { id:'purple', label:'Purple Night', bg:'#1a0533', accent:'#a855f7', emoji:'💜' },
  { id:'ocean', label:'Ocean', bg:'#0c1a2e', accent:'#06b6d4', emoji:'🌊' },
];

export function AppearancePage() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState('dark');
  const [fontSize, setFontSize] = useState('medium');
  const [compact, setCompact] = useState(false);
  const [animations, setAnimations] = useState(true);

  return (
    <div style={S.page}>
      <div style={S.header}>
        <button style={S.backBtn} onClick={() => navigate(-1)}>←</button>
        <h1 style={S.title}>🌙 Appearance</h1>
      </div>

      <div style={S.sectionTitle}>Theme</div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, margin:'0 16px 16px' }}>
        {THEMES.map(t => (
          <button key={t.id} onClick={() => setTheme(t.id)}
            style={{ background:t.bg, border:`2px solid ${theme===t.id?t.accent:'#334155'}`, borderRadius:16, padding:16, cursor:'pointer', textAlign:'left', position:'relative' }}>
            <div style={{ fontSize:24, marginBottom:8 }}>{t.emoji}</div>
            <div style={{ color:'#f1f5f9', fontSize:13, fontWeight:600 }}>{t.label}</div>
            {theme===t.id && <div style={{ position:'absolute', top:10, right:10, color:t.accent, fontSize:16 }}>✓</div>}
          </button>
        ))}
      </div>

      <div style={S.sectionTitle}>Text Size</div>
      <div style={S.card}>
        {['small','medium','large','xlarge'].map((s, idx, arr) => (
          <div key={s} style={idx<arr.length-1?S.row:S.rowLast} onClick={() => setFontSize(s)}>
            <div><div style={{ ...S.label, fontSize:s==='small'?12:s==='medium'?14:s==='large'?16:18, cursor:'pointer' }}>
              {s.charAt(0).toUpperCase()+s.slice(1)}
            </div></div>
            {fontSize===s && <span style={{ color:'#6366f1', fontWeight:700 }}>✓</span>}
          </div>
        ))}
      </div>

      <div style={S.sectionTitle}>Display Options</div>
      <div style={S.card}>
        <div style={S.row}>
          <div><div style={S.label}>Compact Mode</div><div style={S.sub}>Smaller spacing between items</div></div>
          <button style={S.toggle(compact)} onClick={() => setCompact(p=>!p)}><div style={S.dot(compact)}/></button>
        </div>
        <div style={S.rowLast}>
          <div><div style={S.label}>Animations</div><div style={S.sub}>Transition effects & motion</div></div>
          <button style={S.toggle(animations)} onClick={() => setAnimations(p=>!p)}><div style={S.dot(animations)}/></button>
        </div>
      </div>

      <button style={S.saveBtn} onClick={() => navigate(-1)}>Save Appearance</button>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// 3. ACCESSIBILITY PAGE  →  /settings/accessibility
// ──────────────────────────────────────────────────────────
export function AccessibilityPage() {
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState({
    highContrast: false,
    reduceMotion: false,
    screenReader: false,
    largeText: false,
    captionsOn: true,
    boldText: false,
  });
  const toggle = (key) => setPrefs(p => ({ ...p, [key]:!p[key] }));

  const OPTIONS = [
    { key:'highContrast', icon:'🔆', label:'High Contrast Mode', sub:'Increases color contrast ratio' },
    { key:'reduceMotion', icon:'🎞️', label:'Reduce Motion', sub:'Minimises animations and transitions' },
    { key:'screenReader', icon:'🔊', label:'Screen Reader Support', sub:'Optimised for VoiceOver / TalkBack' },
    { key:'largeText', icon:'🔤', label:'Larger Text', sub:'Increases default font sizes' },
    { key:'captionsOn', icon:'💬', label:'Auto-Captions on Video', sub:'Show captions on videos by default' },
    { key:'boldText', icon:'𝐁', label:'Bold Text', sub:'Make all text bold for readability' },
  ];

  return (
    <div style={S.page}>
      <div style={S.header}>
        <button style={S.backBtn} onClick={() => navigate(-1)}>←</button>
        <h1 style={S.title}>♿ Accessibility</h1>
      </div>

      <div style={S.sectionTitle}>Visual & Motor</div>
      <div style={S.card}>
        {OPTIONS.map((opt, idx) => (
          <div key={opt.key} style={idx<OPTIONS.length-1?S.row:S.rowLast}>
            <div style={{ display:'flex', alignItems:'center', gap:12, flex:1 }}>
              <span style={{ fontSize:22 }}>{opt.icon}</span>
              <div>
                <div style={S.label}>{opt.label}</div>
                <div style={S.sub}>{opt.sub}</div>
              </div>
            </div>
            <button style={S.toggle(prefs[opt.key])} onClick={() => toggle(opt.key)}>
              <div style={S.dot(prefs[opt.key])}/>
            </button>
          </div>
        ))}
      </div>

      <div style={{ margin:'0 16px', background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.3)', borderRadius:14, padding:16 }}>
        <div style={{ color:'#a5b4fc', fontSize:13, fontWeight:600, marginBottom:4 }}>ℹ️ System Settings</div>
        <div style={{ color:'#64748b', fontSize:12, lineHeight:1.5 }}>
          Some features (like screen reader support) work best when also enabled in your device system settings.
        </div>
      </div>

      <div style={{ height:16 }} />
      <button style={S.saveBtn} onClick={() => navigate(-1)}>Save Preferences</button>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// 4. ACTIVITY STATUS PAGE  →  /settings/activity
// ──────────────────────────────────────────────────────────
export function ActivityStatusPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState({
    showOnline: true,
    showLastSeen: true,
    showTyping: true,
    showActivity: false,
    showReadReceipts: true,
  });
  const toggle = (key) => setStatus(p => ({ ...p, [key]:!p[key] }));

  const OPTS = [
    { key:'showOnline',       icon:'🟢', label:'Show Online Status',      sub:'Let others see when you are active' },
    { key:'showLastSeen',     icon:'⏱️', label:'Show Last Seen',          sub:'Others can see when you were last active' },
    { key:'showTyping',       icon:'⌨️', label:'Typing Indicators',       sub:'Show "typing…" while composing messages' },
    { key:'showActivity',     icon:'📈', label:'Activity Feed Visibility', sub:'Show your feed activity to followers' },
    { key:'showReadReceipts', icon:'✔️', label:'Read Receipts',           sub:'Send read receipts in messages' },
  ];

  return (
    <div style={S.page}>
      <div style={S.header}>
        <button style={S.backBtn} onClick={() => navigate(-1)}>←</button>
        <h1 style={S.title}>📋 Activity Status</h1>
      </div>

      <div style={{ margin:'16px', background:'linear-gradient(135deg,#1e1b4b,#312e81)', borderRadius:16, padding:16, display:'flex', alignItems:'center', gap:14 }}>
        <div style={{ width:48, height:48, borderRadius:'50%', background:'rgba(99,102,241,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, border:'2px solid #6366f1', position:'relative' }}>
          😊
          {status.showOnline && <div style={{ position:'absolute', bottom:2, right:2, width:12, height:12, borderRadius:'50%', background:'#22c55e', border:'2px solid #1e1b4b' }}/>}
        </div>
        <div>
          <div style={{ color:'#f1f5f9', fontWeight:700 }}>Your Status Preview</div>
          <div style={{ color:'#a5b4fc', fontSize:13 }}>{status.showOnline ? '🟢 Active now' : '⚫ Invisible'}</div>
        </div>
      </div>

      <div style={S.sectionTitle}>Privacy Controls</div>
      <div style={S.card}>
        {OPTS.map((opt, idx) => (
          <div key={opt.key} style={idx<OPTS.length-1?S.row:S.rowLast}>
            <div style={{ display:'flex', alignItems:'center', gap:12, flex:1 }}>
              <span style={{ fontSize:20 }}>{opt.icon}</span>
              <div>
                <div style={S.label}>{opt.label}</div>
                <div style={S.sub}>{opt.sub}</div>
              </div>
            </div>
            <button style={S.toggle(status[opt.key])} onClick={() => toggle(opt.key)}>
              <div style={S.dot(status[opt.key])}/>
            </button>
          </div>
        ))}
      </div>

      <button style={S.saveBtn} onClick={() => navigate(-1)}>Save Activity Settings</button>
    </div>
  );
}
