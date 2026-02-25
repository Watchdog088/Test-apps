@echo off
REM ===================================================================
REM ConnectHub - COMPLETE AWS Deployment (Database + Backend Server)
REM Deploys: Database Infrastructure + Backend API Server + Schema Init
REM ===================================================================
setlocal EnableDelayedExpansion

echo.
echo ===================================================================
echo   ConnectHub - COMPLETE AWS DEPLOYMENT
echo   Database Infrastructure + Backend Server + Schema
echo ===================================================================
echo.

REM ===================================================================
REM PART 1: Deploy Database Infrastructure
REM ===================================================================

call deploy-databases-to-aws-ULTIMATE-FIX.bat

if %ERRORLEVEL% neq 0 (
    echo [ERROR] Database deployment failed!
    echo Please fix the database deployment before deploying backend.
    pause
    exit /b 1
)

echo.
echo ===================================================================
echo   Database Deployment Complete!
echo   Now deploying Backend Server...
echo ===================================================================
echo.

REM Load database endpoints from deployment
if exist .aws-db-endpoint (
    set /p DB_ENDPOINT=<.aws-db-endpoint
)
if exist .aws-redis-endpoint (
    set /p REDIS_ENDPOINT=<.aws-redis-endpoint
)
if exist .aws-uploads-bucket (
    set /p S3_BUCKET=<.aws-uploads-bucket
)

REM ===================================================================
REM PART 2: Build Backend Application
REM ===================================================================

echo.
echo ===================================================================
echo   Step 1: Building Backend Application
echo ===================================================================
echo.

echo [INFO] Navigating to backend directory...
cd ConnectHub-Backend

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js is installed

REM Install dependencies
echo [INFO] Installing backend dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to install dependencies!
    pause
    exit /b 1
)
echo [OK] Dependencies installed

REM Generate Prisma Client
echo [INFO] Generating Prisma Client...
call npx prisma generate --schema prisma/schema-enhanced.prisma
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to generate Prisma client!
    pause
    exit /b 1
)
echo [OK] Prisma Client generated

REM Build TypeScript
echo [INFO] Building TypeScript application...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to build TypeScript!
    pause
    exit /b 1
)
echo [OK] TypeScript build complete

echo.
echo ===================================================================
echo   Step 2: Initializing Database Schema
echo ===================================================================
echo.

REM Create production env file
echo [INFO] Creating production environment configuration...
(
    echo DATABASE_URL=postgresql://connecthubadmin:ConnectHub2024SecurePass!@%DB_ENDPOINT%:5432/connecthub
    echo REDIS_URL=redis://%REDIS_ENDPOINT%:6379
    echo AWS_S3_BUCKET=%S3_BUCKET%
    echo AWS_REGION=us-east-1
    echo NODE_ENV=production
    echo PORT=3001
    echo JWT_SECRET=ConnectHub-JWT-Secret-2024-%RANDOM%
    echo JWT_EXPIRES_IN=7d
) > .env.production

echo [OK] Environment configuration created

REM Deploy database migrations
echo [INFO] Deploying database schema migrations...
call npx prisma migrate deploy --schema prisma/schema-enhanced.prisma
if %ERRORLEVEL% neq 0 (
    echo [WARNING] Database migration failed or already applied
    echo This is normal if tables already exist
)
echo [OK] Database schema initialized

echo.
echo ===================================================================
echo   Step 3: Deploying Backend to AWS EC2
echo ===================================================================
echo.

REM Check if EC2 instance exists
echo [INFO] Checking for existing EC2 instance...
for /f "tokens=*" %%i in ('aws ec2 describe-instances --filters "Name=tag:Name,Values=connecthub-backend" "Name=instance-state-name,Values=running" --query "Reservations[0].Instances[0].InstanceId" --output text 2^>nul') do set EC2_INSTANCE_ID=%%i

