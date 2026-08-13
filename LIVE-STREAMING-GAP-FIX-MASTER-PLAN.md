# 🎥 Live Streaming Section — Gap Fix Master Plan
**Prepared by:** Senior App Developer  
**Date:** August 13, 2026  
**Status:** PLANNING ONLY — No code changes made yet  
**Source:** Gap Analysis Complete report + Live Streaming Platform Spec v1.0

---

## OVERVIEW & APPROACH

This document defines the exact technical plan, file-by-file specifications, and sprint sequence for closing every identified gap in LynkApp's live streaming section. Work is organized into 4 sprints ordered by blocking severity. **Nothing in this document changes any file** — it is the blueprint to be reviewed and approved before implementation begins.

### Sprint Structure
| Sprint | Theme | Gaps Addressed | Est. Effort |
|---|---|---|---|
| Sprint 1 | Video Pipeline (CRITICAL BLOCKER) | Real streaming CDN, WebRTC, RTMP | 2–3 weeks |
| Sprint 2 | Monetization Pipeline | Stripe Connect, real wallet, coin purchases | 1–2 weeks |
| Sprint 3 | Auth & Compliance | Apple Sign-In, phone auth, DOB, 2FA | 1 week |
| Sprint 4 | Feature Completeness | Camera toggle, privacy, @mentions, mods, captions, admin tools | 1–2 weeks |

---

## SPRINT 1 — VIDEO PIPELINE (BLOCKING)

### Gap 1.1 — No Real Streaming CDN
**Problem:** `ConnectHub-SPA/src/services/livestream-webrtc.js` is a stub. `startStream()`, `destroy()`, `getStats()` are empty or placeholder calls. No video ever reaches any viewer.

**Chosen Solution: Mux**
- Mux is the fastest to integrate for a React + Firebase stack
- Provides: RTMP ingest, HLS delivery, live-to-VOD auto-recording, asset thumbnails, stream health webhooks
- Cost: Pay-per-minute (~$0.015/min encoding + $0.007/GB delivery) — no upfront cost
- Alternative if Mux is cost-prohibitive: Cloudflare Stream ($5/creator-seat/month flat)

**Implementation Plan:**

#### Step 1.1.1 — Account Setup (Manual, by team)
```
Action required BEFORE code work:
1. Create account at dashboard.mux.com
2. Create a new Mux Environment
3. Go to Settings → API Access Tokens
4. Create token with: Mux Videos Read + Write, Mux Live Streams Read + Write
5. Save: MUX_TOKEN_ID and MUX_TOKEN_SECRET
6. Add both to ConnectHub-Backend/.env and ConnectHub-SPA/.env
```

#### Step 1.1.2 — Backend: New Mux Service File
**File to CREATE:** `ConnectHub-Backend/src/services/mux-service.ts`

```typescript
// PURPOSE: Wraps Mux Node SDK for live stream lifecycle management
// WHAT IT DOES:
//   - createLiveStream()  → calls Mux API to create a new live stream
//     Returns: { streamKey, playbackId, streamId }
//   - closeLiveStream(streamId) → ends the Mux stream session
//   - getLiveStreamStatus(streamId) → returns 'active'|'idle'|'disabled'
//   - createPlaybackId(assetId) → generates HLS playback URL
//   - handleWebhook(event) → processes Mux webhook payloads

// DEPENDENCIES to install:
//   npm install @mux/mux-node
//   (already in package.json after install)

// KEY MUX API CALLS:
//   POST /video/v1/live-streams
//     body: { latency_mode: 'low', reconnect_window: 60,
//             new_asset_settings: { playback_policy: ['public'] } }
//   DELETE /video/v1/live-streams/{LIVE_STREAM_ID}
//   GET /video/v1/live-streams/{LIVE_STREAM_ID}

// MUX WEBHOOK EVENTS to handle:
//   video.live_stream.active  → stream is live, update Firestore status:'live'
//   video.live_stream.idle    → stream went offline, update status:'ended'
//   video.asset.ready         → VOD is processed, store VOD playback URL in Firestore
```

#### Step 1.1.3 — Backend: New Streaming Routes File
**File to CREATE:** `ConnectHub-Backend/src/routes/streaming.ts`

```typescript
// ENDPOINTS to implement:

// POST /api/streaming/create
//   Auth: required (Firebase token)
//   Body: { title, category, tags, privacy }
//   Action:
//     1. Call muxService.createLiveStream()
//     2. Write to Firestore streams/{uid}/activeSessions:
//        { muxStreamId, streamKey, playbackId, status:'idle' }
//     3. Return { streamKey, rtmpUrl, playbackUrl } to frontend
//   rtmpUrl format: rtmps://global-live.mux.com:443/app
//   playbackUrl format: https://stream.mux.com/{PLAYBACK_ID}.m3u8

// POST /api/streaming/end
//   Auth: required (same uid as creator)
//   Body: { muxStreamId }
//   Action:
//     1. Call muxService.closeLiveStream()
//     2. Update Firestore stream doc: status:'ended', endedAt: now()

// POST /api/streaming/webhook
//   Auth: Mux webhook signature verification (X-Mux-Signature header)
//   Action: Route to muxService.handleWebhook()

// GET /api/streaming/status/:muxStreamId
//   Auth: required
//   Returns current Mux stream status

// MIDDLEWARE NEEDED:
//   - verifyFirebaseToken (already exists in auth.middleware.ts)
//   - verifyMuxWebhook (new, validates Mux-Signature-V1 header using HMAC-SHA256)
```

#### Step 1.1.4 — Frontend: Replace Stub Service
**File to REWRITE:** `ConnectHub-SPA/src/services/livestream-webrtc.js`

```javascript
// WHAT TO REPLACE:
// Current file has empty/stub startStream(), destroy(), getStats() methods
// 
// NEW IMPLEMENTATION:
// This service becomes an API client — NOT a WebRTC client
// WebRTC for viewer-side is handled separately (see Gap 1.2)
// This file handles CREATOR side only: getting stream credentials from Mux via our backend

// CLASS: LivestreamWebRTC (keep same class name to avoid breaking imports)
// 
// METHOD: async startStream({ title, category, tags, privacy })
//   1. POST to /api/streaming/create with title/category/tags/privacy
//   2. Receive { streamKey, rtmpUrl, playbackUrl, muxStreamId }
//   3. Store muxStreamId in this.currentStreamId
//   4. Return { streamKey, rtmpUrl, playbackUrl }
//   - On mobile: pass streamKey + rtmpUrl to WebRTC broadcaster (see Gap 1.2)
//   - On web: display RTMP credentials for OBS (show in UI as copy-paste)
//
// METHOD: async destroy()
//   1. POST to /api/streaming/end with { muxStreamId: this.currentStreamId }
//   2. Clear this.currentStreamId
//
// METHOD: async getStats()
//   1. GET /api/streaming/status/:muxStreamId
//   2. Return stats object (viewer count from Mux dashboard or Firestore)
//
// ALSO: Listen for Mux webhooks via Firestore (backend writes to Firestore on webhook)
//   When Firestore stream doc updates status → 'active', update UI to show LIVE badge
```

#### Step 1.1.5 — Frontend: Update LiveSetupPage
**File to MODIFY:** `ConnectHub-SPA/src/pages/live/LiveSetupPage.jsx`

