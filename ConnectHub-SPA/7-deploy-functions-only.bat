@echo off
echo ============================================
echo  Deploy Cloud Functions Only
echo  (Use after editing functions/index.js)
echo ============================================
echo.
cd /d "%~dp0functions"
echo Installing function dependencies...
call npm install
cd /d "%~dp0"
echo.
echo Deploying functions...
"C:\Users\Jnewball\AppData\Roaming\npm\firebase.cmd" deploy --only functions
if %errorlevel% neq 0 (
  echo.
  echo ERROR deploying functions. Run 1-firebase-login.bat first.
  pause
  exit /b 1
)
echo.
echo ============================================
echo  Cloud Functions deployed successfully!
echo ============================================
pause
