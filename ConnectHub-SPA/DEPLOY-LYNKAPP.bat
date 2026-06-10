@echo off
setlocal enabledelayedexpansion
color 0A
title LynkApp Deploy

echo.
echo  ============================================================
echo   LYNKAPP — ONE-CLICK DEPLOY
echo   Project: lynkapp-c7db1   Live URL: https://lynkapp.net
echo  ============================================================
echo.

REM ============================================================
REM  STEP 1 — UPDATE THIS SECTION BEFORE EVERY DEPLOY
REM  Right-click this file → Edit, update the 3 lines below,
REM  then add a new line to the RECENT CHANGES log, then Save.
REM ============================================================

set CHANGE_DATE=2026-06-10
set CHANGE_DESC=Fix login page cache issue + confirm lightning bolt logo + redeploy to lynkapp.net
set CHANGE_BY=Jnewball

REM  ── RECENT CHANGES LOG — add a new line every deploy ──────
REM  Template: YYYY-MM-DD  Name — What you changed
REM
REM  2026-06-10  Jnewball — Fix login page cache issue + confirm lightning bolt logo + redeploy to lynkapp.net
REM  2026-06-10  Jnewball — Add admin shield button in TopNav + User View toggle + login redirect fix
REM  2026-06-09  Jnewball — Fix login page - rebuild to show lightning bolt logo
REM  2026-06-09  Jnewball — Initial combined deploy bat created
REM
REM  ──────────────────────────────────────────────────────────

REM ============================================================
REM  STEP 2 — CHOOSE WHAT TO DEPLOY  (YES or NO)
REM
REM  Normal code change (edited .jsx/.js/.css)?
REM    → Only DEPLOY_HOSTING=YES needed
REM
REM  Edited firestore.rules?        → DEPLOY_RULES=YES
REM  Edited firestore.indexes.json? → DEPLOY_INDEXES=YES
REM  Edited functions/index.js?     → DEPLOY_FUNCTIONS=YES
REM  Edited storage.rules?          → DEPLOY_STORAGE=YES
REM  Want to save code to GitHub?   → SAVE_TO_GIT=YES
REM ============================================================

set DEPLOY_HOSTING=YES
set DEPLOY_RULES=NO
set DEPLOY_INDEXES=NO
set DEPLOY_FUNCTIONS=NO
set DEPLOY_STORAGE=NO
set SAVE_TO_GIT=YES

REM ============================================================
REM  NOTHING TO EDIT BELOW THIS LINE
REM ============================================================

echo  Change:   %CHANGE_DESC%
echo  Date:     %CHANGE_DATE%
echo  By:       %CHANGE_BY%
echo.
echo  Will deploy:
if /i "%DEPLOY_HOSTING%"=="YES"   echo    [YES] Hosting  — npm install + npm run build + firebase hosting
if /i "%DEPLOY_HOSTING%"=="NO"    echo    [NO]  Hosting
if /i "%DEPLOY_RULES%"=="YES"     echo    [YES] Firestore Rules
if /i "%DEPLOY_RULES%"=="NO"      echo    [NO]  Firestore Rules
if /i "%DEPLOY_INDEXES%"=="YES"   echo    [YES] Firestore Indexes
if /i "%DEPLOY_INDEXES%"=="NO"    echo    [NO]  Firestore Indexes
if /i "%DEPLOY_FUNCTIONS%"=="YES" echo    [YES] Cloud Functions
if /i "%DEPLOY_FUNCTIONS%"=="NO"  echo    [NO]  Cloud Functions
if /i "%DEPLOY_STORAGE%"=="YES"   echo    [YES] Storage Rules
if /i "%DEPLOY_STORAGE%"=="NO"    echo    [NO]  Storage Rules
if /i "%SAVE_TO_GIT%"=="YES"      echo    [YES] Save to GitHub
if /i "%SAVE_TO_GIT%"=="NO"       echo    [NO]  Save to GitHub
echo.
echo  Press ENTER to start or close this window to cancel.
pause
echo.

REM ── Locate the project folder ────────────────────────────────
cd /d "%~dp0"

