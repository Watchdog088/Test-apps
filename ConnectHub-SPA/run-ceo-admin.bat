@echo off
title LynkApp — Create CEO Admin Account
color 0A
cls

echo.
echo  ============================================
echo   LynkApp CEO Admin Account Setup
echo  ============================================
echo.
echo  This will create the account:
echo    Email    : CEO@lynkapp.net
echo    Password : LynkApp@CEO2026!  (change after login!)
echo    Role     : admin (full access)
echo.
echo  REQUIREMENT: serviceAccountKey.json must be in
echo  this folder (ConnectHub-SPA/)
echo.
echo  To get it:
echo    1. Go to https://console.firebase.google.com
echo    2. Project Settings ^> Service Accounts
echo    3. Click "Generate new private key"
echo    4. Save file as:  ConnectHub-SPA\serviceAccountKey.json
echo.
echo  Press any key to run the script, or Ctrl+C to cancel...
pause > nul

echo.
echo  Installing firebase-admin (if needed)...
cd /d "%~dp0"
cd functions
call npm install --silent 2>nul
cd ..

echo.
echo  Running seed script...
echo  ============================================
node seed-ceo-admin.js

echo.
echo  ============================================
if %ERRORLEVEL% EQU 0 (
  echo   SUCCESS! Your CEO admin account is ready.
  echo.
  echo   Login at: http://localhost:5173/login
  echo   Email   : CEO@lynkapp.net
  echo   Password: LynkApp@CEO2026!
  echo.
  echo   IMPORTANT: Change your password after first login!
  echo   IMPORTANT: Delete serviceAccountKey.json when done!
) else (
  echo   FAILED. Check the error above.
  echo   Make sure serviceAccountKey.json is in ConnectHub-SPA/
)
echo  ============================================
echo.
pause
