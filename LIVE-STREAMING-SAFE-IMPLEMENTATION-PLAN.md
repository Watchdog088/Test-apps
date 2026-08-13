# 🔒 Live Streaming — Safe Implementation Plan
**"How to add everything without breaking anything"**

**Prepared by:** Senior App Developer  
**Date:** August 13, 2026  
**Status:** PLANNING ONLY — No code changes made  
**Depends on:**
- `LIVE-STREAMING-GAP-FIX-MASTER-PLAN.md`
- `LIVE-STREAMING-NEW-SCREENS-AND-ADMIN-MONITORING-DESIGN.md`

---

## THE CORE PRINCIPLE: ADDITIVE FIRST, DESTRUCTIVE NEVER

Every change in this plan follows one rule: **always add before you replace, never delete before you've verified the replacement works.** The existing app is in beta with real users. Breaking the feed, chat, auth, or marketplace while fixing live streaming is not acceptable.

---

## PART 1 — PRE-IMPLEMENTATION SAFETY CHECKLIST

Before any developer writes a single line of code, these steps must be completed:

### 1.1 — Create a Git Safety Branch
```
COMMAND (run in ConnectHub-SPA/):
  git checkout -b feature/live-streaming-v2

WHY: All live streaming changes go on this branch only.
     The main branch stays untouched and deployable at all times.
     If anything breaks badly, we run: git checkout main
     and the app is back to its current working state instantly.

BRANCH PROTECTION RULE:
  Nobody merges to main until all 4 sprint test checklists pass.
```

### 1.2 — Snapshot Current State
```
Before touching any file, run the app locally and verify:
  ✓ Login / Signup works (email + Google)
  ✓ Feed loads posts
  ✓ Messages open and send
  ✓ Dating section swipes
  ✓ Marketplace lists products
  ✓ Live page loads (even though streams are stubs)
  ✓ Wallet page opens (even with mock data)
  ✓ Admin dashboard opens

Take screenshots of each. These become your "before" baseline.
If at any point during implementation one of these breaks,
STOP immediately and revert that file before continuing.
```

### 1.3 — Environment Variable Isolation
```
The new env vars (Mux, Stripe) must NOT interfere with existing ones.

CURRENT .env vars (do NOT touch these):
  VITE_FIREBASE_API_KEY
  VITE_FIREBASE_AUTH_DOMAIN
  VITE_FIREBASE_PROJECT_ID
  VITE_FIREBASE_STORAGE_BUCKET
  VITE_ONESIGNAL_APP_ID
  (all existing Giphy, RAWG, Unsplash, etc. keys)

NEW vars to ADD (append to bottom of .env, never replace):
  VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx   ← use TEST key first
  VITE_MUX_ENV_KEY=xxx

BACKEND .env — ADD only, never modify existing lines:
  MUX_TOKEN_ID=xxx
  MUX_TOKEN_SECRET=xxx
  MUX_WEBHOOK_SIGNING_SECRET=xxx
  STRIPE_SECRET_KEY=sk_test_xxx   ← use TEST key first
  STRIPE_WEBHOOK_SECRET=whsec_xxx

RULE: Use Stripe TEST mode and Mux TEST environment during all 4 sprints.
      Only switch to live keys AFTER all tests pass and before final deployment.
```

### 1.4 — Dependency Installation Safety
```
NEW npm packages needed:
  Backend: @mux/mux-node, stripe, qrcode
  Frontend: @stripe/stripe-js, @stripe/react-stripe-js, qrcode

SAFE INSTALL PROCEDURE:
  1. Check current package.json for any version conflicts first
  2. Install with --save-exact to pin exact versions:
     npm install --save-exact @mux/mux-node stripe
  3. Run: npm run build BEFORE writing any new code
     If build fails after install → remove the package and investigate
  4. Run: npm run build AFTER each new file is added
     Keep a passing build at every step

PACKAGES THAT MUST NOT BE UPGRADED (they work now):
  firebase, hls.js, react, react-router-dom, vite
  — Check these are unchanged in package.json after every install
```

---

## PART 2 — SPRINT 1 SAFE IMPLEMENTATION ORDER (Video Pipeline)

### The Problem With Sprint 1
Sprint 1 modifies `livestream-webrtc.js` and `LiveSetupPage.jsx` — these are the most dangerous files to change because `LiveWatchPage.jsx` also imports from `livestream-webrtc.js`. A bad import change breaks the entire live section for all users, including the watch/browse features that currently work.

### Safe Order for Sprint 1

#### Step S1-A: Create New Backend Files FIRST (Zero Risk)
```
START HERE — backend files don't affect frontend at all:

1. Create: ConnectHub-Backend/src/services/mux-service.ts
   This is a brand new file. It doesn't replace anything.
   Nothing imports it yet. Zero risk of breaking anything.

2. Create: ConnectHub-Backend/src/routes/streaming.ts
   Again, brand new file. Register it in server.ts LAST.

3. Test backend in isolation:
   Start the backend locally: npm run dev (in ConnectHub-Backend/)
   Hit the new endpoints with Postman/curl
   Verify existing endpoints (/api/auth, /api/users, etc.) still work
   
4. Only AFTER testing: register streaming routes in server.ts
   HOW TO ADD SAFELY:
   In server.ts, add the new route registration at the bottom
   of the existing route registrations — never in the middle:
   
   // EXISTING (do not touch):
   app.use('/api/auth', authRoutes)
   app.use('/api/users', userRoutes)
   app.use('/api/marketplace', marketplaceRoutes)
   // ... all existing routes unchanged ...
   
   // ADD AT BOTTOM:
   app.use('/api/streaming', streamingRoutes)  // ← new line only
   app.use('/api/wallet', walletRoutes)         // ← new line only
```

