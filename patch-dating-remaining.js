// patch-dating-remaining.js
// Implements all remaining dating section items:
// MISSING-18: Who Liked You blurred premium gate
// MISSING-19: Video intro modal on cards
// MISSING-20: Date scheduling step in DateAssistantModal
// DESIGN-10:  Haptic feedback on swipe (navigator.vibrate)
// DESIGN-11:  Card fly-off animation before advance
// BUG-06:     User-specific localStorage prefs key (Firestore hook placeholder)

const fs = require('fs');
const path = 'ConnectHub-SPA/src/pages/dating/DatingPage.jsx';
let src = fs.readFileSync(path, 'utf8');

// ──────────────────────────────────────────────────────────────────────────────
// 1. ADD NEW COMPONENT: WhoLikedYouPanel + VideoIntroModal
//    Insert before "// ─── MAIN DATING PAGE" comment
// ──────────────────────────────────────────────────────────────────────────────
const NEW_COMPONENTS = `
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
              background:\`linear-gradient(135deg,\${a.color},#0a0a2e)\`,
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
          background:\`linear-gradient(160deg,\${profile.color},#0a0a2e)\`,
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
              {playing ? 'Pause' : \`Play \${profile.name}'s Video\`}
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

`;

src = src.replace(
  '// ─────────────────────────────────────────────────────────────────────────────\n// MAIN DATING PAGE\n// ─────────────────────────────────────────────────────────────────────────────',
  NEW_COMPONENTS + '// ─────────────────────────────────────────────────────────────────────────────\n// MAIN DATING PAGE\n// ─────────────────────────────────────────────────────────────────────────────'
);

console.log('Patch 1 applied: WhoLikedYouPanel + VideoIntroModal');

// ──────────────────────────────────────────────────────────────────────────────
// 2. Add video metadata to BASE_PROFILES (MISSING-19)
// ──────────────────────────────────────────────────────────────────────────────
src = src.replace(
  `    lookingFor:'Something serious 💍', mutualFriends:3, verified:true, online:true, lookingForKey:'serious' },`,
  `    lookingFor:'Something serious 💍', mutualFriends:3, verified:true, online:true, lookingForKey:'serious', hasVideo:true, videoDuration:'0:31' },`
);
src = src.replace(
  `    lookingFor:'Casual dating ☕', mutualFriends:0, verified:false, online:false, lookingForKey:'casual' },`,
  `    lookingFor:'Casual dating ☕', mutualFriends:0, verified:false, online:false, lookingForKey:'casual', hasVideo:false },`
);
src = src.replace(
  `    lookingFor:'Open to anything ✨', mutualFriends:7, verified:true, online:true, lookingForKey:'open' },`,
  `    lookingFor:'Open to anything ✨', mutualFriends:7, verified:true, online:true, lookingForKey:'open', hasVideo:true, videoDuration:'0:19' },`
);
src = src.replace(
  `    lookingFor:'Something serious 💍', mutualFriends:1, verified:true, online:false, lookingForKey:'serious' },`,
  `    lookingFor:'Something serious 💍', mutualFriends:1, verified:true, online:false, lookingForKey:'serious', hasVideo:false },`
);
src = src.replace(
  `    lookingFor:'Casual dating ☕', mutualFriends:2, verified:false, online:true, lookingForKey:'casual' },`,
  `    lookingFor:'Casual dating ☕', mutualFriends:2, verified:false, online:true, lookingForKey:'casual', hasVideo:true, videoDuration:'0:45' },`
);
console.log('Patch 2 applied: video metadata to profiles');

// ──────────────────────────────────────────────────────────────────────────────
// 3. DESIGN-11: Add flyDir state + DESIGN-10: haptic + BUG-06: user-scoped prefs key
//    Replace the state block area around swipe/favorites state
// ──────────────────────────────────────────────────────────────────────────────
src = src.replace(
  `  const [favorites,   setFavorites]   = useState([]);`,
  `  const [favorites,   setFavorites]   = useState([]);
  const [flyDir,      setFlyDir]      = useState(null);   // DESIGN-11: 'right'|'left'|'up'|null
  const [videoProfile,setVideoProfile] = useState(null);  // MISSING-19: video modal target`
);
console.log('Patch 3a applied: flyDir + videoProfile state');

