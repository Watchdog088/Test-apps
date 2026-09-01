# STEP 1 & STEP 2 — EXACT INSTRUCTIONS TO BUILD SIGNED ANDROID AAB
**Date:** September 1, 2026  
**For:** LynkApp (com.lynkapp.app)  
**Status:** Step 1 code is COMPLETE ✅ — Step 2 requires your action in Android Studio

---

## ✅ STEP 1 STATUS: ALREADY COMPLETE (No Action Needed)

Cline has inspected `ConnectHub-SPA/android/app/build.gradle` and confirmed it is **fully configured**:

```groovy
signingConfigs {
    release {
        storeFile file(System.getenv("KEYSTORE_PATH") ?: "lynkapp-release.keystore")
        storePassword System.getenv("KEYSTORE_STORE_PASSWORD") ?: ""
        keyAlias System.getenv("KEYSTORE_KEY_ALIAS") ?: "lynkapp"
        keyPassword System.getenv("KEYSTORE_KEY_PASSWORD") ?: ""
    }
}
buildTypes {
    release {
        minifyEnabled true   ✅ (ProGuard enabled)
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        signingConfig signingConfigs.release   ✅ (Signing wired)
    }
}
```

✅ `signingConfigs.release` block — DONE  
✅ `minifyEnabled true` — DONE  
✅ `signingConfig signingConfigs.release` — DONE  
✅ Windows environment variables set — DONE  
✅ Keystore file at `C:\Users\Jnewball\lynkapp-keystore\lynkapp-release.keystore` — DONE

**You do NOT need to touch build.gradle. Move directly to Step 2.**

---

## 🔵 STEP 2: BUILD THE SIGNED AAB IN ANDROID STUDIO

