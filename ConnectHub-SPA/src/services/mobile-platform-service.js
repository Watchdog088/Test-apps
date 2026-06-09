/**
 * LynkApp Mobile Platform Service
 * Handles iOS / Android detection, Capacitor bridge, deep links,
 * safe-area insets, haptic feedback, and push notification registration.
 * Works transparently as a PWA on desktop when Capacitor is not present.
 */

// ─── Platform Detection ────────────────────────────────────────────────────

export const isCapacitor = () =>
  typeof window !== 'undefined' && !!(window.Capacitor);

export const isNativeIOS = () =>
  isCapacitor() && window.Capacitor.getPlatform() === 'ios';

export const isNativeAndroid = () =>
  isCapacitor() && window.Capacitor.getPlatform() === 'android';

export const isNative = () => isNativeIOS() || isNativeAndroid();

export const isPWA = () => {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
};

export const isMobileWeb = () => {
  if (typeof window === 'undefined') return false;
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

export const getPlatform = () => {
  if (isNativeIOS()) return 'ios-native';
  if (isNativeAndroid()) return 'android-native';
  if (isPWA()) return 'pwa';
  if (isMobileWeb()) return 'mobile-web';
  return 'desktop';
};

// ─── Safe Area Insets ─────────────────────────────────────────────────────

/**
 * Inject CSS custom properties for safe-area-inset-* so components
 * can use var(--sat), var(--sar), var(--sab), var(--sal).
 * This works both via CSS env() and via Capacitor SafeArea plugin.
 */
export function applySafeAreaInsets() {
  const style = document.documentElement.style;
  // CSS env() values (supported in iOS Safari 11.2+ and Chrome 69+)
  style.setProperty('--sat', 'env(safe-area-inset-top, 0px)');
  style.setProperty('--sar', 'env(safe-area-inset-right, 0px)');
  style.setProperty('--sab', 'env(safe-area-inset-bottom, 0px)');
  style.setProperty('--sal', 'env(safe-area-inset-left, 0px)');

  // Also expose on :root via a JS-driven approach for Capacitor
  if (isCapacitor()) {
    try {
      import('@capacitor/status-bar').then(({ StatusBar, Style }) => {
        StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
        StatusBar.setBackgroundColor({ color: '#0a0a18' }).catch(() => {});
      }).catch(() => {});
    } catch (_) {}
  }
}

// ─── Haptic Feedback ─────────────────────────────────────────────────────

export async function hapticLight() {
  if (!isCapacitor()) return;
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch (_) {}
}

export async function hapticMedium() {
  if (!isCapacitor()) return;
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch (_) {}
}

export async function hapticSuccess() {
  if (!isCapacitor()) return;
  try {
    const { Haptics, NotificationType } = await import('@capacitor/haptics');
    await Haptics.notification({ type: NotificationType.Success });
  } catch (_) {}
}

export async function hapticError() {
  if (!isCapacitor()) return;
  try {
    const { Haptics, NotificationType } = await import('@capacitor/haptics');
    await Haptics.notification({ type: NotificationType.Error });
  } catch (_) {}
}

// ─── Deep Link Handling ───────────────────────────────────────────────────

let _deepLinkHandlers = [];

/**
 * Register a deep link handler. Callback receives the URL string.
 * Usage: registerDeepLinkHandler((url) => navigate(url.replace('https://lynkapp.com', '')));
 */
export function registerDeepLinkHandler(callback) {
  _deepLinkHandlers.push(callback);
  return () => {
    _deepLinkHandlers = _deepLinkHandlers.filter(h => h !== callback);
  };
}

async function initDeepLinks() {
  if (!isCapacitor()) {
    // Handle web+lynkapp:// protocol on PWA / web
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const uri = params.get('uri');
      if (uri) {
        _deepLinkHandlers.forEach(h => h(uri));
      }
    }
    return;
  }

  try {
    const { App } = await import('@capacitor/app');
    App.addListener('appUrlOpen', ({ url }) => {
      _deepLinkHandlers.forEach(h => h(url));
    });
  } catch (_) {}
}

// ─── Push Notification Registration ─────────────────────────────────────

