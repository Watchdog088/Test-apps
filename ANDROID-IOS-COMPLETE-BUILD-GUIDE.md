# 📱 LynkApp — Complete Android & iOS Build Guide
### June 2026 | Capacitor 6 | React + Vite + Firebase

---

## 🏁 OVERVIEW

LynkApp uses **Capacitor 6** to wrap the React SPA into a native Android APK and iOS IPA.
The same codebase runs on:
- 🌐 **Web** → Firebase Hosting (already live at lynkapp-c7db1.web.app)
- 🤖 **Android** → APK via Android Studio → Firebase App Distribution for beta
- 🍎 **iOS** → IPA via Xcode (Mac required) → TestFlight for beta

---

## ✅ WHAT'S ALREADY DONE (Pre-configured)

| Item | Status |
|------|--------|
| `capacitor.config.json` | ✅ Fully configured (appId, splash, statusbar, push, keyboard) |
| `mobile-platform-service.js` | ✅ Complete (haptics, push, deep links, back button, keyboard) |
| `mobile-ios-android.css` | ✅ Native feel styles (safe areas, bottom nav, touch targets) |
| `package.json` | ✅ All 17 Capacitor plugins now added |
| Firebase project | ✅ `lynkapp-c7db1` configured |

---

## 🔴 CRITICAL: Before You Start

### Verify Node.js version
```
node --version
```
**Required: Node 18+ or 20+** (Node 16 will fail)

If you have Node 16:
- Download Node 20 LTS from: https://nodejs.org/en/download

### Verify Java (for Android only)
```
java -version
```
**Required: Java 17** (Java 21 works too, Java 11 will fail with Capacitor 6)

Download Java 17: https://adoptium.net/temurin/releases/?version=17

---

# 🤖 PART 1: ANDROID — Step-by-Step

## PHASE A: Install Dependencies

### Step A1 — Install all npm packages (including Capacitor)
Open a terminal, navigate to the ConnectHub-SPA folder:
```
cd c:\Users\Jnewball\Test-apps\Test-apps\ConnectHub-SPA
npm install
```
**This installs all 17 Capacitor plugins. Will take 2-5 minutes.**

### Step A2 — Verify Capacitor CLI is available
```
npx cap --version
```
Expected output: `6.x.x`

---

## PHASE B: Build the React App

### Step B1 — Build production bundle
```
npm run build
```
This creates the `dist/` folder. **This is what gets packaged into the APK.**

Expected: "vite build" completes with no errors.

---

## PHASE C: Add Android Platform

### Step C1 — Add Android to Capacitor (only do this ONCE)
```
npx cap add android
```
This creates the `android/` folder with a complete Android Studio project.

**If it says "android already exists", skip to Step C2.**

### Step C2 — Sync web code into Android
```
npx cap sync android
```
This copies your `dist/` folder into the Android project AND installs Android plugins.

---

## PHASE D: Set Up Android Studio

### Step D1 — Download Android Studio
Go to: https://developer.android.com/studio
Download and install **Android Studio Hedgehog (2023.1.1) or newer**

### Step D2 — Set up SDK during first launch
When Android Studio first opens:
1. Click "More Actions" → "SDK Manager"
2. Install **Android 14 (API 34)** SDK
3. Install **Android 13 (API 33)** SDK (for older devices)
4. Also install: "Android SDK Build-Tools 34"

### Step D3 — Configure ANDROID_HOME environment variable
In Windows, set these environment variables:
1. Open: Control Panel → System → Advanced System Settings → Environment Variables
2. Add new User Variable:
   - Name: `ANDROID_HOME`
   - Value: `C:\Users\Jnewball\AppData\Local\Android\Sdk`
3. Add to PATH: `%ANDROID_HOME%\tools` and `%ANDROID_HOME%\platform-tools`

---

## PHASE E: Add Firebase to Android App

### Step E1 — Download google-services.json
1. Go to: https://console.firebase.google.com
2. Open project: **lynkapp-c7db1**
3. Click the gear icon → "Project Settings"
4. Scroll to "Your apps" section
5. Click "Add app" → Android icon
6. Package name: **com.lynkapp.app**
7. App nickname: LynkApp Android
8. Click "Register app"
9. **Download `google-services.json`**

### Step E2 — Place google-services.json
Copy the downloaded file to:
```
ConnectHub-SPA/android/app/google-services.json
```

