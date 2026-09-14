@echo off
echo ============================================================
echo  LAUNCH EC2 SERVER — LynkApp Backend
echo ============================================================
echo.
echo  This script launches a t3.small EC2 instance with:
echo  - Amazon Linux 2023
echo  - Node.js 20 pre-installed via user-data
echo  - Redis pre-installed (local, avoids ElastiCache cost)
echo  - Port 5000 open for backend API
echo  - Port 22 open for SSH
echo.
echo  REQUIRES: aws cli configured (run: aws configure)
echo  REQUIRES: SSH key pair named "lynkapp-key" in AWS
echo.
echo  Press any key to launch EC2, or Ctrl+C to cancel...
pause >nul
echo.

:: Create the EC2 instance
echo Launching EC2 t3.small in us-east-1...

aws ec2 run-instances ^
  --image-id ami-0c02fb55956c7d316 ^
  --instance-type t3.small ^
  --key-name lynkapp-key ^
  --security-group-ids sg-REPLACE_WITH_SG_ID ^
  --user-data file://ec2-userdata.sh ^
  --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=lynkapp-backend}]" ^
  --region us-east-1 ^
  --query "Instances[0].PublicIpAddress" ^
  --output text > ec2-ip.txt 2>&1

echo.
type ec2-ip.txt
echo.
echo ============================================================
echo  NEXT STEPS (after instance is running ~2 min):
echo ============================================================
echo.
echo  1. Get your EC2 IP:       type ec2-ip.txt
echo  2. SCP your .env file:
echo     scp -i %%USERPROFILE%%\.ssh\lynkapp-key.pem .env.production ec2-user@YOUR_IP:/home/ec2-user/lynkapp-backend/.env
echo.
echo  3. SCP serviceAccountKey:
echo     scp -i %%USERPROFILE%%\.ssh\lynkapp-key.pem ..\ConnectHub-SPA\serviceAccountKey.json ec2-user@YOUR_IP:/home/ec2-user/lynkapp-backend/
echo.
echo  4. SSH in and run setup:
echo     ssh -i %%USERPROFILE%%\.ssh\lynkapp-key.pem ec2-user@YOUR_IP
echo     cd /home/ec2-user/lynkapp-backend
echo     bash ec2-setup.sh
echo.
echo  5. Run: WIRE-DNS-AFTER-EC2.bat (with your EC2 IP)
echo.
pause
