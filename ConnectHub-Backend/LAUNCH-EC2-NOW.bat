@echo off
setlocal EnableDelayedExpansion
echo ============================================================
echo  LAUNCH EC2 SERVER — LynkApp Backend (Fully Automated)
echo  Runs in us-east-1 with t3.small + Amazon Linux 2023
echo ============================================================
echo.

:: ── STEP 0: Verify AWS CLI is working ────────────────────────
echo [0/5] Verifying AWS credentials...
aws sts get-caller-identity --region us-east-1 --output text >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo  ERROR: AWS CLI auth failed.
    echo  FIX: Right-click Command Prompt as Administrator and run:
    echo       w32tm /resync /force
    echo  Then run this script again.
    echo.
    exit /b 1
)
echo  AWS credentials OK.
echo.

:: ── STEP 1: Create Security Group ────────────────────────────
echo [1/5] Creating security group "lynkapp-backend-sg"...
aws ec2 create-security-group ^
  --group-name lynkapp-backend-sg ^
  --description "LynkApp Backend — API port 5000 + SSH 22 + HTTP 80 + HTTPS 443" ^
  --region us-east-1 ^
  --query "GroupId" ^
  --output text > sg-id.txt 2>sg-error.txt

if %errorlevel% neq 0 (
    :: Security group may already exist — try to get its ID
    aws ec2 describe-security-groups ^
      --filters "Name=group-name,Values=lynkapp-backend-sg" ^
      --region us-east-1 ^
      --query "SecurityGroups[0].GroupId" ^
      --output text > sg-id.txt 2>&1
)

set /p SG_ID=<sg-id.txt
echo  Security Group ID: %SG_ID%

:: Add inbound rules (errors are OK if rules already exist)
echo  Adding inbound rules...
aws ec2 authorize-security-group-ingress --group-id %SG_ID% --protocol tcp --port 22   --cidr 0.0.0.0/0 --region us-east-1 >nul 2>&1
aws ec2 authorize-security-group-ingress --group-id %SG_ID% --protocol tcp --port 80   --cidr 0.0.0.0/0 --region us-east-1 >nul 2>&1
aws ec2 authorize-security-group-ingress --group-id %SG_ID% --protocol tcp --port 443  --cidr 0.0.0.0/0 --region us-east-1 >nul 2>&1
aws ec2 authorize-security-group-ingress --group-id %SG_ID% --protocol tcp --port 5000 --cidr 0.0.0.0/0 --region us-east-1 >nul 2>&1
echo  Rules added: SSH(22), HTTP(80), HTTPS(443), API(5000)
echo.

:: ── STEP 2: Create SSH Key Pair ───────────────────────────────
echo [2/5] Creating SSH key pair "lynkapp-key"...
if exist "%USERPROFILE%\.ssh\lynkapp-key.pem" (
    echo  Key already exists at %USERPROFILE%\.ssh\lynkapp-key.pem — skipping.
) else (
    if not exist "%USERPROFILE%\.ssh" mkdir "%USERPROFILE%\.ssh"
    aws ec2 create-key-pair ^
      --key-name lynkapp-key ^
      --region us-east-1 ^
      --query "KeyMaterial" ^
      --output text > "%USERPROFILE%\.ssh\lynkapp-key.pem" 2>key-error.txt
    if %errorlevel% neq 0 (
        echo  Key may already exist in AWS — checking...
        del "%USERPROFILE%\.ssh\lynkapp-key.pem" >nul 2>&1
        echo  WARNING: Could not create key pair. If it already exists in AWS,
        echo  use your existing lynkapp-key.pem file.
    ) else (
        echo  Key saved to: %USERPROFILE%\.ssh\lynkapp-key.pem
        echo  IMPORTANT: Back this file up — you cannot download it again!
    )
)
echo.

:: ── STEP 3: Launch EC2 Instance ───────────────────────────────
echo [3/5] Launching EC2 t3.small instance...
echo  AMI: ami-0c02fb55956c7d316 (Amazon Linux 2023, us-east-1)
echo  This takes about 60-90 seconds to become available.
echo.

aws ec2 run-instances ^
  --image-id ami-0c02fb55956c7d316 ^
  --instance-type t3.small ^
  --key-name lynkapp-key ^
  --security-group-ids %SG_ID% ^
  --user-data file://ec2-userdata.sh ^
  --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=lynkapp-backend},{Key=Project,Value=LynkApp}]" ^
  --region us-east-1 ^
  --query "Instances[0].InstanceId" ^
  --output text > instance-id.txt 2>launch-error.txt

if %errorlevel% neq 0 (
    echo  ERROR launching EC2:
    type launch-error.txt
    exit /b 1
)

set /p INSTANCE_ID=<instance-id.txt
echo  Instance ID: %INSTANCE_ID%
echo.

:: ── STEP 4: Wait for public IP ───────────────────────────────
echo [4/5] Waiting 30 seconds for instance to get a public IP...
timeout /t 30 /nobreak >nul

aws ec2 describe-instances ^
  --instance-ids %INSTANCE_ID% ^
  --region us-east-1 ^
  --query "Reservations[0].Instances[0].PublicIpAddress" ^
  --output text > ec2-ip.txt 2>&1

set /p EC2_IP=<ec2-ip.txt
echo  Public IP: %EC2_IP%

:: Save instance info
echo Instance ID: %INSTANCE_ID% > ec2-instance-info.txt
echo Public IP:   %EC2_IP%     >> ec2-instance-info.txt
echo Security Group: %SG_ID%   >> ec2-instance-info.txt
echo Region: us-east-1         >> ec2-instance-info.txt
echo Launched: %DATE% %TIME%   >> ec2-instance-info.txt
echo.

:: ── STEP 5: Print next steps ──────────────────────────────────
echo [5/5] Launch COMPLETE!
echo.
echo ============================================================
echo  EC2 Instance is RUNNING
echo ============================================================
echo.
echo  Instance ID : %INSTANCE_ID%
echo  Public IP   : %EC2_IP%
echo  SSH Key     : %USERPROFILE%\.ssh\lynkapp-key.pem
echo  API URL     : http://%EC2_IP%:5000
echo.
echo ============================================================
echo  NEXT STEPS (run these in order, wait ~3 min after launch):
echo ============================================================
echo.
echo  1. Upload your backend code:
echo     xcopy /E /I ConnectHub-Backend\* temp-backend\
echo     Then zip and SCP it, or use GitHub clone on the server
echo.
echo  2. Upload .env file:
echo     scp -i "%USERPROFILE%\.ssh\lynkapp-key.pem" ConnectHub-Backend\.env.production ec2-user@%EC2_IP%:/home/ec2-user/lynkapp-backend/.env
echo.
echo  3. SSH in and start the app:
echo     ssh -i "%USERPROFILE%\.ssh\lynkapp-key.pem" ec2-user@%EC2_IP%
echo     cd /home/ec2-user/lynkapp-backend
echo     npm install
echo     npx prisma migrate deploy
echo     npm run build
echo     pm2 start dist/server.js --name lynkapp-backend
echo     pm2 save
echo.
echo  4. Test health endpoint:
echo     curl http://%EC2_IP%:5000/health
echo.
echo  5. Update ConnectHub-Backend\.env with:
echo     APP_URL=http://%EC2_IP%:5000
echo.
echo  6. Run WIRE-DNS-AFTER-EC2.bat to point api.lynkapp.net to this IP
echo.
echo ============================================================
echo  Instance info saved to: ec2-instance-info.txt
echo ============================================================
echo.
