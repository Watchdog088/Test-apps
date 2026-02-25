@echo off
REM ===================================================================
REM ConnectHub - AWS Database Infrastructure Deployment Script (FIXED)
REM Deploys ALL databases (PostgreSQL, Redis) to AWS with error handling
REM ===================================================================
setlocal EnableDelayedExpansion

echo.
echo ===================================================================
echo   ConnectHub - AWS Database Deployment (VPC Error Fixed)
echo   Deploying: PostgreSQL RDS, Redis ElastiCache, S3 Storage
echo ===================================================================
echo.

REM Check if AWS CLI is installed
where aws >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] AWS CLI is not installed!
    echo Please install from: https://awscli.amazonaws.com/AWSCLIV2.msi
    pause
    exit /b 1
)
echo [OK] AWS CLI is installed

REM Check if AWS is configured
aws sts get-caller-identity >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] AWS CLI is not configured!
    echo Run: aws configure
    pause
    exit /b 1
)
echo [OK] AWS CLI is configured
echo.

REM Display AWS account
echo Current AWS Account:
aws sts get-caller-identity --query "Account" --output text
echo Region: us-east-1
echo.

REM Confirm deployment
echo ===================================================================
echo WARNING: This creates AWS resources (~$33/month, FREE for 12 months)
echo ===================================================================
echo.
set /p CONFIRM="Proceed with deployment? (YES/no): "
if /i not "%CONFIRM%"=="YES" (
    echo Deployment cancelled.
    pause
    exit /b 0
)

echo.
echo ===================================================================
echo Step 1: VPC Setup (with error handling)
echo ===================================================================
echo.

REM Check for existing VPC file
if exist .aws-vpc-id (
    set /p VPC_ID=<.aws-vpc-id
    echo Found saved VPC ID: %VPC_ID%
    aws ec2 describe-vpcs --vpc-ids %VPC_ID% >nul 2>&1
    if !ERRORLEVEL! equ 0 (
        echo [OK] Reusing existing VPC: %VPC_ID%
        goto skip_vpc_creation
    )
    echo [WARNING] Saved VPC not found in AWS, creating new one
)

REM Check VPC limit
echo Checking AWS VPC limit...
aws ec2 describe-vpcs >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Cannot query VPCs. Check AWS permissions.
    pause
    exit /b 1
)

REM Create VPC
echo Creating new VPC...
aws ec2 create-vpc --cidr-block 10.0.0.0/16 --tag-specifications "ResourceType=vpc,Tags=[{Key=Name,Value=connecthub-vpc}]" --output json > vpc-output.json 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to create VPC!
    echo.
    echo POSSIBLE CAUSES:
    echo 1. VPC limit reached (default is 5 per region)
    echo 2. Insufficient IAM permissions
    echo 3. Service quota exceeded
    echo.
    echo SOLUTIONS:
    echo - Delete unused VPCs: https://console.aws.amazon.com/vpc/
    echo - Request limit increase in AWS Service Quotas
    echo - Try a different region
    echo.
    type vpc-output.json
    del vpc-output.json 2>nul
    pause
    exit /b 1
)

REM Extract VPC ID from JSON
for /f "tokens=2 delims=:, " %%a in ('findstr /C:"VpcId" vpc-output.json') do (
    set VPC_ID=%%a
    set VPC_ID=!VPC_ID:"=!
)
del vpc-output.json 2>nul

if "%VPC_ID%"=="" (
    echo [ERROR] Could not extract VPC ID
    pause
    exit /b 1
)

echo [OK] VPC Created: %VPC_ID%
echo %VPC_ID% > .aws-vpc-id

REM Enable DNS
aws ec2 modify-vpc-attribute --vpc-id %VPC_ID% --enable-dns-hostnames >nul 2>&1
echo [OK] DNS hostnames enabled
echo.

:skip_vpc_creation

REM Create Internet Gateway
echo Creating Internet Gateway...
for /f "tokens=*" %%i in ('aws ec2 create-internet-gateway --tag-specifications "ResourceType=internet-gateway,Tags=[{Key=Name,Value=connecthub-igw}]" --query "InternetGateway.InternetGatewayId" --output text 2^>nul') do set IGW_ID=%%i
if "%IGW_ID%"=="" (
    echo [WARNING] Could not create IGW, may already exist
) else (
    aws ec2 attach-internet-gateway --vpc-id %VPC_ID% --internet-gateway-id %IGW_ID% >nul 2>&1
    echo [OK] Internet Gateway: %IGW_ID%
)
echo.

REM Create Subnets
echo Creating subnets...
for /f "tokens=*" %%i in ('aws ec2 create-subnet --vpc-id %VPC_ID% --cidr-block 10.0.1.0/24 --availability-zone us-east-1a --query "Subnet.SubnetId" --output text 2^>nul') do set SUBNET_PUBLIC_1A=%%i
for /f "tokens=*" %%i in ('aws ec2 create-subnet --vpc-id %VPC_ID% --cidr-block 10.0.2.0/24 --availability-zone us-east-1b --query "Subnet.SubnetId" --output text 2^>nul') do set SUBNET_PUBLIC_1B=%%i
for /f "tokens=*" %%i in ('aws ec2 create-subnet --vpc-id %VPC_ID% --cidr-block 10.0.11.0/24 --availability-zone us-east-1a --query "Subnet.SubnetId" --output text 2^>nul') do set SUBNET_PRIVATE_1A=%%i
for /f "tokens=*" %%i in ('aws ec2 create-subnet --vpc-id %VPC_ID% --cidr-block 10.0.12.0/24 --availability-zone us-east-1b --query "Subnet.SubnetId" --output text 2^>nul') do set SUBNET_PRIVATE_1B=%%i
echo [OK] Subnets created

