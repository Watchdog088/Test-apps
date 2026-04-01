@echo off
setlocal enabledelayedexpansion
REM ===================================================================
REM  LynkApp — QUICK UPDATE SCRIPT (Run this after every code change)
REM  Syncs all changed files to S3 without recreating the bucket
REM  Updated: April 2026 — includes LynkApp-Production-App + monitoring
REM ===================================================================

echo.
echo ===================================================================
echo   LynkApp — Quick Update (Sync to S3)
echo ===================================================================
echo.

REM ── Load saved bucket name ──────────────────────────────────────────
if not exist ".s3-bucket-name" (
    echo [ERROR] No saved bucket found!
    echo   Please run deploy-lynkapp-FINAL.bat first to set up the bucket.
    pause
    exit /b 1
)
set /p BUCKET_NAME=<.s3-bucket-name
echo   Bucket: !BUCKET_NAME!
echo.

REM ── Verify AWS credentials ──────────────────────────────────────────
aws sts get-caller-identity >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] AWS credentials not configured. Run: aws configure
    pause
    exit /b 1
)

echo   Syncing all changed files...
echo.

REM ── Upload index.html (always no-cache) ─────────────────────────────
echo [1/10] Uploading index.html...
aws s3 cp "ConnectHub-Frontend\index.html" s3://!BUCKET_NAME!/ ^
    --content-type "text/html; charset=utf-8" ^
    --cache-control "no-cache, no-store, must-revalidate" ^
    >nul 2>&1
echo [OK] index.html

REM ── Upload service worker (always no-cache) ─────────────────────────
if exist "ConnectHub-Frontend\service-worker.js" (
    aws s3 cp "ConnectHub-Frontend\service-worker.js" s3://!BUCKET_NAME!/ ^
        --content-type "application/javascript" ^
        --cache-control "no-cache" ^
        >nul 2>&1
)

REM ── Sync CSS files ──────────────────────────────────────────────────
echo [2/10] Syncing CSS files...
if exist "ConnectHub-Frontend\src\css\" (
    aws s3 sync "ConnectHub-Frontend\src\css\" s3://!BUCKET_NAME!/src/css/ ^
        --exclude "*" --include "*.css" ^
        --content-type "text/css" ^
        --cache-control "max-age=3600" ^
        >nul 2>&1
)
echo [OK] CSS synced

REM ── Sync Phase 1-10 service files (no-cache = always fresh) ─────────
echo [3/10] Syncing Phase 1-10 service files...
if exist "ConnectHub-Frontend\src\services\" (
    for %%F in ("ConnectHub-Frontend\src\services\*.js") do (
        aws s3 cp "%%F" s3://!BUCKET_NAME!/src/services/ ^
            --content-type "application/javascript; charset=utf-8" ^
            --cache-control "no-cache, no-store, must-revalidate" ^
            >nul 2>&1
    )
)
echo [OK] Service files synced (firebase-config, auth, messaging, etc.)

REM ── Sync UI JS scripts ──────────────────────────────────────────────
echo [4/10] Syncing UI JS scripts...
if exist "ConnectHub-Frontend\src\js\" (
    aws s3 sync "ConnectHub-Frontend\src\js\" s3://!BUCKET_NAME!/src/js/ ^
        --exclude "*" --include "*.js" ^
        --content-type "application/javascript; charset=utf-8" ^
        --cache-control "max-age=3600" ^
        >nul 2>&1
)
echo [OK] UI JS synced

REM ── Upload user testing fix files (no-cache) ────────────────────────
echo [5/10] Uploading user testing fix files...
if exist "ConnectHub-Frontend\src\js\user-testing-fixes.js" (
    aws s3 cp "ConnectHub-Frontend\src\js\user-testing-fixes.js" s3://!BUCKET_NAME!/src/js/ ^
        --content-type "application/javascript; charset=utf-8" ^
        --cache-control "no-cache, no-store, must-revalidate" ^
        >nul 2>&1
)
if exist "ConnectHub_Mobile_Design_Fixes.js" (
    aws s3 cp "ConnectHub_Mobile_Design_Fixes.js" s3://!BUCKET_NAME!/ ^
        --content-type "application/javascript; charset=utf-8" ^
        --cache-control "no-cache, no-store, must-revalidate" ^
        >nul 2>&1
)
echo [OK] User testing fixes synced

REM ── Upload main mobile design HTML (no-cache) ──────────────────────
echo [6/10] Uploading ConnectHub_Mobile_Design.html...
if exist "ConnectHub_Mobile_Design.html" (
    aws s3 cp "ConnectHub_Mobile_Design.html" s3://!BUCKET_NAME!/ ^
        --content-type "text/html; charset=utf-8" ^
        --cache-control "no-cache, no-store, must-revalidate" ^
        >nul 2>&1
)
echo [OK] Mobile design HTML synced