**THIS IS REQUIRED. The app will crash on launch without this file.**

---

## PHASE F: Open Android Studio & Build

### Step F1 — Open project in Android Studio
```
npx cap open android
```
OR manually: Open Android Studio → "Open" → select `ConnectHub-SPA/android` folder

### Step F2 — Wait for Gradle sync
Android Studio will auto-sync. This takes 3-10 minutes the first time.
Wait for "Gradle sync finished" in the bottom status bar.

### Step F3 — Fix any Gradle issues (if they appear)
If you see "Minimum supported Gradle version" error:
1. Open `android/gradle/wrapper/gradle-wrapper.properties`
2. Change distributionUrl to:
   ```
   distributionUrl=https\://services.gradle.org/distributions/gradle-8.5-bin.zip
   ```

If you see "compileSdkVersion" error:
1. Open `android/variables.gradle`
2. Set: `compileSdkVersion = 34`

### Step F4 — Build the APK
In Android Studio:
1. Menu → **Build → Build Bundle(s)/APK(s) → Build APK(s)**
2. Wait 3-5 minutes
3. Click "locate" in the notification to find the APK

APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## PHASE G: Test on a Real Android Device

### Step G1 — Enable Developer Options on your Android phone
1. Go to Settings → About Phone
2. Tap "Build Number" **7 times**
3. Go back → "Developer Options" will appear
4. Enable "USB Debugging"

### Step G2 — Install APK directly (fastest for testing)
Connect phone via USB, then:
```
cd c:\Users\Jnewball\Test-apps\Test-apps\ConnectHub-SPA\android
..\node_modules\.bin\cap run android
```
OR just copy the APK to your phone and install it.

### Step G3 — Use Android Emulator (no physical device needed)
In Android Studio:
1. Tools → Device Manager → Create Virtual Device
2. Choose: **Pixel 7** with **API 33 (Android 13)**
3. Click "Run" (triangle button)
4. Click the green "Run" button in Android Studio to launch the app

---

## PHASE H: Distribute to Beta Testers (Android)

### Option 1: Firebase App Distribution (RECOMMENDED for beta)
```
npm install -g firebase-tools
firebase login
firebase appdistribution:distribute android/app/build/outputs/apk/debug/app-debug.apk \
  --app YOUR_FIREBASE_ANDROID_APP_ID \
  --groups "beta-testers" \
  --release-notes "LynkApp Beta v1.0"
```

Find YOUR_FIREBASE_ANDROID_APP_ID in:
Firebase Console → Project Settings → Your Apps → Android app → App ID

### Option 2: Direct APK sharing
Send the `app-debug.apk` file directly to testers via email/Drive.
Testers need to enable "Install Unknown Apps" on their phone.

### Option 3: Google Play Internal Testing
1. Create a Google Play Developer account ($25 one-time fee)
2. Create a new app in Play Console
3. Upload a **signed release APK** (not debug)
4. Add tester email addresses under "Internal Testing"

---

## PHASE I: Create a Signed Release APK (for Play Store)

### Step I1 — Generate a keystore
```
keytool -genkey -v -keystore lynkapp-release.keystore -alias lynkapp -keyalg RSA -keysize 2048 -validity 10000
```
**IMPORTANT: Save this keystore file and password somewhere safe. You can never change it.**

### Step I2 — Configure signing in Android Studio
1. Build → Generate Signed Bundle/APK
2. Choose APK → Create New Keystore
3. Browse to your `lynkapp-release.keystore`
4. Enter your passwords and alias
5. Choose "release" build type
6. Click Finish

---

# 🍎 PART 2: iOS — Step-by-Step

## ⚠️ IMPORTANT: iOS REQUIRES A MAC

**You cannot build iOS apps on Windows.** This is an Apple requirement.

**Options if you don't have a Mac:**
1. **Rent a Mac in the cloud**: Use MacStadium ($49/mo) or MacInCloud ($1/hr)
2. **Use Codemagic** (CI/CD): The `codemagic.yaml` is already configured in the project! Push to GitHub and Codemagic will build the IPA automatically.
3. **Buy a used Mac Mini**: Mac Mini M1 ~$500 used on eBay

---

## PHASE A: Setup on Mac (or Cloud Mac)

### Step A1 — Install Xcode
From Mac App Store, install **Xcode 15** (free, ~7GB download)

