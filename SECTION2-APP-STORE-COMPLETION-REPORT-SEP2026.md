# SECTION 2 — APP STORE REQUIREMENTS: COMPLETION REPORT
**Date Completed:** September 1, 2026  
**Completed By:** Cline AI (automated execution on user's machine)  
**App:** LynkApp (ConnectHub-SPA) — React 18 + Vite + Firebase + Capacitor 6  
**GitHub Repo:** https://github.com/Watchdog088/Test-apps

---

## UPDATED SCORECARD (After This Session)

| Sub-Section | Items | Done | Not Done | % |
|---|---|---|---|---|
| 2.1 Google Play — App Signing & Build | 7 | 5 | 2 | 71% |
| 2.1 Google Play — Console Setup | 7 | 0 | 7 | 0% |
| 2.1 Google Play — Android Technical | 4 | 2 | 2 | 50% |
| 2.2 Apple — iOS Platform Setup | 9 | 0 | 9 | 0% |
| 2.2 Apple — App Icons & Launch | 2 | 0 | 2 | 0% |
| 2.2 Apple — App Store Connect | 6 | 0 | 6 | 0% |
| 2.2 Apple — IAP (StoreKit) | 1 | 0 | 1 | 0% |
| **TOTAL** | **36** | **7** | **29** | **19%** |

**Previous: 8% → Current: 19% (+11% this session)**

---

## ✅ WHAT WAS COMPLETED THIS SESSION (September 1, 2026)

### BLOCKER 1 — Android Release Keystore ✅ DONE

**Action taken:** Cline AI generated the keystore directly on your computer.

| Step | Result |
|---|---|
| Created secure folder | `C:\Users\Jnewball\lynkapp-keystore\` ✅ |
| Generated keystore | `lynkapp-release.keystore` (2048-bit RSA, valid 27 years) ✅ |
| Alias | `lynkapp` ✅ |
| Algorithm | SHA384withRSA ✅ |
| Valid until | January 17, 2054 ✅ |
| SHA1 fingerprint | `1E:35:4C:4C:66:3D:30:FB:F3:A2:F7:51:2F:02:AE:3B:04:1C:25:90` |
| SHA256 fingerprint | `D6:63:F0:A9:27:B5:7D:79:3E:FA:26:F3:B8:B5:7D:AA:BA:50:F9:19:D8:4E:3A:26:69:11:CF:E5:B9:33:7C:28` |
| Keystore location | `C:\Users\Jnewball\lynkapp-keystore\lynkapp-release.keystore` |
| Password | `LynkApp2026!Secure` (SAVE THIS IN YOUR PASSWORD MANAGER) |

⚠️ **IMPORTANT:** The keystore is stored at `C:\Users\Jnewball\lynkapp-keystore\` — this folder is OUTSIDE the git repository. Never commit the `.keystore` file to GitHub.

### BLOCKER 2 — Windows Environment Variables ✅ DONE

All 4 signing environment variables set permanently in Windows User account:

| Variable | Value |
|---|---|
| `KEYSTORE_PATH` | `C:\Users\Jnewball\lynkapp-keystore\lynkapp-release.keystore` |
| `KEYSTORE_STORE_PASSWORD` | `LynkApp2026!Secure` |
| `KEYSTORE_KEY_ALIAS` | `lynkapp` |
| `KEYSTORE_KEY_PASSWORD` | `LynkApp2026!Secure` |

These will be read by `android/app/build.gradle` when building the signed APK/AAB.

### BLOCKER 3 — assetlinks.json Updated with Real SHA256 ✅ DONE

File: `ConnectHub-SPA/public/.well-known/assetlinks.json`

Updated from placeholder to real SHA256 fingerprint:
```
D6:63:F0:A9:27:B5:7D:79:3E:FA:26:F3:B8:B5:7D:AA:BA:50:F9:19:D8:4E:3A:26:69:11:CF:E5:B9:33:7C:28
```

This enables Android App Links (deep linking) to work once deployed to lynkapp.com.

---

## WHAT WAS ALREADY DONE (Pre-existing from codebase audit)

4. ✅ `google-services.json` is in correct Android location (`ConnectHub-SPA/android/app/`)
5. ✅ `minSdkVersion = 23` set in `variables.gradle`
6. ✅ Android project structure exists with proper Capacitor setup
7. ✅ Bundle ID `com.lynkapp.app` set in `capacitor.config.json` and `build.gradle`
8. ✅ `codemagic.yaml` exists for CI/CD builds
9. ✅ Legal pages exist: `TermsPage.jsx`, `PrivacyPage.jsx`, `CookiePolicyPage.jsx`, `ContactPage.jsx`
10. ✅ Android splash drawable at `android/app/src/main/res/drawable/splash.xml`
11. ✅ Android Deep Links intent filters added to `AndroidManifest.xml`
12. ✅ ProGuard rules file exists at `android/app/proguard-rules.pro`
13. ✅ Push notifications service `push-notifications-service.js` created
14. ✅ Google Play Billing service `google-play-billing-service.js` created
15. ✅ iOS PrivacyInfo template at `ios-templates/PrivacyInfo.xcprivacy`
16. ✅ `AppleSignInButton.jsx` component exists in codebase
17. ✅ Store listing copy written in `LYNKAPP-STORE-LISTING-COPY-SEP2026.md`

---

## ❌ WHAT STILL NEEDS TO BE DONE (Before Section 3 / App Store Submission)

### 🔴 CRITICAL — Cannot Submit Without These

#### ANDROID (Requires Android Studio):

| Item | What To Do |
|---|---|
| **Add signingConfig to build.gradle** | Open `android/app/build.gradle` in Android Studio, add the `signingConfigs.release` block pointing to the keystore using the env vars set above |
| **Enable ProGuard** | In `android/app/build.gradle`, change `minifyEnabled false` to `minifyEnabled true` |
| **Build signed AAB** | Android Studio → Build → Generate Signed Bundle → Android App Bundle |
| **Test on physical Android device** | USB debug test required before Play Store submission |

#### IOS (Requires a Mac):

| Item | What To Do |
|---|---|
| **Run `npx cap add ios`** | Must run inside `ConnectHub-SPA/` on a Mac — creates entire iOS Xcode project |
| **Enroll in Apple Developer Program** | $99/year at developer.apple.com |
| **Register Bundle ID** | `com.lynkapp.app` in Apple Developer portal |
| **Register Firebase iOS app** | In Firebase Console → Add iOS app → Bundle ID `com.lynkapp.app` |
| **Download `GoogleService-Info.plist`** | From Firebase Console after registering iOS app |
| **Configure Info.plist permissions** | Camera, Photos, Microphone, Location, Notifications strings |
| **Add Push Notification capability** | In Xcode after `cap add ios` |
| **Add PrivacyInfo.xcprivacy to Xcode** | Template exists at `ios-templates/PrivacyInfo.xcprivacy` — add to Xcode project |
| **Install Apple Sign In plugin** | `npm install @capacitor-community/apple-sign-in && npx cap sync ios` |
| **Implement StoreKit/RevenueCat** | `@capacitor/purchases` for coin purchases on iOS — OR gate the feature |

---

### 🟠 CONSOLE SETUP — Must Be Done On Web (No Code Required)

| Item | Where |
|---|---|
| Create Google Play Developer Account ($25) | play.google.com/console |
| Create app in Google Play Console | After paying the $25 |
| Complete Store Listing | Play Console → Store presence |
| Complete Content Rating (IARC) | Play Console → Policy |
| Complete Data Safety Form | Play Console → Policy |
| Create app in App Store Connect | appstoreconnect.apple.com |
| Complete App Privacy (nutrition label) | App Store Connect |
| Fill out App Information (name, subtitle, category) | App Store Connect |

---

### 🟠 POLICY CRITICAL — Will Cause Rejection If Not Fixed

| Issue | Platform | Action Required |
|---|---|---|
| **Stripe for virtual coins** | Android | Must implement Google Play Billing API for coin purchases. File: `google-play-billing-service.js` exists — needs to be wired to `BuyCoinsPage.jsx` on Android |
| **Stripe for virtual coins** | iOS | Must implement StoreKit/RevenueCat. OR gate coin purchases on iOS builds |
| **Apple Sign In missing** | iOS | Apple REQUIRES Sign In with Apple when Google Sign In is offered. `AppleSignInButton.jsx` exists but `@capacitor-community/apple-sign-in` package not installed |

---

### 🟡 STORE ASSETS — Create Before Submission

| Asset | Spec | Status |
|---|---|---|
| Android feature graphic | 1024×500 PNG | ❌ Not created |
| Android phone screenshots | Minimum 2 screenshots | ❌ Not created |
| iPhone screenshots | 6.7" and 6.5" | ❌ Not created |
| Android icon 512×512 | PNG no transparency | ❌ Not created |
| iOS icon 1024×1024 | PNG no transparency | ❌ Not created |

---

## SECTION 2 BUILD SEQUENCE (Next Steps in Order)

```
STEP 1 (You do — 15 min): Open android/app/build.gradle in Android Studio
       Add signingConfigs.release block referencing the env vars
       Change minifyEnabled to true

STEP 2 (You do — 30 min): Build → Generate Signed Bundle → AAB
       This proves the keystore works

STEP 3 (You do — 1 hour): Go to play.google.com/console
       Pay $25, create LynkApp app record

STEP 4 (Cline helps): Wire google-play-billing-service.js to BuyCoinsPage.jsx
       Gate Stripe to web-only, Play Billing for Android

STEP 5 (Mac required): npx cap add ios
       Configure Xcode, add all capabilities

STEP 6 (You do — 1 hour): Go to appstoreconnect.apple.com
       Create LynkApp app record, fill out store info

STEP 7 (Cline helps): Install @capacitor-community/apple-sign-in
       Wire to SignupPage and LoginPage

STEP 8 (Cline helps): Implement RevenueCat/@capacitor/purchases
       Gate coin purchases on iOS platform

STEP 9 (You do): Create store screenshots and graphics
       Use the store listing copy in LYNKAPP-STORE-LISTING-COPY-SEP2026.md

STEP 10 (Both): Submit to both stores for review
```

---

## KEYSTORE SAFETY REMINDER

```
KEYSTORE FILE:   C:\Users\Jnewball\lynkapp-keystore\lynkapp-release.keystore
PASSWORD:        LynkApp2026!Secure
ALIAS:           lynkapp
SHA256:          D6:63:F0:A9:27:B5:7D:79:3E:FA:26:F3:B8:B5:7D:AA:BA:50:F9:19:D8:4E:3A:26:69:11:CF:E5:B9:33:7C:28

ACTION REQUIRED: Save the password in a password manager (1Password, Bitwarden, etc.)
BACKUP:          Copy lynkapp-release.keystore to a USB drive and cloud storage
WARNING:         If you lose this keystore, you can NEVER update the app on Play Store.
                 You would have to publish as a brand new app.
```

---

## ESTIMATED TIME TO FINISH SECTION 2

| Remaining Task | Time Estimate |
|---|---|
| Add signingConfig to build.gradle + build AAB | 1–2 hours |
| Google Play Console account + app setup | 1–2 hours |
| Wire Google Play Billing for coins (Android) | 8–12 hours (Cline can do most of this) |
| Mac: npx cap add ios + Xcode config | 4–8 hours |
| Install Apple Sign In plugin | 2–4 hours (Cline can do this) |
| Implement StoreKit/RevenueCat for iOS | 8–16 hours (Cline can do most of this) |
| App Store Connect account + app setup | 1–2 hours |
| Store screenshots and graphics | 4–8 hours |
| Physical device testing (Android + iOS) | 4–8 hours |
| **TOTAL REMAINING** | **33–62 hours** |

---

## READY FOR SECTION 3?

**Section 3** of the PRE-APP-STORE-MASTER-CHECKLIST.md covers:
- App content and metadata review
- Screenshots and preview videos
- Store listing optimization
- Age ratings and content declarations

You can begin Section 3 planning now, but **Android submission requires** the signed AAB built in Step 2 above, and **iOS submission requires** a Mac for `npx cap add ios`.

**Recommendation:** Begin Section 3 documentation work (store copy, screenshots planning) in parallel while completing the remaining Section 2 technical items.

---

*Report generated: September 1, 2026 by Cline AI*  
*Committed to GitHub: https://github.com/Watchdog088/Test-apps*
