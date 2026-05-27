# 🔧 BLOCK 4 — Detailed Step-by-Step Fix Guide
## How to Make All 6 Verification Steps Pass
**Project:** LynkApp (ConnectHub-SPA)  
**Live URL:** https://lynkapp.net  
**S3 Bucket:** lynkapp.net  
**CloudFront ID:** E1K6OG7GOLIRJ2  
**Firebase Project:** lynkapp-c7db1  
**Date:** May 27, 2026  

---

## OVERVIEW — What You're Fixing

You have **3 blockers** that prevent Block 4 from working:

| # | Blocker | Time to Fix | Where |
|---|---------|------------|-------|
| **FIX 1** | `.env.production` was missing → Firebase config was `undefined` | ✅ Already done by Cline | VS Code |
| **FIX 2** | Need to rebuild + redeploy the app with new env file | ~15 minutes | Terminal |
| **FIX 3** | `lynkapp.net` not in Firebase Auth authorized domains | ~5 minutes | Browser |
| **FIX 4** | Firestore + Storage rules never deployed to Firebase | ~20 minutes | Terminal |

**Total time: ~40 minutes**

---

## ✅ FIX 1 — Already Done (`.env.production` Created)

**Status: COMPLETE — no action needed.**

Cline already created `ConnectHub-SPA/.env.production` with all your Firebase keys, API keys, and Stripe test key. This file is what Vite uses when building for production.

**Verify it exists:** In VS Code, look in the `ConnectHub-SPA/` folder — you should see `.env.production` in the file list.

---

## 🔧 FIX 2 — Rebuild and Redeploy the App to S3

**Why:** The app currently deployed to https://lynkapp.net was built WITHOUT the `.env.production` file, so Firebase was broken. You need to rebuild and push the new version.

**Time: ~15 minutes**

### Step 2.1 — Open a terminal

In VS Code: press **Ctrl + `** (backtick) to open the terminal.

### Step 2.2 — Navigate to the ConnectHub-SPA folder

Type this command exactly and press Enter:
```
cd "c:\Users\Jnewball\Test-apps\Test-apps\ConnectHub-SPA"
```

You should see the prompt change to show you're in ConnectHub-SPA.

### Step 2.3 — Install dependencies (if not done recently)

```
npm install
```

Wait for it to finish. You'll see something like "added 847 packages" when done. If you get errors, run it again — sometimes npm needs a retry.

### Step 2.4 — Run the production build

```
npm run build
```

**What to expect:**
- The terminal will show Vite building the app
- It will take 2-5 minutes
- When done, you'll see output like:
  ```
  ✓ built in 3.42s
  dist/index.html  2.50 kB
  dist/assets/...
  ```
- If you see any RED error text, stop and screenshot it

**⚠️ If the build fails:** The most common cause is a JavaScript syntax error in a recently edited file. Look at the error message — it will tell you which file and which line number has the problem.

### Step 2.5 — Deploy the new build to AWS S3

```
aws s3 sync dist/ s3://lynkapp.net --delete
```

**What to expect:**
- You'll see lines like: `upload: dist/index.html to s3://lynkapp.net/index.html`
- When it finishes with no errors, the files are on S3

**⚠️ If you see "Unable to locate credentials":** Your AWS CLI session expired. Run:
```
aws configure
```
Then enter your AWS Access Key ID and Secret Access Key when prompted.

### Step 2.6 — Clear the CloudFront cache

The old broken version is cached by CloudFront. You must clear it so visitors get the new version:

```
aws cloudfront create-invalidation --distribution-id E1K6OG7GOLIRJ2 --paths "/*"
```

**What to expect:**
```json
{
    "Location": "...",
    "Invalidation": {
        "Id": "XXXXX",
        "Status": "InProgress"
    }
}
```

The cache clear takes **2-3 minutes** to fully propagate. Wait before testing.

### Step 2.7 — Verify the new build is live

Open a **new incognito window** in Chrome and go to:
```
https://lynkapp.net
```