After install, accept the license:
```
sudo xcode-select --install
sudo xcodebuild -license accept
```

### Step A2 — Install Node.js & npm on Mac
```
brew install node@20
```
Or download from https://nodejs.org

### Step A3 — Clone the repository on Mac
```
git clone https://github.com/Watchdog088/Test-apps.git
cd "Test-apps/ConnectHub-SPA"
npm install
```

---

## PHASE B: Add iOS Platform

### Step B1 — Build React app
```
npm run build
```

### Step B2 — Add iOS platform (only once)
```
npx cap add ios
```

### Step B3 — Sync
```
npx cap sync ios
```

---

## PHASE C: Configure Firebase for iOS

### Step C1 — Download GoogleService-Info.plist
1. Go to: https://console.firebase.google.com → lynkapp-c7db1
2. Project Settings → Add App → iOS
3. Bundle ID: **com.lynkapp.app**
4. App nickname: LynkApp iOS
5. **Download `GoogleService-Info.plist`**

### Step C2 — Add to Xcode project
1. Open project: `npx cap open ios`
2. In Xcode left panel, right-click on "App" folder
3. "Add Files to App..."
4. Select `GoogleService-Info.plist`
5. Make sure "Copy items if needed" is checked
6. Click Add

**This file is REQUIRED for Firebase Auth, Firestore, and Push Notifications.**

---

## PHASE D: Configure Signing in Xcode

### Step D1 — Apple Developer Account ($99/year)
Sign up at: https://developer.apple.com/account/
This is required to:
- Test on a real iPhone (free dev account works for this)
- Submit to App Store / TestFlight (paid $99/yr required)

### Step D2 — Sign the app
In Xcode:
1. Click "App" in the left panel
2. Click "Signing & Capabilities" tab
3. Check "Automatically manage signing"
4. Team: Select your Apple Developer team
5. Bundle Identifier: `com.lynkapp.app`

### Step D3 — Add required capabilities
Still in "Signing & Capabilities":
Click "+" and add:
- ✅ Push Notifications
- ✅ Background Modes (check: Remote notifications, Background fetch)
- ✅ Associated Domains (for deep links: `applinks:lynkapp.com`)

---

## PHASE E: Configure Info.plist (Permissions)

In Xcode, click "Info" tab or open `ios/App/App/Info.plist`

Add these permission descriptions:
```xml
<key>NSCameraUsageDescription</key>
<string>LynkApp needs camera access to take photos and videos for your posts and profile.</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>LynkApp needs photo library access to upload photos and videos.</string>

<key>NSMicrophoneUsageDescription</key>
<string>LynkApp needs microphone access for live streaming and video calls.</string>

<key>NSLocationWhenInUseUsageDescription</key>
<string>LynkApp uses your location to show nearby friends and events.</string>

<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>LynkApp uses your location to show nearby friends and events.</string>

<key>NSFaceIDUsageDescription</key>
<string>LynkApp uses Face ID for quick and secure login.</string>

<key>NSUserNotificationsUsageDescription</key>
<string>LynkApp sends notifications for messages, matches, and activity.</string>
```

---

## PHASE F: Add iOS App Icons & Splash Screen

### App Icons
Create icons at these sizes and place in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`:
- 20x20, 29x29, 40x40, 58x58, 60x60, 76x76, 80x80, 87x87
- 120x120, 152x152, 167x167, 180x180, 1024x1024

**Easiest approach**: Use https://appicon.co — upload one 1024x1024 PNG and download all sizes.

### Splash Screen
Place `splash.png` (2732x2732px, dark `#0a0a18` background, centered logo) in:
`ios/App/App/Assets.xcassets/Splash.imageset/`

---

## PHASE G: Build & Test on iPhone

### Step G1 — Connect iPhone via USB
Trust the computer when prompted on the phone.

### Step G2 — Run on device
```
npx cap run ios
```
OR in Xcode: Select your device from the top dropdown → Click the ▶ Run button

### Step G3 — Run in iOS Simulator (no physical device needed)
In Xcode, select a simulator (e.g., "iPhone 15 Pro") → Click ▶ Run

---

## PHASE H: Distribute via TestFlight (Beta Testing)

### Step H1 — Create Archive
In Xcode: Product → Archive
Wait for build to complete (5-10 minutes)

