@echo off
REM ============================================================
REM LynkApp — Deploy Live Streaming V2 to lynkapp.net
REM Run this from ConnectHub-SPA\ directory
REM ============================================================
echo.
echo ====================================================
echo  LynkApp Live Streaming V2 — Deployment Script
echo  Target: lynkapp.net (Firebase Hosting)
echo ====================================================
echo.

cd /d "%~dp0"

REM STEP 1: Verify .env has required vars
echo [1/6] Checking environment variables...
if not exist ".env" (
    echo ERROR: .env file not found!
    echo Copy .env.example to .env and fill in your values.
    pause
    exit /b 1
)
echo   .env found OK

REM Check for Firebase vars (required)
findstr /C:"VITE_FIREBASE_API_KEY" .env >nul 2>&1
if errorlevel 1 (
    echo ERROR: VITE_FIREBASE_API_KEY missing from .env
    pause
    exit /b 1
)
echo   Firebase vars: OK

REM Check for Mux (optional — features degrade gracefully if missing)
findstr /C:"VITE_MUX_ENV_KEY=your_" .env >nul 2>&1
if not errorlevel 1 (
    echo   WARNING: VITE_MUX_ENV_KEY is still a placeholder.
    echo           Mux live streaming will use legacy WebRTC fallback.
    echo           Get your Mux key at: https://mux.com
)
findstr /C:"VITE_MUX_ENV_KEY=" .env >nul 2>&1
if not errorlevel 1 (
    echo   Mux env key: found
)

REM Check for Stripe (optional — coin features degrade gracefully)
findstr /C:"VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR" .env >nul 2>&1
if not errorlevel 1 (
    echo   WARNING: VITE_STRIPE_PUBLISHABLE_KEY is still a placeholder.
    echo           Coin purchases will show UI but transactions won't process.
    echo           Get your Stripe key at: https://dashboard.stripe.com
)

echo.

REM STEP 2: Install dependencies if needed
echo [2/6] Checking dependencies...
if not exist "node_modules" (
    echo   Installing npm packages...
    call npm install
    if errorlevel 1 (
        echo ERROR: npm install failed
        pause
        exit /b 1
    )
) else (
    echo   node_modules found OK
)

echo.

REM STEP 3: Production build
echo [3/6] Building production bundle...
call npm run build 2>&1
if errorlevel 1 (
    echo ERROR: Build failed! Fix errors above before deploying.
    pause
    exit /b 1
)
echo   Build: PASSED

echo.

REM STEP 4: Deploy Firestore rules (streamKey protection)
echo [4/6] Deploying Firestore security rules...
call firebase deploy --only firestore:rules 2>&1
if errorlevel 1 (
    echo WARNING: Firestore rules deployment failed.
    echo Check firebase login status: firebase login
    echo Continuing with hosting deployment...
) else (
    echo   Firestore rules: DEPLOYED
)

echo.

REM STEP 5: Deploy Firebase Functions (onStreamGoLive notification)
echo [5/6] Deploying Cloud Function: onStreamGoLive...
call firebase deploy --only functions:onStreamGoLive 2>&1
if errorlevel 1 (
    echo WARNING: Functions deployment failed.
    echo This is OK — existing streams still work without this function.
    echo To fix: cd functions && npm install && cd ..
) else (
    echo   onStreamGoLive function: DEPLOYED
)

echo.

REM STEP 6: Deploy frontend hosting
echo [6/6] Deploying frontend to Firebase Hosting (lynkapp.net)...
call firebase deploy --only hosting 2>&1
if errorlevel 1 (
    echo ERROR: Hosting deployment failed!
    echo Check: firebase login --reauth
    pause
    exit /b 1
)

echo.
echo ====================================================
echo  DEPLOYMENT COMPLETE!
echo ====================================================
echo.
echo  Live at: https://lynkapp.net
echo.
echo  SMOKE TEST — Check these within 10 minutes:
echo   1. Login with email/password still works
echo   2. Feed still loads
echo   3. Live page loads at /live
echo   4. Click a stream card — watch page opens
echo   5. Chat messages send in watch page
echo   6. Admin dashboard still loads at /admin
echo   7. New: /admin/streams shows streams monitor
echo   8. New: /wallet/buy-coins page loads
echo.
echo  NEW FEATURES STATUS:
echo   - Mux streaming: active if VITE_MUX_ENV_KEY is set
echo   - Coin purchases: active if VITE_STRIPE_PUBLISHABLE_KEY is set
echo   - Legacy WebRTC: active as fallback (always works)
echo.
echo  If anything is broken, rollback with:
echo    firebase hosting:rollback
echo.
pause
