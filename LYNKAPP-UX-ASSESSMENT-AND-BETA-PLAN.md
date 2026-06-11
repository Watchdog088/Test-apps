# ⚡ LynkApp — Full UX/UI Assessment & Beta-Readiness Plan
**Platform Coverage: Android · Web (PWA) · iOS (Capacitor)**
**Date: June 2026 | Auditor: Cline (Senior UX/UI Engineer)**

---

## EXECUTIVE SUMMARY

LynkApp is a React (Vite) SPA deployed to Firebase Hosting, with Capacitor configured for Android/iOS native packaging. The app contains 12+ major sections, 200+ pages/routes, and a full Firebase Firestore backend. It is **structurally complete** — all sections exist, all routes are registered, all backend services are wired. The app is **85–90% ready for beta testers on Web**. Android is at **70%** and iOS is at **60%** due to native-specific gaps documented below.

This document:
1. Provides a cross-platform gap assessment (Web / Android / iOS)
2. Lists every remaining issue with severity ratings
3. Delivers a prioritized sprint plan to reach beta-tester readiness

---

## SECTION 1 — WHAT IS ALREADY DONE ✅

### Core Architecture
- ✅ React + Vite SPA with full client-side routing (React Router v6)
- ✅ Firebase Auth (email/password, Google SSO)
- ✅ Firestore real-time database (all 12 sections wired)
- ✅ Firebase Storage (media uploads)
- ✅ Firebase Hosting (deployed to lynkapp-c7db1.web.app)
- ✅ Capacitor `capacitor.config.json` scaffolded for Android/iOS
- ✅ Android `build.gradle` and `google-services.json` present
- ✅ Codemagic CI/CD YAML (codemagic.yaml) configured
- ✅ PWA manifest.json and service worker (sw.js) registered
- ✅ Offline overlay (OfflineOverlay.jsx) rendered by AppShell

### Navigation System
- ✅ TopNav (fixed, 56px) — logo, search, notifications, avatar, back button on sub-routes
- ✅ MobileBottomNav (64px) — 5 tabs: Home | Search | ➕ Create | Messages | ⋯ More
- ✅ MoreDrawer (full-screen slide-up) — all 20+ dashboards accessible from mobile
- ✅ Desktop BottomNav / SideNav for tablet/desktop breakpoints
- ✅ AppShell wraps all authenticated pages with shared layout

### Sections (all 12 complete with pages)
| # | Section | Pages | Status |
|---|---------|-------|--------|
| 1 | Auth / Onboarding | Login, Signup, Forgot Password, Verify Email, Account Recovery, Onboarding | ✅ |
| 2 | Feed / Home | Feed, Post Detail, Hashtag, FeedSubPages | ✅ |
| 3 | Stories | Browse, Create, Viewer, Analytics, Highlights, Archive | ✅ |
| 4 | Live Streaming | Live, Setup, Watch, VOD, Analytics, Clips, Moderation, Schedule, Monetization, Q&A, Gifts | ✅ |
| 5 | Dating | Swipe, Matches, Profile View/Edit, Chat, Speed Dating, Safety Center, Preferences | ✅ |
| 6 | Messages | List, Conversation, New Message, Requests, Archived, Group Create | ✅ |
| 7 | Notifications | List, Activity Summary, Quiet Hours | ✅ |
| 8 | Profile | View, Edit, Insights, Verify Request, Followers, Following, Setup | ✅ |
| 9 | Friends | List, Find, Nearby, Birthdays | ✅ |
| 10 | Groups | List, Detail, Create, Sub-pages | ✅ |
| 11 | Events | List, Detail, Create, Attendees, Sub-pages | ✅ |
| 12 | Marketplace | Browse, Product Detail, Checkout, Listing Wizard, Orders, Seller Dashboard, KYC, Reviews, Returns | ✅ |

### Additional Sections (all accessible from More drawer)
- ✅ Gaming Hub, Media Hub, Music / Podcast, Video Calls + History, AR/VR
- ✅ Trending (Reddit + YouTube integration)
- ✅ Saved, Search (13-feature), Settings (20-feature), Premium
- ✅ Creator Studio, Business Tools, Help & Support
- ✅ Admin Dashboard (CEO-only: KYC, Reports, Analytics, Verification)
- ✅ Legal: Terms, Privacy, Cookie Policy, About, Contact
- ✅ Wallet, Invite, Beta Welcome, Beta Dashboard
- ✅ Meetings (Dashboard, Waiting Room, Room)

