#!/bin/bash

# ConnectHub Mobile App Store Build Script
# Builds both iOS and Android apps for store submission

set -e

echo "📱 ConnectHub Mobile App Store Build"
echo "===================================="

# Step 1: iOS Build
echo ""
echo "🍎 Building iOS App for App Store"
echo "--------------------------------"

if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "✅ macOS detected - iOS build available"
    
    cd ios
    echo "Installing CocoaPods dependencies..."
    pod install
    
    echo "Building iOS Archive..."
    xcodebuild -workspace ConnectHub.xcworkspace \
               -scheme ConnectHub \
               -configuration Release \
               -archivePath build/ConnectHub.xcarchive \
               archive
    
    echo "Exporting IPA for App Store..."
    xcodebuild -exportArchive \
               -archivePath build/ConnectHub.xcarchive \
               -exportPath build/AppStore \
               -exportOptionsPlist ExportOptions.plist
    
    echo "✅ iOS build complete: ios/build/AppStore/ConnectHub.ipa"
    cd ..
else
    echo "⚠️  iOS build requires macOS - skipping"
fi

# Step 2: Android Build
echo ""
echo "🤖 Building Android App for Play Store"
echo "--------------------------------------"

cd android

echo "Cleaning previous builds..."
./gradlew clean

echo "Building Android App Bundle (AAB)..."
./gradlew bundleRelease

echo "Building APK..."
./gradlew assembleRelease

echo "✅ Android builds complete:"
echo "   - AAB: android/app/build/outputs/bundle/release/app-release.aab"
echo "   - APK: android/app/build/outputs/apk/release/app-release.apk"

cd ..

# Step 3: Verification
echo ""
echo "🔍 Build Verification"
echo "--------------------"

if [[ "$OSTYPE" == "darwin"* ]] && [ -f "ios/build/AppStore/ConnectHub.ipa" ]; then
    IOS_SIZE=$(ls -lh ios/build/AppStore/ConnectHub.ipa | awk '{print $5}')
    echo "✅ iOS IPA: $IOS_SIZE"
fi

if [ -f "android/app/build/outputs/bundle/release/app-release.aab" ]; then
    AAB_SIZE=$(ls -lh android/app/build/outputs/bundle/release/app-release.aab | awk '{print $5}')
    echo "✅ Android AAB: $AAB_SIZE"
fi

if [ -f "android/app/build/outputs/apk/release/app-release.apk" ]; then
    APK_SIZE=$(ls -lh android/app/build/outputs/apk/release/app-release.apk | awk '{print $5}')
    echo "✅ Android APK: $APK_SIZE"
fi

echo ""
echo "🎉 Mobile app builds ready for store submission!"
echo ""
echo "📋 Next Steps:"
echo "1. Test builds on physical devices"
echo "2. Submit to App Store Connect (iOS)"
echo "3. Submit to Google Play Console (Android)"
echo "4. Monitor review process"
