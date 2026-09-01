// src/main.jsx — App entry point with Sentry error tracking + Capacitor Push Notifications
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import App from './App';
import './styles/global.css';

// ─── Sentry Error Tracking ────────────────────────────────────────────────────
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  sendDefaultPii: true,
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
  tracePropagationTargets: [
    'localhost',
    '127.0.0.1',
    /^https:\/\/lynkapp\.com/,
    /^https:\/\/api\.lynkapp\.com/,
  ],
  environment: import.meta.env.MODE,
  release: 'lynkapp@1.0.0',
});

// ─── Native JS error fallback ─────────────────────────────────────────────────
window.addEventListener('error', (e) => {
  console.error('[GlobalError]', e.message, 'at', e.filename, ':', e.lineno);
  Sentry.captureException(e.error || new Error(e.message));
});
window.addEventListener('unhandledrejection', (e) => {
  console.error('[UnhandledPromise]', e.reason);
  Sentry.captureException(e.reason instanceof Error ? e.reason : new Error(String(e.reason)));
  e.preventDefault();
});

// ─── Capacitor Push Notifications Registration (Android + iOS) ───────────────
// Section 2 requirement: Full PushNotifications.requestPermissions() lifecycle
// This runs ONLY on native (Capacitor) — skipped silently on web.
async function registerPushNotifications() {
  try {
    // Dynamically import Capacitor to avoid breaking web build
    const { Capacitor } = await import('@capacitor/core');
    if (!Capacitor.isNativePlatform()) {
      console.log('[Push] Running on web — skipping native push registration');
      return;
    }

    const { PushNotifications } = await import('@capacitor/push-notifications');

    // Step 1: Request permission
    const permResult = await PushNotifications.requestPermissions();
    if (permResult.receive !== 'granted') {
      console.warn('[Push] Permission not granted:', permResult.receive);
      return;
    }

    // Step 2: Register with APNs / FCM
    await PushNotifications.register();

    // Step 3: Get the FCM/APNs token and send to your backend
    PushNotifications.addListener('registration', async (token) => {
      console.log('[Push] Registration token:', token.value);
      try {
        // Store token in Firestore for this user
        const { auth, db } = await import('./firebase/config');
        const { doc, updateDoc } = await import('firebase/firestore');
        const uid = auth.currentUser?.uid;
        if (uid) {
          await updateDoc(doc(db, 'users', uid), {
            pushToken: token.value,
            pushPlatform: Capacitor.getPlatform(), // 'android' or 'ios'
            pushTokenUpdatedAt: new Date().toISOString(),
          });
          console.log('[Push] Token saved to Firestore for user:', uid);
        }
      } catch (err) {
        console.error('[Push] Failed to save token to Firestore:', err);
        Sentry.captureException(err);
      }
    });

    // Step 4: Handle registration errors
    PushNotifications.addListener('registrationError', (err) => {
      console.error('[Push] Registration error:', err.error);
      Sentry.captureException(new Error('[Push] Registration error: ' + err.error));
    });

    // Step 5: Handle foreground notifications
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('[Push] Foreground notification received:', notification.title);
      // The app is open — show an in-app toast or update badge
      // Dispatching a custom event so any component can react
      window.dispatchEvent(new CustomEvent('push-notification-received', {
        detail: notification,
      }));
    });

    // Step 6: Handle notification taps (app opened from background)
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('[Push] Notification tapped:', action.notification.title);
      const data = action.notification.data || {};
      // Route to the relevant screen based on notification type
      if (data.type === 'message' && data.conversationId) {
        window.location.hash = `/messages/${data.conversationId}`;
      } else if (data.type === 'match') {
        window.location.hash = '/dating/matches';
      } else if (data.type === 'live') {
        window.location.hash = `/live/watch/${data.streamId}`;
      }
    });

    console.log('[Push] Push notification registration complete ✅');
  } catch (err) {
    // Not a native platform or @capacitor/push-notifications not installed
    console.warn('[Push] Push registration skipped (not native or plugin missing):', err.message);
  }
}

// Run push registration on app load (non-blocking)
registerPushNotifications();

// ─── React Root ───────────────────────────────────────────────────────────────
ReactDOM.createRoot(document.getElementById('root')).render(
  <Sentry.ErrorBoundary
    fallback={({ error, resetError }) => (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100vh', padding: '20px',
        background: '#0f0f0f', color: '#fff', textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>Something went wrong</h2>
        <p style={{ color: '#999', marginBottom: '24px', maxWidth: '400px' }}>
          The error has been automatically reported to our team. We'll fix it ASAP.
        </p>
        <button
          onClick={resetError}
          style={{
            background: '#7c3aed', color: '#fff', border: 'none',
            borderRadius: '8px', padding: '12px 24px', cursor: 'pointer',
            fontSize: '14px', fontWeight: '600'
          }}
        >
          Try Again
        </button>
        <p style={{ color: '#444', fontSize: '12px', marginTop: '16px' }}>
          Error: {error?.message || 'Unknown error'}
        </p>
      </div>
    )}
    showDialog={false}
  >
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Sentry.ErrorBoundary>
);