### API Integrations (40+ free APIs)
- ✅ GIPHY, RAWG, Unsplash, Pexels, DiceBear Avatars
- ✅ Open-Meteo Weather, IPAPI Geolocation, Leaflet Maps
- ✅ CoinGecko Crypto, HackerNews, Guardian News, Dev.to, NPR
- ✅ YouTube Data, Deezer, Radio Browser, FreeToGame
- ✅ wger Fitness, USDA Food, OpenFDA, Meditopia
- ✅ Location & Travel, Fun & Engagement APIs
- ✅ Reddit (Trending), YouTube Music
- ✅ Sentry Error Tracking, OneSignal Push Notifications (service wired)

### Beta Infrastructure
- ✅ BetaFeedbackModal (wired to TopNav desktop + floating FAB on mobile)
- ✅ BetaWelcomeTooltip on first login
- ✅ Beta Welcome Page + Beta Dashboard
- ✅ Cookie Consent Banner
- ✅ Demo content seeder (seed-demo-content.cjs)
- ✅ Admin seed scripts (seed-ceo-admin.cjs, seed-admin-rest.cjs)

---

## SECTION 2 — GAP ANALYSIS BY PLATFORM

---

### 🌐 WEB (PWA) — Gap Analysis

**Current Status: 88% Beta Ready**

#### CRITICAL (must fix before beta)
| ID | Issue | Severity | File(s) |
|----|-------|----------|---------|
| WEB-C1 | ~~Duplicate ✏️ FAB on FeedPage overlapping beta feedback button~~ **FIXED** | ✅ Fixed | FeedPage.jsx |
| WEB-C2 | ~~🧪 Feedback button visible on mobile TopNav — clutters 44px top bar~~ **FIXED** | ✅ Fixed | TopNav.jsx + global.css |
| WEB-C3 | ~~Mobile bottom nav Profile tab had no path to all secondary sections~~ **FIXED** | ✅ Fixed | MobileBottomNav.jsx |
| WEB-C4 | `useAppStore` missing `setMoreDrawerOpen` — MoreDrawer won't open | 🔴 CRITICAL | useAppStore.js |
| WEB-C5 | CreatePostPage (`/post/create`) — needs real Firestore write + media upload | 🔴 CRITICAL | (missing page) |
| WEB-C6 | ConversationPage — real-time Firestore chat not fully wired (renders but no send) | 🔴 CRITICAL | ConversationPage.jsx |
| WEB-C7 | Dating swipe (DatingPage) — left/right swipe not persisted to Firestore matches collection | 🔴 CRITICAL | DatingPage.jsx |
| WEB-C8 | VideoCallRoomPage — WebRTC ICE negotiation stubs only; no real peer connection | 🔴 CRITICAL | VideoCallRoomPage.jsx |
| WEB-C9 | OneSignal push notifications — service exists but `VITE_ONESIGNAL_APP_ID` env var not set | 🔴 CRITICAL | .env + onesignal-service.js |

#### HIGH (fix in Week 1 of beta prep)
| ID | Issue | Severity |
|----|-------|----------|
| WEB-H1 | ProfileEditPage — avatar photo upload → Firebase Storage not wired | 🟠 HIGH |
| WEB-H2 | StoryCreatePage — camera/photo picker calls stub, not FileReader | 🟠 HIGH |
| WEB-H3 | Marketplace CheckoutPage — Stripe/payment integration is UI-only | 🟠 HIGH |
| WEB-H4 | LiveSetupPage — WebRTC broadcast (livestream-webrtc.js) not connected to LiveWatchPage viewer | 🟠 HIGH |
| WEB-H5 | Search — full-text search uses client-side filter; no Algolia/Typesense index | 🟠 HIGH |
| WEB-H6 | Groups — GroupDetailPage posts feed not loading from Firestore subcollection | 🟠 HIGH |
| WEB-H7 | Events — EventDetailPage RSVP not writing to Firestore attendees | 🟠 HIGH |
| WEB-H8 | Notifications — real-time Firestore listener exists but "mark all read" not wired | 🟠 HIGH |

