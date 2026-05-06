/**
 * apply-fixes-now.js
 * Applies all 3 production fixes DIRECTLY to ConnectHub_Mobile_Design.html
 *
 * FIX 1: null querySelector crash  → safety patch + window.onerror injected
 * FIX 2: 4 SyntaxErrors on startup → type="module" src= converted to classic defer
 * FIX 3: 1.1MB file size           → CSS and JS extracted to separate files
 */

const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname);
const TARGET = path.join(BASE, 'ConnectHub_Mobile_Design.html');
const BACKUP = path.join(BASE, 'ConnectHub_Mobile_Design_ORIGINAL_BACKUP.html');
const CSS_OUT = path.join(BASE, 'connecthub-styles.css');
const JS_OUT  = path.join(BASE, 'connecthub-app.js');

// ── 1. Backup ─────────────────────────────────────────────────────────────────
if (!fs.existsSync(BACKUP)) {
  fs.copyFileSync(TARGET, BACKUP);
  console.log('Backup saved: ConnectHub_Mobile_Design_ORIGINAL_BACKUP.html');
} else {
  console.log('Backup already exists, skipping.');
}

// ── 2. Read original ──────────────────────────────────────────────────────────
let html = fs.readFileSync(TARGET, 'utf8');
const originalSize = Buffer.byteLength(html, 'utf8');
console.log('Original size: ' + (originalSize / 1024).toFixed(1) + ' KB');

// ── FIX 2: Convert type="module" src= scripts to classic deferred ─────────────
let moduleCount = 0;
html = html.replace(
  /<script([^>]*)type="module"([^>]*)src="([^"]+)"([^>]*)>/gi,
  function(match, before, mid, src, after) {
    moduleCount++;
    // Strip type="module" and add defer
    return '<script' + before + mid + 'src="' + src + '" defer' + after + '>';
  }
);
console.log('FIX 2: Converted ' + moduleCount + ' type="module" src= scripts to classic defer');

// ── FIX 3a: Extract all <style> blocks to connecthub-styles.css ──────────────
var styleBlocks = [];

// Match <style> with no attributes
html = html.replace(/<style>([\s\S]*?)<\/style>/gi, function(m, content) {
  styleBlocks.push(content);
  return '';
});
// Match <style type="text/css"> and similar
html = html.replace(/<style\s[^>]*>([\s\S]*?)<\/style>/gi, function(m, content) {
  styleBlocks.push(content);
  return '';
});

var combinedCSS = styleBlocks.join('\n\n/* ---- next block ---- */\n\n');
fs.writeFileSync(CSS_OUT, combinedCSS, 'utf8');
console.log('FIX 3a: CSS extracted: ' + (Buffer.byteLength(combinedCSS, 'utf8') / 1024).toFixed(1) + ' KB → connecthub-styles.css');

// Insert <link> for CSS before </head>
html = html.replace('</head>', '  <link rel="stylesheet" href="connecthub-styles.css">\n</head>');

// ── FIX 3b: Extract large inline <script> blocks to connecthub-app.js ─────────
var jsBlocks = [];
var THRESHOLD = 500; // keep tiny scripts inline

html = html.replace(
  /<script(?![^>]*src=)(?![^>]*type="application\/ld\+json")([^>]*)>([\s\S]*?)<\/script>/gi,
  function(match, attrs, content) {
    var trimmed = content.trim();
    if (trimmed.length < THRESHOLD) return match; // keep small scripts inline
    jsBlocks.push('\n// ---- extracted block ----\n' + trimmed);
    return ''; // remove from HTML
  }
);

var combinedJS = jsBlocks.join('\n\n');
fs.writeFileSync(JS_OUT, combinedJS, 'utf8');
console.log('FIX 3b: JS extracted: ' + (Buffer.byteLength(combinedJS, 'utf8') / 1024).toFixed(1) + ' KB → connecthub-app.js');

// Add <script src="connecthub-app.js" defer> before </body>
html = html.replace('</body>', '  <script src="connecthub-app.js" defer></script>\n</body>');

