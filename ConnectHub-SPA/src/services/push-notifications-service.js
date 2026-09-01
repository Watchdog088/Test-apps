// push-notifications-service.js — Section 2 Fix #15
// Capacitor Push Notification registration lifecycle.
// Called from App.jsx on native platforms only.
// Tokens are saved to Firestore so the backend can send targeted pushes.

import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/firebase/config';

/**
 * Initialize push notification registration on native iOS and Android.
 * Must be called once at app startup (inside App.jsx useEffect).
 */
export async function initPushNotifications() {
  if (!Capacitor.isNativePlatform()) return;

  try {
    // 1. Request permission
    const permResult = await PushNotifications.requestPermissions();
    if (permResult.receive !== 'granted') {
      console.warn('[Push] Permission not granted:', permResult.receive);
      return;
    }

    // 2. Register with the OS (triggers APNs on iOS, FCM on Android)
    await PushNotifications.register();

    // 3. Save the FCM/APNs token to Firestore for the current user
    PushNotifications.addListener('registration', async (token) => {
      console.log('[Push] Registration token:', token.value);
      const user = auth.currentUser;
      if (user) {
        try {
          await updateDoc(doc(db, 'users', user.uid), {
            pushToken: token.value,
            pushPlatform: Capacitor.getPlatform(),
            pushTokenUpdatedAt: new Date().toISOString(),
          });
          console.log('[Push] Token saved to Firestore for user:', user.uid);
        } catch (e) {
          console.error('[Push] Failed to save token to Firestore:', e);
        }
      }
    });

    // 4. Handle foreground notification display
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('[Push] Received in foreground:', notification);
      // TODO: Show an in-app toast/banner when notification arrives while app is open
    });

    // 5. Handle notification tap action (background/terminated)
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('[Push] Action performed:', action.notification);
      const data = action.notification.data;
      // Route to the relevant page based on notification payload
      if (data?.route) {
        // The router navigation is handled in App.jsx via a global event
        window.dispatchEvent(new CustomEvent('push-navigate', { detail: { route: data.route } }));
      }
    });

    // 6. Handle registration errors
    PushNotifications.addListener('registrationError', (error) => {
      console.error('[Push] Registration error:', error);
    });

  } catch (err) {
    console.error('[Push] initPushNotifications failed:', err);
  }
}

export default initPushNotifications;
