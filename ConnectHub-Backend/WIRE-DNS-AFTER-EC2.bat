@echo off
echo ============================================================
echo  WIRE Route 53 DNS — api.lynkapp.net → EC2
echo ============================================================
echo.
echo  Run this AFTER your EC2 server is running.
echo  Get your EC2 IP from: AWS Console → EC2 → Instances
echo.
echo ============================================================
set /p EC2_IP="Enter your EC2 Public IP address: "
echo.

if "%EC2_IP%"=="" (
    echo ERROR: No IP entered. Please try again.
    pause
    exit /b 1
)

:: Get Route 53 hosted zone ID for lynkapp.net
echo Looking up Route 53 hosted zone for lynkapp.net...
for /f "delims=" %%i in ('aws route53 list-hosted-zones-by-name --dns-name lynkapp.net --query "HostedZones[0].Id" --output text 2^>^&1') do set ZONE_RAW=%%i

:: Strip the /hostedzone/ prefix
set ZONE_ID=%ZONE_RAW:/hostedzone/=%

if "%ZONE_ID%"=="" (
    echo ERROR: Could not find hosted zone for lynkapp.net
    echo Make sure your AWS credentials are configured and lynkapp.net is in Route 53
    pause
    exit /b 1
)

echo Found Zone ID: %ZONE_ID%
echo.
echo Updating DNS: api.lynkapp.net → %EC2_IP%...

:: Write the change batch JSON
echo { > dns-change.json
echo   "Changes": [{ >> dns-change.json
echo     "Action": "UPSERT", >> dns-change.json
echo     "ResourceRecordSet": { >> dns-change.json
echo       "Name": "api.lynkapp.net", >> dns-change.json
echo       "Type": "A", >> dns-change.json
echo       "TTL": 300, >> dns-change.json
echo       "ResourceRecords": [{"Value": "%EC2_IP%"}] >> dns-change.json
echo     } >> dns-change.json
echo   }] >> dns-change.json
echo } >> dns-change.json

aws route53 change-resource-record-sets ^
  --hosted-zone-id %ZONE_ID% ^
  --change-batch file://dns-change.json

if %ERRORLEVEL%==0 (
    echo.
    echo ✅ SUCCESS! DNS updated.
    echo    api.lynkapp.net → %EC2_IP%
    echo.
    echo    DNS propagation takes 1-5 minutes.
    echo    Test with: curl http://%EC2_IP%:5000/health
    echo    Then test: curl https://api.lynkapp.net/health (after SSL setup)
    echo.
    del dns-change.json
) else (
    echo.
    echo ERROR: DNS update failed. Check AWS credentials and try again.
    del dns-change.json
)

echo.
echo  REMAINING STEPS:
echo  1. Open EC2 Security Group port 5000 inbound (0.0.0.0/0)
echo  2. Update RDS Security Group to allow EC2 (port 5432)
echo  3. Set up nginx + SSL cert for HTTPS on port 443
echo.
pause
