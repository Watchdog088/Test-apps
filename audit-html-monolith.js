const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'ConnectHub_Mobile_Design.html');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

function grep(pattern, limit = 50) {
  return lines
    .map((l, i) => ({ n: i + 1, l }))
    .filter(x => pattern.test(x.l))
    .slice(0, limit);
}

function section(title) {
  console.log('\n' + '='.repeat(60));
  console.log('  ' + title);
  console.log('='.repeat(60));
}

section('FILE STATS');
console.log('Total lines  : ' + lines.length);
console.log('File size KB : ' + Math.round(fs.statSync(filePath).size / 1024));

section('DOCTYPE / HTML / HEAD / BODY TAGS');
grep(/<!DOCTYPE|<html|<head>|<body|<\/body|<\/html/).forEach(x =>
  console.log('  Line ' + String(x.n).padStart(5) + ' : ' + x.l.trim().substring(0, 120))
);

section('META TAGS (viewport, charset, manifest, csp)');
grep(/viewport|charset|manifest|Content-Security/).forEach(x =>
  console.log('  Line ' + String(x.n).padStart(5) + ' : ' + x.l.trim().substring(0, 120))
);

section('ALL SCRIPT TAGS (location matters!)');
grep(/<script/).forEach(x =>
  console.log('  Line ' + String(x.n).padStart(5) + ' : ' + x.l.trim().substring(0, 120))
);

section('EXTERNAL DEPENDENCIES (script src=)');
const extScripts = grep(/src=["']https?:\/\/|src=["'][^.]+\./);
if (extScripts.length === 0) {
  console.log('  NONE — all JavaScript is inline (self-contained ✅)');
} else {
  extScripts.forEach(x => console.log('  Line ' + String(x.n).padStart(5) + ' : ' + x.l.trim()));
}

section('NAVIGATION FUNCTIONS');
grep(/function showSection|function navigateTo|function navigate\b/).forEach(x =>
  console.log('  Line ' + String(x.n).padStart(5) + ' : ' + x.l.trim().substring(0, 120))
);

section('ERROR HANDLERS (window.onerror / unhandledrejection)');
const errHandlers = grep(/window\.onerror|window\.onunhandledrejection|unhandledrejection/);
if (errHandlers.length === 0) {
  console.log('  ❌ NONE FOUND — No global error handler! Uncaught errors will crash silently.');
} else {
  errHandlers.forEach(x => console.log('  Line ' + String(x.n).padStart(5) + ' : ' + x.l.trim().substring(0, 120)));
}

section('FIREBASE INITIALIZATION');
const fbInit = grep(/initializeApp|getAuth\(|getFirestore\(|firebase\.initializeApp/);
if (fbInit.length === 0) {
  console.log('  ⚠️  NO Firebase initializeApp found — app uses local/mock data only');
} else {
  fbInit.slice(0, 8).forEach(x => console.log('  Line ' + String(x.n).padStart(5) + ' : ' + x.l.trim().substring(0, 120)));
}

section('TRY/CATCH BLOCKS (error safety)');
const tryCatch = grep(/try\s*\{/);
console.log('  Count: ' + tryCatch.length);
tryCatch.forEach(x => console.log('  Line ' + String(x.n).padStart(5) + ' : ' + x.l.trim().substring(0, 120)));

section('ONCLICK INLINE HANDLERS (count)');
const onclicks = grep(/onclick=/);
console.log('  Total onclick= attributes: ' + onclicks.length);
console.log('  (High count = difficult to debug, no error isolation per handler)');

section('APP SECTION IDs (navigation targets)');
grep(/id="[a-zA-Z]+[Ss]ection"/).slice(0, 30).forEach(x =>
  console.log('  Line ' + String(x.n).padStart(5) + ' : ' + x.l.trim().substring(0, 120))
);

section('BOTTOM NAVIGATION STRUCTURE');
grep(/bottom-nav|bottomNav|nav-item/).slice(0, 15).forEach(x =>
  console.log('  Line ' + String(x.n).padStart(5) + ' : ' + x.l.trim().substring(0, 120))
);

section('SPLASH SCREEN');
grep(/splashScreen|splash-screen|splash/).slice(0, 5).forEach(x =>
  console.log('  Line ' + String(x.n).padStart(5) + ' : ' + x.l.trim().substring(0, 120))
);

section('DUPLICATE FUNCTION DEFINITIONS (crash risk)');
const funcDefs = {};
grep(/^\s*function\s+\w+/).forEach(x => {
  const m = x.l.match(/function\s+(\w+)/);
  if (m) {
    if (!funcDefs[m[1]]) funcDefs[m[1]] = [];
    funcDefs[m[1]].push(x.n);
  }
});
const dupes = Object.entries(funcDefs).filter(([k, v]) => v.length > 1);
if (dupes.length === 0) {
  console.log('  ✅ No duplicate function definitions found');
} else {
  dupes.forEach(([name, lineNums]) =>
    console.log('  ❌ DUPLICATE: ' + name + '() defined at lines: ' + lineNums.join(', '))
  );
}

section('SUMMARY — PRODUCTION READINESS VERDICT');
const issues = [];
if (errHandlers.length === 0) issues.push('❌ CRITICAL: No global window.onerror handler');
if (onclicks.length > 500) issues.push('⚠️  HIGH: ' + onclicks.length + ' inline onclick handlers — no error isolation');
if (tryCatch.length < 5) issues.push('⚠️  HIGH: Only ' + tryCatch.length + ' try/catch blocks for ' + lines.length + ' lines of code');
if (fbInit.length === 0) issues.push('⚠️  HIGH: No Firebase backend — data is all mock/local');
if (dupes.length > 0) issues.push('❌ CRITICAL: ' + dupes.length + ' duplicate function names — will crash at runtime');
if (lines.length > 5000) issues.push('⚠️  MEDIUM: Monolith file (' + lines.length + ' lines) — browser parses ALL JS on load');

if (issues.length === 0) {
  console.log('  ✅ PASS — No critical structural issues found');
} else {
  console.log('  Issues found: ' + issues.length);
  issues.forEach(i => console.log('  ' + i));
}
