@echo off
title LynkApp - Deploy to Firebase Hosting
cd /d "%~dp0"
echo ============================================
echo  STEP 4 - Deploy to Firebase Hosting
echo ============================================
echo.

if not exist "dist\index.html" (
  echo ❌ dist\ folder not found. Run 3-build-production.bat first!
  pause
  exit /b 1
)

echo Deploying to Firebase Hosting...
call npx firebase-tools deploy --only hosting --project lynkapp-c7db1
if %ERRORLEVEL% NEQ 0 (
  echo ❌ Deploy failed!
  pause
  exit /b 1
)

echo.
echo ============================================
echo  ✅ LIVE at https://lynkapp-c7db1.web.app
echo ============================================
pause
