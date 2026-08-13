# 🖥️ Live Streaming — New Screens, Missing Pages & Admin Monitoring Design
**Prepared by:** Senior App Developer  
**Date:** August 13, 2026  
**Status:** DESIGN ONLY — No code changes made  
**Depends on:** LIVE-STREAMING-GAP-FIX-MASTER-PLAN.md

---

## PART 1 — COMPLETE SCREEN INVENTORY AUDIT

### What the Gap Fix Plan Needs vs. What Exists

Below is every screen/page touched by the 4-sprint plan, marked as EXISTS, NEEDS MODIFICATION, or NEEDS TO BE CREATED FROM SCRATCH.

---

### SPRINT 1 — Video Pipeline Screens

| Screen | File | Status | Action Needed |
|---|---|---|---|
| Go Live Setup | `LiveSetupPage.jsx` | ✅ EXISTS | MODIFY — add RTMP credentials panel, OBS UI, WHIP status |
| Live Watch (viewer) | `LiveWatchPage.jsx` | ✅ EXISTS | MODIFY — swap streamUrl → playbackUrl, theater mode, CC button |
| VOD Playback | `LiveVODPage.jsx` | ✅ EXISTS | MODIFY — swap streamUrl → vodPlaybackUrl |
| Live Discovery Feed | `LivePage.jsx` | ✅ EXISTS | No changes needed for Sprint 1 |
| Live Analytics | `LiveAnalyticsPage.jsx` | ✅ EXISTS | No changes needed for Sprint 1 |

**Sprint 1 Verdict: All screens exist. No new pages needed. Modifications only.**

---

### SPRINT 2 — Monetization Screens

| Screen | File | Status | Action Needed |
|---|---|---|---|
| Wallet / Earnings | `WalletPage.jsx` | ✅ EXISTS | MODIFY — remove mock data, add Stripe Connect section |
| Buy Coins | `BuyCoinsPage.jsx` | ❌ DOES NOT EXIST | **CREATE NEW — full design below (Section 2A)** |
| Live Watch — Gift Send | `LiveWatchPage.jsx` | ✅ EXISTS | MODIFY — wire coin deduction logic |
| Live Monetization | `LiveMonetizationPage.jsx` | ✅ EXISTS | MODIFY — add age gate check |
| Stripe Connect Return | No page exists | ❌ DOES NOT EXIST | **CREATE NEW — StripeConnectReturnPage (Section 2B)** |

**Sprint 2 Verdict: 2 new pages needed. WalletPage and LiveWatchPage need modifications.**

---

### SPRINT 3 — Auth & Compliance Screens

| Screen | File | Status | Action Needed |
|---|---|---|---|
| Login | `LoginPage.jsx` | ✅ EXISTS | MODIFY — add Apple Sign-In button |
| Sign Up | `SignupPage.jsx` | ✅ EXISTS | MODIFY — add Apple button, DOB field |
| Phone Auth | `PhoneAuthPage.jsx` | ❌ DOES NOT EXIST | **CREATE NEW — full design below (Section 2C)** |
| Verify Email | `VerifyEmailPage.jsx` | ✅ EXISTS | No changes |
| Account Security Settings | `AccountSecurityPages.jsx` | ✅ EXISTS | MODIFY — wire real 2FA enrollment |
| 2FA Setup Modal | No modal component | ❌ DOES NOT EXIST | **CREATE NEW — 2FA Setup Modal (Section 2D)** |

**Sprint 3 Verdict: 1 new page + 1 new modal component needed.**

---

### SPRINT 4 — Feature Completeness Screens

| Screen | File | Status | Action Needed |
|---|---|---|---|
| Live Watch | `LiveWatchPage.jsx` | ✅ EXISTS | MODIFY — @mentions, replies, captions, follower-only, theater mode |
| Live Moderation | `LiveModerationPage.jsx` | ✅ EXISTS | MODIFY — external mod tab, follower-only toggle |
| Live Setup | `LiveSetupPage.jsx` | ✅ EXISTS | MODIFY — privacy selector, camera toggle |
| Live Notifications | `LiveNotificationsPage.jsx` | ✅ EXISTS | No changes |
| Admin Dashboard | `AdminDashboardPage.jsx` | ✅ EXISTS | MODIFY — add Streams tab with force-end |
| Admin Streams Monitor | No page exists | ❌ DOES NOT EXIST | **CREATE NEW — AdminStreamsMonitorPage (Section 3)** |
| Admin Payout Approvals | No page exists | ❌ DOES NOT EXIST | **CREATE NEW — AdminPayoutsPage (Section 2E)** |
| Stream Privacy Gate | No component exists | ❌ DOES NOT EXIST | **CREATE NEW — StreamPrivacyGate component (Section 2F)** |

**Sprint 4 Verdict: 2 new pages + 1 new component needed.**

---

## COMPLETE LIST OF NEW FILES TO CREATE

| # | File Path | Type | Sprint |
|---|---|---|---|
| 1 | `ConnectHub-SPA/src/pages/wallet/BuyCoinsPage.jsx` | Full Page | 2 |
| 2 | `ConnectHub-SPA/src/pages/wallet/StripeConnectReturnPage.jsx` | Full Page | 2 |
| 3 | `ConnectHub-SPA/src/pages/auth/PhoneAuthPage.jsx` | Full Page | 3 |
| 4 | `ConnectHub-SPA/src/components/common/TwoFactorSetupModal.jsx` | Modal Component | 3 |
| 5 | `ConnectHub-SPA/src/pages/admin/AdminStreamsMonitorPage.jsx` | Full Page | 4 |
| 6 | `ConnectHub-SPA/src/pages/admin/AdminPayoutsPage.jsx` | Full Page | 2+4 |
| 7 | `ConnectHub-SPA/src/components/live/StreamPrivacyGate.jsx` | Gate Component | 4 |

