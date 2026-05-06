const fs = require('fs');
const html = fs.readFileSync('ConnectHub_Mobile_Design.html', 'utf8');
const lines = html.split('\n');

console.log('=== CONNECTHUB_MOBILE_DESIGN.HTML AUDIT ===\n');
console.log('Total lines:', lines.length);
console.log('Total size (KB):', Math.round(html.length / 1024));

// Document structure
console.log('\n--- DOCUMENT STRUCTURE ---');
console.log('Has <!DOCTYPE html>:', /<!DOCTYPE html>/i.test(html));
console.log('Has <html lang>:', /<html\s+lang=/i.test(html));
console.log('Has <meta charset>:', /<meta\s+charset/i.test(html));
console.log('Has viewport meta:', /<meta\s+name="viewport"/i.test(html));
console.log('Has <body> tag:', /<body/i.test(html));
console.log('Has </body>:', /<\/body>/i.test(html));
console.log('Has </html>:', /<\/html>/i.test(html));
console.log('Closing html after closing body:', html.lastIndexOf('</html>') > html.lastIndexOf('</body>'));

// Script tags
console.log('\n--- SCRIPTS ---');
const scriptBlocks = html.match(/<script[\s\S]*?<\/script>/gi) || [];
const externalScripts = html.match(/<script[^>]+src=/gi) || [];
const inlineScripts = scriptBlocks.length - externalScripts.length;
console.log('Total <script> blocks:', scriptBlocks.length);
console.log('External scripts (src=):', externalScripts.length);
console.log('Inline script blocks:', inlineScripts);
console.log('DOMContentLoaded listeners:', (html.match(/DOMContentLoaded/g) || []).length);
console.log('window.onload usage:', (html.match(/window\.onload/g) || []).length);
console.log('window.onerror handler:', (html.match(/window\.onerror/g) || []).length);
console.log('Global try/catch blocks:', (html.match(/try\s*\{/g) || []).length);
console.log('Promise .catch() handlers:', (html.match(/\.catch\s*\(/g) || []).length);

// CSS
console.log('\n--- CSS ---');
const styleBlocks = html.match(/<style[\s\S]*?<\/style>/gi) || [];
const externalCss = html.match(/<link[^>]+stylesheet/gi) || [];
console.log('Inline <style> blocks:', styleBlocks.length);
console.log('External CSS links:', externalCss.length);

// HTML sections/navigation
console.log('\n--- SECTIONS & NAVIGATION ---');
const sectionIds = html.match(/id="[a-z-]+-section"/gi) || [];
console.log('Section containers found:', sectionIds.length);
console.log('Section IDs:', sectionIds.map(s => s.replace(/id="|"/g, '')).join(', '));
const navItems = html.match(/data-section="[^"]+"/gi) || [];
console.log('Nav items (data-section):', navItems.length, navItems.map(s => s.replace(/data-section="|"/g, '')).join(', '));

// Crash-prone patterns
console.log('\n--- CRASH RISK PATTERNS ---');
console.log('innerHTML= assignments:', (html.match(/\.innerHTML\s*=/g) || []).length);
console.log('eval() usage:', (html.match(/\beval\s*\(/g) || []).length);
console.log('document.write() usage:', (html.match(/document\.write\s*\(/g) || []).length);
console.log('setTimeout calls:', (html.match(/setTimeout\s*\(/g) || []).length);
console.log('setInterval calls:', (html.match(/setInterval\s*\(/g) || []).length);
console.log('null/undefined guard checks:', (html.match(/\?\./g) || []).length);
console.log('querySelector calls (no null check risk):', (html.match(/querySelector\s*\(/g) || []).length);

// App containers
console.log('\n--- APP CONTAINERS ---');
console.log('splash-screen divs:', (html.match(/class="splash-screen/g) || []).length);
console.log('app-container divs:', (html.match(/id="app-container"/g) || []).length);
console.log('bottom-nav divs:', (html.match(/class="bottom-nav/g) || []).length);
console.log('auth-screen divs:', (html.match(/class="auth-screen|id="auth-screen/g) || []).length);

// Firebase / external dependencies
console.log('\n--- EXTERNAL DEPENDENCIES ---');
console.log('Firebase SDK references:', (html.match(/firebase/gi) || []).length);
console.log('CDN script loads:', externalScripts);

// File size warning
console.log('\n--- PRODUCTION READINESS CONCERNS ---');
const sizeKB = Math.round(html.length / 1024);
if (sizeKB > 200) console.log('⚠️  FILE TOO LARGE: ' + sizeKB + 'KB - single HTML file should be under 50KB for production');
if (inlineScripts > 5) console.log('⚠️  INLINE SCRIPTS: ' + inlineScripts + ' inline <script> blocks - should be split into separate .js files');
if (styleBlocks.length > 3) console.log('⚠️  INLINE STYLES: ' + styleBlocks.length + ' inline <style> blocks - should be external CSS files');
if ((html.match(/window\.onerror/g) || []).length === 0) console.log('⚠️  NO GLOBAL ERROR HANDLER: window.onerror is not defined');
if ((html.match(/DOMContentLoaded/g) || []).length === 0) console.log('⚠️  NO DOMContentLoaded: scripts may run before DOM is ready');

console.log('\n=== AUDIT COMPLETE ===');
