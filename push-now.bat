@echo off
cd /d c:\Users\Jnewball\Test-apps\Test-apps
git add -A
git commit -m "Backend: new EC2 scripts, deploy bat, rotate AWS keys, port tests"
git push origin main
echo Done!
pause
