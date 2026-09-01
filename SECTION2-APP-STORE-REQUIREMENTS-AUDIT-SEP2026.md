# SECTION 2 — APP STORE REQUIREMENTS AUDIT (UPDATED)
**Date Audited:** September 1, 2026  
**Last Updated:** September 1, 2026 — Sprint 2 Code Complete  
**Auditor:** Cline AI (full codebase inspection)  
**App:** LynkApp (ConnectHub-SPA) — React 18 + Vite + Firebase + Capacitor 6

---

## UPDATED SCORECARD

| Sub-Section | Items | Done | Pending/User | % |
|---|---|---|---|---|
| 2.1 Google Play — App Signing & Build | 7 | 5 | 2 | 71% |
| 2.1 Google Play — Console Setup | 7 | 1 | 6 | 14% |
| 2.1 Google Play — Android Technical | 4 | 3 | 1 | 75% |
| 2.2 Apple — iOS Platform Setup | 9 | 1 | 8 | 11% |
| 2.2 Apple — App Icons & Launch | 2 | 0 | 2 | 0% |
| 2.2 Apple — App Store Connect | 6 | 0 | 6 | 0% |
| 2.2 Apple — IAP (StoreKit) | 1 | 1 | 0 | 100% |
| **TOTAL** | **36** | **11** | **25** | **31%** |

**Overall Section 2 Status: 31% complete (up from 8% at start of sprint)**

---

## 2.1 GOOGLE PLAY STORE REQUIREMENTS

### App Signing & Build

| Item | Status | Evidence |
|---|---|---|
| Generate Android Release Keystore | ❌ **YOU MUST DO** | Run the keytool command below — 15 min |
| Configure `signingConfigs.release` in build.gradle | ✅ DONE | `signingConfigs.release` block present, reads from env vars |
| Place `google-services.json` in `android/app/` | ✅ DONE | Confirmed present |
| Run `npm run build && npx cap sync android` | ⚠️ PENDING | Must run manually before every Play Store build |
| Build signed Android App Bundle (AAB) | ❌ **YOU MUST DO** | Depends on keystore (step above) |
| Set `minSdkVersion` to at least 23 | ✅ DONE | `variables.gradle` confirms `minSdkVersion = 23` |
| Configure ProGuard/R8 rules | ✅ DONE | `proguard-rules.pro` written, `minifyEnabled true` in release block |

### 🔴 BLOCKER 1 — Generate Keystore (YOU DO THIS — 15 min)

**Open a terminal (Command Prompt or PowerShell) and run these exact commands:**

```
# Step 1 — Create a secure folder for your keystore (NEVER inside the project/git)
mkdir C:\Users\Jnewball\lynkapp-keystore

# Step 2 — Change to that folder
cd C:\Users\Jnewball\lynkapp-keystore

# Step 3 — Generate the keystore (you'll be prompted for passwords and info)
keytool -genkey -v -keystore lynkapp-release.keystore -alias lynkapp -keyalg RSA -keysize 2048 -validity 10000
```

**When prompted:**
- Enter keystore password: (create a strong password — save it in your password manager!)
- Re-enter password: (same)
- First and last name: LynkApp  
- Organizational unit: Engineering
- Organization: LynkApp Inc
- City: Washington DC
- State: DC
- Country code: US
- Is this correct? y

```
# Step 4 — After keystore is created, get the SHA256 fingerprint (for assetlinks.json)
keytool -list -v -keystore C:\Users\Jnewball\lynkapp-keystore\lynkapp-release.keystore -alias lynkapp
```

**Copy the SHA256 fingerprint** — you'll need it for Step 2 below.

```
# Step 5 — Set environment variables (so build.gradle can find the keystore)
# Add these to your Windows System Environment Variables permanently:
KEYSTORE_PATH=C:\Users\Jnewball\lynkapp-keystore\lynkapp-release.keystore
KEYSTORE_STORE_PASSWORD=<your-password>
KEYSTORE_KEY_ALIAS=lynkapp
KEYSTORE_KEY_PASSWORD=<your-password>
```

