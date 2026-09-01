// BuyCoinsPage.jsx — Platform-gated coin purchases
// - Web: Stripe payment intent (existing flow)
// - Android/iOS native: Google Play Billing / StoreKit via @capacitor-community/in-app-purchases
// Section 2 requirement: App Store / Play Store policy compliance for IAP

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import apiClient from '@/services/api-client';

// These product IDs must EXACTLY match what you create in:
// - Google Play Console → Monetize → Products → In-app products
// - App Store Connect → In-App Purchases
const COIN_PACKAGES = [
  { id: 'coins_100',  productId: 'lynkapp_coins_100',  coins: 100,  bonus: 0,    priceUsd: 0.99,  label: '100 Coins',           emoji: '🪙' },
  { id: 'coins_500',  productId: 'lynkapp_coins_500',  coins: 500,  bonus: 50,   priceUsd: 4.99,  label: '500 + 50 Bonus',       emoji: '💫' },
  { id: 'coins_1000', productId: 'lynkapp_coins_1000', coins: 1000, bonus: 150,  priceUsd: 9.99,  label: '1,000 + 150 Bonus',    emoji: '⭐' },
  { id: 'coins_5000', productId: 'lynkapp_coins_5000', coins: 5000, bonus: 1000, priceUsd: 44.99, label: '5,000 + 1,000 Bonus',  emoji: '👑' },
];

// Detect if running inside Capacitor native shell (Android or iOS)
let _isNative = null;
async function isNativePlatform() {
  if (_isNative !== null) return _isNative;
  try {
    const { Capacitor } = await import('@capacitor/core');
    _isNative = Capacitor.isNativePlatform();
  } catch {
    _isNative = false;
  }
  return _isNative;
}

