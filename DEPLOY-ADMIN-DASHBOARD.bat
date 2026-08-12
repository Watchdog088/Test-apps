@echo off
echo ============================================
echo  LynkApp Admin Dashboard Deploy to Firebase
echo  www.lynkapp.net/admin-dashboard.html
echo ============================================
echo.

cd /d "%~dp0ConnectHub-SPA"

echo [1/3] Copying admin-dashboard.html to public folder...
copy /Y "..\admin-dashboard.html" "public\admin-dashboard.html"
if errorlevel 1 (
    echo ERROR: Could not copy admin-dashboard.html
    pause
    exit /b 1
)
echo Done.
echo.

echo [2/3] Deploying to Firebase Hosting (www.lynkapp.net)...
echo This may take 1-2 minutes...
npx firebase-tools@latest deploy --only hosting
if errorlevel 1 (
    echo.
    echo ERROR: Firebase deploy failed.
    echo Try running: npx firebase-tools@latest login
    echo Then run this script again.
    pause
    exit /b 1
)
echo.

echo [3/3] Saving to GitHub...
cd /d "%~dp0"
git add admin-dashboard.html ConnectHub-SPA/public/admin-dashboard.html ADMIN-DASHBOARD-DATA-SOURCES.md
git commit -m "deploy: Admin dashboard updated [%date% %time%]" 2>nul || echo (No new changes to commit)
git push origin main
echo.

echo ============================================
echo  DONE! Admin dashboard deployed to:
echo  https://www.lynkapp.net/admin-dashboard.html
echo ============================================
pause
