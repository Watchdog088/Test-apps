# 🚀 LynkApp — Complete Beta Launch Guide
## Every Step, In Order, From Right Now To Live Beta Testers
**Created: June 4, 2026**  
**App:** https://lynkapp.net  
**Dev Server:** http://localhost:5173  

---

## 📊 WHERE YOU ARE RIGHT NOW

The app is **~95% complete**. The code is done. The React app runs. Firebase is configured.
What's left is all **setup & deployment** — not building new features.

Here's the exact checklist of everything remaining:

| # | Task | Time Needed | Can Skip for Beta? |
|---|------|-------------|-------------------|
| 1 | Firebase Login + Deploy Rules & Functions | 10 min | ❌ NO — security risk if skipped |
| 2 | Create CEO Admin Account | 5 min | ❌ NO — you need admin access |
| 3 | Add TURN Server for Video Calls | 10 min | ⚠️ CAN SKIP but video calls will fail on phones |
| 4 | Add Sentry Error Monitoring | 5 min | ✅ Can skip, add later |
| 5 | Build Production Bundle | 5 min | ❌ NO — required before deploy |
| 6 | Deploy to Firebase Hosting (lynkapp.net) | 5 min | ❌ NO — this IS the deploy |
| 7 | Smoke Test (manual check 15 things) | 30 min | ❌ NO — find bugs before testers do |
| 8 | Invite Beta Testers | Up to you | — |

**Total time: ~70 minutes if you do everything in one session.**

---

---

# ═══════════════════════════════════════════
# STEP 1 — LOG INTO FIREBASE CLI
# Time: ~5 minutes
# ═══════════════════════════════════════════

**What this does:** Authenticates your computer with Firebase so you can deploy.

**How:**

1. Open **File Explorer**
2. Navigate to: `C:\Users\Jnewball\Test-apps\Test-apps\ConnectHub-SPA\`
3. Double-click the file: **`1-firebase-login.bat`**
4. A browser window will open automatically
5. Sign in with the **Google account that owns your Firebase project**
   - This is the Google account you used when you created the Firebase project
   - It's the account at https://console.firebase.google.com
6. After signing in, the browser says "Firebase CLI Login Successful"
7. Go back to the black command window — it should say:
   ```
   ✔  Success! Logged in as yourname@gmail.com
   ```
8. Press any key to close that window

✅ **Done when:** You see "Logged in as [your email]"

**⚠️ Trouble?**
- If the browser doesn't open: look in the command window for a URL — paste it manually into Chrome
- If it says "already logged in": that's fine, continue to Step 2
- If it asks to pick a project: just close and continue — the project is already set in `.firebaserc`

---

---

# ═══════════════════════════════════════════
# STEP 2 — DEPLOY FIRESTORE RULES + CLOUD FUNCTIONS
# Time: ~5 minutes
# ═══════════════════════════════════════════

**What this does:**
- Pushes the Firestore security rules to Firebase (blocks users from hacking admin access)
- Deploys the `setAdminRole`, `removeAdminRole`, `checkAdminStatus`, and `makeFirstAdmin` Cloud Functions
- Without this: ANY logged-in user could make themselves admin from the browser console

**How:**

1. In the same `ConnectHub-SPA/` folder
2. Double-click: **`2-deploy-rules-and-functions.bat`**
3. Wait — it will install function dependencies first (takes ~1-2 minutes)
4. Then it deploys the rules
5. Then it deploys the functions

**You should see something like this:**
```
Installing Cloud Function dependencies...
added 47 packages in 23s

Deploying Firestore security rules...
✔  firestore: released rules

Deploying Cloud Functions...
✔  functions: deployed setAdminRole
✔  functions: deployed removeAdminRole
✔  functions: deployed checkAdminStatus
✔  functions: deployed makeFirstAdmin

