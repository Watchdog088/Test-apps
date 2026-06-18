// src/firebase/config.js
// Firebase v10 Modular SDK — with graceful fallback if env vars are missing
// CRASH-FIX Jun 2026: Wrapped initializeApp in try/catch to prevent black screen
// when VITE_FIREBASE_* env vars are missing or invalid.

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Check if we have the minimum required config
const hasValidConfig = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId
);

if (!hasValidConfig) {
  console.warn(
    '[Firebase] Missing VITE_FIREBASE_* environment variables.\n' +
    'Copy ConnectHub-SPA/.env.example to ConnectHub-SPA/.env and fill in your Firebase project credentials.\n' +
    'App will run in DEMO MODE (no real authentication).'
  );
}

// Initialize Firebase safely — never crash if config is invalid
let app = null;
let auth = null;
let db = null;
let storage = null;

try {
  // Avoid duplicate app registration during Vite HMR
  app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
  auth    = getAuth(app);
  db      = getFirestore(app);
  storage = getStorage(app);
} catch (err) {
  console.error('[Firebase] Initialization failed:', err.message);
  console.warn('[Firebase] Running without Firebase — check your .env file.');
  // auth/db/storage remain null — useAuth handles null gracefully
}

export { auth, db, storage };
export default app;

// ── Firebase Analytics — lazy init to avoid Vite/CJS issues ──────────────────
let _analytics = null;

export const getAnalyticsInstance = async () => {
  if (_analytics) return _analytics;
  if (!import.meta.env.PROD) return null;
  if (!import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) return null;
  if (!app) return null;
  try {
    const { getAnalytics, isSupported } = await import('firebase/analytics');
    const supported = await isSupported();
    if (supported) {
      _analytics = getAnalytics(app);
    }
  } catch (e) {
    console.warn('[Firebase] Analytics init failed (non-fatal):', e.message);
  }
  return _analytics;
};

if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(() => getAnalyticsInstance(), 2000);
  });
}

export const logEvent = async (eventName, params = {}) => {
  try {
    const analytics = await getAnalyticsInstance();
    if (!analytics) return;
    const { logEvent: firebaseLogEvent } = await import('firebase/analytics');
    firebaseLogEvent(analytics, eventName, params);
  } catch (e) {
    // Non-fatal
  }
};

export const analytics = null;
export const firebaseAvailable = hasValidConfig && app !== null;
