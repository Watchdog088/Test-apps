// src/components/common/OfflineOverlay.jsx
// MISSING #5 — Network Offline / Connection Error UI
// Full-screen overlay shown when device is offline, with retry + cached-content indicator

import React, { useState, useEffect, useCallback } from 'react';

export default function OfflineOverlay() {
  const [isOffline, setIsOffline]         = useState(!navigator.onLine);
  const [wasOffline, setWasOffline]       = useState(false);
  const [showRestored, setShowRestored]   = useState(false);
  const [retrying, setRetrying]           = useState(false);
  const [lastOnline, setLastOnline]       = useState(null);

  useEffect(() => {
    const onOnline = () => {
      setIsOffline(false);
      if (wasOffline) {
        setShowRestored(true);
        setTimeout(() => setShowRestored(false), 4000);
      }
      setWasOffline(false);
    };
    const onOffline = () => {
      setIsOffline(true);
      setWasOffline(true);
      setLastOnline(new Date());
    };
    window.addEventListener('online',  onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online',  onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [wasOffline]);

  const handleRetry = useCallback(async () => {
    setRetrying(true);
    try {
      const res = await fetch('https://www.google.com/favicon.ico', { mode: 'no-cors', cache: 'no-store' });
      if (res) { setIsOffline(false); setRetrying(false); return; }
    } catch {}
    await new Promise(r => setTimeout(r, 1500));
    setRetrying(false);
  }, []);

  const formatLastOnline = (d) => {
    if (!d) return 'recently';
    const mins = Math.round((Date.now() - d.getTime()) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} min ago`;
    return `${Math.round(mins / 60)} hr ago`;
  };

  // ── "Connection Restored" toast ──────────────────────────────────────────────
  if (showRestored) {
    return (
      <div style={{
        position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(22,163,74,0.95)', backdropFilter: 'blur(12px)',
        color: 'white', fontWeight: 700, fontSize: 14,
        padding: '12px 24px', borderRadius: 24, zIndex: 9995,
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', gap: 8,
        animation: 'slideUp 0.3s ease',
        whiteSpace: 'nowrap',
      }}>
        ✅ Connection restored!
      </div>
    );
  }

  // ── Full offline overlay ──────────────────────────────────────────────────────
  if (!isOffline) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9994,
      background: 'rgba(10,8,28,0.97)',
      backdropFilter: 'blur(20px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px 24px',
      animation: 'fadeIn 0.25s ease',
    }}>
      {/* Icon */}
      <div style={{
        width: 80, height: 80, borderRadius: '50%',
        background: 'rgba(239,68,68,0.15)',
        border: '2px solid rgba(239,68,68,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 36, marginBottom: 24,
      }}>
        📡
      </div>

      <h2 style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', marginBottom: 8, textAlign: 'center' }}>
        You're Offline
      </h2>
      <p style={{ fontSize: 15, color: '#94a3b8', textAlign: 'center', lineHeight: 1.6, marginBottom: 24, maxWidth: 300 }}>
        Check your Wi-Fi or mobile data connection and try again.
      </p>

      {/* Cached content indicator */}
      {lastOnline && (
        <div style={{
          background: 'rgba(99,102,241,0.12)',
          border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: 12, padding: '10px 16px', marginBottom: 24,
          fontSize: 13, color: '#818cf8', textAlign: 'center',
        }}>
          📦 Showing cached content from {formatLastOnline(lastOnline)}
        </div>
      )}

      {/* Retry button */}
      <button
        onClick={handleRetry}
        disabled={retrying}
        style={{
          padding: '13px 32px', borderRadius: 14,
          background: retrying ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg,#6366f1,#ec4899)',
          border: 'none', color: 'white', fontWeight: 700, fontSize: 15,
          cursor: retrying ? 'not-allowed' : 'pointer',
          minWidth: 160, marginBottom: 16,
          transition: 'all 0.2s',
        }}
      >
        {retrying ? '⏳ Retrying...' : '🔄 Try Again'}
      </button>

      <p style={{ fontSize: 12, color: '#475569', textAlign: 'center' }}>
        Some content may still be available from cache
      </p>
    </div>
  );
}
