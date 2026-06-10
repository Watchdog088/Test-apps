# LynkApp — Complete Step-by-Step Launch Guide
**Your personal roadmap from zero to beta testers on Web, iOS, and Android**
**Last Updated: June 10, 2026**

---

# 📅 TODAY — Get Web Beta Live (~1 hour)

## STEP 1 — Sign Up for 3 Free Accounts First (15 minutes)

Do these in 3 browser tabs before touching any files.

### A) Sentry (Error monitoring — REQUIRED)
1. Go to: **https://sentry.io/signup/**
2. Sign up with your email
3. Click **"Create Project"**
4. Choose **"React"** as the platform
5. Name it: `lynkapp-frontend`
6. On the next screen you'll see a line like:
   ```
   dsn: "https://abc123@o456789.ingest.sentry.io/1234567"
   ```
7. **Copy that entire DSN URL** — you'll need it in Step 2

### B) Metered.ca TURN Server (Video calls — REQUIRED for mobile)
1. Go to: **https://dashboard.metered.ca/signup**
2. Sign up with your email
3. After login, click **"Create App"** → name it `lynkapp`
4. In the left menu click **"Credentials"**
5. You'll see 3 things — copy all 3:
   - **API Key** (looks like: `abc123def456`)
   - **Username** (looks like: `openrelayproject`)
   - **Credential/Password** (looks like: `xyz789`)
6. Keep this tab open — you'll need these in Step 2

### C) OneSignal Push Notifications (REQUIRED for mobile notifications)
1. Go to: **https://dashboard.onesignal.com/signup**
2. Sign up with your email
3. Click **"New App/Website"**
4. Name it: `LynkApp`
5. Choose **"Web"** push
6. Enter your website: `https://lynkapp.com`
7. Go to **Settings → Keys & IDs**
8. Copy your **OneSignal App ID** (looks like: `a1b2c3d4-1234-5678-abcd-ef1234567890`)
9. Keep this tab open — you'll need this in Step 2

---

## STEP 2 — Edit Your .env File (5 minutes)

1. In VS Code, open this file:
   ```
   C:\Users\Jnewball\Test-apps\Test-apps\ConnectHub-SPA\.env
   ```

2. Find these lines and replace with your real values:

   **Change this:**
   ```
   VITE_SENTRY_DSN=https://YOUR_KEY@oXXXXXX.ingest.sentry.io/XXXXXXX
   ```
   **To your actual Sentry DSN from Step 1A:**
   ```
   VITE_SENTRY_DSN=https://abc123@o456789.ingest.sentry.io/1234567
   ```

   **Change this:**
   ```
   VITE_METERED_API_KEY=your_metered_api_key_here
   VITE_TURN_USERNAME=your_metered_turn_username
   VITE_TURN_PASSWORD=your_metered_turn_password
   ```
   **To your actual Metered credentials from Step 1B:**
   ```
   VITE_METERED_API_KEY=abc123def456
   VITE_TURN_USERNAME=openrelayproject
   VITE_TURN_PASSWORD=xyz789
   ```

   **Change this:**
   ```
   VITE_ONESIGNAL_APP_ID=your_onesignal_app_id_here
   ```
   **To your actual OneSignal ID from Step 1C:**
   ```
   VITE_ONESIGNAL_APP_ID=a1b2c3d4-1234-5678-abcd-ef1234567890
   ```

3. **Save the file** (Ctrl+S)

---

## STEP 3 — Run the Critical Fixes Script (20-30 minutes)

1. Open **File Explorer**
2. Navigate to:
   ```
   C:\Users\Jnewball\Test-apps\Test-apps\ConnectHub-SPA\
   ```
3. Find the file: **`0-critical-fixes.bat`**
4. **Double-click it**
5. A black command window will open — let it run
6. It will ask you to press a key a few times if warnings appear — just press any key
7. When it asks **"firebase login"** — it will open your browser, log in with your Google account linked to Firebase
8. Wait for it to finish — you'll see:
   ```
   CRITICAL FIXES COMPLETE!
   ```

> ⏱️ This takes about 20-30 minutes the first time (npm install is slow). After that it's 5 minutes.

---

## STEP 4 — Test Your Live Site (10 minutes)

1. Open your browser and go to: **https://lynkapp.com**
2. Check these things work:
   - [ ] Page loads (not blank, not error)
   - [ ] You can click "Sign Up" and create an account
   - [ ] After signing up you see the onboarding flow
   - [ ] After onboarding you see the Feed page with demo posts
   - [ ] You can like a post
   - [ ] You can tap/click Stories at the top
   - [ ] Messages section opens
   - [ ] Dating section opens and shows profiles to swipe

