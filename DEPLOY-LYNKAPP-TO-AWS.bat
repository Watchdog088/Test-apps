@echo off
setlocal EnableDelayedExpansion

:: ============================================================
::  LYNKAPP - MASTER AWS DEPLOYMENT SCRIPT
::  Live URL  : https://lynkapp.net
::  S3 Bucket : lynkapp.net
::  CloudFront: E1K6OG7GOLIRJ2
::
::  HOW TO USE:
::    1. Double-click this file  -OR-  run it from a terminal
::    2. It will build, upload to AWS S3, and clear the CDN cache
::    3. Your changes will be live on https://lynkapp.net in ~30 sec
::
::  TO UPDATE FOR FUTURE CHANGES:
::    - Just run this file again after making your code changes
::    - No edits needed — it always deploys the latest build
::
::  REQUIREMENTS (must be installed once):
::    - Node.js  : https://nodejs.org
::    - AWS CLI  : https://aws.amazon.com/cli/
::    - AWS credentials configured (run `aws configure` once)
:: ============================================================

title LynkApp AWS Deploy
color 0A

echo.
echo  ============================================
echo   LYNKAPP LIVE DEPLOYMENT  ^|  lynkapp.net
echo  ============================================
echo.

:: ── CONFIG ─────────────────────────────────────────────────
set "S3_BUCKET=lynkapp.net"
set "CF_DIST_ID=E1K6OG7GOLIRJ2"
set "LIVE_URL=https://lynkapp.net"
set "SPA_DIR=ConnectHub-SPA"
set "BUILD_DIR=ConnectHub-SPA\dist"
set "ROOT_DIR=%~dp0"
:: ───────────────────────────────────────────────────────────

cd /d "%ROOT_DIR%"

:: ── STEP 0: Check prerequisites ────────────────────────────
echo [0/5] Checking prerequisites...

where node >nul 2>&1
if errorlevel 1 (
    color 0C
    echo.
    echo  ERROR: Node.js not found!
    echo  Install it from https://nodejs.org then re-run this script.
    echo.
    pause
    exit /b 1
)

where aws >nul 2>&1
if errorlevel 1 (
    color 0C
    echo.
    echo  ERROR: AWS CLI not found!
    echo  Install it from https://aws.amazon.com/cli/ then re-run this script.
    echo.
    pause
    exit /b 1
)

echo  [OK] Node.js and AWS CLI found.
echo.

:: ── STEP 1: Save all changes to GitHub ─────────────────────
echo [1/5] Saving all changes to GitHub...

git add -A
git diff --cached --quiet
if errorlevel 1 (
    :: There are staged changes — commit them
    for /f "tokens=*" %%i in ('powershell -command "Get-Date -Format 'yyyy-MM-dd HH:mm'"') do set "TIMESTAMP=%%i"
    git commit -m "deploy: update live app [!TIMESTAMP!]"
    if errorlevel 1 (
        color 0E
        echo  WARNING: Git commit failed. Continuing with deployment anyway...
        echo.
    ) else (
        git push origin main
        echo  [OK] Changes saved to GitHub.
    )
) else (
    echo  [OK] No new changes to commit - working tree clean.
)
echo.

:: ── STEP 2: Install dependencies (only if needed) ──────────
echo [2/5] Checking npm dependencies...

cd /d "%ROOT_DIR%%SPA_DIR%"

if not exist "node_modules" (
    echo  Installing npm packages (first time only - may take a few minutes)...
    call npm install
    if errorlevel 1 (
        color 0C
        echo.
        echo  ERROR: npm install failed!
        pause
        exit /b 1
    )
) else (
    echo  [OK] node_modules already present, skipping install.
)
echo.

:: ── STEP 3: Build the React app for production ─────────────
echo [3/5] Building LynkApp for production...
echo  (This takes 30-90 seconds...)
echo.

call npm run build
if errorlevel 1 (
    color 0C
    echo.
    echo  ERROR: Build failed! Fix the errors above and try again.
    echo.
    cd /d "%ROOT_DIR%"
    pause
    exit /b 1
)

echo.
echo  [OK] Build complete!
echo.

:: ── STEP 4: Upload to AWS S3 ────────────────────────────────
cd /d "%ROOT_DIR%"
echo [4/5] Uploading to AWS S3 (s3://%S3_BUCKET%)...

:: Upload index.html with no-cache so browsers always get fresh version
aws s3 cp "%BUILD_DIR%\index.html" "s3://%S3_BUCKET%/index.html" ^
    --cache-control "no-cache, no-store, must-revalidate" ^
    --content-type "text/html" ^
    --metadata-directive REPLACE

if errorlevel 1 (
    color 0C
    echo.
    echo  ERROR: S3 upload of index.html failed!
    echo  - Check your AWS credentials (`aws configure`)
    echo  - Make sure the S3 bucket '%S3_BUCKET%' exists and you have write access
    echo.
    pause
    exit /b 1
)

:: Upload all other assets (JS/CSS/images) with long-term cache (they have hashed names)
aws s3 sync "%BUILD_DIR%" "s3://%S3_BUCKET%" ^
    --exclude "index.html" ^
    --cache-control "public, max-age=31536000, immutable" ^
    --delete

if errorlevel 1 (
    color 0C
    echo.
    echo  ERROR: S3 sync failed!
    pause
    exit /b 1
)

echo  [OK] All files uploaded to S3!
echo.

:: ── STEP 5: Invalidate CloudFront CDN cache ─────────────────
echo [5/5] Clearing CloudFront cache (distribution %CF_DIST_ID%)...

aws cloudfront create-invalidation ^
    --distribution-id %CF_DIST_ID% ^
    --paths "/*" ^
    --output text --query "Invalidation.Id" > "%TEMP%\cf_inv_id.txt" 2>&1

if errorlevel 1 (
    color 0E
    echo  WARNING: CloudFront invalidation failed (cache may take up to 24h to clear).
    echo  You can manually invalidate at: https://console.aws.amazon.com/cloudfront
    echo.
) else (
    set /p CF_INV_ID=<"%TEMP%\cf_inv_id.txt"
    echo  [OK] Cache invalidation started (ID: !CF_INV_ID!)
    echo  [OK] Changes will be live in ~30 seconds.
    echo.
)

:: ── DONE ────────────────────────────────────────────────────
color 0A
echo.
echo  ============================================
echo   DEPLOYMENT COMPLETE!
echo  ============================================
echo.
echo   Live URL : %LIVE_URL%
echo   S3 Bucket: s3://%S3_BUCKET%
echo   CDN      : d2ze4bo2gl7bv3.cloudfront.net
echo.
echo   Open your browser and visit:
echo   %LIVE_URL%
echo.
echo  ============================================
echo.

:: Open the live URL in the default browser
start "" "%LIVE_URL%"

pause
endlocal
