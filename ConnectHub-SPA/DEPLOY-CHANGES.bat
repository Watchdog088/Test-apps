@echo off
setlocal enabledelayedexpansion
color 0A

echo.
echo  ============================================================
echo   LYNKAPP — DEPLOY CHANGES  (lynkapp-c7db1 / lynkapp.net)
echo  ============================================================
echo.
echo  HOW TO USE THIS FILE:
echo  ─────────────────────
echo  1. Open this file in Notepad (right-click → Edit)
echo  2. In SECTION 1 below, update:
echo       CHANGE_DATE  = today's date (YYYY-MM-DD)
echo       CHANGE_DESC  = one-line summary of what you changed
echo       CHANGE_BY    = your name
echo  3. Also copy that line into the RECENT CHANGES log below it
echo  4. In SECTION 2, set YES/NO for what to deploy (usually
echo     only DEPLOY_HOSTING=YES is needed for code changes)
echo  5. Save the file, then DOUBLE-CLICK it to run
echo  ─────────────────────────────────────────────────────────
echo  The bat will automatically:
echo    a) npm install  (install/update dependencies)
echo    b) npm run build (compile React app to dist/)
echo    c) git add + commit + push (save to GitHub)
echo    d) firebase deploy --only hosting (go live at lynkapp.net)
echo  ─────────────────────────────────────────────────────────
echo.

REM ============================================================
REM  SECTION 1 — LOG YOUR CHANGES HERE BEFORE RUNNING
REM  Update CHANGE_DATE, CHANGE_DESC, CHANGE_BY each deploy.
REM  Then copy the line into the RECENT CHANGES log below.
REM ============================================================

set CHANGE_DATE=2026-06-09
set CHANGE_DESC=DEPLOY-CHANGES.bat updated with clear workflow instructions
set CHANGE_BY=Jnewball

REM  ──────────────────────────────────────────────────────────
REM  RECENT CHANGES — add a new line here every deploy
REM  Copy this template:
REM    YYYY-MM-DD  [name] — What you changed / fixed
REM  ──────────────────────────────────────────────────────────
REM
REM  2026-06-09  Jnewball — DEPLOY-CHANGES.bat updated with clear workflow instructions
REM  2026-06-09  Jnewball — Initial DEPLOY-CHANGES.bat created
REM
REM  ──────────────────────────────────────────────────────────

echo  Change:  %CHANGE_DESC%
echo  Date:    %CHANGE_DATE%
echo  By:      %CHANGE_BY%
echo.

REM ============================================================
REM  SECTION 2 — CHOOSE WHAT TO DEPLOY
REM
REM  Set YES or NO for each item.
REM  ➤  For everyday code changes:   only DEPLOY_HOSTING=YES
REM  ➤  Edited firestore.rules:      also set DEPLOY_RULES=YES
REM  ➤  Added a Firestore index:     also set DEPLOY_INDEXES=YES
REM  ➤  Edited functions/index.js:   also set DEPLOY_FUNCTIONS=YES
REM  ➤  Edited storage.rules:        also set DEPLOY_STORAGE=YES
REM ============================================================

set DEPLOY_HOSTING=YES
set DEPLOY_RULES=NO
set DEPLOY_INDEXES=NO
set DEPLOY_FUNCTIONS=NO
set DEPLOY_STORAGE=NO
set SAVE_TO_GIT=YES

