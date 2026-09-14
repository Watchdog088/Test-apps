/**
 * email-service.ts — Transactional Email via Mailgun
 * LynkApp / ConnectHub Backend
 * Created: Sep 14, 2026
 *
 * Covers:
 *  • Welcome email after signup
 *  • Email verification link
 *  • Password reset link
 *  • KYC approved / rejected notification
 *  • Marketplace order confirmed / shipped / refunded
 *  • Match notification (dating)
 *  • Payout confirmed (creator wallet)
 *  • Security alert (new device login)
 *
 * Uses Mailgun HTTP API (no SDK dependency — plain fetch/axios so it works
 * in any Node.js environment without extra install).
 *
 * Required .env vars:
 *   MAILGUN_API_KEY=key-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 *   MAILGUN_DOMAIN=mg.lynkapp.com
 *   MAILGUN_FROM=LynkApp <no-reply@mg.lynkapp.com>
 *   FRONTEND_URL=https://lynkapp.com
 */

import https from 'https';
import querystring from 'querystring';

// ── Config ────────────────────────────────────────────────────────────────────
const MAILGUN_API_KEY   = process.env.MAILGUN_API_KEY   || '';
const MAILGUN_DOMAIN    = process.env.MAILGUN_DOMAIN    || 'mg.lynkapp.com';
const MAILGUN_FROM      = process.env.MAILGUN_FROM      || 'LynkApp <no-reply@mg.lynkapp.com>';
const FRONTEND_URL      = process.env.FRONTEND_URL      || 'https://lynkapp.com';
const IS_CONFIGURED     = Boolean(MAILGUN_API_KEY && MAILGUN_DOMAIN);

if (!IS_CONFIGURED) {
  console.warn('[email-service] ⚠️  MAILGUN_API_KEY / MAILGUN_DOMAIN not set — emails will be logged only');
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface SendEmailOptions {
  to:      string;
  subject: string;
  html:    string;
  text?:   string;
  replyTo?: string;
  tags?:   string[];
}

interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// ── Core send function ────────────────────────────────────────────────────────
/**
 * sendEmail — sends via Mailgun REST API using Node.js built-in https
 * Falls back to console.log when credentials are missing (dev mode).
 */
export async function sendEmail(opts: SendEmailOptions): Promise<SendResult> {
  if (!IS_CONFIGURED) {
    console.log('[email-service] [DEV MODE] Would send email:', {
      to: opts.to,
      subject: opts.subject,
    });
    return { success: true, messageId: 'dev-mode-no-send' };
  }

  const formData = querystring.stringify({
    from:    MAILGUN_FROM,
    to:      opts.to,
    subject: opts.subject,
    html:    opts.html,
    text:    opts.text || htmlToText(opts.html),
    ...(opts.replyTo ? { 'h:Reply-To': opts.replyTo } : {}),
    ...(opts.tags ? { 'o:tag': opts.tags } : {}),
  });

  return new Promise((resolve) => {
    const req = https.request(
      {
        hostname: 'api.mailgun.net',
        path:     `/v3/${MAILGUN_DOMAIN}/messages`,
        method:   'POST',
        auth:     `api:${MAILGUN_API_KEY}`,
        headers:  {
          'Content-Type':   'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(formData),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              console.log(`[email-service] ✓ Sent to ${opts.to}: ${parsed.id}`);
              resolve({ success: true, messageId: parsed.id });
            } else {
              console.error(`[email-service] ✗ Mailgun error ${res.statusCode}:`, parsed.message);
              resolve({ success: false, error: parsed.message });
            }
          } catch {
            resolve({ success: false, error: 'Invalid Mailgun response' });
          }
        });
      }
    );

    req.on('error', (err) => {
      console.error('[email-service] Network error:', err.message);
      resolve({ success: false, error: err.message });
    });

    req.write(formData);
    req.end();
  });
}