---

## PART 2 — DETAILED DESIGN FOR EACH NEW SCREEN

---

### 2A — BuyCoinsPage.jsx
**Route:** `/wallet/buy-coins`  
**Access:** Any authenticated user age 18+ (age gate enforced)  
**Purpose:** Let viewers purchase virtual coins used to send gifts during live streams

```
═══════════════════════════════════════════════════════
SCREEN: BUY COINS                          [← Back]
═══════════════════════════════════════════════════════

HEADER SECTION
─────────────────────────────────────────────────────
  🪙  Buy Coins
  "Support your favorite creators live"

  Current Balance: [  🪙 250 coins  ]
  (pulled from Firestore users/{uid}/coinBalance, live-updating)

─────────────────────────────────────────────────────
PACKAGE SELECTION GRID (2x2)
─────────────────────────────────────────────────────

  ┌─────────────────┐  ┌─────────────────┐
  │   🪙 100 Coins  │  │   🪙 500 Coins  │
  │                 │  │   ★ BEST VALUE  │
  │     $0.99       │  │     $4.99       │
  │                 │  │  ($0.01/coin)   │
  │  [  Select  ]   │  │  [  Select  ]   │
  └─────────────────┘  └─────────────────┘

  ┌─────────────────┐  ┌─────────────────┐
  │  🪙 1200 Coins  │  │  🪙 3500 Coins  │
  │                 │  │   🔥 POPULAR    │
  │     $9.99       │  │     $24.99      │
  │  ($0.008/coin)  │  │  ($0.007/coin)  │
  │  [  Select  ]   │  │  [  Select  ]   │
  └─────────────────┘  └─────────────────┘

  Selected package highlighted with:
  border: 2px solid #6366f1
  background: rgba(99,102,241,0.1)
  Checkmark ✓ in top-right corner of selected card

─────────────────────────────────────────────────────
ORDER SUMMARY (appears after package selected)
─────────────────────────────────────────────────────
  Package:    500 Coins
  Price:      $4.99
  You receive: 500 🪙 coins added to your balance

  ─────────────
  PAYMENT SECTION (Stripe Elements)
  ─────────────
  [Card Number:  ____ ____ ____ ____  ]
  [MM/YY:  __ / __  ] [ CVC: ___  ]
  [ZIP: _____ ]

  (Stripe Elements renders these fields — PCI compliant)

  ──────────────────────────────────────────
  [ 💳  Buy 500 Coins — $4.99 ]   ← Purple gradient button
  ──────────────────────────────────────────
  
  🔒 Secure payment by Stripe
  Coins are added instantly after payment
  
  "By purchasing, you agree to our Terms of Service"

─────────────────────────────────────────────────────
SUCCESS STATE (after payment confirmed)
─────────────────────────────────────────────────────
  ✅ Success!  Full-screen overlay with:
  
  Confetti animation (reuse existing confetti utility)
  
  "🪙 500 Coins Added!"
  New Balance: 750 coins
  
  [  Go Back to Stream  ]  [  Keep Shopping  ]

─────────────────────────────────────────────────────
LOADING STATE
─────────────────────────────────────────────────────
  Skeleton cards in 2x2 grid while coinBalance loads
  Spinning indicator on "Buy" button during Stripe confirm

─────────────────────────────────────────────────────
ERROR STATE
─────────────────────────────────────────────────────
  Red toast/banner: specific Stripe error message
  Examples: "Card declined", "Insufficient funds", "Invalid card number"

─────────────────────────────────────────────────────
AGE GATE (shown if user.age < 18)
─────────────────────────────────────────────────────
  🔒 icon centered
  "Purchasing coins is available at age 18+"
  "Your account age: 16 years old"
  
  [  Go Back  ]

═══════════════════════════════════════════════════════
DESIGN SPEC
  Background: linear-gradient(135deg,#0f0c29,#302b63,#24243e)  (same as WalletPage)
  Cards: background rgba(255,255,255,0.06), border 1px solid rgba(255,255,255,0.1), borderRadius 20
  Selected card border: 2px solid #6366f1
  Primary button: linear-gradient(135deg,#6366f1,#ec4899), full width, borderRadius 16
  Font colors: heading #f1f5f9, secondary #94a3b8, price #f1f5f9 bold
  Coin icon: 🪙 emoji or custom SVG gold coin
═══════════════════════════════════════════════════════
```

---

### 2B — StripeConnectReturnPage.jsx
**Route:** `/wallet/connect/return`  
**Access:** Creator returning from Stripe onboarding  
**Purpose:** Handle the return URL after Stripe Connect onboarding completes

