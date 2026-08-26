# 🚀 LYNKAPP — PRE-APP-STORE SUBMISSION MASTER CHECKLIST
**Reviewed:** August 26, 2026  
**App:** LynkApp (ConnectHub-SPA) — React 18 + Vite + Firebase + Capacitor 6  
**Targets:** Google Play Store (Android) + Apple App Store (iOS)  
**Current Overall Readiness:** ~60% Production Ready

---

## HOW TO READ THIS DOCUMENT

| Priority Label | Meaning |
|---|---|
| 🔴 BLOCKER | App will be **rejected** or will crash. Must fix before any submission. |
| 🟠 REQUIRED | App store **policy requirement** — will cause rejection if missing. |
| 🟡 HIGH | Will cause bad user experience or negative reviews at launch. |
| 🟢 RECOMMENDED | Best practices that improve approval odds and store ratings. |

---

---

# SECTION 1 — 🔴 CRITICAL BLOCKERS (Fix First — Nothing Else Matters Until These Are Done)

## 1.1 Security — IMMEDIATE DANGER

- [ ] **🔴 BLOCKER — Remove `serviceAccountKey.json` from git history**
  - File: `ConnectHub-SPA/serviceAccountKey.json`
  - This Firebase Admin SDK private key is checked into the repository. Anyone with access to the repo can take over your entire Firebase project (read all user data, delete accounts, etc.).
  - **Action:** `git rm --cached ConnectHub-SPA/serviceAccountKey.json`, add to `.gitignore`, then rotate the key immediately in Firebase Console → Project Settings → Service Accounts → Generate new private key. Revoke the old one.

- [ ] **🔴 BLOCKER — Confirm `.env` files are NOT committed to GitHub**
  - Files: `ConnectHub-SPA/.env` and `ConnectHub-Backend/.env` contain live API keys.
  - **Action:** Check `.gitignore` includes both `.env` files. Run `git status` to verify they are untracked.

- [ ] **🔴 BLOCKER — Remove `google-services.json` from `Downloads/` folder**
  - File: `../../Downloads/google-services.json` — this appears to be sitting in the user's Downloads folder. It needs to be in the correct location (`ConnectHub-SPA/android/app/`) and NOT committed to a public repo.
  - **Action:** Move to `ConnectHub-SPA/android/app/google-services.json`. Add `google-services.json` to `.gitignore`.

## 1.2 Code Crashes — Will Crash on Launch

- [ ] **🔴 BLOCKER — Fix `auth.currentUser` null crash in AppShell.jsx (line 441)**
  - `if (!auth.currentUser) return;` will throw `Cannot read properties of null` when `.env` Firebase config is missing or before Firebase initializes.
  - **Fix:** Change to `if (!auth || !auth.currentUser) return;`

- [ ] **🔴 BLOCKER — Fix Firestore followers snapshot memory leak in `useAuth.js` (lines 111–120)**
  - A `followers` snapshot listener is opened inside a `following` snapshot callback. Every time the following list updates, a **new** followers listener is opened without closing the previous one. This will exhaust Firebase connections, cause excessive billing, and crash the app on mobile.
  - **Fix:** Store the unsubscribe function from the inner snapshot and call it before re-subscribing.

## 1.3 Live Streaming v2 — Pending Merge

- [ ] **🔴 BLOCKER — Merge `feature/live-streaming-v2` branch into `main`**
  - All 49 steps are complete (confirmed in `LIVE-STREAMING-V2-FINAL-REPORT-AUG2026.md`) but the branch has NOT been merged yet.
  - **Action:** Create pull request on GitHub from `feature/live-streaming-v2` → `main`, run full regression checklist in `LIVE-STREAMING-V2-FINAL-REPORT-AUG2026.md` Section 3, then merge.

