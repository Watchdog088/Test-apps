@echo off
REM ===================================================================
REM ConnectHub - AWS Database Deployment (FINAL FIX - Empty VPC ID Bug Fixed)
REM ===================================================================
setlocal EnableDelayedExpansion

echo.
echo ===================================================================
echo   ConnectHub - AWS Database Deployment
echo   Deploying: PostgreSQL RDS + Redis + S3 Storage
echo ===================================================================
echo.

REM Check AWS CLI
where aws >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] AWS CLI not installed!
    pause
    exit /b 1
)

REM Check AWS credentials
aws sts get-caller-identity >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] AWS CLI not configured! Run: aws configure
    pause
    exit /b 1
)

echo [OK] AWS CLI ready
echo.

REM Confirm deployment
set /p CONFIRM="Deploy AWS resources (~$32/month or FREE tier)? Type YES: "
if /i not "%CONFIRM%"=="YES" (
    echo Cancelled
    pause
    exit /b 0
)

echo.
echo ===================================================================
echo   Step 1: VPC Setup (FIXED - Proper VPC ID handling)
echo ===================================================================
echo.

set VPC_ID=

REM Delete old empty VPC ID file
if exist .aws-vpc-id (
    echo [INFO] Checking existing VPC ID file...
    set /p SAVED_VPC_ID=<.aws-vpc-id
    
    REM Check if file is empty or VPC doesn't exist
    if "!SAVED_VPC_ID!"=="" (
        echo [WARNING] VPC ID file was empty - deleting
        del .aws-vpc-id
    ) else (
        REM Verify VPC exists in AWS
        aws ec2 describe-vpcs --vpc-ids !SAVED_VPC_ID! >nul 2>&1
        if !ERRORLEVEL! equ 0 (
            echo [OK] Found existing VPC: !SAVED_VPC_ID!
            set VPC_ID=!SAVED_VPC_ID!
        ) else (
            echo [WARNING] Saved VPC doesn't exist in AWS - will create new
            del .aws-vpc-id
        )
    )
)

REM Create new VPC if needed
if "%VPC_ID%"=="" (
    echo [INFO] Creating new VPC...
    
    REM Check VPC count first
    for /f %%i in ('aws ec2 describe-vpcs --query "length(Vpcs)" --output text 2^>nul') do set VPC_COUNT=%%i
    if !VPC_COUNT! GEQ 5 (
        echo [ERROR] VPC limit reached ^(!VPC_COUNT!/5^)
        echo Delete a VPC at: https://console.aws.amazon.com/vpc/
        pause
        exit /b 1
    )
    
    REM Create VPC and save output
    aws ec2 create-vpc --cidr-block 10.0.0.0/16 --tag-specifications "ResourceType=vpc,Tags=[{Key=Name,Value=connecthub-vpc}]" --output json > vpc-creation.json 2>&1
    
    if !ERRORLEVEL! neq 0 (
        echo [ERROR] VPC creation failed!
        type vpc-creation.json
        del vpc-creation.json 2>nul
        pause
        exit /b 1
    )
    
    REM Extract VPC ID - More robust method
    for /f "tokens=*" %%a in ('type vpc-creation.json ^| findstr /C:"VpcId"') do (
        set LINE=%%a
        REM Remove everything before the colon and spaces
        set LINE=!LINE:*:=!
        REM Remove quotes, commas, and spaces
        set LINE=!LINE:"=!
        set LINE=!LINE:,=!
        set LINE=!LINE: =!
        set VPC_ID=!LINE!
    )
    
    del vpc-creation.json 2>nul
    
    if "!VPC_ID!"=="" (
        echo [ERROR] Could not extract VPC ID
        pause
        exit /b 1
    )
    
    echo [OK] VPC Created: !VPC_ID!
    
    REM Save VPC ID
    echo !VPC_ID!> .aws-vpc-id
    
    REM Enable DNS
    aws ec2 modify-vpc-attribute --vpc-id !VPC_ID! --enable-dns-hostnames >nul 2>&1
    aws ec2 modify-vpc-attribute --vpc-id !VPC_ID! --enable-dns-support >nul 2>&1
    
    timeout /t 3 /nobreak >nul
)

echo [INFO] Using VPC: %VPC_ID%
echo.

REM Verify VPC one more time
aws ec2 describe-vpcs --vpc-ids %VPC_ID% >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] VPC verification failed!
    pause
    exit /b 1
)

echo ===================================================================
echo   Step 2: Network Infrastructure
echo ===================================================================
echo.

REM Create Internet Gateway
echo [INFO] Creating Internet Gateway...
for /f "tokens=*" %%i in ('aws ec2 create-internet-gateway --tag-specifications "ResourceType=internet-gateway,Tags=[{Key=Name,Value=connecthub-igw}]" --query "InternetGateway.InternetGatewayId" --output text 2^>nul') do set IGW_ID=%%i

