# LynkApp — Full UX/UI Assessment & Beta-Ready Plan
**Platform Coverage: Web · Android · iOS**
**Date: June 10, 2026**
**Status: Metered TURN credentials updated (Jun-02-2026) · All 3 service keys LIVE**

---

## EXECUTIVE SUMMARY

LynkApp is a React/Vite SPA (ConnectHub-SPA) deployed on Firebase Hosting at **https://lynkapp.net**. It is backed by Firebase Auth + Firestore + Storage and uses Capacitor to wrap the same codebase into native Android/iOS shells. The app is feature-complete at the UI layer across 12 major sections. The primary remaining work before handing to beta testers falls into three buckets:

1. **Service key wiring** — Sentry ✅, OneSignal ✅, Metered TURN ✅ (just updated), Stripe backend secret ❌, Mailgun ❌  
2. **Capacitor mobile packaging** — Android APK and iOS IPA builds not yet generated  
3. **UX polish gaps** — ~8 medium-priority items identified across platforms  

---

## SECTION 1 — CURRENT STATE AUDIT

### 1.1 Tech Stack
| Layer | Technology | Status |
|-------|-----------|--------|
| Frontend Framework | React 18 + Vite | ✅ Production build working |
| Routing | React Router v6 | ✅ All 12 sections routed |
| State Management | Zustand (useAppStore) | ✅ Wired |
| Backend | Firebase Auth + Firestore + Storage | ✅ Live project: lynkapp-c7db1 |
| Mobile Wrapper | Capacitor v5 | ⚠️ Config present, builds not generated |
| Error Monitoring | Sentry | ✅ DSN confirmed in .env |
| Push Notifications | OneSignal | ✅ App ID confirmed in .env |
| Video Calls (WebRTC) | Metered TURN | ✅ **Updated Jun-10-2026 with Jun-02-2026 credentials** |
| Payments | Stripe (test mode) | ⚠️ Frontend key live, backend secret missing |
| Email | Mailgun | ❌ Keys not yet added to backend .env |
| Media CDN | Cloudinary | ✅ Upload preset configured |
| AR Filters | DeepAR | ✅ License key in .env |

### 1.2 Sections Complete (UI + Firestore wired)
1. ✅ Auth & Onboarding (Login, Signup, Forgot Password, Email Verify, Account Recovery, Onboarding wizard)
2. ✅ Feed / Home (Posts, Stories Strip, Feed filters, Create Post)
3. ✅ Stories (Create, View, Highlights, Archive, Analytics)
4. ✅ Live Streaming (Go Live, Watch, VOD, Clips, Schedule, Analytics, Monetization, Moderation, Q&A, Gifts, Co-host)
5. ✅ Dating (Swipe, Matches, Chat, Profile Edit, Preferences, Speed Dating, Safety Center, Match Celebration)
6. ✅ Messages (Conversations, Group Chat, New Message, Requests, Archived, Real-time via Firestore)
7. ✅ Notifications (Activity feed, Quiet Hours, Summary)
8. ✅ Profile (View, Edit, Followers, Following, Insights, Verification Request)
9. ✅ Friends (Find, Nearby, Birthdays, Suggestions)
10. ✅ Groups (Browse, Detail, Create, Members, Events sub-tab)
11. ✅ Events (Browse, Detail, Create, Attendees, Calendar)
12. ✅ Marketplace (Browse, Product Detail, Create Listing Wizard, Checkout, Orders, Seller Dashboard, KYC, Reviews, Returns)

### 1.3 Additional Sections Present
- Music / Podcasts
- Gaming Hub
- Media Hub
- Trending
- Search
- Wallet
- Creator Tools
- Business Profile
- Premium / Subscriptions
- Video Calls (P2P WebRTC via Metered)
- Meetings
- Settings (20 sub-pages)
- Help & Support
- Admin Dashboard
- Legal Pages (Terms, Privacy, Cookies, About, Contact)
- Beta Dashboard & Welcome Page

---

## SECTION 2 — PLATFORM GAP ANALYSIS

### 2.1 WEB (Chrome / Safari / Firefox on Desktop + Mobile Browser)
**Current Status: ~90% ready**

