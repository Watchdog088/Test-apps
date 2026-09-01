# SECTION 2 — APP STORE REQUIREMENTS AUDIT
# Status Report: What Is Done & What Still Needs to Be Done

**Date Audited:** September 1, 2026
**Auditor:** Cline AI (full codebase inspection)
**Scope:** PRE-APP-STORE-MASTER-CHECKLIST.md — Section 2 only
**App:** LynkApp (ConnectHub-SPA) — React 18 + Vite + Firebase + Capacitor 6
**GitHub Repo:** https://github.com/Watchdog088/Test-apps.git
**Last Commit:** Verified September 1, 2026

---

## QUICK SCORECARD (Updated after codebase inspection)

| Sub-Section | Items | Done | Not Done | % Complete |
|---|---|---|---|---|
| 2.1 Google Play — App Signing & Build | 7 | 2 | 5 | 29% |
| 2.1 Google Play — Console Setup | 7 | 0 | 7 | 0% |
| 2.1 Google Play — Android Technical | 4 | 1 | 3 | 25% |
| 2.2 Apple — iOS Platform Setup | 9 | 0 | 9 | 0% |
| 2.2 Apple — App Icons & Launch | 2 | 0 | 2 | 0% |
| 2.2 Apple — App Store Connect | 6 | 0 | 6 | 0% |
| 2.2 Apple — IAP (StoreKit) | 1 | 0 | 1 | 0% |
| **TOTAL** | **36** | **3** | **33** | **8%** |

> **Overall Section 2 Status: ~8% complete. This section is almost entirely untouched.**
> Most remaining items require human action (keystore generation, Apple Developer enrollment,
> physical device testing, Play/App Store console setup). Code-side items are identified below.

---

---

## ✅ WHAT HAS BEEN COMPLETED (Verified by Code Inspection)

### 1. `google-services.json` — ✅ CONFIRMED PRESENT
- **File location:** `ConnectHub-SPA/android/app/google-services.json`
- **Evidence:** Referenced and applied in `android/app/build.gradle` lines 48–54:
  ```groovy
  def servicesJSON = file('google-services.json')
  if (servicesJSON.text) {
      apply plugin: 'com.google.gms.google-services'
  }
  ```
- **Status:** Google Firebase Android integration is wired correctly.

### 2. `minSdkVersion = 23` — ✅ CONFIRMED
- **File:** `ConnectHub-SPA/android/variables.gradle` line 7
- **Value:** `minSdkVersion = 23`  — Android 6.0 Marshmallow. Meets Play Store minimum.
- **Additional:** `targetSdkVersion = 35` (Android 15), `compileSdkVersion = 35`. All current.
- **Capacitor version:** 6.2.0 (latest stable line).

### 3. Android Project Structure — ✅ EXISTS
- `ConnectHub-SPA/android/` folder is present with full Capacitor Android project.
- `android/build.gradle`, `android/app/build.gradle`, `android/variables.gradle`,
  `android/gradle.properties`, `android/gradle/wrapper/gradle-wrapper.properties` all present.
- Capacitor 6 is properly scaffolded.

### 4. Bundle ID `com.lynkapp.app` — ✅ SET
- **File:** `android/app/build.gradle` line 4: `namespace "com.lynkapp.app"`
- **File:** `android/app/build.gradle` line 7: `applicationId "com.lynkapp.app"`
- Matches the intended bundle identifier for both stores.

### 5. `codemagic.yaml` — ✅ EXISTS
- **File:** `ConnectHub-SPA/codemagic.yaml`
- This is the CI/CD build pipeline configuration for Codemagic.
- Provides a path to build iOS on Mac cloud machines without owning a Mac locally.
- Foundation is present; needs iOS project (`npx cap add ios`) to be complete.

