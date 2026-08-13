/**
 * mux-service.ts — Sprint 1: Mux video pipeline service
 * Handles stream creation, deletion, webhook verification, and VOD retrieval.
 * Uses TEST keys by default — switch to live keys in production .env only.
 */

import crypto from 'crypto';

// ── Mux credentials (read from .env, never hardcoded) ─────────────
const MUX_TOKEN_ID     = process.env.MUX_TOKEN_ID     || '';
const MUX_TOKEN_SECRET = process.env.MUX_TOKEN_SECRET || '';
const MUX_WEBHOOK_SECRET = process.env.MUX_WEBHOOK_SIGNING_SECRET || '';

// Basic auth header for Mux API
function muxAuthHeader(): string {
  const encoded = Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64');
  return `Basic ${encoded}`;
}

// ── Types ──────────────────────────────────────────────────────────
export interface MuxStream {
  id: string;
  streamKey: string;
  rtmpUrl: string;
  playbackId: string;
  playbackUrl: string;
  status: 'active' | 'idle' | 'disabled';
}

export interface MuxVOD {
  assetId: string;
  playbackId: string;
  vodPlaybackUrl: string;
  durationSeconds: number;
  status: string;
}

// ── Create a new live stream ───────────────────────────────────────
export async function createMuxStream(title: string): Promise<MuxStream> {
  if (!MUX_TOKEN_ID || !MUX_TOKEN_SECRET) {
    throw new Error('Mux credentials not configured. Set MUX_TOKEN_ID and MUX_TOKEN_SECRET in .env');
  }

  const response = await fetch('https://api.mux.com/video/v1/live-streams', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': muxAuthHeader(),
    },
    body: JSON.stringify({
      playback_policy: ['public'],
      new_asset_settings: {
        playback_policy: ['public'],
      },
      reduced_latency: true,
      metadata: { title },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Mux createStream failed: ${response.status} ${err}`);
  }

  const data = await response.json() as any;
  const stream = data.data;
  const playbackId = stream.playback_ids?.[0]?.id || '';

  return {
    id:          stream.id,
    streamKey:   stream.stream_key,
    rtmpUrl:     `rtmps://global-live.mux.com:443/app`,
    playbackId,
    playbackUrl: playbackId ? `https://stream.mux.com/${playbackId}.m3u8` : '',
    status:      stream.status,
  };
}

// ── End (disable) a live stream ────────────────────────────────────
export async function endMuxStream(muxStreamId: string): Promise<void> {
  if (!MUX_TOKEN_ID) return;

  await fetch(`https://api.mux.com/video/v1/live-streams/${muxStreamId}/complete`, {
    method: 'PUT',
    headers: { 'Authorization': muxAuthHeader() },
  });
}

// ── Delete a stream (cleanup) ──────────────────────────────────────
export async function deleteMuxStream(muxStreamId: string): Promise<void> {
  if (!MUX_TOKEN_ID) return;

  await fetch(`https://api.mux.com/video/v1/live-streams/${muxStreamId}`, {
    method: 'DELETE',
    headers: { 'Authorization': muxAuthHeader() },
  });
}

// ── Get VOD asset from a completed stream ──────────────────────────
export async function getMuxVOD(muxStreamId: string): Promise<MuxVOD | null> {
  if (!MUX_TOKEN_ID) return null;

  const response = await fetch(`https://api.mux.com/video/v1/live-streams/${muxStreamId}`, {
    headers: { 'Authorization': muxAuthHeader() },
  });

  if (!response.ok) return null;

  const data = await response.json() as any;
  const recentAssetId = data.data?.recent_asset_ids?.[0];
  if (!recentAssetId) return null;

  // Fetch the asset details
  const assetRes = await fetch(`https://api.mux.com/video/v1/assets/${recentAssetId}`, {
    headers: { 'Authorization': muxAuthHeader() },
  });

  if (!assetRes.ok) return null;
  const assetData = await assetRes.json() as any;
  const asset = assetData.data;
  const playbackId = asset.playback_ids?.[0]?.id || '';

  return {
    assetId:          asset.id,
    playbackId,
    vodPlaybackUrl:   playbackId ? `https://stream.mux.com/${playbackId}.m3u8` : '',
    durationSeconds:  asset.duration || 0,
    status:           asset.status,
  };
}

// ── Verify Mux webhook signature ───────────────────────────────────
export function verifyMuxWebhook(rawBody: string, signatureHeader: string): boolean {
  if (!MUX_WEBHOOK_SECRET) return true; // skip verification if not configured

  try {
    const [timestampPart, signaturePart] = signatureHeader.split(',');
    const timestamp  = timestampPart.split('=')[1];
    const signature  = signaturePart.split('=')[1];
    const payload    = `${timestamp}.${rawBody}`;
    const expected   = crypto.createHmac('sha256', MUX_WEBHOOK_SECRET).update(payload).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}

// ── Check if Mux is configured ─────────────────────────────────────
export function isMuxConfigured(): boolean {
  return Boolean(MUX_TOKEN_ID && MUX_TOKEN_SECRET);
}
