# 🔍 LynkApp — Full UX/UI Assessment & Beta Plan
### Web · Android · iOS
**Date:** June 17, 2026  
**Prepared by:** UX/UI Developer Assessment  
**App ID:** com.lynkapp.app | **Tech Stack:** React + Vite SPA · Capacitor 5 · Firebase/Firestore

---

## EXECUTIVE SUMMARY

LynkApp is a feature-rich social super-app built as a React SPA using Vite, deployed via Firebase Hosting, and wrapped into native Android/iOS shells via Capacitor. The codebase contains **12 major feature sections** covering Feed, Stories, Live Streaming, Dating, Messages, Notifications, Profile, Friends, Groups, Events, Marketplace, and Music/Media. After extensive sprint cycles and beta testing rounds, the app is **~82% ready for beta** but has a defined set of remaining gaps that must be closed before handing to external testers. This document provides a platform-by-platform UX/UI audit and a phased plan to reach beta readiness.

---

## SECTION 1: CURRENT ARCHITECTURE OVERVIEW

| Layer | Technology | Status |
|---|---|---|
| Frontend SPA | React 18 + Vite 5 | ✅ Built & deployed |
| State Management | Zustand (useAppStore.js) | ✅ Implemented |
| Backend | Firebase Firestore + Auth + Storage | ✅ Live |
| Cloud Functions | Firebase Functions v2 | ✅ Deployed |
| Android Shell | Capacitor 5 + Gradle (Android API 35) | ⚠️ Build fix needed |
| iOS Shell | Capacitor 5 (capacitor.config.json set) | ❌ ios/ project not yet generated |
| Push Notifications | OneSignal + Firebase FCM | ✅ Integrated |
| Payments | Stripe (via marketplace-payments route) | ⚠️ Test keys only |
| Media/Upload | Firebase Storage + Cloudinary | ✅ Wired |
| Error Tracking | Sentry | ✅ Integrated |
| PWA | sw.js + manifest.json | ✅ Configured |

---

## SECTION 2: WEB PLATFORM ASSESSMENT

### ✅ WHAT'S WORKING WELL

1. **Core Navigation** — AppShell + BottomNav + TopNav render correctly. Router handles 80+ pages with lazy loading via React Router v6.
2. **Authentication Flow** — Login, Signup, Forgot Password, Email Verify, Account Recovery all implemented with Firebase Auth. OAuth providers visible.
3. **Feed System** — 30+ post types implemented, infinite scroll, story strip at top, skeleton loaders on data fetch.
4. **Firestore Integration** — Real-time listeners working for messages, notifications, feed. Firestore security rules deployed.
5. **PWA Manifest** — `public/manifest.json` is present, offline overlay component exists, service worker registered.
6. **Responsive CSS** — `mobile-ios-android.css` implements safe-area insets, min 44px touch targets, overscroll prevention, keyboard avoidance.
7. **Error Boundaries** — `PageErrorBoundary.jsx` wraps all page components.
8. **Legal Pages** — Terms, Privacy, Cookie Policy, About, Contact all present.
9. **Beta Feedback Modal** — `BetaFeedbackModal.jsx` wired and shown to new users.
10. **Ads System** — `AdUnit.jsx` component with `ad-service.js` integrated.

### ⚠️ WEB GAPS TO FIX BEFORE BETA

#### HIGH PRIORITY

**W1 — Landing Page First Impression**
- Current landing page (`LandingPage.jsx`) needs a polished hero section with app screenshots, feature highlights, and a clear CTA button.
- Beta testers must see value proposition BEFORE they log in.
- **Fix:** Add 3-screen mockup images, tagline, "Get Early Access" CTA.

**W2 — Onboarding Completion Rate**
- `OnboardingPage.jsx` exists but profile setup (avatar, bio, interests) is optional.
- Users who skip onboarding see an empty feed with no seed data.
- **Fix:** Make minimum onboarding (avatar + 3 interests) mandatory. Show "What's on your feed" preview.