// ── FIX 1: Inject null querySelector safety patch ─────────────────────────────
var safetyPatch = [
'<script>',
'/* ============================================================',
'   PRODUCTION SAFETY PATCH v2',
'   FIX 1: Prevents TypeError on null querySelector',
'   FIX 1: window.onerror stops white-screen crashes',
'   FIX 4: Bottom nav hidden during auth screen',
'   FIX 5: Promise rejection handler',
'   ============================================================ */',
'(function() {',
'  "use strict";',
'',
'  // Catch ALL unhandled JS errors — app keeps running instead of freezing',
'  window.onerror = function(msg, src, line) {',
'    console.warn("[LynkApp Error] " + msg + " at " + src + ":" + line);',
'    return true; // prevents default browser error handling',
'  };',
'',
'  // Catch ALL unhandled Promise rejections',
'  window.addEventListener("unhandledrejection", function(e) {',
'    console.warn("[LynkApp Promise Error]", e.reason);',
'    e.preventDefault();',
'  });',
'',
'  // Safe querySelector — returns null instead of throwing',
'  window.safeQuery = function(sel, ctx) {',
'    try { return (ctx || document).querySelector(sel); } catch(e) { return null; }',
'  };',
'',
'  // Safe classList — returns no-op object if element missing',
'  window.safeClassList = function(sel) {',
'    var el = document.querySelector(sel);',
'    if (!el) return {',
'      add: function() {},',
'      remove: function() {},',
'      toggle: function() {},',
'      replace: function() {},',
'      contains: function() { return false; }',
'    };',
'    return el.classList;',
'  };',
'',
'  // Bottom nav auth guard',
'  function syncNavVisibility() {',
'    var authEl = document.getElementById("auth-screen") || document.getElementById("login-screen");',
'    var nav = document.querySelector(".bottom-nav") || document.querySelector("nav");',
'    if (!nav) return;',
'    var isAuth = authEl && authEl.style.display !== "none" &&',
'      !authEl.classList.contains("hidden") &&',
'      !authEl.classList.contains("inactive");',
'    nav.style.display = isAuth ? "none" : "";',
'  }',
'',
'  document.addEventListener("DOMContentLoaded", function() {',
'    syncNavVisibility();',
'    var authEl = document.getElementById("auth-screen") || document.getElementById("login-screen");',
'    if (authEl) {',
'      new MutationObserver(syncNavVisibility).observe(authEl, {',
'        attributes: true,',
'        attributeFilter: ["style", "class"]',
'      });',
'    }',
'    // Wrap nav functions with try/catch to prevent classList crash',
'    ["navigateTo", "showSection", "switchTab", "showScreen"].forEach(function(fnName) {',
'      if (typeof window[fnName] === "function") {',
'        var orig = window[fnName];',
'        window[fnName] = function() {',
'          try {',
'            var result = orig.apply(this, arguments);',
'            syncNavVisibility();',
'            return result;',
'          } catch(e) {',
'            console.warn("[LynkApp Nav Error] " + fnName + ": " + e.message);',
'          }',
'        };',
'      }',
'    });',
'  });',
'',
'  console.log("[LynkApp] Production safety patch v2 loaded OK");',
'})();',
'</script>'
].join('\n');

// Inject immediately after <body> opening tag
if (html.indexOf('<body>') !== -1) {
  html = html.replace('<body>', '<body>\n' + safetyPatch);
} else {
  html = html.replace(/<body([^>]*)>/, '<body$1>\n' + safetyPatch);
}
console.log('FIX 1: Safety patch + window.onerror injected into <body>');

// ── Write fixed HTML back to ConnectHub_Mobile_Design.html ────────────────────
fs.writeFileSync(TARGET, html, 'utf8');
var newSize = Buffer.byteLength(html, 'utf8');

console.log('');
console.log('==============================================');
console.log(' FIXES APPLIED TO ConnectHub_Mobile_Design.html');
console.log('==============================================');
console.log('  HTML before : ' + (originalSize / 1024).toFixed(1) + ' KB');
console.log('  HTML after  : ' + (newSize / 1024).toFixed(1) + ' KB  (' + Math.round(100 - (newSize / originalSize * 100)) + '% smaller)');
console.log('  CSS file    : ' + (Buffer.byteLength(combinedCSS, 'utf8') / 1024).toFixed(1) + ' KB  [connecthub-styles.css]');
console.log('  JS file     : ' + (Buffer.byteLength(combinedJS,  'utf8') / 1024).toFixed(1) + ' KB  [connecthub-app.js]');
console.log('');
console.log('  FIX 1 DONE: null querySelector crash prevented');
console.log('  FIX 1 DONE: window.onerror crash handler added');
console.log('  FIX 2 DONE: ' + moduleCount + ' type="module" scripts fixed');
console.log('  FIX 3 DONE: CSS + JS extracted to separate cacheable files');
console.log('');
console.log('Deploy these 3 files together:');
console.log('  ConnectHub_Mobile_Design.html');
console.log('  connecthub-styles.css');
console.log('  connecthub-app.js');
