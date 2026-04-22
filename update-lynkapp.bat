@echo off
REM ===================================================================
REM LynkApp - Quick Update Script  v4.0
REM FIXED: Now deploys from LynkApp-Production-App/ (the real prod app)
REM        Previously deployed ConnectHub_Mobile_Design.html (wrong!)
REM
REM CHANGES v4.0 (2026-04-22):
REM   - index.html: Fixed apple-touch-icon (was pointing to manifest.json)
REM   - index.html: Added null-safe navigation wrappers (try-catch guards)
REM       prevents switchBottomTab/PillTab/MainTab crashes
REM   - app-main.js: Fixed .nav-tab null crash in switchBottomTab (line 93)
REM   - app-main.js: Fixed getElementById null crash (line 88)
REM   - app-main.js: Fixed showAppAfterLogin null crashes (line 9234)
REM   - fix-lynkapp-loading.js: Added comprehensive fix script
REM
REM CHANGES v3.0 (2026-04-22):
REM   - Added performance-optimizer.js and accessibility.js
REM   - splash-init.js v3 (removed double-timer causing stuck splash)
REM   - app-main.js: fixed implicit event.currentTarget JS errors
REM   - index.html: fixed stat label typo, async service loading
REM   - lynkapp-main.css: added lynk-fadeIn animation
REM ===================================================================
setlocal EnableDelayedExpansion

echo.
echo ===================================================================
echo   LynkApp - Quick Update Script  v4.0
echo   Source: LynkApp-Production-App/
echo   Target: s3://lynkapp.net  ^(https://lynkapp.net^)
echo ===================================================================
echo.

REM Check if production app folder exists
if not exist "LynkApp-Production-App\index.html" (
    echo [ERROR] LynkApp-Production-App\index.html not found!
    echo Current directory: %CD%
    echo Make sure you are running from: c:\Users\Jnewball\Test-apps\Test-apps
    pause
    exit /b 1
)

set BUCKET_NAME=lynkapp.net
set CF_ID=E1K6OG7GOLIRJ2

echo Source folder: LynkApp-Production-App\
echo Bucket:  %BUCKET_NAME%
echo CF Dist: %CF_ID%
echo.

REM ---------------------------------------------------------------
REM [0/5] Run the loading fix script to ensure all fixes are applied
REM       This is idempotent - safe to run multiple times
REM ---------------------------------------------------------------
echo [0/5] Running loading fix script (idempotent - ensures all fixes applied)...
node fix-lynkapp-loading.js
if %ERRORLEVEL% neq 0 (
    echo [WARN] fix-lynkapp-loading.js had an issue, continuing...
)
echo.