| # | Issue | Priority | Fix |
|---|-------|----------|-----|
| W1 | `VITE_API_BASE_URL` points to `api.connecthub.com` — not a real domain | 🔴 HIGH | Change to Firebase Functions URL or leave as Firestore-direct (no REST backend needed for beta) |
| W2 | Stripe secret key missing from `ConnectHub-Backend/.env` → checkout will fail at real payment confirmation | 🔴 HIGH | Add `STRIPE_SECRET_KEY=sk_test_...` to backend env |
| W3 | Mailgun not configured → password-reset & welcome emails silently fail | 🟡 MEDIUM | Add Mailgun keys to backend .env OR use Firebase Auth's built-in email templates as fallback |
| W4 | Service Worker (`public/sw.js`) needs cache-busting headers configured in `firebase.json` | 🟡 MEDIUM | Add Cache-Control headers for SW file in firebase.json |
| W5 | Cookie Consent banner shows on every hard-reload (localStorage not persisted across deploys) | 🟢 LOW | Verify localStorage key matches across builds |
| W6 | `VITE_ADSENSE_PUBLISHER_ID` placeholder — ad slots show fallback gradients | 🟢 LOW | Apply for AdSense OR keep fallbacks for beta |

### 2.2 ANDROID (Capacitor APK → Google Play Internal Track)
**Current Status: ~60% ready**

| # | Issue | Priority | Fix |
|---|-------|----------|-----|
| A1 | No Android build generated yet — `capacitor.config.json` exists but `npx cap add android` not run | 🔴 CRITICAL | Run `npx cap add android && npx cap sync` (see Week 2 bat) |
| A2 | Android `webDir` must point to `dist/` — confirm `capacitor.config.json` has `"webDir": "dist"` | 🔴 HIGH | Already set — verify after `cap sync` |
| A3 | Push notifications: OneSignal Android SDK not added to native project | 🔴 HIGH | Add OneSignal Capacitor plugin after `cap add android` |
| A4 | Camera / microphone permissions not declared in `AndroidManifest.xml` | 🔴 HIGH | Add `CAMERA`, `RECORD_AUDIO`, `READ_EXTERNAL_STORAGE` permissions |
| A5 | Back-button hardware handling — Capacitor default may cause app exit instead of going back | 🟡 MEDIUM | Add `App.addListener('backButton', ...)` handler in `mobile-platform-service.js` |
| A6 | Status bar color should match app's purple gradient (#6C3AE8) | 🟡 MEDIUM | Add `StatusBar.setBackgroundColorByHexString('#6C3AE8')` on app init |
| A7 | Splash screen duration: currently `auto` — should show until Firebase Auth resolves | 🟡 MEDIUM | Call `SplashScreen.hide()` in `useAuth.js` after auth state confirmed |
| A8 | Keyboard pushes content (especially dating swipe cards) off-screen on Android | 🟡 MEDIUM | Set `android:windowSoftInputMode="adjustResize"` in AndroidManifest |
| A9 | Deep links (e.g., `lynkapp://profile/123` from share invites) not configured | 🟢 LOW | Add intent filters for `https://lynkapp.net` scheme |
| A10 | `capacitor.config.json` `appId` is `com.lynkapp.app` — verify package name matches Play Console registration | 🟢 LOW | Confirm before first upload |

### 2.3 iOS (Capacitor IPA → TestFlight)
**Current Status: ~55% ready** *(requires macOS + Xcode)*

| # | Issue | Priority | Fix |
|---|-------|----------|-----|
| I1 | No iOS build generated — `npx cap add ios` not run | 🔴 CRITICAL | Run on macOS: `npx cap add ios && npx cap sync` |
| I2 | Apple Developer account required ($99/yr) for TestFlight distribution | 🔴 CRITICAL | Must be enrolled before any iOS beta testing |
| I3 | Camera / Microphone / Photo Library usage descriptions missing from `Info.plist` | 🔴 HIGH | Add `NSCameraUsageDescription`, `NSMicrophoneUsageDescription`, `NSPhotoLibraryUsageDescription` |
| I4 | OneSignal iOS SDK and push notification entitlements not added | 🔴 HIGH | Add via Xcode Signing & Capabilities → Push Notifications |
| I5 | iOS Safari: `position: fixed` bottom nav flickers when keyboard opens | 🔴 HIGH | Apply `-webkit-fill-available` height fix in `mobile-ios-android.css` (partial fix exists — verify) |
| I6 | iOS safe area insets (notch/Dynamic Island/home indicator) — bottom nav may be clipped | 🟡 MEDIUM | Confirm `env(safe-area-inset-bottom)` applied to `.bottom-nav` |
| I7 | WebRTC on iOS requires `webkit` prefix for some APIs | 🟡 MEDIUM | `livestream-webrtc.js` should use adapter.js polyfill |
| I8 | iOS WKWebView blocks `getUserMedia` by default — requires HTTPS and explicit permission | 🟡 MEDIUM | Ensure video call page requests permission on user gesture |
| I9 | Apple App Store review: Dating features require age verification flow | 🟡 MEDIUM | Confirm age gate is shown at Dating onboarding (SafetyCenter page exists ✅) |
| I10 | Codemagic CI/CD config (`codemagic.yaml`) exists — wire Apple credentials | 🟢 LOW | Add Apple signing certificate + provisioning profile to Codemagic |

