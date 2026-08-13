/**
 * whip-publisher.js — Sprint 1: WHIP (WebRTC-HTTP Ingestion Protocol) publisher
 * Handles browser-native WebRTC → Mux WHIP endpoint for sub-second latency.
 * This is a NEW file — nothing imports it yet; zero risk to existing code.
 *
 * Usage:
 *   import { WHIPPublisher } from '@/services/whip-publisher';
 *   const pub = new WHIPPublisher(whipEndpoint, bearerToken);
 *   await pub.start(localStream);
 *   await pub.stop();
 */

export class WHIPPublisher {
  /**
   * @param {string} whipUrl    - WHIP endpoint URL from Mux
   * @param {string} bearerToken - Mux stream key (used as bearer token for WHIP)
   */
  constructor(whipUrl, bearerToken) {
    this.whipUrl     = whipUrl;
    this.bearerToken = bearerToken;
    this.pc          = null;   // RTCPeerConnection
    this.resourceUrl = null;   // Location header from WHIP response (for teardown)
  }

  /**
   * Start publishing a MediaStream via WHIP.
   * @param {MediaStream} localStream
   */
  async start(localStream) {
    if (!localStream) throw new Error('[WHIP] No local stream provided');

    this.pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      bundlePolicy: 'max-bundle',
    });

    // Add all tracks from the local stream
    localStream.getTracks().forEach(track => {
      this.pc.addTrack(track, localStream);
    });

    // Create offer
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);

    // Wait for ICE gathering to complete (or timeout after 3s)
    await this._waitForICE();

    // Send offer to WHIP endpoint
    const response = await fetch(this.whipUrl, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/sdp',
        'Authorization': `Bearer ${this.bearerToken}`,
      },
      body: this.pc.localDescription.sdp,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`[WHIP] Server rejected offer: ${response.status} ${errorText}`);
    }

    // Save resource URL for DELETE on teardown
    this.resourceUrl = response.headers.get('Location');

    // Apply the server's SDP answer
    const answerSdp = await response.text();
    await this.pc.setRemoteDescription({ type: 'answer', sdp: answerSdp });

    console.log('[WHIP] Publishing started');
    return true;
  }

  /**
   * Stop publishing and release the WHIP resource.
   */
  async stop() {
    try {
      if (this.resourceUrl) {
        await fetch(this.resourceUrl, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${this.bearerToken}` },
        }).catch(() => {}); // best-effort
        this.resourceUrl = null;
      }
    } finally {
      if (this.pc) {
        this.pc.close();
        this.pc = null;
      }
    }
    console.log('[WHIP] Publishing stopped');
  }

  /**
   * Wait for ICE gathering to finish or timeout after 3 seconds.
   * @private
   */
  _waitForICE() {
    return new Promise((resolve) => {
      if (this.pc.iceGatheringState === 'complete') {
        resolve();
        return;
      }

      const timeout = setTimeout(() => {
        resolve(); // Proceed even if not fully gathered
      }, 3000);

      this.pc.addEventListener('icegatheringstatechange', () => {
        if (this.pc.iceGatheringState === 'complete') {
          clearTimeout(timeout);
          resolve();
        }
      });
    });
  }

  /**
   * Get connection stats (bitrate, packet loss) for quality monitoring.
   */
  async getStats() {
    if (!this.pc) return null;
    try {
      const stats  = await this.pc.getStats();
      const result = { videoBitrate: 0, audioBitrate: 0, packetsLost: 0, rtt: null };
      stats.forEach(report => {
        if (report.type === 'outbound-rtp' && report.mediaType === 'video') {
          result.videoBitrate = Math.round((report.bytesSent * 8) / 1000);
        }
        if (report.type === 'outbound-rtp' && report.mediaType === 'audio') {
          result.audioBitrate = Math.round((report.bytesSent * 8) / 1000);
        }
        if (report.type === 'remote-inbound-rtp') {
          result.packetsLost = report.packetsLost || 0;
          result.rtt         = report.roundTripTime;
        }
      });
      return result;
    } catch {
      return null;
    }
  }
}

export default WHIPPublisher;
