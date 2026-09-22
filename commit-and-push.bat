@echo off
cd /d c:\Users\Jnewball\Test-apps\Test-apps
git add ConnectHub-Backend/LAUNCH-EC2-NOW.bat
git add ConnectHub-Backend/ec2-userdata.sh
git add ConnectHub-Backend/src/server.ts
git add BACKEND-FINAL-GAP-REPORT-SEP17-2026.md
git add BACKEND-COMPLETE-GAP-AUDIT-SEP17-2026.md
git add BACKEND-FINAL-GAP-REVIEW-SEP17-2026.md
git commit -m "Backend Sep17 2026: ec2-userdata, LAUNCH-EC2 fix, gap audit reports, 36 routes confirmed"
git push origin main
echo.
echo DONE. Check above for success or errors.
