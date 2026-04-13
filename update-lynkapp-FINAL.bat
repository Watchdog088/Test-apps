@echo off
setlocal enabledelayedexpansion
REM ===================================================================
REM  LynkApp — QUICK UPDATE SCRIPT  (Run this after every code change)
REM  Updated: April 2026 — v6
REM
REM  CORRECT deployment structure:
REM    LynkApp-Production-App\ --> s3://lynkapp.net/  (ROOT)
REM
REM  What this uploads:
REM    1.  LynkApp-Production-App\ (entire folder) --> S3 ROOT
REM    2.  Explicit re-upload: index.html (text/html, no-cache)
REM    3.  Explicit re-upload: css/lynkapp-main.css (text/css)
REM    4.  Explicit re-upload: manifest.json (application/json)
REM    5.  Explicit re-upload: sw.js (application/javascript, no-cache)
REM    6.  Explicit re-upload: js/user-testing-fixes.js (v5, no-cache)
REM    7.  Explicit re-upload: js/app-main.js (no-cache)
REM    8.  Admin dashboard
REM    9.  CloudFront full cache invalidation
REM
REM  Live URL: https://lynkapp.net
REM ===================================================================

echo.
echo ===================================================================
echo   LynkApp — Quick Update  (Sync LynkApp-Production-App to S3)
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
echo   Bucket  : !BUCKET_NAME!
echo   Live URL: https://lynkapp.net
echo.

REM ── Verify AWS credentials ──────────────────────────────────────────
aws sts get-caller-identity >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] AWS credentials not configured. Run: aws configure
    pause
    exit /b 1
)

REM ── CloudFront Distribution ID ──────────────────────────────────────
set CF_DIST=E1K6OG7GOLIRJ2

REM ===================================================================
REM  STEP 1 — Sync entire LynkApp-Production-App to S3 ROOT
REM           (This is the production app. All files go to root, not a subfolder)
REM ===================================================================
echo [1/9] Syncing LynkApp-Production-App to S3 ROOT...
if not exist "LynkApp-Production-App\" (
    echo [ERROR] LynkApp-Production-App folder not found!
    pause
    exit /b 1
)
aws s3 sync "LynkApp-Production-App\" s3://!BUCKET_NAME!/ ^
    --exclude "*.backup" ^
    --cache-control "no-cache, no-store, must-revalidate" ^
    >nul 2>&1
echo [OK] LynkApp-Production-App synced to S3 root

REM ===================================================================
REM  STEP 2 — Explicit re-upload: index.html with correct content-type
REM ===================================================================
echo [2/9] Uploading index.html (text/html, no-cache)...
aws s3 cp "LynkApp-Production-App\index.html" s3://!BUCKET_NAME!/index.html ^
    --content-type "text/html; charset=utf-8" ^
    --cache-control "no-cache, no-store, must-revalidate" ^
    >nul 2>&1
echo [OK] index.html

REM ===================================================================
REM  STEP 3 — Explicit re-upload: CSS with correct content-type
REM ===================================================================
echo [3/9] Uploading css/lynkapp-main.css (text/css)...
if exist "LynkApp-Production-App\css\lynkapp-main.css" (
    aws s3 cp "LynkApp-Production-App\css\lynkapp-main.css" s3://!BUCKET_NAME!/css/lynkapp-main.css ^
        --content-type "text/css; charset=utf-8" ^
        --cache-control "max-age=3600" ^
        >nul 2>&1
    echo [OK] css/lynkapp-main.css
) else (
    echo [SKIP] css/lynkapp-main.css not found
)

REM ===================================================================
REM  STEP 4 — Explicit re-upload: manifest.json
REM ===================================================================
echo [4/9] Uploading manifest.json...
if exist "LynkApp-Production-App\manifest.json" (
    aws s3 cp "LynkApp-Production-App\manifest.json" s3://!BUCKET_NAME!/manifest.json ^
        --content-type "application/json" ^
        --cache-control "max-age=86400" ^
        >nul 2>&1
    echo [OK] manifest.json
)

REM ===================================================================
REM  STEP 5 — Explicit re-upload: service worker (always no-cache)
REM ===================================================================
echo [5/9] Uploading sw.js (no-cache)...
if exist "LynkApp-Production-App\sw.js" (
    aws s3 cp "LynkApp-Production-App\sw.js" s3://!BUCKET_NAME!/sw.js ^
        --content-type "application/javascript" ^
        --cache-control "no-cache, no-store, must-revalidate" ^
        >nul 2>&1
    echo [OK] sw.js
)