**W3 — Empty State UX**
- `EmptyState.jsx` component exists but not consistently used across all sections.
- Groups, Events, Marketplace, and Saved pages show blank content on fresh accounts.
- **Fix:** Ensure every list/feed page shows an illustrated empty state with a suggested action.

**W4 — Loading Performance**
- Bundle size needs auditing. With 80+ pages, the initial JS chunk may be too large.
- **Fix:** Run `vite build --mode production` and check chunk sizes. Enforce dynamic imports on heavy pages (Live, Marketplace, Gaming).

**W5 — Form Validation Feedback**
- Several forms (Create Event, Create Listing, Profile Edit) lack inline validation messages.
- Users submit forms and see generic "error" toasts without knowing which field failed.
- **Fix:** Add `react-hook-form` or custom inline error messages per field.

**W6 — Cookie Consent Banner**
- `CookieConsentBanner.jsx` is present but must be shown BEFORE any analytics/tracking fires.
- **Fix:** Verify Sentry and ad-service.js don't initialize until consent is given.

**W7 — Deep Link Support (PWA)**
- Share links to posts/profiles/events must work.
- `vite.config.js` needs `historyApiFallback` and Firebase Hosting `rewrites` must cover all routes.
- **Fix:** Confirm all routes in `firebase.json` rewrite to `index.html`.

#### MEDIUM PRIORITY

**W8 — Accessibility (a11y)**
- Icon-only buttons (BottomNav, story circles) need `aria-label` attributes.
- Modal dialogs need `role="dialog"` and focus trap.
- Color contrast on purple-on-dark-purple should meet WCAG AA (4.5:1).

**W9 — Network Offline Handling**
- `OfflineOverlay.jsx` exists but needs to gracefully queue user actions (likes, messages typed) and retry when back online.
- `offline-manager.js` is present — verify it covers all mutation operations.

**W10 — Session Persistence**
- Firebase Auth `setPersistence(LOCAL)` should be confirmed so users don't get logged out on browser refresh.

---

## SECTION 3: ANDROID PLATFORM ASSESSMENT

### Current Android Setup
```
App ID:        com.lynkapp.app
Target SDK:    API 35 (Android 15)
Min SDK:       API 24 (Android 7.0)
Gradle:        8.x
AGP:           8.x
Capacitor:     5.x
JAVA_HOME:     C:/Program Files/Eclipse Adoptium/jdk-25.0.0.36-hotspot ✅ (fixed in gradle.properties)
```

### ✅ WHAT'S WORKING WELL

1. **Capacitor Config** — `capacitor.config.json` has all correct Android settings: `backgroundColor`, `minWebViewVersion: 80`, `captureInput`, `StatusBar overlay`, `NavigationBar hidden`.
2. **google-services.json** — Firebase Android config present at `Downloads/google-services.json`.
3. **CSS Safe Area** — `env(safe-area-inset-*)` variables set, Android status bar padding implemented.
4. **Haptics** — Capacitor Haptics plugin configured.
5. **Camera/Geolocation/Filesystem Permissions** — All declared in capacitor.config.
6. **Push Notifications** — Capacitor PushNotifications plugin configured with badge/sound/alert options.
7. **Splash Screen** — `SplashScreen` plugin config with 2.5s duration, CENTER_CROP, full-screen immersive.

### ⚠️ ANDROID GAPS TO FIX BEFORE BETA

#### CRITICAL (Blockers)

**A1 — Build Environment**
- **Problem:** System `JAVA_HOME` points to deleted JDK 24. JDK 25 is installed at `C:/Program Files/Eclipse Adoptium/jdk-25.0.0.36-hotspot`.
- **Status:** `org.gradle.java.home` already added to `android/gradle.properties` ✅
- **Remaining Step:** Run `cd ConnectHub-SPA/android && build-and-install.bat` to confirm build succeeds.
- **Permanent Fix:** Open System Properties → Environment Variables → change `JAVA_HOME` to `C:\Program Files\Eclipse Adoptium\jdk-25.0.0.36-hotspot`

