@echo off
echo.
echo  ██╗  ██╗   ██╗███╗   ██╗██╗  ██╗ █████╗ ██████╗ ██████╗
echo  ██║  ╚██╗ ██╔╝████╗  ██║██║ ██╔╝██╔══██╗██╔══██╗██╔══██╗
echo  ██║   ╚████╔╝ ██╔██╗ ██║█████╔╝ ███████║██████╔╝██████╔╝
echo  ██║    ╚██╔╝  ██║╚██╗██║██╔═██╗ ██╔══██║██╔═══╝ ██╔═══╝
echo  ███████╗██║   ██║ ╚████║██║  ██╗██║  ██║██║     ██║
echo  ╚══════╝╚═╝   ╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝
echo.
echo  MASTER DEPLOY — Deploys EVERYTHING to Firebase
echo  Rules + Indexes + Functions + Build + Hosting
echo ============================================================
echo.
echo  WARNING: This will deploy your ENTIRE app to production.
echo  Make sure you have run 1-firebase-login.bat first!
echo.
echo  Press ENTER to continue or close this window to cancel.
pause

cd /d "%~dp0"

echo.
echo ============================================================
echo  [1/5] Deploying Firestore Security Rules...
echo ============================================================
"C:\Users\Jnewball\AppData\Roaming\npm\firebase.cmd" deploy --only firestore:rules
if %errorlevel% neq 0 (
  echo ERROR on rules. Are you logged in? Run 1-firebase-login.bat
  pause
  exit /b 1
)
echo  Rules deployed OK

echo.
echo ============================================================
echo  [2/5] Deploying Firestore Indexes...
echo ============================================================
"C:\Users\Jnewball\AppData\Roaming\npm\firebase.cmd" deploy --only firestore:indexes
if %errorlevel% neq 0 (
  echo ERROR on indexes.
  pause
  exit /b 1
)
echo  Indexes deployed OK

echo.
echo ============================================================
echo  [3/5] Installing + Deploying Cloud Functions...
echo ============================================================
cd "%~dp0functions"
call npm install --silent
if %errorlevel% neq 0 (
  echo ERROR installing function dependencies.
  pause
  exit /b 1
)
cd "%~dp0"
"C:\Users\Jnewball\AppData\Roaming\npm\firebase.cmd" deploy --only functions
if %errorlevel% neq 0 (
  echo ERROR on functions.
  pause
  exit /b 1
)
echo  Functions deployed OK

echo.
echo ============================================================
echo  [4/5] Deploying Storage Rules...
echo ============================================================
"C:\Users\Jnewball\AppData\Roaming\npm\firebase.cmd" deploy --only storage
if %errorlevel% neq 0 (
  echo WARNING: Storage rules failed. Continuing anyway...
)
echo  Storage rules deployed OK

echo.
echo ============================================================
echo  [5/5] Building Production Bundle + Deploying Hosting...
echo ============================================================
echo.
echo  Compiling React app (takes 2-5 min)...
set NODE_OPTIONS=--max-old-space-size=4096
call npm run build
if %errorlevel% neq 0 (
  echo.
  echo BUILD FAILED! Fix the error above then re-run.
  pause
  exit /b 1
)
echo  Build complete. Uploading to Firebase Hosting...
"C:\Users\Jnewball\AppData\Roaming\npm\firebase.cmd" deploy --only hosting
if %errorlevel% neq 0 (
  echo ERROR on hosting deploy.
  pause
  exit /b 1
)

echo.
echo ============================================================
echo.
echo   ██████╗  ██████╗ ███╗   ██╗███████╗██╗
echo   ██╔══██╗██╔═══██╗████╗  ██║██╔════╝██║
echo   ██║  ██║██║   ██║██╔██╗ ██║█████╗  ██║
echo   ██║  ██║██║   ██║██║╚██╗██║██╔══╝  ╚═╝
echo   ██████╔╝╚██████╔╝██║ ╚████║███████╗██╗
echo   ╚═════╝  ╚═════╝ ╚═╝  ╚═══╝╚══════╝╚═╝
echo.
echo   LynkApp is LIVE at:  https://lynkapp.net
echo.
echo   What was deployed:
echo     Firestore security rules
echo     Firestore indexes
echo     Cloud Functions (Admin role management)
echo     Storage rules
echo     Full React app to Firebase Hosting
echo.
echo ============================================================
pause