```
═══════════════════════════════════════════════════════
SCREEN: STRIPE CONNECT RETURN
═══════════════════════════════════════════════════════

This is a transitional page (displays for 2-3 seconds then redirects)

─────────────────────────────────────────────────────
STATE A — Checking status (default on load):
─────────────────────────────────────────────────────
  [Spinning loader]
  "Verifying your bank account connection..."
  
  (On mount: call GET /api/wallet/connect/status → check payoutsEnabled)

─────────────────────────────────────────────────────
STATE B — Success (payoutsEnabled: true):
─────────────────────────────────────────────────────
  ✅ Large green checkmark animation
  
  "Bank Account Connected!"
  "You're now set up to receive creator payouts."
  
  [  Go to Wallet  ]
  
  Auto-redirects to /wallet after 3 seconds

─────────────────────────────────────────────────────
STATE C — Incomplete (payoutsEnabled: false, needs more info):
─────────────────────────────────────────────────────
  ⚠️ Yellow warning icon
  
  "Additional Verification Required"
  "Stripe needs more information to enable payouts."
  
  [  Continue Verification  ]  → calls /api/wallet/connect/start again → new link
  [  Do This Later  ]  → navigate to /wallet
  
  Note: Shows if creator closed Stripe midway without completing

─────────────────────────────────────────────────────
STATE D — Error:
─────────────────────────────────────────────────────
  ❌ Red icon
  
  "Connection Failed"
  "Something went wrong. Please try again."
  
  [  Try Again  ]  [  Contact Support  ]

═══════════════════════════════════════════════════════
DESIGN SPEC
  Background: dark radial (#0a0a18)
  Center-aligned, vertically centered content
  Icon size: 80px
  Same font/color system as rest of app
═══════════════════════════════════════════════════════
```

---

### 2C — PhoneAuthPage.jsx
**Route:** `/auth/phone`  
**Access:** Unauthenticated users  
**Purpose:** Sign in or sign up with phone number + SMS OTP

```
═══════════════════════════════════════════════════════
SCREEN: PHONE SIGN-IN                      [← Back]
═══════════════════════════════════════════════════════

LOGO / HEADER (same as LoginPage)
  LynkApp logo
  "Sign in with Phone"
  "We'll text you a verification code"

─────────────────────────────────────────────────────
STEP 1 — ENTER PHONE NUMBER
─────────────────────────────────────────────────────

  ┌──────────────────────────────────────────────────┐
  │  Country Code Selector                           │
  │  ┌───────┐  ┌──────────────────────────────────┐ │
  │  │ 🇺🇸+1 ▼│  │   Phone number                  │ │
  │  └───────┘  └──────────────────────────────────┘ │
  └──────────────────────────────────────────────────┘

  Country code dropdown options (most common first):
    🇺🇸 United States (+1)
    🇬🇧 United Kingdom (+44)
    🇨🇦 Canada (+1)
    🇦🇺 Australia (+61)
    🇮🇳 India (+91)
    🇩🇪 Germany (+49)
    🇫🇷 France (+33)
    🇯🇵 Japan (+81)
    🇧🇷 Brazil (+55)
    [+ 200 more...]

  [ Send Verification Code ]  ← Full-width purple button

  Invisible reCAPTCHA widget (id="recaptcha-container")
  
  Fine print:
  "Standard SMS rates may apply"
  "By continuing, you agree to our Terms of Service"

─────────────────────────────────────────────────────
STEP 2 — ENTER OTP CODE (shown after Send Code success)
─────────────────────────────────────────────────────

  "Enter the 6-digit code sent to"
  "+1 (555) 123-4567"   ← show masked phone number

  OTP Input (6 individual boxes):
  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐
  │ _ │ │ _ │ │ _ │ │ _ │ │ _ │ │ _ │
  └───┘ └───┘ └───┘ └───┘ └───┘ └───┘

  Auto-focus advances box on digit entry
  Auto-submit when 6th digit entered
  Paste support: split pasted 6-digit string across boxes

  [ Verify Code ]  ← Disabled until 6 digits entered, then enabled

  Countdown timer:
  "Resend code in  0:47"
  After countdown → "Resend Code" clickable link

─────────────────────────────────────────────────────
ERROR STATES
─────────────────────────────────────────────────────
  Step 1 errors:
    "Please enter a valid phone number"
    "Too many attempts. Try again in 10 minutes."

  Step 2 errors:
    "Incorrect code. 2 attempts remaining."
    "Code expired. Request a new one."

─────────────────────────────────────────────────────
LOADING STATES
─────────────────────────────────────────────────────
  Button shows spinner when sending/verifying
  Button text: "Sending..." / "Verifying..."
  All inputs disabled during API call

═══════════════════════════════════════════════════════
DESIGN SPEC
  Matches LoginPage and SignupPage style exactly:
  Background: linear-gradient(135deg,#0a0a18,#1a0a2e)
  Card: rgba(255,255,255,0.04), border 1px solid rgba(255,255,255,0.08), borderRadius 24
  Inputs: rgba(255,255,255,0.06) background, 12px border-radius
  OTP boxes: 48x56px each, 8px gap, 1px border rgba(255,255,255,0.15)
    Active box: border-color #6366f1, box-shadow 0 0 0 2px rgba(99,102,241,0.3)
  Button: linear-gradient(135deg,#6366f1,#ec4899)
═══════════════════════════════════════════════════════
```

---

### 2D — TwoFactorSetupModal.jsx
**Type:** Modal overlay (not a full page)  
**Triggered from:** AccountSecurityPages.jsx when "Enable 2FA" is toggled  
**Purpose:** Walk creator through TOTP QR code scan and verification

