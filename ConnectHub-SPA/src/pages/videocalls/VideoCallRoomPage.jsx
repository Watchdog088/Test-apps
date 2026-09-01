// src/pages/videocalls/VideoCallRoomPage.jsx
// SECTION 3 FIX (Sep 2026): Real P2P WebRTC requires a STUN/TURN + signaling server.
// The previous version faked a "connected" remote video after 2 seconds — shipping
// a broken feature to the App Store causes rejections and 1-star reviews.
// Gated with ComingSoonGate until a real WebRTC signaling server (Agora / Daily.co /
// self-hosted Coturn + Socket.io) is deployed.
// When the signaling server is ready: remove this file and restore VideoCallRoomPage.real.jsx

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ComingSoonGate from '@components/common/ComingSoonGate';

const WEBRTC_FEATURES = [
  { icon: '📹', label: 'HD Video Calls' },
  { icon: '🎤', label: 'Crystal Clear Audio' },
  { icon: '🖥️', label: 'Screen Sharing' },
  { icon: '💬', label: 'In-Call Chat' },
  { icon: '🔄', label: 'Camera Flip' },
  { icon: '🔒', label: 'End-to-End Encrypted' },
];

export default function VideoCallRoomPage() {
  const navigate = useNavigate();
  const { roomId } = useParams();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0818 0%, #0f0a28 100%)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Back button */}
      <div style={{ padding: '16px 16px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 12,
            color: '#94a3b8',
            fontSize: 14,
            fontWeight: 600,
            padding: '8px 16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          ← Back
        </button>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9' }}>Video Call</div>
          {roomId && (
            <div style={{ fontSize: 11, color: '#475569' }}>Room: {roomId}</div>
          )}
        </div>
      </div>

      {/* Coming Soon Gate */}
      <ComingSoonGate
        feature="Video Calls (P2P)"
        eta="Q1 2027"
        description="Real-time peer-to-peer video calls require a WebRTC signaling server. LynkApp Video Calls are coming — HD video, screen sharing, in-call chat, and end-to-end encryption."
        preview={WEBRTC_FEATURES}
        fullPage
      />

      {/* Feature preview cards */}
      <div style={{ padding: '0 16px 32px' }}>
        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '0.10em',
          textTransform: 'uppercase', color: '#475569',
          marginBottom: 12,
        }}>
          PLANNED FEATURES
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 10,
        }}>
          {WEBRTC_FEATURES.map((f, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14,
              padding: '14px 12px',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 22 }}>{f.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>{f.label}</span>
            </div>
          ))}
        </div>

        {/* Alternative suggestion */}
        <div style={{
          marginTop: 20,
          background: 'rgba(99,102,241,0.08)',
          border: '1px solid rgba(99,102,241,0.20)',
          borderRadius: 16,
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
        }}>
          <span style={{ fontSize: 22, flexShrink: 0 }}>💡</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#a5b4fc', marginBottom: 4 }}>
              In the meantime
            </div>
            <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
              Use the Messages section to start a conversation. Group video calls via third-party 
              meeting links (Zoom, Google Meet) can be shared in any chat.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