### 6. Legal Pages — ✅ REACT COMPONENTS EXIST
- `ConnectHub-SPA/src/pages/legal/TermsPage.jsx` — Terms of Service
- `ConnectHub-SPA/src/pages/legal/PrivacyPage.jsx` — Privacy Policy
- `ConnectHub-SPA/src/pages/legal/CookiePolicyPage.jsx` — Cookie Policy
- `ConnectHub-SPA/src/pages/legal/ContactPage.jsx` — Contact Us
- `ConnectHub-SPA/src/pages/legal/AboutPage.jsx` — About page
- ⚠️ **These need live deployed URLs** for store listings.

### 7. `AppleSignInButton.jsx` Component — ✅ UI EXISTS (but plugin not installed)
- **File:** `ConnectHub-SPA/src/components/auth/AppleSignInButton.jsx`
- The UI component is built. However, the underlying native plugin
  `@capacitor-community/apple-sign-in` is **NOT** in `package.json` (see Not Done section).

### 8. `@capacitor/push-notifications` in package.json — ✅ DEPENDENCY DECLARED
- **File:** `ConnectHub-SPA/package.json` line 35
- `"@capacitor/push-notifications": "^6.0.2"` is in the dependencies list.
- ⚠️ However, `PushNotifications.requestPermissions()` is NOT called in `main.jsx`.
  The service `mobile-platform-service.js` handles some of this but the standard
  Capacitor lifecycle registration is missing from the entry point.

---

---

## ❌ WHAT HAS NOT BEEN DONE (Verified by Code Inspection)

---

### 🔴 ANDROID — APP SIGNING & BUILD (3 of 5 remaining)

#### ❌ 1. Android Release Keystore NOT Generated
- **What's missing:** No `lynkapp-release.keystore` file exists anywhere in the repository.
- **Why it matters:** Without a keystore, no signed AAB can be built. A signed AAB is
  required to upload anything to the Google Play Console.
- **Action required (human, cannot be automated):**
  ```
  keytool -genkey -v \
    -keystore lynkapp-release.keystore \
    -alias lynkapp \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000
  ```
  Store the password in a password manager. **Do NOT commit the keystore to git.**
  Add `lynkapp-release.keystore` to `.gitignore`.

#### ❌ 2. `signingConfigs.release` Block NOT in build.gradle
- **File:** `ConnectHub-SPA/android/app/build.gradle`
- **What's missing:** The `signingConfigs` block is absent. The `buildTypes.release` block
  currently has only `minifyEnabled false` and ProGuard reference.
- **Code that needs to be added** (after keystore is generated):
  ```groovy
  signingConfigs {
      release {
          storeFile file(System.getenv("KEYSTORE_PATH") ?: "lynkapp-release.keystore")
          storePassword System.getenv("KEYSTORE_STORE_PASSWORD")
          keyAlias System.getenv("KEYSTORE_KEY_ALIAS") ?: "lynkapp"
          keyPassword System.getenv("KEYSTORE_KEY_PASSWORD")
      }
  }
  buildTypes {
      release {
          signingConfig signingConfigs.release
          minifyEnabled true
          proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
      }
  }
  ```
- **Prerequisite:** Keystore must be generated first.

#### ❌ 3. ProGuard / R8 NOT Enabled
- **File:** `ConnectHub-SPA/android/app/build.gradle` line 22
- **Current value:** `minifyEnabled false`
- **Required:** `minifyEnabled true` for release builds.
- ProGuard rules file (`proguard-rules.pro`) exists but is currently bypassed.
- This reduces APK/AAB size and obfuscates code — Play Store best practice.

#### ⚠️ 4. `npm run build && npx cap sync android` — PENDING (manual step)
- This must be run before every Play Store build.
- The `build:android` script is defined in `package.json`:
  `"build:android": "npm run build && npx cap sync android"`
- Cannot be verified as done from code inspection alone; must be run manually each release.

#### ❌ 5. Signed Android App Bundle (AAB) NOT Built
- Depends on items 1–4 above being completed first.
- Steps: Android Studio → Build → Generate Signed Bundle → Android App Bundle.

---

### 🔴 ANDROID — GOOGLE PLAY BILLING (POLICY RISK — BLOCKER)