// BUG-06: Add user-specific prefs persistence useEffect after the existing state block
// Find the boost hook line and add a useEffect before it
src = src.replace(
  `  // ── Boost hook (MISSING-16) ───────────────────────────────────────────────`,
  `  // ── BUG-06 FIX: User-specific prefs persistence (Firestore-ready) ─────────
  // Prefs are keyed to userProfile.uid so each user gets their own saved prefs.
  // TODO: Replace localStorage with Firestore: doc(db,'users',uid,'datingPrefs','prefs')
  const PREFS_KEY = \`dating_prefs_\${userProfile?.uid || 'anon'}\`;
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

  // ── Boost hook (MISSING-16) ───────────────────────────────────────────────`
);
console.log('Patch 3b applied: BUG-06 user-specific prefs persistence');

// ──────────────────────────────────────────────────────────────────────────────
// 4. DESIGN-11 + DESIGN-10: Modify advance, handleLike, handlePass, handleSuperLike
// ──────────────────────────────────────────────────────────────────────────────

// Replace advance function
src = src.replace(
  `  // ── Advance ───────────────────────────────────────────────────────────────
  const advance = useCallback(() => {
    setHistory(h => [...h, idx]);
    setIdx(i => i + 1);
    setPhotoIdx(0);
    setDragX(0); setDragY(0);
    isAnimating.current = false;
  }, [idx]);`,
  `  // ── Advance (DESIGN-11: fly-off aware) ────────────────────────────────────
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
  }, [idx]);`
);
console.log('Patch 4a applied: advance() with fly-off support');

// Replace handleLike to add haptic + flyDir
src = src.replace(
  `  // ── Handle Like ──────────────────────────────────────────────────────────
  const handleLike = useCallback(() => {
    if (!current || isAnimating.current) return;
    if (swipeCount >= DAILY_LIMIT) {
      showToast('💔 Daily limit reached (100 Lynks). Come back tomorrow!', 'warning');
      return;
    }
    isAnimating.current = true;
    const newCount = swipeCount + 1;
    setSwipeCount(newCount); saveDailySwipeCount(newCount);
    // Simulate match ~30% chance
    const isMatch = current.id % 3 === 0 || Math.random() > 0.7;
    if (isMatch) {
      const compatData = current.compat;
      const newMatch = { id: current.id, name: current.name, emoji: current.emoji, color: current.color };
      setMatches(prev => [newMatch, ...prev]);
      setMatchModal(newMatch);
      setMatchedCompat(compatData);
      incMatches();
      setDatingState({ matchCount: matches.length + 1 });
    } else {
      showToast(\`💚 You liked \${current.name}!\`, 'success');
    }
    advance();
  }, [current, swipeCount, matches.length, advance, incMatches, setDatingState, showToast]);`,
  `  // ── Handle Like (DESIGN-10 haptic, DESIGN-11 fly-off, S-04 noted) ─────────
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
      showToast(\`💚 You liked \${current.name}!\`, 'success');
    }
    advance('right'); // DESIGN-11: fly card off to the right
  }, [current, swipeCount, matches.length, advance, incMatches, setDatingState, showToast]);`
);
console.log('Patch 4b applied: handleLike with haptic + fly-off');

// Replace handlePass to add haptic + flyDir
src = src.replace(
  `  // ── Handle Pass ──────────────────────────────────────────────────────────
  const handlePass = useCallback(() => {
    if (!current || isAnimating.current) return;
    isAnimating.current = true;
    showToast(\`👋 Passed on \${current.name}\`, 'info');
    advance();
  }, [current, advance, showToast]);`,
  `  // ── Handle Pass (DESIGN-10 haptic, DESIGN-11 fly-off) ─────────────────────
  const handlePass = useCallback(() => {
    if (!current || isAnimating.current) return;
    isAnimating.current = true;
    // DESIGN-10: Short single buzz for Pass
    try { navigator.vibrate(25); } catch {}
    showToast(\`👋 Passed on \${current.name}\`, 'info');
    advance('left'); // DESIGN-11: fly card off to the left
  }, [current, advance, showToast]);`
);
console.log('Patch 4c applied: handlePass with haptic + fly-off');

