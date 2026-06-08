@echo off
echo ============================================
echo   LynkApp Clock Sync + CEO Admin Seeder
echo ============================================
echo.

REM Step 1: Sync Windows clock
echo [1/3] Stopping Windows Time service...
net stop w32tm >nul 2>&1

echo [2/3] Starting Windows Time service...
net start w32tm >nul 2>&1

echo [3/3] Force-syncing clock with time.windows.com...
w32tm /resync /force
echo.
echo Clock synced! Waiting 2 seconds before running seed...
timeout /t 2 /nobreak >nul

REM Step 2: Run the seed script
echo.
echo ============================================
echo   Running CEO Admin Seed Script...
echo ============================================
cd /d "%~dp0"
node seed-ceo-admin.cjs

echo.
pause
