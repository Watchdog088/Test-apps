@echo off
echo ============================================
echo  Deploy Storage Rules Only
echo  (Use after editing storage.rules)
echo ============================================
echo.
cd /d "%~dp0"
"C:\Users\Jnewball\AppData\Roaming\npm\firebase.cmd" deploy --only storage
if %errorlevel% neq 0 (
  echo.
  echo ERROR deploying storage rules. Run 1-firebase-login.bat first.
  pause
  exit /b 1
)
echo.
echo ============================================
echo  Storage rules deployed successfully!
echo ============================================
pause
