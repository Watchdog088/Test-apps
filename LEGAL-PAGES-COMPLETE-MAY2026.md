# Legal Pages — Terms of Service & Privacy Policy
## Completed: May 28, 2026 | Commit: b2a07fb

---

## ✅ WHAT WAS COMPLETED (Auto-fixed — No User Action Required)

### 1. `ConnectHub-SPA/src/pages/legal/TermsPage.jsx` (NEW FILE)
- Full Terms of Service page with styled dark-mode UI matching app theme
- Sections: Acceptance, Account Rules, Content Policy, Dating Safety, Marketplace, Payments, Privacy, IP, Disclaimers, Governing Law
- Back button (navigates to previous page)
- "Back to App" button routes to `/feed`
- Last updated date shown in header

### 2. `ConnectHub-SPA/src/pages/legal/PrivacyPage.jsx` (NEW FILE)
- Full Privacy Policy page matching app theme
- Sections: Data Collected, How We Use Data, Sharing, Security, Cookies, User Rights, Contact
- GDPR/CCPA-aligned language
- Back navigation + "Back to App" shortcut

### 3. `ConnectHub-SPA/src/App.jsx` (UPDATED)
- Added lazy imports for `TermsPage` and `PrivacyPage` at top of file
- Added two **public routes** (no auth required) to the React Router config:
  - `<Route path="/terms"   element={<TermsPage />} />`
  - `<Route path="/privacy" element={<PrivacyPage />} />`
- Routes placed OUTSIDE the `PrivateRoute` wrapper so logged-out users can reach them from the login screen

### 4. GitHub Push
- Commit `b2a07fb` pushed successfully to `origin/main`
- 3 files changed, 483 insertions

---

## ⚠️ STILL NEEDS USER ACTION — 8-PHASE PLAN ITEMS

Below are items from the 8-Phase Beta Launch Plan that **require credentials, accounts, or external services** that only you can configure:

---

### PHASE 1 — Infrastructure & Environment Variables
**ACTION REQUIRED BY YOU:**

You need to fill in real API keys in `ConnectHub-SPA/.env` and `ConnectHub-SPA/.env.production`:

```
# Sentry (error monitoring) — sign up at sentry.io
VITE_SENTRY_DSN=your_sentry_dsn_here

# Cloudinary (media uploads) — sign up at cloudinary.com
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# OneSignal (push notifications) — sign up at onesignal.com
VITE_ONESIGNAL_APP_ID=your_onesignal_app_id

# Giphy (GIF search)
VITE_GIPHY_API_KEY=your_giphy_key

# RAWG (gaming)
VITE_RAWG_API_KEY=your_rawg_key

# Unsplash (photos)
VITE_UNSPLASH_ACCESS_KEY=your_unsplash_key
```

**How to set them:**
1. Open `ConnectHub-SPA/.env` in VS Code
2. Replace each `your_xxx_here` placeholder with your real key
3. Do the same in `ConnectHub-SPA/.env.production`
4. Run: `git add ConnectHub-SPA/.env.production && git commit -m "chore: add production env vars" && git push`
   (NOTE: Never commit `.env` — it's already in `.gitignore`)

---

### PHASE 2 — Auth & Onboarding (Firebase)
**ACTION REQUIRED BY YOU:**

The Firebase deploy terminal that was already opened needs you to:
1. **Log in to Firebase** when prompted in the terminal window
2. Press Enter to confirm deployment of Firestore rules and Cloud Functions
3. Verify at https://console.firebase.google.com that rules are active

---

### PHASE 6 — Security & Legal (Cloudinary signed uploads)
**ACTION REQUIRED BY YOU:**

1. Go to https://cloudinary.com → Settings → Upload
2. Create an **unsigned upload preset** named `lynkapp_uploads`
3. Set allowed formats: jpg, png, gif, mp4, webp
4. Set max file size: 50MB
5. Add your Cloud Name and preset name to `.env` (see Phase 1 above)

---

### PHASE 8 — Beta Launch Prep (TURN Server for Video Calls)
**ACTION REQUIRED BY YOU:**

WebRTC video calls need a TURN server for users behind NAT/firewalls.

**Option A — Free (Metered.ca):**
1. Sign up at https://dashboard.metered.ca
2. Create a TURN server instance (free tier: 500MB/month)
3. Copy your API key
4. Add to `.env`:
   ```
   VITE_TURN_USERNAME=your_username
   VITE_TURN_CREDENTIAL=your_credential
   VITE_TURN_SERVER=your_turn_url
   ```

**Option B — Use Twilio (paid, most reliable):**
1. Sign up at https://twilio.com
2. Go to Programmable Video → TURN credentials
3. Add credentials to `.env` as above

---

### MAILGUN Email (optional but recommended for auth emails)
**ACTION REQUIRED BY YOU:**

See `MAILGUN-EMAIL-ALTERNATIVE-SOLUTION.md` for detailed steps.
Short version:
1. Sign up at mailgun.com
2. Add your domain DNS records (see `ADD-MAILGUN-DNS-NOW.md`)
3. Add to backend `.env`: `MAILGUN_API_KEY=your_key`

---

## 📋 FULL 8-PHASE STATUS SUMMARY

| Phase | Description | Status |
|-------|-------------|--------|
| Phase 1 | Infrastructure & env vars | ⚠️ Needs real API keys from you |
| Phase 2 | Auth & onboarding | ✅ Code done — needs Firebase login/deploy |
| Phase 3 | Core user journey (feed, dating, uploads) | ✅ All code complete |
| Phase 4 | Performance (lazy loading, SW, code splitting) | ✅ Implemented |
| Phase 5 | Error handling & monitoring (Sentry, toast) | ✅ Code done — needs Sentry DSN |
| Phase 6 | Security & legal (Cloudinary, ToS, Cookie consent) | ✅ ToS/Privacy pages DONE — needs Cloudinary keys |
| Phase 7 | Accessibility (aria-labels, focus traps, contrast) | ✅ Implemented in components |
| Phase 8 | Beta launch prep (TURN server, feedback form, smoke test) | ⚠️ Needs TURN server setup |

---

## 🚀 QUICKEST PATH TO LAUNCH

Do these 3 things and the app is ready for beta testers:

1. **Add API keys to `.env`** (5 min) — Sentry DSN + Cloudinary
2. **Complete Firebase deploy** in the open terminal (2 min)
3. **Set up a free TURN server** at metered.ca (10 min) for video calls

Everything else is already built and deployed.
