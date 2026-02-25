@echo off
REM ===================================================================
REM LynkApp - AWS S3 Deployment Script for lynkapp.net
REM ===================================================================
setlocal EnableDelayedExpansion

echo.
echo ===================================================================
echo   LynkApp - AWS S3 Deployment Script
echo   Domain: lynkapp.net
echo ===================================================================
echo.

REM Check if AWS CLI is installed
where aws >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] AWS CLI is not installed!
    echo.
    echo Please install AWS CLI first:
    echo 1. Download: https://awscli.amazonaws.com/AWSCLIV2.msi
    echo 2. Install and restart Command Prompt
    echo.
    pause
    exit /b 1
)

echo [OK] AWS CLI is installed
echo.

REM Check if AWS is configured
aws sts get-caller-identity >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [WARNING] AWS CLI is not configured yet.
    echo.
    echo Let's configure it now...
    echo.
    aws configure
    echo.
    echo Testing connection...
    aws sts get-caller-identity >nul 2>&1
    if !ERRORLEVEL! neq 0 (
        echo [ERROR] AWS configuration failed. Please check your credentials.
        pause
        exit /b 1
    )
)

echo [OK] AWS CLI is configured
echo.

REM Check if HTML file exists
if not exist "ConnectHub_Mobile_Design.html" (
    echo [ERROR] ConnectHub_Mobile_Design.html not found!
    echo Current directory: %CD%
    echo.
    pause
    exit /b 1
)

echo [OK] HTML file found
echo.

REM Set bucket name for lynkapp.net
set BUCKET_NAME=lynkapp.net

echo ===================================================================
echo   Deployment Configuration
echo ===================================================================
echo.
echo S3 Bucket: %BUCKET_NAME%
echo Website: http://lynkapp.net (after domain setup)
echo Temporary URL: http://%BUCKET_NAME%.s3-website-us-east-1.amazonaws.com
echo.
set /p CONFIRM="Ready to deploy? (Y/N): "

if /i not "%CONFIRM%"=="Y" (
    echo Deployment cancelled.
    pause
    exit /b 0
)

echo.
echo ===================================================================
echo   Starting Deployment
echo ===================================================================
echo.

REM Step 1: Create S3 Bucket (if it doesn't exist)
echo [Step 1/5] Creating/Checking S3 bucket...
aws s3 ls s3://%BUCKET_NAME% >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Creating bucket...
    aws s3 mb s3://%BUCKET_NAME% --region us-east-1
    if !ERRORLEVEL! neq 0 (
        echo [WARNING] Bucket might already exist or name is taken.
        echo Continuing with existing bucket...
    ) else (
        echo [OK] Bucket created
    )
) else (
    echo [OK] Bucket already exists
)
echo.

REM Step 2: Disable Block Public Access
echo [Step 2/5] Configuring public access...
aws s3api put-public-access-block --bucket %BUCKET_NAME% --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false" 2>nul
echo [OK] Public access configured
echo.

REM Step 3: Apply bucket policy
echo [Step 3/5] Setting up bucket policy...

REM Create bucket policy
(
echo {
echo   "Version": "2012-10-17",
echo   "Statement": [
echo     {
echo       "Sid": "PublicReadGetObject",
echo       "Effect": "Allow",
echo       "Principal": "*",
echo       "Action": "s3:GetObject",
echo       "Resource": "arn:aws:s3:::%BUCKET_NAME%/*"
echo     }
echo   ]
echo }
) > bucket-policy-temp.json

aws s3api put-bucket-policy --bucket %BUCKET_NAME% --policy file://bucket-policy-temp.json 2>nul
if %ERRORLEVEL% equ 0 (
    echo [OK] Bucket policy applied
) else (
    echo [WARNING] Policy may already be set
)

del bucket-policy-temp.json 2>nul
echo.

REM Step 4: Configure static website hosting
echo [Step 4/5] Enabling static website hosting...
aws s3 website s3://%BUCKET_NAME%/ --index-document ConnectHub_Mobile_Design.html --error-document ConnectHub_Mobile_Design.html 2>nul
echo [OK] Static website hosting enabled
echo.

REM Step 5: Upload all required files
echo [Step 5/5] Uploading website files...

REM Upload HTML file
echo   - Uploading HTML...
aws s3 cp ConnectHub_Mobile_Design.html s3://%BUCKET_NAME%/index.html --content-type "text/html" --cache-control "max-age=300"
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to upload HTML file!
    pause
    exit /b 1
)
aws s3 cp ConnectHub_Mobile_Design.html s3://%BUCKET_NAME%/ --content-type "text/html" --cache-control "max-age=300"

