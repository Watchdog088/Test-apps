@echo off
title LynkApp - Build + Deploy (Full)
cd /d "%~dp0"
echo ============================================
echo  Build + Deploy to Firebase Hosting
echo ============================================
echo.

echo [1/2] Building production bundle...
call npm install --silent
call npm run build
if %ERRORLEVEL% NEQ 0 (
  echo ❌ Build failed!
  pause
  exit /b 1
)
echo ✅ Build complete

echo.
echo [2/2] Deploying to Firebase Hosting...
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