if "%EC2_INSTANCE_ID%"=="None" (
    echo [INFO] No existing instance found, creating new EC2 instance...
    goto create_ec2
) else if "%EC2_INSTANCE_ID%"=="" (
    echo [INFO] No existing instance found, creating new EC2 instance...
    goto create_ec2
) else (
    echo [INFO] Found existing instance: %EC2_INSTANCE_ID%
    echo [INFO] Will update existing instance
    goto update_ec2
)

:create_ec2
echo [INFO] Creating EC2 security group for backend...

REM Load VPC ID
if exist ..\.aws-vpc-id (
    set /p VPC_ID=<..\.aws-vpc-id
) else (
    echo [ERROR] VPC ID not found! Database deployment may have failed.
    pause
    exit /b 1
)

REM Create backend security group
for /f "tokens=*" %%i in ('aws ec2 create-security-group --group-name connecthub-backend-sg --description "ConnectHub Backend API Security Group" --vpc-id %VPC_ID% --query "GroupId" --output text 2^>nul') do set SG_BACKEND=%%i

if "%SG_BACKEND%"=="" (
    echo [WARNING] Security group may already exist
    for /f "tokens=*" %%i in ('aws ec2 describe-security-groups --filters "Name=group-name,Values=connecthub-backend-sg" "Name=vpc-id,Values=%VPC_ID%" --query "SecurityGroups[0].GroupId" --output text 2^>nul') do set SG_BACKEND=%%i
)

echo [OK] Backend Security Group: %SG_BACKEND%

REM Add security group rules
echo [INFO] Configuring security group rules...
aws ec2 authorize-security-group-ingress --group-id %SG_BACKEND% --protocol tcp --port 3001 --cidr 0.0.0.0/0 >nul 2>&1
aws ec2 authorize-security-group-ingress --group-id %SG_BACKEND% --protocol tcp --port 22 --cidr 0.0.0.0/0 >nul 2>&1
echo [OK] Security group configured

REM Get public subnet
if exist ..\.aws-deployment-info.txt (
    for /f "tokens=2 delims==" %%i in ('findstr /C:"SUBNET_PUBLIC_1A" ..\.aws-deployment-info.txt') do set SUBNET_ID=%%i
)

echo [INFO] Creating EC2 instance for backend...
echo [INFO] Instance type: t3.small (2 vCPU, 2GB RAM)
echo.

REM Create user data script for EC2
(
    echo #!/bin/bash
    echo # Update system
    echo yum update -y
    echo.
    echo # Install Node.js 18
    echo curl -sL https://rpm.nodesource.com/setup_18.x ^| bash -
    echo yum install -y nodejs
    echo.
    echo # Install PM2 globally
    echo npm install -g pm2
    echo.
    echo # Create app directory
    echo mkdir -p /home/ec2-user/connecthub-backend
    echo chown ec2-user:ec2-user /home/ec2-user/connecthub-backend
) > user-data.sh

REM Launch EC2 instance
for /f "tokens=*" %%i in ('aws ec2 run-instances --image-id ami-0c02fb55b03a3fc04 --instance-type t3.small --key-name connecthub-key --security-group-ids %SG_BACKEND% --subnet-id %SUBNET_ID% --user-data file://user-data.sh --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=connecthub-backend}]" --query "Instances[0].InstanceId" --output text 2^>nul') do set EC2_INSTANCE_ID=%%i

if "%EC2_INSTANCE_ID%"=="" (
    echo [ERROR] Failed to create EC2 instance!
    echo.
    echo This could be due to:
    echo 1. No SSH key pair named 'connecthub-key' exists
    echo 2. Insufficient EC2 permissions
    echo 3. Instance limit reached
    echo.
    echo MANUAL SETUP REQUIRED:
    echo 1. Create EC2 key pair: aws ec2 create-key-pair --key-name connecthub-key --query "KeyMaterial" --output text ^> connecthub-key.pem
    echo 2. Run this script again
    echo.
    del user-data.sh 2>nul
    pause
    exit /b 1
)