### Step H2 — Upload to App Store Connect
1. Archive Organizer opens automatically
2. Click "Distribute App"
3. Choose "App Store Connect"
4. Follow prompts → Upload

### Step H3 — Set up TestFlight
1. Go to: https://appstoreconnect.apple.com
2. Open LynkApp → TestFlight tab
3. Wait for "Processing" to complete (~30 minutes)
4. Add Internal Testers (up to 100 Apple IDs)
5. Add External Testers (up to 10,000 — needs Apple review, ~1-2 days)

### Step H4 — Testers install via TestFlight app
Testers download "TestFlight" from App Store, then use their invite link.

---

## PHASE I: Using Codemagic (Build iOS Without a Mac)

The project already has `codemagic.yaml` configured!

### Step I1 — Connect to Codemagic
1. Go to: https://codemagic.io
2. Sign in with GitHub
3. Click "Add application"
4. Select the `Test-apps` repository

### Step I2 — Configure secrets in Codemagic
Add these environment variables in Codemagic dashboard:
- `APPLE_ID` — your Apple account email
- `APP_STORE_CONNECT_ISSUER_ID` — from App Store Connect API Keys
- `APP_STORE_CONNECT_KEY_IDENTIFIER` — from App Store Connect API Keys
- `CERTIFICATE_PRIVATE_KEY` — your iOS distribution certificate (.p12)
- `APP_STORE_CONNECT_PRIVATE_KEY` — App Store Connect API key content

### Step I3 — Start a build
Push code to GitHub → Codemagic auto-triggers
Or click "Start new build" in Codemagic dashboard

---

# 🔧 PHASE J: Native Feature Configuration for Both Platforms

## Push Notifications Setup

### Android (FCM)
1. Firebase Console → Cloud Messaging
2. Copy the "Server key"
3. In `android/app/src/main/AndroidManifest.xml`, verify:
```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
```
This is auto-added by Capacitor Push Notifications plugin.

### iOS (APNs)
1. Apple Developer → Certificates, IDs & Profiles
2. Create an APNs Authentication Key (.p8 file)
3. Firebase Console → Project Settings → Cloud Messaging → iOS app
4. Upload the .p8 key with Team ID and Key ID

---

## Deep Links / Universal Links

### Android (App Links)
In `android/app/src/main/AndroidManifest.xml` (inside `<activity>`):
```xml
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="https" android:host="lynkapp.com" />
</intent-filter>
```

### iOS (Universal Links)
Already configured via Associated Domains: `applinks:lynkapp.com`

---

# 📋 FULL CHECKLIST — Android Beta Ready

```
PRE-BUILD
[ ] Node.js 18+ installed
[ ] Java 17+ installed  
[ ] npm install completed in ConnectHub-SPA
[ ] npm run build completed (no errors)

ANDROID SETUP
[ ] npx cap add android (creates android/ folder)
[ ] npx cap sync android (copies dist/ to android)
[ ] Android Studio installed
[ ] Android SDK 33 + 34 installed in SDK Manager
[ ] ANDROID_HOME environment variable set

FIREBASE
[ ] Google Play app registered in Firebase Console
[ ] google-services.json downloaded
[ ] google-services.json placed at android/app/google-services.json

BUILD
[ ] Gradle sync completed in Android Studio (no errors)
[ ] Debug APK built successfully
[ ] App launches on emulator or real device

NATIVE FEATURES TEST
[ ] Login/signup works
[ ] Push notification permission requested
[ ] Camera permission works (try post creation)
[ ] Location works (try friends nearby)
[ ] Back button works (minimizes app on home screen)
[ ] Splash screen shows on launch

BETA DISTRIBUTION
[ ] Firebase App Distribution set up
[ ] APK uploaded to distribution
[ ] Beta tester group created
[ ] Test invitation emails sent
```

---

# 📋 FULL CHECKLIST — iOS Beta Ready