#### Step S1-B: Create New Frontend Service (Parallel, Zero Risk)
```
While backend is being built, create whip-publisher.js:

   Create: ConnectHub-SPA/src/services/whip-publisher.js
   This is a new file. Nothing imports it yet. Zero risk.
   
   Do NOT modify livestream-webrtc.js yet.
   The WHIP publisher is self-contained.
```

#### Step S1-C: Update livestream-webrtc.js SAFELY (Highest Risk File)
```
This file is the most dangerous to change. Use this approach:

SAFE REWRITE TECHNIQUE — The "Rename and Replace" method:

Step 1: Rename existing file FIRST (git tracks this):
  git mv livestream-webrtc.js livestream-webrtc-LEGACY.js
  
Step 2: Create new file with the same name:
  Create: livestream-webrtc.js (new Mux implementation)
  
Step 3: In the new file, KEEP THE SAME CLASS NAME AND METHOD SIGNATURES:
  - Class is still: LivestreamWebRTC (same name, imports don't break)
  - Method startStream() still exists (same name)
  - Method destroy() still exists (same name)
  - Method getStats() still exists (same name)
  The INTERNALS change, but the API surface is identical.
  
Step 4: Run build: npm run build
  If build PASSES: the class interface is compatible with all importers
  If build FAILS: check which file broke and why
  
Step 5: If build fails: git revert to livestream-webrtc-LEGACY.js immediately
  git mv livestream-webrtc-LEGACY.js livestream-webrtc.js
  
Step 6: Keep the LEGACY file in the repo as a backup until Sprint 1 is 100% tested.
  Delete it only in the final PR before merging to main.

WHAT NOT TO CHANGE in the method signatures:
  DO NOT change: the parameter names/types that callers use
  DO change: what happens INSIDE startStream(), destroy(), getStats()
```

#### Step S1-D: Update LiveSetupPage.jsx SAFELY
```
LiveSetupPage.jsx currently has a Go Live flow. The safe approach:

1. ADD new state variables at TOP of existing state block
   (never modify existing state variables, just add new ones):
   const [muxStreamId, setMuxStreamId] = useState(null)      // NEW
   const [rtmpUrl, setRtmpUrl] = useState('')                 // NEW  
   const [streamKey, setStreamKey] = useState('')             // NEW
   const [showOBSPanel, setShowOBSPanel] = useState(false)   // NEW
   const [privacy, setPrivacy] = useState('public')           // NEW
   const [facingMode, setFacingMode] = useState('user')      // NEW

2. MODIFY the startStream() function SAFELY:
   BEFORE changing anything, add a feature flag check at the top:
   
   const useMux = import.meta.env.VITE_MUX_ENV_KEY !== undefined
   
   if (!useMux) {
     // EXISTING CODE PATH — runs if MUX not configured
     await livestreamWebRTC.startStream({ streamId: docRef.id })
   } else {
     // NEW CODE PATH — runs only when Mux env vars are set
     const { streamKey, rtmpUrl, playbackUrl, muxStreamId } = 
       await apiClient.post('/api/streaming/create', { title, category, tags, privacy })
     // ... new flow ...
   }
   
   WHY THIS WORKS: If Mux isn't configured yet (env var missing), the old
   code path runs exactly as before. Nothing breaks for existing users.
   Mux only activates when the env var is set.

3. ADD new UI sections BELOW existing UI (never replace existing JSX):
   The OBS credentials panel, privacy selector, camera toggle button
   are all ADDED as new JSX blocks below or alongside existing blocks.
   No existing JSX is deleted until Sprint 1 tests pass.
```

#### Step S1-E: Update LiveWatchPage.jsx SAFELY
```
LiveWatchPage.jsx needs streamUrl → playbackUrl. Safe approach:

NEVER do this:
  BAD: replace stream.streamUrl with stream.playbackUrl everywhere

DO this instead — fallback chain:
  const videoSrc = stream?.playbackUrl || stream?.streamUrl || null
  
This means:
  - If stream has new playbackUrl (Mux streams): uses it ✓
  - If stream has old streamUrl (legacy/test streams): uses it ✓
  - If neither: shows error state ✓
  - Existing test streams with streamUrl continue to work ✓
  
Apply the same fallback pattern EVERYWHERE streamUrl is referenced:
  HLS source: stream.playbackUrl || stream.streamUrl
  VOD source:  stream.vodPlaybackUrl || stream.streamUrl
  Status check: stream.playbackUrl && stream.status === 'active'

ADD new features (theater mode, CC button, @mentions) as ADDITIVE JSX:
  Never wrap existing chat in a replacement — add state and new elements
  alongside existing ones. Existing chat continues to function during
  the transition.
```

#### Step S1-F: Update LiveVODPage.jsx SAFELY
```
Same fallback pattern:
  const vodSrc = stream?.vodPlaybackUrl || stream?.streamUrl || null
  
The page still works for existing VODs stored with streamUrl.
New Mux VODs use vodPlaybackUrl.
```

#### Step S1-G: Firestore Rules — Additive Only
```
The new Firestore fields (muxStreamId, playbackUrl, vodPlaybackUrl)
are ADDITIONS to the streams collection schema.

Firestore is schema-free — adding new fields to new documents
does NOT affect old documents that don't have those fields.

The only rule change needed is the streamKey protection:
  CURRENT rule: allow read: if request.auth != null
  NEW rule: allow read: if request.auth != null 
              && (!('streamKey' in resource.data) 
                  || request.auth.uid == resource.data.uid)

This means:
  Old stream docs (no streamKey field): continue to work for all readers
  New stream docs (has streamKey): only the creator can read it
  Existing security rules for other fields: unchanged
  
SAFE DEPLOYMENT:
  Test new rules in Firebase Rules Simulator FIRST
  Deploy rules to staging Firestore instance (not production)
  Only deploy to production after simulation passes all test cases
```

