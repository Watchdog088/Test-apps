@echo off
title LynkApp - Deploy Functions Only
cd /d "%~dp0"
echo ============================================
echo  Deploy Cloud Functions Only
echo ============================================
echo.

echo Installing Functions dependencies...
cd functions
call npm install --silent
cd ..

echo.
echo Deploying Cloud Functions...
call npx firebase-tools deploy --only functions --project lynkapp-c7db1

echo.
echo ✅ Functions deployed!
pause