if "%IGW_ID%"=="" (
    echo [INFO] IGW may already exist
) else (
    aws ec2 attach-internet-gateway --vpc-id %VPC_ID% --internet-gateway-id %IGW_ID% >nul 2>&1
    echo [OK] IGW attached: %IGW_ID%
)

REM Create Subnets
echo [INFO] Creating subnets...
for /f "tokens=*" %%i in ('aws ec2 create-subnet --vpc-id %VPC_ID% --cidr-block 10.0.1.0/24 --availability-zone us-east-1a --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=public-1a}]" --query "Subnet.SubnetId" --output text 2^>nul') do set SUBNET_PUB_1A=%%i
for /f "tokens=*" %%i in ('aws ec2 create-subnet --vpc-id %VPC_ID% --cidr-block 10.0.2.0/24 --availability-zone us-east-1b --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=public-1b}]" --query "Subnet.SubnetId" --output text 2^>nul') do set SUBNET_PUB_1B=%%i
for /f "tokens=*" %%i in ('aws ec2 create-subnet --vpc-id %VPC_ID% --cidr-block 10.0.11.0/24 --availability-zone us-east-1a --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=private-db-1a}]" --query "Subnet.SubnetId" --output text 2^>nul') do set SUBNET_PRIV_1A=%%i
for /f "tokens=*" %%i in ('aws ec2 create-subnet --vpc-id %VPC_ID% --cidr-block 10.0.12.0/24 --availability-zone us-east-1b --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=private-db-1b}]" --query "Subnet.SubnetId" --output text 2^>nul') do set SUBNET_PRIV_1B=%%i

if "%SUBNET_PRIV_1A%"=="" (
    echo [ERROR] Failed to create subnets
    echo Possible causes:
    echo - CIDR blocks already in use
    echo - Subnet limit reached
    echo Check AWS Console: https://console.aws.amazon.com/vpc/
    pause
    exit /b 1
)

echo [OK] Subnets created:
echo     Public: %SUBNET_PUB_1A%, %SUBNET_PUB_1B%
echo     Private: %SUBNET_PRIV_1A%, %SUBNET_PRIV_1B%
echo.

echo ===================================================================
echo   Step 3: Security Groups
echo ===================================================================
echo.

REM Create RDS Security Group
for /f "tokens=*" %%i in ('aws ec2 create-security-group --group-name connecthub-rds-sg --description "RDS PostgreSQL" --vpc-id %VPC_ID% --query "GroupId" --output text 2^>nul') do set SG_RDS=%%i
if "%SG_RDS%"=="" (
    for /f "tokens=*" %%i in ('aws ec2 describe-security-groups --filters "Name=group-name,Values=connecthub-rds-sg" "Name=vpc-id,Values=%VPC_ID%" --query "SecurityGroups[0].GroupId" --output text 2^>nul') do set SG_RDS=%%i
)
aws ec2 authorize-security-group-ingress --group-id %SG_RDS% --protocol tcp --port 5432 --cidr 10.0.0.0/16 >nul 2>&1
echo [OK] RDS Security Group: %SG_RDS%

REM Create Redis Security Group
for /f "tokens=*" %%i in ('aws ec2 create-security-group --group-name connecthub-redis-sg --description "Redis Cache" --vpc-id %VPC_ID% --query "GroupId" --output text 2^>nul') do set SG_REDIS=%%i
if "%SG_REDIS%"=="" (
    for /f "tokens=*" %%i in ('aws ec2 describe-security-groups --filters "Name=group-name,Values=connecthub-redis-sg" "Name=vpc-id,Values=%VPC_ID%" --query "SecurityGroups[0].GroupId" --output text 2^>nul') do set SG_REDIS=%%i
)
aws ec2 authorize-security-group-ingress --group-id %SG_REDIS% --protocol tcp --port 6379 --cidr 10.0.0.0/16 >nul 2>&1
echo [OK] Redis Security Group: %SG_REDIS%
echo.

echo ===================================================================
echo   Step 4: PostgreSQL Database (5-10 min wait)
echo ===================================================================
echo.

REM Create DB Subnet Group
aws rds create-db-subnet-group --db-subnet-group-name connecthub-db-subnet --db-subnet-group-description "ConnectHub DB subnets" --subnet-ids %SUBNET_PRIV_1A% %SUBNET_PRIV_1B% >nul 2>&1