```
═══════════════════════════════════════════════════════
MODAL: SET UP TWO-FACTOR AUTHENTICATION
Width: 380px, centered, backdrop blur
═══════════════════════════════════════════════════════

STEP 1 — INTRODUCTION (shown first)
─────────────────────────────────────────────────────
  🔐 icon (large, center)
  
  "Secure Your Account"
  "Two-factor authentication adds an extra layer
  of protection to your account and is required
  for creator payouts."
  
  "You'll need an authenticator app:"
  • Google Authenticator
  • Authy
  • Microsoft Authenticator
  
  [  Continue  ]   [  Cancel  ]

─────────────────────────────────────────────────────
STEP 2 — SCAN QR CODE
─────────────────────────────────────────────────────
  "Scan this QR code with your authenticator app"
  
  ┌─────────────────────────────┐
  │                             │
  │    [QR CODE IMAGE]          │
  │    (256x256 pixels)         │
  │    Generated from TOTP      │
  │    secret via qrcode.js     │
  │                             │
  └─────────────────────────────┘
  
  "Can't scan? Enter this code manually:"
  ┌─────────────────────────────┐
  │  JBSW Y3DP EHPK 3PXP       │  ← formatted secret
  └─────────────────────────────┘
  [Copy Code]
  
  [  I've Scanned It  ]

─────────────────────────────────────────────────────
STEP 3 — VERIFY CODE
─────────────────────────────────────────────────────
  "Enter the 6-digit code from your app"
  
  OTP Input (6 boxes, same as PhoneAuthPage)
  ┌───┐ ┌───┐ ┌───┐ ─ ┌───┐ ┌───┐ ┌───┐
  │ _ │ │ _ │ │ _ │   │ _ │ │ _ │ │ _ │
  └───┘ └───┘ └───┘   └───┘ └───┘ └───┘
  (dash separator between groups of 3 is cosmetic only)
  
  [  Verify & Enable  ]
  
  Error state: "Invalid code. Please try again."
  "Codes refresh every 30 seconds."

─────────────────────────────────────────────────────
STEP 4 — SUCCESS
─────────────────────────────────────────────────────
  ✅ Large animated checkmark
  
  "Two-Factor Authentication Enabled"
  "Your account is now more secure."
  
  ⚠️ BACKUP CODES section:
  "Save these backup codes in a safe place.
   Each code can only be used once."
  
  ┌─────────────────────────────┐
  │  1. ABC12-DEF34             │
  │  2. GHI56-JKL78             │
  │  3. MNO90-PQR12             │
  │  4. STU34-VWX56             │
  │  5. YZA78-BCD90             │
  └─────────────────────────────┘
  
  [  📋 Copy All Codes  ]   [  ⬇️ Download  ]
  
  [  Done  ]  ← Closes modal

═══════════════════════════════════════════════════════
DESIGN SPEC
  Modal background: rgba(15,12,41,0.98)
  Border: 1px solid rgba(255,255,255,0.12)
  Border radius: 24px
  Backdrop: rgba(0,0,0,0.7) blur(8px)
  QR code background: white (required for QR readability)
  QR code padding: 16px white border around QR
  Step indicator: 3 dots top-center showing current step (1,2,3)
    Active dot: #6366f1, inactive: rgba(255,255,255,0.2)
═══════════════════════════════════════════════════════
```

---

### 2E — AdminPayoutsPage.jsx
**Route:** `/admin/payouts`  
**Access:** Admin role only  
**Purpose:** Review, approve, and manage creator payout requests

```
═══════════════════════════════════════════════════════
SCREEN: ADMIN — PAYOUT MANAGEMENT         [← Admin]
═══════════════════════════════════════════════════════

HEADER
  💰 Creator Payouts
  [  Overview  |  Pending  |  History  |  Disputes  ]

─────────────────────────────────────────────────────
TAB: OVERVIEW
─────────────────────────────────────────────────────

  SUMMARY CARDS ROW (4 cards):
  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
  │  Total Paid  │ │   Pending    │ │  This Month  │ │  Disputes    │
  │  $48,320     │ │  $3,240      │ │  $8,900      │ │  3 open      │
  │  all time    │ │  awaiting    │ │  platform    │ │  need review │
  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘

  RECENT PAYOUTS TABLE:
  Creator | Amount | Method | Date | Status | Action
  ─────────────────────────────────────────────────
  @alexrock | $150.00 | Bank Transfer | Aug 12 | ✅ Completed | [View]
  @jaybeat  | $320.50 | Bank Transfer | Aug 11 | ✅ Completed | [View]
  @creator3 | $85.00  | Bank Transfer | Aug 10 | ⚠️ Failed     | [Retry]

─────────────────────────────────────────────────────
TAB: PENDING APPROVALS
─────────────────────────────────────────────────────

  Filter bar: [All] [Over $500] [New Creators] [Flagged]
  
  Each pending payout row:
  ┌────────────────────────────────────────────────────┐
  │  👤 @creatorname                                   │
  │  Amount: $245.00  |  Requested: Aug 13, 2026      │
  │  Account: Stripe Express ••••1234   |  2FA: ✅     │
  │  KYC Status: ✅ Verified                           │
  │  Total earnings (last 30d): $890.00               │
  │                                                    │
  │  [✅ Approve Payout] [❌ Reject] [👤 View Creator] │
  └────────────────────────────────────────────────────┘

  On "Approve Payout":
    Confirm dialog: "Send $245.00 to @creatorname?"
    [Confirm] → calls /api/wallet/admin/approve-payout
    
  On "Reject":
    Reason input modal: select reason + optional note
    ["Suspicious activity", "Account unverified", "Too frequent", "Manual review"]

─────────────────────────────────────────────────────
TAB: HISTORY (all completed payouts)
─────────────────────────────────────────────────────

  Date range filter: [Last 7d] [Last 30d] [Last 90d] [Custom]
  Export: [📊 Export CSV]
  
  Full table with pagination (25 per page):
  Creator | Amount | Date | Stripe Transfer ID | Status
  
  Searchable by creator name or transfer ID

─────────────────────────────────────────────────────
TAB: DISPUTES / CHARGEBACKS
─────────────────────────────────────────────────────

  ⚠️ (count) Open Disputes
  
  Each dispute row:
  Transaction | Creator | Amount | Dispute Reason | Date Opened | Action
  
  [Resolve]  → opens resolution modal:
    Options: "Refund viewer", "Uphold payout", "Partial refund"
    Notes field
    [Submit Resolution]

═══════════════════════════════════════════════════════
DESIGN SPEC
  Matches AdminDashboardPage style:
  Background: #0a0a18
  Cards: rgba(255,255,255,0.04) with border rgba(255,255,255,0.07)
  Table rows: alternating rgba(255,255,255,0.02) and transparent
  Approve button: background rgba(16,185,129,0.2) color #10b981
  Reject button: background rgba(239,68,68,0.2) color #ef4444
  Tabs: same tab style as AdminDashboardPage (border-bottom active indicator)
═══════════════════════════════════════════════════════
```

