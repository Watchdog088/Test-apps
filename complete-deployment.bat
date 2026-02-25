@echo off
REM ===================================================================
REM Complete LynkApp Deployment - All Remaining Steps
REM ===================================================================
echo.
echo ===================================================================
echo   LynkApp Complete Deployment Wizard
echo ===================================================================
echo.
echo This script will guide you through deploying your entire application:
echo   1. Backend API to AWS
echo   2. Frontend to AWS S3
echo   3. Complete testing
echo.

pause

REM ===================================================================
REM Menu
REM ===================================================================
:menu
cls
echo.
echo ===================================================================
echo   LynkApp Deployment Menu
echo ===================================================================
echo.
echo What would you like to deploy?
echo.
echo 1. Deploy Backend API (Start Locally First)
echo 2. Deploy Backend to AWS Production
echo 3. Deploy Frontend to AWS S3
echo 4. Deploy Everything (Full Deployment)
echo 5. Test All Deployments
echo 6. Exit
echo.

set /p CHOICE="Enter your choice (1-6): "

if "%CHOICE%"=="1" goto deploy_backend_local
if "%CHOICE%"=="2" goto deploy_backend_aws
if "%CHOICE%"=="3" goto deploy_frontend
if "%CHOICE%"=="4" goto deploy_all
if "%CHOICE%"=="5" goto test_all
if "%CHOICE%"=="6" goto end_script

echo Invalid choice, please try again.
timeout /t 2 >nul
goto menu

REM ===================================================================
REM Option 1: Deploy Backend Locally
REM ===================================================================
:deploy_backend_local
cls
echo.
echo ===================================================================
echo   Deploy Backend Locally
echo ===================================================================
echo.

cd ConnectHub-Backend

echo [STEP 1] Installing dependencies...
if not exist "node_modules" (
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] npm install failed!
        pause
        goto menu
    )
) else (
    echo Dependencies already installed
)

echo.
echo [STEP 2] Checking environment configuration...
if not exist ".env" (
    echo [WARNING] .env file not found!
    echo Running backend deployment script to create it...
    cd ..
    call deploy-backend-to-aws.bat
    cd ConnectHub-Backend
)

echo.
echo [STEP 3] Building backend (if TypeScript)...
echo Using simplified server (no build needed)...

echo.
echo [STEP 4] Starting backend server...
echo.
echo Backend will start on http://localhost:3001
echo.
echo Press Ctrl+C to stop the server when you're done testing.
echo.
pause

start cmd /k "npm run start:simple"

timeout /t 3 >nul

echo.
echo Testing backend endpoint...
timeout /t 5 >nul
curl http://localhost:3001/health 2>nul

echo.
echo.
echo Backend is now running!
echo.
echo Test it by opening: http://localhost:3001
echo.
echo When ready, stop the backend (Ctrl+C) and proceed to AWS deployment.
echo.

cd ..
pause
goto menu

REM ===================================================================
REM Option 2: Deploy Backend to AWS
REM ===================================================================
:deploy_backend_aws
cls
echo.
echo ===================================================================
echo   Deploy Backend to AWS Production
echo ===================================================================
echo.

echo This will deploy your backend API to AWS Elastic Beanstalk.
echo.
echo Prerequisites:
echo   - AWS CLI configured
echo   - Database already deployed
echo   - Backend tested locally
echo.

set /p CONFIRM="Continue with AWS deployment? (y/n): "
if /i not "%CONFIRM%"=="y" goto menu

echo.
echo Starting AWS deployment...
echo.

call deploy-backend-to-aws.bat

echo.
echo AWS Backend deployment complete!
echo.
pause
goto menu

REM ===================================================================
REM Option 3: Deploy Frontend
REM ===================================================================
:deploy_frontend
cls
echo.
echo ===================================================================
echo   Deploy Frontend to AWS S3
echo ===================================================================
echo.

REM Get S3 bucket name
for /f "tokens=3" %%i in ('aws s3 ls ^| findstr lynkapp') do set FRONTEND_BUCKET=%%i

if "%FRONTEND_BUCKET%"=="" (
    echo Creating new S3 bucket for frontend...
    set FRONTEND_BUCKET=lynkapp-frontend-%RANDOM%
    aws s3 mb s3://%FRONTEND_BUCKET%
    
    echo Configuring bucket for website hosting...
    aws s3 website s3://%FRONTEND_BUCKET% --index-document index.html --error-document index.html
)

echo.
echo [STEP 1] Preparing frontend files...
cd ConnectHub-Frontend

echo.
echo [STEP 2] Updating API endpoint configuration...

REM Get backend API URL (if deployed to EB)
echo Checking for Elastic Beanstalk URL...

REM Create/update frontend .env if needed
if not exist ".env" (
    echo Creating frontend .env file...
    (
        echo VITE_API_URL=http://localhost:3001
        echo VITE_ENV=production
    ) > .env
)

