const fs = require('fs');
const js = fs.readFileSync('c:/Users/Jnewball/Test-apps/Test-apps/LynkApp-Production-App/js/app-main.js', 'utf8');
const lines = js.split('\n');

// Find auth state / show/hide logic
lines.forEach((l, i) => {
    const line = l.trim();
    if (
        line.includes('onAuthStateChanged') ||
        line.includes('app-container') ||
        line.includes('loginScreen') ||
        (line.includes('display') && (line.includes('none') || line.includes('block') || line.includes('flex'))) ||
        line.includes('classList') && (line.includes('hidden') || line.includes('show'))
    ) {
        console.log((i+1) + ': ' + line.substring(0, 160));
    }
});