---

### 2F — StreamPrivacyGate.jsx
**Type:** Full-screen overlay component (not a page, rendered inside LiveWatchPage)  
**Purpose:** Block viewing when stream is followers-only or private and viewer doesn't qualify

```
═══════════════════════════════════════════════════════
COMPONENT: STREAM PRIVACY GATE
Rendered as overlay covering the video area
═══════════════════════════════════════════════════════

VARIANT A — Followers Only (stream.privacy === 'followers', viewer not following)
─────────────────────────────────────────────────────
  Background: rgba(0,0,0,0.85) with blur behind
  
  Center content:
  👥 icon (large, 64px)
  
  "Followers Only Stream"
  "@creatorname is streaming for followers only"
  
  Creator mini-card:
  [Avatar] @creatorname | 12.4K followers | ⭐ Verified
  
  [  Follow @creatorname  ]   ← Purple gradient button (calls follow API)
  
  After clicking Follow:
    Button changes to "✓ Following — Refresh to watch"
    Then after 1.5s auto-reload: privacy gate disappears

─────────────────────────────────────────────────────
VARIANT B — Private Stream (stream.privacy === 'private', viewer accessed normally)
─────────────────────────────────────────────────────
  🔗 icon (large, 64px)
  
  "Private Stream"
  "This stream is invite-only. You need the
  private link to watch."
  
  [  Go Back  ]   [  Request Access  ]
  
  "Request Access" opens:
    Text field: "Message to @creatorname"
    [  Send Request  ]
    → writes to Firestore streams/{id}/accessRequests/{uid}

─────────────────────────────────────────────────────
VARIANT C — Stream Ended (status === 'ended', viewer arrives late)
─────────────────────────────────────────────────────
  (This isn't privacy-related but reuses same gate component)
  
  📺 icon (large, 64px)
  
  "Stream Ended"
  "@creatorname's live stream has ended"
  
  If vodPlaybackUrl exists:
    "Watch the replay below"
    [  ▶️ Watch VOD  ]  ← navigates to /live/vod?stream={id}
  
  If no VOD:
    "No replay available"
    [  Follow for next stream  ]

═══════════════════════════════════════════════════════
DESIGN SPEC
  Position: absolute, inset 0, zIndex 50
  Background: rgba(0,0,0,0.92) with backdrop-filter blur(12px)
  Text: center-aligned, #f1f5f9
  Icon: 64px, white/semi-transparent
  Primary button: linear-gradient(135deg,#6366f1,#ec4899)
  Border radius (card inside gate): 20px
  Padding: 40px
═══════════════════════════════════════════════════════
```

---

## PART 3 — ADMIN MONITORING DASHBOARD DESIGN

### Overview

The spec (§3.9) requires: **"Stream monitoring: force-end a stream, view flagged content queue."** The current `AdminDashboardPage.jsx` has user metrics and reports, but **no real-time stream health monitoring panel**. This needs a dedicated `AdminStreamsMonitorPage.jsx` plus an upgrade to the existing Admin Dashboard overview tab.

---

### 3A — AdminStreamsMonitorPage.jsx (NEW)
**Route:** `/admin/streams`  
**Access:** Admin role only  
**Data Sources:** Firestore `streams` collection (real-time listener) + Mux API (via backend)

