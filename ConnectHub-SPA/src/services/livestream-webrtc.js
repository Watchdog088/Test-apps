// livestream-webrtc.js
// TECH-3: WebRTC track replacement (camera/quality switching mid-stream)
// TECH-5: TURN server configuration for production WebRTC
//         Supports both hardcoded credentials AND dynamic TURN token fetch
// MOB-5: WiFi→cellular reconnect detection via iceConnectionState

// ─────────────────────────────────────────────────────────────────────────────
// TURN server config
// Set VITE_TURN_URL / VITE_TURN_USERNAME / VITE_TURN_CREDENTIAL in .env
// OR call LivestreamWebRTC.fetchTurnCredentials() for dynamic tokens (Metered/Twilio)
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_ICE_SERVERS = [
  // Free STUN servers (Google)
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  // TECH-5: Production TURN servers (reads from env)
  ...(import.meta.env.VITE_TURN_URL ? [{
    urls: import.meta.env.VITE_TURN_URL,
    username: import.meta.env.VITE_TURN_USERNAME || '',
    credential: import.meta.env.VITE_TURN_CREDENTIAL || '',
  }] : []),
];

/**
 * Fetch dynamic TURN credentials from Metered.ca or Twilio
 * Call this before creating a peer connection in production.
 * Returns an array of RTCIceServer objects.
 */
async function fetchTurnCredentials() {
  // Option A: Metered.ca TURN REST API
  const meteredKey = import.meta.env.VITE_METERED_API_KEY;
  if (meteredKey) {
    try {
      const res = await fetch(
        `https://lynkapp.metered.live/api/v1/turn/credentials?apiKey=${meteredKey}`
      );
      if (res.ok) {
        const servers = await res.json();
        return servers; // Array of { urls, username, credential }
      }
    } catch (e) {
      console.warn('[TURN] Metered fetch failed, falling back to defaults:', e);
    }
  }
  // Option B: Twilio TURN (requires backend proxy to protect AccountSID)
  // const res = await fetch('/api/turn-credentials');
  // if (res.ok) return res.json();

  return DEFAULT_ICE_SERVERS;
}

// ─────────────────────────────────────────────────────────────────────────────
// LivestreamWebRTC class
// ─────────────────────────────────────────────────────────────────────────────

class LivestreamWebRTC {
  constructor() {
    this.pc            = null;  // RTCPeerConnection
    this.localStream   = null;  // MediaStream from camera/mic
    this.senders       = {};    // { video: RTCSender, audio: RTCSender }
    this.iceServers    = DEFAULT_ICE_SERVERS;
    this.onDisconnected = null; // callback
    this.reconnectTimer = null;
    this.maxReconnects  = 3;
    this.reconnectCount = 0;
    this.streamId       = null;
    this.signalingFns   = null; // { onOffer, onAnswer, onIceCandidate }
  }

  // ── Initialise with dynamic TURN credentials ──
  async init(streamId, signalingFns) {
    this.streamId    = streamId;
    this.signalingFns = signalingFns;
    this.iceServers  = await fetchTurnCredentials();
    console.log('[WebRTC] ICE servers loaded:', this.iceServers.length);
  }

  // ── Create a new RTCPeerConnection with TURN ──
  _createPC() {
    if (this.pc) {
      this.pc.close();
    }
    this.pc = new RTCPeerConnection({ iceServers: this.iceServers });

    // MOB-5: Detect WiFi→cellular switch & trigger reconnect
    this.pc.oniceconnectionstatechange = () => {
      const state = this.pc.iceConnectionState;
      console.log('[WebRTC] ICE state:', state);
      if (state === 'disconnected' || state === 'failed') {
        this._scheduleReconnect();
      } else if (state === 'connected' || state === 'completed') {
        this.reconnectCount = 0;
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      }
    };

    this.pc.onconnectionstatechange = () => {
      console.log('[WebRTC] Connection state:', this.pc.connectionState);
      if (this.pc.connectionState === 'failed') {
        this._scheduleReconnect();
      }
    };

    return this.pc;
  }

  // ── Add local tracks to peer connection ──
  _addTracks() {
    if (!this.localStream || !this.pc) return;
    this.localStream.getTracks().forEach(track => {
      const sender = this.pc.addTrack(track, this.localStream);
      this.senders[track.kind] = sender;
    });
  }

  // ── Start streaming (streamer side) ──
  async startStream(localStream) {
    this.localStream = localStream;
    this._createPC();
    this._addTracks();

    // Create offer
    const offer = await this.pc.createOffer({ offerToReceiveVideo: false });
    await this.pc.setLocalDescription(offer);

    if (this.signalingFns?.onOffer) {
      this.signalingFns.onOffer(offer);
    }
    return offer;
  }

  // ── Join stream (viewer side) ──
  async joinStream(remoteOffer) {
    this._createPC();

    this.pc.ontrack = (event) => {
      if (this.signalingFns?.onRemoteTrack) {
        this.signalingFns.onRemoteTrack(event.streams[0]);
      }
    };

    await this.pc.setRemoteDescription(new RTCSessionDescription(remoteOffer));
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);

