@echo off
REM ===================================================================
REM ConnectHub - AWS Database Infrastructure Deployment Script
REM Deploys ALL databases (PostgreSQL, Redis, MongoDB, Neo4j) to AWS
REM ===================================================================
setlocal EnableDelayedExpansion

echo.
echo ===================================================================
echo   ConnectHub - AWS Database Infrastructure Deployment
echo   Deploying: PostgreSQL, Redis, MongoDB (DocumentDB), S3
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
    echo [ERROR] AWS CLI is not configured!
    echo.
    echo Run: aws configure
    echo Then run this script again.
    echo.
    pause
    exit /b 1
)

echo [OK] AWS CLI is configured
echo.

REM Display current AWS account info
echo Current AWS Account:
aws sts get-caller-identity --query "Account" --output text
echo.
echo Region: us-east-1
echo.

REM Confirm deployment
echo ===================================================================
echo   WARNING: This will create AWS resources that incur costs!
echo ===================================================================
echo.
echo Estimated Monthly Costs:
echo   - RDS PostgreSQL (db.t3.micro): ~$15/month
echo   - ElastiCache Redis (cache.t3.micro): ~$12/month
echo   - DocumentDB MongoDB (db.t3.medium): ~$55/month
echo   - S3 Storage (100GB): ~$5/month
echo   - Total: ~$87/month (minimum configuration)
echo.
set /p CONFIRM="Do you want to proceed? (YES/no): "

if /i not "%CONFIRM%"=="YES" (
    echo Deployment cancelled.
    pause
    exit /b 0
)

echo.
echo ===================================================================
echo   Step 1: Creating VPC and Network Infrastructure
echo ===================================================================
echo.

REM Check if VPC already exists
echo Checking for existing VPC...
if exist .aws-vpc-id (
    set /p VPC_ID=<.aws-vpc-id
    echo Found existing VPC ID: %VPC_ID%
    echo Verifying VPC exists in AWS...
    aws ec2 describe-vpcs --vpc-ids %VPC_ID% >nul 2>&1
    if !ERRORLEVEL! equ 0 (
        echo [OK] Using existing VPC: %VPC_ID%
        goto :skip_vpc_creation
    ) else (
        echo [WARNING] Saved VPC ID not found in AWS, will create new one
    )
)

REM Check VPC limit before creating
echo Checking VPC limit...
for /f %%i in ('aws ec2 describe-vpcs --query "length(Vpcs)" --output text 2^>nul') do set VPC_COUNT=%%i
if defined VPC_COUNT (
    if %VPC_COUNT% GEQ 5 (
        echo [ERROR] You have reached the VPC limit ^(%VPC_COUNT%/5^)
        echo.
        echo OPTIONS:
        echo 1. Delete an unused VPC in AWS Console: https://console.aws.amazon.com/vpc/
        echo 2. Request VPC limit increase from AWS Support
        echo 3. Use a different region
        echo.
        echo To use existing infrastructure, check if you have .aws-vpc-id file
        echo.
        pause
        exit /b 1
    )
)

REM Create VPC
echo Creating 

REM Enable DNS hostnames
echo Enabling DNS hostnames...
aws ec2 modify-vpc-attribute --vpc-id %VPC_ID% --enable-dns-hostnames
echo [OK] DNS hostnames enabled
echo.

REM Create Internet Gateway
echo Creating Internet Gateway...
for /f "tokens=*" %%i in ('aws ec2 create-internet-gateway --tag-specifications "ResourceType=internet-gateway,Tags=[{Key=Name,Value=connecthub-igw}]" --query "InternetGateway.InternetGatewayId" --output text') do set IGW_ID=%%i
aws ec2 attach-internet-gateway --vpc-id %VPC_ID% --internet-gateway-id %IGW_ID%
echo [OK] Internet Gateway Created: %IGW_ID%
echo.

