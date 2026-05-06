const fs = require('fs');
const html = fs.readFileSync('ConnectHub_Mobile_Design.html', 'utf8');
const lines = html.split('\n');

// Find navigation / app container structure
const hits = lines.map((l, i) => ({ i, l })).filter(x =>
  /app-container|nav-item|bottom-nav|nav-bar|openScreen|showScreen|tab-bar|app-nav|bottom-bar|nav-btn|data-screen/.test(x.l)
);
console.log('=== NAV/CONTAINER HITS ===');
hits.slice(0, 60).forEach(x => console.log(x.i + 1, x.l.trim()));

// Also show lines 1-80 of the body content (where the app layout starts)
const bodyStart = lines.findIndex(l => /class="app-container"/.test(l));
if (bodyStart > -1) {
  console.log('\n=== APP-CONTAINER AREA (lines ' + (bodyStart+1) + ' – ' + (bodyStart+80) + ') ===');
  lines.slice(bodyStart, bodyStart + 80).forEach((l, i) => console.log(bodyStart + i + 1, l));
} else {
  console.log('\n[NO app-container found — showing lines 300-380]');
  lines.slice(300, 380).forEach((l, i) => console.log(300 + i + 1, l));
}
