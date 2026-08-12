@echo off
echo ============================================
echo  FIX WINDOWS CLOCK SKEW + CLOUDFRONT INVALIDATE
echo  LynkApp Admin Dashboard Deployment
echo ============================================
echo.

echo [STEP 1] Syncing Windows clock with NTP server...
net stop w32tm /y > nul 2>&1
net start w32tm > nul 2>&1
w32tm /config /manualpeerlist:"time.windows.com,0x1 time.nist.gov,0x1" /syncfromflags:manual /reliable:YES /update > nul 2>&1
w32tm /resync /force 2>&1
echo Clock sync attempted.
echo.

echo [STEP 2] Waiting 10 seconds for clock to stabilize...
ping -n 11 127.0.0.1 > nul
echo.

echo [STEP 3] Invalidating CloudFront cache for admin-dashboard.html...
aws cloudfront create-invalidation --distribution-id E1K6OG7GOLIRJ2 --paths "/admin-dashboard.html" "/admin-dashboard.html*"
echo.

echo [STEP 4] Also invalidating root path (/*) to refresh all cached content...
aws cloudfront create-invalidation --distribution-id E1K6OG7GOLIRJ2 --paths "/*"
echo.

echo ============================================
echo  DONE! Check https://lynkapp.net/admin-dashboard.html
echo ============================================
pause
