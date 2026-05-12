/**
 * marketplace-payments.ts
 * ConnectHub Backend — Stripe PaymentIntent proxy
 * Route: POST /v1/marketplace/payments/intent
 *
 * Keeps Stripe secret key on the server; frontend only receives client_secret.
 */

import { Router, Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';

const router = Router();

// ─── Stripe client (lazy-init so server boots even without key) ──────────────
function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set in environment');
  return new Stripe(key, { apiVersion: '2024-04-10' });
}

// ─── POST /v1/marketplace/payments/intent ────────────────────────────────────
router.post('/intent', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { amountCents, currency = 'usd', paymentMethodType = 'card', metadata = {} } = req.body;

    // Input validation
    if (!amountCents || typeof amountCents !== 'number' || amountCents < 50) {
      return res.status(400).json({ error: 'amountCents must be a number ≥ 50 (minimum $0.50)' });
    }
    if (!['usd', 'eur', 'gbp', 'cad', 'aud'].includes(currency)) {
      return res.status(400).json({ error: 'Unsupported currency' });
    }

    const stripe = getStripe();

    // Attach authenticated user ID to metadata for audit trail
    const userId = (req as any).user?.uid || 'anonymous';

    const intent = await stripe.paymentIntents.create({
      amount: Math.round(amountCents),
      currency,
      payment_method_types: [paymentMethodType],
      metadata: {
        ...metadata,
        userId,
        platform: 'connecthub_marketplace',
        created_at: new Date().toISOString(),
      },
      // Automatic payment methods for future-proofing
      automatic_payment_methods: paymentMethodType === 'card'
        ? { enabled: true, allow_redirects: 'never' }
        : undefined,
    });

    return res.json({
      id: intent.id,
      client_secret: intent.client_secret,
      amount: intent.amount,
      currency: intent.currency,
      status: intent.status,
    });
  } catch (err: any) {
    if (err.type?.startsWith('Stripe')) {
      return res.status(402).json({ error: err.message, code: err.code });
    }
    next(err);
  }
});

// ─── POST /v1/marketplace/payments/confirm ───────────────────────────────────
// Server-side confirmation (optional — frontend can also confirm via Stripe.js)
router.post('/confirm', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { paymentIntentId, paymentMethodId } = req.body;
    if (!paymentIntentId || !paymentMethodId) {
      return res.status(400).json({ error: 'paymentIntentId and paymentMethodId are required' });
    }
    const stripe = getStripe();
    const intent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
    });
    return res.json({ status: intent.status, id: intent.id });
  } catch (err: any) {
    if (err.type?.startsWith('Stripe')) {
      return res.status(402).json({ error: err.message, code: err.code });
    }
    next(err);
  }
});

// ─── GET /v1/marketplace/payments/intent/:id ─────────────────────────────────
router.get('/intent/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stripe = getStripe();
    const intent = await stripe.paymentIntents.retrieve(req.params.id);
    return res.json({ id: intent.id, status: intent.status, amount: intent.amount });
  } catch (err: any) {
    next(err);
  }
});

// ─── POST /v1/marketplace/payments/refund ────────────────────────────────────
router.post('/refund', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { paymentIntentId, amountCents, reason = 'requested_by_customer' } = req.body;
    if (!paymentIntentId) return res.status(400).json({ error: 'paymentIntentId required' });
    const stripe = getStripe();
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amountCents ? Math.round(amountCents) : undefined,
      reason: reason as Stripe.RefundCreateParams.Reason,
    });
    return res.json({ id: refund.id, status: refund.status, amount: refund.amount });
  } catch (err: any) {
    if (err.type?.startsWith('Stripe')) {
      return res.status(402).json({ error: err.message, code: err.code });
    }
    next(err);
  }
});

// ─── POST /v1/marketplace/payments/webhook ───────────────────────────────────
// Stripe sends events here; register this URL in Stripe Dashboard
router.post('/webhook', (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn('[Stripe] No webhook secret — skipping signature verification');
    return res.sendStatus(200);
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle events
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object as Stripe.PaymentIntent;
      console.log(`[Stripe] PaymentIntent succeeded: ${pi.id} $${pi.amount / 100}`);
      // TODO: update order status in Firestore to 'Confirmed' here
      break;
    }
    case 'payment_intent.payment_failed': {
      const pi = event.data.object as Stripe.PaymentIntent;
      console.error(`[Stripe] PaymentIntent failed: ${pi.id}`);
      break;
    }
    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge;
      console.log(`[Stripe] Charge refunded: ${charge.id}`);
      break;
    }
    default:
      console.log(`[Stripe] Unhandled event type: ${event.type}`);
  }

  res.sendStatus(200);
});

export default router;
