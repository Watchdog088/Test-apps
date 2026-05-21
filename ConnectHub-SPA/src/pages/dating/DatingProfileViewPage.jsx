// src/pages/dating/DatingProfileViewPage.jsx
// ════════════════════════════════════════════════════════════════════════════
// SECTION 5 — DATING PROFILE VIEW  (/dating/profile/:uid)
// May 2026 — View another user's full dating profile before swiping
// ════════════════════════════════════════════════════════════════════════════

import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useAppStore from '@store/useAppStore';

// Mock profiles (same data as DatingPage for consistency)
const MOCK_PROFILES = [
  { id: 1, name:'Jordan',  age:26, city:'Brooklyn, NY', job:'UX Designer', distance:2,
    interests:['Art','Music','Coffee','Travel','Photography'], emoji:'🌸', color:'#7c3aed',
    bio:'Creative soul who loves exploring hidden gems and rooftop bars. Dog mom 🐕.',
    lookingFor:'Something serious 💍', mutualFriends:3, verified:true, online:true,
    height:"5'6\"", education:"Bachelor's", religion:'Agnostic', drinking:'Socially',
    smoking:'Never', kids:"Don't have kids",
    photos:['https://pravatar.cc/400?img=47','https://pravatar.cc/400?img=15','https://pravatar.cc/400?img=32'],
    prompts:[
      { q:"My perfect Sunday looks like…", a:"Farmers market in the morning, gallery hopping in the afternoon, rooftop dinner to watch the sunset." },
      { q:"We'll get along if…", a:"You can keep up with my playlist, appreciate a good flat white, and don't mind spontaneous adventures." },
    ],
    lastActive: 'Active now',
  },
  { id: 2, name:'Alex',    age:28, city:'Manhattan, NY', job:'Software Eng.', distance:5,
    interests:['Gaming','Hiking','Cooking','Tech','Coffee'], emoji:'🔥', color:'#db2777',
    bio:'Building cool things by day, hiking trails on weekends. Obsessed with great coffee.',
    lookingFor:'Casual dating ☕', mutualFriends:0, verified:false, online:false,
    height:"6'0\"", education:"Master's", religion:'Prefer not to say', drinking:'Socially',
    smoking:'Never', kids:"Don't want kids",
    photos:['https://pravatar.cc/400?img=5','https://pravatar.cc/400?img=8'],
    prompts:[
      { q:"I'm embarrassingly obsessed with…", a:"Optimizing my coffee brewing variables. I have a spreadsheet. I'm not ashamed." },
    ],
    lastActive: 'Active 2h ago',
  },
  { id: 3, name:'Sam',     age:24, city:'Queens, NY', job:'Graphic Artist', distance:8,
    interests:['Art','Music','Travel','Dance','Photography'], emoji:'⚡', color:'#0891b2',
    bio:'Art school grad who turned a passion into a career. Always planning the next trip.',
    lookingFor:'Open to anything ✨', mutualFriends:7, verified:true, online:true,
    height:"5'8\"", education:"Bachelor's", religion:'Spiritual', drinking:'Socially',
    smoking:'Never', kids:"Open to it",
    photos:['https://pravatar.cc/400?img=25','https://pravatar.cc/400?img=39','https://pravatar.cc/400?img=44'],
    prompts:[
      { q:"My perfect Sunday looks like…", a:"A new city, a camera, and zero agenda." },
      { q:"Green flag in a partner…", a:"They have strong opinions about music and don't mind dancing badly in public." },
    ],
    lastActive: 'Active now',
  },
];

