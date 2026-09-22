@echo off
cd /d c:\Users\Jnewball\Test-apps\Test-apps\ConnectHub-Backend

echo Saving SSH key...
aws ec2 create-key-pair --key-name lynkapp-key --region us-east-1 --query KeyMaterial --output text > "%USERPROFILE%\.ssh\lynkapp-key.pem"
echo Key saved.

echo.
echo Launching EC2 instance...
aws ec2 run-instances --image-id ami-0c02fb55956c7d316 --instance-type t3.small --key-name lynkapp-key --security-group-ids sg-01493ed5030601d74 --user-data file://ec2-userdata.sh --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=lynkapp-backend}]" --region us-east-1 --query "Instances[0].InstanceId" --output text > instance-id.txt 2>launch-err.txt

if %errorlevel% neq 0 (
    echo LAUNCH ERROR:
    type launch-err.txt
    exit /b 1
)

set /p INSTANCE_ID=<instance-id.txt
echo Instance ID: %INSTANCE_ID%

echo Waiting 35 seconds for IP...
timeout /t 35 /nobreak >nul

aws ec2 describe-instances --instance-ids %INSTANCE_ID% --region us-east-1 --query "Reservations[0].Instances[0].PublicIpAddress" --output text > ec2-ip.txt
set /p EC2_IP=<ec2-ip.txt

echo.
echo =====================================================
echo  EC2 IS RUNNING
echo  IP:  %EC2_IP%
echo  SSH: ssh -i %USERPROFILE%\.ssh\lynkapp-key.pem ec2-user@%EC2_IP%
echo  API: http://%EC2_IP%:5000/health
echo =====================================================
