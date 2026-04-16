@echo off
REM ===================================================================
REM LynkApp - Quick Update Script
REM Updated: 2026-04-15 — syncs root js/ folder; bell + bottom-tab fixes
REM ===================================================================
setlocal EnableDelayedExpansion

echo.
echo ===================================================================
echo   LynkApp - Quick Update Script
echo ===================================================================
echo.

REM Check if HTML file exists
if not exist "ConnectHub_Mobile_Design.html" (
    echo [ERROR] ConnectHub_Mobile_Design.html not found!
    echo Current directory: %CD%
    pause
    exit /b 1
)

set BUCKET_NAME=lynkapp.net

echo Updating LynkApp website...
echo Bucket: %BUCKET_NAME%
echo.

REM ---------------------------------------------------------------
REM [1/5] Upload HTML files
REM ---------------------------------------------------------------
echo [1/5] Uploading HTML files...

aws s3 cp ConnectHub_Mobile_Design.html s3://%BUCKET_NAME%/index.html ^
    --content-type "text/html" --cache-control "max-age=300"
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Upload failed! Possible causes:
    echo   - AWS CLI not configured  ^(run: aws configure^)
    echo   - No permission to access bucket
    echo   - Bucket does not exist
    echo.
    echo Run deploy-to-lynkapp.bat first if you have not deployed yet.
    pause
    exit /b 1
)

aws s3 cp ConnectHub_Mobile_Design.html s3://%BUCKET_NAME%/ ^
    --content-type "text/html" --cache-control "max-age=300"

aws s3 cp admin-dashboard.html s3://%BUCKET_NAME%/admin-dashboard.html ^
    --content-type "text/html" --cache-control "max-age=300"

REM ---------------------------------------------------------------
REM [2/5] Upload core JavaScript system files
REM ---------------------------------------------------------------
echo [2/5] Uploading JavaScript system files...

for %%F in (
    ConnectHub_Mobile_Design_Feed_System.js
    ConnectHub_Mobile_Design_Feed_Enhanced.js
    ConnectHub_Mobile_Design_Feed_Complete_System.js
    ConnectHub_Mobile_Design_Dating_System.js
    ConnectHub_Mobile_Design_Stories_System.js
    ConnectHub_Mobile_Design_Media_Hub.js
    ConnectHub_Mobile_Design_Trending_System.js
    ConnectHub_Mobile_Design_Friends_System.js
    ConnectHub_Mobile_Design_Groups_System.js
    ConnectHub_Mobile_Design_Events_System.js
    ConnectHub_Mobile_Design_Gaming_System.js
    ConnectHub_Mobile_Design_Saved_System.js
    ConnectHub_Mobile_Design_Profile_System.js
    ConnectHub_Mobile_Design_Messages_System.js
    ConnectHub_Mobile_Design_Notifications_System.js
    ConnectHub_Mobile_Design_Search_System.js
    ConnectHub_Mobile_Design_Settings_System.js
    ConnectHub_Mobile_Design_Marketplace_System.js
    ConnectHub_Mobile_Design_Live_System.js
    ConnectHub_Mobile_Design_Video_Calls_System.js
    ConnectHub_Mobile_Design_AR_VR_System.js
    ConnectHub_Mobile_Design_Business_Profile_System.js
    ConnectHub_Mobile_Design_Business_Tools_System.js
    ConnectHub_Mobile_Design_Creator_Profile_System.js
    ConnectHub_Mobile_Design_Help_Support_System.js
    ConnectHub_Mobile_Design_Menu_System.js
    ConnectHub_Mobile_Design_Auth_Onboarding_Complete.js
    ConnectHub_Security_System_Complete.js
    ConnectHub_Feed_Filtering_Discovery_System.js
    ConnectHub_Post_Management_System.js
    ConnectHub_Music_Player_Dashboards_Complete.js
) do (
    if exist "%%F" (
        echo   - %%F
        aws s3 cp "%%F" s3://%BUCKET_NAME%/ ^
            --content-type "application/javascript" --cache-control "max-age=300"
    )
)

REM ---------------------------------------------------------------
REM [3/5] Sync entire root js/ folder → s3://lynkapp.net/js/
REM       This uploads ALL UX-fix scripts automatically:
REM         ux-gap-fixes.js, sidebar-nav.js, navigation-system.js,
REM         user-testing-fixes.js, medium-priority-fixes.js
REM ---------------------------------------------------------------
echo [3/5] Syncing UX gap-fix scripts ^(js/ folder^)...

