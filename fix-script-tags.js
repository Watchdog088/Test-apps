const fs = require('fs');

const file = 'ConnectHub_Mobile_Design.html';
let content = fs.readFileSync(file, 'utf8');
const originalLength = content.length;

// Remove all lines with <script src="ConnectHub_Mobile_Design_*.js"></script>
// These duplicate inline class definitions causing SyntaxError crashes
content = content.replace(/[ \t]*<script src="ConnectHub_Mobile_Design_[^"]+\.js"><\/script>[ \t]*\r?\n/g, '');

const newLength = content.length;
console.log(`Original: ${originalLength} bytes`);
console.log(`After fix: ${newLength} bytes`);
console.log(`Removed: ${originalLength - newLength} bytes`);

fs.writeFileSync(file, content, 'utf8');
console.log('Done! File saved.');

// Verify no more script src tags for these files
const remaining = (content.match(/<script src="ConnectHub_Mobile_Design_/g) || []).length;
console.log(`Remaining duplicate script tags: ${remaining}`);