SUCCESS! Rules + Functions deployed to Firebase.
```

✅ **Done when:** You see all green checkmarks

**⚠️ Trouble?**
- If it says "not logged in": Go back and redo Step 1
- If functions fail with "Node version" error: Open VS Code terminal and run:
  ```
  cd ConnectHub-SPA/functions
  npm install --legacy-peer-deps
  cd ..
  ```
  Then run the bat file again
- If it says "project not found": Check `ConnectHub-SPA/.firebaserc` — it should have your project ID

---

---

# ═══════════════════════════════════════════
# STEP 3 — CREATE YOUR CEO ADMIN ACCOUNT
# Time: ~10 minutes (most time is downloading a file)
# ═══════════════════════════════════════════

This creates your `CEO@lynkapp.net` account and gives it admin access so you can access the admin dashboard.

## PART A — Get Your Service Account Key

1. Open your browser and go to: **https://console.firebase.google.com**
2. Click on your LynkApp project
3. Click the **⚙️ gear icon** (top left, next to "Project Overview")
4. Click **"Project Settings"**
5. Click the **"Service Accounts"** tab at the top of that page
6. Click the blue **"Generate new private key"** button
7. Click **"Generate key"** in the popup
8. A JSON file downloads automatically (will have a long name)
9. **Rename the file to exactly:** `serviceAccountKey.json`
   - Right-click the downloaded file → Rename → type `serviceAccountKey.json`
10. **Move it to:** `C:\Users\Jnewball\Test-apps\Test-apps\ConnectHub-SPA\`
    - Cut and paste the file into that folder
    - It should sit next to `package.json` and `seed-ceo-admin.js`

## PART B — Run the Seed Script

1. In File Explorer, inside `ConnectHub-SPA/`
2. Double-click: **`run-ceo-admin.bat`**

**You should see:**
```
🚀  LynkApp CEO Admin Seeder
════════════════════════════════════════
📧  Email    : CEO@lynkapp.net
👤  Name     : LynkApp CEO
🔑  Password : LynkApp@CEO2026!  ← CHANGE AFTER FIRST LOGIN!
════════════════════════════════════════

✅  Firebase Auth: created new account → UID: abc123xyz
✅  Firestore: users/abc123xyz written with role: 'admin'
✅  Admin log written

