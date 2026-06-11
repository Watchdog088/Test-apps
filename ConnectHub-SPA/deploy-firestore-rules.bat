@echo off
title LynkApp - Deploy Firestore Rules
cd /d "%~dp0"
echo ============================================
echo  Deploy Firestore Security Rules
echo ============================================
echo.
call npx firebase-tools deploy --only firestore:rules --project lynkapp-c7db1
echo.
echo ✅ Firestore rules deployed!
pause
