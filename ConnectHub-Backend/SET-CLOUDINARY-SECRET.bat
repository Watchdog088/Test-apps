@echo off
echo ============================================================
echo  SET CLOUDINARY API SECRET — LynkApp Backend
echo ============================================================
echo.
echo  Where to get it:
echo  1. Go to: https://console.cloudinary.com
echo  2. Click: Settings (gear icon, top right)
echo  3. Click: API Keys tab
echo  4. Copy the "API Secret" for cloud name: do6ue7mgf
echo.
echo ============================================================
set /p SECRET="Paste your Cloudinary API Secret here: "
echo.

if "%SECRET%"=="" (
    echo ERROR: No secret entered. Please try again.
    pause
    exit /b 1
)

:: Update .env.production
powershell -Command "(Get-Content .env.production) -replace 'CLOUDINARY_API_SECRET=REPLACE_WITH_CLOUDINARY_SECRET', 'CLOUDINARY_API_SECRET=%SECRET%' | Set-Content .env.production"

echo.
echo ✅ SUCCESS! Cloudinary API Secret saved to .env.production
echo.
echo  Next steps:
echo  1. SCP .env.production to your EC2 server
echo  2. Restart the backend: pm2 restart lynkapp-backend
echo.
pause
