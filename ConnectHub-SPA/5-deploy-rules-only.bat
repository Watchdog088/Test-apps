@echo off
title LynkApp - Deploy Rules Only
cd /d "%~dp0"
echo ============================================
echo  Deploy Firestore + Storage Rules Only
echo ============================================
echo.

echo Deploying Firestore rules...
call npx firebase-tools deploy --only firestore:rules --project lynkapp-c7db1

echo.
echo Deploying Storage rules...
call npx firebase-tools deploy --only storage --project lynkapp-c7db1

echo.
echo ✅ Security rules deployed!
pause