```
CHANGES NEEDED:

1. After startStream() returns, the page now has { streamKey, rtmpUrl }
   - Add a "Stream Credentials" section (shown when mobile camera not available):
     - Display copyable RTMP URL: rtmps://global-live.mux.com:443/app
     - Display copyable Stream Key (obfuscated by default, tap to reveal)
     - Show "Copy for OBS" button

2. For mobile browsers using camera:
   - Add RTMP from browser via WebRTC→Mux workflow (Sprint 1.2)
   - Keep existing getUserMedia camera preview
   - After getting stream credentials, pass stream to WHIP endpoint (see Gap 1.2)

3. The existing quality monitoring (getStats) will now hit real Mux data
   - Update getQualityLevel() to map Mux's health scores to existing UI labels

4. Replace the Go Live button flow:
   OLD: livestreamWebRTC.startStream({ streamId: docRef.id })
   NEW: 
     Step 1: Call backend /api/streaming/create → get Mux credentials
     Step 2: Create Firestore stream doc with { muxStreamId, playbackUrl }
     Step 3: Start camera WHIP push (mobile) or show OBS credentials (desktop)
     Step 4: Listen to Firestore for status:'active' update from Mux webhook
```

#### Step 1.1.6 — Frontend: Update LiveWatchPage
**File to MODIFY:** `ConnectHub-SPA/src/pages/live/LiveWatchPage.jsx`

```
CHANGES NEEDED:

The HLS.js setup (C-1) is already correct in structure.
Only the source URL needs to change:

CURRENT: stream.streamUrl (was set manually, often undefined)
NEW:     stream.playbackUrl (set by backend from Mux: https://stream.mux.com/{ID}.m3u8)

1. In the HLS useEffect, change:
   if (!stream?.streamUrl ...) → if (!stream?.playbackUrl ...)
   stream.streamUrl → stream.playbackUrl

2. Add low-latency LL-HLS support in HLS.js config:
   new Hls({
     enableWorker: true,
     lowLatencyMode: true,        // already there
     backBufferLength: 30,
     liveSyncDurationCount: 3,
     liveMaxLatencyDurationCount: 6,
   })

3. Add stream status check:
   If stream.status === 'idle' (Mux not yet active), show a 
   "Stream starting soon..." overlay instead of video error state
```

#### Step 1.1.7 — Firestore Schema Updates
**Collection: `streams`**
```
ADD FIELDS to stream documents:
  muxStreamId:   string   // Mux live stream ID
  streamKey:     string   // RTMP stream key (store server-side only, never in client-readable Firestore)
  playbackUrl:   string   // https://stream.mux.com/{PLAYBACK_ID}.m3u8
  muxAssetId:    string   // Set after stream ends (for VOD)
  vodPlaybackUrl: string  // VOD HLS URL after Mux processes the recording

FIRESTORE RULES UPDATE needed:
  streamKey must NOT be readable by any user except the stream creator
  Rule: allow read: if request.auth.uid == resource.data.uid
```

#### Step 1.1.8 — VOD Auto-Recording
```
HOW MUX AUTO-RECORDS:
  When creating the live stream, include in body:
  { new_asset_settings: { playback_policy: ['public'] } }
  
  Mux automatically creates an asset (VOD) when the stream ends.
  The webhook event video.asset.ready fires with the asset playback URL.

BACKEND webhook handler (in mux-service.ts):
  On video.asset.ready event:
    1. Find the Firestore stream doc by muxStreamId
    2. Update: { vodPlaybackUrl: 'https://stream.mux.com/{VOD_PLAYBACK_ID}.m3u8', muxAssetId }
    
FRONTEND (LiveVODPage.jsx):
  Currently reads stream.streamUrl for VOD playback
  Change to read: stream.vodPlaybackUrl
```

---

### Gap 1.2 — Mobile Browser Broadcasting (WebRTC → Mux WHIP)
**Problem:** Mobile creators can access camera/mic but cannot push video to Mux from a browser.

**Solution: WHIP (WebRTC HTTP Ingest Protocol)**
Mux supports WHIP endpoints, allowing browser-based WebRTC to publish directly to Mux without RTMP.

**Implementation Plan:**

#### Step 1.2.1 — New WHIP Publisher Service
**File to CREATE:** `ConnectHub-SPA/src/services/whip-publisher.js`

```javascript
// PURPOSE: Handles WebRTC → Mux WHIP ingest for mobile browser streaming
// This replaces the old stub WebRTC implementation

// CLASS: WHIPPublisher
//
// METHOD: async start(stream, whipEndpoint, bearerToken)
//   stream = MediaStream from getUserMedia (already obtained in LiveSetupPage)
//   whipEndpoint = https://global-live.mux.com/app/whip (from Mux dashboard)
//   bearerToken = stream key from our backend
//
//   IMPLEMENTATION:
//   1. Create RTCPeerConnection with STUN servers:
//      { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
//   2. Add tracks: stream.getTracks().forEach(t => pc.addTrack(t, stream))
//   3. Create SDP offer: const offer = await pc.createOffer()
//   4. Set local description: await pc.setLocalDescription(offer)
//   5. Wait for ICE gathering to complete
//   6. POST to whipEndpoint:
//      headers: { 'Content-Type': 'application/sdp', 'Authorization': `Bearer ${bearerToken}` }
//      body: pc.localDescription.sdp
//   7. Receive SDP answer, set as remote description
//   8. Store pc reference for cleanup
//
// METHOD: stop()
//   1. pc.close()
//   2. Set pc = null
//
// METHOD: getStats()
//   1. const stats = await pc.getStats()
//   2. Parse outbound-rtp reports for bitrate, packet loss
//   3. Return { bitrate, lossRate, frameRate }
//
// ERROR HANDLING:
//   - If WHIP fails (browser incompatibility), fallback to showing OBS credentials
//   - Show toast: "Mobile streaming unavailable — use OBS with the stream key below"

// NOTE ON MOBILE: 
//   iOS Safari 15.1+ supports WebRTC WHIP
//   Android Chrome 80+ supports WebRTC WHIP
//   This covers iOS 16+ and Android 10+ (matching spec §2)
```

#### Step 1.2.2 — Integrate WHIP into LiveSetupPage
```
IN LiveSetupPage.jsx, in startStream():

CURRENT FLOW (stub):
  await livestreamWebRTC.startStream({ streamId: docRef.id })

NEW FLOW:
  // Step 1: Get Mux credentials from backend
  const { streamKey, rtmpUrl, playbackUrl, muxStreamId, whipEndpoint } = 
    await apiClient.post('/api/streaming/create', { title, category, tags, privacy })
  
  // Step 2: Create Firestore stream doc
  const docRef = await addDoc(collection(db, 'streams'), {
    uid, title, category, tags, status: 'idle',  // idle until Mux webhook fires
    playbackUrl, muxStreamId, startedAt: serverTimestamp()
  })
  
  // Step 3: Start video push (mobile browser WHIP)
  const mediaStream = videoPreviewRef.current.srcObject
  if (mediaStream && whipPublisher) {
    await whipPublisher.start(mediaStream, whipEndpoint, streamKey)
  }
  
  // Step 4: Listen to Firestore for status:'active' 
  //   (set by backend webhook handler when Mux fires video.live_stream.active)
  //   Show "Waiting for stream to activate..." overlay until status = 'active'
```

---

### Gap 1.3 — RTMP Ingest for Desktop / OBS Users
**Problem:** The spec requires creators on desktop to be able to use OBS or similar software.

**Solution:** Mux provides a global RTMP ingest URL. No server required from our side.

**Implementation Plan:**

