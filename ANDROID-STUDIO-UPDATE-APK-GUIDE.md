# 📱 LynkApp — How to Update & Build the APK in Android Studio
**Complete Step-by-Step Guide — June 2026**

---

## 🔄 THE FULL UPDATE CYCLE (Every Time You Make Code Changes)

```
VS Code (edit React code)
        ↓
Run android-build.bat  (builds + syncs your code into the android/ folder)
        ↓
Android Studio  (Gradle syncs + you click Build APK)
        ↓
APK file  (share with beta testers)
```

---

## PART 1 — Run the BAT File First (Outside Android Studio)

### Step 1: Open Command Prompt in the right folder
1. Open **File Explorer**
2. Navigate to: `C:\Users\Jnewball\Test-apps\Test-apps\ConnectHub-SPA\`
3. Click in the address bar, type `cmd`, press **Enter**
   - This opens Command Prompt already in the correct folder
4. Type: `android-build.bat` and press **Enter**

### Step 2: Watch what the bat file does (all automatic)
```
[STEP 1/9]  Checks Node.js is installed
[STEP 2/9]  Runs: npm install  (installs/updates packages)
[STEP 3/9]  Runs: npm run build  (compiles your React app → dist/ folder)
[STEP 4/9]  Checks the android/ folder exists
[STEP 5/9]  Copies google-services.json from Downloads (auto-detected)
[STEP 6/9]  Runs: npx cap sync android  ← THIS is what updates Android Studio
[STEP 7/9]  Verifies required Android project files exist
[STEP 8/9]  Checks Android Studio installation
[STEP 9/9]  Opens Android Studio automatically
```

> ⏱️ **Total time:** About 2–5 minutes depending on your machine

### Step 3: Wait for it to finish
- The bat file will pause at the end with a message
- Press **any key** to close it after Android Studio opens

---

## PART 2 — Inside Android Studio (After the Bat File Opens It)

---

### 🟡 FIRST TIME SETUP (Only needed the very first time)

#### Step A: Wait for Gradle to Sync
When Android Studio opens the project for the first time:
1. Look at the **bottom status bar** — you'll see:
   ```
   "Gradle: sync in progress..."   or   "Syncing..."
   ```
2. **Wait for it to finish** — this downloads all dependencies
   - ⏱️ First time: 5–15 minutes (depends on internet speed)
   - After first time: 30–60 seconds
3. ✅ Done when the status bar shows: **"Gradle sync finished"** or goes blank

#### Step B: Install missing SDK (if prompted)
- A banner may appear: **"Install missing SDK components"**
- Click **"Install"** and wait
- This only happens once

---

### 🔵 EVERY TIME — After Running android-build.bat

#### Step 1: Check for the "Gradle files changed" banner
When Android Studio detects your updated files, you may see a **yellow banner** at the top:

```
┌─────────────────────────────────────────────────────────┐
│  Gradle files have changed since last project sync      │
│                                    [ Sync Now ]         │
└─────────────────────────────────────────────────────────┘
```

- **If you see this banner → Click "Sync Now"**
- **If NO banner appears → Skip to Step 2** (files were already synced automatically)

#### Step 2: Confirm Gradle sync finished
- Watch the **bottom status bar** of Android Studio
- Wait until you see: **"Gradle sync finished"**
- The progress bar at the bottom should disappear

---

### 🔨 BUILD THE DEBUG APK (For Beta Testing)

> Use this for beta testers. Quick, no signing required.

#### Step 1: Open the Build menu
- Click **Build** in the top menu bar

#### Step 2: Choose the build option
```
Build
  └── Build Bundle(s) / APK(s)
        └── Build APK(s)   ← Click this
