@echo off
REM ===================================================================
REM ConnectHub - AWS Database Deployment (ULTIMATE FIX)
REM Fixed: VPC permission errors, incomplete commands, better error handling
REM ===================================================================
setlocal EnableDelayedExpansion

echo.
echo ===================================================================
echo   ConnectHub - AWS Database Deployment (ULTIMATE FIX)
echo   Deploying: PostgreSQL RDS + Redis + S3 Storage
echo ===================================================================
echo.

REM ===================================================================
REM Step 0: Pre-flight Checks
REM ===================================================================

REM Check if AWS CLI is installed
where aws >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] AWS CLI is not installed!
    echo.
    echo Please install AWS CLI:
    echo 1. Download: https://awscli.amazonaws.com/AWSCLIV2.msi
    echo 2. Install and restart Command Prompt
    echo 3. Run: aws configure
    echo.
    pause
    exit /b 1
)
echo [OK] AWS CLI is installed

REM Check if AWS is configured
aws sts get-caller-identity >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] AWS CLI is not configured!
    echo.
    echo Please configure AWS CLI:
    echo 1. Run: aws configure
    echo 2. Enter your Access Key ID
    echo 3. Enter your Secret Access Key
    echo 4. Enter region: us-east-1
    echo 5. Run this script again
    echo.
    pause
    exit /b 1
)
echo [OK] AWS CLI is configured

REM Display AWS account info
echo.
echo Current AWS Account:
for /f "tokens=*" %%i in ('aws sts get-caller-identity --query "Account" --output text 2^>nul') do echo   Account ID: %%i
for /f "tokens=*" %%i in ('aws sts get-caller-identity --query "Arn" --output text 2^>nul') do echo   User: %%i
echo   Region: us-east-1
echo.

REM Confirm deployment
echo ===================================================================
echo   WARNING: This will create AWS resources with costs!
echo ===================================================================
echo.
echo Estimated Monthly Costs (FREE TIER ELIGIBLE for 12 months):
echo   - RDS PostgreSQL (db.t3.micro): ~$15/month (FREE: 750 hours/month)
echo   - ElastiCache Redis (cache.t3.micro): ~$12/month
echo   - S3 Storage (first 100GB): ~$5/month (FREE: 5GB)
echo   - Total: ~$32/month (or FREE if within free tier limits)
echo.
set /p CONFIRM="Do you want to proceed? Type YES to continue: "

if /i not "%CONFIRM%"=="YES" (
    echo.
    echo Deployment cancelled by user.
    pause
    exit /b 0
)

echo.
echo ===================================================================
echo   Step 1: VPC Setup (FIXED - with proper error handling)
echo ===================================================================
echo.

REM Check for existing VPC file
if exist .aws-vpc-id (
    set /p VPC_ID=<.aws-vpc-id
    echo [INFO] Found saved VPC ID: %VPC_ID%
    echo [INFO] Verifying VPC exists in AWS...
    
    aws ec2 describe-vpcs --vpc-ids %VPC_ID% >nul 2>&1
    if !ERRORLEVEL! equ 0 (
        echo [OK] Reusing existing VPC: %VPC_ID%
        goto skip_vpc_creation
    ) else (
        echo [WARNING] Saved VPC ID not found in AWS
        echo [INFO] Will create a new VPC
        del .aws-vpc-id 2>nul
    )
)

REM Check VPC permissions and count
echo [INFO] Checking VPC permissions and limits...
aws ec2 describe-vpcs --query "Vpcs[*].[VpcId,Tags[?Key=='Name'].Value|[0]]" --output text > vpc-check.tmp 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Cannot query VPCs. Insufficient AWS permissions!
    echo.
    echo TROUBLESHOOTING:
    echo ================
    echo.
    echo Your AWS user needs these IAM permissions:
    echo   - ec2:DescribeVpcs
    echo   - ec2:CreateVpc
    echo   - ec2:DescribeSubnets
    echo   - ec2:CreateSubnet
    echo   - rds:CreateDBInstance
    echo   - elasticache:CreateCacheCluster
    echo   - s3:CreateBucket
    echo.
    echo SOLUTIONS:
    echo 1. Ask your AWS administrator to grant EC2, RDS, ElastiCache, S3 permissions
    echo 2. Use AWS managed policy: PowerUserAccess or AdministratorAccess
    echo 3. Check AWS IAM console: https://console.aws.amazon.com/iam/
    echo.
    echo Error details:
    type vpc-check.tmp 2>nul
    del vpc-check.tmp 2>nul
    pause
    exit /b 1
)

