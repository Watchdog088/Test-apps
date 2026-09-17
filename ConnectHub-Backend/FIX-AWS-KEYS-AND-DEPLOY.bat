@echo off
REM ================================================================
REM  FIX-AWS-KEYS-AND-DEPLOY.bat
REM  Run this AFTER you paste your new AWS Access Key + Secret below
REM  Sep 17, 2026
REM ================================================================

REM ── STEP 1: Set your new AWS keys here ─────────────────────────
REM  Get them from: AWS Console → IAM → Users → Security credentials
REM  → Create access key

set NEW_KEY_ID=PASTE_YOUR_NEW_ACCESS_KEY_ID_HERE
set NEW_SECRET=PASTE_YOUR_NEW_SECRET_ACCESS_KEY_HERE

if "%NEW_KEY_ID%"=="PASTE_YOUR_NEW_ACCESS_KEY_ID_HERE" (
  echo.
  echo  ERROR: You must paste your AWS keys into this file first!
  echo.
  echo  HOW TO GET NEW KEYS:
  echo  1. Go to https://console.aws.amazon.com/iam/home#/security_credentials
  echo  2. Click "Create access key"
  echo  3. Copy the Access Key ID and Secret Access Key
  echo  4. Paste them into this .bat file ^(replace the PASTE_... text^)
  echo  5. Save the file and run it again
  echo.
  pause
  exit /b 1
)

REM ── STEP 2: Write new credentials ──────────────────────────────
echo [default] > "%USERPROFILE%\.aws\credentials"
echo aws_access_key_id=%NEW_KEY_ID% >> "%USERPROFILE%\.aws\credentials"
echo aws_secret_access_key=%NEW_SECRET% >> "%USERPROFILE%\.aws\credentials"

echo [default] > "%USERPROFILE%\.aws\config"
echo region=us-east-1 >> "%USERPROFILE%\.aws\config"
echo output=json >> "%USERPROFILE%\.aws\config"

echo.
echo  Keys written. Testing credentials...
aws sts get-caller-identity
if errorlevel 1 (
  echo  ERROR: Keys are invalid. Check that you copied them correctly.
  pause
  exit /b 1
)

echo.
echo  ✅ AWS credentials are working!
echo.

REM ── STEP 3: Create key pair for SSH ────────────────────────────
echo  Creating SSH key pair lynkapp-key...
aws ec2 describe-key-pairs --key-names lynkapp-key --region us-east-1 >nul 2>&1
if errorlevel 1 (
  aws ec2 create-key-pair --key-name lynkapp-key --region us-east-1 --query "KeyMaterial" --output text > "%USERPROFILE%\lynkapp-key.pem"
  echo  SSH key saved to: %USERPROFILE%\lynkapp-key.pem
) else (
  echo  Key pair lynkapp-key already exists.
)

REM ── STEP 4: Create Security Group ──────────────────────────────
echo.
echo  Creating security group lynkapp-backend-sg...
for /f "tokens=*" %%i in ('aws ec2 describe-security-groups --region us-east-1 --filters "Name=group-name,Values=lynkapp-backend-sg" --query "SecurityGroups[0].GroupId" --output text 2^>nul') do set SG_ID=%%i

if "%SG_ID%"=="None" set SG_ID=
if "%SG_ID%"=="" (
  for /f "tokens=*" %%i in ('aws ec2 create-security-group --group-name lynkapp-backend-sg --description "LynkApp Backend" --region us-east-1 --query "GroupId" --output text') do set SG_ID=%%i
  aws ec2 authorize-security-group-ingress --group-id %SG_ID% --region us-east-1 --protocol tcp --port 22 --cidr 0.0.0.0/0
  aws ec2 authorize-security-group-ingress --group-id %SG_ID% --region us-east-1 --protocol tcp --port 80 --cidr 0.0.0.0/0
  aws ec2 authorize-security-group-ingress --group-id %SG_ID% --region us-east-1 --protocol tcp --port 443 --cidr 0.0.0.0/0
  aws ec2 authorize-security-group-ingress --group-id %SG_ID% --region us-east-1 --protocol tcp --port 3001 --cidr 0.0.0.0/0
  echo  Security group created: %SG_ID%
) else (
  echo  Security group already exists: %SG_ID%
)

REM ── STEP 5: Get latest Amazon Linux 2023 AMI ───────────────────
echo.
echo  Looking up latest Amazon Linux 2023 AMI...
for /f "tokens=*" %%i in ('aws ec2 describe-images --region us-east-1 --owners amazon --filters "Name=name,Values=al2023-ami-2023*-x86_64" "Name=state,Values=available" --query "sort_by(Images,&CreationDate)[-1].ImageId" --output text') do set AMI_ID=%%i
echo  AMI: %AMI_ID%