```
PRE-BUILD (Mac required)
[ ] Mac with macOS Ventura or Sonoma
[ ] Xcode 15 installed
[ ] Apple Developer Account ($99/yr)
[ ] Node.js 18+ on Mac
[ ] npm install completed

iOS SETUP
[ ] npx cap add ios (creates ios/ folder)
[ ] npx cap sync ios
[ ] GoogleService-Info.plist downloaded from Firebase
[ ] GoogleService-Info.plist added to Xcode project

XCODE CONFIGURATION
[ ] Team selected in Signing & Capabilities
[ ] Bundle ID: com.lynkapp.app
[ ] Push Notifications capability added
[ ] Background Modes capability added
[ ] Associated Domains added (applinks:lynkapp.com)
[ ] All NSUsageDescription keys added to Info.plist

ICONS & SPLASH
[ ] App icons created at all required sizes
[ ] Splash screen image (2732x2732) prepared
[ ] Assets loaded in Xcode

BUILD & TEST
[ ] App builds without errors in Xcode
[ ] Runs on iOS Simulator
[ ] Runs on physical iPhone
[ ] Login works
[ ] Push notifications work
[ ] Camera works
[ ] All tabs navigate correctly

TESTFLIGHT
[ ] Archive created
[ ] App uploaded to App Store Connect
[ ] Processing completed
[ ] Internal testers added (up to 100)
[ ] TestFlight invites sent
```

---

# 🚀 QUICK START — Fastest Path (Android only, 30 minutes)

If you just want to get the first Android APK as fast as possible:

```
1. cd c:\Users\Jnewball\Test-apps\Test-apps\ConnectHub-SPA

2. npm install
   (installs Capacitor + all plugins)

3. npm run build
   (builds React app)

4. npx cap add android
   (creates android project — one time only)

5. Place google-services.json in android/app/
   (download from Firebase Console)

6. npx cap sync android
   (syncs web app + plugins to Android)

7. Open Android Studio → android folder
   Wait for Gradle sync

8. Build → Build APK(s) → Build APK(s)

9. Find APK at:
   android/app/build/outputs/apk/debug/app-debug.apk

10. Share APK with beta testers!
```

**Total time: ~30 minutes** (most of that is Gradle sync and build)

---

# 🐛 COMMON ERRORS & FIXES

## "Could not find @capacitor/core"
```
cd ConnectHub-SPA
npm install
```

## "Minimum supported Gradle version is X"
In `android/gradle/wrapper/gradle-wrapper.properties`:
Change to: `distributionUrl=https\://services.gradle.org/distributions/gradle-8.5-bin.zip`

## "ANDROID_HOME not set"
Set environment variable: `ANDROID_HOME=C:\Users\Jnewball\AppData\Local\Android\Sdk`
Then restart terminal.

## "google-services.json not found"
Download from Firebase Console → Project Settings → Android app.
Place at `android/app/google-services.json`

## "App crashes immediately on launch"
Usually means `google-services.json` is missing or incorrect.
Check: Firebase project ID in the file matches `lynkapp-c7db1`

## iOS: "No account for team"
In Xcode Signing & Capabilities, sign in with your Apple ID.
If using free account, you can test on device for 7 days.
Paid $99/yr account removes this limitation.

## "npx cap sync" fails with ENOENT
Make sure `npm run build` succeeded first (dist/ folder must exist).

---

# 📁 KEY FILES REFERENCE

| File | Purpose |
|------|---------|
| `ConnectHub-SPA/capacitor.config.json` | App ID, splash, plugins config |
| `ConnectHub-SPA/package.json` | All Capacitor npm packages |
| `ConnectHub-SPA/src/services/mobile-platform-service.js` | Native API calls |
| `ConnectHub-SPA/src/styles/mobile-ios-android.css` | Native UI styles |
| `ConnectHub-SPA/android/app/google-services.json` | Firebase Android config (YOU PLACE THIS) |
| `ConnectHub-SPA/ios/App/App/GoogleService-Info.plist` | Firebase iOS config (YOU PLACE THIS) |
| `ConnectHub-SPA/codemagic.yaml` | Cloud iOS builds without a Mac |
| `ConnectHub-SPA/android-build.bat` | One-click Android build script |

---

# 💰 COSTS SUMMARY

| Platform | Cost | Notes |
|----------|------|-------|
| Android APK (debug) | **FREE** | Direct APK, no store needed |
| Firebase App Distribution | **FREE** | Up to 10,000 testers |
| Google Play Developer | $25 one-time | For Play Store listing |
| Apple Developer | $99/year | Required for TestFlight & App Store |
| Codemagic (iOS builds without Mac) | Free tier: 500 min/mo | Enough for 5-10 builds/month |
| MacStadium (Mac rental) | $49/month | If you need a Mac |

---

**Last Updated: June 2026 | LynkApp v1.0 Beta**