- [ ] **🔴 BLOCKER — Add real API keys to `.env` files before testing Live Streaming**
  - `VITE_MUX_ENV_KEY` (Mux.com dashboard)
  - `VITE_STRIPE_PUBLISHABLE_KEY` (Stripe dashboard — use `pk_test_` for testing)
  - `MUX_TOKEN_ID`, `MUX_TOKEN_SECRET`, `MUX_WEBHOOK_SIGNING_SECRET`
  - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

---

---

# SECTION 2 — 🟠 APP STORE REQUIREMENTS (Both Stores Will Reject Without These)

## 2.1 Google Play Store Requirements

### App Signing & Build
- [ ] **🟠 Generate Android Release Keystore** — This does not exist yet. Without it you cannot build a signed APK or AAB.
  ```
  keytool -genkey -v -keystore lynkapp-release.keystore -alias lynkapp -keyalg RSA -keysize 2048 -validity 10000
  ```
  Store the keystore file and passwords **securely** (password manager, NOT in git).

- [ ] **🟠 Configure signing in `android/app/build.gradle`** — Add `signingConfigs.release` block pointing to the keystore.

- [ ] **🟠 Place `google-services.json` in `ConnectHub-SPA/android/app/`** — Currently in the wrong location (`Downloads/`). Firebase push notifications and analytics will NOT work without this file in the correct Android folder.

- [ ] **🟠 Run `npm run build && npx cap sync android`** — Must be done after every web build to sync the native Android project with the latest web assets.

- [ ] **🟠 Build signed Android App Bundle (AAB)** — Google Play requires `.aab` format, not `.apk`, for new app submissions. Build via Android Studio: Build → Generate Signed Bundle/APK → Android App Bundle.

- [ ] **🟠 Set `minSdkVersion` to at least 23 (Android 6.0)** — Verify in `android/app/build.gradle`. Capacitor 6 requires minimum API 22, but Play Store recommends 24+.

- [ ] **🟠 Configure ProGuard/R8 rules** — Currently not configured. Required for production release builds to shrink and obfuscate code.

### Google Play Console Setup
- [ ] **🟠 Create Google Play Developer Account** ($25 one-time fee if not already done)
- [ ] **🟠 Create new app in Google Play Console** — Set app name "LynkApp", category (Social), language
- [ ] **🟠 Complete Store Listing**
  - App title: "LynkApp" (max 30 chars)
  - Short description (max 80 chars)
  - Full description (max 4000 chars)
  - App icon: **512×512 PNG** (no alpha)
  - Feature graphic: **1024×500 PNG or JPG**
  - Screenshots: minimum 2 per device type (phone, 7" tablet optional, 10" tablet optional)
  - Promo video (YouTube URL — optional but recommended)

- [ ] **🟠 Complete Content Rating questionnaire** — Google requires IARC rating. LynkApp contains dating features, user-generated content, and location data — answer all questions accurately. Likely rating: Teen (13+) or Mature (17+ due to dating).

- [ ] **🟠 Complete Data Safety Form** — Google requires you to declare ALL data your app collects:
  - Location (dating nearby, friend nearby features)
  - Personal info (name, email, DOB, profile photo)
  - Messages (private conversations)
  - Photos/videos (uploads)
  - Payment info (Stripe marketplace)
  - Device identifiers (OneSignal push)
  - **This form requires your Privacy Policy URL to be live and accessible.**

- [ ] **🟠 Set up App Pricing** — Free with in-app purchases (coins, premium), or paid? Configure in Play Console.

- [ ] **🟠 Add in-app products** — If selling coins via Stripe, verify this complies with Play Store billing policy. Google requires Google Play Billing for digital goods sold in Android apps. Stripe for physical goods (marketplace) is fine; Stripe for virtual coins may be a **policy violation**.
  - **Critical:** Review Google Play's billing policy. You may need to implement Google Play Billing for coin purchases on Android.

### Android Technical Requirements
- [ ] **🟠 Add Android Deep Links (App Links)** — For email verification links and password reset links to open the app instead of a browser. Add intent filters to `AndroidManifest.xml` for `lynkapp.com` domain.

