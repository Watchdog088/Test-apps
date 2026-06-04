@echo off
echo ============================================
echo  Deploy Firestore Indexes
echo  (Use after editing firestore.indexes.json)
echo ============================================
echo.
cd /d "%~dp0"
"C:\Users\Jnewball\AppData\Roaming\npm\firebase.cmd" deploy --only firestore:indexes
if %errorlevel% neq 0 (
  echo.
  echo ERROR deploying indexes. Run 1-firebase-login.bat first.
  pause
  exit /b 1
)
echo.
echo ============================================
echo  Firestore indexes deployed!
echo  Note: Indexes can take 5-10 minutes to build.
echo ============================================
pause
