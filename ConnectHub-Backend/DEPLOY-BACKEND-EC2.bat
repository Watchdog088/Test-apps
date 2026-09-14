@echo off
REM ============================================================
REM  LynkApp — Deploy ConnectHub-Backend to AWS EC2
REM  Run this from the project root (Test-apps\Test-apps)
REM  Pre-requisites: AWS CLI configured, SSH key .pem available
REM ============================================================

setlocal EnableDelayedExpansion

echo.
echo =========================================================
echo   LynkApp Backend — AWS EC2 Deployment Script
echo   Date: %date% %time%
echo =========================================================
echo.

REM ── EDIT THESE TWO LINES BEFORE RUNNING ──────────────────────
set EC2_IP=YOUR_EC2_PUBLIC_IP
set KEY_PATH=C:\Users\Jnewball\.ssh\lynkapp-key.pem
REM ─────────────────────────────────────────────────────────────

if "%EC2_IP%"=="YOUR_EC2_PUBLIC_IP" (
    echo [ERROR] You must set EC2_IP in this script before running.
    echo Open DEPLOY-BACKEND-EC2.bat and replace YOUR_EC2_PUBLIC_IP
    echo with your actual EC2 public IP or DNS name.
    pause
    exit /b 1
)

if not exist "%KEY_PATH%" (
    echo [ERROR] SSH key not found at: %KEY_PATH%
    echo Update KEY_PATH in this script to point to your .pem file.
    pause
    exit /b 1
)

echo [1/7] Testing SSH connection to EC2...
ssh -i "%KEY_PATH%" -o ConnectTimeout=10 -o StrictHostKeyChecking=no ec2-user@%EC2_IP% "echo SSH OK" 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Cannot connect to EC2. Check IP and key file.
    pause
    exit /b 1
)
echo       Connected successfully.
echo.

echo [2/7] Uploading backend source code to EC2...
REM Create the target directory on EC2
ssh -i "%KEY_PATH%" ec2-user@%EC2_IP% "mkdir -p /home/ec2-user/lynkapp-backend"

REM Upload using rsync (faster, skips node_modules and dev.db)
rsync -avz --progress ^
    --exclude="node_modules" ^
    --exclude="dist" ^
    --exclude="*.log" ^
    --exclude="prisma/dev.db" ^
    --exclude=".env" ^
    -e "ssh -i \"%KEY_PATH%\" -o StrictHostKeyChecking=no" ^
    "ConnectHub-Backend/" ^
    "ec2-user@%EC2_IP%:/home/ec2-user/lynkapp-backend/"

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] rsync upload failed. Make sure rsync is installed.
    echo Install via: winget install rsync
    pause
    exit /b 1
)
echo       Upload complete.
echo.

echo [3/7] Uploading production .env to EC2...
REM Check for production env file
if not exist "ConnectHub-Backend\.env.production" (
    echo [WARNING] ConnectHub-Backend\.env.production not found.
    echo Creating from .env — you MUST update DATABASE_URL and REDIS_URL on EC2!
    copy "ConnectHub-Backend\.env" "ConnectHub-Backend\.env.production.tmp"
    set ENV_FILE=ConnectHub-Backend\.env.production.tmp
) else (
    set ENV_FILE=ConnectHub-Backend\.env.production
)

scp -i "%KEY_PATH%" -o StrictHostKeyChecking=no ^
    "!ENV_FILE!" ^
    "ec2-user@%EC2_IP%:/home/ec2-user/lynkapp-backend/.env"

echo       .env uploaded.
echo.

echo [4/7] Running EC2 server setup script...
ssh -i "%KEY_PATH%" ec2-user@%EC2_IP% "bash /home/ec2-user/lynkapp-backend/ec2-setup.sh" 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Setup script had errors - check output above.
    echo You may need to run ec2-setup.sh manually on the server.
)
echo.

echo [5/7] Installing npm dependencies on EC2...
ssh -i "%KEY_PATH%" ec2-user@%EC2_IP% ^
    "cd /home/ec2-user/lynkapp-backend && npm install --production 2>&1"
echo.

echo [6/7] Building TypeScript...
ssh -i "%KEY_PATH%" ec2-user@%EC2_IP% ^
    "cd /home/ec2-user/lynkapp-backend && npm run build 2>&1"
echo.

echo [7/7] Running Prisma migrations and starting server...
ssh -i "%KEY_PATH%" ec2-user@%EC2_IP% ^
    "cd /home/ec2-user/lynkapp-backend && npx prisma generate && npx prisma migrate deploy && pm2 restart lynkapp-backend || pm2 start dist/server.js --name lynkapp-backend --max-memory-restart 400M 2>&1"
echo.

echo =========================================================
echo   Deployment Complete!
echo.
echo   Backend URL: http://%EC2_IP%:5000
echo   Health check: http://%EC2_IP%:5000/health
echo.
echo   NEXT STEPS:
echo   1. Point api.lynkapp.net DNS to %EC2_IP% in Route53
echo   2. Run setup-ssl.sh on EC2 to enable HTTPS
echo   3. Verify Stripe webhook receives events in dashboard
echo =========================================================
echo.

REM Clean up temp file if created
if exist "ConnectHub-Backend\.env.production.tmp" del "ConnectHub-Backend\.env.production.tmp"

pause
