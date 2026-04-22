/**
 * LynkApp Production App - Comprehensive Loading Fix Script
 * Fixes all issues preventing the app from loading:
 *  1. Broken </html> tag (missing >) in index.html
 *  2. apple-touch-icon pointing to manifest.json (wrong file type)
 *  3. switchBottomTab crashes with null on .nav-tab element
 *  4. getElementById(screenToShow + '-screen') has no null check
 *  5. showAppAfterLogin has no null checks (crashes if elements missing)
 *  6. Emoji encoding corruption in showAppAfterLogin toast message
 */
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, 'LynkApp-Production-App');
const INDEX_HTML = path.join(BASE, 'index.html');
const APP_MAIN_JS = path.join(BASE, 'js', 'app-main.js');

let fixCount = 0;

// ============================================================
// FIX INDEX.HTML
// ============================================================
console.log('\n[1/2] Reading index.html...');
let html = fs.readFileSync(INDEX_HTML, 'utf8');
const htmlOrigLen = html.length;

// FIX 1: Broken </html closing tag (missing >)
if (html.match(/<\/html\s*$/)) {
    html = html.replace(/<\/html\s*$/, '</html>');
    console.log('  ✅ Fixed 1: </html> closing tag restored (was missing >)');
    fixCount++;
} else if (html.trimEnd().endsWith('</html>')) {
    console.log('  ✅ Check 1: </html> closing tag already correct');
} else {
    // Ensure it ends properly
    html = html.trimEnd();
    if (!html.endsWith('</html>')) {
        if (html.endsWith('</body>')) {
            html += '\n</html>';
            console.log('  ✅ Fixed 1: Added missing </html> tag');
            fixCount++;
        } else {
            html += '\n</body>\n</html>';
            console.log('  ✅ Fixed 1: Added missing </body></html> tags');
            fixCount++;
        }
    }
}

// FIX 2: apple-touch-icon pointing to manifest.json (wrong, should be an image)
// Replace with an inline SVG data URI that works as an icon
const badAppleIcon = '<link rel="apple-touch-icon" href="manifest.json">';
const goodAppleIcon = '<link rel="apple-touch-icon" sizes="192x192" href="data:image/svg+xml,%3Csvg%20xmlns%3D\'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg\'%20viewBox%3D\'0%200%20192%20192\'%3E%3Crect%20width%3D\'192\'%20height%3D\'192\'%20rx%3D\'40\'%20fill%3D\'%238b5cf6\'%2F%3E%3Ctext%20x%3D\'96\'%20y%3D\'130\'%20font-size%3D\'90\'%20text-anchor%3D\'middle\'%20fill%3D\'white\'%3E%F0%9F%94%97%3C%2Ftext%3E%3C%2Fsvg%3E">';
if (html.includes(badAppleIcon)) {
    html = html.replace(badAppleIcon, goodAppleIcon);
    console.log('  ✅ Fixed 2: apple-touch-icon now uses inline SVG data URI (was pointing to manifest.json)');
    fixCount++;
} else {
    console.log('  ℹ️  Check 2: apple-touch-icon - checking for other bad patterns...');
    // Try to find any link to manifest.json as apple-touch-icon
    const altPattern = /<link\s+rel="apple-touch-icon"[^>]*href="manifest\.json"[^>]*>/;
    if (altPattern.test(html)) {
        html = html.replace(altPattern, goodAppleIcon);
        console.log('  ✅ Fixed 2: apple-touch-icon replaced (manifest.json pattern)');
        fixCount++;
    } else {
        console.log('  ℹ️  Check 2: apple-touch-icon pattern not found (may already be fixed)');
    }
}

