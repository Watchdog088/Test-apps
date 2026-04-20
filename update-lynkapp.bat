@echo off
REM ===================================================================
REM LynkApp - Quick Update Script
REM FIXED: Now deploys from LynkApp-Production-App/ (the real prod app)
REM        Previously deployed ConnectHub_Mobile_Design.html (wrong!)
REM ===================================================================
setlocal EnableDelayedExpansion

echo.
echo ===================================================================
echo   LynkApp - Quick Update Script
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
REM [1/4] Sync the entire LynkApp-Production-App/ to S3
REM       This is the self-contained production app with:
REM         index.html, css/lynkapp-main.css, js/*.js, services/
REM ---------------------------------------------------------------
echo [1/4] Syncing LynkApp-Production-App/ to S3...

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
REM [2/4] Upload index.html with no-cache (always get latest HTML)
REM ---------------------------------------------------------------
echo [2/4] Uploading index.html ^(no-cache^)...

aws s3 cp LynkApp-Production-App\index.html s3://%BUCKET_NAME%/index.html ^
    --content-type "text/html" ^
    --cache-control "no-cache, no-store, must-revalidate"

echo   Uploaded index.html ^(no-cache^)

REM ---------------------------------------------------------------
REM [3/4] Upload sw.js with no-cache (critical for cache updates!)
REM       Browsers check sw.js byte-for-byte — must be no-cache
REM ---------------------------------------------------------------
echo [3/4] Uploading sw.js ^(no-cache — critical!^)...

aws s3 cp LynkApp-Production-App\sw.js s3://%BUCKET_NAME%/sw.js ^
    --content-type "application/javascript" ^
    --cache-control "no-cache, no-store, must-revalidate"

echo   Uploaded sw.js ^(no-cache^)

REM ---------------------------------------------------------------
REM [4/4] Invalidate CloudFront cache
REM ---------------------------------------------------------------
echo.
echo [4/4] Invalidating CloudFront cache ^(%CF_ID%^)...

aws cloudfront create-invalidation --distribution-id %CF_ID% --paths "/*"

if %ERRORLEVEL% equ 0 (
    echo   CloudFront invalidation submitted successfully.
) else (
    echo   [WARN] CloudFront invalidation failed — check AWS credentials.
)

echo.
echo ===================================================================
echo   UPDATE COMPLETE!
echo ===================================================================
echo.
echo Live at:
echo   https://lynkapp.net
echo.
echo Files deployed from LynkApp-Production-App/:
echo   index.html          ^(561 KB — correct production HTML^)
echo   css/lynkapp-main.css ^(53 KB  — production styles^)
echo   js/app-main.js      ^(490 KB — main app logic^)
echo   js/ux-gap-fixes.js  ^(35 KB  — GAP fixes 1-10^)
echo   js/sidebar-nav.js   ^(25 KB  — sidebar + nav fixes^)
echo   js/medium-priority-fixes.js ^(43 KB — GAP fixes 11-20^)
echo   js/user-testing-fixes.js    ^(demo login + placeholders^)
echo   sw.js               ^(v2.6.0 — service worker^)
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