---

### 🔴 BLOCKER 2 — Update assetlinks.json with real SHA256 (YOU DO THIS — 10 min)

After running keytool above, open this file and replace the placeholder fingerprint:

**File:** `ConnectHub-SPA/public/.well-known/assetlinks.json`

Replace `YOUR_SHA256_FINGERPRINT_HERE` with the actual SHA256 from the keytool output.
Format: `AB:CD:EF:12:34:...` (32 pairs of hex separated by colons)

---

### 🔴 BLOCKER 3 — Install IAP Plugin (YOU DO THIS — 20 min)

```
# Run these commands in the ConnectHub-SPA folder:
cd C:\Users\Jnewball\Test-apps\Test-apps\ConnectHub-SPA

npm install @capacitor-community/in-app-purchases
npx cap sync android
```

Then in Google Play Console → Your App → Monetize → In-app products, create these 4 products:
- Product ID: `lynkapp_coins_100` — Price: $0.99 — Name: 100 LynkCoins
- Product ID: `lynkapp_coins_500` — Price: $4.99 — Name: 500 + 50 Bonus LynkCoins  
- Product ID: `lynkapp_coins_1000` — Price: $9.99 — Name: 1,000 + 150 Bonus LynkCoins
- Product ID: `lynkapp_coins_5000` — Price: $44.99 — Name: 5,000 + 1,000 Bonus LynkCoins

---

### Google Play Console Setup

| Item | Status | Notes |
|---|---|---|
| Create Google Play Developer Account ($25) | ❌ **YOU MUST DO** | Go to play.google.com/console → Create account |
| Create new app in Play Console | ❌ **YOU MUST DO** | Depends on developer account |
| Complete Store Listing | ⚠️ DRAFT READY | `LYNKAPP-STORE-LISTING-COPY-SEP2026.md` has all draft copy — needs screenshots |
| Complete Content Rating questionnaire | ❌ **YOU MUST DO** | Select Teen (13+) — LynkApp has dating + UGC |
| Complete Data Safety Form | ❌ **YOU MUST DO** | Declare: location, messages, photos, payment info |
| Set up App Pricing (Free + IAP) | ❌ **YOU MUST DO** | App is free; IAP products listed above |
| In-app products / Google Play Billing | ✅ CODE DONE | `google-play-billing-service.js` + `BuyCoinsPage.jsx` platform-gated |

### Google Play Console Step-by-Step (YOU DO THIS):

**Step 1:** Go to https://play.google.com/console → Sign in with Google → Pay $25 one-time developer fee

**Step 2:** Click "Create app" → App name: **LynkApp** → Default language: English → App or Game: App → Free or Paid: Free → Accept policies → Create

**Step 3:** Complete all Dashboard items (the console shows a checklist — complete each one):
- App access → All functionality is accessible (no login required for review)
- Ads → Does contain ads: No (unless you implement AdMob)
- Content rating → Start questionnaire → Social Networking → Answer all questions → Teen likely
- Target audience → Ages 13-17 and above → Confirm appeals to children: No
- Data safety → Fill in all data types collected (see list below)
- Store listing → Copy from `LYNKAPP-STORE-LISTING-COPY-SEP2026.md`

**Data Safety form — check these boxes:**
- Location: Precise location (used for nearby users/events)
- Personal info: Name, Email, Profile photo
- Messages: Emails or text messages (in-app messages)
- Photos and videos: Photos (user uploads)
- Financial info: Purchase history (coins purchases)
- Device or other IDs: Device IDs (for push notifications)

---

### Android Technical Requirements