```
═══════════════════════════════════════════════════════
SCREEN: ADMIN — LIVE STREAM MONITOR       [← Admin]
═══════════════════════════════════════════════════════

AUTO-REFRESH: Every 30 seconds (or real-time via Firestore onSnapshot)

─────────────────────────────────────────────────────
TOP STATUS BAR (always visible, sticky)
─────────────────────────────────────────────────────
  ● 24 LIVE NOW    |   👁 18,420 total viewers   |   ⚠️ 3 flagged   |   🔴 MONITORING ACTIVE
  
  [🔄 Refresh]  [⚙️ Settings]  [📊 Export Report]
  
  Status indicator pulses green when monitoring is active

─────────────────────────────────────────────────────
SECTION 1: PLATFORM HEALTH (4 metric cards)
─────────────────────────────────────────────────────

  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐
  │ Active Streams │  │ Total Viewers  │  │  Peak Today    │  │  Flagged       │
  │                │  │                │  │                │  │                │
  │      24        │  │    18,420      │  │    31,200      │  │      3         │
  │   ▲ +3 vs 1hr  │  │   ▲ +2.1K/hr  │  │   @ 3:15pm     │  │  needs action  │
  └────────────────┘  └────────────────┘  └────────────────┘  └────────────────┘

  Data source:
  - Active streams: Firestore query where status='active'
  - Total viewers: sum of viewerCount across active streams
  - Peak today: Firestore aggregation (stored by hourly Cloud Function)
  - Flagged: Firestore reports where status='pending' and type='stream'

─────────────────────────────────────────────────────
SECTION 2: FILTER / SEARCH BAR
─────────────────────────────────────────────────────

  [🔍 Search by creator or title...]
  
  Filter chips:
  [All] [🔥 Most Viewers] [⚠️ Flagged] [🆕 Just Started] [🕐 Long Running (>3h)]
  
  Sort: [Viewers ↓] [Started ↓] [Reports ↓]

─────────────────────────────────────────────────────
SECTION 3: ACTIVE STREAMS TABLE
─────────────────────────────────────────────────────

  Each row (card-style, not a table):

  ┌────────────────────────────────────────────────────────────────────────┐
  │  ● LIVE   [Thumbnail preview]   @alexrock — "Friday Night Gaming"     │
  │                                  Category: Gaming  |  🔴 1:23:45 live  │
  │  👁 4,230 viewers  |  💬 892 msgs  |  🎁 $45 gifted  |  ⚠️ 2 reports  │
  │                                                                         │
  │  Stream Health:  ████████░░  Good  |  Bitrate: 4.2 Mbps  |  FPS: 30   │
  │                                                                         │
  │  [👁 Watch]  [💬 View Chat]  [📋 Reports]  [🛑 Force End]  [⋯ More]   │
  └────────────────────────────────────────────────────────────────────────┘

  COLUMNS EXPLAINED:
  - Thumbnail: 80x45px screenshot (Mux auto-generates thumbnails every 60s)
  - Duration: live timer (startedAt → now)
  - Viewer count: from Firestore stream.viewerCount (updated by Cloud Function every 30s)
  - Chat count: number of messages in streams/{id}/messages subcollection
  - Gifted: sum of gift amounts from streams/{id}/gifts subcollection
  - Reports: count of reports against this stream (clickable → opens reports)
  - Health bar: pulled from Mux API /streaming/status endpoint (via backend)

  Row color coding:
  - Normal: rgba(255,255,255,0.03) border
  - Flagged (has reports): rgba(245,158,11,0.15) border, ⚠️ icon
  - Critical (3+ reports): rgba(239,68,68,0.15) border, flashing indicator

─────────────────────────────────────────────────────
SECTION 4: STREAM DETAIL PANEL (slide-in from right)
─────────────────────────────────────────────────────
  When admin clicks on a stream row, a right-side drawer slides in (width: 380px):

  ┌────────────────────────────────┐
  │  [← Back]  Stream Details     │
  │                                │
  │  ● LIVE  1:23:45              │
  │  @alexrock                     │
  │  "Friday Night Gaming"         │
  │                                │
  │  ─── VIDEO PLAYER ───────────  │
  │  [Embedded HLS player, muted] │
  │  (uses stream.playbackUrl)    │
  │                                │
  │  ─── STREAM INFO ────────────  │
  │  Category:    Gaming           │
  │  Privacy:     Public           │
  │  Started:     3:15 PM today    │
  │  Mux ID:      abc123...        │
  │  Bitrate:     4.2 Mbps        │
  │  Codec:       H.264 / AAC     │
  │  Resolution:  1080p            │
  │  FPS:         30               │
  │                                │
  │  ─── ACTIVITY ───────────────  │
  │  Viewers:     4,230            │
  │  Peak:        5,120 (12 mins)  │
  │  Messages:    892              │
  │  Gifts sent:  $45.00           │
  │                                │
  │  ─── REPORTS ─────────────── │
  │  ⚠️  2 active reports          │
  │  • Spam content (1)            │
  │  • Hate speech (1)             │
  │  [View All Reports →]          │
  │                                │
  │  ─── ADMIN ACTIONS ──────────  │
  │  [📋 Send Warning to Creator]  │
  │  [🔇 Mute Chat (5 min)]       │
  │  [🛑 Force End Stream]         │
  │  [🚫 Suspend Creator Account]  │
  │                                │
  │  Each action requires confirm  │
  └────────────────────────────────┘

  Force End Stream confirmation modal:
  "Are you sure you want to force-end this stream?"
  Reason (required): [dropdown]
    • Policy violation
    • Copyright content
    • User safety
    • Technical issue
    • Other
  Optional note: [text area]
  [Cancel]  [🛑 Force End Stream]

─────────────────────────────────────────────────────
SECTION 5: STREAM ACTIVITY TIMELINE
─────────────────────────────────────────────────────
  At bottom of page, collapsible panel:
  "Recent Stream Events (last 2 hours)"
  
  Timeline of events from all streams:
  3:45 PM  — ⚠️ Report filed on @alexrock's stream (hate speech)
  3:43 PM  — 🔴 New stream started by @beatmaker22
  3:40 PM  — 👁 Peak 5,120 viewers on @alexrock
  3:35 PM  — 🎁 $100 gift sent on @creator9's stream
  3:30 PM  — ✅ Stream ended: @morningtalks (1h 23m)
  3:22 PM  — ⚠️ Report filed on @alexrock's stream (spam)
  3:15 PM  — 🔴 New stream started by @alexrock
  
  Data source: Firestore adminEvents collection (written by Cloud Functions on key events)

═══════════════════════════════════════════════════════
DESIGN SPEC
  Background: #0a0a18
  Header/nav: same as AdminDashboardPage sticky header
  Stream cards: rounded-16, background rgba(255,255,255,0.04)
  Health bar: linear gradient green→yellow→red based on value
  Duration timer: red font #ef4444, monospace "1:23:45"
  Viewer count: white bold
  Report badge: background rgba(239,68,68,0.2) color #ef4444
  Watch button: background rgba(99,102,241,0.2) color #818cf8
  Force End button: background rgba(239,68,68,0.2) color #ef4444
  Slide-in drawer: background #0f172a, border-left 1px solid rgba(255,255,255,0.1)
═══════════════════════════════════════════════════════
```

