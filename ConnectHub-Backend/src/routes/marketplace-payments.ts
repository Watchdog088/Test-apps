/**
 * marketplace-payments.ts
 * ConnectHub Backend — Stripe PaymentIntent proxy + Webhook handler
 * Route: POST /v1/marketplace/payments/intent
 *
 * FIXES (May 2026):
 * ✅ FIX-WEBHOOK-01: Webhook handler is now async — was sync, causing 'await not allowed' TS errors
 * ✅ FIX-WEBHOOK-02: payment_intent.succeeded/failed/canceled + charge.refunded all update Firestore orders
 * ✅ FIX-WEBHOOK-03: firebase-admin Firestore integration added for real order status updates
 * ✅ FIX-TS-01: Stripe types widened to `any` for event payloads to avoid SDK version mismatch
 */

import { Router, Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import * as admin from 'firebase-admin';

// ─── Firebase Admin — lazy init so server boots without creds configured ──────
function getFirestore(): admin.firestore.Firestore | null {
  try {
    if (!admin.apps.length) {
      admin.initializeApp({ credential: admin.credential.applicationDefault() });
    }
    return admin.firestore();
  } catch {
    return null;
  }
}

/**
 * updateOrderStatusByPaymentIntent
 * FIX-WEBHOOK-01/02: Replaces the TODO comment that was in the original webhook handler.
 * Looks up the order in the top-level `marketplace_orders` collection by stripePaymentId
 * and batch-updates its status field.
 */
async function updateOrderStatusByPaymentIntent(
  paymentIntentId: string,
  status: string,
  extra: Record<string, unknown> = {}
): Promise<void> {
  const db = getFirestore();
  if (!db) {
    console.warn('[Webhook] Firestore not configured — skipping order status update');
    return;
  }
  try {
    const snap = await db
      .collection('marketplace_orders')
      .where('stripePaymentId', '==', paymentIntentId)
      .limit(5)
      .get();

    if (snap.empty) {
      console.warn(`[Webhook] No order found for paymentIntentId: ${paymentIntentId}`);
      return;
    }

    const batch = db.batch();
    snap.docs.forEach(docSnap => {
      batch.update(docSnap.ref, {
        status,
        ...extra,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });
    await batch.commit();
    console.log(`[Webhook] Updated ${snap.size} order(s) → status: ${status}`);
  } catch (err) {
    console.error('[Webhook] Firestore order update failed:', err);
  }
}

const router = Router();

// ─── Stripe client — lazy init ────────────────────────────────────────────────
// FIX-TS-02: Return type uses InstanceType to avoid "Cannot use namespace as type" error
function getStripe(): InstanceType<typeof Stripe> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set in environment');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new Stripe(key, { apiVersion: '2024-04-10' as any });
}

// ─── POST /intent ─────────────────────────────────────────────────────────────
router.post('/intent', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { amountCents, currency = 'usd', paymentMethodType = 'card', metadata = {} } = req.body;

    if (!amountCents || typeof amountCents !== 'number' || amountCents < 50) {
      return res.status(400).json({ error: 'amountCents must be a number >= 50' });
    }
    if (!['usd', 'eur', 'gbp', 'cad', 'aud'].includes(currency)) {
      return res.status(400).json({ error: 'Unsupported currency' });
    }

    const stripe = getStripe();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (req as any).user?.uid || 'anonymous';

    const intent = await stripe.paymentIntents.create({
      amount: Math.round(amountCents),
      currency,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      payment_method_types: [paymentMethodType] as any,
      metadata: { ...metadata, userId, platform: 'connecthub_marketplace', created_at: new Date().toISOString() },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      automatic_payment_methods: paymentMethodType === 'card' ? ({ enabled: true, allow_redirects: 'never' } as any) : undefined,
    });

    return res.json({ id: intent.id, client_secret: intent.client_secret, amount: intent.amount, currency: intent.currency, status: intent.status });
  } catch (err: unknown) {
    const e = err as { type?: string; message?: string; code?: string };
    if (e.type?.startsWith('Stripe')) return res.status(402).json({ error: e.message, code: e.code });
    next(err);
  }
});

