@echo off
REM ============================================================
REM LynkApp — CRITICAL FIXES (Run This First!)
REM Beta Launch Checklist — Phase 1: Do Today
REM Updated: June 10, 2026 — All 3 service keys CONFIRMED
REM   Sentry DSN:      CONFIRMED (db9d71e2...)
REM   Metered TURN:    CONFIRMED (83d69637... — Jun-02-2026 creds)
REM   OneSignal AppID: CONFIRMED (00c74474...)
REM ============================================================
echo.
echo ============================================================
echo  LynkApp CRITICAL PRE-BETA FIXES
echo  Phase 1: Build + Deploy + Seed
echo  Keys Status: Sentry=LIVE  Metered=LIVE  OneSignal=LIVE
echo ============================================================
echo.

REM --- Step 1: Check .env has required keys ---
echo [1/6] Checking .env for required keys...
if not exist "%~dp0.env" (
    echo ERROR: .env file not found!
    echo Please copy .env.example to .env and fill in your values:
    echo   copy .env.example .env
    pause
    exit /b 1
)

findstr /C:"VITE_SENTRY_DSN=https://" "%~dp0.env" >nul 2>&1
if errorlevel 1 (
    echo.
    echo WARNING: VITE_SENTRY_DSN not set in .env
    echo Get your DSN free at: https://sentry.io
    echo Add to .env: VITE_SENTRY_DSN=https://YOUR_KEY@oXXXX.ingest.sentry.io/XXXXX
    echo.
    echo Press any key to continue anyway (Sentry is non-blocking)...
    pause > nul
)

findstr /C:"VITE_METERED_API_KEY=your_" "%~dp0.env" >nul 2>&1
if not errorlevel 1 (
    echo.
    echo WARNING: VITE_METERED_API_KEY is still a placeholder
    echo Get your FREE TURN credentials at: https://dashboard.metered.ca
    echo Add to .env:
    echo   VITE_METERED_API_KEY=your_real_key
    echo   VITE_TURN_USERNAME=your_real_username
    echo   VITE_TURN_PASSWORD=your_real_password
    echo.
    echo Video calls WILL FAIL on mobile data without TURN credentials.
    echo Press any key to continue anyway...
    pause > nul
)

REM --- Step 2: Install dependencies ---
echo.
echo [2/6] Installing npm dependencies...
cd /d "%~dp0"
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed. Check internet connection.
    pause
    exit /b 1
)
echo Dependencies installed OK.

REM --- Step 3: Build production ---
echo.
echo [3/6] Building production bundle...
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed! Check console output above for errors.
    pause
    exit /b 1
)
echo Build completed successfully.

REM --- Step 4: Deploy to Firebase Hosting ---
echo.
echo [4/6] Deploying to Firebase Hosting...
where firebase >nul 2>&1
if errorlevel 1 (
    echo Firebase CLI not found. Installing globally...
    call npm install -g firebase-tools
)
call firebase deploy --only hosting
if errorlevel 1 (
    echo ERROR: Firebase deploy failed.
    echo Make sure you are logged in: firebase login
    pause
    exit /b 1
)
echo Firebase hosting deployed successfully!

REM --- Step 5: Seed Admin Account ---
echo.
echo [5/6] Setting up admin account...
if exist "%~dp0seed-ceo-admin.cjs" (
    call node seed-ceo-admin.cjs
    echo Admin account setup complete.
) else (
    echo WARNING: seed-ceo-admin.cjs not found. Skipping admin setup.
)

REM --- Step 6: Seed Demo Content ---
echo.
echo [6/6] Seeding demo content (prevents empty feeds)...
if exist "%~dp0seed-demo-content.cjs" (
    call node seed-demo-content.cjs
    echo Demo content seeded successfully.
) else (
    echo WARNING: seed-demo-content.cjs not found. Skipping demo content.
)

echo.
echo ============================================================
echo  CRITICAL FIXES COMPLETE!
echo ============================================================
echo.
echo  Next Steps:
echo  1. Test the live site: https://lynkapp.com
echo  2. Sign in and verify the feed has content
echo  3. Test on mobile (iPhone Safari + Android Chrome)
echo  4. Run week-1-services-setup.bat for push notifications
echo.
echo  Smoke test checklist:
echo  - Feed loads with posts? [y/n]
echo  - Stories visible? [y/n]
echo  - Dating swipe works? [y/n]
echo  - Messages send in real-time? [y/n]
echo.
pause