---

### 3B — Admin Dashboard Overview Tab Enhancement
**File to MODIFY:** `AdminDashboardPage.jsx`  
**Purpose:** Add a "🔴 Live" mini-panel to the existing Overview tab so admins see stream health without navigating away

```
ADD BELOW EXISTING METRIC CARDS IN OVERVIEW TAB:

─────────────────────────────────────────────────────
LIVE STREAMS MINI-PANEL (new section in Overview tab)
─────────────────────────────────────────────────────

  Section header:
  🔴 Live Streams (24)          [View All →] (links to /admin/streams)

  MINI-LIST: Top 5 streams by viewer count (compact rows):

  ┌──────────────────────────────────────────────────────────┐
  │  ● @alexrock  "Friday Night Gaming"    👁 4,230  ⚠️ 2   [End]│
  │  ● @beatmaker "Chill Beats Session"    👁 2,100  ──     [End]│
  │  ● @creator9  "Cooking with Jay"       👁 890    ──     [End]│
  │  ● @morning22 "Morning Talk Show"      👁 450    ⚠️ 1   [End]│
  │  ● @gamer_x   "Speedrun Attempt"      👁 230    ──     [End]│
  └──────────────────────────────────────────────────────────┘

  [View All 24 Live Streams →]

  Data source: onSnapshot query streams where status='active', orderBy viewerCount desc, limit 5
  Updates: real-time via Firestore listener

─────────────────────────────────────────────────────
ADD NEW "Streams" TAB to the 5-tab nav
─────────────────────────────────────────────────────

  CURRENT TABS: [Overview] [Reports] [KYC] [Users] [More]
  NEW TABS:     [Overview] [🔴 Streams] [Reports] [KYC] [Users] [More]
  
  The Streams tab navigates to /admin/streams (AdminStreamsMonitorPage)
  OR renders the monitoring content inline (either approach works)
  
  Recommended: Navigate to dedicated page (keeps AdminDashboardPage clean)
  Tab just acts as a nav link, not a tab content panel

```

---

### 3C — Admin Monitoring Data Services

The admin monitoring pages require two new data service utilities:

**File to CREATE:** `ConnectHub-SPA/src/services/admin-monitoring-service.js`

```javascript
// PURPOSE: Provides real-time data feeds for admin monitoring

// FUNCTION: subscribeToActiveStreams(callback)
//   Firestore onSnapshot on streams where status='active'
//   orderBy viewerCount desc
//   Returns unsubscribe function
//   callback receives: [{ id, uid, userName, title, category, viewerCount,
//                         startedAt, playbackUrl, muxStreamId, reportCount }]

// FUNCTION: subscribeToStreamHealth(muxStreamId, callback)
//   Polls GET /api/streaming/status/:muxStreamId every 30 seconds
//   callback receives: { bitrate, fps, codec, resolution, healthScore }
//   healthScore: 0-100 (100 = perfect)

// FUNCTION: subscribeToRecentEvents(callback)
//   Firestore onSnapshot on adminEvents collection
//   orderBy timestamp desc, limit 50
//   Returns stream events (started, ended, reported, force-ended)

// FUNCTION: subscribeToStreamReports(streamId, callback)
//   Firestore onSnapshot on reports where targetId=streamId and status='pending'
//   Returns active report count and list

// FUNCTION: forceEndStream(streamId, muxStreamId, reason, adminUid)
//   1. updateDoc streams/{streamId} → { status:'ended', endReason, endedBy:'admin' }
//   2. POST /api/streaming/end { muxStreamId }
//   3. addDoc adminActions → { action, streamId, adminUid, reason, timestamp }

// FUNCTION: sendCreatorWarning(creatorUid, streamId, reason, adminUid)
//   1. addDoc notifications/{creatorUid}/items → { type:'admin_warning', reason, streamId }
//   2. addDoc adminActions → { action:'warning_sent', ... }

// FUNCTION: getStreamThumbnail(muxStreamId)
//   Returns: https://image.mux.com/{PLAYBACK_ID}/thumbnail.png?width=320
//   (Mux auto-generates thumbnails — no extra work needed)

// FUNCTION: getPlatformMetrics()
//   Aggregates from Firestore:
//   - Total active streams count
//   - Total viewer count (sum across active streams)
//   - Pending reports count
//   Returns: { activeStreams, totalViewers, pendingReports, peakToday }
```