3. **Test on your phone too:**
   - Open Chrome on your Android phone → go to `https://lynkapp.com`
   - Open Safari on your iPhone → go to `https://lynkapp.com`
   - Both should look like a mobile app, not a desktop website

4. **Install it as PWA (works like a native app without app store):**
   - **iPhone:** In Safari tap the Share button (box with arrow) → "Add to Home Screen"
   - **Android:** In Chrome tap the 3-dot menu → "Add to Home Screen" or "Install App"
   - It will appear on your home screen like a real app with the LynkApp icon

---

## STEP 5 — Invite Your First Beta Testers (5 minutes)

Send this message to 5-10 trusted friends/testers:

> "Hey! I'm launching LynkApp and need beta testers. It's a social media app with dating, live streaming, marketplace, groups, and more. Can you test it for me? Go to https://lynkapp.com/invite to sign up. On iPhone open in Safari and tap 'Add to Home Screen'. On Android open in Chrome and tap 'Add to Home Screen'. It works like a real app!"

✅ **Your web beta is now LIVE. Testers can use it right now.**

---

---

# 📅 THIS WEEK (Days 2-7) — Fix Payments & Email

## STEP 6 — Set Up Stripe (Real Payments)

> Skip this if testers won't be buying things yet. Use it when you're ready for the Marketplace.

1. Go to: **https://dashboard.stripe.com/register**
2. Create account with your business email
3. Go to **Developers → API Keys**
4. Copy **Publishable key** (starts with `pk_test_`)
5. Copy **Secret key** (starts with `sk_test_`)
6. Open `ConnectHub-SPA/.env` and update:
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_REAL_KEY_HERE
   ```
7. Open `ConnectHub-Backend/.env` and add:
   ```
   STRIPE_SECRET_KEY=sk_test_YOUR_REAL_KEY_HERE
   ```
8. Set up Stripe Webhook:
   - In Stripe Dashboard → **Developers → Webhooks → Add Endpoint**
   - Endpoint URL: `https://api.lynkapp.com/api/webhooks/stripe`
   - Select events: `payment_intent.succeeded` and `payment_intent.payment_failed`
   - Copy the **Webhook Signing Secret** and add to `ConnectHub-Backend/.env`:
     ```
     STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
     ```
9. After updating `.env` files, redeploy by double-clicking:
   ```
   ConnectHub-SPA\DEPLOY-LYNKAPP.bat
   ```
   (just press Enter when it runs — it defaults to `hosting` mode)

> ⚠️ **Keep `pk_test_` and `sk_test_` during beta. Only switch to live keys when you want real money to flow.**

---

## STEP 7 — Set Up Mailgun (Email Notifications)

> This goes in the BACKEND .env, not the frontend.