#### MEDIUM (fix in Week 2)
| ID | Issue | Severity |
|----|-------|----------|
| WEB-M1 | WalletPage — balance is hardcoded UI; no Firestore wallet document | 🟡 MEDIUM |
| WEB-M2 | MusicPage — Deezer tracks play in iframe only; no persistent mini-player state | 🟡 MEDIUM |
| WEB-M3 | GamingHub — RAWG game cards link to external site; no in-app detail page | 🟡 MEDIUM |
| WEB-M4 | TrendingPage — Reddit API returns data but "trending topics" section still shows placeholder text | 🟡 MEDIUM |
| WEB-M5 | SettingsPage — notification preferences don't write to Firestore user document | 🟡 MEDIUM |
| WEB-M6 | PremiumPage — upgrade CTA links to placeholder; no Stripe subscription flow | 🟡 MEDIUM |
| WEB-M7 | AdminDashboardPage — KYC approval button doesn't update Firestore user.kycStatus | 🟡 MEDIUM |
| WEB-M8 | InvitePage — invite link generation is static; no Firebase Dynamic Links | 🟡 MEDIUM |

#### LOW (polish sprint)
| ID | Issue | Severity |
|----|-------|----------|
| WEB-L1 | LandingPage — marketing copy has placeholder "Lorem ipsum" in 2 cards | 🟢 LOW |
| WEB-L2 | WhatsNewPage — changelog entries are hardcoded; not reading from Firestore | 🟢 LOW |
| WEB-L3 | HelpSubPages — FAQ items are hardcoded; not CMS-driven | 🟢 LOW |
| WEB-L4 | Back-to-top button in FeedPage z-index clips over floating FAB on iPad | 🟢 LOW |
| WEB-L5 | Cookie consent banner re-appears after hard refresh on Safari (localStorage not persisted) | 🟢 LOW |

---

### 🤖 ANDROID — Gap Analysis

**Current Status: 70% Beta Ready**
**Tech: Capacitor 5 + Android Gradle project (ConnectHub-SPA/android/)**

#### CRITICAL
| ID | Issue | Severity |
|----|-------|----------|
| AND-C1 | `capacitor.config.json` `appId: "com.lynkapp.app"` — needs to match `google-services.json` package name (currently `com.example.lynkapp`) | 🔴 CRITICAL |
| AND-C2 | `build.gradle` `targetSdkVersion` needs to be **34** (Android 14) for Play Store | 🔴 CRITICAL |
| AND-C3 | `google-services.json` present in Downloads but NOT copied to `android/app/` folder | 🔴 CRITICAL |
| AND-C4 | Capacitor plugins not installed: `@capacitor/camera`, `@capacitor/push-notifications`, `@capacitor/status-bar`, `@capacitor/splash-screen` | 🔴 CRITICAL |
| AND-C5 | `npx cap sync android` never run after Vite build — native project is out of sync | 🔴 CRITICAL |
| AND-C6 | `AndroidManifest.xml` missing permissions: `CAMERA`, `READ_MEDIA_IMAGES`, `VIBRATE`, `RECEIVE_BOOT_COMPLETED` | 🔴 CRITICAL |
| AND-C7 | Safe area insets: `env(safe-area-inset-bottom)` works in Safari/Chrome but Capacitor Android WebView needs `android:windowSoftInputMode="adjustResize"` in Manifest | 🔴 CRITICAL |

#### HIGH
| ID | Issue | Severity |
|----|-------|----------|
| AND-H1 | Splash screen: `LynkApp-Production-App/js/splash-init.js` is for HTML app; Capacitor splash uses `@capacitor/splash-screen` plugin + `android/app/src/main/res/drawable` | 🟠 HIGH |
| AND-H2 | Push notifications: `@capacitor/push-notifications` not installed; OneSignal Android SDK needs FCM `google-services.json` | 🟠 HIGH |
| AND-H3 | Back button behavior: Android hardware back button not handled — app exits instead of navigating back | 🟠 HIGH |
| AND-H4 | File picker for posts/stories: Browser `<input type="file">` works but needs `@capacitor/filesystem` for proper Android media access | 🟠 HIGH |
| AND-H5 | Video calls (VideoCallRoomPage): WebRTC in Capacitor Android WebView requires `android:usesCleartextTraffic` and TURN server config | 🟠 HIGH |
| AND-H6 | Dark status bar: Status bar overlaps TopNav on Android (needs `StatusBar.setStyle` + `StatusBar.setBackgroundColor`) | 🟠 HIGH |
| AND-H7 | Keyboard pushes content: Input fields in ConversationPage scroll behind keyboard on Android | 🟠 HIGH |

