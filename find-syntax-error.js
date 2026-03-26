const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('ConnectHub_Mobile_Design.html', 'utf8');
const lines = html.split('\n');

// Find all <script> blocks (inline, not src)
let inScript = false;
let scriptStart = -1;
let scriptContent = [];
let scriptCount = 0;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (!inScript && line.includes('<script>') && !line.includes('<script src')) {
        inScript = true;
        scriptStart = i + 1;
        scriptContent = [];
        scriptCount++;
    } else if (inScript && line.includes('</script>')) {
        inScript = false;
        const code = scriptContent.join('\n');
        
        try {
            new vm.Script(code, { filename: `script-${scriptCount}` });
            console.log(`Script block #${scriptCount} (line ${scriptStart}): OK`);
        } catch(e) {
            console.log(`\n❌ SYNTAX ERROR in script block #${scriptCount} (starts at line ${scriptStart}):`);
            console.log(`Error: ${e.message}`);
            // Show the area around the error
            if (e.stack) {
                const match = e.stack.match(/:(\d+)/);
                if (match) {
                    const errLine = parseInt(match[1]);
                    const absLine = scriptStart + errLine - 1;
                    console.log(`Error at script line ${errLine}, file line ~${absLine}`);
                    // Show context
                    const start = Math.max(0, errLine - 3);
                    const end = Math.min(scriptContent.length, errLine + 2);
                    for (let j = start; j < end; j++) {
                        const marker = (j === errLine - 1) ? ' >>> ' : '     ';
                        console.log(`${marker}${scriptStart + j}: ${scriptContent[j]}`);
                    }
                }
            }
        }
    } else if (inScript) {
        scriptContent.push(line);
    }
}

console.log(`\nTotal script blocks found: ${scriptCount}`);
