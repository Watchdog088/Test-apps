# SECTION 2 — APP STORE REQUIREMENTS AUDIT
**Date Audited:** September 1, 2026  
**Auditor:** Cline AI (full codebase inspection)  
**Scope:** PRE-APP-STORE-MASTER-CHECKLIST.md — Section 2 only  
**App:** LynkApp (ConnectHub-SPA) — React 18 + Vite + Firebase + Capacitor 6

---

## QUICK SCORECARD

| Sub-Section | Items | Done | Not Done | % |
|---|---|---|---|---|
| 2.1 Google Play — App Signing & Build | 7 | 2 | 5 | 29% |
| 2.1 Google Play — Console Setup | 7 | 0 | 7 | 0% |
| 2.1 Google Play — Android Technical | 4 | 1 | 3 | 25% |
| 2.2 Apple — iOS Platform Setup | 9 | 0 | 9 | 0% |
| 2.2 Apple — App Icons & Launch | 2 | 0 | 2 | 0% |
| 2.2 Apple — App Store Connect | 6 | 0 | 6 | 0% |
| 2.2 Apple — IAP (StoreKit) | 1 | 0 | 1 | 0% |
| **TOTAL** | **36** | **3** | **33** | **8%** |

**Overall Section 2 Status: 8% complete. This section is almost entirely untouched.**

---

---

## 2.1 GOOGLE PLAY STORE REQUIREMENTS

### App Signing & Build

| Item | Status | Evidence |
|---|---|---|
| Generate Android Release Keystore | ❌ NOT DONE | No `lynkapp-release.keystore` file found anywhere in repo |
| Configure `signingConfigs.release` in build.gradle | ❌ NOT DONE | `android/app/build.gradle` has no `signingConfigs` block. Only a bare `buildTypes.release` with `minifyEnabled false` |
| Place `google-services.json` in `android/app/` | ✅ DONE | File confirmed present at `ConnectHub-SPA/android/app/google-services.json` |
| Run `npm run build && npx cap sync android` | ⚠️ PENDING | Must be run manually before every Play Store build. Cannot verify from code alone. |
| Build signed Android App Bundle (AAB) | ❌ NOT DONE | No keystore = no signed build possible yet |
| Set `minSdkVersion` to at least 23 | ✅ DONE | `variables.gradle` confirms `minSdkVersion = 23`. Play Store recommends 24+, but 23 is accepted. |
| Configure ProGuard/R8 rules | ❌ NOT DONE | `android/app/build.gradle` shows `minifyEnabled false`. ProGuard is referenced but disabled. |

**What needs to happen next (in order):**
1. Generate keystore: `keytool -genkey -v -keystore lynkapp-release.keystore -alias lynkapp -keyalg RSA -keysize 2048 -validity 10000` — run this on your computer, store the password somewhere safe (NOT in git).
2. Add `signingConfigs.release` block to `android/app/build.gradle` pointing to the keystore.
3. Enable `minifyEnabled true` and set up ProGuard rules.
4. Run `npm run build && npx cap sync android`.
5. Open Android Studio → Build → Generate Signed Bundle → Android App Bundle.

---

### Google Play Console Setup

| Item | Status | Notes |
|---|---|---|
| Create Google Play Developer Account ($25) | ❌ NOT DONE | Required before any submission. One-time fee. |
| Create new app in Play Console | ❌ NOT DONE | Depends on developer account |
| Complete Store Listing (title, description, icon, screenshots) | ❌ NOT DONE | No screenshots or store copy created yet |
| Complete Content Rating questionnaire | ❌ NOT DONE | LynkApp has dating + UGC — likely Teen (13+) or Mature (17+) |
| Complete Data Safety Form | ❌ NOT DONE | App collects location, messages, photos, payment info, device IDs — all must be declared |
| Set up App Pricing (Free + IAP) | ❌ NOT DONE | Pricing model not submitted to Play Console |
| In-app products / Google Play Billing | ❌ **POLICY RISK** | Coin purchases use Stripe. **Google REQUIRES Google Play Billing for digital goods sold in Android apps.** Stripe for virtual coins is a policy violation and will cause rejection. Must implement Google Play Billing API for coin purchases on Android, OR remove coin purchasing from the Android build. |

---

### Android Technical Requirements

