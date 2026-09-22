@echo off
setlocal EnableDelayedExpansion
cd /d c:\Users\Jnewball\Test-apps\Test-apps\ConnectHub-Backend

echo [1/5] Creating security group...
aws ec2 create-security-group --group-name lynkapp-backend-sg --description "LynkApp Backend" --region us-east-1 --output text > sg-id.txt 2>sg-err.txt
if %errorlevel% neq 0 (
    aws ec2 describe-security-groups --filters "Name=group-name,Values=lynkapp-backend-sg" --region us-east-1 --query "SecurityGroups[0].GroupId" --output text > sg-id.txt 2>&1
)
set /p SG_ID=<sg-id.txt
echo Security Group: %SG_ID%

echo [2/5] Adding firewall rules...
aws ec2 authorize-security-group-ingress --group-id %SG_ID% --protocol tcp --port 22 --cidr 0.0.0.0/0 --region us-east-1 >nul 2>&1
aws ec2 authorize-security-group-ingress --group-id %SG_ID% --protocol tcp --port 80 --cidr 0.0.0.0/0 --region us-east-1 >nul 2>&1
aws ec2 authorize-security-group-ingress --group-id %SG_ID% --protocol tcp --port 443 --cidr 0.0.0.0/0 --region us-east-1 >nul 2>&1
aws ec2 authorize-security-group-ingress --group-id %SG_ID% --protocol tcp --port 5000 --cidr 0.0.0.0/0 --region us-east-1 >nul 2>&1
echo Rules: SSH 22, HTTP 80, HTTPS 443, API 5000

echo [3/5] Creating SSH key pair...
if not exist "%USERPROFILE%\.ssh" mkdir "%USERPROFILE%\.ssh"
aws ec2 create-key-pair --key-name lynkapp-key --region us-east-1 --query "KeyMaterial" --output text > "%USERPROFILE%\.ssh\lynkapp-key.pem" 2>key-err.txt
if %errorlevel% neq 0 (
    echo Key may already exist in AWS. Check %USERPROFILE%\.ssh\lynkapp-key.pem
) else (
    echo Key saved to %USERPROFILE%\.ssh\lynkapp-key.pem
)

echo [4/5] Launching EC2 t3.small instance...
aws ec2 run-instances --image-id ami-0c02fb55956c7d316 --instance-type t3.small --key-name lynkapp-key --security-group-ids %SG_ID% --user-data file://ec2-userdata.sh --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=lynkapp-backend}]" --region us-east-1 --query "Instances[0].InstanceId" --output text > instance-id.txt 2>launch-err.txt
if %errorlevel% neq 0 (
    echo ERROR:
    type launch-err.txt
    exit /b 1
)
set /p INSTANCE_ID=<instance-id.txt
echo Instance ID: %INSTANCE_ID%

echo [5/5] Waiting 30s for public IP...
timeout /t 30 /nobreak >nul
aws ec2 describe-instances --instance-ids %INSTANCE_ID% --region us-east-1 --query "Reservations[0].Instances[0].PublicIpAddress" --output text > ec2-ip.txt 2>&1
set /p EC2_IP=<ec2-ip.txt

echo.
echo ============================================================
echo  EC2 LAUNCHED SUCCESSFULLY
echo ============================================================
echo  Instance ID: %INSTANCE_ID%
echo  Public IP:   %EC2_IP%
echo  API URL:     http://%EC2_IP%:5000
echo  SSH command: ssh -i %USERPROFILE%\.ssh\lynkapp-key.pem ec2-user@%EC2_IP%
echo ============================================================
echo.
echo Instance info saved to ec2-ip.txt and instance-id.txt
