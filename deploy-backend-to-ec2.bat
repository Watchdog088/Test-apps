@echo off
set EC2_IP=100.48.76.239
set KEY=C:\Users\Jnewball\.ssh\lynkapp-key.pem
set BACKEND_DIR=c:\Users\Jnewball\Test-apps\Test-apps\ConnectHub-Backend

echo =====================================================
echo  Deploying LynkApp Backend to EC2: %EC2_IP%
echo =====================================================

echo.
echo [1/5] Testing SSH connection...
ssh -i "%KEY%" -o StrictHostKeyChecking=no -o ConnectTimeout=15 ec2-user@%EC2_IP% "echo SSH OK" 2>&1
if %errorlevel% neq 0 (
    echo SSH failed. EC2 may still be booting. Wait 2 more minutes and retry.
    exit /b 1
)

echo.
echo [2/5] Creating app directory on EC2...
ssh -i "%KEY%" -o StrictHostKeyChecking=no ec2-user@%EC2_IP% "mkdir -p /home/ec2-user/lynkapp-backend && echo dir created"

echo.
echo [3/5] Uploading backend files (this takes 1-2 minutes)...
scp -i "%KEY%" -o StrictHostKeyChecking=no -r "%BACKEND_DIR%\src" ec2-user@%EC2_IP%:/home/ec2-user/lynkapp-backend/
scp -i "%KEY%" -o StrictHostKeyChecking=no -r "%BACKEND_DIR%\prisma" ec2-user@%EC2_IP%:/home/ec2-user/lynkapp-backend/
scp -i "%KEY%" -o StrictHostKeyChecking=no "%BACKEND_DIR%\package.json" ec2-user@%EC2_IP%:/home/ec2-user/lynkapp-backend/
scp -i "%KEY%" -o StrictHostKeyChecking=no "%BACKEND_DIR%\tsconfig.json" ec2-user@%EC2_IP%:/home/ec2-user/lynkapp-backend/ 2>nul
scp -i "%KEY%" -o StrictHostKeyChecking=no "%BACKEND_DIR%\.env.production" ec2-user@%EC2_IP%:/home/ec2-user/lynkapp-backend/.env

echo.
echo [4/5] Installing, building, migrating on EC2...
ssh -i "%KEY%" -o StrictHostKeyChecking=no ec2-user@%EC2_IP% "cd /home/ec2-user/lynkapp-backend && npm install --production=false 2>&1 | tail -5"
ssh -i "%KEY%" -o StrictHostKeyChecking=no ec2-user@%EC2_IP% "cd /home/ec2-user/lynkapp-backend && npx tsc --skipLibCheck 2>&1 | tail -10"
ssh -i "%KEY%" -o StrictHostKeyChecking=no ec2-user@%EC2_IP% "cd /home/ec2-user/lynkapp-backend && npx prisma migrate deploy 2>&1 | tail -10"

echo.
echo [5/5] Starting server with PM2...
ssh -i "%KEY%" -o StrictHostKeyChecking=no ec2-user@%EC2_IP% "cd /home/ec2-user/lynkapp-backend && pm2 start dist/server.js --name lynkapp-backend --restart-delay=3000 && pm2 save"

echo.
echo Testing health endpoint...
timeout /t 5 /nobreak >nul
ssh -i "%KEY%" -o StrictHostKeyChecking=no ec2-user@%EC2_IP% "curl -s http://localhost:5000/health"

echo.
echo =====================================================
echo  DEPLOYMENT COMPLETE
echo  Health: http://%EC2_IP%:5000/health
echo  Logs:   ssh -i %KEY% ec2-user@%EC2_IP% "pm2 logs"
echo =====================================================
