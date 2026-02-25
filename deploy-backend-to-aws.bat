@echo off
REM ===================================================================
REM Deploy Backend to AWS - Complete Automation
REM ===================================================================
echo.
echo ===================================================================
echo   LynkApp Backend Deployment to AWS
echo ===================================================================
echo.

REM Check if AWS CLI is installed
where aws >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] AWS CLI not installed!
    echo Install from: https://awscli.amazonaws.com/AWSCLIV2.msi
    pause
    exit /b 1
)

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js not installed!
    echo Install from: https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Prerequisites check passed
echo.

REM ===================================================================
REM Step 1: Get Database Endpoint
REM ===================================================================
echo [STEP 1] Getting database endpoint...
echo.

aws rds describe-db-instances --db-instance-identifier lynkapp-db --query "DBInstances[0].Endpoint.Address" --output text > db-endpoint.txt 2>nul

if %ERRORLEVEL% neq 0 (
    echo [WARNING] Could not find lynkapp-db. Checking for other databases...
    aws rds describe-db-instances --query "DBInstances[0].Endpoint.Address" --output text > db-endpoint.txt 2>nul
)

set /p DB_ENDPOINT=<db-endpoint.txt

if "%DB_ENDPOINT%"=="" (
    echo [ERROR] No database found! Please deploy database first.
    echo Run: DEPLOY-NOW.md instructions
    pause
    exit /b 1
)

echo [OK] Database endpoint: %DB_ENDPOINT%
echo.

REM ===================================================================
REM Step 2: Get S3 Bucket Name
REM ===================================================================
echo [STEP 2] Getting S3 bucket name...
echo.

for /f "tokens=3" %%i in ('aws s3 ls ^| findstr lynkapp') do set S3_BUCKET=%%i

if "%S3_BUCKET%"=="" (
    echo [WARNING] No lynkapp S3 bucket found, using default name
    set S3_BUCKET=lynkapp-uploads
)

echo [OK] S3 Bucket: %S3_BUCKET%
echo.

REM ===================================================================
REM Step 3: Create/Update Environment File
REM ===================================================================
echo [STEP 3] Creating backend environment configuration...
echo.

cd ConnectHub-Backend

if not exist ".env" (
    echo Creating new .env file...
) else (
    echo Updating existing .env file...
    copy .env .env.backup >nul 2>&1
)

REM Create .env file
(
    echo # ===================================================================
    echo # LynkApp Backend Production Configuration
    echo # Auto-generated: %DATE% %TIME%
    echo # ===================================================================
    echo.
    echo # Database
    echo DATABASE_URL=postgresql://lynkadmin:Lynkapp2024!@%DB_ENDPOINT%:5432/lynkapp
    echo.
    echo # AWS Configuration
    echo AWS_REGION=us-east-1
    echo AWS_S3_BUCKET=%S3_BUCKET%
    echo.
    echo # JWT Authentication
    echo JWT_SECRET=lynkapp-secret-key-%RANDOM%%RANDOM%
    echo JWT_EXPIRES_IN=7d
    echo.
    echo # Application
    echo NODE_ENV=production
    echo PORT=3001
    echo.
    echo # CORS
    echo FRONTEND_URL=http://lynkapp.net.s3-website-us-east-1.amazonaws.com
    echo CORS_ORIGIN=*
    echo.
    echo # Features
    echo ENABLE_EMAIL_VERIFICATION=false
    echo ENABLE_SMS_VERIFICATION=false
) > .env

echo [OK] Environment file created: ConnectHub-Backend/.env
echo.

REM ===================================================================
REM Step 4: Install Dependencies
REM ===================================================================
echo [STEP 4] Installing backend dependencies...
echo.

if not exist "node_modules" (
    echo Installing npm packages - this may take a few minutes...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] npm install failed!
        cd ..
        pause
        exit /b 1
    )
) else (
    echo Dependencies already installed, skipping...
)

echo [OK] Dependencies installed
echo.

REM ===================================================================
REM Step 5: Build Backend (if TypeScript)
REM ===================================================================
echo [STEP 5] Building backend application...
echo.

if exist "tsconfig.json" (
    echo TypeScript project detected, building...
    call npm run build 2>nul
    if %ERRORLEVEL% neq 0 (
        echo [WARNING] Build command failed or not configured, continuing...
    ) else (
        echo [OK] Build completed
    )
) else (
    echo JavaScript project, no build needed
)

echo.

REM ===================================================================
REM Step 6: Initialize Database (Prisma)
REM ===================================================================
echo [STEP 6] Initializing database schema...
echo.

if exist "prisma" (
    echo Prisma detected, generating client and pushing schema...
    
    call npx prisma generate 2>nul
    if %ERRORLEVEL% equ 0 (
        echo [OK] Prisma client generated
    )
    
    call npx prisma db push 2>nul
    if %ERRORLEVEL% equ 0 (
        echo [OK] Database schema pushed
    ) else (
        echo [WARNING] Schema push failed, you may need to run this manually
    )
) else (
    echo No Prisma detected, skipping database initialization
)

echo.

REM ===================================================================
REM Step 7: Create Deployment Package
REM ===================================================================
echo [STEP 7] Creating deployment package...
echo.

