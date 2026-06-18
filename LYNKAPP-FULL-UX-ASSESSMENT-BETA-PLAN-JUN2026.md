# LynkApp — Full UX/UI Assessment & Beta-Ready Plan
**Date:** June 17, 2026  
**Prepared by:** UX/UI Engineering Audit  
**Scope:** Web, Android, iOS — ConnectHub-SPA (React/Vite/Capacitor)

---

## EXECUTIVE SUMMARY

LynkApp is a feature-rich social platform with 12 completed major sections, Firebase backend, Capacitor mobile builds, and a comprehensive React SPA. The app is **approximately 80–85% ready for beta**. The remaining 15–20% is primarily:

1. **Build pipeline repair** (the Vite React SPA cannot currently produce a production bundle)
2. **Android asset configuration** (google-services.json must be placed correctly)
3. **iOS build environment** (requires Mac + Xcode + Apple Developer account)
4. **Critical UX polish** across all three platforms
5. **Missing API keys / placeholder data** visible to beta testers
6. **Performance / code-splitting** (bundle is currently unoptimized for mobile)

---

## SECTION 1 — ARCHITECTURE AUDIT

### 1.1 App Structure (Two Codebases — This Is the Core Problem)

| Codebase | Location | Status |
|----------|----------|--------|
| **React SPA (THE real app)** | `ConnectHub-SPA/` | ⚠️ BUILD BROKEN |
| Old HTML monolith | `LynkApp-Production-App/` | ✅ Builds fine (wrong codebase) |
| Legacy prototype | `ConnectHub-Frontend/` | ❌ Archived, not used |

**CRITICAL FINDING:** When `npm run build` is run from the workspace root, it executes the OLD monolith builder (`build-production.js`), NOT the Vite/React SPA. The real app lives in `ConnectHub-SPA/` and must be built separately.

### 1.2 Tech Stack
```
Frontend:   React 18 + Vite 5.4 + React Router v6
Mobile:     Capacitor 5 (iOS + Android native shells)
Backend:    Firebase (Firestore, Auth, Storage, Cloud Functions)
State:      Zustand (useAppStore.js)
Styling:    Tailwind CSS + global.css + mobile-ios-android.css
APIs:       Firebase, Stripe, Giphy, Pexels, RAWG, YouTube, Cloudinary, OneSignal
PWA:        Service Worker + Web App Manifest
```

### 1.3 Page/Route Count
The app has **120+ routes** across 12 sections:
- Auth & Onboarding (6 pages)
- Feed & Home (8+ pages)
- Stories (6 pages)
- Live Streaming (12+ pages)
- Dating (8+ pages)
- Messages & Chat (8+ pages)
- Notifications (4 pages)
- Profile (6+ pages)
- Friends (5 pages)
- Groups (5+ pages)
- Events (6 pages)
- Marketplace (10+ pages)
- Admin, Creator, Business, Gaming, AR/VR, Music (20+ pages)

---

## SECTION 2 — BUILD PIPELINE ISSUES (MUST FIX BEFORE BETA)

### 2.1 Root Cause
The root `package.json` `build` script runs `node build-production.js` which processes old monolith files — NOT the Vite React SPA. The Vite binary conflict (root-level vite v8 vs local vite v5) prevents standard `vite build` from working.

### 2.2 Fix: Correct Vite Build Command
To build the React SPA correctly:
```batch
cd ConnectHub-SPA
node_modules\.bin\vite.cmd build
```
OR add a dedicated script to `ConnectHub-SPA/package.json`:
```json
"scripts": {
  "build:spa": "node_modules\\.bin\\vite.cmd build",
  "build:android": "node_modules\\.bin\\vite.cmd build && npx cap sync android",
  "build:ios": "node_modules\\.bin\\vite.cmd build && npx cap sync ios"
}
```

### 2.3 Fix: Update 3-build-production.bat
Replace the content of `ConnectHub-SPA/3-build-production.bat`:
```batch
@echo off
echo Building LynkApp React SPA with Vite...
cd /d %~dp0
node_modules\.bin\vite.cmd build
echo Build complete. Output in ConnectHub-SPA\dist\
```

### 2.4 Firebase Hosting Fix
Ensure `ConnectHub-SPA/firebase.json` rewrites the SPA correctly:
```json
{
  "hosting": {
    "public": "dist",
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  }
}
```
The `dist/` folder must contain the Vite output — **not** the old `ConnectHub-Frontend/dist/`.

