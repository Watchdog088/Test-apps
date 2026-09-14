/**
 * push-worker.ts — BullMQ worker that processes the "push" queue
 * LynkApp / ConnectHub Backend
 * Created: Sep 14, 2026
 *
 * Job payload (from enqueuePush):
 *   { userId: string, title: string, body: string, data?: Record<string,any> }
 *
 * Sends via OneSignal REST API.
 * Required .env: ONESIGNAL_APP_ID, ONESIGNAL_REST_API_KEY
 */

import https from 'https';

let Worker: any;
let started = false;

try {
  Worker = require('bullmq').Worker;
} catch {
  console.warn('[push-worker] BullMQ not installed — push worker will not start');
}

const ONESIGNAL_APP_ID      = process.env.ONESIGNAL_APP_ID      || '';
const ONESIGNAL_API_KEY     = process.env.ONESIGNAL_REST_API_KEY || '';
const IS_CONFIGURED         = Boolean(ONESIGNAL_APP_ID && ONESIGNAL_API_KEY);

async function sendPush(userId: string, title: string, body: string, data?: Record<string, any>): Promise<void> {
  if (!IS_CONFIGURED) {
    console.log(`[push-worker] [DEV MODE] Push → userId:${userId} | ${title}: ${body}`);
    return;
  }

  const payload = JSON.stringify({
    app_id:            ONESIGNAL_APP_ID,
    headings:          { en: title },
    contents:          { en: body },
    filters:           [{ field: 'tag', key: 'userId', relation: '=', value: userId }],
    data:              data || {},
    ios_badgeType:     'Increase',
    ios_badgeCount:    1,
    android_channel_id: process.env.ONESIGNAL_ANDROID_CHANNEL || undefined,
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'onesignal.com',
        path:     '/api/v1/notifications',
        method:   'POST',
        headers:  {
          'Content-Type':  'application/json',
          'Authorization': `Basic ${ONESIGNAL_API_KEY}`,
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let buf = '';
        res.on('data', (c) => (buf += c));
        res.on('end', () => {
          const parsed = JSON.parse(buf);
          if (parsed.errors) {
            console.error('[push-worker] OneSignal error:', parsed.errors);
          } else {
            console.log(`[push-worker] ✓ Push sent id:${parsed.id} recipients:${parsed.recipients}`);
          }
          resolve();
        });
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

export function startPushWorker(): void {
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
    'push',
    async (job: any) => {
      const { userId, title, body, data } = job.data;
      await sendPush(userId, title, body, data);
    },
    { ...redisOpts, concurrency: 10 }
  );

  worker.on('completed', (job: any) => console.log(`[push-worker] ✓ Job ${job.id} done`));
  worker.on('failed',    (job: any, err: Error) => console.error(`[push-worker] ✗ Job ${job?.id} failed:`, err.message));

  console.log('[push-worker] ✓ Started — listening on "push" queue');
}