#### Step 1.3.1 — OBS Credentials UI in LiveSetupPage
```
WHEN TO SHOW:
  - When the user is on a desktop browser (detect via navigator.maxTouchPoints === 0)
  - OR when the user explicitly clicks "Use OBS / External Software"

UI TO ADD (in LiveSetupPage.jsx, after Go Live press, before actual stream starts):
  
  Card titled: "📡 External Streaming Setup"
  
  Row 1: "RTMP URL"
    Value: rtmps://global-live.mux.com:443/app
    [Copy] button → navigator.clipboard.writeText()
  
  Row 2: "Stream Key"  
    Value: ●●●●●●●●●●●●●●● (hidden by default)
    [👁 Reveal] toggle button
    [Copy] button
  
  Row 3: Instructions:
    "In OBS: Settings → Stream → Service: Custom → paste URL and Key above"
  
  Row 4: Status indicator:
    "⏳ Waiting for stream to connect..."  (while status:'idle')
    "🔴 Stream is LIVE"  (after status:'active' from webhook)
  
  NOTE: Stream Key must be fetched from our BACKEND only
  Never store the raw stream key in Firestore (it's a secret credential)
  Instead: add a backend endpoint GET /api/streaming/credentials/:streamId
  that returns streamKey only to the authenticated stream owner
```

---

## SPRINT 2 — MONETIZATION PIPELINE

### Gap 2.1 — Stripe Connect for Creator Payouts
**Problem:** `WalletPage.jsx` uses `MOCK_TXS` hardcoded array. No real money moves.

**Implementation Plan:**

#### Step 2.1.1 — Stripe Setup (Manual, by team)
```
Action required BEFORE code work:
1. Create / log into Stripe account at dashboard.stripe.com
2. Enable Stripe Connect: Dashboard → Connect → Get started
3. Choose: "Platform or marketplace" model (Standard accounts)
4. Note: STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET
5. Add to ConnectHub-Backend/.env
6. Add VITE_STRIPE_PUBLISHABLE_KEY to ConnectHub-SPA/.env
```

#### Step 2.1.2 — Backend: Stripe Connect Service
**File to CREATE:** `ConnectHub-Backend/src/services/stripe-connect-service.ts`

```typescript
// PURPOSE: Manages Stripe Connect onboarding and payouts for creators

// DEPENDENCIES: npm install stripe

// METHODS:

// createConnectedAccount(uid, email)
//   Calls: stripe.accounts.create({ type: 'express', email, metadata: { uid } })
//   Saves stripeAccountId to Firestore users/{uid}

// createOnboardingLink(stripeAccountId)
//   Calls: stripe.accountLinks.create({ account, refresh_url, return_url, type:'account_onboarding' })
//   Returns URL → redirect creator to complete Stripe onboarding

// createPayoutTransfer(stripeAccountId, amountCents, description)
//   Calls: stripe.transfers.create({ amount: amountCents, currency:'usd', destination: stripeAccountId })
//   Records transfer in Firestore wallets/{uid}/transactions

// getAccountBalance(stripeAccountId)
//   Calls: stripe.balance.retrieve({ stripeAccount: stripeAccountId })
//   Returns { available, pending } in cents

// handleWebhook(event)
//   Handles: account.updated, transfer.created, payout.paid, payout.failed
```

#### Step 2.1.3 — Backend: Wallet Routes
**File to CREATE:** `ConnectHub-Backend/src/routes/wallet.ts`

```typescript
// ENDPOINTS:

// POST /api/wallet/connect/start
//   Auth: required
//   Action: createConnectedAccount() → createOnboardingLink() → return { url }
//   Frontend redirects creator to Stripe hosted onboarding page

// GET /api/wallet/connect/status
//   Auth: required
//   Action: stripe.accounts.retrieve(stripeAccountId)
//   Returns { connected: bool, payoutsEnabled: bool, chargesEnabled: bool }

// GET /api/wallet/balance
//   Auth: required
//   Action: getAccountBalance() 
//   Returns { available, pending } in dollars

// POST /api/wallet/withdraw
//   Auth: required
//   Body: { amountCents }
//   Validation: amount >= 1000 cents ($10 minimum per spec), amount <= available balance
//   Action: createPayoutTransfer()
//   Returns { success: bool, transferId }

// POST /api/wallet/webhook
//   Auth: Stripe webhook signature verification
//   Action: handleWebhook()

// GET /api/wallet/transactions
//   Auth: required
//   Returns: last 50 transactions from Firestore wallets/{uid}/transactions
//   (real data, not mock)
```

#### Step 2.1.4 — Frontend: Update WalletPage
**File to MODIFY:** `ConnectHub-SPA/src/pages/wallet/WalletPage.jsx`

```
CHANGES:

1. REMOVE: const MOCK_TXS = [...] (lines 45-53)

2. ADD: On mount, call GET /api/wallet/balance → set real available/pending balances

3. ADD: On mount, call GET /api/wallet/transactions → set real txns array

4. ADD: "Connect Stripe" section:
   - If user has no stripeAccountId in Firestore: show "Connect your bank account to receive payouts"
   - Button: "Connect with Stripe" → POST /api/wallet/connect/start → redirect to returned URL
   - After redirect back (return_url): show "✓ Bank account connected"

5. UPDATE: handleWithdraw():
   CURRENT: Shows fake success message with setTimeout
   NEW:
     1. POST /api/wallet/withdraw with { amountCents: Math.round(amt * 100) }
     2. On success: refresh balance, add transaction to list
     3. On error: show specific error message from backend

6. ADD: Loading states for all three sections (balance, history, payout)

7. ADD: Stripe Connect status indicator in header:
   ✅ Connected (payouts enabled)
   ⚠️ Verification required (click to complete)
   ❌ Not connected (click to set up)
```

### Gap 2.2 — Virtual Gifts / In-App Currency Purchase
**Problem:** Gift amounts (10/50/100/500 coins) exist in UI but coins have no purchase path — viewers cannot actually buy coins.

**Implementation Plan:**

#### Step 2.2.1 — Coin Purchase Flow
**File to CREATE:** `ConnectHub-SPA/src/pages/wallet/BuyCoinsPage.jsx`

```jsx
// ROUTE: /wallet/buy-coins
// 
// COIN PACKAGES to display (4 tiers):
//   100 coins  = $0.99
//   500 coins  = $4.99  (★ Best Value badge)
//   1200 coins = $9.99
//   3500 coins = $24.99
//
// FLOW:
//   1. User selects package
//   2. POST /api/wallet/coins/create-intent with { packageId }
//   3. Backend creates Stripe PaymentIntent → returns { clientSecret }
//   4. Load Stripe.js (already have publishable key)
//   5. Use stripe.confirmCardPayment(clientSecret) with Stripe Elements UI
//   6. On success: backend webhook (payment_intent.succeeded) → 
//      add coins to Firestore users/{uid}/coinBalance
//   7. Show confirmation + updated balance

// BACKEND ENDPOINT to CREATE: POST /api/wallet/coins/create-intent
//   Body: { packageId: '100'|'500'|'1200'|'3500' }
//   Action: stripe.paymentIntents.create({ amount: priceCents, currency:'usd',
//            metadata: { uid, coinAmount, packageId } })
//   Returns { clientSecret }
```

#### Step 2.2.2 — Wire Gift Send to Coin Balance
**File to MODIFY:** `ConnectHub-SPA/src/pages/live/LiveWatchPage.jsx` (sendGift function)

