/**
 * Google Play Billing Service — LynkApp
 * BLOCKER 5 FIX: Replaces Stripe for virtual coin purchases on Android (Play Store policy)
 *
 * Google Play Store REQUIRES all digital goods (virtual coins, subscriptions)
 * to use Google Play Billing. Using Stripe for digital goods = REJECTION.
 *
 * This service uses the @capacitor-community/in-app-purchases plugin, which wraps
 * the native Google Play Billing Library v7 on Android and StoreKit 2 on iOS.
 *
 * HOW TO ACTIVATE:
 *   1. In ConnectHub-SPA, run: npm install @capacitor-community/in-app-purchases
 *   2. Run: npx cap sync android
 *   3. In Google Play Console → App → Monetize → In-app products:
 *      - Create CONSUMABLE products with these exact Product IDs:
 *        coins_100, coins_500, coins_1000, coins_5000, coins_10000
 *   4. Import and use this service in BuyCoinsPage.jsx (already wired below)
 *   5. The platform gate in BuyCoinsPage.jsx automatically routes:
 *      Android → this service (Google Play Billing)
 *      iOS     → this service (StoreKit/RevenueCat — same plugin)
 *      Web     → existing Stripe flow (unchanged)
 */

import { Capacitor } from '@capacitor/core';

// ─── Product catalog (must match Play Console / App Store Connect exactly) ───
export const COIN_PRODUCTS = [
  { id: 'coins_100',   coins: 100,   label: '100 Coins',   price: '$0.99'  },
  { id: 'coins_500',   coins: 500,   label: '500 Coins',   price: '$3.99'  },
  { id: 'coins_1000',  coins: 1000,  label: '1,000 Coins', price: '$6.99'  },
  { id: 'coins_5000',  coins: 5000,  label: '5,000 Coins', price: '$24.99' },
  { id: 'coins_10000', coins: 10000, label: '10,000 Coins',price: '$39.99' },
];

// ─── Detect platform ──────────────────────────────────────────────────────────
export const isNativeAndroid = () =>
  Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';

export const isNativeIOS = () =>
  Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';

export const isNativeMobile = () => Capacitor.isNativePlatform();

// ─── Lazy-load the plugin (only available in native context) ──────────────────
let _iap = null;
async function getIAP() {
  if (_iap) return _iap;
  if (!isNativeMobile()) {
    throw new Error('Google Play Billing / StoreKit only available in native app');
  }
  try {
    // Dynamic import so the web build doesn't fail if plugin isn't installed yet
    const { InAppPurchases } = await import('@capacitor-community/in-app-purchases');
    _iap = InAppPurchases;
    return _iap;
  } catch (err) {
    console.error('[Billing] Plugin not installed. Run: npm install @capacitor-community/in-app-purchases');
    throw new Error('IAP plugin not installed. See google-play-billing-service.js header for setup instructions.');
  }
}

// ─── Initialize billing (call once on app start for native builds) ────────────
export async function initBilling() {
  if (!isNativeMobile()) return { success: false, reason: 'web' };
  try {
    const iap = await getIAP();
    await iap.initialize();
    console.log('[Billing] Initialized');
    return { success: true };
  } catch (err) {
    console.error('[Billing] Init failed:', err);
    return { success: false, error: err.message };
  }
}

// ─── Load product details (localized prices from the store) ──────────────────
export async function loadProducts() {
  const iap = await getIAP();
  const productIds = COIN_PRODUCTS.map(p => p.id);
  try {
    const result = await iap.getProducts({ productIds });
    // Merge store prices with our catalog
    return COIN_PRODUCTS.map(localProduct => {
      const storeProduct = result.products?.find(sp => sp.productId === localProduct.id);
      return {
        ...localProduct,
        // Use the store's localized price if available (handles currency/region)
        price: storeProduct?.price ?? localProduct.price,
        localizedPrice: storeProduct?.localizedPrice ?? localProduct.price,
        title: storeProduct?.title ?? localProduct.label,
        storeProduct, // full store object for debugging
      };
    });
  } catch (err) {
    console.error('[Billing] loadProducts failed:', err);
    // Return static catalog as fallback so UI doesn't break
    return COIN_PRODUCTS;
  }
}