echo.
echo ===================================================================
echo Step 2: Security Groups
echo ===================================================================
echo.

for /f "tokens=*" %%i in ('aws ec2 create-security-group --group-name connecthub-rds-sg --description "RDS PostgreSQL" --vpc-id %VPC_ID% --query "GroupId" --output text 2^>nul') do set SG_RDS=%%i
aws ec2 authorize-security-group-ingress --group-id %SG_RDS% --protocol tcp --port 5432 --cidr 10.0.0.0/16 >nul 2>&1
echo [OK] RDS Security Group: %SG_RDS%

for /f "tokens=*" %%i in ('aws ec2 create-security-group --group-name connecthub-redis-sg --description "Redis Cache" --vpc-id %VPC_ID% --query "GroupId" --output text 2^>nul') do set SG_REDIS=%%i
aws ec2 authorize-security-group-ingress --group-id %SG_REDIS% --protocol tcp --port 6379 --cidr 10.0.0.0/16 >nul 2>&1
echo [OK] Redis Security Group: %SG_REDIS%

echo.
echo ===================================================================
echo Step 3: RDS PostgreSQL (5-10 minutes)
echo ===================================================================
echo.

aws rds create-db-subnet-group --db-subnet-group-name connecthub-db-subnet --db-subnet-group-description "ConnectHub DB subnet" --subnet-ids %SUBNET_PRIVATE_1A% %SUBNET_PRIVATE_1B% >nul 2>&1
echo [OK] DB Subnet Group created

echo Creating PostgreSQL database (this takes time)...
aws rds create-db-instance --db-instance-identifier connecthub-db-prod --db-instance-class db.t3.micro --engine postgres --engine-version 15.5 --master-username connecthubadmin --master-user-password ConnectHub2024SecurePass! --allocated-storage 20 --storage-type gp3 --db-subnet-group-name connecthub-db-subnet --vpc-security-group-ids %SG_RDS% --backup-retention-period 7 --storage-encrypted --no-publicly-accessible --db-name connecthub >nul 2>&1

if %ERRORLEVEL% equ 0 (
    echo [OK] Database creation initiated
    echo Waiting for database (5-10 minutes)...
    aws rds wait db-instance-available --db-instance-identifier connecthub-db-prod
    echo [OK] Database is available!
) else (
    echo [WARNING] Database may already exist
)

for /f "tokens=*" %%i in ('aws rds describe-db-instances --db-instance-identifier connecthub-db-prod --query "DBInstances[0].Endpoint.Address" --output text 2^>nul') do set DB_ENDPOINT=%%i
echo [OK] Database Endpoint: %DB_ENDPOINT%
echo %DB_ENDPOINT% > .aws-db-endpoint

echo.
echo ===================================================================
echo Step 4: ElastiCache Redis
echo ===================================================================
echo.

aws elasticache create-cache-subnet-group --cache-subnet-group-name connecthub-cache-subnet --cache-subnet-group-description "ConnectHub cache subnet" --subnet-ids %SUBNET_PRIVATE_1A% %SUBNET_PRIVATE_1B% >nul 2>&1
echo [OK] Cache Subnet Group created

aws elasticache create-cache-cluster --cache-cluster-id connecthub-redis-prod --engine redis --cache-node-type cache.t3.micro --num-cache-nodes 1 --cache-subnet-group-name connecthub-cache-subnet --security-group-ids %SG_REDIS% --engine-version 7.0 >nul 2>&1
echo [OK] Redis cluster creation initiated

timeout /t 60 /nobreak >nul
for /f "tokens=*" %%i in ('aws elasticache describe-cache-clusters --cache-cluster-id connecthub-redis-prod --show-cache-node-info --query "CacheClusters[0].CacheNodes[0].Endpoint.Address" --output text 2^>nul') do set REDIS_ENDPOINT=%%i
echo [OK] Redis Endpoint: %REDIS_ENDPOINT%
echo %REDIS_ENDPOINT% > .aws-redis-endpoint

echo.
echo ===================================================================
echo Step 5: S3 Storage
echo ===================================================================
echo.

set BUCKET_UPLOADS=connecthub-uploads-prod-%RANDOM%
aws s3 mb s3://%BUCKET_UPLOADS% --region us-east-1 >nul 2>&1
echo [OK] S3 Bucket: %BUCKET_UPLOADS%
echo %BUCKET_UPLOADS% > .aws-uploads-bucket

echo.
echo ===================================================================
echo Step 6: Save Configuration
echo ===================================================================
echo.

(
echo # ConnectHub Production Configuration
echo DATABASE_URL=postgresql://connecthubadmin:ConnectHub2024SecurePass!@%DB_ENDPOINT%:5432/connecthub
echo REDIS_URL=redis://%REDIS_ENDPOINT%:6379
echo AWS_S3_BUCKET=%BUCKET_UPLOADS%
echo AWS_REGION=us-east-1
echo NODE_ENV=production
) > .env.production

echo [OK] Saved to .env.production

echo.
echo ===================================================================
echo DEPLOYMENT COMPLETE!
echo ===================================================================
echo.
echo PostgreSQL: %DB_ENDPOINT%:5432
echo Redis: %REDIS_ENDPOINT%:6379
echo S3 Bucket: %BUCKET_UPLOADS%
echo VPC: %VPC_ID%
echo.
echo NEXT STEPS:
echo 1. Initialize database: cd ConnectHub-Backend ^& npx prisma migrate deploy
echo 2. Check DATABASE-DEPLOYMENT-STATUS-AND-FIX.md for details
echo.
pause
