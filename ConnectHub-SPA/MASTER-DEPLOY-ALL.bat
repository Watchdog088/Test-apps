@echo off
title LynkApp - MASTER DEPLOY ALL
cd /d "%~dp0"
echo ============================================
echo  MASTER DEPLOY - Full LynkApp Deployment
echo  Builds + Deploys Everything to Firebase
echo ============================================
echo.

echo [1/5] Installing dependencies...
call npm install --silent
cd functions && call npm install --silent && cd ..
echo ✅ Dependencies ready

echo.
echo [2/5] Building production bundle...
call npm run build
if %ERRORLEVEL% NEQ 0 (
  echo ❌ Build failed! Fix errors then re-run.
  pause & exit /b 1
)
echo ✅ Build complete

echo.
echo [3/5] Deploying Firestore rules + indexes...
call npx firebase-tools deploy --only firestore --project lynkapp-c7db1
echo ✅ Firestore rules + indexes deployed

echo.
echo [4/5] Deploying Storage rules + Functions...
call npx firebase-tools deploy --only storage,functions --project lynkapp-c7db1
echo ✅ Storage + Functions deployed

echo.
echo [5/5] Deploying to Firebase Hosting...
call npx firebase-tools deploy --only hosting --project lynkapp-c7db1
if %ERRORLEVEL% NEQ 0 (
  echo ❌ Hosting deploy failed!
  pause & exit /b 1
)

echo.
echo ============================================
echo  ✅ ALL DEPLOYED SUCCESSFULLY!
echo  🌐 https://lynkapp-c7db1.web.app
echo ============================================
pause
