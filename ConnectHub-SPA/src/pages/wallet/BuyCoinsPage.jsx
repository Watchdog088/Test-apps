// BuyCoinsPage.jsx — Sprint 2: Coin purchase page with Stripe payment
// NEW file — zero risk to existing pages until route is added in App.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import apiClient from '@/services/api-client';

const COIN_PACKAGES = [
  { id: 'coins_100',  coins: 100,  bonus: 0,    priceUsd: 0.99,  label: '100 Coins',           emoji: '🪙' },
  { id: 'coins_500',  coins: 500,  bonus: 50,   priceUsd: 4.99,  label: '500 + 50 Bonus',       emoji: '💫' },
  { id: 'coins_1000', coins: 1000, bonus: 150,  priceUsd: 9.99,  label: '1,000 + 150 Bonus',    emoji: '⭐' },
  { id: 'coins_5000', coins: 5000, bonus: 1000, priceUsd: 44.99, label: '5,000 + 1,000 Bonus',  emoji: '👑' },
];

export default function BuyCoinsPage() {
  const navigate    = useNavigate();
  const [balance, setBalance]     = useState(0);
  const [selected, setSelected]   = useState(null);
  const [loading, setLoading]     = useState(false);
  const [toast, setToast]         = useState('');
  const [stripeReady, setStripeReady] = useState(false);

  // Check if Stripe publishable key is configured
  const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

  useEffect(() => {
    setStripeReady(Boolean(stripeKey));
    // Load current coin balance
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    getDoc(doc(db, 'users', uid)).then(snap => {
      setBalance(snap.data()?.coinBalance || 0);
    });
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleBuy = async () => {
    if (!selected) return showToast('Please select a coin package');
    if (!stripeReady) return showToast('Payments not configured yet — check back soon!');
    setLoading(true);
    try {
      const { clientSecret } = await apiClient.post('/wallet/buy-coins', { packageId: selected.id });
      // In production: load Stripe.js and show payment sheet
      // For now: show confirmation that intent was created
      showToast(`Payment intent created! (Stripe checkout would open here)`);
      console.log('[BuyCoins] clientSecret received:', clientSecret?.slice(0, 20) + '...');
    } catch (err) {
      showToast(err.message || 'Payment failed — please try again');
    } finally {
      setLoading(false);
    }
  };

  const s = {
    page:    { minHeight: '100vh', background: '#0f0f0f', color: '#f1f5f9', padding: '20px', paddingBottom: '100px' },
    header:  { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' },
    back:    { background: 'none', border: 'none', color: '#94a3b8', fontSize: '24px', cursor: 'pointer' },
    title:   { fontSize: '22px', fontWeight: 800, color: '#f1f5f9', margin: 0 },
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
    toast:   { position: 'fixed', bottom: '100px', left: '50%', transform: 'translateX(-50%)',
               background: '#1e293b', color: '#f1f5f9', padding: '12px 24px', borderRadius: '12px',
               fontSize: '14px', zIndex: 9999, whiteSpace: 'nowrap' },
  };

  return (
    <div style={s.page}>
      {toast && <div style={s.toast}>{toast}</div>}
      <div style={s.header}>
        <button style={s.back} onClick={() => navigate(-1)}>←</button>
        <h1 style={s.title}>🪙 Buy Coins</h1>
      </div>

      <div style={s.balance}>
        <div style={s.balNum}>{balance.toLocaleString()}</div>
        <div style={s.balLbl}>Current Balance</div>
      </div>

      <div style={s.grid}>
        {COIN_PACKAGES.map(pkg => (
          <div key={pkg.id} style={s.card(selected?.id === pkg.id)} onClick={() => setSelected(pkg)}>
            <div style={s.emoji}>{pkg.emoji}</div>
            <div style={s.pkg}>{pkg.label}</div>
            <div style={s.price}>${pkg.priceUsd.toFixed(2)}</div>
          </div>
        ))}
      </div>

      <button style={s.btn} onClick={handleBuy} disabled={loading}>
        {loading ? 'Processing...' : selected ? `Buy ${selected.label} — $${selected.priceUsd.toFixed(2)}` : 'Select a Package'}
      </button>

      {!stripeReady && (
        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '12px', marginTop: '16px' }}>
          ℹ️ Payments in test mode — no real charges will occur
        </p>
      )}
    </div>
  );
}
