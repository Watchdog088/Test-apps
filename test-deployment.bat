@echo off
REM ===================================================================
REM Test Database Connection and Deployment
REM ===================================================================
echo.
echo ===================================================================
echo   LynkApp Deployment Testing Suite
echo ===================================================================
echo.

REM ===================================================================
REM Test 1: Check Database Status
REM ===================================================================
echo [TEST 1] Checking database status...
echo.

aws rds describe-db-instances --db-instance-identifier lynkapp-db --query "DBInstances[0].[DBInstanceIdentifier,DBInstanceStatus,Endpoint.Address]" --output table 2>nul

if %ERRORLEVEL% equ 0 (
    echo [PASS] Database found and accessible
    
    REM Get endpoint for later tests
    aws rds describe-db-instances --db-instance-identifier lynkapp-db --query "DBInstances[0].Endpoint.Address" --output text > db-test-endpoint.txt 2>nul
    set /p TEST_DB_ENDPOINT=<db-test-endpoint.txt
    
    echo Database Endpoint: %TEST_DB_ENDPOINT%
) else (
    echo [FAIL] Cannot access database
    echo Check if database exists: aws rds describe-db-instances
)

echo.

REM ===================================================================
REM Test 2: Check S3 Bucket
REM ===================================================================
echo [TEST 2] Checking S3 bucket...
echo.

aws s3 ls | findstr lynkapp

if %ERRORLEVEL% equ 0 (
    echo [PASS] S3 bucket found
) else (
    echo [FAIL] No S3 bucket found
)

echo.

REM ===================================================================
REM Test 3: Check Backend Configuration
REM ===================================================================
echo [TEST 3] Checking backend configuration...
echo.

if exist "ConnectHub-Backend\.env" (
    echo [PASS] Backend .env file exists
    echo.
    echo Configuration preview:
    findstr /C:"DATABASE_URL" ConnectHub-Backend\.env
    findstr /C:"AWS_S3_BUCKET" ConnectHub-Backend\.env
    findstr /C:"NODE_ENV" ConnectHub-Backend\.env
) else (
    echo [FAIL] Backend .env file not found
    echo Run: deploy-backend-to-aws.bat
)

echo.

REM ===================================================================
REM Test 4: Test Database Connection (if psql is installed)
REM ===================================================================
echo [TEST 4] Testing database connection...
echo.

where psql >nul 2>&1
if %ERRORLEVEL% equ 0 (
    if not "%TEST_DB_ENDPOINT%"=="" (
        echo Testing PostgreSQL connection...
        echo Running: psql -h %TEST_DB_ENDPOINT% -U lynkadmin -d lynkapp -c "\conninfo"
        echo.
        echo NOTE: You will be prompted for password: Lynkapp2024!
        echo.
        
        set PGPASSWORD=Lynkapp2024!
        psql -h %TEST_DB_ENDPOINT% -U lynkadmin -d lynkapp -c "\conninfo" 2>nul
        
        if !ERRORLEVEL! equ 0 (
            echo [PASS] Database connection successful!
        ) else (
            echo [FAIL] Could not connect to database
            echo This might be normal if database is not publicly accessible
        )
    )
) else (
    echo [SKIP] psql not installed - cannot test direct connection
    echo Install PostgreSQL client to test: https://www.postgresql.org/download/
)

echo.

REM ===================================================================
REM Test 5: Check if Backend is Running Locally
REM ===================================================================
echo [TEST 5] Checking if backend is running locally...
echo.

curl http://localhost:3001/health 2>nul | findstr /C:"ok" >nul

if %ERRORLEVEL% equ 0 (
    echo [PASS] Backend is running on localhost:3001
    echo.
    echo Testing API endpoint...
    curl http://localhost:3001/health
) else (
    echo [INFO] Backend not running locally
    echo To start: cd ConnectHub-Backend ^&^& npm start
)

echo.

REM ===================================================================
REM Test 6: Check Elastic Beanstalk Status (if deployed)
REM ===================================================================
echo [TEST 6] Checking Elastic Beanstalk deployment...
echo.

where eb >nul 2>&1
if %ERRORLEVEL% equ 0 (
    cd ConnectHub-Backend 2>nul
    
    if exist ".elasticbeanstalk" (
        echo Checking EB environment status...
        call eb status 2>nul
        
        if !ERRORLEVEL! equ 0 (
            echo [PASS] Elastic Beanstalk environment found
        ) else (
            echo [INFO] No active EB environment
        )
    ) else (
        echo [INFO] No Elastic Beanstalk configuration found
    )
    
    cd ..
) else (
    echo [SKIP] EB CLI not installed
)

echo.

REM ===================================================================
REM Test 7: Test Node.js Connection Script
REM ===================================================================
echo [TEST 7] Creating Node.js test script...
echo.

REM Create a simple connection test script
if not "%TEST_DB_ENDPOINT%"=="" (
    (
        echo const { Client } = require('pg'^);
        echo.
        echo const client = new Client({
        echo   host: '%TEST_DB_ENDPOINT%',
        echo   port: 5432,
        echo   database: 'lynkapp',
        echo   user: 'lynkadmin',
        echo   password: 'Lynkapp2024!'
        echo }^);
        echo.
        echo async function testConnection(^) {
        echo   try {
        echo     await client.connect(^);
        echo     console.log('✅ Database connection successful!'^);
        echo     const result = await client.query('SELECT NOW(^)'^);
        echo     console.log('📅 Server time:', result.rows[0].now^);
        echo     await client.end(^);
        echo     process.exit(0^);
        echo   } catch (err^) {
        echo     console.error('❌ Connection failed:', err.message^);
        echo     process.exit(1^);
        echo   }
        echo }
        echo.
        echo testConnection(^);
    ) > test-db-connection.js
    
    echo Created test-db-connection.js
    echo.
    echo To test database connection with Node.js:
    echo 1. npm install pg
    echo 2. node test-db-connection.js
)

echo.

REM ===================================================================
REM Summary
REM ===================================================================
echo ===================================================================
echo   TEST SUMMARY
echo ===================================================================
echo.

if exist "backend-deployment-info.txt" (
    echo Deployment Information:
    type backend-deployment-info.txt
    echo.
)

echo Quick Reference Commands:
echo ========================
echo.
echo Check database:
echo   aws rds describe-db-instances --db-instance-identifier lynkapp-db
echo.
echo Check S3:
echo   aws s3 ls ^| findstr lynkapp
echo.
echo Start backend locally:
echo   cd ConnectHub-Backend
echo   npm start
echo.
echo Test API locally:
echo   curl http://localhost:3001/health
echo.
echo Check EB deployment:
echo   cd ConnectHub-Backend
echo   eb status
echo   eb open
echo.

echo ===================================================================
echo.

REM Cleanup
if exist "db-test-endpoint.txt" del db-test-endpoint.txt

pause