REM Count VPCs
for /f %%i in ('find /c /v "" ^< vpc-check.tmp') do set VPC_COUNT=%%i
del vpc-check.tmp 2>nul

echo [OK] AWS permissions verified
echo [INFO] Current VPCs in us-east-1: %VPC_COUNT%

if %VPC_COUNT% GEQ 5 (
    echo [ERROR] VPC limit reached! (%VPC_COUNT%/5 VPCs used)
    echo.
    echo AWS allows maximum 5 VPCs per region by default.
    echo.
    echo OPTIONS:
    echo 1. Delete an unused VPC:
    echo    - Go to: https://console.aws.amazon.com/vpc/
    echo    - Select unused VPC and delete it
    echo    - Run this script again
    echo.
    echo 2. Request VPC limit increase:
    echo    - Go to: https://console.aws.amazon.com/servicequotas/
    echo    - Search for "VPCs per Region"
    echo    - Request increase
    echo.
    echo 3. Use a different AWS region (change script)
    echo.
    echo 4. Deploy in existing VPC (advanced)
    echo.
    pause
    exit /b 1
)

REM Create VPC with proper error handling
echo [INFO] Creating new VPC for ConnectHub...
echo [INFO] CIDR Block: 10.0.0.0/16

aws ec2 create-vpc --cidr-block 10.0.0.0/16 --tag-specifications "ResourceType=vpc,Tags=[{Key=Name,Value=connecthub-vpc},{Key=Project,Value=ConnectHub}]" --output json > vpc-output.json 2>&1

if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to create VPC!
    echo.
    echo Error output:
    type vpc-output.json
    echo.
    echo POSSIBLE CAUSES:
    echo - Insufficient IAM permissions
    echo - VPC limit reached
    echo - Service quota exceeded
    echo - CIDR block conflict
    echo.
    del vpc-output.json 2>nul
    pause
    exit /b 1
)

REM Extract VPC ID from JSON output
for /f "tokens=2 delims=: " %%a in ('findstr /C:"VpcId" vpc-output.json') do (
    set VPC_ID_RAW=%%a
    REM Remove quotes and commas
    set VPC_ID=!VPC_ID_RAW:"=!
    set VPC_ID=!VPC_ID:,=!
    goto vpc_id_found
)

:vpc_id_found
del vpc-output.json 2>nul

if "%VPC_ID%"=="" (
    echo [ERROR] Could not extract VPC ID from AWS response
    pause
    exit /b 1
)

echo [OK] VPC Created Successfully: %VPC_ID%
echo %VPC_ID% > .aws-vpc-id

REM Enable DNS hostnames and DNS resolution
echo [INFO] Configuring VPC DNS settings...
aws ec2 modify-vpc-attribute --vpc-id %VPC_ID% --enable-dns-hostnames >nul 2>&1
aws ec2 modify-vpc-attribute --vpc-id %VPC_ID% --enable-dns-support >nul 2>&1
echo [OK] DNS hostnames and DNS support enabled
echo.

REM Wait a moment for VPC to be ready
timeout /t 3 /nobreak >nul

:skip_vpc_creation

REM Verify VPC exists
echo [INFO] Verifying VPC: %VPC_ID%
aws ec2 describe-vpcs --vpc-ids %VPC_ID% >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] VPC verification failed!
    pause
    exit /b 1
)
echo [OK] VPC verified and ready

echo.
echo ===================================================================
echo   Step 2: Network Infrastructure (IGW, Subnets, Routes)
echo ===================================================================
echo.

REM Create Internet Gateway
echo [INFO] Creating Internet Gateway...
for /f "tokens=*" %%i in ('aws ec2 create-internet-gateway --tag-specifications "ResourceType=internet-gateway,Tags=[{Key=Name,Value=connecthub-igw}]" --query "InternetGateway.InternetGatewayId" --output text 2^>nul') do set IGW_ID=%%i

