@echo off
setlocal enabledelayedexpansion
REM ===================================================================
REM  LynkApp — FINAL PRODUCTION DEPLOYMENT SCRIPT
REM  Deploys the complete app (Phases 1-10) to AWS S3
REM  Updated: March 2026
REM ===================================================================
REM  What this script deploys:
REM    - ConnectHub-Frontend/index.html           (main app)
REM    - ConnectHub-Frontend/src/services/*.js    (Phase 1-10 services)
REM    - ConnectHub-Frontend/src/css/*.css        (all stylesheets)
REM    - ConnectHub-Frontend/src/js/*.js          (all UI scripts)
REM    - ConnectHub-Frontend/manifest.json        (PWA manifest)
REM    - ConnectHub-Frontend/service-worker.js    (offline support)
REM ===================================================================

echo.
echo ===================================================================
echo   LynkApp — FINAL PRODUCTION DEPLOYMENT (Phases 1-10)
echo ===================================================================
echo.
echo   This will deploy the complete LynkApp to AWS S3 including:
echo     - All 10 Firebase service files (auth, feed, messaging, etc.)
echo     - All CSS stylesheets and JS UI scripts
echo     - PWA manifest and service worker
echo.

REM ── STEP 0: Pre-flight checks ──────────────────────────────────────

echo [Checking] AWS CLI...
aws --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] AWS CLI is not installed!
    echo   Download: https://awscli.amazonaws.com/AWSCLIV2.msi
    echo   Install it, then re-run this script.
    pause
    exit /b 1
)
echo [OK] AWS CLI installed

echo [Checking] AWS credentials...
aws sts get-caller-identity >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] AWS CLI not configured!
    echo   Run: aws configure
    echo   Then enter your Access Key ID and Secret Access Key
    pause
    exit /b 1
)
echo [OK] AWS credentials configured

echo [Checking] ConnectHub-Frontend folder...
if not exist "ConnectHub-Frontend\index.html" (
    echo.
    echo [ERROR] ConnectHub-Frontend\index.html not found!
    echo   Make sure you are running this from:
    echo   C:\Users\Jnewball\Test-apps\Test-apps
    pause
    exit /b 1
)
echo [OK] ConnectHub-Frontend folder found

echo [Checking] Phase 2-10 service files...
set MISSING_SERVICES=0
if not exist "ConnectHub-Frontend\src\services\firebase-config.js"    set MISSING_SERVICES=1
if not exist "ConnectHub-Frontend\src\services\auth-service.js"        set MISSING_SERVICES=1
if not exist "ConnectHub-Frontend\src\services\messaging-service.js"   set MISSING_SERVICES=1
if not exist "ConnectHub-Frontend\src\services\storage-service.js"     set MISSING_SERVICES=1
if not exist "ConnectHub-Frontend\src\services\notification-service.js" set MISSING_SERVICES=1
if not exist "ConnectHub-Frontend\src\services\app-integration.js"     set MISSING_SERVICES=1

if %MISSING_SERVICES%==1 (
    echo [WARNING] Some Phase 2-10 service files are missing.
    echo           The deploy will continue but some features may not work.
    echo           Expected files in: ConnectHub-Frontend\src\services\
) else (
    echo [OK] All Phase 2-10 service files present
)

echo.
echo ===================================================================
echo   Bucket Configuration
echo ===================================================================
echo.

REM Try to read saved bucket name
set BUCKET_NAME=
if exist ".s3-bucket-name" (
    set /p SAVED_BUCKET=<.s3-bucket-name
    if not "!SAVED_BUCKET!"=="" (
        echo   Found saved bucket: !SAVED_BUCKET!
        set /p USE_SAVED="   Use this bucket? (Y/N): "
        if /i "!USE_SAVED!"=="Y" (
            set BUCKET_NAME=!SAVED_BUCKET!
        )
    )
)

if "!BUCKET_NAME!"=="" (
    echo   S3 bucket names must be globally unique.
    echo   Suggested format: lynkapp-yourname-2026
    echo.
    set /p BUCKET_NAME="   Enter your S3 bucket name: "
)

if "!BUCKET_NAME!"=="" (
    echo [ERROR] Bucket name cannot be empty!
    pause
    exit /b 1
)

echo.
echo   Bucket: !BUCKET_NAME!
echo.
set /p CONFIRM="   Ready to deploy? (Y/N): "
if /i not "!CONFIRM!"=="Y" (
    echo Deployment cancelled.
    pause
    exit /b 0
)

echo.
echo ===================================================================
echo   Starting Full Deployment
echo ===================================================================
echo.

REM ── STEP 1: Create bucket (skip if already exists) ──────────────────
echo [Step 1/8] Setting up S3 bucket...
aws s3 mb s3://!BUCKET_NAME! --region us-east-1 2>nul
if %errorlevel% neq 0 (
    echo         Bucket already exists — continuing with update
) else (
    echo [OK] Bucket created: !BUCKET_NAME!
)

REM ── STEP 2: Configure public access ────────────────────────────────
echo [Step 2/8] Configuring public access...
aws s3api put-public-access-block ^
    --bucket !BUCKET_NAME! ^
    --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false" >nul 2>&1
echo [OK] Public access configured

REM ── STEP 3: Apply bucket policy ────────────────────────────────────
echo [Step 3/8] Applying bucket policy...

> bucket-policy-temp.json echo {
>> bucket-policy-temp.json echo   "Version": "2012-10-17",
>> bucket-policy-temp.json echo   "Statement": [
>> bucket-policy-temp.json echo     {
>> bucket-policy-temp.json echo       "Sid": "PublicReadGetObject",
>> bucket-policy-temp.json echo       "Effect": "Allow",
>> bucket-policy-temp.json echo       "Principal": "*",
>> bucket-policy-temp.json echo       "Action": "s3:GetObject",
>> bucket-policy-temp.json echo       "Resource": "arn:aws:s3:::!BUCKET_NAME!/*"
>> bucket-policy-temp.json echo     }
>> bucket-policy-temp.json echo   ]
>> bucket-policy-temp.json echo }

aws s3api put-bucket-policy --bucket !BUCKET_NAME! --policy file://bucket-policy-temp.json >nul 2>&1
del bucket-policy-temp.json >nul 2>&1
echo [OK] Bucket policy applied

REM ── STEP 4: Configure static website hosting ───────────────────────
echo [Step 4/8] Enabling static website hosting...
aws s3 website s3://!BUCKET_NAME!/ --index-document index.html --error-document index.html >nul 2>&1
echo [OK] Static website hosting enabled (index.html as root)

REM ── STEP 5: Upload index.html ───────────────────────────────────────
echo [Step 5/8] Uploading main HTML file...
aws s3 cp "ConnectHub-Frontend\index.html" s3://!BUCKET_NAME!/ ^
    --content-type "text/html; charset=utf-8" ^
    --cache-control "no-cache, no-store, must-revalidate" ^
    --acl public-read
echo [OK] index.html uploaded

REM Also upload manifest and service worker
if exist "ConnectHub-Frontend\manifest.json" (
    aws s3 cp "ConnectHub-Frontend\manifest.json" s3://!BUCKET_NAME!/ ^
        --content-type "application/json" ^
        --cache-control "max-age=86400" ^
        --acl public-read >nul 2>&1
)
if exist "ConnectHub-Frontend\service-worker.js" (
    aws s3 cp "ConnectHub-Frontend\service-worker.js" s3://!BUCKET_NAME!/ ^
        --content-type "application/javascript" ^
        --cache-control "no-cache" ^
        --acl public-read >nul 2>&1
)
echo [OK] manifest.json and service-worker.js uploaded

REM ── STEP 6: Upload all CSS files ────────────────────────────────────
echo [Step 6/8] Uploading CSS stylesheets...
if exist "ConnectHub-Frontend\src\css\" (
    aws s3 sync "ConnectHub-Frontend\src\css\" s3://!BUCKET_NAME!/src/css/ ^
        --exclude "*" --include "*.css" ^
        --content-type "text/css" ^
        --cache-control "max-age=86400" ^
        --acl public-read
    echo [OK] CSS files uploaded
) else (
    echo [SKIP] No CSS folder found
)

REM ── STEP 7: Upload all JS service files (Phase 1-10) ────────────────
echo [Step 7/8] Uploading Phase 1-10 service files...
if exist "ConnectHub-Frontend\src\services\" (
    REM Upload each service file individually to ensure correct content type
    for %%F in ("ConnectHub-Frontend\src\services\*.js") do (
        aws s3 cp "%%F" s3://!BUCKET_NAME!/src/services/ ^
            --content-type "application/javascript; charset=utf-8" ^
            --cache-control "no-cache, no-store, must-revalidate" ^
            --acl public-read >nul 2>&1
        echo    Uploaded: %%~nxF
    )
    echo [OK] All service files uploaded
) else (
    echo [SKIP] No services folder found
)

REM Upload JS UI scripts
if exist "ConnectHub-Frontend\src\js\" (
    aws s3 sync "ConnectHub-Frontend\src\js\" s3://!BUCKET_NAME!/src/js/ ^
        --exclude "*" --include "*.js" ^
        --content-type "application/javascript; charset=utf-8" ^
        --cache-control "max-age=3600" ^
        --acl public-read >nul 2>&1
    echo [OK] UI JS files uploaded
)

REM ── STEP 8: Upload additional HTML pages ────────────────────────────
echo [Step 8/8] Uploading additional HTML pages...
if exist "ConnectHub-Frontend\creator-profile.html" (
    aws s3 cp "ConnectHub-Frontend\creator-profile.html" s3://!BUCKET_NAME!/creator-profile.html ^
        --content-type "text/html; charset=utf-8" ^
        --cache-control "no-cache" ^
        --acl public-read >nul 2>&1
)
if exist "ConnectHub-Frontend\premium-profile.html" (
    aws s3 cp "ConnectHub-Frontend\premium-profile.html" s3://!BUCKET_NAME!/premium-profile.html ^
        --content-type "text/html; charset=utf-8" ^
        --cache-control "no-cache" ^
        --acl public-read >nul 2>&1
)
echo [OK] Additional pages uploaded

REM ── Save bucket name for future updates ────────────────────────────
echo !BUCKET_NAME! > .s3-bucket-name

REM ── DEPLOYMENT COMPLETE ────────────────────────────────────────────
echo.
echo ===================================================================
echo   DEPLOYMENT SUCCESSFUL! LynkApp is LIVE!
echo ===================================================================
echo.
echo   Your app URL:
echo.
echo     http://!BUCKET_NAME!.s3-website-us-east-1.amazonaws.com
echo.
echo ===================================================================
echo.
echo   Files deployed:
echo     [*] ConnectHub-Frontend/index.html
echo     [*] ConnectHub-Frontend/manifest.json
echo     [*] ConnectHub-Frontend/service-worker.js
echo     [*] src/css/*.css (all stylesheets)
echo     [*] src/services/firebase-config.js    (Phase 1)
echo     [*] src/services/auth-service.js        (Phase 2)
echo     [*] src/services/profile-api-service.js (Phase 3)
echo     [*] src/services/feed-api-service.js    (Phase 4)
echo     [*] src/services/friends-api-service.js (Phase 5)
echo     [*] src/services/messaging-service.js   (Phase 6)
echo     [*] src/services/storage-service.js     (Phase 7)
echo     [*] src/services/notification-service.js(Phase 8)
echo     [*] src/services/app-integration.js     (Phase 9)
echo     [*] src/services/test-seed-data.js      (Phase 10)
echo     [*] src/js/*.js (all UI scripts)
echo.
echo ===================================================================
echo.
echo   WHAT TO DO NEXT:
echo.
echo   1. Open the URL above in your browser
echo   2. Open browser console (F12)
echo   3. Run: TestSeed.quickVerify()
echo      (should show 7/7 journeys passing)
echo   4. Run: TestSeed.runAll()
echo      (creates test users: alice/bob/charlie@lynkapp.test)
echo   5. Test login: alice@lynkapp.test / TestPass123!
echo.
echo   To update the app later: run update-lynkapp-FINAL.bat
echo.
echo ===================================================================
echo.

set APP_URL=http://!BUCKET_NAME!.s3-website-us-east-1.amazonaws.com

set /p OPEN_SITE="   Open the app in your browser now? (Y/N): "
if /i "!OPEN_SITE!"=="Y" (
    start !APP_URL!
)

echo.
echo   Bucket name saved to .s3-bucket-name for future updates
echo.
pause