---

## SECTION 3 — WEB PLATFORM ASSESSMENT

### 3.1 What's Working ✅
- Firebase Auth (login, signup, email verify, forgot password)
- Firestore data layer for all 12 sections
- React Router navigation (all 120+ routes registered in App.jsx)
- PWA manifest + service worker for offline + install prompt
- Cookie consent banner
- Legal pages (Terms, Privacy, Cookie Policy)
- Beta welcome + feedback modal
- Admin dashboard (KYC, verification, reports, analytics)
- Error boundaries + skeleton loaders + empty states

### 3.2 Critical Web Issues ❌

#### Build Not Deployed to Firebase
**Problem:** Firebase Hosting may be serving an old/stale build. The React SPA has never had a clean Vite production build run successfully.  
**Fix:** Run `ConnectHub-SPA/node_modules/.bin/vite.cmd build` then deploy dist/ to Firebase Hosting.

#### API Keys Showing as "MISSING_*"
**Problem:** `.env` has placeholder values for AdSense, AppLovin, IronSource, FeedFM, Twitter, Reddit:
```
VITE_ADSENSE_PUBLISHER_ID=MISSING_ca-pub-REPLACE_WITH_YOUR_PUBLISHER_ID
VITE_APPLOVIN_SDK_KEY=MISSING_REPLACE_WITH_APPLOVIN_SDK_KEY
```
**Impact:** AdUnit.jsx likely renders broken/empty ad slots to beta users  
**Fix:** Either obtain real keys OR ensure `AdUnit.jsx` gracefully hides when keys are missing

#### Stripe is Test Mode in .env.production
**Problem:** `.env.production` has `pk_test_51Sk8Oy...` (test key)  
**Fix:** Confirm whether beta testers should use test mode (acceptable for beta) — if yes, document this clearly

#### VITE_API_BASE_URL is Empty
**Problem:** Both `.env` files have `VITE_API_BASE_URL=` blank  
**Impact:** Any component calling the REST backend (`api-client.js`) will fail silently  
**Fix:** Point to active Firebase Cloud Functions URL or leave blank and ensure all data goes through Firestore SDK

### 3.3 UX Gaps — Web

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| W1 | Long initial load (120+ components in one bundle) | 🔴 HIGH | Implement React.lazy() code splitting in App.jsx |
| W2 | No loading skeleton on first app paint | 🔴 HIGH | SplashScreen.jsx must show while Firebase auth resolves |
| W3 | Missing "Install App" prompt for PWA | 🟡 MED | Trigger beforeinstallprompt in AppShell.jsx |
| W4 | Desktop layout missing sidebar | 🟡 MED | BottomNav is mobile-only; need sidebar nav for >768px |
| W5 | Story viewer doesn't support keyboard navigation | 🟡 MED | Add arrow key handlers in StoryViewerPage.jsx |
| W6 | Video call room has no fallback if WebRTC fails | 🔴 HIGH | Show "Browser not supported" message |
| W7 | Dating swipe gestures don't work with mouse | 🟡 MED | Add mouse drag support in DatingPage.jsx |
| W8 | Cookie consent banner blocks interaction on mobile | 🟡 MED | Reduce to bottom bar, add Accept All button |
| W9 | No 404 handling for /post/:id with deleted posts | 🟡 MED | NotFoundPage.jsx exists — wire to Firestore miss |
| W10 | Search page has no debounce on input | 🟢 LOW | Add 300ms debounce in SearchPage.jsx |

---

## SECTION 4 — ANDROID PLATFORM ASSESSMENT

### 4.1 Current Setup
- `ConnectHub-SPA/android/` — Capacitor Android project exists
- `ConnectHub-SPA/capacitor.config.json` — configured
- `ConnectHub-SPA/codemagic.yaml` — CI/CD configured
- `google-services.json` is currently in `Downloads/` folder — **NOT in the correct location**

### 4.2 Critical Android Issues ❌

#### google-services.json Not in Place
**Problem:** `google-services.json` is at `C:\Users\Jnewball\Downloads\google-services.json`  
**Required location:** `ConnectHub-SPA/android/app/google-services.json`  
**Fix:**
```batch
copy "C:\Users\Jnewball\Downloads\google-services.json" "C:\Users\Jnewball\Test-apps\Test-apps\ConnectHub-SPA\android\app\google-services.json"
```

