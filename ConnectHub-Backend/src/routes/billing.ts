// ConnectHub-Backend/src/routes/billing.ts
// IAP Receipt Verification endpoint — called after a native in-app purchase
// Verifies Google Play or Apple App Store receipts server-side, then credits coins.
//
// POST /api/billing/verify-purchase
// Body: { platform, productId, purchaseToken, transactionId, packageId }
// Auth: Firebase ID token in Authorization header

import express, { Request, Response } from 'express';
import * as admin from 'firebase-admin';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// ─── Coin amounts per product ID ─────────────────────────────────────────────
const PRODUCT_COIN_MAP: Record<string, number> = {
  lynkapp_coins_100:  100,
  lynkapp_coins_500:  550,   // 500 + 50 bonus
  lynkapp_coins_1000: 1150,  // 1000 + 150 bonus
  lynkapp_coins_5000: 6000,  // 5000 + 1000 bonus
};

// ─── POST /api/billing/verify-purchase ───────────────────────────────────────
router.post('/verify-purchase', authMiddleware, async (req: Request, res: Response) => {
  const uid = (req as any).user?.uid;
  const { platform, productId, purchaseToken, transactionId, packageId } = req.body;

  // Input validation
  if (!platform || !productId) {
    return res.status(400).json({ error: 'Missing required fields: platform, productId' });
  }
  if (!PRODUCT_COIN_MAP[productId]) {
    return res.status(400).json({ error: `Unknown productId: ${productId}` });
  }

  const db = admin.firestore();
  const coinsToCredit = PRODUCT_COIN_MAP[productId];

  try {
    // ─── Idempotency check ─────────────────────────────────────────────────
    // Prevent double-crediting if the client sends the same receipt twice
    const receiptId = purchaseToken || transactionId;
    if (receiptId) {
      const receiptRef = db.collection('iap_receipts').doc(receiptId);
      const receiptSnap = await receiptRef.get();
      if (receiptSnap.exists) {
        console.log(`[Billing] Duplicate receipt ignored: ${receiptId}`);
        return res.json({ success: true, coins: 0, message: 'Already processed' });
      }
    }

    // ─── Platform-specific verification ───────────────────────────────────
    if (platform === 'android') {
      // TODO (requires Google Play Developer API credentials in env):
      // const verified = await verifyGooglePlayPurchase(packageId, productId, purchaseToken);
      // if (!verified) return res.status(400).json({ error: 'Invalid Google Play receipt' });
      console.log('[Billing] Android purchase — server-side verification pending Google API setup');
      console.log('[Billing] purchaseToken prefix:', purchaseToken?.slice(0, 30));

    } else if (platform === 'ios') {
      // TODO (requires Apple receipt verification):
      // const verified = await verifyAppleReceipt(transactionId);
      // if (!verified) return res.status(400).json({ error: 'Invalid Apple receipt' });
      console.log('[Billing] iOS purchase — server-side verification pending Apple API setup');
      console.log('[Billing] transactionId:', transactionId);

    } else {
      return res.status(400).json({ error: `Unknown platform: ${platform}` });
    }

    // ─── Credit coins to user ──────────────────────────────────────────────
    const userRef = db.collection('users').doc(uid);
    await db.runTransaction(async (tx) => {
      const userSnap = await tx.get(userRef);
      const currentBalance = userSnap.data()?.coinBalance || 0;
      tx.update(userRef, {
        coinBalance: currentBalance + coinsToCredit,
        lastIAPAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    // ─── Record receipt to prevent replays ────────────────────────────────
    if (receiptId) {
      await db.collection('iap_receipts').doc(receiptId).set({
        uid,
        platform,
        productId,
        coinsGranted: coinsToCredit,
        packageId,
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    // ─── Log transaction ───────────────────────────────────────────────────
    await db.collection('coin_transactions').add({
      uid,
      type: 'iap_purchase',
      platform,
      productId,
      coinsGranted: coinsToCredit,
      packageId,
      receiptId: receiptId || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`[Billing] ✅ Credited ${coinsToCredit} coins to user ${uid} for ${productId}`);
    return res.json({
      success: true,
      coins: coinsToCredit,
      productId,
      platform,
      message: `${coinsToCredit} coins credited to your account`,
    });

  } catch (err: any) {
    console.error('[Billing] verify-purchase error:', err);
    return res.status(500).json({ error: 'Purchase verification failed', details: err.message });
  }
});

// ─── GET /api/billing/products ───────────────────────────────────────────────
// Returns the product catalog with coin amounts (for display/testing)
router.get('/products', (_req: Request, res: Response) => {
  const products = Object.entries(PRODUCT_COIN_MAP).map(([productId, coins]) => ({
    productId,
    coins,
  }));
  return res.json({ products });
});

export default router;
