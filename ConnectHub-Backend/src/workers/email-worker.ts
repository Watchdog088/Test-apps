/**
 * email-worker.ts — BullMQ worker that processes the "email" queue
 * LynkApp / ConnectHub Backend
 * Created: Sep 14, 2026
 *
 * Job payload (from enqueueEmail):
 *   { to: string, template: string, vars: Record<string, any> }
 *
 * Supported templates:
 *   welcome | verify-email | password-reset | kyc-approved | kyc-rejected
 *   order-confirmed | payout-confirmed | security-alert | dating-match
 */

import {
  sendWelcomeEmail,
  sendEmailVerification,
  sendPasswordReset,
  sendKYCApproved,
  sendKYCRejected,
  sendOrderConfirmed,
  sendPayoutConfirmed,
  sendSecurityAlert,
  sendMatchNotification,
} from '../services/email-service';

let Worker: any;
let started = false;

try {
  Worker = require('bullmq').Worker;
} catch {
  console.warn('[email-worker] BullMQ not installed — email worker will not start');
}

export function startEmailWorker(): void {
  if (started || !Worker) return;
  started = true;

  const redisOpts = {
    connection: {
      host:     process.env.REDIS_HOST     || '127.0.0.1',
      port:     parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      tls:      process.env.REDIS_TLS === 'true' ? {} : undefined,
    },
  };

  const worker = new Worker(
    'email',
    async (job: any) => {
      const { template, vars } = job.data as { to: string; template: string; vars: Record<string, any> };
      const to = job.data.to as string;

      console.log(`[email-worker] Processing job ${job.id} — template: ${template} → ${to}`);

      switch (template) {
        case 'welcome':
          await sendWelcomeEmail({ to, displayName: vars.displayName });
          break;
        case 'verify-email':
          await sendEmailVerification({ to, displayName: vars.displayName, verifyUrl: vars.verifyUrl });
          break;
        case 'password-reset':
          await sendPasswordReset({ to, displayName: vars.displayName, resetUrl: vars.resetUrl, expiresInMinutes: vars.expiresInMinutes });
          break;
        case 'kyc-approved':
          await sendKYCApproved({ to, displayName: vars.displayName });
          break;
        case 'kyc-rejected':
          await sendKYCRejected({ to, displayName: vars.displayName, reason: vars.reason });
          break;
        case 'order-confirmed':
          await sendOrderConfirmed({ to, displayName: vars.displayName, orderId: vars.orderId, itemTitle: vars.itemTitle, amountUsd: vars.amountUsd });
          break;
        case 'payout-confirmed':
          await sendPayoutConfirmed({ to, displayName: vars.displayName, amountUsd: vars.amountUsd, estimatedArrival: vars.estimatedArrival });
          break;
        case 'security-alert':
          await sendSecurityAlert({ to, displayName: vars.displayName, device: vars.device, location: vars.location, time: vars.time });
          break;
        case 'dating-match':
          await sendMatchNotification({ to, displayName: vars.displayName, matchName: vars.matchName });
          break;
        default:
          console.warn(`[email-worker] Unknown template: ${template} — skipping`);
      }
    },
    { ...redisOpts, concurrency: 5 }
  );

  worker.on('completed', (job: any) => {
    console.log(`[email-worker] ✓ Job ${job.id} completed`);
  });

  worker.on('failed', (job: any, err: Error) => {
    console.error(`[email-worker] ✗ Job ${job?.id} failed:`, err.message);
  });

  console.log('[email-worker] ✓ Started — listening on "email" queue');
}