```
CURRENT sendGift():
  Writes gift to Firestore directly without checking/deducting coin balance

NEW sendGift():
  1. Read Firestore users/{uid}/coinBalance
  2. If coinBalance < amount: show toast "Not enough coins" + navigate to /wallet/buy-coins
  3. If sufficient:
     a. Deduct coins: transaction update on users/{uid}/coinBalance -= amount
     b. Credit creator: Firestore users/{creatorUid}/pendingEarnings += (amount * 0.7) 
        (70% revenue share per spec - creator gets 70%, platform keeps 30%)
     c. Write to streams/{streamId}/gifts collection (existing code)
     d. Write to wallets/{uid}/transactions as 'gift_sent'
     e. Write to wallets/{creatorUid}/transactions as 'gift_received'
```

---

## SPRINT 3 — AUTH & COMPLIANCE

### Gap 3.1 — Apple Sign-In (iOS App Store Required)
**Problem:** No Apple Auth implemented. Apple mandates it for any iOS app offering social login.

**Implementation Plan:**

#### Step 3.1.1 — Firebase Apple Auth Enable
```
Manual setup required:
1. Apple Developer Account → Certificates, Identifiers & Profiles → Identifiers
2. Select your App ID → Enable "Sign In with Apple"
3. Configure service ID for web flow
4. In Firebase Console → Authentication → Sign-in method → Apple → Enable
5. Add Apple Team ID, Service ID, Key ID, Private Key to Firebase console
```

#### Step 3.1.2 — Frontend: Add Apple Sign-In Button
**File to MODIFY:** `ConnectHub-SPA/src/pages/auth/LoginPage.jsx`
**File to MODIFY:** `ConnectHub-SPA/src/pages/auth/SignupPage.jsx`

```
ADD after Google Sign-In button:

import { OAuthProvider, signInWithPopup } from 'firebase/auth'

const handleAppleSignIn = async () => {
  const provider = new OAuthProvider('apple.com')
  provider.addScope('email')
  provider.addScope('name')
  try {
    const result = await signInWithPopup(auth, provider)
    // result.user contains uid, email, displayName
    // Check if user doc exists in Firestore, if not create profile
    // Navigate to /feed or /onboarding (if new user)
  } catch (err) {
    setError('Apple Sign-In failed. Please try email/password.')
  }
}

BUTTON UI:
  <button onClick={handleAppleSignIn} style={{
    background: '#000', color: '#fff', border: 'none',
    borderRadius: 12, padding: '12px 16px', width: '100%',
    display: 'flex', alignItems: 'center', gap: 12,
    fontSize: 15, fontWeight: 600, cursor: 'pointer'
  }}>
    🍎  Sign in with Apple
  </button>

NOTE: On Capacitor/Android, Apple Sign-In requires the 
@capacitor-community/apple-sign-in plugin. 
File to UPDATE: capacitor.config.json (add plugin config)
```

### Gap 3.2 — Phone Number Sign-In
**Problem:** Spec §3.1 requires phone number auth. Firebase Phone Auth is available but not wired.

**Implementation Plan:**

#### Step 3.2.1 — Frontend: Phone Auth Flow
**File to CREATE:** `ConnectHub-SPA/src/pages/auth/PhoneAuthPage.jsx`

```
ROUTE: /auth/phone

STEP 1 SCREEN — Enter phone number:
  - International phone input with country code picker (+1, +44, etc.)
  - "Send Code" button
  - Action: 
      const recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', { size:'invisible' }, auth)
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier)
      Store confirmation in state
  - Show reCAPTCHA invisible widget (required by Firebase)

STEP 2 SCREEN — Enter SMS code:
  - 6-digit OTP input (individual digit boxes for UX)
  - "Verify" button
  - Action:
      const credential = await confirmation.confirm(otpCode)
      // credential.user is now authenticated
      // Check if user has existing profile, if not navigate to /onboarding
  - "Resend code" timer (60s countdown)
  
ADD link to LoginPage and SignupPage: "Continue with Phone Number →"
```

### Gap 3.3 — Date-of-Birth Capture at Signup
**Problem:** Spec requires DOB at signup for compliance and monetization gating. Currently missing from `SignupPage.jsx`.

**Implementation Plan:**

#### Step 3.3.1 — Add DOB to Signup
**File to MODIFY:** `ConnectHub-SPA/src/pages/auth/SignupPage.jsx`

```
ADD after email input field:

<label style={S.label}>Date of Birth *</label>
<input 
  type="date" 
  name="dob" 
  value={form.dob} 
  onChange={handleChange}
  max={new Date(Date.now() - 13 * 365.25 * 24 * 3600 * 1000).toISOString().split('T')[0]}
  // max = today minus 13 years (COPPA minimum)
  required
  style={S.input}
/>

VALIDATION in handleSubmit():
  const dob = new Date(form.dob)
  const age = (Date.now() - dob.getTime()) / (365.25 * 24 * 3600 * 1000)
  if (age < 13) {
    return setError('You must be at least 13 years old to create an account.')
  }
  // Store in Firestore: users/{uid}: { dob: form.dob, age: Math.floor(age), ageVerified: true }
  // age >= 18 unlocks: monetization (coin purchases, gifts, payouts)
  // age >= 13 and < 18: can stream, watch, chat — no monetization features
  // age < 13: rejected at signup

MONETIZATION GATE:
  In BuyCoinsPage.jsx, LiveWatchPage.jsx (gift button), LiveMonetizationPage.jsx:
  Check Firestore user.age >= 18 before showing monetary features
  If age < 18: replace with locked UI + "Available at 18+" message
```

### Gap 3.4 — Two-Factor Authentication (2FA) Enforcement
**Problem:** Settings UI references 2FA but no actual TOTP or SMS implementation exists.

**Implementation Plan:**

#### Step 3.4.1 — Firebase Multi-Factor Auth
**File to CREATE:** `ConnectHub-SPA/src/services/mfa-service.js`

```javascript
// Firebase MFA using TOTP (Time-based One-Time Password via Google Authenticator)
// Firebase supports: multiFactor(user).enroll(TOTPSecret, 'My Authenticator')

// METHODS:

// async enrollTOTP(user)
//   1. Generate TOTP secret: const secret = await TotpMultiFactorGenerator.generateSecret(session)
//   2. Return { qrCodeUrl, secret.secretKey } for display in UI
//   3. After user enters verification code:
//      const assertion = TotpMultiFactorGenerator.assertionForEnrollment(secret, verificationCode)
//      await multiFactor(user).enroll(assertion, 'Authenticator App')

// async unenrollTOTP(user)
//   const enrolledFactors = multiFactor(user).enrolledFactors
//   await multiFactor(user).unenroll(enrolledFactors[0])

// async handleMFAChallenge(resolver)
//   Used during sign-in when MFA is required
//   Prompt user for TOTP code
//   const assertion = TotpMultiFactorGenerator.assertionForSignIn(resolver.hints[0].uid, code)
//   await resolver.resolveSignIn(assertion)

// ALSO SUPPORT: SMS-based MFA as fallback
//   Using PhoneMultiFactorGenerator (same flow as phone auth)
```

#### Step 3.4.2 — Wire to Settings
**File to MODIFY:** `ConnectHub-SPA/src/pages/settings/AccountSecurityPages.jsx`