You should see the LynkApp login screen load. Open Chrome DevTools (F12) → Console tab.

**✅ Success sign:** No red errors in the console, and the login page looks normal.  
**❌ Failure sign:** Red error saying "Firebase: Error (app/invalid-credential)" means the env vars are still missing — wait 2-3 more minutes for CloudFront cache to clear and try again.

---

## 🔧 FIX 3 — Add lynkapp.net to Firebase Auth Authorized Domains

**Why:** Firebase Auth blocks sign-in attempts from any domain not on its whitelist. Right now only `localhost` and `lynkapp-c7db1.firebaseapp.com` are allowed. You need to add `lynkapp.net`.

**Time: ~5 minutes**  
**Where: Your browser (no terminal needed)**

### Step 3.1 — Open Firebase Console

Open a new browser tab and go to:
```
https://console.firebase.google.com
```

Sign in with your Google account if prompted.

### Step 3.2 — Select your project

Click on **"lynkapp-c7db1"** in the project list.

> If you don't see it, click "All projects" or check you're signed in with the right Google account.

### Step 3.3 — Go to Authentication settings

In the left sidebar:
1. Click **"Authentication"** (the icon looks like a person with a shield)
2. Click the **"Settings"** tab at the top (next to Users, Sign-in method, etc.)

### Step 3.4 — Find Authorized Domains

On the Settings page, scroll down until you see the **"Authorized domains"** section.

You should currently see something like:
- `localhost`
- `lynkapp-c7db1.firebaseapp.com`
- `lynkapp-c7db1.web.app`

### Step 3.5 — Add your production domain

1. Click the **"Add domain"** button
2. In the text box that appears, type exactly:
   ```
   lynkapp.net
   ```
3. Click **"Add"**

4. Repeat — click **"Add domain"** again and add:
   ```
   www.lynkapp.net
   ```
5. Click **"Add"**

### Step 3.6 — Verify it saved

You should now see `lynkapp.net` and `www.lynkapp.net` in the list. No save button is needed — it saves automatically.

**✅ Done.** Sign-in from `lynkapp.net` will now be permitted by Firebase.

---

## 🔧 FIX 4 — Deploy Firebase Rules and Indexes

**Why:** The `firestore.rules`, `storage.rules`, and `firestore.indexes.json` files are written in the codebase but have never been pushed to Firebase. Until they're deployed, all Firestore reads/writes may return `permission-denied` errors.

**Time: ~20 minutes**  
**Where: Terminal**

### Step 4.1 — Install Firebase CLI (if not already installed)

In your terminal, check if Firebase is installed:
```
firebase --version
```

**If you see a version number** (like `13.x.x`) → skip to Step 4.2.

**If you see "firebase is not recognized"** → install it:
```
npm install -g firebase-tools
```

Wait for the install to complete. Then verify:
```
firebase --version
```

### Step 4.2 — Navigate to the ConnectHub-SPA folder

```
cd "c:\Users\Jnewball\Test-apps\Test-apps\ConnectHub-SPA"
```

### Step 4.3 — Log in to Firebase

```
firebase login
```

**What happens:**
- Your default browser will open to a Google sign-in page
- Sign in with the Google account that owns the `lynkapp-c7db1` Firebase project
- After signing in, the browser will show "Firebase CLI Login Successful"
- The terminal will show: `✔  Success! Logged in as [your email]`

> **Already logged in?** If the terminal shows "Already logged in as [email]", skip to Step 4.4.

### Step 4.4 — Verify you're connected to the right project

```
firebase projects:list
```

You should see `lynkapp-c7db1` in the list. If not, double-check you logged in with the right Google account.

### Step 4.5 — Deploy Firestore security rules

```
firebase deploy --only firestore:rules --project lynkapp-c7db1
```

**What to expect:**
```
=== Deploying to 'lynkapp-c7db1'...
i  deploying firestore
✔  firestore: released rules firestore.rules
✔  Deploy complete!
```

