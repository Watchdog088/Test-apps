const fs = require('fs');

let html = fs.readFileSync('ConnectHub_Mobile_Design.html', 'utf8');
const original = html;

// The issue: PowerShell `n escape (char 96 + 'n') was embedded as a literal
// We need to find lines where a backtick followed by 'n' appears in JS context
// Pattern: any non-template-literal code that has `n as a line break substitute

// Strategy: Find all lines that contain backtick + 'n' character sequence
// and check if they're in a clearly broken pattern (like }; followed by `n)
const lines = html.split('\n');
let fixCount = 0;

const fixedLines = lines.map((line, idx) => {
    // Check if line contains a backtick followed by 'n' in what looks like JS code
    // Pattern: anything ending with ;, then backtick n, then more code
    // This is clearly a corrupted PowerShell `n newline
    const backtickIndex = line.indexOf('`n');
    if (backtickIndex !== -1) {
        // Check the character before the backtick
        const before = line.substring(0, backtickIndex);
        const after = line.substring(backtickIndex + 2); // skip `n
        
        // Only fix if this looks like a broken statement (not inside a template literal's HTML content)
        // Signs it's a broken `n: semicolons before it, or it's between JS statements
        if (before.trim().endsWith(';') || before.trim().endsWith('}') || before.trim().endsWith(')')) {
            console.log(`Fixing line ${idx + 1}: "${line.substring(Math.max(0, backtickIndex-20), backtickIndex+20)}"`);
            fixCount++;
            // Replace `n with actual newline (split into two lines)
            return before + '\n' + after;
        }
    }
    return line;
});

if (fixCount > 0) {
    // Rejoin - note that some lines were already split by the \n we inserted
    const fixedHtml = fixedLines.join('\n');
    fs.writeFileSync('ConnectHub_Mobile_Design.html', fixedHtml);
    console.log(`\n✅ Fixed ${fixCount} backtick-n corruption(s). File saved.`);
} else {
    console.log('No backtick-n patterns found to fix.');
}

// Verify fix with syntax checker
const vm = require('vm');
const newHtml = fs.readFileSync('ConnectHub_Mobile_Design.html', 'utf8');
const newLines = newHtml.split('\n');
let inScript = false;
let scriptStart = -1;
let scriptContent = [];
let scriptCount = 0;
let errorsFound = 0;

for (let i = 0; i < newLines.length; i++) {
    const line = newLines[i];
    if (!inScript && line.includes('<script>') && !line.includes('<script src')) {
        inScript = true;
        scriptStart = i + 1;
        scriptContent = [];
        scriptCount++;
    } else if (inScript && line.includes('</script>')) {
        inScript = false;
        const code = scriptContent.join('\n');
        try {
            new vm.Script(code);
            console.log(`Script block #${scriptCount}: ✅ OK`);
        } catch(e) {
            errorsFound++;
            const match = e.stack.match(/:(\d+)/);
            const errLine = match ? parseInt(match[1]) : '?';
            console.log(`Script block #${scriptCount}: ❌ ${e.message} (script line ${errLine})`);
        }
    } else if (inScript) {
        scriptContent.push(line);
    }
}

if (errorsFound === 0) {
    console.log('\n🎉 ALL SCRIPT BLOCKS SYNTAX-ERROR FREE!');
} else {
    console.log(`\n⚠️  ${errorsFound} script block(s) still have errors.`);
}