```
CURRENT: 2FA toggle exists in UI but does nothing

NEW: 
  On "Enable 2FA" toggle:
    1. Call mfaService.enrollTOTP(auth.currentUser)
    2. Show QR code modal (use qrcode.js library: npm install qrcode)
    3. User scans QR with Google Authenticator
    4. User enters 6-digit code to confirm enrollment
    5. On success: update Firestore users/{uid}: { mfaEnabled: true }
    6. Show "✅ Two-factor authentication enabled"
  
  On "Disable 2FA":
    1. Prompt for current TOTP code to confirm identity
    2. Call mfaService.unenrollTOTP()
    3. Update Firestore: { mfaEnabled: false }

CREATOR ENFORCEMENT (per spec: 2FA required for anyone with payout access):
  In WalletPage.jsx, before showing payout/withdraw UI:
    Check users/{uid}.mfaEnabled === true
    If false: show banner "2FA required for payouts. Enable in Settings → Security"
    Button: "Go to Security Settings →"
```

---

## SPRINT 4 — FEATURE COMPLETENESS

### Gap 4.1 — Privacy Selector on Go Live
**Problem:** No public/followers-only/private link privacy option in `LiveSetupPage.jsx`.

**Implementation Plan:**

**File to MODIFY:** `ConnectHub-SPA/src/pages/live/LiveSetupPage.jsx`

```
ADD below the Category/Tags grid row:

<div>
  <label style={{ color:'#94a3b8', fontSize:'12px', display:'block', marginBottom:'6px' }}>
    🔒 Stream Privacy
  </label>
  <div style={{ display:'flex', gap:'8px' }}>
    {['public','followers','private'].map(opt => (
      <button key={opt}
        onClick={() => setPrivacy(opt)}
        disabled={isStreaming}
        style={{
          flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
          background: privacy === opt ? 'linear-gradient(135deg,#6366f1,#818cf8)' : '#1e293b',
          color: privacy === opt ? 'white' : '#94a3b8',
          fontSize: '12px', fontWeight: 700, cursor: 'pointer'
        }}>
        {opt === 'public' ? '🌍 Public' : opt === 'followers' ? '👥 Followers' : '🔗 Private Link'}
      </button>
    ))}
  </div>
  {privacy === 'private' && (
    <div style={{ color:'#64748b', fontSize:'11px', marginTop:'6px' }}>
      Only people with the stream link can watch
    </div>
  )}
</div>

STATE: const [privacy, setPrivacy] = useState('public')  (add to existing state)

SAVE: Include privacy in Firestore stream doc and in backend /api/streaming/create body

ENFORCEMENT in LiveWatchPage.jsx:
  If stream.privacy === 'followers':
    Check if auth.currentUser is in streamer's followers list
    If not: show "This stream is for followers only" + Follow button
  If stream.privacy === 'private':
    Check if viewer has stream URL (they do by having the link) — allow access
    Optionally: set Firestore rule to only allow read if uid is in stream.allowedViewers[]
```

### Gap 4.2 — Front/Back Camera Toggle
**Problem:** No camera switch in `LiveSetupPage.jsx` for mobile broadcasters.

**File to MODIFY:** `ConnectHub-SPA/src/pages/live/LiveSetupPage.jsx`

```
ADD STATE: const [facingMode, setFacingMode] = useState('user')  // 'user' = front, 'environment' = back

ADD FUNCTION: async switchCamera()
  1. Stop existing tracks: videoPreviewRef.current.srcObject.getTracks().forEach(t => t.stop())
  2. Get new stream with opposite facingMode:
     const newStream = await navigator.mediaDevices.getUserMedia({
       video: { facingMode: facingMode === 'user' ? 'environment' : 'user' },
       audio: true
     })
  3. Update videoPreviewRef.current.srcObject = newStream
  4. If streaming: replace the WHIP publisher track:
     whipPublisher.pc.getSenders().find(s => s.track.kind === 'video').replaceTrack(newStream.getVideoTracks()[0])
  5. Toggle facingMode state

ADD BUTTON (overlaid on camera preview, bottom-left):
  <button onClick={switchCamera}
    disabled={isStarting || camGranted === false}
    style={{ 
      position:'absolute', bottom:'8px', left:'8px',
      background:'rgba(0,0,0,0.6)', border:'none', borderRadius:'8px',
      padding:'6px 10px', color:'white', fontSize:'18px', cursor:'pointer'
    }}>
    🔄
  </button>
  aria-label="Switch camera"

NOTE: Only show on mobile (detect via navigator.maxTouchPoints > 0)
```

### Gap 4.3 — @Mentions and Reply Threads in Chat
**Problem:** Chat is flat. No @mention parsing or reply thread support.

**File to MODIFY:** `ConnectHub-SPA/src/pages/live/LiveWatchPage.jsx`

```
PART A — @Mentions:

1. ADD parseMessage(text) utility:
   Regex: /(@\w+)/g
   Wrap each match in a styled <span>:
   <span style={{ color:'#818cf8', fontWeight:700 }}>{match}</span>

2. UPDATE chat message render:
   CURRENT: <span style={{ color:'#e2e8f0', fontSize:'12px' }}>{msg.text}</span>
   NEW: <span style={{ color:'#e2e8f0', fontSize:'12px' }}>{parseMessage(msg.text)}</span>

3. ADD @mention autocomplete in chat textarea:
   When user types '@', show a small dropdown of recent chatters:
   State: const [mentionSuggestions, setMentionSuggestions] = useState([])
   When typing after '@':
     Filter last 20 message senders from messages array by typed text
     Show max 5 suggestions in a popup above the input
     Click to insert: replace @typed with @username

4. NOTIFICATION: When message contains @{viewerUsername}:
   Show a subtle highlight on that message row for the mentioned user
   (Use auth.currentUser?.displayName to check if current user is mentioned)

PART B — Reply Threads:

DATA MODEL:
  Add optional field to stream message docs: replyToId, replyToUser, replyToText

1. ADD "Reply" button on each message (appears on hover/long-press):
   <button onClick={() => setReplyingTo({ id: msg.id, userName: msg.userName, text: msg.text })}
     style={{ background:'none', border:'none', color:'#475569', fontSize:'11px', cursor:'pointer' }}>
     ↩️
   </button>

2. ADD replyingTo state: const [replyingTo, setReplyingTo] = useState(null)

3. SHOW reply indicator above chat input when replying:
   {replyingTo && (
     <div style={{ background:'#1e293b', borderRadius:'8px', padding:'6px 10px', 
                   display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px' }}>
       <div style={{ flex:1 }}>
         <div style={{ color:'#64748b', fontSize:'10px' }}>Replying to {replyingTo.userName}</div>
         <div style={{ color:'#94a3b8', fontSize:'11px', overflow:'hidden', 
                       textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{replyingTo.text}</div>
       </div>
       <button onClick={() => setReplyingTo(null)} style={{ background:'none', border:'none', 
               color:'#475569', cursor:'pointer' }}>✕</button>
     </div>
   )}

4. INCLUDE in sendMessage():
   If replyingTo is set, add to Firestore doc: { replyToId, replyToUser, replyToText }
   Then clear replyingTo after send

5. SHOW reply context in message row:
   If msg.replyToId exists, show above message:
   <div style={{ borderLeft:'2px solid #334155', paddingLeft:'8px', marginBottom:'3px' }}>
     <div style={{ color:'#475569', fontSize:'10px' }}>↩️ {msg.replyToUser}: {msg.replyToText.slice(0,50)}...</div>
   </div>
```

### Gap 4.4 — Appointing External Moderators
**Problem:** Creator can ban/slow mode from LiveModerationPage but cannot give moderator role to another user.