#### Build Never Synced with Current React Code
**Problem:** `npx cap sync` has likely not been run since the last React code changes  
**Fix:** After fixing the Vite build, run:
```batch
cd ConnectHub-SPA
npx cap sync android
```

#### No APK Available for Beta Distribution
**Fix Options:**
1. **Firebase App Distribution** (recommended for beta): Build debug APK → upload to Firebase console
2. **Internal Testing Track** on Google Play Console
3. **Direct APK sideload** via build-and-install.bat (for internal testers only)

#### Gradle Version Compatibility
**Check needed:** `android/gradle/wrapper/gradle-wrapper.properties` — ensure Gradle version matches Android Studio version

### 4.3 Android UX Issues

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| A1 | Android back button closes app instead of navigating back | 🔴 HIGH | Add `App.addListener('backButton', ...)` from `@capacitor/app` |
| A2 | Status bar overlaps app header on Android | 🔴 HIGH | Add `StatusBar.setOverlaysWebView({ overlay: false })` |
| A3 | Keyboard pushes content up unexpectedly | 🟡 MED | Set `android:windowSoftInputMode="adjustPan"` in AndroidManifest.xml |
| A4 | Push notifications not configured (FCM) | 🔴 HIGH | Complete OneSignal + FCM setup, add to Android manifest |
| A5 | Camera/media picker not configured | 🟡 MED | Add `@capacitor/camera` plugin to capacitor.config.json |
| A6 | No deep link handling (lynkapp.net/profile/:id) | 🟡 MED | Add intent filter in AndroidManifest.xml |
| A7 | Splash screen resolution doesn't match Android standards | 🟡 MED | Provide 9-patch or adaptive icons in all densities |
| A8 | Video calls using browser WebRTC — may fail on some Android browsers | 🔴 HIGH | Test on Chrome for Android; add browser detection |
| A9 | Large JS bundle slows app startup (455KB+ JS) | 🔴 HIGH | Enable Vite code splitting — critical for Android WebView |
| A10 | No haptic feedback on key interactions (match, like, swipe) | 🟢 LOW | Use `@capacitor/haptics` for premium feel |

### 4.4 Android Build Steps (Step-by-Step)

```
Step 1: Copy google-services.json to android/app/
Step 2: Fix Vite build (section 2.2)
Step 3: cd ConnectHub-SPA && node_modules\.bin\vite.cmd build
Step 4: npx cap sync android
Step 5: Open android/ in Android Studio
Step 6: Build → Build Bundle/APK → Build APK
Step 7: Upload APK to Firebase App Distribution
Step 8: Send invite link to beta testers
```

### 4.5 Android Performance Targets (for Beta)
| Metric | Target | Current Estimate |
|--------|--------|-----------------|
| App cold start | < 3s | ~5-8s (unoptimized) |
| JS bundle size | < 250KB | ~455KB (no code split) |
| Time to interactive | < 4s | ~8s |
| Memory usage | < 150MB | Unknown |

---

## SECTION 5 — IOS PLATFORM ASSESSMENT

### 5.1 Current Setup
- Capacitor iOS project configured (needs Mac to build)
- `codemagic.yaml` has iOS CI/CD pipeline configured
- No iOS build has been executed yet

### 5.2 iOS Build Requirements

| Requirement | Status |
|-------------|--------|
| Mac with Xcode 15+ | ❓ Not confirmed |
| Apple Developer Account ($99/yr) | ❓ Not confirmed |
| Provisioning Profile | ❌ Not created |
| App Store Connect app created | ❌ Not confirmed |
| Push notification entitlement | ❌ Not configured |

### 5.3 Critical iOS Files Needed
1. **`ios/App/App/Info.plist`** — must include:
   - `NSCameraUsageDescription` — "LynkApp needs camera access for video calls and AR filters"
   - `NSPhotoLibraryUsageDescription` — "LynkApp needs photo access to share images"
   - `NSMicrophoneUsageDescription` — "LynkApp needs microphone access for live streaming and video calls"
   - `NSLocationWhenInUseUsageDescription` — "LynkApp uses location for nearby friends feature"

2. **`ios/App/App/GoogleService-Info.plist`** — Firebase iOS config (from Firebase console)

3. **APS (Apple Push Notification) certificate** — for OneSignal iOS push notifications