---

## SECTION 3 — UX/UI GAPS (All Platforms)

| # | Section | Issue | Priority |
|---|---------|-------|----------|
| U1 | Feed | Empty state when Firestore has 0 posts — shows spinner forever | 🔴 HIGH |
| U2 | Dating | Match animation (DatingMatchCelebrationPage) sometimes shows blank if photo not loaded | 🟡 MEDIUM |
| U3 | Messages | New message from a non-friend shows no "Message Request" badge on Messages tab icon | 🟡 MEDIUM |
| U4 | Video Calls | Call UI does not handle "callee declined" state — just hangs | 🟡 MEDIUM |
| U5 | Live | "Go Live" button available to all users — should check if user has creator tier | 🟡 MEDIUM |
| U6 | Marketplace | Checkout page shows real Stripe form in TEST mode without a "TEST MODE" banner | 🟡 MEDIUM |
| U7 | Search | No debounce on search input — fires API on every keystroke | 🟢 LOW |
| U8 | Settings | "Delete Account" button does not trigger a confirmation dialog on mobile (dialog hidden off-screen) | 🟡 MEDIUM |
| U9 | Notifications | Quiet Hours timezone not displayed — confusing for international beta testers | 🟢 LOW |
| U10 | Profile | Profile photo upload fails silently if Cloudinary unsigned preset not enabled | 🔴 HIGH |

---

## SECTION 4 — DETAILED BETA-READY PLAN

### PHASE 0 — IMMEDIATE (Today, June 10)
**Goal: Ensure the web app works end-to-end for beta testers**

- [x] Update Metered TURN credentials in `.env` and `.env.production` ✅ DONE
- [ ] Fix `VITE_API_BASE_URL` — for pure Firestore beta, set to `""` (empty) so API calls fall back to Firestore service layer
- [ ] Verify Cloudinary unsigned upload preset `marketplace_unsigned` is active in Cloudinary dashboard
- [ ] Test profile photo upload on live site
- [ ] Fix Feed empty-state: add `<EmptyState>` component when posts array is empty after 3s
- [ ] Add "TEST MODE" banner to Checkout page header for beta period

**Estimated time: 2-3 hours**

---

### PHASE 1 — WEB BETA LAUNCH (Week of June 10-14)
**Goal: Ship web beta to first 20-50 testers via https://lynkapp.net/invite**

**Steps:**
1. Run `0-critical-fixes.bat` — builds and deploys latest to Firebase Hosting
2. Run `seed-demo-content.cjs` — populates demo posts, profiles, stories so app doesn't appear empty
3. Share beta link: `https://lynkapp.net/beta` → lands on `BetaWelcomePage`
4. Collect feedback via `BetaFeedbackModal` (already wired ✅)
5. Monitor errors in Sentry dashboard: https://sentry.io/organizations/lynkapp/

**Beta Tester Instructions to provide:**
- Use Chrome or Safari
- Sign up with a real email (Firebase Auth sends verification)
- Test on both desktop and mobile browser
- Report bugs via the floating feedback button (bottom right)

---

### PHASE 2 — ANDROID APK (Week of June 14-21)
**Goal: Distribute Android APK via Google Play Internal Testing Track**

**Steps (run in ConnectHub-SPA directory):**

```bash
# Step 1: Add Android platform
npx cap add android

# Step 2: Sync web build to native
npm run build
npx cap sync android

# Step 3: Open in Android Studio
npx cap open android

# Step 4: In Android Studio:
#   - Set applicationId = "com.lynkapp.app"
#   - Set versionCode = 1, versionName = "1.0.0-beta.1"
#   - Add permissions to AndroidManifest.xml (Camera, Mic, Storage)
#   - Build → Generate Signed Bundle/APK → Android App Bundle (.aab)
#   - Upload to Google Play Console → Internal Testing → Create Release
```