#### ❌ 6. Google Play Billing NOT Implemented for Coin Purchases
- **File:** `ConnectHub-SPA/src/pages/wallet/BuyCoinsPage.jsx`
- **Current implementation:** Uses **Stripe** to process coin/virtual currency purchases.
- **Policy violation:** Google Play policy **requires** Google Play Billing API for all
  digital goods sold within Android apps. Stripe cannot be used for virtual coins/currency
  on Android. This **will cause app rejection**.
- **Options:**
  - (A) Install `@capacitor-community/in-app-purchases-2` and wire it to Google Play Billing
        for the Android build. Use Stripe only on web.
  - (B) Platform-detect and disable the "Buy Coins" button entirely on Android until
        Google Play Billing is fully implemented.
  - (C) Use RevenueCat (`@capacitor/purchases`) which wraps both Google Play Billing
        and Apple StoreKit under one API.
- **Recommended path:** RevenueCat (handles both Android + iOS in one integration).
- **Estimated effort:** 8–16 hours.

---

### 🔴 ANDROID — GOOGLE PLAY CONSOLE (0 of 7 done — ALL require human action)

#### ❌ 7. Google Play Developer Account NOT Created
- **Cost:** $25 one-time registration fee.
- **URL:** https://play.google.com/console/signup
- **Note:** Requires a personal Google account and valid payment method.

#### ❌ 8. App Record NOT Created in Play Console
- Depends on item 7. Once developer account exists, create a new app record.
- App name: LynkApp
- Default language: English (United States)
- App or game: App
- Free or paid: Free (with IAPs)

#### ❌ 9. Store Listing NOT Completed
- No screenshots or store copy has been prepared.
- **Required assets:**
  - App title (max 50 chars): "LynkApp — Social & Dating"
  - Short description (max 80 chars)
  - Full description (max 4000 chars)
  - App icon: 512×512 PNG (no alpha)
  - Feature graphic: 1024×500 PNG
  - Phone screenshots: minimum 2, up to 8 (portrait preferred)
  - Tablet screenshots (optional but recommended)
- **Note:** Logo files exist at `../../Documents/lynkapp-logos.tsx` but have NOT been
  exported as properly sized PNG store assets.

#### ❌ 10. Content Rating Questionnaire NOT Completed
- LynkApp includes dating, user-generated content, location sharing, messaging, and
  potentially mature themes.
- **Likely rating:** Teen (13+) or Mature (17+) depending on dating feature answers.
- Must be completed in Play Console under "Content Rating" → IARC questionnaire.

#### ❌ 11. Data Safety Form NOT Completed
- LynkApp collects: location, messages/chat, photos/media, payment information,
  device identifiers, personal information (name, age, gender for dating).
- **ALL collected data categories must be declared** in the Data Safety form.
- This is required before any release to any track (even internal testing).

#### ❌ 12. App Pricing / IAP NOT Submitted to Play Console
- Pricing model (Free + IAP) must be set.
- All in-app products (coin packages) must be created in the Play Console
  **after** Google Play Billing is implemented in code.

---

### 🔴 ANDROID — TECHNICAL (3 of 4 remaining)

#### ❌ 13. Android Deep Links (App Links) NOT Configured
- **File:** `ConnectHub-SPA/android/app/src/main/AndroidManifest.xml`
- No `<intent-filter>` with `android:autoVerify="true"` for `lynkapp.com` was found.
- Deep links are required for: email verification callbacks, password reset links,
  social sharing, and referral links to open the app instead of the browser.
- **Required addition to AndroidManifest.xml:**
  ```xml
  <intent-filter android:autoVerify="true">
      <action android:name="android.intent.action.VIEW" />
      <category android:name="android.intent.category.DEFAULT" />
      <category android:name="android.intent.category.BROWSABLE" />
      <data android:scheme="https" android:host="lynkapp.com" />
  </intent-filter>
  ```
- Also requires `/.well-known/assetlinks.json` hosted on `https://lynkapp.com/`.

