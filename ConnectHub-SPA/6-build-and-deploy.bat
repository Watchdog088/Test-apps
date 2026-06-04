@echo off
echo ============================================
echo  BUILD + DEPLOY  (Use after ANY code change)
echo  Builds the app then pushes to lynkapp.net
echo ============================================
echo.

cd /d "%~dp0"

echo [1/2] Building production bundle...
echo.
set NODE_OPTIONS=--max-old-space-size=4096
call npm run build
if %errorlevel% neq 0 (
  echo.
  echo ============================================
  echo  BUILD FAILED — Deploy cancelled.
  echo  Fix the error shown above, then try again.
  echo ============================================
  pause
  exit /b 1
)

echo.
echo [2/2] Deploying to Firebase Hosting...
echo.
"C:\Users\Jnewball\AppData\Roaming\npm\firebase.cmd" deploy --only hosting
if %errorlevel% neq 0 (
  echo.
  echo ============================================
  echo  DEPLOY FAILED!
  echo  Make sure you ran 1-firebase-login.bat first.
  echo ============================================
  pause
  exit /b 1
)

echo.
echo ============================================
echo  ALL DONE!
echo  App is live at:  https://lynkapp.net
echo ============================================
pause
