/**
 * streaming.ts — Sprint 1: Streaming routes
 * Endpoints for creating/ending Mux live streams and handling webhooks.
 * All routes prefixed with /api/v1/streaming (registered in server.ts)
 */

import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  createMuxStream,
  endMuxStream,
  deleteMuxStream,
  getMuxVOD,
  verifyMuxWebhook,
  isMuxConfigured,
} from '../services/mux-service';

const router = Router();

// ── POST /api/v1/streaming/create ─────────────────────────────────
// Creates a new Mux live stream and returns the stream key + playback URL.
// Only the authenticated user who called this endpoint should see the streamKey.
router.post('/create', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!isMuxConfigured()) {
      return res.status(503).json({
        error: 'Mux not configured',
        message: 'Set MUX_TOKEN_ID and MUX_TOKEN_SECRET in the backend .env file.',
      });
    }

    const { title, category, tags, privacy } = req.body;
    if (!title?.trim()) {
      return res.status(400).json({ error: 'title is required' });
    }

    const stream = await createMuxStream(title.trim());

    return res.status(201).json({
      muxStreamId:  stream.id,
      streamKey:    stream.streamKey,           // SENSITIVE — only sent to creator
      rtmpUrl:      stream.rtmpUrl,
      playbackId:   stream.playbackId,
      playbackUrl:  stream.playbackUrl,
      status:       stream.status,
    });
  } catch (err: any) {
    console.error('[streaming/create]', err.message);
    return res.status(500).json({ error: 'Failed to create stream', detail: err.message });
  }
});

// ── PUT /api/v1/streaming/:muxStreamId/end ────────────────────────
// Signals Mux to complete/end the stream.
router.put('/:muxStreamId/end', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { muxStreamId } = req.params;
    await endMuxStream(muxStreamId);
    return res.json({ success: true, message: 'Stream ended' });
  } catch (err: any) {
    console.error('[streaming/end]', err.message);
    return res.status(500).json({ error: 'Failed to end stream', detail: err.message });
  }
});

// ── DELETE /api/v1/streaming/:muxStreamId ─────────────────────────
// Deletes a Mux stream resource (cleanup after stream ends).
router.delete('/:muxStreamId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { muxStreamId } = req.params;
    await deleteMuxStream(muxStreamId);
    return res.json({ success: true });
  } catch (err: any) {
    console.error('[streaming/delete]', err.message);
    return res.status(500).json({ error: 'Failed to delete stream', detail: err.message });
  }
});

// ── GET /api/v1/streaming/:muxStreamId/vod ───────────────────────
// Retrieves the VOD (replay) URL after a stream has ended.
router.get('/:muxStreamId/vod', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { muxStreamId } = req.params;
    const vod = await getMuxVOD(muxStreamId);
    if (!vod) {
      return res.status(404).json({ error: 'VOD not available yet' });
    }
    return res.json(vod);
  } catch (err: any) {
    console.error('[streaming/vod]', err.message);
    return res.status(500).json({ error: 'Failed to retrieve VOD', detail: err.message });
  }
});

// ── POST /api/v1/streaming/webhook/mux ───────────────────────────
// Receives Mux webhook events (stream.active, stream.idle, video.asset.ready, etc.)
// This endpoint must be publicly accessible (no authMiddleware).
router.post('/webhook/mux', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['mux-signature'] as string || '';
    const rawBody   = JSON.stringify(req.body);

    if (!verifyMuxWebhook(rawBody, signature)) {
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    const event = req.body;
    console.log(`[mux-webhook] Event: ${event.type} | Stream: ${event.data?.id}`);

    // Handle specific event types
    switch (event.type) {
      case 'video.live_stream.active':
        // Stream went live — frontend should already have the playbackUrl
        // Additional server-side logic can be added here (e.g., update DB)
        break;

      case 'video.live_stream.idle':
        // Stream went offline
        break;

      case 'video.asset.ready':
        // VOD is ready — could update Firestore via Admin SDK here
        console.log(`[mux-webhook] VOD ready: assetId=${event.data?.id}`);
        break;

      default:
        // Ignore unhandled events
        break;
    }

    return res.json({ received: true });
  } catch (err: any) {
    console.error('[streaming/webhook]', err.message);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// ── GET /api/v1/streaming/status ─────────────────────────────────
// Health check — confirms Mux is configured.
router.get('/status', (req: Request, res: Response) => {
  return res.json({
    muxConfigured: isMuxConfigured(),
    environment:   process.env.NODE_ENV || 'development',
    testMode:      (process.env.MUX_TOKEN_ID || '').startsWith('test_'),
  });
});

export default router;