| Item | Status | Evidence |
|---|---|---|
| Android Deep Links (App Links for email verification) | ❌ NOT DONE | Not verified in AndroidManifest.xml — intent filters for `lynkapp.com` need to be added |
| Android Splash Screen drawable exists | ⚠️ PARTIAL | `core-splashscreen` dependency is in build.gradle and `SplashScreen.jsx` exists in the SPA, but the native Android splash drawable at `android/app/src/main/res/drawable/splash.png` was not verified |
| Test on physical Android device | ❌ NOT DONE | Manual step — cannot be done from code |
| Push Notification registration code in `main.jsx` | ❌ NOT DONE | `main.jsx` does not contain `PushNotifications.requestPermissions()` call. The `mobile-platform-service.js` handles some of this, but the standard Capacitor push registration lifecycle is not in main.jsx as required |

---

---

## 2.2 APPLE APP STORE REQUIREMENTS

### iOS Platform Setup (Requires a Mac)

| Item | Status | Evidence |
|---|---|---|
| Run `npx cap add ios` (create ios/ folder) | ❌ **BIGGEST BLOCKER** | The `ios/` folder does NOT exist anywhere in `ConnectHub-SPA/`. iOS cannot be built without this step. Must be run on a Mac. |
| Enroll in Apple Developer Program ($99/year) | ❌ NOT DONE | Cannot verify from code. Required for TestFlight and App Store. |
| Register Bundle ID `com.lynkapp.app` | ❌ NOT DONE | Cannot verify from code. Done in Apple Developer portal. |
| Download `GoogleService-Info.plist` from Firebase | ❌ NOT DONE | No `GoogleService-Info.plist` found anywhere. Firebase iOS app must be registered first. |
| Register Firebase iOS app | ❌ NOT DONE | Must be done in Firebase Console with Bundle ID `com.lynkapp.app`. |
| Configure `Info.plist` permission descriptions | ❌ NOT DONE | iOS folder doesn't exist yet — this is done inside Xcode after `cap add ios`. Required strings: NSCameraUsageDescription, NSPhotoLibraryUsageDescription, NSMicrophoneUsageDescription, NSLocationWhenInUseUsageDescription, NSUserNotificationsUsageDescription |
| Add Push Notifications capability in Xcode | ❌ NOT DONE | iOS folder doesn't exist yet |
| Add `PrivacyInfo.xcprivacy` manifest (iOS 17+ required) | ❌ NOT DONE | Apple NOW REQUIRES this. Apps without it are rejected. Must be added to Xcode project. |
| Install `@capacitor-community/apple-sign-in` plugin | ❌ NOT DONE | `AppleSignInButton.jsx` component exists in the code, but `@capacitor-community/apple-sign-in` is NOT in `ConnectHub-SPA/package.json`. Apple REQUIRES Sign In with Apple when ANY other social sign-in (e.g., Google) is offered. This is mandatory and will cause App Store rejection. |

---

### App Icons & Launch Screen

| Item | Status | Notes |
|---|---|---|
| Create App Icon set (1024×1024 PNG, all sizes) | ❌ NOT DONE | Icons exist for PWA (`public/manifest.json` references `icon-192.png`, `icon-512.png`) but the full Xcode Asset Catalog icon set is not set up because the iOS project doesn't exist yet. The lynkapp logo files exist (`../../Documents/lynkapp-logos.tsx`) but have not been exported as proper store icons. |
| Create Launch Screen / iOS Splash Screen | ❌ NOT DONE | iOS project doesn't exist yet. `@capacitor/splash-screen` plugin would need to be configured after `cap add ios`. |

---

### App Store Connect Setup