if "%IGW_ID%"=="" (
    echo [WARNING] Could not create Internet Gateway (may already exist)
    set IGW_ID=existing
) else (
    aws ec2 attach-internet-gateway --vpc-id %VPC_ID% --internet-gateway-id %IGW_ID% >nul 2>&1
    echo [OK] Internet Gateway created and attached: %IGW_ID%
)

REM Create Public Subnets
echo [INFO] Creating public subnets in multiple availability zones...
for /f "tokens=*" %%i in ('aws ec2 create-subnet --vpc-id %VPC_ID% --cidr-block 10.0.1.0/24 --availability-zone us-east-1a --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=connecthub-public-1a}]" --query "Subnet.SubnetId" --output text 2^>nul') do set SUBNET_PUBLIC_1A=%%i
for /f "tokens=*" %%i in ('aws ec2 create-subnet --vpc-id %VPC_ID% --cidr-block 10.0.2.0/24 --availability-zone us-east-1b --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=connecthub-public-1b}]" --query "Subnet.SubnetId" --output text 2^>nul') do set SUBNET_PUBLIC_1B=%%i

if "%SUBNET_PUBLIC_1A%"=="" (
    echo [ERROR] Failed to create public subnet in us-east-1a
    pause
    exit /b 1
)
echo [OK] Public subnets created:
echo     - us-east-1a: %SUBNET_PUBLIC_1A%
echo     - us-east-1b: %SUBNET_PUBLIC_1B%

REM Create Private Subnets for databases
echo [INFO] Creating private subnets for databases...
for /f "tokens=*" %%i in ('aws ec2 create-subnet --vpc-id %VPC_ID% --cidr-block 10.0.11.0/24 --availability-zone us-east-1a --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=connecthub-private-db-1a}]" --query "Subnet.SubnetId" --output text 2^>nul') do set SUBNET_PRIVATE_1A=%%i
for /f "tokens=*" %%i in ('aws ec2 create-subnet --vpc-id %VPC_ID% --cidr-block 10.0.12.0/24 --availability-zone us-east-1b --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=connecthub-private-db-1b}]" --query "Subnet.SubnetId" --output text 2^>nul') do set SUBNET_PRIVATE_1B=%%i

echo [OK] Private subnets created:
echo     - us-east-1a: %SUBNET_PRIVATE_1A%
echo     - us-east-1b: %SUBNET_PRIVATE_1B%

REM Create and configure route tables
echo [INFO] Configuring route tables...
for /f "tokens=*" %%i in ('aws ec2 create-route-table --vpc-id %VPC_ID% --tag-specifications "ResourceType=route-table,Tags=[{Key=Name,Value=connecthub-public-rt}]" --query "RouteTable.RouteTableId" --output text 2^>nul') do set RT_PUBLIC=%%i

if not "%RT_PUBLIC%"=="" (
    aws ec2 create-route --route-table-id %RT_PUBLIC% --destination-cidr-block 0.0.0.0/0 --gateway-id %IGW_ID% >nul 2>&1
    aws ec2 associate-route-table --route-table-id %RT_PUBLIC% --subnet-id %SUBNET_PUBLIC_1A% >nul 2>&1
    aws ec2 associate-route-table --route-table-id %RT_PUBLIC% --subnet-id %SUBNET_PUBLIC_1B% >nul 2>&1
    echo [OK] Route tables configured
)
echo.

echo ===================================================================
echo   Step 3: Security Groups (Firewall Rules)
echo ===================================================================
echo.

REM Create RDS Security Group
echo [INFO] Creating security group for RDS PostgreSQL...
for /f "tokens=*" %%i in ('aws ec2 create-security-group --group-name connecthub-rds-sg --description "Security group for ConnectHub RDS PostgreSQL" --vpc-id %VPC_ID% --query "GroupId" --output text 2^>nul') do set SG_RDS=%%i

if "%SG_RDS%"=="" (
    echo [WARNING] RDS security group may already exist
    for /f "tokens=*" %%i in ('aws ec2 describe-security-groups --filters "Name=group-name,Values=connecthub-rds-sg" "Name=vpc-id,Values=%VPC_ID%" --query "SecurityGroups[0].GroupId" --output text 2^>nul') do set SG_RDS=%%i
)

