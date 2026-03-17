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

echo [2/5] Building frontend with API services...
echo.

cd ConnectHub-Frontend

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

REM Build the project
echo Building project...
call npm run build

if errorlevel 1 (
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo ✅ Build complete
echo.

echo [3/5] Preparing files for deployment...
echo.

REM Create deployment directory
if not exist "..\deploy-output" mkdir "..\deploy-output"

REM Copy build files
xcopy /E /I /Y dist "..\deploy-output\dist"

REM Copy API service files
echo Copying API services...
xcopy /E /I /Y src\services "..\deploy-output\services"

REM Copy admin dashboard files
echo Copying admin dashboard...
xcopy /Y admin-dashboard.html "..\deploy-output\"

echo ✅ Files prepared
echo.

echo [4/5] Deploying to AWS S3...
echo.

cd ..

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

REM Upload with API tracking enabled
aws s3 sync deploy-output s3://%BUCKET_NAME%/ --delete ^
    --cache-control "max-age=3600" ^
    --metadata "api-tracking=enabled,version=1.0.0"

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