### 5.4 iOS UX Issues

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| I1 | Safe area not respected on iPhone 14/15 (notch/dynamic island) | 🔴 HIGH | `mobile-ios-android.css` exists — verify `env(safe-area-inset-*)` is applied |
| I2 | iOS scroll bounce causes layout shifts | 🟡 MED | Add `overscroll-behavior: none` on main scroll containers |
| I3 | Input fields zoom on focus (font-size < 16px) | 🔴 HIGH | Ensure all inputs have `font-size: 16px` or add `touch-action: manipulation` |
| I4 | Swipe-back gesture conflicts with app navigation | 🟡 MED | Handle `ionViewWillLeave` or disable system gesture in Capacitor config |
| I5 | WKWebView limitations for video calling | 🔴 HIGH | Test WebRTC on WKWebView; may need native module |
| I6 | No native haptic feedback | 🟡 MED | Use `@capacitor/haptics` |
| I7 | Keyboard + fixed bottom nav overlap on iOS | 🔴 HIGH | Use `visualViewport` API to adjust layout |
| I8 | No iOS share sheet integration | 🟡 MED | Use `@capacitor/share` for native share |

### 5.5 iOS Beta Distribution (TestFlight)

```
Step 1: Create iOS Capacitor project (requires Mac):
        npx cap add ios

Step 2: Open ios/ in Xcode:
        npx cap open ios

Step 3: Set Bundle Identifier: net.lynkapp.app

Step 4: Configure signing (Apple Developer account)

Step 5: Archive → Distribute to TestFlight

Step 6: Add beta testers in App Store Connect → TestFlight

Step 7: Testers receive email invite
```

---

## SECTION 6 — FEATURE COMPLETENESS AUDIT

### 6.1 Core Features (Beta-Critical)
| Feature | Web | Android | iOS | Notes |
|---------|-----|---------|-----|-------|
| Login/Signup | ✅ | ⚠️ | ❌ | Android needs sync |
| Profile setup | ✅ | ⚠️ | ❌ | |
| Feed (view posts) | ✅ | ⚠️ | ❌ | |
| Create post | ✅ | ⚠️ | ❌ | |
| Stories | ✅ | ⚠️ | ❌ | |
| Messages (1:1) | ✅ | ⚠️ | ❌ | |
| Notifications | ✅ | ⚠️ | ❌ | Push needs FCM |
| Search | ✅ | ⚠️ | ❌ | |
| Friends | ✅ | ⚠️ | ❌ | |
| Settings | ✅ | ⚠️ | ❌ | |
| Terms/Privacy | ✅ | ⚠️ | ❌ | |

### 6.2 Advanced Features (Nice-to-Have for Beta)
| Feature | Status | Notes |
|---------|--------|-------|
| Dating (swipe) | ✅ Web | Needs mobile gesture tuning |
| Live streaming | ✅ Web | WebRTC on mobile unverified |
| Video calls | ✅ Web | WebRTC on mobile unverified |
| Marketplace | ✅ Web | Stripe test mode only |
| AR/VR filters | ⚠️ | DeepAR key exists, needs testing |
| Gaming hub | ✅ Web | RAWG API connected |
| Music player | ✅ Web | No licensed music yet (FeedFM missing) |
| Crypto wallet | ✅ Web UI | Backend integration incomplete |

### 6.3 Missing API Keys Impacting UX
| API | Impact | Priority |
|-----|--------|----------|
| AdSense (`MISSING_ca-pub-*`) | Broken ad slots visible | 🔴 Hide or fix |
| Twitter Bearer Token | Trending shows no tweets | 🟡 Use fallback content |
| Reddit Client ID | Community section empty | 🟡 Use fallback content |
| FeedFM Token | Music player has no licensed audio | 🟡 Use fallback |

---

## SECTION 7 — DETAILED BETA-READY ACTION PLAN

### PHASE 1 — BUILD FIX (Week 1, Day 1-2) 🔴 BLOCKING

**Goal:** Get a working Vite production build deployed to Firebase Hosting

```
Action 1.1: Fix the Vite build
  File: ConnectHub-SPA/3-build-production.bat
  Change: Replace content with:
    @echo off
    cd /d %~dp0
    node_modules\.bin\vite.cmd build
  
Action 1.2: Run the build
  cd ConnectHub-SPA
  node_modules\.bin\vite.cmd build
  
Action 1.3: Verify dist/ folder has index.html + assets/
  
Action 1.4: Deploy to Firebase
  firebase deploy --only hosting
```