REM ── Locate Firebase CLI ──────────────────────────────────────
set FIREBASE=firebase
where firebase >nul 2>&1
if %errorlevel% neq 0 (
  if exist "C:\Users\Jnewball\AppData\Roaming\npm\firebase.cmd" (
    set FIREBASE="C:\Users\Jnewball\AppData\Roaming\npm\firebase.cmd"
  ) else (
    echo  ============================================================
    echo   Firebase CLI not found!
    echo.
    echo   Fix: Open a Command Prompt and run:
    echo     npm install -g firebase-tools
    echo.
    echo   Then log in by running:
    echo     firebase login
    echo  ============================================================
    pause
    exit /b 1
  )
)

REM ── Check Firebase login status ──────────────────────────────
echo  Checking Firebase login...
echo [STEP: Checking Firebase login...] > "%~dp0deploy-log.txt"
call %FIREBASE% projects:list >nul 2>&1
if %errorlevel% neq 0 (
  echo.
  echo  ============================================================
  echo   Not logged in to Firebase!
  echo.
  echo   A browser window will open — sign in with the Google
  echo   account that owns lynkapp-c7db1, then come back here.
  echo  ============================================================
  echo.
  echo [STEP: Running firebase login...] >> "%~dp0deploy-log.txt"
  call %FIREBASE% login
  if %errorlevel% neq 0 (
    echo [FAILED: firebase login returned error] >> "%~dp0deploy-log.txt"
    echo  Login failed. Please try again.
    pause
    exit /b 1
  )
)
echo  Firebase: Logged in OK.
echo [STEP: Firebase login OK] >> "%~dp0deploy-log.txt"
echo.