**File to MODIFY:** `ConnectHub-SPA/src/pages/live/LiveModerationPage.jsx`

```
DATA MODEL:
  Add to Firestore stream doc: moderators: string[]  (array of user UIDs)

ADD UI SECTION — "Moderators" tab in LiveModerationPage:

1. ADD TAB: 4th tab "👮 Mods" alongside existing controls

2. MOD MANAGEMENT UI:
   - List current moderators from stream.moderators[]
   - For each: show username, [Remove Mod] button
   - "Add Moderator" input: enter username or UID
     Search Firestore users collection by displayName
     Select from dropdown → add to stream.moderators array via updateDoc
   
3. ALTERNATIVE (simpler): "Make Mod" button on each chat message row:
   <button onClick={() => appointMod(msg.uid, msg.userName)}>👮 Mod</button>
   
   appointMod(uid, name):
     await updateDoc(doc(db,'streams',streamId), { moderators: arrayUnion(uid) })
     showToast(`👮 ${name} is now a moderator`)

4. MOD PERMISSIONS CHECK in LiveModerationPage:
   Change: const isStreamer = stream?.uid === uid
   To:     const canModerate = stream?.uid === uid || stream?.moderators?.includes(uid)
   Use canModerate to gate all mod actions (ban, slow mode, delete, word filter)

5. SHOW MOD BADGE in chat:
   If msg.uid is in stream.moderators[] → show 🛡️ badge next to username
   (similar to existing ⭐ subscriber badge logic)

6. FIRESTORE RULES:
   Allow write to streams/{id} if uid in stream.moderators[] for limited fields:
   allow update: if request.auth.uid in resource.data.moderators 
                    && request.resource.data.diff(resource.data).affectedKeys()
                       .hasOnly(['bannedUsers', 'blockedWords', 'slowMode'])
```

### Gap 4.5 — Live Auto-Captions / Closed Captions
**Problem:** Accessibility requirement in spec. Not implemented anywhere.

**Solution: Web Speech API (browser-native, free) for web; Mux caption tracks for VOD**

**Implementation Plan:**

#### Step 4.5.1 — Live Captions via Web Speech API
**File to CREATE:** `ConnectHub-SPA/src/services/captions-service.js`

```javascript
// PURPOSE: Real-time speech-to-text captions for live streams (viewer side)
// Uses: SpeechRecognition API (Chrome/Edge only), with graceful fallback

// SUPPORT:
//   Chrome/Edge: ✅ Full support
//   Safari (iOS 16+): ✅ Partial support
//   Firefox: ❌ Not supported → show "Captions not supported in Firefox" message

// CLASS: CaptionsService

// METHOD: start(onCaption)
//   const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
//   if (!SpeechRecognition) { onCaption({ error: 'not_supported' }); return }
//   
//   recognition = new SpeechRecognition()
//   recognition.continuous = true
//   recognition.interimResults = true
//   recognition.lang = 'en-US'
//   recognition.onresult = (event) => {
//     const transcript = Array.from(event.results)
//       .map(r => r[0].transcript).join('')
//     onCaption({ text: transcript, final: event.results[event.results.length-1].isFinal })
//   }
//   recognition.start()
//
//   NOTE: Web Speech API captures from the device microphone, not the stream audio.
//   For viewer-side captions of stream audio: this approach requires audio to be playing
//   through speakers/headphones and mic picking it up (not ideal but workable for MVP)
//   Production improvement: use AssemblyAI or Deepgram streaming STT API on the audio stream

// METHOD: stop()
//   recognition.stop()

// PRODUCTION NOTE (upgrade path):
//   Replace with AssemblyAI real-time API:
//   - Pipe HLS audio chunks via Web Audio API → AssemblyAI WebSocket
//   - Cost: ~$0.0015/second of audio
//   - Much more accurate, works on any browser
```

#### Step 4.5.2 — Captions UI in LiveWatchPage
**File to MODIFY:** `ConnectHub-SPA/src/pages/live/LiveWatchPage.jsx`

```
ADD STATE:
  const [captionsEnabled, setCaptionsEnabled] = useState(false)
  const [captionText, setCaptionText] = useState('')
  const captionsServiceRef = useRef(null)

ADD BUTTON in video player controls area (near quality selector):
  <button onClick={() => {
    if (captionsEnabled) {
      captionsServiceRef.current?.stop()
      setCaptionsEnabled(false)
      setCaptionText('')
    } else {
      captionsServiceRef.current = new CaptionsService()
      captionsServiceRef.current.start(({ text, error }) => {
        if (error === 'not_supported') { showToast('Captions not supported in this browser'); return }
        setCaptionText(text)
      })
      setCaptionsEnabled(true)
    }
  }} style={{ 
    background: captionsEnabled ? 'rgba(99,102,241,0.8)' : 'rgba(0,0,0,0.7)',
    border:'none', borderRadius:'6px', padding:'4px 8px', color:'white', 
    fontSize:'11px', fontWeight:700, cursor:'pointer'
  }}>
    CC
  </button>

ADD CAPTION DISPLAY OVERLAY (above chat, over video bottom edge):
  {captionsEnabled && captionText && (
    <div style={{
      position:'absolute', bottom:'12px', left:'50%', transform:'translateX(-50%)',
      background:'rgba(0,0,0,0.85)', color:'white', fontSize:'14px', fontWeight:600,
      borderRadius:'8px', padding:'6px 16px', maxWidth:'80%', textAlign:'center',
      lineHeight:'1.4', zIndex:20, pointerEvents:'none'
    }}>
      {captionText}
    </div>
  )}

ADD cleanup in useEffect return:
  return () => { captionsServiceRef.current?.stop() }
```

### Gap 4.6 — "Creator Went Live" Push Notification Trigger
**Problem:** OneSignal is configured but the actual Firebase Cloud Function to trigger push when a creator starts a live stream is not wired.

**File to MODIFY:** `ConnectHub-SPA/functions/index.js`

```javascript
// ADD THIS FUNCTION to the existing Cloud Functions file:

exports.onStreamGoLive = functions.firestore
  .document('streams/{streamId}')
  .onWrite(async (change, context) => {
    const before = change.before.data()
    const after = change.after.data()
    
    // Only trigger when status transitions to 'active' (from Mux webhook)
    if (before?.status === after?.status) return null
    if (after?.status !== 'active') return null
    
    const creatorUid = after.uid
    const streamTitle = after.title || 'Live Stream'
    const streamId = context.params.streamId
    
    // Get creator's follower list from Firestore
    const creatorDoc = await admin.firestore().doc(`users/${creatorUid}`).get()
    const followers = creatorDoc.data()?.followers || []
    
    if (followers.length === 0) return null
    
    // Get OneSignal player IDs for all followers
    // Followers need a 'oneSignalPlayerId' field in their user doc
    const followerDocs = await Promise.all(
      followers.slice(0, 2000).map(uid =>  // OneSignal limit per batch
        admin.firestore().doc(`users/${uid}`).get()
      )
    )
    
    const playerIds = followerDocs
      .map(doc => doc.data()?.oneSignalPlayerId)
      .filter(Boolean)
    
    if (playerIds.length === 0) return null
    
    // Send OneSignal push notification
    const creatorName = after.userName || 'A creator'
    await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`
      },
      body: JSON.stringify({
        app_id: process.env.ONESIGNAL_APP_ID,
        include_player_ids: playerIds,
        headings: { en: `🔴 ${creatorName} is LIVE` },
        contents: { en: streamTitle },
        data: { streamId, type: 'creator_went_live' },
        ios_category: 'LIVE_STREAM',
        android_channel_id: 'live-streams'
      })
    })
    
    return null
  })

