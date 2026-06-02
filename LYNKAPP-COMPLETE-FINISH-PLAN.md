# 🚀 LynkApp — Complete Finish Plan & Backend Keys Reference
*Generated: June 2, 2026*

---

## 📊 CURRENT STATUS OVERVIEW

| Section | Status | Score |
|---------|--------|-------|
| Authentication (Login/Signup/OAuth) | ✅ Done — needs Apple dev account for full activation | 98% |
| Feed & Posts | ✅ Fully wired to Firestore | 100% |
| Stories | ✅ Complete | 100% |
| Dating (Swipe/Match/Chat) | ✅ Complete | 100% |
| Messages (Real-time) | ✅ Complete via Firestore | 100% |
| Notifications | ✅ OneSignal configured | 100% |
| Groups & Events | ✅ Complete | 100% |
| Friends | ✅ Complete | 100% |
| Profile | ✅ Complete | 100% |
| Search | ✅ Complete | 100% |
| Settings | ✅ Complete | 100% |
| Marketplace | ⚠️ Stripe in TEST mode only | 95% |
| Live Streaming | ⚠️ UI complete — TURN server needed for mobile | 80% |
| Video Calls | ⚠️ Will fail on mobile carrier networks without TURN | 75% |
| Error Monitoring (Sentry) | ⚠️ Code ready — DSN key blank | 70% |
| Legal & Compliance | ✅ ToS, Privacy, Cookie consent all in | 100% |
| Performance | ✅ Code splitting, lazy load, service worker | 100% |

### **OVERALL: READY FOR BETA — 4 things block full production launch**

---

## 🔴 PRIORITY 1 — TURN Server (VIDEO CALLS BROKEN ON MOBILE WITHOUT THIS)

**What it is:** WebRTC video calls need a TURN relay server to work on mobile carrier networks (AT&T, Verizon, T-Mobile). STUN alone only works on WiFi. Without TURN, ~40% of your users' video calls will fail.

**Time to complete:** ~15 minutes  
**Cost:** Free (Metered.ca free tier = 500 GB/month)

### Step-by-Step:

1. Go to **https://dashboard.metered.ca/signup**
   - Create a free account (no credit card needed)

2. Once logged in:
   - Click **Applications** in left sidebar
   - Click **Create Application**
   - Name it: `LynkApp`
   - Click **Create**

3. Click your new `LynkApp` application → click **TURN Credentials** tab
   - You will see a **Username** and **Credential** (password)
   - Copy both — you'll need them in a moment

4. Also copy the **TURN server URL** shown (looks like: `turn:relay.metered.ca:80`)

5. Open VS Code → open this file:
   ```
   ConnectHub-SPA/src/services/livestream-webrtc.js
   ```

6. Find this section (around line 15-25):
   ```javascript
   iceServers: [
     { urls: 'stun:stun.l.google.com:19302' },
   ]
   ```

7. Replace it with:
   ```javascript
   iceServers: [
     { urls: 'stun:stun.l.google.com:19302' },
     { urls: 'stun:stun1.l.google.com:19302' },
     {
       urls: 'turn:relay.metered.ca:80',
       username: 'PASTE_YOUR_METERED_USERNAME_HERE',
       credential: 'PASTE_YOUR_METERED_CREDENTIAL_HERE'
     },
     {
       urls: 'turn:relay.metered.ca:443',
       username: 'PASTE_YOUR_METERED_USERNAME_HERE',
       credential: 'PASTE_YOUR_METERED_CREDENTIAL_HERE'
     },
     {
       urls: 'turn:relay.metered.ca:443?transport=tcp',
       username: 'PASTE_YOUR_METERED_USERNAME_HERE',
       credential: 'PASTE_YOUR_METERED_CREDENTIAL_HERE'
     }
   ]
   ```

8. Save the file

9. Also check and update `ConnectHub-SPA/src/services/webrtc-service.js` — same iceServers change