#### ⚠️ 14. Android Splash Screen — PARTIALLY DONE
- `core-splashscreen` dependency is in `build.gradle` ✅
- `SplashScreen.jsx` React component exists ✅
- Native Android splash drawable at `android/app/src/main/res/drawable/splash.png`
  was NOT verified as present. Needs confirmation.
- The native splash screen must be a proper Android drawable resource (XML or PNG).

#### ❌ 15. Push Notification Registration NOT in `main.jsx`
- **File:** `ConnectHub-SPA/src/main.jsx`
- Confirmed: `main.jsx` contains ONLY Sentry setup + ReactDOM.render. No Capacitor
  `PushNotifications.requestPermissions()` or `.register()` call exists here.
- The `mobile-platform-service.js` has some push-related code, but the standard
  Capacitor push registration lifecycle should be initialized at app startup.
- **Code to add to `main.jsx` (or `App.jsx` inside a `useEffect`):**
  ```javascript
  import { PushNotifications } from '@capacitor/push-notifications';
  import { Capacitor } from '@capacitor/core';

  if (Capacitor.isNativePlatform()) {
    PushNotifications.requestPermissions().then(result => {
      if (result.receive === 'granted') {
        PushNotifications.register();
      }
    });
    PushNotifications.addListener('registration', token => {
      console.log('[Push] Registration token:', token.value);
      // TODO: Save token to Firestore user document
    });
    PushNotifications.addListener('pushNotificationReceived', notification => {
      console.log('[Push] Received:', notification);
    });
    PushNotifications.addListener('pushNotificationActionPerformed', action => {
      console.log('[Push] Action performed:', action);
    });
  }
  ```

#### ❌ 16. Physical Android Device Testing — NOT DONE (manual step)
- Cannot be completed via code. Requires USB debugging on a real device.
- Test target: Physical Android phone running Android 8.0+ (API 26+).

---

### 🔴 APPLE APP STORE — ALL ITEMS REQUIRE A MAC (0 of 9 done)

#### ❌ 17. `npx cap add ios` — BIGGEST BLOCKER
- **Verified:** The `ios/` folder does NOT exist in `ConnectHub-SPA/`.
- This command creates the entire Xcode project. Nothing iOS can be built without it.
- **Requires a Mac** to run (or use Codemagic CI/CD — `codemagic.yaml` is already present).
- Command: Run inside `ConnectHub-SPA/` directory:
  ```
  npx cap add ios
  ```
- After running, open Xcode: `npx cap open ios`

#### ❌ 18. Apple Developer Program Enrollment — NOT DONE
- **Cost:** $99/year
- **URL:** https://developer.apple.com/programs/enroll/
- Required for: TestFlight distribution, App Store submission, Push Notifications, Sign In with Apple.
- Cannot be verified from code. Must be done by the account holder.

#### ❌ 19. Bundle ID `com.lynkapp.app` NOT Registered in Apple Developer Portal
- Even though the bundle ID is set in `capacitor.config.json`, it must be explicitly
  registered at https://developer.apple.com/account/resources/identifiers/list
- Requires Apple Developer Program enrollment first.

#### ❌ 20. `GoogleService-Info.plist` NOT Downloaded / NOT Present
- No `GoogleService-Info.plist` found anywhere in the repo.
- **Steps to get it:**
  1. Go to Firebase Console → Project Settings → Your Apps.
  2. Add an iOS app with Bundle ID `com.lynkapp.app`.
  3. Download `GoogleService-Info.plist`.
  4. After `npx cap add ios`, place in `ios/App/App/GoogleService-Info.plist`.

#### ❌ 21. Firebase iOS App NOT Registered
- The Firebase Console has an Android app registered (google-services.json exists).
- An iOS app with Bundle ID `com.lynkapp.app` has NOT been registered.
- Must be done at: Firebase Console → Project Settings → Add App → iOS.

