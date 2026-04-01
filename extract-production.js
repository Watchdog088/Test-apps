/**
 * Production Extraction Script
 * Splits ConnectHub_Mobile_Design.html monolith into proper file structure
 * Also rebrands ConnectHub → LynkApp
 */
const fs = require('fs');
const path = require('path');

const SOURCE = 'ConnectHub_Mobile_Design.html';
const PROD_DIR = 'ConnectHub-Frontend/production';

console.log('=== LynkApp Production Extraction ===\n');

// Read the source file
const content = fs.readFileSync(SOURCE, 'utf-8');
const lines = content.split('\n');
console.log(`Source file: ${lines.length} lines, ${(content.length / 1024 / 1024).toFixed(2)} MB`);

// Create production directory structure
const dirs = [
    `${PROD_DIR}`,
    `${PROD_DIR}/css`,
    `${PROD_DIR}/js`,
    `${PROD_DIR}/services`,
];
dirs.forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// ── 1. Extract CSS (lines 9 to 2036, between <style> and </style>) ──
console.log('\n[1/5] Extracting CSS...');
const cssStart = lines.findIndex(l => l.trim() === '<style>');
const cssEnd = lines.findIndex(l => l.trim() === '</style>');
let cssContent = lines.slice(cssStart + 1, cssEnd).join('\n');

// Rebrand CSS comments
cssContent = cssContent.replace(/ConnectHub/g, 'LynkApp');

fs.writeFileSync(`${PROD_DIR}/css/lynkapp-main.css`, cssContent);
console.log(`   ✓ css/lynkapp-main.css (${(cssContent.length / 1024).toFixed(1)} KB, ${cssEnd - cssStart - 1} lines)`);

// ── 2. Extract small inline scripts ──
console.log('\n[2/5] Extracting inline scripts...');

// Script 1: Splash init (lines 2049-2063 approx)
const script1Start = content.indexOf('<script>', content.indexOf('<body'));
const script1Content = extractScriptAt(lines, 2048); // 0-indexed
fs.writeFileSync(`${PROD_DIR}/js/splash-init.js`, rebrand(script1Content));
console.log(`   ✓ js/splash-init.js (${(script1Content.length / 1024).toFixed(1)} KB)`);

// Script 2: Consent/onboarding (lines 2070-2418 approx)
const script2Content = extractScriptAt(lines, 2069);
fs.writeFileSync(`${PROD_DIR}/js/consent-onboarding.js`, rebrand(script2Content));
console.log(`   ✓ js/consent-onboarding.js (${(script2Content.length / 1024).toFixed(1)} KB)`);

// Script 3: Main app logic (lines 11820-21003 approx)
console.log('\n[3/5] Extracting main application JS...');
const mainScriptContent = extractScriptAt(lines, 11819);
fs.writeFileSync(`${PROD_DIR}/js/app-main.js`, rebrand(mainScriptContent));
console.log(`   ✓ js/app-main.js (${(mainScriptContent.length / 1024).toFixed(1)} KB, ${mainScriptContent.split('\n').length} lines)`);

// ── 4. Extract HTML body ──
console.log('\n[4/5] Building production HTML...');

// Get the HTML body content (between </style></head> and first big script area near end)
// Lines 2039 to 11761 is the body, minus the small scripts we extracted
let htmlBody = '';

// Part A: from <body> to first script (line 2039 to 2048)
htmlBody += lines.slice(2038, 2048).join('\n') + '\n';

// Part B: between first and second script (line 2064 to 2069)
htmlBody += lines.slice(2063, 2069).join('\n') + '\n';

// Part C: between second script and module scripts (line 2419 to 11761)
htmlBody += lines.slice(2418, 11761).join('\n') + '\n';

// Part D: between module scripts and main script (line 11767 to 11819)
htmlBody += lines.slice(11766, 11819).join('\n') + '\n';

// Rebrand HTML body
htmlBody = rebrand(htmlBody);

