@echo off
echo ============================================
echo  STEP 3 — Build Production Bundle
echo ============================================
echo.
echo Compiling React app for production...
echo This takes 2-5 minutes. Please wait.
echo.
cd /d "%~dp0"
set NODE_OPTIONS=--max-old-space-size=4096
call npm run build
if %errorlevel% neq 0 (
  echo.
  echo ============================================
  echo  BUILD FAILED!
  echo  Read the red error above.
  echo  Common fixes:
  echo    - Missing import: check the file named in the error
  echo    - Out of memory: already handled (4096MB allocated)
  echo    - Syntax error: fix the file shown in the error
  echo ============================================
  pause
  exit /b 1
)
echo.
echo ============================================
echo  BUILD SUCCESSFUL!
echo  Output is in:  ConnectHub-SPA/dist/
echo.
echo  Next step: Run 4-deploy-hosting.bat
echo ============================================
pause