**Expected result:** App loads at https://lynkapp-c7db1.web.app

---

### PHASE 2 — ANDROID SETUP (Week 1, Day 2-3) 🔴 BLOCKING

**Goal:** Produce a working Android APK for beta testers

```
Action 2.1: Move google-services.json
  copy "C:\Users\Jnewball\Downloads\google-services.json" 
       "ConnectHub-SPA\android\app\google-services.json"

Action 2.2: Sync Capacitor
  cd ConnectHub-SPA
  npx cap sync android

Action 2.3: Fix Android back button (add to AppShell.jsx or App.jsx)
  import { App as CapApp } from '@capacitor/app';
  useEffect(() => {
    CapApp.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack) { CapApp.exitApp(); }
      else { window.history.back(); }
    });
  }, []);

Action 2.4: Fix status bar
  import { StatusBar, Style } from '@capacitor/status-bar';
  StatusBar.setStyle({ style: Style.Dark });
  StatusBar.setBackgroundColor({ color: '#0a0a18' });

Action 2.5: Build APK in Android Studio
  Open ConnectHub-SPA/android/ in Android Studio
  Build → Build Bundle/APK → Build APK(s)
  
Action 2.6: Set up Firebase App Distribution
  Go to Firebase Console → App Distribution
  Upload the generated APK
  Add beta tester emails
```

---

### PHASE 3 — CRITICAL UX FIXES (Week 1, Day 3-5) 🔴 HIGH PRIORITY

#### 3.1 Performance — Code Splitting
**File:** `ConnectHub-SPA/src/App.jsx`  
Add React.lazy() for heavy routes:
```jsx
// Replace direct imports with lazy imports for heavy sections
const MarketplacePage = React.lazy(() => import('./pages/marketplace/MarketplacePage'));
const LivePage = React.lazy(() => import('./pages/live/LivePage'));
const DatingPage = React.lazy(() => import('./pages/dating/DatingPage'));
const ARVRPage = React.lazy(() => import('./pages/arvr/ARVRPage'));
// Wrap <Routes> in <Suspense fallback={<SkeletonLoader />}>
```
**Expected result:** Initial bundle drops from ~455KB to ~120KB

#### 3.2 Fix Ad Slots Showing Broken Placeholders
**File:** `ConnectHub-SPA/src/components/ads/AdUnit.jsx`  
Add guard:
```jsx
const publisherId = import.meta.env.VITE_ADSENSE_PUBLISHER_ID;
if (!publisherId || publisherId.includes('MISSING')) {
  return null; // Hide completely — don't show broken ad slots to beta testers
}
```

#### 3.3 Fix Input Zoom on iOS
**File:** `ConnectHub-SPA/src/styles/global.css`  
Add:
```css
input, textarea, select {
  font-size: 16px !important; /* Prevents iOS zoom on focus */
}
```

#### 3.4 Safe Area for iOS/Android
**File:** `ConnectHub-SPA/src/components/layout/AppShell.jsx`  
Verify bottom nav uses:
```css
padding-bottom: calc(60px + env(safe-area-inset-bottom));
```

#### 3.5 Offline State
**File:** `ConnectHub-SPA/src/components/common/OfflineOverlay.jsx`  
Confirm this component renders and blocks interaction when `navigator.onLine` is false.

---

### PHASE 4 — iOS SETUP (Week 2) 🟡 NEEDS MAC

```
Action 4.1: On Mac, initialize iOS project
  cd ConnectHub-SPA
  npx cap add ios

Action 4.2: Add GoogleService-Info.plist
  Firebase Console → Project Settings → iOS → Download GoogleService-Info.plist
  Place in ios/App/App/GoogleService-Info.plist

Action 4.3: Update Info.plist with required usage descriptions
  NSCameraUsageDescription
  NSPhotoLibraryUsageDescription
  NSMicrophoneUsageDescription
  NSLocationWhenInUseUsageDescription

Action 4.4: Set Bundle ID
  net.lynkapp.app (or com.lynkapp.app)

Action 4.5: Configure push notifications
  Xcode → Signing & Capabilities → Add "Push Notifications"
  Add "Background Modes" → "Remote notifications"

Action 4.6: Build + Archive + TestFlight
  Product → Archive → Distribute App → TestFlight
```