- [ ] **🟠 Add Android Splash Screen drawable** — `android/app/src/main/res/drawable/splash.png` is referenced in `capacitor.config.json` but may not exist. Verify it exists or create it.

- [ ] **🟠 Test on physical Android device via USB** — Emulator testing is not sufficient before a Play Store submission.

- [ ] **🟠 Add Push Notification registration code to `main.jsx`**
  ```js
  import { PushNotifications } from '@capacitor/push-notifications';
  // Add this to main.jsx after app mounts on native platforms:
  PushNotifications.requestPermissions().then(result => {
    if (result.receive === 'granted') PushNotifications.register();
  });
  // Add token listener → save FCM token to Firestore
  PushNotifications.addListener('registration', token => {
    // save token.value to Firestore for this user
  });
  ```

---

## 2.2 Apple App Store Requirements

### iOS Platform Setup (Requires a Mac)
- [ ] **🟠 Run `npx cap add ios`** — The `ios/` folder does NOT exist yet. This is the single biggest blocker for iOS. Must be run on a Mac from inside `ConnectHub-SPA/`.

- [ ] **🟠 Enroll in Apple Developer Program** ($99/year) — Required to distribute on TestFlight and App Store.

- [ ] **🟠 Register Bundle ID `com.lynkapp.app`** — In Apple Developer portal: Certificates, Identifiers & Profiles → Identifiers → App IDs.

- [ ] **🟠 Download `GoogleService-Info.plist`** — From Firebase Console → Project Settings → iOS app. Add to Xcode project at `ios/App/App/GoogleService-Info.plist`.

- [ ] **🟠 Register Firebase iOS app** — If not already done, add an iOS app in Firebase Console with Bundle ID `com.lynkapp.app`.

- [ ] **🟠 Configure Info.plist permission usage descriptions** — Apple will reject apps that request permissions without a human-readable explanation:
  - `NSCameraUsageDescription` — "LynkApp uses your camera to create posts, stories, and join video calls."
  - `NSPhotoLibraryUsageDescription` — "LynkApp accesses your photos to let you share them in posts and stories."
  - `NSMicrophoneUsageDescription` — "LynkApp uses your microphone for live streams, voice messages, and video calls."
  - `NSLocationWhenInUseUsageDescription` — "LynkApp uses your location to show nearby friends and events."
  - `NSFaceIDUsageDescription` — (if Face ID is used for biometric login)
  - `NSUserNotificationsUsageDescription` — "LynkApp sends notifications for messages, matches, and live streams."

- [ ] **🟠 Add Push Notifications capability in Xcode** — Xcode → App target → Signing & Capabilities → + Capability → Push Notifications. Also add Background Modes → Remote notifications.

- [ ] **🟠 Add `PrivacyInfo.xcprivacy` manifest (iOS 17+ required)** — Apple NOW REQUIRES a privacy manifest file declaring all APIs that access user data. Apps submitted without this will be rejected. Required if using: UserDefaults, FileManager, disk space APIs, location, camera, etc.

- [ ] **🟠 Add `@capacitor-community/apple-sign-in` plugin** — The `AppleSignInButton.jsx` component is in the code but the native Capacitor plugin is not yet in `package.json`. Apple requires Sign In with Apple to be offered when ANY other social sign-in is present (e.g., Google login). This is mandatory for App Store approval.
  ```
  npm install @capacitor-community/apple-sign-in
  npx cap sync ios
  ```

### App Icons & Launch Screen
- [ ] **🟠 Create App Icon set (all required sizes)**
  - 1024×1024 PNG — App Store listing (no alpha/transparency)
  - Multiple smaller sizes are auto-generated by Xcode from the 1024px master via Asset Catalog
  - Use Xcode → Assets.xcassets → AppIcon to import

- [ ] **🟠 Create Launch Screen (iOS Splash Screen)** — Required. Configure via Xcode or using the `@capacitor/splash-screen` plugin assets.

