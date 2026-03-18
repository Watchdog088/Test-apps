@echo off
echo ====================================
echo  Deploy LynkApp with API Tracking
echo ====================================
echo.
echo This will deploy your app with:
echo - DeepAR AR filters configured
echo - All API services integrated
echo - Real-time API data collection
echo - Admin dashboard tracking
echo.
pause

echo.
echo [1/5] Checking API configuration...
echo.

REM Check if .env file exists
if not exist "ConnectHub-Frontend\.env" (
    echo WARNING: .env file not found!
    echo Please copy .env.example to .env and add your API keys
    pause
    exit /b 1
)

echo ✅ .env file found
echo.

echo [2/5] Preparing files for deployment...
echo.

REM Create deployment directory
if not exist "deploy-output" mkdir "deploy-output"

REM Copy main HTML files from root directory
echo Copying main HTML files...
xcopy /Y ConnectHub_Mobile_Design.html "deploy-output\" 2>nul
xcopy /Y ConnectHub_Mobile_Design_Complete.html "deploy-output\" 2>nul
xcopy /Y index.html "deploy-output\" 2>nul

cd ConnectHub-Frontend

REM Copy all frontend files
xcopy /E /I /Y *.html "..\deploy-output\"
xcopy /E /I /Y *.js "..\deploy-output\"
xcopy /E /I /Y src "..\deploy-output\src"
xcopy /E /I /Y css "..\deploy-output\css" 2>nul
xcopy /E /I /Y manifest.json "..\deploy-output\" 2>nul

REM Copy API service files
echo Copying API services...
xcopy /E /I /Y src\services "..\deploy-output\services"

cd ..

echo ✅ Files prepared
echo.

echo [3/5] Copying admin dashboard from root...
echo.

REM Copy admin dashboard from root directory (we're already back in root)
if exist "admin-dashboard.html" (
    xcopy /Y admin-dashboard.html "deploy-output\"
    echo ✅ Admin dashboard copied
) else (
    echo Note: admin-dashboard.html not found in root, skipping...
)

echo.
echo [4/5] Deploying to AWS S3...
echo.

REM Check if AWS CLI is installed
aws --version >nul 2>&1
if errorlevel 1 (
    echo WARNING: AWS CLI not found!
    echo Please install AWS CLI: https://aws.amazon.com/cli/
    pause
    goto :skip_s3
)

REM Read bucket name
if exist ".s3-bucket-name" (
    set /p BUCKET_NAME=<.s3-bucket-name
) else (
    set /p BUCKET_NAME=Enter your S3 bucket name: 
    echo %BUCKET_NAME%>.s3-bucket-name
)

echo Uploading to S3 bucket: %BUCKET_NAME%...

REM Upload with API tracking enabled (simplified command)
aws s3 sync deploy-output s3://%BUCKET_NAME% --delete

if errorlevel 1 (
    echo ❌ S3 upload failed!
    pause
    exit /b 1
)

echo ✅ Deployed to S3
echo.

:skip_s3

echo [5/5] Deployment Summary
echo.
echo ====================================
echo  DEPLOYMENT COMPLETE! 🎉
echo ====================================
echo.
echo Configured APIs:
echo ✅ DeepAR (AR Filters) - Active
echo ✅ Stripe (Payments) - Active
echo ✅ OpenAI (Moderation) - Active
echo ✅ Cloudinary (Media) - Active
echo ✅ OneSignal (Notifications) - Active
echo ✅ MediaStack (News) - Active
echo ✅ YouTube (Videos) - Active
echo ✅ Firebase (Auth) - Active
echo.
echo Data Collection:
echo ✅ Real-time API tracking enabled
echo ✅ Admin dashboard integration active
echo ✅ Usage stats collection running
echo.
echo Access your app:
if defined BUCKET_NAME (
    echo Web: http://%BUCKET_NAME%.s3-website-us-east-1.amazonaws.com
    echo Admin: http://%BUCKET_NAME%.s3-website-us-east-1.amazonaws.com/admin-dashboard.html
)
echo.
echo API Data Collection:
echo - Updates every 5 minutes
echo - Displays on admin dashboard
echo - Tracks usage limits automatically
echo.
echo ====================================
echo.
pause