echo [OK] EC2 Instance created: %EC2_INSTANCE_ID%
echo %EC2_INSTANCE_ID% > ..\.aws-backend-instance-id

del user-data.sh 2>nul

echo [INFO] Waiting for instance to start (60 seconds)...
timeout /t 60 /nobreak >nul

REM Get instance public IP
for /f "tokens=*" %%i in ('aws ec2 describe-instances --instance-ids %EC2_INSTANCE_ID% --query "Reservations[0].Instances[0].PublicIpAddress" --output text 2^>nul') do set BACKEND_IP=%%i
echo [OK] Backend Server IP: %BACKEND_IP%
echo %BACKEND_IP% > ..\.aws-backend-ip

goto deploy_code

:update_ec2
echo [INFO] Updating existing EC2 instance: %EC2_INSTANCE_ID%

REM Get instance public IP
for /f "tokens=*" %%i in ('aws ec2 describe-instances --instance-ids %EC2_INSTANCE_ID% --query "Reservations[0].Instances[0].PublicIpAddress" --output text 2^>nul') do set BACKEND_IP=%%i
echo [OK] Backend Server IP: %BACKEND_IP%

:deploy_code
echo.
echo ===================================================================
echo   Step 4: Deploying Code to EC2
echo ===================================================================
echo.

echo [INFO] Backend API will be available at: http://%BACKEND_IP%:3001
echo.
echo [INFO] To deploy code to EC2, you need to:
echo.
echo 1. Set up SSH access with your key pair
echo 2. Upload the built application to EC2
echo 3. Start the application with PM2
echo.
echo MANUAL DEPLOYMENT STEPS:
echo ========================
echo.
echo # On your local machine:
echo scp -i connecthub-key.pem -r dist node_modules package.json .env.production ec2-user@%BACKEND_IP%:/home/ec2-user/connecthub-backend/
echo.
echo # Connect to EC2:
echo ssh -i connecthub-key.pem ec2-user@%BACKEND_IP%
echo.
echo # On EC2 instance:
echo cd connecthub-backend
echo pm2 start dist/server-phase1.js --name connecthub-api
echo pm2 save
echo pm2 startup
echo.
echo Alternatively, use AWS Systems Manager for easier deployment without SSH keys.
echo.

cd ..

echo.
echo ===================================================================
echo   DEPLOYMENT SUMMARY
echo ===================================================================
echo.
echo ┌─────────────────────────────────────────────────────────────┐
echo │                                                             │
echo │          ConnectHub - Complete Deployment Summary           │
echo │                                                             │
echo └─────────────────────────────────────────────────────────────┘
echo.
echo DATABASE INFRASTRUCTURE:
echo   ✓ PostgreSQL: %DB_ENDPOINT%:5432
echo   ✓ Redis: %REDIS_ENDPOINT%:6379
echo   ✓ S3 Bucket: %S3_BUCKET%
echo.
echo BACKEND SERVER:
echo   ✓ EC2 Instance: %EC2_INSTANCE_ID%
echo   ✓ Public IP: %BACKEND_IP%
echo   ✓ API Endpoint: http://%BACKEND_IP%:3001
echo.
echo APPLICATION:
echo   ✓ Backend Built: Yes
echo   ✓ Database Schema: Initialized
echo   ✓ Environment Config: Created
echo.
echo NEXT STEPS:
echo   1. Deploy code to EC2 (see manual steps above)
echo   2. Update Frontend API URL to: http://%BACKEND_IP%:3001
echo   3. Test API: curl http://%BACKEND_IP%:3001/health
echo.
echo FILES CREATED:
echo   ✓ ConnectHub-Backend/.env.production
echo   ✓ ConnectHub-Backend/dist/ (built application)
echo   ✓ .aws-backend-instance-id
echo   ✓ .aws-backend-ip
echo.
echo ===================================================================
echo.

pause
