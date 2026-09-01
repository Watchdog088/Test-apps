# LYNKAPP — BLOCKER STEP-BY-STEP INSTRUCTIONS
**Date:** September 1, 2026  
**For:** App developer / owner  
**Purpose:** Exact steps for every blocker that requires YOUR action (not automatable by Cline)

---

## ⚠️ HOW TO READ THIS DOCUMENT
- ✅ = Already done by Cline in code
- 🔴 = YOU must do this — detailed steps below
- 🟡 = Requires Mac or external account

---

## BLOCKER 1 — Generate Android Release Keystore
**Why:** No keystore = no signed build = can't submit to Google Play Store.  
**Time estimate:** 15 minutes  
**Who does it:** You (on your Windows PC)

### Step-by-Step:

**Step 1** — Open a Command Prompt (NOT PowerShell — use cmd.exe)
```
Press Windows key → type "cmd" → press Enter
```

**Step 2** — Navigate to the ConnectHub-SPA folder
```
cd C:\Users\Jnewball\Test-apps\Test-apps\ConnectHub-SPA
```

**Step 3** — Run this exact keytool command
```
keytool -genkey -v -keystore lynkapp-release.keystore -alias lynkapp -keyalg RSA -keysize 2048 -validity 10000
```

**Step 4** — You will be asked a series of questions. Answer them exactly:
```
Enter keystore password: [CHOOSE A STRONG PASSWORD — save it in a password manager]
Re-enter new password:   [same password again]

What is your first and last name?
  → LynkApp Inc

What is the name of your organizational unit?
  → Engineering

What is the name of your organization?
  → LynkApp Inc

What is the name of your City or Locality?
  → [Your city, e.g. New York]

What is the name of your State or Province?
  → [Your state, e.g. New York]

What is the two-letter country code for this unit?
  → US

Is CN=LynkApp Inc, OU=Engineering, O=LynkApp Inc, L=New York, ST=New York, C=US correct?
  → yes

Enter key password for <lynkapp>
  → [Press ENTER to use same password as keystore]
```

**Step 5** — You will see output ending in `[Storing lynkapp-release.keystore]`  
The file `lynkapp-release.keystore` now exists in `ConnectHub-SPA/`.

**⚠️ CRITICAL SECURITY RULES:**
- NEVER commit `lynkapp-release.keystore` to Git (it is already in `.gitignore`)
- Store the keystore file AND password in a password manager (1Password, LastPass, etc.)
- If you lose this keystore, you CANNOT update your app on Google Play — ever
- Back it up to Google Drive or a secure USB drive

---

## BLOCKER 3 — Update assetlinks.json with Real SHA256
**Why:** The assetlinks.json file currently has a placeholder SHA256. App Links won't verify without the real fingerprint.  
**Time estimate:** 10 minutes  
**Depends on:** BLOCKER 1 must be done first

### Step-by-Step:

**Step 1** — Open Command Prompt and navigate to ConnectHub-SPA
```
cd C:\Users\Jnewball\Test-apps\Test-apps\ConnectHub-SPA
```

**Step 2** — Run this command to get the SHA256 fingerprint
```
keytool -list -v -keystore lynkapp-release.keystore -alias lynkapp
```

Enter your keystore password when prompted.

**Step 3** — Look in the output for a line like:
```
SHA256: A1:B2:C3:D4:E5:F6:...
```
Copy the entire SHA256 string (with colons).

**Step 4** — Open the file `ConnectHub-SPA/public/.well-known/assetlinks.json`

Find this line:
```
"sha256_cert_fingerprints": ["REPLACE_WITH_REAL_SHA256_AFTER_KEYSTORE_GENERATED"]
```

Replace it with your real fingerprint (keep the quotes and brackets):
```
"sha256_cert_fingerprints": ["A1:B2:C3:D4:E5:F6:..."]
```

**Step 5** — Save the file, then deploy it to your website so it is accessible at:
```
https://lynkapp.com/.well-known/assetlinks.json
```

The file is already in the correct folder for Firebase Hosting deployment.
Run your normal deploy command: `cd ConnectHub-SPA && npx firebase deploy --only hosting`

---

## BLOCKER 5 — Activate Google Play Billing (install the plugin)
**Why:** The service code is written — you just need to install the npm package.  
**Time estimate:** 20 minutes  
**Depends on:** Node.js must be available

### Step-by-Step:

**Step 1** — Open Command Prompt and navigate to ConnectHub-SPA
```
cd C:\Users\Jnewball\Test-apps\Test-apps\ConnectHub-SPA
```

