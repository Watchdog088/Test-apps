# LynkApp — Web Beta Launch: Detailed Step-by-Step Guide
## Steps 1 through 5 (Do Today — June 10/11, 2026)
**Estimated total time: 2-3 hours**
**Goal: Get https://lynkapp.net ready for your first 20-50 beta testers**

---

## ✅ STEP 0 — Already Done (No Action Needed)
The following was already completed for you:
- Metered TURN credentials updated to Jun-02-2026 credentials ✅
- `VITE_API_BASE_URL` cleared (was pointing to fake domain `api.connecthub.com`) ✅
- All code changes pushed to GitHub ✅

---

## STEP 1 — Verify Cloudinary Upload Preset
**What it does:** Allows users to upload profile photos and marketplace listing images.
**Why it matters:** If the preset doesn't exist or is "Signed", every photo upload will silently fail.
**Time: 5 minutes**

### Instructions:
1. Open your browser and go to: **https://cloudinary.com/console**
2. Log in with your Cloudinary account
   - Your cloud name is: `do6ue7mgf`
3. In the left sidebar, click **Settings** (gear icon at bottom)
4. Click the **Upload** tab at the top
5. Scroll down to the section called **"Upload presets"**
6. Look for a preset named **`marketplace_unsigned`**

### If the preset EXISTS:
- Click the pencil/edit icon next to it
- Make sure **"Signing Mode"** is set to **"Unsigned"** (not Signed)
- Make sure **"Folder"** is set to `lynkapp/uploads` (or leave blank — either is fine)
- Click **Save** → ✅ Done, proceed to Step 2

### If the preset does NOT exist:
1. Click **"Add upload preset"** button
2. Set **Preset name** to: `marketplace_unsigned`
3. Set **Signing Mode** to: **Unsigned**
4. Set **Folder** to: `lynkapp/uploads`
5. Under **"Access Mode"**, select: **Public**
6. Click **Save** → ✅ Done, proceed to Step 2

### How to verify it works (optional):
- After deploying (Step 3), go to `https://lynkapp.net`
- Sign in → go to Profile → tap Edit Profile → try uploading a photo
- If the photo uploads and shows your image, Cloudinary is working ✅

---

## STEP 2 — Verify .env File (Already Fixed — Just Confirm)
**What it does:** Ensures the app connects to Firebase (your real database) instead of a non-existent API.
**Time: 2 minutes**

### Instructions:
1. In VS Code, open the file: `ConnectHub-SPA/.env`
2. Find the line that says `VITE_API_BASE_URL=`
3. **Confirm it is BLANK** (empty after the `=` sign):
   ```
   VITE_API_BASE_URL=
   VITE_WEBSOCKET_URL=
   ```
   ✅ This was already fixed for you. If you see `https://api.connecthub.com` it was NOT applied — re-check.

4. Also confirm Firebase keys are present (they should be):
   ```
   VITE_FIREBASE_API_KEY=AIzaSyDmnKjhl--S69dWqaVSgCgJZcMqTsyQgwA
   VITE_FIREBASE_PROJECT_ID=lynkapp-c7db1
   ```
   ✅ These are correct — no changes needed.

5. **IMPORTANT:** Do NOT commit `.env` to git. It is already in `.gitignore` so this is automatic.

---

## STEP 3 — Run 0-critical-fixes.bat (Build + Deploy)
**What it does:** Installs packages, builds the React app into production files, and deploys to Firebase Hosting at https://lynkapp.net
**Time: 15-25 minutes (first run may take longer)**

### Pre-check: Make sure you are logged into Firebase
Open a command prompt and run:
```
firebase login
```
If it opens a browser asking you to sign in — sign in with `CEO@lynkapp.net` (the Google account that owns the Firebase project `lynkapp-c7db1`). Once logged in, the terminal will say "Success! Logged in as CEO@lynkapp.net"

