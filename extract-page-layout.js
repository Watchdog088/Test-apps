const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, 'ConnectHub_Mobile_Design.html'), 'utf8');
const lines = content.split('\n');

// ─── Helper: get text content from a line ───────────────────
function textOf(line) {
  return line.replace(/<[^>]+>/g, '').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').trim();
}

// ─── Find section boundaries by looking for major page markers ──
// We'll collect all onclick lines and group them by the nearest section heading

const sectionMarkers = [
  { key: 'SPLASH SCREEN',      start: /id="splashScreen"/ },
  { key: 'LOGIN SCREEN',       start: /id="loginScreen"/ },
  { key: 'TOP NAVIGATION',     start: /class="top-nav"/ },
  { key: 'SOCIAL TAB (Feed + Stories)', start: /switchBottomTab\('social'\)|id="socialTab"/ },
  { key: 'DATING TAB',         start: /switchBottomTab\('dating'\)|id="datingTab"/ },
  { key: 'MESSAGES TAB',       start: /switchBottomTab\('messages'\)|id="messagesTab"/ },
  { key: 'MEDIA TAB',          start: /switchBottomTab\('media'\)|id="mediaTab"/ },
  { key: 'BOTTOM NAVIGATION',  start: /class="bottom-nav"/ },
];

// ─── Strategy: just scan all lines, find section headings by comment or id, then list buttons ──

const report = [];

// Detect section by HTML comments and known IDs
let currentSection = 'GLOBAL / UNKNOWN';
const sectionButtons = {};

function addButton(section, fn, label, lineNum) {
  if (!sectionButtons[section]) sectionButtons[section] = [];
  sectionButtons[section].push({ fn, label: label.substring(0,80), line: lineNum });
}

// Parse section headings from HTML comments
lines.forEach((line, i) => {
  const lineNum = i + 1;

  // Detect HTML comments that label sections
  const commentMatch = line.match(/<!--\s*[-=]+\s*(.+?)\s*[-=]+/);
  if (commentMatch) {
    const raw = commentMatch[1].trim();
    if (raw.length > 2 && raw.length < 80) {
      currentSection = raw.toUpperCase();
    }
  }

  // Detect id-based section transitions
  const idMatch = line.match(/id="([^"]+)"/);
  if (idMatch) {
    const id = idMatch[1];
    if (/Screen|Section|Tab|Panel|Page|Container|Overlay/i.test(id)) {
      currentSection = id.replace(/([A-Z])/g,' $1').toUpperCase().trim();
    }
  }

  // Detect onclick
  if (/onclick=/.test(line)) {
    const fnMatch = line.match(/onclick=["']([^"']+)["']/);
    if (fnMatch) {
      let label = textOf(line);
      // Also look at nearby lines for label context
      if (!label) {
        for (let k = 1; k <= 2; k++) {
          const next = lines[i + k] ? textOf(lines[i + k]) : '';
          if (next) { label = next; break; }
        }
      }
      addButton(currentSection, fnMatch[1], label || '(no label)', lineNum);
    }
  }
});

// ─── Write report ───────────────────────────────────────────
const out = [];
out.push('# ConnectHub_Mobile_Design.html — Page-by-Page Button & Feature Map');
out.push('**Generated:** ' + new Date().toLocaleDateString());
out.push('**Total onclick handlers found:** ' + Object.values(sectionButtons).flat().length);
out.push('');
out.push('---');
out.push('');

const sectionOrder = Object.keys(sectionButtons);

sectionOrder.forEach(section => {
  const buttons = sectionButtons[section];
  out.push('## 📄 ' + section);
  out.push('');
  out.push('| Line | Button / Action | Function Called |');
  out.push('|------|----------------|-----------------|');
  buttons.forEach(b => {
    const fn = b.fn.length > 60 ? b.fn.substring(0,57)+'...' : b.fn;
    const lbl = b.label.length > 50 ? b.label.substring(0,47)+'...' : b.label;
    out.push('| ' + b.line + ' | ' + (lbl||'—') + ' | `' + fn + '` |');
  });
  out.push('');
  out.push('**Total buttons: ' + buttons.length + '**');
  out.push('');
  out.push('---');
  out.push('');
});

// Also dump a flat summary of unique functions
const allFns = [...new Set(Object.values(sectionButtons).flat().map(b => b.fn.replace(/\(.*\).*/, '()')))].sort();
out.push('## 🔧 All Unique Functions Called (onclick handlers)');
out.push('');
allFns.forEach(f => out.push('- `' + f + '`'));
out.push('');

fs.writeFileSync(path.join(__dirname, 'PAGE-BY-PAGE-BUTTON-LAYOUT.md'), out.join('\n'), 'utf8');
console.log('Done! Written to PAGE-BY-PAGE-BUTTON-LAYOUT.md');
console.log('Total sections: ' + sectionOrder.length);
console.log('Total buttons: ' + Object.values(sectionButtons).flat().length);
console.log('Unique functions: ' + allFns.length);
