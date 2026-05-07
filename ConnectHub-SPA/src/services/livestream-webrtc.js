// src/services/livestream-webrtc.js
// LIVE-BUG-04 — Real WebRTC video player connection for live streams
// IMPROVE-LIVE-05 — Stream health indicator via RTCPeerConnection.getStats()
//
// Architecture:
//   Streamer  → [Browser getUserMedia] → [RTCPeerConnection] → [Signaling Server (WebSocket)] → [SFU/Media Server]
//   Viewer    ← [RTCPeerConnection]    ← [Signaling Server]  ← [SFU/Media Server]
//
// Signaling server URL is set via VITE_SIGNALING_SERVER_URL in .env
// Compatible with: LiveKit, mediasoup, Janus, OpenVidu, Ion-SFU

const SIGNALING_URL = import.meta.env.VITE_SIGNALING_SERVER_URL || 'wss://signal.lynkapp.com';

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  // Add TURN servers for production:
  // { urls: 'turn:turn.lynkapp.com:3478', username: 'lynk', credential: 'lynkpass' }
];

// ════════════════════════════════════════════════════════════════════════════
// LivestreamPublisher — used by LiveSetupPage (streamer side)
// ════════════════════════════════════════════════════════════════════════════
export class LivestreamPublisher {
  constructor({ streamId, onConnected, onDisconnected, onError, onHealthUpdate }) {
    this.streamId      = streamId;
    this.onConnected   = onConnected   || (() => {});
    this.onDisconnected= onDisconnected|| (() => {});
    this.onError       = onError       || (() => {});
    this.onHealthUpdate= onHealthUpdate|| (() => {});

    this.pc         = null;
    this.ws         = null;
    this.stream     = null;
    this.healthTimer = null;
  }

  // Connect camera + mic stream to WebRTC and start signaling
  async publish(mediaStream) {
    this.stream = mediaStream;

    try {
      // 1. Create RTCPeerConnection
      this.pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

      // Add all tracks from the camera+mic stream
      mediaStream.getTracks().forEach(track => {
        this.pc.addTrack(track, mediaStream);
      });

      // 2. Connect to signaling server
      this.ws = new WebSocket(`${SIGNALING_URL}/publish/${this.streamId}`);
      this.ws.onopen    = () => this._onWsOpen();
      this.ws.onmessage = (e) => this._onWsMessage(JSON.parse(e.data));
      this.ws.onerror   = (e) => this.onError(new Error('Signaling WebSocket error'));
      this.ws.onclose   = () => this.onDisconnected();

      // 3. ICE candidate handler
      this.pc.onicecandidate = ({ candidate }) => {
        if (candidate && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ type: 'ice', candidate }));
        }
      };

      this.pc.onconnectionstatechange = () => {
        if (this.pc.connectionState === 'connected') {
          this.onConnected();
          this._startHealthMonitor();
        }
        if (['disconnected', 'failed', 'closed'].includes(this.pc.connectionState)) {
          this.onDisconnected();
          this._stopHealthMonitor();
        }
      };
    } catch (err) {
      this.onError(err);
    }
  }

  async _onWsOpen() {
    // Create SDP offer and send to signaling server
    const offer = await this.pc.createOffer({
      offerToReceiveVideo: false,
      offerToReceiveAudio: false,
    });
    await this.pc.setLocalDescription(offer);
    this.ws.send(JSON.stringify({ type: 'offer', sdp: offer }));
  }

  async _onWsMessage(msg) {
    if (msg.type === 'answer') {
      await this.pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
    }
    if (msg.type === 'ice') {
      try { await this.pc.addIceCandidate(new RTCIceCandidate(msg.candidate)); } catch {}
    }
  }

  // IMPROVE-LIVE-05 — Stream health via RTCPeerConnection.getStats()
  _startHealthMonitor() {
    this.healthTimer = setInterval(async () => {
      if (!this.pc) return;
      try {
        const stats = await this.pc.getStats();
        let bitrate = 0, frameRate = 0, packetsLost = 0, rtt = 0;

        stats.forEach(report => {
          if (report.type === 'outbound-rtp' && report.mediaType === 'video') {
            bitrate   = Math.round((report.bytesSent || 0) * 8 / 1000); // kbps rough
            frameRate = report.framesPerSecond || 0;
          }
          if (report.type === 'remote-inbound-rtp') {
            packetsLost = report.packetsLost   || 0;
            rtt         = (report.roundTripTime || 0) * 1000; // ms
          }
        });

        // Determine signal quality
        let quality = 'excellent';
        if (rtt > 300 || packetsLost > 20 || frameRate < 15) quality = 'poor';
        else if (rtt > 150 || packetsLost > 5  || frameRate < 25) quality = 'fair';

        this.onHealthUpdate({ bitrate, frameRate, packetsLost, rtt: Math.round(rtt), quality });
      } catch {}
    }, 3000);
  }

  _stopHealthMonitor() {
    if (this.healthTimer) { clearInterval(this.healthTimer); this.healthTimer = null; }
  }

  stop() {
    this._stopHealthMonitor();
    if (this.ws)  { this.ws.close();  this.ws  = null; }
    if (this.pc)  { this.pc.close();  this.pc  = null; }
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
  }
}

