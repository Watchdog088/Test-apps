@echo off
title LynkApp - Deploy Firestore Indexes
cd /d "%~dp0"
echo ============================================
echo  Deploy Firestore Indexes
echo ============================================
echo.
call npx firebase-tools deploy --only firestore:indexes --project lynkapp-c7db1
echo.
echo ✅ Firestore indexes deployed!
echo Note: Index builds may take a few minutes in Firebase Console.
pause