function CompatBar({ score, shared }) {
  return (
    <div style={{ background:'rgba(34,197,94,0.08)', borderRadius:16, padding:'14px 16px', marginBottom:16 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
        <span style={{ fontSize:14, fontWeight:700, color:'#22c55e' }}>💚 {score}% Compatible</span>
        <span style={{ fontSize:11, color:'#64748b' }}>{shared.length} shared interests</span>
      </div>
      <div style={{ height:6, background:'rgba(255,255,255,0.08)', borderRadius:3 }}>
        <div style={{ width:`${score}%`, height:'100%', borderRadius:3,
          background:'linear-gradient(90deg,#22c55e,#16a34a)', transition:'width 0.6s ease' }} />
      </div>
      {shared.length > 0 && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:10 }}>
          {shared.map(i => (
            <span key={i} style={{ background:'rgba(34,197,94,0.15)', border:'1px solid rgba(34,197,94,0.3)',
              borderRadius:20, padding:'3px 10px', fontSize:11, color:'#22c55e', fontWeight:600 }}>
              ✓ {i}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DatingProfileViewPage() {
  const { uid }    = useParams();
  const navigate   = useNavigate();
  const showToast  = useAppStore(s => s.showToast);
  const userProfile = useAppStore(s => s.userProfile);

  const [photoIdx, setPhotoIdx] = useState(0);
  const [reported, setReported] = useState(false);

  // Find profile by uid (in production this fetches from Firestore)
  const profile = useMemo(() =>
    MOCK_PROFILES.find(p => String(p.id) === String(uid)) || MOCK_PROFILES[0],
    [uid]
  );

  const userInterests = userProfile?.interests || ['Art','Coffee','Music','Travel','Photography'];
  const shared = profile.interests.filter(i => userInterests.includes(i));
  const compatScore = Math.min(99, Math.max(55,
    Math.round((shared.length / Math.max(profile.interests.length, 1)) * 100) + 25 + ((profile.id * 7) % 15 - 7)
  ));

  const handleLike = () => {
    showToast(`💚 You liked ${profile.name}!`, 'success');
    navigate(-1);
  };

  const handlePass = () => {
    showToast(`👋 Passed on ${profile.name}`, 'info');
    navigate(-1);
  };

  const handleSuperLike = () => {
    showToast(`⭐ Super Like sent to ${profile.name}!`, 'success');
    navigate(-1);
  };

  const DetailPill = ({ label }) => (
    <span style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)',
      borderRadius:20, padding:'5px 12px', fontSize:12, color:'#94a3b8' }}>
      {label}
    </span>
  );

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#0a0a18,#12091e)',
      paddingBottom:140, fontFamily:'system-ui,sans-serif', color:'#f1f5f9' }}>

      {/* Photo header */}
      <div style={{ position:'relative', height:380 }}>
        {profile.photos?.length > 0 ? (
          <img src={profile.photos[photoIdx]} alt={profile.name}
            style={{ width:'100%', height:'100%', objectFit:'cover' }}
            onError={e => { e.target.style.display='none'; }} />
        ) : (
          <div style={{ width:'100%', height:'100%',
            background:`linear-gradient(135deg,${profile.color},#0a0a2e)`,
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:100 }}>
            {profile.emoji}
          </div>
        )}

        {/* Photo tap zones */}
        {(profile.photos?.length || 0) > 1 && <>
          <div onClick={() => setPhotoIdx(i => Math.max(0, i-1))}
            style={{ position:'absolute', left:0, top:0, bottom:0, width:'33%', cursor:'pointer' }} />
          <div onClick={() => setPhotoIdx(i => Math.min(profile.photos.length-1, i+1))}
            style={{ position:'absolute', right:0, top:0, bottom:0, width:'33%', cursor:'pointer' }} />
          {/* Progress dots */}
          <div style={{ position:'absolute', top:12, left:0, right:0, display:'flex', justifyContent:'center', gap:4 }}>
            {profile.photos.map((_, pi) => (
              <div key={pi} style={{ height:4, borderRadius:2,
                width: pi === photoIdx ? 18 : 6,
                background: pi === photoIdx ? '#fff' : 'rgba(255,255,255,0.4)',
                transition:'width 0.2s ease' }} />
            ))}
          </div>
        </>}

        {/* Back + Report buttons */}
        <button onClick={() => navigate(-1)}
          style={{ position:'absolute', top:48, left:12, width:36, height:36,
            borderRadius:'50%', background:'rgba(0,0,0,0.6)', border:'none',
            color:'white', fontSize:18, cursor:'pointer', display:'flex',
            alignItems:'center', justifyContent:'center', zIndex:10 }}>
          ←
        </button>
        <button onClick={() => { setReported(true); showToast('🚩 Report submitted', 'success'); }}
          style={{ position:'absolute', top:48, right:12, width:36, height:36,
            borderRadius:'50%', background:'rgba(0,0,0,0.6)', border:'none',
            color: reported ? '#ef4444' : 'white', fontSize:14, cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center', zIndex:10 }}>
          {reported ? '🚩' : '···'}
        </button>

        {/* Bottom gradient overlay */}
        <div style={{ position:'absolute', bottom:0, left:0, right:0,
          background:'linear-gradient(to top,rgba(10,10,24,0.98),transparent)',
          padding:'60px 16px 16px' }}>
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between' }}>
            <div>
              <div style={{ fontSize:26, fontWeight:900, color:'#f1f5f9' }}>
                {profile.name}, {profile.age}
                {profile.verified && <span style={{ marginLeft:6, fontSize:16 }}>✅</span>}
              </div>
              <div style={{ fontSize:13, color:'#94a3b8', marginTop:2 }}>
                💼 {profile.job} · 📍 {profile.distance} mi away
              </div>
            </div>
            {profile.online && (
              <span style={{ fontSize:12, background:'rgba(34,197,94,0.2)',
                border:'1px solid #22c55e', borderRadius:20, padding:'4px 10px',
                color:'#22c55e', fontWeight:700 }}>🟢 Online</span>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding:'20px 16px 0' }}>
        {/* Last active + looking for */}
        <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
          <span style={{ fontSize:11, background:'rgba(99,102,241,0.15)',
            border:'1px solid rgba(99,102,241,0.3)', borderRadius:20,
            padding:'4px 10px', color:'#a5b4fc', fontWeight:600 }}>
            🕐 {profile.lastActive}
          </span>
          <span style={{ fontSize:11, background:'rgba(168,85,247,0.15)',
            border:'1px solid rgba(168,85,247,0.3)', borderRadius:20,
            padding:'4px 10px', color:'#d8b4fe', fontWeight:600 }}>
            {profile.lookingFor}
          </span>
          {profile.mutualFriends > 0 && (
            <span style={{ fontSize:11, background:'rgba(99,102,241,0.1)',
              border:'1px solid rgba(99,102,241,0.2)', borderRadius:20,
              padding:'4px 10px', color:'#a5b4fc', fontWeight:600 }}>
              👥 {profile.mutualFriends} mutual friend{profile.mutualFriends > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Compat bar */}
        <CompatBar score={compatScore} shared={shared} />

        {/* Bio */}
        {profile.bio && (
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:13, fontWeight:700, color:'#64748b', marginBottom:8, letterSpacing:1 }}>
              ABOUT
            </div>
            <p style={{ fontSize:15, color:'#cbd5e1', lineHeight:1.7, margin:0 }}>{profile.bio}</p>
          </div>
        )}

        {/* Prompts */}
        {(profile.prompts || []).length > 0 && (
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:13, fontWeight:700, color:'#64748b', marginBottom:10, letterSpacing:1 }}>
              CONVERSATION STARTERS
            </div>
            {profile.prompts.map((p, i) => (
              <div key={i} style={{ background:'rgba(99,102,241,0.07)',
                border:'1px solid rgba(99,102,241,0.15)', borderRadius:16,
                padding:'14px 16px', marginBottom:10 }}>
                <div style={{ fontSize:11, color:'#6366f1', fontWeight:700, marginBottom:6 }}>{p.q}</div>
                <div style={{ fontSize:14, color:'#e2e8f0', lineHeight:1.6 }}>{p.a}</div>
              </div>
            ))}
          </div>
        )}

        {/* Interests */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#64748b', marginBottom:10, letterSpacing:1 }}>
            INTERESTS
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {profile.interests.map(i => (
              <span key={i} style={{
                background: shared.includes(i) ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.06)',
                border: shared.includes(i) ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(255,255,255,0.08)',
                borderRadius:20, padding:'6px 14px', fontSize:13,
                color: shared.includes(i) ? '#22c55e' : '#94a3b8',
                fontWeight: shared.includes(i) ? 600 : 400,
              }}>
                {shared.includes(i) ? '✓ ' : '#'}{i}
              </span>
            ))}
          </div>
        </div>

        {/* Details */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#64748b', marginBottom:10, letterSpacing:1 }}>
            DETAILS
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {profile.height && <DetailPill label={`📏 ${profile.height}`} />}
            {profile.education && <DetailPill label={`🎓 ${profile.education}`} />}
            {profile.religion && profile.religion !== 'Prefer not to say' && <DetailPill label={`🙏 ${profile.religion}`} />}
            {profile.drinking && <DetailPill label={`🍷 Drinks ${profile.drinking}`} />}
            {profile.smoking && <DetailPill label={`🚬 ${profile.smoking}`} />}
            {profile.kids && <DetailPill label={`👶 ${profile.kids}`} />}
          </div>
        </div>
      </div>

      {/* Fixed action buttons */}
      <div style={{ position:'fixed', bottom:0, left:0, right:0,
        background:'rgba(10,10,24,0.97)', borderTop:'1px solid rgba(255,255,255,0.08)',
        padding:'12px 16px 28px', backdropFilter:'blur(10px)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:16 }}>
          {/* Pass */}
          <div style={{ textAlign:'center' }}>
            <button onClick={handlePass}
              style={{ width:60, height:60, borderRadius:'50%', background:'transparent',
                border:'2px solid #ef4444', color:'#ef4444', fontSize:22, cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center', minHeight:44 }}>
              ✕
            </button>
            <div style={{ fontSize:10, color:'#ef4444', marginTop:4, fontWeight:600 }}>Pass</div>
          </div>
          {/* Super Like */}
          <div style={{ textAlign:'center' }}>
            <button onClick={handleSuperLike}
              style={{ width:52, height:52, borderRadius:'50%', background:'transparent',
                border:'2px solid #6366f1', color:'#6366f1', fontSize:20, cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center', minHeight:44 }}>
              ⭐
            </button>
            <div style={{ fontSize:10, color:'#6366f1', marginTop:4, fontWeight:600 }}>Super</div>
          </div>
          {/* Like */}
          <div style={{ textAlign:'center' }}>
            <button onClick={handleLike}
              style={{ width:72, height:72, borderRadius:'50%',
                background:'linear-gradient(135deg,#22c55e,#16a34a)', border:'none',
                color:'white', fontSize:28, cursor:'pointer',
                boxShadow:'0 8px 24px rgba(34,197,94,0.4)',
                display:'flex', alignItems:'center', justifyContent:'center', minHeight:44 }}>
              💚
            </button>
            <div style={{ fontSize:11, color:'#22c55e', marginTop:4, fontWeight:700 }}>Like</div>
          </div>
        </div>
      </div>
    </div>
  );
}
