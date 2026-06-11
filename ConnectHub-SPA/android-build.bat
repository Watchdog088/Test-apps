@echo off
title LynkApp - Android Build Script
color 0A
echo.
echo ============================================================
echo   LYNKAPP ANDROID BUILD SCRIPT
echo   Capacitor 6 + React + Firebase
echo   June 2026
echo ============================================================
echo.

cd /d "%~dp0"

:: ── STEP 1: Check Node.js ───────────────────────────────────
echo [STEP 1/8] Checking Node.js version...
node --version 2>nul
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Download Node 20 LTS from: https://nodejs.org/en/download
    pause
    exit /b 1
)
echo Node.js OK
echo.

:: ── STEP 2: Install npm packages ────────────────────────────
echo [STEP 2/8] Installing npm packages (Capacitor + plugins)...
echo This may take 3-5 minutes on first run...
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed!
    echo Try running: npm install --legacy-peer-deps
    pause
    exit /b 1
)
echo npm install OK
echo.

:: ── STEP 3: Build React App ──────────────────────────────────
echo [STEP 3/8] Building React app (npm run build)...
call npm run build
if errorlevel 1 (
    echo ERROR: React build failed!
    echo Check for TypeScript/JSX errors above.
    pause
    exit /b 1
)
echo Build OK - dist/ folder created
echo.

:: ── STEP 4: Check if android folder exists ──────────────────
echo [STEP 4/8] Checking Android platform...
if exist "android" (
    echo Android platform already exists - skipping 'cap add android'
) else (
    echo Adding Android platform for the first time...
    call npx cap add android
    if errorlevel 1 (
        echo ERROR: cap add android failed!
        pause
        exit /b 1
    )
    echo Android platform added
)
echo.

:: ── STEP 5: Check for google-services.json ──────────────────
echo [STEP 5/8] Checking for google-services.json...
if exist "android\app\google-services.json" (
    echo google-services.json found - OK
) else (
    echo.
    echo ============================================================
    echo   WARNING: google-services.json NOT FOUND!
    echo ============================================================
    echo.
    echo You MUST download this file from Firebase Console:
    echo   1. Go to: https://console.firebase.google.com
    echo   2. Open project: lynkapp-c7db1
    echo   3. Settings gear - Project Settings
    echo   4. "Your apps" section - Add Android App
    echo   5. Package name: com.lynkapp.app
    echo   6. Download google-services.json
    echo   7. Copy it to: ConnectHub-SPA\android\app\google-services.json
    echo.
    echo The app WILL crash on launch without this file.
    echo.
    set /p CONTINUE="Continue anyway? (y/n): "
    if /i "%CONTINUE%" neq "y" (
        echo Exiting. Come back after adding google-services.json
        pause
        exit /b 0
    )
)
echo.

:: ── STEP 6: Sync web app to Android ─────────────────────────
echo [STEP 6/8] Syncing web app to Android (npx cap sync android)...
call npx cap sync android
if errorlevel 1 (
    echo ERROR: cap sync failed!
    echo Make sure the dist/ folder exists (Step 3).
    pause
    exit /b 1
)
echo Sync OK
echo.

:: ── STEP 7: Check Android Studio ────────────────────────────
echo [STEP 7/8] Checking Android Studio...
where studio.bat >nul 2>&1
if errorlevel 1 (
    echo Android Studio not found in PATH.
    echo.
    echo Please install Android Studio from:
    echo   https://developer.android.com/studio
    echo.
    echo After install, you can open the project manually:
    echo   Open Android Studio - Open - select the 'android' folder
    echo   in ConnectHub-SPA\android\
    echo.
) else (
    echo Android Studio found in PATH
)
echo.

:: ── STEP 8: Open Android Studio ─────────────────────────────
echo [STEP 8/8] Opening project in Android Studio...
echo.
echo ============================================================
echo   NEXT STEPS IN ANDROID STUDIO:
echo ============================================================
echo   1. Wait for Gradle sync to complete (3-10 minutes)
echo   2. Menu: Build - Build Bundle(s)/APK(s) - Build APK(s)
echo   3. APK location:
echo      android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo   FOR TESTERS:
echo   - Share the APK file directly (testers must allow
echo     "Install from Unknown Sources" on their Android)
echo   - OR use Firebase App Distribution (free, recommended)
echo ============================================================
echo.

call npx cap open android
if errorlevel 1 (
    echo Could not auto-open Android Studio.
    echo Manually open: ConnectHub-SPA\android\ in Android Studio
)

echo.
echo ============================================================
echo   BUILD SCRIPT COMPLETE!
echo   Android project is ready in: ConnectHub-SPA\android\
echo ============================================================
echo.
pause