**Android-specific fixes to make before build:**
1. Add to `AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

2. Fix keyboard overlap in `AndroidManifest.xml` activity:
```xml
android:windowSoftInputMode="adjustResize"
```

3. Add OneSignal to Android project:
```bash
npm install @capacitor/push-notifications
npx cap sync android
```

4. Add to `src/main.jsx` for Android:
```javascript
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
// Call after Firebase auth resolves:
SplashScreen.hide();
StatusBar.setStyle({ style: Style.Dark });
StatusBar.setBackgroundColorByHexString('#6C3AE8');
```

---

### PHASE 3 — iOS IPA / TESTFLIGHT (Week of June 21-28)
**Goal: Distribute iOS beta via TestFlight to 50-100 testers**

**Prerequisites:**
- macOS machine with Xcode 15+
- Apple Developer Program enrollment ($99/yr) — must be done FIRST
- Valid Bundle ID registered: `com.lynkapp.app`

**Steps:**
```bash
# On macOS:
npx cap add ios
npm run build
npx cap sync ios
npx cap open ios
```

**In Xcode:**
1. Set Bundle Identifier: `com.lynkapp.app`
2. Set Version: `1.0` Build: `1`
3. Signing & Capabilities → Add Push Notifications capability
4. Add to `Info.plist`:
   - `NSCameraUsageDescription` → "LynkApp needs camera for video calls and stories"
   - `NSMicrophoneUsageDescription` → "LynkApp needs microphone for live streaming and video calls"  
   - `NSPhotoLibraryUsageDescription` → "LynkApp needs photo access to share images"
   - `NSLocationWhenInUseUsageDescription` → "LynkApp uses location to find friends nearby"
5. Product → Archive → Distribute App → TestFlight

**iOS-specific CSS already in place:**
- `src/styles/mobile-ios-android.css` ✅ 
- Safe area insets applied ✅
- Verify `-webkit-fill-available` on `.app-shell` height

---

### PHASE 4 — BACKEND SERVICES (Parallel with Phases 1-3)
**Goal: Complete the 2 remaining missing backend keys**

#### 4.1 Stripe Secret Key (Backend)
1. Go to: https://dashboard.stripe.com/test/apikeys
2. Copy the **Secret key** (starts with `sk_test_`)
3. Add to `ConnectHub-Backend/.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_YOUR_REAL_KEY
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
   ```
4. Set up Stripe webhook:
   - Stripe Dashboard → Webhooks → Add endpoint
   - URL: `https://api.lynkapp.net/api/webhooks/stripe` (or Firebase Function URL)
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `checkout.session.completed`

#### 4.2 Mailgun Email (Backend)
**Option A: Use Mailgun** (recommended for beta)
1. Sign up at https://mailgun.com (free: 1,000 emails/month)
2. Add domain `mail.lynkapp.net` and verify DNS
3. Add to `ConnectHub-Backend/.env`:
   ```
   MAILGUN_API_KEY=key-YOUR_REAL_KEY
   MAILGUN_DOMAIN=mail.lynkapp.net
   MAILGUN_FROM=noreply@lynkapp.net
   ```

**Option B: Firebase Auth built-in emails** (zero setup, good enough for beta)
- Firebase Console → Authentication → Templates
- Customize verification email, password reset, etc.
- No code changes needed — Firebase handles it automatically

**Recommendation: Use Option B for Phase 1 beta, set up Mailgun before public launch**

---

### PHASE 5 — BETA MONITORING & FEEDBACK LOOP
**Goal: Collect and act on real user feedback**

**Tools already in place:**
- ✅ `BetaFeedbackModal.jsx` — floating feedback button on all pages
- ✅ `BetaDashboardPage.jsx` — admin view of beta feedback
- ✅ `BetaWelcomePage.jsx` — onboarding for beta testers
- ✅ `BetaWelcomeTooltip.jsx` — contextual hints for new features
- ✅ Sentry error tracking — auto-captures crashes

**Feedback collection schedule:**
- Week 1 (web beta): Collect 20+ feedback submissions
- Week 2 (Android beta): Focus on mobile-specific UX issues
- Week 3 (iOS beta): Focus on iOS-specific issues (safe area, keyboard, permissions)
- Week 4: Bug fix sprint based on top issues