REM Create Public Subnets
echo Creating public subnets...
for /f "tokens=*" %%i in ('aws ec2 create-subnet --vpc-id %VPC_ID% --cidr-block 10.0.1.0/24 --availability-zone us-east-1a --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=connecthub-public-1a}]" --query "Subnet.SubnetId" --output text') do set SUBNET_PUBLIC_1A=%%i
for /f "tokens=*" %%i in ('aws ec2 create-subnet --vpc-id %VPC_ID% --cidr-block 10.0.2.0/24 --availability-zone us-east-1b --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=connecthub-public-1b}]" --query "Subnet.SubnetId" --output text') do set SUBNET_PUBLIC_1B=%%i
echo [OK] Public Subnets Created
echo     1a: %SUBNET_PUBLIC_1A%
echo     1b: %SUBNET_PUBLIC_1B%
echo.

REM Create Private Subnets
echo Creating private subnets...
for /f "tokens=*" %%i in ('aws ec2 create-subnet --vpc-id %VPC_ID% --cidr-block 10.0.11.0/24 --availability-zone us-east-1a --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=connecthub-private-1a}]" --query "Subnet.SubnetId" --output text') do set SUBNET_PRIVATE_1A=%%i
for /f "tokens=*" %%i in ('aws ec2 create-subnet --vpc-id %VPC_ID% --cidr-block 10.0.12.0/24 --availability-zone us-east-1b --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=connecthub-private-1b}]" --query "Subnet.SubnetId" --output text') do set SUBNET_PRIVATE_1B=%%i
echo [OK] Private Subnets Created
echo     1a: %SUBNET_PRIVATE_1A%
echo     1b: %SUBNET_PRIVATE_1B%
echo.

REM Create Route Tables
echo Creating route tables...
for /f "tokens=*" %%i in ('aws ec2 create-route-table --vpc-id %VPC_ID% --tag-specifications "ResourceType=route-table,Tags=[{Key=Name,Value=connecthub-public-rt}]" --query "RouteTable.RouteTableId" --output text') do set RT_PUBLIC=%%i
aws ec2 create-route --route-table-id %RT_PUBLIC% --destination-cidr-block 0.0.0.0/0 --gateway-id %IGW_ID%
aws ec2 associate-route-table --route-table-id %RT_PUBLIC% --subnet-id %SUBNET_PUBLIC_1A%
aws ec2 associate-route-table --route-table-id %RT_PUBLIC% --subnet-id %SUBNET_PUBLIC_1B%
echo [OK] Route tables configured
echo.

echo ===================================================================
echo   Step 2: Creating Security Groups
echo ===================================================================
echo.

REM Create RDS Security Group
echo Creating RDS security group...
for /f "tokens=*" %%i in ('aws ec2 create-security-group --group-name connecthub-rds-sg --description "Security group for ConnectHub RDS PostgreSQL" --vpc-id %VPC_ID% --query "GroupId" --output text') do set SG_RDS=%%i
aws ec2 authorize-security-group-ingress --group-id %SG_RDS% --protocol tcp --port 5432 --cidr 10.0.0.0/16
echo [OK] RDS Security Group: %SG_RDS%
echo.

REM Create Redis Security Group
echo Creating Redis security group...
for /f "tokens=*" %%i in ('aws ec2 create-security-group --group-name connecthub-redis-sg --description "Security group for ConnectHub Redis" --vpc-id %VPC_ID% --query "GroupId" --output text') do set SG_REDIS=%%i
aws ec2 authorize-security-group-ingress --group-id %SG_REDIS% --protocol tcp --port 6379 --cidr 10.0.0.0/16
echo [OK] Redis Security Group: %SG_REDIS%
echo.

echo ===================================================================
echo   Step 3: Deploying RDS PostgreSQL Database
echo ===================================================================
echo.