#### ❌ 22. `Info.plist` Permission Descriptions NOT Configured
- The iOS project doesn't exist yet — this is done in Xcode after `cap add ios`.
- **Required permission strings (all must be added):**
  - `NSCameraUsageDescription` — "LynkApp needs camera access to take profile photos and send images in chat."
  - `NSPhotoLibraryUsageDescription` — "LynkApp needs photo library access to upload profile pictures and share media."
  - `NSMicrophoneUsageDescription` — "LynkApp needs microphone access for live streaming and voice messages."
  - `NSLocationWhenInUseUsageDescription` — "LynkApp uses your location to show nearby users and local events."
  - `NSUserNotificationsUsageDescription` — "LynkApp sends notifications for matches, messages, and live stream alerts."
  - `NSFaceIDUsageDescription` — "LynkApp uses Face ID for quick and secure login."
- Missing these causes **App Store rejection**.

#### ❌ 23. Push Notifications Capability NOT Added in Xcode
- iOS project doesn't exist yet.
- After `cap add ios`: Xcode → Project Target → Signing & Capabilities → + Capability → Push Notifications.
- Also enable: Background Modes → Remote notifications.

#### ❌ 24. `PrivacyInfo.xcprivacy` Manifest NOT Added
- **Apple REQUIRES this for all apps since iOS 17 / Spring 2024.**
- Any app submitted without it is automatically rejected.
- This file declares which privacy APIs your app uses and why.
- Must be created and added to the Xcode project after `cap add ios`.
- Template content:
  ```xml
  <?xml version="1.0" encoding="UTF-8"?>
  <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "...">
  <plist version="1.0">
  <dict>
    <key>NSPrivacyAccessedAPITypes</key>
    <array>
      <!-- Add entries for each privacy API used -->
    </array>
  </dict>
  </plist>
  ```

#### ❌ 25. `@capacitor-community/apple-sign-in` Plugin NOT Installed
- **File checked:** `ConnectHub-SPA/package.json` — plugin is **NOT listed** in dependencies.
- **UI component exists:** `ConnectHub-SPA/src/components/auth/AppleSignInButton.jsx`
- **Apple's rule:** If any third-party or social sign-in (Google) is offered, Sign In with Apple
  **MUST** also be offered. Failure = App Store rejection.
- **Fix:**
  ```
  npm install @capacitor-community/apple-sign-in
  npx cap sync ios
  ```
  Then wire the native plugin call in `AppleSignInButton.jsx`.

---

### 🔴 APPLE — APP ICONS & LAUNCH SCREEN (0 of 2 done)

#### ❌ 26. Full iOS App Icon Set NOT Created
- The iOS Xcode Asset Catalog (`Assets.xcassets/AppIcon.appiconset`) doesn't exist yet
  because the iOS project itself doesn't exist.
- PWA icons exist (`public/manifest.json` references `icon-192.png`, `icon-512.png`)
  but these are NOT the correct format for the App Store.
- **Required:** 1024×1024 PNG master icon (no alpha channel, no rounded corners —
  Apple applies the mask automatically).
- Logo source exists at `../../Documents/lynkapp-logos.tsx` but needs to be exported
  as a proper PNG and sized to all required dimensions.

#### ❌ 27. iOS Launch Screen / Splash Screen NOT Configured
- iOS project doesn't exist yet.
- After `cap add ios`, configure `@capacitor/splash-screen` in `capacitor.config.json`
  and add the launch storyboard or image to the Xcode project.

---

### 🔴 APPLE — APP STORE CONNECT (0 of 6 done — all require human + Mac)

#### ❌ 28. App Record NOT Created in App Store Connect
- URL: https://appstoreconnect.apple.com/
- Requires Apple Developer Program enrollment first.
- Select: New App → iOS → Bundle ID `com.lynkapp.app` → SKU: `lynkapp-001`

#### ❌ 29. App Information NOT Completed
- Name: LynkApp (max 30 chars in App Store Connect)
- Subtitle: "Social, Dating & Creator Hub" (max 30 chars)
- Category: Social Networking (primary), Lifestyle (secondary)
- Age Rating: likely 17+ due to dating features