| Item | Status | Notes |
|---|---|---|
| Create app record in App Store Connect | ❌ NOT DONE | Requires Apple Developer Program enrollment first |
| Complete App Information (name, subtitle, category) | ❌ NOT DONE | No store copy written |
| Complete App Privacy (privacy nutrition label) | ❌ NOT DONE | LynkApp collects extensive data — this will take time to fill out accurately |
| App Store Screenshots (6.7", 6.5", iPad 12.9") | ❌ NOT DONE | No screenshots prepared |
| App Description, Keywords, Support URL | ❌ NOT DONE | No store copy written |
| Build Archive and submit via Xcode | ❌ NOT DONE | iOS project doesn't exist yet |

---

### Apple In-App Purchase Policy

| Item | Status | Notes |
|---|---|---|
| Implement StoreKit / RevenueCat for coin purchases on iOS | ❌ **POLICY REQUIREMENT** | Apple REQUIRES all digital in-app purchases (virtual currency, coins, premium subscriptions) to use Apple's In-App Purchase system. Stripe cannot be used for digital goods on iOS. The `BuyCoinsPage.jsx` currently uses Stripe — this must be replaced or conditionally disabled on iOS. **Physical marketplace goods are exempt.** Options: (a) Use `@capacitor/purchases` (RevenueCat) to handle StoreKit, or (b) Disable coin purchases on iOS until implemented. |

---

---

## WHAT IS ALREADY DONE (Summary of Completed Items)

1. ✅ `google-services.json` is in the correct Android location (`ConnectHub-SPA/android/app/`)
2. ✅ `minSdkVersion = 23` set in `variables.gradle` (meets Play Store minimum)
3. ✅ Android project structure exists (`android/` folder with proper Capacitor setup)
4. ✅ Bundle ID `com.lynkapp.app` set in `capacitor.config.json` and `android/app/build.gradle` namespace
5. ✅ `codemagic.yaml` exists for CI/CD builds (good foundation for Codemagic iOS builds)
6. ✅ Legal pages exist as React components: `TermsPage.jsx`, `PrivacyPage.jsx`, `CookiePolicyPage.jsx`, `ContactPage.jsx` — **but need live deployed URLs**

---

---

## WHAT NEEDS TO BE DONE NEXT — PRIORITIZED ACTION LIST

### 🔴 DO THESE FIRST (Blockers — Nothing Works Without Them)

**ANDROID:**
1. **Generate keystore** — `keytool -genkey -v -keystore lynkapp-release.keystore -alias lynkapp -keyalg RSA -keysize 2048 -validity 10000` — Store the file and password in a password manager.
2. **Add signingConfig to build.gradle** — Add the `signingConfigs.release` block.
3. **Add Google Play Billing** for coin purchases — Or remove coin buying from Android build. This is a Play Store policy requirement.

**iOS:**
4. **Get a Mac** (or use Codemagic CI/CD — `codemagic.yaml` is already configured).
5. **Run `npx cap add ios`** inside `ConnectHub-SPA/` — This creates the entire iOS Xcode project.
6. **Enroll in Apple Developer Program** ($99/year at developer.apple.com).
7. **Install Apple Sign In plugin** — `npm install @capacitor-community/apple-sign-in && npx cap sync ios`.
8. **Implement StoreKit/RevenueCat** for coin purchases on iOS — Or gate the feature.

---

### 🟠 DO THESE SECOND (Store Listing & Console)

9. Create Google Play Developer Account ($25 one-time).
10. Create app record in Google Play Console.
11. Create app record in App Store Connect.
12. Write store listing copy (title, short desc, full desc, keywords).
13. Create screenshots (minimum 2 Android phone screenshots, 2 iPhone screenshots).
14. Create 512×512 Android icon PNG, 1024×1024 iOS icon PNG.
15. Create Feature Graphic for Play Store (1024×500 PNG).
16. Fill out Content Rating (IARC) questionnaire — likely Teen 13+ or Mature 17+.
17. Fill out Data Safety (Google) and App Privacy (Apple) forms.

---

### 🟡 DO THESE THIRD (Technical Polish)

18. Add Push Notification registration code to `main.jsx`.
19. Enable ProGuard/R8 (`minifyEnabled true`) in `android/app/build.gradle`.
20. Add Android Deep Links / App Links to `AndroidManifest.xml`.
21. Add `PrivacyInfo.xcprivacy` file to the iOS Xcode project.
22. Configure `Info.plist` permission usage descriptions in Xcode.
23. Test on a physical Android device (USB).
24. Test on at least one physical iOS device (requires Mac + Apple Developer enrollment).

---

---

## ESTIMATED TIME TO COMPLETE SECTION 2

| Area | Estimated Time |
|---|---|
| Android keystore + signing config | 1–2 hours |
| Google Play Billing for coins | 8–16 hours |
| `npx cap add ios` + Xcode config | 4–8 hours (Mac required) |
| Apple Sign In + StoreKit/RevenueCat | 8–16 hours |
| Store listings, screenshots, descriptions | 4–8 hours |
| Google Play Console + App Store Connect setup | 2–4 hours |
| Physical device testing (Android + iOS) | 4–8 hours |
| **TOTAL** | **31–62 hours** |

---

*Generated: September 1, 2026 — Based on full codebase audit of ConnectHub-SPA/android/, package.json, build.gradle, variables.gradle, capacitor.config.json, and file existence checks.*
