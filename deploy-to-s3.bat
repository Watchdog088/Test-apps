@echo off
REM ===================================================================
REM ConnectHub Mobile Design - AWS S3 Deployment Script
REM ===================================================================
REM This script automatically deploys ConnectHub_Mobile_Design.html to AWS S3
REM ===================================================================

echo.
echo ===================================================================
echo   ConnectHub - AWS S3 Deployment Script
echo ===================================================================
echo.

REM Check if AWS CLI is installed
aws --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] AWS CLI is not installed!
    echo.
    echo Please install AWS CLI first:
    echo 1. Download from: https://awscli.amazonaws.com/AWSCLIV2.msi
    echo 2. Install the MSI file
    echo 3. Open a NEW command prompt and run this script again
    echo.
    pause
    exit /b 1
)

echo [OK] AWS CLI is installed
echo.

REM Check if AWS is configured
aws sts get-caller-identity >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] AWS CLI is not configured!
    echo.
    echo Please configure AWS CLI first:
    echo Run: aws configure
    echo Then enter your AWS Access Key ID and Secret Access Key
    echo.
    pause
    exit /b 1
)

echo [OK] AWS CLI is configured
echo.

REM Check if HTML file exists
if not exist "ConnectHub_Mobile_Design.html" (
    echo [ERROR] ConnectHub_Mobile_Design.html not found!
    echo.
    echo Please make sure you're running this script from the correct directory.
    echo Expected location: C:\Users\Jnewball\Test-apps\Test-apps
    echo.
    pause
    exit /b 1
)

echo [OK] HTML file found
echo.

REM Prompt for bucket name
echo ===================================================================
echo   Bucket Configuration
echo ===================================================================
echo.
echo S3 bucket names must be globally unique.
echo Suggested format: connecthub-yourname-2026
echo.
set /p BUCKET_NAME="Enter your desired S3 bucket name: "

if "%BUCKET_NAME%"=="" (
    echo [ERROR] Bucket name cannot be empty!
    pause
    exit /b 1
)

echo.
echo You entered: %BUCKET_NAME%
echo.
set /p CONFIRM="Is this correct? (Y/N): "

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

REM Step 1: Create S3 Bucket
echo [Step 1/5] Creating S3 bucket...
aws s3 mb s3://%BUCKET_NAME% --region us-east-1
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to create bucket. It might already exist or name is taken.
    echo Try a different bucket name or use an existing one.
    pause
    exit /b 1
)
echo [OK] Bucket created successfully
echo.

REM Step 2: Disable Block Public Access
echo [Step 2/5] Configuring public access settings...
aws s3api put-public-access-block --bucket %BUCKET_NAME% --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"
if %errorlevel% neq 0 (
    echo [WARNING] Failed to configure public access. Continuing...
)
echo [OK] Public access configured
echo.

REM Step 3: Create and apply bucket policy
echo [Step 3/5] Setting up bucket policy...

REM Create temporary bucket policy file
echo { > bucket-policy-temp.json
echo   "Version": "2012-10-17", >> bucket-policy-temp.json
echo   "Statement": [ >> bucket-policy-temp.json
echo     { >> bucket-policy-temp.json
echo       "Sid": "PublicReadGetObject", >> bucket-policy-temp.json
echo       "Effect": "Allow", >> bucket-policy-temp.json
echo       "Principal": "*", >> bucket-policy-temp.json
echo       "Action": "s3:GetObject", >> bucket-policy-temp.json
echo       "Resource": "arn:aws:s3:::%BUCKET_NAME%/*" >> bucket-policy-temp.json
echo     } >> bucket-policy-temp.json
echo   ] >> bucket-policy-temp.json
echo } >> bucket-policy-temp.json

aws s3api put-bucket-policy --bucket %BUCKET_NAME% --policy file://bucket-policy-temp.json
if %errorlevel% neq 0 (
    echo [ERROR] Failed to set bucket policy
    del bucket-policy-temp.json
    pause
    exit /b 1
)

del bucket-policy-temp.json
echo [OK] Bucket policy applied
echo.

REM Step 4: Configure static website hosting
echo [Step 4/5] Enabling static website hosting...
aws s3 website s3://%BUCKET_NAME%/ --index-document ConnectHub_Mobile_Design.html
if %errorlevel% neq 0 (
    echo [ERROR] Failed to enable static website hosting
    pause
    exit /b 1
)
echo [OK] Static website hosting enabled
echo.

REM Step 5: Upload HTML file
echo [Step 5/5] Uploading HTML file...
aws s3 cp ConnectHub_Mobile_Design.html s3://%BUCKET_NAME%/ --acl public-read --content-type "text/html"
if %errorlevel% neq 0 (
    echo [ERROR] Failed to upload HTML file
    pause
    exit /b 1
)
echo [OK] HTML file uploaded successfully
echo.

REM Success message
echo ===================================================================
echo   DEPLOYMENT SUCCESSFUL!
echo ===================================================================
echo.
echo Your website is now live at:
echo.
echo   http://%BUCKET_NAME%.s3-website-us-east-1.amazonaws.com
echo.
echo ===================================================================
echo.
echo To update your website in the future, simply run: update-s3.bat
echo.
echo Save your bucket name: %BUCKET_NAME%
echo.

REM Save bucket name for future updates
echo %BUCKET_NAME% > .s3-bucket-name

REM Ask if user wants to open the website
set /p OPEN_SITE="Would you like to open the website now? (Y/N): "
if /i "%OPEN_SITE%"=="Y" (
    start http://%BUCKET_NAME%.s3-website-us-east-1.amazonaws.com
)

echo.
echo Thank you for using ConnectHub AWS Deployment!
echo.
pause