#### ❌ 30. App Privacy (Privacy Nutrition Label) NOT Completed
- LynkApp collects: name, email, location, photos, videos, user content,
  messages, payment info, identifiers, usage data.
- This takes significant time to fill out accurately at App Store Connect.

#### ❌ 31. App Store Screenshots NOT Prepared
- **Required sizes:**
  - 6.7" iPhone (1290×2796 or 1320×2868) — minimum 2 screenshots
  - 6.5" iPhone (1242×2688 or 1284×2778) — for older phones
  - 12.9" iPad Pro (2048×2732) — optional but recommended
- No screenshots prepared yet.

#### ❌ 32. App Description, Keywords, Support URL NOT Written
- No marketing/store copy has been drafted.
- Support URL must be a live URL (the Contact/Help page on lynkapp.com).

#### ❌ 33. Build Archive NOT Submitted via Xcode / Codemagic
- iOS project doesn't exist yet, so no archive can be built.
- Path after iOS project is created: Xcode → Product → Archive → Distribute App
  → App Store Connect → Upload.
- Or: Codemagic CI/CD (codemagic.yaml is already configured).

---

### 🔴 APPLE — IN-APP PURCHASE (POLICY REQUIREMENT)

#### ❌ 34. StoreKit / RevenueCat NOT Implemented for iOS Coin Purchases
- **File:** `ConnectHub-SPA/src/pages/wallet/BuyCoinsPage.jsx`
- **Current:** Uses Stripe for coin purchases.
- **Apple's rule:** ALL digital in-app purchases (virtual currency, coins, premium
  subscriptions, boosts) **MUST** use Apple's In-App Purchase (StoreKit) system.
  Stripe CANNOT be used for digital goods on iOS. Physical marketplace goods are exempt.
- **Will cause App Store rejection.**
- **Options:**
  - (A) Install `@capacitor/purchases` (RevenueCat) — wraps StoreKit + Google Play Billing
  - (B) Platform-detect and hide coin purchases on iOS until StoreKit is implemented
  - (C) Build a conditional payment flow: Stripe for web/physical goods, StoreKit for iOS
- **Estimated effort:** 8–16 hours per platform.

---

---

## SUMMARY: WHAT IS DONE vs. WHAT REMAINS

### ✅ COMPLETED (8% — 3 of 36 checklist items)

| # | Item | Evidence |
|---|---|---|
| 1 | `google-services.json` in android/app/ | File confirmed present and wired in build.gradle |
| 2 | `minSdkVersion = 23` in variables.gradle | Confirmed: line 7 of variables.gradle |
| 3 | Android project structure (Capacitor 6) | Full android/ folder with correct Gradle setup |

**Bonus items confirmed in code (not on original 36-item list but important):**
- ✅ Bundle ID `com.lynkapp.app` set in build.gradle + capacitor.config.json
- ✅ `codemagic.yaml` CI/CD pipeline exists (path to Mac-free iOS builds)
- ✅ Legal pages exist as React components (Terms, Privacy, Cookie, Contact, About)
- ✅ `AppleSignInButton.jsx` UI component exists (plugin still needs to be installed)
- ✅ `@capacitor/push-notifications` in package.json (registration code still needed)
- ✅ `targetSdkVersion = 35` (Android 15) — fully current

---

### ❌ NOT DONE (92% — 33 of 36 checklist items)

**Code changes required (can be done now):**

| Priority | Item | File(s) to Change |
|---|---|---|
| 🔴 HIGH | Add `signingConfigs.release` to build.gradle | `android/app/build.gradle` |
| 🔴 HIGH | Enable `minifyEnabled true` in build.gradle | `android/app/build.gradle` |
| 🔴 HIGH | Install `@capacitor-community/apple-sign-in` + wire plugin | `package.json`, `AppleSignInButton.jsx` |
| 🔴 HIGH | Install RevenueCat/Google Play Billing for coins | `package.json`, `BuyCoinsPage.jsx` |
| 🟠 MEDIUM | Add Push Notification registration lifecycle to `main.jsx` or `App.jsx` | `src/main.jsx` |
| 🟠 MEDIUM | Add Android Deep Link intent-filter to AndroidManifest.xml | `android/app/src/main/AndroidManifest.xml` |
| 🟡 LOW | Verify native Android splash drawable exists at `drawable/splash.png` | `android/app/src/main/res/drawable/` |