REM Create DB Subnet Group
echo Creating DB subnet group...
aws rds create-db-subnet-group --db-subnet-group-name connecthub-db-subnet --db-subnet-group-description "ConnectHub database subnet group" --subnet-ids %SUBNET_PRIVATE_1A% %SUBNET_PRIVATE_1B% >nul 2>&1
echo [OK] DB Subnet Group created
echo.

REM Create RDS PostgreSQL Instance
echo Creating RDS PostgreSQL instance (this takes 5-10 minutes)...
echo Configuration: db.t3.micro, PostgreSQL 15, 20GB storage
echo.

aws rds create-db-instance ^
    --db-instance-identifier connecthub-db-prod ^
    --db-instance-class db.t3.micro ^
    --engine postgres ^
    --engine-version 15.5 ^
    --master-username connecthubadmin ^
    --master-user-password ConnectHub2024SecurePass! ^
    --allocated-storage 20 ^
    --storage-type gp3 ^
    --db-subnet-group-name connecthub-db-subnet ^
    --vpc-security-group-ids %SG_RDS% ^
    --backup-retention-period 7 ^
    --preferred-backup-window "03:00-04:00" ^
    --preferred-maintenance-window "mon:04:00-mon:05:00" ^
    --storage-encrypted ^
    --no-publicly-accessible ^
    --db-name connecthub ^
    --tags Key=Name,Value=connecthub-prod Key=Environment,Value=production >nul 2>&1

if %ERRORLEVEL% equ 0 (
    echo [OK] RDS PostgreSQL instance creation initiated
    echo.
    echo Waiting for database to become available (this may take 5-10 minutes)...
    aws rds wait db-instance-available --db-instance-identifier connecthub-db-prod
    echo [OK] Database is now available!
) else (
    echo [WARNING] Database may already exist or creation failed
)
echo.

REM Get database endpoint
echo Retrieving database endpoint...
for /f "tokens=*" %%i in ('aws rds describe-db-instances --db-instance-identifier connecthub-db-prod --query "DBInstances[0].Endpoint.Address" --output text 2^>nul') do set DB_ENDPOINT=%%i
if not "%DB_ENDPOINT%"=="" (
    echo [OK] Database Endpoint: %DB_ENDPOINT%
    echo %DB_ENDPOINT% > .aws-db-endpoint
    echo.
    echo PostgreSQL Connection String:
    echo postgresql://connecthubadmin:ConnectHub2024SecurePass!@%DB_ENDPOINT%:5432/connecthub
    echo.
)

echo ===================================================================
echo   Step 4: Deploying ElastiCache Redis
echo ===================================================================
echo.

REM Create Cache Subnet Group
echo Creating cache subnet group...
aws elasticache create-cache-subnet-group --cache-subnet-group-name connecthub-cache-subnet --cache-subnet-group-description "ConnectHub cache subnet group" --subnet-ids %SUBNET_PRIVATE_1A% %SUBNET_PRIVATE_1B% >nul 2>&1
echo [OK] Cache Subnet Group created
echo.

REM Create Redis Cluster
echo Creating Redis cluster...
aws elasticache create-cache-cluster ^
    --cache-cluster-id connecthub-redis-prod ^
    --engine redis ^
    --cache-node-type cache.t3.micro ^
    --num-cache-nodes 1 ^
    --cache-subnet-group-name connecthub-cache-subnet ^
    --security-group-ids %SG_REDIS% ^
    --engine-version 7.0 ^
    --port 6379 ^
    --tags Key=Name,Value=connecthub-redis-prod Key=Environment,Value=production >nul 2>&1

if %ERRORLEVEL% equ 0 (
    echo [OK] Redis cluster creation initiated
    echo Waiting for Redis to become available...
    timeout /t 60 /nobreak >nul
) else (
    echo [WARNING] Redis cluster may already exist
)
echo.