export async function requestPushPermissions() {
  if (isCapacitor()) {
    try {
      const { PushNotifications } = await import('@capacitor/push-notifications');
      const permission = await PushNotifications.requestPermissions();
      if (permission.receive === 'granted') {
        await PushNotifications.register();
        PushNotifications.addListener('registration', ({ value: token }) => {
          console.log('[Push] FCM/APNs token:', token);
          // Save token to Firestore under users/{uid}/pushTokens
          savePushTokenToFirestore(token);
        });
        PushNotifications.addListener('registrationError', err => {
          console.warn('[Push] Registration error:', err);
        });
        PushNotifications.addListener('pushNotificationReceived', notification => {
          console.log('[Push] Received:', notification);
        });
        PushNotifications.addListener('pushNotificationActionPerformed', action => {
          const url = action.notification.data?.url;
          if (url) _deepLinkHandlers.forEach(h => h(url));
        });
      }
    } catch (_) {}
  } else if ('Notification' in window) {
    // Web push via OneSignal (already wired in main.jsx)
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
}

async function savePushTokenToFirestore(token) {
  try {
    const { getAuth } = await import('firebase/auth');
    const { getFirestore, doc, setDoc, serverTimestamp } = await import('firebase/firestore');
    const auth = getAuth();
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const db = getFirestore();
    await setDoc(
      doc(db, 'users', uid, 'pushTokens', token),
      { token, platform: getPlatform(), updatedAt: serverTimestamp() },
      { merge: true }
    );
  } catch (_) {}
}

// ─── App State Listeners (Capacitor only) ────────────────────────────────

export async function initAppStateListeners({ onPause, onResume } = {}) {
  if (!isCapacitor()) return;
  try {
    const { App } = await import('@capacitor/app');
    App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) onResume?.();
      else onPause?.();
    });
  } catch (_) {}
}

// ─── Back Button (Android) ────────────────────────────────────────────────

export async function initAndroidBackButton(navigateBack) {
  if (!isNativeAndroid()) return;
  try {
    const { App } = await import('@capacitor/app');
    App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        navigateBack();
      } else {
        App.minimizeApp();
      }
    });
  } catch (_) {}
}

// ─── Keyboard Handling ────────────────────────────────────────────────────

export async function initKeyboardListeners() {
  if (!isCapacitor()) return;
  try {
    const { Keyboard } = await import('@capacitor/keyboard');
    Keyboard.addListener('keyboardWillShow', ({ keyboardHeight }) => {
      document.documentElement.style.setProperty(
        '--keyboard-height',
        `${keyboardHeight}px`
      );
      document.body.classList.add('keyboard-open');
    });
    Keyboard.addListener('keyboardWillHide', () => {
      document.documentElement.style.setProperty('--keyboard-height', '0px');
      document.body.classList.remove('keyboard-open');
    });
  } catch (_) {}
}

// ─── Init (call once on app mount) ───────────────────────────────────────

export async function initMobilePlatform({ navigate } = {}) {
  applySafeAreaInsets();
  await initDeepLinks();
  await initKeyboardListeners();

  if (navigate) {
    await initAndroidBackButton(navigate);
    registerDeepLinkHandler((url) => {
      try {
        const path = url
          .replace('https://lynkapp.com', '')
          .replace('web+lynkapp://', '/');
        if (path && path !== window.location.pathname) {
          navigate(path);
        }
      } catch (_) {}
    });
  }

  if (isNative()) {
    await requestPushPermissions();
    await initAppStateListeners({
      onResume: () => console.log('[App] Resumed'),
      onPause: () => console.log('[App] Paused'),
    });
  }

  console.log(`[LynkApp] Platform: ${getPlatform()}`);
}

export default {
  isCapacitor,
  isNativeIOS,
  isNativeAndroid,
  isNative,
  isPWA,
  isMobileWeb,
  getPlatform,
  applySafeAreaInsets,
  hapticLight,
  hapticMedium,
  hapticSuccess,
  hapticError,
  registerDeepLinkHandler,
  requestPushPermissions,
  initMobilePlatform,
};
