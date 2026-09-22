@echo off
cd /d c:\Users\Jnewball\Test-apps\Test-apps\ConnectHub-Backend

echo Launching EC2 with latest AMI ami-0b2c9d1f3edcfd709 (Amazon Linux 2023, Sep 2026)...
aws ec2 run-instances --image-id ami-0b2c9d1f3edcfd709 --instance-type t3.small --key-name lynkapp-key --security-group-ids sg-01493ed5030601d74 --user-data file://ec2-userdata.sh --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=lynkapp-backend}]" --region us-east-1 --query "Instances[0].InstanceId" --output text > instance-id.txt 2>launch-err.txt

if %errorlevel% neq 0 (
    echo LAUNCH ERROR:
    type launch-err.txt
    exit /b 1
)

set /p INSTANCE_ID=<instance-id.txt
echo Instance: %INSTANCE_ID%

echo Waiting 60 seconds for instance to boot and get public IP...
ping -n 61 127.0.0.1 >nul 2>&1

aws ec2 describe-instances --instance-ids %INSTANCE_ID% --region us-east-1 --output json > tmp-instance.json 2>&1
node -e "const d=JSON.parse(require('fs').readFileSync('tmp-instance.json','utf8')); const ip=d.Reservations[0].Instances[0].PublicIpAddress; require('fs').writeFileSync('ec2-ip.txt',ip); console.log('IP:',ip);"

set /p EC2_IP=<ec2-ip.txt

echo.
echo =====================================================
echo  NEW EC2 LAUNCHED
echo  Instance: %INSTANCE_ID%
echo  IP: %EC2_IP%
echo  SSH: ssh -i C:\Users\Jnewball\.ssh\lynkapp-key.pem ec2-user@%EC2_IP%
echo =====================================================
echo.
echo Wait 3-5 minutes for user-data boot script to finish,
echo then run: deploy-backend-to-ec2-v2.bat