REM ---------------------------------------------------------------
REM [1/5] Sync the entire LynkApp-Production-App/ to S3
REM       This is the self-contained production app with:
REM         index.html, css/lynkapp-main.css, js/*.js, services/
REM ---------------------------------------------------------------
echo [1/5] Syncing LynkApp-Production-App/ to S3...

aws s3 sync LynkApp-Production-App/ s3://%BUCKET_NAME%/ ^
    --exclude "*.backup" ^
    --exclude "*.map" ^
    --cache-control "max-age=300"

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Sync failed! Possible causes:
    echo   - AWS CLI not configured  ^(run: aws configure^)
    echo   - No permission to access bucket
    echo.
    pause
    exit /b 1
)

echo   Synced LynkApp-Production-App/ to s3://%BUCKET_NAME%/
echo.

REM ---------------------------------------------------------------
REM [2/5] Upload index.html with no-cache (always get latest HTML)
REM ---------------------------------------------------------------
echo [2/5] Uploading index.html ^(no-cache^)...

aws s3 cp LynkApp-Production-App\index.html s3://%BUCKET_NAME%/index.html ^
    --content-type "text/html" ^
    --cache-control "no-cache, no-store, must-revalidate"

echo   Uploaded index.html ^(no-cache^)

REM ---------------------------------------------------------------
REM [3/5] Upload sw.js with no-cache (critical for cache updates!)
REM       Browsers check sw.js byte-for-byte — must be no-cache
REM ---------------------------------------------------------------
echo [3/5] Uploading sw.js ^(no-cache — critical!^)...

aws s3 cp LynkApp-Production-App\sw.js s3://%BUCKET_NAME%/sw.js ^
    --content-type "application/javascript" ^
    --cache-control "no-cache, no-store, must-revalidate"

echo   Uploaded sw.js ^(no-cache^)

REM ---------------------------------------------------------------
REM [4/5] Upload critical JS files with no-cache
REM ---------------------------------------------------------------
echo [4/5] Uploading critical JS files ^(no-cache^)...

aws s3 cp LynkApp-Production-App\js\splash-init.js s3://%BUCKET_NAME%/js/splash-init.js ^
    --content-type "application/javascript" ^
    --cache-control "no-cache, no-store, must-revalidate"

echo   Uploaded js/splash-init.js ^(no-cache^)

aws s3 cp LynkApp-Production-App\js\app-main.js s3://%BUCKET_NAME%/js/app-main.js ^
    --content-type "application/javascript" ^
    --cache-control "no-cache, no-store, must-revalidate"

echo   Uploaded js/app-main.js ^(no-cache - loading fixes v4^)

REM ---------------------------------------------------------------
REM [5/5] Invalidate CloudFront cache
REM ---------------------------------------------------------------
echo.
echo [5/5] Invalidating CloudFront cache ^(%CF_ID%^)...

aws cloudfront create-invalidation --distribution-id %CF_ID% --paths "/*"

if %ERRORLEVEL% equ 0 (
    echo   CloudFront invalidation submitted successfully.
) else (
    echo   [WARN] CloudFront invalidation failed — check AWS credentials.
)

echo.
echo ===================================================================
echo   UPDATE COMPLETE!  v4.0 — App Loading Fixes Applied
echo ===================================================================
echo.
echo Live at:
echo   https://lynkapp.net
echo.
echo Files deployed from LynkApp-Production-App/:
echo   index.html               ^(HTML — apple-touch-icon fixed, nav safety wrappers^)
echo   css/lynkapp-main.css     ^(CSS  — splash screen + app container styles^)
echo   js/app-main.js           ^(JS   — null crashes fixed: nav-tab, showAppAfterLogin^)
echo   js/splash-init.js        ^(JS   — v3: removed window.load double-timer^)
echo   js/performance-optimizer.js  ^(lazy load + resize throttle^)
echo   js/accessibility.js      ^(keyboard nav + screen reader support^)
echo   js/ux-gap-fixes.js       ^(GAP fixes 1-10^)
echo   js/sidebar-nav.js        ^(sidebar + nav fixes^)
echo   js/medium-priority-fixes.js  ^(GAP fixes 11-20^)
echo   js/user-testing-fixes.js ^(demo login + placeholders^)
echo   sw.js                    ^(service worker^)
echo.
echo KEY FIXES v4.0:
echo   - apple-touch-icon no longer points to manifest.json
echo   - switchBottomTab/PillTab/MainTab wrapped in try-catch
echo   - showAppAfterLogin has null checks for loginScreen + app-container
echo   - .nav-tab null crash fixed in switchBottomTab
echo   - getElementById screen null crash fixed
echo.
echo KEY FIX v3: Splash screen now dismisses in ~2.5s ^(was timing out 6-10s+^)
echo.
echo CloudFront will clear in ~30 seconds.
echo Force-refresh: Ctrl+Shift+R  ^(or clear site data if on mobile^)
echo.

set /p OPEN_SITE="Open https://lynkapp.net now? (Y/N): "
if /i "!OPEN_SITE!"=="Y" (
    start https://lynkapp.net
)

echo.
pause
