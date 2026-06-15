@echo off
title LynkApp - Android Build Script
color 0A
echo.
echo ============================================================
echo   LYNKAPP ANDROID BUILD SCRIPT  v3.0
echo   Capacitor 6 + React + Firebase
echo   June 2026
echo   AGP 8.7.3  +  Gradle 8.9  (matched pair - no errors)
echo ============================================================
echo.

cd /d "%~dp0"

:: ── VERSION INFO ─────────────────────────────────────────────
echo   Android Gradle Plugin : 8.7.3  (android/build.gradle)
echo   Gradle Wrapper         : 8.9    (gradle-wrapper.properties)
echo   Min SDK                : 23  (Android 6.0+)
echo   Compile/Target SDK     : 35  (Android 15)
echo.
echo   NOTE: These versions are matched. Do NOT change AGP to
echo         8.9+ without also updating the Gradle wrapper.
echo ============================================================
echo.

:: ── STEP 1: Check Node.js ────────────────────────────────────
echo [STEP 1/9] Checking Node.js version...
node --version 2>nul
if errorlevel 1 (
    echo.
    echo  ERROR: Node.js is not installed or not in PATH!
    echo  Download Node 20 LTS from: https://nodejs.org/en/download
    echo.
    pause
    exit /b 1
)
echo Node.js OK
echo.

:: ── STEP 2: Install npm packages ─────────────────────────────
echo [STEP 2/9] Installing npm packages...
call npm install
if errorlevel 1 (
    echo.
    echo  npm install failed. Trying --legacy-peer-deps...
    call npm install --legacy-peer-deps
    if errorlevel 1 (
        echo  npm install FAILED. Check errors above.
        pause
        exit /b 1
    )
)
echo npm install OK
echo.

:: ── STEP 3: Build React App ───────────────────────────────────
echo [STEP 3/9] Building React app (npm run build)...
call npm run build
if errorlevel 1 (
    echo.
    echo  ERROR: React build failed!
    echo  Check for JSX errors above and fix them before retrying.
    echo.
    pause
    exit /b 1
)
echo React build OK  (dist/ folder updated)
echo.

