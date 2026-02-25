@echo off
REM ===================================================================
REM AWS Setup Diagnostic Tool
REM Checks your AWS configuration and permissions
REM ===================================================================
echo.
echo ===================================================================
echo   AWS Setup Diagnostic Tool
echo   Checking your AWS configuration...
echo ===================================================================
echo.

REM Check 1: AWS CLI Installation
echo [CHECK 1] AWS CLI Installation
where aws >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [FAIL] AWS CLI is NOT installed
    echo Fix: Download and install from https://awscli.amazonaws.com/AWSCLIV2.msi
    goto end_checks
) else (
    echo [PASS] AWS CLI is installed
    aws --version
)
echo.

REM Check 2: AWS Configuration
echo [CHECK 2] AWS Credentials Configuration
aws sts get-caller-identity >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [FAIL] AWS CLI is NOT configured with valid credentials
    echo.
    echo Fix: Run 'aws configure' and enter:
    echo   - AWS Access Key ID
    echo   - AWS Secret Access Key
    echo   - Region: us-east-1
    echo   - Output format: json
    goto end_checks
) else (
    echo [PASS] AWS credentials are configured
    echo.
    echo Your AWS Identity:
    aws sts get-caller-identity
)
echo.

REM Check 3: EC2 Permissions (VPC)
echo [CHECK 3] EC2 Permissions (VPC Access)
aws ec2 describe-vpcs --max-results 1 >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [FAIL] Cannot query VPCs - Insufficient EC2 permissions
    echo.
    echo This is the main issue! You need EC2 permissions.
    echo.
    echo FIX: Grant IAM Permissions
    echo ==========================
    echo 1. Go to: https://console.aws.amazon.com/iam/
    echo 2. Click: Users -^> Your username
    echo 3. Click: Add permissions -^> Attach policies directly
    echo 4. Search: PowerUserAccess
    echo 5. Check the box next to PowerUserAccess
    echo 6. Click: Add permissions
    echo.
    echo See HOW-TO-GRANT-AWS-IAM-PERMISSIONS.md for detailed instructions
    goto end_checks
) else (
    echo [PASS] EC2/VPC permissions are working
    echo Current VPC count:
    aws ec2 describe-vpcs --query "length(Vpcs)" --output text
)
echo.

REM Check 4: RDS Permissions
echo [CHECK 4] RDS Permissions
aws rds describe-db-instances --max-records 1 >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [FAIL] Cannot query RDS - Insufficient RDS permissions
    echo Fix: Attach AmazonRDSFullAccess policy or PowerUserAccess
) else (
    echo [PASS] RDS permissions are working
)
echo.

REM Check 5: S3 Permissions
echo [CHECK 5] S3 Permissions
aws s3 ls >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [FAIL] Cannot list S3 buckets - Insufficient S3 permissions
    echo Fix: Attach AmazonS3FullAccess policy or PowerUserAccess
) else (
    echo [PASS] S3 permissions are working
)
echo.

REM Check 6: Region Setting
echo [CHECK 6] AWS Region
for /f %%i in ('aws configure get region') do set AWS_REGION=%%i
if "%AWS_REGION%"=="" (
    echo [WARN] No default region set
    echo Recommendation: Set region to us-east-1
    echo Run: aws configure set region us-east-1
) else (
    echo [PASS] Region is set to: %AWS_REGION%
    if not "%AWS_REGION%"=="us-east-1" (
        echo [WARN] Scripts are configured for us-east-1
        echo Your region is: %AWS_REGION%
        echo Consider switching to us-east-1 for deployment
    )
)
echo.

:end_checks
echo ===================================================================
echo   Diagnostic Summary
echo ===================================================================
echo.
echo If all checks passed, you can run the deployment:
echo   deploy-databases-to-aws-ULTIMATE-FIX.bat
echo.
echo If any checks failed, follow the fix instructions above.
echo.
echo For detailed help, see:
echo   - HOW-TO-GRANT-AWS-IAM-PERMISSIONS.md
echo   - VPC-ERROR-FIX-DOCUMENTATION.md
echo.
pause
