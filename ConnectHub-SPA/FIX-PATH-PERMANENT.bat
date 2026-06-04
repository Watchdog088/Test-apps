@echo off
echo ============================================
echo  Fix Firebase PATH Permanently
echo  (So you can type "firebase" in any terminal)
echo ============================================
echo.
echo Adding npm global folder to your User PATH...
echo.

powershell -Command "[System.Environment]::SetEnvironmentVariable('Path', [System.Environment]::GetEnvironmentVariable('Path','User') + ';C:\Users\Jnewball\AppData\Roaming\npm', 'User')"

if %errorlevel% neq 0 (
  echo.
  echo ERROR: Could not update PATH.
  echo Try running this window as Administrator.
  pause
  exit /b 1
)

echo.
echo ============================================
echo  PATH updated successfully!
echo.
echo  IMPORTANT: You must restart VS Code and
echo  any open terminals for this to take effect.
echo.
echo  After restarting, you can type just:
echo    firebase login
echo    firebase deploy
echo  (no more full path needed)
echo ============================================
pause
