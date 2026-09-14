/**
 * bullmq-queue.ts — Async background job queue
 *
 * Queues used:
 *  • email          — transactional emails (welcome, match, report confirm)
 *  • push           — OneSignal push notifications
 *  • moderation     — run OpenAI moderation on new posts / messages
 *  • payouts        — weekly creator payout processing
 *  • story-cleanup  — delete expired stories (runs every hour)
 *
 * Usage:
 *   import { emailQueue, pushQueue, moderationQueue } from './bullmq-queue';
 *   await emailQueue.add('welcome', { userId, email });
 *
 * Worker processes are started separately (src/workers/).
 * In development without Redis the module logs a warning and exports stubs
 * so the rest of the server doesn't crash.
 */

let Queue: any;
let Worker: any;
let QueueScheduler: any;

try {
  // BullMQ requires the `bullmq` package + a Redis connection
  const bullmq = require('bullmq');
  Queue          = bullmq.Queue;
  Worker         = bullmq.Worker;
  QueueScheduler = bullmq.QueueScheduler;
} catch {
  console.warn('[bullmq] BullMQ not installed — install with: npm i bullmq');
}

// ── Redis connection options ──────────────────────────────────────
const redisOpts = {
  connection: {
    host:     process.env.REDIS_HOST     || '127.0.0.1',
    port:     parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    tls:      process.env.REDIS_TLS === 'true' ? {} : undefined,
  },
};

// ── Stub factory (used when BullMQ is unavailable) ────────────────
const stub = {
  add:   async (..._args: any[]) => { console.warn('[bullmq-stub] Queue not available'); return null; },
  close: async ()                 => {},
  on:    (..._args: any[])        => {},
};

function makeQueue(name: string): any {
  if (!Queue) return stub;
  try {
    const q = new Queue(name, redisOpts);
    q.on('error', (err: Error) => console.error(`[bullmq:${name}]`, err.message));
    return q;
  } catch (err: any) {
    console.warn(`[bullmq] Could not create queue "${name}":`, err.message);
    return stub;
  }
}

// ── Queues ────────────────────────────────────────────────────────
export const emailQueue      = makeQueue('email');
export const pushQueue       = makeQueue('push');
export const moderationQueue = makeQueue('moderation');
export const payoutsQueue    = makeQueue('payouts');
export const storyCleanup    = makeQueue('story-cleanup');

// ── Helper: enqueue a push notification ──────────────────────────
export async function enqueuePush(data: {
  userId:   string;
  title:    string;
  body:     string;
  data?:    Record<string, any>;
}): Promise<void> {
  await pushQueue.add('send-push', data, {
    attempts:  3,
    backoff:   { type: 'exponential', delay: 2000 },
    removeOnComplete: 100,
    removeOnFail:      50,
  });
}

// ── Helper: enqueue a transactional email ────────────────────────
export async function enqueueEmail(data: {
  to:       string;
  template: string;
  vars:     Record<string, any>;
}): Promise<void> {
  await emailQueue.add('send-email', data, {
    attempts: 3,
    backoff:  { type: 'exponential', delay: 3000 },
    removeOnComplete: 200,
    removeOnFail:     100,
  });
}

// ── Helper: enqueue content moderation ──────────────────────────
export async function enqueueModeration(data: {
  type:    'post' | 'message' | 'comment';
  id:      string;
  content: string;
  userId:  string;
}): Promise<void> {
  await moderationQueue.add('moderate', data, {
    attempts: 2,
    removeOnComplete: 500,
    removeOnFail:     200,
  });
}

// ── Repeat jobs: schedule them once at server startup ────────────
export function scheduleRepeatJobs(): void {
  if (!Queue || payoutsQueue === stub) {
    console.warn('[bullmq] Skipping repeat jobs — Redis not available');
    return;
  }

  // Creator payouts — every Sunday at midnight UTC
  payoutsQueue.add(
    'weekly-payouts',
    {},
    {
      repeat:          { cron: '0 0 * * 0' },
      removeOnComplete: 5,
      removeOnFail:     5,
    },
  ).catch(() => {});

  // Story cleanup — every hour
  storyCleanup.add(
    'expire-stories',
    {},
    {
      repeat:          { cron: '0 * * * *' },
      removeOnComplete: 10,
      removeOnFail:     10,
    },
  ).catch(() => {});

  console.log('[bullmq] Repeat jobs scheduled: weekly-payouts, expire-stories');
}

export { Worker };