**Step 2** — Install the in-app purchases plugin
```
npm install @capacitor-community/in-app-purchases
```

**Step 3** — Sync with Android
```
npx cap sync android
```

**Step 4** — Open Android Studio (if not already open)
```
npx cap open android
```
In Android Studio, click "Sync Project with Gradle Files" (elephant icon in toolbar).

**Step 5** — Create your in-app products in Google Play Console:
1. Go to play.google.com/console
2. Select your app → Monetize → In-app products
3. Click "Create product"
4. Create 5 CONSUMABLE products with these exact Product IDs:
   - `coins_100` — Name: "100 LynkCoins" — Price: $0.99
   - `coins_500` — Name: "500 LynkCoins" — Price: $3.99
   - `coins_1000` — Name: "1,000 LynkCoins" — Price: $6.99
   - `coins_5000` — Name: "5,000 LynkCoins" — Price: $24.99
   - `coins_10000` — Name: "10,000 LynkCoins" — Price: $39.99
5. Set each product status to "Active"

**Step 6** — The `google-play-billing-service.js` file is already wired to handle purchases.  
Import it in `BuyCoinsPage.jsx` and check `isNativeMobile()` to switch between Stripe (web) and Play Billing (Android/iOS).

---

## iOS BLOCKER 7 — Get Mac Access or Use Codemagic
**Why:** iOS builds CANNOT be done on Windows. You need a Mac or cloud Mac.  
**Time estimate:** Setting up — 30 minutes to 2 hours

### Option A: Use Codemagic (Recommended — no Mac needed)
The `codemagic.yaml` file is already configured in the repo.

1. Go to **codemagic.io** and sign in with GitHub
2. Connect your `Test-apps` repository
3. Codemagic will detect the `codemagic.yaml` and set up iOS + Android builds automatically
4. You upload your signing certificates through the Codemagic UI
5. Cost: ~$95/month for cloud Mac minutes (cheaper than buying a Mac)

### Option B: Mac Mini or MacBook
If you have or can borrow a Mac:
1. Install Xcode from the Mac App Store (free, ~12GB download)
2. Install Node.js: `brew install node`
3. Clone the repo: `git clone https://github.com/Watchdog088/Test-apps.git`
4. Follow iOS Blockers 8–13 below

---

## iOS BLOCKER 8 — Run `npx cap add ios`
**Why:** Creates the entire iOS Xcode project from scratch.  
**Requires:** Mac with Xcode installed  
**Time estimate:** 30 minutes

### Step-by-Step (on Mac):

**Step 1** — Open Terminal and navigate to ConnectHub-SPA
```
cd /path/to/Test-apps/Test-apps/ConnectHub-SPA
```

**Step 2** — Install dependencies (if not done)
```
npm install
```

**Step 3** — Add iOS platform
```
npx cap add ios
```
This creates the `ConnectHub-SPA/ios/` folder with a full Xcode project.

**Step 4** — Open in Xcode
```
npx cap open ios
```

**Step 5** — In Xcode, select the `App` target → `Signing & Capabilities` tab:
- Team: Select your Apple Developer team
- Bundle Identifier: `com.lynkapp.app` (should already be set)

---

## iOS BLOCKER 9 — Enroll in Apple Developer Program
**Cost:** $99/year  
**Time estimate:** 24–48 hours (Apple review takes time)  
**URL:** https://developer.apple.com/programs/enroll/

### Step-by-Step:
1. Go to developer.apple.com/programs/enroll
2. Sign in with your Apple ID (create one if needed)
3. Choose "Enroll as an Individual" (or Organization if you have a DUNS number)
4. Fill in your name and contact info
5. Pay $99 with a credit/debit card
6. Wait for Apple to approve (usually same day for individuals, up to 48 hours)
7. Once approved, you can access App Store Connect and sign iOS apps

---

## iOS BLOCKER 10 — Register Bundle ID and Firebase iOS App
**Time estimate:** 30 minutes  
**Requires:** Apple Developer enrollment complete

### Register Bundle ID:
1. Go to developer.apple.com → "Certificates, IDs & Profiles"
2. Click "Identifiers" → "+" → "App IDs" → "App"
3. Description: `LynkApp`
4. Bundle ID: `com.lynkapp.app` (Explicit)
5. Capabilities to enable: Push Notifications, Sign In with Apple, In-App Purchase
6. Click "Register"