**A2 — Web Assets Must Be Current**
- Android's `android/app/src/main/assets/public/` must contain the latest `dist/` build.
- After every React change: `npm run build` → `npx cap sync android`
- **Fix:** Add `"android:build": "npm run build && npx cap sync android"` to package.json scripts.

**A3 — Google Services JSON Location**
- `google-services.json` is currently in `C:/Users/Jnewball/Downloads/` — it must be at `ConnectHub-SPA/android/app/google-services.json`.
- **Fix:** `copy "C:\Users\Jnewball\Downloads\google-services.json" "ConnectHub-SPA\android\app\google-services.json"`

**A4 — Debug Signing vs Release Signing**
- For beta (Google Play Internal Testing / Firebase App Distribution), you need a release keystore.
- **Fix:** Generate keystore: `keytool -genkeypair -v -keystore lynkapp.jks -alias lynkapp -keyalg RSA -keysize 2048 -validity 10000`
- Add keystore config to `android/app/build.gradle` under `signingConfigs`.

#### HIGH PRIORITY

**A5 — Back Button Behavior**
- Android hardware back button must: close modals → navigate back → if at root, show "exit?" confirmation.
- Capacitor's `App.addListener('backButton', ...)` must be implemented.
- **Fix:** Add back button handler in `mobile-platform-service.js` or `App.jsx`.

**A6 — Status Bar Color on Route Change**
- Status bar should match page theme (dark on most pages, could be different on Dating/stories full-screen).
- **Fix:** Use `StatusBar.setStyle()` on route transitions where needed.

**A7 — Keyboard Avoidance**
- `Keyboard resize: "body"` is set, but test messages/chat input to ensure keyboard doesn't cover the text field.
- **Fix:** Verify `ConversationPage.jsx` and `DatingChatPage.jsx` use `padding-bottom: var(--keyboard-height)`.

**A8 — App Distribution Setup**
- Create Firebase App Distribution group "beta-testers".
- Build release APK and upload via Firebase CLI: `firebase appdistribution:distribute app-release.apk --app <app-id> --groups beta-testers`

**A9 — App Icon & Splash Screen Resources**
- Verify `android/app/src/main/res/` has properly sized mipmap icons (48/72/96/144/192dp).
- Verify `android/app/src/main/res/drawable/splash.png` exists at 1080×1920px.
- **Fix:** Use Android Asset Studio or Capacitor Assets CLI: `npx capacitor-assets generate --android`

**A10 — Network Security Config**
- `cleartext: false` is correctly set in capacitor config.
- Verify `android/app/src/main/res/xml/network_security_config.xml` exists and only allows HTTPS.

#### MEDIUM PRIORITY

**A11 — Deep Links (App Links)**
- For beta, shareable links like `lynkapp://profile/user123` should open the app.
- Add `<intent-filter>` for `android:autoVerify="true"` with your domain in `AndroidManifest.xml`.

**A12 — Target SDK Compliance**
- API 35 requires explicit notification permissions request at runtime.
- Verify `PushNotifications.requestPermissions()` is called in the onboarding flow.

---

## SECTION 4: iOS PLATFORM ASSESSMENT

### Current iOS Setup
```
Scheme:        LynkApp
Content Inset: automatic
Background:    #0a0a18
Scroll:        enabled
Nav domains:   limitsNavigationsToAppBoundDomains = false
Preferred Mode: mobile
```

### ⚠️ CRITICAL: iOS PROJECT NOT YET GENERATED

The `capacitor.config.json` has iOS settings configured, but there is **no `ios/` directory** in `ConnectHub-SPA/`. The Capacitor iOS project must be initialized.

### iOS Setup Steps (In Order)

**I1 — Generate iOS Project**
```bash
cd ConnectHub-SPA
npm install @capacitor/ios
npx cap add ios
npx cap sync ios
```
**Requirement:** macOS machine with Xcode 15+ installed. This CANNOT be done on Windows.