### App Store Connect Setup
- [ ] **🟠 Create app record in App Store Connect** — Set Bundle ID, SKU, primary language.
- [ ] **🟠 Complete App Information** — Name, subtitle, category (Social Networking), age rating.
- [ ] **🟠 Complete App Privacy** — Apple requires a detailed privacy nutrition label declaring all data types collected.
- [ ] **🟠 App Store Screenshots (required sizes)**
  - iPhone 6.7" (iPhone 15 Pro Max) — 1290×2796 or 1320×2868 — **REQUIRED**
  - iPhone 6.5" (iPhone 14 Plus/13 Pro Max) — 1284×2778 — **REQUIRED**
  - iPad Pro 12.9" (3rd gen) — 2048×2732 — **REQUIRED if app supports iPad**
- [ ] **🟠 App Description, Keywords, Support URL, Marketing URL**
- [ ] **🟠 Build Archive and submit** — Xcode → Product → Archive → Distribute App → App Store Connect.

### Apple In-App Purchase Policy
- [ ] **🟠 Implement StoreKit (Apple IAP) for coin purchases on iOS** — Like Google Play, Apple REQUIRES all digital in-app purchases (virtual currency, coins, premium subscriptions) to go through Apple's In-App Purchase system. Stripe cannot be used for digital goods on iOS. This affects the "Buy Coins" feature.
  - Add `@capacitor/purchases` or use RevenueCat SDK to handle StoreKit on iOS.
  - Physical goods in the Marketplace are exempt.

---

---

# SECTION 3 — 🟡 HIGH PRIORITY (Fix Before Launch — Will Cause Bad Reviews)

## 3.1 Core Feature Bugs That Need Fixing

- [ ] **🟡 Wire MiniPlayer to Zustand store** — The MiniPlayer and FullMusicPlayer use a hardcoded fake `DEMO_TRACK = null`, so the global music player is permanently hidden. When users play music from MusicPage, the player never appears because `currentTrack` in Zustand is never connected to AppShell's render condition.
  - **Fix:** AppShell should use `useAppStore((s) => s.currentTrack)` and render MiniPlayer when that value is truthy.

- [ ] **🟡 Fix double offline overlay** — Both `<OfflineOverlay>` and the `offline-banner` CSS class are both rendered in AppShell simultaneously. Remove one to prevent overlapping UI elements.

- [ ] **🟡 Remove `useAppStore.getState()` from inside JSX render (AppShell line 652)** — Move `const setCreatePostOpen = useAppStore((s) => s.setCreatePostOpen)` to top-level hooks in the component.

- [ ] **🟡 Real-time messaging — verify Firestore write works** — The messaging UI is built but the actual "send message" → Firestore write path needs end-to-end verification with two real user accounts.

- [ ] **🟡 Stripe payment flow — end-to-end test with real test card** — The checkout and wallet routes exist but the Stripe webhook has not been confirmed in production. Test with Stripe test card `4242 4242 4242 4242`.

- [ ] **🟡 Verify Firestore rules are deployed** — Run `firebase deploy --only firestore:rules,firestore:indexes` and confirm rules are live.

- [ ] **🟡 Verify Firestore queries all have `.limit()` calls** — Unbounded Firestore reads on list pages (feed, messages, notifications) can cause extremely high billing and performance issues at scale.

## 3.2 Placeholder Pages That Need Real Content

- [ ] **🟡 `RemainingDashboards.jsx` and `MiscSubPages.jsx`** — These are likely placeholder skeleton pages. Audit every route in `App.jsx` and confirm no page still shows "Coming Soon" or empty skeleton content at launch.

- [ ] **🟡 AR/VR section** — The UI exists but DeepAR integration is mocked. Either implement real DeepAR SDK or clearly label as "Coming Soon" with a proper UI — do not ship a broken feature.

