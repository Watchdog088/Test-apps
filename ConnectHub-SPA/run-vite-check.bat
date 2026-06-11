@echo off
title LynkApp - Vite Build Check
cd /d "%~dp0"
echo ============================================
echo  Vite Build Check (No Deploy)
echo ============================================
echo.
call npm run build 2>&1
if %ERRORLEVEL% EQU 0 (
  echo.
  echo ✅ Build PASSED - No errors!
) else (
  echo.
  echo ❌ Build FAILED - Fix errors above before deploying.
)
pause