// Build the production HTML
const productionHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="description" content="LynkApp - Connect, Share, and Discover. The ultimate social platform for meaningful connections.">
    <meta name="theme-color" content="#4f46e5">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="LynkApp">
    
    <!-- Open Graph / Social Sharing -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="LynkApp - Connect, Share, Discover">
    <meta property="og:description" content="The ultimate social platform for meaningful connections.">
    <meta property="og:url" content="https://lynkapp.com">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="LynkApp">
    <meta name="twitter:description" content="Connect, Share, and Discover.">
    
    <!-- Security -->
    <meta http-equiv="X-Content-Type-Options" content="nosniff">
    <meta http-equiv="X-Frame-Options" content="DENY">
    <meta name="referrer" content="strict-origin-when-cross-origin">
    
    <title>LynkApp - Connect, Share, Discover</title>
    
    <!-- External CSS -->
    <link rel="stylesheet" href="css/lynkapp-main.css">
    
    <!-- PWA -->
    <link rel="manifest" href="manifest.json">
    <link rel="apple-touch-icon" href="icons/icon-192.png">
    
    <!-- Preconnect for performance -->
    <link rel="preconnect" href="https://firebaseio.com">
    <link rel="preconnect" href="https://googleapis.com">
    <link rel="dns-prefetch" href="https://firebaseio.com">
</head>
${htmlBody}
    <!-- External JS - Splash & Consent -->
    <script src="js/splash-init.js"></script>
    <script src="js/consent-onboarding.js"></script>
    
    <!-- Service Layer -->
    <script type="module" src="services/api-service.js"></script>
    <script type="module" src="services/auth-service.js"></script>
    <script type="module" src="services/realtime-service.js"></script>
    <script type="module" src="services/state-service.js"></script>
    <script type="module" src="services/mobile-app-integration.js"></script>
    
    <!-- Main Application Logic -->
    <script src="js/app-main.js"></script>
    
    <!-- User Testing Fixes -->
    <script src="js/user-testing-fixes.js"></script>
</body>
</html>`;

fs.writeFileSync(`${PROD_DIR}/index.html`, productionHTML);
console.log(`   ✓ index.html (${(productionHTML.length / 1024).toFixed(1)} KB)`);

// ── 5. Copy service files ──
console.log('\n[5/5] Copying service files...');
const serviceFiles = [
    'api-service.js', 'auth-service.js', 'realtime-service.js',
    'state-service.js', 'mobile-app-integration.js'
];
serviceFiles.forEach(f => {
    const src = `ConnectHub-Frontend/src/services/${f}`;
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, `${PROD_DIR}/services/${f}`);
        console.log(`   ✓ services/${f}`);
    }
});

// Copy user-testing-fixes
const utfSrc = 'ConnectHub-Frontend/src/js/user-testing-fixes.js';
if (fs.existsSync(utfSrc)) {
    fs.copyFileSync(utfSrc, `${PROD_DIR}/js/user-testing-fixes.js`);
    console.log('   ✓ js/user-testing-fixes.js');
}

// ── Summary ──
console.log('\n=== EXTRACTION COMPLETE ===');
console.log(`Output directory: ${PROD_DIR}/`);

const origSize = content.length;
const htmlSize = productionHTML.length;
const cssSize = cssContent.length;
const jsSize = script1Content.length + script2Content.length + mainScriptContent.length;

console.log(`\nFile sizes:`);
console.log(`  Original monolith:  ${(origSize / 1024).toFixed(1)} KB`);
console.log(`  New index.html:     ${(htmlSize / 1024).toFixed(1)} KB (HTML structure only)`);
console.log(`  lynkapp-main.css:   ${(cssSize / 1024).toFixed(1)} KB`);
console.log(`  All JS combined:    ${(jsSize / 1024).toFixed(1)} KB`);
console.log(`\n  HTML reduced by: ${(100 - (htmlSize / origSize * 100)).toFixed(0)}%`);
console.log(`  (CSS & JS now load separately = faster perceived load)`);

// ── Helper Functions ──
function extractScriptAt(lines, startIdx) {
    // startIdx is 0-indexed line where <script> tag is
    let result = [];
    let started = false;
    for (let i = startIdx; i < lines.length; i++) {
        if (lines[i].includes('<script') && !started) {
            started = true;
            // Don't include the <script> tag itself
            continue;
        }
        if (started && lines[i].includes('</script>')) {
            break;
        }
        if (started) {
            result.push(lines[i]);
        }
    }
    return result.join('\n');
}

function rebrand(text) {
    return text
        .replace(/ConnectHub\s*-\s*Complete Prototype/g, 'LynkApp')
        .replace(/ConnectHub/g, 'LynkApp')
        .replace(/connecthub/gi, 'lynkapp')
        .replace(/Welcome to LynkApp!/g, 'Welcome to LynkApp! 🎉');
}
