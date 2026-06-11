@echo off
title LynkApp - Firebase Login
cd /d "%~dp0"
echo ============================================
echo  STEP 1 - Firebase Login
echo ============================================
echo.
echo Logging in to Firebase...
call npx firebase-tools@latest login
echo.
echo Verifying project: lynkapp-c7db1
call npx firebase-tools use lynkapp-c7db1
echo.
echo ✅ Firebase login complete!
pause