### Run the bat file:
1. Open **File Explorer**
2. Navigate to: `C:\Users\Jnewball\Test-apps\Test-apps\ConnectHub-SPA\`
3. Double-click: **`0-critical-fixes.bat`**
   - OR right-click → **Run as administrator** (recommended)

### What you will see:
The window will run through 6 steps automatically:
```
[1/6] Checking .env for required keys...   ← Should pass with no errors
[2/6] Installing npm dependencies...       ← May take 2-5 minutes first time
[3/6] Building production bundle...        ← Takes 1-3 minutes, watch for errors
[4/6] Deploying to Firebase Hosting...     ← Takes 1-2 minutes
[5/6] Setting up admin account...          ← Seeds your CEO admin profile
[6/6] Seeding demo content...              ← Creates demo posts/profiles
```

### If Build Fails (Step 3/6 error):
- Look for the error message in red
- Common issue: "Cannot find module" → run `npm install` manually first
- Common issue: "VITE_..." undefined → make sure `.env` file exists in `ConnectHub-SPA/`

### If Firebase Deploy Fails (Step 4/6 error):
- Error "not logged in" → open a CMD window and type `firebase login` first
- Error "project not found" → open CMD and type `firebase use lynkapp-c7db1`
- Error "hosting site not configured" → open CMD and type `firebase init hosting`

### When it finishes successfully, you will see:
```
============================================================
 CRITICAL FIXES COMPLETE!
============================================================
 Next Steps:
 1. Test the live site: https://lynkapp.com   ← Note: this says .com but your site is .net
 2. Sign in and verify the feed has content