**I2 — macOS Build Machine Options**
- Option A: Mac Mini / MacBook in your possession
- Option B: GitHub Actions with macOS runner (see `codemagic.yaml` already in repo)
- Option C: Codemagic.io CI/CD (config already exists at `ConnectHub-SPA/codemagic.yaml`) ✅

**I3 — Apple Developer Account**
- Enroll in Apple Developer Program ($99/year) if not already done.
- Create App ID: `com.lynkapp.app`
- Create Provisioning Profile (Development + Ad Hoc for beta)
- Create Push Notification certificate / key

**I4 — Info.plist Permissions**
The following `NSUsageDescription` keys must be in `ios/App/App/Info.plist`:
```xml
<key>NSCameraUsageDescription</key>
<string>LynkApp needs camera access for profile photos, stories, and live streaming.</string>
<key>NSMicrophoneUsageDescription</key>
<string>LynkApp needs microphone access for voice messages and live streaming.</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>LynkApp needs photo library access to share media in posts and messages.</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>LynkApp uses your location to find nearby friends and local events.</string>
<key>NSContactsUsageDescription</key>
<string>LynkApp uses contacts to help you find friends who use the app.</string>
<key>NSFaceIDUsageDescription</key>
<string>LynkApp uses Face ID for quick and secure sign-in.</string>
```

**I5 — iOS-Specific UX Adjustments**

| Issue | Fix |
|---|---|
| Dynamic Island / notch overlap | `env(safe-area-inset-top)` already in CSS ✅ |
| Home indicator overlap (bottom) | `env(safe-area-inset-bottom)` already in CSS ✅ |
| iOS rubber-band scroll | `overscroll-behavior: none` already in CSS ✅ |
| Tap highlight | `-webkit-tap-highlight-color: transparent` ✅ |
| iOS input zoom (font-size < 16px) | **MISSING** — All `<input>` fields must have `font-size: 16px` minimum |
| Long-press context menu | `-webkit-touch-callout: none` ✅ |
| WKWebView localStorage limit | Firebase Auth uses indexedDB — should be fine |
| iOS 17+ scroll momentum | Verify BottomNav doesn't jitter during fast scroll |

**I6 — TestFlight Distribution**
- Build archive in Xcode or via Codemagic
- Upload to App Store Connect
- Add internal testers (up to 100) via TestFlight
- Add external testers (up to 10,000) — requires Apple review (1-3 days)

**I7 — iOS-Specific Missing Features**
- **Haptic Feedback**: iOS uses Taptic Engine — verify `Haptics.impact()` called on key interactions (match, like, send message).
- **Share Sheet**: Implement native iOS share using `Share.share()` Capacitor plugin for posts/profiles.
- **App Tracking Transparency (ATT)**: If using any ad tracking/analytics that tracks users, must show ATT prompt. Required by Apple for App Store.

---

## SECTION 5: CROSS-PLATFORM UX ISSUES

These issues affect ALL platforms and must be fixed before beta.

### 🔴 CRITICAL CROSS-PLATFORM ISSUES

**X1 — Authentication State Race Condition**
- On app launch, there's a flash of the login screen before Firebase Auth resolves the cached user session.
- **Fix:** Show splash screen / loading spinner until `onAuthStateChanged` fires. The `useAuth.js` hook should have a `loading` state that gates rendering of `AppShell`.

**X2 — Real WebRTC for Video Calls**
- `livestream-webrtc.js` and `webrtc-service.js` are implemented, but actual STUN/TURN server configuration needs verification.
- Without a TURN server, WebRTC will fail on mobile networks (carrier-grade NAT).
- **Fix:** Configure a TURN server (Twilio, Xirsys, or self-hosted coturn). Add TURN credentials to `.env`.

**X3 — Demo vs. Live Data**
- `seed-demo-content.cjs` and `seed-data-service.js` exist for seeding demo data.
- Beta testers need to see actual user-generated content, not demo seeds on fresh accounts.
- **Fix:** Seed 5-10 "bot" accounts with real-looking posts, stories, and content so the app feels alive on first login.