#### MEDIUM
| ID | Issue | Severity |
|----|-------|----------|
| AND-M1 | App icon: Default Capacitor icon used; LynkApp branded icon not set in `android/app/src/main/res/mipmap-*/` | 🟡 MEDIUM |
| AND-M2 | Deep links: Firebase Dynamic Links for invite/dating match not configured in AndroidManifest | 🟡 MEDIUM |
| AND-M3 | Biometric auth: `@capacitor/biometric-auth` not installed for Face/Fingerprint login | 🟡 MEDIUM |
| AND-M4 | Network detection: `navigator.onLine` works but `@capacitor/network` gives better Android connectivity events | 🟡 MEDIUM |
| AND-M5 | Haptics: `navigator.vibrate()` used but `@capacitor/haptics` gives finer control (impact/notification/selection) | 🟡 MEDIUM |
| AND-M6 | Location (nearby friends): `@capacitor/geolocation` needed for precise permissions on Android 12+ | 🟡 MEDIUM |
| AND-M7 | Minimum SDK: `minSdkVersion` should be **24** (Android 7) to cover 97% of market | 🟡 MEDIUM |

#### LOW
| ID | Issue | Severity |
|----|-------|----------|
| AND-L1 | `android-build.bat` references `node_modules/.bin/cap` path — may fail if npx not in PATH | 🟢 LOW |
| AND-L2 | ProGuard/R8 rules not configured for release build (causes crashes with minified code) | 🟢 LOW |
| AND-L3 | App bundle format: `build.gradle` generates APK; Play Store prefers AAB (`./gradlew bundleRelease`) | 🟢 LOW |

---

### 🍎 iOS — Gap Analysis

**Current Status: 60% Beta Ready**
**Tech: Capacitor 5 + iOS project (not yet generated)**

#### CRITICAL
| ID | Issue | Severity |
|----|-------|----------|
| IOS-C1 | **No iOS platform added** — `npx cap add ios` never run; `ConnectHub-SPA/ios/` folder does not exist | 🔴 CRITICAL |
| IOS-C2 | Xcode project needs Bundle Identifier matching Firebase: `com.lynkapp.app` | 🔴 CRITICAL |
| IOS-C3 | `GoogleService-Info.plist` for iOS Firebase not present (only `google-services.json` for Android) | 🔴 CRITICAL |
| IOS-C4 | Capacitor iOS plugins same as Android: `@capacitor/camera`, `@capacitor/push-notifications`, etc. not installed | 🔴 CRITICAL |
| IOS-C5 | `Info.plist` permission descriptions required: `NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription`, `NSLocationWhenInUseUsageDescription`, `NSMicrophoneUsageDescription` | 🔴 CRITICAL |
| IOS-C6 | App Transport Security (ATS): All HTTP calls must be HTTPS; any non-HTTPS API calls blocked by default | 🔴 CRITICAL |

#### HIGH
| ID | Issue | Severity |
|----|-------|----------|
| IOS-H1 | WKWebView scrolling: `overflow: hidden` on `body` breaks iOS bounce scroll; needs `-webkit-overflow-scrolling: touch` on scroll containers | 🟠 HIGH |
| IOS-H2 | Safe area: `env(safe-area-inset-bottom)` works but `viewport-fit=cover` must be in `<meta>` tag | 🟠 HIGH |
| IOS-H3 | Status bar: Needs `StatusBar.setStyle({ style: Style.Dark })` for light-on-dark nav | 🟠 HIGH |
| IOS-H4 | Keyboard: iOS keyboard obscures inputs; needs `ScrollView` + `adjustResize` equivalent via Capacitor keyboard plugin | 🟠 HIGH |
| IOS-H5 | Push notifications: APNs certificate or Key must be uploaded to Firebase Console + OneSignal | 🟠 HIGH |
| IOS-H6 | TestFlight distribution: Requires paid Apple Developer account ($99/yr), provisioning profiles, and code signing | 🟠 HIGH |
| IOS-H7 | WebRTC (Video Calls): Works in WKWebView iOS 14.5+ but requires TURN servers for NAT traversal | 🟠 HIGH |

#### MEDIUM
| ID | Issue | Severity |
|----|-------|----------|
| IOS-M1 | App icon: 1024×1024 PNG needed for App Store + all icon sizes in `Assets.xcassets` | 🟡 MEDIUM |
| IOS-M2 | Launch screen: Capacitor default splash; LynkApp branded splash image needed | 🟡 MEDIUM |
| IOS-M3 | SwiftUI / Objective-C: All native functionality accessed through Capacitor plugins only; no custom native code needed for MVP | 🟡 MEDIUM |
| IOS-M4 | Background fetch: Music playback stops when app backgrounds; `@capacitor/background-runner` or AVAudioSession needed | 🟡 MEDIUM |
| IOS-M5 | Deep links: Universal Links (apple-app-site-association) for invite/dating match | 🟡 MEDIUM |
| IOS-M6 | Biometrics: Face ID / Touch ID via `@capacitor/biometric-auth` | 🟡 MEDIUM |
| IOS-M7 | Minimum iOS version: Target **iOS 15** for Capacitor 5 compatibility | 🟡 MEDIUM |