🎉  CEO Admin account ready!
```

## PART C — Delete the Service Account Key (IMPORTANT!)

**Do this immediately after the script runs successfully.**

1. In `ConnectHub-SPA/` folder
2. Delete the file `serviceAccountKey.json`
   - Right-click → Delete, or select it and press Delete key
3. Empty your Recycle Bin too

**Why:** This file gives anyone who has it FULL admin access to your entire Firebase project. It's only needed for this one step.

✅ **Done when:** Script ran successfully AND you deleted `serviceAccountKey.json`

**⚠️ Trouble?**
- If script says "serviceAccountKey.json not found": Make sure you put the file in `ConnectHub-SPA/` — NOT in a subfolder
- If script says "Permission denied": The service account key must be for the same Firebase project as your app. Check `ConnectHub-SPA/src/firebase/config.js` for the `projectId` and compare it to what's in the Firebase Console
- If script says "Email already exists": The account was already created — that's fine, skip to Part C

---

---

# ═══════════════════════════════════════════
# STEP 4 — ADD TURN SERVER (For Video Calls on Mobile)
# Time: ~10 minutes
# Can skip for initial beta — video calls will fail on cell networks without this
# ═══════════════════════════════════════════

**What this does:** Makes video calls work on mobile carrier networks (4G/5G). Without a TURN server, video calls only work on WiFi — they fail on most cell networks.

**Can you skip it?** For an initial small beta on WiFi, yes. But you should do it before a broader launch.

## Create a Free TURN Server (Metered.ca — Free)

1. Go to: **https://dashboard.metered.ca/signup**
2. Create a free account — no credit card needed
3. Once logged in, click **"Applications"** in the left sidebar
4. Click **"+ Create Application"**
5. Name it: `LynkApp`
6. Click on your new `LynkApp` application
7. Click the **"TURN Credentials"** tab
8. You'll see a **Username** and a **Credential** (password) — keep this tab open

## Add It to Your Code

1. Open VS Code
2. Open the file: `ConnectHub-SPA/src/services/livestream-webrtc.js`
3. Press **Ctrl+F** and search for: `stun:stun.l.google.com`
4. You'll find a block that looks like this:
   ```javascript
   iceServers: [
     { urls: 'stun:stun.l.google.com:19302' },
   ]
   ```
5. Replace those lines with:
   ```javascript
   iceServers: [
     { urls: 'stun:stun.l.google.com:19302' },
     {
       urls: 'turn:relay.metered.ca:80',
       username: 'PASTE_YOUR_USERNAME_FROM_METERED_HERE',
       credential: 'PASTE_YOUR_CREDENTIAL_FROM_METERED_HERE'
     },
     {
       urls: 'turn:relay.metered.ca:443',
       username: 'PASTE_YOUR_USERNAME_FROM_METERED_HERE',
       credential: 'PASTE_YOUR_CREDENTIAL_FROM_METERED_HERE'
     }
   ]
   ```
6. Replace the `PASTE_YOUR_...` placeholders with your actual Username and Credential from Metered
7. Press **Ctrl+S** to save

✅ **Done when:** File saved with real Metered credentials

---

---

# ═══════════════════════════════════════════
# STEP 5 — ADD SENTRY ERROR MONITORING (Optional but Recommended)
# Time: ~5 minutes
# ═══════════════════════════════════════════

**What this does:** Sends you an email/alert whenever a real user hits an error in the app. You'll see exactly what crashed, in what file, on what line.

1. Go to: **https://sentry.io** — sign up free
2. Click **"Create Project"** → select **"React"** → name it `LynkApp`
3. Sentry will show you a DSN key that looks like:
   ```
   https://abc123def456@o789012.ingest.sentry.io/3456789
   ```
4. Open VS Code → open `ConnectHub-SPA/.env`
5. Find the line that says:
   ```
   # VITE_SENTRY_DSN=
   ```
6. Change it to (remove the # and add your key):
   ```
   VITE_SENTRY_DSN=https://YOUR_ACTUAL_KEY@o123456.ingest.sentry.io/YOUR_PROJECT_ID
   ```
7. Save the file

✅ **Done when:** `.env` file saved with real Sentry DSN

---

---

# ═══════════════════════════════════════════
# STEP 6 — BUILD THE PRODUCTION APP
# Time: ~3-5 minutes
# ═══════════════════════════════════════════

**What this does:** Compiles all your React code into optimized HTML/JS/CSS files that browsers can load fast.

**IMPORTANT:** You must rebuild every time you change code or `.env` variables.

**How:**

1. In VS Code, open the Terminal (press **Ctrl+`** or go to Terminal → New Terminal)
2. Type these commands one at a time:
   ```bash
   cd ConnectHub-SPA
   npm run build
   ```
3. Wait for it to finish (~2-4 minutes)

**You should see:**
```
vite v5.x.x building for production...
✓ 847 modules transformed.
dist/index.html                   0.50 kB
dist/assets/index-abc123.js     892.34 kB
dist/assets/index-xyz789.css     45.67 kB
✓ built in 3.42s
```

✅ **Done when:** You see "✓ built in X.XXs" with no red errors

**⚠️ Trouble?**
- If you get red errors: Read the error message carefully. The most common issue is a missing import or syntax error. Ask me and paste the exact error.
- If it says "out of memory": Run `set NODE_OPTIONS=--max-old-space-size=4096` in the terminal first, then try again

---

---

# ═══════════════════════════════════════════
# STEP 7 — DEPLOY TO FIREBASE HOSTING (Push to lynkapp.net)
# Time: ~2-3 minutes
# ═══════════════════════════════════════════