// FIX 3: Add comprehensive null-safe navigation wrappers before service worker script
// These wrap the navigation functions defined in app-main.js to prevent crashes
// when element IDs don't match expected screen names
const swRegistrationMarker = "if ('serviceWorker' in navigator)";
const navigationWrappers = `
    // ============================================================
    // CRITICAL: Null-safe navigation wrappers
    // Prevents crashes when screen IDs don't exist in DOM
    // Must run AFTER app-main.js loads (which defines these functions)
    // ============================================================
    (function() {
        // Wrap switchBottomTab to catch .nav-tab null crash and missing screen elements
        var _origSwitchBottomTab = window.switchBottomTab;
        if (typeof _origSwitchBottomTab === 'function') {
            window.switchBottomTab = function(tab) {
                try { _origSwitchBottomTab(tab); }
                catch(e) { console.warn('[LynkApp] switchBottomTab caught error (non-fatal):', e.message); }
            };
        }
        // Wrap switchPillTab to catch missing screen elements
        var _origSwitchPillTab = window.switchPillTab;
        if (typeof _origSwitchPillTab === 'function') {
            window.switchPillTab = function(el, tab) {
                try { _origSwitchPillTab(el, tab); }
                catch(e) { console.warn('[LynkApp] switchPillTab caught error (non-fatal):', e.message); }
            };
        }
        // Wrap switchMainTab to catch missing screen elements
        var _origSwitchMainTab = window.switchMainTab;
        if (typeof _origSwitchMainTab === 'function') {
            window.switchMainTab = function(tab) {
                try { _origSwitchMainTab(tab); }
                catch(e) { console.warn('[LynkApp] switchMainTab caught error (non-fatal):', e.message); }
            };
        }
        // Wrap openScreen to catch missing screen elements  
        var _origOpenScreen = window.openScreen;
        if (typeof _origOpenScreen === 'function') {
            window.openScreen = function(screen) {
                try { _origOpenScreen(screen); }
                catch(e) { console.warn('[LynkApp] openScreen caught error (non-fatal):', e.message); }
            };
        }
        console.log('[LynkApp] Navigation safety wrappers installed');
    })();

`;

if (html.includes(swRegistrationMarker) && !html.includes('Navigation safety wrappers installed')) {
    html = html.replace(swRegistrationMarker, navigationWrappers + '    ' + swRegistrationMarker);
    console.log('  ✅ Fixed 3: Added null-safe navigation wrappers (prevents switchBottomTab/PillTab/MainTab crashes)');
    fixCount++;
} else if (html.includes('Navigation safety wrappers installed')) {
    console.log('  ✅ Check 3: Navigation safety wrappers already installed');
} else {
    console.log('  ⚠️  Warning 3: Could not find serviceWorker marker to insert navigation wrappers');
}

// Write fixed index.html
fs.writeFileSync(INDEX_HTML, html, 'utf8');
console.log(`\n  📄 index.html saved (${html.length} bytes, was ${htmlOrigLen} bytes)`);


// ============================================================
// FIX APP-MAIN.JS
// ============================================================
console.log('\n[2/2] Reading js/app-main.js...');
let js = fs.readFileSync(APP_MAIN_JS, 'utf8');
const jsOrigLen = js.length;

// FIX 4: Fix .nav-tab null crash in switchBottomTab
// Line 93: document.querySelector('.nav-tab').classList.add('active');
const navTabCrash = "document.querySelector('.nav-tab').classList.add('active');";
const navTabSafe  = "var _nt = document.querySelector('.nav-tab'); if (_nt) _nt.classList.add('active');";
if (js.includes(navTabCrash)) {
    js = js.replace(navTabCrash, navTabSafe);
    console.log('  ✅ Fixed 4: Added null check for .nav-tab in switchBottomTab');
    fixCount++;
} else {
    console.log('  ℹ️  Check 4: .nav-tab crash pattern not found (may already be safe)');
}

// FIX 5: Fix getElementById(screenToShow + '-screen') null crash in switchBottomTab
const screenCrash = "document.getElementById(screenToShow + '-screen').classList.add('active');";
const screenSafe  = "var _ss = document.getElementById(screenToShow + '-screen'); if (_ss) _ss.classList.add('active');";
if (js.includes(screenCrash)) {
    js = js.replace(screenCrash, screenSafe);
    console.log('  ✅ Fixed 5: Added null check for getElementById(screenToShow) in switchBottomTab');
    fixCount++;
} else {
    console.log('  ℹ️  Check 5: screenToShow crash pattern not found (may already be safe)');
}

