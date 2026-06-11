@echo off
title LynkApp - Deploy Changes (Quick)
cd /d "%~dp0"
echo ============================================
echo  Deploy Latest Changes to Firebase Hosting
echo ============================================
echo.

if not exist "dist\index.html" (
  echo dist not found - building first...
  call npm run build
  if %ERRORLEVEL% NEQ 0 ( echo Build failed! & pause & exit /b 1 )
) else (
  echo Rebuilding with latest changes...
  call npm run build
  if %ERRORLEVEL% NEQ 0 ( echo Build failed! & pause & exit /b 1 )
)

echo.
echo Deploying...
call npx firebase-tools deploy --only hosting --project lynkapp-c7db1

echo.
echo ✅ Changes are live at https://lynkapp-c7db1.web.app
pause