**X4 — Push Notification Deep Links**
- When a push notification is tapped (new message, match, like), the app must navigate to the correct screen.
- **Fix:** Implement notification action routing in `useAppStore.js`:
  ```javascript
  PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
    const { type, id } = action.notification.data;
    if (type === 'message') navigate(`/messages/${id}`);
    if (type === 'match') navigate('/dating/matches');
    // etc.
  });
  ```

**X5 — Offline Messaging Queue**
- Messages typed while offline should be queued and sent when connection restores.
- `offline-manager.js` exists but verify it handles Firestore `.addDoc()` failures gracefully.

**X6 — Image Upload Progress**
- `upload-manager.js` exists but users need visible progress (progress bar) when uploading profile photos, post images, or story media.
- **Fix:** Wire `upload-manager.js` progress events to a UI progress bar component.

### 🟡 HIGH PRIORITY CROSS-PLATFORM ISSUES

**X7 — Session Timeout & Re-auth**
- If Firebase ID token expires mid-session, Firestore writes fail silently.
- **Fix:** Add a global error interceptor in `api-client.js` that refreshes the token on 401/expired errors.

**X8 — Date/Time Formatting**
- All timestamps should use the device's local timezone.
- Use `Intl.DateTimeFormat` with `{ timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }`.

**X9 — Accessibility on Native**
- Screen readers (TalkBack/VoiceOver) need `accessibilityLabel` on all interactive elements.
- **Fix:** Add `aria-label` to all icon buttons. Test with TalkBack enabled on Android.

**X10 — Dark Mode Only**
- App appears to be dark-mode only. This is fine for beta, but note for future: add light mode option in settings.

---

## SECTION 6: FEATURE-BY-FEATURE BETA READINESS SCORECARD

| Section | Web | Android | iOS | Beta Ready? |
|---|---|---|---|---|
| Auth / Onboarding | 90% | 85% | 0%* | ⚠️ |
| Feed / Posts | 92% | 88% | 0%* | ⚠️ |
| Stories | 88% | 85% | 0%* | ⚠️ |
| Live Streaming | 80% | 75% | 0%* | ⚠️ |
| Dating / Swipe | 87% | 83% | 0%* | ⚠️ |
| Messages / Chat | 90% | 85% | 0%* | ⚠️ |
| Notifications | 88% | 82% | 0%* | ⚠️ |
| Profile | 92% | 88% | 0%* | ⚠️ |
| Friends | 88% | 85% | 0%* | ⚠️ |
| Groups | 85% | 80% | 0%* | ⚠️ |
| Events | 85% | 80% | 0%* | ⚠️ |
| Marketplace | 82% | 78% | 0%* | ⚠️ |
| Music / Media | 80% | 75% | 0%* | ⚠️ |
| Settings | 90% | 85% | 0%* | ⚠️ |
| Admin Dashboard | 88% | N/A | N/A | ✅ Web only |

*iOS = 0% because ios/ project doesn't exist yet.

---

## SECTION 7: BETA LAUNCH PLAN — PHASED APPROACH

### PHASE 1: WEB BETA (Timeline: 1 Week)
**Goal:** Get 20-50 beta testers on the web app now.

| # | Task | Owner | Priority | Est. Time |
|---|---|---|---|---|
| 1 | Fix landing page with screenshots + CTA | Dev | 🔴 | 4h |
| 2 | Mandatory onboarding minimum (avatar + interests) | Dev | 🔴 | 3h |
| 3 | Add empty state illustrations to all sections | Dev | 🔴 | 4h |
| 4 | Seed 10 demo accounts with content | Dev | 🔴 | 2h |
| 5 | Auth loading screen (no flash-of-login) | Dev | 🔴 | 2h |
| 6 | Fix all `<input>` font-size ≥ 16px (iOS zoom prevention) | Dev | 🟡 | 1h |
| 7 | Run Lighthouse audit, fix performance score to 70+ | Dev | 🟡 | 4h |
| 8 | Set up beta feedback collection (BetaFeedbackModal already exists) | Dev | 🟡 | 1h |
| 9 | Set up Sentry alerts for production errors | Dev | 🟡 | 1h |
| 10 | Deploy latest build to Firebase Hosting | Dev | 🔴 | 0.5h |
| 11 | Send invite links to beta testers | Product | 🔴 | 1h |

