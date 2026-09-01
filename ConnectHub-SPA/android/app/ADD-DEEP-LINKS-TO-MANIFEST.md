# Android Deep Links — Manual Step Required
**Section 2 Fix — Android Technical: Deep Links (App Links)**
**Status: Code ready below — paste into AndroidManifest.xml**

## WHY THIS IS NEEDED
Google Play requires App Links (verified HTTPS deep links) for email verification
links (`lynkapp.com/verify-email?oobCode=...`) to open in the native app instead of
the browser. Without this, Firebase email verification links silently fail on Android.

## HOW TO ADD (one-time manual step)
Open: `ConnectHub-SPA/android/app/src/main/AndroidManifest.xml`

Inside the `<activity android:name="com.lynkapp.app.MainActivity">` block,
BEFORE the closing `</activity>` tag, add this block:

```xml
<!-- ========== SECTION 2 FIX: Android App Links / Deep Links ========== -->
<!-- Handles: lynkapp.com/verify-email, lynkapp.com/profile/:id, etc.    -->
<!-- Requires: Digital Asset Links JSON at https://lynkapp.com/.well-known/assetlinks.json -->
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="https"
          android:host="lynkapp.com" />
</intent-filter>
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="https"
          android:host="www.lynkapp.com" />
</intent-filter>
<!-- Custom URI scheme for in-app navigation from notifications -->
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="lynkapp" />
</intent-filter>
<!-- ===================================================================== -->
```

## ALSO REQUIRED: Digital Asset Links File
Create the file `ConnectHub-SPA/public/.well-known/assetlinks.json`:

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.lynkapp.app",
    "sha256_cert_fingerprints": [
      "YOUR_RELEASE_KEYSTORE_SHA256_FINGERPRINT_HERE"
    ]
  }
}]
```

Get your SHA256 fingerprint after generating the keystore:
```
keytool -list -v -keystore lynkapp-release.keystore -alias lynkapp
```

## DEPLOY
The assetlinks.json must be accessible at:
`https://lynkapp.com/.well-known/assetlinks.json`
with `Content-Type: application/json`
