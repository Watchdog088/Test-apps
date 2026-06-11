@echo off
title LynkApp - Week 2 Android/Capacitor Setup
cd /d "%~dp0"
echo ============================================
echo  WEEK 2 - Android (Capacitor) Setup
echo ============================================
echo.
echo This will set up the Android project using Capacitor.
echo Requirements: Android Studio installed, Java 17+
echo.
pause

echo [1/5] Installing Capacitor CLI + plugins...
call npm install @capacitor/core @capacitor/cli
call npm install @capacitor/android
call npm install @capacitor/camera @capacitor/geolocation
call npm install @capacitor/push-notifications @capacitor/haptics
call npm install @capacitor/status-bar @capacitor/splash-screen
echo ✅ Capacitor plugins installed

echo.
echo [2/5] Building web app...
call npm run build
echo ✅ Web build complete

echo.
echo [3/5] Adding Android platform...
call npx cap add android
echo ✅ Android platform added

echo.
echo [4/5] Syncing web app to Android...
call npx cap sync android
echo ✅ Sync complete

echo.
echo [5/5] Opening in Android Studio...
echo NOTE: Place google-services.json in android/app/ before building!
echo Get it from: Firebase Console > Project Settings > Android App
echo.
call npx cap open android

echo.
echo ============================================
echo  ✅ Android setup ready in Android Studio!
echo  In Android Studio: Build > Build APK
echo ============================================
pause