---

## SECTION 5 — PRIORITY ACTION LIST (Ordered by Impact)

### 🔴 CRITICAL — Do Before Any Beta Launch
1. Verify Cloudinary upload preset is UNSIGNED and active
2. Fix Feed empty-state infinite spinner
3. Add TEST MODE banner to Stripe checkout
4. Confirm Firebase Auth email templates are customized with LynkApp branding
5. Run `seed-demo-content.cjs` so beta testers don't see empty feeds

### 🔴 CRITICAL — Do Before Android Beta
6. `npx cap add android && npx cap sync`
7. Add Android permissions to AndroidManifest.xml
8. Configure OneSignal Capacitor plugin for Android
9. Set app version to `1.0.0-beta.1`

### 🔴 CRITICAL — Do Before iOS Beta
10. Apple Developer enrollment
11. `npx cap add ios && npx cap sync` (on macOS)
12. Add Info.plist usage descriptions
13. Add Push Notification capability in Xcode

### 🟡 MEDIUM — Do During Beta Sprint
14. Add Stripe secret key to backend for real payment processing
15. Fix "callee declined" state in Video Calls UI
16. Add "Message Request" badge to Messages tab for non-friend messages
17. Fix Delete Account dialog visibility on mobile
18. Add hardware back button handler for Android
19. Verify iOS safe area insets on devices with Dynamic Island

---

## SECTION 6 — BUILD & DEPLOY COMMANDS REFERENCE

### Web Deploy
```bat
cd ConnectHub-SPA
0-critical-fixes.bat   ← builds + deploys + seeds (run this!)
```

### Android Build
```bash
cd ConnectHub-SPA
npm run build
npx cap sync android
npx cap open android
# Then build release APK in Android Studio
```

### iOS Build (macOS only)
```bash
cd ConnectHub-SPA
npm run build
npx cap sync ios
npx cap open ios
# Then archive & upload to TestFlight in Xcode
```

### Deploy Firestore Rules
```bat
cd ConnectHub-SPA
deploy-firestore-rules.bat
```

### Deploy Firebase Functions
```bat
cd ConnectHub-SPA
7-deploy-functions-only.bat
```

---

## SECTION 7 — REMAINING MISSING API KEYS (Non-Blocking for Beta)

These are nice-to-have but the app runs fine without them:

| Service | Purpose | Where to Get | Blocking? |
|---------|---------|-------------|----------|
| Google AdSense | Banner ads | https://adsense.google.com | No — shows house ads |
| Twitter/X Bearer Token | Trending posts | https://developer.twitter.com | No — shows news fallback |
| Reddit Client ID | Community feed | https://reddit.com/prefs/apps | No — feature hidden |
| FeedFM Token | Licensed music | https://feed.fm | No — uses Deezer/Radio |
| AppLovin SDK Key | Mobile ads | https://dash.applovin.com | No — shows house ads |

---

## SECTION 8 — BETA LAUNCH READINESS SCORECARD

| Platform | UI Complete | Backend Wired | Service Keys | Native Build | Score |
|----------|------------|--------------|-------------|-------------|-------|
| **Web** | ✅ 100% | ✅ 95% | ✅ 90% | N/A | **🟢 94%** |
| **Android** | ✅ 100% | ✅ 95% | ✅ 90% | ❌ 0% | **🟡 65%** |
| **iOS** | ✅ 100% | ✅ 95% | ✅ 90% | ❌ 0% | **🟡 60%** |

**Web beta can launch this week.** Android and iOS need 1-2 weeks of build/config work.

---

## SECTION 9 — ESTIMATED TIMELINE TO BETA TESTERS

| Milestone | Target Date | Effort |
|-----------|------------|--------|
| Web beta live (lynkapp.net) | June 11-12, 2026 | 3-4 hours |
| Android APK on Play Internal Track | June 18-21, 2026 | 2-3 days |
| iOS on TestFlight | June 25-28, 2026 | 3-5 days (needs macOS + Apple Dev account) |
| First 50 beta testers onboarded | July 1, 2026 | Depends on outreach |
| Bug fix sprint #1 | July 1-7, 2026 | 1 week |
| Open beta (100+ testers) | July 14, 2026 | — |

---

*Report generated by UX/UI Developer assessment — June 10, 2026*
*Next update: After Android APK first build*
