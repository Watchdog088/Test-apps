const fs = require('fs');
const path = 'c:/Users/Jnewball/Test-apps/Test-apps/LynkApp-Production-App/index.html';

let html = fs.readFileSync(path, 'utf8');

// Extract all external script tags (src pointing to js/ or services/)
const scripts = [];
const scriptRegex = /<script src="(js\/|services\/)[^"]+"><\/script>/g;
let match;
while ((match = scriptRegex.exec(html)) !== null) {
    scripts.push(match[0]);
}

// Remove them from wherever they are (head or body)
let fixed = html;
scripts.forEach(s => {
    fixed = fixed.replace(s, '');
});

// Clean up extra blank lines left behind
fixed = fixed.replace(/\n(\s*\n){3,}/g, '\n\n');

// Insert them just before </body>
const bodyClose = '</body>';
const insertPoint = fixed.lastIndexOf(bodyClose);
if (insertPoint === -1) {
    console.error('Could not find </body>!');
    process.exit(1);
}

const before = fixed.substring(0, insertPoint);
const after = fixed.substring(insertPoint);
fixed = before + '\n    ' + scripts.join('\n    ') + '\n' + after;

fs.writeFileSync(path, fixed, 'utf8');
console.log('SUCCESS: Moved ' + scripts.length + ' scripts to bottom of <body>');
scripts.forEach(s => console.log('  ' + s));