**⚠️ If you see an error like "Must specify deploy target":** Run:
```
firebase use lynkapp-c7db1
```
Then try the deploy command again.

### Step 4.6 — Deploy Firestore indexes

```
firebase deploy --only firestore:indexes --project lynkapp-c7db1
```

**What to expect:**
```
✔  firestore: deployed indexes in firestore.indexes.json
✔  Deploy complete!
```

> Note: Index builds can take 5-10 minutes to fully activate in Firebase. The deploy command succeeds immediately, but the indexes build in the background.

### Step 4.7 — Deploy Firebase Storage rules

```
firebase deploy --only storage --project lynkapp-c7db1
```

**What to expect:**
```
✔  storage: released rules storage.rules
✔  Deploy complete!
```

### Step 4.8 — (Optional) Deploy all at once in future

Next time you need to deploy all Firebase configs, you can use one command:
```
firebase deploy --only firestore:rules,firestore:indexes,storage --project lynkapp-c7db1
```

### Step 4.9 — Verify rules are live in Firebase Console

1. Go to https://console.firebase.google.com → lynkapp-c7db1
2. Click **Firestore Database** in the left sidebar
3. Click the **"Rules"** tab
4. You should see the rules from your `firestore.rules` file (they'll look like `rules_version = '2';` at the top and have allow read/write conditions by `request.auth.uid`)

5. Click **Storage** in the left sidebar
6. Click the **"Rules"** tab
7. You should see your storage rules there too

**✅ If you see your rules there — FIX 4 is complete.**

---

## 🧪 FINAL VERIFICATION — Run Block 4 Steps

After completing all 4 fixes above, wait **3 minutes** for everything to propagate, then run the Block 4 test:

### Open the app in incognito:
1. Open Chrome
2. Press **Ctrl+Shift+N** to open an incognito window
3. Go to: `https://lynkapp.net`
4. Open DevTools: press **F12** → click **Console** tab
5. ✅ You should see the LynkApp login screen with NO red errors in console

### Test sign-up (Step 4.2):
1. Click "Create Account" or "Sign Up"
2. Enter a real email you own (you'll receive a verification email)
3. Enter a password (at least 8 characters)
4. Click Register
5. ✅ You should land on the "Verify Your Email" page
6. Check your email inbox (and spam) — the verification email should arrive within 2 minutes
7. Click the link in the email
8. ✅ The app should automatically redirect you to `/onboarding`

> **If you get an error on sign-up:** Open the Console tab in DevTools. Look for a red error message:
> - `auth/unauthorized-domain` → Fix 3 didn't save correctly, redo Step 3.5
> - `Firebase: Error (auth/invalid-api-key)` → The build didn't pick up `.env.production`, redo Fix 2
> - `permission-denied` → Firestore rules aren't deployed yet, redo Fix 4

### Test onboarding (Step 4.3):
1. Fill in your display name (any name)
2. Fill in a unique handle (like `testuser123`)
3. Pick 3 or more interests
4. Either upload a photo or pick an avatar
5. Skip the "Find Friends" step
6. ✅ You should land on `/feed`

### Test profile saved (Step 4.4):
1. Go to https://console.firebase.google.com → lynkapp-c7db1 → Firestore Database → Data tab
2. Click the `users` collection
3. ✅ You should see your user document with your name, handle, and interests

### Test creating a post (Step 4.5):
1. In the app, tap/click the ✏️ pen icon in the top navigation bar
2. Type any text
3. Click Submit/Post
4. ✅ Your post should appear in the feed within 2 seconds

### Test sign out + sign back in (Step 4.6):
1. Tap the ☰ More button (bottom right in the nav bar)
2. Scroll to bottom → tap "Sign Out"
3. ✅ You should be redirected to the login screen
4. Sign in with the same email + password
5. ✅ You should return to the feed and your post should still be there

---

## 🆘 TROUBLESHOOTING — If Something Still Fails

### Problem: App loads but shows a white screen
**Cause:** JavaScript error crashing the app  
**Fix:** Open F12 → Console tab → screenshot the red error and investigate

### Problem: "Firebase: Error (app/invalid-credential)"
**Cause:** `.env.production` keys are wrong or build wasn't rebuilt  
**Fix:** Verify `.env.production` exists in `ConnectHub-SPA/` folder, then redo Fix 2 (rebuild + redeploy)

### Problem: Sign-up fails with "auth/unauthorized-domain"
**Cause:** Firebase Console domain wasn't saved correctly  
**Fix:** Redo Step 3.4-3.5. Make sure you type `lynkapp.net` exactly (no `https://`, no trailing slash)

### Problem: Sign-up works but Firestore write fails ("permission-denied")
**Cause:** Firestore rules not deployed or still building  
**Fix:** Wait 2 minutes after deployment, then try again. If still failing, check the Rules tab in Firebase Console

### Problem: "npm run build" fails with a compilation error
**Cause:** A React/JS syntax error in a source file  
**Fix:** Read the error message carefully — it will say something like "ERROR: src/pages/feed/FeedPage.jsx line 142 — Unexpected token". Open that file and fix the syntax issue

### Problem: "aws s3 sync" fails with credential error
**Cause:** AWS CLI credentials expired  
**Fix:** Run `aws configure` and re-enter your Access Key ID and Secret Access Key

### Problem: Changes not showing on https://lynkapp.net after redeploy
**Cause:** CloudFront cache not cleared yet  
**Fix:** Wait 5 minutes for cache to fully expire, or redo Step 2.6

---

## 📋 CHECKLIST — Tick Each Off As You Complete It

```
FIX 1 — .env.production
  ✅ [DONE] ConnectHub-SPA/.env.production created by Cline with all keys

FIX 2 — Rebuild + Redeploy
  [ ] Opened terminal in VS Code
  [ ] cd "c:\Users\Jnewball\Test-apps\Test-apps\ConnectHub-SPA"
  [ ] npm install (if needed)
  [ ] npm run build — completed with no errors
  [ ] aws s3 sync dist/ s3://lynkapp.net --delete — uploaded successfully
  [ ] aws cloudfront create-invalidation --distribution-id E1K6OG7GOLIRJ2 --paths "/*"
  [ ] Waited 3 minutes for cache to clear
  [ ] Opened https://lynkapp.net in incognito — login page loads, no console errors

FIX 3 — Firebase Auth Domain
  [ ] Opened https://console.firebase.google.com
  [ ] Selected project lynkapp-c7db1
  [ ] Went to Authentication → Settings → Authorized Domains
  [ ] Added lynkapp.net
  [ ] Added www.lynkapp.net
  [ ] Both domains now show in the list

FIX 4 — Firebase Rules Deploy
  [ ] firebase --version shows a version number (CLI installed)
  [ ] firebase login — logged in successfully
  [ ] firebase projects:list shows lynkapp-c7db1
  [ ] firebase deploy --only firestore:rules --project lynkapp-c7db1 — SUCCESS
  [ ] firebase deploy --only firestore:indexes --project lynkapp-c7db1 — SUCCESS
  [ ] firebase deploy --only storage --project lynkapp-c7db1 — SUCCESS
  [ ] Verified rules in Firebase Console → Firestore → Rules tab
  [ ] Verified rules in Firebase Console → Storage → Rules tab

BLOCK 4 FINAL VERIFICATION
  [ ] Step 4.1: App opens in incognito with no console errors ✅
  [ ] Step 4.2: Sign-up works + verification email received ✅
  [ ] Step 4.3: Onboarding completes + lands on /feed ✅
  [ ] Step 4.4: User document visible in Firestore Console ✅
  [ ] Step 4.5: Post created and appears in feed ✅
  [ ] Step 4.6: Sign out + sign back in + post still there ✅
```

---

*Guide created: May 27, 2026*  
*Fixes 1 already complete — run Fixes 2, 3, and 4 to pass all Block 4 steps*