REM ===================================================================
REM  STEP 6 — Explicit re-upload: user-testing-fixes.js (always no-cache)
REM           This contains all 7 user-testing bug fixes (v4)
REM ===================================================================
echo [6/9] Uploading js/user-testing-fixes.js (v5 - 9 fixes incl. universal search, no-cache)...
if exist "LynkApp-Production-App\js\user-testing-fixes.js" (
    aws s3 cp "LynkApp-Production-App\js\user-testing-fixes.js" s3://!BUCKET_NAME!/js/user-testing-fixes.js ^
        --content-type "application/javascript; charset=utf-8" ^
        --cache-control "no-cache, no-store, must-revalidate" ^
        >nul 2>&1
    echo [OK] js/user-testing-fixes.js
) else (
    echo [ERROR] LynkApp-Production-App\js\user-testing-fixes.js NOT FOUND
)

REM ===================================================================
REM  STEP 7 — Explicit re-upload: app-main.js (always no-cache)
REM ===================================================================
echo [7/9] Uploading js/app-main.js (no-cache)...
if exist "LynkApp-Production-App\js\app-main.js" (
    aws s3 cp "LynkApp-Production-App\js\app-main.js" s3://!BUCKET_NAME!/js/app-main.js ^
        --content-type "application/javascript; charset=utf-8" ^
        --cache-control "no-cache, no-store, must-revalidate" ^
        >nul 2>&1
    echo [OK] js/app-main.js
)

REM ===================================================================
REM  STEP 8 — Upload admin dashboard
REM ===================================================================
echo [8/9] Uploading admin-dashboard.html...
if exist "admin-dashboard.html" (
    aws s3 cp "admin-dashboard.html" s3://!BUCKET_NAME!/admin-dashboard.html ^
        --content-type "text/html; charset=utf-8" ^
        --cache-control "no-cache, no-store, must-revalidate" ^
        >nul 2>&1
    echo [OK] admin-dashboard.html
)

REM ===================================================================
REM  STEP 9 — CloudFront full cache invalidation
REM           Clears ALL cached files so users get fresh content instantly
REM ===================================================================
echo [9/9] Invalidating CloudFront cache (/* - all files)...
aws cloudfront create-invalidation ^
    --distribution-id !CF_DIST! ^
    --paths "/*" ^
    >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] CloudFront cache invalidation started
) else (
    echo [WARN] CloudFront invalidation may have failed - check AWS console
)

REM ── Done ────────────────────────────────────────────────────────────
echo.
echo ===================================================================
echo   UPDATE COMPLETE! (9/9 steps)
echo ===================================================================
echo.
echo   What was deployed:
echo     Source : LynkApp-Production-App\
echo     Target : s3://!BUCKET_NAME!/ (ROOT)
echo.
echo   Files updated:
echo     - index.html            (text/html, no-cache)
echo     - css/lynkapp-main.css  (text/css)
echo     - manifest.json         (application/json)
echo     - sw.js                 (no-cache)
echo     - js/app-main.js        (no-cache)
    echo     - js/user-testing-fixes.js (v5 - 9 bugs fixed, no-cache)
echo     - services/*.js
echo     - admin-dashboard.html  (no-cache)
echo.
echo   Bug fixes deployed (user-testing-fixes.js v5):
echo     Fix 1: Account creation forces full profile setup wizard
echo     Fix 2: Post button works correctly
echo     Fix 3: Add Location button present and working
echo     Fix 4: Tag People confirm button working
echo     Fix 5: Comments submit button working
echo     Fix 6: Share button opens share window
echo     Fix 7: Story camera and gallery buttons working
echo     Fix 8: Friends section - See All / Message / Add Friend buttons
echo     Fix 9: Universal search buttons (all screens + modals, same style)
echo.
echo   CloudFront invalidation: InProgress (takes ~1-2 minutes)
echo.
echo ===================================================================
echo   LIVE URL : https://lynkapp.net
echo   ADMIN    : https://lynkapp.net/admin-dashboard.html
echo ===================================================================
echo.
echo   TIP: Hard-refresh with Ctrl+Shift+R or use Incognito to see
echo        changes immediately (bypasses browser cache).
echo.

set /p OPEN_SITE="   Open https://lynkapp.net in browser? (Y/N): "
if /i "!OPEN_SITE!"=="Y" (
    start https://lynkapp.net
)

echo.
pause
