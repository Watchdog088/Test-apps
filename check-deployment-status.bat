@echo off
REM ===================================================================
REM Check if Deployment Was Successful
REM ===================================================================
echo.
echo ===================================================================
echo   Checking Your AWS Deployment Status
echo ===================================================================
echo.

echo [CHECK 1] Looking for deployment info files...
echo.

if exist .aws-vpc-id (
    set /p VPC_ID=<.aws-vpc-id
    echo ✓ VPC Created: %VPC_ID%
) else (
    echo ✗ VPC not found
)

if exist .aws-db-endpoint (
    set /p DB_ENDPOINT=<.aws-db-endpoint
    echo ✓ Database Endpoint: %DB_ENDPOINT%
) else (
    echo ✗ Database endpoint not found
)

if exist .aws-redis-endpoint (
    set /p REDIS_ENDPOINT=<.aws-redis-endpoint
    echo ✓ Redis Endpoint: %REDIS_ENDPOINT%
) else (
    echo ✗ Redis endpoint not found
)

if exist .aws-uploads-bucket (
    set /p S3_BUCKET=<.aws-uploads-bucket
    echo ✓ S3 Bucket: %S3_BUCKET%
) else (
    echo ✗ S3 bucket not found
)

echo.
echo ===================================================================
echo   Checking AWS Resources
echo ===================================================================
echo.

echo [CHECK 2] Checking VPC...
aws ec2 describe-vpcs --filters "Name=tag:Name,Values=connecthub-vpc-prod" --query "Vpcs[0].VpcId" --output text 2>nul
if %ERRORLEVEL% equ 0 (
    echo ✓ VPC exists in AWS
) else (
    echo ✗ VPC not found in AWS
)

echo.
echo [CHECK 3] Checking RDS Database...
aws rds describe-db-instances --db-instance-identifier connecthub-db-prod --query "DBInstances[0].DBInstanceStatus" --output text 2>nul
if %ERRORLEVEL% equ 0 (
    echo ✓ Database exists
    for /f %%i in ('aws rds describe-db-instances --db-instance-identifier connecthub-db-prod --query "DBInstances[0].DBInstanceStatus" --output text 2^>nul') do echo   Status: %%i
) else (
    echo ✗ Database not found
)

echo.
echo [CHECK 4] Checking Redis Cache...
aws elasticache describe-cache-clusters --cache-cluster-id connecthub-redis-prod --query "CacheClusters[0].CacheClusterStatus" --output text 2>nul
if %ERRORLEVEL% equ 0 (
    echo ✓ Redis exists
    for /f %%i in ('aws elasticache describe-cache-clusters --cache-cluster-id connecthub-redis-prod --query "CacheClusters[0].CacheClusterStatus" --output text 2^>nul') do echo   Status: %%i
) else (
    echo ✗ Redis not found
)

echo.
echo [CHECK 5] Checking S3 Bucket...
for /f %%i in ('aws s3 ls ^| findstr /C:"connecthub-uploads" ^| find /C "connecthub"') do set BUCKET_EXISTS=%%i
if defined BUCKET_EXISTS (
    echo ✓ S3 Bucket exists
) else (
    echo ✗ S3 Bucket not found
)

echo.
echo ===================================================================
echo   DEPLOYMENT STATUS SUMMARY
echo ===================================================================
echo.

if exist .aws-vpc-id if exist .aws-db-endpoint if exist .aws-redis-endpoint if exist .aws-uploads-bucket (
    echo ✅✅✅ DEPLOYMENT SUCCESSFUL! ✅✅✅
    echo.
    echo Your database infrastructure is deployed!
    echo.
    echo Connection Details:
    echo ===================
    echo.
    echo PostgreSQL: %DB_ENDPOINT%:5432
    echo   Database: connecthub
    echo   Username: connecthubadmin
    echo   Password: ConnectHub2024SecurePass!
    echo.
    echo Redis: %REDIS_ENDPOINT%:6379
    echo.
    echo S3 Bucket: %S3_BUCKET%
    echo.
    echo VPC ID: %VPC_ID%
    echo.
    echo ===================================================================
    echo   NEXT STEPS
    echo ===================================================================
    echo.
    echo 1. Connect to your database:
    echo    psql "postgresql://connecthubadmin:ConnectHub2024SecurePass!@%DB_ENDPOINT%:5432/connecthub"
    echo.
    echo 2. Update your backend .env file with these endpoints
    echo.
    echo 3. Deploy your backend application
    echo.
    echo 4. Test your application!
    echo.
) else (
    echo ⚠️ PARTIAL DEPLOYMENT or NOT COMPLETED
    echo.
    echo Some resources may not have been created.
    echo.
    echo What to do:
    echo ===========
    echo 1. Run the deployment again:
    echo    deploy-databases-to-aws-ULTIMATE-FIX.bat
    echo.
    echo 2. Check the output for any errors
    echo.
    echo 3. If you see errors, run:
    echo    diagnose-aws-setup.bat
    echo.
)

echo ===================================================================
echo.
pause
