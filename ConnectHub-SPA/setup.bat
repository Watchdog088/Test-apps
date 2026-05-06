@echo off
echo ================================================
echo  ConnectHub SPA — First-Time Setup
echo ================================================

cd /d "%~dp0"

echo.
echo [1/4] Installing dependencies...
call npm install

echo.
echo [2/4] Checking for .env file...
if not exist .env (
  copy .env.example .env
  echo     Created .env — please fill in your Firebase keys before running!
) else (
  echo     .env already exists — good.
)

echo.
echo [3/4] Running stub-page generator...
node generate-remaining.js

echo.
echo [4/4] Done!
echo.
echo  To start the dev server:
echo    cd ConnectHub-SPA
echo    npm run dev
echo.
pause
