@echo off
cd /d c:\Users\Jnewball\Test-apps\Test-apps\ConnectHub-SPA
echo Starting Vite... > C:\Users\Jnewball\AppData\Local\Temp\vite-output.log
node node_modules/vite/bin/vite.js --port 5173 >> C:\Users\Jnewball\AppData\Local\Temp\vite-output.log 2>&1
echo Vite exited with code %errorlevel% >> C:\Users\Jnewball\AppData\Local\Temp\vite-output.log
