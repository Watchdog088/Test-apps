@echo off
echo ============================================
echo  Deploy Firestore Rules Only
echo  (Use after editing firestore.rules)
echo ============================================
echo.
cd /d "%~dp0"
"C:\Users\Jnewball\AppData\Roaming\npm\firebase.cmd" deploy --only firestore:rules
if %errorlevel% neq 0 (
  echo.
  echo ERROR deploying rules. Run 1-firebase-login.bat first.
  pause
  exit /b 1
)
echo.
echo ============================================
echo  Firestore rules deployed successfully!
echo ============================================
pause
