@echo off
echo ============================================
echo  STEP 4 — Deploy to Firebase Hosting
echo  (Pushes to https://lynkapp.net)
echo ============================================
echo.
echo Deploying dist/ folder to Firebase Hosting...
echo.
cd /d "%~dp0"
"C:\Users\Jnewball\AppData\Roaming\npm\firebase.cmd" deploy --only hosting
if %errorlevel% neq 0 (
  echo.
  echo ============================================
  echo  DEPLOY FAILED!
  echo  Most common cause: not logged in.
  echo  Fix: Double-click 1-firebase-login.bat first.
  echo ============================================
  pause
  exit /b 1
)
echo.
echo ============================================
echo  DEPLOYED SUCCESSFULLY!
echo  Your app is live at:  https://lynkapp.net
echo.
echo  Open your browser and check it now.
echo ============================================
pause