### WHAT YOU NEED BEFORE YOU START:
- [ ] Android Studio installed (download from https://developer.android.com/studio if not installed)
- [ ] Java JDK 17+ installed (Android Studio usually includes this)
- [ ] Your computer has restarted at least once since the environment variables were set (or open a fresh terminal first)

---

### PART A — BUILD THE WEB APP AND SYNC TO ANDROID (Do this in Command Prompt first)

**Open Command Prompt (cmd.exe) and run these commands one at a time:**

**Command 1 — Navigate to the project:**
```
cd C:\Users\Jnewball\Test-apps\Test-apps\ConnectHub-SPA
```

**Command 2 — Build the production web bundle:**
```
npm run build
```
Wait for it to finish. You should see "✓ built in X.Xs" at the end.

**Command 3 — Sync the web build to Android:**
```
npx cap sync android
```
Wait for it to finish. You should see "✔ Sync finished in X.Xs"

**Command 4 — Verify environment variables are set (optional check):**
```
echo %KEYSTORE_PATH%
```
Expected output: `C:\Users\Jnewball\lynkapp-keystore\lynkapp-release.keystore`

If it shows nothing, close the Command Prompt and reopen it, then try again. The env vars need a fresh terminal session to appear.

---

### PART B — OPEN THE PROJECT IN ANDROID STUDIO

**Step B1 — Open Android Studio**
- Launch Android Studio from the Start menu or taskbar

**Step B2 — Open the Android project**
- Click **"Open"** (NOT "New Project")
- Navigate to: `C:\Users\Jnewball\Test-apps\Test-apps\ConnectHub-SPA\android`
- Click **OK** / **Open**
- Wait for Gradle to sync (this can take 2–5 minutes the first time)
- You will see a progress bar at the bottom saying "Gradle sync in progress..." — wait for it to complete

**Step B3 — Verify the project loaded correctly**
- In the left panel (Project view), you should see: `app` → `manifests` → `AndroidManifest.xml`
- If you see red errors, wait for Gradle sync to finish completely before proceeding

---

### PART C — BUILD THE SIGNED ANDROID APP BUNDLE (AAB)

**Step C1 — Open the Build menu**
- In the top menu bar, click **Build**

**Step C2 — Select Generate Signed Bundle**
- Click **"Generate Signed Bundle / APK..."**
- A dialog box will open

**Step C3 — Choose Android App Bundle**
- Select **"Android App Bundle"** (the top radio button — NOT APK)
- Click **Next**

**Step C4 — Configure the keystore (IMPORTANT — follow exactly)**

In the "Key store path" field, you need to enter the keystore location.

Option A (Use existing): Click **"Choose existing..."**
- Navigate to: `C:\Users\Jnewball\lynkapp-keystore`
- Select `lynkapp-release.keystore`
- Click **OK**

Then fill in these fields:
| Field | Value |
|---|---|
| Key store password | `LynkApp2026!Secure` |
| Key alias | `lynkapp` |
| Key password | `LynkApp2026!Secure` |

> ⚠️ If you check "Remember passwords" it will save them to Android Studio (OK for your personal computer, but not shared computers)

Click **Next**

**Step C5 — Choose build variant and destination**
- Build Variants: Select **"release"**
- Destination folder: Leave as default (it will put the AAB in `android/app/release/`)
- Signature Versions: Check both **V1 (Jar Signature)** and **V2 (Full APK Signature)**

Click **Finish**

---

### PART D — WAIT FOR THE BUILD TO COMPLETE

The build will take **5–15 minutes** depending on your computer speed.

You will see progress at the bottom of Android Studio:
- "Gradle: Execute tasks... :app:bundleRelease"
- "Build output" tab will show progress

**When it finishes successfully**, you will see a popup notification at the bottom right:
> "Generate Signed Bundle: locate" 

Click **"locate"** to open the folder containing your AAB file.

---

### PART E — VERIFY THE AAB FILE

The signed AAB will be located at:
```
C:\Users\Jnewball\Test-apps\Test-apps\ConnectHub-SPA\android\app\release\app-release.aab
```

**Check:**
- [ ] The file exists
- [ ] File size is greater than 5 MB (typical for this type of app: 10–50 MB)
- [ ] File name ends in `.aab`

**If the build FAILED**, look at the "Build Output" tab at the bottom of Android Studio. The most common errors and fixes:

| Error Message | Fix |
|---|---|
| `storeFile not found` | The keystore env var isn't being read. Manually enter the full path in the keystore dialog instead of using env vars. Path: `C:\Users\Jnewball\lynkapp-keystore\lynkapp-release.keystore` |
| `Keystore was tampered with or password was incorrect` | You entered the wrong password. Use: `LynkApp2026!Secure` |
| `minifyEnabled` related error | A class was stripped by ProGuard. Cline will add a ProGuard keep rule. |
| `Duplicate class` | Gradle dependency conflict — let Cline know and we'll fix it |
| `SDK version` error | Update Android Studio or change targetSdkVersion |

---

### PART F — AFTER SUCCESSFUL BUILD

Once you have a working `.aab` file:

1. **Tell Cline "Step 2 is done"** — Cline will then work on Step 4 (Google Play Billing)
2. **Keep the AAB file safe** — You will upload it to Google Play Console in Step 3
3. **Note the file location** — `android/app/release/app-release.aab`

---

## KEYSTORE CREDENTIALS (SAVE THESE)

```
File:     C:\Users\Jnewball\lynkapp-keystore\lynkapp-release.keystore
Password: LynkApp2026!Secure
Alias:    lynkapp
SHA256:   D6:63:F0:A9:27:B5:7D:79:3E:FA:26:F3:B8:B5:7D:AA:BA:50:F9:19:D8:4E:3A:26:69:11:CF:E5:B9:33:7C:28
```

⚠️ **CRITICAL WARNING:** This keystore is the ONLY way to update your app on Google Play Store.  
If you lose it, you cannot update the app — ever. You would have to publish a brand new app.  
Back it up to: USB drive + Google Drive/iCloud/Dropbox right now.

---

## WHAT CLINE WILL DO NEXT (After You Complete Step 2)

Once you confirm Step 2 is done, Cline will immediately begin:

- **Step 4:** Wire `google-play-billing-service.js` to `BuyCoinsPage.jsx`  
  Gate Stripe for web only, use Google Play Billing for Android  
  (This is required by Google Play policy — no Stripe for digital goods on Android)

- **Step 7:** Install `@capacitor-community/apple-sign-in` and wire it to `LoginPage.jsx` and `SignupPage.jsx`

- **Step 8:** Implement `@capacitor/purchases` (RevenueCat) for iOS coin purchases

---

## SECTION 2 REMAINING STEPS (Your Action Required)

| Step | What You Do | Status |
|---|---|---|
| Step 1 | Code in build.gradle | ✅ DONE BY CLINE |
| Step 2 | Build signed AAB in Android Studio | ⏳ YOUR TURN |
| Step 3 | Create Google Play Console account ($25) | ⏳ YOUR TURN |
| Step 4 | Wire Google Play Billing | ⏳ CLINE DOES THIS |
| Step 5 | Run `npx cap add ios` on a Mac | ⏳ MAC REQUIRED |
| Step 6 | Create App Store Connect account | ⏳ YOUR TURN |
| Step 7 | Install Apple Sign In plugin | ⏳ CLINE DOES THIS |
| Step 8 | Implement StoreKit/RevenueCat | ⏳ CLINE DOES THIS |
| Step 9 | Create screenshots and store graphics | ⏳ YOUR TURN |
| Step 10 | Submit to both stores | ⏳ BOTH |

---

*Instructions created: September 1, 2026 by Cline AI*  
*Saved to GitHub: https://github.com/Watchdog088/Test-apps*