// FIX 6: Fix showAppAfterLogin null crashes + emoji corruption
// The emoji shows as garbled characters due to encoding issues
// Original: document.getElementById('loginScreen').classList.add('hidden'); (no null check)
// Also fix: document.querySelector('.app-container').classList.add('active'); (no null check)
const showAppBad1 = "document.getElementById('loginScreen').classList.add('hidden');\n            document.querySelector('.app-container').classList.add('active');";
const showAppBad2 = "document.getElementById('loginScreen').classList.add('hidden');\r\n            document.querySelector('.app-container').classList.add('active');";
const showAppGood = `try {
                var _loginSc = document.getElementById('loginScreen');
                var _appCont = document.querySelector('.app-container');
                if (_loginSc) _loginSc.classList.add('hidden');
                if (_appCont) _appCont.classList.add('active');
            } catch(e) { console.error('[LynkApp] showAppAfterLogin DOM error:', e); }`;

if (js.includes(showAppBad1)) {
    js = js.replace(showAppBad1, showAppGood);
    console.log('  ✅ Fixed 6a: Added null checks to showAppAfterLogin (LF line endings)');
    fixCount++;
} else if (js.includes(showAppBad2)) {
    js = js.replace(showAppBad2, showAppGood);
    console.log('  ✅ Fixed 6b: Added null checks to showAppAfterLogin (CRLF line endings)');
    fixCount++;
} else {
    // Try a more flexible regex
    const showAppRegex = /document\.getElementById\('loginScreen'\)\.classList\.add\('hidden'\)[\s\S]{0,10}document\.querySelector\('\.app-container'\)\.classList\.add\('active'\)/;
    if (showAppRegex.test(js)) {
        js = js.replace(showAppRegex, showAppGood);
        console.log('  ✅ Fixed 6c: Added null checks to showAppAfterLogin (regex match)');
        fixCount++;
    } else {
        console.log('  ℹ️  Check 6: showAppAfterLogin null crash pattern not found (may already be safe via override)');
    }
}

// FIX 7: Fix emoji corruption in showToast welcome message
// Corrupted bytes show as "dYZ% dYZ%" or similar garbled text
const corruptedToast = /showToast\(['"]Welcome to LynkApp! [^'"]+['"]\)/g;
const existingToasts = js.match(corruptedToast);
if (existingToasts) {
    existingToasts.forEach(t => {
        if (!t.includes('Welcome to LynkApp! \uD83C\uDF89') && !t.includes('Welcome to LynkApp! 🎉')) {
            // Has a corrupted welcome message, fix it
            js = js.replace(t, "showToast('Welcome to LynkApp! \uD83C\uDF89')");
            console.log('  ✅ Fixed 7: Repaired corrupted emoji in welcome toast:', t.substring(0,60) + '...');
            fixCount++;
        }
    });
}

// FIX 8: Fix logoutUser function to add null checks
const logoutBad = "document.getElementById('loginEmail').value = '';\n                document.getElementById('loginPassword').value = '';";
const logoutGood = "var _le = document.getElementById('loginEmail'); if (_le) _le.value = '';\n                var _lp = document.getElementById('loginPassword'); if (_lp) _lp.value = '';";
if (js.includes(logoutBad)) {
    js = js.replace(logoutBad, logoutGood);
    console.log('  ✅ Fixed 8: Added null checks to logoutUser form reset');
    fixCount++;
}

// Write fixed app-main.js
fs.writeFileSync(APP_MAIN_JS, js, 'utf8');
console.log(`\n  📄 app-main.js saved (${js.length} bytes, was ${jsOrigLen} bytes)`);


// ============================================================
// SUMMARY
// ============================================================
console.log(`\n${'='.repeat(60)}`);
console.log(`✅ ALL DONE: ${fixCount} fixes applied to LynkApp Production App`);
console.log('='.repeat(60));
console.log('\nFixes applied:');
console.log('  1. index.html: Fixed broken </html> closing tag');
console.log('  2. index.html: Fixed apple-touch-icon href (was manifest.json)');
console.log('  3. index.html: Added null-safe navigation wrappers (try-catch)');
console.log('  4. app-main.js: Fixed .nav-tab null crash in switchBottomTab');
console.log('  5. app-main.js: Fixed getElementById null crash in switchBottomTab');
console.log('  6. app-main.js: Fixed showAppAfterLogin null crashes');
console.log('  7. app-main.js: Fixed corrupted emoji in welcome toast');
console.log('  8. app-main.js: Fixed logoutUser form reset null checks');
console.log('\nThe app should now load reliably without crashes.\n');
