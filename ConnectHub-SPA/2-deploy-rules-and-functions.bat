@echo off
title LynkApp - Deploy Rules & Functions
cd /d "%~dp0"
echo ============================================
echo  STEP 2 - Deploy Firestore Rules + Functions
echo ============================================
echo.

echo [1/3] Installing Functions dependencies...
cd functions
call npm install --silent
cd ..
echo ✅ Functions deps installed

echo.
echo [2/3] Deploying Firestore security rules...
call npx firebase-tools deploy --only firestore:rules --project lynkapp-c7db1
echo ✅ Firestore rules deployed

echo.
echo [3/3] Deploying Storage rules...
call npx firebase-tools deploy --only storage --project lynkapp-c7db1
echo ✅ Storage rules deployed

echo.
echo [4/4] Deploying Cloud Functions...
call npx firebase-tools deploy --only functions --project lynkapp-c7db1
echo ✅ Functions deployed

echo.
echo ============================================
echo  ✅ Rules + Functions deploy COMPLETE!
echo ============================================
pause
