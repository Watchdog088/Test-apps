/**
 * LynkApp Production Build Script
 * Minifies HTML, CSS, and JS for optimized deployment
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SRC = 'ConnectHub-Frontend/production';
const DIST = 'ConnectHub-Frontend/dist';

console.log('=== LynkApp Production Build ===\n');

// Clean dist
if (fs.existsSync(DIST)) {
    fs.rmSync(DIST, { recursive: true });
}
fs.mkdirSync(`${DIST}/css`, { recursive: true });
fs.mkdirSync(`${DIST}/js`, { recursive: true });
fs.mkdirSync(`${DIST}/services`, { recursive: true });

// Track sizes
const sizes = { before: {}, after: {} };

function getSize(file) {
    return fs.existsSync(file) ? fs.statSync(file).size : 0;
}

function formatSize(bytes) {
    return (bytes / 1024).toFixed(1) + ' KB';
}

// ── 1. Minify CSS ──
console.log('[1/4] Minifying CSS...');
const cssFile = `${SRC}/css/lynkapp-main.css`;
sizes.before.css = getSize(cssFile);
try {
    execSync(`npx cleancss -o "${DIST}/css/lynkapp-main.css" "${cssFile}"`, { stdio: 'pipe' });
    sizes.after.css = getSize(`${DIST}/css/lynkapp-main.css`);
    console.log(`   ✓ CSS: ${formatSize(sizes.before.css)} → ${formatSize(sizes.after.css)} (${(100 - sizes.after.css/sizes.before.css*100).toFixed(0)}% smaller)`);
} catch (e) {
    console.log('   ⚠ CSS minification failed, copying original');
    fs.copyFileSync(cssFile, `${DIST}/css/lynkapp-main.css`);
    sizes.after.css = sizes.before.css;
}

// ── 2. Minify JS files ──
console.log('\n[2/4] Minifying JavaScript...');
const jsFiles = [
    { src: 'js/splash-init.js', dist: 'js/splash-init.js' },
    { src: 'js/consent-onboarding.js', dist: 'js/consent-onboarding.js' },
    { src: 'js/app-main.js', dist: 'js/app-main.js' },
    { src: 'js/user-testing-fixes.js', dist: 'js/user-testing-fixes.js' },
    { src: 'js/performance-optimizer.js', dist: 'js/performance-optimizer.js' },
];

let totalJsBefore = 0, totalJsAfter = 0;

jsFiles.forEach(f => {
    const srcFile = `${SRC}/${f.src}`;
    const distFile = `${DIST}/${f.dist}`;
    if (!fs.existsSync(srcFile)) {
        console.log(`   ⚠ Skipping ${f.src} (not found)`);
        return;
    }
    const before = getSize(srcFile);
    totalJsBefore += before;
    try {
        execSync(`npx terser "${srcFile}" -o "${distFile}" --compress --mangle --source-map`, { stdio: 'pipe' });
        const after = getSize(distFile);
        totalJsAfter += after;
        console.log(`   ✓ ${f.src}: ${formatSize(before)} → ${formatSize(after)} (${(100 - after/before*100).toFixed(0)}% smaller)`);
    } catch (e) {
        console.log(`   ⚠ ${f.src} minification failed, copying original`);
        fs.copyFileSync(srcFile, distFile);
        totalJsAfter += before;
    }
});

// Minify service files
const serviceFiles = fs.readdirSync(`${SRC}/services`).filter(f => f.endsWith('.js'));
serviceFiles.forEach(f => {
    const srcFile = `${SRC}/services/${f}`;
    const distFile = `${DIST}/services/${f}`;
    const before = getSize(srcFile);
    totalJsBefore += before;
    try {
        // Service files use ES modules (import/export), use module mode
        execSync(`npx terser "${srcFile}" -o "${distFile}" --compress --mangle --module`, { stdio: 'pipe' });
        const after = getSize(distFile);
        totalJsAfter += after;
        console.log(`   ✓ services/${f}: ${formatSize(before)} → ${formatSize(after)} (${(100 - after/before*100).toFixed(0)}% smaller)`);
    } catch (e) {
        console.log(`   ⚠ services/${f} minification failed, copying original`);
        fs.copyFileSync(srcFile, distFile);
        totalJsAfter += before;
    }
});

// ── 3. Minify HTML ──
console.log('\n[3/4] Minifying HTML...');
const htmlFile = `${SRC}/index.html`;
sizes.before.html = getSize(htmlFile);
try {
    execSync(`npx html-minifier-terser --collapse-whitespace --remove-comments --remove-redundant-attributes --minify-css true --minify-js true -o "${DIST}/index.html" "${htmlFile}"`, { stdio: 'pipe' });
    sizes.after.html = getSize(`${DIST}/index.html`);
    console.log(`   ✓ HTML: ${formatSize(sizes.before.html)} → ${formatSize(sizes.after.html)} (${(100 - sizes.after.html/sizes.before.html*100).toFixed(0)}% smaller)`);
} catch (e) {
    console.log('   ⚠ HTML minification failed, copying original');
    fs.copyFileSync(htmlFile, `${DIST}/index.html`);
    sizes.after.html = sizes.before.html;
}

// ── 4. Generate build manifest ──
console.log('\n[4/4] Generating build manifest...');
const manifest = {
    name: 'LynkApp',
    version: '2.5.1',
    buildDate: new Date().toISOString(),
    files: {
        html: { original: sizes.before.html, minified: sizes.after.html },
        css: { original: sizes.before.css, minified: sizes.after.css },
        js: { original: totalJsBefore, minified: totalJsAfter }
    },
    totalOriginal: sizes.before.html + sizes.before.css + totalJsBefore,
    totalMinified: sizes.after.html + sizes.after.css + totalJsAfter,
};
manifest.reductionPercent = ((1 - manifest.totalMinified / manifest.totalOriginal) * 100).toFixed(1);
fs.writeFileSync(`${DIST}/build-manifest.json`, JSON.stringify(manifest, null, 2));

// ── Summary ──
console.log('\n' + '='.repeat(50));
console.log('BUILD COMPLETE');
console.log('='.repeat(50));
console.log(`\nOutput: ${DIST}/`);
console.log(`\n  Component     Before        After         Saved`);
console.log(`  ${'─'.repeat(55)}`);
console.log(`  HTML          ${formatSize(sizes.before.html).padEnd(14)}${formatSize(sizes.after.html).padEnd(14)}${(100 - sizes.after.html/sizes.before.html*100).toFixed(0)}%`);
console.log(`  CSS           ${formatSize(sizes.before.css).padEnd(14)}${formatSize(sizes.after.css).padEnd(14)}${(100 - sizes.after.css/sizes.before.css*100).toFixed(0)}%`);
console.log(`  JS (all)      ${formatSize(totalJsBefore).padEnd(14)}${formatSize(totalJsAfter).padEnd(14)}${(100 - totalJsAfter/totalJsBefore*100).toFixed(0)}%`);
console.log(`  ${'─'.repeat(55)}`);
console.log(`  TOTAL         ${formatSize(manifest.totalOriginal).padEnd(14)}${formatSize(manifest.totalMinified).padEnd(14)}${manifest.reductionPercent}%`);
console.log(`\n  🚀 Total size reduced by ${manifest.reductionPercent}%!`);