### Register Firebase iOS App:
1. Go to console.firebase.google.com → Your LynkApp project
2. Click "Add app" → iOS icon
3. iOS bundle ID: `com.lynkapp.app`
4. App nickname: LynkApp iOS
5. Click "Register App"
6. Download `GoogleService-Info.plist`
7. In Xcode, drag `GoogleService-Info.plist` into the `App` folder (check "Add to target: App")

---

## iOS BLOCKER 11 — Install Apple Sign In Plugin
**Why:** Apple REQUIRES Sign In with Apple when any other social sign-in (Google) is offered.  
**Rejection risk if skipped.**  
**Time estimate:** 1 hour  
**Requires:** Mac

### Step-by-Step (on Mac in ConnectHub-SPA directory):

**Step 1** — Install the plugin
```
npm install @capacitor-community/apple-sign-in
npx cap sync ios
```

**Step 2** — In Xcode, add the capability:
- Select the `App` target → "Signing & Capabilities"
- Click "+" → Search "Sign In with Apple" → Double-click to add

**Step 3** — The `AppleSignInButton.jsx` component already exists in the codebase.  
It will work automatically once the plugin is installed and synced.

---

## iOS BLOCKER 12 — Implement StoreKit for iOS Coin Purchases
**Why:** Apple requires ALL digital purchases use StoreKit/IAP. Stripe is not allowed for digital goods.  
**Time estimate:** 2–4 hours  
**Requires:** Mac + Apple Developer enrollment + Products created in App Store Connect

### Step-by-Step:

**Step 1** — Create In-App Purchase products in App Store Connect:
1. Go to appstoreconnect.apple.com
2. Select your LynkApp → "In-App Purchases" → "+"
3. Type: "Consumable"
4. Create these products (same Product IDs as Android):
   - `coins_100` — $0.99
   - `coins_500` — $3.99
   - `coins_1000` — $6.99
   - `coins_5000` — $24.99
   - `coins_10000` — $39.99

**Step 2** — The `@capacitor-community/in-app-purchases` plugin handles both Android AND iOS.  
The `google-play-billing-service.js` service already supports both platforms.  
Run on Mac:
```
npm install @capacitor-community/in-app-purchases
npx cap sync ios
```

**Step 3** — In Xcode, add the capability:
- Select the `App` target → "Signing & Capabilities"
- Click "+" → Search "In-App Purchase" → Double-click to add

**Step 4** — Import the service in `BuyCoinsPage.jsx`:
```js
import { isNativeMobile, purchaseCoins } from '../../services/google-play-billing-service';

// In your buy button handler:
if (isNativeMobile()) {
  const result = await purchaseCoins(productId, user.uid);
  // Handle result
} else {
  // Existing Stripe flow for web
}
```

---

## iOS BLOCKER 13 — Copy PrivacyInfo.xcprivacy into Xcode
**Why:** Apple REQUIRES this file for all apps since iOS 17. Missing it = rejection.  
**Time estimate:** 15 minutes  
**Requires:** Mac with Xcode

### Step-by-Step:

**Step 1** — The file is already created at `ConnectHub-SPA/ios-templates/PrivacyInfo.xcprivacy`

**Step 2** — In Xcode:
1. In the Project Navigator, right-click on the `App` folder
2. Click "Add Files to App..."
3. Navigate to `ConnectHub-SPA/ios-templates/PrivacyInfo.xcprivacy`
4. Check "Add to target: App"
5. Click "Add"

**Step 3** — Verify it appears in the `App` target's Copy Bundle Resources build phase.

---

## AFTER ALL BLOCKERS — Build for Google Play

Once BLOCKERS 1–6 are complete, run the Android build:

```
cd C:\Users\Jnewball\Test-apps\Test-apps\ConnectHub-SPA

REM Build the React web app
npm run build

REM Sync to Android
npx cap sync android

REM Open in Android Studio
npx cap open android
```

In Android Studio:
1. Build → Generate Signed Bundle / APK
2. Choose "Android App Bundle"
3. Select keystore: `lynkapp-release.keystore`
4. Enter your keystore password and alias (`lynkapp`)
5. Build Release
6. Upload the `.aab` file to Google Play Console → Internal Testing

---

## AFTER ALL BLOCKERS — Build for Apple App Store

In Xcode (on Mac):
1. Select any iOS Simulator as destination
2. Product → Archive
3. In Organizer, click "Distribute App"
4. Choose "App Store Connect"
5. Follow the wizard to upload to TestFlight

---

*All code changes (Blockers 2, 4, 5, 6) are committed to GitHub. See SECTION2-APP-STORE-REQUIREMENTS-AUDIT-SEP2026.md for full status.*
