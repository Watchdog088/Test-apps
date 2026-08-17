/**
 * wallet.ts — Sprint 2: Wallet routes
 * Coin purchases, Stripe Connect onboarding, balance queries, transactions.
 * Registered in server.ts as /api/v1/wallet
 */

import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  isStripeConfigured,
  COIN_PACKAGES,
  createCoinPaymentIntent,
  createConnectAccount,
  createConnectOnboardingLink,
  getConnectBalance,
  verifyStripeWebhook,
} from '../services/stripe-connect-service';

const router = Router();

// ── GET /api/v1/wallet/status ─────────────────────────────────────
router.get('/status', (_req: Request, res: Response) => {
  res.json({
    stripeConfigured: isStripeConfigured(),
    testMode: (process.env.STRIPE_SECRET_KEY || '').startsWith('sk_test_'),
  });
});

// ── GET /api/v1/wallet/coin-packages ─────────────────────────────
router.get('/coin-packages', (_req: Request, res: Response) => {
  res.json({ packages: COIN_PACKAGES });
});

// ── POST /api/v1/wallet/buy-coins ─────────────────────────────────
// Creates a Stripe PaymentIntent for the selected coin package.
router.post('/buy-coins', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!isStripeConfigured()) {
      return res.status(503).json({ error: 'Stripe not configured' });
    }
    const { packageId } = req.body;
    const userId = (req as any).user?.uid;
    if (!packageId) return res.status(400).json({ error: 'packageId required' });

    const result = await createCoinPaymentIntent(packageId, userId);
    return res.json(result);
  } catch (err: any) {
    console.error('[wallet/buy-coins]', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// ── POST /api/v1/wallet/connect/create ───────────────────────────
// Creates a Stripe Connect account for a creator wanting payouts.
router.post('/connect/create', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!isStripeConfigured()) {
      return res.status(503).json({ error: 'Stripe not configured' });
    }
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'email required' });

    const accountId = await createConnectAccount(email);
    return res.json({ stripeAccountId: accountId });
  } catch (err: any) {
    console.error('[wallet/connect/create]', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// ── POST /api/v1/wallet/connect/onboarding-link ─────────────────
router.post('/connect/onboarding-link', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { stripeAccountId, returnUrl, refreshUrl } = req.body;
    if (!stripeAccountId) return res.status(400).json({ error: 'stripeAccountId required' });

    const url = await createConnectOnboardingLink(
      stripeAccountId,
      returnUrl || `${process.env.FRONTEND_URL}/wallet/connect/return`,
      refreshUrl || `${process.env.FRONTEND_URL}/wallet`,
    );
    return res.json({ url });
  } catch (err: any) {
    console.error('[wallet/connect/onboarding-link]', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// ── GET /api/v1/wallet/connect/balance/:accountId ────────────────
router.get('/connect/balance/:accountId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;
    const balance = await getConnectBalance(accountId);
    return res.json(balance);
  } catch (err: any) {
    console.error('[wallet/connect/balance]', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// ── POST /api/v1/wallet/webhook/stripe ───────────────────────────
// Stripe sends webhook events here (payment_intent.succeeded, etc.)
// Must be publicly accessible — no authMiddleware.
router.post('/webhook/stripe', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['stripe-signature'] as string;
    if (!signature) return res.status(400).json({ error: 'Missing stripe-signature header' });

    const event = verifyStripeWebhook(req.body as Buffer, signature);
    console.log(`[stripe-webhook] Event: ${event.type}`);

    if (event.type === 'payment_intent.succeeded') {
      const pi    = event.data.object;
      const uid   = pi.metadata?.userId;
      const coins = parseInt(pi.metadata?.coins || '0', 10);
      const bonus = parseInt(pi.metadata?.bonus  || '0', 10);
      console.log(`[stripe-webhook] Coin credit: ${coins + bonus} coins → ${uid}`);
      // Note: actual Firestore credit happens via the Cloud Function in functions/index.js
    }

    return res.json({ received: true });
  } catch (err: any) {
    console.error('[wallet/webhook/stripe]', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }
});

export default router;