// ─── POST /confirm ────────────────────────────────────────────────────────────
router.post('/confirm', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { paymentIntentId, paymentMethodId } = req.body;
    if (!paymentIntentId || !paymentMethodId) {
      return res.status(400).json({ error: 'paymentIntentId and paymentMethodId are required' });
    }
    const stripe = getStripe();
    const intent = await stripe.paymentIntents.confirm(paymentIntentId, { payment_method: paymentMethodId });
    return res.json({ status: intent.status, id: intent.id });
  } catch (err: unknown) {
    const e = err as { type?: string; message?: string; code?: string };
    if (e.type?.startsWith('Stripe')) return res.status(402).json({ error: e.message, code: e.code });
    next(err);
  }
});

// ─── GET /intent/:id ──────────────────────────────────────────────────────────
router.get('/intent/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stripe = getStripe();
    const intent = await stripe.paymentIntents.retrieve(req.params.id);
    return res.json({ id: intent.id, status: intent.status, amount: intent.amount });
  } catch (err: unknown) {
    next(err);
  }
});

// ─── POST /refund ─────────────────────────────────────────────────────────────
router.post('/refund', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { paymentIntentId, amountCents, reason = 'requested_by_customer' } = req.body;
    if (!paymentIntentId) return res.status(400).json({ error: 'paymentIntentId required' });
    const stripe = getStripe();
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amountCents ? Math.round(amountCents) : undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      reason: reason as any,
    });
    return res.json({ id: refund.id, status: refund.status, amount: refund.amount });
  } catch (err: unknown) {
    const e = err as { type?: string; message?: string; code?: string };
    if (e.type?.startsWith('Stripe')) return res.status(402).json({ error: e.message, code: e.code });
    next(err);
  }
});

// ─── POST /webhook ────────────────────────────────────────────────────────────
// FIX-WEBHOOK-TS-01: Made async so Firestore awaits work correctly inside the handler.
// FIX-WEBHOOK-TS-02: Event payload typed as `any` to avoid Stripe SDK version drift.
router.post('/webhook', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn('[Stripe] No webhook secret — skipping signature verification');
    return res.sendStatus(200);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let event: any;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: unknown) {
    const e = err as { message?: string };
    return res.status(400).send(`Webhook Error: ${e.message}`);
  }

  // Handle Stripe events — all cases now update Firestore order status
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object;
      console.log(`[Stripe] PaymentIntent succeeded: ${pi.id} $${pi.amount / 100}`);
      await updateOrderStatusByPaymentIntent(pi.id, 'Confirmed', {
        paidAt: new Date().toISOString(),
        paidAmountCents: pi.amount,
        paymentCurrency: pi.currency,
      });
      break;
    }
    case 'payment_intent.payment_failed': {
      const pi = event.data.object;
      console.error(`[Stripe] PaymentIntent failed: ${pi.id}`);
      await updateOrderStatusByPaymentIntent(pi.id, 'Payment Failed', {
        failureMessage: pi.last_payment_error?.message || 'Unknown error',
      });
      break;
    }
    case 'payment_intent.canceled': {
      const pi = event.data.object;
      console.log(`[Stripe] PaymentIntent cancelled: ${pi.id}`);
      await updateOrderStatusByPaymentIntent(pi.id, 'Cancelled');
      break;
    }
    case 'charge.refunded': {
      const charge = event.data.object;
      console.log(`[Stripe] Charge refunded: ${charge.id}`);
      if (charge.payment_intent) {
        await updateOrderStatusByPaymentIntent(charge.payment_intent as string, 'Refunded', {
          refundedAt: new Date().toISOString(),
          refundedAmountCents: charge.amount_refunded,
        });
      }
      break;
    }
    default:
      console.log(`[Stripe] Unhandled event type: ${event.type}`);
  }

  res.sendStatus(200);
});

export default router;