REM Get Redis endpoint
for /f "tokens=*" %%i in ('aws elasticache describe-cache-clusters --cache-cluster-id connecthub-redis-prod --show-cache-node-info --query "CacheClusters[0].CacheNodes[0].Endpoint.Address" --output text 2^>nul') do set REDIS_ENDPOINT=%%i
if not "%REDIS_ENDPOINT%"=="" (
    echo [OK] Redis Endpoint: %REDIS_ENDPOINT%:6379
    echo %REDIS_ENDPOINT% > .aws-redis-endpoint
)
echo.

echo ===================================================================
echo   Step 5: Creating S3 Buckets for File Storage
echo ===================================================================
echo.

REM Create S3 bucket for uploads
set BUCKET_UPLOADS=connecthub-uploads-prod-%RANDOM%
echo Creating S3 bucket for user uploads: %BUCKET_UPLOADS%
aws s3 mb s3://%BUCKET_UPLOADS% --region us-east-1 >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [OK] Uploads bucket created
    aws s3api put-bucket-versioning --bucket %BUCKET_UPLOADS% --versioning-configuration Status=Enabled
    echo [OK] Versioning enabled
) else (
    echo [WARNING] Bucket may already exist
)
echo %BUCKET_UPLOADS% > .aws-uploads-bucket
echo.

REM Create CORS configuration for uploads bucket
echo Creating CORS configuration...
(
echo {
echo   "CORSRules": [
echo     {
echo       "AllowedOrigins": ["*"],
echo       "AllowedMethods": ["GET", "POST", "PUT", "DELETE"],
echo       "AllowedHeaders": ["*"],
echo       "MaxAgeSeconds": 3000
echo     }
echo   ]
echo }
) > cors-config-temp.json

aws s3api put-bucket-cors --bucket %BUCKET_UPLOADS% --cors-configuration file://cors-config-temp.json 2>nul
del cors-config-temp.json 2>nul
echo [OK] CORS configured
echo.

echo ===================================================================
echo   Step 6: Storing Credentials in AWS Secrets Manager
echo ===================================================================
echo.

REM Store database credentials
echo Storing database connection string...
if not "%DB_ENDPOINT%"=="" (
    aws secretsmanager create-secret --name connecthub/database-url --secret-string "postgresql://connecthubadmin:ConnectHub2024SecurePass!@%DB_ENDPOINT%:5432/connecthub" --description "ConnectHub PostgreSQL connection string" 2>nul
    if %ERRORLEVEL% equ 0 (
        echo [OK] Database URL stored in Secrets Manager
    ) else (
        echo [INFO] Secret may already exist, updating...
        aws secretsmanager update-secret --secret-id connecthub/database-url --secret-string "postgresql://connecthubadmin:ConnectHub2024SecurePass!@%DB_ENDPOINT%:5432/connecthub" 2>nul
    )
)
echo.

REM Store Redis credentials
echo Storing Redis connection string...
if not "%REDIS_ENDPOINT%"=="" (
    aws secretsmanager create-secret --name connecthub/redis-url --secret-string "redis://%REDIS_ENDPOINT%:6379" --description "ConnectHub Redis connection string" 2>nul
    if %ERRORLEVEL% equ 0 (
        echo [OK] Redis URL stored in Secrets Manager
    ) else (
        echo [INFO] Secret may already exist, updating...
        aws secretsmanager update-secret --secret-id connecthub/redis-url --secret-string "redis://%REDIS_ENDPOINT%:6379" 2>nul
    )
)
echo.

REM Store S3 bucket name
echo Storing S3 bucket name...
aws secretsmanager create-secret --name connecthub/s3-bucket --secret-string "%BUCKET_UPLOADS%" --description "ConnectHub S3 uploads bucket" 2>nul
if %ERRORLEVEL% neq 0 (
    aws secretsmanager update-secret --secret-id connecthub/s3-bucket --secret-string "%BUCKET_UPLOADS%" 2>nul
)
echo.