| Item | Status | Evidence |
|---|---|---|
| Android Deep Links (App Links) | ✅ DONE | `AndroidManifest.xml` has `autoVerify=true` for lynkapp.com. Update assetlinks.json with real SHA256 (BLOCKER 2) |
| Android Splash Screen drawable | ✅ DONE | `res/drawable/splash.xml` created (purple circle placeholder). **Replace with real logo PNG** |
| Test on physical Android device | ❌ **YOU MUST DO** | Connect device via USB → Enable USB Debugging → Run `adb install` or Android Studio |
| Push Notification registration | ✅ DONE | Full Capacitor `PushNotifications.requestPermissions()` lifecycle in `main.jsx`. Token saved to Firestore. |

---

## 2.2 APPLE APP STORE REQUIREMENTS

### iOS Platform Setup (REQUIRES MAC OR CODEMAGIC)

| Item | Status | Evidence |
|---|---|---|
| Run `npx cap add ios` | ❌ **BIGGEST BLOCKER** | iOS folder does NOT exist — Mac or Codemagic required |
| Enroll in Apple Developer Program ($99/year) | ❌ **YOU MUST DO** | developer.apple.com/programs/enroll |
| Register Bundle ID `com.lynkapp.app` | ❌ **YOU MUST DO** | Apple Developer portal → Identifiers → + |
| Download `GoogleService-Info.plist` | ❌ **YOU MUST DO** | Firebase Console → Project Settings → iOS → Add app |
| Register Firebase iOS app | ❌ **YOU MUST DO** | Firebase Console → Add app → iOS → Bundle ID: com.lynkapp.app |
| Configure `Info.plist` permission descriptions | ❌ NOT DONE | Requires iOS project (Mac/Codemagic) |
| Add Push Notifications capability in Xcode | ❌ NOT DONE | Requires iOS project |
| Add `PrivacyInfo.xcprivacy` manifest | ✅ TEMPLATE READY | `ConnectHub-SPA/ios-templates/PrivacyInfo.xcprivacy` — drag into Xcode after `cap add ios` |
| Install `@capacitor-community/apple-sign-in` plugin | ❌ **YOU MUST DO** | Run: `npm install @capacitor-community/apple-sign-in` |

### 🔴 BLOCKER 4 — Install Apple Sign In Plugin (YOU DO THIS — 5 min)

```
cd C:\Users\Jnewball\Test-apps\Test-apps\ConnectHub-SPA
npm install @capacitor-community/apple-sign-in
```
(The iOS sync `npx cap sync ios` runs after you have a Mac to create the iOS project)

### 🔴 BLOCKER 5 — iOS Setup on Mac or Codemagic (YOU DO THIS — 4-8 hours)

**Option A: Use Codemagic (no Mac required):**
1. Go to https://codemagic.io → Sign up with GitHub
2. Add your repo (Watchdog088/Test-apps)
3. The `codemagic.yaml` file already exists and is configured
4. Trigger a build — Codemagic has Mac build machines

**Option B: If you have Mac access:**
```
cd /path/to/ConnectHub-SPA
npx cap add ios
npx cap open ios          # opens Xcode
```

Then in Xcode:
- Signing & Capabilities → Team → your Apple Developer team
- Add capability: Push Notifications
- Add capability: In-App Purchase
- Drag `ios-templates/PrivacyInfo.xcprivacy` into the Xcode project navigator
- In Info.plist add permission descriptions:
  - NSCameraUsageDescription: "Take photos for your profile and posts"
  - NSPhotoLibraryUsageDescription: "Choose photos for your profile and posts"
  - NSMicrophoneUsageDescription: "Record audio for voice messages and live streams"
  - NSLocationWhenInUseUsageDescription: "Find people and events near you"
  - NSUserNotificationsUsageDescription: "Get notified about matches, messages, and likes"

---

### App Icons & Launch Screen

| Item | Status | Notes |
|---|---|---|
| Create App Icon set (1024×1024 PNG) | ❌ **YOU MUST DO** | Export from `lynkapp-logos.tsx` → save as 1024×1024 PNG |
| Create Launch Screen / iOS Splash Screen | ❌ NOT DONE | iOS project doesn't exist yet |

