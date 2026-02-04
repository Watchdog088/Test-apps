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
