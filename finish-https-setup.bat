@echo off
setlocal enabledelayedexpansion
echo =====================================================
echo   LynkApp HTTPS Complete Setup Script
echo   Handles: CloudFront + Route 53 Update
echo =====================================================
echo.

set CERT_ARN=arn:aws:acm:us-east-1:771844493459:certificate/31d3a8db-a795-4057-ad87-81f050ceeadf
set HOSTED_ZONE=Z03406532KDB2H6PKFFAO
set BUCKET=lynkapp.net

echo [1/4] Checking certificate status...
for /f "tokens=*" %%i in ('aws acm describe-certificate --certificate-arn %CERT_ARN% --region us-east-1 --query "Certificate.Status" --output text 2^>^&1') do set CERT_STATUS=%%i
echo     Status: %CERT_STATUS%

if NOT "%CERT_STATUS%"=="ISSUED" (
    echo.
    echo [!] Certificate is not ISSUED yet. Current status: %CERT_STATUS%
    echo     Please wait a few more minutes and re-run this script.
    echo     DNS is correctly configured - AWS just needs time to poll.
    echo.
    pause
    exit /b 1
)

echo     Certificate ISSUED! Proceeding...
echo.

echo [2/4] Creating CloudFront distribution...
aws cloudfront create-distribution --distribution-config "{\"CallerReference\":\"lynkapp-cf-2026-final\",\"Aliases\":{\"Quantity\":2,\"Items\":[\"lynkapp.net\",\"www.lynkapp.net\"]},\"DefaultRootObject\":\"index.html\",\"Origins\":{\"Quantity\":1,\"Items\":[{\"Id\":\"S3-lynkapp-website\",\"DomainName\":\"lynkapp.net.s3-website-us-east-1.amazonaws.com\",\"CustomOriginConfig\":{\"HTTPPort\":80,\"HTTPSPort\":443,\"OriginProtocolPolicy\":\"http-only\"}}]},\"DefaultCacheBehavior\":{\"TargetOriginId\":\"S3-lynkapp-website\",\"ViewerProtocolPolicy\":\"redirect-to-https\",\"CachePolicyId\":\"658327ea-f89d-4fab-a63d-7e88639e58f6\",\"Compress\":true,\"AllowedMethods\":{\"Quantity\":2,\"Items\":[\"GET\",\"HEAD\"],\"CachedMethods\":{\"Quantity\":2,\"Items\":[\"GET\",\"HEAD\"]}}},\"CustomErrorResponses\":{\"Quantity\":2,\"Items\":[{\"ErrorCode\":404,\"ResponsePagePath\":\"/index.html\",\"ResponseCode\":\"200\",\"ErrorCachingMinTTL\":0},{\"ErrorCode\":403,\"ResponsePagePath\":\"/index.html\",\"ResponseCode\":\"200\",\"ErrorCachingMinTTL\":0}]},\"Comment\":\"LynkApp Production HTTPS\",\"Enabled\":true,\"HttpVersion\":\"http2and3\",\"ViewerCertificate\":{\"ACMCertificateArn\":\"%CERT_ARN%\",\"SSLSupportMethod\":\"sni-only\",\"MinimumProtocolVersion\":\"TLSv1.2_2021\"}}" --output json > cf-result.json 2>&1

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] CloudFront creation failed:
    type cf-result.json
    pause
    exit /b 1
)

echo     Distribution created! Getting domain name...

for /f "tokens=*" %%i in ('aws cloudfront list-distributions --query "DistributionList.Items[0].DomainName" --output text 2^>^&1') do set CF_DOMAIN=%%i
for /f "tokens=*" %%i in ('aws cloudfront list-distributions --query "DistributionList.Items[0].Id" --output text 2^>^&1') do set CF_ID=%%i

echo     CloudFront Domain: %CF_DOMAIN%
echo     CloudFront ID:     %CF_ID%
echo.

echo [3/4] Updating Route 53 to point lynkapp.net to CloudFront...
aws route53 change-resource-record-sets --hosted-zone-id %HOSTED_ZONE% --change-batch "{\"Changes\":[{\"Action\":\"UPSERT\",\"ResourceRecordSet\":{\"Name\":\"lynkapp.net\",\"Type\":\"A\",\"AliasTarget\":{\"HostedZoneId\":\"Z2FDTNDATAQYW2\",\"DNSName\":\"%CF_DOMAIN%\",\"EvaluateTargetHealth\":false}}},{\"Action\":\"UPSERT\",\"ResourceRecordSet\":{\"Name\":\"www.lynkapp.net\",\"Type\":\"A\",\"AliasTarget\":{\"HostedZoneId\":\"Z2FDTNDATAQYW2\",\"DNSName\":\"%CF_DOMAIN%\",\"EvaluateTargetHealth\":false}}}]}" 2>&1

if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Route 53 update may have had an issue. Check manually.
) else (
    echo     Route 53 A records updated successfully!
)

echo.
echo [4/4] Setup Complete!
echo.
echo =====================================================
echo   HTTPS SETUP SUMMARY
echo =====================================================
echo   CloudFront ID:     %CF_ID%
echo   CloudFront Domain: %CF_DOMAIN%
echo   Your site URL:     https://lynkapp.net
echo.
echo   NOTE: CloudFront takes 10-15 min to fully deploy.
echo   You can track progress at:
echo   https://console.aws.amazon.com/cloudfront/
echo.
echo   NEXT STEPS:
echo   1. Wait 10-15 min for CloudFront to deploy (Status: Enabled)
echo   2. Open https://lynkapp.net in browser
echo   3. Firebase Auth should now work (HTTPS required)
echo   4. Run TestSeed.runAll() in browser console to seed data
echo   5. Begin user testing - 7 core journeys
echo =====================================================
echo.
echo Saving deployment info...
echo CloudFront ID: %CF_ID% > cloudfront-info.txt
echo CloudFront Domain: %CF_DOMAIN% >> cloudfront-info.txt
echo Live URL: https://lynkapp.net >> cloudfront-info.txt
echo Setup completed: %DATE% %TIME% >> cloudfront-info.txt

pause
