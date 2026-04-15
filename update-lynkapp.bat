@echo off
REM ===================================================================
REM LynkApp - Quick Update Script
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

REM Upload files
echo Uploading updated files...

REM Upload HTML file
echo   - Uploading HTML...
aws s3 cp ConnectHub_Mobile_Design.html s3://%BUCKET_NAME%/index.html --content-type "text/html" --cache-control "max-age=300"
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Upload failed!
    echo.
    echo Possible issues:
    echo - AWS CLI not configured
    echo - No permission to access bucket
    echo - Bucket doesn't exist
    echo.
    echo Run deploy-to-lynkapp.bat first if you haven't deployed yet.
    pause
    exit /b 1
)
aws s3 cp ConnectHub_Mobile_Design.html s3://%BUCKET_NAME%/ --content-type "text/html" --cache-control "max-age=300"

REM Upload Admin Dashboard (with Dating Monitor tab)
echo   - Uploading Admin Dashboard...
aws s3 cp admin-dashboard.html s3://%BUCKET_NAME%/admin-dashboard.html --content-type "text/html" --cache-control "max-age=300"

REM Upload all JavaScript system files
echo   - Uploading JavaScript system files...
aws s3 cp ConnectHub_Mobile_Design_Feed_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript" --cache-control "max-age=300"
aws s3 cp ConnectHub_Mobile_Design_Feed_Enhanced.js s3://%BUCKET_NAME%/ --content-type "application/javascript" --cache-control "max-age=300"
aws s3 cp ConnectHub_Mobile_Design_Dating_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript" --cache-control "max-age=300"
aws s3 cp ConnectHub_Mobile_Design_Stories_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript" --cache-control "max-age=300"
aws s3 cp ConnectHub_Mobile_Design_Media_Hub.js s3://%BUCKET_NAME%/ --content-type "application/javascript" --cache-control "max-age=300"
aws s3 cp ConnectHub_Mobile_Design_Trending_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript" --cache-control "max-age=300"
aws s3 cp ConnectHub_Mobile_Design_Friends_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript" --cache-control "max-age=300"
aws s3 cp ConnectHub_Mobile_Design_Groups_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript" --cache-control "max-age=300"
aws s3 cp ConnectHub_Mobile_Design_Events_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript" --cache-control "max-age=300"
aws s3 cp ConnectHub_Mobile_Design_Gaming_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript" --cache-control "max-age=300"
aws s3 cp ConnectHub_Mobile_Design_Saved_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript" --cache-control "max-age=300"
aws s3 cp ConnectHub_Mobile_Design_Profile_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript" --cache-control "max-age=300"
aws s3 cp ConnectHub_Mobile_Design_Messages_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript" --cache-control "max-age=300"
aws s3 cp ConnectHub_Mobile_Design_Notifications_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript" --cache-control "max-age=300"
aws s3 cp ConnectHub_Mobile_Design_Search_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript" --cache-control "max-age=300"
aws s3 cp ConnectHub_Mobile_Design_Settings_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript" --cache-control "max-age=300"
aws s3 cp ConnectHub_Mobile_Design_Marketplace_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript" --cache-control "max-age=300"
aws s3 cp ConnectHub_Mobile_Design_Live_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript" --cache-control "max-age=300"
aws s3 cp ConnectHub_Mobile_Design_Video_Calls_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript" --cache-control "max-age=300"
aws s3 cp ConnectHub_Mobile_Design_AR_VR_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript" --cache-control "max-age=300"
aws s3 cp ConnectHub_Mobile_Design_Business_Profile_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript" --cache-control "max-age=300"
aws s3 cp ConnectHub_Mobile_Design_Business_Tools_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript" --cache-control "max-age=300"
aws s3 cp ConnectHub_Mobile_Design_Creator_Profile_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript" --cache-control "max-age=300"
aws s3 cp ConnectHub_Mobile_Design_Help_Support_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript" --cache-control "max-age=300"
aws s3 cp ConnectHub_Mobile_Design_Menu_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript" --cache-control "max-age=300"
aws s3 cp ConnectHub_Mobile_Design_Auth_Onboarding_Complete.js s3://%BUCKET_NAME%/ --content-type "application/javascript" --cache-control "max-age=300"

REM Upload src/services folder structure
echo   - Uploading service modules...
aws s3 sync ConnectHub-Frontend/src/services s3://%BUCKET_NAME%/src/services --content-type "application/javascript" --cache-control "max-age=300" --exclude "*.map"

echo.
echo ===================================================================
echo   UPDATE SUCCESSFUL!
echo ===================================================================
echo.
echo Your website has been updated at:
echo   http://lynkapp.net
echo   http://lynkapp.net.s3-website-us-east-1.amazonaws.com
echo.
echo Note: Changes appear instantly, but may take 1-2 minutes due to
echo browser caching. Press Ctrl+F5 to force refresh.
echo.

set /p OPEN_SITE="Open website now? (Y/N): "
if /i "%OPEN_SITE%"=="Y" (
    start http://lynkapp.net.s3-website-us-east-1.amazonaws.com
)

echo.
pause
