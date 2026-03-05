@echo off
REM ===================================================================
REM Deploy LynkApp Website to S3 - Quick Deploy
REM ===================================================================

echo.
echo ===================================================================
echo   Deploying LynkApp Website to S3
echo ===================================================================
echo.

set BUCKET_NAME=lynkapp.net

echo [STEP 1] Uploading main website files...
echo.

REM Upload main HTML files
aws s3 cp ConnectHub_Mobile_Design.html s3://%BUCKET_NAME%/index.html --content-type "text/html"
aws s3 cp ConnectHub_Mobile_Design.html s3://%BUCKET_NAME%/ConnectHub_Mobile_Design.html --content-type "text/html"

echo.
echo [STEP 2] Uploading ALL JavaScript system files...

REM Upload all 26+ system JavaScript files
aws s3 cp ConnectHub_Mobile_Design_Feed_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript"
aws s3 cp ConnectHub_Mobile_Design_Feed_Enhanced.js s3://%BUCKET_NAME%/ --content-type "application/javascript"
aws s3 cp ConnectHub_Mobile_Design_Dating_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript"
aws s3 cp ConnectHub_Mobile_Design_Stories_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript"
aws s3 cp ConnectHub_Mobile_Design_Media_Hub.js s3://%BUCKET_NAME%/ --content-type "application/javascript"
aws s3 cp ConnectHub_Mobile_Design_Trending_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript"
aws s3 cp ConnectHub_Mobile_Design_Friends_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript"
aws s3 cp ConnectHub_Mobile_Design_Groups_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript"
aws s3 cp ConnectHub_Mobile_Design_Events_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript"
aws s3 cp ConnectHub_Mobile_Design_Gaming_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript"
aws s3 cp ConnectHub_Mobile_Design_Saved_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript"
aws s3 cp ConnectHub_Mobile_Design_Profile_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript"
aws s3 cp ConnectHub_Mobile_Design_Messages_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript"
aws s3 cp ConnectHub_Mobile_Design_Notifications_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript"
aws s3 cp ConnectHub_Mobile_Design_Search_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript"
aws s3 cp ConnectHub_Mobile_Design_Settings_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript"
aws s3 cp ConnectHub_Mobile_Design_Marketplace_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript"
aws s3 cp ConnectHub_Mobile_Design_Live_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript"
aws s3 cp ConnectHub_Mobile_Design_Video_Calls_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript"
aws s3 cp ConnectHub_Mobile_Design_AR_VR_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript"
aws s3 cp ConnectHub_Mobile_Design_Business_Profile_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript"
aws s3 cp ConnectHub_Mobile_Design_Business_Tools_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript"
aws s3 cp ConnectHub_Mobile_Design_Creator_Profile_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript"
aws s3 cp ConnectHub_Mobile_Design_Help_Support_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript"
aws s3 cp ConnectHub_Mobile_Design_Menu_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript"
aws s3 cp ConnectHub_Mobile_Design_Auth_Onboarding_Complete.js s3://%BUCKET_NAME%/ --content-type "application/javascript"

echo.
echo [STEP 3] Uploading additional pages...

aws s3 cp Lynkapp_Mobile_With_Login.html s3://%BUCKET_NAME%/ --content-type "text/html"
aws s3 cp signin-page.html s3://%BUCKET_NAME%/ --content-type "text/html"
aws s3 cp test-dating-complete.html s3://%BUCKET_NAME%/ --content-type "text/html"

echo.
echo [STEP 4] Uploading ConnectHub-Frontend folder...

cd ConnectHub-Frontend
aws s3 sync . s3://%BUCKET_NAME%/app/ --exclude "node_modules/*" --exclude ".git/*" --exclude "*.md"
cd ..

echo.
echo [STEP 4] Configuring S3 bucket for website hosting...

aws s3 website s3://%BUCKET_NAME%/ --index-document index.html --error-document index.html

echo.
echo [STEP 5] Making bucket publicly accessible...

REM Create bucket policy for public read
echo { > bucket-policy.json
echo   "Version": "2012-10-17", >> bucket-policy.json
echo   "Statement": [ >> bucket-policy.json
echo     { >> bucket-policy.json
echo       "Sid": "PublicReadGetObject", >> bucket-policy.json
echo       "Effect": "Allow", >> bucket-policy.json
echo       "Principal": "*", >> bucket-policy.json
echo       "Action": "s3:GetObject", >> bucket-policy.json
echo       "Resource": "arn:aws:s3:::%BUCKET_NAME%/*" >> bucket-policy.json
echo     } >> bucket-policy.json
echo   ] >> bucket-policy.json
echo } >> bucket-policy.json

aws s3api put-bucket-policy --bucket %BUCKET_NAME% --policy file://bucket-policy.json

echo.
echo ===================================================================
echo   DEPLOYMENT COMPLETE!
echo ===================================================================
echo.
echo Your website is now live at:
echo.
echo   http://%BUCKET_NAME%.s3-website-us-east-1.amazonaws.com
echo.
echo Alternative URL:
echo   http://lynkapp.net.s3-website-us-east-1.amazonaws.com
echo.
echo Testing the website...
timeout /t 2 >nul

curl -I http://%BUCKET_NAME%.s3-website-us-east-1.amazonaws.com 2>nul | findstr "200 OK"

if %ERRORLEVEL% equ 0 (
    echo.
    echo [SUCCESS] Website is accessible!
    echo.
    echo Opening in browser...
    start http://%BUCKET_NAME%.s3-website-us-east-1.amazonaws.com
) else (
    echo.
    echo [INFO] Website may take a few moments to become available
    echo Try opening: http://%BUCKET_NAME%.s3-website-us-east-1.amazonaws.com
)

echo.
echo Deployment details saved to frontend-deployment-info.txt
echo.

REM Save deployment info
echo # LynkApp Frontend Deployment > frontend-deployment-info.txt
echo # Generated: %date% %time% >> frontend-deployment-info.txt
echo. >> frontend-deployment-info.txt
echo WEBSITE_URL=http://%BUCKET_NAME%.s3-website-us-east-1.amazonaws.com >> frontend-deployment-info.txt
echo S3_BUCKET=%BUCKET_NAME% >> frontend-deployment-info.txt
echo REGION=us-east-1 >> frontend-deployment-info.txt
echo. >> frontend-deployment-info.txt
echo # View your website: >> frontend-deployment-info.txt
echo # http://%BUCKET_NAME%.s3-website-us-east-1.amazonaws.com >> frontend-deployment-info.txt

del bucket-policy.json 2>nul

echo.
pause