---

## PART 3 — SPRINT 2 SAFE IMPLEMENTATION ORDER (Monetization)

### The Problem With Sprint 2
WalletPage.jsx currently has hardcoded mock data. If we remove mock data before real data is wired, users see a broken empty wallet. The gift button in LiveWatchPage is currently "working" (visually) — if we add coin balance checks without having the coin purchase flow ready, every gift button will fail.

### Safe Order for Sprint 2

#### Step S2-A: Backend Wallet Service (Zero Risk)
```
Same pattern as Sprint 1:
1. Create stripe-connect-service.ts (new file, zero risk)
2. Create wallet.ts routes (new file, zero risk)
3. Test in isolation with Postman
4. Register routes in server.ts (one new line, additive)
```

#### Step S2-B: Create BuyCoinsPage.jsx (New File, Zero Risk)
```
Creating a brand new file has zero risk.
Add its route in App.jsx LAST (see App.jsx pattern below).
The page exists but isn't linked to from anywhere yet.
No existing page is affected.
```

#### Step S2-C: Create StripeConnectReturnPage.jsx (New File, Zero Risk)
```
Same — brand new file, add route in App.jsx.
```

#### Step S2-D: Update WalletPage.jsx SAFELY — The "Shadow Load" Technique
```
WRONG APPROACH (breaks things):
  Delete MOCK_TXS, call API → if API fails, user sees broken page

RIGHT APPROACH — Keep mock data as the default, make real data optional:

Step 1: Keep the MOCK_TXS array but rename it to DEFAULT_TXS
  const DEFAULT_TXS = [...existing mock data...]

Step 2: Add real data loading alongside mock data:
  const [transactions, setTransactions] = useState(DEFAULT_TXS)  // starts with mock
  const [isLoadingReal, setIsLoadingReal] = useState(false)
  const [balance, setBalance] = useState({ available: 0, pending: 0 })
  
  useEffect(() => {
    const loadRealData = async () => {
      setIsLoadingReal(true)
      try {
        const [balanceData, txData] = await Promise.all([
          apiClient.get('/api/wallet/balance'),
          apiClient.get('/api/wallet/transactions')
        ])
        setBalance(balanceData)
        if (txData.transactions?.length > 0) {
          setTransactions(txData.transactions)  // replace mock with real only if real exists
        }
        // If API returns empty: mock data remains shown → no broken empty state
      } catch (err) {
        // API failed → mock data stays → user still sees something
        console.warn('Wallet: using demo data', err)
      } finally {
        setIsLoadingReal(false)
      }
    }
    loadRealData()
  }, [])

Step 3: Add Stripe Connect section as NEW JSX below existing balance display
  Don't replace any existing UI — add the new "Connect Bank Account" section
  as an additional card below what's already there.

Step 4: The mock data removal and "demo mode" banner:
  When loading real data: show a subtle "Demo Data" badge on mock transactions
  When real data loads: badge disappears, mock replaced with real transactions
  If Stripe not connected: show "Connect to see real balance" placeholder
```

#### Step S2-E: Update LiveWatchPage.jsx Gift Button SAFELY
```
WRONG APPROACH (breaks things):
  Add coin check → all gifts fail until BuyCoinsPage is live

RIGHT APPROACH — Feature flag + graceful degradation:

const coinCheckEnabled = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY !== undefined

const sendGift = async (giftAmount) => {
  if (coinCheckEnabled) {
    // NEW code path: check balance first
    const userDoc = await getDoc(doc(db, 'users', uid))
    const coinBalance = userDoc.data()?.coinBalance || 0
    
    if (coinBalance < giftAmount) {
      showToast('Not enough coins')
      navigate('/wallet/buy-coins')
      return
    }
    // Deduct coins and credit creator...
  } else {
    // EXISTING code path: gift writes directly (current behavior)
    // This is the fallback if Stripe isn't configured
  }
  
  // Common: write gift to streams/{id}/gifts (existing code, unchanged)
  await addDoc(collection(db, 'streams', streamId, 'gifts'), {...})
}

This means:
  Without Stripe env vars: gift button works exactly as before
  With Stripe env vars: coin balance is checked first
```

---

## PART 4 — SPRINT 3 SAFE IMPLEMENTATION ORDER (Auth & Compliance)

### The Problem With Sprint 3
Auth changes are the most dangerous of all. A broken LoginPage means users cannot access the app at all. The DOB field addition to SignupPage must not make existing users' sessions invalid.

### Safe Order for Sprint 3

#### Step S3-A: PhoneAuthPage.jsx (New File, Zero Risk)
```
Create the page first. It doesn't affect Login or Signup at all.
Add its route in App.jsx only. Test it works in isolation.
```

#### Step S3-B: TwoFactorSetupModal.jsx (New File, Zero Risk)
```
Create the component. It's not mounted anywhere yet.
Test it renders correctly in isolation (can create a test page).
```

#### Step S3-C: mfa-service.js (New File, Zero Risk)
```
Create the service. It has no effect until called.
```

