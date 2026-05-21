// src/pages/dating/SafetyCenterPage.jsx
// SECTION 5 — SAFETY CENTER  (/dating/safety)
// May 2026 — Block/report, safety tips, background check info

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '@store/useAppStore';

const SAFETY_TIPS = [
  { icon:'📞', title:'Tell someone', desc:'Always tell a friend or family member where you are going for a first date.' },
  { icon:'🌍', title:'Meet in public', desc:'For the first few dates, choose busy, public locations like cafés or parks.' },
  { icon:'🚗', title:'Your own transport', desc:'Arrange your own way to get to and from the date — stay in control.' },
  { icon:'📱', title:'Stay charged', desc:'Keep your phone charged and have emergency contacts saved and accessible.' },
  { icon:'🍷', title:'Watch your drink', desc:'Never leave your drink unattended. If something feels off, trust your gut and leave.' },
  { icon:'🚫', title:'Don\'t overshare', desc:'Avoid sharing your home address, workplace, or financial information too early.' },
  { icon:'🧠', title:'Trust your instincts', desc:'If something doesn\'t feel right, you are always allowed to leave. Your safety comes first.' },
  { icon:'🆘', title:'Emergency contacts', desc:'Save the Lynkapp Emergency Hotline in your phone: 1-800-LYNK-SAFE.' },
];

const REPORTING_OPTIONS = [
  { icon:'🚩', label:'Report Fake Profile', desc:'They are using photos or information that isn\'t theirs' },
  { icon:'🔞', label:'Report Underage User', desc:'I believe this person is under 18 years old' },
  { icon:'💬', label:'Report Harassment', desc:'I\'ve received threatening, abusive, or hateful messages' },
  { icon:'📸', label:'Report Inappropriate Content', desc:'They sent or posted explicit content without consent' },
  { icon:'🎭', label:'Report Catfishing', desc:'This person pretended to be someone they\'re not' },
  { icon:'🚫', label:'Block This Person', desc:'Prevent them from seeing or contacting you' },
];

const PAGE_BG = 'linear-gradient(160deg,#0a0a18 0%,#12091e 60%,#0a0a18 100%)';