if exist "js" (
    aws s3 sync js/ s3://%BUCKET_NAME%/js/ ^
        --content-type "application/javascript" ^
        --cache-control "max-age=300" ^
        --delete
    echo   Synced js/ folder to s3://%BUCKET_NAME%/js/
) else (
    echo   [WARN] No js/ folder found — uploading individually...
    aws s3 cp ConnectHub-Frontend/src/js/ux-gap-fixes.js ^
        s3://%BUCKET_NAME%/js/ux-gap-fixes.js ^
        --content-type "application/javascript" --cache-control "max-age=300"
    aws s3 cp ConnectHub-Frontend/src/js/sidebar-nav.js ^
        s3://%BUCKET_NAME%/js/sidebar-nav.js ^
        --content-type "application/javascript" --cache-control "max-age=300"
    aws s3 cp ConnectHub-Frontend/src/js/navigation-system.js ^
        s3://%BUCKET_NAME%/js/navigation-system.js ^
        --content-type "application/javascript" --cache-control "max-age=300"
    aws s3 cp ConnectHub-Frontend/src/js/user-testing-fixes.js ^
        s3://%BUCKET_NAME%/js/user-testing-fixes.js ^
        --content-type "application/javascript" --cache-control "max-age=300"
    aws s3 cp LynkApp-Production-App/js/medium-priority-fixes.js ^
        s3://%BUCKET_NAME%/js/medium-priority-fixes.js ^
        --content-type "application/javascript" --cache-control "max-age=300"
)

REM ---------------------------------------------------------------
REM [4/5] Sync CSS styles
REM ---------------------------------------------------------------
echo [4/5] Uploading CSS styles...

aws s3 cp ConnectHub-Frontend/src/css/styles.css ^
    s3://%BUCKET_NAME%/css/styles.css ^
    --content-type "text/css" --cache-control "max-age=300"

aws s3 sync ConnectHub-Frontend/src/css ^
    s3://%BUCKET_NAME%/css ^
    --content-type "text/css" --cache-control "max-age=300" --exclude "*.map"

REM ---------------------------------------------------------------
REM [5/5] Sync service modules
REM ---------------------------------------------------------------
echo [5/5] Uploading service modules...

aws s3 sync ConnectHub-Frontend/src/services ^
    s3://%BUCKET_NAME%/src/services ^
    --content-type "application/javascript" --cache-control "max-age=300" --exclude "*.map"

REM ---------------------------------------------------------------
REM [4.5/5] Upload service worker (always no-cache so browsers get
REM         the latest version immediately — this is critical!)
REM ---------------------------------------------------------------
echo [4.5/5] Uploading service worker ^(no-cache^)...

if exist "LynkApp-Production-App\sw.js" (
    aws s3 cp LynkApp-Production-App\sw.js s3://%BUCKET_NAME%/sw.js ^
        --content-type "application/javascript" ^
        --cache-control "no-cache, no-store, must-revalidate"
    echo   Uploaded sw.js ^(no-cache^)
) else (
    echo   [WARN] LynkApp-Production-App\sw.js not found — skipping
)

REM ---------------------------------------------------------------
REM Invalidate CloudFront cache so changes go live immediately
REM ---------------------------------------------------------------
echo.
echo Invalidating CloudFront cache...

REM CF_ID is hardcoded — the for/f loop approach reads the LAST line
REM of cloudfront-info.txt (the "Setup completed" line) which is wrong.
set CF_ID=E1K6OG7GOLIRJ2

aws cloudfront create-invalidation --distribution-id %CF_ID% --paths "/*"
if %ERRORLEVEL% equ 0 (
    echo   CloudFront cache invalidated for distribution %CF_ID%
) else (
    echo   [WARN] CloudFront invalidation failed — check AWS credentials
)

echo.
echo ===================================================================
echo   UPDATE SUCCESSFUL!
echo ===================================================================
echo.
echo Changes uploaded to:
echo   http://lynkapp.net
echo   https://lynkapp.net  ^(via CloudFront^)
echo.
echo   Changes in this build:
echo     - Bell notification button in header ^(with live badge^)
echo     - Fixed bottom tab bar: Home, Messages, Create, Alerts, Profile
echo     - ux-gap-fixes.js   ^(skeleton loader, scroll memory, mini-player,
echo                          search empty state, post validation, badge fix^)
echo     - sidebar-nav.js    ^(pill nav scroll hint, 44px touch targets^)
echo     - user-testing-fixes.js  ^(demo login, placeholder cleanup^)
echo     - medium-priority-fixes.js  ^(UX gaps #11-20^)
echo.
echo Note: Force-refresh with Ctrl+Shift+R if you see the old version.
echo.

set /p OPEN_SITE="Open website now? (Y/N): "
if /i "!OPEN_SITE!"=="Y" (
    start https://lynkapp.net
)

echo.
pause
