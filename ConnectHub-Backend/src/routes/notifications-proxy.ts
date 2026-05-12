/**
 * notifications-proxy.ts
 * ConnectHub Backend — OneSignal Push Notification Proxy
 * Route: POST /v1/notifications/send
 *
 * WHY: The OneSignal REST API key must never be exposed in the browser bundle.
 * The frontend calls this backend route; the backend attaches the secret key
 * and forwards the request to OneSignal. The frontend only needs the App ID.
 *
 * Routes:
 *   POST /v1/notifications/send          — send a custom notification
 *   POST /v1/notifications/marketplace   — marketplace convenience wrapper
 */

import { Router, Request, Response, NextFunction } from 'express';
import https from 'https';

const router = Router();

// ─── OneSignal config from environment ──────────────────────────────────────
const ONESIGNAL_APP_ID  = process.env.ONESIGNAL_APP_ID  || '';
const ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY || '';

// ─── Internal helper: call OneSignal REST API v1 ────────────────────────────
function callOneSignal(payload: object): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ app_id: ONESIGNAL_APP_ID, ...payload });
    const options = {
      hostname: 'onesignal.com',
      path: '/api/v1/notifications',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${ONESIGNAL_API_KEY}`,
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode || 200, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode || 200, body: data }); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── Guard: if OneSignal is not configured, return a safe no-op ───────────────
function checkConfig(res: Response): boolean {
  if (!ONESIGNAL_APP_ID || !ONESIGNAL_API_KEY) {
    res.json({ skipped: true, reason: 'OneSignal not configured on this server' });
    return false;
  }
  return true;
}

// ─── POST /v1/notifications/send — generic passthrough ───────────────────────
// Body: { headings, contents, filters?, include_player_ids?, data? }
router.post('/send', async (req: Request, res: Response, next: NextFunction) => {
  if (!checkConfig(res)) return;

  try {
    const { headings, contents, filters, include_player_ids, data = {} } = req.body;
    if (!headings || !contents) {
      return res.status(400).json({ error: 'headings and contents are required' });
    }

    const payload: any = { headings, contents, data };
    if (include_player_ids?.length) payload.include_player_ids = include_player_ids;
    else if (filters?.length) payload.filters = filters;
    else payload.included_segments = ['All'];  // fallback: all subscribers

    const result = await callOneSignal(payload);
    return res.status(result.status).json(result.body);
  } catch (err) {
    next(err);
  }
});

// ─── POST /v1/notifications/marketplace — typed marketplace events ─────────────
// Body: { event, toUserIds[], payload }
//   event: 'new_offer' | 'order_shipped' | 'new_message' | 'order_confirmed' | 'dispute_update'
router.post('/marketplace', async (req: Request, res: Response, next: NextFunction) => {
  if (!checkConfig(res)) return;

  try {
    const { event, toUserIds = [], payload = {} } = req.body;
    if (!event) return res.status(400).json({ error: 'event is required' });

    let headings: object = { en: 'ConnectHub Marketplace' };
    let contents: object = { en: '' };
    let data: object = { event, ...payload };

    switch (event) {
      case 'new_offer':
        headings = { en: '💰 New Offer Received' };
        contents = { en: `${payload.buyerName || 'A buyer'} offered $${payload.amount} for "${payload.itemTitle || 'your item'}"` };
        break;
      case 'order_shipped':
        headings = { en: '📦 Your Order Has Shipped!' };
        contents = { en: `Order #${payload.orderId} is on the way. Tracking: ${payload.trackingCode}` };
        break;
      case 'new_message':
        headings = { en: `💬 New message from ${payload.fromName || 'a buyer'}` };
        contents = { en: payload.preview || 'You have a new marketplace message' };
        break;
      case 'order_confirmed':
        headings = { en: '✅ Payment Confirmed' };
        contents = { en: `Order #${payload.orderId} payment was successful. Get it packed!` };
        break;
      case 'dispute_update':
        headings = { en: '⚠️ Dispute Update' };
        contents = { en: `Your dispute for Order #${payload.orderId} has been ${payload.status}` };
        break;
      default:
        headings = { en: 'ConnectHub Marketplace' };
        contents = { en: payload.message || 'You have a marketplace notification' };
    }

    const notifPayload: any = { headings, contents, data };
    if (toUserIds.length) {
      // Map app user IDs to OneSignal external_id (requires OneSignal External User IDs setup)
      notifPayload.include_external_user_ids = toUserIds;
    } else {
      notifPayload.included_segments = ['All'];
    }

    const result = await callOneSignal(notifPayload);
    return res.status(result.status).json(result.body);
  } catch (err) {
    next(err);
  }
});

export default router;