```

### After it finishes:
- Open Chrome and go to: **https://lynkapp.net**
- You should see the LynkApp login/landing page load ✅

---

## STEP 4 — Run seed-demo-content.cjs (Populate the Feed)
**What it does:** Creates fake demo posts, profiles, and stories in Firestore so that when beta testers sign up, they don't see a completely empty feed.
**Time: 3-5 minutes**

**Note:** The `0-critical-fixes.bat` in Step 3 already tries to run this automatically (Step 6/6). If it said "Demo content seeded successfully" — you can SKIP this step.

### Only do this if Step 3 showed "seed-demo-content.cjs not found" or it failed:

1. Open a **Command Prompt** (Windows key → type "cmd" → Enter)
2. Navigate to the ConnectHub-SPA folder:
   ```
   cd C:\Users\Jnewball\Test-apps\Test-apps\ConnectHub-SPA
   ```
3. Run the seed script:
   ```
   node seed-demo-content.cjs
   ```
4. Wait for it to finish. You should see output like:
   ```
   Creating demo users...
   Creating demo posts...
   Creating demo stories...
   ✅ Demo content seeded successfully!
   ```

### If it shows an error "serviceAccountKey.json not found":
The seed script needs admin Firebase access. Run this instead:
1. Make sure `serviceAccountKey.json` is in the `ConnectHub-SPA/` folder
2. The file should already be there — check: `ConnectHub-SPA/serviceAccountKey.json`
3. If it's missing, download a new one:
   - Go to **https://console.firebase.google.com**
   - Open project: **lynkapp-c7db1**
   - Click gear icon → **Project Settings** → **Service Accounts** tab
   - Click **"Generate new private key"**
   - Save the downloaded `.json` file as `serviceAccountKey.json` in `ConnectHub-SPA/`
4. Then re-run: `node seed-demo-content.cjs`

### Verify it worked:
1. Go to **https://lynkapp.net**
2. Sign in (or create a new account)
3. The Home/Feed page should now show demo posts ✅

---

## STEP 5 — Share https://lynkapp.net/beta with Your First Testers
**What it does:** Sends beta testers to a special welcome page that explains the beta, shows known limitations, and includes a feedback button.
**Time: 10 minutes to set up your invite list**

### Verify the beta welcome page works:
1. Open Chrome (or Safari on your phone)
2. Go to: **https://lynkapp.net/beta**
3. You should see the "Welcome to LynkApp Beta!" page with:
   - A welcome message
   - A list of features to try
   - A "Get Started" button

### What to tell your beta testers:
Send them this message (customize as needed):

---
**Subject: You're invited to test LynkApp — the new social platform!**

Hi [Name],

I'd like to invite you to be one of the first beta testers for LynkApp — a new social platform I've been building.

**How to access it:**
👉 Go to: **https://lynkapp.net/beta**

**What to do:**
1. Click "Get Started" on the welcome page
2. Create a free account with your email
3. Explore the app — try posting, messaging, the dating feature, marketplace, live streaming
4. Use the **blue feedback button** (bottom right corner) to report any bugs or suggestions

**What to know:**
- This is a BETA — some features may be incomplete or have bugs
- Your feedback is extremely valuable and will shape the final product
- Please test on both desktop and mobile if possible

Thank you for helping make LynkApp better!

— Jeremy / LynkApp Team

---

### Recommended first testers (5-10 people):
- People you trust to give honest feedback
- Mix of iPhone and Android users
- Mix of tech-savvy and non-technical users
- People in different age groups (the dating feature especially needs diverse testers)

### How to monitor feedback:
1. Go to **https://lynkapp.net/admin** (must be logged in as admin)
2. Click **"Beta Dashboard"** in the left menu
3. You'll see all feedback submissions in real-time

### How to monitor errors:
1. Go to **https://sentry.io/organizations/lynkapp/**
2. Log in with your Sentry account
3. Any crashes or JavaScript errors will appear here automatically

---

## ✅ CHECKLIST — Confirm Everything is Working

After completing all 5 steps, run through this quick smoke test:

**On Desktop Chrome:**
- [ ] https://lynkapp.net loads without error
- [ ] https://lynkapp.net/beta shows the welcome page
- [ ] Can create a new account (sign up with email)
- [ ] Feed shows demo posts after signing up
- [ ] Can create a new post (text + photo)
- [ ] Stories strip visible at top of feed
- [ ] Messages section opens and shows empty inbox

**On Mobile (your phone's browser — Chrome/Safari):**
- [ ] https://lynkapp.net loads correctly on mobile
- [ ] Bottom navigation bar is visible
- [ ] Can tap each tab (Home, Dating, Messages, Profile, etc.)
- [ ] Stories strip is horizontally scrollable
- [ ] Dating swipe cards display correctly

**On Mobile (profile photo upload test):**
- [ ] Go to Profile → Edit Profile
- [ ] Tap the camera icon to change photo
- [ ] Select a photo from your camera roll
- [ ] Photo uploads and shows in preview ← this tests Cloudinary (Step 1)

---

## ⚠️ KNOWN ISSUES TO TELL BETA TESTERS

Include this in your beta tester communication so they aren't confused:

1. **Checkout/Payments** — The Stripe checkout is in TEST mode. Use card number `4242 4242 4242 4242`, any future expiry, any CVC. Real payments are NOT charged.
2. **Video Calls** — P2P video calls work best on WiFi. On mobile data, calls may take up to 30 seconds to connect.
3. **Email Verification** — After signing up, check your spam folder for the verification email.
4. **Empty States** — Some sections (Gaming Hub, Music) may show limited content — this is expected in beta.
5. **Push Notifications** — Browser push notifications require you to click "Allow" when prompted.

---

## AFTER STEP 5 — What Comes Next?

Once you have beta testers on the web:

| Action | When | Who Does It |
|--------|------|------------|
| Fix bugs reported by testers | Daily | You + Cline |
| Android APK build | June 14-18 | You (run `week-2-capacitor-setup.bat`) |
| iOS TestFlight | June 21-28 | You (needs macOS + Apple Dev account) |
| Second wave of beta testers (50+) | July 1 | You |

---

*Document created: June 10, 2026*
*Reference file: LYNKAPP-FULL-ASSESSMENT-AND-BETA-PLAN.md*
