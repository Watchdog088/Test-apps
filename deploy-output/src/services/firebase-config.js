/**
 * Firebase Configuration
 * Quick setup for prototype backend testing
 * Phase 1: Core Infrastructure
 */

// Firebase configuration (replace with your actual Firebase project credentials)
const firebaseConfig = {
    apiKey: "AIzaSyDEMO_KEY_REPLACE_WITH_YOUR_ACTUAL_KEY",
    authDomain: "connecthub-demo.firebaseapp.com",
    projectId: "connecthub-demo",
    storageBucket: "connecthub-demo.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456",
    measurementId: "G-ABCDEF1234",
    databaseURL: "https://connecthub-demo-default-rtdb.firebaseio.com"
};

// Mock mode for development (set to true to use mock data without Firebase)
const USE_MOCK_MODE = true;

export { firebaseConfig, USE_MOCK_MODE };