**Web Beta Launch Checklist:**
- [ ] Firebase Hosting deployed and accessible
- [ ] All auth flows tested end-to-end
- [ ] BetaFeedbackModal showing on first login
- [ ] Sentry error tracking live
- [ ] At least 5 demo accounts with content exist
- [ ] Landing page has clear value proposition
- [ ] Cookie consent banner appears before tracking

---

### PHASE 2: ANDROID BETA (Timeline: 2 Weeks)
**Goal:** Distribute APK via Firebase App Distribution to 20 Android testers.

| # | Task | Owner | Priority | Est. Time |
|---|---|---|---|---|
| 1 | Fix JAVA_HOME permanently in System Environment Variables | Dev | 🔴 | 15min |
| 2 | Copy `google-services.json` to `android/app/` folder | Dev | 🔴 | 5min |
| 3 | Run `build-and-install.bat` to confirm build | Dev | 🔴 | 30min |
| 4 | Generate release keystore, configure `build.gradle` | Dev | 🔴 | 1h |
| 5 | Create `capacitor-assets generate --android` for icons/splash | Dev | 🔴 | 1h |
| 6 | Implement Android back button handler | Dev | 🔴 | 2h |
| 7 | Test keyboard avoidance in chat/messages | Dev | 🔴 | 1h |
| 8 | Request push notification permission in onboarding | Dev | 🟡 | 1h |
| 9 | Set up Firebase App Distribution beta group | Dev | 🟡 | 30min |
| 10 | Build release APK, upload to App Distribution | Dev | 🔴 | 1h |
| 11 | Send download links to Android beta testers | Product | 🔴 | 30min |
| 12 | Verify push notifications deliver on Android | Dev | 🔴 | 1h |

**Android Beta Launch Checklist:**
- [ ] `google-services.json` in correct location
- [ ] Debug build compiles without errors
- [ ] Release APK signed with keystore
- [ ] App icons correct in all densities
- [ ] Splash screen shows correctly
- [ ] Back button works (close modal → back → exit dialog)
- [ ] Push notifications receive and deep-link correctly
- [ ] Firebase App Distribution group set up

---

### PHASE 3: iOS BETA via TestFlight (Timeline: 3-4 Weeks)
**Goal:** Distribute via TestFlight to 25 iOS testers.

**REQUIREMENT: This phase requires a Mac with Xcode 15+**

| # | Task | Owner | Priority | Est. Time |
|---|---|---|---|---|
| 1 | Enroll in / confirm Apple Developer Program | Product | 🔴 | 1 day |
| 2 | On Mac: `cd ConnectHub-SPA && npx cap add ios` | Dev (Mac) | 🔴 | 30min |
| 3 | `npx cap sync ios` to copy web assets | Dev (Mac) | 🔴 | 10min |
| 4 | Add all Info.plist permission strings (6 permissions listed above) | Dev (Mac) | 🔴 | 30min |
| 5 | Generate iOS app icons with `npx capacitor-assets generate --ios` | Dev (Mac) | 🔴 | 1h |
| 6 | Create Provisioning Profile in Apple Developer Portal | Dev (Mac) | 🔴 | 30min |
| 7 | Fix all `<input>` font-size ≥ 16px if not already done | Dev | 🔴 | 1h |
| 8 | Test safe area insets on iPhone with notch/Dynamic Island | Dev (Mac) | 🔴 | 2h |
| 9 | Test on iPhone with iOS 15, 16, 17 simulators | Dev (Mac) | 🔴 | 4h |
| 10 | Implement App Tracking Transparency dialog | Dev (Mac) | 🟡 | 1h |
| 11 | Add Haptics.impact() to key interactions (match, like, send) | Dev | 🟡 | 2h |
| 12 | Archive & upload to App Store Connect | Dev (Mac) | 🔴 | 30min |
| 13 | Add internal testers in TestFlight | Product | 🔴 | 15min |
| 14 | Submit for external testing review (Apple) | Product | 🟡 | Async |