---

### 3D — Admin Navigation Update

**File to MODIFY:** `ConnectHub-SPA/src/pages/admin/AdminSubPages.jsx`

```
ADD to admin navigation/sidebar:

Current admin nav items (from AdminSubPages.jsx + AdminDashboardPage):
  📊 Overview (AdminDashboardPage)
  📋 Reports (ReportsAdminPage)
  🪪 KYC (KYCAdminPage)
  ✅ Verification (VerificationAdminPage)
  📈 Analytics (AdminAnalyticsPage)
  🗄️ Extra Pages (AdminExtraPages)

ADD:
  🔴 Live Streams → /admin/streams  (AdminStreamsMonitorPage — NEW)
  💰 Payouts → /admin/payouts  (AdminPayoutsPage — NEW)

TOTAL admin nav after addition:
  📊 Overview
  🔴 Live Streams  ← NEW
  📋 Reports
  💰 Payouts  ← NEW
  🪪 KYC
  ✅ Verification
  📈 Analytics
```

---

## PART 4 — ROUTES TO ADD IN App.jsx

All new pages require routes added to `ConnectHub-SPA/src/App.jsx`:

```javascript
// ADD THESE ROUTES (no changes to existing routes):

// Sprint 2 — Wallet
<Route path="/wallet/buy-coins" element={<BuyCoinsPage />} />
<Route path="/wallet/connect/return" element={<StripeConnectReturnPage />} />

// Sprint 3 — Auth
<Route path="/auth/phone" element={<PhoneAuthPage />} />
// TwoFactorSetupModal is a component, not a route — no route needed

// Admin — New Pages
<Route path="/admin/streams" element={<AdminStreamsMonitorPage />} />
<Route path="/admin/payouts" element={<AdminPayoutsPage />} />

// GUARD: All /admin/* routes must be wrapped in AdminRoute guard
// (already exists in current AdminDashboardPage setup — extend to cover new pages)
```

---

## PART 5 — COMPLETE NEW FILES SUMMARY (UPDATED)

| # | File | Type | Sprint | Purpose |
|---|---|---|---|---|
| 1 | `ConnectHub-SPA/src/pages/wallet/BuyCoinsPage.jsx` | Page | 2 | Coin purchase with Stripe |
| 2 | `ConnectHub-SPA/src/pages/wallet/StripeConnectReturnPage.jsx` | Page | 2 | Post-Stripe-onboarding return handler |
| 3 | `ConnectHub-SPA/src/pages/auth/PhoneAuthPage.jsx` | Page | 3 | Phone + SMS OTP auth |
| 4 | `ConnectHub-SPA/src/components/common/TwoFactorSetupModal.jsx` | Modal | 3 | TOTP 2FA enrollment flow |
| 5 | `ConnectHub-SPA/src/pages/admin/AdminStreamsMonitorPage.jsx` | Page | 4 | Real-time stream monitoring |
| 6 | `ConnectHub-SPA/src/pages/admin/AdminPayoutsPage.jsx` | Page | 2+4 | Payout approvals & disputes |
| 7 | `ConnectHub-SPA/src/components/live/StreamPrivacyGate.jsx` | Component | 4 | Follower/private stream gate |
| 8 | `ConnectHub-SPA/src/services/admin-monitoring-service.js` | Service | 4 | Firestore + Mux monitoring feeds |

**Backend files (from original plan, unchanged):**
| 9 | `ConnectHub-Backend/src/services/mux-service.ts` | Service | 1 | Mux API wrapper |
| 10 | `ConnectHub-Backend/src/routes/streaming.ts` | Routes | 1 | Streaming API endpoints |
| 11 | `ConnectHub-Backend/src/services/stripe-connect-service.ts` | Service | 2 | Stripe Connect wrapper |
| 12 | `ConnectHub-Backend/src/routes/wallet.ts` | Routes | 2 | Wallet/payout endpoints |
| 13 | `ConnectHub-SPA/src/services/whip-publisher.js` | Service | 1 | WebRTC WHIP publisher |
| 14 | `ConnectHub-SPA/src/services/mfa-service.js` | Service | 3 | TOTP MFA service |
| 15 | `ConnectHub-SPA/src/services/captions-service.js` | Service | 4 | Web Speech API captions |

---

## PART 6 — SCREEN COUNT SUMMARY

| Category | Before Plan | Added by Plan | Total After |
|---|---|---|---|
| Live Streaming pages | 12 | 0 (all modifications) | 12 |
| Wallet pages | 1 (WalletPage) | +2 (BuyCoins, StripeReturn) | 3 |
| Auth pages | 4 (Login, Signup, Verify, ForgotPw) | +1 (PhoneAuth) | 5 |
| Admin pages | 5 (Dashboard, Reports, KYC, Verify, Analytics) | +2 (StreamsMonitor, Payouts) | 7 |
| Modal components | Various | +1 (2FA Setup Modal) | +1 |
| Live components | Various | +1 (StreamPrivacyGate) | +1 |
| **TOTAL NEW SCREENS** | — | **7 pages + 2 components** | — |

---

*This document is design and planning only. No files have been created or modified.*  
*Approved by: _________________ Date: _________________*
