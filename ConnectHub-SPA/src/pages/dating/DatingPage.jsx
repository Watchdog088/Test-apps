// src/pages/dating/DatingPage.jsx
// ════════════════════════════════════════════════════════════════════════════
// DATING SECTION — COMPLETE REWRITE (May 12 2026)
// ════════════════════════════════════════════════════════════════════════════
// BUG-01 FIXED: Compat % is stable (useMemo, no Math.random jitter)
// BUG-02 FIXED: Card tap → ProfileDetailSheet (full profile view)
// BUG-03 FIXED: Match row updates dynamically when new match is made
// BUG-04 FIXED: MatchModal shows BOTH avatars + confetti animation
// BUG-05 FIXED: ⚙️ opens DatingPreferencesSheet, NOT generic /settings
// BUG-06 PARTIAL: localStorage persistence. Firestore wiring still pending.
// BUG-07 FIXED: Mouse events on window (drag never lost on cursor leave)
// BUG-08 FIXED: Filter bar right-fade gradient + sentinel spacer
// BUG-09 FIXED: Age filter reads prefs.ageMin/Max (not hardcoded)
// BUG-10 FIXED: Shimmer loading state between filter switches
// BUG-12 FIXED: isAnimating ref guards rapid button clicks
// BUG-13 FIXED: Toast uses typed showToast (success/warning/info)
// MISSING-02: Placeholder photos (pravatar.cc), img with onError fallback
// MISSING-03: Rewind/Undo button with history stack
// MISSING-04: Block/Report sheet on every card
// MISSING-05: Full Dating Preferences sheet
// MISSING-06: Daily swipe counter (localStorage, 100/day)
// MISSING-07: Super Like counter badge (3/day)
// MISSING-08: Profile Detail Sheet (photo gallery, bio, interests, compat)
// MISSING-09: Photo navigation within cards (tap zones + progress dots)
// MISSING-10: Push notification prompt after first match
// MISSING-11: Profile completion bar CTA
// MISSING-12: "Looking For" filter
// MISSING-13: Mutual friends pill on cards
// MISSING-14: Relationship intention label on cards
// MISSING-15: Post-match Date Assistant UI (3 date suggestions)
// MISSING-16: Boost button with 30-min countdown timer
// MISSING-17: Favorites ♡ button on cards
// DESIGN-02: Card stack depth (next card visible behind)
// DESIGN-03: Button hierarchy (Like 72px primary, Pass 60px, etc.)
// DESIGN-04: Confetti animation in MatchModal
// DESIGN-05: Compat % tooltip with shared interests
// DESIGN-06: CTA card below matches row
// DESIGN-07: Unique gradient colors for match avatars
// DESIGN-08: New-match count badge in header
// DESIGN-09: Directional green/red glow on drag
// A-01: aria-label + aria-pressed on filter pills
// A-02: Text labels under action buttons
// A-04: Focus trap in MatchModal
// A-05: role="button" + tabIndex on draggable card
// A-06: 44px touch targets on filter pills
// A-09: Skip-link for filter bar
// A-10/A-11: prefers-reduced-motion support
// A-12: aria-label on emoji avatar fallback
// P-01/P-02: useMemo for compat, no random jitter
// P-05: Mouse events on window not container
// S-02: Age gate (18+) check on mount using userProfile.dateOfBirth
// S-02b: Under-18 UI gate (blocks access, shows age requirement screen)
// ════════════════════════════════════════════════════════════════════════════

import React, {
  useState, useEffect, useRef, useMemo, useCallback
} from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '@store/useAppStore';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS & MOCK DATA
// ─────────────────────────────────────────────────────────────────────────────
const PLACEHOLDER_PHOTOS = {
  1: ['https://pravatar.cc/400?img=47','https://pravatar.cc/400?img=15','https://pravatar.cc/400?img=32'],
  2: ['https://pravatar.cc/400?img=5', 'https://pravatar.cc/400?img=8'],
  3: ['https://pravatar.cc/400?img=25','https://pravatar.cc/400?img=39','https://pravatar.cc/400?img=44'],
  4: ['https://pravatar.cc/400?img=48','https://pravatar.cc/400?img=51'],
  5: ['https://pravatar.cc/400?img=16','https://pravatar.cc/400?img=22','https://pravatar.cc/400?img=36'],
};

const BASE_PROFILES = [
  { id:1, name:'Jordan',  age:26, city:'Brooklyn, NY',  job:'UX Designer', distance:2,
    interests:['Art','Music','Coffee','Travel','Photography'], emoji:'🌸', color:'#7c3aed',
    bio:'Creative soul who loves exploring hidden gems and rooftop bars. Dog mom 🐕.',
    lookingFor:'Something serious 💍', mutualFriends:3, verified:true, online:true, lookingForKey:'serious', hasVideo:true, videoDuration:'0:31' },
  { id:2, name:'Alex',    age:28, city:'Manhattan, NY', job:'Software Eng.', distance:5,
    interests:['Gaming','Hiking','Cooking','Tech','Coffee'], emoji:'🔥', color:'#db2777',
    bio:'Building cool things by day, hiking trails on weekends. Obsessed with great coffee.',
    lookingFor:'Casual dating ☕', mutualFriends:0, verified:false, online:false, lookingForKey:'casual', hasVideo:false },
  { id:3, name:'Sam',     age:24, city:'Queens, NY',    job:'Graphic Artist', distance:8,
    interests:['Art','Music','Travel','Dance','Photography'], emoji:'⚡', color:'#0891b2',
    bio:'Art school grad who turned a passion into a career. Always planning the next trip.',
    lookingFor:'Open to anything ✨', mutualFriends:7, verified:true, online:true, lookingForKey:'open', hasVideo:true, videoDuration:'0:19' },
  { id:4, name:'Riley',   age:30, city:'Hoboken, NJ',   job:'Marketing Dir.', distance:12,
    interests:['Fitness','Travel','Wine','Business','Music'], emoji:'💫', color:'#d97706',
    bio:'Runner. Wine enthusiast. Trying to see 30 countries before 35.',
    lookingFor:'Something serious 💍', mutualFriends:1, verified:true, online:false, lookingForKey:'serious', hasVideo:false },
  { id:5, name:'Casey',   age:27, city:'Jersey City',   job:'Yoga Teacher', distance:15,
    interests:['Yoga','Meditation','Cooking','Nature','Art'], emoji:'🌙', color:'#16a34a',
    bio:'Finding balance one pose at a time. Farmer market obsessed.',
    lookingFor:'Casual dating ☕', mutualFriends:2, verified:false, online:true, lookingForKey:'casual', hasVideo:true, videoDuration:'0:45' },
];

const INITIAL_MATCHES = [
  { id:10, name:'Morgan', emoji:'💜', color:'#7c3aed' },
  { id:11, name:'Taylor', emoji:'💛', color:'#9333ea' },
  { id:12, name:'Blake',  emoji:'🧡', color:'#d97706' },
  { id:13, name:'Quinn',  emoji:'💚', color:'#0d9488' },
];

const FILTER_LABELS = ['All','Nearby','Online','Verified','Serious','Casual','Age Range','Looking For'];

const DATE_SUGGESTIONS = {
  'Art':          { icon:'🎨', title:'Gallery Hop', desc:'Visit 3 art galleries and debate your favorites over wine.' },
  'Music':        { icon:'🎵', title:'Jazz Night',  desc:'Catch a live jazz set at a cozy underground venue.' },
  'Coffee':       { icon:'☕', title:'Café Crawl',  desc:'Hit 3 specialty coffee shops across the neighborhood.' },
  'Travel':       { icon:'✈️', title:'Day Trip',    desc:'Spontaneous train ride to a nearby city for the afternoon.' },
  'Hiking':       { icon:'🥾', title:'Sunrise Hike',desc:'Early hike, breakfast at the summit.' },
  'Cooking':      { icon:'🍳', title:'Cook Together',desc:'Take a hands-on cooking class for a cuisine you both love.' },
  'Yoga':         { icon:'🧘', title:'Partner Yoga', desc:'Fun partner yoga class followed by a healthy brunch.' },
  'Gaming':       { icon:'🎮', title:'Game Night',  desc:'Retro arcade bar with unlimited plays.' },
  'Photography':  { icon:'📷', title:'Photo Walk',  desc:'Golden-hour photo walk through the botanical gardens.' },
  'Fitness':      { icon:'🏃', title:'5K Together', desc:'Run a fun 5K and celebrate with brunch after.' },
  'Dance':        { icon:'💃', title:'Salsa Class', desc:'Beginner salsa class — no experience needed, just show up.' },
  'Nature':       { icon:'🌿', title:'Picnic Date', desc:'Pack a picnic and head to the best park in the city.' },
  'Wine':         { icon:'🍷', title:'Wine Tasting', desc:'Private wine tasting at a boutique downtown cellar.' },
  'Meditation':   { icon:'🧘', title:'Sound Bath',  desc:'A 60-minute sound bath meditation session together.' },
  'default':      { icon:'🌟', title:'Sunset Stroll',desc:'Walk along the waterfront and grab dinner after.' },
};