---

### PHASE 5 — BETA TESTER EXPERIENCE (Week 2) 🟡 IMPORTANT

#### 5.1 Beta Welcome Flow
✅ `BetaWelcomePage.jsx` exists — ensure it shows on first login  
✅ `BetaFeedbackModal.jsx` exists — ensure it appears after key actions  
✅ `BetaDashboardPage.jsx` exists — accessible from menu  

#### 5.2 Seed Data for Empty State
**Action:** Run `seed-demo-content.cjs` to populate Firestore with demo posts, profiles, events so new beta testers see a non-empty app.

#### 5.3 Beta Tester Guide
Create a PDF/web page with:
- How to report bugs (in-app feedback modal → Firestore)
- Known limitations (test mode payments, etc.)
- Features to focus on testing
- Contact info for support

#### 5.4 Crash Monitoring
✅ Sentry is configured (`VITE_SENTRY_DSN` in `.env`)  
**Action:** Verify Sentry is initialized in `src/main.jsx`

---

### PHASE 6 — BETA LAUNCH CHECKLIST

#### Web ✅ Checklist
- [ ] Vite build completes without error
- [ ] App loads at https://lynkapp.net
- [ ] Login / Signup works with real accounts
- [ ] Feed shows content (seed data loaded)
- [ ] Stories viewable and creatable
- [ ] Messages send in real-time (Firestore)
- [ ] Notifications work (browser push via OneSignal)
- [ ] Settings save and persist
- [ ] Terms / Privacy pages accessible
- [ ] Cookie consent works
- [ ] PWA install prompt appears
- [ ] No "MISSING_*" placeholder text visible
- [ ] Sentry captures errors in dashboard
- [ ] AdSense slots hidden or real ads showing

#### Android ✅ Checklist  
- [ ] google-services.json in android/app/
- [ ] APK installs on Android 8+ (API 26+)
- [ ] App icon shows correctly on home screen
- [ ] Splash screen appears then transitions
- [ ] Back button works throughout app
- [ ] Status bar correct color
- [ ] Camera permission requested when needed
- [ ] Push notifications arrive (FCM/OneSignal)
- [ ] App doesn't crash on Samsung/Pixel devices
- [ ] Video/audio plays correctly
- [ ] Keyboard doesn't break layouts
- [ ] Firebase App Distribution invite sent to testers

#### iOS ✅ Checklist
- [ ] Mac build environment set up
- [ ] Bundle ID registered in App Store Connect
- [ ] Provisioning profile signed
- [ ] All NSUsageDescription strings in Info.plist
- [ ] GoogleService-Info.plist in place
- [ ] Safe area respected on iPhone 14/15 (dynamic island)
- [ ] No input zoom on focus
- [ ] Swipe back gesture doesn't conflict with app navigation
- [ ] Push notifications arrive
- [ ] TestFlight invite sent to testers

---

## SECTION 8 — UX DESIGN RECOMMENDATIONS FOR BETA

### 8.1 Navigation
**Current:** Two navigation components (`BottomNav.jsx` + `MobileBottomNav.jsx`) — unclear which is active  
**Recommendation:** Standardize on ONE bottom nav. Use `MobileBottomNav.jsx` for mobile (Capacitor) and `BottomNav.jsx` for PWA/web. Control via `Capacitor.isNativePlatform()`.

### 8.2 Onboarding Flow
**Current:** OnboardingPage.jsx exists but flow needs verification  
**Recommended flow:**
1. Splash Screen → 2. Sign Up / Log In → 3. Profile Setup (photo, name, interests) → 4. Friend suggestions → 5. Feed  
**Critical:** New users should NOT land on an empty feed. Seed data or "Explore" content must show.

### 8.3 Dark Mode (LynkApp's native theme)
**Status:** Global CSS uses dark background (`#0a0a18`)  
**Verify:** All 120+ pages use CSS variables — no hardcoded light colors breaking dark UI

### 8.4 Typography & Spacing
**Minimum touch targets:** 44×44px (iOS HIG) / 48×48dp (Material Design)  
**Audit:** Ensure bottom nav icons, action buttons, and close buttons meet this minimum

### 8.5 Loading States
**Current:** `SkeletonLoader.jsx` exists — verify it's used consistently  
**Required on:** Feed load, Profile load, Conversation load, Marketplace listings