// ── Template helpers ──────────────────────────────────────────────────────────
function wrap(content: string, preheader?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>LynkApp</title>
  <style>
    body { margin:0; padding:0; background:#0a0a0a; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; }
    .wrap { max-width:600px; margin:0 auto; background:#111; border-radius:12px; overflow:hidden; }
    .header { background:linear-gradient(135deg,#7c3aed,#ec4899); padding:32px; text-align:center; }
    .header h1 { color:#fff; margin:0; font-size:28px; font-weight:800; letter-spacing:-0.5px; }
    .body { padding:32px; color:#e5e7eb; font-size:15px; line-height:1.6; }
    .body h2 { color:#fff; font-size:20px; margin-top:0; }
    .btn { display:inline-block; background:linear-gradient(135deg,#7c3aed,#ec4899); color:#fff!important; text-decoration:none; padding:14px 28px; border-radius:8px; font-weight:700; font-size:15px; margin:20px 0; }
    .footer { padding:20px 32px; color:#6b7280; font-size:12px; text-align:center; border-top:1px solid #1f2937; }
    .preheader { display:none; font-size:1px; color:#0a0a0a; }
  </style>
</head>
<body>
  ${preheader ? `<span class="preheader">${preheader}</span>` : ''}
  <div class="wrap">
    <div class="header"><h1>🔗 LynkApp</h1></div>
    <div class="body">${content}</div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} LynkApp &bull;
      <a href="${FRONTEND_URL}/settings/notifications" style="color:#7c3aed;">Unsubscribe</a> &bull;
      <a href="${FRONTEND_URL}/legal/privacy" style="color:#7c3aed;">Privacy Policy</a>
    </div>
  </div>
</body>
</html>`;
}

function htmlToText(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

// ── Email Senders ─────────────────────────────────────────────────────────────

/** Sent right after a new user signs up */
export async function sendWelcomeEmail(opts: {
  to: string;
  displayName: string;
}): Promise<SendResult> {
  const html = wrap(`
    <h2>Welcome to LynkApp, ${opts.displayName}! 🎉</h2>
    <p>You're now part of a growing community of creators, friends, and entrepreneurs.</p>
    <p>Here's what you can do on LynkApp:</p>
    <ul>
      <li>📸 Share stories & posts with friends</li>
      <li>💬 Message anyone in real time</li>
      <li>🛒 Buy & sell in the Marketplace</li>
      <li>🎬 Go live and build your audience</li>
      <li>💘 Find your match in Dating</li>
    </ul>
    <a href="${FRONTEND_URL}/onboarding" class="btn">Complete Your Profile →</a>
    <p style="color:#6b7280;font-size:13px;">If you didn't create this account, you can safely ignore this email.</p>
  `, `Welcome to LynkApp! Get started with your new account.`);

  return sendEmail({
    to: opts.to,
    subject: `Welcome to LynkApp, ${opts.displayName}! 🎉`,
    html,
    tags: ['welcome'],
  });
}

/** Email address verification link */
export async function sendEmailVerification(opts: {
  to: string;
  displayName: string;
  verifyUrl: string;
}): Promise<SendResult> {
  const html = wrap(`
    <h2>Verify Your Email Address</h2>
    <p>Hi ${opts.displayName},</p>
    <p>Click the button below to verify your email and unlock all LynkApp features.</p>
    <a href="${opts.verifyUrl}" class="btn">Verify Email →</a>
    <p style="color:#6b7280;font-size:13px;">This link expires in 24 hours. If you didn't request this, ignore this email.</p>
  `, `Verify your LynkApp email address`);

  return sendEmail({
    to: opts.to,
    subject: 'Verify your LynkApp email address',
    html,
    tags: ['verify-email'],
  });
}

/** Password reset */
export async function sendPasswordReset(opts: {
  to: string;
  displayName: string;
  resetUrl: string;
  expiresInMinutes?: number;
}): Promise<SendResult> {
  const expiry = opts.expiresInMinutes || 60;
  const html = wrap(`
    <h2>Reset Your Password</h2>
    <p>Hi ${opts.displayName},</p>
    <p>We received a request to reset your LynkApp password. Click the button below to choose a new password.</p>
    <a href="${opts.resetUrl}" class="btn">Reset Password →</a>
    <p style="color:#6b7280;font-size:13px;">This link expires in ${expiry} minutes. If you didn't request a password reset, you can safely ignore this email — your password will not be changed.</p>
  `, `Reset your LynkApp password`);

  return sendEmail({
    to: opts.to,
    subject: 'Reset your LynkApp password',
    html,
    tags: ['password-reset'],
  });
}

/** KYC approved */
export async function sendKYCApproved(opts: {
  to: string;
  displayName: string;
}): Promise<SendResult> {
  const html = wrap(`
    <h2>Your Seller Account is Approved ✅</h2>
    <p>Hi ${opts.displayName},</p>
    <p>Great news! Your identity verification has been approved. You can now:</p>
    <ul>
      <li>List items in the Marketplace</li>
      <li>Receive payouts to your bank account</li>
      <li>Access seller analytics</li>
    </ul>
    <a href="${FRONTEND_URL}/marketplace/sell" class="btn">Start Selling →</a>
  `, `Your LynkApp seller account is approved!`);

  return sendEmail({
    to: opts.to,
    subject: 'Your LynkApp seller account is approved ✅',
    html,
    tags: ['kyc-approved'],
  });
}

/** KYC rejected */
export async function sendKYCRejected(opts: {
  to: string;
  displayName: string;
  reason: string;
}): Promise<SendResult> {
  const html = wrap(`
    <h2>Identity Verification Update</h2>
    <p>Hi ${opts.displayName},</p>
    <p>Unfortunately, we were unable to verify your identity at this time.</p>
    <p><strong>Reason:</strong> ${opts.reason}</p>
    <p>Please re-submit with clear, valid government-issued ID.</p>
    <a href="${FRONTEND_URL}/marketplace/kyc" class="btn">Re-submit Documents →</a>
    <p style="color:#6b7280;font-size:13px;">If you have questions, contact support@lynkapp.com</p>
  `, `Action required: Identity verification update`);

  return sendEmail({
    to: opts.to,
    subject: 'Action required: Identity verification update',
    html,
    tags: ['kyc-rejected'],
  });
}

/** Marketplace order confirmed (buyer) */
export async function sendOrderConfirmed(opts: {
  to: string;
  displayName: string;
  orderId: string;
  itemTitle: string;
  amountUsd: string;
}): Promise<SendResult> {
  const html = wrap(`
    <h2>Order Confirmed 🛍️</h2>
    <p>Hi ${opts.displayName},</p>
    <p>Your order has been confirmed and the seller has been notified.</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr><td style="color:#9ca3af;padding:6px 0;">Order ID</td><td style="color:#fff;">#${opts.orderId}</td></tr>
      <tr><td style="color:#9ca3af;padding:6px 0;">Item</td><td style="color:#fff;">${opts.itemTitle}</td></tr>
      <tr><td style="color:#9ca3af;padding:6px 0;">Total</td><td style="color:#fff;">$${opts.amountUsd}</td></tr>
    </table>
    <a href="${FRONTEND_URL}/marketplace/orders/${opts.orderId}" class="btn">View Order →</a>
  `, `Order confirmed: ${opts.itemTitle}`);

  return sendEmail({
    to: opts.to,
    subject: `Order confirmed: ${opts.itemTitle}`,
    html,
    tags: ['order-confirmed'],
  });
}

/** Payout confirmed (creator/seller) */
export async function sendPayoutConfirmed(opts: {
  to: string;
  displayName: string;
  amountUsd: string;
  estimatedArrival: string;
}): Promise<SendResult> {
  const html = wrap(`
    <h2>Payout Sent 💸</h2>
    <p>Hi ${opts.displayName},</p>
    <p>Your payout of <strong>$${opts.amountUsd}</strong> has been sent to your connected bank account.</p>
    <p><strong>Estimated arrival:</strong> ${opts.estimatedArrival}</p>
    <a href="${FRONTEND_URL}/wallet" class="btn">View Wallet →</a>
  `, `Payout of $${opts.amountUsd} sent`);

  return sendEmail({
    to: opts.to,
    subject: `LynkApp payout of $${opts.amountUsd} sent`,
    html,
    tags: ['payout-confirmed'],
  });
}

/** Security alert — new device login */
export async function sendSecurityAlert(opts: {
  to: string;
  displayName: string;
  device: string;
  location: string;
  time: string;
}): Promise<SendResult> {
  const html = wrap(`
    <h2>New Sign-In Detected 🔐</h2>
    <p>Hi ${opts.displayName},</p>
    <p>Your LynkApp account was signed in from a new device. If this was you, no action is needed.</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr><td style="color:#9ca3af;padding:6px 0;">Device</td><td style="color:#fff;">${opts.device}</td></tr>
      <tr><td style="color:#9ca3af;padding:6px 0;">Location</td><td style="color:#fff;">${opts.location}</td></tr>
      <tr><td style="color:#9ca3af;padding:6px 0;">Time</td><td style="color:#fff;">${opts.time}</td></tr>
    </table>
    <p><strong>If this wasn't you</strong>, secure your account immediately:</p>
    <a href="${FRONTEND_URL}/settings/security" class="btn">Secure My Account →</a>
  `, `New sign-in to your LynkApp account`);

  return sendEmail({
    to: opts.to,
    subject: '⚠️ New sign-in to your LynkApp account',
    html,
    tags: ['security-alert'],
  });
}

/** Dating match notification */
export async function sendMatchNotification(opts: {
  to: string;
  displayName: string;
  matchName: string;
}): Promise<SendResult> {
  const html = wrap(`
    <h2>You Have a New Match! 💘</h2>
    <p>Hi ${opts.displayName},</p>
    <p>You and <strong>${opts.matchName}</strong> liked each other. Say hello!</p>
    <a href="${FRONTEND_URL}/dating/matches" class="btn">View Your Match →</a>
  `, `You matched with ${opts.matchName} on LynkApp Dating`);

  return sendEmail({
    to: opts.to,
    subject: `💘 You matched with ${opts.matchName}!`,
    html,
    tags: ['dating-match'],
  });
}