**What this does:** Uploads your built app to Firebase Hosting so it's live at https://lynkapp.net

**How:**

In the same VS Code terminal (still in `ConnectHub-SPA/`):
```bash
"C:\Users\Jnewball\AppData\Roaming\npm\firebase.cmd" deploy --only hosting
```

**You should see:**
```
=== Deploying to 'your-project-id'...

i  deploying hosting
i  hosting[your-project-id]: beginning deploy...
i  hosting[your-project-id]: found 847 files in dist
✔  hosting[your-project-id]: file upload complete
i  hosting[your-project-id]: finalizing version...
✔  hosting[your-project-id]: version finalized
✔  hosting[your-project-id]: release complete

✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/your-project-id/overview
Hosting URL: https://lynkapp.net
```

✅ **Done when:** You see "Deploy complete!" and your Hosting URL

**After deploying:** Open a browser and go to **https://lynkapp.net** — you should see your app live.

**⚠️ Trouble?**
- If it says "not logged in": Open a new terminal, `cd ConnectHub-SPA`, then run `"C:\Users\Jnewball\AppData\Roaming\npm\firebase.cmd" login` first
- If the site still shows old content: Wait 60 seconds and hard-refresh (Ctrl+Shift+R)

---

---

# ═══════════════════════════════════════════
# STEP 8 — TEST THE ADMIN DASHBOARD
# Time: ~5 minutes
# ═══════════════════════════════════════════

**What this does:** Confirms your CEO admin account works and the admin dashboard is accessible.

1. Open a browser and go to: **http://localhost:5173/login** (or https://lynkapp.net/login for production)
2. Sign in with:
   - **Email:** `CEO@lynkapp.net`
   - **Password:** `LynkApp@CEO2026!`
3. After logging in, navigate to: **http://localhost:5173/admin**
4. You should see the Admin Dashboard with:
   - Header: "⚙️ Admin Dashboard" with a red "🔴 ADMIN ACCESS" badge
   - 5 tabs: Overview | Reports | KYC | Users | More
   - 6 metric cards
5. Click through all tabs and make sure they load