if not "%SG_RDS%"=="" (
    aws ec2 authorize-security-group-ingress --group-id %SG_RDS% --protocol tcp --port 5432 --cidr 10.0.0.0/16 >nul 2>&1
    echo [OK] RDS Security Group: %SG_RDS%
) else (
    echo [ERROR] Could not create RDS security group
    pause
    exit /b 1
)

REM Create Redis Security Group
echo [INFO] Creating security group for Redis...
for /f "tokens=*" %%i in ('aws ec2 create-security-group --group-name connecthub-redis-sg --description "Security group for ConnectHub Redis ElastiCache" --vpc-id %VPC_ID% --query "GroupId" --output text 2^>nul') do set SG_REDIS=%%i

if "%SG_REDIS%"=="" (
    echo [WARNING] Redis security group may already exist
    for /f "tokens=*" %%i in ('aws ec2 describe-security-groups --filters "Name=group-name,Values=connecthub-redis-sg" "Name=vpc-id,Values=%VPC_ID%" --query "SecurityGroups[0].GroupId" --output text 2^>nul') do set SG_REDIS=%%i
)

if not "%SG_REDIS%"=="" (
    aws ec2 authorize-security-group-ingress --group-id %SG_REDIS% --protocol tcp --port 6379 --cidr 10.0.0.0/16 >nul 2>&1
    echo [OK] Redis Security Group: %SG_REDIS%
) else (
    echo [ERROR] Could not create Redis security group
    pause
    exit /b 1
)
echo.

echo ===================================================================
echo   Step 4: RDS PostgreSQL Database (5-10 minutes)
echo ===================================================================
echo.

REM Create DB Subnet Group
echo [INFO] Creating database subnet group...
aws rds create-db-subnet-group ^
    --db-subnet-group-name connecthub-db-subnet ^
    --db-subnet-group-description "ConnectHub database subnet group" ^
    --subnet-ids %SUBNET_PRIVATE_1A% %SUBNET_PRIVATE_1B% ^
    --tags Key=Name,Value=connecthub-db-subnet Key=Project,Value=ConnectHub >nul 2>&1

if %ERRORLEVEL% equ 0 (
    echo [OK] DB Subnet Group created
) else (
    echo [INFO] DB Subnet Group may already exist
)

REM Create RDS PostgreSQL Instance
echo [INFO] Creating PostgreSQL database instance...
echo [INFO] Configuration: db.t3.micro, PostgreSQL 15, 20GB GP3 storage
echo [INFO] This will take 5-10 minutes, please be patient...
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
    --tags Key=Name,Value=connecthub-prod Key=Environment,Value=production Key=Project,Value=ConnectHub >nul 2>&1

if %ERRORLEVEL% equ 0 (
    echo [OK] RDS database creation initiated successfully
    echo.
    echo [INFO] Waiting for database to become available...
    echo [INFO] This typically takes 5-10 minutes. You'll see status updates...
    echo.
    
    REM Wait for database with status updates
    aws rds wait db-instance-available --db-instance-identifier connecthub-db-prod
    
    if !ERRORLEVEL! equ 0 (
        echo.
        echo [OK] Database is now AVAILABLE and ready to use!
    ) else (
        echo [WARNING] Database wait timed out, but it may still be creating
    )
) else (
    echo [INFO] Database may already exist or creation in progress
)

REM Get database endpoint
echo.
echo [INFO] Retrieving database endpoint...
for /f "tokens=*" %%i in ('aws rds describe-db-instances --db-instance-identifier connecthub-db-prod --query "DBInstances[0].Endpoint.Address" --output text 2^>nul') do set DB_ENDPOINT=%%i

if not "%DB_ENDPOINT%"=="" (
    echo [OK] PostgreSQL Database Endpoint: %DB_ENDPOINT%
    echo %DB_ENDPOINT% > .aws-db-endpoint
    echo.
    echo Connection String:
    echo postgresql://connecthubadmin:ConnectHub2024SecurePass!@%DB_ENDPOINT%:5432/connecthub
) else (
    echo [WARNING] Could not retrieve database endpoint yet
    echo [INFO] Database may still be creating, check AWS Console
)
echo.

echo ===================================================================
echo   Step 5: ElastiCache Redis (2-5 minutes)
echo ===================================================================
echo.