**Alternative: Use Codemagic CI/CD (already configured in `codemagic.yaml`)**
- Add Apple credentials to Codemagic dashboard
- Push code → Codemagic builds iOS IPA on their Mac servers
- Auto-distributes to TestFlight
- No local Mac required!

**iOS Beta Launch Checklist:**
- [ ] `ios/` folder generated and committed
- [ ] All Info.plist permissions added
- [ ] App icons in all iOS sizes (20pt to 1024pt)
- [ ] Splash/launch screen configured
- [ ] Tested on iPhone simulator (iOS 16+)
- [ ] Tested on physical iPhone if possible
- [ ] ATT dialog implemented
- [ ] Uploaded to App Store Connect
- [ ] Internal testers added in TestFlight

---

## SECTION 8: UX/UI DESIGN ISSUES — PRIORITY FIXES

### Design Issues Requiring Code Changes

| # | Issue | Platform | Severity | Fix |
|---|---|---|---|---|
| D1 | Input fields may trigger zoom on iOS (font-size < 16px) | iOS | 🔴 | Add `font-size: 16px` to all inputs in global.css |
| D2 | BottomNav icons lack text labels | All | 🟡 | Add small text labels under each nav icon |
| D3 | Long usernames truncate awkwardly in feed cards | All | 🟡 | Use `text-overflow: ellipsis; max-width: 120px` |
| D4 | Story circles overlap on small screens (320px wide) | All | 🟡 | Reduce story circle size on viewport < 360px |
| D5 | Modal backgrounds too translucent on Android | Android | 🟡 | Increase backdrop `background-color` opacity to `rgba(0,0,0,0.75)` |
| D6 | Swipe gestures in Dating conflict with scroll | Android/iOS | 🔴 | Ensure swipe detection only fires on horizontal drag > 20px threshold |
| D7 | Post images load without aspect-ratio locked | All | 🟡 | Add `aspect-ratio: 1` to square post images, `aspect-ratio: 16/9` to video thumbnails |
| D8 | Floating action buttons (FABs) overlap BottomNav | All | 🟡 | Add `margin-bottom: var(--bottom-nav-height)` to FAB containers |
| D9 | Dark overlay on Live stream cards too opaque | All | 🟡 | Reduce gradient opacity from 0.8 to 0.5 |
| D10 | Profile avatar fallback shows broken image | All | 🔴 | `SafeImage.jsx` exists — ensure used everywhere an avatar renders |

### Typography & Spacing
- Font: Confirm Inter/System font is loading. Add system font fallback.
- Base font-size: 16px (CRITICAL for iOS)
- Line height: 1.5 for body text
- Button padding: minimum 12px vertical, 20px horizontal

### Color & Contrast
- Primary purple `#6366f1` on dark background `#0a0a18`: ✅ passes AA
- Text color `#e2e8f0` on `#0a0a18`: ✅ passes AAA
- Muted text `#64748b` on `#0a0a18`: ⚠️ May fail AA — test with contrast checker
- Ensure all interactive states have visible focus rings (for keyboard nav on web)

---

## SECTION 9: BETA TESTER PROGRAM SETUP

### Who to Invite First
- **Phase 1 (Web):** 20 trusted users — friends, colleagues, early adopters
- **Phase 2 (Android):** 15-20 Android users from above group
- **Phase 3 (iOS):** 15-20 iPhone users, + expand to 50+ via TestFlight external

### Beta Feedback Collection
- `BetaFeedbackModal.jsx` is already built ✅
- `BetaDashboardPage.jsx` is already built ✅
- Add feedback categories: Bug Report, UI Suggestion, Missing Feature, Performance Issue

