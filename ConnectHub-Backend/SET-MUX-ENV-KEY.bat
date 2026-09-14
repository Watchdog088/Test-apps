@echo off
echo ============================================================
echo  SET MUX ENVIRONMENT KEY — LynkApp Backend
echo ============================================================
echo.
echo  Where to get it:
echo  1. Go to: https://dashboard.mux.com
echo  2. Click: Settings (left sidebar)
echo  3. Click: Environments tab
echo  4. Copy the "Environment Key" (looks like: abc123def456)
echo     NOTE: This is NOT the Token ID or Token Secret
echo           It is a shorter key used for the video player
echo.
echo ============================================================
set /p ENVKEY="Paste your Mux Environment Key here: "
echo.

if "%ENVKEY%"=="" (
    echo ERROR: No key entered. Please try again.
    pause
    exit /b 1
)

:: Update .env.production
powershell -Command "(Get-Content .env.production) -replace 'VITE_MUX_ENV_KEY=REPLACE_WITH_MUX_ENV_KEY', 'VITE_MUX_ENV_KEY=%ENVKEY%' | Set-Content .env.production"

echo.
echo ✅ SUCCESS! Mux Environment Key saved to .env.production
echo.
echo  IMPORTANT: Also update ConnectHub-SPA/.env with:
echo  VITE_MUX_ENV_KEY=%ENVKEY%
echo.
echo  Then rebuild the frontend:
echo  cd ConnectHub-SPA ^&^& npm run build
echo.
pause
