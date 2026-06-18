@echo off
echo =========================================
echo   LynkApp — React SPA Production Build
echo =========================================
cd /d %~dp0
echo Building with Vite...
node_modules\.bin\vite.cmd build
if %ERRORLEVEL% NEQ 0 (
  echo.
  echo [ERROR] Vite build failed! Check errors above.
  pause
  exit /b 1
)
echo.
echo =========================================
echo   Build complete! Output: dist\
echo   Run 4-deploy-hosting.bat to deploy.
echo =========================================
pause
