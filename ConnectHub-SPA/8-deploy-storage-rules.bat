@echo off
title LynkApp - Deploy Storage Rules
cd /d "%~dp0"
echo ============================================
echo  Deploy Firebase Storage Rules
echo ============================================
echo.
call npx firebase-tools deploy --only storage --project lynkapp-c7db1
echo.
echo ✅ Storage rules deployed!
pause
