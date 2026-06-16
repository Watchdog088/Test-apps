const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');

const newContent =
`// Top-level build file where you can add configuration options common to all sub-projects/modules.

buildscript {

    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.13.2'
        classpath 'com.google.gms:google-services:4.4.2'

        // NOTE: Do not place your application dependencies here; they belong
        // in the individual module build.gradle files
    }
}

apply from: "variables.gradle"

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

// tasks.register is the modern API.
// The old 'task clean(type: Delete)' syntax and rootProject.buildDir
// were removed/deprecated in Gradle 8.x and cause CONFIGURE FAILED on
// Gradle 8.14.4 which ships with Android Studio Ladybug and newer.
tasks.register('clean', Delete) {
    delete layout.buildDirectory
}
`;

const tmp = path.join(os.tmpdir(), 'build.gradle.tmp');
fs.writeFileSync(tmp, newContent, { encoding: 'utf8' });
console.log('Temp file written:', tmp);

const repoRoot = __dirname;
process.chdir(repoRoot);

// Create a git blob object
const hash = execSync(`git hash-object -w "${tmp}"`).toString().trim();
console.log('Git blob hash:', hash);

// Update the index to point to the new blob
execSync(`git update-index --cacheinfo 100644,${hash},ConnectHub-SPA/android/build.gradle`);
console.log('Index updated');

fs.unlinkSync(tmp);

// Verify the diff now shows changes
const diff = execSync('git diff HEAD -- ConnectHub-SPA/android/build.gradle').toString();
console.log('Diff preview (first 300 chars):\n', diff.slice(0, 300));

// Commit
execSync('git commit -m "fix(android): replace deprecated task clean/rootProject.buildDir with tasks.register+layout.buildDirectory (Gradle 8.14.4)"');
console.log('Committed!');

// Push
execSync('git push origin main');
console.log('Pushed to origin/main!');