#### Step S3-D: Add Apple Sign-In Button SAFELY
```
LoginPage.jsx and SignupPage.jsx changes must be minimal and isolated.

SAFE APPROACH:
1. Create a NEW component: AppleSignInButton.jsx
   This keeps all Apple auth logic OUT of LoginPage
   
2. In LoginPage.jsx, just add ONE line:
   <AppleSignInButton onSuccess={handleSocialSuccess} onError={setError} />
   
   The existing Google Sign-In button is untouched.
   The existing email/password form is untouched.
   
3. Apple button is hidden on non-Apple platforms:
   Render condition: const isIOS = /iPhone|iPad/.test(navigator.userAgent)
   {isIOS && <AppleSignInButton ... />}
   
   This means Android/web users see no change whatsoever.
   Only iOS users see the new button.

4. Test Apple Sign-In on a real iOS device BEFORE merging.
   Do NOT add the Apple button route to Android builds until tested.
```

#### Step S3-E: Add DOB Field to SignupPage.jsx SAFELY
```
The most critical thing: existing users who are already signed in
must NOT be affected by this change.

SAFE APPROACH — DOB is optional in the frontend for now:

Step 1: Add the DOB field to the signup form with required=false initially:
  <input type="date" name="dob" value={form.dob} onChange={handleChange} 
         placeholder="Date of Birth (optional for now)" />

Step 2: Add age validation as a WARNING, not a block:
  if (form.dob) {
    const age = calculateAge(form.dob)
    if (age < 13) {
      return setError('You must be at least 13 years old.')
    }
    // Store DOB in Firestore for users who provide it
  }
  // Users who skip DOB: account creates normally, dob field is null
  // Those users can add DOB later in Profile Settings

Step 3: Once DOB is added for 30+ days and most new users have it,
  change required to true in a SECOND PR.
  Never make it required in the same PR where it's added.

Step 4: Existing users (no DOB in Firestore):
  The monetization gate checks: user.age >= 18 OR user.dob == null
  Null DOB = allow monetization (don't punish existing users)
  This is relaxed for the transition period.
  
Step 5: In ProfileEditPage.jsx, add DOB as an editable field
  so existing users can voluntarily add their DOB.
```

#### Step S3-F: Wire 2FA to AccountSecurityPages.jsx SAFELY
```
The existing toggle in AccountSecurityPages does nothing.
Safe approach: keep the existing toggle but intercept it:

CURRENT (does nothing):
  <Toggle checked={mfaEnabled} onChange={() => setMfaEnabled(v => !v)} />

NEW (opens modal instead):
  <Toggle checked={mfaEnabled} 
          onChange={() => {
            if (!mfaEnabled) {
              setShow2FAModal(true)  // open new modal
            } else {
              handleDisable2FA()      // new disable flow
            }
          }} />
  
  {show2FAModal && <TwoFactorSetupModal onClose={() => setShow2FAModal(false)} 
                                         onSuccess={() => setMfaEnabled(true)} />}

The toggle still looks and feels the same. It just now opens a modal
instead of doing nothing. No breaking change.
```

---

## PART 5 — SPRINT 4 SAFE IMPLEMENTATION ORDER (Feature Completeness)

### Safe Order for Sprint 4

#### Step S4-A: New Pages (Admin Streams Monitor, Admin Payouts) — Zero Risk
```
Create all new pages first:
  AdminStreamsMonitorPage.jsx — new file
  AdminPayoutsPage.jsx — new file
  StreamPrivacyGate.jsx — new component
  admin-monitoring-service.js — new service

None of these affect any existing page until routes are added.
```

#### Step S4-B: Add Privacy Selector to LiveSetupPage.jsx SAFELY
```
Privacy is a new state variable added to the existing form.
It defaults to 'public' — so all existing streams behave exactly
as before (public is the existing implicit behavior).

The privacy selector JSX is added as new JSX below the existing
category/tags section. No existing JSX is modified.

The privacy value is added to the Firestore stream doc:
  { ...existingFields, privacy: privacy || 'public' }
  
Old stream docs without a privacy field → treated as 'public' (safe fallback)
```

#### Step S4-C: Add Camera Toggle to LiveSetupPage.jsx SAFELY
```
The toggle button is new JSX that only appears on mobile:
  {navigator.maxTouchPoints > 0 && <button onClick={switchCamera}>🔄</button>}

The switchCamera() function only runs when clicked.
If the camera API fails (desktop, or permission denied):
  The catch block shows a toast and the stream continues unchanged.
  
The existing camera preview flow is not modified.
The toggle ADDS behavior, it doesn't replace behavior.
```

#### Step S4-D: Add @Mentions to LiveWatchPage.jsx SAFELY
```
@mention parsing is ADDITIVE:

CURRENT message render:
  <span>{msg.text}</span>

NEW message render:
  <span>{parseMessage(msg.text)}</span>

parseMessage() returns:
  - If no @mentions in text: returns the original text string unchanged
  - If @mentions present: returns array of strings + styled spans

SAFE TEST: parseMessage('hello world') === 'hello world'
           parseMessage('@alex hi') === ['', <span>@alex</span>, ' hi']

The function is a pure utility — it cannot throw errors or break the page.
Add a try/catch around the parseMessage call as extra safety:
  try { parseMessage(msg.text) } catch { return msg.text }

The mention autocomplete dropdown is new JSX added ABOVE the chat input.
It's hidden (display:none or null) unless the user types '@'.
Existing chat input is unchanged.
```

#### Step S4-E: Add Reply Threads SAFELY
```
Reply threads require a new Firestore field on message docs.
Firestore schema change safety:

OLD message doc: { uid, text, userName, timestamp }
NEW message doc: { uid, text, userName, timestamp, replyToId?, replyToUser?, replyToText? }

The ? means optional. Old messages without these fields render normally.
New messages with these fields show the reply context.

The "Reply" button appears on message hover/long-press:
  {hoveredMsg === msg.id && <button onClick={() => setReplyingTo(msg)}>↩️</button>}

The replyingTo state and reply context UI are additive.
sendMessage() adds replyToId only IF replyingTo is set.
Existing messages continue to send exactly as before.
```