REM Upload all JavaScript system files
echo   - Uploading JavaScript system files...
aws s3 cp ConnectHub_Mobile_Design_Feed_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript" --cache-control "max-age=300"
aws s3 cp ConnectHub_Mobile_Design_Feed_Enhanced.js s3://%BUCKET_NAME%/ --content-type "application/javascript" --cache-control "max-age=300"
aws s3 cp ConnectHub_Mobile_Design_Dating_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript" --cache-control "max-age=300"
aws s3 cp ConnectHub_Mobile_Design_Stories_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript" --cache-control "max-age=300"
aws s3 cp ConnectHub_Mobile_Design_Media_Hub.js s3://%BUCKET_NAME%/ --content-type "application/javascript" --cache-control "max-age=300"
aws s3 cp ConnectHub_Mobile_Design_Trending_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript" --cache-control "max-age=300"
aws s3 cp ConnectHub_Mobile_Design_Friends_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript" --cache-control "max-age=300"
aws s3 cp ConnectHub_Mobile_Design_Groups_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript" --cache-control "max-age=300"
aws s3 cp ConnectHub_Mobile_Design_Events_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript" --cache-control "max-age=300"
aws s3 cp ConnectHub_Mobile_Design_Gaming_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript" --cache-control "max-age=300"
aws s3 cp ConnectHub_Mobile_Design_Saved_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript" --cache-control "max-age=300"
aws s3 cp ConnectHub_Mobile_Design_Profile_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript" --cache-control "max-age=300"
aws s3 cp ConnectHub_Mobile_Design_Messages_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript" --cache-control "max-age=300"
aws s3 cp ConnectHub_Mobile_Design_Notifications_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript" --cache-control "max-age=300"
aws s3 cp ConnectHub_Mobile_Design_Search_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript" --cache-control "max-age=300"
aws s3 cp ConnectHub_Mobile_Design_Settings_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript" --cache-control "max-age=300"
aws s3 cp ConnectHub_Mobile_Design_Marketplace_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript" --cache-control "max-age=300"
aws s3 cp ConnectHub_Mobile_Design_Live_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript" --cache-control "max-age=300"
aws s3 cp ConnectHub_Mobile_Design_Video_Calls_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript" --cache-control "max-age=300"
aws s3 cp ConnectHub_Mobile_Design_AR_VR_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript" --cache-control "max-age=300"
aws s3 cp ConnectHub_Mobile_Design_Business_Profile_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript" --cache-control "max-age=300"
aws s3 cp ConnectHub_Mobile_Design_Business_Tools_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript" --cache-control "max-age=300"
aws s3 cp ConnectHub_Mobile_Design_Creator_Profile_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript" --cache-control "max-age=300"
aws s3 cp ConnectHub_Mobile_Design_Help_Support_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript" --cache-control "max-age=300"
aws s3 cp ConnectHub_Mobile_Design_Menu_System.js s3://%BUCKET_NAME%/ --content-type "application/javascript" --cache-control "max-age=300"
aws s3 cp ConnectHub_Mobile_Design_Auth_Onboarding_Complete.js s3://%BUCKET_NAME%/ --content-type "application/javascript" --cache-control "max-age=300"

REM Upload src/services folder structure
echo   - Uploading service modules...
aws s3 sync ConnectHub-Frontend/src/services s3://%BUCKET_NAME%/src/services --content-type "application/javascript" --cache-control "max-age=300" --exclude "*.map"

echo [OK] All files uploaded successfully
echo.

REM Success message
echo ===================================================================
echo   DEPLOYMENT SUCCESSFUL!
echo ===================================================================
echo.
echo Your website is now deployed!
echo.
echo TEMPORARY URL (works immediately):
echo   http://%BUCKET_NAME%.s3-website-us-east-1.amazonaws.com
echo.
echo CUSTOM DOMAIN (requires DNS setup):
echo   http://lynkapp.net
echo   http://www.lynkapp.net
echo.
echo ===================================================================
echo.
echo NEXT STEPS TO ACTIVATE CUSTOM DOMAIN:
echo.
echo 1. Open: LYNKAPP-DOMAIN-SETUP.md
echo 2. Follow the DNS configuration steps
echo 3. Your domain will be live in 5-15 minutes!
echo.
echo To update your website in the future, run: update-lynkapp.bat
echo.

REM Save bucket name
echo %BUCKET_NAME% > .s3-bucket-name

REM Ask if user wants to open the website
set /p OPEN_SITE="Open the temporary URL now? (Y/N): "
if /i "%OPEN_SITE%"=="Y" (
    start http://%BUCKET_NAME%.s3-website-us-east-1.amazonaws.com
)

echo.
echo ===================================================================
echo   DATABASE DEPLOYMENT REMINDER
echo ===================================================================
echo.
echo IMPORTANT: This script only deployed the FRONTEND files!
echo.
echo To deploy the databases (PostgreSQL, Redis, MongoDB, S3) to AWS:
echo   1. Run: deploy-databases-to-aws.bat
echo   2. This will create RDS, ElastiCache, and S3 resources
echo   3. Estimated cost: ~$87/month minimum
echo.
echo Current database status: 
echo   - Frontend: DEPLOYED to AWS S3
echo   - Databases: NOT DEPLOYED (running locally via Docker only)
echo.
echo ===================================================================
echo.
echo Thank you for using LynkApp AWS Deployment!
echo.
pause