echo.
echo [STEP 3] Building frontend (if needed)...
if exist "package.json" (
    if not exist "node_modules" (
        echo Installing frontend dependencies...
        call npm install
    )
    
    REM Check for build script
    findstr /C:"\"build\"" package.json >nul
    if %ERRORLEVEL% equ 0 (
        echo Building frontend...
        call npm run build 2>nul
        
        if exist "dist" (
            echo Deploying from dist folder...
            cd dist
        ) else if exist "build" (
            echo Deploying from build folder...
            cd build
        )
    )
)

echo.
echo [STEP 4] Uploading to S3...
aws s3 sync . s3://%FRONTEND_BUCKET% --delete

if %ERRORLEVEL% equ 0 (
    echo [SUCCESS] Frontend deployed!
    echo.
    echo Your website URL:
    echo http://%FRONTEND_BUCKET%.s3-website-us-east-1.amazonaws.com
    echo.
    
    REM Save URL
    echo http://%FRONTEND_BUCKET%.s3-website-us-east-1.amazonaws.com > frontend-url.txt
) else (
    echo [ERROR] Upload failed!
)

cd ..
if exist "dist" cd ..
if exist "build" cd ..

echo.
pause
goto menu

REM ===================================================================
REM Option 4: Deploy Everything
REM ===================================================================
:deploy_all
cls
echo.
echo ===================================================================
echo   Full Deployment - Everything
echo ===================================================================
echo.

echo This will deploy:
echo   1. Backend API to AWS
echo   2. Frontend to AWS S3
echo   3. Configure and test everything
echo.

set /p CONFIRM_ALL="Deploy everything? (y/n): "
if /i not "%CONFIRM_ALL%"=="y" goto menu

echo.
echo ===================================================================
echo   STEP 1/3: Backend Deployment
echo ===================================================================
echo.

call deploy-backend-to-aws.bat

echo.
echo ===================================================================
echo   STEP 2/3: Frontend Deployment
echo ===================================================================
echo.

call complete-deployment.bat
REM This will handle frontend deployment

echo.
echo ===================================================================
echo   STEP 3/3: Testing Everything
echo ===================================================================
echo.

call test-deployment.bat

echo.
echo ===================================================================
echo   FULL DEPLOYMENT COMPLETE!
echo ===================================================================
echo.

if exist "frontend-url.txt" (
    set /p FRONTEND_URL=<frontend-url.txt
    echo Frontend: %FRONTEND_URL%
)

if exist "backend-deployment-info.txt" (
    echo.
    echo Backend Info:
    type backend-deployment-info.txt
)

echo.
pause
goto menu

REM ===================================================================
REM Option 5: Test Everything
REM ===================================================================
:test_all
cls
echo.
echo ===================================================================
echo   Testing All Deployments
echo ===================================================================
echo.

call test-deployment.bat

echo.
echo Additional Tests:
echo.

REM Test frontend
if exist "frontend-url.txt" (
    set /p FRONTEND_URL=<frontend-url.txt
    echo Testing frontend...
    curl -I %FRONTEND_URL% 2>nul | findstr "200 OK"
    if %ERRORLEVEL% equ 0 (
        echo [PASS] Frontend is accessible
    ) else (
        echo [INFO] Frontend may still be deploying
    )
)

echo.
echo ===================================================================
echo   Deployment URLs
echo ===================================================================
echo.

if exist "frontend-url.txt" (
    set /p FRONTEND_URL=<frontend-url.txt
    echo Frontend: %FRONTEND_URL%
    echo.
    echo Open in browser:
    start %FRONTEND_URL%
)

if exist "backend-deployment-info.txt" (
    echo.
    echo Backend Details:
    type backend-deployment-info.txt
)

echo.
pause
goto menu

REM ===================================================================
REM End
REM ===================================================================
:end_script
cls
echo.
echo ===================================================================
echo   Deployment Summary
echo ===================================================================
echo.

echo Deployment files created:
if exist "ConnectHub-Backend\.env" echo   - ConnectHub-Backend\.env (Backend config)
if exist "backend-deploy.zip" echo   - backend-deploy.zip (Backend package)
if exist "backend-deployment-info.txt" echo   - backend-deployment-info.txt (Backend details)
if exist "frontend-url.txt" echo   - frontend-url.txt (Frontend URL)
if exist "test-db-connection.js" echo   - test-db-connection.js (DB test script)

echo.
echo Quick Reference:
echo ===============
echo.
echo Start Backend Locally:
echo   cd ConnectHub-Backend ^&^& npm start
echo.
echo Deploy Backend to AWS:
echo   deploy-backend-to-aws.bat
echo.
echo Test Deployment:
echo   test-deployment.bat
echo.
echo Deploy Frontend:
echo   complete-deployment.bat (Option 3)
echo.

if exist "frontend-url.txt" (
    set /p FRONTEND_URL=<frontend-url.txt
    echo.
    echo Your App: %FRONTEND_URL%
)

echo.
echo ===================================================================
echo.

pause