- [ ] **🟡 Video Calls (WebRTC P2P)** — The UI exists but actual WebRTC peer connections are not wired. Real P2P video calls require a STUN/TURN + signaling server. Either:
  - Deploy a Socket.io signaling server, OR
  - Gate the feature behind "Coming Soon" or replace with a third-party SDK (Daily.co, Agora, Twilio Video).

- [ ] **🟡 Creator Monetization payout flow** — Marked as placeholder. Verify Stripe Connect payouts actually work end-to-end or disable the UI until it does.

- [ ] **🟡 Marketplace order fulfillment and shipping status** — Marked as placeholder. Users who buy items need to see real order status updates.

## 3.3 Authentication & Onboarding
- [ ] **🟡 Test full auth flow end-to-end** — New user signup → email verification → onboarding → first post. Do this with a fresh email address in an incognito window.
- [ ] **🟡 Test Google Sign-In on Android device** — Requires `google-services.json` in correct location.
- [ ] **🟡 Test Apple Sign-In on iOS device** — Requires `@capacitor-community/apple-sign-in` plugin installed.
- [ ] **🟡 Age gate validation** — SignupPage blocks accounts for age < 13 when DOB is provided. Verify this gate cannot be bypassed.

## 3.4 Push Notifications
- [ ] **🟡 Deploy `onStreamGoLive` Cloud Function** — Implemented in `functions/index.js` but not deployed. Run `firebase deploy --only functions:onStreamGoLive`.
- [ ] **🟡 Test push notifications on a physical Android device** — Must receive notification when another user starts a live stream.
- [ ] **🟡 OneSignal Player ID saving** — `saveOneSignalPlayerId()` is implemented in `mobile-platform-service.js`. Verify it actually saves the token to Firestore when the app launches.

---

---

# SECTION 4 — 🟠 LEGAL & COMPLIANCE REQUIREMENTS

## 4.1 Legal Documents (Both stores require these to be LIVE and LINKED)
- [ ] **🟠 Privacy Policy — must be a live, publicly accessible URL**
  - The `PrivacyPage.jsx` exists. Deploy it and confirm the URL is: `https://lynkapp.com/privacy` or similar.
  - Must cover: what data is collected, how it's used, who it's shared with, user rights (GDPR/CCPA), contact information.
  - **Recommendation:** Have a lawyer review it, especially the dating and marketplace sections.
  - Must be linked in: Google Play Console (App Content → Privacy Policy), App Store Connect (App Information → Privacy Policy URL), and the app's settings/legal section.

- [ ] **🟠 Terms of Service — must be live and accessible**
  - `TermsPage.jsx` exists. Confirm the URL is live.
  - Must cover: acceptable use policy, prohibited content, account termination, dispute resolution.
  - **For dating apps specifically:** Must clearly state age minimum (13+, or 17+ if monetized content exists), consent to matching, and safety policies.

- [ ] **🟠 Cookie Policy** — `CookiePolicyPage.jsx` exists. Verify it is accessible.

- [ ] **🟠 Support URL** — Both stores require a working support contact page or email. The `ContactPage.jsx` exists — confirm it's deployed and functional.

## 4.2 Dating-Specific Legal Requirements
- [ ] **🟠 Age verification** — Dating features must enforce minimum age. The DOB age gate (blocks < 13) is implemented on signup. Consider raising the minimum to 17 or 18 for dating specifically (many jurisdictions require it for monetized matching apps).
- [ ] **🟠 Safety Center** — `SafetyCenterPage.jsx` exists. Verify it explains how to block/report users and what happens when reports are filed.
- [ ] **🟠 Content moderation policy** — Describe in Terms of Service how reported content is handled and within what timeframe.

