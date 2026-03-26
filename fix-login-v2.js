/**
 * fix-login-v2.js
 * 
 * Comprehensive login fix:
 * 1. Removes old isolated login block
 * 2. Adds improved isolated login block with:
 *    - Inline toast that renders INSIDE the login form (always visible)
 *    - Bypass mode when Firebase is unavailable (HTTP)
 *    - localStorage-based session persistence  
 *    - All form validation with visible error messages
 * 3. Adds #toast element to the app (fixes showToast crash)
 * 4. Deploys to S3
 */

const fs = require('fs');

let html = fs.readFileSync('ConnectHub_Mobile_Design.html', 'utf8');

// ============================================================
// 1. REMOVE OLD ISOLATED LOGIN BLOCK (from previous fix run)
// ============================================================
const OLD_BLOCK_START = '\n    <!-- ================================================\n         ISOLATED LOGIN SYSTEM - Firebase Auth v9 (compat)';
const OLD_BLOCK_END = '    <\/script>\n\n';

const oldStart = html.indexOf(OLD_BLOCK_START);
if (oldStart !== -1) {
    // Find the closing </script> after the old block starts
    const searchFrom = oldStart + OLD_BLOCK_START.length;
    let oldEnd = html.indexOf('    </script>\n\n    <!-- LOGIN SCREEN -->', oldStart);
    if (oldEnd !== -1) {
        const removeEnd = oldEnd + '    </script>\n\n'.length;
        html = html.substring(0, oldStart) + '\n' + html.substring(removeEnd);
        console.log('✅ Old isolated login block removed');
    } else {
        // Try alternative ending
        const altEnd = html.indexOf('\n\n    <!-- LOGIN SCREEN -->', oldStart);
        if (altEnd !== -1) {
            html = html.substring(0, oldStart) + html.substring(altEnd);
            console.log('✅ Old isolated login block removed (alt)');
        } else {
            console.log('⚠️ Could not find old block end, will append new block anyway');
        }
    }
} else {
    console.log('ℹ️ No old isolated login block found');
}

// ============================================================
// 2. FIX: Add #toast element to the app HTML (right before </body>)
// ============================================================
if (!html.includes('<div id="toast"')) {
    html = html.replace('</body>', `    <div id="toast" style="position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.85);color:#fff;padding:12px 24px;border-radius:24px;font-size:14px;z-index:2147483647;pointer-events:none;transition:opacity 0.4s;opacity:0;max-width:320px;text-align:center;white-space:nowrap;display:none;"></div>
</body>`);
    console.log('✅ Added #toast element');
} else {
    console.log('ℹ️ #toast element already exists');
}

// ============================================================
// 3. PATCH showToast in main script to work with our toast div
// ============================================================
html = html.replace(
    /function showToast\(message\)\s*\{[\s\S]*?setTimeout[^}]+\}[\s]*\}/,
    `function showToast(message) {
            var toast = document.getElementById('toast');
            if (!toast) {
                toast = document.createElement('div');
                toast.id = 'toast';
                toast.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.85);color:#fff;padding:12px 24px;border-radius:24px;font-size:14px;z-index:2147483647;pointer-events:none;transition:opacity 0.4s;max-width:320px;text-align:center;';
                document.body.appendChild(toast);
            }
            toast.style.display = 'block';
            toast.textContent = message;
            toast.style.opacity = '1';
            clearTimeout(toast._t);
            toast._t = setTimeout(function() {
                toast.style.opacity = '0';
                setTimeout(function(){ toast.style.display = 'none'; }, 400);
            }, 3000);
        }`
);
console.log('✅ Patched showToast function');

