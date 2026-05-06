@echo off
cd /d "%~dp0"
echo [1/2] Installing dependencies in %CD%...
call npm install
echo [2/2] Building with Vite...
call npx vite build
echo Done.