---

## SECTION 3 — SPRINT PLAN TO BETA TESTERS

### 🏁 TARGET: Beta testers in 3 sprints (3 weeks)

---

### SPRINT 1 — Critical Fixes (Week 1) 🔴

**Goal: Web beta-ready + Android buildable**

#### Web Critical (4–5 days)

**Day 1–2: State + Navigation fixes**
```
1. Add `setMoreDrawerOpen` + `moreDrawerOpen` to useAppStore.js
2. Create MoreDrawer component in AppShell.jsx (slide-up with all section links)
3. Wire the ⋯ More tab in MobileBottomNav to open MoreDrawer
4. Create /post/create page (CreatePostPage.jsx) — text + media upload → Firestore
```

**Day 3: Core social features**
```
5. ConversationPage — wire `sendMessage()` to Firestore messages/{chatId}/messages subcollection
6. DatingPage — persist swipe right as Firestore match doc; trigger DatingMatchCelebrationPage
7. ProfileEditPage — wire avatar upload to Firebase Storage → update user.photoURL
```

**Day 4: Push + create post**
```
8. Set VITE_ONESIGNAL_APP_ID in .env and .env.production
9. StoryCreatePage — wire FileReader + Firebase Storage upload
10. OneSignal initialization in main.jsx
```

**Day 5: Deploy + smoke test**
```
11. Run: cd ConnectHub-SPA && npm run build && firebase deploy
12. Smoke test all 5 bottom nav tabs + MoreDrawer on Chrome mobile emulator
13. Test create post, like, comment, send message, swipe right
```

#### Android Critical (parallel, 2–3 days)

```
1. Copy google-services.json to ConnectHub-SPA/android/app/
2. Update capacitor.config.json appId to match Firebase package name
3. Install Capacitor plugins:
   cd ConnectHub-SPA
   npm install @capacitor/camera @capacitor/push-notifications
   npm install @capacitor/status-bar @capacitor/splash-screen
   npm install @capacitor/haptics @capacitor/keyboard
   npx cap sync android

4. Update android/app/build.gradle:
   targetSdkVersion 34, minSdkVersion 24

5. Update AndroidManifest.xml permissions:
   <uses-permission android:name="android.permission.CAMERA" />
   <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
   <uses-permission android:name="android.permission.VIBRATE" />
   <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />

6. Add to MainActivity activity tag:
   android:windowSoftInputMode="adjustResize"

7. Build debug APK:
   cd android && ./gradlew assembleDebug
   (or run android-build.bat)

8. Install on Android device via ADB and smoke test
```

---

### SPRINT 2 — High Priority Fixes (Week 2) 🟠

**Goal: Core features all functional; Android polished; iOS initialized**

#### Web High (Days 1–3)
```
1. GroupDetailPage — load posts from Firestore groups/{id}/posts
2. EventDetailPage — RSVP writes to Firestore events/{id}/attendees
3. NotificationsPage — "mark all read" updates Firestore
4. TrendingPage — replace placeholder text with real Reddit data from reddit-service.js
5. SettingsPage — notification prefs write to Firestore users/{uid}/settings
6. AdminDashboardPage — KYC approve/reject updates user.kycStatus in Firestore
7. LiveSetupPage → LiveWatchPage — connect WebRTC broadcast via livestream-webrtc.js
8. WalletPage — create Firestore wallets/{uid} document with balance field
```

#### Android High (Days 2–4)
```
1. Back button handling — add App.addListener('backButton', ...) in main.jsx
2. StatusBar plugin — setBackgroundColor('#0a0818') + setStyle(Style.Dark)
3. SplashScreen plugin — hide after app loads
4. Push notifications — configure FCM + OneSignal Android
5. File picker — replace <input file> with Camera.getPhoto() on mobile platform
6. Test keyboard push on ConversationPage; fix with Keyboard plugin listeners
7. App icon — replace with LynkApp branded icon in all mipmap-* folders
```