:: ── STEP 4: Check / Add Android platform ─────────────────────
echo [STEP 4/9] Checking Android platform...
if exist "android" (
    echo Android platform exists - skipping cap add android
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

:: ── STEP 5: AUTO-COPY google-services.json ───────────────────
echo [STEP 5/9] Checking for google-services.json...

if exist "android\app\google-services.json" (
    echo  google-services.json already in android\app\  OK
    goto :step6
)

echo  Not found in android\app\  - searching common locations...

if exist "%USERPROFILE%\Downloads\google-services.json" (
    echo  Found in Downloads - copying...
    copy /Y "%USERPROFILE%\Downloads\google-services.json" "android\app\google-services.json" >nul
    if not errorlevel 1 ( echo  Copied OK & goto :step6 )
)

if exist "%USERPROFILE%\Desktop\google-services.json" (
    echo  Found on Desktop - copying...
    copy /Y "%USERPROFILE%\Desktop\google-services.json" "android\app\google-services.json" >nul
    if not errorlevel 1 ( echo  Copied OK & goto :step6 )
)

echo.
echo ============================================================
echo   WARNING: google-services.json NOT FOUND
echo ============================================================
echo   App will crash on launch without this file.
echo.
echo   To get it:
echo     1. Go to https://console.firebase.google.com
echo     2. Open project: lynkapp-c7db1
echo     3. Settings (gear) - Project Settings - Your apps
echo     4. Android app: com.lynkapp.app
echo     5. Download google-services.json
echo     6. Place it at:
echo        %CD%\android\app\google-services.json
echo.
set /p CONTINUE="Continue without it? (y/n): "
if /i "%CONTINUE%" neq "y" ( pause & exit /b 0 )

:step6
echo.

:: ── STEP 6: Sync web assets to Android ───────────────────────
echo [STEP 6/9] Syncing React app to Android (npx cap sync android)...
echo   This copies dist/ into android/app/src/main/assets/public/
call npx cap sync android
if errorlevel 1 (
    echo.
    echo  ERROR: cap sync failed!
    echo  Make sure dist/ folder exists (Step 3 must have passed).
    pause
    exit /b 1
)
echo Sync OK  (web assets copied into Android project)
echo.

:: ── STEP 7: Verify Android project files ─────────────────────
echo [STEP 7/9] Verifying Android project structure...
set MISSING=0
if not exist "android\app\src\main\AndroidManifest.xml" ( echo  MISSING: AndroidManifest.xml & set MISSING=1 )
if not exist "android\app\build.gradle"                  ( echo  MISSING: android\app\build.gradle & set MISSING=1 )
if not exist "android\build.gradle"                      ( echo  MISSING: android\build.gradle & set MISSING=1 )
if not exist "android\variables.gradle"                  ( echo  MISSING: android\variables.gradle & set MISSING=1 )
if "%MISSING%"=="0" ( echo  All required files present  OK )
echo.

:: ── STEP 8: Check Android Studio ─────────────────────────────
echo [STEP 8/9] Checking Android Studio...
set STUDIO_EXE=
if exist "C:\Program Files\Android\Android Studio\bin\studio64.exe" (
    set "STUDIO_EXE=C:\Program Files\Android\Android Studio\bin\studio64.exe"
    echo  Found: %STUDIO_EXE%
    goto :step9
)
if exist "C:\Program Files\Android\Android Studio\bin\studio.exe" (
    set "STUDIO_EXE=C:\Program Files\Android\Android Studio\bin\studio.exe"
    echo  Found: %STUDIO_EXE%
    goto :step9
)
where studio.bat >nul 2>&1
if not errorlevel 1 ( echo  Android Studio found in PATH & goto :step9 )
echo  Android Studio not found in default path.
echo  Install from: https://developer.android.com/studio
echo.

:step9
echo.

:: ── STEP 9: Open in Android Studio ───────────────────────────
echo [STEP 9/9] Opening project in Android Studio...
echo.
echo ============================================================
echo   AFTER ANDROID STUDIO OPENS - DO THIS:
echo ============================================================
echo.
echo   FIRST TIME or after Gradle config changes:
echo     File - Invalidate Caches - Invalidate and Restart
echo     (wait for Android Studio to restart ~30 seconds)
echo.
echo   EVERY TIME after this script runs:
echo     1. If yellow banner appears:  click "Sync Now"
echo     2. Wait for "Gradle sync finished" at the bottom
echo     3. Build - Build Bundle(s)/APK(s) - Build APK(s)
echo     4. Wait for "BUILD SUCCESSFUL"
echo     5. Click "locate" - APK is at:
echo        android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo   FOR BETA TESTERS (recommended):
echo     Firebase Console - App Distribution - Upload APK
echo     Testers get email download link (no Play Store needed)
echo.
echo   CURRENT GRADLE VERSIONS (DO NOT CHANGE WITHOUT MATCHING):
echo     AGP:    8.7.3  (android/build.gradle)
echo     Gradle: 8.9    (gradle-wrapper.properties)
echo     Kotlin: 1.9.25
echo ============================================================
echo.

call npx cap open android
if errorlevel 1 (
    echo  Could not auto-open via npx cap open android.
    if not "%STUDIO_EXE%"=="" (
        echo  Launching Android Studio directly...
        start "" "%STUDIO_EXE%" "%CD%\android"
    ) else (
        echo  Please open Android Studio manually:
        echo    File - Open - select: %CD%\android
    )
)

echo.
echo ============================================================
echo   BUILD SCRIPT COMPLETE
echo   Project: %CD%\android
echo   Next: Sync Now in Android Studio, then Build APK(s)
echo ============================================================
echo.
pause