// ─────────────────────────────────────────────────────────────────────────────
// DAILY SWIPE PERSISTENCE (localStorage)
// ─────────────────────────────────────────────────────────────────────────────
const getDailyKey = () => `dating_swipes_${new Date().toISOString().slice(0, 10)}`;
const getSuperKey = () => `dating_supers_${new Date().toISOString().slice(0, 10)}`;
function getDailySwipeCount() {
  try { return parseInt(localStorage.getItem(getDailyKey()) || '0', 10); } catch { return 0; }
}
function saveDailySwipeCount(n) {
  try { localStorage.setItem(getDailyKey(), String(n)); } catch {}
}
function getDailySuperCount() {
  try { return parseInt(localStorage.getItem(getSuperKey()) || '0', 10); } catch { return 0; }
}
function saveDailySuperCount(n) {
  try { localStorage.setItem(getSuperKey(), String(n)); } catch {}
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPAT SCORE (deterministic)
// ─────────────────────────────────────────────────────────────────────────────
function computeCompat(profile, userInterests, fuzz) {
  const shared = profile.interests.filter(i => userInterests.includes(i));
  const base   = Math.round((shared.length / Math.max(profile.interests.length, 1)) * 100);
  // Deterministic variation using profile id — no Math.random()
  const jitter = ((profile.id * 7) % 15) - 7;
  return { score: Math.min(99, Math.max(55, base + 25 + jitter)), shared };
}

// ─────────────────────────────────────────────────────────────────────────────
// AGE GATE CHECK (S-02)
// ─────────────────────────────────────────────────────────────────────────────
function isUnder18(dateOfBirth) {
  if (!dateOfBirth) return false; // no DOB = allow (backend should enforce)
  try {
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age < 18;
  } catch { return false; }
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFETTI (MatchModal)
// ─────────────────────────────────────────────────────────────────────────────
const CONFETTI_EMOJIS = ['💚','💕','⭐','✨','🎉','💫','🌟','❤️','🧡','💛'];
function Confetti() {
  const pieces = useMemo(() => Array.from({ length: 20 }, (_, i) => ({
    id: i, emoji: CONFETTI_EMOJIS[i % CONFETTI_EMOJIS.length],
    left: `${5 + (i * 4.5) % 90}%`,
    delay: `${(i * 0.12).toFixed(2)}s`,
    duration: `${0.9 + (i % 5) * 0.18}s`,
  })), []);
  return (
    <div style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden' }}>
      {pieces.map(p => (
        <div key={p.id} style={{
          position:'absolute', top:'-10%', left:p.left,
          fontSize:16, animation:`confettiFall ${p.duration} ease-in ${p.delay} forwards`,
        }}>{p.emoji}</div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MATCH MODAL (BUG-04 fixed: dual avatars — A-04: focus trap)
// ─────────────────────────────────────────────────────────────────────────────
function MatchModal({ match, userEmoji, onMessage, onKeepSwiping }) {
  const firstBtn = useRef(null);
  const lastBtn  = useRef(null);

  // A-04 FIX: Focus trap inside modal
  useEffect(() => {
    const prev = document.activeElement;
    setTimeout(() => firstBtn.current?.focus(), 80);
    const handleKey = (e) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === firstBtn.current) {
          e.preventDefault(); lastBtn.current?.focus();
        }
      } else {
        if (document.activeElement === lastBtn.current) {
          e.preventDefault(); firstBtn.current?.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      prev?.focus();
    };
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`It's a Lynk! You matched with ${match.name}`}
      style={{
        position:'fixed', inset:0, zIndex:900,
        background:'rgba(0,0,0,0.85)', backdropFilter:'blur(10px)',
        display:'flex', alignItems:'center', justifyContent:'center',
        padding:20,
      }}>
      <Confetti />
      <div style={{
        background:'linear-gradient(160deg,#0f0c29 0%,#1a1060 50%,#0a0a2e 100%)',
        borderRadius:28, padding:'36px 24px 28px', maxWidth:340, width:'100%',
        textAlign:'center', position:'relative', zIndex:1,
        border:'1px solid rgba(99,102,241,0.4)',
        boxShadow:'0 24px 80px rgba(99,102,241,0.35)',
      }}>
        {/* Pulsing heart */}
        <div style={{ fontSize:36, animation:'heartPulse 0.8s ease infinite alternate', marginBottom:12 }}>💚</div>
        <div style={{ fontSize:22, fontWeight:900, color:'#f1f5f9', marginBottom:6 }}>
          It's a Lynk! 🎉
        </div>
        <div style={{ fontSize:14, color:'#94a3b8', marginBottom:24 }}>
          You and {match.name} liked each other
        </div>
        {/* Dual avatar row */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:20, marginBottom:28 }}>
          <div style={{ textAlign:'center' }}>
            <div style={{
              width:70, height:70, borderRadius:'50%', fontSize:32,
              background:'linear-gradient(135deg,#6366f1,#8b5cf6)',
              display:'flex', alignItems:'center', justifyContent:'center',
              border:'3px solid #22c55e', margin:'0 auto 6px',
            }}>{userEmoji || '😊'}</div>
            <div style={{ fontSize:11, color:'#94a3b8', fontWeight:600 }}>You</div>
          </div>
          <div style={{ fontSize:24, animation:'heartPulse 1s ease infinite alternate' }}>💚</div>
          <div style={{ textAlign:'center' }}>
            <div style={{
              width:70, height:70, borderRadius:'50%', fontSize:32,
              background:`linear-gradient(135deg,${match.color || '#db2777'},#7c3aed)`,
              display:'flex', alignItems:'center', justifyContent:'center',
              border:'3px solid #22c55e', margin:'0 auto 6px',
            }}>{match.emoji || '💫'}</div>
            <div style={{ fontSize:11, color:'#94a3b8', fontWeight:600 }}>{match.name}</div>
          </div>
        </div>
        <button
          ref={firstBtn}
          onClick={onMessage}
          style={{
            width:'100%', padding:'14px', borderRadius:16, marginBottom:10,
            background:'linear-gradient(135deg,#22c55e,#16a34a)',
            border:'none', color:'white', fontSize:15, fontWeight:800, cursor:'pointer',
          }}>
          💬 Send a Message
        </button>
        <button
          ref={lastBtn}
          onClick={onKeepSwiping}
          style={{
            width:'100%', padding:'12px', borderRadius:16,
            background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)',
            color:'#94a3b8', fontSize:14, fontWeight:600, cursor:'pointer',
          }}>
          Keep Swiping →
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DATE ASSISTANT MODAL (MISSING-15)
// 3 date suggestions based on shared interests shown after match dismissal
// ─────────────────────────────────────────────────────────────────────────────
function DateAssistantModal({ match, sharedInterests, onClose }) {
  const [step, setStep] = useState(1);                // 1 = suggestions, 2 = schedule
  const [selectedSlot, setSelectedSlot] = useState(null); // MISSING-20: time slot picker
  const suggestions = useMemo(() => {
    const found = sharedInterests
      .map(i => DATE_SUGGESTIONS[i])
      .filter(Boolean)
      .slice(0, 2);
    // Always pad to 3 with the default
    while (found.length < 3) found.push(DATE_SUGGESTIONS['default']);
    return found.slice(0, 3).map((s, i) => ({ ...s, id: i }));
  }, [sharedInterests]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Date Assistant — suggestions for your first date"
      style={{
        position:'fixed', inset:0, zIndex:850,
        background:'rgba(0,0,0,0.82)', backdropFilter:'blur(10px)',
        display:'flex', alignItems:'flex-end', justifyContent:'center',
      }}>
      <div style={{
        background:'linear-gradient(160deg,#0f0c29 0%,#1a1060 100%)',
        borderRadius:'24px 24px 0 0', padding:'24px 20px 40px',
        maxWidth:480, width:'100%',
        border:'1px solid rgba(99,102,241,0.3)',
        boxShadow:'0 -8px 48px rgba(99,102,241,0.25)',
      }}>
        {/* Handle */}
        <div style={{ width:40, height:4, borderRadius:2, background:'rgba(255,255,255,0.18)', margin:'0 auto 20px' }} />
        <div style={{ textAlign:'center', marginBottom:20 }}>
          <div style={{ fontSize:28, marginBottom:6 }}>💡</div>
          <div style={{ fontSize:18, fontWeight:800, color:'#f1f5f9' }}>Date Assistant</div>
          <div style={{ fontSize:13, color:'#64748b', marginTop:4 }}>
            3 ideas based on your shared interests with {match?.name}
          </div>
        </div>
        {suggestions.map((s, i) => (
          <div key={s.id} style={{
            background:'rgba(99,102,241,0.10)', borderRadius:16,
            border:'1px solid rgba(99,102,241,0.2)',
            padding:'14px 16px', marginBottom:10,
            display:'flex', gap:12, alignItems:'flex-start',
          }}>
            <span style={{ fontSize:28, flexShrink:0 }}>{s.icon}</span>
            <div>
              <div style={{ fontWeight:700, color:'#f1f5f9', fontSize:14, marginBottom:3 }}>{s.title}</div>
              <div style={{ fontSize:12, color:'#94a3b8', lineHeight:1.4 }}>{s.desc}</div>
            </div>
          </div>
        ))}
        {/* MISSING-20: Date scheduling step */}
        {step === 1 ? (
          <>
            <button
              onClick={() => setStep(2)}
              autoFocus
              style={{
                width:'100%', padding:'14px', borderRadius:16, marginTop:6,
                background:'linear-gradient(135deg,#6366f1,#8b5cf6)',
                border:'none', color:'white', fontSize:15, fontWeight:800, cursor:'pointer', minHeight:44,
              }}>
              📅 Schedule a Date →
            </button>
            <button
              onClick={onClose}
              style={{
                width:'100%', padding:'12px', borderRadius:16, marginTop:8, minHeight:44,
                background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.10)',
                color:'#94a3b8', fontSize:14, fontWeight:600, cursor:'pointer',
              }}>
              💬 Just Message Instead
            </button>
            <button onClick={onClose}
              style={{ display:'block', margin:'8px auto 0', color:'#475569',
                fontSize:12, background:'none', border:'none', cursor:'pointer' }}>
              Skip for now
            </button>
          </>
        ) : (
          /* Step 2: Date/time picker */
          <div>
            <div style={{ fontWeight:700, color:'#f1f5f9', fontSize:15, marginBottom:12, textAlign:'center' }}>
              📅 When works for you?
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12 }}>
              {['Today Evening','Tomorrow Lunch','This Weekend','Next Week'].map(slot => (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(s => s === slot ? null : slot)}
                  style={{
                    padding:'12px 8px', borderRadius:14, cursor:'pointer', fontSize:12, fontWeight:600, minHeight:44,
                    background: selectedSlot === slot ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.05)',
                    border: selectedSlot === slot ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.08)',
                    color: selectedSlot === slot ? '#a5b4fc' : '#94a3b8',
                  }}>
                  {slot}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                onClose();
              }}
              disabled={!selectedSlot}
              style={{
                width:'100%', padding:'14px', borderRadius:16, marginTop:4, minHeight:44,
                background: selectedSlot ? 'linear-gradient(135deg,#22c55e,#16a34a)' : 'rgba(255,255,255,0.06)',
                border:'none', color: selectedSlot ? 'white' : '#475569',
                fontSize:15, fontWeight:800, cursor: selectedSlot ? 'pointer' : 'not-allowed',
                opacity: selectedSlot ? 1 : 0.6,
              }}>
              {selectedSlot ? `✅ Suggest "${selectedSlot}" →` : 'Pick a time slot first'}
            </button>
            <button onClick={() => setStep(1)}
              style={{ display:'block', margin:'8px auto 0', color:'#475569',
                fontSize:12, background:'none', border:'none', cursor:'pointer' }}>
              ← Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// REPORT / BLOCK SHEET (MISSING-04)
// ─────────────────────────────────────────────────────────────────────────────
function ReportSheet({ profile, onClose, onAction, showToast }) {
  const OPTIONS = [
    { icon:'🚩', label:'Report Fake Profile', action:'fake' },
    { icon:'📸', label:'Report Inappropriate Photos', action:'inappropriate' },
    { icon:'😡', label:'Report Harassment', action:'harassment' },
    { icon:'🔞', label:'Report Underage', action:'underage' },
    { icon:'🚫', label:'Block This Person', action:'block', warn:true },
    { icon:'👋', label:'Not Interested', action:'not_interested' },
  ];
  return (
    <div style={{
      position:'fixed', inset:0, zIndex:800, background:'rgba(0,0,0,0.7)',
      display:'flex', alignItems:'flex-end',
    }} onClick={onClose}>
      <div style={{
        background:'#0f0c29', borderRadius:'20px 20px 0 0', width:'100%',
        maxWidth:480, margin:'0 auto', paddingBottom:32,
        border:'1px solid rgba(255,255,255,0.08)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ width:40, height:4, borderRadius:2, background:'rgba(255,255,255,0.18)', margin:'12px auto 16px' }} />
        <div style={{ fontWeight:800, color:'#f1f5f9', fontSize:16, textAlign:'center', marginBottom:16 }}>
          {profile?.name}
        </div>
        {OPTIONS.map(opt => (
          <button key={opt.action} onClick={() => { onAction(opt.action); onClose(); }}
            style={{
              display:'flex', alignItems:'center', gap:14, width:'100%',
              padding:'14px 20px', background:'none', border:'none',
              borderBottom:'1px solid rgba(255,255,255,0.05)',
              color: opt.warn ? '#f87171' : '#e2e8f0',
              fontSize:14, fontWeight:opt.warn ? 700 : 500, cursor:'pointer', textAlign:'left',
              minHeight:44,
            }}>
            <span style={{ fontSize:18 }}>{opt.icon}</span>
            {opt.label}
          </button>
        ))}
        <button onClick={onClose}
          style={{
            display:'block', margin:'12px auto 0', color:'#475569',
            fontSize:13, background:'none', border:'none', cursor:'pointer',
          }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROFILE DETAIL SHEET (MISSING-08 + MISSING-09 + tap-to-expand)
// ─────────────────────────────────────────────────────────────────────────────
function ProfileDetailSheet({ profile, compat, onClose, onLike, onPass, onReport }) {
  const [photoIdx, setPhotoIdx] = useState(0);
  const [showCompatTip, setShowCompatTip] = useState(false);
  const photos = PLACEHOLDER_PHOTOS[profile.id] || [];

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:700, background:'rgba(0,0,0,0.75)',
      display:'flex', alignItems:'flex-end',
    }} onClick={onClose}>
      <div style={{
        background:'#0f0c29', borderRadius:'24px 24px 0 0', width:'100%',
        maxWidth:480, margin:'0 auto', maxHeight:'90vh', overflowY:'auto',
        paddingBottom:32,
      }} onClick={e => e.stopPropagation()}>
        {/* Photo gallery */}
        <div style={{ position:'relative', height:320, borderRadius:'24px 24px 0 0', overflow:'hidden', flexShrink:0 }}>
          {photos.length > 0 ? (
            <img src={photos[photoIdx]} alt={`${profile.name} photo ${photoIdx+1}`}
              style={{ width:'100%', height:'100%', objectFit:'cover' }}
              onError={e => { e.target.style.display='none'; }} />
          ) : (
            <div style={{ width:'100%', height:'100%',
              background:`linear-gradient(135deg,${profile.color},#0a0a2e)`,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:80 }}>{profile.emoji}</div>
          )}
          {/* Tap zones */}
          {photos.length > 1 && <>
            <div onClick={() => setPhotoIdx(i => Math.max(0,i-1))}
              style={{ position:'absolute', left:0, top:0, bottom:0, width:'33%', cursor:'pointer' }} />
            <div onClick={() => setPhotoIdx(i => Math.min(photos.length-1,i+1))}
              style={{ position:'absolute', right:0, top:0, bottom:0, width:'33%', cursor:'pointer' }} />
            {/* Photo dots */}
            <div style={{ position:'absolute', top:10, left:0, right:0, display:'flex', justifyContent:'center', gap:4 }}>
              {photos.map((_, pi) => (
                <div key={pi} style={{
                  height:4, borderRadius:2,
                  width: pi === photoIdx ? 18 : 6,
                  background: pi === photoIdx ? '#fff' : 'rgba(255,255,255,0.4)',
                  transition:'width 0.2s ease',
                }} />
              ))}
            </div>
          </>}
          {/* Close + Report */}
          <button onClick={onClose} aria-label="Close profile"
            style={{ position:'absolute', top:12, left:12, width:32, height:32,
              borderRadius:'50%', background:'rgba(0,0,0,0.55)', border:'none',
              color:'white', fontSize:16, cursor:'pointer', display:'flex',
              alignItems:'center', justifyContent:'center' }}>✕</button>
          <button onClick={(e)=>{ e.stopPropagation(); onReport(); }} aria-label="Report"
            style={{ position:'absolute', top:12, right:12, width:32, height:32,
              borderRadius:'50%', background:'rgba(0,0,0,0.55)', border:'none',
              color:'white', fontSize:14, cursor:'pointer', display:'flex',
              alignItems:'center', justifyContent:'center' }}>···</button>
        </div>
        {/* Info */}
        <div style={{ padding:'20px 20px 0' }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:6 }}>
            <div>
              <span style={{ fontSize:22, fontWeight:900, color:'#f1f5f9' }}>{profile.name}, {profile.age}</span>
              {profile.verified && <span style={{ marginLeft:8, fontSize:13 }}>✅</span>}
              {profile.online && <span style={{ marginLeft:4, fontSize:12 }}>🟢</span>}
            </div>
            {/* Compat badge with tooltip */}
            <div style={{ position:'relative' }}>
              <button onClick={() => setShowCompatTip(t=>!t)}
                style={{ background:'rgba(34,197,94,0.15)', border:'1px solid rgba(34,197,94,0.35)',
                  borderRadius:20, padding:'4px 10px', display:'flex', alignItems:'center', gap:4,
                  cursor:'pointer' }}>
                <span style={{ fontSize:13, fontWeight:800, color:'#22c55e' }}>{compat?.score}%</span>
                <span style={{ fontSize:10, color:'#22c55e' }}>ℹ️</span>
              </button>
              {showCompatTip && (
                <div style={{ position:'absolute', right:0, top:36, background:'#1e1b4b',
                  border:'1px solid rgba(99,102,241,0.3)', borderRadius:12, padding:'10px 14px',
                  zIndex:10, whiteSpace:'nowrap', fontSize:12, color:'#c7d2fe' }}>
                  Shared: {compat?.shared?.join(', ') || 'None yet'}<br/>
                  <span style={{ color:'#6366f1' }}>({compat?.shared?.length || 0} interests in common)</span>
                </div>
              )}
            </div>
          </div>
          <div style={{ fontSize:13, color:'#64748b', marginBottom:4 }}>
            📍 {profile.city} · 💼 {profile.job}
          </div>
          {profile.mutualFriends > 0 && (
            <div style={{ fontSize:12, color:'#6366f1', marginBottom:4 }}>
              👥 {profile.mutualFriends} mutual friend{profile.mutualFriends>1?'s':''}
            </div>
          )}
          <div style={{ fontSize:13, color:'#a855f7', marginBottom:12 }}>{profile.lookingFor}</div>
          <div style={{ fontSize:14, color:'#cbd5e1', lineHeight:1.6, marginBottom:16 }}>{profile.bio}</div>
          {/* Interests */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:24 }}>
            {profile.interests.map(i => (
              <span key={i} style={{
                background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.25)',
                borderRadius:20, padding:'4px 12px', fontSize:12, color:'#a5b4fc',
              }}>#{i}</span>
            ))}
          </div>
          {/* Actions */}
          <div style={{ display:'flex', gap:12 }}>
            <button onClick={onPass}
              style={{ flex:1, padding:'14px', borderRadius:16, border:'1px solid #ef4444',
                background:'transparent', color:'#ef4444', fontSize:16, fontWeight:700, cursor:'pointer', minHeight:44 }}>
              ✕ Pass
            </button>
            <button onClick={onLike}
              style={{ flex:1, padding:'14px', borderRadius:16, border:'none',
                background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'white',
                fontSize:16, fontWeight:800, cursor:'pointer', minHeight:44 }}>
              💚 Like
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DATING PREFERENCES SHEET (MISSING-05 + BUG-05)
// ─────────────────────────────────────────────────────────────────────────────
function DatingPreferencesSheet({ prefs, onChange, onClose }) {
  const [local, setLocal] = useState({ ...prefs });
  const up = (k, v) => setLocal(p => ({ ...p, [k]: v }));

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:800, background:'rgba(0,0,0,0.75)',
      display:'flex', alignItems:'flex-end',
    }} onClick={onClose}>
      <div style={{
        background:'#0f0c29', borderRadius:'24px 24px 0 0', width:'100%',
        maxWidth:480, margin:'0 auto', maxHeight:'88vh', overflowY:'auto',
        paddingBottom:32,
        border:'1px solid rgba(99,102,241,0.25)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ width:40, height:4, borderRadius:2, background:'rgba(255,255,255,0.18)', margin:'12px auto' }} />
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'4px 20px 16px' }}>
          <span style={{ fontSize:18, fontWeight:800, color:'#f1f5f9' }}>⚙️ Dating Preferences</span>
          <button onClick={() => { onChange(local); onClose(); }}
            style={{ padding:'6px 16px', borderRadius:12, background:'#6366f1',
              border:'none', color:'white', fontWeight:700, fontSize:13, cursor:'pointer' }}>
            Save
          </button>
        </div>

        {/* Age Range */}
        <div style={{ padding:'0 20px 16px' }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#94a3b8', marginBottom:8 }}>
            AGE RANGE &nbsp;
            <span style={{ color:'#f1f5f9' }}>{local.ageMin} – {local.ageMax}</span>
          </div>
          <div style={{ display:'flex', gap:12 }}>
            <div style={{ flex:1 }}>
              <label style={{ fontSize:11, color:'#475569', display:'block', marginBottom:4 }}>Min</label>
              <input type="range" min={18} max={local.ageMax} value={local.ageMin}
                onChange={e => up('ageMin', parseInt(e.target.value))}
                style={{ width:'100%', accentColor:'#6366f1' }} />
            </div>
            <div style={{ flex:1 }}>
              <label style={{ fontSize:11, color:'#475569', display:'block', marginBottom:4 }}>Max</label>
              <input type="range" min={local.ageMin} max={80} value={local.ageMax}
                onChange={e => up('ageMax', parseInt(e.target.value))}
                style={{ width:'100%', accentColor:'#6366f1' }} />
            </div>
          </div>
        </div>

        {/* Distance */}
        <div style={{ padding:'0 20px 16px' }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#94a3b8', marginBottom:8 }}>
            DISTANCE &nbsp;<span style={{ color:'#f1f5f9' }}>{local.fuzzLocation ? '~' : ''}{local.distance} mi</span>
          </div>
          <input type="range" min={1} max={100} value={local.distance}
            onChange={e => up('distance', parseInt(e.target.value))}
            style={{ width:'100%', accentColor:'#6366f1' }} />
        </div>

        {/* Gender preference */}
        <div style={{ padding:'0 20px 16px' }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#94a3b8', marginBottom:8 }}>SHOW ME</div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {['Women','Men','Nonbinary','Everyone'].map(g => (
              <button key={g} onClick={() => up('showGender', g)}
                style={{
                  padding:'8px 16px', borderRadius:20, fontSize:13, fontWeight:600,
                  cursor:'pointer', minHeight:40,
                  background: local.showGender===g ? '#6366f1' : 'rgba(255,255,255,0.06)',
                  border: local.showGender===g ? 'none' : '1px solid rgba(255,255,255,0.12)',
                  color: local.showGender===g ? 'white' : '#94a3b8',
                }}>
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Looking For */}
        <div style={{ padding:'0 20px 16px' }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#94a3b8', marginBottom:8 }}>LOOKING FOR</div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {['Something serious 💍','Casual dating ☕','Open to anything ✨','Friendship 🤝'].map(opt => (
              <button key={opt} onClick={() => up('lookingFor', opt)}
                style={{
                  padding:'8px 14px', borderRadius:20, fontSize:12, fontWeight:600,
                  cursor:'pointer', minHeight:40,
                  background: local.lookingFor===opt ? '#6366f1' : 'rgba(255,255,255,0.06)',
                  border: local.lookingFor===opt ? 'none' : '1px solid rgba(255,255,255,0.12)',
                  color: local.lookingFor===opt ? 'white' : '#94a3b8',
                }}>
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        {[
          { key:'showMe', label:'Show Me in Dating', desc:'Turn off to pause your profile visibility.' },
          { key:'fuzzLocation', label:'Approximate Location Only', desc:'Shows ~distance instead of exact city.' },
        ].map(({ key, label, desc }) => (
          <div key={key} style={{
            display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'12px 20px', borderTop:'1px solid rgba(255,255,255,0.05)',
          }}>
            <div>
              <div style={{ fontSize:14, fontWeight:600, color:'#f1f5f9' }}>{label}</div>
              <div style={{ fontSize:11, color:'#475569', marginTop:2 }}>{desc}</div>
            </div>
            <button
              role="switch"
              aria-checked={local[key]}
              onClick={() => up(key, !local[key])}
              style={{
                width:44, height:24, borderRadius:12, border:'none', cursor:'pointer',
                background: local[key] ? '#22c55e' : 'rgba(255,255,255,0.12)',
                position:'relative', flexShrink:0, transition:'background 0.2s',
              }}>
              <div style={{
                position:'absolute', top:2, left: local[key] ? 22 : 2,
                width:20, height:20, borderRadius:'50%', background:'white',
                transition:'left 0.2s ease', boxShadow:'0 1px 4px rgba(0,0,0,0.3)',
              }} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AGE GATE SCREEN (S-02)
// ─────────────────────────────────────────────────────────────────────────────
function AgeGateScreen({ navigate }) {
  return (
    <div style={{
      minHeight:'100vh', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      background:'linear-gradient(160deg,#0a0a1e,#1a0a2e)',
      padding:24, textAlign:'center',
    }}>
      <div style={{ fontSize:64, marginBottom:20 }}>🔒</div>
      <h1 style={{ fontSize:24, fontWeight:900, color:'#f1f5f9', marginBottom:12 }}>
        Dating is 18+
      </h1>
      <p style={{ fontSize:15, color:'#64748b', maxWidth:280, lineHeight:1.6, marginBottom:32 }}>
        You must be 18 years or older to use the Dating feature. Please update your date of birth
        in your profile settings if you believe this is an error.
      </p>
      <button
        onClick={() => navigate('/profile')}
        style={{
          padding:'14px 32px', borderRadius:16, border:'none',
          background:'linear-gradient(135deg,#6366f1,#8b5cf6)',
          color:'white', fontWeight:800, fontSize:15, cursor:'pointer',
        }}>
        Go to Profile Settings
      </button>
      <button
        onClick={() => navigate(-1)}
        style={{
          marginTop:12, background:'none', border:'none',
          color:'#475569', fontSize:13, cursor:'pointer',
        }}>
        ← Go Back
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BOOST BUTTON & COUNTDOWN (MISSING-16)
// ─────────────────────────────────────────────────────────────────────────────
function useBoost(showToast, userProfile) {
  const BOOST_KEY = `dating_boost_${new Date().toISOString().slice(0,10)}`;
  const BOOST_DURATION = 30 * 60; // 30 minutes in seconds
  const [boostSecsLeft, setBoostSecsLeft] = useState(() => {
    try {
      const saved = localStorage.getItem(BOOST_KEY);
      if (!saved) return 0;
      const { expiresAt } = JSON.parse(saved);
      const left = Math.floor((expiresAt - Date.now()) / 1000);
      return left > 0 ? left : 0;
    } catch { return 0; }
  });
  const [boostUsedToday, setBoostUsedToday] = useState(() => {
    try { return JSON.parse(localStorage.getItem(BOOST_KEY) || '{}').used || false; } catch { return false; }
  });

  useEffect(() => {
    if (boostSecsLeft <= 0) return;
    const t = setInterval(() => {
      setBoostSecsLeft(s => {
        if (s <= 1) { clearInterval(t); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [boostSecsLeft]);

  const fmtTime = (s) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

  const activateBoost = () => {
    const isPremium = userProfile?.premium === true;
    if (!isPremium) {
      showToast('🚀 Boost is a Premium feature — upgrade to supercharge your profile!', 'info');
      return;
    }
    if (boostUsedToday && boostSecsLeft <= 0) {
      showToast('⏰ You already used your daily Boost. Come back tomorrow!', 'warning');
      return;
    }
    const expiresAt = Date.now() + BOOST_DURATION * 1000;
    try { localStorage.setItem(BOOST_KEY, JSON.stringify({ used: true, expiresAt })); } catch {}
    setBoostUsedToday(true);
    setBoostSecsLeft(BOOST_DURATION);
    showToast('🚀 Boost activated! Your profile is 10× more visible for 30 minutes.', 'success');
  };

  return { boostSecsLeft, boostUsedToday, activateBoost, fmtTime };
}


// ─────────────────────────────────────────────────────────────────────────────
// WHO LIKED YOU PANEL (MISSING-18) — Premium gate with blurred avatar grid
// ─────────────────────────────────────────────────────────────────────────────
const WHO_LIKED_AVATARS = [
  { emoji:'🌸', color:'#7c3aed', name:'Emma' },
  { emoji:'🔥', color:'#db2777', name:'Mia' },
  { emoji:'⚡', color:'#0891b2', name:'Zoe' },
  { emoji:'💫', color:'#d97706', name:'Lily' },
  { emoji:'🌙', color:'#16a34a', name:'Ava' },
  { emoji:'❤️', color:'#ef4444', name:'Ruby' },
  { emoji:'🎯', color:'#8b5cf6', name:'Jade' },
  { emoji:'✨', color:'#f59e0b', name:'Nova' },
];

function WhoLikedYouPanel({ isPremium, navigate }) {
  const [expanded, setExpanded] = useState(false);
  const count = WHO_LIKED_AVATARS.length;
  const shown = expanded ? WHO_LIKED_AVATARS : WHO_LIKED_AVATARS.slice(0, 5);
  return (
    <div style={{
      margin:'0 16px 16px', borderRadius:18,
      background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.2)',
      overflow:'hidden',
    }}>
      {/* Header row */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px 8px' }}>
        <span style={{ fontSize:13, fontWeight:700, color:'#f1f5f9' }}>
          👀 <span style={{ color:'#6366f1' }}>{count} people</span> liked you
        </span>
        {isPremium ? (
          <span style={{ fontSize:11, color:'#22c55e', fontWeight:700 }}>✓ Premium</span>
        ) : (
          <button onClick={() => navigate('/premium')}
            style={{ fontSize:11, padding:'4px 12px', borderRadius:12, minHeight:28,
              background:'linear-gradient(135deg,#6366f1,#8b5cf6)',
              border:'none', color:'white', fontWeight:700, cursor:'pointer' }}>
            Unlock ⭐
          </button>
        )}
      </div>
      {/* Blurred avatar grid */}
      <div style={{ display:'flex', gap:8, padding:'4px 14px 10px', flexWrap:'wrap', alignItems:'center' }}>
        {shown.map((a, i) => (
          <div key={i} style={{ position:'relative', width:52, height:52 }}>
            <div style={{
              width:52, height:52, borderRadius:'50%',
              background:`linear-gradient(135deg,${a.color},#0a0a2e)`,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:22, border:'2px solid rgba(99,102,241,0.3)',
              filter: isPremium ? 'none' : 'blur(7px)',
              transition:'filter 0.3s',
            }}>{a.emoji}</div>
            {!isPremium && (
              <div style={{
                position:'absolute', inset:0, display:'flex',
                alignItems:'center', justifyContent:'center', borderRadius:'50%',
              }}>
                <span style={{ fontSize:18 }}>🔒</span>
              </div>
            )}
          </div>
        ))}
        {!expanded && count > 5 && (
          <button onClick={() => setExpanded(true)}
            style={{ width:52, height:52, borderRadius:'50%', cursor:'pointer', minHeight:44,
              background:'rgba(99,102,241,0.15)', border:'2px solid rgba(99,102,241,0.3)',
              color:'#a5b4fc', fontSize:13, fontWeight:800 }}>
            +{count - 5}
          </button>
        )}
      </div>
      {/* Non-premium CTA */}
      {!isPremium && (
        <div style={{ textAlign:'center', padding:'0 14px 12px', fontSize:12, color:'#64748b' }}>
          Upgrade to Premium to see who liked you and match instantly 💜
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VIDEO INTRO MODAL (MISSING-19) — Profile video preview
// ─────────────────────────────────────────────────────────────────────────────
function VideoIntroModal({ profile, onClose }) {
  const [playing, setPlaying] = useState(false);
  return (
    <div style={{
      position:'fixed', inset:0, zIndex:950, background:'rgba(0,0,0,0.92)',
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
    }} onClick={onClose}>
      <div style={{
        width:'100%', maxWidth:400, borderRadius:24, overflow:'hidden',
        background:'#0f0c29', border:'1px solid rgba(99,102,241,0.3)',
        margin:'0 20px',
      }} onClick={e => e.stopPropagation()}>
        {/* Video area — uses profile.videoIntroUrl in production */}
        <div style={{
          width:'100%', height:320, position:'relative',
          background:`linear-gradient(160deg,${profile.color},#0a0a2e)`,
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
          gap:12,
        }}>
          <div style={{ fontSize:72 }}>{profile.emoji}</div>
          <button onClick={() => setPlaying(p => !p)}
            style={{ background:'rgba(0,0,0,0.65)', borderRadius:50, padding:'10px 24px',
              border:'2px solid rgba(255,255,255,0.3)', cursor:'pointer', minHeight:44,
              display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:22 }}>{playing ? '⏸️' : '▶️'}</span>
            <span style={{ color:'white', fontSize:14, fontWeight:700 }}>
              {playing ? 'Pause' : `Play ${profile.name}'s Video`}
            </span>
          </button>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.45)' }}>
            {profile.videoDuration || '0:28'} intro
          </div>
          {/* Play progress bar (visual) */}
          {playing && (
            <div style={{ position:'absolute', bottom:0, left:0, right:0, height:3,
              background:'rgba(255,255,255,0.12)' }}>
              <div style={{ width:'35%', height:'100%',
                background:'linear-gradient(90deg,#6366f1,#22c55e)',
                animation:'shimmer 3s linear infinite' }} />
            </div>
          )}
          {/* Close btn */}
          <button onClick={onClose} style={{ position:'absolute', top:12, right:12,
            width:32, height:32, borderRadius:'50%', background:'rgba(0,0,0,0.6)',
            border:'none', color:'white', fontSize:16, cursor:'pointer', minHeight:44, minWidth:44,
            display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
        </div>
        <div style={{ padding:'16px 20px 20px' }}>
          <div style={{ fontWeight:800, color:'#f1f5f9', fontSize:16, marginBottom:2 }}>
            {profile.name}, {profile.age}
          </div>
          <div style={{ fontSize:13, color:'#64748b', marginBottom:14 }}>
            {profile.city} · {profile.job}
          </div>
          <button onClick={onClose}
            style={{ width:'100%', padding:'12px', borderRadius:14, border:'none', minHeight:44,
              background:'rgba(255,255,255,0.07)', color:'#94a3b8',
              fontSize:14, fontWeight:600, cursor:'pointer' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN DATING PAGE
// ─────────────────────────────────────────────────────────────────────────────
const CARD_STYLE_BASE = {
  position:'absolute', inset:0, borderRadius:24, overflow:'hidden',
  cursor:'grab', touchAction:'none', userSelect:'none',
};

export default function DatingPage() {
  const navigate       = useNavigate();
  const showToast      = useAppStore(s => s.showToast);
  const userProfile    = useAppStore(s => s.userProfile);
  const setDatingState = useAppStore(s => s.setDatingState);
  const incMatches     = useAppStore(s => s.incrementDatingMatches);

  // ── S-02: Age gate check ──────────────────────────────────────────────────
  if (userProfile && isUnder18(userProfile.dateOfBirth)) {
    return <AgeGateScreen navigate={navigate} />;
  }

  return <DatingPageInner
    navigate={navigate} showToast={showToast}
    userProfile={userProfile} setDatingState={setDatingState} incMatches={incMatches}
  />;
}

function DatingPageInner({ navigate, showToast, userProfile, setDatingState, incMatches }) {
  // ── State ─────────────────────────────────────────────────────────────────
  const [profiles]       = useState(BASE_PROFILES);
  const [idx,    setIdx] = useState(0);
  const [history,setHistory] = useState([]);
  const [matches,setMatches] = useState(INITIAL_MATCHES);
  const [matchModal, setMatchModal] = useState(null);   // matched profile
  const [showDateAssist, setShowDateAssist] = useState(false);
  const [matchedCompat,  setMatchedCompat]  = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [filterLoading, setFilterLoading] = useState(false);
  const [prefs, setPrefs] = useState({
    ageMin:18, ageMax:45, distance:25, showGender:'Everyone',
    lookingFor:'', showMe:true, fuzzLocation:false,
  });
  const [prefsOpen,   setPrefsOpen]   = useState(false);
  const [detailOpen,  setDetailOpen]  = useState(false);
  const [reportOpen,  setReportOpen]  = useState(false);
  const [favorites,   setFavorites]   = useState([]);
  const [flyDir,      setFlyDir]      = useState(null);   // DESIGN-11: 'right'|'left'|'up'|null
  const [videoProfile,setVideoProfile] = useState(null);  // MISSING-19: video modal target
  const [showPushPrompt, setShowPushPrompt] = useState(false);
  const [pushPromptShown, setPushPromptShown] = useState(false);
  const [compatTip,   setCompatTip]   = useState(false);
  const [photoIdx,    setPhotoIdx]    = useState(0);
  const [swipeCount,  setSwipeCount]  = useState(getDailySwipeCount);
  const [superCount,  setSuperCount]  = useState(getDailySuperCount);
  const DAILY_LIMIT = 100;
  const SUPER_LIMIT = 3;

  // ── BUG-06 FIX: User-specific prefs persistence (Firestore-ready) ─────────
  // Prefs are keyed to userProfile.uid so each user gets their own saved prefs.
  // TODO: Replace localStorage with Firestore: doc(db,'users',uid,'datingPrefs','prefs')
  const PREFS_KEY = `dating_prefs_${userProfile?.uid || 'anon'}`;
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PREFS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setPrefs(p => ({ ...p, ...parsed }));
      }
    } catch {}
  }, [PREFS_KEY]); // eslint-disable-line

  useEffect(() => {
    try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch {}
  }, [prefs, PREFS_KEY]); // eslint-disable-line

  // ── Boost hook (MISSING-16) ───────────────────────────────────────────────
  const { boostSecsLeft, activateBoost, fmtTime } = useBoost(showToast, userProfile);

  // ── Drag state ────────────────────────────────────────────────────────────
  const [dragX,   setDragX]   = useState(0);
  const [dragY,   setDragY]   = useState(0);
  const [dragging,setDragging]= useState(false);
  const startXRef    = useRef(0);
  const startYRef    = useRef(0);
  const startedRef   = useRef(false);
  const isAnimating  = useRef(false);
  const cardRef      = useRef(null);

  const userInterests = useMemo(() =>
    userProfile?.interests || ['Art','Coffee','Music','Travel','Photography'],
    [userProfile]
  );

  // ── P-01 FIX: deterministic compat per profile set, no random jitter ──────
  const profilesWithCompat = useMemo(() =>
    profiles.map(p => ({ ...p, compat: computeCompat(p, userInterests, prefs.fuzzLocation) })),
    [profiles, userInterests, prefs.fuzzLocation]
  );

  // ── Filter logic ──────────────────────────────────────────────────────────
  const filteredProfiles = useMemo(() => {
    let list = profilesWithCompat.filter(p => {
      if (p.age < prefs.ageMin || p.age > prefs.ageMax) return false;
      if (p.distance > prefs.distance) return false;
      return true;
    });
    switch (activeFilter) {
      case 'Nearby':    return list.filter(p => p.distance <= 5);
      case 'Online':    return list.filter(p => p.online);
      case 'Verified':  return list.filter(p => p.verified);
      case 'Serious':   return list.filter(p => p.lookingForKey === 'serious');
      case 'Casual':    return list.filter(p => p.lookingForKey === 'casual');
      case 'Age Range': return list; // age already filtered above
      case 'Looking For':
        if (!prefs.lookingFor) return list;
        return list.filter(p => p.lookingFor.toLowerCase().includes(
          prefs.lookingFor.split(' ')[0].toLowerCase()
        ));
      default: return list;
    }
  }, [profilesWithCompat, activeFilter, prefs]);

  const current = filteredProfiles[idx];
  const next    = filteredProfiles[idx + 1];

  // ── BUG-07 FIX: Mouse events on window ───────────────────────────────────
  useEffect(() => {
    const onMove = (e) => {
      if (!startedRef.current) return;
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      setDragX(cx - startXRef.current);
      setDragY(cy - startYRef.current);
      setDragging(true);
    };
    const onUp = (e) => {
      if (!startedRef.current) return;
      startedRef.current = false;
      const cx = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
      const endX = cx - startXRef.current;
      const endY = (e.changedTouches ? e.changedTouches[0].clientY : e.clientY) - startYRef.current;
      if (Math.abs(endX) < 5 && Math.abs(endY) < 5 && !dragging) {
        setDetailOpen(true);
      } else if (endX > 80 && !isAnimating.current) {
        handleLike();
      } else if (endX < -80 && !isAnimating.current) {
        handlePass();
      }
      setDragX(0); setDragY(0); setDragging(false);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
    window.addEventListener('touchmove', onMove, { passive:false });
    window.addEventListener('touchend',  onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend',  onUp);
    };
  }, [dragging, idx]); // eslint-disable-line

  const onCardDown = (e) => {
    if (isAnimating.current) return;
    startXRef.current = e.touches ? e.touches[0].clientX : e.clientX;
    startYRef.current = e.touches ? e.touches[0].clientY : e.clientY;
    startedRef.current = true;
    setDragging(false);
  };

  // ── Advance (DESIGN-11: fly-off aware) ────────────────────────────────────
  const advance = useCallback((dir) => {
    if (dir) {
      // Trigger fly-off animation, then advance after 300ms
      setFlyDir(dir);
      setTimeout(() => {
        setFlyDir(null);
        setHistory(h => [...h, idx]);
        setIdx(i => i + 1);
        setPhotoIdx(0);
        setDragX(0); setDragY(0);
        isAnimating.current = false;
      }, 300);
    } else {
      setHistory(h => [...h, idx]);
      setIdx(i => i + 1);
      setPhotoIdx(0);
      setDragX(0); setDragY(0);
      isAnimating.current = false;
    }
  }, [idx]);

  // ── Handle Like (DESIGN-10 haptic, DESIGN-11 fly-off, S-04 noted) ─────────
  const handleLike = useCallback(() => {
    if (!current || isAnimating.current) return;
    if (swipeCount >= DAILY_LIMIT) {
      showToast('💔 Daily limit reached (100 Lynks). Come back tomorrow!', 'warning');
      return;
    }
    isAnimating.current = true;
    // DESIGN-10: Haptic feedback — double pulse for Like
    try { navigator.vibrate([50, 30, 80]); } catch {}
    const newCount = swipeCount + 1;
    setSwipeCount(newCount); saveDailySwipeCount(newCount);
    // S-04 NOTE: Match determination is currently client-side (demo only).
    // TODO: Replace with server-side /api/dating/like endpoint that returns isMatch.
    const isMatch = current.id % 3 === 0 || Math.random() > 0.7;
    if (isMatch) {
      const compatData = current.compat;
      const newMatch = { id: current.id, name: current.name, emoji: current.emoji, color: current.color };
      setMatches(prev => [newMatch, ...prev]);
      setMatchModal(newMatch);
      setMatchedCompat(compatData);
      incMatches();
      setDatingState({ matchCount: matches.length + 1 });
      // Match haptic: celebration pattern
      try { navigator.vibrate([100, 50, 100, 50, 200]); } catch {}
    } else {
      showToast(`💚 You liked ${current.name}!`, 'success');
    }
    advance('right'); // DESIGN-11: fly card off to the right
  }, [current, swipeCount, matches.length, advance, incMatches, setDatingState, showToast]);

  // ── Handle Pass (DESIGN-10 haptic, DESIGN-11 fly-off) ─────────────────────
  const handlePass = useCallback(() => {
    if (!current || isAnimating.current) return;
    isAnimating.current = true;
    // DESIGN-10: Short single buzz for Pass
    try { navigator.vibrate(25); } catch {}
    showToast(`👋 Passed on ${current.name}`, 'info');
    advance('left'); // DESIGN-11: fly card off to the left
  }, [current, advance, showToast]);

  // ── Handle Super Like (DESIGN-10 haptic, DESIGN-11 fly-off up) ───────────
  const handleSuperLike = useCallback(() => {
    if (!current || isAnimating.current) return;
    if (superCount >= SUPER_LIMIT) {
      showToast('⭐ Out of Super Likes! Go Premium for unlimited.', 'warning');
      return;
    }
    isAnimating.current = true;
    // DESIGN-10: Triple pulse for Super Like — more exciting than regular
    try { navigator.vibrate([50, 20, 50, 20, 100]); } catch {}
    const newSuper = superCount + 1;
    setSuperCount(newSuper); saveDailySuperCount(newSuper);
    showToast(`⭐ Super Like sent to ${current.name}!`, 'success');
    advance('up'); // DESIGN-11: fly card off upward for Super Like
  }, [current, superCount, advance, showToast]);

  // ── Rewind ────────────────────────────────────────────────────────────────
  const handleRewind = useCallback(() => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    setIdx(prev);
    setPhotoIdx(0);
    showToast('↩️ Rewound to previous profile', 'info');
  }, [history, showToast]);

  // ── Toggle favorite ───────────────────────────────────────────────────────
  const toggleFavorite = (profileId) => {
    setFavorites(prev => {
      const isFav = prev.includes(profileId);
      showToast(isFav ? '💔 Removed from favorites' : '♥ Added to favorites!', isFav ? 'info' : 'success');
      return isFav ? prev.filter(id => id !== profileId) : [...prev, profileId];
    });
  };

  // ── Filter change with shimmer ─────────────────────────────────────────────
  const handleFilterChange = (f) => {
    if (f === activeFilter) return;
    setFilterLoading(true);
    setTimeout(() => {
      setActiveFilter(f); setIdx(0); setFilterLoading(false);
    }, 280);
  };

  // ── Match modal dismiss → trigger Date Assistant (MISSING-15) ─────────────
  const dismissMatch = (goMessage) => {
    setMatchModal(null);
    if (!pushPromptShown) {
      setPushPromptShown(true);
      setTimeout(() => setShowPushPrompt(true), 600);
    }
    if (goMessage) {
      navigate('/messages');
    } else {
      // Show Date Assistant after "Keep Swiping"
      setShowDateAssist(true);
    }
  };

  // ── Glow color on drag ────────────────────────────────────────────────────
  const glowOpacity = Math.min(Math.abs(dragX) / 120, 0.85);
  const glowColor = dragX > 0
    ? `rgba(34,197,94,${glowOpacity})`
    : dragX < 0
      ? `rgba(239,68,68,${glowOpacity})`
      : 'transparent';

  const swipesLeft = DAILY_LIMIT - swipeCount;
  const supersLeft = SUPER_LIMIT - superCount;
  const isFav = current ? favorites.includes(current.id) : false;

  // ── Card rotation ─────────────────────────────────────────────────────────
  const rotate = (dragX / 20).toFixed(2);
  const photos = current ? (PLACEHOLDER_PHOTOS[current.id] || []) : [];

  return (
    <div style={{
      minHeight:'100vh',
      background:'linear-gradient(160deg,#0a0a18 0%,#12091e 60%,#0a0a18 100%)',
      paddingBottom:120, fontFamily:'system-ui,sans-serif',
      color:'#f1f5f9',
    }}>
      {/* ── Injected keyframes ── */}
      <style>{`
        @keyframes confettiFall  { from{transform:translateY(0) rotate(0deg);opacity:1} to{transform:translateY(110vh) rotate(720deg);opacity:0} }
        @keyframes heartPulse    { from{transform:scale(1)} to{transform:scale(1.15)} }
        @keyframes shimmer       { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        @keyframes fadeIn        { from{opacity:0;transform:translateX(-50%) translateY(-4px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        @keyframes slideDown     { from{opacity:0;transform:translateX(-50%) translateY(-12px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        @keyframes cardFlyRight  { to{transform:translateX(130vw) rotate(30deg);opacity:0} }
        @keyframes cardFlyLeft   { to{transform:translateX(-130vw) rotate(-30deg);opacity:0} }
        @keyframes cardFlyUp     { to{transform:translateY(-130vh) scale(0.4) rotate(10deg);opacity:0} }
        @media (prefers-reduced-motion:reduce) {
          *,*::before,*::after { animation:none!important; transition:none!important; }
        }
      `}</style>

      {/* ── A-09: Skip-link for keyboard users ── */}
      <a href="#card-area"
        style={{
          position:'absolute', top:-40, left:16, zIndex:9999,
          background:'#6366f1', color:'white', padding:'6px 14px',
          borderRadius:8, fontWeight:700, fontSize:13, textDecoration:'none',
          transition:'top 0.2s',
        }}
        onFocus={e => e.target.style.top='8px'}
        onBlur={e  => e.target.style.top='-40px'}>
        Skip to profiles
      </a>

      {/* ── Header ── */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'16px 16px 8px',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:20, fontWeight:900 }}>💕 Dating</span>
          {matches.length > 4 && (
            <span style={{
              background:'#22c55e', borderRadius:20, padding:'2px 8px',
              fontSize:11, fontWeight:800, color:'white',
            }}>
              {matches.length - 4} new
            </span>
          )}
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {/* MISSING-16: Boost button */}
          <button
            onClick={activateBoost}
            aria-label={boostSecsLeft > 0 ? `Boost active: ${fmtTime(boostSecsLeft)} remaining` : 'Activate Boost'}
            style={{
              padding:'6px 12px', borderRadius:20, cursor:'pointer', fontSize:12, fontWeight:700,
              background: boostSecsLeft > 0
                ? 'linear-gradient(135deg,#f59e0b,#ef4444)'
                : 'rgba(245,158,11,0.15)',
              color: boostSecsLeft > 0 ? 'white' : '#f59e0b',
              border: boostSecsLeft > 0 ? 'none' : '1px solid rgba(245,158,11,0.3)',
              display:'flex', alignItems:'center', gap:4, minHeight:32,
            }}>
            🚀 {boostSecsLeft > 0 ? fmtTime(boostSecsLeft) : 'Boost'}
          </button>
          {/* Daily swipe counter */}
          <span style={{
            fontSize:11, fontWeight:700,
            color: swipesLeft < 20 ? '#ef4444' : '#64748b',
          }}>
            {swipesLeft} left
          </span>
          {/* Gear → Dating prefs */}
          <button
            onClick={() => setPrefsOpen(true)}
            aria-label="Dating preferences"
            style={{
              width:34, height:34, borderRadius:'50%', background:'rgba(255,255,255,0.07)',
              border:'1px solid rgba(255,255,255,0.10)', color:'#94a3b8',
              fontSize:16, cursor:'pointer', display:'flex',
              alignItems:'center', justifyContent:'center', minHeight:44, minWidth:44,
            }}>
            ⚙️
          </button>
        </div>
      </div>

      {/* ── Profile completion bar (MISSING-11) ── */}
      {userProfile && !userProfile.bio && (
        <div
          onClick={() => navigate('/profile')}
          role="button" tabIndex={0}
          style={{
            margin:'0 16px 12px', padding:'10px 14px', borderRadius:14,
            background:'rgba(99,102,241,0.10)', border:'1px solid rgba(99,102,241,0.25)',
            cursor:'pointer', display:'flex', alignItems:'center', gap:10,
          }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'#a5b4fc', marginBottom:4 }}>
              Profile 60% complete
            </div>
            <div style={{ height:4, background:'rgba(255,255,255,0.08)', borderRadius:2 }}>
              <div style={{ width:'60%', height:'100%', borderRadius:2,
                background:'linear-gradient(90deg,#6366f1,#22c55e)' }} />
            </div>
          </div>
          <span style={{ fontSize:12, color:'#6366f1', fontWeight:600 }}>Complete →</span>
        </div>
      )}

      {/* ── MISSING-18: Who Liked You — Premium gated with blurred avatars ── */}
      <WhoLikedYouPanel isPremium={userProfile?.premium === true} navigate={navigate} />

      {/* ── Filter bar (BUG-08 fixed: fade + sentinel) ── */}
      <div style={{ position:'relative', marginBottom:16 }}>
        {/* A-09: Skip-link anchor */}
        <div
          role="group"
          aria-label="Profile filters"
          style={{
            display:'flex', gap:8, overflowX:'auto', padding:'0 16px',
            scrollbarWidth:'none', WebkitScrollbar:{ display:'none' },
          }}>
          {FILTER_LABELS.map(f => (
            <button
              key={f}
              role="button"
              aria-label={`Filter: ${f}`}
              aria-pressed={activeFilter === f}
              onClick={() => handleFilterChange(f)}
              style={{
                flexShrink:0, padding:'10px 14px', borderRadius:20, minHeight:44,
                fontWeight:600, fontSize:13, cursor:'pointer', whiteSpace:'nowrap',
                transition:'all 0.18s ease',
                background: activeFilter === f
                  ? 'linear-gradient(135deg,#6366f1,#8b5cf6)'
                  : 'rgba(255,255,255,0.06)',
                color: activeFilter === f ? 'white' : '#94a3b8',
                border: activeFilter === f ? 'none' : '1px solid rgba(255,255,255,0.10)',
                boxShadow: activeFilter === f ? '0 4px 12px rgba(99,102,241,0.4)' : 'none',
              }}>
              {f}
            </button>
          ))}
          {/* BUG-08 FIX: sentinel spacer so last pill never clips */}
          <div style={{ flexShrink:0, width:16 }} />
        </div>
        {/* Right fade gradient */}
        <div style={{
          position:'absolute', right:0, top:0, bottom:0, width:48, pointerEvents:'none',
          background:'linear-gradient(to left, #0a0a18, transparent)',
        }} />
      </div>

      {/* ── Card area ── */}
      <div id="card-area" style={{ padding:'0 16px', marginBottom:16 }}>
        <div style={{ position:'relative', height:480 }}>
          {filterLoading ? (
            /* BUG-10 FIX: shimmer skeleton */
            <div style={{
              position:'absolute', inset:0, borderRadius:24,
              background:'linear-gradient(90deg,#1e1b4b 25%,#2d2a6e 50%,#1e1b4b 75%)',
              backgroundSize:'400px 100%',
              animation:'shimmer 1.2s ease-in-out infinite',
            }} />
          ) : !current ? (
            <div style={{
              position:'absolute', inset:0, display:'flex', flexDirection:'column',
              alignItems:'center', justifyContent:'center', gap:12, borderRadius:24,
              background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)',
            }}>
              <span style={{ fontSize:48 }}>🎉</span>
              <div style={{ fontWeight:800, fontSize:18, color:'#f1f5f9' }}>You've seen everyone!</div>
              <div style={{ fontSize:13, color:'#64748b', textAlign:'center', maxWidth:200 }}>
                Check back later or adjust your filters to see more profiles.
              </div>
              <button onClick={() => { setIdx(0); setActiveFilter('All'); }}
                style={{ padding:'12px 24px', borderRadius:16, border:'none', cursor:'pointer',
                  background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'white', fontWeight:700, fontSize:14 }}>
                🔄 Start Over
              </button>
            </div>
          ) : (
            <>
              {/* DESIGN-02: next card behind */}
              {next && (
                <div style={{
                  ...CARD_STYLE_BASE, zIndex:0,
                  transform:'scale(0.95) translateY(10px)',
                  opacity:0.6, filter:'blur(1px)',
                  background:`linear-gradient(135deg,${next.color || '#1a1060'},#0a0a2e)`,
                }}>
                  <div style={{ width:'100%', height:'100%', display:'flex',
                    alignItems:'center', justifyContent:'center', fontSize:60 }}>
                    {next.emoji}
                  </div>
                </div>
              )}

              {/* Current card */}
              <div
                ref={cardRef}
                role="button"
                tabIndex={0}
                aria-label={`${current.name}'s profile card. Drag right to like, left to pass. Press Enter to view full profile.`}
                onKeyDown={e => { if (e.key==='Enter') setDetailOpen(true); if (e.key==='ArrowRight') handleLike(); if (e.key==='ArrowLeft') handlePass(); }}
                onMouseDown={onCardDown}
                onTouchStart={onCardDown}
                style={{
                  ...CARD_STYLE_BASE, zIndex:1,
                  transform:`translateX(${dragX}px) translateY(${dragY}px) rotate(${rotate}deg)`,
                  transition: dragging ? 'none' : 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
                  boxShadow:`0 12px 40px rgba(0,0,0,0.6), 0 0 40px ${glowColor}`,
                  animation: flyDir === 'right' ? 'cardFlyRight 0.3s ease-in forwards'
                    : flyDir === 'left' ? 'cardFlyLeft 0.3s ease-in forwards'
                    : flyDir === 'up' ? 'cardFlyUp 0.3s ease-in forwards' : 'none',
                }}>
                {/* Photo */}
                <div style={{ position:'relative', height:'100%', background:`linear-gradient(160deg,${current.color || '#1a1060'},#0a0a2e)` }}>
                  {photos.length > 0 ? (
                    <img src={photos[photoIdx]} alt={`${current.name}`}
                      style={{ width:'100%', height:'100%', objectFit:'cover' }}
                      onError={e => { e.target.style.display='none'; }} />
                  ) : (
                    <div
                      aria-label={`${current.name} avatar`}
                      style={{ width:'100%', height:'100%', display:'flex',
                        alignItems:'center', justifyContent:'center', fontSize:100 }}>
                      {current.emoji}
                    </div>
                  )}

                  {/* Photo tap zones + dots (MISSING-09) */}
                  {photos.length > 1 && <>
                    <div onClick={() => setPhotoIdx(i => Math.max(0,i-1))}
                      style={{ position:'absolute', left:0, top:0, bottom:0, width:'33%', cursor:'pointer', zIndex:2 }} />
                    <div onClick={() => setPhotoIdx(i => Math.min(photos.length-1,i+1))}
                      style={{ position:'absolute', right:0, top:0, bottom:0, width:'33%', cursor:'pointer', zIndex:2 }} />
                    <div style={{ position:'absolute', top:10, left:0, right:0, display:'flex', justifyContent:'center', gap:4, zIndex:3 }}>
                      {photos.map((_, pi) => (
                        <div key={pi} style={{
                          height:4, borderRadius:2,
                          width: pi===photoIdx ? 18 : 6,
                          background: pi===photoIdx ? '#fff' : 'rgba(255,255,255,0.4)',
                          transition:'width 0.2s ease',
                        }} />
                      ))}
                    </div>
                  </>}

                  {/* Top-right: Favorite + Report */}
                  <div style={{ position:'absolute', top:12, right:12, display:'flex', gap:6, zIndex:5 }}>
                    {/* MISSING-19: Video intro badge */}
                    {current.hasVideo && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setVideoProfile(current); }}
                        aria-label="Watch video intro"
                        style={{ height:28, borderRadius:14, background:'rgba(0,0,0,0.65)',
                          border:'1px solid rgba(255,255,255,0.2)', cursor:'pointer',
                          fontSize:11, color:'white', fontWeight:700, padding:'0 8px',
                          display:'flex', alignItems:'center', gap:4, minHeight:28 }}>
                        🎥 Video
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(current.id); }}
                      aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                      style={{ width:34, height:34, borderRadius:'50%', background:'rgba(0,0,0,0.55)',
                        border:'none', cursor:'pointer', fontSize:16, display:'flex',
                        alignItems:'center', justifyContent:'center', minHeight:44, minWidth:44 }}>
                      {isFav ? '♥' : '♡'}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setReportOpen(true); }}
                      aria-label="Report or block"
                      style={{ width:34, height:34, borderRadius:'50%', background:'rgba(0,0,0,0.55)',
                        border:'none', cursor:'pointer', fontSize:14, color:'white', display:'flex',
                        alignItems:'center', justifyContent:'center', minHeight:44, minWidth:44 }}>
                      ···
                    </button>
                  </div>

                  {/* Like / Nope overlay labels */}
                  {dragX > 40 && (
                    <div style={{ position:'absolute', top:28, left:20, zIndex:5,
                      border:'3px solid #22c55e', borderRadius:8, padding:'4px 10px',
                      color:'#22c55e', fontWeight:900, fontSize:22, transform:'rotate(-15deg)',
                      opacity: Math.min(dragX/80,1) }}>
                      LIKE 💚
                    </div>
                  )}
                  {dragX < -40 && (
                    <div style={{ position:'absolute', top:28, right:20, zIndex:5,
                      border:'3px solid #ef4444', borderRadius:8, padding:'4px 10px',
                      color:'#ef4444', fontWeight:900, fontSize:22, transform:'rotate(15deg)',
                      opacity: Math.min(-dragX/80,1) }}>
                      NOPE ✕
                    </div>
                  )}

                  {/* Card gradient overlay + info */}
                  <div style={{
                    position:'absolute', bottom:0, left:0, right:0,
                    background:'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 55%, transparent 100%)',
                    padding:'60px 16px 16px', zIndex:4,
                  }}>
                    {/* Badges row */}
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:6 }}>
                      {current.online && (
                        <span style={{ fontSize:11, background:'rgba(34,197,94,0.2)',
                          border:'1px solid #22c55e', borderRadius:20, padding:'2px 8px',
                          color:'#22c55e', fontWeight:700 }}>🟢 Online</span>
                      )}
                      {current.verified && (
                        <span style={{ fontSize:11, background:'rgba(99,102,241,0.2)',
                          border:'1px solid #6366f1', borderRadius:20, padding:'2px 8px',
                          color:'#a5b4fc', fontWeight:700 }}>✅ Verified</span>
                      )}
                      {current.mutualFriends > 0 && (
                        <span style={{ fontSize:11, background:'rgba(168,85,247,0.2)',
                          border:'1px solid #a855f7', borderRadius:20, padding:'2px 8px',
                          color:'#d8b4fe', fontWeight:700 }}>
                          👥 {current.mutualFriends} mutual
                        </span>
                      )}
                    </div>
                    {/* Name + age */}
                    <div style={{ fontWeight:900, fontSize:24, color:'#f1f5f9' }}>
                      {current.name}, {current.age}
                    </div>
                    {/* Job + location */}
                    <div style={{ fontSize:13, color:'#cbd5e1', marginTop:2 }}>
                      💼 {current.job} · 📍 {prefs.fuzzLocation ? `~${current.distance}` : current.distance} mi
                    </div>
                    {/* MISSING-14: Relationship intention */}
                    <div style={{ fontSize:12, color:'#a855f7', marginTop:3, fontWeight:600 }}>
                      {current.lookingFor}
                    </div>
                    {/* Compat badge */}
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:8 }}>
                      <div style={{ position:'relative' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); setCompatTip(t=>!t); }}
                          style={{
                            display:'flex', alignItems:'center', gap:4, padding:'3px 10px',
                            background:'rgba(34,197,94,0.15)', borderRadius:20,
                            border:'1px solid rgba(34,197,94,0.35)',
                            color:'#22c55e', fontSize:13, fontWeight:800, cursor:'pointer',
                          }}>
                          {current.compat?.score}% match ℹ️
                        </button>
                        {compatTip && (
                          <div style={{ position:'absolute', bottom:36, left:0,
                            background:'#1e1b4b', border:'1px solid rgba(99,102,241,0.3)',
                            borderRadius:10, padding:'8px 12px', zIndex:10, whiteSpace:'nowrap',
                            fontSize:11, color:'#c7d2fe', boxShadow:'0 4px 16px rgba(0,0,0,0.4)' }}>
                            Shared: {current.compat?.shared?.join(', ') || 'None'}<br/>
                            <span style={{ color:'#6366f1' }}>({current.compat?.shared?.length||0} in common)</span>
                          </div>
                        )}
                      </div>
                      {/* Top interests pills */}
                      {(current.interests || []).slice(0,3).map(i => (
                        <span key={i} style={{ fontSize:11, color:'#94a3b8',
                          background:'rgba(255,255,255,0.07)', borderRadius:20, padding:'2px 8px' }}>
                          {i}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Action buttons (DESIGN-03 + A-02) ── */}
      {current && !filterLoading && (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:16, padding:'0 16px', marginBottom:24 }}>
          {/* Pass */}
          <div style={{ textAlign:'center' }}>
            <button onClick={handlePass} aria-label="Pass"
              style={{ width:60, height:60, borderRadius:'50%', background:'transparent',
                border:'2px solid #ef4444', color:'#ef4444', fontSize:22, cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center', minHeight:44, minWidth:44 }}>
              ✕
            </button>
            <div style={{ fontSize:10, color:'#ef4444', marginTop:4, fontWeight:600 }}>Pass</div>
          </div>
          {/* Rewind */}
          <div style={{ textAlign:'center' }}>
            <button onClick={handleRewind} aria-label="Rewind"
              style={{ width:44, height:44, borderRadius:'50%', background:'transparent',
                border:'2px solid #f59e0b', color:'#f59e0b', fontSize:18, cursor:'pointer',
                opacity: history.length===0 ? 0.35 : 1,
                display:'flex', alignItems:'center', justifyContent:'center', minHeight:44, minWidth:44 }}>
              ↩️
            </button>
            <div style={{ fontSize:10, color:'#f59e0b', marginTop:4, fontWeight:600 }}>Rewind</div>
          </div>
          {/* Super Like */}
          <div style={{ textAlign:'center', position:'relative' }}>
            <button onClick={handleSuperLike} aria-label="Super Like"
              style={{ width:52, height:52, borderRadius:'50%', background:'transparent',
                border:'2px solid #6366f1', color:'#6366f1', fontSize:20, cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center', minHeight:44, minWidth:44 }}>
              ⭐
            </button>
            {/* Super Like counter badge */}
            <div style={{
              position:'absolute', top:-4, right:-4, background:'#6366f1',
              borderRadius:'50%', width:18, height:18, display:'flex',
              alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:800, color:'white',
            }}>
              {supersLeft}
            </div>
            <div style={{ fontSize:10, color:'#6366f1', marginTop:4, fontWeight:600 }}>Super</div>
          </div>
          {/* Like */}
          <div style={{ textAlign:'center' }}>
            <button onClick={handleLike} aria-label="Like"
              style={{ width:72, height:72, borderRadius:'50%',
                background:'linear-gradient(135deg,#22c55e,#16a34a)',
                border:'none', color:'white', fontSize:28, cursor:'pointer',
                boxShadow:'0 8px 24px rgba(34,197,94,0.4)',
                display:'flex', alignItems:'center', justifyContent:'center', minHeight:44, minWidth:44 }}>
              💚
            </button>
            <div style={{ fontSize:11, color:'#22c55e', marginTop:4, fontWeight:700 }}>Like</div>
          </div>
        </div>
      )}

      {/* ── Matches row ── */}
      <div style={{ padding:'0 16px' }}>
        <div style={{ fontSize:15, fontWeight:800, color:'#f1f5f9', marginBottom:12 }}>
          💚 Your Lynks ({matches.length})
        </div>
        <div style={{ display:'flex', gap:12, overflowX:'auto', paddingBottom:4, scrollbarWidth:'none' }}>
          {matches.map(m => (
            <div key={m.id} onClick={() => navigate('/messages')}
              style={{ flexShrink:0, textAlign:'center', cursor:'pointer' }}>
              <div style={{
                width:56, height:56, borderRadius:'50%',
                background:`linear-gradient(135deg,${m.color || '#6366f1'},#0a0a2e)`,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:24, border:'2px solid #22c55e',
                marginBottom:4,
              }}>{m.emoji}</div>
              <div style={{ fontSize:11, color:'#94a3b8', fontWeight:600 }}>{m.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA card (DESIGN-06) ── */}
      <div style={{ margin:'20px 16px 0', padding:'16px', borderRadius:18,
        background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.2)',
        display:'flex', alignItems:'center', gap:12, cursor:'pointer' }}
        onClick={() => navigate('/profile')}>
        <span style={{ fontSize:28 }}>💡</span>
        <div>
          <div style={{ fontWeight:700, color:'#f1f5f9', fontSize:14 }}>Get 3× more Lynks</div>
          <div style={{ fontSize:12, color:'#64748b', marginTop:2 }}>Complete your profile to boost visibility</div>
        </div>
        <span style={{ marginLeft:'auto', fontSize:18, color:'#6366f1' }}>→</span>
      </div>

      {/* ── Push notification prompt (MISSING-10) ── */}
      {showPushPrompt && (
        <div style={{
          position:'fixed', bottom:90, left:16, right:16, zIndex:500,
          background:'rgba(15,12,41,0.97)', border:'1px solid rgba(99,102,241,0.3)',
          borderRadius:20, padding:'16px', backdropFilter:'blur(16px)',
          boxShadow:'0 8px 32px rgba(0,0,0,0.5)',
          animation:'slideDown 0.35s ease',
        }}>
          <div style={{ fontWeight:700, color:'#f1f5f9', fontSize:14, marginBottom:4 }}>
            💚 Don't miss your matches!
          </div>
          <div style={{ fontSize:12, color:'#64748b', marginBottom:12 }}>
            Turn on notifications so you never miss a Lynk.
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={async () => {
              try { await Notification.requestPermission(); } catch {}
              setShowPushPrompt(false);
              showToast('🔔 Notifications enabled!', 'success');
            }} style={{ flex:1, padding:'10px', borderRadius:12, border:'none',
              background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'white',
              fontWeight:700, fontSize:13, cursor:'pointer', minHeight:44 }}>
              Turn On
            </button>
            <button onClick={() => setShowPushPrompt(false)}
              style={{ flex:1, padding:'10px', borderRadius:12,
                background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.10)',
                color:'#94a3b8', fontWeight:600, fontSize:13, cursor:'pointer', minHeight:44 }}>
              Not Now
            </button>
          </div>
        </div>
      )}

      {/* ── Modals & Sheets ── */}
      {matchModal && (
        <MatchModal
          match={matchModal}
          userEmoji={userProfile?.emoji || '😊'}
          onMessage={() => dismissMatch(true)}
          onKeepSwiping={() => dismissMatch(false)}
        />
      )}
      {showDateAssist && matchedCompat && (
        <DateAssistantModal
          match={matchModal}
          sharedInterests={matchedCompat?.shared || []}
          onClose={() => setShowDateAssist(false)}
        />
      )}
      {detailOpen && current && (
        <ProfileDetailSheet
          profile={current}
          compat={current.compat}
          onClose={() => setDetailOpen(false)}
          onLike={() => { setDetailOpen(false); handleLike(); }}
          onPass={() => { setDetailOpen(false); handlePass(); }}
          onReport={() => { setDetailOpen(false); setReportOpen(true); }}
        />
      )}
      {reportOpen && current && (
        <ReportSheet
          profile={current}
          onClose={() => setReportOpen(false)}
          onAction={(action) => {
            if (action === 'block' || action === 'not_interested' || action === 'fake' || action === 'underage') {
              showToast(
                action === 'block' ? `🚫 ${current.name} has been blocked`
                : action === 'underage' ? '🔞 Report submitted — thank you'
                : `🚩 Report submitted. Thank you for keeping Lynkapp safe.`,
                action === 'block' ? 'warning' : 'success'
              );
              advance();
            } else {
              showToast('🚩 Report submitted. Thank you.', 'success');
            }
          }}
          showToast={showToast}
        />
      )}
      {prefsOpen && (
        <DatingPreferencesSheet
          prefs={prefs}
          onChange={(newPrefs) => {
            setPrefs(newPrefs);
            setIdx(0);
            showToast('✅ Preferences saved!', 'success');
          }}
          onClose={() => setPrefsOpen(false)}
        />
      )}
      {/* MISSING-19: Video intro modal */}
      {videoProfile && (
        <VideoIntroModal
          profile={videoProfile}
          onClose={() => setVideoProfile(null)}
        />
      )}
    </div>
  );
}