### 8.6 Error Handling
**Current:** `PageErrorBoundary.jsx` exists  
**Required:** Every page must be wrapped in PageErrorBoundary so a single crash doesn't blank-screen the app

---

## SECTION 9 — TIMELINE TO BETA LAUNCH

| Phase | Timeline | Owner | Blocker? |
|-------|----------|-------|----------|
| Fix Vite build | Day 1 | Dev | ✅ YES |
| Deploy web to Firebase | Day 1 | Dev | ✅ YES |
| Copy google-services.json | Day 1 | Dev | ✅ YES |
| Android APK build | Day 2-3 | Dev | ✅ YES |
| Fix ad slot placeholders | Day 2 | Dev | 🟡 Yes |
| Code splitting (performance) | Day 3-4 | Dev | 🟡 Yes |
| Android back button + status bar | Day 3 | Dev | 🟡 Yes |
| iOS setup (needs Mac) | Week 2 | Dev/Mac | 🟡 Yes |
| Seed demo content | Day 4 | Dev | 🟡 Yes |
| Beta tester guide PDF | Day 5 | Product | No |
| Sentry verification | Day 4 | Dev | No |
| iOS TestFlight | Week 2-3 | Dev | 🟡 Yes |
| **Beta Launch — Web + Android** | **Day 5-7** | All | |
| **Beta Launch — iOS** | **Week 3** | All | |

---

## SECTION 10 — SPECIFIC FILES TO MODIFY

### Immediate Fixes (< 1 hour each)

| File | Change Needed |
|------|--------------|
| `ConnectHub-SPA/3-build-production.bat` | Replace with `node_modules\.bin\vite.cmd build` |
| `ConnectHub-SPA/android/app/` | Add `google-services.json` |
| `ConnectHub-SPA/src/components/ads/AdUnit.jsx` | Add MISSING key guard → return null |
| `ConnectHub-SPA/src/styles/global.css` | Add `input { font-size: 16px !important; }` |
| `ConnectHub-SPA/src/App.jsx` | Wrap routes in `<Suspense>` + add `React.lazy()` for heavy pages |
| `ConnectHub-SPA/src/components/layout/AppShell.jsx` | Add Capacitor back button handler |

### Medium-Term Fixes (1-4 hours each)

| File | Change Needed |
|------|--------------|
| `ConnectHub-SPA/src/main.jsx` | Verify Sentry.init() is called with DSN |
| `ConnectHub-SPA/src/pages/dating/DatingPage.jsx` | Add mouse drag support for web swipe |
| `ConnectHub-SPA/src/pages/videocalls/VideoCallRoomPage.jsx` | Add WebRTC browser support detection |
| `ConnectHub-SPA/src/pages/live/LivePage.jsx` | Add mobile browser WebRTC fallback |
| `ConnectHub-SPA/src/services/seed-data-service.js` | Trigger seeding for new users |

---

## SECTION 11 — SUCCESS METRICS FOR BETA

| Metric | Target |
|--------|--------|
| App installs (Android) | 50+ in first week |
| Web MAU | 100+ first month |
| Crash-free rate | > 95% |
| Session length | > 3 minutes |
| D1 retention | > 40% |
| Bug reports via in-app feedback | Track all |
| Sentry error rate | < 2% of sessions |
| App Store rating (when launched) | > 4.2 |

---

## QUICK REFERENCE: WHAT TO DO RIGHT NOW

### Immediate (Today):
```
1. cd ConnectHub-SPA
2. node_modules\.bin\vite.cmd build
3. firebase deploy --only hosting
4. copy google-services.json to android\app\
5. npx cap sync android
6. Open android\ in Android Studio → Build APK
```

### This Week:
```
7. Add React.lazy() code splitting to App.jsx
8. Fix AdUnit.jsx placeholder guard
9. Add iOS font-size fix to global.css
10. Verify Sentry is capturing errors
11. Run seed-demo-content.cjs for Firestore
12. Upload APK to Firebase App Distribution
13. Send invites to first 10 Android beta testers
```

### Next Week:
```
14. Set up Mac environment for iOS build
15. Add iOS-specific Info.plist permissions
16. Build iOS archive + submit to TestFlight
17. Invite iOS beta testers
18. Monitor Sentry + Firebase Crashlytics
```

---

*Assessment completed: June 17, 2026*  
*Next review: After Phase 1 & 2 complete*
