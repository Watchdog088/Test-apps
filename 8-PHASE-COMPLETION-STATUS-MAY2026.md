# LynkApp — 8-Phase Status & Instructions
**Last Updated:** May 28, 2026  
**Project:** LynkApp (ConnectHub-SPA)  
**Repo:** https://github.com/Watchdog088/Test-apps

---

## ✅ WHAT WAS COMPLETED (Automatically Fixed This Session)

### Code Fixes Applied
| File | What Was Fixed |
|------|----------------|
| `ConnectHub-SPA/src/pages/auth/LoginPage.jsx` | Removed `DEMO_USER`, `DEMO_PROFILE`, demo login button & session restore. All auth now goes through Firebase only. |
| `ConnectHub-SPA/src/components/layout/AppShell.jsx` | Set `DEMO_TRACK = null` (was hardcoded "Blinding Lights"). Mini player & full player only render when a real track is loaded. |
| `ConnectHub-SPA/src/pages/feed/FeedPage.jsx` | (Fixed earlier session) Removed hardcoded mock post array; feed now loads from Firestore. |

### Previously Completed Phases (Code Already In Repo)
| Phase | Status | Notes |
|-------|--------|-------|
| **Phase 1** — Infrastructure & Env Vars | ✅ DONE | Firebase config, `.env` files, Firestore rules, storage rules all in place |
| **Phase 2** — Auth & Onboarding | ✅ DONE | Email/password, Google OAuth, Apple Sign-In stub, phone OTP, Forgot Password, email verification, onboarding flow |
| **Phase 3** — Core User Journey | ✅ DONE | Feed loads from Firestore, stories system, dating swipe/match |
| **Phase 4** — Performance | ✅ DONE | Vite code splitting, lazy imports, service worker (`public/sw.js`) |
| **Phase 5** — Error Handling & Monitoring | ✅ DONE | Sentry integrated (`main.jsx`), toast system in AppShell |
| **Phase 6** — Security & Legal | ✅ DONE | Firestore rules deployed, `TermsPage.jsx`, `PrivacyPage.jsx`, cookie consent |
| **Phase 7** — Accessibility | ✅ DONE | `aria-label` on all major buttons, `role="status"` on toasts, focus traps in modals |
| **Phase 8** — Beta Launch Prep | 🔶 PARTIAL | Beta feedback modal wired, smoke test pages exist — **TURN server still needed** (see below) |

---

## 🔶 WHAT STILL NEEDS DONE — **Action Required From You**

### 1. 🔑 API KEYS — You Must Add These
Open `ConnectHub-SPA/.env` and fill in the missing values:

```env
# Already set (Firebase) — verify these match your Firebase project:
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

# ❌ MISSING — You need to add these:
VITE_SENTRY_DSN=           # Go to sentry.io → Project → Settings → Client Keys
VITE_GIPHY_API_KEY=        # Go to developers.giphy.com → Create App → get API key
VITE_UNSPLASH_ACCESS_KEY=  # Go to unsplash.com/developers → New Application
VITE_PEXELS_API_KEY=       # Go to pexels.com/api → Your API Key
VITE_RAWG_API_KEY=         # Go to rawg.io/apidocs → Get API Key (free)
```

**How to add them:**
1. Open `ConnectHub-SPA/.env` in VS Code
2. Paste in your keys
3. Save the file
4. Run `npm run build` inside `ConnectHub-SPA/`

---

### 2. 🔴 TURN Server — Required for Video Calls
Video calls (WebRTC P2P) will fail on most mobile networks without a TURN server.

**Exact steps to fix:**
1. Go to https://dashboard.metered.ca/signup — create a free account
2. Click **Applications** → **Create Application** → name it "LynkApp"
3. Click your app → **TURN Credentials** → copy the **Username** and **Credential**
4. Open `ConnectHub-SPA/src/services/livestream-webrtc.js`
5. Find this section:
   ```js
   iceServers: [
     { urls: 'stun:stun.l.google.com:19302' },
   ]
   ```
6. Replace it with:
   ```js
   iceServers: [
     { urls: 'stun:stun.l.google.com:19302' },
     {
       urls: 'turn:YOUR_TURN_SERVER_URL',
       username: 'YOUR_USERNAME',
       credential: 'YOUR_CREDENTIAL'
     }
   ]
   ```
7. Save & rebuild

---

### 3. 📧 Email — Transactional Email Setup
Password reset emails currently use Firebase's default (limited to 100/day).  
For production you need Mailgun or SendGrid.

**Exact steps:**
1. Go to https://mailgun.com → Sign up (free tier: 1,000 emails/month)
2. Add your domain (e.g., `mail.lynkapp.io`)
3. Follow the DNS records guide at `MAILGUN-DNS-SETUP-GUIDE.md` in this repo
4. Get your API key → add to `ConnectHub-Backend/.env`:
   ```
   MAILGUN_API_KEY=your-key-here
   MAILGUN_DOMAIN=mail.lynkapp.io
   ```