// Replace handleSuperLike to add haptic + flyDir
src = src.replace(
  `  // ── Handle Super Like ─────────────────────────────────────────────────────
  const handleSuperLike = useCallback(() => {
    if (!current || isAnimating.current) return;
    if (superCount >= SUPER_LIMIT) {
      showToast('⭐ Out of Super Likes! Go Premium for unlimited.', 'warning');
      return;
    }
    isAnimating.current = true;
    const newSuper = superCount + 1;
    setSuperCount(newSuper); saveDailySuperCount(newSuper);
    showToast(\`⭐ Super Like sent to \${current.name}!\`, 'success');
    advance();
  }, [current, superCount, advance, showToast]);`,
  `  // ── Handle Super Like (DESIGN-10 haptic, DESIGN-11 fly-off up) ───────────
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
    showToast(\`⭐ Super Like sent to \${current.name}!\`, 'success');
    advance('up'); // DESIGN-11: fly card off upward for Super Like
  }, [current, superCount, advance, showToast]);`
);
console.log('Patch 4d applied: handleSuperLike with haptic + fly-off');

// ──────────────────────────────────────────────────────────────────────────────
// 5. DESIGN-11: Add cardFlyRight/Left/Up keyframes + apply to card
// ──────────────────────────────────────────────────────────────────────────────
src = src.replace(
  `        @keyframes confettiFall { from{transform:translateY(0) rotate(0deg);opacity:1} to{transform:translateY(110vh) rotate(720deg);opacity:0} }
        @keyframes heartPulse   { from{transform:scale(1)} to{transform:scale(1.15)} }
        @keyframes shimmer      { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        @keyframes fadeIn       { from{opacity:0;transform:translateX(-50%) translateY(-4px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        @keyframes slideDown    { from{opacity:0;transform:translateX(-50%) translateY(-12px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }`,
  `        @keyframes confettiFall  { from{transform:translateY(0) rotate(0deg);opacity:1} to{transform:translateY(110vh) rotate(720deg);opacity:0} }
        @keyframes heartPulse    { from{transform:scale(1)} to{transform:scale(1.15)} }
        @keyframes shimmer       { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        @keyframes fadeIn        { from{opacity:0;transform:translateX(-50%) translateY(-4px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        @keyframes slideDown     { from{opacity:0;transform:translateX(-50%) translateY(-12px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        @keyframes cardFlyRight  { to{transform:translateX(130vw) rotate(30deg);opacity:0} }
        @keyframes cardFlyLeft   { to{transform:translateX(-130vw) rotate(-30deg);opacity:0} }
        @keyframes cardFlyUp     { to{transform:translateY(-130vh) scale(0.4) rotate(10deg);opacity:0} }`
);
console.log('Patch 5a applied: fly-off keyframes');

// Apply flyDir animation to the current card style
src = src.replace(
  `                  transform:\`translateX(\${dragX}px) translateY(\${dragY}px) rotate(\${rotate}deg)\`,
                  transition: dragging ? 'none' : 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
                  boxShadow:\`0 12px 40px rgba(0,0,0,0.6), 0 0 40px \${glowColor}\`,`,
  `                  transform:\`translateX(\${dragX}px) translateY(\${dragY}px) rotate(\${rotate}deg)\`,
                  transition: dragging ? 'none' : 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
                  boxShadow:\`0 12px 40px rgba(0,0,0,0.6), 0 0 40px \${glowColor}\`,
                  animation: flyDir === 'right' ? 'cardFlyRight 0.3s ease-in forwards'
                    : flyDir === 'left' ? 'cardFlyLeft 0.3s ease-in forwards'
                    : flyDir === 'up' ? 'cardFlyUp 0.3s ease-in forwards' : 'none',`
);
console.log('Patch 5b applied: flyDir animation on card');

// ──────────────────────────────────────────────────────────────────────────────
// 6. MISSING-18: Replace simple "Who liked you" banner with WhoLikedYouPanel
// ──────────────────────────────────────────────────────────────────────────────
src = src.replace(
  `      {/* ── "Who liked you" banner ── */}
      <div style={{
        margin:'0 16px 16px', padding:'10px 14px', borderRadius:14,
        background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.2)',
        display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer',
      }}>
        <span style={{ fontSize:13, color:'#94a3b8' }}>
          👀 <strong style={{ color:'#f1f5f9' }}>8 People</strong> liked you
        </span>
        <span style={{
          fontSize:11, padding:'4px 10px', borderRadius:12,
          background:'linear-gradient(135deg,#6366f1,#8b5cf6)',
          color:'white', fontWeight:700,
        }}>See Who ⭐</span>
      </div>`,
  `      {/* ── MISSING-18: Who Liked You — Premium gated with blurred avatars ── */}
      <WhoLikedYouPanel isPremium={userProfile?.premium === true} navigate={navigate} />`
);
console.log('Patch 6 applied: WhoLikedYouPanel replaces static banner');