### 🔴 BLOCKER 6 — Create App Icons (YOU DO THIS — 1-2 hours)

**Android (512×512 PNG):**
1. Open `../../Documents/lynkapp-logos.tsx` in a browser or design tool
2. Export the main logo as a 512×512 PNG
3. Save as: `ConnectHub-SPA/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png`
4. Use Android Studio → Image Asset Studio to auto-generate all density variants

**iOS (1024×1024 PNG):**
1. Export the main logo as a 1024×1024 PNG (no transparency, no rounded corners — Apple adds rounding)
2. After `cap add ios`, drag into Xcode → AppIcon → 1024pt slot
3. Or use https://appicon.co — upload once, download all sizes

---

### App Store Connect Setup

| Item | Status | Notes |
|---|---|---|
| Create app record in App Store Connect | ❌ **YOU MUST DO** | Requires Apple Developer Program |
| Complete App Information | ❌ NOT DONE | Draft copy in `LYNKAPP-STORE-LISTING-COPY-SEP2026.md` |
| Complete App Privacy nutrition label | ❌ **YOU MUST DO** | Fill in at appstoreconnect.apple.com |
| App Store Screenshots | ❌ **YOU MUST DO** | Minimum: 2 × 6.7" iPhone, 2 × iPad 12.9" |
| App Description, Keywords, Support URL | ❌ NOT DONE | Draft copy in store listing file |
| Build Archive and submit via Xcode | ❌ NOT DONE | iOS project doesn't exist yet |

### App Store Connect Step-by-Step (YOU DO THIS after Apple Developer enrollment):

**Step 1:** Go to https://appstoreconnect.apple.com → My Apps → +

**Step 2:** New App → iOS → Name: LynkApp → Language: English → Bundle ID: com.lynkapp.app → SKU: lynkapp-ios-001

**Step 3:** App Information tab → Category: Social Networking → Content Rights: Does not contain third-party content

**Step 4:** Pricing and Availability → Price: Free

**Step 5:** App Privacy → Data Types → fill in all data types collected (same as Google Play Data Safety above)

**Step 6:** Create In-App Purchases (same 4 products as Android)

---

### Apple In-App Purchase Policy

| Item | Status | Notes |
|---|---|---|
| Implement StoreKit for coin purchases on iOS | ✅ CODE DONE | `google-play-billing-service.js` handles both Android + iOS. `BuyCoinsPage.jsx` platform-gated. Backend route `/api/billing/verify-purchase` created. |

---

## WHAT CLINE (AI) COMPLETED IN THIS SPRINT

### ✅ Code Completed (September 1, 2026)

| # | File | What Was Done |
|---|---|---|
| 1 | `android/app/build.gradle` | `minifyEnabled true` + `signingConfigs.release` block — confirmed ✅ |
| 2 | `android/app/proguard-rules.pro` | Full ProGuard/R8 rules for Capacitor, Firebase, Google Play Billing |
| 3 | `android/app/src/main/AndroidManifest.xml` | App Links (autoVerify), permissions, URI scheme |
| 4 | `android/app/src/main/res/drawable/splash.xml` | Native Android splash drawable (placeholder — replace with logo) |
| 5 | `src/services/google-play-billing-service.js` | Complete Google Play Billing + StoreKit IAP service |
| 6 | `src/pages/wallet/BuyCoinsPage.jsx` | Platform-gated: native IAP on Android/iOS, Stripe on web |
| 7 | `src/main.jsx` | Full Capacitor PushNotifications lifecycle: requestPermissions, register, token saved to Firestore, tap routing |
| 8 | `ConnectHub-Backend/src/routes/billing.ts` | POST /api/billing/verify-purchase with idempotency, coin crediting, receipt logging |
| 9 | `public/.well-known/assetlinks.json` | App Links verification file (update SHA256 after keystore generated) |
| 10 | `ios-templates/PrivacyInfo.xcprivacy` | iOS 17+ privacy manifest template ready to drag into Xcode |
| 11 | `LYNKAPP-STORE-LISTING-COPY-SEP2026.md` | Full store copy: title, description, keywords, screenshots guide |
| 12 | `LYNKAPP-BLOCKER-STEP-BY-STEP-INSTRUCTIONS-SEP2026.md` | Exact terminal commands for all blockers |

