@echo off
title LynkApp - Fix Node/NPM PATH
echo ============================================
echo  Fix Node.js / npm PATH permanently
echo ============================================
echo.

echo Checking Node.js installation...
where node 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo Node.js not found on PATH.
  echo Please install Node.js from: https://nodejs.org
  echo Choose LTS version (18 or 20).
  pause & exit /b 1
)

echo Checking npm...
where npm 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo npm not found. Reinstall Node.js.
  pause & exit /b 1
)

echo.
echo ✅ Node.js and npm are on PATH.
node --version
npm --version

echo.
echo Installing firebase-tools globally (if not installed)...
call npm install -g firebase-tools

echo.
echo ✅ PATH is working correctly!
pause