```

#### Step 3: Wait for the build
- Watch the bottom panel — you'll see Gradle output scrolling
- ⏱️ Takes 1–5 minutes
- ✅ Done when you see: **"BUILD SUCCESSFUL"** in the Build output

#### Step 4: Find your APK
- A popup will appear in the bottom right:
  ```
  APK(s) generated successfully
  [locate]  [analyze]
  ```
- Click **"locate"** to open the folder
- Your APK is at:
  ```
  ConnectHub-SPA\android\app\build\outputs\apk\debug\app-debug.apk
  ```

---

### 🔐 BUILD THE RELEASE APK (For Play Store / Firebase Distribution)

> Use this for the final beta or Play Store submission. Requires signing.

#### Step 1: Go to Build menu
```
Build → Generate Signed Bundle / APK
```

#### Step 2: Choose APK (not Bundle for beta testers)
- Select **APK**
- Click **Next**

#### Step 3: Set up your keystore (First time only)
**If you DON'T have a keystore yet:**
1. Click **"Create new..."**
2. Fill in:
   - **Key store path:** Choose a safe location (e.g., `C:\Keys\lynkapp-keystore.jks`)
   - **Password:** Create a strong password — **SAVE THIS SOMEWHERE SAFE**
   - **Key alias:** `lynkapp`
   - **Key password:** Same or different password
   - **First and Last Name:** Your name
   - **Organization:** LynkApp
   - **Country Code:** US
3. Click **OK**

**If you ALREADY have a keystore:**
1. Click **"Choose existing..."**
2. Select your `.jks` or `.keystore` file
3. Enter your passwords

#### Step 4: Choose Release build type
- **Build Variants:** Select `release`
- **Signature Versions:** Check both **V1** and **V2**
- Click **Finish**

#### Step 5: Wait for build
- ⏱️ Takes 2–8 minutes
- ✅ Done when: **"Generate Signed APK"** success popup appears
- APK location:
  ```
  ConnectHub-SPA\android\app\release\app-release.apk
  ```

---

## PART 3 — Distribute the APK to Beta Testers

### Option A: Firebase App Distribution (RECOMMENDED — Free & Easy)

1. Go to: https://console.firebase.google.com
2. Open project: **lynkapp-c7db1**
3. Left sidebar → **App Distribution**
4. Click **"Get started"** (first time) or **"Releases"**
5. Click **"Upload"** → drag in your `app-debug.apk`
6. Add release notes: `"Beta v1.0 - [date] - [what changed]"`
7. Add tester emails (or create a group)
8. Click **"Distribute"**
9. ✅ Testers get an email with a download link — no Play Store needed!

### Option B: Direct APK Share
1. Upload the APK to Google Drive
2. Share the link with testers
3. Tell testers:
   - On their Android phone: Settings → Security → **"Install unknown apps"** → Allow
   - Download the APK → tap to install

### Option C: Google Play Console (Beta Track)
1. Go to: https://play.google.com/console
2. Create app if first time
3. Testing → **Internal testing** → Create new release
4. Upload `app-release.apk` (signed APK required)
5. Add testers by email
6. Note: Requires $25 one-time Google Play developer fee

---

## 🔁 QUICK REFERENCE — Repeat Workflow

```
Every time you update the app:

1. Edit code in VS Code  (src/ files)
         ↓
2. Run android-build.bat
         ↓
3. In Android Studio:
   - If yellow banner → click "Sync Now"
   - Wait for: "Gradle sync finished"
         ↓
4. Build → Build Bundle(s)/APK(s) → Build APK(s)
         ↓
5. Wait for "BUILD SUCCESSFUL"
         ↓
6. Click "locate" → find app-debug.apk
         ↓
7. Upload to Firebase App Distribution
         ↓
8. Testers download and install ✅
```

---

## ⚠️ COMMON ERRORS & FIXES

| Error | What it means | Fix |
|-------|--------------|-----|
| `google-services.json not found` | Firebase config missing | Place file in `android/app/` — bat file auto-copies from Downloads |
| `Gradle sync failed: Connection refused` | No internet | Check wifi and retry sync |
| `SDK location not found` | Android SDK not configured | Android Studio → SDK Manager → install SDK Platform 35 |
| `Duplicate class found` | Two versions of same library | In Android Studio: File → Invalidate Caches → Restart |
| `BUILD FAILED: resource not found` | Splash screen image missing | Run `npx cap sync android` again from terminal |
| `Could not resolve com.android...` | Maven repo issue | Check VPN/firewall, try again |
| `AAPT: error: resource drawable` | Missing icon/resource | Make sure `android/app/src/main/res/` has the required images |
| `minSdk 21 > 23` | SDK mismatch | Our variables.gradle sets minSdk=23 — should be fine |
| Yellow lock icon on APK | APK not signed | Use debug APK for testing, signed APK for Play Store |

---

## 📁 KEY FILE LOCATIONS

```
ConnectHub-SPA/
├── android-build.bat              ← RUN THIS to update + sync
├── capacitor.config.json          ← App settings (domains, plugins)
├── android/
│   ├── build.gradle               ← Top-level Android config
│   ├── variables.gradle           ← SDK versions (compileSdk=35, minSdk=23)
│   ├── app/
│   │   ├── build.gradle           ← App-specific config
│   │   ├── google-services.json   ← Firebase config (must exist!)
│   │   └── build/
│   │       └── outputs/
│   │           └── apk/
│   │               ├── debug/
│   │               │   └── app-debug.apk     ← BETA TESTER APK
│   │               └── release/
│   │                   └── app-release.apk   ← PLAY STORE APK
│   └── gradle/wrapper/
│       └── gradle-wrapper.properties  ← Gradle 8.11.1
```

---

## ✅ CHECKLIST BEFORE SHARING APK WITH TESTERS

- [ ] `google-services.json` is in `android/app/` folder
- [ ] Gradle sync shows "finished" with no errors
- [ ] Build shows "BUILD SUCCESSFUL"
- [ ] APK file exists at the outputs/apk/debug/ path
- [ ] You tested the APK on at least one physical Android device
- [ ] Firebase App Distribution email was sent to testers
- [ ] Release notes describe what's new/changed

---

*LynkApp Android Build Guide — Updated June 2026*
