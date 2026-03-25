@echo off
echo =====================================================
echo  Creating CloudFront Distribution for lynkapp.net
echo =====================================================

set CERT_ARN=arn:aws:acm:us-east-1:771844493459:certificate/31d3a8db-a795-4057-ad87-81f050ceeadf
set HOSTED_ZONE=Z03406532KDB2H6PKFFAO

echo Checking certificate status...
aws acm describe-certificate --certificate-arn %CERT_ARN% --region us-east-1 --query "Certificate.Status" --output text

echo.
echo Creating CloudFront distribution...

aws cloudfront create-distribution --distribution-config "{\"CallerReference\":\"lynkapp-s3-2026\",\"Aliases\":{\"Quantity\":2,\"Items\":[\"lynkapp.net\",\"www.lynkapp.net\"]},\"DefaultRootObject\":\"index.html\",\"Origins\":{\"Quantity\":1,\"Items\":[{\"Id\":\"S3-lynkapp\",\"DomainName\":\"lynkapp.net.s3-website-us-east-1.amazonaws.com\",\"CustomOriginConfig\":{\"HTTPPort\":80,\"HTTPSPort\":443,\"OriginProtocolPolicy\":\"http-only\"}}]},\"DefaultCacheBehavior\":{\"TargetOriginId\":\"S3-lynkapp\",\"ViewerProtocolPolicy\":\"redirect-to-https\",\"CachePolicyId\":\"658327ea-f89d-4fab-a63d-7e88639e58f6\",\"Compress\":true,\"AllowedMethods\":{\"Quantity\":2,\"Items\":[\"GET\",\"HEAD\"],\"CachedMethods\":{\"Quantity\":2,\"Items\":[\"GET\",\"HEAD\"]}}},\"CustomErrorResponses\":{\"Quantity\":1,\"Items\":[{\"ErrorCode\":404,\"ResponsePagePath\":\"/index.html\",\"ResponseCode\":\"200\",\"ErrorCachingMinTTL\":0}]},\"Comment\":\"Lynkapp.net CloudFront Distribution\",\"Enabled\":true,\"HttpVersion\":\"http2\",\"ViewerCertificate\":{\"ACMCertificateArn\":\"%CERT_ARN%\",\"SSLSupportMethod\":\"sni-only\",\"MinimumProtocolVersion\":\"TLSv1.2_2021\"}}" --output json > cf-output.json 2>&1

if %ERRORLEVEL% == 0 (
    echo CloudFront distribution created successfully!
    for /f "tokens=*" %%i in ('aws cloudfront list-distributions --query "DistributionList.Items[0].DomainName" --output text') do set CF_DOMAIN=%%i
    echo CloudFront domain: %CF_DOMAIN%
    
    echo.
    echo Updating Route 53 A record to point lynkapp.net to CloudFront...
    echo (Manual step: update the A record in Route 53 to point to %CF_DOMAIN%)
) else (
    echo ERROR creating distribution - cert may not be ISSUED yet.
    type cf-output.json
)

echo.
echo Done!
pause