#### Step S4-F: Add External Moderators SAFELY
```
The moderators[] array is a new field on stream docs.
If a stream doc has no moderators[] field: behavior is unchanged.

The canModerate check adds the moderator permission as an OR:
  CURRENT: const canModerate = stream?.uid === uid
  NEW:     const canModerate = stream?.uid === uid || stream?.moderators?.includes(uid)
  
  The stream?.moderators?. uses optional chaining.
  If moderators field is undefined (all old streams): includes() is never called.
  canModerate still evaluates correctly for all old streams.
```

#### Step S4-G: Add Captions SAFELY
```
The CC button and captionsEnabled state are new and additive.
The CaptionsService is only instantiated when the user clicks CC.

If the browser doesn't support SpeechRecognition API:
  captionsService.start() calls onCaption({ error: 'not_supported' })
  Shows toast: "Captions not supported in your browser"
  setCaptionsEnabled(false)
  
  The stream continues playing normally.
  No error is thrown. No page crash.

The caption overlay div is conditionally rendered:
  {captionsEnabled && captionText && <div>...</div>}
  
If captionsEnabled is false (default): the div is never rendered.
Zero impact on the existing player UI.
```

#### Step S4-H: Update Cloud Function SAFELY
```
functions/index.js already has existing Cloud Functions.
Adding a new function is purely additive.

The new onStreamGoLive function:
  - Only triggers on streams/{streamId} document changes
  - Only does anything when status changes TO 'active'
  - If the function fails (OneSignal error, etc.): returns null (no crash)
  - Existing functions (if any) are untouched
  
SAFE DEPLOYMENT:
  Deploy functions to Firebase:
    firebase deploy --only functions:onStreamGoLive
  
  NOT: firebase deploy --only functions
  (the --only with a specific function name deploys ONLY that new function)
  Existing functions are not redeployed and cannot be affected.
```

#### Step S4-I: Theater Mode SAFELY
```
Theater mode is pure CSS/state change.

CURRENT layout: unchanged when theaterMode === false (the default)
THEATER layout: activated only when theaterMode === true

The className toggle approach:
  <div className={theaterMode ? 'live-theater' : 'live-standard'}>
  
  .live-standard: inherits all existing styles (no change)
  .live-theater: new CSS classes added to global.css
  
Adding new CSS classes NEVER breaks existing styles.
The new classes only affect elements when the className is applied.
```

---

## PART 6 — HOW TO ADD NEW ROUTES TO App.jsx SAFELY

`App.jsx` is a critical file — a syntax error here breaks the entire app.

### The Safe Route Addition Pattern
```
CURRENT App.jsx route structure (simplified):
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/feed" element={<FeedPage />} />
    <Route path="/live" element={<LivePage />} />
    ... (many existing routes) ...
  </Routes>

SAFE WAY TO ADD NEW ROUTES:

Step 1: Find the section for the relevant feature group.
  Auth routes are grouped together. Wallet routes are grouped. Admin routes are grouped.

Step 2: Add new routes WITHIN that group, NOT scattered randomly:

  {/* === AUTH ROUTES === */}
  <Route path="/auth/login" element={<LoginPage />} />
  <Route path="/auth/signup" element={<SignupPage />} />
  <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
  <Route path="/auth/phone" element={<PhoneAuthPage />} />          {/* NEW */}
  <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />

  {/* === WALLET ROUTES === */}
  <Route path="/wallet" element={<WalletPage />} />
  <Route path="/wallet/buy-coins" element={<BuyCoinsPage />} />     {/* NEW */}
  <Route path="/wallet/connect/return" element={<StripeConnectReturnPage />} /> {/* NEW */}

  {/* === ADMIN ROUTES (wrapped in AdminRoute guard) === */}
  <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
  <Route path="/admin/streams" element={<AdminRoute><AdminStreamsMonitorPage /></AdminRoute>} /> {/* NEW */}
  <Route path="/admin/payouts" element={<AdminRoute><AdminPayoutsPage /></AdminRoute>} />     {/* NEW */}

Step 3: After adding routes, ALWAYS run: npm run build
  A syntax error or missing import will fail the build and be caught before deployment.

Step 4: Check that ALL existing routes still resolve correctly.
  Navigate to /feed, /live, /marketplace, /settings in the dev server.
  If any existing route returns 404, investigate the App.jsx change.
```

### Import Safety
```
Each new route requires an import at the top of App.jsx.

ADD imports in the SAME GROUP as related existing imports:

// Existing auth imports
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import PhoneAuthPage from './pages/auth/PhoneAuthPage'          // NEW

// Existing wallet imports  
import WalletPage from './pages/wallet/WalletPage'
import BuyCoinsPage from './pages/wallet/BuyCoinsPage'          // NEW
import StripeConnectReturnPage from './pages/wallet/StripeConnectReturnPage' // NEW

// Existing admin imports
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminStreamsMonitorPage from './pages/admin/AdminStreamsMonitorPage'  // NEW
import AdminPayoutsPage from './pages/admin/AdminPayoutsPage'              // NEW

If a new file doesn't exist yet when you add its import:
  The build will fail with "Module not found"
  Fix: either create the file first, or comment out the import/route until ready
```

---

## PART 7 — ADMIN NAVIGATION SAFE ADDITION