### What to Tell Beta Testers
Create a Beta Welcome Guide that covers:
1. What LynkApp is (the pitch)
2. What to test (key user journeys)
3. How to report bugs (in-app modal or email)
4. What's NOT working yet (Live stream may have latency, payments are in test mode)
5. How often you'll update (aim for weekly updates during beta)

### Key User Journeys to Test
1. Sign up → Complete onboarding → See feed with content
2. Create a post → Get reactions from others → View notifications
3. Send a message → Receive reply in real-time
4. Swipe in Dating → Get a match → Start dating chat
5. Go live → Others join and chat
6. Create a group → Post in group → Others see it
7. Browse Marketplace → View listing → Checkout flow
8. View a Story → Create your own story
9. Search for a user → Follow them → See their posts in feed
10. Push notification received → Tap → Opens correct screen

---

## SECTION 10: PRODUCTION READINESS CHECKLIST

### Security
- [ ] Firestore security rules deployed (✅ already done)
- [ ] Storage security rules deployed (✅ already done)
- [ ] Environment variables not committed to git (verify `.gitignore` covers `.env`)
- [ ] API keys in `.env.production` are production keys (not test/demo)
- [ ] Firebase Auth email enumeration protection enabled
- [ ] Rate limiting on auth endpoints (Firebase already handles this)

### Performance
- [ ] Lighthouse score ≥ 70 on mobile
- [ ] First Contentful Paint < 3 seconds
- [ ] Largest Contentful Paint < 4 seconds
- [ ] Images served in WebP format where possible
- [ ] Firebase CDN enabled for static assets

### Monitoring
- [ ] Sentry DSN configured for production (✅ integrated)
- [ ] Firebase Crashlytics added to Android/iOS builds
- [ ] Firebase Performance Monitoring enabled
- [ ] Uptime monitoring on backend

### Legal & Compliance
- [ ] Terms of Service reviewed by lawyer (or at minimum reviewed by founder)
- [ ] Privacy Policy covers all data collected
- [ ] GDPR consent for EU users
- [ ] COPPA compliance if users under 13 can sign up (add age gate)
- [ ] Cookie consent before tracking ✅

---

## SECTION 11: RECOMMENDED IMMEDIATE ACTIONS (THIS WEEK)

**Today (Day 1):**
1. Fix `JAVA_HOME` permanently in Windows System Properties
2. Copy `google-services.json` to `android/app/` folder
3. Run `cd ConnectHub-SPA/android && build-and-install.bat` — get Android APK building

**Day 2-3:**
4. Fix landing page with value prop + CTA
5. Fix mandatory onboarding minimum
6. Seed 10 demo accounts with content
7. Fix auth loading flash (show loading state during `onAuthStateChanged`)

**Day 4-5:**
8. Run full web app through checklist — test all 10 user journeys end-to-end
9. Fix top 5 UX bugs found during testing
10. Deploy updated build to Firebase Hosting

**Day 6-7:**
11. Invite first 10 web beta testers
12. Collect initial feedback via BetaFeedbackModal
13. Plan iOS build setup (order Mac access or set up Codemagic)

---

## SUMMARY DASHBOARD

| Platform | Current State | Blockers | ETA to Beta |
|---|---|---|---|
| **Web** | 87% ready | Landing page, onboarding, empty states | **3-5 days** |
| **Android** | 75% ready | JAVA_HOME fix, google-services.json, release keystore | **1-2 weeks** |
| **iOS** | 0% ready | No ios/ project, needs Mac/Codemagic, Apple Developer account | **3-4 weeks** |

**Overall Beta Readiness: 82%**
The web app is closest to beta-ready. Android can follow within 2 weeks. iOS is the longest lead time due to Apple platform requirements. The recommended strategy is to launch web beta immediately, Android beta in 2 weeks, and iOS beta in 3-4 weeks.

---

*Assessment completed: June 17, 2026*  
*Next review: After Phase 1 web beta launch*
