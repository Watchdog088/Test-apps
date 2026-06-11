@echo off
title LynkApp - Quick Build + Deploy
cd /d "%~dp0"
echo ============================================
echo  LynkApp — Build + Deploy to Firebase
echo ============================================
echo.

echo Building...
call npm run build
if %ERRORLEVEL% NEQ 0 ( echo ❌ Build failed! & pause & exit /b 1 )

echo Deploying hosting...
call npx firebase-tools deploy --only hosting --project lynkapp-c7db1
if %ERRORLEVEL% NEQ 0 ( echo ❌ Deploy failed! & pause & exit /b 1 )

echo.
echo ✅ Live at https://lynkapp-c7db1.web.app
pause