    if (this.signalingFns?.onAnswer) {
      this.signalingFns.onAnswer(answer);
    }
    return answer;
  }

  // ── Handle remote answer (streamer receives viewer's answer) ──
  async handleAnswer(answer) {
    if (!this.pc) return;
    await this.pc.setRemoteDescription(new RTCSessionDescription(answer));
  }

  // ── Add ICE candidate from signaling ──
  async addIceCandidate(candidate) {
    if (!this.pc || !candidate) return;
    try {
      await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (e) {
      console.warn('[WebRTC] Failed to add ICE candidate:', e);
    }
  }

  // ── TECH-3: Replace video track mid-stream (camera flip / quality change) ──
  async replaceVideoTrack(newTrack) {
    const sender = this.senders['video'];
    if (!sender) {
      console.warn('[WebRTC] No video sender to replace');
      return;
    }
    try {
      await sender.replaceTrack(newTrack);
      // Also update local stream's video track reference
      const oldTrack = this.localStream?.getVideoTracks()[0];
      if (oldTrack && this.localStream) {
        this.localStream.removeTrack(oldTrack);
        oldTrack.stop();
      }
      if (this.localStream) {
        this.localStream.addTrack(newTrack);
      }
      console.log('[WebRTC] Video track replaced:', newTrack.label);
    } catch (e) {
      console.error('[WebRTC] replaceTrack failed:', e);
      throw e;
    }
  }

  // ── TECH-3: Replace audio track mid-stream ──
  async replaceAudioTrack(newTrack) {
    const sender = this.senders['audio'];
    if (!sender) return;
    try {
      await sender.replaceTrack(newTrack);
      const oldTrack = this.localStream?.getAudioTracks()[0];
      if (oldTrack && this.localStream) {
        this.localStream.removeTrack(oldTrack);
        oldTrack.stop();
      }
      if (this.localStream) {
        this.localStream.addTrack(newTrack);
      }
    } catch (e) {
      console.error('[WebRTC] audio replaceTrack failed:', e);
    }
  }

  // ── MOB-5: Schedule reconnect on disconnect ──
  _scheduleReconnect() {
    if (this.reconnectTimer) return; // Already scheduled
    if (this.reconnectCount >= this.maxReconnects) {
      console.warn('[WebRTC] Max reconnect attempts reached');
      if (this.onDisconnected) this.onDisconnected('max_reconnects');
      return;
    }
    const delay = Math.min(1000 * Math.pow(2, this.reconnectCount), 8000);
    console.log(`[WebRTC] Reconnecting in ${delay}ms (attempt ${this.reconnectCount + 1})`);
    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null;
      this.reconnectCount++;
      try {
        await this._reconnect();
      } catch (e) {
        console.error('[WebRTC] Reconnect failed:', e);
        this._scheduleReconnect();
      }
    }, delay);
  }

  async _reconnect() {
    console.log('[WebRTC] Attempting reconnect…');
    if (!this.localStream || !this.pc) return;

    // Restart ICE (works for soft disconnects)
    if (this.pc.restartIce) {
      this.pc.restartIce();
      const offer = await this.pc.createOffer({ iceRestart: true });
      await this.pc.setLocalDescription(offer);
      if (this.signalingFns?.onOffer) {
        this.signalingFns.onOffer(offer);
      }
    } else {
      // Full reconnect: new PC
      await this.startStream(this.localStream);
    }
  }

  // ── Get connection stats (for quality monitoring) ──
  async getStats() {
    if (!this.pc) return null;
    try {
      const stats = await this.pc.getStats();
      const result = { video: null, audio: null, rtt: null };
      stats.forEach(report => {
        if (report.type === 'outbound-rtp' && report.mediaType === 'video') {
          result.video = {
            bytesSent: report.bytesSent,
            packetsSent: report.packetsSent,
            framesEncoded: report.framesEncoded,
            framesSent: report.framesSent,
          };
        }
        if (report.type === 'outbound-rtp' && report.mediaType === 'audio') {
          result.audio = { bytesSent: report.bytesSent, packetsSent: report.packetsSent };
        }
        if (report.type === 'remote-inbound-rtp') {
          result.rtt = report.roundTripTime;
        }
      });
      return result;
    } catch { return null; }
  }

  // ── Cleanup ──
  destroy() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach(t => t.stop());
      this.localStream = null;
    }
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
    this.senders = {};
    this.reconnectCount = 0;
    console.log('[WebRTC] Destroyed');
  }
}

// Singleton instance
const livestreamWebRTC = new LivestreamWebRTC();

export default livestreamWebRTC;
// LivestreamPublisher is an alias for LivestreamWebRTC (used by LiveSetupPage)
export { LivestreamWebRTC, LivestreamWebRTC as LivestreamPublisher, fetchTurnCredentials, DEFAULT_ICE_SERVERS };