REM ── Sync extra HTML pages ───────────────────────────────────────────
echo [7/10] Syncing additional pages...
if exist "ConnectHub-Frontend\creator-profile.html" (
    aws s3 cp "ConnectHub-Frontend\creator-profile.html" s3://!BUCKET_NAME!/creator-profile.html ^
        --content-type "text/html; charset=utf-8" ^
        --cache-control "no-cache" ^
        >nul 2>&1
)
if exist "ConnectHub-Frontend\premium-profile.html" (
    aws s3 cp "ConnectHub-Frontend\premium-profile.html" s3://!BUCKET_NAME!/premium-profile.html ^
        --content-type "text/html; charset=utf-8" ^
        --cache-control "no-cache" ^
        >nul 2>&1
)
if exist "ConnectHub-Frontend\manifest.json" (
    aws s3 cp "ConnectHub-Frontend\manifest.json" s3://!BUCKET_NAME!/ ^
        --content-type "application/json" ^
        --cache-control "max-age=86400" ^
        >nul 2>&1
)
echo [OK] Additional pages synced

REM ── Sync LynkApp-Production-App (NEW — full production bundle) ──────
echo [8/10] Syncing LynkApp-Production-App (production bundle)...
if exist "LynkApp-Production-App\" (
    aws s3 sync "LynkApp-Production-App\" s3://!BUCKET_NAME!/LynkApp-Production-App/ ^
        --content-type "application/javascript; charset=utf-8" ^
        --cache-control "no-cache, no-store, must-revalidate" ^
        >nul 2>&1
    REM Override HTML/CSS/JSON content types
    if exist "LynkApp-Production-App\index.html" (
        aws s3 cp "LynkApp-Production-App\index.html" s3://!BUCKET_NAME!/LynkApp-Production-App/ ^
            --content-type "text/html; charset=utf-8" ^
            --cache-control "no-cache, no-store, must-revalidate" ^
            >nul 2>&1
    )
    if exist "LynkApp-Production-App\css\lynkapp-main.css" (
        aws s3 cp "LynkApp-Production-App\css\lynkapp-main.css" s3://!BUCKET_NAME!/LynkApp-Production-App/css/ ^
            --content-type "text/css; charset=utf-8" ^
            --cache-control "max-age=3600" ^
            >nul 2>&1
    )
    if exist "LynkApp-Production-App\manifest.json" (
        aws s3 cp "LynkApp-Production-App\manifest.json" s3://!BUCKET_NAME!/LynkApp-Production-App/ ^
            --content-type "application/json" ^
            --cache-control "max-age=86400" ^
            >nul 2>&1
    )
)
echo [OK] LynkApp-Production-App synced (17 files)

REM ── Upload admin dashboard (no-cache) ───────────────────────────────
echo [9/10] Uploading admin dashboard...
if exist "admin-dashboard.html" (
    aws s3 cp "admin-dashboard.html" s3://!BUCKET_NAME!/ ^
        --content-type "text/html; charset=utf-8" ^
        --cache-control "no-cache, no-store, must-revalidate" ^
        >nul 2>&1
)
echo [OK] Admin dashboard synced

REM ── Upload monitoring + production JS ───────────────────────────────
echo [10/10] Syncing monitoring and production JS...
if exist "ConnectHub-Frontend\production\js\" (
    aws s3 sync "ConnectHub-Frontend\production\js\" s3://!BUCKET_NAME!/production/js/ ^
        --exclude "*" --include "*.js" ^
        --content-type "application/javascript; charset=utf-8" ^
        --cache-control "no-cache, no-store, must-revalidate" ^
        >nul 2>&1
)
if exist "ConnectHub-Frontend\production\sw.js" (
    aws s3 cp "ConnectHub-Frontend\production\sw.js" s3://!BUCKET_NAME!/production/ ^
        --content-type "application/javascript" ^
        --cache-control "no-cache" ^
        >nul 2>&1
)
echo [OK] Monitoring + production JS synced

REM ── Done ────────────────────────────────────────────────────────────
echo.
echo ===================================================================
echo   UPDATE COMPLETE! (10/10 steps)
echo ===================================================================
echo.
echo   Files synced:
echo     - index.html + service worker
echo     - CSS, services, UI JS
echo     - User testing fixes
echo     - Mobile design HTML
echo     - Additional pages (creator, premium, manifest)
echo     - LynkApp-Production-App (17 production files)
echo     - Admin dashboard (with monitoring)
echo     - Production monitoring JS
echo.
echo   Live URL:
echo   http://!BUCKET_NAME!.s3-website-us-east-1.amazonaws.com
echo.
echo   Admin Dashboard:
echo   http://!BUCKET_NAME!.s3-website-us-east-1.amazonaws.com/admin-dashboard.html
echo.
echo ===================================================================
echo.
echo   TIP: Hard refresh your browser with Ctrl+Shift+R to clear cache
echo        and see your changes immediately.
echo.

set APP_URL=http://!BUCKET_NAME!.s3-website-us-east-1.amazonaws.com
set /p OPEN_SITE="   Open app in browser? (Y/N): "
if /i "!OPEN_SITE!"=="Y" (
    start !APP_URL!
)

echo.
pause
