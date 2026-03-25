@echo off
setlocal enabledelayedexpansion
REM ===================================================================
REM  LynkApp — QUICK UPDATE SCRIPT (Run this after every code change)
REM  Syncs all changed files to S3 without recreating the bucket
REM  Updated: March 2026
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
echo [1/5] Uploading index.html...
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
echo [2/5] Syncing CSS files...
if exist "ConnectHub-Frontend\src\css\" (
    aws s3 sync "ConnectHub-Frontend\src\css\" s3://!BUCKET_NAME!/src/css/ ^
        --exclude "*" --include "*.css" ^
        --content-type "text/css" ^
        --cache-control "max-age=3600" ^
        >nul 2>&1
)
echo [OK] CSS synced

REM ── Sync Phase 1-10 service files (no-cache = always fresh) ─────────
echo [3/5] Syncing Phase 1-10 service files...
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
echo [4/5] Syncing UI JS scripts...
if exist "ConnectHub-Frontend\src\js\" (
    aws s3 sync "ConnectHub-Frontend\src\js\" s3://!BUCKET_NAME!/src/js/ ^
        --exclude "*" --include "*.js" ^
        --content-type "application/javascript; charset=utf-8" ^
        --cache-control "max-age=3600" ^
        >nul 2>&1
)
echo [OK] UI JS synced

REM ── Sync extra HTML pages ───────────────────────────────────────────
echo [5/5] Syncing additional pages...
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

REM ── Done ────────────────────────────────────────────────────────────
echo.
echo ===================================================================
echo   UPDATE COMPLETE!
echo ===================================================================
echo.
echo   Live URL:
echo   http://!BUCKET_NAME!.s3-website-us-east-1.amazonaws.com
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