REM  ── WHAT EACH SWITCH DOES ──────────────────────────────────
REM
REM  DEPLOY_HOSTING   = npm install + npm run build + firebase deploy --only hosting
REM                     Pushes built app to https://lynkapp.net
REM                     ✅ USE: Any time you change .jsx / .js / .css files
REM
REM  DEPLOY_RULES     = firebase deploy --only firestore:rules
REM                     ✅ USE: When you edit  ConnectHub-SPA\firestore.rules
REM
REM  DEPLOY_INDEXES   = firebase deploy --only firestore:indexes
REM                     ✅ USE: When you edit  ConnectHub-SPA\firestore.indexes.json
REM
REM  DEPLOY_FUNCTIONS = npm install in functions/ + firebase deploy --only functions
REM                     ✅ USE: When you edit  ConnectHub-SPA\functions\index.js
REM
REM  DEPLOY_STORAGE   = firebase deploy --only storage
REM                     ✅ USE: When you edit  ConnectHub-SPA\storage.rules
REM
REM  SAVE_TO_GIT      = git add -A + git commit + git push
REM                     ✅ Keeps GitHub in sync (recommended — leave YES)
REM
REM  ──────────────────────────────────────────────────────────

echo  Deploy settings:
echo    Hosting (build + upload)  . . .  %DEPLOY_HOSTING%
echo    Firestore security rules  . . .  %DEPLOY_RULES%
echo    Firestore indexes . . . . . . .  %DEPLOY_INDEXES%
echo    Cloud Functions . . . . . . . .  %DEPLOY_FUNCTIONS%
echo    Storage rules . . . . . . . . .  %DEPLOY_STORAGE%
echo    Save to GitHub  . . . . . . . .  %SAVE_TO_GIT%
echo.
echo  Press ENTER to start deploying, or close this window to cancel.
pause
echo.

REM ============================================================
REM  AUTO-STEPS — no editing needed below this line
REM ============================================================

cd /d "%~dp0"

REM -- Locate Firebase CLI --
set FIREBASE=firebase
where firebase >nul 2>&1
if %errorlevel% neq 0 (
  set FIREBASE="C:\Users\Jnewball\AppData\Roaming\npm\firebase.cmd"
)
if not exist "%~dp0..\node_modules\.bin\firebase" (
  where firebase >nul 2>&1
  if %errorlevel% neq 0 (
    echo  ERROR: Firebase CLI not found.
    echo  Fix: Run this command once:
    echo    npm install -g firebase-tools
    echo  Then run 1-firebase-login.bat to sign in.
    pause
    exit /b 1
  )
)

REM ─── STEP A: Save to Git ────────────────────────────────────
if /i "%SAVE_TO_GIT%"=="YES" (
  echo ============================================================
  echo  [GIT] Saving changes to GitHub...
  echo ============================================================
  cd /d "%~dp0.."
  git add -A
  git commit -m "deploy: %CHANGE_DESC% [%CHANGE_DATE%]"
  if %errorlevel% neq 0 (
    echo  (Nothing new to commit or commit failed — continuing...)
  )
  git push
  if %errorlevel% neq 0 (
    echo  WARNING: Git push failed. Continuing with deploy anyway.
    echo  (OK if you have no remote, or nothing changed in git.)
  ) else (
    echo  Git: Pushed to GitHub OK.
  )
  cd /d "%~dp0"
  echo.
)

REM ─── STEP B: Deploy Firestore Rules ─────────────────────────
if /i "%DEPLOY_RULES%"=="YES" (
  echo ============================================================
  echo  [RULES] Deploying Firestore security rules...
  echo ============================================================
  %FIREBASE% deploy --only firestore:rules
  if %errorlevel% neq 0 (
    echo  ERROR deploying rules. Are you logged in?
    echo  Run 1-firebase-login.bat and try again.
    pause
    exit /b 1
  )
  echo  Rules deployed OK.
  echo.
)

REM ─── STEP C: Deploy Firestore Indexes ───────────────────────
if /i "%DEPLOY_INDEXES%"=="YES" (
  echo ============================================================
  echo  [INDEXES] Deploying Firestore indexes...
  echo ============================================================
  %FIREBASE% deploy --only firestore:indexes
  if %errorlevel% neq 0 (
    echo  ERROR deploying indexes.
    pause
    exit /b 1
  )
  echo  Indexes deployed OK.
  echo.
)