cd ..

if exist "backend-deploy.zip" del backend-deploy.zip

REM Create list of files to include
powershell -Command "Compress-Archive -Path 'ConnectHub-Backend\*' -DestinationPath 'backend-deploy.zip' -Force"

if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to create deployment package
    pause
    exit /b 1
)

echo [OK] Deployment package created: backend-deploy.zip
echo.

REM ===================================================================
REM Step 8: Deploy to AWS (Using S3 + EC2 Simple Approach)
REM ===================================================================
echo [STEP 8] Deploying to AWS...
echo.

echo Select deployment method:
echo 1. Upload to S3 (for manual EC2 setup)
echo 2. AWS Elastic Beanstalk (automatic - RECOMMENDED)
echo 3. Skip deployment (just prepare files)
echo.

set /p DEPLOY_METHOD="Enter choice (1-3): "

if "%DEPLOY_METHOD%"=="1" goto deploy_s3
if "%DEPLOY_METHOD%"=="2" goto deploy_eb
if "%DEPLOY_METHOD%"=="3" goto skip_deploy

:deploy_s3
echo.
echo Uploading to S3...
aws s3 cp backend-deploy.zip s3://%S3_BUCKET%/deployments/backend-deploy.zip

if %ERRORLEVEL% equ 0 (
    echo [OK] Backend uploaded to S3
    echo.
    echo Next steps:
    echo 1. SSH into your EC2 instance
    echo 2. Download: aws s3 cp s3://%S3_BUCKET%/deployments/backend-deploy.zip .
    echo 3. Unzip: unzip backend-deploy.zip
    echo 4. Run: npm start
) else (
    echo [ERROR] Upload failed
)
goto end_deploy

:deploy_eb
echo.
echo Deploying to Elastic Beanstalk...
echo.

REM Check if EB CLI is installed
where eb >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [WARNING] EB CLI not installed!
    echo.
    echo Install with: pip install awsebcli
    echo.
    echo After installing, run these commands manually:
    echo   cd ConnectHub-Backend
    echo   eb init -p node.js-18 lynkapp-api --region us-east-1
    echo   eb create lynkapp-api-prod
    echo   eb setenv DATABASE_URL=postgresql://lynkadmin:Lynkapp2024!@%DB_ENDPOINT%:5432/lynkapp
    echo   eb open
    goto end_deploy
)

cd ConnectHub-Backend

REM Initialize EB if not already done
if not exist ".elasticbeanstalk" (
    echo Initializing Elastic Beanstalk...
    call eb init -p "Node.js 18" lynkapp-api --region us-east-1
)

REM Create environment
echo Creating/Updating EB environment...
call eb create lynkapp-api-prod 2>nul

if %ERRORLEVEL% neq 0 (
    echo Environment may already exist, deploying update...
    call eb deploy lynkapp-api-prod
)

REM Set environment variables
echo Setting environment variables...
call eb setenv DATABASE_URL=postgresql://lynkadmin:Lynkapp2024!@%DB_ENDPOINT%:5432/lynkapp AWS_S3_BUCKET=%S3_BUCKET% NODE_ENV=production

echo.
echo [OK] Deployed to Elastic Beanstalk!
echo.
echo Opening application...
call eb open

cd ..
goto end_deploy

:skip_deploy
echo.
echo [OK] Deployment files prepared
echo.
echo Files ready:
echo - ConnectHub-Backend/.env (configuration)
echo - backend-deploy.zip (deployment package)
echo.

:end_deploy

REM ===================================================================
REM Step 9: Save Deployment Info
REM ===================================================================
echo.
echo [STEP 9] Saving deployment information...
echo.

(
    echo # LynkApp Backend Deployment Information
    echo # Generated: %DATE% %TIME%
    echo.
    echo DATABASE_ENDPOINT=%DB_ENDPOINT%
    echo S3_BUCKET=%S3_BUCKET%
    echo DATABASE_URL=postgresql://lynkadmin:Lynkapp2024!@%DB_ENDPOINT%:5432/lynkapp
    echo.
    echo # Connection Test
    echo psql "postgresql://lynkadmin:Lynkapp2024!@%DB_ENDPOINT%:5432/lynkapp"
) > backend-deployment-info.txt

echo [OK] Deployment info saved to: backend-deployment-info.txt
echo.

REM ===================================================================
REM Completion Summary
REM ===================================================================
echo ===================================================================
echo   DEPLOYMENT COMPLETE!
echo ===================================================================
echo.
echo Backend Configuration:
echo   Database: %DB_ENDPOINT%:5432
echo   S3 Bucket: %S3_BUCKET%
echo   Config File: ConnectHub-Backend/.env
echo.
echo Files Created:
echo   - ConnectHub-Backend/.env
echo   - backend-deploy.zip
echo   - backend-deployment-info.txt
echo.
echo Next Steps:
echo   1. Test database connection
echo   2. If using EB: Check status with 'eb status'
echo   3. If using EC2: Upload and extract backend-deploy.zip
echo   4. Run: npm start (or 'node dist/server.js' if built)
echo.
echo ===================================================================
echo.

pause