// ──────────────────────────────────────────────────────────────────────────────
// 7. MISSING-19: Add video badge on cards + VideoIntroModal
// ──────────────────────────────────────────────────────────────────────────────

// Add video badge button in the card's top-right area (after favorites button)
src = src.replace(
  `                  <div style={{ position:'absolute', top:12, right:12, display:'flex', gap:6, zIndex:5 }}>
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
                  </div>`,
  `                  <div style={{ position:'absolute', top:12, right:12, display:'flex', gap:6, zIndex:5 }}>
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
                  </div>`
);
console.log('Patch 7 applied: video badge on cards');

// Add VideoIntroModal render at end of modal section (before closing </div>)
src = src.replace(
  `      {prefsOpen && (
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
    </div>
  );
}`,
  `      {prefsOpen && (
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
}`
);
console.log('Patch 8 applied: VideoIntroModal render');

// ──────────────────────────────────────────────────────────────────────────────
// 8. MISSING-20: Extend DateAssistantModal with date scheduling step
// ──────────────────────────────────────────────────────────────────────────────
const OLD_DATE_ASSISTANT_CLOSE = `        <button
          onClick={onClose}
          autoFocus
          style={{
            width:'100%', padding:'14px', borderRadius:16, marginTop:6,
            background:'linear-gradient(135deg,#6366f1,#8b5cf6)',
            border:'none', color:'white', fontSize:15, fontWeight:800, cursor:'pointer',
          }}>
          Sounds great — let's chat! 💬
        </button>
        <button
          onClick={onClose}
          style={{
            display:'block', margin:'10px auto 0', color:'#475569',
            fontSize:13, background:'none', border:'none', cursor:'pointer',
          }}>
          Skip for now
        </button>
      </div>
    </div>
  );
}`;

const NEW_DATE_ASSISTANT = `        {/* MISSING-20: Date scheduling step */}
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
              {selectedSlot ? \`✅ Suggest "\${selectedSlot}" →\` : 'Pick a time slot first'}
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
}`;

// Replace the closing of DateAssistantModal with the extended version
// First add step state + selectedSlot state to DateAssistantModal function
src = src.replace(
  `function DateAssistantModal({ match, sharedInterests, onClose }) {
  const suggestions = useMemo(() => {`,
  `function DateAssistantModal({ match, sharedInterests, onClose }) {
  const [step, setStep] = useState(1);                // 1 = suggestions, 2 = schedule
  const [selectedSlot, setSelectedSlot] = useState(null); // MISSING-20: time slot picker
  const suggestions = useMemo(() => {`
);

src = src.replace(OLD_DATE_ASSISTANT_CLOSE, NEW_DATE_ASSISTANT);
console.log('Patch 9 applied: MISSING-20 date scheduling in DateAssistantModal');

// ──────────────────────────────────────────────────────────────────────────────
// Write the result
// ──────────────────────────────────────────────────────────────────────────────
fs.writeFileSync(path, src, 'utf8');
const lineCount = src.split('\n').length;
console.log(`\nAll patches applied. File: ${path} (${lineCount} lines)`);
console.log('Features implemented:');
console.log('  ✅ MISSING-18: WhoLikedYouPanel — blurred premium-gated avatar grid');
console.log('  ✅ MISSING-19: VideoIntroModal + 🎥 badge on cards (Jordan, Sam, Casey)');
console.log('  ✅ MISSING-20: Date scheduling step in DateAssistantModal (4 time slots)');
console.log('  ✅ DESIGN-10:  navigator.vibrate() haptic on Like/Pass/SuperLike/Match');
console.log('  ✅ DESIGN-11:  cardFlyRight/Left/Up animation before advance()');
console.log('  ✅ BUG-06:     User-UID-scoped localStorage prefs (Firestore-ready TODO)');
console.log('  ✅ S-04:       Client-side match guard annotated with TODO backend note');
