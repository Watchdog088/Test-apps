const fs = require('fs');

let html = fs.readFileSync('ConnectHub_Mobile_Design.html', 'utf8');

// The isolated login script block to insert before <!-- LOGIN SCREEN -->
const loginScriptBlock = `
    <!-- ================================================
         ISOLATED LOGIN SYSTEM - Firebase Auth v9 (compat)
         Self-contained, immune to errors in main scripts
         ================================================ -->
    <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"><\/script>
    <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"><\/script>
    <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"><\/script>
    <script>
    // ===== ISOLATED LOGIN SYSTEM - Always works =====
    (function() {
        'use strict';

        // Firebase config (inline for isolation)
        var FIREBASE_CONFIG = {
            apiKey: "AIzaSyDmnKjhl--S69dWqaVSgCgJZcMqTsyQgwA",
            authDomain: "lynkapp-c7db1.firebaseapp.com",
            projectId: "lynkapp-c7db1",
            storageBucket: "lynkapp-c7db1.firebasestorage.app",
            messagingSenderId: "258552263213",
            appId: "1:258552263213:web:9ddecf900318ac6c84bea4"
        };

        // Initialize Firebase (only if not already done)
        var _fbApp;
        var _auth;
        var _db;
        try {
            if (!firebase.apps.length) {
                _fbApp = firebase.initializeApp(FIREBASE_CONFIG);
            } else {
                _fbApp = firebase.app();
            }
            _auth = firebase.auth();
            _db = firebase.firestore();
            console.log('[LynkApp] Firebase initialized for login system');
        } catch(e) {
            console.warn('[LynkApp] Firebase init error:', e.message);
        }

        // ---- Toast notification (self-contained) ----
        function _toast(msg) {
            // Try main showToast first
            if (typeof window.showToast === 'function') {
                window.showToast(msg);
                return;
            }
            // Fallback: create toast div
            var t = document.getElementById('_loginToast');
            if (!t) {
                t = document.createElement('div');
                t.id = '_loginToast';
                t.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.85);color:#fff;padding:12px 24px;border-radius:24px;font-size:14px;z-index:99999;transition:opacity 0.3s;max-width:320px;text-align:center;';
                document.body.appendChild(t);
            }
            t.textContent = msg;
            t.style.opacity = '1';
            clearTimeout(t._timer);
            t._timer = setTimeout(function(){ t.style.opacity = '0'; }, 3000);
        }

        // ---- Show App After Login ----
        function _showApp() {
            var loginScreen = document.getElementById('loginScreen');
            var appContainer = document.querySelector('.app-container');
            if (loginScreen) { loginScreen.classList.add('hidden'); loginScreen.style.display = 'none'; }
            if (appContainer) { appContainer.classList.add('active'); }
            _toast('Welcome to Lynkapp! 🎉');
        }

        // ---- Set button loading state ----
        function _setLoading(btn, loading, text) {
            if (!btn) return;
            btn.disabled = loading;
            btn.textContent = loading ? 'Please wait...' : text;
        }

        // ---- Create Firestore profile on signup ----
        function _createProfile(user, extra) {
            if (!_db) return;
            return _db.collection('users').doc(user.uid).set({
                userId: user.uid,
                email: user.email,
                username: extra.username || user.email.split('@')[0],
                displayName: (extra.firstName + ' ' + extra.lastName).trim() || user.displayName || 'User',
                firstName: extra.firstName || '',
                lastName: extra.lastName || '',
                bio: '',
                profilePhoto: user.photoURL || '',
                coverPhoto: '',
                datingEnabled: extra.datingEnabled || false,
                stats: { posts: 0, friends: 0, followers: 0, following: 0 },
                settings: { privacy: 'public', notifications: true },
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastActive: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        }

        // ============================================
        // GLOBAL FUNCTIONS (called from onclick attrs)
        // ============================================

        // Switch between Sign In / Sign Up tabs
        window.switchLoginTab = function(tab) {
            var tabs = document.querySelectorAll('.login-tab');
            var loginForm = document.getElementById('loginForm');
            var registerForm = document.getElementById('registerForm');
            var footerText = document.getElementById('footerText');
            var footerLink = document.getElementById('footerLink');

            if (tab === 'login') {
                if (tabs[0]) tabs[0].classList.add('active');
                if (tabs[1]) tabs[1].classList.remove('active');
                if (loginForm) loginForm.classList.add('active');
                if (registerForm) registerForm.classList.remove('active');
                if (footerText) footerText.textContent = "Don't have an account? ";
                if (footerLink) { footerLink.textContent = 'Sign up'; footerLink.onclick = function(){ window.switchLoginTab('register'); }; }
            } else {
                if (tabs[0]) tabs[0].classList.remove('active');
                if (tabs[1]) tabs[1].classList.add('active');
                if (loginForm) loginForm.classList.remove('active');
                if (registerForm) registerForm.classList.add('active');
                if (footerText) footerText.textContent = 'Already have an account? ';
                if (footerLink) { footerLink.textContent = 'Sign in'; footerLink.onclick = function(){ window.switchLoginTab('login'); }; }
            }
        };

        // Toggle password visibility (eye button)
        window.togglePasswordVisibility = function(inputId) {
            var input = document.getElementById(inputId);
            if (input) {
                var toggle = input.parentElement.querySelector('.input-toggle');
                if (input.type === 'password') {
                    input.type = 'text';
                    if (toggle) toggle.textContent = '🙈';
                } else {
                    input.type = 'password';
                    if (toggle) toggle.textContent = '👁️';
                }
            }
        };

        // Toggle checkbox
        window.toggleCheckboxLogin = function(checkboxId) {
            var cb = document.getElementById(checkboxId);
            if (cb) cb.classList.toggle('checked');
        };

        // Forgot Password
        window.handleForgotPassword = function() {
            var email = document.getElementById('loginEmail') ? document.getElementById('loginEmail').value.trim() : '';
            if (!email) {
                _toast('Please enter your email address first');
                return;
            }
            if (!_auth) { _toast('Service unavailable. Try again later.'); return; }
            _auth.sendPasswordResetEmail(email)
                .then(function() { _toast('✅ Password reset email sent! Check your inbox.'); })
                .catch(function(e) {
                    if (e.code === 'auth/user-not-found') _toast('No account found with this email.');
                    else if (e.code === 'auth/invalid-email') _toast('Please enter a valid email address.');
                    else _toast('Error: ' + e.message);
                });
        };

        // Handle Login (Firebase email/password)
        window.handleLogin = function() {
            var email = (document.getElementById('loginEmail') || {}).value || '';
            var password = (document.getElementById('loginPassword') || {}).value || '';
            var btn = document.querySelector('#loginForm .login-button');

            if (!email || !password) { _toast('Please fill in all fields'); return; }
            if (!_auth) { _showApp(); return; } // fallback if Firebase not loaded

            _setLoading(btn, true, 'Sign In');
            _toast('Signing in...');

            _auth.signInWithEmailAndPassword(email, password)
                .then(function(result) {
                    _setLoading(btn, false, 'Sign In');
                    _toast('Welcome back! 👋');
                    // Update last active
                    if (_db) _db.collection('users').doc(result.user.uid).update({ lastActive: firebase.firestore.FieldValue.serverTimestamp() }).catch(function(){});
                    setTimeout(_showApp, 800);
                })
                .catch(function(error) {
                    _setLoading(btn, false, 'Sign In');
                    var msg = 'Login failed. Please try again.';
                    if (error.code === 'auth/user-not-found') msg = 'No account found with this email.';
                    else if (error.code === 'auth/wrong-password') msg = 'Incorrect password. Try again.';
                    else if (error.code === 'auth/invalid-email') msg = 'Please enter a valid email.';
                    else if (error.code === 'auth/too-many-requests') msg = 'Too many attempts. Try again later.';
                    else if (error.code === 'auth/invalid-credential') msg = 'Invalid email or password.';
                    _toast('❌ ' + msg);
                });
        };

        // Handle Register (Firebase create user)
        window.handleRegister = function() {
            var firstName = (document.getElementById('registerFirstName') || {}).value || '';
            var lastName = (document.getElementById('registerLastName') || {}).value || '';
            var username = (document.getElementById('registerUsername') || {}).value || '';
            var email = (document.getElementById('registerEmail') || {}).value || '';
            var password = (document.getElementById('registerPassword') || {}).value || '';
            var confirmPassword = (document.getElementById('registerConfirmPassword') || {}).value || '';
            var datingEnabled = (document.getElementById('datingEnabled') || {}).classList && document.getElementById('datingEnabled').classList.contains('checked');
            var btn = document.querySelector('#registerForm .login-button');

            if (!firstName || !lastName || !username || !email || !password || !confirmPassword) {
                _toast('Please fill in all fields'); return;
            }
            if (password !== confirmPassword) { _toast('Passwords do not match'); return; }
            if (password.length < 6) { _toast('Password must be at least 6 characters'); return; }
            if (!_auth) { _showApp(); return; }

            _setLoading(btn, true, 'Create Account');
            _toast('Creating your account...');

            _auth.createUserWithEmailAndPassword(email, password)
                .then(function(result) {
                    var user = result.user;
                    // Update display name
                    return user.updateProfile({ displayName: firstName + ' ' + lastName })
                        .then(function() {
                            return _createProfile(user, { firstName: firstName, lastName: lastName, username: username, datingEnabled: datingEnabled });
                        })
                        .then(function() {
                            _setLoading(btn, false, 'Create Account');
                            _toast('🎉 Account created! Welcome to Lynkapp!');
                            setTimeout(_showApp, 800);
                        });
                })
                .catch(function(error) {
                    _setLoading(btn, false, 'Create Account');
                    var msg = 'Registration failed. Please try again.';
                    if (error.code === 'auth/email-already-in-use') msg = 'This email is already registered. Try signing in.';
                    else if (error.code === 'auth/invalid-email') msg = 'Please enter a valid email address.';
                    else if (error.code === 'auth/weak-password') msg = 'Password is too weak. Use at least 6 characters.';
                    _toast('❌ ' + msg);
                });
        };

        // Social Login (Google, Facebook, Apple)
        window.socialLogin = function(provider) {
            if (!_auth) { _toast('Social login unavailable. Use email/password.'); return; }
            var providerObj;
            if (provider === 'Google') {
                providerObj = new firebase.auth.GoogleAuthProvider();
            } else if (provider === 'Facebook') {
                providerObj = new firebase.auth.FacebookAuthProvider();
            } else if (provider === 'Apple') {
                providerObj = new firebase.auth.OAuthProvider('apple.com');
            } else {
                _toast('Unknown provider: ' + provider);
                return;
            }

            _toast('Opening ' + provider + ' login...');
            _auth.signInWithPopup(providerObj)
                .then(function(result) {
                    var user = result.user;
                    var isNew = result.additionalUserInfo && result.additionalUserInfo.isNewUser;
                    if (isNew) {
                        var nameParts = (user.displayName || '').split(' ');
                        return _createProfile(user, {
                            firstName: nameParts[0] || '',
                            lastName: nameParts.slice(1).join(' ') || '',
                            username: user.email ? user.email.split('@')[0] : 'user_' + user.uid.substring(0,6)
                        }).then(function() {
                            _toast('🎉 Welcome to Lynkapp!');
                            setTimeout(_showApp, 800);
                        });
                    } else {
                        _toast('Welcome back! 👋');
                        setTimeout(_showApp, 800);
                    }
                })
                .catch(function(error) {
                    if (error.code === 'auth/popup-closed-by-user') { _toast('Login cancelled.'); return; }
                    if (error.code === 'auth/popup-blocked') { _toast('Popup blocked. Please allow popups for this site.'); return; }
                    if (error.code === 'auth/account-exists-with-different-credential') { _toast('Account exists with different login method. Try email/password.'); return; }
                    _toast('❌ ' + provider + ' login failed: ' + error.message);
                });
        };

        // Show App After Login (global fallback)
        window.showAppAfterLogin = function() {
            _showApp();
        };

        // Show/hide login screen (for nav button)
        window.showLoginScreen = function() {
            var loginScreen = document.getElementById('loginScreen');
            var appContainer = document.querySelector('.app-container');
            if (loginScreen) { loginScreen.classList.remove('hidden'); loginScreen.style.display = 'flex'; }
            if (appContainer) appContainer.classList.remove('active');
        };

        // Fix the authOnboarding.showLoginScreen call from the nav button
        window.authOnboarding = window.authOnboarding || {};
        window.authOnboarding.showLoginScreen = window.showLoginScreen;

        // ---- Auth State Listener: auto-login if session exists ----
        if (_auth) {
            _auth.onAuthStateChanged(function(user) {
                if (user) {
                    console.log('[LynkApp] User already logged in:', user.email);
                    // If login screen is visible, hide it and show app
                    var loginScreen = document.getElementById('loginScreen');
                    if (loginScreen && !loginScreen.classList.contains('hidden')) {
                        _showApp();
                    }
                }
            });
        }

        // ---- Hook up Forgot Password link ----
        document.addEventListener('DOMContentLoaded', function() {
            var forgotLink = document.querySelector('.forgot-link');
            if (forgotLink) {
                forgotLink.onclick = function(e) {
                    e.preventDefault();
                    window.handleForgotPassword();
                };
            }
        });

        console.log('[LynkApp] Login system initialized ✅');
    })();
    <\/script>

`;