## 4.3 GDPR / CCPA Compliance
- [ ] **🟠 Cookie consent banner is functional** — `CookieConsentBanner.jsx` exists. Verify it appears on first visit and blocks non-essential cookies until consent is given.
- [ ] **🟠 Delete Account feature works** — `DeleteAccountPage.jsx` exists. Verify that deleting an account actually removes the user's Firestore documents, Storage files, and Firebase Auth record. This is a GDPR requirement.
- [ ] **🟠 Data export option** — GDPR requires users to be able to export their data. If this is not implemented, add it to Settings or note it for a post-launch update.

## 4.4 Financial / Payment Compliance
- [ ] **🟠 Stripe in LIVE mode before public launch** — Currently using test keys. Switch to live keys only after all testing passes.
- [ ] **🟠 KYC (Know Your Customer) for Marketplace sellers** — `SellerKYCPage.jsx` and `KYCAdminPage.jsx` exist. Verify the KYC flow actually verifies identity before sellers can receive payouts.
- [ ] **🟠 Tax handling disclosure** — The Marketplace requires a disclosure about whether LynkApp collects and remits sales tax, or if sellers are responsible.

---

---

# SECTION 5 — 🟡 PERFORMANCE & TECHNICAL REQUIREMENTS

## 5.1 Performance
- [ ] **🟡 Run Lighthouse audit on mobile** — Score should be 85+ on Performance, Accessibility, and Best Practices. Run in Chrome DevTools on the production URL.
- [ ] **🟡 Image optimization** — Uploaded images should be served as WebP via Cloudinary (service is integrated). Verify Cloudinary is applying format transformation.
- [ ] **🟡 App startup time** — On a mid-range Android device, the app should be interactive within 3 seconds. Test on a physical device.
- [ ] **🟡 Firebase Firestore billing** — With unbounded queries, costs can spike unexpectedly. Add `.limit()` to all list queries and set up Firebase budget alerts in Google Cloud Console.

## 5.2 Error Monitoring
- [ ] **🟡 Configure Sentry DSN** — The Sentry service is integrated in the code but the DSN (Data Source Name) must be set in `.env`: `VITE_SENTRY_DSN=https://...@sentry.io/...`. Without this, crash reports are never received.
- [ ] **🟡 Test Sentry is receiving errors** — After configuring the DSN, deliberately trigger an error in the app and confirm it appears in the Sentry dashboard.

## 5.3 Content Security Policy
- [ ] **🟡 Add Content Security Policy headers** — Currently missing from `firebase.json`. A CSP header prevents XSS attacks. Add to the `headers` section in `firebase.json`:
  ```json
  {
    "key": "Content-Security-Policy",
    "value": "default-src 'self'; script-src 'self' 'unsafe-inline' *.googleapis.com ..."
  }
  ```

## 5.4 Backend Rate Limiting
- [ ] **🟡 Add rate limiting to the custom API (ConnectHub-Backend/)** — No rate limiting per IP is currently configured. Add `express-rate-limit` middleware to prevent abuse and DDoS.
- [ ] **🟡 Verify CORS configuration** — The custom API CORS config must explicitly allow the Firebase Hosting domain (`lynkapp-c7db1.web.app` and `lynkapp.com`) to prevent cross-origin issues.

---

---

# SECTION 6 — 🟢 STORE LISTING & POLISH (Improves Approval Odds & Ratings)

## 6.1 Screenshots & Visual Assets
- [ ] **🟢 Create professional App Store / Play Store screenshots** — Screenshots should show the app's best features. Do NOT screenshot placeholder content. Minimum sets needed:
  - Android: Phone screenshots (at least 2, max 8) at 1080×1920 or higher
  - iOS: iPhone 6.7" and 6.5" sizes (required), iPad if supported
- [ ] **🟢 Create a Feature Graphic for Play Store (1024×500 JPG/PNG)** — This banner appears at the top of your Play Store listing.
- [ ] **🟢 Create a Preview Video (optional but strongly recommended)** — 15-30 second video showing core features. Upload to YouTube and link in both stores.
- [ ] **🟢 App icon is finalized** — Confirm `ConnectHub-SPA/public/manifest.json` has the correct icon paths and all sizes are generated (192px, 512px for PWA; 1024px for stores).