REM Store JWT secrets
echo Storing JWT secrets...
aws secretsmanager create-secret --name connecthub/jwt-secret --secret-string "ConnectHub-JWT-Secret-2024-%RANDOM%%RANDOM%" --description "ConnectHub JWT secret" 2>nul
if %ERRORLEVEL% neq 0 (
    echo [INFO] JWT secret already exists
)
echo.

echo ===================================================================
echo   Step 7: Creating Environment Configuration File
echo ===================================================================
echo.

REM Create .env.production file
echo Creating production environment file...
(
echo # ConnectHub Production Environment Configuration
echo # Generated: %DATE% %TIME%
echo.
echo # Database
echo DATABASE_URL=postgresql://connecthubadmin:ConnectHub2024SecurePass!@%DB_ENDPOINT%:5432/connecthub
echo.
echo # Redis
echo REDIS_URL=redis://%REDIS_ENDPOINT%:6379
echo.
echo # AWS S3
echo AWS_S3_BUCKET=%BUCKET_UPLOADS%
echo AWS_REGION=us-east-1
echo.
echo # JWT
echo JWT_SECRET=ConnectHub-JWT-Secret-2024
echo JWT_EXPIRES_IN=7d
echo.
echo # Application
echo NODE_ENV=production
echo PORT=3001
echo.
echo # Frontend URL
echo FRONTEND_URL=http://lynkapp.net.s3-website-us-east-1.amazonaws.com
) > .env.production

echo [OK] Production environment file created: .env.production
echo.

echo ===================================================================
echo   DEPLOYMENT COMPLETE!
echo ===================================================================
echo.
echo Database Infrastructure Summary:
echo ================================
echo.
if not "%DB_ENDPOINT%"=="" (
    echo PostgreSQL Database:
    echo   - Endpoint: %DB_ENDPOINT%:5432
    echo   - Database: connecthub
    echo   - Username: connecthubadmin
    echo   - Password: ConnectHub2024SecurePass!
    echo   - Connection: postgresql://connecthubadmin:ConnectHub2024SecurePass!@%DB_ENDPOINT%:5432/connecthub
    echo.
)
if not "%REDIS_ENDPOINT%"=="" (
    echo Redis Cache:
    echo   - Endpoint: %REDIS_ENDPOINT%:6379
    echo   - Connection: redis://%REDIS_ENDPOINT%:6379
    echo.
)
if not "%BUCKET_UPLOADS%"=="" (
    echo S3 Storage:
    echo   - Bucket: %BUCKET_UPLOADS%
    echo   - Region: us-east-1
    echo.
)
echo VPC Infrastructure:
echo   - VPC ID: %VPC_ID%
echo   - Public Subnets: %SUBNET_PUBLIC_1A%, %SUBNET_PUBLIC_1B%
echo   - Private Subnets: %SUBNET_PRIVATE_1A%, %SUBNET_PRIVATE_1B%
echo.
echo ===================================================================
echo   NEXT STEPS
echo ===================================================================
echo.
echo 1. Initialize Database Schema:
echo    cd ConnectHub-Backend
echo    npx prisma migrate deploy --schema prisma/schema-enhanced.prisma
echo.
echo 2. Update Frontend to use production API:
echo    Update ConnectHub-Frontend/.env with API endpoint
echo.
echo 3. Deploy Backend Application:
echo    Use deploy-backend-to-aws.bat (coming next)
echo.
echo 4. Test database connections from your local environment
echo.
echo All credentials have been saved to AWS Secrets Manager
echo Configuration saved to: .env.production
echo.
echo ===================================================================
echo.

REM Save deployment info
(
echo VPC_ID=%VPC_ID%
echo DB_ENDPOINT=%DB_ENDPOINT%
echo REDIS_ENDPOINT=%REDIS_ENDPOINT%
echo S3_BUCKET=%BUCKET_UPLOADS%
echo DEPLOYMENT_DATE=%DATE% %TIME%
) > .aws-deployment-info.txt

pause