`AdminSubPages.jsx` and `AdminDashboardPage.jsx` need new nav items.

### Safe Admin Nav Addition
```
CURRENT AdminSubPages.jsx nav:
  const adminNav = [
    { path: '/admin', label: 'Overview', icon: '📊' },
    { path: '/admin/reports', label: 'Reports', icon: '📋' },
    { path: '/admin/kyc', label: 'KYC', icon: '🪪' },
    { path: '/admin/users', label: 'Users', icon: '👥' },
    { path: '/admin/analytics', label: 'Analytics', icon: '📈' },
  ]

ADD NEW ITEMS — append to array, never reorder existing items:
  const adminNav = [
    { path: '/admin', label: 'Overview', icon: '📊' },
    { path: '/admin/streams', label: 'Live Streams', icon: '🔴' },  // NEW
    { path: '/admin/reports', label: 'Reports', icon: '📋' },
    { path: '/admin/payouts', label: 'Payouts', icon: '💰' },       // NEW
    { path: '/admin/kyc', label: 'KYC', icon: '🪪' },
    { path: '/admin/users', label: 'Users', icon: '👥' },
    { path: '/admin/analytics', label: 'Analytics', icon: '📈' },
  ]

Existing nav items are in the same position.
Their paths are unchanged. Their components are unchanged.
The only change is two new items inserted at positions 2 and 4.
```

---

## PART 8 — FIRESTORE RULES SAFE DEPLOYMENT

Firestore rules are live immediately on deployment. A bad rule can lock users out.

### Safe Rules Deployment Process
```
Step 1: Copy current firestore.rules to firestore.rules.backup
  Copy-Item ConnectHub-SPA/firestore.rules ConnectHub-SPA/firestore.rules.backup
  
Step 2: Make changes to firestore.rules (additive only)
  New rules for streams.streamKey, streams.moderators, etc.

Step 3: Test in Firebase Rules Simulator (NOT production):
  Firebase Console → Firestore → Rules → Rules Playground
  
  TEST CASES to run in simulator:
  a) Can an anonymous user read a public stream? → Expected: ALLOW
  b) Can an anonymous user read a stream's streamKey? → Expected: DENY
  c) Can a creator read their own stream's streamKey? → Expected: ALLOW
  d) Can a moderator update bannedUsers on a stream they moderate? → Expected: ALLOW
  e) Can a viewer update privacy on a stream they don't own? → Expected: DENY
  f) Can a regular user read another user's wallet transactions? → Expected: DENY
  g) Can an admin read any stream? → Expected: ALLOW (admin check via custom claims)

Step 4: Only deploy after ALL simulator tests pass:
  firebase deploy --only firestore:rules

Step 5: Immediate rollback plan if rules break things:
  firebase deploy --only firestore:rules (deploy firestore.rules.backup)
  Rollback takes < 60 seconds.
  
Step 6: Monitor Firebase Console → Firestore → Usage for error spikes
  after rule deployment. Any sudden spike in "Permission Denied" errors
  means rollback immediately.
```

---

## PART 9 — DEPLOYMENT SAFETY SEQUENCE

When each sprint is complete, follow this deployment order:

### Per-Sprint Deployment Order
```
SEQUENCE (never skip a step):

1. Deploy Backend FIRST (before frontend changes are visible to users):
   - New backend endpoints are deployed but not yet called by frontend
   - Test endpoints with Postman in production
   - Verify existing endpoints still work

2. Deploy Firestore Rules (if changed in this sprint):
   - Rules are live but new frontend code doesn't call them yet
   - Test with simulator

3. Deploy Firebase Functions (if changed in this sprint):
   - firebase deploy --only functions:specificFunctionName
   - Test in Firebase Console → Functions → Logs

4. Deploy Frontend LAST:
   - npm run build first (must produce zero errors)
   - firebase deploy --only hosting
   - Or: deploy to staging URL first (Firebase Preview Channels)

5. Smoke Test (within 10 minutes of deployment):
   a) Can a user log in?
   b) Does the feed load?
   c) Does the live page load?
   d) Does the new sprint feature work?
   e) Check browser console for any new JavaScript errors

6. If any smoke test fails:
   - Frontend rollback: firebase hosting:channel:deploy previous-version
   - Backend rollback: redeploy previous server version
   - Rules rollback: deploy .backup file
```

### Staging Before Production
```
STRONGLY RECOMMENDED: Use Firebase Preview Channels:
  firebase hosting:channel:deploy sprint1-preview
  
This creates a temporary URL: sprint1-preview--lynkapp-xxxx.web.app
Test the sprint on this URL first.
Only promote to production channel when all tests pass:
  firebase hosting:clone sprint1-preview:live
```

---

## PART 10 — RISK REGISTER

Each change is rated LOW / MEDIUM / HIGH risk and has a mitigation.

