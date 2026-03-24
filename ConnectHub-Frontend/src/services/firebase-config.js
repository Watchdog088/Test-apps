/**
 * Firebase Configuration
 * LynkApp Production Configuration
 * Phase 1: Firebase Setup COMPLETE ✅
 */

// Firebase configuration - LynkApp Project
const firebaseConfig = {
    apiKey: "AIzaSyDmnKjhl--S69dWqaVSgCgJZcMqTsyQgwA",
    authDomain: "lynkapp-c7db1.firebaseapp.com",
    projectId: "lynkapp-c7db1",
    storageBucket: "lynkapp-c7db1.firebasestorage.app",
    messagingSenderId: "258552263213",
    appId: "1:258552263213:web:9ddecf900318ac6c84bea4",
    measurementId: "G-V82FSK7TYV"
};

// Mock mode disabled - using real Firebase backend
const USE_MOCK_MODE = false;

// Expose globally for non-module scripts
window.firebaseConfig = firebaseConfig;
window.USE_MOCK_MODE = USE_MOCK_MODE;
// export { firebaseConfig, USE_MOCK_MODE }; // disabled - loaded as regular <script>
