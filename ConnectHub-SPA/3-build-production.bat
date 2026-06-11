@echo off
title LynkApp - Production Build
cd /d "%~dp0"
echo ============================================
echo  STEP 3 - Build Production Bundle
echo ============================================
echo.

echo Installing dependencies...
call npm install --silent
echo ✅ Dependencies installed

echo.
echo Building production bundle (this takes 1-2 minutes)...
call npm run build
if %ERRORLEVEL% NEQ 0 (
  echo ❌ BUILD FAILED! Check errors above.
  pause
  exit /b 1
)

echo.
echo ✅ Production build complete!
echo    Output: ConnectHub-SPA\dist\
echo.
dir dist /b
pause