1. Go to: **https://signup.mailgun.com**
2. Create account (free: 1,000 emails/month)
3. In the Mailgun Dashboard:
   - Click **"Add a domain"**
   - Use: `mail.lynkapp.net` (or if you don't have a domain yet, use the sandbox domain they give you)
4. They'll give you DNS records — add them to your domain registrar (GoDaddy, Namecheap, etc.)
   - This can take up to 24 hours to verify
5. Once verified, go to **API Keys** and copy your **Private API Key**
6. Open `ConnectHub-Backend/.env` and add:
   ```
   MAILGUN_API_KEY=key-YOUR_PRIVATE_API_KEY
   MAILGUN_DOMAIN=mail.lynkapp.net
   MAILGUN_FROM=noreply@lynkapp.net
   ```
7. **Do NOT add Mailgun keys to the frontend .env** — they must stay in the backend only

---

## STEP 8 — Run the Week 1 Services Check

Run this to verify all your Week 1 services are configured:

1. Navigate to: `C:\Users\Jnewball\Test-apps\Test-apps\ConnectHub-SPA\`
2. **Double-click: `week-1-services-setup.bat`**
3. It will tell you which services are configured and which are missing
4. Fix anything it says is missing

---

---

# 📅 WEEK 2 — Native iOS App (Requires Mac)

> ⚠️ **iOS builds CANNOT be done on Windows. You need a Mac with Xcode.**
> If you don't have a Mac, skip to Week 2 Android section below.

## STEP 9 — Apple Developer Account

1. Go to: **https://developer.apple.com/programs/enroll/**
2. Sign in with your Apple ID (or create one)
3. Pay **$99/year** to enroll
4. Wait for approval (usually same day, sometimes up to 2 days)

---

## STEP 10 — Run Capacitor Setup (Windows PC — do this first)

1. Navigate to: `C:\Users\Jnewball\Test-apps\Test-apps\ConnectHub-SPA\`
2. **Double-click: `week-2-capacitor-setup.bat`**
3. Wait for it to install all packages and create the `ios/` and `android/` folders
4. When it's done you'll see instructions printed in the window
5. **The `ios/` folder now needs to be moved to your Mac**

---

## STEP 11 — Transfer iOS Folder to Mac

**Option A: USB Drive**
1. Copy the entire `ConnectHub-SPA/ios/` folder to a USB drive
2. Plug into Mac and copy to your Mac desktop

**Option B: iCloud Drive / Google Drive**
1. Upload `ConnectHub-SPA/ios/` folder to your cloud storage
2. Download on your Mac

**Option C: GitHub (already pushed)**
1. On your Mac, open Terminal
2. Run:
   ```bash
   git clone https://github.com/Watchdog088/Test-apps.git
   cd Test-apps/ConnectHub-SPA
   npm install
   npx cap sync ios
   ```

---

## STEP 12 — Build iOS App in Xcode (On Mac)

1. On your Mac, open Terminal in the `ConnectHub-SPA` folder
2. Run:
   ```bash
   npx cap open ios
   ```
3. Xcode will open automatically
4. In Xcode, look at the left panel — click on **"App"** (the blue icon at the top)
5. Under **"Signing & Capabilities"**:
   - **Team:** Select your Apple Developer account (the $99 one)
   - **Bundle Identifier:** Change to `com.lynkapp.app`
6. Under **"General"**:
   - **Version:** `1.0.0`
   - **Build:** `1`
7. In the top menu click **Product → Run** to test on a simulator first
8. Make sure it loads and looks correct
9. Then go to **Product → Archive**
10. Wait for archive to complete
11. Click **"Distribute App"**
12. Choose **"TestFlight & App Store Connect"**
13. Follow the prompts — you'll need to log in with your Apple Developer account
14. After upload go to: **https://appstoreconnect.apple.com**
15. Find your app → **TestFlight** tab → Add your testers' email addresses
16. Testers will get an email with a link to download TestFlight and install your app

> ✅ TestFlight allows up to 10,000 beta testers with no App Store review!

---

---

# 📅 WEEK 2 — Native Android App

## STEP 13 — Install Android Studio (Windows PC)

1. Go to: **https://developer.android.com/studio**
2. Download and install Android Studio
3. During setup, install the Android SDK and emulator

---

## STEP 14 — Set Up Google Play Console

1. Go to: **https://play.google.com/console/signup**
2. Pay **$25 one-time fee**
3. Complete your developer profile

---

## STEP 15 — Add Firebase Config for Android

1. Go to: **https://console.firebase.google.com**
2. Select your project: `lynkapp-c7db1`
3. Click the **gear icon** → **Project Settings**
4. Under **"Your apps"** click **"Add app"** → choose **Android**
5. Package name: `com.lynkapp.app`
6. App nickname: `LynkApp Android`
7. Click **"Register app"**
8. Download the file: **`google-services.json`**
9. Place it here: `ConnectHub-SPA/android/app/google-services.json`

---

## STEP 16 — Build Android App

1. On your PC, navigate to `ConnectHub-SPA/`
2. Run in Command Prompt:
   ```
   npx cap open android
   ```
3. Android Studio opens
4. In `android/app/build.gradle` verify:
   ```
   applicationId "com.lynkapp.app"
   minSdkVersion 24
   targetSdkVersion 34
   versionCode 1
   versionName "1.0.0"
   ```
5. Click **Build → Generate Signed Bundle / APK**
6. Choose **"Android App Bundle"** (AAB format — required for Play Store)
7. Click **"Create new..."** to create a keystore:
   - Key store path: `C:\Users\Jnewball\lynkapp-release-key.jks`
   - Password: choose a strong password
   - Alias: `lynkapp`
   - Fill in the certificate info
   - **⚠️ BACK UP THIS .jks FILE AND PASSWORD — you can NEVER recover it if lost!**
8. Click **Next → Release → Finish**
9. The .aab file will be created in:
   `android/app/release/app-release.aab`

---

## STEP 17 — Upload to Google Play Internal Testing

1. Go to: **https://play.google.com/console**
2. Click **"Create app"**
3. Fill in:
   - App name: `LynkApp`
   - Default language: `English (United States)`
   - Type: `App`
   - Free or Paid: `Free`
4. In the left menu go to **Testing → Internal testing**
5. Click **"Create new release"**
6. Upload your `.aab` file
7. Add release notes: `Beta v1.0 - Initial beta release`
8. Click **"Save and Publish"**
9. Go to **Testers** tab → Add your testers' email addresses
10. Copy the **opt-in URL** and share it with testers
11. **Testers can download it within minutes — no Google review needed for internal testing!**

---

---

# 📅 WEEK 3 — App Store Submission (iOS Public Beta)

> Only do this after TestFlight testing is successful

## STEP 18 — Prepare App Store Listing

1. Go to: **https://appstoreconnect.apple.com**
2. Click your app → **"App Store"** tab
3. Fill in:
   - **Name:** LynkApp
   - **Subtitle:** Connect, Create & Discover
   - **Description:** Write 2-3 paragraphs about what the app does
   - **Keywords:** social media, dating, live streaming, marketplace, messaging
   - **Support URL:** https://lynkapp.com/help
   - **Marketing URL:** https://lynkapp.com
4. **Screenshots required:**
   - iPhone 6.7" (iPhone 14 Pro Max size): minimum 3 screenshots
   - iPhone 5.5": minimum 3 screenshots
   - To get screenshots: Run the app in Xcode Simulator → File → Screenshot
5. Set **Age Rating** using the questionnaire
6. **Price:** Free
7. Click **"Submit for Review"**
8. Apple reviews in **24-48 hours** for most apps

---

## STEP 19 — Prepare Play Store Listing

1. Go to: **https://play.google.com/console**
2. Click your app → **"Store presence → Main store listing"**
3. Fill in:
   - **App name:** LynkApp
   - **Short description** (80 chars max): Your all-in-one social connection app
   - **Full description** (4000 chars max): Write about all the features
4. **Graphics required:**
   - **Icon:** 512×512 PNG (use your LynkApp logo)
   - **Feature graphic:** 1024×500 PNG (banner image)
   - **Screenshots:** Min 2 phone screenshots (take from emulator or real device)
5. Under **"Content rating"** → complete the questionnaire
6. Under **"Data safety"** → fill in what data you collect
7. Move from Internal Testing → Open Testing or Production
8. Google reviews in **2-3 days** for initial submission

---

---

# 📅 ANYTIME AFTER BETA — Final Polish

## STEP 20 — Switch to Live Stripe Keys

> Only when you're ready for real money (not during beta!)

1. Go to: **https://dashboard.stripe.com** → switch off Test mode
2. Copy your **live** `pk_live_` and `sk_live_` keys
3. Update both `.env` files
4. Run `0-critical-fixes.bat` again to redeploy

---

## STEP 21 — Apply for Google AdSense

> Requires 6+ months of active content and real users

1. Go to: **https://adsense.google.com/start/**
2. Apply with `lynkapp.com`
3. After approval (can take 2-4 weeks), get your publisher ID
4. Update in `ConnectHub-SPA/.env`:
   ```
   VITE_ADSENSE_PUBLISHER_ID=ca-pub-YOUR_REAL_ID
   ```

---

---

# 🔄 HOW TO REDEPLOY AFTER ANY CODE CHANGE

Every time you make a change to the code:

1. Open `ConnectHub-SPA/` folder in File Explorer
2. Double-click: **`DEPLOY-LYNKAPP.bat`**
3. It will build and push to Firebase automatically
4. Your live site at https://lynkapp.com updates in ~2 minutes

---

# 🆘 TROUBLESHOOTING

| Problem | Solution |
|---------|---------|
| `0-critical-fixes.bat` fails with "firebase not found" | Run `npm install -g firebase-tools` in Command Prompt first |
| `0-critical-fixes.bat` fails with "not logged in" | Run `firebase login` in Command Prompt |
| Build fails with red errors | Screenshot the error and ask Cline to fix it |
| Site shows blank page | Check browser console (F12) for errors |
| Video calls don't work on mobile data | Make sure Metered.ca TURN keys are in `.env` |
| Push notifications not working | Make sure OneSignal App ID is in `.env` |
| Android build fails | Make sure `google-services.json` is in `android/app/` |
| iOS build fails | Make sure you have Apple Developer account selected in Xcode |

---

# 📋 QUICK REFERENCE — All URLs You Need

| Service | URL | What For |
|---------|-----|---------|
| Firebase Console | https://console.firebase.google.com | Database, hosting, auth |
| Sentry | https://sentry.io | Error monitoring |
| Metered.ca | https://dashboard.metered.ca | Video call TURN server |
| OneSignal | https://dashboard.onesignal.com | Push notifications |
| Stripe | https://dashboard.stripe.com | Payments |
| Mailgun | https://app.mailgun.com | Email |
| App Store Connect | https://appstoreconnect.apple.com | iOS app management |
| Google Play Console | https://play.google.com/console | Android app management |
| Apple Developer | https://developer.apple.com | Apple account ($99/yr) |
| Your live app | https://lynkapp.com | The actual app! |

---

*Guide created: June 10, 2026 — LynkApp v1.0 Beta Launch*