10. Build and deploy:
    ```bash
    cd ConnectHub-SPA
    npm run build
    npx firebase deploy --only hosting
    ```

**What you'll have after:** Video calls work on WiFi AND mobile data ✅

---

## 🟡 PRIORITY 2 — Sentry Error Monitoring (SEE PRODUCTION CRASHES)

**What it is:** Sentry catches JavaScript errors in production and emails you when users hit bugs. The code is already integrated — it just needs your DSN key.

**Time to complete:** ~10 minutes  
**Cost:** Free (5,000 errors/month on free plan)

### Step-by-Step:

1. Go to **https://sentry.io** → Sign up or log in (use GitHub login for speed)

2. Click **Projects** → **Create Project**
   - Platform: **React**
   - Project name: `lynkapp-frontend`
   - Click **Create Project**

3. Sentry will show you a setup page — look for your **DSN** which looks like:
   ```
   https://abc123def456@o789012.ingest.sentry.io/3456789
   ```
   Copy the entire DSN string.

4. Open `ConnectHub-SPA/.env` in VS Code

5. Find the line that says:
   ```
   # VITE_SENTRY_DSN=
   ```
   or it might be blank. Add/update it to:
   ```
   VITE_SENTRY_DSN=https://YOUR_KEY_HERE@oXXXXXX.ingest.sentry.io/XXXXXXX
   ```

6. Save the file

7. Also create a second project in Sentry for the backend:
   - Platform: **Node.js**
   - Name: `lynkapp-backend`
   - Copy that DSN too

8. Open `ConnectHub-Backend/.env` and add:
   ```
   SENTRY_DSN=https://YOUR_BACKEND_KEY@oXXXXXX.ingest.sentry.io/XXXXXXX
   ```

9. Rebuild and redeploy:
    ```bash
    cd ConnectHub-SPA
    npm run build
    npx firebase deploy --only hosting
    ```

**What you'll have after:** Real-time error alerts when users hit bugs in production ✅

---

## 🟡 PRIORITY 3 — Stripe Live Keys (REQUIRED BEFORE CHARGING REAL MONEY)

**What it is:** Stripe is currently in TEST mode. Test mode = no real money is charged. Before launch you need to switch to live keys.

> ⚠️ **DO NOT switch to live keys until you are ready for real customers to pay. Test mode is fine for beta testing.**

**Time to complete:** ~20 minutes  
**Cost:** Free to set up. Stripe takes 2.9% + 30¢ per transaction.

### Step-by-Step:

1. Go to **https://dashboard.stripe.com**
   - Log in (or create account if you haven't yet)

2. In your Stripe dashboard, look at the top toggle — it will say **"Test mode"**
   - **Leave it in Test mode for now during beta**
   - When ready for real money: click the toggle to switch to **Live mode**

3. Click **Developers** (top right) → **API Keys**

4. You will see:
   - **Publishable key** — starts with `pk_test_...` (test) or `pk_live_...` (live)
   - **Secret key** — starts with `sk_test_...` (test) or `sk_live_...` (live)
   - Click **Reveal live key** to see the secret key (never share this)

5. Open `ConnectHub-SPA/.env` — update:
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY_HERE
   ```

6. Open `ConnectHub-Backend/.env` — add/update:
   ```
   STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY_HERE
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
   ```

7. Set up Webhooks so Stripe notifies your server when payments succeed/fail:
   - In Stripe dashboard → **Developers** → **Webhooks**
   - Click **Add endpoint**
   - Endpoint URL: `https://api.lynkapp.net/webhooks/stripe`
   - Select events to listen for:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.deleted`
   - Click **Add endpoint**
   - Copy the **Signing secret** (starts with `whsec_`) — this goes in `STRIPE_WEBHOOK_SECRET`

8. Rebuild backend and redeploy

**What you'll have after:** Real payments processing in your Marketplace ✅

---

## 🟡 PRIORITY 4 — Mailgun Email (PRODUCTION EMAIL SENDING)

**What it is:** Firebase allows only 100 password reset emails/day. For a real app you need Mailgun to send thousands of transactional emails (welcome, reset password, notifications, receipts).

**Time to complete:** ~30 minutes (+ up to 24h for DNS verification)  
**Cost:** Free tier = 1,000 emails/month. Paid = $35/month for up to 50,000.

### Step-by-Step:

1. Go to **https://mailgun.com** → Sign up for free account

2. You'll be asked to verify your domain. Click:
   - **Sending** → **Domains** → **Add New Domain**
   - Enter: `mail.lynkapp.net`  
     *(Use a subdomain like `mail.` not the root domain)*

3. Mailgun will show you DNS records to add. Go to your domain registrar:
   - **If using GoDaddy:** Log in → My Products → DNS → Manage DNS
   - **If using Namecheap:** Log in → Domain List → Manage → Advanced DNS
   - **If using AWS Route53:** Go to Route53 → Hosted Zones → your domain

4. Add these DNS records exactly as Mailgun shows:
   ```
   Type: TXT
   Name: mail.lynkapp.net
   Value: v=spf1 include:mailgun.org ~all

   Type: MX
   Name: mail.lynkapp.net
   Value: mxa.mailgun.org  (Priority 10)

   Type: MX
   Name: mail.lynkapp.net
   Value: mxb.mailgun.org  (Priority 10)

   Type: CNAME
   Name: email.mail.lynkapp.net
   Value: mailgun.org
   ```
   *(The exact values will be shown by Mailgun — use theirs)*

5. Wait for DNS propagation (usually 15 min–24 hours). Mailgun dashboard will show ✅ when verified.

6. Once verified, go to **Settings** → **API Keys** in Mailgun
   - Copy your **Private API key** (starts with `key-`)

7. Open `ConnectHub-Backend/.env` and add:
   ```
   MAILGUN_API_KEY=key-YOUR_MAILGUN_PRIVATE_KEY
   MAILGUN_DOMAIN=mail.lynkapp.net
   MAILGUN_FROM_EMAIL=noreply@lynkapp.net
   MAILGUN_FROM_NAME=LynkApp
   ```

8. Restart backend server

**What you'll have after:** Unlimited production email sending for password resets, welcome emails, notifications ✅

---

## 🟢 PRIORITY 5 — Google AdSense (AD REVENUE)

**What it is:** Replace the gradient placeholder ads with real Google ads that pay you per click/impression.

**Time to complete:** ~1 hour setup + 1-3 days for Google approval  
**Cost:** Free. You earn money per click.

### Step-by-Step:

1. Go to **https://adsense.google.com** → Sign in with your Google account

2. Click **Get started** → enter `lynkapp.net` as your site

3. Google will ask you to add a verification code to your site. They'll give you a `<script>` tag. Add it to `ConnectHub-SPA/index.html` in the `<head>`:
   ```html
   <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_ID" crossorigin="anonymous"></script>
   ```

4. Wait 1-3 days for Google to review and approve your site.

5. Once approved, go to **Ads** → **By ad unit** → Create 3 units:
   - **Banner** (320x50 or 728x90) — for feed banners
   - **Rectangle** (300x250) — for between posts
   - **Interstitial** — for page transitions

6. Each unit gives you a code. Note the **slot IDs** (numbers like `1234567890`).

7. Open `ConnectHub-SPA/.env` and add:
   ```
   VITE_ADSENSE_PUBLISHER_ID=ca-pub-YOUR_PUBLISHER_ID
   VITE_ADSENSE_BANNER_SLOT=YOUR_BANNER_SLOT_ID
   VITE_ADSENSE_RECTANGLE_SLOT=YOUR_RECTANGLE_SLOT_ID
   VITE_ADSENSE_INTERSTITIAL_SLOT=YOUR_INTERSTITIAL_SLOT_ID
   ```

8. Rebuild and deploy.

**What you'll have after:** Real ad revenue from your users ✅

---

## 🟢 PRIORITY 6 — Apple Sign-In Full Activation

**What it is:** Apple Sign-In is coded and shows in the UI but needs an Apple Developer account to fully work on real Apple devices.

**Time to complete:** ~2 hours  
**Cost:** $99/year Apple Developer Program fee

### Step-by-Step:

1. Go to **https://developer.apple.com** → Enroll in the Apple Developer Program
   - Pay the $99/year fee
   - Takes 1-2 days for account activation

2. Once activated, go to **Certificates, Identifiers & Profiles**:
   - Click **Identifiers** → **+** → Select **App IDs** → **App**
   - Bundle ID: `net.lynkapp.app`
   - Enable capability: **Sign In with Apple**
   - Register

3. Create a **Service ID** (for web):
   - Click **Identifiers** → **+** → Select **Services IDs**
   - Description: `LynkApp Web`
   - Identifier: `net.lynkapp.web`
   - Enable **Sign In with Apple**
   - Configure: add your domain `lynkapp.net` and return URL `https://lynkapp.net/auth/apple/callback`

4. In Firebase Console:
   - Go to **Authentication** → **Sign-in method** → **Apple**
   - Enter your **Service ID**: `net.lynkapp.web`
   - Enable it → Save

5. Apple will give you a verification file to add to your web root. Download it and place it at:
   `ConnectHub-SPA/public/.well-known/apple-developer-domain-association.txt`

6. Rebuild and deploy.

**What you'll have after:** Apple Sign-In fully functional on all devices ✅

---

## 🟢 PRIORITY 7 — FeedFM Licensed Music (OPTIONAL)

**What it is:** Replace free radio streams in the music player with licensed background music from FeedFM. Required if you want music that's legal for commercial use without copyright issues.

**Time to complete:** ~1 hour (after FeedFM approves your trial)  
**Cost:** Contact FeedFM for pricing (typically $100-500/month based on users)

### Step-by-Step:

1. Go to **https://feed.fm** → Click **Contact Sales** and fill out the form
   - Mention you're building a social app called LynkApp with X users
   - Request a trial/demo

2. They'll email you back with trial credentials

3. Log into their dashboard and get your **Token** and **Secret**

4. Open `ConnectHub-SPA/.env` and add:
   ```
   VITE_FEEDFM_TOKEN=YOUR_FEEDFM_TOKEN
   VITE_FEEDFM_SECRET=YOUR_FEEDFM_SECRET
   ```

5. Rebuild and deploy.

**What you'll have after:** Licensed music streaming in your music player ✅

---

## 📋 COMPLETE `.env` FILE REFERENCE

### `ConnectHub-SPA/.env` — ALL VARIABLES YOU NEED

```bash
# ===== FIREBASE (Already configured) =====
VITE_FIREBASE_API_KEY=your_existing_key
VITE_FIREBASE_AUTH_DOMAIN=your_existing_value
VITE_FIREBASE_PROJECT_ID=your_existing_value
VITE_FIREBASE_STORAGE_BUCKET=your_existing_value
VITE_FIREBASE_MESSAGING_SENDER_ID=your_existing_value
VITE_FIREBASE_APP_ID=your_existing_value
VITE_FIREBASE_MEASUREMENT_ID=your_existing_value

# ===== STRIPE (Change to live keys before launch) =====
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_KEY_HERE
# Currently: pk_test_... — CHANGE THIS BEFORE REAL PAYMENTS

# ===== SENTRY (Add your DSN here) =====
VITE_SENTRY_DSN=https://YOUR_KEY@oXXXXXX.ingest.sentry.io/XXXXXXX

# ===== GOOGLE ADSENSE (Add after approval) =====
VITE_ADSENSE_PUBLISHER_ID=ca-pub-YOUR_ID
VITE_ADSENSE_BANNER_SLOT=YOUR_SLOT_ID
VITE_ADSENSE_RECTANGLE_SLOT=YOUR_SLOT_ID
VITE_ADSENSE_INTERSTITIAL_SLOT=YOUR_SLOT_ID

# ===== FEEDFM MUSIC (Optional) =====
VITE_FEEDFM_TOKEN=YOUR_TOKEN
VITE_FEEDFM_SECRET=YOUR_SECRET

# ===== ONESIGNAL (Already configured) =====
VITE_ONESIGNAL_APP_ID=your_existing_value

# ===== API KEYS (Already configured) =====
VITE_GIPHY_API_KEY=your_existing_value
VITE_UNSPLASH_ACCESS_KEY=your_existing_value
VITE_PEXELS_API_KEY=your_existing_value
VITE_RAWG_API_KEY=your_existing_value
```

---

### `ConnectHub-Backend/.env` — ALL VARIABLES YOU NEED

```bash
# ===== SERVER =====
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://lynkapp.net

# ===== FIREBASE ADMIN (Already configured) =====
FIREBASE_PROJECT_ID=your_existing_value
FIREBASE_CLIENT_EMAIL=your_existing_value
FIREBASE_PRIVATE_KEY=your_existing_value

# ===== STRIPE (Change to live keys before launch) =====
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
# Currently using sk_test_... — CHANGE BEFORE REAL PAYMENTS

# ===== MAILGUN (Add after setup) =====
MAILGUN_API_KEY=key-YOUR_MAILGUN_PRIVATE_KEY
MAILGUN_DOMAIN=mail.lynkapp.net
MAILGUN_FROM_EMAIL=noreply@lynkapp.net
MAILGUN_FROM_NAME=LynkApp

# ===== SENTRY BACKEND =====
SENTRY_DSN=https://YOUR_BACKEND_KEY@oXXXXXX.ingest.sentry.io/XXXXXXX

# ===== DATABASE (Already configured from AWS setup) =====
DATABASE_URL=your_existing_postgres_url
REDIS_URL=your_existing_redis_url
MONGODB_URI=your_existing_mongodb_url

# ===== JWT =====
JWT_SECRET=your_secure_random_string_here_min_32_chars
JWT_EXPIRES_IN=7d
```

---

## 🧪 SMOKE TEST CHECKLIST — Run Before Announcing Beta

Run every test below on BOTH desktop (Chrome) and mobile (iPhone + Android).

### 🔐 Authentication
- [ ] Sign up with new email → verification email arrives → click link → account verified → logged in
- [ ] Sign in with email/password → goes to Feed page
- [ ] Sign in with Google → popup opens → selects account → lands on Feed
- [ ] Forgot password → enter email → receive reset email → click link → change password → login works
- [ ] Sign out → redirected to login page
- [ ] Try to go to `/feed` when logged out → redirected to login ✅ (already confirmed)

### 📱 Core Features
- [ ] **Feed** — posts load (not blank/error), can scroll
- [ ] **Create Post** — write text post → submit → appears in feed
- [ ] **Photo Post** — attach photo → uploads → appears with image
- [ ] **Stories** — tap a story → plays → can add your own story
- [ ] **Dating** — swipe right on someone → swipe left on someone → it's a match notification
- [ ] **Messages** — open a conversation → send a message → appears in real-time
- [ ] **Marketplace** — browse products → click product → see detail page
- [ ] **Notifications** — like someone's post → they get a notification
- [ ] **Profile** — edit bio → save → changes persist after refresh

### 📡 Advanced Features
- [ ] **Live Stream** — click Go Live → setup screen appears (even if TURN not done, UI should show)
- [ ] **Video Call** — start a video call with another account (on same WiFi first to test)
- [ ] **Beta Feedback Button** — appears at bottom of screen → click → form opens → submit → success toast
- [ ] **Settings** — change notification preferences → save → settings persist on next login

### ⚖️ Legal
- [ ] Cookie consent banner appears on first visit for new user
- [ ] `/terms` loads completely without errors
- [ ] `/privacy` loads completely without errors
- [ ] Can dismiss consent banner → preference saved → doesn't show again on reload

### 📲 Mobile Specific
- [ ] App works in portrait AND landscape orientation
- [ ] Images load correctly on mobile
- [ ] Bottom navigation works on touch (Feed, Messages, Dating, Notifications, Profile)
- [ ] No horizontal scroll issues
- [ ] Text is readable without zooming

---

## 🗂️ KEY FILES QUICK REFERENCE

| What You Need To Edit | File Path |
|----------------------|-----------|
| Frontend env vars | `ConnectHub-SPA/.env` |
| Backend env vars | `ConnectHub-Backend/.env` |
| **ADD TURN HERE** (Priority 1) | `ConnectHub-SPA/src/services/livestream-webrtc.js` |
| Also check TURN here | `ConnectHub-SPA/src/services/webrtc-service.js` |
| Firebase config | `ConnectHub-SPA/src/firebase/config.js` |
| Firestore security rules | `ConnectHub-SPA/firestore.rules` |
| App routes | `ConnectHub-SPA/src/App.jsx` |
| Login page | `ConnectHub-SPA/src/pages/auth/LoginPage.jsx` |
| Feed page | `ConnectHub-SPA/src/pages/feed/FeedPage.jsx` |
| App shell/nav | `ConnectHub-SPA/src/components/layout/AppShell.jsx` |
| Terms of Service | `ConnectHub-SPA/src/pages/legal/TermsPage.jsx` |
| Privacy Policy | `ConnectHub-SPA/src/pages/legal/PrivacyPage.jsx` |
| Beta feedback modal | `ConnectHub-SPA/src/components/common/BetaFeedbackModal.jsx` |
| Ad units | `ConnectHub-SPA/src/components/ads/AdUnit.jsx` |

---

## 🚀 DEPLOY COMMANDS (Run After Any Change)

```bash
# 1. Go to the SPA folder
cd ConnectHub-SPA

# 2. Build production bundle
npm run build

# 3. Deploy to Firebase Hosting only (fastest)
npx firebase deploy --only hosting

# 4. OR deploy everything (hosting + functions + firestore rules)
npx firebase deploy
```

---

## 📅 RECOMMENDED COMPLETION ORDER

| # | Task | Time | Priority | Revenue Impact |
|---|------|------|----------|----------------|
| 1 | TURN Server (Metered.ca) | 15 min | 🔴 Critical | Video calls work on mobile |
| 2 | Sentry DSN Key | 10 min | 🟡 Important | See/fix production bugs |
| 3 | Mailgun Email Setup | 30 min | 🟡 Important | Production email sending |
| 4 | Stripe Live Keys | 20 min | 🟡 Before launch | Real payment processing |
| 5 | Run Smoke Test Checklist | 1-2 hours | 🟡 Before beta | Catch bugs before users do |
| 6 | Google AdSense | 1 hr + 3 days approval | 🟢 Optional | Ad revenue stream |
| 7 | Apple Sign-In | 2 hrs + 2 days | 🟢 Optional | Better iOS conversion |
| 8 | FeedFM Music | Contact sales | 🟢 Optional | Licensed music player |

---

## 💡 ACCOUNTS YOU NEED TO CREATE (Summary)

| Service | URL | What For | Cost |
|---------|-----|----------|------|
| Metered.ca | https://dashboard.metered.ca | TURN server for video calls | Free |
| Sentry | https://sentry.io | Error monitoring | Free |
| Mailgun | https://mailgun.com | Production email | Free (1k/mo) |
| Stripe | https://dashboard.stripe.com | Payments (may already have) | 2.9% + 30¢ |
| Google AdSense | https://adsense.google.com | Ad revenue | Free |
| Apple Developer | https://developer.apple.com | Apple Sign-In | $99/year |
| FeedFM | https://feed.fm | Licensed music | Contact sales |

---

*This document covers everything needed to go from current state to full production launch.*
*The app is already at beta-ready status — just needs these external service keys added.*