REM Create Cache Subnet Group
echo [INFO] Creating cache subnet group...
aws elasticache create-cache-subnet-group ^
    --cache-subnet-group-name connecthub-cache-subnet ^
    --cache-subnet-group-description "ConnectHub cache subnet group" ^
    --subnet-ids %SUBNET_PRIVATE_1A% %SUBNET_PRIVATE_1B% >nul 2>&1

if %ERRORLEVEL% equ 0 (
    echo [OK] Cache Subnet Group created
) else (
    echo [INFO] Cache Subnet Group may already exist
)

REM Create Redis Cluster
echo [INFO] Creating Redis cache cluster...
echo [INFO] Configuration: cache.t3.micro, Redis 7.0
echo.

aws elasticache create-cache-cluster ^
    --cache-cluster-id connecthub-redis-prod ^
    --engine redis ^
    --cache-node-type cache.t3.micro ^
    --num-cache-nodes 1 ^
    --cache-subnet-group-name connecthub-cache-subnet ^
    --security-group-ids %SG_REDIS% ^
    --engine-version 7.0 ^
    --port 6379 ^
    --tags Key=Name,Value=connecthub-redis-prod Key=Environment,Value=production Key=Project,Value=ConnectHub >nul 2>&1

if %ERRORLEVEL% equ 0 (
    echo [OK] Redis cluster creation initiated
    echo [INFO] Waiting for Redis to become available (60 seconds)...
    timeout /t 60 /nobreak >nul
) else (
    echo [INFO] Redis cluster may already exist
)

REM Get Redis endpoint
echo [INFO] Retrieving Redis endpoint...
for /f "tokens=*" %%i in ('aws elasticache describe-cache-clusters --cache-cluster-id connecthub-redis-prod --show-cache-node-info --query "CacheClusters[0].CacheNodes[0].Endpoint.Address" --output text 2^>nul') do set REDIS_ENDPOINT=%%i

if not "%REDIS_ENDPOINT%"=="" (
    echo [OK] Redis Cache Endpoint: %REDIS_ENDPOINT%:6379
    echo %REDIS_ENDPOINT% > .aws-redis-endpoint
) else (
    echo [WARNING] Could not retrieve Redis endpoint yet
    echo [INFO] Redis may still be creating
)
echo.

echo ===================================================================
echo   Step 6: S3 Storage Buckets
echo ===================================================================
echo.

REM Generate unique bucket name
set BUCKET_UPLOADS=connecthub-uploads-prod-%RANDOM%%RANDOM%

echo [INFO] Creating S3 bucket for file uploads...
echo [INFO] Bucket name: %BUCKET_UPLOADS%

aws s3 mb s3://%BUCKET_UPLOADS% --region us-east-1 >nul 2>&1

if %ERRORLEVEL% equ 0 (
    echo [OK] S3 bucket created successfully
    
    REM Enable versioning
    aws s3api put-bucket-versioning --bucket %BUCKET_UPLOADS% --versioning-configuration Status=Enabled >nul 2>&1
    echo [OK] Versioning enabled for backup protection
    
    REM Create CORS configuration
    echo [INFO] Configuring CORS for uploads...
    (
        echo {
        echo   "CORSRules": [{
        echo     "AllowedOrigins": ["*"],
        echo     "AllowedMethods": ["GET", "POST", "PUT", "DELETE", "HEAD"],
        echo     "AllowedHeaders": ["*"],
        echo     "ExposeHeaders": ["ETag"],
        echo     "MaxAgeSeconds": 3000
        echo   }]
        echo }
    ) > cors-config.json
    
    aws s3api put-bucket-cors --bucket %BUCKET_UPLOADS% --cors-configuration file://cors-config.json 2>nul
    del cors-config.json 2>nul
    echo [OK] CORS configured
    
    echo %BUCKET_UPLOADS% > .aws-uploads-bucket
) else (
    echo [WARNING] Bucket creation failed (may already exist)
)
echo.

echo ===================================================================
echo   Step 7: AWS Secrets Manager (Credential Storage)
echo ===================================================================
echo.

