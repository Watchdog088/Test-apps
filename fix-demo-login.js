const fs = require('fs');
const jsFile = 'c:/Users/Jnewball/Test-apps/Test-apps/LynkApp-Production-App/js/app-main.js';

let js = fs.readFileSync(jsFile, 'utf8');

// Replace the old demoLogin function with a correctly targeted version
const oldFn = `        // DEMO LOGIN: Bypass Firebase auth for review/testing purposes
        function demoLogin() {
            // Hide auth screen, show main app
            var authEl = document.getElementById('authScreen') || 
                         document.querySelector('.auth-screen') ||
                         document.querySelector('[id*="auth"]');
            var appEl = document.getElementById('appContainer') || 
                        document.getElementById('mainApp') ||
                        document.querySelector('.app-container') ||
                        document.querySelector('.phone-frame') ||
                        document.querySelector('#app');
            
            // Try to find and hide login, show app
            var loginDivs = document.querySelectorAll('[class*="login"], [id*="login"], [class*="auth"], [id*="auth"]');
            loginDivs.forEach(function(el) {
                if (el.id !== 'app' && !el.id.includes('Modal')) {
                    el.style.display = 'none';
                }
            });
            
            // Show main content
            var mainDivs = document.querySelectorAll('[class*="main-app"], [id*="mainApp"], .phone-screen, #feedScreen');
            mainDivs.forEach(function(el) { el.style.display = 'block'; });
            
            // Navigate to feed
            if (typeof openScreen === 'function') {
                openScreen('feed');
            }
            
            showToast('Welcome to LynkApp Demo! 🎉');
        }`;

const newFn = `        // DEMO LOGIN: Bypass Firebase auth for review/testing purposes
        function demoLogin() {
            // 1. Hide the login screen
            var loginScreen = document.getElementById('loginScreen');
            if (loginScreen) {
                loginScreen.style.display = 'none';
            }
            
            // 2. Show the main app container
            var appContainer = document.querySelector('.app-container');
            if (appContainer) {
                appContainer.style.display = 'block';
                appContainer.style.visibility = 'visible';
                appContainer.style.opacity = '1';
            }
            
            // Also remove hidden class from anything that's hidden but should show
            document.querySelectorAll('.app-container, .bottom-nav, .top-nav').forEach(function(el) {
                el.classList.remove('hidden');
                el.style.display = '';
            });
            
            // 3. Navigate to feed screen
            if (typeof openScreen === 'function') {
                openScreen('feed');
            }
            
            // 4. Show welcome toast
            if (typeof showToast === 'function') {
                showToast('Welcome to LynkApp Demo! 🎉');
            }
        }`;

if (js.includes(oldFn.trim().substring(0, 80))) {
    js = js.replace(oldFn, newFn);
    console.log('✅ demoLogin() function updated with correct selectors');
} else {
    // Try simpler replacement
    const simpleOld = 'function demoLogin() {';
    const idx = js.indexOf(simpleOld);
    if (idx !== -1) {
        // Find the end of this function (next function declaration at same level)
        let braceCount = 0;
        let endIdx = idx;
        let started = false;
        for (let i = idx; i < js.length; i++) {
            if (js[i] === '{') { braceCount++; started = true; }
            if (js[i] === '}') { braceCount--; }
            if (started && braceCount === 0) { endIdx = i + 1; break; }
        }
        const oldBlock = js.substring(idx, endIdx);
        js = js.replace(oldBlock, newFn.trim());
        console.log('✅ demoLogin() replaced via bracket matching');
    } else {
        // Append as new function
        js = newFn + '\n\n' + js;
        console.log('✅ demoLogin() prepended');
    }
}

fs.writeFileSync(jsFile, js, 'utf8');
console.log('Done!');