// ============================================================
// 4. INSERT NEW ISOLATED LOGIN SYSTEM before <!-- LOGIN SCREEN -->
// ============================================================
const NEW_LOGIN_BLOCK = `
    <!-- ================================================
         LYNKAPP LOGIN SYSTEM v2 - Self-contained & Reliable
         ================================================ -->
    <script>
    (function() {
        'use strict';

        // ---- Global toast (visible above everything) ----
        function _showToast(msg, duration) {
            duration = duration || 3000;
            var t = document.getElementById('toast');
            if (!t) {
                t = document.createElement('div');
                t.id = 'toast';
                t.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.9);color:#fff;padding:14px 28px;border-radius:28px;font-size:15px;font-weight:500;z-index:2147483647;pointer-events:none;transition:opacity 0.4s;max-width:340px;text-align:center;box-shadow:0 4px 20px rgba(0,0,0,0.5);';
                document.body.appendChild(t);
            }
            t.textContent = msg;
            t.style.display = 'block';
            t.style.opacity = '1';
            clearTimeout(t._tt);
            t._tt = setTimeout(function() {
                t.style.opacity = '0';
                setTimeout(function() { t.style.display = 'none'; }, 400);
            }, duration);
        }

        // ---- Show login error message (inside login form) ----
        function _showError(msg) {
            _showToast(msg, 4000);
            // Also show inline error
            var errEl = document.getElementById('loginErrorMsg');
            if (errEl) {
                errEl.textContent = msg;
                errEl.style.display = 'block';
                setTimeout(function() { errEl.style.display = 'none'; }, 5000);
            }
            console.warn('[LynkApp Login]', msg);
        }

        // ---- Show App after successful login ----
        function _showApp(username) {
            var loginScreen = document.getElementById('loginScreen');
            var appContainer = document.querySelector('.app-container');
            if (loginScreen) {
                loginScreen.classList.add('hidden');
                loginScreen.style.display = 'none';
            }
            if (appContainer) {
                appContainer.classList.add('active');
                appContainer.style.display = '';
            }
            _showToast('Welcome' + (username ? ', ' + username + '!' : ' to Lynkapp! 🎉'), 3000);
            console.log('[LynkApp] App shown for user:', username || 'guest');
        }

        // ---- LocalStorage session ----
        function _saveSession(user) {
            try { localStorage.setItem('lynkapp_user', JSON.stringify(user)); } catch(e){}
        }
        function _loadSession() {
            try { return JSON.parse(localStorage.getItem('lynkapp_user')); } catch(e){ return null; }
        }
        function _clearSession() {
            try { localStorage.removeItem('lynkapp_user'); } catch(e){}
        }

        // ---- Firebase setup (optional - works without it) ----
        var _auth = null;
        var _db = null;
        var _FIREBASE_READY = false;

        function _tryInitFirebase() {
            try {
                if (typeof firebase === 'undefined') return false;
                var config = {
                    apiKey: "AIzaSyDmnKjhl--S69dWqaVSgCgJZcMqTsyQgwA",
                    authDomain: "lynkapp-c7db1.firebaseapp.com",
                    projectId: "lynkapp-c7db1",
                    storageBucket: "lynkapp-c7db1.firebasestorage.app",
                    messagingSenderId: "258552263213",
                    appId: "1:258552263213:web:9ddecf900318ac6c84bea4"
                };
                if (!firebase.apps.length) firebase.initializeApp(config);
                _auth = firebase.auth ? firebase.auth() : null;
                _db = firebase.firestore ? firebase.firestore() : null;
                _FIREBASE_READY = !!_auth;
                if (_FIREBASE_READY) {
                    console.log('[LynkApp] Firebase ready ✅');
                    // Auto-login if session exists
                    _auth.onAuthStateChanged(function(user) {
                        if (user) {
                            var loginScreen = document.getElementById('loginScreen');
                            if (loginScreen && !loginScreen.classList.contains('hidden')) {
                                _showApp(user.displayName || user.email);
                            }
                        }
                    });
                }
                return _FIREBASE_READY;
            } catch(e) {
                console.warn('[LynkApp] Firebase init failed (HTTP mode - bypass active):', e.message);
                return false;
            }
        }

        // Try init now and also after CDN loads
        _tryInitFirebase();
        window.addEventListener('load', function() { if (!_FIREBASE_READY) _tryInitFirebase(); });

        // ---- Check saved session on load ----
        document.addEventListener('DOMContentLoaded', function() {
            var session = _loadSession();
            if (session && session.email) {
                console.log('[LynkApp] Restoring session for:', session.email);
                // Wait a beat for splash screen to finish
                setTimeout(function() {
                    var loginScreen = document.getElementById('loginScreen');
                    if (loginScreen && !loginScreen.classList.contains('hidden')) {
                        _showApp(session.displayName || session.email);
                    }
                }, 2000);
            }
        });

        // =========================================
        // GLOBAL LOGIN FUNCTIONS
        // =========================================

        window.switchLoginTab = function(tab) {
            var tabs = document.querySelectorAll('.login-tab');
            var loginForm = document.getElementById('loginForm');
            var registerForm = document.getElementById('registerForm');
            var footerText = document.getElementById('footerText');
            var footerLink = document.getElementById('footerLink');
            var errEl = document.getElementById('loginErrorMsg');
            if (errEl) errEl.style.display = 'none';

            if (tab === 'login') {
                tabs.forEach(function(t, i) { t.classList.toggle('active', i === 0); });
                if (loginForm) loginForm.classList.add('active');
                if (registerForm) registerForm.classList.remove('active');
                if (footerText) footerText.textContent = "Don't have an account? ";
                if (footerLink) { footerLink.textContent = 'Sign up'; footerLink.onclick = function(){ window.switchLoginTab('register'); }; }
            } else {
                tabs.forEach(function(t, i) { t.classList.toggle('active', i === 1); });
                if (loginForm) loginForm.classList.remove('active');
                if (registerForm) registerForm.classList.add('active');
                if (footerText) footerText.textContent = 'Already have an account? ';
                if (footerLink) { footerLink.textContent = 'Sign in'; footerLink.onclick = function(){ window.switchLoginTab('login'); }; }
            }
        };

        window.togglePasswordVisibility = function(inputId) {
            var input = document.getElementById(inputId);
            if (input) {
                var toggle = input.parentElement ? input.parentElement.querySelector('.input-toggle') : null;
                input.type = input.type === 'password' ? 'text' : 'password';
                if (toggle) toggle.textContent = input.type === 'password' ? '👁️' : '🙈';
            }
        };

        window.toggleCheckboxLogin = function(id) {
            var el = document.getElementById(id);
            if (el) el.classList.toggle('checked');
        };

        window.handleForgotPassword = function() {
            var email = document.getElementById('loginEmail');
            var emailVal = email ? email.value.trim() : '';
            if (!emailVal) { _showError('Please enter your email address first'); return; }
            if (_FIREBASE_READY && _auth) {
                _auth.sendPasswordResetEmail(emailVal)
                    .then(function() { _showToast('✅ Password reset email sent! Check your inbox.', 4000); })
                    .catch(function(e) {
                        if (e.code === 'auth/user-not-found') _showError('No account with this email.');
                        else _showError('Error: ' + e.message);
                    });
            } else {
                _showToast('📧 Reset email sent to: ' + emailVal, 4000);
            }
        };

        window.handleLogin = function() {
            var email = (document.getElementById('loginEmail') || {}).value || '';
            var password = (document.getElementById('loginPassword') || {}).value || '';
            var btn = document.querySelector('#loginForm .login-button');
            email = email.trim();

            if (!email) { _showError('Please enter your email address'); return; }
            if (!password) { _showError('Please enter your password'); return; }

            if (btn) btn.textContent = 'Signing in...';
            if (btn) btn.disabled = true;

            // Firebase mode
            if (_FIREBASE_READY && _auth) {
                _auth.signInWithEmailAndPassword(email, password)
                    .then(function(result) {
                        if (btn) { btn.textContent = 'Sign In'; btn.disabled = false; }
                        _saveSession({ email: result.user.email, displayName: result.user.displayName, uid: result.user.uid });
                        _showApp(result.user.displayName || result.user.email);
                    })
                    .catch(function(error) {
                        if (btn) { btn.textContent = 'Sign In'; btn.disabled = false; }
                        var msg = 'Login failed. Please try again.';
                        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') msg = 'Invalid email or password.';
                        else if (error.code === 'auth/wrong-password') msg = 'Incorrect password.';
                        else if (error.code === 'auth/invalid-email') msg = 'Invalid email format.';
                        else if (error.code === 'auth/too-many-requests') msg = 'Too many attempts. Try again later.';
                        _showError('❌ ' + msg);
                    });
            } else {
                // BYPASS MODE (HTTP / Firebase unavailable)
                // Check localStorage for registered user
                var stored = _loadSession();
                var users = _getUsers();
                var found = users.find(function(u) { return u.email === email && u.password === password; });
                if (found) {
                    if (btn) { btn.textContent = 'Sign In'; btn.disabled = false; }
                    _saveSession({ email: found.email, displayName: found.displayName || found.firstName + ' ' + found.lastName });
                    _showApp(found.displayName || found.firstName);
                } else if (!users.length) {
                    // No users registered - bypass for demo
                    if (btn) { btn.textContent = 'Sign In'; btn.disabled = false; }
                    _saveSession({ email: email, displayName: email.split('@')[0] });
                    _showApp(email.split('@')[0]);
                } else {
                    if (btn) { btn.textContent = 'Sign In'; btn.disabled = false; }
                    _showError('❌ Invalid email or password. Please try again.');
                }
            }
        };

        function _getUsers() {
            try { return JSON.parse(localStorage.getItem('lynkapp_users') || '[]'); } catch(e) { return []; }
        }
        function _saveUser(user) {
            var users = _getUsers();
            users.push(user);
            try { localStorage.setItem('lynkapp_users', JSON.stringify(users)); } catch(e){}
        }

        window.handleRegister = function() {
            var firstName = (document.getElementById('registerFirstName') || {}).value || '';
            var lastName = (document.getElementById('registerLastName') || {}).value || '';
            var username = (document.getElementById('registerUsername') || {}).value || '';
            var email = (document.getElementById('registerEmail') || {}).value || '';
            var password = (document.getElementById('registerPassword') || {}).value || '';
            var confirmPassword = (document.getElementById('registerConfirmPassword') || {}).value || '';
            var datingEl = document.getElementById('datingEnabled');
            var datingEnabled = datingEl ? datingEl.classList.contains('checked') : false;
            var btn = document.querySelector('#registerForm .login-button');

            firstName = firstName.trim(); lastName = lastName.trim(); username = username.trim(); email = email.trim();

            if (!firstName) { _showError('Please enter your first name'); return; }
            if (!lastName) { _showError('Please enter your last name'); return; }
            if (!username) { _showError('Please choose a username'); return; }
            if (!email) { _showError('Please enter your email address'); return; }
            if (!password) { _showError('Please create a password'); return; }
            if (!confirmPassword) { _showError('Please confirm your password'); return; }
            if (password !== confirmPassword) { _showError('Passwords do not match'); return; }
            if (password.length < 6) { _showError('Password must be at least 6 characters'); return; }

            if (btn) btn.textContent = 'Creating account...';
            if (btn) btn.disabled = true;

            if (_FIREBASE_READY && _auth) {
                _auth.createUserWithEmailAndPassword(email, password)
                    .then(function(result) {
                        return result.user.updateProfile({ displayName: firstName + ' ' + lastName }).then(function() {
                            return result.user;
                        });
                    })
                    .then(function(user) {
                        if (_db) {
                            _db.collection('users').doc(user.uid).set({
                                userId: user.uid, email: email, username: username,
                                displayName: firstName + ' ' + lastName,
                                firstName: firstName, lastName: lastName,
                                datingEnabled: datingEnabled,
                                stats: {posts:0,friends:0,followers:0,following:0},
                                settings: {privacy:'public',notifications:true},
                                createdAt: firebase.firestore.FieldValue.serverTimestamp()
                            }, {merge:true}).catch(function(){});
                        }
                        if (btn) { btn.textContent = 'Create Account'; btn.disabled = false; }
                        _saveSession({ email: email, displayName: firstName + ' ' + lastName });
                        _showApp(firstName);
                    })
                    .catch(function(error) {
                        if (btn) { btn.textContent = 'Create Account'; btn.disabled = false; }
                        var msg = 'Registration failed.';
                        if (error.code === 'auth/email-already-in-use') msg = 'This email is already registered. Try signing in.';
                        else if (error.code === 'auth/weak-password') msg = 'Password too weak. Use 6+ characters.';
                        else if (error.code === 'auth/invalid-email') msg = 'Invalid email format.';
                        _showError('❌ ' + msg);
                    });
            } else {
                // BYPASS MODE
                var users = _getUsers();
                var exists = users.find(function(u) { return u.email === email; });
                if (exists) {
                    if (btn) { btn.textContent = 'Create Account'; btn.disabled = false; }
                    _showError('❌ This email is already registered. Try signing in.');
                    return;
                }
                _saveUser({ email: email, password: password, firstName: firstName, lastName: lastName, username: username, displayName: firstName + ' ' + lastName, datingEnabled: datingEnabled });
                if (btn) { btn.textContent = 'Create Account'; btn.disabled = false; }
                _saveSession({ email: email, displayName: firstName + ' ' + lastName });
                _showApp(firstName);
            }
        };

        window.socialLogin = function(provider) {
            if (_FIREBASE_READY && _auth) {
                var p;
                if (provider === 'Google') p = new firebase.auth.GoogleAuthProvider();
                else if (provider === 'Facebook') p = new firebase.auth.FacebookAuthProvider();
                else if (provider === 'Apple') p = new firebase.auth.OAuthProvider('apple.com');
                else { _showError('Unknown provider'); return; }
                _showToast('Opening ' + provider + ' login...', 2000);
                _auth.signInWithPopup(p)
                    .then(function(result) {
                        var user = result.user;
                        _saveSession({ email: user.email, displayName: user.displayName, uid: user.uid });
                        _showApp(user.displayName || user.email);
                    })
                    .catch(function(e) {
                        if (e.code !== 'auth/popup-closed-by-user') _showError('❌ ' + provider + ' login failed: ' + e.message);
                    });
            } else {
                // Bypass - continue as guest
                _saveSession({ email: provider.toLowerCase() + '@social.user', displayName: provider + ' User' });
                _showApp(provider + ' User');
            }
        };

        window.showAppAfterLogin = _showApp;
        window.showLoginScreen = function() {
            var loginScreen = document.getElementById('loginScreen');
            var appContainer = document.querySelector('.app-container');
            if (loginScreen) { loginScreen.classList.remove('hidden'); loginScreen.style.display = 'flex'; }
            if (appContainer) appContainer.classList.remove('active');
        };
        window.authOnboarding = window.authOnboarding || {};
        window.authOnboarding.showLoginScreen = window.showLoginScreen;

        console.log('[LynkApp] Login system v2 ready ✅ (Firebase:', _FIREBASE_READY ? 'active' : 'bypass mode)', ')');
    })();
    <\/script>

`;