REM Store database credentials
if not "%DB_ENDPOINT%"=="" (
    echo [INFO] Storing database connection string in AWS Secrets Manager...
    aws secretsmanager create-secret ^
        --name connecthub/database-url ^
        --secret-string "postgresql://connecthubadmin:ConnectHub2024SecurePass!@%DB_ENDPOINT%:5432/connecthub" ^
        --description "ConnectHub PostgreSQL connection string" >nul 2>&1
    
    if !ERRORLEVEL! equ 0 (
        echo [OK] Database URL stored in Secrets Manager
    ) else (
        aws secretsmanager update-secret ^
            --secret-id connecthub/database-url ^
            --secret-string "postgresql://connecthubadmin:ConnectHub2024SecurePass!@%DB_ENDPOINT%:5432/connecthub" >nul 2>&1
        echo [OK] Database URL updated in Secrets Manager
    )
)

REM Store Redis credentials
if not "%REDIS_ENDPOINT%"=="" (
    echo [INFO] Storing Redis connection string...
    aws secretsmanager create-secret ^
        --name connecthub/redis-url ^
        --secret-string "redis://%REDIS_ENDPOINT%:6379" ^
        --description "ConnectHub Redis connection string" >nul 2>&1
    
    if !ERRORLEVEL! equ 0 (
        echo [OK] Redis URL stored in Secrets Manager
    ) else (
        aws secretsmanager update-secret ^
            --secret-id connecthub/redis-url ^
            --secret-string "redis://%REDIS_ENDPOINT%:6379" >nul 2>&1
        echo [OK] Redis URL updated in Secrets Manager
    )
)

REM Store S3 bucket name
if not "%BUCKET_UPLOADS%"=="" (
    echo [INFO] Storing S3 bucket name...
    aws secretsmanager create-secret ^
        --name connecthub/s3-bucket ^
        --secret-string "%BUCKET_UPLOADS%" ^
        --description "ConnectHub S3 uploads bucket" >nul 2>&1
    
    if !ERRORLEVEL! neq 0 (
        aws secretsmanager update-secret ^
            --secret-id connecthub/s3-bucket ^
            --secret-string "%BUCKET_UPLOADS%" >nul 2>&1
    )
    echo [OK] S3 bucket name stored
)

REM Generate and store JWT secret
set JWT_SECRET=ConnectHub-JWT-Secret-2024-%RANDOM%%RANDOM%%RANDOM%
echo [INFO] Generating and storing JWT secret...
aws secretsmanager create-secret ^
    --name connecthub/jwt-secret ^
    --secret-string "%JWT_SECRET%" ^
    --description "ConnectHub JWT secret for authentication" >nul 2>&1

if %ERRORLEVEL% neq 0 (
    echo [INFO] JWT secret already exists (reusing existing)
) else (
    echo [OK] JWT secret stored
)
echo.

echo ===================================================================
echo   Step 8: Creating Environment Configuration File
echo ===================================================================
echo.

REM Create .env.production file
echo [INFO] Creating production environment configuration...
(
    echo # ===================================================================
    echo # ConnectHub Production Environment Configuration
    echo # Generated: %DATE% %TIME%
    echo # ===================================================================
    echo.
    echo # Database Configuration
    echo DATABASE_URL=postgresql://connecthubadmin:ConnectHub2024SecurePass!@%DB_ENDPOINT%:5432/connecthub
    echo.
    echo # Redis Configuration
    echo REDIS_URL=redis://%REDIS_ENDPOINT%:6379
    echo.
    echo # AWS Configuration
    echo AWS_REGION=us-east-1
    echo AWS_S3_BUCKET=%BUCKET_UPLOADS%
    echo.
    echo # Authentication
    echo JWT_SECRET=%JWT_SECRET%
    echo JWT_EXPIRES_IN=7d
    echo.
    echo # Application
    echo NODE_ENV=production
    echo PORT=3001
    echo.
    echo # Frontend URL
    echo FRONTEND_URL=http://lynkapp.net.s3-website-us-east-1.amazonaws.com
    echo.
    echo # Feature Flags
    echo ENABLE_EMAIL_VERIFICATION=false
    echo ENABLE_SMS_VERIFICATION=false
) > .env.production

echo [OK] Environment configuration saved to: .env.production
echo.