**IMMEDIATELY change your password:**
1. Go to **Settings → Security → Change Password**
2. Set a new strong password (don't use `LynkApp@CEO2026!` in production)

✅ **Done when:** Admin dashboard loads, all tabs work, password changed

---

---

# ═══════════════════════════════════════════
# STEP 9 — SMOKE TEST (Test 15 Critical Things)
# Time: ~30 minutes
# DO THIS BEFORE INVITING ANY BETA TESTERS
# ═══════════════════════════════════════════

Open the live app at **https://lynkapp.net** (or localhost:5173) in a private/incognito browser window.
Test each item below — check it off when it passes.

## AUTH
- [ ] **Sign up** — create a brand new account with a test email → you get a verification email
- [ ] **Verify email** — click the link in the email → redirected back to app
- [ ] **Log out** — click logout → redirected to login page
- [ ] **Log back in** — sign in with the account you just created
- [ ] **Google Sign In** — log out, then click "Sign in with Google" → works
- [ ] **Forgot Password** — click Forgot Password → enter email → get reset email

## CORE FEATURES
- [ ] **Feed loads** — after login, the home feed shows posts (not blank/empty)
- [ ] **Create a text post** — click the compose button → type something → post → it appears in feed
- [ ] **Create a photo post** — click compose → attach a photo → post → photo shows in feed
- [ ] **Like a post** — tap the heart on any post → count goes up
- [ ] **Dating — Swipe** — go to Dating section → swipe right on a profile → works without crashing
- [ ] **Send a message** — go to Messages → tap a conversation or start new → send a message
- [ ] **Marketplace — Browse** — go to Marketplace → products load → can tap a product
- [ ] **Notifications** — go to Notifications tab → page loads (may be empty for new account — that's OK)

## LEGAL
- [ ] **Terms of Service** — go to https://lynkapp.net/terms → page loads with full ToS text
- [ ] **Privacy Policy** — go to https://lynkapp.net/privacy → page loads with full Privacy text
- [ ] **Cookie consent** — open in a fresh private window → cookie banner appears at bottom of screen

## BETA FEEDBACK BUTTON
- [ ] **Feedback modal** — find the feedback button (usually a floating button at bottom) → click it → fill in text → submit → success toast appears

✅ **Done when:** All items checked with no crashes or console errors

---

---

# ═══════════════════════════════════════════
# STEP 10 — INVITE BETA TESTERS
# Time: Up to you
# ═══════════════════════════════════════════

You're ready! Here's how to invite people:

## Option A — Share the URL Directly
Just send people the link: **https://lynkapp.net**

They create an account themselves. No invite codes needed.

## Option B — Create a Beta Tester Group
1. In the app, go to the Groups section
2. Create a "LynkApp Beta Testers" group
3. Share the invite link to your testers

## What to Tell Beta Testers
Include these in your invite message:
```
Hey! I'm looking for beta testers for LynkApp — a new social app.

Test link: https://lynkapp.net

What to test:
• Sign up and set up your profile
• Browse the feed and create posts
• Try messaging and dating features
• Let me know anything that feels broken or confusing

Feedback button: There's a feedback button in the app — please use it!
Or email me at: [your email]
```

## Watch the Admin Dashboard
Once testers sign up:
1. Go to https://lynkapp.net/admin (or localhost:5173/admin)
2. The **Overview** tab shows live metrics
3. The **Reports** tab shows any content reports from users
4. The **Users** tab shows all registered users

---

---

# ═══════════════════════════════════════════
# AFTER BETA — THINGS TO DO BEFORE FULL LAUNCH
# (Don't need these for beta)
# ═══════════════════════════════════════════

## 🔴 Before Charging Real Money — Switch Stripe to Live Mode
Currently Stripe is in test mode (no real charges). Before taking real payments:

1. Go to **https://dashboard.stripe.com** → Developers → API Keys
2. Toggle to **Live** mode at the top
3. Copy **Publishable key** (`pk_live_...`)
4. Open `ConnectHub-SPA/.env` → replace:
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_KEY
   ```
5. Open `ConnectHub-Backend/.env` → replace/add:
   ```
   STRIPE_SECRET_KEY=sk_live_YOUR_SECRET_KEY
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
   ```
6. In Stripe dashboard → Webhooks → Add endpoint: `https://api.lynkapp.net/webhooks/stripe`
7. Rebuild and redeploy

## 🟡 Production Email Volume — Mailgun
Firebase only allows 100 password reset emails/day. For more:

1. Go to **https://mailgun.com** → sign up (free tier = 1,000 emails/month)
2. Add domain: `mail.lynkapp.net`
3. Add the DNS records they show you
4. Get your API key
5. In `ConnectHub-Backend/.env`:
   ```
   MAILGUN_API_KEY=key-YOUR_KEY
   MAILGUN_DOMAIN=mail.lynkapp.net
   MAILGUN_FROM_EMAIL=noreply@lynkapp.net
   ```

## 🟢 Optional — Ad Revenue (AdSense)
1. Go to **https://adsense.google.com** → Add Site: `lynkapp.net`
2. Wait for approval (1-3 days)
3. Get publisher ID and unit IDs
4. In `ConnectHub-SPA/.env`:
   ```
   VITE_ADSENSE_PUBLISHER_ID=ca-pub-YOUR_ID
   VITE_ADSENSE_BANNER_SLOT=YOUR_BANNER_SLOT
   ```
5. Rebuild + redeploy

---

---

# ═══════════════════════════════════════════
# QUICK REFERENCE — COMMANDS YOU'LL USE REPEATEDLY
# ═══════════════════════════════════════════

## Start the dev server (for local testing)
```
Double-click: ConnectHub-SPA/start-dev.bat
Then open: http://localhost:5173
```

## After making ANY code or .env change → rebuild and redeploy
```bash
cd ConnectHub-SPA
npm run build
"C:\Users\Jnewball\AppData\Roaming\npm\firebase.cmd" deploy --only hosting
```

## Deploy just the Firestore rules (if you update firestore.rules)
```bash
cd ConnectHub-SPA
"C:\Users\Jnewball\AppData\Roaming\npm\firebase.cmd" deploy --only firestore:rules
```

## Deploy everything at once (hosting + rules + functions)
```bash
cd ConnectHub-SPA
"C:\Users\Jnewball\AppData\Roaming\npm\firebase.cmd" deploy
```

## Make firebase work in any terminal without full path (permanent fix)
Open PowerShell as Administrator and run:
```powershell
[System.Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\Users\Jnewball\AppData\Roaming\npm", "User")
```
Then restart VS Code. After that you can just type `firebase` instead of the full path.

---

---

# ═══════════════════════════════════════════
# KEY FILES QUICK REFERENCE
# ═══════════════════════════════════════════

| What you want to edit | File location |
|----------------------|---------------|
| Environment variables (API keys, etc.) | `ConnectHub-SPA/.env` |
| Backend environment variables | `ConnectHub-Backend/.env` |
| Firebase config (project ID, etc.) | `ConnectHub-SPA/src/firebase/config.js` |
| Firestore security rules | `ConnectHub-SPA/firestore.rules` |
| WebRTC / TURN server settings | `ConnectHub-SPA/src/services/livestream-webrtc.js` |
| Login page | `ConnectHub-SPA/src/pages/auth/LoginPage.jsx` |
| Feed page | `ConnectHub-SPA/src/pages/feed/FeedPage.jsx` |
| Admin dashboard | `ConnectHub-SPA/src/pages/admin/AdminDashboardPage.jsx` |
| Terms of Service | `ConnectHub-SPA/src/pages/legal/TermsPage.jsx` |
| Privacy Policy | `ConnectHub-SPA/src/pages/legal/PrivacyPage.jsx` |
| App routing (all routes) | `ConnectHub-SPA/src/App.jsx` |
| Navigation bar (bottom) | `ConnectHub-SPA/src/components/layout/BottomNav.jsx` |

---

---

# ═══════════════════════════════════════════
# TOTAL CHECKLIST — PRINT THIS AND CHECK OFF
# ═══════════════════════════════════════════

## Required For Beta Launch
- [ ] Step 1: Firebase login (`1-firebase-login.bat`)
- [ ] Step 2: Deploy rules + functions (`2-deploy-rules-and-functions.bat`)
- [ ] Step 3A: Download `serviceAccountKey.json` from Firebase Console
- [ ] Step 3B: Run CEO admin seed (`run-ceo-admin.bat`)
- [ ] Step 3C: Delete `serviceAccountKey.json`
- [ ] Step 4: Add TURN server to `livestream-webrtc.js` (recommended)
- [ ] Step 5: Add Sentry DSN to `.env` (recommended)
- [ ] Step 6: Build production (`npm run build` in `ConnectHub-SPA/`)
- [ ] Step 7: Deploy to Firebase Hosting (`firebase deploy --only hosting`)
- [ ] Step 8: Log into admin dashboard, change CEO password
- [ ] Step 9: Complete smoke test — all 16 items pass
- [ ] Step 10: Send beta invites

## Before Full Public Launch (Post-Beta)
- [ ] Switch Stripe to live mode (before taking real payments)
- [ ] Set up Mailgun (for high email volume)
- [ ] Apply for AdSense (for ad revenue)
- [ ] Consider Apple Developer account for full Apple Sign-In on iOS

---

*Guide created June 4, 2026 — LynkApp Beta Launch Preparation*