## 6.2 App Descriptions (Write Before Submission)
- [ ] **🟢 Write compelling short description (80 chars for Play Store, 30 char subtitle for App Store)**
  - Example: "Connect, date, stream, shop — all in one social app."
- [ ] **🟢 Write full description (4000 chars for Play Store)** — Highlight key feature areas: Social Feed, Dating, Live Streaming, Marketplace, Groups & Events, Music, Video Calls.
- [ ] **🟢 Research and add keywords** (App Store: 100 chars of keywords; Play Store: optimized in description)

## 6.3 App Version & Metadata
- [ ] **🟢 Set correct version number** — `package.json` currently shows `"version": "1.0.0"`. Confirm this is intentional for launch. Set `versionCode` (Android) and `CFBundleVersion` (iOS) correctly.
- [ ] **🟢 Update app display name** — Confirm "LynkApp" is consistently set in: `capacitor.config.json` (✅ done), `android/app/src/main/res/values/strings.xml`, and iOS `Info.plist`.

## 6.4 QA & Testing
- [ ] **🟢 Complete the full regression checklist** from `LIVE-STREAMING-V2-FINAL-REPORT-AUG2026.md` Section 3 — all 40+ checklist items must pass before submission.
- [ ] **🟢 Test all 15 Core User Journeys** documented in `15-CORE-USER-JOURNEYS-VERIFICATION-REPORT.md`.
- [ ] **🟢 Seed demo content before any review** — Run `node ConnectHub-SPA/seed-demo-content.cjs` so the app doesn't look empty during Apple/Google review.
- [ ] **🟢 Accessibility audit** — Run the app through an accessibility checker. Both stores penalize apps that fail basic a11y (missing alt text, poor contrast, no screen reader support). Target WCAG 2.1 AA.
- [ ] **🟢 Test on at minimum 3 different Android devices** — A high-end (Pixel 8), mid-range (Samsung A series), and older device (Android 8/API 26).
- [ ] **🟢 Test on minimum 2 iOS device sizes** — An iPhone (e.g., 15 Pro) and an older model (e.g., iPhone 12).

## 6.5 Trademark & Brand
- [ ] **🟢 Verify "LynkApp" trademark is registered or application filed** — Documentation in `LYNKAPP-TRADEMARK-REGISTRATION-GUIDE-JUN2026.md` suggests the trademark process was being planned. Both stores may reject apps with names too similar to existing registered trademarks.

---

---

# SECTION 7 — 🟡 BACKEND & INFRASTRUCTURE (Required for a Stable Launch)

## 7.1 Backend Deployment
- [ ] **🟡 Deploy ConnectHub-Backend (Node.js/Express) to production** — The custom backend exists but deployment to AWS/Railway/Render needs to be confirmed as stable and accessible from the live app.
- [ ] **🟡 Deploy updated Firestore rules** — `firebase deploy --only firestore:rules`
- [ ] **🟡 Deploy updated Firestore indexes** — `firebase deploy --only firestore:indexes`
- [ ] **🟡 Deploy Cloud Functions** — `firebase deploy --only functions`
- [ ] **🟡 Deploy Firebase Storage rules** — `firebase deploy --only storage`

## 7.2 Real-Time Video (Required for Video Calls Feature)
- [ ] **🟡 Deploy STUN/TURN + WebRTC Signaling Server** — Required for actual P2P video calls to work. Options:
  - Use a managed service: **Daily.co**, **Agora**, or **Twilio Video** (easiest)
  - Self-host: Deploy a Coturn TURN server + Socket.io signaling server on AWS
  - If not implementing before launch, hide the Video Calls section UI behind a "Coming Soon" state.

## 7.3 Email Service
- [ ] **🟡 Fix Mailgun DNS / MX record configuration** — Documented as having MX record errors. Transactional emails (email verification, password reset) must work reliably.
- [ ] **🟡 Test email verification flow** — Sign up with a new email → confirm the verification email is received within 60 seconds.
- [ ] **🟡 Test password reset flow** — Request password reset → confirm email is received with working link.