export default function BuyCoinsPage() {
  const navigate = useNavigate();
  const [balance, setBalance]       = useState(0);
  const [selected, setSelected]     = useState(null);
  const [loading, setLoading]       = useState(false);
  const [toast, setToast]           = useState('');
  const [platform, setPlatform]     = useState('web'); // 'web' | 'android' | 'ios'
  const [iapProducts, setIapProducts] = useState([]); // native products with real prices

  const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

  // ─── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      // Load coin balance
      const uid = auth.currentUser?.uid;
      if (uid) {
        const snap = await getDoc(doc(db, 'users', uid));
        setBalance(snap.data()?.coinBalance || 0);
      }

      // Detect platform
      try {
        const { Capacitor } = await import('@capacitor/core');
        if (Capacitor.isNativePlatform()) {
          const p = Capacitor.getPlatform(); // 'android' or 'ios'
          setPlatform(p);
          await loadNativeProducts();
        }
      } catch {
        setPlatform('web');
      }
    };
    init();
  }, []);

  // ─── Load native IAP products (gets real localized prices from store) ───────
  const loadNativeProducts = async () => {
    try {
      const { GooglePlayBillingService } = await import('@/services/google-play-billing-service');
      const svc = new GooglePlayBillingService();
      await svc.initialize();
      const productIds = COIN_PACKAGES.map(p => p.productId);
      const products = await svc.getProducts(productIds);
      setIapProducts(products);
      console.log('[IAP] Loaded', products.length, 'products from store');
    } catch (err) {
      console.warn('[IAP] Could not load native products (plugin not installed yet?):', err.message);
      // Falls back to showing USD prices from COIN_PACKAGES
    }
  };

  // ─── Helpers ───────────────────────────────────────────────────────────────
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const getNativePrice = (pkg) => {
    const native = iapProducts.find(p => p.productId === pkg.productId);
    return native?.formattedPrice || `$${pkg.priceUsd.toFixed(2)}`;
  };

  // ─── Purchase handlers ─────────────────────────────────────────────────────

  // Native purchase via Google Play Billing / StoreKit
  const handleNativePurchase = async () => {
    if (!selected) return showToast('Please select a coin package');
    setLoading(true);
    try {
      const { GooglePlayBillingService } = await import('@/services/google-play-billing-service');
      const svc = new GooglePlayBillingService();
      await svc.initialize();

      const result = await svc.purchaseProduct(selected.productId);
      if (result.success) {
        // Verify receipt with backend → backend credits coins to Firestore
        await apiClient.post('/billing/verify-purchase', {
          platform,
          productId: selected.productId,
          purchaseToken: result.purchaseToken,   // Android
          transactionId: result.transactionId,   // iOS
          packageId: selected.id,
        });

        // Acknowledge the purchase (required by Google Play policy)
        if (result.purchaseToken) {
          await svc.acknowledgePurchase(result.purchaseToken);
        }

        // Reload balance
        const uid = auth.currentUser?.uid;
        if (uid) {
          const snap = await getDoc(doc(db, 'users', uid));
          setBalance(snap.data()?.coinBalance || 0);
        }
        showToast(`✅ ${selected.label} added to your balance!`);
        setSelected(null);
      } else {
        showToast(result.message || 'Purchase cancelled');
      }
    } catch (err) {
      console.error('[IAP] Purchase error:', err);
      showToast(err.message || 'Purchase failed — please try again');
    } finally {
      setLoading(false);
    }
  };

  // Web purchase via Stripe
  const handleStripePurchase = async () => {
    if (!selected) return showToast('Please select a coin package');
    if (!stripeKey) return showToast('Payments not configured yet — check back soon!');
    setLoading(true);
    try {
      const { clientSecret } = await apiClient.post('/wallet/buy-coins', { packageId: selected.id });
      showToast(`Payment intent created! (Stripe checkout opens here)`);
      console.log('[BuyCoins] clientSecret received:', clientSecret?.slice(0, 20) + '...');
    } catch (err) {
      showToast(err.message || 'Payment failed — please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = () => {
    if (platform === 'android' || platform === 'ios') {
      return handleNativePurchase();
    }
    return handleStripePurchase();
  };

  // ─── Styles ────────────────────────────────────────────────────────────────
  const s = {
    page:    { minHeight: '100vh', background: '#0f0f0f', color: '#f1f5f9', padding: '20px', paddingBottom: '100px' },
    header:  { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' },
    back:    { background: 'none', border: 'none', color: '#94a3b8', fontSize: '24px', cursor: 'pointer' },
    title:   { fontSize: '22px', fontWeight: 800, color: '#f1f5f9', margin: 0 },
    badge:   { fontSize: '11px', background: '#1d4ed8', color: '#93c5fd', padding: '3px 8px',
               borderRadius: '99px', marginLeft: '8px', fontWeight: 600 },
    balance: { background: '#1e293b', borderRadius: '16px', padding: '20px', marginBottom: '24px', textAlign: 'center' },
    balNum:  { fontSize: '40px', fontWeight: 900, color: '#f59e0b' },
    balLbl:  { fontSize: '13px', color: '#94a3b8', marginTop: '4px' },
    grid:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' },
    card:    (isSelected) => ({
      background: isSelected ? '#1e3a5f' : '#1e293b',
      border: `2px solid ${isSelected ? '#3b82f6' : '#334155'}`,
      borderRadius: '16px', padding: '20px', cursor: 'pointer', textAlign: 'center',
      transition: 'all 0.2s',
    }),
    emoji:   { fontSize: '32px', marginBottom: '8px' },
    pkg:     { fontSize: '14px', fontWeight: 700, color: '#f1f5f9', marginBottom: '4px' },
    price:   { fontSize: '13px', color: '#94a3b8' },
    btn:     { width: '100%', padding: '16px', background: loading ? '#334155' : '#3b82f6',
               border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 700, fontSize: '16px', cursor: 'pointer' },
    note:    { textAlign: 'center', color: '#64748b', fontSize: '12px', marginTop: '16px', lineHeight: '1.5' },
    toast:   { position: 'fixed', bottom: '100px', left: '50%', transform: 'translateX(-50%)',
               background: '#1e293b', color: '#f1f5f9', padding: '12px 24px', borderRadius: '12px',
               fontSize: '14px', zIndex: 9999, whiteSpace: 'nowrap', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' },
  };

  const isNative = platform === 'android' || platform === 'ios';

  return (
    <div style={s.page}>
      {toast && <div style={s.toast}>{toast}</div>}

      <div style={s.header}>
        <button style={s.back} onClick={() => navigate(-1)}>←</button>
        <h1 style={s.title}>
          🪙 Buy Coins
          {isNative && (
            <span style={s.badge}>
              {platform === 'android' ? '🤖 Google Play' : '🍎 App Store'}
            </span>
          )}
        </h1>
      </div>

      <div style={s.balance}>
        <div style={s.balNum}>{balance.toLocaleString()}</div>
        <div style={s.balLbl}>Current Coin Balance</div>
      </div>

      <div style={s.grid}>
        {COIN_PACKAGES.map(pkg => (
          <div key={pkg.id} style={s.card(selected?.id === pkg.id)} onClick={() => setSelected(pkg)}>
            <div style={s.emoji}>{pkg.emoji}</div>
            <div style={s.pkg}>{pkg.label}</div>
            <div style={s.price}>
              {isNative ? getNativePrice(pkg) : `$${pkg.priceUsd.toFixed(2)}`}
            </div>
          </div>
        ))}
      </div>

      <button style={s.btn} onClick={handleBuy} disabled={loading}>
        {loading
          ? 'Processing...'
          : selected
            ? `Buy ${selected.label} — ${isNative ? getNativePrice(selected) : `$${selected.priceUsd.toFixed(2)}`}`
            : 'Select a Package'
        }
      </button>

      <p style={s.note}>
        {isNative
          ? `Purchases processed securely by ${platform === 'android' ? 'Google Play' : 'Apple App Store'}.\nNo payment info shared with LynkApp.`
          : !stripeKey
            ? 'ℹ️ Payments in test mode — no real charges will occur'
            : 'Payments processed securely by Stripe.'
        }
      </p>
    </div>
  );
}