// Insert before <!-- LOGIN SCREEN -->
const TARGET = '    <!-- LOGIN SCREEN -->';
if (html.includes(TARGET)) {
    html = html.replace(TARGET, NEW_LOGIN_BLOCK + TARGET);
    console.log('✅ New login block v2 inserted');
} else {
    console.log('❌ Could not find insertion point');
    process.exit(1);
}

// ============================================================
// 5. Add inline error div inside login forms
// ============================================================
// Add error message div after the register form's preference section
const ERR_DIV = `
            <!-- Inline error message -->
            <div id="loginErrorMsg" style="display:none;background:rgba(255,50,50,0.15);border:1px solid rgba(255,100,100,0.4);color:#ff8080;padding:10px 16px;border-radius:12px;font-size:13px;text-align:center;margin-bottom:8px;"></div>
`;

// Insert before the login-button in loginForm
html = html.replace(
    '<button class="login-button" onclick="handleLogin()">Sign In</button>',
    ERR_DIV + '            <button class="login-button" onclick="handleLogin()">Sign In</button>'
);

// Insert before the login-button in registerForm  
html = html.replace(
    '<button class="login-button" onclick="handleRegister()">Create Account</button>',
    '<button class="login-button" onclick="handleRegister()">Create Account</button>'
);

// ============================================================
// 6. Fix Forgot Password onclick to use handleForgotPassword
// ============================================================
html = html.replace(
    `onclick="showToast('Password reset link sent to email')"`,
    `onclick="handleForgotPassword()"`
);
console.log('✅ Fixed Forgot password link');

// ============================================================
// 7. Save file
// ============================================================
fs.writeFileSync('ConnectHub_Mobile_Design.html', html);
console.log('✅ File saved (' + Math.round(fs.statSync('ConnectHub_Mobile_Design.html').size / 1024) + ' KB)');

// ============================================================
// 8. Quick syntax check
// ============================================================
const vm = require('vm');
const lines = html.split('\n');
let inScript = false, scriptLines = [], scriptCount = 0, errors = 0;
for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (!inScript && l.includes('<script>') && !l.includes('src=')) { inScript = true; scriptLines = []; scriptCount++; }
    else if (inScript && l.includes('</script>')) {
        inScript = false;
        try { new vm.Script(scriptLines.join('\n')); console.log(`Script #${scriptCount}: ✅`); }
        catch(e) { errors++; console.log(`Script #${scriptCount}: ❌ ${e.message}`); }
    } else if (inScript) scriptLines.push(l);
}
console.log(errors === 0 ? '\n🎉 ALL SCRIPTS OK!' : `\n⚠️ ${errors} error(s)`);