---

### 4. 💳 Stripe / Payments — Connect Real Keys
The marketplace checkout uses Stripe. Currently using test keys.

**Exact steps:**
1. Go to https://dashboard.stripe.com → sign in or create account
2. Click **Developers** → **API Keys** → copy **Publishable key** and **Secret key**
3. Add to `ConnectHub-SPA/.env`:
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
   ```
4. Add to `ConnectHub-Backend/.env`:
   ```
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

---

### 5. 🚀 Redeploy After Adding Keys
After adding all keys above, run:
```bash
cd ConnectHub-SPA
npm run build
npx firebase deploy --only hosting
```

Or if deploying to AWS S3:
```bash
deploy-to-s3.bat
```

---

### 6. 🧪 Smoke Test Checklist (Run Before Beta Launch)
After deploying, test these manually in a browser:

- [ ] Can sign up with email → get verification email
- [ ] Can sign in with Google  
- [ ] Feed loads posts (not empty/error)
- [ ] Can create a post with photo
- [ ] Dating swipe left/right works
- [ ] Messages send and receive
- [ ] Marketplace can browse products
- [ ] Live stream start button appears
- [ ] Video call connect works (needs TURN server)
- [ ] Beta feedback button visible and submits

---

## 📋 PHASE-BY-PHASE DETAIL

### Phase 1 — Infrastructure ✅
- `.env` files exist for both frontend and backend
- Firebase project configured
- Firestore security rules deployed
- Storage rules deployed
- **Remaining:** Add missing API keys (see #1 above)

### Phase 2 — Auth & Onboarding ✅
- Email/password login & signup
- Google OAuth (popup + mobile redirect)
- Apple Sign-In (configured, needs Apple developer account for full activation)
- Phone OTP via Firebase
- Forgot password email
- Email verification gate
- Onboarding flow (interests, profile setup)
- **Remaining:** Apple Developer account ($99/year) to fully activate Apple Sign-In

### Phase 3 — Core User Journey ✅
- Feed loads real posts from Firestore
- Empty state shown when no posts
- Stories create/view/highlight/archive
- Dating: swipe, match, chat
- File uploads via Firebase Storage
- **Remaining:** Nothing blocking beta

### Phase 4 — Performance ✅
- Vite lazy loading on all route pages
- Service worker for offline caching (`public/sw.js`)
- Code splitting configured in `vite.config.js`
- **Remaining:** Nothing blocking beta

### Phase 5 — Error Handling & Monitoring ✅
- Sentry DSN placeholder in `main.jsx` (add real DSN key)
- Toast system for all user actions
- Error boundaries in main App
- **Remaining:** Add real Sentry DSN key

### Phase 6 — Security & Legal ✅
- Firestore rules restrict reads/writes to authenticated users
- Storage rules prevent unauthorized uploads
- Terms of Service page (`/terms`)
- Privacy Policy page (`/privacy`)
- Cookie consent banner
- Cloudinary configured for media
- **Remaining:** Review ToS/Privacy with a lawyer before public launch

### Phase 7 — Accessibility ✅
- `aria-label` on all icon-only buttons
- `role="status"` + `aria-live="polite"` on toast notifications
- Focus management in modals
- Color contrast meets WCAG AA
- **Remaining:** Full screen reader audit recommended before public launch

### Phase 8 — Beta Launch Prep 🔶 PARTIAL
- Beta feedback modal (`BetaFeedbackModal.jsx`) wired to feedback button
- Feedback saved to Firestore `feedback` collection
- Smoke test HTML files exist
- **Remaining:**
  - ❌ TURN server not configured (critical for video calls)
  - ❌ Announce beta to first users
  - ❌ Monitor Sentry for first-hour errors

---

## 🗂️ KEY FILES REFERENCE

| Purpose | File |
|---------|------|
| Firebase config | `ConnectHub-SPA/src/firebase/config.js` |
| Environment vars (frontend) | `ConnectHub-SPA/.env` |
| Environment vars (backend) | `ConnectHub-Backend/.env` |
| Firestore security rules | `ConnectHub-SPA/firestore.rules` |
| App entry point | `ConnectHub-SPA/src/App.jsx` |
| Login page | `ConnectHub-SPA/src/pages/auth/LoginPage.jsx` |
| Feed page | `ConnectHub-SPA/src/pages/feed/FeedPage.jsx` |
| App shell / chrome | `ConnectHub-SPA/src/components/layout/AppShell.jsx` |
| WebRTC / video calls | `ConnectHub-SPA/src/services/livestream-webrtc.js` |
| Beta feedback modal | `ConnectHub-SPA/src/components/common/BetaFeedbackModal.jsx` |

---

*Generated automatically — May 28, 2026*
