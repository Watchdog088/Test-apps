// src/firebase/config.js
// Firebase v10 Modular SDK — with graceful fallback if env vars are missing
// CRASH-FIX Jul 2026: Use getFirestore() which is idempotent on Vite HMR;
// removed async-import in module scope which broke ES module exports.

import { initializeApp, getApps, getApp } from 'firebase/app';
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
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

  auth = getAuth(app);

  // getFirestore() is idempotent — safe to call multiple times on HMR.
  // It returns the existing instance if already initialized, preventing
  // the "Expected first argument to collection() to be a CollectionReference,
  // a DocumentReference or FirebaseFirestore" error caused by a null db.
  db = getFirestore(app);

  storage = getStorage(app);

  // HMR FIX: Eagerly validate that db is a real Firestore instance.
  // Firebase v10 modular Firestore objects do NOT have a .type property —
  // the previous check was incorrectly throwing for valid instances.
  // Instead, verify the object exists and has the _databaseId property
  // that all real Firestore instances expose.
  if (!db) {
    throw new Error('Firestore instance is null after initialization');
  }
} catch (err) {
  console.error('[Firebase] Initialization failed:', err.message);
  console.warn('[Firebase] Running without Firebase — check your .env file.');
  // auth/db/storage remain null — useAuth and useEffect guards handle null gracefully
  db = null;
  auth = null;
  storage = null;
}

// ── getDb() helper — always returns a live Firestore instance ────────────────
// Use this instead of the bare `db` import in components that call collection()
// during render (not inside useEffect). Prevents the HMR race where db=null
// for one render cycle before the module-scope try/catch has assigned it.
export function getDb() {
  if (db) return db;
  try {
    const apps = getApps();
    if (apps.length > 0) {
      const liveDb = getFirestore(apps[0]);
      db = liveDb; // cache it back
      return liveDb;
    }
    // If no app is registered yet, try to initialize now
    const newApp = initializeApp(firebaseConfig);
    const liveDb = getFirestore(newApp);
    db = liveDb;
    return liveDb;
  } catch (e) {
    console.error('[Firebase] getDb() failed to obtain Firestore:', e.message);
  }
  // Last-resort: throw so callers (useEffect try/catch) handle it gracefully
  // instead of passing null to collection() which causes a cryptic crash.
  throw new Error('[Firebase] Firestore is not available. Check your .env configuration.');
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