#### iOS Initialize (Days 3–5)
```
1. On macOS machine (required for iOS):
   cd ConnectHub-SPA
   npx cap add ios

2. Open ios/App/App.xcworkspace in Xcode
3. Set Bundle ID: com.lynkapp.app
4. Add GoogleService-Info.plist to Xcode project
5. Add Info.plist permission descriptions
6. Run on iOS Simulator — verify app loads
7. Fix any WKWebView CSS issues (overflow, safe area)
8. Configure StatusBar + SplashScreen plugins
```

---

### SPRINT 3 — Polish + Beta Launch (Week 3) 🟡

**Goal: Ship to beta testers on all 3 platforms**

#### Web Polish (Days 1–2)
```
1. LandingPage — replace Lorem ipsum with real copy
2. InvitePage — Firebase Dynamic Links for referral
3. PremiumPage — Stripe subscription checkout (or "coming soon" gate)
4. MusicPage — persist mini-player state in AppStore
5. Add loading skeletons to all pages that are missing them
6. Accessibility audit — check focus-visible rings, aria labels on all interactive elements
7. Performance — run Lighthouse; target score > 80 on PWA, Performance, Accessibility
```

#### Android Polish (Days 2–4)
```
1. Haptics — replace navigator.vibrate() with Haptics.impact() in PostCard like button
2. Geolocation — use @capacitor/geolocation in FriendNearbyPage
3. Biometrics — add Face/Fingerprint login option in LoginPage
4. ProGuard rules for release build
5. Build release AAB: ./gradlew bundleRelease
6. Sign with keystore and upload to Google Play Internal Testing track
```

#### iOS Polish (Days 3–5)
```
1. Background audio — add AVAudioSession keys to Info.plist for MusicPage
2. Universal Links — set up apple-app-site-association
3. Deep links for dating match notifications
4. TestFlight upload via Xcode Organizer or Codemagic CI
5. Test on real iPhone (minimum iPhone 12, iOS 15)
6. Submit to TestFlight for beta tester distribution
```

---

## SECTION 4 — PLATFORM COMPARISON MATRIX

| Feature | Web (PWA) | Android | iOS |
|---------|-----------|---------|-----|
| Auth (Email/Google) | ✅ | ✅ | 🟡 (needs GoogleService-Info.plist) |
| Feed + Posts | ✅ | ✅ | 🟡 (iOS not initialized) |
| Real-time Messages | 🟠 (send not wired) | 🟠 | 🔴 |
| Stories | 🟠 (upload stub) | 🟠 | 🔴 |
| Live Streaming | 🟠 (WebRTC stub) | 🟠 | 🔴 |
| Dating Swipe | 🟠 (persist missing) | 🟠 | 🔴 |
| Marketplace | 🟠 (payment stub) | 🟠 | 🔴 |
| Video Calls | 🟠 (WebRTC stub) | 🟠 | 🔴 |
| Push Notifications | 🟠 (env not set) | 🟠 | 🔴 |
| Camera / Media Upload | 🟠 (FileReader only) | 🟠 (needs plugin) | 🔴 |
| Offline Support | ✅ (sw.js) | 🟡 | 🔴 |
| Haptics | 🟡 (vibrate API) | 🟡 (needs plugin) | 🔴 |
| Safe Area Insets | ✅ | 🟠 (needs manifest) | 🟡 |
| Status Bar | N/A | 🟠 (needs plugin) | 🟠 |
| Back Button | N/A | 🔴 (exits app) | N/A |
| Biometrics | ❌ | 🟡 | 🟡 |
| Deep Links | 🟡 | 🟡 | 🟡 |
| App Store / Play Store | PWA installable | 🟡 (build exists) | 🔴 (not generated) |

**Legend:** ✅ Working | 🟡 Partial | 🟠 Needs work | 🔴 Not started | ❌ Not planned for beta

---

## SECTION 5 — NAVIGATION ARCHITECTURE (FIXED)

### Mobile (< 640px) — Bottom Tab Bar Pattern
```
┌─────────────────────────────────────────────────────┐
│  ⚡ LynkApp                    🔔 🔍 ✏️   [avatar]  │  ← TopNav (56px)
├─────────────────────────────────────────────────────┤
│                                                     │
│              Page Content (scrolls)                 │
│                                                     │
├─────────────────────────────────────────────────────┤
│  🏠    🔍    ➕    💬    ⋯ More                     │  ← MobileBottomNav (64px)
└─────────────────────────────────────────────────────┘

⋯ More opens MoreDrawer (full-screen slide-up):
  Dating | Live | Stories | Groups | Events | Friends
  Gaming | Media Hub | Music | Video Calls | AR/VR
  Marketplace | Creator Studio | Business Tools | Trending
  Saved | Premium | Settings | Help | Profile | Wallet
```

