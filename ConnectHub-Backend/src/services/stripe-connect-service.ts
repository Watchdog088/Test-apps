/**
 * stripe-connect-service.ts — Sprint 2: Stripe Connect + coin purchase service
 * Handles Stripe Connect onboarding for creators, coin purchases for viewers.
 * Uses TEST mode keys — switch to live keys only in production .env
 */

// ── Stripe credentials from .env ──────────────────────────────────
const STRIPE_SECRET_KEY    = process.env.STRIPE_SECRET_KEY    || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

// ── Coin package definitions ───────────────────────────────────────
export const COIN_PACKAGES = [
  { id: 'coins_100',  coins: 100,  bonus: 0,   priceUsd: 0.99,  label: '100 Coins'  },
  { id: 'coins_500',  coins: 500,  bonus: 50,  priceUsd: 4.99,  label: '500 + 50 Bonus' },
  { id: 'coins_1000', coins: 1000, bonus: 150, priceUsd: 9.99,  label: '1,000 + 150 Bonus' },
  { id: 'coins_5000', coins: 5000, bonus: 1000, priceUsd: 44.99, label: '5,000 + 1,000 Bonus' },
];

// ── Lazy Stripe init (avoids crash if Stripe not installed yet) ────
function getStripe() {
  if (!STRIPE_SECRET_KEY) {
    throw new Error('Stripe not configured. Set STRIPE_SECRET_KEY in backend .env');
  }
  try {
    const Stripe = require('stripe');
    return new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });
  } catch {
    throw new Error('stripe package not installed. Run: npm install stripe');
  }
}

// ── Check if Stripe is configured ─────────────────────────────────
export function isStripeConfigured(): boolean {
  return Boolean(STRIPE_SECRET_KEY);
}

// ── Create a Stripe Connect account for a creator ─────────────────
export async function createConnectAccount(email: string): Promise<string> {
  const stripe = getStripe();
  const account = await stripe.accounts.create({
    type: 'express',
    email,
    capabilities: { transfers: { requested: true } },
    business_type: 'individual',
  });
  return account.id;
}

// ── Generate an onboarding link for a Connect account ─────────────
export async function createConnectOnboardingLink(
  accountId: string,
  returnUrl: string,
  refreshUrl: string,
): Promise<string> {
  const stripe = getStripe();
  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: 'account_onboarding',
  });
  return link.url;
}

// ── Create a PaymentIntent for coin purchase ───────────────────────
export async function createCoinPaymentIntent(
  packageId: string,
  userId: string,
): Promise<{ clientSecret: string; paymentIntentId: string }> {
  const stripe = getStripe();
  const pkg = COIN_PACKAGES.find(p => p.id === packageId);
  if (!pkg) throw new Error(`Unknown coin package: ${packageId}`);

  const amount = Math.round(pkg.priceUsd * 100); // cents

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    automatic_payment_methods: { enabled: true },
    metadata: {
      userId,
      packageId,
      coins: String(pkg.coins),
      bonus: String(pkg.bonus),
    },
    description: `${pkg.label} for user ${userId}`,
  });

  return {
    clientSecret: paymentIntent.client_secret!,
    paymentIntentId: paymentIntent.id,
  };
}

// ── Get Connect account balance ────────────────────────────────────
export async function getConnectBalance(accountId: string): Promise<{
  available: number;
  pending: number;
  currency: string;
}> {
  const stripe = getStripe();
  const balance = await stripe.balance.retrieve({ stripeAccount: accountId });
  const available = balance.available.reduce((sum: number, b: any) => sum + b.amount, 0) / 100;
  const pending   = balance.pending.reduce((sum: number, b: any) => sum + b.amount, 0) / 100;
  const currency  = balance.available[0]?.currency || 'usd';
  return { available, pending, currency };
}

// ── Verify Stripe webhook signature ───────────────────────────────
export function verifyStripeWebhook(rawBody: Buffer, signature: string): any {
  const stripe = getStripe();
  return stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET);
}

// ── Initiate a payout to a creator ────────────────────────────────
export async function createPayout(
  accountId: string,
  amountUsd: number,
  currency: string = 'usd',
): Promise<string> {
  const stripe = getStripe();
  const payout = await stripe.payouts.create(
    { amount: Math.round(amountUsd * 100), currency },
    { stripeAccount: accountId },
  );
  return payout.id;
}
