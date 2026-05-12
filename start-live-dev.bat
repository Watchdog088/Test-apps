@echo off
pushd "%~dp0ConnectHub-SPA"
node_modules\.bin\vite.cmd --port 5173
popd
