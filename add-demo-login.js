const fs = require('fs');

const htmlFile = 'c:/Users/Jnewball/Test-apps/Test-apps/LynkApp-Production-App/index.html';
const jsFile = 'c:/Users/Jnewball/Test-apps/Test-apps/LynkApp-Production-App/js/app-main.js';

// --- Show first 50 lines with "auth" or "Sign" to understand structure ---
let html = fs.readFileSync(htmlFile, 'utf8');
const lines = html.split('\n');
const matches = [];
lines.forEach((l, i) => {
    if (l.includes('signIn') || l.includes('Sign In') || l.includes('auth-') || l.includes('loginBtn') || l.includes('id="login') || l.includes('class="login') || l.includes('Forgot password')) {
        matches.push((i+1) + ': ' + l.trim().substring(0, 140));
    }
});
console.log('=== AUTH MATCHES ===');
matches.slice(0, 25).forEach(m => console.log(m));

// --- Add demo login button to the login form ---
// Find the "Sign In" button (main login button) and add a "View Demo" link below it
const demoBtn = `
                <div style="text-align:center; margin-top: 16px;">
                    <button onclick="demoLogin()" style="background: transparent; border: 1px solid rgba(255,255,255,0.3); color: rgba(255,255,255,0.7); padding: 10px 24px; border-radius: 20px; font-size: 14px; cursor: pointer; width: 100%;">
                        👁️ View Demo (Skip Login)
                    </button>
                    <p style="color: rgba(255,255,255,0.4); font-size: 11px; margin-top: 8px;">For review purposes only</p>
                </div>`;

// Find the Sign In button and add demo button after it
// Look for the closing of the login form section
let modified = false;

// Strategy: find 'Sign In</button>' in the auth screen and add demo button after it
if (html.includes('>Sign In</button>')) {
    // Find the last Sign In button (the submit one, not the tab)
    const idx = html.lastIndexOf('>Sign In</button>');
    if (idx !== -1) {
        // Insert after the closing </button> tag
        const insertAt = idx + '>Sign In</button>'.length;
        html = html.slice(0, insertAt) + demoBtn + html.slice(insertAt);
        modified = true;
        console.log('✅ Added demo button after Sign In button');
    }
}

if (!modified) {
    console.log('⚠️ Could not find Sign In button - checking for alternative...');
    // Try looking for "Forgot password" which appears in the login form
    const fpIdx = html.indexOf('Forgot password?');
    if (fpIdx !== -1) {
        // Find the end of the containing div or form
        const afterFP = html.indexOf('</div>', fpIdx);
        if (afterFP !== -1) {
            html = html.slice(0, afterFP + 6) + demoBtn + html.slice(afterFP + 6);
            modified = true;
            console.log('✅ Added demo button after Forgot password section');
        }
    }
}

if (modified) {
    fs.writeFileSync(htmlFile, html, 'utf8');
}

// --- Add demoLogin() function to app-main.js ---
let js = fs.readFileSync(jsFile, 'utf8');

if (!js.includes('function demoLogin')) {
    const demoFn = `
        // DEMO LOGIN: Bypass Firebase auth for review/testing purposes
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
        }

`;
    // Add before the first function
    js = js.replace('// ========== NAVIGATION ==========', demoFn + '        // ========== NAVIGATION ==========');
    if (!js.includes('function demoLogin')) {
        // fallback: prepend to JS
        js = demoFn + js;
    }
    fs.writeFileSync(jsFile, js, 'utf8');
    console.log('✅ demoLogin() function added to app-main.js');
} else {
    console.log('ℹ️ demoLogin() already exists');
}

console.log('\nDone! Refresh the browser to see the demo button.');