## 7.4 Monitoring & Alerts
- [ ] **🟢 Set up Firebase budget alerts** — Prevent surprise Firestore/Storage billing. Set a monthly budget alert in Google Cloud Console.
- [ ] **🟢 Set up uptime monitoring** — Use UptimeRobot or Better Uptime to alert if Firebase Hosting or the custom backend goes down.

---

---

# SECTION 8 — FINAL SUBMISSION STEPS (Do These Last)

## 8.1 Android Submission
1. [ ] All blockers and required items above are complete
2. [ ] Run: `cd ConnectHub-SPA && npm run build`
3. [ ] Run: `npx cap sync android`
4. [ ] Open Android Studio: `npx cap open android`
5. [ ] Build → Generate Signed Bundle/APK → Android App Bundle (`.aab`)
6. [ ] Upload `.aab` to Google Play Console → Internal Testing (test with 5-10 people first)
7. [ ] After internal testing passes → Closed Testing (beta) → Open Testing → Production

## 8.2 iOS Submission (Requires a Mac or Codemagic CI/CD)
1. [ ] All blockers and required items above are complete
2. [ ] On a Mac: `cd ConnectHub-SPA && npm run build && npx cap sync ios`
3. [ ] Open Xcode: `npx cap open ios`
4. [ ] Set signing team and Bundle ID in Xcode
5. [ ] Product → Archive
6. [ ] Distribute App → App Store Connect → Upload
7. [ ] In App Store Connect → TestFlight → invite testers
8. [ ] After TestFlight passes → Submit for App Review

**Alternative for iOS (No Mac Required):**
- Use **Codemagic CI/CD** — a `codemagic.yaml` file already exists in the project. Configure it with your Apple certificates and Codemagic will build and submit from their cloud Macs.

---

---

# SUMMARY SCORECARD

| Area | Current Status | Estimated Work |
|---|---|---|
| 🔴 Critical Security (serviceAccountKey, crashes) | ❌ Not done | 2-4 hours |
| 🟠 Android Build (keystore, signing, AAB) | ❌ Not done | 4-6 hours |
| 🟠 iOS Platform (ios/ folder doesn't exist) | ❌ Not done | 6-10 hours on Mac |
| 🟠 Apple IAP (StoreKit for coins on iOS) | ❌ Not done | 8-16 hours |
| 🟠 Google Play Billing (for coins on Android) | ❌ Not done | 8-16 hours |
| 🟠 Privacy Policy / TOS (live URLs) | ⚠️ Pages exist, need live URLs confirmed | 1-2 hours |
| 🟠 App Store listings (screenshots, descriptions) | ❌ Not done | 4-8 hours |
| 🟡 Code bugs (MiniPlayer, offline overlay) | ❌ Not done | 2-4 hours |
| 🟡 Live Streaming v2 branch merge | ❌ Not merged | 2-4 hours (testing) |
| 🟡 WebRTC Video Calls (real P2P) | ❌ UI only, no signaling server | 16-40 hours |
| 🟡 Push notification registration code | ❌ Missing from main.jsx | 1-2 hours |
| 🟡 Sentry DSN configured | ❌ Missing env var | 1 hour |
| 🟡 Performance audit (Lighthouse 85+) | ⚠️ Unknown | 4-8 hours |
| 🟢 QA regression testing | ⚠️ Pending | 8-16 hours |

**Estimated total time to first App Store submission: 8-12 weeks** (assuming one developer working full time and no major feature rewrites for IAP).

---

*Generated by Cline AI — August 26, 2026*  
*Based on: LEAD-CODER-BETA-PRODUCTION-READINESS-REPORT.md, LIVE-STREAMING-V2-FINAL-REPORT-AUG2026.md, and full codebase review.*
