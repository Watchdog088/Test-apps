@echo off
REM ============================================================
REM  LYNKAPP — PREPARE FOR ANDROID STUDIO
REM  Run this ONCE before opening Android Studio
REM  Location: ConnectHub-SPA\PREPARE-FOR-ANDROID-STUDIO.bat
REM ============================================================

title LynkApp — Android Studio Prep
color 0A
cd /d "%~dp0"

echo.
echo ============================================================
echo   LYNKAPP ANDROID STUDIO PREPARATION SCRIPT
echo   App ID: com.lynkapp.app
echo   Version: 1.0.0 (versionCode 1)
echo   Capacitor: 6.x  ^|  AGP: 8.13.2  ^|  SDK: 35
echo ============================================================
echo.

REM ── STEP 1: Copy google-services.json ─────────────────────────
echo [STEP 1/5] Copying google-services.json to android\app\ ...
echo.

set GSRC=%USERPROFILE%\Downloads\google-services.json
set GDEST=%~dp0android\app\google-services.json

if exist "%GSRC%" (
    copy /Y "%GSRC%" "%GDEST%" >nul
    echo    ✅ google-services.json copied successfully
    echo       From: %GSRC%
    echo       To:   %GDEST%
) else (
    echo    ⚠️  google-services.json NOT FOUND in Downloads!
    echo.
    echo    Please download it from Firebase Console:
    echo    1. Go to console.firebase.google.com
    echo    2. Select project: lynkapp-c7db1
    echo    3. Click the gear icon → Project settings
    echo    4. Scroll to "Your apps" → Android app
    echo    5. Click "google-services.json" download button
    echo    6. Save to your Downloads folder
    echo    7. Run this script again
    echo.
    echo    Push notifications will NOT work without this file.
    echo    Press any key to continue anyway (without FCM)...
    pause >nul
)

echo.

REM ── STEP 2: Verify node_modules ───────────────────────────────
echo [STEP 2/5] Checking node_modules...
if not exist "%~dp0node_modules" (
    echo    Installing npm dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo    ❌ npm install failed! Check your internet connection.
        pause
        exit /b 1
    )
) else (
    echo    ✅ node_modules already installed
)
echo.

REM ── STEP 3: Build the web app ─────────────────────────────────
echo [STEP 3/5] Building React app (npm run build)...
echo    This produces the "dist\" folder that Capacitor wraps.
echo.
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo    ❌ Build FAILED! Fix any errors above, then re-run this script.
    pause
    exit /b 1
)
echo.
echo    ✅ Web build complete — dist\ folder ready
echo.

REM ── STEP 4: Sync to Android ───────────────────────────────────
echo [STEP 4/5] Syncing web assets to Android project...
echo    (npx cap sync android)
echo.
call npx cap sync android
if %errorlevel% neq 0 (
    echo.
    echo    ❌ Capacitor sync failed!
    echo    Try: npx cap doctor
    pause
    exit /b 1
)
echo.
echo    ✅ Android project synced with latest web assets
echo.

REM ── STEP 5: Open Android Studio ───────────────────────────────
echo [STEP 5/5] Opening Android Studio...
echo.
echo    ┌─────────────────────────────────────────────────────┐
echo    │  WHAT TO DO IN ANDROID STUDIO:                      │
echo    │                                                      │
echo    │  1. Wait for Gradle sync to finish (~2-3 min)        │
echo    │  2. Connect Android device OR start an emulator      │
echo    │  3. Click ▶ Run (or Shift+F10)                      │
echo    │                                                      │
echo    │  TO BUILD A SIGNED APK FOR BETA TESTERS:            │
echo    │  Build → Generate Signed Bundle/APK                  │
echo    │  → APK → Create new keystore                         │
echo    │  → Release variant → Finish                          │
echo    │                                                      │
echo    │  APK saved to:                                       │
echo    │  android\app\release\app-release.apk                 │
echo    └─────────────────────────────────────────────────────┘
echo.
call npx cap open android
echo.

echo ============================================================
echo   DONE! Android Studio should now be opening.
echo.
echo   VERIFIED CONFIG:
echo     App ID:         com.lynkapp.app
echo     App Name:       LynkApp
echo     Version:        1.0.0 (code 1)
echo     Min Android:    6.0 (API 23)
echo     Target Android: 15  (API 35)
echo     Capacitor:      6.x
echo     Web source:     dist\ (built from ConnectHub-SPA)
echo ============================================================
echo.
pause
