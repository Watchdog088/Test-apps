@echo off
title LynkApp - Dev Server
cd /d "%~dp0"
echo ============================================
echo  LynkApp Development Server
echo  Opens at: http://localhost:5173
echo ============================================
echo.
echo Starting Vite dev server...
echo Press Ctrl+C to stop.
echo.
:: --host 127.0.0.1 forces IPv4 binding on Windows (prevents "site can't be reached" black screen)
npx vite --host 127.0.0.1 --port 5173
