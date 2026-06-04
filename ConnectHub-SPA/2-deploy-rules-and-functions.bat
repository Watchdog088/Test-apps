@echo off
echo ============================================
echo  STEP 2 — Deploy Firestore Rules + Functions
echo ============================================
echo.
echo Installing Cloud Function dependencies...
echo.
cd /d "%~dp0functions"
call npm install
if %errorlevel% neq 0 (
  echo.
  echo ERROR: npm install failed in functions folder.
  echo Make sure Node.js is installed and try again.
  pause
  exit /b 1
)

cd /d "%~dp0"

echo.
echo Deploying Firestore security rules...
"C:\Users\Jnewball\AppData\Roaming\npm\firebase.cmd" deploy --only firestore:rules
if %errorlevel% neq 0 (
  echo.
  echo ERROR deploying rules. Did you run 1-firebase-login.bat first?
  pause
  exit /b 1
)

echo.
echo Deploying Cloud Functions (setAdminRole, etc.)...
"C:\Users\Jnewball\AppData\Roaming\npm\firebase.cmd" deploy --only functions
if %errorlevel% neq 0 (
  echo.
  echo ERROR deploying functions.
  echo Check the error message above.
  pause
  exit /b 1
)

echo.
echo ============================================
echo  SUCCESS!
echo  Rules + Functions deployed to Firebase.
echo.
echo  NEXT: 
echo   1. Download serviceAccountKey.json from
echo      Firebase Console > Project Settings >
echo      Service Accounts > Generate new key
echo   2. Put it in this folder (ConnectHub-SPA/)
echo   3. Double-click run-ceo-admin.bat
echo ============================================
pause
