@echo off
title LynkApp - Set CEO Admin Role
cd /d "%~dp0"
echo ============================================
echo  Set CEO / Admin Role in Firebase
echo ============================================
echo.
echo Running admin seed script...
node seed-ceo-admin.cjs 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo Trying CJS version...
  node seed-admin-rest.cjs 2>&1
)
echo.
echo ✅ Done! Check Firebase Console to verify.
pause
