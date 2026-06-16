@echo off
title ConnectHub-Mobile - Fix Gradle Error
color 0E
echo.
echo ============================================================
echo   IMPORTANT - READ BEFORE CONTINUING
echo ============================================================
echo.
echo   You have TWO Android projects in this repo:
echo.
echo   1. ConnectHub-SPA\android\    ^<-- THE REAL LYNKAPP
echo      Capacitor + React + Firebase
echo      Use: ConnectHub-SPA\android-build.bat  ^<-- RUN THIS
echo.
echo   2. ConnectHub-Mobile\android\  ^<-- OLD React Native skeleton
echo      (incomplete - NOT the real app)
echo      This is what caused your Gradle error.
echo.
echo ============================================================
echo.
echo   RECOMMENDED ACTION:
echo   Close ConnectHub-Mobile in Android Studio.
echo   Run ConnectHub-SPA\android-build.bat instead.
echo.
echo ============================================================
echo.
set /p CHOICE="Fix ConnectHub-Mobile anyway? (y/n): "
if /i "%CHOICE%" neq "y" (
    echo.
    echo Opening the CORRECT project (ConnectHub-SPA)...
    start "" /d "%~dp0..\ConnectHub-SPA" android-build.bat
    exit /b 0
)

echo.
echo ============================================================
echo   Fixing ConnectHub-Mobile Gradle error...
echo ============================================================
echo.

cd /d "%~dp0"

:: Step 1: Confirm settings.gradle exists (we just created it)
echo [Step 1/4] Checking android\settings.gradle...
if exist "android\settings.gradle" (
    echo   settings.gradle EXISTS - OK
) else (
    echo   MISSING - creating it now...
    (
        echo rootProject.name = 'lynk-mobile'
        echo includeBuild('../node_modules/@react-native/gradle-plugin'^)
        echo apply from: file("../node_modules/@react-native-community/cli-platform-android/native_modules.gradle"^)
        echo applyNativeModulesSettingsGradle(settings^)
        echo include ':app'
    ) > android\settings.gradle
    echo   settings.gradle created.
)
echo.

:: Step 2: Clear Gradle caches that reference the bad path
echo [Step 2/4] Clearing Gradle build caches...
if exist "android\.gradle" (
    rmdir /s /q "android\.gradle" 2>nul
    echo   Cleared android\.gradle
)
if exist "android\build" (
    rmdir /s /q "android\build" 2>nul
    echo   Cleared android\build
)
if exist "android\app\build" (
    rmdir /s /q "android\app\build" 2>nul
    echo   Cleared android\app\build
)
echo.

:: Step 3: Reinstall node_modules (ensures @react-native/gradle-plugin is present)
echo [Step 3/4] Reinstalling node_modules (React Native 0.72.6)...
echo   This may take 2-5 minutes...
call npm install --legacy-peer-deps
if errorlevel 1 (
    echo.
    echo   npm install FAILED. Check errors above.
    echo   Common fix: delete node_modules folder manually, then re-run.
    pause
    exit /b 1
)
echo   npm install OK
echo.

:: Step 4: Verify the key file that caused the error
echo [Step 4/4] Verifying @react-native/gradle-plugin...
if exist "node_modules\@react-native\gradle-plugin" (
    echo   @react-native/gradle-plugin - FOUND  OK
) else (
    echo   WARNING: @react-native/gradle-plugin not found in node_modules.
    echo   The Gradle error may persist. Consider using ConnectHub-SPA instead.
)
echo.

echo ============================================================
echo   FIX COMPLETE
echo ============================================================
echo.
echo   Now in Android Studio:
echo     1. File - Invalidate Caches - Invalidate and Restart
echo     2. Wait for restart (~30 sec)
echo     3. Click "Sync Now" on the yellow banner
echo     4. Wait for "Gradle sync finished"
echo.
echo   NOTE: ConnectHub-Mobile is an incomplete React Native
echo   skeleton. The REAL LynkApp APK comes from:
echo     ConnectHub-SPA\android-build.bat
echo.
echo ============================================================
pause
