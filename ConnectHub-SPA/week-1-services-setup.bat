@echo off
title LynkApp - Week 1 Services Setup
cd /d "%~dp0"
echo ============================================
echo  WEEK 1 - Web Beta Services Setup
echo ============================================
echo.

echo [1/4] Installing all dependencies...
call npm install
cd functions && call npm install && cd ..
echo ✅ Dependencies installed

echo.
echo [2/4] Deploying Firestore rules + indexes...
call npx firebase-tools deploy --only firestore --project lynkapp-c7db1
echo ✅ Firestore configured

echo.
echo [3/4] Deploying Storage rules...
call npx firebase-tools deploy --only storage --project lynkapp-c7db1
echo ✅ Storage configured

echo.
echo [4/4] Deploying Cloud Functions...
call npx firebase-tools deploy --only functions --project lynkapp-c7db1
echo ✅ Functions deployed

echo.
echo ============================================
echo  ✅ Week 1 Setup COMPLETE!
echo  Next: Run 6-build-and-deploy.bat to go live
echo ============================================
pause