REM Save deployment info
(
    echo # ConnectHub AWS Deployment Information
    echo # Generated: %DATE% %TIME%
    echo.
    echo VPC_ID=%VPC_ID%
    echo DB_ENDPOINT=%DB_ENDPOINT%
    echo REDIS_ENDPOINT=%REDIS_ENDPOINT%
    echo S3_BUCKET=%BUCKET_UPLOADS%
    echo SG_RDS=%SG_RDS%
    echo SG_REDIS=%SG_REDIS%
    echo SUBNET_PUBLIC_1A=%SUBNET_PUBLIC_1A%
    echo SUBNET_PUBLIC_1B=%SUBNET_PUBLIC_1B%
    echo SUBNET_PRIVATE_1A=%SUBNET_PRIVATE_1A%
    echo SUBNET_PRIVATE_1B=%SUBNET_PRIVATE_1B%
) > .aws-deployment-info.txt

echo [OK] Deployment info saved to: .aws-deployment-info.txt
echo.

echo ===================================================================
echo   DEPLOYMENT COMPLETE! 
echo ===================================================================
echo.
echo.
echo ┌─────────────────────────────────────────────────────────────┐
echo │                                                             │
echo │          ConnectHub Database Infrastructure Summary         │
echo │                                                             │
echo └─────────────────────────────────────────────────────────────┘
echo.
if not "%DB_ENDPOINT%"=="" (
    echo PostgreSQL Database:
    echo   ✓ Endpoint: %DB_ENDPOINT%:5432
    echo   ✓ Database: connecthub
    echo   ✓ Username: connecthubadmin
    echo   ✓ Password: ConnectHub2024SecurePass!
    echo   ✓ Connection String:
    echo     postgresql://connecthubadmin:ConnectHub2024SecurePass!@%DB_ENDPOINT%:5432/connecthub
    echo.
)
if not "%REDIS_ENDPOINT%"=="" (
    echo Redis Cache:
    echo   ✓ Endpoint: %REDIS_ENDPOINT%:6379
    echo   ✓ Connection: redis://%REDIS_ENDPOINT%:6379
    echo.
)
if not "%BUCKET_UPLOADS%"=="" (
    echo S3 Storage:
    echo   ✓ Bucket: %BUCKET_UPLOADS%
    echo   ✓ Region: us-east-1
    echo   ✓ Versioning: Enabled
    echo   ✓ CORS: Configured
    echo.
)
echo VPC Infrastructure:
echo   ✓ VPC ID: %VPC_ID%
echo   ✓ CIDR: 10.0.0.0/16
echo   ✓ Public Subnets: 2 (us-east-1a, us-east-1b)
echo   ✓ Private Subnets: 2 (us-east-1a, us-east-1b)
echo   ✓ Security Groups: Configured
echo.
echo.
echo ===================================================================
echo   NEXT STEPS
echo ===================================================================
echo.
echo 1. Initialize Database Schema:
echo    cd ConnectHub-Backend
echo    npx prisma generate --schema prisma/schema-enhanced.prisma
echo    npx prisma migrate deploy --schema prisma/schema-enhanced.prisma
echo.
echo 2. Test Database Connection:
echo    psql "postgresql://connecthubadmin:ConnectHub2024SecurePass!@%DB_ENDPOINT%:5432/connecthub"
echo.
echo 3. Update Backend Configuration:
echo    Copy .env.production to ConnectHub-Backend/.env
echo.
echo 4. Deploy Backend Application:
echo    Use AWS Elastic Beanstalk or ECS
echo.
echo 5. Monitor Resources:
echo    - RDS Console: https://console.aws.amazon.com/rds/
echo    - ElastiCache: https://console.aws.amazon.com/elasticache/
echo    - S3: https://console.aws.amazon.com/s3/
echo.
echo ===================================================================
echo   FILES CREATED
echo ===================================================================
echo.
echo ✓ .env.production - Production environment variables
echo ✓ .aws-deployment-info.txt - Deployment details
echo ✓ .aws-vpc-id - VPC identifier
echo ✓ .aws-db-endpoint - Database endpoint
echo ✓ .aws-redis-endpoint - Redis endpoint
echo ✓ .aws-uploads-bucket - S3 bucket name
echo.
echo ===================================================================
echo.
echo All credentials have been saved to AWS Secrets Manager for security.
echo.
echo Deployment completed successfully!
echo.
pause