REM ── STEP 6: Launch EC2 instance ────────────────────────────────
echo.
echo  Launching t3.small EC2 instance...
for /f "tokens=*" %%i in ('aws ec2 run-instances --region us-east-1 --image-id %AMI_ID% --instance-type t3.small --key-name lynkapp-key --security-group-ids %SG_ID% --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=lynkapp-backend}]" --user-data file://ConnectHub-Backend/ec2-setup.sh --query "Instances[0].InstanceId" --output text') do set INSTANCE_ID=%%i

echo  Instance launched: %INSTANCE_ID%
echo.
echo  Waiting for instance to reach 'running' state (2-3 minutes)...
aws ec2 wait instance-running --region us-east-1 --instance-ids %INSTANCE_ID%

REM ── STEP 7: Get Public IP ───────────────────────────────────────
for /f "tokens=*" %%i in ('aws ec2 describe-instances --region us-east-1 --instance-ids %INSTANCE_ID% --query "Reservations[0].Instances[0].PublicIpAddress" --output text') do set EC2_IP=%%i
echo  ✅ EC2 is RUNNING at IP: %EC2_IP%

REM ── STEP 8: Save IP to file ────────────────────────────────────
echo %EC2_IP% > ConnectHub-Backend\ec2-ip.txt
echo %INSTANCE_ID% > ConnectHub-Backend\ec2-instance-id.txt

REM ── STEP 9: Wire DNS ───────────────────────────────────────────
echo.
echo  Wiring api.lynkapp.net DNS to %EC2_IP%...

REM Find the hosted zone for lynkapp.net
for /f "tokens=*" %%i in ('aws route53 list-hosted-zones --query "HostedZones[?Name==`lynkapp.net.`].Id" --output text 2^>nul') do set ZONE_ID=%%i

if "%ZONE_ID%"=="" (
  echo  WARNING: No Route53 hosted zone found for lynkapp.net
  echo  You will need to wire DNS manually. EC2 IP: %EC2_IP%
) else (
  set ZONE_ID=%ZONE_ID:/hostedzone/=%
  echo {"Comment":"wire api subdomain","Changes":[{"Action":"UPSERT","ResourceRecordSet":{"Name":"api.lynkapp.net","Type":"A","TTL":60,"ResourceRecords":[{"Value":"%EC2_IP%"}]}}]} > %TEMP%\dns-change.json
  aws route53 change-resource-record-sets --hosted-zone-id %ZONE_ID% --change-batch file://%TEMP%\dns-change.json
  echo  ✅ DNS wired: api.lynkapp.net → %EC2_IP%
)

REM ── STEP 10: Upload .env.production ────────────────────────────
echo.
echo  Uploading .env.production to EC2...
echo  (This requires OpenSSH - waiting 60s for EC2 to fully boot first)
timeout /t 60 /nobreak

scp -i "%USERPROFILE%\lynkapp-key.pem" -o StrictHostKeyChecking=no ^
  ConnectHub-Backend\.env.production ^
  ec2-user@%EC2_IP%:/home/ec2-user/

scp -i "%USERPROFILE%\lynkapp-key.pem" -o StrictHostKeyChecking=no ^
  ConnectHub-SPA\serviceAccountKey.json ^
  ec2-user@%EC2_IP%:/home/ec2-user/

REM ── DONE ───────────────────────────────────────────────────────
echo.
echo ============================================================
echo  DEPLOYMENT COMPLETE!
echo ============================================================
echo.
echo  EC2 Instance ID : %INSTANCE_ID%
echo  EC2 Public IP   : %EC2_IP%
echo  SSH Key         : %USERPROFILE%\lynkapp-key.pem
echo  API URL         : https://api.lynkapp.net  (after DNS propagates)
echo.
echo  TO SSH INTO THE SERVER:
echo  ssh -i "%USERPROFILE%\lynkapp-key.pem" ec2-user@%EC2_IP%
echo.
echo  The ec2-setup.sh script running on the server will:
echo  - Install Node.js 20
echo  - Clone the repo from GitHub
echo  - npm install + npm run build
echo  - Run Prisma migrations
echo  - Start the server with PM2
echo.
echo  Check server logs after 5 min:
echo  ssh -i "%USERPROFILE%\lynkapp-key.pem" ec2-user@%EC2_IP% "pm2 logs"
echo.
pause
