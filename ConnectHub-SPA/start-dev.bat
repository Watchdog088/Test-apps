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
call npm run dev