REM ─── STEP D: Deploy Cloud Functions ─────────────────────────
if /i "%DEPLOY_FUNCTIONS%"=="YES" (
  echo ============================================================
  echo  [FUNCTIONS] Installing function dependencies...
  echo ============================================================
  cd "%~dp0functions"
  call npm install
  if %errorlevel% neq 0 (
    echo  ERROR installing function npm packages.
    pause
    exit /b 1
  )
  cd "%~dp0"
  echo  Deploying Cloud Functions...
  %FIREBASE% deploy --only functions
  if %errorlevel% neq 0 (
    echo  ERROR deploying functions.
    pause
    exit /b 1
  )
  echo  Functions deployed OK.
  echo.
)

REM ─── STEP E: Deploy Storage Rules ───────────────────────────
if /i "%DEPLOY_STORAGE%"=="YES" (
  echo ============================================================
  echo  [STORAGE] Deploying storage rules...
  echo ============================================================
  %FIREBASE% deploy --only storage
  if %errorlevel% neq 0 (
    echo  WARNING: Storage rules failed. Continuing anyway...
  ) else (
    echo  Storage rules deployed OK.
  )
  echo.
)

REM ─── STEP F: Build + Deploy Hosting ─────────────────────────
if /i "%DEPLOY_HOSTING%"=="YES" (
  echo ============================================================
  echo  [NPM] Installing / updating dependencies...
  echo  (Fast if already installed, slow only first time.)
  echo ============================================================
  call npm install
  if %errorlevel% neq 0 (
    echo  ERROR: npm install failed.
    echo  Try deleting node_modules folder and running again.
    pause
    exit /b 1
  )
  echo  Dependencies OK.
  echo.
  echo ============================================================
  echo  [BUILD] Compiling React app for production (Vite)...
  echo  This takes 1-5 minutes — please wait.
  echo ============================================================
  echo.
  set NODE_OPTIONS=--max-old-space-size=4096
  call npm run build
  if %errorlevel% neq 0 (
    echo.
    echo  ============================================================
    echo   BUILD FAILED!
    echo   Read the RED error above to find what file is broken.
    echo.
    echo   Common causes:
    echo     Syntax error     — fix the file listed in the error
    echo     Missing import   — check the import path in that file
    echo     Missing package  — run:  npm install package-name
    echo     Out of memory    — already handled (4096MB set above)
    echo  ============================================================
    pause
    exit /b 1
  )
  echo.
  echo  Build complete!  Output in:  dist/
  echo.
  echo ============================================================
  echo  [DEPLOY] Uploading to Firebase Hosting (lynkapp.net)...
  echo ============================================================
  %FIREBASE% deploy --only hosting
  if %errorlevel% neq 0 (
    echo.
    echo  ============================================================
    echo   HOSTING DEPLOY FAILED!
    echo   Most likely: not logged in to Firebase.
    echo   Fix: Run  1-firebase-login.bat  then try again.
    echo  ============================================================
    pause
    exit /b 1
  )
  echo.
)

REM ─── SUCCESS ─────────────────────────────────────────────────
echo.
echo  ============================================================
echo.
echo    ALL DONE!  LynkApp is live at:
echo.
echo      https://lynkapp.net
echo.
echo    Deployed:
if /i "%DEPLOY_RULES%"=="YES"     echo      ✓ Firestore security rules
if /i "%DEPLOY_INDEXES%"=="YES"   echo      ✓ Firestore indexes
if /i "%DEPLOY_FUNCTIONS%"=="YES" echo      ✓ Cloud Functions
if /i "%DEPLOY_STORAGE%"=="YES"   echo      ✓ Storage rules
if /i "%DEPLOY_HOSTING%"=="YES"   echo      ✓ React app (hosting)
if /i "%SAVE_TO_GIT%"=="YES"      echo      ✓ Saved to GitHub
echo.
echo    Change logged: %CHANGE_DESC%
echo    Date:          %CHANGE_DATE%
echo    By:            %CHANGE_BY%
echo.
echo  ============================================================
pause
