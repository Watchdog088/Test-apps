// src/firebase/config.js
// Firebase v10 Modular SDK — tree-shakeable, only imports what you use
// UPDATED Jun 10 2026: Firebase Analytics added with lazy initialization
// to avoid Vite/CJS compatibility issues on first load.

import { initializeApp } from 'firebase/app';
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export individual services
export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const storage = getStorage(app);

// ── Firebase Analytics — lazy init to avoid Vite/CJS issues ──────────────────
// Analytics is initialized once after the page loads, not at module parse time.
// This prevents "Cannot use import statement outside a module" errors with Vite.
let _analytics = null;

export const getAnalyticsInstance = async () => {
  if (_analytics) return _analytics;
  // Only initialize in production and when measurementId is configured
  if (!import.meta.env.PROD) return null;
  if (!import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) return null;
  try {
    const { getAnalytics, isSupported } = await import('firebase/analytics');
    const supported = await isSupported();
    if (supported) {
      _analytics = getAnalytics(app);
      console.log('[Firebase] Analytics initialized');
    }
  } catch (e) {
    console.warn('[Firebase] Analytics init failed (non-fatal):', e.message);
  }
  return _analytics;
};

// Auto-initialize analytics after page load (non-blocking)
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    // Delay by 2s to ensure main app hydration is not blocked
    setTimeout(() => getAnalyticsInstance(), 2000);
  });
}

// ── Log a custom analytics event (safe no-op if analytics not ready) ─────────
export const logEvent = async (eventName, params = {}) => {
  try {
    const analytics = await getAnalyticsInstance();
    if (!analytics) return;
    const { logEvent: firebaseLogEvent } = await import('firebase/analytics');
    firebaseLogEvent(analytics, eventName, params);
  } catch (e) {
    // Non-fatal — analytics failures should never break the app
  }
};

// analytics export kept for backwards compatibility (null until lazy-init completes)
export const analytics = null;

export default app;