**Human actions required (cannot be done by code):**

| Priority | Item | Where |
|---|---|---|
| 🔴 HIGH | Generate Android release keystore (`keytool`) | Local terminal |
| 🔴 HIGH | Run `npx cap add ios` on a Mac | Mac terminal inside ConnectHub-SPA/ |
| 🔴 HIGH | Enroll in Apple Developer Program ($99/year) | developer.apple.com |
| 🔴 HIGH | Register Firebase iOS app + download GoogleService-Info.plist | Firebase Console |
| 🟠 MEDIUM | Create Google Play Developer Account ($25) | play.google.com/console |
| 🟠 MEDIUM | Register Bundle ID in Apple Developer Portal | developer.apple.com |
| 🟠 MEDIUM | Create App Store Connect record | appstoreconnect.apple.com |
| 🟠 MEDIUM | Create Play Console record | play.google.com/console |
| 🟠 MEDIUM | Configure Info.plist permission strings in Xcode | After npx cap add ios |
| 🟠 MEDIUM | Add Push Notifications capability in Xcode | After npx cap add ios |
| 🟠 MEDIUM | Add PrivacyInfo.xcprivacy manifest to Xcode project | After npx cap add ios |
| 🟡 LOW | Complete Content Rating (IARC) questionnaire | Play Console |
| 🟡 LOW | Complete Data Safety form (Google) | Play Console |
| 🟡 LOW | Complete App Privacy nutrition label (Apple) | App Store Connect |
| 🟡 LOW | Write store listing copy (title, desc, keywords) | Both stores |
| 🟡 LOW | Create screenshots (Android + iOS) | Design tool / device |
| 🟡 LOW | Export 512px Android + 1024px iOS app icons from logo files | Design tool |
| 🟡 LOW | Test on physical Android device | USB-connected device |
| 🟡 LOW | Test on physical iOS device | Mac + Apple Developer account |
| 🟡 LOW | Build signed AAB in Android Studio | Android Studio |
| 🟡 LOW | Archive and submit iOS build via Xcode / Codemagic | Mac / Codemagic |

---

---

## NEXT STEPS: PRIORITIZED ACTION LIST

### 🔴 DO THESE FIRST (Blockers — App Store submission is impossible without these)

**WEEK 1 — Code changes (can be done on Windows now):**

1. **Generate keystore** (terminal):
   ```
   keytool -genkey -v -keystore lynkapp-release.keystore -alias lynkapp -keyalg RSA -keysize 2048 -validity 10000
   ```
   Store password in 1Password/Bitwarden. Add `lynkapp-release.keystore` to `.gitignore`.

2. **Update `android/app/build.gradle`** — Add `signingConfigs.release` block and enable ProGuard.

3. **Add Push Notification registration** to `App.jsx` (inside `useEffect`, platform-gated with `Capacitor.isNativePlatform()`).

4. **Add Android Deep Links** to `AndroidManifest.xml`.

5. **Install Apple Sign In plugin:**
   ```
   npm install @capacitor-community/apple-sign-in
   ```
   Wire the native call in `AppleSignInButton.jsx`.

6. **Implement Google Play Billing / RevenueCat** OR disable coin purchases on Android — pick one approach and execute it before Play Store submission.

**WEEK 2 — Account setup (requires human action):**

7. Create Google Play Developer Account ($25 at play.google.com/console).
8. Enroll in Apple Developer Program ($99 at developer.apple.com).
9. Register Firebase iOS app and download `GoogleService-Info.plist`.
10. Register Bundle ID `com.lynkapp.app` in Apple Developer Portal.

