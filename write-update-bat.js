// Helper: writes update-lynkapp-FINAL.bat (v9)
const fs = require('fs');
const path = require('path');

const bat = `@echo off
setlocal enabledelayedexpansion
REM ===================================================================
REM  LynkApp - QUICK UPDATE SCRIPT  (Run this after every code change)
REM  Updated: April 2026 - v9
REM
REM  NEW in v9 (UI/UX Audit - April 2026):
REM    - sidebar-nav.js  : Glassmorphic left sidebar nav (GAP-01 fix)
REM    - styles.css       : Sidebar CSS + responsive breakpoints
REM    - ConnectHub-Frontend/index.html : sidebar-nav.js wired in
REM    - DETAILED-UI-UX-GAPS-AUDIT-2026.md : 46 gaps documented
REM
REM  Steps (13 total):
REM    1.  LynkApp-Production-App sync to S3 ROOT
REM    2.  index.html (no-cache)
REM    3.  css/lynkapp-main.css
REM    4.  manifest.json
REM    5.  sw.js (no-cache)
REM    6.  js/user-testing-fixes.js (v5)
REM    7.  js/app-main.js
REM    8.  ConnectHub_Mobile_Design.html (v7)
REM    9.  admin-dashboard.html
REM   10.  ConnectHub-Frontend/index.html (v9 - sidebar-nav.js wired in)
REM   11.  src/js/ sync (NEW: sidebar-nav.js v1 + ux-gap-fixes.js v1)
REM   12.  src/css/ sync (NEW: styles.css v9 - sidebar + UX gap fixes)
REM   13.  CloudFront full invalidation
REM
REM  Live URL: https://lynkapp.net
REM ===================================================================

echo.
echo ===================================================================
echo   LynkApp - Quick Update v9
echo ===================================================================
echo.

if not exist ".s3-bucket-name" (
    echo [ERROR] No saved bucket found! Run deploy-lynkapp-FINAL.bat first.
    pause
    exit /b 1
)
set /p BUCKET_NAME=<.s3-bucket-name
echo   Bucket  : !BUCKET_NAME!
echo   Live URL: https://lynkapp.net
echo   Version : v9 (UI/UX Audit + Sidebar Navigation)
echo.

aws sts get-caller-identity >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] AWS credentials not configured. Run: aws configure
    pause
    exit /b 1
)

set CF_DIST=E1K6OG7GOLIRJ2

echo [1/13] Syncing LynkApp-Production-App to S3 ROOT...
if not exist "LynkApp-Production-App\\" (
    echo [ERROR] LynkApp-Production-App folder not found!
    pause
    exit /b 1
)
aws s3 sync "LynkApp-Production-App\\" s3://!BUCKET_NAME!/ --exclude "*.backup" --cache-control "no-cache, no-store, must-revalidate" >nul 2>&1
echo [OK] LynkApp-Production-App synced

echo [2/13] Uploading index.html (no-cache)...
aws s3 cp "LynkApp-Production-App\\index.html" s3://!BUCKET_NAME!/index.html --content-type "text/html; charset=utf-8" --cache-control "no-cache, no-store, must-revalidate" >nul 2>&1
echo [OK] index.html

echo [3/13] Uploading css/lynkapp-main.css...
if exist "LynkApp-Production-App\\css\\lynkapp-main.css" (
    aws s3 cp "LynkApp-Production-App\\css\\lynkapp-main.css" s3://!BUCKET_NAME!/css/lynkapp-main.css --content-type "text/css; charset=utf-8" --cache-control "max-age=3600" >nul 2>&1
    echo [OK] css/lynkapp-main.css
) else ( echo [SKIP] css/lynkapp-main.css not found )

echo [4/13] Uploading manifest.json...
if exist "LynkApp-Production-App\\manifest.json" (
    aws s3 cp "LynkApp-Production-App\\manifest.json" s3://!BUCKET_NAME!/manifest.json --content-type "application/json" --cache-control "max-age=86400" >nul 2>&1
    echo [OK] manifest.json
)

echo [5/13] Uploading sw.js (no-cache)...
if exist "LynkApp-Production-App\\sw.js" (
    aws s3 cp "LynkApp-Production-App\\sw.js" s3://!BUCKET_NAME!/sw.js --content-type "application/javascript" --cache-control "no-cache, no-store, must-revalidate" >nul 2>&1
    echo [OK] sw.js
)

echo [6/13] Uploading js/user-testing-fixes.js (v5)...
if exist "LynkApp-Production-App\\js\\user-testing-fixes.js" (
    aws s3 cp "LynkApp-Production-App\\js\\user-testing-fixes.js" s3://!BUCKET_NAME!/js/user-testing-fixes.js --content-type "application/javascript; charset=utf-8" --cache-control "no-cache, no-store, must-revalidate" >nul 2>&1
    echo [OK] js/user-testing-fixes.js
) else ( echo [ERROR] user-testing-fixes.js NOT FOUND )

echo [7/13] Uploading js/app-main.js (no-cache)...
if exist "LynkApp-Production-App\\js\\app-main.js" (
    aws s3 cp "LynkApp-Production-App\\js\\app-main.js" s3://!BUCKET_NAME!/js/app-main.js --content-type "application/javascript; charset=utf-8" --cache-control "no-cache, no-store, must-revalidate" >nul 2>&1
    echo [OK] js/app-main.js
)

echo [8/13] Uploading ConnectHub_Mobile_Design.html (v7)...
if exist "ConnectHub_Mobile_Design.html" (
    aws s3 cp "ConnectHub_Mobile_Design.html" s3://!BUCKET_NAME!/ConnectHub_Mobile_Design.html --content-type "text/html; charset=utf-8" --cache-control "no-cache, no-store, must-revalidate" >nul 2>&1
    echo [OK] ConnectHub_Mobile_Design.html
) else ( echo [SKIP] ConnectHub_Mobile_Design.html not found )

echo [9/13] Uploading admin-dashboard.html...
if exist "admin-dashboard.html" (
    aws s3 cp "admin-dashboard.html" s3://!BUCKET_NAME!/admin-dashboard.html --content-type "text/html; charset=utf-8" --cache-control "no-cache, no-store, must-revalidate" >nul 2>&1
    echo [OK] admin-dashboard.html
)

echo [10/13] Uploading ConnectHub-Frontend/index.html (v9 - sidebar-nav wired in)...
if exist "ConnectHub-Frontend\\index.html" (
    aws s3 cp "ConnectHub-Frontend\\index.html" s3://!BUCKET_NAME!/ConnectHub-Frontend/index.html --content-type "text/html; charset=utf-8" --cache-control "no-cache, no-store, must-revalidate" >nul 2>&1
    echo [OK] ConnectHub-Frontend/index.html
) else ( echo [SKIP] ConnectHub-Frontend\\index.html not found )

echo [11/13] Syncing src/js/ (NEW: sidebar-nav.js v1 + ux-gap-fixes.js v1)...
if exist "ConnectHub-Frontend\\src\\js\\" (
    aws s3 sync "ConnectHub-Frontend\\src\\js\\" s3://!BUCKET_NAME!/src/js/ --content-type "application/javascript; charset=utf-8" --cache-control "no-cache, no-store, must-revalidate" --exclude "*.map" >nul 2>&1
    echo [OK] src/js/ synced (sidebar-nav.js + ux-gap-fixes.js + all JS)
) else ( echo [SKIP] ConnectHub-Frontend\\src\\js\\ not found )

echo [12/13] Syncing src/css/ (NEW: styles.css v9 - sidebar CSS)...
if exist "ConnectHub-Frontend\\src\\css\\" (
    aws s3 sync "ConnectHub-Frontend\\src\\css\\" s3://!BUCKET_NAME!/src/css/ --content-type "text/css; charset=utf-8" --cache-control "no-cache, no-store, must-revalidate" --exclude "*.map" >nul 2>&1
    echo [OK] src/css/ synced (styles.css v9)
) else ( echo [SKIP] ConnectHub-Frontend\\src\\css\\ not found )

echo [13/13] Invalidating CloudFront cache...
aws cloudfront create-invalidation --distribution-id !CF_DIST! --paths "/*" >nul 2>&1
if %errorlevel% equ 0 ( echo [OK] CloudFront invalidation started ) else ( echo [WARN] CloudFront invalidation may have failed )

echo.
echo ===================================================================
echo   UPDATE COMPLETE! (13/13 steps) - v9
echo ===================================================================
echo.
echo   NEW in v9 - UI/UX Audit (April 2026):
echo     [NEW] sidebar-nav.js v1    - Glassmorphic left sidebar (GAP-01)
echo     [NEW] index.html v9        - sidebar-nav.js wired in
echo     [NEW] styles.css v9        - sidebar CSS + responsive breakpoints
echo     [DOC] DETAILED-UI-UX-GAPS-AUDIT-2026.md - 46 gaps on GitHub
echo.
echo   Previous fixes still deployed:
echo     ux-gap-fixes.js v1         - 46 UI/UX gaps addressed
echo     user-testing-fixes.js v5   - 9 user-testing bugs fixed
echo     ConnectHub_Mobile_Design.html v7 - 4 UI fixes
echo.
echo   CloudFront invalidation: InProgress (~1-2 min)
echo.
echo ===================================================================
echo   LIVE URL : https://lynkapp.net
echo   ADMIN    : https://lynkapp.net/admin-dashboard.html
echo   GITHUB   : https://github.com/Watchdog088/Test-apps
echo ===================================================================
echo.

set /p OPEN_SITE="   Open https://lynkapp.net in browser? (Y/N): "
if /i "!OPEN_SITE!"=="Y" ( start https://lynkapp.net )

echo.
pause
`;

// Write with Windows CRLF line endings, ASCII encoding
const outPath = path.join(__dirname, 'update-lynkapp-FINAL.bat');
fs.writeFileSync(outPath, bat.replace(/\n/g, '\r\n'), 'ascii');
console.log('SUCCESS: update-lynkapp-FINAL.bat written (v9)');
console.log('Path:', outPath);
