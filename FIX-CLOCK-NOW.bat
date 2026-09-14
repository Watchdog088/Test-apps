@echo off
echo ====================================================
echo  FIX WINDOWS CLOCK - Syncing to time.windows.com
echo ====================================================
echo.
echo This will open a UAC prompt - click YES to allow.
echo After it closes, AWS commands will work again.
echo.
powershell -Command "Start-Process cmd -ArgumentList '/c w32tm /resync /force && net stop w32tm && net start w32tm && w32tm /resync /force' -Verb RunAs -Wait"
echo.
echo Clock sync complete! Testing AWS...
timeout /t 3 /nobreak >nul
aws ec2 describe-vpcs --region us-east-1 --query "Vpcs[*].{VpcId:VpcId,CIDR:CidrBlock,Default:IsDefault}" --output table
echo.
echo Done! If VPCs listed above, AWS is working.
pause
