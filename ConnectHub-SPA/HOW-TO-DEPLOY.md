# 🚀 LynkApp — How to Deploy Changes

**Live URL:** https://lynkapp.net  
**Firebase Project:** `lynkapp-c7db1`  
**App folder:** `ConnectHub-SPA/`

---

## ⚡ Quick Answer — Everyday Workflow

Every time you make code changes and want them live, you only need to do **ONE thing**:

```
Double-click:  ConnectHub-SPA\DEPLOY-CHANGES.bat
```

That's it. It will:
1. Log your changes to GitHub
2. Build the React app (2-5 min)
3. Push it live to lynkapp.net

---

## 📋 Before You Run DEPLOY-CHANGES.bat — Update 3 Lines

Open `ConnectHub-SPA\DEPLOY-CHANGES.bat` in VS Code and update these 3 lines at the top:

```bat
set CHANGE_DATE=2026-06-09          ← today's date
set CHANGE_DESC=Fixed login bug     ← what you changed (short description)
set CHANGE_BY=Jnewball              ← your name
```

Then add a line to the change log section (copy the template):
```bat
REM  2026-06-09  Jnewball — Fixed login bug
```

This keeps a running history of every deploy right inside the bat file.

---

## 🔧 The Deploy Toggle Switches

Inside `DEPLOY-CHANGES.bat` there are on/off switches in **Section 2**.  
For most changes you only touch `DEPLOY_HOSTING`:

```bat
set DEPLOY_HOSTING=YES      ← Turn ON when you changed any .jsx / .js / .css
set DEPLOY_RULES=NO         ← Turn ON when you edited firestore.rules
set DEPLOY_INDEXES=NO       ← Turn ON when you edited firestore.indexes.json
set DEPLOY_FUNCTIONS=NO     ← Turn ON when you edited functions/index.js
set DEPLOY_STORAGE=NO       ← Turn ON when you edited storage.rules
set SAVE_TO_GIT=YES         ← Keeps GitHub in sync (leave YES)
```

---

## 📁 All Available Bat Files (Complete Reference)

| File | When to use |
|------|------------|
| `1-firebase-login.bat` | **First time only** — sign in to Firebase |
| `DEPLOY-CHANGES.bat` | ✅ **Everyday use** — deploy code changes with change log |
| `6-build-and-deploy.bat` | Quick build + deploy (no change log) |
| `MASTER-DEPLOY-ALL.bat` | Full deploy of EVERYTHING (rules + functions + build + hosting) |
| `3-build-production.bat` | Build only (creates `dist/` folder, no upload) |
| `4-deploy-hosting.bat` | Upload only (if build already done) |
| `5-deploy-rules-only.bat` | Push Firestore rules only |
| `7-deploy-functions-only.bat` | Push Cloud Functions only |
| `8-deploy-storage-rules.bat` | Push Storage rules only |
| `9-deploy-indexes.bat` | Push Firestore indexes only |
| `start-dev.bat` | Run local dev server (http://localhost:5173) |

---

## 🔄 Step-by-Step: Your Normal Deploy Flow

```
1. Make code changes in VS Code
   └── Edit files in ConnectHub-SPA/src/

2. Open DEPLOY-CHANGES.bat in VS Code or Notepad
   └── Update CHANGE_DATE, CHANGE_DESC, CHANGE_BY
   └── Add a line to the REM change log

3. Double-click DEPLOY-CHANGES.bat
   └── Review the settings shown on screen
   └── Press ENTER to confirm

4. Wait 2-5 minutes for build + upload

5. Check https://lynkapp.net — changes are live!
```

---

## 🆕 First Time Setup (if not done yet)

If you haven't deployed before, do these steps once:

```
Step 1: Double-click  1-firebase-login.bat
        → Opens browser, log in with your Google account (jnewball@...)
        → This only needs to be done once per machine

Step 2: Double-click  MASTER-DEPLOY-ALL.bat
        → Deploys everything: rules, indexes, functions, hosting
        → Use this for a fresh/full deployment

Step 3: After that, use DEPLOY-CHANGES.bat for all future changes
```

---

## ⚠️ Common Errors and Fixes

| Error | Fix |
|-------|-----|
| `Firebase CLI not found` | Run: `npm install -g firebase-tools` |
| `You are not authenticated` | Run `1-firebase-login.bat` first |
| `BUILD FAILED` | Read the red error — it names the exact file and line |
| `Missing import` | Check that the file path in the import is correct |
| `Git push failed` | Check GitHub credentials or run `git push` manually |
| `Error: Cannot find module` | Run `npm install` in `ConnectHub-SPA/` first |

---

## 💡 Tips

- **Test locally first** before deploying:  
  Double-click `start-dev.bat` → opens http://localhost:5173
  
- **Build failed?** The error message names the exact file and line number. Fix that file, then re-run.

- **Deployed but changes don't show?** Hard-refresh the browser: `Ctrl+Shift+R`

- **Need to deploy FAST without git?** Set `SAVE_TO_GIT=NO` in DEPLOY-CHANGES.bat

- **Changed firestore.rules?** Set `DEPLOY_RULES=YES` AND `DEPLOY_HOSTING=YES`

- **Changed Cloud Functions?** Set `DEPLOY_FUNCTIONS=YES` (hosting stays YES too)

---

## 📊 What Gets Deployed Where

```
Your Code (ConnectHub-SPA/src/)
    │
    ├── [npm run build] → Compiles to dist/
    │
    └── [firebase deploy --only hosting] → Live at https://lynkapp.net
            │
            ├── Firebase Project: lynkapp-c7db1
            ├── Hosting:          lynkapp.net (Firebase Hosting)
            ├── Database:         Firestore (lynkapp-c7db1)
            ├── Auth:             Firebase Authentication
            ├── Storage:          Firebase Storage
            └── Functions:        Cloud Functions (Node.js 22)
```

---

*File: `ConnectHub-SPA/HOW-TO-DEPLOY.md` — Last updated: 2026-06-09*