| Change | Risk | Why | Mitigation |
|---|---|---|---|
| Create mux-service.ts | LOW | New file, nothing imports it | Test in isolation before registering route |
| Create streaming.ts route | LOW | New file, registered at bottom | Test with Postman before frontend calls it |
| Rewrite livestream-webrtc.js | HIGH | All live pages import this | Keep same class name/method signatures; use Rename-and-Replace technique |
| Update LiveSetupPage.jsx | MEDIUM | Creator go-live flow | Use feature flag; old path preserved if Mux not configured |
| Update LiveWatchPage.jsx | MEDIUM | All viewers use this | Use playbackUrl OR streamUrl fallback chain |
| Update LiveVODPage.jsx | LOW | Only affects VOD playback | Same fallback chain as above |
| Add Firestore stream fields | LOW | Schema is additive | Old docs unaffected; new fields are optional |
| Update Firestore rules | HIGH | Live immediately, can lock users | Simulator test all cases; keep .backup; monitor post-deploy |
| Create BuyCoinsPage.jsx | LOW | New file | Test in isolation |
| Update WalletPage.jsx | MEDIUM | Visible to all users | Shadow Load technique: mock data stays until real data loads |
| Update LiveWatchPage gift button | MEDIUM | All viewers use gifts | Feature flag: coin check only when Stripe configured |
| Add Apple Sign-In to LoginPage | HIGH | Auth is critical path | Isolate in AppleSignInButton component; iOS-only render |
| Add DOB to SignupPage.jsx | MEDIUM | All new signups affected | Optional field first; required in second PR |
| Wire 2FA in Security Settings | LOW | Currently a no-op toggle | Just intercept the existing toggle with a modal |
| Add privacy selector to LiveSetup | LOW | New state, defaults to 'public' | Old behavior preserved by default value |
| Add camera toggle to LiveSetup | LOW | Mobile-only, additive button | try/catch on getUserMedia; stream continues if fails |
| Add @mentions to chat | LOW | Pure display transformation | parseMessage() returns unchanged text if no @ found |
| Add reply threads to chat | LOW | New optional Firestore fields | Old messages render without reply UI |
| Add external mods | LOW | New Firestore field, optional chaining | Old streams with no moderators field: unaffected |
| Add captions CC button | LOW | Opt-in, user must click | SpeechRecognition unsupported → graceful toast + disable |
| Add onStreamGoLive Cloud Function | LOW | New function only | Returns null on any error; other functions untouched |
| Add theater mode | LOW | New CSS class toggle | Default is existing layout; theater only on click |
| Admin force-end stream | MEDIUM | Admin action has real effect | Confirmation dialog required; audit log written |
| Add Admin routes to App.jsx | MEDIUM | Syntax error breaks whole app | Build check after every import added |
| Add admin nav items | LOW | Array append | Existing nav items stay in same position |
| New admin pages | LOW | New files, guarded by AdminRoute | Non-admins cannot access; no existing page affected |

---

## PART 11 — REGRESSION TEST CHECKLIST

Run this FULL checklist after EVERY sprint is deployed. If any item fails, 
stop and fix before proceeding to the next sprint.

### Core App Functions (Must Never Break)
```
□ Landing page loads
□ Login with email/password succeeds
□ Login with Google succeeds
□ Signup creates new account
□ Onboarding flow completes
□ Feed loads posts
□ Stories load and play
□ Post creation works
□ Like/comment on posts works
□ Messages list loads
□ Send a message works
□ Notifications load
□ Profile page loads
□ Profile edit saves
□ Friends section loads
□ Groups section loads
□ Events section loads
□ Marketplace loads products
□ Settings page loads
□ Help page loads
□ Logout works
```

### Live Streaming (Must Not Degrade)
```
□ Live discovery page loads existing streams
□ Clicking a stream card opens LiveWatchPage
□ HLS player loads (even if stream is offline: shows status message)
□ Chat messages load in LiveWatchPage
□ Sending a chat message works
□ Gift button is visible and clickable
□ Follow button works on stream page
□ LiveSetupPage opens for authenticated users
□ Go Live button is visible (even if Mux not configured yet)
□ Stream list in LivePage updates in real-time
□ VOD playback page loads
□ Live analytics page loads for creators
□ Moderation page loads for stream owners
□ Live schedule page loads
```

### Admin Functions (Must Not Degrade)
```
□ Admin dashboard loads for admin users
□ Non-admin users cannot access /admin/* (get redirected)
□ Reports tab loads in admin
□ KYC tab loads in admin
□ Verification tab loads in admin
□ Analytics page loads in admin
□ New: Streams monitor loads (Sprint 4)
□ New: Payouts page loads (Sprint 2+4)
```

---

## PART 12 — COMMUNICATION PLAN

Who needs to know what and when:

```
BEFORE STARTING ANY SPRINT:
  → Product Owner: Review this plan, confirm sprint order
  → Design Team: New screens design has been signed off
  → DevOps/Infra: Mux and Stripe accounts are created, keys are available
  → QA Team: Regression checklist is ready

WHEN STARTING SPRINT 1:
  → Backend Developer: Starts on mux-service.ts + streaming.ts
  → Frontend Developer: Starts on whip-publisher.js (can work in parallel)
  → No deployment to production yet

WHEN SPRINT 1 IS CODE-COMPLETE:
  → QA Team: Run full regression checklist + Sprint 1 test cases
  → Sign-off required from: Lead Developer + Product Owner
  → Then: Deploy to staging → 48h soak time → Deploy to production

SAME PROCESS FOR SPRINTS 2, 3, 4.

EMERGENCY ROLLBACK CONTACT:
  If production breaks after a deployment:
  1. Frontend rollback: firebase hosting rollback (takes 2 minutes)
  2. Backend rollback: redeploy previous server build
  3. Rules rollback: deploy firestore.rules.backup
  4. Notify: Product Owner within 15 minutes of rollback
```

---

## PART 13 — FINAL IMPLEMENTATION SEQUENCE SUMMARY

The complete ordered list of every file that will be touched, in the exact safe order:

```
SPRINT 1 — VIDEO PIPELINE (Backend first, then frontend)
─────────────────────────────────────────────────────────
 1.  [CREATE]  ConnectHub-Backend/src/services/mux-service.ts
 2.  [CREATE]  ConnectHub-Backend/src/routes/streaming.ts
 3.  [MODIFY]  ConnectHub-Backend/src/server.ts             → add route registration (1 line)
 4.  [CREATE]  ConnectHub-SPA/src/services/whip-publisher.js
 5.  [RENAME]  livestream-webrtc.js → livestream-webrtc-LEGACY.js
 6.  [CREATE]  ConnectHub-SPA/src/services/livestream-webrtc.js  (new Mux implementation)
 7.  [MODIFY]  ConnectHub-SPA/src/pages/live/LiveSetupPage.jsx   (feature-flagged Mux flow)
 8.  [MODIFY]  ConnectHub-SPA/src/pages/live/LiveWatchPage.jsx   (playbackUrl fallback chain)
 9.  [MODIFY]  ConnectHub-SPA/src/pages/live/LiveVODPage.jsx     (vodPlaybackUrl fallback)
10.  [MODIFY]  ConnectHub-SPA/firestore.rules                    (streamKey protection)
11.  [TEST]    Run full regression checklist

SPRINT 2 — MONETIZATION PIPELINE
─────────────────────────────────────────────────────────
12.  [CREATE]  ConnectHub-Backend/src/services/stripe-connect-service.ts
13.  [CREATE]  ConnectHub-Backend/src/routes/wallet.ts
14.  [MODIFY]  ConnectHub-Backend/src/server.ts             → add wallet route (1 line)
15.  [CREATE]  ConnectHub-SPA/src/pages/wallet/BuyCoinsPage.jsx
16.  [CREATE]  ConnectHub-SPA/src/pages/wallet/StripeConnectReturnPage.jsx
17.  [MODIFY]  ConnectHub-SPA/src/pages/admin/AdminPayoutsPage.jsx  (new admin page)
18.  [MODIFY]  ConnectHub-SPA/src/pages/wallet/WalletPage.jsx        (shadow load technique)
19.  [MODIFY]  ConnectHub-SPA/src/pages/live/LiveWatchPage.jsx       (coin check feature flag)
20.  [MODIFY]  ConnectHub-SPA/src/pages/live/LiveMonetizationPage.jsx (age gate)
21.  [MODIFY]  ConnectHub-SPA/src/App.jsx                   → add 3 new routes
22.  [MODIFY]  ConnectHub-SPA/src/pages/admin/AdminSubPages.jsx → add Payouts nav item
23.  [TEST]    Run full regression checklist

SPRINT 3 — AUTH & COMPLIANCE
─────────────────────────────────────────────────────────
24.  [CREATE]  ConnectHub-SPA/src/services/mfa-service.js
25.  [CREATE]  ConnectHub-SPA/src/pages/auth/PhoneAuthPage.jsx
26.  [CREATE]  ConnectHub-SPA/src/components/common/TwoFactorSetupModal.jsx
27.  [CREATE]  ConnectHub-SPA/src/components/auth/AppleSignInButton.jsx
28.  [MODIFY]  ConnectHub-SPA/src/pages/auth/LoginPage.jsx          (add AppleSignInButton, iOS-only)
29.  [MODIFY]  ConnectHub-SPA/src/pages/auth/SignupPage.jsx          (add DOB optional, add Apple)
30.  [MODIFY]  ConnectHub-SPA/src/pages/settings/AccountSecurityPages.jsx (intercept 2FA toggle)
31.  [MODIFY]  ConnectHub-SPA/src/App.jsx                   → add /auth/phone route
32.  [MODIFY]  ConnectHub-SPA/capacitor.config.json          (Apple Sign-In plugin for iOS)
33.  [TEST]    Run full regression checklist

SPRINT 4 — FEATURE COMPLETENESS
─────────────────────────────────────────────────────────
34.  [CREATE]  ConnectHub-SPA/src/services/captions-service.js
35.  [CREATE]  ConnectHub-SPA/src/services/admin-monitoring-service.js
36.  [CREATE]  ConnectHub-SPA/src/pages/admin/AdminStreamsMonitorPage.jsx
37.  [CREATE]  ConnectHub-SPA/src/components/live/StreamPrivacyGate.jsx
38.  [MODIFY]  ConnectHub-SPA/src/pages/live/LiveSetupPage.jsx    (privacy selector, camera toggle)
39.  [MODIFY]  ConnectHub-SPA/src/pages/live/LiveWatchPage.jsx    (@mentions, reply, CC, theater, follower-only gate)
40.  [MODIFY]  ConnectHub-SPA/src/pages/live/LiveModerationPage.jsx (external mods, follower-only toggle)
41.  [MODIFY]  ConnectHub-SPA/src/pages/admin/AdminDashboardPage.jsx (live mini-panel, Streams tab)
42.  [MODIFY]  ConnectHub-SPA/src/pages/admin/AdminSubPages.jsx   (add Live Streams nav item)
43.  [MODIFY]  ConnectHub-SPA/functions/index.js               (onStreamGoLive Cloud Function)
44.  [MODIFY]  ConnectHub-SPA/src/services/mobile-platform-service.js (save OneSignal playerId)
45.  [MODIFY]  ConnectHub-SPA/src/styles/global.css            (theater mode CSS)
46.  [MODIFY]  ConnectHub-SPA/src/App.jsx                     → add /admin/streams + /admin/payouts routes
47.  [DELETE]  ConnectHub-SPA/src/services/livestream-webrtc-LEGACY.js  (only after all tests pass)
48.  [TEST]    Run full regression checklist
49.  [MERGE]   Create PR from feature/live-streaming-v2 → main

TOTAL: 49 ordered steps, 15 new files, 17 modified files, 1 renamed, 1 deleted
```

---

*This document is planning and process guidance only. No files have been created or modified.*  
*Approved by: _________________ Date: _________________*