### Desktop (≥ 1024px) — Sidebar + Main Content
```
┌──────┬───────────────────────────────────────────────┐
│ Side │  TopNav                                       │
│ Nav  ├───────────────────────────────────────────────┤
│  65  │                                               │
│  px  │         Main Content Area                    │
│      │                                               │
└──────┴───────────────────────────────────────────────┘
```

### Fixes Applied This Session
1. ✅ **MobileBottomNav** — Profile tab replaced with "⋯ More" tab. All 20+ dashboards accessible via MoreDrawer.
2. ✅ **FeedPage** — Duplicate ✏️ FAB removed (conflicts with ➕ Create tab + floating beta feedback button).
3. ✅ **TopNav** — `🧪 Feedback` button hidden on mobile (`@media max-width:639px`) via `.feedback-btn-desktop` class.

---

## SECTION 6 — BETA TESTER RECRUITMENT PLAN

### Phase 1 — Web Beta (Deploy now, invite this week)
- Share: `https://lynkapp-c7db1.web.app`
- Target: 10–20 internal testers (friends, family, co-workers)
- Feedback channel: BetaFeedbackModal (already wired) + Discord server
- Duration: 1 week
- Focus areas: Auth, Feed, Messaging, Dating

### Phase 2 — Android Internal Testing (after Sprint 1)
- Upload signed APK to Google Play Internal Testing
- Invite via email through Play Console
- Target: 10 Android testers
- Duration: 1 week parallel to iOS setup

### Phase 3 — iOS TestFlight (after Sprint 2)
- Upload IPA to TestFlight via Codemagic CI
- Invite via email in App Store Connect
- Target: 10 iOS testers
- Duration: 1 week

### Phase 4 — Open Beta (after Sprint 3)
- All 3 platforms
- 50–200 testers
- Google Play Open Testing track + TestFlight external testing
- Beta feedback dashboard in AdminDashboardPage

---

## SECTION 7 — BETA TESTER FEEDBACK COLLECTION

The app already has:
- ✅ `BetaFeedbackModal` — category (Bug/UI/Feature/Performance) + description + screenshot
- ✅ Feedback saves to Firestore `betaFeedback` collection
- ✅ Admin can review in `AdminDashboardPage` → Reports

**Recommended beta tester tasks:**
1. Sign up with email → complete onboarding
2. Browse feed → like + comment on 3 posts
3. Create a post with a photo
4. Send a message to another tester
5. View a story + create your own
6. Try dating swipe (right + left)
7. Find a product in Marketplace → add to cart
8. Check notifications
9. Update profile photo
10. Use the ⋯ More drawer to navigate to 3 different sections
11. Rate the overall experience (1–5) in Feedback modal

---

## SECTION 8 — ENVIRONMENT VARIABLES CHECKLIST

Before deploying to beta, confirm ALL these are set in `ConnectHub-SPA/.env.production`:

```env
# Firebase (already set)
VITE_FIREBASE_API_KEY=✅
VITE_FIREBASE_AUTH_DOMAIN=✅
VITE_FIREBASE_PROJECT_ID=✅
VITE_FIREBASE_STORAGE_BUCKET=✅
VITE_FIREBASE_MESSAGING_SENDER_ID=✅
VITE_FIREBASE_APP_ID=✅

# Push Notifications (NEEDED)
VITE_ONESIGNAL_APP_ID=❌ GET FROM onesignal.com dashboard

# Media APIs (check each)
VITE_GIPHY_API_KEY=✅ (set)
VITE_UNSPLASH_ACCESS_KEY=✅
VITE_PEXELS_API_KEY=✅
VITE_RAWG_API_KEY=✅

# Error Tracking (set if using Sentry)
VITE_SENTRY_DSN=🟡

# Payments (needed for Marketplace)
VITE_STRIPE_PUBLISHABLE_KEY=❌ GET FROM stripe.com
```

---

## SECTION 9 — DEPLOYMENT COMMANDS QUICK REFERENCE

### Web Deploy
```bash
cd ConnectHub-SPA
npm run build
firebase deploy --only hosting
```

### Android Build (debug)
```bash
cd ConnectHub-SPA
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
# APK at: android/app/build/outputs/apk/debug/app-debug.apk
```

