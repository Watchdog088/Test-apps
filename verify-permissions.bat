@echo off
REM ===================================================================
REM Verify AWS Permissions - Advanced Troubleshooting
REM ===================================================================
echo.
echo ===================================================================
echo   AWS Permissions Verification Tool
echo   Checking if PowerUserAccess is actually working...
echo ===================================================================
echo.

echo [STEP 1] Checking who you are logged in as...
echo.
aws sts get-caller-identity
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] AWS CLI not configured or credentials invalid!
    echo Run: aws configure
    pause
    exit /b 1
)

echo.
echo ================================================================
echo.

echo [STEP 2] Getting your username...
for /f "tokens=*" %%i in ('aws sts get-caller-identity --query "Arn" --output text') do set USER_ARN=%%i
echo Your ARN: %USER_ARN%

REM Extract username from ARN
for /f "tokens=6 delims=/" %%i in ("%USER_ARN%") do set USERNAME=%%i
if "%USERNAME%"=="" (
    for /f "tokens=2 delims=/" %%i in ("%USER_ARN%") do set USERNAME=%%i
)

echo Your Username: %USERNAME%

echo.
echo ================================================================
echo.

echo [STEP 3] Checking attached policies for user: %USERNAME%
echo.
aws iam list-attached-user-policies --user-name %USERNAME% 2>nul

if %ERRORLEVEL% neq 0 (
    echo.
    echo [WARNING] Cannot check IAM policies - might be using root account
    echo or don't have IAM read permissions
    echo.
    goto test_ec2
)

echo.
echo ================================================================
echo.

echo [STEP 4] Checking if PowerUserAccess is attached...
aws iam list-attached-user-policies --user-name %USERNAME% --query "AttachedPolicies[?PolicyName=='PowerUserAccess']" --output json 2>nul

echo.
echo ================================================================
echo.

:test_ec2
echo [STEP 5] Testing EC2 permissions (the actual test)...
echo.
echo Testing: aws ec2 describe-vpcs
echo.

aws ec2 describe-vpcs --max-results 1 >nul 2>&1

if %ERRORLEVEL% equ 0 (
    echo.
    echo ✅✅✅ SUCCESS! EC2 permissions are working! ✅✅✅
    echo.
    echo You can now run the deployment:
    echo   deploy-databases-to-aws-ULTIMATE-FIX.bat
    echo.
    pause
    exit /b 0
) else (
    echo.
    echo ❌❌❌ FAILED! Still cannot access EC2/VPC ❌❌❌
    echo.
    goto troubleshoot
)

:troubleshoot
echo ===================================================================
echo   TROUBLESHOOTING - Why PowerUserAccess Isn't Working
echo ===================================================================
echo.

echo Possible Causes:
echo.
echo 1. WRONG USER - You granted permissions to a different user
echo    ► Your current user: %USERNAME%
echo    ► Make sure you granted PowerUserAccess to THIS user
echo.

echo 2. NOT PROPAGATED YET - Permissions take 1-2 minutes to apply
echo    ► Wait 2-3 minutes and run this script again
echo.

echo 3. WRONG AWS PROFILE - You're using a different AWS profile
echo    ► Check: aws configure list
echo    ► You might be using a named profile
echo.

echo 4. CACHED CREDENTIALS - AWS CLI is using old cached credentials
echo    ► Solution: Clear cache
echo    ► Delete: C:\Users\%USERNAME%\.aws\cli\cache\*
echo.

echo 5. PERMISSION BOUNDARY - Your user has a permission boundary
echo    ► Check in IAM console if there's a Permission Boundary set
echo.

echo 6. SCP RESTRICTION - Organization policy restricting EC2
echo    ► If this is an organization account, SCPs might block EC2
echo.

echo.
echo ===================================================================
echo   QUICK FIXES TO TRY NOW
echo ===================================================================
echo.

echo FIX 1: Clear AWS CLI Cache
echo ========================
echo.
set CACHE_DIR=C:\Users\%USERNAME%\.aws\cli\cache
if exist "%CACHE_DIR%" (
    echo Found cache directory: %CACHE_DIR%
    echo Clearing cache...
    del /Q "%CACHE_DIR%\*" 2>nul
    echo ✓ Cache cleared!
) else (
    echo No cache directory found (this is normal)
)

echo.
echo FIX 2: Verify Your Credentials
echo ============================
echo.
echo Running: aws configure list
echo.
aws configure list

echo.
echo FIX 3: Check AWS Profile
echo ======================
echo.
echo Default profile location: C:\Users\%USERNAME%\.aws\credentials
echo.
if exist "C:\Users\%USERNAME%\.aws\credentials" (
    echo Profiles found in credentials file:
    findstr /B /C:"[" "C:\Users\%USERNAME%\.aws\credentials"
    echo.
    echo If you see multiple profiles, you might be using the wrong one!
    echo.
    echo To use a specific profile:
    echo   set AWS_PROFILE=your-profile-name
    echo   aws sts get-caller-identity
) else (
    echo No credentials file found - using environment variables or instance profile
)

echo.
echo ===================================================================
echo   LAST RESORT OPTIONS
echo ===================================================================
echo.

echo OPTION 1: Use Root Account (Temporary)
echo ====================================
echo 1. Go to: https://console.aws.amazon.com/
echo 2. Sign out if logged in
echo 3. Click "Sign in as Root user"
echo 4. Enter your root email and password
echo 5. Root account has all permissions by default
echo.

echo OPTION 2: Reconfigure AWS CLI
echo ===========================
echo Run: aws configure
echo Enter NEW credentials for a user with permissions
echo.

echo OPTION 3: Create New User with Permissions
echo ========================================
echo Using root account or an admin account:
echo.
echo aws iam create-user --user-name connecthub-admin
echo aws iam attach-user-policy --user-name connecthub-admin --policy-arn arn:aws:iam::aws:policy/PowerUserAccess
echo aws iam create-access-key --user-name connecthub-admin
echo.
echo Then use the new access key with: aws configure
echo.

echo ===================================================================
echo   VERIFICATION COMPLETE
echo ===================================================================
echo.
echo If you tried the fixes above, run this script again to verify:
echo   verify-permissions.bat
echo.
pause
