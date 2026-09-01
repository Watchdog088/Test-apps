# LynkApp ProGuard / R8 rules
# Generated: September 1, 2026
# Applied when minifyEnabled=true in release buildType

# ─────────────────────────────────────────────────────────────
# 1. KEEP APPLICATION ENTRY POINTS
# ─────────────────────────────────────────────────────────────
-keep public class * extends android.app.Activity
-keep public class * extends android.app.Application
-keep public class * extends android.app.Service
-keep public class * extends android.content.BroadcastReceiver
-keep public class * extends android.content.ContentProvider

# ─────────────────────────────────────────────────────────────
# 2. CAPACITOR CORE — never obfuscate Capacitor plugin bridge
# ─────────────────────────────────────────────────────────────
-keep class com.getcapacitor.** { *; }
-keep @com.getcapacitor.annotation.CapacitorPlugin class * { *; }
-keep class * extends com.getcapacitor.Plugin { *; }
-keepclassmembers class * extends com.getcapacitor.Plugin {
    @com.getcapacitor.annotation.CapacitorPlugin *;
    @com.getcapacitor.PluginMethod *;
}

# ─────────────────────────────────────────────────────────────
# 3. FIREBASE / GOOGLE SERVICES
# ─────────────────────────────────────────────────────────────
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**

# ─────────────────────────────────────────────────────────────
# 4. GOOGLE PLAY BILLING
# ─────────────────────────────────────────────────────────────
-keep class com.android.billingclient.** { *; }
-dontwarn com.android.billingclient.**

# ─────────────────────────────────────────────────────────────
# 5. WEBKIT / WEBVIEW (used by Capacitor to render the React app)
# ─────────────────────────────────────────────────────────────
-keepclassmembers class * extends android.webkit.WebViewClient {
    public void *(android.webkit.WebView, java.lang.String, android.graphics.Bitmap);
    public boolean *(android.webkit.WebView, java.lang.String);
}
-keepclassmembers class * extends android.webkit.WebChromeClient {
    public void *(android.webkit.WebView, java.lang.String);
}

# ─────────────────────────────────────────────────────────────
# 6. ANDROID ANDROIDX / SUPPORT LIBRARY
# ─────────────────────────────────────────────────────────────
-keep class androidx.** { *; }
-dontwarn androidx.**

# ─────────────────────────────────────────────────────────────
# 7. KOTLIN / COROUTINES
# ─────────────────────────────────────────────────────────────
-keep class kotlin.** { *; }
-keep class kotlinx.** { *; }
-dontwarn kotlin.**
-dontwarn kotlinx.**

# ─────────────────────────────────────────────────────────────
# 8. GSON / JSON SERIALIZATION (used by Capacitor plugins)
# ─────────────────────────────────────────────────────────────
-keepattributes Signature
-keepattributes *Annotation*
-keep class com.google.gson.** { *; }
-keep class * implements com.google.gson.TypeAdapterFactory { *; }
-keep class * implements com.google.gson.JsonSerializer { *; }
-keep class * implements com.google.gson.JsonDeserializer { *; }

# ─────────────────────────────────────────────────────────────
# 9. OKHTTP / RETROFIT (network calls from plugins)
# ─────────────────────────────────────────────────────────────
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn retrofit2.**
-keep class okhttp3.** { *; }
-keep class retrofit2.** { *; }

# ─────────────────────────────────────────────────────────────
# 10. LOGGING — strip verbose/debug logs from release builds
# ─────────────────────────────────────────────────────────────
-assumenosideeffects class android.util.Log {
    public static *** v(...);
    public static *** d(...);
    public static *** i(...);
}

# ─────────────────────────────────────────────────────────────
# 11. CRASH REPORTING — keep stack trace class names readable
# ─────────────────────────────────────────────────────────────
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# ─────────────────────────────────────────────────────────────
# 12. MAIN LYNKAPP APPLICATION CLASS
# ─────────────────────────────────────────────────────────────
-keep class com.lynkapp.app.** { *; }