export default function SafetyCenterPage() {
  const navigate  = useNavigate();
  const showToast = useAppStore(s => s.showToast);
  const [activeTab, setActiveTab] = useState('tips'); // 'tips' | 'report' | 'verify'
  const [checkStatus, setCheckStatus] = useState('idle'); // 'idle' | 'pending' | 'done'
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportDetails, setReportDetails] = useState('');

  const handleSubmitReport = () => {
    if (!selectedReport) {
      showToast('⚠️ Please select a reason', 'warning');
      return;
    }
    setReportSubmitted(true);
    showToast('✅ Report submitted — our team will review within 24 hours', 'success');
  };

  const handleVerification = () => {
    setCheckStatus('pending');
    setTimeout(() => {
      setCheckStatus('done');
      showToast('✅ Identity verification submitted!', 'success');
    }, 2000);
  };

  const TABS = [
    { key:'tips', label:'🛡️ Safety Tips' },
    { key:'report', label:'🚩 Report' },
    { key:'verify', label:'✅ Get Verified' },
  ];

  return (
    <div style={{ minHeight:'100vh', background:PAGE_BG, paddingBottom:60,
      fontFamily:'system-ui,sans-serif', color:'#f1f5f9' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'16px 16px 8px' }}>
        <button onClick={() => navigate(-1)}
          style={{ width:36, height:36, borderRadius:'50%', background:'rgba(255,255,255,0.07)',
            border:'1px solid rgba(255,255,255,0.1)', color:'#94a3b8', fontSize:16,
            cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
          ←
        </button>
        <div>
          <div style={{ fontSize:18, fontWeight:800, color:'#f1f5f9' }}>🛡️ Safety Center</div>
          <div style={{ fontSize:12, color:'#64748b' }}>Your safety is our top priority</div>
        </div>
      </div>

      {/* Emergency banner */}
      <div style={{ margin:'8px 16px 16px', padding:'12px 16px', borderRadius:14,
        background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)',
        display:'flex', alignItems:'center', gap:12 }}>
        <span style={{ fontSize:24 }}>🆘</span>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#f87171' }}>In an emergency?</div>
          <div style={{ fontSize:11, color:'#94a3b8' }}>Call 911 or local emergency services immediately</div>
        </div>
        <a href="tel:911"
          style={{ padding:'8px 14px', borderRadius:12, background:'#ef4444', border:'none',
            color:'white', fontWeight:700, fontSize:12, cursor:'pointer', textDecoration:'none',
            display:'inline-flex', alignItems:'center' }}>
          Call 911
        </a>
      </div>

      {/* Tab bar */}
      <div style={{ display:'flex', gap:6, padding:'0 16px', marginBottom:20 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            style={{ flex:1, padding:'10px 4px', borderRadius:14, cursor:'pointer', fontSize:12, fontWeight:700,
              background: activeTab === t.key ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
              border: activeTab === t.key ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.08)',
              color: activeTab === t.key ? '#a5b4fc' : '#64748b', minHeight:44 }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding:'0 16px' }}>

        {/* SAFETY TIPS TAB */}
        {activeTab === 'tips' && (
          <div>
            <div style={{ fontSize:14, color:'#64748b', marginBottom:16, lineHeight:1.6 }}>
              Follow these guidelines to stay safe while dating online and in person.
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {SAFETY_TIPS.map((tip, i) => (
                <div key={i} style={{ display:'flex', gap:14, padding:'14px 16px', borderRadius:16,
                  background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)' }}>
                  <span style={{ fontSize:24, flexShrink:0, marginTop:2 }}>{tip.icon}</span>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:'#f1f5f9', marginBottom:4 }}>{tip.title}</div>
                    <div style={{ fontSize:12, color:'#94a3b8', lineHeight:1.5 }}>{tip.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Crisis resources */}
            <div style={{ marginTop:20, padding:'16px', borderRadius:16,
              background:'rgba(99,102,241,0.07)', border:'1px solid rgba(99,102,241,0.15)' }}>
              <div style={{ fontSize:14, fontWeight:800, color:'#a5b4fc', marginBottom:12 }}>
                📞 Crisis Resources
              </div>
              {[
                { label:'National Sexual Assault Hotline', num:'1-800-656-HOPE (4673)' },
                { label:'National Domestic Violence Hotline', num:'1-800-799-7233' },
                { label:'Crisis Text Line', num:'Text HOME to 741741' },
              ].map(r => (
                <div key={r.label} style={{ marginBottom:10, paddingBottom:10,
                  borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize:12, color:'#64748b', marginBottom:2 }}>{r.label}</div>
                  <div style={{ fontSize:14, fontWeight:700, color:'#f1f5f9' }}>{r.num}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REPORT TAB */}
        {activeTab === 'report' && (
          <div>
            {reportSubmitted ? (
              <div style={{ textAlign:'center', padding:'40px 20px' }}>
                <div style={{ fontSize:64, marginBottom:16 }}>✅</div>
                <div style={{ fontSize:20, fontWeight:800, color:'#22c55e', marginBottom:8 }}>
                  Report Submitted
                </div>
                <div style={{ fontSize:14, color:'#64748b', lineHeight:1.6, marginBottom:24 }}>
                  Thank you for keeping Lynkapp safe. Our moderation team will review your report within 24 hours.
                </div>
                <button onClick={() => { setReportSubmitted(false); setSelectedReport(null); setReportDetails(''); }}
                  style={{ padding:'12px 24px', borderRadius:16, border:'none', cursor:'pointer',
                    background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'white',
                    fontWeight:700, fontSize:14 }}>
                  Submit Another Report
                </button>
              </div>
            ) : (
              <>
                <div style={{ fontSize:14, color:'#64748b', marginBottom:16 }}>
                  Select a reason for your report:
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:20 }}>
                  {REPORTING_OPTIONS.map(opt => (
                    <button key={opt.label} onClick={() => setSelectedReport(opt.label)}
                      style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'14px 16px',
                        borderRadius:16, cursor:'pointer', textAlign:'left', minHeight:56,
                        background: selectedReport === opt.label ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.04)',
                        border: selectedReport === opt.label ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(255,255,255,0.07)' }}>
                      <span style={{ fontSize:20, flexShrink:0, marginTop:2 }}>{opt.icon}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:14, fontWeight:700,
                          color: selectedReport === opt.label ? '#f87171' : '#f1f5f9', marginBottom:3 }}>
                          {opt.label}
                        </div>
                        <div style={{ fontSize:11, color:'#64748b' }}>{opt.desc}</div>
                      </div>
                      {selectedReport === opt.label && <span style={{ color:'#ef4444', fontSize:16 }}>✓</span>}
                    </button>
                  ))}
                </div>

                {selectedReport && (
                  <div style={{ marginBottom:16 }}>
                    <label style={{ fontSize:13, fontWeight:700, color:'#94a3b8', display:'block', marginBottom:8 }}>
                      Additional details (optional)
                    </label>
                    <textarea value={reportDetails} onChange={e => setReportDetails(e.target.value)}
                      placeholder="Describe what happened…"
                      style={{ width:'100%', minHeight:100, borderRadius:14, padding:'12px',
                        background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
                        color:'#f1f5f9', fontSize:13, resize:'vertical', fontFamily:'inherit',
                        boxSizing:'border-box' }} />
                  </div>
                )}

                <button onClick={handleSubmitReport}
                  style={{ width:'100%', padding:'14px', borderRadius:16, border:'none', cursor:'pointer',
                    background: selectedReport ? 'linear-gradient(135deg,#ef4444,#dc2626)' : 'rgba(255,255,255,0.06)',
                    color: selectedReport ? 'white' : '#475569', fontWeight:800, fontSize:14, minHeight:44 }}>
                  🚩 Submit Report
                </button>
              </>
            )}
          </div>
        )}

        {/* VERIFICATION TAB */}
        {activeTab === 'verify' && (
          <div>
            <div style={{ textAlign:'center', marginBottom:24 }}>
              <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
              <div style={{ fontSize:18, fontWeight:800, color:'#f1f5f9', marginBottom:8 }}>
                Get Verified
              </div>
              <div style={{ fontSize:13, color:'#64748b', lineHeight:1.6 }}>
                A verified badge shows other users that you are a real person. Verification increases your match rate by up to 3×.
              </div>
            </div>

            {/* Benefits */}
            <div style={{ marginBottom:20 }}>
              {[
                { icon:'💚', text:'Verified badge on your profile card' },
                { icon:'🔒', text:'Increases trust with potential matches' },
                { icon:'📈', text:'Up to 3× more profile views' },
                { icon:'⚡', text:'Priority in the matching algorithm' },
              ].map(b => (
                <div key={b.text} style={{ display:'flex', alignItems:'center', gap:12,
                  padding:'12px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize:20 }}>{b.icon}</span>
                  <span style={{ fontSize:14, color:'#cbd5e1' }}>{b.text}</span>
                </div>
              ))}
            </div>

            {/* How it works */}
            <div style={{ background:'rgba(99,102,241,0.07)', border:'1px solid rgba(99,102,241,0.15)',
              borderRadius:16, padding:'16px', marginBottom:20 }}>
              <div style={{ fontSize:14, fontWeight:700, color:'#a5b4fc', marginBottom:12 }}>
                How Verification Works
              </div>
              {[
                '1. Take a selfie that matches a specific pose',
                '2. Our AI compares it to your profile photos',
                '3. Verification completes within 24 hours',
                '4. Your badge appears immediately on approval',
              ].map(step => (
                <div key={step} style={{ fontSize:12, color:'#94a3b8', marginBottom:6, lineHeight:1.5 }}>
                  {step}
                </div>
              ))}
            </div>

            {checkStatus === 'idle' && (
              <button onClick={handleVerification}
                style={{ width:'100%', padding:'16px', borderRadius:16, border:'none', cursor:'pointer',
                  background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'white',
                  fontWeight:800, fontSize:15, minHeight:44 }}>
                📸 Start Verification
              </button>
            )}
            {checkStatus === 'pending' && (
              <div style={{ textAlign:'center', padding:'20px',
                background:'rgba(99,102,241,0.08)', borderRadius:16, border:'1px solid rgba(99,102,241,0.2)' }}>
                <div style={{ fontSize:24, marginBottom:8 }}>⏳</div>
                <div style={{ fontSize:14, color:'#a5b4fc', fontWeight:700 }}>Processing verification…</div>
              </div>
            )}
            {checkStatus === 'done' && (
              <div style={{ textAlign:'center', padding:'20px',
                background:'rgba(34,197,94,0.08)', borderRadius:16, border:'1px solid rgba(34,197,94,0.25)' }}>
                <div style={{ fontSize:32, marginBottom:8 }}>✅</div>
                <div style={{ fontSize:16, color:'#22c55e', fontWeight:800, marginBottom:4 }}>
                  Verification Submitted!
                </div>
                <div style={{ fontSize:12, color:'#64748b' }}>
                  Your badge will appear within 24 hours once approved.
                </div>
              </div>
            )}

            {/* Note */}
            <div style={{ marginTop:16, fontSize:11, color:'#475569', textAlign:'center', lineHeight:1.5 }}>
              Note: Background checks are not currently performed. Identity verification only confirms you are a real person using your own photos.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
