# LynkApp — How to Deploy Changes
**Live URL:** https://lynkapp.net  
**Firebase Project:** lynkapp-c7db1  
**App folder:** `ConnectHub-SPA/`

---

## ⚡ QUICK ANSWER — The 3-Step Workflow

Every time you make a code change and want it live:

```
1. Make your changes in  ConnectHub-SPA/src/
2. Open DEPLOY-CHANGES.bat in Notepad and update the change description
3. Double-click DEPLOY-CHANGES.bat → it does everything automatically
```

That's it. The bat file handles npm install, build, git push, and Firebase deploy.

---

## 📋 BEFORE YOUR FIRST DEPLOY (one-time setup)

If this is a fresh machine or fresh clone, do this once:

### 1. Install Firebase CLI (if not installed)
```cmd
npm install -g firebase-tools
```

### 2. Log in to Firebase
Run `ConnectHub-SPA\1-firebase-login.bat`
- This opens a browser for Google login
- Choose the account that owns the lynkapp-c7db1 project

### 3. Verify login worked
```cmd
firebase projects:list
```
You should see `lynkapp-c7db1` in the list.

> **Note:** `node_modules` is NOT included in git (it's in .gitignore).  
> The `DEPLOY-CHANGES.bat` automatically runs `npm install` before every build,  
> so you never need to install manually.

---

## 🚀 DEPLOYING EVERY TIME YOU MAKE CHANGES

### Step 1 — Make your code changes
All app source files are in:
```
ConnectHub-SPA/src/
├── pages/          ← Page components (.jsx files)
├── components/     ← Reusable UI components
├── services/       ← API/Firebase calls
├── styles/         ← Global CSS
├── store/          ← Zustand state
└── firebase/       ← Firebase config
```

### Step 2 — Open DEPLOY-CHANGES.bat and log your change
Right-click `ConnectHub-SPA\DEPLOY-CHANGES.bat` → **Edit** (opens in Notepad)

Update **SECTION 1** at the top:
```bat
set CHANGE_DATE=2026-06-09          ← today's date
set CHANGE_DESC=Fixed login button color on mobile
set CHANGE_BY=Jnewball
```

Also add a new line to the **RECENT CHANGES** comment block:
```bat
REM  2026-06-09  Jnewball — Fixed login button color on mobile
```

Save the file (`Ctrl+S`).

### Step 3 — Set what to deploy (SECTION 2)
For **regular code changes** (editing .jsx/.js/.css), the defaults are correct:
```bat
set DEPLOY_HOSTING=YES     ← build + upload to lynkapp.net
set DEPLOY_RULES=NO
set DEPLOY_INDEXES=NO
set DEPLOY_FUNCTIONS=NO
set DEPLOY_STORAGE=NO
set SAVE_TO_GIT=YES        ← auto-commits to GitHub
```

Only change these if you also edited:
| What you changed | Switch to set YES |
|---|---|
| `ConnectHub-SPA/src/*.jsx` or `*.js` or `*.css` | `DEPLOY_HOSTING=YES` ✅ (default) |
| `ConnectHub-SPA/firestore.rules` | `DEPLOY_RULES=YES` |
| `ConnectHub-SPA/firestore.indexes.json` | `DEPLOY_INDEXES=YES` |
| `ConnectHub-SPA/functions/index.js` | `DEPLOY_FUNCTIONS=YES` |
| `ConnectHub-SPA/storage.rules` | `DEPLOY_STORAGE=YES` |

### Step 4 — Double-click DEPLOY-CHANGES.bat
A black terminal window opens. It will:
1. **[GIT]** git add -A → git commit → git push (saves to GitHub)
2. **[NPM]** npm install (installs/updates packages — fast after first run)
3. **[BUILD]** npm run build (compiles React → `dist/` folder, ~2-5 min)
4. **[DEPLOY]** firebase deploy --only hosting (uploads to lynkapp.net)

Press **ENTER** when prompted to confirm, or close the window to cancel.

### Step 5 — Wait ~3-5 minutes
When finished you'll see:
```
ALL DONE!  LynkApp is live at:
  https://lynkapp.net
```
Open https://lynkapp.net in a browser to verify your changes are live.

> **Tip:** Sometimes browser cache shows the old version.  
> Hard-refresh with **Ctrl+Shift+R** or open in Incognito mode.

---

## 🗂️ ALL BAT FILES EXPLAINED

Located in `ConnectHub-SPA/`

| File | What it does | When to use |
|---|---|---|
| **`DEPLOY-CHANGES.bat`** | ⭐ **THE ONE TO USE** — Full deploy with changelog | Every code deploy |
| `1-firebase-login.bat` | Log in to Firebase CLI | First time / re-auth |
| `2-deploy-rules-and-functions.bat` | Deploy rules + functions together | After editing both |
| `3-build-production.bat` | Just build (no deploy) | Testing the build |
| `4-deploy-hosting.bat` | Just deploy to Firebase (no build) | After manual build |
| `5-deploy-rules-only.bat` | Deploy only firestore.rules | After editing rules |
| `6-build-and-deploy.bat` | Build + deploy (simpler, no git/changelog) | Quick deploys |
| `7-deploy-functions-only.bat` | Deploy Cloud Functions only | After editing functions/index.js |
| `8-deploy-storage-rules.bat` | Deploy storage.rules only | After editing storage.rules |
| `9-deploy-indexes.bat` | Deploy Firestore indexes only | After editing indexes.json |
| `MASTER-DEPLOY-ALL.bat` | Deploy everything at once | Full redeploy |
| `deploy-firestore-rules.bat` | Deploy Firestore rules | Same as #5 |

---

## 🔧 WHAT HAPPENS INSIDE THE BUILD

When `npm run build` runs, Vite does this:

```
ConnectHub-SPA/src/   →  (Vite compiles)  →  ConnectHub-SPA/dist/
```

- All `.jsx` React components are compiled to JavaScript
- All CSS is bundled and minified
- Images/fonts are optimized
- Result goes into `dist/` folder
- Firebase then uploads `dist/` to `lynkapp.net`

The `vite.config.js` splits the bundle into chunks for fast loading:
- `vendor` chunk = React, React-DOM, React-Router
- `firebase` chunk = Firebase SDK
- `state` chunk = Zustand
- Each page = lazy-loaded separately

---

## ⚠️ IF THE BUILD FAILS

Read the RED error text. Common fixes:

### "Cannot find module './SomeComponent'"
An import path is wrong. Open the file shown in the error and fix the import.

### "SyntaxError: Unexpected token"
There's a syntax error in a JSX file. Fix the file listed in the error.

### "npm install failed"
Try deleting `node_modules` folder and running again:
```cmd
cd ConnectHub-SPA
rmdir /s /q node_modules
npm install
```

### "Firebase deploy failed — not logged in"
Run `1-firebase-login.bat` then try again.

### "Build times out / runs out of memory"
Already handled — the bat sets `NODE_OPTIONS=--max-old-space-size=4096` (4GB).

---

## 🌍 UNDERSTANDING THE DEPLOYMENT ARCHITECTURE

```
Your Code (src/)
    ↓  npm run build
Compiled App (dist/)
    ↓  firebase deploy --only hosting
Firebase Hosting CDN
    ↓  serves globally
https://lynkapp.net
```

**Firebase Hosting** serves the app via a global CDN.  
**Firebase** (Firestore, Auth, Storage, Functions) provides the backend.  
**No server to manage** — Firebase handles everything automatically.

### Domain setup
- `lynkapp.net` → Connected to Firebase Hosting
- `lynkapp-c7db1.web.app` → Also works (Firebase default domain)
- HTTPS is automatic — Firebase handles SSL certificates

---

## 🔐 FIRESTORE RULES — When to redeploy

If you edit `ConnectHub-SPA/firestore.rules`, you must deploy rules separately:
```bat
set DEPLOY_RULES=YES
```
or just run `5-deploy-rules-only.bat`.

Rules control who can read/write what data. Changes to rules take effect
within a few minutes after deploy.

---

## 📱 MOBILE APP DEPLOYMENT (iOS / Android)

The web app at lynkapp.net **also runs as a mobile app** via Capacitor.

To build for mobile after making changes:
```cmd
cd ConnectHub-SPA
npm run build
npx cap sync
npx cap open ios     (opens Xcode — build + submit to App Store)
npx cap open android (opens Android Studio — build + submit to Play Store)
```

The `capacitor.config.json` file contains the mobile app configuration.

---

## 🆘 COMMON DEPLOYMENT ISSUES

### "firebase is not recognized"
Firebase CLI not installed. Run:
```cmd
npm install -g firebase-tools
```

### "Error: Project not found"
Wrong Firebase project. Check `.firebaserc`:
```json
{
  "projects": {
    "default": "lynkapp-c7db1"
  }
}
```

### "Cannot resolve entry module index.html"
You ran `npx vite build` from the wrong folder or with a cached version.
Always use the bat file — it handles this correctly with `cd /d "%~dp0"`.

### Changes not showing after deploy
- Wait 1-2 min for CDN propagation
- Hard-refresh: **Ctrl+Shift+R**
- Clear browser cache, or test in Incognito

---

## 📅 CHANGE LOG (keep this updated)

| Date | By | What changed |
|---|---|---|
| 2026-06-09 | Jnewball | HOW-TO-DEPLOY.md created, DEPLOY-CHANGES.bat improved |
| 2026-06-09 | Jnewball | Initial DEPLOY-CHANGES.bat created |

---

*Last updated: 2026-06-09*  
*Firebase project: lynkapp-c7db1*  
*Live URL: https://lynkapp.net*
