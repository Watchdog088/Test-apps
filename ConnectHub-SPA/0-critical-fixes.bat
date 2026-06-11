@echo off
title LynkApp - Critical Pre-Launch Fixes
cd /d "%~dp0"
echo ============================================
echo  Critical Fixes Before Beta Launch
echo ============================================
echo.

echo [1/3] Deploying latest Firestore security rules...
call npx firebase-tools deploy --only firestore:rules --project lynkapp-c7db1
echo ✅ Firestore rules updated

echo.
echo [2/3] Deploying latest Firestore indexes...
call npx firebase-tools deploy --only firestore:indexes --project lynkapp-c7db1
echo ✅ Indexes deployed (building in background)

echo.
echo [3/3] Deploying storage rules...
call npx firebase-tools deploy --only storage --project lynkapp-c7db1
echo ✅ Storage rules updated

echo.
echo ============================================
echo  ✅ Critical fixes applied!
echo  Now run: 6-build-and-deploy.bat
echo ============================================
pause
