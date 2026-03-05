@echo off
REM ===================================================================
REM Setup Mailgun DNS Records for lynkapp.net
REM ===================================================================

echo.
echo ===================================================================
echo   Setting up Mailgun DNS Records
echo ===================================================================
echo.

set DOMAIN=lynkapp.net

echo [STEP 1] Checking if domain is hosted on Route 53...
echo.

REM Get hosted zone ID
for /f "tokens=*" %%i in ('aws route53 list-hosted-zones --query "HostedZones[?Name=='%DOMAIN%.'].Id" --output text') do set ZONE_ID_FULL=%%i

REM Extract just the ID part (remove /hostedzone/ prefix)
for /f "tokens=3 delims=/" %%a in ("%ZONE_ID_FULL%") do set ZONE_ID=%%a

if "%ZONE_ID%"=="" (
    echo [ERROR] Domain %DOMAIN% not found in Route 53
    echo.
    echo Please add the DNS records manually at your DNS provider.
    echo See MAILGUN-DNS-SETUP-GUIDE.md for instructions.
    echo.
    pause
    exit /b 1
)

echo [SUCCESS] Found hosted zone: %ZONE_ID%
echo.

echo [STEP 2] Creating DNS change batch file...
echo.

REM Create JSON file for DNS changes
(
echo {
echo   "Changes": [
echo     {
echo       "Action": "UPSERT",
echo       "ResourceRecordSet": {
echo         "Name": "%DOMAIN%",
echo         "Type": "MX",
echo         "TTL": 300,
echo         "ResourceRecords": [
echo           {
echo             "Value": "10 mxa.mailgun.org"
echo           },
echo           {
echo             "Value": "10 mxb.mailgun.org"
echo           }
echo         ]
echo       }
echo     },
echo     {
echo       "Action": "UPSERT",
echo       "ResourceRecordSet": {
echo         "Name": "%DOMAIN%",
echo         "Type": "TXT",
echo         "TTL": 300,
echo         "ResourceRecords": [
echo           {
echo             "Value": "\"v=spf1 include:mailgun.org ~all\""
echo           }
echo         ]
echo       }
echo     },
echo     {
echo       "Action": "UPSERT",
echo       "ResourceRecordSet": {
echo         "Name": "mailo._domainkey.%DOMAIN%",
echo         "Type": "TXT",
echo         "TTL": 300,
echo         "ResourceRecords": [
echo           {
echo             "Value": "\"k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDA+oy3W5NEfjOyJMV+N1gf0ARhAsdDe5Zs1SF4vvNvDb8AMyt5LO5WV8JYx8B2+oHcjeqAwi+cMnBlMtTiZvxvRFYyqVgEBENunlvGj4SxCzGslGEf2K68y8A6U12c+viPowVzJqZrnrsaIcbFO5bKn+hFbhnOos9/5gEY2nN9UQIDAQAB\""
echo           }
echo         ]
echo       }
echo     }
echo   ]
echo }
) > mailgun-dns-changes.json

echo [SUCCESS] Created change batch file
echo.

echo [STEP 3] Applying DNS changes to Route 53...
echo.

aws route53 change-resource-record-sets --hosted-zone-id %ZONE_ID% --change-batch file://mailgun-dns-changes.json

if %ERRORLEVEL% equ 0 (
    echo.
    echo [SUCCESS] DNS records added successfully!
    echo.
) else (
    echo.
    echo [ERROR] Failed to add DNS records
    echo Check AWS CLI configuration and permissions
    echo.
    pause
    exit /b 1
)

echo [STEP 4] Verifying DNS records...
echo.

timeout /t 5 >nul

echo Fetching current DNS records...
aws route53 list-resource-record-sets --hosted-zone-id %ZONE_ID% --query "ResourceRecordSets[?Type=='MX' || (Type=='TXT' && (Name=='%DOMAIN%.' || Name=='mailo._domainkey.%DOMAIN%.'))]"

echo.
echo ===================================================================
echo   DNS RECORDS ADDED SUCCESSFULLY!
echo ===================================================================
echo.
echo Your Mailgun DNS records have been configured.
echo.
echo Next steps:
echo 1. Wait 15-30 minutes for DNS propagation
echo 2. Verify with: nslookup -type=MX %DOMAIN%
echo 3. Test at: https://mxtoolbox.com
echo.
echo Records added:
echo  - MX:  mxa.mailgun.org (Priority 10)
echo  - MX:  mxb.mailgun.org (Priority 10)
echo  - TXT: v=spf1 include:mailgun.org ~all
echo  - TXT: DKIM key for mailo._domainkey
echo.

REM Cleanup
del mailgun-dns-changes.json 2>nul

echo Saved DNS configuration to mailgun-dns-records.txt
echo.

REM Save DNS info
(
echo # Mailgun DNS Records Added
echo # Generated: %date% %time%
echo.
echo Domain: %DOMAIN%
echo Hosted Zone ID: %ZONE_ID%
echo.
echo MX Records:
echo   10 mxa.mailgun.org
echo   10 mxb.mailgun.org
echo.
echo TXT Records:
echo   @ - v=spf1 include:mailgun.org ~all
echo   mailo._domainkey - DKIM signature
echo.
echo Verification:
echo   nslookup -type=MX %DOMAIN%
echo   https://mxtoolbox.com/SuperTool.aspx?action=mx:%%3A%DOMAIN%
echo.
) > mailgun-dns-records.txt

echo ===================================================================
pause