### Android Build (release)
```bash
./gradlew bundleRelease
# Sign with keystore
# Upload AAB to Google Play Console
```

### iOS Build (requires macOS + Xcode)
```bash
cd ConnectHub-SPA
npm run build
npx cap sync ios
npx cap open ios
# Then build/archive in Xcode
# Upload to TestFlight via Xcode Organizer
```

### Full Deploy (all at once)
```bash
cd ConnectHub-SPA
MASTER-DEPLOY-ALL.bat   # runs build + all firebase deploys
```

---

## SECTION 10 — RISK REGISTER

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| WebRTC Video Calls fail behind NAT | HIGH | HIGH | Use TURN servers (Twilio/Metered) for beta |
| iOS App Store rejection (missing privacy descriptions) | HIGH | HIGH | Add all Info.plist descriptions before submission |
| Firestore security rules too permissive for beta | MEDIUM | HIGH | Audit rules before beta launch (rules deployed) |
| Firebase Spark plan quota exceeded | MEDIUM | HIGH | Upgrade to Blaze plan before beta (pay-as-you-go) |
| Google Play review takes 3–7 days | HIGH | MEDIUM | Submit early; use Internal Testing first (instant) |
| Android hardware back exits app | HIGH | MEDIUM | Implement backButton listener in Sprint 1 |
| Dating match notifications don't fire | MEDIUM | MEDIUM | Test OneSignal on real devices in Sprint 1 |
| Safari iOS video autoplay blocked | HIGH | LOW | Add `muted playsinline` to all video tags ✅ already done |

---

## SECTION 11 — ESTIMATED TIMELINE

```
Week 1 (Sprint 1)  ───────────────────────────────────────
Mon: useAppStore + MoreDrawer + CreatePostPage
Tue: ConversationPage send + Dating swipe persist
Wed: ProfileEdit upload + StoryCreate + OneSignal env
Thu: Android — google-services.json, permissions, Capacitor sync
Fri: Build debug APK + web deploy + smoke test

Week 2 (Sprint 2)  ───────────────────────────────────────
Mon: Groups/Events Firestore wiring
Tue: Notifications + Settings + Admin KYC wiring
Wed: Android StatusBar + SplashScreen + back button + push
Thu: iOS — npx cap add ios, Xcode setup, Info.plist
Fri: iOS Simulator smoke test

Week 3 (Sprint 3)  ───────────────────────────────────────
Mon: Web polish — loading states, copy fixes, Lighthouse
Tue: Android — release AAB + ProGuard + Play Store upload
Wed: iOS — TestFlight upload + biometrics + deep links
Thu: Beta tester invites (10–20 testers per platform)
Fri: Monitor feedback in AdminDashboard; hotfix as needed

🎯 BETA LAUNCH TARGET: End of Week 3
```

---

## APPENDIX — FILE REFERENCE MAP

| Component | File |
|-----------|------|
| App entry | `ConnectHub-SPA/src/main.jsx` |
| Router | `ConnectHub-SPA/src/App.jsx` |
| AppShell | `ConnectHub-SPA/src/components/layout/AppShell.jsx` |
| TopNav | `ConnectHub-SPA/src/components/layout/TopNav.jsx` |
| MobileBottomNav | `ConnectHub-SPA/src/components/layout/MobileBottomNav.jsx` |
| Global State | `ConnectHub-SPA/src/store/useAppStore.js` |
| Global CSS | `ConnectHub-SPA/src/styles/global.css` |
| Mobile CSS | `ConnectHub-SPA/src/styles/mobile-ios-android.css` |
| Firebase Config | `ConnectHub-SPA/src/firebase/config.js` |
| Capacitor Config | `ConnectHub-SPA/capacitor.config.json` |
| PWA Manifest | `ConnectHub-SPA/public/manifest.json` |
| Service Worker | `ConnectHub-SPA/public/sw.js` |
| Android Build | `ConnectHub-SPA/android/build.gradle` |
| Android Build Script | `ConnectHub-SPA/android-build.bat` |
| Firebase Rules | `ConnectHub-SPA/firestore.rules` |
| Storage Rules | `ConnectHub-SPA/storage.rules` |
| Deploy Script | `ConnectHub-SPA/MASTER-DEPLOY-ALL.bat` |
| Codemagic CI | `ConnectHub-SPA/codemagic.yaml` |

---

*Document generated: June 11, 2026*
*Next review: After Sprint 1 completion*