REM ── STEP A: Save to Git ──────────────────────────────────────
if /i "%SAVE_TO_GIT%"=="YES" (
  echo  ============================================================
  echo   [GIT] Saving changes to GitHub...
  echo  ============================================================
  echo [STEP: Git add+commit+push] >> "%~dp0deploy-log.txt"
  cd /d "%~dp0.."
  git add -A
  git commit -m "deploy: %CHANGE_DESC% [%CHANGE_DATE%]"
  if %errorlevel% neq 0 (
    echo   (Nothing new to commit — that's OK, continuing...)
  )
  git push
  if %errorlevel% neq 0 (
    echo   WARNING: Git push failed. Continuing with deploy anyway.
    echo   (OK if no GitHub remote is set up.)
    echo [WARN: git push failed - continuing] >> "%~dp0deploy-log.txt"
  ) else (
    echo   Git: Pushed to GitHub OK.
    echo [STEP: Git push OK] >> "%~dp0deploy-log.txt"
  )
  cd /d "%~dp0"
  echo.
)

REM ── STEP B: Firestore Security Rules ─────────────────────────
if /i "%DEPLOY_RULES%"=="YES" (
  echo  ============================================================
  echo   [RULES] Deploying Firestore security rules...
  echo  ============================================================
  call %FIREBASE% deploy --only firestore:rules
  if %errorlevel% neq 0 (
    echo   ERROR deploying Firestore rules.
    pause
    exit /b 1
  )
  echo   Rules deployed OK.
  echo.
)

REM ── STEP C: Firestore Indexes ─────────────────────────────────
if /i "%DEPLOY_INDEXES%"=="YES" (
  echo  ============================================================
  echo   [INDEXES] Deploying Firestore indexes...
  echo  ============================================================
  call %FIREBASE% deploy --only firestore:indexes
  if %errorlevel% neq 0 (
    echo   ERROR deploying indexes.
    pause
    exit /b 1
  )
  echo   Indexes deployed OK.
  echo.
)

REM ── STEP D: Cloud Functions ───────────────────────────────────
if /i "%DEPLOY_FUNCTIONS%"=="YES" (
  echo  ============================================================
  echo   [FUNCTIONS] Installing function dependencies...
  echo  ============================================================
  cd "%~dp0functions"
  call npm install
  if %errorlevel% neq 0 (
    echo   ERROR: npm install failed inside functions/.
    pause
    exit /b 1
  )
  cd "%~dp0"
  echo   Deploying Cloud Functions to Firebase...
  call %FIREBASE% deploy --only functions
  if %errorlevel% neq 0 (
    echo   ERROR deploying functions.
    pause
    exit /b 1
  )
  echo   Functions deployed OK.
  echo.
)

REM ── STEP E: Storage Rules ─────────────────────────────────────
if /i "%DEPLOY_STORAGE%"=="YES" (
  echo  ============================================================
  echo   [STORAGE] Deploying storage rules...
  echo  ============================================================
  call %FIREBASE% deploy --only storage
  if %errorlevel% neq 0 (
    echo   WARNING: Storage rules failed. Continuing anyway.
  ) else (
    echo   Storage rules deployed OK.
  )
  echo.
)

REM ── STEP F: Build + Deploy Hosting ───────────────────────────
if /i "%DEPLOY_HOSTING%"=="YES" (
  echo  ============================================================
  echo   [NPM INSTALL] Checking/updating dependencies...
  echo  ============================================================
  echo [STEP: npm install] >> "%~dp0deploy-log.txt"
  call npm install
  if %errorlevel% neq 0 (
    echo [FAILED: npm install] >> "%~dp0deploy-log.txt"
    echo   ERROR: npm install failed.
    echo   Try deleting node_modules and running again.
    pause
    exit /b 1
  )
  echo   Dependencies OK.
  echo [STEP: npm install OK] >> "%~dp0deploy-log.txt"
  echo.

  echo  ============================================================
  echo   [BUILD] Compiling React app with Vite (1-5 min)...
  echo  ============================================================
  echo.
  echo [STEP: npm run build starting...] >> "%~dp0deploy-log.txt"
  set NODE_OPTIONS=--max-old-space-size=4096
  call npm run build
  if %errorlevel% neq 0 (
    echo [FAILED: npm run build] >> "%~dp0deploy-log.txt"
    echo.
    echo  ============================================================
    echo   BUILD FAILED!
    echo.
    echo   Read the error above — it tells you exactly which file
    echo   has a problem. Common causes:
    echo     * Syntax error  → fix the file listed in the error
    echo     * Bad import    → check the import path is correct
    echo     * Missing pkg   → run:  npm install package-name
    echo  ============================================================
    pause
    exit /b 1
  )
  echo.
  echo   Build complete! Output in: dist/
  echo [STEP: Build OK] >> "%~dp0deploy-log.txt"
  echo.

  echo  ============================================================
  echo   [HOSTING] Uploading to Firebase Hosting (lynkapp.net)...
  echo  ============================================================
  echo [STEP: firebase deploy --only hosting] >> "%~dp0deploy-log.txt"
  call %FIREBASE% deploy --only hosting
  if %errorlevel% neq 0 (
    echo [FAILED: firebase deploy --only hosting] >> "%~dp0deploy-log.txt"
    echo.
    echo  ============================================================
    echo   HOSTING DEPLOY FAILED!
    echo   Most likely: Firebase session expired.
    echo   Run this file again — it will re-open the login page.
    echo  ============================================================
    pause
    exit /b 1
  )
  echo [STEP: Hosting deploy OK] >> "%~dp0deploy-log.txt"
  echo.
)

REM ── SUCCESS ───────────────────────────────────────────────────
echo.
echo  ============================================================
echo.
echo    ALL DONE!  LynkApp is live at:
echo.
echo      https://lynkapp.net
echo      https://lynkapp-c7db1.web.app
echo.
echo    What was deployed:
if /i "%SAVE_TO_GIT%"=="YES"      echo      [OK] Code saved to GitHub
if /i "%DEPLOY_RULES%"=="YES"     echo      [OK] Firestore security rules
if /i "%DEPLOY_INDEXES%"=="YES"   echo      [OK] Firestore indexes
if /i "%DEPLOY_FUNCTIONS%"=="YES" echo      [OK] Cloud Functions
if /i "%DEPLOY_STORAGE%"=="YES"   echo      [OK] Storage rules
if /i "%DEPLOY_HOSTING%"=="YES"   echo      [OK] React app (hosting)
echo.
echo    Change: %CHANGE_DESC%
echo    Date:   %CHANGE_DATE%
echo    By:     %CHANGE_BY%
echo.
echo  ============================================================

REM ── Write deploy log ──────────────────────────────────────────
echo [%CHANGE_DATE%] DEPLOY SUCCESS > "%~dp0deploy-log.txt"
echo Change: %CHANGE_DESC% >> "%~dp0deploy-log.txt"
echo By: %CHANGE_BY% >> "%~dp0deploy-log.txt"
echo Hosting: %DEPLOY_HOSTING% >> "%~dp0deploy-log.txt"
echo Git: %SAVE_TO_GIT% >> "%~dp0deploy-log.txt"
echo. >> "%~dp0deploy-log.txt"
echo Log saved to: %~dp0deploy-log.txt
echo.
echo  Press any key to close this window...
pause >nul