// ALSO ADD: Save OneSignalPlayerId to user doc on app load
// In ConnectHub-SPA/src/services/mobile-platform-service.js:
//   After OneSignal.init(), subscribe to OneSignal.getDeviceState()
//   Save userId to Firestore users/{uid}/oneSignalPlayerId
```

### Gap 4.7 — Follower-Only Chat Mode
**Problem:** Subscriber-only chat exists. Follower-only mode is separate and missing.

**File to MODIFY:** `ConnectHub-SPA/src/pages/live/LiveModerationPage.jsx`

```
ADD alongside existing subscriberOnly toggle:

// STATE: const [followerOnly, setFollowerOnly] = useState(false)
// Load from stream: setFollowerOnly(data.followerOnlyChat || false)

// TOGGLE UI (identical style to subscriberOnly toggle already there):
<div style={{ display:'flex', alignItems:'center', gap:'10px', 
              background:'#1e293b', borderRadius:'10px', padding:'10px 12px' }}>
  <div style={{ flex:1 }}>
    <div style={{ color:'#f1f5f9', fontSize:'13px', fontWeight:700 }}>👥 Followers Only</div>
    <div style={{ color:'#64748b', fontSize:'11px' }}>Only your followers can chat</div>
  </div>
  <button onClick={toggleFollowerOnly} disabled={togglingFollower}
    style={{ background: followerOnly ? '#22c55e' : '#334155', border:'none', 
             borderRadius:'20px', width:'40px', height:'22px', cursor:'pointer', position:'relative' }}>
    <div style={{ position:'absolute', top:'3px', 
                  left: followerOnly ? '20px' : '4px', width:'16px', height:'16px',
                  borderRadius:'50%', background:'white', transition:'left 0.2s' }} />
  </button>
</div>

// toggleFollowerOnly():
//   await updateDoc(doc(db,'streams',streamId), { followerOnlyChat: !followerOnly })
//   showToast(!followerOnly ? '👥 Follower-only chat enabled' : '🔓 Chat open to all')
```

**File to MODIFY:** `ConnectHub-SPA/src/pages/live/LiveWatchPage.jsx`  
```
UPDATE sendMessage() to check followerOnly:
  if (stream?.followerOnlyChat && !followingIds.has(stream.uid)) {
    showToast('👥 This chat is for followers only'); return;
  }

UPDATE chat input placeholder:
  stream.followerOnlyChat && !followingIds.has(stream.uid) 
    ? '👥 Followers only'
    : stream.subscriberOnlyChat && !followingIds.has(stream.uid)
    ? '🔒 Subscribers only'
    : 'Say something…'

UPDATE chat label:
  💬 Live Chat 
  {stream.subscriberOnlyChat && <span>🔒</span>}
  {stream.followerOnlyChat && !stream.subscriberOnlyChat && <span>👥</span>}
```

### Gap 4.8 — Admin: Force-End a Live Stream
**Problem:** Admin dashboard has no way to force-terminate a live stream.

**File to MODIFY:** `ConnectHub-SPA/src/pages/admin/AdminDashboardPage.jsx`

```
ADD in the "More" admin tab or create a new "Streams" tab:

1. ACTIVE STREAMS LIST:
   Pull from Firestore: query(collection(db,'streams'), where('status','==','active'))
   Display each stream: creator name, title, viewer count, duration, [Force End] button

2. FORCE END BUTTON action:
   const forceEndStream = async (stream) => {
     if (!confirm(`Force end "${stream.title}" by ${stream.userName}?`)) return
     
     // Step 1: Update Firestore
     await updateDoc(doc(db,'streams',stream.id), {
       status: 'ended',
       endedAt: serverTimestamp(),
       endedBy: 'admin',
       endReason: 'admin_force_end'
     })
     
     // Step 2: Call backend to close Mux stream (if muxStreamId exists)
     if (stream.muxStreamId) {
       await apiClient.post('/api/streaming/end', { muxStreamId: stream.muxStreamId })
     }
     
     showToast(`Stream "${stream.title}" has been ended`)
   }

3. ADD admin audit log:
   Write to Firestore adminActions/{auto-id}:
   { action: 'force_end_stream', streamId, adminUid: auth.currentUser.uid, 
     timestamp: serverTimestamp(), reason }
```

### Gap 4.9 — Theater Mode on Web
**Problem:** Spec §3.3 requires theater mode (wide video, hidden sidebar) on web.

**File to MODIFY:** `ConnectHub-SPA/src/pages/live/LiveWatchPage.jsx`

```
ADD STATE: const [theaterMode, setTheaterMode] = useState(false)

ADD BUTTON near fullscreen button in video controls:
  <button onClick={() => setTheaterMode(v => !v)}
    aria-label={theaterMode ? 'Exit theater mode' : 'Theater mode'}
    style={{ background: theaterMode ? 'rgba(99,102,241,0.8)' : 'rgba(0,0,0,0.7)',
             border:'none', borderRadius:'6px', padding:'4px 8px',
             color:'white', fontSize:'11px', cursor:'pointer', fontWeight:700 }}>
    🎭
  </button>

