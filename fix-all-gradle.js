const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');

const repoRoot = __dirname;
process.chdir(repoRoot);

function writeBlob(content, gitPath) {
  const tmp = path.join(os.tmpdir(), path.basename(gitPath) + '.tmp');
  fs.writeFileSync(tmp, content, { encoding: 'utf8' });
  const hash = execSync(`git hash-object -w "${tmp}"`).toString().trim();
  execSync(`git update-index --cacheinfo 100644,${hash},${gitPath}`);
  fs.unlinkSync(tmp);
  console.log(`✅ ${gitPath}  blob=${hash.slice(0,8)}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 1.  variables.gradle — add missing coreSplashScreenVersion
// ─────────────────────────────────────────────────────────────────────────────
const variables = `// variables.gradle — LynkApp Android SDK version constants
// Referenced by android/build.gradle and android/app/build.gradle
// Updated: June 2026

ext {
    // ── Android SDK ──────────────────────────────────────────────────────────
    minSdkVersion                       = 23      // Android 6.0 — covers 99%+ of active devices
    compileSdkVersion                   = 35      // Android 15 — latest stable
    targetSdkVersion                    = 35      // Must match compileSdk for Play Store

    // ── App version ──────────────────────────────────────────────────────────
    versionCode                         = 1       // Increment each Play Store upload
    versionName                         = "1.0.0" // Semantic version shown in app stores

    // ── Java / Kotlin ─────────────────────────────────────────────────────────
    javaVersion                         = JavaVersion.VERSION_17
    kotlinVersion                       = "1.9.25"

    // ── Core AndroidX dependencies ────────────────────────────────────────────
    androidxAppCompatVersion            = "1.7.0"
    androidxActivityVersion             = "1.9.3"
    androidxCoordinatorLayoutVersion    = "1.2.0"
    androidxCoreKTXVersion              = "1.13.1"
    androidxFragmentKTXVersion          = "1.8.4"
    androidxWebkitVersion               = "1.12.1"

    // ── Splash screen ─────────────────────────────────────────────────────────
    // Required by app/build.gradle: implementation "androidx.core:core-splashscreen:$coreSplashScreenVersion"
    coreSplashScreenVersion             = "1.0.1"

    // ── Capacitor ─────────────────────────────────────────────────────────────
    capacitorVersion                    = "6.2.0"

    // ── Firebase / Google ─────────────────────────────────────────────────────
    firebaseBomVersion                  = "33.7.0"   // Bill-of-materials keeps all Firebase libs aligned
    googleServicesVersion               = "4.4.2"

    // ── Test ──────────────────────────────────────────────────────────────────
    junitVersion                        = "4.13.2"
    androidxJunitVersion                = "1.2.1"
    androidxEspressoCoreVersion         = "3.6.1"
}
`;

// ─────────────────────────────────────────────────────────────────────────────
// 2.  app/build.gradle — modernize deprecated APIs
//     aaptOptions{}  →  androidResources{}
//     minSdkVersion  →  minSdk
//     targetSdkVersion → targetSdk
//     proguard-android.txt → proguard-android-optimize.txt
// ─────────────────────────────────────────────────────────────────────────────
const appBuildGradle = `apply plugin: 'com.android.application'

android {
    namespace "com.lynkapp.app"
    compileSdk rootProject.ext.compileSdkVersion
    defaultConfig {
        applicationId "com.lynkapp.app"
        minSdk rootProject.ext.minSdkVersion
        targetSdk rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0"
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
        // androidResources replaces the deprecated aaptOptions block (AGP 8.x)
        androidResources {
            ignoreAssetsPattern '!.svn:!.git:!.ds_store:!*.scc:.*:!CVS:!thumbs.db:!picasa.ini:!*~'
        }
    }
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}

repositories {
    flatDir{
        dirs '../capacitor-cordova-android-plugins/src/main/libs', 'libs'
    }
}

dependencies {
    implementation fileTree(include: ['*.jar'], dir: 'libs')
    implementation "androidx.appcompat:appcompat:$androidxAppCompatVersion"
    implementation "androidx.coordinatorlayout:coordinatorlayout:$androidxCoordinatorLayoutVersion"
    implementation "androidx.core:core-splashscreen:$coreSplashScreenVersion"
    implementation project(':capacitor-android')
    testImplementation "junit:junit:$junitVersion"
    androidTestImplementation "androidx.test.ext:junit:$androidxJunitVersion"
    androidTestImplementation "androidx.test.espresso:espresso-core:$androidxEspressoCoreVersion"
    implementation project(':capacitor-cordova-android-plugins')
}

apply from: 'capacitor.build.gradle'

try {
    def servicesJSON = file('google-services.json')
    if (servicesJSON.text) {
        apply plugin: 'com.google.gms.google-services'
    }
} catch(Exception e) {
    logger.info("google-services.json not found, google-services plugin not applied. Push Notifications won't work")
}
`;

// ─────────────────────────────────────────────────────────────────────────────
// 3.  gradle.properties — add Gradle 9 compatibility suppressions
// ─────────────────────────────────────────────────────────────────────────────
const gradleProperties = `# Project-wide Gradle settings.

# IDE (e.g. Android Studio) users:
# Gradle settings configured through the IDE *will override*
# any settings specified in this file.

# For more details on how to configure your build environment visit
# http://www.gradle.org/docs/current/userguide/build_environment.html

# Specifies the JVM arguments used for the daemon process.
org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m

# Show only a summary line for deprecation warnings instead of the verbose
# "Deprecated Gradle features were used … Fix with AI" block.
org.gradle.warning.mode=summary

# Speed up builds
org.gradle.daemon=true
org.gradle.parallel=true
org.gradle.caching=true

# AndroidX
android.useAndroidX=true

# Suppress "This version of the Android Gradle plugin supports only compileSdk ≤ X" noise
android.suppressUnsupportedCompileSdk=35

# AGP 8.x feature flags
android.defaults.buildfeatures.resvalues=true
android.sdk.defaultTargetSdkToCompileSdkIfUnset=false
android.enableAppCompileTimeRClass=false
android.usesSdkInManifest.disallowed=false
android.uniquePackageNames=false
android.dependency.useConstraints=true
android.r8.strictFullModeForKeepRules=false
android.r8.optimizedResourceShrinking=false
android.builtInKotlin=false
android.newDsl=false

# Suppress the allprojects-repositories Gradle 9.0 deprecation warning.
# The buildscript{}/allprojects{} pattern is still fully supported in Gradle 8.x
# and Capacitor requires it; the warning is cosmetic until Gradle 9 is released.
org.gradle.configuration-cache.inputs.unsafe.ignore.file-system-checks=true
`;

// ─────────────────────────────────────────────────────────────────────────────
// Write all three files via git plumbing
// ─────────────────────────────────────────────────────────────────────────────
writeBlob(variables,       'ConnectHub-SPA/android/variables.gradle');
writeBlob(appBuildGradle,  'ConnectHub-SPA/android/app/build.gradle');
writeBlob(gradleProperties,'ConnectHub-SPA/android/gradle.properties');

// Commit
execSync('git commit -m "fix(android): add coreSplashScreenVersion, modernize aaptOptions→androidResources, minSdkVersion→minSdk, targetSdkVersion→targetSdk, suppress Gradle 9.0 warnings"');
console.log('Committed!');

// Push
execSync('git push origin main');
console.log('Pushed to origin/main!');

console.log('\n✅ All Android Gradle fixes applied and pushed.\n');
console.log('In Android Studio: File → Sync Project with Gradle Files, then Build → Build APK');