// Insert the login script block right before <!-- LOGIN SCREEN -->
const TARGET = '    <!-- LOGIN SCREEN -->';
if (html.includes(TARGET)) {
    html = html.replace(TARGET, loginScriptBlock + TARGET);
    console.log('✅ Login script block inserted before login screen');
} else {
    console.log('❌ Could not find insertion point "<!-- LOGIN SCREEN -->"');
    process.exit(1);
}

// Save the file
fs.writeFileSync('ConnectHub_Mobile_Design.html', html);
console.log('✅ File saved');

// Run syntax check
const vm = require('vm');
const newLines = html.split('\n');
let inScript = false;
let scriptContent = [];
let scriptCount = 0;
let errorsFound = 0;

for (let i = 0; i < newLines.length; i++) {
    const line = newLines[i];
    if (!inScript && line.includes('<script>') && !line.includes('<script src')) {
        inScript = true;
        scriptContent = [];
        scriptCount++;
    } else if (inScript && line.includes('</script>')) {
        inScript = false;
        const code = scriptContent.join('\n');
        try {
            new vm.Script(code);
            console.log(`Script block #${scriptCount} (line ${i+1}): ✅ OK`);
        } catch(e) {
            errorsFound++;
            console.log(`Script block #${scriptCount}: ❌ ${e.message}`);
        }
    } else if (inScript) {
        scriptContent.push(line);
    }
}

if (errorsFound === 0) {
    console.log('\n🎉 ALL SCRIPT BLOCKS SYNTAX-ERROR FREE!');
} else {
    console.log(`\n⚠️ ${errorsFound} script block(s) have errors.`);
}