LAYOUT CHANGE when theaterMode === true:
  Wrap the entire page in a conditional:
  
  theaterMode:
    Video takes: width 100vw, max-height 70vh (vs current maxHeight:240px)
    Chat panel: horizontal strip below video (not sidebar)
    All other sections (polls, gifts, etc.): collapse into expandable drawer
    Background: solid black (#000) for immersive feel
  
  NOT theaterMode (current layout):
    No change from current behavior
  
  ADD CSS class toggle approach:
    <div className={theaterMode ? 'theater-layout' : 'standard-layout'}>
    
  In ConnectHub-SPA/src/styles/global.css, add:
  .theater-layout video { max-height: 70vh !important; }
  .theater-layout .chat-panel { max-height: 30vh; }
```

---

## TESTING PLAN (Per Sprint)

### Sprint 1 Testing
```
Test 1.1 — Stream Creation:
  ✓ Creator clicks Go Live → backend creates Mux stream → returns credentials
  ✓ Firestore stream doc shows muxStreamId and playbackUrl
  ✓ Stream key never appears in Firestore (server-side only)
  
Test 1.2 — Mobile Broadcasting:
  ✓ WHIP publisher connects to Mux endpoint
  ✓ Camera preview shows local video
  ✓ Mux webhook fires video.live_stream.active within 10 seconds
  ✓ Firestore stream status updates to 'active'
  
Test 1.3 — Viewer Playback:
  ✓ LiveWatchPage loads HLS stream from playbackUrl
  ✓ Stream plays in under 4 seconds on broadband
  ✓ Quality selector switches HLS renditions
  ✓ PiP continues playing when app is backgrounded

Test 1.4 — VOD:
  ✓ After stream ends, Mux fires video.asset.ready webhook
  ✓ Firestore stream doc gets vodPlaybackUrl
  ✓ LiveVODPage plays the VOD correctly
  
Test 1.5 — OBS / Desktop:
  ✓ Credentials panel shows RTMP URL and stream key
  ✓ Copy buttons work
  ✓ OBS connection activates the stream (status: idle → active)
```

### Sprint 2 Testing
```
Test 2.1 — Stripe Onboarding:
  ✓ New creator: "Connect Stripe" button redirects to Stripe hosted page
  ✓ After onboarding: stripeAccountId saved in Firestore
  ✓ Wallet shows "Connected" status

Test 2.2 — Withdrawal:
  ✓ Amount validation: rejects < $10, rejects > available balance
  ✓ Real Stripe transfer created
  ✓ Balance updates in wallet after transfer

Test 2.3 — Coin Purchase:
  ✓ Package selection → Stripe payment intent created
  ✓ Successful payment → coinBalance increases in Firestore
  ✓ Failed payment → shows specific error

Test 2.4 — Gift Send:
  ✓ Insufficient coins → shows "Buy Coins" prompt
  ✓ Sufficient coins → deducts from viewer, credits creator pending earnings
  ✓ Transaction recorded for both parties
```

### Sprint 3 Testing
```
Test 3.1 — Apple Sign-In:
  ✓ Button visible on iOS Safari and iOS Capacitor app
  ✓ Sign-in creates user doc in Firestore if first time
  ✓ Existing Apple account → logs in correctly

Test 3.2 — Phone Auth:
  ✓ SMS sent within 10 seconds
  ✓ OTP verification succeeds
  ✓ Resend code after 60s countdown

Test 3.3 — DOB:
  ✓ Under-13 rejected with clear message
  ✓ 13-17: account created, monetization features hidden
  ✓ 18+: all features accessible
  ✓ DOB stored in Firestore

Test 3.4 — 2FA:
  ✓ QR code generated correctly
  ✓ Google Authenticator can scan it
  ✓ 6-digit code verified on enrollment
  ✓ Payout blocked when 2FA not enabled (shows prompt)
  ✓ Sign-in with MFA: second factor prompted
```

### Sprint 4 Testing
```
Test 4.1 — Privacy: Stream created as followers-only → public viewer sees "Followers only" gate
Test 4.2 — Camera toggle: Tap 🔄 → camera switches front/back within 2 seconds
Test 4.3 — @Mentions: Type @username → autocomplete shows → selection inserts → highlighted in chat
Test 4.4 — Reply: Tap reply on message → reply context shown → sent message shows quote
Test 4.5 — External Mods: Creator appoints mod → mod can ban/slow mode → cannot change privacy
Test 4.6 — Captions: CC button enables → speech recognized → text overlaid on video
Test 4.7 — "Went Live" push: Creator goes live → followers receive push within 30 seconds
Test 4.8 — Admin force-end: Admin clicks Force End → stream terminates → Mux stream closed
Test 4.9 — Theater mode: 🎭 button → video expands to 70vh → chat moves below → 🎭 again returns normal
```

---

## FILES CREATED (New)
| File | Sprint | Purpose |
|---|---|---|
| `ConnectHub-Backend/src/services/mux-service.ts` | 1 | Mux API wrapper |
| `ConnectHub-Backend/src/routes/streaming.ts` | 1 | Streaming endpoints |
| `ConnectHub-SPA/src/services/whip-publisher.js` | 1 | WebRTC WHIP for mobile broadcasting |
| `ConnectHub-Backend/src/services/stripe-connect-service.ts` | 2 | Stripe Connect wrapper |
| `ConnectHub-Backend/src/routes/wallet.ts` | 2 | Wallet/payout endpoints |
| `ConnectHub-SPA/src/pages/wallet/BuyCoinsPage.jsx` | 2 | Coin purchase UI |
| `ConnectHub-SPA/src/pages/auth/PhoneAuthPage.jsx` | 3 | Phone number auth |
| `ConnectHub-SPA/src/services/mfa-service.js` | 3 | TOTP 2FA service |
| `ConnectHub-SPA/src/services/captions-service.js` | 4 | Web Speech API captions |

## FILES MODIFIED (Existing)
| File | Sprint | Changes |
|---|---|---|
| `ConnectHub-SPA/src/services/livestream-webrtc.js` | 1 | Full rewrite: stub → Mux API client |
| `ConnectHub-SPA/src/pages/live/LiveSetupPage.jsx` | 1, 4 | Mux creds UI, camera toggle, privacy selector |
| `ConnectHub-SPA/src/pages/live/LiveWatchPage.jsx` | 1, 4 | Use playbackUrl, LL-HLS, theater mode, captions, follower-only chat, @mentions, reply threads |
| `ConnectHub-SPA/src/pages/live/LiveModerationPage.jsx` | 4 | External mods, follower-only toggle |
| `ConnectHub-SPA/src/pages/wallet/WalletPage.jsx` | 2 | Remove mock data, Stripe Connect, real balance |
| `ConnectHub-SPA/src/pages/auth/LoginPage.jsx` | 3 | Apple Sign-In button |
| `ConnectHub-SPA/src/pages/auth/SignupPage.jsx` | 3 | Apple Sign-In, DOB field, validation |
| `ConnectHub-SPA/src/pages/settings/AccountSecurityPages.jsx` | 3 | Wire real 2FA enrollment |
| `ConnectHub-SPA/src/pages/admin/AdminDashboardPage.jsx` | 4 | Force-end stream, active streams list |
| `ConnectHub-SPA/functions/index.js` | 4 | onStreamGoLive Cloud Function |
| `ConnectHub-SPA/src/App.jsx` | 2, 3 | Add routes: /wallet/buy-coins, /auth/phone |

## ENVIRONMENT VARIABLES NEEDED
```
ConnectHub-Backend/.env (ADD):
  MUX_TOKEN_ID=xxx
  MUX_TOKEN_SECRET=xxx
  MUX_WEBHOOK_SIGNING_SECRET=xxx
  STRIPE_SECRET_KEY=sk_live_xxx
  STRIPE_WEBHOOK_SECRET=whsec_xxx
  STRIPE_CONNECT_WEBHOOK_SECRET=whsec_xxx

ConnectHub-SPA/.env (ADD):
  VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
  VITE_MUX_ENV_KEY=xxx  (for Mux Data analytics, optional)

ConnectHub-SPA/functions/.env (ADD via Firebase CLI):
  ONESIGNAL_REST_API_KEY=xxx
  ONESIGNAL_APP_ID=xxx
```

---

## ESTIMATED TOTAL EFFORT (No Changes Made Yet)

| Sprint | Work Items | Estimated Dev Time |
|---|---|---|
| Sprint 1 — Video Pipeline | 8 implementation steps, 5 test cases | 2–3 weeks |
| Sprint 2 — Monetization | 4 implementation steps, 4 test cases | 1–2 weeks |
| Sprint 3 — Auth & Compliance | 4 implementation steps, 4 test cases | 1 week |
| Sprint 4 — Feature Complete | 9 implementation steps, 9 test cases | 1–2 weeks |
| **TOTAL** | **25 implementation steps** | **5–8 weeks** |

---

## DECISION NEEDED FROM TEAM BEFORE STARTING

1. **Mux or alternative CDN?** — Mux recommended. Cloudflare Stream is cheaper at scale. AWS IVS requires more custom work.
2. **Stripe Connect: Standard or Express accounts?** — Express recommended (faster onboarding for creators, Stripe handles compliance).
3. **Captions: Web Speech API (free/MVP) or Deepgram/AssemblyAI (~$0.0015/sec)?** — Start with Web Speech, upgrade later.
4. **Sprint order confirmed?** — Video pipeline must be Sprint 1. Sprints 2-4 can run in parallel if team is large enough.
5. **Apple Developer Account:** Does team have one? Required for Apple Sign-In + iOS App Store.

---

*This document is observation and planning only. No files have been created or modified.*  
*Approved by: _________________ Date: _________________*