// ─── Purchase a coin pack ─────────────────────────────────────────────────────
/**
 * Initiates a purchase flow for a given product ID.
 * @param {string} productId — e.g. 'coins_500'
 * @param {string} userId — Firebase UID, sent to backend for coin credit
 * @returns {{ success: boolean, coins?: number, transactionId?: string, error?: string }}
 */
export async function purchaseCoins(productId, userId) {
  if (!isNativeMobile()) {
    throw new Error('purchaseCoins() called on web — use Stripe instead');
  }

  const product = COIN_PRODUCTS.find(p => p.id === productId);
  if (!product) {
    return { success: false, error: `Unknown product: ${productId}` };
  }

  try {
    const iap = await getIAP();

    // 1. Launch the native purchase sheet
    const purchaseResult = await iap.purchaseProduct({ productId });

    if (!purchaseResult || purchaseResult.state === 'CANCELLED') {
      return { success: false, error: 'Purchase cancelled by user' };
    }

    if (purchaseResult.state !== 'PURCHASED' && purchaseResult.state !== 'RESTORED') {
      return { success: false, error: `Unexpected purchase state: ${purchaseResult.state}` };
    }

    const transactionId = purchaseResult.transactionId || purchaseResult.purchaseToken;

    // 2. Verify purchase server-side (REQUIRED — prevents fraud)
    const verifyResult = await verifyPurchaseWithBackend({
      productId,
      transactionId,
      purchaseToken: purchaseResult.purchaseToken,
      userId,
      platform: Capacitor.getPlatform(),
    });

    if (!verifyResult.success) {
      return { success: false, error: verifyResult.error || 'Server verification failed' };
    }

    // 3. Acknowledge / consume the purchase (required by Google Play)
    await iap.consumeProduct({ transactionId });

    return {
      success: true,
      coins: product.coins,
      transactionId,
      newBalance: verifyResult.newBalance,
    };

  } catch (err) {
    console.error('[Billing] purchaseCoins error:', err);
    return { success: false, error: err.message };
  }
}

// ─── Server-side verification ─────────────────────────────────────────────────
/**
 * Sends purchase receipt to LynkApp backend for verification and coin crediting.
 * Backend route: POST /api/billing/verify-purchase
 */
async function verifyPurchaseWithBackend({ productId, transactionId, purchaseToken, userId, platform }) {
  try {
    // Import API client dynamically to avoid circular deps
    const { apiRequest } = await import('./api-client.js').catch(() => ({ apiRequest: null }));

    if (!apiRequest) {
      // Fallback: direct fetch to backend
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://api.lynkapp.com';
      const response = await fetch(`${backendUrl}/api/billing/verify-purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, transactionId, purchaseToken, userId, platform }),
      });
      const data = await response.json();
      return data;
    }

    const data = await apiRequest('POST', '/billing/verify-purchase', {
      productId,
      transactionId,
      purchaseToken,
      userId,
      platform,
    });
    return data;

  } catch (err) {
    console.error('[Billing] Backend verification error:', err);
    return { success: false, error: 'Network error during verification' };
  }
}

// ─── Restore purchases (required by Apple — optional on Android) ──────────────
export async function restorePurchases(userId) {
  if (!isNativeMobile()) return { restored: [] };
  try {
    const iap = await getIAP();
    const result = await iap.restorePurchases();
    console.log('[Billing] Restored purchases:', result);
    return { restored: result.purchases ?? [] };
  } catch (err) {
    console.error('[Billing] Restore failed:', err);
    return { restored: [], error: err.message };
  }
}

export default {
  COIN_PRODUCTS,
  isNativeMobile,
  isNativeAndroid,
  isNativeIOS,
  initBilling,
  loadProducts,
  purchaseCoins,
  restorePurchases,
};