// ════════════════════════════════════════════════════════════════════════════
// LivestreamViewer — used by LiveWatchPage (viewer side)
// ════════════════════════════════════════════════════════════════════════════
export class LivestreamViewer {
  constructor({ streamId, videoElement, onConnected, onDisconnected, onError }) {
    this.streamId      = streamId;
    this.videoEl       = videoElement;
    this.onConnected   = onConnected   || (() => {});
    this.onDisconnected= onDisconnected|| (() => {});
    this.onError       = onError       || (() => {});

    this.pc = null;
    this.ws = null;
  }

  async connect() {
    try {
      this.pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

      // When we receive a remote track, attach it to the video element
      this.pc.ontrack = (event) => {
        if (this.videoEl && event.streams?.[0]) {
          this.videoEl.srcObject = event.streams[0];
          this.videoEl.play().catch(() => {});
        }
      };

      this.pc.onconnectionstatechange = () => {
        if (this.pc.connectionState === 'connected') this.onConnected();
        if (['disconnected','failed','closed'].includes(this.pc.connectionState)) {
          this.onDisconnected();
        }
      };

      this.ws = new WebSocket(`${SIGNALING_URL}/view/${this.streamId}`);
      this.ws.onopen    = () => this._onWsOpen();
      this.ws.onmessage = (e) => this._onWsMessage(JSON.parse(e.data));
      this.ws.onerror   = () => this.onError(new Error('Signaling connection failed'));
      this.ws.onclose   = () => this.onDisconnected();

      this.pc.onicecandidate = ({ candidate }) => {
        if (candidate && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ type: 'ice', candidate }));
        }
      };
    } catch (err) {
      this.onError(err);
    }
  }

  async _onWsOpen() {
    // Send a "subscribe" message — server responds with an SDP offer
    this.ws.send(JSON.stringify({ type: 'subscribe' }));
  }

  async _onWsMessage(msg) {
    if (msg.type === 'offer') {
      await this.pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
      const answer = await this.pc.createAnswer();
      await this.pc.setLocalDescription(answer);
      this.ws.send(JSON.stringify({ type: 'answer', sdp: answer }));
    }
    if (msg.type === 'ice') {
      try { await this.pc.addIceCandidate(new RTCIceCandidate(msg.candidate)); } catch {}
    }
    if (msg.type === 'stream_ended') {
      this.onDisconnected();
    }
  }

  disconnect() {
    if (this.ws) { this.ws.close(); this.ws = null; }
    if (this.pc) { this.pc.close(); this.pc = null; }
    if (this.videoEl) { this.videoEl.srcObject = null; }
  }
}

// ════════════════════════════════════════════════════════════════════════════
// HLS Viewer fallback — for browsers without WebRTC or when using AWS IVS/Mux
// ════════════════════════════════════════════════════════════════════════════
export function attachHlsPlayer(videoElement, hlsUrl) {
  // Uses native HLS on Safari; hls.js on Chrome/Firefox
  if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
    videoElement.src = hlsUrl;
    videoElement.play().catch(() => {});
    return null;
  }

  // Dynamic import of hls.js (install: npm install hls.js)
  return import('hls.js').then(({ default: Hls }) => {
    if (!Hls.isSupported()) return;
    const hls = new Hls({ lowLatencyMode: true, backBufferLength: 90 });
    hls.loadSource(hlsUrl);
    hls.attachMedia(videoElement);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      videoElement.play().catch(() => {});
    });
    return hls;
  }).catch(() => null);
}

// ════════════════════════════════════════════════════════════════════════════
// IMPROVE-LIVE-04 — Co-host signaling helpers
// Co-host joins the same RTCPeerConnection room as a second publisher
// ════════════════════════════════════════════════════════════════════════════
export async function inviteCoHost({ streamId, coHostUserId }) {
  // Write an invite to Firestore — the co-host's app picks it up
  const { db }        = await import('@firebase/config');
  const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');

  await setDoc(doc(db, 'streams', streamId, 'cohosts', coHostUserId), {
    status:      'invited',
    invitedAt:   serverTimestamp(),
    streamId,
    coHostUserId,
  });
}

export async function acceptCoHostInvite({ streamId, userId, mediaStream }) {
  // Co-host publishes their own stream into the SFU room
  const publisher = new LivestreamPublisher({
    streamId: `${streamId}_cohost_${userId}`,
    onConnected:    () => console.log('[CoHost] Connected'),
    onDisconnected: () => console.log('[CoHost] Disconnected'),
    onError:        (e) => console.error('[CoHost]', e),
    onHealthUpdate: () => {},
  });
  await publisher.publish(mediaStream);
  return publisher;
}
