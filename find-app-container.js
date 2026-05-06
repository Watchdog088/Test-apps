const fs = require('fs');
const html = fs.readFileSync('c:/Users/Jnewball/Test-apps/Test-apps/LynkApp-Production-App/index.html', 'utf8');
const lines = html.split('\n');

// Find the main app container
lines.forEach((l, i) => {
    const line = l.trim();
    if (line.includes('id=') && (
        line.includes('appContainer') || 
        line.includes('mainApp') || 
        line.includes('mainContent') || 
        line.includes('phone') || 
        line.includes('appWrapper') ||
        line.includes('"app"') ||
        line.includes("'app'") ||
        line.includes('"main"') ||
        line.includes('screenContainer') ||
        line.includes('screens') ||
        line.includes('appScreen')
    )) {
        console.log((i+1) + ': ' + line.substring(0, 140));
    }
    // Also find divs right after the loginScreen
    if (line.includes('class=') && (
        line.includes('app-wrapper') || 
        line.includes('phone-frame') || 
        line.includes('main-container') ||
        line.includes('app-content') ||
        line.includes('hidden') && line.includes('screen')
    )) {
        console.log((i+1) + ': ' + line.substring(0, 140));
    }
});

// Also show lines 185-210 (right after loginScreen closes)
console.log('\n=== Lines around end of loginScreen ===');
for (let i = 183; i <= 220; i++) {
    if (lines[i]) console.log((i+1) + ': ' + lines[i].trim().substring(0, 140));
}
