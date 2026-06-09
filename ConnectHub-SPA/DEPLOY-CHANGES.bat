@echo off
setlocal enabledelayedexpansion
color 0A

echo.
echo  ============================================================
echo   LYNKAPP — DEPLOY CHANGES  (lynkapp-c7db1 / lynkapp.net)
echo  ============================================================
echo.

REM ============================================================
REM  SECTION 1 — LOG YOUR CHANGES HERE BEFORE RUNNING
REM  Update this section every time you make changes.
REM  This serves as your running change-log / history.
REM ============================================================

set CHANGE_DATE=2026-06-09
set CHANGE_DESC=Updated deployment script with change log
set CHANGE_BY=Jnewball

REM  ---- RECENT CHANGES (update this section each deploy) ----
REM
REM  2026-06-09  Initial DEPLOY-CHANGES.bat created
REM
REM  TEMPLATE — copy/paste this line and fill it in each time:
REM  YYYY-MM-DD  [your name] — What you changed / fixed
REM
REM -----------------------------------------------------------

echo  Change:  %CHANGE_DESC%
echo  Date:    %CHANGE_DATE%
echo  By:      %CHANGE_BY%
echo.

REM ============================================================
REM  SECTION 2 — CHOOSE WHAT TO DEPLOY
REM
REM  Set to "YES" or "NO" for each item below.
REM  Most everyday code changes only need DEPLOY_HOSTING=YES.
REM  Only turn on the others when you changed those files.
REM ============================================================

set DEPLOY_HOSTING=YES
set DEPLOY_RULES=NO
set DEPLOY_INDEXES=NO
set DEPLOY_FUNCTIONS=NO
set DEPLOY_STORAGE=NO
set SAVE_TO_GIT=YES

REM  ---- WHAT EACH SWITCH DOES ----
REM
REM  DEPLOY_HOSTING   = Build React app + push to lynkapp.net
REM                     USE: Every time you change any .jsx/.js/.css
REM
REM  DEPLOY_RULES     = Push firestore.rules to Firebase
REM                     USE: When you edit ConnectHub-SPA\firestore.rules
REM
REM  DEPLOY_INDEXES   = Push firestore.indexes.json
REM                     USE: When you add/change Firestore indexes
REM
REM  DEPLOY_FUNCTIONS = Install deps + push Cloud Functions
REM                     USE: When you edit ConnectHub-SPA\functions\index.js
REM
REM  DEPLOY_STORAGE   = Push storage.rules
REM                     USE: When you edit ConnectHub-SPA\storage.rules
REM
REM  SAVE_TO_GIT      = git add + commit + push before deploying
REM                     USE: YES to keep GitHub in sync (recommended)
REM
REM ---------------------------------------------------------------

echo  Deploy settings:
echo    Hosting (build + upload) . . . %DEPLOY_HOSTING%
echo    Firestore security rules  . . . %DEPLOY_RULES%
echo    Firestore indexes . . . . . . . %DEPLOY_INDEXES%
echo    Cloud Functions . . . . . . . . %DEPLOY_FUNCTIONS%
echo    Storage rules . . . . . . . . . %DEPLOY_STORAGE%
echo    Save to GitHub  . . . . . . . . %SAVE_TO_GIT%
echo.
echo  Press ENTER to start deploying, or close this window to cancel.
pause
echo.

REM ============================================================
REM  SECTION 3 — AUTO-STEPS (no editing needed below this line)
REM ============================================================

cd /d "%~dp0"

REM -- Locate firebase CLI --
set FIREBASE="C:\Users\Jnewball\AppData\Roaming\npm\firebase.cmd"
if not exist %FIREBASE% (
  echo  ERROR: Firebase CLI not found at %FIREBASE%
  echo  Run:  npm install -g firebase-tools
  echo  Then: Run 1-firebase-login.bat to sign in.
  pause
  exit /b 1
)

REM ---- STEP A: Save to Git ----
if /i "%SAVE_TO_GIT%"=="YES" (
  echo ============================================================
  echo  [GIT] Saving changes to GitHub...
  echo ============================================================
  cd /d "%~dp0.."
  git add -A
  git commit -m "deploy: %CHANGE_DESC% [%CHANGE_DATE%]"
  git push
  if %errorlevel% neq 0 (
    echo  WARNING: Git push failed. Continuing with deploy anyway...
    echo  (This is OK if nothing changed or you have no remote set up.)
  ) else (
    echo  Git: Changes saved and pushed to GitHub OK.
  )
  cd /d "%~dp0"
  echo.
)

REM ---- STEP B: Deploy Firestore Rules ----
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

REM ---- STEP C: Deploy Firestore Indexes ----
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

REM ---- STEP D: Deploy Cloud Functions ----
if /i "%DEPLOY_FUNCTIONS%"=="YES" (
  echo ============================================================
  echo  [FUNCTIONS] Installing function dependencies...
  echo ============================================================
  cd "%~dp0functions"
  call npm install --silent
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

REM ---- STEP E: Deploy Storage Rules ----
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

REM ---- STEP F: Build + Deploy Hosting ----
if /i "%DEPLOY_HOSTING%"=="YES" (
  echo ============================================================
  echo  [BUILD] Compiling React app for production...
  echo  This takes 2-5 minutes — please wait.
  echo ============================================================
  echo.
  set NODE_OPTIONS=--max-old-space-size=4096
  call npm run build
  if %errorlevel% neq 0 (
    echo.
    echo  ============================================================
    echo   BUILD FAILED!
    echo   Read the red error above to find what file is broken.
    echo   Common fixes:
    echo     - Syntax error: fix the file shown in the error
    echo     - Missing import: check the import path
    echo     - Out of memory: already handled (4096MB set)
    echo  ============================================================
    pause
    exit /b 1
  )
  echo.
  echo  Build complete. Uploading to Firebase Hosting...
  %FIREBASE% deploy --only hosting
  if %errorlevel% neq 0 (
    echo.
    echo  ============================================================
    echo   HOSTING DEPLOY FAILED!
    echo   Most likely cause: not logged in to Firebase.
    echo   Fix: Run 1-firebase-login.bat then try again.
    echo  ============================================================
    pause
    exit /b 1
  )
  echo.
)

REM ---- SUCCESS ----
echo.
echo  ============================================================
echo.
echo    ALL DONE!  LynkApp is live at:
echo.
echo      https://lynkapp.net
echo.
echo    What was deployed:
if /i "%DEPLOY_RULES%"=="YES"     echo      - Firestore security rules
if /i "%DEPLOY_INDEXES%"=="YES"   echo      - Firestore indexes
if /i "%DEPLOY_FUNCTIONS%"=="YES" echo      - Cloud Functions
if /i "%DEPLOY_STORAGE%"=="YES"   echo      - Storage rules
if /i "%DEPLOY_HOSTING%"=="YES"   echo      - React app (hosting)
if /i "%SAVE_TO_GIT%"=="YES"      echo      - Saved to GitHub
echo.
echo    Change logged: %CHANGE_DESC% (%CHANGE_DATE%)
echo.
echo  ============================================================
pause