---

## WHAT YOU (DEVELOPER) STILL NEED TO DO

### 🔴 DO THESE FIRST (Android — Blockers)

| Priority | Task | Time | Where |
|---|---|---|---|
| 1 | **Generate keystore** — `keytool -genkey...` | 15 min | See BLOCKER 1 above |
| 2 | **Update assetlinks.json** with real SHA256 fingerprint | 10 min | See BLOCKER 2 above |
| 3 | **Install IAP plugin**: `npm install @capacitor-community/in-app-purchases && npx cap sync android` | 20 min | See BLOCKER 3 above |
| 4 | **Run**: `npm run build && npx cap sync android` | 10 min | ConnectHub-SPA folder |
| 5 | **Sign and build AAB** in Android Studio | 30 min | Android Studio → Build → Generate Signed Bundle |
| 6 | **Create Google Play Developer Account** ($25) | 15 min | play.google.com/console |
| 7 | **Create in-app products in Play Console** (4 products) | 20 min | See BLOCKER 3 above |
| 8 | **Complete Play Console store listing** | 4–8 hrs | Use LYNKAPP-STORE-LISTING-COPY-SEP2026.md |
| 9 | **Test on physical Android device** | 2–4 hrs | USB debug or wireless ADB |

### 🟡 DO THESE SECOND (iOS — Mac/Codemagic Required)

| Priority | Task | Time | Where |
|---|---|---|---|
| 10 | **Install Apple Sign In plugin**: `npm install @capacitor-community/apple-sign-in` | 5 min | See BLOCKER 4 above |
| 11 | **Enroll in Apple Developer Program** ($99/year) | 24–48 hrs | developer.apple.com |
| 12 | **Run `npx cap add ios`** — Mac or Codemagic | 30 min | See BLOCKER 5 above |
| 13 | **Register Bundle ID + Firebase iOS app** | 30 min | See BLOCKER 5 above |
| 14 | **Configure Xcode** (Info.plist, capabilities, PrivacyInfo) | 1 hr | See BLOCKER 5 above |
| 15 | **Create app icons** (512px Android, 1024px iOS) | 2–4 hrs | See BLOCKER 6 above |
| 16 | **Create App Store Connect app record** | 30 min | appstoreconnect.apple.com |
| 17 | **Create IAP products in App Store Connect** (same 4) | 20 min | App Store Connect → In-App Purchases |
| 18 | **Build Archive and submit to TestFlight** | 1 hr | Xcode → Product → Archive |
| 19 | **Complete App Privacy nutrition label** | 2–4 hrs | App Store Connect → App Privacy |

---

## ESTIMATED TIME REMAINING

| Area | Est. Time |
|---|---|
| Android keystore + sync + AAB build | 1–2 hours |
| Google Play Console + store listing | 4–8 hours |
| IAP plugin install + Play Console products | 40 min |
| iOS: Mac/Codemagic + `cap add ios` + Xcode | 4–8 hours |
| Apple Sign In + StoreKit products | 1–2 hours |
| App icons (512px + 1024px) | 2–4 hours |
| App Store Connect setup + privacy label | 3–5 hours |
| Physical device testing (Android + iOS) | 4–8 hours |
| **TOTAL REMAINING** | **20–38 hours** |

---

## GITHUB COMMIT HISTORY

| Commit | Hash | What Was Done |
|---|---|---|
| Sprint 1 | `1010d72` | AndroidManifest App Links, ProGuard rules, Google Play Billing service, blocker instructions |
| Sprint 2 | *(this commit)* | Push notifications in main.jsx, BuyCoinsPage platform-gating, billing backend route, splash drawable |