**WEEK 2–3 — iOS Xcode project (requires Mac or Codemagic):**

11. Run `npx cap add ios` inside `ConnectHub-SPA/` on a Mac.
12. Open Xcode: `npx cap open ios`.
13. Add capabilities: Push Notifications, Sign In with Apple, Associated Domains.
14. Configure `Info.plist` permission usage descriptions.
15. Add `PrivacyInfo.xcprivacy` manifest file.
16. Add `GoogleService-Info.plist` to Xcode project.
17. Implement StoreKit / RevenueCat for iOS coin purchases.
18. Create launch screen / splash screen.

---

### 🟠 DO THESE SECOND (Store Listings)

19. Create app records in Google Play Console and App Store Connect.
20. Write store listing copy (title, description, keywords).
21. Export LynkApp logo to 512×512 PNG (Android) and 1024×1024 PNG (iOS).
22. Create Feature Graphic 1024×500 PNG for Play Store.
23. Produce at least 2 Android phone screenshots and 2 iPhone screenshots.
24. Complete Content Rating (IARC) questionnaire in Play Console.
25. Complete Data Safety form (Google Play) and App Privacy label (Apple).

---

### 🟡 DO THESE THIRD (Testing & Polish)

26. Enable ProGuard/R8 (`minifyEnabled true`) in `android/app/build.gradle`.
27. Test on physical Android device (USB).
28. Test on physical iOS device (requires Mac + Apple Developer enrollment).
29. Run `npm run build && npx cap sync android` immediately before each store build.
30. Build signed AAB in Android Studio and upload to internal testing track in Play Console.
31. Archive iOS build in Xcode and upload to TestFlight.
32. Deploy to TestFlight for internal testing before submitting to App Store review.

---

---

## ESTIMATED TIME TO COMPLETE SECTION 2

| Area | Estimated Time | Dependency |
|---|---|---|
| Android keystore + signing config (code) | 1–2 hours | None |
| Push notification registration (code) | 1–2 hours | None |
| Android Deep Links (code) | 1–2 hours | None |
| Apple Sign In plugin install + wire (code) | 2–4 hours | None |
| Google Play Billing / RevenueCat for coins | 8–16 hours | None |
| Account enrollments (Google + Apple) | 2–4 hours | Payment methods |
| `npx cap add ios` + Xcode config | 4–8 hours | Mac required |
| StoreKit / RevenueCat for iOS | 8–16 hours | iOS project must exist |
| Store listings, screenshots, descriptions | 4–8 hours | Accounts must exist |
| Google Play Console + App Store Connect setup | 2–4 hours | Accounts must exist |
| Physical device testing (Android + iOS) | 4–8 hours | Signing + device required |
| **TOTAL ESTIMATE** | **37–74 hours** | |

---

---

## TRANSITION TO SECTION 3

Section 2 (App Store Requirements) is approximately **8% complete** at the time of this audit.

**Before moving to Section 3 of the PRE-APP-STORE-MASTER-CHECKLIST.md:**
- Minimum viable completion of Section 2 requires:
  - ✅ Android keystore generated and signing config added to build.gradle
  - ✅ Google Play Developer Account created
  - ✅ Play Store app record created
  - ✅ Apple Developer Program enrolled
  - ✅ `npx cap add ios` run on a Mac
  - ✅ Apple Sign In plugin installed and wired
  - ✅ Google Play Billing / StoreKit implemented for coins (or feature gated)
- The remaining Section 2 items (store listings, screenshots, privacy forms, physical testing)
  can overlap with Section 3 work.

**Section 3** (which covers app features, UX polish, and production readiness) has
substantially more progress — the SPA/React codebase is well-developed with 30+ feature
sections complete. The bottleneck is exclusively Section 2 (store requirements).

---

*Report generated by Cline AI — September 1, 2026*
*Saved to: SECTION2-APP-STORE-REQUIREMENTS-AUDIT-SEP2026.md*
*Committed to: https://github.com/Watchdog088/Test-apps.git*
