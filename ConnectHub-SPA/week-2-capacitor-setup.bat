@echo off
REM ============================================================
REM LynkApp — WEEK 2 CAPACITOR MOBILE SETUP
REM Beta Launch Checklist — Phase 3: Native iOS & Android
REM Updated: June 10, 2026
REM ============================================================
echo.
echo ============================================================
echo  LynkApp WEEK 2 — CAPACITOR MOBILE SETUP
REM iOS (requires Mac + Xcode) and Android (requires Android Studio)
echo ============================================================
echo.

cd /d "%~dp0"

echo This script installs Capacitor and prepares the mobile builds.
echo.
echo PREREQUISITES:
echo  - iOS builds require a Mac with Xcode 15+ installed
echo  - Android builds require Android Studio installed
echo  - Apple Developer account ($99/year): developer.apple.com
echo  - Google Play Console account ($25 one-time): play.google.com/console
echo.
echo Press any key to begin Capacitor installation...
pause > nul

REM --- Step 1: Install Capacitor packages ---
echo.
echo [1/5] Installing Capacitor core packages...
call npm install @capacitor/core@latest @capacitor/cli@latest
if errorlevel 1 (
    echo ERROR: Failed to install @capacitor/core
    pause
    exit /b 1
)

call npm install @capacitor/ios@latest @capacitor/android@latest
if errorlevel 1 (
    echo ERROR: Failed to install @capacitor/ios and @capacitor/android
    pause
    exit /b 1
)

echo.
echo [2/5] Installing Capacitor plugins...
call npm install @capacitor/app@latest
call npm install @capacitor/haptics@latest
call npm install @capacitor/keyboard@latest
call npm install @capacitor/push-notifications@latest
call npm install @capacitor/status-bar@latest
call npm install @capacitor/splash-screen@latest
call npm install @capacitor/camera@latest
call npm install @capacitor/filesystem@latest
call npm install @capacitor/geolocation@latest
call npm install @capacitor/network@latest
call npm install @capacitor/share@latest

echo Capacitor plugins installed.

REM --- Step 2: Build production first ---
echo.
echo [3/5] Building production React app...
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed! Fix build errors before continuing.
    pause
    exit /b 1
)
echo Build OK.

REM --- Step 3: Initialize platforms ---
echo.
echo [4/5] Initializing Capacitor platforms...
echo.

echo Checking for existing iOS platform...
if not exist "ios" (
    echo Adding iOS platform...
    call npx cap add ios
) else (
    echo iOS platform already exists. Syncing...
)
call npx cap sync ios
echo iOS synced.

echo.
echo Checking for existing Android platform...
if not exist "android" (
    echo Adding Android platform...
    call npx cap add android
) else (
    echo Android platform already exists. Syncing...
)
call npx cap sync android
echo Android synced.

REM --- Step 4: Print next steps ---
echo.
echo [5/5] Setup complete!
echo.
echo ============================================================
echo  NEXT STEPS FOR iOS (Requires Mac):
echo ============================================================
echo.
echo  1. Transfer the ios/ folder to your Mac
echo  2. Run: npx cap open ios
echo  3. In Xcode:
echo     a. Select your Development Team (Apple Developer account)
echo     b. Set Bundle ID: com.lynkapp.app
echo     c. Set Version: 1.0.0, Build: 1
echo     d. Add to Info.plist:
echo        - NSCameraUsageDescription
echo        - NSPhotoLibraryUsageDescription
echo        - NSMicrophoneUsageDescription
echo        - NSLocationWhenInUseUsageDescription
echo     e. Enable capabilities: Push Notifications, Sign In with Apple
echo  4. Product - Archive - Distribute to TestFlight
echo     (TestFlight allows up to 10,000 testers without App Store review)
echo.
echo ============================================================
echo  NEXT STEPS FOR ANDROID:
echo ============================================================
echo.
echo  1. Run: npx cap open android
echo  2. In Android Studio:
echo     a. Edit android/app/build.gradle:
echo        applicationId "com.lynkapp.app"
echo        minSdkVersion 24
echo        targetSdkVersion 34
echo        versionCode 1
echo        versionName "1.0.0"
echo     b. Download google-services.json from Firebase Console
echo        Place at: android/app/google-services.json
echo  3. Build - Generate Signed Bundle/APK
echo     Choose Android App Bundle (.aab)
echo     Create/use keystore: lynkapp-key
echo     BACKUP YOUR KEYSTORE FILE - YOU CANNOT REPLACE IT
echo  4. Upload .aab to Google Play Console - Internal Testing
echo.
echo ============================================================
echo  GOOGLE PLAY INTERNAL TESTING (No review required!):
echo ============================================================
echo  - Upload .aab to Internal testing track
echo  - Add tester emails
echo  - Testers get a direct download link immediately
echo  - No review period for internal track
echo.
pause