REM Create RDS instance
echo [INFO] Creating PostgreSQL database...
aws rds create-db-instance --db-instance-identifier connecthub-db-prod --db-instance-class db.t3.micro --engine postgres --engine-version 15.5 --master-username connecthubadmin --master-user-password ConnectHub2024SecurePass! --allocated-storage 20 --storage-type gp3 --db-subnet-group-name connecthub-db-subnet --vpc-security-group-ids %SG_RDS% --backup-retention-period 7 --storage-encrypted --no-publicly-accessible --db-name connecthub >nul 2>&1

if %ERRORLEVEL% equ 0 (
    echo [OK] Database creation started
    echo [INFO] Waiting for database... (this takes 5-10 minutes)
    aws rds wait db-instance-available --db-instance-identifier connecthub-db-prod
    echo [OK] Database ready!
) else (
    echo [INFO] Database may already exist
)

REM Get endpoint
for /f "tokens=*" %%i in ('aws rds describe-db-instances --db-instance-identifier connecthub-db-prod --query "DBInstances[0].Endpoint.Address" --output text 2^>nul') do set DB_ENDPOINT=%%i
echo [OK] Database endpoint: %DB_ENDPOINT%
echo %DB_ENDPOINT%> .aws-db-endpoint
echo.

echo ===================================================================
echo   Step 5: Redis Cache (2-3 min wait)
echo ===================================================================
echo.

REM Create cache subnet group
aws elasticache create-cache-subnet-group --cache-subnet-group-name connecthub-cache-subnet --cache-subnet-group-description "ConnectHub cache subnets" --subnet-ids %SUBNET_PRIV_1A% %SUBNET_PRIV_1B% >nul 2>&1

REM Create Redis cluster
echo [INFO] Creating Redis cache...
aws elasticache create-cache-cluster --cache-cluster-id connecthub-redis-prod --engine redis --cache-node-type cache.t3.micro --num-cache-nodes 1 --cache-subnet-group-name connecthub-cache-subnet --security-group-ids %SG_REDIS% --engine-version 7.0 >nul 2>&1

if %ERRORLEVEL% equ 0 (
    echo [OK] Redis creation started
    echo [INFO] Waiting 60 seconds...
    timeout /t 60 /nobreak >nul
) else (
    echo [INFO] Redis may already exist
)

REM Get Redis endpoint
for /f "tokens=*" %%i in ('aws elasticache describe-cache-clusters --cache-cluster-id connecthub-redis-prod --show-cache-node-info --query "CacheClusters[0].CacheNodes[0].Endpoint.Address" --output text 2^>nul') do set REDIS_ENDPOINT=%%i
echo [OK] Redis endpoint: %REDIS_ENDPOINT%
echo %REDIS_ENDPOINT%> .aws-redis-endpoint
echo.

echo ===================================================================
echo   Step 6: S3 Storage
echo ===================================================================
echo.

set BUCKET_NAME=connecthub-uploads-prod-%RANDOM%%RANDOM%
aws s3 mb s3://%BUCKET_NAME% --region us-east-1 >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [OK] S3 bucket created: %BUCKET_NAME%
    aws s3api put-bucket-versioning --bucket %BUCKET_NAME% --versioning-configuration Status=Enabled >nul 2>&1
    echo %BUCKET_NAME%> .aws-uploads-bucket
) else (
    echo [INFO] Bucket creation skipped
)
echo.

echo ===================================================================
echo   Step 7: Environment Configuration
echo ===================================================================
echo.

REM Create .env.production
(
    echo # ConnectHub Production Environment
    echo DATABASE_URL=postgresql://connecthubadmin:ConnectHub2024SecurePass!@%DB_ENDPOINT%:5432/connecthub
    echo REDIS_URL=redis://%REDIS_ENDPOINT%:6379
    echo AWS_REGION=us-east-1
    echo AWS_S3_BUCKET=%BUCKET_NAME%
    echo JWT_SECRET=ConnectHub-JWT-2024-%RANDOM%%RANDOM%
    echo NODE_ENV=production
    echo PORT=3001
) > .env.production

echo [OK] Configuration saved to .env.production
echo.

echo ===================================================================
echo   ✅ DEPLOYMENT COMPLETE!
echo ===================================================================
echo.
echo PostgreSQL: %DB_ENDPOINT%:5432
echo   Database: connecthub
echo   Username: connecthubadmin
echo   Password: ConnectHub2024SecurePass!
echo.
echo Redis: %REDIS_ENDPOINT%:6379
echo.
echo S3 Bucket: %BUCKET_NAME%
echo.
echo VPC: %VPC_ID%
echo.
echo Next steps:
echo 1. Copy .env.production to ConnectHub-Backend\.env
echo 2. Run: cd ConnectHub-Backend
echo 3. Run: npx prisma generate --schema prisma/schema-enhanced.prisma
echo 4. Run: npx prisma migrate deploy --schema prisma/schema-enhanced.prisma
echo.
echo ===================================================================
pause
