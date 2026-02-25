@echo off
REM ===================================================================
REM ConnectHub Mobile Design - AWS S3 Update Script
REM ===================================================================
REM This script updates your already-deployed website with new changes
REM ===================================================================

echo.
echo ===================================================================
echo   ConnectHub - AWS S3 Update Script
echo ===================================================================
echo.

REM Check if AWS CLI is installed
aws --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] AWS CLI is not installed!
    echo Please install AWS CLI first.
    pause
    exit /b 1
)

REM Check if HTML file exists
if not exist "ConnectHub_Mobile_Design.html" (
    echo [ERROR] ConnectHub_Mobile_Design.html not found!
    echo Please make sure you're in the correct directory.
    pause
    exit /b 1
)

REM Check if bucket name was saved from previous deployment
if exist ".s3-bucket-name" (
    set /p BUCKET_NAME=<.s3-bucket-name
    echo Found saved bucket name: %BUCKET_NAME%
    echo.
    set /p USE_SAVED="Use this bucket? (Y/N): "
    
    if /i "%USE_SAVED%"=="Y" (
        goto :upload
    )
)

REM Ask for bucket name
echo.
set /p BUCKET_NAME="Enter your S3 bucket name: "

if "%BUCKET_NAME%"=="" (
    echo [ERROR] Bucket name cannot be empty!
    pause
    exit /b 1
)

:upload
echo.
echo ===================================================================
echo   Updating Website
echo ===================================================================
echo.

echo Uploading updated HTML file to: %BUCKET_NAME%
echo.

REM Upload the file
aws s3 cp ConnectHub_Mobile_Design.html s3://%BUCKET_NAME%/ --acl public-read --content-type "text/html"

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to upload file!
    echo.
    echo Possible issues:
    echo - Bucket name is incorrect
    echo - You don't have permission to access this bucket
    echo - AWS credentials are not configured
    echo.
    pause
    exit /b 1
)

echo.
echo ===================================================================
echo   UPDATE SUCCESSFUL!
echo ===================================================================
echo.
echo Your website has been updated at:
echo   http://%BUCKET_NAME%.s3-website-us-east-1.amazonaws.com
echo.
echo Note: Changes may take 1-2 minutes to appear due to caching.
echo If you don't see changes immediately, clear your browser cache (Ctrl+F5)
echo.

REM Save bucket name for next time
echo %BUCKET_NAME% > .s3-bucket-name

REM Ask if user wants to open the website
set /p OPEN_SITE="Would you like to open the website now? (Y/N): "
if /i "%OPEN_SITE%"=="Y" (
    start http://%BUCKET_NAME%.s3-website-us-east-1.amazonaws.com
)

echo.
pause
